"use strict";
// Partiturdaten: Tonhöhen, Validierung (chorprobe/v1), Kompilierung zur Zeitachse, Strophentexte,
// Einsatztöne, Tempo und Stimmenmischung.
Chorprobe.score = (function () {
  const { validateLayout } = Chorprobe.original;
  const { MARKS, HAIRPINS } = Chorprobe.dynamics;
  const FORMAT = "chorprobe/v1";
  function midi(pitch) {
    if (pitch === null) return null;
    const m = /^([A-G])([#b]{0,2})(-?\d+)$/.exec(pitch || "");
    if (!m) throw new Error(`Ungültiger Ton „${pitch}“. Verwende z. B. F#4, Bb3 oder null.`);
    const value =
      { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[m[1]] +
      [...m[2]].reduce((a, c) => a + (c === "#" ? 1 : -1), 0) +
      (+m[3] + 1) * 12;
    if (value < 0 || value > 127) throw new Error(`Ton außerhalb des MIDI-Bereichs: ${pitch}`);
    return value;
  }
  function noteName(pitch) {
    if (pitch === null) return "Pause";
    return pitch
      .replace(/^B(?!b)/, "H")
      .replace(/^Bb/, "B")
      .replaceAll("#", "♯")
      .replaceAll("b", "♭");
  }
  function validateScore(input) {
    const fail = (m) => {
      throw new Error(m);
    };
    const keys = (o, allowed, loc) => {
      if (!o || typeof o !== "object" || Array.isArray(o)) fail(`${loc}: Objekt erwartet.`);
      for (const k of Object.keys(o))
        if (!allowed.includes(k)) fail(`${loc}: unbekanntes Feld „${k}“.`);
    };
    const text = (o, k, loc, max = 5000) => {
      if (o[k] !== undefined && (typeof o[k] !== "string" || o[k].length > max))
        fail(`${loc}: ${k} muss ein Text mit höchstens ${max} Zeichen sein.`);
    };
    keys(
      input,
      [
        "format",
        "title",
        "subtitle",
        "composer",
        "tempo",
        "ppq",
        "source",
        "comment",
        "sections",
        "voices",
        "measures",
        "layout",
        "verses",
      ],
      "Partitur",
    );
    for (const k of ["subtitle", "composer", "comment"]) text(input, k, "Partitur");
    if (input.source !== undefined) {
      keys(
        input.source,
        ["description", "image", "complete", "performanceNotes", "copyright", "edition"],
        "Quelle",
      );
      if (input.source.complete !== undefined && typeof input.source.complete !== "boolean")
        fail("source.complete muss true oder false sein.");
      text(input.source, "description", "Quelle");
      text(input.source, "image", "Quelle");
      for (const k of ["performanceNotes", "copyright", "edition"]) text(input.source, k, "Quelle");
    }
    if (input.format !== FORMAT) fail("Unbekanntes Format. Erwartet wird chorprobe/v1.");
    if (typeof input.title !== "string" || !input.title.trim() || input.title.length > 200)
      fail("Ein Titel mit maximal 200 Zeichen ist erforderlich.");
    if (!Number.isInteger(input.ppq) || input.ppq < 24 || input.ppq > 9600)
      fail("ppq muss eine ganze Zahl zwischen 24 und 9600 sein.");
    if (!Number.isFinite(input.tempo) || input.tempo < 20 || input.tempo > 300)
      fail("tempo muss zwischen 20 und 300 Vierteln pro Minute liegen.");
    if (!Array.isArray(input.voices) || input.voices.length < 1 || input.voices.length > 16)
      fail("Es werden 1 bis 16 Stimmen unterstützt.");
    const ids = new Set();
    for (const v of input.voices) {
      keys(v, ["id", "name", "short", "clef", "displayOctave", "comment"], "Stimme");
      text(v, "short", "Stimme", 12);
      text(v, "comment", "Stimme");
      if (
        !v ||
        typeof v.id !== "string" ||
        !/^[a-zA-Z][a-zA-Z0-9_-]{0,39}$/.test(v.id) ||
        ids.has(v.id)
      )
        fail("Jede Stimme benötigt eine eindeutige ID aus Buchstaben, Ziffern, _ oder -.");
      ids.add(v.id);
      if (typeof v.name !== "string" || !v.name || v.name.length > 80)
        fail(`Stimme ${v.id}: Name fehlt oder ist zu lang.`);
      if (!["treble", "bass", "alto", "tenor"].includes(v.clef))
        fail(`Stimme ${v.id}: unbekannter Schlüssel.`);
      if (
        v.displayOctave !== undefined &&
        (!Number.isInteger(v.displayOctave) || Math.abs(v.displayOctave) > 2)
      )
        fail("displayOctave muss zwischen -2 und 2 liegen.");
    }
    const verseIds = new Set();
    if (input.verses !== undefined) {
      if (!Array.isArray(input.verses) || input.verses.length < 2 || input.verses.length > 20)
        fail("verses muss 2 bis 20 Strophen enthalten.");
      for (const [i, v] of input.verses.entries()) {
        keys(v, ["id", "name"], `Strophe ${i + 1}`);
        if (typeof v.id !== "string" || !v.id || v.id.length > 20 || verseIds.has(v.id))
          fail(`Strophe ${i + 1}: eindeutige ID mit höchstens 20 Zeichen erforderlich.`);
        verseIds.add(v.id);
        if (typeof v.name !== "string" || !v.name.trim() || v.name.length > 80)
          fail(`Strophe ${i + 1}: Name fehlt oder ist länger als 80 Zeichen.`);
      }
    }
    const verseCount = verseIds.size;
    // voices/verses lists of dynamics: unique known IDs, at least one.
    const idList = (list, known, loc, what) => {
      if (
        !Array.isArray(list) ||
        !list.length ||
        new Set(list).size !== list.length ||
        !list.every((id) => known.has(id))
      )
        fail(`${loc}: ${what} muss eine Liste eindeutiger, bekannter IDs sein.`);
    };
    const hairpins = [];
    let offset = 0;
    if (!Array.isArray(input.sections) || !input.sections.length || input.sections.length > 100)
      fail("Mindestens ein Abschnitt ist erforderlich.");
    const sections = new Set();
    for (const s of input.sections) {
      keys(s, ["id", "name", "comment", "unison", "repeatFrom"], "Abschnitt");
      text(s, "comment", "Abschnitt");
      if (
        !s ||
        typeof s.id !== "string" ||
        !s.id ||
        sections.has(s.id) ||
        typeof s.name !== "string" ||
        !s.name
      )
        fail("Abschnitte brauchen eindeutige IDs und Namen.");
      sections.add(s.id);
      if (s.unison !== undefined) {
        if (!s.unison || typeof s.unison !== "object" || Array.isArray(s.unison))
          fail("unison muss eine Zuordnung von Stimmen sein.");
        for (const [from, to] of Object.entries(s.unison)) {
          if (!ids.has(from) || !ids.has(to) || from === to || Object.hasOwn(s.unison, to))
            fail("Ungültige Zuordnung einer gemeinsamen Stimme.");
        }
      }
    }
    const sectionOrder = new Set();
    let lastSection = null;
    if (!Array.isArray(input.measures) || !input.measures.length || input.measures.length > 1000)
      fail("Es werden 1 bis 1000 Takte unterstützt.");
    let count = 0;
    const measureIds = new Set();
    for (const [i, m] of input.measures.entries()) {
      const loc = `Takt ${i + 1}`;
      keys(
        m,
        [
          "id",
          "number",
          "section",
          "meter",
          "keyFifths",
          "lengthTicks",
          "voices",
          "voiceLabels",
          "comment",
          "barlines",
          "dynamics",
          "directions",
        ],
        loc,
      );
      text(m, "number", loc, 20);
      text(m, "comment", loc);
      if (m.section !== lastSection) {
        if (sectionOrder.has(m.section))
          fail(
            `${loc}: Abschnitte müssen zusammenhängend sein. Für Wiederholungen bitte neue Abschnitts-IDs vergeben.`,
          );
        sectionOrder.add(m.section);
        lastSection = m.section;
      }
      if (!m || typeof m.id !== "string" || !m.id || measureIds.has(m.id))
        fail(`${loc}: eindeutige Takt-ID fehlt.`);
      measureIds.add(m.id);
      if (!sections.has(m.section)) fail(`${loc}: unbekannter Abschnitt.`);
      if (
        !Array.isArray(m.meter) ||
        m.meter.length !== 2 ||
        !Number.isInteger(m.meter[0]) ||
        m.meter[0] < 1 ||
        m.meter[0] > 32 ||
        ![1, 2, 4, 8, 16, 32].includes(m.meter[1])
      )
        fail(`${loc}: ungültige Taktart.`);
      if (!Number.isInteger(m.keyFifths) || Math.abs(m.keyFifths) > 7)
        fail(`${loc}: keyFifths muss zwischen -7 und 7 liegen.`);
      const full = (input.ppq * m.meter[0] * 4) / m.meter[1];
      const len = m.lengthTicks ?? full;
      if (!Number.isInteger(len) || len <= 0 || len > full)
        fail(`${loc}: lengthTicks muss positiv und höchstens ein voller Takt sein.`);
      if (m.barlines !== undefined) {
        if (!Array.isArray(m.barlines) || m.barlines.length > 32)
          fail(`${loc}: ungültige Taktstriche.`);
        for (const b of m.barlines) {
          keys(b, ["at", "kind"], loc);
          if (
            !Number.isInteger(b.at) ||
            b.at < 0 ||
            b.at > len ||
            !["double", "final", "repeatStart", "repeatEnd"].includes(b.kind)
          )
            fail(`${loc}: ungültiges Wiederholungszeichen.`);
        }
      }
      if (m.dynamics !== undefined) {
        if (!Array.isArray(m.dynamics) || m.dynamics.length > 32)
          fail(`${loc}: dynamics muss eine Liste mit höchstens 32 Angaben sein.`);
        for (const d of m.dynamics) {
          keys(d, ["at", "mark", "duration", "voices", "verses"], `${loc}, Dynamik`);
          if (!Number.isInteger(d.at) || d.at < 0 || d.at >= len)
            fail(
              `${loc}: Dynamik braucht eine Position at innerhalb des Takts (0 bis ${len - 1}).`,
            );
          if (![...MARKS, ...HAIRPINS].includes(d.mark))
            fail(
              `${loc}: unbekanntes Dynamikzeichen „${d.mark}“. Erlaubt: ${[...MARKS, ...HAIRPINS].join(", ")}.`,
            );
          if (HAIRPINS.includes(d.mark)) {
            if (!Number.isInteger(d.duration) || d.duration <= 0)
              fail(`${loc}: ${d.mark} braucht eine positive ganzzahlige duration in Ticks.`);
            hairpins.push({ loc, end: offset + d.at + d.duration });
          } else if (d.duration !== undefined)
            fail(`${loc}: duration ist nur bei cresc und dim erlaubt.`);
          if (d.voices !== undefined) idList(d.voices, ids, `${loc}, Dynamik`, "voices");
          if (d.verses !== undefined) {
            if (!verseCount) fail(`${loc}: Dynamik mit verses setzt Strophen (verses) voraus.`);
            idList(d.verses, verseIds, `${loc}, Dynamik`, "verses");
          }
        }
      }
      if (m.directions !== undefined) {
        if (!Array.isArray(m.directions) || m.directions.length > 16)
          fail(`${loc}: directions muss eine Liste mit höchstens 16 Angaben sein.`);
        for (const d of m.directions) {
          keys(d, ["at", "text"], `${loc}, Vortragsangabe`);
          if (!Number.isInteger(d.at) || d.at < 0 || d.at >= len)
            fail(`${loc}: Vortragsangabe braucht eine Position at innerhalb des Takts.`);
          if (typeof d.text !== "string" || !d.text.trim() || d.text.length > 80)
            fail(`${loc}: Vortragsangabe braucht einen Text mit höchstens 80 Zeichen.`);
        }
      }
      offset += len;
      if (!m.voices || typeof m.voices !== "object" || Array.isArray(m.voices))
        fail(`${loc}: voices fehlt.`);
      if (m.voiceLabels !== undefined) {
        if (!m.voiceLabels || typeof m.voiceLabels !== "object" || Array.isArray(m.voiceLabels))
          fail(`${loc}: voiceLabels muss ein Objekt sein.`);
        for (const [id, label] of Object.entries(m.voiceLabels))
          if (!ids.has(id) || typeof label !== "string" || label.length > 80)
            fail(`${loc}: ungültige Stimmenbeschriftung.`);
      }
      const unison = input.sections.find((s) => s.id === m.section)?.unison || {};
      for (const [from, to] of Object.entries(unison))
        if (Object.hasOwn(m.voices, from) || !Object.hasOwn(m.voices, to))
          fail(
            `${loc}: Die gemeinsame Stimme ${to} muss vorhanden sein, ${from} darf nicht doppelt vorkommen.`,
          );
      for (const [id, events] of Object.entries(m.voices)) {
        if (!ids.has(id)) fail(`${loc}: unbekannte Stimme ${id}.`);
        if (!Array.isArray(events)) fail(`${loc}, ${id}: Noten müssen eine Liste sein.`);
        let end = 0;
        for (const n of events) {
          keys(
            n,
            ["at", "duration", "pitch", "lyric", "tie", "fermata", "confidence", "comment"],
            `${loc}, ${id}`,
          );
          text(n, "comment", loc);
          if (
            !n ||
            !Number.isInteger(n.at) ||
            n.at < end ||
            !Number.isInteger(n.duration) ||
            n.duration <= 0 ||
            n.at + n.duration > len
          )
            fail(
              `${loc}, ${id}: überlappende Noten, ungültige Dauer oder Taktgrenze überschritten.`,
            );
          if (n.pitch !== null && typeof n.pitch !== "string")
            fail(`${loc}, ${id}: pitch muss ein Tonname oder null sein.`);
          midi(n.pitch);
          end = n.at + n.duration;
          count++;
          if (n.fermata !== undefined && typeof n.fermata !== "boolean")
            fail(`${loc}: fermata muss true oder false sein.`);
          if (n.tie !== undefined && typeof n.tie !== "boolean")
            fail(`${loc}: tie muss true oder false sein.`);
          if (n.tie && n.pitch === null) fail(`${loc}: Eine Pause kann nicht gebunden werden.`);
          if (Array.isArray(n.lyric)) {
            if (!verseCount) fail(`${loc}, ${id}: lyric als Liste setzt Strophen (verses) voraus.`);
            if (n.lyric.length !== verseCount)
              fail(
                `${loc}, ${id}: lyric braucht genau ${verseCount} Einträge, einen je Strophe (null für keine Silbe).`,
              );
            if (!n.lyric.every((t) => t === null || (typeof t === "string" && t.length <= 150)))
              fail(`${loc}, ${id}: Jeder Strophentext muss ein kurzer Text oder null sein.`);
          } else if (n.lyric !== undefined && (typeof n.lyric !== "string" || n.lyric.length > 150))
            fail(`${loc}: lyric muss ein kurzer Text sein.`);
          if (n.confidence !== undefined && !["clear", "uncertain"].includes(n.confidence))
            fail(`${loc}: confidence muss clear oder uncertain sein.`);
        }
      }
    }
    if (sectionOrder.size !== sections.size)
      fail("Jeder Abschnitt muss mindestens einen Takt enthalten.");
    for (const h of hairpins)
      if (h.end > offset)
        fail(`${h.loc}: Die Gabel (cresc/dim) reicht über das Ende der Partitur.`);
    if (count > 50000) fail("Die Datei enthält zu viele Noten.");
    for (const s of input.sections) {
      if (s.repeatFrom !== undefined) {
        keys(s.repeatFrom, ["measure", "tick"], "Wiederholung");
        const m = input.measures.find((m) => m.id === s.repeatFrom.measure);
        if (
          !m ||
          m.section !== s.id ||
          !Number.isInteger(s.repeatFrom.tick) ||
          s.repeatFrom.tick < 0 ||
          s.repeatFrom.tick >= (m.lengthTicks ?? (input.ppq * m.meter[0] * 4) / m.meter[1])
        )
          fail("Ungültiger Beginn der Abschnittswiederholung.");
      }
    }
    // A tie always extends to the immediately following same-pitch event, including a barline.
    for (const v of input.voices) {
      keys(v, ["id", "name", "short", "clef", "displayOctave", "comment"], "Stimme");
      text(v, "short", "Stimme", 12);
      text(v, "comment", "Stimme");
      let prev = null;
      let offset = 0;
      for (const m of input.measures) {
        for (const n of m.voices[v.id] || []) {
          const start = offset + n.at;
          if (prev?.tie && (prev.end !== start || prev.pitch !== n.pitch))
            fail(
              `Ungültiger Haltebogen in ${v.name}: Folgeton muss unmittelbar anschließen und gleich sein.`,
            );
          prev = { tie: n.tie, pitch: n.pitch, end: start + n.duration };
        }
        offset += m.lengthTicks ?? (input.ppq * m.meter[0] * 4) / m.meter[1];
      }
      if (prev?.tie) fail(`Offener Haltebogen am Ende von ${v.name}.`);
    }
    validateLayout(input.layout, input);
    return structuredClone(input);
  }
  function compileScore(score) {
    let tick = 0;
    const measures = score.measures.map((m, index) => {
      const length = m.lengthTicks ?? (score.ppq * m.meter[0] * 4) / m.meter[1];
      const a = {
        ...m,
        number: m.number ?? String(index + 1),
        index,
        start: tick,
        end: tick + length,
        length,
      };
      tick += length;
      return a;
    });
    const events = [];
    const byVoice = {};
    for (const v of score.voices) {
      const list = [];
      for (const m of measures)
        for (const [i, n] of (m.voices[v.id] || []).entries())
          list.push({
            ...n,
            voice: v.id,
            id: `${m.index}:${v.id}:${i}`,
            measureIndex: m.index,
            start: m.start + n.at,
            end: m.start + n.at + n.duration,
            midi: midi(n.pitch),
          });
      byVoice[v.id] = list;
      for (let i = 0; i < list.length; i++) {
        const n = list[i];
        if (n.midi === null) continue;
        let end = n.end;
        let j = i;
        const ids = [n.id];
        while (
          list[j]?.tie &&
          list[j + 1] &&
          list[j + 1].start === end &&
          list[j + 1].pitch === n.pitch
        ) {
          j++;
          end = list[j].end;
          ids.push(list[j].id);
        }
        events.push({ ...n, end, duration: end - n.start, noteIds: ids });
        i = j;
      }
    }
    events.sort((a, b) => a.start - b.start);
    // Dynamics and directions on the absolute timeline; verse-specific marks keep their IDs.
    const dynamics = measures
      .flatMap((m) =>
        (m.dynamics || []).map((d, i) => ({
          ...d,
          id: `${m.index}:d${i}`,
          measureIndex: m.index,
          tick: m.start + d.at,
          end: m.start + d.at + (d.duration || 0),
        })),
      )
      .sort((a, b) => a.tick - b.tick);
    const directions = measures.flatMap((m) =>
      (m.directions || [])
        .map((d) => ({ ...d, measureIndex: m.index, tick: m.start + d.at }))
        .sort((a, b) => a.at - b.at),
    );
    return {
      score,
      measures,
      events,
      byVoice,
      total: tick,
      verses: score.verses || [],
      dynamics,
      directions,
    };
  }
  // Syllable of a note in one verse (index into score.verses). A plain string applies to every
  // verse; null means no syllable in that verse.
  function lyricFor(note, verseIndex = 0) {
    if (Array.isArray(note?.lyric)) return note.lyric[verseIndex] ?? null;
    return note?.lyric || null;
  }
  // All distinct texts of a note, e.g. for spacing.
  function lyricTexts(note) {
    if (Array.isArray(note?.lyric)) return note.lyric.filter(Boolean);
    return note?.lyric ? [note.lyric] : [];
  }
  function cueNotes(compiled, tick, voiceIds, end = compiled.total, mode = "next") {
    if (mode === "onset")
      return voiceIds.flatMap((id) =>
        compiled.events
          .filter((n) => n.voice === id && Math.abs(n.start - tick) < 0.01 && n.start < end)
          .map((n) => ({ ...n, delayed: false })),
      );
    return voiceIds
      .map((id) => {
        const sounding = compiled.events.find(
          (n) => n.voice === id && n.start <= tick && n.end > tick,
        );
        const next =
          sounding ||
          compiled.events.find((n) => n.voice === id && n.start >= tick && n.start < end);
        return next ? { ...next, delayed: next.start > tick } : null;
      })
      .filter(Boolean);
  }
  function estimateTempo(taps, stepQuarters, fallback) {
    const intervals = taps
      .slice(1)
      .map((t, i) => t - taps[i])
      .filter((t) => t >= 80 && t <= 3000);
    if (!intervals.length) return fallback;
    const sorted = intervals.slice(-6).sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
    return Math.max(20, Math.min(300, (60000 * stepQuarters) / median));
  }
  function inRangeTick(value, start, end) {
    return Math.min(end, Math.max(start, value));
  }

  function voiceMix(score, measure, selected, mode, backing, selectedGain = 1) {
    const unison = score.sections.find((s) => s.id === measure.section)?.unison || {};
    const picked = new Set(
      [...selected].map((id) => (Object.hasOwn(unison, id) ? unison[id] : id)),
    );
    return Object.fromEntries(
      score.voices.map((v) => [
        v.id,
        mode === "sing"
          ? picked.has(v.id)
            ? selectedGain
            : backing
          : mode === "all" || picked.has(v.id)
            ? 1
            : mode === "focus"
              ? backing
              : 0,
      ]),
    );
  }

  // Smooth in beat duration (not frequency) and limit any single update. Eighth-note
  // taps adapt at the same rate per musical beat as quarter-note taps.
  function smoothTempo(target, current, stepQuarters = 1) {
    if (!Number.isFinite(target) || target <= 0) return current;
    if (!Number.isFinite(current) || current <= 0) return target;
    const alpha = 1 - Math.pow(0.65, stepQuarters);
    const period = 60 / current + alpha * (60 / target - 60 / current);
    const limit = 0.1 * stepQuarters;
    return Math.max(
      20,
      Math.min(300, Math.max(current * (1 - limit), Math.min(current * (1 + limit), 60 / period))),
    );
  }

  return {
    FORMAT,
    midi,
    noteName,
    validateScore,
    compileScore,
    lyricFor,
    lyricTexts,
    cueNotes,
    estimateTempo,
    inRangeTick,
    voiceMix,
    smoothTempo,
  };
})();
