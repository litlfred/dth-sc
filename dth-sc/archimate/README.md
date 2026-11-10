# dth-sc ArchiMate overlay

A DTH builds an **overlay** on the smart-ra (DPI-H RA) ArchiMate model and does not add to that model (owner, 2026-11-01, card Q-RA1 A). The one exception is a real conflict between a DTH and smart-ra terms or models: then an issue goes to smart-ra and to the DTH.

| Version | File | Overlays smart-ra | Views |
|---|---|---|---|
| 0.1.0-draft.1 | [`0.1.0-draft.1/dth-sc-overlay.archimate`](0.1.0-draft.1/dth-sc-overlay.archimate) | 0.3.0-draft.1 | the five architecture variants, Figs 15-19 |

smart-ra holds the framework itself, "DHSC Architecture Framework (DTH SC Fig. 14)", and the partners/processes and track-and-trace views (smart-ra#147). This overlay adds one view per variant figure:

| Figure | View | What differs from Fig. 14 |
|---|---|---|
| 15 | Maturity-based Architecture: SCISMM Level 3 to Level 4 | no digital ecosystems or external systems |
| 16 | Maturity-based Architecture: SCISMM Level 4 to Level 5 | same members as Fig. 14 |
| 17 | Supply Chain Design: Centralized Management | same members as Fig. 14 |
| 18 | Supply Chain Design: Decentralized Management, Option A | supply chain systems split into National Level and Facility Level |
| 19 | Supply Chain Design: Decentralized Management, Option B | National, District and Facility Level; districts procure on their own |

Each element carries one of two tags:

- `overlay:base`: a reference copy of a smart-ra element, under the same id, with its smart-ra IRI as the value. It is there only so the overlay's views can draw it. The folio links it by that smart-ra IRI.
- `overlay:owner` = `dth-sc`: an element this DTH adds (the three level groupings and Inventory Management System). The folio links it with a `https://litlfred.github.io/dth-sc/archimate/0.1.0-draft.1/elements/…` IRI.

Only membership is drawn, as in the figures; no other relationships are asserted.

Rebuild (deterministic ids, so a rebuild gives the same file):

```sh
python3 -I scripts/archimate/build_variant_views.py dpi-h-ra/archimate/0.3.0-draft.1/WHOBaseFile.archimate 0.3.0-draft.1 archimate/0.1.0-draft.1/dth-sc-overlay.archimate
```

The figure blocks for Figs 15-19 show SVGs drawn from these views (`folio/dth-sc/media/archimate-fig-NN.svg`), and link the printed PNG as evidence. Redraw them after a rebuild, or check that they match:

```sh
bun run scripts/archimate/render_figures.ts          # write
bun run scripts/archimate/render_figures.ts --check  # verify
```
