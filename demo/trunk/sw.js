if(!self.define){let e,i={};const n=(n,s)=>(n=new URL(n+".js",s).href,i[n]||new Promise((i=>{if("document"in self){const e=document.createElement("script");e.src=n,e.onload=i,document.head.appendChild(e)}else e=n,importScripts(n),i()})).then((()=>{let e=i[n];if(!e)throw new Error(`Module ${n} didn’t register its module`);return e})));self.define=(s,o)=>{const c=e||("document"in self?document.currentScript.src:"")||location.href;if(i[c])return;let r={};const d=e=>n(e,c),f={module:{uri:c},exports:r,require:d};i[c]=Promise.all(s.map((e=>f[e]||d(e)))).then((e=>(o(...e),r)))}}define(["./workbox-7cfec069"],(function(e){"use strict";self.addEventListener("message",(e=>{e.data&&"SKIP_WAITING"===e.data.type&&self.skipWaiting()})),e.precacheAndRoute([{url:"assets/index-BHfZvMgG.js",revision:null},{url:"assets/index-BUzNGv5M.css",revision:null},{url:"index.html",revision:"17880f4a06d20aec0192feb107308f5f"},{url:"registerSW.js",revision:"d33271bac4579fe732aa1df6d2933f05"},{url:"favicon.ico",revision:"e51c9a16daafc740693e453aa7c829e8"},{url:"img/icons/icon-16.png",revision:"0d4f511798de77d4741e6698a8878478"},{url:"img/icons/icon-32.png",revision:"6fbcfd572fd0ba33313b9954927ad45e"},{url:"img/icons/icon-64.png",revision:"284c837c452bbeadbaac31edc2bdc9ea"},{url:"img/icons/icon-128.png",revision:"aa736a4700b67b7bd633a2f9ac849df3"},{url:"img/icons/icon-256.png",revision:"3ae681e82962fd29725e6b7458df8dd1"},{url:"img/icons/icon-512.png",revision:"a46c96e97b55452956dab17ca48131ee"},{url:"manifest.webmanifest",revision:"553ce78cd97824914f27e35e9837e548"}],{}),e.cleanupOutdatedCaches(),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("index.html")))}));
