(function(){"use strict";var e={550:function(e,t,o){var n=o(144),a=function(){var e=this,t=e._self._c;return t("div",{attrs:{id:"app"}},[t("dwvVue")],1)},s=[],r=function(){var e=this,t=e._self._c;return t("div",{attrs:{id:"dwv"}},[t("md-progress-bar",{attrs:{"md-mode":"determinate","md-value":e.loadProgress}}),t("div",{staticClass:"button-row"},[e._l(e.toolNames,(function(o){return t("md-button",{key:o,staticClass:"md-icon-button md-raised md-primary",attrs:{id:o,title:o,disabled:!e.dataLoaded||!e.canRunTool(o)},on:{click:function(t){return e.onChangeTool(o)}}},[t("md-icon",[e._v(e._s(e.getToolIcon(o)))])],1)})),t("md-button",{staticClass:"md-icon-button md-raised md-primary",attrs:{title:"Reset",disabled:!e.dataLoaded},on:{click:function(t){return e.onReset()}}},[t("md-icon",[e._v("refresh")])],1),t("md-button",{staticClass:"md-icon-button md-raised md-primary",attrs:{title:"Toggle Orientation",disabled:!e.dataLoaded},on:{click:function(t){return e.toggleOrientation()}}},[t("md-icon",[e._v("cameraswitch")])],1),t("md-button",{staticClass:"md-icon-button md-raised md-primary",attrs:{title:"Tags",disabled:!e.dataLoaded},on:{click:function(t){e.showDicomTags=!0}}},[t("md-icon",[e._v("library_books")])],1),t("md-dialog",{attrs:{"md-active":e.showDicomTags},on:{"update:mdActive":function(t){e.showDicomTags=t},"update:md-active":function(t){e.showDicomTags=t}}},[t("tagsTable",{attrs:{tagsData:e.metaData}})],1)],2),e._m(0),t("div",{staticClass:"legend md-caption"},[t("p",[e._v(" Powered by "),t("a",{attrs:{href:"https://github.com/ivmartel/dwv",title:"dwv on github"}},[e._v("dwv")]),e._v(" "+e._s(e.versions.dwv)+" and "),t("a",{attrs:{href:"https://github.com/vuejs/vue",title:"vue on github"}},[e._v("Vue.js")]),e._v(" "+e._s(e.versions.vue)+" ")])])],1)},i=[function(){var e=this,t=e._self._c;return t("div",{staticClass:"layerGroup",attrs:{id:"layerGroup0"}},[t("div",{attrs:{id:"dropBox"}})])}],d=o(535),l=o.n(d),c=o(918),u=function(){var e=this,t=e._self._c;return t("div",[t("md-table",{attrs:{"md-card":"","md-fixed-header":""},scopedSlots:e._u([{key:"md-table-row",fn:function({item:o}){return t("md-table-row",{},[t("md-table-cell",{attrs:{"md-label":"Name","md-sort-by":"name","md-numeric":""}},[e._v(e._s(o.name))]),t("md-table-cell",{attrs:{"md-label":"Value","md-sort-by":"value"}},[e._v(e._s(o.value))])],1)}}]),model:{value:e.searched,callback:function(t){e.searched=t},expression:"searched"}},[t("md-table-toolbar",[t("div",{staticClass:"md-toolbar-section-start"},[t("h1",{staticClass:"md-title"},[e._v("DICOM Tags")])]),t("div",{staticClass:"md-toolbar-section-end"},[t("md-field",{attrs:{"md-clearable":""}},[t("md-input",{staticClass:"md-caption",attrs:{placeholder:"Search..."},on:{input:e.searchOnTable},model:{value:e.search,callback:function(t){e.search=t},expression:"search"}})],1),t("input",{attrs:{type:"range",step:"1",min:e.sliderMin,max:e.sliderMax,title:"Instance number"},domProps:{value:e.instanceNumber},on:{input:e.onSliderChange}}),t("div",{staticClass:"instancenumber",attrs:{title:"Instance number"}},[e._v(e._s(e.instanceNumber))])],1)]),t("md-table-empty-state",{attrs:{"md-label":"No tags found","md-description":`No tags found for this '${e.search}' query.`}})],1)],1)},v=[];const p=e=>e?e.toString().toLowerCase():"",h=(e,t)=>t?e.filter((e=>p(e.name).includes(p(t))||p(e.value).includes(p(t)))):e,m=(e,t)=>{let o;o=f(e)?b(e,t,""):g(e);const n=Object.keys(e);return n.reduce(o,[])},f=e=>"undefined"!==typeof e["00020010"],g=e=>function(t,o){return t.push({name:o,value:e[o].value}),t},b=(e,t,o)=>(n,a)=>{const s=(0,c.getTagFromKey)(a);let r=s.getNameFromDictionary();"undefined"===typeof r&&(r="x"+s.getKey());const i=r,d=e[a];let l=d.value;if("undefined"===typeof l.slice&&"undefined"!==typeof l[t]&&(l=l[t]),"InstanceNumber"===i&&(l=t),"SQ"===d.vr){n.push({name:(o?o+" ":"")+i,value:""});for(let e=0;e<l.length;++e){const a=l[e],s=Object.keys(a),r=s.reduce(b(a,t,o+"["+e+"]"),[]);n=n.concat(r)}}else"O"===d.vr[0]&&l.length>10&&(l=l.slice(0,10).toString()+"... (len:"+l.length+")"),n.push({name:(o?o+" ":"")+i,value:l.toString()});return n};var w={name:"TagsTable",props:["tagsData"],data:()=>({search:null,searched:[],sliderMin:void 0,sliderMax:void 0,instanceNumber:void 0}),methods:{searchOnTable(){const e=m(this.tagsData,this.instanceNumber);this.searched=h(e,this.search)},onSliderChange(e){this.instanceNumber=e.target.value,this.searchOnTable()}},created(){const e=this.tagsData["00200013"];if("undefined"!==typeof e){let t=e.value;"string"===typeof t&&(t=[t]);const o=t.map(Number);o.sort(((e,t)=>e-t)),this.sliderMin=o[0],this.sliderMax=o[o.length-1],this.instanceNumber=o[0]}const t=m(this.tagsData,this.instanceNumber);this.searched=t}},y=w,D=o(1),x=(0,D.Z)(y,u,v,!1,null,"26cd374c",null),L=x.exports;n["default"].use(l()),c.decoderScripts.jpeg2000="assets/dwv/decoders/pdfjs/decode-jpeg2000.js",c.decoderScripts["jpeg-lossless"]="assets/dwv/decoders/rii-mango/decode-jpegloss.js",c.decoderScripts["jpeg-baseline"]="assets/dwv/decoders/pdfjs/decode-jpegbaseline.js",c.decoderScripts.rle="assets/dwv/decoders/dwv/decode-rle.js";var T={name:"dwv-vue",components:{tagsTable:L},data:function(){let e={versions:{dwv:(0,c.getDwvVersion)(),vue:n["default"].version},dwvApp:null,tools:{Scroll:{},ZoomAndPan:{},WindowLevel:{},Draw:{options:["Ruler"]}},selectedTool:"Select Tool",loadProgress:0,dataLoaded:!1,metaData:null,orientation:void 0,showDicomTags:!1,dropboxDivId:"dropBox",dropboxClassName:"dropBox",borderClassName:"dropBoxBorder",hoverClassName:"hover"};return e.toolNames=Object.keys(e.tools),e},mounted(){this.dwvApp=new c.App,this.dwvApp.init({dataViewConfigs:{"*":[{divId:"layerGroup0"}]},tools:this.tools});let e=null,t=null,o=null,n=null;this.dwvApp.addEventListener("loadstart",(()=>{this.dataLoaded=!1,e=0,t=0,o=0,n=!0,this.showDropbox(!1)})),this.dwvApp.addEventListener("loadprogress",(e=>{this.loadProgress=e.loaded})),this.dwvApp.addEventListener("renderend",(()=>{if(n){n=!1;let e="ZoomAndPan";this.dwvApp.canScroll()&&(e="Scroll"),this.onChangeTool(e)}})),this.dwvApp.addEventListener("load",(()=>{this.metaData=this.dwvApp.getMetaData(0),this.dataLoaded=!0})),this.dwvApp.addEventListener("loadend",(()=>{t&&(this.loadProgress=0,alert("Received errors during load. Check log for details."),e||this.showDropbox(!0)),o&&(this.loadProgress=0,alert("Load was aborted."),this.showDropbox(!0))})),this.dwvApp.addEventListener("loaditem",(()=>{++e})),this.dwvApp.addEventListener("loaderror",(()=>{++t})),this.dwvApp.addEventListener("loadabort",(()=>{++o})),this.dwvApp.addEventListener("keydown",(e=>{this.dwvApp.defaultOnKeydown(e)})),window.addEventListener("resize",this.dwvApp.onResize),this.setupDropbox(),this.dwvApp.loadFromUri(window.location.href)},methods:{getToolIcon:function(e){var t;return"Scroll"===e?t="menu":"ZoomAndPan"===e?t="search":"WindowLevel"===e?t="contrast":"Draw"===e&&(t="straighten"),t},onChangeTool:function(e){this.selectedTool=e;for(const t of this.toolNames)this.activateTool(t,!1);this.activateTool(e,!0),this.dwvApp.setTool(e),"Draw"===e&&this.onChangeShape(this.tools.Draw.options[0])},canRunTool:function(e){let t;return t="Scroll"===e?this.dwvApp.canScroll():"WindowLevel"!==e||this.dwvApp.canWindowLevel(),t},activateTool:function(e,t){t?document.getElementById(e).classList.add("active"):document.getElementById(e).classList.remove("active")},toggleOrientation:function(){"undefined"!==typeof this.orientation?"axial"===this.orientation?this.orientation="coronal":"coronal"===this.orientation?this.orientation="sagittal":"sagittal"===this.orientation&&(this.orientation="axial"):this.orientation="coronal";const e={"*":[{divId:"layerGroup0",orientation:this.orientation}]};this.dwvApp.setDataViewConfig(e);for(let t=0;t<this.dwvApp.getNumberOfLoadedData();++t)this.dwvApp.render(t)},onChangeShape:function(e){this.dwvApp&&"Draw"===this.selectedTool&&this.dwvApp.setToolFeatures({shapeName:e})},onReset:function(){this.dwvApp.resetDisplay()},setupDropbox(){this.showDropbox(!0)},defaultHandleDragEvent:function(e){e.stopPropagation(),e.preventDefault()},onBoxDragOver:function(e){this.defaultHandleDragEvent(e);const t=document.getElementById(this.dropboxDivId);t&&-1===t.className.indexOf(this.hoverClassName)&&(t.className+=" "+this.hoverClassName)},onBoxDragLeave:function(e){this.defaultHandleDragEvent(e);const t=document.getElementById(this.dropboxDivId);t&&-1!==t.className.indexOf(this.hoverClassName)&&(t.className=t.className.replace(" "+this.hoverClassName,""))},onDrop:function(e){this.defaultHandleDragEvent(e),this.dwvApp.loadFiles(e.dataTransfer.files)},showDropbox:function(e){const t=document.getElementById(this.dropboxDivId);if(!t)return;const o=document.getElementById("layerGroup0");if(e){if(t.className=this.dropboxClassName+" "+this.borderClassName,""===t.innerHTML){const e=document.createElement("p");e.appendChild(document.createTextNode("Drag and drop data here")),t.appendChild(e)}t.setAttribute("style","display:initial"),o&&(o.removeEventListener("dragover",this.defaultHandleDragEvent),o.removeEventListener("dragleave",this.defaultHandleDragEvent),o.removeEventListener("drop",this.onDrop)),t.addEventListener("dragover",this.onBoxDragOver),t.addEventListener("dragleave",this.onBoxDragLeave),t.addEventListener("drop",this.onDrop)}else t.className=this.dropboxClassName,t.innerHTML="",t.setAttribute("style","display:none"),t.removeEventListener("dragover",this.onBoxDragOver),t.removeEventListener("dragleave",this.onBoxDragLeave),t.removeEventListener("drop",this.onDrop),o&&(o.addEventListener("dragover",this.defaultHandleDragEvent),o.addEventListener("dragleave",this.defaultHandleDragEvent),o.addEventListener("drop",this.onDrop))}}},C=T,E=(0,D.Z)(C,r,i,!1,null,"959de00a",null),N=E.exports,A={name:"app",components:{dwvVue:N}},_=A,O=(0,D.Z)(_,a,s,!1,null,null,null),j=O.exports,S=o(205);(0,S.z)("/dwv-vue/demo/trunk/service-worker.js",{ready(){console.log("App is being served from cache by a service worker.\nFor more details, visit https://goo.gl/AFskqB")},cached(){console.log("Content has been cached for offline use.")},updated(){console.log("New content is available; please refresh.")},offline(){console.log("No internet connection found. App is running in offline mode.")},error(e){console.error("Error during service worker registration:",e)}}),n["default"].config.productionTip=!1,new n["default"]({render:e=>e(j)}).$mount("#app")}},t={};function o(n){var a=t[n];if(void 0!==a)return a.exports;var s=t[n]={id:n,loaded:!1,exports:{}};return e[n].call(s.exports,s,s.exports,o),s.loaded=!0,s.exports}o.m=e,function(){var e=[];o.O=function(t,n,a,s){if(!n){var r=1/0;for(c=0;c<e.length;c++){n=e[c][0],a=e[c][1],s=e[c][2];for(var i=!0,d=0;d<n.length;d++)(!1&s||r>=s)&&Object.keys(o.O).every((function(e){return o.O[e](n[d])}))?n.splice(d--,1):(i=!1,s<r&&(r=s));if(i){e.splice(c--,1);var l=a();void 0!==l&&(t=l)}}return t}s=s||0;for(var c=e.length;c>0&&e[c-1][2]>s;c--)e[c]=e[c-1];e[c]=[n,a,s]}}(),function(){o.n=function(e){var t=e&&e.__esModule?function(){return e["default"]}:function(){return e};return o.d(t,{a:t}),t}}(),function(){o.d=function(e,t){for(var n in t)o.o(t,n)&&!o.o(e,n)&&Object.defineProperty(e,n,{enumerable:!0,get:t[n]})}}(),function(){o.g=function(){if("object"===typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"===typeof window)return window}}()}(),function(){o.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)}}(),function(){o.r=function(e){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})}}(),function(){o.nmd=function(e){return e.paths=[],e.children||(e.children=[]),e}}(),function(){var e={143:0};o.O.j=function(t){return 0===e[t]};var t=function(t,n){var a,s,r=n[0],i=n[1],d=n[2],l=0;if(r.some((function(t){return 0!==e[t]}))){for(a in i)o.o(i,a)&&(o.m[a]=i[a]);if(d)var c=d(o)}for(t&&t(n);l<r.length;l++)s=r[l],o.o(e,s)&&e[s]&&e[s][0](),e[s]=0;return o.O(c)},n=self["webpackChunkdwv_vue"]=self["webpackChunkdwv_vue"]||[];n.forEach(t.bind(null,0)),n.push=t.bind(null,n.push.bind(n))}();var n=o.O(void 0,[998],(function(){return o(550)}));n=o.O(n)})();
//# sourceMappingURL=app.a387f851.js.map