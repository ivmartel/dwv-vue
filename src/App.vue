<template>
  <div id="app">
    <dwvVue/>
  </div>
</template>

<script>
import dwvVue from './components/dwv'

export default {
  name: 'App',
  components: {
    dwvVue
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 100%;
}
</style>
