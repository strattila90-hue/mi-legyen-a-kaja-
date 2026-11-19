# Contributing / Közreműködés

## English
- Run locally: `python3 -m http.server 8808`, open http://localhost:8808/ (no build step).
- There is no automated test suite. Before a PR: run `node --check` on every changed `.js` file, load the page (e.g. with Playwright, service worker blocked) and click through all views (Raktár, Receptek, Bolt, Napló, Beállít) with no `pageerror`. If you change recipe data, every ingredient must exist in `CATALOG_SRC` (`data.js`).
- Style: the UI is Hungarian with a retro pixel-art look; keep it. Plain JS, no build tools, no new dependencies.
- On a release bump `VER` in `app.js` and `CACHE` in `sw.js`, otherwise installed apps will not update.
- PR flow: fork, create a branch, make a small focused change, open a pull request describing what and why.

## Magyar
- Helyi futtatás: `python3 -m http.server 8808`, majd http://localhost:8808/ (nincs build lépés).
- Automatikus teszt nincs. PR előtt: `node --check` minden módosított `.js` fájlra, töltsd be az oldalt (pl. Playwrighttal, service worker blokkolva), kattints végig minden nézeten (Raktár, Receptek, Bolt, Napló, Beállít), `pageerror` nélkül. Recept-adat módosításnál minden hozzávalónak léteznie kell a `CATALOG_SRC`-ben (`data.js`).
- Stílus: a felület magyar, retro pixel art megjelenésű; ezt tartsd meg. Sima JS, nincs build eszköz, nincs új függőség.
- Kiadásnál emeld a `VER`-t (`app.js`) és a `CACHE` nevét (`sw.js`), különben a telepített app nem frissül.
- PR menete: fork, új ág, kicsi, célzott változtatás, pull request a "mit és miért" leírásával.
