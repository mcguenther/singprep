"use strict";
// Gemeinsamer Namensraum. Bibliotheken hängen sich als Chorprobe.<name> an,
// Lieder melden sich mit Chorprobe.registerScore({...}) an (siehe scores/).
globalThis.Chorprobe = {
  // Angemeldete Lieder in Ladereihenfolge. Das zuletzt angemeldete wird beim Start geöffnet.
  scores: [],
  registerScore(data) {
    globalThis.Chorprobe.scores.push(data);
    return data;
  },
};
