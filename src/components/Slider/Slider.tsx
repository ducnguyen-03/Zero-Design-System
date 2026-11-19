import { forwardRef, useCallback, useRef, useState } from "react";
import type {
  CSSProperties,
  HTMLAttributes,
  KeyboardEvent,
  PointerEvent as ReactPointerEvent,
  ReactNode,
} from "react";
import styles from "./Slider.module.css";

export type SliderValue = number | [number, number];
export type SliderSize = "md" | "sm" | "xs";
/** Figma `Slider` axis. `default` (only drawn for Range/sm in Figma) renders like `circle`. */
export type SliderThumb = "square" | "circle" | "squareRail" | "circleRail" | "default";
export type SliderTooltip = "always" | "active" | "never";

export interface SliderProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  /** Controlled value — a number for a single thumb, a `[low, high]` tuple for a range. */
  value?: SliderValue;
  /** Uncontrolled initial value. Pass a tuple to get a range slider. */
  defaultValue?: SliderValue;
  onChange?: (value: SliderValue) => void;
  /** Fires once when a drag / key interaction ends. */
  onChangeEnd?: (value: SliderValue) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Figma `Size`: track + thumb scale. */
  size?: SliderSize;
  /** Figma `Slider` (thumb style). Rail styles draw a thick track with the thumb inset. */
  thumb?: SliderThumb;
  disabled?: boolean;
  /** Show the min / max badges either side of the track. */
  showLimits?: boolean;
  /** Tick marks + labels under the track. `true` = 10 even intervals; or pass explicit values. */
  marks?: boolean | number[];
  /** When the value bubble above each thumb is visible. */
  tooltip?: SliderTooltip;
  /** Formats the thumb bubbles, limit badges and `aria-valuetext`. */
  formatValue?: (value: number) => ReactNode;
  /** Formats mark labels (defaults to the raw number). */
  formatMark?: (value: number) => ReactNode;
  /** Accessible names for the thumbs of a range slider. */
  thumbLabels?: [string, string];
  /** Form field name; renders hidden input(s) (`name`, or `name[0]` / `name[1]` for a range). */
  name?: string;
}

const cx = (...parts: Array<string | false | undefined>) =>
  parts.filter(Boolean).join(" ");

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

function roundToStep(v: number, min: number, step: number) {
  const n = Math.round((v - min) / step) * step + min;
  // avoid 0.30000000000000004-style drift
  const decimals = (String(step).split(".")[1] ?? "").length;
  return Number(n.toFixed(decimals));
}

export const Slider = forwardRef<HTMLDivElement, SliderProps>(function Slider(
  {
    value,
    defaultValue,
    onChange,
    onChangeEnd,
    min = 0,
    max = 100,
    step = 1,
    size = "md",
    thumb = "circle",
    disabled = false,
    showLimits = true,
    marks = true,
    tooltip = "always",
    formatValue = (v) => String(v),
    formatMark = (v) => String(v),
    thumbLabels,
    name,
    className,
    style,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    ...rest
  },
  ref,
) {
  const initial: SliderValue = defaultValue ?? value ?? min;
  const [inner, setInner] = useState<SliderValue>(initial);
  const current = value !== undefined ? value : inner;
  const isRange = Array.isArray(current);
  const values: number[] = isRange ? [...(current as [number, number])] : [current as number];

  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [active, setActive] = useState<number | null>(null);
  const latest = useRef<SliderValue>(current);
  latest.current = current;

  const pct = (v: number) => ((clamp(v, min, max) - min) / (max - min)) * 100;

  const commit = useCallback(
    (index: number, raw: number) => {
      const vals: number[] = Array.isArray(latest.current)
        ? [...latest.current]
        : [latest.current as number];
      let v = clamp(roundToStep(raw, min, step), min, max);
      if (vals.length === 2) {
        v = index === 0 ? Math.min(v, vals[1]) : Math.max(v, vals[0]);
      }
      if (vals[index] === v) return;
      vals[index] = v;
      const next: SliderValue = vals.length === 2 ? [vals[0], vals[1]] : vals[0];
      latest.current = next;
      if (value === undefined) setInner(next);
      onChange?.(next);
    },
    [min, max, step, value, onChange],
  );

  const valueFromClientX = (clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return min;
    const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
    return min + ratio * (max - min);
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (disabled || e.button !== 0) return;
    const raw = valueFromClientX(e.clientX);
    let index = 0;
    if (values.length === 2) {
      const d0 = Math.abs(raw - values[0]);
      const d1 = Math.abs(raw - values[1]);
      index = d1 < d0 || (d1 === d0 && raw > values[1]) ? 1 : 0;
    }
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    setActive(index);
    thumbRefs.current[index]?.focus();
    commit(index, raw);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (active === null) return;
    commit(active, valueFromClientX(e.clientX));
  };

  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (active === null) return;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    setActive(null);
    onChangeEnd?.(latest.current);
  };

  const onThumbKeyDown = (index: number) => (e: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    const v = values[index];
    const big = Math.max(step, (max - min) / 10);
    let next: number | undefined;
    switch (e.key) {
      case "ArrowRight":
      case "ArrowUp":
        next = v + step;
        break;
      case "ArrowLeft":
      case "ArrowDown":
        next = v - step;
        break;
      case "PageUp":
        next = v + big;
        break;
      case "PageDown":
        next = v - big;
        break;
      case "Home":
        next = min;
        break;
      case "End":
        next = max;
        break;
      default:
        return;
    }
    e.preventDefault();
    commit(index, next);
  };

  const onThumbKeyUp = (e: KeyboardEvent<HTMLDivElement>) => {
    if (
      ["ArrowRight", "ArrowUp", "ArrowLeft", "ArrowDown", "PageUp", "PageDown", "Home", "End"].includes(
        e.key,
      )
    ) {
      onChangeEnd?.(latest.current);
    }
  };

  const markValues: number[] = Array.isArray(marks)
    ? marks
    : marks
      ? Array.from({ length: 11 }, (_, i) => roundToStep(min + ((max - min) * i) / 10, min, step))
      : [];

  const fillStart = values.length === 2 ? pct(values[0]) : 0;
  const fillEnd = pct(values[values.length - 1]);
  const isRail = thumb === "squareRail" || thumb === "circleRail";
  const shape = thumb === "square" || thumb === "squareRail" ? "square" : "circle";

  const valueText = (v: number) => {
    const f = formatValue(v);
    return typeof f === "string" || typeof f === "number" ? String(f) : String(v);
  };

  return (
    <div
      ref={ref}
      className={cx(
        styles.root,
        styles[size],
        isRail && styles.rail,
        styles[shape],
        disabled && styles.disabled,
        tooltip === "always" && styles.withTooltip,
        markValues.length > 0 && styles.withMarks,
        className,
      )}
      style={style}
      {...rest}
    >
      {showLimits ? (
        <span className={styles.badge} aria-hidden="true">
          {formatValue(min)}
        </span>
      ) : null}

      <div
        className={styles.area}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <div ref={trackRef} className={styles.track}>
          <div
            className={styles.fill}
            style={{ left: `${fillStart}%`, width: `${fillEnd - fillStart}%` }}
          />
          {values.map((v, i) => {
            const label =
              values.length === 2
                ? (thumbLabels?.[i] ?? (i === 0 ? "Minimum" : "Maximum"))
                : undefined;
            return (
              <div
                key={i}
                ref={(n) => {
                  thumbRefs.current[i] = n;
                }}
                role="slider"
                tabIndex={disabled ? -1 : 0}
                aria-label={
                  label ? (ariaLabel ? `${ariaLabel} ${label.toLowerCase()}` : label) : ariaLabel
                }
                aria-labelledby={label ? undefined : ariaLabelledBy}
                aria-valuemin={values.length === 2 && i === 1 ? values[0] : min}
                aria-valuemax={values.length === 2 && i === 0 ? values[1] : max}
                aria-valuenow={v}
                aria-valuetext={valueText(v)}
                aria-orientation="horizontal"
                aria-disabled={disabled || undefined}
                className={cx(styles.thumb, active === i && styles.dragging)}
                style={{ left: `${pct(v)}%`, zIndex: active === i ? 3 : 2 } as CSSProperties}
                onKeyDown={onThumbKeyDown(i)}
                onKeyUp={onThumbKeyUp}
              >
                {tooltip !== "never" ? (
                  <span className={styles.tooltip} aria-hidden="true">
                    {formatValue(v)}
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>

        {markValues.length > 0 ? (
          <div className={styles.marks} aria-hidden="true">
            {markValues.map((m) => (
              <span key={m} className={styles.mark} style={{ left: `${pct(m)}%` }}>
                <span className={styles.tick} />
                <span className={styles.markLabel}>{formatMark(m)}</span>
              </span>
            ))}
          </div>
        ) : null}
      </div>

      {showLimits ? (
        <span className={styles.badge} aria-hidden="true">
          {formatValue(max)}
        </span>
      ) : null}

      {name
        ? values.map((v, i) => (
            <input
              key={i}
              type="hidden"
              name={values.length === 2 ? `${name}[${i}]` : name}
              value={v}
            />
          ))
        : null}
    </div>
  );
});
