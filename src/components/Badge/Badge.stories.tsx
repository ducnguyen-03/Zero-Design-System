import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";
import { Minus, Pencil, Plus } from "lucide-react";
import { Badge, CountBadge, StatusBadge } from "./Badge";
import type { BadgeAppearance, BadgeProps, BadgeVariant } from "./Badge";
import { Stage, StateCell, Section } from "../../storybook/StoryLayout";

const VARIANTS: BadgeVariant[] = [
  "primary",
  "inverted",
  "secondary",
  "success",
  "danger",
  "warning",
  "neutral",
];
const APPEARANCES: BadgeAppearance[] = ["default", "rounded", "outlined"];

/** Icons used per row in Figma: pencil for people (primary/inverted), plus/minus elsewhere. */
const ROW_ICON: Record<BadgeVariant, ReactNode> = {
  primary: <Pencil />,
  inverted: <Pencil />,
  secondary: <Plus />,
  success: <Minus />,
  danger: <Minus />,
  warning: <Plus />,
  neutral: <Minus />,
};

const STATUS_LABEL: Record<BadgeVariant, string> = {
  primary: "Ready for review",
  inverted: "Principle investigator",
  secondary: "Co-investigator",
  success: "Approved",
  danger: "Rejected",
  warning: "Pending signature",
  neutral: "Withdrawn",
};

type IconSlot = "none" | "prefix" | "suffix";
type BadgeStoryArgs = BadgeProps & { iconSlot?: IconSlot };

const meta: Meta<BadgeStoryArgs> = {
  title: "Components/Badge",
  component: Badge,
  parameters: {
    docs: {
      description: {
        component:
          "Figma **Badge** (3412:13223): seven colour variants × three styles (default 4px corners, rounded pill, outlined pill) × optional prefix/suffix icon. Also exports `StatusBadge` (Figma **Status Badge**, 3412:13188) for workflow states and `CountBadge` (Figma **Badge v1.1 / numeric**, 3412:10503) for numeric table values. The `[Deprecated] Badge` set (3412:10420) is intentionally not implemented.",
      },
    },
  },
  args: { children: "John Smith", variant: "primary", appearance: "default", iconSlot: "none" },
  argTypes: {
    variant: { control: "select", options: VARIANTS },
    appearance: { control: "inline-radio", options: APPEARANCES, description: "Figma Style." },
    iconSlot: {
      control: "inline-radio",
      options: ["none", "prefix", "suffix"],
      name: "icon (story)",
      description: "Figma Icon — maps to `startIcon` / `endIcon`.",
    },
    children: { control: "text" },
    startIcon: { control: false },
    endIcon: { control: false },
  },
  render: ({ iconSlot, ...rest }) => (
    <Badge
      {...rest}
      startIcon={iconSlot === "prefix" ? <Pencil /> : undefined}
      endIcon={iconSlot === "suffix" ? <Pencil /> : undefined}
    />
  ),
};
export default meta;

type Story = StoryObj<BadgeStoryArgs>;

export const Playground: Story = {};

/** Variant × Style × Icon — every combination in the Figma set. */
export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Section title="Badge" description="Rows: Variant. Columns: Style × Icon.">
      <Stage column gap={16}>
        {VARIANTS.map((v) => (
          <Stage key={v} gap={16} align="center">
            {APPEARANCES.map((a) => (
              <Stage key={a} gap={12} align="center">
                <StateCell label={`${v} · ${a}`}>
                  <Badge variant={v} appearance={a}>
                    Project title
                  </Badge>
                </StateCell>
                <StateCell label="prefix">
                  <Badge variant={v} appearance={a} startIcon={ROW_ICON[v]}>
                    John Smith
                  </Badge>
                </StateCell>
                <StateCell label="suffix">
                  <Badge variant={v} appearance={a} endIcon={ROW_ICON[v]}>
                    John Smith
                  </Badge>
                </StateCell>
              </Stage>
            ))}
          </Stage>
        ))}
      </Stage>
    </Section>
  ),
};

/** Figma "Status Badge" — workflow states. */
export const Status: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Section title="StatusBadge" description="Seven workflow statuses; soft 4px corners, no icons.">
      <Stage gap={12}>
        {VARIANTS.map((v) => (
          <StateCell key={v} label={v}>
            <StatusBadge variant={v}>{STATUS_LABEL[v]}</StatusBadge>
          </StateCell>
        ))}
      </Stage>
    </Section>
  ),
};

/** Figma "Badge v1.1 / numeric" — Centered (neutral), Green, Red. */
export const Count: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Section
      title="CountBadge"
      description="Numeric values in tables. Use `block` to fill a table cell (Figma draws it 148px wide)."
    >
      <Stage gap={16} align="center">
        <StateCell label="neutral">
          <CountBadge>2.0</CountBadge>
        </StateCell>
        <StateCell label="success">
          <CountBadge tone="success">-9.0</CountBadge>
        </StateCell>
        <StateCell label="danger">
          <CountBadge tone="danger">9.0</CountBadge>
        </StateCell>
      </Stage>
      <div style={{ width: 148, display: "grid", gap: 8, marginTop: 16 }}>
        <CountBadge block>2.0</CountBadge>
        <CountBadge block tone="success">
          -9.0
        </CountBadge>
        <CountBadge block tone="danger">
          9.0
        </CountBadge>
      </div>
    </Section>
  ),
};
