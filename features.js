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
  if(md>=1210&&md<=1226)return{n:"Karácsony",ids:["unn-01","unn-02","hal-01","unn-03","huh-001","sal-04","des-13","hus-30","tes-15","hal-05","lev-12"],t:"Közeleg a karácsony: ünnepi ötletek"};
  if(md>=1227||md<=101)return{n:"Szilveszter",ids:["foz-04","lev-07","mini-27","hid-01","hid-03","sze-02","lev-19","sze-14","egy-03"],t:"Szilveszter és újév: lencse a szerencséért, virsli éjfélkor"};
  if(de>=-10&&de<=1)return{n:"Húsvét",ids:["unn-06","hid-03","sal-04","huh-001","des-03","lev-14","sze-17"],t:"Közeleg a húsvét: sonka, tojás, kalács"};
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
function candidates(){return allRec().map(check).filter(function(c){return !c.bl&&!c.r.mini&&kedv[c.r.id]!==-1&&(c.ok||c.miss.length<=2)})}
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
function bcStop(){if(bcLoop)cancelAnimationFrame(bcLoop);bcLoop=null;if(bcStream){bcStream.getTracks().forEach(function(t){t.stop()});bcStream=null}}
function lcp(a,b){var i=0;while(i<a.length&&i<b.length&&a[i]===b[i])i++;return i}
function matchCat(text){var t=" "+norm(text).replace(/[^a-z0-9 ]/g," ")+" ",toks=t.trim().split(/\s+/),best=null,bs=0;
  allProds().forEach(function(c){var n=norm(c.n).replace(/[^a-z0-9 ]/g," ").trim();if(n.length<3)return;var sc=0,ok=n.split(/\s+/).every(function(x){var m=0;toks.forEach(function(tk){m=Math.max(m,lcp(x,tk))});if(m<Math.min(4,x.length))return false;sc+=m-(x.length-m)*0.5;return true});
    if(ok&&sc>bs){bs=sc;best=c}});
  var SYN={trappista:"Sajt",edami:"Sajt",gouda:"Gouda",teszta:"Tészta",spagetti:"Spagetti",fusilli:"Tészta",penne:"Tészta",kifli:"Kifli",zsemle:"Zsemle",kenyer:"Kenyér",tojas:"Tojás",tejfol:"Tejföl",joghurt:"Joghurt",vaj:"Vaj",liszt:"Liszt",cukor:"Cukor",rizs:"Rizs",sonka:"Sonka",parizsi:"Párizsi",szalami:"Szalámi",csirkemell:"Csirkemell",csirkecomb:"Csirkecomb",burgonya:"Burgonya",krumpli:"Burgonya",hagyma:"Vöröshagyma",paradicsom:"Paradicsom",paprika:"Paprika",uborka:"Uborka",alma:"Alma",banan:"Banán",tej:"Tej",turo:"Túró",mozzarella:"Mozzarella",olaj:"Étolaj",ketchup:"Ketchup",mustar:"Mustár",majonez:"Majonéz"};
  if(!best)Object.keys(SYN).some(function(k){if(t.indexOf(" "+k)>=0){best=find(SYN[k]);return true}});return best}
function parseQty(s){var m=/(\d+(?:[.,]\d+)?)\s*(kg|g|l|ml|dl|cl|db)\b/i.exec(s||"");if(!m)return null;return{q:parseFloat(m[1].replace(",",".")),u:m[2].toLowerCase()}}
var lastScan=null;
function applyScan(code,name,qty){var c=matchCat(name)||find(name);$("fn").value=c?c.n:name;$("fn").dispatchEvent(new Event("input"));
  if(qty&&["g","kg","ml","dl","l","db"].indexOf(qty.u)>=0){$("fq").value=qty.q;$("fu").value=qty.u}else if(qty&&qty.u==="cl"){$("fq").value=qty.q*10;$("fu").value="ml"}
  qtySync();$("fph").innerHTML="Vonalkód: "+esc(code)+(name&&(!c||norm(c.n)!==norm(name))?" · "+esc(name):"")+"<br>"+$("fph").innerHTML;lastScan={code:code}}
function lookup(code){var st=$("bcst");if(barmap[code]){var m=barmap[code];$("bc").close();applyScan(code,m.n,m.q);return}
  st.textContent="Keresem a termékadatbázisban ("+code+")...";
  fetch("https://world.openfoodfacts.org/api/v2/product/"+code+".json?fields=product_name,product_name_hu,generic_name,quantity,brands").then(function(r){return r.json()}).then(function(j){
    var p=j&&j.product;if(!p||!(p.product_name_hu||p.product_name||p.generic_name)){st.innerHTML="Ezt a vonalkódot nem ismerem. Írd be a nevét, a következő alkalommal már emlékszem rá.";$("bc").close();applyScan(code,"",null);$("fn").focus();return}
    var name=p.product_name_hu||p.product_name||p.generic_name;$("bc").close();applyScan(code,name,parseQty(p.quantity))}).catch(function(){st.textContent="Nincs internet, írd be kézzel a nevét.";$("bc").close();applyScan(code,"",null)})}
function scan(){bcAudio();var d=$("bc");$("bcst").textContent="Tartsd a vonalkódot a keretbe.";$("bcman").value="";d.showModal();d.onclose=bcStop;
  if(!("BarcodeDetector" in window)||!navigator.mediaDevices){$("bcst").textContent="Ez a böngésző nem tud vonalkódot olvasni. Írd be a számokat kézzel.";return}
  var det;try{det=new BarcodeDetector({formats:["ean_13","ean_8","upc_a","upc_e","code_128"]})}catch(e){$("bcst").textContent="A vonalkód-olvasó nem érhető el. Írd be kézzel.";return}
  navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"}}).then(function(s){bcStream=s;var v=$("bcv");v.srcObject=s;v.play();
    function loop(){if(!bcStream)return;det.detect(v).then(function(r){if(r&&r.length){scanBeep();bcStop();lookup(r[0].rawValue)}else bcLoop=requestAnimationFrame(loop)}).catch(function(){bcLoop=requestAnimationFrame(loop)})}loop()})
  .catch(function(){$("bcst").textContent="Nem kaptam engedélyt a kamerához. Írd be a vonalkódot kézzel."})}
FX.onItemSaved=function(o){if(lastScan&&lastScan.code){barmap[lastScan.code]={n:o.n,q:{q:o.q,u:o.u}};sv(KX.bar,barmap);lastScan=null}};

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
FX.ocrText=function(img,prog){return loadOcr().then(function(){return Tesseract.createWorker("hun",1,{workerPath:absUrl("vendor/ocr/worker.min.js"),corePath:absUrl("vendor/ocr/"),langPath:absUrl("vendor/ocr/"),
    logger:function(m){if(prog&&m.status==="recognizing text")prog(Math.round(m.progress*100))}})}).then(function(w){return w.recognize(img).then(function(r){w.terminate();return r.data.text})})};
function num(s){return parseFloat(String(s).replace(/\s/g,"").replace(",","."))}
FX.parseReceipt=function(text){var lines=text.split(/\n/).map(function(l){return l.trim()}).filter(Boolean),out=[],total=0,shopI=-1,up=norm(text);
  if(/penny/.test(up))shopI=0;else if(/tesco/.test(up))shopI=1;else if(/lidl/.test(up))shopI=2;
  lines.forEach(function(l){var n=norm(l);
    var tm=/(osszesen|fizetendo|vegosszeg|total)[^0-9]*([\d\s]+[.,]?\d*)/.exec(n);if(tm){var v=num(tm[2]);if(v>total)total=v;return}
    if(/(afa|kartya|keszpenz|visszajaro|adoszam|nyugta|penztar|bankkartya|kedvezmeny|egyenleg|ap |nav )/.test(n))return;
    var pm=/([0-9][0-9 ]{0,6}[.,]?[0-9]{0,2})\s*(ft|huf)?\s*[a-z]?\s*$/.exec(n);if(!pm)return;var price=num(pm[1]);if(!(price>=20&&price<200000))return;
    var name=l.slice(0,l.length-pm[0].length).replace(/[*#]/g,"").trim();if(name.replace(/[^a-zA-ZáéíóöőúüűÁÉÍÓÖŐÚÜŰ]/g,"").length<3)return;
    var c=matchCat(name),q=parseQty(name),unit=/([\d\s]+)\s*ft\s*\/\s*(kg|l|db)/.exec(n);
    out.push({raw:name,n:c?c.n:name.replace(/\s+\d.*$/,"").slice(0,40),c:c,price:price,q:q?q.q:(c?defQ(c.u,c.n):1),u:q&&BASE[q.u]?q.u:(c?c.u:"db"),unit:unit?{p:num(unit[1]),u:unit[2]}:null,ok:!!c})});
  return{items:out,total:total,shop:shopI}};
function receipt(){var inp=$("rcfile");inp.value="";inp.click()}
function reviewReceipt(res){var o='<div class="q small">Ellenőrizd a felismert tételeket. A bejelölteket felveszem a raktárba, az összeget pedig kiadásként.</div>';
  o+='<label for="rcshop">Bolt</label><select id="rcshop">'+SHOPS.map(function(s,i){return '<option value="'+i+'"'+(i===res.shop?" selected":"")+">"+s[1]+"</option>"}).join("")+'<option value="-1"'+(res.shop<0?" selected":"")+'>Más bolt</option></select>';
  o+='<div id="rclist">'+res.items.map(function(it,k){return '<div class="rcrow"><input type="checkbox" data-rk="'+k+'"'+(it.ok?" checked":"")+' aria-label="Felvétel"><div class="rcn"><input class="rcname" data-rn="'+k+'" value="'+esc(it.n)+'" aria-label="Termék neve"><span class="q small">'+esc(it.raw)+"</span></div><b class=\"price\">"+ft(it.price)+"</b></div>"}).join("")+"</div>";
  if(!res.items.length)o+='<div class="empty">Nem találtam tételeket a képen. Próbáld meg jobb fényben, egyenesen fotózva.</div>';
  o+='<label for="rctot">Végösszeg (Ft)</label><input id="rctot" type="number" inputmode="decimal" value="'+(res.total||res.items.reduce(function(a,x){return a+x.price},0))+'">';
  o+='<div class="btns"><button type="button" class="btn g" id="rcok">Raktárba és kiadásnak</button></div>';dlg("rcd",o);
  $("rcok").onclick=function(){var si=+$("rcshop").value,n=0;res.items.forEach(function(it,k){if(!document.querySelector('[data-rk="'+k+'"]').checked)return;var nm=document.querySelector('[data-rn="'+k+'"]').value.trim(),c=find(nm);
      items.push({id:uid("i"),n:c?c.n:nm,q:it.q,u:it.u,loc:c?c.l:"pantry",exp:plus(c?c.d:7)});n++;
      if(c&&si>=0&&it.unit&&punit(c)===it.unit.u){var p=(priceOf(c.n)||c.pr).slice();p[si]=it.unit.p;prices[c.n]=p}});
    sv(K.price,prices);saveItems();var tot=parseFloat($("rctot").value)||0;if(tot>0){exps.push({id:uid("x"),a:tot,n:"Bevásárlás (blokk)",shop:si>=0?SHOPS[si][1]:"",date:today()});sv(K.exps,exps)}
    $("rcd").close();drawAll();toast(n+" termék a raktárba, "+ft(tot)+" a kiadásokhoz.")}}
FX.receipt=receipt;

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
function drawRecFx(){var el=$("fxholi");if(el){var h=FX.holiday();el.hidden=!h;if(h)el.innerHTML='<h2><span class="ic">'+ic("cake")+"</span>"+esc(h.t)+'</h2><div class="chips" style="flex-wrap:wrap;overflow:visible">'+h.ids.map(function(id){var r=recById(id);return r?'<button type="button" class="chip" data-open="'+r.id+'">'+esc(r.nev)+"</button>":""}).join("")+"</div>"}
  var w=$("fxweek");if(w){var n=menu&&menu.days?menu.days.filter(function(d){return d.date>=today()}).length:0;
    w.innerHTML='<h2><span class="ic">'+ic("book")+'</span>Heti menü</h2><div class="q small">7 napos ebéd és vacsora terv a raktárból, változatosan, a keretre figyelve.</div><div class="btns"><button type="button" class="btn g" id="fxmenu">'+(n?"Heti menü megnyitása":"Heti menü készítése")+'</button><button type="button" class="btn p" id="fxkid">Gyerek mód</button></div>';
    $("fxmenu").onclick=function(){showMenu()};$("fxkid").onclick=function(){kidMode()}}}

/* ================= BEKÖTÉS ================= */
FX.draw=function(v){drawToday();if(v==="rec")drawRecFx();if(v==="stat"){drawLevel();drawWaste()}if(v==="set")drawSetFx();writeSW();checkBadges()};
FX.init=function(){var b=$("fnbc");if(b)b.onclick=scan;$("bcgo").onclick=function(){var v=$("bcman").value.replace(/\D/g,"");if(v.length>=8){bcAudio();scanBeep();bcStop();lookup(v)}};qtyInit();
  $("fxshopmode").onclick=shopMode;$("fxrc").onclick=receipt;
  $("rcfile").onchange=function(){var f=this.files[0];if(!f)return;dlg("rcd",'<div class="q">Olvasom a blokkot... <b id="rcp">0%</b></div><div class="bar"><b id="rcb" style="width:0%"></b></div><div class="q small" style="margin-top:8px">Első alkalommal pár másodperc, amíg a szövegfelismerő betölt.</div>');
    FX.ocrText(f,function(p){$("rcp").textContent=p+"%";$("rcb").style.width=p+"%"}).then(function(t){reviewReceipt(FX.parseReceipt(t))}).catch(function(e){dlg("rcd",'<div class="warnbox">Nem sikerült beolvasni: '+esc(e.message||e)+"</div>")})};
  checkNotify()};
FX.init();drawAll();
})();
