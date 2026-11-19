import { forwardRef } from "react";
import type { LucideIcon, LucideProps } from "lucide-react";
import styles from "./Icon.module.css";

export type IconSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
export type IconTone =
  | "inherit"
  | "primary"
  | "secondary"
  | "tertiary"
  | "brand"
  | "success"
  | "danger"
  | "warning"
  | "info"
  | "on-dark";

export interface IconProps extends Omit<LucideProps, "size" | "ref"> {
  /** A Lucide icon component, e.g. `import { House } from "lucide-react"` → `icon={House}`. */
  icon: LucideIcon;
  /** Token size: xs 12 · sm 16 · md 20 · lg 24 · xl 32 · 2xl 40 (px). A number sets an explicit pixel size. */
  size?: IconSize | number;
  /** Colour from the semantic palette. `inherit` (default) follows the surrounding text colour. */
  tone?: IconTone;
  /** Accessible name. Give one only when the icon carries meaning on its own;
   *  without it the icon is decorative and hidden from assistive tech. */
  label?: string;
}

const cx = (...parts: Array<string | false | undefined>) => parts.filter(Boolean).join(" ");

/**
 * Renders a Lucide icon at a design-system size and tone.
 * Stroke width comes from `--insight-icon-stroke` (global rule on `svg.lucide`) unless `strokeWidth` is passed.
 */
export const Icon = forwardRef<SVGSVGElement, IconProps>(function Icon(
  { icon: LucideGlyph, size = "md", tone = "inherit", label, className, style, ...rest },
  ref,
) {
  const numeric = typeof size === "number";
  return (
    <LucideGlyph
      ref={ref}
      className={cx(
        styles.icon,
        !numeric && styles[size === "2xl" ? "xxl" : size],
        styles[`tone-${tone}`],
        className,
      )}
      style={{
        ...(numeric ? { width: size, height: size } : null),
        // An explicit strokeWidth must win over the global `:where(svg.lucide)` stroke token.
        ...(rest.strokeWidth !== undefined ? { strokeWidth: rest.strokeWidth } : null),
        ...style,
      }}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
      {...rest}
    />
  );
});
