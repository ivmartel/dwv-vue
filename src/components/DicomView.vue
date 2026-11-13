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
import { onUnmounted, provide, useId } from 'vue'
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
  setup() {
    // viewer id: unique in the page, used as html id prefix
    const viewerId = useId()
    provide('viewerId', viewerId)
    // services shared with child components
    const dwvAppService = new DwvAppService(viewerId)
    const annotService = new AnnotationService(dwvAppService)
    annotService.connect()
    provide('DwvAppService', dwvAppService)
    provide('AnnotationService', annotService)
    // release the services (children are unmounted before)
    onUnmounted(() => {
      annotService.dispose()
      dwvAppService.dispose()
    })
    return {
      dwvAppService,
    }
  },
  mounted() {
    // possible load from location
    this.dwvAppService.loadFromUri(window.location.href)
  },
}
</script>

<style>
.dwv {
  height: 90%;
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
