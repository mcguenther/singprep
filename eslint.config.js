// ESLint (flat config) ohne npm-Abhängigkeiten. Die Controller-Dateien in js/app/ sind klassische
// Skripte mit gemeinsamem Top-Level-Scope; ihre gegenseitig genutzten Namen werden hier ermittelt.
import { readFileSync, readdirSync } from "node:fs";

const browser = Object.fromEntries(
  [
    "window",
    "document",
    "navigator",
    "localStorage",
    "performance",
    "console",
    "matchMedia",
    "requestAnimationFrame",
    "cancelAnimationFrame",
    "setTimeout",
    "clearTimeout",
    "setInterval",
    "clearInterval",
    "structuredClone",
    "ResizeObserver",
    "AbortController",
    "Blob",
    "URL",
    "Image",
    "AudioContext",
    "OfflineAudioContext",
    "PeriodicWave",
    "globalThis",
  ].map((name) => [name, "readonly"]),
);
const node = Object.fromEntries(
  ["process", "console", "Buffer", "URL", "structuredClone", "globalThis"].map((n) => [
    n,
    "readonly",
  ]),
);

// Top-Level-Deklarationen einer mit Prettier formatierten Datei (function, let, const).
function topLevelNames(file) {
  const names = [];
  let continuing = false;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const fn = /^(?:async )?function ([\w$]+)/.exec(line);
    const decl = /^(?:let|const) ([\w$]+)/.exec(line);
    const destructured = /^(?:let|const) \{([^}]*)\}/.exec(line);
    if (fn) names.push(fn[1]);
    if (decl) names.push(decl[1]);
    if (destructured)
      names.push(
        ...destructured[1]
          .split(",")
          .map((n) => n.trim())
          .filter(Boolean),
      );
    if (/^(?:let|const) /.test(line)) continuing = !line.trimEnd().endsWith(";");
    else if (continuing) {
      if (!line.startsWith(" ")) continuing = false;
      else {
        const part = /^ {2}([\w$]+)(?: =|,|;|$)/.exec(line);
        if (part) names.push(part[1]);
        if (/^ {2}\S.*;$/.test(line) || /^\} = /.test(line)) continuing = false;
      }
    }
    if (/^\} = /.test(line)) continuing = false;
  }
  return names;
}
const appDir = "js/app";
const appFiles = readdirSync(appDir).filter((f) => f.endsWith(".js"));
const declared = Object.fromEntries(appFiles.map((f) => [f, topLevelNames(`${appDir}/${f}`)]));

const rules = {
  "no-undef": "error",
  "no-unused-vars": ["error", { vars: "local", args: "none", caughtErrors: "none" }],
  "no-redeclare": "error",
  "no-dupe-keys": "error",
  "no-dupe-args": "error",
  "no-duplicate-case": "error",
  "no-unreachable": "error",
  "no-const-assign": "error",
  "no-func-assign": "error",
  "no-self-assign": "error",
  "no-shadow-restricted-names": "error",
  "no-unsafe-finally": "error",
  "no-cond-assign": ["error", "except-parens"],
  "use-isnan": "error",
  "valid-typeof": "error",
};

export default [
  { ignores: ["dist/", "local/", "node_modules/"] },
  {
    files: ["js/**/*.js", "scores/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "script",
      globals: { ...browser, Chorprobe: "readonly" },
    },
    rules,
  },
  ...appFiles.map((f) => ({
    files: [`${appDir}/${f}`],
    languageOptions: {
      globals: Object.fromEntries(
        appFiles
          .filter((other) => other !== f)
          .flatMap((other) => declared[other])
          .map((name) => [name, "writable"]),
      ),
    },
  })),
  {
    files: ["tests/**/*.js", "tools/**/*.mjs", "eslint.config.js"],
    languageOptions: { ecmaVersion: "latest", sourceType: "module", globals: node },
    rules,
  },
];
