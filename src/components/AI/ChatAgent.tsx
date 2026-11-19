import type { HTMLAttributes, ReactNode } from "react";
import styles from "./ChatAgent.module.css";

const cx = (...parts: Array<string | false | undefined>) => parts.filter(Boolean).join(" ");

export interface ChatAgentHeaderProps extends HTMLAttributes<HTMLDivElement> {
  /** An `AgentAvatar` (32px in cards). */
  avatar: ReactNode;
  name: string;
  /** Role pill, e.g. "Cohort Expert", "Conductor". */
  role?: string;
  /** Right-aligned status, usually a `StatusBadge` (IN PROGRESS, DONE, FAILED…). */
  status?: ReactNode;
  /** `md` = 20px name (agent run card), `sm` = 16px name (inline in chat). */
  size?: "sm" | "md";
}

/** Avatar · name · role pill · status — the header of every agent card in the ZAK chat. */
export function ChatAgentHeader({
  avatar,
  name,
  role,
  status,
  size = "md",
  className,
  ...rest
}: ChatAgentHeaderProps) {
  return (
    <div className={cx(styles.header, size === "sm" && styles.sm, className)} {...rest}>
      {avatar}
      <div className={styles.identity}>
        <span className={styles.name}>{name}</span>
        {role ? <span className={styles.role}>{role}</span> : null}
      </div>
      {status ? <div className={styles.status}>{status}</div> : null}
    </div>
  );
}

export interface ChatAgentCardProps extends HTMLAttributes<HTMLElement> {
  /** Usually a `ChatAgentHeader`. */
  header: ReactNode;
  /** Body — a `ChainOfThought`, a callout, a message… */
  children?: ReactNode;
  /** Bottom action row, e.g. `<Button size="sm" variant="subtle">Stop</Button>` + "Step 4 of 5". */
  actions?: ReactNode;
  /** `compact` = 9px vertical padding, for a header-only card (an agent introduced in chat). */
  compact?: boolean;
}

/** White, 16px-radius card that frames one agent's turn. */
export function ChatAgentCard({
  header,
  children,
  actions,
  compact = false,
  className,
  ...rest
}: ChatAgentCardProps) {
  return (
    <section className={cx(styles.card, compact && styles.compact, className)} {...rest}>
      {header}
      {children}
      {actions ? <div className={styles.actions}>{actions}</div> : null}
    </section>
  );
}
