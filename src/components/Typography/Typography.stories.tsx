import type { Meta, StoryObj } from "@storybook/react-vite";
import { Typography } from "./Typography";
import type { TypographyVariant } from "./Typography";
import { StateCell, Stage } from "../../storybook/StoryLayout";

const VARIANTS: TypographyVariant[] = [
  "h1",
  "h2",
  "h3",
  "title",
  "titleSm",
  "body",
  "bodySm",
  "label",
  "mono",
];

const meta: Meta<typeof Typography> = {
  title: "Components/Typography",
  component: Typography,
  parameters: {
    docs: {
      description: {
        component:
          "The `<Typography>` primitive renders any step of the Roboto scale with a sensible default element (override via `as`). Hierarchy moves through weight (400 → 500 → 700) as often as through size.",
      },
    },
  },
  args: { variant: "body", children: "The data itself is the protagonist." },
  argTypes: {
    variant: { control: "select", options: VARIANTS, description: "Type scale step." },
    as: { control: false, description: "Override the rendered element." },
    children: { control: "text" },
  },
};
export default meta;

type Story = StoryObj<typeof Typography>;

export const Playground: Story = {};

const SAMPLES: Record<TypographyVariant, string> = {
  h1: "Leverage curated genomic insights",
  h2: "Slice and segment",
  h3: "Drill down into specific cohorts",
  title: "Biosamples & Variants",
  titleSm: "Filter category",
  body: "Explore structured clinical and high-resolution genomic data.",
  bodySm: "Filter by file type, ID and category to pinpoint what matters.",
  label: "Diagnostic category",
  mono: "P-XXXX-XXXX-DNA-WGS",
};

/** Every variant in the scale, labelled. */
export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Stage column gap={20}>
      {VARIANTS.map((v) => (
        <StateCell key={v} label={v}>
          <Typography variant={v}>{SAMPLES[v]}</Typography>
        </StateCell>
      ))}
    </Stage>
  ),
};
