import { Children, useId } from "react";
import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { CircleCheck, OctagonAlert, Pencil, Sparkles, TriangleAlert } from "lucide-react";
import { Tooltip } from "../Tooltip/Tooltip";
import styles from "./Canvas.module.css";

const cx = (...parts: Array<string | false | undefined>) => parts.filter(Boolean).join(" ");

/* ─────────────────────────── Page ─────────────────────────── */

export interface CanvasProps extends HTMLAttributes<HTMLDivElement> {
  /** `CanvasHeader`, then sections and outputs. */
  children: ReactNode;
  /** Content column cap. Default 1160px; outputs stretch to it. */
  maxWidth?: number;
}

/** The work surface between the sidebar and the chat: 16px padding, 16px rhythm, grey-10 ground. */
export function Canvas({ children, maxWidth = 1160, className, style, ...rest }: CanvasProps) {
  return (
    <div className={cx(styles.canvas, className)} style={{ ...style }} {...rest}>
      <div className={styles.column} style={{ maxWidth }}>
        {children}
      </div>
    </div>
  );
}

export interface CanvasHeaderProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  /** Case or space name — 18 / 27 medium. */
  title: ReactNode;
  /** Shows the pencil after the title. */
  onEditTitle?: () => void;
  /** The question this space or case is answering, under the title. */
  description?: ReactNode;
  /** Right-aligned controls, e.g. `<Button size="sm">New Chat</Button>` + a menu. */
  actions?: ReactNode;
}

export function CanvasHeader({ title, onEditTitle, description, actions, className, ...rest }: CanvasHeaderProps) {
  return (
    <header className={cx(styles.header, className)} {...rest}>
      <div className={styles.headerRow}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>{title}</h1>
          {onEditTitle ? (
            <button type="button" className={styles.ghostIcon} aria-label="Rename" onClick={onEditTitle}>
              <Pencil aria-hidden="true" />
            </button>
          ) : null}
        </div>
        {actions ? <div className={styles.headerActions}>{actions}</div> : null}
      </div>
      {description ? <p className={styles.description}>{description}</p> : null}
    </header>
  );
}

/** Eyebrow label — Figma "Label/Regular": 11.2px medium, 7% tracking, uppercase. */
export function CanvasEyebrow({ className, ...rest }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={cx(styles.eyebrow, className)} {...rest} />;
}

export interface CanvasSectionProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  /** Eyebrow heading, e.g. "Case details", "Chats". */
  title: ReactNode;
  /** Count pill after the title. */
  count?: number;
  /** Right-aligned header control. */
  action?: ReactNode;
  children: ReactNode;
}

/** A titled block on the canvas. */
export function CanvasSection({ title, count, action, children, className, ...rest }: CanvasSectionProps) {
  const id = useId();
  return (
    <section className={cx(styles.section, className)} aria-labelledby={id} {...rest}>
      <div className={styles.sectionHead}>
        <h2 id={id} className={styles.eyebrow}>
          {title}
        </h2>
        {count !== undefined ? <CanvasCount>{count}</CanvasCount> : null}
        {action ? <span className={styles.sectionAction}>{action}</span> : null}
      </div>
      {children}
    </section>
  );
}

/** 24px grey-30 count disc used next to eyebrow headings. */
export function CanvasCount({ className, ...rest }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={cx(styles.count, className)} {...rest} />;
}

/* ─────────────────────────── Facts ─────────────────────────── */

export interface CanvasFactsProps extends HTMLAttributes<HTMLDListElement> {
  /** `CanvasFact`s — laid out in equal columns, wrapping on narrow canvases. */
  children: ReactNode;
}

/** "Case details": a row of outlined fact cards. */
export function CanvasFacts({ children, className, ...rest }: CanvasFactsProps) {
  return (
    <dl className={cx(styles.facts, className)} {...rest}>
      {children}
    </dl>
  );
}

export interface CanvasFactProps extends HTMLAttributes<HTMLDivElement> {
  label: ReactNode;
  children: ReactNode;
  /** `value` = 16px medium (a settled fact); `question` = 14px regular (still open). */
  tone?: "value" | "question";
}

export function CanvasFact({ label, children, tone = "value", className, ...rest }: CanvasFactProps) {
  return (
    <div className={cx(styles.fact, className)} {...rest}>
      <dt className={styles.eyebrow}>{label}</dt>
      <dd className={cx(styles.factValue, tone === "question" && styles.factQuestion)}>{children}</dd>
    </div>
  );
}

/* ─────────────────────────── Output card ─────────────────────────── */

export interface CanvasOutputProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  /** What the output shows — 18 / 27 medium. */
  title: ReactNode;
  /** Scope line under the title — 13 / 19.5 grey-100. */
  subtitle?: ReactNode;
  /** Top-right icon buttons (download, expand…). Use `CanvasOutputAction`. */
  actions?: ReactNode;
  children: ReactNode;
}

/** One artefact an agent produced: a chart, a table, a summary — white, 16px radius. */
export function CanvasOutput({ title, subtitle, actions, children, className, ...rest }: CanvasOutputProps) {
  const id = useId();
  return (
    <article className={cx(styles.output, className)} aria-labelledby={id} {...rest}>
      <header className={styles.outputHead}>
        <div className={styles.outputTitles}>
          <h2 id={id} className={styles.outputTitle}>
            {title}
          </h2>
          {subtitle ? <p className={styles.outputSubtitle}>{subtitle}</p> : null}
        </div>
        {actions ? <div className={styles.outputActions}>{actions}</div> : null}
      </header>
      {children}
    </article>
  );
}

export interface CanvasOutputActionProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** 16px Lucide icon. */
  icon: ReactNode;
  "aria-label": string;
}

/** 24px ghost icon button for an output's header; its `aria-label` doubles as the DS tooltip. */
export function CanvasOutputAction({ icon, className, type = "button", ...rest }: CanvasOutputActionProps) {
  return (
    <Tooltip label={rest["aria-label"]} placement="bottom" appearance="light">
      <button type={type} className={cx(styles.ghostIcon, styles.ghostSm, className)} {...rest}>
        {icon}
      </button>
    </Tooltip>
  );
}

export interface CanvasStatsProps extends HTMLAttributes<HTMLDListElement> {
  /** `CanvasStat`s. */
  children: ReactNode;
  /** `inline` — bare numbers above a chart (default). `cards` — outlined tiles, the summary row of a result. */
  variant?: "inline" | "cards";
}

/** Headline numbers above a chart, or the key-figure row that answers the question. */
export function CanvasStats({ children, variant = "inline", className, ...rest }: CanvasStatsProps) {
  return (
    <dl className={cx(styles.stats, variant === "cards" && styles.statCards, className)} {...rest}>
      {children}
    </dl>
  );
}

export type CanvasStatStatus = "success" | "warning" | "danger";

const STAT_ICON: Record<CanvasStatStatus, ReactNode> = {
  success: <CircleCheck />,
  warning: <TriangleAlert />,
  danger: <OctagonAlert />,
};

export interface CanvasStatProps extends HTMLAttributes<HTMLDivElement> {
  label: ReactNode;
  value: ReactNode;
  /** Small unit after the value, e.g. "mut/Mb". */
  unit?: string;
  /** Qualifier under the value, e.g. "at Level 3", "1 blocked by a scope constraint". */
  note?: ReactNode;
  /** Leading status icon — for verdicts like "Concordant" or "Disagrees". */
  status?: CanvasStatStatus;
  /** Set the value in Roboto Mono (probabilities, ratios). */
  mono?: boolean;
}

export function CanvasStat({ label, value, unit, note, status, mono = false, className, ...rest }: CanvasStatProps) {
  return (
    <div className={cx(styles.stat, className)} {...rest}>
      <dt className={styles.eyebrow}>{label}</dt>
      <dd className={cx(styles.statValue, mono && styles.statMono)}>
        {status ? (
          <span className={cx(styles.statStatus, styles[`statStatus-${status}`])} aria-hidden="true">
            {STAT_ICON[status]}
          </span>
        ) : null}
        {value}
        {unit ? <span className={styles.statUnit}> {unit}</span> : null}
      </dd>
      {note ? <dd className={styles.statNote}>{note}</dd> : null}
    </div>
  );
}

export interface CanvasInsightProps extends HTMLAttributes<HTMLDivElement> {
  /** Defaults to Lucide Sparkles — this sentence was written by an agent. */
  icon?: ReactNode;
  children: ReactNode;
}

/** The agent's reading of the output, in a grey-30 well. */
export function CanvasInsight({ icon, children, className, ...rest }: CanvasInsightProps) {
  return (
    <div className={cx(styles.insight, className)} {...rest}>
      <span className={styles.insightIcon} aria-hidden="true">
        {icon ?? <Sparkles />}
      </span>
      <div className={styles.insightText}>{children}</div>
    </div>
  );
}

export interface CanvasActionsProps extends HTMLAttributes<HTMLUListElement> {
  /** `CanvasAction`s. */
  children: ReactNode;
  "aria-label"?: string;
}

/** Follow-up refinements under an output ("Group by pathway", "Show co-occurrence"). */
export function CanvasActions({
  children,
  className,
  "aria-label": ariaLabel = "Refine this output",
  ...rest
}: CanvasActionsProps) {
  return (
    <ul className={cx(styles.actions, className)} aria-label={ariaLabel} {...rest}>
      {Children.map(children, (child) => (child ? <li>{child}</li> : null))}
    </ul>
  );
}

export interface CanvasActionProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export function CanvasAction({ className, type = "button", ...rest }: CanvasActionProps) {
  return <button type={type} className={cx(styles.action, className)} {...rest} />;
}
