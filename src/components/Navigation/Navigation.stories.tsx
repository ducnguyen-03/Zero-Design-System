import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  CircleQuestionMark,
  EllipsisVertical,
  House,
  KeySquare,
  MessageSquareShare,
  Plus,
  Search,
  Sparkles,
  Zap,
} from "lucide-react";
import { NavRow } from "./NavRow";
import { Sidebar, SidebarSection } from "./Sidebar";
import { NotificationPanel } from "./NotificationPanel";
import type { NotificationItem } from "./NotificationPanel";
import { Stage, StateCell, Section, pseudo } from "../../storybook/StoryLayout";
import { InsightsShell } from "../../storybook/InsightsShell";
import { SidebarDatasetAccess } from "./SidebarDatasetAccess";

const meta: Meta<typeof NavRow> = {
  title: "Components/Navigation",
  component: NavRow,
  parameters: {
    docs: {
      description: {
        component:
          "Sidebar navigation (Figma **Sidebar**). `NavRow` is the row primitive: active rows get a green-10 background with green-300 text, hover tints grey-30, disabled rows fade to 50%. `Sidebar` composes rows with the logo, collapse toggle, sections, footer links and account switcher; `collapsed` gives the 60px icon rail where each row's label becomes its `aria-label` plus a hover/focus tooltip. `NotificationPanel` covers the *Notification Tab* and *Notification Empty* variants.",
      },
    },
  },
  args: { icon: <House />, children: "Home", active: false, disabled: false, collapsed: false },
  argTypes: {
    children: { control: "text", description: "Row label." },
    active: { control: "boolean", description: "Current page." },
    disabled: { control: "boolean" },
    collapsed: { control: "boolean", description: "Icon-only row with tooltip." },
    size: { control: "inline-radio", options: ["md", "sm"] },
    icon: { control: false, description: "Leading lucide icon." },
    trailing: { control: false },
    onClick: { action: "navigated", table: { disable: true } },
  },
  render: (args) => (
    <div style={{ width: 234 }}>
      <NavRow {...args} />
    </div>
  ),
};
export default meta;

type Story = StoryObj<typeof NavRow>;

export const Playground: Story = {};

export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Section>
      <Stage column gap={8} style={{ width: 234 }}>
        <StateCell label="Default">
          <NavRow icon={<KeySquare />}>Data access requests</NavRow>
        </StateCell>
        <StateCell label="Hover">
          <NavRow icon={<KeySquare />} className={pseudo.hover}>
            Data access requests
          </NavRow>
        </StateCell>
        <StateCell label="Active">
          <NavRow icon={<House />} active>
            Home
          </NavRow>
        </StateCell>
        <StateCell label="Focus">
          <NavRow icon={<KeySquare />} className={pseudo.focus}>
            Data access requests
          </NavRow>
        </StateCell>
        <StateCell label="Disabled">
          <NavRow icon={<Search />} disabled>
            Search
          </NavRow>
        </StateCell>
        <StateCell label="Small (footer)">
          <NavRow size="sm" icon={<CircleQuestionMark />}>
            FAQs
          </NavRow>
        </StateCell>
        <StateCell label="With trailing">
          <NavRow trailing="1h">Please share the genomic data…</NavRow>
        </StateCell>
        <StateCell label="Compressed · hover (tooltip)">
          <NavRow icon={<Search />} collapsed className={pseudo.hover}>
            Search
          </NavRow>
        </StateCell>
      </Stage>
    </Section>
  ),
};

/* ── Sidebar ─────────────────────────────────────────────── */

const user = { name: "Alicia Koch", email: "Alicekoh@ccia.org.au", initials: "AK" };

function PrimaryRows({ active = "home" }: { active?: string }) {
  return (
    <>
      <NavRow icon={<House />} active={active === "home"}>
        Home
      </NavRow>
      <NavRow icon={<Search />} active={active === "search"}>
        Search
      </NavRow>
      <NavRow icon={<Sparkles />} active={active === "ai"}>
        Ask AI assistant
      </NavRow>
      <NavRow icon={<KeySquare />} active={active === "dar"}>
        Data access requests
      </NavRow>
    </>
  );
}

const footer = (
  <>
    <NavRow size="sm" icon={<CircleQuestionMark />}>
      FAQs
    </NavRow>
    <NavRow size="sm" icon={<MessageSquareShare />}>
      Provide feedback
    </NavRow>
  </>
);

const savedQueries = (
  <SidebarSection
    title="Saved queries"
    action={
      <button
        type="button"
        aria-label="Search saved queries"
        style={{ display: "inline-flex", background: "none", border: "none", padding: 0, color: "inherit", cursor: "pointer" }}
      >
        <Search />
      </button>
    }
  >
    <NavRow icon={<Plus />}>Create new query</NavRow>
    <NavRow active trailing={<EllipsisVertical size={16} aria-hidden="true" />}>
      Genomic and clinical data for paediatric neuroblastoma
    </NavRow>
    <NavRow trailing="1h">Please share the genomic data for neuroblastoma</NavRow>
    <NavRow trailing="2h">Could you provide the genomic information</NavRow>
    <NavRow trailing="1w">I would like to request genomic information</NavRow>
  </SidebarSection>
);

const frame = { height: 640, display: "flex", background: "var(--insight-color-background-system-primary)" } as const;

export const SidebarDefault: Story = {
  name: "Sidebar · Default",
  parameters: { controls: { disable: true }, layout: "fullscreen" },
  render: () => (
    <div style={frame}>
      <Sidebar footer={footer} user={user} onSignOut={() => {}}>
        <PrimaryRows />
      </Sidebar>
    </div>
  ),
};

export const SidebarWithSections: Story = {
  name: "Sidebar · Default Hover (saved queries)",
  parameters: { controls: { disable: true }, layout: "fullscreen" },
  render: () => (
    <div style={{ ...frame, height: 820 }}>
      <Sidebar footer={footer} user={user} onSignOut={() => {}} sections={savedQueries}>
        <PrimaryRows />
      </Sidebar>
    </div>
  ),
};

export const SidebarCompressed: Story = {
  name: "Sidebar · Compressed",
  parameters: { controls: { disable: true }, layout: "fullscreen" },
  render: () => (
    <div style={frame}>
      <Sidebar defaultCollapsed footer={footer} user={user} onSignOut={() => {}}>
        <NavRow icon={<House />}>Home</NavRow>
        <NavRow icon={<Search />}>Search</NavRow>
        <NavRow icon={<KeySquare />}>Data access requests</NavRow>
      </Sidebar>
    </div>
  ),
};

/** Click the panel toggle to switch between Default and Compressed. */
export const SidebarInteractive: Story = {
  name: "Sidebar · Interactive",
  parameters: { controls: { disable: true }, layout: "fullscreen" },
  render: function Render() {
    const [collapsed, setCollapsed] = useState(false);
    const [active, setActive] = useState("home");
    return (
      <div style={frame}>
        <Sidebar
          collapsed={collapsed}
          onCollapsedChange={setCollapsed}
          footer={footer}
          user={user}
          onSignOut={() => {}}
        >
          {[
            ["home", <House key="i" />, "Home"],
            ["search", <Search key="i" />, "Search"],
            ["ai", <Sparkles key="i" />, "Ask AI assistant"],
            ["dar", <KeySquare key="i" />, "Data access requests"],
          ].map(([id, icon, label]) => (
            <NavRow
              key={id as string}
              icon={icon}
              active={active === id}
              onClick={() => setActive(id as string)}
            >
              {label as string}
            </NavRow>
          ))}
        </Sidebar>
        <main style={{ padding: 24, fontFamily: "var(--insight-font-family-sans)" }}>
          Sidebar is {collapsed ? "compressed" : "expanded"}.
        </main>
      </div>
    );
  },
};

/* ── Insights sidebar (Beta logo + Dataset access) ─────────── */

/** The Insights sidebar: Beta logo, saved queries, help links, the **Dataset access** block (`access` slot) and the account. The bar and Request access open the tier modal. */
export const SidebarInsights: Story = {
  name: "Sidebar · Insights (dataset access)",
  parameters: { controls: { disable: true }, layout: "fullscreen" },
  render: () => <InsightsShell />,
};

export const SidebarInsightsCompressed: Story = {
  name: "Sidebar · Insights (compressed)",
  parameters: { controls: { disable: true }, layout: "fullscreen" },
  render: () => <InsightsShell defaultCollapsed />,
};

/** `SidebarDatasetAccess` alone: solid = what the tier opens, hatched = what it hides. */
export const DatasetAccessBlock: Story = {
  name: "Sidebar · Dataset access block",
  parameters: { controls: { disable: true } },
  render: () => (
    <Stage gap={24} align="flex-start">
      <div style={{ width: 226 }}>
        <SidebarDatasetAccess available={14099} total={18641} availableLabel="3,184 participants" lockedLabel="1,316 no access" onShowTiers={() => {}} onRequest={() => {}} />
      </div>
      <div style={{ width: 226 }}>
        <SidebarDatasetAccess available={18641} total={18641} availableLabel="4,500 participants" onShowTiers={() => {}} />
      </div>
    </Stage>
  ),
};

/* ── Notifications ───────────────────────────────────────── */

const notifications: NotificationItem[] = [
  {
    id: "1",
    icon: <KeySquare />,
    title: "You were assigned to data access request",
    context: "CCI Insights / APP-2026-00423",
    body: "[SAMPLE] Genomic and clinical data for paediatric neuroblastoma patients who have a TP53 somatic mutation",
    timestamp: "2d ago",
    unread: true,
    onSelect: () => {},
  },
  {
    id: "2",
    avatar: { initials: "MW" },
    title: (
      <>
        Marie Wong-Erasmus <span style={{ fontWeight: 400 }}>commented on</span>
      </>
    ),
    context: "CCI Insights / APP-2026-00423",
    body: "[SAMPLE] Genomic and clinical data for paediatric neuroblastoma patients who have a…",
    quote:
      "I have updated the Security Infrastructure section as requested by the Committee. The data is now configured with AES-256 encryption across the entire download stream. Please check it again!",
    timestamp: "March 18, 2026 at 02:16 PM",
    onSelect: () => {},
  },
  {
    id: "3",
    avatar: { initials: "DG" },
    title: (
      <>
        Damien Green <span style={{ fontWeight: 400 }}>updated a application</span>
      </>
    ),
    context: "CCI Insights / APP-2026-00423",
    body: "[SAMPLE] Genomic and clinical data for paediatric neuroblastoma patients who have a…",
    timestamp: "March 18, 2026 at 02:16 PM",
    onSelect: () => {},
  },
  {
    id: "4",
    icon: <Zap />,
    title: (
      <>
        New Insights <span style={{ fontWeight: 400 }}>Relapse Risk View</span>
      </>
    ),
    quote: (
      <>
        <strong>Significant correlation detected</strong>
        <br />
        Day-15 MRD positivity is significantly associated with relapse.
      </>
    ),
    timestamp: "March 18, 2026 at 02:16 PM",
  },
];

const tabs = [
  { id: "all", label: "All" },
  { id: "comments", label: "Comments", count: 4 },
  { id: "update", label: "Update", count: 2 },
  { id: "news", label: "News" },
];

export const NotificationTab: Story = {
  name: "Sidebar · Notification Tab",
  parameters: { controls: { disable: true }, layout: "fullscreen" },
  render: () => (
    <div style={{ ...frame, height: 900 }}>
      <NotificationPanel
        notifications={notifications}
        tabs={tabs}
        onMarkAllRead={() => {}}
        onClose={() => {}}
        onSettings={() => {}}
      />
    </div>
  ),
};

export const NotificationEmpty: Story = {
  name: "Sidebar · Notification Empty",
  parameters: { controls: { disable: true }, layout: "fullscreen" },
  render: () => (
    <div style={frame}>
      <NotificationPanel title="Inbox" notifications={[]} onToggleSidebar={() => {}} />
    </div>
  ),
};

/** All six Figma `Variant`s side by side (Figma order). Compressed Hover is forced with pseudo-states. */
export const Variants: Story = {
  parameters: { controls: { disable: true }, layout: "fullscreen" },
  render: () => (
    <div style={{ padding: 24 }}>
      <Stage gap={32}>
        <StateCell label="Compressed">
          <div style={{ height: 820, display: "flex" }}>
            <Sidebar label="Main (collapsed)" defaultCollapsed user={user}>
              <NavRow icon={<House />}>Home</NavRow>
              <NavRow icon={<Search />}>Search</NavRow>
              <NavRow icon={<KeySquare />}>Data access requests</NavRow>
            </Sidebar>
          </div>
        </StateCell>
        <StateCell label="Compressed Hover">
          <div style={{ height: 820, display: "flex" }} className="pseudo-hover-all">
            <Sidebar label="Main (collapsed hover)" defaultCollapsed user={user}>
              <NavRow icon={<House />}>Home</NavRow>
              <NavRow icon={<Search />}>Search</NavRow>
              <NavRow icon={<KeySquare />}>Data access requests</NavRow>
            </Sidebar>
          </div>
        </StateCell>
        <StateCell label="Default Hover">
          <div style={{ height: 820, display: "flex" }}>
            <Sidebar label="Main (saved queries)" footer={footer} user={user} sections={savedQueries}>
              <PrimaryRows />
            </Sidebar>
          </div>
        </StateCell>
        <StateCell label="Default">
          <div style={{ height: 820, display: "flex" }}>
            <Sidebar footer={footer} user={user}>
              <PrimaryRows active="dar" />
            </Sidebar>
          </div>
        </StateCell>
        <StateCell label="Notification Tab">
          <div style={{ height: 820, display: "flex" }}>
            <NotificationPanel
              notifications={notifications}
              tabs={tabs}
              onMarkAllRead={() => {}}
              onClose={() => {}}
              onSettings={() => {}}
            />
          </div>
        </StateCell>
        <StateCell label="Notification Empty">
          <div style={{ height: 820, display: "flex" }}>
            <NotificationPanel title="Inbox" notifications={[]} onToggleSidebar={() => {}} />
          </div>
        </StateCell>
      </Stage>
    </div>
  ),
};
