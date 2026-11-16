/* Service worker: hálózat először (mindig a legfrissebb verzió), offline a tárolt másolat. */
var CACHE="kaja-v1.6";
var FILES=["./","index.html","style.css","sprites.js","data.js","app.js","firebase-config.js","sync.js","vendor/firebase-app-compat.js","vendor/firebase-auth-compat.js","vendor/firebase-firestore-compat.js","manifest.webmanifest","icon.svg","icon-192.png","icon-512.png"];
self.addEventListener("install",function(e){self.skipWaiting();e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(FILES)}).catch(function(){}))});
self.addEventListener("activate",function(e){e.waitUntil(caches.keys().then(function(k){return Promise.all(k.filter(function(x){return x!==CACHE}).map(function(x){return caches.delete(x)}))}).then(function(){return self.clients.claim()}))});
self.addEventListener("message",function(e){if(e.data==="skip")self.skipWaiting()});
self.addEventListener("fetch",function(e){var q=e.request;if(q.method!=="GET")return;
  var same=new URL(q.url).origin===self.location.origin;
  if(same){/* saját fájlok: hálózatról, ha van net; különben a tárolt példány */
    e.respondWith(fetch(q,{cache:"no-cache"}).then(function(r){if(r&&r.ok){var cp=r.clone();caches.open(CACHE).then(function(c){c.put(q,cp)})}return r})
      .catch(function(){return caches.match(q).then(function(h){return h||(q.mode==="navigate"?caches.match("index.html"):undefined)})}));return}
  /* csak a betűtípusokat tároljuk; minden más (pl. Firebase) közvetlenül a hálózatra megy */
  if(!/^fonts\.(googleapis|gstatic)\.com$/.test(new URL(q.url).hostname))return;
  e.respondWith(caches.match(q).then(function(hit){return hit||fetch(q).then(function(r){if(r&&(r.ok||r.type==="opaque")){var cp=r.clone();caches.open(CACHE).then(function(c){c.put(q,cp)})}return r})}))});
