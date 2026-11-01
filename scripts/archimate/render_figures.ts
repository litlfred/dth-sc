#!/usr/bin/env bun
/**
 * Draw the handbook's Figs 15-19 from the dth-sc ArchiMate overlay views
 * (archimate/0.1.0-draft.1), and Fig. 14 from smart-ra's "DHSC Architecture
 * Framework (DTH SC Fig. 14)" view, so the figure blocks show a computable
 * graphic instead of the PDF's PNG. The PNG stays in media/ as evidence.
 *
 * Only views that redraw a figure's full content are used. smart-ra's views
 * for Figs 1-3 and 24 summarise those figures (the rings of Fig. 1, the
 * hexagons of Fig. 3, the questions and data box of Fig. 24 are not in them),
 * so those figures keep their PNG.
 *
 *   bun run scripts/archimate/render_figures.ts           # write folio/dth-sc/media/archimate-fig-NN.svg (Figs 14-19)
 *   bun run scripts/archimate/render_figures.ts --check   # fail when a written SVG is out of date
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { readArchimate } from "../../cat-harness-tools/archimate/schemas/archimate.ts";
import { renderViewSvg } from "../../cat-harness-tools/archimate/scripts/render-view.ts";

const SOURCES = [
  { file: "archimate/0.1.0-draft.1/dth-sc-overlay.archimate", views: undefined as string[] | undefined },
  // smart-ra's own Fig. 14 view (mounted read-only as dpi-h-ra).
  { file: "dpi-h-ra/archimate/0.3.0-draft.1/WHOBaseFile.archimate", views: ["id-92267636cc42566ca5d2cff0e81be8c9"] },
];
const check = process.argv.includes("--check");
let stale = 0;
for (const src of SOURCES) {
const model = readArchimate(readFileSync(src.file));
for (const view of model.views.filter((v) => !src.views || src.views.includes(v.id))) {
  const fig = view.name.match(/\(DTH SC Fig\. (\d+)\)$/)?.[1];
  if (!fig) continue;
  const out = `folio/dth-sc/media/archimate-fig-${fig}.svg`;
  const svg = renderViewSvg(model, view) + "\n";
  if (check) {
    if (!existsSync(out) || readFileSync(out, "utf-8") !== svg) {
      console.error(`✗ ${out} is out of date: run scripts/archimate/render_figures.ts`);
      stale++;
    }
  } else {
    writeFileSync(out, svg);
    console.log(`wrote ${out} (${view.name})`);
  }
}
}
if (check) console.log(stale ? `✗ ${stale} figure(s) out of date` : "✓ Figs 14-19 SVGs match their ArchiMate views");
process.exit(stale ? 1 : 0);
