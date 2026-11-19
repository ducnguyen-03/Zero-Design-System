import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import {
  Bot,
  Building2,
  ChartColumn,
  CircleHelp,
  ClipboardList,
  Database,
  FileText,
  ListOrdered,
  Mail,
  ShieldCheck,
  Download,
  GitCompareArrows,
  ListTree,
  Route,
  MessageCircle,
  ScatterChart,
  ShieldAlert,
  Table2,
  Toolbox,
} from "lucide-react";
import { AlertBanner } from "../AlertBanner/AlertBanner";
import { Button } from "../Button/Button";
import { Chip } from "../Chip/Chip";
import { StatusBadge } from "../Badge/Badge";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableHeaderCell, TableRow } from "../Table/Table";
import { PedTrialAvatar, WilliamAvatar, ZakAvatar, ZakLogo } from "../../storybook/aiAgents";
import {
  TRIAL_CASE_CARD,
  TRIAL_CRITERIA,
  TRIAL_DRAFTS,
  TRIAL_ESTIMATE,
  TRIAL_EXCLUDED,
  TRIAL_FIRST_FIELDS,
  TRIAL_FOCUS,
  TRIAL_HELPFUL,
  TRIAL_MISSING,
  TRIAL_MTB,
  TRIAL_QUESTION,
  TRIAL_RANKED,
  TRIAL_REVISE_NOTE,
  TRIAL_RUN_TIME,
  TRIAL_SCENARIO,
  TRIAL_SITES,
  TRIAL_STATS,
  TRIAL_TITLE,
  TRIAL_TRANSCRIPT,
} from "../../storybook/zakTrials";
import { AgentRunCard } from "./AgentRunCard";
import type { AgentRunStatus } from "./AgentRunCard";
import { ChainOfThoughtStep, ChainOfThoughtSteps } from "./ChainOfThought";
import type { ChainOfThoughtStatus } from "./ChainOfThought";
import { ClaimList, GuardrailList, HighlightedText, MissingFacts, ProvenanceTable } from "./Intake";
import { CriterionTable, DraftEmail, ExcludedTrials, RecipientPicker, ReportExcerpt, ScenarioTable, TrialCard, TrialList } from "./TrialMatch";
import {
  UMAP_LEVEL1,
  UMAP_LEVEL1_GROUPS,
  UMAP_LEVEL2,
  UMAP_LEVEL2_GROUPS,
  UMAP_LEVEL3,
  UMAP_LEVEL3_CASE,
  UMAP_LEVEL3_GROUPS,
  UMAP_PATIENT_SET,
  UMAP_PATIENT_SET_CASES,
  UMAP_PATIENT_SET_GROUPS,
} from "../../storybook/zakUmap";
import { Canvas, CanvasOutput, CanvasOutputAction, CanvasStat, CanvasStats } from "./Canvas";
import { ChatAgentCard, ChatAgentHeader } from "./ChatAgent";
import { ChatAgentChip, ChatHandoff, ChatMessage, ChatMessageMeta } from "./ChatMessage";
import { ChatPanel } from "./ChatPanel";
import {
  AgreementLabel,
  CanvasIdTag,
  CanvasQuestion,
  CanvasSources,
  CanvasVerdict,
  CaseMarker,
  ClassifierLevels,
  ConstraintList,
  LevelBars,
  RankedBars,
  SourceReconcile,
} from "./Classifier";
import type { AgreementStatus, ClassifierLevel, RankedBarItem } from "./Classifier";
import { CanvasSegmented, CanvasVisual, CanvasVisuals } from "./CanvasVisuals";
import { PromptInput, PromptInputChip } from "./PromptInput";
import { RunSummary, RunTrace } from "./RunTrace";
import type { RunStep } from "./RunTrace";
import { UmapCaseKey, UmapPlot, UmapSwatchKey } from "./UmapPlot";
import type { UmapGroup, UmapHighlight, UmapPoint } from "./UmapPlot";
import { WorkspaceLayout, WorkspaceNavItem, WorkspaceNavSection, WorkspaceSearch, WorkspaceSidebar } from "./Workspace";

const meta: Meta = {
  title: "AI/Classifier result",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "The canvas for a ZAK classifier answer (from the ZAK *Individual case* and *Patient set* layouts). " +
          "It reads top-down: the **question** (`CanvasQuestion`), the **answer** (`CanvasVerdict`, always tagged Provisional), " +
          "the **key figures** (`CanvasStats variant=\"cards\"`), then the **evidence** in `CanvasVisuals` — a row of toggles above a two-column grid, " +
          "so researchers switch off visuals they don't need and the page stays digestible. Each `CanvasVisual` can also hide itself from its header. " +
          "Visuals: `UmapPlot` (classifier reference cohort, legend filters classes), `ClassifierLevels`, `RankedBars`, `SourceReconcile`, " +
          "a per-patient `Table`, and `ConstraintList`; `CanvasSources` closes with provenance and the clinical caveat. " +
          "Level 1 and Level 2 UMAPs are the real methylation embeddings (2,155 and 602 reference samples); Level 3 is mockup layout data.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ height: "100vh", minHeight: 760 }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj;

/* ── data ── */

const C = {
  blue: "var(--insight-color-blue-150)",
  orange: "var(--insight-color-orange-150)",
  green: "var(--insight-color-green-175)",
  red: "var(--insight-color-red-150)",
  amber: "var(--insight-color-yellow-200)",
  violet: "var(--insight-color-violet-100)",
  grey: "var(--insight-color-grey-50)",
};

type Level = "1" | "2" | "3";

const UMAPS: Record<Level, { points: UmapPoint[]; groups: UmapGroup[]; caseGroup: number; title: string; n: string }> = {
  "1": {
    points: UMAP_LEVEL1 as UmapPoint[],
    groups: UMAP_LEVEL1_GROUPS.map((label, i) => ({
      label,
      color: [C.blue, C.red, C.green, C.amber, C.violet, C.grey][i],
      shortLabel: label === "Other" ? null : undefined,
    })),
    caseGroup: 1,
    title: "Level 1 · paediatric cancer",
    n: "2,155",
  },
  "2": {
    points: UMAP_LEVEL2 as UmapPoint[],
    groups: UMAP_LEVEL2_GROUPS.map((label, i) => ({
      label,
      color: [C.blue, C.red, C.grey][i],
      shortLabel: ["Precursor B-cell", "Myeloid neoplasms", null][i],
    })),
    caseGroup: 1,
    title: "Level 2 · haematological malignancy",
    n: "602",
  },
  "3": {
    points: UMAP_LEVEL3 as UmapPoint[],
    groups: UMAP_LEVEL3_GROUPS.map((label, i) => ({
      label,
      color: [C.blue, C.orange, C.green, C.grey][i],
      shortLabel: ["AML, MR", "Childhood MDS-IB", "AML, KMT2A-r", null][i],
    })),
    caseGroup: 0,
    title: "Level 3 · AML / MDS",
    n: "229 (mockup)",
  },
};

/** Median of a class — where a case of that class sits in a level without its own coordinates. */
function medianOf(points: UmapPoint[], g: number, dx = 0, dy = 0) {
  const own = points.filter((p) => p[2] === g);
  const med = (v: number[]) => v.sort((a, b) => a - b)[Math.floor(v.length / 2)];
  return { x: med(own.map((p) => p[0])) + dx, y: med(own.map((p) => p[1])) + dy };
}

/* Data from ZAK_mockup_plots — example values for layout only. Bar colours reuse the Level 3 UMAP
   class colours, so a bar and its cluster read as the same class. */
const CASE_LEVELS: ClassifierLevel[] = [
  {
    level: "Level 1",
    classifier: "ZERO2 category",
    calls: [
      { label: "Haematological malignancy", p: 0.99 },
      { label: "Haematological malignancy", p: 0.97 },
    ],
    agreement: "same",
  },
  {
    level: "Level 2",
    classifier: "Haem sub-classifier",
    calls: [
      { label: "Acute myeloid leukaemia", p: 0.93 },
      { label: "Acute myeloid leukaemia", p: 0.88 },
    ],
    agreement: "same",
  },
  {
    level: "Level 3",
    classifier: "AML sub-classifier",
    calls: [
      { label: "AML, myelodysplasia-related", p: 0.84 },
      { label: "AML, myelodysplasia-related", p: 0.71 },
    ],
    agreement: "same",
  },
];

const TOP_CLASSES: RankedBarItem[] = [
  { label: "AML, myelodysplasia-related", value: 0.84, color: C.blue },
  { label: "Childhood MDS with increased blasts", value: 0.09, color: C.orange },
  { label: "AML with KMT2A rearrangement", value: 0.04, color: C.green },
  { label: "All other classes", value: 0.03, color: C.grey },
];

const WHO_ENTITIES: RankedBarItem[] = [
  { label: "Acute myeloid leukaemia, myelodysplasia-related", value: 3, display: "3", color: C.blue },
  { label: "Childhood myelodysplastic neoplasm with increased blasts", value: 1, display: "1", color: C.orange },
  { label: "Not classified (blocked)", value: 1, display: "1", color: C.grey },
];

function LevelChart() {
  return (
    <LevelBars
      series={[{ label: "Methylation" }, { label: "Expression" }]}
      rows={CASE_LEVELS.map((l) => ({
        level: l.level,
        label: l.calls[0]?.label ?? "—",
        values: l.calls.map((c) => c?.p ?? null),
      }))}
    />
  );
}

/** Patient-set reference: every sample grey, clusters named by WHO-HAEM5 entity (as in the mockup). */
const SET_GROUPS: UmapGroup[] = UMAP_PATIENT_SET_GROUPS.map((label, i) => ({
  label,
  // grey-60, a step darker than the class "other" grey: the reference must stay legible on its own.
  color: "var(--insight-color-grey-60)",
  shortLabel: i === 4 ? null : label,
}));
const SET_DESCRIPTIONS: Record<string, string> = {
  c1: "CASE-0001 · AML, MR 0.84",
  c2: "CASE-0002 · AML, MR 0.66",
  c3: "CASE-0003 · MDS-IB 0.62 (modalities discordant)",
  c4: "CASE-0004 · AML, MR 0.91",
};
const SET_HIGHLIGHTS: UmapHighlight[] = UMAP_PATIENT_SET_CASES.map((c) => ({ ...c, description: SET_DESCRIPTIONS[c.id] }));

const SOURCES_ROWS = [
  {
    label: "Sources",
    value: (
      <>
        molecular classifier <code>[MODEL VERSION]</code> · TaxonomyDB + WHO KG <code>[VERSION]</code> · recorded diagnosis
        from ZERO curated clinical data · cohort <code>[COHORT VERSION]</code>
      </>
    ),
  },
  {
    label: "Assertions fired",
    value: (
      <>
        <code>PKB-[ID]</code> classification scheme vintage (warn)
      </>
    ),
  },
  { label: "Rendered for", value: <code>[PROFILE]</code> },
];
const DISCLAIMER =
  "Example values for layout only. Provisional: classifier output supports, but does not replace, pathology review and is not a clinical diagnosis.";

/* ── shell ── */

function Sidebar({ space = "Paediatric AML / MDS" }: { space?: string }) {
  return (
    <WorkspaceSidebar
      logo={<ZakLogo />}
      search={<WorkspaceSearch />}
      nav={
        <>
          <WorkspaceNavItem icon={<MessageCircle />} label="Chat" active onClick={() => {}} action={{ label: "New chat", onClick: () => {} }} />
          <WorkspaceNavItem icon={<Bot />} label="Teams" onClick={() => {}} />
          <WorkspaceNavItem icon={<Toolbox />} label="Tools" onClick={() => {}} />
        </>
      }
      user={{ name: "Alicia Koch", email: "alicia.koch@ccia.org.au" }}
      onSignOut={() => {}}
      mark={<ZakAvatar size={28} />}
    >
      <WorkspaceNavSection title="Spaces" action={{ label: "Create a space", onClick: () => {} }}>
        {["Paediatric AML / MDS", "Trial matching", "HER2-low MBC"].map((label) => (
          <WorkspaceNavItem key={label} label={label} active={label === space} onClick={() => {}} />
        ))}
      </WorkspaceNavSection>
    </WorkspaceSidebar>
  );
}

function Chat({ question, onClose }: { question: string; onClose: () => void }) {
  return (
    <ChatPanel
      title="Inquiry: paediatric AML / MDS"
      onMinimize={onClose}
      onClose={onClose}
      composer={
        <PromptInput
          placeholder="Ask a follow-up"
          onAdd={() => {}}
          actions={<PromptInputChip icon={<Database />}>ZERO cohort</PromptInputChip>}
        />
      }
    >
      <ChatMessage role="user">{question}</ChatMessage>
      <ChatMessage
        avatar={<ZakAvatar />}
        author="Zak"
        footer={
          <ChatMessageMeta label="Worked for 48s">
            <ChatAgentChip avatar={<ZakAvatar size={20} shape="circle" />} name="ZAK" />
            <ChatAgentChip avatar={<WilliamAvatar size={20} shape="circle" />} name="William" />
          </ChatMessageMeta>
        }
      >
        <p>
          I ran the molecular classifier and mapped the result to WHO-HAEM5. The answer and its evidence are on the canvas —
          switch visuals on or off from the Evidence bar.
        </p>
        <ChatAgentCard
          compact
          header={
            <ChatAgentHeader
              size="sm"
              avatar={<WilliamAvatar size={32} />}
              name="William"
              role="Case & patient expert"
              status={<StatusBadge variant="success">Done</StatusBadge>}
            />
          }
        />
      </ChatMessage>
    </ChatPanel>
  );
}

function Shell({ question, children }: { question: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <WorkspaceLayout
      sidebar={<Sidebar />}
      panelOpen={open}
      panel={<Chat question={question} onClose={() => setOpen(false)} />}
      storageKey="zak-chat-panel-width"
    >
      {children}
    </WorkspaceLayout>
  );
}

/* ── Individual case ── */

const CASE_Q = "For CASE-0001, what does the classifier say, and which WHO entity does it correspond to?";

const CASE_VISUALS = [
  { id: "umap", label: "Reference cohort", icon: <ScatterChart /> },
  { id: "levels", label: "By taxonomy level", icon: <ListTree /> },
  { id: "top", label: "Top classes", icon: <ChartColumn /> },
  { id: "reconcile", label: "vs recorded diagnosis", icon: <GitCompareArrows /> },
  { id: "trace", label: "How it was made", icon: <Route /> },
];

const CASE_STEPS: RunStep[] = [
  { agent: "zak", title: "Planned the turn", tool: "2 classifier calls · 1 taxonomy lookup", duration: "3s" },
  {
    agent: "zak",
    title: "Checked domain constraints",
    tool: "PKB · assertions in scope",
    result: "1 warning · scheme vintage",
    status: "warning",
    duration: "1s",
  },
  { agent: "william", title: "Ran the methylation classifier", tool: "[MODEL VERSION]", result: "AML, MR · 0.84 at Level 3", duration: "19s" },
  { agent: "william", title: "Ran the expression classifier", tool: "[MODEL VERSION]", result: "AML, MR · 0.71 at Level 3", duration: "15s" },
  { agent: "zak", title: "Mapped to WHO-HAEM5", tool: "TaxonomyDB + WHO KG", result: "AML, myelodysplasia-related", duration: "6s" },
  { agent: "zak", title: "Critic check", tool: "critic", result: "Difference explained by classification version", duration: "4s" },
];

function CaseUmap() {
  const [level, setLevel] = useState<Level>("3");
  const [modality, setModality] = useState<"methylation" | "expression">("methylation");
  const u = UMAPS[level];
  const caseAt = level === "3" ? UMAP_LEVEL3_CASE : medianOf(u.points, u.caseGroup);
  return (
    <CanvasVisual
      id="umap"
      span="full"
      title="Case in the reference cohort"
      subtitle={`2D UMAP, ${u.title} — ${u.n} reference samples; axes have no units. Select a class in the legend to hide it.`}
      controls={
        <>
          <CanvasSegmented
            aria-label="Modality"
            value={modality}
            onChange={setModality}
            options={[
              { value: "methylation", label: "Methylation" },
              { value: "expression", label: "Expression", disabled: true },
            ]}
          />
          <CanvasSegmented
            aria-label="Taxonomy level"
            value={level}
            onChange={setLevel}
            options={[
              { value: "1", label: "Level 1" },
              { value: "2", label: "Level 2" },
              { value: "3", label: "Level 3" },
            ]}
          />
        </>
      }
      actions={<CanvasOutputAction icon={<Download />} aria-label="Download UMAP" />}
    >
      <UmapPlot
        key={level}
        points={u.points}
        groups={u.groups}
        highlights={[{ id: "case", label: "CASE-0001", ...caseAt, description: `classified as ${u.groups[u.caseGroup].label}` }]}
        label={`UMAP of ${u.n} ${u.title} reference samples, with CASE-0001`}
        legendExtra={<UmapCaseKey />}
        height={level === "3" ? 380 : 440}
      />
    </CanvasVisual>
  );
}

function CaseLevels() {
  const [view, setView] = useState<"chart" | "table">("chart");
  return (
    <CanvasVisual
      id="levels"
      title="Prediction by taxonomy level"
      subtitle="Each level is a separate classifier in the hierarchy"
      controls={
        <CanvasSegmented
          aria-label="Show as"
          value={view}
          onChange={setView}
          options={[
            { value: "chart", label: "Chart" },
            { value: "table", label: "Table" },
          ]}
        />
      }
    >
      {view === "chart" ? <LevelChart /> : <ClassifierLevels modalities={["Methylation", "Expression"]} levels={CASE_LEVELS} />}
    </CanvasVisual>
  );
}

function IndividualCaseCanvas({ defaultVisible }: { defaultVisible?: string[] }) {
  return (
    <Canvas>
      <CanvasQuestion meta={<RunSummary agents={["zak", "william"]}>Turns 4–5 · 6 steps · 48s</RunSummary>}>{CASE_Q}</CanvasQuestion>
      <CanvasVerdict
        statusNote="WHO-HAEM5 entity, mapped from the classifier result"
        title="Acute myeloid leukaemia, myelodysplasia-related"
        path={["Haematological malignancy", "Acute myeloid leukaemia", "AML, myelodysplasia-related"]}
        tags={
          <>
            <CanvasIdTag label="Methylation sample">[SAMPLE ID]</CanvasIdTag>
            <CanvasIdTag label="Expression sample">[SAMPLE ID]</CanvasIdTag>
            <CanvasIdTag label="Models">[MODEL VERSIONS]</CanvasIdTag>
          </>
        }
        actions={
          <>
            <Button variant="outline" size="sm">
              View WHO-HAEM5 criteria
            </Button>
            <Button size="sm">Add to report</Button>
          </>
        }
      />
      <CanvasStats variant="cards">
        <CanvasStat label="Methylation probability" value="0.84" mono note="at Level 3" />
        <CanvasStat label="Expression probability" value="0.71" mono note="at Level 3" />
        <CanvasStat label="Methylation vs expression" value="Concordant" status="success" note="Same class at all 3 levels" />
        <CanvasStat label="vs recorded diagnosis" value="Same entity" status="success" note="after WHO edition mapping — see warning" />
      </CanvasStats>
      <CanvasVisuals visuals={CASE_VISUALS} defaultVisible={defaultVisible}>
        <CaseUmap />
        <CaseLevels />
        <CanvasVisual id="top" title="Top classes at Level 3" subtitle="Methylation classifier; probabilities sum to 1">
          <RankedBars
            max={1}
            items={TOP_CLASSES}
            footnote={
              <>
                Results below the low-confidence threshold <code>[TBC]</code> are flagged for review.
              </>
            }
          />
        </CanvasVisual>
        <CanvasVisual
          id="reconcile"
          span="full"
          title="Classifier result vs recorded diagnosis"
          subtitle="The provisional entity reconciles two grounded sources; it does not generate a diagnosis"
        >
          <SourceReconcile
            sources={[
              { label: "Classifier · Level 3, methylation", value: "AML, myelodysplasia-related", source: "Molecular classifier [MODEL VERSION]" },
              { label: "Mapped WHO-HAEM5 entity", value: "Acute myeloid leukaemia, myelodysplasia-related", source: "TaxonomyDB + WHO KG [VERSION]" },
              {
                label: "Recorded diagnosis · ZERO",
                value: "AML with myelodysplasia-related changes",
                note: "Uses WHO revised 4th edition (2016) terminology",
              },
            ]}
          >
            <AlertBanner color="warning" title="Classification scheme vintage · PKB-[ID]">
              The recorded diagnosis predates WHO-HAEM5. Through the supersedes chain, “AML with myelodysplasia-related
              changes” maps to “Acute myeloid leukaemia, myelodysplasia-related” (renamed, with revised criteria) — a
              classification-vintage difference, not a biological disagreement. The criteria change is kept for review.
            </AlertBanner>
          </SourceReconcile>
        </CanvasVisual>
        <CanvasVisual
          id="trace"
          span="full"
          title="How this answer was made"
          subtitle="Each step, the agent that ran it, the tool it used and what came out"
        >
          <RunTrace steps={CASE_STEPS} />
        </CanvasVisual>
      </CanvasVisuals>
      <CanvasSources rows={SOURCES_ROWS} disclaimer={DISCLAIMER} />
    </Canvas>
  );
}

/** ZAK "Individual case": the answer first, then evidence the researcher can switch on and off. */
export const IndividualCase: Story = {
  render: () => (
    <Shell question={CASE_Q}>
      <IndividualCaseCanvas />
    </Shell>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const toggle = c.getByRole("button", { name: "Top classes" });
    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
    await expect(c.queryByRole("heading", { name: "Top classes at Level 3" })).toBeNull();
    await userEvent.click(toggle);
    await expect(c.getByRole("heading", { name: "Top classes at Level 3" })).toBeInTheDocument();
  },
};

/** The same case with the chat closed and only the UMAP switched on — a focused reading. */
export const IndividualCaseFocused: Story = {
  render: () => (
    <WorkspaceLayout sidebar={<Sidebar />}>
      <IndividualCaseCanvas defaultVisible={["umap"]} />
    </WorkspaceLayout>
  ),
};

/* ── Patient set ── */

const SET_Q =
  "For these patients, what does the classifier say? What WHO entities do those correspond to, and do any disagree with the recorded diagnosis?";

interface PatientRow {
  id: string;
  marker: string;
  methylation: [string, number] | "Not run" | "Not available";
  expression: [string, number] | "Not run" | "Not available";
  entity: string;
  recorded: string;
  vs: AgreementStatus;
  vsText?: string;
  flags: string[];
}

const PATIENTS: PatientRow[] = [
  {
    id: "CASE-0001",
    marker: "C1",
    methylation: ["AML, myelodysplasia-related", 0.84],
    expression: ["AML, myelodysplasia-related", 0.71],
    entity: "Acute myeloid leukaemia, myelodysplasia-related",
    recorded: "AML with myelodysplasia-related changes (WHO 2016)",
    vs: "mapped",
    flags: ["Scheme vintage · PKB-[ID]"],
  },
  {
    id: "CASE-0002",
    marker: "C2",
    methylation: ["AML, myelodysplasia-related", 0.66],
    expression: ["AML, myelodysplasia-related", 0.61],
    entity: "Acute myeloid leukaemia, myelodysplasia-related",
    recorded: "AML, myelodysplasia-related",
    vs: "same",
    vsText: "Same entity",
    flags: ["Low purity · PKB-[ID]"],
  },
  {
    id: "CASE-0003",
    marker: "C3",
    methylation: ["Childhood MDS with increased blasts", 0.62],
    expression: ["AML, myelodysplasia-related", 0.48],
    entity: "Childhood myelodysplastic neoplasm with increased blasts",
    recorded: "AML, myelodysplasia-related",
    vs: "disagrees",
    flags: ["Low confidence (expression)", "Modalities discordant"],
  },
  {
    id: "CASE-0004",
    marker: "C4",
    methylation: ["AML, myelodysplasia-related", 0.91],
    expression: "Not available",
    entity: "Acute myeloid leukaemia, myelodysplasia-related",
    recorded: "AML, myelodysplasia-related",
    vs: "same",
    vsText: "Same entity",
    flags: ["Expression missing"],
  },
  {
    id: "CASE-0005",
    marker: "C5",
    methylation: "Not run",
    expression: "Not run",
    entity: "Not classified",
    recorded: "AML, myelodysplasia-related",
    vs: "blocked",
    flags: ["Outside validated age scope · PKB-[ID]"],
  },
];

const SET_VISUALS = [
  { id: "table", label: "Per-patient results", icon: <Table2 /> },
  { id: "constraints", label: "Constraints", icon: <ShieldAlert /> },
  { id: "umap", label: "Reference cohort", icon: <ScatterChart /> },
  { id: "entities", label: "Mapped entities", icon: <ChartColumn /> },
  { id: "trace", label: "How it was made", icon: <Route /> },
];

const SET_STEPS: RunStep[] = [
  { agent: "zak", title: "Planned the turn", tool: "5 patients · 1 call each", duration: "2s" },
  {
    agent: "zak",
    title: "Checked domain constraints",
    tool: "PKB · assertions in scope",
    result: "1 block · 2 warnings",
    status: "warning",
    duration: "1s",
  },
  { agent: "william", title: "Classified C1–C4", tool: "[MODEL VERSION]", result: "4 classified · C3 low confidence", duration: "52s" },
  { agent: "william", title: "Classify C5", tool: "[MODEL VERSION]", result: "Not run · outside validated age scope", status: "blocked" },
  { agent: "zak", title: "Mapped to WHO-HAEM5", tool: "TaxonomyDB + WHO KG", result: "2 entities", duration: "7s" },
  { agent: "zak", title: "Critic check", tool: "critic", result: "C3 kept open for review", status: "warning", duration: "5s" },
];

function Call({ v }: { v: PatientRow["methylation"] }) {
  if (typeof v === "string") return <span style={{ color: "var(--insight-color-grey-100)" }}>{v}</span>;
  const low = v[1] < 0.5;
  return (
    <>
      {v[0]}{" "}
      <code
        style={{
          font: "12px var(--insight-font-family-mono)",
          color: low ? "var(--insight-color-orange-200)" : "var(--insight-color-grey-100)",
        }}
      >
        {v[1].toFixed(2)}
      </code>
    </>
  );
}

function SetUmap({ active, onActive }: { active: string | null; onActive: (id: string | null) => void }) {
  const [modality, setModality] = useState<"methylation" | "expression">("methylation");
  return (
    <CanvasVisual
      id="umap"
      title="Patient set in the reference cohort"
      subtitle="2D UMAP, AML / MDS methylation reference; axes have no units. C1–C4 as in the table; C5 not shown (not classified)."
      controls={
        <CanvasSegmented
          aria-label="Modality"
          value={modality}
          onChange={setModality}
          options={[
            { value: "methylation", label: "Methylation" },
            { value: "expression", label: "Expression", disabled: true },
          ]}
        />
      }
    >
      <UmapPlot
        points={UMAP_PATIENT_SET as UmapPoint[]}
        groups={SET_GROUPS}
        highlights={SET_HIGHLIGHTS}
        classLegend={false}
        activeHighlight={active}
        onHighlightChange={onActive}
        label="UMAP of the AML / MDS methylation reference with patients C1 to C4"
        legendExtra={
          <>
            <UmapSwatchKey color="var(--insight-color-grey-60)">Reference samples (labelled by WHO-HAEM5 entity)</UmapSwatchKey>
            <UmapCaseKey>Patient in the set (C1–C4)</UmapCaseKey>
          </>
        }
        height={380}
      />
    </CanvasVisual>
  );
}

function PatientSetCanvas() {
  // Shared between the table and the UMAP: pointing at a case in one lights it in the other.
  const [active, setActive] = useState<string | null>(null);
  return (
    <Canvas>
      <CanvasQuestion
        meta={<RunSummary agents={["zak", "william"]}>Turns 4–5 · one classifier call per patient · 67s</RunSummary>}
        context={
          <>
            Patient set from turn 3: AML with monosomy 7 and a GATA2 variant · 5 patients · cohort <code>[COHORT VERSION]</code>
          </>
        }
      >
        {SET_Q}
      </CanvasQuestion>
      <CanvasVerdict
        statusNote="Per-patient classification, merged"
        title="4 of 5 patients classified · 1 disagreement with the recorded diagnosis"
        actions={
          <>
            <Button variant="outline" size="sm" startIcon={<Download />}>
              Download table (CSV)
            </Button>
            <Button size="sm">Add to report</Button>
          </>
        }
      />
      <CanvasStats variant="cards">
        <CanvasStat label="Classified" value="4/5" mono note="1 blocked by a scope constraint" />
        <CanvasStat label="vs recorded diagnosis" value="3/4" mono status="warning" note="same entity (1 after WHO edition mapping)" />
        <CanvasStat label="Methylation vs expression" value="2/3" mono note="concordant where both are available" />
        <CanvasStat label="Constraints fired" value="3" mono note="1 block, 2 warnings" />
      </CanvasStats>
      <CanvasVisuals visuals={SET_VISUALS}>
        <CanvasVisual
          id="table"
          span="full"
          title="Per-patient results"
          subtitle="Deepest taxonomy level reached; select a case to open the individual view. p = classifier probability."
        >
          <TableContainer>
            <Table caption="Per-patient classifier results" captionHidden>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Case</TableHeaderCell>
                  <TableHeaderCell>Methylation (p)</TableHeaderCell>
                  <TableHeaderCell>Expression (p)</TableHeaderCell>
                  <TableHeaderCell>Mapped WHO-HAEM5 entity</TableHeaderCell>
                  <TableHeaderCell>Recorded diagnosis</TableHeaderCell>
                  <TableHeaderCell>vs recorded</TableHeaderCell>
                  <TableHeaderCell>Flags</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {PATIENTS.map((p) => (
                  <TableRow
                    key={p.id}
                    onMouseEnter={() => setActive(p.marker.toLowerCase())}
                    onMouseLeave={() => setActive(null)}
                    selected={active === p.marker.toLowerCase()}
                  >
                    <TableCell>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 8, whiteSpace: "nowrap" }}>
                        <CaseMarker active={active === p.marker.toLowerCase()}>{p.marker}</CaseMarker>
                        <a href={`#${p.id}`} style={{ color: "var(--insight-color-foreground-link)", font: "13px var(--insight-font-family-mono)" }}>
                          {p.id}
                        </a>
                      </span>
                    </TableCell>
                    <TableCell>
                      <Call v={p.methylation} />
                    </TableCell>
                    <TableCell>
                      <Call v={p.expression} />
                    </TableCell>
                    <TableCell>{p.entity}</TableCell>
                    <TableCell>{p.recorded}</TableCell>
                    <TableCell>
                      <AgreementLabel status={p.vs}>{p.vsText}</AgreementLabel>
                    </TableCell>
                    <TableCell>
                      <span style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {p.flags.map((f) => (
                          <Chip key={f} size="sm" variant="outline">
                            {f}
                          </Chip>
                        ))}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CanvasVisual>
        <CanvasVisual
          id="constraints"
          span="full"
          title="Constraints and checks in this turn"
          subtitle="Domain assertions from the PKB, evaluated before dispatch; ids make each one traceable"
        >
          <ConstraintList
            items={[
              { kind: "block", id: "PKB-[ID]", text: "Classifier applied outside its validated age scope; classification was not run.", cases: <CaseMarker active={active === "c5"}>C5</CaseMarker> },
              { kind: "warning", id: "PKB-[ID]", text: "Low tumour purity [VALUE] may affect classification.", cases: <CaseMarker active={active === "c2"}>C2</CaseMarker> },
              {
                kind: "warning",
                id: "PKB-[ID]",
                text: "Recorded diagnosis predates WHO-HAEM5; mapped through the supersedes chain (renamed, criteria revised) and treated as a classification-vintage difference, not a disagreement.",
                cases: <CaseMarker active={active === "c1"}>C1</CaseMarker>,
              },
              {
                kind: "critic",
                text: "The C3 disagreement is not explained by classification version; the modalities also disagree and expression confidence is low. Kept as an open question for review, not flattened.",
                cases: <CaseMarker active={active === "c3"}>C3</CaseMarker>,
              },
            ]}
          />
        </CanvasVisual>
        <SetUmap active={active} onActive={setActive} />
        <CanvasVisual id="entities" title="Mapped WHO-HAEM5 entities" subtitle="Number of patients, from taxonomy mapping">
          <RankedBars
            max={5}
            items={WHO_ENTITIES}
            footnote="Not classified = blocked by a constraint, shown so the denominator stays honest."
          />
        </CanvasVisual>
        <CanvasVisual
          id="trace"
          span="full"
          title="How this answer was made"
          subtitle="Each step, the agent that ran it, the tool it used and what came out"
        >
          <RunTrace steps={SET_STEPS} />
        </CanvasVisual>
      </CanvasVisuals>
      <CanvasSources
        rows={[
          {
            label: "Sources",
            value: (
              <>
                molecular classifier <code>[MODEL VERSION]</code> · TaxonomyDB + WHO KG <code>[VERSION]</code> · recorded diagnoses
                from ZERO curated clinical data · patient set from turn 3
              </>
            ),
          },
          { label: "Rendered for", value: <code>[PROFILE]</code> },
        ]}
        disclaimer={DISCLAIMER}
      />
    </Canvas>
  );
}

/** ZAK "Patient set": five patients, one classifier call each, merged — table, cohort UMAP, entity counts, constraints. */
export const PatientSet: Story = {
  render: () => (
    <Shell question={SET_Q}>
      <PatientSetCanvas />
    </Shell>
  ),
};


/* ── Trial matching · PedTrial (prototype "PedTrial in ZAK") ── */

const TRIAL_PHRASES = TRIAL_CASE_CARD.map((r) => r.phrase);
const TRIAL_SRC = "ClinicalTrials.gov 7 oct 2026";
const TRIAL_CARD_INTAKE = TRIAL_CASE_CARD.filter((r) => r.field !== "age_years");
const T = TRIAL_TRANSCRIPT;

/** The transcript is light markdown: paragraphs, "- " lists (after an optional lead line) and **bold**. */
const bold = (t: string) => t.split(/\*\*(.+?)\*\*/g).map((part, i) => (i % 2 ? <b key={i}>{part}</b> : part));
const isItem = (l: string) => /^\s*[-*]\s/.test(l);
const paras = (text: string) =>
  text.split(/\n\n+/).flatMap((block, i) => {
    const lines = block.split("\n");
    const lead = lines.filter((l) => !isItem(l));
    const items = lines.filter(isItem);
    return [
      lead.length ? <p key={`p${i}`}>{bold(lead.join(" "))}</p> : null,
      items.length ? (
        <ul key={`u${i}`}>
          {items.map((l, j) => (
            <li key={j}>{bold(l.replace(/^\s*[-*]\s/, ""))}</li>
          ))}
        </ul>
      ) : null,
    ];
  });

const TRIAL_SOURCES_ROWS = [
  {
    label: "Sources",
    value: (
      <>
        recruiting trials on {TRIAL_SRC} with an AU/NZ site · BioMCP <code>{TRIAL_STATS.biomcp}</code> · criterion readings by{" "}
        <code>{TRIAL_STATS.model}</code> (TrialGPT method)
      </>
    ),
  },
  { label: "Case", value: "Synthetic · confirmed by the user · privacy guard found no identifiers" },
  { label: "Rendered for", value: <code>[PROFILE]</code> },
];
const TRIAL_DISCLAIMER =
  "Synthetic case, placeholder contacts. Trial options for discussion, not a clinical recommendation; criterion readings are not clinically validated and the trial team's judgement is authoritative.";

const TRIAL_GUARDRAILS = [
  { holds: true, text: "Synthetic cases only: you confirm it, and a privacy guard plus a model check refuse identifying details." },
  { holds: true, text: "No invented facts: every case-card value is traced to a phrase you wrote; missing key facts are asked for." },
  { holds: true, text: "Every criterion reading cites the case-card fields it used; a trial is ranked only if no criterion fails." },
  { holds: true, text: "The costly step runs only after you approve a stated estimate." },
  { holds: true, text: "Drafts only: PedTrial cannot send email. Summary, recipient, quotes and the synthetic notice are built by rules." },
  { holds: true, text: "Contacts stay out of the results: sites and recipients appear only when you ask to reach out." },
  { holds: false, text: "Not clinically validated: readings and rankings have no clinician ground truth yet." },
  { holds: false, text: "Partial coverage: ANZCTR-only trials are not found automatically, and many sites list no named PI or email." },
];

const TRIAL_STEPS: RunStep[] = [
  { agent: "zak", title: "Opened the inquiry · called in PedTrial", duration: "1s" },
  { agent: "pedtrial", title: "Built the case card", tool: "build_case_card", result: `${TRIAL_CASE_CARD.length} fields, each cited` },
  { agent: "pedtrial", title: "Estimated the matching run", tool: "find_trials", result: `${TRIAL_ESTIMATE.cost} · approved` },
  { agent: "pedtrial", title: `Matched ${TRIAL_STATS.trials_assessed} trials`, tool: "find_trials", result: `${TRIAL_RANKED.length} ranked · ${TRIAL_EXCLUDED.length} excluded`, duration: TRIAL_RUN_TIME },
  { agent: "pedtrial", title: "Wrote the MTB trial summary", tool: "write_mtb_trial_summary", result: "No flags" },
  { agent: "pedtrial", title: "Drafted an inquiry", tool: "draft_inquiry", result: "Draft only · not sent", status: "warning" },
];

const TRIAL_VISUALS = [
  { id: "card", label: "Case card", icon: <ClipboardList /> },
  { id: "trials", label: "Ranked trials", icon: <ListOrdered /> },
  { id: "mtb", label: "MTB summary", icon: <FileText /> },
  { id: "sites", label: "Contact a site", icon: <Building2 /> },
  { id: "draft", label: "Inquiry draft", icon: <Mail /> },
  { id: "guardrails", label: "Guardrails", icon: <ShieldCheck /> },
  { id: "trace", label: "How it was made", icon: <Route /> },
];

function TrialSidebar() {
  return <Sidebar space="Trial matching" />;
}

type Step = [ChainOfThoughtStatus, string, string?];

function PedTrialRun({
  status,
  statusLabel,
  title,
  steps,
  progress,
  actions,
}: {
  status: AgentRunStatus;
  statusLabel?: string;
  title: string;
  steps: Step[];
  progress?: string;
  actions?: React.ReactNode;
}) {
  return (
    <AgentRunCard
      avatar={<PedTrialAvatar size={32} />}
      name="PedTrial"
      role="Trial-matching Expert"
      status={status}
      statusLabel={statusLabel}
      title={title}
      progress={progress}
      actions={actions}
    >
      <ChainOfThoughtSteps>
        {steps.map(([st, text, tool]) => (
          <ChainOfThoughtStep key={text} status={st} tool={tool}>
            {text}
          </ChainOfThoughtStep>
        ))}
      </ChainOfThoughtSteps>
    </AgentRunCard>
  );
}

function ZakTurn({ n, kind, handoff, children }: { n: number; kind: string; handoff?: string; children: React.ReactNode }) {
  return (
    <ChatMessage avatar={<ZakAvatar size={20} />} author="Zak" authorRole={`turn ${n} · ${kind}`} showAuthor>
      {handoff ? <ChatHandoff>{handoff}</ChatHandoff> : null}
      {children}
    </ChatMessage>
  );
}

function TrialChat({ stage, onClose }: { stage: "intake" | "done"; onClose: () => void }) {
  const phrases = stage === "done" ? TRIAL_PHRASES : undefined;
  return (
    <ChatPanel
      title={TRIAL_TITLE}
      onMinimize={onClose}
      onClose={onClose}
      composer={
        <PromptInput
          placeholder="Ask a follow-up, or @mention a specialist…"
          onAdd={() => {}}
          actions={<PromptInputChip icon={<Database />}>ClinicalTrials.gov</PromptInputChip>}
        />
      }
    >
      <ChatMessage role="user">
        <HighlightedText text={T[0]} phrases={phrases} />
      </ChatMessage>
      <ZakTurn n={1} kind="Case intake" handoff="Zak opened the inquiry and called in PedTrial">
        <PedTrialRun
          status={stage === "intake" ? "needs-input" : "done"}
          title={`Extracted ${TRIAL_FIRST_FIELDS} fields from your words · 1 key fact missing`}
          steps={[
            ["done", "Confirmed the case is synthetic"],
            ["done", "Privacy guard · no identifiers found", "rules"],
            ["done", `Extracted ${TRIAL_FIRST_FIELDS} fields, each traced to a phrase`, "build_case_card"],
            [stage === "intake" ? "active" : "done", "Asked for age"],
            [stage === "intake" ? "pending" : "done", "Hand back to Zak"],
          ]}
          progress={stage === "intake" ? "Waiting on Alicia" : "Answered by Alicia"}
        />
        {paras(T[1])}
      </ZakTurn>
      {stage === "done" ? (
        <>
          <ChatMessage role="user">
            <HighlightedText text={T[2]} phrases={phrases} />
          </ChatMessage>
          <ZakTurn n={2} kind="Case card">
            <PedTrialRun
              status="done"
              title={`Case card complete · ${TRIAL_CASE_CARD.length} fields · matching estimate ready`}
              steps={[
                ["done", `Rebuilt the case card · ${TRIAL_CASE_CARD.length} fields traced to your words`, "build_case_card"],
                ["done", `Shortlisted ${TRIAL_ESTIMATE.trials} of ${TRIAL_STATS.corpus} trials · rules only`, "find_trials"],
                ["done", `Estimated ${TRIAL_ESTIMATE.cost} · ${TRIAL_ESTIMATE.minutes} min`, "find_trials"],
              ]}
              progress="Approved by Alicia"
            />
          </ZakTurn>
          <ChatMessage role="user">{T[4]}</ChatMessage>
          <ZakTurn n={3} kind="Trial matching" handoff="Zak handed the case card to PedTrial">
            <PedTrialRun
              status="done"
              title={`${TRIAL_STATS.trials_assessed} trials assessed · ${TRIAL_STATS.criteria_assessed} criteria · 4 trials at a time`}
              steps={[
                ["done", `Topped up the corpus · ${TRIAL_STATS.corpus} trials, AU/NZ sites`, `BioMCP ${TRIAL_STATS.biomcp}`],
                ["done", "Linked H3 K27M to dordaviprone / ONC201", "drug-target data"],
                ["done", `Assessed ${TRIAL_STATS.criteria_assessed} criteria across ${TRIAL_STATS.trials_assessed} trials`, "TrialGPT method"],
                ["done", `Ranked ${TRIAL_RANKED.length} · excluded ${TRIAL_EXCLUDED.length} with reasons`, "rules"],
              ]}
              progress={`Worked for ${TRIAL_RUN_TIME}`}
            />
            <ClaimList
              items={[
                { text: `${TRIAL_RANKED.length} trials ranked; 2 directly target H3 K27M`, tag: "unverified" },
                { text: `Criterion readings checked against ${TRIAL_STATS.criteria_assessed} case-card citations, not against clinicians`, tag: "no ground truth" },
              ]}
            />
            {paras(T[5])}
          </ZakTurn>
          <ChatMessage role="user">{T[10]}</ChatMessage>
          <ZakTurn n={5} kind="MTB report" handoff="Zak called in PedTrial for the trial section of the MTB report">
            <PedTrialRun
              status="done"
              title={`Trial section of the MTB report · ${TRIAL_MTB.words} words · no flags`}
              steps={[
                ["done", `Re-assessed ${TRIAL_MTB.recheck.criteria} criteria on the relapse card · cached`, "TrialGPT method"],
                ["done", "Wrote the paragraph from the facts only", "write_mtb_trial_summary"],
                ["done", "Checked NCT IDs, drugs, numbers and wording", "rules"],
              ]}
              actions={
                <Button size="sm" variant="subtle">
                  Download .md
                </Button>
              }
              progress="Options for discussion"
            />
            {paras(T[13])}
          </ZakTurn>
          <ChatMessage role="user">{T[6]}</ChatMessage>
          <ZakTurn n={6} kind="Inquiry draft">
            <PedTrialRun
              status="done"
              title="One draft · Sydney Children's Hospital · not sent"
              steps={[
                ["done", "Chose the recipient · site contact with email", "list_sites"],
                ["done", "Built the summary from the case card", "rules"],
                ["done", "Phrased 2 questions · quoted I9, I10 and I7", "draft_inquiry"],
                ["done", "Saved as a draft · nothing was sent"],
              ]}
              progress="Revised by Alicia"
            />
            {paras(T[7])}
          </ZakTurn>
          <ChatMessage role="user">{T[8]}</ChatMessage>
          <ZakTurn n={7} kind="Revision">
            <PedTrialRun
              status="done"
              title="Draft revised · 1 question · 3 criteria quoted · not sent"
              steps={[
                ["done", "Revised the questions", "revise_draft"],
                ["done", "Facts check · nothing to flag", "rules"],
                ["done", "Saved as a draft · nothing was sent"],
              ]}
              progress="Waiting on Alicia to send it herself"
            />
            {paras(T[9])}
          </ZakTurn>
        </>
      ) : null}
    </ChatPanel>
  );
}

function TrialShell({ stage, children }: { stage: "intake" | "done"; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <WorkspaceLayout
      sidebar={<TrialSidebar />}
      panelOpen={open}
      panel={<TrialChat stage={stage} onClose={() => setOpen(false)} />}
      storageKey="zak-chat-panel-width"
    >
      {children}
    </WorkspaceLayout>
  );
}

function TrialSites() {
  const [picked, setPicked] = useState<string[]>(["s0"]);
  return (
    <CanvasVisual
      id="sites"
      title="Contact a site"
      subtitle={`${TRIAL_FOCUS.nct} · ${TRIAL_SITES.length} AU/NZ sites. The recipient comes from the registry: a PI with an email first, then the site contact, then the trial's central contact.`}
    >
      <RecipientPicker sites={TRIAL_SITES} value={picked} onChange={setPicked} question={TRIAL_QUESTION} />
    </CanvasVisual>
  );
}

function TrialMatchingCanvas() {
  const focus = TRIAL_RANKED[0];
  const [draft2, draft1] = [TRIAL_DRAFTS[1], TRIAL_DRAFTS[0]];
  return (
    <Canvas>
      <CanvasQuestion
        meta={<RunSummary agents={["zak", "pedtrial"]}>Turns 1–7 · 10 tool calls</RunSummary>}
        context={<>Synthetic case · confirmed by the user · {TRIAL_SRC}</>}
      >
        {T[0]}
      </CanvasQuestion>
      <CanvasVerdict
        status="Readings unverified"
        statusNote="Trial options for discussion, not a recommendation"
        title={`${TRIAL_RANKED.length} trials ranked · 2 directly target H3 K27M`}
        path={["Recruiting · AU/NZ · under 18", `${TRIAL_ESTIMATE.trials} of ${TRIAL_STATS.corpus} shortlisted`, `${TRIAL_RANKED.length} ranked`]}
        tags={
          <>
            <CanvasIdTag label="Source">{TRIAL_SRC}</CanvasIdTag>
            <CanvasIdTag label="Model">{TRIAL_STATS.model}</CanvasIdTag>
          </>
        }
        actions={
          <>
            <Button variant="outline" size="sm">
              Download .md
            </Button>
            <Button size="sm">Add to MTB report</Button>
          </>
        }
      />
      <CanvasStats variant="cards">
        <CanvasStat label="Shortlisted by rules" value={`${TRIAL_ESTIMATE.trials} of ${TRIAL_STATS.corpus}`} mono note="recruiting, AU/NZ site, under 18" />
        <CanvasStat label="Criteria assessed" value={String(TRIAL_STATS.criteria_assessed)} mono note={`across ${TRIAL_STATS.trials_assessed} trials · each cites the case card`} />
        <CanvasStat label="Direct molecular match" value="2" mono note="ONC201 → H3-3A K27M" />
        <CanvasStat label="Matching run" value={TRIAL_RUN_TIME} mono note={`estimated ${TRIAL_ESTIMATE.cost} · approved first`} />
      </CanvasStats>
      <CanvasVisuals visuals={TRIAL_VISUALS} defaultVisible={["card", "trials", "mtb", "sites", "draft", "guardrails"]}>
        <CanvasVisual
          id="card"
          span="full"
          title="Case card"
          subtitle={`Turn 2 · ${TRIAL_CASE_CARD.length} fields. Each value keeps the phrase it came from; anything not backed by your words is dropped. The phrases are highlighted in the chat.`}
        >
          <ProvenanceTable rows={TRIAL_CASE_CARD} />
        </CanvasVisual>
        <CanvasVisual
          id="trials"
          span="full"
          title="Ranked trials"
          subtitle={`Turn 3 · ${TRIAL_RANKED.length} ranked, ${TRIAL_EXCLUDED.length} excluded. A trial is excluded if any criterion fails; the rest are ranked by molecular match, then by the fewest unknowns.`}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <TrialList>
              {TRIAL_RANKED.map((t) => (
                <TrialCard
                  key={t.nct}
                  rank={t.rank}
                  title={t.title}
                  nct={t.nct}
                  phase={t.phase}
                  inclusion={t.inclusion}
                  match={t.match}
                  unknown={t.unknown}
                  focus={t.nct === focus.nct}
                >
                  {t.nct === TRIAL_FOCUS.nct ? (
                    <CriterionTable
                      criteria={TRIAL_CRITERIA}
                      initialCount={8}
                      footnote={`Readings unverified · ${TRIAL_SRC} · ${TRIAL_STATS.model}`}
                    />
                  ) : undefined}
                </TrialCard>
              ))}
            </TrialList>
            <ExcludedTrials items={TRIAL_EXCLUDED} />
          </div>
        </CanvasVisual>
        <CanvasVisual
          id="mtb"
          span="full"
          title="MTB trial summary"
          subtitle="Turns 4–5 · with relapse options. Written only from facts built by rules; a check flags NCT IDs, drugs and numbers not in those facts."
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <AlertBanner color="info" title="Trial options for discussion">
              Not a clinical recommendation. The paragraph is editable, and Download .md saves it with its references.
            </AlertBanner>
            <ReportExcerpt editable assumption={TRIAL_MTB.assumption} references={TRIAL_MTB.references}>
              {TRIAL_MTB.paragraph}
            </ReportExcerpt>
            <ScenarioTable rows={TRIAL_SCENARIO} />
          </div>
        </CanvasVisual>
        <TrialSites />
        <CanvasVisual id="guardrails" title="Guardrails" subtitle="What PedTrial guarantees, and what it does not">
          <GuardrailList items={TRIAL_GUARDRAILS} />
        </CanvasVisual>
        <CanvasVisual id="draft" span="full" title="Inquiry draft" subtitle={`Turn 7 · draft 2 replaces draft 1. ${TRIAL_REVISE_NOTE}`}>
          <DraftEmail
            to={`${draft2.to.name} <${draft2.to.email}> · ${draft2.to.facility}`}
            subject={draft2.subject}
            flags={draft2.flags}
            body={draft2.body}
            previousBody={draft1.body}
          />
        </CanvasVisual>
        <CanvasVisual id="trace" span="full" title="How this answer was made" subtitle="Each step, the agent that ran it, the tool it used and what came out">
          <RunTrace steps={TRIAL_STEPS} />
        </CanvasVisual>
      </CanvasVisuals>
      <CanvasSources rows={TRIAL_SOURCES_ROWS} disclaimer={TRIAL_DISCLAIMER} />
    </Canvas>
  );
}

/** PedTrial's answer (prototype "PedTrial in ZAK", after turn 7): ranked trials, the MTB summary, a site and an inquiry draft. */
export const TrialMatching: Story = {
  name: "Trial matching · PedTrial",
  render: () => (
    <TrialShell stage="done">
      <TrialMatchingCanvas />
    </TrialShell>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const toggle = c.getByRole("button", { name: "Guardrails" });
    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(toggle);
  },
};

/** Turn 1: PedTrial will not guess a key fact. The canvas shows what it has, and the one slot it is waiting on. */
export const TrialMatchingIntake: Story = {
  name: "Trial matching · needs input",
  render: () => (
    <TrialShell stage="intake">
      <Canvas>
        <CanvasQuestion meta={<RunSummary agents={["zak", "pedtrial"]}>Turn 1 · 2 tool calls</RunSummary>}>{T[0]}</CanvasQuestion>
        <CanvasVerdict
          status="Needs input"
          statusVariant="primary"
          statusNote="PedTrial asks rather than guesses"
          title="One key fact is missing: her age"
        />
        <CanvasVisuals
          visuals={[
            { id: "missing", label: "Missing facts", icon: <CircleHelp /> },
            { id: "card", label: "Case card so far", icon: <ClipboardList /> },
          ]}
        >
          <CanvasVisual id="missing" span="full" title="Missing facts" subtitle="Turn 1 · needs input">
            <MissingFacts fields={TRIAL_MISSING} optional={TRIAL_HELPFUL.join("; ")}>
              The age was not in your description. Matching needs it — most paediatric trials gate on it — so PedTrial asks
              rather than guesses.
            </MissingFacts>
          </CanvasVisual>
          <CanvasVisual
            id="card"
            span="full"
            title="Case card so far"
            subtitle={`${TRIAL_CARD_INTAKE.length} fields, each traced to a phrase you wrote`}
          >
            <ProvenanceTable rows={TRIAL_CARD_INTAKE} />
          </CanvasVisual>
        </CanvasVisuals>
      </Canvas>
    </TrialShell>
  ),
};

/* ── Parts ── */

function RealUmap({ level, title, model, n }: { level: "1" | "2"; title: string; model: string; n: string }) {
  const u = UMAPS[level];
  return (
    <div style={{ padding: 24, maxWidth: 960, background: "var(--insight-color-grey-10)" }}>
      <CanvasOutput
        title={title}
        subtitle={
          <>
            <code style={{ font: "12px var(--insight-font-family-mono)" }}>{model}</code> · {n} reference samples. Axes: x and y of
            the 3D UMAP embedding; colour: the child classifier whose UMAP includes the sample. Select a class to hide it.
          </>
        }
        actions={<CanvasOutputAction icon={<Download />} aria-label="Download UMAP" />}
      >
        <UmapPlot points={u.points} groups={u.groups} label={`UMAP of ${n} ${title} reference samples`} height={480} />
      </CanvasOutput>
    </div>
  );
}

/** Real embedding — methylation classifier, Level 1: paediatric cancer (2,155 reference samples). */
export const UmapLevel1: Story = {
  render: () => (
    <RealUmap level="1" title="Methylation classifier, level 1: paediatric cancer" model="methylation_paediatric_cancer_991cdeaf0d59 v4" n="2,155" />
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const cns = c.getByRole("button", { name: /Central nervous system/ });
    await userEvent.click(cns);
    await expect(cns).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(cns);
    await expect(cns).toHaveAttribute("aria-pressed", "true");
  },
};

/** Real embedding — methylation classifier, Level 2: haematological malignancy (602 reference samples). */
export const UmapLevel2: Story = {
  render: () => (
    <RealUmap
      level="2"
      title="Methylation classifier, level 2: haematological malignancy"
      model="methylation_haematological_malignancy_722a5cb1fb11 v4"
      n="602"
    />
  ),
};

/* ── ZAK mockup plots (ZAK_mockup_plots/*.svg), rebuilt with DS components ── */

function MockupFrame({ children }: { children: React.ReactNode }) {
  return <div style={{ padding: 24, maxWidth: 960, background: "var(--insight-color-grey-10)" }}>{children}</div>;
}

/** 1 · Case in the Level 3 reference cohort (2D UMAP). */
export const Mockup1UmapIndividualCase: Story = {
  name: "Mockup 1 · UMAP individual case",
  render: () => {
    const u = UMAPS["3"];
    return (
      <MockupFrame>
        <CanvasOutput
          title="Case in the Level 3 reference cohort (2D UMAP)"
          subtitle="Methylation · AML / MDS reference samples · example data for layout only"
        >
          <UmapPlot
            points={u.points}
            groups={u.groups}
            highlights={[{ id: "case", label: "CASE-0001", ...UMAP_LEVEL3_CASE, description: "this case" }]}
            legendExtra={<UmapCaseKey>This case (CASE-0001)</UmapCaseKey>}
            label="UMAP of the Level 3 AML / MDS reference cohort with CASE-0001"
            height={420}
          />
        </CanvasOutput>
      </MockupFrame>
    );
  },
};

/** 2 · Top classes at Level 3 — bars take the UMAP class colours. */
export const Mockup2TopClasses: Story = {
  name: "Mockup 2 · Top classes",
  render: () => (
    <MockupFrame>
      <CanvasOutput
        title="Top classes at Level 3 (CASE-0001)"
        subtitle="Methylation classifier; probabilities sum to 1 · example data for layout only"
      >
        <RankedBars max={1} items={TOP_CLASSES} />
      </CanvasOutput>
    </MockupFrame>
  ),
};

/** 3 · Prediction by taxonomy level — methylation and expression side by side. */
export const Mockup3ProbabilityByLevel: Story = {
  name: "Mockup 3 · Probability by level",
  render: () => (
    <MockupFrame>
      <CanvasOutput
        title="Prediction by taxonomy level (CASE-0001)"
        subtitle="Same class predicted by both modalities at every level · example data for layout only"
      >
        <LevelChart />
      </CanvasOutput>
    </MockupFrame>
  ),
};

/** 4 · Patient set in the AML / MDS reference cohort — grey reference, labelled clusters, C1–C4. */
export const Mockup4UmapPatientSet: Story = {
  name: "Mockup 4 · UMAP patient set",
  render: () => (
    <MockupFrame>
      <CanvasOutput
        title="Patient set in the AML / MDS reference cohort (2D UMAP)"
        subtitle="Methylation · C1–C4 as in the results table; C5 not shown (not classified) · example data for layout only"
      >
        <UmapPlot
          points={UMAP_PATIENT_SET as UmapPoint[]}
          groups={SET_GROUPS}
          highlights={SET_HIGHLIGHTS}
          classLegend={false}
          legendExtra={
            <>
              <UmapSwatchKey color="var(--insight-color-grey-60)">Reference samples (labelled by WHO-HAEM5 entity)</UmapSwatchKey>
              <UmapCaseKey>Patient in the set (C1–C4)</UmapCaseKey>
            </>
          }
          label="UMAP of the AML / MDS methylation reference with patients C1 to C4"
          height={420}
        />
      </CanvasOutput>
    </MockupFrame>
  ),
};

/** 5 · Mapped WHO-HAEM5 entities for the patient set (n = 5). */
export const Mockup5WhoEntities: Story = {
  name: "Mockup 5 · WHO entities",
  render: () => (
    <MockupFrame>
      <CanvasOutput
        title="Mapped WHO-HAEM5 entities (patient set, n = 5)"
        subtitle="From taxonomy mapping of the classifier results · example data for layout only"
      >
        <RankedBars
          max={5}
          items={WHO_ENTITIES}
          footnote="Not classified = blocked by a constraint, shown so the denominator stays honest."
        />
      </CanvasOutput>
    </MockupFrame>
  ),
};
