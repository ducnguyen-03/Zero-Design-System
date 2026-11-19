import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { fmtNumber } from "./palette";
import styles from "./Charts.module.css";

const cx = (...parts: Array<string | false | undefined>) => parts.filter(Boolean).join(" ");

export interface ProportionBarProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  total: number;
  /** Fill colour. Default green-150 (published). */
  color?: string;
  /** How the rest reads: `solid` grey (e.g. unpublished) or `hatched` (locked by your access tier). */
  remainder?: "solid" | "hatched";
  /** `md` 10px · `sm` 6px. */
  size?: "sm" | "md";
  /** Accessible description. Default "{value} of {total}". */
  label?: string;
}

/** A part of a whole: the share as a solid fill, the rest grey or hatched. */
export function ProportionBar({
  value,
  total,
  color,
  remainder = "solid",
  size = "md",
  label,
  className,
  style,
  ...rest
}: ProportionBarProps) {
  const pct = total > 0 ? Math.min(100, (value / total) * 100) : 0;
  return (
    <div
      role="img"
      aria-label={label ?? `${fmtNumber(value)} of ${fmtNumber(total)}`}
      className={cx(styles.prop, size === "sm" && styles.propSm, className)}
      style={{ "--prop-fill": color, ...style } as CSSProperties}
      {...rest}
    >
      <span className={styles.propFill} style={{ width: `${pct}%` }} />
      {pct < 100 ? <span className={cx(styles.propRest, remainder === "hatched" && styles.propHatched)} /> : null}
    </div>
  );
}

export interface ChartLegendItem {
  label: ReactNode;
  color: string;
  /** Hatched swatch — for "locked" / "no access". */
  hatched?: boolean;
}

export interface ChartLegendProps extends HTMLAttributes<HTMLUListElement> {
  items: ChartLegendItem[];
  /** `dot` (7px circle) for compact keys, `square` for chart series. */
  swatch?: "dot" | "square";
}

/** Inline legend: swatch + label, wrapping. */
export function ChartLegend({ items, swatch = "dot", className, ...rest }: ChartLegendProps) {
  return (
    <ul className={cx(styles.legend, className)} {...rest}>
      {items.map((it, i) => (
        <li key={i} className={styles.legendItem}>
          <span
            className={cx(styles.swatch, swatch === "square" && styles.swatchSquare, it.hatched && styles.swatchHatched)}
            style={it.hatched ? undefined : { background: it.color }}
            aria-hidden="true"
          />
          {it.label}
        </li>
      ))}
    </ul>
  );
}
