# Chorprobe: Partiturformat v1

Dieses Dokument kann einer KI zusammen mit einem Notenfoto oder einer Partitur gegeben werden. Die KI erzeugt eine UTF-8-JSON-Datei, die über „Lied laden“ geöffnet wird. Daten und Darstellung sind getrennt. Die App enthält keine fest programmierten Melodien.

## Auftrag an eine transkribierende KI

Lies alle Stimmen sorgfältig. Erzeuge ausschließlich eine gültige JSON-Datei im Format `chorprobe/v1` gemäß `score.schema.json`. Verwende klingende Tonhöhen, korrekte Oktaven, vollständig aufgelöste Vorzeichen und exakte Dauern. Übernimm Liedtext und Quellenhinweise. Bei mehreren Strophen lege `verses` an und trage an jeder Note alle Silben als Liste in Strophenreihenfolge ein (`null`, wo eine Strophe keine Silbe hat); die Musik wird nicht pro Strophe wiederholt. Übernimm Dynamik (`pp` bis `ff`, `fp`, `sfz`, Gabeln als `cresc`/`dim` mit Dauer) und Vortragsangaben wie „Ruhig“ oder „Andante“ an der genauen Taktposition. Übernimm Bögen über Melismen und Phrasen mit `slur: "start"` an der ersten und `slur: "end"` an der letzten Note des Bogens, je Stimme. Unterscheide dabei genau: Ein Bogen zwischen zwei **gleich hohen**, direkt aufeinanderfolgenden Noten ist ein Haltebogen (`tie`), ein Bogen über **verschiedene** Töne oder mehrere Noten ist ein Bogen (`slur`); beides zugleich an einer Note ist möglich. Erfinde keine fehlenden Takte. Kennzeichne unsichere Lesarten mit `confidence: "uncertain"` und `comment`. Weise im Kommentar der Partitur auf fehlende Seiten und nicht übertragbare Angaben (Artikulation, Tempowechsel) hin. Prüfe jede Stimme auf Taktlängen, Pausen, Haltebögen und paarweise geschlossene Bögen. Stimme die Daten bei unklaren Stellen mit einer höher aufgelösten Vorlage ab.

## Grundstruktur

```json
{
  "format": "chorprobe/v1",
  "title": "Titel",
  "composer": "Komponist/in",
  "tempo": 96,
  "ppq": 480,
  "voices": [{"id": "s", "name": "Sopran", "clef": "treble"}],
  "sections": [{"id": "a", "name": "Abschnitt A"}],
  "measures": [{
    "id": "m1", "number": "1", "section": "a",
    "meter": [4, 4], "keyFifths": 0,
    "voices": {"s": [
      {"at": 0, "duration": 480, "pitch": "C4", "lyric": "La"},
      {"at": 480, "duration": 1440, "pitch": null}
    ]}
  }]
}
```

`beispiel.json` zeigt ein vollständiges zweistimmiges Beispiel. Das Schema beschreibt alle zulässigen Felder, einschließlich optionaler Originalseiten. Unbekannte Felder werden abgelehnt, damit musikalische Anweisungen nicht unbemerkt verloren gehen.

## Zeit: keine Schätzungen und keine Sekunden

- `ppq` ist die Anzahl Ticks pro Viertelnote. Empfohlen: 480. Zulässig: 24–9600.
- `tempo` bezeichnet immer Viertel pro Minute, auch bei 6/8. Werte 20–300.
- `at` ist der Beginn relativ zum Takt, ab 0. `duration` ist die genaue Dauer. Beide sind ganze Zahlen.
- Bei ppq 480: Ganze = 1920, Halbe = 960, Viertel = 480, Achtel = 240, Sechzehntel = 120. Punktierung multipliziert mit 1,5. Eine Achteltriole dauert 160 Ticks.
- Eine Taktlänge beträgt `ppq × Zähler × 4 / Nenner`.
- Für einen Auftakt oder verkürzten Schlusstakt gibt es `lengthTicks`. Es darf höchstens der vollständigen Taktlänge entsprechen.
- Pausen verwenden `pitch: null`. Nicht belegte Zeit ist ebenfalls still. Für eine vollständig lesbare Darstellung bitte Pausen explizit eintragen.
- Noten innerhalb jeder Stimme müssen nach `at` aufsteigend sortiert sein, dürfen sich nicht überlappen und keine Taktgrenze überschreiten. Übergebundene Noten werden an der Taktgrenze geteilt.
- Takt- und Tonart stehen in **jedem** Takt. So sind Wechsel eindeutig.

## Tonhöhen und Schlüssel

`pitch` verwendet internationale wissenschaftliche Tonbezeichnungen: `C4` = mittleres C = MIDI 60, `A4` = 440 Hz. `B3` ist deutsches H3, `Bb3` ist deutsches B3. Erlaubt sind `#`, `b` sowie doppelte Vorzeichen. Keine deutschen Kürzel wie `Fis4` verwenden.

**Immer die tatsächlich klingende Tonhöhe eintragen.** Ein `F4` klingt natürlich, auch wenn die Tonart Fis vorgibt. `keyFifths` ist Kontext für die Anzeige: −7 bis +7, negativ für b, positiv für Kreuze. Die Übeansicht schreibt die nötigen Vorzeichen direkt an den Noten aus, statt eine separate Vorzeichengruppe zu setzen.

Stimmen haben einen `clef`: `treble` (Violin), `bass`, `alto` (C-Schlüssel auf dritter Linie) oder `tenor` (C-Schlüssel auf vierter Linie). `displayOctave` verschiebt **nur die Darstellung**, nicht den Klang. Für die übliche oktavierende Tenorstimme: `clef: "treble", displayOctave: 1`; ein klingendes `C3` steht dann als C4 im Notenbild. Der Schlüssel erhält eine Oktavkennzeichnung.

Jede Stimme ist monophon. Für gleichzeitig unterschiedliche Töne innerhalb eines Registers bitte getrennte Stimmen anlegen. Unterstützt werden 1–16 Stimmen und bis zu 1000 Takte.

## Haltebögen, Bögen, Text und Kommentare

- `tie: true` bindet die Note an den unmittelbar folgenden gleich hohen Ton derselben Stimme, auch über einen Taktstrich hinweg. Der nächste Ton muss ohne Pause anschließen. `tie` steht am **ersten** Teil, bei längeren Ketten an allen Teilen außer dem letzten. In der Wiedergabe erfolgt kein erneuter Anschlag.
- Bögen (Legato- oder Phrasierungsbögen, z. B. über Melismen) zwischen unterschiedlichen Tönen sind **keine** Haltebögen. `slur: "start"` beginnt einen Bogen an dieser Note, `slur: "end"` beendet ihn an einer späteren Note derselben Stimme. Dazwischen dürfen beliebig viele Noten und auch Taktstriche liegen:
  ```json
  {"at": 0, "duration": 480, "pitch": "C5", "lyric": "La-", "slur": "start"},
  {"at": 480, "duration": 240, "pitch": "A4", "slur": "end"}
  ```
  Regeln: Bögen einer Stimme werden nicht verschachtelt, auf ein `start` folgt also erst ein `end`, bevor ein neues `start` kommt. Ein `end` ohne vorheriges `start` und ein am Partiturende offener Bogen sind Fehler. Pausen tragen weder `start` noch `end`. In Abschnitten mit `unison` stehen Bögen an den Noten der Zielstimme; ein Bogen darf nicht in einen Abschnitt hineinreichen, in dem seine Stimme über `unison` mitgeführt wird. `slur` und `tie` sind unabhängig und dürfen an derselben Note stehen. Bögen ändern die Wiedergabe nicht.
  Darstellung: Der Bogen steht auf der Seite der Notenköpfe, gegenüber den Hälsen, also unter den Noten, wenn alle Hälse nach oben zeigen (und darunter Platz bis zum Liedtext bleibt), sonst über den Noten. Über einen Taktstrich oder Systemumbruch hinweg wird er in Teilstücken gezeichnet. In der Sammelzeile entfallen Bögen.
- `lyric` enthält die Silbe unter der Note, bei Melismen nur auf dem ersten Ton. Trennstriche gehören zum Text. Bei Liedern mit Strophen (siehe unten) ist `lyric` alternativ eine Liste mit einem Eintrag je Strophe.
- `comment` ist auf Partitur-, Abschnitts-, Stimmen-, Takt- und Notenebene möglich. Kommentare verändern die Wiedergabe nicht. Notenkommentare erscheinen beim Anklicken; Unsicherheiten zusätzlich als gelbe Markierung. Taktkommentare erscheinen unter dem Takt; übergeordnete Hinweise in den Anmerkungen.
- `confidence: "uncertain"` bedeutet eine vorläufige Lesart. Ohne dieses Feld wird keine besondere Sicherheit behauptet.
- `source.description` beschreibt die Vorlage. `source.image` kann eine relative Referenz dokumentieren. Externe Bilder aus importierten Dateien werden nicht automatisch geladen.

## Abschnitte, Wiederholungen und gemeinsame Stimmen

Die Liste `measures` definiert die tatsächliche Reihenfolge. Jeder Takt hat eine eindeutige `id` und eine optionale gedruckte `number` als Text. Ein Abschnitt muss zusammenhängend sein und mindestens einen Takt enthalten. Abschnitte sind Übeeinheiten, keine Pflicht: Hat ein Lied keine echten Teile (etwa ein schlichtes Strophenlied), genügt **ein** Abschnitt für alle Takte. Die App blendet die Abschnittswahl dann aus, spielt immer das ganze Stück und bricht die Systeme nur nach Breite um.

Wiederholungen, Da capo, Segno, erste/zweite Klammern und nacheinander einsetzende Gruppen werden für v1 **explizit in die Taktliste aufgelöst**. Takt-IDs müssen dabei neu vergeben werden. Alternativ kann ein zusammenhängender Abschnitt über die Schleife beliebig oft geübt werden. Die App interpretiert keine Wiederholungszeichen aus Kommentaren.

Wenn zwei auswählbare Stimmen in einem Abschnitt dieselbe ungeteilte Stimme singen, kann der Abschnitt eine Zuordnung enthalten:

```json
{"id": "ref", "name": "Refrain", "unison": {"a2": "a1", "b2": "b1"}}
```

In den Takten dieses Abschnitts stehen nur `a1` bzw. `b1`; die gemeinsamen Noten werden nicht doppelt gespeichert oder abgespielt. Wer Alt II auswählt, hört die gemeinsame Altlinie. Im nächsten Abschnitt ohne diese Zuordnung sind die Stimmen wieder unabhängig. `voiceLabels` am Takt kann die Anzeige ändern, z. B. `{"a1": "Alt", "b1": "Bass"}`. IDs bleiben unverändert.

Eine nicht am Takt beteiligte Stimme kann im Stimmenobjekt fehlen. Eine vorhandene Stimme mit leeren Noten `[]` bleibt sichtbar und ist still.

## Darstellung und Wiedergabe

Die App ordnet die Takte responsiv in ein bis drei Spalten an; die Anzahl ist einstellbar. Auf dem Handy erlaubt die manuelle Auswahl zwei Takte pro Zeile, mit kompakterem Notensatz und Liedtext als Textzeile unter der jeweiligen Stimme. „Automatisch“ bleibt auf kleinen Bildschirmen einspaltig. Noten sind anklickbar; der Spielkopf folgt der Position. Gewöhnliche Dauern bis Vierundsechzigstel werden als Notenwerte und Punktierung angezeigt. Andere ganzzahlige Tickdauern, etwa Triolen, werden exakt gespielt und mit ihrer Dauer in Vierteln beschriftet. Es ist eine Übepartitur, kein originalgetreuer Verlagsnotensatz: keine Balkengruppen, keine komplexen Tuplettklammern und keine originalen Seitenumbrüche.

Der automatische Modus spielt im eingestellten konstanten Tempo. Der Tippmodus gibt je Tipp ein Viertel oder Achtel frei, schätzt das Tempo robust aus bis zu sechs vergangenen Abständen und glättet die Anpassung zusätzlich über die Beatdauer. Ein einzelner Vierteltipp ändert das bisherige Tempo höchstens um 10 Prozent, ein Achteltipp höchstens um 5 Prozent. So führen kleine Timing-Schwankungen nicht zu abrupten Sprüngen. Die dazwischenliegenden Noten werden mit diesem geglätteten Tempo geplant. Künftige Tippabstände können nicht vorhergesehen werden. Nach einer Pause von mehr als drei Sekunden beginnt die Schätzung neu. Noch nicht gespielte Zwischentöne können bei einem sehr frühen nächsten Tipp verkürzt werden.

Rubato, Artikulationen und Tempowechsel innerhalb des Stücks sind in v1 Kommentare und werden nicht automatisch ausgeführt. Dynamik und Vortragsangaben haben eigene Felder (siehe unten), Fermaten ebenfalls. Für Fermaten kann im Tippmodus vor dem nächsten Schritt gewartet werden. Die App verwendet einen synthetischen Instrumentalklang, keine gesungenen Silben.

## Validierung und Portabilität

Die App prüft Syntax, Version, Pflichtfelder, Tonhöhen, Stimmen- und Abschnittsverweise, Taktgrenzen, Überlappungen, Haltebögen, Bögen und Abschnittsreihenfolge. Grenzen: 5 MB pro Datei, 50.000 Ereignisse. Fehler lassen das bisher geöffnete Lied unverändert. Eine syntaktische Prüfung ersetzt keine musikalische Korrektur gegen die Vorlage.

Der Import erfolgt lokal im Browser. Es gibt keinen Upload und keine dauerhafte Speicherung importierter Lieder. Die Funktion „Aktuelle Partitur als JSON“ speichert die Daten für eine spätere Sitzung. Mitgelieferte Lieder liegen im Ordner `scores/` als `Chorprobe.registerScore({ … });`; zwischen den Klammern steht genau dieses JSON-Format. Das zuletzt angemeldete Lied wird beim Start geöffnet. Das Datenformat ist davon unabhängig.

## Optionale Originalseiten (abwärtskompatible Ergänzung zu v1)

Mit `layout` lässt sich die originale Seiteneinteilung erhalten. Die App zeigt dann zusätzlich „Originalseiten“ an. Bilder und anklickbare Taktbereiche gehören zur Partiturdatei, nicht zum Programmcode. Ohne `layout` bleibt die Übeansicht unverändert verfügbar.

```json
"layout": {
  "pages": [{
    "id": "p1",
    "label": "Seite 1",
    "image": "data:image/png;base64,HIER_DIE_BILDDATEN",
    "width": 1152,
    "height": 1536,
    "measures": [{
      "id": "m1",
      "box": [220, 180, 270, 360],
      "anchors": [[0, 245], [480, 310], [960, 375], [1440, 440], [1920, 490]]
    }]
  }]
}
```

- Das Beispiel verwendet einen Platzhalter für Bilddaten. `image` ist entweder eine gültige Base64-Data-URL oder ein **relativer Pfad** wie `scores/lied.webp` (Buchstaben, Ziffern, `.`, `_`, `-`, `/`; kein führender `/`, kein `..`; Endung `.jpg`, `.jpeg`, `.png` oder `.webp`). Der Pfad wird relativ zu `index.html` aufgelöst und eignet sich für mitgelieferte Lieder im Ordner `scores/`; `npm run build` bettet solche Bilder in die Offline-Datei ein. **In importierten JSON-Dateien („Lied laden“) funktionieren nur data:-URIs zuverlässig**; lädt ein Pfad nicht, zeigt die App statt des Fotos einen Hinweis. Externe URLs werden nicht akzeptiert. JPEG, PNG und WebP werden unterstützt. SVG wird nicht als Seitenbild akzeptiert.
- `width` und `height` sind die tatsächlichen Pixelmaße des **bereits aufrechten** Bildes.
- `box` ist `[x, y, Breite, Höhe]` für einen Takt über alle Stimmen des Systems, bezogen auf die linke obere Bildecke. Alle vier Werte sind Pixelwerte.
- `id` verweist auf eine Takt-ID der Musikdaten. Ein Takt darf mehrere Bereiche haben, etwa bei einem Seitenwechsel. Mit `fromTick` und `toTick` wird das jeweilige halboffene Tickintervall innerhalb des Takts angegeben. Ohne diese Felder gilt der ganze Takt. Die Bereiche müssen den Takt lückenlos und ohne Überlappung abdecken; alle müssen vollständig im Bild liegen.
- `anchors` sind optionale Paare aus Tickposition **innerhalb des Takts** und horizontaler Pixelposition im Seitenbild. Sie beginnen bei `fromTick` (standardmäßig 0) und enden bei `toTick` (standardmäßig Taktlänge); Tick- und x-Werte müssen streng ansteigen. Sie richten die laufende Markierung an der ungleichmäßigen Notenverteilung aus. Ohne Anker läuft sie linear über den Taktbereich. Bei nicht exakt ausgerichteten Stimmen ist sie eine Orientierung für den ganzen Takt.
- Ein Klick auf den Taktbereich setzt den Start an den Anfang des dargestellten Teils, also bei `Taktbeginn + fromTick`. Für einzelne Noten verwendet man die Übeansicht. Audio, Stimmenmischung und Tippsteuerung funktionieren in beiden Ansichten.
- Auf dem Desktop stehen zwei Originalseiten nebeneinander, auf kleinen Bildschirmen untereinander. Die Originalansicht ist vor allem für größere Bildschirme gedacht.
- `source.complete` kann als `true`/`false` dokumentieren, ob die Vorlage vollständig vorliegt.

Eingebettete Fotos bleiben beim Export erhalten; Bildpfade werden unverändert exportiert. Eine spätere KI kann deshalb sowohl Musikdaten als auch Layoutzuordnung liefern. Die bestehende Importgrenze von 5 MB gilt auch für die Bilddaten.

## Einsatztöne einzeln anhören

Das Fenster „Einsatztöne“ zeigt Schaltflächen für jede beteiligte Stimme. Ein Klick spielt nur diesen Ton und bricht eine noch laufende Tonfolge ab. „Alle nacheinander“ gibt die gesamte Folge aus; „Stopp“ oder das Schließen des Fensters beendet sie sofort. Die Tonhöhen stammen weiterhin ausschließlich aus den Notendaten.

## Vorlagenhinweise und Wiederholungszeichen

`source.performanceNotes` enthält die Aufführungsanweisung aus der Vorlage. Sie steht im Bereich „Aufführung & Hinweise“. `source.copyright` und `source.edition` erscheinen zusätzlich als Quellenvermerk unter der Partitur. Diese Texte sind Teil des Lieds, nicht der App.

Ein Seitenwechsel teilt einen Takt **nicht** musikalisch. Übertrage alle Pausen und Noten in einen vollständigen Takt; ordne nur die Bildbereiche mit `fromTick`/`toTick` getrennt zu. Beispiel: Takt 9 eines Liedes ist 1440 Ticks lang, davon 0–720 auf Seite 1 und 720–1440 auf Seite 2.

`barlines` am Takt ist eine Liste mit `{ "at": 720, "kind": "repeatStart" }`. Mögliche Werte für `kind`: `double`, `final`, `repeatStart`, `repeatEnd`. `at` liegt innerhalb des Takts einschließlich Anfang und Ende. Diese Zeichen werden in der Übeansicht dargestellt und ändern die Zeitachse nicht.

Ein Abschnitt kann `repeatFrom: { "measure": "m9", "tick": 720 }` enthalten. Bei aktivierter Schleife **dieses Abschnitts** startet die nächste Runde an dieser Stelle. Der erste Durchlauf beginnt weiterhin am Abschnittsanfang. Ohne `repeatFrom` wird der ganze Abschnitt wiederholt. „Alles“ wiederholt bei aktivierter Schleife die ganze Partitur. Das ersetzt keine automatische Aufführungsfolge oder verschachtelte Wiederholungen.

## Unabhängige Anzeige und Wiedergabe

„Stimmen üben“ bietet alle Stimmen, nur die Auswahl oder die Auswahl mit leiser Begleitung. „Mit den anderen singen“ spielt standardmäßig alle **außer** den markierten eigenen Stimmen. Eigene Stimmen zur Orientierung und der übrige Chor haben separate Lautstärkeregler. Gemeinsame Stimmen aus `unison` werden dabei aufgelöst.

Die Regler für Begleitung verwenden eine Potenzkurve: `gain = (Prozent / 100) ** log2(10)`. 0 % ist stumm, 50 % entspricht einer Amplitude von 0,1, 100 % entspricht 1. Die Anzeige ist eine Reglerposition, keine Aussage über subjektiv wahrgenommene Lautheit.

Für die Anzeige gibt es eine eigene Stimmenauswahl: „Alle anzeigen“, „Nur Auswahl“ oder „Auswahl + Sammelzeile“. Letzteres erhält die ausgewählten Stimmen als Einzelzeilen und setzt die übrigen farbig auf ein gemeinsames Notensystem. Alle Töne behalten ihre klingende Tonhöhe, auch bei oktavierend notierten Tenorstimmen. Die Einzelansicht behält deren gewohnte Oktavnotation. Texte der zusammengefassten Stimmen erscheinen beim Anklicken der Noten. Die Fotos werden durch diesen Filter nicht verändert. Diese Optionen verändern keine Lieddaten.

## Zusammenhängende Notensysteme

Die gewählte Taktzahl gruppiert die Übeansicht in Systeme mit durchgehenden Notenlinien. Alle Stimmen behalten innerhalb eines Systems dieselbe Höhe und denselben Maßstab; auch unterschiedlich lange Liedtexte verschieben die Linien nicht. Abschnitts- oder Besetzungswechsel beginnen ein neues System. Notenschlüssel stehen am Systemanfang. Die Taktart steht in den Notenlinien am Anfang des angezeigten Abschnitts und bei einer Änderung, nicht erneut vor jedem Takt oder jeder Zeile. Taktzahlen und anklickbare Taktköpfe bleiben erhalten. Wiederholungszeichen werden an der zugehörigen Taktposition dargestellt.


## Fermaten

`fermata: true` zeichnet das Fermatenzeichen über der betreffenden Note oder Pause. Die automatische Wiedergabe verlängert Fermaten auf die 1,5-fache Dauer; alle Stimmen bleiben synchron. Im Tippmodus lässt sich der nächste Einsatz selbst bestimmen. Keine zusätzliche Beschreibung am Takt erforderlich.

## Strophen (optional)

Lieder mit mehreren Strophen auf dieselbe Musik werden **nicht** als wiederholte Takte erfasst. Stattdessen:

```json
"verses": [{"id": "1", "name": "1. Strophe"}, {"id": "2", "name": "2. Strophe"}]
```

- 2 bis 20 Strophen, in Aufführungsreihenfolge. `id` ist ein eindeutiger Text (höchstens 20 Zeichen), `name` höchstens 80 Zeichen.
- `lyric` einer Note ist dann entweder ein Text, der in **jeder** Strophe gleich gesungen wird (z. B. ein Refrain), oder eine Liste mit **genau** so vielen Einträgen wie `verses`: `"lyric": ["In", "Sie", null]`. Jeder Eintrag ist ein Text (höchstens 150 Zeichen) oder `null` für „keine Silbe in dieser Strophe“. Listen sind nur mit `verses` erlaubt.
- Aufführung: Die ganze Partitur wird einmal pro Strophe durchlaufen. Innerhalb jedes Durchlaufs gelten Abschnitte und notierte Wiederholungen wie sonst auch.
- Originalseiten ordnen nur Takte zu; dieselben Takt-IDs gelten für alle Strophen.

In der App wählt „Strophe“ über der Partitur „Alle nacheinander“ (Standard) oder eine einzelne Strophe. Bei „Alle nacheinander“ folgt am Ende der Partitur bzw. des gewählten Abschnitts die nächste Strophe; mit Schleife beginnt danach wieder die erste. Eine gewählte Strophe wird allein gespielt bzw. wiederholt. Ein markierter Übebereich („Nur Bereich“) bleibt in der gerade aktuellen Strophe. Die Übeansicht zeigt alle Strophen untereinander, die aktuelle hervorgehoben; unter „Notenbild“ kann nur die aktuelle Strophe angezeigt werden (auf schmalen Bildschirmen die Voreinstellung).

## Dynamik und Vortragsangaben (optional)

Beide stehen am Takt; `at` ist wie bei Noten die Position in Ticks innerhalb des Takts (ab 0, kleiner als die Taktlänge).

```json
"dynamics": [
  {"at": 0, "mark": "mp"},
  {"at": 720, "mark": "cresc", "duration": 960, "voices": ["t", "b"]},
  {"at": 0, "mark": "f", "verses": ["3"]}
],
"directions": [{"at": 0, "text": "Ruhig"}]
```

- `mark` ist `pp`, `p`, `mp`, `mf`, `f`, `ff`, `fp`, `sfz` oder eine Gabel `cresc` bzw. `dim`. Gabeln brauchen `duration` in Ticks; sie dürfen über den Taktstrich in Folgetakte reichen, müssen aber innerhalb der Partitur enden. Andere Zeichen haben keine `duration`.
- `voices` (optional) beschränkt die Angabe auf diese Stimmen-IDs, sonst gilt sie für alle Stimmen. In Abschnitten mit `unison` gilt eine Angabe für die zusammengeführte Stimme auch für die gemeinsame Linie.
- `verses` (optional, nur mit Strophen) beschränkt die Angabe auf diese Strophen-IDs, z. B. wenn die Vorlage „3. Str. f“ vermerkt.
- `directions` enthält Vortragsangaben wie Tempo- oder Ausdrucksbezeichnungen (Text höchstens 80 Zeichen). Sie erscheinen über dem obersten Notensystem und ändern die Wiedergabe nicht.

Darstellung: Dynamikzeichen stehen kursiv über jeder betroffenen Notenzeile (der Liedtext steht darunter), Gabeln als Keile an der Zeitposition. Strophenabhängige Angaben tragen die Strophennummer und erscheinen in anderen Strophen blass.

Wiedergabe (abschaltbar unter „Klang“ → „Dynamik abspielen“): Jede Note erhält die Lautstärke, die zu ihrem Beginn gilt. Relative Pegel: pp 0,3 · p 0,45 · mp 0,6 · mf 0,75 · f 0,9 · ff 1,0; vor der ersten Angabe gilt mf. mf entspricht der Lautstärke von Liedern ohne Dynamik. Eine Gabel führt linear zur nächsten Angabe, wenn diese höchstens eine Viertel nach dem Gabelende steht, sonst eine Stufe lauter bzw. leiser. `fp` setzt die Note an dieser Stelle laut (f) an und hält sie leise (p); danach gilt p. `sfz` macht nur die Note an dieser Stelle um 0,25 lauter (höchstens 1,0). Die Stimmenmischung (Solo, Begleitung, Mitsingen) wirkt zusätzlich.
