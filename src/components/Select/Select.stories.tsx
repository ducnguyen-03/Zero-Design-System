import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Select } from "./Select";
import type { SelectProps, SelectSize, SelectVariant } from "./Select";
import { Stage, StateCell, Section, Forced } from "../../storybook/StoryLayout";

const OPTIONS = [
  { label: "Whole genome sequencing", value: "wgs" },
  { label: "RNA-seq", value: "rna" },
  { label: "Methylation", value: "methyl" },
  { label: "Exome", value: "exome" },
  { label: "Proteomics (unavailable)", value: "prot", disabled: true },
];

const meta: Meta<typeof Select> = {
  title: "Components/Select",
  component: Select,
  parameters: {
    docs: {
      description: {
        component:
          "Accessible custom dropdown (Figma `dropdown / default` 3412:10588): a select-only combobox with a popup " +
          "listbox — ↑/↓/Home/End move, Enter/Space choose, Esc closes, letters type-ahead. " +
          "`variant=\"field\"` is the outlined Dropdown, `variant=\"text\"` the borderless Text Dropdown. " +
          "Sizes M 48 / S 40 / XS 24 (XS is for the text variant). `multiple` is the Chip Dropdown — selections render " +
          "as removable chips (Backspace removes the last). Focus / open draw a 2px green-160 frame; errors a red border " +
          "with a red-300 message. The popup menu styling is not specified in Figma and uses core tokens.",
      },
    },
  },
  args: {
    label: "Label",
    helpText: "This is helper text.",
    placeholder: "Select...",
    options: OPTIONS,
    size: "sm",
    variant: "field",
  },
  argTypes: {
    label: { control: "text" },
    placeholder: { control: "text" },
    helpText: { control: "text" },
    errorText: { control: "text" },
    size: { control: "inline-radio", options: ["xs", "sm", "md"] },
    variant: { control: "inline-radio", options: ["field", "text"] },
    multiple: { control: "boolean" },
    disabled: { control: "boolean" },
    required: { control: "boolean" },
    options: { control: false, description: "{ label, value, disabled? }[]" },
  },
  render: (args) => (
    <div style={{ width: 280, minHeight: 280 }}>
      <Select key={String(args.multiple)} {...args} />
    </div>
  ),
};
export default meta;

type Story = StoryObj<typeof Select>;

export const Playground: Story = {};

const W = 200;
const S = (p: Partial<SelectProps>) => (
  <div style={{ width: W }}>
    <Select placeholder="Select..." aria-label="Assay" {...(p as SelectProps)} options={OPTIONS} />
  </div>
);

const STATES = ["Default", "Focus", "Active (open)", "Error", "Disabled"] as const;

function StateRow({
  variant,
  size,
  multiple,
}: {
  variant: SelectVariant;
  size: SelectSize;
  multiple?: boolean;
}) {
  const base: Partial<SelectProps> = multiple
    ? { variant, size, multiple: true, defaultValue: ["wgs"] }
    : { variant, size, defaultValue: "wgs" };
  return (
    <Stage gap={32}>
      {STATES.map((st) => {
        if (st === "Disabled" && (variant !== "text" || multiple)) return null;
        let node = S(base);
        if (st === "Focus")
          node = <Forced state="focusWithin">{S(base)}</Forced>;
        if (st === "Active (open)") node = <OpenSelect {...base} />;
        if (st === "Error") node = S({ ...base, errorText: "Error message" });
        if (st === "Disabled") node = S({ ...base, disabled: true });
        return (
          <StateCell key={st} label={st}>
            {node}
          </StateCell>
        );
      })}
    </Stage>
  );
}

/** Rendered with its listbox open so the Active state is visible in docs. */
function OpenSelect(p: Partial<SelectProps>) {
  return (
    <div style={{ width: W, minHeight: 240 }}>
      <Select aria-label="Assay" {...(p as SelectProps)} options={OPTIONS} defaultOpen />
    </div>
  );
}

export const Dropdown: Story = {
  name: "Field Type · Dropdown",
  parameters: { controls: { disable: true } },
  render: () => (
    <>
      <Section title="Size M (48px)">
        <StateRow variant="field" size="md" />
      </Section>
      <Section title="Size S (40px)">
        <StateRow variant="field" size="sm" />
      </Section>
      <Section title="Placeholder + error (Figma 'Select...')">
        <Stage gap={32}>
          {S({ size: "sm", errorText: "Error message" })}
          {S({ size: "md" })}
        </Stage>
      </Section>
    </>
  ),
};

export const TextDropdown: Story = {
  name: "Field Type · Text Dropdown",
  parameters: { controls: { disable: true } },
  render: () => (
    <>
      <Section title="Size M (48px)">
        <StateRow variant="text" size="md" />
      </Section>
      <Section title="Size S (40px)">
        <StateRow variant="text" size="sm" />
      </Section>
      <Section title="Size XS (24px)">
        <StateRow variant="text" size="xs" />
      </Section>
    </>
  ),
};

export const ChipDropdown: Story = {
  name: "Field Type · Chip Dropdown",
  parameters: { controls: { disable: true } },
  render: () => (
    <>
      <Section title="Size M (48px)">
        <StateRow variant="field" size="md" multiple />
      </Section>
      <Section title="Size S (40px)">
        <StateRow variant="field" size="sm" multiple />
      </Section>
      <Section title="Several chips (wraps)">
        <div style={{ width: 320 }}>
          <Select
            options={OPTIONS}
            multiple
            defaultValue={["wgs", "rna", "methyl"]}
            label="Assays"
          />
        </div>
      </Section>
    </>
  ),
};

export const LabelAndHelper: Story = {
  name: "Label × Helper Text",
  parameters: { controls: { disable: true } },
  render: () => (
    <Stage gap={32}>
      {(["text", "field"] as const).flatMap((variant) =>
        (["xs", "sm", "md"] as const)
          .filter((s) => variant === "text" || s !== "xs")
          .flatMap((size) =>
            [true, false].map((helper) => (
              <StateCell
                key={`${variant}-${size}-${helper}`}
                label={`${variant} · ${size}${helper ? " · helper" : ""}`}
              >
                {S({
                  variant,
                  size,
                  label: "Label",
                  helpText: helper ? "This is helper text." : undefined,
                  defaultValue: "wgs",
                })}
              </StateCell>
            )),
          ),
      )}
      {[true, false].flatMap((helper) =>
        (["sm", "md"] as const).map((size) => (
          <StateCell key={`chip-${size}-${helper}`} label={`chip · ${size}${helper ? " · helper" : ""}`}>
            {S({
              size,
              multiple: true,
              label: "Label",
              helpText: helper ? "This is helper text." : undefined,
              defaultValue: ["wgs"],
            })}
          </StateCell>
        )),
      )}
    </Stage>
  ),
};

export const Controlled: Story = {
  parameters: { controls: { disable: true } },
  render: () => {
    function Demo() {
      const [v, setV] = useState<string[]>(["rna"]);
      return (
        <div style={{ width: 320, minHeight: 280 }}>
          <Select
            label="Assays"
            options={OPTIONS}
            multiple
            value={v}
            onValueChange={setV}
            helpText={`Selected: ${v.join(", ") || "none"}`}
          />
        </div>
      );
    }
    return <Demo />;
  },
};
