/* Mi legyen a kaja? – Apróséf: kis pixeles szakács segéd.
   Segít tájékozódni (nézetenként elmondja, mi hol van), felolvas (képernyő, recept, főzési lépések),
   főzés módban szórakoztat, beszólogat, sürget, tippeket ad, viccelődik; hangvezérlés főzés közben.
   Szabályalapú „okos” segéd: a helyzetből (nézet, napszak, lejáró termékek, aktuális lépés szavai) választ.
   Önálló modul: csak figyeli az appot (DOM-megfigyelés), nem módosítja a többi fájl működését. */
(function(){
if(window.CHEF)return;
var KEY="kajax.chef";
function ldc(){try{return JSON.parse(localStorage.getItem(KEY))||null}catch(e){return null}}
var S=Object.assign({style:2,nick:"",on:1,voice:1,talk:1,seen:{},mini:0,vp:"sef",vpitch:1.45,vrate:1.05,vname:""},ldc()||{});
/* hang-karakterek: hangmagasság (pitch 0–2) és tempó (rate) */
var VP={mano:{n:"Kicsi cuki manó",p:2,r:1.2,s:"Hihi! Én vagyok a pici manószakács. Segítek kevergetni, csak tegyél fel egy kisszékre!"},
  sef:{n:"Vidám séf (alap)",p:1.45,r:1.05,s:"Szia! Én vagyok az Apróséf. Főzzünk valami finomat!"},
  mely:{n:"Erőteljes mély férfi",p:.45,r:.88,s:"Jó estét. Ma valami igazán laktatót főzünk. Fel a kötényt!"},
  nagyi:{n:"Kedves nagymama",p:1.15,r:.82,s:"Gyere csak, kicsikém, főzünk valami jót, úgy, ahogy régen."},
  robot:{n:"Robot konyhafőnök",p:0,r:.95,s:"Bip-bup. Főzési program indul. Hagyma felismerve. Könnyezés valószínűsége: magas."},
  turbo:{n:"Turbó kommentátor",p:1.3,r:1.65,s:"És indul a főzés, gyorsan, gyorsan, mert a víz már forr, a hagyma pirul, micsoda meccs ez, hölgyeim és uraim!"},
  egyeni:{n:"Egyéni (csúszkákkal)"}};
function vpar(){var v=VP[S.vp];return v&&v.p!=null?{p:v.p,r:v.r}:{p:+S.vpitch,r:+S.vrate}}
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
JOKES=JOKES.concat(["Miért nem lehet a spagettivel vitatkozni? Mert mindig összegabalyodik a szála.",
"A banán sosem magányos. Mindig fürtben lóg a haverokkal.",
"Mit mond a kifli a zsemlének? Te kerek vagy, én meg hajlékony.",
"A bableves a legőszintébb étel. Később mindent elmond rólad.",
"A paprikás krumpli csak egy krumpli, aki lebarnult a nyaraláson.",
"Miért szomorú a mosogatószivacs? Mert mindig ő szívja meg.",
"A turmixgép a konyha DJ-je. Mindent összemixel.",
"A brokkoli kis fa. Ha megeszed, egy erdőt mentesz meg. Na jó, nem.",
"Mit csinál a kenyér a szaunában? Pirítósodik.",
"A gofrisütő a konyha sakktáblája.",
"A répa jót tesz a szemnek. Láttál már nyulat szemüvegben?",
"A tökfőzelék az egyetlen étel, ami a nevével is beszól.",
"Miért nem jár a görögdinnye iskolába? Mert túl sok benne a mag, és úgyis kiköpik.",
"A savanyúság mindig mogorva. Ecetes a kedve.",
"Mit mond a hagyma, ha leveszed a héját? Na, most aztán meztelen vagyok!",
"Hogy hívják a sajtot, ami nem a tiéd? Nacho cheese. Ez angol vicc volt, bocs, nem bírtam ki.",
"A mákos guba a legrejtélyesebb étel. Senki sem tudja, mi az a guba.",
"Miért nem lesz a krumpliból sosem miniszter? Mert mindig meghámozzák.",
"A tojás és a csirke vitatkoznak, ki volt előbb. A serpenyő szerint mindegy.",
"A kolbász mindig feszült. Belülről is nyomás alatt van.",
"Miért nem tud a pizza titkot tartani? Mert mindig kiteregeti a feltéteit.",
"A sütőtök szerény. Nem dicsekszik, pedig sül."]);
/* --- beszólás-stílusok: 0 kedves, 1 csipkelődő, 2 szemtelen ({n} = a megszólítás) --- */
var SASS={
urge:[[],["Na, megy ez, {n}? Vagy csak nézzük egymást?","Hahó, {n}! Elaludtál a fakanál mellett?","Kicsit lassan haladunk, {n}. Szólok, ha megöregedtem.","Figyelj, ha ilyen tempóban főzünk, a vacsorából reggeli lesz.","Ébresztő! A hagyma már nyugdíjba ment, amíg vártunk.","Ennyi idő alatt én már három levest főztem volna. Mondjuk pici leveseket.","Ez nem főzés, ez már lassú tűzön meditálás.","Mondjam lassabban? Kö-vet-ke-ző lé-pés!"],
 ["Na mi van már, kis nyomi szakács? Kész vagy már?","Kész vagy már? Nem érek rá egész nap! Jó, ráérek, de akkor is.","Hallod? Figyelj már oda! A lábas nem fogja magát megkeverni!","Jé, ott egy egér! Mindjárt befogom szakácsnak, ő legalább siet.","{n}, láttam már csigát gyorsabban főzni. Pedig a csiga nem is tud főzni.","Most komolyan telefonozol főzés közben? Én látlak ám!","Ha ez főzőverseny lenne, már rég kiestél volna. Szerencséd, hogy csak én nézlek.","Halló, konyha? Itt az Apróséf. Van ott valaki, vagy csak a por?","A szomszéd már megfőzte, megette, és el is mosogatott. Mi meg még itt tartunk.","Lassú vagy, mint a hétfő reggel, {n}.","Ha így folytatod, felveszem az egeret helyetted. Már gyakorol a kötényben.","Figyelj már, vagy szóljak anyukádnak?","Csak szólok: az étel nem lesz finomabb attól, hogy bámulod.","Ha még sokáig vársz, a recept magától lejár.","Ne nézz így rám, nem én vagyok lassú, hanem te!","Kezdek éhes lenni, pedig pixelből vagyok. Ez a te hibád, {n}.","Na? Na? Na? Kész? Nem? Még mindig nem?","Gyorsabban, mintha a nagymamád nézné!","Kis nyomi szakács, a fakanál nem varázspálca. Mozgatni kell!","Én szóltam: aki lassan főz, az éhes marad.","Hé, {n}! Ha most elalszol, rajzolok bajuszt az arcodra. Nekem már van."]],
fast:[[],["Hé, lassabban! Elolvastad egyáltalán?","Ilyen gyorsan? Nem a gyorsasági versenyen vagyunk!"],
 ["Hű, de sietünk! Ki vagy te, és mit csináltál a lassú szakácsommal?","Lassabban, Usain Bolt! Elolvastad egyáltalán, vagy csak nyomkodod?","Ennyi idő alatt még a víz se melegedett meg. Csalsz, {n}?"]],
back:[[],["Visszalépsz? Na, mit felejtettél el?","Hátramenet? Ez nem autósiskola!"],
 ["Visszafelé? Ügyes, így sosem leszünk kész!","Mi az, elfelejtetted? Aranyhal-memória, {n}?","Visszalépés. Klasszikus kezdő hiba. Mondjuk nem baj, én is kezdő voltam. Tegnap."]],
praise:[["Szuper!","Ügyes!","Így kell ezt!","Szépen megy!"],["Na látod, megy ez!","Ügyes! Nem is vagy olyan béna, mint hittem.","Ez az, séf! Majdnem profi."],
 ["Na végre!","Hoppá, ez gyors volt! Csak nem ébredtél fel?","Ügyes! Látod, megy ez, ha akarod.","Tessék, ezt is megoldottad. Kezdek büszke lenni. Kicsit.","Na, ez már hasonlít valamire!"]],
tdone:[["Csörög az időzítő! Nézz rá az ételre!","Lejárt az idő! Gyorsan, a lábashoz!"],["Csing-csing! Lejárt az idő, {n}!","Csörög! Most ne a telefont nézd, hanem a lábast!"],
 ["Csörög! Mozdulj már, mielőtt szénné ég!","Lejárt az idő! Szaladj, mint akit kergetnek!","Csörög, csörög! Ha odaég, én nem voltam itt!"]],
done:[DONE,["Kész is! Na látod, nem is volt olyan nehéz.","Elkészült! Jó étvágyat! A mosogatás a tiéd, én túl kicsi vagyok."],
 ["Kész! Na látod, nem is voltál olyan béna. Csak egy kicsit.","Elkészült! Ha rossz lett, mondd azt, hogy én főztem. Ja nem, akkor mégse.","Kész! Ezt még a szomszéd is megirigyli. Vagy kineveti. Majd kiderül.","Hurrá! Túléltük. Mind a ketten. Ez nagy szó."]],
idle:[["Ha kell valami, csak koppints rám!"],["Csak nézelődünk, vagy főzünk is ma valamit?","Unatkozom. Főzzünk valamit, {n}!","Tudod, a receptek nem főzik meg magukat."],
 ["Ha még sokáig görgetsz, éhen halunk, {n}.","Megint a hűtőt nézed? Attól nem lesz benne több.","Hahó! Itt vagyok! Senki nem figyel rám? Jó, akkor durcás vagyok.","Ma mi lesz, {n}? Megint csak a kenyér és a felvágott?","Hé! Nem csak dísznek vagyok itt. Kérdezz valamit!","Én itt állok egész nap kötényben, te meg még nem is főztél. Igazságos ez?"]],
night:[[],["Éjfélkor főzöl? Bátor vagy."],["Éjjel kettőkor rántotta? Ezt ítélet nélkül hagyom. Majdnem."]]};
function sl(kind){var a=SASS[kind],kd=$("kid"),st=kd&&kd.open?0:Math.max(0,Math.min(2,S.style|0));for(var k=st;k>=0;k--)if(a[k]&&a[k].length)return pick(kind+st,a[k]);return""}
function nick(){return (S.nick||"").trim()||"séf"}
function T(t){return String(t).replace(/\{n\}/g,nick())}
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
function say(text,o){o=o||{};if(!S.on||!W)return;text=T(text);if(o.read)o.read=T(o.read);ck.last=Date.now();clearTimeout(hideT);clearInterval(typeT);place();
  B.hidden=false;B.dataset.menu=o.menu?"1":"";acts={};var h="";(o.acts||[]).forEach(function(a,i){acts[i]=a[1];h+='<button type="button" class="btn sm" data-a="'+i+'">'+esc(a[0])+"</button>"});BA.innerHTML=h;BA.hidden=!h;
  var n=0;BT.textContent="";typeT=setInterval(function(){n+=2;BT.textContent=text.slice(0,n);if(n>=text.length)clearInterval(typeT)},22);
  W.classList.add("talk");setTimeout(function(){if(!speaking)W.classList.remove("talk")},Math.min(4000,text.length*45));
  if(o.speak!==false&&S.voice)speak(o.read||text,null,o.mood);
  if(!o.stay&&!h)hideT=setTimeout(hide,Math.max(5000,text.length*75))}
function hide(){clearTimeout(hideT);if(B)B.hidden=true}

/* ================= HANG ================= */
var speaking=false,huVoice=null;
var allVoices=[];
function voices(){try{allVoices=speechSynthesis.getVoices()||[];var hu=allVoices.filter(function(x){return /^hu/i.test(x.lang)});
  huVoice=(S.vname&&allVoices.filter(function(x){return x.name===S.vname})[0])||hu[0]||null;var ae=document.activeElement;if($("chefset")&&!(ae&&ae.closest&&ae.closest("#chefset")))drawSet()}catch(e){}}
if(window.speechSynthesis){voices();try{speechSynthesis.onvoiceschanged=voices}catch(e){}}
function clean(t){return String(t).replace(/[\u{1F300}-\u{1FAFF}☀-➿⬀-⯿️×▦⏱◀▶✓~•]/gu," ").replace(/\s+/g," ").trim()}
function speak(text,end,mood){if(!window.speechSynthesis||!window.SpeechSynthesisUtterance){if(end)end();return}
  try{speechSynthesis.cancel();var parts=clean(text).split(/(?<=[^0-9][.!?])\s+/).filter(function(x){return x.trim()});if(!parts.length){if(end)end();return}
    /* rövid mondatokra bontva: a hosszú szöveget egyes telefonok félbehagyják */
    parts.forEach(function(p,i){var u=new SpeechSynthesisUtterance(p.trim());u.lang="hu-HU";var vp=vpar();if(huVoice){u.voice=huVoice;u.lang=huVoice.lang}var pm=1+(Math.random()-.5)*.08,rm=1+(Math.random()-.5)*.06,q=p.trim().slice(-1);
      if(q==="!"){pm*=1.07;rm*=1.06}else if(q==="?"){pm*=1.05}if(mood==="sass"){pm*=1.06;rm*=1.08}if(mood==="calm"){rm*=.95}
      u.rate=Math.max(.5,Math.min(2,vp.r*rm));u.pitch=Math.max(0,Math.min(2,vp.p*pm+(vp.p<.05&&q==="!"?.1:0)));u.volume=1;
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
  var r=own.length?pick("tip:"+t.slice(0,40),own)[1]:"";if(!r||r===lastTip)r=pick("tipg",TIPS.filter(function(x){return x[0].source==="."}))[1];lastTip=r;return r}
var lastTip="";
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
    var dt=Date.now()-(ck.prevT||0);ck.prevT=Date.now();
    var pre=first?"Kezdjük! "+c.name+". "+(S.style>1?pick("start",["Na, lássuk, mit tudsz, {n}!","Fel a kötényt, kis nyomi szakács!","Most kiderül, ki a főnök a konyhában. Spoiler: én.","Remélem, a tűzoltók száma megvan."])+" ":""):
      (!fw&&S.style?sl("back")+" ":fw&&dt<12000&&S.style&&ck.i>2?sl("fast")+" ":fw&&Math.random()<.6?sl("praise")+" ":"");
    readStep(false,pre);
    if(S.talk&&Math.random()<(S.talk>1?.7:.4))setTimeout(function(){var c2=ckInfo();if(c2&&c2.i===c.i&&!speaking)say(tipFor(c.step))},9000+Math.random()*4000)}
  if(c.done>ck.done){say(sl("tdone"),{mood:S.style>1?"sass":"",stay:1})}
  ck.done=c.done}
function readStep(again,pre){var c=ckInfo();if(!c)return;var t=(pre||"")+c.i+". lépés"+(c.n?" a "+c.n+"-ből":"")+": "+c.step;
  if(c.i===c.n&&!again)t+=" Ez az utolsó lépés!";var shown=(pre||"")+c.i+". lépés"+(c.i===c.n?", az utolsó!":".")+(S.voice?" Felolvastam.":"");say(shown,{read:t,stay:1,acts:[["Ismételd",function(){readStep(true)}],["Tipp",function(){say(tipFor(c.step))}]]})}
function ckTick(){var c=ckInfo();if(!c){stopCk();return}var el=(Date.now()-ck.t0)/6e4,m=stepMin(c.step),now=Date.now();
  if(speaking||now-ck.last<25000)return;
  if(c.tm&&!c.run&&!ck.tnag&&el>.4&&S.talk){ck.tnag=1;ck.last=now;say(pick("tnag",TIMERNAG),{acts:[["Indítsd!",function(){var b=$("cktm");if(b)b.click()}]]});return}
  var lim=Math.max(m||0,3)+2+ck.nag*6;if(el>lim&&!c.run&&S.talk&&ck.nag<3){ck.nag++;ck.last=now;say(S.style?sl("urge"):pick("urge",URGE),{mood:S.style>1?"sass":"",acts:[["Következő",function(){var b=$("ckn")||$("ckdone");if(b)b.click()}],["Viccet!",joke]]});return}
  /* véletlen időpontban beszólás, vicc vagy tipp */
  if(!ck.nextR)ck.nextR=now+rnd();if(S.talk&&now>ck.nextR){ck.nextR=now+rnd();ck.last=now;var r=Math.random();
    if(S.style&&el>.7&&!c.run&&r<.55)say(sl("urge"),{mood:S.style>1?"sass":"",acts:[["Következő",function(){var b=$("ckn")||$("ckdone");if(b)b.click()}],["Hagyj már!",function(){ck.nextR=Date.now()+rnd()*2;say(S.style>1?pick("hagyj",["Jó, jó, durcás vagyok.","Na tessék, megsértődtem. Két percre.","Oké, befogom. A számat, nem az egeret."]):"Rendben, csendben leszek egy kicsit.");}]]});
    else if(r<.8)joke();else say(tipFor(c.step))}}
function rnd(){var a=S.talk>1?[40,110]:[80,220];return(a[0]+Math.random()*(a[1]-a[0]))*1000}
function startCk(){ck={i:-1,t0:Date.now(),timer:0,nag:0,tnag:0,done:0,last:Date.now()};clearInterval(ckT);ckT=setInterval(ckTick,5000);
  var d=$("ck");if(!d.chefObs){d.chefObs=new MutationObserver(function(){onCk()});d.chefObs.observe(d,{childList:true,subtree:true})}setTimeout(onCk,50)}
function stopCk(){clearInterval(ckT);ckT=null;ck={i:-1};if(rec)toggleRec()}
document.addEventListener("click",function(e){var t=e.target;if(!t.closest)return;
  if(t.closest("#ckdone")){say(sl("done"),{mood:S.style>1?"sass":""})}
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
var idleNext=0;function idleTick(){if(!S.on||S.mini||!S.talk||document.hidden||topDialog()||speaking||!B||!B.hidden)return;var now=Date.now();
  if(!idleNext){idleNext=now+(S.talk>1?2:4)*6e4+Math.random()*(S.talk>1?3:5)*6e4;return}if(now<idleNext)return;idleNext=0;lastTalk=now;
  var h=new Date().getHours();if((h>=23||h<4)&&S.style&&Math.random()<.4)return say(sl("night"),{mood:"sass"});Math.random()<.6?say(sl("idle"),{mood:S.style>1?"sass":""}):joke()}
setInterval(idleTick,20000);
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
    '<label for="chvp">Milyen hangja legyen?</label><select id="chvp">'+Object.keys(VP).map(function(k){return '<option value="'+k+'">'+esc(VP[k].n)+"</option>"}).join("")+"</select>"+
    '<div class="chsl"><label for="chpi">Hangmagasság</label><input type="range" id="chpi" min="0" max="2" step="0.05"><span id="chpiv"></span></div>'+
    '<div class="chsl"><label for="chra">Tempó</label><input type="range" id="chra" min="0.5" max="2" step="0.05"><span id="chrav"></span></div>'+
    (function(){var hu=allVoices.filter(function(x){return /^hu/i.test(x.lang)}),list=hu.length?hu:allVoices;if(list.length<2&&!(list.length&&!hu.length))return"";
      return '<label for="chvs">Hang a telefonon'+(hu.length?"":" (nincs magyar, ezek idegen nyelvűek)")+'</label><select id="chvs"><option value="">Automatikus'+(hu.length?" (magyar)":"")+"</option>"+list.map(function(v){return '<option value="'+esc(v.name)+'"'+(v.name===S.vname?" selected":"")+">"+esc(v.name+" · "+v.lang)+"</option>"}).join("")+"</select>"})()+
    '<div class="btns"><button type="button" class="btn sm g" id="chtry">▶ Meghallgatom</button></div>'+
    '<label for="chst">Milyen stílusban beszóljon?</label><select id="chst"><option value="0">Kedves</option><option value="1">Csipkelődő</option><option value="2">Szemtelen, személyeskedő</option></select>'+
    '<label for="chnk">Hogyan szólítson?</label><input id="chnk" maxlength="24" placeholder="pl. séf, főnök, Pisti" value="'+esc(S.nick)+'">'+
    '<label for="chta">Mennyit beszéljen?</label><select id="chta"><option value="0">Csak ha kérdezem</option><option value="1">Néha beszól</option><option value="2">Sokat dumál</option></select>'+
    '<div class="btns"><button type="button" class="btn sm" id="chtest">Próba hang</button><button type="button" class="btn sm" id="chreset">Újra mutassa a tippeket</button></div>'+
    '<div class="q small">'+(window.speechSynthesis?(huVoice?"Magyar hang: "+esc(huVoice.name)+".":"Nem találtam magyar hangot a telefonon. Telepítsd a Google beszédszolgáltatás magyar hangját.")+"":"Ez a böngésző nem tud felolvasni.")+" Főzés módban hangvezérlés is van: koppints rám, és válaszd a 🎤 gombot.</div>";
  c.open=open;$("chta").value=String(S.talk);$("chvp").value=VP[S.vp]?S.vp:"sef";
  function sl(){var v=vpar();$("chpi").value=v.p;$("chra").value=v.r;$("chpiv").textContent=v.p<.6?"mély":v.p>1.6?"vékony":"közép";$("chrav").textContent=v.r<.9?"lassú":v.r>1.3?"gyors":"normál"}sl();
  function sample(){S.voice=1;save();var v=VP[S.vp];say(v&&v.s?v.s:"Így szólok most. Tetszik?",{speak:true})}
  $("chvp").onchange=function(){S.vp=this.value;var v=VP[S.vp];if(v.p!=null){S.vpitch=v.p;S.vrate=v.r}save();sl();sample()};
  var slT=null;function slide(){S.vp="egyeni";S.vpitch=+$("chpi").value;S.vrate=+$("chra").value;save();$("chvp").value="egyeni";sl();try{navigator.vibrate&&navigator.vibrate(6)}catch(e){}
    clearTimeout(slT);slT=setTimeout(function(){say("Így szólok most. Tetszik?",{speak:true})},450)}
  $("chpi").oninput=slide;$("chra").oninput=slide;
  if($("chvs"))$("chvs").onchange=function(){S.vname=this.value;save();voices();sample()};
  $("chtry").onclick=sample;
  $("chon").onchange=function(){S.on=this.checked?1:0;S.mini=0;save();apply();if(S.on)say("Hurrá, újra itt vagyok!");else stopSpeak()};
  $("chvo").onchange=function(){S.voice=this.checked?1:0;save();if(!S.voice)stopSpeak()};
  $("chta").onchange=function(){S.talk=+this.value;save()};
  $("chst").value=String(S.style);$("chst").onchange=function(){S.style=+this.value;save();say(S.style>1?"Na végre, levehetem a kesztyűt! Szóval, kis nyomi szakács, főzünk ma, vagy csak nézelődünk?":S.style?"Rendben, csak egy kicsit csipkelődöm, {n}.":"Rendben, kedves leszek. Ígérem!",{mood:S.style>1?"sass":""})};
  $("chnk").onchange=function(){S.nick=this.value.trim().slice(0,24);save();say("Rendben, mostantól így szólítalak: {n}!")};
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
