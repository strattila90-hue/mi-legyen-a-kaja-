/* Közös raktár: valós idejű szinkron Firebase Firestore-ral.
   Szerkezet: kaja/{háztartáskód}/{items|shop|meals|exps|recipes}/{tételazonosító} és kaja/{kód}/meta/{bud|prices|prods|set}
   Tételenként szinkronizál, így két telefon egyszerre is írhat. */
(function(){
var CFG_KEY="kajasync.cfg",HAZ_KEY="kaja.haz.v1",LAST_KEY="kajasync.last";
var ARR={"kaja.raktar.v1":["items","items"],"kaja.lista.v1":["shop","shop"],"kaja.naplo.v1":["meals","meals"],"kaja.kiadas.v1":["exps","exps"],"kaja.recept.v1":["recipes","ownRec"]};
var OBJ={"kaja.keret.v1":["bud","bud"],"kaja.ar.v1":["prices","prices"],"kaja.termek.v1":["prods","prods"],"kaja.beall.v1":["set","set"]};
var SETF=["ad","te","ch","to","basics"];
var db=null,on=false,applying=false,last=null,unsub=[],status="off",err="",lastSync=null,loading=null;

function lget(k){try{return localStorage.getItem(k)}catch(e){return null}}
function lset(k,v){try{if(v==null)localStorage.removeItem(k);else localStorage.setItem(k,v)}catch(e){}}
function cfg(){if(window.FIREBASE_CONFIG&&window.FIREBASE_CONFIG.apiKey)return window.FIREBASE_CONFIG;try{return JSON.parse(lget(CFG_KEY)||"null")}catch(e){return null}}
function code(){return lget(HAZ_KEY)?JSON.parse(lget(HAZ_KEY)):null}
function fmtCode(c){return c?c.slice(0,5)+"-"+c.slice(5):""}
function clean(o){return JSON.parse(JSON.stringify(o))}
function objVal(k){var v=window[OBJ[k][1]];if(k==="kaja.beall.v1"){var o={};SETF.forEach(function(f){o[f]=v[f]});return o}return v==null?null:v}
function saveLast(){lset(LAST_KEY,JSON.stringify(last))}
function setStatus(s,e){status=s;err=e||"";if(window.drawSync)drawSync()}
function base(){return db.collection("kaja").doc(code())}

function loadScript(src){return new Promise(function(res,rej){var s=document.createElement("script");s.src=src;s.onload=res;s.onerror=function(){rej(new Error("Nem tölthető be: "+src))};document.head.appendChild(s)})}
function loadSdk(){if(window.firebase&&firebase.firestore)return Promise.resolve();if(loading)return loading;
  loading=loadScript("vendor/firebase-app-compat.js").then(function(){return loadScript("vendor/firebase-auth-compat.js")}).then(function(){return loadScript("vendor/firebase-firestore-compat.js")});return loading}

/* helyi változások feltöltése (különbség a legutóbb szinkronizált állapothoz képest) */
function pushKey(k){if(!on||applying)return;var b=db.batch(),n=0,ops=[];
  if(ARR[k]){var col=base().collection(ARR[k][0]),arr=window[ARR[k][1]]||[],seen={},L=last.a[k]||(last.a[k]={});
    arr.forEach(function(o){if(!o||!o.id)return;var j=JSON.stringify(o);seen[o.id]=1;if(L[o.id]!==j){ops.push(["set",col.doc(String(o.id)),clean(o)]);L[o.id]=j}});
    Object.keys(L).forEach(function(id){if(!seen[id]){ops.push(["del",col.doc(id)]);delete L[id]}})}
  else if(OBJ[k]){var j=JSON.stringify(objVal(k));if(last.o[k]!==j){ops.push(["set",base().collection("meta").doc(OBJ[k][0]),{v:j,t:Date.now()}]);last.o[k]=j}}
  if(!ops.length)return;saveLast();
  var chunks=[];for(var i=0;i<ops.length;i+=400)chunks.push(ops.slice(i,i+400));
  chunks.forEach(function(ch){var bt=db.batch();ch.forEach(function(op){if(op[0]==="set")bt.set(op[1],op[2]);else bt.delete(op[1])});
    bt.commit().then(function(){lastSync=Date.now();if(status!=="ok")setStatus("ok");else if(window.drawSync)drawSync()}).catch(function(e){setStatus("error",errText(e))})})}
function pushAll(){Object.keys(ARR).concat(Object.keys(OBJ)).forEach(pushKey)}

/* távoli változások alkalmazása: a meglévő objektumokat helyben frissíti, hogy a nyitott űrlapok ne szakadjanak el */
var redrawT=null;function redraw(){clearTimeout(redrawT);redrawT=setTimeout(function(){if(window.drawAll)drawAll()},120)}
function applyArr(k,docs){var name=ARR[k][1],arr=window[name]||[],byId={},L={},out=[];
  arr.forEach(function(o){if(o&&o.id)byId[o.id]=o});
  var remote={};docs.forEach(function(d){remote[d.id]=d.data()});
  arr.forEach(function(o){if(o&&o.id&&remote[o.id]){var r=remote[o.id];Object.keys(o).forEach(function(f){if(!(f in r))delete o[f]});Object.assign(o,r);out.push(o)}});
  Object.keys(remote).sort().forEach(function(id){if(!byId[id]){var r=remote[id];r.id=r.id||id;out.push(r)}});
  out.forEach(function(o){L[o.id]=JSON.stringify(o)});
  var changed=JSON.stringify(arr)!==JSON.stringify(out);
  applying=true;window[name]=out;lset(k,JSON.stringify(out));applying=false;last.a[k]=L;saveLast();
  if(changed){if(k==="kaja.termek.v1"&&window.reindex)reindex();redraw()}}
function applyObj(k,data){if(!data||typeof data.v!=="string")return;var v;try{v=JSON.parse(data.v)}catch(e){return}
  if(last.o[k]===data.v)return;last.o[k]=data.v;saveLast();applying=true;
  if(k==="kaja.beall.v1"){SETF.forEach(function(f){if(v&&f in v)window.set[f]=v[f]});lset(k,JSON.stringify(window.set))}
  else{window[OBJ[k][1]]=v;lset(k,JSON.stringify(v));if(k==="kaja.termek.v1"&&window.reindex)reindex()}
  applying=false;redraw()}

function subscribe(){unsub.forEach(function(u){u()});unsub=[];
  Object.keys(ARR).forEach(function(k){unsub.push(base().collection(ARR[k][0]).onSnapshot(function(s){applyArr(k,s.docs);lastSync=Date.now();if(status!=="ok")setStatus("ok")},function(e){setStatus("error",errText(e))}))});
  unsub.push(base().collection("meta").onSnapshot(function(s){s.docs.forEach(function(d){var k=Object.keys(OBJ).filter(function(x){return OBJ[x][0]===d.id})[0];if(k)applyObj(k,d.data())});lastSync=Date.now()},function(e){setStatus("error",errText(e))}))}

/* első csatlakozás: a két oldal adatainak összefésülése (semmi nem vész el) */
function firstMerge(){var ps=Object.keys(ARR).map(function(k){return base().collection(ARR[k][0]).get().then(function(s){
    var arr=window[ARR[k][1]]||[],have={};arr.forEach(function(o){if(o&&o.id)have[o.id]=1});
    s.docs.forEach(function(d){if(!have[d.id]){var r=d.data();r.id=r.id||d.id;arr.push(r)}});window[ARR[k][1]]=arr;lset(k,JSON.stringify(arr))})});
  ps.push(base().collection("meta").get().then(function(s){s.docs.forEach(function(d){var k=Object.keys(OBJ).filter(function(x){return OBJ[x][0]===d.id})[0];if(!k)return;
    var cur=objVal(k);if(cur==null||(k==="kaja.ar.v1"&&!Object.keys(cur).length)||(k==="kaja.termek.v1"&&!cur.length))applyObj(k,d.data());
    else if(k==="kaja.ar.v1"||k==="kaja.termek.v1"){try{var r=JSON.parse(d.data().v);if(k==="kaja.ar.v1")window.prices=Object.assign({},r,window.prices);else{var names={};window.prods.forEach(function(p){names[p.n]=1});r.forEach(function(p){if(!names[p.n])window.prods.push(p)})}}catch(e){}}})}));
  return Promise.all(ps)}

function errText(e){var c=(e&&e.code)||"",m=(e&&e.message)||String(e);
  if(/operation-not-allowed|admin-restricted/.test(c))return "A Firebase-ben nincs bekapcsolva a névtelen (Anonymous) bejelentkezés.";
  if(/permission-denied/.test(c))return "A Firestore szabályai nem engedik az írást. Add hozzá a kaja szabályt.";
  if(/unavailable|network/.test(c))return "Nincs kapcsolat, offline mentem, és később szinkronizálok.";
  if(/api-key|invalid/.test(c))return "Hibás Firebase beállítás (apiKey).";return m}

function connect(isNew){var c=cfg();if(!c){setStatus("nocfg");return Promise.resolve()}if(!code()){setStatus("off");return Promise.resolve()}
  setStatus("connecting");
  return loadSdk().then(function(){if(!firebase.apps.length){firebase.initializeApp(c);try{firebase.firestore().enablePersistence({synchronizeTabs:true}).catch(function(){})}catch(e){}}
    db=firebase.firestore();return firebase.auth().currentUser?null:firebase.auth().signInAnonymously()})
  .then(function(){try{last=JSON.parse(lget(LAST_KEY)||"null")}catch(e){last=null}
    var first=!last||last.code!==code();if(first)last={code:code(),a:{},o:{}};on=true;
    return (first?firstMerge():Promise.resolve()).then(function(){pushAll();subscribe();if(first&&window.drawAll)drawAll();setStatus("ok")})})
  .catch(function(e){on=false;setStatus("error",errText(e))})}

function newCode(){var a="ABCDEFGHJKLMNPQRSTUVWXYZ23456789",s="",r=new Uint32Array(10);crypto.getRandomValues(r);for(var i=0;i<10;i++)s+=a[r[i]%a.length];return s}
function normCode(s){return String(s||"").toUpperCase().replace(/[^A-Z0-9]/g,"")}
function join(c){c=normCode(c);if(c.length!==10){toast("A kód 10 karakter (pl. ABCDE-23456).");return}lset(HAZ_KEY,JSON.stringify(c));lset(LAST_KEY,null);last=null;connect()}
function leave(){unsub.forEach(function(u){u()});unsub=[];on=false;lset(HAZ_KEY,null);lset(LAST_KEY,null);last=null;setStatus("off");toast("Kiléptél a közös raktárból. Az adatok ezen a telefonon megmaradnak.")}
function link(){return location.origin+location.pathname+"?haz="+fmtCode(code())}

window.SYNC={push:pushKey,connect:connect,join:join,leave:leave,code:code,status:function(){return status}};

/* ---------- felület a Beállításokban ---------- */
window.drawSync=function(){var st=$("syst"),bt=$("sybtns");if(!st)return;var c=code(),hasCfg=!!cfg();
  $("sycfg").hidden=hasCfg||!!(window.FIREBASE_CONFIG&&window.FIREBASE_CONFIG.apiKey);
  if(!hasCfg){st.innerHTML="A közös raktárhoz még nincs megadva a Firebase beállítás. Másold be alább a Firebase projekted <b>firebaseConfig</b> részét.";bt.innerHTML="";return}
  if(!c){st.innerHTML="Kikapcsolva. Hozz létre egy közös raktárat, és küldd el a kódot a családnak, vagy csatlakozz egy meglévőhöz.";
    bt.innerHTML='<button type="button" class="btn g" id="synew">Új közös raktár</button><button type="button" class="btn" id="syjoin">Csatlakozás kóddal</button>';
    $("synew").onclick=function(){gform("Új közös raktár",[{k:"nt",t:"note"}],null,function(){join(newCode())},null);$("gs").textContent="Létrehozás";
      $("g_nt").textContent="A telefonon lévő raktár, lista, receptek, napló és kiadások feltöltődnek a közös raktárba. Utána a kóddal a család csatlakozhat."};
    $("syjoin").onclick=function(){askJoin("")};return}
  var s=status==="ok"?'<span class="badge ok">kapcsolódva</span>':status==="connecting"?'<span class="badge warn">kapcsolódás...</span>':status==="error"?'<span class="badge bad">hiba</span>':'<span class="badge">'+status+"</span>";
  st.innerHTML=s+' Háztartás kód: <b class="pf" style="font-size:20px">'+fmtCode(c)+"</b>"+(lastSync?'<div class="q small">Utolsó szinkron: '+new Date(lastSync).toLocaleTimeString("hu-HU")+"</div>":"")+(err?'<div style="margin-top:6px"><b>'+esc(err)+"</b></div>":"")+
    '<div class="q small" style="margin-top:6px">Aki ezt a kódot beírja, ugyanazt a raktárat, listát, recepteket, naplót és kiadásokat látja.</div>';
  bt.innerHTML='<button type="button" class="btn t" id="syshare">Kód küldése a családnak</button><button type="button" class="btn p" id="syleave">Kilépés</button>';
  $("syshare").onclick=function(){var t="Csatlakozz a közös konyhai raktárunkhoz a Mi legyen a kaja? appban! Kód: "+fmtCode(c)+" — vagy nyisd meg: "+link();
    if(navigator.share)navigator.share({title:"Mi legyen a kaja? – közös raktár",text:t}).catch(function(){});else if(navigator.clipboard)navigator.clipboard.writeText(t).then(function(){toast("Kimásolva, küldd el üzenetben.")});else toast(t)};
  $("syleave").onclick=function(){gform("Kilépés a közös raktárból",[{k:"nt",t:"note"}],null,leave,null);$("gs").textContent="Kilépés";$("g_nt").textContent="Ezen a telefonon megmaradnak az adatok, de már nem frissülnek a többiek változásaival. Biztos?"}};
function askJoin(pre){gform("Csatlakozás közös raktárhoz",[{k:"c",l:"Háztartás kód",t:"text",r:1,v:pre},{k:"nt",t:"note"}],null,function(o){join(o.c)},null);
  $("gs").textContent="Csatlakozás";$("g_nt").textContent="A telefonon lévő adatok összefésülődnek a közös raktárral, semmi nem vész el."}
var cb=$("sycfgsave");if(cb)cb.onclick=function(){var t=$("sycfgta").value,m=t.match(/\{[\s\S]*\}/),o=null;
  if(m){try{o=JSON.parse(m[0])}catch(e){try{o=Function('"use strict";return ('+m[0]+")")()}catch(e2){o=null}}}
  if(!o||!o.apiKey||!o.projectId){toast("Nem találom benne az apiKey és projectId mezőt.");return}
  lset(CFG_KEY,JSON.stringify({apiKey:o.apiKey,authDomain:o.authDomain,projectId:o.projectId,appId:o.appId,messagingSenderId:o.messagingSenderId,storageBucket:o.storageBucket}));toast("Firebase beállítás elmentve.");drawSync();connect()};

/* indulás */
var q=new URLSearchParams(location.search).get("haz");
if(q){history.replaceState(null,"",location.pathname);if(normCode(q)!==code()&&cfg())setTimeout(function(){showView("set");askJoin(fmtCode(normCode(q)))},400)}
drawSync();if(code())connect();
window.addEventListener("online",function(){if(code()&&!on)connect()});
})();
