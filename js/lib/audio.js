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
  const VOICE_SOUNDS = {
    choir: {
      name: "Chor · weich",
      harmonics: [1, 0.5, 0.26, 0.15, 0.08, 0.03],
      attack: 0.055,
      peak: 0.105,
      sustain: 0.075,
      decay: 0.15,
      cutoff: 5,
      vibrato: 0,
      depth: 0,
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
    },
  };
  const waveformCache = new WeakMap();
  function voiceWave(ctx, id) {
    let cache = waveformCache.get(ctx);
    if (!cache) {
      cache = new Map();
      waveformCache.set(ctx, cache);
    }
    if (!cache.has(id)) {
      const h = VOICE_SOUNDS[id].harmonics;
      cache.set(
        id,
        ctx.createPeriodicWave(new Float32Array(h.length + 1), new Float32Array([0, ...h])),
      );
    }
    return cache.get(id);
  }
  function createVoiceTone(ctx, destination, note, id, at, until, dyn = null) {
    const profile = VOICE_SOUNDS[id] || VOICE_SOUNDS.choir,
      osc = ctx.createOscillator(),
      gain = ctx.createGain(),
      filter = ctx.createBiquadFilter(),
      sources = [osc],
      graph = [osc, filter, gain];
    const frequency = 440 * 2 ** ((note.midi - 69) / 12),
      length = Math.max(0.03, until - at),
      attack = Math.min(profile.attack, length * 0.3);
    osc.setPeriodicWave(voiceWave(ctx, VOICE_SOUNDS[id] ? id : "choir"));
    osc.frequency.setValueAtTime(frequency, at);
    filter.type = "lowpass";
    filter.Q.value = id === "sax" ? 0.85 : 0.5;
    const cutoff = Math.min(14000, frequency * profile.cutoff);
    filter.frequency.setValueAtTime(cutoff, at);
    if (id === "pluck")
      filter.frequency.setTargetAtTime(Math.max(frequency * 1.3, 350), at + 0.012, 0.22);
    const level = dynamicGain(dyn);
    gain.gain.setValueAtTime(0, at);
    gain.gain.linearRampToValueAtTime(profile.peak * level.peak, at + attack);
    gain.gain.setTargetAtTime(profile.sustain * level.sustain, at + attack, profile.decay);
    gain.gain.setTargetAtTime(0.0001, Math.max(at + attack, until - 0.025), 0.012);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(destination);
    if (profile.vibrato) {
      const lfo = ctx.createOscillator(),
        depth = ctx.createGain();
      lfo.frequency.value = profile.vibrato;
      depth.gain.setValueAtTime(0, at);
      depth.gain.setTargetAtTime(profile.depth, at + 0.1, 0.18);
      lfo.connect(depth);
      depth.connect(osc.detune);
      lfo.start(at);
      sources.push(lfo);
      graph.push(lfo, depth);
    }
    if (id === "choir") {
      osc.detune.value = 4;
      const second = ctx.createOscillator();
      second.setPeriodicWave(voiceWave(ctx, "choir"));
      second.frequency.value = frequency;
      second.detune.value = -4;
      second.connect(filter);
      second.start(at);
      sources.push(second);
      graph.push(second);
    }
    osc.start(at);
    return { osc, gain, sources, graph, profile, preset: id, until, at, note, dyn, level };
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
        this.previewBus = this.ctx.createGain();
        this.previewBus.gain.value = 1;
        this.previewBus.connect(this.output);
      }
      await this.ctx.resume();
      if (this.ctx.state !== "running")
        throw new Error("Audio ist noch gesperrt. Bitte noch einmal auf Abspielen tippen.");
    }
    setScore(c) {
      this.stop();
      this.compiled = c;
      this.timeline = performanceTimeline(c);
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
    channel(id) {
      if (!this.gains.has(id)) {
        const g = this.ctx.createGain();
        g.gain.value = this.mix[id] ?? 0;
        g.connect(this.output);
        this.gains.set(id, g);
      }
      return this.gains.get(id);
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
        if (until > at) this.tone(note, at, until, key, n.dyn);
      }
    }
    kill(key, fade = 0) {
      const n = this.nodes.get(key);
      if (!n) return;
      this.nodes.delete(key);
      const cleanup = () => {
        for (const source of n.sources || [n.osc])
          try {
            source.stop();
          } catch {}
        for (const node of n.graph || [n.osc, n.gain])
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
    tone(note, at, until, key = note.id, dyn = null) {
      const now = this.ctx.currentTime;
      let n = this.nodes.get(key);
      if (n && n.at <= now && n.until > now - 0.035 && n.preset === this.soundFor(note.voice)) {
        n.gain.gain.cancelScheduledValues(now);
        n.gain.gain.setTargetAtTime(n.profile.sustain * n.level.sustain, now, 0.015);
        n.until = until;
        n.gain.gain.setTargetAtTime(0.0001, Math.max(now, until - 0.025), 0.012);
        return;
      }
      if (n) this.kill(key);
      n = createVoiceTone(
        this.ctx,
        key.startsWith("preview:") ? this.previewBus : this.channel(note.voice),
        note,
        this.soundFor(note.voice),
        at,
        until,
        dyn,
      );
      this.nodes.set(key, n);
    }
    async preview(note) {
      const token = (this.previewToken ?? 0) + 1;
      this.previewToken = token;
      await this.ready();
      if (token !== this.previewToken) return;
      for (const key of [...this.nodes.keys()])
        if (key.startsWith("preview:")) this.kill(key, 0.02);
      const key = `preview:${token}`,
        now = this.ctx.currentTime;
      this.tone(note, now + 0.015, now + 1.05, key);
      setTimeout(() => this.kill(key), 1150);
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
          if (until > time)
            this.tone(n, Math.max(time + 0.001, at), until, n.id, levels?.get(n.id));
          this.queued.add(n.id);
        }
        for (const [key, n] of this.nodes) if (time > n.until + 0.07) this.kill(key);
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
              if (this.ctx.currentTime > n.until + 0.06) this.kill(key);
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

  return { ChoirAudio, performanceTimeline, VOICE_SOUNDS, createVoiceTone, dynamicGain };
})();
