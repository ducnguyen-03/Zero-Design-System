import { forwardRef, useId } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { CircleAlert, CircleCheck, Link2 } from "lucide-react";
import styles from "./Input.module.css";

/** Figma `Size`: S (40px) → "sm", M (48px) → "md". Size L (area) is `Textarea`. */
export type InputSize = "sm" | "md";

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  /** Helper text, rendered between the label and the field (Figma layout). */
  helpText?: string;
  /** Error message below the field; presence flips the border to red. */
  errorText?: string;
  required?: boolean;
  /** Field height. `sm` = 40px (default), `md` = 48px. */
  size?: InputSize;
  /**
   * Trailing status indicator (Figma `Status=True`): a green check when valid,
   * a red alert when `errorText` is set.
   */
  status?: boolean;
  /** Adornment before the input. `type="url"` defaults this to a link icon. */
  startIcon?: ReactNode;
  /** Adornment after the input (rendered before the status indicator). */
  endIcon?: ReactNode;
}

const cx = (...parts: Array<string | false | undefined>) =>
  parts.filter(Boolean).join(" ");

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    helpText,
    errorText,
    required,
    size = "sm",
    status = false,
    startIcon,
    endIcon,
    disabled,
    id,
    className,
    type,
    "aria-describedby": describedByProp,
    ...rest
  },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const helpId = `${inputId}-help`;
  const errorId = `${inputId}-error`;
  const hasError = Boolean(errorText);
  const isLink = type === "url";
  const lead = startIcon ?? (isLink ? <Link2 /> : null);

  const describedBy =
    [describedByProp, helpText ? helpId : null, hasError ? errorId : null]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <div className={cx(styles.field, className)}>
      {label ? (
        <label className={styles.label} htmlFor={inputId}>
          {label}
          {required ? (
            <span className={styles.required} aria-hidden="true">
              {" "}
              *
            </span>
          ) : null}
        </label>
      ) : null}
      {helpText ? (
        <span id={helpId} className={styles.help}>
          {helpText}
        </span>
      ) : null}
      <div
        className={cx(
          styles.control,
          size === "md" && styles.md,
          lead != null && styles.hasLead,
          hasError && styles.error,
          disabled && styles.disabled,
        )}
      >
        {lead != null ? (
          <span className={styles.adornment} aria-hidden="true">
            {lead}
          </span>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          type={type}
          className={styles.input}
          disabled={disabled}
          aria-invalid={hasError || undefined}
          aria-describedby={describedBy}
          required={required}
          {...rest}
        />
        {endIcon ? (
          <span
            className={cx(styles.adornment, hasError && styles.errorTint)}
            aria-hidden="true"
          >
            {endIcon}
          </span>
        ) : null}
        {status ? (
          <span
            className={cx(
              styles.status,
              hasError ? styles.statusError : styles.statusSuccess,
            )}
            role="img"
            aria-label={hasError ? "Invalid" : "Valid"}
          >
            {hasError ? <CircleAlert /> : <CircleCheck />}
          </span>
        ) : null}
      </div>
      {hasError ? (
        <span id={errorId} className={styles.errorText}>
          {errorText}
        </span>
      ) : null}
    </div>
  );
});
