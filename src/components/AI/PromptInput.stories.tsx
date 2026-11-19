import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { Bot, ChevronRight, Database } from "lucide-react";
import { Section, Stage } from "../../storybook/StoryLayout";
import { SidneyAvatar, ZakAvatar } from "../../storybook/aiAgents";
import { ChatAttachment, ChatAttachmentList } from "./ChatAttachment";
import { PromptInput, PromptInputBanner, PromptInputChip } from "./PromptInput";

const meta: Meta<typeof PromptInput> = {
  title: "AI/Prompt Input",
  component: PromptInput,
  parameters: {
    docs: {
      description: {
        component:
          "The ZAK chat box. A white composer (18px radius, grey-50 border, 120px min height) with an optional grey `banner` tab tucked behind its top edge, " +
          "`attachments` above an auto-growing text box (14 / 1.4, scrolls past 140px) and a footer: round + (`onAdd`), `actions` such as the " +
          "`PromptInputChip` data source, and send. **Enter** sends, **Shift+Enter** adds a line. Send stays greyed until there is text; while `busy` it becomes Stop. " +
          "Round controls are the DS `IconButton` on a grey-30 fill.",
      },
    },
  },
  args: {
    placeholder: "Ask about a cohort, mutation, or build a chart…",
    disabled: false,
    busy: false,
    onSubmit: fn(),
    onAdd: fn(),
    onStop: fn(),
  },
  render: (args) => (
    <div style={{ width: 668, maxWidth: "100%" }}>
      <PromptInput
        {...args}
        actions={<PromptInputChip icon={<Database />}>ZERO cohort</PromptInputChip>}
      />
    </div>
  ),
};
export default meta;

type Story = StoryObj<typeof PromptInput>;

export const Playground: Story = {
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    const send = c.getByRole("button", { name: "Send message" });
    await expect(send).toBeDisabled();
    const box = c.getByRole("textbox");
    await userEvent.type(box, "How many AML patients are in ZERO?");
    await expect(send).toBeEnabled();
    await userEvent.keyboard("{Enter}");
    await expect(args.onSubmit).toHaveBeenCalledWith("How many AML patients are in ZERO?");
    await expect(box).toHaveValue("");
  },
};

/** Figma "Chat states": no team yet, agents running, the expanded tools tab, and the in-chat composer. */
export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Stage column gap={32} style={{ width: 668, maxWidth: "100%" }}>
      <Section title="No team yet">
        <PromptInput
          onAdd={() => {}}
          banner={<PromptInputBanner icon={<Bot />}>No team yet — tell Zak what you’re working on</PromptInputBanner>}
          actions={<PromptInputChip icon={<Database />}>ZERO cohort</PromptInputChip>}
        />
      </Section>
      <Section title="Agents running">
        <PromptInput
          onAdd={() => {}}
          banner={
            <PromptInputBanner
              icon={
                <>
                  <ZakAvatar size={20} />
                  <SidneyAvatar size={20} />
                </>
              }
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                2 agents running <ChevronRight size={16} aria-hidden="true" />
              </span>
            </PromptInputBanner>
          }
          actions={<PromptInputChip icon={<Database />}>ZERO cohort</PromptInputChip>}
        />
      </Section>
      <Section title="With attachments">
        <PromptInput
          onAdd={() => {}}
          defaultValue="Compare survival between these two exports"
          attachments={
            <ChatAttachmentList>
              <ChatAttachment name="AML-cohort-export.csv" meta="CSV · 24 KB" onRemove={() => {}} />
              <ChatAttachment name="ZC-0418.bam" status="uploading" progress={64} onRemove={() => {}} />
            </ChatAttachmentList>
          }
          actions={<PromptInputChip icon={<Database />}>ZERO cohort</PromptInputChip>}
        />
      </Section>
      <Section title="Busy (agent answering)">
        <PromptInput
          busy
          onStop={() => {}}
          onAdd={() => {}}
          placeholder="Chat with ZAK"
          actions={<PromptInputChip icon={<Database />}>ZERO cohort</PromptInputChip>}
        />
      </Section>
      <Section title="Disabled">
        <PromptInput disabled onAdd={() => {}} placeholder="Chat with ZAK" />
      </Section>
    </Stage>
  ),
};

function Controlled() {
  const [sent, setSent] = useState<string[]>([]);
  return (
    <div style={{ width: 668, maxWidth: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
      <PromptInput
        placeholder="Chat with ZAK"
        onSubmit={(t) => setSent([...sent, t])}
        onAdd={() => {}}
        actions={<PromptInputChip icon={<Database />}>ZERO cohort</PromptInputChip>}
      />
      <ol style={{ margin: 0, font: "14px/1.4 var(--insight-font-family-sans)", color: "var(--insight-color-grey-100)" }}>
        {sent.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ol>
    </div>
  );
}

/** Type and press Enter — sent prompts are listed below. Shift+Enter adds a line. */
export const TryIt: Story = {
  parameters: { controls: { disable: true } },
  render: () => <Controlled />,
};
