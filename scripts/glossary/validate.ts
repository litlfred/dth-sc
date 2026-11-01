#!/usr/bin/env bun
/**
 * Validate dth-sc's glossary, table blocks (SC1b), personas, BPMN 2.0
 * business processes, DMN decision tables, and cross-instance links to
 * dpi-h-ra (smart-ra).
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { GlossarySchema } from "../../folio-assistant-core/schemas/glossary.ts";
import { instanceNs } from "../../folio-assistant-core/scripts/glossary-page.ts";
import {
  checkDakBpmnHasProcess,
  checkDakCompanionPresent,
  checkDakDmnHasDecisionTable,
} from "../../smart-base/pipeline/qa-checkers-dak.ts";
import {
  loadDecisionTable,
  unreadableExpressions,
} from "../../cat-harness-tools/src/workflow/decision-table.ts";
import { verifyL1Coverage } from "../folio/check-l1-coverage.ts";

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
      bareIds.add(t.id);
      known.add(t.iri ?? `${inst.ns}glossary/${g.id}/${t.id}`);
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

const walk = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name)) : e.name.endsWith(".ts") ? [join(dir, e.name)] : [],
  );

const allTsFiles = walk("folio/dth-sc");

// ── Glossary and ArchiMate links in block manifests ────────────────
const ra = mounted.find((m) => m.name === "dpi-h-ra");
if (ra) {
  const { readArchimate } = await import("../../cat-harness-tools/archimate/schemas/archimate.ts");
  type Ids = Map<string, { elements: Set<string>; views: Set<string> }>;
  const loadModels = (root: string): Ids => {
    const out: Ids = new Map();
    const cfgPath = join(root, "archimate/cat-archimate.config.json");
    if (!existsSync(cfgPath)) return out;
    for (const cm of JSON.parse(readFileSync(cfgPath, "utf-8")).models) {
      const p = join(root, "archimate", cm.file);
      if (!existsSync(p)) continue;
      const model = readArchimate(readFileSync(p));
      out.set(cm.id, {
        elements: new Set(model.elements.map((e: { id: string }) => e.id)),
        views: new Set(model.views.map((v: { id: string }) => v.id)),
      });
    }
    return out;
  };
  const ids = loadModels(ra.root);
  // This DTH's own overlay on smart-ra (archimate/, dth-sc#2 SC3): its views and the elements it adds.
  const own = loadModels(".");
  const raElements = new Set([...ids.values()].flatMap((m) => [...m.elements]));
  const iriRe = /\/archimate\/([^/]+)\/(elements|views)\/([^/]+)\.jsonld$/;
  let archBlocks = 0;
  let archLinks = 0;
  let figMappings = 0;
  let glosBlocks = 0;
  let glosLinks = 0;
  for (const file of allTsFiles) {
    const src = readFileSync(file, "utf-8");
    if (!src.includes('"archimate"') && !src.includes('"glossary"') && !src.includes('"glossaryTerms"')) continue;
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
    if (Array.isArray(meta.glossaryTerms) && meta.glossaryTerms.length > 0) {
      for (const iri of meta.glossaryTerms) {
        checkTermRef(`${file} meta.glossaryTerms`, String(iri));
      }
    }
    const a = meta.archimate;
    if (a) {
      archBlocks++;
      for (const x of [...(a.elements ?? []), ...(a.views ?? [])]) {
        archLinks++;
        const hit = String(x.iri).match(iriRe);
        const iri = String(x.iri);
        const models = iri.startsWith("https://litlfred.github.io/smart-ra/")
          ? ids
          : iri.startsWith("https://litlfred.github.io/dth-sc/")
            ? own
            : undefined;
        const ok = hit && models?.get(hit[1])?.[hit[2] as "elements" | "views"].has(hit[3]);
        if (!ok) {
          console.error(`✗ ${file}: ${x.iri} (${x.name}) is not in the mounted dpi-h-ra model or the dth-sc overlay`);
          bad++;
        } else if (models === own && hit && raElements.has(hit[3])) {
          console.error(`✗ ${file}: ${x.iri} (${x.name}) is a smart-ra element: link it by its smart-ra IRI`);
          bad++;
        }
      }
      for (const fm of a.figures ?? []) {
        figMappings++;
        const ok = (ids.get(String(fm.model)) ?? own.get(String(fm.model)))?.views.has(String(fm.view));
        if (!ok) {
          console.error(`✗ ${file}: figure ${fm.figure} view ${fm.view} is not in ArchiMate model ${fm.model} (dpi-h-ra or the dth-sc overlay)`);
          bad++;
        }
      }
    }
  }
  console.log(`✓ Glossary links: ${glosLinks} link(s) from ${glosBlocks} block(s) to dth-sc / dpi-h-ra checked`);
  console.log(
    `✓ ArchiMate: ${archLinks} link(s) and ${figMappings} figure-view mapping(s) from ${archBlocks} block(s) to dpi-h-ra and the dth-sc overlay checked`,
  );
} else {
  console.log("· dpi-h-ra is not mounted: ArchiMate and cross-instance glossary links not checked");
}

// ── SC1b Table blocks, Personas, BPMN Business Processes, and DMN Decision Tables ──
let tableCount = 0;
let tableRowCount = 0;
const personaLabels = new Set<string>();
let personaCount = 0;

for (const file of allTsFiles) {
  const src = readFileSync(file, "utf-8");
  const metaMatch = src.match(/meta: (\{.*\}),\n/);
  const meta = metaMatch ? JSON.parse(metaMatch[1]) : undefined;

  if (src.includes("export default table(")) {
    tableCount++;
    const mdPath = file.replace(/\.ts$/, ".md");
    if (!existsSync(mdPath)) {
      console.error(`✗ ${file}: missing companion ${mdPath}`);
      bad++;
    } else {
      const md = readFileSync(mdPath, "utf-8");
      const rows = md.split("\n").filter((l) => l.startsWith("|"));
      tableRowCount += Math.max(0, rows.length - 2);
      if (rows.length < 3) {
        console.error(`✗ ${mdPath}: table has fewer than 1 data row`);
        bad++;
      }
    }
    if (!meta?.source?.library || !meta?.source?.section) {
      console.error(`✗ ${file}: table is missing meta.source.library or meta.source.section`);
      bad++;
    }
  }

  if (src.includes("export default persona(")) {
    personaCount++;
    const labelMatch = src.match(/label:\s*"([^"]+)"/);
    const label = labelMatch?.[1];
    if (label) personaLabels.add(label);

    if (!meta?.roleId || !Array.isArray(meta?.bpmnLanes) || meta.bpmnLanes.length === 0) {
      console.error(`✗ ${file}: persona is missing roleId or bpmnLanes`);
      bad++;
    }
    if (!Array.isArray(meta?.archimate?.elements) || meta.archimate.elements.length === 0) {
      console.error(`✗ ${file}: persona is missing meta.archimate.elements`);
      bad++;
    }
    if (!Array.isArray(meta?.glossaryTerms) || meta.glossaryTerms.length === 0) {
      console.error(`✗ ${file}: persona is missing meta.glossaryTerms`);
      bad++;
    }
    for (const lane of meta?.bpmnLanes ?? []) {
      if (!existsSync(lane.bpmnFile)) {
        console.error(`✗ ${file}: bpmnFile ${lane.bpmnFile} does not exist`);
        bad++;
        continue;
      }
      const bpmnXml = readFileSync(lane.bpmnFile, "utf-8");
      if (!bpmnXml.includes(`id="${lane.laneId}"`) || !bpmnXml.includes(`partitionElementRef="${label}"`)) {
        console.error(`✗ ${file}: lane ${lane.laneId} with partitionElementRef="${label}" not found in ${lane.bpmnFile}`);
        bad++;
      }
    }
  }
}

console.log(`✓ Tables (SC1b): ${tableCount} structured table block(s) with ${tableRowCount} data row(s) traced to L1 sections checked`);
console.log(`✓ Personas: ${personaCount} persona block(s) linked to BPMN lanes, ArchiMate elements, and glossary terms checked`);

let bpCount = 0;
let laneCount = 0;
let dtCount = 0;
let dtRuleCount = 0;

for (const file of allTsFiles) {
  const src = readFileSync(file, "utf-8");
  const dir = dirname(file);
  const label = src.match(/label:\s*"([^"]+)"/)?.[1] ?? file;

  if (src.includes("export default businessProcess(")) {
    bpCount++;
    const c1 = checkDakCompanionPresent(dir, { kind: "business-process", label, sourceFile: file });
    const c2 = checkDakBpmnHasProcess(dir, { kind: "business-process", label, sourceFile: file });
    for (const c of [c1, c2]) {
      if (c && c.result !== "pass") {
        console.error(`✗ ${file} (${c.id}): ${c.evidence}`);
        bad++;
      }
    }
    const bpmnPath = file.replace(/\.ts$/, ".bpmn");
    const bpmnXml = readFileSync(bpmnPath, "utf-8");
    const lanes = [...bpmnXml.matchAll(/<bpmn:lane\s+([^>]+)>/g)];
    if (lanes.length === 0) {
      console.error(`✗ ${bpmnPath}: has no <bpmn:lane> elements`);
      bad++;
    }
    for (const l of lanes) {
      laneCount++;
      const roleRef = l[1].match(/partitionElementRef="([^"]+)"/)?.[1];
      if (!roleRef || !personaLabels.has(roleRef)) {
        console.error(`✗ ${bpmnPath}: lane missing partitionElementRef or persona "${roleRef}" not declared`);
        bad++;
      }
    }
    const metaMatch = src.match(/meta: (\{.*\}),\n/);
    const meta = metaMatch ? JSON.parse(metaMatch[1]) : undefined;
    const svgPath = meta?.svgFile ? join("folio/dth-sc", meta.svgFile) : "";
    if (!svgPath || !existsSync(svgPath)) {
      console.error(`✗ ${file}: rendered SVG ${svgPath} is missing`);
      bad++;
    }
  }

  if (src.includes("export default decisionTable(")) {
    dtCount++;
    const c1 = checkDakCompanionPresent(dir, { kind: "decision-table", label, sourceFile: file });
    const c2 = checkDakDmnHasDecisionTable(dir, { kind: "decision-table", label, sourceFile: file });
    for (const c of [c1, c2]) {
      if (c && c.result !== "pass") {
        console.error(`✗ ${file} (${c.id}): ${c.evidence}`);
        bad++;
      }
    }
    const decisionId = src.match(/decisionId:\s*"([^"]+)"/)?.[1];
    const dmnPath = file.replace(/\.ts$/, ".dmn");
    if (!decisionId) {
      console.error(`✗ ${file}: missing decisionId`);
      bad++;
    } else {
      try {
        const table = await loadDecisionTable(dmnPath, decisionId);
        dtRuleCount += table.rules.length;
        const unreadable = unreadableExpressions(table);
        if (unreadable.length > 0) {
          console.error(`✗ ${dmnPath}: ${unreadable.length} unreadable FEEL expression(s):`, unreadable);
          bad++;
        }
      } catch (e) {
        console.error(`✗ ${dmnPath}: failed to load decision table:`, e);
        bad++;
      }
    }
  }
}

console.log(`✓ Business processes: ${bpCount} BPMN 2.0 process(es) with ${laneCount} role-bound lane(s) and rendered SVGs checked`);
console.log(`✓ Decision tables: ${dtCount} DMN table(s) with ${dtRuleCount} rule(s) checked against dak-dmn-has-decision-table and FEEL evaluator`);

const l1Res = verifyL1Coverage();
if (!l1Res.ok) {
  for (const err of l1Res.errors) console.error(`✗ ${err}`);
  bad += l1Res.errors.length;
} else {
  console.log(l1Res.summary);
}

process.exit(bad ? 1 : 0);
