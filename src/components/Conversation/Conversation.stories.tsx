import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Conversation } from "./Conversation";
import type { ConversationComment } from "./Conversation";
import { Stage, StateCell, Section } from "../../storybook/StoryLayout";

const kimberly = { name: "Kimberly Dias", initials: "KT" };
const marie = { name: "Marie Wong-Erasmus", initials: "MW" };

const thread: ConversationComment = {
  id: "c1",
  author: kimberly,
  timestamp: "10/11/2025",
  dateTime: "2025-11-10",
  edited: true,
  body:
    "- infrastructure: Please provide details on how the local GPU cluster handles data encryption.\n- background: Clarify the exact validation datasets being added to the scope.",
  replies: [
    { id: "r1", author: marie, timestamp: "3 days ago", body: "Almost done for review. Thanks" },
    { id: "r2", author: kimberly, timestamp: "3 days ago", body: "Thanks Marie, We will review asap." },
  ],
};

const collapsedThread: ConversationComment = {
  ...thread,
  replies: [
    { id: "r0", author: kimberly, timestamp: "4 days ago", body: "Flagging this for the committee." },
    { id: "r1", author: marie, timestamp: "3 days ago", body: "Almost done for review. Thanks" },
  ],
};

const noop = () => {};

const meta: Meta<typeof Conversation> = {
  title: "Components/Conversation",
  component: Conversation,
  parameters: {
    docs: {
      description: {
        component:
          "Comment thread (Figma **Conversations**). Figma `Variant` maps to behaviour rather than a prop: **Full** = all replies; **Collapsed Reply** = `collapseAfter`; **Edit Comment** = choosing *Edit* from the ⋮ menu (or `defaultEditingId`); **Reply To Comment** = clicking *Reply* (or `defaultReplyingToId`). Avatars are a local initials circle. Body lines starting with `- ` render as bullets.",
      },
    },
  },
  args: { comment: thread, currentUser: kimberly, onReply: noop, onEdit: noop, onDelete: noop },
  argTypes: {
    comment: { control: false },
    currentUser: { control: false },
    collapseAfter: { control: { type: "number", min: 0 } },
    onReply: { action: "reply" },
    onEdit: { action: "edit" },
    onDelete: { action: "delete" },
  },
};
export default meta;

type Story = StoryObj<typeof Conversation>;

/** Fully interactive: reply, edit (your own comments) and delete update local state. */
export const Playground: Story = {
  render: function Render(args) {
    const [root, setRoot] = useState<ConversationComment>(thread);
    let n = 0;
    return (
      <div style={{ width: 400 }}>
      <Conversation
        {...args}
        comment={root}
        onReply={(_parent, text) =>
          setRoot((r) => ({
            ...r,
            replies: [
              ...(r.replies ?? []),
              { id: `new-${Date.now()}-${n++}`, author: kimberly, timestamp: "Just now", body: text },
            ],
          }))
        }
        onEdit={(c, text) =>
          setRoot((r) =>
            c.id === r.id
              ? { ...r, body: text, edited: true }
              : {
                  ...r,
                  replies: r.replies?.map((x) => (x.id === c.id ? { ...x, body: text, edited: true } : x)),
                },
          )
        }
        onDelete={(c) =>
          setRoot((r) => ({ ...r, replies: r.replies?.filter((x) => x.id !== c.id) }))
        }
      />
      </div>
    );
  },
};

export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Section title="Variant">
      <Stage gap={40}>
        <StateCell label="Full">
          <div style={{ width: 400 }}>
          <Conversation comment={thread} currentUser={kimberly} onReply={noop} onEdit={noop} />
          </div>
        </StateCell>
        <StateCell label="Edit Comment">
          <div style={{ width: 400 }}>
          <Conversation
            comment={{ ...thread, edited: false, replies: [] }}
            currentUser={kimberly}
            onEdit={noop}
            defaultEditingId="c1"
          />
          </div>
        </StateCell>
        <StateCell label="Reply To Comment">
          <div style={{ width: 400 }}>
          <Conversation
            comment={{ id: "m1", author: marie, timestamp: "3 days ago", body: "Almost done for review. Thanks" }}
            currentUser={kimberly}
            onReply={noop}
            defaultReplyingToId="m1"
          />
          </div>
        </StateCell>
        <StateCell label="Collapsed Reply">
          <div style={{ width: 400 }}>
          <Conversation
            comment={collapsedThread}
            currentUser={kimberly}
            onReply={noop}
            onEdit={noop}
            collapseAfter={1}
          />
          </div>
        </StateCell>
      </Stage>
    </Section>
  ),
};
