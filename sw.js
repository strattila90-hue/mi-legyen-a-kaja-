var CACHE="kaja-v0.5";
var FILES=["./","index.html","manifest.webmanifest","icon.svg"];
self.addEventListener("install",function(e){e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(FILES)}))});
self.addEventListener("activate",function(e){e.waitUntil(caches.keys().then(function(k){return Promise.all(k.filter(function(x){return x!==CACHE}).map(function(x){return caches.delete(x)}))}).then(function(){return self.clients.claim()}))});
self.addEventListener("message",function(e){if(e.data==="skip")self.skipWaiting()});
self.addEventListener("fetch",function(e){
if(e.request.method!=="GET")return;
e.respondWith(caches.match(e.request).then(function(hit){
return hit||fetch(e.request).then(function(r){
if(r&&(r.ok||r.type==="opaque")){var cp=r.clone();caches.open(CACHE).then(function(c){c.put(e.request,cp)})}
return r}).catch(function(){return caches.match("index.html")})}))});
