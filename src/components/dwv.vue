<template>
  <div id="dwv">
    <div class="button-row">
      <button value="WindowLevel" v-on:click="onClick">WindowLevel</button>
      <button value="ZoomAndPan" v-on:click="onClick">ZoomAndPan</button>
    </div>
    <div class="layerContainer">
      <div class="dropBox"></div>
      <canvas class="imageLayer">Only for HTML5 compatible browsers...</canvas>
    </div>
    <div class="legend">{{ legend }}</div>
  </div>
</template>

<script>
// import
import Vue from 'vue'
import dwv from 'dwv'

// overrides (appgui.js)

// Progress
dwv.gui.displayProgress = function () {}
// Window
dwv.gui.getWindowSize = dwv.gui.base.getWindowSize
// get element
dwv.gui.getElement = dwv.gui.base.getElement

// launch (applauncher.js)

// create app
var myapp = new dwv.App()

// initialise app
myapp.init({
  'containerDivId': 'dwv',
  'fitToWindow': true,
  'tools': ['Scroll', 'ZoomAndPan', 'WindowLevel'],
  'isMobile': true
})

// load local dicom
myapp.loadURLs(['./static/bbmri-53323131.dcm'])

export default {
  name: 'dwv',
  data () {
    return {
      legend: 'Powered by dwv ' + dwv.getVersion() + ' and Vue.js ' + Vue.version,
      onClick: function (event) {
        myapp.onChangeTool(event)
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.button-row {
  text-align: center;
  justify-content: space-around;
}
button {
    margin: 5px; padding: 10px 10px;
    border: 0 none; border-radius: 4px;
    font-size: 14px; font-weight: 600;
    color: #fff; background-color: #444; }
button:hover { background-color: #555; }
button:disabled { background-color: #08b; }

.legend {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 8pt;
}

/* Layers */
.layerContainer {
    position: relative; padding: 0;
    margin: auto; text-align: center; }
.imageLayer {
    position: absolute;
    left: 0px; }

/* drag&drop */
.dropBox {
    border: 5px dashed #ccc;
    margin: auto; text-align: center; }
.dropBox.hover { border: 5px dashed #cc0; }
</style>
