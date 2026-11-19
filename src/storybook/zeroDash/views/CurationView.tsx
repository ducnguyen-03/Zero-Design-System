import { useEffect, useMemo, useState } from "react";
import type { MouseEvent } from "react";
import {
  ArrowDownUp,
  ArrowLeft,
  Bell,
  Check,
  ChevronDown,
  CircleMinus,
  CirclePlus,
  CircleX,
  ClockAlert,
  Construction,
  Dna,
  Download,
  EllipsisVertical,
  FileText,
  Flag,
  Search,
  Settings,
  SlidersHorizontal,
} from "lucide-react";
import { DnaLoader } from "../DnaLoader";
import {
  CASES,
  CURATOR_KEYS,
  FILTER_GROUPS,
  GRID_COLS,
  PAL,
  PEOPLE,
  SORTS,
  STATUS_ORDER,
  TOTAL_ROWS,
} from "./curationData";
import type { CaseEvent, CasePatient, CurationStatus, CuratorKey, Curators, SortKey, SubTab } from "./curationData";
import { CuratorSlots, SexGlyph, cx } from "./curationParts";
import { PatientTimeline } from "./PatientTimeline";
import { PatientCuration } from "./PatientCuration";
import styles from "./CurationView.module.css";

export type CurationScreen = "list" | "timeline" | "curation";

export interface CurationViewProps {
  /** Plot density passed through to the embedded Fitting view. */
  plotDensity?: "large" | "compact";
  /** Show the DNA loader over the grid for ~1.1s on mount (design default: on). */
  simulateLoading?: boolean;
  /** Keep the grid in its loading state. */
  forceLoading?: boolean;
  /** Timeline › Samples section state. `error` shows the retry state. */
  samplesState?: "loaded" | "error";
  /** Passed to Fitting as `showPreviewStates`. */
  showFittingPreviewStates?: boolean;
  /** Yellow scheduled-maintenance strip above the page. */
  showMaintenanceBanner?: boolean;
  /** Open patient curation for this patient directly (for stories). */
  initialPatientId?: string;
  /** Event index within the patient (0 = latest). */
  initialEventIndex?: number;
  /** Which screen to start on. Defaults to `curation` when a patient / fitting is requested, else `list`. */
  initialScreen?: CurationScreen;
  /** Curation sub-tab to start on. */
  initialSubTab?: SubTab;
  /** Open the Fitting tool (Tumour profile › Fitting). */
  initialFittingOpen?: boolean;
  /** Pre-fill the list search. */
  initialSearch?: string;
  /** Start with the list filter menu open. */
  initialFilterOpen?: boolean;
  /** Start with a sort applied. */
  initialSort?: SortKey;
}

type EvKey = string;
interface MenuState { key: EvKey; pid: string; i: number; exp: boolean; status: CurationStatus; x: number; y: number }
interface PickerState { key: EvKey; slot: 0 | 1; x: number; y: number }

const DEFAULT_PID = "06-0336";
const parseD = (s: string) => {
  if (!s) return 0;
  const [d, m, y] = s.split("/");
  return Date.UTC(+y, +m - 1, +d);
};

const STATUS_CLASS: Record<CurationStatus, string> = {
  READY: styles.stReady,
  "IN PROGRESS": styles.stProgress,
  "ON HOLD": styles.stHold,
};

export function CurationView({
  plotDensity = "compact",
  simulateLoading = true,
  forceLoading = false,
  samplesState = "loaded",
  showFittingPreviewStates = true,
  showMaintenanceBanner = false,
  initialPatientId,
  initialEventIndex = 0,
  initialScreen,
  initialSubTab,
  initialFittingOpen = false,
  initialSearch = "",
  initialFilterOpen = false,
  initialSort = "",
}: CurationViewProps) {
  const [screen, setScreen] = useState<CurationScreen>(
    initialScreen ?? (initialPatientId || initialFittingOpen || initialSubTab ? "curation" : "list"),
  );
  const [pid, setPid] = useState(initialPatientId ?? DEFAULT_PID);
  const [ei, setEi] = useState(initialEventIndex);
  const [visit, setVisit] = useState(0);

  const [search, setSearch] = useState(initialSearch);
  const [quick, setQuick] = useState<{ exp?: boolean; me?: boolean }>({});
  const [filterOpen, setFilterOpen] = useState(initialFilterOpen);
  const [fchk, setFchk] = useState<Record<string, boolean>>({});
  const [fexp, setFexp] = useState("");
  const [sortOpen, setSortOpen] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>(initialSort);
  const [loading, setLoading] = useState(false);

  const [statusOv, setStatusOv] = useState<Record<EvKey, CurationStatus>>({});
  const [curOv, setCurOv] = useState<Record<EvKey, Curators>>({});
  const [expOv, setExpOv] = useState<Record<EvKey, boolean>>({});
  const [menu, setMenu] = useState<MenuState | null>(null);
  const [picker, setPicker] = useState<PickerState | null>(null);
  const [clinicalNotes, setClinicalNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!simulateLoading) return undefined;
    setLoading(true);
    const t = window.setTimeout(() => setLoading(false), 1100);
    return () => window.clearTimeout(t);
  }, [simulateLoading]);

  const evState = (p: CasePatient, e: CaseEvent, i: number) => {
    const key = `${p.id}|${i}`;
    return { key, status: statusOv[key] ?? e.status, cur: curOv[key] ?? e.cur, exp: key in expOv ? expOv[key] : e.exp };
  };

  const go = (next: CurationScreen, nextPid?: string, nextEi = 0) => {
    setScreen(next);
    if (nextPid) setPid(nextPid);
    setEi(nextEi);
    setMenu(null);
    setPicker(null);
    setVisit((v) => v + 1);
  };

  const openPicker = (key: EvKey, slot: 0 | 1, e: MouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const W = 240, H = 330;
    let y = r.bottom + 6;
    if (y + H > window.innerHeight - 8) y = Math.max(8, r.top - 6 - H);
    setPicker({ key, slot, x: Math.max(8, Math.min(r.left, window.innerWidth - W - 8)), y });
    setMenu(null);
  };

  /* ── list derivation ── */
  const subSel = (label: string, opts?: string[]) => (opts ?? []).filter((o) => fchk[`${label}|${o}`]);
  const nChecked = Object.keys(fchk).filter((k) => fchk[k] && k !== "Show all cases").length;

  const groups = useMemo(() => {
    const q = search.trim().toLowerCase();
    const stSel = subSel("Curation status", FILTER_GROUPS[0][3].options);
    const pcSel = subSel("Primary curator", FILTER_GROUPS[0][4].options);
    const out = CASES.flatMap((p) => {
      if ((fchk.Female || fchk.Male) && !((fchk.Female && p.sex === "F") || (fchk.Male && p.sex === "M"))) return [];
      if ((fchk.Alive || fchk.Deceased) && !((fchk.Alive && p.alive) || (fchk.Deceased && !p.alive))) return [];
      const rows = p.events.flatMap((e, i) => {
        const st = evState(p, e, i);
        if (q && ![p.id, e.name, e.cohort, e.dx].some((v) => (v || "").toLowerCase().includes(q))) return [];
        if ((quick.exp || fchk["Expedited only"]) && !st.exp) return [];
        if (quick.me && !st.cur.includes("DN")) return [];
        if (fchk["Has HTS"] && !e.hts) return [];
        if (stSel.length && !stSel.includes(st.status)) return [];
        if (pcSel.length && !(st.cur[0] && pcSel.includes(PEOPLE[st.cur[0]][0]))) return [];
        return [{ e, i, st }];
      });
      return rows.length ? [{ p, rows }] : [];
    });
    if (sortKey === "Patient ID") out.sort((a, b) => a.p.id.localeCompare(b.p.id));
    if (sortKey === "Collection date (newest)")
      out.sort((a, b) => Math.max(...b.rows.map((r) => parseD(r.e.coll))) - Math.max(...a.rows.map((r) => parseD(r.e.coll))));
    if (sortKey === "Status")
      out.sort((a, b) => Math.min(...a.rows.map((r) => STATUS_ORDER[r.st.status])) - Math.min(...b.rows.map((r) => STATUS_ORDER[r.st.status])));
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, quick, fchk, sortKey, statusOv, curOv, expOv]);
  const nRows = groups.reduce((n, g) => n + g.rows.length, 0);
  const showLoading = loading || forceLoading;

  /* ── patient ── */
  const patient = CASES.find((p) => p.id === pid) ?? CASES[4];
  const eIdx = Math.min(ei, patient.events.length - 1);
  const evRaw = patient.events[eIdx];
  const evs = evState(patient, evRaw, eIdx);
  const stagePill = evs.status === "READY" ? "Ready to start" : evs.status === "ON HOLD" ? "On hold" : "Secondary curation in progress";

  /* picker current curators */
  let pickerCur: Curators | null = null;
  if (picker) {
    const [pid2, i2] = picker.key.split("|");
    const p2 = CASES.find((p) => p.id === pid2)!;
    pickerCur = evState(p2, p2.events[+i2], +i2).cur;
  }

  const toggleCheck = (k: string) => setFchk((x) => ({ ...x, [k]: !x[k] }));

  return (
    <div className={styles.root}>
      {showMaintenanceBanner ? (
        <div className={styles.banner} role="status">
          <Construction size={20} strokeWidth={1.8} aria-hidden="true" />
          <span>
            Scheduled maintenance: <strong>1:30 PM, Wed 21 Oct (GMT+7) – 2:30 PM, Wed 21 Oct (GMT+7)</strong>. Please save
            your work before maintenance begins.
          </span>
        </div>
      ) : null}

      {screen === "list" ? (
        <div className={styles.sheet} data-screen-label="Curation list">
          <h2 className={styles.greeting}>Hi Duc, here's the latest on Zerodash</h2>

          <div className={styles.toolbar}>
            <label className={styles.search}>
              <Search size={18} strokeWidth={2} aria-hidden="true" />
              <input
                type="text"
                placeholder="Search"
                aria-label="Search cases"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
            <div className={styles.vRule} />

            <div className={styles.anchor}>
              <button
                type="button"
                className={cx(styles.tbBtn, (filterOpen || nChecked > 0) && styles.tbBtnOn)}
                aria-expanded={filterOpen}
                onClick={() => { setFilterOpen(!filterOpen); setSortOpen(false); }}
              >
                <SlidersHorizontal size={19} strokeWidth={1.8} aria-hidden="true" />
                Filter{nChecked ? ` (${nChecked})` : ""}
                <ChevronDown size={18} strokeWidth={2} aria-hidden="true" />
              </button>
              {filterOpen ? (
                <>
                  <div className={styles.scrim} onClick={() => { setFilterOpen(false); setFexp(""); }} />
                  <div className={styles.filterMenu} data-screen-label="Filter menu" role="menu">
                    <div className={styles.filterScroll}>
                      {FILTER_GROUPS.map((g, gi) => (
                        <div key={gi} className={cx(styles.filterGroup, gi > 0 && styles.filterGroupDivided)}>
                          {g.map((f) => {
                            const sel = subSel(f.label, f.options);
                            const on = f.options ? sel.length > 0 : !!fchk[f.label];
                            const open = fexp === f.label;
                            return (
                              <div key={f.label}>
                                <div
                                  role="menuitemcheckbox"
                                  aria-checked={on}
                                  tabIndex={0}
                                  className={styles.filterItem}
                                  onClick={() => (f.options ? setFexp(open ? "" : f.label) : toggleCheck(f.label))}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                      e.preventDefault();
                                      if (f.options) setFexp(open ? "" : f.label);
                                      else toggleCheck(f.label);
                                    }
                                  }}
                                >
                                  <span className={cx(styles.box, on && styles.boxOn)} aria-hidden="true">
                                    <Check size={12} strokeWidth={3} />
                                  </span>
                                  {f.sex ? (
                                    <span className={styles.sexTag}><SexGlyph sex={f.sex} size={14} /></span>
                                  ) : null}
                                  <span className={styles.grow}>{f.label}</span>
                                  {f.options ? (
                                    <span
                                      className={cx(styles.expander, sel.length > 0 && styles.expanderOn)}
                                      onClick={(e) => { e.stopPropagation(); setFexp(open ? "" : f.label); }}
                                    >
                                      {open ? <CircleMinus size={20} strokeWidth={1.8} /> : <CirclePlus size={20} strokeWidth={1.8} />}
                                    </span>
                                  ) : null}
                                </div>
                                {open && f.options ? (
                                  <div className={styles.filterSub}>
                                    {f.options.map((o) => {
                                      const k = `${f.label}|${o}`;
                                      return (
                                        <div
                                          key={o}
                                          role="menuitemcheckbox"
                                          aria-checked={!!fchk[k]}
                                          tabIndex={0}
                                          className={styles.filterOption}
                                          onClick={() => toggleCheck(k)}
                                          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleCheck(k); } }}
                                        >
                                          <span className={cx(styles.box, styles.boxSm, fchk[k] && styles.boxOn)} aria-hidden="true">
                                            <Check size={10} strokeWidth={3} />
                                          </span>
                                          <span>{o}</span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                ) : null}
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      className={cx(styles.clearAll, nChecked > 0 && styles.clearAllOn)}
                      disabled={!nChecked && !fchk["Show all cases"]}
                      onClick={() => { setFchk({}); setFexp(""); }}
                    >
                      Clear all filters
                      <CircleX size={20} strokeWidth={1.8} aria-hidden="true" />
                    </button>
                  </div>
                </>
              ) : null}
            </div>

            <div className={styles.anchor}>
              <button
                type="button"
                className={cx(styles.tbBtn, styles.sortBtn, (sortOpen || !!sortKey) && styles.tbBtnOn)}
                aria-expanded={sortOpen}
                onClick={() => { setSortOpen(!sortOpen); setFilterOpen(false); }}
              >
                <ArrowDownUp size={19} strokeWidth={1.8} aria-hidden="true" />
                {sortKey ? `Sort: ${sortKey}` : "Sort by"}
                <ChevronDown size={18} strokeWidth={2} aria-hidden="true" />
              </button>
              {sortOpen ? (
                <>
                  <div className={styles.scrim} onClick={() => setSortOpen(false)} />
                  <div className={styles.sortMenu} role="menu">
                    {SORTS.map((o) => {
                      const sel = sortKey === o.value;
                      return (
                        <button
                          key={o.label}
                          type="button"
                          role="menuitemradio"
                          aria-checked={sel}
                          className={cx(styles.menuRow, sel && styles.menuRowSel)}
                          onClick={() => { setSortKey(o.value); setSortOpen(false); }}
                        >
                          {o.label}
                          {sel ? <Check size={16} strokeWidth={2.4} className={styles.checkInk} aria-hidden="true" /> : null}
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : null}
            </div>

            <span className={styles.quickLabel}>Quick filters</span>
            {([["exp", "Expedited"], ["me", "Assigned to me"]] as const).map(([k, l]) => (
              <button
                key={k}
                type="button"
                aria-pressed={!!quick[k]}
                className={cx(styles.quick, quick[k] && styles.quickOn)}
                onClick={() => setQuick((x) => ({ ...x, [k]: !x[k] }))}
              >
                {l}
              </button>
            ))}

            <div className={styles.toolbarEnd}>
              <span className={styles.rowsLoaded}>{nRows} of {TOTAL_ROWS} rows loaded</span>
              <div className={cx(styles.vRule, styles.vRuleWide)} />
              <button type="button" className={styles.linkBtn}><FileText size={19} strokeWidth={1.8} aria-hidden="true" />Related</button>
              <button type="button" className={styles.linkBtn}><Download size={19} strokeWidth={1.8} aria-hidden="true" />Export</button>
            </div>
          </div>

          <div className={styles.grid} data-screen-label="Curation grid">
            <div role="grid" aria-label="Curation cases" aria-busy={showLoading} className={styles.gridInner}>
              <div role="row" className={styles.gridHead}>
                {GRID_COLS.map(([label, w]) => (
                  <div key={label} role="columnheader" className={styles.th} style={{ flex: `0 0 ${w}px` }}>{label}</div>
                ))}
                <div className={styles.thEnd} />
              </div>
              {!groups.length && !showLoading ? <div className={styles.noRows}>No rows</div> : null}
              {groups.map(({ p, rows }) => (
                <div role="rowgroup" key={p.id}>
                  <div className={styles.groupHead}>
                    <span>Patient ID(s):</span>
                    <button type="button" className={styles.groupLink} onClick={() => go("timeline", p.id)}>{p.id}</button>
                    <span className={styles.groupSex} title={p.sex === "F" ? "Female" : "Male"}><SexGlyph sex={p.sex} /></span>
                  </div>
                  {rows.map(({ e, i, st }) => (
                    <div
                      role="row"
                      key={i}
                      className={styles.row}
                      onClick={() => go("curation", p.id, i)}
                    >
                      <div className={cx(styles.cellEvent, st.exp && styles.cellEventExp)}>
                        {st.exp ? (
                          <ClockAlert size={24} strokeWidth={1.8} className={styles.expIcon} aria-label="Expedited" />
                        ) : (
                          <span className={styles.expSpacer} />
                        )}
                        <div className={styles.eventStack}>
                          <button
                            type="button"
                            className={styles.eventName}
                            onClick={(ev) => { ev.stopPropagation(); go("curation", p.id, i); }}
                          >
                            {e.name}
                          </button>
                          {e.tags?.length ? (
                            <div className={styles.tags}>
                              {e.tags.map((tg) => <span key={tg} className={styles.tag}>{tg}</span>)}
                            </div>
                          ) : null}
                        </div>
                      </div>
                      <div className={styles.td} style={{ flex: "0 0 180px" }}>
                        <span className={cx(styles.status, STATUS_CLASS[st.status])}>{st.status}</span>
                      </div>
                      <div className={styles.td} style={{ flex: "0 0 110px", padding: "0 6px" }}>
                        {e.coll ? <span className={styles.coll}>{e.coll}</span> : null}
                      </div>
                      <div className={cx(styles.td, styles.tdText)} style={{ flex: "0 0 80px" }}>ZERO2</div>
                      <div className={cx(styles.td, styles.tdText, styles.cohortCell)} style={{ flex: "0 0 200px" }}>
                        <span className={styles.ellipsis} title={e.cohort || "-"}>{e.cohort || "-"}</span>
                        <span
                          className={cx(styles.pc, e.pc === "C" ? styles.pcConfirmed : styles.pcPending)}
                          title={e.pc === "C" ? "Cohort confirmed" : "Cohort pending"}
                        >
                          {e.pc}
                        </span>
                      </div>
                      <div className={cx(styles.td, styles.tdText, styles.ellipsis)} style={{ flex: "0 0 200px" }} title={e.dx || "-"}>{e.dx || "-"}</div>
                      <div className={cx(styles.td, styles.tdText, styles.num)} style={{ flex: "0 0 110px" }}>{e.mb || "-"}</div>
                      <div className={cx(styles.td, styles.tdText, styles.num)} style={{ flex: "0 0 60px" }}>{e.pur || "-"}</div>
                      <div className={styles.td} style={{ flex: "0 0 200px" }}>
                        <CuratorSlots cur={st.cur} onSlotClick={(slot, ev) => openPicker(st.key, slot, ev)} />
                      </div>
                      <div className={styles.tdEnd}>
                        <button
                          type="button"
                          aria-label="Row actions"
                          className={styles.kebab}
                          onClick={(ev) => {
                            ev.stopPropagation();
                            const r = ev.currentTarget.getBoundingClientRect();
                            let y = r.bottom + 4;
                            if (y + 170 > window.innerHeight) y = r.top - 174;
                            setMenu({ key: st.key, pid: p.id, i, exp: st.exp, status: st.status, x: Math.min(r.right - 200, window.innerWidth - 208), y });
                            setPicker(null);
                          }}
                        >
                          <EllipsisVertical size={20} aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            {showLoading ? (
              <div className={styles.loadingCover}>
                <DnaLoader label="Loading cases…" />
              </div>
            ) : null}
          </div>
        </div>
      ) : (
        <>
          {/* ── patient header ── */}
          <div className={styles.pHead}>
            <button type="button" className={styles.back} aria-label="Back to curation list" onClick={() => go("list")}>
              <ArrowLeft size={20} strokeWidth={2} aria-hidden="true" />
            </button>
            <div className={styles.pIdent}>
              <div className={styles.pIdRow}>
                <span>
                  {screen === "curation" ? "Patient ID:" : "Patient ID(s):"} <span className={styles.pIdVal}>{patient.id}</span>
                </span>
                <span className={styles.sexTag} title={patient.sex === "F" ? "Female" : "Male"}><SexGlyph sex={patient.sex} /></span>
              </div>
              {screen === "curation" ? (
                <div className={styles.pEvRow}>
                  <span className={styles.pEvName}>{evRaw.name}</span>
                  <span className={styles.pStatus}>{evs.status}</span>
                  {(evRaw.chips ?? []).map((c) => (
                    <span key={c.label} className={cx(styles.headChip, c.tone === "danger" && styles.headChipDanger)}>
                      {c.dna ? <Dna size={14} strokeWidth={2} aria-hidden="true" /> : null}
                      {c.label}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
            <nav aria-label="Patient" className={styles.pTabs}>
              {([["Timeline", "timeline"], ["Curation", "curation"]] as const).map(([l, s]) => (
                <button
                  key={s}
                  type="button"
                  aria-current={screen === s ? "page" : undefined}
                  className={cx(styles.pTab, screen === s && styles.pTabOn)}
                  onClick={() => go(s, patient.id, s === "curation" ? eIdx : 0)}
                >
                  {l}
                </button>
              ))}
            </nav>
            <div className={styles.pActions}>
              {screen === "curation" ? (
                <>
                  <button type="button" className={styles.roundBtn} aria-label="Settings"><Settings size={20} strokeWidth={1.8} /></button>
                  <button type="button" className={styles.roundBtn} aria-label="Flags">
                    <Flag size={20} strokeWidth={1.8} />
                    <span className={styles.flagDot} />
                  </button>
                </>
              ) : null}
              <button type="button" className={styles.roundBtn} aria-label="Notifications"><Bell size={20} strokeWidth={1.8} /></button>
              {screen === "curation" ? (
                <>
                  <div className={styles.headSlots}>
                    <CuratorSlots cur={evs.cur} size={40} onSlotClick={(slot, ev) => openPicker(evs.key, slot, ev)} />
                  </div>
                  <span className={styles.stagePill} aria-disabled="true" title={stagePill}>{stagePill}</span>
                </>
              ) : null}
            </div>
          </div>

          {screen === "timeline" ? (
            <PatientTimeline
              key={`t-${patient.id}-${visit}`}
              pid={patient.id}
              samplesState={samplesState}
              onGoCuration={() => go("curation", patient.id, 0)}
            />
          ) : (
            <PatientCuration
              key={`c-${patient.id}-${eIdx}-${visit}`}
              patient={patient}
              initialSubTab={visit === 0 ? initialSubTab : undefined}
              initialFittingOpen={visit === 0 ? initialFittingOpen : false}
              plotDensity={plotDensity}
              showFittingPreviewStates={showFittingPreviewStates}
              savedNotes={clinicalNotes[patient.id]}
              onSaveNotes={(html) => setClinicalNotes((x) => ({ ...x, [patient.id]: html }))}
            />
          )}
        </>
      )}

      {/* ── row action menu ── */}
      {menu ? (
        <>
          <div className={styles.scrimFixed} onClick={() => setMenu(null)} />
          <div role="menu" className={styles.floatMenu} style={{ left: menu.x, top: menu.y, width: 200 }}>
            <button type="button" role="menuitem" className={styles.floatItem} onClick={() => go("curation", menu.pid, menu.i)}>Open</button>
            <button
              type="button"
              role="menuitem"
              className={styles.floatItem}
              onClick={() => { setPicker({ key: menu.key, slot: 0, x: menu.x, y: menu.y }); setMenu(null); }}
            >
              Assign curator
            </button>
            <button
              type="button"
              role="menuitem"
              className={styles.floatItem}
              onClick={() => {
                setStatusOv((x) => ({ ...x, [menu.key]: menu.status === "ON HOLD" ? "IN PROGRESS" : "ON HOLD" }));
                setMenu(null);
              }}
            >
              {menu.status === "ON HOLD" ? "Remove hold" : "Put on hold"}
            </button>
            <button
              type="button"
              role="menuitem"
              className={styles.floatItem}
              onClick={() => { setExpOv((x) => ({ ...x, [menu.key]: !menu.exp })); setMenu(null); }}
            >
              {menu.exp ? "Remove expedite" : "Expedite"}
            </button>
          </div>
        </>
      ) : null}

      {/* ── curator picker ── */}
      {picker && pickerCur ? (
        <>
          <div className={styles.scrimFixed} onClick={() => setPicker(null)} />
          <div role="menu" className={styles.floatMenu} style={{ left: picker.x, top: picker.y, width: 240 }}>
            <div className={styles.pickerTitle}>{picker.slot ? "Secondary curator" : "Primary curator"}</div>
            {([null, ...CURATOR_KEYS] as Array<CuratorKey | null>).map((t) => {
              const sel = (pickerCur![picker.slot] ?? null) === t;
              const pal = t ? PAL[PEOPLE[t][1]] : null;
              return (
                <button
                  key={t ?? "none"}
                  type="button"
                  role="menuitemradio"
                  aria-checked={sel}
                  className={cx(styles.pickerRow, sel && styles.menuRowSel)}
                  onClick={() => {
                    const nc = [...pickerCur!] as Curators;
                    nc[picker.slot] = t;
                    setCurOv((x) => ({ ...x, [picker.key]: nc }));
                    setPicker(null);
                  }}
                >
                  <span
                    className={cx(styles.pickerAv, !pal && styles.pickerAvEmpty)}
                    style={pal ? { background: pal[0], borderColor: pal[1] } : undefined}
                  >
                    {t ?? ""}
                  </span>
                  {t ? PEOPLE[t][0] : "Unassigned"}
                </button>
              );
            })}
          </div>
        </>
      ) : null}
    </div>
  );
}

export default CurationView;
