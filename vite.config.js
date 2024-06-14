import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      includeAssets: ['favicon.ico'],
      manifest: {
        name: "dwv-vue",
        short_name: "dwv-vue",
        display: "standalone",
        background_color: "#000000",
        theme_color: "#4DBA87",
        scope: ".",
        start_url: "index.html",
        icons: [
          {
            src: "img/icons/icon-16.png",
            sizes: "16x16",
            type: "image/png"
          },
          {
            src: "img/icons/icon-32.png",
            sizes: "32x32",
            type: "image/png"
          },
          {
            src: "img/icons/icon-64.png",
            sizes: "64x64",
            type: "image/png"
          },
          {
            src: "img/icons/icon-128.png",
            sizes: "128x128",
            type: "image/png"
          },
          {
            src: "img/icons/icon-256.png",
            sizes: "256x256",
            type: "image/png"
          },
          {
            src: "img/icons/icon-512.png",
            sizes: "512x512",
            type: "image/png"
          }
        ]
      }
    })
  ],
})
