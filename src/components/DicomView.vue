<template>
  <div class="dwv">
    <DwvHeader />
    <DwvContent class="content" />
    <DwvFooter />
  </div>
</template>

<script>
// import
import { inject } from 'vue'
import DwvHeader from './DwvHeader.vue'
import DwvContent from './DwvContent.vue'
import DwvFooter from './DwvFooter.vue'

export default {
  components: {
    DwvHeader,
    DwvContent,
    DwvFooter
  },
  data() {
    const dwvService = inject('DwvService')
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
.content {
  /* occupy space left (others should be default:0) */
  flex-grow: 1;
}
</style>
