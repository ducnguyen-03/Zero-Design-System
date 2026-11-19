import { Children, useCallback, useEffect, useId, useRef, useState } from "react";
import type {
  ButtonHTMLAttributes,
  CSSProperties,
  HTMLAttributes,
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
  ReactNode,
} from "react";
import { ChevronDown, Plus, Search } from "lucide-react";
import { SidebarAccount, SidebarHeader } from "../Navigation/Sidebar";
import type { SidebarUser } from "../Navigation/Sidebar";
import { SidebarContext } from "../Navigation/SidebarContext";
import styles from "./Workspace.module.css";

const cx = (...parts: Array<string | false | undefined>) => parts.filter(Boolean).join(" ");

/* ─────────────────────────── Layout ─────────────────────────── */

export interface WorkspaceLayoutProps extends HTMLAttributes<HTMLDivElement> {
  /** Left column — a `WorkspaceSidebar`. */
  sidebar: ReactNode;
  /** Right column — a `ChatPanel`. Omit (or close) for a two-column canvas. */
  panel?: ReactNode;
  panelOpen?: boolean;
  /** The canvas: whatever the agents produced, or a space's overview. */
  children: ReactNode;
  /** Drag the panel's left edge to trade width with the canvas. Default true. */
  resizable?: boolean;
  /** Controlled panel width in px. */
  panelWidth?: number;
  /** Uncontrolled starting width — also where a double-click on the handle returns to. Default 440 (Figma). */
  defaultPanelWidth?: number;
  onPanelWidthChange?: (width: number) => void;
  /** Narrowest the panel goes. Default 360. */
  minPanelWidth?: number;
  /** Widest the panel goes. Default 760; it also never squeezes the canvas below `minCanvasWidth`. */
  maxPanelWidth?: number;
  /** The canvas keeps at least this much room. Default 480. */
  minCanvasWidth?: number;
  /** Remember the width per user (localStorage key). */
  storageKey?: string;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), Math.max(lo, hi));

function readStored(key?: string) {
  if (!key) return undefined;
  try {
    const n = Number(window.localStorage.getItem(key));
    return Number.isFinite(n) && n > 0 ? n : undefined;
  } catch {
    return undefined;
  }
}

/**
 * The AI workspace shell (ZAK prototype): sidebar 248px · canvas (fluid) · chat panel 440px.
 * The panel's left edge is a drag handle (also arrow keys, Home / End, double-click to reset),
 * so the researcher decides how much room the chat and the canvas each get — the canvas reflows
 * as it grows (e.g. classifier visuals move to two columns). Below 1100px the chat floats over
 * the canvas; below 768px the sidebar collapses to its icon rail.
 */
export function WorkspaceLayout({
  sidebar,
  panel,
  panelOpen = true,
  children,
  resizable = true,
  panelWidth: panelWidthProp,
  defaultPanelWidth = 440,
  onPanelWidthChange,
  minPanelWidth = 360,
  maxPanelWidth = 760,
  minCanvasWidth = 480,
  storageKey,
  className,
  style,
  ...rest
}: WorkspaceLayoutProps) {
  const showPanel = Boolean(panel) && panelOpen;
  const layoutRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLElement>(null);
  const [inner, setInner] = useState(() => readStored(storageKey) ?? defaultPanelWidth);
  const [dragging, setDragging] = useState(false);
  const width = panelWidthProp ?? inner;

  // The widest the panel may be right now: its own cap, and enough left for the canvas.
  const maxNow = useCallback(() => {
    const layout = layoutRef.current;
    const canvas = canvasRef.current;
    if (!layout || !canvas) return maxPanelWidth;
    // From geometry, not state: everything right of the sidebar, less the canvas minimum.
    const room = layout.getBoundingClientRect().right - canvas.getBoundingClientRect().left - minCanvasWidth;
    return Math.min(maxPanelWidth, Math.max(minPanelWidth, room));
  }, [maxPanelWidth, minCanvasWidth, minPanelWidth]);

  const commit = useCallback(
    (next: number) => {
      const w = Math.round(clamp(next, minPanelWidth, maxNow()));
      if (panelWidthProp === undefined) setInner(w);
      onPanelWidthChange?.(w);
      return w;
    },
    [maxNow, minPanelWidth, onPanelWidthChange, panelWidthProp],
  );

  useEffect(() => {
    if (!storageKey || dragging) return;
    try {
      window.localStorage.setItem(storageKey, String(width));
    } catch {
      /* storage unavailable — width just isn't remembered */
    }
  }, [dragging, storageKey, width]);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.preventDefault();
    const handle = e.currentTarget;
    handle.setPointerCapture(e.pointerId);
    const right = layoutRef.current?.getBoundingClientRect().right ?? window.innerWidth;
    setDragging(true);
    const move = (ev: PointerEvent) => commit(right - ev.clientX);
    const up = () => {
      setDragging(false);
      handle.removeEventListener("pointermove", move);
      handle.removeEventListener("pointerup", up);
      handle.removeEventListener("pointercancel", up);
    };
    handle.addEventListener("pointermove", move);
    handle.addEventListener("pointerup", up);
    handle.addEventListener("pointercancel", up);
  };

  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 80 : 20;
    // The handle sits on the panel's left edge: ← widens the panel, → narrows it.
    const next =
      e.key === "ArrowLeft"
        ? width + step
        : e.key === "ArrowRight"
          ? width - step
          : e.key === "Home"
            ? minPanelWidth
            : e.key === "End"
              ? maxNow()
              : e.key === "Enter"
                ? defaultPanelWidth
                : null;
    if (next === null) return;
    e.preventDefault();
    commit(next);
  };

  return (
    <div
      ref={layoutRef}
      className={cx(styles.layout, showPanel && styles.withPanel, dragging && styles.resizing, className)}
      style={{ "--insight-components-workspace-panel-width": `${width}px`, ...style } as CSSProperties}
      {...rest}
    >
      {sidebar}
      <main ref={canvasRef} className={styles.canvas}>
        {children}
      </main>
      {showPanel ? (
        <div className={styles.panel}>
          {resizable ? (
            <div
              className={styles.resizer}
              role="separator"
              aria-orientation="vertical"
              aria-label="Resize chat panel"
              aria-valuenow={width}
              aria-valuemin={minPanelWidth}
              aria-valuemax={maxPanelWidth}
              aria-valuetext={`${width} pixels wide`}
              tabIndex={0}
              onPointerDown={onPointerDown}
              onKeyDown={onKeyDown}
              onDoubleClick={() => commit(defaultPanelWidth)}
            >
              <span className={styles.resizerGrip} aria-hidden="true" />
            </div>
          ) : null}
          {panel}
        </div>
      ) : null}
    </div>
  );
}

/* ─────────────────────────── Sidebar ─────────────────────────── */

export interface WorkspaceSidebarProps extends HTMLAttributes<HTMLElement> {
  /** Brand mark + wordmark, e.g. the ZAK logo. */
  logo: ReactNode;
  /** Compact mark for the 60px rail — it doubles as the "Open sidebar" button (DS `SidebarHeader`). Defaults to `logo`. */
  mark?: ReactNode;
  /** Icon-only rail. Controlled with `onCollapsedChange`, or uncontrolled via `defaultCollapsed`. */
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  /** Usually a `WorkspaceSearch`. */
  search?: ReactNode;
  /** `WorkspaceNavItem`s for the primary destinations (Chat, Teams, Tools). */
  nav?: ReactNode;
  /** Scrolling middle — `WorkspaceNavSection`s (Spaces, Chat history). Hidden in the rail. */
  children?: ReactNode;
  /** Signed-in user: the DS account switcher (`SidebarAccount`) at the foot. */
  user?: SidebarUser;
  onSignOut?: () => void;
  /** Extra pinned-bottom content above the account (or a custom account control). */
  footer?: ReactNode;
  "aria-label"?: string;
  /** Accessible name of the primary nav landmark. Make it unique when two sidebars share a page. */
  navLabel?: string;
}

export function WorkspaceSidebar({
  logo,
  mark,
  user,
  onSignOut,
  collapsed: collapsedProp,
  defaultCollapsed = false,
  onCollapsedChange,
  search,
  nav,
  children,
  footer,
  className,
  "aria-label": ariaLabel = "Workspace",
  navLabel = "Primary",
  ...rest
}: WorkspaceSidebarProps) {
  const [inner, setInner] = useState(defaultCollapsed);
  // Below 768px the sidebar is always the 60px rail.
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const sync = () => setNarrow(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  const collapsed = narrow || (collapsedProp ?? inner);
  const toggle = () => {
    if (collapsedProp === undefined) setInner(!collapsed);
    onCollapsedChange?.(!collapsed);
  };
  return (
    <SidebarContext.Provider value={{ collapsed }}>
    <aside
      className={cx(styles.sidebar, collapsed && styles.collapsed, className)}
      aria-label={ariaLabel}
      data-collapsed={collapsed || undefined}
      {...rest}
    >
      <SidebarHeader collapsed={collapsed} onToggle={toggle} logo={logo} mark={mark ?? logo} />
      {search ? <div className={styles.searchWrap}>{search}</div> : null}
      {nav ? (
        <nav className={styles.nav} aria-label={navLabel}>
          <ul className={styles.navList}>{nav}</ul>
        </nav>
      ) : null}
      <div className={styles.sidebarBody}>{children}</div>
      {footer || user ? (
        <div className={styles.sidebarFoot}>
          {footer}
          {user ? <SidebarAccount user={user} onSignOut={onSignOut} /> : null}
        </div>
      ) : null}
    </aside>
    </SidebarContext.Provider>
  );
}

export interface WorkspaceSearchProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  placeholder?: string;
  /** Keyboard hint, e.g. "⌘K". */
  shortcut?: string;
}

/** Search trigger — opens the command palette. A button styled as a field, with its shortcut. */
export function WorkspaceSearch({
  placeholder = "Search…",
  shortcut = "⌘K",
  className,
  type = "button",
  ...rest
}: WorkspaceSearchProps) {
  return (
    <button
      type={type}
      className={cx(styles.search, className)}
      aria-keyshortcuts={shortcut ? shortcut.replace("⌘", "Meta+") : undefined}
      aria-label={placeholder.replace(/…$/, "")}
      {...rest}
    >
      <Search aria-hidden="true" />
      <span className={styles.searchText}>{placeholder}</span>
      {shortcut ? (
        <kbd className={styles.kbd} aria-hidden="true">
          {shortcut}
        </kbd>
      ) : null}
    </button>
  );
}

export interface WorkspaceNavItemProps extends Omit<HTMLAttributes<HTMLLIElement>, "onClick"> {
  label: string;
  /** 16px Lucide icon. Items without one (spaces, chats) indent to the label column in the rail. */
  icon?: ReactNode;
  /** Renders a link when set, otherwise a button. */
  href?: string;
  onClick?: () => void;
  active?: boolean;
  /** Trailing action, e.g. "New chat" (+). */
  action?: { label: string; onClick: () => void; icon?: ReactNode };
}

/** A sidebar row: 32px, 6px radius, grey-30 when it is the current page. */
export function WorkspaceNavItem({
  label,
  icon,
  href,
  onClick,
  active = false,
  action,
  className,
  ...rest
}: WorkspaceNavItemProps) {
  const content = (
    <>
      {icon ? <span className={styles.navIcon}>{icon}</span> : null}
      <span className={styles.navLabel}>{label}</span>
    </>
  );
  return (
    <li className={cx(styles.navItem, active && styles.navActive, !icon && styles.navPlain, className)} {...rest}>
      {href ? (
        <a className={styles.navMain} href={href} aria-current={active ? "page" : undefined} title={label}>
          {content}
        </a>
      ) : (
        <button
          type="button"
          className={styles.navMain}
          aria-current={active ? "page" : undefined}
          onClick={onClick}
          title={label}
        >
          {content}
        </button>
      )}
      {action ? (
        <button type="button" className={styles.navAction} aria-label={action.label} onClick={action.onClick}>
          {action.icon ?? <Plus aria-hidden="true" />}
        </button>
      ) : null}
    </li>
  );
}

export interface WorkspaceNavSectionProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  title: string;
  /** Header action, e.g. "Create a space" (+). */
  action?: { label: string; onClick: () => void };
  /** Adds a chevron that folds the section (Chat history). */
  collapsible?: boolean;
  defaultOpen?: boolean;
  /** `WorkspaceNavItem`s. */
  children?: ReactNode;
  /** Shown when the section has no items, e.g. a "Create a space" row. */
  empty?: ReactNode;
}

/** A titled group in the sidebar's scrolling body. */
export function WorkspaceNavSection({
  title,
  action,
  collapsible = false,
  defaultOpen = true,
  children,
  empty,
  className,
  ...rest
}: WorkspaceNavSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const listId = useId();
  const headingId = useId();
  const hasItems = Children.toArray(children).length > 0;
  return (
    <section className={cx(styles.section, className)} aria-labelledby={headingId} {...rest}>
      <div className={styles.sectionHead}>
        {collapsible ? (
          <button
            type="button"
            className={styles.sectionToggle}
            aria-expanded={open}
            aria-controls={listId}
            onClick={() => setOpen(!open)}
          >
            <span id={headingId} className={styles.sectionTitle}>
              {title}
            </span>
            <ChevronDown className={cx(styles.sectionChevron, !open && styles.sectionChevronClosed)} aria-hidden="true" />
          </button>
        ) : (
          <h2 id={headingId} className={styles.sectionTitle}>
            {title}
          </h2>
        )}
        {action ? (
          <button type="button" className={styles.navAction} aria-label={action.label} onClick={action.onClick}>
            <Plus aria-hidden="true" />
          </button>
        ) : null}
      </div>
      <div id={listId} hidden={!open}>
        {hasItems ? <ul className={styles.navList}>{children}</ul> : empty}
      </div>
    </section>
  );
}

export interface WorkspaceCreateRowProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

/** Empty-section call to action: dashed + tile and a label ("Create a space"). */
export function WorkspaceCreateRow({ children, className, type = "button", ...rest }: WorkspaceCreateRowProps) {
  return (
    <button type={type} className={cx(styles.createRow, className)} {...rest}>
      <span className={styles.createTile} aria-hidden="true">
        <Plus />
      </span>
      <span className={styles.navLabel}>{children}</span>
    </button>
  );
}

export interface WorkspaceUserProps extends SidebarUser {
  onSignOut?: () => void;
}

/** @deprecated Pass `user` to `WorkspaceSidebar`. Kept as a thin alias of the DS `SidebarAccount`. */
export function WorkspaceUser({ onSignOut, ...user }: WorkspaceUserProps) {
  return <SidebarAccount user={user} onSignOut={onSignOut} />;
}
