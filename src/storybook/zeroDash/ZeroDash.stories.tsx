import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { ZeroDashApp } from "./ZeroDashApp";
import type { ZeroDashAppProps } from "./ZeroDashApp";

const VIEWS = [
  "Overview",
  "Curation:Cases",
  "Clinical:Cases",
  "HTS Dashboard",
  "Atlas:SAVvy",
  "Curation:Meetings",
  "Clinical:Meetings",
  "Reports",
] as const;

const meta: Meta<ZeroDashAppProps> = {
  title: "ZeroDash/App",
  component: ZeroDashApp,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "ZeroDash (Claude Design project *Purity-Ploidy Fitting UI*): the curation and clinical app. The sidebar navigates " +
          "between **Overview** (case list with PHI masking), **Curation › Cases** (→ patient curation → purity & ploidy fitting), " +
          "**Clinical › Cases** (MTB slides), **HTS Dashboard** and **Curation Atlas › SAVvy**. Each page also has its own stories " +
          "under *ZeroDash*.",
      },
      story: { inline: false, iframeHeight: 900 },
    },
  },
  args: { initialView: "Overview", sidebarCollapsed: false, plotDensity: "compact", maintenanceBar: "off" },
  argTypes: {
    initialView: { control: "select", options: VIEWS },
    plotDensity: { control: "inline-radio", options: ["compact", "large"] },
    maintenanceBar: { control: "inline-radio", options: ["off", "scheduled", "imminent"] },
  },
};
export default meta;
type Story = StoryObj<ZeroDashAppProps>;

export const Playground: Story = {};
export const Curation: Story = { args: { initialView: "Curation:Cases" } };
export const ClinicalCases: Story = { name: "Clinical cases", args: { initialView: "Clinical:Cases" } };
export const HtsDashboard: Story = { name: "HTS Dashboard", args: { initialView: "HTS Dashboard" } };
export const Savvy: Story = { name: "SAVvy", args: { initialView: "Atlas:SAVvy" } };
export const SidebarCollapsed: Story = { name: "Sidebar · collapsed", args: { sidebarCollapsed: true } };
export const MaintenanceScheduled: Story = { name: "Maintenance bar · scheduled", args: { maintenanceBar: "scheduled" } };
export const MaintenanceImminent: Story = { name: "Maintenance bar · imminent", args: { maintenanceBar: "imminent" } };
export const MaintenanceSnackbar: Story = { name: "Maintenance · snackbar", args: { maintenanceBar: "scheduled", showMaintenanceSnackbar: true } };
export const MaintenanceNotice: Story = { name: "Maintenance · notice", args: { showMaintenanceNotice: true } };
export const MaintenanceOffline: Story = { name: "Maintenance · offline page", args: { maintenancePhase: "offline" } };
export const MaintenanceOfflineDark: Story = { name: "Maintenance · offline page (dark)", args: { maintenancePhase: "offline", maintenanceTheme: "dark" } };

/** Sidebar groups expand inline; picking a child switches the page and marks it current. */
export const Navigate: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const curation = c.getByRole("button", { name: "Curation" });
    await expect(curation).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(curation);
    await expect(curation).toHaveAttribute("aria-expanded", "true");
    const meetings = c.getAllByRole("button", { name: "Meetings" })[0];
    await userEvent.click(meetings);
    await expect(meetings).toHaveAttribute("aria-current", "page");
    await expect(c.getByRole("heading", { name: "Curation meetings" })).toBeVisible();
  },
};

/** The bell in the sidebar footer opens the notifications popover; Escape closes it. */
export const Notifications: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("button", { name: "Notifications" }));
    await expect(c.getByText("You’re all caught up")).toBeVisible();
    await userEvent.keyboard("{Escape}");
    await expect(c.queryByText("You’re all caught up")).not.toBeInTheDocument();
  },
};
