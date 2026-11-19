import { Fragment, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  Bell,
  BookOpen,
  Calendar,
  ChevronRight,
  ClipboardCheck,
  Dna,
  FileText,
  Folder,
  LayoutDashboard,
  List,
  Network,
  Pill,
  Presentation,
  Scissors,
} from "lucide-react";
import { NavRow } from "../../components/Navigation/NavRow";
import { Sidebar } from "../../components/Navigation/Sidebar";
import { useSidebar } from "../../components/Navigation/SidebarContext";
import { ZeroDashLogo, ZeroDashMark } from "./ZeroDashLogo";
import styles from "./ZeroDashShell.module.css";

/** Every destination in the ZeroDash sidebar. Group children are `Parent:Child`. */
export type ZeroDashNavKey =
  | "Overview"
  | "Central Review"
  | "Curation:Cases"
  | "Curation:Meetings"
  | "Reports"
  | "Clinical:Cases"
  | "Clinical:Meetings"
  | "HTS Dashboard"
  | "File Tracker"
  | "Atlas:Gene Dashboard"
  | "Atlas:Tumour Classifiers"
  | "Atlas:SAVvy";

interface NavChild {
  key: ZeroDashNavKey;
  label: string;
  icon: ReactNode;
}
interface NavItem {
  label: string;
  icon: ReactNode;
  key?: ZeroDashNavKey;
  children?: NavChild[];
}

const casesAndMeetings = (prefix: "Curation" | "Clinical"): NavChild[] => [
  { key: `${prefix}:Cases` as ZeroDashNavKey, label: "Cases", icon: <List /> },
  { key: `${prefix}:Meetings` as ZeroDashNavKey, label: "Meetings", icon: <Calendar /> },
];

/** Design: four groups separated by dividers. */
const NAV_GROUPS: NavItem[][] = [
  [{ label: "Overview", key: "Overview", icon: <LayoutDashboard /> }],
  [
    { label: "Central Review", key: "Central Review", icon: <ClipboardCheck /> },
    { label: "Curation", icon: <Dna />, children: casesAndMeetings("Curation") },
    { label: "Reports", key: "Reports", icon: <FileText /> },
    { label: "Clinical", icon: <Presentation />, children: casesAndMeetings("Clinical") },
    { label: "HTS Dashboard", key: "HTS Dashboard", icon: <Pill /> },
  ],
  [{ label: "File Tracker", key: "File Tracker", icon: <Folder /> }],
  [
    {
      label: "Curation Atlas",
      icon: <BookOpen />,
      children: [
        { key: "Atlas:Gene Dashboard", label: "Gene Dashboard", icon: <Dna /> },
        { key: "Atlas:Tumour Classifiers", label: "Tumour Classifiers", icon: <Network /> },
        { key: "Atlas:SAVvy", label: "SAVvy", icon: <Scissors /> },
      ],
    },
  ],
];

const cx = (...p: Array<string | false | undefined>) => p.filter(Boolean).join(" ");

function SubRow({ child, active, onSelect }: { child: NavChild; active: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      className={cx(styles.subRow, active && styles.subRowActive)}
      aria-current={active ? "page" : undefined}
      onClick={onSelect}
    >
      <span className={styles.subIcon} aria-hidden="true">
        {child.icon}
      </span>
      <span className={styles.subLabel}>{child.label}</span>
    </button>
  );
}

/** A parent row with Cases/Meetings-style children: inline accordion when expanded, hover flyout in the rail. */
function NavGroup({ item, current, onNavigate }: { item: NavItem; current: ZeroDashNavKey; onNavigate: (k: ZeroDashNavKey) => void }) {
  const { collapsed } = useSidebar();
  const children = item.children ?? [];
  const childActive = children.some((c) => c.key === current);
  const [open, setOpen] = useState<boolean>(childActive || item.label === "Curation Atlas");
  const [fly, setFly] = useState(false);
  const closeT = useRef<number>();
  const listId = `zd-nav-${item.label.replace(/\s+/g, "-").toLowerCase()}`;

  useEffect(() => {
    if (childActive) setOpen(true);
  }, [childActive]);
  useEffect(() => () => window.clearTimeout(closeT.current), []);

  if (collapsed) {
    const show = () => {
      window.clearTimeout(closeT.current);
      setFly(true);
    };
    const hide = () => {
      closeT.current = window.setTimeout(() => setFly(false), 160);
    };
    return (
      <div className={styles.flyHost} onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide}>
        <NavRow
          icon={item.icon}
          active={childActive}
          aria-haspopup="menu"
          aria-expanded={fly}
          aria-label={item.label}
          onClick={() => setFly((v) => !v)}
        >
          {item.label}
        </NavRow>
        {fly ? (
          <div className={styles.flyout} role="menu" aria-label={item.label}>
            <div className={styles.flyTitle}>{item.label}</div>
            {children.map((c) => (
              <button
                key={c.key}
                type="button"
                role="menuitem"
                className={cx(styles.subRow, styles.flyRow, c.key === current && styles.subRowActive)}
                onClick={() => {
                  setFly(false);
                  onNavigate(c.key);
                }}
              >
                <span className={styles.subIcon} aria-hidden="true">
                  {c.icon}
                </span>
                <span className={styles.subLabel}>{c.label}</span>
              </button>
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className={styles.group}>
      <NavRow
        icon={item.icon}
        className={cx(childActive && styles.groupParentActive)}
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
        trailing={<ChevronRight size={16} className={cx(styles.chevron, open && styles.chevronOpen)} aria-hidden="true" />}
      >
        {item.label}
      </NavRow>
      <div className={cx(styles.subWrap, open && styles.subWrapOpen)} id={listId}>
        <div className={styles.subInner}>
          <div className={styles.subList}>
            {children.map((c) => (
              <SubRow key={c.key} child={c} active={c.key === current} onSelect={() => onNavigate(c.key)} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export interface ZeroDashSidebarProps {
  current: ZeroDashNavKey;
  onNavigate: (key: ZeroDashNavKey) => void;
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  notificationsOpen: boolean;
  onToggleNotifications: () => void;
}

export const ZERODASH_USER = { name: "Duc Nguyen", initials: "DN" };

/** ZeroDash app sidebar, assembled from the DS `Sidebar` + `NavRow` with expandable groups. */
export function ZeroDashSidebar({
  current,
  onNavigate,
  collapsed,
  onCollapsedChange,
  notificationsOpen,
  onToggleNotifications,
}: ZeroDashSidebarProps) {
  return (
    <Sidebar
      className={styles.sidebar}
      collapsed={collapsed}
      onCollapsedChange={onCollapsedChange}
      logo={<ZeroDashLogo />}
      mark={<ZeroDashMark />}
      user={ZERODASH_USER}
      onSignOut={() => {}}
      footer={
        <NavRow icon={<Bell />} active={notificationsOpen} aria-expanded={notificationsOpen} onClick={onToggleNotifications}>
          Notifications
        </NavRow>
      }
    >
      {NAV_GROUPS.map((group, gi) => (
        <Fragment key={gi}>
          {gi > 0 ? <div className={styles.navDivider} role="separator" /> : null}
          {group.map((item) =>
            item.children ? (
              <NavGroup key={item.label} item={item} current={current} onNavigate={onNavigate} />
            ) : (
              <NavRow key={item.label} icon={item.icon} active={current === item.key} onClick={() => onNavigate(item.key!)}>
                {item.label}
              </NavRow>
            ),
          )}
        </Fragment>
      ))}
      {collapsed ? (
        <>
          <div className={styles.navDivider} role="separator" />
          <NavRow icon={<Bell />} active={notificationsOpen} aria-expanded={notificationsOpen} onClick={onToggleNotifications}>
            Notifications
          </NavRow>
        </>
      ) : null}
    </Sidebar>
  );
}
