<template>
  <div id="app">
    <dwvVue />
  </div>
</template>

<script>
import dwvVue from './components/dwv'

export default {
  name: 'app',
  components: {
    dwvVue
  }
}
</script>

<style>
@import '../node_modules/vue-material/dist/theme/default.css'
  (prefers-color-scheme: light);
@import '../node_modules/vue-material/dist/theme/default-dark.css'
  (prefers-color-scheme: dark);

#app {
  text-align: center;
  height: 100vh;
}
</style>
