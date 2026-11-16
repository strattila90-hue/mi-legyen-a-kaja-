/* Animált pixel art helyszínek a Raktár fülekhez: hűtő nyíló ajtóval, lépcső alatti spájz, fagyasztó kihúzható fiókokkal.
   Minden jelenet 20x24-es pixelrács; az ajtók/fiókok külön rétegek, CSS animálja őket lépcsőzetes (steps) mozgással. */
(function(){
var O="#3a2016";
function r(x,y,w,h,c){return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="'+c+'"/>'}
function box(x,y,w,h,fill,line){return r(x,y,w,h,line||O)+r(x+1,y+1,w-2,h-2,fill)}
function svg(vb,inner,cls){return '<svg class="'+(cls||"")+'" viewBox="'+vb+'" shape-rendering="crispEdges" preserveAspectRatio="none" aria-hidden="true">'+inner+"</svg>"}
/* apró ételek */
function milk(x,y){return r(x,y,3,5,O)+r(x+1,y+1,1,3,"#fff")+r(x+1,y+2,1,1,"#4aa3e8")}
function tomato(x,y){return r(x,y+1,3,2,"#e4472b")+r(x+1,y,1,1,"#3fae5a")}
function cheese(x,y){return r(x,y,4,2,"#f7c531")+r(x+1,y,1,1,"#e69a00")}
function egg(x,y){return r(x,y,1,2,"#fff")}
function bottle(x,y,c){return r(x+1,y,1,1,O)+r(x,y+1,3,5,c)+r(x,y+2,1,2,"rgba(255,255,255,.5)")}
function jar(x,y,lid,c){return r(x,y,3,1,lid)+r(x,y+1,3,3,c)+r(x,y+1,1,1,"rgba(255,255,255,.5)")}

/* ---------- HŰTŐ ---------- */
function fridge(){
  var bg=box(0,0,20,23,"#e8f6ff")+r(1,1,18,2,"#fff9c4")+r(9,1,2,1,"#ffe94d")      /* belső tér + lámpa */
    +r(1,8,18,1,"#9cc7e0")+r(1,14,18,1,"#9cc7e0")+r(1,19,18,1,"#9cc7e0")              /* üvegpolcok */
    +milk(2,3)+cheese(7,6)+tomato(13,5)+tomato(15,5)+bottle(16,2,"#3fae5a")
    +egg(3,12)+egg(5,12)+egg(7,12)+r(2,13,7,1,"#c9a26a")+r(11,10,5,4,"#d9784a")+r(12,10,2,1,"#f4a6a0")
    +r(2,17,7,2,"#9bd06b")+r(3,16,2,1,"#3fae5a")+r(11,16,6,3,"#e8a855")+r(12,16,1,1,"#fff")
    +r(2,20,16,2,"#d6eefb")+r(3,20,3,2,"#e4472b")+r(14,20,3,2,"#f28a1f")              /* zöldségfiók */
    +r(2,23,3,1,O)+r(15,23,3,1,O);                                                     /* lábak */
  var front=box(0,0,20,23,"#f3f3f7")+r(1,1,18,1,"#fff")+r(1,21,18,1,"#d4d4de")+r(16,5,2,8,"#9a9aae")+r(16,5,1,8,"#c9c9d6")
    +r(3,3,4,1,"#e4472b")+r(3,4,3,1,"#f2a33a")+r(1,1,1,20,"#fff");
  var back=box(0,0,20,23,"#e2e2ea")+r(2,7,16,1,"#b9b9c9")+r(2,13,16,1,"#b9b9c9")+r(2,19,16,1,"#b9b9c9")
    +bottle(3,1,"#e4472b")+bottle(8,1,"#f7c531")+bottle(13,1,"#3fae5a")
    +jar(4,9,"#3fae5a","#f7c531")+jar(9,9,"#e4472b","#f4a6a0")+jar(14,9,"#2b5fa8","#fff")+milk(4,14)+milk(9,14)+bottle(13,13,"#4aa3e8");
  return '<div class="sc sc-fridge">'+svg("0 0 20 24",bg,"in")+'<div class="dr door l">'+svg("0 0 20 23",front,"f")+svg("0 0 20 23",back,"b")+"</div></div>"}

/* ---------- SPÁJZ (lépcső alatt) ---------- */
function pantry(){
  var o=r(0,0,20,24,"#f1dfbd")+r(0,22,20,2,"#a86d3a");                                  /* fal + padló */
  for(var i=0;i<5;i++){var x=i*4,top=16-i*4;
    o+=r(x,top,4,1,"#7a4a24")+r(x,top+1,4,3,"#b8793a")+r(x,top+3,4,1,"#8f5a2c");          /* lépcsőfokok */
    o+=r(x,top+4,4,22-top-4,"#fbf7ef")}                                                   /* lépcső alatti fehér fal */
  o+=r(0,0,1,1,"#f1dfbd")+r(19,0,1,24,"rgba(58,32,22,.15)");
  /* a spájz belseje az ajtó mögött */
  o+=r(11,8,7,14,"#5a3a24")+r(11,12,7,1,"#c98a4a")+r(11,16,7,1,"#c98a4a")+r(11,20,7,1,"#c98a4a")
    +jar(12,9,"#e4472b","#f28a1f")+jar(15,9,"#3fae5a","#e4472b")
    +r(12,13,3,3,"#fff")+r(12,13,3,1,"#e8a855")+r(16,14,2,2,"#b9b9c9")+r(16,14,2,1,"#e4472b")
    +r(12,18,2,2,"#b8793a")+r(14,18,2,2,"#a0662e")+r(16,17,2,3,"#f7c531")+r(11,21,7,1,"#3a2016");
  o+=r(10,7,9,1,O)+r(10,7,1,16,O)+r(18,7,1,16,O);                                        /* ajtókeret */
  var door=box(0,0,9,15,"#ffffff")+r(1,1,7,1,"#f3f3f7")+r(2,3,5,4,"#ecebf2")+r(2,9,5,4,"#ecebf2")+r(2,3,5,1,"#d8d6e2")+r(2,9,5,1,"#d8d6e2")+r(7,7,1,2,"#b9701a")+r(7,7,1,1,"#f2a33a");
  var dback=box(0,0,9,15,"#e9e4d8")+r(1,5,7,1,"#c98a4a")+r(1,10,7,1,"#c98a4a")+r(2,2,1,3,"#e4472b")+r(4,2,1,3,"#3fae5a")+r(6,3,2,2,"#f7c531")+r(2,7,4,3,"#fff")+r(2,7,4,1,"#e8a855");
  return '<div class="sc sc-pantry">'+svg("0 0 20 24",o,"in")+'<div class="dr door l pdoor">'+svg("0 0 9 15",door,"f")+svg("0 0 9 15",dback,"b")+"</div></div>"}

/* ---------- FAGYASZTÓ (a hűtő alsó része, kihúzható fiókok) ---------- */
function drawer(items){var f=box(0,6,20,7,"#f3f3f7")+r(1,7,18,1,"#fff")+r(6,9,8,1,"#9a9aae")+r(6,10,8,1,"#c9c9d6");
  var tray=r(1,0,18,6,"#2b5fa8")+r(2,1,16,5,"#bfe6ff")+items;return f+tray}
function freezer(){
  var bg=box(0,0,20,23,"#1b3d66")+r(1,1,18,4,"#f3f3f7")+r(16,1,2,3,"#9a9aae")+r(0,5,20,1,O)              /* hűtőajtó alja */
    +r(2,7,16,1,"#7fc3ee")+r(2,15,16,1,"#7fc3ee")+r(3,8,1,1,"#fff")+r(14,16,1,1,"#fff")+r(2,23,3,1,O)+r(15,23,3,1,O);
  var d1=drawer(r(3,2,3,3,"#fff")+r(4,3,1,1,"#bfe6ff")+r(7,2,5,3,"#4aa3e8")+r(8,3,3,1,"#fff")+r(13,2,4,3,"#e4472b")+r(14,2,2,1,"#f7c531"));
  var d2=drawer(r(3,2,5,3,"#3fae5a")+r(4,3,1,1,"#9bd06b")+r(9,2,4,3,"#f7c531")+r(10,3,2,1,"#e8a855")+r(14,2,3,3,"#fff")+r(15,3,1,1,"#f4a6a0"));
  return '<div class="sc sc-freezer">'+svg("0 0 20 24",bg,"in")+'<div class="fd fd1">'+svg("0 0 20 13",d1)+'</div><div class="fd fd2">'+svg("0 0 20 13",d2)+"</div>"+
    '<span class="frost f1"></span><span class="frost f2"></span><span class="frost f3"></span></div>'}

var SC={fridge:fridge,pantry:pantry,freezer:freezer};
window.buildLocs=function(){document.querySelectorAll(".tabs button").forEach(function(b){var t=b.dataset.t;b.classList.add("loc");
  b.innerHTML=SC[t]()+'<span class="lbl"><span class="ln">'+b.textContent.trim()+'</span> <b class="cnt"></b></span>'})};
})();
