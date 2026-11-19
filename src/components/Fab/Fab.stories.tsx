import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Upload, FolderPlus, StickyNote, Share2, Download } from "lucide-react";
import { Fab } from "./Fab";
import type { FabAction, FabLayout } from "./Fab";
import { Stage, StateCell } from "../../storybook/StoryLayout";

const ACTIONS: FabAction[] = [
  { label: "Upload file", icon: <Upload /> },
  { label: "New project", icon: <FolderPlus /> },
  { label: "New note", icon: <StickyNote /> },
];

const RADIAL_ACTIONS: FabAction[] = [
  ...ACTIONS,
  { label: "Share", icon: <Share2 /> },
  { label: "Download", icon: <Download /> },
];

const LAYOUTS: { key: FabLayout; label: string; actions: FabAction[] }[] = [
  { key: "vertical", label: "Vertical", actions: ACTIONS },
  { key: "arc-right", label: "Arc Right", actions: ACTIONS },
  { key: "arc-left", label: "Arc Left", actions: ACTIONS },
  { key: "radial", label: "Radial", actions: RADIAL_ACTIONS },
];

/** Reserves room for the expanded menu so stories don't clip. */
function Frame({ children, align = "flex-end" }: { children: ReactNode; align?: "flex-start" | "center" | "flex-end" }) {
  return (
    <div
      style={{
        width: 180,
        height: 220,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: align,
        paddingBottom: 8,
      }}
    >
      {children}
    </div>
  );
}

const frameAlign = (layout: FabLayout) =>
  layout === "arc-right" ? "flex-start" : layout === "radial" ? "center" : "flex-end";

const meta: Meta<typeof Fab> = {
  title: "Components/Fab",
  component: Fab,
  parameters: {
    docs: {
      description: {
        component:
          "Floating action button (Figma `FAB Button`). A 64px trigger that expands into a menu of actions in one of four layouts: `vertical` (labelled pills stacked above), `arc-right` / `arc-left` (icon-only minis on a quarter arc) and `radial` (half circle above; Figma calls it \"Radical\"). Disclosure pattern: `aria-expanded` / `aria-controls` on the trigger, arrow keys / Home / End move between items, Escape or an outside click closes and returns focus. Controlled (`open` + `onOpenChange`) or uncontrolled (`defaultOpen`). `placement` can pin it to a viewport corner.",
      },
    },
  },
  args: {
    layout: "vertical",
    actions: ACTIONS,
    defaultOpen: false,
    closeOnSelect: true,
  },
  argTypes: {
    layout: {
      control: "inline-radio",
      options: ["vertical", "arc-right", "arc-left", "radial"],
      table: { defaultValue: { summary: "vertical" } },
    },
    open: { control: "boolean", description: "Controlled open state." },
    defaultOpen: { control: "boolean" },
    closeOnSelect: { control: "boolean" },
    placement: {
      control: "inline-radio",
      options: ["inline", "bottom-right", "bottom-left"],
      table: { defaultValue: { summary: "inline" } },
    },
    actions: { control: false },
    icon: { control: false },
    closeIcon: { control: false },
    onOpenChange: { action: "openChange" },
  },
};
export default meta;

type Story = StoryObj<typeof Fab>;

export const Playground: Story = {
  render: (args) => (
    <Frame align={frameAlign(args.layout ?? "vertical")}>
      <Fab
        {...args}
        actions={args.layout === "radial" ? RADIAL_ACTIONS : ACTIONS}
      />
    </Frame>
  ),
};

/** Figma State (Off / On) × Variant. Every "On" sample is rendered open. */
export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Stage gap={32} align="flex-end">
      <StateCell label="Off · Default">
        <Frame>
          <Fab actions={ACTIONS} />
        </Frame>
      </StateCell>
      {LAYOUTS.map((l) => (
        <StateCell key={l.key} label={`On · ${l.label}`}>
          <Frame align={frameAlign(l.key)}>
            <Fab layout={l.key} actions={l.actions} open closeOnSelect={false} />
          </Frame>
        </StateCell>
      ))}
    </Stage>
  ),
};

/** Click each trigger to expand / collapse. */
export const Layouts: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Stage gap={32} align="flex-end">
      {LAYOUTS.map((l) => (
        <StateCell key={l.key} label={l.label}>
          <Frame align={frameAlign(l.key)}>
            <Fab layout={l.key} actions={l.actions} />
          </Frame>
        </StateCell>
      ))}
    </Stage>
  ),
};
