<template>
  <div id="dwv">
    <v-progress-linear
      :model-value="loadProgress"
      color="primary"
    />

    <!-- toolbar -->
    <v-container>
      <!-- action buttons -->
      <v-btn-toggle
        v-model="selectedToolIndex"
        mandatory
        color="primary"
        divided
      >
        <v-btn
          v-for="tool in toolNames"
          :id="tool"
          :key="tool"
          :title="tool"
          :disabled="!dataLoaded || !canRunTool(tool)"
          :icon="getToolIcon(tool)"
          @click="onChangeTool(tool)"
        />
      </v-btn-toggle>

      <v-btn
        class="rounded-lg"
        title="Reset"
        :disabled="!dataLoaded"
        icon="refresh"
        @click="onReset()"
      />

      <v-btn
        class="rounded-lg"
        title="Toggle Orientation"
        :disabled="!dataLoaded"
        icon="cameraswitch"
        @click="toggleOrientation()"
      />

      <!-- dicom tags dialog-->
      <v-dialog
        max-width="800px"
        scrollable
      >
        <template #activator="{ props: activatorProps }">
          <v-btn
            class="rounded-lg"
            title="Tags"
            :disabled="!dataLoaded"
            icon="library_books"
            v-bind="activatorProps"
            @click="showDicomTags = true"
          />
        </template>
        <template #default>
          <TagsTable
            :tags-data="metaData"
          />
        </template>
      </v-dialog>
    </v-container>

    <!-- dwv layer group -->
    <div
      id="layerGroup0"
      class="layerGroup"
    >
      <div id="dropBox" />
    </div>

    <!-- legend -->
    <div class="legend">
      <p>
        Powered by
        <a
          href="https://github.com/ivmartel/dwv"
          title="dwv on github"
        >dwv</a>
        {{ versions.dwv }} and
        <a
          href="https://github.com/vuejs/vue"
          title="vue on github"
        >Vue.js</a>
        {{ versions.vue }}
      </p>
    </div>
  </div>
</template>

<script>
// import
import { ref, version, isProxy, toRaw } from 'vue'
import {
  App,
  AppOptions,
  ViewConfig,
  ToolConfig,
  getDwvVersion
} from 'dwv'
import TagsTable from './TagsTable.vue'

export default {
  //name: 'dwv-vue',
  components: {
    TagsTable
  },
  setup() {
    const count = ref(0)
    return { count }
  },
  data() {
    let res = {
      versions: {
        dwv: getDwvVersion(),
        vue: version
      },
      tools: {
        Scroll: new ToolConfig(),
        ZoomAndPan: new ToolConfig(),
        WindowLevel: new ToolConfig(),
        Draw: new ToolConfig(['Ruler'])
      },
      selectedTool: 'Select Tool',
      selectedToolIndex: undefined,
      canScroll: false,
      canWindowLevel: false,
      loadProgress: 0,
      dataLoaded: false,
      metaData: undefined,
      orientation: undefined,
      showDicomTags: false,
      dropboxDivId: 'dropBox',
      dropboxClassName: 'dropBox',
      borderClassName: 'dropBoxBorder',
      hoverClassName: 'hover'
    }
    res.toolNames = Object.keys(res.tools)
    if (isProxy(this)) {
      res.dwvApp = toRaw(this).dwvApp
    }
    return res
  },
  mounted() {
    // create app
    this.dwvApp = new App()
    // initialise app
    const viewConfig0 = new ViewConfig('layerGroup0')
    const viewConfigs = {'*': [viewConfig0]}
    const options = new AppOptions(viewConfigs)
    options.tools = this.tools
    this.dwvApp.init(options)
    // handle load events
    let nLoadItem = null
    let nReceivedLoadError = null
    let nReceivedLoadAbort = null
    let isFirstRender = null
    this.dwvApp.addEventListener('loadstart', (/*event*/) => {
      // reset flags
      this.dataLoaded = false
      nLoadItem = 0
      nReceivedLoadError = 0
      nReceivedLoadAbort = 0
      isFirstRender = true
      // hide drop box
      this.showDropbox(false)
    })
    this.dwvApp.addEventListener('loadprogress', event => {
      this.loadProgress = event.loaded
    })
    this.dwvApp.addEventListener('renderend', (event) => {
      if (isFirstRender) {
        isFirstRender = false
        const vl = this.dwvApp.getViewLayersByDataId(event.dataid)[0];
        const vc = vl.getViewController();
        // available tools
        if (vc.canScroll()) {
          this.canScroll = true;
        }
        if (vc.isMonochrome()) {
          this.canWindowLevel = true;
        }
        // selected tools
        let selectedTool = 'ZoomAndPan'
        if (this.canScroll) {
          selectedTool = 'Scroll'
        }
        this.onChangeTool(selectedTool)
      }
    })
    this.dwvApp.addEventListener('load', (event) => {
      // set dicom tags
      this.metaData = this.dwvApp.getMetaData(event.dataid)
      // set data loaded flag
      this.dataLoaded = true
    })
    this.dwvApp.addEventListener('loadend', (/*event*/) => {
      if (nReceivedLoadError) {
        this.loadProgress = 0
        alert('Received errors during load. Check log for details.')
        // show drop box if nothing has been loaded
        if (!nLoadItem) {
          this.showDropbox(true)
        }
      }
      if (nReceivedLoadAbort) {
        this.loadProgress = 0
        alert('Load was aborted.')
        this.showDropbox(true)
      }
    })
    this.dwvApp.addEventListener('loaditem', (/*event*/) => {
      ++nLoadItem
    })
    this.dwvApp.addEventListener('loaderror', (/*event*/) => {
      // console.error('load error', event)
      ++nReceivedLoadError
    })
    this.dwvApp.addEventListener('loadabort', (/*event*/) => {
      ++nReceivedLoadAbort
    })

    // handle key events
    this.dwvApp.addEventListener('keydown', event => {
      this.dwvApp.defaultOnKeydown(event)
    })
    // handle window resize
    window.addEventListener('resize', this.dwvApp.onResize)

    // setup drop box
    this.setupDropbox()

    // possible load from location
    this.dwvApp.loadFromUri(window.location.href)
  },
  methods: {
    getToolIcon(tool) {
      var res
      if (tool === 'Scroll') {
        res = 'menu'
      } else if (tool === 'ZoomAndPan') {
        res = 'search'
      } else if (tool === 'WindowLevel') {
        res = 'contrast'
      } else if (tool === 'Draw') {
        res = 'straighten'
      }
      return res
    },
    onChangeTool(tool) {
      this.selectedTool = tool
      this.selectedToolIndex = this.toolNames.findIndex(
        (element) => element === tool
      )
      for (const t of this.toolNames) {
        this.activateTool(t, false)
      }
      this.activateTool(tool, true)
      this.dwvApp.setTool(tool)
      if (tool === 'Draw') {
        this.onChangeShape(this.tools.Draw.options[0])
      } else {
        // if draw was created, active is now a draw layer...
        // reset to view layer
        const lg = this.dwvApp.getActiveLayerGroup();
        lg?.setActiveLayer(0);
      }
    },
    canRunTool(tool) {
      let res
      if (tool === 'Scroll') {
        res = this.canScroll
      } else if (tool === 'WindowLevel') {
        res = this.canWindowLevel
      } else {
        res = true
      }
      return res
    },
    activateTool(tool, flag) {
      if (flag) {
        document.getElementById(tool).classList.add('active')
      } else {
        document.getElementById(tool).classList.remove('active')
      }
    },
    toggleOrientation() {
      if (typeof this.orientation !== 'undefined') {
        if (this.orientation === 'axial') {
          this.orientation = 'coronal'
        } else if (this.orientation === 'coronal') {
          this.orientation = 'sagittal'
        } else if (this.orientation === 'sagittal') {
          this.orientation = 'axial'
        }
      } else {
        // default is most probably axial
        this.orientation = 'coronal'
      }
      // update data view config
      const viewConfig0 = new ViewConfig('layerGroup0')
      viewConfig0.orientation = this.orientation
      const viewConfigs = {'*': [viewConfig0]}
      this.dwvApp.setDataViewConfigs(viewConfigs)
      // render data
      const dataIds = this.dwvApp.getDataIds()
      for (const dataId of dataIds) {
        this.dwvApp.render(dataId)
      }
    },
    onChangeShape(shape) {
      if (this.dwvApp && this.selectedTool === 'Draw') {
        this.dwvApp.setToolFeatures({shapeName: shape})
      }
    },
    onReset() {
      this.dwvApp.resetLayout()
    },
    setupDropbox() {
      this.showDropbox(true)
    },
    defaultHandleDragEvent(event) {
      // prevent default handling
      event.stopPropagation()
      event.preventDefault()
    },
    onBoxDragOver(event) {
      this.defaultHandleDragEvent(event)
      // update box border
      const box = document.getElementById(this.dropboxDivId)
      if (box && box.className.indexOf(this.hoverClassName) === -1) {
        box.className += ' ' + this.hoverClassName
      }
    },
    onBoxDragLeave(event) {
      this.defaultHandleDragEvent(event)
      // update box class
      const box = document.getElementById(this.dropboxDivId)
      if (box && box.className.indexOf(this.hoverClassName) !== -1) {
        box.className = box.className.replace(' ' + this.hoverClassName, '')
      }
    },
    onDrop(event) {
      this.defaultHandleDragEvent(event)
      // load files
      this.dwvApp.loadFiles(event.dataTransfer.files)
    },
    onInputFile(event) {
      if (event.target && event.target.files) {
        this.dwvApp.loadFiles(event.target.files)
      }
    },
    showDropbox(show) {
      const box = document.getElementById(this.dropboxDivId)
      if (!box) {
        return
      }
      const layerDiv = document.getElementById('layerGroup0')

      if (show) {
        // reset css class
        box.className = this.dropboxClassName + ' ' + this.borderClassName
        // check content
        if (box.innerHTML === '') {
          const p = document.createElement('p')
          p.appendChild(document.createTextNode('Drag and drop data here or '))
          // input file
          const input = document.createElement('input')
          input.onchange = this.onInputFile
          input.type = 'file'
          input.multiple = true
          input.id = 'input-file'
          input.style.display = 'none'
          const label = document.createElement('label')
          label.htmlFor = 'input-file'
          const link = document.createElement('a')
          link.appendChild(document.createTextNode('click here'))
          link.id = 'input-file-link'
          label.appendChild(link)
          p.appendChild(input)
          p.appendChild(label)

          box.appendChild(p)
        }
        // show box
        box.setAttribute('style', 'display:initial')
        // stop layer listening
        if (layerDiv) {
          layerDiv.removeEventListener('dragover', this.defaultHandleDragEvent)
          layerDiv.removeEventListener('dragleave', this.defaultHandleDragEvent)
          layerDiv.removeEventListener('drop', this.onDrop)
        }
        // listen to box events
        box.addEventListener('dragover', this.onBoxDragOver)
        box.addEventListener('dragleave', this.onBoxDragLeave)
        box.addEventListener('drop', this.onDrop)
      } else {
        // remove border css class
        box.className = this.dropboxClassName
        // remove content
        box.innerHTML = ''
        // hide box
        box.setAttribute('style', 'display:none')
        // stop box listening
        box.removeEventListener('dragover', this.onBoxDragOver)
        box.removeEventListener('dragleave', this.onBoxDragLeave)
        box.removeEventListener('drop', this.onDrop)
        // listen to layer events
        if (layerDiv) {
          layerDiv.addEventListener('dragover', this.defaultHandleDragEvent)
          layerDiv.addEventListener('dragleave', this.defaultHandleDragEvent)
          layerDiv.addEventListener('drop', this.onDrop)
        }
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#dwv {
  height: 90%;
}

button {
  margin: 2px;
}

.legend {
  text-align: center;
  font-size: 8pt;
  margin: 1em;
}

/* Layers */
.layerGroup {
  position: relative;
  padding: 0;
  display: flex;
  justify-content: center;
  height: 90%;
}
.layer {
  position: absolute;
  pointer-events: none;
}

/* drag&drop */
.dropBox {
  margin: auto;
  text-align: center;
  vertical-align: middle;
  width: 50%; height: 75%;
}
.dropBoxBorder {
  border: 5px dashed rgb(var(--v-theme-primary)); }
.dropBoxBorder:hover {
  border: 5px dashed rgb(var(--v-theme-secondary)); }
</style>

<!-- non "scoped" style -->
<style>
.layer {
  position: absolute;
  pointer-events: none;
}
</style>
