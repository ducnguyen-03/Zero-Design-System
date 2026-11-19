import type { Meta, StoryObj } from "@storybook/react-vite";
import { Textarea } from "./Textarea";
import type { TextareaProps } from "./Textarea";
import { Stage, StateCell, Forced } from "../../storybook/StoryLayout";

const meta: Meta<typeof Textarea> = {
  title: "Components/Textarea",
  component: Textarea,
  parameters: {
    docs: {
      description: {
        component:
          "Multi-line field — the Figma `input` set at Size L (area). Label → helper → field → error message, " +
          "grey-75 border flipping to a 2px green-160 border on focus, red-150 on error. `status` adds the top-right " +
          "check / alert indicator; `characterLimit` shows the remaining count (e.g. \"-25\") right-aligned under the field.",
      },
    },
  },
  args: {
    label: "Label",
    placeholder: "Text goes here",
    helpText: "This is helper text.",
    status: false,
  },
  argTypes: {
    label: { control: "text" },
    placeholder: { control: "text" },
    helpText: { control: "text" },
    errorText: { control: "text" },
    status: { control: "boolean" },
    characterLimit: { control: "number" },
    required: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  render: (args) => (
    <div style={{ width: 400 }}>
      <Textarea {...args} />
    </div>
  ),
};
export default meta;

type Story = StoryObj<typeof Textarea>;

export const Playground: Story = {};

const cell = (p: TextareaProps) => (
  <div style={{ width: 400 }}>
    <Textarea label="Label" defaultValue="Text goes here" {...p} />
  </div>
);

const OVER = "Text goes here — this note runs past the soft character limit by a bit.";

export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Stage gap={32}>
      <StateCell label="Default">{cell({ helpText: "This is helper text." })}</StateCell>
      <StateCell label="Default · no helper">{cell({})}</StateCell>
      <StateCell label="Active (focus)">
        <Forced state="focusWithin">{cell({ helpText: "This is helper text." })}</Forced>
      </StateCell>
      <StateCell label="Error + status + count">
        {cell({
          helpText: "This is helper text.",
          errorText: "Error message",
          status: true,
          characterLimit: OVER.length - 25,
          defaultValue: OVER,
        })}
      </StateCell>
      <StateCell label="Error · no helper">
        {cell({
          errorText: "Error message",
          status: true,
          characterLimit: OVER.length - 25,
          defaultValue: OVER,
        })}
      </StateCell>
      <StateCell label="Status (valid)">
        {cell({ helpText: "This is helper text.", status: true })}
      </StateCell>
      <StateCell label="Status · no helper">{cell({ status: true })}</StateCell>
      <StateCell label="Disabled">{cell({ disabled: true })}</StateCell>
    </Stage>
  ),
};
