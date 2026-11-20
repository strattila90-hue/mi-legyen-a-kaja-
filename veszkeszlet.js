/* Mi legyen a kaja? – Vészhelyzeti készlet (v1.28): 72 órás tartós csomag és melegítés nélkül ehető konzervek a Bolt nézetben.
   A mennyiségek a beállított háztartásból számolódnak (víz fejenként, étel adagra váltva); a raktárt a have()/liveOf() alapján nézi,
   a hiányzókat az addShop()-pal írja a listára. Az app.js-t nem érinti: a MORE.shopExtra horgot csomagolja be. */
(function(){
if(window.VKIT)return;
/* [kulcs (CATALOG_SRC név), mennyiség 1 főre / 3 napra, kerekítési egység, minimum, megjegyzés, felirat (ha más, mint a kulcs)] */
var PACK=[
  ["Ásványvíz",0,1.5,0,"Napi kb. 2 l ivásra fejenként, plusz egy kevés mosdáshoz. A legfontosabb tétel!"],
  ["Tartós tej",1,1,1,"Hűtés nélkül eláll; nyitás után hűtő, 2-3 napon belül fogyaszd."],
  ["Kétszersült",200,100,0,"Kenyér helyett, hónapokig eláll."],
  ["Tartós kenyér",0.5,1,1,"Vákuumcsomagolt szeletelt kenyér; nézd meg a dátumot."],
  ["Keksz",200,100,0,"Háztartási vagy zabkeksz: laktat, nem morzsálódik szét."],
  ["Müzliszelet",3,1,0,"Napi egy gyors energia, zsebben is elfér."],
  ["Mogyoróvaj",100,50,200,"Sok kalória kis helyen; kétszersültre kenve fő étel."],
  ["Aszalt gyümölcs",150,50,0,"Vitamin és rost, nem kell hűteni."],
  ["Dió",100,50,0,"Vagy mandula, mogyoró, napraforgómag."],
  ["Csokoládé",100,100,0,"Gyors energia, és a kedélynek is jót tesz."],
  ["Méz",50,50,250,"Édesítésre, kalóriának; évekig eláll."],
  ["Instant zabkása",3,1,0,"Hideg tartós tejjel is beáztatható, 10 perc alatt megpuhul."]];
var CANS=[
  ["Tonhalkonzerv",1,1,0,"Húzófüles dobozt válassz, vagy konzervnyitó kell!"],
  ["Szardíniakonzerv",1,1,0,"Olajban, hidegen kenyérre; a hal csontja is ehető."],
  ["Makrélakonzerv",1,1,0,"Paradicsomos szószban: kétszersülttel kész étel.","Makréla paradicsomos szószban"],
  ["Sült hal konzerv",0.5,1,0,"Ecetes-hagymás, hidegen a legjobb."],
  ["Babgulyás konzerv",0.5,1,0,"Hidegen is ehető, de ha van gáz, melegen jobb."],
  ["Sólet konzerv",0.5,1,0,"Hidegen a zsír megdermed, azt kanalazd le."],
  ["Csicseriborsó konzerv",0.5,1,0,"Leöblítve salátának; konzervnyitó kell!"],
  ["Bab konzerv",0.5,1,0,"Vörösbab vagy fehérbab, leöblítve salátának.","Vörösbab konzerv"],
  ["Paradicsomos bab konzerv",0.5,1,0,"Egyenesen a dobozból is jó."],
  ["Kukorica konzerv",0.5,1,0,"Salátának, tonhalhoz; konzervnyitó kell!"],
  ["Zöldborsó konzerv",0.5,1,0,"Lecsöpögtetve hidegen is ehető."],
  ["Befőtt",0.5,1,0,"Gyümölcskonzerv: a leve is ital, cukor és folyadék egyben.","Befőtt, gyümölcskonzerv"],
  ["Májkrém konzerv",1,1,0,"Kis kiszerelés, hogy egyszerre elfogyjon; nyitás után hűtő.","Májkrém / húskrém konzerv"],
  ["Pástétom",0.5,1,0,"Alutálkás, könnyen nyitható; nyitás után hűtő."],
  ["Löncshús konzerv",0.5,1,0,"Szeletelve kétszersültre, hidegen is jó."],
  ["Sűrített tej",0.4,1,0,"Kakaóhoz, kekszre; nyitás után hűtő."]];
var TIPS=["<b>Víz:</b> fejenként napi 2 liter ivásra, 3 napra legalább 6 liter. Ha elfogy, a csapvizet forralás nélkül ne idd, amíg nem szól a vízmű.",
  "<b>Konzervnyitó:</b> legyen egy kézi nyitó a készlet mellett, ne csak az elektromos. A húzófüles doboz biztosabb.",
  "<b>Forgatás:</b> a régebbit edd meg előbb, az újat tedd hátra (amit előbb vettél, az fogy el előbb).",
  "<b>Évente egyszer</b> nézd át a dátumokat, például óraátállításkor; a hamarosan lejárót főzd meg, és pótold.",
  "Legyen mellette elemlámpa, tartalék elem, gyufa, és ha van, egy kis kempingfőző."];
var CHEF_DEF=["Konzervnyitó, víz, és a régebbit edd meg előbb! Ennyi a titok."];

var MAP={},LISTS=[["72 órás tartós csomag",PACK,"milk"],["Melegítés nélkül ehető konzervek",CANS,"can"]];
LISTS.forEach(function(L){L[1].forEach(function(a){MAP[a[0]]=a})});
function heads(){return Math.max(1,(set.ad||0)+(set.te||0)+(set.ch||0)+(set.to||0))}
function water(){return 3*(2*(set.ad||0)+2*(set.te||0)+1.5*(set.ch||0)+1*(set.to||0))||6}
/* ajánlott mennyiség a katalógus egységében */
function need(a){var c=find(a[0]),q=a[0]==="Ásványvíz"?water():a[1]*portions();q=Math.ceil(q/a[2]-1e-9)*a[2];q=Math.max(q,a[3]||0);return{q:Math.round(q*100)/100,u:c?c.u:"db",c:c}}
function base(q,u){var b=BASE[u]||["db",1];return[b[0],q*b[1]]}
function onList(k,bt){var s=0;shop.forEach(function(x){if(x.done||norm(x.n)!==norm(k))return;var b=BASE[x.u]||["db",1];if(same(b[0],bt))s+=x.q*b[1]});return s}
/* {q,u,have,list,miss}: miss = még venni kell (katalógus egységben, a kerekítési egységre felkerekítve) */
function stat(a){var n=need(a),b=base(n.q,n.u),h=have(a[0],b[0]),l=onList(a[0],b[0]),f=BASE[n.u]?BASE[n.u][1]:1;
  var left=isFinite(h)?Math.max(0,b[1]-h-l)/f:0;if(left>0)left=Math.max(a[2],Math.ceil(left/a[2]-1e-9)*a[2]);
  return{q:n.q,u:n.u,have:isFinite(h)?h/f:n.q,full:!isFinite(h)||h>=b[1]-1e-6,list:l/f,miss:Math.round(left*100)/100}}
function fq(q,u){return nf(q)+" "+u}
function row(a){var s=stat(a),lab=a[5]||a[0],badge;
  if(s.full)badge='<span class="badge ok">Megvan</span>';else if(s.have>0)badge='<span class="badge warn">Van '+fq(s.have,s.u)+"</span>";else badge='<span class="badge">Nincs</span>';
  if(!s.full&&s.list>0)badge+=' <span class="badge cold">Listán '+fq(s.list,s.u)+"</span>";
  return '<div class="li vk-li'+(s.full?" vk-ok":"")+'"><span class="ic">'+ic(ico(a[0]))+'</span><span class="vk-t"><b>'+esc(lab)+"</b> "+fq(s.q,s.u)+" "+badge+'<br><span class="q small">'+esc(a[4])+"</span></span>"+
    (s.miss>0?'<button type="button" class="btn sm vk-add" data-vk="'+esc(a[0])+'" aria-label="'+esc(lab)+' listára">Listára</button>':"")+"</div>"}
function missing(){var m=[];LISTS.forEach(function(L){L[1].forEach(function(a){var s=stat(a);if(s.miss>0)m.push([a[0],s.miss,s.u])})});return m}
function draw(){var el=$("vkitb");if(!el)return;var tot=0,ok=0,body="",o='<div class="q small">Áramszünet, vízhiány, betegség vagy hóakadály esetére: ennyi kell <b>3 napra</b> főzés és hűtés nélkül.</div>'+
  '<div class="q small" style="margin-top:4px">Háztartás: <b>'+esc(people())+"</b> ("+heads()+" fő, "+nf(portions())+" adag). A Beállít fülön módosítható.</div>";
  LISTS.forEach(function(L){body+='<div class="sec vk-sec"><span class="ic">'+ic(L[2])+"</span>"+esc(L[0])+"</div>";L[1].forEach(function(a){tot++;if(stat(a).full)ok++;body+=row(a)})});
  var m=missing();o+='<div class="vk-sum"><b>'+ok+" / "+tot+"</b> tétel megvan"+(m.length?", "+m.length+" hiányzik.":". Szuper, minden megvan!")+"</div>"+body;
  o+='<div class="btns">'+(m.length?'<button type="button" class="btn g" id="vkall">Hiányzók a listára ('+m.length+")</button>":"")+(window.CHEF?'<button type="button" class="btn t" id="vkchef">Apróséf tanácsa</button>':"")+"</div>";
  o+='<div class="warnbox vk-tips"><b>Tippek</b><ul>'+TIPS.map(function(t){return"<li>"+t+"</li>"}).join("")+"</ul></div>";
  el.innerHTML=o;
  if($("vkall"))$("vkall").onclick=function(){var mm=missing();mm.forEach(function(x){addShop(x[0],x[1],x[2])});toast(mm.length+" tétel felírva a bevásárlólistára.")};
  if($("vkchef"))$("vkchef").onclick=function(){var L=(window.CHEF_LINES&&CHEF_LINES.prep)||CHEF_DEF;CHEF.say(L[Math.floor(Math.random()*L.length)])}}
function bind(){var d=$("vkit"),el=$("vkitb");if(!d||!el)return;
  d.addEventListener("toggle",function(){if(d.open)draw()});
  el.addEventListener("click",function(e){var b=e.target.closest("[data-vk]");if(!b)return;var a=MAP[b.dataset.vk];if(!a)return;var s=stat(a);if(s.miss>0){addShop(a[0],s.miss,s.u);toast((a[5]||a[0])+" felírva a listára.")}})}
/* a Bolt nézet minden újrarajzolásakor (lista változik) frissül, ha nyitva van */
if(window.MORE&&MORE.shopExtra){var orig=MORE.shopExtra;MORE.shopExtra=function(){var r=orig.apply(this,arguments);try{if($("vkit")&&$("vkit").open)draw()}catch(e){}return r}}
bind();
window.VKIT={draw:draw,missing:missing,keys:function(){return Object.keys(MAP)}};
})();
