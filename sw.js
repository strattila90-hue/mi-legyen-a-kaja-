/* Service worker: hálózat először (mindig a legfrissebb verzió), offline a tárolt másolat. */
var CACHE="kaja-v1.10";
var FILES=["./","index.html","style.css","sprites.js","scenes.js","data.js","app.js","firebase-config.js","sync.js","features.js","extras.js","vendor/firebase-app-compat.js","vendor/firebase-auth-compat.js","vendor/firebase-firestore-compat.js","manifest.webmanifest","icon.svg","icon-192.png","icon-512.png"];
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
/* lejárati értesítés a háttérben (ha a telefon engedi), és értesítésre koppintás */
self.addEventListener("periodicsync",function(e){if(e.tag!=="kaja-expiry")return;e.waitUntil(caches.open("kaja-data").then(function(c){return c.match("/__kaja_expiry")}).then(function(r){return r?r.json():null}).then(function(d){
  if(!d||!d.on)return;var now=new Date(),t=new Date(now.toDateString()),soon=(d.items||[]).filter(function(i){var x=Math.round((new Date(i.e+"T00:00:00")-t)/864e5);return x>=0&&x<=1});
  if(!soon.length||now.getHours()<d.h)return;return self.registration.showNotification("Hamarosan lejár: "+soon.map(function(i){return i.n}).slice(0,4).join(", "),{body:"Nézd meg az appban, mit főzhetsz belőle.",icon:"icon-192.png",tag:"kaja-expiry"})}))});
self.addEventListener("notificationclick",function(e){e.notification.close();e.waitUntil(self.clients.matchAll({type:"window"}).then(function(l){for(var i=0;i<l.length;i++)if("focus" in l[i])return l[i].focus();return self.clients.openWindow("./")}))});
