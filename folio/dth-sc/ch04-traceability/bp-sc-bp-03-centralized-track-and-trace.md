Models end-to-end medical product serialization, traceability event capture (what: product identifier, batch, serial; when: timestamp; where: location; why: receive, ship, dispense, discard), central aggregation via the DHSC interoperability layer and data warehouse, point-of-dispense verification, and regulatory anomaly/recall investigation in the centralized traceability model (Chapter 4 Figures 24–25).

![Centralized medical product track-and-trace, verification and recall workflow (SC-BP-03)](media/bp-sc-bp-03-centralized-track-and-trace.svg)

**Swimlanes (one lane per role):**

- `Lane_BP03_Manufacturer` — **Manufacturer and distributor** (`pers:manufacturer-distributor`)
- `Lane_BP03_CentralWarehouse` — **Central warehouse (central medical store)** (`pers:central-warehouse`)
- `Lane_BP03_RegionalWarehouse` — **Regional and district warehouse (branch warehouse)** (`pers:regional-district-warehouse`)
- `Lane_BP03_HealthFacility` — **Health facility (service delivery point)** (`pers:health-facility`)
- `Lane_BP03_DHSCTraceabilityHub` — **DHSC interoperability layer and traceability services hub (system)** (`pers:system-dhsc-traceability-hub`)
- `Lane_BP03_Regulatory` — **National regulatory authority** (`pers:regulatory-authority`)
- `Lane_BP03_Individual` — **Individual (health service user / patient)** (`pers:health-service-user`)

| Step ID | Lane (persona) | Activity | Linked blocks / decision table | Handbook basis |
| --- | --- | --- | --- | --- |
| `Task_BP03_01` | `pers:manufacturer-distributor` | Assign product code, batch, expiry & serial numbers; publish Event: Ship (what/when/where/why) | `prose:ch04-page-056`, `fig:ch04-fig-24`, `fig:ch04-fig-25` | Ch 4 'Traceability models' and Figs. 24–25 (PDF pp. 54–56) |
| `Task_BP03_02` | `pers:system-dhsc-traceability-hub` | Ingest manufacturer master & shipping event data via Interoperability Layer into Data Warehouse | `prose:ch04-page-055`, `fig:ch04-fig-24`, `dt:sc-dt-02-traceability-model-selection` | Ch 4 'Traceability models' and Figs. 24–25 (PDF pp. 54–56) |
| `Task_BP03_03` | `pers:central-warehouse` | Scan inbound shipment, verify serials & record Event: Receive and Event: Ship in WMS | `prose:ch04-page-055`, `fig:ch04-fig-24`, `fig:ch04-fig-25` | Ch 4 'Traceability models' and Figs. 24–25 (PDF pp. 54–56) |
| `Task_BP03_04` | `pers:regional-district-warehouse` | Scan consignment at regional/district warehouse, verify & record Event: Receive / Ship in WMS & TMS | `prose:ch04-page-055`, `fig:ch04-fig-24`, `fig:ch04-fig-25` | Ch 4 'Traceability models' and Figs. 24–25 (PDF pp. 54–56) |
| `Task_BP03_05` | `pers:health-facility` | Scan product at health facility, verify serial & record Event: Receive and Event: Dispense | `prose:ch04-page-055`, `fig:ch04-fig-24`, `fig:ch04-fig-25` | Ch 4 'Traceability models' and Figs. 24–25 (PDF pp. 54–56) |
| `Task_BP03_06` | `pers:health-service-user` | Query product serial number via mobile/web verification interface at point of care (Fig. 25) | `prose:ch04-page-055`, `fig:ch04-fig-24`, `fig:ch04-fig-25` | Ch 4 'Traceability models' and Figs. 24–25 (PDF pp. 54–56) |
| `Task_BP03_07` | `pers:system-dhsc-traceability-hub` | Synthesize chain-of-custody events and evaluate verification & anomaly rules (Fig. 24, SC-DT-02) | `prose:ch04-page-055`, `fig:ch04-fig-24`, `dt:sc-dt-02-traceability-model-selection` | Ch 4 'Traceability models' and Figs. 24–25 (PDF pp. 54–56) |
| `Task_BP03_08` | `pers:health-service-user` | Display verified authenticity and custody history to patient and health worker (Fig. 25) | `prose:ch04-page-056`, `fig:ch04-fig-25` | Ch 4 'Traceability models' and Figs. 24–25 (PDF pp. 54–56) |
| `Task_BP03_09` | `pers:regulatory-authority` | Investigate anomaly / suspect serial and issue targeted batch quarantine or recall | `prose:ch04-page-055`, `fig:ch04-fig-24` | Ch 4 'Traceability models' and Figs. 24–25 (PDF pp. 54–56) |
