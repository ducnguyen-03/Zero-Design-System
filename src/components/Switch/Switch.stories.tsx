import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";
import { useState } from "react";
import { Switch, YesNoSwitch } from "./Switch";
import type { SwitchColor } from "./Switch";
import { Stage, StateCell, Section, Forced } from "../../storybook/StoryLayout";

const meta: Meta<typeof Switch> = {
  title: "Components/Switch",
  component: Switch,
  parameters: {
    docs: {
      description: {
        component:
          "36×22 toggle: grey-100 track with a ✕ when off, green-175 with a ✓ when on (hover darkens to grey-200 / green-200). `color=\"red\"` is the Figma danger toggle (red-100 / red-200); blue and orange remain for filter-panel categories. Focus draws a 2px ring in the track colour. `YesNoSwitch` is the segmented Yes/No control with an unanswered (null) state.",
      },
    },
  },
  args: { label: "Default", defaultChecked: true, color: "green", disabled: false },
  argTypes: {
    label: { control: "text" },
    color: {
      control: "inline-radio",
      options: ["green", "red", "blue", "orange"],
      description: "On-state colour.",
    },
    defaultChecked: { control: "boolean", description: "Initial on/off." },
    disabled: { control: "boolean" },
  },
};
export default meta;

type Story = StoryObj<typeof Switch>;

export const Playground: Story = {};

const stateRows: Array<{ label: string; wrap?: (n: ReactNode) => ReactNode; disabled?: boolean }> = [
  { label: "Default" },
  { label: "Hover", wrap: (n) => <Forced state="hover">{n}</Forced> },
  { label: "Focus", wrap: (n) => <Forced state="focus">{n}</Forced> },
  { label: "Disabled", disabled: true },
];

const cols: Array<{ label: string; checked: boolean; color: SwitchColor }> = [
  { label: "Off", checked: false, color: "green" },
  { label: "On", checked: true, color: "green" },
  { label: "On · danger (red)", checked: true, color: "red" },
];

export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div>
      <Section title="States" description="Figma Is Toggled × State × Default (danger = color red).">
        <div style={{ display: "grid", gridTemplateColumns: "100px repeat(3, 140px)", gap: 20, alignItems: "center" }}>
          <span />
          {cols.map((c) => (
            <StateCell key={c.label} label={c.label}><span /></StateCell>
          ))}
          {stateRows.map((r) => (
            <Row key={r.label} {...r} />
          ))}
        </div>
      </Section>
      <Section title="Colours" description="On-state overrides for filter-panel category toggles.">
        <Stage gap={28}>
          <Switch label="Green" defaultChecked color="green" />
          <Switch label="Red" defaultChecked color="red" />
          <Switch label="Blue" defaultChecked color="blue" />
          <Switch label="Orange" defaultChecked color="orange" />
        </Stage>
      </Section>
    </div>
  ),
};

function Row({ label, wrap, disabled }: (typeof stateRows)[number]) {
  return (
    <>
      <StateCell label={label}><span /></StateCell>
      {cols.map((c) => {
        const n = (
          <Switch
            aria-label={`${label} ${c.label}`}
            defaultChecked={c.checked}
            color={c.color}
            disabled={disabled}
          />
        );
        return <div key={c.label}>{wrap ? wrap(n) : n}</div>;
      })}
    </>
  );
}

export const YesNo: StoryObj<typeof YesNoSwitch> = {
  name: "Yes / No switch",
  parameters: { controls: { disable: true } },
  render: function YesNoStory() {
    const [v, setV] = useState<boolean | null>(null);
    return (
      <div>
        <Section title="Status" description="Figma Status True / False / None.">
          <Stage gap={28}>
            <StateCell label="True">
              <YesNoSwitch aria-label="Status true" defaultValue={true} />
            </StateCell>
            <StateCell label="False">
              <YesNoSwitch aria-label="Status false" defaultValue={false} />
            </StateCell>
            <StateCell label="None">
              <YesNoSwitch aria-label="Status none" defaultValue={null} />
            </StateCell>
            <StateCell label="Disabled">
              <YesNoSwitch aria-label="Disabled" defaultValue={true} disabled />
            </StateCell>
          </Stage>
        </Section>
        <Section title="Controlled" description="Arrow keys move and select; Tab enters/leaves the group.">
          <Stage gap={16} align="center">
            <YesNoSwitch aria-label="Consent obtained" value={v} onChange={setV} />
            <span style={{ fontFamily: "var(--insight-font-family-mono)", fontSize: 12 }}>
              value: {String(v)}
            </span>
          </Stage>
        </Section>
      </div>
    );
  },
};
