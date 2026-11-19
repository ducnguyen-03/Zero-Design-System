import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Popover } from "./Popover";
import type { PopoverPlacement, PopoverProps } from "./Popover";
import { Button } from "../Button/Button";
import { StateCell } from "../../storybook/StoryLayout";

const BODY = "Configure default access roles and notification preferences for your Insight workspace.";

const meta: Meta<typeof Popover> = {
  title: "Components/Popover",
  component: Popover,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Anchored popup panel (white, 1px grey-40 border, radius 8, 290px, arrow). Opens on trigger click; " +
          "closes on Escape, outside click or the × button and returns focus to the trigger. The panel is a " +
          "`role=\"dialog\"` labelled by its title; the trigger gets `aria-expanded` / `aria-controls`. " +
          "`placement` is where the panel sits; Figma `Direction` names the arrow edge, so " +
          "placement bottom/top/right/left = Direction Top/Bellow/Left/Right.",
      },
    },
  },
  args: { title: "Team Workspace", placement: "bottom", align: "start", showClose: true },
  argTypes: {
    placement: { control: "inline-radio", options: ["top", "bottom", "left", "right"] },
    align: { control: "inline-radio", options: ["start", "center", "end"] },
    title: { control: "text" },
    showClose: { control: "boolean" },
    trigger: { control: false },
    footer: { control: false },
    children: { control: false },
    open: { control: false },
  },
};
export default meta;

type Story = StoryObj<typeof Popover>;

function Demo(props: Partial<PopoverProps>) {
  const [open, setOpen] = useState(props.defaultOpen ?? false);
  return (
    <Popover
      title="Team Workspace"
      {...props}
      open={open}
      onOpenChange={setOpen}
      trigger={<Button variant="outline" size="sm">Workspace settings</Button>}
      footer={
        <>
          <Button variant="subtle" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="bold" size="sm" onClick={() => setOpen(false)}>Save Change</Button>
        </>
      }
    >
      <p>{BODY}</p>
    </Popover>
  );
}

/** Click the trigger. Escape / outside click / × closes. */
export const Playground: Story = {
  render: (args) => (
    <div style={{ padding: 220 }}>
      <Demo placement={args.placement} align={args.align} title={args.title} showClose={args.showClose} />
    </div>
  ),
};

const CELLS: Array<{ placement: PopoverPlacement; figma: string }> = [
  { placement: "bottom", figma: "Direction=Top" },
  { placement: "left", figma: "Direction=Right" },
  { placement: "top", figma: "Direction=Bellow" },
  { placement: "right", figma: "Direction=Left" },
];

/** All four Figma directions, open. */
export const Variants: Story = {
  parameters: { controls: { disable: true }, layout: "padded" },
  render: () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, max-content)",
        columnGap: 420,
        rowGap: 260,
        padding: "220px 330px",
      }}
    >
      {CELLS.map(({ placement, figma }) => (
        <StateCell key={placement} label={`placement=${placement} (${figma})`} align="center">
          <Demo placement={placement} align={placement === "top" ? "end" : placement === "left" ? "end" : placement === "right" ? "center" : "start"} defaultOpen />
        </StateCell>
      ))}
    </div>
  ),
};
