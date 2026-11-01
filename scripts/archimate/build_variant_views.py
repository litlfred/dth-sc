#!/usr/bin/env python3
"""Build the dth-sc ArchiMate overlay: the five architecture variants of Figs 15-19.

Owner rule (2026-11-01 08:13Z, card Q-RA1 A): a DTH builds an overlay on the
smart-ra model and does not add to it. The five views here reuse the elements of
smart-ra's "DHSC Architecture Framework (DTH SC Fig. 14)" view. Elements smart-ra
already has are reference copies tagged `overlay:base` (value: the smart-ra IRI),
so the overlay's views can draw them. Elements this handbook adds are tagged
`overlay:owner` = `dth-sc`.

Only membership is drawn, as in the figures; no other relationships are asserted.

usage: build_variant_views.py <smart-ra .archimate> <smart-ra version> <out .archimate>
"""
import copy, hashlib, re, sys, zipfile
import xml.etree.ElementTree as ET

XSI = "http://www.w3.org/2001/XMLSchema-instance"
ARC = "http://www.archimatetool.com/archimate"
ET.register_namespace("xsi", XSI)
ET.register_namespace("archimate", ARC)
T = f"{{{XSI}}}type"
OWNER = "dth-sc"
SOURCE = "WHO Digital transformation handbook for health supply chain architecture (9789240101197); litlfred/dth-sc"

base_path, base_ver, out_path = sys.argv[1:4]
with zipfile.ZipFile(base_path) as z:
    base = ET.fromstring(z.read("model.xml"))
by_id, top_type = {}, {}
for top in base.findall("folder"):
    for el in top.iter("element"):
        by_id[el.get("id")] = el
        top_type[el.get("id")] = top.get("type")
# Names resolve against the elements smart-ra's Fig. 14 view draws (some names,
# such as "Traceability", name more than one smart-ra element).
FIG14 = next(e for e in by_id.values() if e.get(T) == "archimate:ArchimateDiagramModel"
             and e.get("name") == "DHSC Architecture Framework (DTH SC Fig. 14)")
by_name = {}
for n in FIG14.iter("child"):
    i = n.get("archimateElement")
    if i and i not in by_name.get(by_id[i].get("name"), []):
        by_name.setdefault(by_id[i].get("name"), []).append(i)


def sid(*parts):
    """A stable id, so a rebuild gives the same file."""
    return "id-" + hashlib.md5(":".join(("dth-sc",) + parts).encode()).hexdigest()


# Elements this handbook adds (overlay:owner = dth-sc).
OWNED = {
    "National Level": ("archimate:Grouping", "other",
        "Health supply chain information systems run at the national (central) level (DTH SC Figs 18-19)."),
    "District Level": ("archimate:Grouping", "other",
        "Health supply chain information systems run at the district level (DTH SC Fig. 19)."),
    "Facility Level": ("archimate:Grouping", "other",
        "Health supply chain information systems run at the facility level (DTH SC Figs 18-19)."),
    "Inventory Management System": ("archimate:ApplicationComponent", "application",
        "Inventory management below the central warehouse, at district and facility level (DTH SC Figs 18-19). "
        "Close to smart-ra's Health Facility Logistics Management System; kept as its own element until the owner decides (dth-sc#2)."),
}
owned_ids = {n: sid("element", n) for n in OWNED}


def ref(name):
    if name in owned_ids:
        return owned_ids[name]
    ids = by_name.get(name, [])
    assert len(ids) == 1, (name, ids)
    return ids[0]


# Layout: a leaf is a name; a group is (name, cols, [children]); a "free" box is a
# group with name None (laid out, not drawn). Leaves are 170x55, gaps 12.
W, H, G, HEAD = 170, 55, 12, 40
INTEROP = ("Interoperability Layer", 7, ["Interoperability Component", "Authentication", "Orchestration",
           "Encryption", "Validation", "Transformation", "Translation"])
HSCIS = ("Health Supply Chain Information Systems", 4, [
    "Forecasting & Supply Planning System", "Order Management System", "Warehouse Management System",
    "Cold Chain Management System", "Procurement Management System", "Supplier & Contract Management System",
    "Transportation Management System", "Dispensing System"])
SHARED = ("Shared Services", 1, [("Foundational Components", 1, ["Facility registry", "Product Registry", "Supplier registry"])])
DATA = ("Data Services", 2, [("Analytics", 1, ["Supply Chain Reports", "Data Warehouse"]),
                             ("Traceability", 1, ["Track and Trace", "Product Verification"])])
ECO = ("Digital Ecosystems", 1, ["Quality Systems", "Health Management Information System",
                                 "Regulatory Systems", "Finance and Insurance Systems"])
EXT = ("External Systems", 1, ["Global Platforms", "Manufacturer Systems", "Data Repositories"])
NATIONAL = ("National Level", 2, ["Forecasting & Supply Planning System", "Procurement Management System",
            "Supplier & Contract Management System", "Transportation Management System",
            "Warehouse Management System", "Cold Chain Management System"])


def ent(*rows):
    return ("Digital Health Supply Chain Enterprise", 1, [(None, len(r), list(r)) for r in rows])


VIEWS = [
    ("15", "Maturity-based Architecture: SCISMM Level 3 to Level 4 (DTH SC Fig. 15)",
     "Fig. 15 (PDF 36): the framework without external systems and digital ecosystems. The figure labels both "
     "data-service groups \"Foundational components\"; the view uses Analytics and Traceability, as in Fig. 14.",
     [ent([SHARED, DATA], [INTEROP], [HSCIS])]),
    ("16", "Maturity-based Architecture: SCISMM Level 4 to Level 5 (DTH SC Fig. 16)",
     "Fig. 16 (PDF 37): the full framework, interoperating with digital ecosystems and external systems.",
     [ent([SHARED, DATA], [INTEROP], [HSCIS]), (None, 1, [ECO, EXT])]),
    ("17", "Supply Chain Design: Centralized Management (DTH SC Fig. 17)",
     "Fig. 17 (PDF 38): SCISMM Level 5; all supply chain services are centrally managed, as in Fig. 14.",
     [ent([SHARED, DATA], [INTEROP], [HSCIS]), (None, 1, [ECO, EXT])]),
    ("18", "Supply Chain Design: Decentralized Management, Option A (DTH SC Fig. 18)",
     "Fig. 18 (PDF 39): SCISMM Level 5; the supply chain systems split between the national level and the facility level.",
     [ent([SHARED, DATA], [INTEROP], [("Health Supply Chain Information Systems", 2, [
         NATIONAL,
         ("Facility Level", 2, ["Order Management System", "Dispensing System",
                                "Inventory Management System", "Cold Chain Management System"])])]),
      (None, 1, [ECO, EXT])]),
    ("19", "Supply Chain Design: Decentralized Management, Option B (DTH SC Fig. 19)",
     "Fig. 19 (PDF 40): SCISMM Level 5; districts procure apart from the central level. The figure draws order, "
     "inventory and cold chain management on the district/facility boundary; the view places them between the two levels.",
     [ent([SHARED, DATA], [INTEROP], [("Health Supply Chain Information Systems", 4, [
         NATIONAL,
         ("District Level", 1, ["Procurement Management System"]),
         (None, 1, ["Order Management System", "Inventory Management System", "Cold Chain Management System"]),
         ("Facility Level", 1, ["Dispensing System"])])]),
      (None, 1, [ECO, EXT])]),
]


def size(node):
    if isinstance(node, str):
        return W, H
    name, cols, kids = node
    sizes = [size(k) for k in kids]
    rows = [sizes[i:i + cols] for i in range(0, len(sizes), cols)]
    colw = [max((r[c][0] for r in rows if c < len(r)), default=0) for c in range(cols)]
    rowh = [max(s[1] for s in r) for r in rows]
    top = HEAD if name else 0
    pad = G if name else 0
    return pad * 2 + sum(colw) + G * (cols - 1), top + pad + sum(rowh) + G * (len(rows) - 1)


used = set()


def place(parent, node, x, y, path):
    """Draw node at (x, y) inside parent; return nothing. Unnamed boxes draw their children only."""
    if isinstance(node, str) or node[0] is not None:
        name = node if isinstance(node, str) else node[0]
        eid = ref(name)
        used.add(eid)
        w, h = size(node)
        c = ET.SubElement(parent, "child", {T: "archimate:DiagramObject", "id": sid(*path, name),
                                            "archimateElement": eid})
        ET.SubElement(c, "bounds", {"x": str(x), "y": str(y), "width": str(w), "height": str(h)})
        if isinstance(node, str):
            return
        parent, ox, oy = c, G, HEAD
    else:
        ox, oy = x, y
    name, cols, kids = node
    sizes = [size(k) for k in kids]
    rows = [list(range(i, min(i + cols, len(kids)))) for i in range(0, len(kids), cols)]
    colw = [max((sizes[r[c]][0] for r in rows if c < len(r)), default=0) for c in range(cols)]
    cy = oy
    for r in rows:
        cx = ox
        for c, k in enumerate(r):
            place(parent, kids[k], cx, cy, path + (str(k),))
            cx += colw[c] + G
        cy += max(sizes[k][1] for k in r) + G


views = []
for fig, title, doc, roots in VIEWS:
    v = ET.Element("element", {T: "archimate:ArchimateDiagramModel", "name": title, "id": sid("view", fig)})
    ET.SubElement(v, "documentation").text = doc + " Groupings and members as drawn; no relationships beyond membership are asserted."
    ET.SubElement(v, "property", {"key": "source", "value": SOURCE})
    ET.SubElement(v, "property", {"key": "figure", "value": f"Fig. {fig}"})
    ET.SubElement(v, "property", {"key": "overlay:owner", "value": OWNER})
    x = 24
    for k, r in enumerate(roots):
        place(v, r, x, 24, (fig, str(k)))
        x += size(r)[0] + 24
    views.append(v)

model = ET.Element(f"{{{ARC}}}model", {"name": "DTH-SC overlay on the DPI-H reference architecture",
                                       "id": "id-dthsc-overlay-0-1-0-draft-1", "version": "5.0.0"})
ET.SubElement(model, "purpose").text = (
    f"Overlay of dth-sc on smart-ra ArchiMate {base_ver}: the five architecture variants of the supply chain DTH "
    "(Figs 15-19). Elements tagged overlay:base are reference copies of smart-ra elements (the IRI names the original); "
    "elements tagged overlay:owner=dth-sc are added by this DTH and are not part of smart-ra. "
    "Built by scripts/archimate/build_variant_views.py.")
folders = {}
for top in base.findall("folder"):
    folders[top.get("type")] = ET.SubElement(model, "folder", {"name": top.get("name"), "id": top.get("id"), "type": top.get("type")})
base_sub = {}


def base_folder(kind):
    if kind not in base_sub:
        base_sub[kind] = ET.SubElement(folders[kind], "folder", {"name": "smart-ra (base, reference copies)",
                                                                 "id": folders[kind].get("id") + "-base"})
    return base_sub[kind]


counts = {"owned": 0, "base": 0}
for name, (typ, kind, doc) in OWNED.items():
    if owned_ids[name] not in used:
        continue
    e = ET.SubElement(folders[kind], "element", {T: typ, "name": name, "id": owned_ids[name]})
    ET.SubElement(e, "documentation").text = doc
    ET.SubElement(e, "property", {"key": "overlay:owner", "value": OWNER})
    counts["owned"] += 1
for i in sorted(used - set(owned_ids.values()), key=lambda i: (by_id[i].get(T), by_id[i].get("name"))):
    e = copy.deepcopy(by_id[i])
    for p in e.findall("property"):
        e.remove(p)
    pos = 1 if e.find("documentation") is not None else 0
    e.insert(pos, ET.Element("property", {"key": "overlay:base", "value":
             f"https://litlfred.github.io/smart-ra/archimate/{base_ver}/elements/{i}.jsonld"}))
    base_folder(top_type[i]).append(e)
    counts["base"] += 1
for v in views:
    folders["diagrams"].append(v)
for kind, f in list(folders.items()):
    if len(f) == 0 and kind not in ("diagrams",):
        model.remove(f)
ET.indent(model)
xml = b'<?xml version="1.0" encoding="UTF-8"?>\n' + ET.tostring(model, encoding="utf-8")
with zipfile.ZipFile(out_path, "w", zipfile.ZIP_DEFLATED) as z:
    zi = zipfile.ZipInfo("model.xml", date_time=(1980, 1, 1, 0, 0, 0))
    zi.compress_type = zipfile.ZIP_DEFLATED
    z.writestr(zi, xml)
print(f"{out_path}: {counts['owned']} owned, {counts['base']} smart-ra reference copies, {len(views)} views")
for v in views:
    print(f"  {v.get('id')}  {v.get('name')}")
