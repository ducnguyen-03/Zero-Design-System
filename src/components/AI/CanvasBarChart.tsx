import { useId } from "react";
import type { CSSProperties, HTMLAttributes } from "react";
import styles from "./CanvasBarChart.module.css";

const cx = (...parts: Array<string | false | undefined>) => parts.filter(Boolean).join(" ");

export interface CanvasBarDatum {
  label: string;
  value: number;
  /** Override the bar colour (any CSS colour). Defaults alternate violet-100 / magenta-100, as in Figma. */
  color?: string;
}

export interface CanvasBarChartProps extends Omit<HTMLAttributes<HTMLElement>, "onSelect"> {
  data: CanvasBarDatum[];
  /** Describes the chart for screen readers, e.g. "Patients with an alteration, by gene". */
  label: string;
  /** Chart height in px, labels included. Default 200 (Figma). */
  height?: number;
  /** Makes each bar a button — "Click any bar to add it as a filter". */
  onSelect?: (datum: CanvasBarDatum) => void;
  /** Labels of bars currently used as filters (shown pressed). */
  selected?: string[];
  /** Formats the value in tooltips and the data table. */
  format?: (value: number) => string;
}

const PALETTE = ["var(--insight-color-violet-100)", "var(--insight-color-magenta-100)"];

/**
 * Ranked bar chart for the canvas (Figma "AML diagnoses" chart): 4px-topped bars,
 * 10px Roboto Mono gene labels, value on hover / focus. A visually hidden table
 * carries the numbers for assistive tech.
 */
export function CanvasBarChart({
  data,
  label,
  height = 200,
  onSelect,
  selected = [],
  format = (v) => v.toLocaleString(),
  className,
  style,
  ...rest
}: CanvasBarChartProps) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const tableId = useId();
  return (
    <figure
      className={cx(styles.chart, onSelect && styles.interactive, className)}
      style={{ ...style, "--chart-height": `${height}px` } as CSSProperties}
      {...rest}
    >
      <div className={styles.plot} role={onSelect ? "group" : "img"} aria-label={label} aria-describedby={tableId}>
        {data.map((d, i) => {
          const pct = (d.value / max) * 100;
          const barStyle = { "--bar-h": `${pct}%`, "--bar-color": d.color ?? PALETTE[i % 2] } as CSSProperties;
          const isSel = selected.includes(d.label);
          const inner = (
            <>
              <span className={styles.track}>
                <span className={styles.value}>{format(d.value)}</span>
                <span className={styles.bar} />
              </span>
              <span className={styles.tick}>{d.label}</span>
            </>
          );
          return onSelect ? (
            <button
              key={d.label}
              type="button"
              className={cx(styles.col, isSel && styles.selected)}
              style={barStyle}
              aria-label={`${d.label}, ${format(d.value)}`}
              aria-pressed={isSel}
              onClick={() => onSelect(d)}
            >
              {inner}
            </button>
          ) : (
            <span key={d.label} className={styles.col} style={barStyle} aria-hidden="true">
              {inner}
            </span>
          );
        })}
      </div>
      <table id={tableId} className={styles.srOnly}>
        <caption>{label}</caption>
        <tbody>
          {data.map((d) => (
            <tr key={d.label}>
              <th scope="row">{d.label}</th>
              <td>{format(d.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
