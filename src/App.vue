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
#app {
  text-align: center;
  height: 100vh;
}
</style>
