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
    <div class="layerContainer">
      <div class="dropBox"></div>
      <canvas class="imageLayer">Only for HTML5 compatible browsers...</canvas>
      <div class="drawDiv"></div>
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

// get element
dwv.gui.getElement = dwv.gui.base.getElement
// prompt
// (no direct assign to avoid Illegal invocation error
// see: https://stackoverflow.com/questions/9677985/uncaught-typeerror-illegal-invocation-in-chrome)
dwv.gui.prompt = function (message, def) {
  return prompt(message, def)
}

// Image decoders (for web workers)
dwv.image.decoderScripts = {
  jpeg2000: 'assets/dwv/decoders/pdfjs/decode-jpeg2000.js',
  'jpeg-lossless': 'assets/dwv/decoders/rii-mango/decode-jpegloss.js',
  'jpeg-baseline': 'assets/dwv/decoders/pdfjs/decode-jpegbaseline.js',
  rle: 'assets/dwv/decoders/dwv/decode-rle.js'
}

export default {
  name: 'dwv',
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
          options: ['Ruler'],
          type: 'factory',
          events: ['drawcreate', 'drawchange', 'drawmove', 'drawdelete']
        }
      },
      toolNames: [],
      selectedTool: 'Select Tool',
      loadProgress: 0,
      dataLoaded: false,
      metaData: null,
      showDicomTags: false,
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
      containerDivId: 'dwv',
      tools: this.tools
    })
    // handle load events
    let nLoadItem = null
    let nReceivedError = null
    let nReceivedAbort = null
    this.dwvApp.addEventListener('loadstart', (/*event*/) => {
      // reset flags
      this.dataLoaded = false
      nLoadItem = 0
      nReceivedError = 0
      nReceivedAbort = 0
      // hide drop box
      this.showDropbox(false)
    })
    this.dwvApp.addEventListener('loadprogress', event => {
      this.loadProgress = event.loaded
    })
    this.dwvApp.addEventListener('load', (/*event*/) => {
      // set dicom tags
      this.metaData = dwv.utils.objectToArray(this.dwvApp.getMetaData())
      // set the selected tool
      this.toolNames = []
      for (const key in this.tools) {
        if ((key === 'Scroll' && this.dwvApp.canScroll()) ||
          (key === 'WindowLevel' && this.dwvApp.canWindowLevel()) ||
          (key !== 'Scroll' && key !== 'WindowLevel')) {
          this.toolNames.push(key)
        }
      }
      this.onChangeTool(this.toolNames[0])
      // set data loaded flag
      this.dataLoaded = true
    })
    this.dwvApp.addEventListener('loadend', (/*event*/) => {
      if (nReceivedError) {
        this.loadProgress = 0
        alert('Received errors during load. Check log for details.')
        // show drop box if nothing has been loaded
        if (!nLoadItem) {
          this.showDropbox(true)
        }
      }
      if (nReceivedAbort) {
        this.loadProgress = 0
        alert('Load was aborted.')
        this.showDropbox(true)
      }
    })
    this.dwvApp.addEventListener('loaditem', (/*event*/) => {
      ++nLoadItem
    })
    this.dwvApp.addEventListener('error', (/*event*/) => {
      // console.error(event)
      ++nReceivedError
    })
    this.dwvApp.addEventListener('abort', (/*event*/) => {
      ++nReceivedAbort
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
        this.dwvApp.setDrawShape(shape)
      }
    },
    onReset: function () {
      this.dwvApp.resetDisplay()
    },
    setupDropbox() {
      // start listening to drag events on the layer container
      const layerContainer = this.dwvApp.getElement('layerContainer')
      if (layerContainer) {
        // show drop box
        this.showDropbox(true)
        // start listening to drag events on the layer container
        layerContainer.addEventListener('dragover', this.onDragOver)
        layerContainer.addEventListener('dragleave', this.onDragLeave)
        layerContainer.addEventListener('drop', this.onDrop)
      }
    },
    onDragOver: function (event) {
      // prevent default handling
      event.stopPropagation()
      event.preventDefault()
      // update box border
      const box = this.dwvApp.getElement(this.borderClassName)
      if (box && box.className.indexOf(this.hoverClassName) === -1) {
        box.className += ' ' + this.hoverClassName
      }
    },
    onDragLeave: function (event) {
      // prevent default handling
      event.stopPropagation()
      event.preventDefault()
      // update box class
      const box = this.dwvApp.getElement(this.borderClassName + ' hover')
      if (box && box.className.indexOf(this.hoverClassName) !== -1) {
        box.className = box.className.replace(' ' + this.hoverClassName, '')
      }
    },
    showDropbox: function (show) {
      const box = this.dwvApp.getElement(this.dropboxClassName)
      if (box) {
        if (show) {
          // reset css class
          box.className = this.dropboxClassName + ' ' + this.borderClassName
          // check content
          if (box.innerHTML === '') {
            box.innerHTML = 'Drag and drop data here.'
          }
          const size = this.dwvApp.getLayerContainerSize()
          // set the initial drop box size
          const dropBoxSize = 2 * size.height / 3
          box.setAttribute(
            'style',
            'width:' + dropBoxSize + 'px;height:' + dropBoxSize + 'px')
        } else {
          // remove border css class
          box.className = this.dropboxClassName
          // remove content
          box.innerHTML = ''
          // make not visible
          box.setAttribute(
            'style',
            'visible:false;')
        }
      }
    },
    onDrop: function (event) {
      // prevent default handling
      event.stopPropagation()
      event.preventDefault()
      // load files
      this.dwvApp.loadFiles(event.dataTransfer.files)
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
.layerContainer {
  position: relative;
  padding: 0;
  margin: auto;
  text-align: center;
}
.imageLayer {
  position: absolute;
  left: 0px;
}
.drawDiv {
  position: absolute;
  pointer-events: none;
}

/* drag&drop */
.dropBox {
  margin: auto;
  text-align: center;
  vertical-align: middle;
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
