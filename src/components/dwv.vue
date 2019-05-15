<template>
  <div id="dwv">
    <md-progress-bar md-mode="determinate" :md-value="loadProgress"></md-progress-bar>
    <div class="button-row">
      <!-- action buttons -->
      <md-menu md-size="medium" md-align-trigger>
        <md-button class="md-raised md-primary" md-menu-trigger :disabled="!dataLoaded">
          {{ selectedTool }} <md-icon>arrow_drop_down</md-icon></md-button>

        <md-menu-content>
          <md-menu-item v-for="tool in tools" :key="tool" v-on:click="onChangeTool(tool)">{{ tool }}</md-menu-item>
        </md-menu-content>

        <md-button class="md-raised md-primary" v-on:click="onReset()" :disabled="!dataLoaded">Reset</md-button>
        <md-button class="md-raised md-primary" v-on:click="showDicomTags = true" :disabled="!dataLoaded">Tags</md-button>
      </md-menu>
      <!-- dicom tags dialog-->
      <md-dialog :md-active.sync="showDicomTags">
        <tagsTable :tagsData="tags"/>
      </md-dialog>
    </div>
    <div class="layerContainer">
      <div class="dropBox md-body-1"><p>Drag and drop data here.</p></div>
      <canvas class="imageLayer">Only for HTML5 compatible browsers...</canvas>
      <div class="drawDiv"></div>
    </div>
    <div class="legend md-caption"><p>Powered by <a href="https://github.com/ivmartel/dwv" title="dwv on github">dwv</a>
      {{versions.dwv}} and Vue.js {{versions.vue}}</p></div>
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

// decode query
dwv.utils.decodeQuery = dwv.utils.base.decodeQuery
// progress
dwv.gui.displayProgress = function () {}
// get element
dwv.gui.getElement = dwv.gui.base.getElement
// refresh element
dwv.gui.refreshElement = dwv.gui.base.refreshElement

// Image decoders (for web workers)
dwv.image.decoderScripts = {
  'jpeg2000': 'assets/dwv/decoders/pdfjs/decode-jpeg2000.js',
  'jpeg-lossless': 'assets/dwv/decoders/rii-mango/decode-jpegloss.js',
  'jpeg-baseline': 'assets/dwv/decoders/pdfjs/decode-jpegbaseline.js',
  'rle': 'assets/dwv/decoders/dwv/decode-rle.js'
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
      tools: ['Scroll', 'ZoomAndPan', 'WindowLevel', 'Draw'],
      selectedTool: 'Select Tool',
      loadProgress: 0,
      dataLoaded: false,
      tags: null,
      showDicomTags: false
    }
  },
  mounted () {
    // create app
    this.dwvApp = new dwv.App()
    // initialise app
    this.dwvApp.init({
      'containerDivId': 'dwv',
      'tools': this.tools,
      'shapes': ['Ruler'],
      'isMobile': true
    })
    // progress
    var self = this
    this.dwvApp.addEventListener('load-progress', function (event) {
      self.loadProgress = event.loaded
    })
    this.dwvApp.addEventListener('load-end', function (/*event*/) {
      // set data loaded flag
      self.dataLoaded = true
      // set dicom tags
      self.tags = self.dwvApp.getTags()
      // set the selected tool
      if (self.dwvApp.isMonoSliceData() && self.dwvApp.getImage().getNumberOfFrames() === 1) {
        self.selectedTool = 'ZoomAndPan'
      } else {
        self.selectedTool = 'Scroll'
      }
    })
  },
  methods: {
    onChangeTool: function (tool) {
      this.selectedTool = tool
      this.dwvApp.onChangeTool({ currentTarget: { value: tool } })
    },
    onReset: function () {
      this.dwvApp.onDisplayReset()
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#dwv {
  font-family: Arial, Helvetica, sans-serif;
  height: 90%; }

.button-row {
  text-align: center;
  padding: 5px;
}

#dwv button {
  margin: 2px;
}

/* Layers */
.layerContainer {
    position: relative; padding: 0;
    margin: auto; text-align: center; }
.imageLayer {
    position: absolute;
    left: 0px; }
.drawDiv {
    position: absolute; pointer-events: none; }

/* drag&drop */
.dropBox {
    border: 5px dashed rgba(68,138,255,0.38);
    margin: auto;
    text-align: center; vertical-align: middle; }
.dropBox.hover { border: 5px dashed var(--md-theme-default-primary); }

.md-dialog {
  width: 80%;
  height: 90%;
}
</style>
