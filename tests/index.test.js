// index.html bindet alle Stylesheets und Skripte in der verbindlichen Reihenfolge ein.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { root, LIBS } from "./support/load.js";

const html = readFileSync(root + "index.html", "utf8");
const refs = (attr) => [...html.matchAll(new RegExp(`${attr}="([^"]+)"`, "g"))].map((m) => m[1]);

test("alle CSS-Dateien in Namensreihenfolge", () => {
  const css = readdirSync(root + "css")
    .filter((f) => f.endsWith(".css"))
    .sort();
  assert.deepEqual(
    refs("href").filter((h) => h.startsWith("css/")),
    css.map((f) => `css/${f}`),
  );
});

test("Skriptreihenfolge: core, lib, Lieder, local, app, main zuletzt", () => {
  const scripts = refs("src");
  const pos = (s) => scripts.indexOf(s);
  assert.equal(scripts[0], "js/core.js");
  assert.deepEqual(
    scripts.slice(1, 1 + LIBS.length),
    LIBS.map((n) => `js/lib/${n}.js`),
  );
  const app = readdirSync(root + "js/app").filter((f) => f.endsWith(".js"));
  for (const f of app) assert.ok(pos(`js/app/${f}`) > pos("local/scores.js"), f);
  assert.equal(scripts.at(-1), "js/app/main.js");
  assert.equal(pos("js/app/state.js"), pos("local/scores.js") + 1);
  for (const s of scripts.filter((s) => s.startsWith("scores/")))
    assert.ok(pos(s) < pos("local/scores.js"), s);
});

test("Downloads im Hilfedialog zeigen auf vorhandene Dateien", () => {
  for (const href of [
    "docs/datenformat.md",
    "docs/score.schema.json",
    "docs/beispiel.json",
    "assets/Bravura-LICENSE.txt",
  ]) {
    assert.ok(html.includes(`href="${href}"`), href);
    readFileSync(root + href);
  }
});
