# AGENTS.md

Guidance for coding agents working in this repository.

## Project overview

Medical (DICOM) image viewer component built on
[DWV](https://github.com/ivmartel/dwv), Vue 3 and Vuetify, bundled with Vite.
Shipped with a demo application. 
Not certified for diagnostic use. License: GPL-3.0.

The main deliverable is the npm package
providing the `DicomView` component (see [Library package](#library-package));
the repository also contains a demo app that uses it, deployed to GitHub
Pages. The library only exposes what consumers need.

## Requirements

- Viewer inputs:
  - `uri` (string, watched): URI with search arguments describing the data
    to load (for ex. `https://www.demo.com/index.html?input=file.dcm`, see
    the dwv `App.loadFromUri` method),
  - `urls` (string, watched): white space separated urls of the data to load,
  - `loadFromWindowLocation` (boolean, default false): use the window
    location as input URI if it has search arguments,
  - `showLegend` (boolean, default false): show the footer legend
    ("Powered by" dwv and Vue.js, with their versions).

  The data inputs are checked in order `uri`, `urls`, then
  `loadFromWindowLocation`; the first one that is set is used. `uri` and
  `urls` are watched: when one changes to a new value, it is loaded on top
  of the existing data (`loadFromWindowLocation` is only read on init).
- Toolbar: load progress, the dwv tools (scroll, zoom and pan, window level
  with presets, draw with shapes), reset, orientation toggle and
  DICOM tags dialog. Tools are disabled until data is loaded and when they
  cannot run on it (for ex. window level on colour images).
- Image window: renders the loaded data with dwv and its overlays; data is
  loaded from the viewer inputs, or by drag and drop or file selection
  (local files) through a drop box shown while no data is loaded. It refits
  when its size changes (window resize, right panel opened, closed or
  resized).
- Annotation list: in the right panel, lists the annotation groups and their
  annotations and lets the user navigate to, inspect and edit them, and save
  a group as DICOM SR. It only displays the annotation state, every action
  goes through the annotation service.
- Several viewers must work on the same page:
  - each viewer owns its own dwv app and state, no global singletons for
    viewer state,
  - HTML element ids are built from a unique viewer id
    (e.g. `<viewerId>-layerGroup`),
  - DOM queries are done within the viewer root element 
    rather than `document`,
  - dialogs are attached to their viewer context.

## Design specs

Component behaviour and style are described in framework-agnostic design
specs (`doc/design/`: purpose, placement, data, structure, actions,
accessibility). Read the spec before changing a component and update it in
the same change; add one for any significant new component. The viewer is
modelled on [dwv-simplistic](https://github.com/ivmartel/dwv-simplistic);
some modules are ports of it (see the notes at the top of files and the
specs): keep their behaviour aligned unless the spec says otherwise, and
look there for reference behaviour when adding features.

## Architecture

- **Services hold the logic, components display state.** `DicomView.vue`
  creates one `DwvAppService` and one `AnnotationService` per viewer and
  shares them with `provide('DwvAppService', ...)` /
  `provide('AnnotationService', ...)`. Child components get them with
  `inject(...)`. Do not create services in child components and do not call
  the dwv `App` directly from components. Services keep their state private
  and expose it read only: components never mutate it (for ex. the plain data
  annotation state of `AnnotationService`), every change goes through a
  service method.
- Services extend `EventTarget` and notify changes with `CustomEvent`s
  (`DwvAppService` re-dispatches the dwv app events and adds its own);
  components subscribe on mount and unsubscribe on unmount.
- `DicomView.vue` creates the viewer id with `useId()`, passes it to
  `DwvAppService` and provides it as `'viewerId'`; components get it with
  `inject('viewerId')`, without a fallback: components are always mounted
  inside a `DicomView`. Element ids are `<viewerId>-<name>`, never
  hard-coded. Only add an id when something references it
  (`getElementById`, `<label for>`, `aria-controls`, dwv's layer group...).

## Commands

Package manager is Yarn 4 (via corepack). Do not use npm to add packages.

| Task | Command |
| --- | --- |
| Install | `yarn install` |
| Demo app dev server (localhost:5173) | `yarn run dev` |
| Lint | `yarn run lint` |
| Unit tests (watch) | `yarn run test` |
| Unit tests (single run + coverage, as CI) | `yarn run test-ci` |
| Demo app build (to `dist/dwv-vue-app/`) | `yarn run build` |
| Library build (to `dist/dwv-vue-lib/`) | `yarn run build-lib` |

Before considering a change done, run `yarn run lint` and `yarn run test-ci`;
CI (`.github/workflows/nodejs-ci.yml`) runs both, then builds.

## Layout

```text
src/
├─ index.js              Library entry point (exports DicomView)
├─ main.js               Demo app: Vue app + Vuetify setup (Material Design icons)
├─ App.vue
├─ components/
│  ├─ DicomView.vue      Root view: creates and provides the services
│  ├─ DwvHeader.vue      Toolbar (load, tools, reset...)
│  ├─ DwvContent.vue     Image layer group (dwv rendering target)
│  ├─ DwvFooter.vue      Versions / legal
│  ├─ RightPanel.vue     Foldable, resizable side panel (generic container)
│  ├─ AnnotationList.vue Annotation groups list, inside RightPanel
│  ├─ TagsTable.vue      DICOM tags dialog
│  └─ *.js               Small helpers (panelWidth, shapeIcons)
└─ services/
   ├─ dwvAppService.js     Wraps the dwv App; EventTarget emitting app events
   ├─ annotationService.js Annotation state and actions on top of DwvAppService
   ├─ overlays.js          Overlay configuration
   └─ quantification.js    Quantification formatting
doc/design/              Design specs (one per component)
plugins/
└─ dwvWorkers.js         Vite plugin serving / emitting the dwv web workers
                         (node code, exported as 'dwv-vue/vite-plugin')
vite.config.js           Demo app build
vite.lib.config.js       Library build
tsconfig.lib.json        Library type declarations (generated from the JS)
```

## Code style

- ESLint flat config: `@eslint/js` recommended + `eslint-plugin-vue`
  `flat/recommended`.
- New components use `<script setup>`; older ones use `setup()` in an options
  object. Don't convert existing files unless asked.
- Services are ES classes with private (`#`) fields and JSDoc on public
  members and types (`@typedef` for state shapes).
- 2-space indentation, single quotes.
- UI uses Vuetify components and Material Design icon names.

## Tests

- Vitest with `jsdom`, globals enabled, Vuetify inlined (`vitest.config.js`).
- Tests sit next to the code: `Foo.vue` → `Foo.test.js`.
- Component tests mount with `@vue/test-utils` and a real Vuetify instance
  (`createVuetify({ components, directives })`); provide stub services and
  a `viewerId` (e.g. `'viewer0'`) via `global.provide` when the component
  injects them.
- Add or update tests with any behaviour change.

## dwv specifics

- `dwv` is pinned to an exact version in `package.json`.
- dwv web workers are not picked up by Vite: dwv loads them from
  `assets/workers/` relative to the page base url. The `dwvWorkers` Vite
  plugin (`plugins/dwvWorkers.js`, used by `vite.config.js`) serves them
  from the installed dwv package in dev and emits them in the build: do not
  copy them into `public/`.

## Builds and deploy

- `build-app-trunk` / `build-app-stable` set the base path for GitHub Pages. CI
  deploys `main` to `demo/trunk` and `vX.Y.Z` tags to `demo/stable` on the
  `gh-pages` branch. Don't change these paths without updating the workflow.

## Library package

- The npm package is the library build only: `src/index.js` bundled by
  `vite.lib.config.js` into `dist/dwv-vue-lib/` (`dwv-vue.js` +
  `style.css`), `prepack` builds it, plus `plugins/dwvWorkers.js` as is
  (`dwv-vue/vite-plugin`). `main.js`, `App.vue`, `style.css` and `public/`
  are the demo app and are not packaged.
- `vue` and `vuetify` are peer dependencies (the host app provides them and
  installs Vuetify with its components and the `md` iconset); `dwv` is a
  dependency. All three are external in the bundle: keep the externals in
  `vite.lib.config.js` in sync with `package.json`.
- Type declarations are generated, never hand-written: `build-lib` runs
  `build-types` (`vue-tsc -p tsconfig.lib.json`) after the bundle, from the
  JavaScript sources and their JSDoc, into `dist/dwv-vue-lib/types/`
  (`package.json` `types` / `exports` point there). Public props and
  functions need precise types for this: use JSDoc (for ex.
  `/** @type {import('vue').PropType<string[]>} */ (Array)` for a prop),
  not loose `object` / `Array`. `typescript` stays below 7 until vue-tsc
  (Volar) supports it.
- The public API is documented in the README "Use as a library" section
  (setup, `DicomView` properties, web workers): update it when the API or
  the host app requirements change.
