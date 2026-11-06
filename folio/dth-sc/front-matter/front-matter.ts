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
  ],
});
