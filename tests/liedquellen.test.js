// Hörproben der Liedquellen-Recherche (docs/liedquellen/): jede Lieddatei ist ein gültiges
// chorprobe/v1-Lied und in lieder.json eingetragen.
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readdirSync } from "node:fs";
import { loadChorprobe, readJson, root } from "./support/load.js";

describe("docs/liedquellen/", () => {
  const list = readJson("docs/liedquellen/lieder.json");
  const files = readdirSync(root + "docs/liedquellen/lieder").filter((f) => f.endsWith(".json"));
  test("lieder.json nennt genau die vorhandenen Lieddateien", () =>
    assert.deepEqual(list.map((s) => s.file).sort(), files.sort()));
  for (const file of files)
    test(file, () => {
      const { score } = loadChorprobe();
      const data = readJson(`docs/liedquellen/lieder/${file}`);
      const compiled = score.compileScore(score.validateScore(data));
      assert.ok(compiled.score.voices.length >= 3, "mindestens dreistimmig");
      assert.ok(data.source?.description && data.source?.copyright, "Quelle und Rechte angegeben");
    });
});
