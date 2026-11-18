var VER="1.21";
/* indításkori URL-paraméterek (a sync.js törli őket a címsorból) és platform */
var BOOTQ=new URLSearchParams(location.search),UA=navigator.userAgent||"";
var IS_IOS=/iPad|iPhone|iPod/.test(UA)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1),IS_IPAD=/iPad/.test(UA)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1);
var IS_STANDALONE=!!(navigator.standalone||(window.matchMedia&&matchMedia("(display-mode: standalone)").matches)||/^android-app:/.test(document.referrer));
if(IS_IOS)document.documentElement.classList.add("ios");if(IS_STANDALONE)document.documentElement.classList.add("standalone");
/* ---------- alapok ---------- */
function $(i){return document.getElementById(i)}
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function norm(s){return String(s||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").trim()}
function iso(t){return new Date(t.getTime()-t.getTimezoneOffset()*6e4).toISOString().slice(0,10)}
function plus(n){var t=new Date();t.setDate(t.getDate()+n);return iso(t)}
function days(e){return Math.round((new Date(e+"T00:00:00")-new Date(new Date().toDateString()))/864e5)}
function nf(q){var r=q>=10?Math.round(q):Math.round(q*10)/10;return String(r).replace(".",",")}
function ft(n){return Math.round(n).toLocaleString("hu-HU")+" Ft"}
function uid(p){return p+Date.now().toString(36)+Math.floor(Math.random()*1e4).toString(36)}
function ic(n){return spr(n)}
var K={items:"kaja.raktar.v1",bud:"kaja.keret.v1",exps:"kaja.kiadas.v1",meals:"kaja.naplo.v1",set:"kaja.beall.v1",rec:"kaja.recept.v1",shop:"kaja.lista.v1",price:"kaja.ar.v1",prod:"kaja.termek.v1"};
function ld(k,d){try{var r=localStorage.getItem(k);if(r!=null)return JSON.parse(r)}catch(e){}return d}
function sv(k,v){try{localStorage.setItem(k,JSON.stringify(v));if(window.SYNC)SYNC.push(k,v);return true}catch(e){toast("Nem sikerült menteni. Tele a tárhely?");return false}}
var toastT=null;
function toast(msg,act,fn){var t=$("toast");t.innerHTML="<span>"+esc(msg)+"</span>"+(act?'<button type="button">'+esc(act)+"</button>":"");t.hidden=false;
  if(act)t.querySelector("button").onclick=function(){t.hidden=true;fn()};clearTimeout(toastT);toastT=setTimeout(function(){t.hidden=true},act?6000:3200)}

/* ---------- termékkészlet ---------- */
var LOCK={f:"fridge",p:"pantry",z:"freezer"},LOCN={fridge:"Hűtő",pantry:"Spájz",freezer:"Fagyasztó"};
var CAT=CATALOG_SRC.map(function(x){var a=x.split("|");return{n:a[0],c:a[1],u:a[2],l:LOCK[a[3]],d:+a[4],pr:[+a[5],+a[6],+a[7]],solo:a[8]||""}});
var prods=ld(K.prod,[]),prices=ld(K.price,{}),PIDX={};
function allProds(){return CAT.concat(prods)}
function reindex(){PIDX={};allProds().forEach(function(c){if(!PIDX[norm(c.n)])PIDX[norm(c.n)]=c})}
reindex();
function find(n){return PIDX[norm(n)]}
function ico(n){if(NAMEI[n])return NAMEI[n];var c=find(n);return c?CATI[c.c]||"jar":"jar"}
var SHOPS=[["p","Penny","sh-p"],["t","Tesco","sh-t"],["l","Lidl","sh-l"]];
function priceOf(n){var c=find(n);if(!c)return null;var p=prices[c.n]||c.pr;return p&&p.some(function(x){return x>0})?p:null}
function punit(c){var b=BASE[c.u][0];return b==="g"?"kg":b==="ml"?"l":"db"}
/* egységek: minden mennyiség alapegységre (g, ml, db) váltva; g és ml egyenértékűnek számít (konyhai közelítés) */
var BASE={g:["g",1],dkg:["g",10],kg:["g",1000],ml:["ml",1],cl:["ml",10],dl:["ml",100],l:["ml",1000],ek:["ml",15],tk:["ml",5],db:["db",1],gerezd:["db",0.1],szelet:["db",0.05],csipet:["g",0.5]};
var SZ={"Kenyér":20,"Teljes kiőrlésű kenyér":20,"Toast kenyér":20,"Kalács":16,"Bagett":10,"Zsemle":2,"Kifli":2,"Hamburger zsemle":2,"Pita":1,"Tortilla":1,"Croissant":1,"Keksz":0.1};
function toBase(q,u,key){if(u==="szelet"){var s=SZ[key];if(s===0.1)return["g",q*8];return["db",q/(s||20)]}var b=BASE[u]||["db",1];return[b[0],q*b[1]]}
function same(a,b){return a===b||(a!=="db"&&b!=="db")}
/* darabsúly: 1 db hány gramm (ml) – így a grammban kért alma vagy a darabban tárolt paprika is átváltható */
var PCS={"Alma":180,"Körte":180,"Banán":120,"Narancs":200,"Mandarin":80,"Citrom":60,"Kivi":80,"Őszibarack":150,"Ananász":1200,"Avokádó":170,
  "Paprika":120,"Kaliforniai paprika":200,"Csípős paprika":30,"Paradicsom":120,"Koktélparadicsom":15,"Uborka":300,"Cukkini":300,"Padlizsán":350,"Karfiol":900,"Karalábé":250,"Retek":15,"Saláta":300,"Jégsaláta":500,"Gomba":25,
  "Vöröshagyma":100,"Lilahagyma":100,"Fokhagyma":50,"Újhagyma":20,"Póréhagyma":200,"Petrezselyem zöld":30,"Kapor":30,"Bazsalikom":20,"Tojás":55,
  "Zsemle":60,"Kifli":45,"Kenyér":1000,"Teljes kiőrlésű kenyér":750,"Toast kenyér":500,"Bagett":250,"Kalács":500,"Croissant":60,"Tortilla":60,"Pita":80,"Hamburger zsemle":70,
  "Bab konzerv":240,"Csicseriborsó konzerv":240,"Kukorica konzerv":285,"Zöldborsó konzerv":280,"Konzerv paradicsom":400,"Passata":500,"Paradicsompüré":140,"Kókusztej":400,"Csemegeuborka":350,
  "Tonhalkonzerv":120,"Szardíniakonzerv":90,"Fagyasztott pizza":350,"Leveskocka":10,"Sütőpor":12,"Vaníliás cukor":8,"Élesztő":42,"Pudingpor":40,"Tea":40,"Jégkrém":70};
function pcsOf(n){var w=PCS[n];if(w)return w;var c=find(n);if(c&&PCS[c.n])return PCS[c.n];var e=EQN&&EQN[norm(n)];if(e)for(var i=0;i<e.length;i++){var c2=find(e[i]);if(c2&&PCS[c2.n])return PCS[c2.n]}return 0}
/* mennyiség átváltása alapegységek között (g/ml egyenértékű, db a darabsúllyal); null, ha nem váltható */
function cvt(amt,from,to,n){if(same(from,to))return amt;var w=pcsOf(n);if(!w)return null;return from==="db"?amt*w:amt/w}
function costOf(n,bt,amt){var c=find(n),p=priceOf(n);if(!c||!p||!(amt>0))return null;var pb=BASE[c.u][0];if(!same(pb,bt)){amt=cvt(amt,bt,pb,c.n);if(amt==null)return null}
  var m=pb==="db"?amt:amt/1000;return p.map(function(x){return x*m})}
function fmtQ(amt,bt){if(bt==="g")return amt>=1000?nf(amt/1000)+" kg":nf(amt)+" g";if(bt==="ml")return amt>=1000?nf(amt/1000)+" l":amt>=100?nf(amt/100)+" dl":nf(amt)+" ml";return nf(amt)+" db"}
function fmtR(h,f){if(!h.menny)return"";var q=h.menny*f;if(h.egyseg==="csipet")return"1 csipet";
  if(h.egyseg==="g"&&q>=1000)return nf(q/1000)+" kg";if(h.egyseg==="ml"&&q>=1000)return nf(q/1000)+" l";return nf(q)+" "+h.egyseg}

/* ---------- állapot ---------- */
var DEFSET={ad:2,te:0,ch:0,to:0,basics:["Só","Fekete bors"],theme:"auto",lastBackup:null};
var set=Object.assign({},DEFSET,ld(K.set,{}));
var items,bud=ld(K.bud,null),exps=ld(K.exps,[]),meals=ld(K.meals,[]),ownRec=ld(K.rec,[]),shop=ld(K.shop,[]);
function demo(){return [["Tojás",6,"db","fridge",2],["Tej",1,"l","fridge",1],["Sajt",200,"g","fridge",5],["Sárgarépa",400,"g","fridge",8],["Paradicsom",3,"db","fridge",3],["Kenyér",1,"db","pantry",3],["Vaj",200,"g","fridge",20],["Rizs",1,"kg","pantry",240]].map(function(a,i){return{id:"d"+i,n:a[0],q:a[1],u:a[2],loc:a[3],exp:plus(a[4])}})}
items=ld(K.items,null)||demo();
function saveItems(){sv(K.items,items)}
function saveSet(){sv(K.set,set)}
function portions(){return Math.max(0.25,set.ad+set.te+set.ch*0.5+set.to*0.25)}
function people(){var a=[];if(set.ad)a.push(set.ad+" felnőtt");if(set.te)a.push(set.te+" kamasz");if(set.ch)a.push(set.ch+" gyerek");if(set.to)a.push(set.to+" kisgyerek");return a.join(", ")||"senki"}
function nightNow(){var h=new Date().getHours();return h>=19||h<7}
function applyTheme(){var r=document.documentElement,t=set.theme==="night"?(nightNow()?"dark":"light"):set.theme;if(t==="auto")r.removeAttribute("data-theme");else r.setAttribute("data-theme",t);
  var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute("content",t==="dark"||(t==="auto"&&matchMedia&&matchMedia("(prefers-color-scheme: dark)").matches)?"#1d1533":"#e4472b")}
setInterval(function(){if(set.theme==="night")applyTheme()},6e5);
applyTheme();

/* ---------- receptek ---------- */
var RCATS=[["leves","Leves"],["hus","Húsos étel"],["hal","Hal"],["foz","Főzelék"],["teszta","Tészta, köret"],["zoldseg","Zöldséges"],["salata","Saláta"],["szendvics","Szendvics"],["hidegtal","Hidegtál"],["hideg","Hideg étel"],["reggeli","Reggeli"],["desszert","Desszert"],["egyeb","Egyéb"]],RCN={};
RCATS.forEach(function(c){RCN[c[0]]=c[1]});
var RICO={leves:"pot",hus:"meat",hal:"fish",foz:"pot",teszta:"pasta",zoldseg:"veg",salata:"salad",szendvics:"sandwich",hidegtal:"platter",hideg:"salad",reggeli:"egg",desszert:"cake",egyeb:"rice"};
var COLD={salata:1,szendvics:1,hidegtal:1,hideg:1};
function isCold(r){return !r.meleg&&!!(r.hideg||COLD[r.cat])}
function allRec(){return BASE_RECIPES.concat(ownRec)}
function recById(id){return allRec().filter(function(r){return r.id===id})[0]}
function isBasic(k){return set.basics.indexOf(k)>=0}
/* rokon termékek: a fagyasztott vagy más fajta változat is kiváltja az alap hozzávalót */
var EQUIV={"Csirkemell (fagyasztott)":["Csirkemell"],"Darált hús (fagyasztott)":["Darált sertéshús","Darált marhahús","Darált pulykahús"],"Fagyasztott spenót":["Spenót"],"Fagyasztott brokkoli":["Brokkoli"],"Fagyasztott zöldborsó":["Zöldborsó konzerv"],
  "Laktózmentes tej":["Tej"],"Gouda":["Sajt"],"Teljes kiőrlésű kenyér":["Kenyér"],"Kaliforniai paprika":["Paprika"],"Görög joghurt":["Joghurt"],"Pulykasonka":["Sonka"],"Csirke felsőcomb filé":["Csirkecomb"],
  "Spagetti":["Tészta"],"Cérnametélt":["Tészta"],"Jégsaláta":["Saláta"],"Lilahagyma":["Vöröshagyma"],"Téliszalámi":["Szalámi"],"Csirkehús":["Csirkemell","Csirkecomb","Csirkeszárny","Egész csirke","Csirke felsőcomb filé"],"Csirke":["Csirkemell","Csirkecomb","Csirkeszárny","Egész csirke","Csirke felsőcomb filé"],"Sertéshús":["Sertéskaraj","Sertéscomb","Sertéslapocka","Sertéstarja","Sertésoldalas"],"Sertés":["Sertéskaraj","Sertéscomb","Sertéslapocka","Sertéstarja","Sertésoldalas"],"Darált hús":["Darált sertéshús","Darált marhahús","Darált pulykahús"],"Hús":["Csirkemell","Csirkecomb","Sertéskaraj","Sertéscomb","Sertéslapocka","Marhahús"],"Darált pulykahús":["Darált sertéshús"]},EQN={};
Object.keys(EQUIV).forEach(function(k){EQN[norm(k)]=EQUIV[k].map(norm)});
function matches(i,nk){var n=norm(i.n);return n===nk||(EQN[n]&&EQN[n].indexOf(nk)>=0)}
function liveOf(key){var nk=norm(key);return items.filter(function(i){return matches(i,nk)&&days(i.exp)>=0&&i.q>0})}
var THAWC={hus:1,hal:1,felv:1};
function needThaw(i){var c=find(i.n);return i.loc==="freezer"&&(/fagyasztott\)/.test(i.n)||(c&&THAWC[c.c]))}
var LOCS={fridge:"hűtő",pantry:"spájz",freezer:"fagyasztó"};
function have(key,bt){if(isBasic(key))return Infinity;var l=liveOf(key);if(!l.length)return 0;if(!bt)return Infinity;var s=0,mis=false;
  l.forEach(function(i){var b=BASE[i.u]||["db",1],a=cvt(i.q*b[1],b[0],bt,i.n);if(a!=null)s+=a;else mis=true});return s>0?s:(mis?Infinity:0)}
/* helyettesítők: ha a receptben kért (és a felsorolt változatok) egyike sincs itthon, ezek is jók. [név, mennyiségszorzó] */
var SUBS={"Tejföl":["Görög joghurt","Joghurt","Krémtúró"],"Joghurt":["Görög joghurt","Kefir","Tejföl"],"Görög joghurt":["Joghurt","Tejföl"],"Kefir":["Joghurt"],
  "Tejszín":["Habtejszín","Tej"],"Habtejszín":["Tejszín"],"Vaj":["Margarin","Étolaj"],"Margarin":["Vaj"],"Étolaj":["Olívaolaj","Zsír"],"Zsír":["Étolaj"],"Olívaolaj":["Étolaj"],
  "Zsemlemorzsa":["Kukoricapehely","Zabpehely"],"Citrom":[["Ecet",0.5]],"Ecet":["Citrom"],"Balzsamecet":["Ecet"],"Cukor":["Porcukor","Méz"],"Porcukor":["Cukor"],"Méz":["Cukor"],
  "Majonéz":["Tejföl","Görög joghurt"],"Mozzarella":["Sajt","Gouda"],"Parmezán":["Sajt","Gouda"],"Sajt":["Gouda","Ömlesztett sajt","Mozzarella"],"Gouda":["Sajt"],"Feta":["Mozzarella","Túró"],
  "Krémsajt":["Krémtúró","Túró","Mascarpone"],"Krémtúró":["Krémsajt","Túró"],"Túró":["Krémtúró","Cottage cheese"],"Mascarpone":["Krémsajt"],
  "Bacon":["Szalonna","Sonka"],"Szalonna":["Bacon"],"Sonka":["Pulykasonka","Párizsi"],"Füstölt kolbász":["Grillkolbász","Virsli"],"Virsli":["Füstölt kolbász"],"Füstölt csülök":["Füstölt kolbász","Szalonna"],
  "Csirkemell":["Pulykamell","Csirke felsőcomb filé"],"Pulykamell":["Csirkemell"],"Darált marhahús":["Darált sertéshús","Darált pulykahús"],"Darált sertéshús":["Darált marhahús","Darált pulykahús"],
  "Passata":["Konzerv paradicsom","Paradicsompüré"],"Konzerv paradicsom":["Passata",["Paradicsom",4]],"Paradicsompüré":["Passata"],
  "Vöröshagyma":["Lilahagyma","Póréhagyma",["Újhagyma",4]],"Lilahagyma":["Vöröshagyma"],"Újhagyma":["Vöröshagyma","Póréhagyma"],
  "Spagetti":["Tészta"],"Tészta":["Spagetti","Cérnametélt"],"Cérnametélt":["Tészta","Spagetti"],"Brokkoli":["Fagyasztott brokkoli","Karfiol"],"Karfiol":["Brokkoli"],"Spenót":["Fagyasztott spenót"],
  "Kenyér":["Teljes kiőrlésű kenyér","Toast kenyér","Bagett"],"Zsemle":["Kifli"],"Kifli":["Zsemle"],"Tortilla":["Pita"],"Pita":["Tortilla"],
  "Kukoricapehely":["Müzli"],"Müzli":["Zabpehely","Kukoricapehely"],"Petrezselyemgyökér":["Sárgarépa"],"Zellergumó":["Petrezselyemgyökér"],"Halfilé":["Lazac"],
  "Bab konzerv":[["Bab",0.4]],"Bab":[["Bab konzerv",2.4]],"Fagyasztott zöldborsó":["Zöldborsó konzerv"],"Cukkini":["Padlizsán"],"Kókusztej":["Tejszín"]};
function keyOk(k){return !window.FX||!FX.okKey||FX.okKey(k)}
function subFor(h){if(!h.k.length)return null;for(var j=0;j<h.k.length;j++){var L=SUBS[h.k[j]];if(!L)continue;
  for(var i=0;i<L.length;i++){var s=typeof L[i]==="string"?[L[i],1]:L[i],sk=s[0];if(h.k.indexOf(sk)>=0||!keyOk(sk))continue;
    var tb=h.menny?toBase(h.menny*s[1]*((h.kf&&h.kf[h.k[j]])||1),h.egyseg,sk):null,v=have(sk,tb&&tb[0]);if(v>0)return{k:sk,v:v,need:tb?tb[1]:0,bt:tb&&tb[0],sub:h.k[j]}}}return null}
function altNeed(h,k){return h.menny?toBase(h.menny*((h.kf&&h.kf[k])||1),h.egyseg,k):null}
function ddOf(k){if(isBasic(k))return 99;var l=liveOf(k);return l.length?Math.min.apply(null,l.map(function(i){return days(i.exp)})):99}
function check(r){var use=[],miss=[],omiss=[],sc=0,rq=0,subs=[],tot={};
  r.hozzavalok.forEach(function(h){if(h.f)return;var best=null;
    /* a változatok közül az nyer, amelyikből a legtöbb van (arányosan); egyenlőnél a hamarabb lejáró, különben a lista sorrendje */
    for(var j=0;j<h.k.length;j++){var k=h.k[j];if(!keyOk(k))continue;var tb=altNeed(h,k),v=have(k,tb&&tb[0]);if(!(v>0))continue;
      var need=tb?tb[1]:0,cov=need>0&&isFinite(v)?Math.min(1,v/need):1,dd=ddOf(k);
      if(!best||cov>best.cov+1e-6||(Math.abs(cov-best.cov)<1e-6&&dd<=3&&best.dd>3))best={k:k,v:v,need:need,bt:tb&&tb[0],cov:cov,dd:dd}}
    if(!best&&!h.o&&subs.length<2){var s=subFor(h);if(s){best=s;subs.push(s)}}
    if(!best){(h.o?omiss:miss).push(h);return}
    var key=best.k,basic=isBasic(key);
    if(!h.o&&!basic){rq++;if(best.need>0&&isFinite(best.v)){var tk=key+"|"+best.bt;tot[tk]=tot[tk]||{v:best.v,need:0};tot[tk].need+=best.need}}
    var lv=basic?[]:liveOf(key),dd=basic?99:Math.min.apply(null,lv.map(function(i){return days(i.exp)})),locs=[];lv.forEach(function(i){if(locs.indexOf(i.loc)<0)locs.push(i.loc)});var thaw=lv.length&&lv.every(needThaw);
    use.push({key:key,h:h,need:best.need,bt:best.bt,dd:dd,basic:basic,locs:locs,thaw:thaw,src:lv[0]&&lv[0].n,sub:best.sub||""});if(!basic)sc+=10-Math.min(dd,9)+3});
  /* ugyanabból a termékből több sor (pl. olaj a tésztába és a sütéshez): az igényeket összeadjuk */
  var ratio=Infinity;Object.keys(tot).forEach(function(k){ratio=Math.min(ratio,tot[k].v/tot[k].need)});
  var can=ratio===Infinity?Infinity:ratio*r.adag,P=portions(),bl=window.FX?FX.blocked(r):"";
  return{r:r,bl:bl,ok:!miss.length&&rq>0&&can>=0.5&&!bl,miss:miss,omiss:omiss,use:use,subs:subs,can:can,enough:can>=P-0.01,sc:sc-(r.mini?8:0)-subs.length*5+(can>=P?4:0)+fit(r,use)+(window.FX?FX.bonus(r):0),
    soon:use.some(function(u){return !u.basic&&u.dd<=2}),thaw:use.filter(function(u){return u.thaw}).map(function(u){return u.src})}}
/* tipp a hiányzó hozzávalóhoz: mi helyettesítheti (akkor is, ha az sincs itthon) */
function subTip(h){var o=[];h.k.forEach(function(k){(SUBS[k]||[]).forEach(function(s){var n=typeof s==="string"?s:s[0];if(h.k.indexOf(n)<0&&o.indexOf(n)<0)o.push(n)})});return o.slice(0,3)}
/* napszak és laktatósság szerinti súlyozás: a főételek és a több alapanyagot (főleg húst) felhasználó receptek előrébb kerülnek */
var MAINC={hus:1,hal:1,leves:1,foz:1,teszta:1,zoldseg:1,egyeb:1};
function fit(r,use){var h=new Date().getHours(),morning=h<10,b=0,n=0,meat=0;
  use.forEach(function(u){if(u.basic)return;n++;var c=find(u.src||u.key);if(c&&(c.c==="hus"||c.c==="hal"||/fagyasztott\)/.test(u.src||"")))meat++});
  b+=Math.min(n,7)*3+meat*6;
  if(morning){if(r.cat==="reggeli")b+=8}else{if(MAINC[r.cat])b+=10;if(r.cat==="reggeli")b-=8;if(h>=17&&COLD[r.cat])b+=2}
  /* hétköznap este a gyors, hétvégén ebédre a kiadósabb, hosszabb főzés is jöhet */
  var wd=new Date().getDay(),we=wd===0||wd===6;if(!we&&h>=17&&r.ido_perc>60)b-=6;if(!we&&h>=17&&r.ido_perc<=30&&MAINC[r.cat])b+=3;if(we&&h>=9&&h<14&&r.ido_perc>=60&&MAINC[r.cat])b+=3;
  /* változatosság: amit nemrég ettünk, az hátrébb kerül */
  var ld=lastAte(r.nev);if(ld<=1)b-=14;else if(ld<=3)b-=7;else if(ld<=6)b-=3;
  return b}
var LATE={k:"",m:{}};
function lastAte(n){var key=meals.length+"|"+plus(0)+"|"+(meals.length?meals[meals.length-1].id:"");if(LATE.k!==key){LATE.k=key;LATE.m={};var t=plus(0);
  meals.forEach(function(m){var d=days(m.date);if(d>0)return;d=-d;var nn=norm(m.n);if(LATE.m[nn]==null||d<LATE.m[nn])LATE.m[nn]=d})}
  var v=LATE.m[norm(n)];return v==null?99:v}
function solos(){var seen={},out=[];items.forEach(function(i){if(days(i.exp)<0||!(i.q>0))return;var c=find(i.n);if(!c||!c.solo||seen[c.n])return;seen[c.n]=1;
  out.push({solo:1,n:c.solo,key:c.n,dd:days(i.exp)})});return out.sort(function(a,b){return a.dd-b.dd})}
function feas(){return allRec().map(check).filter(function(c){return c.ok}).sort(function(x,y){return y.sc-x.sc})}
function recCost(r,c,f){var full=[0,0,0],mis=[0,0,0],unk=0,any=false;
  r.hozzavalok.forEach(function(h){if(h.f)return;var u=c.use.filter(function(x){return x.h===h})[0],isMiss=c.miss.indexOf(h)>=0;
    if(!u&&h.o)return;var key=u?u.key:h.k[0];if(!h.menny){unk++;return}
    var tb=u&&u.need>0?[u.bt,u.need*f]:toBase(h.menny*f*((h.kf&&h.kf[key])||1),h.egyseg,key),p=costOf(key,tb[0],tb[1]);if(!p){unk++;return}any=true;
    for(var i=0;i<3;i++){full[i]+=p[i];if(isMiss)mis[i]+=p[i]}});
  return{full:full,mis:mis,unk:unk,any:any}}
function minI(a){var m=0;for(var i=1;i<a.length;i++)if(a[i]<a[m])m=i;return m}

/* ---------- automatikus kiegészítés ---------- */
function search(v,n){var a=[];if(!v)return a;allProds().forEach(function(c){var nn=norm(c.n),s=-1;
  if(nn.indexOf(v)===0)s=0;else if((" "+nn).indexOf(" "+v)>=0)s=1;else if(nn.indexOf(v)>=0)s=2;if(s>=0)a.push([s,nn.length,c])});
  a.sort(function(x,y){return x[0]-y[0]||x[1]-y[1]});return a.slice(0,n).map(function(x){return x[2]})}
function hl(name,v){var i=norm(name).indexOf(v);if(i<0)return esc(name);return esc(name.slice(0,i))+"<mark>"+esc(name.slice(i,i+v.length))+"</mark>"+esc(name.slice(i+v.length))}
function ac(inp,box,onPick){var sel=-1,list=[];
  function render(){var v=norm(inp.value);list=search(v,8);
    if(!v||!list.length||(list.length===1&&norm(list[0].n)===v)){box.hidden=true;inp.setAttribute("aria-expanded","false");return}
    box.innerHTML=list.map(function(c,i){var p=priceOf(c.n),mp=p?Math.min.apply(null,p.filter(function(x){return x>0})):0;
      return '<button type="button" role="option" tabindex="-1" aria-selected="'+(i===sel)+'" data-i="'+i+'"><span class="ic">'+ic(ico(c.n))+"</span><span>"+hl(c.n,v)+'</span><span class="sx">'+esc(CATN[c.c]||"")+(mp?"<br>"+ft(mp)+"/"+punit(c):"")+"</span></button>"}).join("");
    box.hidden=false;inp.setAttribute("aria-expanded","true")}
  function pick(c){inp.value=c.n;box.hidden=true;sel=-1;if(onPick)onPick(c)}
  inp.addEventListener("input",function(){sel=-1;render()});
  inp.addEventListener("focus",function(){if(inp.value)render()});
  inp.addEventListener("keydown",function(e){if(box.hidden)return;
    if(e.key==="ArrowDown"){sel=Math.min(sel+1,list.length-1);render();e.preventDefault()}
    else if(e.key==="ArrowUp"){sel=Math.max(sel-1,0);render();e.preventDefault()}
    else if(e.key==="Enter"&&sel>=0){pick(list[sel]);e.preventDefault()}
    else if(e.key==="Escape"){box.hidden=true;e.preventDefault();e.stopPropagation()}});
  box.addEventListener("mousedown",function(e){e.preventDefault()});
  box.addEventListener("click",function(e){var b=e.target.closest("button");if(b)pick(list[+b.dataset.i])});
  inp.addEventListener("blur",function(){setTimeout(function(){box.hidden=true},180)})}

/* ---------- díszítés ---------- */
(function(){var cols=["#e4472b","#f2a33a","#2fb5a8","#f7d44a"],o="";
  for(var i=0;i<9;i++){var x=8+i*46;o+='<polygon points="'+x+',12 '+(x+32)+',12 '+(x+16)+',40" fill="'+cols[i%4]+'" stroke="#3a2016" stroke-width="3" stroke-linejoin="miter"/><rect class="bulb" x="'+(x+38)+'" y="12" width="6" height="6" fill="#fff3a0"/>'}
  $("flags").innerHTML=o;
  var k=["egg","tomato","cheese","carrot","meat","bread","fruit","veg","milk","fish","sandwich","salad","banana","pasta","cake"],f="",s=7;
  function r(){s=(s*9301+49297)%233280;return s/233280}
  for(var y=0;y<7;y++)for(var x2=0;x2<4;x2++){var n=k[(x2*3+y*5)%k.length],z=40+Math.round(r()*30);
    f+='<div class="ft" style="left:'+Math.round(x2*25+(y%2?12:2)+r()*6)+'%;top:'+Math.round(y*15+r()*6)+'%;width:'+z+'px;height:'+z+'px;transform:rotate('+Math.round(r()*30-15)+'deg)">'+ic(n)+"</div>"}
  $("ft").innerHTML=f;
  $("lg1").innerHTML=ic("pot");$("lg2").innerHTML=ic("egg");$("pot").innerHTML=ic("pot");$("hhi").innerHTML=ic("heart");
  [["i-coin","coin"],["i-coin2","coin"],["i-plus","plus"],["i-book","book"],["i-pen","pen"],["i-cart","cart"],["i-cart2","cart"],["i-chart","chart"],["i-heart","heart"],["i-gear","gear"]].forEach(function(a){$(a[0]).innerHTML=ic(a[1])});
  document.querySelectorAll("[data-i]").forEach(function(e){e.innerHTML=ic(e.dataset.i)});
  if(window.buildLocs)buildLocs()})();
document.querySelectorAll("dialog [data-close]").forEach(function(b){b.onclick=function(){b.closest("dialog").close()}});
document.querySelectorAll("dialog").forEach(function(d){d.addEventListener("click",function(e){if(e.target===d)d.close()})});

/* ---------- RAKTÁR ---------- */
var tab="fridge",cur=null,dfil="all",goIdx=0;
function cls(d){return d<=1?"bad":d<=4?"warn":"ok"}
function dtxt(d){return d<0?"lejárt":d===0?"ma lejár":d===1?"holnap lejár":d<30?d+" nap":"hosszú"}
function drawStock(){var a=items.filter(function(i){return i.loc===tab}).sort(function(x,y){return days(x.exp)-days(y.exp)});
  $("grid").innerHTML=a.length?a.map(function(i){var d=days(i.exp),p=Math.max(8,Math.min(Math.max(d,0),7)/7*100);
    return '<div class="slot '+cls(d)+'" data-id="'+i.id+'" tabindex="0" role="button" aria-label="'+esc(i.n)+' szerkesztése"><button type="button" class="x" data-x="'+i.id+'" aria-label="'+esc(i.n)+' törlése">×</button><div class="tile">'+ic(ico(i.n))+'</div><div class="n">'+esc(i.n)+'</div><div class="q">'+nf(i.q)+" "+i.u+'</div><div class="hp"><b style="width:'+p+'%"></b></div><div class="d">'+dtxt(d)+"</div></div>"}).join("")
    :'<div class="q">Itt még nincs semmi. Koppints az Új termék gombra.</div>';
  var cnt={};items.forEach(function(i){cnt[i.loc]=(cnt[i.loc]||0)+1});
  document.querySelectorAll(".tabs button").forEach(function(b){b.setAttribute("aria-selected",b.dataset.t===tab);var c=b.querySelector(".cnt");if(c)c.textContent=cnt[b.dataset.t]||"";b.setAttribute("aria-label",LOCN[b.dataset.t]+", "+(cnt[b.dataset.t]||0)+" tétel")});
  if(window.drawValue)drawValue();drawDishes()}
document.querySelectorAll(".tabs button").forEach(function(b){b.onclick=function(){tab=b.dataset.t;drawStock()}});
$("grid").onclick=function(e){var x=e.target.closest("[data-x]");if(x){e.stopPropagation();delItem(x.dataset.x);return}var s=e.target.closest(".slot");if(s)openItem(s.dataset.id)};
$("grid").onkeydown=function(e){var s=e.target.closest(".slot");if(s&&e.target===s&&e.key==="Enter")openItem(s.dataset.id);if(s&&e.target===s&&e.key==="Delete")delItem(s.dataset.id)};
function delItem(id){var i=items.filter(function(x){return x.id===id})[0];if(!i)return;var pos=items.indexOf(i),un=window.FX?FX.onDelete(i):null;items.splice(pos,1);saveItems();drawStock();
  toast(i.n+(un?" kidobva (lejárt).":" törölve."),"Visszavonás",function(){if(un)un();items.splice(pos,0,i);saveItems();drawStock()})}
ac($("fn"),$("fns"),function(c){fillFromCat(c)});
function fillFromCat(c){if(cur)return;$("fu").value=c.u;$("fl").value=c.l;$("fe").value=plus(c.d);
  if(!$("fq").value)$("fq").value={g:500,kg:1,dkg:20,ml:500,dl:2,l:1,db:1}[c.u]||1;priceHint();if(window.FX&&FX.qtySync)FX.qtySync()}
function priceHint(){var c=find($("fn").value),p=c&&priceOf(c.n);
  $("fph").innerHTML=p?"Átlagár: "+SHOPS.map(function(s,i){return s[1]+" "+ft(p[i])}).join(" · ")+" /"+punit(c):(c?"":($("fn").value.trim()?"Új termék: megjegyzem a következő alkalomra.":""))}
$("fn").addEventListener("input",function(){var c=find(this.value);if(c)fillFromCat(c);else priceHint()});
function openItem(id){cur=id?items.filter(function(x){return x.id===id})[0]:null;
  $("dt").textContent=cur?"Termék szerkesztése":"Új termék";
  $("fn").value=cur?cur.n:"";$("fq").value=cur?cur.q:"";$("fu").value=cur?cur.u:"g";$("fl").value=cur?cur.loc:tab;$("fe").value=cur?cur.exp:plus(7);
  $("fd").hidden=!cur;$("fns").hidden=true;priceHint();if(window.FX&&FX.qtySync)FX.qtySync();$("dlg").showModal();if(!cur)setTimeout(function(){$("fn").focus()},50)}
$("add").onclick=function(){openItem(null)};
function learn(n,u,loc,d){if(find(n))return;prods.push({n:n,c:"sajat",u:u,l:loc,d:d||7,pr:[0,0,0]});sv(K.prod,prods);reindex()}
$("fs").onclick=function(){if(!$("f").reportValidity())return;
  var c=find($("fn").value),o={n:c?c.n:$("fn").value.trim(),q:parseFloat($("fq").value),u:$("fu").value,loc:$("fl").value,exp:$("fe").value};
  if(!o.n)return;learn(o.n,o.u,o.loc,Math.max(1,days(o.exp)));
  var lm=window.FX&&FX.onItemSaved(o)||"";if(cur)Object.assign(cur,o);else{o.id=uid("i");items.push(o)}
  tab=o.loc;saveItems();$("dlg").close();drawStock();toast((cur?"Mentve.":o.n+" bekerült: "+LOCN[o.loc]+".")+(lm?" "+lm:""))};
$("fd").onclick=function(){var id=cur&&cur.id;$("dlg").close();if(id)delItem(id)};

/* étel ötletek */
var DFIL=[["all","Mind"],["hot","Meleg"],["cold","Hideg, saláta, szendvics"],["quick","Gyors (≤15 perc)"]];
$("dfil").innerHTML=DFIL.map(function(f){return '<button type="button" class="chip" data-f="'+f[0]+'" aria-pressed="'+(f[0]===dfil)+'">'+f[1]+"</button>"}).join("");
$("dfil").onclick=function(e){var b=e.target.closest("[data-f]");if(!b)return;dfil=b.dataset.f;this.querySelectorAll(".chip").forEach(function(x){x.setAttribute("aria-pressed",x===b)});drawDishes()};
function fil(c){var r=c.r;return dfil==="all"||(dfil==="hot"&&!isCold(r))||(dfil==="cold"&&isCold(r))||(dfil==="quick"&&r.ido_perc<=15)}
function dishBtn(c,top){var r=c.r,P=portions(),cost=recCost(r,c,Math.min(P,c.can)/r.adag),b=[];
  if(isCold(r))b.push('<span class="badge cold">hideg</span>');
  if(!c.enough)b.push('<span class="badge warn">csak kb. '+nf(Math.floor(c.can*2)/2)+" adagra elég</span>");else b.push('<span class="badge ok">elég '+nf(P)+" adag</span>");
  if(c.soon)b.push('<span class="badge bad">hamar lejár</span>');if(c.thaw.length)b.push('<span class="badge cold">ki kell olvasztani</span>');if(c.subs&&c.subs.length)b.push('<span class="badge">helyettesítéssel</span>');if(r.own)b.push('<span class="badge">saját</span>');
  return '<button type="button" class="dish'+(top?" best1":"")+'" data-id="'+r.id+'"><span class="di">'+ic(RICO[r.cat]||"rice")+'</span><span class="dt">'+(top?"<em>Ma ezt ajánlom</em>":"")+"<b>"+esc(r.nev)+"</b><i>"+r.ido_perc+" perc · "+esc(RCN[r.cat]||"")+(cost.any?" · kb. "+ft(Math.min.apply(null,cost.full)):"")+'</i>'+fromLine(c)+'<span class="bdg">'+b.join("")+"</span></span></button>"}
function fromLine(c){var g={};c.use.forEach(function(u){if(u.basic||!u.locs.length)return;var l=u.locs[0];var nm=(u.src||u.key).toLowerCase();g[l]=g[l]||[];if(g[l].indexOf(nm)<0)g[l].push(nm)});
  var o=["fridge","pantry","freezer"].filter(function(l){return g[l]}).map(function(l){return '<b class="loc">'+LOCN[l]+':</b> '+esc(g[l].join(", "))});return o.length?'<i class="from">'+o.join(" · ")+"</i>":""}
function drawDishes(){var f=feas(),sl=solos(),el=$("dishes"),live=items.filter(function(i){return days(i.exp)>=0&&i.q>0}).length;
  var shown=f.filter(fil),hot=shown.filter(function(c){return !isCold(c.r)}),cold=shown.filter(function(c){return isCold(c.r)});
  var lc={fridge:0,pantry:0,freezer:0};items.forEach(function(i){if(days(i.exp)>=0&&i.q>0)lc[i.loc]=(lc[i.loc]||0)+1});
  $("gos").textContent=live?"Hűtő "+lc.fridge+" · Spájz "+lc.pantry+" · Fagyasztó "+lc.freezer+" tétel → "+(f.length+sl.length)+" féle étel":"Üres a raktár";
  var sum='<div class="survey"><div class="sv-h"><span class="ic">'+ic("fridge")+'</span>Felmértem, mi van itthon</div><div class="sv-g">'+["fridge","pantry","freezer"].map(function(l){return '<div class="sv"><span class="ic">'+ic({fridge:"fridge",pantry:"jar",freezer:"ice"}[l])+'</span><b>'+lc[l]+'</b><small>'+LOCN[l]+"</small></div>"}).join("")+'</div><div class="q small">A három helyen lévő összes alapanyagot együtt nézem. '+(live?"Ebből <b>"+f.length+" recept</b> készíthető"+(sl.length?", és <b>"+sl.length+"</b> dolog magában is jó":"")+".":"")+"</div></div>";
  if(!f.length&&!sl.length){el.innerHTML=sum+'<div class="empty">'+esc(emptyMsg())+"</div>";return}
  var near=nearly(2).filter(fil).slice(0,12);
  var car='<div class="car-h"><h2 class="hd" style="margin:0"><span class="ic">'+ic("book")+'</span>Ötletek ('+shown.length+')</h2><div class="car-nav"><button type="button" class="btn sm p" data-cn="-1" aria-label="Előző ötlet">◀</button><span id="carpos" class="pf">1 / '+(shown.length+near.length)+'</span><button type="button" class="btn sm p" data-cn="1" aria-label="Következő ötlet">▶</button></div></div>'+
    '<div class="q small" style="margin:2px 2px 6px">Lapozz oldalra: elöl, amit most meg tudsz főzni, a végén, amihez csak 1-2 dolog hiányzik.</div>'+
    '<div class="car" id="car">'+shown.map(function(c,i){return carCard(c,i===0)}).join("")+near.map(function(c){return carCard(c,false,true)}).join("")+"</div>";
  var o="",first=true;
  function grp(t,a,icn){if(!a.length)return;o+='<h2 class="hd"><span class="ic">'+ic(icn)+"</span>"+t+" ("+a.length+')</h2><div class="dishes">'+a.map(function(c){var h=dishBtn(c,first);first=false;return h}).join("")+"</div>"}
  o+='<details class="all"><summary class="pf">Összes ötlet listában ('+shown.length+')</summary>';grp("Meleg ételek",hot,"pot");grp("Hideg ételek, saláták, szendvicsek",cold,"sandwich");o+='</details>';
  if(sl.length&&(dfil==="all"||dfil==="cold"||dfil==="quick"))o+='<h2 class="hd"><span class="ic">'+ic("fruit")+"</span>Magában is jó ("+sl.length+')</h2><div class="dishes">'+sl.map(function(s){return '<div class="dish solo"><span class="di">'+ic(ico(s.key))+'</span><span class="dt"><b>'+esc(s.n)+"</b><i>Nem kell hozzá recept, csak a(z) "+esc(s.key.toLowerCase())+""+(s.dd<=2?" · hamar lejár, edd meg előbb":"")+"</i></span></div>"}).join("")+"</div>";
  if(!shown.length&&f.length)o='<div class="empty">Ebben a szűrésben most nincs találat, de '+f.length+" más étel elkészíthető.</div>"+o;
  o=sum+(shown.length||near.length?car:"")+o;
  var near1=nearly(1);if(false&&near1.length)o+='<h2 class="hd"><span class="ic">'+ic("cart")+'</span>Csak 1 dolog hiányzik</h2><div class="dishes">'+near.slice(0,4).map(function(c){return '<button type="button" class="dish solo" data-id="'+c.r.id+'"><span class="di">'+ic(RICO[c.r.cat]||"rice")+'</span><span class="dt"><b>'+esc(c.r.nev)+"</b><i>Hiányzik: "+esc(c.miss[0].nev)+"</i></span></button>"}).join("")+"</div>";
  el.innerHTML=o;var cr=$("car");if(cr){cr.onscroll=function(){carPos()};carPos()}}
function carCard(c,top,nr){var r=c.r,P=portions(),cost=recCost(r,c,Math.min(P,nr?P:c.can)/r.adag),b=[];
  if(nr)b.push('<span class="badge bad">hiányzik: '+esc(c.miss.map(function(h){return h.nev}).join(", "))+"</span>");
  else{b.push(c.enough?'<span class="badge ok">elég '+nf(P)+" adag</span>":'<span class="badge warn">kb. '+nf(Math.floor(c.can*2)/2)+" adagra elég</span>");
    if(c.soon)b.push('<span class="badge bad">hamar lejár</span>');if(c.thaw.length)b.push('<span class="badge cold">ki kell olvasztani</span>');if(c.subs&&c.subs.length)b.push('<span class="badge">helyettesítéssel</span>')}
  if(isCold(r))b.push('<span class="badge cold">hideg</span>');if(r.own)b.push('<span class="badge">saját</span>');
  return '<button type="button" class="cc'+(top?" best1":"")+(nr?" near":"")+'" data-id="'+r.id+'"><span class="cc-top"><span class="cc-i">'+ic(RICO[r.cat]||"rice")+"</span>"+(top?'<em>Ma ezt ajánlom</em>':nr?'<em class="ne">Majdnem megvan</em>':"")+'</span><span class="cc-b"><b>'+esc(r.nev)+"</b><i>"+r.ido_perc+" perc · "+esc(RCN[r.cat]||"")+(cost.any?" · kb. "+ft(Math.min.apply(null,cost.full)):"")+"</i>"+(nr?"":fromLine(c))+'<span class="bdg">'+b.join("")+'</span><span class="cc-go">Recept megnyitása ▸</span></span></button>'}
function carIdx(){var cr=$("car");if(!cr||!cr.firstChild)return 0;var w=cr.firstChild.getBoundingClientRect().width+12;return Math.round(cr.scrollLeft/w)}
function carPos(){var cr=$("car"),p=$("carpos");if(!cr||!p)return;p.textContent=Math.min(carIdx()+1,cr.children.length)+" / "+cr.children.length}
function carGo(i){var cr=$("car");if(!cr||!cr.children.length)return;i=(i+cr.children.length)%cr.children.length;var c=cr.children[i];cr.scrollTo({left:c.offsetLeft-cr.offsetLeft,behavior:"smooth"})}
function nearly(n){return allRec().map(check).filter(function(c){return !c.bl&&c.miss.length>0&&c.miss.length<=n&&c.use.some(function(u){return !u.basic})}).sort(function(x,y){return y.sc-x.sc})}
function emptyMsg(){if(!items.some(function(i){return days(i.exp)>=0}))return "Üres a raktár (vagy minden lejárt), így most nincs miből főzni. Vegyél fel alapanyagot az Új termék gombbal.";
  var nr=nearly(1)[0];return "Ezekből az alapanyagokból még nem készíthető étel."+(nr?" Már csak ez hiányzik ehhez: "+nr.r.nev+": "+nr.miss[0].nev+".":" Tegyél még hozzá egy-két alapanyagot.")}
$("dishes").onclick=function(e){var n=e.target.closest("[data-cn]");if(n){carGo(carIdx()+parseInt(n.dataset.cn));return}var b=e.target.closest("[data-id]");if(b)openRecipe(b.dataset.id)};
$("go").onclick=function(){var cr=$("car");
  if(cr&&cr.children.length){var h=document.querySelector(".car-h");if(h&&h.scrollIntoView)h.scrollIntoView({behavior:"smooth",block:"start"});if(goIdx)carGo(carIdx()+1);goIdx++}
  else{var sl=solos();toast(sl.length?"Recept most nincs, de magában jó: "+sl[0].n+".":emptyMsg())}};

/* ---------- recept nézet ---------- */
var rdP=null;
function openRecipe(id,keepP){var r=recById(id);if(!r)return;if(!keepP)rdP=portions();var c=check(r),f=rdP/r.adag,cost=recCost(r,c,f),o="";
  o+='<div class="rhead"><span class="di">'+ic(RICO[r.cat]||"rice")+"</span><div><h3>"+esc(r.nev)+'</h3><div class="q">'+esc(RCN[r.cat]||"")+" · "+r.ido_perc+" perc"+(isCold(r)?" · hideg":"")+(r.own?" · saját recept":"")+"</div></div></div>";
  o+='<div class="prow" style="margin-top:10px"><div><b>Adag</b><div class="q small">'+esc(people())+'</div></div><div class="step"><button type="button" data-p="-0.5" aria-label="Kevesebb adag">−</button><output>'+nf(rdP)+'</output><button type="button" data-p="0.5" aria-label="Több adag">+</button></div></div>'+
    '<div class="chips pchips" role="group" aria-label="Hány főre?">'+[1,2,4,6,8,10].map(function(n){return '<button type="button" class="chip" data-pp="'+n+'" aria-pressed="'+(rdP===n)+'">'+n+' fő</button>'}).join("")+'<button type="button" class="chip" data-pp="'+portions()+'" aria-pressed="'+(rdP===portions())+'">Család ('+nf(portions())+')</button></div>'+
    '<div class="q small">1 adag: '+esc(r.hozzavalok.filter(function(h){return h.menny&&!h.f}).slice(0,4).map(function(h){return h.nev+" "+fmtR(h,1/r.adag)}).join(", "))+(r.hozzavalok.filter(function(h){return h.menny&&!h.f}).length>4?"…":"")+'</div>';
  if(c.ok&&c.can>=rdP-0.01)o+='<div class="warnbox" style="background:#d9f5df">Minden megvan hozzá otthon, '+nf(rdP)+" adagra is elég.</div>";
  else if(c.ok)o+='<div class="warnbox">Minden hozzávaló megvan, de csak kb. '+nf(Math.floor(c.can*2)/2)+" adagra elég.</div>";
  else o+='<div class="warnbox" style="background:#ffd9d2">Hiányzik: '+esc(c.miss.map(function(h){return h.nev}).join(", "))+"</div>";
  if(c.subs&&c.subs.length)o+='<div class="warnbox" style="background:#fff2c4"><b>Helyettesítéssel:</b> '+esc(c.subs.map(function(s){return s.k.toLowerCase()+" a(z) "+s.sub.toLowerCase()+" helyett"}).join(", "))+". Az íze kicsit más lehet, de működik.</div>";
  if(c.thaw.length)o+='<div class="warnbox" style="background:#d6efff"><b>Előtte olvaszd ki:</b> '+esc(c.thaw.join(", "))+' (a fagyasztóban van). Legjobb a hűtőben, egy éjszaka alatt.</div>';
  o+='<div class="sec">Hozzávalók ('+nf(rdP)+' adag)</div><ul class="ing">'+r.hozzavalok.map(function(h){var u=c.use.filter(function(x){return x.h===h})[0],m,t;
    if(h.f){m='<span class="m o">~</span>';t=""}else if(u){m='<span class="m y">✓</span>';t=u.basic?" <span class=\"q small\">(mindig van)</span>":(u.sub?' <span class="badge cold">helyette: '+esc((u.src||u.key).toLowerCase())+"</span>":"")+' <span class="q small">('+LOCS[u.locs[0]]+(!u.sub&&u.src&&norm(u.src)!==norm(u.key)?": "+esc(u.src.toLowerCase()):"")+")</span>"+(u.dd<=2?' <span class="badge bad">hamar lejár</span>':"")}
    else{var tip=subTip(h);if(h.o){m='<span class="m o">○</span>';t=' <span class="q small">(nincs otthon, nélküle is jó)</span>'}else{m='<span class="m n">✗</span>';t=' <span class="badge bad">hiányzik</span>'+(tip.length?' <span class="q small">(helyette jó: '+esc(tip.join(", ").toLowerCase())+")</span>":"")}}
    return "<li>"+m+"<span>"+esc(h.nev)+t+'</span><span class="iq">'+fmtR(h,f)+"</span></li>"}).join("")+"</ul>";
  if(cost.any){var bi=minI(cost.full),bm=minI(cost.mis);
    o+='<div class="sec">Mennyibe kerül? (becslés)</div><table class="ptab"><tr><th></th>'+SHOPS.map(function(s){return "<th>"+s[1]+"</th>"}).join("")+"</tr>"+
      "<tr><td>Az egész, "+nf(rdP)+" adag</td>"+cost.full.map(function(v,i){return '<td class="'+(i===bi?"best":"")+'">'+ft(v)+"</td>"}).join("")+"</tr>"+
      "<tr><td>1 adag</td>"+cost.full.map(function(v,i){return '<td class="'+(i===bi?"best":"")+'">'+ft(v/rdP)+"</td>"}).join("")+"</tr>"+
      (c.miss.length?"<tr><td>Amit meg kell venni</td>"+cost.mis.map(function(v,i){return '<td class="'+(i===bm?"best":"")+'">'+ft(v)+"</td>"}).join("")+"</tr>":"")+"</table>"+
      '<div class="q small">A felhasznált mennyiség arányos ára; a boltban egész csomagot veszel.'+(cost.unk?" "+cost.unk+" hozzávalónak nincs árbecslése.":"")+"</div>"}
  if(r.lepesek.length)o+='<div class="sec">Elkészítés</div><ol class="steps">'+r.lepesek.map(function(s){return"<li>"+esc(s)+"</li>"}).join("")+"</ol>";
  if(r.kritikus.length)o+='<div class="warnbox"><b>Figyelj erre:</b><ul style="margin:4px 0 0;padding-left:18px">'+r.kritikus.map(function(s){return"<li>"+esc(s)+"</li>"}).join("")+"</ul></div>";
  if(r.talalas)o+='<div class="sec">Tálalás</div><div>'+esc(r.talalas)+"</div>";
  if(r.allergenek.length)o+='<div class="q" style="margin-top:10px">Allergének: '+esc(r.allergenek.join(", "))+"</div>";
  if(window.FX)o+=FX.recipeExtra(r,c);if(window.MORE)o+=MORE.recipeExtra(r,c);
  o+='<div class="btns">'+(c.ok?'<button type="button" class="btn g" id="rcook">Ezt főztem</button>':"")+(c.miss.length?'<button type="button" class="btn t" id="rshop">Hiányzók a listára</button>':"")+"</div>";
  o+='<div class="btns">'+(r.own?'<button type="button" class="btn p sm" id="redit">Szerkesztés</button><button type="button" class="btn r sm" id="rdel2">Törlés</button>':'<button type="button" class="btn p sm" id="rcopy">Lemásolom és átírom</button>')+'</div><div id="cmsg" class="q"></div>';
  $("rdb").innerHTML=o;var d=$("rd");if(!d.open)d.showModal();
  $("rdb").querySelectorAll("[data-p]").forEach(function(b){b.onclick=function(){rdP=Math.max(0.5,rdP+parseFloat(b.dataset.p));openRecipe(id,true)}});
  $("rdb").querySelectorAll("[data-pp]").forEach(function(b){b.onclick=function(){rdP=parseFloat(b.dataset.pp);openRecipe(id,true)}});
  if(window.MORE)MORE.recipeBind(r,c);
  if(window.FX)FX.recipeBind(r,c);
  if($("rcook"))$("rcook").onclick=function(){cook(r,c)};
  if($("rshop"))$("rshop").onclick=function(){toList(r,c,f);this.disabled=true;this.textContent="Felírva a listára"};
  if($("rcopy"))$("rcopy").onclick=function(){d.close();editRecipe(r,true)};
  if($("redit"))$("redit").onclick=function(){d.close();editRecipe(r,false)};
  if($("rdel2"))$("rdel2").onclick=function(){d.close();var pos=ownRec.indexOf(r);ownRec.splice(pos,1);sv(K.rec,ownRec);drawAll();
    toast("Recept törölve.","Visszavonás",function(){ownRec.splice(pos,0,r);sv(K.rec,ownRec);drawAll()})}}
function cook(r,c){var f=Math.min(rdP,c.can)/r.adag,hr=new Date().getHours();
  meals.push({id:uid("m"),n:r.nev,date:plus(0),type:hr<10?"reggeli":hr<16?"ebed":"vacsora",cat:mcat(r.cat)});sv(K.meals,meals);
  var res=consume(r,c,f),out=res.out,listed=res.listed;
  saveItems();drawAll();
  $("cmsg").innerHTML="<b>Jó étvágyat!</b> Beírtam a naplóba. "+(out.length?"Levontam a raktárból: "+esc(out.join(", "))+".":"Ehhez nincs mennyiség megadva, a raktárt nem módosítottam.")+(listed.length?" <b>Elfogyott:</b> "+esc(listed.join(", "))+", felírtam a bevásárlólistára.":"");
  if($("rcook"))$("rcook").disabled=true;if(window.FX)FX.afterCook(r,c,f)}
/* a recept hozzávalóinak levonása a raktárból (f = a recept hányszorosa); visszaadja, mit vont le, és mi fogyott el */
function consume(r,c,f){var out=[],gone=[];c.use.forEach(function(u){if(u.basic||!(u.need>0))return;var left=u.need*f,tot=left,l0=liveOf(u.key)[0],sb=l0&&BASE[l0.u]?BASE[l0.u][0]:u.bt;
    /* a legkorábban lejáró tételből vonunk le először; darabos tételnél (pl. 3 alma) grammos igény esetén a darabsúllyal számolunk */
    liveOf(u.key).sort(function(x,y){return x.exp<y.exp?-1:1}).forEach(function(i){if(left<=0)return;var b=BASE[i.u]||["db",1],hv=cvt(i.q*b[1],b[0],u.bt,i.n);if(hv==null)return;
      var t=Math.min(hv,left),rest=cvt(hv-t,u.bt,b[0],i.n)/b[1];if(b[0]==="db"&&!same(b[0],u.bt))rest=Math.floor(rest*2+0.2)/2;i.q=Math.round(rest*100)/100;left-=t});
    var used=tot-Math.max(left,0);if(used>0){var su=l0?cvt(used,u.bt,sb,l0.n):null;out.push(u.key+" "+(su!=null?fmtQ(su,sb):fmtQ(used,u.bt)));if(window.MORE)MORE.onConsume(u.key,used,u.bt)}});
  items.forEach(function(i){if(!(i.q>0.0001)&&gone.indexOf(i.n)<0)gone.push(i.n)});
  items=items.filter(function(i){return i.q>0.0001});
  /* ami elfogyott (és nincs belőle más a raktárban), az a bevásárlólistára kerül */
  var listed=[];gone.forEach(function(n){if(liveOf(n).length||shop.some(function(s){return !s.done&&norm(s.n)===norm(n)}))return;var cc=find(n);addShop(n,cc?defQ(cc.u,cc.n):1,cc?cc.u:"db");listed.push(n)});
  return{out:out,listed:listed}}
function mcat(c){return{hal:"hal",leves:"leves",hus:"hus",teszta:"teszta",foz:"zoldseg",zoldseg:"zoldseg",salata:"hideg",szendvics:"hideg",hidegtal:"hideg",hideg:"hideg",desszert:"desszert",reggeli:"egyeb"}[c]||"egyeb"}

/* ---------- RECEPTKÖNYV ---------- */
var rcat="all",rmode="all";
$("rcat").innerHTML=[["all","Mind"],["fav","♥ Kedvencek"],["coldall","Minden hideg"]].concat(RCATS).concat([["own","Saját"]]).map(function(c){return '<button type="button" class="chip" data-c="'+c[0]+'" aria-pressed="'+(c[0]===rcat)+'">'+c[1]+"</button>"}).join("");
$("rmode").innerHTML=[["all","Összes recept"],["can","Most elkészíthető"],["near","1-2 dolog hiányzik"]].map(function(c){return '<button type="button" class="chip" data-m="'+c[0]+'" aria-pressed="'+(c[0]===rmode)+'">'+c[1]+"</button>"}).join("");
$("rcat").onclick=function(e){var b=e.target.closest("[data-c]");if(!b)return;rcat=b.dataset.c;this.querySelectorAll(".chip").forEach(function(x){x.setAttribute("aria-pressed",x===b)});drawRec()};
$("rmode").onclick=function(e){var b=e.target.closest("[data-m]");if(!b)return;rmode=b.dataset.m;this.querySelectorAll(".chip").forEach(function(x){x.setAttribute("aria-pressed",x===b)});drawRec()};
$("rq").oninput=function(){drawRec()};
/* okos keresés: több szó (mind illeszkedjen), rokon szavak (krumpli = burgonya), és kulcsszavak: vega, gyors, hideg, meleg, olcsó */
var QSYN={krumpli:["burgonya"],burgonya:["krumpli"],pityoka:["burgonya"],hus:["hus","csirke","sertes","marha","pulyka","daralt","karaj","tarja","oldalas","kacsa","sonka","kolbasz"],
  hal:["hal","lazac","tonhal","makrela","szardinia"],sajt:["sajt","gouda","mozzarella","parmezan","feta"],teszta:["teszta","spagetti","cernametelt","lasagne","nokedli","makaroni","tarhonya"],
  edes:["desszert","cukor","mez","suti"],suti:["desszert","suti","pite","muffin","kalacs","piskota"],kolbasz:["kolbasz","virsli"],paradicsom:["paradicsom","passata"],tok:["sutotok","cukkini","tok"],
  csirke:["csirke"],gomba:["gomba"],tojas:["tojas","omlett","rantotta"],rizs:["rizs","rizotto"],bab:["bab"],kaposzta:["kaposzta"]};
function qMatch(r,q){var hay=norm(r.nev+" "+(RCN[r.cat]||"")+" "+r.hozzavalok.map(function(h){return h.nev+" "+h.k.join(" ")}).join(" "));
  return q.split(/\s+/).filter(Boolean).every(function(t){
    if(/^(vega|vegetarianus|husmentes|hus nelkul)$/.test(t))return window.FX&&FX.isVeg?FX.isVeg(r):true;
    if(t==="gyors")return r.ido_perc<=20;if(t==="hideg")return isCold(r);if(t==="meleg")return !isCold(r);
    if(t==="olcso"){var c=recCost(r,check(r),1/r.adag);return c.any&&Math.min.apply(null,c.full)<=250}
    if(hay.indexOf(t)>=0)return true;var s=QSYN[t];if(!s&&t.length>4)s=QSYN[t.replace(/(os|es|as|ok|ek|ak)$/,"")];return !!(s&&s.some(function(x){return hay.indexOf(x)>=0}))})}
function drawRec(){var q=norm($("rq").value),P=portions();
  var a=allRec().filter(function(r){if(rcat==="own"&&!r.own)return false;if(rcat==="fav"&&!(window.kedv&&kedv[r.id]===1))return false;if(rcat==="coldall"&&!isCold(r))return false;if(rcat!=="all"&&rcat!=="own"&&rcat!=="fav"&&rcat!=="coldall"&&r.cat!==rcat)return false;
    if(q&&!qMatch(r,q))return false;return true}).map(check);
  var hid=a.filter(function(c){return c.bl}).length;a=a.filter(function(c){return !c.bl||rcat==="own"});
  if(rmode==="can")a=a.filter(function(c){return c.ok});if(rmode==="near")a=a.filter(function(c){return !c.ok&&c.miss.length&&c.miss.length<=2});
  a.sort(function(x,y){return (y.ok-x.ok)||(x.miss.length-y.miss.length)||x.r.nev.localeCompare(y.r.nev,"hu")});
  $("rcount").textContent=a.length+" recept"+(rmode==="all"?", ebből "+a.filter(function(c){return c.ok}).length+" most elkészíthető":"")+(hid?" ("+hid+" rejtve az étrend miatt)":"");
  $("rlist").innerHTML=a.length?a.map(function(c){var r=c.r,cost=recCost(r,c,P/r.adag),st=c.ok?'<span class="badge ok">megvan</span>':'<span class="badge'+(c.miss.length<=2?" warn":"")+'">hiányzik '+c.miss.length+"</span>";
    return '<button type="button" class="dish'+(c.ok?"":" solo")+'" data-id="'+r.id+'"><span class="di">'+ic(RICO[r.cat]||"rice")+'</span><span class="dt"><b>'+esc(r.nev)+"</b><i>"+r.ido_perc+" perc · "+esc(RCN[r.cat]||"")+(cost.any?" · "+nf(P)+" adag kb. "+ft(Math.min.apply(null,cost.full)):"")+'</i><span class="bdg">'+st+(isCold(r)?'<span class="badge cold">hideg</span>':"")+(r.own?'<span class="badge">saját</span>':"")+"</span></span></button>"}).join("")
    :'<div class="empty">Nincs ilyen recept. Írj egy sajátot!</div>'}
$("rlist").onclick=function(e){var b=e.target.closest("[data-id]");if(b)openRecipe(b.dataset.id)};

/* saját recept szerkesztő */
var editing=null;
$("rc").innerHTML=RCATS.map(function(c){return '<option value="'+c[0]+'">'+c[1]+"</option>"}).join("");
var UNITS=["g","dkg","kg","ml","dl","l","db","ek","tk","gerezd","szelet","csipet"];
function ingRow(h){var d=document.createElement("div");d.className="irow";var n=h&&h.k&&h.k[0]?h.k[0]:(h?h.nev:"");d._h=h&&h.k&&h.k.length>1?h:null;
  d.innerHTML='<div><input class="in" placeholder="Hozzávaló" autocomplete="off" value="'+esc(n)+'" aria-label="Hozzávaló neve"><div class="sugg" role="listbox" hidden></div></div><input class="iq2" type="number" step="any" min="0" inputmode="decimal" placeholder="Menny." aria-label="Mennyiség" value="'+(h&&h.menny!=null?h.menny:"")+'"><select class="iu" aria-label="Egység">'+UNITS.map(function(u){return"<option"+(h&&h.egyseg===u?" selected":"")+">"+u+"</option>"}).join("")+'</select><button type="button" class="x" aria-label="Hozzávaló törlése">×</button><label class="opt"><input type="checkbox" class="io"'+(h&&h.o?" checked":"")+"> nem kötelező</label>";
  ac(d.querySelector(".in"),d.querySelector(".sugg"),function(c){var s=d.querySelector(".iu");if(!d.querySelector(".iq2").value)s.value=c.u==="kg"?"g":c.u==="l"?"dl":c.u});
  d.querySelector(".x").onclick=function(){d.remove()};$("rings").appendChild(d)}
$("ringadd").onclick=function(){ingRow(null);var l=$("rings").lastChild.querySelector(".in");l.focus()};
function editRecipe(r,copy){editing=r&&!copy?r:null;$("rft").textContent=editing?"Recept szerkesztése":r?"Saját változat":"Saját recept";
  $("rn").value=r?(copy?r.nev+" (saját)":r.nev):"";$("rc").value=r?r.cat:"egyeb";$("ra").value=r?r.adag:4;$("ri").value=r?r.ido_perc:30;$("rh").checked=!!(r&&r.hideg);
  $("rings").innerHTML="";(r?r.hozzavalok.filter(function(h){return !h.f}):[null,null,null]).forEach(ingRow);
  $("rs").value=r?r.lepesek.join("\n"):"";$("rk").value=r?r.kritikus.join(" "):"";$("rt").value=r?r.talalas:"";$("rl").value=r?r.allergenek.join(", "):"";
  $("rdel").hidden=!editing;$("rf").showModal()}
$("radd").onclick=function(){editRecipe(null)};
$("rsave").onclick=function(){if(!$("rff").reportValidity())return;var ing=[];
  $("rings").querySelectorAll(".irow").forEach(function(d){var n=d.querySelector(".in").value.trim();if(!n)return;var c=find(n),q=parseFloat(d.querySelector(".iq2").value);
    var h={nev:n.toLowerCase(),k:[c?c.n:n]};
    /* másolt receptnél, ha a hozzávalót nem írták át, a változatok (pl. csirkecomb vagy egész csirke) megmaradnak */
    var o0=d._h;if(o0&&norm(o0.k[0])===norm(h.k[0])){h.k=o0.k.slice();h.nev=o0.nev;if(o0.kf)h.kf=Object.assign({},o0.kf)}
    if(q>0){h.menny=q;h.egyseg=d.querySelector(".iu").value}if(d.querySelector(".io").checked)h.o=1;ing.push(h)});
  if(!ing.length){toast("Adj meg legalább egy hozzávalót.");return}
  var o={id:editing?editing.id:uid("own-"),own:1,nev:$("rn").value.trim(),cat:$("rc").value,adag:Math.max(1,parseInt($("ra").value)||4),ido_perc:Math.max(1,parseInt($("ri").value)||30),
    hozzavalok:ing,lepesek:$("rs").value.split("\n").map(function(s){return s.trim()}).filter(Boolean),kritikus:$("rk").value.trim()?[$("rk").value.trim()]:[],
    talalas:$("rt").value.trim(),allergenek:$("rl").value.split(",").map(function(s){return s.trim()}).filter(Boolean),hideg:$("rh").checked?1:0,mini:0};
  if(editing)Object.assign(editing,o);else ownRec.push(o);sv(K.rec,ownRec);$("rf").close();drawAll();toast("Recept elmentve: "+o.nev+".");openRecipe(o.id)};
$("rdel").onclick=function(){if(!editing)return;var r=editing;$("rf").close();var pos=ownRec.indexOf(r);ownRec.splice(pos,1);sv(K.rec,ownRec);drawAll();
  toast("Recept törölve.","Visszavonás",function(){ownRec.splice(pos,0,r);sv(K.rec,ownRec);drawAll()})};

/* ---------- BOLT ---------- */
ac($("pq"),$("pqs"),function(c){showPrice(c)});
$("pq").addEventListener("input",function(){var c=find(this.value);if(c)showPrice(c);else $("pres").innerHTML=""});
function showPrice(c){var p=priceOf(c.n),u=punit(c),o='<div class="rhead" style="margin-top:12px"><span class="di">'+ic(ico(c.n))+"</span><div><h3>"+esc(c.n)+'</h3><div class="q">'+esc(CATN[c.c]||"")+" · ár / "+u+"</div></div></div>";
  if(p){var b=minI(p);o+='<div class="shops">'+SHOPS.map(function(s,i){return '<div class="shop '+s[2]+(i===b?" best":"")+'"><span class="sn">'+s[1]+'</span><span class="sp">'+ft(p[i])+"</span></div>"}).join("")+"</div>"+
    '<div class="q small" style="margin-top:6px">Különbség a legdrágább és a legolcsóbb között: '+ft(Math.max.apply(null,p)-p[b])+" / "+u+(prices[c.n]?" · saját árat adtál meg":"")+"</div>"}
  else o+='<div class="q" style="margin-top:8px">Ehhez még nincs ár. Add meg a blokkod alapján!</div>';
  o+='<div class="btns"><button type="button" class="btn sm" id="pedit">Ár átírása</button><button type="button" class="btn g sm" id="plist">+ Listára</button></div>';
  if(window.MORE)o+=MORE.priceExtra(c);
  $("pres").innerHTML=o;$("pedit").onclick=function(){editPrice(c)};$("plist").onclick=function(){addShop(c.n,defQ(c.u),c.u);toast(c.n+" felírva a listára.")}}
function editPrice(c){var p=priceOf(c.n)||[0,0,0],u=punit(c);
  gform("Ár: "+c.n,SHOPS.map(function(s,i){return{k:s[0],l:s[1]+" (Ft / "+u+")",t:"number",v:p[i]||""}}).concat([{k:"nt",t:"note"}]),null,
    function(o){prices[c.n]=[o.p,o.t,o.l];sv(K.price,prices);showPrice(c);drawShop()},prices[c.n]?function(){delete prices[c.n];sv(K.price,prices);showPrice(c);drawShop()}:null,"Visszaállítás az alapárra");
  $("g_nt").textContent="Az árat 1 "+u+"-ra számold. Pl. 330 g tejföl 599 Ft = kb. 1815 Ft/kg."}
function defQ(u,n){if(n==="Tojás")return 10;return{g:500,kg:1,dkg:20,ml:500,dl:2,l:1,db:1}[u]||1}
$("su").innerHTML=["db","g","dkg","kg","ml","dl","l"].map(function(u){return"<option>"+u+"</option>"}).join("");
ac($("sn"),$("sns"),function(c){$("su").value=c.u;$("sq").value=defQ(c.u)});
$("sn").addEventListener("keydown",function(e){if(e.key==="Enter"&&$("sns").hidden){e.preventDefault();$("sadd").click()}});
$("sadd").onclick=function(){var n=$("sn").value.trim();if(!n){$("sn").focus();return}var c=find(n);addShop(c?c.n:n,parseFloat($("sq").value)||(c?defQ(c.u):1),$("su").value);
  $("sn").value="";$("sq").value="";$("sn").focus()};
function addShop(n,q,u){var ex=shop.filter(function(s){return norm(s.n)===norm(n)&&!s.done})[0];
  if(ex&&same(BASE[ex.u][0],BASE[u][0])){ex.q=Math.round((ex.q+q*BASE[u][1]/BASE[ex.u][1])*100)/100}else shop.push({id:uid("s"),n:n,q:q,u:u,done:false});sv(K.shop,shop);drawShop()}
function toList(r,c,f){var k=0;c.miss.forEach(function(h){var key=h.k[0],cc=find(key);if(!cc)return;var q=defQ(cc.u),u=cc.u;
    if(h.menny){var tb=toBase(h.menny*f*((h.kf&&h.kf[key])||1),h.egyseg,key),cb=BASE[cc.u],cv=cvt(tb[1],tb[0],cb[0],cc.n);if(cv!=null){q=cv/cb[1];q=cb[0]==="db"?Math.ceil(q):cb[1]>=100?Math.ceil(q*10)/10:Math.ceil(q/10)*10;if(cb[0]!=="db"&&q<defQ(u)/2)q=defQ(u)}}
    addShop(cc.n,q,u);k++});toast(k+" tétel felírva a bevásárlólistára.")}
function lineCost(s){var b=BASE[s.u]||["db",1];return costOf(s.n,b[0],s.q*b[1])}
function drawShop(){var t=[0,0,0],unk=0,open=shop.filter(function(s){return !s.done});
  $("slist").innerHTML=shop.length?shop.map(function(s){var p=lineCost(s);if(!s.done){if(p)for(var i=0;i<3;i++)t[i]+=p[i];else unk++}
    return '<div class="li'+(s.done?" done":"")+'" data-id="'+s.id+'"><button type="button" class="ck" role="checkbox" aria-checked="'+s.done+'" aria-label="'+esc(s.n)+' megvan">'+(s.done?"✓":"")+'</button><span class="ic">'+ic(ico(s.n))+'</span><span class="lt"><b>'+esc(s.n)+"</b> "+nf(s.q)+" "+s.u+(window.MORE?MORE.upBadge(s.n):"")+(p?'<br><span class="q small">'+SHOPS.map(function(x,i){return x[1]+" "+ft(p[i])}).join(" · ")+"</span>":"")+'</span><button type="button" class="x" data-x="'+s.id+'" aria-label="'+esc(s.n)+' törlése">×</button></div>'}).join("")
    :'<div class="q">Üres a lista. Írj be valamit, vagy egy receptnél koppints a "Hiányzók a listára" gombra.</div>';
  if(open.length&&t.some(function(x){return x>0})){var b=minI(t);$("stot").innerHTML='<div class="sec">Hol a legolcsóbb a lista?</div><div class="shops">'+SHOPS.map(function(s,i){return '<div class="shop '+s[2]+(i===b?" best":"")+'"><span class="sn">'+s[1]+'</span><span class="sp">'+ft(t[i])+"</span></div>"}).join("")+"</div>"+
    '<div class="q small" style="margin-top:6px">Megtakarítás a legdrágábbhoz képest: '+ft(Math.max.apply(null,t)-t[b])+"."+(unk?" "+unk+" tételnek nincs ára.":"")+"</div>"}else $("stot").innerHTML="";
  if(window.MORE)MORE.shopExtra(t,open.length);
  var dn=shop.filter(function(s){return s.done}).length;
  $("sbtns").innerHTML=dn?'<button type="button" class="btn g" id="sbuy">Kipipáltak a raktárba ('+dn+')</button><button type="button" class="btn p" id="sclr">Kipipáltak törlése</button>':"";
  if(dn){$("sbuy").onclick=function(){var k=0;shop.filter(function(s){return s.done}).forEach(function(s){var c=find(s.n);items.push({id:uid("i"),n:s.n,q:s.q,u:s.u,loc:c?c.l:"pantry",exp:plus(c?c.d:7)});k++});
      shop=shop.filter(function(s){return !s.done});sv(K.shop,shop);saveItems();drawAll();toast(k+" termék bekerült a raktárba. A lejáratot érdemes ellenőrizni.")};
    $("sclr").onclick=function(){var old=shop.slice();shop=shop.filter(function(s){return !s.done});sv(K.shop,shop);drawShop();toast("Kipipáltak törölve.","Visszavonás",function(){shop=old;sv(K.shop,shop);drawShop()})}}}
$("slist").onclick=function(e){var x=e.target.closest("[data-x]"),row=e.target.closest(".li");if(!row)return;var s=shop.filter(function(y){return y.id===row.dataset.id})[0];if(!s)return;
  if(x){var pos=shop.indexOf(s);shop.splice(pos,1);sv(K.shop,shop);drawShop();toast(s.n+" törölve a listáról.","Visszavonás",function(){shop.splice(pos,0,s);sv(K.shop,shop);drawShop()});return}
  if(e.target.closest(".ck")||e.target.closest(".lt")){s.done=!s.done;sv(K.shop,shop);drawShop()}};

/* ---------- általános űrlap ---------- */
function gform(title,fields,vals,onSave,onDel,delTxt){var d=$("gd"),armed=false;$("gt").textContent=title;
  $("gb").innerHTML=fields.map(function(f){var v=vals&&vals[f.k]!=null?vals[f.k]:(f.v!=null?f.v:""),inp;
    if(f.t==="note")return '<div class="q" id="g_'+f.k+'" style="margin-top:12px"></div>';
    if(f.t==="select")inp='<select id="g_'+f.k+'">'+f.o.map(function(o){return '<option value="'+o[0]+'"'+(o[0]===v?" selected":"")+">"+o[1]+"</option>"}).join("")+"</select>";
    else inp='<input id="g_'+f.k+'" type="'+f.t+'"'+(f.t==="number"?' step="any" min="0" inputmode="decimal"':"")+(f.list?' list="'+f.list+'"':"")+' value="'+esc(v)+'"'+(f.r?" required":"")+' autocomplete="off">';
    return '<label for="g_'+f.k+'">'+f.l+"</label>"+inp}).join("");
  fields.forEach(function(f){if(f.on)$("g_"+f.k).oninput=function(){f.on(this.value,function(k){return $("g_"+k)})}});
  fields.forEach(function(f){if(f.init)f.init($("g_"+f.k).value,function(k){return $("g_"+k)})});
  $("gdl").hidden=!onDel;$("gdl").textContent=delTxt||"Törlés";
  $("gs").onclick=function(){if(!$("gf").reportValidity())return;var o={};fields.forEach(function(f){if(f.t==="note")return;var v=$("g_"+f.k).value;o[f.k]=f.t==="number"?(parseFloat(v)||0):v});onSave(o);d.close()};
  $("gdl").onclick=function(){if(!armed&&!delTxt){armed=true;this.textContent="Biztosan törlöd?";return}onDel();d.close()};
  d.showModal()}

/* ---------- KÖLTSÉG ---------- */
function wk(){var dw=(new Date().getDay()+6)%7;return[plus(-dw),plus(6-dw)]}
function sum(a,b){return exps.filter(function(x){return x.date>=a&&x.date<=b}).reduce(function(s,x){return s+x.a},0)}
function pbar(l,sp,lim){var p=lim>0?Math.min(100,sp/lim*100):0,ov=lim>0&&sp>lim;return '<div style="margin:12px 0 2px">'+l+": <b>"+ft(sp)+"</b>"+(lim>0?" / "+ft(lim):"")+'</div><div class="bar"><b style="width:'+p+"%"+(ov?";background:var(--bad)":"")+'"></b></div>'}
function bcalc(p,a){var d=p==="d"?a:p==="w"?a/7:a*12/365;return{d:Math.round(d),w:Math.round(d*7),m:Math.round(d*365/12)}}
function bpv(x,g){var r=bcalc(g("p").value,parseFloat(g("a").value)||0);g("pv").textContent="Ez napi "+ft(r.d)+", heti "+ft(r.w)+", havi "+ft(r.m)+"."}
$("bset").onclick=function(){var b=bud||{p:"m",a:""};gform("Költségkeret",[
  {k:"p",l:"Milyen időszakra adod meg?",t:"select",o:[["d","Napi keret"],["w","Heti keret"],["m","Havi keret"]],v:b.p||"m",on:bpv,init:bpv},
  {k:"a",l:"Összeg (Ft)",t:"number",r:1,v:b.a||"",on:bpv},{k:"pv",t:"note"}],
  bud,function(o){var r=bcalc(o.p,o.a);bud={p:o.p,a:o.a,m:r.m,w:r.w,d:r.d};sv(K.bud,bud);drawAll()},
  bud?function(){bud=null;try{localStorage.removeItem(K.bud)}catch(e){}drawAll()}:null)};
function xform(x){gform(x?"Kiadás szerkesztése":"Új kiadás",[
  {k:"a",l:"Összeg (Ft)",t:"number",r:1,v:x?x.a:""},{k:"n",l:"Mire költöttél?",t:"text",r:1,v:x?x.n:"Bevásárlás"},
  {k:"shop",l:"Bolt",t:"text",list:"shops",v:x?x.shop:""},{k:"date",l:"Dátum",t:"date",r:1,v:x?x.date:plus(0)}],
  x,function(o){if(x)Object.assign(x,o);else{o.id=uid("x");exps.push(o)}sv(K.exps,exps);drawAll()},
  x?function(){delExp(x)}:null)}
function delExp(x){var pos=exps.indexOf(x);exps.splice(pos,1);sv(K.exps,exps);drawAll();toast("Kiadás törölve.","Visszavonás",function(){exps.splice(pos,0,x);sv(K.exps,exps);drawAll()})}
$("xadd").onclick=function(){xform(null)};
function drawBudget(){var t=plus(0),sp=sum(t,t);
  if(bud&&bud.d>0){var l=bud.d-sp;$("bt").textContent=l>=0?ft(l)+" maradt "+ft(bud.d)+"-ból":ft(-l)+" a napi kereten túl";$("bb").style.width=Math.max(0,l)/bud.d*100+"%"}
  else{$("bt").textContent="Állítsd be a keretet a Költség oldalon.";$("bb").style.width="0%"}}
function drawCost(){var t=plus(0),w=wk(),m=t.slice(0,7);
  $("bsum").innerHTML=bud?'<div class="q">Megadott keret: '+({d:"napi",w:"heti",m:"havi"}[bud.p||"m"])+" "+ft(bud.a||bud.m||0)+"</div>"+pbar("Ma",sum(t,t),bud.d)+pbar("Ezen a héten",sum(w[0],w[1]),bud.w)+pbar("Ebben a hónapban",sum(m+"-01",m+"-31"),bud.m):'<div class="q">Még nincs keret beállítva.</div>';
  $("bset").textContent=bud?"Keret szerkesztése":"Keret beállítása";
  var a=exps.slice().sort(function(x,y){return x.date<y.date?1:-1});
  $("xlist").innerHTML=a.length?a.map(function(x){return '<div class="li" data-id="'+x.id+'"><span class="lt" tabindex="0" role="button">'+esc(x.date)+" "+esc(x.n)+(x.shop?" ("+esc(x.shop)+")":"")+'</span><b class="price">'+ft(x.a)+'</b><button type="button" class="x" data-x="1" aria-label="Kiadás törlése">×</button></div>'}).join(""):'<div class="q">Még nincs kiadás. Koppints az Új kiadás gombra.</div>'}
$("xlist").onclick=function(e){var r=e.target.closest(".li");if(!r)return;var x=exps.filter(function(y){return y.id===r.dataset.id})[0];if(!x)return;if(e.target.closest("[data-x]"))delExp(x);else if(e.target.closest(".lt"))xform(x)};
$("xlist").onkeydown=function(e){var r=e.target.closest(".li");if(r&&e.key==="Enter"&&e.target.classList.contains("lt"))xform(exps.filter(function(y){return y.id===r.dataset.id})[0])};

/* ---------- NAPLÓ ---------- */
var CATS=[["hus","Hús"],["hal","Hal"],["zoldseg","Zöldség, főzelék"],["teszta","Tészta, rizs"],["leves","Leves"],["hideg","Hideg étel, saláta"],["desszert","Desszert"],["egyeb","Egyéb"]],CN={};CATS.forEach(function(c){CN[c[0]]=c[1]});
var TY=[["reggeli","Reggeli"],["ebed","Ebéd"],["vacsora","Vacsora"],["snack","Uzsonna, nasi"]],TN={};TY.forEach(function(c){TN[c[0]]=c[1]});
function fillMeals(){$("meals").innerHTML=allRec().map(function(r){return '<option value="'+esc(r.nev)+'">'}).join("")}
function mform(m){gform(m?"Étkezés szerkesztése":"Mit ettünk?",[
  {k:"n",l:"Étel neve",t:"text",list:"meals",r:1,v:m?m.n:"",on:function(x,g){var r=allRec().filter(function(y){return y.nev===x})[0];if(r)g("cat").value=mcat(r.cat)}},
  {k:"date",l:"Nap",t:"date",r:1,v:m?m.date:plus(0)},{k:"type",l:"Étkezés",t:"select",o:TY,v:m?m.type:"ebed"},{k:"cat",l:"Típus",t:"select",o:CATS,v:m?m.cat:"egyeb"}],
  m,function(o){if(m)Object.assign(m,o);else{o.id=uid("m");meals.push(o)}sv(K.meals,meals);drawAll()},m?function(){delMeal(m)}:null)}
function delMeal(m){var pos=meals.indexOf(m);meals.splice(pos,1);sv(K.meals,meals);drawAll();toast("Bejegyzés törölve.","Visszavonás",function(){meals.splice(pos,0,m);sv(K.meals,meals);drawAll()})}
$("madd").onclick=function(){mform(null)};
function sugg(wm,cnt,nm,sp){var L=[];
  if(!wm.length)L.push("Még nincs naplózott étkezés ezen a héten. Koppints a Mit ettünk? gombra, vagy egy receptnél az Ezt főztem gombra.");
  if(cnt.hus>=4)L.push("Sok húsos étel volt a héten ("+cnt.hus+"). Jöhet egy főzelék vagy saláta.");
  if(wm.length>=3&&!cnt.zoldseg&&!cnt.hideg)L.push("Nem volt zöldséges étel vagy saláta a héten. Egy főzelék vagy vitaminsaláta jól jönne.");
  if(wm.length>=5&&!cnt.hal)L.push("Hal még nem szerepelt a héten.");
  Object.keys(nm).forEach(function(k){if(nm[k]>=3)L.push("A(z) "+k+" már "+nm[k]+"-szor szerepelt a héten, érdemes változtatni.")});
  if(bud&&bud.w>0){if(sp>bud.w)L.push("Túlléptétek a heti keretet "+ft(sp-bud.w)+"-tal. Főzzetek a raktárból, olcsó alapanyagokból.");else if(sp>bud.w*.8)L.push("A heti keret 80%-át elköltöttétek, "+ft(bud.w-sp)+" maradt.");else L.push("A heti keretből még "+ft(bud.w-sp)+" maradt.")}
  var ex=[];items.forEach(function(i){var d=days(i.exp);if(d>=0&&d<=2&&ex.indexOf(i.n)<0)ex.push(i.n)});if(ex.length)L.push("Hamarosan lejár: "+ex.join(", ")+". Főzz ezekből előbb.");
  var gone=items.filter(function(i){return days(i.exp)<0}).map(function(i){return i.n});if(gone.length)L.push("Lejárt a raktárban: "+gone.join(", ")+". Nézd meg, és ha kell, töröld az × gombbal.");
  return L}
function drawStat(){var w=wk(),wm=meals.filter(function(m){return m.date>=w[0]&&m.date<=w[1]}),cnt={},nm={},mx=1;
  wm.forEach(function(m){cnt[m.cat]=(cnt[m.cat]||0)+1;nm[m.n]=(nm[m.n]||0)+1});CATS.forEach(function(c){if((cnt[c[0]]||0)>mx)mx=cnt[c[0]]});
  var sp=sum(w[0],w[1]);
  $("sw").innerHTML="<div>Kiadás: <b>"+ft(sp)+"</b>"+(bud&&bud.w?" / "+ft(bud.w):"")+"</div><div>Naplózott étkezés: <b>"+wm.length+"</b>, különböző étel: <b>"+Object.keys(nm).length+"</b></div>"+
    CATS.filter(function(c){return cnt[c[0]]}).map(function(c){return '<div style="margin:10px 0 2px">'+c[1]+": "+cnt[c[0]]+'</div><div class="bar"><b style="width:'+cnt[c[0]]/mx*100+'%"></b></div>'}).join("");
  $("sug").innerHTML=sugg(wm,cnt,nm,sp).map(function(s){return"<li>"+esc(s)+"</li>"}).join("");
  var a=meals.slice().sort(function(x,y){return x.date<y.date?1:x.date>y.date?-1:0}).slice(0,60),last="",o="";
  a.forEach(function(m){if(m.date!==last){last=m.date;o+='<div class="dh">'+new Date(m.date+"T00:00:00").toLocaleDateString("hu-HU",{weekday:"long",month:"long",day:"numeric"})+"</div>"}
    o+='<div class="li" data-id="'+m.id+'"><span class="lt" tabindex="0" role="button">'+(TN[m.type]||"")+": "+esc(m.n)+'</span><span class="q small">'+(CN[m.cat]||"")+'</span><button type="button" class="x" data-x="1" aria-label="Bejegyzés törlése">×</button></div>'});
  $("mlist").innerHTML=o||'<div class="q">Még nincs bejegyzés.</div>'}
$("mlist").onclick=function(e){var r=e.target.closest(".li");if(!r)return;var m=meals.filter(function(y){return y.id===r.dataset.id})[0];if(!m)return;if(e.target.closest("[data-x]"))delMeal(m);else if(e.target.closest(".lt"))mform(m)};
$("mlist").onkeydown=function(e){var r=e.target.closest(".li");if(r&&e.key==="Enter"&&e.target.classList.contains("lt"))mform(meals.filter(function(y){return y.id===r.dataset.id})[0])};

/* ---------- BEÁLLÍTÁSOK ---------- */
var BASICS=["Só","Fekete bors","Pirospaprika","Étolaj","Cukor","Liszt","Ecet","Babérlevél","Majoránna","Kömény","Oregánó","Fahéj"];
function drawSet(){if(window.drawSync)drawSync();["ad","te","ch","to"].forEach(function(k){$("o-"+k).textContent=set[k]});
  $("hsum").textContent="Összesen kb. "+nf(portions())+" adag egy étkezéshez. A receptek mennyiségeit és árait erre számolom.";
  $("hht").textContent=people()+" ("+nf(portions())+" adag)";
  $("basics").innerHTML=BASICS.map(function(b){return '<button type="button" class="chip" data-b="'+esc(b)+'" aria-pressed="'+isBasic(b)+'">'+(isBasic(b)?"✓ ":"")+esc(b)+"</button>"}).join("");
  $("theme").value=set.theme;
  var n=items.length+meals.length+exps.length+ownRec.length,lb=set.lastBackup;
  $("bkst").innerHTML=lb?"Utolsó mentés: <b>"+new Date(lb).toLocaleDateString("hu-HU")+"</b>"+(Date.now()-lb>14*864e5?". Régen mentettél, érdemes újra.":"."):n?"Még nem készült mentés. <b>Mentsd le, mielőtt törlöd az appot vagy telefont váltasz!</b>":"Még nincs mit menteni."}
document.querySelectorAll("[data-s]").forEach(function(b){b.onclick=function(){var k=b.dataset.s;set[k]=Math.max(0,Math.min(20,set[k]+parseInt(b.dataset.d)));
  if(set.ad+set.te+set.ch+set.to===0)set[k]=1;saveSet();drawAll()}});
$("basics").onclick=function(e){var b=e.target.closest("[data-b]");if(!b)return;var n=b.dataset.b,i=set.basics.indexOf(n);if(i>=0)set.basics.splice(i,1);else set.basics.push(n);saveSet();drawAll()};
$("theme").onchange=function(){set.theme=this.value;saveSet();applyTheme()};
$("hh").onclick=function(){showView("set")};
/* mentés, visszatöltés */
function dump(){var o={app:"mi-legyen-a-kaja",ver:VER,date:new Date().toISOString(),data:{}};
  for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);if(k&&k.indexOf("kaja.")===0)o.data[k]=localStorage.getItem(k)}
  if(!o.data[K.items])o.data[K.items]=JSON.stringify(items);return o}
function fname(){return"kaja-mentes-"+plus(0)+".json"}
function markBackup(){set.lastBackup=Date.now();saveSet();drawSet()}
$("bexp").onclick=function(){var s=JSON.stringify(dump()),b=new Blob([s],{type:"application/json"}),a=document.createElement("a");
  a.href=URL.createObjectURL(b);a.download=fname();document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},500);
  markBackup();toast("Mentés letöltve: "+fname()+". Tedd biztos helyre (pl. Drive, e-mail).")};
$("bshare").onclick=function(){var s=JSON.stringify(dump()),file;
  try{file=new File([s],fname(),{type:"application/json"})}catch(e){}
  if(file&&navigator.canShare&&navigator.canShare({files:[file]})){navigator.share({files:[file],title:"Mi legyen a kaja? mentés"}).then(markBackup).catch(function(){})}
  else{toast("A megosztás itt nem érhető el, letöltöm fájlba.");$("bexp").click()}};
$("bimp").onclick=function(){$("bfile").click()};
$("bfile").onchange=function(){var f=this.files[0];if(!f)return;var rd=new FileReader();rd.onload=function(){restore(rd.result)};rd.readAsText(f);this.value=""};
$("bcode").onclick=function(){var b=$("bcodebox");b.hidden=!b.hidden;if(!b.hidden){$("bta").value=JSON.stringify(dump())}};
$("bcopy").onclick=function(){var t=$("bta");t.select();(navigator.clipboard?navigator.clipboard.writeText(t.value):Promise.reject()).then(function(){markBackup();toast("Kimásolva. Illeszd be pl. egy jegyzetbe vagy e-mailbe.")}).catch(function(){try{document.execCommand("copy");markBackup();toast("Kimásolva.")}catch(e){toast("Jelöld ki és másold ki kézzel.")}})};
$("bpaste").onclick=function(){restore($("bta").value)};
function restore(txt){var o;try{o=JSON.parse(txt)}catch(e){toast("Ez nem érvényes mentés.");return}
  if(!o||!o.data||typeof o.data!=="object"||!Object.keys(o.data).some(function(k){return k.indexOf("kaja.")===0})){toast("Ebben nincs Mi legyen a kaja? adat.");return}
  var raw;try{raw=JSON.parse(o.data[K.items]||"[]")}catch(e){raw=[]}
  gform("Visszatöltés",[{k:"nt",t:"note"}],null,function(){
    var keep=[];for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);if(k&&k.indexOf("kaja.")===0)keep.push(k)}
    try{keep.forEach(function(k){localStorage.removeItem(k)});Object.keys(o.data).forEach(function(k){if(k.indexOf("kaja.")===0&&typeof o.data[k]==="string")localStorage.setItem(k,o.data[k])})}catch(e){toast("Nem sikerült visszatölteni.");return}
    location.reload()},null);
  $("gs").textContent="Visszatöltés";
  $("g_nt").innerHTML="A mentés dátuma: <b>"+esc(o.date?new Date(o.date).toLocaleString("hu-HU"):"ismeretlen")+"</b>, "+raw.length+" raktártétel.<br><br>A jelenlegi adatok helyére ez kerül. Folytatod?"}
$("reset").onclick=function(){gform("Minden adat törlése",[{k:"nt",t:"note"}],null,function(){var ks=[];for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);if(k&&k.indexOf("kaja.")===0)ks.push(k)}ks.forEach(function(k){localStorage.removeItem(k)});["kajasync.last","kajasync.cfg"].forEach(function(k){localStorage.removeItem(k)});location.reload()},null);
  $("gs").textContent="Igen, törlöm";$("g_nt").textContent="A raktár, a receptjeid, a lista, a napló és a kiadások is törlődnek. Előtte érdemes menteni. Biztos?"};
if(navigator.storage&&navigator.storage.persist)navigator.storage.persist().catch(function(){});

/* ---------- nézetek ---------- */
var view="stock";
function showView(v){view=v;["stock","rec","shop","cost","stat","set"].forEach(function(k){$("v-"+k).hidden=k!==v});
  document.querySelectorAll(".nav button").forEach(function(b){b.setAttribute("aria-selected",b.dataset.v===v)});
  $("hh").hidden=v==="set";drawView();window.scrollTo(0,0)}
document.querySelectorAll(".nav button").forEach(function(b){b.onclick=function(){showView(b.dataset.v)}});
function drawView(){if(view==="stock"){drawBudget();drawStock()}else if(view==="rec")drawRec();else if(view==="shop")drawShop();else if(view==="cost")drawCost();else if(view==="stat")drawStat();else drawSet();if(window.FX)FX.draw(view);if(window.MORE)MORE.draw(view)}
function drawAll(){drawSet();fillMeals();drawView()}
drawAll();

/* ---------- PWA ---------- */
var st=$("st"),upd=$("upd"),inst=$("inst"),REG=null,NEW=null,DEF=null;
function say(t){st.textContent=t}
say("Verzió "+VER+" · "+allRec().length+" recept · "+allProds().length+" termék");
/* Automatikus frissítés: induláskor, visszatéréskor és óránként megnézi, van-e új verzió.
   Ha van, magától átvált rá; ha épp nyitva van egy űrlap, megvárja, amíg bezárod vagy elhagyod az appot. */
var pendingReload=false,hadCtrl=false;
function busy(){return !!document.querySelector("dialog[open]")||(document.activeElement&&/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName))}
function doReload(){if(busy()&&!document.hidden){pendingReload=true;return}location.reload()}
function checkUpd(){if(REG&&navigator.onLine!==false)REG.update().catch(function(){})}
if("serviceWorker" in navigator){hadCtrl=!!navigator.serviceWorker.controller;
  navigator.serviceWorker.register("sw.js",{updateViaCache:"none"}).then(function(r){REG=r;
    r.addEventListener("updatefound",function(){var w=r.installing;if(!w)return;w.addEventListener("statechange",function(){if(w.state==="installed"&&navigator.serviceWorker.controller){NEW=w;say("Új verzió letöltve, telepítem...");w.postMessage("skip")}})});
    setInterval(checkUpd,36e5)}).catch(function(){});
  var reloading=false;navigator.serviceWorker.addEventListener("controllerchange",function(){if(reloading||!hadCtrl){hadCtrl=true;return}reloading=true;toast("Frissítettem az appot a legújabb verzióra.");setTimeout(doReload,600)})}
document.addEventListener("visibilitychange",function(){if(document.hidden){if(pendingReload)location.reload()}else checkUpd()});
document.addEventListener("close",function(){if(pendingReload&&!busy())location.reload()},true);
window.addEventListener("online",checkUpd);
upd.onclick=function(){if(NEW){NEW.postMessage("skip");return}if(!REG){say("Az automatikus frissítés a weboldalon és a telepített appban működik. Verzió "+VER);return}
  say("Keresem az új verziót...");REG.update().then(function(){setTimeout(function(){if(!NEW)say("A legfrissebb verziót használod ("+VER+"). Az app magától is frissül.")},1500)}).catch(function(){say("Nincs kapcsolat. Az app így is működik offline.")})};
if(/^android-app:/.test(document.referrer)||matchMedia("(display-mode: standalone)").matches)$("apk").hidden=true;
window.addEventListener("beforeinstallprompt",function(e){e.preventDefault();DEF=e});
inst.onclick=function(){if(DEF){DEF.prompt();DEF=null}else say("Telepítés: böngésző menü, majd Hozzáadás a kezdőképernyőhöz.")};
window.addEventListener("offline",function(){toast("Offline vagy, az app így is működik.")});
