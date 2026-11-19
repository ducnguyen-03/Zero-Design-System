import type { HTMLAttributes, ReactNode } from "react";
import { CircleAlert } from "lucide-react";
import { ChatAgentCard, ChatAgentHeader } from "./ChatAgent";
import styles from "./AgentRunCard.module.css";

const cx = (...parts: Array<string | false | undefined>) => parts.filter(Boolean).join(" ");

/**
 * Lifecycle of one agent's run in a turn (Figma "Agent states"):
 * - `queued` — accepted, not started · `working` — running · `retrying` — transient fault, trying again
 * - `stopped` — stopped by the user · `blocked` — a constraint (assertion, access) stopped it
 * - `failed` — a source was unreachable · `not-connected` — the agent never joined
 * - `needs-input` — waiting on a decision · `under-review` — output waits for approval · `done`
 */
export type AgentRunStatus =
  | "queued"
  | "working"
  | "retrying"
  | "stopped"
  | "blocked"
  | "failed"
  | "not-connected"
  | "needs-input"
  | "under-review"
  | "done";

export type AgentRunTone = "info" | "neutral" | "warning" | "danger" | "attention" | "success";

export const AGENT_RUN_STATUS: Record<AgentRunStatus, { label: string; tone: AgentRunTone }> = {
  queued: { label: "Queue", tone: "neutral" },
  working: { label: "In progress", tone: "info" },
  retrying: { label: "Retrying", tone: "warning" },
  stopped: { label: "Stopped", tone: "neutral" },
  blocked: { label: "Block", tone: "warning" },
  failed: { label: "Failed", tone: "danger" },
  "not-connected": { label: "Not connect", tone: "warning" },
  "needs-input": { label: "Needs input", tone: "attention" },
  "under-review": { label: "Under review", tone: "warning" },
  done: { label: "Done", tone: "success" },
};

export interface AgentRunStatusBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  status: AgentRunStatus;
  /** Override the label (keeps the status colour). */
  label?: string;
}

/** The uppercase status tag at the top-right of a run card. */
export function AgentRunStatusBadge({ status, label, className, ...rest }: AgentRunStatusBadgeProps) {
  const s = AGENT_RUN_STATUS[status];
  return (
    <span className={cx(styles.badge, styles[`tone-${s.tone}`], className)} {...rest}>
      {label ?? s.label}
    </span>
  );
}

export interface AgentRunCardProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  /** A 32px `AgentAvatar`. */
  avatar: ReactNode;
  name: string;
  role?: string;
  status: AgentRunStatus;
  /** Override the badge label, e.g. "Block" → "Blocked". */
  statusLabel?: string;
  /** Bold first line — what the run is about ("Searching PubMed and bioRxiv", "You stopped this at step 3 of 5."). */
  title?: ReactNode;
  /** Red / orange line with an alert icon — why the run did not complete ("This analysis did not run"). */
  alert?: ReactNode;
  /** The run's working — a `ChainOfThought`, an `AgentRunDetail`, a `ChainOfThoughtNote`… */
  children?: ReactNode;
  /** Grey line under the body ("Last successful query 14:02 · 38 minutes ago") or a `ChatMessageMeta`. */
  meta?: ReactNode;
  /** Buttons for what the user can do next. */
  actions?: ReactNode;
  /** Plain progress text after the actions, e.g. "Step 4 of 5". */
  progress?: ReactNode;
}

/**
 * One agent's run, in every state the ZAK prototype draws: header (avatar · name · role · status),
 * optional title and alert, the run's working, meta, and the next actions.
 */
export function AgentRunCard({
  avatar,
  name,
  role,
  status,
  statusLabel,
  title,
  alert,
  children,
  meta,
  actions,
  progress,
  className,
  ...rest
}: AgentRunCardProps) {
  const tone = AGENT_RUN_STATUS[status].tone;
  return (
    <ChatAgentCard
      className={cx(styles.card, className)}
      data-status={status}
      header={
        <ChatAgentHeader
          avatar={avatar}
          name={name}
          role={role}
          status={<AgentRunStatusBadge status={status} label={statusLabel} />}
        />
      }
      actions={
        actions || progress ? (
          <>
            {actions}
            {progress ? <span className={styles.progress}>{progress}</span> : null}
          </>
        ) : undefined
      }
      {...rest}
    >
      {title ? <p className={styles.title}>{title}</p> : null}
      {alert ? (
        <p className={cx(styles.alert, tone === "danger" && styles.alertDanger)}>
          <CircleAlert aria-hidden="true" />
          <span>{alert}</span>
        </p>
      ) : null}
      {children}
      {meta ? <div className={styles.meta}>{meta}</div> : null}
    </ChatAgentCard>
  );
}

export interface AgentRunDetailProps extends HTMLAttributes<HTMLDivElement> {
  /** `neutral` = grey well (what happened); `warning` = orange well (why it stopped). */
  tone?: "neutral" | "warning";
  /** Knowledge-base reference shown under the text, e.g. "PKB-0061". */
  reference?: string;
  /** Extra line after the reference ("Access is granted by the site data custodian · usually 1–2 days"). */
  footnote?: ReactNode;
  children: ReactNode;
}

/** The explanation well inside a run card. */
export function AgentRunDetail({
  tone = "neutral",
  reference,
  footnote,
  children,
  className,
  ...rest
}: AgentRunDetailProps) {
  return (
    <div className={cx(styles.detail, tone === "warning" && styles.detailWarning, className)} {...rest}>
      <div>{children}</div>
      {reference ? <span className={styles.reference}>{reference}</span> : null}
      {footnote ? <div>{footnote}</div> : null}
    </div>
  );
}
