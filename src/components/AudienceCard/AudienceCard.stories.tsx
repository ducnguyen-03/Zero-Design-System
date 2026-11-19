import type { Meta, StoryObj } from "@storybook/react-vite";
import { Dna, Stethoscope, ChartNoAxesColumn, CodeXml } from "lucide-react";
import { AudienceCard } from "./AudienceCard";
import { Stage, StateCell, pseudo } from "../../storybook/StoryLayout";

const meta: Meta<typeof AudienceCard> = {
  title: "Components/AudienceCard",
  component: AudienceCard,
  parameters: {
    docs: {
      description: {
        component:
          "Smaller cousin of the FeatureCard — a loose 40px lucide icon, a title and short copy. Same hover lift: 1.5px grey → 3px green border + green glow.",
      },
    },
  },
  args: {
    icon: <Dna color="#00AB59" />,
    title: "Genomics Researchers",
    description:
      "Dig into 4M+ variants, structured by cohort and diagnostic category.",
  },
  argTypes: {
    title: { control: "text" },
    description: { control: "text" },
    icon: { control: false, description: "40px lucide icon (coloured via its own prop)." },
  },
  render: (args) => (
    <div style={{ width: 280 }}>
      <AudienceCard {...args} />
    </div>
  ),
};
export default meta;

type Story = StoryObj<typeof AudienceCard>;

export const Playground: Story = {};

export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Stage gap={24}>
      <StateCell label="Default">
        <div style={{ width: 280 }}>
          <AudienceCard
            icon={<Dna color="#00AB59" />}
            title="Genomics Researchers"
            description="Dig into 4M+ variants, structured by cohort and diagnostic category."
          />
        </div>
      </StateCell>
      <StateCell label="Hover (lift)">
        <div style={{ width: 280 }}>
          <AudienceCard
            className={pseudo.hover}
            icon={<Dna color="#00AB59" />}
            title="Genomics Researchers"
            description="Dig into 4M+ variants, structured by cohort and diagnostic category."
          />
        </div>
      </StateCell>
    </Stage>
  ),
};

export const Grid: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 240px)", gap: 16 }}>
      <AudienceCard icon={<Dna color="#00AB59" />} title="Genomics Researchers" description="Dig into 4M+ variants, structured by cohort and diagnostic category." />
      <AudienceCard icon={<Stethoscope color="#016EE9" />} title="Clinicians" description="Cross-reference real-world patient outcomes and diagnostic context." />
      <AudienceCard icon={<ChartNoAxesColumn color="#7E2DC9" />} title="Data scientists" description="Pull validated, deduplicated cohorts straight into your models." />
      <AudienceCard icon={<CodeXml color="#E97307" />} title="Tool developers" description="Build on top of structured, version-stable APIs." />
    </div>
  ),
};
