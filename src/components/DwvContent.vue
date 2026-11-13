<template>
  <div class="content">
    <div
      :id="layerGroupDivId"
      class="layerGroup"
    >
      <div
        :id="dropboxDivId"
        class="dropBox dropBoxBorder"
      >
        <!-- drag events are handled via addEventListener in showDropbox -->
        <p>
          Drag and drop data here or
          <label :for="inputFileId">
            <a> click here</a>
            <input
              :id="inputFileId"
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
import { inject } from 'vue'

export default {
  setup() {
    // element ids, prefixed with the viewer id
    const viewerId = inject('viewerId')
    return {
      dropboxDivId: viewerId + '-dropBox',
      inputFileId: viewerId + '-input-file'
    }
  },
  data() {
    const dwvAppService = inject('DwvAppService')

    return {
      dwvAppService,
      layerGroupDivId: dwvAppService.getLayerGroupDivId(),
      loadProgress: 0,
      dataLoaded: false,
      dropboxClassName: 'dropBox',
      borderClassName: 'dropBoxBorder',
      hoverClassName: 'hover'
    }
  },
  mounted() {
    // watch load progress
    this.dwvAppService.addEventListener('loadprogress', (event) => {
      this.loadProgress = event.detail.value
      this.autoShowDropbox()
    })
    // watch data loaded
    this.dwvAppService.addEventListener('dataloaded', (event) => {
      this.dataLoaded = event.detail.value
      this.autoShowDropbox()
    })

    // setup drop box
    this.showDropbox(true)

    // refit the view whenever its size changes
    // (for ex when the right panel opens, closes or is resized)
    if (typeof ResizeObserver !== 'undefined') {
      const layerDiv = document.getElementById(this.layerGroupDivId)
      this.resizeObserver = new ResizeObserver(() => {
        this.dwvAppService.onResize()
      })
      this.resizeObserver.observe(layerDiv)
    }
  },
  unmounted() {
    this.resizeObserver?.disconnect()
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
      this.dwvAppService.loadFiles(event.dataTransfer.files)
    },
    onInputFile(event) {
      if (event.target && event.target.files) {
        this.dwvAppService.loadFiles(event.target.files)
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
      const layerDiv = document.getElementById(this.layerGroupDivId)

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

/* Layers: created by dwv inside the layer group,
  hence the :deep() selectors */
.layerGroup {
  position: relative;
  padding: 0;
  display: flex;
  justify-content: center;
  flex: 1;
  min-height: 0;
}
.layerGroup :deep(.layer) {
  position: absolute;
  pointer-events: none;
}

/* Info layer */
.layerGroup :deep(.infoLayer) {
  position: absolute;
  pointer-events: none;
  z-index: 5;
  width: 100%;
  height: 100%;
}
.layerGroup :deep(.infoLayer ul) {
  margin: 0;
  padding: 2px;
  list-style-type: none;
}
.layerGroup :deep(.infoLayer li) {
  margin-top: 0;
}
.layerGroup :deep(.infoLayer canvas) {
  margin: 0;
  padding: 2px;
}
.layerGroup :deep(.info) {
  font-size: 80%;
  max-width: 50%;
  max-height: 50%;
  overflow: auto;

  color: #cde;
  text-shadow: 1px 1px #000;
}
/* position indicators (c, tl, tc, bl...)
  need to be in sync with those defined
  in the overlay.json file */
/* center */
.layerGroup :deep(.info-c) {
  font-size: 120%;

  color: #ff0;
  text-shadow: 1px 1px #000;
}
/* top left */
.layerGroup :deep(.info-tl) {
  position: absolute;
  top: 0;
  left: 0;
  text-align: left;
}
/* top center */
.layerGroup :deep(.info-tc) {
  position: absolute;
  top: 0;
  left: 50%;
  right: 50%;
  text-align: center;
}
/* top right */
.layerGroup :deep(.info-tr) {
  position: absolute;
  top: 0;
  right: 0;
  text-align: right;
}
/* center left */
.layerGroup :deep(.info-cl) {
  position: absolute;
  bottom: 50%;
  left: 0;
  text-align: left;
}
/* center right */
.layerGroup :deep(.info-cr) {
  position: absolute;
  bottom: 50%;
  right: 2px;
  text-align: right;
}
/* bottom left */
.layerGroup :deep(.info-bl) {
  position: absolute;
  bottom: 0;
  left: 0;
  text-align: left;
}
/* bottom center */
.layerGroup :deep(.info-bc) {
  position: absolute;
  bottom: 0;
  left: 50%;
  right: 50%;
  text-align: center;
}
/* bottom right */
.layerGroup :deep(.info-br) {
  position: absolute;
  bottom: 0;
  right: 0;
  text-align: right;
}
</style>
