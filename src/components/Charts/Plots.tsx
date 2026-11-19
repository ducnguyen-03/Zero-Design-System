import { useId, useState } from "react";
import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { ChartLegend } from "./ProportionBar";
import { chartColor, fmtNumber, niceTicks } from "./palette";
import styles from "./Charts.module.css";

const cx = (...parts: Array<string | false | undefined>) => parts.filter(Boolean).join(" ");

/* ─────────────────────────── Shared axis frame ─────────────────────────── */

function YAxisFrame({
  ticks,
  height,
  yLabel,
  children,
  xLabels,
}: {
  ticks: number[];
  height: number;
  yLabel?: string;
  children: ReactNode;
  xLabels: ReactNode;
}) {
  const top = ticks[ticks.length - 1];
  return (
    <div className={styles.axisFrame}>
      {yLabel ? <span className={styles.yTitle}>{yLabel}</span> : null}
      <div className={styles.yAxis} style={{ height }} aria-hidden="true">
        {ticks
          .slice()
          .reverse()
          .map((t) => (
            <span key={t} style={{ bottom: `${(t / top) * 100}%` }}>
              {fmtNumber(t)}
            </span>
          ))}
      </div>
      <div className={styles.plotCol}>
        <div className={styles.plot} style={{ height }}>
          {ticks.map((t) => (
            <span key={t} className={styles.gridline} style={{ bottom: `${(t / top) * 100}%` }} aria-hidden="true" />
          ))}
          {children}
        </div>
        {xLabels}
      </div>
    </div>
  );
}

/* ─────────────────────────── Bar chart ─────────────────────────── */

export interface BarDatum {
  label: string;
  value: number;
  color?: string;
}

export interface BarChartProps extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> {
  data: BarDatum[];
  /** One colour for every bar. Ignored when `colorBy="category"`. Default blue-100. */
  color?: string;
  /** `category` gives each bar the next categorical colour (study distribution). */
  colorBy?: "single" | "category";
  height?: number;
  yLabel?: string;
  /** Accessible name for the chart. */
  label: string;
  /** Makes bars selectable (filter by a bar). */
  onSelect?: (datum: BarDatum) => void;
  selected?: string;
}

/** Vertical bars with a 0-based axis. Labels truncate; the full label and value are in the bar's name and title. */
export function BarChart({
  data,
  color = "var(--insight-color-blue-100)",
  colorBy = "single",
  height = 180,
  yLabel,
  label,
  onSelect,
  selected,
  className,
  ...rest
}: BarChartProps) {
  const ticks = niceTicks(Math.max(...data.map((d) => d.value), 0));
  const top = ticks[ticks.length - 1];
  return (
    <div className={cx(styles.chart, className)} role="figure" aria-label={label} {...rest} style={{ ...barCount(data.length), ...rest.style }}>
      <YAxisFrame
        ticks={ticks}
        height={height}
        yLabel={yLabel}
        xLabels={
          <div className={styles.xLabels} aria-hidden="true">
            {data.map((d) => (
              <span key={d.label} title={d.label}>
                {d.label}
              </span>
            ))}
          </div>
        }
      >
        <div className={styles.bars}>
          {data.map((d, i) => {
            const fill = d.color ?? (colorBy === "category" ? chartColor(i) : color);
            const name = `${d.label}: ${fmtNumber(d.value)}`;
            const style: CSSProperties = { height: `${(d.value / top) * 100}%`, background: fill };
            return (
              <span key={d.label} className={styles.barSlot}>
                {onSelect ? (
                  <button
                    type="button"
                    className={cx(styles.bar, styles.barButton, selected === d.label && styles.barSelected, selected && selected !== d.label && styles.barDim)}
                    style={style}
                    aria-label={name}
                    aria-pressed={selected === d.label}
                    title={name}
                    onClick={() => onSelect(d)}
                  />
                ) : (
                  <span className={styles.bar} style={style} title={name} role="img" aria-label={name} />
                )}
              </span>
            );
          })}
        </div>
      </YAxisFrame>
    </div>
  );
}

/* ─────────────────────────── Stacked bar chart ─────────────────────────── */

/** Exposes the bar count to CSS so the gap between bars can shrink for dense series. */
const barCount = (n: number) => ({ "--bar-count": n }) as CSSProperties;

export interface StackSeries {
  key: string;
  label: string;
  color?: string;
}

export interface StackedBarChartProps extends HTMLAttributes<HTMLDivElement> {
  series: StackSeries[];
  data: Array<{ label: string; values: Record<string, number> }>;
  height?: number;
  yLabel?: string;
  label: string;
}

/** Bars split by series (enrolment by study per quarter). Hover a legend item to isolate its series. */
export function StackedBarChart({ series, data, height = 200, yLabel, label, className, ...rest }: StackedBarChartProps) {
  const [focus, setFocus] = useState<string | null>(null);
  const totals = data.map((d) => series.reduce((a, s) => a + (d.values[s.key] ?? 0), 0));
  const ticks = niceTicks(Math.max(...totals, 0));
  const top = ticks[ticks.length - 1];
  const colors = series.map((s, i) => s.color ?? chartColor(i));
  return (
    <div className={cx(styles.chart, className)} role="figure" aria-label={label} {...rest} style={{ ...barCount(data.length), ...rest.style }}>
      <YAxisFrame
        ticks={ticks}
        height={height}
        yLabel={yLabel}
        xLabels={
          <div className={styles.xLabels} aria-hidden="true">
            {data.map((d, i) => (
              <span key={`${d.label}-${i}`}>{d.label}</span>
            ))}
          </div>
        }
      >
        <div className={styles.bars}>
          {data.map((d, i) => (
            <span key={`${d.label}-${i}`} className={styles.barSlot}>
              <span
                className={styles.stack}
                style={{ height: `${(totals[i] / top) * 100}%` }}
                role="img"
                aria-label={`${d.label}: ${series.map((s) => `${s.label} ${fmtNumber(d.values[s.key] ?? 0)}`).join(", ")}`}
              >
                {series.map((s, j) =>
                  d.values[s.key] ? (
                    <span
                      key={s.key}
                      style={{
                        flexGrow: d.values[s.key],
                        background: colors[j],
                        opacity: focus && focus !== s.key ? 0.2 : 1,
                      }}
                      title={`${s.label}: ${fmtNumber(d.values[s.key])}`}
                    />
                  ) : null,
                )}
              </span>
            </span>
          ))}
        </div>
      </YAxisFrame>
      <ul className={styles.legend} onMouseLeave={() => setFocus(null)}>
        {series.map((s, j) => (
          <li key={s.key} className={styles.legendItem} onMouseEnter={() => setFocus(s.key)}>
            <span className={cx(styles.swatch, styles.swatchSquare)} style={{ background: colors[j] }} aria-hidden="true" />
            {s.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ─────────────────────────── Pie chart ─────────────────────────── */

export interface PieDatum {
  label: string;
  value: number;
  color?: string;
}

export interface PieChartProps extends HTMLAttributes<HTMLDivElement> {
  data: PieDatum[];
  label: string;
  /** Diameter in px. Default 160. */
  size?: number;
  /** Hole as a share of the radius (0 = pie). Default 0. */
  donut?: number;
  /** Show the legend under the pie. Default true. */
  legend?: boolean;
}

/** Shares of a whole. Slices under 8% drop their in-slice label (the legend and title still carry it). */
export function PieChart({ data, label, size = 160, donut = 0, legend = true, className, ...rest }: PieChartProps) {
  const total = data.reduce((a, d) => a + d.value, 0) || 1;
  const r = 50;
  let angle = -Math.PI / 2;
  const slices = data.map((d, i) => {
    const a0 = angle;
    const a1 = angle + (d.value / total) * Math.PI * 2;
    angle = a1;
    const large = a1 - a0 > Math.PI ? 1 : 0;
    const p = (a: number, rad: number) => [50 + rad * Math.cos(a), 50 + rad * Math.sin(a)];
    const [x0, y0] = p(a0, r);
    const [x1, y1] = p(a1, r);
    const inner = r * donut;
    const path =
      d.value >= total
        ? donut
          ? `M50 0A50 50 0 1 1 49.99 0Z`
          : `M50 0A50 50 0 1 1 49.99 0Z`
        : donut
          ? (() => {
              const [ix1, iy1] = p(a1, inner);
              const [ix0, iy0] = p(a0, inner);
              return `M${x0} ${y0}A${r} ${r} 0 ${large} 1 ${x1} ${y1}L${ix1} ${iy1}A${inner} ${inner} 0 ${large} 0 ${ix0} ${iy0}Z`;
            })()
          : `M50 50L${x0} ${y0}A${r} ${r} 0 ${large} 1 ${x1} ${y1}Z`;
    const mid = (a0 + a1) / 2;
    const [lx, ly] = p(mid, donut ? (r + inner) / 2 : r * 0.62);
    return { d, i, path, lx, ly, share: d.value / total, color: d.color ?? chartColor(i) };
  });
  return (
    <div className={cx(styles.pieWrap, className)} role="figure" aria-label={label} {...rest}>
      <svg viewBox="0 0 100 100" width={size} height={size} className={styles.pie}>
        {slices.map((s) => (
          <path key={s.i} d={s.path} fill={s.color} stroke="var(--insight-color-white)" strokeWidth={0.8}>
            <title>{`${s.d.label}: ${fmtNumber(s.d.value)} (${(s.share * 100).toFixed(1)}%)`}</title>
          </path>
        ))}
        {slices.map((s) =>
          s.share >= 0.08 ? (
            <text key={`t${s.i}`} x={s.lx} y={s.ly} className={styles.pieLabel} textAnchor="middle" dominantBaseline="central">
              {fmtNumber(s.d.value)}
            </text>
          ) : null,
        )}
      </svg>
      {legend ? <ChartLegend items={slices.map((s) => ({ label: s.d.label, color: s.color }))} /> : null}
    </div>
  );
}

/* ─────────────────────────── Line chart ─────────────────────────── */

export interface LineSeries {
  key: string;
  label: string;
  values: number[];
  color?: string;
}

export interface LineChartProps extends HTMLAttributes<HTMLDivElement> {
  /** X categories, e.g. months. */
  labels: string[];
  series: LineSeries[];
  height?: number;
  yLabel?: string;
  label: string;
}

/** Trends over an ordered axis (turnaround times). Lines keep a 2px stroke at any width. */
export function LineChart({ labels, series, height = 180, yLabel, label, className, ...rest }: LineChartProps) {
  const id = useId();
  const max = Math.max(...series.flatMap((s) => s.values), 0);
  const ticks = niceTicks(max);
  const top = ticks[ticks.length - 1];
  const n = Math.max(labels.length - 1, 1);
  const pt = (v: number, i: number) => `${(i / n) * 100},${100 - (v / top) * 100}`;
  return (
    <div className={cx(styles.chart, className)} role="figure" aria-label={label} {...rest}>
      <YAxisFrame
        ticks={ticks}
        height={height}
        yLabel={yLabel}
        xLabels={
          <div className={cx(styles.xLabels, styles.xLabelsLine)} aria-hidden="true">
            {labels.map((l) => (
              <span key={l}>{l}</span>
            ))}
          </div>
        }
      >
        <svg className={styles.lineSvg} viewBox="0 0 100 100" preserveAspectRatio="none" aria-labelledby={`${id}-t`}>
          <title id={`${id}-t`}>{label}</title>
          {series.map((s, j) => (
            <polyline
              key={s.key}
              points={s.values.map(pt).join(" ")}
              fill="none"
              stroke={s.color ?? chartColor(j)}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>
      </YAxisFrame>
      <ChartLegend items={series.map((s, j) => ({ label: s.label, color: s.color ?? chartColor(j) }))} swatch="square" />
    </div>
  );
}
