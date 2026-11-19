import type { Meta, StoryObj } from "@storybook/react-vite";
import { Card, CardChip, CardText } from "./Card";
import { Section, Stage, StateCell, pseudo } from "../../storybook/StoryLayout";

const CITATION =
  "Lorlatinib potent 3rd generation ALKi, activity against crizotinib-resistant mutation in vitro. Infarinato, 2016";
/** Figma uses an empty grey media frame; any media node (or a URL) can be passed. */
const MEDIA = <div role="presentation" style={{ width: "100%", height: "100%" }} />;
const chips = (n: number) => (
  <>
    {Array.from({ length: n }, (_, i) => (
      <CardChip key={i}>Chip text</CardChip>
    ))}
  </>
);

const meta: Meta<typeof Card> = {
  title: "Components/Card",
  component: Card,
  parameters: {
    docs: {
      description: {
        component:
          "Content card from the Figma **Card** set. Every Figma boolean is an optional slot: `image`, `chips` (use `CardChip`), `label` + `description` (inline by default, `stacked` for Label + Description Stacked) and `citation`. `variant=\"category\"` is the Cancer Category Tile (title, subtitle, participant count). Pass `href` to make the whole card a link. FeatureCard / AudienceCard remain separate.",
      },
    },
  },
  args: {
    variant: "default",
    image: MEDIA,
    chips: chips(2),
    label: "Label",
    description: "Description/detail",
    stacked: true,
    citation: CITATION,
  },
  argTypes: {
    variant: { control: "inline-radio", options: ["default", "category"] },
    image: { control: false },
    chips: { control: false },
    label: { control: "text" },
    description: { control: "text" },
    citation: { control: "text" },
    stacked: { control: "boolean" },
    href: { control: "text" },
  },
  render: (args) => (
    <div style={{ width: args.variant === "category" ? 360 : 454 }}>
      <Card {...args} />
    </div>
  ),
};
export default meta;

type Story = StoryObj<typeof Card>;

export const Playground: Story = {};

type Combo = { label: string; image?: boolean; chip?: boolean; lbl?: boolean; stacked?: boolean; cite?: boolean };
const WITH_IMAGE: Combo[] = [
  { label: "Image + Label", image: true, lbl: true },
  { label: "Image + Stacked", image: true, stacked: true },
  { label: "Image only", image: true },
  { label: "Image + Chip + Label", image: true, chip: true, lbl: true },
  { label: "Image + Chip", image: true, chip: true },
  { label: "Image + Chip + Label + Citation", image: true, chip: true, lbl: true, cite: true },
  { label: "Image + Chip + Stacked + Citation", image: true, chip: true, stacked: true, cite: true },
  { label: "Image + Chip + Citation", image: true, chip: true, cite: true },
  { label: "Image + Citation", image: true, cite: true },
];
const NO_IMAGE: Combo[] = [
  { label: "Chip + Citation", chip: true, cite: true },
  { label: "Citation", cite: true },
  { label: "Stacked + Citation", stacked: true, cite: true },
  { label: "Chip + Label + Citation", chip: true, lbl: true, cite: true },
  { label: "Chip + Label", chip: true, lbl: true },
  { label: "Chip + Stacked", chip: true, stacked: true },
  { label: "Chip + Stacked + Citation", chip: true, stacked: true, cite: true },
];

function ComboCard({ c, width }: { c: Combo; width: number }) {
  const hasText = c.lbl || c.stacked;
  return (
    <div style={{ width }}>
      <Card
        image={c.image ? MEDIA : undefined}
        chips={c.chip ? chips(c.image ? 2 : 1) : undefined}
        label={hasText ? "Label" : undefined}
        description={hasText ? "Description/detail" : undefined}
        stacked={c.stacked}
        citation={c.cite ? CITATION : undefined}
      />
    </div>
  );
}

/** Every Figma Card variant (Image × Chip × Label × Stacked × Citation, plus the Category Tile). */
export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div>
      <Section title="With image">
        <Stage gap={20}>
          {WITH_IMAGE.map((c) => (
            <StateCell key={c.label} label={c.label}>
              <ComboCard c={c} width={c.chip || c.cite ? 454 : 320} />
            </StateCell>
          ))}
          <StateCell label="Everything (Label + Stacked via children)">
            <div style={{ width: 454 }}>
              <Card image={MEDIA} chips={chips(2)} label="Label" description="Description/detail" stacked citation={CITATION}>
                <CardText label="Label" description="Description/detail" labelAs="p" />
              </Card>
            </div>
          </StateCell>
        </Stage>
      </Section>
      <Section title="Without image">
        <Stage column gap={16}>
          {NO_IMAGE.map((c) => (
            <StateCell key={c.label} label={c.label}>
              <ComboCard c={c} width={785} />
            </StateCell>
          ))}
        </Stage>
      </Section>
      <Section title="Clinical Domain = Cancer Category Tile" description="Column=Two layout tile. Interactive when given href (hover shown forced).">
        <Stage gap={20}>
          <StateCell label="Default">
            <div style={{ width: 360 }}>
              <Card variant="category" label="Label / Category Title" description="n subcategories" count="1,234" />
            </div>
          </StateCell>
          <StateCell label="Link, hover">
            <div style={{ width: 360 }}>
              <Card
                variant="category"
                href="#"
                className={pseudo.hover}
                label="Sarcoma"
                description="12 subcategories"
                count="1,234"
              />
            </div>
          </StateCell>
        </Stage>
      </Section>
    </div>
  ),
};
