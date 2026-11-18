/* Mi legyen a kaja? – Apróséf: kis pixeles szakács segéd.
   Segít tájékozódni (nézetenként elmondja, mi hol van), felolvas (képernyő, recept, főzési lépések),
   főzés módban szórakoztat, beszólogat, sürget, tippeket ad, viccelődik; hangvezérlés főzés közben.
   Szabályalapú „okos” segéd: a helyzetből (nézet, napszak, lejáró termékek, aktuális lépés szavai) választ.
   Önálló modul: csak figyeli az appot (DOM-megfigyelés), nem módosítja a többi fájl működését. */
(function(){
if(window.CHEF)return;
var KEY="kajax.chef";
function ldc(){try{return JSON.parse(localStorage.getItem(KEY))||null}catch(e){return null}}
var S=Object.assign({on:1,voice:1,talk:1,seen:{},mini:0},ldc()||{});
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
function $(id){return document.getElementById(id)}
function nrm(s){return String(s||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"")}
function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
/* húzós zsák: ne ismételje ugyanazt, amíg van új */
var bags={};function pick(name,arr){var b=bags[name];if(!b||!b.length){b=bags[name]=arr.map(function(_,i){return i}).sort(function(){return Math.random()-.5})}return arr[b.pop()]}

/* ================= SZÖVEGEK ================= */
var JOKES=["Tudod, miért nem veszekszik a tojás? Mert fél, hogy kiborul.",
"A hagyma az egyetlen, aki megríkat, és még meg is köszönöd neki.",
"Mit mond a leves a kanálnak? Merj bátran!",
"Miért jó szakács a csiga? Mert mindent lassú tűzön csinál.",
"Mondtam a tésztának, hogy lazítson. Erre azt felelte: al dente vagyok, nem puhány.",
"A só és a bors egész életükben egymás mellett állnak, mégsem házasodnak össze. Fűszeres ügy.",
"Mi a közös a krumpliban és a hétfőben? Mindkettőt meg kell hámozni, hogy elviselhető legyen.",
"Ha a palacsinta elsőre nem sikerül, az a kóstoló volt. Mindig.",
"Miért nem játszik a paradicsom bújócskát? Mert mindig elpirul.",
"Kérdeztem a kenyeret, hogy van. Azt mondta: morzsányit fáradt.",
"A kés éles eszű. Én csak simán éles nyelvű.",
"A rántott hús az a hús, ami bundába öltözött. Nagyon divatos.",
"Az olaj sosem keveredik a vízzel. Elvi kérdés.",
"A mikró szerint a türelem harminc másodperc.",
"A recept csak javaslat. Kivéve a sütésnél. Ott törvény.",
"Én vagyok a legkisebb séf a konyhában, de nálam a legnagyobb a szám!",
"Ha valami odaégett, mondd azt, hogy grillezett. Profi trükk, tőlem tudod.",
"A krumplipüré csak egy krumpli, aki sokat élt át.",
"A tészta vize legyen olyan sós, mint a tenger. A hangulatod ne.",
"A pörkölt titka: idő, hagyma, türelem. Meg én, aki szurkolok.",
"Mit csinál a citrom, ha megsértik? Besavanyodik.",
"A lekvár mindig ragaszkodó típus.",
"A fakanál a konyha karmestere. Én vagyok a közönség, és tapsolok.",
"Miért szereti mindenki a levest? Mert mindig meleg fogadtatásban van része.",
"Azt mondják, sok szakács elrontja a levest. Szerencsére én csak pici vagyok.",
"A sajt sosem hazudik. Legfeljebb kicsit lyukas a története.",
"Tudod, mi a gombóc kedvenc sportja? A merülés.",
"A fokhagyma a legjobb testőr. Vámpír még nem jutott át rajta.",
"Mikor mondja a tojás, hogy elég? Amikor már kemény."];
var URGE=["Hahó! Ez a lépés már egy ideje tart. Megy minden?",
"Ne bambulj, a lábas nem keveri meg magát!",
"Gyerünk, séf! Vár a következő lépés!",
"Ha még dolgozol rajta, semmi gond. Én addig fütyörészek.",
"Tik-tak! Az étel nem főzi meg magát. Jó, a leves néha igen.",
"Kicsit lassan haladunk. Kérsz egy viccet motivációnak?",
"Figyelem, a hasam korog! Pedig nekem nincs is hasam.",
"Ha kész vagy, nyomd meg a Következőt, vagy mondd hangosan, hogy következő!"];
var TIMERNAG=["Indítsd el az időzítőt! Én nem tudok órát nézni, túl kicsi a kezem.",
"Ehhez a lépéshez van időzítő gomb. Nyomd meg, és szólok, ha lejárt!",
"Időzítő nélkül főzni olyan, mint bekötött szemmel palacsintát fordítani."];
var PRAISE=["Szuper!","Ügyes!","Így kell ezt!","Haladunk, mint forró kés a vajban!","Mesteri!","Ez az, séf!","Szépen megy!","Nagyon profi!"];
var DONE=["Kész is! Jó étvágyat! Mosogatni sajnos nem tudok, bocsi.","Elkészült! Büszke vagyok rád. Kérek egy falatot... ja, nincs szám hozzá. De van, csak pici.","Hurrá, kész! Ez megérdemel egy pacsit!"];
var TIPS=[
[/hagym/,"Ha a hagymát vágás előtt tíz percre a hűtőbe teszed, kevésbé csípi a szemed."],
[/hagym/,"A hagymát lassan, közepes lángon párold üvegesre. Ha siettetik, megég és kesernyés lesz."],
[/fokhagym/,"A fokhagymát a végén add hozzá, mert pár másodperc alatt megég és keserű lesz."],
[/pirospaprik|fuszerpaprik/,"A pirospaprikát mindig húzd le a tűzről, mielőtt beleszórod, különben megég és keserű lesz."],
[/teszt|spaget|makaron/,"A tészta vizét bőven sózd, és csak akkor dobd bele a tésztát, ha már lobogva forr."],
[/teszt|spaget/,"Tegyél félre egy bögre tésztafőző vizet: a keményítős víztől krémes lesz a szósz."],
[/rizs/,"A rizst főzés előtt öblítsd át, így nem ragad össze."],
[/rizs/,"Főzés után hagyd a rizst lefedve még öt percet pihenni, és ne kevergesd."],
[/krumpl|burgony/,"A krumplit hideg, sós vízben tedd fel főni, így egyenletesen fő meg."],
[/tojas/,"A friss tojás a vízben lesüllyed, a régi feljön a víz tetejére."],
[/tojas/,"A főtt tojást hideg vízbe téve sokkal könnyebben meg tudod pucolni."],
[/rantas|liszt/,"A rántást folyamatosan kevergesd, és hideg folyadékkal hígítsd, akkor nem lesz csomós."],
[/tejfol|habar/,"A tejfölt ne öntsd egyenesen a forró ételbe: előbb keverj hozzá egy kis meleg levet, ez a habarás."],
[/hus|csirk|serte|marha|comb|mell/,"Sütés előtt hagyd a húst szobahőmérsékletűre melegedni, így egyenletesebben sül."],
[/hus|csirk|serte|marha|steak/,"Sütés után pihentesd a húst pár percet, így a leve benne marad."],
[/csirk/,"A csirke akkor kész, ha a leve átlátszó, és nem rózsaszín."],
[/sut|serpeny/,"Ne zsúfold tele a serpenyőt, mert akkor a hús nem sül, hanem fő."],
[/olaj|zsir|sut/,"Az olaj akkor elég forró, ha egy fakanál nyelét belemártva apró buborékok jelennek meg körülötte."],
[/sutobe|sutoben|fokon|sutot/,"Melegítsd elő a sütőt! Hideg sütőbe tenni a sütit olyan, mint pizsamában vizsgázni."],
[/leves/,"A levest lassan, gyöngyözve főzd, ne lobogva. Így tiszta marad és szebb lesz az íze."],
[/leves|fozd|forr/,"A leves habját szűrőkanállal szedd le, akkor szép tiszta lesz."],
[/\bsos?\b|\bsoz|izesit/,"Sózni mindig fokozatosan érdemes. Hozzáadni lehet, kivenni nem."],
[/vaj/,"A vajhoz tegyél egy csepp olajat, akkor nem ég meg olyan könnyen."],
[/sajt|reszel/,"A sajtot reszeld frissen, mert jobban olvad, mint a zacskós."],
[/palacsint/,"Hagyd pihenni a palacsintatésztát fél órát, így vékonyabb és rugalmasabb lesz."],
[/\bhal\b|\bhala|halfile/,"A halat bőrös felével lefelé süsd, és ne mozgasd, amíg magától el nem válik a serpenyőtől."],
[/zoldseg|repa|cukkini|brokkol/,"A zöldséget egyforma darabokra vágd, akkor egyszerre puhul meg."],
[/citrom/,"A citromot vágás előtt görgesd meg az asztalon, így több lé jön ki belőle."],
[/kever/,"Fakanállal keverj, a fém kanál megkarcolja az edényt, és nagyon felforrósodik."],
[/fedo|lefed|parol/,"Fedő alatt gyorsabban forr fel a víz, ezzel energiát is spórolsz."],
[/./,"Mielőtt nekikezdesz, készíts ki mindent: hozzávalókat, edényt, kést. Így nem kapkodsz főzés közben."],
[/./,"A recept elolvasása az első lépés. Utána jöhet a kötény."],
[/./,"Főzés közben kóstolj! A legjobb szakácsok is folyton kóstolnak."],
[/./,"Éles késsel biztonságosabb vágni, mert nem csúszik meg."],
[/./,"Ha elmosogatsz menet közben, a végén nem vár hegynyi edény."]];
var GUIDE={
stock:"Ez a Raktár. Fent választhatsz: Hűtő, Spájz vagy Fagyasztó. Az Új termék vagy a Vonalkód gombbal adhatsz hozzá terméket. Egy termékre koppintva szerkesztheted, a színes csík pedig mutatja, mennyi idő van a lejáratig.",
rec:"Itt vannak a receptek. Azokat teszem előre, amelyekhez minden megvan otthon. Nyiss meg egy receptet, és a Főzés mód gombbal lépésről lépésre végigvezetlek. Felolvasni is tudom.",
shop:"Ez a Bolt. Itt a bevásárlólista és az árak összehasonlítása. A Bolti mód nagy betűkkel mutatja a listát, a Blokk beolvasása gomb pedig a blokkról tölti fel a raktárt.",
cost:"Itt látod, mennyit költöttetek, és mennyit ér a raktárban lévő étel.",
stat:"Ez a Napló. Itt jegyezheted fel, mit ettetek, és itt van a naptár, a statisztika meg a költségek is.",
set:"Ezek a beállítások: a család, az értesítések, a közös raktár. Engem is itt tudsz beállítani, de ugye nem kapcsolsz ki?"};
var DGUIDE={dlg:"Itt adsz hozzá vagy szerkesztesz egy terméket. Írd be a nevét, vagy olvasd be a vonalkódját. A mennyiséget csúszkával is állíthatod. A kis fényképezőgép gombbal a lejáratot és a mennyiséget le is fotózhatod.",
bc:"Tartsd a vonalkódot a kamera elé. Ha nem megy, írd be a számokat alulra.",
ph:"Fotózd le közelről és élesen. Ha nem látszik, nyugodtan írd be kézzel.",
rd:"Ez a recept. Felül állíthatod az adagot. A pipa azt jelenti, hogy megvan otthon. Ha szeretnéd, felolvasom, vagy indulhat a Főzés mód!",
ck:"Főzés mód. Minden lépést felolvasok. Hangvezérlést is bekapcsolhatsz: mondd, hogy következő, vissza, ismételd, időzítő, vicc vagy tipp.",
mp:"Ez a heti menü. Bármelyik ételt lecserélheted, és a hiányzó hozzávalókat egy gombbal a listára teheted."};
var VNAME={stock:"a Raktárban",rec:"a Recepteknél",shop:"a Boltban",cost:"a Költségeknél",stat:"a Naplóban",set:"a Beállításokban",dlg:"a termék ablakában",rd:"egy receptnél",ck:"főzés módban",bc:"a vonalkód-olvasónál",mp:"a heti menünél"};

/* ================= FIGURA ================= */
var PX=["....KKKKKK......","..KKWWWWWWKK....",".KWWWWWWWWWWK...",".KWWWWWWWWWwK...",".KWWWWWWWWwwK...","..KWWWWWWWwK....","..KwwwwwwwwK....","..KSSSSSSSSK....",
".KSSESSSSESSK...",".KSSSSSSSSSSK...",".KSsMMMMMMsSK...","..KSSSOOSSSK....","...KKSSSSKK.....","..KRRRRRRRRK....",".KAAAARRAAAAK...","KSKAAAAAAAAKSK..","KSKAAAAAAAAKSK..",
".KKAAAAAAAAKK...","..KAAAAAAAAK....","..KBBBKKBBBK....","..KKKK..KKKK...."];
var COL={K:"#3a2016",W:"#ffffff",w:"#d9d0c4",S:"#f5c08a",s:"#d9935a",E:"#3a2016",M:"#7a4a24",O:"#a3281a",R:"#e4472b",A:"#fff4dc",B:"#2fb5a8"};
function sprite(){var o='<svg class="chef-svg" viewBox="0 0 14 21" width="49" height="74" shape-rendering="crispEdges" aria-hidden="true">';
  PX.forEach(function(r,y){for(var x=0;x<r.length;x++){var c=r[x];if(c===".")continue;var cls=c==="E"?' class="ce"':c==="O"?' class="cm"':"";o+='<rect x="'+x+'" y="'+y+'" width="1" height="1" fill="'+COL[c]+'"'+cls+"/>"}});
  return o+'<rect class="cmo" x="6" y="11" width="2" height="1" fill="#3a2016"/></svg>'}

var W,B,BT,BA,hideT=null,typeT=null;
function build(){W=document.createElement("div");W.id="chefw";W.innerHTML='<div id="chefb" role="status" aria-live="polite" hidden><div class="cbh"><b>Apróséf</b><button type="button" class="cbx" aria-label="Buborék bezárása">×</button></div><div class="cbt"></div><div class="cba"></div></div>'+
  '<button type="button" id="chef" aria-label="Apróséf, a segéd. Koppints, ha segítség kell.">'+sprite()+"</button>";
  document.body.appendChild(W);B=$("chefb");BT=B.querySelector(".cbt");BA=B.querySelector(".cba");
  B.querySelector(".cbx").onclick=function(){hide();stopSpeak()};
  $("chef").onclick=function(){if(S.mini){S.mini=0;save();apply();say("Itt vagyok! Miben segíthetek?",{acts:menuActs()});return}if(!B.hidden&&B.dataset.menu){hide();return}openMenu()};
  BA.onclick=function(e){var b=e.target.closest("[data-a]");if(!b)return;var f=acts[b.dataset.a];if(f)f()};
  apply()}
function apply(){if(!W)return;W.hidden=!S.on;W.classList.toggle("mini",!!S.mini);document.body.classList.toggle("chefon",!!S.on&&!S.mini)}
var acts={};
function say(text,o){o=o||{};if(!S.on||!W)return;ck.last=Date.now();clearTimeout(hideT);clearInterval(typeT);place();
  B.hidden=false;B.dataset.menu=o.menu?"1":"";acts={};var h="";(o.acts||[]).forEach(function(a,i){acts[i]=a[1];h+='<button type="button" class="btn sm" data-a="'+i+'">'+esc(a[0])+"</button>"});BA.innerHTML=h;BA.hidden=!h;
  var n=0;BT.textContent="";typeT=setInterval(function(){n+=2;BT.textContent=text.slice(0,n);if(n>=text.length)clearInterval(typeT)},22);
  W.classList.add("talk");setTimeout(function(){if(!speaking)W.classList.remove("talk")},Math.min(4000,text.length*45));
  if(o.speak!==false&&S.voice)speak(o.read||text);
  if(!o.stay&&!h)hideT=setTimeout(hide,Math.max(5000,text.length*75))}
function hide(){clearTimeout(hideT);if(B)B.hidden=true}

/* ================= HANG ================= */
var speaking=false,huVoice=null;
function voices(){try{var v=speechSynthesis.getVoices();huVoice=v.filter(function(x){return /^hu/i.test(x.lang)})[0]||null}catch(e){}}
if(window.speechSynthesis){voices();try{speechSynthesis.onvoiceschanged=voices}catch(e){}}
function clean(t){return String(t).replace(/[\u{1F300}-\u{1FAFF}☀-➿⬀-⯿️×▦⏱◀▶✓~•]/gu," ").replace(/\s+/g," ").trim()}
function speak(text,end){if(!window.speechSynthesis||!window.SpeechSynthesisUtterance){if(end)end();return}
  try{speechSynthesis.cancel();var parts=clean(text).split(/(?<=[^0-9][.!?])\s+/).filter(function(x){return x.trim()});if(!parts.length){if(end)end();return}
    /* rövid mondatokra bontva: a hosszú szöveget egyes telefonok félbehagyják */
    parts.forEach(function(p,i){var u=new SpeechSynthesisUtterance(p.trim());u.lang="hu-HU";if(huVoice)u.voice=huVoice;u.rate=1.05;u.pitch=1.45;
      u.onstart=function(){speaking=true;W.classList.add("talk")};
      if(i===parts.length-1)u.onend=u.onerror=function(){speaking=false;W.classList.remove("talk");if(end)end()};speechSynthesis.speak(u)})}catch(e){if(end)end()}}
function stopSpeak(){try{speechSynthesis.cancel()}catch(e){}speaking=false;if(W)W.classList.remove("talk")}

/* ================= HOL VAN? (nézet, párbeszédablak) ================= */
var dstack=[];
function topDialog(){for(var i=dstack.length-1;i>=0;i--)if(dstack[i].open)return dstack[i];return null}
function place(){if(!W)return;var d=topDialog(),host=d||document.body;if(W.parentNode!==host)host.appendChild(W);
  document.querySelectorAll("dialog.chefin").forEach(function(x){if(x!==d)x.classList.remove("chefin")});if(d)d.classList.add("chefin");W.classList.toggle("indlg",!!d)}
function curView(){var m=document.querySelector("main[id^=v-]:not([hidden])");return m?m.id.slice(2):"stock"}
function where(){var d=topDialog();return d?d.id:curView()}

/* ================= MENÜ ================= */
function menuActs(){var w=where(),a=[["Hol vagyok?",guideNow],["Olvasd fel",readNow],["Viccet!",joke],["Főzési tipp",tip]];
  if(w==="ck")a.push([rec?"🎤 Hangvezérlés ki":"🎤 Hangvezérlés",toggleRec]);
  if(w==="rd"&&lastRec)a.splice(1,1,["Olvasd fel a receptet",function(){readRecipe(lastRec)}]);
  a.push([S.voice?"🔇 Csend":"🔊 Hang",function(){S.voice=S.voice?0:1;save();if(!S.voice)stopSpeak();say(S.voice?"Újra hallasz!":"Rendben, csak írok, nem beszélek.",{speak:true})}]);
  a.push(["Elbújok",function(){S.mini=1;save();stopSpeak();hide();apply()}]);return a}
function openMenu(){var w=where();say(pick("hi",["Szia! Miben segítsek?","Itt vagyok! Mit szeretnél?","Mondd, séf!","Parancs, főnök!"])+(VNAME[w]?" Most "+VNAME[w]+" vagy.":""),{acts:menuActs(),menu:1,stay:1,speak:false})}
function guideNow(){var w=where();say(DGUIDE[w]||GUIDE[w]||GUIDE.stock,{stay:1})}
function joke(){say(pick("joke",JOKES))}
function tipFor(text){var t=nrm(text||""),own=TIPS.filter(function(x){return x[0].source!=="."&&x[0].test(t)});
  return own.length?pick("tip:"+t.slice(0,40),own)[1]:pick("tipg",TIPS.filter(function(x){return x[0].source==="."}))[1]}
function tip(){var ctx="",s=document.querySelector("#ck[open] .ckstep");if(s)ctx=s.textContent;else if(lastRec&&$("rd").open)ctx=lastRec.lepesek.join(" ");say(ctx?tipFor(ctx):pick("tipa",TIPS)[1])}
function readNow(){var d=topDialog();if(d&&d.id==="rd"&&lastRec)return readRecipe(lastRec);if(d&&d.id==="ck")return readStep(true);
  var el=d||document.querySelector("main[id^=v-]:not([hidden])");if(!el)return;
  var t=clean(Array.prototype.map.call(el.querySelectorAll("h2,h3,.n,.q,.ckstep,label,li,p,.warnbox,summary,b"),function(x){return x.offsetParent!==null||d?x.textContent:""}).filter(function(s,i,a){s=s.trim();return s&&a.indexOf(s)===i}).join(". ")).slice(0,1400);
  say(t?"Felolvasom.":"Itt most nincs mit felolvasnom.",{read:t||"Itt most nincs mit felolvasnom."})}

/* ================= RECEPT ================= */
var lastRec=null;
function wrapOpen(){if(typeof window.openRecipe!=="function"||window.openRecipe.chef)return;var o=window.openRecipe;
  window.openRecipe=function(id){try{lastRec=window.recById?recById(id):null}catch(e){}return o.apply(this,arguments)};window.openRecipe.chef=1}
function ingText(r){var f=1;try{f=(window.rdP||r.adag)/r.adag}catch(e){}
  return r.hozzavalok.map(function(h){var m="";try{m=window.fmtR?fmtR(h,f):""}catch(e){}return h.nev+(m?" "+m:"")}).join(", ")}
function readRecipe(r,only){if(!r)return;var t=r.nev+". Elkészítési idő: "+r.ido_perc+" perc. Hozzávalók: "+ingText(r)+".";
  if(!only)t+=" Elkészítés: "+r.lepesek.map(function(s,i){return(i+1)+". "+s}).join(" ");
  say(only?"Felolvasom a hozzávalókat.":"Felolvasom a receptet: "+r.nev+".",{read:t,acts:[["Állj!",function(){stopSpeak();hide()}]],stay:1})}

/* ================= FŐZÉS MÓD ================= */
var ck={i:-1,t0:0,timer:0,nag:0,tnag:0,done:0,last:0},ckT=null;
function ckInfo(){var d=$("ck");if(!d||!d.open)return null;var p=d.querySelector(".ckh .pf"),s=d.querySelector(".ckstep");if(!p||!s)return null;var m=/(\d+)\s*\/\s*(\d+)/.exec(p.textContent);
  return{i:m?+m[1]:1,n:m?+m[2]:1,step:s.textContent,name:(d.querySelector(".ckh b")||{}).textContent||"",tm:d.querySelector("#cktm"),done:d.querySelectorAll(".cktimer.done").length,run:d.querySelectorAll(".cktimer:not(.done)").length}}
function stepMin(s){var m=/(\d+)(?:\s*[-–]\s*(\d+))?\s*(perc|óra|órán|órát)/i.exec(s||"");if(!m)return 0;var v=parseInt(m[2]||m[1]);return /^ór/i.test(m[3])?v*60:v}
function onCk(){var c=ckInfo();if(!c)return;if(ck.i<0)ck.done=c.done;
  if(c.i!==ck.i){var first=ck.i<0,fw=c.i>ck.i;ck.i=c.i;ck.t0=Date.now();ck.nag=0;ck.tnag=0;
    var pre=first?"Kezdjük! "+c.name+". ":(fw&&Math.random()<.6?pick("praise",PRAISE)+" ":"");
    readStep(false,pre);
    if(S.talk&&Math.random()<(S.talk>1?.7:.4))setTimeout(function(){var c2=ckInfo();if(c2&&c2.i===c.i&&!speaking)say(tipFor(c.step))},9000+Math.random()*4000)}
  if(c.done>ck.done){say(pick("tdone",["Csörög az időzítő! Nézz rá az ételre!","Lejárt az idő! Gyorsan, a lábashoz!","Csing-csing! Kész az időzített rész!"]),{stay:1})}
  ck.done=c.done}
function readStep(again,pre){var c=ckInfo();if(!c)return;var t=(pre||"")+c.i+". lépés"+(c.n?" a "+c.n+"-ből":"")+": "+c.step;
  if(c.i===c.n&&!again)t+=" Ez az utolsó lépés!";var shown=(pre||"")+c.i+". lépés"+(c.i===c.n?", az utolsó!":".")+(S.voice?" Felolvastam.":"");say(shown,{read:t,stay:1,acts:[["Ismételd",function(){readStep(true)}],["Tipp",function(){say(tipFor(c.step))}]]})}
function ckTick(){var c=ckInfo();if(!c){stopCk();return}var el=(Date.now()-ck.t0)/6e4,m=stepMin(c.step),now=Date.now();
  if(speaking||now-ck.last<25000)return;
  if(c.tm&&!c.run&&!ck.tnag&&el>.4&&S.talk){ck.tnag=1;ck.last=now;say(pick("tnag",TIMERNAG),{acts:[["Indítsd!",function(){var b=$("cktm");if(b)b.click()}]]});return}
  var lim=Math.max(m||0,3)+2+ck.nag*6;if(el>lim&&!c.run&&S.talk&&ck.nag<3){ck.nag++;ck.last=now;say(pick("urge",URGE),{acts:[["Következő",function(){var b=$("ckn")||$("ckdone");if(b)b.click()}],["Viccet!",joke]]});return}
  if(S.talk>1&&el>1.5&&Math.random()<.03){ck.last=now;joke()}}
function startCk(){ck={i:-1,t0:Date.now(),timer:0,nag:0,tnag:0,done:0,last:Date.now()};clearInterval(ckT);ckT=setInterval(ckTick,5000);
  var d=$("ck");if(!d.chefObs){d.chefObs=new MutationObserver(function(){onCk()});d.chefObs.observe(d,{childList:true,subtree:true})}setTimeout(onCk,50)}
function stopCk(){clearInterval(ckT);ckT=null;ck={i:-1};if(rec)toggleRec()}
document.addEventListener("click",function(e){var t=e.target;if(!t.closest)return;
  if(t.closest("#ckdone")){say(pick("done",DONE))}
  else if(t.closest("#cktm")){ck.tnag=1;setTimeout(function(){say(pick("tset",["Elindítottam! Szólok, ha csörög.","Megy az óra! Én figyelek.","Időzítő indul! Addig mondjak egy viccet?"]),{acts:[["Mondj!",joke]]})},200)}},true);

/* ---- hangvezérlés főzés közben ---- */
var rec=null;
function toggleRec(){if(rec){var r=rec;rec=null;try{r.abort()}catch(e){}say("Kikapcsoltam a hangvezérlést.",{speak:false});return}
  var SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR){say("Ez a telefon sajnos nem tud hangot felismerni. A gombok viszont működnek!");return}
  rec=new SR();rec.lang="hu-HU";rec.continuous=true;rec.interimResults=false;
  rec.onresult=function(ev){if(speaking)return;var t=nrm(ev.results[ev.results.length-1][0].transcript);command(t)};
  rec.onerror=function(e){if(e.error==="not-allowed"||e.error==="service-not-allowed"){rec=null;say("Nem kaptam engedélyt a mikrofonhoz.")}};
  rec.onend=function(){if(rec&&$("ck").open)setTimeout(function(){try{rec&&rec.start()}catch(e){}},300)};
  try{rec.start();say("Hallgatlak! Mondd: következő, vissza, ismételd, időzítő, hozzávalók, vicc vagy tipp.",{stay:1})}catch(e){rec=null}}
function command(t){function cl(id){var b=$(id);if(b&&!b.disabled){b.click();return true}return false}
  if(/kovetkez|tovabb|mehet|kesz vagyok/.test(t)){if(!cl("ckn"))say("Ez már az utolsó lépés! Ha kész, nyomd meg a Kész gombot.")}
  else if(/vissza|elozo/.test(t)){if(!cl("ckp"))say("Ez az első lépés, ennél visszább nincs.")}
  else if(/ismet|megint|mi a lepes|olvasd/.test(t))readStep(true);
  else if(/idozit|\bora\b|indits/.test(t)){if(!cl("cktm"))say("Ehhez a lépéshez nincs időzítő.")}
  else if(/hozzaval/.test(t)){var d=$("ck"),li=d.querySelectorAll(".ckings li");say("Hozzávalók.",{read:"Hozzávalók: "+Array.prototype.map.call(li,function(x){return x.textContent}).join(", ")})}
  else if(/vicc|nevess/.test(t))joke();else if(/tipp|tanacs/.test(t))tip();
  else if(/csend|halkan|kusz/.test(t)){stopSpeak();hide()}}

/* ================= HELYZETFIGYELÉS ================= */
var lastTalk=0,lastView=null;
function greet(){var h=new Date().getHours(),g=h<5?"Éjjeli nassolás? Nem láttam semmit!":h<10?"Jó reggelt! Mi legyen ma a reggeli?":h<14?"Szia! Közeleg az ebéd, nézzünk valamit?":h<18?"Szia! Egy kis uzsonna vagy már a vacsorát tervezzük?":"Jó estét! Mi legyen a vacsora?";
  var soon=expiring();if(soon.length)return say(g+" Figyelj: "+soon.slice(0,3).join(", ")+(soon.length>1?" hamarosan lejár.":" hamarosan lejár.")+" Főzzünk belőle?",{acts:[["Mutasd a recepteket",function(){var b=document.querySelector('.nav button[data-v="rec"]');if(b)b.click();hide()}],["Majd később",hide]]});
  say(g,{acts:S.seen.intro?null:[["Mit tudsz?",function(){S.seen.intro=1;save();say("Segítek eligazodni az appban, felolvasok, főzésnél végigvezetlek lépésről lépésre, sürgetlek, tippeket adok, és néha viccelek is. Koppints rám bármikor! Ha zavarlak, a menüben elbújhatok.",{stay:1})}]]})}
function expiring(){var out=[];try{var t=new Date(new Date().toDateString());(window.items||[]).forEach(function(i){var d=Math.round((new Date(i.exp+"T00:00:00")-t)/864e5);if(d>=0&&d<=1)out.push(i.n)})}catch(e){}return out}
function onView(){var v=curView();if(v===lastView)return;lastView=v;if(topDialog())return;
  if(!S.seen[v]){S.seen[v]=1;save();setTimeout(function(){say(GUIDE[v],{stay:1,speak:false,acts:[["Olvasd fel",function(){say(GUIDE[v])}],["Értem",hide]]})},400);lastTalk=Date.now();return}
  if(S.talk&&Date.now()-lastTalk>60000&&Math.random()<(S.talk>1?.5:.2)){lastTalk=Date.now();setTimeout(function(){Math.random()<.5?joke():say(pick("tipa",TIPS)[1])},600)}}
function onDialog(d){if(d.open){dstack=dstack.filter(function(x){return x!==d});dstack.push(d);place();
    if(d.id==="ck")startCk();
    else if(d.id==="rd"&&lastRec&&S.talk)setTimeout(function(){if(d.open)say("Felolvassam a receptet?",{speak:false,acts:[["Felolvasom",function(){readRecipe(lastRec)}],["Csak a hozzávalókat",function(){readRecipe(lastRec,1)}],["Nem kell",hide]]})},500);
    else if(DGUIDE[d.id]&&!S.seen["d:"+d.id]){S.seen["d:"+d.id]=1;save();setTimeout(function(){if(d.open)say(DGUIDE[d.id],{speak:false})},400)}
    else hide()}
  else{dstack=dstack.filter(function(x){return x!==d});if(d.id==="ck"){stopCk();stopSpeak()}if(d.id==="rd"&&speaking)stopSpeak();hide();place()}}

/* ================= BEÁLLÍTÁS ================= */
function drawSet(){var v=$("v-set");if(!v)return;var c=$("chefset");
  if(!c){c=document.createElement("details");c.className="card fold";c.id="chefset";v.insertBefore(c,v.children[1]||null)}
  var open=c.open;c.innerHTML='<summary><h2><span class="chef-mini" aria-hidden="true">'+sprite()+'</span>Apróséf, a kis segéd</h2></summary>'+
    '<label class="toggle"><input type="checkbox" id="chon"'+(S.on?" checked":"")+'> Bekapcsolva</label>'+
    '<label class="toggle"><input type="checkbox" id="chvo"'+(S.voice?" checked":"")+'> Hangosan beszél és felolvas</label>'+
    '<label for="chta">Mennyit beszéljen?</label><select id="chta"><option value="0">Csak ha kérdezem</option><option value="1">Néha beszól</option><option value="2">Sokat dumál</option></select>'+
    '<div class="btns"><button type="button" class="btn sm" id="chtest">Próba hang</button><button type="button" class="btn sm" id="chreset">Újra mutassa a tippeket</button></div>'+
    '<div class="q small">'+(window.speechSynthesis?(huVoice?"Magyar hang: "+esc(huVoice.name)+".":"Nem találtam magyar hangot a telefonon. Telepítsd a Google beszédszolgáltatás magyar hangját.")+"":"Ez a böngésző nem tud felolvasni.")+" Főzés módban hangvezérlés is van: koppints rám, és válaszd a 🎤 gombot.</div>";
  c.open=open;$("chta").value=String(S.talk);
  $("chon").onchange=function(){S.on=this.checked?1:0;S.mini=0;save();apply();if(S.on)say("Hurrá, újra itt vagyok!");else stopSpeak()};
  $("chvo").onchange=function(){S.voice=this.checked?1:0;save();if(!S.voice)stopSpeak()};
  $("chta").onchange=function(){S.talk=+this.value;save()};
  $("chtest").onclick=function(){S.on=1;S.mini=0;save();apply();say("Szia! Én vagyok az Apróséf. "+pick("joke",JOKES),{speak:true});if(!S.voice)say("A hang ki van kapcsolva, de írni azért tudok!",{speak:false})};
  $("chreset").onclick=function(){S.seen={};save();say("Rendben, mindenhol újra elmondom, mi micsoda.")}}

/* ================= INDULÁS ================= */
function init(){build();wrapOpen();
  document.querySelectorAll("main[id^=v-]").forEach(function(m){new MutationObserver(function(){onView();if(m.id==="v-set"&&!m.hidden)drawSet()}).observe(m,{attributes:true,attributeFilter:["hidden"]})});
  document.querySelectorAll("dialog").forEach(function(d){new MutationObserver(function(){onDialog(d)}).observe(d,{attributes:true,attributeFilter:["open"]})});
  drawSet();lastView=curView();S.seen[lastView]=S.seen[lastView]||0;
  if(S.on&&!S.mini)setTimeout(greet,1200)}
window.CHEF={say:say,joke:joke,tip:tip,read:readNow,tipFor:tipFor,command:command,state:function(){return S}};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();
