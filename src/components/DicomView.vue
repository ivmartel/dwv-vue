<template>
  <div class="dwv">
    <DwvHeader />
    <div class="main">
      <DwvContent class="view" />
      <RightPanel>
        <AnnotationList />
      </RightPanel>
    </div>
    <DwvFooter />
  </div>
</template>

<script>
// import
import { onMounted, onUnmounted, provide, useId, watch } from 'vue'
import { DwvAppService } from '../services/dwvAppService.js'
import { AnnotationService } from '../services/annotationService.js'
import DwvHeader from './DwvHeader.vue'
import DwvContent from './DwvContent.vue'
import DwvFooter from './DwvFooter.vue'
import RightPanel from './RightPanel.vue'
import AnnotationList from './AnnotationList.vue'

export default {
  components: {
    DwvHeader,
    DwvContent,
    DwvFooter,
    RightPanel,
    AnnotationList
  },
  props: {
    /**
     * URI to load data from, with a dwv 'input' query parameter,
     *   for ex: 'https://host/?input=https%3A%2F%2Fhost%2Fdata.dcm'.
     */
    uri: {
      type: String,
      default: undefined
    },
    /**
     * List of data urls to load.
     */
    urls: {
      type: Array,
      default: undefined
    },
    /**
     * Load data from the window location (page url) on mount.
     */
    loadFromWindowLocation: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    // viewer id: unique in the page, used as html id prefix
    const viewerId = useId()
    provide('viewerId', viewerId)
    // services shared with child components
    const dwvAppService = new DwvAppService(viewerId)
    const annotService = new AnnotationService(dwvAppService)
    annotService.connect()
    provide('DwvAppService', dwvAppService)
    provide('AnnotationService', annotService)
    // load data: on mount and when the inputs change
    const loadUri = (uri) => {
      if (uri) {
        dwvAppService.loadFromUri(uri)
      }
    }
    const loadUrls = (urls) => {
      if (urls && urls.length !== 0) {
        dwvAppService.loadURLs(urls)
      }
    }
    onMounted(() => {
      if (props.loadFromWindowLocation) {
        loadUri(window.location.href)
      }
      loadUri(props.uri)
      loadUrls(props.urls)
    })
    watch(() => props.uri, loadUri)
    watch(() => props.urls, loadUrls)
    // release the services (children are unmounted before)
    onUnmounted(() => {
      annotService.dispose()
      dwvAppService.dispose()
    })
  },
}
</script>

<style scoped>
.dwv {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.main {
  /* occupy space left (others should be default:0) */
  flex-grow: 1;
  min-height: 0;
  display: flex;
}
.view {
  /* image view takes the width left by the right panel */
  flex: 1;
  min-width: 0;
}
</style>
