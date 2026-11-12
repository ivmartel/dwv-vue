<template>
  <div
    v-if="!isOpen"
    class="right-panel-toggle-strip"
  >
    <button
      ref="stripToggle"
      type="button"
      class="right-panel-toggle"
      title="Open panel"
      aria-expanded="false"
      :aria-controls="panelId"
      @click="setOpen(true)"
    >
      <v-icon
        icon="chevron_left"
        size="18"
      />
    </button>
  </div>

  <aside
    :id="panelId"
    class="right-panel"
    :class="{ open: isOpen, resizing: isResizing }"
    :style="{ width: isOpen ? width + 'px' : '0' }"
    :aria-hidden="isOpen ? undefined : 'true'"
    :inert="isOpen ? undefined : true"
  >
    <div
      class="right-panel-resize-handle"
      role="separator"
      tabindex="0"
      title="Resize panel"
      aria-label="Resize panel"
      aria-orientation="vertical"
      :aria-controls="panelId"
      :aria-valuenow="width"
      :aria-valuemin="PANEL_MIN_WIDTH"
      :aria-valuemax="maxWidth"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerEnd"
      @pointercancel="onPointerEnd"
      @keydown="onKeyDown"
    />
    <div
      class="right-panel-content"
      :style="{ width: width + 'px' }"
    >
      <div class="right-panel-header">
        <button
          v-if="isOpen"
          ref="headerToggle"
          type="button"
          class="right-panel-toggle"
          title="Close panel"
          aria-expanded="true"
          :aria-controls="panelId"
          @click="setOpen(false)"
        >
          <v-icon
            icon="chevron_right"
            size="18"
          />
        </button>
      </div>
      <div class="right-panel-body">
        <slot />
      </div>
    </div>
  </aside>
</template>

<script setup>
// Foldable and resizable side panel, see doc/design/rightPanel.md
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import {
  PANEL_INITIAL_WIDTH,
  PANEL_MIN_WIDTH,
  clampPanelWidth,
  getKeyResizeWidth,
  getMaxPanelWidth
} from './panelWidth.js'

const panelId = 'rightPanel'

const isOpen = ref(false)
const width = ref(PANEL_INITIAL_WIDTH)
const isResizing = ref(false)

const stripToggle = ref(null)
const headerToggle = ref(null)

// window width, to keep the maximum width up to date
const windowWidth = ref(window.innerWidth)
const onWindowResize = () => {
  windowWidth.value = window.innerWidth
}
onMounted(() => window.addEventListener('resize', onWindowResize))
onUnmounted(() => window.removeEventListener('resize', onWindowResize))

const maxWidth = computed(() => getMaxPanelWidth(windowWidth.value))

/**
 * Open or close the panel and move the focus to the visible toggle.
 *
 * @param {boolean} open True to open.
 */
async function setOpen(open) {
  if (open === isOpen.value) {
    return
  }
  isOpen.value = open
  await nextTick()
  const toggle = open ? headerToggle.value : stripToggle.value
  toggle?.focus()
}

/**
 * Set the panel width, rounded and clamped to the width limits.
 *
 * @param {number} newWidth The width in pixels.
 */
function setWidth(newWidth) {
  width.value = clampPanelWidth(newWidth, window.innerWidth)
}

// pointer resize
let startX = 0
let startWidth = 0

function onPointerDown(event) {
  if (event.button !== 0) {
    return
  }
  event.preventDefault()
  event.currentTarget.setPointerCapture?.(event.pointerId)
  isResizing.value = true
  startX = event.clientX
  startWidth = width.value
}

function onPointerMove(event) {
  if (!isResizing.value) {
    return
  }
  // moving left widens the panel
  setWidth(startWidth - (event.clientX - startX))
}

function onPointerEnd(event) {
  if (!isResizing.value) {
    return
  }
  const handle = event.currentTarget
  if (handle.hasPointerCapture?.(event.pointerId)) {
    handle.releasePointerCapture(event.pointerId)
  }
  isResizing.value = false
}

// keyboard resize
function onKeyDown(event) {
  const newWidth = getKeyResizeWidth(event.key, width.value, window.innerWidth)
  if (typeof newWidth === 'undefined') {
    return
  }
  event.preventDefault()
  setWidth(newWidth)
}

defineExpose({ setOpen, setWidth, isOpen, width })
</script>

<style scoped>
.right-panel-toggle-strip,
.right-panel {
  /* surface container, fallback: on surface at 12% over transparent */
  background: var(
    --dwv-surface-container,
    rgba(var(--v-theme-on-surface), 0.12)
  );
  border-left: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  text-align: left;
}

.right-panel-toggle-strip {
  padding: 4px 2px 0 2px;
}

.right-panel {
  position: relative;
  flex: none;
  /* clip, not hidden: focus cannot scroll it sideways and hide the handle */
  overflow: clip;
}
.right-panel:not(.open) {
  border-left: none;
}
.right-panel.resizing {
  user-select: none;
}

.right-panel-resize-handle {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 6px;
  z-index: 1;
  cursor: col-resize;
}
.right-panel-resize-handle:hover,
.right-panel-resize-handle:focus,
.right-panel.resizing .right-panel-resize-handle {
  background: rgb(var(--v-theme-primary));
  outline: none;
}

.right-panel-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.right-panel-header {
  flex: none;
  display: flex;
  justify-content: flex-end;
  padding: 4px 2px 0 0;
}

.right-panel-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 0 8px 8px 8px;
}

.right-panel-toggle {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: inherit;
  cursor: pointer;
}
.right-panel-toggle:hover {
  background: rgba(var(--v-theme-on-surface), 0.08);
}
</style>
