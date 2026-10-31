import { paper, chapterRef } from "../schema/builders";

/**
 * Digital Transformation Handbook for Health Supply Chain Architecture
 *
 * The document manifest. `chapters` is an ORDERED list: its order is the
 * reading order, and it is the only place that order is recorded.
 *
 * Seeded from the L1 entry who-iris/library/9789240101197-eng by
 * scripts/folio/seed_from_l1.py; edited by hand from then on.
 */
export default paper({
  title: "Digital Transformation Handbook for Health Supply Chain Architecture",
  authors: ["World Health Organization"],
  date: "2024",
  meta: {
    documentKind: "smart-base:dth",
    level: "L1",
    targetLevel: "L2",
    isbn: "9789240101197",
    source: { library: "9789240101197-eng", repository: "litlfred/who-iris" },
    licence: "CC BY-NC-SA 3.0 IGO",
    status: "seeded from L1; not yet linked to the glossary or ArchiMate",
  },
  chapters: [
    chapterRef({ dir: "front-matter" }),
    chapterRef({ dir: "introduction" }),
    chapterRef({ dir: "ch01-dhsc-strategy" }),
    chapterRef({ dir: "ch02-dhsc-architecture" }),
    chapterRef({ dir: "ch03-implementation-and-operations" }),
    chapterRef({ dir: "ch04-traceability" }),
    chapterRef({ dir: "ch05-country-examples" }),
    chapterRef({ dir: "references" }),
    chapterRef({ dir: "annexes" }),
  ],
});
