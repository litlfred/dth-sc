# ArchiMate pages: as-is intent

**Covers:** the `archimate` visualiser dth-sc declares in `dth-sc.json` (`renderedBy: archimate-pages`, `covers: [archimate]`), routed at `en/dth-sc/archimate/`. The pages are written by `cat-harness-tools/archimate/scripts/gen-archimate-pages.ts` from the overlay in `archimate/` (0.1.0-draft.1, built by `scripts/archimate/build_variant_views.py`).

**Candidates:** `as-is.html` is the model's version page (`0.1.0-draft.1/`), which the models index links to. `as-is-view.html` is one view's page, Fig. 17. Both are checked at web 1280 and mobile 390.

**Who it is for:** a reader of the handbook who meets one of the architecture figures (Figs 15-19) and wants the model behind it, and an author linking a block to an ArchiMate element or view.

**What they need to do:** find the five architecture variants, open one, see which elements it groups, and follow an element back to the smart-ra element it copies.

**What it must show:**

On the version page:
- a link back to the models index, the model's title and version;
- the counts (views, elements, relationships) and the contents by layer;
- the model's description, saying which elements copy smart-ra (`overlay:base`) and which are this DTH's own (`overlay:owner=dth-sc`);
- the views, each linked, named with its figure;
- the elements, grouped by layer, each linked with its ArchiMate type.

On a view's page:
- a link back to the version page, and the view's title with its figure;
- the drawing;
- the view's documentation, citing the figure and its PDF page;
- the elements in the view, each linked with its type;
- links to the view's JSON-LD and to the drawing as SVG.

The pages load their content from the model's JSON-LD, so without JavaScript they say that they need it.

## Observed

The model has no relationships yet (groupings and members as drawn), so the counts show 0 relationships.
