import type { Meta, StoryObj } from "@storybook/react-vite";
import { ClassSelect } from "./ClassSelect";
import type { ClassSelectOption } from "./ClassSelect";
import { Stage, StateCell, Forced } from "../../storybook/StoryLayout";

const CLASSES: ClassSelectOption[] = [
  { label: "C1 Benign", value: "C1", tone: "neutral" },
  { label: "C2 Likely Benevolent", value: "C2", tone: "neutral" },
  { label: "C3.8 VOUS", value: "C3.8", tone: "success" },
  { label: "C4 Likely Pathogenic", value: "C4", tone: "error" },
  { label: "C5 Pathogenic", value: "C5", tone: "error" },
];

const meta: Meta<typeof ClassSelect> = {
  title: "Components/ClassSelect",
  component: ClassSelect,
  parameters: {
    docs: {
      description: {
        component:
          "Compact clinical-class curation dropdown (Figma `dropdown / class curation` 3412:10709). 24px select-only " +
          "combobox sharing the Select keyboard model. `variant=\"filled\"` tints the pill by the selected class's " +
          "`tone` (neutral grey-30, success green-10, error red-10 with red-300 text); `variant=\"text\"` is text only.",
      },
    },
  },
  args: { options: CLASSES, variant: "filled", placeholder: "Assign class" },
  argTypes: {
    variant: { control: "inline-radio", options: ["filled", "text"] },
    placeholder: { control: "text" },
    disabled: { control: "boolean" },
    options: { control: false },
  },
  render: (args) => (
    <div style={{ width: 208, minHeight: 260 }}>
      <ClassSelect {...args} />
    </div>
  ),
};
export default meta;

type Story = StoryObj<typeof ClassSelect>;

export const Playground: Story = {};

export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Stage column gap={20} style={{ width: 208 }}>
      <StateCell label="Type=Text Only">
        <ClassSelect variant="text" options={CLASSES} placeholder="Text only" />
      </StateCell>
      <StateCell label="Filled · Select Class">
        <ClassSelect options={CLASSES} />
      </StateCell>
      <StateCell label="Filled · C2 (neutral)">
        <ClassSelect options={CLASSES} defaultValue="C2" />
      </StateCell>
      <StateCell label="Filled · C3.8 (success)">
        <ClassSelect options={CLASSES} defaultValue="C3.8" />
      </StateCell>
      <StateCell label="Filled · C5 (error)">
        <ClassSelect options={CLASSES} defaultValue="C5" />
      </StateCell>
      <StateCell label="Focus">
        <Forced state="focus">
          <ClassSelect options={CLASSES} defaultValue="C2" />
        </Forced>
      </StateCell>
      <StateCell label="Disabled">
        <ClassSelect options={CLASSES} defaultValue="C3.8" disabled />
      </StateCell>
    </Stage>
  ),
};
