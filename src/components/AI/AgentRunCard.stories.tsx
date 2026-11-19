import type { ComponentType, ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Brain, FileText, Network, Route, Workflow } from "lucide-react";
import { Button } from "../Button/Button";
import { Section, Stage } from "../../storybook/StoryLayout";
import { JanetAvatar, KarlAvatar, PedTrialAvatar, SidneyAvatar, WilliamAvatar, ZakAvatar } from "../../storybook/aiAgents";
import type { AgentAvatarSize } from "./AgentAvatar";
import { AGENT_RUN_STATUS, AgentRunCard, AgentRunDetail, AgentRunStatusBadge } from "./AgentRunCard";
import type { AgentRunStatus } from "./AgentRunCard";
import { ChainOfThought, ChainOfThoughtNote, ChainOfThoughtStep, ChainOfThoughtSteps } from "./ChainOfThought";
import type { ChainOfThoughtStatus } from "./ChainOfThought";
import { ChatAgentChip, ChatMessageMeta } from "./ChatMessage";
import { SourceIcon, SourceStack } from "./WorkspacePanel";

const AGENTS: Record<string, { avatar: ComponentType<{ size?: AgentAvatarSize }>; role: string }> = {
  Sidney: { avatar: SidneyAvatar, role: "Cohort Expert" },
  Zak: { avatar: ZakAvatar, role: "Conductor" },
  Karl: { avatar: KarlAvatar, role: "Literature Expert" },
  Janet: { avatar: JanetAvatar, role: "Variant Expert" },
  William: { avatar: WilliamAvatar, role: "Case & patient Expert" },
  PedTrial: { avatar: PedTrialAvatar, role: "Trial-matching Expert" },
};

const STATUSES = Object.keys(AGENT_RUN_STATUS) as AgentRunStatus[];

const TOOLS = (
  <SourceStack layout="overlap">
    {[
      [<Brain key="b" />, "PKB · active assertions"],
      [<Network key="n" />, "Insights · ZERO cohort"],
      [<Route key="r" />, "Variant pathways"],
      [<Workflow key="w" />, "Case workflow"],
      [<FileText key="f" />, "Literature"],
    ].map(([icon, label]) => (
      <SourceIcon key={label as string} bare icon={icon} label={label as string} />
    ))}
  </SourceStack>
);

const sub = (label: string) => (
  <Button size="sm" variant="subtle">
    {label}
  </Button>
);

/** What each status shows by default in the Playground — mirrors the Figma cards. */
const PRESET: Record<
  AgentRunStatus,
  {
    title?: string;
    alert?: string;
    steps?: Array<[ChainOfThoughtStatus, string]>;
    summary?: string;
    detail?: { tone: "neutral" | "warning"; text: string; reference?: string };
    note?: string;
    meta?: string;
    actions: string[];
    progress?: string;
  }
> = {
  queued: {
    title: "Re-check adult-only evidence extrapolation",
    steps: [["pending", "Behind 2 tasks on the literature tool"], ["pending", "Search PubMed and bioRxiv"], ["pending", "Hand back to Zak"]],
    actions: ["Move to front", "Cancel"],
  },
  working: {
    summary: "Searching the data · Read 2 files · 5 tool calls",
    steps: [
      ["done", "Reading your question"],
      ["done", "Planned the step and checked it against the knowledge base"],
      ["done", "Queried Insights · Insights — ZERO cohort · GraphQL MCP"],
      ["active", "Read an authoritative overview of vision-language models and their architecture."],
      ["pending", "Hand back to Zak"],
    ],
    actions: ["Stop"],
    progress: "Step 4 of 5",
  },
  retrying: {
    title: "ZERO Insights timed out — trying again",
    summary: "Querying the cohort · attempt 2 of 3",
    steps: [["done", "Planned the query"], ["failed", "Attempt 1 timed out after 30s"], ["active", "Attempt 2"]],
    note: "Nothing is reported until an attempt completes. If the third fails, Sidney stops and says so.",
    actions: ["Stop"],
    progress: "Attempt 2 of 3",
  },
  stopped: {
    title: "You stopped this at step 3 of 5.",
    detail: {
      tone: "neutral",
      text: "Two of six patients were read before the stop. Two reads are not a cohort, so nothing from this run is written into the case.",
    },
    actions: ["Resume from step 3", "Discard the run"],
  },
  blocked: {
    alert: "This analysis did not run",
    detail: {
      tone: "warning",
      text: "The classifier is validated on haematological panels in patients aged 0–18. Three patients in this set were sequenced on a solid-tumour panel and fall outside that scope.",
      reference: "PKB-0061",
    },
    actions: ["Show them anyway", "View details"],
  },
  failed: {
    title: "ZERO Insights is unreachable",
    detail: {
      tone: "warning",
      text: "Outcome comparison across patients with different follow-up durations is censored comparison. Shorter follow-up understates late events.",
      reference: "PKB-0061",
    },
    meta: "Last successful query 14:02 · 38 minutes ago",
    actions: ["Try again", "Back later"],
  },
  "not-connected": {
    title: "Janet did not join this turn",
    detail: {
      tone: "warning",
      text: "The variant service did not answer in 30 seconds. Janet never came online, so nothing was read for the variant question — it is still open.",
    },
    actions: ["Try again", "Continue without Janet"],
  },
  "needs-input": {
    title: "Which diagnosis should the cohort be built from?",
    detail: {
      tone: "warning",
      text: "The recorded diagnosis and the classifier's differ for 3 of the 41 patients. The choice changes the denominator, so Zak will not pick for you.",
    },
    actions: ["Recorded diagnosis", "Molecular classifier", "Both"],
  },
  "under-review": {
    title: "The tumour board note is drafted and carries five assertions with the claims they qualify.",
    actions: ["Approve", "Send back"],
  },
  done: {
    title: "No patients match all three criteria.",
    steps: [["done", "AML · monosomy 7 · GATA2 variant — 0 of 41"]],
    note: "The query ran against the full snapshot and returned nothing. Dropping monosomy 7 returns 6 patients.",
    meta: "Worked for 1m 30s",
    actions: [],
  },
};

interface PlaygroundArgs {
  agent: keyof typeof AGENTS;
  status: AgentRunStatus;
  statusLabel?: string;
  showTitle: boolean;
  showAlert: boolean;
  showSteps: boolean;
  stepsOpen: boolean;
  showTools: boolean;
  showDetail: boolean;
  showNote: boolean;
  showMeta: boolean;
  showActions: boolean;
}

function renderCard(a: PlaygroundArgs) {
  const p = PRESET[a.status];
  const A = AGENTS[a.agent];
  const Avatar = A.avatar;
  const stepsList = p.steps ? (
    <ChainOfThoughtSteps>
      {p.steps.map(([s, t]) => (
        <ChainOfThoughtStep key={t} status={s}>
          {t}
        </ChainOfThoughtStep>
      ))}
    </ChainOfThoughtSteps>
  ) : null;
  const runStatus = a.status === "failed" ? "failed" : a.status === "done" ? "done" : "active";
  let body: ReactNode = null;
  if (a.showSteps && stepsList) {
    body = p.summary ? (
      <ChainOfThought
        key={String(a.stepsOpen)}
        summary={p.summary}
        status={runStatus}
        defaultOpen={a.stepsOpen}
        tools={a.showTools ? TOOLS : undefined}
      >
        {stepsList}
        {a.showNote && p.note ? <ChainOfThoughtNote>{p.note}</ChainOfThoughtNote> : null}
      </ChainOfThought>
    ) : (
      <>
        {stepsList}
        {a.showNote && p.note ? <ChainOfThoughtNote>{p.note}</ChainOfThoughtNote> : null}
      </>
    );
  } else if (a.showNote && p.note) {
    body = <ChainOfThoughtNote>{p.note}</ChainOfThoughtNote>;
  }
  return (
    <AgentRunCard
      avatar={<Avatar size={32} />}
      name={a.agent}
      role={A.role}
      status={a.status}
      statusLabel={a.statusLabel || undefined}
      title={a.showTitle ? p.title : undefined}
      alert={a.showAlert ? p.alert : undefined}
      meta={
        a.showMeta && p.meta ? (
          a.status === "done" ? (
            <ChatMessageMeta label={p.meta}>
              <ChatAgentChip avatar={<ZakAvatar size={20} shape="circle" />} name="ZAK" />
              <ChatAgentChip avatar={<SidneyAvatar size={20} shape="circle" />} name="Sidney" />
            </ChatMessageMeta>
          ) : (
            p.meta
          )
        ) : undefined
      }
      actions={a.showActions && p.actions.length ? <>{p.actions.map(sub)}</> : undefined}
      progress={a.showActions ? p.progress : undefined}
    >
      {body}
      {a.showDetail && p.detail ? (
        <AgentRunDetail tone={p.detail.tone} reference={p.detail.reference}>
          {p.detail.text}
        </AgentRunDetail>
      ) : null}
    </AgentRunCard>
  );
}

const meta: Meta<PlaygroundArgs> = {
  title: "AI/Agent Run Card",
  parameters: {
    docs: {
      description: {
        component:
          "One agent's run in a turn, in every state the ZAK prototype draws (Figma \"Agent states\"). `status` sets the badge: " +
          STATUSES.map((s) => `\`${s}\``).join(" · ") +
          ". Optional slots, top to bottom: `title` (bold line), `alert` (why it did not complete), children (a `ChainOfThought`, " +
          "`AgentRunDetail` well — neutral or warning, with a `PKB-…` reference — or a `ChainOfThoughtNote`), `meta`, then `actions` and `progress`. " +
          "In the Playground pick a status: each loads the Figma content for it, and every slot can be toggled.",
      },
    },
  },
  args: {
    agent: "Sidney",
    status: "working",
    statusLabel: "",
    showTitle: true,
    showAlert: true,
    showSteps: true,
    stepsOpen: true,
    showTools: true,
    showDetail: true,
    showNote: true,
    showMeta: true,
    showActions: true,
  },
  argTypes: {
    agent: { control: "inline-radio", options: Object.keys(AGENTS) },
    status: { control: "select", options: STATUSES },
    statusLabel: { control: "text", description: "Override the badge text (colour follows `status`)." },
    showTitle: { name: "title", control: "boolean" },
    showAlert: { name: "alert", control: "boolean" },
    showSteps: { name: "steps (ChainOfThought)", control: "boolean" },
    stepsOpen: { name: "steps open", control: "boolean", if: { arg: "showSteps" } },
    showTools: { name: "tool stack", control: "boolean", if: { arg: "showSteps" } },
    showDetail: { name: "detail well", control: "boolean" },
    showNote: { name: "warning note", control: "boolean" },
    showMeta: { name: "meta", control: "boolean" },
    showActions: { name: "actions + progress", control: "boolean" },
  },
  render: (args) => <div style={{ width: 680, maxWidth: "100%" }}>{renderCard(args)}</div>,
};
export default meta;

type Story = StoryObj<PlaygroundArgs>;

/** Pick a status — the card loads that state's Figma content; toggle any slot. */
export const Playground: Story = {};

/** Every status with its default content. */
export const AllStates: Story = {
  parameters: { controls: { disable: true } },
  render: () => {
    const agentFor: Record<AgentRunStatus, keyof typeof AGENTS> = {
      queued: "Karl",
      working: "Sidney",
      retrying: "Sidney",
      stopped: "Janet",
      blocked: "William",
      failed: "Sidney",
      "not-connected": "Janet",
      "needs-input": "Zak",
      "under-review": "PedTrial",
      done: "Sidney",
    };
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(420px, 1fr))", gap: 24 }}>
        {STATUSES.map((s) => (
          <div key={s} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <code style={{ font: "11px var(--insight-font-family-mono)", color: "var(--insight-color-grey-100)" }}>
              status="{s}"
            </code>
            {renderCard({ ...meta.args!, agent: agentFor[s], status: s } as PlaygroundArgs)}
          </div>
        ))}
      </div>
    );
  },
};

/** The Figma cards that compose more than one slot. */
export const FromFigma: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Stage column gap={24} style={{ width: 680, maxWidth: "100%" }}>
      <AgentRunCard
        avatar={<PedTrialAvatar size={32} />}
        name="PedTrial"
        role="Trial-matching Expert"
        status="under-review"
        statusLabel="Needs approval"
        title="Case card complete · 18 fields · matching estimate ready"
        actions={
          <>
            <Button size="sm" variant="bold">
              Run matching
            </Button>
            {sub("Not now")}
          </>
        }
        progress="Waiting on Alicia"
      >
        <ChainOfThoughtSteps>
          <ChainOfThoughtStep tool="build_case_card">Rebuilt the case card · 18 fields traced to your words</ChainOfThoughtStep>
          <ChainOfThoughtStep tool="find_trials">Shortlisted 14 of 44 trials · rules only</ChainOfThoughtStep>
          <ChainOfThoughtStep tool="find_trials">Estimated US$0.70 · 4–7 min</ChainOfThoughtStep>
        </ChainOfThoughtSteps>
      </AgentRunCard>
      <AgentRunCard
        avatar={<PedTrialAvatar size={32} />}
        name="PedTrial"
        role="Trial-matching Expert"
        status="done"
        title="Draft saved · 1 question · not sent"
        progress="Waiting on Alicia to send it herself"
      >
        <ChainOfThoughtSteps>
          <ChainOfThoughtStep tool="revise_draft">Revised the questions</ChainOfThoughtStep>
          <ChainOfThoughtStep tool="rules">Facts check · nothing to flag</ChainOfThoughtStep>
          <ChainOfThoughtStep>Saved as a draft · nothing was sent</ChainOfThoughtStep>
        </ChainOfThoughtSteps>
        <ChainOfThoughtNote>Draft only. PedTrial cannot send email: review it, download it, and send it yourself.</ChainOfThoughtNote>
      </AgentRunCard>
      <AgentRunCard
        avatar={<KarlAvatar size={32} />}
        name="Karl"
        role="Literature Expert"
        status="failed"
        title="Searching PubMed and bioRxiv"
        actions={<>{["Try again", "Narrow it", "Skip"].map(sub)}</>}
      >
        <ChainOfThought summary="Read the data · 6 cases · 5 tool calls" status="failed" tools={TOOLS}>
          <ChainOfThoughtSteps>
            <ChainOfThoughtStep>Searched the +9.5 enhancer as a region</ChainOfThoughtStep>
            <ChainOfThoughtStep>Matching hits against Janet’s four variants</ChainOfThoughtStep>
            <ChainOfThoughtStep status="failed">Qualifying the population each paper drew on</ChainOfThoughtStep>
            <ChainOfThoughtStep status="pending">Hand back to Zak</ChainOfThoughtStep>
          </ChainOfThoughtSteps>
          <ChainOfThoughtNote>
            Nothing is reported until an attempt completes. If the third fails, Karl stops and says so.
          </ChainOfThoughtNote>
        </ChainOfThought>
      </AgentRunCard>
      <AgentRunCard
        avatar={<WilliamAvatar size={32} />}
        name="William"
        role="Case & patient Expert"
        status="blocked"
        alert="2 of 6 patients sit outside your data access."
        actions={<>{["Request access", "Continue run"].map(sub)}</>}
      >
        <AgentRunDetail tone="warning" footnote="Access is granted by the site data custodian · usually 1–2 days">
          Outcome records for ZC-0418 and ZC-0902 are held by another site. William read the four you can see and
          stopped there rather than returning a partial set as a whole one.
        </AgentRunDetail>
      </AgentRunCard>
      <AgentRunCard
        avatar={<WilliamAvatar size={32} />}
        name="William"
        role="Case & patient Expert"
        status="blocked"
        alert="This analysis did not run"
        actions={sub("Run it over the three patients in scope")}
      >
        <AgentRunDetail
          tone="warning"
          reference="PKB-0017"
          footnote="Please open the assertion to see the evidence behind it, or disagree with it"
        >
          ZERO-04358 was sequenced on a solid tumour panel. The classifier is validated on haematological panels only.
        </AgentRunDetail>
      </AgentRunCard>
      <AgentRunCard
        avatar={<ZakAvatar size={32} />}
        name="Zak"
        role="Conductor"
        status="working"
        actions={<>{["Run the turn with Janet", "Keep what ran"].map(sub)}</>}
      >
        <ChainOfThought summary="Three of four specialists joined.">
          <ChainOfThoughtSteps>
            <ChainOfThoughtStep>Sidney · joined</ChainOfThoughtStep>
            <ChainOfThoughtStep>William · joined</ChainOfThoughtStep>
            <ChainOfThoughtStep>Karl · joined</ChainOfThoughtStep>
            <ChainOfThoughtStep status="failed">Janet · did not connect</ChainOfThoughtStep>
          </ChainOfThoughtSteps>
          <ChainOfThoughtNote>
            Without Janet, nothing in this turn speaks to whether the variants are classified. Treat the cohort and case
            work as complete and the variant question as unasked.
          </ChainOfThoughtNote>
        </ChainOfThought>
      </AgentRunCard>
    </Stage>
  ),
};

/** The status badge alone. */
export const StatusBadges: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Section title="AgentRunStatusBadge">
      <Stage gap={12}>
        {STATUSES.map((s) => (
          <AgentRunStatusBadge key={s} status={s} />
        ))}
      </Stage>
    </Section>
  ),
};
