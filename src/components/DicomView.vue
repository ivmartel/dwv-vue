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
import { provide } from 'vue'
import { DwvService } from '../services/dwv.service.js'
import { AnnotationService } from '../services/AnnotationService.js'
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
    // services shared with child components
    const dwvService = new DwvService()
    const annotService = new AnnotationService(dwvService)
    annotService.connect()
    provide('DwvService', dwvService)
    provide('AnnotationService', annotService)
    return {
      dwvService,
    }
  },
  mounted() {
    // possible load from location
    this.dwvService.loadFromUri(window.location.href)
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
