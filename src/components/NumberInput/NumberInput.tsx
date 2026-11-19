import { forwardRef, useEffect, useId, useState } from "react";
import type {
  ChangeEvent,
  FocusEvent,
  InputHTMLAttributes,
  KeyboardEvent,
  ReactNode,
} from "react";
import { Minus, Plus } from "lucide-react";
import styles from "./NumberInput.module.css";

export interface NumberInputProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "type" | "value" | "defaultValue" | "onChange" | "prefix" | "size" | "min" | "max" | "step"
  > {
  /** Controlled value. `null` = empty. */
  value?: number | null;
  defaultValue?: number | null;
  onChange?: (value: number | null) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Figma `State=Prefix` — leading adornment (e.g. `$`). Steppers move to the end. */
  prefix?: ReactNode;
  /** Figma `State=Suffix` — trailing adornment. Steppers move to the start. */
  suffix?: ReactNode;
  /** Text above the field (Figma shows a helper paragraph here). */
  label?: ReactNode;
  /** Text below the field. Turns red when `error` is set. */
  helperText?: ReactNode;
  /** Figma `Variant=Error`. */
  error?: boolean;
  /** Figma `Variant=Disabled`. */
  disabled?: boolean;
  decrementLabel?: string;
  incrementLabel?: string;
  /** Width of the whole control (defaults to 320px, the Figma width). */
  width?: number | string;
}

const cx = (...parts: Array<string | false | undefined>) =>
  parts.filter(Boolean).join(" ");

const decimalsOf = (n: number) => (String(n).split(".")[1] ?? "").length;

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  function NumberInput(
    {
      value,
      defaultValue = null,
      onChange,
      min,
      max,
      step = 1,
      prefix,
      suffix,
      label,
      helperText,
      error = false,
      disabled = false,
      readOnly,
      decrementLabel = "Decrease",
      incrementLabel = "Increase",
      width = 320,
      id,
      className,
      onBlur,
      onKeyDown,
      "aria-describedby": describedBy,
      ...rest
    },
    ref,
  ) {
    const autoId = useId();
    const inputId = id ?? autoId;
    const labelId = `${inputId}-label`;
    const helpId = `${inputId}-help`;

    const [inner, setInner] = useState<number | null>(defaultValue);
    const current = value !== undefined ? value : inner;
    const [text, setText] = useState(current == null ? "" : String(current));

    // Keep the text in sync when the value changes from outside.
    useEffect(() => {
      setText((t) => {
        const parsed = t.trim() === "" ? null : Number(t);
        return parsed === current ? t : current == null ? "" : String(current);
      });
    }, [current]);

    const clampV = (n: number) => {
      let v = n;
      if (min !== undefined) v = Math.max(min, v);
      if (max !== undefined) v = Math.min(max, v);
      return Number(v.toFixed(Math.max(decimalsOf(step), decimalsOf(v))));
    };

    const set = (n: number | null) => {
      const v = n == null ? null : clampV(n);
      if (value === undefined) setInner(v);
      setText(v == null ? "" : String(v));
      if (v !== current) onChange?.(v);
    };

    const stepBy = (dir: 1 | -1, mult = 1) => {
      if (disabled || readOnly) return;
      // From empty, the first step lands on `min` (or 0).
      if (current == null) set(min ?? 0);
      else set(current + dir * step * mult);
    };

    const onText = (e: ChangeEvent<HTMLInputElement>) => {
      const t = e.target.value;
      if (!/^-?\d*\.?\d*$/.test(t)) return;
      setText(t);
      if (t === "") {
        if (value === undefined) setInner(null);
        if (current !== null) onChange?.(null);
        return;
      }
      const n = Number(t);
      if (!Number.isNaN(n) && t !== "-" && t !== "." && t !== "-.") {
        if (value === undefined) setInner(n);
        if (n !== current) onChange?.(n);
      }
    };

    const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
      // Normalise + clamp on blur.
      set(text.trim() === "" || Number.isNaN(Number(text)) ? null : Number(text));
      onBlur?.(e);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      onKeyDown?.(e);
      if (e.defaultPrevented) return;
      if (e.key === "ArrowUp") {
        e.preventDefault();
        stepBy(1);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        stepBy(-1);
      } else if (e.key === "PageUp") {
        e.preventDefault();
        stepBy(1, 10);
      } else if (e.key === "PageDown") {
        e.preventDefault();
        stepBy(-1, 10);
      } else if (e.key === "Home" && min !== undefined) {
        e.preventDefault();
        set(min);
      } else if (e.key === "End" && max !== undefined) {
        e.preventDefault();
        set(max);
      }
    };

    const atMin = min !== undefined && current != null && current <= min;
    const atMax = max !== undefined && current != null && current >= max;

    // Figma layouts: no adornment → − [value] +; prefix → [$ value] − +; suffix → − + [value $].
    const layout = prefix != null && suffix == null ? "end" : suffix != null && prefix == null ? "start" : "split";

    const dec = (
      <button
        type="button"
        className={styles.step}
        aria-label={decrementLabel}
        aria-controls={inputId}
        tabIndex={-1}
        disabled={disabled || readOnly || atMin}
        onClick={() => stepBy(-1)}
      >
        <Minus aria-hidden="true" />
      </button>
    );
    const inc = (
      <button
        type="button"
        className={styles.step}
        aria-label={incrementLabel}
        aria-controls={inputId}
        tabIndex={-1}
        disabled={disabled || readOnly || atMax}
        onClick={() => stepBy(1)}
      >
        <Plus aria-hidden="true" />
      </button>
    );

    const field = (
      <div className={styles.field}>
        {prefix != null ? <span className={styles.adorn}>{prefix}</span> : null}
        <input
          ref={ref}
          id={inputId}
          type="text"
          inputMode="decimal"
          role="spinbutton"
          autoComplete="off"
          className={styles.input}
          value={text}
          disabled={disabled}
          readOnly={readOnly}
          aria-invalid={error || undefined}
          aria-valuenow={current ?? undefined}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-labelledby={label != null ? labelId : undefined}
          aria-describedby={cx(helperText != null && helpId, describedBy) || undefined}
          onChange={onText}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          {...rest}
        />
        {suffix != null ? <span className={styles.adorn}>{suffix}</span> : null}
      </div>
    );

    return (
      <div
        className={cx(
          styles.root,
          error && styles.error,
          disabled && styles.disabled,
          className,
        )}
        style={{ width }}
      >
        {label != null ? (
          <label id={labelId} htmlFor={inputId} className={styles.label}>
            {label}
          </label>
        ) : null}
        <div className={cx(styles.box, styles[layout])}>
          {layout === "split" ? (
            <>
              {dec}
              {field}
              {inc}
            </>
          ) : layout === "start" ? (
            <>
              {dec}
              {inc}
              {field}
            </>
          ) : (
            <>
              {field}
              {dec}
              {inc}
            </>
          )}
        </div>
        {helperText != null ? (
          <p id={helpId} className={styles.helper}>
            {helperText}
          </p>
        ) : null}
      </div>
    );
  },
);
