# Liedquellen: Plan und Stand

Ziel: möglichst viele freie Chorsätze ab zwei Stimmen ins Format `chorprobe/v1` bringen. Gefiltert
wird später (Besetzung, Sprache, Qualität). Übersicht und Hörproben: `docs/liedquellen/index.html`.

## Phasen

1. **Noten besorgen** (jetzt)
   - a) Maschinenlesbare Quellen automatisch umwandeln (MusicXML, LilyPond), wenige Tokens:
     Skript lädt, wandelt um, validiert und schreibt einen Katalog mit Status je Lied.
   - b) Scans per KI abschreiben (Silcher, Volksliederbücher, Erk). Teurer je Lied, aber die
     besten Volksliedsätze gibt es nur so.
2. **Katalog und Such-UI** (danach): Titel, Besetzung, Stimmenzahl, Sprache, Quelle, Lizenz,
   Prüfstatus. Muss über `file://` laufen, also Katalog als `.js` und Lieder per `<script>` nachladen
   (kein `fetch`).

## Entscheidungen (4. Oktober 2026)

- [x] **Rechte-Regel** (`CLAUDE.md`): erlaubt sind gemeinfreie und selbst erstellte Lieder sowie
      Lieder unter CC0, CC BY, CC BY-SA und CPDL-Lizenz, jeweils mit Lizenzvermerk in
      `source.copyright` (Urheber/Herausgeber, Quelle mit Link, Lizenz, Änderungsvermerk mit Datum).
      NC, ND, „Personal“, „Religious“ und Ausgaben ohne Lizenz bleiben ausgeschlossen.
- [x] **Ablage**: vorerst im selben Repo unter `bibliothek/<quelle>/`, je Quelle ein Katalog
      `bibliothek/katalog-<quelle>.json` mit Status, Grund, Quelle, Lizenz und Kennzahlen.
- [x] **Sprachen**: erst nur Deutsch.

## Quellen und Stand

Zahlen aus dem CPDL-Abzug vom April 2026 (nur Ausgaben mit MusicXML) und den Recherchen vom
4. Oktober 2026. „Bibliothek“ heißt: automatisch umgewandelt und validiert in `bibliothek/<quelle>/`,
mit Katalog `bibliothek/katalog-<quelle>.json` (Status ok/warnung/fehler, Grund, Kennzahlen).
„Hörprobe“ heißt: von Hand geprüft in `docs/liedquellen/lieder/`.

| Quelle                                              | Umfang                                   | Format       | Rechte                   | Bibliothek | Hörprobe    | Nächster Schritt                            |
| --------------------------------------------------- | ---------------------------------------- | ------------ | ------------------------ | ---------- | ----------- | ------------------------------------------- |
| CPDL, deutsch, PD/CC BY/CC BY-SA/CPDL-Lizenz        | 3.856 Ausgaben ab 2 Stimmen              | MusicXML     | frei bzw. Copyleft       | 2.932      | 3           | 924 Fehlschläge nacharbeiten (siehe unten)  |
| CPDL, andere Sprachen                               | ca. 4.900 PD/CC BY, mehr mit CPDL-Lizenz | MusicXML     | frei bzw. Copyleft       | –          | –           | erst nach Deutsch                           |
| CPDL, NC/ND/Personal/Religious                      | ca. 1.700 deutsch                        | MusicXML     | nicht nutzbar            | –          | –           | nicht verwenden                             |
| Mutopia, deutsche Chorstücke                        | 37                                       | LilyPond     | PD, CC BY                | 27         | 7           | 7 Dateien mit anderer Partiturstruktur      |
| Mutopia, alle Chorstücke                            | 221                                      | LilyPond     | PD, CC BY, CC BY-SA      | –          | –           | erst nach Deutsch                           |
| PDMX (Zenodo)                                       | 3.757 Gesang ab 3 Stimmen mit Text       | MusicXML     | PD/CC0 laut Hochladenden | –          | –           | 1,9 GB laden, filtern, Bearbeiter prüfen    |
| Silcher, Volkslieder für 4 Männerstimmen            | 192 Sätze TTBB (Laupp 1902)              | Scan, PDM    | gemeinfrei               | –          | 1 (Nr. 7)   | per KI abschreiben (Phase 1b)               |
| Volksliederbuch für gemischten Chor 1915            | 604 SATB                                 | Scan         | frei außer ca. 20 Sätzen | 6 (Mutopia)| 6 (Mutopia) | per KI, Bearbeiter je Nummer prüfen         |
| Volksliederbuch für Männerchor 1906                 | 610 TTBB                                 | Scan         | frei außer Lütge         | 1 (Mutopia)| 1 (Mutopia) | per KI                                      |
| Volksliederbuch für die Jugend 1930                 | 42 dreistimmig (Bd. I/1), mehr in Bd. II | Scan         | nur teilweise frei       | –          | –           | Rechte je Nummer, dann per KI               |
| Erk/Greef, Sängerhain II B 1899                     | 235 SATB                                 | Scan, PDM    | gemeinfrei               | –          | –           | per KI                                      |
| Erk/Greef, Liederkranz 1882; Erk, Liederschatz 1889 | 72 SATB; 250 TTBB                        | Scan, PDM    | gemeinfrei               | –          | –           | per KI                                      |
| Brahms WoO 34/35                                    | 26 SATB                                  | Scan (IMSLP) | gemeinfrei               | 1 (Mutopia)| 1 (Mutopia) | per KI oder Mutopia                         |
| Schulliederbücher 1850–1916 (archive.org)           | 70 Bände, 2- bis 4-stimmig               | Scan, PDM    | Herausgeber prüfen       | –          | –           | Auswahl, per KI                             |
| Distler, Der Jahrkreis op. 5                        | 52 SSA/SAB                               | Scan (IMSLP) | EU frei, USA nicht       | –          | –           | per KI                                      |
| Wikipedia-Kanons                                    | viele einstimmige Kanonmelodien          | LilyPond     | Melodien gemeinfrei      | –          | 1           | Kanon-Generator (Einsätze ausschreiben)     |
| music21-Korpus, Bach-Choräle                        | 320 SATB, Text nur im Sopran             | MusicXML     | Weitergabe ungeklärt     | –          | –           | nicht weitergeben, Bach aus CPDL/Mutopia    |
| Open Hymnal                                         | 294 SATB, englisch                       | ABC          | meist gemeinfrei (USA)   | –          | –           | optional                                    |
| Project Gutenberg                                   | keine deutschen Liederbücher mit Noten   | –            | –                        | –          | –           | nur für Liedtexte                           |

### CPDL-Import im Einzelnen

- Ausgewählt: 3.856 deutsche Ausgaben mit MusicXML und freier Lizenz, ab 2 Stimmen.
- In der Bibliothek: 2.932 (ok 2.124, warnung 808, meist „wenig oder kein Text“ oder abweichende
  Stimmenzahl). Lizenzen: CPDL 2.712, CC BY-SA 129, PD 77, CC BY 14. Stimmen: 2: 91, 3: 410,
  4: 1.324, 5 und mehr: 1.107. Geistlich 2.092, weltlich 840.
- Fehlschläge (924): Datei weder im Abzug 2026 noch 2020 (689), weniger als zwei Singstimmen (35),
  mehr als 16 Stimmen (34), Taktart (23), Speichergrenze 3 GB (23), nur Instrumente (18), mehr als
  1000 Takte (11), Datei über 1,5 MB (6), sonstige Konverterfehler (rund 25).
- Nicht geprüft: Texte unter den Unterstimmen, Stichnoten, Ossia. Die Warnungen sind erste Kandidaten
  zum Aussortieren.

## Werkzeuge

- `tools/liedquellen/musicxml2chorprobe.py`: MusicXML, MXL, Humdrum, ABC (music21). Stimmen
  trennen, Wiederholungen ausschreiben, Text auf Unterstimmen übertragen, Klavierauszug weglassen.
  Stapelbetrieb: `--rezepte rezepte.json`.
- `tools/liedquellen/lilypond2chorprobe.py`: LilyPond-Teilmenge der Mutopia-Chorsätze.
- `tools/liedquellen/notenlinien.py`: beschriftet Notenlinien eines Scan-Ausschnitts mit Tonnamen,
  damit die KI Tonhöhen sicher abliest.
- `tools/liedquellen/abschriften/*.py`: von Hand bzw. per KI übertragene Lieder als nachvollziehbare
  Quelle (Noten je Takt und Stimme, Silben je Strophe).
- `tools/liedquellen/build.mjs`: baut `docs/liedquellen/index.html` aus `lieder.json`.

## Arbeitsweise für Scans (KI)

1. Seitenbild von archive.org laden (`https://archive.org/download/<id>/page/n<Blatt>_w1800.jpg`),
   Systeme zuschneiden, mit `notenlinien.py` beschriften.
2. Takt für Takt alle Stimmen lesen, unklare Stellen vergrößern.
3. Prüfen: Taktlängen (`validateScore`), Harmonien je Zählzeit, Melodie gegen eine zweite Quelle
   (z. B. anderer Satz derselben Melodie), Silbenzahl je Takt und Strophe.
4. Als `abschriften/<lied>.py` ablegen und daraus das JSON erzeugen.

Erfahrung mit Silcher Nr. 7 (24 Takte TTBB, 4 Strophen): rund 15 Bildausschnitte, Melodie stimmte
danach in allen 60 Noten mit einem unabhängigen Satz überein. Schwieriger sind Drucke mit
Stichnoten für einzelne Strophen und Takten über den Zeilenumbruch (z. B. Silcher Nr. 78, Lore-Ley).

## Nächste Schritte

1. [x] Massenimport CPDL, deutsch, ab 2 Stimmen (`tools/liedquellen/cpdl_import.py`).
2. [x] Alle deutschen Mutopia-Chorstücke umwandeln (`tools/liedquellen/mutopia_import.py`).
3. [x] Rechte-Regel und Ablage entscheiden.
4. [ ] Silcher-Band per KI abschreiben (Stapel über Subagenten), dann Volksliederbuch 1915 und
       Sängerhain.
5. [ ] Katalogformat für die App festlegen und Such-UI bauen (Katalog als `.js`, Lieder per
       `<script>` nachladen).
6. [ ] CPDL-Fehlschläge: 689 fehlende Dateien direkt von cpdl.org laden, Taktart- und
       Speicherfehler im Konverter beheben; Mutopia: weitere Partiturstrukturen im LilyPond-Parser.
7. [ ] Stichproben der Bibliothek gegen die PDFs prüfen, Warnungen sichten.
8. [ ] Weitere Sprachen und PDMX, wenn Deutsch steht.
