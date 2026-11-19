import { forwardRef, useEffect, useId, useRef, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import {
  Book,
  ChevronDown,
  CircleQuestionMark,
  Command,
  Compass,
  Dna,
  EllipsisVertical,
  FlaskConical,
  Hospital,
  House,
  KeySquare,
  LayoutDashboard,
  MessageSquareShare,
  Microscope,
  Network,
  PanelLeft,
  Pencil,
  Plus,
  Rat,
  RotateCcw,
  Search,
  ShieldCheck,
  User,
  UserRound,
  X,
} from "lucide-react";
import { Button } from "../../components/Button/Button";
import { IconButton } from "../../components/IconButton/IconButton";
import { NavRow } from "../../components/Navigation/NavRow";
import { SidebarAccount, SidebarSection } from "../../components/Navigation/Sidebar";
import { SidebarContext } from "../../components/Navigation/SidebarContext";
import { FilterPanel, FilterRail, FilterSection, RAIL_ICON } from "../../components/FilterPanel/FilterPanel";
import type { FilterMatch } from "../../components/FilterPanel/FilterPanel";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "../../components/Table/Table";
import { BarChart, ChartCard, PieChart, SplitBar, UpsetChart } from "./Charts";
import { BiosamplesView } from "./views/BiosamplesView";
import { GeneView } from "./views/GeneView";
import { MolecularView } from "./views/MolecularView";
import { PdxView } from "./views/PdxView";
import { StudyMonitoringView } from "./views/StudyMonitoringView";
import {
  AGE_AT_DIAGNOSIS,
  CANCER_CATEGORIES,
  COHORT_DEMOGRAPHICS,
  EVENT_DISTRIBUTION,
  EXPERIMENTAL_STRATEGY,
  MUTATED_GENES,
  MUTATION_COLORS,
  QUERY_TITLE,
  SAVED_QUERIES,
  SEQUENCING_UPSET,
  SEX_DISTRIBUTION,
  STUDY_DISTRIBUTION,
  STUDY_FILTER_SECTIONS,
  SUMMARY_METRICS,
  VALIDATION_UPSET,
  VITAL_STATUS,
} from "./data";
import type { AppliedFilter, SummaryMetric } from "./data";
import styles from "./InsightsDashboard.module.css";

const cx = (...parts: Array<string | false | undefined>) => parts.filter(Boolean).join(" ");
const fmt = (n: number) => n.toLocaleString("en-US");

const USER = { name: "Alicia Koch", email: "alicia.koch@ccia.org.au", initials: "AK" };

/* ══════════════════════════════════════════════════════════════════
 * Top bar — logo · global search (⌘K) (Figma 15212:86343)
 * ════════════════════════════════════════════════════════════════ */

function TopBar() {
  return (
    <header className={styles.topBar}>
      <a className={styles.logo} href="#home" aria-label="Insights home">
        <img src="/assets/InsightsLogo.svg" alt="" width={117} height={21} />
      </a>
      <button type="button" className={styles.search} data-tour="search">
        <span className={styles.searchText}>
          <Search aria-hidden="true" />
          Search for diagnoses, genes, variants and more
        </span>
        <kbd className={styles.kbd} aria-label="Command K">
          <Command aria-hidden="true" />K
        </kbd>
      </button>
      <span className={styles.topBarEnd} />
    </header>
  );
}

/* ══════════════════════════════════════════════════════════════════
 * Sidebar (Figma "Component 29" 15212:86363) — composed from DS NavRow,
 * SidebarSection and SidebarAccount.
 * ════════════════════════════════════════════════════════════════ */

type Mode = "explorer" | "reportable";

function ModeCard({ mode, onChange }: { mode: Mode; onChange: (m: Mode) => void }) {
  return (
    <div className={styles.modeCard}>
      <div className={styles.modeSwitch} role="group" aria-label="Data mode">
        <button
          type="button"
          className={cx(styles.modeTab, mode === "explorer" && styles.modeTabOn)}
          aria-pressed={mode === "explorer"}
          onClick={() => onChange("explorer")}
        >
          <Compass aria-hidden="true" /> Explorer
        </button>
        <button
          type="button"
          className={cx(styles.modeTab, mode === "reportable" && styles.modeTabOn)}
          aria-pressed={mode === "reportable"}
          onClick={() => onChange("reportable")}
        >
          <ShieldCheck aria-hidden="true" className={styles.reportableIcon} /> Reportable
        </button>
      </div>
      <div className={styles.modeText}>
        {mode === "reportable" ? (
          <>
            <p className={styles.modeTitle}>
              You’re in <span className={styles.reportableText}>Reportable mode</span>
            </p>
            <p className={styles.modeHint}>
              Viewing approved reportable data. Counts and results may differ from Explore mode.
            </p>
          </>
        ) : (
          <>
            <p className={styles.modeTitle}>You’re in Explorer mode</p>
            <p className={styles.modeHint}>Viewing all available data, including unpublished results.</p>
          </>
        )}
      </div>
    </div>
  );
}

interface HelpMenuProps {
  onReplayTour: () => void;
  /** Replaces the built-in menu: receives the row's box to anchor a menu of your own. */
  onHelp?: (anchor: DOMRect) => void;
}

function HelpAndSupport({ onReplayTour, onHelp }: HelpMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const first = rootRef.current?.querySelector<HTMLElement>('[role="menuitem"]');
    first?.focus();
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const close = () => {
    setOpen(false);
    rootRef.current?.querySelector<HTMLButtonElement>("button[aria-haspopup]")?.focus();
  };

  const onMenuKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const items = Array.from(rootRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);
    const i = items.indexOf(document.activeElement as HTMLElement);
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const next = (i + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
      items[next]?.focus();
    }
  };

  return (
    <div className={styles.help} ref={rootRef} data-tour="help">
      <NavRow
        icon={<CircleQuestionMark />}
        active={open}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={(e) => (onHelp ? onHelp(e.currentTarget.getBoundingClientRect()) : setOpen((v) => !v))}
      >
        Help and support
      </NavRow>
      {open ? (
        <div id={menuId} role="menu" aria-label="Help and support" className={styles.helpMenu} onKeyDown={onMenuKey}>
          <button type="button" role="menuitem" className={styles.helpItem} onClick={close}>
            <CircleQuestionMark aria-hidden="true" /> FAQs
          </button>
          <button
            type="button"
            role="menuitem"
            className={styles.helpItem}
            onClick={() => {
              setOpen(false);
              onReplayTour();
            }}
          >
            <RotateCcw aria-hidden="true" /> Replay onboarding tour
          </button>
        </div>
      ) : null}
    </div>
  );
}

function AppSidebar({ onReplayTour, onHelp, access }: HelpMenuProps & { access?: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mode, setMode] = useState<Mode>("reportable");
  const [activeQuery, setActiveQuery] = useState("current");

  return (
    <SidebarContext.Provider value={{ collapsed }}>
      <aside className={cx(styles.sidebar, collapsed && styles.sidebarCollapsed)} aria-label="Main sidebar">
        <div className={styles.sidebarTop}>
          <nav className={styles.primaryNav} aria-label="Main">
            <NavRow icon={<House />} active>
              Home
            </NavRow>
            <NavRow icon={<KeySquare />}>Data access requests</NavRow>
          </nav>

          {collapsed ? null : (
            <SidebarSection
              className={styles.queries}
              data-tour="saved"
              title="Saved queries"
              action={<IconButton size="sm" icon={<Search />} aria-label="Search saved queries" />}
            >
              <button type="button" className={styles.createQuery}>
                <Plus aria-hidden="true" /> Create new query
              </button>
              <div className={styles.queryList}>
                <NavRow
                  active={activeQuery === "current"}
                  onClick={() => setActiveQuery("current")}
                  trailing={<EllipsisVertical size={16} aria-hidden="true" />}
                >
                  Untitled query
                </NavRow>
                {SAVED_QUERIES.map((q) => (
                  <NavRow
                    key={q.id}
                    className={cx(styles.queryRow, q.status && styles[q.status])}
                    active={activeQuery === q.id}
                    onClick={() => setActiveQuery(q.id)}
                    trailing={q.age}
                  >
                    {q.label}
                  </NavRow>
                ))}
                <button type="button" className={styles.viewAll}>
                  View all chats
                </button>
              </div>
            </SidebarSection>
          )}
        </div>

        <div className={styles.sidebarFoot}>
          {collapsed ? null : <ModeCard mode={mode} onChange={setMode} />}
          {collapsed ? null : access}
          <HelpAndSupport onReplayTour={onReplayTour} onHelp={onHelp} />
          <NavRow icon={<MessageSquareShare />}>Provide feedback</NavRow>
        </div>
        <div className={styles.sidebarAccount}>
          <NavRow icon={<PanelLeft />} aria-expanded={!collapsed} onClick={() => setCollapsed((v) => !v)}>
            {collapsed ? "Open sidebar" : "Close sidebar"}
          </NavRow>
          <SidebarAccount user={USER} onSignOut={() => {}} />
        </div>
      </aside>
    </SidebarContext.Provider>
  );
}

/* ══════════════════════════════════════════════════════════════════
 * Query header + view tabs (Figma 15212:86364)
 * ════════════════════════════════════════════════════════════════ */

interface ViewTab {
  value: InsightsPageView;
  label: string;
  icon: ReactNode;
  count?: number;
  tour?: string;
}

const VIEW_TABS: ViewTab[] = [
  { value: "summary", label: "Summary", icon: <LayoutDashboard /> },
  { value: "biosamples", label: "Biosamples", icon: <FlaskConical />, count: 14919, tour: "tab-biosamples" },
  { value: "pdx", label: "PDX models", icon: <Rat />, count: 203, tour: "tab-pdx" },
  { value: "participants", label: "Study monitoring", icon: <UserRound />, count: 3706, tour: "tab-participants" },
  { value: "molecular", label: "Molecular", icon: <Dna />, tour: "tab-molecular" },
];

/**
 * Tab sets. `current` = Figma 15230:84687 (five tabs). `handoff` = the original hand-off 15195:81222:
 * four views, Biosamples shown as Participants and no Study monitoring.
 */
export type InsightsTabSet = "current" | "handoff" | "conditional";

const HANDOFF_TABS: ViewTab[] = VIEW_TABS.filter((t) => t.value !== "participants").map((t) =>
  t.value === "biosamples" ? { ...t, label: "Participants", icon: <UserRound />, count: 3706 } : t,
);

/** `conditional` = Figma Insights-UI 7282:77049: Summary, Participants, PDX models, Gene, Variant. */
const CONDITIONAL_TABS: ViewTab[] = [
  { value: "summary", label: "Summary", icon: <LayoutDashboard /> },
  { value: "biosamples", label: "Participants", icon: <UserRound />, count: 4500 },
  { value: "pdx", label: "PDX models", icon: <Rat />, count: 3000 },
  { value: "gene", label: "Gene", icon: <Dna /> },
  { value: "variant", label: "Variant", icon: <Dna /> },
];

const TAB_SETS: Record<InsightsTabSet, ViewTab[]> = {
  current: VIEW_TABS,
  handoff: HANDOFF_TABS,
  conditional: CONDITIONAL_TABS,
};

function ViewTabs({ tabs, value, onChange }: { tabs: ViewTab[]; value: InsightsPageView; onChange: (v: InsightsPageView) => void }) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    let next: number | undefined;
    if (e.key === "ArrowRight") next = (i + 1) % tabs.length;
    else if (e.key === "ArrowLeft") next = (i - 1 + tabs.length) % tabs.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = tabs.length - 1;
    if (next === undefined) return;
    e.preventDefault();
    refs.current[next]?.focus();
    onChange(tabs[next].value);
  };
  return (
    <div className={styles.tabs} role="tablist" aria-label="Query views" data-tour="nav">
      {tabs.map((t, i) => {
        const selected = t.value === value;
        return (
          <button
            key={t.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`view-tab-${t.value}`}
            aria-selected={selected}
            aria-controls="view-panel"
            tabIndex={selected ? 0 : -1}
            className={cx(styles.tab, selected && styles.tabOn)}
            onClick={() => onChange(t.value)}
            onKeyDown={(e) => onKeyDown(e, i)}
            data-tour={t.tour}
          >
            <span className={cx(styles.tabChip, t.count == null && styles.tabChipSquare)} aria-hidden="true">
              {t.icon}
              {t.count != null ? <span className={styles.tabCount}>{fmt(t.count)}</span> : null}
            </span>
            <span className={styles.tabLabel}>
              {t.count != null ? <span className={styles.srOnly}>{fmt(t.count)} </span> : null}
              {t.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
 * Summary view
 * ════════════════════════════════════════════════════════════════ */

function SummaryStat({ metric }: { metric: SummaryMetric }) {
  const unpublished = metric.total - metric.published;
  const pct = (metric.published / metric.total) * 100;
  return (
    <section className={styles.stat} aria-label={metric.label}>
      <h2 className={styles.statLabel}>{metric.label}</h2>
      <p className={styles.statValue}>
        {fmt(metric.published)}
        <span className={styles.statTotal}>/{fmt(metric.total)}</span>
      </p>
      <div
        className={styles.statBar}
        role="meter"
        aria-label={`${metric.label} published`}
        aria-valuemin={0}
        aria-valuemax={metric.total}
        aria-valuenow={metric.published}
      >
        <span className={styles.statFill} style={{ width: `${pct}%` }} />
      </div>
      <p className={styles.statLegend}>
        <span className={styles.legendItem}>
          <span className={cx(styles.swatch, styles.swatchPublished)} aria-hidden="true" />
          <strong>{fmt(metric.published)}</strong> Published
        </span>
        <span className={styles.legendItem}>
          <span className={cx(styles.swatch, styles.swatchUnpublished)} aria-hidden="true" />
          <strong>{fmt(unpublished)}</strong> Unpublished
        </span>
      </p>
    </section>
  );
}

function CancerCategories() {
  return (
    <ChartCard title="Top 10 cancer categories by frequency" className={styles.cats}>
      <div className={styles.tableScroll} tabIndex={0} role="region" aria-label="Top 10 cancer categories table">
        <Table caption="Top 10 cancer categories" captionHidden>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Cancer type</TableHeaderCell>
              <TableHeaderCell>Count</TableHeaderCell>
              <TableHeaderCell>Freq</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {CANCER_CATEGORIES.map((c) => (
              <TableRow key={c.label}>
                <TableCell>
                  <span className={styles.catName}>
                    <span className={styles.catDot} style={{ background: c.color }} aria-hidden="true" />
                    {c.label}
                  </span>
                </TableCell>
                <TableCell>{fmt(c.count)}</TableCell>
                <TableCell>{c.freq}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </ChartCard>
  );
}

function MutatedGenes() {
  const [scope, setScope] = useState<"sample" | "participant">("sample");
  return (
    <ChartCard
      className={styles.genes}
      title={
        <span className={styles.genesTitle}>
          Gene mutation distributed <span className={styles.genesAcross}>across</span>
          <button
            type="button"
            className={styles.scopeChip}
            aria-label={`Count across ${scope}. Switch`}
            onClick={() => setScope((s) => (s === "sample" ? "participant" : "sample"))}
          >
            {scope} <ChevronDown aria-hidden="true" />
          </button>
        </span>
      }
    >
      <div className={styles.tableScroll} tabIndex={0} role="region" aria-label="Top mutated genes table">
        <Table caption="Top mutated genes" captionHidden>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Gene</TableHeaderCell>
              <TableHeaderCell># Mutation</TableHeaderCell>
              <TableHeaderCell># Samples</TableHeaderCell>
              <TableHeaderCell>Freq</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {MUTATED_GENES.map((g) => (
              <TableRow key={g.gene}>
                <TableCell>{g.gene}</TableCell>
                <TableCell>
                  <span className={styles.mutationCell}>
                    {fmt(g.mutations)}
                    <SplitBar split={g.split} colors={MUTATION_COLORS} />
                  </span>
                </TableCell>
                <TableCell>{fmt(g.samples)}</TableCell>
                <TableCell>{g.freq}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </ChartCard>
  );
}

/** Summary tab — Figma Insights-UI 15230:13714 (7-column chart grid). */
function SummaryView() {
  return (
    <div className={styles.summary}>
      <div className={styles.stats} data-tour="kpi">
        {SUMMARY_METRICS.map((m) => (
          <SummaryStat key={m.id} metric={m} />
        ))}
      </div>
      <div className={styles.grid}>
        <div className={styles.catsCell} data-tour="charts">
          <CancerCategories />
        </div>
        <div className={styles.genesCell} data-tour="charts">
          <MutatedGenes />
        </div>
        <ChartCard title="Experimental distribution" className={styles.experimental} data-tour="charts">
          <BarChart data={EXPERIMENTAL_STRATEGY} max={7500} ticks={[7500, 5000, 2500, 0]} label="Samples by experimental strategy" />
        </ChartCard>
        <ChartCard title="Sex at Birth Distribution" className={styles.sex} data-tour="charts">
          <PieChart data={SEX_DISTRIBUTION} donut label="Sex at birth distribution" />
        </ChartCard>
        <ChartCard title="Study distribution" className={styles.study} data-tour="charts">
          <BarChart data={STUDY_DISTRIBUTION} max={3000} ticks={[3000, 2000, 1000, 0]} label="Study distribution" />
        </ChartCard>
        <ChartCard title="Vital status" className={styles.vital} data-tour="charts">
          <PieChart data={VITAL_STATUS} donut label="Vital status" />
        </ChartCard>
        <ChartCard title="Age at diagnosis distribution" className={styles.age}>
          <BarChart data={AGE_AT_DIAGNOSIS} max={1500} ticks={[1500, 1000, 500, 0]} label="Age at diagnosis distribution" />
        </ChartCard>
        <ChartCard title="Event distribution" className={styles.event}>
          <PieChart data={EVENT_DISTRIBUTION} donut label="Event distribution" />
        </ChartCard>
        <ChartCard title="Cohort Demographics" className={styles.cohort}>
          <PieChart data={COHORT_DEMOGRAPHICS} donut label="Participants by cohort" />
        </ChartCard>
        <ChartCard
          title="Validation performed per PDX"
          className={styles.validation}
          roomy
          action={<IconButton size="sm" icon={<EllipsisVertical />} aria-label="Validation chart options" />}
        >
          <UpsetChart data={VALIDATION_UPSET} label="Validation performed per PDX" />
        </ChartCard>
        <ChartCard title="Combined sequencing performed per patient" className={styles.combined} roomy>
          <UpsetChart data={SEQUENCING_UPSET} label="Combined sequencing performed per patient" />
        </ChartCard>
      </div>
    </div>
  );
}

function PlaceholderView({ label }: { label: string }) {
  return (
    <div className={styles.placeholder}>
      <p className={styles.placeholderTitle}>{label}</p>
      <p className={styles.placeholderText}>This view isn’t part of the onboarding prototype.</p>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
 * Applied filters (Figma Insights-UI 7282:77224 "Active Filters")
 * ════════════════════════════════════════════════════════════════ */

/** Values listed inline before the rest fold into a "+N" toggle. */
const MAX_INLINE_VALUES = 10;

function FilterChip({ filter, onRemove }: { filter: AppliedFilter; onRemove: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const hidden = Math.max(0, filter.values.length - MAX_INLINE_VALUES);
  const values = expanded || !hidden ? filter.values : filter.values.slice(0, MAX_INLINE_VALUES);
  return (
    <li className={cx(styles.chip, expanded && styles.chipExpanded)}>
      <span className={styles.chipLabel}>{filter.label}</span>
      <span className={styles.chipValues}>
        <span className={styles.chipText} title={filter.values.join(", ")}>
          {values.join(", ")}
        </span>
        {hidden ? (
          <button
            type="button"
            className={styles.chipMore}
            aria-expanded={expanded}
            aria-label={expanded ? `Show fewer ${filter.label} values` : `Show ${hidden} more ${filter.label} values`}
            onClick={() => setExpanded((e) => !e)}
          >
            {expanded ? "Less" : `+${hidden}`}
            <ChevronDown aria-hidden="true" />
          </button>
        ) : null}
      </span>
      <button type="button" className={styles.chipRemove} aria-label={`Remove ${filter.label} filter`} onClick={onRemove}>
        <X aria-hidden="true" />
      </button>
    </li>
  );
}

function ActiveFilters({
  id,
  filters,
  onRemove,
  onClearAll,
}: {
  id: string;
  filters: AppliedFilter[];
  onRemove: (index: number) => void;
  onClearAll: () => void;
}) {
  return (
    <div id={id} className={styles.activeFilters}>
      <ul className={styles.chips} aria-label="Applied filters">
        {filters.map((f, i) => (
          <FilterChip key={`${f.label}-${i}`} filter={f} onRemove={() => onRemove(i)} />
        ))}
      </ul>
      <div>
        <Button variant="text" size="sm" onClick={onClearAll}>
          Clear All Filters
        </Button>
      </div>
    </div>
  );
}

/** Study filter domain (Figma 7288:45465): Cohort + Study checklists, each with "Match: Any of / None of". */
function StudyFilterPanel({ id, onClose }: { id: string; onClose: () => void }) {
  const [selection, setSelection] = useState<Record<string, string[]>>({});
  const [match, setMatch] = useState<Record<string, FilterMatch>>({ cohort: "any", study: "none" });
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const allCollapsed = collapsed.size === STUDY_FILTER_SECTIONS.length;
  const applied = Object.values(selection).some((v) => v.length > 0);
  return (
    <FilterPanel
      id={id}
      title="Study"
      onReset={() => setSelection({})}
      resetDisabled={!applied}
      onToggleAll={() => setCollapsed(allCollapsed ? new Set() : new Set(STUDY_FILTER_SECTIONS.map((s) => s.key)))}
      allCollapsed={allCollapsed}
      onClose={onClose}
    >
      {STUDY_FILTER_SECTIONS.map((sec) => (
        <FilterSection
          key={sec.key}
          title={sec.title}
          options={sec.options}
          totalCount={2468}
          value={selection[sec.key] ?? []}
          onChange={(v) => setSelection((prev) => ({ ...prev, [sec.key]: v }))}
          match={match[sec.key]}
          onMatchChange={(m) => setMatch((prev) => ({ ...prev, [sec.key]: m }))}
          expanded={!collapsed.has(sec.key)}
          onExpandedChange={(open) =>
            setCollapsed((prev) => {
              const next = new Set(prev);
              if (open) next.delete(sec.key);
              else next.add(sec.key);
              return next;
            })
          }
        />
      ))}
    </FilterPanel>
  );
}

/* ══════════════════════════════════════════════════════════════════
 * Page
 * ════════════════════════════════════════════════════════════════ */

const RAIL_TABS = [
  { value: "cancer", label: "Cancer category", icon: <Network {...RAIL_ICON} /> },
  { value: "study", label: "Study", icon: <Book {...RAIL_ICON} /> },
  { value: "participant", label: "Participant", icon: <User {...RAIL_ICON} /> },
  { value: "sample", label: "Sample", icon: <Microscope {...RAIL_ICON} /> },
  { value: "clinical", label: "Clinical", icon: <Hospital {...RAIL_ICON} /> },
  { value: "molecular", label: "Molecular", icon: <Dna {...RAIL_ICON} /> },
];

export type InsightsPageView = "summary" | "biosamples" | "pdx" | "participants" | "molecular" | "gene" | "variant";

export interface InsightsDashboardProps {
  /** "Replay onboarding tour" in the built-in Help and support menu. */
  onReplayTour?: () => void;
  /** Help and support row: replaces the built-in menu (gets the row's box to anchor your own). */
  onHelp?: (anchor: DOMRect) => void;
  /** Controlled view tab. Omit for uncontrolled. */
  view?: InsightsPageView;
  /** Which tabs the page shows. Default `current`. */
  tabSet?: InsightsTabSet;
  /** Starting tab when uncontrolled. Default `summary`. */
  initialView?: InsightsPageView;
  onViewChange?: (view: InsightsPageView) => void;
  /** Overrides a tab's built-in content (Biosamples, PDX models, Molecular); wrapped in `data-tour="<view>"`. */
  views?: Partial<Record<Exclude<InsightsPageView, "summary">, ReactNode>>;
  /** Sidebar block above Help and support, e.g. `SidebarDatasetAccess`. */
  access?: ReactNode;
  /** Overlays rendered inside the page (dialogs, tours). */
  children?: ReactNode;
  /** Filters already applied to the query (Figma 7282:77049). Default none. */
  initialFilters?: AppliedFilter[];
  /** Filter domain open in the side panel on load, e.g. `"study"`. */
  initialPanel?: string | null;
}

/**
 * Insights cohort summary (Figma Insights-UI "Untitled query - default state" 15212:85165).
 * Tabs follow Figma 15230:84687 (Summary, Biosamples, PDX models, Study monitoring, Molecular).
 * Tour anchors (`data-tour`): nav, search, kpi, charts, filters, saved, request, help, access (when
 * supplied), participants (Biosamples oncoprint), pdx (PDX summary), monitoring (Study monitoring stats),
 * molecular (gene search + frequencies).
 */
export const InsightsDashboard = forwardRef<HTMLDivElement, InsightsDashboardProps>(function InsightsDashboard(
  {
    onReplayTour = () => {},
    onHelp,
    view: viewProp,
    initialView = "summary",
    tabSet = "current",
    onViewChange,
    views,
    access,
    children,
    initialFilters = [],
    initialPanel = null,
  },
  ref,
) {
  const [internalView, setInternalView] = useState<InsightsPageView>(initialView);
  const view = viewProp ?? internalView;
  const setView = (v: InsightsPageView) => {
    if (viewProp === undefined) setInternalView(v);
    onViewChange?.(v);
  };
  const [railTab, setRailTab] = useState<string | null>(initialPanel);
  const [filters, setFilters] = useState<AppliedFilter[]>(initialFilters);
  const hasFilters = filters.length > 0;
  const sidePanelId = useId();
  // Query details (filter hint + Add filters). Figma: collapsed on Summary, expanded on the data tabs.
  const [queryOpen, setQueryOpen] = useState(
    initialFilters.length > 0 || (initialView !== "summary" && initialView !== "pdx"),
  );
  const queryPanelId = useId();
  const tabs = TAB_SETS[tabSet];
  const activeTab = tabs.find((t) => t.value === view) ?? tabs[0];

  return (
    <div className={styles.app} ref={ref}>
      <TopBar />
      <div className={styles.body}>
        <AppSidebar onReplayTour={onReplayTour} onHelp={onHelp} access={access} />
        <main className={styles.main}>
          <div className={styles.queryHeader}>
            <div className={styles.queryTitleRow}>
              <button
                type="button"
                className={cx(styles.queryToggle, queryOpen && styles.queryToggleOpen)}
                aria-expanded={queryOpen}
                aria-controls={queryPanelId}
                aria-label={queryOpen ? "Hide query details" : "Show query details"}
                onClick={() => setQueryOpen((o) => !o)}
              >
                <ChevronDown aria-hidden="true" />
              </button>
              <h1 className={styles.queryTitle}>
                <span className={styles.queryName}>{QUERY_TITLE}</span>
              </h1>
              <IconButton
                size="sm"
                icon={<Pencil />}
                aria-label="Rename query"
                title={hasFilters ? undefined : "Add filters to build the query before editing the title"}
                disabled={!hasFilters}
              />
              <span className={cx(styles.filterCount, hasFilters && styles.filterCountOn)}>
                <span className={styles.filterCountValue}>{filters.length}</span> filters
              </span>
            </div>
            <span
              data-tour="request"
              title={hasFilters ? undefined : "Select at least one filter before applying for a data access request"}
            >
              <Button size="sm" disabled={!hasFilters}>
                Request data access
              </Button>
            </span>
          </div>
          {queryOpen && hasFilters ? (
            <ActiveFilters
              id={queryPanelId}
              filters={filters}
              onRemove={(i) => setFilters((prev) => prev.filter((_, j) => j !== i))}
              onClearAll={() => setFilters([])}
            />
          ) : queryOpen ? (
            <div id={queryPanelId} className={styles.filterHint}>
              <div className={styles.filterHintCard}>
                <span className={styles.filterHintArt} aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </span>
                <span>
                  <strong className={styles.filterHintTitle}>Add filters from the right panel to start building your query</strong>
                  <span className={styles.filterHintText}>Currently displaying all available data</span>
                </span>
              </div>
              <div className={styles.filterHintActions}>
                <Button variant="text" size="sm" startIcon={<Plus />} onClick={() => setRailTab("cancer")}>
                  Add filters
                </Button>
                <Button variant="text" size="sm" disabled>
                  Clear all filters
                </Button>
              </div>
            </div>
          ) : null}
          <ViewTabs tabs={tabs} value={view} onChange={setView} />
          <div id="view-panel" role="tabpanel" aria-labelledby={`view-tab-${view}`} className={styles.panel}>
            {view !== "summary" && views?.[view] ? (
              <div className={styles.viewBody} data-tour={view}>
                {views[view]}
              </div>
            ) : view === "summary" ? (
              <SummaryView />
            ) : view === "biosamples" ? (
              <BiosamplesView />
            ) : view === "pdx" ? (
              <PdxView />
            ) : view === "molecular" ? (
              <MolecularView />
            ) : view === "participants" ? (
              <StudyMonitoringView />
            ) : view === "gene" ? (
              <GeneView />
            ) : (
              <PlaceholderView label={activeTab.label} />
            )}
          </div>
        </main>
        <div className={styles.sidePanel}>
          {railTab === "study" ? <StudyFilterPanel id={sidePanelId} onClose={() => setRailTab(null)} /> : null}
        </div>
        <div className={styles.rail} data-tour="filters">
          <FilterRail
            tabs={RAIL_TABS.map((t) => ({ ...t, applied: filters.some((f) => f.domain === t.value) }))}
            value={railTab}
            onChange={setRailTab}
            panelId={sidePanelId}
            onClearAll={() => {
              setFilters([]);
              setRailTab(null);
            }}
            clearAllDisabled={!hasFilters}
          />
        </div>
      </div>
      {children}
    </div>
  );
});
