import { chapter, section } from "../../schema/builders";

export default chapter({
  number: 1,
  title: "Chapter 1. Defining a holistic DHSC strategy",
  label: "chap:ch01-dhsc-strategy",
  sections: [
    section({
      title: "Guiding principles",
      label: "sec:ch01-guiding-principles",
      blocks: ["p-ch01-page-019"],
    }),
    section({
      title: "Why is a strategy necessary?",
      label: "sec:ch01-why-is-a-strategy-necessary",
      blocks: ["p-ch01-page-020", "f-ch01-fig-8", "p-ch01-page-021", "f-ch01-fig-9"],
    }),
    section({
      title: "Step 1. Identify and engage all relevant stakeholders",
      label: "sec:ch01-step-1-identify-and-engage-all-relevant",
      blocks: ["p-ch01-page-022"],
    }),
    section({
      title: "Step 2. Analyse the current state of HSCISs",
      label: "sec:ch01-step-2-analyse-the-current-state-of-hsci",
      blocks: ["p-ch01-page-023"],
    }),
    section({
      title: "Step 3. Define the DHSC vision and strategic goals and objectives",
      label: "sec:ch01-step-3-define-the-dhsc-vision-and-strate",
      blocks: ["p-ch01-page-024"],
    }),
    section({
      title: "Step 4. Define a strategic roadmap and performance indicators",
      label: "sec:ch01-step-4-define-a-strategic-roadmap-and-pe",
      blocks: ["p-ch01-page-025", "p-ch01-page-026", "f-ch01-fig-10"],
    }),
  ],
});
