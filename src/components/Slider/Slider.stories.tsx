import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Slider } from "./Slider";
import type { SliderSize, SliderThumb, SliderValue } from "./Slider";
import { Section, StateCell } from "../../storybook/StoryLayout";

const pctFmt = (v: number) => `${v}%`;

const meta: Meta<typeof Slider> = {
  title: "Components/Slider",
  component: Slider,
  parameters: {
    docs: {
      description: {
        component:
          "Single or range slider. Grey-30 track with a green-175 fill, off-black value bubbles above each thumb, min/max badges either side and 0–100 marks underneath. Thumb styles: square, circle, and the thick-track ‘rail’ variants. Each thumb is a `role=\"slider\"` with `aria-valuenow`; arrows / PageUp / PageDown / Home / End adjust it, and pointer drag works anywhere on the track (the nearest thumb is picked in range mode).",
      },
    },
  },
  args: {
    defaultValue: 42,
    min: 0,
    max: 100,
    step: 1,
    size: "md",
    thumb: "circle",
    showLimits: true,
    marks: true,
    tooltip: "always",
    disabled: false,
    formatValue: pctFmt,
    "aria-label": "Tumour purity",
  },
  argTypes: {
    size: { control: "inline-radio", options: ["md", "sm", "xs"] },
    thumb: {
      control: "inline-radio",
      options: ["square", "circle", "squareRail", "circleRail"],
    },
    tooltip: { control: "inline-radio", options: ["always", "active", "never"] },
    showLimits: { control: "boolean" },
    marks: { control: "boolean" },
    disabled: { control: "boolean" },
    step: { control: { type: "number", min: 1 } },
    formatValue: { control: false },
  },
  render: (args) => (
    <div style={{ width: 384 }}>
      <Slider {...args} />
    </div>
  ),
};
export default meta;

type Story = StoryObj<typeof Slider>;

export const Playground: Story = {};

export const Range: Story = {
  args: { defaultValue: [24, 68], "aria-label": "Age at diagnosis" },
};

const thumbs: Array<{ key: SliderThumb; label: string }> = [
  { key: "square", label: "Square" },
  { key: "circle", label: "Circle" },
  { key: "squareRail", label: "Square Rail" },
  { key: "circleRail", label: "Circle Rail" },
];
const sizes: SliderSize[] = ["md", "sm", "xs"];

const Matrix = ({ range }: { range: boolean }) => (
  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 360px)", columnGap: 40, rowGap: 16 }}>
    {sizes.flatMap((s) =>
      thumbs.map((t) => (
        <StateCell key={`${s}-${t.key}`} label={`${t.label} · ${s}`}>
          <div style={{ width: 360 }}>
            <Slider
              aria-label={`${t.label} ${s}`}
              size={s}
              thumb={t.key}
              defaultValue={range ? [24, 68] : 42}
              formatValue={pctFmt}
            />
          </div>
        </StateCell>
      )),
    )}
  </div>
);

export const Variants: Story = {
  parameters: { controls: { disable: true }, layout: "padded" },
  render: () => (
    <div>
      <Section title="Single" description="Figma Variant=Single × Size (md / sm / xs) × thumb style.">
        <Matrix range={false} />
      </Section>
      <Section title="Range" description="Figma Variant=Range × Size × thumb style. `Default` (Range/sm) renders as Circle.">
        <Matrix range />
      </Section>
    </div>
  ),
};

export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, width: 384 }}>
      <StateCell label="Tooltip on hover / focus / drag only">
        <div style={{ width: 384 }}>
          <Slider aria-label="Active tooltip" defaultValue={30} tooltip="active" formatValue={pctFmt} />
        </div>
      </StateCell>
      <StateCell label="Minimal (no limits, no marks)">
        <div style={{ width: 384 }}>
          <Slider aria-label="Minimal" defaultValue={60} showLimits={false} marks={false} tooltip="never" />
        </div>
      </StateCell>
      <StateCell label="Disabled">
        <div style={{ width: 384 }}>
          <Slider aria-label="Disabled" defaultValue={[20, 70]} disabled formatValue={pctFmt} />
        </div>
      </StateCell>
    </div>
  ),
};

export const Controlled: Story = {
  parameters: { controls: { disable: true } },
  render: function ControlledStory() {
    const [v, setV] = useState<SliderValue>([10, 40]);
    return (
      <div style={{ width: 384 }}>
        <Slider
          aria-label="Survival months"
          value={v}
          onChange={setV}
          min={0}
          max={60}
          step={5}
          marks={[0, 10, 20, 30, 40, 50, 60]}
        />
        <p style={{ fontFamily: "var(--insight-font-family-mono)", fontSize: 12 }}>
          value: {JSON.stringify(v)}
        </p>
      </div>
    );
  },
};
