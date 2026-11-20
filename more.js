/* Mi legyen a kaja? – további bővítmények (v1.12): ár-előzmények, költségkeret-figyelő és havi kimutatás, megosztás,
   előfőzés (meal prep), naptár, statisztika, vendégvárás, recept beillesztése szövegből, napi pillanatkép-mentés,
   gyorsindítók (Android ikon hosszan nyomva). Az app.js a window.MORE horgokon keresztül hívja. */
var arhist=ld("kaja.arhist.v1",{}),fogyas=ld("kaja.fogyas.v1",[]),vendeg=ld("kaja.vendeg.v1",null);
(function(){
var M={};window.MORE=M;
var KM={arhist:"kaja.arhist.v1",fogyas:"kaja.fogyas.v1",vendeg:"kaja.vendeg.v1",budwarn:"kajax.budwarn",bkrem:"kajax.bkrem"};
function today(){return plus(0)}
function cheap(a){var b=(a||[]).filter(function(x){return x>0});return b.length?Math.min.apply(null,b):0}
function lget(k){try{return localStorage.getItem(k)}catch(e){return null}}
function lset(k,v){try{localStorage.setItem(k,v)}catch(e){}}
function mx(title,html){var d=$("mx");$("mxt").textContent=title;d.querySelector(".dbody").innerHTML=html;if(!d.open)d.showModal();return d}
function pct(o,p){return o>0?Math.round((p-o)/o*100):0}
function dlong(d){return new Date(d+"T00:00:00").toLocaleDateString("hu-HU",{month:"long",day:"numeric",weekday:"long"})}
var MCI={hus:"meat",hal:"fish",zoldseg:"veg",teszta:"pasta",leves:"pot",hideg:"salad",desszert:"cake",egyeb:"rice"};

/* ================= MEGOSZTÁS ================= */
function copyText(text){var p=navigator.clipboard?navigator.clipboard.writeText(text):Promise.reject();
  p.then(function(){toast("Kimásolva, illeszd be az üzenetbe.")}).catch(function(){mx("Megosztás",'<textarea readonly class="mxshare">'+esc(text)+'</textarea><div class="q small">Jelöld ki és másold ki.</div>')})}
function share(title,text){if(navigator.share){navigator.share({title:title,text:text}).catch(function(e){if(e&&e.name!=="AbortError")copyText(text)});return}copyText(text)}
M.share=share;
function recipeText(r){var P=window.rdP||portions(),f=P/r.adag;
  return r.nev+" ("+nf(P)+" adag, "+r.ido_perc+" perc)\n\nHozzávalók:\n"+r.hozzavalok.map(function(h){var q=fmtR(h,f);return "- "+(q?q+" ":"")+h.nev+(h.o?" (nem kötelező)":"")}).join("\n")+
    (r.lepesek.length?"\n\nElkészítés:\n"+r.lepesek.map(function(s,i){return (i+1)+". "+s}).join("\n"):"")+(r.talalas?"\n\nTálalás: "+r.talalas:"")+"\n\n– Mi legyen a kaja?"}
function listText(){var open=shop.filter(function(s){return !s.done});if(!open.length)return "";var g={};
  open.forEach(function(s){var c=find(s.n),k=c?(CATN[c.c]||"Egyéb"):"Egyéb";(g[k]=g[k]||[]).push(s)});
  var t=[0,0,0];open.forEach(function(s){var p=lineCost(s);if(p)for(var i=0;i<3;i++)t[i]+=p[i]});var bi=minI(t);
  return "Bevásárlólista ("+today()+")\n"+Object.keys(g).sort(function(a,b){return a.localeCompare(b,"hu")}).map(function(k){return "\n"+k+":\n"+g[k].map(function(s){return "☐ "+s.n+" – "+nf(s.q)+" "+s.u}).join("\n")}).join("\n")+
    (t[bi]>0?"\n\nBecsült összeg: kb. "+ft(t[bi])+" ("+SHOPS[bi][1]+")":"")}
M.recipeExtra=function(r,c){return '<div class="btns"><button type="button" class="btn t sm" id="mxshr">Recept küldése</button>'+(c.miss.length?'<button type="button" class="btn sm" id="mxshm">Hiányzók küldése</button>':"")+"</div>"};
M.recipeBind=function(r,c){if($("mxshr"))$("mxshr").onclick=function(){share(r.nev,recipeText(r))};
  if($("mxshm"))$("mxshm").onclick=function(){share("Ezt kéne venni","Ehhez: "+r.nev+"\n"+c.miss.map(function(h){var q=fmtR(h,(window.rdP||portions())/r.adag);return "☐ "+h.nev+(q?" – "+q:"")}).join("\n"))}};

/* ================= ÁR-ELŐZMÉNYEK ================= */
var lastP=JSON.stringify(prices);
function basePr(n){var c=find(n);return c?c.pr:[0,0,0]}
function logPrices(nv){var old;try{old=JSON.parse(lastP)}catch(e){old={}}var names={},ch=0;
  Object.keys(old).concat(Object.keys(nv)).forEach(function(n){names[n]=1});
  Object.keys(names).forEach(function(n){var a=old[n]||basePr(n),b=nv[n]||basePr(n);
    for(var i=0;i<3;i++){var o=Math.round(a[i]||0),p=Math.round(b[i]||0);if(o!==p&&p>0){(arhist[n]=arhist[n]||[]).push({d:today(),s:i,p:p,o:o});ch++}}
    if(arhist[n]&&arhist[n].length>30)arhist[n]=arhist[n].slice(-30)});
  lastP=JSON.stringify(nv);if(ch)_sv(KM.arhist,arhist)}
/* a legutóbbi (60 napon belüli) változás boltonként; ebből számolom a drágulást */
function changes(n){var h=arhist[n]||[],lim=plus(-60),last={};h.forEach(function(e){if(e.d>=lim)last[e.s]=e});return Object.keys(last).map(function(k){return last[k]})}
function upOf(n){var c=find(n);if(!c)return 0;var m=0;changes(c.n).forEach(function(e){var x=pct(e.o,e.p);if(x>m)m=x});return m}
M.upBadge=function(n){var u=upOf(n);return u>=3?' <span class="badge bad">▲ '+u+"% drágult</span>":""};
M.priceExtra=function(c){var h=(arhist[c.n]||[]).slice(-8).reverse();
  return '<div class="sec">Ár-előzmények</div>'+(h.length?h.map(function(e){var x=pct(e.o,e.p);return '<div class="li"><span class="lt">'+esc(e.d)+" · "+SHOPS[e.s][1]+": "+(e.o?ft(e.o).replace(" Ft","")+" → ":"")+ft(e.p)+'</span><span class="badge '+(x>0?"bad":"ok")+'">'+(x>0?"▲ +":x<0?"▼ ":"")+x+"%</span></div>"}).join(""):
    '<div class="q small">Még nincs változás. Ha átírod az árat, vagy beolvasol egy blokkot, itt látod, mennyit drágult vagy olcsóbbodott.</div>')};
function drawUp(){var el=$("mxup");if(!el)return;var up=[],dn=[];
  Object.keys(arhist).forEach(function(n){changes(n).forEach(function(e){var x=pct(e.o,e.p);if(x>=3)up.push([x,n,e]);else if(x<=-3)dn.push([x,n,e])})});
  up.sort(function(a,b){return b[0]-a[0]});dn.sort(function(a,b){return a[0]-b[0]});el.hidden=!up.length&&!dn.length;if(el.hidden)return;
  function row(a){return '<div class="li"><span class="ic">'+ic(ico(a[1]))+'</span><span class="lt"><b>'+esc(a[1])+'</b><br><span class="q small">'+SHOPS[a[2].s][1]+": "+ft(a[2].o)+" → "+ft(a[2].p)+" ("+esc(a[2].d)+')</span></span><span class="badge '+(a[0]>0?"bad":"ok")+'">'+(a[0]>0?"+":"")+a[0]+"%</span></div>"}
  el.innerHTML='<h2><span class="ic">'+ic("chart")+'</span>Árváltozások (60 nap)</h2>'+(up.length?'<div class="dh">Drágult</div>'+up.slice(0,8).map(row).join(""):"")+(dn.length?'<div class="dh">Olcsóbb lett</div>'+dn.slice(0,5).map(row).join(""):"")+
    '<div class="q small">A saját átírásaid és a beolvasott blokkok alapján.</div>'}

/* ================= KÖLTSÉGKERET-FIGYELŐ ================= */
function budgetCheck(){if(!bud)return;var w=wk(),m=today().slice(0,7),bw;try{bw=JSON.parse(lget(KM.budwarn)||"{}")}catch(e){bw={}}var msg="";
  [["w",sum(w[0],w[1]),bud.w,w[0],"heti"],["m",sum(m+"-01",m+"-31"),bud.m,m,"havi"]].forEach(function(x){if(!(x[2]>0))return;var r=x[1]/x[2],lv=r>=1?100:r>=0.8?80:0;if(!lv)return;
    var key=x[3]+"|"+lv;if(bw[x[0]]===key)return;bw[x[0]]=key;if(!msg)msg=lv===100?"Túllépted a "+x[4]+" keretet "+ft(x[1]-x[2])+"-tal!":"Figyelem: a "+x[4]+" keret "+Math.round(r*100)+"%-át elköltötted, "+ft(x[2]-x[1])+" maradt."});
  lset(KM.budwarn,JSON.stringify(bw));if(msg)setTimeout(function(){toast(msg)},500)}
var _sv=window.sv;window.sv=function(k,v){if(k===K.price){try{logPrices(v)}catch(e){}}var r=_sv(k,v);if(k===K.exps){try{budgetCheck()}catch(e){}}return r};
function mkey(off){var d=new Date();d.setDate(1);d.setMonth(d.getMonth()+off);return iso(d).slice(0,7)}
function mname(k,short){return new Date(k+"-01T00:00:00").toLocaleDateString("hu-HU",short?{month:"short"}:{year:"numeric",month:"long"})}
function drawCostX(){var el=$("mxcost");if(!el)return;var mk=[];for(var i=-5;i<=0;i++)mk.push(mkey(i));
  var v=mk.map(function(k){return sum(k+"-01",k+"-31")}),lim=bud&&bud.m>0?bud.m:0,mxv=Math.max.apply(null,v.concat([lim,1]));
  var now=new Date(),d=now.getDate(),D=new Date(now.getFullYear(),now.getMonth()+1,0).getDate(),ms=v[5],proj=d>=3?ms/d*D:0;
  var bys={};exps.filter(function(x){return x.date.slice(0,7)===mk[5]}).forEach(function(x){var s=x.shop||"Egyéb";bys[s]=(bys[s]||0)+x.a});
  var bk=Object.keys(bys).sort(function(a,b){return bys[b]-bys[a]});
  el.innerHTML='<h2><span class="ic">'+ic("chart")+'</span>Havi költés</h2><div class="mbars">'+mk.map(function(k,i){var h=Math.max(2,v[i]/mxv*100),ov=lim&&v[i]>lim;
      return '<div class="mb'+(i===5?" cur":"")+'"><span class="mbv">'+(v[i]?Math.round(v[i]/1000)+"e":"–")+'</span><span class="mbc">'+(lim?'<i class="mbl" style="bottom:'+(lim/mxv*100)+'%"></i>':"")+'<b style="height:'+h+"%"+(ov?";background:var(--bad)":"")+'"></b></span><small>'+esc(mname(k,true))+"</small></div>"}).join("")+"</div>"+
    (lim?'<div class="q small">A szaggatott vonal a havi keret ('+ft(lim)+").</div>":"")+
    (proj?'<div class="warnbox"'+(lim&&proj>lim?' style="background:#ffd9d2"':"")+'><b>Előrejelzés hónap végére:</b> kb. '+ft(proj)+(lim?(proj>lim?", "+ft(proj-lim)+"-tal a kereten túl. Főzzetek többet a raktárból!":", belefér a keretbe."):"")+' <span class="q small">(eddig '+ft(ms)+", napi átlag "+ft(ms/d)+")</span></div>":"")+
    (bk.length?'<div class="dh">Hol költöttél ebben a hónapban?</div>'+bk.map(function(s){return '<div style="margin:6px 0 2px">'+esc(s)+": <b>"+ft(bys[s])+'</b></div><div class="bar"><b style="width:'+bys[s]/bys[bk[0]]*100+'%"></b></div>'}).join(""):"")}
M.shopExtra=function(t,open){var el=$("mxshop");if(!el)return;var o="";
  if(open&&bud&&bud.w>0){var w=wk(),left=bud.w-sum(w[0],w[1]),bi=minI(t),c=t[bi];
    if(c>0)o+='<div class="warnbox"'+(c>left?' style="background:#ffd9d2"':"")+'>A heti keretből <b>'+ft(Math.max(0,left))+"</b> maradt. "+(c>left?"A lista (kb. "+ft(c)+") nem fér bele, "+ft(c-Math.max(0,left))+" hiányzik.":"A lista után kb. "+ft(left-c)+" marad.")+"</div>"}
  if(open)o+='<div class="btns"><button type="button" class="btn t" id="mxlsh">Lista küldése a családnak</button></div>';
  el.innerHTML=o;if($("mxlsh"))$("mxlsh").onclick=function(){share("Bevásárlólista",listText())}};

/* ================= FOGYÁS NAPLÓ (statisztikához) ================= */
var fogT=null;
M.onConsume=function(n,a,b){fogyas.push({d:today(),n:n,a:Math.round(a*10)/10,b:b});if(fogyas.length>800)fogyas=fogyas.slice(-800);clearTimeout(fogT);fogT=setTimeout(function(){sv(KM.fogyas,fogyas)},50)};

/* ================= ELŐFŐZÉS (MEAL PREP) ================= */
var PREPC={hus:1,hal:1,leves:1,foz:1,teszta:1,zoldseg:1,egyeb:1},prep={days:4,meals:1,sel:[]};
function prepCands(){return allRec().map(check).filter(function(c){return !c.bl&&!c.r.mini&&!isCold(c.r)&&PREPC[c.r.cat]&&(!window.kedv||kedv[c.r.id]!==-1)&&(c.ok||c.miss.length<=2)})
  .sort(function(a,b){return (b.ok-a.ok)||(a.miss.length-b.miss.length)||(b.sc-a.sc)}).slice(0,24)}
function prepPer(){return Math.ceil(portions()*prep.days*prep.meals/Math.max(1,prep.sel.length)*2)/2}
function renderPrep(){var cs=prepCands(),o='<div class="q small">Egy nagy főzés hétvégén, és a hét több napjára is jut belőle. Válassz 1–3 ételt; az első 3 nap adagjai a hűtőbe, a többi a fagyasztóba kerül.</div>';
  o+='<label>Hány napra?</label><div class="chips">'+[2,3,4,5].map(function(n){return '<button type="button" class="chip" data-pd="'+n+'" aria-pressed="'+(prep.days===n)+'">'+n+" nap</button>"}).join("")+"</div>";
  o+='<label>Naponta</label><div class="chips"><button type="button" class="chip" data-pm="1" aria-pressed="'+(prep.meals===1)+'">1 étkezés</button><button type="button" class="chip" data-pm="2" aria-pressed="'+(prep.meals===2)+'">ebéd és vacsora</button></div>';
  prep.sel=prep.sel.filter(function(id){return recById(id)});
  if(prep.sel.length){var per=prepPer(),tot=[0,0,0],mins=0,miss=0;o+='<div class="sec">A terv: összesen '+nf(per*prep.sel.length)+" adag</div>";
    prep.sel.forEach(function(id){var r=recById(id),c=check(r),cost=recCost(r,c,per/r.adag);for(var i=0;i<3;i++)tot[i]+=cost.full[i];mins+=r.ido_perc;miss+=c.miss.length;
      o+='<div class="li"><span class="ic">'+ic(RICO[r.cat]||"pot")+'</span><span class="lt"><a href="#" data-mxo="'+r.id+'"><b>'+esc(r.nev)+"</b></a> – "+nf(per)+' adag<br><span class="q small">'+r.ido_perc+" perc · "+(c.ok?(c.can>=per-0.01?"minden megvan":"csak kb. "+nf(Math.floor(c.can*2)/2)+" adagra elég"):"hiányzik: "+esc(c.miss.map(function(h){return h.nev}).join(", ")))+"</span></span></div>"});
    var bi=minI(tot);o+='<div class="q">Becsült költség: <b>'+ft(tot[bi])+"</b> ("+SHOPS[bi][1]+"), adagonként kb. "+ft(tot[bi]/(per*prep.sel.length))+". Főzési idő összesen kb. "+mins+" perc (párhuzamosan kevesebb).</div>";
    var anyOk=prep.sel.some(function(id){return check(recById(id)).ok});
    o+='<div class="btns">'+(miss?'<button type="button" class="btn t" id="mxpshop">Hiányzók a listára</button>':"")+(anyOk?'<button type="button" class="btn g" id="mxpdo">Megfőztem'+(prep.sel.length>1?" mindet":"")+"</button>":"")+"</div>"+(anyOk?"":'<div class="q small">Ha megvetted a hiányzókat, és a „Kipipáltak a raktárba” gombbal felvetted őket, itt jelölheted, hogy megfőzted.</div>')}
  o+='<div class="sec">Ételek ('+prep.sel.length+'/3)</div><div class="mxpick">'+cs.map(function(c){var on=prep.sel.indexOf(c.r.id)>=0;
    return '<button type="button" class="mxpi'+(on?" on":"")+'" data-ps="'+c.r.id+'" aria-pressed="'+on+'"><span class="ic">'+ic(RICO[c.r.cat]||"pot")+"</span><span><b>"+esc(c.r.nev)+'</b><br><span class="q small">'+c.r.ido_perc+" perc · "+(c.ok?"megvan":"hiányzik "+c.miss.length)+"</span></span></button>"}).join("")+"</div>";
  if(!cs.length)o+='<div class="empty">Most nincs olyan meleg étel, amihez legfeljebb 2 dolog hiányzik. Tölts fel a raktárat!</div>';
  mx("Előfőzés (meal prep)",o);
  if($("mxpshop"))$("mxpshop").onclick=function(){var per=prepPer();prep.sel.forEach(function(id){var r=recById(id),c=check(r);if(c.miss.length)toList(r,c,per/r.adag)});this.disabled=true};
  if($("mxpdo"))$("mxpdo").onclick=doPrep}
function doPrep(){var per=prepPer(),res=[],skip=[];
  prep.sel.forEach(function(id){var r=recById(id),c=check(r);if(!c.ok){skip.push(r.nev);return}var f=Math.min(per,c.can)/r.adag,got=Math.floor(f*r.adag*2)/2;if(!(got>0)){skip.push(r.nev);return}
    consume(r,c,f);var fr=prep.days<=3?got:Math.round(got*3/prep.days*2)/2,fz=Math.round((got-fr)*2)/2;
    items.push({id:uid("i"),n:"Maradék: "+r.nev,q:fr,u:"db",loc:"fridge",exp:plus(3),left:r.id});
    if(fz>0)items.push({id:uid("i"),n:"Maradék: "+r.nev,q:fz,u:"db",loc:"freezer",exp:plus(60),left:r.id});
    res.push(r.nev+": "+nf(fr)+" adag hűtő"+(fz>0?", "+nf(fz)+" adag fagyasztó":""))});
  saveItems();drawAll();prep.sel=[];
  mx("Előfőzés kész",(res.length?'<div class="warnbox" style="background:#d9f5df"><b>Szép munka!</b> Levontam a hozzávalókat, és elraktam az adagokat:<ul>'+res.map(function(x){return "<li>"+esc(x)+"</li>"}).join("")+"</ul>Amikor megeszitek, a Raktár oldalon koppints a „Megettük” gombra.</div>":"")+
    (skip.length?'<div class="warnbox">Kimaradt, mert nincs meg minden hozzávaló: '+esc(skip.join(", "))+"</div>":"")+'<button type="button" class="btn g full" data-close2>Rendben</button>')}

/* ================= VENDÉGVÁRÁS ================= */
var COURSES=[["elo","Előétel, hidegtál",{hidegtal:1,szendvics:1}],["leves","Leves",{leves:1}],["fo","Főétel",{hus:1,hal:1}],["sal","Saláta",{salata:1}],["des","Desszert",{desszert:1}]];
var OCC=["Vendégség","Születésnap","Névnap","Ünnepi ebéd","Családi ebéd","Buli"];
function gst(){if(!vendeg)vendeg={n:4,k:0,occ:"Vendégség",date:plus(7),on:{leves:1,fo:1,des:1},pick:{}};vendeg.pick=vendeg.pick||{};vendeg.on=vendeg.on||{};return vendeg}
function gP(){var g=gst();return portions()+g.n+g.k*0.5}
function gPick(key,avoid){var co=COURSES.filter(function(c){return c[0]===key})[0],cats=Object.assign({},co[2]);if(key==="fo"&&window.diet&&diet.veg){cats={zoldseg:1,foz:1,teszta:1}}
  var ho=FX&&FX.holiday?FX.holiday():null,L=allRec().filter(function(r){return cats[r.cat]&&!r.mini&&r.id!==avoid&&(!window.kedv||kedv[r.id]!==-1)}).map(check).filter(function(c){return !c.bl});
  L.forEach(function(c){c.gs=(c.ok?30:0)-c.miss.length*6+c.sc*0.3+(window.kedv&&kedv[c.r.id]===1?15:0)+(ho&&ho.ids.indexOf(c.r.id)>=0?12:0)+Math.random()*14});
  L.sort(function(a,b){return b.gs-a.gs});return L[0]?L[0].r.id:null}
function gText(){var g=gst(),L=COURSES.filter(function(c){return g.on[c[0]]&&recById(g.pick[c[0]])});
  return g.occ+" – "+dlong(g.date)+"\n\nMenü:\n"+L.map(function(c){return "• "+c[1]+": "+recById(g.pick[c[0]]).nev}).join("\n")+"\n\nSzeretettel várunk!"}
function renderGuest(){var g=gst(),P=gP(),o="";
  o+='<div class="row"><div><label for="mxgo">Alkalom</label><select id="mxgo">'+OCC.map(function(x){return "<option"+(x===g.occ?" selected":"")+">"+x+"</option>"}).join("")+'</select></div><div><label for="mxgd">Mikor?</label><input id="mxgd" type="date" value="'+esc(g.date)+'"></div></div>';
  o+='<div class="prow"><div><b>Vendég felnőtt</b></div><div class="step"><button type="button" data-gn="n,-1" aria-label="Kevesebb felnőtt vendég">−</button><output>'+g.n+'</output><button type="button" data-gn="n,1" aria-label="Több felnőtt vendég">+</button></div></div>';
  o+='<div class="prow"><div><b>Vendég gyerek</b><div class="q small">fél adag</div></div><div class="step"><button type="button" data-gn="k,-1" aria-label="Kevesebb gyerek vendég">−</button><output>'+g.k+'</output><button type="button" data-gn="k,1" aria-label="Több gyerek vendég">+</button></div></div>';
  o+='<div class="q small">A családdal együtt <b>'+nf(P)+" adag</b> fogásonként.</div>";
  o+='<label>Fogások</label><div class="chips" style="flex-wrap:wrap;overflow:visible">'+COURSES.map(function(c){return '<button type="button" class="chip" data-gc="'+c[0]+'" aria-pressed="'+!!g.on[c[0]]+'">'+(g.on[c[0]]?"✓ ":"")+c[1]+"</button>"}).join("")+"</div>";
  var tot=[0,0,0],miss=0,L=[];
  COURSES.forEach(function(c){if(!g.on[c[0]])return;if(!recById(g.pick[c[0]]))g.pick[c[0]]=gPick(c[0]);var r=recById(g.pick[c[0]]);
    if(!r){o+='<div class="li"><span class="lt">'+c[1]+': nincs ilyen recept</span></div>';return}
    var ch=check(r),cost=recCost(r,ch,P/r.adag);for(var i=0;i<3;i++)tot[i]+=cost.full[i];miss+=ch.miss.length;L.push(r);
    o+='<div class="mps"><button type="button" class="mpn" data-mxo="'+r.id+'"><span class="ic">'+ic(RICO[r.cat]||"pot")+'</span><span><span class="q small">'+c[1]+"</span><br><b>"+esc(r.nev)+"</b> "+(ch.ok&&ch.can>=P-0.01?'<span class="badge ok">✓ megvan</span>':'<span class="badge warn">'+(ch.miss.length?"hiányzik "+ch.miss.length:"kevés")+"</span>")+'<br><span class="q small">'+r.ido_perc+" perc"+(cost.any?" · kb. "+ft(cheap(cost.full)):"")+'</span></span></button><button type="button" class="btn sm p" data-gr="'+c[0]+'" aria-label="Másik ötlet">↻</button></div>'});
  if(L.length){var bi=minI(tot),sch=L.slice().sort(function(a,b){return b.ido_perc-a.ido_perc});
    o+='<div class="sec">Költség</div><div class="shops">'+SHOPS.map(function(s,i){return '<div class="shop '+s[2]+(i===bi?" best":"")+'"><span class="sn">'+s[1]+'</span><span class="sp">'+ft(tot[i])+"</span></div>"}).join("")+'</div><div class="q small">Fejenként kb. '+ft(tot[bi]/P)+".</div>";
    o+='<div class="sec">Mikor mihez kezdj?</div><ol class="steps">'+sch.map(function(r){return "<li><b>"+esc(r.nev)+"</b>: "+(r.ido_perc>=90?"előző nap vagy reggel":"kb. "+(r.ido_perc+20)+" perccel előtte")+(COLD[r.cat]||r.cat==="desszert"?" (előre elkészíthető, hűtőben vár)":"")+"</li>"}).join("")+"</ol>";
    o+='<div class="btns">'+(miss?'<button type="button" class="btn t" id="mxgshop">Hiányzók a listára ('+miss+")</button>":"")+'<button type="button" class="btn p" id="mxgsh">Menü / meghívó küldése</button></div>'}
  sv(KM.vendeg,g);mx("Vendégvárás",o);
  $("mxgo").onchange=function(){g.occ=this.value;sv(KM.vendeg,g)};$("mxgd").onchange=function(){g.date=this.value||plus(7);sv(KM.vendeg,g)};
  if($("mxgshop"))$("mxgshop").onclick=function(){L.forEach(function(r){var ch=check(r);if(ch.miss.length)toList(r,ch,P/r.adag)});this.disabled=true};
  if($("mxgsh"))$("mxgsh").onclick=function(){share(g.occ,gText())}}

/* ================= NAPTÁR ================= */
var calM=today().slice(0,7),calSel=today();
function drawCal(){var el=$("mxcal");if(!el)return;var y=+calM.slice(0,4),m=+calM.slice(5,7),first=new Date(y,m-1,1),off=(first.getDay()+6)%7,dim=new Date(y,m,0).getDate();
  var byM={},byP={},byE={},byX={};meals.forEach(function(x){(byM[x.date]=byM[x.date]||[]).push(x)});
  if(window.menu&&menu.days)menu.days.forEach(function(d){if(d.date>=today())byP[d.date]=[d.l,d.v].filter(Boolean)});
  items.forEach(function(i){if(i.q>0)(byE[i.exp]=byE[i.exp]||[]).push(i)});exps.forEach(function(x){byX[x.date]=(byX[x.date]||0)+x.a});
  var o='<div class="car-h"><h2 class="hd" style="margin:0"><span class="ic">'+ic("book")+"</span>"+esc(mname(calM))+'</h2><div class="car-nav"><button type="button" class="btn sm p" data-cm="-1" aria-label="Előző hónap">◀</button><button type="button" class="btn sm p" data-cm="1" aria-label="Következő hónap">▶</button></div></div>';
  o+='<div class="cal" role="grid">'+["H","K","Sz","Cs","P","Sz","V"].map(function(d){return '<div class="cdh">'+d+"</div>"}).join("");
  for(var i=0;i<off;i++)o+='<div class="cd e"></div>';
  for(var dd=1;dd<=dim;dd++){var ds=calM+"-"+("0"+dd).slice(-2),ml=byM[ds]||[],pl=byP[ds]||[],ex=(byE[ds]||[]).length,cls="cd"+(ds===today()?" t":"")+(ds===calSel?" s":"");
    o+='<button type="button" class="'+cls+'" data-cd="'+ds+'" aria-label="'+esc(dlong(ds))+(ml.length?", "+ml.length+" étkezés":"")+'"><span class="cdn">'+dd+'</span><span class="cdi">'+ml.slice(0,2).map(function(x){return '<span class="ic">'+ic(MCI[x.cat]||"rice")+"</span>"}).join("")+(ml.length>2?"<small>+"+(ml.length-2)+"</small>":"")+"</span>"+
      '<span class="cdd">'+(pl.length&&!ml.length?'<i class="dp" title="menüben"></i>':"")+(ex?'<i class="de" title="lejár"></i>':"")+(byX[ds]?'<i class="dx" title="kiadás"></i>':"")+"</span></button>"}
  o+='</div><div class="calleg q small"><i class="dp"></i> heti menü <i class="de"></i> lejár <i class="dx"></i> kiadás</div><div id="mxcald"></div>';
  el.innerHTML=o;drawDay(calSel,byM,byP,byE,byX)}
function drawDay(ds,byM,byP,byE,byX){var el=$("mxcald");if(!el)return;var ml=byM[ds]||[],pl=byP[ds]||[],ex=byE[ds]||[],o='<div class="dh">'+esc(dlong(ds))+"</div>";
  ml.forEach(function(m){o+='<div class="li"><span class="ic">'+ic(MCI[m.cat]||"rice")+'</span><span class="lt" data-cme="'+m.id+'" role="button" tabindex="0">'+esc(TN[m.type]||"")+": "+esc(m.n)+"</span></div>"});
  pl.forEach(function(id,k){var r=recById(id);if(r)o+='<div class="li"><span class="ic">'+ic(RICO[r.cat]||"pot")+'</span><span class="lt"><span class="q small">Menüben ('+(pl.length>1?(k?"vacsora":"ebéd"):"")+'):</span> <a href="#" data-mxo="'+r.id+'">'+esc(r.nev)+"</a></span></div>"});
  if(ex.length)o+='<div class="li"><span class="ic">'+ic("egg")+'</span><span class="lt"><span class="badge bad">lejár</span> '+esc(ex.map(function(i){return i.n}).join(", "))+"</span></div>";
  if(byX[ds])o+='<div class="li"><span class="ic">'+ic("coin")+'</span><span class="lt">Kiadás</span><b class="price">'+ft(byX[ds])+"</b></div>";
  if(!ml.length&&!pl.length&&!ex.length&&!byX[ds])o+='<div class="q small">Erre a napra nincs bejegyzés.</div>';
  if(ds<=today())o+='<button type="button" class="btn g sm" id="mxcadd" style="margin-top:8px">+ Étkezés erre a napra</button>';
  el.innerHTML=o;if($("mxcadd"))$("mxcadd").onclick=function(){mform(null);var d=$("g_date");if(d)d.value=ds}}

/* ================= STATISZTIKA ================= */
var stP=30;
function hbar(l,v,mxv,txt){return '<div class="hb"><span class="hbl">'+l+'</span><span class="bar"><b style="width:'+Math.max(3,v/mxv*100)+'%"></b></span><span class="hbv">'+txt+"</span></div>"}
function drawStatX(){var el=$("mxstat");if(!el)return;var from=plus(-stP+1),t=today(),ms=meals.filter(function(m){return m.date>=from&&m.date<=t});
  var o='<h2><span class="ic">'+ic("chart")+'</span>Statisztika</h2><div class="chips">'+[[30,"30 nap"],[90,"3 hónap"],[365,"1 év"]].map(function(p){return '<button type="button" class="chip" data-sp="'+p[0]+'" aria-pressed="'+(stP===p[0])+'">'+p[1]+"</button>"}).join("")+"</div>";
  var sp=sum(from,t),wth=waste.th.filter(function(x){return x.d>=from}),wsv=waste.sv.filter(function(x){return x.d>=from});
  o+='<div class="sv-g"><div class="sv"><span class="ic">'+ic("pot")+"</span><b>"+ms.length+'</b><small>étkezés</small></div><div class="sv"><span class="ic">'+ic("book")+"</span><b>"+Object.keys(ms.reduce(function(a,m){a[m.n]=1;return a},{})).length+'</b><small>féle étel</small></div><div class="sv"><span class="ic">'+ic("coin")+"</span><b>"+(ms.length&&sp?ft(sp/ms.length).replace(" Ft",""):"–")+"</b><small>Ft / étkezés</small></div></div>";
  if(!ms.length){o+='<div class="q">Ebben az időszakban még nincs naplózott étkezés. Ha egy receptnél az „Ezt főztem” gombra koppintasz, itt megjelenik.</div>';el.innerHTML=o;return}
  var nm={};ms.forEach(function(m){nm[m.n]=(nm[m.n]||0)+1});var top=Object.keys(nm).sort(function(a,b){return nm[b]-nm[a]||a.localeCompare(b,"hu")}).slice(0,8);
  o+='<div class="dh">Leggyakoribb ételek</div>'+top.map(function(n){return hbar(esc(n),nm[n],nm[top[0]],nm[n]+"×")}).join("");
  var cc={};ms.forEach(function(m){cc[m.cat]=(cc[m.cat]||0)+1});var ck=CATS.filter(function(c){return cc[c[0]]}).sort(function(a,b){return cc[b[0]]-cc[a[0]]}),cmx=ck.length?cc[ck[0][0]]:1;
  if(ck.length)o+='<div class="dh">Mit esztek? (fajta)</div>'+ck.map(function(c){return hbar('<span class="ic">'+ic(MCI[c[0]]||"rice")+"</span>"+esc(c[1]),cc[c[0]],cmx,Math.round(cc[c[0]]/ms.length*100)+"%")}).join("");
  var fg={};fogyas.forEach(function(x){if(x.d<from)return;var k=x.n+"|"+x.b;fg[k]=fg[k]||{n:x.n,b:x.b,c:0,a:0};fg[k].c++;fg[k].a+=x.a});var fk=Object.keys(fg).sort(function(a,b){return fg[b].c-fg[a].c||fg[b].a-fg[a].a}).slice(0,8);
  if(fk.length)o+='<div class="dh">Ami a leggyorsabban fogy</div>'+fk.map(function(k){var x=fg[k];return hbar('<span class="ic">'+ic(ico(x.n))+"</span>"+esc(x.n),x.c,fg[fk[0]].c,x.c+"× · "+fmtQ(x.a,x.b))}).join("");
  var mk=[];for(var i=-5;i<=0;i++)mk.push(mkey(i));var mc=mk.map(function(k){return meals.filter(function(m){return m.date.slice(0,7)===k}).length}),mmx=Math.max.apply(null,mc.concat([1]));
  o+='<div class="dh">Naplózott étkezések havonta</div><div class="mbars">'+mk.map(function(k,i){return '<div class="mb'+(i===5?" cur":"")+'"><span class="mbv">'+mc[i]+'</span><span class="mbc"><b style="height:'+Math.max(2,mc[i]/mmx*100)+'%"></b></span><small>'+esc(mname(k,true))+"</small></div>"}).join("")+"</div>";
  var ty={};ms.forEach(function(m){ty[m.type]=(ty[m.type]||0)+1});
  o+='<div class="q small" style="margin-top:8px">'+TY.filter(function(x){return ty[x[0]]}).map(function(x){return x[1]+": "+ty[x[0]]}).join(" · ")+(wth.length||wsv.length?" · Megmentett: "+wsv.length+", kidobott: "+wth.length:"")+"</div>";
  el.innerHTML=o}

/* ================= RECEPT BEILLESZTÉSE SZÖVEGBŐL ================= */
var UMAP={kg:["kg",1],dkg:["dkg",1],deka:["dkg",1],dag:["dkg",1],g:["g",1],gr:["g",1],gramm:["g",1],l:["l",1],liter:["l",1],dl:["dl",1],ml:["ml",1],cl:["ml",10],
  ek:["ek",1],"evőkanál":["ek",1],"evokanal":["ek",1],"kanál":["ek",1],tk:["tk",1],"teáskanál":["tk",1],kk:["tk",0.5],"kávéskanál":["tk",0.5],db:["db",1],darab:["db",1],
  gerezd:["gerezd",1],szelet:["szelet",1],csipet:["csipet",1],"bögre":["ml",250],"csésze":["ml",250],"pohár":["ml",200],csomag:["db",1],doboz:["db",1],fej:["db",1],"marék":["g",30],szál:["db",1],"tábla":["db",1],"üveg":["db",1]};
var NUMW={"fél":0.5,"másfél":1.5,"egy":1,"két":2,"kettő":2,"három":3,"négy":4,"öt":5,"hat":6,"hét":7,"nyolc":8,"tíz":10,"pár":2,"½":0.5,"¼":0.25,"¾":0.75};
var PSYN={krumpli:"Burgonya",burgonya:"Burgonya",hagyma:"Vöröshagyma",vöröshagyma:"Vöröshagyma",tojás:"Tojás",tojást:"Tojás",tojások:"Tojás",liszt:"Liszt",lisztet:"Liszt",cukor:"Cukor",cukrot:"Cukor",tej:"Tej",tejet:"Tej",
  vaj:"Vaj",vajat:"Vaj",olaj:"Étolaj",olajat:"Étolaj",só:"Só",sót:"Só",bors:"Fekete bors",borsot:"Fekete bors",fokhagyma:"Fokhagyma",tejföl:"Tejföl",tejfölt:"Tejföl",rizs:"Rizs",rizst:"Rizs",paprika:"Paprika",paradicsom:"Paradicsom",
  pirospaprika:"Pirospaprika",fűszerpaprika:"Pirospaprika",sajt:"Sajt",sajtot:"Sajt",reszelt:"",tészta:"Tészta",tésztát:"Tészta",répa:"Sárgarépa",sárgarépa:"Sárgarépa",petrezselyem:"Petrezselyemgyökér",zsír:"Zsír",zsírt:"Zsír"};
function numOf(s){if(!s)return null;s=s.toLowerCase();if(NUMW[s]!=null)return NUMW[s];var fr=/^(\d+)\s*\/\s*(\d+)$/.exec(s);if(fr)return +fr[1]/ +fr[2];var rg=/^(\d+(?:[.,]\d+)?)\s*[-–]\s*(\d+(?:[.,]\d+)?)$/.exec(s);if(rg)return parseFloat(rg[2].replace(",","."));var v=parseFloat(s.replace(",","."));return isNaN(v)?null:v}
function prodFor(name){var clean=name.replace(/\(.*?\)/g,"").replace(/[,;].*$/,"").trim(),c=find(clean);if(c)return c;
  var ws=clean.split(/\s+/).filter(function(w){return w.length>=3}).sort(function(a,b){return b.length-a.length});
  for(var i=0;i<ws.length;i++){var w=ws[i].toLowerCase();if(PSYN[w])return find(PSYN[w]);var c2=find(w.charAt(0).toUpperCase()+w.slice(1));if(c2)return c2}
  var s=search(norm(clean),1)[0];if(s&&norm(clean).indexOf(norm(s.n))>=0)return s;
  for(var j=0;j<ws.length;j++){var nw=norm(ws[j]);if(nw.length<4)continue;var s2=search(nw,1)[0];if(s2&&norm(s2.n).indexOf(nw)===0)return s2}return null}
function parseIng(line){var t=line.replace(/^[\s\-–—•*·▪◦☐]+/,"").replace(/\s+/g," ").trim();if(!t)return null;
  var m=/^(\d+(?:[.,]\d+)?\s*[-–]\s*\d+(?:[.,]\d+)?|\d+\s*\/\s*\d+|\d+(?:[.,]\d+)?|[½¼¾]|fél|másfél|egy|két|kettő|három|négy|öt|hat|hét|nyolc|tíz|pár)\s*(.*)$/i.exec(t),q=null,rest=t;
  if(m){q=numOf(m[1]);rest=m[2]}
  /* "1 kg" + "-os" / "15dkg" esetek */
  var um=/^([a-záéíóöőúüű]+)\.?\s+(.*)$/i.exec(rest),u=null;if(um&&UMAP[um[1].toLowerCase()]){var x=UMAP[um[1].toLowerCase()];u=x[0];if(q!=null)q=q*x[1];rest=um[2]}
  else if(q!=null){var gl=/^(\d*)([a-z]+)\s+(.*)$/i.exec(rest);if(gl&&!gl[1]&&UMAP[gl[2].toLowerCase()]){u=UMAP[gl[2].toLowerCase()][0];rest=gl[3]}}
  var name=rest.replace(/^(nagy|közepes|kis|kisebb|nagyobb)\s+(fej\s+)?/i,"").trim();if(!name)return null;
  var c=prodFor(name);if(q!=null&&!u)u="db";return{nev:name.toLowerCase(),k:[c?c.n:name],menny:q!=null&&q>0?Math.round(q*100)/100:undefined,egyseg:q!=null&&q>0?u:undefined,o:/ízlés szerint|tetszés szerint|elhagyható|nem kötelező/i.test(t)?1:0,_c:!!c}}
var HING=/^(hozzávalók?|hozzavalok?|kell hozzá|amire szükség|bevásárló)/i,HSTEP=/^(elkészítés|elkeszites|elkészítése|elkészítés módja|készítés|lépések|így készül|recept leírás|leírás)/i,HOTHER=/^(tálalás|tipp|megjegyzés)/i;
function parseRecipe(text){var lines=text.split(/\r?\n/).map(function(l){return l.trim()}),mode="",title="",ings=[],steps=[],tal="",adag=0,perc=0;
  lines.forEach(function(l){if(!l)return;var nl=l.replace(/[:：]\s*$/,""),am=/(\d+)\s*(adag|személy|szem\.|főre|fő)(?![a-záéíóöőúüű])/i.exec(l),pm=/(\d+)\s*(perc|óra)/i.exec(l);
    if(mode!=="s"){if(am&&!adag)adag=+am[1];if(pm&&!perc&&mode==="")perc=pm[2]==="óra"?+pm[1]*60:+pm[1]}
    if(HING.test(nl)){mode="i";var r0=l.replace(/^[^:]*:/,"").trim();if(r0&&r0!==l)r0.split(/,\s*/).forEach(function(x){var p=parseIng(x);if(p)ings.push(p)});return}
    if(HSTEP.test(nl)){mode="s";return}
    if(HOTHER.test(nl)){mode="t";var r1=l.replace(/^[^:]*:\s*/,"");if(r1&&r1!==l)tal=r1;return}
    if(mode==="i"){var p=parseIng(l);if(p)ings.push(p);return}
    if(mode==="s"){l=l.replace(/^(\d+[.)]|[-•*])\s*/,"");if(l)steps.push(l);return}
    if(mode==="t"){tal+=(tal?" ":"")+l;return}
    /* nincs fejléc: első sor a cím, a mennyiséggel kezdődő vagy rövid, terméknevet tartalmazó sor hozzávaló, a hosszabb mondatok lépések */
    if(!title&&!/^[\d½¼¾]/.test(l)&&l.length<70&&!(am&&l.replace(am[0],"").trim().length<3)){title=l.replace(/\s*\(.*\)\s*$/,"").trim();return}
    var pi=parseIng(l);if(pi&&(pi.menny||(pi._c&&l.split(/\s+/).length<=5))&&l.length<80){ings.push(pi);return}
    if(l.length>3&&!(am||pm)||l.length>40)steps.push(l.replace(/^(\d+[.)]|[-•*])\s*/,""))});
  return{title:title,ings:ings,steps:steps,tal:tal,adag:adag,perc:perc}}
function guessCat(p){var t=norm(p.title);if(/leves/.test(t))return"leves";if(/salat/.test(t))return"salata";if(/fozelek/.test(t))return"foz";if(/(torta|suti|sutemeny|pite|muffin|keksz|piskota|palacsinta|kalacs|pudding|krem)/.test(t))return"desszert";
  if(/(szendvics|melegszendvics|wrap)/.test(t))return"szendvics";if(/(teszta|spagetti|lasagne|makaroni|nokedli)/.test(t))return"teszta";
  var cs=p.ings.map(function(h){var c=find(h.k[0]);return c?c.c:""});if(cs.indexOf("hal")>=0)return"hal";if(cs.indexOf("hus")>=0||cs.indexOf("felv")>=0)return"hus";if(/rantotta|omlett|reggeli/.test(t))return"reggeli";return"egyeb"}
function fillFromText(){var p=parseRecipe($("rpt").value);if(!p.ings.length&&!p.steps.length){toast("Nem találtam benne hozzávalót vagy lépést.");return}
  if(p.title&&(!$("rn").value||$("rn").value.slice(-8)==="(saját)"))$("rn").value=p.title;if(p.adag)$("ra").value=p.adag;if(p.perc)$("ri").value=p.perc;
  $("rc").value=guessCat(p);$("rh").checked=!!COLD[$("rc").value];
  if(p.ings.length){$("rings").innerHTML="";p.ings.forEach(function(h){var o=Object.assign({},h);delete o._c;delete o.o;if(h.o)o.o=1;ingRow(o)})}
  if(p.steps.length)$("rs").value=p.steps.join("\n");if(p.tal)$("rt").value=p.tal;
  $("rpaste").open=false;if(window.rfFlush)rfFlush();var un=p.ings.filter(function(h){return !h._c}).length;
  toast("Kitöltve: "+p.ings.length+" hozzávaló, "+p.steps.length+" lépés."+(un?" "+un+" hozzávalót nem ismertem fel, nézd át.":""))}
M.parseRecipe=parseRecipe;
M.prep=function(){renderPrep()};M.guest=function(){renderGuest()};

/* ================= NAPI PILLANATKÉP ÉS MENTÉS-EMLÉKEZTETŐ ================= */
var SNAP="kaja-backup";
function snapList(){if(!window.caches)return Promise.resolve([]);return caches.open(SNAP).then(function(c){return c.keys()}).then(function(ks){return ks.map(function(k){return new URL(k.url).pathname.split("/").pop()}).filter(function(x){return /^\d{4}-\d\d-\d\d$/.test(x)}).sort()}).catch(function(){return[]})}
function snapUrl(d){return new URL("__kaja_snap/"+d,location.href).href}
function snapSave(){if(!window.caches||items.length+meals.length+ownRec.length+shop.length<1)return Promise.resolve();var d=today();
  return snapList().then(function(L){if(L.indexOf(d)>=0)return;return caches.open(SNAP).then(function(c){return c.put(snapUrl(d),new Response(JSON.stringify(dump()),{headers:{"Content-Type":"application/json"}})).then(function(){
    L.push(d);L.sort();return Promise.all(L.slice(0,Math.max(0,L.length-7)).map(function(x){return c.delete(snapUrl(x))}))})})}).catch(function(){})}
function drawSnap(){var el=$("mxsnap");if(!el)return;snapList().then(function(L){if(!L.length){el.innerHTML="";return}
  el.innerHTML='<div class="dh">Automatikus napi pillanatképek</div><div class="q small">Az app minden nap elment egy másolatot ezen a telefonon (az utolsó 7 napot őrzi). Ha véletlenül törölsz valamit, innen visszaállíthatod. Telefoncseréhez viszont a fájlba mentés kell.</div>'+
    L.slice().reverse().map(function(d){return '<div class="li"><span class="lt">'+esc(dlong(d))+'</span><button type="button" class="btn sm p" data-snap="'+d+'">Visszaállítás</button></div>'}).join("")})}
document.addEventListener("click",function(e){var b=e.target.closest("[data-snap]");if(!b)return;caches.open(SNAP).then(function(c){return c.match(snapUrl(b.dataset.snap))}).then(function(r){return r?r.text():null}).then(function(t){if(t)restore(t);else toast("Ez a pillanatkép már nem érhető el.")})});
function backupReminder(){var n=items.length+meals.length+ownRec.length,lb=set.lastBackup;if(n<8||(lb&&Date.now()-lb<14*864e5))return;var last=+(lget(KM.bkrem)||0);if(Date.now()-last<7*864e5)return;
  setTimeout(function(){if(document.querySelector("dialog[open]"))return;lset(KM.bkrem,String(Date.now()));toast(lb?"Több mint 2 hete nem mentettél.":"Még nincs mentés az adataidról.","Mentés most",function(){$("bshare").click()})},5000)}

/* ================= KÁRTYA A RECEPTEKNÉL ================= */
function drawPlan(){var el=$("mxplan");if(!el)return;var g=vendeg&&vendeg.date>=today()?vendeg:null;
  el.innerHTML='<h2><span class="ic">'+ic("pot")+'</span>Nagy főzés, vendégség</h2><div class="q small">Előfőzés több napra egyszerre, vagy teljes menü vendégeknek, közös bevásárlólistával.</div>'+
    (g?'<div class="q small" style="margin-top:6px"><b>'+esc(g.occ)+"</b>: "+esc(dlong(g.date))+", "+(g.n+g.k)+" vendég</div>":"")+
    '<div class="btns"><button type="button" class="btn g" id="mxprep">Előfőzés (meal prep)</button><button type="button" class="btn t" id="mxguest">Vendégvárás</button></div>'+
    (window.menu&&menu.days?'<div class="btns"><button type="button" class="btn sm p" id="mxmsh">Heti menü küldése</button></div>':"");
  $("mxprep").onclick=renderPrep;$("mxguest").onclick=renderGuest;
  if($("mxmsh"))$("mxmsh").onclick=function(){share("Heti menü","Heti menü\n"+menu.days.filter(function(d){return d.date>=today()}).map(function(d){var a=recById(d.l),b=recById(d.v);return "\n"+dlong(d.date)+":\n"+(a?"  Ebéd: "+a.nev+"\n":"")+(b?"  Vacsora: "+b.nev:"")}).join("\n"))}}

/* ================= ESEMÉNYEK ================= */
document.addEventListener("click",function(e){var t=e.target;
  var o=t.closest("[data-mxo]");if(o){e.preventDefault();openRecipe(o.dataset.mxo);return}
  if(t.closest("[data-close2]")){$("mx").close();return}
  var pd=t.closest("[data-pd]");if(pd){prep.days=+pd.dataset.pd;renderPrep();return}
  var pm=t.closest("[data-pm]");if(pm){prep.meals=+pm.dataset.pm;renderPrep();return}
  var ps=t.closest("[data-ps]");if(ps){var id=ps.dataset.ps,k=prep.sel.indexOf(id);if(k>=0)prep.sel.splice(k,1);else if(prep.sel.length<3)prep.sel.push(id);else{toast("Legfeljebb 3 ételt válassz.");return}renderPrep();return}
  var gn=t.closest("[data-gn]");if(gn){var a=gn.dataset.gn.split(","),g=gst();g[a[0]]=Math.max(0,Math.min(60,g[a[0]]+ +a[1]));renderGuest();return}
  var gc=t.closest("[data-gc]");if(gc){var g2=gst();g2.on[gc.dataset.gc]=g2.on[gc.dataset.gc]?0:1;renderGuest();return}
  var gr=t.closest("[data-gr]");if(gr){var g3=gst(),cid=g3.pick[gr.dataset.gr];g3.pick[gr.dataset.gr]=gPick(gr.dataset.gr,cid)||cid;renderGuest();return}
  var cm=t.closest("[data-cm]");if(cm){var d=new Date(calM+"-01T00:00:00");d.setMonth(d.getMonth()+ +cm.dataset.cm);calM=iso(d).slice(0,7);drawCal();return}
  var cd=t.closest("[data-cd]");if(cd){calSel=cd.dataset.cd;drawCal();return}
  var ce=t.closest("[data-cme]");if(ce){var m=meals.filter(function(x){return x.id===ce.dataset.cme})[0];if(m)mform(m);return}
  var sp=t.closest("[data-sp]");if(sp){stP=+sp.dataset.sp;drawStatX();return}});
document.addEventListener("keydown",function(e){if(e.key!=="Enter")return;var ce=e.target.closest&&e.target.closest("[data-cme]");if(ce){var m=meals.filter(function(x){return x.id===ce.dataset.cme})[0];if(m)mform(m)}});
var pg=$("rpgo");if(pg)pg.onclick=fillFromText;
var rad=$("radd");if(rad)rad.addEventListener("click",function(){$("rpaste").open=false;$("rpt").value=""});

M.draw=function(v){lastP=JSON.stringify(prices);
  if(v==="rec")drawPlan();else if(v==="shop")drawUp();else if(v==="cost")drawCostX();else if(v==="stat"){drawCal();drawStatX()}else if(v==="set")drawSnap()};

/* ================= GYORSINDÍTÓK (?v=nézet&a=művelet) ================= */
(function(){var q=new URLSearchParams(location.search),v=q.get("v"),a=q.get("a");if(!v&&!a)return;
  var rest=new URLSearchParams(location.search);rest.delete("v");rest.delete("a");history.replaceState(null,"",location.pathname+(rest.toString()?"?"+rest:""));
  setTimeout(function(){if(v&&["stock","rec","shop","cost","stat","set"].indexOf(v)>=0)showView(v);
    if(a==="add")openItem(null);else if(a==="go")$("go").click();else if(a==="menu"&&window.FX)FX.showMenu();else if(a==="shopmode"&&window.FX)FX.shopMode();else if(a==="prep")renderPrep()},350)})();

M.draw(view);snapSave().then(drawSnap);backupReminder();
})();
