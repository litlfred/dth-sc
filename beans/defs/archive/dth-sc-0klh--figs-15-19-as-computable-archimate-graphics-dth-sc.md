---
# dth-sc-0klh
$schema: bean/1.0.0
title: Figs 15-19 as computable ArchiMate graphics (dth-sc#10)
status: completed
type: task
priority: normal
tags:
    - dth-sc
    - sc3
created_at: 2026-11-01T20:46:22Z
updated_at: 2026-11-01T23:01:40Z
---

Replace the printed PNGs of Figs 15-19 with SVGs drawn from the dth-sc overlay views (archimate/0.1.0-draft.1). Meaning unchanged. PR litlfred/dth-sc#10, issue #9. One editing--fig:N instance per block. Owner: this session (thread 'Finish the dth-sc workplan').



## Findings (editing--fig-15..19, 2026-11-01)

Mechanical: check:kg-blocks, check:dth-blocks, check:dth-glossary, render_figures --check, check:l1-coverage, check:review-anchors and check:page-furniture all pass at e7c4b43 (core 0a39c5e). qa-sweep per figure: 18 pass, 33 n/a, 1 warn.

Agent review against the printed figures (PDF pp. 36-40, pdfplumber text plus the page images):
(1) Every box in the printed figures has an element in the view. The labels use smart-ra's element names, which are longer than the printed ones, e.g. "Warehouse Management System" for "Warehouse management" and "Health Management Information System" for "Health mgmt. info systems". The meaning is the same, because each base element is the smart-ra element the handbook's Fig. 14 names.
(2) Fig. 15 only: the printed figure labels both data-service groups "Foundational components". The view names them "Analytics" and "Traceability", as Figs 14 and 16-19 print them. This is recorded in scripts/archimate/build_variant_views.py. The editor should look at it.
(3) Owned elements (dth-sc, not smart-ra): National Level, District Level, Facility Level and Inventory Management System. They appear only in Figs 18-19, where the printed figures show them. smart-ra#205 and dth-sc#13 track the overlap.
(4) QA warning (advisory): acronym-in-glossary flags DTH and SC, which come from the view name in the new caption.
No recommendation, statistic or claim was added or changed.



Revision (1e6b167, editor card Q-DTH1-8 B): Fig. 15's data-service groups now read 'Foundational components' as printed. Finding (2) resolved; checks rerun and pass.



Merged in dth-sc#10 as 2dac8b8 (2026-11-01 23:01Z).
