"use strict";
// Tastatur: Leertaste für Start/Pause bzw. Tipp, Escape zum Abbrechen (Zustand: spaceHandled).
// Globale Tastenkürzel (Capture-Phase, damit fokussierte Schaltflächen nicht doppelt auslösen).
function bindKeyboard() {
  document.addEventListener(
    "keydown",
    (e) => {
      if (e.key === "Escape") {
        if (rangePicking) {
          cancelRangePick();
          return;
        }
        if (!$("rangeMenu").hidden) {
          hideRangeMenu();
          if (compiled) stop();
          return;
        }
        if (cueOpen) {
          closeCues();
          return;
        }
        if (compiled) stop();
        return;
      }
      if (!spaceIsPlayback(e, !!document.querySelector("dialog[open]"))) return;
      if (rangePicking && !rangeAnchor) {
        e.preventDefault();
        toast("Wähle zuerst den Anfang des Übebereichs.");
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      spaceHandled = true;
      if (!e.repeat) togglePlayback();
    },
    true,
  );
  document.addEventListener(
    "keyup",
    (e) => {
      if ((e.code === "Space" || e.key === " ") && spaceHandled) {
        e.preventDefault();
        e.stopPropagation();
        spaceHandled = false;
      }
    },
    true,
  );
}
