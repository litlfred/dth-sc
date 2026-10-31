import { chapter, section } from "../../schema/builders";

export default chapter({
  number: 2,
  title: "Chapter 2. Defining the DHSC architecture",
  label: "chap:ch02-dhsc-architecture",
  sections: [
    section({
      title: "Chapter overview",
      label: "sec:ch02-chapter-overview",
      blocks: ["p-ch02-page-027"],
    }),
    section({
      title: "Is a DHSC architecture necessary? What are the risks of forgoing one?",
      label: "sec:ch02-is-a-dhsc-architecture-necessary-what-ar",
      blocks: ["p-ch02-page-028", "p-ch02-page-029"],
    }),
    section({
      title: "Step 1. Assess the current state of HSCISs",
      label: "sec:ch02-step-1-assess-the-current-state-of-hscis",
      blocks: ["p-ch02-page-030", "p-ch02-page-031"],
    }),
    section({
      title: "Step 2. Define a target DHSC architecture; DHSC architecture framework",
      label: "sec:ch02-step-2-define-a-target-dhsc-architecture",
      blocks: ["p-ch02-page-032", "p-ch02-page-033", "p-ch02-page-034", "p-ch02-page-035"],
    }),
    section({
      title: "Illustrative architectural approaches and governance options",
      label: "sec:ch02-illustrative-architectural-approaches-an",
      blocks: ["p-ch02-page-036", "p-ch02-page-037", "p-ch02-page-038", "p-ch02-page-039", "p-ch02-page-040", "p-ch02-page-041"],
    }),
    section({
      title: "Step 3. Identify implementation activities and map them to strategic goals",
      label: "sec:ch02-step-3-identify-implementation-activitie",
      blocks: ["p-ch02-page-042", "p-ch02-page-043"],
    }),
  ],
});
