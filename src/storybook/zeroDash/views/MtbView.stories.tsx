import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { MtbView } from "./MtbView";

const meta: Meta<typeof MtbView> = {
  title: "ZeroDash/Clinical cases",
  component: MtbView,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "ZeroDash › Clinical › Cases (the MTB slides dashboard). Sample-level rows; a patient's liquid-biopsy samples " +
          "cluster into one expandable case row. Rows call `onOpenPatient(\"solid\" | \"lb\")` (the Unified Patient View). " +
          "Page content only — the app shell provides navigation, toolbar and row count.",
      },
    },
  },
  args: { onOpenPatient: fn() },
  render: (args) => (
    <div style={{ background: "var(--insight-color-white)", minHeight: "100vh", paddingTop: 16 }}>
      <MtbView {...args} />
    </div>
  ),
};
export default meta;
type Story = StoryObj<typeof MtbView>;

export const Default: Story = {};

/** Liquid-biopsy case expanded to show its three samples. */
export const LiquidBiopsiesExpanded: Story = {
  name: "Liquid biopsies expanded",
  args: { defaultLbOpen: true },
};

/** The chevron toggles the cluster without opening the patient; clicking a row opens it. */
export const ToggleAndOpen: Story = {
  name: "Toggle and open",
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Expand liquid biopsies" }));
    await expect(canvas.getByText("06-0114_486698_LB")).toBeInTheDocument();
    await expect(args.onOpenPatient).not.toHaveBeenCalled();
    await userEvent.click(canvas.getByText("06-0114_414818_T_W"));
    await expect(args.onOpenPatient).toHaveBeenCalledWith("solid");
    await userEvent.click(canvas.getByText("06-0114_486698_LB"));
    await expect(args.onOpenPatient).toHaveBeenCalledWith("lb");
  },
};
