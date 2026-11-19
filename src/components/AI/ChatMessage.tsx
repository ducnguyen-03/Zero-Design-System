import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { ArrowLeftRight, ChevronDown, CornerUpLeft, X } from "lucide-react";
import { Tooltip } from "../Tooltip/Tooltip";
import styles from "./ChatMessage.module.css";

const cx = (...parts: Array<string | false | undefined>) => parts.filter(Boolean).join(" ");

export type ChatMessageRole = "user" | "assistant";

/** The message being answered — shown as a quote at the top of the reply. */
export interface ChatReplyRef {
  /** "Sidney", "You" */
  author: string;
  /** A 16px `AgentAvatar` for agents; omit for the user. */
  avatar?: ReactNode;
  /** The quoted passage — trimmed to two lines. */
  excerpt: ReactNode;
  /** Scrolls to the original message. */
  onClick?: () => void;
}

export interface ChatMessageProps extends Omit<HTMLAttributes<HTMLDivElement>, "role"> {
  role?: ChatMessageRole;
  /** Assistant only: an `AgentAvatar` (28px square) shown above the reply. */
  avatar?: ReactNode;
  /** Who is speaking, announced to screen readers ("You" / "Assistant" by default). */
  author?: string;
  /** Assistant only: print the author (and `authorRole`) beside the avatar — for turns where several agents speak. */
  showAuthor?: boolean;
  /** e.g. "Cohort Expert". Shown with `showAuthor`. */
  authorRole?: string;
  /** This message answers another one — user to agent, or agent to agent. */
  replyTo?: ChatReplyRef;
  /** The message. Plain text, paragraphs, or richer blocks (`ChatCallout`, `ChatAgentCard`…). */
  children: ReactNode;
  /** Assistant only: a row under the reply — usually a `ChatMessageMeta`. */
  footer?: ReactNode;
  /** `ChatMessageActions` — Reply, Copy, Retry… Shown on hover and keyboard focus; always on touch screens. */
  actions?: ReactNode;
  /** Briefly marks the message, e.g. after jumping to it from a reply quote. */
  highlighted?: boolean;
}

/**
 * One turn in the conversation. User turns are a grey bubble on the right
 * (rounded 14px, tail corner 4px); assistant turns are open text under the agent's avatar.
 * Either can answer a specific earlier message (`replyTo`), shown as a quote that jumps back to it.
 */
export function ChatMessage({
  role = "assistant",
  avatar,
  author,
  showAuthor = false,
  authorRole,
  replyTo,
  children,
  footer,
  actions,
  highlighted = false,
  className,
  ...rest
}: ChatMessageProps) {
  const who = author ?? (role === "user" ? "You" : "Assistant");
  const spoken = replyTo ? `${who}, replying to ${replyTo.author}: ` : `${who}: `;
  if (role === "user") {
    return (
      <div className={cx(styles.message, styles.user, highlighted && styles.highlighted, className)} {...rest}>
        <div className={styles.bubble}>
          <span className={styles.srOnly}>{spoken}</span>
          {replyTo ? <ChatReplyQuote {...replyTo} inBubble /> : null}
          {children}
        </div>
        {actions ? <div className={styles.actionsRow}>{actions}</div> : null}
      </div>
    );
  }
  return (
    <div className={cx(styles.message, styles.assistant, highlighted && styles.highlighted, className)} {...rest}>
      {avatar ? (
        <div className={styles.avatar}>
          {avatar}
          {showAuthor ? (
            <span className={styles.authorLine} aria-hidden="true">
              <span className={styles.authorName}>{who}</span>
              {authorRole ? <span className={styles.authorRole}>{authorRole}</span> : null}
            </span>
          ) : null}
        </div>
      ) : null}
      <div className={styles.body}>
        <span className={styles.srOnly}>{spoken}</span>
        {replyTo ? <ChatReplyQuote {...replyTo} /> : null}
        {children}
      </div>
      {footer}
      {actions ? <div className={styles.actionsRow}>{actions}</div> : null}
    </div>
  );
}

export interface ChatReplyQuoteProps extends ChatReplyRef {
  /** Set by `ChatMessage` inside the user bubble (white well instead of a rail). */
  inBubble?: boolean;
  /** Composer use: "Replying to …" with a cancel button — pass as `PromptInput`'s `banner`. */
  onDismiss?: () => void;
  className?: string;
}

/**
 * The quoted message at the top of a reply, or above the composer while replying.
 * Clicking it jumps back to the original.
 */
export function ChatReplyQuote({ author, avatar, excerpt, onClick, inBubble = false, onDismiss, className }: ChatReplyQuoteProps) {
  const inner = (
    <>
      <span className={styles.quoteHead} aria-hidden="true">
        <CornerUpLeft className={styles.quoteIcon} />
        {avatar ? <span className={styles.quoteAvatar}>{avatar}</span> : null}
        <span className={styles.quoteAuthor}>{onDismiss ? `Replying to ${author}` : author}</span>
      </span>
      <span className={styles.quoteText}>{excerpt}</span>
    </>
  );
  return (
    <div className={cx(styles.quote, inBubble && styles.quoteInBubble, onDismiss && styles.quoteComposer, className)}>
      {onClick ? (
        <button type="button" className={styles.quoteMain} onClick={onClick} aria-label={`Go to the message from ${author}`}>
          {inner}
        </button>
      ) : (
        <div className={styles.quoteMain}>
          {onDismiss ? <span className={styles.srOnly}>Replying to {author}: </span> : null}
          {inner}
        </div>
      )}
      {onDismiss ? (
        <button type="button" className={styles.quoteDismiss} onClick={onDismiss} aria-label="Cancel reply">
          <X aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}

export interface ChatMessageActionsProps extends HTMLAttributes<HTMLDivElement> {
  /** `ChatMessageAction`s. */
  children: ReactNode;
}

/** Toolbar under a message: Reply, Copy, Retry, Edit, feedback. */
export function ChatMessageActions({ children, className, ...rest }: ChatMessageActionsProps) {
  return (
    <div role="toolbar" aria-label="Message actions" className={cx(styles.actions, className)} {...rest}>
      {children}
    </div>
  );
}

export interface ChatMessageActionProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** 16px Lucide icon. */
  icon: ReactNode;
  /** Names the action; shown in a DS `Tooltip` and read by screen readers. */
  label: string;
  /** Show the label beside the icon (e.g. "Reply"). */
  showLabel?: boolean;
  /** Toggled state, e.g. a given thumbs-up. */
  pressed?: boolean;
}

export function ChatMessageAction({
  icon,
  label,
  showLabel = false,
  pressed,
  className,
  type = "button",
  ...rest
}: ChatMessageActionProps) {
  const button = (
    <button
      type={type}
      className={cx(styles.action, showLabel && styles.actionLabelled, className)}
      aria-label={showLabel ? undefined : label}
      aria-pressed={pressed}
      {...rest}
    >
      <span className={styles.actionIcon} aria-hidden="true">
        {icon}
      </span>
      {showLabel ? <span>{label}</span> : null}
    </button>
  );
  // Icon-only actions name themselves with the DS tooltip, below the row so it never covers the message text.
  return showLabel ? button : <Tooltip label={label} placement="bottom" appearance="light">{button}</Tooltip>;
}

export interface ChatCalloutProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** The answer in one line, e.g. "41 patients carry a recorded diagnosis of AML". */
  title: ReactNode;
  /** Right-aligned status — a `ChatTaskStatus` (UNVERIFIED, VERIFIED). */
  status?: ReactNode;
  /** What the answer means. */
  children?: ReactNode;
}

/** The grey answer block inside an assistant reply: headline result + status + one line of context. */
export function ChatCallout({ title, status, children, className, ...rest }: ChatCalloutProps) {
  return (
    <div className={cx(styles.callout, className)} {...rest}>
      <div className={styles.calloutHead}>
        <span className={styles.calloutTitle}>{title}</span>
        {status}
      </div>
      {children ? <div className={styles.calloutBody}>{children}</div> : null}
    </div>
  );
}

export interface ChatTaskStatusProps extends HTMLAttributes<HTMLSpanElement> {
  /** `neutral` = UNVERIFIED (grey), `success` = VERIFIED (green). */
  tone?: "neutral" | "success";
  children: ReactNode;
}

/** Figma "Task status": a small uppercase tag for how far an answer can be trusted. */
export function ChatTaskStatus({ tone = "neutral", className, ...rest }: ChatTaskStatusProps) {
  return <span className={cx(styles.taskStatus, tone === "success" && styles.taskSuccess, className)} {...rest} />;
}

export interface ChatMessageMetaProps extends HTMLAttributes<HTMLDivElement> {
  /** e.g. "Worked for 1m 30s". */
  label?: ReactNode;
  /** `ChatAgentChip`s for the agents that took part. */
  children?: ReactNode;
}

/** "Worked for 1m 30s · [ZAK] [Sidney]" — who answered and how long it took. */
export function ChatMessageMeta({ label, children, className, ...rest }: ChatMessageMetaProps) {
  return (
    <div className={cx(styles.meta, className)} {...rest}>
      {label ? <span className={styles.metaLabel}>{label}</span> : null}
      {children}
    </div>
  );
}

export interface ChatAgentChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** A 20px `AgentAvatar`. */
  avatar: ReactNode;
  name: string;
  /** Opens this agent's work for the turn. Sets `aria-expanded` and flips the chevron. */
  expanded?: boolean;
}

/** Pill naming an agent that worked on the reply; expands to show its steps. Green while expanded. */
export function ChatAgentChip({
  avatar,
  name,
  expanded,
  className,
  type = "button",
  ...rest
}: ChatAgentChipProps) {
  return (
    <button
      type={type}
      className={cx(styles.chip, expanded && styles.chipExpanded, className)}
      aria-expanded={expanded}
      {...rest}
    >
      {avatar}
      <span className={styles.chipName}>{name}</span>
      <ChevronDown className={styles.chipChevron} aria-hidden="true" />
    </button>
  );
}

export interface ChatHandoffProps extends HTMLAttributes<HTMLParagraphElement> {
  /** What changed hands, in plain words: "Zak opened the inquiry and called in PedTrial". */
  children: ReactNode;
}

/** One quiet line above an agent card: who handed the work to whom. */
export function ChatHandoff({ children, className, ...rest }: ChatHandoffProps) {
  return (
    <p className={cx(styles.handoff, className)} {...rest}>
      <ArrowLeftRight aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}
