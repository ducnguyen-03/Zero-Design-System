import { forwardRef, useId, useState } from "react";
import type { ChangeEvent, TextareaHTMLAttributes } from "react";
import { CircleAlert, CircleCheck } from "lucide-react";
import styles from "./Textarea.module.css";

/** Figma `input` set, Size = L (area). */
export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  /** Helper text, rendered between the label and the field (Figma layout). */
  helpText?: string;
  /** Error message below the field; presence flips the border to red. */
  errorText?: string;
  required?: boolean;
  /** Trailing status indicator (top-right): check when valid, alert on error. */
  status?: boolean;
  /**
   * Soft character limit. Shows the remaining count (Figma "-25") right-aligned
   * below the field; going over the limit flips the field into its error style.
   */
  characterLimit?: number;
}

const cx = (...parts: Array<string | false | undefined>) =>
  parts.filter(Boolean).join(" ");

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    {
      label,
      helpText,
      errorText,
      required,
      status = false,
      characterLimit,
      disabled,
      id,
      className,
      value,
      defaultValue,
      onChange,
      "aria-describedby": describedByProp,
      ...rest
    },
    ref,
  ) {
    const autoId = useId();
    const fieldId = id ?? autoId;
    const helpId = `${fieldId}-help`;
    const errorId = `${fieldId}-error`;
    const countId = `${fieldId}-count`;

    const [innerLength, setInnerLength] = useState(
      String(defaultValue ?? "").length,
    );
    const length = value !== undefined ? String(value).length : innerLength;
    const remaining =
      characterLimit !== undefined ? characterLimit - length : undefined;
    const overLimit = remaining !== undefined && remaining < 0;
    const hasError = Boolean(errorText) || overLimit;

    const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
      setInnerLength(e.target.value.length);
      onChange?.(e);
    };

    const describedBy =
      [
        describedByProp,
        helpText ? helpId : null,
        errorText ? errorId : null,
        remaining !== undefined ? countId : null,
      ]
        .filter(Boolean)
        .join(" ") || undefined;

    return (
      <div className={cx(styles.field, className)}>
        {label ? (
          <label className={styles.label} htmlFor={fieldId}>
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
            hasError && styles.error,
            disabled && styles.disabled,
          )}
        >
          <textarea
            ref={ref}
            id={fieldId}
            className={styles.textarea}
            disabled={disabled}
            required={required}
            aria-invalid={hasError || undefined}
            aria-describedby={describedBy}
            value={value}
            defaultValue={defaultValue}
            onChange={handleChange}
            {...rest}
          />
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
        {errorText || remaining !== undefined ? (
          <div className={styles.bottom}>
            <span id={errorId} className={styles.errorText}>
              {errorText}
            </span>
            {remaining !== undefined ? (
              <span
                id={countId}
                className={cx(styles.count, overLimit && styles.countOver)}
                aria-live="polite"
              >
                {remaining}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  },
);
