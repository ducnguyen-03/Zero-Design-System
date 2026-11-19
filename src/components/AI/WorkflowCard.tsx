import { useId } from "react";
import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { StatusBadge } from "../Badge/Badge";
import { ZAK_AGENTS, ZakAgentAvatar } from "./agents";
import type { ZakAgentId } from "./agents";
import styles from "./WorkflowCard.module.css";

const cx = (...parts: Array<string | false | undefined>) => parts.filter(Boolean).join(" ");

export interface WorkflowCardProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "title"> {
  /** The agents that run the workflow, in the order they appear — one, a pair, or the whole team. */
  agents: ZakAgentId[];
  /**
   * Pill text after "Work with". Defaults to the agents' names joined with "&" ("William & Karl");
   * pass e.g. "ZAK & teams" when the whole team is listed.
   */
  agentLabel?: string;
  /** Small uppercase line above the title — the workflow's domain ("Cohort discovery"). */
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  /** Flags a workflow that just arrived, e.g. a newly added agent's. */
  isNew?: boolean;
  /** The workflow the prompt will start. */
  selected?: boolean;
}

/**
 * A starting point on the ZAK home screen: the agents that run it (40px circles), "Work with …",
 * the domain, what it does and what it produces.
 */
export function WorkflowCard({
  agents,
  agentLabel,
  eyebrow,
  title,
  description,
  isNew = false,
  selected = false,
  className,
  type = "button",
  ...rest
}: WorkflowCardProps) {
  const label = agentLabel ?? agents.map((a) => ZAK_AGENTS[a].name).join(" & ");
  return (
    <button type={type} className={cx(styles.card, selected && styles.selected, className)} aria-pressed={selected} {...rest}>
      <span className={styles.top}>
        <span className={styles.agents} aria-hidden="true">
          {agents.map((a) => (
            <ZakAgentAvatar key={a} agent={a} size={40} shape="circle" />
          ))}
        </span>
        {isNew ? <StatusBadge variant="primary">New</StatusBadge> : null}
        <span className={styles.agent}>Work with {label}</span>
      </span>
      {eyebrow ? <span className={styles.eyebrow}>{eyebrow}</span> : null}
      <span className={styles.title}>{title}</span>
      {description ? <span className={styles.description}>{description}</span> : null}
    </button>
  );
}

export interface WorkflowCardsProps extends HTMLAttributes<HTMLElement> {
  /** Defaults to "Start from a workflow". */
  label?: ReactNode;
  children: ReactNode;
}

/** Labelled grid of `WorkflowCard`s — two columns, one on narrow containers. */
export function WorkflowCards({ label = "Start from a workflow", children, className, ...rest }: WorkflowCardsProps) {
  const id = useId();
  return (
    <section className={cx(styles.group, className)} aria-labelledby={id} {...rest}>
      <h2 id={id} className={styles.label}>
        {label}
      </h2>
      <div className={styles.grid}>{children}</div>
    </section>
  );
}
