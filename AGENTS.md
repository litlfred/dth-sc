# AGENTS.md — Digital Transformation Handbook for Health Supply Chain Architecture

This is a **folio**: the content repository. The authoring platform —
skills, schemas, MCP tools, the publication pipeline — is
folio-assistant, **remote-mounted** at the repository root from the SHAs pinned in
`index.lock.json` (`who-iris/`, `smart-base/`, `folio-assistant-core/`, `cat-harness/`,
`cat-harness-tools/`, `fhir-harness/`, `bootstrap/`, `bootstrap-tools/`; all
gitignored). The session-start hook mounts them; by hand:
`bun run cat-harness-tools/scripts/remote-mount.ts`. The pins are dth-hrh's, so
the handbooks run on the same layers.

This file is the **agent-generic** source of truth, read natively by Claude
Code, Gemini CLI, Antigravity, Cursor and Copilot. `CLAUDE.md` and
`GEMINI.md` are thin stubs pointing here.

> **Content lives here; formalism lives in the platform.** If you are about to
> add a schema, a validator, a QA criterion or a skill, it belongs in
> folio-assistant, not in this repo. If you are about to add a chapter, a
> recommendation or a table, it belongs here.

## This document

The **WHO Digital transformation handbook for health supply chain
architecture** (2024, ISBN 9789240101197, CC BY-NC-SA 3.0 IGO), on its way
from an L1 document (smart-base document kind `dth`) to an **L2 DTH on
smart-ra**: its narrative uses and is validated against the glossaries, and
its narrative links to the ArchiMate model in litlfred/smart-ra. The plan is
[`docs/workplan.md`](docs/workplan.md).

**dth-pc and dth-sfp depend on this repository** (owner, 2026-10-31): they
link to its supply chain terms and traceability concepts instead of
redefining them.

| what | where | how it is made |
|---|---|---|
| the working document | `folio/dth-sc/` | seeded once from the L1 entry `who-iris/library/9789240101197-eng` by `scripts/folio/seed_from_l1.py`, one prose block per PDF page, by the handbook's contents-page outline; with `--pdf` the 8 tables (Tables 1-3, abbreviations, Annexes 3, 5, 6, 7) are rebuilt from the PDF as `table` blocks (`scripts/folio/pdf_tables.py`, needs pdfplumber); **edited by hand from then on**: never re-run it without `--force`, which discards edits |
| the supply chain glossary | `glossary/dth-sc.glossary.json` (SKOS, `folio-glossary/v1`) | by hand; each term quotes the handbook with its L1 page |
| the source, frozen | `who-iris/library/9789240101197-eng` (mounted) | never edited here |
| the plan | `docs/workplan.md` | copy of the approved workplan |

## What goes where (the split rule)

| goes in | what |
|---|---|
| **smart-ra** | the shared glossary (general digital terms: digital health, interoperability, registry, enterprise architecture, …); every ArchiMate element and view, including the DHSC architecture framework view and the track-and-trace view |
| **here** | the narrative folio; the supply chain terms (`glossary/`); the links from blocks to smart-ra concepts and ArchiMate elements |
| **the platform** | the L2 DTH document kind, the cross-instance glossary validator, the ArchiMate-link QA check |

**Where this handbook disagrees with smart-ra** (a definition, an element),
do not change either side: raise an issue on litlfred/smart-ra and record
both as alternatives with sources. None is chosen. The first is
litlfred/smart-ra#140.

**No empirical claims in formal content.** Statistics, benefit claims and
the country examples (Chapter 5) stay as cited source text. They never become
glossary definitions, model relationships or goals. Chapter 5 blocks carry
`meta.sourceOnly`.

**Never push to or open PRs on WorldHealthOrganization/dth-sc.** This
repository is its fork; work happens here.

## Content type: `document`

A **document** folio: structured prose — policy guidance, a standard, a
report, a handbook. No Lean formalization, and no TeX installation required to
publish.

**Block kinds you may use:** `prose`, `example`, `remark`, `algorithm`,
`simulator`, `equation`, `diagram`, `table`, `figure`.

**Kinds you may NOT use:** `definition`, `theorem`, `lemma`,
`proposition`, `corollary`, `conjecture`, `proof`. Those are the paper
profile — their assertion is a formal mathematical claim backed by a `.lean`
sibling, and this folio has no toolchain to check one. `content_validate`
enforces this on every run.

Reaching for `theorem` to carry a recommendation is the common mistake. Load
the `normative-statements` skill instead.

## Layout

```
folio/dth-sc/          the document
  dth-sc.ts             its manifest — chapters, in reading order
  <chapter>/<chapter>.ts   a chapter manifest — sections, in reading order
  <chapter>/<root>.ts      a block manifest
  <chapter>/<root>.md      that block's prose
folio/schema/            re-export shim for the platform's builders
test/results/block-qa/     QA verdicts, one per block, mirroring folio/ (machine-written working copy — published to qa-reports)
test/attestations/        reviewer judgements and baseline attestations (committed on main)
uploads/                   source PDFs, for offline citation verification
./              the platform
beans/                    the work plan (mounted from its declared branch)
todos/                    people's outstanding items (mounted likewise)
```

## Commands

```sh
bun run ./cat-harness-tools/src/index.ts --stdio --repo .   # the MCP server
bun run ./cat-harness-tools/src/index.ts --check-deps       # what's installed
bun run ./cat-harness-tools/content/pipeline/qa-sweep.ts folio  # QA every block
```

## QA — every block is checked from the first commit

`qa-sweep` runs every criterion a script can check against each block, and
writes one verdict file per block under `test/results/block-qa/`. Derived QA
verdicts live on the orphan `qa-reports` branch (published by CI), rather than
being committed to `main`. Judgements stay on `main` in `test/attestations/`.
The working copy under `test/results/` is machine-written.

`.github/workflows/qa-sweep.yml`
runs the full sweep in CI, and `qa-sweep-nightly.yml` refreshes stale verdicts;
both are dispatch-only until you enable their triggers. Criteria that need an
agent's judgement (voice, exposition, adversarial review) are not run by the
sweep; they stay unaudited until an agent records them.

## Work plan — use `beans`

`beans/` and `todos/` are this folio's STATE. Where each is kept is declared
in `dth-sc.json` — by default on its own branch,
`cat/dth-sc/beans` and `cat/dth-sc/todos`, mounted at those paths by the
session-start hook (`state:mount`) and never committed to `main`. Either way
the plan survives a fresh container and a sibling session sees it. Claim before
you work; never resolve a sibling's bean.

```sh
./cat-harness-tools/scripts/install-beans.sh
beans list
beans create "<title>"
beans <id> --status in-progress
```

**Check before you create** — `beans create` is not idempotent and dedupes on
nothing, so re-entering a step duplicates the plan rather than no-op'ing.

## The skills are in the platform, not here

Ask for them by name and the agent loads them over MCP (`skill_fetch`):

| Package | What |
|---|---|
| `folio-core` | content-agnostic: bean coordination, editorial review, QA |
| `folio-document-adapter` | `document-authoring`, `document-structure`, `normative-statements`, `document-publishing` |

Do not copy a skill body into this repo. It will drift, and the platform's copy
is the one every other folio is reading.
