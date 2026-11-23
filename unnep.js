/* Mi legyen a kaja? – v1.30: Ünnepi menü (karácsony, szilveszter, húsvét, farsang), születésnapi zsúrtervező
   rágcsa-kalkulátorral gyerekeknek és felnőtteknek, okosságok és időterv; Konyhai tudástár (TUDAS, tudas.js),
   a recept nézetben a lépésekhez illő konyhai alapok és maghőmérséklet; hely-felismerés (hűtő/fagyasztó/spájz).
   Az app.js-t nem módosítja: a window.FX horgokat láncolja, és saját gombokat köt be. */
(function(){
var U={};window.UNNEP=U;
var KS="kaja.unnep.v1";
function lget(k,d){try{var r=localStorage.getItem(k);return r?JSON.parse(r):d}catch(e){return d}}
function lset(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
function today(){return plus(0)}
function iso2(d){return d.getFullYear()+"-"+("0"+(d.getMonth()+1)).slice(-2)+"-"+("0"+d.getDate()).slice(-2)}
function dlong(s){return new Date(s+"T00:00:00").toLocaleDateString("hu-HU",{month:"long",day:"numeric",weekday:"long"})}
function addD(s,n){var d=new Date(s+"T00:00:00");d.setDate(d.getDate()+n);return iso2(d)}
function cheap(a){var b=(a||[]).filter(function(x){return x>0});return b.length?Math.min.apply(null,b):0}
function easter(y){var a=y%19,b=Math.floor(y/100),c=y%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451),mo=Math.floor((h+l-7*m+114)/31),da=((h+l-7*m+114)%31)+1;return new Date(y,mo-1,da)}
function nextMD(m,d){var n=new Date(),t=new Date(n.getFullYear(),m-1,d);if(iso2(t)<today())t=new Date(n.getFullYear()+1,m-1,d);return iso2(t)}
function nextEaster(){var y=new Date().getFullYear(),e=easter(y);if(iso2(e)<addD(today(),-1))e=easter(y+1);return iso2(e)}
function nextFarsang(){var y=new Date().getFullYear(),e=easter(y);e.setDate(e.getDate()-47);if(iso2(e)<today()){e=easter(y+1);e.setDate(e.getDate()-47)}return iso2(e)}
function share(title,text){if(navigator.share){navigator.share({title:title,text:text}).catch(function(){});return}
  try{navigator.clipboard.writeText(text).then(function(){toast("Kimásolva, beillesztheted bárhova.")},function(){toast("Nem sikerült a másolás.")})}catch(e){toast("Nem sikerült a másolás.")}}

/* ================= ALKALMAK ================= */
var OCC=[
{id:"karacsony",t:"Karácsony",ic:"cake",date:function(){return nextMD(12,24)},meal:1,
 menus:[["Szenteste (december 24.)",["unn-01","kar-01","kar-02","des-13","kar-03","kar-04"]],
        ["Karácsony első napja",["hk-01","unn-02","hus-30","kar-09","hk-23","kar-08"]],
        ["Karácsony második napja",["hid-03","hid-01","unn-03","hk-24","kar-05"]],
        ["Süteményes tál és meleg italok",["kar-05","kar-06","kar-07","hk-23","kar-10","kar-11"]]],
 plan:[[-6,"Bevásárlás a tartós dolgokból: liszt, cukor, mák, dió, mazsola, méz, savanyú káposzta, ital."],
       [-5,"Mézeskalács sütése – dobozban 2-3 nap alatt puhul meg."],[-4,"Linzer és hókifli – dobozban 1-2 hétig eláll."],
       [-3,"Bejgli és zserbó: két nap pihenés után szeletelhető a legszebben."],
       [-2,"Friss áru: hal (ponty), hús, tejföl, tojás. A halat aznap vagy másnap használd fel, vagy fagyaszd."],
       [-1,"Töltött káposzta (másnapra érik össze); a salátához a burgonya, répa és tojás megfőzése."],
       [0,"Délelőtt: halászlé alaplé, francia saláta összeállítása. Este: a pontyot közvetlenül vacsora előtt rántsd."],
       [1,"Húsleves reggel feltéve, a töltött káposzta csak újramelegítve (forrón, 75 °C fölött)."]],
 tips:["A bejgli és a töltött káposzta előre elkészítve finomabb – ne a szenteste napjára hagyd.",
       "Hal: a ponty húsa a bevagdosástól (patkolás) lesz szálkamentesen ehető.",
       "Maradék: a töltött káposzta 3-4 napig eláll a hűtőben, adagonként fagyasztható.",
       "A majonézes salátát legfeljebb 2 órát hagyd az asztalon, utána vissza a hűtőbe.",
       "Gyerekeknek forralt bor helyett forró gyümölcspuncs; a szaloncukrot csak a vacsora után.",
       "Ajándéknak: díszített mézeskalács, dobozban linzer, hókifli."]},
{id:"szilveszter",t:"Szilveszter és újév",ic:"cup",date:function(){return nextMD(12,31)},meal:0,
 menus:[["Szilveszteri falatok",["par-01","hk-15","par-08","par-17","par-12","hid-01","par-11"]],
        ["Éjfélkor",["mini-27","lev-19","sze-14"]],
        ["Újév napja – szerencsehozók",["foz-04","lev-07","hk-13","hus-01"]]],
 plan:[[-2,"Kocsonya főzése (egy éjszaka kell a dermedéshez), pogácsa sütése."],[-1,"Lencse beáztatása, italok behűtése."],
       [0,"Délután: falatok, nyársak, kaszinótojás. Éjfél előtt: virsli, korhelyleves."],[1,"Újév: lencse, malachús vagy kocsonya."]],
 tips:["Hagyomány: újévkor lencse (pénz), malac (előre túr), szárnyast és halat nem esznek – „elrepül, elúszik a szerencse”.",
       "A falatok egy részét tedd hűtőbe, és fél óránként pótold a tálat – frissebb marad.",
       "Pezsgő: 1 palack (0,75 l) kb. 6-7 pohár koccintásra.",
       "Gyerekeknek: gyümölcsös szörp pezsgőspohárban – ők is koccinthatnak."]},
{id:"husvet",t:"Húsvét",ic:"egg",date:nextEaster,meal:1,
 menus:[["Húsvétvasárnap",["unn-06","hid-03","sal-04","huh-001","hk-20"]],
        ["Húsvéthétfő",["hk-01","lev-14","hus-03","des-03","sze-17"]]],
 plan:[[-2,"Sonka áztatása (ha nagyon sós), kalács vagy kakaós csiga sütése."],[-1,"Sonka főzése a tojással; a főzőlé a savanyú tojáslevesnek kell."],
       [0,"Reggel: sonkatál tormával, kaláccsal, főtt tojással."],[1,"A maradék sonkából sonkatekercs, rakott ételek."]],
 tips:["A sonka főzőlevét ne öntsd ki: savanyú tojásleveshez, bablevest alapnak jó.",
       "A festett tojás hűtőben 1 hétig eláll; ha a héja megrepedt, 2-3 napig.",
       "Torma: frissen reszelve erősebb, kevés tejföllel szelídíthető."]},
{id:"farsang",t:"Farsang",ic:"cake",date:nextFarsang,meal:0,
 menus:[["Farsangi asztal",["hk-21","par-02","par-03","par-14","par-06"]]],
 plan:[[-1,"Bevásárlás: liszt, élesztő, tej, lekvár, olaj."],[0,"Fánk: a tészta 1,5-2 óra kelés, sütés közvetlenül a buli előtt."]],
 tips:["A fánkot fedő alatt kezdve sütve lesz szép világos szalagja.","Jelmezes zsúrra apró, kézzel ehető falatok a legjobbak."]},
{id:"szulinap-gyerek",t:"Szülinap – gyerekzsúr",ic:"heart",date:null,meal:0,party:"k",
 menus:[["Sós falatok",["par-02","par-03","par-07","par-16","par-01","par-05"]],
        ["Édességek",["par-09","par-10","par-15","par-06","des-12"]],
        ["Innivaló",["par-14","kar-11"]]],
 plan:[[-3,"Meghívók, allergiák begyűjtése (tej, glutén, tojás, mogyoró)."],[-1,"Torta vagy hűtőtorta elkészítése, sós csigák előkészítése."],
       [0,"A zsúr előtt 1 órával: csigák sütése, gyümölcsnyárs, szendvicsek. Torta a zsúr közepén, gyertyával."]],
 tips:["Kérdezd meg előre a szülőket az ételallergiákról, és jelöld a tálakat (pl. „tejmentes”).",
       "4 év alatt NEM: egész mogyoró, pattogatott kukorica, kemény cukorka; a szőlőt és a koktélparadicsomot hosszában negyedeld.",
       "Kézzel ehető, falatnyi méret: kevesebb maszat, több evés.",
       "Poharakra írd fel a neveket – kevesebb pohár fogy, kevesebb a kiöntött üdítő.",
       "A torta 1 szelet/fő + 10%; ha a szülők is maradnak, nekik is számolj.",
       "Cukros dolgok és ital ne a zsúr elején: előbb a sós falatok.",
       "2 óra zsúr bőven elég 3-6 éveseknek; utána jön a fáradtság és a sírás."]},
{id:"szulinap-felnott",t:"Szülinap – felnőtt buli",ic:"cup",date:null,meal:0,party:"a",
 menus:[["Sós falatok, rágcsák",["par-12","hk-15","hk-14","par-08","par-17","par-11","par-13"]],
        ["Meleg étel",["hus-01","hus-14","hk-02","unn-03","egy-02"]],
        ["Édes",["par-09","hk-22","hk-23"]],
        ["Ital",["par-14","kar-10"]]],
 plan:[[-2,"Pogácsa sütése (lefagyasztva is jó, sütés előtt), italok bevásárlása."],[-1,"Pörkölt vagy rakott káposzta – másnapra érik; torta elkészítése."],
       [0,"Délután: tepertőkrém, nyársak, kaszinótojás; a meleg étel egy órával érkezés előtt kerül a tűzre."]],
 tips:["Állófogadásnál fejenként 10-12 falat kell az első két órára, utána óránként 4-6.",
       "Ha van meleg étel is, a rágcsa fele elég.",
       "Alkoholmentes italt is mindig tegyél ki (víz, limonádé) – fejenként legalább 0,5 l.",
       "A pörkölt egy nappal előtte elkészítve finomabb, és a buli napján nem kell főzni.",
       "Jelöld a mogyorós és csípős falatokat."]}];
function occ(id){return OCC.filter(function(o){return o.id===id})[0]||OCC[0]}

/* ================= ÁLLAPOT ================= */
var st=lget(KS,null);
function S(){if(!st){var s=window.set||{ad:2,te:0,ch:0};st={occ:null,n:Math.max(2,Math.round((s.ad||2)+(s.te||0))),k:Math.round(s.ch||0),h:3,alc:0,date:{}}}st.date=st.date||{};return st}
function save(){lset(KS,st)}
U.defaultOcc=function(){var md=(new Date().getMonth()+1)*100+new Date().getDate(),de=Math.round((new Date(nextEaster()+"T00:00:00")-new Date(today()+"T00:00:00"))/864e5);
  if(md>=1115&&md<=1226)return"karacsony";if(md>=1227||md<=102)return"szilveszter";if(de>=0&&de<=21)return"husvet";
  var df=Math.round((new Date(nextFarsang()+"T00:00:00")-new Date(today()+"T00:00:00"))/864e5);if(df>=0&&df<=14)return"farsang";return"szulinap-gyerek"};
function eaters(){var s=S();return s.n+s.k*0.5}
function occDate(o){var s=S();if(o.date)return o.date();var d=s.date[o.id];if(!d||d<today()){d=plus(7);s.date[o.id]=d}return d}

/* ================= RÁGCSA-KALKULÁTOR ================= */
/* fejenként 2 órára; [név, felnőtt, gyerek, egység, megjegyzés] */
var SNK=[["Chips",40,30,"g",""],["Sós perec",30,20,"g",""],["Sósstangli",20,15,"g",""],["Földimogyoró",30,0,"g","csak felnőtteknek"],
  ["Popcorn kukorica",8,10,"g","4 év felett"],["Gumicukor",0,30,"g",""],["Szőlő",80,120,"g","gyerekeknek negyedelve"],["Sajt",40,20,"g","falatnak"],
  ["Üdítő",0.4,0.4,"l",""],["Ásványvíz",0.5,0.3,"l",""],["Szörp",0,0.05,"l","hígítva kb. 0,4 l"]];
var ALC={karacsony:[["Vörösbor",0.3,"l"]],szilveszter:[["Pezsgő",0.25,"l"],["Sör",0.5,"l"]],"szulinap-felnott":[["Sör",1,"l"],["Vörösbor",0.25,"l"]],husvet:[["Vörösbor",0.2,"l"]],farsang:[["Sör",0.5,"l"]]};
function calc(o){var s=S(),f=Math.max(0.7,1+0.35*(s.h-2)),mealF=o.meal?0.4:1,out=[];
  SNK.forEach(function(x){var q=(x[1]*s.n+x[2]*s.k)*f*(/^(Üdítő|Ásványvíz|Szörp)$/.test(x[0])?1:mealF);if(!(q>0))return;
    if(x[0]==="Szaloncukor")return;q=x[3]==="l"?Math.ceil(q*2)/2:Math.ceil(q/10)*10;out.push({n:x[0],q:q,u:x[3],m:x[4]})});
  if(o.id==="karacsony")out.push({n:"Szaloncukor",q:Math.ceil((s.n+s.k)*40/10)*10,u:"g",m:"fára és az asztalra"});
  if(s.alc&&ALC[o.id]&&s.n>0)ALC[o.id].forEach(function(a){out.push({n:a[0],q:Math.ceil(a[1]*s.n*f*2)/2,u:a[2],m:"felnőtteknek"})});
  return out}
function cakeTip(){var s=S(),sl=Math.ceil((s.n+s.k)*1.1);return sl<=8?"18 cm-es forma (8-10 szelet)":sl<=14?"22-24 cm-es forma (12-16 szelet)":sl<=20?"26-28 cm-es forma (16-20 szelet)":"tepsis torta vagy két kisebb torta ("+sl+" szelet)"}

/* ================= NÉZET ================= */
function mx(title,html){var d=$("mx");$("mxt").textContent=title;d.querySelector(".dbody").innerHTML=html;if(!d.open)d.showModal();return d}
function dishRow(id){var r=recById(id);if(!r)return"";var c=check(r),P=eaters(),cost=recCost(r,c,P/r.adag);
  return '<button type="button" class="ux-dish" data-uo="'+r.id+'"><span class="ic">'+ic(RICO[r.cat]||"pot")+'</span><span class="ux-dt"><b>'+esc(r.nev)+"</b><small>"+r.ido_perc+" perc"+(cost.any?" · kb. "+ft(cheap(cost.full)):"")+'</small></span>'+
    (c.bl?'<span class="badge warn">diéta</span>':c.ok?'<span class="badge ok">✓ megvan</span>':'<span class="badge warn" title="ennyi hozzávaló hiányzik">hiány: '+c.miss.length+"</span>")+"</button>"}
U.open=function(id){var s=S();if(id)s.occ=id;if(!s.occ)s.occ=U.defaultOcc();save();render()};
function render(){var s=S(),o=occ(s.occ),d=occDate(o),left=Math.round((new Date(d+"T00:00:00")-new Date(today()+"T00:00:00"))/864e5),h="";
  h+='<div class="ux-occ" role="tablist" aria-label="Alkalom">'+OCC.map(function(x){return '<button type="button" role="tab" class="ux-oc'+(x.id===o.id?" on":"")+'" aria-selected="'+(x.id===o.id)+'" data-uocc="'+x.id+'"><span class="ic">'+ic(x.ic)+"</span>"+esc(x.t)+"</button>"}).join("")+"</div>";
  h+='<div class="ux-hero"><div class="ux-cd pf">'+(left===0?"MA!":left===1?"HOLNAP":"még "+left+" nap")+'</div><div><b>'+esc(o.t)+"</b><br><span class=\"q small\">"+esc(dlong(d))+"</span></div></div>";
  if(!o.date)h+='<label for="uxd">Mikor lesz?</label><input id="uxd" type="date" value="'+esc(d)+'">';
  h+='<div class="ux-steps"><div class="prow"><div><b>Felnőtt</b><div class="q small">a családdal együtt</div></div><div class="step"><button type="button" data-ug="n,-1" aria-label="Kevesebb felnőtt">−</button><output>'+s.n+'</output><button type="button" data-ug="n,1" aria-label="Több felnőtt">+</button></div></div>'+
    '<div class="prow"><div><b>Gyerek</b><div class="q small">fél adag</div></div><div class="step"><button type="button" data-ug="k,-1" aria-label="Kevesebb gyerek">−</button><output>'+s.k+'</output><button type="button" data-ug="k,1" aria-label="Több gyerek">+</button></div></div>'+
    '<div class="prow"><div><b>Időtartam</b><div class="q small">óra</div></div><div class="step"><button type="button" data-ug="h,-1" aria-label="Rövidebb">−</button><output>'+s.h+'</output><button type="button" data-ug="h,1" aria-label="Hosszabb">+</button></div></div></div>';
  h+='<div class="q small">Fogásonként <b>'+nf(eaters())+" adaggal</b> számolok.</div>";
  o.menus.forEach(function(m,i){h+='<div class="sec">'+esc(m[0])+'</div><div class="ux-list">'+m[1].map(dishRow).join("")+'</div><div class="btns"><button type="button" class="btn sm t" data-ushop="'+i+'">Hiányzók a listára</button></div>'});
  /* rágcsák */
  var L=calc(o);h+='<div class="sec">Rágcsa- és italkalkulátor</div><div class="q small">'+(o.meal?"Étkezés mellé, csökkentett mennyiség. ":"")+s.n+" felnőtt, "+s.k+" gyerek, "+s.h+' óra alapján.</div>';
  h+='<div class="ux-calc">'+L.map(function(x,k){return '<label class="ux-ci"><input type="checkbox" data-uc="'+k+'" checked><span><b>'+esc(x.n)+'</b>'+(x.m?' <small class="q">('+esc(x.m)+")</small>":"")+'</span><b class="pf">'+nf(x.q)+" "+x.u+"</b></label>"}).join("")+"</div>";
  if(ALC[o.id])h+='<label class="ux-ci"><input type="checkbox" id="uxalc"'+(s.alc?" checked":"")+'><span>Alkoholos ital is (csak felnőtteknek)</span></label>';
  h+='<div class="btns"><button type="button" class="btn g" id="uxcs">Kijelöltek a listára</button></div>';
  if(o.party||o.id==="karacsony")h+='<div class="ux-tip"><b>Torta:</b> '+esc(cakeTip())+"</div>";
  /* időterv */
  h+='<div class="sec">Időterv</div><ol class="ux-plan">'+o.plan.map(function(p){var pd=addD(d,p[0]),cls=pd===today()?"now":pd<today()?"done":"";return '<li class="'+cls+'"><b>'+esc(p[0]===0?"A nagy nap":new Date(pd+"T00:00:00").toLocaleDateString("hu-HU",{month:"short",day:"numeric",weekday:"short"}))+"</b> "+esc(p[1])+"</li>"}).join("")+"</ol>";
  h+='<div class="sec">Okosságok</div><ul class="ux-tips">'+o.tips.map(function(t){return"<li>"+esc(t)+"</li>"}).join("")+"</ul>";
  h+='<div class="btns"><button type="button" class="btn p" id="uxsh">Menü küldése</button><button type="button" class="btn p" id="uxkb">Konyhai alapok</button></div>';
  mx("Ünnepi menü",h);
  var B=$("mx").querySelector(".dbody");
  B.querySelectorAll("[data-uocc]").forEach(function(b){b.onclick=function(){s.occ=b.dataset.uocc;save();render();B.scrollTop=0}});
  B.querySelectorAll("[data-ug]").forEach(function(b){b.onclick=function(){var p=b.dataset.ug.split(","),k=p[0],mn=k==="h"?1:0,mxv=k==="h"?12:60;s[k]=Math.max(k==="n"?1:mn,Math.min(mxv,s[k]+(+p[1])));save();var y=B.scrollTop;render();B.scrollTop=y}});
  if($("uxd"))$("uxd").onchange=function(){s.date[o.id]=this.value||plus(7);save();render()};
  if($("uxalc"))$("uxalc").onchange=function(){s.alc=this.checked?1:0;save();var y=B.scrollTop;render();B.scrollTop=y};
  B.querySelectorAll("[data-ushop]").forEach(function(b){b.onclick=function(){var n=0,P=eaters();o.menus[+b.dataset.ushop][1].forEach(function(id){var r=recById(id);if(!r)return;var c=check(r);if(c.miss.length&&!c.bl){toList(r,c,P/r.adag);n+=c.miss.length}});
    b.disabled=true;b.textContent=n?"Felírva ("+n+")":"Minden megvan";toast(n?n+" hiányzó tétel a bevásárlólistán.":"Ehhez minden megvan itthon.")}});
  $("uxcs").onclick=function(){var n=0;L.forEach(function(x,k){var cb=B.querySelector('[data-uc="'+k+'"]');if(cb&&cb.checked){addShop(x.n,x.q,x.u);n++}});this.disabled=true;this.textContent="Felírva ("+n+")";toast(n+" tétel a bevásárlólistán.")};
  $("uxsh").onclick=function(){share(o.t,o.t+" – "+dlong(d)+"\n\n"+o.menus.map(function(m){return m[0]+":\n"+m[1].map(function(id){var r=recById(id);return r?"• "+r.nev:""}).filter(Boolean).join("\n")}).join("\n\n"))};
  $("uxkb").onclick=function(){U.kb()}}
document.addEventListener("click",function(e){var b=e.target.closest("[data-uo]");if(b){e.preventDefault();openRecipe(b.dataset.uo)}});

/* ================= KONYHAI TUDÁSTÁR ================= */
function kbEntry(t,open){return '<details class="ux-kb"'+(open?" open":"")+' id="kb-'+t.id+'"><summary><b>'+esc(t.t)+'</b><small class="q">'+esc(t.g)+"</small></summary><ul>"+t.x.map(function(x){return"<li>"+esc(x)+"</li>"}).join("")+"</ul></details>"}
U.kb=function(focus){if(!window.TUDAS)return;var groups={};TUDAS.forEach(function(t){(groups[t.g]=groups[t.g]||[]).push(t)});
  var h='<h3 style="margin:0 0 6px">Konyhai alapok</h3><div class="q small">Ételkészítési alapismeretek röviden: alapműveletek, sűrítés, tészták, biztonságos hőmérséklet, tárolás, mértékek.</div><input id="kbq" type="search" placeholder="Keresés, pl. rántás, tojás, fagyasztás" autocomplete="off" aria-label="Keresés a tudástárban"><div id="kbl"></div>';
  var d=$("kbd");d.classList.add("kbfull");d.querySelector(".dbody").innerHTML=h;if(!d.open)d.showModal();
  function draw(q){q=norm(q||"");var o="";Object.keys(groups).forEach(function(g){var L=groups[g].filter(function(t){return !q||norm(t.t+" "+t.x.join(" ")).indexOf(q)>=0});if(L.length)o+='<div class="sec">'+esc(g)+"</div>"+L.map(function(t){return kbEntry(t,!!q||t.id===focus)}).join("")});$("kbl").innerHTML=o||'<div class="empty">Nincs találat.</div>'}
  draw("");$("kbq").oninput=function(){draw(this.value)};
  if(focus){var el=$("kb-"+focus);if(el)setTimeout(function(){el.scrollIntoView({block:"start"})},50)}};
function kbPop(id){var t=(window.TUDAS||[]).filter(function(x){return x.id===id})[0];if(!t)return;var d=$("kbd");
  d.querySelector(".dbody").innerHTML='<div class="q small">'+esc(t.g)+'</div><h3 style="margin:2px 0 8px">'+esc(t.t)+'</h3><ul class="ux-tips">'+t.x.map(function(x){return"<li>"+esc(x)+"</li>"}).join("")+'</ul><div class="btns"><button type="button" class="btn p sm" id="kball">Összes konyhai alap</button></div>';
  d.classList.remove("kbfull");if(!d.open)d.showModal();$("kball").onclick=function(){U.kb(id)}}

/* ---- recept nézet: konyhai alapok és maghőmérséklet ---- */
var POULTRY=/csirke|pulyka|kacsa|liba|tyuk/;
function coreTemp(r){var keys=[];r.hozzavalok.forEach(function(h){if(!h.o)keys=keys.concat(h.k)});var k=norm(keys.join(" "));
  if(/daralt/.test(k))return["Darált hús","legalább 72 °C, rózsaszín rész nem maradhat"];
  if(POULTRY.test(k)&&!/sonka|felvagott/.test(k))return["Baromfi","legalább 74 °C a legvastagabb részen"];
  if(/sertes|karaj|tarja|csulok|oldalas|lapocka|hurka|kolbasz/.test(k)&&r.cat!=="leves"&&!/fustolt kolbasz/.test(k))return["Sertés","68-70 °C"];
  if(/ponty|halfile|lazac|harcsa/.test(k))return["Hal","60-63 °C, a hús lemezekre válik"];
  return null}
U.terms=function(r){if(!window.TUDAS)return[];var tx=norm(r.nev+" "+r.lepesek.join(" ")+" "+r.kritikus.join(" "));
  return TUDAS.filter(function(t){return t.k.some(function(k){return tx.indexOf(k)>=0})}).slice(0,5)};
var prevExtra=FX.recipeExtra,prevBind=FX.recipeBind;
FX.recipeExtra=function(r,c){var o=prevExtra?prevExtra(r,c):"",T=U.terms(r),ct=(r.cat==="hus"||r.cat==="hal"||r.cat==="egyeb"||r.cat==="szendvics")&&!r.hideg?coreTemp(r):null;
  if(T.length||ct){o+='<div class="ux-know"><div class="ux-kh"><span class="ic">'+ic("book")+"</span><b>Konyhai alapok ehhez</b></div>";
    if(ct)o+='<div class="ux-ct">🌡 <b>'+esc(ct[0])+" maghőmérséklet:</b> "+esc(ct[1])+"</div>";
    if(T.length)o+='<div class="chips wrapc">'+T.map(function(t){return '<button type="button" class="chip" data-kb="'+t.id+'">'+esc(t.t)+"</button>"}).join("")+"</div>";o+="</div>"}
  return o};
FX.recipeBind=function(r,c){if(prevBind)prevBind(r,c);$("rdb").querySelectorAll("[data-kb]").forEach(function(b){b.onclick=function(){kbPop(b.dataset.kb)}})};

/* ================= HELY-FELISMERÉS: HŰTŐ / FAGYASZTÓ / SPÁJZ ================= */
var RX_Z=/fagyaszt|mirelit|jegkrem|fagyi|jeges|\bfagy\b|frozen|gyorsfagy/,
    RX_DAIRY=/\btej\b|tejfol|tejszin|joghurt|kefir|turo|sajt|trappista|gouda|edami|mozzarella|vaj\b|margarin|kremsajt|\bhus\b|csirke|sertes|marha|pulyka|kacsa|daralt|karaj|tarja|comb|mell|filet?\b|lazac|ponty|harcsa|sonka|szalami|kolbasz|virsli|parizsi|felvagott|bacon|szalonna|majkrem|tojas/,
    RX_PS=/konzerv|\bkonz\b|orolt|fuszer|szaritott|aszalt|chips|keksz|csoki|csokolade|ostya|perec|stangli|ropi|cukorka|szaloncukor|gumicukor|lekvar|befott|savanyu|ecet|olaj|liszt|cukor|rizs|teszta|spagetti|makaroni|kave|\btea\b|kakao|udito|asvanyviz|szorp|\bsor\b|\bbor\b|pezsgo|gyumolcsle|leveskocka|pudingpor|sutopor|zabpehely|muzli|mogyoro|\bdio\b|mandula|mazsola|\bmez\b|\bbab\b|lencse|csicseri/,
    RX_F=/salata|uborka|paradicsom|paprika|gomba|retek|spenot|brokkoli|karfiol|cukkini|eper|szolo|malna|afonya|alma|korte|citrom|narancs|mandarin|kivi|barack|majonez|hummusz|pesto|friss|eleszto|leveles|retes|torta|sutemeny|puding\b|desszert/,
    RX_P=/kenyer|zsemle|kifli|kalacs|bagett|tortilla|burgonya|krumpli|hagyma|fokhagyma|banan|sutotok|ananasz/;
U.guessLoc=function(name){var c=find(name);if(c)return c.l;var n=norm(name);
  if(RX_Z.test(n))return"freezer";if(/uht|tartos/.test(n))return"pantry";if(RX_DAIRY.test(n))return"fridge";if(RX_PS.test(n))return"pantry";
  if(RX_P.test(n))return"pantry";if(RX_F.test(n))return"fridge";return"pantry"};
U.guessDays=function(loc){return loc==="freezer"?90:loc==="fridge"?5:120};
/* új termék felvételekor: ismeretlen névnél is javasol helyet, amíg a felhasználó nem választott maga */
var flTouched=false;
function bindAdd(){var fn=$("fn"),fl=$("fl"),dl=$("dlg");if(!fn||!fl||!dl)return;
  fl.addEventListener("change",function(){flTouched=true});dl.addEventListener("close",function(){flTouched=false});
  fn.addEventListener("change",function(){if(window.cur||flTouched)return;var v=fn.value.trim();if(!v||find(v))return;var g=U.guessLoc(v);if(fl.value!==g){fl.value=g;
    var e=$("fe");if(e&&e.value===plus(7))e.value=plus(U.guessDays(g))}})}

/* ================= BEKÖTÉS ================= */
function bind(){var b;if((b=$("tholi")))b.onclick=function(){U.open()};if((b=$("tparty")))b.onclick=function(){var s=S();U.open(s.occ&&/^szulinap/.test(s.occ)?s.occ:"szulinap-gyerek")};
  if((b=$("tkb")))b.onclick=function(){U.kb()};bindAdd()}
bind();
})();
