import { useState } from "react";
import type { ReactNode } from "react";
import { CircleHelp, EllipsisVertical, House, KeySquare, MessageSquareShare, Plus, Search } from "lucide-react";
import { NavRow } from "../components/Navigation/NavRow";
import { Sidebar, SidebarSection } from "../components/Navigation/Sidebar";
import { AccessTierModal } from "../components/Insights/AccessTiers";
import { SidebarDatasetAccess } from "../components/Navigation/SidebarDatasetAccess";
import { InsightsLogo } from "../components/Brand/InsightsLogo";
import { ACCESS_CAPABILITIES, ACCESS_NOTES, ACCESS_TIERS, DATASET_ACCESS, SAVED_QUERIES } from "./insightsAccess";

export const INSIGHTS_USER = { name: "Alicia Koch", email: "alicia.koch@ccia.org.au", initials: "AK" };

const fmt = (n: number) => n.toLocaleString("en-AU");

export interface InsightsSidebarProps {
  active?: "home" | "requests" | "account" | "query";
  defaultCollapsed?: boolean;
  onShowTiers: () => void;
  onRequest?: () => void;
  onViewAccount?: () => void;
  /** Help and support — receives the row's box, to anchor a menu to it. */
  onHelp?: (anchor: DOMRect) => void;
}

/** The Insights sidebar, assembled from DS parts: Beta logo, nav, saved queries, footer links, Dataset access, account. */
export function InsightsSidebar({ active = "home", defaultCollapsed, onShowTiers, onRequest, onViewAccount, onHelp }: InsightsSidebarProps) {
  const { participants } = DATASET_ACCESS;
  return (
    <Sidebar
      defaultCollapsed={defaultCollapsed}
      logo={<InsightsLogo />}
      user={INSIGHTS_USER}
      onSignOut={() => {}}
      onViewAccount={onViewAccount}
      sections={
        <SidebarSection
          data-tour="saved"
          title="Saved queries"
          action={
            <button
              type="button"
              aria-label="Search saved queries"
              style={{ display: "inline-flex", background: "none", border: "none", padding: 0, color: "inherit", cursor: "pointer" }}
            >
              <Search />
            </button>
          }
        >
          <NavRow icon={<Plus />}>Create new query</NavRow>
          <NavRow active={active === "query"} trailing={<EllipsisVertical size={16} aria-hidden="true" />}>
            Untitled query
          </NavRow>
          {SAVED_QUERIES.map((q) => (
            <NavRow key={q.title} trailing={q.time}>
              {q.title}
            </NavRow>
          ))}
        </SidebarSection>
      }
      footer={
        <>
          <NavRow size="sm" icon={<CircleHelp />} data-tour="help" aria-haspopup={onHelp ? "menu" : undefined} onClick={onHelp ? (e) => onHelp(e.currentTarget.getBoundingClientRect()) : undefined}>
            Help and support
          </NavRow>
          <NavRow size="sm" icon={<MessageSquareShare />}>
            Provide feedback
          </NavRow>
        </>
      }
      access={
        <SidebarDatasetAccess
          data-tour="access"
          available={DATASET_ACCESS.available}
          total={DATASET_ACCESS.total}
          availableLabel={`${fmt(participants.available)} participants`}
          lockedLabel={`${fmt(participants.total - participants.available)} no access`}
          onShowTiers={onShowTiers}
          onRequest={onRequest ?? onShowTiers}
        />
      }
    >
      <NavRow icon={<House />} active={active === "home"}>
        Home
      </NavRow>
      <NavRow icon={<KeySquare />} active={active === "requests"}>
        Data access requests
      </NavRow>
    </Sidebar>
  );
}

/** Sidebar + page with the tier modal wired to the Dataset access block. */
export function InsightsShell({
  active,
  defaultCollapsed,
  defaultTiersOpen = false,
  onHelp,
  children,
}: {
  active?: InsightsSidebarProps["active"];
  defaultCollapsed?: boolean;
  defaultTiersOpen?: boolean;
  onHelp?: InsightsSidebarProps["onHelp"];
  children?: (openTiers: () => void) => ReactNode;
}) {
  const [tiersOpen, setTiersOpen] = useState(defaultTiersOpen);
  const open = () => setTiersOpen(true);
  return (
    <div style={{ display: "flex", height: "100vh", minHeight: 640, background: "var(--insight-color-white)" }}>
      <InsightsSidebar active={active} defaultCollapsed={defaultCollapsed} onShowTiers={open} onViewAccount={() => {}} onHelp={onHelp} />
      <div style={{ flex: 1, minWidth: 0, overflow: "auto" }}>{children?.(open)}</div>
      <AccessTierModal
        open={tiersOpen}
        onClose={() => setTiersOpen(false)}
        tiers={ACCESS_TIERS}
        capabilities={ACCESS_CAPABILITIES}
        notes={ACCESS_NOTES}
        onSelectTier={() => setTiersOpen(false)}
      />
    </div>
  );
}
