import { useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent, MouseEvent, ReactNode } from "react";
import { Check, ChevronDown, ChevronRight, Ellipsis, Mars, Pencil, Search, SlidersHorizontal, Venus, X } from "lucide-react";
import { Button } from "../../../components/Button/Button";
import {
  COMPLETE_TONE,
  FILTER_CHECKS,
  FILTER_FIELDS,
  HTS_COLUMNS,
  HTS_COMPLETE,
  HTS_REPORT,
  QC_TONE,
  REPORT_TONE,
  buildHtsData,
  evKey,
  optionLabel,
  reportOf,
} from "./htsData";
import type { FilterCheck, HtsComplete, HtsData, HtsReport, HtsScreen, Sex, Tone } from "./htsData";
import styles from "./HtsDashboardView.module.css";

export interface HtsDashboardViewProps {
  /** Pre-fills the search box (patient, biosample, screen, event or diagnosis). */
  initialQuery?: string;
}

const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(" ");
const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/* ── Small local pieces ─────────────────────────────────────────── */

function Pill({ tone, children }: { tone: Tone; children: ReactNode }) {
  return <span className={cx(styles.pill, styles[`tone-${tone}`])}>{children}</span>;
}

function Box({ on, small = false }: { on: boolean; small?: boolean }) {
  return (
    <span className={cx(styles.box, small && styles.boxSm, on && styles.boxOn)} aria-hidden="true">
      {on ? <Check strokeWidth={3} /> : null}
    </span>
  );
}

function SexIcon({ sex, inline = false }: { sex: Sex; inline?: boolean }) {
  if (sex !== "F" && sex !== "M") return null;
  const Glyph = sex === "F" ? Venus : Mars;
  const label = sex === "F" ? "Female" : "Male";
  return (
    <span
      role="img"
      aria-label={label}
      title={label}
      className={cx(inline ? styles.sexInline : styles.sexAvatar, sex === "F" ? styles.sexF : styles.sexM)}
    >
      <Glyph aria-hidden="true" />
    </span>
  );
}

/** Activate on Enter / Space for div-based buttons. */
const onKeyActivate = (fn: () => void) => (e: KeyboardEvent) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    fn();
  }
};
const stop = (e: MouseEvent) => e.stopPropagation();

/* ── Types ──────────────────────────────────────────────────────── */

interface EventGroup {
  key: string;
  patientId: string;
  sex: Sex;
  event: string;
  diagnosis: string;
  complete: HtsComplete;
  screens: HtsScreen[];
}
interface PatientGroup {
  patientId: string;
  sex: Sex;
  events: EventGroup[];
}

type Dialog =
  | { kind: "screen"; id: string; complete: HtsComplete; report: HtsReport; notes: string }
  | { kind: "event"; key: string; complete: HtsComplete };

/* ── View ───────────────────────────────────────────────────────── */

export function HtsDashboardView({ initialQuery = "" }: HtsDashboardViewProps) {
  const [data, setData] = useState<HtsData>(() => buildHtsData());
  const [query, setQuery] = useState(initialQuery);
  const [checks, setChecks] = useState<FilterCheck[]>([]);
  const [opts, setOpts] = useState<Record<string, string[]>>({});
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterExpanded, setFilterExpanded] = useState<string | null>(null);
  const [patientOpen, setPatientOpen] = useState<Record<string, boolean>>({});
  const [eventOpen, setEventOpen] = useState<Record<string, boolean>>({});
  const [doneScreensOpen, setDoneScreensOpen] = useState<Record<string, boolean>>({});
  const [doneEventsOpen, setDoneEventsOpen] = useState<Record<string, boolean>>({});
  const [dlg, setDlg] = useState<Dialog | null>(null);
  const [dropdown, setDropdown] = useState<string | null>(null);

  useEffect(() => setQuery(initialQuery), [initialQuery]);

  // Escape closes the innermost layer: dialog dropdown → dialog → filter panel.
  const layers = useRef({ dropdown, dlg, filterOpen });
  layers.current = { dropdown, dlg, filterOpen };
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const l = layers.current;
      if (l.dropdown) setDropdown(null);
      else if (l.dlg) setDlg(null);
      else if (l.filterOpen) setFilterOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const filterCount = checks.length + Object.values(opts).reduce((n, a) => n + a.length, 0);
  const ql = query.trim().toLowerCase();
  const filtered = filterCount > 0 || !!ql;

  const patients = useMemo<PatientGroup[]>(() => {
    const match = (s: HtsScreen) => {
      const x = {
        s,
        report: reportOf(data, s.id),
        eventComplete: data.events[evKey(s.patientId, s.event)] || "IN PROGRESS",
      };
      if (ql && ![s.patientId, s.biosample, s.screen, s.diagnosis, s.event].some((v) => v.toLowerCase().includes(ql)))
        return false;
      if (checks.includes("Screened only") && !s.screenDate) return false;
      if (checks.includes("Curated only") && !s.curationDate) return false;
      return FILTER_FIELDS.every((f) => {
        const sel = opts[f.label];
        return !sel?.length || sel.includes(f.get(x));
      });
    };
    const groups = new Map<string, PatientGroup>();
    data.screens.forEach((s) => {
      if (!match(s)) return;
      let g = groups.get(s.patientId);
      if (!g) {
        g = { patientId: s.patientId, sex: s.sex, events: [] };
        groups.set(s.patientId, g);
      }
      const k = evKey(s.patientId, s.event);
      let ev = g.events.find((e) => e.key === k);
      if (!ev) {
        ev = {
          key: k,
          patientId: s.patientId,
          sex: s.sex,
          event: s.event,
          diagnosis: s.diagnosis,
          complete: data.events[k] || "IN PROGRESS",
          screens: [],
        };
        g.events.push(ev);
      }
      ev.screens.push(s);
    });
    return [...groups.values()];
  }, [data, ql, checks, opts]);

  const shown = patients.reduce((n, p) => n + p.events.reduce((m, e) => m + e.screens.length, 0), 0);

  const resetFilters = () => {
    setChecks([]);
    setOpts({});
  };
  const toggleCheck = (c: FilterCheck) =>
    setChecks((cur) => (cur.includes(c) ? cur.filter((x) => x !== c) : [...cur, c]));
  const toggleOpt = (field: string, v: string) =>
    setOpts((cur) => {
      const sel = cur[field] || [];
      return { ...cur, [field]: sel.includes(v) ? sel.filter((x) => x !== v) : [...sel, v] };
    });

  const openScreenDialog = (s: HtsScreen) => {
    setDropdown(null);
    setDlg({ kind: "screen", id: s.id, complete: s.complete, report: reportOf(data, s.id), notes: s.comments });
  };

  /* ── Screen table ── */
  const renderTable = (rows: HtsScreen[], caption: string, completed: boolean) => (
    <div className={styles.tableScroll}>
      <div role="table" aria-label={caption} className={styles.table}>
        <div role="row" className={styles.headRow}>
          {HTS_COLUMNS.map((c, i) => (
            <div
              key={c.key}
              role="columnheader"
              className={cx(styles.th, i === 0 && styles.sticky, i === HTS_COLUMNS.length - 1 && styles.pushRight)}
              style={{ flexBasis: c.width }}
            >
              {c.label}
            </div>
          ))}
        </div>
        {rows.map((s) => {
          const rep = reportOf(data, s.id);
          const qc = (v: string | null) => (v ? <Pill tone={QC_TONE[v] ?? "neutral"}>{v}</Pill> : <span className={styles.dash}>–</span>);
          return (
            <div key={s.id} role="row" className={cx(styles.row, completed && styles.rowDone)}>
              <div role="cell" className={cx(styles.td, styles.sticky, styles.bioCell)} style={{ flexBasis: 236 }}>
                <button
                  type="button"
                  className={styles.link}
                  title="Open the HTS tab for this biosample"
                  aria-label={`Open HTS for ${s.biosample}`}
                >
                  {s.biosample}
                </button>
              </div>
              <div role="cell" title={s.screen} className={cx(styles.td, styles.screenCell)} style={{ flexBasis: 168 }}>
                {s.screen}
              </div>
              <div role="cell" className={cx(styles.td, styles.textCell)} style={{ flexBasis: 124 }}>
                {s.screenDate ?? <span className={styles.dash}>–</span>}
              </div>
              <div role="cell" className={styles.td} style={{ flexBasis: 120 }}>
                {qc(s.dataQc)}
              </div>
              <div role="cell" className={styles.td} style={{ flexBasis: 120 }}>
                {qc(s.sampleQc)}
              </div>
              <div role="cell" className={cx(styles.td, styles.textCell)} style={{ flexBasis: 124 }}>
                {s.curationDate ?? <span className={styles.dash}>–</span>}
              </div>
              <div role="cell" className={styles.td} style={{ flexBasis: 120 }}>
                {qc(s.screenStatus)}
              </div>
              <div role="cell" className={styles.td} style={{ flexBasis: 128 }}>
                <button
                  type="button"
                  className={styles.badgeBtn}
                  aria-label={`HTS report ${rep}, edit`}
                  onClick={() => openScreenDialog(s)}
                >
                  <Pill tone={REPORT_TONE[rep]}>{rep}</Pill>
                </button>
              </div>
              <div role="cell" className={styles.td} style={{ flexBasis: 148 }}>
                <button
                  type="button"
                  className={styles.badgeBtn}
                  aria-label={`HTS complete ${s.complete}, edit`}
                  onClick={() => openScreenDialog(s)}
                >
                  <Pill tone={COMPLETE_TONE[s.complete]}>{s.complete}</Pill>
                </button>
              </div>
              <div role="cell" className={cx(styles.td, styles.notesCell)} style={{ flexBasis: 200 }}>
                {s.comments ? (
                  <span className={styles.note} title={s.comments} onClick={() => openScreenDialog(s)}>
                    {s.comments}
                  </span>
                ) : (
                  <span className={styles.noNote}>No notes yet</span>
                )}
              </div>
              <div role="cell" className={cx(styles.menuCell, styles.pushRight)} style={{ flexBasis: 48 }}>
                <button
                  type="button"
                  className={styles.iconBtn}
                  aria-haspopup="dialog"
                  aria-label={`Update HTS status for ${s.biosample}`}
                  onClick={() => openScreenDialog(s)}
                >
                  <Ellipsis aria-hidden="true" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  /* ── Collapsible "Completed …" bar ── */
  const renderBar = (label: string, open: boolean, count: number, onToggle: () => void, nested: boolean) => (
    <div
      role="button"
      tabIndex={0}
      aria-expanded={open}
      className={cx(styles.bar, nested ? styles.barNested : styles.barTop)}
      onClick={onToggle}
      onKeyDown={onKeyActivate(onToggle)}
    >
      <span className={cx(styles.chev, open && styles.chevOpen)}>
        <ChevronRight aria-hidden="true" />
      </span>
      <span className={styles.barLabel}>{label}</span>
      {!open ? <span className={styles.count}>{count}</span> : null}
    </div>
  );

  /* ── Event section ── */
  const renderEvent = (ev: EventGroup, completed: boolean) => {
    const open = eventOpen[ev.key] ?? !completed;
    const active = completed ? ev.screens : ev.screens.filter((s) => s.complete !== "DONE");
    const done = completed ? [] : ev.screens.filter((s) => s.complete === "DONE");
    const doneOpen = !!doneScreensOpen[ev.key];
    const toggle = () => setEventOpen((cur) => ({ ...cur, [ev.key]: !open }));
    return (
      <section key={ev.key} aria-label={`${ev.event} — ${plural(ev.screens.length, "screen")}`} className={styles.event}>
        <div className={styles.eventHead} onClick={toggle}>
          <span
            role="button"
            tabIndex={0}
            aria-expanded={open}
            aria-label={`${ev.event}, ${open ? "collapse" : "expand"}`}
            className={styles.eventToggle}
            onKeyDown={onKeyActivate(toggle)}
          >
            <span className={cx(styles.chev, open && styles.chevOpen)}>
              <ChevronRight aria-hidden="true" />
            </span>
          </span>
          <span className={styles.eventName}>{ev.event}</span>
          <span className={styles.count}>{ev.screens.length}</span>
          <span className={styles.diagnosis} title={ev.diagnosis}>
            {ev.diagnosis}
          </span>
          <span className={styles.grow} />
          <span className={styles.eventStatus} onClick={stop}>
            <span className={styles.eventStatusLabel}>HTS complete</span>
            <Pill tone={COMPLETE_TONE[ev.complete]}>{ev.complete}</Pill>
            <button
              type="button"
              className={styles.txtBtn}
              aria-label={`Update HTS status for ${ev.event}`}
              onClick={() => {
                setDropdown(null);
                setDlg({ kind: "event", key: ev.key, complete: ev.complete });
              }}
            >
              <Pencil aria-hidden="true" />
              Update
            </button>
          </span>
        </div>
        {open ? (
          <div className={styles.eventBody}>
            {active.length
              ? renderTable(
                  active,
                  `HTS ${completed ? "completed " : ""}screens for ${ev.event}, patient ${ev.patientId}`,
                  completed,
                )
              : null}
            {done.length ? (
              <>
                {renderBar("Completed screens", doneOpen, done.length, () =>
                  setDoneScreensOpen((cur) => ({ ...cur, [ev.key]: !doneOpen })), true)}
                {doneOpen
                  ? renderTable(done, `HTS completed screens for ${ev.event}, patient ${ev.patientId}`, true)
                  : null}
              </>
            ) : null}
          </div>
        ) : null}
      </section>
    );
  };

  /* ── Dialog derived state ── */
  const scr = dlg?.kind === "screen" ? data.screens.find((s) => s.id === dlg.id) ?? null : null;
  const evInfo =
    dlg?.kind === "event"
      ? (() => {
          const [pid, ev] = dlg.key.split("|");
          const sc = data.screens.filter((s) => s.patientId === pid && s.event === ev);
          return {
            pid,
            ev,
            sex: sc[0]?.sex ?? null,
            n: sc.length,
            openN: sc.filter((s) => s.complete !== "DONE").length,
            cur: data.events[dlg.key] || ("IN PROGRESS" as HtsComplete),
          };
        })()
      : null;

  let dirty = false;
  let hint = "";
  if (dlg?.kind === "screen" && scr) {
    dirty =
      dlg.complete !== scr.complete ||
      dlg.report !== reportOf(data, scr.id) ||
      dlg.notes.trim() !== (scr.comments || "").trim();
    if (dlg.complete === "DONE" && scr.complete !== "DONE") hint = "Done moves this screen to Completed screens.";
  } else if (dlg?.kind === "event" && evInfo) {
    dirty = dlg.complete !== evInfo.cur;
    if (dlg.complete === "DONE" && evInfo.cur !== "DONE")
      hint =
        "Done moves the event to Completed events." +
        (evInfo.openN ? ` ${evInfo.openN} ${evInfo.openN === 1 ? "screen is" : "screens are"} not done yet.` : "");
  }

  const closeDialog = () => {
    setDlg(null);
    setDropdown(null);
  };
  const save = () => {
    if (!dirty || !dlg) return;
    if (dlg.kind === "screen" && scr) {
      setData((d) => {
        const screens = d.screens.map((s) =>
          s.id === scr.id ? { ...s, complete: dlg.complete, comments: dlg.notes.trim() } : s,
        );
        const reports = { ...d.reports };
        if (dlg.report !== reportOf(d, scr.id)) reports[scr.id] = { status: dlg.report, updated: new Date().toISOString() };
        return { ...d, screens, reports };
      });
    } else if (dlg.kind === "event") {
      setData((d) => ({ ...d, events: { ...d.events, [dlg.key]: dlg.complete } }));
    }
    closeDialog();
  };

  const dialogOpen = !!dlg && (dlg.kind === "screen" ? !!scr : !!evInfo);
  const dialogSex = scr ? scr.sex : evInfo ? evInfo.sex : null;

  const renderSelect = <V extends string>(
    id: string,
    label: string,
    options: readonly V[],
    tones: Record<string, Tone>,
    value: V,
    onPick: (v: V) => void,
  ) => {
    const open = dropdown === id;
    return (
      <div key={id} className={styles.field}>
        <span className={styles.fieldLabel}>{label}</span>
        <div
          role="combobox"
          tabIndex={0}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={label}
          className={cx(styles.combo, open && styles.comboOpen)}
          onClick={(e) => {
            e.stopPropagation();
            setDropdown(open ? null : id);
          }}
          onKeyDown={onKeyActivate(() => setDropdown(open ? null : id))}
        >
          <Pill tone={tones[value] ?? "neutral"}>{value}</Pill>
          <span className={cx(styles.selChev, open && styles.selChevOpen)}>
            <ChevronDown aria-hidden="true" />
          </span>
        </div>
        {open ? (
          <div role="listbox" aria-label={label} className={styles.listbox}>
            {options.map((v) => (
              <div
                key={v}
                role="option"
                tabIndex={0}
                aria-selected={v === value}
                className={styles.selOpt}
                onClick={(e) => {
                  e.stopPropagation();
                  onPick(v);
                  setDropdown(null);
                }}
                onKeyDown={onKeyActivate(() => {
                  onPick(v);
                  setDropdown(null);
                })}
              >
                <Pill tone={tones[v] ?? "neutral"}>{v}</Pill>
                {v === value ? (
                  <span className={styles.selCheck}>
                    <Check aria-hidden="true" />
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <div className={styles.root} data-screen-label="HTS Dashboard">
      <div className={styles.greeting}>
        <h1 className={styles.title}>Hi Duc, here&rsquo;s the latest on HTS</h1>
      </div>

      {/* Toolbar */}
      <div role="search" className={styles.toolbar}>
        <label className={styles.search}>
          <Search className={styles.searchIcon} aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            aria-label="Search patients, biosamples, screens or diagnoses"
            className={styles.searchInput}
          />
        </label>
        <div className={styles.vrule} />
        <div className={styles.filterWrap}>
          <div
            role="button"
            tabIndex={0}
            aria-haspopup="dialog"
            aria-expanded={filterOpen}
            aria-label={filterCount ? `Filter, ${filterCount} active` : "Filter"}
            className={cx(styles.tbtn, filterCount > 0 && styles.tbtnActive)}
            onClick={() => setFilterOpen((o) => !o)}
            onKeyDown={onKeyActivate(() => setFilterOpen((o) => !o))}
          >
            <SlidersHorizontal aria-hidden="true" />
            <span className={styles.tbtnLabel}>Filter</span>
            {filterCount ? <span className={styles.tbtnCount}>{filterCount}</span> : null}
            <ChevronDown aria-hidden="true" className={cx(styles.tbtnChev, filterOpen && styles.tbtnChevOpen)} />
          </div>
          {filterOpen ? (
            <>
              <div className={styles.clickAway} onClick={() => setFilterOpen(false)} />
              <div role="dialog" aria-label="HTS filters" className={styles.filterPanel}>
                <div className={styles.filterScroll}>
                  {FILTER_CHECKS.map((c) => {
                    const on = checks.includes(c);
                    return (
                      <div
                        key={c}
                        role="checkbox"
                        aria-checked={on}
                        tabIndex={0}
                        className={styles.frow}
                        onClick={() => toggleCheck(c)}
                        onKeyDown={onKeyActivate(() => toggleCheck(c))}
                      >
                        <Box on={on} />
                        <span className={styles.frowLabel}>{c}</span>
                      </div>
                    );
                  })}
                  <div className={styles.frule} />
                  {FILTER_FIELDS.map((f) => {
                    const sel = opts[f.label] || [];
                    const open = filterExpanded === f.label;
                    const toggle = () => setFilterExpanded(open ? null : f.label);
                    return (
                      <div key={f.label}>
                        <div
                          role="button"
                          tabIndex={0}
                          aria-expanded={open}
                          className={styles.frow}
                          onClick={toggle}
                          onKeyDown={onKeyActivate(toggle)}
                        >
                          <Box on={sel.length > 0} />
                          <span className={cx(styles.frowLabel, styles.ellipsis)}>{f.label}</span>
                          {sel.length ? <span className={styles.fcount}>{sel.length}</span> : null}
                          <span className={styles.grow} />
                          <ChevronDown aria-hidden="true" className={cx(styles.fchev, open && styles.fchevOpen)} />
                        </div>
                        {open ? (
                          <div className={styles.fopts}>
                            {f.options.map((v) => {
                              const on = sel.includes(v);
                              const lbl = optionLabel(f.label, v);
                              return (
                                <div
                                  key={v}
                                  role="checkbox"
                                  aria-checked={on}
                                  tabIndex={0}
                                  className={styles.fopt}
                                  onClick={() => toggleOpt(f.label, v)}
                                  onKeyDown={onKeyActivate(() => toggleOpt(f.label, v))}
                                >
                                  <Box on={on} small />
                                  <span className={styles.ellipsis} title={lbl}>
                                    {lbl}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
                <div
                  role="button"
                  tabIndex={0}
                  className={cx(styles.clearAll, filterCount > 0 && styles.clearAllActive)}
                  onClick={resetFilters}
                  onKeyDown={onKeyActivate(resetFilters)}
                >
                  <span>Clear all filters</span>
                  <span className={styles.clearIcon} aria-hidden="true">
                    <X strokeWidth={2.5} />
                  </span>
                </div>
              </div>
            </>
          ) : null}
        </div>
        {filterCount ? (
          <button type="button" className={styles.txtBtn} onClick={resetFilters}>
            Reset to default
          </button>
        ) : null}
        <div className={styles.grow} />
        <span aria-live="polite" className={styles.loaded}>
          {shown} of {data.screens.length} screens loaded
        </span>
      </div>

      {/* Patients */}
      <div className={styles.list}>
        {patients.length === 0 ? (
          <div className={styles.empty}>No screens match. Check the ID, or reset the filters.</div>
        ) : null}
        {patients.map((p, i) => {
          const open = patientOpen[p.patientId] ?? (i < 3 || filtered);
          const act = p.events.filter((e) => e.complete !== "DONE");
          const done = p.events.filter((e) => e.complete === "DONE");
          const total = p.events.reduce((n, e) => n + e.screens.length, 0);
          const doneOpen = !!doneEventsOpen[p.patientId];
          const toggle = () => setPatientOpen((cur) => ({ ...cur, [p.patientId]: !open }));
          return (
            <article key={p.patientId} aria-label={`Patient ${p.patientId}`} className={styles.patient}>
              <div className={styles.patientHead} onClick={toggle}>
                <span
                  role="button"
                  tabIndex={0}
                  aria-expanded={open}
                  aria-label={`Patient ${p.patientId}`}
                  className={styles.patientToggle}
                  onKeyDown={onKeyActivate(toggle)}
                >
                  <span className={cx(styles.pchev, open && styles.chevOpen)}>
                    <ChevronRight aria-hidden="true" />
                  </span>
                </span>
                <div className={styles.patientId}>
                  <SexIcon sex={p.sex} />
                  <h2 className={styles.pid}>{p.patientId}</h2>
                </div>
                <div className={styles.grow} />
                <div className={styles.chips}>
                  <span className={styles.metaChip}>{plural(p.events.length, "event")}</span>
                  <span className={styles.metaChip}>{plural(total, "screen")}</span>
                </div>
              </div>
              {open ? (
                <div className={styles.patientBody}>
                  {act.map((e) => renderEvent(e, false))}
                  {done.length ? (
                    <>
                      {renderBar("Completed events", doneOpen, done.length, () =>
                        setDoneEventsOpen((cur) => ({ ...cur, [p.patientId]: !doneOpen })), false)}
                      {doneOpen ? done.map((e) => renderEvent(e, true)) : null}
                    </>
                  ) : null}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>

      {/* Update dialog (screen / event) */}
      {dialogOpen && dlg ? (
        <HtsDialog onClose={closeDialog} onInnerClick={() => dropdown && setDropdown(null)}>
          <div className={styles.dlgHead}>
            <span id="hts-dlg-title" className={styles.dlgTitle}>
              {dlg.kind === "screen" ? "Update HTS status" : "Update event HTS status"}
            </span>
            <button type="button" className={styles.iconBtn} aria-label="Close" onClick={closeDialog}>
              <X aria-hidden="true" />
            </button>
          </div>
          <div className={styles.dlgMeta}>
            <p className={styles.dlgLine}>
              <span>
                Patient Id: <strong>{scr ? scr.patientId : evInfo?.pid}</strong>
              </span>
              <SexIcon sex={dialogSex} inline />
              <span className={styles.eventTag}>{scr ? scr.event : evInfo?.ev}</span>
            </p>
            <p className={styles.dlgSub}>
              {scr ? `${scr.biosample} · ${scr.screen}` : evInfo ? plural(evInfo.n, "screen") : ""}
            </p>
          </div>
          <div className={styles.dlgSelects}>
            {dlg.kind === "screen" ? (
              <>
                {renderSelect("c", "HTS complete", HTS_COMPLETE, COMPLETE_TONE, dlg.complete, (v) =>
                  setDlg({ ...dlg, complete: v }))}
                {renderSelect("r", "HTS report status", HTS_REPORT, REPORT_TONE, dlg.report, (v) =>
                  setDlg({ ...dlg, report: v }))}
              </>
            ) : (
              renderSelect("e", "HTS complete (event)", HTS_COMPLETE, COMPLETE_TONE, dlg.complete, (v) =>
                setDlg({ ...dlg, complete: v }))
            )}
          </div>
          {hint ? <p className={styles.dlgHint}>{hint}</p> : null}
          {dlg.kind === "screen" ? (
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Notes</span>
              <textarea
                rows={4}
                className={styles.textarea}
                value={dlg.notes}
                placeholder="Add a note for this screen"
                onChange={(e) => setDlg({ ...dlg, notes: e.target.value })}
              />
            </label>
          ) : null}
          <div className={styles.dlgActions}>
            <Button variant="outline" size="sm" className={styles.dlgBtn} onClick={closeDialog}>
              Cancel
            </Button>
            <Button variant="bold" size="sm" className={styles.dlgBtn} disabled={!dirty} onClick={save}>
              Save changes
            </Button>
          </div>
        </HtsDialog>
      ) : null}
    </div>
  );
}

/** Lightweight modal shell sized to the design (440px, 24px padding). The shared Modal's
 *  scrolling body would clip the status dropdowns, so this keeps overflow visible. */
function HtsDialog({
  children,
  onClose,
  onInnerClick,
}: {
  children: ReactNode;
  onClose: () => void;
  onInnerClick: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    return () => prev?.focus?.();
  }, []);
  return (
    <div
      className={styles.scrim}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="hts-dlg-title"
        tabIndex={-1}
        className={styles.dialog}
        onClick={onInnerClick}
      >
        {children}
      </div>
    </div>
  );
}
