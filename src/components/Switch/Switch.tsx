import { forwardRef, useId, useRef, useState } from "react";
import type {
  HTMLAttributes,
  InputHTMLAttributes,
  KeyboardEvent,
  ReactNode,
} from "react";
import { Check, X } from "lucide-react";
import styles from "./Switch.module.css";

export type SwitchColor = "green" | "red" | "blue" | "orange";

export interface SwitchProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "color" | "size"> {
  label?: ReactNode;
  /** On-state colour. `green` is the Figma default toggle; `red` is the Figma
   *  `Default=False` (danger) toggle. `blue` / `orange` are kept for category toggles. */
  color?: SwitchColor;
}

const cx = (...parts: Array<string | false | undefined>) =>
  parts.filter(Boolean).join(" ");

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  { label, color = "green", disabled, id, className, ...rest },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <label
      className={cx(
        styles.root,
        styles[color],
        disabled && styles.disabled,
        className,
      )}
      htmlFor={inputId}
    >
      <span className={styles.control}>
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          role="switch"
          disabled={disabled}
          className={styles.input}
          {...rest}
        />
        <span className={styles.track} aria-hidden="true">
          <Check className={styles.onIcon} size={9} strokeWidth={3.5} />
          <X className={styles.offIcon} size={9} strokeWidth={3.5} />
          <span className={styles.knob} />
        </span>
      </span>
      {label != null ? <span>{label}</span> : null}
    </label>
  );
});

/* ── Yes / No switch ──────────────────────────────────────────────── */

export interface YesNoSwitchProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  /** Controlled value. `null` = nothing chosen yet (Figma `Status=None`). */
  value?: boolean | null;
  /** Uncontrolled initial value. */
  defaultValue?: boolean | null;
  onChange?: (value: boolean) => void;
  yesLabel?: ReactNode;
  noLabel?: ReactNode;
  disabled?: boolean;
  /** Form field name — renders a hidden input with `"yes"` / `"no"` / `""`. */
  name?: string;
}

/** Segmented Yes/No choice. Implemented as a two-option radiogroup (arrow keys move + select). */
export const YesNoSwitch = forwardRef<HTMLDivElement, YesNoSwitchProps>(
  function YesNoSwitch(
    {
      value,
      defaultValue = null,
      onChange,
      yesLabel = "Yes",
      noLabel = "No",
      disabled = false,
      name,
      className,
      ...rest
    },
    ref,
  ) {
    const [inner, setInner] = useState<boolean | null>(defaultValue);
    const current = value !== undefined ? value : inner;
    const yesRef = useRef<HTMLButtonElement>(null);
    const noRef = useRef<HTMLButtonElement>(null);

    const select = (v: boolean) => {
      if (disabled) return;
      if (value === undefined) setInner(v);
      onChange?.(v);
    };

    const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
      if (disabled) return;
      let next: boolean | undefined;
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = true;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") next = false;
      if (next === undefined) return;
      e.preventDefault();
      select(next);
      (next ? yesRef : noRef).current?.focus();
    };

    // Roving tabindex: the selected option, or "Yes" when nothing is selected.
    const yesTab = current === false ? -1 : 0;
    const noTab = current === false ? 0 : -1;

    return (
      <div
        ref={ref}
        role="radiogroup"
        aria-disabled={disabled || undefined}
        className={cx(styles.yesNo, disabled && styles.yesNoDisabled, className)}
        onKeyDown={onKeyDown}
        {...rest}
      >
        <button
          ref={yesRef}
          type="button"
          role="radio"
          aria-checked={current === true}
          tabIndex={yesTab}
          disabled={disabled}
          className={cx(styles.segment, current === true && styles.selected)}
          onClick={() => select(true)}
        >
          {yesLabel}
        </button>
        <button
          ref={noRef}
          type="button"
          role="radio"
          aria-checked={current === false}
          tabIndex={noTab}
          disabled={disabled}
          className={cx(styles.segment, current === false && styles.selected)}
          onClick={() => select(false)}
        >
          {noLabel}
        </button>
        {name ? (
          <input
            type="hidden"
            name={name}
            value={current === null ? "" : current ? "yes" : "no"}
          />
        ) : null}
      </div>
    );
  },
);
