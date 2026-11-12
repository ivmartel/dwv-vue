<template>
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
</template>

<script>
// import
import { version, inject } from 'vue'

export default {
  data() {
    const dwvAppService = inject('DwvAppService')

    return {
      versions: {
        dwv: dwvAppService.getDwvVersion(),
        vue: version
      }
    }
  }
}
</script>

<style scoped>
/* host */
.footer {
  text-align: center;
  font-size: 8pt;
  margin: 1em;
}
</style>
