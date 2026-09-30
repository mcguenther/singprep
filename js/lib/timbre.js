"use strict";
// Stimmfarben ohne DOM: Stimmlage je Stimme erkennen und daraus Obertonspektren für den Chorklang
// berechnen (Formanten, Sängerformant, Dynamik als Helligkeit, Lautheitsausgleich über die Lagen).
Chorprobe.timbre = (function () {
  // Formants of a neutral, rounded choir vowel (between „o“ and „a“) for a tenor; other types scale
  // them. singer: the "singer's formant" cluster that gives low male voices their ring.
  const VOWEL = [
    [480, 90, 1],
    [860, 100, 0.8],
    [2450, 140, 0.5],
    [3300, 220, 0.35],
  ];
  const TYPES = {
    soprano: {
      name: "Sopran",
      center: 72,
      formants: 1.17,
      tilt: 9.5,
      singer: { at: 3100, gain: 0.6 },
      vibrato: { rate: 5.6, depth: 11 },
      spread: 3,
      attack: 0.05,
      release: 0.09,
      pan: -0.35,
    },
    mezzo: {
      name: "Mezzosopran",
      center: 67,
      formants: 1.12,
      tilt: 9,
      singer: { at: 3000, gain: 0.8 },
      vibrato: { rate: 5.4, depth: 10 },
      spread: 3.5,
      attack: 0.055,
      release: 0.1,
      pan: -0.15,
    },
    alto: {
      name: "Alt",
      center: 64,
      formants: 1.08,
      tilt: 8.5,
      singer: { at: 2900, gain: 1 },
      vibrato: { rate: 5.3, depth: 9 },
      spread: 4,
      attack: 0.06,
      release: 0.11,
      pan: 0.3,
    },
    tenor: {
      name: "Tenor",
      center: 57,
      formants: 1,
      tilt: 8,
      singer: { at: 2850, gain: 3 },
      vibrato: { rate: 5.4, depth: 9 },
      spread: 4,
      attack: 0.06,
      release: 0.12,
      pan: -0.15,
    },
    baritone: {
      name: "Bariton",
      center: 52,
      formants: 0.96,
      tilt: 7.5,
      singer: { at: 2650, gain: 3.5 },
      vibrato: { rate: 5.1, depth: 8 },
      spread: 4.5,
      attack: 0.07,
      release: 0.14,
      pan: 0.1,
    },
    bass: {
      name: "Bass",
      center: 48,
      formants: 0.91,
      tilt: 7,
      singer: { at: 2450, gain: 4 },
      vibrato: { rate: 4.9, depth: 7 },
      spread: 5,
      attack: 0.08,
      release: 0.16,
      pan: 0.25,
    },
  };
  const ORDER = ["soprano", "mezzo", "alto", "tenor", "baritone", "bass"];
  // Word stems in voice names.
  const NAMES = [
    ["mezzo", /mezzo/],
    ["soprano", /sopran|diskant|cantus|superius/],
    ["alto", /\balt|contralto/],
    ["tenor", /tenor/],
    ["baritone", /bariton/],
    ["bass", /\bbass|basso/],
  ];
  // Short labels like "S", "A2", "T 1" count only in a choir labelled that way throughout;
  // elsewhere "T" might just as well mean "tief".
  const LETTER = /^([satb])\s*\d*$/i,
    LETTERS = { s: "soprano", a: "alto", t: "tenor", b: "bass" };
  const label = (v) => [v.short, v.name].find((t) => LETTER.test(String(t || "").trim()));

  // Voice type from the optional voiceType field, the name ("Sopran I", "Bass 2"), SATB letters
  // (letters: true) or else the median pitch of its notes.
  function detectVoiceType(voice, midis = [], { letters = false } = {}) {
    if (voice.voiceType && TYPES[voice.voiceType]) return voice.voiceType;
    for (const text of [voice.name, voice.short]) {
      const lower = String(text || "").toLowerCase();
      for (const [type, pattern] of NAMES) if (pattern.test(lower)) return type;
    }
    if (letters && label(voice)) return LETTERS[LETTER.exec(label(voice).trim())[1].toLowerCase()];
    if (!midis.length) return voice.clef === "bass" ? "bass" : "alto";
    const sorted = [...midis].sort((a, b) => a - b),
      median = sorted[Math.floor(sorted.length / 2)];
    return ORDER.reduce((best, t) =>
      Math.abs(TYPES[t].center - median) < Math.abs(TYPES[best].center - median) ? t : best,
    );
  }
  // { voiceId: type } for a compiled score. Voices in unison sections keep their own type.
  function voiceTypes(compiled) {
    const result = {},
      letters = compiled.score.voices.every((v) => label(v));
    for (const v of compiled.score.voices) {
      const midis = compiled.events
        .filter((n) => n.voice === v.id)
        .map((n) => n.midi)
        .filter(Number.isFinite);
      result[v.id] = detectVoiceType(v, midis, { letters });
    }
    return result;
  }

  // Stereo position per voice, as a choir stands in blocks (sopranos and tenors left, altos and
  // basses right). Several voices of one type (Sopran I/II) stand next to each other.
  function voicePans(voices, types) {
    const result = {};
    for (const type of ORDER) {
      const group = voices.filter((v) => types[v.id] === type);
      group.forEach((v, i) => {
        const offset = group.length > 1 ? (i / (group.length - 1) - 0.5) * 0.3 : 0;
        result[v.id] = Math.max(-0.7, Math.min(0.7, TYPES[type].pan + offset));
      });
    }
    return result;
  }

  const frequency = (midi) => 440 * 2 ** ((midi - 69) / 12);
  // Magnitude of a vocal-tract resonance at f (1 below it, peak F/B at it, falling above).
  function resonance(f, F, B) {
    return (F * F) / Math.sqrt((F * F - f * f) ** 2 + (B * f) ** 2);
  }
  // Rough ear weighting (half of an A-weighting in dB), so that basses are not turned up until
  // their fundamentals boom.
  function earWeight(f) {
    const f2 = f * f,
      a =
        (12194 ** 2 * f2 * f2) /
        ((f2 + 20.6 ** 2) * Math.sqrt((f2 + 107.7 ** 2) * (f2 + 737.9 ** 2)) * (f2 + 12194 ** 2));
    return Math.sqrt(a * 1.2589);
  }
  const LOUDNESS = 0.32,
    MAX_FREQUENCY = 9000;

  // Harmonic amplitudes (index 1 = fundamental) of a sung tone. level is the dynamic level
  // (pp 0.3 … ff 1): louder singing tilts the spectrum up and strengthens the singer's formant.
  // The result is scaled to a similar perceived loudness for every type and pitch.
  function harmonicSpectrum(type, midi, level = 0.75) {
    const p = TYPES[type] || TYPES.alto,
      f0 = frequency(midi),
      count = Math.max(1, Math.floor(MAX_FREQUENCY / f0)),
      tilt = p.tilt + (0.75 - level) * 10,
      singer = p.singer.gain * (0.55 + level * 0.6);
    // Formant tuning: when the fundamental rises above the first formant, singers open the vowel
    // so that F1 follows it. This is what keeps high soprano notes round instead of shrill.
    const formants = VOWEL.map(([F, B, weight], i) => {
      let at = F * p.formants;
      if (i === 0 && f0 > at * 0.85) at = f0 * 1.1;
      if (i === 1 && f0 > at * 0.8) at = f0 * 1.9;
      return [at, B * (0.8 + at / 2000), weight];
    });
    const amps = new Float32Array(count + 1);
    let power = 0;
    for (let k = 1; k <= count; k++) {
      const f = k * f0;
      let envelope = 1;
      for (const [F, B] of formants) envelope *= resonance(f, F, B) ** 0.5;
      const ring = 1 + singer * Math.exp(-((Math.log2(f / p.singer.at) / 0.22) ** 2));
      const a = k ** -(tilt / 6.02) * envelope * ring;
      amps[k] = a;
      power += (a * earWeight(f)) ** 2;
    }
    const scale = LOUDNESS / Math.sqrt(power / 2);
    for (let k = 1; k <= count; k++) amps[k] *= scale;
    // Cap the waveform peak: the summed amplitudes bound it, but real phases stay well below.
    const bound = amps.reduce((s, a) => s + a, 0);
    if (bound > 2.2) for (let k = 1; k <= count; k++) amps[k] *= 2.2 / bound;
    return amps;
  }
  // Spectral centroid in Hz; used by tests to compare brightness.
  function centroid(amps, f0) {
    let sum = 0,
      weighted = 0;
    for (let k = 1; k < amps.length; k++) {
      sum += amps[k] ** 2;
      weighted += amps[k] ** 2 * k * f0;
    }
    return weighted / sum;
  }

  return {
    TYPES,
    ORDER,
    detectVoiceType,
    voiceTypes,
    voicePans,
    harmonicSpectrum,
    centroid,
    frequency,
  };
})();
