import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";
import { useState } from "react";
import { Dna } from "lucide-react";
import { Checkbox, CheckboxRow } from "./Checkbox";
import type { CheckboxProps } from "./Checkbox";
import { Stage, StateCell, Section, Forced } from "../../storybook/StoryLayout";

const meta: Meta<typeof Checkbox> = {
  title: "Components/Checkbox",
  component: Checkbox,
  parameters: {
    docs: {
      description: {
        component:
          "18px box in a 24px hit area, 1.4px grey-200 border. Checked fills green-175 with a white tick (hover green-200); indeterminate fills grey-100 with a dash (hover grey-200). Focus shows a 2px green ring, error a red border. `CheckboxRow` is the filter-list row with optional count badge or trailing icon.",
      },
    },
  },
  args: {
    label: "Whole genome sequencing",
    defaultChecked: true,
    indeterminate: false,
    error: false,
    disabled: false,
  },
  argTypes: {
    label: { control: "text" },
    defaultChecked: { control: "boolean" },
    indeterminate: { control: "boolean", description: "Mixed state (Figma “Intermediate”)." },
    error: { control: "boolean" },
    disabled: { control: "boolean" },
  },
};
export default meta;

type Story = StoryObj<typeof Checkbox>;

export const Playground: Story = {};

type Col = { key: string; props: CheckboxProps };
const cols: Col[] = [
  { key: "Unchecked", props: {} },
  { key: "Checked", props: { defaultChecked: true } },
  { key: "Indeterminate", props: { indeterminate: true } },
];

const Grid = ({ rows }: { rows: Array<{ label: string; wrap?: (n: ReactNode) => ReactNode; props?: CheckboxProps; only?: string[] }> }) => (
  <div style={{ display: "grid", gridTemplateColumns: "120px repeat(3, 120px)", gap: 20, alignItems: "center" }}>
    <span />
    {cols.map((c) => (
      <StateCell key={c.key} label={c.key}>
        <span />
      </StateCell>
    ))}
    {rows.map((r) => (
      <Row key={r.label} {...r} />
    ))}
  </div>
);

const Row = ({ label, wrap, props, only }: { label: string; wrap?: (n: ReactNode) => ReactNode; props?: CheckboxProps; only?: string[] }) => (
  <>
    <StateCell label={label}>
      <span />
    </StateCell>
    {cols.map((c) => {
      if (only && !only.includes(c.key)) return <span key={c.key} />;
      const node = <Checkbox aria-label={`${label} ${c.key}`} {...c.props} {...props} />;
      return <div key={c.key}>{wrap ? wrap(node) : node}</div>;
    })}
  </>
);

export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Grid
      rows={[
        { label: "Default" },
        { label: "Hover", wrap: (n) => <Forced state="hover">{n}</Forced> },
        { label: "Focus", wrap: (n) => <Forced state="focus">{n}</Forced> },
        { label: "Disabled", props: { disabled: true } },
        { label: "Error", props: { error: true }, only: ["Unchecked"] },
      ]}
    />
  ),
};

/** A parent "select all" driving the indeterminate state. */
export const SelectAll: Story = {
  parameters: { controls: { disable: true } },
  render: function SelectAllStory() {
    const items = ["WGS", "RNA-seq", "Methylation"];
    const [checked, setChecked] = useState<boolean[]>([true, false, false]);
    const all = checked.every(Boolean);
    const some = checked.some(Boolean) && !all;
    return (
      <Stage column gap={4}>
        <Checkbox
          label="All assays"
          checked={all}
          indeterminate={some}
          onChange={() => setChecked(items.map(() => !all))}
        />
        <div style={{ paddingLeft: 28, display: "flex", flexDirection: "column", gap: 4 }}>
          {items.map((it, i) => (
            <Checkbox
              key={it}
              label={it}
              checked={checked[i]}
              onChange={() => setChecked((c) => c.map((v, j) => (j === i ? !v : v)))}
            />
          ))}
        </div>
      </Stage>
    );
  },
};

/** Figma's "Icon / Shape" slot is a placeholder — any Lucide icon goes here. */
const Shape = () => <Dna aria-hidden="true" />;

export const Row_: StoryObj<typeof CheckboxRow> = {
  name: "Checkbox row",
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ width: 348 }}>
      {(["sm", "md", "lg"] as const).map((size) => (
        <Section key={size} title={`Size ${size}`}>
          <CheckboxRow size={size} label="text goes here" count="1,234" />
          <CheckboxRow size={size} label="text goes here" />
          <CheckboxRow size={size} label="text goes here" icon={<Shape />} />
        </Section>
      ))}
      <Section title="States">
        <CheckboxRow label="Checked" count="812" defaultChecked />
        <CheckboxRow label="Indeterminate" count="44" indeterminate />
        <CheckboxRow label="Disabled" count="0" disabled />
        <CheckboxRow label="A much longer label that wraps onto a second line inside the row" count="12" size="sm" />
      </Section>
    </div>
  ),
};
