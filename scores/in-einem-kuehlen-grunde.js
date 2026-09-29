// Untreue, „In einem kühlen Grunde“ – Text: Eichendorff, Melodie: Glück, Satz: Max Reger. Gemeinfrei.
Chorprobe.registerScore({
  "format": "chorprobe/v1",
  "title": "Untreue",
  "subtitle": "In einem kühlen Grunde",
  "composer": "Melodie: Friedrich Glück, 1814 · Text: Joseph von Eichendorff, 1810 · Satz: Max Reger",
  "tempo": 76,
  "ppq": 480,
  "comment": "Vierstimmiger Satz von Max Reger, G-Dur, 6/8. Fünf Strophen auf dieselbe Musik. Der Tenor steht hier im oktavierten Violinschlüssel (in der Vorlage im Bassschlüssel), klingende Tonhöhen sind unverändert.",
  "source": {
    "description": "Übertragen von einer Liederbuchseite (S. 214, Nr. 385 „Untreue“). Gemeinfrei: Joseph von Eichendorff (1788–1857), Friedrich Glück (1798–1840) und Max Reger (1873–1916) sind alle seit mehr als 70 Jahren tot.",
    "complete": true,
    "performanceNotes": "Ruhig, punktierte Viertel etwa 50. Leise (mp) beginnen, in der letzten Zeile kurz an- und wieder abschwellen."
  },
  "voices": [
    {"id": "s", "name": "Sopran", "short": "S", "clef": "treble"},
    {"id": "a", "name": "Alt", "short": "A", "clef": "treble"},
    {"id": "t", "name": "Tenor", "short": "T", "clef": "treble", "displayOctave": 1},
    {"id": "b", "name": "Bass", "short": "B", "clef": "bass"}
  ],
  "verses": [
    {"id": "1", "name": "1. Strophe"},
    {"id": "2", "name": "2. Strophe"},
    {"id": "3", "name": "3. Strophe"},
    {"id": "4", "name": "4. Strophe"},
    {"id": "5", "name": "5. Strophe"}
  ],
  "sections": [
    {"id": "z1", "name": "1. Zeile", "comment": "Takte 0–4 · „In einem kühlen Grunde …“"},
    {"id": "z2", "name": "2. Zeile", "comment": "Takte 5–8 · „… mein Liebchen ist verschwunden …“"},
    {"id": "z3", "name": "3. Zeile", "comment": "Takte 9–12 · Wiederholung der zweiten Textzeile, anders gesetzt."}
  ],
  "measures": [
    {
      "id": "m0",
      "number": "0",
      "section": "z1",
      "meter": [6, 8],
      "keyFifths": 1,
      "lengthTicks": 240,
      "directions": [
        {"at": 0, "text": "Ruhig"}
      ],
      "dynamics": [
        {"at": 0, "mark": "mp"}
      ],
      "voices": {
        "s": [
          {"at": 0, "duration": 240, "pitch": "D4", "lyric": ["In", "Sie", "Ich", "Ich", "Hör"]}
        ],
        "a": [
          {"at": 0, "duration": 240, "pitch": "D4", "lyric": ["In", "Sie", "Ich", "Ich", "Hör"]}
        ],
        "t": [
          {"at": 0, "duration": 240, "pitch": "D4", "lyric": ["In", "Sie", "Ich", "Ich", "Hör"]}
        ],
        "b": [
          {"at": 0, "duration": 240, "pitch": "D3", "lyric": ["In", "Sie", "Ich", "Ich", "Hör"]}
        ]
      },
      "comment": "Auftakt."
    },
    {
      "id": "m1",
      "number": "1",
      "section": "z1",
      "meter": [6, 8],
      "keyFifths": 1,
      "voices": {
        "s": [
          {"at": 0, "duration": 480, "pitch": "B4", "lyric": ["ei-", "hat", "möcht", "möcht", "ich"]},
          {"at": 480, "duration": 240, "pitch": "B4", "lyric": ["nem", "mir", "als", "als", "das"]},
          {"at": 720, "duration": 240, "pitch": "B4", "lyric": ["küh-", "Treu", "Spiel-", "Rei-", "Mühl-"]},
          {"at": 960, "duration": 240, "pitch": "A4"},
          {"at": 1200, "duration": 240, "pitch": "B4", "lyric": ["len", "ver-", "mann", "ter", "rad"]}
        ],
        "a": [
          {"at": 0, "duration": 480, "pitch": "G4", "lyric": ["ei-", "hat", "möcht", "möcht", "ich"]},
          {"at": 480, "duration": 240, "pitch": "G4", "lyric": ["nem", "mir", "als", "als", "das"]},
          {"at": 720, "duration": 240, "pitch": "G4", "lyric": ["küh-", "Treu", "Spiel-", "Rei-", "Mühl-"]},
          {"at": 960, "duration": 240, "pitch": "F#4"},
          {"at": 1200, "duration": 240, "pitch": "F4", "lyric": ["len", "ver-", "mann", "ter", "rad"]}
        ],
        "t": [
          {"at": 0, "duration": 480, "pitch": "D4", "lyric": ["ei-", "hat", "möcht", "möcht", "ich"]},
          {"at": 480, "duration": 240, "pitch": "D4", "lyric": ["nem", "mir", "als", "als", "das"]},
          {"at": 720, "duration": 240, "pitch": "D4", "lyric": ["küh-", "Treu", "Spiel-", "Rei-", "Mühl-"]},
          {"at": 960, "duration": 240, "pitch": "C4"},
          {"at": 1200, "duration": 240, "pitch": "D4", "lyric": ["len", "ver-", "mann", "ter", "rad"]}
        ],
        "b": [
          {"at": 0, "duration": 480, "pitch": "G3", "lyric": ["ei-", "hat", "möcht", "möcht", "ich"]},
          {"at": 480, "duration": 240, "pitch": "G3", "lyric": ["nem", "mir", "als", "als", "das"]},
          {"at": 720, "duration": 480, "pitch": "G3", "lyric": ["küh-", "Treu", "Spiel-", "Rei-", "Mühl-"]},
          {"at": 1200, "duration": 240, "pitch": "G#3", "lyric": ["len", "ver-", "mann", "ter", "rad"]}
        ]
      }
    },
    {
      "id": "m2",
      "number": "2",
      "section": "z1",
      "meter": [6, 8],
      "keyFifths": 1,
      "voices": {
        "s": [
          {"at": 0, "duration": 480, "pitch": "C5", "lyric": ["Grun-", "spro-", "rei-", "flie-", "ge-"], "slur": "start"},
          {"at": 480, "duration": 240, "pitch": "A4", "slur": "end"},
          {"at": 720, "duration": 480, "pitch": "F#4", "lyric": ["de", "chen,", "sen", "gen", "hen,"]},
          {"at": 1200, "duration": 240, "pitch": "D4", "lyric": ["da", "gab", "weit", "wohl", "ich"]}
        ],
        "a": [
          {"at": 0, "duration": 720, "pitch": "E4", "lyric": ["Grun-", "spro-", "rei-", "flie-", "ge-"]},
          {"at": 720, "duration": 480, "pitch": "D4", "lyric": ["de", "chen,", "sen", "gen", "hen,"]},
          {"at": 1200, "duration": 240, "pitch": "A3", "lyric": ["da", "gab", "weit", "wohl", "ich"]}
        ],
        "t": [
          {"at": 0, "duration": 720, "pitch": "C4", "lyric": ["Grun-", "spro-", "rei-", "flie-", "ge-"]},
          {"at": 720, "duration": 480, "pitch": "A3", "lyric": ["de", "chen,", "sen", "gen", "hen,"]},
          {"at": 1200, "duration": 240, "pitch": "F#3", "lyric": ["da", "gab", "weit", "wohl", "ich"]}
        ],
        "b": [
          {"at": 0, "duration": 720, "pitch": "A3", "lyric": ["Grun-", "spro-", "rei-", "flie-", "ge-"]},
          {"at": 720, "duration": 480, "pitch": "D3", "lyric": ["de", "chen,", "sen", "gen", "hen,"]},
          {"at": 1200, "duration": 240, "pitch": "C3", "lyric": ["da", "gab", "weit", "wohl", "ich"]}
        ]
      }
    },
    {
      "id": "m3",
      "number": "3",
      "section": "z1",
      "meter": [6, 8],
      "keyFifths": 1,
      "voices": {
        "s": [
          {"at": 0, "duration": 480, "pitch": "G4", "lyric": ["geht", "mir", "in", "in", "weiß"]},
          {"at": 480, "duration": 240, "pitch": "G4", "lyric": ["ein", "ein", "die", "die", "nicht,"]},
          {"at": 720, "duration": 240, "pitch": "G4", "lyric": ["Müh-", "Ring", "Welt", "blut-", "was"]},
          {"at": 960, "duration": 240, "pitch": "F#4"},
          {"at": 1200, "duration": 240, "pitch": "G4", "lyric": ["len-", "da-", "hin-", "ge", "ich"]}
        ],
        "a": [
          {"at": 0, "duration": 480, "pitch": "D4", "lyric": ["geht", "mir", "in", "in", "weiß"]},
          {"at": 480, "duration": 240, "pitch": "D4", "lyric": ["ein", "ein", "die", "die", "nicht,"]},
          {"at": 720, "duration": 480, "pitch": "B3", "lyric": ["Müh-", "Ring", "Welt", "blut-", "was"]},
          {"at": 1200, "duration": 240, "pitch": "B3", "lyric": ["len-", "da-", "hin-", "ge", "ich"]}
        ],
        "t": [
          {"at": 0, "duration": 480, "pitch": "G3", "lyric": ["geht", "mir", "in", "in", "weiß"]},
          {"at": 480, "duration": 240, "pitch": "G3", "lyric": ["ein", "ein", "die", "die", "nicht,"]},
          {"at": 720, "duration": 480, "pitch": "G3", "lyric": ["Müh-", "Ring", "Welt", "blut-", "was"]},
          {"at": 1200, "duration": 240, "pitch": "G3", "lyric": ["len-", "da-", "hin-", "ge", "ich"]}
        ],
        "b": [
          {"at": 0, "duration": 480, "pitch": "B2", "lyric": ["geht", "mir", "in", "in", "weiß"]},
          {"at": 480, "duration": 240, "pitch": "B2", "lyric": ["ein", "ein", "die", "die", "nicht,"]},
          {"at": 720, "duration": 480, "pitch": "E3", "lyric": ["Müh-", "Ring", "Welt", "blut-", "was"]},
          {"at": 1200, "duration": 240, "pitch": "E3", "lyric": ["len-", "da-", "hin-", "ge", "ich"]}
        ]
      }
    },
    {
      "id": "m4",
      "number": "4",
      "section": "z1",
      "meter": [6, 8],
      "keyFifths": 1,
      "voices": {
        "s": [
          {"at": 0, "duration": 720, "pitch": "A4", "tie": true, "lyric": ["rad;", "bei;", "aus", "Schlacht,", "will,"]},
          {"at": 720, "duration": 240, "pitch": "A4"},
          {"at": 960, "duration": 240, "pitch": null},
          {"at": 1200, "duration": 240, "pitch": "A4", "lyric": ["mein", "sie", "und", "um", "ich"]}
        ],
        "a": [
          {"at": 0, "duration": 720, "pitch": "D4", "tie": true, "lyric": ["rad;", "bei;", "aus", "Schlacht,", "will,"]},
          {"at": 720, "duration": 240, "pitch": "D4"},
          {"at": 960, "duration": 240, "pitch": null},
          {"at": 1200, "duration": 240, "pitch": "F#4", "lyric": ["mein", "sie", "und", "um", "ich"]}
        ],
        "t": [
          {"at": 0, "duration": 720, "pitch": "F#3", "tie": true, "lyric": ["rad;", "bei;", "aus", "Schlacht,", "will,"]},
          {"at": 720, "duration": 240, "pitch": "F#3"},
          {"at": 960, "duration": 240, "pitch": null},
          {"at": 1200, "duration": 240, "pitch": "D4", "lyric": ["mein", "sie", "und", "um", "ich"]}
        ],
        "b": [
          {"at": 0, "duration": 720, "pitch": "D3", "tie": true, "lyric": ["rad;", "bei;", "aus", "Schlacht,", "will,"]},
          {"at": 720, "duration": 240, "pitch": "D3"},
          {"at": 960, "duration": 240, "pitch": null},
          {"at": 1200, "duration": 240, "pitch": "D3", "lyric": ["mein", "sie", "und", "um", "ich"]}
        ]
      }
    },
    {
      "id": "m5",
      "number": "5",
      "section": "z2",
      "meter": [6, 8],
      "keyFifths": 1,
      "voices": {
        "s": [
          {"at": 0, "duration": 480, "pitch": "A4", "lyric": ["Lieb-", "hat", "sin-", "stil-", "möcht"]},
          {"at": 480, "duration": 240, "pitch": "A4", "lyric": ["chen", "die", "gen", "le", "am"]},
          {"at": 720, "duration": 240, "pitch": "A4", "lyric": ["ist", "Treu", "mei-", "Feu-", "lieb-"]},
          {"at": 960, "duration": 240, "pitch": "B4"},
          {"at": 1200, "duration": 240, "pitch": "C5", "lyric": ["ver-", "ge-", "ne", "er", "sten"]}
        ],
        "a": [
          {"at": 0, "duration": 480, "pitch": "E4", "lyric": ["Lieb-", "hat", "sin-", "stil-", "möcht"]},
          {"at": 480, "duration": 240, "pitch": "E4", "lyric": ["chen", "die", "gen", "le", "am"]},
          {"at": 720, "duration": 480, "pitch": "E4", "lyric": ["ist", "Treu", "mei-", "Feu-", "lieb-"]},
          {"at": 1200, "duration": 240, "pitch": "E4", "lyric": ["ver-", "ge-", "ne", "er", "sten"]}
        ],
        "t": [
          {"at": 0, "duration": 480, "pitch": "A3", "lyric": ["Lieb-", "hat", "sin-", "stil-", "möcht"]},
          {"at": 480, "duration": 240, "pitch": "A3", "lyric": ["chen", "die", "gen", "le", "am"]},
          {"at": 720, "duration": 240, "pitch": "A3", "lyric": ["ist", "Treu", "mei-", "Feu-", "lieb-"]},
          {"at": 960, "duration": 240, "pitch": "G#3"},
          {"at": 1200, "duration": 240, "pitch": "A3", "lyric": ["ver-", "ge-", "ne", "er", "sten"]}
        ],
        "b": [
          {"at": 0, "duration": 480, "pitch": "C#3", "lyric": ["Lieb-", "hat", "sin-", "stil-", "möcht"]},
          {"at": 480, "duration": 240, "pitch": "C#3", "lyric": ["chen", "die", "gen", "le", "am"]},
          {"at": 720, "duration": 240, "pitch": "C3", "lyric": ["ist", "Treu", "mei-", "Feu-", "lieb-"]},
          {"at": 960, "duration": 240, "pitch": "B2"},
          {"at": 1200, "duration": 240, "pitch": "A2", "lyric": ["ver-", "ge-", "ne", "er", "sten"]}
        ]
      }
    },
    {
      "id": "m6",
      "number": "6",
      "section": "z2",
      "meter": [6, 8],
      "keyFifths": 1,
      "voices": {
        "s": [
          {"at": 0, "duration": 720, "pitch": "D5", "lyric": ["schwun-", "bro-", "Wei-", "lie-", "ster-"]},
          {"at": 720, "duration": 480, "pitch": "E4", "lyric": ["den,", "chen,", "sen", "gen", "ben,"]},
          {"at": 1200, "duration": 240, "pitch": "A4", "lyric": ["das", "das", "und", "im", "da"]}
        ],
        "a": [
          {"at": 0, "duration": 480, "pitch": "F#4", "lyric": ["schwun-", "bro-", "Wei-", "lie-", "ster-"], "slur": "start"},
          {"at": 480, "duration": 240, "pitch": "F4", "slur": "end"},
          {"at": 720, "duration": 480, "pitch": "E4", "lyric": ["den,", "chen,", "sen", "gen", "ben,"]},
          {"at": 1200, "duration": 240, "pitch": "E4", "lyric": ["das", "das", "und", "im", "da"]}
        ],
        "t": [
          {"at": 0, "duration": 480, "pitch": "A3", "lyric": ["schwun-", "bro-", "Wei-", "lie-", "ster-"], "slur": "start"},
          {"at": 480, "duration": 240, "pitch": "Ab3", "slur": "end"},
          {"at": 720, "duration": 480, "pitch": "G3", "lyric": ["den,", "chen,", "sen", "gen", "ben,"]},
          {"at": 1200, "duration": 240, "pitch": "C4", "lyric": ["das", "das", "und", "im", "da"]}
        ],
        "b": [
          {"at": 0, "duration": 240, "pitch": "D3", "lyric": ["schwun-", "bro-", "Wei-", "lie-", "ster-"]},
          {"at": 240, "duration": 240, "pitch": "C3"},
          {"at": 480, "duration": 240, "pitch": "B2"},
          {"at": 720, "duration": 480, "pitch": "C3", "lyric": ["den,", "chen,", "sen", "gen", "ben,"]},
          {"at": 1200, "duration": 240, "pitch": "A2", "lyric": ["das", "das", "und", "im", "da"]}
        ]
      },
      "comment": "Sopran springt bei „-den“ eine Septime abwärts (D5–E4), so steht es auch in Glücks Melodie. Mittelstimmen chromatisch: Alt Fis–F–E, Tenor A–As–G."
    },
    {
      "id": "m7",
      "number": "7",
      "section": "z2",
      "meter": [6, 8],
      "keyFifths": 1,
      "voices": {
        "s": [
          {"at": 0, "duration": 480, "pitch": "G4", "lyric": ["dort", "Ring-", "gehn", "Feld", "wärs"]},
          {"at": 480, "duration": 240, "pitch": "G4", "lyric": ["ge-", "lein", "von", "bei", "auf"]},
          {"at": 720, "duration": 240, "pitch": "A4", "lyric": ["woh-", "sprang", "Haus", "dunk-", "ein-"]},
          {"at": 960, "duration": 240, "pitch": "G4"},
          {"at": 1200, "duration": 240, "pitch": "A4", "lyric": ["net", "ent-", "zu", "ler", "mal"]}
        ],
        "a": [
          {"at": 0, "duration": 480, "pitch": "D4", "lyric": ["dort", "Ring-", "gehn", "Feld", "wärs"]},
          {"at": 480, "duration": 240, "pitch": "D4", "lyric": ["ge-", "lein", "von", "bei", "auf"]},
          {"at": 720, "duration": 240, "pitch": "F#4", "lyric": ["woh-", "sprang", "Haus", "dunk-", "ein-"]},
          {"at": 960, "duration": 240, "pitch": "E4"},
          {"at": 1200, "duration": 240, "pitch": "F#4", "lyric": ["net", "ent-", "zu", "ler", "mal"]}
        ],
        "t": [
          {"at": 0, "duration": 480, "pitch": "B3", "lyric": ["dort", "Ring-", "gehn", "Feld", "wärs"]},
          {"at": 480, "duration": 240, "pitch": "B3", "lyric": ["ge-", "lein", "von", "bei", "auf"]},
          {"at": 720, "duration": 480, "pitch": "D4", "lyric": ["woh-", "sprang", "Haus", "dunk-", "ein-"]},
          {"at": 1200, "duration": 240, "pitch": "D4", "lyric": ["net", "ent-", "zu", "ler", "mal"]}
        ],
        "b": [
          {"at": 0, "duration": 480, "pitch": "D3", "lyric": ["dort", "Ring-", "gehn", "Feld", "wärs"]},
          {"at": 480, "duration": 240, "pitch": "D3", "lyric": ["ge-", "lein", "von", "bei", "auf"]},
          {"at": 720, "duration": 480, "pitch": "D3", "lyric": ["woh-", "sprang", "Haus", "dunk-", "ein-"]},
          {"at": 1200, "duration": 240, "pitch": "D3", "lyric": ["net", "ent-", "zu", "ler", "mal"]}
        ]
      }
    },
    {
      "id": "m8",
      "number": "8",
      "section": "z2",
      "meter": [6, 8],
      "keyFifths": 1,
      "voices": {
        "s": [
          {"at": 0, "duration": 720, "pitch": "B4", "tie": true, "lyric": ["hat,", "zwei,", "Haus,", "Nacht,", "still,"]},
          {"at": 720, "duration": 240, "pitch": "B4"},
          {"at": 960, "duration": 240, "pitch": null},
          {"at": 1200, "duration": 240, "pitch": "B4", "lyric": ["mein", "sie", "und", "um", "ich"]}
        ],
        "a": [
          {"at": 0, "duration": 720, "pitch": "G4", "tie": true, "lyric": ["hat,", "zwei,", "Haus,", "Nacht,", "still,"]},
          {"at": 720, "duration": 240, "pitch": "G4"},
          {"at": 960, "duration": 240, "pitch": null},
          {"at": 1200, "duration": 240, "pitch": "G4", "lyric": ["mein", "sie", "und", "um", "ich"]}
        ],
        "t": [
          {"at": 0, "duration": 720, "pitch": "D4", "tie": true, "lyric": ["hat,", "zwei,", "Haus,", "Nacht,", "still,"]},
          {"at": 720, "duration": 240, "pitch": "D4"},
          {"at": 960, "duration": 240, "pitch": null},
          {"at": 1200, "duration": 240, "pitch": "D4", "lyric": ["mein", "sie", "und", "um", "ich"]}
        ],
        "b": [
          {"at": 0, "duration": 720, "pitch": "G3", "tie": true, "lyric": ["hat,", "zwei,", "Haus,", "Nacht,", "still,"]},
          {"at": 720, "duration": 240, "pitch": "G3"},
          {"at": 960, "duration": 240, "pitch": null},
          {"at": 1200, "duration": 240, "pitch": "G3", "lyric": ["mein", "sie", "und", "um", "ich"]}
        ]
      }
    },
    {
      "id": "m9",
      "number": "9",
      "section": "z3",
      "meter": [6, 8],
      "keyFifths": 1,
      "dynamics": [
        {"at": 480, "mark": "cresc", "duration": 960}
      ],
      "voices": {
        "s": [
          {"at": 0, "duration": 240, "pitch": "B4", "lyric": ["Lieb-", "hat", "sin-", "stil-", "möcht"]},
          {"at": 240, "duration": 240, "pitch": "A4"},
          {"at": 480, "duration": 240, "pitch": "A4", "lyric": ["chen", "die", "gen", "le", "am"]},
          {"at": 720, "duration": 240, "pitch": "A4", "lyric": ["ist", "Treu", "mei-", "Feu-", "lieb-"]},
          {"at": 960, "duration": 240, "pitch": "B4"},
          {"at": 1200, "duration": 240, "pitch": "C5", "lyric": ["ver-", "ge-", "ne", "er", "sten"]}
        ],
        "a": [
          {"at": 0, "duration": 240, "pitch": "G4", "lyric": ["Lieb-", "hat", "sin-", "stil-", "möcht"]},
          {"at": 240, "duration": 240, "pitch": "F#4"},
          {"at": 480, "duration": 240, "pitch": "F#4", "lyric": ["chen", "die", "gen", "le", "am"]},
          {"at": 720, "duration": 480, "pitch": "F#4", "lyric": ["ist", "Treu", "mei-", "Feu-", "lieb-"]},
          {"at": 1200, "duration": 240, "pitch": "F#4", "lyric": ["ver-", "ge-", "ne", "er", "sten"]}
        ],
        "t": [
          {"at": 0, "duration": 480, "pitch": "D4", "lyric": ["Lieb-", "hat", "sin-", "stil-", "möcht"]},
          {"at": 480, "duration": 240, "pitch": "D4", "lyric": ["chen", "die", "gen", "le", "am"]},
          {"at": 720, "duration": 480, "pitch": "D4", "lyric": ["ist", "Treu", "mei-", "Feu-", "lieb-"]},
          {"at": 1200, "duration": 240, "pitch": "D4", "lyric": ["ver-", "ge-", "ne", "er", "sten"]}
        ],
        "b": [
          {"at": 0, "duration": 480, "pitch": "D3", "lyric": ["Lieb-", "hat", "sin-", "stil-", "möcht"]},
          {"at": 480, "duration": 240, "pitch": "D3", "lyric": ["chen", "die", "gen", "le", "am"]},
          {"at": 720, "duration": 240, "pitch": "C3", "lyric": ["ist", "Treu", "mei-", "Feu-", "lieb-"]},
          {"at": 960, "duration": 240, "pitch": "B2"},
          {"at": 1200, "duration": 240, "pitch": "A2", "lyric": ["ver-", "ge-", "ne", "er", "sten"]}
        ]
      }
    },
    {
      "id": "m10",
      "number": "10",
      "section": "z3",
      "meter": [6, 8],
      "keyFifths": 1,
      "voices": {
        "s": [
          {"at": 0, "duration": 480, "pitch": "D5", "lyric": ["schwun-", "bro-", "Wei-", "lie-", "ster-"], "slur": "start"},
          {"at": 480, "duration": 240, "pitch": "G5", "slur": "end"},
          {"at": 720, "duration": 240, "pitch": "E5", "lyric": ["den,", "chen,", "sen", "gen", "ben,"]},
          {"at": 960, "duration": 240, "pitch": "C5"},
          {"at": 1200, "duration": 240, "pitch": "A4", "lyric": ["das", "das", "und", "im", "da"]}
        ],
        "a": [
          {"at": 0, "duration": 240, "pitch": "F#4", "lyric": ["schwun-", "bro-", "Wei-", "lie-", "ster-"], "slur": "start"},
          {"at": 240, "duration": 480, "pitch": "G4", "slur": "end"},
          {"at": 720, "duration": 480, "pitch": "G4", "lyric": ["den,", "chen,", "sen", "gen", "ben,"]},
          {"at": 1200, "duration": 240, "pitch": "E4", "lyric": ["das", "das", "und", "im", "da"]}
        ],
        "t": [
          {"at": 0, "duration": 720, "pitch": "D4", "lyric": ["schwun-", "bro-", "Wei-", "lie-", "ster-"]},
          {"at": 720, "duration": 240, "pitch": "C4", "lyric": ["den,", "chen,", "sen", "gen", "ben,"]},
          {"at": 960, "duration": 240, "pitch": "E4"},
          {"at": 1200, "duration": 240, "pitch": "C4", "lyric": ["das", "das", "und", "im", "da"]}
        ],
        "b": [
          {"at": 0, "duration": 720, "pitch": "B2", "lyric": ["schwun-", "bro-", "Wei-", "lie-", "ster-"]},
          {"at": 720, "duration": 480, "pitch": "C3", "lyric": ["den,", "chen,", "sen", "gen", "ben,"]},
          {"at": 1200, "duration": 240, "pitch": "C3", "lyric": ["das", "das", "und", "im", "da"]}
        ]
      }
    },
    {
      "id": "m11",
      "number": "11",
      "section": "z3",
      "meter": [6, 8],
      "keyFifths": 1,
      "dynamics": [
        {"at": 960, "mark": "dim", "duration": 1200}
      ],
      "voices": {
        "s": [
          {"at": 0, "duration": 480, "pitch": "G4", "lyric": ["dort", "Ring-", "gehn", "Feld", "wärs"]},
          {"at": 480, "duration": 240, "pitch": "G4", "lyric": ["ge-", "lein", "von", "bei", "auf"]},
          {"at": 720, "duration": 480, "pitch": "B4", "lyric": ["woh-", "sprang", "Haus", "dunk-", "ein-"]},
          {"at": 1200, "duration": 240, "pitch": "A4", "lyric": ["net", "ent-", "zu", "ler", "mal"]}
        ],
        "a": [
          {"at": 0, "duration": 480, "pitch": "D4", "lyric": ["dort", "Ring-", "gehn", "Feld", "wärs"]},
          {"at": 480, "duration": 240, "pitch": "D4", "lyric": ["ge-", "lein", "von", "bei", "auf"]},
          {"at": 720, "duration": 480, "pitch": "G4", "lyric": ["woh-", "sprang", "Haus", "dunk-", "ein-"]},
          {"at": 1200, "duration": 240, "pitch": "F#4", "lyric": ["net", "ent-", "zu", "ler", "mal"]}
        ],
        "t": [
          {"at": 0, "duration": 480, "pitch": "B3", "lyric": ["dort", "Ring-", "gehn", "Feld", "wärs"]},
          {"at": 480, "duration": 240, "pitch": "B3", "lyric": ["ge-", "lein", "von", "bei", "auf"]},
          {"at": 720, "duration": 480, "pitch": "C#4", "lyric": ["woh-", "sprang", "Haus", "dunk-", "ein-"]},
          {"at": 1200, "duration": 240, "pitch": "C4", "lyric": ["net", "ent-", "zu", "ler", "mal"]}
        ],
        "b": [
          {"at": 0, "duration": 480, "pitch": "D3", "lyric": ["dort", "Ring-", "gehn", "Feld", "wärs"]},
          {"at": 480, "duration": 240, "pitch": "D3", "lyric": ["ge-", "lein", "von", "bei", "auf"]},
          {"at": 720, "duration": 480, "pitch": "D3", "lyric": ["woh-", "sprang", "Haus", "dunk-", "ein-"]},
          {"at": 1200, "duration": 240, "pitch": "D3", "lyric": ["net", "ent-", "zu", "ler", "mal"]}
        ]
      }
    },
    {
      "id": "m12",
      "number": "12",
      "section": "z3",
      "meter": [6, 8],
      "keyFifths": 1,
      "lengthTicks": 1200,
      "voices": {
        "s": [
          {"at": 0, "duration": 720, "pitch": "G4", "tie": true, "lyric": ["hat.", "zwei.", "Haus.", "Nacht.", "still."]},
          {"at": 720, "duration": 240, "pitch": "G4"},
          {"at": 960, "duration": 240, "pitch": null}
        ],
        "a": [
          {"at": 0, "duration": 720, "pitch": "D4", "tie": true, "lyric": ["hat.", "zwei.", "Haus.", "Nacht.", "still."]},
          {"at": 720, "duration": 240, "pitch": "D4"},
          {"at": 960, "duration": 240, "pitch": null}
        ],
        "t": [
          {"at": 0, "duration": 720, "pitch": "B3", "tie": true, "lyric": ["hat.", "zwei.", "Haus.", "Nacht.", "still."]},
          {"at": 720, "duration": 240, "pitch": "B3"},
          {"at": 960, "duration": 240, "pitch": null}
        ],
        "b": [
          {"at": 0, "duration": 720, "pitch": "G3", "tie": true, "lyric": ["hat.", "zwei.", "Haus.", "Nacht.", "still."]},
          {"at": 720, "duration": 240, "pitch": "G3"},
          {"at": 960, "duration": 240, "pitch": null}
        ]
      },
      "barlines": [
        {"at": 1200, "kind": "final"}
      ],
      "comment": "Schlusstakt mit fünf Achteln; zusammen mit dem Auftakt ergibt er einen vollen 6/8-Takt."
    }
  ],
  "layout": {
    "pages": [
      {
        "id": "s214",
        "label": "Seite 214",
        "image": "scores/in-einem-kuehlen-grunde.webp",
        "width": 1295,
        "height": 1837,
        "measures": [
          {"id": "m0", "box": [250, 265, 59, 460], "anchors": [ [0, 270], [240, 309] ]},
          {"id": "m1", "box": [309, 265, 260, 460], "anchors": [ [0, 335], [480, 405], [720, 455], [960, 485], [1200, 530], [1440, 569] ]},
          {"id": "m2", "box": [569, 265, 212, 460], "anchors": [ [0, 597], [480, 647], [720, 687], [1200, 745], [1440, 781] ]},
          {"id": "m3", "box": [781, 265, 239, 460], "anchors": [ [0, 810], [480, 870], [720, 917], [960, 950], [1200, 982], [1440, 1020] ]},
          {"id": "m4", "box": [1020, 265, 168, 460], "anchors": [ [0, 1050], [720, 1102], [960, 1137], [1200, 1160], [1440, 1188] ]},
          {"id": "m5", "box": [200, 760, 265, 450], "anchors": [ [0, 240], [480, 297], [720, 356], [960, 387], [1200, 425], [1440, 465] ]},
          {"id": "m6", "box": [465, 760, 247, 450], "anchors": [ [0, 492], [240, 522], [480, 557], [720, 600], [1200, 672], [1440, 712] ]},
          {"id": "m7", "box": [712, 760, 282, 450], "anchors": [ [0, 745], [480, 810], [720, 865], [960, 907], [1200, 955], [1440, 994] ]},
          {"id": "m8", "box": [994, 760, 192, 450], "anchors": [ [0, 1022], [720, 1077], [960, 1120], [1200, 1147], [1440, 1186] ]},
          {"id": "m9", "box": [200, 1250, 299, 460], "anchors": [ [0, 237], [240, 275], [480, 317], [720, 372], [960, 412], [1200, 457], [1440, 499] ]},
          {"id": "m10", "box": [499, 1250, 257, 460], "anchors": [ [0, 527], [240, 565], [480, 592], [720, 640], [960, 675], [1200, 712], [1440, 756] ]},
          {"id": "m11", "box": [756, 1250, 269, 460], "anchors": [ [0, 787], [480, 847], [720, 907], [1200, 980], [1440, 1025] ]},
          {"id": "m12", "box": [1025, 1250, 149, 460], "anchors": [ [0, 1052], [720, 1110], [960, 1155], [1200, 1174] ]}
        ]
      }
    ]
  }
});
