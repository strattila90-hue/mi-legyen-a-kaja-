/* Mi legyen a kaja? – bővítmények: heti menü, kedvencek, diéta, maradék, szezon/ünnep, főzés mód, bolti mód,
   vonalkód, blokkolvasás, lejárati értesítés, kitűzők és szintek, pazarlás-statisztika, gyerek mód. */
var KX={menu:"kaja.menu.v1",kedv:"kaja.kedv.v1",diet:"kaja.diet.v1",waste:"kaja.waste.v1",kid:"kaja.kid.v1",bar:"kaja.bar.v1",notif:"kajax.notif",badges:"kajax.badges"};
var kedv=ld(KX.kedv,{}),diet=Object.assign({ex:[],al:[],veg:0},ld(KX.diet,{})),menu=ld(KX.menu,null),waste=Object.assign({th:[],sv:[]},ld(KX.waste,{})),kid=ld(KX.kid,null),barmap=ld(KX.bar,{});
(function(){
var FX={};window.FX=FX;
function today(){return plus(0)}
function lv(n){return items.filter(function(i){return days(i.exp)>=0&&i.q>0})}
function cheapest(a){return a&&a.length?Math.min.apply(null,a.filter(function(x){return x>0}).concat([Infinity])):0}
function itemCost(n,q,u){var b=BASE[u]||["db",1],p=costOf(n,b[0],q*b[1]);return p?cheapest(p):0}
function dlg(id,html){var d=$(id);d.querySelector(".dbody").innerHTML=html;if(!d.open)d.showModal();return d}
document.querySelectorAll("dialog [data-close]").forEach(function(b){if(!b.onclick)b.onclick=function(){b.closest("dialog").close()}});

/* ================= DIÉTA, KEDVENCEK, SZEZON ================= */
var ALLERG=["glutén","tej","tojás","hal","mogyoró","földimogyoró","diófélék","mustár","zeller"];
var MEATC={hus:1,hal:1,felv:1};
var MEATRX=/(hus|csirke|sonka|kolbasz|szalonna|bacon|virsli|parizsi|szalami|majkrem|csirkemaj|csulok|hal|lazac|tonhal|szardinia|makrela|pulyka|marha|sertes|kacsa|daralt)/;
function isMeat(k){var c=find(k);return !!((c&&MEATC[c.c])||MEATRX.test(norm(k))&&!/halloumi/.test(norm(k)))}
function ingKeysReq(r){return r.hozzavalok.filter(function(h){return !h.o&&!h.f})}
/* egy termék beleférhet-e az étrendbe (a helyettesítő és a változat-választás is ezt nézi) */
FX.okKey=function(k){if(diet.veg&&isMeat(k))return false;if(diet.ex.length&&diet.ex.map(norm).indexOf(norm(k))>=0)return false;return true};
FX.isVeg=function(r){return !ingKeysReq(r).some(function(h){return h.k.length&&h.k.every(isMeat)})};
FX.blocked=function(r){
  if(diet.veg&&ingKeysReq(r).some(function(h){return h.k.length&&h.k.every(isMeat)}))return "húsos";
  if(diet.al.length){var al=norm((r.allergenek||[]).join(","));for(var i=0;i<diet.al.length;i++)if(al.indexOf(norm(diet.al[i]))>=0)return diet.al[i]}
  if(diet.ex.length){var ex=diet.ex.map(norm);var bad=ingKeysReq(r).filter(function(h){return h.k.length&&h.k.every(function(k){return ex.indexOf(norm(k))>=0})})[0];if(bad)return bad.nev}
  return ""};
var SEASON={0:["Káposzta","Savanyú káposzta","Sárgarépa","Cékla","Bab","Lencse","Narancs"],1:["Káposzta","Savanyú káposzta","Cékla","Bab","Lencse","Narancs"],2:["Spenót","Újhagyma","Retek","Sárgarépa"],3:["Spenót","Újhagyma","Retek","Saláta","Sonka"],
  4:["Spenót","Retek","Eper","Saláta","Újhagyma","Karalábé"],5:["Eper","Cukkini","Zöldbab","Uborka","Saláta","Karalábé"],6:["Paradicsom","Paprika","Uborka","Cukkini","Görögdinnye","Őszibarack","Padlizsán"],7:["Paradicsom","Paprika","Uborka","Cukkini","Görögdinnye","Őszibarack","Zöldbab"],
  8:["Paprika","Paradicsom","Szilva","Szőlő","Alma","Sütőtök"],9:["Sütőtök","Alma","Körte","Gomba","Káposzta","Szőlő"],10:["Sütőtök","Káposzta","Kelkáposzta","Alma","Cékla","Gomba"],11:["Káposzta","Savanyú káposzta","Mandarin","Narancs","Alma","Sütőtök"]};
function easter(y){var a=y%19,b=Math.floor(y/100),c=y%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451),mo=Math.floor((h+l-7*m+114)/31),da=((h+l-7*m+114)%31)+1;return new Date(y,mo-1,da)}
FX.holiday=function(){var n=new Date(),y=n.getFullYear(),md=(n.getMonth()+1)*100+n.getDate(),e=easter(y),de=Math.round((e-new Date(n.toDateString()))/864e5);
  if(md>=1210&&md<=1226)return{n:"Karácsony",ids:["unn-01","kar-01","kar-02","unn-02","hk-01","hus-30","kar-09","des-13","kar-03","kar-04","hk-23","kar-05","kar-06","kar-07","kar-10","kar-11"],t:"Közeleg a karácsony: ünnepi ötletek"};
  if(md>=1227||md<=101)return{n:"Szilveszter",ids:["foz-04","lev-07","mini-27","hk-13","hk-15","par-01","par-08","par-17","hid-01","lev-19","sze-14","egy-03"],t:"Szilveszter és újév: lencse a szerencséért, virsli éjfélkor"};
  if(de>=-10&&de<=1)return{n:"Húsvét",ids:["unn-06","hid-03","sal-04","huh-001","hk-20","des-03","lev-14","sze-17"],t:"Közeleg a húsvét: sonka, tojás, kalács"};
  if(md>=1120&&md<=1209)return{n:"Advent",ids:["kar-05","kar-06","kar-07","kar-03","kar-04","hk-23","kar-10","kar-11","hk-01","unn-02"],t:"Advent: ideje tervezni a karácsonyi menüt és sütiket"};
  if(md>=1020&&md<=1105)return{n:"Ősz",ids:["unn-04","unn-05","lev-04","foz-06","zol-09","des-07","lev-23"],t:"Sütőtök- és gombaszezon"};
  return null};
FX.bonus=function(r){var b=0;if(kedv[r.id]===1)b+=12;if(kedv[r.id]===-1)b-=25;
  var se=SEASON[new Date().getMonth()];if(r.hozzavalok.some(function(h){return h.k.some(function(k){return se.indexOf(k)>=0})}))b+=4;
  var ho=FX.holiday();if(ho&&ho.ids.indexOf(r.id)>=0)b+=8;return b};
FX.inSeason=function(r){var se=SEASON[new Date().getMonth()];return r.hozzavalok.some(function(h){return h.k.some(function(k){return se.indexOf(k)>=0})})};

/* ================= RECEPT NÉZET KIEGÉSZÍTÉSEK ================= */
FX.recipeExtra=function(r,c){var k=kedv[r.id]||0;
  return '<div class="btns fxrate"><button type="button" class="btn sm '+(k===1?"r":"p")+'" id="fxfav" aria-pressed="'+(k===1)+'">♥ Kedvenc</button><button type="button" class="btn sm '+(k===-1?"r":"p")+'" id="fxno" aria-pressed="'+(k===-1)+'">✗ Nem ízlett</button>'+
    (r.lepesek.length?'<button type="button" class="btn t sm" id="fxcook">▶ Főzés mód</button>':"")+"</div>"+(c.bl?'<div class="warnbox" style="background:#ffd9d2">A beállított étrend miatt rejtve: '+esc(c.bl)+"</div>":"")};
FX.recipeBind=function(r,c){
  if($("fxfav"))$("fxfav").onclick=function(){kedv[r.id]=kedv[r.id]===1?0:1;if(!kedv[r.id])delete kedv[r.id];sv(KX.kedv,kedv);openRecipe(r.id,true);drawView()};
  if($("fxno"))$("fxno").onclick=function(){kedv[r.id]=kedv[r.id]===-1?0:-1;if(!kedv[r.id])delete kedv[r.id];sv(KX.kedv,kedv);openRecipe(r.id,true);drawView()};
  if($("fxcook"))$("fxcook").onclick=function(){cookMode(r,c)}};

/* ================= MARADÉK ================= */
FX.afterCook=function(r,c,f){
  /* megmentett (hamar lejáró) alapanyagok */
  c.use.forEach(function(u){if(!u.basic&&u.dd<=2&&u.need>0){var p=costOf(u.key,u.bt,u.need*f);waste.sv.push({n:u.key,d:today(),ft:Math.round(p?cheapest(p):0)})}});
  sv(KX.waste,waste);
  var m=$("cmsg");if(!m)return;m.insertAdjacentHTML("beforeend",'<div class="fxleft"><b>Maradt belőle?</b> <span class="step"><button type="button" data-lo="0.5">½</button><button type="button" data-lo="1">1</button><button type="button" data-lo="2">2</button><button type="button" data-lo="3">3</button></span> <span class="q small">adag kerül a hűtőbe</span></div>');
  m.querySelectorAll("[data-lo]").forEach(function(b){b.onclick=function(){var q=parseFloat(b.dataset.lo);
    items.push({id:uid("i"),n:"Maradék: "+r.nev,q:q,u:"db",loc:"fridge",exp:plus(3),left:r.id});saveItems();drawAll();
    m.querySelector(".fxleft").innerHTML="Betettem a hűtőbe: <b>Maradék: "+esc(r.nev)+"</b> ("+nf(q)+" adag, 3 napig jó). Holnap ezt ajánlom elsőnek.";checkBadges()}})};
FX.leftovers=function(){return items.filter(function(i){return /^Maradék: /.test(i.n)&&days(i.exp)>=0&&i.q>0}).sort(function(a,b){return a.exp<b.exp?-1:1})};

/* ================= RAKTÁR: MAI MENÜ, GYEREK KÉRÉSE, MARADÉK ================= */
function drawToday(){var el=$("fxtoday");if(!el)return;var o="";
  if(kid&&kid.date===today()){var kr=recById(kid.id);if(kr)o+='<button type="button" class="fxban kid" data-open="'+kr.id+'"><span class="ic">'+ic("heart")+'</span><span><b>A gyerek ma ezt kérte:</b> '+esc(kr.nev)+"</span></button>"}
  var lo=FX.leftovers();lo.forEach(function(i){o+='<div class="fxban left"><span class="ic">'+ic("pot")+'</span><span><b>Maradék a hűtőben:</b> '+esc(i.n.replace("Maradék: ",""))+" ("+nf(i.q)+' adag, '+dtxt(days(i.exp))+')</span><button type="button" class="btn sm g" data-eat="'+i.id+'">Megettük</button></div>'});
  if(menu&&menu.days){var t=menu.days.filter(function(d){return d.date===today()})[0];if(t){var a=recById(t.l),b=recById(t.v);
    o+='<div class="fxban menu"><span class="ic">'+ic("book")+'</span><span><b>Ma a menüben:</b> '+(a?'<a href="#" data-open="'+a.id+'">'+esc(a.nev)+"</a> (ebéd)":"")+(b?(a?" · ":"")+'<a href="#" data-open="'+b.id+'">'+esc(b.nev)+"</a> (vacsora)":"")+"</span></div>"}}
  el.innerHTML=o}
document.addEventListener("click",function(e){var o=e.target.closest("[data-open]");if(o&&o.closest("#fxtoday,#mpb,#fxholi")){e.preventDefault();openRecipe(o.dataset.open)}
  var ea=e.target.closest("[data-eat]");if(ea){var it=items.filter(function(x){return x.id===ea.dataset.eat})[0];if(it){var pos=items.indexOf(it);items.splice(pos,1);
    meals.push({id:uid("m"),n:it.n.replace("Maradék: ",""),date:today(),type:new Date().getHours()<16?"ebed":"vacsora",cat:"egyeb"});sv(K.meals,meals);
    waste.sv.push({n:"maradék",d:today(),ft:0,lo:1});sv(KX.waste,waste);saveItems();drawAll();toast("Ügyes! A maradék nem veszett kárba.");checkBadges()}}});

/* ================= HETI MENÜ ================= */
var LUNCH={hus:1,hal:1,leves:1,foz:1,teszta:1,zoldseg:1,egyeb:1},DINNER={hus:1,hal:1,foz:1,teszta:1,zoldseg:1,egyeb:1,salata:1,szendvics:1,hidegtal:1,hideg:1,reggeli:1};
var DNAME=["vasárnap","hétfő","kedd","szerda","csütörtök","péntek","szombat"];
function candidates(){return allRec().map(check).filter(function(c){return !c.bl&&!c.r.mini&&!c.r.party&&kedv[c.r.id]!==-1&&(c.ok||c.miss.length<=2)})}
function pickOne(cands,slot,ctx){var best=[];cands.forEach(function(c){var r=c.r;if(ctx.used[r.id])return;if(!(slot==="l"?LUNCH:DINNER)[r.cat])return;
    var s=(c.ok?60:30-c.miss.length*10)+c.sc*0.4;
    if(ctx.lastCat===r.cat)s-=25;if(r.cat==="hus"&&ctx.hus>=3)s-=30;if(r.cat==="hal"&&!ctx.hal)s+=12;if(r.cat==="foz"&&ctx.foz<2)s+=10;if(r.cat==="leves"&&ctx.lev>=2)s-=20;
    if(slot==="v"&&(COLD[r.cat]||r.cat==="reggeli"))s+=6;if(slot==="v"&&r.ido_perc>60)s-=10;
    c.use.forEach(function(u){if(!u.basic&&ctx.keys[u.key])s-=8*ctx.keys[u.key]});
    best.push([s,c])});
  best.sort(function(a,b){return b[0]-a[0]});var top=best.slice(0,5);if(!top.length)return null;
  var tot=top.reduce(function(a,x){return a+Math.max(1,x[0]+40)},0),r=Math.random()*tot;for(var i=0;i<top.length;i++){r-=Math.max(1,top[i][0]+40);if(r<=0)return top[i][1]}return top[0][1]}
function note(ctx,c){var r=c.r;ctx.used[r.id]=1;ctx.lastCat=r.cat;if(r.cat==="hus")ctx.hus++;if(r.cat==="hal")ctx.hal++;if(r.cat==="foz")ctx.foz++;if(r.cat==="leves")ctx.lev++;c.use.forEach(function(u){if(!u.basic)ctx.keys[u.key]=(ctx.keys[u.key]||0)+1})}
function newCtx(){return{used:{},keys:{},lastCat:"",hus:0,hal:0,foz:0,lev:0}}
FX.planWeek=function(){var cands=candidates(),ctx=newCtx(),d=[];
  for(var i=0;i<7;i++){var day={date:plus(i)},a=pickOne(cands,"l",ctx);if(a){note(ctx,a);day.l=a.r.id}var b=pickOne(cands,"v",ctx);if(b){note(ctx,b);day.v=b.r.id}d.push(day)}
  menu={made:today(),days:d};sv(KX.menu,menu);return menu};
function reroll(i,slot){var cands=candidates(),ctx=newCtx();menu.days.forEach(function(d,j){[d.l,d.v].forEach(function(id){if(id&&!(j===i&&id===d[slot])){ctx.used[id]=1}})});
  ctx.used[menu.days[i][slot]]=1;var c=pickOne(cands,slot,ctx);if(c){menu.days[i][slot]=c.r.id;sv(KX.menu,menu)}showMenu()}
function showMenu(){if(!menu||!menu.days)FX.planWeek();
  /* lejárt napok eldobása, új napok hozzáadása */
  menu.days=menu.days.filter(function(d){return d.date>=today()});if(menu.days.length<7){var cands=candidates(),ctx=newCtx();menu.days.forEach(function(d){[d.l,d.v].forEach(function(id){if(id)ctx.used[id]=1})});
    while(menu.days.length<7){var dt=plus(menu.days.length),day={date:dt},a=pickOne(cands,"l",ctx);if(a){note(ctx,a);day.l=a.r.id}var b=pickOne(cands,"v",ctx);if(b){note(ctx,b);day.v=b.r.id}menu.days.push(day)}sv(KX.menu,menu)}
  var P=portions(),tot=[0,0,0],miss=0,o='<div class="q small">'+esc(people())+" · "+nf(P)+' adag étkezésenként. A ✓ jelű ételekhez minden megvan.</div><div class="mp">';
  menu.days.forEach(function(d,i){var dd=new Date(d.date+"T00:00:00");o+='<div class="mpd"><div class="mph pf">'+(i===0?"Ma":i===1?"Holnap":DNAME[dd.getDay()])+' <span class="q small">'+dd.toLocaleDateString("hu-HU",{month:"short",day:"numeric"})+"</span></div>";
    [["l","Ebéd"],["v","Vacsora"]].forEach(function(s){var r=recById(d[s[0]]);if(!r){o+='<div class="mps q">–</div>';return}var c=check(r),cost=recCost(r,c,P/r.adag);for(var k=0;k<3;k++)tot[k]+=cost.full[k];if(!c.ok)miss+=c.miss.length;
      o+='<div class="mps"><button type="button" class="mpn" data-open="'+r.id+'"><span class="ic">'+ic(RICO[r.cat]||"rice")+'</span><span><span class="q small">'+s[1]+"</span><br><b>"+esc(r.nev)+"</b> "+(c.ok?'<span class="badge ok">✓</span>':'<span class="badge warn">hiányzik '+c.miss.length+"</span>")+(kedv[r.id]===1?' <span class="badge">♥</span>':"")+'</span></button><button type="button" class="btn sm p" data-rr="'+i+","+s[0]+'" aria-label="Másik ötlet">↻</button></div>'});
    o+="</div>"});
  var bi=minI(tot);o+='</div><div class="sec">A hét becsült költsége</div><div class="shops">'+SHOPS.map(function(s,i){return '<div class="shop '+s[2]+(i===bi?" best":"")+'"><span class="sn">'+s[1]+'</span><span class="sp">'+ft(tot[i])+"</span></div>"}).join("")+"</div>"+
    (bud&&bud.w?'<div class="q small" style="margin-top:6px">Heti keret: '+ft(bud.w)+(tot[bi]>bud.w?" — a terv drágább a keretnél, cserélj néhány ételt (↻).":" — belefér a keretbe.")+"</div>":"")+
    '<div class="btns"><button type="button" class="btn t" id="mpshop">Hiányzók a listára'+(miss?" ("+miss+")":"")+'</button><button type="button" class="btn" id="mpnew">Új terv</button></div>';
  dlg("mp",o);$("mpb").onclick=function(e){var rr=e.target.closest("[data-rr]");if(rr){var a=rr.dataset.rr.split(",");reroll(+a[0],a[1])}};
  $("mpnew").onclick=function(){FX.planWeek();showMenu();toast("Új heti terv kész.")};
  $("mpshop").onclick=function(){var n=0;menu.days.forEach(function(d){[d.l,d.v].forEach(function(id){var r=recById(id);if(!r)return;var c=check(r);if(c.miss.length){toList(r,c,P/r.adag);n+=c.miss.length}})});toast(n?n+" hiányzó hozzávaló felírva a listára.":"Mindenhez megvan minden.");this.disabled=true}}
FX.showMenu=showMenu;

/* ================= FŐZÉS MÓD ================= */
var wake=null,timers=[];
function lockScreen(){try{if(navigator.wakeLock)navigator.wakeLock.request("screen").then(function(w){wake=w}).catch(function(){})}catch(e){}}
function unlockScreen(){try{if(wake)wake.release();wake=null}catch(e){}}
function beep(){try{var A=new (window.AudioContext||window.webkitAudioContext)();[0,.35,.7].forEach(function(t){var o=A.createOscillator(),g=A.createGain();o.type="square";o.frequency.value=880;g.gain.value=.15;o.connect(g);g.connect(A.destination);o.start(A.currentTime+t);o.stop(A.currentTime+t+.2)})}catch(e){}
  try{navigator.vibrate&&navigator.vibrate([300,150,300,150,600])}catch(e){}}
function stepTime(s){var m=/(\d+)(?:\s*[-–]\s*(\d+))?\s*(perc|óra|órán|órát)/i.exec(s);if(!m)return 0;var v=parseInt(m[2]||m[1]);return /^ór/i.test(m[3])?v*60:v}
function cookMode(r,c){var i=0,d=$("ck"),f=rdP/r.adag;lockScreen();
  function render(){var s=r.lepesek[i],t=stepTime(s);
    d.querySelector(".dbody").innerHTML='<div class="ckh"><span class="ic">'+ic(RICO[r.cat]||"pot")+'</span><b>'+esc(r.nev)+'</b><span class="pf">'+(i+1)+" / "+r.lepesek.length+'</span></div>'+
      '<details class="ckings"><summary>Hozzávalók ('+nf(rdP)+' adag)</summary><ul>'+r.hozzavalok.map(function(h){return"<li>"+esc(h.nev)+" "+fmtR(h,f)+"</li>"}).join("")+"</ul></details>"+
      '<div class="ckstep">'+esc(s)+"</div>"+(t?'<button type="button" class="btn t full" id="cktm">⏱ Időzítő: '+t+" perc</button>":"")+'<div id="cktimers">'+timerHtml()+"</div>"+
      '<div class="btns"><button type="button" class="btn p" id="ckp"'+(i?"":" disabled")+'>◀ Előző</button>'+(i<r.lepesek.length-1?'<button type="button" class="btn g" id="ckn">Következő ▶</button>':'<button type="button" class="btn g" id="ckdone">Kész! Ezt főztem</button>')+"</div>"+
      (r.kritikus.length?'<div class="warnbox small">'+esc(r.kritikus.join(" "))+"</div>":"");
    if($("ckp"))$("ckp").onclick=function(){i--;render()};if($("ckn"))$("ckn").onclick=function(){i++;render()};
    if($("cktm"))$("cktm").onclick=function(){timers.push({n:r.nev+" – "+(i+1)+". lépés",end:Date.now()+t*6e4});tick()};
    if($("ckdone"))$("ckdone").onclick=function(){d.close();if(c.ok)openRecipe(r.id,true);var b=$("rcook");if(b&&!b.disabled)b.click()}}
  render();if(!d.open)d.showModal();d.onclose=function(){unlockScreen()}}
function timerHtml(){return timers.map(function(t,k){var l=Math.max(0,Math.round((t.end-Date.now())/1e3));return '<div class="cktimer'+(l?"":" done")+'"><span class="pf">'+Math.floor(l/60)+":"+("0"+l%60).slice(-2)+"</span> "+esc(t.n)+' <button type="button" class="x" data-tx="'+k+'" aria-label="Időzítő törlése">×</button></div>'}).join("")}
var tickT=null;function tick(){clearTimeout(tickT);var now=Date.now();timers.forEach(function(t){if(!t.rang&&t.end<=now){t.rang=1;beep();notify("Lejárt az időzítő",t.n)}});
  var el=$("cktimers");if(el)el.innerHTML=timerHtml();if(timers.some(function(t){return !t.rang}))tickT=setTimeout(tick,1000)}
document.addEventListener("click",function(e){var x=e.target.closest("[data-tx]");if(x){timers.splice(+x.dataset.tx,1);tick()}});

/* ================= BOLTI MÓD ================= */
var AISLE=["pek","zold","gyum","hus","felv","hal","tej","sajt","tojas","szaraz","konz","szosz","fuszer","edes","ital","fagy","sajat"],shopSel=0;
function shopMode(){var d=$("bm");lockScreen();d.onclose=function(){unlockScreen();drawShop()};renderShop();if(!d.open)d.showModal()}
function renderShop(){var d=$("bm"),g={};shop.forEach(function(s){var c=find(s.n),k=c?c.c:"sajat";(g[k]=g[k]||[]).push(s)});
  var left=0,open=0;shop.forEach(function(s){if(!s.done){open++;left+=(lineCost(s)||[0,0,0])[shopSel]}});
  var o='<div class="ckh"><span class="ic">'+ic("cart")+'</span><b>Bolti mód</b><span class="pf">'+open+" maradt</span></div>"+
    '<div class="chips">'+SHOPS.map(function(s,i){return '<button type="button" class="chip" data-ss="'+i+'" aria-pressed="'+(i===shopSel)+'">'+s[1]+"</button>"}).join("")+'</div><div class="q small">Még kb. '+ft(left)+" ("+SHOPS[shopSel][1]+"). Koppints a tételre, ha a kosárba tetted. A család is látja élőben.</div>";
  AISLE.forEach(function(k){if(!g[k])return;o+='<div class="sec">'+esc(CATN[k]||"Egyéb")+"</div>"+g[k].map(function(s){var p=lineCost(s);return '<button type="button" class="bmrow'+(s.done?" done":"")+'" data-bm="'+s.id+'"><span class="ck" aria-hidden="true">'+(s.done?"✓":"")+'</span><span class="ic">'+ic(ico(s.n))+"</span><span><b>"+esc(s.n)+"</b> "+nf(s.q)+" "+s.u+"</span>"+(p?'<span class="price">'+ft(p[shopSel])+"</span>":"")+"</button>"}).join("")});
  if(!shop.length)o+='<div class="empty">Üres a lista.</div>';
  o+='<div class="btns"><button type="button" class="btn g" id="bmdone">Kész a bevásárlás</button></div>';d.querySelector(".dbody").innerHTML=o;
  $("bmdone").onclick=function(){d.close();showView("shop");var b=$("sbuy");if(b)toast("Koppints a „Kipipáltak a raktárba” gombra, hogy bekerüljenek a raktárba.")}}
document.addEventListener("click",function(e){var b=e.target.closest("[data-bm]");if(b){var s=shop.filter(function(x){return x.id===b.dataset.bm})[0];if(s){s.done=!s.done;sv(K.shop,shop);renderShop()}}
  var ss=e.target.closest("[data-ss]");if(ss){shopSel=+ss.dataset.ss;renderShop()}});
FX.shopMode=shopMode;

/* ================= VONALKÓD ================= */
var bcStream=null,bcLoop=null,bcAC=null;
function bcAudio(){try{if(!bcAC)bcAC=new (window.AudioContext||window.webkitAudioContext)();if(bcAC.state==="suspended")bcAC.resume()}catch(e){bcAC=null}return bcAC}
/* bolti vonalkód-olvasó csippanás: rövid, magas, tiszta hang + rövid rezgés */
function scanBeep(){var A=bcAudio();if(A)try{var t=A.currentTime+.01,o=A.createOscillator(),g=A.createGain();o.type="sine";o.frequency.setValueAtTime(2900,t);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.35,t+.005);g.gain.setValueAtTime(.35,t+.11);g.gain.linearRampToValueAtTime(0,t+.13);o.connect(g);g.connect(A.destination);o.start(t);o.stop(t+.15)}catch(e){}
  try{navigator.vibrate&&navigator.vibrate(60)}catch(e){}}
function bcStop(){if(bcLoop){cancelAnimationFrame(bcLoop);clearTimeout(bcLoop)}bcLoop=null;if(bcStream){bcStream.getTracks().forEach(function(t){t.stop()});bcStream=null}}
function lcp(a,b){var i=0;while(i<a.length&&i<b.length&&a[i]===b[i])i++;return i}
function matchCat(text){var t=" "+norm(text).replace(/[^a-z0-9 ]/g," ")+" ",toks=t.trim().split(/\s+/),best=null,bs=0;
  allProds().forEach(function(c){var n=norm(c.n).replace(/[^a-z0-9 ]/g," ").trim();if(n.length<3)return;var sc=0,ok=n.split(/\s+/).every(function(x){var m=0;toks.forEach(function(tk){m=Math.max(m,lcp(x,tk))});if(m<Math.min(4,x.length))return false;sc+=m-(x.length-m)*0.5;return true});
    if(ok&&sc>bs){bs=sc;best=c}});
  var SYN={trappista:"Sajt",edami:"Sajt",gouda:"Gouda",teszta:"Tészta",spagetti:"Spagetti",fusilli:"Tészta",penne:"Tészta",kifli:"Kifli",zsemle:"Zsemle",kenyer:"Kenyér",tojas:"Tojás",tejfol:"Tejföl",joghurt:"Joghurt",vaj:"Vaj",liszt:"Liszt",cukor:"Cukor",rizs:"Rizs",sonka:"Sonka",parizsi:"Párizsi",szalami:"Szalámi",csirkemell:"Csirkemell",csirkecomb:"Csirkecomb",burgonya:"Burgonya",krumpli:"Burgonya",hagyma:"Vöröshagyma",paradicsom:"Paradicsom",paprika:"Paprika",uborka:"Uborka",alma:"Alma",banan:"Banán",tej:"Tej",turo:"Túró",mozzarella:"Mozzarella",olaj:"Étolaj",ketchup:"Ketchup",mustar:"Mustár",majonez:"Majonéz",
    /* v1.32: idegen nyelvű termékadatbázis-nevek (angol, német, olasz, francia, lengyel, cseh, szlovák) */
    vollmilch:"Tej",frischmilch:"Tej",haltbare:"Tartós tej",orangensaft:"Narancslé",orangejuice:"Narancslé",apfelsaft:"Almalé",applejuice:"Almalé",milk:"Tej",milch:"Tej",latte:"Tej",lait:"Tej",mleko:"Tej",butter:"Vaj",burro:"Vaj",beurre:"Vaj",maslo:"Vaj",cheese:"Sajt",kase:"Sajt",formaggio:"Sajt",fromage:"Sajt",syr:"Sajt",
    yoghurt:"Joghurt",yogurt:"Joghurt",jogurt:"Joghurt",yaourt:"Joghurt",quark:"Túró",tvaroh:"Túró",twarog:"Túró",cream:"Tejszín",sahne:"Tejszín",panna:"Tejszín",smetana:"Tejföl",eggs:"Tojás",eier:"Tojás",uova:"Tojás",oeufs:"Tojás",jaja:"Tojás",vejce:"Tojás",
    bread:"Kenyér",brot:"Kenyér",pane:"Kenyér",pain:"Kenyér",chleb:"Kenyér",chleba:"Kenyér",toast:"Toast kenyér",flour:"Liszt",mehl:"Liszt",farina:"Liszt",farine:"Liszt",mouka:"Liszt",sugar:"Cukor",zucker:"Cukor",zucchero:"Cukor",sucre:"Cukor",cukier:"Cukor",
    rice:"Rizs",reis:"Rizs",riso:"Rizs",ryz:"Rizs",pasta:"Tészta",nudeln:"Tészta",makaron:"Tészta",schinken:"Sonka",prosciutto:"Sonka",jambon:"Sonka",szynka:"Sonka",sunka:"Sonka",salami:"Szalámi",sausage:"Füstölt kolbász",wurst:"Füstölt kolbász",kielbasa:"Füstölt kolbász",
    wiener:"Virsli",frankfurter:"Virsli",bacon:"Bacon",speck:"Szalonna",chicken:"Csirkehús",hahnchen:"Csirkehús",pollo:"Csirkehús",poulet:"Csirkehús",kurczak:"Csirkehús",pork:"Sertéshús",schwein:"Sertéshús",beef:"Marhahús",rind:"Marhahús",manzo:"Marhahús",
    turkey:"Pulykamell",pute:"Pulykamell",tuna:"Tonhalkonzerv",thunfisch:"Tonhalkonzerv",tonno:"Tonhalkonzerv",thon:"Tonhalkonzerv",salmon:"Lazac",lachs:"Lazac",salmone:"Lazac",saumon:"Lazac",fish:"Halfilé",fisch:"Halfilé",
    potato:"Burgonya",potatoes:"Burgonya",kartoffel:"Burgonya",patate:"Burgonya",onion:"Vöröshagyma",zwiebel:"Vöröshagyma",cipolla:"Vöröshagyma",garlic:"Fokhagyma",knoblauch:"Fokhagyma",aglio:"Fokhagyma",tomato:"Paradicsom",tomaten:"Paradicsom",pomodoro:"Paradicsom",pelati:"Konzerv paradicsom",
    carrot:"Sárgarépa",karotte:"Sárgarépa",mohren:"Sárgarépa",cucumber:"Uborka",gurke:"Uborka",gherkins:"Csemegeuborka",pepper:"Paprika",mushroom:"Gomba",pilze:"Gomba",champignon:"Gomba",funghi:"Gomba",spinach:"Spenót",spinat:"Spenót",
    apple:"Alma",apfel:"Alma",mela:"Alma",pomme:"Alma",banana:"Banán",banane:"Banán",orange:"Narancs",lemon:"Citrom",zitrone:"Citrom",limone:"Citrom",grapes:"Szőlő",trauben:"Szőlő",strawberr:"Eper",erdbeer:"Eper",
    oil:"Étolaj",olio:"Étolaj",huile:"Étolaj",olej:"Étolaj",olive:"Olívaolaj",vinegar:"Ecet",essig:"Ecet",aceto:"Ecet",salt:"Só",salz:"Só",honey:"Méz",honig:"Méz",miele:"Méz",miel:"Méz",
    jam:"Lekvár",marmelade:"Lekvár",konfiture:"Lekvár",confettura:"Lekvár",chocolate:"Csokoládé",schokolade:"Csokoládé",cioccolato:"Csokoládé",chocolat:"Csokoládé",czekolada:"Csokoládé",cokolada:"Csokoládé",
    biscuit:"Keksz",cookies:"Keksz",kekse:"Keksz",biscotti:"Keksz",coffee:"Kávé",kaffee:"Kávé",caffe:"Kávé",cafe:"Kávé",kawa:"Kávé",kava:"Kávé",tea:"Tea",tee:"Tea",cocoa:"Kakaópor",kakao:"Kakaópor",
    oats:"Zabpehely",hafer:"Zabpehely",avena:"Zabpehely",cornflakes:"Kukoricapehely",muesli:"Müzli",musli:"Müzli",sweetcorn:"Kukorica konzerv",peas:"Zöldborsó konzerv",erbsen:"Zöldborsó konzerv",beans:"Bab konzerv",bohnen:"Bab konzerv",fagioli:"Bab konzerv",
    lentils:"Lencse",linsen:"Lencse",chickpeas:"Csicseriborsó konzerv",kichererbsen:"Csicseriborsó konzerv",ceci:"Csicseriborsó konzerv",water:"Ásványvíz",wasser:"Ásványvíz",acqua:"Ásványvíz",woda:"Ásványvíz",voda:"Ásványvíz",
    juice:"Narancslé",saft:"Narancslé",succo:"Narancslé",beer:"Sör",bier:"Sör",birra:"Sör",piwo:"Sör",pivo:"Sör",wine:"Vörösbor",wein:"Vörösbor",vino:"Vörösbor",chips:"Chips",crisps:"Chips",pretzel:"Sós perec",brezel:"Sós perec",
    peanuts:"Földimogyoró",erdnusse:"Földimogyoró",walnut:"Dió",walnusse:"Dió",noci:"Dió",icecream:"Jégkrém",speiseeis:"Jégkrém",gelato:"Jégkrém",pizza:"Fagyasztott pizza",fries:"Fagyasztott hasábburgonya",pommes:"Fagyasztott hasábburgonya",
    mayonnaise:"Majonéz",maionese:"Majonéz",senf:"Mustár",mustard:"Mustár",ketschup:"Ketchup",yeast:"Élesztő",hefe:"Élesztő",lievito:"Élesztő"};
  if(!best)Object.keys(SYN).some(function(k){if(t.indexOf(" "+k)>=0){best=find(SYN[k]);return true}});return best}
function parseQty(s){var m=/(\d+(?:[.,]\d+)?)\s*(kg|g|l|ml|dl|cl|db)\b/i.exec(s||"");if(!m)return null;return{q:parseFloat(m[1].replace(",",".")),u:m[2].toLowerCase()}}
var lastScan=null;
/* ---- GS1: DataMatrix, QR (GS1 Digital Link), GS1-128 és DataBar – a kódban lejárat (17), minőségmegőrzés (15), nettó tömeg (310n), térfogat (315n), darab (30) ---- */
var GSFIX={"00":18,"01":14,"02":14,"11":6,"12":6,"13":6,"15":6,"16":6,"17":6,"20":2},GSVAR={"10":20,"21":20,"22":20,"30":8,"37":8,"240":30,"241":30,"90":30,"91":90,"92":90,"93":90,"94":90,"95":90,"96":90,"97":90,"98":90,"99":90};
function gsDate(v){if(!/^\d{6}$/.test(v))return null;var y=2000+ +v.slice(0,2),m=+v.slice(2,4),d=+v.slice(4);if(!d)d=lastDay(y,m);return okDate(y,m,d)}
function gtinEan(g){g=String(g).replace(/^0+(?=\d{13}$)/,"");if(/^0{6}\d{8}$/.test(g)||/^0{5}\d{8}$/.test(g))g=g.slice(-8);return g}
FX.parseGS1=function(raw){var s=String(raw||"").trim(),o={},m;if(!s)return null;
  /* GS1 Digital Link: https://valami/01/05991234567890/10/LOT?17=270312 */
  if(/^https?:\/\//i.test(s)){m=/\/01\/(\d{8,14})/.exec(s);if(!m)return null;o.gtin=gtinEan(m[1]);var q=/[\/?&](17|15)[=\/](\d{6})/.exec(s);if(q)o[q[1]==="17"?"exp":"best"]=gsDate(q[2]);var l=/\/10\/([^\/?]+)/.exec(s);if(l)o.lot=decodeURIComponent(l[1]);return o}
  s=s.replace(/^\][A-Za-z]\d/,"");
  if(/^\(\d{2,4}\)/.test(s)){var re=/\((\d{2,4})\)([^(]*)/g;while(m=re.exec(s))put(m[1],m[2].trim())}
  else{if(!/^(01|02)\d{14}/.test(s)&&s.indexOf("\x1d")<0)return null;var p=0,guard=0;while(p<s.length&&guard++<20){if(s[p]==="\x1d"){p++;continue}var a2=s.substr(p,2),a3=s.substr(p,3),ai,len;
      if(GSFIX[a2]){ai=a2;len=GSFIX[a2];put(ai,s.substr(p+2,len));p+=2+len;continue}
      if(/^3[1-6]\d$/.test(a3)){ai=s.substr(p,4);put(ai,s.substr(p+4,6));p+=10;continue}
      ai=GSVAR[a3]?a3:GSVAR[a2]?a2:null;if(!ai)break;var e=s.indexOf("\x1d",p+ai.length);if(e<0)e=s.length;put(ai,s.slice(p+ai.length,Math.min(e,p+ai.length+GSVAR[ai])));p=e}}
  function put(ai,v){if(ai==="01"||ai==="02")o.gtin=gtinEan(v);else if(ai==="17")o.exp=gsDate(v);else if(ai==="15"||ai==="16")o.best=gsDate(v);else if(ai==="10")o.lot=v;
    else if(/^310\d$/.test(ai))o.qty={q:+v/Math.pow(10,+ai[3]),u:"kg"};else if(/^315\d$/.test(ai))o.qty={q:+v/Math.pow(10,+ai[3]),u:"l"};else if(ai==="30"||ai==="37")o.qty={q:+v,u:"db"}}
  if(o.qty&&o.qty.u==="kg"&&o.qty.q<1){o.qty={q:Math.round(o.qty.q*1000),u:"g"}}
  return o.gtin?o:null};
/* GS1 cégelőtag → ország (a kódot kiadó szervezet, nem feltétlenül a gyártás helye) */
var GSC=[[0,139,"USA/Kanada"],[200,299,"bolti belső kód"],[300,379,"Franciaország"],[380,380,"Bulgária"],[383,383,"Szlovénia"],[385,385,"Horvátország"],[387,387,"Bosznia"],[389,389,"Montenegró"],[400,440,"Németország"],[450,459,"Japán"],[460,469,"Oroszország"],[471,471,"Tajvan"],[474,474,"Észtország"],[475,475,"Lettország"],[477,477,"Litvánia"],[480,480,"Fülöp-szigetek"],[482,482,"Ukrajna"],[484,484,"Moldova"],[489,489,"Hongkong"],[490,499,"Japán"],[500,509,"Egyesült Királyság"],[520,521,"Görögország"],[528,528,"Libanon"],[529,529,"Ciprus"],[530,530,"Albánia"],[531,531,"Észak-Macedónia"],[535,535,"Málta"],[539,539,"Írország"],[540,549,"Belgium/Luxemburg"],[560,560,"Portugália"],[569,569,"Izland"],[570,579,"Dánia"],[590,590,"Lengyelország"],[594,594,"Románia"],[599,599,"Magyarország"],[600,601,"Dél-Afrika"],[640,649,"Finnország"],[690,699,"Kína"],[700,709,"Norvégia"],[729,729,"Izrael"],[730,739,"Svédország"],[740,745,"Közép-Amerika"],[750,750,"Mexikó"],[754,755,"Kanada"],[760,769,"Svájc"],[770,771,"Kolumbia"],[779,779,"Argentína"],[780,780,"Chile"],[789,790,"Brazília"],[800,839,"Olaszország"],[840,849,"Spanyolország"],[858,858,"Szlovákia"],[859,859,"Csehország"],[860,860,"Szerbia"],[868,869,"Törökország"],[870,879,"Hollandia"],[880,880,"Dél-Korea"],[885,885,"Thaiföld"],[888,888,"Szingapúr"],[890,890,"India"],[893,893,"Vietnám"],[899,899,"Indonézia"],[900,919,"Ausztria"],[930,939,"Ausztrália"],[940,949,"Új-Zéland"],[955,955,"Malajzia"]];
function gsCountry(code){if(!/^\d{13}$/.test(code))return"";var p=+code.slice(0,3);for(var i=0;i<GSC.length;i++)if(p>=GSC[i][0]&&p<=GSC[i][1])return GSC[i][2];return""}
FX.gsCountry=gsCountry;FX.matchName=function(n){var c=rcLookup(n);return c?c.n:null};FX.zxReader=function(){return loadZx().then(zxReader)};FX.ocrVariant=ocrVariant;
var gs1Pend=null;
function applyScan(code,name,qty,info,mem){var g1=gs1Pend;gs1Pend=null;if(g1&&g1.qty)qty=g1.qty;
  if(g1){var gi=[];if(g1.exp||g1.best)gi.push("lejárat a kódból: "+(g1.exp||g1.best).replace(/-/g,". ")+".");if(g1.qty)gi.push("mennyiség a kódból");if(g1.lot)gi.push("tétel: "+g1.lot);if(gi.length)info=(info?info+" · ":"")+gi.join(" · ")}
  var cm=/^(.+) \((.+)\)$/.exec(name||""),c=(name?rcLookup(name):null)||find(name)||(cm&&find(cm[1]));if(c&&cm)name=cm[2];$("fn").value=c?c.n:name;$("fn").dispatchEvent(new Event("input"));
  if(qty&&["g","kg","ml","dl","l","db"].indexOf(qty.u)>=0){$("fq").value=qty.q;$("fu").value=qty.u}else if(qty&&qty.u==="cl"){$("fq").value=qty.q*10;$("fu").value="ml"}
  qtySync();$("fph").innerHTML="Vonalkód: "+esc(code)+(name&&(!c||norm(c.n)!==norm(name))?" · "+esc(name):"")+(info?" · "+esc(info):"")+"<br>"+$("fph").innerHTML;var eh=null;if(mem){if(mem.l)$("fl").value=mem.l;if(mem.d){eh=plus(mem.d);$("fe").value=eh}}if(g1&&(g1.exp||g1.best)){eh=g1.exp||g1.best;$("fe").value=eh}
  lastScan={code:code,orig:$("fn").value};photoFlow(qty,eh)}
/* ---- vonalkód-keresés több forrásból ----
   1) saját/közös emlék (családi szinkron)  2) helyi gyorsítótár  3) Open Food Facts (élelmiszer, minden lánc: Tesco, Aldi, Lidl, Penny, Spar, kifli.hu...)
   4) Open Products / Beauty / Pet Food Facts (háztartás, drogéria, állateledel)  5) UPCitemdb (nemzetközi)
   Bolti mérlegcímke (2-vel kezdődő EAN: pék-, hús-, csemegepult, kisbolt) a termékkód alapján emlékszik. */
var BCACHE="kajax.barcache",STOREBR={lidl:["pilos","milbona","chef select","dulano","freeway","crownfield","solevita","snack day","combino","sondey","alesto","kania","vemondo","fin carre","baresa","deluxe","fairglobe","bellarom","cien","w5","lupilu","vitasia","italiamo","eridanous","perlenbacher","favorina","nixe","lidl"],
  aldi:["milsani","gut bio","moser roth","choceur","lacura","tandil","mamia","aldi"],tesco:["tesco"],spar:["s-budget","s budget","spar"],penny:["penny"],"kifli.hu":["miil","kifli"],auchan:["auchan"],cba:["cba"],coop:["coop"]};
var CATHU={"en:milks":"Tej","en:yogurts":"Joghurt","en:cheeses":"Sajt","en:butters":"Vaj","en:eggs":"Tojás","en:pastas":"Tészta","en:rices":"Rizs","en:breads":"Kenyér","en:flours":"Liszt","en:sugars":"Cukor","en:sour-creams":"Tejföl","en:hams":"Sonka","en:fresh-cheeses":"Túró","en:creams":"Tejszín","en:sunflower-oils":"Étolaj","en:ketchup":"Ketchup","en:mustards":"Mustár","en:mayonnaises":"Majonéz","en:salamis":"Szalámi","en:mozzarella":"Mozzarella","en:apples":"Alma","en:bananas":"Banán","en:potatoes":"Burgonya","en:onions":"Vöröshagyma","en:tomatoes":"Paradicsom"};
function storeOf(brands){var b=" "+norm(brands||"")+" ",r="";Object.keys(STOREBR).some(function(k){if(STOREBR[k].some(function(x){return b.indexOf(x)>=0})){r=k;return true}});return r}
function bcKey(code){return /^2\d{12}$/.test(code)?code.slice(0,7):code}
function getJ(url,ms){var c=window.AbortController?new AbortController():null,t=setTimeout(function(){if(c)c.abort()},ms||7000);
  return fetch(url,c?{signal:c.signal}:{}).then(function(r){clearTimeout(t);if(!r.ok)throw new Error(r.status);return r.json()})}
function offSrc(host,lbl){return function(code){return getJ("https://"+host+"/api/v2/product/"+code+".json?lc=hu&fields=product_name,product_name_hu,generic_name,generic_name_hu,quantity,brands,categories_tags").then(function(j){var p=j&&j.product;
  var n=p&&(p.product_name_hu||p.product_name||p.generic_name_hu||p.generic_name);if(!n)throw 0;var cat=(p.categories_tags||[]).slice().reverse().map(function(c){return CATHU[c]}).filter(Boolean)[0]||"";
  return{n:n.trim(),brand:(p.brands||"").split(",")[0].trim(),q:parseQty(p.quantity),cat:cat,src:lbl}})}}
var SRC1=[offSrc("world.openfoodfacts.org","Open Food Facts")],
    SRC2=[offSrc("world.openproductsfacts.org","Open Products Facts"),offSrc("world.openbeautyfacts.org","Open Beauty Facts"),offSrc("world.openpetfoodfacts.org","Open Pet Food Facts"),
      function(code){return getJ("https://api.upcitemdb.com/prod/trial/lookup?upc="+code).then(function(j){var it=j&&j.items&&j.items[0];if(!it||!it.title)throw 0;return{n:it.title,brand:it.brand||"",q:parseQty(it.title+" "+(it.size||"")),cat:"",src:"UPCitemdb"}})}];
function firstOk(fns,code){return new Promise(function(res,rej){var left=fns.length;fns.forEach(function(f){f(code).then(res,function(){if(--left===0)rej()})})})}
function bcInfo(code,p){var tx=[];if(p&&p.brand&&norm(p.n).indexOf(norm(p.brand))<0)tx.push(p.brand);var st=p&&storeOf((p.brand||"")+" "+p.n);if(st)tx.push(st.charAt(0).toUpperCase()+st.slice(1)+" saját márka");
  var gc=gsCountry(code);if(gc&&gc!=="bolti belső kód")tx.push(gc==="Magyarország"?"magyar termék":"GS1: "+gc);if(p&&p.src)tx.push(p.src);return tx.join(" · ")}
function scanDone(code,name,qty,info,mem){$("bc").close();applyScan(code,name,qty,info,mem)}
function lookup(code){var st=$("bcst"),key=bcKey(code);barmap=ld(KX.bar,{});
  if(barmap[key]){var m=barmap[key];scanDone(key,m.n,key!==code?null:m.q,(key!==code?"bolti címke · ":"")+"megjegyzett termék"+(m.t>1?" ("+m.t+". alkalom)":""),m);return}
  if(key!==code){st.textContent="Bolti címke (pl. pékáru, hús, csemege, kisbolt). Írd be egyszer a nevét, utána felismerem.";scanDone(key,"",null,"bolti címke");$("fn").focus();return}
  var cache=ld(BCACHE,{});if(cache[code]){var c=cache[code];scanDone(code,c.n,c.q,bcInfo(code,c));return}
  st.textContent="Keresem a termékadatbázisokban ("+code+")...";
  firstOk(SRC1,code).catch(function(){st.textContent="Keresem a háztartási és nemzetközi adatbázisokban...";return firstOk(SRC2,code)}).then(function(p){
    var ks=Object.keys(cache);if(ks.length>400)delete cache[ks[0]];cache[code]={n:p.n,brand:p.brand,q:p.q,cat:p.cat,src:p.src};sv(BCACHE,cache);
    scanDone(code,p.cat&&!matchCat(p.n)?p.cat+" ("+p.n+")":p.n,p.q,bcInfo(code,p))
  }).catch(function(){st.innerHTML=navigator.onLine===false?"Nincs internet, írd be kézzel a nevét.":"Ezt a vonalkódot egyik adatbázis sem ismeri. Írd be a nevét: utána nálad és a közös raktár minden tagjánál felismerem.";
    scanDone(code,"",null,/^599/.test(code)?"magyar termék":"");$("fn").focus()})}
/* ---- kamera segéd: nagy felbontás, folyamatos fókusz, vaku és nagyítás, ha a telefon tudja ---- */
function camStart(v){return navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:{ideal:"environment"},width:{ideal:1920},height:{ideal:1080},advanced:[{focusMode:"continuous"}]}})
  .catch(function(){return navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"}})})
  .then(function(st){v.srcObject=st;v.setAttribute("playsinline","");v.muted=true;var p=v.play();var tr=st.getVideoTracks()[0],caps={};try{caps=tr.getCapabilities?tr.getCapabilities():{}}catch(e){}
    try{var adv={};if(caps.focusMode&&caps.focusMode.indexOf("continuous")>=0)adv.focusMode="continuous";if(caps.exposureMode&&caps.exposureMode.indexOf("continuous")>=0)adv.exposureMode="continuous";
      if(caps.whiteBalanceMode&&caps.whiteBalanceMode.indexOf("continuous")>=0)adv.whiteBalanceMode="continuous";if(Object.keys(adv).length)tr.applyConstraints({advanced:[adv]}).catch(function(){})}catch(e){}
    return Promise.resolve(p).catch(function(){}).then(function(){return{st:st,tr:tr,caps:caps}})})}
function camTools(cam,torchBtn,zoomBtn){var c=cam.caps||{},on=false,z=1;
  if(torchBtn){torchBtn.hidden=!c.torch;torchBtn.onclick=function(){on=!on;cam.tr.applyConstraints({advanced:[{torch:on}]}).catch(function(){});torchBtn.setAttribute("aria-pressed",on)}}
  if(zoomBtn){var zmax=c.zoom&&c.zoom.max||1;zoomBtn.hidden=!(zmax>1.4);zoomBtn.onclick=function(){z=z>=Math.min(3,zmax)-.01?1:Math.min(z+1,zmax,3);cam.tr.applyConstraints({advanced:[{zoom:z}]}).catch(function(){});zoomBtn.textContent="🔍 "+z+"×"}}}
/* a látható keretnek megfelelő rész kivágása a videóból (object-fit: cover figyelembevételével) */
function grab(v,frame,maxW,pad){var vw=v.videoWidth,vh=v.videoHeight;if(!vw||!vh)return null;var bw=v.clientWidth,bh=v.clientHeight,sc=Math.max(bw/vw,bh/vh),ox=(bw-vw*sc)/2,oy=(bh-vh*sc)/2;
  var vr=v.getBoundingClientRect(),fr=frame?frame.getBoundingClientRect():vr,px=pad?fr.width*pad:0,py=pad?fr.height*pad*1.6:0,x=(fr.left-px-vr.left-ox)/sc,y=(fr.top-py-vr.top-oy)/sc,w=(fr.width+2*px)/sc,h=(fr.height+2*py)/sc;
  x=Math.max(0,x);y=Math.max(0,y);w=Math.min(vw-x,w);h=Math.min(vh-y,h);var k=Math.min(1,(maxW||1400)/w),c=document.createElement("canvas");c.width=Math.round(w*k);c.height=Math.round(h*k);
  c.getContext("2d").drawImage(v,x,y,w,h,0,0,c.width,c.height);return c}
function eanOk(code){if(!/^\d{8}$|^\d{12,14}$/.test(code))return true;var d=code.split("").map(Number),ch=d.pop(),s=0;d.reverse().forEach(function(n,i){s+=n*(i%2?1:3)});return(10-s%10)%10===ch}
var zxLoaded=null;function loadZx(){if(window.ZXing)return Promise.resolve();if(zxLoaded)return zxLoaded;zxLoaded=new Promise(function(res,rej){var s=document.createElement("script");s.src="vendor/zxing/zxing.min.js";s.onload=res;s.onerror=function(){zxLoaded=null;rej(new Error("zxing"))};document.head.appendChild(s)});return zxLoaded}
/* ZXing tartalék, képváltozatokkal: 0 alap, 1 inverz (fényes/fém felület, világos vonalak sötéten), 2 elforgatva 90° (álló kód dobozon, üvegen),
   3 globális küszöb (egyenletes fény), 4 kontraszt+gamma (sötét/fakó), 5 teljes kép (DataMatrix/QR a kereten kívül) */
function zxReader(){var Z=window.ZXing,h=new Map(),F=Z.BarcodeFormat;h.set(Z.DecodeHintType.POSSIBLE_FORMATS,[F.EAN_13,F.EAN_8,F.UPC_A,F.UPC_E,F.CODE_128,F.ITF,F.CODE_39,F.CODE_93,F.CODABAR,F.RSS_14,F.RSS_EXPANDED,F.DATA_MATRIX,F.QR_CODE].filter(function(x){return x!=null}));h.set(Z.DecodeHintType.TRY_HARDER,true);var r=new Z.MultiFormatReader();r.setHints(h);
  return function(c,n){n=n||0;if(n===2)c=rotC(c,90);var x=c.getContext("2d"),d=x.getImageData(0,0,c.width,c.height).data,g=new Uint8ClampedArray(c.width*c.height),i,j;for(i=0,j=0;j<g.length;i+=4,j++)g[j]=(d[i]*306+d[i+1]*601+d[i+2]*117)>>10;
    if(n===1)for(j=0;j<g.length;j++)g[j]=255-g[j];
    if(n===4){var lo=255,hi=0;for(j=0;j<g.length;j++){if(g[j]<lo)lo=g[j];if(g[j]>hi)hi=g[j]}var sc=255/Math.max(16,hi-lo);for(j=0;j<g.length;j++)g[j]=(g[j]-lo)*sc;gammaFix(g)}
    try{var L=new Z.RGBLuminanceSource(g,c.width,c.height),B=n===3&&Z.GlobalHistogramBinarizer?new Z.GlobalHistogramBinarizer(L):new Z.HybridBinarizer(L),res=r.decode(new Z.BinaryBitmap(B));return res&&res.getText()}catch(e){return null}finally{try{r.reset()}catch(e){}}}}
/* BarcodeDetector másodlagos próbája feldolgozott képen (inverz / kontraszt), ha a nyers kép nem ment */
function bdVariant(c,n){var x=c.getContext("2d"),im=x.getImageData(0,0,c.width,c.height),a=im.data,i;if(n%2){for(i=0;i<a.length;i+=4){a[i]=255-a[i];a[i+1]=255-a[i+1];a[i+2]=255-a[i+2]}}
  else{var lo=255,hi=0,g;for(i=0;i<a.length;i+=4){g=(a[i]*3+a[i+1]*6+a[i+2])/10;a[i]=a[i+1]=a[i+2]=g;if(g<lo)lo=g;if(g>hi)hi=g}var sc=255/Math.max(16,hi-lo);for(i=0;i<a.length;i+=4){g=(a[i]-lo)*sc;a[i]=a[i+1]=a[i+2]=g}}x.putImageData(im,0,0);return c}
var bcCam=null,BCTIPS=["Tartsd a vonalkódot a keretbe, kb. 10–15 cm-re.","Hajlított felületen (doboz, üveg) a vonalak álljanak függőlegesen, a kód legyen középen.","Fényes fólián döntsd meg kicsit a terméket, hogy ne csillogjon.","Kicsi kódnál használd a 🔍 nagyítást, és ne menj túl közel.","A négyzetes kódot (DataMatrix, QR) is olvasom: abból a lejáratot is kiveszem."];
function scan(){bcAudio();var d=$("bc"),st=$("bcst");st.textContent=BCTIPS[0];$("bcman").value="";d.showModal();d.onclose=bcStop;gs1Pend=null;
  if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){st.textContent="Ez a böngésző nem fér hozzá a kamerához. Írd be a számokat kézzel.";return}
  var det=null,zx=null,last="",hits=0,busy=false,tries=0;
  var prep=("BarcodeDetector" in window?Promise.resolve(BarcodeDetector.getSupportedFormats?BarcodeDetector.getSupportedFormats():["ean_13"]).then(function(f){var want=["ean_13","ean_8","upc_a","upc_e","code_128","itf","code_39","code_93","codabar","data_matrix","qr_code"].filter(function(x){return f.indexOf(x)>=0});
      if(want.indexOf("ean_13")<0)throw 0;det=new BarcodeDetector({formats:want})}):Promise.reject()).catch(function(){return loadZx().then(function(){zx=zxReader()})});
  Promise.all([prep,camStart($("bcv"))]).then(function(r){var cam=r[1];bcStream=cam.st;bcCam=cam;camTools(cam,$("bctorch"),$("bczoom"));var v=$("bcv");
    function found(code){code=String(code).trim();var g=FX.parseGS1(code);if(g&&g.gtin){code=g.gtin}else if(!/^\d{6,14}$/.test(code))return false;
      if(!eanOk(code))return false;if(code===last)hits++;else{last=code;hits=1}if(hits<2&&!g)return false;gs1Pend=g;scanBeep();bcStop();lookup(code);return true}
    function loop(){if(!bcStream)return;if(busy||v.readyState<2){bcLoop=setTimeout(loop,120);return}busy=true;tries++;
      if(tries%15===0){var lc=grab(v,null,320),lt=lc&&lightTip(lc,$("bctorch"));st.textContent=lt||BCTIPS[Math.floor(tries/15)%BCTIPS.length]}
      /* a ZXing a BarcodeDetector mellé is betöltődik, ha sokáig nem megy (inverz, sérült, elforgatott kód) */
      if(tries===90&&det&&!zx)loadZx().then(function(){zx=zxReader()}).catch(function(){});
      var p=det?det.detect(v).then(function(rs){for(var i=0;i<(rs||[]).length;i++)if(found(rs[i].rawValue))return true;
          if(tries%3===0){var c=grab(v,tries%6===0?null:$("bcframe"),1200,.15);if(c)return det.detect(bdVariant(c,tries/3)).then(function(r2){for(var j=0;j<(r2||[]).length;j++)if(found(r2[j].rawValue))return true;
            if(zx&&tries%9===0){var t=zx(c,(tries/9)%6);return !!(t&&found(t))}return false})}return false})
        :Promise.resolve().then(function(){var n=tries%6,c=grab(v,n===5?null:$("bcframe"),n===5?1400:1000,n===2?.6:.1);if(!c)return false;var t=zx(c,n===5?0:n);return !!(t&&found(t))});
      p.catch(function(){return false}).then(function(ok){busy=false;if(!ok&&bcStream)bcLoop=setTimeout(loop,det?90:140)})}
    loop()}).catch(function(e){st.textContent=e&&e.name==="NotAllowedError"?"Nem kaptam engedélyt a kamerához. Írd be a vonalkódot kézzel.":"Nem sikerült elindítani a kamerát. Írd be a vonalkódot kézzel."})}
FX.onItemSaved=function(o){if(!lastScan||!lastScan.code)return"";var k=lastScan.code,old;barmap=ld(KX.bar,{});old=barmap[k];
  var d=Math.round((new Date(o.exp)-new Date(today()))/864e5);
  barmap[k]={n:o.n,q:{q:o.q,u:o.u},l:o.loc,d:d>0&&d<3650?d:(old&&old.d)||0,t:((old&&old.t)||0)+1,at:today()};sv(KX.bar,barmap);lastScan=null;
  return !old?"Megjegyeztem a vonalkódot.":(norm(old.n)!==norm(o.n)?"Javítottam a vonalkód nevét.":"")};

/* ================= LEJÁRAT ÉS MENNYISÉG FOTÓRÓL ================= */
var phW=null;
function phWorker(){if(!phW)phW=loadOcr().then(function(){return Tesseract.createWorker("hun",1,{workerPath:absUrl("vendor/ocr/worker.min.js"),corePath:absUrl("vendor/ocr/"),langPath:absUrl("vendor/ocr/"),
  logger:function(m){var b=$("phb");if(b&&m.status==="recognizing text")b.style.width=Math.round(m.progress*100)+"%"}})});return phW}
function phDone(){if(phW){phW.then(function(w){w.terminate()}).catch(function(){});phW=null}}
/* kép előkészítése: kicsinyítés, szürkeárnyalat, kontraszt-nyújtás */
function prepImg(file){return new Promise(function(res,rej){var u=URL.createObjectURL(file),im=new Image();im.onload=function(){var k=Math.min(1,1800/Math.max(im.width,im.height)),w=Math.round(im.width*k),h=Math.round(im.height*k),c=document.createElement("canvas");c.width=w;c.height=h;
  var x=c.getContext("2d");x.drawImage(im,0,0,w,h);URL.revokeObjectURL(u);var d=x.getImageData(0,0,w,h),a=d.data,lo=255,hi=0,i,g;
  for(i=0;i<a.length;i+=4){g=a[i]*.3+a[i+1]*.59+a[i+2]*.11;a[i]=g;if(g<lo)lo=g;if(g>hi)hi=g}var sc=255/Math.max(1,hi-lo);
  for(i=0;i<a.length;i+=4){g=(a[i]-lo)*sc;a[i]=a[i+1]=a[i+2]=g}x.putImageData(d,0,0);res(c)};im.onerror=function(){URL.revokeObjectURL(u);rej(new Error("A kép nem olvasható"))};im.src=u})}
/* OCR előfeldolgozás: szürke, kontraszt, nagyítás, Otsu-küszöb; elmosott változat a pöttyös (tintasugaras) dátumokhoz */
function gray(c){var x=c.getContext("2d"),d=x.getImageData(0,0,c.width,c.height),a=d.data,g=new Uint8ClampedArray(c.width*c.height),lo=255,hi=0;
  for(var i=0,j=0;j<g.length;i+=4,j++){var v=(a[i]*306+a[i+1]*601+a[i+2]*117)>>10;g[j]=v;if(v<lo)lo=v;if(v>hi)hi=v}var sc=255/Math.max(16,hi-lo);for(j=0;j<g.length;j++)g[j]=(g[j]-lo)*sc;return g}
function blur(g,w,h,r){var o=new Uint8ClampedArray(g.length),t=new Float32Array(g.length),x,y,k,s;
  for(y=0;y<h;y++)for(x=0;x<w;x++){s=0;for(k=-r;k<=r;k++)s+=g[y*w+Math.min(w-1,Math.max(0,x+k))];t[y*w+x]=s/(2*r+1)}
  for(y=0;y<h;y++)for(x=0;x<w;x++){s=0;for(k=-r;k<=r;k++)s+=t[Math.min(h-1,Math.max(0,y+k))*w+x];o[y*w+x]=s/(2*r+1)}return o}
function otsu(g){var hs=new Array(256).fill(0),i,n=g.length;for(i=0;i<n;i++)hs[g[i]]++;var sum=0;for(i=0;i<256;i++)sum+=i*hs[i];var sB=0,wB=0,best=0,th=128;
  for(i=0;i<256;i++){wB+=hs[i];if(!wB)continue;var wF=n-wB;if(!wF)break;sB+=i*hs[i];var mB=sB/wB,mF=(sum-sB)/wF,v=wB*wF*(mB-mF)*(mB-mF);if(v>best){best=v;th=i}}return th}
function toCanvas(g,w,h){var c=document.createElement("canvas");c.width=w;c.height=h;var x=c.getContext("2d"),d=x.createImageData(w,h);for(var i=0,j=0;j<g.length;i+=4,j++){d.data[i]=d.data[i+1]=d.data[i+2]=g[j];d.data[i+3]=255}x.putImageData(d,0,0);return c}
/* v1.32: képváltozatok minden helyzetre – fényviszonyok (sötét, csillogó, árnyékos), felületek (fólia, doboz, hajlított, dombornyomott),
   betűtípusok (pöttyös tintasugaras, lézeres, hétszegmenses, vékony, dőlt). NV = változatok száma. */
var NV=10;
function upscale(c){if(c.height>=160&&c.width>=700)return c;var k=Math.min(3,Math.max(700/c.width,160/c.height)),u=document.createElement("canvas");u.width=Math.round(c.width*k);u.height=Math.round(c.height*k);var ux=u.getContext("2d");ux.imageSmoothingQuality="high";ux.drawImage(c,0,0,u.width,u.height);return u}
function bin(g,th){var dark=0;for(var i=0;i<g.length;i++){g[i]=g[i]>th?255:0;if(!g[i])dark++}if(dark>g.length/2)for(i=0;i<g.length;i++)g[i]=255-g[i];return g}
/* helyi (Bradley) küszöb: egyenetlen fény, árnyék, hajlított felület, csillanás ellen */
function bradley(g,w,h,t){var s=Math.max(8,Math.round(Math.min(w,h)/6)),I=new Float64Array((w+1)*(h+1)),x,y,o=new Uint8ClampedArray(g.length),dark=0;
  for(y=0;y<h;y++){var row=0;for(x=0;x<w;x++){row+=g[y*w+x];I[(y+1)*(w+1)+x+1]=I[y*(w+1)+x+1]+row}}
  for(y=0;y<h;y++)for(x=0;x<w;x++){var x1=Math.max(0,x-s),x2=Math.min(w-1,x+s),y1=Math.max(0,y-s),y2=Math.min(h-1,y+s),cnt=(x2-x1+1)*(y2-y1+1),
    sum=I[(y2+1)*(w+1)+x2+1]-I[y1*(w+1)+x2+1]-I[(y2+1)*(w+1)+x1]+I[y1*(w+1)+x1];var v=g[y*w+x]*cnt<sum*(1-(t||0.15))?0:255;o[y*w+x]=v;if(!v)dark++}
  if(dark>g.length/2)for(x=0;x<o.length;x++)o[x]=255-o[x];return o}
/* gamma: sötét képet világosít, túlexponáltat sötétít */
function gammaFix(g){var s=0,i;for(i=0;i<g.length;i+=7)s+=g[i];var m=s/Math.ceil(g.length/7),ga=m<90?0.55:m>175?1.8:1;if(ga===1)return g;var L=new Uint8ClampedArray(256);for(i=0;i<256;i++)L[i]=255*Math.pow(i/255,ga);for(i=0;i<g.length;i++)g[i]=L[g[i]];return g}
/* a legnagyobb kontrasztú színcsatorna (pl. kék tinta piros dobozon, fekete nyomat sárga fólián) */
function bestChan(c){var x=c.getContext("2d"),d=x.getImageData(0,0,c.width,c.height).data,n=c.width*c.height,best=0,bv=-1,k,i;
  for(k=0;k<3;k++){var s=0,s2=0;for(i=k;i<d.length;i+=16){s+=d[i];s2+=d[i]*d[i]}var cnt=Math.ceil(d.length/16),v=s2/cnt-(s/cnt)*(s/cnt);if(v>bv){bv=v;best=k}}
  var g=new Uint8ClampedArray(n),lo=255,hi=0;for(i=0;i<n;i++){g[i]=d[i*4+best];if(g[i]<lo)lo=g[i];if(g[i]>hi)hi=g[i]}var sc=255/Math.max(16,hi-lo);for(i=0;i<n;i++)g[i]=(g[i]-lo)*sc;return g}
/* élesítés (életlen, bemozdult kép) */
function sharpen(g,w,h){var b=blur(g,w,h,1),o=new Uint8ClampedArray(g.length);for(var i=0;i<g.length;i++)o[i]=g[i]+(g[i]-b[i])*1.6;return o}
/* dombornyomott / lézergravírozott, azonos színű felirat: élek kiemelése (Sobel) */
function sobel(g,w,h){var o=new Uint8ClampedArray(g.length).fill(255),x,y;for(y=1;y<h-1;y++)for(x=1;x<w-1;x++){var i=y*w+x,
  gx=-g[i-w-1]-2*g[i-1]-g[i+w-1]+g[i-w+1]+2*g[i+1]+g[i+w+1],gy=-g[i-w-1]-2*g[i-w]-g[i-w+1]+g[i+w-1]+2*g[i+w]+g[i+w+1];o[i]=255-Math.min(255,Math.sqrt(gx*gx+gy*gy)*0.7)}return o}
function dilate(g,w,h,r){var o=new Uint8ClampedArray(g.length).fill(255),x,y,dx,dy;for(y=0;y<h;y++)for(x=0;x<w;x++)if(!g[y*w+x])for(dy=-r;dy<=r;dy++)for(dx=-r;dx<=r;dx++){var yy=y+dy,xx=x+dx;if(yy>=0&&yy<h&&xx>=0&&xx<w&&dx*dx+dy*dy<=r*r)o[yy*w+xx]=0}return o}
function rotC(c,deg){var r=document.createElement("canvas"),s=deg%180!==0;r.width=s?c.height:c.width;r.height=s?c.width:c.height;var x=r.getContext("2d");x.translate(r.width/2,r.height/2);x.rotate(deg*Math.PI/180);x.drawImage(c,-c.width/2,-c.height/2);return r}
/* 0: Otsu  1: elmosás+Otsu (pöttyös)  2: szürke  3: pötty-összekötés  4: helyi küszöb (árnyék, csillanás)  5: legjobb színcsatorna + helyi küszöb
   6: gamma (sötét/túlexponált) + Otsu  7: élesítés + helyi küszöb  8: dombornyomott (élek)  9: hétszegmenses/vékony: helyi küszöb + vastagítás */
function ocrVariant(src,n){var c=upscale(src),w=c.width,h=c.height,g;n=n%NV;
  if(n===5)return toCanvas(bradley(bestChan(c),w,h,0.12),w,h);
  g=gray(c);if(n===2)return toCanvas(g,w,h);
  if(n===4)return toCanvas(bradley(g,w,h,0.15),w,h);
  if(n===6)return toCanvas(bin(gammaFix(g),otsu(g)),w,h);
  if(n===7)return toCanvas(bradley(sharpen(g,w,h),w,h,0.12),w,h);
  if(n===8){var e=sobel(blur(g,w,h,1),w,h);return toCanvas(bin(e,otsu(e)),w,h)}
  if(n===9)return toCanvas(dilate(bradley(g,w,h,0.18),w,h,Math.max(1,Math.round(h/110))),w,h);
  if(n===1)g=blur(g,w,h,Math.max(2,Math.round(h/55)));
  g=bin(g,otsu(g));if(n===3)g=dilate(g,w,h,Math.max(2,Math.round(h/70)));
  return toCanvas(g,w,h)}
/* fényerő a keretben: sötét → vaku, nagyon világos → csillanás */
function lightOf(c){var x=c.getContext("2d"),d=x.getImageData(0,0,c.width,c.height).data,s=0,hi=0,n=0;for(var i=0;i<d.length;i+=64){var v=(d[i]*3+d[i+1]*6+d[i+2])/10;s+=v;if(v>245)hi++;n++}return{m:s/n,glare:hi/n}}
function lightTip(c,torchBtn){var L=lightOf(c);if(L.m<70){if(torchBtn&&!torchBtn.hidden){torchBtn.classList.remove("flash");void torchBtn.offsetWidth;torchBtn.classList.add("flash")}return"Sötét van"+(torchBtn&&!torchBtn.hidden?": kapcsold be a vakut 🔦":": menj világosabb helyre")+"."}
  if(L.glare>0.18)return"Csillog a felület: döntsd meg kicsit a terméket, vagy kapcsold ki a vakut.";return""}

/* OCR-módok: 0 csak számok (6: blokk), 1 csak számok (7: egy sor), 2 betűk is (hónapnevek, kulcsszavak), 3 ritkás szöveg (11: szétszórt felirat) */
var WL={exp:"0123456789./-: ",qty:""};
function ocrSet(w,k,mode){mode=mode||0;var wl=k==="exp"&&mode<2?WL.exp:"",psm=["6","7","6","11"][mode]||"6";return w.setParameters({tessedit_char_whitelist:wl,tessedit_pageseg_mode:psm}).catch(function(){}).then(function(){return w})}
function ocrFix(t){return t.replace(/(\d)[oOQD](?=\d|\b)/g,"$10").replace(/[oOQD](?=\d)/g,"0").replace(/(\d)[lI|!](?=\d)/g,"$11").replace(/[lI|](?=\d{1,3}[.\/-])/g,"1").replace(/(\d)[sS](?=\d)/g,"$15").replace(/(\d)B(?=\d)/g,"$18").replace(/(\d)[zZ](?=\d)/g,"$12").replace(/(\d)G(?=\d)/g,"$16").replace(/(\d)T(?=\d)/g,"$17")}
function pad(n){return(n<10?"0":"")+n}
function okDate(y,m,d){if(m<1||m>12||d<1)return null;var dt=new Date(y,m-1,d);if(dt.getMonth()!==m-1)return null;return y+"-"+pad(m)+"-"+pad(d)}
function lastDay(y,m){return new Date(y,m,0).getDate()}
/* hónapnevek: magyar, angol, német, francia, olasz, spanyol, lengyel (rövid és hosszú alak) */
var MONS=[[1,"januar|january|janvier|gennaio|enero|janv|jan|gen|ene|sty"],[2,"februar|february|fevrier|febbraio|febrero|febr|fevr|feb|fev|lut"],[3,"marcius|march|maerz|marzo|marz|mars|marc|mrz|mar"],
  [4,"aprilis|april|avril|aprile|abril|apr|avr|abr|kwi"],[5,"majus|mayo|maggio|maj|may|mai|mag"],[6,"junius|june|juni|juin|giugno|junio|jun|giu|cze"],[7,"julius|july|juli|juillet|luglio|julio|juil|jul|lug|lip"],
  [8,"augusztus|august|aout|agosto|aug|ago|sie"],[9,"szeptember|september|settembre|septiembre|szept|sept|sep|set|wrz"],[10,"oktober|october|octobre|ottobre|octubre|okt|oct|ott|paz"],
  [11,"november|novembre|noviembre|nov|lis"],[12,"december|dezember|decembre|dicembre|diciembre|dec|dez|dic|gru"]];
var MONX=MONS.map(function(m){return m[1]}).join("|"),MONI={};MONS.forEach(function(m){m[1].split("|").forEach(function(x){MONI[x]=m[0]})});
var ROMX="xii|xi|x|ix|viii|vii|vi|v|iv|iii|ii|i",ROMI={i:1,ii:2,iii:3,iv:4,v:5,vi:6,vii:7,viii:8,ix:9,x:10,xi:11,xii:12};
function low(s){return String(s||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"")}
var KW_GOOD=/(minoseg|megorz|\bmmi\b|fogyaszt|felhasznal|lejar|\blej\b|best|\bbbe?\b|\bexp|use by|\bmhd\b|mindestens|haltbar|verbrauch|\bdlc\b|dluo|consommer|consumarsi|\bscad|consumir|caducidad|spotreb|najlepiej|spozyc|termen|valabil|vervaldatum|houdbaar)/,
    KW_BAD=/(gyart|\bgy\b|\bprod|csomagol|\bpkd|packed|\bmfg|\bmfd|\blot\b|\btetel|toltve|hergestellt|abgefullt|fabric|\bfab\b|vyrob|wyprod|\bl:)/;
FX.parseExpiry=function(text,strict,cands){var raw=text||"",t=ocrFix(raw).replace(/([.\/-]\s?\d)[lI|](?!\w)/g,"$11").replace(/(\d)[,;\\_](?=\d)/g,"$1."),nt=ocrFix(low(raw)).replace(/(\d)[,;\\_](?=\d)/g,"$1."),c=[],m,y0=new Date().getFullYear(),re;
  function yy(y){y=+y;return y<100?2000+y:y}
  function add(s,score){if(!s)return;var dd=Math.round((new Date(s)-new Date(today()))/864e5);if(dd<-60||dd>365*6)return;c.push({d:s,sc:score})}
  function near(i){var w=low(t.slice(Math.max(0,i-45),i)),w2=low(t.slice(Math.max(0,i-16),i));return KW_BAD.test(w2)?-4:KW_GOOD.test(w)?5:KW_BAD.test(w)?-2:0}
  /* számos dátumok: 2027.03.12, 12.03.2027, 12/03/27, 12-03-2027, 12:03:2027 (vegyes elválasztóval is) */
  re=/(20\d{2})\s?[.\/\-:]\s?(\d{1,2})\s?[.\/\-:]\s?(\d{1,2})(?!\d)/g;while(m=re.exec(t))add(okDate(+m[1],+m[2],+m[3]),3+near(m.index));
  re=/(?:^|[^\d])(\d{1,2})\s?([.\/\-:])\s?(\d{1,2})\s?[.\/\-:]\s?(\d{4}|\d{2})(?!\d)/g;while(m=re.exec(t)){var a1=+m[1],a2=+m[3],Y=yy(m[4]),s1=okDate(Y,a2,a1);
    if(s1)add(s1,3+near(m.index)-(m[2]===":"?1:0));else add(okDate(Y,a1,a2),2+near(m.index))}/* amerikai sorrend, ha a nap/hó nem lehet */
  re=/(?:^|[^\d])(\d{1,2}) (\d{1,2}) (20\d{2}|\d{2})(?![\d.])/g;while(m=re.exec(t))add(okDate(yy(m[3]),+m[2],+m[1]),1+near(m.index));
  /* hónapnévvel: 12 MAR 2027, 12MAR27, 2027. márc. 12., MAR 12, 2027, márc. 2027 */
  re=new RegExp("(?:^|[^a-z\\d])(\\d{1,2})\\.?\\s?[\\-\\/ ]?\\s?("+MONX+")[a-z]*\\.?\\s?[\\-\\/ ,.]?\\s?(\\d{4}|\\d{2})(?!\\d)","g");while(m=re.exec(nt))add(okDate(yy(m[3]),MONI[m[2]],+m[1]),4+near(m.index));
  re=new RegExp("(20\\d{2})\\.?\\s?[\\-\\/ ]?\\s?("+MONX+")[a-z]*\\.?\\s?[\\-\\/ ]?\\s?(\\d{1,2})(?!\\d)","g");while(m=re.exec(nt))add(okDate(+m[1],MONI[m[2]],+m[3]),4+near(m.index));
  re=new RegExp("(?:^|[^a-z])("+MONX+")[a-z]*\\.?\\s?(\\d{1,2})(?:st|nd|rd|th)?,?\\s(20\\d{2})(?!\\d)","g");while(m=re.exec(nt))add(okDate(+m[3],MONI[m[1]],+m[2]),4+near(m.index));
  re=new RegExp("(?:^|[^a-z\\d])("+MONX+")[a-z]*\\.?\\s?[\\-\\/ ]?\\s?(20\\d{2}|\\d{2})(?![\\d.])","g");while(m=re.exec(nt)){var Ym=yy(m[2]),Mm=MONI[m[1]];add(okDate(Ym,Mm,lastDay(Ym,Mm)),2+near(m.index))}
  re=new RegExp("(?:^|[^a-z])("+MONX+")[a-z]*\\.?\\s?(\\d{1,2})\\.?(?![\\d])","g");while(m=re.exec(nt)){var sm=okDate(y0,MONI[m[1]],+m[2]);if(sm&&sm<today())sm=okDate(y0+1,MONI[m[1]],+m[2]);add(sm,1+near(m.index))}
  /* római számos hónap: 12.III.2027, 2027.III.12. */
  re=new RegExp("(?:^|[^a-z\\d])(\\d{1,2})\\s?[.\\-\\/ ]\\s?("+ROMX+")\\s?[.\\-\\/ ]\\s?(\\d{4}|\\d{2})(?!\\d)","g");while(m=re.exec(nt))add(okDate(yy(m[3]),ROMI[m[2]],+m[1]),4+near(m.index));
  re=new RegExp("(20\\d{2})\\s?[.\\-\\/ ]\\s?("+ROMX+")\\s?[.\\-\\/ ]\\s?(\\d{1,2})(?!\\d)","g");while(m=re.exec(nt))add(okDate(+m[1],ROMI[m[2]],+m[3]),4+near(m.index));
  /* hónap + év: 03/2027, 2027/03, 03/27 */
  re=/(?:^|[^\d.])(\d{1,2})\s?[.\/-]\s?(20\d{2})(?!\d)/g;while(m=re.exec(t)){var y=+m[2],mo=+m[1];add(okDate(y,mo,mo>=1&&mo<=12?lastDay(y,mo):0),2+near(m.index))}
  re=/(20\d{2})\s?[.\/-]\s?(\d{1,2})(?![\d]|\s?[.\/\-:]\s?\d)/g;while(m=re.exec(t)){var y3=+m[1],mo3=+m[2];add(okDate(y3,mo3,mo3>=1&&mo3<=12?lastDay(y3,mo3):0),2+near(m.index))}
  re=/(?:^|[^\d.])(\d{1,2})\s?[.\/-]\s?(\d{2})(?![\d.\/])/g;while(m=re.exec(t)){var mo2=+m[1],y2=2000+ +m[2];if(+m[2]>12&&mo2>=1&&mo2<=12)add(okDate(y2,mo2,lastDay(y2,mo2)),2+near(m.index))}
  /* elválasztó nélkül: 12032027, 20270312, 120327 (NNHHÉÉ), 270312 (ÉÉHHNN) – csak kulcsszó mellett erős */
  re=/(?:^|[^\d])(\d{8}|\d{6})(?!\d)/g;while(m=re.exec(t)){var z=m[1],nr=near(m.index);
    if(z.length===8){if(/^20/.test(z))add(okDate(+z.slice(0,4),+z.slice(4,6),+z.slice(6)),nr);else add(okDate(+z.slice(4),+z.slice(2,4),+z.slice(0,2)),nr)}
    else{add(okDate(2000+ +z.slice(4),+z.slice(2,4),+z.slice(0,2)),nr+0.3);add(okDate(2000+ +z.slice(0,2),+z.slice(2,4),+z.slice(4)),nr)}}
  /* nap.hó. év nélkül */
  re=/(\d{1,2})\s?[.\/]\s?(\d{1,2})\.?(?![\d.\/])/g;while(m=re.exec(t)){var s=okDate(y0,+m[2],+m[1]);if(s&&s<today())s=okDate(y0+1,+m[2],+m[1]);add(s,1+near(m.index))}
  /* betűközös, ritkás számok (1 2 . 0 3 . 2 0 2 7): összevont változat is, kicsit kisebb súllyal */
  var sq=raw.replace(/(^|\s)[lI|](?=[ \t]*[\d.])/g,"$11").replace(/([\d.\/-])[ \t]+(?=[\d.\/-])/g,"$1").replace(/([.\/-])\1+/g,"$1");if(sq!==raw)FX.parseExpiry(sq,0,1).forEach(function(x){x.sc-=0.5;c.push(x)});
  if(cands)return c;
  if(strict)c=c.filter(function(x){return x.sc>=2});if(!c.length)return null;c.sort(function(a,b){return b.sc-a.sc||(a.d<b.d?1:-1)});return c[0].d};
FX.parseQtyText=function(text){var t=ocrFix(text||"").replace(/℮/g," e ").replace(/ℓ/g,"l").replace(/(\d)\s?k[q9](?![a-z])/gi,"$1 kg").replace(/(\d)\s?(?:rnl|m1|mI)\b/gi,"$1 ml").replace(/(\d)\s?cI\b/g,"$1 cl")
    .replace(/(\d)\s?(?:gramm|gram|gr)\b\.?/gi,"$1 g").replace(/(\d)\s?(?:kilogramm|kilogram)\b/gi,"$1 kg").replace(/(\d)\s?(?:liter|litre|ltr|lit)\b\.?/gi,"$1 l").replace(/(\d)\s?(?:pcs|pc|stk|st\.|stuck|darabos|db-os|szelet)\b/gi,"$1 db")
    .replace(/(\d)\s[9q](?![\d\w])/g,"$1 g").replace(/(\d)\s?[I|](?![\w])/g,"$1 l"),c=[],m;
  /* gyűjtőcsomag: 4 x 125 g, 6×1,5 l */
  var re2=/(\d{1,2})\s?[x×*]\s?(\d+(?:[.,]\d+)?)\s?(kg|dkg|g|l|ml|dl|cl)\b/gi;while(m=re2.exec(t)){var n=+m[1],q0=parseFloat(m[2].replace(",",".")),u0=m[3].toLowerCase();if(n>1&&n<=48&&q0>0){if(u0==="dkg"){q0*=10;u0="g"}if(u0==="cl"){q0*=10;u0="ml"}c.push({q:Math.round(n*q0*1000)/1000,u:u0,sc:3})}}
  var re=/(\d+(?:[.,]\d+)?)\s?(kg|dkg|g|l|ml|dl|cl|db|darab)\b(\s?e\b)?/gi;
  while(m=re.exec(t)){var q=parseFloat(m[1].replace(",",".")),u=m[2].toLowerCase();if(u==="darab")u="db";if(!(q>0)||q>50000)continue;
    if(u==="cl"){q=q*10;u="ml"}if(u==="dkg"){q=q*10;u="g"}var sc=0,w=low(t.slice(Math.max(0,m.index-30),m.index)),after=low(t.slice(m.index+m[0].length,m.index+m[0].length+6));
    if(/[x×*]\s?$/.test(t.slice(Math.max(0,m.index-3),m.index)))sc-=3;
    if(m[3])sc+=4;if(/(netto|\bnet\b|net wt|toltot|tomeg|mennyiseg|urtartalom|inhalt|poids|peso|contenuto|zawartosc|obsah|tartalom)/.test(w))sc+=5;if(q===100&&(u==="g"||u==="ml"))sc-=4;if(/^\s?-?ban|^\s?\/|^\s?-?ra|^\s?-?bol/.test(after))sc-=4;if(/^(\d+)\s?(g|ml)/.test(m[0])&&q<5)sc-=2;c.push({q:q,u:u,sc:sc})}
  if(!c.length){/* gyakori OCR-hiba: a "g" betűt 9-esnek olvassa, szóköz nélkül (750g → 7509) */m=/(?:^|[^\d.,])(\d{2,4})9(?![\d.,])/.exec(t);if(m&&+m[1]>=10)return{q:+m[1],u:"g"};return null}
  c.sort(function(a,b){return b.sc-a.sc||b.q-a.q});return{q:c[0].q,u:c[0].u}};
var PH={exp:{t:"Lejárati dátum",ask:"Fotózd le a lejárati dátumot (minőségét megőrzi / fogyasztható). Közelről, élesen, jó fényben.",fail:"Nem találtam dátumot a képen."},
        qty:{t:"Mennyiség",ask:"Fotózd le a csomagoláson a mennyiséget (pl. 500 g, 1 l, 10 db).",fail:"Nem találtam mennyiséget a képen."}};
var phQ=[],phManual=[],phQty=null,phExp=null;
function photoFlow(qty,eh){phQ=["exp","qty"];phManual=[];phQty=qty;phExp=eh||null;phNext()}
function photoOne(k){phQ=[k];phManual=[];phQty=null;phExp=null;phNext()}
function phNext(){var k=phQ.shift();if(!k){phEnd();return}phAsk(k,"",k==="qty"?phQty:null)}
function phEnd(){phCamStop();var d=$("ph");d.onclose=null;if(d.open)d.close();phDone();
  var f=phManual[0];if(f){var el=$(f==="exp"?"fe":"fq");el.classList.remove("flash");void el.offsetWidth;el.classList.add("flash");el.focus();toast(f==="exp"?"Írd be a lejáratot kézzel.":"Írd be a mennyiséget kézzel.")}}
function phAsk(k,msg,qty){var P=PH[k],skip="";
  if(k==="exp"&&phExp)skip='<button type="button" class="btn" data-ph="keep">Jó így: '+esc(phExp.replace(/-/g,". ")+".")+"</button>";
  if(k==="qty"&&qty&&qty.q)skip='<button type="button" class="btn" data-ph="keep">Jó így: '+esc(nfq(qty.q)+" "+qty.u)+"</button>";
  $("pht").textContent=P.t;var d=dlg("ph",(msg?'<div class="warnbox">'+msg+"</div>":"")+'<div class="q">'+P.ask+'</div><div class="btns"><button type="button" class="btn g" data-ph="live">🎥 Élő olvasás</button><button type="button" class="btn" data-ph="shot">📷 Fotó</button>'+skip+'<button type="button" class="btn p" data-ph="man">Nem látszik, kézzel írom be</button></div>');
  d.onclose=function(){phQ=[];phDone()};d.querySelector(".dbody").onclick=function(e){var b=e.target.closest("[data-ph]");if(!b)return;var a=b.dataset.ph;
    if(a==="live"){phLive(k,qty);return}
    if(a==="shot"){var inp=$("phfile");inp.value="";inp.onchange=function(){var f=this.files[0];if(f)phRead(k,f,qty)};inp.click();phWorker()}
    else if(a==="keep")phNext();else{phManual.push(k);phNext()}}}
/* élő olvasás: a keretbe tartott szöveget folyamatosan olvassa, több képváltozattal; kétszer ugyanaz = elfogadja */
var phCam=null;function phCamStop(){if(phCam){try{phCam.st.getTracks().forEach(function(t){t.stop()})}catch(e){}phCam=null}}
function phLive(k,qty){var P=PH[k],seen={},n=0,busy=false,alive=true,T=null,cand=null;
  var d=dlg("ph",'<div class="q small">'+(k==="exp"?"Tartsd a lejárati dátumot a sárga keretbe. Magától olvasom.":"Tartsd a mennyiséget (pl. 500 g) a sárga keretbe. Magától olvasom.")+'</div>'+
    '<div class="camw"><video id="phv" playsinline muted></video><div class="camf txt" id="phframe"></div><div class="camb"><button type="button" class="btn sm" id="phtorch" hidden aria-pressed="false">🔦 Vaku</button><button type="button" class="btn sm" id="phzoom" hidden>🔍 1×</button></div></div>'+
    '<div class="q small" id="phst">Indítom a kamerát és a szövegfelismerőt...</div><div id="phc"></div>'+
    '<div class="btns"><button type="button" class="btn" data-ph="shot">📷 Inkább fotó</button><button type="button" class="btn p" data-ph="man">Kézzel írom be</button></div>');
  function stop(){alive=false;clearTimeout(T);phCamStop()}
  function accept(val){stop();if(k==="exp"){$("fe").value=val;phOk("Lejárat: "+val.replace(/-/g,". ")+".")}else{$("fq").value=val.q;$("fu").value=val.u;qtySync();phOk("Mennyiség: "+nfq(val.q)+" "+val.u)}}
  function show(val){cand=val;var t=k==="exp"?val.replace(/-/g,". ")+".":nfq(val.q)+" "+val.u;$("phc").innerHTML='<div class="phcand">Ezt látom: <b>'+esc(t)+'</b></div><div class="btns"><button type="button" class="btn g" data-ph="ok">✓ Ez az</button></div>'}
  var oc=d.onclose;d.onclose=function(){stop();if(oc)oc()};
  d.querySelector(".dbody").onclick=function(e){var b=e.target.closest("[data-ph]");if(!b)return;var a=b.dataset.ph;
    if(a==="ok"&&cand){accept(cand);return}stop();if(a==="shot"){var inp=$("phfile");inp.value="";inp.onchange=function(){var f=this.files[0];if(f)phRead(k,f,qty);else phAsk(k,"",qty)};inp.click()}else if(a==="man"){phManual.push(k);phNext()}};
  if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){$("phst").textContent="Ez a böngésző nem fér hozzá a kamerához. Használd a Fotó gombot.";return}
  Promise.all([camStart($("phv")),phWorker().then(function(w){return ocrSet(w,k)})]).then(function(r){if(!alive){r[0].st.getTracks().forEach(function(t){t.stop()});return}phCam=r[0];var w=r[1],v=$("phv");camTools(phCam,$("phtorch"),$("phzoom"));
    $("phst").textContent="Keresem a "+(k==="exp"?"dátumot":"mennyiséget")+"... Tartsd stabilan, közelről.";
    function loop(){if(!alive)return;if(busy||v.readyState<2){T=setTimeout(loop,200);return}var c=grab(v,$("phframe"),1600,.07);if(!c){T=setTimeout(loop,200);return}busy=true;
      var fi=n++,mode=k==="exp"?fi%4:(fi%3===2?3:2);if(fi%8===0){var lt=lightTip(c,$("phtorch"));if(lt)$("phst").textContent=lt}
      ocrSet(w,k,mode).then(function(){return w.recognize(ocrVariant(c,fi%NV))}).then(function(o){busy=false;if(!alive)return;var t=o.data.text,val=k==="exp"?FX.parseExpiry(t,1):FX.parseQtyText(t);
        if(val){var key=JSON.stringify(val);seen[key]=(seen[key]||0)+1;if(seen[key]>=3){accept(val);return}show(val)}
        if(n===14)$("phst").textContent="Nehezen megy. Próbáld közelebbről, egyenesen, jobb fényben"+($("phtorch").hidden?"":" vagy vakuval")+".";
        T=setTimeout(loop,150)}).catch(function(){busy=false;T=setTimeout(loop,400)})}
    loop()}).catch(function(e){$("phst").textContent=e&&e.name==="NotAllowedError"?"Nem kaptam engedélyt a kamerához. Használd a Fotó gombot, vagy írd be kézzel.":"Nem sikerült elindítani. Használd a Fotó gombot, vagy írd be kézzel."})}
function nfq(q){return String(Math.round(q*100)/100).replace(".",",")}
/* fotóból: képváltozatok × olvasási módok, majd elforgatva (függőleges, fejjel lefelé felirat) */
var PHPLAN=[[0,2],[4,2],[2,2],[5,2],[1,0],[6,2],[7,2],[3,0],[9,0],[8,2],[4,0],[0,3],[4,3]],PHROT=[[90,4],[270,4],[180,4],[90,0],[270,0]],VNAME=["alap","pöttyös","szürke","pötty-összekötés","árnyék/csillanás","színcsatorna","sötét/világos","élesítés","dombornyomás","vékony betű"];
FX.ocrRead=function(src,k,w,prog){var steps=PHPLAN.map(function(p){return[0,p[0],p[1]]}).concat(PHROT.map(function(p){return[p[0],p[1],2]})),i=0,all="";
  function next(){if(i>=steps.length)return Promise.resolve({ok:null,text:all});var s=steps[i++],img=s[0]?rotC(src,s[0]):src;if(prog)prog(i,steps.length,VNAME[s[1]]+(s[0]?" · "+s[0]+"°":""));
    return ocrSet(w,k,s[2]).then(function(){return w.recognize(ocrVariant(img,s[1]))}).then(function(o){var tx=o.data.text;all+="\n"+tx;
      if(k==="exp"){/* teljes dátumnál (nap is) azonnal kész; csak hónap/év esetén tovább próbál, a legjobbat megjegyzi */var cs=FX.parseExpiry(tx,0,1).sort(function(a,b){return b.sc-a.sc});if(cs[0]&&cs[0].sc>=2.5)return{ok:FX.parseExpiry(tx),text:tx,step:i};if(cs[0]&&cs[0].sc>=2&&(!part||cs[0].sc>part.sc))part={d:cs[0].d,sc:cs[0].sc,step:i}}
      else{var ok=FX.parseQtyText(tx);if(ok)return{ok:ok,text:tx,step:i}}return next()})}
  var part=null;return next().then(function(r){if(!r.ok){if(part){r.ok=part.d;r.step=part.step}else r.ok=k==="exp"?FX.parseExpiry(r.text,1):FX.parseQtyText(r.text)}return r})};
function phRead(k,file,qty){dlg("ph",'<div class="q">Olvasom a képet... <span id="phs" class="q small"></span></div><div class="bar"><b id="phb" style="width:0%"></b></div><div class="q small" style="margin-top:8px">Több képváltozattal próbálom (fény, felület, betűtípus). Első alkalommal pár másodperc, amíg a szövegfelismerő betölt.</div>');
  Promise.all([prepImg(file),phWorker()]).then(function(r){return FX.ocrRead(r[0],k,r[1],function(i,n,nm){var e=$("phs");if(e)e.textContent=i+"/"+n+" · "+nm})}).then(function(res){
    if(k==="exp"){var e=res.ok;if(!e)return phAsk(k,P_fail(k),qty);$("fe").value=e;phOk("Lejárat: "+e.replace(/-/g,". ")+".")}
    else{var q=res.ok;if(!q)return phAsk(k,P_fail(k),qty);$("fq").value=q.q;$("fu").value=q.u;qtySync();phOk("Mennyiség: "+nfq(q.q)+" "+q.u)}
  }).catch(function(e){phAsk(k,"Nem sikerült beolvasni: "+esc(e.message||e),qty)})}
function P_fail(k){return PH[k].fail+" Próbáld újra közelebbről, vagy írd be kézzel."}
function phOk(txt){scanBeep();dlg("ph",'<div class="phok">✓ '+esc(txt)+'</div><div class="q small">Beírtam. Mentés előtt még átírhatod.</div>');var d=$("ph");setTimeout(function(){if(d.open)phNext()},1100)}

/* ================= MENNYISÉG-CSÚSZKA (rezgéssel) ================= */
var QR={g:[10,2000],dkg:[1,200],kg:[.1,10],ml:[50,3000],dl:[.5,30],l:[.1,10],db:[1,30]},qLast=null,qBuzz=0;
function qtyRange(){var r=QR[$("fu").value]||[1,30],v=parseFloat($("fq").value)||0,mx=r[1];while(v>mx)mx*=2;var sl=$("fqs");sl.min=r[0];sl.max=mx;sl.step=r[0];return r}
function qtyLbl(){var sl=$("fqs");$("fqv").textContent=(parseFloat($("fq").value)||0).toLocaleString("hu-HU")+" "+$("fu").value;sl.setAttribute("aria-valuetext",$("fqv").textContent)}
function qtySync(){var sl=$("fqs");if(!sl)return;qtyRange();var v=parseFloat($("fq").value);sl.value=isNaN(v)?sl.min:v;qLast=+sl.value;qtyLbl()}
FX.qtySync=qtySync;
function qtyInit(){var sl=$("fqs");if(!sl)return;
  sl.addEventListener("input",function(){var r=qtyRange(),st=r[0],v=Math.round(+sl.value/st)*st;v=Math.round(v*100)/100;$("fq").value=v;qtyLbl();
    if(qLast!==null&&v!==qLast){var now=Date.now(),big=Math.round(v/st)%10===0;if(big||now-qBuzz>35){qBuzz=now;try{navigator.vibrate&&navigator.vibrate(big?25:8)}catch(e){}}}qLast=v});
  $("fq").addEventListener("input",qtySync);$("fu").addEventListener("change",qtySync);qtySync()}

/* ================= BLOKK OLVASÁSA ================= */
var ocrLoaded=null;function loadOcr(){if(window.Tesseract)return Promise.resolve();if(ocrLoaded)return ocrLoaded;
  ocrLoaded=new Promise(function(res,rej){var s=document.createElement("script");s.src="vendor/ocr/tesseract.min.js";s.onload=res;s.onerror=function(){rej(new Error("OCR betöltése sikertelen"))};document.head.appendChild(s)});return ocrLoaded}
function absUrl(p){return new URL(p,location.href).href}
FX.ocrText=function(img,prog,psm){return loadOcr().then(function(){return Tesseract.createWorker("hun",1,{workerPath:absUrl("vendor/ocr/worker.min.js"),corePath:absUrl("vendor/ocr/"),langPath:absUrl("vendor/ocr/"),
    logger:function(m){if(prog&&m.status==="recognizing text")prog(Math.round(m.progress*100))}})}).then(function(w){var pre=psm?w.setParameters({tessedit_pageseg_mode:psm,preserve_interword_spaces:"1"}).catch(function(){}):Promise.resolve();
    return pre.then(function(){return w.recognize(img)}).then(function(r){w.terminate();return r.data.text},function(e){w.terminate();throw e})})};
function num(s){return parseFloat(String(s).replace(/\s/g,"").replace(",","."))}
/* v1.30: tételes blokkolvasás – magyar bolti rövidítések, súly- és darabsorok (0,512 kg x 1 990 Ft/kg, 2 x 399),
   kedvezménysorok, ÁFA-kódok; minden tételhez automatikusan hely (hűtő / fagyasztó / spájz) és lejárat.
   A javításokat megjegyzi (nyers blokksor → termék), így legközelebb magától felismeri. */
var RCMAP="kajax.rcmap";
var RCABBR=[[/\bteliszalami|\bteli ?szal/,"Téliszalámi"],[/\bcsirkemell|cs\.? ?mell|\bcsmell/,"Csirkemell"],[/\bcsirkecomb|cs\.? ?comb|\bcscomb/,"Csirkecomb"],[/\bcsirkeszarny|cs\.? ?szarny/,"Csirkeszárny"],
  [/\bdaralt (sertes|hus)|\bdar\.? ?(sert|hus)/,"Darált sertéshús"],[/\bsertes ?karaj|\bkaraj/,"Sertéskaraj"],[/\btarja/,"Sertéstarja"],[/\bpulykamell|pulyka ?mell/,"Pulykamell"],
  [/\bparizsi|\bpariz/,"Párizsi"],[/\bvirsli|\bvirs\b|frankfurti/,"Virsli"],[/\bkolbasz|\bkolb\b/,"Füstölt kolbász"],[/\bszalonna/,"Szalonna"],[/\bbacon/,"Bacon"],[/\bsonka|\bsonk\b/,"Sonka"],[/\bszalami|\bszal\b/,"Szalámi"],
  [/\btejfol|\btejf\b/,"Tejföl"],[/\bhabtejszin|\bhabtejsz/,"Habtejszín"],[/\btejszin|\btejsz\b/,"Tejszín"],[/\bkakaos tej/,"Kakaós tej"],[/\blaktozmentes tej|\blm tej/,"Laktózmentes tej"],[/\buht tej|\btartos tej/,"Tartós tej"],[/\bkefir/,"Kefir"],
  [/\bgorog joghurt|\bgorog jog/,"Görög joghurt"],[/\bgyum\.? ?joghurt|joghurt (eper|meggy|barack|erdei|vanilia)/,"Gyümölcsjoghurt"],[/\bjoghurt|\bjogh\b/,"Joghurt"],[/\bkremturo/,"Krémtúró"],[/\bturo\b|\bturo /,"Túró"],
  [/\bvaj\b/,"Vaj"],[/\bmargarin|\brama\b|\bdelma\b|\bfloriol/,"Margarin"],[/\btrappista|\btrapp\b/,"Trappista"],[/\bgouda/,"Gouda"],[/\bedami|\bsajt\b/,"Sajt"],[/\bmozzarella|\bmozz\b/,"Mozzarella"],[/\bpanni\b|omlesztett|\bmackosajt/,"Ömlesztett sajt"],
  [/\btojas|\btoj\.? ?(l|m|s)\b|\btoj\b/,"Tojás"],[/(^|\s)tej\b|\btej \d|\bteljes tej|\bfriss tej|\bfeltoz/,"Tej"],
  [/\bkenyer|\bkeny\b|\bcipo\b|\bveka\b/,"Kenyér"],[/\bzsemle|\bzsemlye/,"Zsemle"],[/\bkifli/,"Kifli"],[/\bkalacs/,"Kalács"],[/\bbagett|\bbaguette/,"Bagett"],[/\btoast/,"Toast kenyér"],[/\bcroissant/,"Croissant"],[/\btortilla(?! chips)/,"Tortilla"],
  [/\bburgonya|\bkrumpli|\bburg\b/,"Burgonya"],[/\blila ?hagyma/,"Lilahagyma"],[/\bfokhagyma|\bfokh\b/,"Fokhagyma"],[/\bujhagyma/,"Újhagyma"],[/\bvoroshagyma|\bv\.? ?hagyma|\bhagyma/,"Vöröshagyma"],
  [/\bsargarepa|\brepa\b|\bs\.? ?repa/,"Sárgarépa"],[/\bkoktelparadicsom|\bkoktel ?par|\bcherry/,"Koktélparadicsom"],[/\bparadicsom ?pure|\bsuritett paradicsom/,"Paradicsompüré"],[/\bpassata/,"Passata"],[/\bparadicsom|\bparad\b/,"Paradicsom"],
  [/\bkaliforniai|\bkali\.? ?pap/,"Kaliforniai paprika"],[/\bpirospaprika|\bfuszerpaprika|\bpaprika ?orl/,"Pirospaprika"],[/\bpaprika/,"Paprika"],[/\buborka|\bubork/,"Uborka"],[/\bcsemegeuborka|\bcsem\.? ?ub/,"Csemegeuborka"],
  [/\bbanan/,"Banán"],[/\balma\b|\balma /,"Alma"],[/\bkorte/,"Körte"],[/\bnarancs ?le|narancsle/,"Narancslé"],[/\balmale/,"Almalé"],[/\bnarancs/,"Narancs"],[/\bmandarin/,"Mandarin"],[/\bcitrom/,"Citrom"],[/\bszolo/,"Szőlő"],[/\bkivi/,"Kivi"],[/\beper/,"Eper"],
  [/\bgomba|\bcsiperke/,"Gomba"],[/\bbrokkoli/,"Brokkoli"],[/\bkarfiol/,"Karfiol"],[/\bcukkini/,"Cukkini"],[/\bsaláta|\bsalata|\bjegsalata/,"Saláta"],[/\bkaposzta/,"Káposzta"],[/\bsavanyu ?kap/,"Savanyú káposzta"],
  [/\bfinomliszt|\bliszt/,"Liszt"],[/\bporcukor/,"Porcukor"],[/\bkristalycukor|\bcukor\b/,"Cukor"],[/\brizs/,"Rizs"],[/\bspagetti/,"Spagetti"],[/\bteszta|\bpenne\b|\bfusilli|\bmakaroni|\borsoteszta|\bszarvacska|\bcsiga ?teszta/,"Tészta"],[/\bcernametelt/,"Cérnametélt"],
  [/\bzabpehely|\bzabp/,"Zabpehely"],[/\bmuzli/,"Müzli"],[/\bkukoricapehely|\bcorn ?flakes/,"Kukoricapehely"],[/\bzsemlemorzsa|\bmorzsa/,"Zsemlemorzsa"],
  [/\bnapraforgo|\betolaj|\bolaj\b/,"Étolaj"],[/\boliva/,"Olívaolaj"],[/\becet/,"Ecet"],[/\bso\b|\bsó\b|\basztali so/,"Só"],[/\bketchup/,"Ketchup"],[/\bmustar/,"Mustár"],[/\bmajonez|\bmajo\b/,"Majonéz"],
  [/\basvanyviz|\basv\.? ?viz|\bszensavas|\bszensavmentes|\bmentes viz/,"Ásványvíz"],[/\bcola\b|\bkola\b|\bfanta|\bsprite|\btonic|\bice ?tea|\budito|\bpepsi|\bsch?weppes/,"Üdítő"],[/\bszorp/,"Szörp"],
  [/\bsor\b|\bdreher|\bborsodi|\bsoproni|\bheineken|\bkobanyai|\bpilsner|\barany aszok/,"Sör"],[/\bvoros ?bor|\bcabernet|\bmerlot|\bkekfrankos|\bvorosbor/,"Vörösbor"],[/\bpezsgo|\btorley|\bhungaria/,"Pezsgő"],
  [/\bjegkrem|\bjegkr\b|\bmagnum|\bcornetto/,"Jégkrém"],[/\bfagy\.? ?pizza|\bpizza/,"Fagyasztott pizza"],[/\bhasabburgonya|\bfagy\.? ?hasab/,"Fagyasztott hasábburgonya"],[/\bhalrudacska|\bhalrud/,"Halrudacska"],
  [/\bfagy\.? ?(zoldseg|zoldsegkev)|\bmirelit ?zold/,"Fagyasztott zöldségkeverék"],[/\bfagy\.? ?borso|\bmirelit ?borso/,"Fagyasztott zöldborsó"],[/\bfagy\.? ?spenot|\bspenot/,"Fagyasztott spenót"],
  [/\bchips|\blays|\bpringles|\bchio\b/,"Chips"],[/\bperec/,"Sós perec"],[/\bstangli|\bropi/,"Sósstangli"],[/\bmogyoro/,"Földimogyoró"],[/\bgumicukor|\bharibo/,"Gumicukor"],[/\bszaloncukor/,"Szaloncukor"],
  [/\bcsoki|\bcsokolade|\bmilka|\btibi\b|\bboci\b/,"Csokoládé"],[/\bkeksz|\bhazt\.? ?keksz|\bgyermelyi/,"Keksz"],[/\bpiskota/,"Babapiskóta"],[/\bkave|\bcoffee|\bnescafe|\bjacobs/,"Kávé"],[/\btea\b|\bfiltertea/,"Tea"],[/\bkakaopor|\bkakao\b/,"Kakaópor"],
  [/\bmez\b|\bakacmez|\bvirágmez|\bviragmez/,"Méz"],[/\blekvar|\bdzsem/,"Lekvár"],[/\btonhal/,"Tonhalkonzerv"],[/\bkukorica ?konz|\bcsemegekukorica/,"Kukorica konzerv"],[/\bbab ?konz|\bvorosbab|\bfeherbab/,"Bab konzerv"],
  [/\bhalfile|\bhekk|\btilapia|\bpangasius|\bhal ?file/,"Halfilé"],[/\blazac/,"Lazac"],[/\bponty/,"Ponty"],[/\bpudingpor|\bpuding ?por/,"Pudingpor"],[/\beleszto/,"Élesztő"],[/\bsutopor/,"Sütőpor"],[/\bvanili.? ?cukor|\bvan\.? ?cukor/,"Vaníliás cukor"],
  [/\bleveles ?teszta/,"Leveles tészta"],[/\breteslap|\bretesteszta/,"Rétestészta"],[/\bmak\b|\bdaralt mak/,"Mák"],[/\bdio\b|\bdiobel|\bdaralt dio/,"Dió"],[/\bmazsola/,"Mazsola"],[/\bkokusz/,"Kókuszreszelék"],[/\btepertő|\btepertö|\bteperto/,"Tepertő"],[/\bhurka/,"Hurka"]];
var RCSKIP=/(osszesen|fizetendo|vegosszeg|\btotal\b|afa|afatartalom|kartya|keszpenz|visszajaro|adoszam|nyugta|penztar|bankkartya|egyenleg|\bap\b|\bnav\b|nyugtaszam|blokkszam|datum|idopont|koszonjuk|viszontlatasra|cim:|tel\.|www\.|kerekites|szja|mastercard|visa|terminal|engedely|hitel|tranzakcio|osszeg:|reszosszeg|darabszam|pont ?egyenleg|clubcard|lidl plus|kupon|bontott)/;
function rcClean(l){return l.replace(/[|_~`'"]+/g," ").replace(/\s{2,}/g," ").trim()}
function rcLookup(raw){var n=norm(raw).replace(/[^a-z0-9.% ]/g," ").replace(/\s+/g," ").trim(),mp=ld(RCMAP,{}),k=n.replace(/[\d.,%]+/g,"").replace(/\s+/g," ").trim();
  if(k&&mp[k]){var cm=find(mp[k]);if(cm)return cm}
  for(var i=0;i<RCABBR.length;i++)if(RCABBR[i][0].test(n)){var c=find(RCABBR[i][1]);if(c)return c}
  return matchCat(raw)}
function rcKey(raw){return norm(raw).replace(/[^a-z0-9.% ]/g," ").replace(/[\d.,%]+/g,"").replace(/\s+/g," ").trim()}
function locOf(name,c){if(c&&c.l)return c.l;return window.UNNEP&&UNNEP.guessLoc?UNNEP.guessLoc(name):"pantry"}
function daysOf(loc,c){if(c)return c.d;return window.UNNEP&&UNNEP.guessDays?UNNEP.guessDays(loc):7}
/* blokksor: név ... [ÁFA-kód] ár [ÁFA-kód] */
var RC_PRICE=/(-?\d{1,3}(?:[ .]\d{3})*(?:[.,]\d{1,2})?|-?\d+(?:[.,]\d{1,2})?)\s*(?:ft|huf)?\s*(?:[a-e]\d{0,2}|\d{1,2}%|\*)?\s*$/i;
var RC_QTY=/(\d+(?:[.,]\d+)?)\s*(kg|db|l|g|x)?\s*[x×*]\s*(\d+(?:[ .]\d{3})?(?:[.,]\d+)?)\s*(?:ft)?\s*(?:\/\s*(kg|db|l))?/i;
FX.parseReceipt=function(text){var lines=text.split(/\n/).map(rcClean).filter(Boolean),out=[],total=0,shopI=-1,up=norm(text),pend=null,last=null;
  if(/penny/.test(up))shopI=0;else if(/tesco/.test(up))shopI=1;else if(/lidl/.test(up))shopI=2;
  function mk(name,price){var c=rcLookup(name),q=parseQty(name),it={raw:name,n:c?c.n:name.replace(/\s+\d.*$/,"").replace(/\s+[a-z]$/i,"").slice(0,40),c:c,price:price,cnt:1,
      q:q?q.q:(c?defQ(c.u,c.n):1),u:q&&BASE[q.u]?q.u:(c?c.u:"db"),unit:null,ok:!!c};
    if(c&&c.u==="db"&&q){if(q.u==="db")it.q=q.q;else it.q=1;it.u="db"}
    if(c&&c.n==="Tojás"){var e=/(\d+)\s*(db|-?s)\b/.exec(norm(name));it.q=e?+e[1]:10;it.u="db"}
    it.loc=locOf(it.n,c);it.d=daysOf(it.loc,c);return it}
  lines.forEach(function(l){var n=norm(l);
    var tm=/(osszesen|fizetendo|vegosszeg|\btotal\b)[^0-9]*([\d\s]+[.,]?\d*)/.exec(n);if(tm){var v=num(tm[2]);if(v>total)total=v;pend=null;return}
    if(RCSKIP.test(n)){pend=null;return}
    /* mennyiség-/súlysor: 0,512 kg x 1 990 Ft/kg  vagy  2 x 399 */
    var qm=RC_QTY.exec(n);
    if(qm&&n.replace(qm[0],"").replace(/[^a-z]/g,"").length<4){var qv=num(qm[1]),up2=num(qm[3]),ux=(qm[2]||qm[4]||"").toLowerCase(),tgt=pend||last;
      var tail=RC_PRICE.exec(n.slice(qm.index+qm[0].length));var tot=tail?num(tail[1]):Math.round(qv*up2);
      if(pend){last=mk(pend,tot);out.push(last);pend=null;tgt=last}
      if(tgt){if(ux==="kg"||ux==="l"||(qm[4]&&qm[4]!=="db")){tgt.q=qv;tgt.u=ux==="l"||qm[4]==="l"?"l":"kg";tgt.unit={p:up2,u:tgt.u}}
        else{tgt.cnt=Math.max(1,Math.round(qv));if(tgt.u==="db"&&!(tgt.c&&tgt.c.n==="Tojás"&&tgt.q>1))tgt.q=tgt.cnt;else tgt.q=Math.round(tgt.q*tgt.cnt*100)/100}
        if(tail&&tot>0)tgt.price=tot}return}
    var pm=RC_PRICE.exec(n);
    if(!pm){if(l.replace(/[^a-zA-ZáéíóöőúüűÁÉÍÓÖŐÚÜŰ]/g,"").length>=3)pend=l;return}
    var price=num(pm[1]);if(Math.abs(price)>=200000){var lt=/(-?\d+(?:[.,]\d{1,2})?)\s*(?:ft|huf)?\s*(?:[a-e]\d{0,2}|\d{1,2}%|\*)?\s*$/i.exec(n);if(lt){pm=lt;price=num(lt[1])}}
    if(price<0||/^-/.test(pm[1].trim())||/kedvezmeny|engedmeny|akcio|kupon|arcsokkentes/.test(n)){if(last&&price<0&&last.price+price>0)last.price+=price;else if(last&&/kedvezmeny|engedmeny|akcio/.test(n)){var dv=Math.abs(price);if(last.price>dv)last.price-=dv}pend=null;return}
    if(!(price>=20&&price<200000)){return}
    var name=l.slice(0,Math.max(0,l.length-pm[0].length)).replace(/[*#]/g,"").replace(/\s+[A-E]\d{0,2}\s*$/,"").trim();
    if(name.replace(/[^a-zA-ZáéíóöőúüűÁÉÍÓÖŐÚÜŰ]/g,"").length<3){if(pend){name=pend}else return}
    pend=null;last=mk(name,price);out.push(last)});
  return{items:out,total:total,shop:shopI}};
function receipt(){var inp=$("rcfile");inp.value="";inp.click()}
/* blokk képe: szélesség szerint kb. 1400 px-re méretez (a hosszú blokk sem zsugorodik olvashatatlanra), szürke, kontraszt */
function rcPrep(file){return new Promise(function(res,rej){var u=URL.createObjectURL(file),im=new Image();im.onload=function(){var k=Math.min(2,1400/im.width);if(im.height*k>6000)k=6000/im.height;
  var w=Math.round(im.width*k),h=Math.round(im.height*k),c=document.createElement("canvas");c.width=w;c.height=h;var x=c.getContext("2d");x.drawImage(im,0,0,w,h);URL.revokeObjectURL(u);
  var d=x.getImageData(0,0,w,h),a=d.data,hs=new Array(256).fill(0),i,g;for(i=0;i<a.length;i+=4){g=(a[i]*.3+a[i+1]*.59+a[i+2]*.11)|0;a[i]=g;hs[g]++}
  var n=a.length/4,acc=0,lo=0,hi=255;for(i=0;i<256;i++){acc+=hs[i];if(acc>n*.02){lo=i;break}}acc=0;for(i=255;i>=0;i--){acc+=hs[i];if(acc>n*.02){hi=i;break}}var sc=255/Math.max(1,hi-lo);
  for(i=0;i<a.length;i+=4){g=Math.max(0,Math.min(255,(a[i]-lo)*sc));a[i]=a[i+1]=a[i+2]=g}x.putImageData(d,0,0);res(c)};im.onerror=function(){URL.revokeObjectURL(u);rej(new Error("A kép nem olvasható"))};im.src=u})}
var RCLOC=[["fridge","Hűtő"],["freezer","Fagyasztó"],["pantry","Spájz"]],rcAcc=null;
function rcSum(){var c={fridge:0,freezer:0,pantry:0};document.querySelectorAll("#rclist .rcrow").forEach(function(r){var k=r.dataset.k;if(document.querySelector('[data-rk="'+k+'"]').checked)c[document.querySelector('[data-rl="'+k+'"]').value]++});
  var el=$("rcsum");if(el)el.innerHTML=RCLOC.map(function(l){return '<span class="rcpill '+l[0]+'"><span class="ic">'+ic(l[0]==="fridge"?"fridge":l[0]==="freezer"?"ice":"jar")+"</span>"+l[1]+" <b>"+c[l[0]]+"</b></span>"}).join("")}
function reviewReceipt(res){if(rcAcc){res.items=rcAcc.items.concat(res.items);if(res.shop<0)res.shop=rcAcc.shop;res.total=res.total||rcAcc.total||0}rcAcc=null;
  var o='<div class="q small">Ezeket ismertem fel a blokkon. Ellenőrizd a nevet, mennyiséget és a helyet – a bejelölteket felveszem a raktárba, az összeget kiadásként.</div>';
  o+='<label for="rcshop">Bolt</label><select id="rcshop">'+SHOPS.map(function(s,i){return '<option value="'+i+'"'+(i===res.shop?" selected":"")+">"+s[1]+"</option>"}).join("")+'<option value="-1"'+(res.shop<0?" selected":"")+'>Más bolt</option></select>';
  o+='<div id="rcsum" class="rcsum" aria-live="polite"></div>';
  o+='<div id="rclist">'+res.items.map(function(it,k){var us=Object.keys(BASE).filter(function(u){return /^(g|dkg|kg|ml|dl|l|db)$/.test(u)});if(us.indexOf(it.u)<0)us.push(it.u);
    return '<div class="rcrow'+(it.ok?"":" unk")+'" data-k="'+k+'"><input type="checkbox" data-rk="'+k+'"'+(it.ok?" checked":"")+' aria-label="Felvétel"><div class="rcn"><input class="rcname" data-rn="'+k+'" value="'+esc(it.n)+'" aria-label="Termék neve" list="rcdl"><span class="q small">'+esc(it.raw)+(it.ok?"":" · ismeretlen, nevezd át")+'</span>'+
      '<div class="rcq"><input type="number" step="any" min="0" inputmode="decimal" data-rq="'+k+'" value="'+(Math.round(it.q*1000)/1000)+'" aria-label="Mennyiség"><select data-ru="'+k+'" aria-label="Egység">'+us.map(function(u){return "<option"+(u===it.u?" selected":"")+">"+u+"</option>"}).join("")+'</select><select data-rl="'+k+'" class="rcloc" aria-label="Hová kerül?">'+RCLOC.map(function(l){return '<option value="'+l[0]+'"'+(l[0]===it.loc?" selected":"")+">"+l[1]+"</option>"}).join("")+"</select></div></div><b class=\"price\">"+ft(it.price)+"</b></div>"}).join("")+"</div>";
  o+='<datalist id="rcdl">'+allProds().map(function(c){return '<option value="'+esc(c.n)+'">'}).join("")+"</datalist>";
  if(!res.items.length)o+='<div class="empty">Nem találtam tételeket a képen. Fotózd egyenesen, jó fényben, a blokk töltse ki a képet; hosszú blokkot több részletben.</div>';
  o+='<label for="rctot">Végösszeg (Ft)</label><input id="rctot" type="number" inputmode="decimal" value="'+(res.total||res.items.reduce(function(a,x){return a+x.price},0))+'">';
  o+='<div class="btns"><button type="button" class="btn g" id="rcok">Raktárba és kiadásnak</button><button type="button" class="btn p" id="rcmore">+ Következő részlet fotózása</button></div>';dlg("rcd",o);rcSum();
  $("rclist").addEventListener("change",function(e){var t=e.target;if(t.dataset.rn!=null){var k=t.dataset.rn,c=find(t.value.trim());var ls=document.querySelector('[data-rl="'+k+'"]');ls.value=locOf(t.value.trim(),c);if(c){document.querySelector('[data-rk="'+k+'"]').checked=true;var row=t.closest(".rcrow");if(row.classList.contains("unk")){var su=document.querySelector('[data-ru="'+k+'"]');if(!su.querySelector('option[value="'+c.u+'"]')&&[].every.call(su.options,function(o){return o.value!==c.u})){var op=document.createElement("option");op.textContent=c.u;su.appendChild(op)}su.value=c.u;document.querySelector('[data-rq="'+k+'"]').value=defQ(c.u,c.n)}row.classList.remove("unk")}}rcSum()});
  $("rcmore").onclick=function(){collect(false);rcAcc={items:res.items,total:res.total||0,shop:+$("rcshop").value};receipt()};
  function collect(final){res.items.forEach(function(it,k){var cb=document.querySelector('[data-rk="'+k+'"]');if(!cb)return;it.ok=cb.checked;it.n=document.querySelector('[data-rn="'+k+'"]').value.trim();it.q=parseFloat(document.querySelector('[data-rq="'+k+'"]').value)||it.q;it.u=document.querySelector('[data-ru="'+k+'"]').value;it.loc=document.querySelector('[data-rl="'+k+'"]').value})}
  $("rcok").onclick=function(){collect(true);var si=+$("rcshop").value,n=0,mp=ld(RCMAP,{}),lc={fridge:0,freezer:0,pantry:0};
    res.items.forEach(function(it){if(!it.ok||!it.n)return;var c=find(it.n),nm=c?c.n:it.n;
      if(!c&&window.learn)learn(nm,it.u,it.loc,daysOf(it.loc,null));
      var key=rcKey(it.raw);if(key&&key.length>=3&&(!it.c||it.c.n!==nm))mp[key]=nm;
      items.push({id:uid("i"),n:nm,q:it.q,u:it.u,loc:it.loc,exp:plus(daysOf(it.loc,c))});n++;lc[it.loc]++;
      if(c&&si>=0&&it.unit&&punit(c)===it.unit.u){var p=(priceOf(c.n)||c.pr).slice();p[si]=it.unit.p;prices[c.n]=p}});
    sv(RCMAP,mp);sv(K.price,prices);saveItems();var tot=parseFloat($("rctot").value)||0;if(tot>0){exps.push({id:uid("x"),a:tot,n:"Bevásárlás (blokk)",shop:si>=0?SHOPS[si][1]:"",date:today()});sv(K.exps,exps)}
    $("rcd").close();drawAll();toast(n+" termék a raktárba (hűtő "+lc.fridge+", fagyasztó "+lc.freezer+", spájz "+lc.pantry+"), "+ft(tot)+" a kiadásokhoz.")}}
FX.receipt=receipt;FX.reviewReceipt=reviewReceipt;

/* ================= LEJÁRATI ÉRTESÍTÉS ================= */
var notif=Object.assign({on:0,h:8,last:""},ld(KX.notif,{}));
function notify(title,body){try{if(!("Notification" in window)||Notification.permission!=="granted")return;
  if(navigator.serviceWorker&&navigator.serviceWorker.ready)navigator.serviceWorker.ready.then(function(r){r.showNotification(title,{body:body,icon:"icon-192.png",badge:"icon-192.png",tag:"kaja-"+title})});else new Notification(title,{body:body})}catch(e){}}
function expirySummary(){var soon=items.filter(function(i){var d=days(i.exp);return d>=0&&d<=1&&i.q>0});if(!soon.length)return null;
  var f=feas().filter(function(c){return c.soon}).slice(0,2).map(function(c){return c.r.nev});
  return{t:"Hamarosan lejár: "+soon.map(function(i){return i.n}).slice(0,4).join(", "),b:(f.length?"Ezekből főzhetsz: "+f.join(", ")+".":"Nézd meg az appban, mit főzhetsz belőle.")}}
function writeSW(){try{if(!window.caches)return;caches.open("kaja-data").then(function(c){c.put("/__kaja_expiry",new Response(JSON.stringify({on:notif.on,h:notif.h,items:items.filter(function(i){return i.q>0}).map(function(i){return{n:i.n,e:i.exp}})}),{headers:{"Content-Type":"application/json"}}))})}catch(e){}}
function checkNotify(){if(!notif.on)return;var now=new Date();if(notif.last===today()||now.getHours()<notif.h)return;var s=expirySummary();notif.last=today();sv(KX.notif,notif);if(s)notify(s.t,s.b)}
function enableNotif(on){if(!on){notif.on=0;sv(KX.notif,notif);writeSW();drawSetFx();return}
  if(!("Notification" in window)){toast("Ez a telefon vagy böngésző nem támogatja az értesítéseket.");return}
  Notification.requestPermission().then(function(p){if(p!=="granted"){toast("Az értesítés nincs engedélyezve. A telefon beállításaiban engedélyezheted.");drawSetFx();return}
    notif.on=1;notif.last="";sv(KX.notif,notif);writeSW();
    navigator.serviceWorker&&navigator.serviceWorker.ready.then(function(r){if(r.periodicSync)r.periodicSync.register("kaja-expiry",{minInterval:12*3600*1000}).catch(function(){})});
    notify("Értesítések bekapcsolva","Szólok, ha valami hamarosan lejár.");drawSetFx()})}
document.addEventListener("visibilitychange",function(){if(!document.hidden)checkNotify()});

/* ================= PAZARLÁS ================= */
FX.onDelete=function(i){if(days(i.exp)<0&&!/^Maradék: /.test(i.n)){var rec={n:i.n,d:today(),ft:Math.round(itemCost(i.n,i.q,i.u))};waste.th.push(rec);sv(KX.waste,waste);return function(){var k=waste.th.indexOf(rec);if(k>=0){waste.th.splice(k,1);sv(KX.waste,waste)}}}
  if(days(i.exp)<0&&/^Maradék: /.test(i.n)){var r2={n:i.n,d:today(),ft:0};waste.th.push(r2);sv(KX.waste,waste);return function(){var k=waste.th.indexOf(r2);if(k>=0){waste.th.splice(k,1);sv(KX.waste,waste)}}}
  return null};
function drawWaste(){var el=$("fxwaste");if(!el)return;var m=today().slice(0,7),th=waste.th.filter(function(x){return x.d.slice(0,7)===m}),svd=waste.sv.filter(function(x){return x.d.slice(0,7)===m});
  var tf=th.reduce(function(a,x){return a+(x.ft||0)},0),sf=svd.reduce(function(a,x){return a+(x.ft||0)},0);
  el.innerHTML='<h2><span class="ic">'+ic("coin")+'</span>Pazarlás ebben a hónapban</h2><div class="sv-g"><div class="sv"><span class="ic">'+ic("heart")+"</span><b>"+svd.length+'</b><small>megmentett</small></div><div class="sv"><span class="ic">'+ic("coin")+"</span><b>"+ft(sf).replace(" Ft","")+'</b><small>Ft megspórolva</small></div><div class="sv"><span class="ic">'+ic("can")+"</span><b>"+th.length+"</b><small>kidobva ("+ft(tf)+")</small></div></div>"+
    '<div class="q small">Megmentettnek számít, ha hamar lejáró alapanyagból főztél, vagy megettétek a maradékot. Kidobottnak, ha lejárt terméket törölsz.</div>'+
    (th.length?'<div class="dh">Kidobva</div>'+th.slice(-5).reverse().map(function(x){return'<div class="li"><span class="lt">'+esc(x.d)+" "+esc(x.n)+'</span><span class="price">'+ft(x.ft||0)+"</span></div>"}).join(""):"")}

/* ================= KITŰZŐK ÉS SZINT ================= */
var LEVELS=["Kukta","Szakácsinas","Szakács","Főszakács","Konyhafőnök","Séf","Mesterszakács"];
function weekMeals(){var w=wk();return meals.filter(function(m){return m.date>=w[0]&&m.date<=w[1]})}
function BADGES(){var cats={},wm=weekMeals();wm.forEach(function(m){cats[m.cat]=1});var allc={};meals.forEach(function(m){allc[m.n]=1});
  var noWaste=meals.filter(function(m){return days(m.date)>=-7}).length>=3&&!waste.th.some(function(x){return days(x.d)>=-7});
  return[["first","Első fakanál","Naplózz egy étkezést","pot",meals.length>=1],["ten","Tíz tányér","10 naplózott étkezés","pasta",meals.length>=10],["fifty","Ötven tányér","50 naplózott étkezés","cake",meals.length>=50],
    ["foz","Főzelékbajnok","5 zöldséges étel","veg",meals.filter(function(m){return m.cat==="zoldseg"}).length>=5],["fish","Halas hét","Hal ezen a héten","fish",!!cats.hal],
    ["vari","Világjáró","5 féle étel egy héten","book",Object.keys(cats).length>=5],["nowaste","Nulla pazarlás","Egy hét kidobás nélkül","heart",noWaste],
    ["saver","Lejárat-vadász","10 megmentett alapanyag","egg",waste.sv.length>=10],["left","Maradékmentő","3 megevett maradék","sandwich",waste.sv.filter(function(x){return x.lo}).length>=3],
    ["own","Receptíró","Írj saját receptet","pen",ownRec.length>=1],["fav","Ínyenc","5 kedvenc recept","heart",Object.keys(kedv).filter(function(k){return kedv[k]===1}).length>=5],
    ["family","Családi konyha","Közös raktár bekapcsolva","fridge",!!(window.SYNC&&SYNC.code())],["budget","Spórolós","Heti költés a kereten belül","coin",!!(bud&&bud.w&&wm.length>=3&&sum(wk()[0],wk()[1])<=bud.w)],
    ["menu","Előrelátó","Készíts heti menüt","book",!!menu],["kidpick","Kis kukta","A gyerek választott vacsorát","heart",!!kid]]}
function xp(){return meals.length*10+Object.keys(meals.reduce(function(a,m){a[m.n]=1;return a},{})).length*5+ownRec.length*15+waste.sv.length*5+BADGES().filter(function(b){return b[4]}).length*20}
function level(){var x=xp(),l=Math.floor(Math.sqrt(x/60));return{l:l,name:LEVELS[Math.min(l,LEVELS.length-1)],x:x,next:Math.pow(l+1,2)*60,prev:Math.pow(l,2)*60}}
function checkBadges(){var seen=ld(KX.badges,null),got=BADGES().filter(function(b){return b[4]}).map(function(b){return b[0]});
  if(seen){var nw=got.filter(function(g){return seen.indexOf(g)<0});if(nw.length){var b=BADGES().filter(function(x){return x[0]===nw[0]})[0];toast("Új kitűző: "+b[1]+"! ("+b[2]+")")}}
  try{localStorage.setItem(KX.badges,JSON.stringify(got))}catch(e){}}
function drawLevel(){var el=$("fxlevel");if(!el)return;var L=level(),p=Math.min(100,(L.x-L.prev)/(L.next-L.prev)*100);
  el.innerHTML='<h2><span class="ic">'+ic("cake")+"</span>Szakács szint: "+(L.l+1)+". "+esc(L.name)+'</h2><div class="bar"><b style="width:'+p+'%"></b></div><div class="q small">'+L.x+" / "+L.next+' pont a következő szintig. Pont jár a főzésért, új ételekért, saját receptért és a megmentett alapanyagokért.</div>'+
    '<div class="badges">'+BADGES().map(function(b){return '<div class="bdgx'+(b[4]?" on":"")+'" title="'+esc(b[2])+'"><span class="ic">'+ic(b[3])+"</span><b>"+esc(b[1])+"</b><small>"+esc(b[2])+"</small></div>"}).join("")+"</div>"}

/* ================= GYEREK MÓD ================= */
function kidList(){var f=feas().filter(function(c){return !c.bl&&kedv[c.r.id]!==-1&&!c.r.mini&&c.r.cat!=="reggeli"});f.sort(function(a,b){return (kedv[b.r.id]===1)-(kedv[a.r.id]===1)||b.sc-a.sc});return f.slice(0,8)}
function kidMode(){var d=$("kid"),l=kidList(),o='<div class="kidh pf">Mit együnk ma?</div>';
  o+=l.length?'<div class="kidg">'+l.map(function(c){return '<button type="button" class="kidc" data-kid="'+c.r.id+'"><span class="ic">'+ic(RICO[c.r.cat]||"pot")+"</span><b>"+esc(c.r.nev)+"</b></button>"}).join("")+"</div>":'<div class="empty">Most nincs miből választani. Kérd meg a szüleidet, hogy töltsék fel a hűtőt!</div>';
  o+='<button type="button" class="btn p full" id="kidexit">Kilépés (tartsd nyomva 2 mp-ig)</button>';d.querySelector(".dbody").innerHTML=o;d.showModal();
  d.oncancel=function(e){e.preventDefault()};
  var t=null,b=$("kidexit");function down(){b.textContent="Tartsd nyomva...";t=setTimeout(function(){d.close()},2000)}function up(){clearTimeout(t);b.textContent="Kilépés (tartsd nyomva 2 mp-ig)"}
  b.onpointerdown=down;b.onpointerup=up;b.onpointerleave=up}
document.addEventListener("click",function(e){var k=e.target.closest("[data-kid]");if(!k)return;var r=recById(k.dataset.kid);kid={id:r.id,date:today()};sv(KX.kid,kid);
  var d=$("kid");d.querySelector(".dbody").innerHTML='<div class="kidh pf">Szuper választás!</div><div class="kidwin"><span class="ic">'+ic(RICO[r.cat]||"pot")+'</span><b>'+esc(r.nev)+'</b></div><div class="confetti">'+new Array(24).join('<i></i>')+'</div><p class="q" style="text-align:center">Szólok a szüleidnek.</p><button type="button" class="btn p full" id="kidexit2">Vissza</button>';
  $("kidexit2").onclick=function(){kidMode()};beep();notify("A gyerek választott","Ma ezt kérte: "+r.nev);checkBadges()});
FX.kidMode=kidMode;

/* ================= BEÁLLÍTÁSOK ================= */
function drawSetFx(){var el=$("fxdiet");if(el){el.innerHTML='<h2><span class="ic">'+ic("heart")+'</span>Ki mit nem eszik?</h2>'+
    '<label class="toggle"><input type="checkbox" id="dveg"'+(diet.veg?" checked":"")+"> Vegetáriánus (hús és hal nélkül)</label>"+
    '<div class="q small">Allergia, érzékenység (ezeket tartalmazó recepteket elrejtem):</div><div class="chips" style="flex-wrap:wrap;overflow:visible">'+ALLERG.map(function(a){var on=diet.al.indexOf(a)>=0;return '<button type="button" class="chip" data-al="'+a+'" aria-pressed="'+on+'">'+(on?"✓ ":"")+a+"</button>"}).join("")+"</div>"+
    '<label for="dexin">Nem esszük (pl. gomba, máj)</label><div class="row"><div style="flex:3"><input id="dexin" autocomplete="off" placeholder="Kezdd el írni..."><div class="sugg" id="dexs" role="listbox" hidden></div></div><div><button type="button" class="btn sm" id="dexadd" style="width:100%">+</button></div></div>'+
    '<div class="chips" style="flex-wrap:wrap;overflow:visible;margin-top:8px">'+diet.ex.map(function(x){return '<button type="button" class="chip" data-exr="'+esc(x)+'">'+esc(x)+" ×</button>"}).join("")+"</div>";
    ac($("dexin"),$("dexs"),function(){});$("dexadd").onclick=function(){var v=$("dexin").value.trim(),c=find(v);if(!v)return;v=c?c.n:v;if(diet.ex.indexOf(v)<0)diet.ex.push(v);sv(KX.diet,diet);drawAll()};
    $("dveg").onchange=function(){diet.veg=this.checked?1:0;sv(KX.diet,diet);drawAll()}}
  var nt=$("fxnotif");if(nt){var sup="Notification" in window,perm=sup?Notification.permission:"nincs";
    nt.innerHTML='<h2><span class="ic">'+ic("egg")+'</span>Lejárati értesítés</h2><label class="toggle"><input type="checkbox" id="non"'+(notif.on&&perm==="granted"?" checked":"")+(sup?"":" disabled")+"> Szólj, ha valami holnap lejár</label>"+
      '<label for="nh">Hány órától?</label><select id="nh">'+[6,7,8,9,10,12,15,17,18,19].map(function(h){return'<option value="'+h+'"'+(h===notif.h?" selected":"")+">"+h+":00</option>"}).join("")+"</select>"+
      '<div class="q small" style="margin-top:6px">'+(sup?"Naponta egyszer szól: amikor megnyitod az appot, illetve ha a telefon engedi, a háttérben is (Chrome, telepített app).":(window.IS_IOS&&!window.IS_STANDALONE?'iPhone-on az értesítés csak a főképernyőre telepített appban működik (iOS 16.4 vagy újabb). <button type="button" class="btn sm t" data-ig="ios">Megmutatom, hogyan</button>':"Ez a böngésző nem támogatja az értesítéseket."))+"</div>";
    $("non").onchange=function(){enableNotif(this.checked)};$("nh").onchange=function(){notif.h=+this.value;notif.last="";sv(KX.notif,notif);writeSW()}}}
document.addEventListener("click",function(e){var a=e.target.closest("[data-al]");if(a){var k=diet.al.indexOf(a.dataset.al);if(k>=0)diet.al.splice(k,1);else diet.al.push(a.dataset.al);sv(KX.diet,diet);drawAll()}
  var x=e.target.closest("[data-exr]");if(x){diet.ex=diet.ex.filter(function(v){return v!==x.dataset.exr});sv(KX.diet,diet);drawAll()}});

/* ================= ÜNNEP / HETI MENÜ KÁRTYA A RECEPTEKNÉL ================= */
function drawRecFx(){var el=$("fxholi");if(el){var h=FX.holiday();el.hidden=!h;if(h)el.innerHTML='<h2><span class="ic">'+ic("cake")+"</span>"+esc(h.t)+'</h2><div class="chips" style="flex-wrap:wrap;overflow:visible">'+h.ids.map(function(id){var r=recById(id);return r?'<button type="button" class="chip" data-open="'+r.id+'">'+esc(r.nev)+"</button>":""}).join("")+"</div>"+(window.UNNEP?'<div class="btns"><button type="button" class="btn g sm" id="fxholiplan">Ünnepi menü tervező</button></div>':"");if(h&&$("fxholiplan"))$("fxholiplan").onclick=function(){UNNEP.open()}}
  var w=$("fxweek");if(w){var n=menu&&menu.days?menu.days.filter(function(d){return d.date>=today()}).length:0;
    w.innerHTML='<h2><span class="ic">'+ic("book")+'</span>Heti menü</h2><div class="q small">7 napos ebéd és vacsora terv a raktárból, változatosan, a keretre figyelve.</div><div class="btns"><button type="button" class="btn g" id="fxmenu">'+(n?"Heti menü megnyitása":"Heti menü készítése")+'</button><button type="button" class="btn p" id="fxkid">Gyerek mód</button></div>';
    $("fxmenu").onclick=function(){showMenu()};$("fxkid").onclick=function(){kidMode()}}}

/* ================= BEKÖTÉS ================= */
FX.draw=function(v){drawToday();if(v==="rec")drawRecFx();if(v==="stat"){drawLevel();drawWaste()}if(v==="set")drawSetFx();writeSW();checkBadges()};
FX.init=function(){var b=$("fnbc");if(b)b.onclick=scan;$("bcgo").onclick=function(){var raw=$("bcman").value.trim(),g=/[(\/]|^01\d{14}\d/.test(raw)?FX.parseGS1(raw):null,v=g?g.gtin:raw.replace(/\D/g,"");if(v.length>=8){bcAudio();scanBeep();bcStop();gs1Pend=g;lookup(v)}};qtyInit();
  $("dlg").addEventListener("close",function(){lastScan=null});$("feph").onclick=function(){photoOne("exp")};$("fqph").onclick=function(){photoOne("qty")};
  $("fxshopmode").onclick=shopMode;$("fxrc").onclick=receipt;$("rcd").addEventListener("close",function(){rcAcc=null});
  $("rcfile").onchange=function(){var f=this.files[0];if(!f)return;dlg("rcd",'<div class="q">Olvasom a blokkot... <b id="rcp">0%</b></div><div class="bar"><b id="rcb" style="width:0%"></b></div><div class="q small" style="margin-top:8px">Első alkalommal pár másodperc, amíg a szövegfelismerő betölt.</div>');
    rcPrep(f).catch(function(){return f}).then(function(img){return FX.ocrText(img,function(p){$("rcp").textContent=p+"%";$("rcb").style.width=p+"%"},"4")}).then(function(t){reviewReceipt(FX.parseReceipt(t))}).catch(function(e){dlg("rcd",'<div class="warnbox">Nem sikerült beolvasni: '+esc(e.message||e)+"</div>")})};
  checkNotify()};
FX.init();drawAll();
})();
