<template>
  <div class="content">
    <div
      id="layerGroup0"
      class="layerGroup"
    >
      <div
        id="dropBox"
        class="dropBox dropBoxBorder"
        @dragOver="onBoxDragOver"
        @dragLeave="onBoxDragLeave"
        @drop="onDrop"
      >
        <p>
          Drag and drop data here or
          <label htmlFor="input-file">
            <a id="input-file-link"> click here</a>
            <input
              id="input-file"
              type="file"
              multiple
              style="display: none"
              @change="onInputFile"
            >
          </label>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
// import
import { ref, inject } from 'vue'

export default {
  setup() {
    const count = ref(0)
    return { count }
  },
  data() {
    const dwvService = inject('DwvService')

    return {
      dwvService,
      loadProgress: 0,
      dataLoaded: false,
      dropboxDivId: 'dropBox',
      dropboxClassName: 'dropBox',
      borderClassName: 'dropBoxBorder',
      hoverClassName: 'hover'
    }
  },
  mounted() {
    // watch load progress
    this.dwvService.addEventListener('loadprogress', (event) => {
      this.loadProgress = event.detail.value
      this.autoShowDropbox()
    })
    // watch data loaded
    this.dwvService.addEventListener('dataloaded', (event) => {
      this.dataLoaded = event.detail.value
      this.metaData = this.dwvService.getMetaData()
      this.autoShowDropbox()
    })

    // setup drop box
    this.showDropbox(true)
  },
  methods: {
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
      this.dwvService.loadFiles(event.dataTransfer.files)
    },
    onInputFile(event) {
      if (event.target && event.target.files) {
        this.dwvService.loadFiles(event.target.files)
      }
    },
    autoShowDropbox() {
      const isLoaded = this.dataLoaded
      const progress = this.loadProgress
      const isLoading = progress !== 0 && progress !== 100
      this.showDropbox(!isLoading && !isLoaded)
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

<style scoped>
/* host */
.content {
  min-height: 0;
  display: flex;
}

/* drag&drop */
.dropBox {
  margin: auto;
  text-align: center;
  vertical-align: middle;
  width: 50%; height: 75%;
}
.dropBoxBorder {
  border: 5px dashed rgb(var(--v-theme-primary));
}
.dropBoxBorder:hover, .hover {
  border: 5px dashed rgb(var(--v-theme-secondary));
}
</style>

<style>
/* Layers */
.layerGroup {
  position: relative;
  padding: 0;
  display: flex;
  justify-content: center;
  flex: 1;
  min-height: 0;
}
.layer {
  position: absolute;
  pointer-events: none;
}

/* Info layer */
.infoLayer {
  position: absolute;
  pointer-events: none;
  z-index: 5;
  width: 100%;
  height: 100%;
}
.infoLayer ul {
  margin: 0;
  padding: 2px;
  list-style-type: none;
}
.infoLayer li {
  margin-top: 0;
}
.infoLayer canvas {
  margin: 0;
  padding: 2px;
}
.info {
  font-size: 80%;
  text-shadow: 1px 1px light-dark(#fff, #000);
  max-width: 50%;
  max-height: 50%;
  overflow: auto;
}
/* position indicators (c, tl, tc, bl...)
  need to be in sync with those defined
  in the overlay.json file */
/* center */
.info-c {
  font-size: 120%;
  text-shadow: 1px 1px light-dark(#fff, #000);
}
/* top left */
.info-tl {
  position: absolute;
  top: 0;
  left: 0;
  text-align: left;
}
/* top center */
.info-tc {
  position: absolute;
  top: 0;
  left: 50%;
  right: 50%;
  text-align: center;
}
/* top right */
.info-tr {
  position: absolute;
  top: 0;
  right: 0;
  text-align: right;
}
/* center left */
.info-cl {
  position: absolute;
  bottom: 50%;
  left: 0;
  text-align: left;
}
/* center right */
.info-cr {
  position: absolute;
  bottom: 50%;
  right: 2px;
  text-align: right;
}
/* bottom left */
.info-bl {
  position: absolute;
  bottom: 0;
  left: 0;
  text-align: left;
}
/* bottom center */
.info-bc {
  position: absolute;
  bottom: 0;
  left: 50%;
  right: 50%;
  text-align: center;
}
/* bottom right */
.info-br {
  position: absolute;
  bottom: 0;
  right: 0;
  text-align: right;
}
</style>
