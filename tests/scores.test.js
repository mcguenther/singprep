// Jede Datei in scores/ muss genau ein gültiges Lied anmelden; zwischen den Klammern steht reines JSON.
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { loadChorprobe, loadFile, scoreFiles, root } from "./support/load.js";

describe("scores/", () => {
  const files = scoreFiles();
  test("enthält mindestens ein Lied", () => assert.ok(files.length > 0));
  for (const file of files)
    test(file, () => {
      const Chorprobe = loadChorprobe();
      loadFile(`scores/${file}`);
      assert.equal(Chorprobe.scores.length, 1, "genau ein registerScore-Aufruf");
      const data = Chorprobe.scores[0];
      const checked = Chorprobe.score.validateScore(data);
      const compiled = Chorprobe.score.compileScore(checked);
      assert.ok(compiled.total > 0);
      assert.ok(compiled.events.length > 0);
      const text = readFileSync(`${root}scores/${file}`, "utf8");
      const start = text.indexOf("Chorprobe.registerScore(") + "Chorprobe.registerScore(".length;
      const end = text.lastIndexOf(");");
      assert.deepEqual(JSON.parse(text.slice(start, end)), data, "Inhalt ist reines JSON");
    });
});
