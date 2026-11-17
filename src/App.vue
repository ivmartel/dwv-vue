<script setup>
import DwvViewer from './components/DwvViewer.vue'
</script>

<template>
  <DwvViewer
    load-from-window-location
    show-legend
  />
</template>

<style>
#app {
  font-family: Arial, Helvetica, sans-serif;
  text-align: center;
  height: 100vh;
}
</style>
