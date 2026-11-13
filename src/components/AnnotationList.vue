<template>
  <ul
    v-if="state.groups.length !== 0"
    class="group-list"
  >
    <li
      v-for="group in state.groups"
      :key="group.dataId"
      class="group"
    >
      <div class="group-header">
        <span class="group-name">group #{{ group.dataId }}</span>
        <div class="actions">
          <button
            type="button"
            class="icon-button"
            title="Lock/unlock annotation group"
            :aria-pressed="String(!group.editable)"
            @click="annotService.setAnnotationGroupEditable(
              group.dataId, !group.editable)"
          >
            <v-icon
              :icon="group.editable ? 'lock_open' : 'lock'"
              size="18"
            />
          </button>
          <button
            type="button"
            class="icon-button"
            title="Save annotation group"
            @click="saveAnnotationGroup(group.dataId)"
          >
            <v-icon
              icon="save"
              size="18"
            />
          </button>
          <button
            type="button"
            class="icon-button"
            title="Show/hide annotation labels"
            :aria-pressed="String(!group.labelsVisible)"
            @click="annotService.setLabelsVisibility(
              group.dataId, !group.labelsVisible)"
          >
            <v-icon
              :icon="group.labelsVisible ? 'label' : 'label_off'"
              size="18"
            />
          </button>
        </div>
      </div>

      <ul class="annotation-list">
        <li
          v-for="annotation in group.annotations"
          :id="getAnnotationId(group.dataId, annotation.id)"
          :key="annotation.id"
          class="annotation"
          :class="{ selected: isSelected(group.dataId, annotation.id) }"
        >
          <button
            type="button"
            class="annotation-content"
            title="Go to annotation"
            @click="onAnnotationClick(group.dataId, annotation.id)"
          >
            <v-icon
              class="shape-icon"
              :icon="getShapeIcon(annotation.shapeName)"
              size="18"
            />
            <span
              class="annotation-label"
              :class="{ 'not-viewable': !annotation.canView }"
            >{{ annotation.label }}</span>
          </button>

          <div class="actions">
            <button
              type="button"
              class="icon-button"
              title="Show/hide quantification"
              :aria-pressed="String(isExpanded(group.dataId, annotation.id))"
              :aria-expanded="String(isExpanded(group.dataId, annotation.id))"
              :aria-controls="getDetailsId(group.dataId, annotation.id)"
              @click="toggleDetails(group.dataId, annotation.id)"
            >
              <v-icon
                icon="info"
                size="18"
              />
            </button>
            <input
              type="color"
              class="colour-input"
              title="Change annotation colour"
              :value="annotation.colour"
              :disabled="!group.editable"
              @change="annotService.changeAnnotationColour(
                group.dataId, annotation.id, $event.target.value)"
            >
            <button
              type="button"
              class="icon-button"
              title="Show/hide annotation"
              :aria-pressed="String(!annotation.visible)"
              @click="annotService.setAnnotationVisibility(
                group.dataId, annotation.id, !annotation.visible)"
            >
              <v-icon
                :icon="annotation.visible ? 'visibility' : 'visibility_off'"
                size="18"
              />
            </button>
            <button
              type="button"
              class="icon-button"
              title="Delete annotation"
              :disabled="!group.editable"
              @click="annotService.deleteAnnotation(
                group.dataId, annotation.id)"
            >
              <v-icon
                icon="delete"
                size="18"
              />
            </button>
          </div>

          <div
            v-if="isExpanded(group.dataId, annotation.id)"
            :id="getDetailsId(group.dataId, annotation.id)"
            class="details"
          >
            <template
              v-for="quantGroup in getQuantificationGroups(
                annotation.quantification)"
              :key="quantGroup.title"
            >
              <div class="quantification-group">
                <div class="quantification-title">
                  {{ quantGroup.title }}
                </div>
                <dl class="quantification">
                  <div
                    v-for="item in quantGroup.items"
                    :key="item.label"
                    :title="item.label"
                  >
                    <dt>{{ item.shortLabel }}</dt>
                    <dd>{{ item.value }}</dd>
                  </div>
                </dl>
              </div>
            </template>
            <div
              v-if="getQuantificationGroups(annotation.quantification)
                .length === 0"
              class="empty"
            >
              No quantification
            </div>
          </div>
        </li>
        <li
          v-if="group.annotations.length === 0"
          class="empty"
        >
          No annotation
        </li>
      </ul>
    </li>
  </ul>
</template>

<script setup>
// Annotation list, see doc/design/annotationList.md
import { inject, nextTick, onMounted, onUnmounted, reactive, shallowRef, watch } from 'vue'
import { getQuantificationGroups } from '../services/quantification.js'
import { getShapeIcon } from './shapeIcons.js'

const annotService = inject('AnnotationService')

// annotation service state
const state = shallowRef(annotService.getSnapshot())
let unsubscribe
onMounted(() => {
  unsubscribe = annotService.subscribe(() => {
    state.value = annotService.getSnapshot()
  })
  // in case it changed before mount
  state.value = annotService.getSnapshot()
  annotService.addEventListener('error', onServiceError)
})
onUnmounted(() => {
  unsubscribe?.()
  annotService.removeEventListener('error', onServiceError)
})

function onServiceError(event) {
  alert(event.detail.error.message)
}

// element ids, prefixed with the viewer id
const viewerId = inject('viewerId')
function getAnnotationId(dataId, annotationId) {
  return `${viewerId}-annotationgroup${dataId}-annotation${annotationId}`
}
function getDetailsId(dataId, annotationId) {
  return `${viewerId}-qd-annotationgroup${dataId}-annotation${annotationId}`
}

// selection
function isSelected(dataId, annotationId) {
  const selected = state.value.selected
  return selected?.dataId === dataId &&
    selected?.annotationId === annotationId
}
watch(() => state.value.selected, async (selected) => {
  if (typeof selected === 'undefined') {
    return
  }
  await nextTick()
  document.getElementById(
    getAnnotationId(selected.dataId, selected.annotationId)
  )?.scrollIntoView({ block: 'nearest' })
})

function onAnnotationClick(dataId, annotationId) {
  annotService.selectAnnotation(dataId, annotationId)
  annotService.gotoAnnotation(dataId, annotationId)
}

// quantification details: local view state
const expanded = reactive(new Set())
function isExpanded(dataId, annotationId) {
  return expanded.has(getAnnotationId(dataId, annotationId))
}
function toggleDetails(dataId, annotationId) {
  const id = getAnnotationId(dataId, annotationId)
  if (expanded.has(id)) {
    expanded.delete(id)
  } else {
    expanded.add(id)
  }
}
// forget removed annotations
watch(() => state.value.groups, (groups) => {
  const ids = new Set(groups.flatMap((group) => group.annotations.map(
    (annotation) => getAnnotationId(group.dataId, annotation.id))))
  for (const id of expanded) {
    if (!ids.has(id)) {
      expanded.delete(id)
    }
  }
})

// save as DICOM SR
function saveAnnotationGroup(dataId) {
  // failure is reported by the service as an error event
  const blob = annotService.getAnnotationGroupAsDicom(dataId)
  if (typeof blob === 'undefined') {
    return
  }
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `dicom-sr-${dataId}.dcm`
  link.click()
  URL.revokeObjectURL(link.href)
}
</script>

<style scoped>
ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.group-list {
  /* medium body text */
  font-size: 0.875rem;
  line-height: 1.25rem;
  font-weight: 400;
}

.group + .group {
  margin-top: 8px;
}

.group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
}
.group-name {
  /* large label text */
  font-size: 0.875rem;
  line-height: 1.25rem;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.actions {
  flex: none;
  display: flex;
  align-items: center;
}

.icon-button {
  width: 28px;
  height: 28px;
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
.icon-button:enabled:hover {
  background: rgba(var(--v-theme-on-surface), 0.08);
}
.icon-button:disabled {
  opacity: var(--v-disabled-opacity);
  cursor: default;
}
.icon-button[aria-pressed="true"] {
  /* primary container */
  background: rgba(var(--v-theme-primary), 0.16);
  color: rgb(var(--v-theme-primary));
}

.annotation-list {
  padding-left: 8px;
}

.annotation {
  --row-background: rgb(var(--v-theme-surface-bright));
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  margin-top: 4px;
  border-radius: 4px;
  background: var(--row-background);
  color: rgb(var(--v-theme-on-surface));
}
.annotation:hover {
  background: color-mix(
    in srgb, var(--row-background) 92%, rgb(var(--v-theme-on-surface)));
}
.annotation.selected {
  /* secondary container */
  --row-background: color-mix(
    in srgb, rgb(var(--v-theme-secondary)) 24%,
    rgb(var(--v-theme-surface-bright)));
}
/* the dark theme surface bright is too light for a row background */
@media (prefers-color-scheme: dark) {
  .annotation {
    --row-background: rgb(var(--v-theme-surface-light));
  }
  .annotation.selected {
    --row-background: color-mix(
      in srgb, rgb(var(--v-theme-secondary)) 24%,
      rgb(var(--v-theme-surface-light)));
  }
}

.annotation-content {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px;
  border: none;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}
.shape-icon {
  flex: none;
}
.annotation-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.annotation-label.not-viewable {
  text-decoration: line-through;
}

.colour-input {
  width: 20px;
  height: 20px;
  margin: 0 4px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
}
.colour-input:disabled {
  opacity: var(--v-disabled-opacity);
  cursor: default;
}

.details {
  flex-basis: 100%;
  padding: 0 8px 4px 8px;
  /* small body text */
  font-size: 0.75rem;
  line-height: 1rem;
}
.quantification-group + .quantification-group {
  margin-top: 4px;
}
.quantification-title {
  /* medium label text */
  font-size: 0.75rem;
  line-height: 1rem;
  font-weight: 500;
}
.quantification {
  display: flex;
  flex-wrap: wrap;
  column-gap: 12px;
  margin: 0;
}
.quantification > div {
  display: flex;
  gap: 4px;
}
.quantification dt {
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
  opacity: 0.7;
  font-size: 0.9em;
}
.quantification dd {
  margin: 0;
}

.empty {
  font-style: italic;
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
}
.annotation-list > .empty {
  margin-top: 4px;
}
</style>
