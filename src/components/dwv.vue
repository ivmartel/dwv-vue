<template>
  <div id="dwv">
    <md-progress-bar md-mode="determinate" :md-value="loaded"></md-progress-bar>
    <div class="button-row">
      <md-button class="md-raised md-primary" value="Scroll" v-on:click="onClick">Scroll</md-button>
      <md-button class="md-raised md-primary" value="WindowLevel" v-on:click="onClick">WindowLevel</md-button>
      <md-button class="md-raised md-primary" value="ZoomAndPan" v-on:click="onClick">ZoomAndPan</md-button>
      <md-button class="md-raised md-primary" value="Draw" v-on:click="onClick">Draw</md-button>
      <md-button class="md-raised md-primary" value="Draw" v-on:click="showDicomTags = true">Tags</md-button>
      <md-dialog :md-active.sync="showDicomTags">
        <tagsTable :tagsData="tags"/>
      </md-dialog>
    </div>
    <div class="layerContainer">
      <div class="dropBox"></div>
      <canvas class="imageLayer">Only for HTML5 compatible browsers...</canvas>
      <div class="drawDiv"></div>
    </div>
    <div class="legend">{{ legend }}</div>
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
// window
dwv.gui.getWindowSize = dwv.gui.base.getWindowSize
// get element
dwv.gui.getElement = dwv.gui.base.getElement
// refresh element
dwv.gui.refreshElement = dwv.gui.base.refreshElement

// Image decoders (for web workers)
dwv.image.decoderScripts = {
  'jpeg2000': 'static/dwv/decoders/pdfjs/decode-jpeg2000.js',
  'jpeg-lossless': 'static/dwv/decoders/rii-mango/decode-jpegloss.js',
  'jpeg-baseline': 'static/dwv/decoders/pdfjs/decode-jpegbaseline.js'
}

export default {
  name: 'dwv',
  components: {
    tagsTable
  },
  data: function () {
    return {
      legend: 'Powered by dwv ' + dwv.getVersion() + ' and Vue.js ' + Vue.version,
      dwvApp: null,
      loaded: 0,
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
      'fitToWindow': true,
      'tools': ['Scroll', 'ZoomAndPan', 'WindowLevel', 'Draw'],
      'shapes': ['Ruler'],
      'isMobile': true
    })
    // progress
    var self = this
    this.dwvApp.addEventListener('load-progress', function (event) {
      self.loaded = event.loaded
    })
    this.dwvApp.addEventListener('load-end', function (event) {
      self.tags = self.dwvApp.getTags()
    })
  },
  methods: {
    onClick: function (event) {
      this.dwvApp.onChangeTool(event)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#dwv { font-family: Arial, Helvetica, sans-serif; }

.button-row {
  text-align: center;
}

.legend {
  text-align: center;
  font-size: 8pt;
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
    border: 5px dashed #ccc;
    margin: auto; text-align: center; }
.dropBox.hover { border: 5px dashed #cc0; }

.md-dialog {
  width: 80%;
  height: 90%;
}
</style>
