"use strict";
// Dialoge: Hilfe/Datenformat und Notenvorlage (Originalfotos).
function showSources() {
  const gallery = $("sourceGallery");
  gallery.replaceChildren();
  for (const page of score.layout?.pages || []) {
    const figure = escText("figure", "", "source-figure");
    const caption = escText("figcaption", page.label);
    figure.append(caption, pageImage(page, `${score.title}, ${page.label}`));
    gallery.append(figure);
  }
  $("sourceDialog").showModal();
}
// Öffnen und Schließen der Dialoge, auch per Klick auf den Hintergrund.
function bindDialogs() {
  $("format").onclick = () => {
    $("helpDialog").showModal();
  };
  $("source").onclick = showSources;
  $("export").onclick = downloadJson;
  document
    .querySelectorAll(".close-dialog")
    .forEach((b) => (b.onclick = () => b.closest("dialog").close()));
  document.querySelectorAll("dialog").forEach((d) => {
    d.addEventListener("click", (e) => {
      if (e.target === d) {
        const r = d.getBoundingClientRect();
        if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom)
          d.close();
      }
    });
  });
}
