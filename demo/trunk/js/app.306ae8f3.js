(function(e){function t(t){for(var o,r,d=t[0],i=t[1],l=t[2],u=0,p=[];u<d.length;u++)r=d[u],Object.prototype.hasOwnProperty.call(s,r)&&s[r]&&p.push(s[r][0]),s[r]=0;for(o in i)Object.prototype.hasOwnProperty.call(i,o)&&(e[o]=i[o]);c&&c(t);while(p.length)p.shift()();return n.push.apply(n,l||[]),a()}function a(){for(var e,t=0;t<n.length;t++){for(var a=n[t],o=!0,d=1;d<a.length;d++){var i=a[d];0!==s[i]&&(o=!1)}o&&(n.splice(t--,1),e=r(r.s=a[0]))}return e}var o={},s={app:0},n=[];function r(t){if(o[t])return o[t].exports;var a=o[t]={i:t,l:!1,exports:{}};return e[t].call(a.exports,a,a.exports,r),a.l=!0,a.exports}r.m=e,r.c=o,r.d=function(e,t,a){r.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:a})},r.r=function(e){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},r.t=function(e,t){if(1&t&&(e=r(e)),8&t)return e;if(4&t&&"object"===typeof e&&e&&e.__esModule)return e;var a=Object.create(null);if(r.r(a),Object.defineProperty(a,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)r.d(a,o,function(t){return e[t]}.bind(null,o));return a},r.n=function(e){var t=e&&e.__esModule?function(){return e["default"]}:function(){return e};return r.d(t,"a",t),t},r.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},r.p="/dwv-vue/demo/trunk/";var d=window["webpackJsonp"]=window["webpackJsonp"]||[],i=d.push.bind(d);d.push=t,d=d.slice();for(var l=0;l<d.length;l++)t(d[l]);var c=i;n.push([0,"chunk-vendors"]),a()})({0:function(e,t,a){e.exports=a("56d7")},"034f":function(e,t,a){"use strict";var o=a("85ec"),s=a.n(o);s.a},1:function(e,t){},"1f5a":function(e,t,a){},2:function(e,t){},"38bd":function(e,t,a){"use strict";var o=a("1f5a"),s=a.n(o);s.a},"56d7":function(e,t,a){"use strict";a.r(t);a("e260"),a("e6cf"),a("cca6"),a("a79d");var o=a("2b0e"),s=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",{attrs:{id:"app"}},[a("dwvVue")],1)},n=[],r=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",{attrs:{id:"dwv"}},[a("md-progress-bar",{attrs:{"md-mode":"determinate","md-value":e.loadProgress}}),a("div",{staticClass:"button-row"},[a("md-menu",{attrs:{"md-size":"medium","md-align-trigger":""}},[a("md-button",{staticClass:"md-raised md-primary",attrs:{"md-menu-trigger":"",disabled:!e.dataLoaded}},[e._v(" "+e._s(e.selectedTool)+" "),a("md-icon",[e._v("arrow_drop_down")])],1),a("md-menu-content",e._l(Object.keys(e.tools),(function(t){return a("md-menu-item",{key:t,on:{click:function(a){return e.onChangeTool(t)}}},[e._v(e._s(t))])})),1),a("md-button",{staticClass:"md-raised md-primary",attrs:{disabled:!e.dataLoaded},on:{click:function(t){return e.onReset()}}},[e._v("Reset")]),a("md-button",{staticClass:"md-raised md-primary",attrs:{disabled:!e.dataLoaded},on:{click:function(t){e.showDicomTags=!0}}},[e._v("Tags")])],1),a("md-dialog",{attrs:{"md-active":e.showDicomTags},on:{"update:mdActive":function(t){e.showDicomTags=t},"update:md-active":function(t){e.showDicomTags=t}}},[a("tagsTable",{attrs:{tagsData:e.metaData}})],1)],1),e._m(0),a("div",{staticClass:"legend md-caption"},[a("p",[e._v(" Powered by "),a("a",{attrs:{href:"https://github.com/ivmartel/dwv",title:"dwv on github"}},[e._v("dwv")]),e._v(" "+e._s(e.versions.dwv)+" and "),a("a",{attrs:{href:"https://github.com/vuejs/vue",title:"vue on github"}},[e._v("Vue.js")]),e._v(" "+e._s(e.versions.vue)+" ")])])],1)},d=[function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",{staticClass:"layerContainer"},[a("div",{staticClass:"dropBox"}),a("canvas",{staticClass:"imageLayer"},[e._v("Only for HTML5 compatible browsers...")]),a("div",{staticClass:"drawDiv"})])}],i=(a("c975"),a("ac1f"),a("5319"),a("43f9")),l=a.n(i),c=a("e730"),u=a.n(c),p=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",[a("md-table",{attrs:{"md-sort":"name","md-sort-order":"asc","md-card":"","md-fixed-header":""},scopedSlots:e._u([{key:"md-table-row",fn:function(t){var o=t.item;return a("md-table-row",{},[a("md-table-cell",{attrs:{"md-label":"Name","md-sort-by":"name","md-numeric":""}},[e._v(e._s(o.name))]),a("md-table-cell",{attrs:{"md-label":"Value","md-sort-by":"value"}},[e._v(e._s(o.value))])],1)}}]),model:{value:e.searched,callback:function(t){e.searched=t},expression:"searched"}},[a("md-table-toolbar",[a("div",{staticClass:"md-toolbar-section-start"},[a("h1",{staticClass:"md-title"},[e._v("DICOM Tags")])]),a("md-field",{staticClass:"md-toolbar-section-end",attrs:{"md-clearable":""}},[a("md-input",{attrs:{placeholder:"Search..."},on:{input:e.searchOnTable},model:{value:e.search,callback:function(t){e.search=t},expression:"search"}})],1)],1),a("md-table-empty-state",{attrs:{"md-label":"No tags found","md-description":"No tags found for this '"+e.search+"' query."}})],1)],1)},v=[],m=(a("4de4"),a("caad"),a("b0c0"),a("d3b7"),a("25f0"),a("2532"),a("841c"),function(e){return e.toString().toLowerCase()}),f=function(e,t){return t?e.filter((function(e){return m(e.name).includes(m(t))||m(e.value).includes(m(t))})):e},h={name:"TagsTable",props:["tagsData"],data:function(){return{search:null,searched:[]}},methods:{searchOnTable:function(){this.searched=f(this.tagsData,this.search)}},created:function(){this.searched=this.tagsData}},g=h,w=a("2877"),b=Object(w["a"])(g,p,v,!1,null,null,null),y=b.exports;o["default"].use(l.a),u.a.gui.getElement=u.a.gui.base.getElement,u.a.image.decoderScripts={jpeg2000:"assets/dwv/decoders/pdfjs/decode-jpeg2000.js","jpeg-lossless":"assets/dwv/decoders/rii-mango/decode-jpegloss.js","jpeg-baseline":"assets/dwv/decoders/pdfjs/decode-jpegbaseline.js",rle:"assets/dwv/decoders/dwv/decode-rle.js"};var D={name:"dwv",components:{tagsTable:y},data:function(){return{versions:{dwv:u.a.getVersion(),vue:o["default"].version},dwvApp:null,tools:{Scroll:{},ZoomAndPan:{},WindowLevel:{},Draw:{options:["Ruler"],type:"factory",events:["draw-create","draw-change","draw-move","draw-delete"]}},selectedTool:"Select Tool",loadProgress:0,dataLoaded:!1,metaData:null,showDicomTags:!1,dropboxClassName:"dropBox",borderClassName:"dropBoxBorder",hoverClassName:"hover"}},mounted:function(){var e=this;this.dwvApp=new u.a.App,this.dwvApp.init({containerDivId:"dwv",tools:this.tools});var t=null,a=null,o=null;this.dwvApp.addEventListener("load-start",(function(){e.dataLoaded=!1,t=0,a=0,o=0,e.showDropbox(!1)})),this.dwvApp.addEventListener("load-progress",(function(t){e.loadProgress=t.loaded})),this.dwvApp.addEventListener("load",(function(){e.metaData=u.a.utils.objectToArray(e.dwvApp.getMetaData());var t="Scroll";e.dwvApp.isMonoSliceData()&&1===e.dwvApp.getImage().getNumberOfFrames()&&(t="ZoomAndPan"),e.onChangeTool(t),e.dataLoaded=!0})),this.dwvApp.addEventListener("load-end",(function(){a&&(e.loadProgress=0,alert("Received errors during load. Check log for details."),t||e.showDropbox(!0)),o&&(e.loadProgress=0,alert("Load was aborted."),e.showDropbox(!0))})),this.dwvApp.addEventListener("load-item",(function(){++t})),this.dwvApp.addEventListener("error",(function(){++a})),this.dwvApp.addEventListener("abort",(function(){++o})),this.dwvApp.addEventListener("keydown",(function(t){e.dwvApp.defaultOnKeydown(t)})),window.addEventListener("resize",this.dwvApp.onResize),this.setupDropbox(),u.a.utils.loadFromUri(window.location.href,this.dwvApp)},methods:{onChangeTool:function(e){this.selectedTool=e,this.dwvApp.setTool(e),"Draw"===e&&this.onChangeShape(this.tools.Draw.options[0])},onChangeShape:function(e){this.dwvApp&&"Draw"===this.selectedTool&&this.dwvApp.setDrawShape(e)},onReset:function(){this.dwvApp.resetDisplay()},setupDropbox:function(){var e=this.dwvApp.getElement("layerContainer");e&&(this.showDropbox(!0),e.addEventListener("dragover",this.onDragOver),e.addEventListener("dragleave",this.onDragLeave),e.addEventListener("drop",this.onDrop))},onDragOver:function(e){e.stopPropagation(),e.preventDefault();var t=this.dwvApp.getElement(this.borderClassName);t&&-1===t.className.indexOf(this.hoverClassName)&&(t.className+=" "+this.hoverClassName)},onDragLeave:function(e){e.stopPropagation(),e.preventDefault();var t=this.dwvApp.getElement(this.borderClassName+" hover");t&&-1!==t.className.indexOf(this.hoverClassName)&&(t.className=t.className.replace(" "+this.hoverClassName,""))},showDropbox:function(e){var t=this.dwvApp.getElement(this.dropboxClassName);if(t)if(e){t.className=this.dropboxClassName+" "+this.borderClassName,""===t.innerHTML&&(t.innerHTML="Drag and drop data here.");var a=this.dwvApp.getLayerContainerSize(),o=2*a.height/3;t.setAttribute("style","width:"+o+"px;height:"+o+"px")}else t.className=this.dropboxClassName,t.innerHTML="",t.setAttribute("style","visible:false;")},onDrop:function(e){e.stopPropagation(),e.preventDefault(),this.dwvApp.loadFiles(e.dataTransfer.files)}}},_=D,A=(a("38bd"),Object(w["a"])(_,r,d,!1,null,"054e910a",null)),C=A.exports,T={name:"app",components:{dwvVue:C}},j=T,x=(a("034f"),Object(w["a"])(j,s,n,!1,null,null,null)),L=x.exports,N=a("9483");Object(N["a"])("".concat("/dwv-vue/demo/trunk/","service-worker.js"),{ready:function(){console.log("App is being served from cache by a service worker.\nFor more details, visit https://goo.gl/AFskqB")},cached:function(){console.log("Content has been cached for offline use.")},updated:function(){console.log("New content is available; please refresh.")},offline:function(){console.log("No internet connection found. App is running in offline mode.")},error:function(e){console.error("Error during service worker registration:",e)}});a("51de"),a("e094");o["default"].config.productionTip=!1,new o["default"]({render:function(e){return e(L)}}).$mount("#app")},"85ec":function(e,t,a){}});
//# sourceMappingURL=app.306ae8f3.js.map