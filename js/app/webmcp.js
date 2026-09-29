"use strict";
// Optionale Browser-Agent-Schnittstelle (document.modelContext), nutzt dieselben Aktionen wie die
// UI.
// Optional browser-agent interface. Uses exactly the same app actions as the visible controls.
function registerTools() {
  const context = document.modelContext;
  if (!context?.registerTool) return;
  const lifecycle = new AbortController();
  window.addEventListener("pagehide", () => lifecycle.abort(), { once: true });
  const safeRegister = (tool) => {
    try {
      Promise.resolve(context.registerTool(tool, { signal: lifecycle.signal })).catch(() => {});
    } catch {}
  };
  safeRegister({
    name: "read_choir_practice",
    description: "Read the current choir score and practice settings.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: true },
    execute: () => ({
      title: score.title,
      voices: score.voices,
      sections: score.sections,
      section,
      mode: mixMode,
      selected: [...selected],
      tempo: bpm,
      measure: measureAt(cursor).number,
      playing,
      playback,
      rehearsalMode,
      displayMode,
      independentDisplay,
      displaySelected: [...displaySelected],
      practiceRange: range,
      verses: score.verses || [],
      verseChoice,
      currentVerse: currentVerse()?.id ?? null,
      playDynamics,
    }),
  });
  safeRegister({
    name: "configure_choir_practice",
    description: "Set the section, selected voices, practice mix and tempo without starting audio.",
    inputSchema: {
      type: "object",
      properties: {
        section: { type: "string" },
        voices: { type: "array", items: { type: "string" } },
        mix: { enum: ["all", "solo", "focus"] },
        tempo: { type: "number", minimum: 20, maximum: 300 },
      },
      additionalProperties: false,
    },
    annotations: { readOnlyHint: false },
    execute: (input) => {
      if (!input || typeof input !== "object" || Array.isArray(input))
        throw new Error("An object is required.");
      if (Object.keys(input).some((k) => !["section", "voices", "mix", "tempo"].includes(k)))
        throw new Error("Unknown parameter.");
      if (
        input.section !== undefined &&
        input.section !== "all" &&
        !score.sections.some((s) => s.id === input.section)
      )
        throw new Error("Unknown section.");
      if (
        input.voices !== undefined &&
        (!Array.isArray(input.voices) ||
          input.voices.some((v) => !score.voices.some((s) => s.id === v)))
      )
        throw new Error("Unknown voice.");
      if (input.mix !== undefined && !["all", "solo", "focus"].includes(input.mix))
        throw new Error("Unknown mix.");
      if (
        input.tempo !== undefined &&
        (!Number.isFinite(input.tempo) || input.tempo < 20 || input.tempo > 300)
      )
        throw new Error("Invalid tempo.");
      stop();
      if (input.section !== undefined) setSection(input.section);
      if (input.voices !== undefined) selected = new Set(input.voices);
      if (input.mix !== undefined) mixMode = input.mix;
      if (input.tempo !== undefined) {
        bpm = input.tempo;
        $("bpm").value = String(bpm);
      }
      practiceSelectionChanged();
      return { section, voices: [...selected], mix: mixMode, tempo: bpm, playing: false };
    },
  });
}
