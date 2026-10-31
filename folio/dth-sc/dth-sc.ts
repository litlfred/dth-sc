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
    status: "seeded from L1; structured tables (SC1b), 16 personas, 3 BPMN 2.0 business processes, 2 DMN 1.3 decision tables, and links to dth-sc / dpi-h-ra glossaries and dpi-h-ra ArchiMate 0.3.0-draft.1 views and elements (SC1b, SC2b, SC4, dth-sc#2)",
    figureViews: [
      { figure: "Figure 1", block: "folio/dth-sc/introduction/p-introduction-page-011.md", model: "0.3.0-draft.1", view: "id-2d524cffba25509e82684f47d624cc42", viewName: "Health Supply Chain Partners and Processes (DTH SC Figs. 1-3)" },
      { figure: "Figure 3", block: "folio/dth-sc/introduction/p-introduction-page-012.md", model: "0.3.0-draft.1", view: "id-2d524cffba25509e82684f47d624cc42", viewName: "Health Supply Chain Partners and Processes (DTH SC Figs. 1-3)" },
      { figure: "Figure 14", block: "folio/dth-sc/ch02-dhsc-architecture/f-ch02-fig-14.md", model: "0.3.0-draft.1", view: "id-92267636cc42566ca5d2cff0e81be8c9", viewName: "DHSC Architecture Framework (DTH SC Fig. 14)" },
      { figure: "Figure 24", block: "folio/dth-sc/ch04-traceability/f-ch04-fig-24.md", model: "0.3.0-draft.1", view: "id-bea56e01c8345fbc803dee47a17ccfd3", viewName: "Track and Trace through DHSC Components (DTH SC Fig. 24)" },
    ],
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
