import type { Meta, StoryObj } from "@storybook/react-vite";
import { Snackbar } from "./Snackbar";
import { Stage, StateCell } from "../../storybook/StoryLayout";

const meta: Meta<typeof Snackbar> = {
  title: "Components/Snackbar",
  component: Snackbar,
  parameters: {
    docs: {
      description: {
        component:
          "Dark (off-black-200) feedback bar with a round status icon and bold white text, Elevation/Snackbar shadow. " +
          "`status` accepts the Figma names `success | error | warning` and the legacy aliases `ok | err | warn`. " +
          "Error renders `role=\"alert\"`, others `role=\"status\"`.",
      },
    },
  },
  args: { status: "success", children: "Success / ready" },
  argTypes: {
    status: {
      control: "inline-radio",
      options: ["success", "error", "warning", "ok", "err", "warn"],
      description: "Status icon colour. Legacy aliases map to the Figma names.",
    },
    children: { control: "text", description: "Message." },
  },
};
export default meta;

type Story = StoryObj<typeof Snackbar>;

export const Playground: Story = {};

/** Figma `Status` axis. */
export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Stage column gap={24}>
      <StateCell label="Status=Success">
        <Snackbar status="success">Success / ready</Snackbar>
      </StateCell>
      <StateCell label="Status=Error">
        <Snackbar status="error">Error ... add explanation / call to action</Snackbar>
      </StateCell>
      <StateCell label="Status=Warning">
        <Snackbar status="warning">Warning message</Snackbar>
      </StateCell>
      <StateCell label={'Legacy alias: status="ok"'}>
        <Snackbar status="ok">Data access request submitted.</Snackbar>
      </StateCell>
    </Stage>
  ),
};
