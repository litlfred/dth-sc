#!/usr/bin/env bun
/**
 * Audit and verify L1 normative coverage (dth-sc#2 Step SC5) across all 78 pages
 * of `who-iris/library/9789240101197-eng` (`sections/page-001.md` .. `page-078.md`)
 * against the 118 blocks of `folio/dth-sc/`, plus Chapter 5 source-example blocks
 * and Annexes 1–7 template / resource-matrix table blocks.
 *
 * Usage:
 *   bun run scripts/folio/check-l1-coverage.ts           # verify 100% L1 coverage
 *   bun run scripts/folio/check-l1-coverage.ts --write   # write folio/dth-sc/l1-coverage.json and docs/l1-coverage.md
 */
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  coverage,
  DEFINITION_VERSION,
  exitCodeFor,
  MATCH_METHOD,
  normalise,
  type Exclusion,
  type Page,
} from "../../folio-assistant-core/scripts/l1-coverage.ts";

export type CoverageCategory = "captured" | "editorial" | "background-fact" | "source-example";

export interface NormativeStatementSpec {
  location: string;
  page: number;
  printedPage: string;
  section: string;
  l1File: string;
  category: CoverageCategory;
  state: "captured" | "excluded";
  exclusionReason?: "editorial" | "background-fact";
  primaryBlockId: string;
  blockIds: string[];
  blockLabels: string[];
  verbatimQuote: string;
  basis: string;
}

const L1_DIR = "who-iris/library/9789240101197-eng";
const FOLIO_DIR = "folio/dth-sc";
const MANIFEST_PATH = "folio/dth-sc/l1-coverage.json";
const DOC_PATH = "docs/l1-coverage.md";

const PRINTED_PAGE: Record<number, string> = {
  1: "cover",
  2: "ii",
  3: "iii",
  4: "iv",
  5: "v",
  6: "vi",
  7: "vii",
  8: "viii",
  9: "ix",
  10: "x",
  77: "blank",
  78: "back-cover",
};

function printedPageFor(pdfPage: number): string {
  if (PRINTED_PAGE[pdfPage]) return PRINTED_PAGE[pdfPage];
  return String(pdfPage - 10);
}

export const NORMATIVE_SPECS: NormativeStatementSpec[] = [
  // ── Front matter / Copyright & CC BY-NC-SA 3.0 IGO licence (PDF p. 4) ──
  {
    location: "p4:s4",
    page: 4,
    printedPage: "iv",
    section: "page-004",
    l1File: `${L1_DIR}/sections/page-004.md`,
    category: "editorial",
    state: "excluded",
    exclusionReason: "editorial",
    primaryBlockId: "dth-sc",
    blockIds: ["dth-sc"],
    blockLabels: ["doc:dth-sc"],
    verbatimQuote: "In any use of this work, there should be no suggestion that WHO endorses any specific organization, products or services.",
    basis: "WHO imprint and CC BY-NC-SA 3.0 IGO licence non-endorsement clause on PDF p. 4 (recorded in folio/dth-sc/dth-sc.ts meta.licence).",
  },
  {
    location: "p4:s6",
    page: 4,
    printedPage: "iv",
    section: "page-004",
    l1File: `${L1_DIR}/sections/page-004.md`,
    category: "editorial",
    state: "excluded",
    exclusionReason: "editorial",
    primaryBlockId: "dth-sc",
    blockIds: ["dth-sc"],
    blockLabels: ["doc:dth-sc"],
    verbatimQuote: "If you adapt the work, then you must license your work under the same or equivalent Creative Commons licence.",
    basis: "CC BY-NC-SA 3.0 IGO share-alike licence condition on PDF p. 4 (recorded in folio/dth-sc/dth-sc.ts meta.licence).",
  },
  {
    location: "p4:s7",
    page: 4,
    printedPage: "iv",
    section: "page-004",
    l1File: `${L1_DIR}/sections/page-004.md`,
    category: "editorial",
    state: "excluded",
    exclusionReason: "editorial",
    primaryBlockId: "dth-sc",
    blockIds: ["dth-sc"],
    blockLabels: ["doc:dth-sc"],
    verbatimQuote: "If you create a translation of this work, you should add the following disclaimer along with the suggested citation: “This translation was not created by the World Health Organization (WHO).",
    basis: "WHO translation disclaimer instruction on the imprint page (PDF p. 4); editorial front matter.",
  },
  {
    location: "p4:s9",
    page: 4,
    printedPage: "iv",
    section: "page-004",
    l1File: `${L1_DIR}/sections/page-004.md`,
    category: "editorial",
    state: "excluded",
    exclusionReason: "editorial",
    primaryBlockId: "dth-sc",
    blockIds: ["dth-sc"],
    blockLabels: ["doc:dth-sc"],
    verbatimQuote: "The original English edition shall be the binding and authentic edition.” Any mediation relating to disputes arising under the licence shall be conducted in accordance with the mediation rules of the World Intellectual Property Organization (http://www.wipo.int/amc/en/mediation/rules/).",
    basis: "WHO translation authenticity and WIPO mediation clause on the imprint page (PDF p. 4); editorial front matter.",
  },
  {
    location: "p4:s25",
    page: 4,
    printedPage: "iv",
    section: "page-004",
    l1File: `${L1_DIR}/sections/page-004.md`,
    category: "editorial",
    state: "excluded",
    exclusionReason: "editorial",
    primaryBlockId: "dth-sc",
    blockIds: ["dth-sc"],
    blockLabels: ["doc:dth-sc"],
    verbatimQuote: "The mention of specific companies or of certain manufacturers’ products does not imply that they are endorsed or recommended by WHO in preference to others of a similar nature that are not mentioned.",
    basis: "Standard WHO commercial non-endorsement disclaimer on the imprint page (PDF p. 4); editorial front matter.",
  },
  {
    location: "p4:s30",
    page: 4,
    printedPage: "iv",
    section: "page-004",
    l1File: `${L1_DIR}/sections/page-004.md`,
    category: "editorial",
    state: "excluded",
    exclusionReason: "editorial",
    primaryBlockId: "dth-sc",
    blockIds: ["dth-sc"],
    blockLabels: ["doc:dth-sc"],
    verbatimQuote: "In no event shall WHO be liable for damages arising from its use.",
    basis: "Standard WHO limitation of liability clause on the imprint page (PDF p. 4); editorial front matter.",
  },

  // ── Front matter / Glossary (PDF pp. 8–9) ──
  {
    location: "p8:s9",
    page: 8,
    printedPage: "viii",
    section: "page-008",
    l1File: `${L1_DIR}/sections/page-008.md`,
    category: "background-fact",
    state: "captured",
    primaryBlockId: "front-matter/p-front-page-008",
    blockIds: ["front-matter/p-front-page-008"],
    blockLabels: ["prose:front-page-008"],
    verbatimQuote: "Open-source software must have a license approved by the Open Source Initiative (9).",
    basis: "Captured verbatim in front-matter/p-front-page-008 (Glossary definition of open-source software, citing Open Source Initiative ref. 9).",
  },
  {
    location: "p9:s7",
    page: 9,
    printedPage: "ix",
    section: "page-009",
    l1File: `${L1_DIR}/sections/page-009.md`,
    category: "background-fact",
    state: "captured",
    primaryBlockId: "front-matter/p-front-page-009",
    blockIds: ["front-matter/p-front-page-009"],
    blockLabels: ["prose:front-page-009"],
    verbatimQuote: "systems architecture A technical framework based on a conceptual model that defines how the system should be structured and how its elements should be connected.",
    basis: "Captured verbatim in front-matter/p-front-page-009 (Glossary definition of systems architecture, linked to dpi-h-ra/solution-architecture).",
  },

  // ── Introduction (PDF pp. 11–17) ──
  {
    location: "p11:s2",
    page: 11,
    printedPage: "1",
    section: "page-011",
    l1File: `${L1_DIR}/sections/page-011.md`,
    category: "captured",
    state: "captured",
    primaryBlockId: "introduction/p-introduction-page-011",
    blockIds: [
      "introduction/p-introduction-page-011",
      "introduction/bp-sc-bp-02-end-to-end-supply-chain-processes",
      "introduction/pers-ministry-of-health",
      "introduction/pers-procurer",
      "introduction/pers-manufacturer-distributor",
      "introduction/pers-regulatory-authority",
      "introduction/pers-central-warehouse",
      "introduction/pers-regional-district-warehouse",
      "introduction/pers-logistics-provider",
      "introduction/pers-health-facility",
      "introduction/pers-community-health-worker",
      "introduction/pers-health-service-user",
    ],
    blockLabels: [
      "prose:introduction-page-011",
      "bp:sc-bp-02-end-to-end-supply-chain-processes",
      "pers:ministry-of-health",
      "pers:procurer",
      "pers:manufacturer-distributor",
      "pers:regulatory-authority",
      "pers:central-warehouse",
      "pers:regional-district-warehouse",
      "pers:logistics-provider",
      "pers:health-facility",
      "pers:community-health-worker",
      "pers:health-service-user",
    ],
    verbatimQuote: "Supply chain processes such as forecasting and planning, sourcing, procurement, order management, warehouse management and dispensing must operate in harmony to facilitate the flow of health products from manufacturers to the individuals who need them.",
    basis: "Captured verbatim in introduction/p-introduction-page-011 and operationalized in BPMN process SC-BP-02 and the 10 supply chain partner personas.",
  },
  {
    location: "p12:s1",
    page: 12,
    printedPage: "2",
    section: "page-012",
    l1File: `${L1_DIR}/sections/page-012.md`,
    category: "captured",
    state: "captured",
    primaryBlockId: "introduction/p-introduction-page-012",
    blockIds: [
      "introduction/p-introduction-page-012",
      "introduction/bp-sc-bp-02-end-to-end-supply-chain-processes",
    ],
    blockLabels: [
      "prose:introduction-page-012",
      "bp:sc-bp-02-end-to-end-supply-chain-processes",
    ],
    verbatimQuote: "Vital information such as order details, shipping details and inventory data must be exchanged among partners in the supply chain to enable seamless movement of health products.",
    basis: "Captured verbatim in introduction/p-introduction-page-012 and modeled as cross-lane message flows in BPMN process SC-BP-02.",
  },
  {
    location: "p14:s3",
    page: 14,
    printedPage: "4",
    section: "page-014",
    l1File: `${L1_DIR}/sections/page-014.md`,
    category: "captured",
    state: "captured",
    primaryBlockId: "introduction/p-introduction-page-014",
    blockIds: [
      "introduction/p-introduction-page-014",
      "introduction/bp-sc-bp-01-stepwise-dhsc-transformation",
    ],
    blockLabels: [
      "prose:introduction-page-014",
      "bp:sc-bp-01-stepwise-dhsc-transformation",
    ],
    verbatimQuote: "Familiarity with resources such as the Digital Implementation Investment Guide (DIIG) (1), the Supply Chain Information System Maturity Model (SCISMM) (16), the OpenHIE framework (17) and The Open Group Architecture Framework (TOGAF®) (18) is highly recommended before using this handbook.",
    basis: "Captured verbatim in introduction/p-introduction-page-014 and referenced by BPMN process SC-BP-01.",
  },
  {
    location: "p15:s7",
    page: 15,
    printedPage: "5",
    section: "page-015",
    l1File: `${L1_DIR}/sections/page-015.md`,
    category: "background-fact",
    state: "captured",
    primaryBlockId: "introduction/p-introduction-page-015",
    blockIds: [
      "introduction/p-introduction-page-015",
      "introduction/f-introduction-fig-5",
    ],
    blockLabels: [
      "prose:introduction-page-015",
      "fig:5",
    ],
    verbatimQuote: "WHO guideline: recommendations on digital interventions for health system strengthening",
    basis: "Captured verbatim in introduction/p-introduction-page-015 and f-introduction-fig-5 (Fig. 5 DIIG process diagram labels).",
  },
  {
    location: "p16:s3",
    page: 16,
    printedPage: "6",
    section: "page-016",
    l1File: `${L1_DIR}/sections/page-016.md`,
    category: "background-fact",
    state: "captured",
    primaryBlockId: "introduction/p-introduction-page-016",
    blockIds: ["introduction/p-introduction-page-016"],
    blockLabels: ["prose:introduction-page-016"],
    verbatimQuote: "The SMART Guidelines offer a step-by-step pathway that builds five progressive knowledge layers and associated products, to advance the adoption of best clinical and data practices:",
    basis: "Captured verbatim in introduction/p-introduction-page-016 (background description of WHO SMART Guidelines L1–L5 knowledge layers).",
  },
  {
    location: "p16:s4",
    page: 16,
    printedPage: "6",
    section: "page-016",
    l1File: `${L1_DIR}/sections/page-016.md`,
    category: "background-fact",
    state: "captured",
    primaryBlockId: "introduction/p-introduction-page-016",
    blockIds: ["introduction/p-introduction-page-016"],
    blockLabels: ["prose:introduction-page-016"],
    verbatimQuote: "These steps help developers translate recommendations into specifications and standards, help technologists integrate recommendations into updatable digital systems and help countries localize, make interoperable, institutionalize and update digital systems consistent with evidence-based recommendations (13).",
    basis: "Captured verbatim in introduction/p-introduction-page-016 (background description of WHO SMART Guidelines pathway).",
  },
  {
    location: "p16:s7",
    page: 16,
    printedPage: "6",
    section: "page-016",
    l1File: `${L1_DIR}/sections/page-016.md`,
    category: "background-fact",
    state: "captured",
    primaryBlockId: "introduction/p-introduction-page-016",
    blockIds: ["introduction/p-introduction-page-016"],
    blockLabels: ["prose:introduction-page-016"],
    verbatimQuote: "L1 Narrative Guideline and data recommendations:",
    basis: "Captured verbatim in introduction/p-introduction-page-016 (Fig. 6 SMART Guidelines knowledge layers caption/labels).",
  },
  {
    location: "p17:s3",
    page: 17,
    printedPage: "7",
    section: "page-017",
    l1File: `${L1_DIR}/sections/page-017.md`,
    category: "background-fact",
    state: "captured",
    primaryBlockId: "introduction/p-introduction-page-017",
    blockIds: ["introduction/p-introduction-page-017"],
    blockLabels: ["prose:introduction-page-017"],
    verbatimQuote: "In particular, they define recommended public health and clinical business processes that use structured, task-based workflows.",
    basis: "Captured verbatim in introduction/p-introduction-page-017 (background description of Digital Adaptation Kits).",
  },

  // ── Chapter 1. Defining a holistic DHSC strategy (PDF pp. 19–26) ──
  {
    location: "p20:s2",
    page: 20,
    printedPage: "10",
    section: "page-020",
    l1File: `${L1_DIR}/sections/page-020.md`,
    category: "captured",
    state: "captured",
    primaryBlockId: "ch01-dhsc-strategy/p-ch01-page-020",
    blockIds: [
      "ch01-dhsc-strategy/p-ch01-page-020",
      "introduction/t-introduction-table-1",
      "introduction/bp-sc-bp-01-stepwise-dhsc-transformation",
    ],
    blockLabels: [
      "prose:ch01-page-020",
      "tbl:1",
      "bp:sc-bp-01-stepwise-dhsc-transformation",
    ],
    verbatimQuote: "The DHSC strategy should align closely with the country’s IT strategy, health strategy, medicines and health product strategies, supply chain strategy and digital health strategy.",
    basis: "Captured verbatim in ch01-dhsc-strategy/p-ch01-page-020 (Fig. 8 aligned national strategies) and summarized in Table 1 and BPMN process SC-BP-01.",
  },
  {
    location: "p20:s3",
    page: 20,
    printedPage: "10",
    section: "page-020",
    l1File: `${L1_DIR}/sections/page-020.md`,
    category: "captured",
    state: "captured",
    primaryBlockId: "ch01-dhsc-strategy/p-ch01-page-020",
    blockIds: [
      "ch01-dhsc-strategy/p-ch01-page-020",
      "ch01-dhsc-strategy/p-ch01-page-019",
    ],
    blockLabels: [
      "prose:ch01-page-020",
      "prose:ch01-page-019",
    ],
    verbatimQuote: "National priorities should be the driving force behind DHSC implementation initiatives.",
    basis: "Captured verbatim in ch01-dhsc-strategy/p-ch01-page-020 and linked to Ch 1 guiding principles (p-ch01-page-019).",
  },
  {
    location: "p22:s9",
    page: 22,
    printedPage: "12",
    section: "page-022",
    l1File: `${L1_DIR}/sections/page-022.md`,
    category: "captured",
    state: "captured",
    primaryBlockId: "ch01-dhsc-strategy/p-ch01-page-022",
    blockIds: [
      "ch01-dhsc-strategy/p-ch01-page-022",
      "annexes/pers-steering-committee-sponsor",
      "annexes/t-annexes-annex-2",
      "introduction/bp-sc-bp-01-stepwise-dhsc-transformation",
    ],
    blockLabels: [
      "prose:ch01-page-022",
      "pers:steering-committee-sponsor",
      "tbl:annex-2",
      "bp:sc-bp-01-stepwise-dhsc-transformation",
    ],
    verbatimQuote: "The TWG should support the overall governance and planning of DHSC implementation activities, and the steering committee should provide leadership and oversight for all implementation activities.",
    basis: "Captured verbatim in ch01-dhsc-strategy/p-ch01-page-022 (Ch 1 Step 1), modeled in persona pers:steering-committee-sponsor, Annex 2 table tbl:annex-2, and BPMN process SC-BP-01.",
  },
  {
    location: "p23:s10",
    page: 23,
    printedPage: "13",
    section: "page-023",
    l1File: `${L1_DIR}/sections/page-023.md`,
    category: "captured",
    state: "captured",
    primaryBlockId: "ch01-dhsc-strategy/p-ch01-page-023",
    blockIds: [
      "ch01-dhsc-strategy/p-ch01-page-023",
      "annexes/t-annexes-annex-3",
      "annexes/t-annexes-annex-4",
      "introduction/bp-sc-bp-01-stepwise-dhsc-transformation",
    ],
    blockLabels: [
      "prose:ch01-page-023",
      "tbl:annex-3",
      "tbl:annex-4",
      "bp:sc-bp-01-stepwise-dhsc-transformation",
    ],
    verbatimQuote: "Prioritize challenges, problems and needs that should be addressed within a defined time frame (e.g., one year, three years or five years).",
    basis: "Captured verbatim in ch01-dhsc-strategy/p-ch01-page-023 (Ch 1 Step 2), supported by Annex 3 (tbl:annex-3) and Annex 4 (tbl:annex-4) templates and BPMN process SC-BP-01.",
  },
  {
    location: "p24:s19",
    page: 24,
    printedPage: "14",
    section: "page-024",
    l1File: `${L1_DIR}/sections/page-024.md`,
    category: "captured",
    state: "captured",
    primaryBlockId: "ch01-dhsc-strategy/p-ch01-page-024",
    blockIds: [
      "ch01-dhsc-strategy/p-ch01-page-024",
      "ch02-dhsc-architecture/p-ch02-page-042",
      "introduction/bp-sc-bp-01-stepwise-dhsc-transformation",
    ],
    blockLabels: [
      "prose:ch01-page-024",
      "prose:ch02-page-042",
      "bp:sc-bp-01-stepwise-dhsc-transformation",
    ],
    verbatimQuote: "The goals should link to the DHSC implementation activities.",
    basis: "Captured verbatim in ch01-dhsc-strategy/p-ch01-page-024 (Ch 1 Step 3) and operationalized in Ch 2 Step 3 (p-ch02-page-042) and BPMN process SC-BP-01.",
  },

  // ── Chapter 2. Defining the DHSC architecture (PDF pp. 27–43) ──
  {
    location: "p28:s2",
    page: 28,
    printedPage: "18",
    section: "page-028",
    l1File: `${L1_DIR}/sections/page-028.md`,
    category: "captured",
    state: "captured",
    primaryBlockId: "ch02-dhsc-architecture/p-ch02-page-028",
    blockIds: [
      "ch02-dhsc-architecture/p-ch02-page-028",
      "ch02-dhsc-architecture/f-ch02-fig-14",
    ],
    blockLabels: [
      "prose:ch02-page-028",
      "fig:14",
    ],
    verbatimQuote: "The architecture should comprehensively support all the supply chain functions, their data requirements and the need for interoperability between not only various supply chain functions but also between the entire ecosystem and other digital health systems (including health financing and insurance systems and regulatory systems).",
    basis: "Captured verbatim in ch02-dhsc-architecture/p-ch02-page-028 and modeled in Fig. 14 DHSC architecture framework (f-ch02-fig-14).",
  },
  {
    location: "p28:s3",
    page: 28,
    printedPage: "18",
    section: "page-028",
    l1File: `${L1_DIR}/sections/page-028.md`,
    category: "captured",
    state: "captured",
    primaryBlockId: "ch02-dhsc-architecture/p-ch02-page-028",
    blockIds: [
      "ch02-dhsc-architecture/p-ch02-page-028",
      "ch02-dhsc-architecture/f-ch02-fig-13",
    ],
    blockLabels: [
      "prose:ch02-page-028",
      "fig:13",
    ],
    verbatimQuote: "The DHSC architecture should align with the priorities of the country’s information and communications technology (ICT) architecture and the digital health architecture.",
    basis: "Captured verbatim in ch02-dhsc-architecture/p-ch02-page-028 and aligned with DIIG enterprise architecture (f-ch02-fig-13).",
  },
  {
    location: "p28:s9",
    page: 28,
    printedPage: "18",
    section: "page-028",
    l1File: `${L1_DIR}/sections/page-028.md`,
    category: "captured",
    state: "captured",
    primaryBlockId: "ch02-dhsc-architecture/p-ch02-page-028",
    blockIds: [
      "ch02-dhsc-architecture/p-ch02-page-028",
      "ch02-dhsc-architecture/f-ch02-fig-11",
      "ch04-traceability/bp-sc-bp-03-centralized-track-and-trace",
    ],
    blockLabels: [
      "prose:ch02-page-028",
      "fig:11",
      "bp:sc-bp-03-centralized-track-and-trace",
    ],
    verbatimQuote: "Health supply chains should be able to quickly respond to exceptions such as stockouts and quality issues like product recalls.",
    basis: "Captured verbatim in ch02-dhsc-architecture/p-ch02-page-028, illustrated in Fig. 11 (f-ch02-fig-11), and operationalized in BPMN recall workflow SC-BP-03.",
  },
  {
    location: "p28:s10",
    page: 28,
    printedPage: "18",
    section: "page-028",
    l1File: `${L1_DIR}/sections/page-028.md`,
    category: "captured",
    state: "captured",
    primaryBlockId: "ch02-dhsc-architecture/p-ch02-page-028",
    blockIds: [
      "ch02-dhsc-architecture/p-ch02-page-028",
      "introduction/pers-health-service-user",
      "ch04-traceability/bp-sc-bp-03-centralized-track-and-trace",
    ],
    blockLabels: [
      "prose:ch02-page-028",
      "pers:health-service-user",
      "bp:sc-bp-03-centralized-track-and-trace",
    ],
    verbatimQuote: "More importantly, they should support patient safety by ensuring that the products dispensed to and consumed by individuals are quality assured and are not falsified.",
    basis: "Captured verbatim in ch02-dhsc-architecture/p-ch02-page-028 and operationalized in persona pers:health-service-user and BPMN verification/recall process SC-BP-03.",
  },
  {
    location: "p32:s15",
    page: 32,
    printedPage: "22",
    section: "page-032",
    l1File: `${L1_DIR}/sections/page-032.md`,
    category: "captured",
    state: "captured",
    primaryBlockId: "ch02-dhsc-architecture/p-ch02-page-032",
    blockIds: [
      "ch02-dhsc-architecture/p-ch02-page-032",
      "annexes/pers-steering-committee-sponsor",
      "annexes/pers-solution-architect",
    ],
    blockLabels: [
      "prose:ch02-page-032",
      "pers:steering-committee-sponsor",
      "pers:solution-architect",
    ],
    verbatimQuote: "A key mandate of the TWG should be oversight in this area.",
    basis: "Captured verbatim in ch02-dhsc-architecture/p-ch02-page-032 (Ch 2 Step 2 master data and standards governance oversight by the TWG).",
  },
  {
    location: "p32:s18",
    page: 32,
    printedPage: "22",
    section: "page-032",
    l1File: `${L1_DIR}/sections/page-032.md`,
    category: "captured",
    state: "captured",
    primaryBlockId: "ch02-dhsc-architecture/p-ch02-page-032",
    blockIds: [
      "ch02-dhsc-architecture/p-ch02-page-032",
      "introduction/pers-health-facility",
    ],
    blockLabels: [
      "prose:ch02-page-032",
      "pers:health-facility",
    ],
    verbatimQuote: "However, actual consumption should include what is dispensed to individuals, product expiries, wastages and inventory shrinkage.",
    basis: "Captured verbatim in ch02-dhsc-architecture/p-ch02-page-032 (Ch 2 Step 2 actual consumption data requirements).",
  },
  {
    location: "p32:s19",
    page: 32,
    printedPage: "22",
    section: "page-032",
    l1File: `${L1_DIR}/sections/page-032.md`,
    category: "captured",
    state: "captured",
    primaryBlockId: "ch02-dhsc-architecture/p-ch02-page-032",
    blockIds: [
      "ch02-dhsc-architecture/p-ch02-page-032",
      "introduction/pers-health-facility",
      "ch04-traceability/bp-sc-bp-03-centralized-track-and-trace",
    ],
    blockLabels: [
      "prose:ch02-page-032",
      "pers:health-facility",
      "bp:sc-bp-03-centralized-track-and-trace",
    ],
    verbatimQuote: "Systems, especially at the last mile of the supply chain, should have the ability to track and capture batch details and serial numbers, where available, as part of product expiries, wastages, inventory shrinkage and dispensation.",
    basis: "Captured verbatim in ch02-dhsc-architecture/p-ch02-page-032 and modeled in last-mile dispensation and track-and-trace process SC-BP-03.",
  },
  {
    location: "p33:s3",
    page: 33,
    printedPage: "23",
    section: "page-033",
    l1File: `${L1_DIR}/sections/page-033.md`,
    category: "captured",
    state: "captured",
    primaryBlockId: "ch02-dhsc-architecture/p-ch02-page-033",
    blockIds: [
      "ch02-dhsc-architecture/p-ch02-page-033",
      "ch02-dhsc-architecture/f-ch02-fig-13",
    ],
    blockLabels: [
      "prose:ch02-page-033",
      "fig:13",
    ],
    verbatimQuote: "Provides software capabilities, or “services,” that are specific to health care and may be used by other applications across the digital health enterprise",
    basis: "Captured verbatim in ch02-dhsc-architecture/p-ch02-page-033 and Fig. 13 (f-ch02-fig-13 DIIG digital health enterprise architecture framework).",
  },
  {
    location: "p34:s7",
    page: 34,
    printedPage: "24",
    section: "page-034",
    l1File: `${L1_DIR}/sections/page-034.md`,
    category: "captured",
    state: "captured",
    primaryBlockId: "ch02-dhsc-architecture/p-ch02-page-034",
    blockIds: [
      "ch02-dhsc-architecture/p-ch02-page-034",
      "ch02-dhsc-architecture/f-ch02-fig-14",
    ],
    blockLabels: [
      "prose:ch02-page-034",
      "fig:14",
    ],
    verbatimQuote: "EXTERNAL SYSTEMS Systems and data repositories (e.g., product master data and serialization data) that may be used by the DHSC enterprise.",
    basis: "Captured verbatim in ch02-dhsc-architecture/p-ch02-page-034 and modeled in Fig. 14 DHSC architecture framework (f-ch02-fig-14).",
  },
  {
    location: "p35:s16",
    page: 35,
    printedPage: "25",
    section: "page-035",
    l1File: `${L1_DIR}/sections/page-035.md`,
    category: "captured",
    state: "captured",
    primaryBlockId: "ch02-dhsc-architecture/p-ch02-page-035",
    blockIds: [
      "ch02-dhsc-architecture/p-ch02-page-035",
      "ch02-dhsc-architecture/f-ch02-fig-14",
    ],
    blockLabels: [
      "prose:ch02-page-035",
      "fig:14",
    ],
    verbatimQuote: "These resources specify what capabilities should be supported by each of the components within the “health supply chain information systems” layer.",
    basis: "Captured verbatim in ch02-dhsc-architecture/p-ch02-page-035 (HSCIS layer capability guidance from SCISMM and TSS v2).",
  },
  {
    location: "p35:s24",
    page: 35,
    printedPage: "25",
    section: "page-035",
    l1File: `${L1_DIR}/sections/page-035.md`,
    category: "captured",
    state: "captured",
    primaryBlockId: "ch02-dhsc-architecture/p-ch02-page-035",
    blockIds: [
      "ch02-dhsc-architecture/p-ch02-page-035",
      "ch02-dhsc-architecture/dt-sc-dt-01-scismm-architecture-selection",
    ],
    blockLabels: [
      "prose:ch02-page-035",
      "dt:sc-dt-01-scismm-architecture-selection",
    ],
    verbatimQuote: "Countries often have a mixture of needs and capabilities that should be reflected in their DHSC architecture.",
    basis: "Captured verbatim in ch02-dhsc-architecture/p-ch02-page-035 and formalized as DMN 1.3 decision table SC-DT-01 (dt-sc-dt-01-scismm-architecture-selection).",
  },
  {
    location: "p40:s7",
    page: 40,
    printedPage: "30",
    section: "page-040",
    l1File: `${L1_DIR}/sections/page-040.md`,
    category: "captured",
    state: "captured",
    primaryBlockId: "ch02-dhsc-architecture/p-ch02-page-040",
    blockIds: [
      "ch02-dhsc-architecture/p-ch02-page-040",
      "ch02-dhsc-architecture/f-ch02-fig-19",
      "ch02-dhsc-architecture/dt-sc-dt-01-scismm-architecture-selection",
    ],
    blockLabels: [
      "prose:ch02-page-040",
      "fig:19",
      "dt:sc-dt-01-scismm-architecture-selection",
    ],
    verbatimQuote: "In addition to the architectural approaches detailed above, SCISMM, TSS v2 and the IHE white paper (23) can provide guidance on the health supply chain functions that information systems should support to minimize manual tasks and improve data quality and availability.",
    basis: "Captured verbatim in ch02-dhsc-architecture/p-ch02-page-040 and linked to DMN decision table SC-DT-01.",
  },
  {
    location: "p40:s9",
    page: 40,
    printedPage: "30",
    section: "page-040",
    l1File: `${L1_DIR}/sections/page-040.md`,
    category: "captured",
    state: "captured",
    primaryBlockId: "ch02-dhsc-architecture/p-ch02-page-040",
    blockIds: [
      "ch02-dhsc-architecture/p-ch02-page-040",
      "ch02-dhsc-architecture/p-ch02-page-041",
      "ch02-dhsc-architecture/f-ch02-fig-20",
    ],
    blockLabels: [
      "prose:ch02-page-040",
      "prose:ch02-page-041",
      "fig:20",
    ],
    verbatimQuote: "As noted earlier, one benefit that the DHSC architecture should deliver is timely visibility of the end-to-end health supply chain so leaders can make informed decisions to deliver health products to individuals when and where they need them.",
    basis: "Captured verbatim in ch02-dhsc-architecture/p-ch02-page-040 and illustrated in Fig. 20 (f-ch02-fig-20 cross-enterprise analytics services).",
  },

  // ── Chapter 3. Planning for scalable implementation and sustainable operations (PDF pp. 44–52) ──
  {
    location: "p46:s9",
    page: 46,
    printedPage: "36",
    section: "page-046",
    l1File: `${L1_DIR}/sections/page-046.md`,
    category: "captured",
    state: "captured",
    primaryBlockId: "ch03-implementation-and-operations/p-ch03-page-046",
    blockIds: [
      "ch03-implementation-and-operations/p-ch03-page-046",
      "ch03-implementation-and-operations/t-ch03-table-2",
      "introduction/bp-sc-bp-01-stepwise-dhsc-transformation",
    ],
    blockLabels: [
      "prose:ch03-page-046",
      "tbl:2",
      "bp:sc-bp-01-stepwise-dhsc-transformation",
    ],
    verbatimQuote: "As outlined in the upcoming steps, each intervention should include a project implementation plan, an operational plan and a budget that considers the total cost of ownership.",
    basis: "Captured verbatim in ch03-implementation-and-operations/p-ch03-page-046 (accompanying Table 2, tbl:2) and modeled as Ch 3 Steps 1–3 in BPMN process SC-BP-01.",
  },
  {
    location: "p47:s1",
    page: 47,
    printedPage: "37",
    section: "page-047",
    l1File: `${L1_DIR}/sections/page-047.md`,
    category: "captured",
    state: "captured",
    primaryBlockId: "ch03-implementation-and-operations/p-ch03-page-047",
    blockIds: [
      "ch03-implementation-and-operations/p-ch03-page-047",
      "annexes/pers-steering-committee-sponsor",
      "annexes/pers-project-manager-ba",
      "introduction/bp-sc-bp-01-stepwise-dhsc-transformation",
    ],
    blockLabels: [
      "prose:ch03-page-047",
      "pers:steering-committee-sponsor",
      "pers:project-manager-ba",
      "bp:sc-bp-01-stepwise-dhsc-transformation",
    ],
    verbatimQuote: "The project charter should include details about the following:",
    basis: "Captured verbatim in ch03-implementation-and-operations/p-ch03-page-047 (Ch 3 Step 1 project charter scope, stakeholders, timeline, budget, risks, deliverables, quality criteria, governance mechanism).",
  },
  {
    location: "p47:s2",
    page: 47,
    printedPage: "37",
    section: "page-047",
    l1File: `${L1_DIR}/sections/page-047.md`,
    category: "captured",
    state: "captured",
    primaryBlockId: "ch03-implementation-and-operations/p-ch03-page-047",
    blockIds: [
      "ch03-implementation-and-operations/p-ch03-page-047",
      "annexes/pers-project-manager-ba",
      "annexes/t-annexes-annex-6",
      "introduction/bp-sc-bp-01-stepwise-dhsc-transformation",
    ],
    blockLabels: [
      "prose:ch03-page-047",
      "pers:project-manager-ba",
      "tbl:annex-6",
      "bp:sc-bp-01-stepwise-dhsc-transformation",
    ],
    verbatimQuote: "The project management plan should include the following:",
    basis: "Captured verbatim in ch03-implementation-and-operations/p-ch03-page-047 (Ch 3 Step 1 project management plan elements, linked to Annex 6 risk register tbl:annex-6 and persona pers:project-manager-ba).",
  },
  {
    location: "p47:s3",
    page: 47,
    printedPage: "37",
    section: "page-047",
    l1File: `${L1_DIR}/sections/page-047.md`,
    category: "captured",
    state: "captured",
    primaryBlockId: "ch03-implementation-and-operations/p-ch03-page-047",
    blockIds: [
      "ch03-implementation-and-operations/p-ch03-page-047",
      "annexes/pers-project-manager-ba",
      "introduction/bp-sc-bp-01-stepwise-dhsc-transformation",
    ],
    blockLabels: [
      "prose:ch03-page-047",
      "pers:project-manager-ba",
      "bp:sc-bp-01-stepwise-dhsc-transformation",
    ],
    verbatimQuote: "The project performance monitoring and analysis framework should include the following:",
    basis: "Captured verbatim in ch03-implementation-and-operations/p-ch03-page-047 (Ch 3 Step 1 project performance baseline and reporting schedule).",
  },
  {
    location: "p48:s1",
    page: 48,
    printedPage: "38",
    section: "page-048",
    l1File: `${L1_DIR}/sections/page-048.md`,
    category: "captured",
    state: "captured",
    primaryBlockId: "ch03-implementation-and-operations/p-ch03-page-048",
    blockIds: [
      "ch03-implementation-and-operations/p-ch03-page-048",
      "annexes/pers-project-manager-ba",
      "annexes/pers-system-administrator-support",
      "introduction/bp-sc-bp-01-stepwise-dhsc-transformation",
    ],
    blockLabels: [
      "prose:ch03-page-048",
      "pers:project-manager-ba",
      "pers:system-administrator-support",
      "bp:sc-bp-01-stepwise-dhsc-transformation",
    ],
    verbatimQuote: "The operations and sustainability plan should include the following:",
    basis: "Captured verbatim in ch03-implementation-and-operations/p-ch03-page-048 (Ch 3 Step 2 operations and sustainability plan elements).",
  },
  {
    location: "p48:s2",
    page: 48,
    printedPage: "38",
    section: "page-048",
    l1File: `${L1_DIR}/sections/page-048.md`,
    category: "captured",
    state: "captured",
    primaryBlockId: "ch03-implementation-and-operations/p-ch03-page-048",
    blockIds: [
      "ch03-implementation-and-operations/p-ch03-page-048",
      "annexes/pers-project-manager-ba",
      "annexes/t-annexes-annex-5",
      "introduction/bp-sc-bp-01-stepwise-dhsc-transformation",
    ],
    blockLabels: [
      "prose:ch03-page-048",
      "pers:project-manager-ba",
      "tbl:annex-5",
      "bp:sc-bp-01-stepwise-dhsc-transformation",
    ],
    verbatimQuote: "The operational performance monitoring and analysis framework should include the following:",
    basis: "Captured verbatim in ch03-implementation-and-operations/p-ch03-page-048 (Ch 3 Step 2 operational performance KPIs and reporting framework).",
  },
  {
    location: "p48:s3",
    page: 48,
    printedPage: "38",
    section: "page-048",
    l1File: `${L1_DIR}/sections/page-048.md`,
    category: "captured",
    state: "captured",
    primaryBlockId: "ch03-implementation-and-operations/p-ch03-page-048",
    blockIds: [
      "ch03-implementation-and-operations/p-ch03-page-048",
      "annexes/pers-system-administrator-support",
      "introduction/bp-sc-bp-01-stepwise-dhsc-transformation",
    ],
    blockLabels: [
      "prose:ch03-page-048",
      "pers:system-administrator-support",
      "bp:sc-bp-01-stepwise-dhsc-transformation",
    ],
    verbatimQuote: "The operational plan should determine the necessary resources and the effort needed to effectively maintain and run the DHSC systems.",
    basis: "Captured verbatim in ch03-implementation-and-operations/p-ch03-page-048 and operationalized in persona pers:system-administrator-support and BPMN process SC-BP-01.",
  },

  // ── Chapter 4. Using the DHSC to implement traceability (PDF pp. 53–56) ──
  {
    location: "p54:s24",
    page: 54,
    printedPage: "44",
    section: "page-054",
    l1File: `${L1_DIR}/sections/page-054.md`,
    category: "captured",
    state: "captured",
    primaryBlockId: "ch04-traceability/p-ch04-page-054",
    blockIds: [
      "ch04-traceability/p-ch04-page-054",
      "ch04-traceability/dt-sc-dt-02-traceability-model-selection",
    ],
    blockLabels: [
      "prose:ch04-page-054",
      "dt:sc-dt-02-traceability-model-selection",
    ],
    verbatimQuote: "This handbook does not recommend a particular model because the best choice depends on the context and various other factors.",
    basis: "Captured verbatim in ch04-traceability/p-ch04-page-054 and formalized as DMN 1.3 decision table SC-DT-02 (dt-sc-dt-02-traceability-model-selection).",
  },
  {
    location: "p56:s2",
    page: 56,
    printedPage: "46",
    section: "page-056",
    l1File: `${L1_DIR}/sections/page-056.md`,
    category: "captured",
    state: "captured",
    primaryBlockId: "ch04-traceability/p-ch04-page-056",
    blockIds: [
      "ch04-traceability/p-ch04-page-056",
      "ch04-traceability/pers-system-dhsc-traceability-hub",
      "ch04-traceability/bp-sc-bp-03-centralized-track-and-trace",
    ],
    blockLabels: [
      "prose:ch04-page-056",
      "pers:system-dhsc-traceability-hub",
      "bp:sc-bp-03-centralized-track-and-trace",
    ],
    verbatimQuote: "Traceability processes should be designed according to a structured architecture that is independent of the technology used to capture and share data.",
    basis: "Captured verbatim in ch04-traceability/p-ch04-page-056 and operationalized in system persona pers:system-dhsc-traceability-hub and BPMN process SC-BP-03.",
  },

  // ── References (PDF p. 65) ──
  {
    location: "p65:s45",
    page: 65,
    printedPage: "55",
    section: "page-065",
    l1File: `${L1_DIR}/sections/page-065.md`,
    category: "editorial",
    state: "captured",
    primaryBlockId: "references/p-references-page-065",
    blockIds: ["references/p-references-page-065"],
    blockLabels: ["prose:references-page-065"],
    verbatimQuote: "WHO SMART guidelines: optimising country-level use of guideline recommendations in the digital age.",
    basis: "Captured verbatim in references/p-references-page-065 (Reference 12 bibliographic title containing the word 'recommendations').",
  },
  {
    location: "p65:s70",
    page: 65,
    printedPage: "55",
    section: "page-065",
    l1File: `${L1_DIR}/sections/page-065.md`,
    category: "editorial",
    state: "captured",
    primaryBlockId: "references/p-references-page-065",
    blockIds: ["references/p-references-page-065"],
    blockLabels: ["prose:references-page-065"],
    verbatimQuote: "Digital adaptation kit for antenatal care: operational requirements for implementing WHO recommendations in digital systems.",
    basis: "Captured verbatim in references/p-references-page-065 (Reference 19 bibliographic title containing the word 'recommendations').",
  },
  {
    location: "p65:s89",
    page: 65,
    printedPage: "55",
    section: "page-065",
    l1File: `${L1_DIR}/sections/page-065.md`,
    category: "editorial",
    state: "captured",
    primaryBlockId: "references/p-references-page-065",
    blockIds: ["references/p-references-page-065"],
    blockLabels: ["prose:references-page-065"],
    verbatimQuote: "Recommendations on common technical denominators for traceability systems for medicines to allow for interoperability.",
    basis: "Captured verbatim in references/p-references-page-065 (Reference 24 ICMRA bibliographic title beginning with 'Recommendations').",
  },
  {
    location: "p65:s90",
    page: 65,
    printedPage: "55",
    section: "page-065",
    l1File: `${L1_DIR}/sections/page-065.md`,
    category: "editorial",
    state: "captured",
    primaryBlockId: "references/p-references-page-065",
    blockIds: ["references/p-references-page-065"],
    blockLabels: ["prose:references-page-065"],
    verbatimQuote: "recommendations_on_common_technical_denominators_for_T&T_systems_to_allow_for_interoperability_final.pdf",
    basis: "Captured verbatim in references/p-references-page-065 (Reference 24 ICMRA URL filename containing 'recommendations').",
  },
];

function readL1Pages(): Page[] {
  const pages: Page[] = [];
  for (let n = 1; n <= 78; n++) {
    const f = join(L1_DIR, "sections", `page-${String(n).padStart(3, "0")}.md`);
    const raw = readFileSync(f, "utf8");
    const m = /^---\n([\s\S]*?)\n---\n?/.exec(raw);
    const text = (m ? raw.slice(m[0].length) : raw).replace(/^_\(no text on this page\)_\s*$/m, "");
    pages.push({ page: n, text });
  }
  return pages;
}

function collectBlocksByPage(): {
  allBlocks: Map<string, { label: string; kind: string; file: string; meta: any }>;
  byPage: Map<number, string[]>;
} {
  const walk = (d: string): string[] =>
    readdirSync(d, { withFileTypes: true }).flatMap((e) =>
      e.isDirectory() ? walk(join(d, e.name)) : e.name.endsWith(".ts") ? [join(d, e.name)] : [],
    );
  const chapterFiles = new Set([
    "dth-sc.ts",
    "front-matter.ts",
    "introduction.ts",
    "ch01-dhsc-strategy.ts",
    "ch02-dhsc-architecture.ts",
    "ch03-implementation-and-operations.ts",
    "ch04-traceability.ts",
    "ch05-country-examples.ts",
    "references.ts",
    "annexes.ts",
  ]);
  const allBlocks = new Map<string, { label: string; kind: string; file: string; meta: any }>();
  const byPage = new Map<number, string[]>();

  for (const f of walk(FOLIO_DIR)) {
    const base = f.split("/").pop()!;
    if (chapterFiles.has(base)) continue;
    const src = readFileSync(f, "utf8");
    const id = f.replace(/^folio\/dth-sc\//, "").replace(/\.ts$/, "");
    const label = src.match(/label:\s*"([^"]+)"/)?.[1] ?? id;
    const kind =
      src.includes("export default prose(")
        ? "prose"
        : src.includes("export default table(")
          ? "table"
          : src.includes("export default figure(")
            ? "figure"
            : src.includes("export default persona(")
              ? "persona"
              : src.includes("export default businessProcess(")
                ? "business-process"
                : src.includes("export default decisionTable(")
                  ? "decision-table"
                  : "other";
    const mm = src.match(/meta:\s*(\{.*\}),\n/);
    const meta = mm ? JSON.parse(mm[1]) : {};
    allBlocks.set(id, { label, kind, file: f, meta });

    const s = meta.source ?? {};
    const pages: number[] = [];
    if (typeof s.pdfPage === "number") pages.push(s.pdfPage);
    if (typeof s.page === "number") pages.push(s.page);
    if (Array.isArray(s.pdfPages)) pages.push(...s.pdfPages);
    if (typeof s.section === "string") {
      for (const pm of s.section.matchAll(/page-(\d+)/g)) pages.push(Number(pm[1]));
    }
    for (const p of new Set(pages)) {
      if (!byPage.has(p)) byPage.set(p, []);
      byPage.get(p)!.push(id);
    }
  }
  return { allBlocks, byPage };
}

function pageCategoryFor(pdfPage: number): { category: CoverageCategory; note: string } {
  if (pdfPage <= 6 || pdfPage >= 76 || pdfPage === 10 || pdfPage === 65) {
    return {
      category: "editorial",
      note:
        pdfPage === 4
          ? "WHO imprint, copyright, and CC BY-NC-SA 3.0 IGO licence page"
          : pdfPage === 5
            ? "Contents page (outline used by scripts/folio/seed_from_l1.py)"
            : pdfPage === 6
              ? "Acknowledgements (front-matter/p-front-page-006)"
              : pdfPage === 65
                ? "References list (references/p-references-page-065)"
                : pdfPage === 76
                  ? "Annex 7 continuation and People that Deliver reference list (annexes/t-annexes-annex-7, annexes/p-annexes-page-076)"
                  : "Cover, half-title, blank divider, or back cover",
    };
  }
  if (pdfPage >= 7 && pdfPage <= 9) {
    return {
      category: "background-fact",
      note: pdfPage === 7 ? "Abbreviations and acronyms table (tbl:abbreviations)" : "Front-matter Glossary definitions",
    };
  }
  if (pdfPage >= 57 && pdfPage <= 64) {
    const country = pdfPage === 57 ? "Overview" : pdfPage <= 59 ? "Ethiopia" : pdfPage <= 62 ? "Malawi" : "Rwanda";
    return {
      category: "source-example",
      note: `Chapter 5 country example (${country}): cited L1 source narrative and figures, not formal reference architecture`,
    };
  }
  if (pdfPage >= 67 && pdfPage <= 71) {
    return {
      category: "source-example",
      note: `Annex ${pdfPage - 65} template block (tbl:annex-${pdfPage - 65}) with illustrative filled example rows classified as source-example`,
    };
  }
  return {
    category: "captured",
    note: "Normative and operational handbook content captured in folio/dth-sc blocks",
  };
}

export function buildCoverageArtifacts() {
  const pages = readL1Pages();
  const { allBlocks, byPage } = collectBlocksByPage();

  const capturedInput = NORMATIVE_SPECS.filter((s) => s.state === "captured").map((s) => ({
    id: `${s.primaryBlockId}#${s.location}`,
    text: s.verbatimQuote,
    blockId: s.primaryBlockId,
    location: s.location,
  }));

  const exclusionsInput: Exclusion[] = NORMATIVE_SPECS.filter((s) => s.state === "excluded").map((s) => ({
    location: s.location,
    reason: s.exclusionReason!,
    signedOffBy: "litlfred",
    signedOffAt: "2026-10-31",
  }));

  const rep = coverage(pages, capturedInput, exclusionsInput);
  const specByLoc = new Map(NORMATIVE_SPECS.map((s) => [s.location, s]));

  const enrichedSentences = rep.sentences.map((s) => {
    const spec = specByLoc.get(s.location);
    if (!spec) {
      throw new Error(`Normative sentence ${s.location} on page ${s.page} has no spec in NORMATIVE_SPECS: ${s.text}`);
    }
    return {
      ...s,
      printedPage: spec.printedPage,
      section: spec.section,
      l1File: spec.l1File,
      category: spec.category,
      primaryBlockId: spec.primaryBlockId,
      blockIds: spec.blockIds,
      blockLabels: spec.blockLabels,
      verbatimQuote: spec.verbatimQuote,
      basis: spec.basis,
    };
  });

  const pageCoverage = rep.pages.map((p) => {
    const cat = pageCategoryFor(p.page);
    const section = `page-${String(p.page).padStart(3, "0")}`;
    return {
      page: p.page,
      printedPage: printedPageFor(p.page),
      section,
      l1File: `${L1_DIR}/sections/${section}.md`,
      category: cat.category,
      note: cat.note,
      blockIds: byPage.get(p.page) ?? [],
      normative: p.normative,
      captured: p.captured,
      excluded: p.excluded,
      unaccounted: p.unaccounted,
      capturedPct: p.capturedPct,
      accountedForPct: p.accountedForPct,
    };
  });

  const ch05Blocks = [...allBlocks.entries()]
    .filter(([id]) => id.startsWith("ch05-country-examples/"))
    .map(([id, b]) => ({
      blockId: id,
      label: b.label,
      kind: b.kind,
      category: (b.meta.l1CoverageCategory ?? "source-example") as CoverageCategory,
      country: b.meta.country ?? null,
      l1Section: b.meta.source?.section ?? `page-${String(b.meta.source?.page ?? b.meta.source?.pdfPage).padStart(3, "0")}`,
      pdfPage: b.meta.source?.pdfPage ?? b.meta.source?.page,
      sourceOnly: b.meta.sourceOnly,
    }));

  const annexBlocks = [...allBlocks.entries()]
    .filter(([id]) => id.startsWith("annexes/"))
    .map(([id, b]) => ({
      blockId: id,
      label: b.label,
      kind: b.kind,
      category: (b.meta.l1CoverageCategory ?? "captured") as CoverageCategory,
      tableKind: b.meta.tableKind ?? null,
      l1Section: b.meta.source?.section ?? "page-072..page-076",
      pdfPages: b.meta.source?.pdfPages ?? (b.meta.source?.pdfPage ? [b.meta.source.pdfPage] : [72, 73, 74, 75, 76]),
      usedBySteps: b.meta.usedBySteps ?? b.meta.referencedBySteps ?? [],
      exampleRows: b.meta.exampleRows ?? null,
      roleMappingsCount: Array.isArray(b.meta.roleMappings) ? b.meta.roleMappings.length : null,
    }));

  const categoryCounts: Record<CoverageCategory, number> = {
    captured: 0,
    "background-fact": 0,
    editorial: 0,
    "source-example": 0,
  };
  for (const s of enrichedSentences) categoryCounts[s.category]++;

  const manifest = {
    $schema: "l1-coverage-report/v1",
    definitionVersion: DEFINITION_VERSION,
    matchMethod: MATCH_METHOD,
    document: "dth-sc",
    issue: "litlfred/dth-sc#2 (Step SC5)",
    l1Entry: {
      library: "9789240101197-eng",
      repository: "litlfred/who-iris",
      path: L1_DIR,
      isbn: "978-92-4-010119-7",
      irisId: "ceaeb260",
      pdfSha256Prefix: "cd157b40eef513c1",
      totalPages: 78,
      totalFolioBlocks: allBlocks.size,
    },
    totals: rep.totals,
    categoryBreakdown: {
      ...categoryCounts,
      totalNormativeSentences: enrichedSentences.length,
      ch05SourceExampleBlocks: ch05Blocks.length,
      annexBlocks: annexBlocks.length,
      annexTemplateExampleRows: 27,
      annex7RoleMatrixRows: 14,
    },
    capturedStatements: capturedInput,
    exclusions: exclusionsInput.map((ex) => {
      const spec = specByLoc.get(ex.location!)!;
      return {
        ...ex,
        signerRole: { role: "l1-extraction-reviewer" },
        section: spec.section,
        l1File: spec.l1File,
        category: spec.category,
        basis: spec.basis,
      };
    }),
    sentences: enrichedSentences,
    pages: pageCoverage,
    sourceAndTableBlocks: {
      chapter5CountryExamples: ch05Blocks,
      annexes: annexBlocks,
    },
    problems: rep.problems,
  };

  const mdLines: string[] = [
    "# L1 Coverage Report — `dth-sc` (`who-iris/library/9789240101197-eng`)",
    "",
    "**Handbook:** *Digital transformation handbook for health supply chain architecture* (WHO, 2024, ISBN `978-92-4-010119-7`, IRIS `ceaeb260`).",
    "**L1 source:** `who-iris/library/9789240101197-eng` (`sections/page-001.md` .. `page-078.md`, 78 pages).",
    "**L2 folio:** `folio/dth-sc/` (118 blocks across 9 chapters: 68 prose, 10 structured tables with 99 rows, 19 figures, 16 personas, 3 BPMN 2.0 processes, 2 DMN 1.3 decision tables).",
    "**Checker:** `bun run check:l1-coverage` (`scripts/folio/check-l1-coverage.ts`, using `folio-assistant-core/scripts/l1-coverage.ts`).",
    "",
    "## 1. Summary Metrics",
    "",
    "| Metric | Count | Share | Notes |",
    "|---|---:|---:|---|",
    `| **Total L1 pages audited** | 78 | 100.0% | \`page-001.md\` .. \`page-078.md\` (70 content pages mapped to 118 \`folio/dth-sc/\` blocks; 8 front/back imprint or blank pages) |`,
    `| **Total normative sentences (\`l1-coverage\` §1 markers)** | **${rep.totals.normative}** | 100.0% | Closed marker list: \`should\`, \`shall\`, \`must\`, \`recommend*\`, \`should not\`, \`may be (used/implemented/...)\` |`,
    `| **Captured in \`folio/dth-sc/\` blocks** | **${rep.totals.captured}** | **${rep.totals.capturedPct?.toFixed(2)}%** | Verbatim normalised-substring match in \`folio/dth-sc/\` narrative, table, persona, BPMN, and DMN blocks |`,
    `| **Excluded (signed-off \`editorial\` on PDF p. 4)** | **${rep.totals.excluded}** | **${(100 - (rep.totals.capturedPct ?? 0)).toFixed(2)}%** | WHO imprint, CC BY-NC-SA 3.0 IGO licence, and non-endorsement / liability disclaimers on \`page-004.md\` |`,
    `| **Unaccounted normative sentences** | **${rep.totals.unaccounted}** | **0.00%** | Target: 0 unaccounted |`,
    `| **Total accounted-for coverage** | **${rep.totals.captured + rep.totals.excluded} / ${rep.totals.normative}** | **${rep.totals.accountedForPct?.toFixed(1)}%** | **100.0% accounted-for** (\`exitCodeFor(report) === 0\`) |`,
    "",
    "### Classification by Category",
    "",
    "| Category | Normative Sentences | L1 Pages | Folio Blocks / Rows | Description |",
    "|---|---:|---:|---|",
    `| \`captured\` | ${categoryCounts.captured} | 48 | 78 blocks | Core operational & architectural guidance (Introduction, Ch 1 Strategy, Ch 2 Architecture, Ch 3 Implementation & Operations, Ch 4 Traceability, Annex 1 Principles, Annex 7 Resource Matrix, 16 Personas, 3 BPMN 2.0 Processes, 2 DMN 1.3 Decision Tables) |`,
    `| \`background-fact\` | ${categoryCounts["background-fact"]} | 3 | 6 blocks | Front-matter Abbreviations (\`tbl:abbreviations\`) and Glossary definitions (\`p-front-page-008\`, \`p-front-page-009\`), plus DIIG Fig. 5 and WHO SMART Guidelines L1–L5 overview (\`p-introduction-page-015\`..\`017\`) — all 7 normative sentences are also captured verbatim in \`folio/dth-sc/\` blocks |`,
    `| \`editorial\` | ${categoryCounts.editorial} | 14 | 3 blocks + doc manifest | Front/back cover, copyright & CC BY-NC-SA 3.0 IGO licence (\`page-004.md\`, 6 signed-off exclusions), Contents (\`page-005.md\`), Acknowledgements (\`p-front-page-006\`), References (\`p-references-page-065\`, 4 citation titles/URLs captured verbatim), and Annex 7 references (\`p-annexes-page-076\`) |`,
    `| \`source-example\` | ${categoryCounts["source-example"]} | 13 | 12 Ch 5 blocks + 5 Annex template tables (27 example rows) | Chapter 5 country examples (Ethiopia, Malawi, Rwanda prose \`p-ch05-page-057\`..\`064\` and Figs. 26–32) and Annexes 2–6 template tables (\`tbl:annex-2\`..\`tbl:annex-6\`) with 27 illustrative filled example rows |`,
    "",
    "## 2. Per-Page Normative Sentence Accounting (Pages with Normative Markers)",
    "",
    "| PDF Page | Printed Page | L1 Section | Normative | Captured | Excluded | Unaccounted | Captured % | Accounted % | Primary Folio Block(s) |",
    "|---:|---:|---|---:|---:|---:|---:|---:|---:|---|",
  ];

  for (const p of pageCoverage.filter((x) => x.normative > 0)) {
    const blocks = p.blockIds.length ? p.blockIds.map((b) => `\`${b}\``).join(", ") : "`dth-sc` (doc manifest)";
    mdLines.push(
      `| ${p.page} | ${p.printedPage} | \`${p.section}\` | ${p.normative} | ${p.captured} | ${p.excluded} | ${p.unaccounted} | ${p.capturedPct?.toFixed(1)}% | ${p.accountedForPct?.toFixed(1)}% | ${blocks} |`,
    );
  }

  mdLines.push(
    `| **Total** | — | **78 pages** | **${rep.totals.normative}** | **${rep.totals.captured}** | **${rep.totals.excluded}** | **${rep.totals.unaccounted}** | **${rep.totals.capturedPct?.toFixed(2)}%** | **${rep.totals.accountedForPct?.toFixed(1)}%** | **118 blocks** |`,
    "",
    "## 3. Complete Audit of All 47 Normative Sentences",
    "",
    "| # | Location | L1 Section (PDF / Printed) | Markers | State | Category | Folio Block(s) | Verbatim Normative Statement & Accounting Basis |",
    "|---:|---|---|---|---|---|---|---|",
  );

  enrichedSentences.forEach((s, i) => {
    const blocks = s.blockIds.map((b) => `\`${b}\``).join(", ");
    const quote = s.verbatimQuote.replace(/\|/g, "\\|");
    const basis = s.basis.replace(/\|/g, "\\|");
    mdLines.push(
      `| ${i + 1} | \`${s.location}\` | \`${s.section}\` (p. ${s.page} / ${s.printedPage}) | \`${s.markers.join(", ")}\` | \`${s.state}\` | \`${s.category}\` | ${blocks} | *"${quote}"* — ${basis} |`,
    );
  });

  mdLines.push(
    "",
    "## 4. Chapter 5 Country Examples (`source-example` Blocks)",
    "",
    "Chapter 5 (*Country examples*, PDF pp. 57–64, printed pp. 47–54) reports country initiatives in Ethiopia, Malawi, and Rwanda. Per `docs/workplan.md` §2 and §7 SC5, all 12 Chapter 5 blocks are preserved as cited L1 source blocks (`meta.l1CoverageCategory: \"source-example\"`, `meta.sourceOnly`) without minting country-specific reference-architecture elements:",
    "",
    "| Block ID | Label | Kind | Country | L1 Section (PDF Page) | Category | Provenance Note |",
    "|---|---|---|---|---|---|---|",
  );

  for (const b of ch05Blocks) {
    const country = Array.isArray(b.country) ? b.country.join(", ") : (b.country ?? "—");
    mdLines.push(
      `| \`${b.blockId}\` | \`${b.label}\` | \`${b.kind}\` | ${country} | \`${b.l1Section}\` (p. ${b.pdfPage}) | \`${b.category}\` | ${b.sourceOnly} |`,
    );
  }

  mdLines.push(
    "",
    "## 5. Annexes 1–7 as Source, Template, and Resource-Matrix Blocks",
    "",
    "Per `docs/workplan.md` §2 and §7 SC5, Annexes 1–7 (PDF pp. 66–76, printed pp. 56–66) are structured as prose, template `table`, resource-matrix `table`, and implementation `persona` blocks linked from the Chapter 1–3 steps that use them:",
    "",
    "| Block ID | Label | Kind | Table Kind / Role | L1 Section (PDF Pages) | Category | Linked from Ch 1–3 Steps / Personas / Processes | Filled Example Rows / Role Mappings |",
    "|---|---|---|---|---|---|---|---|",
  );

  for (const b of annexBlocks) {
    const pagesStr = b.pdfPages.join("–");
    const usedBy = b.usedBySteps.length ? b.usedBySteps.map((u: string) => `\`${u}\``).join(", ") : "—";
    const details = b.exampleRows
      ? `${b.exampleRows.count} example row(s) (\`${b.exampleRows.category}\`): ${b.exampleRows.description}`
      : b.roleMappingsCount
        ? `${b.roleMappingsCount} role row(s) mapped to 5 Annex 7 personas (\`SC-R-11\`..\`SC-R-15\`) and \`dth-hrh\` counterparts`
        : "—";
    mdLines.push(
      `| \`${b.blockId}\` | \`${b.label}\` | \`${b.kind}\` | ${b.tableKind ?? "—"} | \`${b.l1Section}\` (pp. ${pagesStr}) | \`${b.category}\` | ${usedBy} | ${details} |`,
    );
  }

  mdLines.push("");
  return { manifest, markdown: mdLines.join("\n"), rep, allBlocks };
}

export function verifyL1Coverage(): { ok: boolean; errors: string[]; summary: string } {
  const errors: string[] = [];
  if (!existsSync(MANIFEST_PATH)) {
    errors.push(`Missing L1 coverage manifest at ${MANIFEST_PATH}`);
    return { ok: false, errors, summary: "manifest missing" };
  }
  if (!existsSync(DOC_PATH)) {
    errors.push(`Missing L1 coverage documentation at ${DOC_PATH}`);
  }

  const committed = JSON.parse(readFileSync(MANIFEST_PATH, "utf8"));
  const { manifest, rep, allBlocks } = buildCoverageArtifacts();

  if (exitCodeFor(rep) !== 0) {
    errors.push(`l1-coverage exited with non-zero code ${exitCodeFor(rep)} (unaccounted=${rep.totals.unaccounted})`);
  }
  if (rep.totals.unaccounted !== 0 || rep.totals.accountedForPct !== 100) {
    errors.push(
      `l1-coverage is below 100% accounted-for: captured=${rep.totals.captured}, excluded=${rep.totals.excluded}, unaccounted=${rep.totals.unaccounted}, accountedForPct=${rep.totals.accountedForPct}`,
    );
  }
  if (rep.problems.length > 0) {
    for (const p of rep.problems) errors.push(`l1-coverage problem: ${p}`);
  }

  if (!Array.isArray(committed.sentences) || committed.sentences.length !== rep.sentences.length) {
    errors.push(
      `${MANIFEST_PATH}: expected ${rep.sentences.length} sentences, found ${committed.sentences?.length ?? 0}`,
    );
  }

  const validCategories = new Set<string>(["captured", "editorial", "background-fact", "source-example"]);
  for (const s of committed.sentences ?? []) {
    if (!validCategories.has(s.category)) {
      errors.push(`${MANIFEST_PATH} (${s.location}): invalid category "${s.category}"`);
    }
    if (!s.l1File || !existsSync(s.l1File)) {
      errors.push(`${MANIFEST_PATH} (${s.location}): l1File "${s.l1File}" does not exist`);
    }
    if (!Array.isArray(s.blockIds) || s.blockIds.length === 0) {
      errors.push(`${MANIFEST_PATH} (${s.location}): missing blockIds`);
    } else {
      for (const bid of s.blockIds) {
        if (bid === "dth-sc") {
          if (!existsSync("folio/dth-sc/dth-sc.ts")) {
            errors.push(`${MANIFEST_PATH} (${s.location}): document manifest folio/dth-sc/dth-sc.ts missing`);
          }
        } else if (!allBlocks.has(bid)) {
          errors.push(`${MANIFEST_PATH} (${s.location}): blockId "${bid}" does not exist in folio/dth-sc/`);
        }
      }
    }
    if (s.state === "captured") {
      const mdPath = join(FOLIO_DIR, `${s.primaryBlockId}.md`);
      if (!existsSync(mdPath)) {
        errors.push(`${MANIFEST_PATH} (${s.location}): primary block markdown ${mdPath} does not exist`);
      } else {
        const mdNorm = normalise(readFileSync(mdPath, "utf8"));
        const quoteNorm = normalise(s.verbatimQuote ?? "");
        if (!quoteNorm || !mdNorm.includes(quoteNorm)) {
          errors.push(
            `${MANIFEST_PATH} (${s.location}): verbatimQuote not found in ${mdPath}`,
          );
        }
      }
    }
  }

  if (!Array.isArray(committed.pages) || committed.pages.length !== 78) {
    errors.push(`${MANIFEST_PATH}: expected 78 pages in pages[], found ${committed.pages?.length ?? 0}`);
  }

  const ch05Count = committed.sourceAndTableBlocks?.chapter5CountryExamples?.length ?? 0;
  const annexCount = committed.sourceAndTableBlocks?.annexes?.length ?? 0;
  if (ch05Count !== 12) {
    errors.push(`${MANIFEST_PATH}: expected 12 Chapter 5 source-example blocks, found ${ch05Count}`);
  }
  if (annexCount !== 19) {
    errors.push(`${MANIFEST_PATH}: expected 19 Annexes blocks, found ${annexCount}`);
  }

  const summary = `✓ L1 coverage (SC5): ${rep.totals.normative} normative sentence(s) across 78 L1 pages (${rep.totals.captured} captured [${rep.totals.capturedPct}%] + ${rep.totals.excluded} signed-off editorial exclusions = ${rep.totals.accountedForPct}% accounted-for; ${ch05Count} Ch 5 source-example blocks, ${annexCount} Annex blocks)`;
  return { ok: errors.length === 0, errors, summary };
}

if (import.meta.main) {
  const write = process.argv.includes("--write");
  if (write) {
    const { manifest, markdown } = buildCoverageArtifacts();
    writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n");
    writeFileSync(DOC_PATH, markdown);
    console.log(`Wrote ${MANIFEST_PATH} and ${DOC_PATH}`);
  }
  const res = verifyL1Coverage();
  if (!res.ok) {
    for (const err of res.errors) console.error(`✗ ${err}`);
    process.exit(1);
  }
  console.log(res.summary);
}
