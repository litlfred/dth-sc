import { chapter, section } from "../../schema/builders";

export default chapter({
  number: 4,
  title: "Chapter 4. Using the DHSC to implement traceability",
  label: "chap:ch04-traceability",
  sections: [
    section({
      title: "Chapter overview",
      label: "sec:ch04-chapter-overview",
      blocks: ["p-ch04-page-053"],
    }),
    section({
      title: "What is traceability? Why is it important? Traceability models",
      label: "sec:ch04-what-is-traceability-why-is-it-important",
      blocks: [
        "p-ch04-page-054",
        "dt-sc-dt-02-traceability-model-selection",
        "p-ch04-page-055",
        "f-ch04-fig-24",
        "p-ch04-page-056",
        "f-ch04-fig-25",
        "pers-system-dhsc-traceability-hub",
        "bp-sc-bp-03-centralized-track-and-trace",
      ],
    }),
  ],
});
