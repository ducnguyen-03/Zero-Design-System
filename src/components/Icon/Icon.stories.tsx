import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  ArrowRight,
  CircleCheck,
  Dna,
  FlaskConical,
  House,
  Info,
  Microscope,
  OctagonAlert,
  Search,
  TriangleAlert,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Icon } from "./Icon";
import type { IconSize, IconTone } from "./Icon";
import { Button } from "../Button/Button";
import { Stage, StateCell, Section } from "../../storybook/StoryLayout";

const GLYPHS: Record<string, LucideIcon> = { Dna, Microscope, FlaskConical, House, Search, Users, Info };
const SIZES: IconSize[] = ["xs", "sm", "md", "lg", "xl", "2xl"];
const PX: Record<IconSize, number> = { xs: 12, sm: 16, md: 20, lg: 24, xl: 32, "2xl": 40 };
const TONES: IconTone[] = [
  "primary",
  "secondary",
  "tertiary",
  "brand",
  "success",
  "danger",
  "warning",
  "info",
];

const meta: Meta<typeof Icon> = {
  title: "Components/Icon",
  component: Icon,
  parameters: {
    docs: {
      description: {
        component:
          "Thin wrapper around a [Lucide](https://lucide.dev) icon that applies the design-system size tokens (`--insight-icon-size-*`), the shared stroke weight (`--insight-icon-stroke`) and semantic tones. Pass the icon component itself — `icon={Dna}` — so only the icons you use are bundled. Icons are decorative (`aria-hidden`) unless you give them a `label`. Browse every glyph in **Foundations › Icons**.",
      },
    },
  },
  args: { icon: Dna, size: "md", tone: "inherit" },
  argTypes: {
    icon: {
      control: "select",
      options: Object.keys(GLYPHS),
      mapping: GLYPHS,
      description: "A Lucide icon component.",
    },
    size: { control: "inline-radio", options: SIZES, description: "Token size (or a pixel number)." },
    tone: { control: "select", options: ["inherit", ...TONES, "on-dark"] },
    label: { control: "text", description: "Accessible name — only when the icon stands alone." },
    strokeWidth: { control: { type: "number", min: 1, max: 3, step: 0.25 } },
  },
};
export default meta;

type Story = StoryObj<typeof Icon>;

export const Playground: Story = {};

/** Five token sizes, all at the shared 2px stroke. */
export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Stage gap={32} align="flex-end">
      {SIZES.map((s) => (
        <StateCell key={s} label={`${s} · ${PX[s]}px`}>
          <Icon icon={Dna} size={s} tone="primary" />
        </StateCell>
      ))}
    </Stage>
  ),
};

/** Semantic tones map to the status / foreground tokens. `inherit` follows the text colour. */
export const Tones: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div>
      <Stage gap={32}>
        {TONES.map((t) => (
          <StateCell key={t} label={t}>
            <Icon icon={Microscope} size="lg" tone={t} />
          </StateCell>
        ))}
      </Stage>
      <div
        style={{
          marginTop: 24,
          padding: 16,
          display: "inline-flex",
          borderRadius: 8,
          background: "var(--insight-color-off-black-100)",
        }}
      >
        <StateCell label="on-dark">
          <Icon icon={Microscope} size="lg" tone="on-dark" />
        </StateCell>
      </div>
    </div>
  ),
};

/** How icons sit next to text and inside other components. */
export const InContext: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div>
      <Section title="Status messages" description="Pair a tone with the matching text colour; the icon stays decorative because the text carries the meaning.">
        <Stage column gap={8}>
          {(
            [
              [CircleCheck, "success", "Access request approved"],
              [Info, "info", "Cohort refreshed 2 hours ago"],
              [TriangleAlert, "warning", "3 samples are missing consent"],
              [OctagonAlert, "danger", "Upload failed — file too large"],
            ] as const
          ).map(([glyph, tone, text]) => (
            <span
              key={text}
              style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 14 }}
            >
              <Icon icon={glyph} size="sm" tone={tone} />
              {text}
            </span>
          ))}
        </Stage>
      </Section>
      <Section title="In buttons" description="Buttons size their own icons — pass the Lucide element as startIcon / endIcon.">
        <Stage gap={12}>
          <Button variant="outline" startIcon={<Search />}>
            Search cohort
          </Button>
          <Button endIcon={<ArrowRight />}>Explore data</Button>
        </Stage>
      </Section>
      <Section title="Standalone (meaningful)" description="When an icon is the only content, give it a label so screen readers announce it.">
        <Icon icon={Users} size="lg" tone="brand" label="12 collaborators" />
      </Section>
    </div>
  ),
};
