import type { Meta, StoryObj } from "@storybook/react-vite";
import { Plus } from "lucide-react";
import { Chip } from "./Chip";
import type { ChipColor, ChipProps, ChipRadius, ChipSize, ChipVariant } from "./Chip";
import { Stage, StateCell, Section } from "../../storybook/StoryLayout";

const COLORS: ChipColor[] = [
  "blue",
  "green",
  "grey",
  "violet",
  "purple",
  "magenta",
  "red",
  "orange",
];

const LABELS: Record<ChipColor, string> = {
  blue: "Brain tumours",
  green: "WGS",
  grey: "P-XXXX",
  violet: "Sarcoma",
  purple: "Leukaemia",
  magenta: "RNA-seq",
  red: "Variant",
  orange: "Methylation",
};

const VARIANTS: ChipVariant[] = ["fill", "outline"];
const SIZES: ChipSize[] = ["lg", "md", "sm"];
const RADII: ChipRadius[] = ["rounded", "soft"];
const SIZE_LABEL: Record<ChipSize, string> = { sm: "Small · 24", md: "Medium · 28", lg: "Large · 32" };

const noop = () => {};

type ChipStoryArgs = ChipProps & { withIcon?: boolean; clearable?: boolean };

const meta: Meta<ChipStoryArgs> = {
  title: "Components/Chip",
  component: Chip,
  parameters: {
    docs: {
      description: {
        component:
          "Figma **Chips** (3412:10136). Fill or Outline, three sizes (24 / 28 / 32), an optional leading icon, an optional clear (×) button and Rounded (pill) or Soft (6px) corners. The optional `color` prop keeps the tinted pairs used for diagnostic categories in the data grid. `pill` is deprecated in favour of `radius`.",
      },
    },
  },
  args: {
    children: "Chip text",
    variant: "fill",
    size: "md",
    radius: "rounded",
    withIcon: false,
    clearable: false,
  },
  argTypes: {
    variant: { control: "inline-radio", options: VARIANTS, description: "Figma Type." },
    size: { control: "inline-radio", options: ["sm", "md", "lg"], description: "24 / 28 / 32px." },
    radius: { control: "inline-radio", options: RADII, description: "Rounded (pill) or Soft (6px)." },
    color: { control: "select", options: [undefined, ...COLORS], description: "Optional tinted pair." },
    children: { control: "text" },
    icon: { control: false },
    onRemove: { control: false },
    pill: { control: false, description: "Deprecated — use `radius`." },
    withIcon: { control: "boolean", name: "icon (story)", description: "Show a leading icon." },
    clearable: { control: "boolean", name: "clearable (story)", description: "Show the clear button." },
  },
  render: ({ withIcon, clearable, ...rest }) => {
    return (
      <Chip
        {...rest}
        icon={withIcon ? <Plus /> : undefined}
        onRemove={clearable ? noop : undefined}
      />
    );
  },
};
export default meta;

type Story = StoryObj<ChipStoryArgs>;

export const Playground: Story = {};

/** Every Figma axis: Type × Size × Icon × Clearable × Border. */
export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div>
      {RADII.map((r) => (
        <Section
          key={r}
          title={r === "rounded" ? "Border · Rounded" : "Border · Soft (6px)"}
          description="Rows: Type × Size. Columns: Icon + Clearable, Clearable only, Icon only, plain."
        >
          <Stage column gap={16}>
            {SIZES.map((s) =>
              VARIANTS.map((v) => (
                <Stage key={`${s}-${v}`} gap={16} align="center">
                  <StateCell label={`${v} · ${SIZE_LABEL[s]}`}>
                    <Chip variant={v} size={s} radius={r} icon={<Plus />} onRemove={noop}>
                      Chip text
                    </Chip>
                  </StateCell>
                  <StateCell label="clearable">
                    <Chip variant={v} size={s} radius={r} onRemove={noop}>
                      Chip text
                    </Chip>
                  </StateCell>
                  <StateCell label="icon">
                    <Chip variant={v} size={s} radius={r} icon={<Plus />}>
                      Chip text
                    </Chip>
                  </StateCell>
                  <StateCell label="plain">
                    <Chip variant={v} size={s} radius={r}>
                      Chip text
                    </Chip>
                  </StateCell>
                </Stage>
              )),
            )}
          </Stage>
        </Section>
      ))}
    </div>
  ),
};

/** Clear-button interaction states (hover / focus / active are real CSS). */
export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Section title="Clear button" description="Hover, keyboard focus and pressed on the × control.">
      <Stage gap={16} align="center">
        <StateCell label="Default">
          <Chip onRemove={noop}>Chip text</Chip>
        </StateCell>
        <StateCell label="Hover">
          <div className="pseudo-hover-all">
            <Chip onRemove={noop}>Chip text</Chip>
          </div>
        </StateCell>
        <StateCell label="Focus">
          <div className="pseudo-focus-visible-all">
            <Chip onRemove={noop}>Chip text</Chip>
          </div>
        </StateCell>
        <StateCell label="Active">
          <div className="pseudo-active-all">
            <Chip onRemove={noop}>Chip text</Chip>
          </div>
        </StateCell>
      </Stage>
    </Section>
  ),
};

/** Tinted colour pairs for category tokens (fill and outline). */
export const AllColors: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Stage column gap={12}>
      <Stage gap={8}>
        {COLORS.map((c) => (
          <Chip key={c} color={c}>
            {LABELS[c]}
          </Chip>
        ))}
      </Stage>
      <Stage gap={8}>
        {COLORS.map((c) => (
          <Chip key={c} color={c} variant="outline" onRemove={noop}>
            {LABELS[c]}
          </Chip>
        ))}
      </Stage>
    </Stage>
  ),
};
