import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import {
  ACCESS_CAPABILITIES,
  ACCESS_NOTES,
  ACCESS_TIERS,
  ACCOUNT_CAPABILITIES,
  DATASET_ACCESS,
  DATA_REQUESTS,
  PARTICIPANT_BREAKDOWNS,
  PDX_BREAKDOWNS,
  SAMPLE_BREAKDOWNS,
} from "../../storybook/insightsAccess";
import { INSIGHTS_USER, InsightsShell } from "../../storybook/InsightsShell";
import { AccessDetails, AccessTierTable, AccountSummary } from "./AccessTiers";
import { DatasetAccessCard } from "./DatasetAccess";
import { RequestHistoryTable } from "./RequestHistory";

const meta: Meta = {
  title: "Insights/Access",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Access in Insights (Claude Design *Insights Onboarding*). **Tiers** — `AccessTierModal` / `AccessTierTable` compare T0–T3 and open from the sidebar's " +
          "Dataset access block (Components/Navigation) or \"Compare all tiers\". **Account** — `AccountSummary` with `AccessDetails`, a `DatasetAccessCard` per record " +
          "type, and `RequestHistoryTable`. The logo lives in Foundations/Brand, the bars in Charts.",
      },
    },
  },
};
export default meta;
type Story = StoryObj;

const T1 = ACCESS_TIERS[1];
const h2 = { margin: "8px 0 0", font: "500 16px/24px var(--insight-font-family-sans)", color: "var(--insight-color-off-black-100)" } as const;

function AccountPage({ openTiers }: { openTiers: () => void }) {
  const d = DATASET_ACCESS;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 1040, padding: "16px 24px 40px", fontFamily: "var(--insight-font-family-sans)" }}>
      <nav aria-label="Breadcrumb" style={{ fontSize: 12, color: "var(--insight-color-grey-100)" }}>
        Home / Account settings
      </nav>
      <h1 style={{ margin: 0, font: "500 24px/32px var(--insight-font-family-sans)", color: "var(--insight-color-off-black-100)" }}>Account</h1>
      <AccountSummary
        name={INSIGHTS_USER.name}
        email={INSIGHTS_USER.email}
        tierLabel="T1 · Registered"
        details={<AccessDetails capabilities={ACCOUNT_CAPABILITIES} tier={T1} onCompare={openTiers} />}
      />
      <h2 style={h2}>Dataset access</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
        <DatasetAccessCard label="Participants" unit="participants" available={d.participants.available} total={d.participants.total} breakdowns={PARTICIPANT_BREAKDOWNS} />
        <DatasetAccessCard label="Samples" unit="samples" color="var(--insight-color-yellow-100)" available={d.samples.available} total={d.samples.total} breakdowns={SAMPLE_BREAKDOWNS} />
        <DatasetAccessCard label="PDX models" unit="PDX models" color="var(--insight-color-green-150)" available={d.pdx.available} total={d.pdx.total} breakdowns={PDX_BREAKDOWNS} />
      </div>
      <h2 style={h2}>Request history</h2>
      <RequestHistoryTable requests={DATA_REQUESTS} onOpen={() => {}} />
    </div>
  );
}

/** The account page inside the Insights sidebar. "View access details" opens what T1 includes; "Compare all tiers" and the sidebar bar open the tier modal. */
export const Account: Story = {
  name: "Account page",
  render: () => <InsightsShell active="account">{(openTiers) => <AccountPage openTiers={openTiers} />}</InsightsShell>,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const toggle = c.getByRole("button", { name: "View access details" });
    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect(c.getByText("Granularity of data")).toBeVisible();
  },
};

/** The tier modal, as it opens from the sidebar's Dataset access block. */
export const TierModal: Story = {
  name: "Tier modal",
  render: () => <InsightsShell defaultTiersOpen />,
};

/** The tier comparison outside the modal — for docs and onboarding pages. */
export const TierTable: Story = {
  name: "Tier table",
  parameters: { layout: "padded" },
  render: () => (
    <div style={{ maxWidth: 1120 }}>
      <AccessTierTable tiers={ACCESS_TIERS} capabilities={ACCESS_CAPABILITIES} notes={ACCESS_NOTES} />
    </div>
  ),
};
