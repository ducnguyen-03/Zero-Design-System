import type { Meta, StoryObj } from "@storybook/react-vite";
import { Section, Stage } from "../../storybook/StoryLayout";
import { RunSummary, RunTrace } from "./RunTrace";
import type { RunStep } from "./RunTrace";

const meta: Meta<typeof RunTrace> = {
  title: "AI/Run Trace",
  component: RunTrace,
  parameters: {
    docs: {
      description: {
        component:
          "Who did what in a turn, in order: the agent's avatar (wearing its live state), the action, the tool it used in mono, and what came out. " +
          "Any ZAK agent can appear — Zak conducts, Sidney, Janet, William, Karl and PedTrial each take their part. " +
          "A vertical timeline in narrow containers (the chat panel's **Activity** tab) and a row once the container is 760px or wider. " +
          "`status` marks a step `warning`, `blocked`, `running` or `skipped`; the rail turns dashed after a blocked or skipped step. " +
          "`RunSummary` is the compact stack of the agents involved.",
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof RunTrace>;

/** A multi-agent turn: the whole team on "AML with monosomy 7 and a GATA2 variant". */
const TEAM_TURN: RunStep[] = [
  { agent: "zak", title: "Planned the turn", tool: "4 specialists · 6 calls", duration: "2s" },
  { agent: "sidney", title: "Counted the cohort", tool: "Insights · ZERO cohort", result: "41 AML · 6 with monosomy 7", duration: "8s" },
  { agent: "janet", title: "Checked GATA2 variants", tool: "Variant pathways", result: "3 classified · 1 VUS", duration: "11s" },
  { agent: "william", title: "Read the six cases", tool: "Case workflow", result: "2 held by another site", status: "warning", duration: "14s" },
  { agent: "karl", title: "Searched PubMed and bioRxiv", tool: "Literature", result: "Adult-only evidence", status: "warning", duration: "23s" },
  { agent: "zak", title: "Critic check", tool: "critic", result: "Small-n warning kept", duration: "3s" },
];

/** Classifier result, individual case — Zak conducts, William runs the classifiers. */
const CLASSIFIER_TURN: RunStep[] = [
  { agent: "zak", title: "Planned the turn", tool: "2 classifier calls · 1 taxonomy lookup", duration: "3s" },
  { agent: "zak", title: "Checked domain constraints", tool: "PKB · assertions in scope", result: "1 warning · scheme vintage", status: "warning", duration: "1s" },
  { agent: "william", title: "Ran the methylation classifier", tool: "[MODEL VERSION]", result: "AML, MR · 0.84 at Level 3", duration: "19s" },
  { agent: "william", title: "Ran the expression classifier", tool: "[MODEL VERSION]", result: "AML, MR · 0.71 at Level 3", duration: "15s" },
  { agent: "zak", title: "Mapped to WHO-HAEM5", tool: "TaxonomyDB + WHO KG", result: "AML, myelodysplasia-related", duration: "6s" },
];

/** PedTrial in ZAK: every tool call in the trial-matching inquiry. */
const TRIAL_TURN: RunStep[] = [
  { agent: "zak", title: "Opened the inquiry · called in PedTrial" },
  { agent: "pedtrial", title: "Built the case card", tool: "build_case_card" },
  { agent: "pedtrial", title: "Matched 14 trials", tool: "find_trials", result: "2 open · 3 close" },
  { agent: "william", title: "Checked the recorded diagnosis", tool: "Case workflow", result: "Matches the case card" },
  { agent: "pedtrial", title: "Wrote the MTB trial summary", tool: "write_mtb_trial_summary" },
  { agent: "pedtrial", title: "Drafted an inquiry", tool: "draft_inquiry", status: "warning", result: "Draft only · not sent" },
];

/** Every step status, across agents. */
const STATUSES: RunStep[] = [
  { agent: "zak", title: "Done", tool: "critic", result: "Nothing to flag" },
  { agent: "sidney", title: "Warning", tool: "Insights · ZERO cohort", result: "n = 6 · small sample", status: "warning" },
  { agent: "william", title: "Blocked", tool: "[MODEL VERSION]", result: "Outside validated age scope", status: "blocked" },
  { agent: "janet", title: "Skipped", tool: "Variant pathways", result: "Did not connect", status: "skipped" },
  { agent: "karl", title: "Running", tool: "Literature", status: "running" },
];

const panel = { width: 388, padding: 16, background: "var(--insight-color-white)", borderRadius: 12 } as const;

/** The Activity tab: a turn where Zak brings in four specialists. */
export const Activity: Story = {
  render: () => (
    <div style={panel}>
      <RunTrace steps={TEAM_TURN} aria-label="Activity in this turn" />
    </div>
  ),
};

/** Three real turns side by side: the team, the classifier, and trial matching with PedTrial. */
export const Turns: Story = {
  render: () => (
    <Stage gap={24} align="start">
      {[
        ["Team turn · Zak, Sidney, Janet, William, Karl", TEAM_TURN],
        ["Classifier · Zak & William", CLASSIFIER_TURN],
        ["Trial matching · Zak, PedTrial & William", TRIAL_TURN],
      ].map(([label, steps]) => (
        <Section key={label as string} title={label as string}>
          <div style={panel}>
            <RunTrace steps={steps as RunStep[]} aria-label={label as string} />
          </div>
        </Section>
      ))}
    </Stage>
  ),
};

/** `status` on a step — the avatar wears it and the rail changes after it. */
export const Statuses: Story = {
  render: () => (
    <div style={panel}>
      <RunTrace steps={STATUSES} aria-label="Step statuses" />
    </div>
  ),
};

/** Wide canvas: the steps sit in a row. */
export const Wide: Story = {
  render: () => (
    <div style={{ width: 1100, maxWidth: "100%" }}>
      <RunTrace steps={TEAM_TURN} />
    </div>
  ),
};

/** Who worked on a turn, in one line. */
export const Summary: Story = {
  render: () => (
    <Stage column gap={16}>
      <RunSummary agents={["zak", "william"]}>Turn 2 · 5 steps · 44s</RunSummary>
      <RunSummary agents={["zak", "pedtrial", "william"]}>Turns 1–9 · 9 tool calls</RunSummary>
      <RunSummary agents={["zak", "sidney", "janet", "william", "karl"]}>Turn 4 · 6 steps · 61s</RunSummary>
    </Stage>
  ),
};
