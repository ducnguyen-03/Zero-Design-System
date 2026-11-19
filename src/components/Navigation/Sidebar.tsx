import { useEffect, useId, useRef, useState } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { ChevronsUpDown, LogOut, PanelLeft, UserRound } from "lucide-react";
import { Button } from "../Button/Button";
import { SidebarContext, useSidebar } from "./SidebarContext";
import styles from "./Sidebar.module.css";

export interface SidebarUser {
  name: string;
  email?: string;
  /** Photo URL. Falls back to an initials circle. */
  avatarSrc?: string;
  initials?: string;
}

export interface SidebarProps extends Omit<HTMLAttributes<HTMLElement>, "children"> {
  /** Controlled compressed state (Figma `Variant=Compressed`, 60px icon rail). */
  collapsed?: boolean;
  /** Initial compressed state when uncontrolled. */
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  /** Full logo shown when expanded. Defaults to the Insights wordmark. */
  logo?: ReactNode;
  /** Compact mark shown in the compressed rail (swaps to the "Open sidebar"
   *  button on hover/focus). Defaults to the Insights mark. */
  mark?: ReactNode;
  /** Primary navigation — usually `NavRow`s. They collapse to icon-only automatically. */
  children?: ReactNode;
  /** Extra expanded-only content under the primary nav (e.g. `SidebarSection` "Saved queries"). */
  sections?: ReactNode;
  /** Secondary rows pinned to the bottom (FAQs, Provide feedback). Hidden when compressed. */
  footer?: ReactNode;
  /** Block between the footer links and the account, e.g. Insights `SidebarDatasetAccess`. Hidden when compressed. */
  access?: ReactNode;
  /** Signed-in user, rendered as the account switcher at the very bottom. */
  user?: SidebarUser;
  onSignOut?: () => void;
  /** Adds "Account settings" to the account popover. */
  onViewAccount?: () => void;
  /** Accessible name of the `<nav>` landmark. */
  label?: string;
}

const cx = (...parts: Array<string | false | undefined>) =>
  parts.filter(Boolean).join(" ");

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

function UserAvatar({ user, size }: { user: SidebarUser; size: number }) {
  return user.avatarSrc ? (
    <img
      className={styles.avatar}
      src={user.avatarSrc}
      alt=""
      width={size}
      height={size}
    />
  ) : (
    <span
      className={cx(styles.avatar, styles.initials)}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.4) }}
      aria-hidden="true"
    >
      {user.initials ?? initialsOf(user.name)}
    </span>
  );
}

export interface SidebarAccountProps {
  user: SidebarUser;
  onSignOut?: () => void;
  /** Adds an "Account settings" action above Sign out. */
  onViewAccount?: () => void;
}

/**
 * Account switcher pinned to a sidebar's foot: bordered card (expanded) or 36px icon (compressed),
 * opening a popover with name, email and Sign out. Reads `collapsed` from the enclosing sidebar.
 */
export function SidebarAccount({ user, onSignOut, onViewAccount }: SidebarAccountProps) {
  const { collapsed } = useSidebar();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popId = useId();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className={styles.account} ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className={cx(styles.accountTrigger, collapsed && styles.accountTriggerCollapsed)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? popId : undefined}
        aria-label={collapsed ? `Account: ${user.name}` : undefined}
        onClick={() => setOpen((v) => !v)}
      >
        <UserAvatar user={user} size={20} />
        {collapsed ? null : (
          <>
            <span className={styles.accountName}>{user.name}</span>
            <ChevronsUpDown className={styles.accountChevron} aria-hidden="true" />
          </>
        )}
      </button>
      {open ? (
        <div
          id={popId}
          role="dialog"
          aria-label="Account"
          className={cx(styles.accountPopover, collapsed && styles.accountPopoverSide)}
        >
          <div className={styles.accountIdentity}>
            <UserAvatar user={user} size={32} />
            <div className={styles.accountText}>
              <span className={styles.accountPopName}>{user.name}</span>
              {user.email ? <span className={styles.accountEmail}>{user.email}</span> : null}
            </div>
          </div>
          {onViewAccount ? (
            <Button
              variant="subtle"
              size="sm"
              startIcon={<UserRound />}
              onClick={() => {
                setOpen(false);
                onViewAccount();
              }}
            >
              Account settings
            </Button>
          ) : null}
          {onSignOut ? (
            <Button
              variant="subtle"
              size="sm"
              startIcon={<LogOut />}
              onClick={() => {
                setOpen(false);
                onSignOut();
              }}
            >
              Sign out
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export interface SidebarHeaderProps {
  collapsed: boolean;
  onToggle: () => void;
  /** Full logo (expanded). */
  logo?: ReactNode;
  /** Compact mark (compressed rail); swaps to the "Open sidebar" button on hover / focus. */
  mark?: ReactNode;
}

/**
 * Sidebar header (Figma "Sidebar"): logo + 24px "Close sidebar" toggle when expanded; in the 60px rail
 * the mark doubles as the "Open sidebar" button, turning into the panel icon on hover or focus.
 * Shared by `Sidebar` and the AI `WorkspaceSidebar` so both open and close the same way.
 */
export function SidebarHeader({ collapsed, onToggle, logo, mark }: SidebarHeaderProps) {
  const toggleLabel = collapsed ? "Open sidebar" : "Close sidebar";
  return (
    <div className={cx(styles.header, collapsed && styles.headerCollapsed)}>
      {collapsed ? (
        <button
          type="button"
          className={styles.railToggle}
          aria-label={toggleLabel}
          aria-expanded={false}
          onClick={onToggle}
        >
          <span className={styles.railMark} aria-hidden="true">
            {mark ?? <img src="/assets/InsightsMark.svg" alt="" width={34} height={17} />}
          </span>
          <PanelLeft className={styles.railPanelIcon} aria-hidden="true" />
          <span className={styles.toggleTip} aria-hidden="true">
            {toggleLabel}
          </span>
        </button>
      ) : (
        <>
          <span className={styles.logo}>
            {logo ?? <img src="/assets/InsightsLogo.svg" alt="Insights" width={118} height={21} />}
          </span>
          <button
            type="button"
            className={styles.toggle}
            aria-label={toggleLabel}
            aria-expanded={true}
            onClick={onToggle}
          >
            <PanelLeft aria-hidden="true" />
          </button>
        </>
      )}
    </div>
  );
}

/**
 * Insights application sidebar (Figma "Sidebar"). Expanded (250px) it shows the
 * wordmark, labelled `NavRow`s, optional sections and footer links; compressed
 * (60px) it becomes an icon rail whose rows expose their label as `aria-label`
 * and a hover/focus tooltip.
 */
export function Sidebar({
  collapsed: collapsedProp,
  defaultCollapsed = false,
  onCollapsedChange,
  logo,
  mark,
  children,
  sections,
  footer,
  access,
  user,
  onSignOut,
  onViewAccount,
  label = "Main",
  className,
  ...rest
}: SidebarProps) {
  const [internal, setInternal] = useState(defaultCollapsed);
  const collapsed = collapsedProp ?? internal;
  const toggle = () => {
    const next = !collapsed;
    if (collapsedProp === undefined) setInternal(next);
    onCollapsedChange?.(next);
  };
  return (
    <SidebarContext.Provider value={{ collapsed }}>
      <aside
        aria-label={`${label} sidebar`}
        className={cx(styles.sidebar, collapsed && styles.collapsed, className)}
        data-collapsed={collapsed || undefined}
        {...rest}
      >
        <SidebarHeader collapsed={collapsed} onToggle={toggle} logo={logo} mark={mark} />

        <nav className={styles.nav} aria-label={label}>
          {children}
        </nav>

        {!collapsed && sections ? <div className={styles.sections}>{sections}</div> : null}

        <div className={styles.spacer} />

        {(!collapsed && (footer || access)) || user ? (
          <div className={styles.footer}>
            {!collapsed && footer ? <div className={styles.footerLinks}>{footer}</div> : null}
            {!collapsed && access ? access : null}
            {user ? <SidebarAccount user={user} onSignOut={onSignOut} onViewAccount={onViewAccount} /> : null}
          </div>
        ) : null}
      </aside>
    </SidebarContext.Provider>
  );
}

export interface SidebarSectionProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  title: ReactNode;
  /** Header action, e.g. an icon button (search). */
  action?: ReactNode;
  children?: ReactNode;
}

/** Titled group inside the expanded sidebar ("Saved queries", "Compared queries"). */
export function SidebarSection({ title, action, children, className, ...rest }: SidebarSectionProps) {
  const id = useId();
  return (
    <section className={cx(styles.section, className)} aria-labelledby={id} {...rest}>
      <div className={styles.sectionHeader}>
        <h2 id={id} className={styles.sectionTitle}>
          {title}
        </h2>
        {action}
      </div>
      <div className={styles.sectionBody}>{children}</div>
    </section>
  );
}
