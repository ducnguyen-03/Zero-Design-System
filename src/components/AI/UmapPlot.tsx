import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import styles from "./UmapPlot.module.css";

const cx = (...parts: Array<string | false | undefined>) => parts.filter(Boolean).join(" ");

export interface UmapGroup {
  /** Legend label, e.g. "AML, myelodysplasia-related". */
  label: string;
  /** Short label drawn on the cluster, e.g. "AML, MR". Defaults to `label`; `null` hides it. */
  shortLabel?: string | null;
  /** Any CSS colour — prefer tokens. Reference / "other" classes read best in `--insight-color-grey-50`. */
  color: string;
}

/** `[x, y, groupIndex]` — x/y in any units (they are rescaled); UMAP axes carry no meaning. */
export type UmapPoint = [number, number, number];

export interface UmapHighlight {
  id: string;
  /** Text on the marker. Short ids ("C1") draw inside the disc; longer ones ("CASE-0001") in a pill beside it. */
  label: string;
  x: number;
  y: number;
  /** Optional description for the hover title and the screen-reader table. */
  description?: string;
}

export interface UmapPlotProps extends HTMLAttributes<HTMLElement> {
  points: UmapPoint[];
  groups: UmapGroup[];
  /** Cases placed in the cohort — this case, or C1…C4 of a patient set. */
  highlights?: UmapHighlight[];
  /** Plot height in px. Default 420. */
  height?: number;
  /** Describes the plot for assistive tech, e.g. "UMAP of 2,155 Level 1 reference samples". */
  label: string;
  /** Legend chips switch a class on or off (muted classes stay as faint context). Default true. */
  interactiveLegend?: boolean;
  /** Legend chips for the classes. `false` keeps only `legendExtra` — for plots that grey the reference
   *  and let the cluster labels name the classes. Default true. */
  classLegend?: boolean;
  /** Show the sample count after each legend label. Default true. */
  showCounts?: boolean;
  /** Extra legend entries after the classes, e.g. a "This case" key. */
  legendExtra?: ReactNode;
  /** Id of the highlight to emphasise — e.g. the table row under the pointer. Others step back. */
  activeHighlight?: string | null;
  /** Hover / focus on a marker reports its id (and `null` on leave), to sync a table or list. */
  onHighlightChange?: (id: string | null) => void;
}

const PAD = 28;

/**
 * 2D UMAP scatter for classifier reference cohorts. Clusters carry their own
 * labels (median position), the legend doubles as a class filter, and cases
 * sit on top as dark markers. A visually hidden table carries the numbers.
 */
export function UmapPlot({
  points,
  groups,
  highlights = [],
  height = 420,
  label,
  interactiveLegend = true,
  classLegend = true,
  showCounts = true,
  legendExtra,
  activeHighlight = null,
  onHighlightChange,
  className,
  ...rest
}: UmapPlotProps) {
  const plotRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [muted, setMuted] = useState<Set<number>>(() => new Set());
  const tableId = useId();

  useEffect(() => {
    const el = plotRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const bounds = useMemo(() => {
    const all = [...points.map(([x, y]) => [x, y]), ...highlights.map((h) => [h.x, h.y])];
    const xs = all.map((p) => p[0]);
    const ys = all.map((p) => p[1]);
    return { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) };
  }, [points, highlights]);

  const sx = (x: number) => PAD + ((x - bounds.x0) / (bounds.x1 - bounds.x0 || 1)) * Math.max(0, width - PAD * 2);
  const sy = (y: number) => PAD + (1 - (y - bounds.y0) / (bounds.y1 - bounds.y0 || 1)) * (height - PAD * 2);

  const counts = useMemo(() => {
    const c = groups.map(() => 0);
    for (const p of points) c[p[2]] = (c[p[2]] ?? 0) + 1;
    return c;
  }, [points, groups]);

  // Each class is labelled over its densest region (8×8 grid cell with the most
  // samples), lifted to that region's top edge — scattered classes such as PNS
  // land on their main island, and labels stay clear of the dense core.
  const centres = useMemo(
    () =>
      groups.map((_, g) => {
        const own = points.filter((p) => p[2] === g);
        if (own.length < 8) return null;
        const N = 8;
        const cell = (p: UmapPoint) =>
          Math.min(N - 1, Math.floor(((p[0] - bounds.x0) / (bounds.x1 - bounds.x0 || 1)) * N)) * N +
          Math.min(N - 1, Math.floor(((p[1] - bounds.y0) / (bounds.y1 - bounds.y0 || 1)) * N));
        const bins = new Map<number, UmapPoint[]>();
        for (const p of own) bins.set(cell(p), [...(bins.get(cell(p)) ?? []), p]);
        const densest = [...bins.values()].sort((a, b) => b.length - a.length)[0];
        const xs = densest.map((p) => p[0]).sort((a, b) => a - b);
        return { x: xs[Math.floor(xs.length / 2)], y: Math.max(...densest.map((p) => p[1])) };
      }),
    [points, groups, bounds],
  );

  const toggle = (g: number) =>
    setMuted((prev) => {
      const next = new Set(prev);
      if (next.has(g)) next.delete(g);
      else next.add(g);
      // Muting every class leaves nothing to read — reset instead.
      return next.size === groups.length ? new Set() : next;
    });

  // Muted points draw first so live classes sit on top.
  const order = useMemo(() => {
    const idx = points.map((_, i) => i);
    return idx.sort((a, b) => Number(!muted.has(points[a][2])) - Number(!muted.has(points[b][2])));
  }, [points, muted]);

  const r = width > 0 && width < 480 ? 2.2 : 3;

  return (
    <figure className={cx(styles.umap, className)} {...rest}>
      <ul className={styles.legend} aria-label={interactiveLegend ? "Classes — select to show or hide" : "Classes"}>
        {(classLegend ? groups : []).map((g, i) => {
          const off = muted.has(i);
          const body = (
            <>
              <span className={styles.swatch} style={{ background: g.color }} aria-hidden="true" />
              <span>{g.label}</span>
              {showCounts ? <span className={styles.legendCount}>{counts[i].toLocaleString()}</span> : null}
            </>
          );
          return (
            <li key={g.label}>
              {interactiveLegend ? (
                <button
                  type="button"
                  className={cx(styles.legendItem, styles.legendButton, off && styles.legendOff)}
                  aria-pressed={!off}
                  onClick={() => toggle(i)}
                >
                  {body}
                </button>
              ) : (
                <span className={styles.legendItem}>{body}</span>
              )}
            </li>
          );
        })}
        {legendExtra}
      </ul>

      <div ref={plotRef} className={styles.plot} style={{ height }}>
        {width > 0 ? (
          <svg
            width={width}
            height={height}
            role="img"
            aria-label={label}
            aria-describedby={tableId}
            className={styles.svg}
          >
            <g>
              {order.map((i) => {
                const [x, y, g] = points[i];
                const off = muted.has(g);
                return (
                  <circle
                    key={i}
                    cx={sx(x)}
                    cy={sy(y)}
                    r={r}
                    className={styles.dot}
                    style={{ fill: off ? "var(--insight-color-grey-50)" : groups[g]?.color, opacity: off ? 0.45 : 1 }}
                  />
                );
              })}
            </g>
            <g aria-hidden="true">
              {placeLabels(
                centres.flatMap((c, g) => {
                  const text = groups[g].shortLabel === undefined ? groups[g].label : groups[g].shortLabel;
                  if (!c || !text || muted.has(g)) return [];
                  return [{ g, text, x: sx(c.x), y: Math.max(16, sy(c.y) - 10) }];
                }),
                width,
              ).map((l) => (
                <text key={l.g} x={l.x} y={l.y} textAnchor="middle" className={styles.clusterLabel}>
                  {l.text}
                </text>
              ))}
            </g>
            <g>
              {/* The active marker draws last so it sits on top. */}
              {[...highlights].sort((a, b) => Number(a.id === activeHighlight) - Number(b.id === activeHighlight)).map((h) => {
                const x = sx(h.x);
                const y = sy(h.y);
                const short = h.label.length <= 3;
                const pillW = h.label.length * 7 + 14;
                const flip = x + 14 + pillW > width - 4;
                return (
                  <g
                    key={h.id}
                    className={cx(
                      styles.marker,
                      activeHighlight === h.id && styles.markerActive,
                      activeHighlight != null && activeHighlight !== h.id && styles.markerDim,
                    )}
                    style={{ transformOrigin: `${x}px ${y}px` }}
                    tabIndex={onHighlightChange ? 0 : undefined}
                    role={onHighlightChange ? "button" : undefined}
                    aria-label={onHighlightChange ? (h.description ? `${h.label}, ${h.description}` : h.label) : undefined}
                    onMouseEnter={onHighlightChange ? () => onHighlightChange(h.id) : undefined}
                    onMouseLeave={onHighlightChange ? () => onHighlightChange(null) : undefined}
                    onFocus={onHighlightChange ? () => onHighlightChange(h.id) : undefined}
                    onBlur={onHighlightChange ? () => onHighlightChange(null) : undefined}
                  >
                    <title>{h.description ? `${h.label} — ${h.description}` : h.label}</title>
                    {short ? (
                      <>
                        <circle cx={x} cy={y} r={11} className={styles.markerHalo} />
                        <circle cx={x} cy={y} r={9} className={styles.markerDisc} />
                        <text x={x} y={y} dy="0.35em" textAnchor="middle" className={styles.markerText}>
                          {h.label}
                        </text>
                      </>
                    ) : (
                      <>
                        <circle cx={x} cy={y} r={9} className={styles.markerHalo} />
                        <circle cx={x} cy={y} r={7} className={styles.markerRing} />
                        <circle cx={x} cy={y} r={3.5} className={styles.markerDisc} />
                        <rect
                          x={flip ? x - 12 - pillW : x + 12}
                          y={y - 10}
                          width={pillW}
                          height={20}
                          rx={4}
                          className={styles.markerDisc}
                        />
                        <text
                          x={flip ? x - 12 - pillW / 2 : x + 12 + pillW / 2}
                          y={y}
                          dy="0.35em"
                          textAnchor="middle"
                          className={styles.markerText}
                        >
                          {h.label}
                        </text>
                      </>
                    )}
                  </g>
                );
              })}
            </g>
          </svg>
        ) : null}
        <span className={cx(styles.axis, styles.axisY)} aria-hidden="true">
          ↑ UMAP 2
        </span>
        <span className={cx(styles.axis, styles.axisX)} aria-hidden="true">
          UMAP 1 →
        </span>
      </div>

      {/* Tables ignore width: 1px, so the hidden wrapper clips it. */}
      <div className={styles.srOnly}>
      <table id={tableId}>
        <caption>{label}</caption>
        <thead>
          <tr>
            <th scope="col">Class</th>
            <th scope="col">Reference samples</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((g, i) => (
            <tr key={g.label}>
              <th scope="row">{g.label}</th>
              <td>{counts[i]}</td>
            </tr>
          ))}
          {highlights.map((h) => (
            <tr key={h.id}>
              <th scope="row">{h.label}</th>
              <td>{h.description ?? "Highlighted case"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </figure>
  );
}

/** Nudges cluster labels apart: overlapping boxes move up a line, and every label stays inside the plot. */
function placeLabels<T extends { text: string; x: number; y: number }>(labels: T[], width: number): T[] {
  const LINE = 16;
  const w = (l: T) => l.text.length * 6.6 + 8;
  const placed: T[] = [];
  for (const l of [...labels].sort((a, b) => a.y - b.y)) {
    const next = { ...l, x: Math.min(Math.max(l.x, w(l) / 2 + 4), width - w(l) / 2 - 4) };
    for (let guard = 0; guard < 6; guard++) {
      const hit = placed.find((p) => Math.abs(p.x - next.x) < (w(p) + w(next)) / 2 && Math.abs(p.y - next.y) < LINE);
      if (!hit) break;
      next.y = hit.y + LINE;
    }
    placed.push(next);
  }
  return placed;
}

/** Plain legend key — a coloured dot and a label — for `UmapPlot.legendExtra`. */
export function UmapSwatchKey({ color, children }: { color: string; children: ReactNode }) {
  return (
    <li className={styles.legendItem}>
      <span className={styles.swatch} style={{ background: color }} aria-hidden="true" />
      <span>{children}</span>
    </li>
  );
}

/** Legend key for highlighted cases, for `UmapPlot.legendExtra`. */
export function UmapCaseKey({ children = "This case" }: { children?: ReactNode }) {
  return (
    <li className={styles.legendItem}>
      <span className={styles.caseKey} aria-hidden="true" />
      <span>{children}</span>
    </li>
  );
}
