/* v1.30: Konyhai tudástár – ételkészítési alapismeretek röviden (alapműveletek, sűrítés, tészták, hőmérséklet,
   tárolás, mértékek, helyettesítés). A recept nézet a lépések szövegéből felismeri a kapcsolódó fogalmakat
   (k = kulcsszavak, ékezet nélkül, kisbetűvel), és odateszi a magyarázatot. */
var TUDAS=[
/* ---- Alapműveletek ---- */
{id:"rantas",g:"Sűrítés",t:"Rántás",k:["rantas","rantast","rantassal"],x:[
 "Zsiradék és liszt (kb. 1:1 arányban) együtt hevítve. Egy liter folyadékhoz átlagosan 4-6 dkg liszt kell.",
 "Fehér rántás: csak addig hevítjük, amíg habos (fehér mártások, sóskafőzelék).",
 "Világos (szőke) rántás: halványsárgára pirítva – a legtöbb főzelékhez, leveshez.",
 "Zsemleszínű és barna rántás: tovább pirítva, mélyebb íz – lencséhez, babhoz, barna mártásokhoz.",
 "Csomómentes szabály: forró rántáshoz hideg folyadék, vagy kihűlt rántáshoz forró folyadék – sosem forró a forróhoz.",
 "A pirospaprikát és a fokhagymát a kész rántáshoz, tűzről levéve add, mert megégnek.",
 "Felöntés után legalább 3-5 percig forrald, hogy a liszt íze kifőjön."]},
{id:"habaras",g:"Sűrítés",t:"Habarás",k:["habaras","habarjuk","kiegyenlit","tejfolos","tejfolt a liszttel"],x:[
 "Tejföl (vagy tej, tejszín) liszttel csomómentesre keverve; 1 dl tejfölhöz kb. 1 evőkanál liszt.",
 "Kiegyenlítés: a habarékhoz előbb egy merőkanál forró lét keverünk, így a hőmérséklet kiegyenlítődik, és a tejföl nem csapódik ki.",
 "A kiegyenlített habarást vékony sugárban, keverés közben öntjük az ételbe, majd 2-3 percig forraljuk.",
 "Paprikásokhoz, főzelékekhez, levesekhez (pl. jókai, palócleves) használjuk."]},
{id:"lisztszoras",g:"Sűrítés",t:"Liszt-szórás és egyéb sűrítések",k:["meghintjuk liszttel","lisztszoras","liszttel meghint"],x:[
 "Liszt-szórás: a párolt alapanyagot meghintjük liszttel, átforgatjuk, majd felöntjük (zöldborsó, tök).",
 "Keményítős sűrítés: hideg folyadékban elkevert keményítő, forrásig hevítve – fényes, áttetsző lesz (gyümölcsmártás, puding).",
 "Tojássárgás sűrítés (legírozás): a forró lével kiegyenlített sárgája, már nem forraljuk (sodó, krémlevesek).",
 "Redukálás: fedő nélküli forralással elpárologtatjuk a folyadékot – intenzívebb íz."]},
{id:"porkolt",g:"Alapműveletek",t:"Pörköltalap",k:["porkolt","paprikas"],x:[
 "1. Apróra vágott vöröshagyma zsiradékon lassan, üvegesre párolva (ne barnuljon).",
 "2. Tűzről levéve hozzákeverjük az édes pirospaprikát – forró zsírban 10-15 másodperc alatt megég, és keserű lesz.",
 "3. Azonnal rá a hús (vagy egy kevés víz), így a paprika hőmérséklete leesik.",
 "4. A hús fehéredése után sózzuk, fűszerezzük, és kevés folyadékkal, fedő alatt a saját levében pároljuk; a vizet mindig csak pótoljuk.",
 "5. Paprikásnál a végén tejfölös habarással dúsítjuk, pörköltnél zsírjára sütjük.",
 "Arány tájékoztatásul: 1 kg húshoz 2-3 fej hagyma, 1-2 evőkanál pirospaprika."]},
{id:"parolas",g:"Alapműveletek",t:"Párolás",k:["parol","paroljuk","parolt"],x:[
 "Kevés folyadékban, zsiradékon, fedő alatt, forráspont körüli hőmérsékleten történő hőkezelés.",
 "Az alapanyag a saját gőzében és levében puhul: megmarad az íze, színe és vitamintartalma.",
 "Húsnál: előbb elősütjük (zárjuk) vagy pörköltalapra tesszük, majd kevés lével pároljuk.",
 "Zöldségnél: kevés vajjal, sóval, egy csipet cukorral, fedő alatt rövid ideig."]},
{id:"fozes",g:"Alapműveletek",t:"Főzés, gyöngyöző forralás",k:["gyongyoz","hideg vizbe","hideg, sozatlan","lassan felforral","lassan forrasig"],x:[
 "Hideg vízben indítjuk, ha a lé a cél (húsleves, alaplé): a fehérjék lassan oldódnak, a hab leszedhető, a leves tiszta lesz.",
 "Forró vízbe tesszük, ha a hús/zöldség íze a cél (főtt marha tálaláshoz, zöldség köretnek), mert a felület gyorsan bezárul.",
 "Gyöngyöző forralás: 90-95 °C, a felszínen csak apró buborékok – húslevesnél kötelező.",
 "Tésztát, galuskát bő (1 l / 10 dkg), lobogó, sós vízben főzünk."]},
{id:"blansir",g:"Alapműveletek",t:"Előfőzés (blansírozás)",k:["blansir","forro vizbe","eloforzes","elofoz"],x:[
 "Rövid ideig (1-3 perc) forrásban lévő, sós vízben előfőzzük, majd jeges vízben hirtelen lehűtjük.",
 "Megőrzi a zöldségek élénk színét és ropogósságát; fagyasztás előtt is ajánlott (zöldbab, brokkoli)."]},
{id:"sutes",g:"Alapműveletek",t:"Sütés serpenyőben és bő zsiradékban",k:["olajban","bo olaj","forro olaj","forro zsiradek"],x:[
 "Serpenyőben (kevés zsiradékon): a zsiradék legyen forró, a hús felülete száraz, és ne zsúfold tele a serpenyőt – különben főni kezd.",
 "Bő zsiradékban: 160-180 °C. Próba: egy morzsa vagy fakanál nyele körül azonnal apró buborékok jelennek meg.",
 "Vastagabb, csontos darabot (comb) alacsonyabb hőfokon, tovább sütünk, hogy átsüljön, mielőtt a panír megég.",
 "A kisült ételt papírtörlőn csepegtetjük le, és nem takarjuk le, mert megpuhul a kéreg."]},
{id:"panir",g:"Alapműveletek",t:"Panírozás (bundázás)",k:["panir","bundaz","lisztbe","zsemlemorzsaba","morzsaba"],x:[
 "Bécsi bunda: liszt → felvert tojás (csipet sóval, kevés tejjel) → zsemlemorzsa.",
 "Párizsi bunda: liszt → tojás (morzsa nélkül), pl. zöldségekhez, halhoz.",
 "Orly bunda: sörös vagy tejes palacsintaszerű tészta, bő olajban sütve.",
 "A húst előtte szárazra töröljük és sózzuk; a morzsát finoman rányomjuk, nem lapogatjuk."]},
{id:"roston",g:"Alapműveletek",t:"Sütés sütőben, pihentetés",k:["foliaval","pihentetjuk, majd szelet","locsolgat"],x:[
 "Nagy húsokat előbb letakarva, alacsonyabb hőfokon puhítunk, majd fedetlenül, magasabb hőfokon pirítunk.",
 "Sütés közben a saját levével locsolgatjuk, így nem szárad ki.",
 "Sütés után 10-15 percig pihentetjük: a hús levei visszarendeződnek, szeleteléskor nem folynak ki."]},
{id:"karamell",g:"Alapműveletek",t:"Karamellizálás",k:["karamell"],x:[
 "A cukrot száraz, tiszta edényben, közepes lángon olvasztjuk; kevergetni nem, csak az edényt mozgatni.",
 "Akkor jó, ha borostyánszínű; a sötétbarna már keserű.",
 "Folyadékot óvatosan, kis adagokban adj hozzá, mert erősen fröcsköl."]},
/* ---- Tészták ---- */
{id:"kelt",g:"Tészták",t:"Kelt tészta, élesztő",k:["eleszto","kelesztj","dagaszt","felfuttat"],x:[
 "Az élesztőt langyos (kb. 30 °C-os) tejben, egy kevés cukorral futtatjuk fel; 10 perc alatt habos lesz.",
 "Forró folyadékban (45 °C fölött) az élesztő elpusztul; a só közvetlenül ne érje.",
 "Dagasztás: addig, amíg a tészta hólyagos, és elválik az edény falától és a kéztől.",
 "Kelesztés langyos (26-28 °C), huzatmentes helyen, letakarva, kb. duplájára. Formázás után még egyszer, rövidebben kelesztjük.",
 "Sütés előtt tojással kenjük; a kelt tészta 170-200 °C-on sül."]},
{id:"omlos",g:"Tészták",t:"Omlós tészta",k:["elmorzsol","omlos","hideg vaj"],x:[
 "Liszt, hideg vaj (vagy margarin) és cukor; arány tájékoztatásul 3:2:1 (pl. linzer).",
 "Gyorsan, hidegen dolgozzuk: a meleg kéztől olvadó vaj és a túl sok gyúrás szívóssá teszi.",
 "Gyúrás után legalább 30-60 percig hűtőben pihentetjük, így könnyen nyújtható és nem zsugorodik."]},
{id:"piskota",g:"Tészták",t:"Piskóta",k:["piskota","kemeny hab","habba","tojasfeherjet"],x:[
 "Alaparány tojásonként: 1 tojás, 1 evőkanál (kb. 2-2,5 dkg) cukor, 1 evőkanál (kb. 2 dkg) liszt.",
 "A fehérjét zsiradékmentes, tiszta edényben verjük kemény habbá; a cukrot fokozatosan adagoljuk.",
 "A lisztet és a habot forgatva (alulról felfelé), nem keverve dolgozzuk össze, hogy a levegő benne maradjon.",
 "Az első 20 percben ne nyisd ki a sütőt. Tűpróba: ha a hústűre nem ragad tészta, kész."]},
{id:"leveles",g:"Tészták",t:"Leveles és réteslap (bolti)",k:["leveles teszta","tesztat kiteritjuk","reteslap"],x:[
 "A leveles tészta hidegen jó: ha megpuhult, tedd vissza 10 percre a hűtőbe.",
 "Vágott szélét ne kend tojással, mert összeragasztja a rétegeket, és nem nő fel.",
 "A réteslapot nyirkos konyharuhával takard, amíg dolgozol, és olvasztott vajjal kend minden réteget."]},
{id:"galuska",g:"Tészták",t:"Galuska (nokedli), csipetke",k:["nokedli","galuska","csipetke"],x:[
 "Galuska: 50 dkg liszt, 2 tojás, kb. 2,5-3 dl víz, só – lágy, habosra kevert tészta.",
 "Bő, lobogó, sós vízbe szaggatjuk; ha feljött a víz tetejére, még 1-2 perc.",
 "Leszűrés után hideg vízzel öblítjük, és kevés zsiradékkal átforgatjuk, hogy ne ragadjon össze."]},
/* ---- Biztonság, hőmérséklet ---- */
{id:"maghom",g:"Hőmérséklet és biztonság",t:"Biztonságos maghőmérsékletek",k:["maghomerseklet","atsul","atfoj"],x:[
 "Baromfi (csirke, pulyka, kacsa): legalább 74 °C a legvastagabb részen.",
 "Darált hús (fasírt, húsgombóc, hamburger): legalább 72 °C, rózsaszín rész nem maradhat.",
 "Sertés (szelet, karaj): 68-70 °C; nagyobb sült 70-72 °C.",
 "Marha: szelet ízlés szerint (angolosan 52-55 °C, közepesen 60-63 °C); darálva csak teljesen átsütve.",
 "Hal: 60-63 °C, a hús könnyen lemezekre válik, nem üveges.",
 "Újramelegítés: forrón, legalább 75 °C-ig, és csak egyszer."]},
{id:"hutes",g:"Hőmérséklet és biztonság",t:"Hűtés, a veszélyes zóna",k:["hutobe","kihutj","hideg helyen","maradek"],x:[
 "Veszélyes zóna: 5-60 °C között a baktériumok gyorsan szaporodnak.",
 "A kész étel legfeljebb 2 órát lehet szobahőmérsékleten; utána hűtőbe vagy ki kell dobni.",
 "Nagy mennyiséget kisebb, lapos edényekbe osztva hűts le gyorsan (pl. hideg vizes mosogatóban).",
 "Hűtő: 0-5 °C, fagyasztó: -18 °C vagy hidegebb.",
 "Felengedés: hűtőben (lassan), vagy hideg vízben zacskóban; konyhapulton ne.",
 "Majonézes, tojásos krémes, tejszínes ételeket mindig hűtőben tárolj."]},
{id:"tojas",g:"Hőmérséklet és biztonság",t:"Tojás",k:["kemenyre","lagyra","kaszino","sodo"],x:[
 "Lágy tojás: forrástól 4-5 perc, buggyantott 3-4 perc, kemény 9-10 perc; főzés után hideg vízbe.",
 "Frissességpróba: hideg vízben a friss tojás leül az aljára, az öreg feláll vagy feljön.",
 "Nyers tojásos krémet (pl. tiramisu) csak friss, ellenőrzött tojásból, hűtve, aznap fogyassz.",
 "A tojásfehérje 62 °C-tól, a sárgája 65-70 °C-tól kezd megkötni – ezért nem szabad a sodót forralni."]},
/* ---- Tárolás ---- */
{id:"tarolas",g:"Tárolás",t:"Mi hová kerül? Hűtő, fagyasztó, spájz",k:[],x:[
 "Hűtő (0-5 °C): hús, hal, felvágott, tejtermék, sajt, tojás, nyitott konzerv, kész étel, a legtöbb zöldség és gyümölcs.",
 "Fagyasztó (-18 °C): mirelit áru, jégkrém, előre lefagyasztott hús, kenyér, készételek. Felcímkézve, dátummal.",
 "Spájz (hűvös, száraz, sötét): liszt, cukor, rizs, tészta, száraz hüvelyesek, konzervek, olaj, fűszerek, burgonya, hagyma, fokhagyma.",
 "Ne kerüljön hűtőbe: banán, burgonya, hagyma, fokhagyma, egész paradicsom (íze romlik), méz, kenyér (gyorsabban szárad).",
 "Hűtőn belül: felső polc kész ételek, középső tejtermék, alsó polc nyers hús (alulra, hogy ne csöpögjön semmire), fiók zöldség.",
 "Felbontott konzervet tegyél át üvegbe vagy dobozba, és 2-3 napon belül használd fel."]},
{id:"fagy",g:"Tárolás",t:"Fagyasztás: mit, meddig?",k:["fagyaszt"],x:[
 "Nyers hús: 6-12 hónap (darált hús 3-4 hónap), hal 3-6 hónap.",
 "Főtt étel (pörkölt, töltött káposzta, főzelék): 2-3 hónap.",
 "Kenyér, pékáru: 1-3 hónap; szeletelve fagyaszd, így darabonként kivehető.",
 "Nem fagyasztható jól: majonézes saláta, tejfölös habarással sűrített étel (kicsapódik), nyers burgonya, uborka, saláta, főtt tojásfehérje.",
 "Kiolvasztott nyers húst ne fagyassz vissza, csak megfőzve."]},
/* ---- Mértékek ---- */
{id:"mertek",g:"Mértékek",t:"Konyhai mértékek, átváltás",k:[],x:[
 "1 evőkanál (ek) = kb. 15 ml; 1 teáskanál (tk) = kb. 5 ml; 1 csipet = kb. 0,5 g.",
 "1 ek liszt ≈ 10 g, 1 ek cukor ≈ 15 g, 1 ek olaj ≈ 13 g, 1 ek vaj ≈ 15 g, 1 ek pirospaprika ≈ 7 g, 1 tk só ≈ 5-6 g.",
 "1 bögre (2,5 dl): liszt ≈ 14 dkg, cukor ≈ 20 dkg, rizs ≈ 20 dkg.",
 "1 dkg = 10 g; 1 dl = 100 ml; 1 l víz = 1 kg.",
 "1 közepes tojás ≈ 55-60 g (sárgája 20 g, fehérje 35 g).",
 "1 csomag sütőpor ≈ 12 g (50 dkg liszthez), 1 kocka friss élesztő = 25 g (≈ 7 g szárított), 1 vaníliás cukor ≈ 10 g."]},
{id:"adag",g:"Mértékek",t:"Adagolás fejenként",k:[],x:[
 "Leves: 3-4 dl; főétel hús: 15-20 dkg nyers hús; köret: burgonya 25 dkg, rizs 6-8 dkg, száraz tészta 8-10 dkg.",
 "Főzelék főételként: 4-5 dl; feltét mellé 2-3 dl.",
 "Saláta köretként: 10-15 dkg; desszert: 1 szelet torta vagy 2-3 db aprósütemény.",
 "Gyerekadag: 3-6 év kb. fél, 7-12 év kb. háromnegyed felnőtt adag."]},
/* ---- Helyettesítés ---- */
{id:"helyettes",g:"Helyettesítés",t:"Mivel helyettesíthető?",k:[],x:[
 "Tejföl ↔ görög joghurt (habaráshoz kevés liszttel stabilizáld).",
 "Tejszín (főzéshez) ↔ tej + 1 ek vaj dl-enként, vagy krémsajt hígítva.",
 "Zsemlemorzsa ↔ darált kétszersült, kukoricapehely, zabpehely.",
 "1 tojás (sütéshez) ↔ fél pépesített banán vagy 1 ek őrölt lenmag + 3 ek víz.",
 "Friss élesztő 25 g ↔ 7 g szárított élesztő (közvetlenül a liszthez keverve).",
 "Vaj (sütésben) ↔ margarin; olajjal kb. 80% mennyiségben.",
 "Citromlé ↔ ecet (fele mennyiségben), savanyításhoz."]},
{id:"fuszer",g:"Fűszerek",t:"Fűszerezés a magyar konyhában",k:["komeny","majoranna","baberlev","tarkony"],x:[
 "Kömény: káposztás ételek, gulyás, pörkölt, krumplileves – segíti az emésztést.",
 "Majoránna: krumpli, bab, májas ételek, hurka, sült hús.",
 "Babérlevél: savanyú levesek, főzelékek, vadas; tálalás előtt vedd ki.",
 "Tárkony: tárkonyos ragu, csirke, bárány; ecettel és tejföllel kiváló.",
 "Kapor: tökfőzelék, uborkasaláta, túrós ételek – frissen, a végén.",
 "Pirospaprika: soha ne forró zsiradékba – mindig tűzről levéve."]}
];
