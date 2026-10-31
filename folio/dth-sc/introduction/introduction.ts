import { chapter, section } from "../../schema/builders";

export default chapter({
  title: "Introduction",
  label: "chap:introduction",
  sections: [
    section({
      title: "Introduction",
      label: "sec:introduction-introduction",
      blocks: [
        "p-introduction-page-011", "f-introduction-fig-1",
        "pers-ministry-of-health",
        "pers-procurer",
        "pers-manufacturer-distributor",
        "pers-regulatory-authority",
        "pers-central-warehouse",
        "pers-regional-district-warehouse",
        "pers-logistics-provider",
        "pers-health-facility",
        "pers-community-health-worker",
        "pers-health-service-user",
        "bp-sc-bp-02-end-to-end-supply-chain-processes",
      ],
    }),
    section({
      title: "Digital health and the DHSC",
      label: "sec:introduction-digital-health-and-the-dhsc",
      blocks: ["p-introduction-page-012", "f-introduction-fig-2"],
    }),
    section({
      title: "What this handbook covers",
      label: "sec:introduction-what-this-handbook-covers",
      blocks: ["p-introduction-page-013", "f-introduction-fig-3"],
    }),
    section({
      title: "How to use this handbook",
      label: "sec:introduction-how-to-use-this-handbook",
      blocks: ["p-introduction-page-014", "f-introduction-fig-4", "bp-sc-bp-01-stepwise-dhsc-transformation"],
    }),
    section({
      title: "Alignment with the DIIG",
      label: "sec:introduction-alignment-with-the-diig",
      blocks: ["p-introduction-page-015", "f-introduction-fig-5"],
    }),
    section({
      title: "Alignment with WHO's SMART Guidelines",
      label: "sec:introduction-alignment-with-whos-smart-guidelines",
      blocks: ["p-introduction-page-016", "f-introduction-fig-6", "p-introduction-page-017", "f-introduction-fig-7", "p-introduction-page-018", "t-introduction-table-1"],
    }),
  ],
});
