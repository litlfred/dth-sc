# Workplan: supply chain DTH as an L2 document on smart-ra (draft, 2026-10-31)

**Handbook:** *Digital transformation handbook for health supply chain architecture* (WHO, ISBN 9789240101197, IRIS ceaeb260).
**L1 source:** `litlfred/who-iris/library/9789240101197-eng` (frozen, mounted read-only).
**Target repo:** `litlfred/dth-sc` (fork of WorldHealthOrganization/dth-sc; today only a README). No WHO repo is touched.
**Builds on:** workplans.md (project files, dth-l2-ingest-2026-10-31/) (split rule, shared steps S1-S4), smart-ra#133, smart-base#242, dth-hrh#47 (pilot).
**Status:** approved by the owner 2026-10-31 00:45Z ("create issue and work on dth-sc"). Steps SC0, SC1a, SC1b, SC2a, SC2b, SC3 (`smart-ra#147`), SC4, S4 (`dpi-h-ra` mount and `needs: ["smart-base", "dpi-h-ra"]`), and SC5 (`l1-coverage` at 100 % accounted-for in `folio/dth-sc/l1-coverage.json` + `docs/l1-coverage.md`, `check:l1-coverage`, and Chapter 5 / Annexes 1–7 wired as source, template, and resource-matrix blocks) are implemented on `#1`. dth-pc and dth-sfp depend on dth-sc. Definition conflicts with smart-ra are raised on smart-ra (litlfred/smart-ra#140, #183).

## 1. What the L1 entry holds

| item | count | note |
|---|---|---|
| page sections | 78 (`page-001` to `page-078`, .md + .jsonld) | page split, **no outline**: chapter and step headings are not sections |
| blocks | 78 prose (one per page) + 1 figure | no table blocks, though the handbook has 3 tables and 7 annex templates |
| vector figures | 22 (`figures/vfig-pNNN.png`) | Figs 1-4, 8-9, 12-20, 22-25 and country figures |
| images | 14 | logos and country photos |
| keywords | `keywords.json` | top terms: DHSC architecture, DHSC strategy, traceability strategy |
| words | about 24,900 | |

Printed page = PDF page - 10 from the Introduction onward.

**Gap G1 (outline).** The contents page (PDF 5) gives the outline: Introduction; Ch 1 strategy (4 steps); Ch 2 architecture (3 steps, framework, 5 illustrative approaches); Ch 3 implementation (4 steps); Ch 4 traceability; Ch 5 Ethiopia, Malawi, Rwanda; References; Annexes 1-7. The dth-sc seed script should split pages by this outline (like dth-hrh `build_from_outline.py`). The L1 entry stays frozen.

**Gap G2 (tables).** Tables 1-3 and Annexes 2-7 arrive as flattened prose. They must be rebuilt as `table` blocks from the PDF, each cell traced to its page.

## 2. Content map: what goes where

Legend: **RA** = smart-ra (glossary concept, ArchiMate element or view). **SC** = dth-sc (narrative, domain term, link). **Src** = stays a cited L1 source block, never a formal statement.

| part | PDF | content | goes to |
|---|---|---|---|
| Front matter, acknowledgements | 1-4, 6 | title, licence, authors, reviewers | Src (provenance only) |
| Abbreviations | 7 | 31 acronyms | SC acronym list; shared ones (DIIG, TOGAF, OpenHIE, ERP, KPI, RFP, RFQ, SMART, ITU, TWG, MOH) link to smart-ra acronyms |
| Glossary | 8-9 | 26 terms | split, see section 3 |
| Introduction | 11-14 | 9 supply chain processes, 11 partners (Fig 1), information flow (Fig 2), DHSC definition and ecosystem (Fig 3), scope, Fig 4 stepwise method | processes and partners: RA elements + one RA view; DHSC definition: SC term; scope and challenges: SC narrative |
| Ch 1 strategy | 19-28 | 6 guiding principles; 6 aligned national strategies (Fig 8); risks of no strategy; product code mismatch (Fig 9); Steps 1-4, each with inputs, tasks, outputs, resources, risks and mitigations, best practices | SC narrative, steps as structured blocks; strategy outputs (vision, goals, objectives, roadmap) link to RA motivation elements; Fig 9 links to product registry (shared with PC) |
| Ch 2 architecture | 29-42 | SCISMM 5 maturity levels (Fig 12); DIIG enterprise architecture (Fig 13); **DHSC architecture framework (Fig 14)** and its 6 component groups; 5 illustrative architectures (Figs 15-19); cross-enterprise analytics (Fig 20); Step 3 roadmap | **the core of the RA work**: Fig 14 becomes an RA view, Figs 15-19 RA variant views, Fig 13 links to the existing DIIG content; SCISMM levels become an SC concept scheme citing SCISMM |
| Ch 3 implementation | 43-52 | 4 principles; 7 eHealth building blocks (Fig 22, WHO-ITU toolkit); governance definition box; Table 2 considerations; Steps 1-4 (charter, operations plan, budget, implement); TCO cost components (Fig 23); Table 3 cost drivers | SC narrative and tables; building blocks and TCO link to RA concepts; "governance (health supply chain)" is an SC term recorded as an alternative to the RA definition |
| Ch 4 traceability | 53-56 | two definitions of traceability; why it matters; 3 traceability models; centralized-model components; **Fig 24** (track and trace through DHSC components, traceability data what/when/where/why, 7 query questions); Fig 25 illustrative interface | Fig 24 becomes an RA view; traceability event data object in RA; 3 models as an SC concept scheme; Fig 25 an SC `example` block (illustrative data, not a fact) |
| Ch 5 country examples | 57-64 | Ethiopia, Malawi, Rwanda | **Src only.** Country systems may link to RA elements as "example of", never as model facts |
| References | 65 | 26 references | SC bibliography, resolved against who-iris where held (DIIG, Classification of Digital Interventions, Traceability policy paper) |
| Annex 1 | 66 | Principles for Digital Development | link to the shared RA concept, not copied |
| Annexes 2-7 | 67-78 | steering committee structure; challenge prioritization; challenges-to-outcomes; HSCIS listing; risk register; resource matrix (roles, phases, skills) | SC `table` blocks (templates); Annex 7 roles link to RA business roles where they exist |

### Empirical content kept out of formal content

These stay as cited Src blocks and are never turned into definitions, model relationships or goals: the challenge statements on PDF 12 (manual processes cause stockouts and similar), the benefit claims on PDF 12 and 54, the "most widely implemented" claim about the centralized traceability model (PDF 54), all of Ch 5, and the example rows of Fig 25.

## 3. Glossary split (26 terms + 2 boxed definitions)

24 of the handbook's terms are already compared in `smart-base/findings/dth-terms.md` (SC column). Where SC and the RA disagree, both definitions stay as alternatives with sources; none is chosen.

| to smart-ra (shared concept; SC definition kept as an alternative with source) | to dth-sc (domain term, `skos:broader` / `closeMatch` to an RA concept) |
|---|---|
| deployment, digital health, digital transformation, digitalization, digitization, end users, enterprise architecture, features, functional requirements, functions, interoperability, nonfunctional requirements, open-source software, open standards, organogram, registry, SMART Guidelines, stakeholder, systems architecture, total cost of ownership, use case | digital health supply chain (PDF 12), digital health supply chain intervention, health supply chain information system, order management, order management system, warehouse management system, governance (health supply chain) (PDF 45), traceability (two definitions: WHO policy paper on PDF 9, GS1 on PDF 54) |

Candidate new SC terms not in the glossary but used as defined concepts: SCISMM maturity levels 1-5, the three traceability models, product verification, track and trace, interoperability layer enabling components. Each is added only where the handbook states what it is.

## 4. ArchiMate: what smart-ra has and what to add

Name search of `smart-ra/archimate/0.2.0/WHOBaseFile.archimate`. No view there covers supply chain.

| Fig 14 group | already in smart-ra | to add |
|---|---|---|
| HSCISs (8) | Forecasting & Supply Planning System, Procurement Management System, Order Management System, Supplier & Contract Management System, Warehouse Management System, Transportation Management System, Dispensing System, Health Facility Logistics Management System; the 8 matching capabilities | Cold Chain Management System (capability exists, component does not); Inventory Management (facility level, Figs 18-19): decide whether it is the existing Health Facility Logistics Management System |
| Foundational components | Product Registry, Supplier registry, Facility registry, Product Catalog Management System, Product Master Data Management | none, but definitions are shared with PC (section 5) |
| Interoperability layer | Interoperability Component, DPI-F Information Mediator, Interoperability Layer view | the 6 enabling components: Authentication, Orchestration, Encryption, Validation, Transformation, Translation (check the Interoperability Layer view first for equivalents) |
| Data services | Analytics & Reporting Platform, Traceability Services, Tracking, Verification, Product Traceability | Data warehouse, Supply chain reports, Product verification, Track and trace (or map them to the existing services, recorded as a decision) |
| External systems | none | Manufacturer systems, Data repositories, Global platforms |
| Digital ecosystems | none | Regulatory systems, Finance and insurance systems, Health management information system, Quality systems |
| Partners (Fig 1, 3) | roles Warehouse, Supplier, Health Facility | Ministry of health, Procurer, Manufacturer/distributor, Regulator, Central warehouse, Regional warehouse, Logistics provider, Community health, Individual, Private sector |
| Traceability (Fig 24) | Traceability capability, Product Traceability service | data object "traceability event" with what (product id, batch, serial), when, where, why (receive, ship, dispense, discard) |

**Views to add in smart-ra** (one versioned model, as the split rule requires):

1. DHSC architecture framework (Fig 14).
2. Four variant views on the same elements: maturity 3 to 4 (Fig 15), maturity 4 to 5 (Fig 16), centralized (Fig 17), decentralized A and B (Figs 18-19, with national, district and facility groupings).
3. Health supply chain partners and processes (Figs 1 and 3).
4. Track and trace in the centralized model (Fig 24).

The 17 supply chain goals already in smart-ra are not from this handbook's text; their source should be checked before any SC block links to them.

## 5. Shared elements with the other handbooks

| shared with | elements | proposal |
|---|---|---|
| PC (dth-pc) | Product Registry, Product Catalog Management System, Product Master Data Management, Supplier registry, Facility registry, DPI-F Information Mediator, Terminology Service, Traceability and Recall; Fig 9 product codes; NPC | **Agreed with the PC thread (2026-10-31):** SC drafts the "Digital health supply chain architecture" view (SC Fig 14 = PC Fig 7) and PC links to it. PC drafts a "National product catalogue (product registry)" view. Both reuse the existing smart-ra element IDs; neither mints duplicates. New elements PC proposes and SC reuses where needed: business objects Generic product, Trade item, Regulated trade item, Product classification; roles Data owner, Data custodian, Data steward, Catalogue manager; NRA stakeholder; GTIN / country trade item identifier data objects. Shared terms (Registry, Trade item, Traceability, Product master data) go into the smart-ra SKOS scheme once, with PC and SC wording as cited alternatives. Both views go in one combined smart-ra PR. |
| SF (dth-sfp) | Product verification, Track and trace, Regulatory systems, Quality systems, Recall | **Agreed with the SF thread (2026-10-31):** SF defines the regulatory and pharmacovigilance elements (NMRA, post-market surveillance, pharmacovigilance, SF reporting and investigation, enforcement linked to the existing Recall capability, GSMS and VigiFlow as external systems). SC defines product verification, track and trace and the traceability event data object. Both reuse the same smart-ra IDs. Shared product quality and safety terms go in one smart-ra glossary collection (sfp-workplan.md (project files) section 2.2). |
| HRH (dth-hrh) | Annex 7 roles (solution architect and others) | link only, if HRH roles exist |
| PHC (dth-phc) | Dispensing at point of service, HMIS | link only |

## 6. How the narrative links to glossary and ArchiMate

- Every dth-sc block carries term references that the cross-instance glossary validator (S3) resolves against dth-sc and smart-ra.
- Every block that names an architecture element links to its smart-ra IRI (S2); the S3 QA check flags a block that names an element without linking it.
- Figs 14-19 and 24 render from their smart-ra views; the original PDF figure stays as the L1 provenance image next to it.
- l1-coverage reaches 100 %: every normative sentence is either captured in a block or listed as excluded with a reason.

## 6b. Structured tables (SC1b), personas, BPMN 2.0 processes, and DMN 1.3 decision tables (`dth-sc#2`)

- **SC1b structured `table` blocks (10 tables, 99 rows):** `t-front-matter-abbreviations` (`tbl:abbreviations`), `t-ch01-table-1` (`tbl:1`), `t-ch03-table-2` (`tbl:2`), `t-ch03-table-3` (`tbl:3`), and `t-annexes-annex-2` through `t-annexes-annex-7` (`tbl:annex-2`..`tbl:annex-7`), each traced to `who-iris/library/9789240101197-eng` and linked to `dth-sc` / `dpi-h-ra` glossary terms and ArchiMate 0.3.0-draft.1 elements.
- **Structured roles (`persona` blocks, 16 personas):**
  - 10 supply chain partner roles (`folio/dth-sc/introduction/`): `pers-ministry-of-health`, `pers-procurer`, `pers-manufacturer-distributor`, `pers-regulatory-authority`, `pers-central-warehouse`, `pers-regional-district-warehouse`, `pers-logistics-provider`, `pers-health-facility`, `pers-community-health-worker`, `pers-health-service-user`.
  - 5 implementation & governance roles (`folio/dth-sc/annexes/`): `pers-steering-committee-sponsor`, `pers-project-manager-ba`, `pers-solution-architect`, `pers-developer-integrator`, `pers-system-administrator-support`.
  - 1 system persona (`folio/dth-sc/ch04-traceability/`): `pers-system-dhsc-traceability-hub`.
- **BPMN 2.0 business processes (`business-process` blocks + `.bpmn` + rendered SVGs in `folio/dth-sc/media/`):**
  - `SC-BP-01` (`bp-sc-bp-01-stepwise-dhsc-transformation`, `folio/dth-sc/introduction/`): Stepwise DHSC transformation method (Introduction Fig. 4, Ch 1 Steps 1-4, Ch 2 Steps 1-3, Ch 3 Steps 1-4, Annexes 2-7).
  - `SC-BP-02` (`bp-sc-bp-02-end-to-end-supply-chain-processes`, `folio/dth-sc/introduction/`): End-to-end health supply chain core processes and information flow across all 10 partner roles (Introduction Figs. 1-3).
  - `SC-BP-03` (`bp-sc-bp-03-centralized-track-and-trace`, `folio/dth-sc/ch04-traceability/`): Centralized medical product track-and-trace, verification, and recall workflow (Ch 4 Figs. 24-25).
- **DMN 1.3 decision tables (`decision-table` blocks + `.dmn` companions):**
  - `SC-DT-01` (`dt-sc-dt-01-scismm-architecture-selection`, `folio/dth-sc/ch02-dhsc-architecture/`): SCISMM maturity level and target DHSC architecture variant selection (Ch 2 Fig. 12, Figs. 15-19).
  - `SC-DT-02` (`dt-sc-dt-02-traceability-model-selection`, `folio/dth-sc/ch04-traceability/`): Traceability model selection (Ch 4 centralized, semi-centralized, or distributed model).

- **L1 normative coverage (SC5, `folio/dth-sc/l1-coverage.json` + `docs/l1-coverage.md`):** 100.0 % accounted-for across all 47 normative sentences and 78 pages of `who-iris/library/9789240101197-eng` (41/47 [87.23 %] captured verbatim in `folio/dth-sc/` blocks + 6/47 [12.77 %] signed-off `editorial` exclusions on PDF p. 4 CC BY-NC-SA 3.0 IGO licence/imprint; 0 unaccounted), with Chapter 5 country examples (12 blocks) and Annexes 2–6 filled template rows (27 rows) classified as `source-example` and Annex 7 (14 role rows) mapped to the 5 implementation personas (`SC-R-11`..`SC-R-15`) and `dth-hrh` counterparts. Verified by `bun run check:l1-coverage` (`scripts/folio/check-l1-coverage.ts`).

## 7. Work order (after the dth-hrh pilot and S1-S4)

| step | where | what | depends on |
|---|---|---|---|
| SC0 | dth-sc | scaffold from the dth-hrh template: declaration, `index.config.json` mounting who-iris and smart-ra, AGENTS.md | S4, dth-hrh#47 |
| SC1 | dth-sc | seed folio from the outline (G1); rebuild tables (G2) | SC0 |
| SC2 | smart-ra + dth-sc | glossary: shared concepts and alternatives in smart-ra; 8 domain terms in `dth-sc.glossary.json` | S1, smart-ra#133 |
| SC3 | smart-ra | elements and the 4 view groups in section 4, drafted with PC (and SF for traceability) | S2 |
| SC4 | dth-sc | link narrative to terms and views; render figures from views | SC1-SC3, smart-base#242 |
| SC5 | dth-sc | l1-coverage to 100 %; Ch 5 and annexes as source and table blocks | SC4 |

## 8. Open points for the owner

1. Issues are switched off on the litlfred/dth-sc fork, so the workplan issue goes on litlfred/smart-ra after approval.
2. Variant views (Figs 15-19): five separate smart-ra views, or one view with the variants as recorded alternatives.
3. Overlapping services (Product verification vs the existing Verification; Track and trace vs Tracking): add new elements or map to existing ones.
