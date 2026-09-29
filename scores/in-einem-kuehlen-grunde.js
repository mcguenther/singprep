// Untreue, „In einem kühlen Grunde“ – Text: Eichendorff, Melodie: Glück, Satz: Max Reger. Gemeinfrei.
Chorprobe.registerScore({
  "format": "chorprobe/v1",
  "title": "Untreue",
  "subtitle": "In einem kühlen Grunde",
  "composer": "Melodie: Friedrich Glück, 1814 · Text: Joseph von Eichendorff, 1810 · Satz: Max Reger",
  "tempo": 76,
  "ppq": 480,
  "comment": "Vierstimmiger Satz von Max Reger, G-Dur, 6/8, „Ruhig“. Alle fünf Strophen sind als eigene Abschnitte ausgeschrieben; die Noten sind in jeder Strophe gleich. Der Tenor steht hier im oktavierten Violinschlüssel (in der Vorlage im Bassschlüssel), klingende Tonhöhen sind unverändert. Dynamik der Vorlage (mp, Crescendo und Decrescendo in der letzten Zeile) wird nicht wiedergegeben.",
  "source": {
    "description": "Übertragen von einer Liederbuchseite (S. 214, Nr. 385 „Untreue“). Gemeinfrei: Joseph von Eichendorff (1788–1857), Friedrich Glück (1798–1840) und Max Reger (1873–1916) sind alle seit mehr als 70 Jahren tot.",
    "complete": true,
    "performanceNotes": "Ruhig, punktierte Viertel etwa 50. Leise (mp) beginnen, die Schlusszeile mit kleinem An- und Abschwellen."
  },
  "voices": [
    {
      "id": "s",
      "name": "Sopran",
      "short": "S",
      "clef": "treble"
    },
    {
      "id": "a",
      "name": "Alt",
      "short": "A",
      "clef": "treble"
    },
    {
      "id": "t",
      "name": "Tenor",
      "short": "T",
      "clef": "treble",
      "displayOctave": 1
    },
    {
      "id": "b",
      "name": "Bass",
      "short": "B",
      "clef": "bass"
    }
  ],
  "sections": [
    {
      "id": "strophe1",
      "name": "1. Strophe",
      "comment": "In einem kühlen Grunde da geht ein Mühlenrad; mein Liebchen ist verschwunden, das dort gewohnet hat, mein Liebchen ist verschwunden, das dort gewohnet hat."
    },
    {
      "id": "strophe2",
      "name": "2. Strophe",
      "comment": "Sie hat mir Treu versprochen, gab mir ein Ring dabei; sie hat die Treu gebrochen, das Ringlein sprang entzwei, sie hat die Treu gebrochen, das Ringlein sprang entzwei."
    },
    {
      "id": "strophe3",
      "name": "3. Strophe",
      "comment": "Ich möcht als Spielmann reisen weit in die Welt hinaus und singen meine Weisen und gehn von Haus zu Haus, und singen meine Weisen und gehn von Haus zu Haus."
    },
    {
      "id": "strophe4",
      "name": "4. Strophe",
      "comment": "Ich möcht als Reiter fliegen wohl in die blutge Schlacht, um stille Feuer liegen im Feld bei dunkler Nacht, um stille Feuer liegen im Feld bei dunkler Nacht."
    },
    {
      "id": "strophe5",
      "name": "5. Strophe",
      "comment": "Hör ich das Mühlrad gehen, ich weiß nicht, was ich will, ich möcht am liebsten sterben, da wärs auf einmal still, ich möcht am liebsten sterben, da wärs auf einmal still."
    }
  ],
  "measures": [
    {
      "id": "s1m0",
      "number": "0",
      "section": "strophe1",
      "meter": [
        6,
        8
      ],
      "keyFifths": 1,
      "voices": {
        "s": [
          {"at": 0, "duration": 240, "pitch": "D4", "lyric": "In"}
        ],
        "a": [
          {"at": 0, "duration": 240, "pitch": "D4", "lyric": "In"}
        ],
        "t": [
          {"at": 0, "duration": 240, "pitch": "D4", "lyric": "In"}
        ],
        "b": [
          {"at": 0, "duration": 240, "pitch": "D3", "lyric": "In"}
        ]
      },
      "lengthTicks": 240,
      "comment": "Auftakt."
    },
    {
      "id": "s1m1",
      "number": "1",
      "section": "strophe1",
      "meter": [
        6,
        8
      ],
      "keyFifths": 1,
      "voices": {
        "s": [
          {"at": 0, "duration": 480, "pitch": "B4", "lyric": "ei-"},
          {"at": 480, "duration": 240, "pitch": "B4", "lyric": "nem"},
          {"at": 720, "duration": 240, "pitch": "B4", "lyric": "küh-"},
          {"at": 960, "duration": 240, "pitch": "A4"},
          {"at": 1200, "duration": 240, "pitch": "B4", "lyric": "len"}
        ],
        "a": [
          {"at": 0, "duration": 480, "pitch": "G4", "lyric": "ei-"},
          {"at": 480, "duration": 240, "pitch": "G4", "lyric": "nem"},
          {"at": 720, "duration": 240, "pitch": "G4", "lyric": "küh-"},
          {"at": 960, "duration": 240, "pitch": "F#4"},
          {"at": 1200, "duration": 240, "pitch": "F4", "lyric": "len"}
        ],
        "t": [
          {"at": 0, "duration": 480, "pitch": "D4", "lyric": "ei-"},
          {"at": 480, "duration": 240, "pitch": "D4", "lyric": "nem"},
          {"at": 720, "duration": 240, "pitch": "D4", "lyric": "küh-"},
          {"at": 960, "duration": 240, "pitch": "C4"},
          {"at": 1200, "duration": 240, "pitch": "D4", "lyric": "len"}
        ],
        "b": [
          {"at": 0, "duration": 480, "pitch": "G3", "lyric": "ei-"},
          {"at": 480, "duration": 240, "pitch": "G3", "lyric": "nem"},
          {"at": 720, "duration": 480, "pitch": "G3", "lyric": "küh-"},
          {"at": 1200, "duration": 240, "pitch": "G#3", "lyric": "len"}
        ]
      }
    },
    {
      "id": "s1m2",
      "number": "2",
      "section": "strophe1",
      "meter": [
        6,
        8
      ],
      "keyFifths": 1,
      "voices": {
        "s": [
          {"at": 0, "duration": 480, "pitch": "C5", "lyric": "Grun-"},
          {"at": 480, "duration": 240, "pitch": "A4"},
          {"at": 720, "duration": 480, "pitch": "F#4", "lyric": "de"},
          {"at": 1200, "duration": 240, "pitch": "D4", "lyric": "da"}
        ],
        "a": [
          {"at": 0, "duration": 720, "pitch": "E4", "lyric": "Grun-"},
          {"at": 720, "duration": 480, "pitch": "D4", "lyric": "de"},
          {"at": 1200, "duration": 240, "pitch": "A3", "lyric": "da"}
        ],
        "t": [
          {"at": 0, "duration": 720, "pitch": "C4", "lyric": "Grun-"},
          {"at": 720, "duration": 480, "pitch": "A3", "lyric": "de"},
          {"at": 1200, "duration": 240, "pitch": "F#3", "lyric": "da"}
        ],
        "b": [
          {"at": 0, "duration": 720, "pitch": "A3", "lyric": "Grun-"},
          {"at": 720, "duration": 480, "pitch": "D3", "lyric": "de"},
          {"at": 1200, "duration": 240, "pitch": "C3", "lyric": "da"}
        ]
      }
    },
    {
      "id": "s1m3",
      "number": "3",
      "section": "strophe1",
      "meter": [
        6,
        8
      ],
      "keyFifths": 1,
      "voices": {
        "s": [
          {"at": 0, "duration": 480, "pitch": "G4", "lyric": "geht"},
          {"at": 480, "duration": 240, "pitch": "G4", "lyric": "ein"},
          {"at": 720, "duration": 240, "pitch": "G4", "lyric": "Müh-"},
          {"at": 960, "duration": 240, "pitch": "F#4"},
          {"at": 1200, "duration": 240, "pitch": "G4", "lyric": "len-"}
        ],
        "a": [
          {"at": 0, "duration": 480, "pitch": "D4", "lyric": "geht"},
          {"at": 480, "duration": 240, "pitch": "D4", "lyric": "ein"},
          {"at": 720, "duration": 480, "pitch": "B3", "lyric": "Müh-"},
          {"at": 1200, "duration": 240, "pitch": "B3", "lyric": "len-"}
        ],
        "t": [
          {"at": 0, "duration": 480, "pitch": "G3", "lyric": "geht"},
          {"at": 480, "duration": 240, "pitch": "G3", "lyric": "ein"},
          {"at": 720, "duration": 480, "pitch": "G3", "lyric": "Müh-"},
          {"at": 1200, "duration": 240, "pitch": "G3", "lyric": "len-"}
        ],
        "b": [
          {"at": 0, "duration": 480, "pitch": "B2", "lyric": "geht"},
          {"at": 480, "duration": 240, "pitch": "B2", "lyric": "ein"},
          {"at": 720, "duration": 480, "pitch": "E3", "lyric": "Müh-"},
          {"at": 1200, "duration": 240, "pitch": "E3", "lyric": "len-"}
        ]
      }
    },
    {
      "id": "s1m4",
      "number": "4",
      "section": "strophe1",
      "meter": [
        6,
        8
      ],
      "keyFifths": 1,
      "voices": {
        "s": [
          {"at": 0, "duration": 720, "pitch": "A4", "tie": true, "lyric": "rad;"},
          {"at": 720, "duration": 240, "pitch": "A4"},
          {"at": 960, "duration": 240, "pitch": null},
          {"at": 1200, "duration": 240, "pitch": "A4", "lyric": "mein"}
        ],
        "a": [
          {"at": 0, "duration": 720, "pitch": "D4", "tie": true, "lyric": "rad;"},
          {"at": 720, "duration": 240, "pitch": "D4"},
          {"at": 960, "duration": 240, "pitch": null},
          {"at": 1200, "duration": 240, "pitch": "F#4", "lyric": "mein"}
        ],
        "t": [
          {"at": 0, "duration": 720, "pitch": "F#3", "tie": true, "lyric": "rad;"},
          {"at": 720, "duration": 240, "pitch": "F#3"},
          {"at": 960, "duration": 240, "pitch": null},
          {"at": 1200, "duration": 240, "pitch": "D4", "lyric": "mein"}
        ],
        "b": [
          {"at": 0, "duration": 720, "pitch": "D3", "tie": true, "lyric": "rad;"},
          {"at": 720, "duration": 240, "pitch": "D3"},
          {"at": 960, "duration": 240, "pitch": null},
          {"at": 1200, "duration": 240, "pitch": "D3", "lyric": "mein"}
        ]
      }
    },
    {
      "id": "s1m5",
      "number": "5",
      "section": "strophe1",
      "meter": [
        6,
        8
      ],
      "keyFifths": 1,
      "voices": {
        "s": [
          {"at": 0, "duration": 480, "pitch": "A4", "lyric": "Lieb-"},
          {"at": 480, "duration": 240, "pitch": "A4", "lyric": "chen"},
          {"at": 720, "duration": 240, "pitch": "A4", "lyric": "ist"},
          {"at": 960, "duration": 240, "pitch": "B4"},
          {"at": 1200, "duration": 240, "pitch": "C5", "lyric": "ver-"}
        ],
        "a": [
          {"at": 0, "duration": 480, "pitch": "E4", "lyric": "Lieb-"},
          {"at": 480, "duration": 240, "pitch": "E4", "lyric": "chen"},
          {"at": 720, "duration": 480, "pitch": "E4", "lyric": "ist"},
          {"at": 1200, "duration": 240, "pitch": "E4", "lyric": "ver-"}
        ],
        "t": [
          {"at": 0, "duration": 480, "pitch": "A3", "lyric": "Lieb-"},
          {"at": 480, "duration": 240, "pitch": "A3", "lyric": "chen"},
          {"at": 720, "duration": 240, "pitch": "A3", "lyric": "ist"},
          {"at": 960, "duration": 240, "pitch": "G#3"},
          {"at": 1200, "duration": 240, "pitch": "A3", "lyric": "ver-"}
        ],
        "b": [
          {"at": 0, "duration": 480, "pitch": "C#3", "lyric": "Lieb-"},
          {"at": 480, "duration": 240, "pitch": "C#3", "lyric": "chen"},
          {"at": 720, "duration": 240, "pitch": "C3", "lyric": "ist"},
          {"at": 960, "duration": 240, "pitch": "B2"},
          {"at": 1200, "duration": 240, "pitch": "A2", "lyric": "ver-"}
        ]
      }
    },
    {
      "id": "s1m6",
      "number": "6",
      "section": "strophe1",
      "meter": [
        6,
        8
      ],
      "keyFifths": 1,
      "voices": {
        "s": [
          {"at": 0, "duration": 720, "pitch": "D5", "lyric": "schwun-"},
          {"at": 720, "duration": 480, "pitch": "E4", "lyric": "den,"},
          {"at": 1200, "duration": 240, "pitch": "A4", "lyric": "das"}
        ],
        "a": [
          {"at": 0, "duration": 480, "pitch": "F#4", "lyric": "schwun-"},
          {"at": 480, "duration": 240, "pitch": "F4"},
          {"at": 720, "duration": 480, "pitch": "E4", "lyric": "den,"},
          {"at": 1200, "duration": 240, "pitch": "E4", "lyric": "das"}
        ],
        "t": [
          {"at": 0, "duration": 480, "pitch": "A3", "lyric": "schwun-"},
          {"at": 480, "duration": 240, "pitch": "Ab3"},
          {"at": 720, "duration": 480, "pitch": "G3", "lyric": "den,"},
          {"at": 1200, "duration": 240, "pitch": "C4", "lyric": "das"}
        ],
        "b": [
          {"at": 0, "duration": 240, "pitch": "D3", "lyric": "schwun-"},
          {"at": 240, "duration": 240, "pitch": "C3"},
          {"at": 480, "duration": 240, "pitch": "B2"},
          {"at": 720, "duration": 480, "pitch": "C3", "lyric": "den,"},
          {"at": 1200, "duration": 240, "pitch": "A2", "lyric": "das"}
        ]
      },
      "comment": "Sopran springt bei „-den“ eine Septime abwärts (D5–E4), so steht es auch in Glücks Melodie. Mittelstimmen chromatisch: Alt Fis–F–E, Tenor A–As–G."
    },
    {
      "id": "s1m7",
      "number": "7",
      "section": "strophe1",
      "meter": [
        6,
        8
      ],
      "keyFifths": 1,
      "voices": {
        "s": [
          {"at": 0, "duration": 480, "pitch": "G4", "lyric": "dort"},
          {"at": 480, "duration": 240, "pitch": "G4", "lyric": "ge-"},
          {"at": 720, "duration": 240, "pitch": "A4", "lyric": "woh-"},
          {"at": 960, "duration": 240, "pitch": "G4"},
          {"at": 1200, "duration": 240, "pitch": "A4", "lyric": "net"}
        ],
        "a": [
          {"at": 0, "duration": 480, "pitch": "D4", "lyric": "dort"},
          {"at": 480, "duration": 240, "pitch": "D4", "lyric": "ge-"},
          {"at": 720, "duration": 240, "pitch": "F#4", "lyric": "woh-"},
          {"at": 960, "duration": 240, "pitch": "E4"},
          {"at": 1200, "duration": 240, "pitch": "F#4", "lyric": "net"}
        ],
        "t": [
          {"at": 0, "duration": 480, "pitch": "B3", "lyric": "dort"},
          {"at": 480, "duration": 240, "pitch": "B3", "lyric": "ge-"},
          {"at": 720, "duration": 480, "pitch": "D4", "lyric": "woh-"},
          {"at": 1200, "duration": 240, "pitch": "D4", "lyric": "net"}
        ],
        "b": [
          {"at": 0, "duration": 480, "pitch": "D3", "lyric": "dort"},
          {"at": 480, "duration": 240, "pitch": "D3", "lyric": "ge-"},
          {"at": 720, "duration": 480, "pitch": "D3", "lyric": "woh-"},
          {"at": 1200, "duration": 240, "pitch": "D3", "lyric": "net"}
        ]
      }
    },
    {
      "id": "s1m8",
      "number": "8",
      "section": "strophe1",
      "meter": [
        6,
        8
      ],
      "keyFifths": 1,
      "voices": {
        "s": [
          {"at": 0, "duration": 720, "pitch": "B4", "tie": true, "lyric": "hat,"},
          {"at": 720, "duration": 240, "pitch": "B4"},
          {"at": 960, "duration": 240, "pitch": null},
          {"at": 1200, "duration": 240, "pitch": "B4", "lyric": "mein"}
        ],
        "a": [
          {"at": 0, "duration": 720, "pitch": "G4", "tie": true, "lyric": "hat,"},
          {"at": 720, "duration": 240, "pitch": "G4"},
          {"at": 960, "duration": 240, "pitch": null},
          {"at": 1200, "duration": 240, "pitch": "G4", "lyric": "mein"}
        ],
        "t": [
          {"at": 0, "duration": 720, "pitch": "D4", "tie": true, "lyric": "hat,"},
          {"at": 720, "duration": 240, "pitch": "D4"},
          {"at": 960, "duration": 240, "pitch": null},
          {"at": 1200, "duration": 240, "pitch": "D4", "lyric": "mein"}
        ],
        "b": [
          {"at": 0, "duration": 720, "pitch": "G3", "tie": true, "lyric": "hat,"},
          {"at": 720, "duration": 240, "pitch": "G3"},
          {"at": 960, "duration": 240, "pitch": null},
          {"at": 1200, "duration": 240, "pitch": "G3", "lyric": "mein"}
        ]
      }
    },
    {
      "id": "s1m9",
      "number": "9",
      "section": "strophe1",
      "meter": [
        6,
        8
      ],
      "keyFifths": 1,
      "voices": {
        "s": [
          {"at": 0, "duration": 240, "pitch": "B4", "lyric": "Lieb-"},
          {"at": 240, "duration": 240, "pitch": "A4"},
          {"at": 480, "duration": 240, "pitch": "A4", "lyric": "chen"},
          {"at": 720, "duration": 240, "pitch": "A4", "lyric": "ist"},
          {"at": 960, "duration": 240, "pitch": "B4"},
          {"at": 1200, "duration": 240, "pitch": "C5", "lyric": "ver-"}
        ],
        "a": [
          {"at": 0, "duration": 240, "pitch": "G4", "lyric": "Lieb-"},
          {"at": 240, "duration": 240, "pitch": "F#4"},
          {"at": 480, "duration": 240, "pitch": "F#4", "lyric": "chen"},
          {"at": 720, "duration": 480, "pitch": "F#4", "lyric": "ist"},
          {"at": 1200, "duration": 240, "pitch": "F#4", "lyric": "ver-"}
        ],
        "t": [
          {"at": 0, "duration": 480, "pitch": "D4", "lyric": "Lieb-"},
          {"at": 480, "duration": 240, "pitch": "D4", "lyric": "chen"},
          {"at": 720, "duration": 480, "pitch": "D4", "lyric": "ist"},
          {"at": 1200, "duration": 240, "pitch": "D4", "lyric": "ver-"}
        ],
        "b": [
          {"at": 0, "duration": 480, "pitch": "D3", "lyric": "Lieb-"},
          {"at": 480, "duration": 240, "pitch": "D3", "lyric": "chen"},
          {"at": 720, "duration": 240, "pitch": "C3", "lyric": "ist"},
          {"at": 960, "duration": 240, "pitch": "B2"},
          {"at": 1200, "duration": 240, "pitch": "A2", "lyric": "ver-"}
        ]
      }
    },
    {
      "id": "s1m10",
      "number": "10",
      "section": "strophe1",
      "meter": [
        6,
        8
      ],
      "keyFifths": 1,
      "voices": {
        "s": [
          {"at": 0, "duration": 480, "pitch": "D5", "lyric": "schwun-"},
          {"at": 480, "duration": 240, "pitch": "G5"},
          {"at": 720, "duration": 240, "pitch": "E5", "lyric": "den,"},
          {"at": 960, "duration": 240, "pitch": "C5"},
          {"at": 1200, "duration": 240, "pitch": "A4", "lyric": "das"}
        ],
        "a": [
          {"at": 0, "duration": 240, "pitch": "F#4", "lyric": "schwun-"},
          {"at": 240, "duration": 480, "pitch": "G4"},
          {"at": 720, "duration": 480, "pitch": "G4", "lyric": "den,"},
          {"at": 1200, "duration": 240, "pitch": "E4", "lyric": "das"}
        ],
        "t": [
          {"at": 0, "duration": 720, "pitch": "D4", "lyric": "schwun-"},
          {"at": 720, "duration": 240, "pitch": "C4", "lyric": "den,"},
          {"at": 960, "duration": 240, "pitch": "E4"},
          {"at": 1200, "duration": 240, "pitch": "C4", "lyric": "das"}
        ],
        "b": [
          {"at": 0, "duration": 720, "pitch": "B2", "lyric": "schwun-"},
          {"at": 720, "duration": 480, "pitch": "C3", "lyric": "den,"},
          {"at": 1200, "duration": 240, "pitch": "C3", "lyric": "das"}
        ]
      }
    },
    {
      "id": "s1m11",
      "number": "11",
      "section": "strophe1",
      "meter": [
        6,
        8
      ],
      "keyFifths": 1,
      "voices": {
        "s": [
          {"at": 0, "duration": 480, "pitch": "G4", "lyric": "dort"},
          {"at": 480, "duration": 240, "pitch": "G4", "lyric": "ge-"},
          {"at": 720, "duration": 480, "pitch": "B4", "lyric": "woh-"},
          {"at": 1200, "duration": 240, "pitch": "A4", "lyric": "net"}
        ],
        "a": [
          {"at": 0, "duration": 480, "pitch": "D4", "lyric": "dort"},
          {"at": 480, "duration": 240, "pitch": "D4", "lyric": "ge-"},
          {"at": 720, "duration": 480, "pitch": "G4", "lyric": "woh-"},
          {"at": 1200, "duration": 240, "pitch": "F#4", "lyric": "net"}
        ],
        "t": [
          {"at": 0, "duration": 480, "pitch": "B3", "lyric": "dort"},
          {"at": 480, "duration": 240, "pitch": "B3", "lyric": "ge-"},
          {"at": 720, "duration": 480, "pitch": "C#4", "lyric": "woh-"},
          {"at": 1200, "duration": 240, "pitch": "C4", "lyric": "net"}
        ],
        "b": [
          {"at": 0, "duration": 480, "pitch": "D3", "lyric": "dort"},
          {"at": 480, "duration": 240, "pitch": "D3", "lyric": "ge-"},
          {"at": 720, "duration": 480, "pitch": "D3", "lyric": "woh-"},
          {"at": 1200, "duration": 240, "pitch": "D3", "lyric": "net"}
        ]
      }
    },
    {
      "id": "s1m12",
      "number": "12",
      "section": "strophe1",
      "meter": [
        6,
        8
      ],
      "keyFifths": 1,
      "voices": {
        "s": [
          {"at": 0, "duration": 720, "pitch": "G4", "tie": true, "lyric": "hat."},
          {"at": 720, "duration": 240, "pitch": "G4"},
          {"at": 960, "duration": 240, "pitch": null}
        ],
        "a": [
          {"at": 0, "duration": 720, "pitch": "D4", "tie": true, "lyric": "hat."},
          {"at": 720, "duration": 240, "pitch": "D4"},
          {"at": 960, "duration": 240, "pitch": null}
        ],
        "t": [
          {"at": 0, "duration": 720, "pitch": "B3", "tie": true, "lyric": "hat."},
          {"at": 720, "duration": 240, "pitch": "B3"},
          {"at": 960, "duration": 240, "pitch": null}
        ],
        "b": [
          {"at": 0, "duration": 720, "pitch": "G3", "tie": true, "lyric": "hat."},
          {"at": 720, "duration": 240, "pitch": "G3"},
          {"at": 960, "duration": 240, "pitch": null}
        ]
      },
      "lengthTicks": 1200,
      "barlines": [
        {"at": 1200, "kind": "double"}
      ],
      "comment": "Schlusstakt mit fünf Achteln; zusammen mit dem Auftakt ergibt er einen vollen 6/8-Takt."
    },
    {
      "id": "s2m0",
      "number": "0",
      "section": "strophe2",
      "meter": [
        6,
        8
      ],
      "keyFifths": 1,
      "voices": {
        "s": [
          {"at": 0, "duration": 240, "pitch": "D4", "lyric": "Sie"}
        ],
        "a": [
          {"at": 0, "duration": 240, "pitch": "D4", "lyric": "Sie"}
        ],
        "t": [
          {"at": 0, "duration": 240, "pitch": "D4", "lyric": "Sie"}
        ],
        "b": [
          {"at": 0, "duration": 240, "pitch": "D3", "lyric": "Sie"}
        ]
      },
      "lengthTicks": 240
    },
    {
      "id": "s2m1",
      "number": "1",
      "section": "strophe2",
      "meter": [
        6,
        8
      ],
      "keyFifths": 1,
      "voices": {
        "s": [
          {"at": 0, "duration": 480, "pitch": "B4", "lyric": "hat"},
          {"at": 480, "duration": 240, "pitch": "B4", "lyric": "mir"},
          {"at": 720, "duration": 240, "pitch": "B4", "lyric": "Treu"},
          {"at": 960, "duration": 240, "pitch": "A4"},
          {"at": 1200, "duration": 240, "pitch": "B4", "lyric": "ver-"}
        ],
        "a": [
          {"at": 0, "duration": 480, "pitch": "G4", "lyric": "hat"},
          {"at": 480, "duration": 240, "pitch": "G4", "lyric": "mir"},
          {"at": 720, "duration": 240, "pitch": "G4", "lyric": "Treu"},
          {"at": 960, "duration": 240, "pitch": "F#4"},
          {"at": 1200, "duration": 240, "pitch": "F4", "lyric": "ver-"}
        ],
        "t": [
          {"at": 0, "duration": 480, "pitch": "D4", "lyric": "hat"},
          {"at": 480, "duration": 240, "pitch": "D4", "lyric": "mir"},
          {"at": 720, "duration": 240, "pitch": "D4", "lyric": "Treu"},
          {"at": 960, "duration": 240, "pitch": "C4"},
          {"at": 1200, "duration": 240, "pitch": "D4", "lyric": "ver-"}
        ],
        "b": [
          {"at": 0, "duration": 480, "pitch": "G3", "lyric": "hat"},
          {"at": 480, "duration": 240, "pitch": "G3", "lyric": "mir"},
          {"at": 720, "duration": 480, "pitch": "G3", "lyric": "Treu"},
          {"at": 1200, "duration": 240, "pitch": "G#3", "lyric": "ver-"}
        ]
      }
    },
    {
      "id": "s2m2",
      "number": "2",
      "section": "strophe2",
      "meter": [
        6,
        8
      ],
      "keyFifths": 1,
      "voices": {
        "s": [
          {"at": 0, "duration": 480, "pitch": "C5", "lyric": "spro-"},
          {"at": 480, "duration": 240, "pitch": "A4"},
          {"at": 720, "duration": 480, "pitch": "F#4", "lyric": "chen,"},
          {"at": 1200, "duration": 240, "pitch": "D4", "lyric": "gab"}
        ],
        "a": [
          {"at": 0, "duration": 720, "pitch": "E4", "lyric": "spro-"},
          {"at": 720, "duration": 480, "pitch": "D4", "lyric": "chen,"},
          {"at": 1200, "duration": 240, "pitch": "A3", "lyric": "gab"}
        ],
        "t": [
          {"at": 0, "duration": 720, "pitch": "C4", "lyric": "spro-"},
          {"at": 720, "duration": 480, "pitch": "A3", "lyric": "chen,"},
          {"at": 1200, "duration": 240, "pitch": "F#3", "lyric": "gab"}
        ],
        "b": [
          {"at": 0, "duration": 720, "pitch": "A3", "lyric": "spro-"},
          {"at": 720, "duration": 480, "pitch": "D3", "lyric": "chen,"},
          {"at": 1200, "duration": 240, "pitch": "C3", "lyric": "gab"}
        ]
      }
    },
    {
      "id": "s2m3",
      "number": "3",
      "section": "strophe2",
      "meter": [
        6,
        8
      ],
      "keyFifths": 1,
      "voices": {
        "s": [
          {"at": 0, "duration": 480, "pitch": "G4", "lyric": "mir"},
          {"at": 480, "duration": 240, "pitch": "G4", "lyric": "ein"},
          {"at": 720, "duration": 240, "pitch": "G4", "lyric": "Ring"},
          {"at": 960, "duration": 240, "pitch": "F#4"},
          {"at": 1200, "duration": 240, "pitch": "G4", "lyric": "da-"}
        ],
        "a": [
          {"at": 0, "duration": 480, "pitch": "D4", "lyric": "mir"},
          {"at": 480, "duration": 240, "pitch": "D4", "lyric": "ein"},
          {"at": 720, "duration": 480, "pitch": "B3", "lyric": "Ring"},
          {"at": 1200, "duration": 240, "pitch": "B3", "lyric": "da-"}
        ],
        "t": [
          {"at": 0, "duration": 480, "pitch": "G3", "lyric": "mir"},
          {"at": 480, "duration": 240, "pitch": "G3", "lyric": "ein"},
          {"at": 720, "duration": 480, "pitch": "G3", "lyric": "Ring"},
          {"at": 1200, "duration": 240, "pitch": "G3", "lyric": "da-"}
        ],
        "b": [
          {"at": 0, "duration": 480, "pitch": "B2", "lyric": "mir"},
          {"at": 480, "duration": 240, "pitch": "B2", "lyric": "ein"},
          {"at": 720, "duration": 480, "pitch": "E3", "lyric": "Ring"},
          {"at": 1200, "duration": 240, "pitch": "E3", "lyric": "da-"}
        ]
      }
    },
    {
      "id": "s2m4",
      "number": "4",
      "section": "strophe2",
      "meter": [
        6,
        8
      ],
      "keyFifths": 1,
      "voices": {
        "s": [
          {"at": 0, "duration": 720, "pitch": "A4", "tie": true, "lyric": "bei;"},
          {"at": 720, "duration": 240, "pitch": "A4"},
          {"at": 960, "duration": 240, "pitch": null},
          {"at": 1200, "duration": 240, "pitch": "A4", "lyric": "sie"}
        ],
        "a": [
          {"at": 0, "duration": 720, "pitch": "D4", "tie": true, "lyric": "bei;"},
          {"at": 720, "duration": 240, "pitch": "D4"},
          {"at": 960, "duration": 240, "pitch": null},
          {"at": 1200, "duration": 240, "pitch": "F#4", "lyric": "sie"}
        ],
        "t": [
          {"at": 0, "duration": 720, "pitch": "F#3", "tie": true, "lyric": "bei;"},
          {"at": 720, "duration": 240, "pitch": "F#3"},
          {"at": 960, "duration": 240, "pitch": null},
          {"at": 1200, "duration": 240, "pitch": "D4", "lyric": "sie"}
        ],
        "b": [
          {"at": 0, "duration": 720, "pitch": "D3", "tie": true, "lyric": "bei;"},
          {"at": 720, "duration": 240, "pitch": "D3"},
          {"at": 960, "duration": 240, "pitch": null},
          {"at": 1200, "duration": 240, "pitch": "D3", "lyric": "sie"}
        ]
      }
    },
    {
      "id": "s2m5",
      "number": "5",
      "section": "strophe2",
      "meter": [
        6,
        8
      ],
      "keyFifths": 1,
      "voices": {
        "s": [
          {"at": 0, "duration": 480, "pitch": "A4", "lyric": "hat"},
          {"at": 480, "duration": 240, "pitch": "A4", "lyric": "die"},
          {"at": 720, "duration": 240, "pitch": "A4", "lyric": "Treu"},
          {"at": 960, "duration": 240, "pitch": "B4"},
          {"at": 1200, "duration": 240, "pitch": "C5", "lyric": "ge-"}
        ],
        "a": [
          {"at": 0, "duration": 480, "pitch": "E4", "lyric": "hat"},
          {"at": 480, "duration": 240, "pitch": "E4", "lyric": "die"},
          {"at": 720, "duration": 480, "pitch": "E4", "lyric": "Treu"},
          {"at": 1200, "duration": 240, "pitch": "E4", "lyric": "ge-"}
        ],
        "t": [
          {"at": 0, "duration": 480, "pitch": "A3", "lyric": "hat"},
          {"at": 480, "duration": 240, "pitch": "A3", "lyric": "die"},
          {"at": 720, "duration": 240, "pitch": "A3", "lyric": "Treu"},
          {"at": 960, "duration": 240, "pitch": "G#3"},
          {"at": 1200, "duration": 240, "pitch": "A3", "lyric": "ge-"}
        ],
        "b": [
          {"at": 0, "duration": 480, "pitch": "C#3", "lyric": "hat"},
          {"at": 480, "duration": 240, "pitch": "C#3", "lyric": "die"},
          {"at": 720, "duration": 240, "pitch": "C3", "lyric": "Treu"},
          {"at": 960, "duration": 240, "pitch": "B2"},
          {"at": 1200, "duration": 240, "pitch": "A2", "lyric": "ge-"}
        ]
      }
    },
    {
      "id": "s2m6",
      "number": "6",
      "section": "strophe2",
      "meter": [
        6,
        8
      ],
      "keyFifths": 1,
      "voices": {
        "s": [
          {"at": 0, "duration": 720, "pitch": "D5", "lyric": "bro-"},
          {"at": 720, "duration": 480, "pitch": "E4", "lyric": "chen,"},
          {"at": 1200, "duration": 240, "pitch": "A4", "lyric": "das"}
        ],
        "a": [
          {"at": 0, "duration": 480, "pitch": "F#4", "lyric": "bro-"},
          {"at": 480, "duration": 240, "pitch": "F4"},
          {"at": 720, "duration": 480, "pitch": "E4", "lyric": "chen,"},
          {"at": 1200, "duration": 240, "pitch": "E4", "lyric": "das"}
        ],
        "t": [
          {"at": 0, "duration": 480, "pitch": "A3", "lyric": "bro-"},
          {"at": 480, "duration": 240, "pitch": "Ab3"},
          {"at": 720, "duration": 480, "pitch": "G3", "lyric": "chen,"},
          {"at": 1200, "duration": 240, "pitch": "C4", "lyric": "das"}
        ],
        "b": [
          {"at": 0, "duration": 240, "pitch": "D3", "lyric": "bro-"},
          {"at": 240, "duration": 240, "pitch": "C3"},
          {"at": 480, "duration": 240, "pitch": "B2"},
          {"at": 720, "duration": 480, "pitch": "C3", "lyric": "chen,"},
          {"at": 1200, "duration": 240, "pitch": "A2", "lyric": "das"}
        ]
      }
    },
    {
      "id": "s2m7",
      "number": "7",
      "section": "strophe2",
      "meter": [
        6,
        8
      ],
      "keyFifths": 1,
      "voices": {
        "s": [
          {"at": 0, "duration": 480, "pitch": "G4", "lyric": "Ring-"},
          {"at": 480, "duration": 240, "pitch": "G4", "lyric": "lein"},
          {"at": 720, "duration": 240, "pitch": "A4", "lyric": "sprang"},
          {"at": 960, "duration": 240, "pitch": "G4"},
          {"at": 1200, "duration": 240, "pitch": "A4", "lyric": "ent-"}
        ],
        "a": [
          {"at": 0, "duration": 480, "pitch": "D4", "lyric": "Ring-"},
          {"at": 480, "duration": 240, "pitch": "D4", "lyric": "lein"},
          {"at": 720, "duration": 240, "pitch": "F#4", "lyric": "sprang"},
          {"at": 960, "duration": 240, "pitch": "E4"},
          {"at": 1200, "duration": 240, "pitch": "F#4", "lyric": "ent-"}
        ],
        "t": [
          {"at": 0, "duration": 480, "pitch": "B3", "lyric": "Ring-"},
          {"at": 480, "duration": 240, "pitch": "B3", "lyric": "lein"},
          {"at": 720, "duration": 480, "pitch": "D4", "lyric": "sprang"},
          {"at": 1200, "duration": 240, "pitch": "D4", "lyric": "ent-"}
        ],
        "b": [
          {"at": 0, "duration": 480, "pitch": "D3", "lyric": "Ring-"},
          {"at": 480, "duration": 240, "pitch": "D3", "lyric": "lein"},
          {"at": 720, "duration": 480, "pitch": "D3", "lyric": "sprang"},
          {"at": 1200, "duration": 240, "pitch": "D3", "lyric": "ent-"}
        ]
      }
    },
    {
      "id": "s2m8",
      "number": "8",
      "section": "strophe2",
      "meter": [
        6,
        8
      ],
      "keyFifths": 1,
      "voices": {
        "s": [
          {"at": 0, "duration": 720, "pitch": "B4", "tie": true, "lyric": "zwei,"},
          {"at": 720, "duration": 240, "pitch": "B4"},
          {"at": 960, "duration": 240, "pitch": null},
          {"at": 1200, "duration": 240, "pitch": "B4", "lyric": "sie"}
        ],
        "a": [
          {"at": 0, "duration": 720, "pitch": "G4", "tie": true, "lyric": "zwei,"},
          {"at": 720, "duration": 240, "pitch": "G4"},
          {"at": 960, "duration": 240, "pitch": null},
          {"at": 1200, "duration": 240, "pitch": "G4", "lyric": "sie"}
        ],
        "t": [
          {"at": 0, "duration": 720, "pitch": "D4", "tie": true, "lyric": "zwei,"},
          {"at": 720, "duration": 240, "pitch": "D4"},
          {"at": 960, "duration": 240, "pitch": null},
          {"at": 1200, "duration": 240, "pitch": "D4", "lyric": "sie"}
        ],
        "b": [
          {"at": 0, "duration": 720, "pitch": "G3", "tie": true, "lyric": "zwei,"},
          {"at": 720, "duration": 240, "pitch": "G3"},
          {"at": 960, "duration": 240, "pitch": null},
          {"at": 1200, "duration": 240, "pitch": "G3", "lyric": "sie"}
        ]
      }
    },
    {
      "id": "s2m9",
      "number": "9",
      "section": "strophe2",
      "meter": [
        6,
        8
      ],
      "keyFifths": 1,
      "voices": {
        "s": [
          {"at": 0, "duration": 240, "pitch": "B4", "lyric": "hat"},
          {"at": 240, "duration": 240, "pitch": "A4"},
          {"at": 480, "duration": 240, "pitch": "A4", "lyric": "die"},
          {"at": 720, "duration": 240, "pitch": "A4", "lyric": "Treu"},
          {"at": 960, "duration": 240, "pitch": "B4"},
          {"at": 1200, "duration": 240, "pitch": "C5", "lyric": "ge-"}
        ],
        "a": [
          {"at": 0, "duration": 240, "pitch": "G4", "lyric": "hat"},
          {"at": 240, "duration": 240, "pitch": "F#4"},
          {"at": 480, "duration": 240, "pitch": "F#4", "lyric": "die"},
          {"at": 720, "duration": 480, "pitch": "F#4", "lyric": "Treu"},
          {"at": 1200, "duration": 240, "pitch": "F#4", "lyric": "ge-"}
        ],
        "t": [
          {"at": 0, "duration": 480, "pitch": "D4", "lyric": "hat"},
          {"at": 480, "duration": 240, "pitch": "D4", "lyric": "die"},
          {"at": 720, "duration": 480, "pitch": "D4", "lyric": "Treu"},
          {"at": 1200, "duration": 240, "pitch": "D4", "lyric": "ge-"}
        ],
        "b": [
          {"at": 0, "duration": 480, "pitch": "D3", "lyric": "hat"},
          {"at": 480, "duration": 240, "pitch": "D3", "lyric": "die"},
          {"at": 720, "duration": 240, "pitch": "C3", "lyric": "Treu"},
          {"at": 960, "duration": 240, "pitch": "B2"},
          {"at": 1200, "duration": 240, "pitch": "A2", "lyric": "ge-"}
        ]
      }
    },
    {
      "id": "s2m10",
      "number": "10",
      "section": "strophe2",
      "meter": [
        6,
        8
      ],
      "keyFifths": 1,
      "voices": {
        "s": [
          {"at": 0, "duration": 480, "pitch": "D5", "lyric": "bro-"},
          {"at": 480, "duration": 240, "pitch": "G5"},
          {"at": 720, "duration": 240, "pitch": "E5", "lyric": "chen,"},
          {"at": 960, "duration": 240, "pitch": "C5"},
          {"at": 1200, "duration": 240, "pitch": "A4", "lyric": "das"}
        ],
        "a": [
          {"at": 0, "duration": 240, "pitch": "F#4", "lyric": "bro-"},
          {"at": 240, "duration": 480, "pitch": "G4"},
          {"at": 720, "duration": 480, "pitch": "G4", "lyric": "chen,"},
          {"at": 1200, "duration": 240, "pitch": "E4", "lyric": "das"}
        ],
        "t": [
          {"at": 0, "duration": 720, "pitch": "D4", "lyric": "bro-"},
          {"at": 720, "duration": 240, "pitch": "C4", "lyric": "chen,"},
          {"at": 960, "duration": 240, "pitch": "E4"},
          {"at": 1200, "duration": 240, "pitch": "C4", "lyric": "das"}
        ],
        "b": [
          {"at": 0, "duration": 720, "pitch": "B2", "lyric": "bro-"},
          {"at": 720, "duration": 480, "pitch": "C3", "lyric": "chen,"},
          {"at": 1200, "duration": 240, "pitch": "C3", "lyric": "das"}
        ]
      }
    },
    {
      "id": "s2m11",
      "number": "11",
      "section": "strophe2",
      "meter": [
        6,
        8
      ],
      "keyFifths": 1,
      "voices": {
        "s": [
          {"at": 0, "duration": 480, "pitch": "G4", "lyric": "Ring-"},
          {"at": 480, "duration": 240, "pitch": "G4", "lyric": "lein"},
          {"at": 720, "duration": 480, "pitch": "B4", "lyric": "sprang"},
          {"at": 1200, "duration": 240, "pitch": "A4", "lyric": "ent-"}
        ],
        "a": [
          {"at": 0, "duration": 480, "pitch": "D4", "lyric": "Ring-"},
          {"at": 480, "duration": 240, "pitch": "D4", "lyric": "lein"},
          {"at": 720, "duration": 480, "pitch": "G4", "lyric": "sprang"},
          {"at": 1200, "duration": 240, "pitch": "F#4", "lyric": "ent-"}
        ],
        "t": [
          {"at": 0, "duration": 480, "pitch": "B3", "lyric": "Ring-"},
          {"at": 480, "duration": 240, "pitch": "B3", "lyric": "lein"},
          {"at": 720, "duration": 480, "pitch": "C#4", "lyric": "sprang"},
          {"at": 1200, "duration": 240, "pitch": "C4", "lyric": "ent-"}
        ],
        "b": [
          {"at": 0, "duration": 480, "pitch": "D3", "lyric": "Ring-"},
          {"at": 480, "duration": 240, "pitch": "D3", "lyric": "lein"},
          {"at": 720, "duration": 480, "pitch": "D3", "lyric": "sprang"},
          {"at": 1200, "duration": 240, "pitch": "D3", "lyric": "ent-"}
        ]
      }
    },
    {
      "id": "s2m12",
      "number": "12",
      "section": "strophe2",
      "meter": [
        6,
        8
      ],
      "keyFifths": 1,
      "voices": {
        "s": [
          {"at": 0, "duration": 720, "pitch": "G4", "tie": true, "lyric": "zwei."},
          {"at": 720, "duration": 240, "pitch": "G4"},
          {"at": 960, "duration": 240, "pitch": null}
        ],
        "a": [
          {"at": 0, "duration": 720, "pitch": "D4", "tie": true, "lyric": "zwei."},
          {"at": 720, "duration": 240, "pitch": "D4"},
          {"at": 960, "duration": 240, "pitch": null}
        ],
        "t": [
          {"at": 0, "duration": 720, "pitch": "B3", "tie": true, "lyric": "zwei."},
          {"at": 720, "duration": 240, "pitch": "B3"},
          {"at": 960, "duration": 240, "pitch": null}
        ],
        "b": [
          {"at": 0, "duration": 720, "pitch": "G3", "tie": true, "lyric": "zwei."},
          {"at": 720, "duration": 240, "pitch": "G3"},
          {"at": 960, "duration": 240, "pitch": null}
        ]
      },
      "lengthTicks": 1200,
      "barlines": [
        {"at": 1200, "kind": "double"}
      ]
    },
    {
      "id": "s3m0",
      "number": "0",
      "section": "strophe3",
      "meter": [
        6,
        8
      ],
      "keyFifths": 1,
      "voices": {
        "s": [
          {"at": 0, "duration": 240, "pitch": "D4", "lyric": "Ich"}
        ],
        "a": [
          {"at": 0, "duration": 240, "pitch": "D4", "lyric": "Ich"}
        ],
        "t": [
          {"at": 0, "duration": 240, "pitch": "D4", "lyric": "Ich"}
        ],
        "b": [
          {"at": 0, "duration": 240, "pitch": "D3", "lyric": "Ich"}
        ]
      },
      "lengthTicks": 240
    },
    {
      "id": "s3m1",
      "number": "1",
      "section": "strophe3",
      "meter": [
        6,
        8
      ],
      "keyFifths": 1,
      "voices": {
        "s": [
          {"at": 0, "duration": 480, "pitch": "B4", "lyric": "möcht"},
          {"at": 480, "duration": 240, "pitch": "B4", "lyric": "als"},
          {"at": 720, "duration": 240, "pitch": "B4", "lyric": "Spiel-"},
          {"at": 960, "duration": 240, "pitch": "A4"},
          {"at": 1200, "duration": 240, "pitch": "B4", "lyric": "mann"}
        ],
        "a": [
          {"at": 0, "duration": 480, "pitch": "G4", "lyric": "möcht"},
          {"at": 480, "duration": 240, "pitch": "G4", "lyric": "als"},
          {"at": 720, "duration": 240, "pitch": "G4", "lyric": "Spiel-"},
          {"at": 960, "duration": 240, "pitch": "F#4"},
          {"at": 1200, "duration": 240, "pitch": "F4", "lyric": "mann"}
        ],
        "t": [
          {"at": 0, "duration": 480, "pitch": "D4", "lyric": "möcht"},
          {"at": 480, "duration": 240, "pitch": "D4", "lyric": "als"},
          {"at": 720, "duration": 240, "pitch": "D4", "lyric": "Spiel-"},
          {"at": 960, "duration": 240, "pitch": "C4"},
          {"at": 1200, "duration": 240, "pitch": "D4", "lyric": "mann"}
        ],
        "b": [
          {"at": 0, "duration": 480, "pitch": "G3", "lyric": "möcht"},
          {"at": 480, "duration": 240, "pitch": "G3", "lyric": "als"},
          {"at": 720, "duration": 480, "pitch": "G3", "lyric": "Spiel-"},
          {"at": 1200, "duration": 240, "pitch": "G#3", "lyric": "mann"}
        ]
      }
    },
    {
      "id": "s3m2",
      "number": "2",
      "section": "strophe3",
      "meter": [
        6,
        8
      ],
      "keyFifths": 1,
      "voices": {
        "s": [
          {"at": 0, "duration": 480, "pitch": "C5", "lyric": "rei-"},
          {"at": 480, "duration": 240, "pitch": "A4"},
          {"at": 720, "duration": 480, "pitch": "F#4", "lyric": "sen"},
          {"at": 1200, "duration": 240, "pitch": "D4", "lyric": "weit"}
        ],
        "a": [
          {"at": 0, "duration": 720, "pitch": "E4", "lyric": "rei-"},
          {"at": 720, "duration": 480, "pitch": "D4", "lyric": "sen"},
          {"at": 1200, "duration": 240, "pitch": "A3", "lyric": "weit"}
        ],
        "t": [
          {"at": 0, "duration": 720, "pitch": "C4", "lyric": "rei-"},
          {"at": 720, "duration": 480, "pitch": "A3", "lyric": "sen"},
          {"at": 1200, "duration": 240, "pitch": "F#3", "lyric": "weit"}
        ],
        "b": [
          {"at": 0, "duration": 720, "pitch": "A3", "lyric": "rei-"},
          {"at": 720, "duration": 480, "pitch": "D3", "lyric": "sen"},
          {"at": 1200, "duration": 240, "pitch": "C3", "lyric": "weit"}
        ]
      }
    },
    {
      "id": "s3m3",
      "number": "3",
      "section": "strophe3",
      "meter": [
        6,
        8
      ],
      "keyFifths": 1,
      "voices": {
        "s": [
          {"at": 0, "duration": 480, "pitch": "G4", "lyric": "in"},
          {"at": 480, "duration": 240, "pitch": "G4", "lyric": "die"},
          {"at": 720, "duration": 240, "pitch": "G4", "lyric": "Welt"},
          {"at": 960, "duration": 240, "pitch": "F#4"},
          {"at": 1200, "duration": 240, "pitch": "G4", "lyric": "hin-"}
        ],
        "a": [
          {"at": 0, "duration": 480, "pitch": "D4", "lyric": "in"},
          {"at": 480, "duration": 240, "pitch": "D4", "lyric": "die"},
          {"at": 720, "duration": 480, "pitch": "B3", "lyric": "Welt"},
          {"at": 1200, "duration": 240, "pitch": "B3", "lyric": "hin-"}
        ],
        "t": [
          {"at": 0, "duration": 480, "pitch": "G3", "lyric": "in"},
          {"at": 480, "duration": 240, "pitch": "G3", "lyric": "die"},
          {"at": 720, "duration": 480, "pitch": "G3", "lyric": "Welt"},
          {"at": 1200, "duration": 240, "pitch": "G3", "lyric": "hin-"}
        ],
        "b": [
          {"at": 0, "duration": 480, "pitch": "B2", "lyric": "in"},
          {"at": 480, "duration": 240, "pitch": "B2", "lyric": "die"},
          {"at": 720, "duration": 480, "pitch": "E3", "lyric": "Welt"},
          {"at": 1200, "duration": 240, "pitch": "E3", "lyric": "hin-"}
        ]
      }
    },
    {
      "id": "s3m4",
      "number": "4",
      "section": "strophe3",
      "meter": [
        6,
        8
      ],
      "keyFifths": 1,
      "voices": {
        "s": [
          {"at": 0, "duration": 720, "pitch": "A4", "tie": true, "lyric": "aus"},
          {"at": 720, "duration": 240, "pitch": "A4"},
          {"at": 960, "duration": 240, "pitch": null},
          {"at": 1200, "duration": 240, "pitch": "A4", "lyric": "und"}
        ],
        "a": [
          {"at": 0, "duration": 720, "pitch": "D4", "tie": true, "lyric": "aus"},
          {"at": 720, "duration": 240, "pitch": "D4"},
          {"at": 960, "duration": 240, "pitch": null},
          {"at": 1200, "duration": 240, "pitch": "F#4", "lyric": "und"}
        ],
        "t": [
          {"at": 0, "duration": 720, "pitch": "F#3", "tie": true, "lyric": "aus"},
          {"at": 720, "duration": 240, "pitch": "F#3"},
          {"at": 960, "duration": 240, "pitch": null},
          {"at": 1200, "duration": 240, "pitch": "D4", "lyric": "und"}
        ],
        "b": [
          {"at": 0, "duration": 720, "pitch": "D3", "tie": true, "lyric": "aus"},
          {"at": 720, "duration": 240, "pitch": "D3"},
          {"at": 960, "duration": 240, "pitch": null},
          {"at": 1200, "duration": 240, "pitch": "D3", "lyric": "und"}
        ]
      }
    },
    {
      "id": "s3m5",
      "number": "5",
      "section": "strophe3",
      "meter": [
        6,
        8
      ],
      "keyFifths": 1,
      "voices": {
        "s": [
          {"at": 0, "duration": 480, "pitch": "A4", "lyric": "sin-"},
          {"at": 480, "duration": 240, "pitch": "A4", "lyric": "gen"},
          {"at": 720, "duration": 240, "pitch": "A4", "lyric": "mei-"},
          {"at": 960, "duration": 240, "pitch": "B4"},
          {"at": 1200, "duration": 240, "pitch": "C5", "lyric": "ne"}
        ],
        "a": [
          {"at": 0, "duration": 480, "pitch": "E4", "lyric": "sin-"},
          {"at": 480, "duration": 240, "pitch": "E4", "lyric": "gen"},
          {"at": 720, "duration": 480, "pitch": "E4", "lyric": "mei-"},
          {"at": 1200, "duration": 240, "pitch": "E4", "lyric": "ne"}
        ],
        "t": [
          {"at": 0, "duration": 480, "pitch": "A3", "lyric": "sin-"},
          {"at": 480, "duration": 240, "pitch": "A3", "lyric": "gen"},
          {"at": 720, "duration": 240, "pitch": "A3", "lyric": "mei-"},
          {"at": 960, "duration": 240, "pitch": "G#3"},
          {"at": 1200, "duration": 240, "pitch": "A3", "lyric": "ne"}
        ],
        "b": [
          {"at": 0, "duration": 480, "pitch": "C#3", "lyric": "sin-"},
          {"at": 480, "duration": 240, "pitch": "C#3", "lyric": "gen"},
          {"at": 720, "duration": 240, "pitch": "C3", "lyric": "mei-"},
          {"at": 960, "duration": 240, "pitch": "B2"},
          {"at": 1200, "duration": 240, "pitch": "A2", "lyric": "ne"}
        ]
      }
    },
    {
      "id": "s3m6",
      "number": "6",
      "section": "strophe3",
      "meter": [
        6,
        8
      ],
      "keyFifths": 1,
      "voices": {
        "s": [
          {"at": 0, "duration": 720, "pitch": "D5", "lyric": "Wei-"},
          {"at": 720, "duration": 480, "pitch": "E4", "lyric": "sen"},
          {"at": 1200, "duration": 240, "pitch": "A4", "lyric": "und"}
        ],
        "a": [
          {"at": 0, "duration": 480, "pitch": "F#4", "lyric": "Wei-"},
          {"at": 480, "duration": 240, "pitch": "F4"},
          {"at": 720, "duration": 480, "pitch": "E4", "lyric": "sen"},
          {"at": 1200, "duration": 240, "pitch": "E4", "lyric": "und"}
        ],
        "t": [
          {"at": 0, "duration": 480, "pitch": "A3", "lyric": "Wei-"},
          {"at": 480, "duration": 240, "pitch": "Ab3"},
          {"at": 720, "duration": 480, "pitch": "G3", "lyric": "sen"},
          {"at": 1200, "duration": 240, "pitch": "C4", "lyric": "und"}
        ],
        "b": [
          {"at": 0, "duration": 240, "pitch": "D3", "lyric": "Wei-"},
          {"at": 240, "duration": 240, "pitch": "C3"},
          {"at": 480, "duration": 240, "pitch": "B2"},
          {"at": 720, "duration": 480, "pitch": "C3", "lyric": "sen"},
          {"at": 1200, "duration": 240, "pitch": "A2", "lyric": "und"}
        ]
      }
    },
    {
      "id": "s3m7",
      "number": "7",
      "section": "strophe3",
      "meter": [
        6,
        8
      ],
      "keyFifths": 1,
      "voices": {
        "s": [
          {"at": 0, "duration": 480, "pitch": "G4", "lyric": "gehn"},
          {"at": 480, "duration": 240, "pitch": "G4", "lyric": "von"},
          {"at": 720, "duration": 240, "pitch": "A4", "lyric": "Haus"},
          {"at": 960, "duration": 240, "pitch": "G4"},
          {"at": 1200, "duration": 240, "pitch": "A4", "lyric": "zu"}
        ],
        "a": [
          {"at": 0, "duration": 480, "pitch": "D4", "lyric": "gehn"},
          {"at": 480, "duration": 240, "pitch": "D4", "lyric": "von"},
          {"at": 720, "duration": 240, "pitch": "F#4", "lyric": "Haus"},
          {"at": 960, "duration": 240, "pitch": "E4"},
          {"at": 1200, "duration": 240, "pitch": "F#4", "lyric": "zu"}
        ],
        "t": [
          {"at": 0, "duration": 480, "pitch": "B3", "lyric": "gehn"},
          {"at": 480, "duration": 240, "pitch": "B3", "lyric": "von"},
          {"at": 720, "duration": 480, "pitch": "D4", "lyric": "Haus"},
          {"at": 1200, "duration": 240, "pitch": "D4", "lyric": "zu"}
        ],
        "b": [
          {"at": 0, "duration": 480, "pitch": "D3", "lyric": "gehn"},
          {"at": 480, "duration": 240, "pitch": "D3", "lyric": "von"},
          {"at": 720, "duration": 480, "pitch": "D3", "lyric": "Haus"},
          {"at": 1200, "duration": 240, "pitch": "D3", "lyric": "zu"}
        ]
      }
    },
    {
      "id": "s3m8",
      "number": "8",
      "section": "strophe3",
      "meter": [
        6,
        8
      ],
      "keyFifths": 1,
      "voices": {
        "s": [
          {"at": 0, "duration": 720, "pitch": "B4", "tie": true, "lyric": "Haus,"},
          {"at": 720, "duration": 240, "pitch": "B4"},
          {"at": 960, "duration": 240, "pitch": null},
          {"at": 1200, "duration": 240, "pitch": "B4", "lyric": "und"}
        ],
        "a": [
          {"at": 0, "duration": 720, "pitch": "G4", "tie": true, "lyric": "Haus,"},
          {"at": 720, "duration": 240, "pitch": "G4"},
          {"at": 960, "duration": 240, "pitch": null},
          {"at": 1200, "duration": 240, "pitch": "G4", "lyric": "und"}
        ],
        "t": [
          {"at": 0, "duration": 720, "pitch": "D4", "tie": true, "lyric": "Haus,"},
          {"at": 720, "duration": 240, "pitch": "D4"},
          {"at": 960, "duration": 240, "pitch": null},
          {"at": 1200, "duration": 240, "pitch": "D4", "lyric": "und"}
        ],
        "b": [
          {"at": 0, "duration": 720, "pitch": "G3", "tie": true, "lyric": "Haus,"},
          {"at": 720, "duration": 240, "pitch": "G3"},
          {"at": 960, "duration": 240, "pitch": null},
          {"at": 1200, "duration": 240, "pitch": "G3", "lyric": "und"}
        ]
      }
    },
    {
      "id": "s3m9",
      "number": "9",
      "section": "strophe3",
      "meter": [
        6,
        8
      ],
      "keyFifths": 1,
      "voices": {
        "s": [
          {"at": 0, "duration": 240, "pitch": "B4", "lyric": "sin-"},
          {"at": 240, "duration": 240, "pitch": "A4"},
          {"at": 480, "duration": 240, "pitch": "A4", "lyric": "gen"},
          {"at": 720, "duration": 240, "pitch": "A4", "lyric": "mei-"},
          {"at": 960, "duration": 240, "pitch": "B4"},
          {"at": 1200, "duration": 240, "pitch": "C5", "lyric": "ne"}
        ],
        "a": [
          {"at": 0, "duration": 240, "pitch": "G4", "lyric": "sin-"},
          {"at": 240, "duration": 240, "pitch": "F#4"},
          {"at": 480, "duration": 240, "pitch": "F#4", "lyric": "gen"},
          {"at": 720, "duration": 480, "pitch": "F#4", "lyric": "mei-"},
          {"at": 1200, "duration": 240, "pitch": "F#4", "lyric": "ne"}
        ],
        "t": [
          {"at": 0, "duration": 480, "pitch": "D4", "lyric": "sin-"},
          {"at": 480, "duration": 240, "pitch": "D4", "lyric": "gen"},
          {"at": 720, "duration": 480, "pitch": "D4", "lyric": "mei-"},
          {"at": 1200, "duration": 240, "pitch": "D4", "lyric": "ne"}
        ],
        "b": [
          {"at": 0, "duration": 480, "pitch": "D3", "lyric": "sin-"},
          {"at": 480, "duration": 240, "pitch": "D3", "lyric": "gen"},
          {"at": 720, "duration": 240, "pitch": "C3", "lyric": "mei-"},
          {"at": 960, "duration": 240, "pitch": "B2"},
          {"at": 1200, "duration": 240, "pitch": "A2", "lyric": "ne"}
        ]
      }
    },
    {
      "id": "s3m10",
      "number": "10",
      "section": "strophe3",
      "meter": [
        6,
        8
      ],
      "keyFifths": 1,
      "voices": {
        "s": [
          {"at": 0, "duration": 480, "pitch": "D5", "lyric": "Wei-"},
          {"at": 480, "duration": 240, "pitch": "G5"},
          {"at": 720, "duration": 240, "pitch": "E5", "lyric": "sen"},
          {"at": 960, "duration": 240, "pitch": "C5"},
          {"at": 1200, "duration": 240, "pitch": "A4", "lyric": "und"}
        ],
        "a": [
          {"at": 0, "duration": 240, "pitch": "F#4", "lyric": "Wei-"},
          {"at": 240, "duration": 480, "pitch": "G4"},
          {"at": 720, "duration": 480, "pitch": "G4", "lyric": "sen"},
          {"at": 1200, "duration": 240, "pitch": "E4", "lyric": "und"}
        ],
        "t": [
          {"at": 0, "duration": 720, "pitch": "D4", "lyric": "Wei-"},
          {"at": 720, "duration": 240, "pitch": "C4", "lyric": "sen"},
          {"at": 960, "duration": 240, "pitch": "E4"},
          {"at": 1200, "duration": 240, "pitch": "C4", "lyric": "und"}
        ],
        "b": [
          {"at": 0, "duration": 720, "pitch": "B2", "lyric": "Wei-"},
          {"at": 720, "duration": 480, "pitch": "C3", "lyric": "sen"},
          {"at": 1200, "duration": 240, "pitch": "C3", "lyric": "und"}
        ]
      }
    },
    {
      "id": "s3m11",
      "number": "11",
      "section": "strophe3",
      "meter": [
        6,
        8
      ],
      "keyFifths": 1,
      "voices": {
        "s": [
          {"at": 0, "duration": 480, "pitch": "G4", "lyric": "gehn"},
          {"at": 480, "duration": 240, "pitch": "G4", "lyric": "von"},
          {"at": 720, "duration": 480, "pitch": "B4", "lyric": "Haus"},
          {"at": 1200, "duration": 240, "pitch": "A4", "lyric": "zu"}
        ],
        "a": [
          {"at": 0, "duration": 480, "pitch": "D4", "lyric": "gehn"},
          {"at": 480, "duration": 240, "pitch": "D4", "lyric": "von"},
          {"at": 720, "duration": 480, "pitch": "G4", "lyric": "Haus"},
          {"at": 1200, "duration": 240, "pitch": "F#4", "lyric": "zu"}
        ],
        "t": [
          {"at": 0, "duration": 480, "pitch": "B3", "lyric": "gehn"},
          {"at": 480, "duration": 240, "pitch": "B3", "lyric": "von"},
          {"at": 720, "duration": 480, "pitch": "C#4", "lyric": "Haus"},
          {"at": 1200, "duration": 240, "pitch": "C4", "lyric": "zu"}
        ],
        "b": [
          {"at": 0, "duration": 480, "pitch": "D3", "lyric": "gehn"},
          {"at": 480, "duration": 240, "pitch": "D3", "lyric": "von"},
          {"at": 720, "duration": 480, "pitch": "D3", "lyric": "Haus"},
          {"at": 1200, "duration": 240, "pitch": "D3", "lyric": "zu"}
        ]
      }
    },
    {
      "id": "s3m12",
      "number": "12",
      "section": "strophe3",
      "meter": [
        6,
        8
      ],
      "keyFifths": 1,
      "voices": {
        "s": [
          {"at": 0, "duration": 720, "pitch": "G4", "tie": true, "lyric": "Haus."},
          {"at": 720, "duration": 240, "pitch": "G4"},
          {"at": 960, "duration": 240, "pitch": null}
        ],
        "a": [
          {"at": 0, "duration": 720, "pitch": "D4", "tie": true, "lyric": "Haus."},
          {"at": 720, "duration": 240, "pitch": "D4"},
          {"at": 960, "duration": 240, "pitch": null}
        ],
        "t": [
          {"at": 0, "duration": 720, "pitch": "B3", "tie": true, "lyric": "Haus."},
          {"at": 720, "duration": 240, "pitch": "B3"},
          {"at": 960, "duration": 240, "pitch": null}
        ],
        "b": [
          {"at": 0, "duration": 720, "pitch": "G3", "tie": true, "lyric": "Haus."},
          {"at": 720, "duration": 240, "pitch": "G3"},
          {"at": 960, "duration": 240, "pitch": null}
        ]
      },
      "lengthTicks": 1200,
      "barlines": [
        {"at": 1200, "kind": "double"}
      ]
    },
    {
      "id": "s4m0",
      "number": "0",
      "section": "strophe4",
      "meter": [
        6,
        8
      ],
      "keyFifths": 1,
      "voices": {
        "s": [
          {"at": 0, "duration": 240, "pitch": "D4", "lyric": "Ich"}
        ],
        "a": [
          {"at": 0, "duration": 240, "pitch": "D4", "lyric": "Ich"}
        ],
        "t": [
          {"at": 0, "duration": 240, "pitch": "D4", "lyric": "Ich"}
        ],
        "b": [
          {"at": 0, "duration": 240, "pitch": "D3", "lyric": "Ich"}
        ]
      },
      "lengthTicks": 240
    },
    {
      "id": "s4m1",
      "number": "1",
      "section": "strophe4",
      "meter": [
        6,
        8
      ],
      "keyFifths": 1,
      "voices": {
        "s": [
          {"at": 0, "duration": 480, "pitch": "B4", "lyric": "möcht"},
          {"at": 480, "duration": 240, "pitch": "B4", "lyric": "als"},
          {"at": 720, "duration": 240, "pitch": "B4", "lyric": "Rei-"},
          {"at": 960, "duration": 240, "pitch": "A4"},
          {"at": 1200, "duration": 240, "pitch": "B4", "lyric": "ter"}
        ],
        "a": [
          {"at": 0, "duration": 480, "pitch": "G4", "lyric": "möcht"},
          {"at": 480, "duration": 240, "pitch": "G4", "lyric": "als"},
          {"at": 720, "duration": 240, "pitch": "G4", "lyric": "Rei-"},
          {"at": 960, "duration": 240, "pitch": "F#4"},
          {"at": 1200, "duration": 240, "pitch": "F4", "lyric": "ter"}
        ],
        "t": [
          {"at": 0, "duration": 480, "pitch": "D4", "lyric": "möcht"},
          {"at": 480, "duration": 240, "pitch": "D4", "lyric": "als"},
          {"at": 720, "duration": 240, "pitch": "D4", "lyric": "Rei-"},
          {"at": 960, "duration": 240, "pitch": "C4"},
          {"at": 1200, "duration": 240, "pitch": "D4", "lyric": "ter"}
        ],
        "b": [
          {"at": 0, "duration": 480, "pitch": "G3", "lyric": "möcht"},
          {"at": 480, "duration": 240, "pitch": "G3", "lyric": "als"},
          {"at": 720, "duration": 480, "pitch": "G3", "lyric": "Rei-"},
          {"at": 1200, "duration": 240, "pitch": "G#3", "lyric": "ter"}
        ]
      }
    },
    {
      "id": "s4m2",
      "number": "2",
      "section": "strophe4",
      "meter": [
        6,
        8
      ],
      "keyFifths": 1,
      "voices": {
        "s": [
          {"at": 0, "duration": 480, "pitch": "C5", "lyric": "flie-"},
          {"at": 480, "duration": 240, "pitch": "A4"},
          {"at": 720, "duration": 480, "pitch": "F#4", "lyric": "gen"},
          {"at": 1200, "duration": 240, "pitch": "D4", "lyric": "wohl"}
        ],
        "a": [
          {"at": 0, "duration": 720, "pitch": "E4", "lyric": "flie-"},
          {"at": 720, "duration": 480, "pitch": "D4", "lyric": "gen"},
          {"at": 1200, "duration": 240, "pitch": "A3", "lyric": "wohl"}
        ],
        "t": [
          {"at": 0, "duration": 720, "pitch": "C4", "lyric": "flie-"},
          {"at": 720, "duration": 480, "pitch": "A3", "lyric": "gen"},
          {"at": 1200, "duration": 240, "pitch": "F#3", "lyric": "wohl"}
        ],
        "b": [
          {"at": 0, "duration": 720, "pitch": "A3", "lyric": "flie-"},
          {"at": 720, "duration": 480, "pitch": "D3", "lyric": "gen"},
          {"at": 1200, "duration": 240, "pitch": "C3", "lyric": "wohl"}
        ]
      }
    },
    {
      "id": "s4m3",
      "number": "3",
      "section": "strophe4",
      "meter": [
        6,
        8
      ],
      "keyFifths": 1,
      "voices": {
        "s": [
          {"at": 0, "duration": 480, "pitch": "G4", "lyric": "in"},
          {"at": 480, "duration": 240, "pitch": "G4", "lyric": "die"},
          {"at": 720, "duration": 240, "pitch": "G4", "lyric": "blut-"},
          {"at": 960, "duration": 240, "pitch": "F#4"},
          {"at": 1200, "duration": 240, "pitch": "G4", "lyric": "ge"}
        ],
        "a": [
          {"at": 0, "duration": 480, "pitch": "D4", "lyric": "in"},
          {"at": 480, "duration": 240, "pitch": "D4", "lyric": "die"},
          {"at": 720, "duration": 480, "pitch": "B3", "lyric": "blut-"},
          {"at": 1200, "duration": 240, "pitch": "B3", "lyric": "ge"}
        ],
        "t": [
          {"at": 0, "duration": 480, "pitch": "G3", "lyric": "in"},
          {"at": 480, "duration": 240, "pitch": "G3", "lyric": "die"},
          {"at": 720, "duration": 480, "pitch": "G3", "lyric": "blut-"},
          {"at": 1200, "duration": 240, "pitch": "G3", "lyric": "ge"}
        ],
        "b": [
          {"at": 0, "duration": 480, "pitch": "B2", "lyric": "in"},
          {"at": 480, "duration": 240, "pitch": "B2", "lyric": "die"},
          {"at": 720, "duration": 480, "pitch": "E3", "lyric": "blut-"},
          {"at": 1200, "duration": 240, "pitch": "E3", "lyric": "ge"}
        ]
      }
    },
    {
      "id": "s4m4",
      "number": "4",
      "section": "strophe4",
      "meter": [
        6,
        8
      ],
      "keyFifths": 1,
      "voices": {
        "s": [
          {"at": 0, "duration": 720, "pitch": "A4", "tie": true, "lyric": "Schlacht,"},
          {"at": 720, "duration": 240, "pitch": "A4"},
          {"at": 960, "duration": 240, "pitch": null},
          {"at": 1200, "duration": 240, "pitch": "A4", "lyric": "um"}
        ],
        "a": [
          {"at": 0, "duration": 720, "pitch": "D4", "tie": true, "lyric": "Schlacht,"},
          {"at": 720, "duration": 240, "pitch": "D4"},
          {"at": 960, "duration": 240, "pitch": null},
          {"at": 1200, "duration": 240, "pitch": "F#4", "lyric": "um"}
        ],
        "t": [
          {"at": 0, "duration": 720, "pitch": "F#3", "tie": true, "lyric": "Schlacht,"},
          {"at": 720, "duration": 240, "pitch": "F#3"},
          {"at": 960, "duration": 240, "pitch": null},
          {"at": 1200, "duration": 240, "pitch": "D4", "lyric": "um"}
        ],
        "b": [
          {"at": 0, "duration": 720, "pitch": "D3", "tie": true, "lyric": "Schlacht,"},
          {"at": 720, "duration": 240, "pitch": "D3"},
          {"at": 960, "duration": 240, "pitch": null},
          {"at": 1200, "duration": 240, "pitch": "D3", "lyric": "um"}
        ]
      }
    },
    {
      "id": "s4m5",
      "number": "5",
      "section": "strophe4",
      "meter": [
        6,
        8
      ],
      "keyFifths": 1,
      "voices": {
        "s": [
          {"at": 0, "duration": 480, "pitch": "A4", "lyric": "stil-"},
          {"at": 480, "duration": 240, "pitch": "A4", "lyric": "le"},
          {"at": 720, "duration": 240, "pitch": "A4", "lyric": "Feu-"},
          {"at": 960, "duration": 240, "pitch": "B4"},
          {"at": 1200, "duration": 240, "pitch": "C5", "lyric": "er"}
        ],
        "a": [
          {"at": 0, "duration": 480, "pitch": "E4", "lyric": "stil-"},
          {"at": 480, "duration": 240, "pitch": "E4", "lyric": "le"},
          {"at": 720, "duration": 480, "pitch": "E4", "lyric": "Feu-"},
          {"at": 1200, "duration": 240, "pitch": "E4", "lyric": "er"}
        ],
        "t": [
          {"at": 0, "duration": 480, "pitch": "A3", "lyric": "stil-"},
          {"at": 480, "duration": 240, "pitch": "A3", "lyric": "le"},
          {"at": 720, "duration": 240, "pitch": "A3", "lyric": "Feu-"},
          {"at": 960, "duration": 240, "pitch": "G#3"},
          {"at": 1200, "duration": 240, "pitch": "A3", "lyric": "er"}
        ],
        "b": [
          {"at": 0, "duration": 480, "pitch": "C#3", "lyric": "stil-"},
          {"at": 480, "duration": 240, "pitch": "C#3", "lyric": "le"},
          {"at": 720, "duration": 240, "pitch": "C3", "lyric": "Feu-"},
          {"at": 960, "duration": 240, "pitch": "B2"},
          {"at": 1200, "duration": 240, "pitch": "A2", "lyric": "er"}
        ]
      }
    },
    {
      "id": "s4m6",
      "number": "6",
      "section": "strophe4",
      "meter": [
        6,
        8
      ],
      "keyFifths": 1,
      "voices": {
        "s": [
          {"at": 0, "duration": 720, "pitch": "D5", "lyric": "lie-"},
          {"at": 720, "duration": 480, "pitch": "E4", "lyric": "gen"},
          {"at": 1200, "duration": 240, "pitch": "A4", "lyric": "im"}
        ],
        "a": [
          {"at": 0, "duration": 480, "pitch": "F#4", "lyric": "lie-"},
          {"at": 480, "duration": 240, "pitch": "F4"},
          {"at": 720, "duration": 480, "pitch": "E4", "lyric": "gen"},
          {"at": 1200, "duration": 240, "pitch": "E4", "lyric": "im"}
        ],
        "t": [
          {"at": 0, "duration": 480, "pitch": "A3", "lyric": "lie-"},
          {"at": 480, "duration": 240, "pitch": "Ab3"},
          {"at": 720, "duration": 480, "pitch": "G3", "lyric": "gen"},
          {"at": 1200, "duration": 240, "pitch": "C4", "lyric": "im"}
        ],
        "b": [
          {"at": 0, "duration": 240, "pitch": "D3", "lyric": "lie-"},
          {"at": 240, "duration": 240, "pitch": "C3"},
          {"at": 480, "duration": 240, "pitch": "B2"},
          {"at": 720, "duration": 480, "pitch": "C3", "lyric": "gen"},
          {"at": 1200, "duration": 240, "pitch": "A2", "lyric": "im"}
        ]
      }
    },
    {
      "id": "s4m7",
      "number": "7",
      "section": "strophe4",
      "meter": [
        6,
        8
      ],
      "keyFifths": 1,
      "voices": {
        "s": [
          {"at": 0, "duration": 480, "pitch": "G4", "lyric": "Feld"},
          {"at": 480, "duration": 240, "pitch": "G4", "lyric": "bei"},
          {"at": 720, "duration": 240, "pitch": "A4", "lyric": "dunk-"},
          {"at": 960, "duration": 240, "pitch": "G4"},
          {"at": 1200, "duration": 240, "pitch": "A4", "lyric": "ler"}
        ],
        "a": [
          {"at": 0, "duration": 480, "pitch": "D4", "lyric": "Feld"},
          {"at": 480, "duration": 240, "pitch": "D4", "lyric": "bei"},
          {"at": 720, "duration": 240, "pitch": "F#4", "lyric": "dunk-"},
          {"at": 960, "duration": 240, "pitch": "E4"},
          {"at": 1200, "duration": 240, "pitch": "F#4", "lyric": "ler"}
        ],
        "t": [
          {"at": 0, "duration": 480, "pitch": "B3", "lyric": "Feld"},
          {"at": 480, "duration": 240, "pitch": "B3", "lyric": "bei"},
          {"at": 720, "duration": 480, "pitch": "D4", "lyric": "dunk-"},
          {"at": 1200, "duration": 240, "pitch": "D4", "lyric": "ler"}
        ],
        "b": [
          {"at": 0, "duration": 480, "pitch": "D3", "lyric": "Feld"},
          {"at": 480, "duration": 240, "pitch": "D3", "lyric": "bei"},
          {"at": 720, "duration": 480, "pitch": "D3", "lyric": "dunk-"},
          {"at": 1200, "duration": 240, "pitch": "D3", "lyric": "ler"}
        ]
      }
    },
    {
      "id": "s4m8",
      "number": "8",
      "section": "strophe4",
      "meter": [
        6,
        8
      ],
      "keyFifths": 1,
      "voices": {
        "s": [
          {"at": 0, "duration": 720, "pitch": "B4", "tie": true, "lyric": "Nacht,"},
          {"at": 720, "duration": 240, "pitch": "B4"},
          {"at": 960, "duration": 240, "pitch": null},
          {"at": 1200, "duration": 240, "pitch": "B4", "lyric": "um"}
        ],
        "a": [
          {"at": 0, "duration": 720, "pitch": "G4", "tie": true, "lyric": "Nacht,"},
          {"at": 720, "duration": 240, "pitch": "G4"},
          {"at": 960, "duration": 240, "pitch": null},
          {"at": 1200, "duration": 240, "pitch": "G4", "lyric": "um"}
        ],
        "t": [
          {"at": 0, "duration": 720, "pitch": "D4", "tie": true, "lyric": "Nacht,"},
          {"at": 720, "duration": 240, "pitch": "D4"},
          {"at": 960, "duration": 240, "pitch": null},
          {"at": 1200, "duration": 240, "pitch": "D4", "lyric": "um"}
        ],
        "b": [
          {"at": 0, "duration": 720, "pitch": "G3", "tie": true, "lyric": "Nacht,"},
          {"at": 720, "duration": 240, "pitch": "G3"},
          {"at": 960, "duration": 240, "pitch": null},
          {"at": 1200, "duration": 240, "pitch": "G3", "lyric": "um"}
        ]
      }
    },
    {
      "id": "s4m9",
      "number": "9",
      "section": "strophe4",
      "meter": [
        6,
        8
      ],
      "keyFifths": 1,
      "voices": {
        "s": [
          {"at": 0, "duration": 240, "pitch": "B4", "lyric": "stil-"},
          {"at": 240, "duration": 240, "pitch": "A4"},
          {"at": 480, "duration": 240, "pitch": "A4", "lyric": "le"},
          {"at": 720, "duration": 240, "pitch": "A4", "lyric": "Feu-"},
          {"at": 960, "duration": 240, "pitch": "B4"},
          {"at": 1200, "duration": 240, "pitch": "C5", "lyric": "er"}
        ],
        "a": [
          {"at": 0, "duration": 240, "pitch": "G4", "lyric": "stil-"},
          {"at": 240, "duration": 240, "pitch": "F#4"},
          {"at": 480, "duration": 240, "pitch": "F#4", "lyric": "le"},
          {"at": 720, "duration": 480, "pitch": "F#4", "lyric": "Feu-"},
          {"at": 1200, "duration": 240, "pitch": "F#4", "lyric": "er"}
        ],
        "t": [
          {"at": 0, "duration": 480, "pitch": "D4", "lyric": "stil-"},
          {"at": 480, "duration": 240, "pitch": "D4", "lyric": "le"},
          {"at": 720, "duration": 480, "pitch": "D4", "lyric": "Feu-"},
          {"at": 1200, "duration": 240, "pitch": "D4", "lyric": "er"}
        ],
        "b": [
          {"at": 0, "duration": 480, "pitch": "D3", "lyric": "stil-"},
          {"at": 480, "duration": 240, "pitch": "D3", "lyric": "le"},
          {"at": 720, "duration": 240, "pitch": "C3", "lyric": "Feu-"},
          {"at": 960, "duration": 240, "pitch": "B2"},
          {"at": 1200, "duration": 240, "pitch": "A2", "lyric": "er"}
        ]
      }
    },
    {
      "id": "s4m10",
      "number": "10",
      "section": "strophe4",
      "meter": [
        6,
        8
      ],
      "keyFifths": 1,
      "voices": {
        "s": [
          {"at": 0, "duration": 480, "pitch": "D5", "lyric": "lie-"},
          {"at": 480, "duration": 240, "pitch": "G5"},
          {"at": 720, "duration": 240, "pitch": "E5", "lyric": "gen"},
          {"at": 960, "duration": 240, "pitch": "C5"},
          {"at": 1200, "duration": 240, "pitch": "A4", "lyric": "im"}
        ],
        "a": [
          {"at": 0, "duration": 240, "pitch": "F#4", "lyric": "lie-"},
          {"at": 240, "duration": 480, "pitch": "G4"},
          {"at": 720, "duration": 480, "pitch": "G4", "lyric": "gen"},
          {"at": 1200, "duration": 240, "pitch": "E4", "lyric": "im"}
        ],
        "t": [
          {"at": 0, "duration": 720, "pitch": "D4", "lyric": "lie-"},
          {"at": 720, "duration": 240, "pitch": "C4", "lyric": "gen"},
          {"at": 960, "duration": 240, "pitch": "E4"},
          {"at": 1200, "duration": 240, "pitch": "C4", "lyric": "im"}
        ],
        "b": [
          {"at": 0, "duration": 720, "pitch": "B2", "lyric": "lie-"},
          {"at": 720, "duration": 480, "pitch": "C3", "lyric": "gen"},
          {"at": 1200, "duration": 240, "pitch": "C3", "lyric": "im"}
        ]
      }
    },
    {
      "id": "s4m11",
      "number": "11",
      "section": "strophe4",
      "meter": [
        6,
        8
      ],
      "keyFifths": 1,
      "voices": {
        "s": [
          {"at": 0, "duration": 480, "pitch": "G4", "lyric": "Feld"},
          {"at": 480, "duration": 240, "pitch": "G4", "lyric": "bei"},
          {"at": 720, "duration": 480, "pitch": "B4", "lyric": "dunk-"},
          {"at": 1200, "duration": 240, "pitch": "A4", "lyric": "ler"}
        ],
        "a": [
          {"at": 0, "duration": 480, "pitch": "D4", "lyric": "Feld"},
          {"at": 480, "duration": 240, "pitch": "D4", "lyric": "bei"},
          {"at": 720, "duration": 480, "pitch": "G4", "lyric": "dunk-"},
          {"at": 1200, "duration": 240, "pitch": "F#4", "lyric": "ler"}
        ],
        "t": [
          {"at": 0, "duration": 480, "pitch": "B3", "lyric": "Feld"},
          {"at": 480, "duration": 240, "pitch": "B3", "lyric": "bei"},
          {"at": 720, "duration": 480, "pitch": "C#4", "lyric": "dunk-"},
          {"at": 1200, "duration": 240, "pitch": "C4", "lyric": "ler"}
        ],
        "b": [
          {"at": 0, "duration": 480, "pitch": "D3", "lyric": "Feld"},
          {"at": 480, "duration": 240, "pitch": "D3", "lyric": "bei"},
          {"at": 720, "duration": 480, "pitch": "D3", "lyric": "dunk-"},
          {"at": 1200, "duration": 240, "pitch": "D3", "lyric": "ler"}
        ]
      }
    },
    {
      "id": "s4m12",
      "number": "12",
      "section": "strophe4",
      "meter": [
        6,
        8
      ],
      "keyFifths": 1,
      "voices": {
        "s": [
          {"at": 0, "duration": 720, "pitch": "G4", "tie": true, "lyric": "Nacht."},
          {"at": 720, "duration": 240, "pitch": "G4"},
          {"at": 960, "duration": 240, "pitch": null}
        ],
        "a": [
          {"at": 0, "duration": 720, "pitch": "D4", "tie": true, "lyric": "Nacht."},
          {"at": 720, "duration": 240, "pitch": "D4"},
          {"at": 960, "duration": 240, "pitch": null}
        ],
        "t": [
          {"at": 0, "duration": 720, "pitch": "B3", "tie": true, "lyric": "Nacht."},
          {"at": 720, "duration": 240, "pitch": "B3"},
          {"at": 960, "duration": 240, "pitch": null}
        ],
        "b": [
          {"at": 0, "duration": 720, "pitch": "G3", "tie": true, "lyric": "Nacht."},
          {"at": 720, "duration": 240, "pitch": "G3"},
          {"at": 960, "duration": 240, "pitch": null}
        ]
      },
      "lengthTicks": 1200,
      "barlines": [
        {"at": 1200, "kind": "double"}
      ]
    },
    {
      "id": "s5m0",
      "number": "0",
      "section": "strophe5",
      "meter": [
        6,
        8
      ],
      "keyFifths": 1,
      "voices": {
        "s": [
          {"at": 0, "duration": 240, "pitch": "D4", "lyric": "Hör"}
        ],
        "a": [
          {"at": 0, "duration": 240, "pitch": "D4", "lyric": "Hör"}
        ],
        "t": [
          {"at": 0, "duration": 240, "pitch": "D4", "lyric": "Hör"}
        ],
        "b": [
          {"at": 0, "duration": 240, "pitch": "D3", "lyric": "Hör"}
        ]
      },
      "lengthTicks": 240
    },
    {
      "id": "s5m1",
      "number": "1",
      "section": "strophe5",
      "meter": [
        6,
        8
      ],
      "keyFifths": 1,
      "voices": {
        "s": [
          {"at": 0, "duration": 480, "pitch": "B4", "lyric": "ich"},
          {"at": 480, "duration": 240, "pitch": "B4", "lyric": "das"},
          {"at": 720, "duration": 240, "pitch": "B4", "lyric": "Mühl-"},
          {"at": 960, "duration": 240, "pitch": "A4"},
          {"at": 1200, "duration": 240, "pitch": "B4", "lyric": "rad"}
        ],
        "a": [
          {"at": 0, "duration": 480, "pitch": "G4", "lyric": "ich"},
          {"at": 480, "duration": 240, "pitch": "G4", "lyric": "das"},
          {"at": 720, "duration": 240, "pitch": "G4", "lyric": "Mühl-"},
          {"at": 960, "duration": 240, "pitch": "F#4"},
          {"at": 1200, "duration": 240, "pitch": "F4", "lyric": "rad"}
        ],
        "t": [
          {"at": 0, "duration": 480, "pitch": "D4", "lyric": "ich"},
          {"at": 480, "duration": 240, "pitch": "D4", "lyric": "das"},
          {"at": 720, "duration": 240, "pitch": "D4", "lyric": "Mühl-"},
          {"at": 960, "duration": 240, "pitch": "C4"},
          {"at": 1200, "duration": 240, "pitch": "D4", "lyric": "rad"}
        ],
        "b": [
          {"at": 0, "duration": 480, "pitch": "G3", "lyric": "ich"},
          {"at": 480, "duration": 240, "pitch": "G3", "lyric": "das"},
          {"at": 720, "duration": 480, "pitch": "G3", "lyric": "Mühl-"},
          {"at": 1200, "duration": 240, "pitch": "G#3", "lyric": "rad"}
        ]
      }
    },
    {
      "id": "s5m2",
      "number": "2",
      "section": "strophe5",
      "meter": [
        6,
        8
      ],
      "keyFifths": 1,
      "voices": {
        "s": [
          {"at": 0, "duration": 480, "pitch": "C5", "lyric": "ge-"},
          {"at": 480, "duration": 240, "pitch": "A4"},
          {"at": 720, "duration": 480, "pitch": "F#4", "lyric": "hen,"},
          {"at": 1200, "duration": 240, "pitch": "D4", "lyric": "ich"}
        ],
        "a": [
          {"at": 0, "duration": 720, "pitch": "E4", "lyric": "ge-"},
          {"at": 720, "duration": 480, "pitch": "D4", "lyric": "hen,"},
          {"at": 1200, "duration": 240, "pitch": "A3", "lyric": "ich"}
        ],
        "t": [
          {"at": 0, "duration": 720, "pitch": "C4", "lyric": "ge-"},
          {"at": 720, "duration": 480, "pitch": "A3", "lyric": "hen,"},
          {"at": 1200, "duration": 240, "pitch": "F#3", "lyric": "ich"}
        ],
        "b": [
          {"at": 0, "duration": 720, "pitch": "A3", "lyric": "ge-"},
          {"at": 720, "duration": 480, "pitch": "D3", "lyric": "hen,"},
          {"at": 1200, "duration": 240, "pitch": "C3", "lyric": "ich"}
        ]
      }
    },
    {
      "id": "s5m3",
      "number": "3",
      "section": "strophe5",
      "meter": [
        6,
        8
      ],
      "keyFifths": 1,
      "voices": {
        "s": [
          {"at": 0, "duration": 480, "pitch": "G4", "lyric": "weiß"},
          {"at": 480, "duration": 240, "pitch": "G4", "lyric": "nicht,"},
          {"at": 720, "duration": 240, "pitch": "G4", "lyric": "was"},
          {"at": 960, "duration": 240, "pitch": "F#4"},
          {"at": 1200, "duration": 240, "pitch": "G4", "lyric": "ich"}
        ],
        "a": [
          {"at": 0, "duration": 480, "pitch": "D4", "lyric": "weiß"},
          {"at": 480, "duration": 240, "pitch": "D4", "lyric": "nicht,"},
          {"at": 720, "duration": 480, "pitch": "B3", "lyric": "was"},
          {"at": 1200, "duration": 240, "pitch": "B3", "lyric": "ich"}
        ],
        "t": [
          {"at": 0, "duration": 480, "pitch": "G3", "lyric": "weiß"},
          {"at": 480, "duration": 240, "pitch": "G3", "lyric": "nicht,"},
          {"at": 720, "duration": 480, "pitch": "G3", "lyric": "was"},
          {"at": 1200, "duration": 240, "pitch": "G3", "lyric": "ich"}
        ],
        "b": [
          {"at": 0, "duration": 480, "pitch": "B2", "lyric": "weiß"},
          {"at": 480, "duration": 240, "pitch": "B2", "lyric": "nicht,"},
          {"at": 720, "duration": 480, "pitch": "E3", "lyric": "was"},
          {"at": 1200, "duration": 240, "pitch": "E3", "lyric": "ich"}
        ]
      }
    },
    {
      "id": "s5m4",
      "number": "4",
      "section": "strophe5",
      "meter": [
        6,
        8
      ],
      "keyFifths": 1,
      "voices": {
        "s": [
          {"at": 0, "duration": 720, "pitch": "A4", "tie": true, "lyric": "will,"},
          {"at": 720, "duration": 240, "pitch": "A4"},
          {"at": 960, "duration": 240, "pitch": null},
          {"at": 1200, "duration": 240, "pitch": "A4", "lyric": "ich"}
        ],
        "a": [
          {"at": 0, "duration": 720, "pitch": "D4", "tie": true, "lyric": "will,"},
          {"at": 720, "duration": 240, "pitch": "D4"},
          {"at": 960, "duration": 240, "pitch": null},
          {"at": 1200, "duration": 240, "pitch": "F#4", "lyric": "ich"}
        ],
        "t": [
          {"at": 0, "duration": 720, "pitch": "F#3", "tie": true, "lyric": "will,"},
          {"at": 720, "duration": 240, "pitch": "F#3"},
          {"at": 960, "duration": 240, "pitch": null},
          {"at": 1200, "duration": 240, "pitch": "D4", "lyric": "ich"}
        ],
        "b": [
          {"at": 0, "duration": 720, "pitch": "D3", "tie": true, "lyric": "will,"},
          {"at": 720, "duration": 240, "pitch": "D3"},
          {"at": 960, "duration": 240, "pitch": null},
          {"at": 1200, "duration": 240, "pitch": "D3", "lyric": "ich"}
        ]
      }
    },
    {
      "id": "s5m5",
      "number": "5",
      "section": "strophe5",
      "meter": [
        6,
        8
      ],
      "keyFifths": 1,
      "voices": {
        "s": [
          {"at": 0, "duration": 480, "pitch": "A4", "lyric": "möcht"},
          {"at": 480, "duration": 240, "pitch": "A4", "lyric": "am"},
          {"at": 720, "duration": 240, "pitch": "A4", "lyric": "lieb-"},
          {"at": 960, "duration": 240, "pitch": "B4"},
          {"at": 1200, "duration": 240, "pitch": "C5", "lyric": "sten"}
        ],
        "a": [
          {"at": 0, "duration": 480, "pitch": "E4", "lyric": "möcht"},
          {"at": 480, "duration": 240, "pitch": "E4", "lyric": "am"},
          {"at": 720, "duration": 480, "pitch": "E4", "lyric": "lieb-"},
          {"at": 1200, "duration": 240, "pitch": "E4", "lyric": "sten"}
        ],
        "t": [
          {"at": 0, "duration": 480, "pitch": "A3", "lyric": "möcht"},
          {"at": 480, "duration": 240, "pitch": "A3", "lyric": "am"},
          {"at": 720, "duration": 240, "pitch": "A3", "lyric": "lieb-"},
          {"at": 960, "duration": 240, "pitch": "G#3"},
          {"at": 1200, "duration": 240, "pitch": "A3", "lyric": "sten"}
        ],
        "b": [
          {"at": 0, "duration": 480, "pitch": "C#3", "lyric": "möcht"},
          {"at": 480, "duration": 240, "pitch": "C#3", "lyric": "am"},
          {"at": 720, "duration": 240, "pitch": "C3", "lyric": "lieb-"},
          {"at": 960, "duration": 240, "pitch": "B2"},
          {"at": 1200, "duration": 240, "pitch": "A2", "lyric": "sten"}
        ]
      }
    },
    {
      "id": "s5m6",
      "number": "6",
      "section": "strophe5",
      "meter": [
        6,
        8
      ],
      "keyFifths": 1,
      "voices": {
        "s": [
          {"at": 0, "duration": 720, "pitch": "D5", "lyric": "ster-"},
          {"at": 720, "duration": 480, "pitch": "E4", "lyric": "ben,"},
          {"at": 1200, "duration": 240, "pitch": "A4", "lyric": "da"}
        ],
        "a": [
          {"at": 0, "duration": 480, "pitch": "F#4", "lyric": "ster-"},
          {"at": 480, "duration": 240, "pitch": "F4"},
          {"at": 720, "duration": 480, "pitch": "E4", "lyric": "ben,"},
          {"at": 1200, "duration": 240, "pitch": "E4", "lyric": "da"}
        ],
        "t": [
          {"at": 0, "duration": 480, "pitch": "A3", "lyric": "ster-"},
          {"at": 480, "duration": 240, "pitch": "Ab3"},
          {"at": 720, "duration": 480, "pitch": "G3", "lyric": "ben,"},
          {"at": 1200, "duration": 240, "pitch": "C4", "lyric": "da"}
        ],
        "b": [
          {"at": 0, "duration": 240, "pitch": "D3", "lyric": "ster-"},
          {"at": 240, "duration": 240, "pitch": "C3"},
          {"at": 480, "duration": 240, "pitch": "B2"},
          {"at": 720, "duration": 480, "pitch": "C3", "lyric": "ben,"},
          {"at": 1200, "duration": 240, "pitch": "A2", "lyric": "da"}
        ]
      }
    },
    {
      "id": "s5m7",
      "number": "7",
      "section": "strophe5",
      "meter": [
        6,
        8
      ],
      "keyFifths": 1,
      "voices": {
        "s": [
          {"at": 0, "duration": 480, "pitch": "G4", "lyric": "wärs"},
          {"at": 480, "duration": 240, "pitch": "G4", "lyric": "auf"},
          {"at": 720, "duration": 240, "pitch": "A4", "lyric": "ein-"},
          {"at": 960, "duration": 240, "pitch": "G4"},
          {"at": 1200, "duration": 240, "pitch": "A4", "lyric": "mal"}
        ],
        "a": [
          {"at": 0, "duration": 480, "pitch": "D4", "lyric": "wärs"},
          {"at": 480, "duration": 240, "pitch": "D4", "lyric": "auf"},
          {"at": 720, "duration": 240, "pitch": "F#4", "lyric": "ein-"},
          {"at": 960, "duration": 240, "pitch": "E4"},
          {"at": 1200, "duration": 240, "pitch": "F#4", "lyric": "mal"}
        ],
        "t": [
          {"at": 0, "duration": 480, "pitch": "B3", "lyric": "wärs"},
          {"at": 480, "duration": 240, "pitch": "B3", "lyric": "auf"},
          {"at": 720, "duration": 480, "pitch": "D4", "lyric": "ein-"},
          {"at": 1200, "duration": 240, "pitch": "D4", "lyric": "mal"}
        ],
        "b": [
          {"at": 0, "duration": 480, "pitch": "D3", "lyric": "wärs"},
          {"at": 480, "duration": 240, "pitch": "D3", "lyric": "auf"},
          {"at": 720, "duration": 480, "pitch": "D3", "lyric": "ein-"},
          {"at": 1200, "duration": 240, "pitch": "D3", "lyric": "mal"}
        ]
      }
    },
    {
      "id": "s5m8",
      "number": "8",
      "section": "strophe5",
      "meter": [
        6,
        8
      ],
      "keyFifths": 1,
      "voices": {
        "s": [
          {"at": 0, "duration": 720, "pitch": "B4", "tie": true, "lyric": "still,"},
          {"at": 720, "duration": 240, "pitch": "B4"},
          {"at": 960, "duration": 240, "pitch": null},
          {"at": 1200, "duration": 240, "pitch": "B4", "lyric": "ich"}
        ],
        "a": [
          {"at": 0, "duration": 720, "pitch": "G4", "tie": true, "lyric": "still,"},
          {"at": 720, "duration": 240, "pitch": "G4"},
          {"at": 960, "duration": 240, "pitch": null},
          {"at": 1200, "duration": 240, "pitch": "G4", "lyric": "ich"}
        ],
        "t": [
          {"at": 0, "duration": 720, "pitch": "D4", "tie": true, "lyric": "still,"},
          {"at": 720, "duration": 240, "pitch": "D4"},
          {"at": 960, "duration": 240, "pitch": null},
          {"at": 1200, "duration": 240, "pitch": "D4", "lyric": "ich"}
        ],
        "b": [
          {"at": 0, "duration": 720, "pitch": "G3", "tie": true, "lyric": "still,"},
          {"at": 720, "duration": 240, "pitch": "G3"},
          {"at": 960, "duration": 240, "pitch": null},
          {"at": 1200, "duration": 240, "pitch": "G3", "lyric": "ich"}
        ]
      }
    },
    {
      "id": "s5m9",
      "number": "9",
      "section": "strophe5",
      "meter": [
        6,
        8
      ],
      "keyFifths": 1,
      "voices": {
        "s": [
          {"at": 0, "duration": 240, "pitch": "B4", "lyric": "möcht"},
          {"at": 240, "duration": 240, "pitch": "A4"},
          {"at": 480, "duration": 240, "pitch": "A4", "lyric": "am"},
          {"at": 720, "duration": 240, "pitch": "A4", "lyric": "lieb-"},
          {"at": 960, "duration": 240, "pitch": "B4"},
          {"at": 1200, "duration": 240, "pitch": "C5", "lyric": "sten"}
        ],
        "a": [
          {"at": 0, "duration": 240, "pitch": "G4", "lyric": "möcht"},
          {"at": 240, "duration": 240, "pitch": "F#4"},
          {"at": 480, "duration": 240, "pitch": "F#4", "lyric": "am"},
          {"at": 720, "duration": 480, "pitch": "F#4", "lyric": "lieb-"},
          {"at": 1200, "duration": 240, "pitch": "F#4", "lyric": "sten"}
        ],
        "t": [
          {"at": 0, "duration": 480, "pitch": "D4", "lyric": "möcht"},
          {"at": 480, "duration": 240, "pitch": "D4", "lyric": "am"},
          {"at": 720, "duration": 480, "pitch": "D4", "lyric": "lieb-"},
          {"at": 1200, "duration": 240, "pitch": "D4", "lyric": "sten"}
        ],
        "b": [
          {"at": 0, "duration": 480, "pitch": "D3", "lyric": "möcht"},
          {"at": 480, "duration": 240, "pitch": "D3", "lyric": "am"},
          {"at": 720, "duration": 240, "pitch": "C3", "lyric": "lieb-"},
          {"at": 960, "duration": 240, "pitch": "B2"},
          {"at": 1200, "duration": 240, "pitch": "A2", "lyric": "sten"}
        ]
      }
    },
    {
      "id": "s5m10",
      "number": "10",
      "section": "strophe5",
      "meter": [
        6,
        8
      ],
      "keyFifths": 1,
      "voices": {
        "s": [
          {"at": 0, "duration": 480, "pitch": "D5", "lyric": "ster-"},
          {"at": 480, "duration": 240, "pitch": "G5"},
          {"at": 720, "duration": 240, "pitch": "E5", "lyric": "ben,"},
          {"at": 960, "duration": 240, "pitch": "C5"},
          {"at": 1200, "duration": 240, "pitch": "A4", "lyric": "da"}
        ],
        "a": [
          {"at": 0, "duration": 240, "pitch": "F#4", "lyric": "ster-"},
          {"at": 240, "duration": 480, "pitch": "G4"},
          {"at": 720, "duration": 480, "pitch": "G4", "lyric": "ben,"},
          {"at": 1200, "duration": 240, "pitch": "E4", "lyric": "da"}
        ],
        "t": [
          {"at": 0, "duration": 720, "pitch": "D4", "lyric": "ster-"},
          {"at": 720, "duration": 240, "pitch": "C4", "lyric": "ben,"},
          {"at": 960, "duration": 240, "pitch": "E4"},
          {"at": 1200, "duration": 240, "pitch": "C4", "lyric": "da"}
        ],
        "b": [
          {"at": 0, "duration": 720, "pitch": "B2", "lyric": "ster-"},
          {"at": 720, "duration": 480, "pitch": "C3", "lyric": "ben,"},
          {"at": 1200, "duration": 240, "pitch": "C3", "lyric": "da"}
        ]
      }
    },
    {
      "id": "s5m11",
      "number": "11",
      "section": "strophe5",
      "meter": [
        6,
        8
      ],
      "keyFifths": 1,
      "voices": {
        "s": [
          {"at": 0, "duration": 480, "pitch": "G4", "lyric": "wärs"},
          {"at": 480, "duration": 240, "pitch": "G4", "lyric": "auf"},
          {"at": 720, "duration": 480, "pitch": "B4", "lyric": "ein-"},
          {"at": 1200, "duration": 240, "pitch": "A4", "lyric": "mal"}
        ],
        "a": [
          {"at": 0, "duration": 480, "pitch": "D4", "lyric": "wärs"},
          {"at": 480, "duration": 240, "pitch": "D4", "lyric": "auf"},
          {"at": 720, "duration": 480, "pitch": "G4", "lyric": "ein-"},
          {"at": 1200, "duration": 240, "pitch": "F#4", "lyric": "mal"}
        ],
        "t": [
          {"at": 0, "duration": 480, "pitch": "B3", "lyric": "wärs"},
          {"at": 480, "duration": 240, "pitch": "B3", "lyric": "auf"},
          {"at": 720, "duration": 480, "pitch": "C#4", "lyric": "ein-"},
          {"at": 1200, "duration": 240, "pitch": "C4", "lyric": "mal"}
        ],
        "b": [
          {"at": 0, "duration": 480, "pitch": "D3", "lyric": "wärs"},
          {"at": 480, "duration": 240, "pitch": "D3", "lyric": "auf"},
          {"at": 720, "duration": 480, "pitch": "D3", "lyric": "ein-"},
          {"at": 1200, "duration": 240, "pitch": "D3", "lyric": "mal"}
        ]
      }
    },
    {
      "id": "s5m12",
      "number": "12",
      "section": "strophe5",
      "meter": [
        6,
        8
      ],
      "keyFifths": 1,
      "voices": {
        "s": [
          {"at": 0, "duration": 720, "pitch": "G4", "tie": true, "lyric": "still."},
          {"at": 720, "duration": 240, "pitch": "G4"},
          {"at": 960, "duration": 240, "pitch": null}
        ],
        "a": [
          {"at": 0, "duration": 720, "pitch": "D4", "tie": true, "lyric": "still."},
          {"at": 720, "duration": 240, "pitch": "D4"},
          {"at": 960, "duration": 240, "pitch": null}
        ],
        "t": [
          {"at": 0, "duration": 720, "pitch": "B3", "tie": true, "lyric": "still."},
          {"at": 720, "duration": 240, "pitch": "B3"},
          {"at": 960, "duration": 240, "pitch": null}
        ],
        "b": [
          {"at": 0, "duration": 720, "pitch": "G3", "tie": true, "lyric": "still."},
          {"at": 720, "duration": 240, "pitch": "G3"},
          {"at": 960, "duration": 240, "pitch": null}
        ]
      },
      "lengthTicks": 1200,
      "barlines": [
        {"at": 1200, "kind": "final"}
      ]
    }
  ]
});
