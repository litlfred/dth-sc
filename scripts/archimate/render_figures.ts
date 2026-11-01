#!/usr/bin/env bun
/**
 * Draw the handbook's Figs 15-19 from the dth-sc ArchiMate overlay views
 * (archimate/0.1.0-draft.1), so the figure blocks show a computable graphic
 * instead of the PDF's PNG. The PNG stays in media/ as evidence.
 *
 *   bun run scripts/archimate/render_figures.ts           # write folio/dth-sc/media/archimate-fig-NN.svg
 *   bun run scripts/archimate/render_figures.ts --check   # fail when a written SVG is out of date
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { readArchimate } from "../../cat-harness-tools/archimate/schemas/archimate.ts";
import { renderViewSvg } from "../../cat-harness-tools/archimate/scripts/render-view.ts";

const MODEL = "archimate/0.1.0-draft.1/dth-sc-overlay.archimate";
const check = process.argv.includes("--check");
const model = readArchimate(readFileSync(MODEL));
let stale = 0;
for (const view of model.views) {
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
if (check) console.log(stale ? `✗ ${stale} figure(s) out of date` : "✓ Figs 15-19 SVGs match the overlay views");
process.exit(stale ? 1 : 0);
