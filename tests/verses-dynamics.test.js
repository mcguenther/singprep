// Strophen, Dynamik, Vortragsangaben und Seitenbilder als Pfad: Validierung, Kompilierung und
// Pegel je Note (eigene kleine Fixtures, unabhängig von den mitgelieferten Liedern).
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { loadChorprobe, readJson } from "./support/load.js";

const Chorprobe = loadChorprobe();
const { score: lib, dynamics: dyn, audio } = Chorprobe;

// Zwei Stimmen, zwei 4/4-Takte, zwei Strophen.
function fixture() {
  const quarters = (pitches, lyrics) =>
    pitches.map((pitch, i) => ({
      at: i * 480,
      duration: 480,
      pitch,
      ...(lyrics?.[i] !== undefined ? { lyric: lyrics[i] } : {}),
    }));
  return {
    format: "chorprobe/v1",
    title: "Test",
    tempo: 100,
    ppq: 480,
    voices: [
      { id: "s", name: "Sopran", clef: "treble" },
      { id: "b", name: "Bass", clef: "bass" },
    ],
    verses: [
      { id: "1", name: "1. Strophe" },
      { id: "2", name: "2. Strophe" },
    ],
    sections: [{ id: "a", name: "A" }],
    measures: [
      {
        id: "m1",
        section: "a",
        meter: [4, 4],
        keyFifths: 0,
        directions: [{ at: 0, text: "Ruhig" }],
        dynamics: [{ at: 0, mark: "p" }],
        voices: {
          s: quarters(["C4", "D4", "E4", "F4"], [["Eins", "Uno"], ["zwei", null], "Re-", "frain"]),
          b: quarters(["C3", "D3", "E3", "F3"]),
        },
      },
      {
        id: "m2",
        section: "a",
        meter: [4, 4],
        keyFifths: 0,
        voices: { s: quarters(["G4", "A4", "B4", "C5"]), b: quarters(["G2", "A2", "B2", "C3"]) },
      },
    ],
  };
}
const levelsOf = (s, verse = null) => {
  const c = lib.compileScore(lib.validateScore(s));
  const levels = dyn.noteLevels(c, verse);
  return (voice) =>
    c.events
      .filter((n) => n.voice === voice)
      .map((n) => [
        n.start,
        +levels.get(n.id).level.toFixed(4),
        +levels.get(n.id).attack.toFixed(4),
      ]);
};

describe("Strophen", () => {
  test("gültig, lyricFor und lyricTexts", () => {
    const c = lib.compileScore(lib.validateScore(fixture()));
    assert.equal(c.verses.length, 2);
    const [first, second, third] = c.measures[0].voices.s;
    assert.equal(lib.lyricFor(first, 0), "Eins");
    assert.equal(lib.lyricFor(first, 1), "Uno");
    assert.equal(lib.lyricFor(second, 1), null);
    assert.equal(lib.lyricFor(third, 1), "Re-");
    assert.equal(lib.lyricFor({}, 0), null);
    assert.deepEqual(lib.lyricTexts(second), ["zwei"]);
    assert.deepEqual(lib.lyricTexts(third), ["Re-"]);
  });
  test("alte Dateien ohne Strophen bleiben unverändert", () => {
    const input = readJson("docs/beispiel.json");
    delete input.verses;
    for (const m of input.measures) {
      delete m.dynamics;
      delete m.directions;
      for (const notes of Object.values(m.voices))
        for (const n of notes) if (Array.isArray(n.lyric)) n.lyric = n.lyric[0] ?? undefined;
    }
    const checked = lib.validateScore(JSON.parse(JSON.stringify(input)));
    const c = lib.compileScore(checked);
    assert.deepEqual(c.verses, []);
    assert.deepEqual(c.dynamics, []);
    assert.deepEqual(c.directions, []);
  });
  const broken = {
    "nur eine Strophe": [(s) => s.verses.pop(), /2 bis 20 Strophen/],
    "doppelte Strophen-ID": [(s) => (s.verses[1].id = "1"), /eindeutige ID/],
    "zu lange Strophen-ID": [(s) => (s.verses[1].id = "x".repeat(21)), /20 Zeichen/],
    "Strophe ohne Namen": [(s) => (s.verses[1].name = " "), /Name fehlt/],
    "unbekanntes Feld an Strophe": [(s) => (s.verses[0].x = 1), /unbekanntes Feld „x“/],
    "falsche Anzahl Silben": [
      (s) => (s.measures[0].voices.s[0].lyric = ["a"]),
      /Takt 1, s: lyric braucht genau 2 Einträge/,
    ],
    "Zahl statt Silbe": [
      (s) => (s.measures[0].voices.s[0].lyric = ["a", 3]),
      /kurzer Text oder null/,
    ],
    "Liste ohne Strophen": [
      (s) => {
        delete s.verses;
        s.measures[1].voices.s[0].lyric = ["a", "b"];
      },
      /Takt 1, s: lyric als Liste setzt Strophen/,
    ],
  };
  for (const [name, [mutate, message]] of Object.entries(broken))
    test(`lehnt ab: ${name}`, () => {
      const s = fixture();
      mutate(s);
      assert.throws(() => lib.validateScore(s), message);
    });
});

describe("Dynamik und Vortragsangaben: Validierung", () => {
  test("Gabel darf in Folgetakte reichen und wird absolut kompiliert", () => {
    const s = fixture();
    s.measures[0].dynamics.push({ at: 960, mark: "cresc", duration: 2880, voices: ["s"] });
    s.measures[1].dynamics = [{ at: 0, mark: "f", verses: ["2"] }];
    const c = lib.compileScore(lib.validateScore(s));
    assert.deepEqual(
      c.dynamics.map((d) => [d.mark, d.tick, d.end, d.measureIndex]),
      [
        ["p", 0, 0, 0],
        ["cresc", 960, 3840, 0],
        ["f", 1920, 1920, 1],
      ],
    );
    assert.deepEqual(c.directions, [{ at: 0, text: "Ruhig", measureIndex: 0, tick: 0 }]);
  });
  const broken = {
    "unbekanntes Zeichen": [
      (s) => (s.measures[0].dynamics[0].mark = "mpp"),
      /Takt 1: unbekanntes Dynamikzeichen „mpp“/,
    ],
    "Position außerhalb": [
      (s) => (s.measures[0].dynamics[0].at = 1920),
      /Takt 1: Dynamik braucht eine Position/,
    ],
    "Gabel ohne Dauer": [
      (s) => (s.measures[0].dynamics[0].mark = "cresc"),
      /cresc braucht eine positive/,
    ],
    "Dauer an festem Zeichen": [
      (s) => (s.measures[0].dynamics[0].duration = 480),
      /nur bei cresc und dim/,
    ],
    "Gabel über das Ende": [
      (s) => (s.measures[1].dynamics = [{ at: 960, mark: "dim", duration: 1440 }]),
      /Takt 2: Die Gabel .* über das Ende/,
    ],
    "unbekannte Stimme": [
      (s) => (s.measures[0].dynamics[0].voices = ["t"]),
      /voices muss eine Liste/,
    ],
    "leere Stimmenliste": [
      (s) => (s.measures[0].dynamics[0].voices = []),
      /voices muss eine Liste/,
    ],
    "unbekannte Strophe": [
      (s) => (s.measures[0].dynamics[0].verses = ["3"]),
      /verses muss eine Liste/,
    ],
    "Strophen ohne verses": [
      (s) => {
        delete s.verses;
        s.measures[0].voices.s = s.measures[0].voices.s.map((n) => ({ ...n, lyric: "x" }));
        s.measures[0].dynamics[0].verses = ["1"];
      },
      /setzt Strophen \(verses\) voraus/,
    ],
    "unbekanntes Feld an Dynamik": [
      (s) => (s.measures[0].dynamics[0].level = 1),
      /unbekanntes Feld „level“/,
    ],
    "Vortragsangabe zu lang": [
      (s) => (s.measures[0].directions[0].text = "x".repeat(81)),
      /80 Zeichen/,
    ],
    "Vortragsangabe ohne Text": [(s) => (s.measures[0].directions[0].text = ""), /80 Zeichen/],
    "Vortragsangabe außerhalb": [
      (s) => (s.measures[0].directions[0].at = -1),
      /Vortragsangabe braucht eine Position/,
    ],
  };
  for (const [name, [mutate, message]] of Object.entries(broken))
    test(`lehnt ab: ${name}`, () => {
      const s = fixture();
      mutate(s);
      assert.throws(() => lib.validateScore(s), message);
    });
});

describe("noteLevels", () => {
  test("ohne Angaben mf, feste Zeichen ab ihrer Position", () => {
    const s = fixture();
    s.measures[0].dynamics = [{ at: 960, mark: "f" }];
    const v = levelsOf(s)("s");
    assert.deepEqual(
      v.map((x) => x[1]),
      [0.75, 0.75, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9],
    );
  });
  test("cresc interpoliert zur nächsten Angabe bis eine Viertel nach dem Ende", () => {
    const s = fixture();
    // p ab 0, cresc 960–1920, f eine Viertel nach dem Gabelende.
    s.measures[0].dynamics.push({ at: 960, mark: "cresc", duration: 960 });
    s.measures[1].dynamics = [{ at: 480, mark: "f" }];
    const v = levelsOf(s)("s");
    assert.deepEqual(
      v.map((x) => x[1]),
      [0.45, 0.45, 0.45, 0.675, 0.9, 0.9, 0.9, 0.9],
    );
  });
  test("ohne Zielangabe eine Stufe lauter bzw. leiser", () => {
    const s = fixture();
    s.measures[0].dynamics.push({ at: 960, mark: "cresc", duration: 960 });
    s.measures[1].dynamics = [
      { at: 960, mark: "f" }, // zu spät: zwei Viertel nach dem Ende
      { at: 960, mark: "dim", duration: 960 },
    ];
    const v = levelsOf(s)("s");
    assert.deepEqual(
      v.map((x) => x[1]),
      [0.45, 0.45, 0.45, 0.525, 0.6, 0.6, 0.9, 0.825],
    );
    assert.equal(dyn.stepLevel(1, 1), 1);
    assert.equal(dyn.stepLevel(0.3, -1), 0.3);
    assert.equal(dyn.stepLevel(0.7, 1), 0.75);
  });
  test("fp und sfz betreffen den Einsatz", () => {
    const s = fixture();
    s.measures[0].dynamics = [
      { at: 0, mark: "mf" },
      { at: 480, mark: "sfz" },
      { at: 1440, mark: "fp" },
    ];
    const v = levelsOf(s)("s");
    assert.deepEqual(v.slice(0, 5), [
      [0, 0.75, 0.75],
      [480, 1, 1],
      [960, 0.75, 0.75],
      [1440, 0.45, 0.9],
      [1920, 0.45, 0.45],
    ]);
  });
  test("Stimmen- und Strophenfilter", () => {
    const s = fixture();
    s.measures[0].dynamics = [
      { at: 0, mark: "pp", voices: ["b"] },
      { at: 0, mark: "ff", verses: ["2"] },
    ];
    const first = levelsOf(s, "1"),
      second = levelsOf(s, "2");
    assert.equal(first("s")[0][1], 0.75);
    assert.equal(first("b")[0][1], 0.3);
    assert.equal(second("s")[0][1], 1);
    assert.equal(second("b")[0][1], 1);
    assert.equal(levelsOf(s, null)("s")[0][1], 0.75);
  });
  test("gemeinsame Stimme (unison) übernimmt die Angabe", () => {
    const d = { voices: ["a2"] };
    assert.equal(dyn.appliesTo(d, "a1", null, { a2: "a1" }), true);
    assert.equal(dyn.appliesTo(d, "a1", null, {}), false);
  });
  test("Pegel werden relativ zu mf in Verstärkung umgerechnet", () => {
    assert.deepEqual(audio.dynamicGain(null), { sustain: 1, peak: 1 });
    const g = audio.dynamicGain({ level: 0.45, attack: 0.9 });
    assert.ok(Math.abs(g.sustain - 0.6) < 1e-9 && Math.abs(g.peak - 1.2) < 1e-9);
  });
});

describe("Seitenbilder als Pfad", () => {
  const layout = (image) => {
    const s = fixture();
    s.layout = {
      pages: [
        {
          id: "p1",
          label: "Seite 1",
          image,
          width: 400,
          height: 200,
          measures: [
            { id: "m1", box: [0, 0, 200, 100] },
            { id: "m2", box: [200, 0, 200, 100] },
          ],
        },
      ],
    };
    return s;
  };
  for (const ok of [
    "scores/lied.webp",
    "lied.png",
    "scores/sub/seite-1.JPG".toLowerCase(),
    "a_b.jpeg",
  ])
    test(`erlaubt ${ok}`, () => assert.doesNotThrow(() => lib.validateScore(layout(ok))));
  for (const bad of [
    "/abs/lied.webp",
    "../lied.webp",
    "scores/../x.png",
    "lied.svg",
    "lied webp.png",
    "https://x.org/a.png",
    "lied.gif",
  ])
    test(`lehnt ab: ${bad}`, () =>
      assert.throws(() => lib.validateScore(layout(bad)), /Originalansicht/));
  test("Meldung für nicht ladbare Bilder", () => {
    assert.equal(Chorprobe.original.isImagePath("scores/lied.webp"), true);
    assert.match(
      Chorprobe.original.imageError({ image: "scores/lied.webp" }),
      /relativ zu index\.html/,
    );
    assert.match(
      Chorprobe.original.imageError({ image: ["data", "image/png;base64,AA=="].join(":") }),
      /eingebettete/,
    );
  });
});
