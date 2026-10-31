#!/usr/bin/env bun
/**
 * Validate this folio's glossary schemes against the platform's
 * folio-glossary/v1 schema, and check that every link resolves:
 *
 * - every `related` and `broader` reference in this instance's scheme names a
 *   term (or scheme) that exists here or in a mounted instance;
 * - every SKOS match (`exactMatch`, `closeMatch`, `broadMatch`, `narrowMatch`)
 *   into a MOUNTED instance's namespace (such as dpi-h-ra, litlfred/smart-ra)
 *   names a term in that instance's glossary (dth-hrh#47, dth-sc#2 SC2b);
 * - every glossary concept a block names in `meta.glossary` exists in this
 *   instance's glossary or a mounted instance's glossary (dth-sc#2 SC4);
 * - every ArchiMate element or view a block names in `meta.archimate` exists
 *   in the mounted dpi-h-ra model (dth-hrh#47, dth-sc#2 SC4).
 *
 *   bun run scripts/glossary/validate.ts
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { GlossarySchema } from "../../folio-assistant-core/schemas/glossary.ts";
import { instanceNs } from "../../folio-assistant-core/scripts/glossary-page.ts";

const MATCHES = ["exactMatch", "closeMatch", "broadMatch", "narrowMatch"] as const;

interface Instance {
  name: string;
  ns: string;
  root: string;
}

function instanceAt(root: string, file: string): Instance {
  const d = JSON.parse(readFileSync(join(root, file), "utf-8"));
  return { name: d.name, ns: instanceNs(d.name, d.stub, d), root };
}

/** Every term and scheme IRI an instance's `glossary/` declares. */
function glossaryIris(inst: Instance): {
  known: Set<string>;
  bareIds: Set<string>;
  docs: Array<{ f: string; g: ReturnType<typeof GlossarySchema.parse> }>;
} {
  const dir = join(inst.root, "glossary");
  const known = new Set<string>();
  const bareIds = new Set<string>();
  const docs: Array<{ f: string; g: ReturnType<typeof GlossarySchema.parse> }> = [];
  if (!existsSync(dir)) return { known, bareIds, docs };
  for (const f of readdirSync(dir).filter((x) => x.endsWith(".glossary.json"))) {
    const g = GlossarySchema.parse(JSON.parse(readFileSync(join(dir, f), "utf-8")));
    known.add(`${inst.ns}glossary/${g.id}`);
    for (const t of g.terms) {
      known.add(t.iri ?? `${inst.ns}glossary/${g.id}/${t.id}`);
      bareIds.add(t.id);
    }
    docs.push({ f, g });
  }
  return { known, bareIds, docs };
}

const self = instanceAt(".", "dth-sc.json");
const mounted: Instance[] = [];
if (existsSync("dpi-h-ra/dpi-h-ra.json")) mounted.push(instanceAt("dpi-h-ra", "dpi-h-ra.json"));

const here = glossaryIris(self);
const there = new Map(mounted.map((m) => [m, glossaryIris(m).known]));
let bad = 0;

function checkTermRef(ctx: string, r: string): boolean {
  if (!r.includes("://")) {
    if (!here.bareIds.has(r)) {
      console.error(`✗ ${ctx}: bare id "${r}" is not a term in ${self.name}`);
      bad++;
      return false;
    }
    return true;
  }
  if (r.startsWith(self.ns)) {
    if (!here.known.has(r)) {
      console.error(`✗ ${ctx}: ${r} is not a term in ${self.name}`);
      bad++;
      return false;
    }
    return true;
  }
  const inst = mounted.find((x) => r.startsWith(x.ns));
  if (inst && !there.get(inst)!.has(r)) {
    console.error(`✗ ${ctx}: ${r} is not a term in ${inst.name}`);
    bad++;
    return false;
  }
  return true;
}

for (const { f, g } of here.docs) {
  for (const t of g.terms) {
    if (!/^[A-Z]/.test(t.prefLabel)) {
      console.error(`✗ ${f}: ${t.id} prefLabel "${t.prefLabel}" is not Capitalized`);
      bad++;
    }
    for (const b of t.broader ?? []) {
      checkTermRef(`${f}: ${t.id} broader`, b);
    }
    for (const r of t.related ?? []) {
      checkTermRef(`${f}: ${t.id} related`, r);
    }
    for (const m of MATCHES) {
      for (const r of t[m] ?? []) {
        checkTermRef(`${f}: ${t.id} ${m}`, r);
      }
    }
  }
  const authored = g.terms.filter((t) => t.status === "authored").length;
  const linked = g.terms.filter((t) => MATCHES.some((m) => t[m]?.length)).length;
  console.log(`✓ ${f}: ${g.terms.length} terms (${authored} authored, ${linked} matched to another scheme)`);
}

// ── Glossary and ArchiMate links in block manifests ────────────────
const ra = mounted.find((m) => m.name === "dpi-h-ra");
if (ra) {
  const { readArchimate } = await import("../../cat-harness-tools/archimate/schemas/archimate.ts");
  const cfg = JSON.parse(readFileSync(join(ra.root, "archimate/cat-archimate.config.json"), "utf-8"));
  const ids = new Map<string, { elements: Set<string>; views: Set<string> }>();
  for (const cm of cfg.models) {
    const p = join(ra.root, "archimate", cm.file);
    if (!existsSync(p)) continue;
    const model = readArchimate(readFileSync(p));
    ids.set(cm.id, {
      elements: new Set(model.elements.map((e: { id: string }) => e.id)),
      views: new Set(model.views.map((v: { id: string }) => v.id)),
    });
  }
  const iriRe = /\/archimate\/([^/]+)\/(elements|views)\/([^/]+)\.jsonld$/;
  let archBlocks = 0;
  let archLinks = 0;
  let figMappings = 0;
  let glosBlocks = 0;
  let glosLinks = 0;
  const walk = (dir: string): string[] =>
    readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
      e.isDirectory() ? walk(join(dir, e.name)) : e.name.endsWith(".ts") ? [join(dir, e.name)] : [],
    );
  for (const file of walk("folio/dth-sc")) {
    const src = readFileSync(file, "utf-8");
    if (!src.includes('"archimate"') && !src.includes('"glossary"')) continue;
    const m = src.match(/meta: (\{.*\}),\n/);
    if (!m) {
      console.error(`✗ ${file}: names "archimate" or "glossary" but its meta is not one line of JSON`);
      bad++;
      continue;
    }
    const meta = JSON.parse(m[1]);
    if (Array.isArray(meta.glossary) && meta.glossary.length > 0) {
      glosBlocks++;
      for (const gEntry of meta.glossary) {
        glosLinks++;
        checkTermRef(`${file} meta.glossary`, String(gEntry.iri));
      }
    }
    const a = meta.archimate;
    if (a) {
      archBlocks++;
      for (const x of [...(a.elements ?? []), ...(a.views ?? [])]) {
        archLinks++;
        const hit = String(x.iri).match(iriRe);
        const ok =
          hit &&
          String(x.iri).startsWith("https://litlfred.github.io/smart-ra/") &&
          ids.get(hit[1])?.[hit[2] as "elements" | "views"].has(hit[3]);
        if (!ok) {
          console.error(`✗ ${file}: ${x.iri} (${x.name}) is not in the mounted dpi-h-ra ArchiMate model`);
          bad++;
        }
      }
      for (const fm of a.figures ?? []) {
        figMappings++;
        const ok = ids.get(String(fm.model))?.views.has(String(fm.view));
        if (!ok) {
          console.error(`✗ ${file}: figure ${fm.figure} view ${fm.view} is not in dpi-h-ra ArchiMate model ${fm.model}`);
          bad++;
        }
      }
    }
  }
  console.log(`✓ Glossary links: ${glosLinks} link(s) from ${glosBlocks} block(s) to dth-sc / dpi-h-ra checked`);
  console.log(
    `✓ ArchiMate: ${archLinks} link(s) and ${figMappings} figure-view mapping(s) from ${archBlocks} block(s) to dpi-h-ra checked`,
  );
} else {
  console.log("· dpi-h-ra is not mounted: ArchiMate and cross-instance glossary links not checked");
}
process.exit(bad ? 1 : 0);
