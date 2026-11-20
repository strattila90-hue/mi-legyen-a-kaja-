/* Mi legyen a kaja? – felület (v1.13): kompakt fejléc, globális kereső, lebegő + gomb (gyors hozzáadás),
   Napló alfülek (napló, naptár, statisztika, költség), összesítő sor a Raktárban, eszköz-csempék a Recepteknél. */
(function(){
var U={};window.UI=U;

/* ---------- összesítő sor (keret, készlet, lejárók) ---------- */
function sumline(){var el=$("sumline");if(!el)return;var t=plus(0),sp=sum(t,t),parts=[];
  if(bud&&bud.d>0){var l=bud.d-sp;parts.push(l>=0?"Ma még <b>"+ft(l)+"</b>":'<b class="neg">Ma '+ft(-l)+" túl</b>")}
  if(window.stockValue){var v=stockValue();if(v.tot)parts.push("Készlet <b>"+ft(v.tot)+"</b>")}
  var soon=items.filter(function(i){var d=days(i.exp);return d>=0&&d<=1&&i.q>0}).length,gone=items.filter(function(i){return days(i.exp)<0}).length;
  if(soon)parts.push('<b class="neg">'+soon+" hamar lejár</b>");if(gone)parts.push('<b class="neg">'+gone+" lejárt</b>");
  el.innerHTML=parts.length?parts.join(" · "):"Keret és készlet értéke"}
var dv=window.drawValue;window.drawValue=function(){if(dv)dv();sumline()};

/* ---------- fejléc: rövid háztartás-jelvény ---------- */
var ds=window.drawSet;window.drawSet=function(){ds();var h=$("hht");if(h)h.textContent=nf(portions())+" adag";var hb=$("hh");if(hb)hb.title="Kinek főzünk: "+people()}

/* ---------- Napló alfülek (a Költség is ide került) ---------- */
var SUBS=[["log","Napló"],["cal","Naptár"],["stats","Statisztika"],["cost","Költség"]],sub="log";
function drawSegs(){var cur=view==="cost"?"cost":sub;document.querySelectorAll("[data-segs]").forEach(function(el){
  el.innerHTML=SUBS.map(function(s){return '<button type="button" role="tab" data-sub="'+s[0]+'" aria-selected="'+(s[0]===cur)+'">'+s[1]+"</button>"}).join("")});
  if(view==="stat")document.querySelectorAll("#v-stat [data-part]").forEach(function(e){e.hidden=e.dataset.part!==sub})}
var sv0=window.showView;window.showView=function(v){sv0(v);
  if(v==="cost")document.querySelectorAll(".nav button").forEach(function(b){b.setAttribute("aria-selected",b.dataset.v==="stat")});
  drawSegs();$("fab").hidden=v==="set"};
document.addEventListener("click",function(e){var b=e.target.closest("[data-sub]");if(!b)return;var s=b.dataset.sub;
  if(s==="cost"){showView("cost");return}sub=s;if(view!=="stat")showView("stat");else{drawSegs();window.scrollTo(0,0)}});
U.sub=function(s){sub=s;showView(s==="cost"?"cost":"stat")};

/* ---------- Receptek: eszköz-csempék ---------- */
function bindTiles(){var t;
  if((t=$("tmenu")))t.onclick=function(){FX.showMenu()};
  if((t=$("tprep")))t.onclick=function(){MORE.prep()};
  if((t=$("tguest")))t.onclick=function(){MORE.guest()};
  if((t=$("tkid")))t.onclick=function(){FX.kidMode()};
  if((t=$("tmine")))t.onclick=function(){var b=document.querySelector('#rcat [data-c="own"]');if(b){b.click();var c=$("rcount");if(c&&c.scrollIntoView)c.scrollIntoView({behavior:"smooth",block:"start"})}};
  if((t=$("tfav")))t.onclick=function(){var b=document.querySelector('#rcat [data-c="fav"]');if(b){b.click();var c=$("rcount");if(c&&c.scrollIntoView)c.scrollIntoView({behavior:"smooth",block:"start"})}}}
bindTiles();
$("addbc").onclick=function(){openItem(null);setTimeout(function(){$("fnbc").click()},120)};

/* ---------- lebegő + gomb: gyors hozzáadás ---------- */
$("fab").onclick=function(){$("addsh").showModal()};
function closeAll(){document.querySelectorAll("dialog[open]").forEach(function(d){d.close()})}
document.addEventListener("click",function(e){var b=e.target.closest("[data-add]");if(!b)return;var a=b.dataset.add;closeAll();
  if(a==="item")openItem(null);
  else if(a==="barcode"){openItem(null);setTimeout(function(){$("fnbc").click()},120)}
  else if(a==="receipt")FX.receipt();
  else if(a==="shop"){showView("shop");setTimeout(function(){$("sn").focus()},150)}
  else if(a==="meal")mform(null);
  else if(a==="expense")xform(null);
  else if(a==="recipe")editRecipe(null);
  else if(a==="paste"){editRecipe(null);var p=$("rpaste");if(p){p.open=true;setTimeout(function(){$("rpt").focus()},120)}}});

/* ---------- globális kereső ---------- */
var LOCI={fridge:"fridge",pantry:"jar",freezer:"ice"};
function row(icon,main,sub,act){return '<div class="srow"><span class="ic">'+ic(icon)+'</span><span class="srt">'+main+(sub?'<br><span class="q small">'+sub+"</span>":"")+"</span>"+act+"</div>"}
function runSearch(){var raw=$("gq").value.trim(),v=norm(raw),el=$("srres"),o="";
  if(!v){var soon=items.filter(function(i){var d=days(i.exp);return d>=0&&d<=2&&i.q>0}).sort(function(a,b){return a.exp<b.exp?-1:1});
    o='<div class="q small">Keress a raktárban, a receptek között, a bevásárlólistán és a terméklistában egyszerre.</div>'+
      '<div class="chips" style="flex-wrap:wrap;overflow:visible;margin-top:8px">'+["tej","csirke","tészta","leves","vega gyors","olcsó"].map(function(x){return '<button type="button" class="chip" data-sq="'+x+'">'+x+"</button>"}).join("")+"</div>";
    if(soon.length)o+='<div class="dh">Hamarosan lejár</div>'+soon.slice(0,6).map(function(i){return row(ico(i.n),"<b>"+esc(i.n)+"</b>",nf(i.q)+" "+i.u+" · "+LOCN[i.loc]+" · "+dtxt(days(i.exp)),'<button type="button" class="btn sm p" data-si="'+i.id+'">Megnyit</button>')}).join("");
    el.innerHTML=o;return}
  var st=items.filter(function(i){return norm(i.n).indexOf(v)>=0}).sort(function(a,b){return a.exp<b.exp?-1:1}).slice(0,8);
  if(st.length)o+='<div class="dh">A raktárban ('+st.length+")</div>"+st.map(function(i){var d=days(i.exp);return row(ico(i.n),"<b>"+hl(i.n,v)+"</b>",nf(i.q)+" "+i.u+" · "+LOCN[i.loc]+' · <span class="'+(d<=1?"neg":"")+'">'+dtxt(d)+"</span>",'<button type="button" class="btn sm p" data-si="'+i.id+'">Szerkeszt</button>')}).join("");
  var sl=shop.filter(function(s){return !s.done&&norm(s.n).indexOf(v)>=0});
  if(sl.length)o+='<div class="dh">A bevásárlólistán</div>'+sl.map(function(s){return row(ico(s.n),"<b>"+hl(s.n,v)+"</b>",nf(s.q)+" "+s.u,'<button type="button" class="btn sm p" data-sv="shop">Lista</button>')}).join("");
  var rc=allRec().filter(function(r){return qMatch(r,v)}).map(check).filter(function(c){return !c.bl});
  rc.sort(function(a,b){var an=norm(a.r.nev).indexOf(v)>=0,bn=norm(b.r.nev).indexOf(v)>=0;return (bn-an)||(b.ok-a.ok)||(a.miss.length-b.miss.length)||a.r.nev.localeCompare(b.r.nev,"hu")});
  if(rc.length)o+='<div class="dh">Receptek ('+rc.length+")</div>"+rc.slice(0,8).map(function(c){var r=c.r;return '<button type="button" class="srow sbtn" data-sr="'+r.id+'"><span class="ic">'+ic(RICO[r.cat]||"rice")+'</span><span class="srt"><b>'+hl(r.nev,v)+'</b><br><span class="q small">'+r.ido_perc+" perc · "+esc(RCN[r.cat]||"")+"</span></span>"+(c.ok?'<span class="badge ok">megvan</span>':'<span class="badge">hiányzik '+c.miss.length+"</span>")+"</button>"}).join("")+
    (rc.length>8?'<button type="button" class="btn sm p full" data-sall="'+esc(raw)+'">Mind a '+rc.length+" recept ▸</button>":"");
  var have={};items.forEach(function(i){have[norm(i.n)]=1});
  var pr=search(v,6).filter(function(c){return !have[norm(c.n)]});
  if(pr.length)o+='<div class="dh">Termékek</div>'+pr.map(function(c){var p=priceOf(c.n);return row(ico(c.n),"<b>"+hl(c.n,v)+"</b>",esc(CATN[c.c]||"")+(p?" · "+ft(Math.min.apply(null,p.filter(function(x){return x>0})))+"/"+punit(c):""),
    '<span class="sact"><button type="button" class="btn sm g" data-sa="'+esc(c.n)+'" aria-label="'+esc(c.n)+' a raktárba">+ Raktár</button><button type="button" class="btn sm t" data-sl="'+esc(c.n)+'" aria-label="'+esc(c.n)+' a listára">+ Lista</button></span>')}).join("");
  if(!o)o='<div class="empty">Nincs találat erre: „'+esc(raw)+'”.</div>';
  if(!find(raw))o+='<div class="btns"><button type="button" class="btn g sm" data-sa="'+esc(raw)+'">„'+esc(raw)+'” a raktárba</button><button type="button" class="btn t sm" data-sl="'+esc(raw)+'">„'+esc(raw)+'” a listára</button></div>';
  el.innerHTML=o}
var srT=null;$("gq").addEventListener("input",function(){clearTimeout(srT);srT=setTimeout(runSearch,120)});
$("gq").addEventListener("keydown",function(e){if(e.key==="Enter"){var f=$("srres").querySelector("[data-si],[data-sr]");if(f){e.preventDefault();f.click()}}});
function openSearch(q){var d=$("srch");$("gq").value=q||"";runSearch();if(!d.open)d.showModal();setTimeout(function(){$("gq").focus()},60)}
U.search=openSearch;$("qs").onclick=function(){openSearch("")};
document.addEventListener("click",function(e){var t=e.target,b;
  if((b=t.closest("[data-sq]"))){$("gq").value=b.dataset.sq;runSearch();return}
  if((b=t.closest("[data-si]"))){$("srch").close();openItem(b.dataset.si);return}
  if((b=t.closest("[data-sr]"))){$("srch").close();openRecipe(b.dataset.sr);return}
  if((b=t.closest("[data-sv]"))){$("srch").close();showView(b.dataset.sv);return}
  if((b=t.closest("[data-sall]"))){$("srch").close();showView("rec");$("rq").value=b.dataset.sall;drawRec();return}
  if((b=t.closest("[data-sa]"))){var n=b.dataset.sa;$("srch").close();openItem(null);$("fn").value=n;$("fn").dispatchEvent(new Event("input"));setTimeout(function(){$("fq").focus();$("fq").select()},80);return}
  if((b=t.closest("[data-sl]"))){var c=find(b.dataset.sl);addShop(c?c.n:b.dataset.sl,c?defQ(c.u,c.n):1,c?c.u:"db");toast((c?c.n:b.dataset.sl)+" felírva a listára.");runSearch();return}});

/* ---------- indulás ---------- */
drawAll();sumline();drawSegs();
})();
