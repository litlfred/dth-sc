Models the nine core health supply chain processes (product selection, forecasting and supply planning, procurement, port/customs clearance, warehousing and inventory management, transportation and cold chain management, requisition and order management, dispensing to patients, and return/recall & consumption feedback) and bidirectional information flow across the ten supply chain partner roles in Introduction Figures 1–3.

![End-to-end health supply chain core processes and information flow (SC-BP-02)](media/bp-sc-bp-02-end-to-end-supply-chain-processes.svg)

**Swimlanes (one lane per role):**

- `Lane_BP02_MOH` — **Ministry of health (MOH)** (`pers:ministry-of-health`)
- `Lane_BP02_Regulatory` — **National regulatory authority** (`pers:regulatory-authority`)
- `Lane_BP02_Procurer` — **Procurer (national or partner procurement agency)** (`pers:procurer`)
- `Lane_BP02_Manufacturer` — **Manufacturer and distributor** (`pers:manufacturer-distributor`)
- `Lane_BP02_CentralWarehouse` — **Central warehouse (central medical store)** (`pers:central-warehouse`)
- `Lane_BP02_LogisticsProvider` — **Logistics provider (transportation and cold chain)** (`pers:logistics-provider`)
- `Lane_BP02_RegionalWarehouse` — **Regional and district warehouse (branch warehouse)** (`pers:regional-district-warehouse`)
- `Lane_BP02_HealthFacility` — **Health facility (service delivery point)** (`pers:health-facility`)
- `Lane_BP02_CHW` — **Community health worker** (`pers:community-health-worker`)
- `Lane_BP02_Individual` — **Individual (health service user / patient)** (`pers:health-service-user`)

| Step ID | Lane (persona) | Activity | Linked blocks / decision table | Handbook basis |
| --- | --- | --- | --- | --- |
| `Task_BP02_01` | `pers:ministry-of-health` | 1. Product selection & 2. Forecasting and supply planning (Forecasting & Supply Planning System) | `prose:introduction-page-011`, `fig:ch02-fig-14`, `tbl:annex-5` | Introduction Figs. 1–3 (PDF pp. 11–12), Ch 2 Fig. 14 (PDF p. 34), Ch 2 Fig. 20 (PDF p. 41), Annex 5 (PDF p. 70) |
| `Task_BP02_02` | `pers:regulatory-authority` | Verify marketing authorization and publish product master data in National Product Catalogue (Product Registry) | `prose:introduction-page-012`, `fig:ch02-fig-14`, `tbl:annex-5` | Introduction Figs. 1–3 (PDF pp. 11–12), Ch 2 Fig. 14 (PDF p. 34), Ch 2 Fig. 20 (PDF p. 41), Annex 5 (PDF p. 70) |
| `Task_BP02_03` | `pers:procurer` | 3. Procurement & supplier/contract management: issue tenders and purchase orders (Procurement & Supplier Systems) | `prose:introduction-page-011`, `fig:ch02-fig-14`, `tbl:annex-4` | Introduction Figs. 1–3 (PDF pp. 11–12), Ch 2 Fig. 14 (PDF p. 34), Ch 2 Fig. 20 (PDF p. 41), Annex 5 (PDF p. 70) |
| `Task_BP02_04` | `pers:manufacturer-distributor` | Manufacture, label/serialize products and transmit advance shipping notice (Manufacturer Systems) | `prose:introduction-page-011`, `prose:ch04-page-056` | Introduction Figs. 1–3 (PDF pp. 11–12), Ch 2 Fig. 14 (PDF p. 34), Ch 2 Fig. 20 (PDF p. 41), Annex 5 (PDF p. 70) |
| `Task_BP02_05` | `pers:central-warehouse` | 4. Port/customs clearance & 5. Warehousing and inventory receipt at central store (WMS / ERP) | `prose:introduction-page-011`, `fig:ch02-fig-14`, `tbl:annex-5` | Introduction Figs. 1–3 (PDF pp. 11–12), Ch 2 Fig. 14 (PDF p. 34), Ch 2 Fig. 20 (PDF p. 41), Annex 5 (PDF p. 70) |
| `Task_BP02_06` | `pers:central-warehouse` | 7. Requisition & order management: allocate national stock against subnational/facility orders (OMS) | `prose:introduction-page-011`, `fig:ch02-fig-14`, `tbl:annex-5` | Introduction Figs. 1–3 (PDF pp. 11–12), Ch 2 Fig. 14 (PDF p. 34), Ch 2 Fig. 20 (PDF p. 41), Annex 5 (PDF p. 70) |
| `Task_BP02_07` | `pers:logistics-provider` | 6. Transportation & cold chain management: dispatch and monitor shipment in transit (TMS / Cold Chain System) | `prose:introduction-page-011`, `fig:ch02-fig-14` | Introduction Figs. 1–3 (PDF pp. 11–12), Ch 2 Fig. 14 (PDF p. 34), Ch 2 Fig. 20 (PDF p. 41), Annex 5 (PDF p. 70) |
| `Task_BP02_08` | `pers:regional-district-warehouse` | Receive consignment, manage branch warehouse inventory & fulfil facility requisitions (WMS / OMS) | `prose:introduction-page-011`, `fig:ch02-fig-18`, `fig:ch02-fig-19`, `tbl:annex-5` | Introduction Figs. 1–3 (PDF pp. 11–12), Ch 2 Fig. 14 (PDF p. 34), Ch 2 Fig. 20 (PDF p. 41), Annex 5 (PDF p. 70) |
| `Task_BP02_09` | `pers:health-facility` | Receive stock at service delivery point, manage inventory & submit replenishment orders (HFLMS / OMS) | `prose:introduction-page-011`, `fig:ch02-fig-18`, `tbl:annex-4`, `tbl:annex-5` | Introduction Figs. 1–3 (PDF pp. 11–12), Ch 2 Fig. 14 (PDF p. 34), Ch 2 Fig. 20 (PDF p. 41), Annex 5 (PDF p. 70) |
| `Task_BP02_10` | `pers:health-facility` | 8. Dispensing at facility and recording consumption & stock-on-hand data (Dispensing System) | `prose:introduction-page-011`, `fig:ch02-fig-14`, `tbl:annex-5` | Introduction Figs. 1–3 (PDF pp. 11–12), Ch 2 Fig. 14 (PDF p. 34), Ch 2 Fig. 20 (PDF p. 41), Annex 5 (PDF p. 70) |
| `Task_BP02_11` | `pers:community-health-worker` | 8. Last-mile community dispensing & mobile stock/consumption reporting (CHW mobile tool) | `prose:introduction-page-011`, `tbl:annex-5` | Introduction Figs. 1–3 (PDF pp. 11–12), Ch 2 Fig. 14 (PDF p. 34), Ch 2 Fig. 20 (PDF p. 41), Annex 5 (PDF p. 70) |
| `Task_BP02_12` | `pers:health-service-user` | Receive dispensed medicine/vaccine; 9. Report adverse event or return/recall product if alerted | `prose:introduction-page-011`, `prose:ch04-page-055`, `tbl:annex-5` | Introduction Figs. 1–3 (PDF pp. 11–12), Ch 2 Fig. 14 (PDF p. 34), Ch 2 Fig. 20 (PDF p. 41), Annex 5 (PDF p. 70) |
