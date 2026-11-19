import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import {
  Bot,
  Brain,
  Database,
  Download,
  FileText,
  MessageCircle,
  Network,
  Route,
  ScanSearch,
  Toolbox,
  Workflow,
} from "lucide-react";
import { Button } from "../Button/Button";
import { StatusBadge } from "../Badge/Badge";
import { Section, Stage, StateCell } from "../../storybook/StoryLayout";
import { SidneyAvatar, WilliamAvatar, ZakAvatar, ZakLogo } from "../../storybook/aiAgents";
import {
  Canvas,
  CanvasAction,
  CanvasActions,
  CanvasFact,
  CanvasFacts,
  CanvasHeader,
  CanvasInsight,
  CanvasOutput,
  CanvasOutputAction,
  CanvasSection,
  CanvasStat,
  CanvasStats,
} from "./Canvas";
import { CanvasBarChart } from "./CanvasBarChart";
import {
  WorkspaceCreateRow,
  WorkspaceNavItem,
  WorkspaceNavSection,
  WorkspaceSearch,
  WorkspaceSidebar,
} from "./Workspace";
import {
  AgentRosterItem,
  RoutineItem,
  RoutineList,
  SourceIcon,
  SourceItem,
  SourceStack,
  SpaceCard,
  WorkspacePanel,
} from "./WorkspacePanel";

const meta: Meta = {
  title: "AI/Workspace Parts",
  parameters: {
    docs: {
      description: {
        component:
          "The pieces of `AI/Workspace` one by one. **Canvas output** — the work surface between sidebar and chat: header, case-detail facts, " +
          "the output card (stats, ranked `CanvasBarChart` with selectable bars and a hidden data table, agent insight, refinement chips). " +
          "**Sidebar** — `WorkspaceSidebar` with nav items, collapsible sections, an empty-state create row and the account switcher. " +
          "**Sources & routines** — `WorkspacePanel` cards, `SourceIcon` / `SourceStack` / `SourceItem`, `RoutineItem`, `AgentRosterItem`, `SpaceCard`.",
      },
    },
  },
};
export default meta;

type Story = StoryObj;

const GENES = [
  ["PIK3CA", 419], ["TP53", 387], ["ESR1", 198], ["GATA3", 162], ["CDH1", 134], ["MAP3K1", 109],
  ["AKT1", 87], ["PTEN", 78], ["BRCA1", 64], ["ERBB2", 52],
].map(([label, value]) => ({ label: label as string, value: value as number }));

/** Canvas output on its own — header, facts, output card. */
export const CanvasOutputCard: Story = {
  parameters: { layout: "fullscreen" },
  render: () => (
    <Canvas maxWidth={752}>
      <CanvasHeader title="AML patients in ZERO" onEditTitle={() => {}} />
      <CanvasSection title="Case details">
        <CanvasFacts>
          <CanvasFact label="Cohort">Paediatric AML / MDS</CanvasFact>
          <CanvasFact label="Patient set">Not yet defined</CanvasFact>
          <CanvasFact label="Provisional diagnosis">None established</CanvasFact>
          <CanvasFact label="Still open" tone="question">
            Which genes are worth counting within this cohort?
          </CanvasFact>
        </CanvasFacts>
      </CanvasSection>
      <CanvasOutput
        title="AML diagnoses in the pinned cohort snapshot"
        subtitle="Top genes by alteration rate"
        actions={
          <>
            <CanvasOutputAction icon={<Download />} aria-label="Download chart" />
            <CanvasOutputAction icon={<ScanSearch />} aria-label="Open full screen" />
          </>
        }
      >
        <CanvasStats>
          <CanvasStat label="Patients" value="1,247" />
          <CanvasStat label="Genes profiled" value="315" />
          <CanvasStat label="≥1 alteration" value="94.2%" />
          <CanvasStat label="Median TMB" value="5.3" unit="mut/Mb" />
        </CanvasStats>
        <CanvasBarChart label="Patients with an alteration, by gene" data={GENES} />
        <CanvasInsight>PIK3CA and TP53 account for over half of all alterations in this cohort.</CanvasInsight>
        <CanvasActions>
          <CanvasAction>Group by pathway</CanvasAction>
          <CanvasAction aria-pressed>Compare with TNBC reference</CanvasAction>
          <CanvasAction>Show co-occurrence</CanvasAction>
        </CanvasActions>
      </CanvasOutput>
    </Canvas>
  ),
};

/** Bars become buttons with `onSelect`; selected bars get a ring. Values show on hover / focus. */
export const BarChart: Story = {
  render: () => (
    <div style={{ width: 640 }}>
      <CanvasBarChart
        label="Patients with an alteration, by gene"
        data={GENES}
        selected={["TP53"]}
        onSelect={() => {}}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole("button", { name: "TP53, 387" })).toHaveAttribute("aria-pressed", "true");
    await expect(c.getByRole("table", { hidden: true })).toBeInTheDocument();
  },
};

function SidebarDemo({ empty = false }: { empty?: boolean }) {
  return (
    <div style={{ height: 640, display: "flex", border: "1px solid var(--insight-color-grey-30)" }}>
      <WorkspaceSidebar
        aria-label={empty ? "Workspace, first visit" : "Workspace"}
        navLabel={empty ? "Primary, first visit" : "Primary"}
        logo={<ZakLogo />}
        search={<WorkspaceSearch />}
        nav={
          <>
            <WorkspaceNavItem icon={<MessageCircle />} label="Chat" active={!empty} onClick={() => {}} action={{ label: "New chat", onClick: () => {} }} />
            <WorkspaceNavItem icon={<Bot />} label="Teams" onClick={() => {}} />
            <WorkspaceNavItem icon={<Toolbox />} label="Tools" onClick={() => {}} />
          </>
        }
        user={{ name: "Alicia Koch", email: "alicia.koch@ccia.org.au" }}
      onSignOut={() => {}}
      mark={<ZakAvatar size={28} />}
      >
        <WorkspaceNavSection
          title="Spaces"
          action={empty ? undefined : { label: "Create a space", onClick: () => {} }}
          empty={<WorkspaceCreateRow>Create a space</WorkspaceCreateRow>}
        >
          {empty ? null : (
            <>
              <WorkspaceNavItem label="AML patients in ZERO" onClick={() => {}} />
              <WorkspaceNavItem label="HER2-low MBC" onClick={() => {}} />
            </>
          )}
        </WorkspaceNavSection>
        <WorkspaceNavSection title="Chat History" collapsible>
          <WorkspaceNavItem label={empty ? "New chat" : "PIK3CA-mutant subtypes"} active={empty} onClick={() => {}} />
          {empty ? null : <WorkspaceNavItem label="Variant interpretation" onClick={() => {}} />}
        </WorkspaceNavSection>
      </WorkspaceSidebar>
    </div>
  );
}

/** Populated, first visit (no spaces yet), and the icon rail. */
export const Sidebar: Story = {
  render: () => (
    <Stage gap={32}>
      <StateCell label="Populated">
        <SidebarDemo />
      </StateCell>
      <StateCell label="First visit (empty spaces)">
        <SidebarDemo empty />
      </StateCell>
    </Stage>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const [toggle] = c.getAllByRole("button", { name: "Chat History" });
    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    const [collapse] = c.getAllByRole("button", { name: "Collapse sidebar" });
    await userEvent.click(collapse);
    await expect(c.getAllByRole("complementary")[0]).toHaveAttribute("data-collapsed", "true");
  },
};

const SOURCES = [
  { icon: <Brain />, label: "PKB · active assertions" },
  { icon: <Network />, label: "Insights · ZERO cohort · GraphQL MCP" },
  { icon: <Route />, label: "Variant pathways" },
  { icon: <Workflow />, label: "Case workflow" },
  { icon: <FileText />, label: "Literature · PubMed and bioRxiv" },
];

export const SourcesAndRoutines: Story = {
  render: () => (
    <div>
      <Section title="Panels" description="The right column of a space.">
        <Stage gap={16} align="flex-start">
          <div style={{ width: 351, display: "flex", flexDirection: "column", gap: 12 }}>
            <WorkspacePanel
              title="Sources"
              count={5}
              action={{ kind: "add", label: "Add a source", onClick: () => {} }}
              description="What the agents are allowed to read in this space."
            >
              <SourceStack>
                {SOURCES.map((s) => (
                  <SourceIcon key={s.label} icon={s.icon} label={s.label} />
                ))}
              </SourceStack>
            </WorkspacePanel>
            <WorkspacePanel title="Routines" count={3} action={{ kind: "add", label: "Add a routine", onClick: () => {} }}>
              <RoutineList>
                <RoutineItem name="Cohort snapshot refresh" schedule="Daily · 06:00" onMenu={() => {}} />
                <RoutineItem name="Tumour board digest" schedule="Weekly · Thu 07:30" meta="Next in 2 days" onMenu={() => {}} />
                <RoutineItem name="New PubMed matches for GATA2" schedule="Weekly · Mon 08:00" paused onMenu={() => {}} />
              </RoutineList>
            </WorkspacePanel>
          </div>
          <div style={{ width: 420, display: "flex", flexDirection: "column", gap: 12 }}>
            <WorkspacePanel title="Source status" count={4} description="Connection status, as a list.">
              <SourceItem icon={<Network />} name="ZERO cohort" detail="Snapshot 2026.02 · genomic and clinical data" action={<Button size="sm" variant="text">Change</Button>} />
              <SourceItem icon={<Brain />} name="PKB" detail="Active assertions" status="syncing" />
              <SourceItem icon={<Database />} name="Outcomes · site 2" detail="Held by another site" status="error" />
              <SourceItem icon={<FileText />} name="PubMed and bioRxiv" detail="Literature" status="off" />
            </WorkspacePanel>
          </div>
        </Stage>
      </Section>
      <Section title="Tool stack" description="Overlapping discs with a count, as on agent run cards.">
        <SourceStack layout="overlap" label="8 tools" max={5}>
          {[...SOURCES, ...SOURCES.slice(0, 3)].map((s, i) => (
            <SourceIcon key={i} bare icon={s.icon} label={s.label} />
          ))}
        </SourceStack>
      </Section>
      <Section title="Agents & spaces">
        <Stage column gap={12} style={{ width: 420 }}>
          <AgentRosterItem avatar={<ZakAvatar size={24} />} name="ZAK" role="Conductor" />
          <AgentRosterItem
            avatar={<SidneyAvatar size={24} />}
            name="Sidney"
            role="Cohort Expert"
            status={<StatusBadge variant="success">Ready</StatusBadge>}
          />
          <AgentRosterItem avatar={<WilliamAvatar size={24} />} name="William" role="Case & patient Expert" />
          <SpaceCard
            title="AML patients in ZERO"
            description="Which recurrent germline and somatic variants define the paediatric monosomy 7 AML / MDS cohort in ZERO?"
          />
        </Stage>
      </Section>
    </div>
  ),
};
