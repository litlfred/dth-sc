import { chapter, section } from "../../schema/builders";

export default chapter({
  title: "Front matter",
  label: "chap:front-matter",
  sections: [
    section({
      title: "Acknowledgements",
      label: "sec:front-acknowledgements",
      blocks: ["p-front-page-006"],
    }),
    section({
      title: "Abbreviations and acronyms",
      label: "sec:front-abbreviations-and-acronyms",
      blocks: ["p-front-page-007"],
    }),
    section({
      title: "Glossary",
      label: "sec:front-glossary",
      blocks: ["p-front-page-008", "p-front-page-009"],
    }),
  ],
});
