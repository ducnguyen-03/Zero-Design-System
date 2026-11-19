import type { HTMLAttributes, ReactNode } from "react";
import styles from "./Badge.module.css";

/** Figma Variant axis, shared by Badge and StatusBadge. */
export type BadgeVariant =
  | "primary"
  | "inverted"
  | "secondary"
  | "success"
  | "danger"
  | "warning"
  | "neutral";

/** Figma Style axis: default (4px soft corners), rounded (pill) or outlined (pill + 1px border). */
export type BadgeAppearance = "default" | "rounded" | "outlined";

const cx = (...parts: Array<string | false | undefined>) =>
  parts.filter(Boolean).join(" ");

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  appearance?: BadgeAppearance;
  /** Icon before the label (Figma Icon=Prefix). */
  startIcon?: ReactNode;
  /** Icon after the label (Figma Icon=Suffix). */
  endIcon?: ReactNode;
  children: ReactNode;
}

/** Tinted, uppercase label for metadata — people, project titles, counts. */
export function Badge({
  variant = "primary",
  appearance = "default",
  startIcon,
  endIcon,
  children,
  className,
  ...rest
}: BadgeProps) {
  return (
    <span
      className={cx(styles.badge, styles[variant], styles[appearance], className)}
      {...rest}
    >
      {startIcon != null ? (
        <span className={styles.icon} aria-hidden="true">
          {startIcon}
        </span>
      ) : null}
      <span className={styles.label}>{children}</span>
      {endIcon != null ? (
        <span className={styles.icon} aria-hidden="true">
          {endIcon}
        </span>
      ) : null}
    </span>
  );
}

export interface StatusBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Workflow status colour (Figma "Status Badge" Variant). */
  variant?: BadgeVariant;
  children: ReactNode;
}

/** Workflow status label — e.g. Ready for review, Approved, Rejected. Soft 4px corners, no icon. */
export function StatusBadge({
  variant = "primary",
  children,
  className,
  ...rest
}: StatusBadgeProps) {
  return (
    <span className={cx(styles.badge, styles[variant], styles.default, className)} {...rest}>
      <span className={styles.label}>{children}</span>
    </span>
  );
}

/** Figma "Badge v1.1 / numeric": Centered (neutral) · Green · Red. */
export type CountBadgeTone = "neutral" | "success" | "danger";

export interface CountBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: CountBadgeTone;
  /** Stretch to the container width (Figma draws it as a 148px table-cell badge). */
  block?: boolean;
  children: ReactNode;
}

/** Numeric value badge used in tables (scores, fold-changes, counts). */
export function CountBadge({
  tone = "neutral",
  block = false,
  children,
  className,
  ...rest
}: CountBadgeProps) {
  return (
    <span
      className={cx(styles.count, styles[`count-${tone}`], block && styles.block, className)}
      {...rest}
    >
      {children}
    </span>
  );
}
