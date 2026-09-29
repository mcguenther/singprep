// Lädt die browserseitigen Skripte in Node (globalThis.Chorprobe), ohne DOM.
import { readFileSync, readdirSync } from "node:fs";
import { runInThisContext } from "node:vm";
import { fileURLToPath } from "node:url";

export const root = fileURLToPath(new URL("../../", import.meta.url));
export const LIBS = ["original", "dynamics", "score", "practice", "glyphs", "render", "audio"];

export function loadFile(relative) {
  runInThisContext(readFileSync(root + relative, "utf8"), { filename: relative });
}

// Frischer Namensraum mit allen Bibliotheken aus js/lib/.
export function loadChorprobe() {
  delete globalThis.Chorprobe;
  loadFile("js/core.js");
  for (const name of LIBS) loadFile(`js/lib/${name}.js`);
  return globalThis.Chorprobe;
}

export function scoreFiles() {
  return readdirSync(root + "scores")
    .filter((f) => f.endsWith(".js"))
    .sort();
}

export function readJson(relative) {
  return JSON.parse(readFileSync(root + relative, "utf8"));
}
