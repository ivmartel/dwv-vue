<template>
  <div id="dwv">
    <v-progress-linear
      :model-value="loadProgress"
      color="primary"
    />

    <div class="header">
      <!-- action buttons -->
      <template
        v-for="tool in toolNames"
        :key="tool"
      >
        <div class="toolbar-item">
          <v-btn
            :id="tool"
            :title="tool"
            class="rounded-lg"
            :variant="tool === selectedTool ? 'flat' : 'tonal'"
            :disabled="!dataLoaded || !canRunTool(tool)"
            :icon="getToolIcon(tool)"
            @click="onChangeTool(tool)"
          />
          <div
            v-if="tool === 'WindowLevel'"
            id="presetSelectDiv"
            key="presetSelectDiv"
            class="select-wrapper"
          >
            <v-btn
              class="rounded-lg"
              title="presetArrow"
              variant="tonal"
              :disabled="!dataLoaded"
              icon="keyboard_arrow_down"
            />
            <select
              id="presetSelect"
              key="presetSelect"
              :value="selectedPreset"
              :style="{ colorScheme: 'light' }"
              @change="onChangePreset"
            >
              <option
                v-for="preset in presetNames"
                :id="preset"
                :key="preset"
              >
                {{ preset }}
              </option>
            </select>
          </div>
          <div
            v-if="tool === 'Draw'"
            id="shapeSelectDiv"
            key="shapeSelectDiv"
            class="select-wrapper"
          >
            <v-btn
              class="rounded-lg"
              title="shapeArrow"
              variant="tonal"
              :disabled="!dataLoaded"
              icon="keyboard_arrow_down"
            />
            <select
              id="shapeSelect"
              key="shapeSelect"
              :value="selectedShape"
              :style="{ colorScheme: 'light' }"
              @change="onChangeShape"
            >
              <option
                v-for="shape in shapeNames"
                :id="shape"
                :key="shape"
              >
                {{ shape }}
              </option>
            </select>
          </div>
        </div>
      </template>

      <div class="toolbar-item">
        <v-btn
          class="rounded-lg"
          title="Reset"
          variant="tonal"
          :disabled="!dataLoaded"
          icon="refresh"
          @click="onReset()"
        />
      </div>

      <div class="toolbar-item">
        <v-btn
          class="rounded-lg"
          title="Toggle Orientation"
          variant="tonal"
          :disabled="!dataLoaded"
          icon="cameraswitch"
          @click="toggleOrientation()"
        />
      </div>

      <div class="toolbar-item">
        <!-- dicom tags dialog-->
        <v-dialog
          max-width="800px"
          scrollable
        >
          <template #activator="{ props: activatorProps }">
            <v-btn
              class="rounded-lg"
              title="Tags"
              variant="tonal"
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
      </div>
    </div>

    <div class="content">
      <div
        id="layerGroup0"
        class="layerGroup"
      >
        <div id="dropBox" />
      </div>
    </div>

    <div class="footer">
      <p class="legend">
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
import { ref, version, inject } from 'vue'
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
    const dwvService = inject('DwvService')
    const shapeNames = dwvService.getShapeNames()

    return {
      dwvService,
      versions: {
        dwv: dwvService.getDwvVersion(),
        vue: version
      },
      toolNames: dwvService.getToolNames(),
      shapeNames,
      presetNames: [],
      selectedTool: '',
      selectedShape: shapeNames[0],
      selectedPreset: '',
      loadProgress: 0,
      dataLoaded: false,
      metaData: undefined,
      showDicomTags: false,
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
    // watch data ready
    this.dwvService.addEventListener('dataready', (event) => {
      const dataReady = event.detail.value
      if (dataReady) {
        const runnableTool = this.dwvService.getFirstRunnableTool()
        if (runnableTool !== undefined) {
          this.selectedTool = runnableTool
          this.applyTool(runnableTool)
        }
      }
    })
    // watch data loaded
    this.dwvService.addEventListener('dataloaded', (event) => {
      this.dataLoaded = event.detail.value
      this.metaData = this.dwvService.getMetaData()
      this.autoShowDropbox()
    })
    // watch preset names
    this.dwvService.addEventListener('presetnames', (event) => {
      this.presetNames = event.detail.value
      const presetNames = this.presetNames
      this.selectedPreset = presetNames[0]
    })
    // watch is manual preset
    this.dwvService.addEventListener('ismanualpreset', (event) => {
      const isManual = event.detail.value
      const preset = this.selectedPreset
      const manualStr = 'manual'
      if (isManual && preset !== manualStr) {
        this.selectedPreset = manualStr
      }
    })

    // setup drop box
    this.setupDropbox()

    // possible load from location
    this.dwvService.loadFromUri(window.location.href)
  },
  methods: {
    getToolIcon(tool) {
      let res
      if (tool === 'Scroll') {
        res = 'menu'
      } else if (tool === 'ZoomAndPan') {
        res = 'search'
      } else if (tool === 'WindowLevel') {
        res = 'contrast'
      } else if (tool === 'Draw') {
        res = this.getShapeIcon(this.selectedShape)
      }
      return res
    },
    getShapeIcon(shape) {
      let res
      if (shape === 'Ruler') {
        res = 'straighten'
      } else if (shape === 'Arrow') {
        res = 'call_made'
      } else if (shape === 'Rectangle') {
        res = 'crop_landscape'
      } else if (shape === 'Circle') {
        res = 'radio_button_unchecked'
      } else if (shape === 'Ellipse') {
        res = 'sports_rugby'
      } else if (shape === 'Protractor') {
        res = 'square_foot'
      } else if (shape === 'Roi') {
        res = 'polyline'
      }
      return res
    },
    onChangeTool(tool) {
      this.selectedTool = tool
      this.applyTool(tool)
    },
    onChangeShape(event) {
      const shape = event.currentTarget.value
      this.selectedTool = 'Draw'
      this.selectedShape = shape
      this.applyShape(shape)
    },
    onChangePreset(event) {
      const preset = event.currentTarget.value
      this.selectedPreset = preset
      this.applyPreset(preset)
    },
    applyTool(tool, features) {
      if (typeof features === 'undefined' && tool === 'Draw') {
        features = {shapeName: this.selectedShape}
      }
      this.dwvService.applyTool(tool, features)
    },
    applyShape(shape) {
      this.applyTool('Draw', {shapeName: shape})
    },
    applyPreset(preset) {
      this.dwvService.applyPreset(preset)
    },
    canRunTool(tool) {
      return this.dwvService.canRunTool(tool)
    },
    toggleOrientation() {
      this.dwvService.toggleOrientation()
    },
    onReset() {
      this.dwvService.reset()
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
  display: flex;
  flex-direction: column;
}

button {
  margin: 2px;
}

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

/* header */
.header {
  display: flex;
  justify-content: center;
  margin-bottom: 5px;
  flex-wrap: wrap;
}
/* content */
.content {
  /* occupy space left by header and footer */
  flex: 1;
  min-height: 0;
  display: flex;
}
/* footer */
.footer {
  text-align: center;
  font-size: 8pt;
  margin: 1em;
}

/* toolbar */
.toolbar-item {
  margin: 10px 3px;
  height: 40px;

  display: flex;
  align-items: center;
  gap: 0;
}
.toolbar-item button {
  height: 100%;
  border-radius: 4px;
  padding: 10px;
}

/* select wrapper */
.select-wrapper {
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}
.select-wrapper select {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  appearance: none;
  -webkit-appearance: none;
}
.select-wrapper button {
  padding: 0;
  margin: 0 0 0 1px;

  width: 20px !important;
}
.select-wrapper select:enabled:hover {
  cursor: pointer;
}
</style>
