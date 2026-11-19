import { useId, useState } from "react";
import type { HTMLAttributes, LiHTMLAttributes, ReactNode } from "react";
import { ChevronDown, CircleAlert, CircleCheck, CircleX, LoaderCircle } from "lucide-react";
import styles from "./ChainOfThought.module.css";

const cx = (...parts: Array<string | false | undefined>) => parts.filter(Boolean).join(" ");

/** `done` ✓ green · `active` spinning · `pending` dimmed · `failed` ✕ red. */
export type ChainOfThoughtStatus = "done" | "active" | "pending" | "failed";

const STATUS_TEXT: Record<ChainOfThoughtStatus, string> = {
  done: "Done",
  active: "In progress",
  pending: "Not started",
  failed: "Failed",
};

function StatusIcon({ status }: { status: ChainOfThoughtStatus }) {
  if (status === "done") return <CircleCheck className={styles.iconDone} aria-hidden="true" />;
  if (status === "failed") return <CircleX className={styles.iconFailed} aria-hidden="true" />;
  return (
    <LoaderCircle
      className={cx(styles.iconLoader, status === "active" && styles.spin)}
      aria-hidden="true"
    />
  );
}

/* ─────────────────────────── Steps (collapsible) ─────────────────────────── */

export interface ChainOfThoughtProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** One-line summary of the run, e.g. "Searching the data · Read 2 files · 5 tool calls". */
  summary: ReactNode;
  /** Drives the summary icon. Defaults to `active`. */
  status?: Exclude<ChainOfThoughtStatus, "pending">;
  /** Right-aligned slot beside the summary — e.g. the stack of tools the agent can call. */
  tools?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** A `ChainOfThoughtSteps` list of `ChainOfThoughtStep`s, optionally followed by a `ChainOfThoughtNote`. */
  children: ReactNode;
}

/**
 * An agent's reasoning as an ordered list of steps under a one-line summary
 * (ZAK "Working" card). The summary toggles the step list.
 */
export function ChainOfThought({
  summary,
  status = "active",
  tools,
  open: openProp,
  defaultOpen = true,
  onOpenChange,
  children,
  className,
  ...rest
}: ChainOfThoughtProps) {
  const [inner, setInner] = useState(defaultOpen);
  const open = openProp ?? inner;
  const panelId = useId();
  const toggle = () => {
    if (openProp === undefined) setInner(!open);
    onOpenChange?.(!open);
  };

  return (
    <div className={cx(styles.root, className)} {...rest}>
      <div className={styles.summaryRow}>
        <button
          type="button"
          className={styles.summary}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={toggle}
        >
          <StatusIcon status={status} />
          <span className={styles.summaryText}>{summary}</span>
          <ChevronDown className={cx(styles.chevron, open && styles.chevronOpen)} aria-hidden="true" />
        </button>
        {tools ? <div className={styles.tools}>{tools}</div> : null}
      </div>
      <div id={panelId} className={styles.panel} hidden={!open}>
        {children}
      </div>
    </div>
  );
}

export interface ChainOfThoughtStepsProps extends HTMLAttributes<HTMLOListElement> {
  children: ReactNode;
}

/** The grey step panel. `ChainOfThought` renders its children inside one; use this directly for a static list. */
export function ChainOfThoughtSteps({ className, ...rest }: ChainOfThoughtStepsProps) {
  return <ol className={cx(styles.steps, className)} {...rest} />;
}

export interface ChainOfThoughtStepProps extends LiHTMLAttributes<HTMLLIElement> {
  status?: ChainOfThoughtStatus;
  /** The tool or rule set the step used, right-aligned in mono — e.g. `build_case_card`, `rules`. */
  tool?: ReactNode;
  children: ReactNode;
}

/** One step: status icon + 12px label. The active step reads darker; pending steps sit at 50%. */
export function ChainOfThoughtStep({
  status = "done",
  tool,
  children,
  className,
  ...rest
}: ChainOfThoughtStepProps) {
  return (
    <li
      className={cx(styles.step, styles[status], className)}
      aria-current={status === "active" ? "step" : undefined}
      {...rest}
    >
      <StatusIcon status={status} />
      <span className={styles.srOnly}>{STATUS_TEXT[status]}: </span>
      <span className={styles.stepText}>{children}</span>
      {tool ? <code className={styles.stepTool}>{tool}</code> : null}
    </li>
  );
}

export interface ChainOfThoughtNoteProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

/** Warning line under the steps — what happens if the run cannot finish. */
export function ChainOfThoughtNote({ children, className, ...rest }: ChainOfThoughtNoteProps) {
  return (
    <div className={cx(styles.note, className)} {...rest}>
      <CircleAlert aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}

/* ─────────────────────────── Stages (timeline) ─────────────────────────── */

export interface ChainOfThoughtStagesProps extends HTMLAttributes<HTMLElement> {
  /** Heading above the timeline, e.g. "5 stages". */
  label?: ReactNode;
  children: ReactNode;
}

/** The audit view of a turn: each stage on a vertical rail, marked by the agent that ran it. */
export function ChainOfThoughtStages({ label, children, className, ...rest }: ChainOfThoughtStagesProps) {
  const labelId = useId();
  return (
    <section
      className={cx(styles.stages, className)}
      aria-labelledby={label ? labelId : undefined}
      {...rest}
    >
      {label ? (
        <h3 id={labelId} className={styles.stagesLabel}>
          {label}
        </h3>
      ) : null}
      <ol className={styles.stageList}>{children}</ol>
    </section>
  );
}

export interface ChainOfThoughtStageProps extends Omit<LiHTMLAttributes<HTMLLIElement>, "title"> {
  /** A 24px circular `AgentAvatar` for whoever ran the stage. */
  avatar: ReactNode;
  title: ReactNode;
  /** Pre-formatted, e.g. "0.9s". */
  duration?: string;
  /** Stage output, shown in the grey well. */
  children?: ReactNode;
}

export function ChainOfThoughtStage({
  avatar,
  title,
  duration,
  children,
  className,
  ...rest
}: ChainOfThoughtStageProps) {
  return (
    <li className={cx(styles.stage, className)} {...rest}>
      <span className={styles.marker}>{avatar}</span>
      <div className={styles.stageCard}>
        <div className={styles.stageHead}>
          <span className={styles.stageTitle}>{title}</span>
          {duration ? <span className={styles.stageDuration}>{duration}</span> : null}
        </div>
        {children ? <div className={styles.well}>{children}</div> : null}
      </div>
    </li>
  );
}

export interface ChainOfThoughtReferenceProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
}

/** A knowledge-base reference inside a stage (e.g. "PKB-0002"), dotted-underlined as in Figma. */
export function ChainOfThoughtReference({ className, ...rest }: ChainOfThoughtReferenceProps) {
  return <span className={cx(styles.reference, className)} {...rest} />;
}
