<template>
  <div id="dwv">
    <md-progress-bar
      md-mode="determinate"
      :md-value="loadProgress"
    ></md-progress-bar>
    <div class="button-row">
      <!-- action buttons -->
      <md-button
        class="md-icon-button md-raised md-primary"
        v-for="tool in toolNames"
        :key="tool"
        :id="tool"
        :title="tool"
        v-on:click="onChangeTool(tool)"
        :disabled="!dataLoaded || !canRunTool(tool)"
        ><md-icon>{{ getToolIcon(tool)}}</md-icon>
      </md-button>

      <md-button
        class="md-icon-button md-raised md-primary"
        title="Reset"
        v-on:click="onReset()"
        :disabled="!dataLoaded"
        ><md-icon>refresh</md-icon>
      </md-button>

      <md-button
        class="md-icon-button md-raised md-primary"
        title="Toggle Orientation"
        v-on:click="toggleOrientation()"
        :disabled="!dataLoaded"
        ><md-icon>cameraswitch</md-icon>
      </md-button>

      <md-button
        class="md-icon-button md-raised md-primary"
        title="Tags"
        v-on:click="showDicomTags = true"
        :disabled="!dataLoaded"
        ><md-icon>library_books</md-icon>
      </md-button>
      <!-- dicom tags dialog-->
      <md-dialog :md-active.sync="showDicomTags">
        <tagsTable :tagsData="metaData" />
      </md-dialog>
    </div>
    <div id="layerGroup0" class="layerGroup">
      <div id="dropBox"></div>
    </div>
    <div class="legend md-caption">
      <p>
        Powered by
        <a href="https://github.com/ivmartel/dwv" title="dwv on github">dwv</a>
        {{ versions.dwv }} and
        <a href="https://github.com/vuejs/vue" title="vue on github">Vue.js</a>
        {{ versions.vue }}
      </p>
    </div>
  </div>
</template>

<script>
// import
import Vue from 'vue'
import MdButton from 'vue-material'
import {
  App,
  getDwvVersion,
  decoderScripts
} from 'dwv'
import tagsTable from './tags-table'

Vue.use(MdButton)

// gui overrides

// Image decoders (for web workers)
decoderScripts.jpeg2000 = 'assets/dwv/decoders/pdfjs/decode-jpeg2000.js'
decoderScripts['jpeg-lossless'] =
  'assets/dwv/decoders/rii-mango/decode-jpegloss.js'
decoderScripts['jpeg-baseline'] =
  'assets/dwv/decoders/pdfjs/decode-jpegbaseline.js'
decoderScripts.rle = 'assets/dwv/decoders/dwv/decode-rle.js'

export default {
  name: 'dwv-vue',
  components: {
    tagsTable
  },
  data: function () {
    let res = {
      versions: {
        dwv: getDwvVersion(),
        vue: Vue.version
      },
      dwvApp: null,
      tools: {
        Scroll: {},
        ZoomAndPan: {},
        WindowLevel: {},
        Draw: {
          options: ['Ruler']
        }
      },

      selectedTool: 'Select Tool',
      loadProgress: 0,
      dataLoaded: false,
      metaData: null,
      orientation: undefined,
      showDicomTags: false,
      dropboxDivId: 'dropBox',
      dropboxClassName: 'dropBox',
      borderClassName: 'dropBoxBorder',
      hoverClassName: 'hover'
    }
    res.toolNames = Object.keys(res.tools)
    return res
  },
  mounted() {
    // create app
    this.dwvApp = new App()
    // initialise app
    this.dwvApp.init({
      dataViewConfigs: {'*': [{divId: 'layerGroup0'}]},
      tools: this.tools
    })
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
    this.dwvApp.addEventListener('renderend', (/*event*/) => {
      if (isFirstRender) {
        isFirstRender = false
        // available tools
        let selectedTool = 'ZoomAndPan'
        if (this.dwvApp.canScroll()) {
          selectedTool = 'Scroll'
        }
        this.onChangeTool(selectedTool)
      }
    })
    this.dwvApp.addEventListener('load', (/*event*/) => {
      // set dicom tags
      this.metaData = this.dwvApp.getMetaData(0)
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
    getToolIcon: function (tool) {
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
    onChangeTool: function (tool) {
      this.selectedTool = tool
      for (const t of this.toolNames) {
        this.activateTool(t, false)
      }
      this.activateTool(tool, true)
      this.dwvApp.setTool(tool)
      if (tool === 'Draw') {
        this.onChangeShape(this.tools.Draw.options[0])
      }
    },
    canRunTool: function (tool) {
      let res
      if (tool === 'Scroll') {
        res = this.dwvApp.canScroll()
      } else if (tool === 'WindowLevel') {
        res = this.dwvApp.canWindowLevel()
      } else {
        res = true
      }
      return res
    },
    activateTool: function (tool, flag) {
      if (flag) {
        document.getElementById(tool).classList.add('active')
      } else {
        document.getElementById(tool).classList.remove('active')
      }
    },
    toggleOrientation: function () {
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
      const config = {
        '*': [
          {
            divId: 'layerGroup0',
            orientation: this.orientation
          }
        ]
      }
      this.dwvApp.setDataViewConfig(config)
      // render data
      for (let i = 0; i < this.dwvApp.getNumberOfLoadedData(); ++i) {
        this.dwvApp.render(i)
      }
    },
    onChangeShape: function (shape) {
      if (this.dwvApp && this.selectedTool === 'Draw') {
        this.dwvApp.setToolFeatures({shapeName: shape})
      }
    },
    onReset: function () {
      this.dwvApp.resetDisplay()
    },
    setupDropbox() {
      this.showDropbox(true)
    },
    defaultHandleDragEvent: function (event) {
      // prevent default handling
      event.stopPropagation()
      event.preventDefault()
    },
    onBoxDragOver: function (event) {
      this.defaultHandleDragEvent(event)
      // update box border
      const box = document.getElementById(this.dropboxDivId)
      if (box && box.className.indexOf(this.hoverClassName) === -1) {
        box.className += ' ' + this.hoverClassName
      }
    },
    onBoxDragLeave: function (event) {
      this.defaultHandleDragEvent(event)
      // update box class
      const box = document.getElementById(this.dropboxDivId)
      if (box && box.className.indexOf(this.hoverClassName) !== -1) {
        box.className = box.className.replace(' ' + this.hoverClassName, '')
      }
    },
    onDrop: function (event) {
      this.defaultHandleDragEvent(event)
      // load files
      this.dwvApp.loadFiles(event.dataTransfer.files)
    },
    onInputFile: function (event) {
      if (event.target && event.target.files) {
        this.dwvApp.loadFiles(event.target.files)
      }
    },
    showDropbox: function (show) {
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
  font-family: Arial, Helvetica, sans-serif;
  height: 90%;
}

.button-row {
  text-align: center;
  padding: 5px;
}

#dwv button {
  margin: 2px;
}
#dwv button.active{
  background-color: var(--md-theme-default-accent);
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
  border: 5px dashed rgba(68, 138, 255, 0.38); }
.dropBoxBorder.hover {
  border: 5px dashed var(--md-theme-default-primary); }
</style>
<!-- non "scoped" style -->
<style>
.layer {
  position: absolute;
  pointer-events: none;
}
</style>
