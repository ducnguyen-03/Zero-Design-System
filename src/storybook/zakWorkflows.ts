import type { ZakAgentId } from "../components/AI/agents";

export interface ZakWorkflow {
  id: string;
  agents: ZakAgentId[];
  agentLabel?: string;
  isNew?: boolean;
  eyebrow: string;
  title: string;
  description: string;
}

/** ZAK home — "Start from a workflow". Single specialists, pairings, and the whole team. */
export const ZAK_WORKFLOWS: ZakWorkflow[] = [
  {
    id: "trials",
    agents: ["pedtrial"],
    isNew: true,
    eyebrow: "Clinical trial matching",
    title: "Finding trials a case could join",
    description:
      "Recruiting AU/NZ trials checked criterion by criterion against a synthetic case, with an MTB trial summary and an inquiry draft.",
  },
  {
    id: "cohort",
    agents: ["sidney"],
    eyebrow: "Cohort discovery",
    title: "Finding patients who share something",
    description:
      "Counts against the pinned ZERO snapshot, per-gene overlaps, and who fits a set of criteria — e.g. AML with monosomy 7 and a GATA2 variant.",
  },
  {
    id: "variant",
    agents: ["janet"],
    eyebrow: "Variant & molecular analysis",
    title: "Making sense of a variant",
    description: "Which variants already have a classification, which don’t, and whether anything is predicted to disrupt function.",
  },
  {
    id: "patient",
    agents: ["william"],
    eyebrow: "Patient deep dive",
    title: "Understanding a single case",
    description: "Classifier output against the recorded diagnosis, then treatment, transplant, relapse and outcome per patient.",
  },
  {
    id: "literature",
    agents: ["karl"],
    eyebrow: "Evidence & literature",
    title: "Seeing what’s been published",
    description: "PubMed and bioRxiv evidence for a variant or gene — and where it is adult-only or thin.",
  },
  {
    id: "tumour-board",
    agents: ["william", "karl"],
    eyebrow: "Tumour board preparation",
    title: "Preparing something for a tumour board",
    description:
      "A report over what was established, what was withdrawn, and which assertions constrained it — defensible line by line.",
  },
  {
    id: "explore",
    agents: ["zak", "sidney", "janet", "william", "karl", "pedtrial"],
    agentLabel: "ZAK & teams",
    eyebrow: "Explore knowledge sources",
    title: "Just having a look around",
    description: "Zak brings the whole team into one session. Ask anything — the specialists pick up whatever falls in their domain.",
  },
];
