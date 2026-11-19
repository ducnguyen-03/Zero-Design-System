import type { Meta, StoryObj } from "@storybook/react-vite";
import { Section } from "../../storybook/StoryLayout";
import { TRIAL_CASE_CARD, TRIAL_HELPFUL, TRIAL_MISSING, TRIAL_STATS, TRIAL_TRANSCRIPT } from "../../storybook/zakTrials";
import { ChatMessage } from "./ChatMessage";
import { ClaimList, GuardrailList, HighlightedText, MissingFacts, ProvenanceTable } from "./Intake";

const meta: Meta = {
  title: "AI/Intake",
  parameters: {
    docs: {
      description: {
        component:
          "Turns in which an agent turns the user's words into structured, cited data — from PedTrial's case intake, usable by any agent. " +
          "`ProvenanceTable` keeps each value next to the phrase it came from; `HighlightedText` marks those phrases back in the user's message; " +
          "`MissingFacts` shows the key facts the agent will not guess; `ClaimList` tags each headline claim with how far it was checked; " +
          "`GuardrailList` states what an agent guarantees and, apart, what it does not.",
      },
    },
  },
};
export default meta;
type Story = StoryObj;

const PHRASES = TRIAL_CASE_CARD.map((r) => r.phrase);

/** The user's message with the phrases that became case-card data marked in place. */
export const Highlighted: Story = {
  render: () => (
    <div style={{ width: 400 }}>
      <ChatMessage role="user">
        <HighlightedText text={TRIAL_TRANSCRIPT[0]} phrases={PHRASES} />
      </ChatMessage>
    </div>
  ),
};

/** Case card: field · value · from your words. Dotted paths wrap after a separator. */
export const Provenance: Story = {
  render: () => (
    <div style={{ maxWidth: 760 }}>
      <ProvenanceTable rows={TRIAL_CASE_CARD} />
    </div>
  ),
};

export const Missing: Story = {
  render: () => (
    <div style={{ maxWidth: 560 }}>
      <MissingFacts fields={TRIAL_MISSING} optional={TRIAL_HELPFUL.join("; ")}>
        The age was not in your description. PedTrial asks rather than guesses.
      </MissingFacts>
    </div>
  ),
};

export const Claims: Story = {
  render: () => (
    <Section title="Under an agent run card">
      <div style={{ width: 388 }}>
        <ClaimList
          items={[
            { text: "5 trials ranked; 2 directly target H3 K27M", tag: "unverified" },
            { text: `Criterion readings checked against ${TRIAL_STATS.criteria_assessed} case-card citations, not against clinicians`, tag: "no ground truth" },
          ]}
        />
      </div>
    </Section>
  ),
};

export const Guardrails: Story = {
  render: () => (
    <div style={{ maxWidth: 560 }}>
      <GuardrailList
        items={[
          { holds: true, text: "Synthetic cases only: you confirm it, and a privacy guard plus a model check refuse identifying details." },
          { holds: true, text: "No invented facts: every case-card value is traced to a phrase you wrote." },
          { holds: true, text: "The costly step runs only after you approve a stated estimate." },
          { holds: false, text: "Not clinically validated: readings and rankings have no clinician ground truth yet." },
          { holds: false, text: "Partial coverage: ANZCTR-only trials are not found automatically." },
        ]}
      />
    </div>
  ),
};
