import type { HTMLAttributes, ReactNode } from "react";
import { ZAK_AGENTS, ZakAgentAvatar } from "./agents";
import type { ZakAgentId } from "./agents";
import type { AgentAvatarStatus } from "./AgentAvatar";
import styles from "./RunTrace.module.css";

const cx = (...parts: Array<string | false | undefined>) => parts.filter(Boolean).join(" ");

export type RunStepStatus = "done" | "warning" | "blocked" | "running" | "skipped";

export interface RunStep {
  /** Who ran it. */
  agent: ZakAgentId;
  /** What happened, as a verb phrase: "Checked domain constraints". */
  title: ReactNode;
  /** Tool or source, set in mono: "PKB · 14 assertions". */
  tool?: ReactNode;
  /** What came out: "AML, MR · 0.84". */
  result?: ReactNode;
  status?: RunStepStatus;
  /** "6s" */
  duration?: ReactNode;
}

const AVATAR_STATUS: Record<RunStepStatus, AgentAvatarStatus | undefined> = {
  done: "done",
  warning: "attention",
  blocked: "blocked",
  running: "working",
  skipped: undefined,
};

const STATUS_TEXT: Record<RunStepStatus, string> = {
  done: "Done",
  warning: "Done with a warning",
  blocked: "Blocked",
  running: "Running",
  skipped: "Skipped",
};

export interface RunTraceProps extends HTMLAttributes<HTMLOListElement> {
  steps: RunStep[];
  /** Accessible name. Default "How this answer was made". */
  "aria-label"?: string;
}

/**
 * How an answer was made: one step per agent action, in order, with the tool it used and what
 * came out. A row on wide canvases, a timeline on narrow ones. Warnings and blocks stay visible
 * here as well as in the result, so the trail and the answer never disagree.
 */
export function RunTrace({ steps, className, "aria-label": ariaLabel = "How this answer was made", ...rest }: RunTraceProps) {
  return (
    <div className={styles.wrap}>
      <ol className={cx(styles.trace, className)} aria-label={ariaLabel} {...rest}>
        {steps.map((s, i) => {
          const status = s.status ?? "done";
          const agent = ZAK_AGENTS[s.agent];
          return (
            <li key={i} className={cx(styles.step, styles[`s-${status}`])}>
              <span className={styles.node}>
                <ZakAgentAvatar agent={s.agent} size={28} status={AVATAR_STATUS[status]} />
              </span>
              <div className={styles.body}>
                <span className={styles.who}>
                  {agent.name}
                  {s.duration ? <span className={styles.duration}> · {s.duration}</span> : null}
                </span>
                <span className={styles.title}>{s.title}</span>
                {s.tool ? <code className={styles.tool}>{s.tool}</code> : null}
                {s.result ? <span className={styles.result}>{s.result}</span> : null}
                <span className={styles.srOnly}>{STATUS_TEXT[status]}</span>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export interface RunSummaryProps extends HTMLAttributes<HTMLSpanElement> {
  agents: ZakAgentId[];
  /** "Turns 4–5 · 5 steps · 48s" */
  children?: ReactNode;
}

/** Compact "who worked on this" line — stacked avatars and a trace summary. */
export function RunSummary({ agents, children, className, ...rest }: RunSummaryProps) {
  const names = agents.map((a) => ZAK_AGENTS[a].name);
  return (
    <span className={cx(styles.summary, className)} {...rest}>
      <span className={styles.stack} role="img" aria-label={`Agents: ${names.join(", ")}`}>
        {agents.map((a) => (
          <ZakAgentAvatar key={a} agent={a} size={20} shape="circle" />
        ))}
      </span>
      {children ? <span>{children}</span> : null}
    </span>
  );
}
