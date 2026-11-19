import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { InsightsDashboard } from "./InsightsDashboard";
import type { InsightsPageView } from "./InsightsDashboard";
import { MolecularView } from "./views/MolecularView";
import { APPLIED_FILTERS } from "./data";

type Args = { view: InsightsPageView };

function PageAt({ view }: Args) {
  return (
    <div style={{ height: "100vh", minHeight: 720 }}>
      <InsightsDashboard key={view} initialView={view} />
    </div>
  );
}


const meta: Meta<Args> = {
  title: "Insights/Page",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "The Insights data explorer with its five tabs (Figma Insights-UI 15230:84687): **Summary**, **Biosamples**, **PDX models**, " +
          "**Study monitoring** (15230:84688) and **Molecular** (overview → gene detail). The Onboarding Tour runs over this page.",
      },
      story: { inline: false, iframeHeight: 900 },
    },
  },
  args: { view: "summary" },
  argTypes: { view: { control: "select", options: ["summary", "biosamples", "pdx", "participants", "molecular", "gene"] } },
  render: ({ view }) => <PageAt view={view} />,
};
export default meta;
type Story = StoryObj<Args>;

/** Pick any tab with the `view` control. */
export const Playground: Story = {};
export const Summary: Story = { render: () => <PageAt view="summary" /> };
export const Biosamples: Story = { render: () => <PageAt view="biosamples" /> };
export const PdxModels: Story = { name: "PDX models", render: () => <PageAt view="pdx" /> };
export const StudyMonitoring: Story = { name: "Study monitoring", render: () => <PageAt view="participants" /> };
export const Molecular: Story = { render: () => <PageAt view="molecular" /> };

/** Molecular › gene detail, opened from a frequently-searched gene. */
export const MolecularGeneDetail: Story = {
  name: "Molecular · TP53 detail",
  render: () => (
    <div style={{ maxWidth: 1600 }}>
      <MolecularView initialGene="TP53" />
    </div>
  ),
};

/** Tabs switch views. */
export const SwitchTabs: Story = {
  name: "Switch tabs",
  render: () => <PageAt view="summary" />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("tab", { name: /Biosamples/ }));
    await expect(c.getByRole("tab", { name: /Biosamples/ })).toHaveAttribute("aria-selected", "true");
    await userEvent.click(c.getByRole("tab", { name: /PDX models/ }));
    await expect(c.getByRole("tab", { name: /PDX models/ })).toHaveAttribute("aria-selected", "true");
  },
};

/** The chevron beside the query name collapses and expands the query details (filter hint + Add filters). */
export const QueryDetailsToggle: Story = {
  name: "Query details · collapse / expand",
  render: () => <PageAt view="summary" />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const hint = "Add filters from the right panel to start building your query";
    const toggle = c.getByRole("button", { name: "Show query details" });
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(c.queryByText(hint)).not.toBeInTheDocument();
    await userEvent.click(toggle);
    await expect(c.getByRole("button", { name: "Hide query details" })).toHaveAttribute("aria-expanded", "true");
    await expect(c.getByText(hint)).toBeVisible();
    await userEvent.click(c.getByRole("button", { name: "Hide query details" }));
    await expect(c.queryByText(hint)).not.toBeInTheDocument();
  },
};

/**
 * Filters applied (Figma Insights-UI 7282:77049): the query header lists every applied filter as a chip
 * (long value lists fold into "+N"), the rail marks domains with filters, and the Gene tab shows
 * headline stats, the top-10 alteration frequency and the gene table.
 */
export const FiltersAppliedGene: Story = {
  name: "Filters applied · Gene",
  render: () => (
    <div style={{ height: "100vh", minHeight: 720 }}>
      <InsightsDashboard initialView="gene" tabSet="conditional" initialFilters={APPLIED_FILTERS} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole("button", { name: "Request data access" })).toBeEnabled();
    await expect(c.getByRole("tab", { name: /Gene/ })).toHaveAttribute("aria-selected", "true");
    await userEvent.click(c.getByRole("button", { name: "Show 3 more Cohort values" }));
    await expect(c.getByRole("button", { name: "Show fewer Cohort values" })).toHaveAttribute("aria-expanded", "true");
    await userEvent.click(c.getByRole("button", { name: "Remove Sites filter" }));
    await expect(c.queryByText("Sites")).not.toBeInTheDocument();
    await userEvent.click(c.getByRole("button", { name: "Manage Columns" }));
    await userEvent.click(c.getByRole("checkbox", { name: "Role" }));
    await expect(c.queryByRole("columnheader", { name: "Role" })).not.toBeInTheDocument();
  },
};

/** Study filter panel (Figma 7288:45465): each section picks whether participants match *Any of* or *None of* the ticked options. */
export const StudyFilterPanel: Story = {
  name: "Filters · Study panel (match any / none)",
  render: () => (
    <div style={{ height: "100vh", minHeight: 720 }}>
      <InsightsDashboard initialView="gene" tabSet="conditional" initialFilters={APPLIED_FILTERS} initialPanel="study" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole("combobox", { name: "Cohort: match" })).toHaveValue("any");
    const study = c.getByRole("combobox", { name: "Study: match" });
    await expect(study).toHaveValue("none");
    await userEvent.selectOptions(study, "any");
    await expect(study).toHaveValue("any");
    await userEvent.click(c.getByRole("button", { name: "Close Study filters" }));
    await expect(c.queryByRole("combobox", { name: "Cohort: match" })).not.toBeInTheDocument();
  },
};
