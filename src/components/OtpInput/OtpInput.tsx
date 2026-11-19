import { Fragment, forwardRef, useId, useRef, useState } from "react";
import type {
  ChangeEvent,
  ClipboardEvent,
  FocusEvent,
  HTMLAttributes,
  KeyboardEvent,
} from "react";
import { Minus } from "lucide-react";
import styles from "./OtpInput.module.css";

export type OtpInputVariant = "rounded" | "square" | "underline" | "pill";
export type OtpInputSize = "sm" | "md" | "lg";

export interface OtpInputProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  /** Number of slots. */
  length?: number;
  /** Controlled value (characters fill slots left → right). */
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Fires when every slot is filled. */
  onComplete?: (value: string) => void;
  /** Field label, rendered above the slots (same anatomy as `Input`). */
  label?: string;
  /** Helper text, rendered between the label and the slots. */
  helpText?: string;
  /** Error message below the slots; presence flips every slot to red. */
  errorText?: string;
  required?: boolean;
  /** Figma `Variant`. */
  variant?: OtpInputVariant;
  /** Figma `Size`: lg = 60px slots, md = 40px, sm = 32px. */
  size?: OtpInputSize;
  /** Figma `State=Error` without a message. Prefer `errorText`. */
  error?: boolean;
  /** Figma `State=Disabled`. */
  disabled?: boolean;
  /** Insert a dash separator after every N slots (Figma shows 3 + 3). `0` = none. */
  groupSize?: number;
  /** `numeric` accepts 0-9 only; `alphanumeric` accepts letters and digits. */
  mode?: "numeric" | "alphanumeric";
  /** Mask characters like a password field. */
  mask?: boolean;
  autoFocus?: boolean;
  /** Form field name — renders a hidden input holding the joined value. */
  name?: string;
}

const cx = (...parts: Array<string | false | undefined>) =>
  parts.filter(Boolean).join(" ");

const toSlots = (v: string, n: number) =>
  Array.from({ length: n }, (_, i) => v[i] ?? "");

export const OtpInput = forwardRef<HTMLDivElement, OtpInputProps>(function OtpInput(
  {
    length = 6,
    value,
    defaultValue = "",
    onChange,
    onComplete,
    label,
    helpText,
    errorText,
    required,
    variant = "rounded",
    size = "lg",
    error = false,
    disabled = false,
    groupSize = 3,
    mode = "numeric",
    mask = false,
    autoFocus = false,
    name,
    id,
    className,
    "aria-label": ariaLabelProp,
    "aria-labelledby": labelledByProp,
    "aria-describedby": describedByProp,
    ...rest
  },
  ref,
) {
  const autoId = useId();
  const baseId = id ?? autoId;
  const labelId = `${baseId}-label`;
  const helpId = `${baseId}-help`;
  const errorId = `${baseId}-error`;
  const hasError = error || Boolean(errorText);

  const [inner, setInner] = useState(() => toSlots(defaultValue, length));
  const slots = value !== undefined ? toSlots(value, length) : inner;
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  const labelledBy = labelledByProp ?? (label ? labelId : undefined);
  const ariaLabel = labelledBy ? ariaLabelProp : (ariaLabelProp ?? "One-time code");
  const describedBy =
    [describedByProp, helpText ? helpId : null, errorText ? errorId : null]
      .filter(Boolean)
      .join(" ") || undefined;

  const accept = (ch: string) =>
    mode === "numeric" ? /^[0-9]$/.test(ch) : /^[a-z0-9]$/i.test(ch);

  const focusAt = (i: number) => {
    const el = inputs.current[Math.max(0, Math.min(length - 1, i))];
    el?.focus();
    el?.select();
  };

  const update = (next: string[]) => {
    if (value === undefined) setInner(next);
    const joined = next.join("");
    onChange?.(joined);
    if (next.every((c) => c !== "")) onComplete?.(joined);
  };

  /** Write `chars` starting at slot `start`; returns index after the last written slot. */
  const fill = (start: number, chars: string[]) => {
    const next = [...slots];
    let i = start;
    for (const ch of chars) {
      if (i >= length) break;
      next[i] = mode === "alphanumeric" ? ch.toUpperCase() : ch;
      i += 1;
    }
    update(next);
    return i;
  };

  const onInput = (i: number) => (e: ChangeEvent<HTMLInputElement>) => {
    const typed = e.target.value.split("").filter(accept);
    if (typed.length === 0) return;
    // With a filled slot the browser gives "old+new" (or "new+old") — drop the old one.
    let chars = typed;
    if (typed.length === 2 && slots[i]) {
      const old = typed.indexOf(slots[i]);
      chars = old === -1 ? typed.slice(-1) : typed.filter((_, k) => k !== old);
    }
    // SMS autofill drops the whole code into one slot — treat it like a paste.
    const start = chars.length >= length ? 0 : i;
    const end = fill(start, chars);
    focusAt(end >= length ? length - 1 : end);
  };

  const onKeyDown = (i: number) => (e: KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case "Backspace": {
        e.preventDefault();
        const next = [...slots];
        if (next[i]) {
          next[i] = "";
          update(next);
        } else if (i > 0) {
          next[i - 1] = "";
          update(next);
          focusAt(i - 1);
        }
        break;
      }
      case "Delete": {
        e.preventDefault();
        if (slots[i]) {
          const next = [...slots];
          next[i] = "";
          update(next);
        }
        break;
      }
      case "ArrowLeft":
        e.preventDefault();
        focusAt(i - 1);
        break;
      case "ArrowRight":
        e.preventDefault();
        focusAt(i + 1);
        break;
      case "Home":
        e.preventDefault();
        focusAt(0);
        break;
      case "End":
        e.preventDefault();
        focusAt(length - 1);
        break;
      default:
    }
  };

  const onPaste = (i: number) => (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const chars = e.clipboardData.getData("text").split("").filter(accept);
    if (chars.length === 0) return;
    // A full-length paste always starts at slot 0.
    const start = chars.length >= length ? 0 : i;
    const end = fill(start, chars);
    focusAt(end >= length ? length - 1 : end);
  };

  const onFocus = (e: FocusEvent<HTMLInputElement>) => e.target.select();

  return (
    <div className={cx(styles.field, className)}>
      {label ? (
        <span id={labelId} className={styles.label}>
          {label}
          {required ? (
            <span className={styles.required} aria-hidden="true">
              {" "}
              *
            </span>
          ) : null}
        </span>
      ) : null}
      {helpText ? (
        <span id={helpId} className={styles.help}>
          {helpText}
        </span>
      ) : null}
      <div
        ref={ref}
        id={baseId}
        role="group"
        aria-label={ariaLabel}
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        className={cx(
          styles.root,
          styles[variant],
          styles[size],
          hasError && styles.error,
          disabled && styles.disabled,
        )}
        {...rest}
      >
        {slots.map((ch, i) => (
          <Fragment key={i}>
            {groupSize > 0 && i > 0 && i % groupSize === 0 ? (
              <span className={styles.separator} aria-hidden="true">
                <Minus size={size === "lg" ? 24 : 16} />
              </span>
            ) : null}
            <input
              ref={(n) => {
                inputs.current[i] = n;
              }}
              id={`${baseId}-${i}`}
              className={styles.slot}
              type={mask ? "password" : "text"}
              inputMode={mode === "numeric" ? "numeric" : "text"}
              pattern={mode === "numeric" ? "[0-9]*" : undefined}
              autoComplete={i === 0 ? "one-time-code" : "off"}
              autoFocus={autoFocus && i === 0}
              value={ch}
              disabled={disabled}
              required={required}
              aria-invalid={hasError || undefined}
              aria-describedby={describedBy}
              aria-label={`Character ${i + 1} of ${length}`}
              onChange={onInput(i)}
              onKeyDown={onKeyDown(i)}
              onPaste={onPaste(i)}
              onFocus={onFocus}
            />
          </Fragment>
        ))}
        {name ? <input type="hidden" name={name} value={slots.join("")} /> : null}
      </div>
      {errorText ? (
        <span id={errorId} className={styles.errorText}>
          {errorText}
        </span>
      ) : null}
    </div>
  );
});
