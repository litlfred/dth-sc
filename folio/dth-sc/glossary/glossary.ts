import { chapter, section } from "../../schema/builders";

/** Back matter: the glossary, then its acronyms (each a term's SKOS notation). */
export default chapter({
  title: "Glossary",
  label: "chap:glossary",
  tabLabel: "G",
  sections: [
    section({
      title: "Glossary",
      label: "sec:front-glossary",
      blocks: ["p-front-page-008", "p-front-page-009"],
    }),
    section({
      title: "Abbreviations and acronyms",
      label: "sec:front-abbreviations-and-acronyms",
      blocks: ["t-front-abbreviations"],
    }),
  ],
});
