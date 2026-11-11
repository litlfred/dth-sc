// Fail when a block carries PDF page furniture as narrative: a printed table
// of contents (dot leaders ending in a page number). The site builds its own
// contents from the document structure, and the L1 entry keeps the printed one
// in structure.json, so a printed TOC in a block is always an ingestion error.
// Same gate as dth-phc (litlfred/dth-phc#23). Runs are counted anywhere in a
// file, not only at line ends, because this seeder joins a page's lines into
// one paragraph.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = join(import.meta.dir, "..", "..");
const FOLIO = join(ROOT, "folio");
const DOT_LEADER = /(?:\.\s{0,2}){6,}\s*[0-9ivxlc]+\b/g;
const MAX_LEADERS = 2;

function* walk(dir: string): Generator<string> {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* walk(p);
    else if (name.endsWith(".md")) yield p;
  }
}

const bad: string[] = [];
for (const file of walk(FOLIO)) {
  const hits = (readFileSync(file, "utf-8").match(DOT_LEADER) ?? []).length;
  if (hits > MAX_LEADERS) bad.push(`${relative(ROOT, file)}: ${hits} dot-leader runs (a printed table of contents)`);
}
if (bad.length) {
  console.error("✗ page furniture in block narrative:");
  for (const b of bad) console.error(`  ${b}`);
  process.exit(1);
}
console.log("✓ no printed table of contents in any block");
