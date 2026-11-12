import { createApp } from 'vue'
import './style.css'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, md } from 'vuetify/iconsets/md'

import { DwvService } from './services/dwv.service.js';
import { AnnotationService } from './services/AnnotationService.js';

import App from './App.vue'

const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'md',
    aliases,
    sets: {
      md,
    },
  },
})

const app = createApp(App)
const dwvService = new DwvService()
const annotService = new AnnotationService(dwvService)
annotService.connect()
app.provide('DwvService', dwvService)
app.provide('AnnotationService', annotService)
app.use(vuetify)
app.mount('#app')
