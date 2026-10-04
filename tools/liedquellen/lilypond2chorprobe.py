#!/usr/bin/env python3
"""LilyPond (Teilmenge) -> chorprobe/v1-JSON, ohne Abhängigkeiten.

Gedacht für Chorsätze im Stil der Mutopia-Ausgaben aus dem „Volksliederbuch für gemischten Chor“
(1915): je Stimme eine Variable mit \\relative-Noten (deutsche Notennamen), Strophen als \\lyricmode
und im \\score-Block \\context Voice = Name { … \\global \\Variable … } sowie
\\lyricsto Name \\Text. Unterstützt: Noten, Pausen, Punktierungen, Haltebögen, Bögen, Akkorde (oberster
Ton), \\times/\\tuplet, \\partial, Wiederholungen über \\bar ".|:" / ":|." und \\repeat volta,
Dynamik (pp–ff, \\< \\> \\cresc \\!), Fermaten, Strophen, ignoreMelismata, \\skip und _ im Text.
Alles andere wird übergangen. Ergebnis immer gegen das PDF der Vorlage prüfen.

Aufruf: python3 lilypond2chorprobe.py EINGABE.ly AUSGABE.json [meta.json]
meta.json wie bei musicxml2chorprobe.py (title, composer, comment, source, tempo, …).
"""
import json
import re
import sys
from fractions import Fraction

PPQ = 480
WHOLE = 4 * PPQ
STEPS = "cdefgab"
SEMITONE = {"c": 0, "d": 2, "e": 4, "f": 5, "g": 7, "a": 9, "b": 11}


# ---------------------------------------------------------------- Grundlagen
def strip_comments(text):
    text = re.sub(r"%\{.*?%\}", " ", text, flags=re.S)
    return re.sub(r"%[^\n]*", " ", text)


def block(text, start):
    """Inhalt der geschweiften Klammer, die bei text[start] == '{' beginnt, und Endposition."""
    depth, i, in_str = 0, start, False
    while i < len(text):
        c = text[i]
        if in_str:
            if c == "\\":
                i += 1
            elif c == '"':
                in_str = False
        elif c == '"':
            in_str = True
        elif c == "{":
            depth += 1
        elif c == "}":
            depth -= 1
            if depth == 0:
                return text[start + 1 : i], i + 1
        i += 1
    raise ValueError("Klammer nicht geschlossen")


LANG = {"name": "nederlands"}


def german_name(word):
    """Notenname -> (Stammton, Alteration). deutsch.ly: h = B, b = B♭, es = E♭, as = A♭;
    nederlands (LilyPond-Standard): b = B, bes = B♭, es/ees = E♭, as/aes = A♭; is = ♯, es = ♭."""
    if LANG["name"] == "deutsch":
        specials = {"b": ("b", -1), "h": ("b", 0), "heses": ("b", -2), "his": ("b", 1), "hisis": ("b", 2)}
        if word in specials:
            return specials[word]
        letters = "cdefga"
    else:
        letters = "cdefgab"
    for prefix, step in (("as", "a"), ("es", "e")):
        if word == prefix or (word.startswith(prefix) and re.fullmatch(r"(es)*", word[len(prefix) :])):
            return step, -1 - len(word[len(prefix) :]) // 2
    m = re.fullmatch(rf"([{letters}])((?:is|es)*)", word)
    if not m:
        return None
    alter = sum(1 if x == "is" else -1 for x in re.findall(r"is|es", m.group(2)))
    return m.group(1), alter


def pitch_name(step, alter, octave):
    acc = "#" * alter if alter > 0 else "b" * -alter
    return f"{step.upper()}{acc}{octave}"


def midi(step, alter, octave):
    return 12 * (octave + 1) + SEMITONE[step] + alter


def duration_ticks(digits, dots):
    base = Fraction(WHOLE, int(digits))
    total, add = base, base
    for _ in range(dots):
        add /= 2
        total += add
    return total


# ---------------------------------------------------------------- Noten
DUR = r"(?:128|64|32|16|8|4|2|1)\.*"
NOTE = re.compile(r"([a-h][a-z]*)([',]*)[!?]?(" + DUR + r")?(?:\*(\d+(?:/\d+)?))?")
REST = re.compile(r"([rRs])(" + DUR + r")?(?:\*(\d+(?:/\d+)?))?(?![a-zA-Z])")
CHORD = re.compile(r"<([^<>]*)>(" + DUR + r")?")
CMD = re.compile(r"\\([a-zA-Z]+|[<>!()])")
VALUE = r"""(?:"[^"]*"|\#?'?\([^)]*\)|\#?'?[^\s{}]+)"""
ARGS = {
    "bar": r'\s*"([^"]*)"',
    "partial": r"\s*(\d+)(\.*)",
    "time": r"\s*(\d+)/(\d+)",
    "key": r"\s*([a-h][a-z]*)\s*\\(major|minor)",
    "clef": r'\s*(?:"[^"]*"|[\w^_]+)',
    "tempo": r'\s*(?:"[^"]*")?\s*(?:\d+\.?\s*=\s*\d+(?:\s*-\s*\d+)?)?',
    "set": r"\s*[\w.]+\s*=\s*" + VALUE,
    "override": r"\s*[\w.]+(?:\s*\#'[\w-]+)*\s*=\s*" + VALUE,
    "revert": r"\s*[\w.]+(?:\s*\#'[\w-]+)*",
    "unset": r"\s*[\w.]+",
    "accidentalStyle": r'\s*(?:"[^"]*"|[\w.-]+)',
    "mark": r'\s*(?:"[^"]*"|\\default|\S+)',
    "repeat": r"\s*(\w+)\s+(\d+)\s*(?=\{)",
    "times": r"\s*(\d+)/(\d+)\s*(?=\{)",
    "tuplet": r"\s*(\d+)/(\d+)\s*(?:\d+\s*)?(?=\{)",
}
DYNAMICS = {"pp", "p", "mp", "mf", "f", "ff", "fp", "sfz"}


class Voice:
    def __init__(self):
        self.events = []  # dict(start, dur, pitch, midi, tie, slur, fermata) – pitch None = Pause
        self.marks = []  # (tick, art, wert)
        self.time = Fraction(0)


def transposer(spec):
    """\\transpose von nach -> Funktion (step, alter, octave) -> transponiert."""
    if not spec:
        return lambda p: p
    (fs, fa, fo), (ts, ta, to) = spec
    steps = (STEPS.index(ts) + 7 * to) - (STEPS.index(fs) + 7 * fo)
    semis = midi(ts, ta, to) - midi(fs, fa, fo)

    def apply(p):
        step, alter, octave = p
        idx = STEPS.index(step) + 7 * octave + steps
        nstep, noct = STEPS[idx % 7], idx // 7
        nalter = midi(step, alter, octave) + semis - midi(nstep, 0, noct)
        return nstep, nalter, noct

    return apply


def parse_music(src, ref, out, scale=Fraction(1), state=None, transpose=None):
    """Liest Noten aus src in out (Voice). ref = (step_index, octave) für \\relative."""
    state = state or {"prev": ref, "dur": Fraction(PPQ), "pending_tie": False, "grace": False}
    tr = transposer(transpose)
    pos = 0

    def last_note():
        return next((e for e in reversed(out.events) if e["pitch"] is not None), None)

    def anchor():
        return out.events[-1]["start"] if out.events else out.time

    def add_note(p, durtxt, mul):
        if durtxt:
            state["dur"] = duration_ticks(durtxt.rstrip("."), durtxt.count("."))
        d = state["dur"] * scale * (Fraction(mul) if mul else 1)
        if state["grace"]:  # Vorschlagsnoten haben keine eigene Dauer
            state["grace"] = False
            return
        q = tr(p)
        out.events.append(
            {"start": out.time, "dur": d, "pitch": pitch_name(*q), "midi": midi(*q), "tie": False,
             "slur": None, "fermata": False, "tied_from": state["pending_tie"]}
        )
        state["pending_tie"] = False
        out.time += d

    while pos < len(src):
        m = re.compile(r"\s+").match(src, pos)
        if m:
            pos = m.end()
            continue
        c = src[pos]
        if c == "%":
            pos = src.find("\n", pos) if "\n" in src[pos:] else len(src)
            continue
        m = CMD.match(src, pos)
        if m:
            name = m.group(1)
            pos = m.end()
            if name in ARGS:
                am = re.compile(ARGS[name]).match(src, pos)
                if am:
                    pos = am.end()
            if name in DYNAMICS:
                out.marks.append((anchor(), "dyn", name))
            elif name in ("<", ">", "cresc", "decresc", "dim", "crescHairpin"):
                out.marks.append((anchor(), "hair", "dim" if name in (">", "decresc", "dim") else "cresc"))
            elif name == "!":
                out.marks.append((anchor(), "end", None))
            elif name == "fermata":
                if out.events:
                    out.events[-1]["fermata"] = True
            elif name in ("acciaccatura", "appoggiatura", "grace"):
                state["grace"] = True
            elif name == "partial" and am:
                out.marks.append((out.time, "partial", duration_ticks(am.group(1), len(am.group(2)))))
            elif name == "bar" and am and ":" in am.group(1):
                if am.group(1).startswith(":"):
                    out.marks.append((out.time, "repeatEnd", None))
                if am.group(1).endswith(":"):
                    out.marks.append((out.time, "repeatStart", None))
            elif name == "repeat" and am:
                inner, pos = block(src, src.index("{", pos))
                if am.group(1) == "volta":
                    out.marks.append((out.time, "repeatStart", None))
                parse_music(inner, None, out, scale, state, transpose)
                if am.group(1) == "volta":
                    out.marks.append((out.time, "repeatEnd", int(am.group(2))))
            elif name in ("times", "tuplet") and am:
                a, b = int(am.group(1)), int(am.group(2))
                factor = Fraction(a, b) if name == "times" else Fraction(b, a)
                inner, pos = block(src, src.index("{", pos))
                parse_music(inner, None, out, scale * factor, state, transpose)
            elif name == "markup":
                mm = re.compile(r"\s*").match(src, pos)
                pos = mm.end()
                if pos < len(src) and src[pos] == "{":
                    _, pos = block(src, pos)
                else:
                    mm = re.compile(r'"[^"]*"|\S+').match(src, pos)
                    pos = mm.end() if mm else pos
            continue
        if c in "^_-" and pos + 1 < len(src):  # Artikulation oder Text am Notenkopf
            nxt = src[pos + 1]
            if nxt == '"':
                pos = src.index('"', pos + 2) + 1
            elif nxt == "\\":
                pos += 1
            else:
                pos += 2
            continue
        if c == '"':
            pos = src.index('"', pos + 1) + 1
            continue
        if c in "~()[]{}|":
            last = last_note()
            if c == "~" and last:
                last["tie"] = True
                state["pending_tie"] = True
            elif c == "(" and last:
                last["slur"] = "start"
            elif c == ")" and last:
                last["slur"] = None if last.get("slur") == "start" else "end"
            elif c == "[" and last:
                last["beam"] = "start"
            elif c == "]" and last:
                last["beam"] = "end"
            pos += 1
            continue
        if src.startswith("<<", pos):
            # Simultane Musik in einer Stimme (z. B. Note + Leerpausen für Dynamik):
            # nur der erste Zweig zählt.
            depth, j = 0, pos
            while j < len(src):
                if src.startswith("<<", j):
                    depth, j = depth + 1, j + 2
                elif src.startswith(">>", j):
                    depth, j = depth - 1, j + 2
                    if depth == 0:
                        break
                else:
                    j += 1
            inner = src[pos + 2 : j - 2].strip()
            if inner.startswith("{"):
                first, _ = block(inner, 0)
            else:
                first = re.split(r"\{|\\\\", inner, maxsplit=1)[0]
            parse_music(first, None, out, scale, state, transpose)
            pos = j
            continue
        m = CHORD.match(src, pos)
        if m:
            members, first = [], None
            for name, octs in re.findall(r"([a-h][a-z]*)([',]*)", m.group(1)):
                p = place(name, octs, state["prev"])
                if p is None:
                    continue
                state["prev"] = (STEPS.index(p[0]), p[2])
                first = first or p
                members.append(p)
            if first:
                state["prev"] = (STEPS.index(first[0]), first[2])
                # Geteilte Stimme (divisi): Ober- bzw. Unterstimmen nehmen den oberen, Alt und Bass
                # den unteren Ton; die übrigen Töne stehen im Notenkommentar.
                members.sort(key=lambda q: midi(*q))
                chosen = members[0] if state.get("low") else members[-1]
                add_note(chosen, m.group(2), None)
                if len(members) > 1 and not state["grace"] and out.events:
                    out.events[-1]["divisi"] = [pitch_name(*tr(q)) for q in members]
            pos = m.end()
            continue
        m = REST.match(src, pos)
        if m:
            durtxt, mul = m.group(2), m.group(3)
            if durtxt:
                state["dur"] = duration_ticks(durtxt.rstrip("."), durtxt.count("."))
            d = state["dur"] * scale * (Fraction(mul) if mul else 1)
            out.events.append({"start": out.time, "dur": d, "pitch": None, "fermata": False})
            out.time += d
            state["pending_tie"] = False
            pos = m.end()
            continue
        m = NOTE.match(src, pos)
        if m:
            p = place(m.group(1), m.group(2), state["prev"])
            pos = m.end()
            if p is None:
                continue
            state["prev"] = (STEPS.index(p[0]), p[2])
            add_note(p, m.group(3), m.group(4))
            continue
        pos += 1  # Unbekanntes Zeichen überspringen
    return state


def place(word, octs, prev):
    gn = german_name(word)
    if gn is None:
        return None
    step, alter = gn
    s = STEPS.index(step)
    if prev is None:
        octave = 3  # absolute Notation: c = C3
    else:
        ps, po = prev
        best = None
        for o in (po - 1, po, po + 1):
            d = abs((o * 7 + s) - (po * 7 + ps))
            if best is None or d < best[0]:
                best = (d, o)
        octave = best[1]
    octave += octs.count("'") - octs.count(",")
    return step, alter, octave


# ---------------------------------------------------------------- Liedtext
def parse_lyrics(src):
    """Silben als dict(text|None, hyphen, ignore) – ignore = ignoreMelismata-Zustand."""
    syl, ignore = [], False
    src = re.sub(r'\\set\s+stanza\s*=\s*(?:"[^"]*"|\S+)', " ", src)
    src = re.sub(r"\\set\s+ignoreMelismata\s*=\s*##t", " @IGN_ON@ ", src)
    src = re.sub(r"\\unset\s+ignoreMelismata", " @IGN_OFF@ ", src)
    src = re.sub(r"\\set\s+\S+\s*=\s*\S+", " ", src)
    for m in re.finditer(r'"(?:[^"\\]|\\.)*"|\\skip\s*[\d.]+|\S+', src):
        w = m.group(0)
        if w == "@IGN_ON@":
            ignore = True
        elif w == "@IGN_OFF@":
            ignore = False
        elif w == "--":
            if syl:
                syl[-1]["hyphen"] = True
        elif w in ("__", "{", "}"):
            continue
        elif w.startswith("\\skip") or w == "_":
            syl.append({"text": None, "hyphen": False, "ignore": ignore})
        elif w.startswith("\\"):
            continue
        else:
            text = w[1:-1] if w.startswith('"') else w
            syl.append({"text": text.replace("~", " ").replace("_", " "), "hyphen": False, "ignore": ignore})
    return syl


def align(syllables, events, beam_melisma=True):
    """Silben den Noten zuordnen wie \\lyricsto: Melismen (Bögen, Haltebögen und, bei
    \\autoBeamOff, manuelle Balken) überspringen, solange ignoreMelismata nicht gesetzt ist."""
    notes = [e for e in events if e["pitch"] is not None]
    in_slur, in_beam, cont = False, False, []
    for e in notes:
        cont.append(in_slur or in_beam or e.get("tied_from", False))
        if e.get("slur") == "start":
            in_slur = True
        elif e.get("slur") == "end":
            in_slur = False
        if beam_melisma and e.get("beam") == "start":
            in_beam = True
        elif e.get("beam") == "end":
            in_beam = False
    result = {}
    j = 0
    for k, s in enumerate(syllables):
        if j >= len(notes):
            rest = [x["text"] for x in syllables[k:] if x["text"]]
            if rest:
                print(f"WARNUNG: {len(rest)} Silben ohne Note: {' '.join(rest[:6])} …", file=sys.stderr)
            break
        if s["text"] is not None:
            result[id(notes[j])] = s["text"] + ("-" if s["hyphen"] else "")
        j += 1
        while j < len(notes) and cont[j] and not s["ignore"]:
            j += 1
    return result


# ---------------------------------------------------------------- Partitur
def convert(path, meta):
    text = strip_comments(open(path, encoding="utf-8").read())
    lang = re.search(r'\\(?:include\s+"(\w+)\.ly"|language\s+"(\w+)")', text)
    LANG["name"] = (lang.group(1) or lang.group(2)) if lang else "nederlands"
    if LANG["name"] not in ("deutsch", "nederlands"):
        raise ValueError(f"Notennamen-Sprache {LANG['name']} wird nicht unterstützt.")
    beam_melisma = "\\autoBeamOff" in text
    variables = {}
    for m in re.finditer(r"^([A-Za-z]+)\s*=\s*(\\relative\s+(?:([a-h][a-z]*)([',]*)\s*)?|\\lyricmode\s*|)\{", text, re.M):
        body, _ = block(text, m.end() - 1)
        variables[m.group(1)] = (m.group(2).strip(), m.group(3), m.group(4), body)

    glob = variables.get("global", ("", None, None, ""))[3]
    tm = re.search(r"\\time\s+(\d+)/(\d+)", glob)
    meter = [int(tm.group(1)), int(tm.group(2))] if tm else [4, 4]
    km = re.search(r"\\key\s+([a-h][a-z]*)\s+\\(major|minor)", glob)
    key_fifths = 0
    if km:
        step, alter = german_name(km.group(1))
        pc = (SEMITONE[step] + alter) % 12
        if km.group(2) == "minor":
            pc = (pc + 3) % 12
        key_fifths = {0: 0, 7: 1, 2: 2, 9: 3, 4: 4, 11: 5, 6: 6, 5: -1, 10: -2, 3: -3, 8: -4, 1: -5}[pc]
    direction = re.search(r'\\tempo\s+"([^"]+)"', glob)

    score_at = text.index("\\score")
    score = text[score_at:]
    voice_vars = re.findall(
        r'\\context\s+Voice\s*=\s*"?(\w+)"?\s*\{.*?\\global\s+(?:\\transpose\s+([a-h][a-z]*[\',]*)\s+([a-h][a-z]*[\',]*)\s+)?\\(\w+)',
        score,
        re.S,
    )
    lyric_links = re.findall(r'\\lyricsto\s+"?(\w+)"?\s*\\(\w+)', score)
    tempo_m = re.search(r"\\tempo\s+(\d+)(\.?)\s*=\s*(\d+)", score)
    tempo = meta.get("tempo")
    if tempo is None and tempo_m:
        tempo = round(int(tempo_m.group(3)) * (4 / int(tempo_m.group(1))) * (1.5 if tempo_m.group(2) else 1))

    voices = {}
    order = []
    def absolute(word):
        name, octs = re.fullmatch(r"([a-h][a-z]*)([',]*)", word).groups()
        step, alter = german_name(name)
        return step, alter, 3 + octs.count("'") - octs.count(",")

    # In Dateireihenfolge lesen: LilyPond merkt sich die letzte Notendauer über Variablen hinweg
    # (eine Stimme ohne Dauer am Anfang übernimmt die letzte Dauer der vorherigen Variable).
    parsed, last_dur = {}, Fraction(PPQ)
    links = {var: (vname, tfrom, tto) for vname, tfrom, tto, var in voice_vars}
    for var, (how, rstep, roct, body) in variables.items():
        if var not in links:
            continue
        vname, tfrom, tto = links[var]
        ref = (0, 4)  # \relative ohne Startton: c'
        if how.startswith("\\relative") and rstep:
            step, _ = german_name(rstep)
            ref = (STEPS.index(step), 3 + roct.count("'") - roct.count(","))
        elif not how.startswith("\\relative"):
            ref = None
        v = Voice()
        low = bool(re.match(r"(?i)(alt|bass)", vname))
        state = {"prev": ref, "dur": last_dur, "pending_tie": False, "grace": False, "low": low}
        parse_music(body, ref, v, state=state, transpose=(absolute(tfrom), absolute(tto)) if tfrom else None)
        last_dur = state["dur"]
        parsed[vname] = v
    for vname, _, _, _ in voice_vars:
        voices[vname] = parsed[vname]
        order.append(vname)

    # Liedtext je Stimme (Zeilen in Reihenfolge)
    lines = {}
    for vname, var in lyric_links:
        if vname in voices and var in variables:
            lines.setdefault(vname, []).append(
                align(parse_lyrics(variables[var][3]), voices[vname].events, beam_melisma)
            )
    main = max(lines, key=lambda k: len(lines[k])) if lines else None
    n_verses = len(lines[main]) if main else 0

    def lyric_of(vname, ev):
        ls = lines.get(vname, [])
        vals = [ln.get(id(ev)) for ln in ls]
        if not any(vals):
            return None
        if vname == main and n_verses > 1:
            if len(set(vals)) == 1:
                return vals[0]
            # Nach dem Ende der übrigen Strophenzeilen (Kehrreim) gilt Zeile 1 für alle Strophen.
            if vals[0] and not any(vals[1:]):
                return vals[0]
            return vals
        return next(x for x in vals if x)

    # Takte: Auftakt, dann volle Takte; zusätzlich an Wiederholungszeichen teilen.
    bar = Fraction(WHOLE * meter[0], meter[1])
    total = max(v.time for v in voices.values())
    marks = sorted({(t, k, x) for v in voices.values() for (t, k, x) in v.marks if k in ("repeatStart", "repeatEnd", "partial")}, key=lambda m: m[0])
    partial = next((x for t, k, x in marks if k == "partial"), None)
    cuts = {Fraction(0), total}
    t = partial if partial else bar
    while t < total:
        cuts.add(t)
        t += bar
    starts = [t for t, k, _ in marks if k == "repeatStart"]
    ends = [(t, x) for t, k, x in marks if k == "repeatEnd"]
    for t in starts + [t for t, _ in ends]:
        cuts.add(t)
    cuts = sorted(c for c in cuts if 0 <= c <= total)
    pieces = list(zip(cuts, cuts[1:]))

    def number_of(t0):
        if partial:
            return "0" if t0 < partial else str(int((t0 - partial) // bar) + 1)
        return str(int(t0 // bar) + 1)

    # Aufführungsreihenfolge mit Wiederholungen
    sections = []
    cursor = Fraction(0)
    open_start = Fraction(0)
    seq = []
    for t, k, x in marks:
        if k == "repeatStart":
            if t > cursor:
                seq.append(("plain", cursor, t))
            cursor = open_start = t
        elif k == "repeatEnd":
            seq.append(("repeat", open_start, t, (x or 2)))
            cursor = t
    if cursor < total:
        seq.append(("plain", cursor, total))
    letters = iter("ABCDEFGH")
    for item in seq:
        if item[0] == "plain":
            name = f"Teil {next(letters)}"
            sections.append((name, [p for p in pieces if item[1] <= p[0] < item[2]]))
        else:
            name = f"Teil {next(letters)}"
            ps = [p for p in pieces if item[1] <= p[0] < item[2]]
            for r in range(item[3]):
                sections.append((name if r == 0 else f"{name} (Wiederholung)", ps))
    if len(sections) == 1:
        sections = [("Lied", sections[0][1])]

    vids = {}
    out_voices = []
    for vname in order:
        low = vname.lower()
        base = next((b for b in ("sopran", "alt", "tenor", "bass") if low.startswith(b)), None)
        vid = {"sopran": "s", "alt": "a", "tenor": "t", "bass": "b"}.get(base, f"v{len(vids) + 1}")
        suffix = re.sub(r"^(sopran|alt|tenor|bass)", "", low)
        suffix = {"a": "i", "b": "ii", "1": "i", "2": "ii"}.get(suffix, suffix)
        if suffix:
            vid += suffix.replace("ii", "2").replace("i", "1")
        vids[vname] = vid
        name = {"s": "Sopran", "a": "Alt", "t": "Tenor", "b": "Bass"}.get(vid[0], vname) + (
            " " + suffix.upper() if suffix else ""
        )
        voice = {"id": vid, "name": name, "short": vid.upper(), "clef": "bass" if vid.startswith("b") else "treble"}
        if vid.startswith("t"):
            voice["displayOctave"] = 1
        out_voices.append(voice)

    measures = []
    sec_out = []
    for si, (name, ps) in enumerate(sections):
        sid = f"s{si + 1}"
        sec_out.append({"id": sid, "name": name})
        for a, b in ps:
            length = int(b - a)
            rec = {"id": f"m{len(measures) + 1}", "number": number_of(a), "section": sid, "meter": meter, "keyFifths": key_fifths}
            if b - a < bar:
                rec["lengthTicks"] = length
            if not measures and direction:
                rec["directions"] = [{"at": 0, "text": direction.group(1)[:80]}]
            rec["voices"] = {}
            dyns = []
            for vname in order:
                evs = []
                for e in voices[vname].events:
                    if a <= e["start"] < b:
                        ev = {"at": int(e["start"] - a), "duration": int(min(e["dur"], b - e["start"])), "pitch": e["pitch"]}
                        if e["pitch"] is not None:
                            ly = lyric_of(vname, e)
                            if ly is not None:
                                ev["lyric"] = ly
                            if e.get("tie"):
                                ev["tie"] = True
                            if e.get("slur"):
                                ev["slur"] = e["slur"]
                        if e.get("fermata"):
                            ev["fermata"] = True
                        if e.get("divisi"):
                            names = " + ".join(e["divisi"])
                            ev["comment"] = f"Geteilt (divisi): {names}. Hier nur {e['pitch']}."
                        ev["_src"] = e
                        evs.append(ev)
                rec["voices"][vids[vname]] = evs
                for t, k, x in voices[vname].marks:
                    if k == "dyn" and a <= t < b:
                        dyns.append((int(t - a), x, vids[vname]))
            if dyns:
                merged = {}
                for at, mark, vid in dyns:
                    merged.setdefault((at, mark), set()).add(vid)
                rec["dynamics"] = [
                    {"at": at, "mark": mark, **({"voices": sorted(vs, key=list(vids.values()).index)} if len(vs) < len(vids) else {})}
                    for (at, mark), vs in sorted(merged.items())
                ]
            measures.append(rec)

    # Haltebögen und Bögen dürfen nicht über Abschnittsgrenzen der Wiederholung hinausreichen.
    for vid in vids.values():
        seq_notes = [(mi, e) for mi, m in enumerate(measures) for e in m["voices"][vid]]
        open_slur = None
        for k, (mi, e) in enumerate(seq_notes):
            nxt = seq_notes[k + 1][1] if k + 1 < len(seq_notes) else None
            src = e["_src"]
            if e.get("tie") and (nxt is None or nxt["_src"] is src or nxt["pitch"] != e["pitch"] or not nxt["_src"].get("tied_from")):
                del e["tie"]
            if e.get("slur") == "start":
                if open_slur is not None:
                    del open_slur["slur"]
                open_slur = e
            elif e.get("slur") == "end":
                if open_slur is None:
                    del e["slur"]
                else:
                    open_slur = None
            if open_slur is not None and nxt is not None and measures[seq_notes[k + 1][0]]["section"] != measures[mi]["section"] and open_slur is e:
                del e["slur"]
                open_slur = None
        if open_slur is not None:
            del open_slur["slur"]
    for m in measures:
        for evs in m["voices"].values():
            for e in evs:
                e.pop("_src", None)

    # Text der Hauptstimme auf textlose Noten der übrigen Stimmen übertragen.
    if main:
        def timeline(vid):
            res, start, tied = [], 0, False
            for m in measures:
                for e in m["voices"][vid]:
                    if e["pitch"] is not None:
                        res.append((start + e["at"], e, tied))
                        tied = bool(e.get("tie"))
                start += m.get("lengthTicks") or int(bar)
            return res

        src_syl = [(t, e["lyric"]) for t, e, _ in timeline(vids[main]) if "lyric" in e]
        for vid in vids.values():
            if vid == vids[main]:
                continue
            notes = timeline(vid)
            own = [t for t, e, _ in notes if "lyric" in e]
            j = 0
            for k, (t, lyric) in enumerate(src_syl):
                end = src_syl[k + 1][0] if k + 1 < len(src_syl) else float("inf")
                if any(t <= o < end for o in own):
                    continue
                while j < len(notes) and notes[j][0] < t:
                    j += 1
                if j < len(notes) and notes[j][0] < end and not notes[j][2] and "lyric" not in notes[j][1]:
                    notes[j][1]["lyric"] = lyric
                    j += 1

    last = measures[-1]
    last["barlines"] = [{"at": last.get("lengthTicks") or int(bar), "kind": "final"}]

    header = {k: v for k, v in re.findall(r'^\s*(\w+)\s*=\s*"([^"]*)"', text[text.find("\\header") :], re.M)}
    data = {"format": "chorprobe/v1", "title": meta.get("title") or header.get("title", "Ohne Titel")}
    for k in ("subtitle", "composer", "comment"):
        if meta.get(k):
            data[k] = meta[k]
    data["tempo"] = tempo or 90
    data["ppq"] = PPQ
    if meta.get("source"):
        data["source"] = meta["source"]
    data["voices"] = out_voices
    if n_verses > 1:
        data["verses"] = [{"id": str(k + 1), "name": f"{k + 1}. Strophe"} for k in range(n_verses)]
    data["sections"] = sec_out
    data["measures"] = measures
    return data


if __name__ == "__main__":
    meta = json.load(open(sys.argv[3], encoding="utf-8")) if len(sys.argv) > 3 else {}
    data = convert(sys.argv[1], meta)
    with open(sys.argv[2], "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False)
    print(f"{sys.argv[2]}: {len(data['measures'])} Takte, {len(data['voices'])} Stimmen, {len(data.get('verses', [])) or 1} Strophe(n)")
