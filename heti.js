/* Mi legyen a kaja? – v1.31: heti bevásárlás-javaslat a Bolt nézetben.
   A heti menü (ebéd + vacsora) receptjeit a beállított létszám (Beállít: felnőtt, kamasz, gyerek, kisgyerek)
   szerinti adagra számolja, összevonja a hozzávalókat, levonja, ami a hűtőben, spájzban és fagyasztóban már megvan,
   és hozzáteszi a reggeli/uzsonna alapokat fejenként. Az app.js-t nem módosítja: a FX.draw horgot láncolja. */
(function(){
/* reggeli, uzsonna alapok egy felnőtt adagra, egy hétre: [termék, mennyiség (a termék egységében)] */
var STAPLE=[["Kenyér",1.5],["Tej",1.5],["Tojás",4],["Vaj",60],["Sajt",150],["Sonka",150],["Joghurt",300],["Alma",4],["Banán",3],["Paradicsom",2]];
function people(){var s=window.set||{};var a=[];if(s.ad)a.push(s.ad+" felnőtt");if(s.te)a.push(s.te+" kamasz");if(s.ch)a.push(s.ch+" gyerek");if(s.to)a.push(s.to+" kisgyerek");return a.join(", ")||"1 fő"}
function pickKey(h,bt){var best=h.k[0],bv=-1;h.k.forEach(function(k){if(!find(k))return;var v=have(k,bt);if(v>bv){bv=v;best=k}});return best}
function roundQ(q,u){if(u==="db")return Math.max(1,Math.ceil(q-0.05));if(u==="kg"||u==="l")return Math.max(0.1,Math.ceil(q*10)/10);if(u==="dl")return Math.max(1,Math.ceil(q));return Math.max(10,Math.ceil(q/10)*10)}
/* szükséglet összevonása kulcs + alapegység szerint */
function plan(){var P=portions(),need={},recs=[];
  if(!(window.menu&&menu.days&&menu.days.some(function(d){return d.date>=plus(0)}))&&window.FX&&FX.planWeek)FX.planWeek();
  var days=(window.menu&&menu.days||[]).filter(function(d){return d.date>=plus(0)}).slice(0,7);
  days.forEach(function(d){[d.l,d.v].forEach(function(id){var r=id&&recById(id);if(!r)return;recs.push(r);var f=P/r.adag;
    r.hozzavalok.forEach(function(h){if(h.o||h.f||!h.k.length||!h.menny)return;var k0=h.k[0];if(isBasic(k0))return;
      var tb=toBase(h.menny*f*((h.kf&&h.kf[k0])||1),h.egyseg,k0),key=pickKey(h,tb[0]);if(!find(key))return;var id2=key+"|"+tb[0];
      need[id2]=need[id2]||{key:key,bt:tb[0],q:0,r:{}};need[id2].q+=tb[1];need[id2].r[r.nev]=1})})});
  var SL="reggeli, uzsonna";STAPLE.forEach(function(x){var c=find(x[0]);if(!c)return;var b=BASE[c.u]||["db",1],id2=c.n+"|"+b[0];need[id2]=need[id2]||{key:c.n,bt:b[0],q:0,r:{}};need[id2].q+=x[1]*P*b[1];need[id2].r[SL]=1});
  var out=[],st=[];
  Object.keys(need).forEach(function(id){var n=need[id],c=find(n.key),hv=have(n.key,n.bt);if(!isFinite(hv))return;var def=n.q-hv;if(def<=0.0001)return;
    var b=BASE[c.u]||["db",1],q=def;if(b[0]!==n.bt){q=cvt(def,n.bt,b[0],c.n);if(q==null)return}q=roundQ(q/b[1],c.u);
    var p=costOf(c.n,b[0],q*b[1]),o1={n:c.n,q:q,u:c.u,p:p?Math.min.apply(null,p.filter(function(x){return x>0}).concat([Infinity])):0,why:Object.keys(n.r).filter(function(x){return x!==SL}).slice(0,2).concat(n.r[SL]?[SL]:[]).join(", "),cat:c.c,only:Object.keys(n.r).length===1&&n.r[SL]};(o1.only?st:out).push(o1)});
  function dedupe(L){var m={},r=[];L.forEach(function(x){var k=x.n+"|"+x.u;if(m[k]){m[k].q=roundQ(m[k].q+x.q,x.u);m[k].p+=x.p;return}m[k]=x;r.push(x)});return r}
  out=dedupe(out);st=dedupe(st);
  out.sort(function(a,b){return a.cat<b.cat?-1:a.cat>b.cat?1:0});
  return{P:P,days:days.length,recs:recs.length,items:out,staples:st}}
function fin(x){return isFinite(x)?x:0}
function row(x,k){return '<label class="ux-ci"><input type="checkbox" data-wk="'+k+'" checked><span><b>'+esc(x.n)+'</b><br><small class="q">'+esc(x.why)+'</small></span><b class="pf">'+nf(x.q)+" "+x.u+"</b></label>"}
function draw(){var el=$("wkshop");if(!el)return;var pl=plan(),all=pl.items.concat(pl.staples),tot=all.reduce(function(s,x){return s+fin(x.p)},0);
  var w=wk(),wsp=sum(w[0],w[1]),left=window.bud&&bud.w>0?bud.w-wsp:null;
  var o='<details class="fold" id="wkfold"'+(sessionStorage.getItem("wkopen")?" open":"")+'><summary><h2><span class="ic">'+ic("cart")+'</span>Heti bevásárlás-javaslat</h2></summary>';
  o+='<div class="q small">'+esc(people())+" → étkezésenként <b>"+nf(pl.P)+" adag</b>. A heti menü "+pl.recs+" ételéhez kell, levonva, ami a hűtőben, spájzban és fagyasztóban már megvan.</div>";
  if(!all.length)o+='<div class="empty">A heti menühöz minden megvan itthon. 🎉</div>';
  else{if(pl.items.length)o+='<div class="sec">A heti menühöz</div><div class="ux-calc">'+pl.items.map(function(x,k){return row(x,k)}).join("")+"</div>";
    if(pl.staples.length)o+='<div class="sec">Reggeli, uzsonna alapok</div><div class="ux-calc">'+pl.staples.map(function(x,k){return row(x,pl.items.length+k)}).join("")+"</div>";
    o+='<div class="ux-tip">Becsült ár: <b>'+ft(tot)+"</b>"+(left!=null?" · a heti keretből még "+(left>=0?"<b>"+ft(left)+"</b> maradt":'<b class="neg">'+ft(-left)+" túllépés</b>")+(left!=null&&tot>left?'<br><span class="neg">A javaslat meghaladja a maradék keretet – vedd ki, ami nem sürgős.</span>':""):"")+"</div>";
    o+='<div class="btns"><button type="button" class="btn g" id="wkadd">Kijelöltek a listára</button><button type="button" class="btn p" id="wkmenu">Heti menü</button><button type="button" class="btn p sm" id="wknew">Új menü</button></div>'}
  o+="</details>";el.innerHTML=o;
  $("wkfold").ontoggle=function(){try{if(this.open)sessionStorage.setItem("wkopen","1");else sessionStorage.removeItem("wkopen")}catch(e){}};
  if($("wkadd"))$("wkadd").onclick=function(){var n=0;all.forEach(function(x,k){var cb=el.querySelector('[data-wk="'+k+'"]');if(cb&&cb.checked){addShop(x.n,x.q,x.u);n++}});toast(n+" tétel a bevásárlólistán.");draw()};
  if($("wkmenu"))$("wkmenu").onclick=function(){FX.showMenu()};
  if($("wknew"))$("wknew").onclick=function(){FX.planWeek();draw();toast("Új heti menü készült.")}}
var prev=FX.draw;FX.draw=function(v){prev(v);if(v==="shop")try{draw()}catch(e){}};
window.HETI={draw:draw,plan:plan};
})();
