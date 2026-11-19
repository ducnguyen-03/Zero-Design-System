import type { Meta, StoryObj } from "@storybook/react-vite";
import { CircularProgress, ProgressBar } from "./ProgressBar";
import { Section, Stage, StateCell } from "../../storybook/StoryLayout";

const meta: Meta<typeof ProgressBar> = {
  title: "Components/ProgressBar",
  component: ProgressBar,
  parameters: {
    docs: {
      description: {
        component:
          "Linear `ProgressBar` (tone `default` = green, `info` = blue with status dot) and `CircularProgress` stat ring. " +
          "Both render `role=\"progressbar\"` with `aria-valuemin/max/now` (omitted when `indeterminate`), labelled by the visible caption. " +
          "`surface=\"card\"` reproduces the dark Figma container; `surface=\"none\"` drops it.",
      },
    },
  },
  decorators: [(Story) => <div style={{ width: 375 }}><Story /></div>],
  args: { value: 65, label: "Linear Progress Bar", tone: "default", surface: "card", showValue: true, indeterminate: false },
  argTypes: {
    value: { control: { type: "range", min: 0, max: 100 } },
    max: { control: "number" },
    tone: { control: "inline-radio", options: ["default", "info"] },
    surface: { control: "inline-radio", options: ["card", "none"] },
    label: { control: "text" },
    showValue: { control: "boolean" },
    indeterminate: { control: "boolean" },
    statusDot: { control: "boolean" },
  },
};
export default meta;

type Story = StoryObj<typeof ProgressBar>;

export const Playground: Story = {};

/** Figma Variant axis: Defaul (sic), Info, Circular. */
export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Stage column gap={24}>
      <StateCell label="Variant=Default">
        <ProgressBar value={65} label="Linear Progress Bar" />
      </StateCell>
      <StateCell label="Variant=Info">
        <ProgressBar tone="info" value={40} label="Static Linear • In Progress" />
      </StateCell>
      <StateCell label="Variant=Circular">
        <CircularProgress value={70} label="Circular Stat Ring" />
      </StateCell>
    </Stage>
  ),
};

/** Not in Figma: indeterminate loading and the plain (no card) surface. */
export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Stage column gap={8}>
      <Section title="Indeterminate">
        <Stage column gap={16}>
          <ProgressBar indeterminate label="Uploading dataset" />
          <CircularProgress indeterminate label="Processing" />
        </Stage>
      </Section>
      <Section title="surface=none">
        <Stage column gap={16}>
          <ProgressBar surface="none" value={65} label="Linear Progress Bar" />
          <ProgressBar surface="none" tone="info" value={40} label="In Progress" />
          <CircularProgress surface="none" value={70} aria-label="Completion" />
        </Stage>
      </Section>
    </Stage>
  ),
};
