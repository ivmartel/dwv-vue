<template>
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
</template>

<script>
// import
import { ref, inject } from 'vue'
import TagsTable from './TagsTable.vue'

export default {
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
    }
  },
  mounted() {
    // watch load progress
    this.dwvService.addEventListener('loadprogress', (event) => {
      this.loadProgress = event.detail.value
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
    }
  }
}
</script>

<style scoped>
/* host */
.header {
  display: flex;
  justify-content: center;
  margin-bottom: 5px;
  flex-wrap: wrap;
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
