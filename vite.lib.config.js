import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Library build: 'yarn run build-lib'
// (the demo app uses vite.config.js)
export default defineConfig({
  plugins: [vue()],
  build: {
    outDir: 'dist/dwv-vue-lib',
    // the public folder (icons, workers...) is for the demo app
    copyPublicDir: false,
    lib: {
      entry: 'src/index.js',
      formats: ['es'],
      fileName: 'dwv-vue',
      cssFileName: 'style'
    },
    rolldownOptions: {
      // provided by the host app (peer dependencies) or
      // installed with the package (dependencies)
      external: [/^vue($|\/)/, /^vuetify($|\/)/, /^dwv($|\/)/]
    }
  }
})
