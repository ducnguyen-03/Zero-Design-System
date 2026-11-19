import type { HTMLAttributes, ReactNode } from "react";
import { Info, X } from "lucide-react";
import { Button } from "../Button/Button";
import styles from "./Toast.module.css";

export type ToastVariant = "standard" | "inline";
export type ToastColor = "info" | "neutral" | "success" | "danger" | "warning";

export interface ToastAction {
  label: ReactNode;
  onClick: () => void;
}

export interface ToastProps extends Omit<HTMLAttributes<HTMLDivElement>, "title" | "color"> {
  /** `standard` = 390px floating card, `inline` = full-width strip (Figma `Variant`). */
  variant?: ToastVariant;
  /** Status colour (Figma `Color`). */
  color?: ToastColor;
  /** Medium 14px heading above the description. */
  title?: ReactNode;
  /** Message — 12px under the title (14px when there is no title). */
  children?: ReactNode;
  /** Main action — an underlined link under the message. */
  action?: ToastAction;
  /** Second, quieter action after a "·" (e.g. "Learn more"). */
  secondaryAction?: ToastAction;
  /** When provided, a close button is shown and calls this. */
  onClose?: () => void;
  /** Accessible label for the close button. */
  closeLabel?: string;
  /** Override the default icon (Lucide `Info` in the status colour). */
  icon?: ReactNode;
}

const cx = (...parts: Array<string | false | undefined>) =>
  parts.filter(Boolean).join(" ");

/**
 * Tinted, bordered notification: icon on a white tile, title over a short description.
 * Danger / warning announce
 * assertively (`role="alert"`); the rest politely (`role="status"`).
 */
export function Toast({
  variant = "standard",
  color = "neutral",
  title,
  children,
  action,
  secondaryAction,
  onClose,
  closeLabel = "Dismiss notification",
  icon,
  className,
  ...rest
}: ToastProps) {
  const assertive = color === "danger" || color === "warning";
  return (
    <div
      role={assertive ? "alert" : "status"}
      aria-live={assertive ? "assertive" : "polite"}
      className={cx(styles.toast, styles[variant], styles[color], title ? styles.titled : undefined, className)}
      {...rest}
    >
      <span className={styles.icon} aria-hidden="true">
        {icon ?? <Info />}
      </span>
      <div className={styles.body} data-toast-body="">
        {title ? <p className={styles.title}>{title}</p> : null}
        {children ? <p className={styles.message}>{children}</p> : null}
        {action || secondaryAction ? (
          <div className={styles.actions}>
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
          </div>
        ) : null}
      </div>
      {onClose ? (
        <button type="button" className={styles.close} aria-label={closeLabel} onClick={onClose}>
          <X aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}
