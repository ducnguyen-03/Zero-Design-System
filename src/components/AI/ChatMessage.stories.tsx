import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { Copy, Pencil, Reply, RotateCcw, ThumbsUp } from "lucide-react";
import { StatusBadge } from "../Badge/Badge";
import { Section, Stage } from "../../storybook/StoryLayout";
import { PedTrialAvatar, SidneyAvatar, ZakAvatar } from "../../storybook/aiAgents";
import { ChatAgentCard, ChatAgentHeader } from "./ChatAgent";
import {
  ChatAgentChip,
  ChatCallout,
  ChatHandoff,
  ChatMessage,
  ChatMessageAction,
  ChatMessageActions,
  ChatMessageMeta,
  ChatReplyQuote,
  ChatTaskStatus,
} from "./ChatMessage";
import { PromptInput } from "./PromptInput";

const meta: Meta<typeof ChatMessage> = {
  title: "AI/Chat Message",
  component: ChatMessage,
  parameters: {
    docs: {
      description: {
        component:
          "One turn of the ZAK conversation. **user** — grey-30 bubble on the right, 14px corners with a 4px tail, max 388px. " +
          "**assistant** — open 16 / 1.5 text under the agent's 28px `AgentAvatar`, with optional `footer`. " +
          "Building blocks for replies: `ChatCallout` (headline answer + `ChatTaskStatus` + context), `ChatMessageMeta` (\"Worked for 1m 30s\" + `ChatAgentChip`s), " +
          "and `ChatAgentCard` / `ChatAgentHeader` (an agent introduced in the chat). " +
          "**Replies** — `replyTo` quotes the message being answered (user → agent, agent → agent) and jumps back to it; `showAuthor` names the agent when several speak; " +
          "`ChatMessageActions` (Reply, Copy, Retry, Edit, Helpful) appear on hover and focus; `ChatReplyQuote` with `onDismiss` is the composer's \"Replying to…\" strip. The speaker is announced to screen readers.",
      },
    },
  },
  args: { role: "user", children: "I want to know how many AML patients are there in ZERO." },
  argTypes: {
    role: { control: "inline-radio", options: ["user", "assistant"] },
    avatar: { control: false },
    footer: { control: false },
  },
  render: (args) => (
    <div style={{ width: 388 }}>
      <ChatMessage {...args} avatar={args.role === "assistant" ? <ZakAvatar /> : undefined} author={args.role === "assistant" ? "Zak" : undefined} />
    </div>
  ),
};
export default meta;

type Story = StoryObj<typeof ChatMessage>;

export const Playground: Story = {};

function Meta1() {
  const [open, setOpen] = useState<"zak" | "sidney" | null>("zak");
  return (
    <ChatMessageMeta label="Worked for 1m 30s">
      <ChatAgentChip
        avatar={<ZakAvatar size={20} shape="circle" />}
        name="ZAK"
        expanded={open === "zak"}
        onClick={() => setOpen(open === "zak" ? null : "zak")}
      />
      <ChatAgentChip
        avatar={<SidneyAvatar size={20} shape="circle" />}
        name="Sidney"
        expanded={open === "sidney"}
        onClick={() => setOpen(open === "sidney" ? null : "sidney")}
      />
    </ChatMessageMeta>
  );
}

/** Both roles and every reply block, as in Figma "Agent in chat state". */
export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Stage column gap={32} style={{ width: 388 }}>
      <Section title="User">
        <ChatMessage role="user">I want to know how many AML patients are there in ZERO.</ChatMessage>
      </Section>
      <Section title="Assistant · plain text">
        <ChatMessage avatar={<ZakAvatar />} author="Zak">
          <p>Hi there I’m Zak,</p>
          <p>
            I'm excited to get started. I'd love to get to know you first so I can set things up around the way you
            work, build the right team for your business, and help you grow along the way.
          </p>
          <p>How can I help?</p>
        </ChatMessage>
      </Section>
      <Section title="Assistant · introduces an agent">
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
      </Section>
      <Section title="Assistant · hands work to an agent">
        <ChatMessage avatar={<ZakAvatar size={20} />} author="Zak" authorRole="turn 1 · Case intake" showAuthor>
          <ChatHandoff>Zak opened the inquiry and called in PedTrial</ChatHandoff>
          <ChatAgentCard
            compact
            header={
              <ChatAgentHeader
                size="sm"
                avatar={<PedTrialAvatar size={32} />}
                name="PedTrial"
                role="Trial-matching Expert"
                status={<StatusBadge variant="warning">Needs input</StatusBadge>}
              />
            }
          />
          <p>How old is she (in years)? That is the one fact still missing from the case card.</p>
        </ChatMessage>
      </Section>
      <Section title="Assistant · answer + meta">
        <ChatMessage avatar={<ZakAvatar />} author="Zak" footer={<Meta1 />}>
          <p>One count over the pinned cohort snapshot.</p>
          <ChatCallout
            title="41 patients carry a recorded diagnosis of AML"
            status={<ChatTaskStatus>Unverified</ChatTaskStatus>}
          >
            This is the denominator every later count is taken against.
          </ChatCallout>
        </ChatMessage>
      </Section>
      <Section title="Callout · verified">
        <ChatCallout
          title="41 patients carry a recorded diagnosis of AML"
          status={<ChatTaskStatus tone="success">Verified</ChatTaskStatus>}
        >
          This is the denominator every later count is taken against.
        </ChatCallout>
      </Section>
    </Stage>
  ),
};

/* ── Replies ── */

interface ThreadMsg {
  id: string;
  role: "user" | "assistant";
  agent?: "zak" | "sidney";
  text: string;
  replyTo?: string;
}

const AGENT_META = {
  zak: { name: "Zak", role: "Conductor", Avatar: ZakAvatar },
  sidney: { name: "Sidney", role: "Cohort Expert", Avatar: SidneyAvatar },
} as const;

const SEED: ThreadMsg[] = [
  { id: "m1", role: "user", text: "How many AML patients are there in ZERO?" },
  {
    id: "m2",
    role: "assistant",
    agent: "zak",
    text: "Sidney, can you count AML patients in the pinned ZERO snapshot, by recorded diagnosis?",
  },
  {
    id: "m3",
    role: "assistant",
    agent: "sidney",
    replyTo: "m2",
    text: "41 patients carry a recorded diagnosis of AML. 6 of them were diagnosed under WHO 2016 terms, so their entity may change after mapping.",
  },
  {
    id: "m4",
    role: "user",
    replyTo: "m3",
    text: "Can you show those 6 separately?",
  },
  {
    id: "m5",
    role: "assistant",
    agent: "sidney",
    replyTo: "m4",
    text: "Done — the 6 are pinned as their own patient set. All six map to “AML, myelodysplasia-related” in WHO-HAEM5.",
  },
];

function authorOf(m: ThreadMsg) {
  return m.role === "user" ? "You" : AGENT_META[m.agent ?? "zak"].name;
}

function ReplyThread() {
  const [msgs, setMsgs] = useState<ThreadMsg[]>(SEED);
  const [replying, setReplying] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const byId = (id?: string) => msgs.find((m) => m.id === id);

  const jump = (id: string) => {
    document.getElementById(`msg-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    setFlash(null);
    requestAnimationFrame(() => setFlash(id));
  };
  const quoteOf = (m: ThreadMsg, withJump = true) => {
    const A = m.agent ? AGENT_META[m.agent].Avatar : null;
    return {
      author: authorOf(m),
      avatar: A ? <A size={20} shape="circle" /> : undefined,
      excerpt: m.text,
      onClick: withJump ? () => jump(m.id) : undefined,
    };
  };
  const replyingTo = byId(replying ?? undefined);

  return (
    <div style={{ width: 420, display: "flex", flexDirection: "column", gap: 20 }}>
      {msgs.map((m) => {
        const parent = byId(m.replyTo);
        const actions = (
          <ChatMessageActions>
            <ChatMessageAction icon={<Reply />} label="Reply" onClick={() => setReplying(m.id)} />
            <ChatMessageAction icon={<Copy />} label="Copy" onClick={() => navigator.clipboard?.writeText(m.text)} />
            {m.role === "assistant" ? (
              <>
                <ChatMessageAction
                  icon={<ThumbsUp />}
                  label="Helpful"
                  pressed={liked[m.id] ?? false}
                  onClick={() => setLiked((l) => ({ ...l, [m.id]: !l[m.id] }))}
                />
                <ChatMessageAction icon={<RotateCcw />} label="Retry" />
              </>
            ) : (
              <ChatMessageAction icon={<Pencil />} label="Edit" />
            )}
          </ChatMessageActions>
        );
        if (m.role === "user") {
          return (
            <ChatMessage
              key={m.id}
              id={`msg-${m.id}`}
              role="user"
              replyTo={parent ? quoteOf(parent) : undefined}
              actions={actions}
              highlighted={flash === m.id}
            >
              {m.text}
            </ChatMessage>
          );
        }
        const a = AGENT_META[m.agent ?? "zak"];
        return (
          <ChatMessage
            key={m.id}
            id={`msg-${m.id}`}
            avatar={<a.Avatar />}
            author={a.name}
            authorRole={a.role}
            showAuthor
            replyTo={parent ? quoteOf(parent) : undefined}
            actions={actions}
            highlighted={flash === m.id}
          >
            <p>{m.text}</p>
          </ChatMessage>
        );
      })}
      <PromptInput
        placeholder={replyingTo ? `Reply to ${authorOf(replyingTo)}` : "Chat with ZAK"}
        banner={
          replyingTo ? <ChatReplyQuote {...quoteOf(replyingTo, false)} onDismiss={() => setReplying(null)} /> : undefined
        }
        onSubmit={(text) => {
          setMsgs((all) => [...all, { id: `m${all.length + 1}`, role: "user", text, replyTo: replying ?? undefined }]);
          setReplying(null);
        }}
      />
    </div>
  );
}

/**
 * Replies: a user can answer one specific agent message, and agents answer each other (Sidney → Zak).
 * The quote names who is being answered; click it to jump back. Hover a message for Reply / Copy / Retry;
 * "Reply" puts a "Replying to …" strip on the composer.
 */
export const Replies: Story = {
  parameters: { controls: { disable: true } },
  render: () => <ReplyThread />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getAllByRole("button", { name: "Reply" })[2]);
    await expect(c.getByRole("button", { name: "Cancel reply" })).toBeInTheDocument();
    await userEvent.click(c.getByRole("button", { name: "Cancel reply" }));
    await expect(c.queryByRole("button", { name: "Cancel reply" })).toBeNull();
  },
};
