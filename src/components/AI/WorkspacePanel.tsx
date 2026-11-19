import { Children, useId } from "react";
import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { ChevronDown, EllipsisVertical, FolderClock, Pencil, Plus } from "lucide-react";
import { Tooltip } from "../Tooltip/Tooltip";
import styles from "./WorkspacePanel.module.css";

const cx = (...parts: Array<string | false | undefined>) => parts.filter(Boolean).join(" ");

/* ─────────────────────────── Panel ─────────────────────────── */

export interface WorkspacePanelProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  /** Eyebrow title: "Agents", "Instructions", "Sources", "Routines". */
  title: string;
  count?: number;
  /** `add` shows +, `edit` shows the pencil. */
  action?: { kind: "add" | "edit"; label: string; onClick: () => void };
  /** One-line explanation under the header, e.g. "What the agents are allowed to read in this space." */
  description?: ReactNode;
  children?: ReactNode;
}

/** A settings card in a space's right column — white, support-grey border, 12px radius. */
export function WorkspacePanel({
  title,
  count,
  action,
  description,
  children,
  className,
  ...rest
}: WorkspacePanelProps) {
  const id = useId();
  return (
    <section className={cx(styles.panel, className)} aria-labelledby={id} {...rest}>
      <div className={styles.head}>
        <h2 id={id} className={styles.title}>
          {title}
        </h2>
        {count !== undefined ? (
          <span className={styles.count} aria-label={`${count} ${title.toLowerCase()}`}>
            {count}
          </span>
        ) : null}
        {action ? (
          <button type="button" className={styles.headAction} aria-label={action.label} onClick={action.onClick}>
            {action.kind === "add" ? <Plus aria-hidden="true" /> : <Pencil aria-hidden="true" />}
          </button>
        ) : null}
      </div>
      {description ? <p className={styles.description}>{description}</p> : null}
      {children}
    </section>
  );
}

/* ─────────────────────────── Sources / tools ─────────────────────────── */

export interface SourceIconProps extends HTMLAttributes<HTMLSpanElement> {
  /** Lucide icon for the source or tool. */
  icon: ReactNode;
  /** Name, shown in a tooltip and announced. */
  label: string;
  /** Skip the tooltip (e.g. inside a dense stack). */
  bare?: boolean;
}

/** 24px white disc with a 1px rule — one data source or tool an agent can call. */
export function SourceIcon({ icon, label, bare = false, className, ...rest }: SourceIconProps) {
  const disc = (
    <span className={cx(styles.disc, className)} role="img" aria-label={label} tabIndex={bare ? undefined : 0} {...rest}>
      {icon}
    </span>
  );
  return bare ? disc : <Tooltip label={label}>{disc}</Tooltip>;
}

export interface SourceStackProps extends HTMLAttributes<HTMLDivElement> {
  /** `SourceIcon`s. */
  children: ReactNode;
  /** `overlap` = −4px, white ring (run cards, "5 tools"); `spaced` = 4px gaps (panels). */
  layout?: "overlap" | "spaced";
  /** Collapse the rest into "+N". */
  max?: number;
  /** Visible lead text, e.g. "5 tools". */
  label?: ReactNode;
}

export function SourceStack({ children, layout = "spaced", max, label, className, ...rest }: SourceStackProps) {
  const items = Children.toArray(children);
  const shown = max !== undefined ? items.slice(0, max) : items;
  const extra = items.length - shown.length;
  return (
    <div className={cx(styles.stackWrap, className)} {...rest}>
      {label ? <span className={styles.stackLabel}>{label}</span> : null}
      <div className={cx(styles.stack, layout === "overlap" && styles.overlap)} role="list">
        {shown.map((child, i) => (
          <span key={i} role="listitem" className={styles.stackItem}>
            {child}
          </span>
        ))}
        {extra > 0 ? (
          <span role="listitem" className={cx(styles.disc, styles.more)} aria-label={`${extra} more`}>
            +{extra}
          </span>
        ) : null}
      </div>
    </div>
  );
}

export interface SourceItemProps extends HTMLAttributes<HTMLDivElement> {
  icon: ReactNode;
  name: string;
  /** e.g. "GraphQL MCP · genomic and clinical data". */
  detail?: string;
  /** `connected` ✓ green; `syncing`; `error` red; `off` greyed. */
  status?: "connected" | "syncing" | "error" | "off";
  /** Trailing control — "Change source", a switch, a menu. */
  action?: ReactNode;
}

const SOURCE_STATUS: Record<NonNullable<SourceItemProps["status"]>, string> = {
  connected: "Connected",
  syncing: "Syncing",
  error: "Not reachable",
  off: "Not in this space",
};

/** A source as a row — name, what it holds and whether agents can reach it. */
export function SourceItem({ icon, name, detail, status = "connected", action, className, ...rest }: SourceItemProps) {
  return (
    <div className={cx(styles.source, styles[`s-${status}`], className)} {...rest}>
      <span className={styles.disc} aria-hidden="true">
        {icon}
      </span>
      <span className={styles.sourceText}>
        <span className={styles.sourceName}>{name}</span>
        {detail ? <span className={styles.sourceDetail}>{detail}</span> : null}
      </span>
      <span className={styles.sourceStatus}>
        <span className={styles.dot} aria-hidden="true" />
        {SOURCE_STATUS[status]}
      </span>
      {action ? <span className={styles.sourceAction}>{action}</span> : null}
    </div>
  );
}

/* ─────────────────────────── Routines ─────────────────────────── */

export interface RoutineItemProps extends HTMLAttributes<HTMLDivElement> {
  name: string;
  /** Human schedule, e.g. "Daily · 06:00". */
  schedule: string;
  /** Defaults to Lucide FolderClock. */
  icon?: ReactNode;
  /** `paused` greys the row and says so. */
  paused?: boolean;
  /** Last / next run, e.g. "Last run 06:02 · 41 patients". */
  meta?: string;
  onMenu?: () => void;
}

/** A scheduled job an agent runs in the space ("Cohort snapshot refresh · Daily · 06:00"). */
export function RoutineItem({
  name,
  schedule,
  icon,
  paused = false,
  meta,
  onMenu,
  className,
  ...rest
}: RoutineItemProps) {
  return (
    <div className={cx(styles.routine, paused && styles.paused, className)} {...rest}>
      <span className={styles.routineIcon} aria-hidden="true">
        {icon ?? <FolderClock />}
      </span>
      <span className={styles.routineText}>
        <span className={styles.routineName}>{name}</span>
        <span className={styles.routineSchedule}>
          {paused ? "Paused · " : ""}
          {schedule}
          {meta ? ` · ${meta}` : ""}
        </span>
      </span>
      {onMenu ? (
        <button
          type="button"
          className={styles.headAction}
          aria-label={`Options for ${name}`}
          aria-haspopup="menu"
          onClick={onMenu}
        >
          <EllipsisVertical aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}

export interface RoutineListProps extends HTMLAttributes<HTMLUListElement> {
  children: ReactNode;
}

export function RoutineList({ children, className, ...rest }: RoutineListProps) {
  return (
    <ul className={cx(styles.list, className)} {...rest}>
      {Children.map(children, (c) => (c ? <li>{c}</li> : null))}
    </ul>
  );
}

/* ─────────────────────────── Agents ─────────────────────────── */

export interface AgentRosterItemProps extends HTMLAttributes<HTMLDivElement> {
  avatar: ReactNode;
  name: string;
  role?: string;
  /** Right slot — a `StatusBadge` (READY) or a menu. */
  status?: ReactNode;
}

/** "The teams" row: avatar · name · role pill, in an outlined row (Figma Teams page). */
export function AgentRosterItem({ avatar, name, role, status, className, ...rest }: AgentRosterItemProps) {
  return (
    <div className={cx(styles.roster, className)} {...rest}>
      {avatar}
      <span className={styles.rosterName}>{name}</span>
      {role ? <span className={styles.role}>{role}</span> : null}
      {status ? <span className={styles.rosterStatus}>{status}</span> : null}
    </div>
  );
}

/* ─────────────────────────── Space card (in chat) ─────────────────────────── */

export interface SpaceCardProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "title"> {
  title: string;
  /** The space's guiding question. */
  description?: ReactNode;
  /** Pill after the title. Default "Space". */
  kind?: string;
}

/** The space Zak just created, shown inline in the chat — opens the space. */
export function SpaceCard({ title, description, kind = "Space", className, type = "button", ...rest }: SpaceCardProps) {
  return (
    <button type={type} className={cx(styles.spaceCard, className)} {...rest}>
      <span className={styles.spaceHead}>
        <span className={styles.spaceTitle}>{title}</span>
        <span className={styles.role}>{kind}</span>
        <ChevronDown className={styles.spaceChevron} aria-hidden="true" />
      </span>
      {description ? <span className={styles.spaceDesc}>{description}</span> : null}
    </button>
  );
}
