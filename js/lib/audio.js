"use strict";
// Wiedergabe mit WebAudio: Klänge, Fermaten-Zeitachse, Dynamikpegel und Transport.
Chorprobe.audio = (function () {
  // mf keeps the loudness of songs without dynamics; other levels scale relative to it.
  const REFERENCE = Chorprobe.dynamics.LEVELS.mf;
  function dynamicGain(dyn) {
    return dyn
      ? { sustain: dyn.level / REFERENCE, peak: (dyn.attack ?? dyn.level) / REFERENCE }
      : { sustain: 1, peak: 1 };
  }
  const timbre = Chorprobe.timbre;
  const ROOM_LEVEL = 0.2,
    ENSEMBLE = Math.hypot(0.5, 0.36, 0.36);
  // choir: a sung tone per voice type (see timbre.js); attack and release come from the type.
  // The instruments share one waveform for all voices; cutoff is a multiple of the frequency.
  const VOICE_SOUNDS = {
    choir: {
      name: "Chor · Stimmfarben",
      sung: true,
      peak: 0.25,
      sustain: 0.2,
      decay: 0.2,
    },
    flute: {
      name: "Flöte · luftig",
      harmonics: [1, 0.025, 0.1, 0.005, 0.012],
      attack: 0.095,
      peak: 0.14,
      sustain: 0.13,
      decay: 0.18,
      cutoff: 3.8,
      vibrato: 4.8,
      depth: 5,
    },
    clarinet: {
      name: "Klarinette · hohl",
      harmonics: [1, 0.008, 0.7, 0.006, 0.38, 0.004, 0.19, 0.002, 0.09],
      attack: 0.025,
      peak: 0.2,
      sustain: 0.16,
      decay: 0.12,
      cutoff: 9,
      vibrato: 0,
      depth: 0,
    },
    sax: {
      name: "Tenorsaxofon · rauchig",
      harmonics: [1, 0.85, 0.65, 0.5, 0.34, 0.23, 0.16, 0.1, 0.065, 0.035, 0.02],
      attack: 0.035,
      peak: 0.26,
      sustain: 0.2,
      decay: 0.12,
      cutoff: 9,
      vibrato: 5.3,
      depth: 14,
      q: 0.85,
    },
    pluck: {
      name: "Zupfklang · klar",
      harmonics: [1, 0.6, 0.34, 0.2, 0.11, 0.06, 0.025],
      attack: 0.004,
      peak: 0.3,
      sustain: 0.018,
      decay: 0.18,
      cutoff: 7,
      vibrato: 0,
      depth: 0,
      pluck: true,
    },
  };
  const waveformCache = new WeakMap();
  function cached(ctx, key, make) {
    let cache = waveformCache.get(ctx);
    if (!cache) {
      cache = new Map();
      waveformCache.set(ctx, cache);
    }
    if (!cache.has(key)) cache.set(key, make());
    return cache.get(key);
  }
  function instrumentWave(ctx, id) {
    return cached(ctx, id, () => {
      const h = VOICE_SOUNDS[id].harmonics;
      return ctx.createPeriodicWave(new Float32Array(h.length + 1), new Float32Array([0, ...h]));
    });
  }
  // The spectra are already loudness-matched, so the browser must not normalize them again.
  function sungWave(ctx, type, midi, level) {
    const step = Math.round(level * 20) / 20;
    return cached(ctx, `sung:${type}:${midi}:${step}`, () => {
      const amps = timbre.harmonicSpectrum(type, midi, step);
      return ctx.createPeriodicWave(new Float32Array(amps.length), amps, {
        disableNormalization: true,
      });
    });
  }
  // Synthetic room: decaying stereo noise, darker towards the end (no impulse file needed).
  function roomImpulse(ctx, seconds = 1.6) {
    const length = Math.round(ctx.sampleRate * seconds),
      buffer = ctx.createBuffer(2, length, ctx.sampleRate),
      predelay = Math.round(ctx.sampleRate * 0.018);
    for (let c = 0; c < 2; c++) {
      const data = buffer.getChannelData(c);
      let smooth = 0;
      for (let i = predelay; i < length; i++) {
        const t = (i - predelay) / ctx.sampleRate,
          damping = Math.min(0.92, 0.25 + t * 0.9);
        smooth = smooth * damping + (Math.random() * 2 - 1) * (1 - damping);
        data[i] = smooth * Math.exp(-t / 0.28) * (1 + damping * 2);
      }
    }
    return buffer;
  }
  // Envelope shared by all sounds: attack to the peak (or a soft crossfade within a slur), decay
  // to the held level, release just before the next note (or overlapping it within a slur).
  function envelope(gain, at, until, { attack, peak, hold, decay, release, legatoIn, legatoOut }) {
    gain.setValueAtTime(0, at);
    if (legatoIn) gain.linearRampToValueAtTime(hold, at + 0.04);
    else {
      gain.linearRampToValueAtTime(peak, at + attack);
      gain.setTargetAtTime(hold, at + attack, decay);
    }
    const releaseAt = legatoOut ? until : Math.max(at + attack, until - 0.03),
      fade = legatoOut ? 0.02 : release;
    gain.setTargetAtTime(0.0001, releaseAt, fade);
    return releaseAt + fade * 5 - until;
  }
  function vibrato(ctx, at, rate, cents, delay, targets) {
    const lfo = ctx.createOscillator(),
      depth = ctx.createGain();
    // Slightly different rates keep simultaneous voices from pulsing in step.
    lfo.frequency.value = rate * (0.97 + Math.random() * 0.06);
    depth.gain.setValueAtTime(0, at);
    depth.gain.setTargetAtTime(cents, at + delay, 0.2);
    lfo.connect(depth);
    for (const t of targets) depth.connect(t.detune);
    lfo.start(at);
    return [lfo, depth];
  }
  // Level of a held note at time t from its curve [[seconds, level]], even in dB between points.
  function curveLevel(points, t) {
    let i = 0;
    while (i + 1 < points.length && points[i + 1][0] <= t) i++;
    const [t0, a] = points[i],
      next = points[i + 1];
    if (!next || next[0] <= t0 || t <= t0) return a;
    return a * (next[1] / a) ** (Math.min(1, (t - t0) / (next[0] - t0)) || 0);
  }
  // Let an AudioParam follow a held note's curve from `at` on: value(level) gives the parameter
  // value, exponential ramps keep level changes even in dB (linear ramps for crossfade weights).
  // Steps (two points at once) become short ramps.
  function follow(param, at, points, value, linear = false) {
    param.setValueAtTime(value(curveLevel(points, at)), at);
    let last = at;
    for (const [t, level] of points) {
      if (t <= at) continue;
      last = Math.max(t, last + 0.03);
      if (linear) param.linearRampToValueAtTime(value(level), last);
      else param.exponentialRampToValueAtTime(Math.max(1e-4, value(level)), last);
    }
  }
  // Parameters that follow a held note's curve; a tone that is extended (tap mode) follows anew.
  function followAll(followers, at, points, restart = false) {
    for (const { param, value, linear } of followers) {
      if (restart) {
        if (param.cancelAndHoldAtTime) param.cancelAndHoldAtTime(at);
        else param.cancelScheduledValues(at);
      }
      follow(param, at, points, value, linear);
    }
  }
  // Sung tone: three slightly detuned singers per voice with a vibrato that sets in late and the
  // spectrum of the voice type at this pitch and dynamic level. No breath noise at the onset: in
  // quick succession it sounded like a snare drum. A hairpin during the note (options.span, curve)
  // crossfades between the spectra of its quietest and loudest level: both waveforms are in phase,
  // so the mix interpolates every partial, and with levels even in dB the crossfade weight changes
  // linearly in time. A lowpass could only darken, and muffled the basses.
  function sungTone(ctx, destination, note, type, at, until, dyn, options) {
    const p = timbre.TYPES[type] || timbre.TYPES.alto,
      profile = VOICE_SOUNDS.choir,
      frequency = timbre.frequency(note.midi),
      length = Math.max(0.03, until - at),
      level = dynamicGain(dyn),
      onset = dyn?.level ?? REFERENCE,
      [low, high] = options.span ?? [onset, onset],
      swell = high / low > 1.001,
      gain = ctx.createGain(),
      shape = ctx.createGain(),
      filter = ctx.createBiquadFilter(),
      sources = [],
      graph = [filter, shape, gain];
    filter.type = "lowpass";
    filter.Q.value = 0.5;
    filter.frequency.value = 5500 + 3500 * Math.min(1.3, high / REFERENCE);
    const followers = [],
      weight = (x) => Math.log(x / low) / Math.log(high / low);
    const layers = (swell ? [low, high] : [onset]).map((l, i) => {
      const bus = ctx.createGain();
      if (swell)
        followers.push({
          param: bus.gain,
          value: (x) => (i ? weight(x) : 1 - weight(x)),
          linear: true,
        });
      bus.connect(filter);
      graph.push(bus);
      return { bus, wave: sungWave(ctx, type, note.midi, l) };
    });
    if (swell) followers.push({ param: shape.gain, value: (x) => x / onset });
    followAll(followers, at, options.curve ?? [[at, onset]]);
    // Fewer, closer companions sound cleaner; the level stays the same.
    const shares = [0.5, p.ensemble, p.ensemble],
      norm = ENSEMBLE / Math.hypot(...shares);
    for (const [detune, share] of [
      [0, shares[0] * norm],
      [p.spread, shares[1] * norm],
      [-p.spread * 0.8, shares[2] * norm],
    ]) {
      for (const { bus, wave } of layers) {
        const osc = ctx.createOscillator(),
          part = ctx.createGain();
        osc.setPeriodicWave(wave);
        osc.frequency.value = frequency;
        osc.detune.value = detune;
        part.gain.value = share;
        osc.connect(part);
        part.connect(bus);
        osc.start(at);
        sources.push(osc);
        graph.push(osc, part);
      }
    }
    if (length > 0.3) {
      const nodes = vibrato(ctx, at, p.vibrato.rate, p.vibrato.depth, 0.28, sources);
      sources.push(nodes[0]);
      graph.push(...nodes);
    }
    filter.connect(shape);
    shape.connect(gain);
    gain.connect(destination);
    const hold = profile.sustain * level.sustain;
    const tail = envelope(gain.gain, at, until, {
      attack: Math.min(p.attack, length * 0.3),
      peak: profile.peak * level.peak,
      hold,
      decay: profile.decay,
      release: p.release / 4,
      ...options,
    });
    return { gain, sources, graph, hold, tail, followers };
  }
  function instrumentTone(ctx, destination, note, id, at, until, dyn, options) {
    const profile = VOICE_SOUNDS[id],
      osc = ctx.createOscillator(),
      gain = ctx.createGain(),
      shape = ctx.createGain(),
      filter = ctx.createBiquadFilter(),
      sources = [osc],
      graph = [osc, filter, shape, gain];
    const frequency = timbre.frequency(note.midi),
      length = Math.max(0.03, until - at),
      level = dynamicGain(dyn),
      onset = dyn?.level ?? REFERENCE,
      followers = [];
    osc.setPeriodicWave(instrumentWave(ctx, id));
    osc.frequency.setValueAtTime(frequency, at);
    filter.type = "lowpass";
    filter.Q.value = profile.q ?? 0.5;
    // Louder notes open the filter; the floor keeps low notes from sounding muffled.
    const cutoff = (l) =>
      Math.min(14000, Math.max(900, frequency * profile.cutoff) * (0.65 + (0.35 * l) / REFERENCE));
    if (profile.pluck) {
      filter.frequency.setValueAtTime(cutoff(onset), at);
      filter.frequency.setTargetAtTime(Math.max(frequency * 1.3, 350), at + 0.012, 0.22);
    } else followers.push({ param: filter.frequency, value: cutoff });
    followers.push({ param: shape.gain, value: (x) => x / onset });
    followAll(followers, at, options.curve ?? [[at, onset]]);
    osc.connect(filter);
    filter.connect(shape);
    shape.connect(gain);
    gain.connect(destination);
    if (profile.vibrato) {
      const nodes = vibrato(ctx, at, profile.vibrato, profile.depth, 0.1, [osc]);
      sources.push(nodes[0]);
      graph.push(...nodes);
    }
    osc.start(at);
    const hold = profile.sustain * level.sustain;
    const tail = envelope(gain.gain, at, until, {
      attack: Math.min(profile.attack, length * 0.3),
      peak: profile.peak * level.peak,
      hold,
      decay: profile.decay,
      release: 0.012,
      ...options,
    });
    return { gain, sources, graph, hold, tail, followers };
  }
  // options: { type: voice type for the choir sound, legatoIn, legatoOut, curve: [[seconds, level]] }.
  function createVoiceTone(ctx, destination, note, id, at, until, dyn = null, options = {}) {
    const preset = VOICE_SOUNDS[id] ? id : "choir",
      { type = "alto", ...shape } = options,
      tone = VOICE_SOUNDS[preset].sung
        ? sungTone(ctx, destination, note, type, at, until, dyn, shape)
        : instrumentTone(ctx, destination, note, preset, at, until, dyn, shape);
    return { ...tone, preset, until, at, note, dyn, level: dynamicGain(dyn) };
  }
  // Held-note dynamics for the part of a note that is scheduled now (until tick `stop`; in tap
  // mode that is the current step). curve: [[seconds, level]] on the audio clock; span: quietest
  // and loudest level of the whole note, so the sound is prepared for all of it.
  function heldDynamics(curve, stop, seconds) {
    if (!curve) return {};
    const levels = curve.map(([, l]) => l),
      part = curve.filter(([t]) => t < stop);
    return {
      curve: [...part, [stop, Chorprobe.dynamics.levelAt(curve, stop)]].map(([t, l]) => [
        seconds(t),
        l,
      ]),
      span: [Math.min(...levels), Math.max(...levels)],
    };
  }
  // Events sung legato into the next one: both lie in the same slur and follow without a rest.
  // Returns { into, from }: ids that start without a new attack / that hand over to the next note.
  function legatoNotes(compiled) {
    const slurOf = new Map();
    for (const slur of compiled.slurs || []) for (const n of slur.notes) slurOf.set(n.id, slur);
    const into = new Set(),
      from = new Set(),
      last = {};
    for (const e of compiled.events) {
      const prev = last[e.voice],
        slur = slurOf.get(e.noteIds?.[0] ?? e.id);
      if (prev && slur && prev.end === e.start && slurOf.get(prev.noteIds?.at(-1)) === slur) {
        into.add(e.id);
        from.add(prev.id);
      }
      last[e.voice] = e;
    }
    return { into, from };
  }
  function performanceTimeline(compiled) {
    const holds = compiled.measures.flatMap((m) =>
      Object.values(m.voices)
        .flat()
        .filter((n) => n.fermata)
        .map((n) => [m.start + n.at, m.start + n.at + n.duration]),
    );
    const points = [...new Set([0, compiled.total, ...holds.flat()])].sort((a, b) => a - b);
    let elapsed = 0;
    const segments = points.slice(0, -1).map((a, i) => {
      const b = points[i + 1],
        factor = holds.some((h) => h[0] <= a && h[1] >= b) ? 1.5 : 1;
      const segment = {
        start: a,
        end: b,
        performedStart: elapsed,
        performedEnd: elapsed + (b - a) * factor,
        factor,
      };
      elapsed = segment.performedEnd;
      return segment;
    });
    const toPerformed = (t) => {
      const s = segments.find((s) => t < s.end) || segments.at(-1);
      return s ? s.performedStart + (t - s.start) * s.factor : t;
    };
    const toScore = (t) => {
      const s = segments.find((s) => t < s.performedEnd) || segments.at(-1);
      return s ? s.start + (t - s.performedStart) / s.factor : t;
    };
    return { segments, toPerformed, toScore, total: elapsed };
  }
  class ChoirAudio {
    constructor(onTick, onEnd) {
      this.onTick = onTick;
      this.onEnd = onEnd;
      this.ctx = null;
      this.nodes = new Map();
      this.gains = new Map();
      this.mix = {};
      this.running = false;
      this.master = 0.7;
      this.frame = 0;
      this.timer = 0;
      this.sound = "choir";
      this.room = true;
      this.types = {};
      this.pans = {};
      this.panners = [];
      this.previewGains = new Map();
      this.legato = { into: new Set(), from: new Set() };
    }
    async ready() {
      if (!this.ctx) {
        const C = globalThis.AudioContext || globalThis.webkitAudioContext;
        if (!C) throw new Error("Dieser Browser unterstützt die Audiowiedergabe nicht.");
        this.ctx = new C();
        this.output = this.ctx.createGain();
        this.output.gain.value = this.master;
        const comp = this.ctx.createDynamicsCompressor();
        comp.threshold.value = -12;
        comp.ratio.value = 6;
        this.output.connect(comp);
        comp.connect(this.ctx.destination);
        // All voices meet on the stage: dry to the output and through a small room.
        this.stage = this.ctx.createGain();
        this.stage.connect(this.output);
        this.wet = this.ctx.createGain();
        this.wet.gain.value = this.room ? ROOM_LEVEL : 0;
        const convolver = this.ctx.createConvolver();
        convolver.buffer = roomImpulse(this.ctx);
        this.stage.connect(this.wet);
        this.wet.connect(convolver);
        convolver.connect(this.output);
      }
      await this.ctx.resume();
      if (this.ctx.state !== "running")
        throw new Error("Audio ist noch gesperrt. Bitte noch einmal auf Abspielen tippen.");
    }
    setScore(c) {
      this.stop();
      this.compiled = c;
      this.timeline = performanceTimeline(c);
      this.types = timbre.voiceTypes(c);
      this.pans = timbre.voicePans(c.score.voices, this.types);
      this.legato = legatoNotes(c);
      this.placeVoices();
    }
    // Room on: voices placed like a choir in front of you, with reverb. Off: dry and centred.
    setRoom(on) {
      this.room = !!on;
      if (!this.ctx) return;
      this.wet.gain.setTargetAtTime(this.room ? ROOM_LEVEL : 0, this.ctx.currentTime, 0.05);
      this.placeVoices();
    }
    placeVoices() {
      if (!this.ctx) return;
      for (const { panner, voice } of this.panners)
        panner.pan.setTargetAtTime(
          this.room ? (this.pans[voice] ?? 0) : 0,
          this.ctx.currentTime,
          0.05,
        );
    }
    setMix(mix) {
      this.mix = mix;
      if (!this.ctx) return;
      if (this.running && this.mixAt) {
        this.scheduleMix();
        return;
      }
      for (const [id, g] of this.gains)
        g.gain.setTargetAtTime(mix[id] ?? 0, this.ctx.currentTime, 0.025);
    }
    scheduleMix() {
      // Schedule voice changes on the audio clock, independently of animation frames.
      if (!this.running || !this.mixAt) return;
      const now = this.ctx.currentTime,
        from = this.position();
      const ticks = [from, ...this.mixTicks.filter((t) => t > from && t < this.endTick)].sort(
        (a, b) => a - b,
      );
      this.mixSchedule = ticks.map((t) => ({
        tick: t,
        at: Math.max(now, this.startTime + this.secondsAtScore(t)),
        mix: this.mixAt(t),
      }));
      for (const voice of this.compiled.score.voices) {
        const gain = this.channel(voice.id).gain;
        gain.cancelScheduledValues(now);
        for (const point of this.mixSchedule)
          gain.setTargetAtTime(point.mix[voice.id] ?? 0, point.at, 0.005);
      }
      this.mix = this.mixSchedule[0]?.mix || this.mix;
    }
    setMaster(value) {
      this.master = value;
      if (this.output) this.output.gain.setTargetAtTime(value, this.ctx.currentTime, 0.025);
    }
    // Voice channel with its mix gain; sound samples use a separate channel that is always open.
    channel(id, preview = false) {
      const channels = preview ? this.previewGains : this.gains;
      if (!channels.has(id)) {
        const g = this.ctx.createGain();
        g.gain.value = preview ? 1 : (this.mix[id] ?? 0);
        if (this.ctx.createStereoPanner) {
          const panner = this.ctx.createStereoPanner();
          panner.pan.value = this.room ? (this.pans[id] ?? 0) : 0;
          g.connect(panner);
          panner.connect(this.stage);
          this.panners.push({ panner, voice: id });
        } else g.connect(this.stage);
        channels.set(id, g);
      }
      return channels.get(id);
    }
    soundFor() {
      return Object.hasOwn(VOICE_SOUNDS, this.sound) ? this.sound : "choir";
    }
    setSound(sound) {
      if (!Object.hasOwn(VOICE_SOUNDS, sound)) return;
      this.sound = sound;
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      for (const [key, n] of [...this.nodes]) {
        const at = Math.max(now + 0.005, n.at),
          until = n.until,
          note = n.note;
        this.kill(key, 0.025);
        if (until > at) this.tone(note, at, until, key, n.dyn, n.shape);
      }
    }
    kill(key, fade = 0) {
      const n = this.nodes.get(key);
      if (!n) return;
      this.nodes.delete(key);
      const cleanup = () => {
        for (const source of n.sources)
          try {
            source.stop();
          } catch {}
        for (const node of n.graph)
          try {
            node.disconnect();
          } catch {}
      };
      if (fade && this.ctx) {
        const now = this.ctx.currentTime;
        n.gain.gain.cancelScheduledValues(now);
        n.gain.gain.setTargetAtTime(0.0001, now, fade / 3);
        setTimeout(cleanup, fade * 1000 + 10);
      } else cleanup();
    }
    // shape: { legatoIn, legatoOut } for notes inside a slur, curve for held-note dynamics.
    tone(note, at, until, key = note.id, dyn = null, shape = {}) {
      const now = this.ctx.currentTime;
      let n = this.nodes.get(key);
      if (n && n.at <= now && n.until > now - 0.035 && n.preset === this.soundFor(note.voice)) {
        n.gain.gain.cancelScheduledValues(now);
        n.gain.gain.setTargetAtTime(n.hold, now, 0.015);
        n.until = until;
        n.gain.gain.setTargetAtTime(0.0001, Math.max(now, until - 0.025), 0.012);
        if (shape.curve) followAll(n.followers, now, shape.curve, true);
        return;
      }
      if (n) this.kill(key);
      n = createVoiceTone(
        this.ctx,
        this.channel(note.voice, key.startsWith("preview:")),
        note,
        this.soundFor(note.voice),
        at,
        until,
        dyn,
        { type: this.types[note.voice], ...shape },
      );
      n.shape = shape;
      this.nodes.set(key, n);
    }
    // Sound sample: the notes enter one after another, from the lowest, and sound together.
    async preview(notes) {
      const token = (this.previewToken ?? 0) + 1;
      this.previewToken = token;
      await this.ready();
      if (token !== this.previewToken) return;
      for (const key of [...this.nodes.keys()])
        if (key.startsWith("preview:")) this.kill(key, 0.02);
      const now = this.ctx.currentTime,
        sorted = [...notes].sort((a, b) => a.midi - b.midi),
        end = now + 0.015 + sorted.length * 0.3 + 1.1;
      sorted.forEach((note, i) =>
        this.tone(note, now + 0.015 + i * 0.3, end, `preview:${token}:${i}`),
      );
      setTimeout(
        () => {
          for (const key of [...this.nodes.keys()])
            if (key.startsWith(`preview:${token}:`)) this.kill(key);
        },
        (end - now + 0.3) * 1000,
      );
    }
    position() {
      if (!this.running) return this.cursor ?? 0;
      return Math.min(
        this.endTick,
        this.scoreAtSeconds(Math.max(0, this.ctx.currentTime - this.startTime)),
      );
    }
    play(
      start,
      end,
      bpm,
      {
        carry = false,
        fermata = true,
        tempoRange = null,
        mixAt = null,
        mixTicks = [],
        levels = null,
      } = {},
    ) {
      const now = this.ctx.currentTime;
      clearInterval(this.timer);
      cancelAnimationFrame(this.frame);
      for (const [key, n] of this.nodes) {
        if (!carry || n.at > now || n.note.start > start || n.note.end <= start) this.kill(key);
      }
      this.toPerformance = fermata ? this.timeline.toPerformed : (t) => t;
      this.fromPerformance = fermata ? this.timeline.toScore : (t) => t;
      this.performanceStart = this.toPerformance(start);
      this.startTick = start;
      this.endTick = end;
      this.startTime = now + 0.025;
      this.rate = (bpm * this.compiled.score.ppq) / 60;
      this.cursor = start;
      this.running = true;
      this.queued = new Set();
      const a = tempoRange ? Math.max(start, Math.min(end, tempoRange.start)) : end,
        b = tempoRange ? Math.max(a, Math.min(end, tempoRange.end)) : end;
      const p0 = this.toPerformance(start),
        pa = this.toPerformance(a),
        pb = this.toPerformance(b),
        pe = this.toPerformance(end),
        factor = tempoRange?.factor || 1;
      const first = (pa - p0) / this.rate,
        slow = (pb - pa) / (this.rate * factor);
      this.secondsAtScore = (t) => {
        const p = this.toPerformance(Math.max(start, Math.min(end, t)));
        return p <= pa
          ? (p - p0) / this.rate
          : p <= pb
            ? first + (p - pa) / (this.rate * factor)
            : first + slow + (p - pb) / this.rate;
      };
      this.scoreAtSeconds = (s) =>
        this.fromPerformance(
          s <= first
            ? p0 + s * this.rate
            : s <= first + slow
              ? pa + (s - first) * this.rate * factor
              : Math.min(pe, pb + (s - first - slow) * this.rate),
        );
      this.mixAt = mixAt;
      this.mixTicks = [...new Set(mixTicks)];
      this.scheduleMix();
      this.candidates = this.compiled.events.filter((n) => n.end > start && n.start < end);
      const pump = () => {
        const time = this.ctx.currentTime;
        for (const n of this.candidates) {
          if (this.queued.has(n.id)) continue;
          const at = this.startTime + this.secondsAtScore(Math.max(n.start, start));
          if (at > time + 0.13) continue;
          const until = this.startTime + this.secondsAtScore(Math.min(n.end, end));
          const dyn = levels?.get(n.id);
          if (until > time)
            this.tone(n, Math.max(time + 0.001, at), until, n.id, dyn, {
              legatoIn: n.start > start && this.legato.into.has(n.id),
              legatoOut: n.end < end && this.legato.from.has(n.id),
              ...heldDynamics(
                dyn?.curve,
                Math.min(n.end, end),
                (t) => this.startTime + this.secondsAtScore(t),
              ),
            });
          this.queued.add(n.id);
        }
        for (const [key, n] of this.nodes) if (time > n.until + n.tail + 0.02) this.kill(key);
      };
      const frame = () => {
        if (!this.running) return;
        this.cursor = this.position();
        this.onTick(this.cursor);
        if (this.cursor >= end) {
          this.running = false;
          clearInterval(this.timer);
          this.onEnd(end);
          setTimeout(() => {
            for (const [key, n] of this.nodes)
              if (this.ctx.currentTime > n.until + n.tail + 0.02) this.kill(key);
          }, 100);
          return;
        }
        this.frame = requestAnimationFrame(frame);
      };
      pump();
      this.timer = setInterval(pump, 25);
      this.frame = requestAnimationFrame(frame);
    }
    stop() {
      this.previewToken = (this.previewToken ?? 0) + 1;
      this.cursor = this.position();
      this.running = false;
      this.mixAt = null;
      this.mixSchedule = [];
      if (this.ctx)
        for (const gain of this.gains.values())
          gain.gain.cancelScheduledValues(this.ctx.currentTime);
      clearInterval(this.timer);
      cancelAnimationFrame(this.frame);
      for (const k of [...this.nodes.keys()]) this.kill(k);
      return this.cursor;
    }
    async cue(notes, onVoice) {
      this.cancelCue();
      const token = this.cueToken;
      await this.ready();
      if (this.cueToken !== token) return;
      this.setMix(this.mix);
      for (let i = 0; i < notes.length; i++) {
        if (this.cueToken !== token) return;
        const n = notes[i];
        onVoice(n, i);
        this.tone(n, this.ctx.currentTime + 0.02, this.ctx.currentTime + 0.85, `cue:${i}`);
        await new Promise((r) => setTimeout(r, 1050));
        if (this.cueToken !== token) return;
        this.kill(`cue:${i}`);
      }
      if (this.cueToken === token) onVoice(null, notes.length);
    }
    cancelCue() {
      this.cueToken = (this.cueToken ?? 0) + 1;
      this.stop();
    }
  }

  return {
    ChoirAudio,
    performanceTimeline,
    legatoNotes,
    heldDynamics,
    VOICE_SOUNDS,
    createVoiceTone,
    dynamicGain,
    roomImpulse,
  };
})();
