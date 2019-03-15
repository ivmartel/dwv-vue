# dwv-vue

Medical viewer using [DWV](https://github.com/ivmartel/dwv) (DICOM Web Viewer) and [Vue.js](https://vuejs.org/).

All coding/implementation contributions and comments are welcome. Releases should be ready for deployment otherwise download the code and install dependencies with a `yarn` or `npm` `install`.

dwv-vue is not certified for diagnostic use. Released under GNU GPL-3.0 license (see [license.txt](license.txt)).

[![Build Status](https://travis-ci.org/ivmartel/dwv-vue.svg?branch=master)](https://travis-ci.org/ivmartel/dwv-vue)

## Steps to run the viewer from scratch

Get the code:
```sh
git clone https://github.com/ivmartel/dwv-vue.git
```

Move to its folder:
```sh
cd dwv-vue
```

Install dependencies (using `yarn`, replace with `npm` if you prefer):
```sh
yarn install
```

Call the start script to launch the viewer on a local server:
```sh
yarn run start
```

You can now open a browser at http://localhost:8080 and enjoy!

## Available Scripts

``` bash
# install dependencies
yarn install

# serve with hot reload at localhost:8080
yarn run start

# run linting
yarn run lint

# run unit tests with hot reload
yarn run test

# run e2e tests
yarn run e2e

# build for production
yarn run build
```

Unit tests use [Jest](https://facebook.github.io/jest/) and e2e tests [Nightwatch.js](http://nightwatchjs.org/).

This project was generated with the [vue-cli](https://github.com/vuejs/vue-cli) version 3.0.1.

For a detailed explanation on how things work, check out the [vue-cli doc](https://cli.vuejs.org/).
