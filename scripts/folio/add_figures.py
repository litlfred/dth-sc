#!/usr/bin/env python3
"""Place figures the L1 entry renders later into the hand-edited folio.

    python3 -I scripts/folio/add_figures.py <l1-entry-dir> <page> [<page> ...]

seed_from_l1.py writes figure blocks only when it seeds the folio, and
re-running it discards hand edits. This writes the figure block for each
given page (from seed_from_l1.FIGURES, by the same write_figure) and inserts
it into its chapter manifest right after the page's prose block. A page
whose figure block is already listed is skipped.
"""

import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import seed_from_l1 as seed  # noqa: E402


def main(argv):
    l1, pages = Path(argv[0]), [int(a) for a in argv[1:]]
    for n in pages:
        if n not in seed.FIGURES:
            sys.exit(f"page {n} is not in seed_from_l1.FIGURES")
        page_root = None
        for manifest in sorted(seed.FOLIO.glob("*/*.ts")):
            if manifest.stem != manifest.parent.name:
                continue
            text = manifest.read_text(encoding="utf-8")
            m = re.search(r'"(p-[a-z0-9-]+-page-%03d)"' % n, text)
            if m:
                page_root = m.group(1)
                break
        if not page_root:
            sys.exit(f"no prose block for page {n} in any chapter manifest")
        ch_dir = manifest.parent.name
        nums = "-".join(str(k) for k, _ in seed.FIGURES[n])
        root = f"f-{ch_dir.split('-')[0]}-fig-{nums}"
        if f'"{root}"' in text:
            print(f"page {n}: {root} already placed")
            continue
        sec = re.findall(r'title: ("(?:[^"\\]|\\.)*"),\s*\n\s*label: "sec:[^"]*",\s*\n\s*blocks: \[[^\]]*"%s"' % re.escape(page_root), text)
        sec_title = sec[0][1:-1] if sec else ""
        seed.write_figure(manifest.parent, ch_dir, n, l1, sec_title, ch_dir in seed.SOURCE_ONLY)
        text = text.replace(f'"{page_root}"', f'"{page_root}", "{root}"', 1)
        manifest.write_text(text, encoding="utf-8")
        print(f"page {n}: placed {root} after {page_root} in {manifest}")


if __name__ == "__main__":
    main(sys.argv[1:])
