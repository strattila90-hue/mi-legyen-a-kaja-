/* Telepítési útmutató (iPhone / Android, pixel art képekkel) és az otthoni készlet értéke forintban. */
(function(){
/* ---------- készlet értéke ---------- */
function avg(p){var a=p.filter(function(x){return x>0});return a.length?a.reduce(function(s,x){return s+x},0)/a.length:0}
window.stockValue=function(){var v={fridge:0,pantry:0,freezer:0},cnt={fridge:0,pantry:0,freezer:0},unk=0,unkN=[],exp=0,shop=[0,0,0];
  items.forEach(function(i){if(!(i.q>0))return;var b=BASE[i.u]||["db",1],p=costOf(i.n,b[0],i.q*b[1]);
    if(days(i.exp)<0){if(p)exp+=avg(p);return}
    if(!p){if(!/^Maradék: /.test(i.n)){unk++;if(unkN.indexOf(i.n)<0)unkN.push(i.n)}return}
    var a=avg(p);v[i.loc]=(v[i.loc]||0)+a;cnt[i.loc]=(cnt[i.loc]||0)+1;for(var k=0;k<3;k++)shop[k]+=p[k]||a});
  return{v:v,cnt:cnt,tot:v.fridge+v.pantry+v.freezer,unk:unk,unkN:unkN,exp:exp,shop:shop}};
window.drawValue=function(){var el=$("stockval");if(!el)return;var s=stockValue(),bi=minI(s.shop);
  el.innerHTML='<h2><span class="ic">'+ic("coin")+'</span>Ennyit ér az otthoni készlet</h2>'+
    '<div class="svtot pf">'+ft(s.tot)+"</div>"+
    '<div class="sv-g">'+[["fridge","fridge","Hűtő"],["pantry","jar","Spájz"],["freezer","ice","Fagyasztó"]].map(function(l){return '<div class="sv"><span class="ic">'+ic(l[1])+"</span><b>"+ft(s.v[l[0]]).replace(" Ft","")+"</b><small>"+l[2]+" · Ft</small></div>"}).join("")+"</div>"+
    '<div class="q small">Becslés a Penny, Tesco és Lidl átlagárával, a meglévő mennyiségek arányában.'+
    (s.tot?" Ha ma mindent újra kellene venned: "+SHOPS.map(function(x,i){return (i===bi?"<b>":"")+x[1]+" "+ft(s.shop[i])+(i===bi?"</b>":"")}).join(" · ")+".":"")+
    (s.exp?' <span class="tag">Lejárt termékek: kb. '+ft(s.exp)+".</span>":"")+
    (s.unk?" "+s.unk+" tételnek nincs ára ("+esc(s.unkN.slice(0,3).join(", "))+(s.unkN.length>3?"…":"")+"), az árát a Bolt oldalon adhatod meg.":"")+"</div>"};

/* ---------- telepítési útmutató ---------- */
var ua=navigator.userAgent||"",IOS=/iPad|iPhone|iPod/.test(ua)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1),
  STANDALONE=!!(navigator.standalone||(window.matchMedia&&matchMedia("(display-mode: standalone)").matches)||/^android-app:/.test(document.referrer));
function r(x,y,w,h,c,cls){return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="'+c+'"'+(cls?' class="'+cls+'"':"")+"/>"}
function t(x,y,s,txt,c,anchor){return '<text x="'+x+'" y="'+y+'" font-size="'+s+'" fill="'+(c||"#3a2016")+'" font-family="KNum,Pixelify Sans,monospace" font-weight="600"'+(anchor?' text-anchor="'+anchor+'"':"")+">"+txt+"</text>"}
function pic(inner){return '<svg class="igpic" viewBox="0 0 60 40" shape-rendering="crispEdges" aria-hidden="true">'+inner+"</svg>"}
function shareIcon(x,y,c){return r(x,y+3,7,6,c)+r(x+1,y+4,5,4,"#fff")+r(x+3,y,1,6,c)+r(x+2,y+1,3,1,c)+r(x+1,y+2,1,1,c)+r(x+5,y+2,1,1,c)}
function arrowDown(x,y){return '<g class="igbounce">'+r(x+1,y,2,5,"#e4472b")+r(x,y+3,4,1,"#e4472b")+r(x+1,y+4,2,1,"#e4472b")+"</g>"}
var IPH=[
  ["Nyisd meg Safariban az appot, és koppints alul a Megosztás gombra.",pic(
    r(0,0,60,40,"#e8eef7")+r(4,2,52,24,"#fff")+t(30,10,4,"Mi legyen a kaja?","#e4472b","middle")+r(10,14,40,3,"#ffd36b")+r(10,19,28,3,"#9fdcd4")+
    r(0,30,60,10,"#f4f4f8")+r(0,29,60,1,"#c9c9d6")+t(7,37,6,"‹","#4aa3e8")+t(16,37,6,"›","#9a9aae")+shareIcon(27,30,"#2f7cf6")+r(24,29,13,11,"none","")+
    '<rect x="24.5" y="29.5" width="12" height="10" fill="none" stroke="#e4472b" stroke-width="1" class="igblink"/>'+r(41,32,5,5,"#9a9aae")+r(42,33,3,3,"#f4f4f8")+r(50,32,5,5,"#9a9aae")+arrowDown(29,22))],
  ["Görgess le a listában, és válaszd a „Főképernyőhöz adás” pontot.",pic(
    r(0,0,60,40,"#cfd6e2")+r(3,6,54,34,"#f4f4f8")+r(3,6,54,1,"#c9c9d6")+
    r(6,9,48,7,"#fff")+t(8,14,3.2,"Másolás")+r(48,10,4,5,"#9a9aae")+
    r(6,18,48,7,"#fff")+t(8,23,3.2,"Főképernyőhöz adás")+r(47,19,5,5,"#3a2016")+r(48,20,3,3,"#fff")+r(49,20,1,3,"#3a2016")+r(48,21,3,1,"#3a2016")+
    '<rect x="5.5" y="17.5" width="50" height="8" fill="none" stroke="#e4472b" stroke-width="1" class="igblink"/>'+
    r(6,27,48,7,"#fff")+t(8,32,3.2,"Kedvencekhez")+r(48,28,4,5,"#9a9aae"))],
  ["Koppints a „Hozzáadás” gombra. Kész! Az app a főképernyőn van, innen indítsd.",pic(
    r(0,0,60,40,"#4a5fa8")+r(0,0,60,40,"#5b3f8f","")+
    [[6,6,"#3fae5a"],[20,6,"#f2a33a"],[34,6,"#2fb5a8"],[48,6,"#f7d44a"],[6,20,"#e4472b"],[34,20,"#9a9aae"],[48,20,"#4aa3e8"]].map(function(a){return r(a[0],a[1],8,8,a[2])}).join("")+
    '<g class="igpop">'+r(19,19,10,10,"#fff")+r(20,20,8,8,"#e4472b")+r(21,24,6,3,"#fff4d6")+r(22,23,4,1,"#f2a33a")+r(23,21,2,2,"#3a2016")+"</g>"+
    t(24,34,3.4,"Mi a kaja?","#fff","middle")+r(31,17,1,1,"#ffd84a","igblink")+r(17,27,1,1,"#ffd84a","igblink")+r(30,29,1,1,"#ffd84a","igblink"))]];
var AND=[
  ["A legegyszerűbb: töltsd le az Android appot (APK), és nyisd meg a letöltött fájlt.",pic(
    r(0,0,60,40,"#e8f6e8")+r(18,4,24,30,"#3fae5a")+r(20,6,20,26,"#fff")+t(30,17,4,"APK","#25723a","middle")+arrowDown(28,20)+r(24,27,12,2,"#25723a"))],
  ["Ha kéri, engedélyezd az „Ismeretlen forrásból” telepítést, majd koppints a Telepítés gombra.",pic(
    r(0,0,60,40,"#f4f4f8")+r(6,8,48,24,"#fff")+t(30,17,4,"Telepíted az alkalmazást?","#3a2016","middle")+r(32,22,18,7,"#3fae5a")+t(41,27,4,"Telepítés","#fff","middle")+
    '<rect x="31.5" y="21.5" width="19" height="8" fill="none" stroke="#e4472b" stroke-width="1" class="igblink"/>')],
  ["Vagy Chrome-ban: a jobb felső ⋮ menü → „Hozzáadás a kezdőképernyőhöz” / „Alkalmazás telepítése”.",pic(
    r(0,0,60,40,"#e8eef7")+r(0,0,60,7,"#f4f4f8")+r(54,1,1,1,"#3a2016")+r(54,3,1,1,"#3a2016")+r(54,5,1,1,"#3a2016")+r(22,7,36,20,"#fff")+
    t(25,13,3.6,"Új lap")+t(25,19,3.6,"Alkalmazás telepítése")+'<rect x="23.5" y="15.5" width="34" height="5" fill="none" stroke="#e4472b" stroke-width="1" class="igblink"/>'+t(25,25,3.6,"Beállítások"))]];
/* ---------- további képek a lépésekhez ---------- */
function blinkBox(x,y,w,h){return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="none" stroke="#e4472b" stroke-width="1" class="igblink"/>'}
function dots(x,y,c){return r(x,y,1,1,c)+r(x+2,y,1,1,c)+r(x+4,y,1,1,c)}
var PIC_SAFARI=pic(r(0,0,60,40,"#f4f4f8")+r(0,0,60,7,"#ffffff")+t(4,5,3.2,"Messenger","#3a2016")+dots(51,3,"#3a2016")+blinkBox(49.5,1.5,8,4)+
  r(20,8,39,17,"#ffffff")+r(20,8,39,1,"#c9c9d6")+t(22,14,3,"Link másolása")+t(22,21,3,"Megnyitás Safariban","#2f7cf6")+blinkBox(21,17,37,6)+
  r(3,12,14,3,"#ffd36b")+r(3,18,10,3,"#9fdcd4")+r(4,28,52,8,"#ffffff")+t(30,33.5,3.4,"Mi legyen a kaja?","#e4472b","middle"));
var PIC_DOTS=pic(r(0,0,60,40,"#e8eef7")+r(4,2,52,22,"#fff")+t(30,10,4,"Mi legyen a kaja?","#e4472b","middle")+r(10,14,40,3,"#ffd36b")+
  r(26,8,32,16,"#ffffff")+r(26,8,32,1,"#c9c9d6")+shareIcon(28,10,"#2f7cf6")+t(37,16,3.4,"Megosztás","#3a2016")+blinkBox(27,9,30,8)+t(29,22,3,"Könyvjelző","#9a9aae")+
  r(0,29,60,11,"#f4f4f8")+r(0,29,60,1,"#c9c9d6")+t(5,37,6,"‹","#4aa3e8")+r(11,31,34,7,"#ffffff")+t(28,36,3.2,"kaja","#3a2016","middle")+dots(50,34,"#3a2016")+blinkBox(48.5,31.5,8,5)+arrowDown(51,24));
var PIC_ADD=pic(r(0,0,60,40,"#f4f4f8")+r(0,0,60,8,"#ffffff")+t(3,5.5,3.2,"Mégse","#2f7cf6")+t(57,5.5,3.2,"Hozzáadás","#2f7cf6","end")+blinkBox(40.5,1.5,18,6)+
  r(4,11,11,11,"#e4472b")+r(6,15,7,5,"#fff4d6")+r(7,14,5,1,"#f2a33a")+r(8,12,3,2,"#3a2016")+r(17,12,39,8,"#ffffff")+t(19,17.5,3.4,"Mi a kaja?")+
  r(4,26,52,9,"#ffffff")+t(6,31.5,3.2,"Megnyitás webappként")+r(45,28,10,5,"#3fae5a")+r(50,28.5,4,4,"#ffffff"));
var PIC_WHY=pic(r(0,0,60,40,"#5b3f8f")+[[6,5,"#3fae5a"],[20,5,"#f2a33a"],[34,5,"#2fb5a8"],[48,5,"#f7d44a"],[6,18,"#4aa3e8"],[34,18,"#9a9aae"],[48,18,"#e4472b"]].map(function(a){return r(a[0],a[1],8,8,a[2])}).join("")+
  '<g class="igpop">'+r(19,17,10,10,"#fff")+r(20,18,8,8,"#e4472b")+r(21,22,6,3,"#fff4d6")+r(22,21,4,1,"#f2a33a")+r(23,19,2,2,"#3a2016")+"</g>"+t(24,32,3.4,"Mi a kaja?","#fff","middle")+r(31,15,1,1,"#ffd84a","igblink")+r(17,25,1,1,"#ffd84a","igblink")+r(4,35,52,3,"#ffffff"));

/* ---------- lépésenkénti telepítő varázsló ---------- */
var IPAD=window.IS_IPAD,INAPP=/FBAN|FBAV|FB_IAB|Instagram|Line\/|Messenger|Snapchat|Twitter|LinkedInApp|GSA\/|Viber|MicroMessenger/.test(ua),
  SAFARI=IOS&&/Safari\//.test(ua)&&!INAPP&&!/CriOS|FxiOS|EdgiOS|OPiOS|YaBrowser|DuckDuckGo/.test(ua);
function appUrl(){return location.origin+location.pathname}
function shareGuide(){var url=appUrl()+"?telepites=1",text="Mi legyen a kaja? – családi étkezéstervező app (mi van otthon, mit főzzünk belőle, mennyibe kerül). Nyisd meg ezt a linket – iPhone-on Safariban –, és lépésről lépésre megmutatja, hogyan teheted a főképernyőre: "+url;
  if(navigator.share)navigator.share({title:"Mi legyen a kaja? – telepítés",text:text}).catch(function(){});
  else if(navigator.clipboard)navigator.clipboard.writeText(text).then(function(){toast("Kimásolva, küldd el üzenetben.")}).catch(function(){toast(text)});else toast(text)}
window.shareGuide=shareGuide;
function copyLink(){var u=appUrl()+"?telepites=1";(navigator.clipboard?navigator.clipboard.writeText(u):Promise.reject()).then(function(){toast("Link kimásolva. Nyisd meg a Safarit, koppints a címsorra, és illeszd be.")}).catch(function(){toast(u)})}
var BEN='<ul class="igben"><li><b>Saját ikon</b> a főképernyőn, egy koppintással indul</li><li><b>Teljes képernyő</b>, mint egy igazi app</li><li><b>Értesítés</b>, ha valami hamarosan lejár</li><li><b>Biztonságban az adatok:</b> a Safari 7 nap használat nélkül törölheti a weboldalak adatait, a főképernyős app nem</li></ul>';
function iosSteps(){var L=[{h:"Tedd a főképernyőre!",p:"Egy perc az egész, és utána igazi appként használhatod. Végigvezetlek lépésről lépésre.",pic:PIC_WHY,x:BEN}];
  if(!SAFARI)L.push({h:"Nyisd meg Safariban",pic:PIC_SAFARI,p:INAPP?"Ezt az oldalt most egy másik app (pl. Messenger vagy Facebook) nyitotta meg, abból nem lehet telepíteni. Koppints a jobb felső ••• vagy ⋯ gombra, és válaszd a „Megnyitás Safariban” (vagy „Megnyitás böngészőben”) lehetőséget.":"Telepíteni a Safariból a legegyszerűbb. Másold ki a linket, nyisd meg a Safarit (iránytű ikon), koppints a címsorra, és illeszd be.",
    x:'<button type="button" class="btn t full" data-igcopy>Link másolása</button>'});
  L.push({h:"Koppints a Megosztás gombra",pic:'<div class="igpics"><figure>'+IPH[0][1]+'<figcaption>Ha alul látod a Megosztás gombot</figcaption></figure><figure>'+PIC_DOTS+"<figcaption>iOS 26: előbb a ••• gomb</figcaption></figure></div>",
    p:IPAD?"iPaden a Megosztás gomb (négyzet, felfelé mutató nyíllal) fent, a címsor mellett jobbra van.":"Lent a Safari sávján keresd a négyzetet felfelé mutató nyíllal. Ha nem látod, koppints jobbra lent a ••• gombra, és ott válaszd a Megosztás pontot.",
    x:SAFARI?'<button type="button" class="btn p full" data-ighint>Mutasd, hol van!</button>':""});
  L.push({h:"„Főképernyőhöz adás”",pic:IPH[1][1],p:"A felugró listában görgess lejjebb, és koppints a „Főképernyőhöz adás” sorra. Ha nincs ott, görgess a lista aljára, vagy koppints a „Továbbiak” lehetőségre."});
  L.push({h:"Koppints a Hozzáadás gombra",pic:PIC_ADD,p:"Jobbra fent koppints a „Hozzáadás” gombra. Ha látsz egy „Megnyitás webappként” kapcsolót, azt hagyd bekapcsolva (zöld)."});
  L.push({h:"Kész!",pic:IPH[2][1],p:"Az app ikonja („Mi a kaja?”) ott van a főképernyőn: mostantól mindig innen indítsd. Ezt a Safari-lapot bezárhatod.",
    x:'<div class="q small">Tipp: az első indítás után a Beállítások → Lejárati értesítés résznél kapcsold be az értesítést. Ha a család is használja, a Közös raktárral mindenki ugyanazt látja.</div>'});return L}
function andSteps(){return [{h:"Tedd a telefonodra!",p:"Egy perc az egész, és utána igazi appként használhatod.",pic:PIC_WHY,x:BEN.replace(/<li><b>Biztonságban[\s\S]*?<\/li>/,"")}].concat(AND.map(function(s,i){return{h:["Android app letöltése","Telepítés","Vagy Chrome-ból"][i],p:s[0],pic:s[1],
    x:i===0?'<a class="btn t full" href="https://github.com/strattila90-hue/mi-legyen-a-kaja-/releases/download/apk-latest/mi-legyen-a-kaja.apk" rel="noopener">APK letöltése</a>':""}}))}
var GW={w:IOS?"ios":"and",i:0};
function guide(which,step){var d=$("ig");if(which)GW.w=which;GW.i=step||0;renderGuide();if(!d.open)d.showModal()}
function renderGuide(){var d=$("ig"),b=d.querySelector(".dbody"),o;
  if(STANDALONE){b.innerHTML='<div class="igstep big">'+PIC_WHY+'<p class="igh pf">Már telepítve van!</p><p>Az appot most a főképernyőről használod. Ha másnak is megmutatnád, küldd el neki az útmutatót: lépésről lépésre végigvezeti.</p></div>'+
      '<div class="btns"><button type="button" class="btn t" data-igshare>Útmutató küldése</button><button type="button" class="btn g" data-igok>Rendben</button></div>';return}
  var L=GW.w==="ios"?iosSteps():andSteps();GW.i=Math.max(0,Math.min(GW.i,L.length-1));var s=L[GW.i],last=GW.i===L.length-1;
  o='<div class="chips igplat"><button type="button" class="chip" data-ig="ios" aria-pressed="'+(GW.w==="ios")+'">iPhone, iPad</button><button type="button" class="chip" data-ig="and" aria-pressed="'+(GW.w==="and")+'">Android</button></div>';
  o+='<div class="igdots" aria-label="'+(GW.i+1)+'. lépés a '+L.length+'-ből">'+L.map(function(x,k){return '<i class="'+(k<GW.i?"done":k===GW.i?"on":"")+'"></i>'}).join("")+'<span class="q small">'+(GW.i?GW.i+". lépés / "+(L.length-1):"Kezdés")+"</span></div>";
  o+='<div class="igstep big">'+(GW.i?'<div class="ignum pf">'+GW.i+"</div>":"")+s.pic+'<p class="igh pf">'+esc(s.h)+"</p><p>"+esc(s.p)+"</p>"+(s.x||"")+"</div>";
  o+='<div class="btns igbtns">'+(GW.i?'<button type="button" class="btn p" data-igstep="-1">◀ Vissza</button>':"")+(last?'<button type="button" class="btn g" data-igok>Kész, értem</button>':'<button type="button" class="btn g" data-igstep="1">'+(GW.i?"Tovább ▶":"Kezdjük ▶")+"</button>")+"</div>";
  o+='<button type="button" class="btn sm full igsh" data-igshare>Útmutató küldése másnak (pl. nagyinak)</button>';
  b.innerHTML=o;var st=b.querySelector(".igstep");if(st&&st.scrollIntoView)b.scrollTop=0}
window.installGuide=guide;
/* „Mutasd, hol van”: a valódi Safari-sáv felé mutató nyíl */
function showHint(){$("ig").close();var h=$("shhint");if(!h){h=document.createElement("div");h.id="shhint";document.body.appendChild(h)}
  h.className="shhint"+(IPAD?" ipad":"");h.innerHTML='<div class="shbub"><b>'+(IPAD?"Fent, a címsor mellett jobbra":"Lent, a Safari sávján")+'</b> koppints a Megosztás gombra '+'<svg viewBox="0 0 8 10" class="shic" shape-rendering="crispEdges" aria-hidden="true">'+shareIcon(0,0,"#2f7cf6")+"</svg>"+
    (IPAD?"":'<br><span class="small">Ha nincs ott, előbb a ••• gombra (jobbra lent).</span>')+'<div class="btns"><button type="button" class="btn g sm" data-ignext>Megvan, tovább ▶</button></div></div><div class="sharr" aria-hidden="true"></div>';
  h.hidden=false}
document.addEventListener("click",function(e){var b;
  if((b=e.target.closest("[data-ig]"))){guide(b.dataset.ig,0);return}
  if((b=e.target.closest("[data-igstep]"))){GW.i+=+b.dataset.igstep;renderGuide();return}
  if(e.target.closest("[data-igok]")){$("ig").close();return}
  if(e.target.closest("[data-igshare]")){shareGuide();return}
  if(e.target.closest("[data-igcopy]")){copyLink();return}
  if(e.target.closest("[data-ighint]")){showHint();return}
  if(e.target.closest("[data-ignext]")){var h=$("shhint");if(h)h.hidden=true;guide("ios",GW.i+1);return}
  if((b=e.target.closest("[data-instx]"))){try{localStorage.setItem("kajax.instban",String(Date.now()))}catch(x){}var bn=$("instban");if(bn)bn.remove();return}});

/* ---------- telepítés-ajánló sáv a Raktár tetején (böngészőben, nem telepítve) ---------- */
function banner(){if(STANDALONE||$("instban"))return;var last=0;try{last=+(localStorage.getItem("kajax.instban")||0)}catch(e){}if(Date.now()-last<10*864e5)return;
  var v=$("v-stock");if(!v)return;var d=document.createElement("div");d.className="fxban inst";d.id="instban";
  d.innerHTML='<span class="ic">'+ic("heart")+'</span><span><b>Tedd a főképernyőre!</b><br><span class="small">'+(IOS?"1 perc, és appként indul.":"Appként indul, saját ikonnal.")+'</span></span><button type="button" class="btn sm g" data-ig="'+(IOS?"ios":"and")+'">Megmutatom</button><button type="button" class="x" data-instx aria-label="Elrejtés">×</button>';
  v.insertBefore(d,v.firstChild)}

/* bekötés */
function whenFree(fn){if(!document.querySelector("dialog[open]")){fn();return}
  var h=function(){setTimeout(function(){if(document.querySelector("dialog[open]"))return;document.removeEventListener("close",h,true);fn()},350)};document.addEventListener("close",h,true)}
var ap=$("apk");if(ap&&(IOS||STANDALONE))ap.hidden=true;
var gb=$("igbtn");if(gb)gb.onclick=function(){guide()};
var gs=$("igshare");if(gs)gs.onclick=shareGuide;
var ins=$("inst");if(ins){var old=ins.onclick;ins.onclick=function(){if(IOS||!window.DEF_PROMPT_AVAILABLE){guide();return}old&&old()}}
window.addEventListener("beforeinstallprompt",function(){window.DEF_PROMPT_AVAILABLE=true;if(ins){ins.onclick=function(){if(DEF){DEF.prompt();DEF=null}else guide()}}});
var wantGuide=window.BOOTQ&&BOOTQ.has("telepites");
if(wantGuide&&location.search.indexOf("telepites")>=0)history.replaceState(null,"",location.pathname);
if(wantGuide&&!STANDALONE){setTimeout(function(){whenFree(function(){guide(IOS?"ios":"and",0)})},700)}
else if(IOS&&!STANDALONE){var seen=null;try{seen=localStorage.getItem("kajax.iosguide")}catch(e){}
  if(!seen)setTimeout(function(){whenFree(function(){guide("ios");try{localStorage.setItem("kajax.iosguide","1")}catch(e){}})},1500)}
if(!/^android-app:/.test(document.referrer))banner();
if(window.drawValue)drawValue();
})();
