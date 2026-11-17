import { figure } from "../../schema/builders";

export default figure({
  label: "fig:cover",
  file: "media/cover.svg",
  caption: "Cover of the WHO publication this folio transcribes: Digital transformation handbook for health supply chain architecture. Geneva: World Health Organization; 2024. ISBN 978-92-4-010119-7",
  page: 1,
  // declared-path-literal: L1 provenance anchor in who-iris (the cited cover of the source publication)
  meta: {"title": "Cover", "source": {"library": "9789240101197-eng", "file": "who-iris/library/9789240101197-eng/cover.png", "page": 1, "method": "cited", "generator": "scripts/figures/cover.py", "citation": "Digital transformation handbook for health supply chain architecture. Geneva: World Health Organization; 2024 (SMART Guidelines collection). ISBN 978-92-4-010119-7. Licence: CC BY-NC-SA 3.0 IGO.", "decision": "owner card 2026-11-17 (covers for the dth-* folios, B): the original cover, unchanged and cited, as in dth-phc#62"}},
});
