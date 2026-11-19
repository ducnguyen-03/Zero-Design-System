import type { HTMLAttributes, ReactNode } from "react";
import type { BarDatum, PieDatum, UpsetData } from "./data";
import { SERIES } from "./data";
import styles from "./Charts.module.css";

const cx = (...parts: Array<string | false | undefined>) => parts.filter(Boolean).join(" ");
const fmt = (n: number) => n.toLocaleString("en-US");

/* ── Card shell (Figma chart card: white, 1px grey-40, radius 8, 8px padding) ── */

export interface ChartCardProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  title: ReactNode;
  /** Header end slot (menus, selectors). */
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  /** 16px inset (wide cards such as the upset plots). */
  roomy?: boolean;
}

export function ChartCard({ title, action, children, className, roomy, ...rest }: ChartCardProps) {
  return (
    <section className={cx(styles.card, roomy && styles.roomy, className)} {...rest}>
      <header className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>{title}</h2>
        {action}
      </header>
      <div className={styles.cardBody}>{children}</div>
    </section>
  );
}

/* ── Vertical bar chart (Age at diagnosis, Study, Sample count) ── */

export interface BarChartProps {
  data: BarDatum[];
  max: number;
  ticks: number[];
  /** Accessible summary. */
  label: string;
}

export function BarChart({ data, max, ticks, label }: BarChartProps) {
  return (
    <figure className={styles.bars} aria-label={label}>
      <div className={styles.plot}>
        <div className={styles.gridLines} aria-hidden="true">
          {ticks.map((t) => (
            <div key={t} className={styles.gridLine}>
              <span className={styles.tick}>{fmt(t)}</span>
              <span className={styles.rule} />
            </div>
          ))}
        </div>
        <ul className={styles.columns}>
          {data.map((d) => (
            <li key={d.label} className={styles.column}>
              <span
                className={styles.bar}
                style={{ height: `${(d.value / max) * 100}%`, background: d.color ?? SERIES.blue }}
                title={`${d.label}: ${fmt(d.value)}`}
              />
              <span className={styles.srOnly}>
                {d.label}: {fmt(d.value)}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div className={styles.xAxis} aria-hidden="true">
        {data.map((d) => (
          <span key={d.label} className={styles.xLabel} title={d.label}>
            <span>{d.label}</span>
          </span>
        ))}
      </div>
    </figure>
  );
}

/* ── Pie chart with in-slice counts ── */

export interface PieChartProps {
  data: PieDatum[];
  size?: number;
  label: string;
  /** Ring instead of a full pie (hole = 45% of the radius). Slice counts are hidden. */
  donut?: boolean;
}

export function PieChart({ data, size = 126, label, donut = false }: PieChartProps) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const r = size / 2;
  let angle = -Math.PI / 2;
  const slices = data.map((d) => {
    const sweep = (d.value / total) * Math.PI * 2;
    const start = angle;
    angle += sweep;
    const end = angle;
    const large = sweep > Math.PI ? 1 : 0;
    const p = (a: number, rad = r) => [r + rad * Math.cos(a), r + rad * Math.sin(a)];
    const [x1, y1] = p(start);
    const [x2, y2] = p(end);
    const [lx, ly] = p(start + sweep / 2, r * 0.62);
    return {
      ...d,
      path: `M${r},${r} L${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} Z`,
      lx,
      ly,
    };
  });
  return (
    <figure className={styles.pie}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={label}>
        {slices.map((s) => (
          <path key={s.label} d={s.path} fill={s.color}>
            <title>{`${s.label}: ${fmt(s.value)}`}</title>
          </path>
        ))}
        {donut ? <circle cx={r} cy={r} r={r * 0.45} fill="var(--insight-color-white)" /> : null}
        {donut ? null : slices.map((s) => (
          <text key={`${s.label}-l`} x={s.lx} y={s.ly} className={styles.pieLabel} textAnchor="middle" dominantBaseline="middle">
            {fmt(s.value)}
          </text>
        ))}
      </svg>
    </figure>
  );
}

/* ── UpSet plot (Combined sequencing, Validation per PDX) ── */

export function UpsetChart({ data, label }: { data: UpsetData; label: string }) {
  const maxSet = Math.max(...data.sets.map((s) => s.size));
  return (
    <figure className={styles.upset} aria-label={label}>
      <div className={styles.upsetTop}>
        <span className={styles.yTitle} aria-hidden="true">
          {data.yLabel}
        </span>
        <div className={styles.upsetTicks} aria-hidden="true">
          {data.yTicks.map((t) => (
            <span key={t}>{fmt(t)}</span>
          ))}
        </div>
        <ul className={styles.upsetColumns}>
          {data.intersections.map((col, i) => (
            <li key={i} className={styles.upsetColumn}>
              <span className={styles.upsetBar} style={{ height: `${(col.value / data.max) * 100}%` }} />
              <span className={styles.srOnly}>
                {col.members.length ? col.members.map((m) => data.sets[m].label).join(" + ") : "None"}: {fmt(col.value)}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div className={styles.upsetMatrix} aria-hidden="true">
        {data.sets.map((set, row) => (
          <div key={set.label} className={cx(styles.upsetRow, row % 2 === 1 && styles.upsetRowAlt)}>
            <span className={styles.setSize}>{fmt(set.size)}</span>
            <span className={styles.setBarTrack}>
              <span className={styles.setBar} style={{ width: `${(set.size / maxSet) * 100}%` }} />
            </span>
            <span className={styles.setLabel}>{set.label}</span>
            <span className={styles.dots}>
              {data.intersections.map((col, i) => {
                const on = col.members.includes(row);
                const first = Math.min(...col.members);
                const last = Math.max(...col.members);
                const linkDown = on && row < last;
                return (
                  <span key={i} className={styles.dotCell}>
                    {linkDown ? <span className={styles.link} /> : null}
                    <span className={cx(styles.dot, on && styles.dotOn, on && row === first && styles.dotFirst)} />
                  </span>
                );
              })}
            </span>
          </div>
        ))}
      </div>
    </figure>
  );
}

/* ── Stacked mutation-type bar (Top mutated genes table) ── */

export function SplitBar({ split, colors }: { split: readonly number[]; colors: readonly string[] }) {
  return (
    <span className={styles.split} aria-hidden="true">
      {split.map((f, i) =>
        f > 0 ? <span key={i} style={{ flexGrow: f, background: colors[i] }} /> : null,
      )}
    </span>
  );
}
