import { chapter, section } from "../../schema/builders";

export default chapter({
  number: 3,
  title: "Chapter 3. Planning for scalable implementation and sustainable operations",
  label: "chap:ch03-implementation-and-operations",
  sections: [
    section({
      title: "Guiding principles",
      label: "sec:ch03-guiding-principles",
      blocks: ["p-ch03-page-044"],
    }),
    section({
      title: "Building blocks and implementation considerations",
      label: "sec:ch03-building-blocks-and-implementation-consi",
      blocks: ["p-ch03-page-045", "p-ch03-page-046", "t-ch03-table-2"],
    }),
    section({
      title: "Step 1. Plan the implementation of each DHSC intervention",
      label: "sec:ch03-step-1-plan-the-implementation-of-each-d",
      blocks: ["p-ch03-page-047"],
    }),
    section({
      title: "Step 2. Develop an operational plan for each DHSC intervention",
      label: "sec:ch03-step-2-develop-an-operational-plan-for-e",
      blocks: ["p-ch03-page-048"],
    }),
    section({
      title: "Step 3. Develop a budget for each DHSC intervention",
      label: "sec:ch03-step-3-develop-a-budget-for-each-dhsc-in",
      blocks: ["p-ch03-page-049", "p-ch03-page-050", "t-ch03-table-3"],
    }),
    section({
      title: "Step 4. Implement each DHSC intervention",
      label: "sec:ch03-step-4-implement-each-dhsc-intervention",
      blocks: ["p-ch03-page-051", "p-ch03-page-052"],
    }),
  ],
});
