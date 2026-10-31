import { chapter, section } from "../../schema/builders";

export default chapter({
  number: 5,
  title: "Chapter 5. Country examples",
  label: "chap:ch05-country-examples",
  sections: [
    section({
      title: "Chapter overview",
      label: "sec:ch05-chapter-overview",
      blocks: ["p-ch05-page-057"],
    }),
    section({
      title: "Ethiopia's DHSC initiative",
      label: "sec:ch05-ethiopias-dhsc-initiative",
      blocks: ["p-ch05-page-058", "p-ch05-page-059"],
    }),
    section({
      title: "Malawi's DHSC initiative",
      label: "sec:ch05-malawis-dhsc-initiative",
      blocks: ["p-ch05-page-060", "p-ch05-page-061", "p-ch05-page-062"],
    }),
    section({
      title: "Rwanda's DHSC initiative",
      label: "sec:ch05-rwandas-dhsc-initiative",
      blocks: ["p-ch05-page-063", "p-ch05-page-064"],
    }),
  ],
});
