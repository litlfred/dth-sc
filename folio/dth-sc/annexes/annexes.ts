import { chapter, section } from "../../schema/builders";

export default chapter({
  title: "Annexes",
  label: "chap:annexes",
  sections: [
    section({
      title: "Annex 1. Principles for digital development",
      label: "sec:annexes-annex-1-principles-for-digital-developme",
      blocks: ["p-annexes-page-066"],
    }),
    section({
      title: "Annex 2. Steering committee example structure",
      label: "sec:annexes-annex-2-steering-committee-example-struc",
      blocks: ["p-annexes-page-067", "t-annexes-annex-2"],
    }),
    section({
      title: "Annex 3. Template for prioritizing DHSC challenges to address",
      label: "sec:annexes-annex-3-template-for-prioritizing-dhsc-c",
      blocks: ["p-annexes-page-068", "t-annexes-annex-3"],
    }),
    section({
      title: "Annex 4. Illustrative template that maps today's challenges to future outcomes",
      label: "sec:annexes-annex-4-illustrative-template-that-maps",
      blocks: ["p-annexes-page-069", "t-annexes-annex-4"],
    }),
    section({
      title: "Annex 5. Template for listing health supply chain information systems",
      label: "sec:annexes-annex-5-template-for-listing-health-supp",
      blocks: ["p-annexes-page-070", "t-annexes-annex-5"],
    }),
    section({
      title: "Annex 6. Risk register template",
      label: "sec:annexes-annex-6-risk-register-template",
      blocks: ["p-annexes-page-071", "t-annexes-annex-6"],
    }),
    section({
      title: "Annex 7. Resource matrix for DHSC implementation",
      label: "sec:annexes-annex-7-resource-matrix-for-dhsc-impleme",
      blocks: [
        "p-annexes-page-072",
        "t-annexes-annex-7",
        "pers-steering-committee-sponsor",
        "pers-solution-architect",
        "pers-project-manager-ba",
        "pers-developer-integrator",
        "pers-system-administrator-support",
        "p-annexes-page-076",
      ],
    }),
  ],
});
