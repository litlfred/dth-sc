import { chapter, section } from "../../schema/builders";

export default chapter({
  title: "Introduction",
  label: "chap:introduction",
  sections: [
    section({
      title: "Introduction",
      label: "sec:introduction-introduction",
      blocks: ["p-introduction-page-011"],
    }),
    section({
      title: "Digital health and the DHSC",
      label: "sec:introduction-digital-health-and-the-dhsc",
      blocks: ["p-introduction-page-012"],
    }),
    section({
      title: "What this handbook covers",
      label: "sec:introduction-what-this-handbook-covers",
      blocks: ["p-introduction-page-013"],
    }),
    section({
      title: "How to use this handbook",
      label: "sec:introduction-how-to-use-this-handbook",
      blocks: ["p-introduction-page-014"],
    }),
    section({
      title: "Alignment with the DIIG",
      label: "sec:introduction-alignment-with-the-diig",
      blocks: ["p-introduction-page-015"],
    }),
    section({
      title: "Alignment with WHO's SMART Guidelines",
      label: "sec:introduction-alignment-with-whos-smart-guidelines",
      blocks: ["p-introduction-page-016", "p-introduction-page-017", "p-introduction-page-018", "t-introduction-table-1"],
    }),
  ],
});
