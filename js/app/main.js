"use strict";
// Start: gespeicherte Einstellungen, Ereignisse binden, erstes Lied öffnen. Wird als letztes Skript
// geladen.
try {
  const saved = localStorage.getItem("chorprobe.sound.v1");
  if (Object.hasOwn(VOICE_SOUNDS, saved)) audio.sound = saved;
} catch {}
bindRangeControls();
bindTransport();
bindDialogs();
bindCues();
bindSongControls();
bindMixControls();
bindLayoutControls();
bindKeyboard();
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    if (compiled) {
      renderScore();
      if (range && !rangeAnchor && !$("rangeMenu").hidden && window.innerWidth <= 600)
        updateRangeMenu(null, true);
    }
  }, 180);
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden && compiled) stop();
});
new ResizeObserver((entries) => {
  document.documentElement.style.setProperty(
    "--transport-height",
    `${entries[0].target.getBoundingClientRect().height}px`,
  );
}).observe(document.querySelector(".transport"));
// Das zuletzt angemeldete Lied wird geöffnet; so ersetzt local/scores.js die mitgelieferten Lieder.
try {
  if (!Chorprobe.scores.length)
    throw new Error("Kein Lied gefunden. Öffne eine Partitur über „Lied laden“.");
  if (loadGeneration === 0) openSong(String(Chorprobe.scores.length - 1));
  registerTools();
} catch (e) {
  renderSongPicker();
  $("score").replaceChildren(escText("p", e.message, "loading"));
  toast(e.message);
}
