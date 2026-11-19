import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { CircleQuestionMark, Ellipsis, X, SlidersHorizontal, Plus, Star } from "lucide-react";
import { IconButton } from "./IconButton";
import type { IconButtonSize } from "./IconButton";
import { Stage, StateCell, Section, pseudo } from "../../storybook/StoryLayout";

const SIZES: { key: IconButtonSize; label: string }[] = [
  { key: "sm", label: "Small · 24" },
  { key: "md", label: "Medium · 32" },
  { key: "lg", label: "Large · 48" },
];

const meta: Meta<typeof IconButton> = {
  title: "Components/IconButton",
  component: IconButton,
  parameters: {
    docs: {
      description: {
        component:
          "Circular ghost button for icon-only affordances (help, overflow, close, filter). Three sizes — 24 / 32 / 48 with 16 / 20 / 24px glyphs. Grey-30 hover tint, support-grey on press, brand focus ring. `pressed` gives toggle buttons a persistent tint + `aria-pressed`. Always requires an `aria-label`.",
      },
    },
  },
  args: { "aria-label": "Add", icon: <Plus />, size: "md", disabled: false },
  argTypes: {
    icon: { control: false, description: "Icon element (e.g. a lucide-react icon)." },
    "aria-label": { control: "text", description: "Accessible label — required." },
    size: {
      control: "inline-radio",
      options: ["sm", "md", "lg"],
      table: { defaultValue: { summary: "md" } },
    },
    pressed: { control: "boolean", description: "Toggle-on state (aria-pressed)." },
    disabled: { control: "boolean" },
    onClick: { action: "clicked", table: { disable: true } },
  },
};
export default meta;

type Story = StoryObj<typeof IconButton>;

export const Playground: Story = {};

/** Figma Size × State. `Pressed` = Figma "Active, Index=2". */
export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Stage column gap={24}>
      {SIZES.map((s) => (
        <Stage key={s.key} gap={24} align="flex-end">
          <div style={{ width: 110 }}>
            <StateCell label={s.label}>
              <span />
            </StateCell>
          </div>
          <StateCell label="Default" align="center">
            <IconButton size={s.key} aria-label="Add" icon={<Plus />} />
          </StateCell>
          <StateCell label="Hover" align="center">
            <IconButton size={s.key} aria-label="Add" icon={<Plus />} className={pseudo.hover} />
          </StateCell>
          <StateCell label="Active" align="center">
            <IconButton size={s.key} aria-label="Add" icon={<Plus />} className={pseudo.active} />
          </StateCell>
          <StateCell label="Pressed" align="center">
            <IconButton size={s.key} aria-label="Add" icon={<Plus />} pressed />
          </StateCell>
          <StateCell label="Focus" align="center">
            <IconButton size={s.key} aria-label="Add" icon={<Plus />} className={pseudo.focus} />
          </StateCell>
          <StateCell label="Disabled" align="center">
            <IconButton size={s.key} aria-label="Add" icon={<Plus />} disabled />
          </StateCell>
        </Stage>
      ))}
    </Stage>
  ),
};

function ToggleDemo() {
  const [on, setOn] = useState(false);
  return (
    <IconButton
      aria-label="Favourite"
      icon={<Star />}
      pressed={on}
      onClick={() => setOn((v) => !v)}
    />
  );
}

export const Toggle: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Section description="Click to toggle — the pressed tint persists and aria-pressed updates.">
      <ToggleDemo />
    </Section>
  ),
};

export const Gallery: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Stage gap={8} align="center">
      <IconButton aria-label="Help" icon={<CircleQuestionMark />} />
      <IconButton aria-label="More" icon={<Ellipsis />} />
      <IconButton aria-label="Close" icon={<X />} />
      <IconButton aria-label="Filter" icon={<SlidersHorizontal />} />
    </Stage>
  ),
};
