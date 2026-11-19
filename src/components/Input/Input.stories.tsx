import type { Meta, StoryObj } from "@storybook/react-vite";
import { Search } from "lucide-react";
import { Input } from "./Input";
import type { InputProps } from "./Input";
import { Stage, StateCell, Section, Forced } from "../../storybook/StoryLayout";

const meta: Meta<typeof Input> = {
  title: "Components/Input",
  component: Input,
  parameters: {
    docs: {
      description: {
        component:
          "Outlined text field (Figma `input` 3412:10815). Label → helper → field → error message. S = 40px, M = 48px; " +
          "focus draws a 2px green-160 border, error a red-150 border with red-300 message. `type=\"url\"` renders the " +
          "Link Input (lead link icon, 8px lead padding). `status` adds the trailing check / alert indicator. " +
          "Size L (area) is the `Textarea` component.",
      },
    },
  },
  args: {
    label: "Label",
    placeholder: "Text goes here",
    helpText: "This is helper text.",
    size: "sm",
    status: false,
  },
  argTypes: {
    label: { control: "text" },
    placeholder: { control: "text" },
    helpText: { control: "text", description: "Helper text between label and field." },
    errorText: { control: "text", description: "Error message; flips the border to red." },
    size: { control: "inline-radio", options: ["sm", "md"] },
    type: { control: "inline-radio", options: ["text", "url", "email", "password"] },
    status: { control: "boolean", description: "Trailing success / error indicator." },
    required: { control: "boolean" },
    disabled: { control: "boolean" },
    startIcon: { control: false, description: "Lead adornment." },
    endIcon: { control: false, description: "Trail adornment." },
  },
  render: (args) => (
    <div style={{ width: 320 }}>
      <Input {...args} />
    </div>
  ),
};
export default meta;

type Story = StoryObj<typeof Input>;

export const Playground: Story = {};

const W = 240;
const cell = (p: InputProps) => (
  <div style={{ width: W }}>
    <Input label="Label" {...p} />
  </div>
);

function Grid({ link }: { link?: boolean }) {
  const type = link ? "url" : "text";
  const value = link ? "bit.ly/insight" : "Text goes here";
  return (
    <>
      {(["sm", "md"] as const).map((size) => (
        <Section
          key={size}
          title={size === "sm" ? "Size S (40px)" : "Size M (48px)"}
        >
          <Stage gap={32}>
            <StateCell label="Default">
              {cell({ size, type, defaultValue: value, helpText: "This is helper text." })}
            </StateCell>
            <StateCell label="Default · no helper">
              {cell({ size, type, defaultValue: value })}
            </StateCell>
            <StateCell label="Active (focus)">
              <Forced state="focusWithin">
                {cell({ size, type, defaultValue: value, helpText: "This is helper text." })}
              </Forced>
            </StateCell>
            <StateCell label="Error + status">
              {cell({
                size,
                type,
                defaultValue: value,
                helpText: "This is helper text.",
                errorText: "Error message",
                status: true,
              })}
            </StateCell>
            <StateCell label="Error · no helper">
              {cell({ size, type, defaultValue: value, errorText: "Error message", status: true })}
            </StateCell>
            <StateCell label="Status (valid)">
              {cell({ size, type, defaultValue: value, helpText: "This is helper text.", status: true })}
            </StateCell>
            <StateCell label="Placeholder">
              {cell({ size, type, placeholder: link ? "Paste a link" : "Text goes here" })}
            </StateCell>
            <StateCell label="Disabled">
              {cell({ size, type, defaultValue: value, disabled: true })}
            </StateCell>
          </Stage>
        </Section>
      ))}
    </>
  );
}

export const TextInput: Story = {
  name: "Text Input · all states",
  parameters: { controls: { disable: true } },
  render: () => <Grid />,
};

export const LinkInput: Story = {
  name: "Link Input · all states",
  parameters: { controls: { disable: true } },
  render: () => <Grid link />,
};

export const WithAdornment: Story = {
  args: { startIcon: <Search />, placeholder: "Patient ID, study, file…", label: "Search records" },
};

export const Error: Story = {
  args: {
    label: "Email",
    required: true,
    defaultValue: "researcher@",
    helpText: undefined,
    errorText: "Enter a valid institutional email.",
    status: true,
  },
};
