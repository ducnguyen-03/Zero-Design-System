import type { Meta, StoryObj } from "@storybook/react-vite";
import { Divider } from "./Divider";
import { Section, Stage, StateCell } from "../../storybook/StoryLayout";

const text = {
  fontFamily: "var(--insight-font-family-sans)",
  fontSize: 14,
  color: "var(--insight-color-foreground-text-secondary)",
} as const;

const meta: Meta<typeof Divider> = {
  title: "Components/Divider",
  component: Divider,
  parameters: {
    docs: {
      description: {
        component:
          "Figma **Divider** (3412:11305). A 1px grey-75 rule, horizontal or vertical. Renders `role=\"separator\"` with `aria-orientation`; pass `decorative` for a purely visual line.",
      },
    },
  },
  args: { orientation: "horizontal", decorative: false },
  argTypes: {
    orientation: { control: "inline-radio", options: ["horizontal", "vertical"] },
    decorative: { control: "boolean" },
  },
  render: (args) =>
    args.orientation === "vertical" ? (
      <div style={{ display: "flex", gap: 16, height: 90, alignItems: "center", ...text }}>
        <span>Left</span>
        <Divider {...args} />
        <span>Right</span>
      </div>
    ) : (
      <div style={{ width: 200 }}>
        <Divider {...args} />
      </div>
    ),
};
export default meta;

type Story = StoryObj<typeof Divider>;

export const Playground: Story = {};

export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Section title="Direction" description="Horizontal fills its container; vertical stretches to the row height.">
      <Stage gap={48} align="center">
        <StateCell label="Horizontal · 200">
          <div style={{ width: 200, paddingBlock: 8 }}>
            <Divider />
          </div>
        </StateCell>
        <StateCell label="Vertical · 90">
          <div style={{ display: "flex", height: 90 }}>
            <Divider orientation="vertical" />
          </div>
        </StateCell>
        <StateCell label="In a toolbar">
          <div style={{ display: "flex", alignItems: "center", gap: 12, height: 24, ...text }}>
            <span>Edit</span>
            <Divider orientation="vertical" />
            <span>Share</span>
            <Divider orientation="vertical" />
            <span>Delete</span>
          </div>
        </StateCell>
      </Stage>
    </Section>
  ),
};
