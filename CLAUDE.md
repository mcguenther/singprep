# Chorprobe – Hinweise für KI-Agenten

Chorprobe ist eine Web-App zum Üben von Chorstimmen: Stimmen hören und mischen, Einsatztöne holen,
Tempo selbst tippen, Übebereiche schleifen. Sie läuft ohne Server und ohne Build direkt aus
`index.html` (auch über `file://`). UI-Texte und Doku sind Deutsch.

## Rechte – wichtigste Regel

- **Niemals urheberrechtlich geschützte Noten, Liedtexte, Notenfotos oder Verlagsangaben committen**,
  auch nicht als Testfixture, Beispiel, Kommentar oder Screenshot. Im Repo liegen nur gemeinfreie oder
  selbst erstellte Lieder.
- Private Lieder gehören nach `local/` (gitignored). `index.html` lädt optional `local/scores.js`.
- `npm run build` bettet `local/scores.js` mit ein, wenn es existiert. `dist/` ist deshalb gitignored
  und darf nicht veröffentlicht werden, solange private Lieder darin stecken.
- Vor jedem Commit prüfen: `git diff --cached` enthält keine fremden Lieder und kein `data:image/`.

## Befehle

```sh
npm test              # node --test, Unit-Tests für js/lib/ und alle scores/*.js
npm run lint          # eslint (flat config, ohne Abhängigkeiten)
npm run format        # prettier --write
npm run format:check
npm run build         # dist/chorprobe.html – alles in einer Offline-Datei
```

Prettier und ESLint werden global erwartet, es gibt keine `node_modules`. Nach Änderungen an der
Oberfläche die App im Browser prüfen (z. B. Playwright gegen `file://…/index.html`). Die einzige
erwartete Konsolenmeldung ist das fehlende `local/scores.js`.

## Aufbau

```
index.html          Markup, Hilfedialog, <link>/<script>-Tags (Reihenfolge ist relevant)
css/NN-*.css        Stylesheets, nummeriert in Kaskadenreihenfolge
js/core.js          Namensraum globalThis.Chorprobe, registerScore()
js/lib/*.js         reine Module (Chorprobe.score, .render, .audio, …) – ohne DOM-Seiteneffekte
js/app/*.js         Controller, klassische Skripte mit gemeinsamem Top-Level-Scope
scores/*.js         mitgelieferte Lieder
docs/               Datenformat (datenformat.md), JSON-Schema, Beispiel-JSON
tests/              node:test; tests/support/load.js lädt die Browser-Skripte per vm
tools/              build-standalone.mjs
```

### Warum keine ES-Module

Über `file://` blockieren Browser `import` und `fetch`. Deshalb klassische `<script>`-Tags und Lieder
als `.js`-Dateien statt `.json`. Das bitte nicht „modernisieren“, ohne dass sich die Anforderung ändert.

### js/lib/

- `score.js`: Validierung (`validateScore`) und Kompilierung des Formats `chorprobe/v1`, Tonhöhen,
  Stimmenmischung, Einsatztöne, Tempo-Schätzung.
- `original.js`: optionale Originalseiten (Fotos mit anklickbaren Taktbereichen), `validateLayout`.
- `render.js` + `glyphs.js`: SVG-Notensatz. Glyphen sind Bravura-Umrisse (SIL OFL,
  `assets/Bravura-LICENSE.txt`).
- `audio.js`: WebAudio-Synthese, Zeitachse mit Fermaten.
- `practice.js`: kleine Helfer für Layout und Wiedergabe.

Jedes Modul hat die Form `Chorprobe.<name> = (function () { … return {…}; })();` und hängt nur von
früher geladenen Modulen ab. Neue Logik, die sich ohne DOM testen lässt, gehört hierher und bekommt
Tests in `tests/`.

### js/app/

- Alle Dateien teilen sich den globalen Scope, Absicht, nicht Versehen.
- Alle veränderlichen `let`-Zustände und die Importe aus `js/lib/` stehen in `state.js`.
- Die übrigen Dateien definieren nur Funktionen, Event-Bindungen jeweils in einer `bindX()`-Funktion.
- Ausgeführt wird nur `main.js` (zuletzt geladen).
- Zwei Dateien dürfen keinen gleichen Top-Level-Namen haben. `eslint.config.js` sammelt die
  Top-Level-Namen aller `js/app/`-Dateien, damit `no-undef`/`no-redeclare` dateiübergreifend greifen.
- Neue Datei: in `index.html` vor `main.js` eintragen, Kopfkommentar mit Zweck schreiben.

### CSS

- Die Dateien 08–14 sind historisch gewachsene Überschreib-Schichten für 01–07. Die Reihenfolge nicht
  ändern.
- Beim Aufräumen eine Regel nur dann in die Grundregel ziehen, wenn nichts dazwischen dieselben
  Selektoren betrifft.
- Neue Regeln kommen in die Datei, deren Thema passt, notfalls ans Ende von `14-range.css`.

## Lieder (scores/)

- Format: `docs/datenformat.md` und `docs/score.schema.json`. Maßgeblich ist `validateScore` in
  `js/lib/score.js`, Schema und Doku bei Änderungen mitziehen.
- Dateiform, genau ein Aufruf pro Datei, dazwischen **reines JSON** (Test prüft das):
  ```js
  // Titel – Herkunft. Gemeinfrei. Quelle: …
  Chorprobe.registerScore({ "format": "chorprobe/v1", … });
  ```
- Neues Lied in `index.html` vor `local/scores.js` eintragen. Das zuletzt angemeldete Lied öffnet
  beim Start (`tests/index.test.js` prüft die Reihenfolge). Bei mehreren Liedern erscheint die
  Auswahl in der Kopfleiste.
- Kein liedspezifisches Verhalten im Code. Was ein Lied braucht, steht in seinen Daten.
- Tonhöhen sind immer klingend notiert (`displayOctave` nur für die Anzeige, z. B. Tenor).

## Stil

- Prettier (`.prettierrc`, printWidth 100). `scores/`, `docs/`, `assets/` werden nicht formatiert.
- Kommentare knapp; sie erklären das Warum.
- Keine Runtime-Abhängigkeiten, keine CDNs: die App muss offline laufen.
