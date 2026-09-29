# Chorprobe

Chorstimmen üben im Browser. Eigene Stimme lauter, die anderen leiser oder ganz weg, Einsatztöne
anspielen, schwierige Takte in Schleife und halbem Tempo. Wer mag, gibt das Tempo selbst vor und
tippt die Viertel.

## Starten

`index.html` im Browser öffnen. Kein Server, keine Installation, geht auch offline.

Mitgeliefert ist der Kanon „Es tönen die Lieder“ (gemeinfrei), ausgeschrieben für Sopran, Alt,
Tenor und Bass.

## Eigene Lieder

Lieder sind JSON im Format `chorprobe/v1`, beschrieben in [docs/datenformat.md](docs/datenformat.md).
Die Beschreibung ist so geschrieben, dass man sie zusammen mit einem Notenfoto einer KI geben kann.

- Einmalig anschauen: oben auf „Lied laden“ klicken.
- Dauerhaft: als `local/scores.js` ablegen, mit `Chorprobe.registerScore({...});` um das JSON.
  Der Ordner `local/` wird nicht eingecheckt. Dort gehören Lieder hin, an denen wir keine Rechte
  haben.

## Eine Datei zum Weitergeben

```sh
npm run build
```

Das schreibt `dist/chorprobe.html`, eine einzige Datei mit allem drin. Achtung: Lieder aus `local/`
sind dann mit drin.

## Entwickeln

```sh
npm test
npm run lint
npm run format
```

Aufbau und Konventionen stehen in [CLAUDE.md](CLAUDE.md).

Notenglyphen: Bravura von Steinberg, SIL Open Font License ([assets/Bravura-LICENSE.txt](assets/Bravura-LICENSE.txt)).
