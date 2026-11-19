import { forwardRef, useCallback, useEffect, useId, useRef } from "react";
import type { InputHTMLAttributes, ReactNode, Ref } from "react";
import { Check, Minus } from "lucide-react";
import styles from "./Checkbox.module.css";

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  label?: ReactNode;
  /** Figma `Intermediate=True` — mixed state (e.g. a "select all" parent). Sets the native
   *  `indeterminate` flag so assistive tech announces "mixed". */
  indeterminate?: boolean;
  /** Figma `State=Error` — red border; also sets `aria-invalid`. */
  error?: boolean;
}

const cx = (...parts: Array<string | false | undefined>) =>
  parts.filter(Boolean).join(" ");

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") ref(value);
  else if (ref) (ref as { current: T | null }).current = value;
}

/** Bare control (box + optional inline label). */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox(
    { label, indeterminate = false, error = false, disabled, id, className, ...rest },
    ref,
  ) {
    const autoId = useId();
    const inputId = id ?? autoId;
    const innerRef = useRef<HTMLInputElement | null>(null);
    const setRef = useCallback(
      (node: HTMLInputElement | null) => {
        innerRef.current = node;
        assignRef(ref, node);
      },
      [ref],
    );

    useEffect(() => {
      if (innerRef.current) innerRef.current.indeterminate = indeterminate;
    }, [indeterminate]);

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
            ref={setRef}
            id={inputId}
            type="checkbox"
            disabled={disabled}
            aria-invalid={error || undefined}
            className={styles.input}
            {...rest}
          />
          <span className={styles.box} aria-hidden="true">
            <Check className={styles.tick} size={12} strokeWidth={3.5} />
            <Minus className={styles.dash} size={12} strokeWidth={3.5} />
          </span>
        </span>
        {label != null ? <span className={styles.label}>{label}</span> : null}
      </label>
    );
  },
);

export type CheckboxRowSize = "sm" | "md" | "lg";

export interface CheckboxRowProps extends Omit<CheckboxProps, "label"> {
  /** Row text. */
  label: ReactNode;
  /** Figma `Badge=True` — trailing count/badge (e.g. `1,234`). */
  count?: ReactNode;
  /** Figma `Icon/Shape=True` — trailing icon / shape indicator. */
  icon?: ReactNode;
  /** Figma `Size`: Small → `sm` (tight, top-aligned), default → `md`, Large → `lg`. */
  size?: CheckboxRowSize;
}

/** Full-width filter row: checkbox + label, with an optional trailing count badge or icon. */
export const CheckboxRow = forwardRef<HTMLInputElement, CheckboxRowProps>(
  function CheckboxRow(
    { label, count, icon, size = "md", className, disabled, ...rest },
    ref,
  ) {
    return (
      <div
        className={cx(
          styles.row,
          styles[`row-${size}`],
          disabled && styles.rowDisabled,
          className,
        )}
      >
        <Checkbox
          ref={ref}
          label={label}
          disabled={disabled}
          className={styles.rowItem}
          {...rest}
        />
        {count != null ? <span className={styles.badge}>{count}</span> : null}
        {icon != null ? (
          <span className={styles.icon} aria-hidden="true">
            {icon}
          </span>
        ) : null}
      </div>
    );
  },
);
