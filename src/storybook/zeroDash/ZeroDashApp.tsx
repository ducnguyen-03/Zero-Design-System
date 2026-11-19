import { useEffect, useState } from "react";
import { Clock, Construction } from "lucide-react";
import { NotificationPanel } from "../../components/Navigation/NotificationPanel";
import { ZeroDashSidebar } from "./ZeroDashSidebar";
import type { ZeroDashNavKey } from "./ZeroDashSidebar";
import { OverviewView } from "./views/OverviewView";
import { CurationView } from "./views/CurationView";
import { MtbView } from "./views/MtbView";
import { HtsDashboardView } from "./views/HtsDashboardView";
import { SavvyView } from "./views/SavvyView";
import { MaintenanceNoticeModal, MaintenancePage, MaintenanceSnackbar } from "./Maintenance";
import type { MaintenancePageTheme } from "./Maintenance";
import styles from "./ZeroDashShell.module.css";

export type ZeroDashView = ZeroDashNavKey;
export type MaintenanceBarVariant = "off" | "scheduled" | "imminent";

export interface ZeroDashAppProps {
  /** Page shown first. */
  initialView?: ZeroDashView;
  /** Start with the sidebar compressed to its 60px rail. */
  sidebarCollapsed?: boolean;
  /** Fitting plot density, passed through Curation to the Fitting screen. */
  plotDensity?: "large" | "compact";
  /** Persistent maintenance alert bar above the app. */
  maintenanceBar?: MaintenanceBarVariant;
  maintenanceStart?: string;
  maintenanceEnd?: string;
  maintenanceCountdown?: string;
  /** Slide in the maintenance snackbar (bottom left) on load. */
  showMaintenanceSnackbar?: boolean;
  /** Open the scheduled-maintenance notice modal on load. */
  showMaintenanceNotice?: boolean;
  /** `offline` replaces the whole app with the maintenance page. */
  maintenancePhase?: "none" | "offline";
  maintenanceTheme?: MaintenancePageTheme;
}

const STUBS: Partial<Record<ZeroDashView, { crumb: string; child?: string; title: string; empty: string }>> = {
  "Curation:Meetings": { crumb: "Curation", child: "Meetings", title: "Curation meetings", empty: "No curation meetings scheduled." },
  "Clinical:Meetings": { crumb: "Clinical", child: "Meetings", title: "Clinical meetings", empty: "No clinical meetings scheduled." },
  "Central Review": { crumb: "Central Review", title: "Central review", empty: "Central review isn’t part of this prototype yet." },
  Reports: { crumb: "Reports", title: "Reports", empty: "Reports aren’t part of this prototype yet." },
  "File Tracker": { crumb: "File Tracker", title: "File tracker", empty: "The file tracker isn’t part of this prototype yet." },
  "Atlas:Gene Dashboard": { crumb: "Curation Atlas", child: "Gene Dashboard", title: "Gene dashboard", empty: "The gene dashboard isn’t part of this prototype yet." },
  "Atlas:Tumour Classifiers": { crumb: "Curation Atlas", child: "Tumour Classifiers", title: "Tumour classifiers", empty: "Tumour classifiers aren’t part of this prototype yet." },
};

function StubPage({ view }: { view: ZeroDashView }) {
  const s = STUBS[view];
  if (!s) return null;
  return (
    <section className={styles.stub} aria-labelledby="zd-stub-title">
      <ol className={styles.crumbs} aria-label="Breadcrumb">
        <li>{s.crumb}</li>
        {s.child ? <li>{s.child}</li> : null}
      </ol>
      <h1 id="zd-stub-title" className={styles.stubTitle}>
        {s.title}
      </h1>
      <div className={styles.stubEmpty}>{s.empty}</div>
    </section>
  );
}

function MaintenanceBar({
  variant,
  start,
  end,
  countdown,
}: {
  variant: MaintenanceBarVariant;
  start: string;
  end: string;
  countdown: string;
}) {
  // Mount closed, then open on the next frame so the bar slides down like the design.
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (variant === "off") {
      setShown(false);
      return;
    }
    const r = requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
    return () => cancelAnimationFrame(r);
  }, [variant]);

  return (
    <div className={[styles.barWrap, shown && variant !== "off" && styles.barWrapShown].filter(Boolean).join(" ")}>
      {variant === "scheduled" ? (
        <div className={styles.bar} role="status">
          <Construction aria-hidden="true" strokeWidth={1.8} />
          <span>
            Scheduled maintenance: <strong>{start} – {end}</strong>. Please save your work before maintenance begins.
          </span>
        </div>
      ) : null}
      {variant === "imminent" ? (
        <div className={styles.bar} role="alert">
          <Clock aria-hidden="true" strokeWidth={1.8} />
          <span>
            <strong>Maintenance starts in {countdown}</strong>. Please save your work now — scheduled start <strong>{start}</strong>.
          </span>
        </div>
      ) : null}
    </div>
  );
}

/**
 * ZeroDash: the curation / clinical app. Sidebar navigation (DS `Sidebar` + `NavRow`), an optional maintenance
 * alert bar, and one page at a time — Overview, Curation (→ patient curation → purity & ploidy fitting),
 * Clinical cases (MTB), HTS Dashboard and Curation Atlas › SAVvy.
 */
export function ZeroDashApp({
  initialView = "Overview",
  sidebarCollapsed = false,
  plotDensity = "compact",
  maintenanceBar = "off",
  maintenanceStart = "10:00 PM, Sat 28 Jul (AEST)",
  maintenanceEnd = "2:00 AM, Sun 29 Jul (AEST)",
  maintenanceCountdown = "10 minutes",
  showMaintenanceSnackbar = false,
  showMaintenanceNotice = false,
  maintenancePhase = "none",
  maintenanceTheme = "light",
}: ZeroDashAppProps) {
  const [view, setView] = useState<ZeroDashView>(initialView);
  const [snackOpen, setSnackOpen] = useState(false);
  const [noticeOpen, setNoticeOpen] = useState(showMaintenanceNotice);
  const maintWindow = { start: maintenanceStart, end: maintenanceEnd, countdown: maintenanceCountdown };

  useEffect(() => {
    if (!showMaintenanceSnackbar) return setSnackOpen(false);
    const r = requestAnimationFrame(() => setSnackOpen(true));
    return () => cancelAnimationFrame(r);
  }, [showMaintenanceSnackbar]);
  useEffect(() => setNoticeOpen(showMaintenanceNotice), [showMaintenanceNotice]);
  const [collapsed, setCollapsed] = useState(sidebarCollapsed);
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => setView(initialView), [initialView]);
  useEffect(() => setCollapsed(sidebarCollapsed), [sidebarCollapsed]);
  useEffect(() => {
    if (!notifOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setNotifOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [notifOpen]);

  const navigate = (k: ZeroDashView) => {
    setView(k);
    setNotifOpen(false);
  };

  let page;
  switch (view) {
    case "Overview":
      page = <OverviewView />;
      break;
    case "Curation:Cases":
      page = <CurationView plotDensity={plotDensity} />;
      break;
    case "Clinical:Cases":
      page = <MtbView />;
      break;
    case "HTS Dashboard":
      page = <HtsDashboardView />;
      break;
    case "Atlas:SAVvy":
      page = <SavvyView />;
      break;
    default:
      page = <StubPage view={view} />;
  }

  return (
    <div className={styles.app}>
      <MaintenanceBar variant={maintenanceBar} start={maintenanceStart} end={maintenanceEnd} countdown={maintenanceCountdown} />
      <div className={styles.body}>
        <ZeroDashSidebar
          current={view}
          onNavigate={navigate}
          collapsed={collapsed}
          onCollapsedChange={(c) => {
            setCollapsed(c);
            setNotifOpen(false);
          }}
          notificationsOpen={notifOpen}
          onToggleNotifications={() => setNotifOpen((v) => !v)}
        />
        {notifOpen ? (
          <>
            <div className={styles.notifScrim} onClick={() => setNotifOpen(false)} aria-hidden="true" />
            <div className={styles.notifPop} style={{ left: collapsed ? 72 : 262 }}>
              <NotificationPanel
                notifications={[]}
                onClose={() => setNotifOpen(false)}
                emptyDescription="New notifications will appear here."
              />
            </div>
          </>
        ) : null}
        <main className={styles.main}>{page}</main>
      </div>
      <MaintenanceSnackbar open={snackOpen} window={maintWindow} onClose={() => setSnackOpen(false)} />
      <MaintenanceNoticeModal open={noticeOpen} window={maintWindow} onClose={() => setNoticeOpen(false)} />
      {maintenancePhase === "offline" ? <MaintenancePage window={maintWindow} theme={maintenanceTheme} /> : null}
    </div>
  );
}
