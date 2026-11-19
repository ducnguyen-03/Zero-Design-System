import { forwardRef } from "react";
import type { ButtonHTMLAttributes, MouseEvent, ReactNode } from "react";
import styles from "./Button.module.css";

/**
 * `warning` is a deprecated alias of `destructive` (Figma "Destructive Outline"),
 * kept so existing usages keep working.
 */
export type ButtonVariant = "bold" | "outline" | "subtle" | "text" | "destructive" | "warning";
export type ButtonSize = "md" | "sm";
/** @deprecated Buttons have one corner per size (sm 8px, md 12px); `radius` is ignored. */
export type ButtonRadius = "rounded" | "soft";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style. `bold` (yellow), `outline` (green primary), `subtle` (neutral),
   *  `text` (link-like), `destructive` (red outline). `warning` = deprecated alias of `destructive`. */
  variant?: ButtonVariant;
  /** `md` = 48px, `sm` = 32px. */
  size?: ButtonSize;
  /**
   * @deprecated Ignored — corners follow `size`: sm 8px, md 12px.
   * Kept so existing `radius` usages still type-check.
   */
  radius?: ButtonRadius;
  /** Shows the loading indicator, sets `aria-busy` and blocks activation. The label
   *  stays in the DOM (visually hidden) so the button keeps its width. */
  loading?: boolean;
  /** Icon rendered before the label (object identity: login, settings, trash…). */
  startIcon?: ReactNode;
  /** Icon rendered after the label (direction/destination: arrow-right, external…). */
  endIcon?: ReactNode;
  children?: ReactNode;
}

const cx = (...parts: Array<string | false | undefined>) => parts.filter(Boolean).join(" ");

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "bold",
    size = "md",
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    radius: _radius,
    loading = false,
    startIcon,
    endIcon,
    children,
    className,
    disabled,
    onClick,
    type = "button",
    ...rest
  },
  ref,
) {
  const variantClass = variant === "warning" ? styles.destructive : styles[variant];
  const interactive = !disabled && !loading;

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (loading) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      aria-busy={loading || undefined}
      aria-disabled={loading || undefined}
      onClick={handleClick}
      className={cx(
        styles.btn,
        variantClass,
        styles[size],
        interactive && styles.interactive,
        loading && styles.loading,
        className,
      )}
      {...rest}
    >
      {startIcon ? (
        <span className={styles.icon} aria-hidden="true">
          {startIcon}
        </span>
      ) : null}
      {children != null ? <span className={styles.label}>{children}</span> : null}
      {endIcon ? (
        <span className={styles.icon} aria-hidden="true">
          {endIcon}
        </span>
      ) : null}
      {loading ? (
        <span className={styles.loader} aria-hidden="true">
          <span className={styles.dot} />
          <span className={styles.dot} />
          <span className={styles.dot} />
        </span>
      ) : null}
    </button>
  );
});
