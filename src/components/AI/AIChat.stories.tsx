import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Database } from "lucide-react";
import { StatusBadge } from "../Badge/Badge";
import { SidneyAvatar, ZakAvatar } from "../../storybook/aiAgents";
import { ChatAgentCard, ChatAgentHeader } from "./ChatAgent";
import { ChainOfThought, ChainOfThoughtStep, ChainOfThoughtSteps } from "./ChainOfThought";
import { ChatAgentChip, ChatCallout, ChatMessage, ChatMessageMeta, ChatTaskStatus } from "./ChatMessage";
import { ChatLoader } from "./ChatLoader";
import { PromptInput, PromptInputBanner, PromptInputChip } from "./PromptInput";
import { PromptSuggestion, PromptSuggestions } from "./PromptSuggestion";

const meta: Meta = {
  title: "AI/Overview",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "The AI set assembled into the ZAK chat sidebar (Figma \"Agent in chat state\", 13:1038): `ChatMessage` turns, an introduced agent, " +
          "a `ChatCallout` answer with `ChatMessageMeta` chips, the conductor's `ChainOfThought`, a `PromptSuggestion`, and the `PromptInput`. " +
          "Send a prompt to see `ChatLoader` stand in for the reply.",
      },
    },
  },
};
export default meta;

type Story = StoryObj;

function ChatPanel() {
  const [openAgent, setOpenAgent] = useState<"zak" | "sidney" | null>("zak");
  const [asked, setAsked] = useState<string[]>([]);
  const ask = (t: string) => setAsked((a) => [...a, t]);

  return (
    <aside
      aria-label="Chat with Zak"
      style={{
        width: 388,
        maxWidth: "100%",
        boxSizing: "border-box",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        padding: "12px 16px",
        background: "var(--insight-color-white)",
        borderRight: "1px solid var(--insight-color-grey-30)",
      }}
    >
      <ChatMessage avatar={<ZakAvatar />} author="Zak">
        <p>Hi there I’m Zak,</p>
        <p>
          I'm excited to get started. I'd love to get to know you first so I can set things up around the way you work,
          build the right team for your business, and help you grow along the way.
        </p>
        <p>How can I help?</p>
      </ChatMessage>

      <ChatMessage role="user">I want to know how many AML patients are there in ZERO.</ChatMessage>

      <ChatMessage avatar={<ZakAvatar />} author="Zak">
        <p>
          Yes I can help you find out the number of AML patients in ZERO. Let me introduce you to Sidney, our cohort
          expert, who will help you with all your cohort related questions.
        </p>
        <ChatAgentCard
          compact
          header={
            <ChatAgentHeader
              size="sm"
              avatar={<SidneyAvatar size={32} />}
              name="Sidney"
              role="Cohort Expert"
              status={<StatusBadge variant="success">Done</StatusBadge>}
            />
          }
        />
      </ChatMessage>

      <ChatMessage
        avatar={<ZakAvatar />}
        author="Zak"
        footer={
          <ChatMessageMeta label="Worked for 1m 30s">
            <ChatAgentChip
              avatar={<ZakAvatar size={20} shape="circle" />}
              name="ZAK"
              expanded={openAgent === "zak"}
              onClick={() => setOpenAgent(openAgent === "zak" ? null : "zak")}
            />
            <ChatAgentChip
              avatar={<SidneyAvatar size={20} shape="circle" />}
              name="Sidney"
              expanded={openAgent === "sidney"}
              onClick={() => setOpenAgent(openAgent === "sidney" ? null : "sidney")}
            />
          </ChatMessageMeta>
        }
      >
        <p>One count over the pinned cohort snapshot.</p>
        <ChatCallout
          title="41 patients carry a recorded diagnosis of AML"
          status={<ChatTaskStatus>Unverified</ChatTaskStatus>}
        >
          This is the denominator every later count is taken against.
        </ChatCallout>
      </ChatMessage>

      {openAgent ? (
        <ChatAgentCard
          header={
            <ChatAgentHeader
              size="sm"
              avatar={openAgent === "zak" ? <ZakAvatar size={32} /> : <SidneyAvatar size={32} />}
              name={openAgent === "zak" ? "Zak" : "Sidney"}
              role={openAgent === "zak" ? "Conductor" : "Cohort Expert"}
            />
          }
        >
          <ChainOfThought summary="Checked the answer before it was written down" status="done">
            <ChainOfThoughtSteps>
              <ChainOfThoughtStep>Sidney returned 6 patients</ChainOfThoughtStep>
              <ChainOfThoughtStep>Zak checked the answer before it was written down</ChainOfThoughtStep>
              <ChainOfThoughtStep>Critic: does the small-n warning (PKB-0012) survive into the output?</ChainOfThoughtStep>
            </ChainOfThoughtSteps>
          </ChainOfThought>
        </ChatAgentCard>
      ) : null}

      {asked.map((q, i) => (
        <div key={i} style={{ display: "contents" }}>
          <ChatMessage role="user">{q}</ChatMessage>
          <ChatMessage avatar={<ZakAvatar />} author="Zak">
            <ChatLoader variant="spinner" label="Planning the turn" />
          </ChatMessage>
        </div>
      ))}

      {asked.length === 0 ? (
        <PromptSuggestions label="Suggested next">
          <PromptSuggestion onClick={() => ask("Of those, how many have a variant in GATA2? RUNX1? ETV6? SAMD9? SAMD9L?")}>
            Of those, how many have a variant in GATA2? RUNX1? ETV6? SAMD9? SAMD9L?
          </PromptSuggestion>
        </PromptSuggestions>
      ) : null}

      <div style={{ marginTop: "auto" }}>
        <PromptInput
          placeholder="Chat with ZAK"
          onSubmit={ask}
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
              Agents
            </PromptInputBanner>
          }
          actions={<PromptInputChip icon={<Database />}>ZERO cohort</PromptInputChip>}
        />
      </div>
    </aside>
  );
}

export const ChatSidebar: Story = {
  render: () => <ChatPanel />,
};
