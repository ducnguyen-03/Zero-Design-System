import type { Meta, StoryObj } from "@storybook/react-vite";
import { Stage, StateCell } from "../../storybook/StoryLayout";
import { ZakAvatar } from "../../storybook/aiAgents";
import { ChatMessage } from "./ChatMessage";
import { ChatLoader } from "./ChatLoader";

const meta: Meta<typeof ChatLoader> = {
  title: "AI/Chat Loader",
  component: ChatLoader,
  parameters: {
    docs: {
      description: {
        component:
          "Live status while an agent works — a polite `role=\"status\"` region. **dots** before any text arrives (label announced only); " +
          "**spinner** = Lucide loader + what the agent is doing, the ZAK run summary; **text** = the label with a light sweep, for inline status. " +
          "Under `prefers-reduced-motion` the dots and sweep stop and the spinner slows.",
      },
    },
  },
  args: { variant: "spinner", label: "Searching the data" },
  argTypes: { variant: { control: "inline-radio", options: ["dots", "spinner", "text"] } },
};
export default meta;

type Story = StoryObj<typeof ChatLoader>;

export const Playground: Story = {
  args: {
    variant: "dots"
  }
};

export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Stage gap={40}>
      <StateCell label="Dots">
        <ChatLoader variant="dots" label="Zak is thinking" />
      </StateCell>
      <StateCell label="Spinner">
        <ChatLoader variant="spinner" label="Searching the data · Read 2 files" />
      </StateCell>
      <StateCell label="Text">
        <ChatLoader variant="text" label="Checking the answer before it is written down" />
      </StateCell>
    </Stage>
  ),
};

/** Where it sits: in place of the reply under the agent's avatar. */
export const InMessage: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ width: 388 }}>
      <ChatMessage avatar={<ZakAvatar />} author="Zak">
        <ChatLoader variant="dots" label="Zak is thinking" />
      </ChatMessage>
    </div>
  ),
};
