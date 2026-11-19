import type { HTMLAttributes, ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import styles from "./StatTile.module.css";

/**
 * - `tile`    — original landing-page tile (64px grey icon tile + numeral). Default, unchanged.
 * - `change`  — Figma Stats Style 1: label, previous → current value, delta chip.
 * - `icon`    — Figma Stats Style 2: 56px round icon, value, uppercase label.
 * - `summary` — Figma Stats Style 3: label + actions, value, legend breakdown.
 */
export type StatTileAppearance = "tile" | "change" | "icon" | "summary";
/** Figma Variant=default / Success / Danger. */
export type StatTileVariant = "default" | "success" | "danger";
export type StatBreakdownTone = "success" | "danger" | "neutral" | "hatched";

export interface StatBreakdownItem {
  label: ReactNode;
  tone?: StatBreakdownTone;
}

export interface StatTileProps extends HTMLAttributes<HTMLDivElement> {
  appearance?: StatTileAppearance;
  variant?: StatTileVariant;
  /** A lucide icon element. Required visually for `tile`; used by `icon`. */
  icon?: ReactNode;
  /** The headline numeral, e.g. "3,000" or "4M+". */
  value: string;
  label: string;
  /** `change`: the value before the change (struck through). */
  previousValue?: string;
  /** `change`: delta chip text, e.g. "+2" / "-2". Coloured by `variant`. */
  delta?: string;
  /** `change`: extra neutral chip (e.g. an edit count with a pencil icon). */
  annotation?: ReactNode;
  /** `summary`: action icons in the header (close, more…). */
  actions?: ReactNode;
  /** `summary`: legend rows under the value. */
  breakdown?: StatBreakdownItem[];
}

const cx = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(" ");

export function StatTile({
  appearance = "tile",
  variant = "default",
  icon,
  value,
  label,
  previousValue,
  delta,
  annotation,
  actions,
  breakdown,
  className,
  ...rest
}: StatTileProps) {
  if (appearance === "tile") {
    return (
      <div className={cx(styles.tile, className)} {...rest}>
        <div className={styles.iconTile}>{icon}</div>
        <div>
          <div className={styles.num}>{value}</div>
          <div className={styles.lbl}>{label}</div>
        </div>
      </div>
    );
  }

  const tone = variant !== "default" ? styles[variant] : undefined;

  if (appearance === "change") {
    return (
      <div className={cx(styles.stat, styles.change, tone, className)} {...rest}>
        <div className={styles.label}>{label}</div>
        <div className={styles.changeRow}>
          {previousValue !== undefined ? (
            <>
              <span className={styles.srOnly}>Changed from </span>
              <del className={styles.previous}>{previousValue}</del>
              <ArrowRight className={styles.arrow} aria-hidden="true" />
              <span className={styles.srOnly}> to </span>
            </>
          ) : null}
          <span className={cx(styles.value, styles.current)}>{value}</span>
          {delta ? <span className={cx(styles.chip, styles.deltaChip)}>{delta}</span> : null}
          {annotation ? <span className={cx(styles.chip, styles.neutralChip)}>{annotation}</span> : null}
        </div>
      </div>
    );
  }

  if (appearance === "icon") {
    return (
      <div className={cx(styles.stat, styles.iconStat, tone, className)} {...rest}>
        {icon ? (
          <div className={styles.iconCircle} aria-hidden="true">
            {icon}
          </div>
        ) : null}
        <div className={styles.iconText}>
          <div className={styles.value}>{value}</div>
          <div className={cx(styles.label, styles.labelSecondary)}>{label}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={cx(styles.stat, styles.summary, tone, className)} {...rest}>
      <div className={styles.summaryHeader}>
        <div className={styles.label}>{label}</div>
        {actions ? <div className={styles.actions}>{actions}</div> : null}
      </div>
      <div className={cx(styles.value, styles.summaryValue)}>{value}</div>
      {breakdown && breakdown.length > 0 ? (
        <ul className={styles.breakdown}>
          {breakdown.map((b, i) => (
            <li key={i} className={styles.breakdownItem}>
              <span
                className={cx(styles.swatch, styles[`swatch_${b.tone ?? "neutral"}`])}
                aria-hidden="true"
              />
              <span className={styles.label}>{b.label}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
