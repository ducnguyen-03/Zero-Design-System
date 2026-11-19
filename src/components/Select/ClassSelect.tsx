import { forwardRef, useId, useImperativeHandle, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { Check, ChevronDown } from "lucide-react";
import { useListbox } from "./useListbox";
import type { ListboxOption } from "./useListbox";
import styles from "./ClassSelect.module.css";

/** Background treatment of a selected clinical class (Figma C2 / C3.8 / C5). */
export type ClassTone = "neutral" | "success" | "error";

export interface ClassSelectOption extends ListboxOption {
  /** Filled-pill colour when this class is selected. Default "neutral". */
  tone?: ClassTone;
}

export interface ClassSelectProps {
  options: ClassSelectOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Figma `Type`: "text" (Text Only) or "filled" (tinted pill). Default "filled". */
  variant?: "text" | "filled";
  /** Shown when nothing is selected. Default "Assign class". */
  placeholder?: string;
  disabled?: boolean;
  name?: string;
  id?: string;
  className?: string;
  style?: CSSProperties;
  /** Accessible name — the control has no visible label. */
  "aria-label"?: string;
  "aria-labelledby"?: string;
}

const cx = (...parts: Array<string | false | undefined | null>) =>
  parts.filter(Boolean).join(" ");

const toneClass: Record<ClassTone, string> = {
  neutral: "toneNeutral",
  success: "toneSuccess",
  error: "toneError",
};

/**
 * Compact clinical-class curation dropdown (Figma "dropdown / class curation",
 * 3412:10709). A 24px select-only combobox: text-only, or a filled pill tinted
 * by the selected class's tone.
 */
export const ClassSelect = forwardRef<HTMLDivElement, ClassSelectProps>(
  function ClassSelect(
    {
      options,
      value,
      defaultValue,
      onValueChange,
      variant = "filled",
      placeholder = "Assign class",
      disabled = false,
      name,
      id,
      className,
      style,
      "aria-label": ariaLabel = "Clinical class",
      "aria-labelledby": ariaLabelledBy,
    },
    ref,
  ) {
    const autoId = useId();
    const baseId = id ?? autoId;
    const isControlled = value !== undefined;
    const [inner, setInner] = useState(defaultValue ?? "");
    const current = isControlled ? value : inner;
    const selectedOpt = options.find((o) => o.value === current);

    const triggerRef = useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => triggerRef.current as HTMLDivElement);

    const lb = useListbox({
      id: baseId,
      options,
      selected: current ? [current] : [],
      disabled,
      onSelect: (v) => {
        if (!isControlled) setInner(v);
        onValueChange?.(v);
      },
    });

    const tone = selectedOpt?.tone ?? "neutral";

    return (
      <div
        ref={lb.rootRef}
        className={cx(styles.root, className)}
        style={style}
      >
        <div
          ref={triggerRef}
          id={baseId}
          role="combobox"
          tabIndex={disabled ? -1 : 0}
          aria-haspopup="listbox"
          aria-expanded={lb.open}
          aria-controls={lb.listboxId}
          aria-activedescendant={
            lb.open && lb.activeIndex >= 0 ? lb.optionId(lb.activeIndex) : undefined
          }
          aria-label={ariaLabelledBy ? undefined : ariaLabel}
          aria-labelledby={ariaLabelledBy}
          aria-disabled={disabled || undefined}
          className={cx(
            styles.trigger,
            variant === "filled" ? styles.filled : styles.textOnly,
            variant === "filled" && selectedOpt && styles.hasValue,
            variant === "filled" && (selectedOpt ? styles[toneClass[tone]] : styles.empty),
            lb.open && styles.open,
            disabled && styles.disabled,
          )}
          onMouseDown={(e) => {
            if (disabled) return;
            e.preventDefault();
            triggerRef.current?.focus();
            lb.toggle();
          }}
          onKeyDown={lb.onKeyDown}
          onBlur={(e) => {
            if (!lb.rootRef.current?.contains(e.relatedTarget as Node)) lb.close();
          }}
        >
          <span className={styles.value}>{selectedOpt?.label ?? placeholder}</span>
          <span className={styles.icon} aria-hidden="true">
            <ChevronDown />
          </span>
        </div>

        <ul
          id={lb.listboxId}
          role="listbox"
          className={styles.listbox}
          hidden={!lb.open}
          aria-label={ariaLabel}
        >
          {options.map((o, i) => {
            const isSel = o.value === current;
            return (
              <li
                key={o.value}
                id={lb.optionId(i)}
                role="option"
                aria-selected={isSel}
                aria-disabled={o.disabled || undefined}
                className={cx(
                  styles.option,
                  i === lb.activeIndex && styles.optionActive,
                  isSel && styles.optionSelected,
                  o.disabled && styles.optionDisabled,
                )}
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => !o.disabled && lb.setActiveIndex(i)}
                onClick={() => lb.choose(i)}
              >
                <span
                  className={cx(styles.swatch, styles[toneClass[o.tone ?? "neutral"]])}
                  aria-hidden="true"
                />
                <span className={styles.optionLabel}>{o.label}</span>
                {isSel ? <Check className={styles.optionCheck} aria-hidden="true" /> : null}
              </li>
            );
          })}
        </ul>
        {name ? <input type="hidden" name={name} value={current} /> : null}
      </div>
    );
  },
);
