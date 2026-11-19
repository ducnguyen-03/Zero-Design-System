import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { Section } from "../../storybook/StoryLayout";
import {
  TRIAL_CRITERIA,
  TRIAL_DRAFTS,
  TRIAL_EXCLUDED,
  TRIAL_FOCUS,
  TRIAL_MTB,
  TRIAL_QUESTION,
  TRIAL_RANKED,
  TRIAL_SCENARIO,
  TRIAL_SITES,
  TRIAL_STATS,
} from "../../storybook/zakTrials";
import {
  CriterionReading,
  CriterionTable,
  DraftEmail,
  ExcludedTrials,
  RecipientPicker,
  ReportExcerpt,
  ScenarioTable,
  TrialCard,
  TrialList,
} from "./TrialMatch";

const meta: Meta = {
  title: "AI/Trial Match",
  parameters: {
    docs: {
      description: {
        component:
          "PedTrial's turns as components. `TrialCard` (rank, registry line, molecular match, unknowns; opens to its `CriterionTable`) in a `TrialList`, " +
          "`ExcludedTrials` with the criterion that ruled each out, `ScenarioTable` for what closes and opens at relapse, `ReportExcerpt` for the editable " +
          "MTB paragraph, `RecipientPicker` for choosing a site, and `DraftEmail` for a draft the agent cannot send. Tables stack into blocks below 640px " +
          "of container width, so they read in a chat-width canvas.",
      },
    },
  },
};
export default meta;
type Story = StoryObj;

const SRC = `Readings unverified · ClinicalTrials.gov 7 oct 2026 · ${TRIAL_STATS.model}`;

/** Ranked trials; the trial in focus opens to its criteria (first 8, failures always shown). */
export const RankedTrials: Story = {
  render: () => (
    <div style={{ maxWidth: 960, display: "flex", flexDirection: "column", gap: 12 }}>
      <TrialList>
        {TRIAL_RANKED.map((t) => (
          <TrialCard key={t.nct} {...t} focus={t.nct === TRIAL_FOCUS.nct}>
            {t.nct === TRIAL_FOCUS.nct ? <CriterionTable criteria={TRIAL_CRITERIA} initialCount={8} footnote={SRC} /> : undefined}
          </TrialCard>
        ))}
      </TrialList>
      <ExcludedTrials items={TRIAL_EXCLUDED} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("button", { name: /Show all 36 criteria/ }));
    await expect(c.queryByRole("button", { name: /Show all/ })).toBeNull();
  },
};

/** The same criteria in a chat-width container: each criterion stacks. */
export const CriteriaNarrow: Story = {
  render: () => (
    <div style={{ width: 400 }}>
      <CriterionTable criteria={TRIAL_CRITERIA.slice(0, 6)} footnote={SRC} />
    </div>
  ),
};

export const Readings: Story = {
  render: () => (
    <div>
      {(["inclusion", "exclusion"] as const).map((type) => (
        <Section key={type} title={`CriterionReading · ${type}`}>
          <div style={{ display: "flex", gap: 12 }}>
            {(["met", "not_met", "insufficient_info", "not_applicable"] as const).map((r) => (
              <CriterionReading key={r} reading={r} type={type} />
            ))}
          </div>
        </Section>
      ))}
    </div>
  ),
};

/** MTB trial summary: the editable paragraph, its assumption and references, and now vs at relapse. */
export const RelapseScenario: Story = {
  render: () => (
    <div style={{ maxWidth: 960, display: "flex", flexDirection: "column", gap: 16 }}>
      <ReportExcerpt editable assumption={TRIAL_MTB.assumption} references={TRIAL_MTB.references}>
        {TRIAL_MTB.paragraph}
      </ReportExcerpt>
      <ScenarioTable rows={TRIAL_SCENARIO} />
    </div>
  ),
};

/** Choose up to two sites; the recipient comes from the registry. */
export const Recipients: Story = {
  render: function Render() {
    const [value, setValue] = useState(["s0"]);
    return (
      <div style={{ maxWidth: 560 }}>
        <RecipientPicker
          sites={[...TRIAL_SITES, { id: "none", facility: "Starship Children's Hospital", city: "Auckland", note: "Phone only — no email listed" }]}
          value={value}
          onChange={setValue}
          question={TRIAL_QUESTION}
        />
      </div>
    );
  },
};

/** Draft 2 replaces draft 1: quoted criteria and readings set apart, new lines marked. */
export const Draft: Story = {
  render: () => {
    const [d1, d2] = TRIAL_DRAFTS;
    return (
      <div style={{ maxWidth: 760 }}>
        <DraftEmail
          to={`${d2.to.name} <${d2.to.email}> · ${d2.to.facility}`}
          subject={d2.subject}
          flags={d2.flags}
          body={d2.body}
          previousBody={d1.body}
        />
      </div>
    );
  },
};
