import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { HtsDashboardView } from "./HtsDashboardView";

const meta: Meta<typeof HtsDashboardView> = {
  title: "ZeroDash/HTS Dashboard",
  component: HtsDashboardView,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "High-throughput drug screening tracker. Screens are grouped by **patient → event**; each event shows its " +
          "screen table (QC, curation, report and HTS complete statuses) with completed screens and events folded " +
          "into collapsible bars. Search and the Filter panel narrow the list; status badges, notes and the row menu " +
          "open the update dialog.",
      },
      story: { inline: false, iframeHeight: 900 },
    },
  },
  args: { initialQuery: "" },
  render: (args) => (
    <div style={{ minHeight: "100vh" }}>
      <HtsDashboardView {...args} />
    </div>
  ),
};
export default meta;
type Story = StoryObj<typeof HtsDashboardView>;

export const Default: Story = {};

/** Search pre-filled from the app shell (e.g. a patient ID). Every matching patient opens. */
export const WithInitialQuery: Story = {
  name: "With initial query",
  args: { initialQuery: "06-0336" },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole("searchbox")).toHaveValue("06-0336");
    await expect(c.getByRole("article", { name: "Patient 06-0336" })).toBeInTheDocument();
  },
};

/** Search by diagnosis matches every screen of that diagnosis. */
export const SearchByDiagnosis: Story = {
  name: "Search by diagnosis",
  args: { initialQuery: "rhabdomyosarcoma" },
};

export const NoResults: Story = {
  name: "No results",
  args: { initialQuery: "zz-not-a-patient" },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByText("No screens match. Check the ID, or reset the filters.")).toBeInTheDocument();
  },
};

/** Filter panel open with "Screened only" applied and a field expanded. */
export const FilterPanel: Story = {
  name: "Filter panel",
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("button", { name: "Filter" }));
    await userEvent.click(c.getByRole("checkbox", { name: "Screened only" }));
    await userEvent.click(c.getByRole("button", { name: "HTS report" }));
    await expect(c.getByRole("button", { name: "Filter, 1 active" })).toHaveAttribute("aria-expanded", "true");
  },
};

/** Screen-level update dialog, opened from the row menu. */
export const UpdateScreenDialog: Story = {
  name: "Update screen dialog",
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const [menu] = c.getAllByRole("button", { name: /^Update HTS status for [A-Z0-9]+_T_/ });
    await userEvent.click(menu);
    const body = within(canvasElement.ownerDocument.body);
    await expect(body.getByRole("dialog", { name: "Update HTS status" })).toBeInTheDocument();
    await expect(body.getByRole("button", { name: "Save changes" })).toBeDisabled();
  },
};

/** Event-level update dialog; choosing Done shows the "moves to Completed events" hint. */
export const UpdateEventDialog: Story = {
  name: "Update event dialog",
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const [update] = c.getAllByRole("button", { name: "Update HTS status for Diagnosis 1" });
    await userEvent.click(update);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(body.getByRole("combobox", { name: "HTS complete (event)" }));
    await userEvent.click(body.getByRole("option", { name: "DONE" }));
    await expect(body.getByText(/Done moves the event to Completed events\./)).toBeInTheDocument();
    await expect(body.getByRole("button", { name: "Save changes" })).toBeEnabled();
  },
};
