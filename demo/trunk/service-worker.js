if(!self.define){let e,d={};const s=(s,r)=>(s=new URL(s+".js",r).href,d[s]||new Promise((d=>{if("document"in self){const e=document.createElement("script");e.src=s,e.onload=d,document.head.appendChild(e)}else e=s,importScripts(s),d()})).then((()=>{let e=d[s];if(!e)throw new Error(`Module ${s} didn’t register its module`);return e})));self.define=(r,o)=>{const c=e||("document"in self?document.currentScript.src:"")||location.href;if(d[c])return;let u={};const v=e=>s(e,c),n={module:{uri:c},exports:u,require:v};d[c]=Promise.all(r.map((e=>n[e]||v(e)))).then((e=>(o(...e),u)))}}define(["./workbox-79ffe3e0"],(function(e){"use strict";e.setCacheNameDetails({prefix:"dwv-vue"}),self.addEventListener("message",(e=>{e.data&&"SKIP_WAITING"===e.data.type&&self.skipWaiting()})),e.precacheAndRoute([{url:"/dwv-vue/demo/trunk/assets/dwv/decoders/dwv/decode-rle.js",revision:"a49ffc43d2def641ba6f6af6019fd97a"},{url:"/dwv-vue/demo/trunk/assets/dwv/decoders/dwv/rle.js",revision:"61b0831c5ec5cd18a734ca90cbd191d5"},{url:"/dwv-vue/demo/trunk/assets/dwv/decoders/pdfjs/arithmetic_decoder.js",revision:"c535fd53c8d89941c5010b9e6da74b27"},{url:"/dwv-vue/demo/trunk/assets/dwv/decoders/pdfjs/decode-jpeg2000.js",revision:"253a261ab8dc93f2657ef26ebfa25738"},{url:"/dwv-vue/demo/trunk/assets/dwv/decoders/pdfjs/decode-jpegbaseline.js",revision:"16f1e642050a9ed8c97ae3332ca5c82d"},{url:"/dwv-vue/demo/trunk/assets/dwv/decoders/pdfjs/jpg.js",revision:"2fc14d946cc05ec9194a26ccab651e6b"},{url:"/dwv-vue/demo/trunk/assets/dwv/decoders/pdfjs/jpx.js",revision:"1b9c066fa4fadbbe208af5fd630f8a42"},{url:"/dwv-vue/demo/trunk/assets/dwv/decoders/pdfjs/readme.md",revision:"2a6e0766a6c6a6fbb016da39f97231f2"},{url:"/dwv-vue/demo/trunk/assets/dwv/decoders/pdfjs/util.js",revision:"8cce771daf6820fc14b0044dc171775c"},{url:"/dwv-vue/demo/trunk/assets/dwv/decoders/rii-mango/decode-jpegloss.js",revision:"404c5da1476cf7579e02c98743883e86"},{url:"/dwv-vue/demo/trunk/assets/dwv/decoders/rii-mango/lossless-min.js",revision:"e4ca2f051c99cf32a0664fa4b661e280"},{url:"/dwv-vue/demo/trunk/assets/dwv/decoders/rii-mango/lossless.js",revision:"e4ca2f051c99cf32a0664fa4b661e280"},{url:"/dwv-vue/demo/trunk/assets/dwv/decoders/rii-mango/readme.md",revision:"3288681d2818c949a2c67ecd5dcecb74"},{url:"/dwv-vue/demo/trunk/css/app.889b5035.css",revision:null},{url:"/dwv-vue/demo/trunk/css/chunk-vendors.22f73964.css",revision:null},{url:"/dwv-vue/demo/trunk/index.html",revision:"002680a15d63e710819a4e04499cb65c"},{url:"/dwv-vue/demo/trunk/js/app.0c0c2ab8.js",revision:null},{url:"/dwv-vue/demo/trunk/js/chunk-vendors.ad3205ff.js",revision:null},{url:"/dwv-vue/demo/trunk/manifest.json",revision:"148a7b5c9ff9fec270911cfa1f8e8448"},{url:"/dwv-vue/demo/trunk/robots.txt",revision:"b6216d61c03e6ce0c9aea6ca7808f7ca"}],{})}));
//# sourceMappingURL=service-worker.js.map
