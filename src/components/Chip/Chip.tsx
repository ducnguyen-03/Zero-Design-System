import type { HTMLAttributes, ReactNode } from "react";
import { X } from "lucide-react";
import styles from "./Chip.module.css";

/** Optional tinted palette. Omit for the Figma neutral chip (grey-30 fill / off-black label). */
export type ChipColor =
  | "blue"
  | "green"
  | "grey"
  | "violet"
  | "purple"
  | "magenta"
  | "red"
  | "orange";
/** Figma Size: Small 24px · Medium 28px · Large 32px. */
export type ChipSize = "sm" | "md" | "lg";
/** Figma Type: Fill (tinted background) or Outline (1px border, transparent). */
export type ChipVariant = "fill" | "outline";
/** Figma Border: Rounded (pill) or Soft (6px corners). */
export type ChipRadius = "rounded" | "soft";

export interface ChipProps extends Omit<HTMLAttributes<HTMLSpanElement>, "color"> {
  variant?: ChipVariant;
  size?: ChipSize;
  /** Corner shape. Defaults to "rounded" (Figma default). */
  radius?: ChipRadius;
  /**
   * @deprecated Use `radius`. Kept for backward compatibility:
   * `pill` → radius "rounded", `pill={false}` → radius "soft". Ignored when `radius` is set.
   */
  pill?: boolean;
  /** Tinted colour pair. Omit for the neutral Figma chip. */
  color?: ChipColor;
  /** Leading icon / thumbnail (Figma Icon=True). Sized 16/20/24 by chip size. */
  icon?: ReactNode;
  /** Show the clear (×) button and fire onRemove when it is pressed (Figma Clearable=True). */
  onRemove?: () => void;
  /** Accessible label for the clear button. Defaults to "Remove <label>" when children is a string. */
  removeLabel?: string;
  children: ReactNode;
}

const cx = (...parts: Array<string | false | undefined>) =>
  parts.filter(Boolean).join(" ");

export function Chip({
  variant = "fill",
  size = "md",
  radius,
  pill,
  color,
  icon,
  onRemove,
  removeLabel,
  children,
  className,
  ...rest
}: ChipProps) {
  const shape: ChipRadius = radius ?? (pill === false ? "soft" : "rounded");
  const clearLabel =
    removeLabel ?? (typeof children === "string" ? `Remove ${children}` : "Remove");

  return (
    <span
      className={cx(
        styles.chip,
        styles[variant],
        styles[size],
        styles[shape],
        color && styles[color],
        icon != null && styles.hasIcon,
        onRemove && styles.hasRemove,
        className,
      )}
      {...rest}
    >
      {icon != null ? (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span className={styles.label}>{children}</span>
      {onRemove ? (
        <button
          type="button"
          className={styles.remove}
          aria-label={clearLabel}
          onClick={onRemove}
        >
          <X aria-hidden="true" />
        </button>
      ) : null}
    </span>
  );
}
