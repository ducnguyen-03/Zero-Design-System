import type { HTMLAttributes } from "react";
import styles from "./Divider.module.css";

export type DividerOrientation = "horizontal" | "vertical";

export interface DividerProps extends HTMLAttributes<HTMLDivElement> {
  /** Figma Direction. Horizontal fills the width; vertical stretches to the flex row's height. */
  orientation?: DividerOrientation;
  /**
   * Purely visual rule with no semantic meaning — hides it from assistive tech
   * (role="none") instead of announcing a separator.
   */
  decorative?: boolean;
}

/** 1px rule (Figma "Divider", 3412:11305). */
export function Divider({
  orientation = "horizontal",
  decorative = false,
  className,
  ...rest
}: DividerProps) {
  const a11y = decorative
    ? { role: "none" as const }
    : { role: "separator" as const, "aria-orientation": orientation };
  return (
    <div
      className={[styles.divider, styles[orientation], className].filter(Boolean).join(" ")}
      {...a11y}
      {...rest}
    />
  );
}
