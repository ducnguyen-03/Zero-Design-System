import type { Meta, StoryObj } from "@storybook/react-vite";
import { Hexagon, Shield } from "lucide-react";
import { Accordion } from "./Accordion";
import type { AccordionItem } from "./Accordion";
import { Section, Stage, StateCell, Forced } from "../../storybook/StoryLayout";

const CARD_ITEMS: AccordionItem[] = [
  {
    value: "unified",
    icon: <Shield />,
    title: "Is the Insight token system unified?",
    subtitle: "Collection architecture & semantic hierarchy",
    meta: "Unified",
    content: (
      <>
        Yes. Collection <code>5. Component Token</code> references our foundation semantic
        variables (<code>2. Semantic</code> and <code>1. Primitives</code>) for complete theme
        agility and zero hardcoded drift.
      </>
    ),
  },
  {
    value: "typography",
    icon: <Hexagon />,
    title: "How are component typography roles bound?",
    subtitle: "Granular component-level typography tokens",
    meta: "57 Roles",
    content: "Each component role binds font family, size, weight, line height and tracking to its own token.",
  },
];

const UNDERLINE_ITEMS: AccordionItem[] = [
  {
    value: "export",
    title: "How do I export components to Figma?",
    meta: "Figma Sync",
    content: (
      <>
        Use our custom plugins inside <code>figma-plugin/zerogel-boss-dna-sync/</code> to scan,
        bind tokens, apply casing fixes, and synchronize DNA directly without any manual re-linking.
      </>
    ),
  },
  {
    value: "contrast",
    title: "Does dark theme preserve color contrast?",
    meta: "Contrast",
    content: "Yes — every semantic pair is validated against WCAG 2.1 AA in both themes.",
  },
];

const meta: Meta<typeof Accordion> = {
  title: "Components/Accordion",
  component: Accordion,
  parameters: {
    docs: {
      description: {
        component:
          "Disclosure list following the WAI-ARIA accordion pattern: each header is a real `<button>` inside a heading with `aria-expanded` / `aria-controls`, and each panel is a labelled `region`. Arrow Up/Down, Home and End move between headers. `type=\"single\"` keeps one item open (optionally `collapsible`), `type=\"multiple\"` lets items open independently. Variants: **Underline** (flat rows) and **Card** (white cards; the open item lifts with a green-10 ring and soft elevation, and its title, icon, tag and chevron turn brand green).",
      },
    },
  },
  args: {
    variant: "card",
    type: "single",
    collapsible: true,
    items: CARD_ITEMS,
    defaultValue: ["unified"],
  },
  argTypes: {
    variant: { control: "inline-radio", options: ["underline", "card"] },
    type: { control: "inline-radio", options: ["single", "multiple"] },
    items: { control: false },
    value: { control: false },
    onValueChange: { action: "valueChange", table: { disable: true } },
  },
  render: (args) => (
    <div style={{ width: 531, maxWidth: "100%" }}>
      <Accordion {...args} items={args.variant === "underline" ? UNDERLINE_ITEMS : CARD_ITEMS} />
    </div>
  ),
};
export default meta;

type Story = StoryObj<typeof Accordion>;

export const Playground: Story = {};

export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div>
      {(["card", "underline"] as const).map((variant) => {
        const items = variant === "card" ? CARD_ITEMS : UNDERLINE_ITEMS;
        return (
          <Section key={variant} title={`Variant = ${variant === "card" ? "Card" : "Underline"}`}>
            <Stage gap={32}>
              <StateCell label="State = Expanded">
                <div style={{ width: 531, maxWidth: "100%" }}>
                  <Accordion variant={variant} items={[items[0]]} defaultValue={[items[0].value]} />
                </div>
              </StateCell>
              <StateCell label="State = Close">
                <div style={{ width: 531, maxWidth: "100%" }}>
                  <Accordion variant={variant} items={[items[1]]} />
                </div>
              </StateCell>
              <StateCell label="Hover (close)">
                <Forced state="hover">
                  <div style={{ width: 531, maxWidth: "100%" }}>
                    <Accordion variant={variant} items={[items[1]]} />
                  </div>
                </Forced>
              </StateCell>
              <StateCell label="Focus-visible (close)">
                <Forced state="focus">
                  <div style={{ width: 531, maxWidth: "100%" }}>
                    <Accordion variant={variant} items={[items[1]]} />
                  </div>
                </Forced>
              </StateCell>
            </Stage>
          </Section>
        );
      })}
    </div>
  ),
};

export const Multiple: Story = {
  args: { type: "multiple", defaultValue: ["unified", "typography"] },
};

export const WithDisabled: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ width: 531, maxWidth: "100%" }}>
      <Accordion
        variant="underline"
        items={[...UNDERLINE_ITEMS, { value: "soon", title: "Coming soon", content: "", disabled: true }]}
      />
    </div>
  ),
};
