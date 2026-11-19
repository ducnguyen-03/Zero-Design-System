import { Children } from "react";
import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import styles from "./AgentAvatar.module.css";

/** Figma ZAK prototype: 20 (chips), 24 (timeline markers), 28 (chat messages), 32 (agent cards). */
export type AgentAvatarSize = 20 | 24 | 28 | 32 | 40;
export type AgentAvatarShape = "square" | "circle";
/**
 * Live state worn on the tile itself, so a glance at the avatars says who is busy:
 * `working` — a ring runs round the tile · `done` · `attention` (needs input / under review) · `blocked`.
 */
export type AgentAvatarStatus = "working" | "done" | "attention" | "blocked";

export interface AgentAvatarProps extends HTMLAttributes<HTMLSpanElement> {
  /** The agent's mark — an `<img>` or inline SVG. */
  children: ReactNode;
  size?: AgentAvatarSize;
  /** `square` = 4px corners (messages, cards); `circle` = chips and timeline markers. */
  shape?: AgentAvatarShape;
  /** Tile colour. Use an opaque tint (pre-mixed on white) so the tile reads the same on grey surfaces. */
  background?: string;
  /**
   * Mark size as a share of the tile (0–1). Default 0.6. Marks differ in how much of their box they fill —
   * a dense pill needs less than an open glyph — so each agent sets its own optical size.
   */
  markScale?: number;
  status?: AgentAvatarStatus;
  /** Accessible name. Omit when the agent's name is already printed next to the avatar. */
  label?: string;
}

const cx = (...parts: Array<string | false | undefined>) => parts.filter(Boolean).join(" ");

const STATUS_TEXT: Record<AgentAvatarStatus, string> = {
  working: "working",
  done: "done",
  attention: "needs attention",
  blocked: "blocked",
};

/** Identity tile for an AI agent: a coloured square or circle carrying the agent's mark. */
export function AgentAvatar({
  children,
  size = 28,
  shape = "square",
  background,
  markScale,
  status,
  label,
  className,
  style,
  ...rest
}: AgentAvatarProps) {
  const vars = {
    "--agent-avatar-size": `${size}px`,
    ...(background ? { "--agent-avatar-bg": background } : null),
    ...(markScale ? { "--agent-mark-scale": `${markScale * 100}%` } : null),
    ...style,
  } as CSSProperties;
  const name = label && status ? `${label}, ${STATUS_TEXT[status]}` : label;
  return (
    <span
      className={cx(styles.avatar, shape === "circle" && styles.circle, status && styles[`status-${status}`], className)}
      style={vars}
      role={name ? "img" : undefined}
      aria-label={name}
      aria-hidden={name ? undefined : true}
      data-size={size}
      {...rest}
    >
      <span className={styles.tile}>{children}</span>
      {status ? <span className={styles.status} aria-hidden="true" /> : null}
    </span>
  );
}

export interface AgentAvatarGroupProps extends HTMLAttributes<HTMLSpanElement> {
  /** `AgentAvatar`s, in the order they joined. */
  children: ReactNode;
  /** Show at most this many; the rest collapse into "+N". Default 4. */
  max?: number;
  size?: AgentAvatarSize;
  /** Accessible summary, e.g. "Agents in this turn: Zak, William". */
  "aria-label"?: string;
}

/** Overlapping stack — who worked on a turn, who is in a space. */
export function AgentAvatarGroup({
  children,
  max = 4,
  size = 24,
  className,
  style,
  ...rest
}: AgentAvatarGroupProps) {
  const items = Children.toArray(children);
  const shown = items.slice(0, max);
  const extra = items.length - shown.length;
  return (
    <span
      className={cx(styles.group, className)}
      style={{ "--agent-avatar-size": `${size}px`, ...style } as CSSProperties}
      role="group"
      {...rest}
    >
      {shown}
      {extra > 0 ? (
        <span className={styles.more} aria-label={`and ${extra} more`}>
          +{extra}
        </span>
      ) : null}
    </span>
  );
}
