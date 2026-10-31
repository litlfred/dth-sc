/**
 * Re-export of smart-base's DAK block builders (persona, userScenario,
 * businessProcess, decisionTable, functionalRequirement, …).
 *
 * The handbook is an L1/L2 document (smart-base document kind `dth`); its
 * structured assets — personas, BPMN 2.0 business processes and DMN decision
 * tables — use the same block kinds as an L2 DAK, so they can be carried
 * into one without re-authoring. Written once here, like `builders.ts`.
 */

export * from "../../smart-base/schemas/dak-blocks";
