if(!self.define){let e,s={};const a=(a,n)=>(a=new URL(a+".js",n).href,s[a]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=a,e.onload=s,document.head.appendChild(e)}else e=a,importScripts(a),s()})).then((()=>{let e=s[a];if(!e)throw new Error(`Module ${a} didn’t register its module`);return e})));self.define=(n,i)=>{const t=e||("document"in self?document.currentScript.src:"")||location.href;if(s[t])return;let c={};const r=e=>a(e,t),u={module:{uri:t},exports:c,require:r};s[t]=Promise.all(n.map((e=>u[e]||r(e)))).then((e=>(i(...e),c)))}}define(["./workbox-b52a85cb"],(function(e){"use strict";importScripts(),self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"/_next/static/4P3ejdZH_u8Y6DpJhTKWm/_buildManifest.js",revision:"b1c7a7bd292448311d6131d748a1e404"},{url:"/_next/static/4P3ejdZH_u8Y6DpJhTKWm/_ssgManifest.js",revision:"b6652df95db52feb4daf4eca35380933"},{url:"/_next/static/chunks/14aeac6e-c50ab75a0aecca53.js",revision:"4P3ejdZH_u8Y6DpJhTKWm"},{url:"/_next/static/chunks/231-33c1143b54acab8d.js",revision:"4P3ejdZH_u8Y6DpJhTKWm"},{url:"/_next/static/chunks/28-f2fca06edfc1ec61.js",revision:"4P3ejdZH_u8Y6DpJhTKWm"},{url:"/_next/static/chunks/280-2a05895d421a37a2.js",revision:"4P3ejdZH_u8Y6DpJhTKWm"},{url:"/_next/static/chunks/444-002d5e271cbe5b93.js",revision:"4P3ejdZH_u8Y6DpJhTKWm"},{url:"/_next/static/chunks/491-93bfbcd3dd450d03.js",revision:"4P3ejdZH_u8Y6DpJhTKWm"},{url:"/_next/static/chunks/6ce6bdfb-580bf8b1bc2adaf9.js",revision:"4P3ejdZH_u8Y6DpJhTKWm"},{url:"/_next/static/chunks/707-41acfee86face3c0.js",revision:"4P3ejdZH_u8Y6DpJhTKWm"},{url:"/_next/static/chunks/714-68197be29f722fce.js",revision:"4P3ejdZH_u8Y6DpJhTKWm"},{url:"/_next/static/chunks/850-d827e711b4da6ccc.js",revision:"4P3ejdZH_u8Y6DpJhTKWm"},{url:"/_next/static/chunks/855-7236076887ce51f4.js",revision:"4P3ejdZH_u8Y6DpJhTKWm"},{url:"/_next/static/chunks/868-0df831d61368d8ef.js",revision:"4P3ejdZH_u8Y6DpJhTKWm"},{url:"/_next/static/chunks/870-d13dd0dcec12ed51.js",revision:"4P3ejdZH_u8Y6DpJhTKWm"},{url:"/_next/static/chunks/87c73c54-d3d970f54f3215bf.js",revision:"4P3ejdZH_u8Y6DpJhTKWm"},{url:"/_next/static/chunks/947-168610ae0c3b96b0.js",revision:"4P3ejdZH_u8Y6DpJhTKWm"},{url:"/_next/static/chunks/952-84062491edbf0761.js",revision:"4P3ejdZH_u8Y6DpJhTKWm"},{url:"/_next/static/chunks/994-dbd018907b5d24a0.js",revision:"4P3ejdZH_u8Y6DpJhTKWm"},{url:"/_next/static/chunks/app/(pages)/dashboard/page-6d8984e7208e8940.js",revision:"4P3ejdZH_u8Y6DpJhTKWm"},{url:"/_next/static/chunks/app/(pages)/login/page-dd8f312fce5c42c6.js",revision:"4P3ejdZH_u8Y6DpJhTKWm"},{url:"/_next/static/chunks/app/(pages)/organizations/%5Bid%5D/cashier/history-cashier/page-d96fff25931d9cc0.js",revision:"4P3ejdZH_u8Y6DpJhTKWm"},{url:"/_next/static/chunks/app/(pages)/organizations/%5Bid%5D/cashier/page-13fa5e34b65da151.js",revision:"4P3ejdZH_u8Y6DpJhTKWm"},{url:"/_next/static/chunks/app/(pages)/organizations/%5Bid%5D/cashier/report-cashier/page-a7d1dfe98df59d7e.js",revision:"4P3ejdZH_u8Y6DpJhTKWm"},{url:"/_next/static/chunks/app/(pages)/organizations/%5Bid%5D/check-in/page-62c0c4e5ce54b5a6.js",revision:"4P3ejdZH_u8Y6DpJhTKWm"},{url:"/_next/static/chunks/app/(pages)/organizations/%5Bid%5D/employee/add-sale/page-3c61ed7de5bb7f82.js",revision:"4P3ejdZH_u8Y6DpJhTKWm"},{url:"/_next/static/chunks/app/(pages)/organizations/%5Bid%5D/employee/page-a017519fa6492910.js",revision:"4P3ejdZH_u8Y6DpJhTKWm"},{url:"/_next/static/chunks/app/(pages)/organizations/%5Bid%5D/employee/report/page-97835ad173643f17.js",revision:"4P3ejdZH_u8Y6DpJhTKWm"},{url:"/_next/static/chunks/app/(pages)/organizations/%5Bid%5D/manager/check-in-management/page-23d630b743b134c6.js",revision:"4P3ejdZH_u8Y6DpJhTKWm"},{url:"/_next/static/chunks/app/(pages)/organizations/%5Bid%5D/owner/page-7e11d742f0d5a89d.js",revision:"4P3ejdZH_u8Y6DpJhTKWm"},{url:"/_next/static/chunks/app/(pages)/organizations/%5Bid%5D/owner/report/page-7aa3c9c35116f6d8.js",revision:"4P3ejdZH_u8Y6DpJhTKWm"},{url:"/_next/static/chunks/app/(pages)/organizations/%5Bid%5D/users/page-c36d6ac2a056fa89.js",revision:"4P3ejdZH_u8Y6DpJhTKWm"},{url:"/_next/static/chunks/app/(pages)/settings/page-546ae3441ea8c31a.js",revision:"4P3ejdZH_u8Y6DpJhTKWm"},{url:"/_next/static/chunks/app/_not-found/page-44b20c51f4c9a89d.js",revision:"4P3ejdZH_u8Y6DpJhTKWm"},{url:"/_next/static/chunks/app/layout-8165481682bc4824.js",revision:"4P3ejdZH_u8Y6DpJhTKWm"},{url:"/_next/static/chunks/app/not-found-1bba561e0e0acefe.js",revision:"4P3ejdZH_u8Y6DpJhTKWm"},{url:"/_next/static/chunks/app/page-5a96316f009cf54b.js",revision:"4P3ejdZH_u8Y6DpJhTKWm"},{url:"/_next/static/chunks/app/signup/page-68b1173c8ea076fb.js",revision:"4P3ejdZH_u8Y6DpJhTKWm"},{url:"/_next/static/chunks/framework-919bc8cbd55672eb.js",revision:"4P3ejdZH_u8Y6DpJhTKWm"},{url:"/_next/static/chunks/main-app-847debe89b57e801.js",revision:"4P3ejdZH_u8Y6DpJhTKWm"},{url:"/_next/static/chunks/main-b86a22f2b0866cae.js",revision:"4P3ejdZH_u8Y6DpJhTKWm"},{url:"/_next/static/chunks/pages/_app-3e3e3e64529ea027.js",revision:"4P3ejdZH_u8Y6DpJhTKWm"},{url:"/_next/static/chunks/pages/_error-8cfbe37f68950a2b.js",revision:"4P3ejdZH_u8Y6DpJhTKWm"},{url:"/_next/static/chunks/polyfills-42372ed130431b0a.js",revision:"846118c33b2c0e922d7b3a7676f81f6f"},{url:"/_next/static/chunks/webpack-4254c301d4ef8ae7.js",revision:"4P3ejdZH_u8Y6DpJhTKWm"},{url:"/_next/static/css/c633b8809847c60d.css",revision:"c633b8809847c60d"},{url:"/_next/static/media/4473ecc91f70f139-s.p.woff",revision:"78e6fc13ea317b55ab0bd6dc4849c110"},{url:"/_next/static/media/463dafcda517f24f-s.p.woff",revision:"cbeb6d2d96eaa268b4b5beb0b46d9632"},{url:"/file.svg",revision:"d09f95206c3fa0bb9bd9fefabfd0ea71"},{url:"/globe.svg",revision:"2aaafa6a49b6563925fe440891e32717"},{url:"/icons/icon-192x192.png",revision:"53b5ae870e40ccf3ff4eba8aa6bef87d"},{url:"/icons/icon-512x512.png",revision:"087e1efc9184947940b1c769e91b4ee0"},{url:"/img/default-logo.png",revision:"0efb5d9ffbbc5a6d691a56c9ed8e8a6f"},{url:"/manifest.json",revision:"5480d11cddbdcefd5557d6aa4f1a2c81"},{url:"/next.svg",revision:"8e061864f388b47f33a1c3780831193e"},{url:"/vercel.svg",revision:"c0af2f507b369b085b35ef4bbe3bcf1e"},{url:"/window.svg",revision:"a2760511c65806022ad20adf74370ff3"}],{ignoreURLParametersMatching:[/^utm_/,/^fbclid$/]}),e.cleanupOutdatedCaches(),e.registerRoute("/",new e.NetworkFirst({cacheName:"start-url",plugins:[{cacheWillUpdate:function(e){return _ref.apply(this,arguments)}}]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,new e.CacheFirst({cacheName:"google-fonts-webfonts",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:31536e3})]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,new e.StaleWhileRevalidate({cacheName:"google-fonts-stylesheets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,new e.StaleWhileRevalidate({cacheName:"static-font-assets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,new e.StaleWhileRevalidate({cacheName:"static-image-assets",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:2592e3})]}),"GET"),e.registerRoute(/\/_next\/static.+\.js$/i,new e.CacheFirst({cacheName:"next-static-js-assets",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/image\?url=.+$/i,new e.StaleWhileRevalidate({cacheName:"next-image",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp3|wav|ogg)$/i,new e.CacheFirst({cacheName:"static-audio-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp4|webm)$/i,new e.CacheFirst({cacheName:"static-video-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:js)$/i,new e.StaleWhileRevalidate({cacheName:"static-js-assets",plugins:[new e.ExpirationPlugin({maxEntries:48,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:css|less)$/i,new e.StaleWhileRevalidate({cacheName:"static-style-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/data\/.+\/.+\.json$/i,new e.StaleWhileRevalidate({cacheName:"next-data",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:json|xml|csv)$/i,new e.NetworkFirst({cacheName:"static-data-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((function(e){var s=e.sameOrigin,a=e.url.pathname;return!(!s||a.startsWith("/api/auth/callback")||!a.startsWith("/api/"))}),new e.NetworkFirst({cacheName:"apis",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:16,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((function(e){var s=e.request,a=e.url.pathname,n=e.sameOrigin;return"1"===s.headers.get("RSC")&&"1"===s.headers.get("Next-Router-Prefetch")&&n&&!a.startsWith("/api/")}),new e.NetworkFirst({cacheName:"pages-rsc-prefetch",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((function(e){var s=e.request,a=e.url.pathname,n=e.sameOrigin;return"1"===s.headers.get("RSC")&&n&&!a.startsWith("/api/")}),new e.NetworkFirst({cacheName:"pages-rsc",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((function(e){var s=e.url.pathname;return e.sameOrigin&&!s.startsWith("/api/")}),new e.NetworkFirst({cacheName:"pages",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((function(e){return!e.sameOrigin}),new e.NetworkFirst({cacheName:"cross-origin",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:3600})]}),"GET")}));
