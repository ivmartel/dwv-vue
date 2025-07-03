# dwv-vue

Medical viewer using [DWV](https://github.com/ivmartel/dwv) (DICOM Web Viewer) and [Vue.js](https://vuejs.org/).

All coding/implementation contributions and comments are welcome. Releases should be ready for deployment otherwise download the code and install dependencies with a `yarn` or `npm` `install`.

dwv-vue is not certified for diagnostic use. Released under GNU GPL-3.0 license (see [license.txt](license.txt)).

[![Node.js CI](https://github.com/ivmartel/dwv-vue/actions/workflows/nodejs-ci.yml/badge.svg)](https://github.com/ivmartel/dwv-vue/actions/workflows/nodejs-ci.yml)

## Available Scripts

 - `ìnstall`: install dependencies
 - `dev`: serve with hot reload at localhost:5173
 - `lint`: run linting
 - `test`: run unit tests with hot reload
 - `build`: build for production

Unit tests use [Vitest](dev).

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
