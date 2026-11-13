# dwv-vue

Medical image viewer component for [Vue.js](https://vuejs.org/), using [DWV](https://github.com/ivmartel/dwv) (DICOM Web Viewer).

dwv-vue is mainly an npm package that provides a `DicomView` component to add a medical image viewer to your Vue app (see [Use as a library](#use-as-a-library)). The repository also contains a demo app that uses it, deployed at [stable](https://ivmartel.github.io/dwv-vue/demo/stable/) and [trunk](https://ivmartel.github.io/dwv-vue/demo/trunk/) (see [Steps to run the viewer from scratch](#steps-to-run-the-viewer-from-scratch) to run it locally).

All coding/implementation contributions and comments are welcome.

dwv-vue is not certified for diagnostic use. Released under GNU GPL-3.0 license (see [license.txt](license.txt)).

[![Node.js CI](https://github.com/ivmartel/dwv-vue/actions/workflows/nodejs-ci.yml/badge.svg)](https://github.com/ivmartel/dwv-vue/actions/workflows/nodejs-ci.yml)

## Use as a library

dwv-vue is available as an npm package that provides the `DicomView` Vue component.

```sh
yarn add dwv-vue vue vuetify
```

`vue` (3.5+) and `vuetify` (4) are peer dependencies: your app provides them. `dwv` is installed
with the package.

### Setup

The viewer uses [Vuetify](https://vuetifyjs.com) components and its Material Design icons:
register Vuetify with its components and the `md` iconset, and load the Material Icons font,
for example in your `index.html`:

```html
<link href="https://fonts.googleapis.com/css?family=Material+Icons" rel="stylesheet">
```

```js
import { createApp } from 'vue'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, md } from 'vuetify/iconsets/md'

// dwv-vue styles
import 'dwv-vue/style.css'

import App from './App.vue'

const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'md',
    aliases,
    sets: { md }
  }
})

createApp(App).use(vuetify).mount('#app')
```

Then use the component, several viewers can be on the same page:

```vue
<script setup>
import { DicomView } from 'dwv-vue'
</script>

<template>
  <div style="height: 600px">
    <DicomView :urls="['https://example.com/data/image.dcm']" />
  </div>
</template>
```

The viewer takes its height from its parent element: give it one.

### Properties

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `uri` | `String` | | URI with a dwv `input` query parameter, for example `https://host/?input=https%3A%2F%2Fhost%2Fdata.dcm` |
| `urls` | `String[]` | | List of data urls to load |
| `load-from-window-location` | `Boolean` | `false` | Load the data given in the page url (`?input=...`) |

The data is loaded when the viewer is mounted and when `uri` or `urls` change. Data can also be
loaded via drag and drop or the file input of the viewer.

### Web workers

dwv decodes compressed data (JPEG, JPEG 2000, RLE...) in web workers that it loads from
`assets/workers/` relative to the page base url. Your app needs to serve them there: copy them from
the dwv package, for example in a Vite app:

```sh
mkdir -p public/assets/workers
cp node_modules/dwv/dist/assets/workers/* public/assets/workers/
```

Copy them again when the dwv version changes.

## Available Scripts

 - `install`: install dependencies
 - `dev`: serve the demo app with hot reload at localhost:5173
 - `lint`: run linting
 - `test`: run unit tests with hot reload
 - `test-ci`: run unit tests once with coverage (as the CI)
 - `build`: build the demo app to `dist/dwv-vue-app`
 - `build-app-trunk`, `build-app-stable`: build the demo app for the GitHub pages deployment
 - `build-lib`: build the library to `dist/dwv-vue-lib` (also run by `yarn pack`)
 - `preview`: serve the built demo app

Unit tests use [Vitest](https://vitest.dev).

This project was generated with [vite](https://vitejs.dev) version 5.2.0.

For a detailed explanation on how things work, check out the [vite guide](https://vitejs.dev/guide/).

## Steps to run the viewer from scratch

```sh
# get the code
git clone https://github.com/ivmartel/dwv-vue.git

# move to its folder
cd dwv-vue

# install dependencies
yarn install

# call the start script to launch the viewer on a local server
yarn run dev
```

You can now open a browser at http://localhost:5173 and enjoy!

## DWVs' Web workers
Web workers used in dwv do not get automatically imported in the dev environment or build,
they need to be available in the `public/assets` folder. Do not forget to update them if they are
changed when updating dwv.

Note: vite can process a worker creation and add it to the `dist` assets if it is created with
`new Worker(new URL('./worker.js, import.meta.url))`. But webpack modifies this creation
when creating the dwv bundle... See the webpack [issue](https://github.com/webpack/webpack/issues/12719).
The vite processing works only for build (`yarn run build && yarn run preview`), but not for
dev... The only way I got it to work is by copying the workers to the deps cache folder:
`cp node_modules/dwv/dist/*worker* node_modules/.vite/deps`.
