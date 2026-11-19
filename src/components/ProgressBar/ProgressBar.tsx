import { useId } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import styles from "./ProgressBar.module.css";

/** Figma `Variant=Defaul` (green) / `Variant=Info` (blue, with status dot). */
export type ProgressBarTone = "default" | "info";
/** `card` renders the dark Figma container; `none` renders just the bar + header. */
export type ProgressSurface = "card" | "none";

interface ProgressCommon {
  /** Current value, 0..max. Ignored when `indeterminate`. */
  value?: number;
  max?: number;
  /** Uppercase caption above the bar. Also used as the accessible name. */
  label?: ReactNode;
  /** Accessible name when there is no visible `label`. */
  "aria-label"?: string;
  /** Show the percentage readout. */
  showValue?: boolean;
  /** Unknown duration: animated, no `aria-valuenow`. */
  indeterminate?: boolean;
  surface?: ProgressSurface;
  className?: string;
}

export interface ProgressBarProps
  extends ProgressCommon,
    Omit<HTMLAttributes<HTMLDivElement>, "aria-label"> {
  tone?: ProgressBarTone;
  /** Info tone only: show the small status dot before the label. */
  statusDot?: boolean;
}

export interface CircularProgressProps
  extends ProgressCommon,
    Omit<HTMLAttributes<HTMLDivElement>, "aria-label"> {
  /** Ring diameter in px (Figma: 80). */
  size?: number;
  /** Ring stroke in px (Figma: 5). */
  thickness?: number;
}

const cx = (...parts: Array<string | false | undefined>) =>
  parts.filter(Boolean).join(" ");

const pct = (value: number, max: number) =>
  max <= 0 ? 0 : Math.min(100, Math.max(0, (value / max) * 100));

function a11y(
  labelId: string | undefined,
  ariaLabel: string | undefined,
  value: number,
  max: number,
  indeterminate: boolean,
) {
  return {
    role: "progressbar" as const,
    "aria-labelledby": labelId,
    "aria-label": labelId ? undefined : ariaLabel,
    "aria-valuemin": 0,
    "aria-valuemax": max,
    "aria-valuenow": indeterminate ? undefined : Math.min(max, Math.max(0, value)),
    "aria-valuetext": indeterminate ? "Loading" : `${Math.round(pct(value, max))}%`,
    "aria-busy": indeterminate || undefined,
  };
}

/** Linear progress bar (Figma Progress Bar `Variant=Defaul | Info`). */
export function ProgressBar({
  value = 0,
  max = 100,
  label,
  "aria-label": ariaLabel,
  showValue = true,
  indeterminate = false,
  surface = "card",
  tone = "default",
  statusDot = tone === "info",
  className,
  ...rest
}: ProgressBarProps) {
  const id = useId();
  const labelId = label ? `${id}-label` : undefined;
  const p = pct(value, max);
  return (
    <div
      className={cx(styles.root, surface === "card" && styles.card, styles[tone], className)}
      {...rest}
    >
      {label || (showValue && !indeterminate) ? (
        <div className={styles.header}>
          <span className={styles.labelRow}>
            {statusDot && tone === "info" ? <span className={styles.dot} aria-hidden="true" /> : null}
            {label ? (
              <span id={labelId} className={styles.label}>
                {label}
              </span>
            ) : null}
          </span>
          {showValue && !indeterminate ? (
            <span className={styles.value} aria-hidden="true">
              {Math.round(p)}%
            </span>
          ) : null}
        </div>
      ) : null}
      <div
        className={cx(styles.track, indeterminate && styles.indeterminate)}
        {...a11y(labelId, ariaLabel, value, max, indeterminate)}
      >
        <div className={styles.fill} style={indeterminate ? undefined : { width: `${p}%` }} />
      </div>
    </div>
  );
}

/** Circular stat ring (Figma Progress Bar `Variant=Circular`). */
export function CircularProgress({
  value = 0,
  max = 100,
  label,
  "aria-label": ariaLabel,
  showValue = true,
  indeterminate = false,
  surface = "card",
  size = 80,
  thickness = 5,
  className,
  style,
  ...rest
}: CircularProgressProps) {
  const id = useId();
  const labelId = label ? `${id}-label` : undefined;
  const p = pct(value, max);
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const dash = indeterminate ? c * 0.25 : (p / 100) * c;
  return (
    <div
      className={cx(styles.root, styles.circularRoot, surface === "card" && styles.card, className)}
      style={style}
      {...rest}
    >
      {label ? (
        <span id={labelId} className={cx(styles.label, styles.circularLabel)}>
          {label}
        </span>
      ) : null}
      <div
        className={cx(styles.ring, indeterminate && styles.spinning)}
        style={{ width: size, height: size }}
        {...a11y(labelId, ariaLabel, value, max, indeterminate)}
      >
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
          <circle className={styles.ringTrack} cx={size / 2} cy={size / 2} r={r} strokeWidth={thickness} />
          <circle
            className={styles.ringBar}
            cx={size / 2}
            cy={size / 2}
            r={r}
            strokeWidth={thickness}
            strokeDasharray={`${dash} ${c}`}
          />
        </svg>
        {showValue && !indeterminate ? (
          <span className={styles.ringValue} aria-hidden="true">
            {Math.round(p)}%
          </span>
        ) : null}
      </div>
    </div>
  );
}
