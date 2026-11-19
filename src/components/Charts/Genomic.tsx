import { useState } from "react";
import type { CSSProperties, HTMLAttributes } from "react";
import { ChartLegend } from "./ProportionBar";
import { ALTERATION_COLORS, CHART_INK, fmtNumber, niceTicks } from "./palette";
import type { AlterationType } from "./palette";
import styles from "./Charts.module.css";

const cx = (...parts: Array<string | false | undefined>) => parts.filter(Boolean).join(" ");

/* ─────────────────────────── UpSet plot ─────────────────────────── */

export interface UpSetSet {
  key: string;
  label: string;
  /** Members in the set overall. */
  size: number;
}

export interface UpSetIntersection {
  /** Keys of the sets this column combines. */
  sets: string[];
  value: number;
}

export interface UpSetPlotProps extends HTMLAttributes<HTMLDivElement> {
  sets: UpSetSet[];
  /** Exclusive intersections, largest first. */
  intersections: UpSetIntersection[];
  height?: number;
  yLabel?: string;
  label: string;
}

/**
 * Which combinations occur and how often (sequencing per patient, validation per PDX): columns are
 * intersections, the dot matrix names their sets, the left bars give each set's size.
 */
export function UpSetPlot({ sets, intersections, height = 150, yLabel, label, className, ...rest }: UpSetPlotProps) {
  const [hover, setHover] = useState<number | null>(null);
  const ticks = niceTicks(Math.max(...intersections.map((i) => i.value), 0), 2);
  const top = ticks[ticks.length - 1];
  const maxSet = Math.max(...sets.map((s) => s.size), 1);
  const cols = `repeat(${intersections.length}, minmax(14px, 1fr))`;
  return (
    <div className={cx(styles.upset, className)} role="figure" aria-label={label} {...rest}>
      {/* top: axis + intersection bars */}
      <div className={styles.upsetCorner} aria-hidden="true">
        {yLabel ? <span className={styles.upsetYTitle}>{yLabel}</span> : null}
        <span className={styles.upsetTicks} style={{ height }}>
          {ticks
            .slice()
            .reverse()
            .map((t) => (
              <span key={t} style={{ bottom: `${(t / top) * 100}%` }}>
                {fmtNumber(t)}
              </span>
            ))}
        </span>
      </div>
      <div className={styles.upsetBars} style={{ height, gridTemplateColumns: cols }}>
        {intersections.map((x, i) => (
          <span
            key={i}
            className={cx(styles.upsetBar, hover !== null && hover !== i && styles.upsetDim)}
            style={{ height: `${(x.value / top) * 100}%`, background: CHART_INK }}
            title={`${x.sets.map((k) => sets.find((s) => s.key === k)?.label).join(" + ")}: ${fmtNumber(x.value)}`}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          />
        ))}
      </div>
      {/* bottom: set sizes + dot matrix */}
      <ul className={styles.upsetSets}>
        {sets.map((s) => (
          <li key={s.key} className={styles.upsetSet}>
            <span className={styles.upsetSize}>{fmtNumber(s.size)}</span>
            <span className={styles.upsetSizeBar} aria-hidden="true">
              <span style={{ width: `${(s.size / maxSet) * 100}%`, background: CHART_INK }} />
            </span>
            <span className={styles.upsetLabel}>{s.label}</span>
          </li>
        ))}
      </ul>
      <div className={styles.upsetMatrix} style={{ gridTemplateColumns: cols }} aria-hidden="true">
        {intersections.map((x, i) => {
          const on = sets.map((s) => x.sets.includes(s.key));
          const first = on.indexOf(true);
          const last = on.lastIndexOf(true);
          return (
            <span
              key={i}
              className={cx(styles.upsetCol, hover === i && styles.upsetColHover)}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            >
              {first !== last ? (
                <span
                  className={styles.upsetLink}
                  style={{ top: `calc(${first} * var(--upset-row) + var(--upset-row) / 2)`, height: `calc(${last - first} * var(--upset-row))` }}
                />
              ) : null}
              {on.map((v, j) => (
                <span key={j} className={cx(styles.upsetDot, v && styles.upsetDotOn)} />
              ))}
            </span>
          );
        })}
      </div>
      <table className={styles.srOnly}>
        <caption>{label}</caption>
        <tbody>
          {intersections.map((x, i) => (
            <tr key={i}>
              <th scope="row">{x.sets.map((k) => sets.find((s) => s.key === k)?.label).join(" + ")}</th>
              <td>{x.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─────────────────────────── Oncoprint ─────────────────────────── */

export interface OncoprintGene {
  gene: string;
  /** One entry per sample: the alteration classes found, or empty. */
  alterations: AlterationType[][];
}

export interface OncoprintTrack {
  label: string;
  /** One colour per sample (clinical annotation: sex, event, category). */
  values: Array<{ value: string; color: string }>;
}

export interface OncoprintProps extends HTMLAttributes<HTMLDivElement> {
  /** Sample (or participant) ids, in column order. */
  samples: string[];
  genes: OncoprintGene[];
  /** Clinical annotation rows above the genes. */
  tracks?: OncoprintTrack[];
  label?: string;
}

/**
 * Alterations per gene (rows) per sample (columns). Each cell splits evenly between its alteration
 * classes; the left column gives the share of samples altered; the top bar counts alterations per sample.
 */
export function Oncoprint({ samples, genes, tracks = [], label = "Oncoprint", className, ...rest }: OncoprintProps) {
  const [col, setCol] = useState<number | null>(null);
  const perSample = samples.map((_, s) => genes.reduce((a, g) => a + (g.alterations[s]?.length ? 1 : 0), 0));
  const maxPer = Math.max(...perSample, 1);
  const used = (Object.keys(ALTERATION_COLORS) as AlterationType[]).filter((t) => genes.some((g) => g.alterations.some((a) => a?.includes(t))));
  const grid: CSSProperties = { gridTemplateColumns: `var(--onco-label) var(--onco-pct) repeat(${samples.length}, var(--onco-cell))` };
  return (
    <div className={cx(styles.onco, className)} role="figure" aria-label={label} {...rest}>
      <div className={styles.oncoScroll}>
        <div className={styles.oncoGrid} style={grid} onMouseLeave={() => setCol(null)}>
          {/* per-sample count bar */}
          <span className={styles.oncoAxisNote}>Altered genes</span>
          <span />
          {perSample.map((n, s) => (
            <span key={`b${s}`} className={styles.oncoTopCell} onMouseEnter={() => setCol(s)}>
              <span style={{ height: `${(n / maxPer) * 100}%` }} />
            </span>
          ))}
          {/* clinical tracks */}
          {tracks.map((t) => (
            <Row key={t.label} label={t.label} pct="" muted>
              {t.values.map((v, s) => (
                <span
                  key={s}
                  className={cx(styles.oncoCell, col === s && styles.oncoCellHi)}
                  style={{ background: v.color }}
                  title={`${samples[s]} · ${t.label}: ${v.value}`}
                  onMouseEnter={() => setCol(s)}
                />
              ))}
            </Row>
          ))}
          {/* genes */}
          {genes.map((g) => {
            const altered = g.alterations.filter((a) => a?.length).length;
            return (
              <Row key={g.gene} label={g.gene} pct={`${Math.round((altered / samples.length) * 100)}%`}>
                {samples.map((sid, s) => {
                  const a = g.alterations[s] ?? [];
                  return (
                    <span
                      key={s}
                      className={cx(styles.oncoCell, styles.oncoGene, col === s && styles.oncoCellHi)}
                      title={a.length ? `${sid} · ${g.gene}: ${a.join(", ")}` : `${sid} · ${g.gene}: none`}
                      onMouseEnter={() => setCol(s)}
                    >
                      {a.map((t) => (
                        <span key={t} style={{ background: ALTERATION_COLORS[t] }} />
                      ))}
                    </span>
                  );
                })}
              </Row>
            );
          })}
        </div>
      </div>
      <div className={styles.oncoFoot}>
        <ChartLegend items={used.map((t) => ({ label: t, color: ALTERATION_COLORS[t] }))} swatch="square" />
        <span className={styles.oncoHover} aria-live="polite">
          {col !== null ? `${samples[col]} · ${perSample[col]} of ${genes.length} genes altered` : `${samples.length} samples`}
        </span>
      </div>
    </div>
  );
}

function Row({ label, pct, muted, children }: { label: string; pct: string; muted?: boolean; children: React.ReactNode }) {
  return (
    <>
      <span className={cx(styles.oncoLabel, muted && styles.oncoLabelMuted)}>{label}</span>
      <span className={styles.oncoPct}>{pct}</span>
      {children}
    </>
  );
}

/* ─────────────────────────── Frequency heatmap ─────────────────────────── */

export interface HeatmapCell {
  /** Share of the column's samples, 0–100. */
  pct: number;
  /** "14/120". */
  count?: string;
}

export interface FrequencyHeatmapProps extends HTMLAttributes<HTMLDivElement> {
  columns: string[];
  rows: Array<{ label: string; cells: HeatmapCell[] }>;
  label: string;
}

const TONES = [
  { min: 30, name: "> 30% High", cls: "heatHigh" },
  { min: 15, name: "15–30% Medium", cls: "heatMed" },
  { min: 5, name: "5–15% Low", cls: "heatLow" },
  { min: 0, name: "< 5% Very low", cls: "heatVl" },
] as const;
const toneOf = (p: number) => (p > 30 ? TONES[0] : p >= 15 ? TONES[1] : p >= 5 ? TONES[2] : TONES[3]);

/** How often each gene is altered in each cancer category — four bands, so the eye reads level, not decimals. */
export function FrequencyHeatmap({ columns, rows, label, className, ...rest }: FrequencyHeatmapProps) {
  return (
    <div className={cx(styles.heat, className)} {...rest}>
      <div className={styles.oncoScroll}>
        <table className={styles.heatTable}>
          <caption className={styles.srOnly}>{label}</caption>
          <thead>
            <tr>
              <th scope="col">
                <span className={styles.srOnly}>Gene</span>
              </th>
              {columns.map((c) => (
                <th key={c} scope="col">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label}>
                <th scope="row">{r.label}</th>
                {r.cells.map((c, i) => (
                  <td key={i}>
                    <span className={cx(styles.heatCell, styles[toneOf(c.pct).cls])}>
                      <b>{c.pct}%</b>
                      {c.count ? <span>{c.count}</span> : null}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className={styles.legend}>
        {TONES.map((t) => (
          <li key={t.cls} className={styles.legendItem}>
            <span className={cx(styles.swatch, styles.swatchSquare, styles[t.cls])} aria-hidden="true" />
            {t.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
