"""The handbook's tables, rebuilt from the PDF (workplan gap G2).

The L1 entry's page text flattens every table into one run of words, so a
reader cannot tell which cell a sentence came from. This module reads the
same PDF the L1 entry was made from (who-iris/uploads/9789240101197-eng/,
sha256 cd157b40eef5..., the hash the L1 entry records) with pdfplumber and
returns each table as rows of cells, plus the page's text OUTSIDE the table,
so the page's prose block no longer repeats the table's words.

Used by seed_from_l1.py when it is given --pdf. Needs `pip install pdfplumber`.

Where the PDF draws something the text layer does not hold, it is said so
in the table and never guessed:
  - the rotated group labels down the left of Tables 2 and 3 are read from
    the PDF by eye and written here (GROUPS);
  - Annex 7 marks the phases a role is needed in with a drawn check mark,
    not a character; a cell with drawn marks is written "✓".
"""

import re

PDF_SHA256_PREFIX = "cd157b40eef513c1"

# Rotated row-group labels, read from the PDF (the text layer has them reversed).
GROUPS = {
    46: {109: "Enabling environment", 546: "ICT environment"},
    50: {100: "Ongoing costs", 211: "Upfront implementation costs",
         492: "Upfront scaling costs", 605: "Operations costs"},
}

TABLES = {
    7: dict(label="tbl:abbreviations", caption="Abbreviations and acronyms",
            header=["Abbreviation", "Meaning"]),
    18: dict(label="tbl:1", caption="Table 1. Summary of chapters 1–4"),
    46: dict(label="tbl:2", caption="Table 2. Illustrative implementation considerations for the DHSC"),
    50: dict(label="tbl:3", caption="Table 3. Illustrative cost drivers of DHSC implementation"),
    68: dict(label="tbl:annex-3", caption="Annex 3. Template for prioritizing DHSC challenges to address"),
    70: dict(label="tbl:annex-5", caption="Annex 5. Template for listing health supply chain information systems (with the handbook's illustrative entries)"),
    71: dict(label="tbl:annex-6", caption="Annex 6. Risk register template"),
    72: dict(label="tbl:annex-7", caption="Annex 7. Resource matrix for DHSC implementation", pages=[72, 73, 74, 75, 76]),
}
# Pages whose text around the table is set in two columns: read each column in turn.
TWO_COLUMNS = {18}
# Pages where the table is all there is (its title is the caption).
TABLE_ONLY = {7}
# Pages whose table continues the one started on an earlier page.
CONTINUES = {73: 72, 74: 72, 75: 72, 76: 72}


def clean(s):
    if not s:
        return ""
    s = re.sub(r"-\n(?=[a-z])", "", s)          # word broken across lines
    s = re.sub(r"\s*\n\s*(?=[»•])", "<br>", s)   # a bullet starts a new line
    s = re.sub(r"\s*\n\s*", " ", s)
    s = s.replace("»", "•").replace("|", "\\|")
    s = re.sub(r"(?:<br>)?•\s*(?=<br>|$)", "", s)   # a bullet with nothing after it
    s = re.sub(r"^(?:<br>)+|(?:<br>)+$", "", s.strip())
    return re.sub(r"[ \t]+", " ", s).strip()


def _crop_text(page, x0, top, x1, bottom):
    return clean(page.crop((x0, top, x1, bottom)).extract_text() or "")


def _largest(page):
    ts = page.find_tables()
    return max(ts, key=lambda t: (t.bbox[2] - t.bbox[0]) * (t.bbox[3] - t.bbox[1])) if ts else None


def _table_1(page):
    # Header row is detected; the body has no ruling, so cut it by the
    # "Chapter N." labels down the left and the header's column edges.
    t = _largest(page)
    xs = [c[0] for c in t.rows[0].cells] + [t.rows[0].cells[-1][2]]
    left = 36
    tops = sorted(w["top"] for w in page.extract_words()
                  if w["text"] == "Chapter" and w["x0"] < xs[0] and w["top"] > t.bbox[3])
    # The running footer (page number, handbook title) sits below y = 800.
    bottom = max(w["bottom"] for w in page.extract_words() if tops[0] < w["top"] < 800)
    rows = [["Chapter"] + [clean(c) for c in t.extract()[0]]]
    for i, top in enumerate(tops):
        b = tops[i + 1] - 1 if i + 1 < len(tops) else bottom + 1
        edges = [left] + xs
        rows.append([_crop_text(page, edges[k], top - 2, edges[k + 1], b) for k in range(4)])
    return rows, (left, t.bbox[1], t.bbox[2], bottom + 2)


def _grouped(page, n, header):
    # Tables 2 and 3: a rotated group column, a factor column, then data columns.
    t = _largest(page)
    groups = GROUPS[n]
    body = [r for r in t.rows if r.cells[1] and r.cells[1][1] >= min(groups)]
    data_x = sorted({c[0] for r in t.rows for c in r.cells[2:] if c} | {t.bbox[2]})
    if n == 50:
        data_x = [165, t.bbox[2]]
    rows = [header]
    group = ""
    for r in body:
        top, bottom = r.cells[1][1], r.cells[1][3]
        for gtop, name in groups.items():
            if abs(top - gtop) < 2:
                group = name
        cells = [group, _crop_text(page, r.cells[1][0], top, r.cells[1][2], bottom)]
        cells += [_crop_text(page, data_x[k], top, data_x[k + 1], bottom) for k in range(len(data_x) - 1)]
        rows.append(cells)
    return rows, t.bbox


def _annex_7(pdf, pages):
    rows = None
    for n in pages:
        page = pdf.pages[n - 1]
        t = _largest(page)
        if rows is None:
            rows = [["Role category", "Role", "Needed in deployment", "Needed in operation",
                     "Position type", "Skill sets", "Responsibilities"]]
        for r in t.rows[2:]:
            cells = []
            for k, c in enumerate(r.cells):
                if c is None:
                    cells.append("")
                elif k in (2, 3):
                    marks = page.crop(c).curves
                    cells.append("✓" if marks else "")
                else:
                    cells.append(_crop_text(page, *c))
            rows.append(cells)
    bbox = _largest(pdf.pages[pages[0] - 1]).bbox
    return rows, bbox


def table_rows(pdf, n):
    """(rows, bbox on page n) for the table starting on PDF page n."""
    page = pdf.pages[n - 1]
    spec = TABLES[n]
    if n == 18:
        return _table_1(page)
    if n == 46:
        return _grouped(page, n, ["Area", "Factor", "What is the current state?", "What is needed?"])
    if n == 50:
        return _grouped(page, n, ["Cost type", "Cost category", "Cost drivers"])
    if n == 72:
        return _annex_7(pdf, spec["pages"])
    t = _largest(page)
    raw = t.extract()
    rows = [[clean(c) for c in r] for r in raw]
    if spec.get("header"):
        rows = [spec["header"]] + rows
    rows = [r for r in rows if any(r)]
    if n == 70:
        # The last rows are the colour legend (NPC mobile app / In progress /
        # Deployed): the status colours are not in the text layer, so the
        # legend is dropped; the second "Regulatory" line joins its row.
        legend = [i for i, r in enumerate(rows) if r[2] in ("In progress", "Deployed")]
        rows = rows[:legend[0]] if legend else rows
        for i in range(len(rows) - 1, 0, -1):
            if not rows[i][0]:
                rows[i - 1] = [a + ("<br>" + b if a and b else b) for a, b in zip(rows[i - 1], rows[i])]
                del rows[i]
    return rows, t.bbox


def outside_text(pdf, n):
    """The page's text with its table cut out, or None if the page has no table here."""
    if n not in TABLES and n not in CONTINUES:
        return None
    page = pdf.pages[n - 1]
    if n in TABLES:
        _, bbox = table_rows(pdf, n)
    else:
        bbox = _largest(page).bbox
    if n in TABLE_ONLY:
        return ""
    x0, top, x1, bottom = bbox
    mid = page.width / 2
    pieces = []
    for y0, y1 in ((0, top), (bottom, page.height)):
        if y1 <= y0:
            continue
        cols = [(0, mid), (mid, page.width)] if n in TWO_COLUMNS else [(0, page.width)]
        for c0, c1 in cols:
            pieces.append(page.crop((c0, y0, c1, y1)).extract_text() or "")
    return "\n".join(pieces)


def markdown(rows, caption):
    width = max(len(r) for r in rows)
    rows = [r + [""] * (width - len(r)) for r in rows]
    out = [f"*{caption}*", "", "| " + " | ".join(f"**{c}**" if c else "" for c in rows[0]) + " |",
           "| " + " | ".join("---" for _ in rows[0]) + " |"]
    out += ["| " + " | ".join(r) + " |" for r in rows[1:]]
    return "\n".join(out) + "\n"
