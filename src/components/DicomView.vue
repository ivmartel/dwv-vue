<template>
  <div class="dwv">
    <DwvHeader />
    <div class="main">
      <DwvContent class="view" />
      <RightPanel>
        <AnnotationList />
      </RightPanel>
    </div>
    <DwvFooter v-if="showLegend" />
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
     * White space separated list of data urls to load,
     *   for ex: 'https://host/a.dcm https://host/b.dcm'.
     */
    urls: {
      type: String,
      default: undefined
    },
    /**
     * Load data from the window location (page url) on mount.
     */
    loadFromWindowLocation: {
      type: Boolean,
      default: false
    },
    /**
     * Show the footer legend (dwv and Vue.js versions).
     */
    showLegend: {
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
    // load data: the first set input in order uri, urls, window location,
    // on mount and when uri or urls change
    const hasUri = (uri) => !!uri
    // urls: white space separated list to array
    const splitUrls = (urls) => urls ? urls.split(/\s+/).filter(
      (item) => item !== '') : []
    onMounted(() => {
      if (hasUri(props.uri)) {
        dwvAppService.loadFromUri(props.uri)
      } else if (splitUrls(props.urls).length !== 0) {
        dwvAppService.loadURLs(splitUrls(props.urls))
      } else if (props.loadFromWindowLocation) {
        dwvAppService.loadFromUri(window.location.href)
      }
    })
    watch(() => props.uri, (uri) => {
      if (hasUri(uri)) {
        dwvAppService.loadFromUri(uri)
      }
    })
    watch(() => props.urls, (urls) => {
      // uri takes precedence
      const list = splitUrls(urls)
      if (list.length !== 0 && !hasUri(props.uri)) {
        dwvAppService.loadURLs(list)
      }
    })
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
