import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  LogIn,
  ArrowRight,
  ArrowUpRight,
  Settings,
  Trash2,
  Plus,
  Download,
  ChevronDown,
  SquareArrowOutUpRight,
} from "lucide-react";
import { Button } from "./Button";
import type { ButtonProps, ButtonSize, ButtonVariant } from "./Button";
import { Stage, StateCell, Section, pseudo } from "../../storybook/StoryLayout";

type CanonicalVariant = Exclude<ButtonVariant, "warning">;

const VARIANTS: { key: CanonicalVariant; label: string; hint: string }[] = [
  { key: "bold", label: "Bold", hint: "Yellow — primary CTA, strongest emphasis." },
  { key: "outline", label: "Outline", hint: "Green outline — the standard primary on light surfaces." },
  { key: "subtle", label: "Subtle", hint: "Neutral grey fill — secondary actions." },
  { key: "text", label: "Text", hint: "Link-like, low emphasis. Tighter 12px padding." },
  {
    key: "destructive",
    label: "Destructive Outline",
    hint: "Red outline for destructive actions. `variant=\"warning\"` is a deprecated alias.",
  },
];

const SIZES: { key: ButtonSize; label: string }[] = [
  { key: "md", label: "Medium · 48 · r12" },
  { key: "sm", label: "Small · 32 · r8" },
];

type StateKey = "default" | "hover" | "active" | "focus" | "disabled" | "loading";
const STATES: { key: StateKey; label: string }[] = [
  { key: "default", label: "Default" },
  { key: "hover", label: "Hover" },
  { key: "active", label: "Active" },
  { key: "focus", label: "Focus" },
  { key: "disabled", label: "Disabled" },
  { key: "loading", label: "Loading" },
];

function stateProps(state: StateKey): Partial<ButtonProps> {
  switch (state) {
    case "hover":
      return { className: pseudo.hover };
    case "active":
      return { className: pseudo.active };
    case "focus":
      return { className: pseudo.focus };
    case "disabled":
      return { disabled: true };
    case "loading":
      return { loading: true };
    default:
      return {};
  }
}

const meta: Meta<typeof Button> = {
  title: "Components/Button",
  component: Button,
  parameters: {
    docs: {
      description: {
        component:
          "Figma `buttons` set. Five types — `bold`, `outline`, `subtle`, `text`, `destructive` (Destructive Outline; `warning` is kept as a deprecated alias). Two sizes — Medium 48px with 12px corners, Small 32px with 8px corners (`--insight-radius-button-lg` / `-sm`; the old `radius` prop is deprecated and ignored), optional lead/trail icons, and a `loading` state (three-dot indicator, `aria-busy`, activation blocked, width preserved). Hover / active / focus are real CSS states; focus draws a 3px inset ring so layout never shifts. Palette swaps are discrete (no transition).",
      },
    },
  },
  args: {
    children: "Button",
    variant: "bold",
    size: "md",
    disabled: false,
    loading: false,
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["bold", "outline", "subtle", "text", "destructive", "warning"],
      description: "Visual emphasis / semantic role. `warning` = deprecated alias of `destructive`.",
      table: {
        defaultValue: { summary: "bold" },
        type: { summary: "bold | outline | subtle | text | destructive | warning" },
      },
    },
    size: {
      control: "inline-radio",
      options: ["md", "sm"],
      description: "48px with 12px corners (md) or 32px with 8px corners (sm).",
      table: { defaultValue: { summary: "md" } },
    },
    radius: { table: { disable: true } },
    loading: { control: "boolean", description: "Busy state — dots indicator, aria-busy, not clickable." },
    disabled: { control: "boolean", description: "Non-interactive." },
    children: { control: "text", description: "Button label." },
    startIcon: { control: false, description: "Lead icon (Figma `Icon Before`)." },
    endIcon: { control: false, description: "Trail icon (Figma `Icon After`)." },
    onClick: { action: "clicked", table: { disable: true } },
  },
};
export default meta;

type Story = StoryObj<typeof Button>;

/** Fully interactive — drive every prop from the Controls panel. */
export const Playground: Story = {
  args: { startIcon: <Plus /> },
};

/**
 * Every Type × State × Size combination from the Figma set.
 * Hover / active / focus are forced with storybook-addon-pseudo-states.
 */
export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div>
      {VARIANTS.map((v) => (
        <Section key={v.key} title={v.label} description={v.hint}>
          <Stage column gap={20}>
            {SIZES.map((s) => (
                <Stage key={s.key} gap={20} align="flex-end">
                  <div style={{ width: 150 }}>
                    <StateCell label={s.label}>
                      <span />
                    </StateCell>
                  </div>
                  {STATES.map((st) => (
                    <StateCell key={st.key} label={st.label}>
                      <Button
                        variant={v.key}
                        size={s.key}
                        startIcon={<Plus />}
                        {...stateProps(st.key)}
                      >
                        Button
                      </Button>
                    </StateCell>
                  ))}
                </Stage>
            ))}
          </Stage>
        </Section>
      ))}
    </div>
  ),
};

/** Figma `Icon Before` × `Icon After` for every type. */
export const IconPlacement: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Stage column gap={20}>
      {VARIANTS.map((v) => (
        <Stage key={v.key} gap={20} align="flex-end">
          <div style={{ width: 150 }}>
            <StateCell label={v.label}>
              <span />
            </StateCell>
          </div>
          <StateCell label="No icons">
            <Button variant={v.key}>Button</Button>
          </StateCell>
          <StateCell label="Icon before">
            <Button variant={v.key} startIcon={<Plus />}>
              Button
            </Button>
          </StateCell>
          <StateCell label="Icon after">
            <Button variant={v.key} endIcon={<Plus />}>
              Button
            </Button>
          </StateCell>
          <StateCell label="Both">
            <Button variant={v.key} startIcon={<Plus />} endIcon={<Plus />}>
              Button
            </Button>
          </StateCell>
        </Stage>
      ))}
    </Stage>
  ),
};

export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Stage gap={16} align="center">
      <Button variant="bold" startIcon={<LogIn />}>
        Login with CCI
      </Button>
      <Button variant="outline">Cancel</Button>
      <Button variant="subtle" startIcon={<Settings />}>
        Manage
      </Button>
      <Button variant="text" endIcon={<ArrowRight />}>
        Learn more
      </Button>
      <Button variant="destructive" startIcon={<Trash2 />}>
        Delete request
      </Button>
    </Stage>
  ),
};

/** Corners follow size: Small 8px, Medium 12px. */
export const Radius: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Stage gap={16} align="center">
      <StateCell label="Small · 8px">
        <Button variant="outline" size="sm" startIcon={<Download />}>
          Export
        </Button>
      </StateCell>
      <StateCell label="Medium · 12px">
        <Button variant="outline" startIcon={<Download />}>
          Export
        </Button>
      </StateCell>
    </Stage>
  ),
};

/** Loading keeps the label in the DOM (width preserved), sets aria-busy and swallows clicks. */
export const Loading: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Stage gap={16} align="center">
      {VARIANTS.map((v) => (
        <Button key={v.key} variant={v.key} loading>
          Saving
        </Button>
      ))}
    </Stage>
  ),
};

export const WithIcons: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Stage gap={12} align="center">
      <Button variant="bold" startIcon={<Download />} endIcon={<ChevronDown />}>
        Download
      </Button>
      <Button variant="outline" endIcon={<SquareArrowOutUpRight />}>
        Open dataset
      </Button>
      <Button variant="text" endIcon={<ArrowUpRight />}>
        View all
      </Button>
    </Stage>
  ),
};

/** Legacy `variant="warning"` renders identically to `destructive`. */
export const LegacyWarningAlias: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Stage gap={16} align="center">
      <StateCell label='variant="warning"'>
        <Button variant="warning" startIcon={<Trash2 />}>
          Delete
        </Button>
      </StateCell>
      <StateCell label='variant="destructive"'>
        <Button variant="destructive" startIcon={<Trash2 />}>
          Delete
        </Button>
      </StateCell>
    </Stage>
  ),
};
