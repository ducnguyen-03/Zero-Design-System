import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { NumberInput } from "./NumberInput";
import type { NumberInputProps } from "./NumberInput";
import { StateCell, Forced } from "../../storybook/StoryLayout";

const meta: Meta<typeof NumberInput> = {
  title: "Components/NumberInput",
  component: NumberInput,
  parameters: {
    docs: {
      description: {
        component:
          "Numeric input with − / + steppers (Figma “Input Stepper”). 40px tall, 12px radius, grey-75 border. With no adornment the steppers flank the value; a `prefix` moves them to the end and a `suffix` moves them to the start. The input is a `role=\"spinbutton\"` — ArrowUp/Down step, PageUp/Down step ×10, Home/End jump to min/max, and the value is clamped on blur.",
      },
    },
  },
  args: {
    label: "Maximum 25 members on your current plan",
    helperText: "Each member counts toward your plan limit",
    defaultValue: 1,
    min: 0,
    max: 25,
    step: 1,
    error: false,
    disabled: false,
  },
  argTypes: {
    label: { control: "text" },
    helperText: { control: "text" },
    prefix: { control: "text" },
    suffix: { control: "text" },
    min: { control: "number" },
    max: { control: "number" },
    step: { control: "number" },
    error: { control: "boolean" },
    disabled: { control: "boolean" },
  },
};
export default meta;

type Story = StoryObj<typeof NumberInput>;

export const Playground: Story = {};

const variants: Array<{ label: string; props: Partial<NumberInputProps> }> = [
  { label: "Default", props: {} },
  { label: "Disabled", props: { disabled: true } },
  { label: "Error", props: { error: true, helperText: "Enter a value between 0 and 25" } },
];
const layouts: Array<{ label: string; props: Partial<NumberInputProps> }> = [
  { label: "Default", props: { defaultValue: 1 } },
  { label: "Prefix", props: { defaultValue: 122, prefix: "$", max: 1000 } },
  { label: "Suffix", props: { defaultValue: 122, suffix: "$", max: 1000 } },
];

export const Variants: Story = {
  parameters: { controls: { disable: true }, layout: "padded" },
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 320px)", gap: "28px 40px" }}>
      {variants.flatMap((v) =>
        layouts.map((l) => (
          <StateCell key={`${v.label}-${l.label}`} label={`${v.label} · ${l.label}`}>
            <NumberInput
              label="Maximum 25 members on your current plan"
              helperText="Each member counts toward your plan limit"
              min={0}
              max={25}
              {...l.props}
              {...v.props}
            />
          </StateCell>
        )),
      )}
    </div>
  ),
};

export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: "flex", gap: 40, flexWrap: "wrap" }}>
      <StateCell label="Hover">
        <Forced state="hover">
          <NumberInput aria-label="Hover" defaultValue={4} />
        </Forced>
      </StateCell>
      <StateCell label="Focus">
        <Forced state="focusWithin">
          <NumberInput aria-label="Focus" defaultValue={4} />
        </Forced>
      </StateCell>
      <StateCell label="At max (+ disabled)">
        <NumberInput aria-label="At max" defaultValue={25} max={25} />
      </StateCell>
      <StateCell label="Empty">
        <NumberInput aria-label="Empty" placeholder="0" />
      </StateCell>
    </div>
  ),
};

export const Controlled: Story = {
  parameters: { controls: { disable: true } },
  render: function ControlledStory() {
    const [v, setV] = useState<number | null>(2.5);
    return (
      <div>
        <NumberInput
          label="Dose (mg/kg)"
          value={v}
          onChange={setV}
          min={0}
          max={10}
          step={0.5}
          suffix="mg/kg"
          width={240}
        />
        <p style={{ fontFamily: "var(--insight-font-family-mono)", fontSize: 12 }}>value: {String(v)}</p>
      </div>
    );
  },
};
