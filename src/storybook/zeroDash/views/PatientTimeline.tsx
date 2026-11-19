import { useEffect, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { ArrowUpRight, ChevronDown, ChevronLeft, ChevronRight, CornerDownRight, GripVertical, Minus, Plus } from "lucide-react";
import { Button } from "../../../components/Button/Button";
import { DnaLoader } from "../DnaLoader";
import {
  EVENT_COLOR,
  TL_EVENTS,
  TL_FULL,
  TL_REPORTS,
  TL_SAMPLES,
  WISP_COLS,
  fmtDay,
  fmtMonth,
} from "./curationData";
import { cx } from "./curationParts";
import styles from "./PatientTimeline.module.css";

const SAMPLE_INK = "var(--insight-color-grey-100)";
const DAY = 864e5;

interface PopItem {
  c: string;
  title: string;
  sub?: string;
  bold?: boolean;
  kids: Array<{ title: string; sub: string }>;
  more?: string;
}
interface PopState { x: number; y: number; date: string; section: string; items: PopItem[] }
interface Mark { left: string; c: string; label: string; dots: number[]; pop: Omit<PopState, "x" | "y"> }
interface Lane { label: string; h: number; marks: Mark[] }

export interface PatientTimelineProps {
  pid: string;
  samplesState: "loaded" | "error";
  onGoCuration: () => void;
}

export function PatientTimeline({ pid, samplesState, onGoCuration }: PatientTimelineProps) {
  const [dom, setDom] = useState<[number, number] | null>(null);
  const [closed, setClosed] = useState<Record<string, boolean>>({});
  const [hover, setHover] = useState<{ x: number; w: number } | null>(null);
  const [pop, setPop] = useState<PopState | null>(null);
  const [monitoring, setMonitoring] = useState(false);
  const [wisp, setWisp] = useState("WISP");
  const [retry, setRetry] = useState<0 | 1 | 2>(0);
  const ovRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const popTimer = useRef<number | undefined>(undefined);
  const retryTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => { window.clearTimeout(popTimer.current); window.clearTimeout(retryTimer.current); }, []);

  const [F0, F1] = TL_FULL;
  const [d0, d1] = dom ?? TL_FULL;
  const span = d1 - d0;
  const pct = (t: number) => ((t - d0) / span) * 100;
  const inR = (t: number) => t >= d0 - span * 0.002 && t <= d1 + span * 0.002;
  const fpct = (t: number) => `${((t - F0) / (F1 - F0)) * 100}%`;

  /* ticks */
  const STEPS = [1, 2, 3, 4, 6, 10, 12, 24];
  const months = span / (30.44 * DAY);
  const step = STEPS.find((s) => months / s <= 7.5) ?? 24;
  const ticks: Array<{ left: string; label: string }> = [];
  {
    const sd = new Date(d0);
    let y = sd.getUTCFullYear();
    let m = sd.getUTCMonth() + 1;
    if (m > 11) { m = 0; y++; }
    let idx = y * 12 + m;
    const base = 2021 * 12;
    while ((((idx - base) % step) + step) % step) idx++;
    for (let k = idx; ; k += step) {
      const t = Date.UTC(Math.floor(k / 12), k % 12, 1);
      if (t > d1) break;
      ticks.push({ left: `${pct(t)}%`, label: fmtMonth(t) });
    }
  }

  /* overview drag */
  const dragOv = (mode: "pan" | "l" | "r") => (e: ReactMouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!ovRef.current) return;
    const rect = ovRef.current.getBoundingClientRect();
    const full = F1 - F0, MIN = 45 * DAY;
    const sx = e.clientX, a0 = d0, b0 = d1;
    const mv = (ev: MouseEvent) => {
      const dt = ((ev.clientX - sx) / rect.width) * full;
      let a = a0, b = b0;
      if (mode === "pan") {
        a += dt; b += dt;
        if (a < F0) { b += F0 - a; a = F0; }
        if (b > F1) { a -= b - F1; b = F1; }
      } else if (mode === "l") a = Math.min(Math.max(F0, a0 + dt), b0 - MIN);
      else b = Math.max(Math.min(F1, b0 + dt), a0 + MIN);
      setDom([a, b]);
    };
    const up = () => { window.removeEventListener("mousemove", mv); window.removeEventListener("mouseup", up); };
    window.addEventListener("mousemove", mv);
    window.addEventListener("mouseup", up);
  };
  const zoom = (f: number) => {
    const c = (d0 + d1) / 2;
    const h = Math.max(25 * DAY, ((d1 - d0) * f) / 2);
    let na = c - h, nb = c + h;
    if (na < F0) { nb += F0 - na; na = F0; }
    if (nb > F1) { na -= nb - F1; nb = F1; }
    setDom([Math.max(F0, na), Math.min(F1, nb)]);
  };

  /* popover */
  const popAt = (e: ReactMouseEvent<HTMLElement>, p: Mark["pop"]) => {
    window.clearTimeout(popTimer.current);
    const r = e.currentTarget.getBoundingClientRect();
    const W = 260, H = 320;
    const x = Math.max(8, Math.min(r.left - 12, window.innerWidth - W - 8));
    let y = r.bottom + 8;
    if (y + H > window.innerHeight - 8) y = Math.max(8, r.top - 8 - H);
    setPop({ x, y, ...p });
  };
  const popOut = () => {
    window.clearTimeout(popTimer.current);
    popTimer.current = window.setTimeout(() => setPop(null), 160);
  };

  /* lanes */
  const evMarks: Mark[] = TL_EVENTS.filter((x) => inR(x.t)).map((x) => ({
    left: `${pct(x.t)}%`, c: EVENT_COLOR[x.tone], label: x.tag, dots: [8],
    pop: { date: fmtDay(x.t), section: "Event", items: [{ c: EVENT_COLOR[x.tone], title: `${x.tag} (${x.full})`, kids: [] }] },
  }));
  const sampleLanes: Lane[] = Object.keys(TL_SAMPLES).map((lane) => ({
    label: lane, h: 40,
    marks: TL_SAMPLES[lane].filter((x) => inR(x[1])).map(([tag, t, n, pre, sub], ci) => {
      const id = 471158 + ci * 37 + lane.length * 11;
      const items: PopItem[] = [{
        c: SAMPLE_INK, title: `${pre} ${id}`, sub, bold: true,
        kids: n > 1 ? [{ title: `${pre} ${id}-1`, sub }] : [],
        more: n > 3 ? `Show more (${n - 3})` : undefined,
      }];
      if (n > 2) items.push({ c: SAMPLE_INK, title: `${pre} ${id + 1}`, sub, bold: true, kids: [] });
      return {
        left: `${pct(t)}%`, c: SAMPLE_INK, label: n > 1 ? `${tag} +${n - 1}` : tag,
        dots: Array.from({ length: Math.min(n, 3) }, () => 7),
        pop: { date: fmtDay(t), section: "Samples", items },
      };
    }),
  }));
  const reportLanes: Lane[] = Object.keys(TL_REPORTS).map((lane) => ({
    label: lane, h: 32,
    marks: TL_REPORTS[lane].filter((x) => inR(x[1])).map(([tag, t]) => ({
      left: `${pct(t)}%`, c: SAMPLE_INK, label: tag, dots: [8],
      pop: { date: fmtDay(t), section: "Reports", items: [{ c: SAMPLE_INK, title: `${tag} (${lane})`, kids: [] }] },
    })),
  }));
  const effSamples = retry === 2 ? "loaded" : retry === 1 ? "loading" : samplesState;
  const sampleCount = Object.values(TL_SAMPLES).reduce((a, l) => a + l.reduce((b, x) => b + x[2], 0), 0);

  type Section = { key: string; title: string; count: number; lanes: Lane[]; empty?: string; error?: string; loading?: boolean };
  const sections: Section[] = [
    { key: "ev", title: "Events", count: TL_EVENTS.length, lanes: [{ label: "Events", h: 32, marks: evMarks }] },
    effSamples === "loaded"
      ? { key: "sa", title: "Samples", count: sampleCount, lanes: sampleLanes }
      : effSamples === "loading"
        ? { key: "sa", title: "Samples", count: 0, lanes: [], loading: true }
        : { key: "sa", title: "Samples", count: 0, lanes: [], error: "Could not load patient biomaterials." },
    { key: "re", title: "Reports", count: 3, lanes: reportLanes },
    { key: "db", title: "Disease burden", count: 0, lanes: [], empty: "No disease burden results for this patient." },
    { key: "bm", title: "Biomarker", count: 0, lanes: [], empty: "No reportable SNV biomarkers for this patient." },
  ];

  const ovDots = [
    ...TL_EVENTS.map((x) => ({ left: fpct(x.t), top: 15, c: EVENT_COLOR[x.tone] })),
    ...Object.values(TL_SAMPLES).flat().map((x) => ({ left: fpct(x[1]), top: 31, c: "var(--insight-color-grey-60)" })),
  ];

  const onLaneMove = (e: ReactMouseEvent) => {
    if (!innerRef.current) return;
    const r = innerRef.current.getBoundingClientRect();
    const x = e.clientX - r.left - 200, w = r.width - 200;
    if (x < 0 || x > w) { if (hover) setHover(null); return; }
    setHover({ x, w });
  };
  const hoverT = hover ? d0 + (hover.x / hover.w) * span : 0;

  return (
    <div className={styles.page} data-screen-label="Patient timeline">
      <section className={styles.card}>
        <div className={styles.cardHead}>
          <div>
            <h3 className={styles.title}>Patient timeline</h3>
            <div className={styles.pidLine}>Patient ID(s): <span className={styles.pidVal}>{pid}</span></div>
          </div>
          <div className={styles.headActions}>
            <button type="button" className={styles.softBtn} onClick={() => setDom(null)}>Fit all</button>
            <button
              type="button"
              aria-pressed={monitoring}
              className={cx(styles.softBtn, monitoring && styles.softBtnOn)}
              onClick={() => setMonitoring(!monitoring)}
            >
              Monitoring
            </button>
            <div className={styles.zoomGroup}>
              <button type="button" aria-label="Zoom out" onClick={() => zoom(1.6)}><Minus size={16} strokeWidth={2} /></button>
              <button type="button" aria-label="Zoom in" onClick={() => zoom(0.6)}><Plus size={16} strokeWidth={2} /></button>
            </div>
          </div>
        </div>
        <div className={styles.hint}>Drag the overview box to pan - Drag its edges to zoom - Double-click overview to reset</div>

        <div className={styles.overview}>
          <div className={styles.ovLabel}>Overview</div>
          <div ref={ovRef} className={styles.ovTrack} onDoubleClick={() => setDom(null)}>
            <div
              className={styles.ovWindow}
              style={{ left: `${((d0 - F0) / (F1 - F0)) * 100}%`, width: `${((d1 - d0) / (F1 - F0)) * 100}%` }}
              onMouseDown={dragOv("pan")}
            >
              <span className={cx(styles.ovHandle, styles.ovHandleL)} onMouseDown={dragOv("l")} />
              <span className={cx(styles.ovHandle, styles.ovHandleR)} onMouseDown={dragOv("r")} />
            </div>
            {ovDots.map((d, i) => (
              <span key={i} className={styles.ovDot} style={{ left: d.left, top: d.top, background: d.c }} />
            ))}
          </div>
        </div>

        <div className={styles.lanes} onMouseMove={onLaneMove} onMouseLeave={() => setHover(null)}>
          <div ref={innerRef} className={styles.lanesInner}>
            <div className={styles.gridLines}>
              {ticks.map((tk) => <span key={tk.label} style={{ left: tk.left }} />)}
            </div>
            <div className={styles.axis}>
              <div className={styles.axisYear}>{new Date(d0).getUTCFullYear()}</div>
              <div className={styles.axisTrack}>
                {ticks.map((tk) => (
                  <span key={tk.label}>
                    <span className={styles.tick} style={{ left: tk.left }} />
                    <span className={styles.tickLabel} style={{ left: tk.left }}>{tk.label}</span>
                  </span>
                ))}
                {hover ? <span className={styles.hoverDate} style={{ left: hover.x }}>{fmtDay(hoverT)}</span> : null}
              </div>
            </div>

            {sections.map((sec) => {
              const open = !closed[sec.key];
              return (
                <div key={sec.key} className={styles.section}>
                  <button
                    type="button"
                    aria-expanded={open}
                    className={styles.secHead}
                    onClick={() => setClosed((x) => ({ ...x, [sec.key]: !x[sec.key] }))}
                  >
                    <ChevronDown size={16} strokeWidth={2} className={cx(styles.chev, !open && styles.chevClosed)} aria-hidden="true" />
                    <span className={styles.secTitle}>{sec.title}</span>
                    <span className={styles.secCount}>{sec.count}</span>
                  </button>
                  {open ? (
                    <>
                      {sec.lanes.map((ln) => (
                        <div key={ln.label} className={styles.lane} style={{ height: ln.h }}>
                          <div className={styles.laneLabel}>
                            <GripVertical size={12} className={styles.grip} aria-hidden="true" />
                            {ln.label}
                          </div>
                          <div className={styles.laneTrack}>
                            {ln.marks.map((m, mi) => (
                              <div
                                key={mi}
                                className={styles.mark}
                                style={{ left: m.left }}
                                onMouseEnter={(e) => popAt(e, m.pop)}
                                onMouseLeave={popOut}
                              >
                                <div className={styles.markDots}>
                                  {m.dots.map((h, di) => <span key={di} style={{ height: h, background: m.c }} />)}
                                </div>
                                <span className={styles.markLabel}>{m.label}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                      {sec.empty ? <div className={styles.secEmpty}>{sec.empty}</div> : null}
                      {sec.error ? (
                        <div className={styles.secError}>
                          {sec.error}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setRetry(1);
                              retryTimer.current = window.setTimeout(() => setRetry(2), 900);
                            }}
                          >
                            Retry
                          </Button>
                        </div>
                      ) : null}
                      {sec.loading ? (
                        <div className={styles.secLoading} aria-busy="true">
                          <DnaLoader label="Loading biomaterials…" />
                        </div>
                      ) : null}
                    </>
                  ) : null}
                </div>
              );
            })}

            {hover ? <span className={styles.crosshair} style={{ left: 200 + hover.x }} /> : null}
          </div>
        </div>
      </section>

      <section className={cx(styles.card, styles.wispCard)}>
        <div className={styles.wispTabs} role="tablist">
          <span className={styles.wispArrow} aria-hidden="true"><ChevronLeft size={18} strokeWidth={2} /></span>
          {["WISP", "Clarity Manager"].map((l) => (
            <button
              key={l}
              type="button"
              role="tab"
              aria-selected={wisp === l}
              className={cx(styles.wispTab, wisp === l && styles.wispTabOn)}
              onClick={() => setWisp(l)}
            >
              {l}
            </button>
          ))}
          <span className={styles.wispArrow} aria-hidden="true"><ChevronRight size={18} strokeWidth={2} /></span>
        </div>
        <div className={styles.wispBody}>
          <div className={styles.wispTable}>
            <div className={styles.wispHead}>
              {WISP_COLS.map((c) => <div key={c}>{c}</div>)}
            </div>
            <div className={styles.wispEmpty}>No rows</div>
          </div>
        </div>
      </section>

      {pop ? (
        <div
          className={styles.popover}
          data-screen-label="Timeline popover"
          style={{ left: pop.x, top: pop.y }}
          onMouseEnter={() => window.clearTimeout(popTimer.current)}
          onMouseLeave={popOut}
        >
          <div className={styles.popDate}>{pop.date}</div>
          <div className={styles.popBody}>
            <span className={styles.popSection}>{pop.section}</span>
            {pop.items.map((it, i) => (
              <div key={i} className={styles.popItem}>
                <div className={styles.popItemRow}>
                  <span className={styles.popDot} style={{ background: it.c }} />
                  <div className={styles.popText}>
                    <span style={{ fontWeight: it.bold ? 700 : 500 }}>{it.title}</span>
                    {it.sub ? <span className={styles.popSub}>{it.sub}</span> : null}
                  </div>
                </div>
                {it.kids.map((k, ki) => (
                  <div key={ki} className={styles.popKid}>
                    <CornerDownRight size={14} strokeWidth={2} aria-hidden="true" />
                    <div className={styles.popText}>
                      <span>{k.title}</span>
                      <span className={styles.popSub}>{k.sub}</span>
                    </div>
                  </div>
                ))}
                {it.more ? <button type="button" className={cx(styles.popLink, styles.popMore)}>{it.more}</button> : null}
              </div>
            ))}
          </div>
          <div className={styles.popFoot}>
            <button type="button" className={styles.popLink} onClick={onGoCuration}>
              Go to curation
              <ArrowUpRight size={15} strokeWidth={2.2} aria-hidden="true" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
