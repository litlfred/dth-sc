*Supply chain partner role.* Pharmaceutical or health product manufacturer and wholesale distributor that produces, labels, serializes, and ships health products into the national supply chain.

| Attribute | Description | Handbook basis |
| --- | --- | --- |
| **Role ID** | `SC-R-03` (`pers:manufacturer-distributor`, `person`) | Introduction Figs. 1 & 3 (PDF pp. 11–12), Ch 2 Fig. 14 (PDF p. 34), Ch 4 Figs. 24–25 (PDF pp. 55–56) |
| **Goals** | Supply contracted health products meeting regulatory standards and provide standardized product master data and batch/serial traceability data before physical delivery. | Introduction Figs. 1 & 3 (PDF pp. 11–12), Ch 2 Fig. 14 (PDF p. 34), Ch 4 Figs. 24–25 (PDF pp. 55–56) |
| **Tasks and responsibilities** | Assign global product identifiers, batch/lot numbers, expiry dates, and serial numbers on packaging; transmit master data and commissioning/shipping traceability events from manufacturer systems to the recipient country (Ch 4 Figs. 24–25). | Introduction Figs. 1 & 3 (PDF pp. 11–12), Ch 2 Fig. 14 (PDF p. 34), Ch 4 Figs. 24–25 (PDF pp. 55–56) |
| **Challenges and bottlenecks** | Divergent national labelling and serialization mandates; lack of phased compliance guidelines or standardized data-exchange endpoints (Table 2, Ch 4). | Introduction Figs. 1 & 3 (PDF pp. 11–12), Ch 2 Fig. 14 (PDF p. 34), Ch 4 Figs. 24–25 (PDF pp. 55–56) |
| **BPMN lane(s)** | `Lane_BP02_Manufacturer` (`bp:sc-bp-02-end-to-end-supply-chain-processes`), `Lane_BP03_Manufacturer` (`bp:sc-bp-03-centralized-track-and-trace`) | Introduction Figs. 1 & 3 (PDF pp. 11–12), Ch 2 Fig. 14 (PDF p. 34), Ch 4 Figs. 24–25 (PDF pp. 55–56) |
| **ArchiMate alignment (`dpi-h-ra` `0.3.0-draft.1`)** | `Manufacturer / Distributor` (`id-66d0f91175c154b48413d57e9f952a34`), `Manufacturer Systems` (`id-f8c43d85b20e5671b613d723483217a8`), `Product Master Data` (`id-815bef20a55f5f59b409a76a9a6545f8`), `Traceability Event` (`id-5dc77dae1bce5d11b288830795b31bdf`) | `smart-ra#147` |
