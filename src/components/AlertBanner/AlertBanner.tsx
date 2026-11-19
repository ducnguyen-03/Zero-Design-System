import type { HTMLAttributes, ReactNode } from "react";
import { Info, X } from "lucide-react";
import { Button } from "../Button/Button";
import styles from "./AlertBanner.module.css";

export type AlertBannerVariant = "inline" | "standard";
export type AlertBannerColor = "info" | "success" | "warning" | "danger" | "neutral";

export interface AlertBannerAction {
  label: ReactNode;
  onClick: () => void;
}

export interface AlertBannerProps extends Omit<HTMLAttributes<HTMLDivElement>, "title" | "color"> {
  /** `inline` = full-width banner, `standard` = 390px card (Figma `Variant`). */
  variant?: AlertBannerVariant;
  /** Status colour (Figma `Color`). */
  color?: AlertBannerColor;
  /** Medium 14px heading, above the description. */
  title?: ReactNode;
  /** Description — 12px, under the title. */
  children?: ReactNode;
  /** Main action — an underlined link under the description. */
  action?: AlertBannerAction;
  /** Second, quieter action after a "·" (e.g. "Learn more"). */
  secondaryAction?: AlertBannerAction;
  /** When provided, a dismiss (x) button is shown. */
  onDismiss?: () => void;
  dismissLabel?: string;
  /** Standard only: mono caption on the action row (e.g. "2h ago"). */
  timestamp?: ReactNode;
  /** Override the default icon (Lucide `Info` in the status colour). */
  icon?: ReactNode;
}

const cx = (...parts: Array<string | false | undefined>) =>
  parts.filter(Boolean).join(" ");

/**
 * Status banner: a tinted, bordered row with the icon on a white tile, then a title
 * over a short description.
 * Inline spans the container; Standard is a 390px card. Danger / warning use `role="alert"`.
 */
export function AlertBanner({
  variant = "inline",
  color = "info",
  title,
  children,
  action,
  secondaryAction,
  onDismiss,
  dismissLabel = "Dismiss alert",
  timestamp,
  icon,
  className,
  ...rest
}: AlertBannerProps) {
  const assertive = color === "danger" || color === "warning";
  const actionEl =
    action || secondaryAction ? (
      <span className={styles.actions}>
        {action ? (
          <Button size="sm" variant="text" className={styles.action} onClick={action.onClick}>
            {action.label}
          </Button>
        ) : null}
        {action && secondaryAction ? (
          <span className={styles.dot} aria-hidden="true">
            ·
          </span>
        ) : null}
        {secondaryAction ? (
          <Button size="sm" variant="text" className={`${styles.action} ${styles.secondary}`} onClick={secondaryAction.onClick}>
            {secondaryAction.label}
          </Button>
        ) : null}
      </span>
    ) : null;
  const stamp = variant === "standard" ? timestamp : null;
  const footer = actionEl || stamp;

  return (
    <div
      role={assertive ? "alert" : "status"}
      className={cx(styles.banner, styles[variant], styles[color], className)}
      {...rest}
    >
      <span className={styles.icon} aria-hidden="true">
        {icon ?? <Info />}
      </span>
      <div className={styles.content}>
        {title ? <p className={styles.title}>{title}</p> : null}
        {children ? <p className={styles.body}>{children}</p> : null}
        {footer ? (
          <div className={styles.footer}>
            {actionEl}
            {stamp ? <span className={styles.timestamp}>{stamp}</span> : null}
          </div>
        ) : null}
      </div>
      {onDismiss ? (
        <button type="button" className={styles.dismiss} aria-label={dismissLabel} onClick={onDismiss}>
          <X aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}
