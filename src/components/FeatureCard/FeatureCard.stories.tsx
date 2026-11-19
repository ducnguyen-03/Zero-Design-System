import type { Meta, StoryObj } from "@storybook/react-vite";
import { FeatureCard } from "./FeatureCard";
import { Stage, StateCell } from "../../storybook/StoryLayout";
import { pseudo } from "../../storybook/StoryLayout";

const meta: Meta<typeof FeatureCard> = {
  title: "Components/FeatureCard",
  component: FeatureCard,
  parameters: {
    docs: {
      description: {
        component:
          "The Showcase landing card (CardWithImage). Earns lift only on hover — the border thickens from 1.5px grey-50 to 3px green-100 and a green glow appears, all on the signature ease curve. Pass an `image` URL for the bottom-anchored illustration.",
      },
    },
  },
  args: {
    eyebrow: "SLICE",
    title: "Slice and segment",
    description:
      "Drill down into specific cohorts, study codes and clinical categories.",
  },
  argTypes: {
    eyebrow: { control: "text" },
    title: { control: "text" },
    description: { control: "text" },
    image: { control: "text", description: "Illustration URL (optional)." },
  },
  render: (args) => (
    <div style={{ width: 340 }}>
      <FeatureCard {...args} />
    </div>
  ),
};
export default meta;

type Story = StoryObj<typeof FeatureCard>;

export const Playground: Story = {};

/** Default vs. the forced hover lift (border + glow). */
export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Stage gap={32}>
      <StateCell label="Default">
        <div style={{ width: 340 }}>
          <FeatureCard
            eyebrow="SLICE"
            title="Slice and segment"
            description="Drill down into specific cohorts, study codes and clinical categories."
          />
        </div>
      </StateCell>
      <StateCell label="Hover (lift)">
        <div style={{ width: 340 }}>
          <FeatureCard
            className={pseudo.hover}
            eyebrow="SLICE"
            title="Slice and segment"
            description="Drill down into specific cohorts, study codes and clinical categories."
          />
        </div>
      </StateCell>
      <StateCell label="Long copy">
        <div style={{ width: 340 }}>
          <FeatureCard
            eyebrow="REQUEST"
            title="Bundle a selection into one data access request"
            description="Choose samples across cohorts, attach your ethics approval and send a single request to the Data Access Committee. You can track every review step and reply to questions from the same place."
          />
        </div>
      </StateCell>
    </Stage>
  ),
};

export const ShowcaseRow: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 340px)", gap: 24 }}>
      <FeatureCard
        eyebrow="SLICE"
        title="Slice and segment"
        description="Drill down into specific cohorts, study codes and clinical categories."
      />
      <FeatureCard
        eyebrow="FILTER"
        title="Pinpoint what matters"
        description="Filter by file type, ID and category to find the exact slice you need."
      />
      <FeatureCard
        eyebrow="REQUEST"
        title="Select and submit"
        description="Bundle a selection into a single Data Access Request, securely."
      />
    </div>
  ),
};
