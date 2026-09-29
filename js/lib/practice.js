"use strict";
// Übe-Helfer ohne DOM: Lautstärkekurve, Spaltenzahl, Mitlaufen, Leertaste und Gruppierung der
// Notensysteme.
Chorprobe.practice = (function () {
  // UI-independent rehearsal settings and viewport calculations.
  function backingGain(percent) {
    const amount = Math.max(0, Math.min(100, Number(percent) || 0)) / 100;
    return Math.pow(amount, Math.log2(10)); // 50% on the control = 0.1 amplitude.
  }
  function measureColumns(width, setting = "auto", mobile = width <= 840) {
    const fit = width >= 1440 ? 6 : width >= 1180 ? 5 : width >= 920 ? 4 : width >= 640 ? 3 : 2;
    return setting === "auto" ? fit : Math.max(1, Math.min(mobile ? 3 : 6, Number(setting) || fit));
  }
  function followDelta(rect, top, bottom) {
    if (bottom <= top) return 0;
    const height = rect.bottom - rect.top,
      available = bottom - top;
    if (height > available) return Math.abs(rect.top - top) > 3 ? rect.top - top : 0;
    return rect.top < top || rect.bottom > bottom ? rect.top - top : 0;
  }
  function spaceIsPlayback(event, dialogOpen) {
    if (dialogOpen || event.altKey || event.ctrlKey || event.metaKey || event.isComposing)
      return false;
    if (event.code !== "Space" && event.key !== " ") return false;
    return !event.target?.closest?.(
      'input,textarea,select,[contenteditable]:not([contenteditable="false"]),[role="textbox"]',
    );
  }
  function visibleVoiceGroups(score, measure, selection, mode) {
    const aliases = score.sections.find((s) => s.id === measure.section)?.unison || {};
    const chosen = new Set([...selection].map((id) => aliases[id] || id));
    const active = score.voices.filter((v) => Object.hasOwn(measure.voices, v.id));
    return {
      separate: mode === "all" ? active : active.filter((v) => chosen.has(v.id)),
      combined: mode === "compact" ? active.filter((v) => !chosen.has(v.id)) : [],
    };
  }

  function compactStaffWidth(measure, visibleWidth) {
    const times = new Set([
      0,
      measure.length,
      ...Object.values(measure.voices).flatMap((notes) => notes.map((n) => n.at)),
    ]);
    return Math.max(200, visibleWidth, 50 + (times.size - 1) * 20);
  }
  function displayRows(score, groups) {
    const rows = groups.separate.map((v) => ({
      kind: "voice",
      voices: [v],
      order: score.voices.indexOf(v),
    }));
    if (groups.combined.length) {
      const positions = groups.combined.map((v) => score.voices.indexOf(v)).sort((a, b) => a - b);
      const mid = (positions.length - 1) / 2;
      rows.push({
        kind: "chord",
        voices: groups.combined,
        order: (positions[Math.floor(mid)] + positions[Math.ceil(mid)]) / 2,
      });
    }
    return rows.sort((a, b) => a.order - b.order);
  }
  function groupScoreSystems(measures, columns, score, selection, mode) {
    const systems = [];
    let current = null,
      lastSignature = "";
    for (const m of measures) {
      const voices = visibleVoiceGroups(score, m, selection, mode);
      const signature = JSON.stringify([
        m.section,
        voices.separate.map((v) => v.id),
        voices.combined.map((v) => v.id),
      ]);
      if (!current || current.measures.length >= columns || signature !== lastSignature) {
        current = { measures: [], voices };
        systems.push(current);
        lastSignature = signature;
      }
      current.measures.push(m);
    }
    return systems;
  }

  return {
    backingGain,
    measureColumns,
    followDelta,
    spaceIsPlayback,
    visibleVoiceGroups,
    compactStaffWidth,
    displayRows,
    groupScoreSystems,
  };
})();
