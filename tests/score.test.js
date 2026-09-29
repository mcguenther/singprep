import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { loadChorprobe, readJson } from "./support/load.js";

const { score: lib } = loadChorprobe();
const example = () => readJson("docs/beispiel.json");

describe("midi und noteName", () => {
  test("wissenschaftliche Tonnamen", () => {
    assert.equal(lib.midi("C4"), 60);
    assert.equal(lib.midi("A4"), 69);
    assert.equal(lib.midi("Bb3"), 58);
    assert.equal(lib.midi("B#3"), 60);
    assert.equal(lib.midi("Cb4"), 59);
    assert.equal(lib.midi("F##4"), 67);
    assert.equal(lib.midi("C-1"), 0);
    assert.equal(lib.midi("G9"), 127);
    assert.equal(lib.midi(null), null);
  });
  test("ungültige Tonnamen", () => {
    assert.throws(() => lib.midi("Fis4"), /Ungültiger Ton/);
    assert.throws(() => lib.midi("H3"), /Ungültiger Ton/);
    assert.throws(() => lib.midi("A9"), /MIDI-Bereich/);
    assert.throws(() => lib.midi(""), /Ungültiger Ton/);
  });
  test("deutsche Anzeige", () => {
    assert.equal(lib.noteName("B3"), "H3");
    assert.equal(lib.noteName("Bb3"), "B3");
    assert.equal(lib.noteName("F#4"), "F♯4");
    assert.equal(lib.noteName("Eb4"), "E♭4");
    assert.equal(lib.noteName(null), "Pause");
  });
});

describe("validateScore", () => {
  test("Beispiel ist gültig und wird kopiert", () => {
    const input = example();
    const checked = lib.validateScore(input);
    assert.deepEqual(checked, input);
    assert.notEqual(checked, input);
    assert.equal(lib.FORMAT, "chorprobe/v1");
  });

  const broken = {
    "unbekanntes Format": [(s) => (s.format = "chorprobe/v2"), /Unbekanntes Format/],
    "fehlender Titel": [(s) => (s.title = " "), /Titel/],
    "unbekanntes Feld": [(s) => (s.extra = 1), /unbekanntes Feld „extra“/],
    "ppq außerhalb": [(s) => (s.ppq = 10), /ppq/],
    "tempo außerhalb": [(s) => (s.tempo = 400), /tempo/],
    "doppelte Stimmen-ID": [(s) => (s.voices[1].id = "hoch"), /eindeutige ID/],
    "unbekannter Schlüssel": [(s) => (s.voices[0].clef = "sopran"), /unbekannter Schlüssel/],
    "überlappende Noten": [(s) => (s.measures[0].voices.hoch[1].at = 240), /überlappende Noten/],
    "Taktgrenze überschritten": [
      (s) => (s.measures[1].voices.tief[1].duration = 960),
      /Taktgrenze überschritten/,
    ],
    "deutscher Tonname": [(s) => (s.measures[0].voices.tief[0].pitch = "Cis3"), /Ungültiger Ton/],
    "Haltebogen zu anderem Ton": [
      (s) => (s.measures[1].voices.hoch[0].pitch = "A4"),
      /Ungültiger Haltebogen/,
    ],
    "offener Haltebogen": [(s) => (s.measures[1].voices.hoch[3].tie = true), /Offener Haltebogen/],
    "unbekannte Stimme im Takt": [
      (s) => (s.measures[0].voices.mitte = []),
      /unbekannte Stimme mitte/,
    ],
    "unbekannter Abschnitt": [(s) => (s.measures[1].section = "b"), /unbekannter Abschnitt/],
    "lengthTicks zu lang": [(s) => (s.measures[0].lengthTicks = 2000), /lengthTicks/],
    "zerrissener Abschnitt": [
      (s) => {
        s.sections.push({ id: "b", name: "B" });
        s.measures.push({ ...structuredClone(s.measures[1]), id: "b1", section: "b" });
        s.measures.push({ ...structuredClone(s.measures[1]), id: "a3", section: "a" });
      },
      /zusammenhängend/,
    ],
    "leerer Abschnitt": [(s) => s.sections.push({ id: "b", name: "B" }), /mindestens einen Takt/],
    "ungültiges Wiederholungszeichen": [
      (s) => (s.measures[0].barlines = [{ at: 0, kind: "segno" }]),
      /Wiederholungszeichen/,
    ],
  };
  for (const [name, [mutate, message]] of Object.entries(broken))
    test(`lehnt ab: ${name}`, () => {
      const s = example();
      mutate(s);
      assert.throws(() => lib.validateScore(s), message);
    });
});

describe("compileScore", () => {
  const compiled = lib.compileScore(lib.validateScore(example()));
  test("Zeitachse der Takte", () => {
    assert.equal(compiled.total, 2880);
    assert.deepEqual(
      compiled.measures.map((m) => [m.index, m.number, m.start, m.end, m.length]),
      [
        [0, "1", 0, 1440, 1440],
        [1, "2", 1440, 2880, 1440],
      ],
    );
  });
  test("Haltebogen wird zu einem Ereignis zusammengefasst", () => {
    assert.equal(compiled.byVoice.hoch.length, 7);
    assert.equal(compiled.byVoice.tief.length, 3);
    assert.equal(compiled.events.length, 9);
    const tied = compiled.events.find((n) => n.voice === "hoch" && n.pitch === "G4");
    assert.deepEqual([tied.start, tied.end, tied.duration, tied.midi], [960, 1920, 960, 67]);
    assert.deepEqual(tied.noteIds, ["0:hoch:2", "1:hoch:0"]);
    const starts = compiled.events.map((n) => n.start);
    assert.deepEqual(
      starts,
      [...starts].sort((a, b) => a - b),
    );
  });
  test("Auftakt über lengthTicks und fehlende Nummer", () => {
    const s = example();
    s.measures[0].lengthTicks = 480;
    s.measures[0].voices = { hoch: [{ at: 0, duration: 480, pitch: "C4" }], tief: [] };
    delete s.measures[1].number;
    const c = lib.compileScore(lib.validateScore(s));
    assert.equal(c.total, 1920);
    assert.equal(c.measures[1].number, "2");
  });
});

describe("cueNotes", () => {
  const compiled = lib.compileScore(lib.validateScore(example()));
  test("onset: nur hier beginnende Töne", () => {
    const cues = lib.cueNotes(compiled, 0, ["hoch", "tief"], compiled.total, "onset");
    assert.deepEqual(
      cues.map((n) => [n.voice, n.pitch]),
      [
        ["hoch", "C4"],
        ["tief", "C3"],
      ],
    );
    assert.deepEqual(lib.cueNotes(compiled, 1440, ["hoch"], compiled.total, "onset"), []);
  });
  test("next: klingende Töne oder nächster Einsatz", () => {
    const cues = lib.cueNotes(compiled, 1440, ["hoch", "tief"], compiled.total, "next");
    assert.deepEqual(
      cues.map((n) => [n.voice, n.pitch, n.delayed]),
      [
        ["hoch", "G4", false],
        ["tief", "G2", false],
      ],
    );
    const s = example();
    s.measures[1].voices.tief = [
      { at: 0, duration: 960, pitch: null },
      { at: 960, duration: 480, pitch: "C3" },
    ];
    const withRest = lib.compileScore(lib.validateScore(s));
    const next = lib.cueNotes(withRest, 1440, ["tief"], withRest.total, "next");
    assert.deepEqual(
      next.map((n) => [n.pitch, n.start, n.delayed]),
      [["C3", 2400, true]],
    );
    assert.deepEqual(lib.cueNotes(withRest, 1440, ["tief"], 2000, "next"), []);
  });
});

describe("Tempo", () => {
  test("estimateTempo aus Tippabständen", () => {
    assert.equal(lib.estimateTempo([0, 500, 1000, 1500], 1, 90), 120);
    assert.equal(lib.estimateTempo([0, 250, 500], 0.5, 90), 120);
    assert.equal(lib.estimateTempo([0], 1, 90), 90);
    assert.equal(lib.estimateTempo([0, 5000], 1, 90), 90);
    assert.equal(lib.estimateTempo([0, 100, 200], 1, 90), 300);
  });
  test("smoothTempo begrenzt Sprünge", () => {
    assert.equal(lib.smoothTempo(100, 100), 100);
    assert.ok(Math.abs(lib.smoothTempo(200, 100, 1) - 110) < 1e-9);
    assert.ok(Math.abs(lib.smoothTempo(200, 100, 0.5) - 105) < 1e-9);
    assert.equal(lib.smoothTempo(NaN, 100), 100);
    assert.equal(lib.smoothTempo(120, 0), 120);
  });
  test("inRangeTick", () => {
    assert.equal(lib.inRangeTick(5, 0, 10), 5);
    assert.equal(lib.inRangeTick(-1, 0, 10), 0);
    assert.equal(lib.inRangeTick(11, 0, 10), 10);
  });
});

describe("voiceMix", () => {
  const s = {
    voices: [{ id: "s" }, { id: "a1" }, { id: "a2" }],
    sections: [{ id: "x" }, { id: "u", unison: { a2: "a1" } }],
  };
  const m = { section: "x" };
  test("Modi", () => {
    assert.deepEqual(lib.voiceMix(s, m, new Set(["s"]), "all", 0.2), { s: 1, a1: 1, a2: 1 });
    assert.deepEqual(lib.voiceMix(s, m, new Set(["s"]), "solo", 0.2), { s: 1, a1: 0, a2: 0 });
    assert.deepEqual(lib.voiceMix(s, m, new Set(["s"]), "focus", 0.2), {
      s: 1,
      a1: 0.2,
      a2: 0.2,
    });
    assert.deepEqual(lib.voiceMix(s, m, new Set(["s"]), "sing", 0.8, 0.1), {
      s: 0.1,
      a1: 0.8,
      a2: 0.8,
    });
  });
  test("gemeinsame Stimme (unison)", () => {
    assert.deepEqual(lib.voiceMix(s, { section: "u" }, new Set(["a2"]), "solo", 0), {
      s: 0,
      a1: 1,
      a2: 0,
    });
  });
});
