import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'

import 'vue-material/dist/vue-material.min.css'

Vue.config.productionTip = false

new Vue({
  render: h => h(App)
}).$mount('#app')
