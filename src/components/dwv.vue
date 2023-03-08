<template>
  <div id="dwv">
    <md-progress-bar
      md-mode="determinate"
      :md-value="loadProgress"
    ></md-progress-bar>
    <div class="button-row">
      <!-- action buttons -->
      <md-menu md-size="medium" md-align-trigger>
        <md-button
          class="md-raised md-primary"
          md-menu-trigger
          :disabled="!dataLoaded"
        >
          {{ selectedTool }} <md-icon>arrow_drop_down</md-icon></md-button
        >

        <md-menu-content>
          <md-menu-item
            v-for="tool in toolNames"
            :key="tool"
            v-on:click="onChangeTool(tool)"
            >{{ tool }}</md-menu-item
          >
        </md-menu-content>

        <md-button
          class="md-raised md-primary"
          v-on:click="onReset()"
          :disabled="!dataLoaded"
          >Reset</md-button
        >
        <md-button
          class="md-raised md-primary"
          v-on:click="showDicomTags = true"
          :disabled="!dataLoaded"
          >Tags</md-button
        >
      </md-menu>
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
import dwv from 'dwv'
import tagsTable from './tags-table'

Vue.use(MdButton)

// gui overrides

// Image decoders (for web workers)
dwv.image.decoderScripts = {
  jpeg2000: 'assets/dwv/decoders/pdfjs/decode-jpeg2000.js',
  'jpeg-lossless': 'assets/dwv/decoders/rii-mango/decode-jpegloss.js',
  'jpeg-baseline': 'assets/dwv/decoders/pdfjs/decode-jpegbaseline.js',
  rle: 'assets/dwv/decoders/dwv/decode-rle.js'
}

export default {
  name: 'dwv-vue',
  components: {
    tagsTable
  },
  data: function () {
    return {
      versions: {
        dwv: dwv.getVersion(),
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
      toolNames: [],
      selectedTool: 'Select Tool',
      loadProgress: 0,
      dataLoaded: false,
      metaData: null,
      showDicomTags: false,
      dropboxDivId: 'dropBox',
      dropboxClassName: 'dropBox',
      borderClassName: 'dropBoxBorder',
      hoverClassName: 'hover'
    }
  },
  mounted() {
    // create app
    this.dwvApp = new dwv.App()
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
        this.toolNames = []
        for (const key in this.tools) {
          if ((key === 'Scroll' && this.dwvApp.canScroll()) ||
            (key === 'WindowLevel' && this.dwvApp.canWindowLevel()) ||
            (key !== 'Scroll' && key !== 'WindowLevel')) {
            this.toolNames.push(key)
          }
        }
        this.onChangeTool(this.toolNames[0])
      }
    })
    this.dwvApp.addEventListener('load', (/*event*/) => {
      // set dicom tags
      this.metaData = dwv.utils.objectToArray(this.dwvApp.getMetaData(0))
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
    dwv.utils.loadFromUri(window.location.href, this.dwvApp)
  },
  methods: {
    onChangeTool: function (tool) {
      this.selectedTool = tool
      this.dwvApp.setTool(tool)
      if (tool === 'Draw') {
        this.onChangeShape(this.tools.Draw.options[0])
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
          p.appendChild(document.createTextNode('Drag and drop data here'))
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

.md-dialog {
  width: 80%;
  height: 90%;
}

</style>
<!-- non "scoped" style -->
<style>
.layer {
  position: absolute;
  pointer-events: none;
}
</style>
