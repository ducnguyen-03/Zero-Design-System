import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { ChartColumn, Dna, Users } from "lucide-react";
import { Section, Stage, pseudo } from "../../storybook/StoryLayout";
import { PromptSuggestion, PromptSuggestions } from "./PromptSuggestion";

const meta: Meta<typeof PromptSuggestion> = {
  title: "AI/Prompt Suggestion",
  component: PromptSuggestion,
  parameters: {
    docs: {
      description: {
        component:
          "A prompt the user can send in one click. **card** — the ZAK \"Suggested next\" row: full width, 1px support-grey border, 8px radius, 13 / 19.5 text. " +
          "**pill** — grey-30 chip for starting an empty chat. Group them under a label with `PromptSuggestions`. Each is a real `<button>`.",
      },
    },
  },
  args: {
    appearance: "card",
    children: "Of those, how many have a variant in GATA2? RUNX1? ETV6? SAMD9? SAMD9L?",
    onClick: fn(),
  },
  argTypes: { appearance: { control: "inline-radio", options: ["card", "pill"] }, icon: { control: false } },
  render: (args) => (
    <div style={{ width: 356 }}>
      <PromptSuggestions label="Suggested next" appearance={args.appearance}>
        <PromptSuggestion {...args} />
      </PromptSuggestions>
    </div>
  ),
};
export default meta;

type Story = StoryObj<typeof PromptSuggestion>;

export const Playground: Story = {
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("button", { name: /GATA2/ }));
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div>
      <Section title="Card · Suggested next" description="After an answer — the obvious follow-ups.">
        <div style={{ width: 356 }}>
          <PromptSuggestions label="Suggested next">
            <PromptSuggestion>Of those, how many have a variant in GATA2? RUNX1? ETV6? SAMD9? SAMD9L?</PromptSuggestion>
            <PromptSuggestion>Split the 41 by age at diagnosis</PromptSuggestion>
          </PromptSuggestions>
        </div>
      </Section>
      <Section title="Pill · empty chat" description="Before the first message — what the team can do.">
        <div style={{ width: 640 }}>
          <PromptSuggestions label="Try asking" appearance="pill">
            <PromptSuggestion appearance="pill" icon={<Users />}>
              How many AML patients are in ZERO?
            </PromptSuggestion>
            <PromptSuggestion appearance="pill" icon={<Dna />}>
              Which variants recur in GATA2?
            </PromptSuggestion>
            <PromptSuggestion appearance="pill" icon={<ChartColumn />}>
              Chart survival by risk group
            </PromptSuggestion>
          </PromptSuggestions>
        </div>
      </Section>
      <Section title="States">
        <Stage gap={16}>
          <div style={{ width: 240 }}>
            <PromptSuggestion>Default</PromptSuggestion>
          </div>
          <div style={{ width: 240 }}>
            <PromptSuggestion className={pseudo.hover}>Hover</PromptSuggestion>
          </div>
          <div style={{ width: 240 }}>
            <PromptSuggestion className={pseudo.focus}>Focus</PromptSuggestion>
          </div>
          <PromptSuggestion appearance="pill">Pill</PromptSuggestion>
          <PromptSuggestion appearance="pill" className={pseudo.hover}>
            Pill hover
          </PromptSuggestion>
        </Stage>
      </Section>
    </div>
  ),
};
