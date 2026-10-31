#!/usr/bin/env python3
"""Seed the working document folio from the handbook's L1 entry.

Usage:
    python3 -I scripts/folio/seed_from_l1.py [<l1-entry-dir>] [--force]

The L1 entry is who-iris/library/9789240101197-eng (mounted at who-iris/).
It is split by PDF page and has no outline, so this script carries the
handbook's own outline, read from its contents page (PDF page 5), and puts
each page into the section that starts on or before it. Printed page N is
PDF page N + 10 from the Introduction on.

Writes folio/dth-sc/: the document manifest, one directory per chapter,
and one prose block (a .ts manifest and a .md body) per PDF page. Each block
records the L1 page it came from in `meta.source`.

This is a ONE-TIME SEED. After it, the folio is the working document and is
edited by hand. The script refuses to overwrite folio/dth-sc/ unless --force
is given, and --force discards hand edits.

What it does not do yet (workplan sc-workplan.md, gaps G2 and section 6):
tables and annex templates arrive as flattened text and are rebuilt by hand
as `table` blocks; figures are not yet placed; no block links to the
glossary or to smart-ra ArchiMate elements yet.
"""

import json
import re
import shutil
import sys
from pathlib import Path

DOC = "dth-sc"
FOLIO = Path("folio") / DOC
L1_ID = "9789240101197-eng"
DEFAULT_L1 = Path("who-iris/library") / L1_ID
TITLE = "Digital Transformation Handbook for Health Supply Chain Architecture"

# The outline, from the contents page (PDF 5). Each chapter lists its
# sections as (title, first PDF page). A page belongs to the last section
# that starts on or before it. Pages before the first section of the first
# chapter, and blank pages, are left out (cover, copyright, contents).
OUTLINE = [
    ("front-matter", "Front matter", None, [
        ("Acknowledgements", 6),
        ("Abbreviations and acronyms", 7),
        ("Glossary", 8),
    ]),
    ("introduction", "Introduction", None, [
        ("Introduction", 11),
        ("Digital health and the DHSC", 12),
        ("What this handbook covers", 13),
        ("How to use this handbook", 14),
        ("Alignment with the DIIG", 15),
        ("Alignment with WHO's SMART Guidelines", 16),
    ]),
    ("ch01-dhsc-strategy", "Chapter 1. Defining a holistic DHSC strategy", 1, [
        ("Guiding principles", 19),
        ("Why is a strategy necessary?", 20),
        ("Step 1. Identify and engage all relevant stakeholders", 22),
        ("Step 2. Analyse the current state of HSCISs", 23),
        ("Step 3. Define the DHSC vision and strategic goals and objectives", 24),
        ("Step 4. Define a strategic roadmap and performance indicators", 25),
    ]),
    ("ch02-dhsc-architecture", "Chapter 2. Defining the DHSC architecture", 2, [
        ("Chapter overview", 27),
        ("Is a DHSC architecture necessary? What are the risks of forgoing one?", 28),
        ("Step 1. Assess the current state of HSCISs", 30),
        ("Step 2. Define a target DHSC architecture; DHSC architecture framework", 32),
        ("Illustrative architectural approaches and governance options", 36),
        ("Step 3. Identify implementation activities and map them to strategic goals", 42),
    ]),
    ("ch03-implementation-and-operations", "Chapter 3. Planning for scalable implementation and sustainable operations", 3, [
        ("Guiding principles", 44),
        ("Building blocks and implementation considerations", 45),
        ("Step 1. Plan the implementation of each DHSC intervention", 47),
        ("Step 2. Develop an operational plan for each DHSC intervention", 48),
        ("Step 3. Develop a budget for each DHSC intervention", 49),
        ("Step 4. Implement each DHSC intervention", 51),
    ]),
    ("ch04-traceability", "Chapter 4. Using the DHSC to implement traceability", 4, [
        ("Chapter overview", 53),
        ("What is traceability? Why is it important? Traceability models", 54),
    ]),
    ("ch05-country-examples", "Chapter 5. Country examples", 5, [
        ("Chapter overview", 57),
        ("Ethiopia's DHSC initiative", 58),
        ("Malawi's DHSC initiative", 60),
        ("Rwanda's DHSC initiative", 63),
    ]),
    ("references", "References", None, [
        ("References", 65),
    ]),
    ("annexes", "Annexes", None, [
        ("Annex 1. Principles for digital development", 66),
        ("Annex 2. Steering committee example structure", 67),
        ("Annex 3. Template for prioritizing DHSC challenges to address", 68),
        ("Annex 4. Illustrative template that maps today's challenges to future outcomes", 69),
        ("Annex 5. Template for listing health supply chain information systems", 70),
        ("Annex 6. Risk register template", 71),
        ("Annex 7. Resource matrix for DHSC implementation", 72),
    ]),
]
LAST_PAGE = 76  # 77 is blank, 78 the back cover

# Chapter 5 is country reporting: kept as cited source text, never formalized.
SOURCE_ONLY = {"ch05-country-examples"}

NAV_TABS = {"INTRODUCTION", "IMPLEMENTATION", "STRATEGY", "TRACEABILITY",
            "ARCHITECTURE", "ANNEXES", "COUNTRY EXAMPLES"}
FOOTER = re.compile(
    r"^\s*(?:[ivx]+|\d+)?\s*Digital transformation handbook for health supply chain architecture\s*(?:[ivx]+|\d+)?\s*$"
    r"|^\s*[ivx]+\s*$|^\s*\d{1,3}\s*$")


def slug(s, n=40):
    s = re.sub(r"[^a-z0-9]+", "-", s.lower().replace("'", "")).strip("-")
    return s[:n].rstrip("-")


def page_text(l1, n):
    """The body text of PDF page n, without front matter, tabs or footer."""
    p = l1 / "sections" / f"page-{n:03d}.md"
    raw = p.read_text(encoding="utf-8")
    parts = raw.split("---\n", 2)
    body = parts[2] if len(parts) == 3 else raw
    if "_(no text on this page)_" in body:
        return ""
    lines = []
    for line in body.splitlines():
        t = line.strip()
        if not t or t in NAV_TABS or FOOTER.match(t):
            continue
        lines.append(t.replace("\t", " "))
    text = " ".join(lines)
    text = re.sub(r"\s+", " ", text)
    # Bullet markers the PDF uses: → (list), » (sub-list), ▶ (outputs), Ð (best practice), • (figure text).
    text = re.sub(r"\s*(?:→|»|▶|•)\s*", "\n- ", text)
    text = re.sub(r"\s*Ð\s*", "\n- ", text)
    return text.strip() + "\n"


def ts_str(s):
    return json.dumps(s, ensure_ascii=False)


def main(argv):
    force = "--force" in argv
    args = [a for a in argv if not a.startswith("--")]
    l1 = Path(args[0]) if args else DEFAULT_L1
    if not (l1 / "sections").is_dir():
        sys.exit(f"no L1 entry at {l1} (mount who-iris first)")
    if FOLIO.exists() and not force:
        sys.exit(f"{FOLIO} exists; refusing to overwrite hand edits (use --force)")
    for ch_dir, _, _, _ in OUTLINE:
        if (FOLIO / ch_dir).exists():
            shutil.rmtree(FOLIO / ch_dir)
    FOLIO.mkdir(parents=True, exist_ok=True)

    starts = [(first, ci, si) for ci, (_, _, _, secs) in enumerate(OUTLINE)
              for si, (_, first) in enumerate(secs)]
    starts.sort()
    pages = {}
    for k, (first, ci, si) in enumerate(starts):
        end = starts[k + 1][0] - 1 if k + 1 < len(starts) else LAST_PAGE
        for n in range(first, end + 1):
            pages.setdefault((ci, si), []).append(n)

    chapter_refs = []
    for ci, (ch_dir, ch_title, number, secs) in enumerate(OUTLINE):
        d = FOLIO / ch_dir
        d.mkdir(parents=True)
        sections_ts = []
        for si, (sec_title, _) in enumerate(secs):
            blocks = []
            for n in pages.get((ci, si), []):
                text = page_text(l1, n)
                if not text:
                    continue
                root = f"p-{ch_dir.split('-')[0]}-page-{n:03d}"
                meta = {
                    "title": sec_title,
                    "source": {
                        "library": L1_ID,
                        "section": f"page-{n:03d}",
                        "file": f"who-iris/library/{L1_ID}/sections/page-{n:03d}.md",
                        "pdfPage": n,
                        "method": "l1-outline-seed",
                    },
                }
                if ch_dir in SOURCE_ONLY:
                    meta["sourceOnly"] = "country reporting: cited source text, not formal content"
                (d / f"{root}.md").write_text(text, encoding="utf-8")
                (d / f"{root}.ts").write_text(
                    'import { prose } from "../../schema/builders";\n\n'
                    "export default prose({\n"
                    f"  label: {ts_str('prose:' + root[2:])},\n"
                    "  uses: [],\n"
                    f"  meta: {json.dumps(meta, ensure_ascii=False)},\n"
                    "});\n", encoding="utf-8")
                blocks.append(root)
            if not blocks:
                continue
            sections_ts.append(
                "    section({\n"
                f"      title: {ts_str(sec_title)},\n"
                f"      label: {ts_str('sec:' + ch_dir.split('-')[0] + '-' + slug(sec_title))},\n"
                f"      blocks: [{', '.join(ts_str(b) for b in blocks)}],\n"
                "    }),")
        num = f"  number: {number},\n" if number else ""
        (d / f"{ch_dir}.ts").write_text(
            'import { chapter, section } from "../../schema/builders";\n\n'
            "export default chapter({\n"
            f"{num}"
            f"  title: {ts_str(ch_title)},\n"
            f"  label: {ts_str('chap:' + ch_dir)},\n"
            "  sections: [\n" + "\n".join(sections_ts) + "\n  ],\n"
            "});\n", encoding="utf-8")
        chapter_refs.append(f'    chapterRef({{ dir: "{ch_dir}" }}),')

    (FOLIO / f"{DOC}.ts").write_text(
        'import { paper, chapterRef } from "../schema/builders";\n\n'
        "/**\n"
        f" * {TITLE}\n"
        " *\n"
        " * The document manifest. `chapters` is an ORDERED list: its order is the\n"
        " * reading order, and it is the only place that order is recorded.\n"
        " *\n"
        f" * Seeded from the L1 entry who-iris/library/{L1_ID} by\n"
        " * scripts/folio/seed_from_l1.py; edited by hand from then on.\n"
        " */\n"
        "export default paper({\n"
        f"  title: {ts_str(TITLE)},\n"
        '  authors: ["World Health Organization"],\n'
        '  date: "2024",\n'
        "  meta: {\n"
        '    documentKind: "smart-base:dth",\n'
        '    level: "L1",\n'
        '    targetLevel: "L2",\n'
        f'    isbn: "9789240101197",\n'
        f'    source: {{ library: "{L1_ID}", repository: "litlfred/who-iris" }},\n'
        '    licence: "CC BY-NC-SA 3.0 IGO",\n'
        '    status: "seeded from L1; not yet linked to the glossary or ArchiMate",\n'
        "  },\n"
        "  chapters: [\n" + "\n".join(chapter_refs) + "\n  ],\n"
        "});\n", encoding="utf-8")
    print(f"wrote {FOLIO}: {len(chapter_refs)} chapters, "
          f"{sum(1 for _ in FOLIO.rglob('p-*.md'))} blocks")


if __name__ == "__main__":
    main(sys.argv[1:])
