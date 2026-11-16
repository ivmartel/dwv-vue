# AGENTS.md

Guidance for coding agents working on dwv-vue: a medical image viewer
component library built with [DWV](https://github.com/ivmartel/dwv), Vue 3
and Vuetify, bundled with Vite. The main deliverable is the npm package
providing the `DicomView` component (see [Library package](#library-package));
the repository also contains a demo app that uses it, deployed to GitHub
Pages. Not certified for diagnostic use. Licence: GPL-3.0.

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

## Architecture

- **Services hold the logic, components display state.** `DicomView.vue`
  creates one `DwvAppService` and one `AnnotationService` per viewer and
  shares them with `provide('DwvAppService', ...)` /
  `provide('AnnotationService', ...)`. Child components get them with
  `inject(...)`. Do not create services in child components and do not call
  the dwv `App` directly from components.
- Services extend `EventTarget` and notify changes with `CustomEvent`s;
  components subscribe on mount and unsubscribe on unmount.
- Annotation state exposed by `AnnotationService` is plain data: components
  must not mutate it, every change goes through a service method.
- Element ids must be unique in the page (several viewers may be on one
  page): prefix them with the viewer id, `<viewerId>-<name>`, never hard-code
  them. `DicomView.vue` creates the viewer id with `useId()`, passes it to
  `DwvAppService` and provides it as `'viewerId'`; components get it with
  `inject('viewerId')`, without a fallback: components are always mounted
  inside a `DicomView`. Only add an id when something references it
  (`getElementById`, `<label for>`, `aria-controls`, dwv's layer group...).
- Several modules are ports of
  [dwv-simplistic](https://github.com/ivmartel/dwv-simplistic) (see the notes
  at the top of files and the design docs). Keep behaviour aligned with the
  referenced source unless the design doc says otherwise.

## Design docs

`doc/design/*.md` are the specs for components (purpose, placement, data,
structure, actions, accessibility). When changing a component's behaviour,
update its design doc in the same change; when adding a significant
component, add a spec following the same structure.

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
- Only export from `src/index.js` what is meant as public API.
- The public API is documented in the README "Use as a library" section
  (setup, `DicomView` properties, web workers): update it when the API or
  the host app requirements change.
