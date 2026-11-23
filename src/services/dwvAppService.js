import {
  App,
  AppOptions,
  ViewConfig,
  ToolConfig,
  getDwvVersion,
  getURLsFromKeyValueUri
} from 'dwv';
import { overlayConfig } from './overlays';

/**
 * DWV service.
 */
export class DwvAppService extends EventTarget {
  /**
   * List of annotation shape names.
   *
   * @type {string[]}
   */
  #shapeNames = [
    'Ruler',
    'Arrow',
    'Rectangle',
    'Circle',
    'Ellipse',
    'Protractor',
    'Roi'
  ];

  /**
   * List of tools.
   *
   * @type {object}
   */
  #tools = {
    Scroll: new ToolConfig(),
    ZoomAndPan: new ToolConfig(),
    WindowLevel: new ToolConfig(),
    Draw: new ToolConfig(this.#shapeNames),
  };
  /**
   * List of tool names.
   *
   * @type {string[]}
   */
  #toolNames = Object.keys(this.#tools);

  /**
   * Can scroll flag.
   *
   * @type {boolean}
   */
  #canScroll = false;
  /**
   * Can window level flag.
   *
   * @type {boolean}
   */
  #canWindowLevel = false;

  /**
   * Orientation name.
   *
   * @type {string}
   */
  #orientation;

  /**
   * Viewer id, unique in the page, used as html id prefix.
   *
   * @type {string}
   */
  #viewerId;

  /**
   * Id of the html div of the main layer group.
   *
   * @type {string}
   */
  #layerGroupDivId;

  /**
   * DWV app.
   *
   * @type {App}
   */
  #dwvApp = new App();

  /**
   * Meta data of the loaded data.
   *
   * @type {object}
   */
  #metaData;

  /**
   * List of preset names: set after first render.
   *
   * @type {string[]}
   */
  #presetNames = [];

  /**
   * @param {string} viewerId The viewer id, unique in the page,
   *   used as html id prefix.
   */
  constructor(viewerId) {
    super();

    // initialise app
    this.#viewerId = viewerId;
    this.#layerGroupDivId = viewerId + '-layerGroup';
    const appOptions = new AppOptions(this.#getViewConfigs());
    appOptions.tools = this.#tools;
    appOptions.overlayConfig = overlayConfig;
    this.#dwvApp.init(appOptions);
    // setup listeners
    this.#setupLoadListeners();
    this.#setupListeners();
  }

  /**
   * Get the DWV version.
   *
   * @returns {string} The version.
   */
  getDwvVersion() {
    return getDwvVersion();
  }

  /**
   * Get the viewer id, unique in the page, used as html id prefix.
   *
   * @returns {string} The viewer id.
   */
  getViewerId() {
    return this.#viewerId;
  }

  /**
   * Get the id of the html div of the main layer group.
   *
   * @returns {string} The div id.
   */
  getLayerGroupDivId() {
    return this.#layerGroupDivId;
  }

  /**
   * Get the list of tool names.
   *
   * @returns {string[]} The list of names.
   */
  getToolNames() {
    return this.#toolNames;
  }

  /**
   * Get the list of annotation shape names.
   *
   * @returns {string[]} The list of names.
   */
  getShapeNames() {
    return this.#shapeNames;
  }

  /**
   * Get the meta data of the last loaded data (without pixel data).
   * For a multi item data, `mergeId` lists the item ids and
   *   item dependent element values are indexed by these ids.
   *
   * @returns {object} The meta data.
   */
  getMetaData() {
    return this.#metaData;
  }

  /**
   * Get the data view configs for the current orientation.
   *
   * @returns {object} The view configs.
   */
  #getViewConfigs() {
    const viewConfig0 = new ViewConfig(this.#layerGroupDivId);
    if (typeof this.#orientation !== 'undefined') {
      viewConfig0.orientation = this.#orientation;
    }
    return {'*': [viewConfig0]};
  }

  /**
   * Dispatch a CustomEvent.
   *
   * @param {string} type The event type.
   * @param {object} value Teh event value.
   */
  #dispatch(type, value) {
    this.dispatchEvent(
      new CustomEvent(type, {detail: value})
    );
  }

  /**
   * List of preset names: set after first render.
   *
   * @param {string[]} value The names.
   */
  #setPresetNames(value) {
    this.#presetNames = value;
    this.#dispatch('presetnames', {value});
  }

  /**
   * Setup the DWV app load listeners.
   */
  #setupLoadListeners() {
    // handle load events
    let nReceivedLoadError = 0;
    let nReceivedLoadAbort = 0;
    let isFirstRender = false;
    this.#dwvApp.addEventListener('loadstart', (/*event*/) => {
      // reset flags
      this.#dispatch('dataready', {value: false});
      this.#dispatch('dataloaded', {value: false});
      nReceivedLoadError = 0;
      nReceivedLoadAbort = 0;
      isFirstRender = true;
      // reset orientation so new data opens with its default one
      if (typeof this.#orientation !== 'undefined') {
        this.#orientation = undefined;
        this.#dwvApp.getStageController().setDataViewConfigs(
          this.#getViewConfigs());
      }
    });
    this.#dwvApp.addEventListener('loadprogress', (event) => {
      this.#dispatch('loadprogress', {value: event.detail.loaded});
    });
    this.#dwvApp.addEventListener('renderend', (event) => {
      if (isFirstRender) {
        isFirstRender = false;
        const vl = this.#dwvApp.getStageController()
          .getViewLayersByDataId(event.detail.dataid)[0];
        const vc = vl.getViewController();
        // available tools
        this.#canScroll = vc.canScroll();
        this.#canWindowLevel = vc.isMonochrome();
        // get window level presets
        this.#setPresetNames(vc.getWindowLevelPresetsNames());
        // set data ready flag
        this.#dispatch('dataready', {value: true});
      }
    });
    this.#dwvApp.addEventListener('load', (event) => {
      // set dicom tags
      const data = this.#dwvApp.getDataController().get(event.detail.dataid);
      this.#metaData = structuredClone(data.meta);
      const pixelDataKey = '7FE00010';
      if (typeof this.#metaData[pixelDataKey] !== 'undefined') {
        delete this.#metaData[pixelDataKey];
      }
      // force progress
      this.#dispatch('loadprogress', {value: 100});
      // set data loaded flag
      this.#dispatch('dataloaded', {value: true});
    });
    this.#dwvApp.addEventListener('loadend', (/*event*/) => {
      if (nReceivedLoadError) {
        this.#dispatch('loadprogress', {value: 0});
        alert('Received errors during load. Check log for details.');
      }
      if (nReceivedLoadAbort) {
        this.#dispatch('loadprogress', {value: 0});
        alert('Load was aborted.');
      }
    });
    this.#dwvApp.addEventListener('error', (event) => {
      console.error(event.detail.error);
      ++nReceivedLoadError;
    });
    this.#dwvApp.addEventListener('abort', (/*event*/) => {
      ++nReceivedLoadAbort;
    });
  }

  /**
   * Setup the DWV app generic listeners.
   */
  #setupListeners() {
    // listen to 'wlchange' to flag a manual change
    // and update the presets if necessary
    this.#dwvApp.addEventListener('wlchange', (event) => {
      // value: [center, width, name]
      const manualStr = 'manual';
      if (event.detail.value[2] === manualStr) {
        if (!this.#presetNames.includes(manualStr)) {
          this.#setPresetNames([...this.#presetNames, manualStr]);
        }
        this.#dispatch('ismanualpreset', {value: true});
      } else {
        this.#dispatch('ismanualpreset', {value: false});
      }
    });

    // handle key events
    this.#dwvApp.addEventListener('keydown', (event) => {
      this.#dwvApp.defaultOnKeydown(event.detail);
    });
    // handle window resize
    window.addEventListener('resize', this.#dwvApp.onResize);

    // forward data, annotation and tap events
    const forwarded = {
      dataadd: ({detail}) => ({dataid: detail.dataid}),
      dataremove: ({detail}) => ({dataid: detail.dataid}),
      drawlayeradd: ({detail}) => ({dataid: detail.dataid}),
      annotationadd: ({detail}) => ({dataid: detail.dataid, data: detail.data}),
      annotationupdate: ({detail}) => ({
        dataid: detail.dataid,
        data: detail.data,
        keys: detail.keys
      }),
      annotationremove: ({detail}) => ({
        dataid: detail.dataid,
        data: detail.data
      }),
      annotationselect: ({detail}) => ({
        dataid: detail.dataid,
        annotationid: detail.annotationid
      }),
      tap: ({detail}) => ({
        position: detail.position,
        annotations: detail.annotations,
        segments: detail.segments
      })
    };
    for (const [type, getDetail] of Object.entries(forwarded)) {
      this.#dwvApp.addEventListener(type, (event) => {
        this.#dispatch(type, getDetail(event));
      });
    }
  }

  /**
   * Load a list of urls.
   *
   * @param {string[]} urls The urls.
   */
  loadURLs(urls) {
    this.#dwvApp.loadURLs(urls);
  }

  /**
   * Load from an uri with an `input` query parameter
   *   (see dwv `getURLsFromKeyValueUri`).
   *
   * @param {string} uri The uri.
   */
  loadFromUri(uri) {
    const urls = getURLsFromKeyValueUri(uri);
    if (urls !== undefined && urls.length !== 0) {
      this.#dwvApp.loadURLs(urls);
    }
  }

  /**
   * Load a list of files.
   *
   * @param {File[]} files The files.
   */
  loadFiles(files) {
    this.#dwvApp.loadFiles(files);
  }

  /**
   * Check if a tool can be run.
   *
   * @param {string} toolName The tool name.
   * @returns {boolean|undefined} True if the tool can be run,
   *   undefined if unknown.
   */
  canRunTool(toolName) {
    let res;
    if (toolName === 'Scroll') {
      res = this.#canScroll;
    } else if (toolName === 'WindowLevel') {
      res = this.#canWindowLevel;
    } else if (this.#toolNames.includes(toolName)) {
      res = true;
    } else {
      console.log('Unknwon tool', toolName);
    }
    return res;
  }

  /**
   * Get the first runnable tool name from the list of tools.
   *
   * @returns {string} The tool name.
   */
  getFirstRunnableTool() {
    return this.#toolNames.find((item) => this.canRunTool(item));
  }

  /**
   * Apply a tool: set it to dwv.
   *
   * @param {string} toolName The tool name.
   * @param {object} features Optional tool features.
   */
  applyTool(toolName, features) {
    this.#dwvApp.setTool(toolName);
    if (features !== undefined) {
      this.#dwvApp.setToolFeatures(features);
    }

    const lg = this.#dwvApp.getStageController().getActiveLayerGroup();
    if (toolName === 'Draw') {
      // reuse created draw layer
      if (lg !== undefined && lg.getNumberOfLayers() > 1) {
        lg?.setActiveLayer(1);
      }
    } else {
      // if draw was created, active is now a draw layer...
      // reset to view layer
      lg?.setActiveLayer(0);
    }
  }

  /**
   * Apply a window level preset: set it to dwv.
   *
   * @param {string} presetName The preset name.
   */
  applyPreset(presetName) {
    const lg = this.#dwvApp.getStageController().getActiveLayerGroup();
    if (lg !== undefined) {
      const vl = lg.getViewLayersFromActive()[0];
      const vc = vl.getViewController();
      vc.setWindowLevelPreset(presetName);
    }
  }

  /**
   * Toogle between possible orientations.
   */
  toggleOrientation() {
    if (typeof this.#orientation !== 'undefined') {
      if (this.#orientation === 'axial') {
        this.#orientation = 'coronal';
      } else if (this.#orientation === 'coronal') {
        this.#orientation = 'sagittal';
      } else if (this.#orientation === 'sagittal') {
        this.#orientation = 'axial';
      }
    } else {
      // default is most probably axial
      this.#orientation = 'coronal';
    }
    // update data view config
    const stageController = this.#dwvApp.getStageController();
    stageController.setDataViewConfigs(this.#getViewConfigs());
    // render data
    const dataIds = this.#dwvApp.getDataController().getDataIds();
    for (const dataId of dataIds) {
      stageController.render(dataId);
    }
  }

  /**
   * Release the resources: stop the loads, reset the dwv app and
   *   remove the window listeners. The service cannot be used afterwards.
   */
  dispose() {
    window.removeEventListener('resize', this.#dwvApp.onResize);
    this.#dwvApp.abortAllLoads();
    this.#dwvApp.reset();
  }

  /**
   * Reset the layout.
   */
  reset() {
    this.#dwvApp.getStageController().resetZoomPan();
  }

  /**
   * Refit the view to its container.
   */
  onResize() {
    this.#dwvApp.onResize();
  }

  /**
   * Get the data with the input id.
   *
   * @param {string} dataId The data id.
   * @returns {object|undefined} The data.
   */
  getData(dataId) {
    return this.#dwvApp.getDataController().get(dataId);
  }

  /**
   * Get the draw layers associated to a data id.
   *
   * @param {string} dataId The data id.
   * @returns {object[]} The layers.
   */
  getDrawLayersByDataId(dataId) {
    return this.#dwvApp.getStageController().getDrawLayersByDataId(dataId);
  }

  /**
   * Add a command to the undo stack.
   *
   * @param {object} cmd The command to add.
   */
  addToUndoStack(cmd) {
    this.#dwvApp.getUndoController().addToUndoStack(cmd);
  }
}
