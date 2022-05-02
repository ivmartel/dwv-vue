# dwv-vue

Medical viewer using [DWV](https://github.com/ivmartel/dwv) (DICOM Web Viewer) and [Vue.js](https://vuejs.org/).

All coding/implementation contributions and comments are welcome. Releases should be ready for deployment otherwise download the code and install dependencies with a `yarn` or `npm` `install`.

dwv-vue is not certified for diagnostic use. Released under GNU GPL-3.0 license (see [license.txt](license.txt)).

[![Node.js CI](https://github.com/ivmartel/dwv-vue/actions/workflows/nodejs-ci.yml/badge.svg)](https://github.com/ivmartel/dwv-vue/actions/workflows/nodejs-ci.yml)

## Available Scripts

 - `ìnstall`: install dependencies
 - `start`: serve with hot reload at localhost:8080
 - `lint`: run linting
 - `test`: run unit tests with hot reload
 - `e2e`: run e2e tests
 - `build`: build for production

Unit tests use [Jest](https://facebook.github.io/jest/) and e2e tests [Nightwatch.js](http://nightwatchjs.org/).

This project was generated with the [vue-cli](https://github.com/vuejs/vue-cli) version 3.0.1.

For a detailed explanation on how things work, check out the [vue-cli doc](https://cli.vuejs.org/).

## Steps to run the viewer from scratch

```sh
# get the code
git clone https://github.com/ivmartel/dwv-vue.git

# move to its folder
cd dwv-vue

# install dependencies
yarn install

# call the start script to launch the viewer on a local server
yarn run start
```

You can now open a browser at http://localhost:8080 and enjoy!
