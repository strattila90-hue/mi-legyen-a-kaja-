# Mi legyen a kaja? – munkarend

- A tulajdonos kérése: minden változtatás után **gyorsteszt, majd önálló élesítés** (beolvasztás a `main` ágba, kérdezés nélkül).
- Gyorsteszt: `python3 -m http.server`, majd Playwright-tal betölteni az oldalt, végigkattintani a nézeteket (Raktár, Receptek, Bolt, Költség, Napló, Beállít), és ellenőrizni, hogy nincs `pageerror`. Recept-adat változásnál: minden hozzávaló-kulcs létezzen a `CATALOG_SRC`-ben.
- Élesítés: a GitHub Pages a `main` ágból szolgálja ki a weboldalt; az Android app (TWA) ezt tölti be, és a service worker magától frissül. Minden kiadásnál emeld a `VER`-t (`app.js`) és a `CACHE` nevét (`sw.js`).
- Az APK-t a `.github/workflows/apk.yml` építi (`apk-latest` kiadás); csak az `android/` mappa vagy a workflow módosításakor fut.
- A felület nyelve magyar, stílusa retro pixel art.
- Közös raktár: `sync.js` (Firestore, tételenkénti szinkron, `kaja/{kód}/...`), SDK a `vendor/` mappában, beállítás a `firebase-config.js`-ben. Szinkron-teszthez a service workert blokkolni kell a Playwright kontextusban (`serviceWorkers:"block"`), és a `vendor/firebase-*.js` kéréseket hamis SDK-val kiváltani.
