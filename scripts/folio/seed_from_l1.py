#!/usr/bin/env python3
"""Seed the working document folio from the handbook's L1 entry.

Usage:
    python3 -I scripts/folio/seed_from_l1.py [<l1-entry-dir>] [--pdf <pdf>] [--force]

With --pdf (who-iris/uploads/9789240101197-eng/9789240101197-eng.pdf, the
PDF the L1 entry was made from; its hash is checked), the handbook's tables
are rebuilt as `table` blocks (pdf_tables.py) and the prose of a page with a
table no longer repeats the table's words. Needs `pip install pdfplumber`.

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

Figures: each page the L1 entry renders a figure for (FIGURES) gets a
figure block after its prose, with the PNG copied into folio/dth-sc/media/.

What it does not do yet (workplan, section 6): no block links to the
glossary or to smart-ra ArchiMate elements yet.
"""

import json
from pathlib import Path
import re
import shutil
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent))  # pdf_tables.py, beside this script

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

# The figures the L1 entry renders from the PDF's vector layer
# (figures/vfig-pNNN.png), with the handbook's own numbers and titles. Figs 1-4
# and 6-9 have no rendering in the L1 entry yet; vfig-p032 is the Step 2 box
# (a layout panel, not a figure) and is left out.
FIGURES = {
    15: [(5, "DIIG process for planning and implementing a digital health enterprise")],
    26: [(10, "Example of outputs from this chapter")],
    29: [(11, "Health supply chain end-to-end visibility and traceability")],
    31: [(12, "SCISMM maturity levels for HSCISs")],
    33: [(13, "DIIG digital health enterprise architecture framework")],
    34: [(14, "DHSC architecture framework")],
    36: [(15, "Maturity-based architecture: moving from SCISMM Level 3 to Level 4")],
    37: [(16, "Maturity-based architecture: moving from SCISMM Level 4 to Level 5")],
    38: [(17, "Architecture based on supply chain design: centralized management")],
    39: [(18, "Architecture based on supply chain design: decentralized management (option A)")],
    40: [(19, "Architecture based on supply chain design: decentralized management (option B)")],
    41: [(20, "Benefits of cross-enterprise analytics services")],
    43: [(21, "Example of outputs from this chapter")],
    45: [(22, "Building blocks of digital health and DHSC implementation")],
    49: [(23, "Cost components to determine the total cost of ownership")],
    55: [(24, "Achieving track and trace capabilities through DHSC architecture components")],
    56: [(25, "Illustrative example of a traceability service interface")],
    59: [(26, "Current-state supply chain systems in Ethiopia"), (27, "Future-state supply chain systems in Ethiopia")],
    61: [(28, "Current-state supply chain systems in Malawi"), (29, "Future-state supply chain systems in Malawi")],
    62: [(30, "Visualization of future-state architecture from Malawi's SCSA")],
    64: [(31, "Current-state supply chain systems in Rwanda"), (32, "Future-state supply chain systems in Rwanda")],
}

# Third-party figures the handbook reproduces by permission: not covered by
# its CC licence, so the image is not copied here; a note points to the page.
THIRD_PARTY = {31: "reproduced in the handbook by permission of the publisher, Digital Square (SCISMM, reference 16)"}

# Chapter 5 is country reporting: kept as cited source text, never formalized.
SOURCE_ONLY = {"ch05-country-examples"}

NAV_TABS = {"INTRODUCTION", "IMPLEMENTATION", "STRATEGY", "TRACEABILITY",
            "ARCHITECTURE", "ANNEXES", "COUNTRY EXAMPLES"}
FOOTER = re.compile(
    r"^\s*(?:[ivx]+|\d+)?\s*Digital transformation handbook for health supply chain architecture\s*(?:[ivx]+|\d+)?\s*$"
    r"|^\s*[ivx]+\s*$|^\s*\d{1,3}\s*$"
    # running chapter footers, e.g. "Defining the DHSC architecture 21", "Annexes 61"
    r"|^\s*(?:\d{1,3}\s+)?(?:Introduction|Annexes|References|Country examples|Defining a holistic DHSC strategy"
    r"|Defining the DHSC architecture|Planning for scalable implementation and sustainable operations"
    r"|Using the DHSC to implement traceability)\s+\d{1,3}\s*$")


def slug(s, n=40):
    s = re.sub(r"[^a-z0-9]+", "-", s.lower().replace("'", "")).strip("-")
    return s[:n].rstrip("-")


def body_text(body):
    """Clean a page's text: no navigation tabs, no running footer, bullets as list items."""
    lines = []
    for line in body.splitlines():
        t = line.strip()
        if not t or t in NAV_TABS or FOOTER.match(t):
            continue
        # pdfplumber can put several tab labels on one line
        # (and, when a page is read in two columns, a tab label split in two)
        tabs = "INTRODUCTION IMPLEMENTATION STRATEGY TRACEABILITY ARCHITECTURE ANNEXES COUNTRY EXAMPLES"
        words = t.split()
        if (all(w.isupper() and len(w) > 2 and w in tabs for w in words)
                and any(w in tabs.split() for w in words)):
            continue
        lines.append(t.replace("\t", " "))
    text = " ".join(lines)
    text = re.sub(r"\s+", " ", text)
    # Bullet markers the PDF uses: → (list), » (sub-list), ▶ (outputs), Ð (best practice), • (figure text).
    text = re.sub(r"\s*(?:→|»|▶|•)\s*", "\n- ", text)
    text = re.sub(r"\s*Ð\s*", "\n- ", text)
    text = text.strip()
    return text + "\n" if text else ""


def page_text(l1, n):
    """The body text of PDF page n, from the L1 entry."""
    p = l1 / "sections" / f"page-{n:03d}.md"
    raw = p.read_text(encoding="utf-8")
    parts = raw.split("---\n", 2)
    body = parts[2] if len(parts) == 3 else raw
    if "_(no text on this page)_" in body:
        return ""
    return body_text(body)


def write_table(d, ch_dir, n, spec, pdf, sec_title):
    """Write one table block for the table starting on PDF page n; return its root."""
    import pdf_tables
    rows, _ = pdf_tables.table_rows(pdf, n)
    tail = spec['label'].split(':', 1)[1]
    root = f"t-{ch_dir.split('-')[0]}-{'table-' + tail if tail.isdigit() else tail}"
    pages = spec.get("pages", [n])
    meta = {
        "title": sec_title,
        "source": {
            "library": L1_ID,
            "section": f"page-{n:03d}",
            "pdf": f"who-iris/uploads/{L1_ID}/{L1_ID}.pdf",
            "pdfPages": pages,
            "method": "pdf-table-rebuild",
        },
    }
    (d / f"{root}.md").write_text(pdf_tables.markdown(rows, spec["caption"]), encoding="utf-8")
    (d / f"{root}.ts").write_text(
        'import { table } from "../../schema/builders";\n\n'
        "export default table({\n"
        f"  label: {ts_str(spec['label'])},\n"
        f"  caption: {ts_str(spec['caption'])},\n"
        f"  meta: {json.dumps(meta, ensure_ascii=False)},\n"
        "});\n", encoding="utf-8")
    return [root]


def write_figure(d, ch_dir, n, l1, sec_title, source_only):
    """Copy the L1 rendering of page n's figure(s) into media/ and write one figure block."""
    figs = FIGURES[n]
    if n in THIRD_PARTY:
        k, t = figs[0]
        root = f"p-{ch_dir.split('-')[0]}-fig-{k}-third-party"
        (d / f"{root}.md").write_text(
            f"Fig. {k}. {t}: {THIRD_PARTY[n]}. It is third-party material outside the handbook's "
            f"CC BY-NC-SA 3.0 IGO licence, so it is not copied here; see the handbook, PDF page {n}.\n",
            encoding="utf-8")
        meta = {"title": sec_title, "source": {"library": L1_ID, "section": f"page-{n:03d}", "pdfPage": n,
                                                "method": "third-party-figure-note"}}
        (d / f"{root}.ts").write_text(
            'import { prose } from "../../schema/builders";\n\n'
            "export default prose({\n"
            f"  label: {ts_str('prose:' + root[2:])},\n"
            "  uses: [],\n"
            f"  meta: {json.dumps(meta, ensure_ascii=False)},\n"
            "});\n", encoding="utf-8")
        return [root]
    src = l1 / "figures" / f"vfig-p{n:03d}.png"
    media = FOLIO / "media"
    media.mkdir(exist_ok=True)
    shutil.copyfile(src, media / src.name)
    nums = "-".join(str(k) for k, _ in figs)
    root = f"f-{ch_dir.split('-')[0]}-fig-{nums}"
    caption = "; ".join(f"Fig. {k}. {t}" for k, t in figs)
    meta = {
        "title": sec_title,
        "source": {
            "library": L1_ID,
            "file": f"who-iris/library/{L1_ID}/figures/{src.name}",
            "page": n,
            "method": "l1-vector-figure",
        },
    }
    if source_only:
        meta["sourceOnly"] = "country reporting: cited source figure, not formal content"
    (d / f"{root}.md").write_text(
        f"![{caption}](media/{src.name})\n\n*Source: WHO, Digital transformation handbook for health supply chain "
        f"architecture, 2024, PDF page {n}; rendered from the PDF's vector layer in the L1 entry.*\n", encoding="utf-8")
    (d / f"{root}.ts").write_text(
        'import { figure } from "../../schema/builders";\n\n'
        "export default figure({\n"
        f"  label: {ts_str('fig:' + nums)},\n"
        f"  file: {ts_str('media/' + src.name)},\n"
        f"  caption: {ts_str(caption)},\n"
        f"  page: {n},\n"
        f"  meta: {json.dumps(meta, ensure_ascii=False)},\n"
        "});\n", encoding="utf-8")
    return [root]


def ts_str(s):
    return json.dumps(s, ensure_ascii=False)


def main(argv):
    force = "--force" in argv
    pdf = None
    if "--pdf" in argv:
        i = argv.index("--pdf")
        pdf_path = argv[i + 1]
        argv = argv[:i] + argv[i + 2:]
        import hashlib
        import pdfplumber
        import pdf_tables
        digest = hashlib.sha256(Path(pdf_path).read_bytes()).hexdigest()
        if not digest.startswith(pdf_tables.PDF_SHA256_PREFIX):
            sys.exit(f"{pdf_path} is not the PDF the L1 entry was made from (sha256 {digest[:16]})")
        pdf = pdfplumber.open(pdf_path)
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
                table = None
                if pdf is not None:
                    outside = pdf_tables.outside_text(pdf, n)
                    if outside is not None:
                        text = body_text(outside)
                    if n in pdf_tables.TABLES:
                        table = pdf_tables.TABLES[n]
                blocks += write_table(d, ch_dir, n, table, pdf, sec_title) if table and not text else []
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
                if n in FIGURES:
                    blocks += write_figure(d, ch_dir, n, l1, sec_title, ch_dir in SOURCE_ONLY)
                if table:
                    blocks += write_table(d, ch_dir, n, table, pdf, sec_title)
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
