import { forwardRef, useId } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import styles from "./Radio.module.css";

export interface RadioProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  label?: ReactNode;
  /** Figma `State=Error` — red ring; also sets `aria-invalid`. */
  error?: boolean;
}

const cx = (...parts: Array<string | false | undefined>) =>
  parts.filter(Boolean).join(" ");

export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  { label, error = false, disabled, id, className, ...rest },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <label
      className={cx(
        styles.root,
        disabled && styles.disabled,
        error && styles.error,
        className,
      )}
      htmlFor={inputId}
    >
      <span className={styles.control}>
        <input
          ref={ref}
          id={inputId}
          type="radio"
          disabled={disabled}
          aria-invalid={error || undefined}
          className={styles.input}
          {...rest}
        />
        <span className={styles.dot} aria-hidden="true" />
      </span>
      {label != null ? <span>{label}</span> : null}
    </label>
  );
});
