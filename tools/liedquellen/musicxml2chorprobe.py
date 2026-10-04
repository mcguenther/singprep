#!/usr/bin/env python3
"""MusicXML/MXL/Humdrum/ABC (alles, was music21 lesen kann) -> chorprobe/v1-JSON.

Aufruf:
  python3 musicxml2chorprobe.py EINGABE AUSGABE.json [meta.json]
  python3 musicxml2chorprobe.py --rezepte rezepte.json

Benötigt music21 (pip install music21). Nur für den Import; die App selbst bleibt ohne Abhängigkeiten.
meta.json (alle Felder optional): title, subtitle, composer, comment, source, tempo, defaultTempo,
copyLyrics (Stimmen-ID, deren Text auf textlose Stimmen übertragen wird), clefs ({"t": ["treble", 1]}),
voiceNames ({"t": "Tenor"}), skipDirections (Textangaben ignorieren), sectionNames ({"a": "Stollen"}), opusIndex (Lied Nr. in einer Sammeldatei), verses (true/false erzwingt Strophen aus den Textzeilen).
Das Ergebnis immer gegen die Vorlage prüfen; validateScore prüft nur die Form.
"""
import copy
import json
import sys
from fractions import Fraction

from music21 import converter, expressions, spanner, dynamics, tempo, clef, chord, note, stream, bar

PPQ = 480
VOICE_IDS = {
    "soprano": ("s", "Sopran"), "sopran": ("s", "Sopran"), "s": ("s", "Sopran"),
    "alto": ("a", "Alt"), "alt": ("a", "Alt"), "a": ("a", "Alt"),
    "tenor": ("t", "Tenor"), "t": ("t", "Tenor"),
    "bass": ("b", "Bass"), "b": ("b", "Bass"), "basso": ("b", "Bass"),
}


def ticks(ql):
    v = Fraction(ql) * PPQ
    if v.denominator != 1:
        raise ValueError(f"Dauer {ql} ergibt keine ganzen Ticks")
    return int(v)


def pitch_name(p):
    name = p.step + (p.accidental.modifier.replace("-", "b") if p.accidental and p.accidental.alter else "")
    return f"{name}{p.octave}"


def clef_of(part):
    c = part.recurse().getElementsByClass(clef.Clef).first()
    if c is None:
        return "treble", 0
    if isinstance(c, clef.BassClef) or (c.sign == "F"):
        return "bass", 0
    if isinstance(c, clef.AltoClef):
        return "alto", 0
    if isinstance(c, clef.TenorClef):
        return "tenor", 0
    if c.sign == "G" and c.octaveChange == -1:
        return "treble", 1
    return "treble", 0


def split_chords(part):
    """Eine Stimme mit Akkorden in mehrere einstimmige Stimmen (oben -> unten) aufteilen."""
    chords = list(part.recurse().getElementsByClass(chord.Chord))
    width = max((len(c.pitches) for c in chords), default=1)
    # Vereinzelte Akkorde (Divisi am Schluss) bleiben eine Stimme; gespielt wird der oberste Ton.
    if width <= 1 or len(chords) < 0.3 * len(part.recurse().notes):
        return [part]
    result = []
    for k in range(width):
        cp = copy.deepcopy(part)
        for c in list(cp.recurse().getElementsByClass(chord.Chord)):
            ps = sorted(c.pitches, key=lambda x: -x.ps)
            pick = ps[min(k, len(ps) - 1)]
            n = note.Note(pick)
            n.duration = c.duration
            n.tie = c.tie
            n.lyrics = c.lyrics
            n.expressions = c.expressions
            site = c.activeSite
            site.replace(c, n)
        result.append(cp)
    return result


def voice_meta(part, index, used):
    name = (part.partName or "").strip()
    key = name.lower().rstrip(".").split()[0] if name else ""
    vid, label = VOICE_IDS.get(key, (None, None))
    roman = name.split()[-1] if name else ""
    if vid and roman in ("I", "II", "1", "2"):
        vid = vid + ("1" if roman in ("I", "1") else "2")
        label = f"{label} {'I' if roman in ('I', '1') else 'II'}"
    if not vid or vid in used:
        vid = f"v{index + 1}"
        label = name or f"Stimme {index + 1}"
    used.add(vid)
    return vid, label


def lyric_text(ly):
    t = (ly.text or "").strip()
    if not t:
        return None
    if ly.syllabic in ("begin", "middle"):
        t += "-"
    return t


def convert(path, meta):
    sc = converter.parse(path)
    if isinstance(sc, stream.Opus):  # z. B. ABC-Datei mit mehreren Liedern
        sc = sc.scores[meta.get("opusIndex", 0)]
    parts = list(sc.parts)
    # Mehrstimmige Systeme (voices) und Akkorde trennen.
    split = []
    for p in parts:
        if any(m.hasVoices() for m in p.getElementsByClass(stream.Measure)):
            sub = p.voicesToParts()
            for i, q in enumerate(sub.parts):
                q.partName = f"{p.partName or 'Stimme'} {'I' * (i + 1) if i < 2 else i + 1}"
                split.append(q)
        else:
            chunks = split_chords(p)
            for i, q in enumerate(chunks):
                if len(chunks) > 1:
                    q.partName = f"{p.partName or 'Stimme'} {'I' * (i + 1) if i < 2 else i + 1}"
                split.append(q)
    parts = split

    # Wiederholungen ausschreiben; pro Takt mitzählen, der wievielte Durchlauf es ist.
    expanded = []
    for p in parts:
        try:
            e = p.expandRepeats()
        except Exception:
            e = p
        expanded.append(e)
    parts = expanded

    used = set()
    voices, vids = [], []
    for i, p in enumerate(parts):
        vid, label = voice_meta(p, i, used)
        c, octv = clef_of(p)
        # Schlüssel überschreibbar, z. B. Tenor im oktavierten Violinschlüssel: {"t": ["treble", 1]}
        c, octv = meta.get("clefs", {}).get(vid, [c, octv])
        v = {"id": vid, "name": meta.get("voiceNames", {}).get(vid, label), "short": vid.upper()[:12], "clef": c}
        if octv:
            v["displayOctave"] = octv
        voices.append(v)
        vids.append(vid)

    # Quellen ohne Taktstriche (manche ABC-Dateien) erst in Takte gliedern.
    parts = [p if p.getElementsByClass(stream.Measure) else p.makeMeasures() for p in parts]
    measure_lists = [list(p.getElementsByClass(stream.Measure)) for p in parts]
    if not min(len(ml) for ml in measure_lists):
        raise ValueError("Keine Takte gefunden.")
    count = min(len(ml) for ml in measure_lists)
    if any(len(ml) != count for ml in measure_lists):
        print("WARNUNG: unterschiedliche Taktanzahl je Stimme", [len(ml) for ml in measure_lists], file=sys.stderr)

    # Durchlauf-Zähler je gedruckter Taktnummer (für Liedtext in Wiederholungen).
    passes = []
    seen = {}
    for m in measure_lists[0][:count]:
        seen[m.number] = seen.get(m.number, 0) + 1
        passes.append(seen[m.number])
    has_repeat = any(x > 1 for x in passes)

    # Übeabschnitte: Ein Rücksprung der Taktnummer beginnt die Wiederholung; sie endet, wenn ein
    # geteilter Takt fortgesetzt wird oder die Nummer über den bisher höchsten Takt hinausgeht.
    numbers_seq = [m.number for m in measure_lists[0][:count]]
    sec_of, sections = [], []
    in_repeat, top = False, None
    letter = 0
    for i, num in enumerate(numbers_seq):
        prev = numbers_seq[i - 1] if i else None
        if i == 0:
            sections.append({"id": "a", "name": "Teil A"})
        elif num < prev:
            sections.append({"id": f"w{letter}", "name": f"Teil {'ABCDEFGH'[letter]} (Wiederholung)"})
            in_repeat = True
        elif in_repeat and (num == prev or num > top):
            letter += 1
            sections.append({"id": "abcdefgh"[letter], "name": f"Teil {'ABCDEFGH'[letter]}"})
            in_repeat = False
        top = num if top is None else max(top, num) if not in_repeat else top
        sec_of.append(sections[-1]["id"])
    if len(sections) == 1:
        sections = [{"id": "lied", "name": "Lied"}]
        sec_of = ["lied"] * len(numbers_seq)
    for k, name in meta.get("sectionNames", {}).items():
        for sec in sections:
            if sec["id"] == k:
                sec["name"] = name

    # Lyric-Nummern einsammeln.
    numbers = set()
    for ml in measure_lists:
        for m in ml[:count]:
            for n in m.recurse().notes:
                for ly in n.lyrics:
                    numbers.add(ly.number or 1)
    numbers = sorted(numbers)
    verse_mode = (not has_repeat) and len(numbers) > 1 and not meta.get("noVerses")
    if meta.get("verses") is not None:
        verse_mode = bool(meta["verses"])
    verses = [{"id": str(k), "name": f"{k}. Strophe"} for k in numbers] if verse_mode else None

    # Slurs je Stimme: id(note) -> start/end
    slur_marks = []
    for p in parts:
        marks = {}
        for sl in p.spannerBundle.getByClass(spanner.Slur):
            sp = sl.getSpannedElements()
            notes_only = [x for x in sp if isinstance(x, (note.Note, chord.Chord))]
            if len(notes_only) >= 2:
                a, b = notes_only[0], notes_only[-1]
                if a is not b:
                    marks.setdefault(id(a), "start")
                    marks[id(b)] = "end" if marks.get(id(b)) != "start" else None
        slur_marks.append(marks)

    ts = [None] * len(parts)
    ks = [0] * len(parts)
    tempo_bpm = meta.get("tempo")
    out_measures = []
    for i in range(count):
        mm = [ml[i] for ml in measure_lists]
        for k, m in enumerate(mm):
            t = m.timeSignature or (m.getContextByClass("TimeSignature") if ts[k] is None else None)
            if t is not None:
                ts[k] = t
            kk = m.keySignature or (m.getContextByClass("KeySignature") if i == 0 else None)
            if kk is not None:
                ks[k] = kk.sharps
            if tempo_bpm is None:
                for mmk in m.recurse().getElementsByClass(tempo.MetronomeMark):
                    if mmk.number:
                        tempo_bpm = round(mmk.getQuarterBPM())
        t0 = ts[0]
        meter = [t0.numerator, t0.denominator]
        full = ticks(t0.barDuration.quarterLength)
        content = 0
        mvoices = {}
        dyns, dirs = [], []
        for k, m in enumerate(mm):
            evs = []
            flat = m.flatten().notesAndRests
            for n in flat:
                if n.duration.isGrace or n.quarterLength == 0:
                    continue
                at = ticks(n.offset)
                du = ticks(n.quarterLength)
                ev = {"at": at, "duration": du, "pitch": None}
                if isinstance(n, note.Note):
                    ev["pitch"] = pitch_name(n.pitch)
                elif isinstance(n, chord.Chord):
                    ev["pitch"] = pitch_name(sorted(n.pitches, key=lambda x: -x.ps)[0])
                if ev["pitch"] is not None:
                    lys = {ly.number or 1: lyric_text(ly) for ly in n.lyrics}
                    if verse_mode:
                        arr = [lys.get(num) for num in numbers]
                        if any(x is not None for x in arr):
                            ev["lyric"] = arr[0] if len(set(arr)) == 1 and arr[0] is not None and meta.get("collapseSame", True) else arr
                    else:
                        # Im n-ten Durchlauf einer Wiederholung gilt die n-te Textzeile der Note.
                        keys = sorted(k for k in lys if lys[k])
                        txt = lys[keys[min(passes[i] - 1, len(keys) - 1)]] if keys else None
                        if txt:
                            ev["lyric"] = txt
                    if n.tie is not None and n.tie.type in ("start", "continue"):
                        ev["tie"] = True
                    sm = slur_marks[k].get(id(n))
                    if sm:
                        ev["slur"] = sm
                if any(isinstance(e, expressions.Fermata) for e in n.expressions):
                    ev["fermata"] = True
                evs.append(ev)
                content = max(content, at + du)
            evs.sort(key=lambda e: e["at"])
            # Überlappungen (z. B. aus Akkordteilung) kappen
            clean = []
            for e in evs:
                if clean and clean[-1]["at"] + clean[-1]["duration"] > e["at"]:
                    if clean[-1]["at"] == e["at"]:
                        continue
                    clean[-1]["duration"] = e["at"] - clean[-1]["at"]
                clean.append(e)
            mvoices[vids[k]] = clean
            for d in m.recurse().getElementsByClass(dynamics.Dynamic):
                mark = d.value
                if mark in ("pp", "p", "mp", "mf", "f", "ff", "fp", "sfz"):
                    dyns.append({"at": ticks(d.getOffsetInHierarchy(m)), "mark": mark, "voices": [vids[k]]})
            for x in m.recurse().getElementsByClass(expressions.TextExpression):
                txt = (x.content or "").strip()
                if txt and k == 0 and not meta.get("skipDirections") and len(dirs) < 4:
                    dirs.append({"at": min(ticks(x.getOffsetInHierarchy(m)), full - 1), "text": txt[:80]})
        length = max(content, 1)
        rec = {"id": f"m{i + 1}", "number": str(mm[0].number), "section": sec_of[i], "meter": meter, "keyFifths": ks[0]}
        if length < full:
            rec["lengthTicks"] = length
        # Dynamik zusammenfassen, wenn alle Stimmen dasselbe Zeichen an derselben Stelle haben.
        merged = {}
        for d in dyns:
            merged.setdefault((d["at"], d["mark"]), set()).update(d["voices"])
        if merged:
            rec["dynamics"] = []
            for (at, mark), vs in sorted(merged.items()):
                if at >= (rec.get("lengthTicks") or full):
                    continue
                e = {"at": at, "mark": mark}
                if len(vs) < len(vids):
                    e["voices"] = [v for v in vids if v in vs]
                rec["dynamics"].append(e)
            if not rec["dynamics"]:
                del rec["dynamics"]
        if dirs:
            rec["directions"] = dirs
        rec["voices"] = mvoices
        out_measures.append(rec)

    # Geteilte Takte (z. B. Zeilenwechsel mitten im Takt) innerhalb eines Abschnitts zusammenführen.
    merged_measures = []
    for rec in out_measures:
        prev = merged_measures[-1] if merged_measures else None
        full = ticks(Fraction(rec["meter"][0] * 4, rec["meter"][1]))
        if (
            prev
            and prev["number"] == rec["number"]
            and prev["section"] == rec["section"]
            and prev["meter"] == rec["meter"]
            and "lengthTicks" in prev
            and prev["lengthTicks"] + rec.get("lengthTicks", full) <= full
        ):
            shift = prev["lengthTicks"]
            for vid in vids:
                prev["voices"].setdefault(vid, [])
                prev["voices"][vid] += [{**e, "at": e["at"] + shift} for e in rec["voices"].get(vid, [])]
            for key in ("dynamics", "directions"):
                if key in rec:
                    prev.setdefault(key, []).extend({**e, "at": e["at"] + shift} for e in rec[key])
            total = shift + rec.get("lengthTicks", full)
            if total < full:
                prev["lengthTicks"] = total
            else:
                del prev["lengthTicks"]
            continue
        merged_measures.append(rec)
    out_measures = merged_measures
    for i, rec in enumerate(out_measures):
        rec["id"] = f"m{i + 1}"

    # Text der Quellstimme auf textlose Stimmen übertragen (homophone Sätze, Text nur im Sopran):
    # Jede Silbe geht an die erste neu angeschlagene Note der Zielstimme zwischen dieser und der
    # nächsten Silbe der Quellstimme (deckt leicht verschobene Rhythmen in Unterstimmen ab).
    src_vid = meta.get("copyLyrics")
    if src_vid:
        def timeline(v):
            out, start, tied = [], 0, False
            for rec in out_measures:
                for e in rec["voices"].get(v, []):
                    if e["pitch"] is not None:
                        out.append((start + e["at"], e, tied))
                        tied = bool(e.get("tie"))
                start += rec.get("lengthTicks") or ticks(Fraction(rec["meter"][0] * 4, rec["meter"][1]))
            return out

        syllables = [(t, e["lyric"]) for t, e, _ in timeline(src_vid) if e.get("lyric") is not None]
        for v in vids:
            if v == src_vid:
                continue
            notes = timeline(v)
            if any(e.get("lyric") is not None for _, e, _ in notes):
                continue
            j = 0
            for k, (t, lyric) in enumerate(syllables):
                end = syllables[k + 1][0] if k + 1 < len(syllables) else float("inf")
                while j < len(notes) and notes[j][0] < t:
                    j += 1
                if j < len(notes) and notes[j][0] < end and not notes[j][2]:
                    notes[j][1]["lyric"] = lyric
                    j += 1

    # Pickup-Nummer 0 beibehalten, Schlussstrich setzen.
    last = out_measures[-1]
    last["barlines"] = [{"at": last.get("lengthTicks") or ticks(ts[0].barDuration.quarterLength), "kind": "final"}]

    md = sc.metadata
    data = {"format": "chorprobe/v1", "title": meta.get("title") or (md.title if md and md.title else "Ohne Titel")}
    for k in ("subtitle", "composer", "comment"):
        if meta.get(k):
            data[k] = meta[k]
    data["tempo"] = tempo_bpm or meta.get("defaultTempo", 80)
    data["ppq"] = PPQ
    if meta.get("source"):
        data["source"] = meta["source"]
    data["voices"] = voices
    if verses:
        data["verses"] = verses
    data["sections"] = sections
    data["measures"] = out_measures
    return data


def resolve(src, cache):
    """corpus:bach/bwv386.mxl (music21-Korpus), https://… (wird zwischengespeichert) oder Dateipfad."""
    if src.startswith("corpus:"):
        from music21 import corpus

        return str(corpus.getWork(src[len("corpus:"):]))
    if src.startswith("https://"):
        import hashlib
        import os
        import urllib.request

        os.makedirs(cache, exist_ok=True)
        name = hashlib.sha1(src.encode()).hexdigest()[:12] + "-" + src.rsplit("/", 1)[-1].split("?")[0]
        path = os.path.join(cache, name)
        if not os.path.exists(path):
            req = urllib.request.Request(src, headers={"User-Agent": "Mozilla/5.0 (Chorprobe-Import)"})
            with urllib.request.urlopen(req) as r, open(path, "wb") as f:
                f.write(r.read())
        return path
    return src


def write(data, dst):
    with open(dst, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False)
    print(f"{dst}: {len(data['measures'])} Takte, {len(data['voices'])} Stimmen")


if __name__ == "__main__":
    if sys.argv[1] == "--rezepte":
        # Stapelbetrieb: [{"src": …, "out": …, "meta": {…}}, …]; Pfade relativ zur Rezeptdatei.
        import os

        recipes_path = sys.argv[2]
        base = os.path.dirname(os.path.abspath(recipes_path))
        cache = os.path.join(base, ".cache")
        for r in json.load(open(recipes_path, encoding="utf-8")):
            write(convert(resolve(r["src"], cache), r.get("meta", {})), os.path.join(base, r["out"]))
    else:
        src, dst = sys.argv[1], sys.argv[2]
        meta = json.load(open(sys.argv[3], encoding="utf-8")) if len(sys.argv) > 3 else {}
        write(convert(src, meta), dst)
