import { useId, useState } from "react";
import type { HTMLAttributes } from "react";
import { ChartLegend, ProportionBar } from "../Charts/ProportionBar";
import { fmtNumber } from "../Charts/palette";
import { Select } from "../Select/Select";
import styles from "./Insights.module.css";

const cx = (...parts: Array<string | false | undefined>) => parts.filter(Boolean).join(" ");

export interface DatasetBreakdown {
  value: string;
  /** "Sex", "Tissue type", "Mice strain". */
  label: string;
  rows: Array<{ label: string; value: number }>;
}

export interface DatasetAccessCardProps extends HTMLAttributes<HTMLElement> {
  /** "Participants". */
  label: string;
  available: number;
  total: number;
  /** Plural noun for the legend: "participants", "samples", "PDX models". */
  unit: string;
  color?: string;
  /** Ways to split what you can see. The first is shown by default. */
  breakdowns?: DatasetBreakdown[];
}

/** One record type on the account page: what you can see, what your tier hides, and a breakdown of the visible part. */
export function DatasetAccessCard({
  label,
  available,
  total,
  unit,
  color = "var(--insight-color-purple-100)",
  breakdowns = [],
  className,
  ...rest
}: DatasetAccessCardProps) {
  const [by, setBy] = useState(breakdowns[0]?.value ?? "");
  const titleId = useId();
  const current = breakdowns.find((b) => b.value === by) ?? breakdowns[0];
  const max = current ? Math.max(...current.rows.map((r) => r.value), 1) : 1;
  return (
    <section className={cx(styles.card, className)} aria-labelledby={titleId} {...rest}>
      <div className={styles.cardHead}>
        <div className={styles.cardTitles}>
          <h3 id={titleId} className={styles.eyebrow}>
            {label}
          </h3>
          <span className={styles.cardValue}>{fmtNumber(available)}</span>
        </div>
        {breakdowns.length > 1 ? (
          <Select
            size="xs"
            aria-label={`Break ${label.toLowerCase()} down by`}
            value={by}
            onValueChange={setBy}
            options={breakdowns.map((b) => ({ value: b.value, label: b.label }))}
            className={styles.cardSelect}
          />
        ) : current ? (
          <span className={styles.cardBy}>{current.label}</span>
        ) : null}
      </div>
      <ProportionBar value={available} total={total} color={color} remainder="hatched" label={`${fmtNumber(available)} of ${fmtNumber(total)} ${unit} available`} />
      <ChartLegend
        items={[
          { label: `${fmtNumber(available)} ${unit} available`, color },
          ...(total > available ? [{ label: `${fmtNumber(total - available)} no access`, color: "", hatched: true }] : []),
        ]}
      />
      {current ? (
        <ul className={styles.breakdown} aria-label={`${label} by ${current.label.toLowerCase()}`}>
          {current.rows.map((r) => (
            <li key={r.label} className={styles.breakdownRow}>
              <span className={styles.breakdownLabel}>{r.label}</span>
              <span className={styles.breakdownTrack} aria-hidden="true">
                <span style={{ width: `${(r.value / max) * 100}%`, background: color }} />
              </span>
              <span className={styles.breakdownValue}>{fmtNumber(r.value)}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
