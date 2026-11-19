import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent as RPointerEvent, RefObject, WheelEvent } from "react";
import { RotateCcw } from "lucide-react";
import { Chip } from "../../../../components/Chip/Chip";
import { Tooltip } from "../../../../components/Tooltip/Tooltip";
import { DnaLoader } from "../../DnaLoader";
import { D, EXONS, PRED, baseAt, bpIndexOf, bpWin, coord, fmt, idxOf, regionOf, relLabel } from "../savvyData";
import type { SiteChange } from "../savvyData";
import { InfoTip, Segmented, TipBody, cx } from "./parts";
import styles from "../SavvyView.module.css";

export const NUC: Record<string, string> = {
  A: "var(--sav-nuc-a)",
  C: "var(--sav-nuc-c)",
  G: "var(--sav-nuc-g)",
  T: "var(--sav-nuc-t)",
};
const GREEN = "var(--insight-color-green-175)";
const RED = "var(--insight-color-red-200)";
const EASE = "var(--insight-ease-emphasis)";
const f2 = (n: number) => n.toFixed(2);

export interface RegionViewerProps {
  /** Region index of the variant. */
  vIdx: number;
  /** Base drawn at the variant (REF or ALT). */
  varBase: string;
  isRef: boolean;
  indel: boolean;
  /** Variant offset relative to E+1. */
  off: number;
  /** Prediction window half-width (bp). */
  dist: number;
  laneSub: string;
  laneMsg: string;
  sites: SiteChange[];
  recalc: boolean;
  /** Selected branchpoint candidate (0-based). */
  bp: number;
  onBp: (k: number) => void;
}

interface LensState {
  lc: number | null;
  pin: boolean;
  mode: "hover" | "pin" | "kbd" | "touch" | null;
  fast: boolean;
  ax: number;
  ay: number;
  cl: number;
  cr: number;
}
const NO_LENS: LensState = { lc: null, pin: false, mode: null, fast: false, ax: 0, ay: 0, cl: 0, cr: 0 };

/**
 * Full region track: navigator over the ±max-distance prediction window, a magnifier sequence
 * track (hover / click to pin / arrow keys), the predicted splice-site change lane and a scrollbar.
 */
export function RegionViewer(p: RegionViewerProps) {
  const { vIdx: V, varBase, isRef, indel, off, dist, sites, recalc } = p;
  const [zoom, setZoomState] = useState(230);
  const [v0Raw, setV0Raw] = useState(0);
  const [cw, setCw] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [lens, setLensState] = useState<LensState>(NO_LENS);

  const scrollRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const hsRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x0: number; v00: number; k: number } | null>(null);
  const panRaf = useRef(0);
  const moveRaf = useRef(0);
  const pendingX = useRef(0);
  const touching = useRef(false);
  const skipClick = useRef(false);
  const ptrDown = useRef(false);

  // ---- window / viewport maths (region indices; 0 = first base of the 230 bp region) ----
  const lo = D.VAR_POS - dist - D.start;
  const hi = D.VAR_POS + dist - D.start;
  const winLen = hi - lo + 1;
  const N = Math.max(1, Math.min(zoom, winLen));
  const clampV0 = useCallback((v: number) => Math.max(lo, Math.min(hi - N + 1, Math.round(v))), [lo, hi, N]);
  const v0 = clampV0(v0Raw);
  const W = cw ? cw / N : 7;

  // Width of the track = width of the scroll viewport.
  useLayoutEffect(() => {
    const s = scrollRef.current;
    if (!s) return;
    const measure = () => setCw(s.clientWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(s);
    return () => ro.disconnect();
  }, []);

  const measure = useCallback(() => {
    const r = wrapRef.current?.getBoundingClientRect();
    const s = scrollRef.current?.getBoundingClientRect();
    return { ax: r ? r.left : 0, ay: r ? r.top : 0, cl: s ? s.left : 0, cr: s ? s.right : window.innerWidth };
  }, []);

  const collapse = useCallback(() => setLensState(NO_LENS), []);
  const setLens = useCallback(
    (c: number, mode: LensState["mode"], pin?: boolean) => {
      const cc = Math.max(0, Math.min(N - 0.001, c));
      const k = bpIndexOf(Math.floor(cc) + v0);
      if (k >= 0 && k !== p.bp) p.onBp(k);
      setLensState((s) => ({ ...s, lc: cc, mode, fast: true, pin: pin ?? s.pin, ...measure() }));
    },
    [N, v0, p, measure],
  );

  // Keep the fixed-position lens tip attached on scroll / resize.
  useEffect(() => {
    if (lens.lc == null) return;
    const onReflow = () => setLensState((s) => (s.lc == null ? s : { ...s, ...measure() }));
    window.addEventListener("scroll", onReflow, true);
    window.addEventListener("resize", onReflow);
    return () => {
      window.removeEventListener("scroll", onReflow, true);
      window.removeEventListener("resize", onReflow);
    };
  }, [lens.lc, measure]);

  useEffect(() => {
    if (!lens.pin) return;
    const onKey = (e: globalThis.KeyboardEvent) => e.key === "Escape" && collapse();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [lens.pin, collapse]);

  useEffect(() => () => {
    cancelAnimationFrame(panRaf.current);
    cancelAnimationFrame(moveRaf.current);
  }, []);

  const setV0 = (v: number) => {
    cancelAnimationFrame(panRaf.current);
    setV0Raw(clampV0(v));
    collapse();
  };
  const panTo = (v: number) => {
    cancelAnimationFrame(panRaf.current);
    const from = v0;
    const to = clampV0(v);
    if (from === to) return;
    const t0 = performance.now();
    const step = (t: number) => {
      const q = Math.min(1, (t - t0) / 250);
      const e = q < 0.5 ? 2 * q * q : 1 - Math.pow(-2 * q + 2, 2) / 2;
      setV0Raw(Math.round(from + (to - from) * e));
      if (q < 1) panRaf.current = requestAnimationFrame(step);
    };
    collapse();
    panRaf.current = requestAnimationFrame(step);
  };
  const setZoom = (z: number) => {
    const c = v0 + N / 2;
    const n2 = Math.max(1, Math.min(z, winLen));
    setZoomState(z);
    setV0Raw(Math.max(lo, Math.min(hi - n2 + 1, Math.round(c - n2 / 2))));
    collapse();
  };
  const resetView = () => {
    cancelAnimationFrame(panRaf.current);
    setZoomState(230);
    setV0Raw(0);
    collapse();
  };

  // ---- navigator / scrollbar drag ----
  const dragWith = (ref: RefObject<HTMLDivElement | null>, e: RPointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const onThumb = (e.target as HTMLElement).closest?.("[data-thumb]");
    try {
      el.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    let start = v0;
    if (!onThumb) {
      start = clampV0(lo + ((e.clientX - r.left) / r.width) * winLen - N / 2);
      setV0(start);
    }
    drag.current = { x0: e.clientX, v00: start, k: winLen / r.width };
    setDragging(true);
  };
  const dragMove = (e: RPointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    setV0(drag.current.v00 + (e.clientX - drag.current.x0) * drag.current.k);
  };
  const dragEnd = () => {
    if (!drag.current) return;
    drag.current = null;
    setDragging(false);
  };

  // ---- magnifier pointer + keyboard ----
  const onSeqMove = (e: RPointerEvent<HTMLDivElement>) => {
    if (touching.current) {
      setLens((e.clientX - measure().ax) / W, "touch");
      return;
    }
    if (e.pointerType === "touch" || lens.pin) return;
    pendingX.current = e.clientX;
    if (moveRaf.current) return;
    moveRaf.current = requestAnimationFrame(() => {
      moveRaf.current = 0;
      setLens((pendingX.current - measure().ax) / W, "hover");
    });
  };
  const onSeqLeave = () => {
    if (lens.pin || touching.current) return;
    cancelAnimationFrame(moveRaf.current);
    moveRaf.current = 0;
    collapse();
  };
  const onSeqDown = (e: RPointerEvent<HTMLDivElement>) => {
    ptrDown.current = true;
    if (e.pointerType === "touch") {
      touching.current = true;
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      setLens((e.clientX - measure().ax) / W, "touch", false);
    }
  };
  const onSeqUp = () => {
    setTimeout(() => {
      ptrDown.current = false;
    }, 0);
    if (!touching.current) return;
    touching.current = false;
    skipClick.current = true;
    if (lens.lc != null) setLens(Math.floor(lens.lc) + 0.5, "pin", true);
  };
  const onSeqClick = () => {
    if (skipClick.current) {
      skipClick.current = false;
      return;
    }
    if (lens.pin) {
      setLensState((s) => ({ ...s, pin: false, mode: "hover" }));
      return;
    }
    if (lens.lc == null) return;
    setLens(Math.floor(lens.lc) + 0.5, "pin", true);
  };
  const onSeqFocus = () => {
    if (ptrDown.current || lens.lc != null) return;
    setLens(V - v0 + 0.5, "kbd", true);
  };
  const onSeqBlur = () => {
    if (lens.mode === "kbd") collapse();
  };
  const onSeqKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const cur = lens.lc != null ? Math.floor(lens.lc) : V - v0;
    let n: number | null = null;
    if (e.key === "ArrowLeft") n = cur - (e.shiftKey ? 10 : 1);
    else if (e.key === "ArrowRight") n = cur + (e.shiftKey ? 10 : 1);
    else if (e.key === "Home") n = 0;
    else if (e.key === "End") n = N - 1;
    else if (e.key === "Escape") {
      if (lens.lc != null) {
        e.preventDefault();
        e.stopPropagation();
        collapse();
      }
      return;
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (lens.pin) collapse();
      else setLens(cur + 0.5, "kbd", true);
      return;
    }
    if (n == null) return;
    e.preventDefault();
    setLens(Math.max(0, Math.min(N - 1, n)) + 0.5, "kbd", true);
  };
  const onWheel = (e: WheelEvent<HTMLDivElement>) => {
    if (!e.shiftKey) return;
    const dlt = e.deltaX || e.deltaY;
    if (!dlt) return;
    setV0(v0 + dlt / Math.max(1, W));
  };

  // ---- magnifier geometry ----
  const L = lens.lc;
  const zk = Math.max(1, N / 230);
  const lensMax = 3.2 * zk;
  const lensSig = 18 * zk * zk;
  const ws: number[] = new Array(N);
  for (let i = 0; i < N; i++) {
    let sc = 1;
    if (L != null) {
      const d = i + 0.5 - L;
      sc = 1 + (lensMax - 1) * Math.exp(-(d * d) / lensSig);
      if (sc < 1.05) sc = 1;
    }
    ws[i] = sc;
  }
  const P = [0];
  for (let i = 0; i < N; i++) P.push(P[i] + ws[i] * W);
  const fl = L == null ? 0 : Math.floor(L);
  const shift = L == null ? 0 : L * W - (P[fl] + (L - fl) * ws[fl] * W);
  const dur = lens.fast ? "80ms" : "200ms";
  const tr = (props: string[]) => props.map((x) => `${x} ${dur} ${EASE}`).join(", ");
  const blockTr = tr(["left", "width"]);
  const baseR = (i: number) => (i === V ? varBase : baseAt(i));
  const lensIdx = L != null ? Math.floor(L) : -1;
  const selS = idxOf(bpWin(D.BP_DIST[p.bp]));

  const pp = (n: number) => P[n].toFixed(2) + "px";
  const cl_ = (j: number) => Math.max(0, Math.min(N, j));
  const rp = (i: number) => P[cl_(i - v0)].toFixed(2) + "px";
  const rs = (a: number, b: number) => (P[cl_(b - v0)] - P[cl_(a - v0)]).toFixed(2) + "px";

  const seqCells = Array.from({ length: N }, (_, j) => {
    const ri = j + v0;
    const b = baseR(ri);
    const w = ws[j] * W;
    const col = NUC[b] || "var(--insight-color-grey-40)";
    const letter = w >= 5.5;
    const hb =
      ri === V
        ? isRef
          ? "var(--insight-color-blue-30)"
          : "var(--insight-color-red-30)"
        : ri >= selS && ri < selS + 5
          ? "var(--sav-region-bp-border)"
          : "transparent";
    return (
      <span
        key={j}
        className={styles.seqCell}
        style={{
          width: w.toFixed(2) + "px",
          fontSize: (letter ? Math.min(10.5 * ws[j], w * 1.45) : 0).toFixed(2) + "px",
          fontWeight: w > 14 ? 700 : 500,
          color: col,
          background: letter ? hb : `linear-gradient(${col},${col}) center bottom / ${w >= 2 ? 2 : 1}px 12px no-repeat, ${hb}`,
          boxShadow: lens.pin && j === lensIdx ? "inset 0 0 0 1.5px var(--insight-color-blue-150)" : "none",
          transition: tr(["width", "font-size"]),
        }}
      >
        {letter ? b : ""}
      </span>
    );
  });

  const stp = Math.max(10, Math.round(N / 23));
  const chevrons = Array.from({ length: Math.floor(N / stp) }, (_, k) => pp(Math.min(N, k * stp + stp - 1)));

  // ---- lens tooltip ----
  let lensTip: null | { x: number; y: number; rel: string; sub: string; kind: ReturnType<typeof regionOf> } = null;
  let lensText = "Use arrow keys to step through bases";
  if (lensIdx >= 0) {
    const li = lensIdx + v0;
    const rg = regionOf(li, V);
    const rel = relLabel(li);
    const sub = baseR(li) + " at " + coord(li);
    const x = lens.ax + shift + P[lensIdx] + (ws[lensIdx] * W) / 2;
    const fs = Math.min(10.5 * ws[lensIdx], ws[lensIdx] * W * 1.45);
    if (x >= lens.cl - 2 && x <= lens.cr + 2) lensTip = { x, y: lens.ay + 16 - fs * 1.15 + 1, rel, sub, kind: rg };
    const bpText = rg.k === "bp" ? `Branchpoint ${(rg.n ?? 0) + 1} of ${D.BP_DIST.length}` : "";
    const tag = rg.k === "donor" ? "Donor" : rg.k === "acc" ? "Acceptor" : rg.k === "var" ? "Variant" : rg.k === "bp" ? bpText : "";
    lensText = rel + ", " + sub + (tag ? ", " + tag : "");
  }

  // ---- prediction lane (same x-scale as the track, including the magnifier) ----
  const inView = (i: number) => i >= v0 && i < v0 + N;
  const xOf = (i: number) => shift + P[i - v0] + (ws[i - v0] * W) / 2;
  const ovW = N * W;
  const atVar = indel ? "At the insertion site (E+1)" : "At the variant (E+1)";
  const chrCoord = (site: number) => "chr17:" + fmt(D.VAR_POS + site);
  const whereOf = (site: number) => {
    const rel = site - off;
    return rel === 0 ? atVar : Math.abs(rel) + " bp " + (rel < 0 ? "upstream" : "downstream");
  };

  interface LaneEv {
    site: number;
    type: "gain" | "loss";
    gi: number;
    vis: boolean;
    side: "left" | "right";
    label: string;
    x: number;
    w: number;
    r: number;
    l: number;
    line: number;
  }
  const evRaw: LaneEv[] = [];
  sites.forEach((r) => {
    if (evRaw.some((e) => e.site === r.site && e.type === r.type)) return;
    const rel = r.site - off;
    const gi = D.VAR + r.site;
    const vis = inView(gi);
    const side: "left" | "right" = gi < v0 ? "left" : "right";
    const relTxt = rel === 0 ? "the variant" : (rel > 0 ? "+" : "−") + Math.abs(rel) + " bp";
    const name = r.laneLabel || (r.type === "gain" ? "New acceptor" : "Acceptor loss");
    const label = !vis
      ? `${name} at ${relTxt}, outside the view. Show ${side === "right" ? "→" : "←"}`
      : r.laneLabel
        ? `${r.laneLabel} (${relTxt})`
        : r.type === "gain"
          ? `New acceptor ${Math.abs(r.site)} bp upstream (possible exon extension)`
          : rel === 0
            ? indel
              ? "Acceptor loss at the insertion site (E+1)"
              : "Acceptor loss at the variant (E+1)"
            : "Acceptor loss at E+1";
    const w = label.length * 7 + 24;
    const x = vis ? xOf(gi) : 0;
    const rr = vis ? x + 8 : side === "right" ? ovW : w;
    evRaw.push({ site: r.site, type: r.type, gi, vis, side, label, x, w, r: rr, l: rr - w, line: 0 });
  });
  const evs = evRaw.sort((a, b) => (a.vis === b.vis ? b.r - a.r : a.vis ? -1 : 1));
  const lines: LaneEv[][] = [];
  evs.forEach((e) => {
    let li = lines.findIndex((ln) => ln.every((o) => e.r + 8 <= o.l || e.l >= o.r + 8));
    if (li < 0) {
      li = lines.length;
      lines.push([]);
    }
    lines[li].push(e);
    e.line = li;
  });
  const laneEmpty = !sites.length;
  const rowsTop = 44 + lines.length * 26 + 8;
  const laneH = laneEmpty ? (recalc ? 140 : 64) : rowsTop + 96;

  // ---- navigator ----
  const vS = D.start + v0;
  const vE = vS + N - 1;
  const wS = D.start + lo;
  const pct = (g: number) => (((g - wS) / winLen) * 100).toFixed(3) + "%";
  const viewText = "17:" + fmt(vS) + "-" + fmt(vE);
  const viewRange = `Showing ${fmt(vS)}–${fmt(vE)} of the ±${fmt(dist)} bp prediction window`;
  const evG = [...new Set(sites.filter((r) => r.d >= 0.2).map((r) => D.VAR_POS + r.site))];
  const navExons = EXONS.map(([a, b]) => {
    const a1 = Math.max(a, wS);
    const b1 = Math.min(b, wS + winLen - 1);
    return b1 < a1 ? null : { l: pct(a1), w: (((b1 - a1 + 1) / winLen) * 100).toFixed(3) + "%" };
  }).filter((x): x is { l: string; w: string } => !!x);
  const navTicks = evG.filter((g) => g >= wS && g < wS + winLen).map((g) => pct(g + 0.5));
  const vpL = pct(vS);
  const vpW = ((N / winLen) * 100).toFixed(3) + "%";
  const grab = dragging ? "grabbing" : "grab";

  return (
    <div className={styles.region}>
      <div className={styles.regionTop}>
        <div className={styles.regionTitle}>
          <span className={styles.l11m}>Full region</span>
          <span className={cx(styles.b14, styles.textPrimary)}>{viewText}</span>
        </div>
        <div className={styles.regionLegend}>
          <span><i className={styles.lgBlock} style={{ background: "var(--sav-region-donor)" }} />Donor</span>
          <span><i className={styles.lgBlock} style={{ background: "var(--sav-region-bp)" }} />Branchpoints ({D.BP_DIST.length})</span>
          <span><i className={styles.lgBlock} style={{ background: "var(--sav-region-acc)" }} />Acceptor</span>
          <span><i className={styles.lgLine} />Variant</span>
          <span><i className={styles.lgBar} style={{ background: GREEN }} />Splice site created (gain)</span>
          <span><i className={styles.lgBar} style={{ background: RED }} />Splice site lost (loss)</span>
        </div>
      </div>

      <div className={styles.zoomRow}>
        <span className={styles.c12Tertiary}>Zoom</span>
        <Segmented
          ariaLabel="Zoom"
          size="sm"
          options={[230, 500, 1000].map((z) => ({ value: z, label: fmt(z) + " bp" }))}
          value={zoom}
          onChange={setZoom}
        />
        <span className={styles.flex1} />
        <span className={styles.c12Tertiary}>{viewRange}</span>
        <button type="button" className={styles.linkBtn} onClick={resetView}>
          <RotateCcw size={16} aria-hidden="true" />
          Reset to variant
        </button>
      </div>

      <div
        ref={navRef}
        role="slider"
        tabIndex={0}
        aria-label="Prediction window navigator"
        aria-valuemin={wS}
        aria-valuemax={wS + winLen - N}
        aria-valuenow={vS}
        aria-valuetext={viewRange}
        className={styles.nav}
        onPointerDown={(e) => dragWith(navRef, e)}
        onPointerMove={dragMove}
        onPointerUp={dragEnd}
        onPointerCancel={dragEnd}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") setV0(v0 - (e.shiftKey ? 50 : 10));
          else if (e.key === "ArrowRight") setV0(v0 + (e.shiftKey ? 50 : 10));
          else return;
          e.preventDefault();
        }}
      >
        <div className={styles.navLine} />
        {navExons.map((x, i) => (
          <div key={i} className={styles.navExon} style={{ left: x.l, width: x.w }} />
        ))}
        {navTicks.map((l, i) => (
          <div key={i} className={styles.navTick} style={{ left: l }} />
        ))}
        <div data-thumb="" className={styles.navVp} style={{ left: vpL, width: vpW, cursor: grab }} />
        <span className={styles.navLabel} style={{ left: 0 }}>−{fmt(dist)} bp</span>
        <span className={styles.navLabel} style={{ left: pct(D.VAR_POS + 0.5), transform: "translateX(-50%)" }}>Variant</span>
        <span className={styles.navLabel} style={{ right: 0 }}>+{fmt(dist)} bp</span>
      </div>

      <div ref={scrollRef} className={styles.seqScroll} onWheel={onWheel}>
        <div
          ref={wrapRef}
          role="slider"
          tabIndex={0}
          aria-label="Full region sequence magnifier"
          aria-valuemin={1}
          aria-valuemax={N}
          aria-valuenow={(lensIdx >= 0 ? lensIdx : V - v0) + 1}
          aria-valuetext={lensText}
          className={styles.seqWrap}
          style={{ width: ovW + "px" }}
          onPointerMove={onSeqMove}
          onPointerLeave={onSeqLeave}
          onPointerDown={onSeqDown}
          onPointerUp={onSeqUp}
          onPointerCancel={onSeqUp}
          onClick={onSeqClick}
          onKeyDown={onSeqKey}
          onFocus={onSeqFocus}
          onBlur={onSeqBlur}
        >
          <div style={{ transform: `translateX(${shift.toFixed(2)}px)`, transition: tr(["transform"]) }}>
            <div className={styles.seqRow}>{seqCells}</div>
            <div className={styles.trackRow}>
              <div className={styles.trackBlock} style={{ left: rp(D.DON), width: rs(D.DON, D.DON + 9), background: "var(--sav-track-donor)", transition: blockTr }} />
              <div className={styles.trackBlock} style={{ left: rp(D.ACC), width: rs(D.ACC, D.ACC + 23), background: "var(--sav-track-acc)", transition: blockTr }} />
              {D.BP_DIST.map((d, k) => {
                const s0 = idxOf(bpWin(d));
                const on = k === p.bp;
                return (
                  <div
                    key={k}
                    className={styles.trackBp}
                    style={{
                      left: rp(s0),
                      width: rs(s0, s0 + 5),
                      top: on ? 3 : 7,
                      height: on ? 20 : 12,
                      background: on ? "var(--sav-region-bp)" : "var(--sav-track-bp-muted)",
                      transition: blockTr + `, top 250ms ${EASE}, height 250ms ${EASE}`,
                    }}
                  />
                );
              })}
              <div className={styles.trackLine} style={{ width: pp(N), transition: `width ${dur} ${EASE}` }} />
              <div className={styles.trackVar} style={{ left: rp(V), width: rs(V, V + 1), transition: blockTr }} />
              {EXONS.map(([a, b], k) => (
                <div
                  key={k}
                  className={styles.trackExon}
                  style={{ left: rp(a - D.start), width: rs(a - D.start, b - D.start + 1), transition: blockTr }}
                />
              ))}
              {chevrons.map((l, k) => (
                <svg key={k} width="5" height="9" viewBox="0 0 5 9" aria-hidden="true" className={styles.trackChev} style={{ left: l, transition: tr(["left"]) }}>
                  <path d="M0 0 L5 4.5 L0 9" />
                </svg>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.lane} style={{ width: ovW + "px", height: laneH + "px" }} onPointerMove={onSeqMove} onPointerLeave={onSeqLeave}>
          <div className={styles.laneTitle}>
            <span className={cx(styles.b14m, styles.textPrimary)}>Predicted splice-site changes</span>
            <InfoTip tip="lane" label="predicted splice-site changes" />
          </div>
          <span className={styles.laneSub}>{p.laneSub}</span>
          {recalc ? (
            <div className={styles.laneLoader}>
              <DnaLoader scale={0.7} size="sm" label="Recalculating" />
            </div>
          ) : (
            <>
              {laneEmpty ? <span className={styles.laneMsg}>{p.laneMsg}</span> : null}
              {!laneEmpty
                ? ["SpliceAI", "Pangolin"].map((name, k) => (
                    <div key={name} className={styles.laneRow} style={{ top: rowsTop + k * 48 }}>
                      <div className={styles.laneRowAxis} />
                      <span className={styles.laneRowName}>{name}</span>
                    </div>
                  ))
                : null}
              {evs
                .filter((e) => e.vis)
                .map((e, k) => {
                  const top = 44 + e.line * 26 + 24;
                  return (
                    <div
                      key={"g" + k}
                      className={styles.laneGuide}
                      style={{ left: (e.x - 0.5).toFixed(1) + "px", top, height: laneH - top, background: e.type === "gain" ? GREEN : RED, transition: tr(["left"]) }}
                    />
                  );
                })}
              {evs.map((e, k) =>
                e.vis ? (
                  <span key={"c" + k} className={styles.laneChip} style={{ right: (ovW - (e.x + 8)).toFixed(1) + "px", top: 44 + e.line * 26, transition: tr(["right"]) }}>
                    <Chip size="sm" color={e.type === "gain" ? "green" : "red"} className={styles.chipRegular}>
                      {e.label}
                    </Chip>
                  </span>
                ) : (
                  <button
                    key={"c" + k}
                    type="button"
                    className={styles.laneChipBtn}
                    style={{ [e.side]: 0, top: 44 + e.line * 26 }}
                    onClick={() => panTo(e.side === "right" ? e.gi - (N - 11) : e.gi - 10)}
                  >
                    <Chip size="sm" color={e.type === "gain" ? "green" : "red"} className={styles.chipRegular}>
                      {e.label}
                    </Chip>
                  </button>
                ),
              )}
              {sites.map((r, k) => {
                const bi = D.VAR + r.site;
                if (!inView(bi)) return null;
                const row = r.p === "spliceai" ? 0 : 1;
                const x = xOf(bi);
                const hh = Math.round(r.d * 18);
                const gain = r.type === "gain";
                const rowTop = rowsTop + row * 48;
                const mag = Math.min(2, 1 + (ws[bi - v0] - 1) * 0.45).toFixed(3);
                const barTop = gain ? 24 - hh : 25;
                const title = PRED[r.p].name + " " + r.change.toLowerCase();
                const tipLines = ["Δ " + f2(r.d) + (r.ref == null || r.alt == null ? "" : ` (REF ${f2(r.ref)}, ALT ${f2(r.alt)})`), whereOf(r.site) + ", " + chrCoord(r.site)];
                return (
                  <div key={"b" + k}>
                    <span
                      className={styles.laneVal}
                      style={{
                        right: (ovW - (x - 12)).toFixed(1) + "px",
                        top: rowTop + (gain ? barTop : 26),
                        color: gain ? "var(--insight-color-green-300)" : "var(--insight-color-red-300)",
                        transform: `scale(${mag})`,
                        transition: tr(["right", "transform"]),
                      }}
                    >
                      {f2(r.d)}
                    </span>
                    <div className={styles.laneBarPos} style={{ left: (x - 8).toFixed(1) + "px", top: rowTop, transition: tr(["left"]) }}>
                      <Tooltip appearance="light" multiline placement="bottom" delay={0} label={<TipBody title={title} lines={tipLines} />}>
                        <button type="button" className={styles.laneBar} aria-label={title + ", " + tipLines.join(", ")}>
                          <span
                            style={{
                              top: barTop,
                              height: hh,
                              background: gain ? GREEN : RED,
                              transform: `scale(${mag})`,
                              transformOrigin: gain ? "center bottom" : "center top",
                              transition: tr(["transform"]),
                            }}
                          />
                        </button>
                      </Tooltip>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>

        <div
          ref={hsRef}
          role="scrollbar"
          aria-orientation="horizontal"
          aria-label="Move along the prediction window"
          aria-valuemin={wS}
          aria-valuemax={wS + winLen - N}
          aria-valuenow={vS}
          className={styles.hScroll}
          style={{ width: ovW + "px" }}
          onPointerDown={(e) => dragWith(hsRef, e)}
          onPointerMove={dragMove}
          onPointerUp={dragEnd}
          onPointerCancel={dragEnd}
        >
          <div data-thumb="" className={styles.hScrollThumb} style={{ left: vpL, width: vpW, cursor: grab }} />
        </div>
      </div>

      {lensTip ? (
        <div className={styles.lensTip} aria-hidden="true" style={{ left: lensTip.x.toFixed(1) + "px", top: lensTip.y.toFixed(1) + "px", transition: tr(["left"]) }}>
          <div className={styles.lensTipBox}>
            <span className={styles.lensRel}>{lensTip.rel}</span>
            <span className={styles.lensSub}>{lensTip.sub}</span>
            {lensTip.kind.k === "donor" ? <Chip size="sm" color="orange" className={styles.chipRegular}>Donor</Chip> : null}
            {lensTip.kind.k === "bp" ? (
              <Chip size="sm" color="blue" className={styles.chipRegular}>
                Branchpoint {(lensTip.kind.n ?? 0) + 1} of {D.BP_DIST.length}
              </Chip>
            ) : null}
            {lensTip.kind.k === "acc" ? <Chip size="sm" color="green" className={styles.chipRegular}>Acceptor</Chip> : null}
            {lensTip.kind.k === "var" ? <Chip size="sm" color="red" className={styles.chipRegular}>Variant</Chip> : null}
          </div>
          <div className={styles.lensArrow} />
        </div>
      ) : null}
    </div>
  );
}

