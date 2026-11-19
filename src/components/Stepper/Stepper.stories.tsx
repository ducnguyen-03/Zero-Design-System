import type { Meta, StoryObj } from "@storybook/react-vite";
import { Stepper } from "./Stepper";
import type { StepperStep } from "./Stepper";
import { Section, Stage, StateCell } from "../../storybook/StoryLayout";

const STEPS: StepperStep[] = [
  { label: "Application submitted" },
  { label: "In Review" },
  { label: "Pending signature" },
  { label: "Ready For Final Review" },
  { label: "Decision" },
];

const meta: Meta<typeof Stepper> = {
  title: "Components/Stepper",
  component: Stepper,
  parameters: {
    docs: {
      description: {
        component:
          "Progress stepper rendered as an ordered list. Steps before `currentStep` show the green tick and a filled connector; the current step has a green-10 number badge and `aria-current=\"step\"`; upcoming steps are grey. Each step also carries a visually hidden status for screen readers. Pass `currentStep={steps.length}` for the Figma “Completed” state. Figma names the set “Vertical Stepper” but draws it as a row, so `orientation` defaults to `horizontal`; `vertical` stacks the same steps.",
      },
    },
  },
  args: { steps: STEPS, currentStep: 1, orientation: "horizontal" },
  argTypes: {
    currentStep: { control: { type: "range", min: 0, max: STEPS.length, step: 1 } },
    orientation: { control: "inline-radio", options: ["horizontal", "vertical"] },
    steps: { control: false },
  },
  render: (args) => (
    <div style={{ width: args.orientation === "vertical" ? "auto" : 1134 }}>
      <Stepper {...args} />
    </div>
  ),
};
export default meta;

type Story = StoryObj<typeof Stepper>;

export const Playground: Story = {};

export const Steps: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Section title="Step = 1 … 5 / Completed" description="Horizontal layout, as drawn in Figma.">
      <Stage column gap={20}>
        {[0, 1, 2, 3, 4, 5].map((current) => (
          <StateCell key={current} label={current === 5 ? "Step = Completed" : `Step = ${current + 1}`}>
            <div style={{ width: 1134 }}>
              <Stepper steps={STEPS} currentStep={current} aria-label={`Example ${current + 1}`} />
            </div>
          </StateCell>
        ))}
      </Stage>
    </Section>
  ),
};

export const Vertical: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Stage gap={48}>
      {[0, 2, 5].map((current) => (
        <StateCell key={current} label={current === 5 ? "Completed" : `Step = ${current + 1}`}>
          <Stepper steps={STEPS} currentStep={current} orientation="vertical" aria-label={`Vertical ${current}`} />
        </StateCell>
      ))}
      <StateCell label="With descriptions">
        <Stepper
          orientation="vertical"
          currentStep={1}
          aria-label="With descriptions"
          steps={[
            { label: "Application submitted", description: "12 Aug 2026" },
            { label: "In Review", description: "Assigned to reviewer" },
            { label: "Decision", description: "Pending" },
          ]}
        />
      </StateCell>
    </Stage>
  ),
};
