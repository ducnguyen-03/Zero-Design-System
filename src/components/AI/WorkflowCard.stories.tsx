import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { ZAK_WORKFLOWS } from "../../storybook/zakWorkflows";
import { WorkflowCard, WorkflowCards } from "./WorkflowCard";

const meta: Meta<typeof WorkflowCard> = {
  title: "AI/Workflow Card",
  component: WorkflowCard,
  parameters: {
    docs: {
      description: {
        component:
          "A starting point on the ZAK home screen. `agents` lists who runs the workflow — one specialist, a pairing " +
          "(William & Karl for a tumour board) or the whole team — drawn as 40px circles side by side, and the pill reads " +
          "\"Work with …\" (`agentLabel` overrides it, e.g. \"ZAK & teams\"). `isNew` flags a newly added agent's workflow; " +
          "`selected` gives the card a 2px ink edge. Group cards with `WorkflowCards` (two columns, one under 480px). " +
          "Each card is a real `<button>` with `aria-pressed`.",
      },
    },
  },
  args: {
    agents: ["william", "karl"],
    eyebrow: "Tumour board preparation",
    title: "Preparing something for a tumour board",
    description: "A report over what was established, what was withdrawn, and which assertions constrained it — defensible line by line.",
    isNew: false,
    selected: false,
  },
  argTypes: {
    agents: { control: "check", options: ["zak", "sidney", "janet", "william", "karl", "pedtrial"] },
  },
  render: (args) => (
    <div style={{ width: 540, maxWidth: "100%" }}>
      <WorkflowCard {...args} />
    </div>
  ),
};
export default meta;

type Story = StoryObj<typeof WorkflowCard>;

/** Tick agents in Controls to see a single specialist, a pairing, or the team. */
export const Playground: Story = {};

/** One agent, a pair, the whole team. */
export const Combinations: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: "grid", gap: 12, maxWidth: 540 }}>
      {ZAK_WORKFLOWS.filter((w) => ["cohort", "tumour-board", "explore"].includes(w.id)).map(({ id, ...w }) => (
        <WorkflowCard key={id} {...w} />
      ))}
    </div>
  ),
};

function WorkflowGrid() {
  const [picked, setPicked] = useState("trials");
  return (
    <WorkflowCards>
      {ZAK_WORKFLOWS.map(({ id, ...w }) => (
        <WorkflowCard key={id} {...w} selected={picked === id} onClick={() => setPicked(id)} />
      ))}
    </WorkflowCards>
  );
}

/** "Start from a workflow" on the home screen — PedTrial's new workflow first. Pick a card to select it. */
export const Group: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ maxWidth: 1120 }}>
      <WorkflowGrid />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("button", { name: /Finding patients/ }));
    await expect(c.getByRole("button", { name: /Finding patients/ })).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(c.getByRole("button", { name: /Finding trials/ }));
  },
};
