import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { Button } from "../Button/Button";
import { Section, Stage, StateCell } from "../../storybook/StoryLayout";
import { SidneyAvatar, ZakAvatar } from "../../storybook/aiAgents";
import { AgentRunCard } from "./AgentRunCard";
import {
  ChainOfThought,
  ChainOfThoughtReference,
  ChainOfThoughtStage,
  ChainOfThoughtStages,
  ChainOfThoughtStep,
  ChainOfThoughtSteps,
} from "./ChainOfThought";
import type { ChainOfThoughtStatus } from "./ChainOfThought";

const STEPS = [
  "Reading your question",
  "Planned the step and checked it against the knowledge base",
  "Queried Insights · Insights — ZERO cohort · GraphQL MCP",
  "Read an authoritative overview of vision-language models and their architecture.",
  "Hand back to Zak",
];

/** Step statuses that agree with the run status: the run stops at step 4, so later steps never start. */
const STEP_STATUS: Record<Exclude<ChainOfThoughtStatus, "pending">, ChainOfThoughtStatus[]> = {
  active: ["done", "done", "done", "active", "pending"],
  done: ["done", "done", "done", "done", "done"],
  failed: ["done", "done", "done", "failed", "pending"],
};

const meta: Meta<typeof ChainOfThought> = {
  title: "AI/Chain of Thought",
  component: ChainOfThought,
  parameters: {
    docs: {
      description: {
        component:
          "How an agent got to its answer, from the ZAK prototype. **Steps** (`ChainOfThought` + `ChainOfThoughtSteps` + `ChainOfThoughtStep`): " +
          "a one-line run summary that toggles a grey well of steps — `done` ✓ green, `active` spinning and darker, `pending` at 50%, `failed` ✕ red — " +
          "with an optional orange `ChainOfThoughtNote`. **Stages** (`ChainOfThoughtStages` + `ChainOfThoughtStage`): the audit view, one card per stage on a rail, " +
          "marked by the agent that ran it, with its duration and output. Step status is also announced as text; the active step carries `aria-current=\"step\"`.",
      },
    },
  },
  args: { summary: "Searching the data · Read 2 files · 5 tool calls", status: "active", defaultOpen: true },
  argTypes: {
    status: { control: "inline-radio", options: ["active", "done", "failed"] },
    children: { control: false },
    tools: { control: false },
  },
  render: (args) => (
    <div style={{ width: 654 }}>
      <ChainOfThought {...args}>
        <ChainOfThoughtSteps>
          {STEPS.map((label, i) => (
            <ChainOfThoughtStep key={label} status={STEP_STATUS[args.status ?? "active"][i]}>
              {label}
            </ChainOfThoughtStep>
          ))}
        </ChainOfThoughtSteps>
      </ChainOfThought>
    </div>
  ),
};
export default meta;

type Story = StoryObj<typeof ChainOfThought>;

export const Playground: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const toggle = c.getByRole("button", { name: /searching the data/i });
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(toggle);
    await expect(c.getByText("Hand back to Zak")).toBeVisible();
  },
};

/** The step list inside an `AgentRunCard` — see **AI / Agent Run Card** for every run state. */
export const InAgentCard: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ maxWidth: 680 }}>
      <AgentRunCard
        avatar={<SidneyAvatar size={32} />}
        name="Sidney"
        role="Cohort Expert"
        status="working"
        actions={
          <Button size="sm" variant="subtle">
            Stop
          </Button>
        }
        progress="Step 4 of 5"
      >
        <ChainOfThought summary="Searching the data · Read 2 files · 5 tool calls">
          <ChainOfThoughtSteps>
            <ChainOfThoughtStep>Reading your question</ChainOfThoughtStep>
            <ChainOfThoughtStep>Planned the step and checked it against the knowledge base</ChainOfThoughtStep>
            <ChainOfThoughtStep>Queried Insights · Insights — ZERO cohort · GraphQL MCP</ChainOfThoughtStep>
            <ChainOfThoughtStep status="active">
              Read an authoritative overview of vision-language models and their architecture.
            </ChainOfThoughtStep>
            <ChainOfThoughtStep status="pending">Hand back to Zak</ChainOfThoughtStep>
          </ChainOfThoughtSteps>
        </ChainOfThought>
      </AgentRunCard>
    </div>
  ),
};

/** Every step status, and the summary icon for each run state. */
export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div>
      <Section title="Step status">
        <div style={{ width: 420 }}>
          <ChainOfThoughtSteps>
            <ChainOfThoughtStep status="done">Done — Sidney returned 6 patients</ChainOfThoughtStep>
            <ChainOfThoughtStep status="active">Active — Zak is checking the answer before it is written down</ChainOfThoughtStep>
            <ChainOfThoughtStep status="pending">Pending — Hand back to Zak</ChainOfThoughtStep>
            <ChainOfThoughtStep status="failed">Failed — Janet did not connect</ChainOfThoughtStep>
          </ChainOfThoughtSteps>
        </div>
      </Section>
      <Section title="Step with a tool tag">
        <div style={{ width: 420 }}>
          <ChainOfThoughtSteps>
            <ChainOfThoughtStep tool="rules">Privacy guard · no identifiers found</ChainOfThoughtStep>
            <ChainOfThoughtStep tool="build_case_card">Extracted 17 fields, each traced to a phrase</ChainOfThoughtStep>
            <ChainOfThoughtStep status="active" tool="find_trials">Matching the case card to 14 trials</ChainOfThoughtStep>
            <ChainOfThoughtStep status="pending">Hand back to Zak</ChainOfThoughtStep>
          </ChainOfThoughtSteps>
        </div>
      </Section>
      <Section title="Summary">
        <Stage column gap={16} style={{ width: 420 }}>
          <StateCell label="Active · open">
            <ChainOfThought summary="Checking the answer before it is written down">
              <ChainOfThoughtSteps>
                <ChainOfThoughtStep>Sidney returned 6 patients</ChainOfThoughtStep>
                <ChainOfThoughtStep status="active">Critic: does the small-n warning (PKB-0012) survive into the output?</ChainOfThoughtStep>
              </ChainOfThoughtSteps>
            </ChainOfThought>
          </StateCell>
          <StateCell label="Done · collapsed">
            <ChainOfThought summary="Searched the data · Read 2 files · 5 tool calls" status="done" defaultOpen={false}>
              <ChainOfThoughtSteps>
                <ChainOfThoughtStep>Reading your question</ChainOfThoughtStep>
              </ChainOfThoughtSteps>
            </ChainOfThought>
          </StateCell>
        </Stage>
      </Section>
    </div>
  ),
};

/** Audit view of one turn (Figma "open audit in chat sidebar"). */
export const Stages: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ width: 416, padding: 12, background: "var(--insight-color-grey-10)" }}>
      <ChainOfThoughtStages label="5 stages">
        <ChainOfThoughtStage avatar={<ZakAvatar size={24} shape="circle" />} title="Zak planned the turn" duration="0.9s">
          How many patients in ZERO have a diagnosis of AML?
        </ChainOfThoughtStage>
        <ChainOfThoughtStage
          avatar={<ZakAvatar size={24} shape="circle" />}
          title="Checked against 1 active assertion"
          duration="0.2s"
        >
          <ChainOfThoughtReference>PKB-0002</ChainOfThoughtReference>
          <span>A cohort count quoted from a publication is not the current cohort count.</span>
        </ChainOfThoughtStage>
        <ChainOfThoughtStage
          avatar={<SidneyAvatar size={24} shape="circle" />}
          title="Counting AML diagnoses in the pinned snapshot"
          duration="0.7s"
        >
          Queried Insights
        </ChainOfThoughtStage>
        <ChainOfThoughtStage avatar={<ZakAvatar size={24} shape="circle" />} title="Critic reviewed the return path" duration="0.6s">
          Nothing withheld; every fact kept its status
        </ChainOfThoughtStage>
        <ChainOfThoughtStage avatar={<ZakAvatar size={24} shape="circle" />} title="Written to Case" duration="0.3s">
          cohort, open
        </ChainOfThoughtStage>
      </ChainOfThoughtStages>
    </div>
  ),
};
