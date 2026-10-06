// Klang „Ensemble“: Stimmlagen, Obertonspektren, Stereoplatz, Klangprobe und Aufbau eines Tons.
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { loadChorprobe, loadFile } from "./support/load.js";

const Chorprobe = loadChorprobe();
const { score: lib, audio } = Chorprobe;
const hz = (midi) => 440 * 2 ** ((midi - 69) / 12);
const db = (levels, i) => 20 * Math.log10(levels[i] / levels[0]);
const register = (id) => audio.REGISTERS.find((r) => r.id === id);

function compiledSong() {
  const before = Chorprobe.scores.length;
  loadFile("scores/in-einem-kuehlen-grunde.js");
  const data = Chorprobe.scores.splice(before)[0];
  return lib.compileScore(lib.validateScore(data));
}

// Records created nodes and their connections; enough for createVoiceTone.
function fakeContext() {
  const created = [];
  const param = (value = 0) => ({
    value,
    setValueAtTime() {},
    linearRampToValueAtTime() {},
    setTargetAtTime() {},
  });
  const node = (kind, extra) => {
    const n = { kind, to: [], connect: (t) => n.to.push(t), start() {}, ...extra };
    created.push(n);
    return n;
  };
  return {
    created,
    createOscillator: () =>
      node("oscillator", {
        frequency: param(440),
        detune: param(),
        setPeriodicWave(wave) {
          this.wave = wave;
        },
      }),
    createGain: () => node("gain", { gain: param(1) }),
    createBiquadFilter: () => node("filter", { frequency: param(), Q: param() }),
    createStereoPanner: () => node("panner", { pan: param() }),
    createPeriodicWave: (real, imag, options) => ({ real, imag, options }),
  };
}

describe("Ensemble-Klang", () => {
  test("ist Standard, Chor bleibt wählbar", () => {
    assert.ok(audio.VOICE_SOUNDS.ensemble.byRegister);
    assert.equal(Object.keys(audio.VOICE_SOUNDS)[0], "ensemble");
    assert.ok(audio.VOICE_SOUNDS.choir);
    assert.equal(new audio.ChoirAudio().sound, "ensemble");
  });
  test("Stimmlage nach Tonhöhe", () => {
    const ids = [45, 54, 55, 60, 62, 63, 66, 67, 79].map((m) => audio.registerFor(m).id);
    assert.deepEqual(ids, [
      "bass",
      "bass",
      "tenor",
      "tenor",
      "tenor",
      "alto",
      "alto",
      "soprano",
      "soprano",
    ]);
  });
  test("Obertöne: Effektivwert eines Sinus, unter 6 kHz", () => {
    for (const r of audio.REGISTERS)
      for (const midi of [40, 52, 64, 76, 88]) {
        const levels = audio.harmonicLevels(r, hz(midi));
        const rms = Math.sqrt(levels.reduce((s, a) => s + a * a, 0) / 2);
        assert.ok(Math.abs(rms - Math.SQRT1_2) < 1e-9, `${r.id} ${midi}`);
        assert.ok(levels.length >= 1 && levels.length <= 48);
        assert.ok(levels.length * hz(midi) <= 6000);
      }
  });
  test("Bass: kräftiger Grundton, Obertöne 2–4 hörbar auf kleinen Lautsprechern", () => {
    for (const midi of [40, 45, 50]) {
      const levels = audio.harmonicLevels(register("bass"), hz(midi));
      assert.equal(Math.max(...levels), levels[0], `Grundton am stärksten (${midi})`);
      for (let i = 1; i < 4; i++) assert.ok(db(levels, i) > -12, `Oberton ${i + 1} (${midi})`);
    }
  });
  test("Sopran: fast reiner Ton", () => {
    for (const midi of [64, 69, 74, 79]) {
      const levels = audio.harmonicLevels(register("soprano"), hz(midi));
      for (let i = 1; i < levels.length; i++)
        assert.ok(db(levels, i) < -10, `Oberton ${i + 1} (${midi})`);
    }
  });
  test("Stimmlage und Stereoplatz je Stimme", () => {
    const places = audio.voicePlaces(compiledSong());
    assert.deepEqual(
      ["s", "a", "t", "b"].map((id) => audio.registerFor(places.get(id).register).id),
      ["soprano", "alto", "tenor", "bass"],
    );
    const pans = ["s", "a", "t", "b"].map((id) => places.get(id).pan);
    assert.deepEqual(
      [...pans].sort((a, b) => a - b),
      pans,
      "Partiturreihenfolge links nach rechts",
    );
    assert.ok(Math.abs(pans[0] + pans[3]) < 1e-9 && Math.abs(pans[0]) <= 0.5);
    const single = { score: { voices: [{ id: "x" }] }, events: [{ voice: "x", midi: 60 }] };
    assert.deepEqual(audio.voicePlaces(single).get("x"), { register: 60, pan: 0 });
  });
  test("Klangprobe: Anfangsakkord von unten", () => {
    const compiled = compiledSong();
    const chord = audio.openingChord(compiled);
    // The upbeat: bass below, the other voices in unison, entering from the tenor up.
    assert.deepEqual(
      chord.map((n) => n.voice),
      ["b", "t", "a", "s"],
    );
    for (let i = 1; i < chord.length; i++) assert.ok(chord[i - 1].midi <= chord[i].midi);
    for (const n of chord)
      assert.equal(
        n,
        compiled.events.find((e) => e.voice === n.voice),
      );
  });
  test("ein Oszillator je Ton, ohne Filter, im Stereobild platziert", () => {
    const ctx = fakeContext(),
      destination = { kind: "destination" };
    const tone = audio.createVoiceTone(
      ctx,
      destination,
      { midi: 45, voice: "b" },
      "ensemble",
      0,
      1,
      null,
      {
        register: 50,
        pan: 0.3,
      },
    );
    assert.equal(tone.profile.id, "bass");
    assert.equal(ctx.created.filter((n) => n.kind === "filter").length, 0);
    // Tone oscillator plus the vibrato LFO, no detuned double.
    assert.equal(ctx.created.filter((n) => n.kind === "oscillator").length, 2);
    assert.deepEqual(tone.osc.to, [tone.gain]);
    const panner = ctx.created.find((n) => n.kind === "panner");
    assert.equal(panner.pan.value, 0.3);
    assert.deepEqual(tone.gain.to, [panner]);
    assert.deepEqual(panner.to, [destination]);
    assert.equal(tone.osc.wave.options.disableNormalization, true);
  });
  test("Chor-Klang unverändert: zwei verstimmte Oszillatoren durch einen Tiefpass", () => {
    const ctx = fakeContext();
    audio.createVoiceTone(ctx, {}, { midi: 60, voice: "s" }, "choir", 0, 1, null, { pan: 0.3 });
    const filter = ctx.created.find((n) => n.kind === "filter");
    const oscillators = ctx.created.filter((n) => n.kind === "oscillator");
    assert.equal(oscillators.length, 2);
    for (const osc of oscillators) assert.deepEqual(osc.to, [filter]);
    assert.equal(ctx.created.filter((n) => n.kind === "panner").length, 0);
  });
});
