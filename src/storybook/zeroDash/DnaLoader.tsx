import type { CSSProperties } from "react";
import styles from "./DnaLoader.module.css";

const DOTS: Array<[number, string]> = [
  [0, "0s"], [0, "-0.75s"], [30, "-1.3s"], [30, "-0.55s"], [60, "-1.1s"],
  [60, "-0.35s"], [90, "-0.9s"], [90, "-0.15s"], [120, "-0.7s"], [120, "0.05s"],
];
const RUNGS: Array<[number, string]> = [[5, "0s"], [35, "-1.3s"], [65, "-1.1s"], [95, "-0.9s"], [125, "-0.75s"]];

export interface DnaLoaderProps {
  /** Status line under the helix ("Loading cases…"). Omit for the bare helix. */
  label?: string;
  /** Scale of the 128×70 helix. */
  scale?: number;
  /** Caption size: `md` = 14px tertiary (page loads), `sm` = 12px (inline "Recalculating"). */
  size?: "md" | "sm";
  className?: string;
}

/**
 * ZeroDash standard loading indicator: the SAVvy DNA helix (10 dots spinning, 5 rungs flexing)
 * followed by one status line. Every ZeroDash page uses this; don't invent other spinners.
 */
export function DnaLoader({ label, scale = 1, size = "md", className }: DnaLoaderProps) {
  return (
    <div role="status" className={[styles.root, className].filter(Boolean).join(" ")}>
      <div className={styles.frame} style={{ width: 128 * scale, height: 70 * scale }}>
        <div className={styles.helix} style={{ transform: `scale(${scale})` }} aria-hidden="true">
          {DOTS.map(([left, delay], i) => (
            <span key={`d${i}`} className={styles.dot} style={{ left, animationDelay: delay } as CSSProperties} />
          ))}
          {RUNGS.map(([left, delay], i) => (
            <span key={`r${i}`} className={styles.rung} style={{ left, animationDelay: delay } as CSSProperties} />
          ))}
        </div>
      </div>
      {label ? <span className={size === "sm" ? styles.labelSm : styles.label}>{label}</span> : null}
    </div>
  );
}
