import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";
import { Radio } from "./Radio";
import type { RadioProps } from "./Radio";
import { Stage, StateCell, Forced } from "../../storybook/StoryLayout";

const meta: Meta<typeof Radio> = {
  title: "Components/Radio",
  component: Radio,
  parameters: {
    docs: {
      description: {
        component:
          "20px circle in a 24px hit area with a 1.4px grey-200 border and a 10px green-175 dot when selected. Hover darkens the border to off-black, focus adds a 2px green ring, error turns the border red, disabled uses grey-75 / grey-40.",
      },
    },
  },
  args: { label: "Biosamples & Variants", name: "view", defaultChecked: true, error: false, disabled: false },
  argTypes: {
    label: { control: "text" },
    defaultChecked: { control: "boolean" },
    error: { control: "boolean" },
    disabled: { control: "boolean" },
  },
};
export default meta;

type Story = StoryObj<typeof Radio>;

export const Playground: Story = {};

const rows: Array<{ label: string; wrap?: (n: ReactNode) => ReactNode; props?: RadioProps; uncheckedOnly?: boolean }> = [
  { label: "Default" },
  { label: "Hover", wrap: (n) => <Forced state="hover">{n}</Forced> },
  { label: "Focus", wrap: (n) => <Forced state="focus">{n}</Forced> },
  { label: "Disabled", props: { disabled: true } },
  { label: "Error", props: { error: true }, uncheckedOnly: true },
];

export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "100px 100px 100px", gap: 20, alignItems: "center" }}>
      <span />
      <StateCell label="Unselected"><span /></StateCell>
      <StateCell label="Selected"><span /></StateCell>
      {rows.map((r, i) => (
        <Row key={r.label} i={i} {...r} />
      ))}
    </div>
  ),
};

function Row({ label, wrap, props, uncheckedOnly, i }: (typeof rows)[number] & { i: number }) {
  const w = (n: ReactNode) => (wrap ? wrap(n) : n);
  return (
    <>
      <StateCell label={label}><span /></StateCell>
      <div>{w(<Radio name={`st-${i}-a`} aria-label={`${label} unselected`} {...props} />)}</div>
      <div>
        {uncheckedOnly ? null : w(<Radio name={`st-${i}-b`} aria-label={`${label} selected`} defaultChecked {...props} />)}
      </div>
    </>
  );
}

export const Group: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Stage column gap={8}>
      <Radio name="highlights-view" label="Biosamples & Variants" defaultChecked />
      <Radio name="highlights-view" label="PDX" />
      <Radio name="highlights-view" label="Study" />
    </Stage>
  ),
};
