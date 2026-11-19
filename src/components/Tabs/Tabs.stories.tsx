import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { LayoutGrid } from "lucide-react";
import { Tabs } from "./Tabs";
import type { TabItem, TabsSize, TabsTheme } from "./Tabs";
import { StateCell, Section, Stage, Forced } from "../../storybook/StoryLayout";

const ITEMS: TabItem[] = [
  { label: "Biosamples & Variants", value: "biosamples" },
  { label: "PDX", value: "pdx" },
  { label: "Study", value: "study" },
];

const FIVE: TabItem[] = ["Tab 1", "Tab 2", "Tab 3", "Tab 4", "Tab 5"].map((label, i) => ({
  label,
  value: `t${i + 1}`,
}));

const SUB = ["Sub tab 1", "Sub tab 2", "Sub tab 3", "Sub tab 4", "Sub tab 5"].map((label, i) => ({
  label,
  value: `s${i + 1}`,
}));

const DOUBLE: TabItem[] = FIVE.map((t) => ({
  ...t,
  subItems: SUB.map((s) => ({ ...s, value: `${t.value}-${s.value}` })),
}));

const one = (label = "Tab", extra: Partial<TabItem> = {}): TabItem[] => [{ label, value: "x", ...extra }];

const meta: Meta<typeof Tabs> = {
  title: "Components/Tabs",
  component: Tabs,
  parameters: {
    docs: {
      description: {
        component:
          "WAI-ARIA tablist with roving tabindex: Arrow Left/Right move between tabs (skipping disabled ones), Home/End jump to the ends; `activation=\"automatic\"` selects on focus, `manual` waits for Enter/Space. Variants: **primary** (block tabs with a 4px green top indicator on the active tab; `theme` light/dark), **secondary** (pill tabs, light only), and the legacy **underline** style, which stays the default so existing usage is unchanged. `size` md/sm. Each tab can carry an `icon` at `iconPosition` start/end. Give tabs `subItems` to get the Figma double-tier layout: a second, secondary/sm tablist under the active parent tab.",
      },
    },
  },
  args: {
    "aria-label": "Highlights view",
    items: ITEMS,
    variant: "primary",
    theme: "light",
    size: "md",
    activation: "automatic",
  },
  argTypes: {
    items: { control: false, description: "{ label, value, disabled?, icon?, iconPosition?, panelId?, subItems? }[]" },
    variant: { control: "inline-radio", options: ["underline", "primary", "secondary"] },
    theme: { control: "inline-radio", options: ["light", "dark"] },
    size: { control: "inline-radio", options: ["md", "sm"] },
    activation: { control: "inline-radio", options: ["automatic", "manual"] },
    defaultValue: { control: "text", description: "Uncontrolled initial value." },
    value: { control: "text", description: "Controlled active value." },
    onChange: { action: "changed", table: { disable: true } },
    onSubChange: { action: "subChanged", table: { disable: true } },
  },
  render: (args) => (
    <div style={{ width: 640 }}>
      <Tabs {...args} />
    </div>
  ),
};
export default meta;

type Story = StoryObj<typeof Tabs>;

export const Playground: Story = {};

/** Every Figma "Tab" axis: Type × Active × State × Icon/position × Theme × Size. */
export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => {
    const rows: Array<{ variant: "primary" | "secondary"; theme: TabsTheme; size: TabsSize; title: string }> = [
      { variant: "primary", theme: "dark", size: "md", title: "Primary · Dark · Default" },
      { variant: "primary", theme: "light", size: "md", title: "Primary · Light · Default" },
      { variant: "primary", theme: "light", size: "sm", title: "Primary · Light · Small" },
      { variant: "secondary", theme: "light", size: "md", title: "Secondary · Light · Default" },
      { variant: "secondary", theme: "light", size: "sm", title: "Secondary · Light · Small" },
    ];
    const icons: Array<{ label: string; extra: Partial<TabItem> }> = [
      { label: "No icon", extra: {} },
      { label: "Icon right", extra: { icon: <LayoutGrid />, iconPosition: "end" } },
      { label: "Icon left", extra: { icon: <LayoutGrid />, iconPosition: "start" } },
    ];
    const states = [
      { label: "Default", wrap: (n: ReactNode) => n, disabled: false },
      { label: "Hover", wrap: (n: ReactNode) => <Forced state="hover">{n}</Forced>, disabled: false },
      { label: "Focus", wrap: (n: ReactNode) => <Forced state="focus">{n}</Forced>, disabled: false },
      { label: "Disabled", wrap: (n: ReactNode) => n, disabled: true },
    ];
    return (
      <div>
        {rows.map((row) => (
          <Section key={row.title} title={row.title}>
            <Stage column gap={16}>
              {states.map((st) => (
                <Stage key={st.label} gap={24} align="flex-end">
                  {[true, false].flatMap((isActive) =>
                    isActive && st.disabled
                      ? []
                      : icons.map((ic) => (
                          <StateCell
                            key={`${isActive}-${ic.label}`}
                            label={`${isActive ? "Active" : "Inactive"} · ${st.label} · ${ic.label}`}
                          >
                            {st.wrap(
                              <Tabs
                                aria-label={`${row.title} ${st.label}`}
                                variant={row.variant}
                                theme={row.theme}
                                size={row.size}
                                items={one("Tab", { ...ic.extra, disabled: st.disabled })}
                                value={isActive ? "x" : "none"}
                              />,
                            )}
                          </StateCell>
                        )),
                  )}
                </Stage>
              ))}
            </Stage>
          </Section>
        ))}
      </div>
    );
  },
};

/** Figma "Tabs group": Group Type × Theme × Size. */
export const Groups: Story = {
  parameters: { controls: { disable: true } },
  render: () => {
    const five = FIVE.map((t) => ({ ...t, label: "Tab" }));
    return (
      <div>
        <Section title="Primary · Dark">
          <Tabs aria-label="Primary dark" variant="primary" theme="dark" items={five} />
        </Section>
        <Section title="Primary · Light (Default / Small)">
          <Stage gap={48}>
            <Tabs aria-label="Primary light" variant="primary" theme="light" items={five} />
            <Tabs aria-label="Primary light small" variant="primary" theme="light" size="sm" items={five} />
          </Stage>
        </Section>
        <Section title="Secondary · Light (Default / Small)">
          <Stage gap={48}>
            <Tabs aria-label="Secondary" variant="secondary" items={five} />
            <Tabs aria-label="Secondary small" variant="secondary" size="sm" items={five} />
          </Stage>
        </Section>
        <Section
          title="Double Tier (Dark / Light Small)"
          description="Give items `subItems` to render a second, secondary/small tablist under the active tab. Sub selection resets to the first sub tab when the parent changes."
        >
          <Stage column gap={32}>
            <div style={{ width: 525 }}>
              <Tabs aria-label="Double tier" variant="primary" theme="dark" items={DOUBLE} defaultValue="t2" />
            </div>
            <div style={{ width: 525 }}>
              <Tabs aria-label="Double tier small" variant="primary" theme="light" size="sm" items={DOUBLE} defaultValue="t2" />
            </div>
          </Stage>
        </Section>
      </div>
    );
  },
};

export const Legacy: Story = {
  name: "Underline (legacy)",
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ width: 560 }}>
      <Section title="Default" description="The original underline style — still the default `variant`.">
        <Tabs aria-label="v1" items={ITEMS} />
      </Section>
      <Section title="Hover" description="Inactive labels darken toward offBlack on hover.">
        <Forced state="hover">
          <div style={{ width: 560 }}>
            <Tabs aria-label="v2" items={ITEMS} />
          </div>
        </Forced>
      </Section>
      <Section title="With disabled tab" description="Disabled tabs fade to ~50% and lock the cursor.">
        <Tabs aria-label="v3" items={[...ITEMS.slice(0, 2), { label: "Study", value: "study", disabled: true }]} />
      </Section>
    </div>
  ),
};

export const WithDisabled: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <StateCell label="Study disabled (arrow keys skip it)">
      <div style={{ width: 560 }}>
        <Tabs
          aria-label="disabled-demo"
          variant="primary"
          items={[...ITEMS.slice(0, 2), { label: "Study", value: "study", disabled: true }]}
        />
      </div>
    </StateCell>
  ),
};
