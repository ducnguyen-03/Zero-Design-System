import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import {
  Bot,
  Brain,
  Database,
  Download,
  EllipsisVertical,
  FileText,
  MessageCircle,
  Network,
  Plus,
  Route,
  ScanSearch,
  Toolbox,
  Workflow,
} from "lucide-react";
import { Button } from "../Button/Button";
import { StatusBadge } from "../Badge/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeaderCell,
  TableRow,
  TableRowMenu,
} from "../Table/Table";
import {
  JanetAvatar,
  KarlAvatar,
  PedTrialAvatar,
  SidneyAvatar,
  WilliamAvatar,
  ZakAvatar,
  ZakLogo,
} from "../../storybook/aiAgents";
import { ChatAgentCard, ChatAgentHeader } from "./ChatAgent";
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
import { ChatLoader } from "./ChatLoader";
import { ChatAgentChip, ChatCallout, ChatMessage, ChatMessageMeta } from "./ChatMessage";
import { ChatPanel } from "./ChatPanel";
import { PromptInput, PromptInputBanner, PromptInputChip } from "./PromptInput";
import { WorkflowCard, WorkflowCards } from "./WorkflowCard";
import { ZAK_WORKFLOWS } from "../../storybook/zakWorkflows";
import {
  WorkspaceLayout,
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
  SourceStack,
  SpaceCard,
  WorkspacePanel,
} from "./WorkspacePanel";

const meta: Meta = {
  title: "AI/Workspace",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "The full AI workspace assembled from the set, as in the ZAK prototype: `WorkspaceLayout` (sidebar 248 · canvas · chat 440), " +
          "`WorkspaceSidebar` (logo, search ⌘K, Chat / Teams / Tools, Spaces, Chat history, account), the **canvas** " +
          "(`CanvasHeader`, `CanvasFacts`, `CanvasOutput` with `CanvasStats`, `CanvasBarChart`, `CanvasInsight`, `CanvasActions`), and the `ChatPanel`. " +
          "**Space** shows the space overview — chats table and the `WorkspacePanel`s for agents, instructions, sources (`SourceStack`) and routines (`RoutineItem`). " +
          "**Drag the chat panel's left edge** to trade width with the canvas (360–760px, the canvas keeps ≥ 480px); arrow keys move it 20px (Shift 80), Home / End jump to the limits, Enter or a double-click resets to 440, and `storageKey` remembers the width. " +
          "Below 1100px the chat floats over the canvas; below 768px the sidebar folds to its icon rail.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ height: "100vh", minHeight: 720 }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj;

/* ── shared data ── */

const GENES = [
  ["PIK3CA", 419], ["TP53", 387], ["ESR1", 198], ["GATA3", 162], ["CDH1", 134], ["MAP3K1", 109],
  ["AKT1", 87], ["PTEN", 78], ["BRCA1", 64], ["ERBB2", 52], ["BRCA2", 47], ["FGFR1", 41],
  ["NF1", 38], ["MAP2K4", 29], ["RB1", 22],
].map(([label, value]) => ({ label: label as string, value: value as number }));

const SOURCES = [
  { icon: <Brain />, label: "PKB · active assertions" },
  { icon: <Network />, label: "Insights · ZERO cohort · GraphQL MCP" },
  { icon: <Route />, label: "Variant pathways" },
  { icon: <Workflow />, label: "Case workflow" },
  { icon: <FileText />, label: "Literature · PubMed and bioRxiv" },
];

const CHATS = [
  "Treatment response by hotspot",
  "TMB vs response analysis",
  "Mutation frequency · ZG-2103",
  "Cohort eligibility flow",
  "Cohort vs SEER reference",
];

function Sidebar({ active, defaultCollapsed }: { active: "chat" | "space" | "teams"; defaultCollapsed?: boolean }) {
  return (
    <WorkspaceSidebar
      logo={<ZakLogo />}
      defaultCollapsed={defaultCollapsed}
      search={<WorkspaceSearch />}
      nav={
        <>
          <WorkspaceNavItem
            icon={<MessageCircle />}
            label="Chat"
            active={active === "chat"}
            onClick={() => {}}
            action={{ label: "New chat", onClick: () => {} }}
          />
          <WorkspaceNavItem icon={<Bot />} label="Teams" active={active === "teams"} onClick={() => {}} />
          <WorkspaceNavItem icon={<Toolbox />} label="Tools" onClick={() => {}} />
        </>
      }
      user={{ name: "Alicia Koch", email: "alicia.koch@ccia.org.au" }}
      onSignOut={() => {}}
      mark={<ZakAvatar size={28} />}
    >
      <WorkspaceNavSection title="Spaces" action={{ label: "Create a space", onClick: () => {} }}>
        <WorkspaceNavItem label="AML patients in ZERO" active={active === "space"} onClick={() => {}} />
        <WorkspaceNavItem label="HER2-low MBC" onClick={() => {}} />
        <WorkspaceNavItem label="Trial matching" onClick={() => {}} />
      </WorkspaceNavSection>
      <WorkspaceNavSection title="Chat History" collapsible>
        <WorkspaceNavItem label="HER2-low MBC" onClick={() => {}} />
        <WorkspaceNavItem label="PIK3CA-mutant subtypes" onClick={() => {}} />
        <WorkspaceNavItem label="Variant interpretation" onClick={() => {}} />
        <WorkspaceNavItem label="BRCA1/2 enrichment review" onClick={() => {}} />
      </WorkspaceNavSection>
    </WorkspaceSidebar>
  );
}

function Composer({ onSubmit }: { onSubmit?: (t: string) => void }) {
  return (
    <PromptInput
      placeholder="Chat with ZAK"
      onSubmit={onSubmit}
      onAdd={() => {}}
      banner={
        <PromptInputBanner
          icon={
            <>
              <ZakAvatar size={20} />
              <SidneyAvatar size={20} />
            </>
          }
        >
          Agents
        </PromptInputBanner>
      }
      actions={<PromptInputChip icon={<Database />}>ZERO cohort</PromptInputChip>}
    />
  );
}

/* ── Canvas view (Figma "Introducing the agents") ── */

function CanvasWorkspace() {
  const [panelOpen, setPanelOpen] = useState(true);
  const [filters, setFilters] = useState<string[]>([]);
  const [pressed, setPressed] = useState<string | null>(null);
  const [asked, setAsked] = useState<string[]>([]);
  const toggleFilter = (g: string) =>
    setFilters((f) => (f.includes(g) ? f.filter((x) => x !== g) : [...f, g]));

  return (
    <WorkspaceLayout
      sidebar={<Sidebar active="chat" />}
      panelOpen={panelOpen}
      panel={
        <ChatPanel
          title="AML patients in ZERO"
          onMenu={() => {}}
          onMinimize={() => setPanelOpen(false)}
          onClose={() => setPanelOpen(false)}
          scrollKey={asked.length}
          composer={<Composer onSubmit={(t) => setAsked((a) => [...a, t])} />}
        >
          <ChatMessage role="user">I want to know how many AML patients are there in ZERO.</ChatMessage>
          <ChatMessage avatar={<ZakAvatar />} author="Zak">
            <p>
              Yes I can help you find out the number of AML patients in ZERO. Let me introduce you to Sidney, our
              cohort expert, who will help you with all your cohort related questions.
            </p>
            <ChatAgentCard
              compact
              header={
                <ChatAgentHeader
                  size="sm"
                  avatar={<SidneyAvatar size={32} />}
                  name="Sidney"
                  role="Cohort Expert"
                  status={<StatusBadge variant="success">Done</StatusBadge>}
                />
              }
            />
          </ChatMessage>
          <ChatMessage
            avatar={<ZakAvatar />}
            author="Zak"
            footer={
              <ChatMessageMeta label="Worked for 1m 30s">
                <ChatAgentChip avatar={<ZakAvatar size={20} shape="circle" />} name="ZAK" />
                <ChatAgentChip avatar={<SidneyAvatar size={20} shape="circle" />} name="Sidney" />
              </ChatMessageMeta>
            }
          >
            <p>One count over the pinned cohort snapshot.</p>
            <ChatCallout title="Top genes by alteration rate">
              PIK3CA and TP53 account for over half of all alterations in this cohort. Click any bar to add it as a
              filter, or refine the distribution by pathway, VAF range, or actionability tier.
            </ChatCallout>
          </ChatMessage>
          {asked.map((q, i) => (
            <div key={i} style={{ display: "contents" }}>
              <ChatMessage role="user">{q}</ChatMessage>
              <ChatMessage avatar={<ZakAvatar />} author="Zak">
                <ChatLoader variant="spinner" label="Planning the turn" />
              </ChatMessage>
            </div>
          ))}
        </ChatPanel>
      }
    >
      <Canvas>
        <CanvasHeader
          title="AML patients in ZERO"
          onEditTitle={() => {}}
          actions={
            panelOpen ? null : (
              <Button size="sm" startIcon={<MessageCircle />} onClick={() => setPanelOpen(true)}>
                Open chat
              </Button>
            )
          }
        />
        <CanvasSection title="Case details">
          <CanvasFacts>
            <CanvasFact label="Cohort">Paediatric AML / MDS</CanvasFact>
            <CanvasFact label="Patient set">{filters.length ? filters.join(", ") : "Not yet defined"}</CanvasFact>
            <CanvasFact label="Provisional diagnosis">None established</CanvasFact>
            <CanvasFact label="Still open" tone="question">
              Which genes are worth counting within this cohort?
            </CanvasFact>
          </CanvasFacts>
        </CanvasSection>
        <CanvasOutput
          title="AML diagnoses in the pinned cohort snapshot"
          subtitle="HER2-low Metastatic Breast Cancer · top genes by alteration rate"
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
          <CanvasBarChart
            label="Patients with an alteration, by gene"
            data={GENES}
            selected={filters}
            onSelect={(d) => toggleFilter(d.label)}
          />
          <CanvasInsight>
            PIK3CA and TP53 account for over half of all alterations in this cohort. Click any bar to add it as a
            filter, or refine the distribution by pathway, VAF range, or actionability tier.
          </CanvasInsight>
          <CanvasActions>
            {["Group by pathway", "Compare with TNBC reference", "Show co-occurrence"].map((a) => (
              <CanvasAction key={a} aria-pressed={pressed === a} onClick={() => setPressed(pressed === a ? null : a)}>
                {a}
              </CanvasAction>
            ))}
          </CanvasActions>
        </CanvasOutput>
      </Canvas>
    </WorkspaceLayout>
  );
}

/** Figma "Introducing the agents": sidebar · canvas output · chat. Click bars to filter; minimise the chat to widen the canvas. */
export const CanvasView: Story = {
  render: () => <CanvasWorkspace />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("button", { name: "PIK3CA, 419" }));
    await expect(c.getByRole("button", { name: "PIK3CA, 419" })).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(c.getByRole("button", { name: "Minimise chat" }));
    await expect(c.queryByRole("log")).toBeNull();
    await userEvent.click(c.getByRole("button", { name: "Open chat" }));
    await expect(c.getByRole("log")).toBeInTheDocument();
  },
};

/* ── Space view (Figma "Space") ── */

function SpaceWorkspace() {
  return (
    <WorkspaceLayout sidebar={<Sidebar active="space" />}>
      <Canvas>
        <CanvasHeader
          title="AML patients in ZERO"
          onEditTitle={() => {}}
          description="Which recurrent germline and somatic variants define the paediatric monosomy 7 AML / MDS cohort in ZERO, and how do they shift tumour board recommendations?"
          actions={
            <>
              <Button size="sm" startIcon={<Plus />}>
                New Chat
              </Button>
              <CanvasOutputAction icon={<EllipsisVertical />} aria-label="Space options" />
            </>
          }
        />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-start" }}>
          <div style={{ flex: "1 1 480px", minWidth: 0 }}>
            <CanvasSection title="Chats" count={CHATS.length}>
              <TableContainer>
                <Table caption="Chats in this space" captionHidden>
                  <TableHead>
                    <TableRow>
                      <TableHeaderCell>Chat name</TableHeaderCell>
                      <TableHeaderCell>Owner</TableHeaderCell>
                      <TableHeaderCell>Last updated</TableHeaderCell>
                      <TableHeaderCell>
                        <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
                          Actions
                        </span>
                      </TableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {CHATS.map((c) => (
                      <TableRow key={c}>
                        <TableCell>{c}</TableCell>
                        <TableCell>Marie</TableCell>
                        <TableCell>12 Sep 2026</TableCell>
                        <TableCell align="end">
                          <TableRowMenu aria-label={`Actions for ${c}`} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CanvasSection>
          </div>
          <div style={{ flex: "0 1 351px", minWidth: 280, display: "flex", flexDirection: "column", gap: 12 }}>
            <WorkspacePanel title="Agents" count={6}>
              <div style={{ display: "flex", gap: 12, padding: 8 }} role="list" aria-label="Agents in this space">
                {[ZakAvatar, SidneyAvatar, JanetAvatar, WilliamAvatar, KarlAvatar, PedTrialAvatar].map((A, i) => (
                  <span role="listitem" key={i}>
                    <A size={24} label={["Zak", "Sidney", "Janet", "William", "Karl", "PedTrial"][i]} />
                  </span>
                ))}
              </div>
            </WorkspacePanel>
            <WorkspacePanel title="Instructions" action={{ kind: "edit", label: "Edit instructions", onClick: () => {} }}>
              <p style={{ margin: 0, font: "14px/1.4 var(--insight-font-family-sans)", letterSpacing: "0.14px" }}>
                How Zak should frame every plan in this space. Which recurrent germline and somatic variants define the
                paediatric monosomy 7 AML / MDS cohort in ZERO, and how do they shift tumour board recommendations?
              </p>
            </WorkspacePanel>
            <WorkspacePanel
              title="Sources"
              count={SOURCES.length}
              action={{ kind: "add", label: "Add a source", onClick: () => {} }}
              description="What the agents are allowed to read in this space."
            >
              <SourceStack>
                {SOURCES.map((s) => (
                  <SourceIcon key={s.label} icon={s.icon} label={s.label} />
                ))}
              </SourceStack>
            </WorkspacePanel>
            <WorkspacePanel title="Routines" count={2} action={{ kind: "add", label: "Add a routine", onClick: () => {} }}>
              <RoutineList>
                <RoutineItem name="Cohort snapshot refresh" schedule="Daily · 06:00" onMenu={() => {}} />
                <RoutineItem name="New PubMed matches for GATA2" schedule="Weekly · Mon 08:00" paused onMenu={() => {}} />
              </RoutineList>
            </WorkspacePanel>
          </div>
        </div>
      </Canvas>
    </WorkspaceLayout>
  );
}

/** Figma "Space": overview of one space — its chats, team, instructions, sources and routines. */
export const SpaceView: Story = {
  render: () => <SpaceWorkspace />,
};

/* ── Teams view (Figma "Agent") ── */

export const TeamsView: Story = {
  render: () => (
    <WorkspaceLayout sidebar={<Sidebar active="teams" />}>
      <Canvas>
        <CanvasHeader title="Teams" />
        <CanvasSection title="The teams" count={6}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 392 }}>
            <AgentRosterItem avatar={<ZakAvatar size={24} />} name="ZAK" role="Conductor" />
            <AgentRosterItem avatar={<SidneyAvatar size={24} />} name="Sidney" role="Cohort Expert" />
            <AgentRosterItem avatar={<JanetAvatar size={24} />} name="Janet" role="Variant Expert" />
            <AgentRosterItem avatar={<WilliamAvatar size={24} />} name="William" role="Case & patient Expert" />
            <AgentRosterItem avatar={<KarlAvatar size={24} />} name="Karl" role="Literature Expert" />
            <AgentRosterItem avatar={<PedTrialAvatar size={24} />} name="PedTrial" role="Trial-matching Expert" />
          </div>
        </CanvasSection>
        <SourceStack layout="overlap" label="8 tools" max={5}>
          {[...SOURCES, ...SOURCES.slice(0, 3)].map((s, i) => (
            <SourceIcon key={i} bare icon={s.icon} label={s.label} />
          ))}
        </SourceStack>
      </Canvas>
    </WorkspaceLayout>
  ),
};

/* ── Home (PedTrial in ZAK, step 1) ── */

function HomeWorkspace() {
  const [picked, setPicked] = useState("trials");
  return (
    <WorkspaceLayout sidebar={<Sidebar active="chat" />}>
      <Canvas maxWidth={1120}>
        <div style={{ display: "flex", flexDirection: "column", gap: 24, paddingTop: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <ZakAvatar size={40} />
            <h1 style={{ margin: 0, font: "500 32px/1.25 var(--insight-font-family-sans)", color: "var(--insight-color-off-black-100)" }}>
              Hi there I’m Zak,
            </h1>
          </div>
          <PromptInput placeholder="Describe a case, or ask ZAK anything" onAdd={() => {}} />
          <WorkflowCards>
            {ZAK_WORKFLOWS.map(({ id, ...w }) => (
              <WorkflowCard key={id} {...w} selected={picked === id} onClick={() => setPicked(id)} />
            ))}
          </WorkflowCards>
        </div>
      </Canvas>
    </WorkspaceLayout>
  );
}

/** Home: Zak's greeting, the prompt, and "Start from a workflow" — PedTrial's new trial-matching workflow first. */
export const HomeView: Story = {
  render: () => <HomeWorkspace />,
};

/* ── Full-page chat (Figma "Create a Space") ── */

export const ChatPageView: Story = {
  render: () => (
    <WorkspaceLayout sidebar={<Sidebar active="chat" />}>
      <ChatPanel
        variant="page"
        title="Setting up a space"
        onMenu={() => {}}
        onMinimize={() => {}}
        onClose={() => {}}
        composer={<PromptInput placeholder="Ask ZAK to build a space" onAdd={() => {}} />}
      >
        <ChatMessage role="user">Help me set up a space for AML patients working on ZERO data</ChatMessage>
        <ChatMessage avatar={<ZakAvatar />} author="Zak">
          <p>
            Yes I can help you create a space for AML patients in ZERO. Is this a clinical team, a research project, or
            a patient support program?
          </p>
        </ChatMessage>
        <ChatMessage role="user">Yes, this is a research project</ChatMessage>
        <ChatMessage avatar={<ZakAvatar />} author="Zak">
          <p>AML Research – ZERO is set up — a dedicated space for your AML patient research project at ZERO.</p>
          <SpaceCard
            title="AML patients in ZERO"
            description="Which recurrent germline and somatic variants define the paediatric monosomy 7 AML / MDS cohort in ZERO, and how do they shift tumour board recommendations?"
          />
          <p>Right — let me bring in the people you’ll need.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
            <AgentRosterItem
              avatar={<SidneyAvatar size={24} />}
              name="Sidney"
              role="Cohort Expert"
              status={<StatusBadge variant="success">Ready</StatusBadge>}
            />
            <AgentRosterItem
              avatar={<WilliamAvatar size={24} />}
              name="William"
              role="Case & patient Expert"
              status={<StatusBadge variant="success">Ready</StatusBadge>}
            />
          </div>
        </ChatMessage>
      </ChatPanel>
    </WorkspaceLayout>
  ),
};

/** The sidebar folded to its icon rail. */
export const CollapsedSidebar: Story = {
  render: () => (
    <WorkspaceLayout sidebar={<Sidebar active="space" defaultCollapsed />}>
      <Canvas>
        <CanvasHeader title="AML patients in ZERO" />
      </Canvas>
    </WorkspaceLayout>
  ),
};
