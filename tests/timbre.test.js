// Stimmfarben: Stimmlagen-Erkennung, Spektren je Lage und Dynamik, Stereoaufstellung, Legato.
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { loadChorprobe, readJson } from "./support/load.js";

const { timbre, score: lib, audio } = loadChorprobe();
const example = () => readJson("docs/beispiel.json");
const compile = (s) => lib.compileScore(lib.validateScore(s));
const voice = (name, extra = {}) => ({ id: "x", name, clef: "treble", ...extra });

describe("Stimmlage erkennen", () => {
  test("aus dem Namen", () => {
    const cases = {
      Sopran: "soprano",
      "Sopran II": "soprano",
      Soprano: "soprano",
      Mezzosopran: "mezzo",
      "Alt 1": "alto",
      Contralto: "alto",
      Tenor: "tenor",
      "Tenore I": "tenor",
      Bariton: "baritone",
      Bass: "bass",
      "Basso II": "bass",
    };
    for (const [name, type] of Object.entries(cases))
      assert.equal(timbre.detectVoiceType(voice(name)), type, name);
  });
  test("voiceType geht vor Name und Tonhöhe", () => {
    assert.equal(timbre.detectVoiceType(voice("Männer", { voiceType: "bass" }), [70]), "bass");
  });
  test("ohne passenden Namen aus der mittleren Tonhöhe", () => {
    assert.equal(timbre.detectVoiceType(voice("Frauen"), [72, 74, 76]), "soprano");
    assert.equal(timbre.detectVoiceType(voice("Männer"), [45, 47, 48, 50]), "bass");
    assert.equal(timbre.detectVoiceType(voice("Mitte"), [55, 57, 59]), "tenor");
  });
  test("Buchstaben nur, wenn alle Stimmen so heißen", () => {
    const satb = compile(readJson("docs/beispiel.json"));
    // Beispiel: „H“ und „T“ bedeuten hoch und tief, nicht Tenor.
    assert.deepEqual(timbre.voiceTypes(satb), { hoch: "alto", tief: "bass" });
    const s = example();
    s.voices = [
      { id: "hoch", name: "1", short: "S", clef: "treble" },
      { id: "tief", name: "2", short: "T", clef: "bass" },
    ];
    assert.deepEqual(timbre.voiceTypes(compile(s)), { hoch: "soprano", tief: "tenor" });
  });
});

describe("Spektrum je Lage", () => {
  const brightness = (type, midi, level) =>
    timbre.centroid(timbre.harmonicSpectrum(type, midi, level), timbre.frequency(midi));
  test("Bass hat viele Obertöne und einen Sängerformanten, Sopran wenige", () => {
    const bass = timbre.harmonicSpectrum("bass", 48, 0.75),
      soprano = timbre.harmonicSpectrum("soprano", 76, 0.75);
    assert.ok(bass.length > 60 && soprano.length < 20);
    // Energie um 2,5 kHz (Sängerformant) relativ zum Grundton
    const ring = (a, f0, at) => a[Math.round(at / f0)] / a[1];
    assert.ok(
      ring(bass, timbre.frequency(48), 2450) >
        4 * ring(timbre.harmonicSpectrum("alto", 48, 0.75), timbre.frequency(48), 2450),
    );
  });
  test("forte klingt heller als piano", () => {
    for (const [type, midi] of [
      ["bass", 45],
      ["tenor", 57],
      ["alto", 62],
      ["soprano", 72],
    ])
      assert.ok(brightness(type, midi, 1) > brightness(type, midi, 0.3), type);
  });
  test("Amplituden endlich, positiv und begrenzt", () => {
    for (const type of timbre.ORDER)
      for (let midi = 36; midi <= 96; midi += 6)
        for (const level of [0.3, 0.75, 1]) {
          const a = timbre.harmonicSpectrum(type, midi, level);
          assert.equal(a[0], 0);
          assert.ok(a.slice(1).every((x) => Number.isFinite(x) && x > 0));
          assert.ok(a.reduce((s, x) => s + x, 0) <= 2.2 + 1e-6, `${type} ${midi} ${level}`);
          assert.ok(timbre.frequency(midi) * (a.length - 1) <= 9000 + 1e-6);
        }
  });
});

describe("Aufstellung", () => {
  test("Sopran und Tenor links, Alt und Bass rechts; gleiche Lagen nebeneinander", () => {
    const voices = ["s1", "s2", "a", "t", "b"].map((id) => ({ id }));
    const pans = timbre.voicePans(voices, {
      s1: "soprano",
      s2: "soprano",
      a: "alto",
      t: "tenor",
      b: "bass",
    });
    assert.ok(pans.s1 < 0 && pans.s2 < 0 && pans.t < 0);
    assert.ok(pans.a > 0 && pans.b > 0);
    assert.ok(pans.s1 < pans.s2);
    for (const p of Object.values(pans)) assert.ok(Math.abs(p) <= 0.7);
  });
});

describe("Legato unter Bögen", () => {
  test("gebundene Töne ohne neuen Einsatz, Haltebögen und Pausen beachtet", () => {
    const s = example();
    const hoch = (m) => s.measures[m].voices.hoch;
    hoch(0)[0].slur = "start"; // C4 E4 | G4 (gehalten bis in Takt 2)
    hoch(1)[1].slur = "end"; // … F4
    const c = compile(s);
    const { into, from } = audio.legatoNotes(c);
    const id = (m, voice, i) => `${m}:${voice}:${i}`;
    // E4 und G4 schließen gebunden an, F4 an das übergebundene G4; im Beispiel ist der Bass
    // schon gebunden (G2 → C3).
    assert.deepEqual(
      [...into].sort(),
      [id(0, "hoch", 1), id(0, "hoch", 2), id(1, "hoch", 1), id(1, "tief", 1)].sort(),
    );
    assert.deepEqual(
      [...from].sort(),
      [id(0, "hoch", 0), id(0, "hoch", 1), id(0, "hoch", 2), id(1, "tief", 0)].sort(),
    );
  });
  test("ohne Bögen kein Legato", () => {
    const s = example();
    for (const n of s.measures[1].voices.tief) delete n.slur;
    const { into, from } = audio.legatoNotes(compile(s));
    assert.equal(into.size + from.size, 0);
  });
});

describe("voiceType im Datenformat", () => {
  test("gültige und ungültige Werte", () => {
    const s = example();
    s.voices[1].voiceType = "baritone";
    assert.doesNotThrow(() => lib.validateScore(s));
    s.voices[1].voiceType = "Bass";
    assert.throws(() => lib.validateScore(s), /voiceType muss soprano, mezzo/);
  });
  test("Schema kennt dieselben Werte", () => {
    const schema = readJson("docs/score.schema.json");
    assert.deepEqual(schema.$defs.voice.properties.voiceType.enum, timbre.ORDER);
  });
});
