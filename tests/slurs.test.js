// Bögen (slur): Validierung, Kompilierung und reine Geometrie des Notensatzes.
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { loadChorprobe, readJson } from "./support/load.js";

const { score: lib, render } = loadChorprobe();
const example = () => readJson("docs/beispiel.json");
const hoch = (s, m) => s.measures[m].voices.hoch;

describe("slur: Validierung", () => {
  test("Bogen im Takt und über den Taktstrich ist gültig", () => {
    const s = example();
    hoch(s, 0)[0].slur = "start";
    hoch(s, 0)[1].slur = "end";
    hoch(s, 0)[2].slur = "start"; // G4 mit Haltebogen, Bogen reicht in Takt 2
    hoch(s, 1)[2].slur = "end";
    assert.doesNotThrow(() => lib.validateScore(s));
  });
  test("Haltebogen und Bogen an derselben Note", () => {
    const s = example();
    Object.assign(hoch(s, 0)[2], { tie: true, slur: "start" });
    hoch(s, 1)[1].slur = "end";
    assert.doesNotThrow(() => lib.validateScore(s));
  });
  const broken = {
    "unbekannter Wert": [(s) => (hoch(s, 0)[0].slur = "both"), /slur muss "start" oder "end"/],
    "true statt Text": [(s) => (hoch(s, 0)[0].slur = true), /slur muss/],
    verschachtelt: [
      (s) => {
        hoch(s, 0)[0].slur = "start";
        hoch(s, 0)[1].slur = "start";
        hoch(s, 1)[3].slur = "end";
      },
      /Takt 1, Hohe Stimme: Neuer Bogen, bevor der Bogen aus Takt 1 endet/,
    ],
    "offen am Partiturende": [
      (s) => (hoch(s, 1)[1].slur = "start"),
      /Takt 2, Hohe Stimme: Der Bogen wird bis zum Ende der Partitur nicht beendet/,
    ],
    "offen über den Taktstrich bis zum Ende": [
      (s) => (hoch(s, 0)[1].slur = "start"),
      /Takt 1, Hohe Stimme: Der Bogen wird .* nicht beendet/,
    ],
    "Ende ohne Anfang": [
      (s) => (hoch(s, 1)[3].slur = "end"),
      /Takt 2, Hohe Stimme: Bogenende .* ohne Bogenanfang/,
    ],
    "Ende nach geschlossenem Bogen": [
      (s) => {
        hoch(s, 0)[0].slur = "start";
        hoch(s, 0)[1].slur = "end";
        hoch(s, 0)[2].slur = "end";
      },
      /ohne Bogenanfang/,
    ],
    "an einer Pause": [
      (s) => {
        s.measures[1].voices.tief = [
          { at: 0, duration: 960, pitch: "G2" },
          { at: 960, duration: 480, pitch: null, slur: "end" },
        ];
      },
      /Takt 2, tief: Eine Pause kann keinen Bogen beginnen oder beenden/,
    ],
  };
  for (const [name, [mutate, message]] of Object.entries(broken))
    test(`lehnt ab: ${name}`, () => {
      const s = example();
      mutate(s);
      assert.throws(() => lib.validateScore(s), message);
    });
  test("gemeinsame Stimme: Bogen an der Zielstimme, nicht in den unison-Abschnitt hinein", () => {
    const s = example();
    s.sections.push({ id: "u", name: "Gemeinsam", unison: { tief: "hoch" } });
    s.measures.push({ ...structuredClone(s.measures[1]), id: "u1", section: "u" });
    delete s.measures[2].voices.tief;
    s.measures[2].voices.hoch[0].slur = "start";
    s.measures[2].voices.hoch[3].slur = "end";
    assert.doesNotThrow(() => lib.validateScore(s));
    delete s.measures[1].voices.tief[1].slur; // Bogen bleibt offen bis in den Abschnitt u
    assert.throws(() => lib.validateScore(s), /Takt 3, Tiefe Stimme: .*unison/);
  });
});

describe("slur: Kompilierung", () => {
  test("Bogen über den Taktstrich steht in beiden Takten, Wiedergabe unverändert", () => {
    const s = example();
    const before = lib.compileScore(lib.validateScore(s));
    hoch(s, 0)[1].slur = "start";
    hoch(s, 1)[1].slur = "end";
    const c = lib.compileScore(lib.validateScore(s));
    assert.equal(c.slurs.length, 2); // dazu der Bogen der tiefen Stimme aus dem Beispiel
    const slur = c.slurs.find((x) => x.voice === "hoch");
    assert.deepEqual(
      slur.notes.map((n) => n.pitch),
      ["E4", "G4", "G4", "F4"],
    );
    assert.deepEqual([slur.first, slur.last], [0, 1]);
    assert.equal(c.measures[0].slurs.hoch[0], slur);
    assert.equal(c.measures[1].slurs.hoch[0], slur);
    assert.deepEqual(
      c.events.map((n) => [n.voice, n.start, n.end]),
      before.events.map((n) => [n.voice, n.start, n.end]),
    );
    assert.equal(s.measures[0].slurs, undefined, "Eingabedaten bleiben unverändert");
  });
});

describe("slur: Geometrie", () => {
  const treble = { clef: "treble" };
  test("Seite: unter den Köpfen bei Hälsen nach oben, sonst oben", () => {
    const up = [{ pitch: "G4" }, { pitch: "A4" }]; // Hälse nach oben
    assert.equal(render.slurSide(up, treble), 1);
    assert.equal(render.slurSide([{ pitch: "D5" }, { pitch: "C5" }], treble), -1);
    assert.equal(render.slurSide([{ pitch: "G4" }, { pitch: "D5" }], treble), -1, "gemischt");
    assert.equal(render.slurSide([{ pitch: "C4" }, { pitch: "D4" }], treble), -1, "Liedtext");
    assert.equal(render.slurSide([{ pitch: "G4", tie: true }, { pitch: "A4" }], treble), -1);
    // Oktavierter Tenor: G3 klingt, steht aber als G4 im Notenbild.
    const tenor = { clef: "treble", displayOctave: 1 };
    assert.equal(render.slurSide([{ pitch: "G3" }, { pitch: "A3" }], tenor), 1);
    assert.equal(render.slurSide([{ pitch: "G3" }, { pitch: "A3" }], treble), -1);
  });
  test("Bogen im Takt: Enden an den Punkten, Mitte weiter außen", () => {
    const p = render.slurPiece({ from: [10, 30], to: [60, 30], dir: -1 });
    assert.deepEqual(
      [p.p0, p.p3],
      [
        [10, 30],
        [60, 30],
      ],
    );
    assert.ok(p.c1[1] < 30 && p.c2[1] < 30);
    assert.equal(p.openStart || p.openEnd, false);
    const below = render.slurPiece({ from: [10, 50], to: [60, 50], dir: 1 });
    assert.ok(below.c1[1] > 50);
  });
  test("Bogen weicht inneren Noten aus", () => {
    const plain = render.slurPiece({ from: [0, 30], to: [100, 30], dir: -1 });
    const high = render.slurPiece({ from: [0, 30], to: [100, 30], dir: -1, obstacles: [[50, 12]] });
    assert.ok(high.c1[1] < plain.c1[1]);
    const mid = 0.125 * high.p0[1] + 0.375 * high.c1[1] + 0.375 * high.c2[1] + 0.125 * high.p3[1];
    assert.ok(mid < 12, `Mitte ${mid} liegt über dem Hindernis`);
  });
  test("Teilstücke über den Taktstrich treffen sich auf derselben Höhe", () => {
    const out = render.slurPiece({ from: [20, 30], right: 100, levels: [null, 18], dir: -1 });
    const into = render.slurPiece({ to: [40, 26], left: 0, levels: [18, null], dir: -1 });
    assert.deepEqual(out.p3, [100, 18]);
    assert.deepEqual(into.p0, [0, 18]);
    assert.ok(out.openEnd && !out.openStart && into.openStart && !into.openEnd);
    // Offene Enden behalten die Strichstärke (zwei verschiedene Punkte am Rand).
    assert.match(render.curvePath(out), /100 16\.9 L100 19\.1/);
  });
  test("Höhe am Taktstrich: für beide Takte gleich, frei von Noten am Rand", () => {
    const notes = [{ start: 0 }, { start: 480 }, { start: 960 }];
    const heights = [30, 20, 30];
    const level = render.slurLevel(notes, heights, -1, 720);
    assert.ok(level < 20 - 2.9, "über der hohen Note vor dem Taktstrich");
    assert.equal(render.slurLevel(notes, heights, -1, 720), level);
    // Endnote direkt nach dem Taktstrich: knapp darüber statt Haken vom Scheitel herab.
    const flat = [{ start: 0 }, { start: 480 }, { start: 960 }];
    assert.equal(render.slurLevel(flat, [30, 30, 30], -1, 960), 27);
    assert.equal(render.slurLevel(flat, [50, 50, 50], 1, 960), 53);
  });
  test("Grenze hält den Bogen im reservierten Raum", () => {
    const p = render.slurPiece({ from: [0, 8], to: [100, 8], dir: -1, limit: 2 });
    for (const q of [p.c1, p.c2]) assert.ok(q[1] >= 2 + 1.1 - 1e-9);
  });
  test("Bögen einer Zeile: auch begonnene und weiterlaufende Bögen", () => {
    const e = [
      { pitch: "A4" },
      { pitch: "B4", slur: "end" },
      { pitch: "C5" },
      { pitch: "D5", slur: "start" },
      { pitch: "E5" },
    ];
    assert.deepEqual(
      render.slurRowSpans(e).map((s) => s.map((n) => n.pitch)),
      [
        ["A4", "B4"],
        ["D5", "E5"],
      ],
    );
    assert.deepEqual(render.slurRowSpans([{ pitch: "C4" }]), []);
  });
});
