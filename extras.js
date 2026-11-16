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
function t(x,y,s,txt,c,anchor){return '<text x="'+x+'" y="'+y+'" font-size="'+s+'" fill="'+(c||"#3a2016")+'" font-family="Pixelify Sans,monospace" font-weight="600"'+(anchor?' text-anchor="'+anchor+'"':"")+">"+txt+"</text>"}
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
function guide(which){var d=$("ig"),w=which||(IOS?"ios":"and"),L=w==="ios"?IPH:AND;
  d.querySelector(".dbody").innerHTML='<div class="chips"><button type="button" class="chip" data-ig="ios" aria-pressed="'+(w==="ios")+'">iPhone</button><button type="button" class="chip" data-ig="and" aria-pressed="'+(w==="and")+'">Android</button></div>'+
    '<div class="igsteps">'+L.map(function(s,i){return '<div class="igstep"><div class="ignum pf">'+(i+1)+"</div>"+s[1]+"<p>"+esc(s[0])+(w==="and"&&i===0?' <a class="btn t sm" href="https://github.com/strattila90-hue/mi-legyen-a-kaja-/releases/download/apk-latest/mi-legyen-a-kaja.apk" rel="noopener">APK letöltése</a>':"")+"</p></div>"}).join("")+"</div>"+
    (w==="ios"?'<div class="q small">Csak Safariban (vagy iOS 16.4 felett Chrome-ban is) működik. A főképernyőről indított app nem veszíti el az adatait, és ott az értesítés is bekapcsolható.</div>':"")+
    '<button type="button" class="btn g full" id="igok">Értem</button>';
  if(!d.open)d.showModal();$("igok").onclick=function(){d.close()}}
window.installGuide=guide;
document.addEventListener("click",function(e){var b=e.target.closest("[data-ig]");if(b)guide(b.dataset.ig)});

/* bekötés */
var ap=$("apk");if(ap&&(IOS||STANDALONE))ap.hidden=true;
var gb=$("igbtn");if(gb)gb.onclick=function(){guide()};
var ins=$("inst");if(ins){var old=ins.onclick;ins.onclick=function(){if(IOS||!window.DEF_PROMPT_AVAILABLE){guide();return}old&&old()}}
window.addEventListener("beforeinstallprompt",function(){window.DEF_PROMPT_AVAILABLE=true;if(ins){ins.onclick=function(){if(DEF){DEF.prompt();DEF=null}else guide()}}});
if(IOS&&!STANDALONE){var seen=null;try{seen=localStorage.getItem("kajax.iosguide")}catch(e){}
  if(!seen)setTimeout(function(){if(document.querySelector("dialog[open]"))return;guide("ios");try{localStorage.setItem("kajax.iosguide","1")}catch(e){}},1500)}
if(window.drawValue)drawValue();
})();
