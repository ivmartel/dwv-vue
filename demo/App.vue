<script setup>
import { DwvViewer } from '../src/index.js'
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
