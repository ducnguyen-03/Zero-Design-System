import {
  forwardRef,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import type { CSSProperties, KeyboardEvent, MouseEvent } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { useListbox } from "./useListbox";
import type { ListboxOption } from "./useListbox";
import styles from "./Select.module.css";

export { ClassSelect } from "./ClassSelect";
export type {
  ClassSelectProps,
  ClassSelectOption,
  ClassTone,
} from "./ClassSelect";

export type SelectOption = ListboxOption;

/** Figma `Size`: M (48px) → "md", S (40px) → "sm", XS (24px) → "xs". */
export type SelectSize = "xs" | "sm" | "md";
/** Figma `Field Type`: Dropdown → "field", Text Dropdown → "text" (borderless inline). */
export type SelectVariant = "field" | "text";

interface SelectBaseProps {
  options: SelectOption[];
  label?: string;
  /** Helper text between the label and the field. */
  helpText?: string;
  /** Error message below the field; presence flips the border to red. */
  errorText?: string;
  placeholder?: string;
  /** Default "sm" (40px). "xs" (24px) is intended for the text variant. */
  size?: SelectSize;
  variant?: SelectVariant;
  disabled?: boolean;
  required?: boolean;
  /** Form field name — rendered as hidden input(s) carrying the selected value(s). */
  name?: string;
  id?: string;
  className?: string;
  style?: CSSProperties;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  /** Render with the listbox open initially (mainly for docs). */
  defaultOpen?: boolean;
  /**
   * Portal the listbox to `document.body` and position it with `position: fixed`,
   * so it escapes clipping or transformed parents (table scrollers, cards with
   * `overflow: hidden`, Storybook docs previews). Flips above the field when
   * there is no room below. Used by Pagination and TableDropdown.
   */
  floating?: boolean;
}

export interface SelectSingleProps extends SelectBaseProps {
  multiple?: false;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

/** Figma `Field Type=Chip Dropdown`: selected values render as removable chips. */
export interface SelectMultipleProps extends SelectBaseProps {
  multiple: true;
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
}

export type SelectProps = SelectSingleProps | SelectMultipleProps;

const cx = (...parts: Array<string | false | undefined | null>) =>
  parts.filter(Boolean).join(" ");

const toArray = (v: string | string[] | undefined): string[] =>
  v === undefined || v === "" ? [] : Array.isArray(v) ? v : [v];

export const Select = forwardRef<HTMLDivElement, SelectProps>(
  function Select(props, ref) {
    const {
      options,
      label,
      helpText,
      errorText,
      placeholder,
      size = "sm",
      variant = "field",
      disabled = false,
      required,
      name,
      id,
      className,
      style,
      multiple = false,
      defaultOpen,
      floating = false,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
    } = props;

    const autoId = useId();
    const baseId = id ?? autoId;
    const labelId = `${baseId}-label`;
    const valueId = `${baseId}-value`;
    const helpId = `${baseId}-help`;
    const errorId = `${baseId}-error`;
    const hasError = Boolean(errorText);

    const isControlled = props.value !== undefined;
    const [inner, setInner] = useState<string[]>(() =>
      toArray(props.defaultValue),
    );
    const selected = isControlled ? toArray(props.value) : inner;

    const commit = (next: string[]) => {
      if (!isControlled) setInner(next);
      if (props.multiple) props.onValueChange?.(next);
      else props.onValueChange?.(next[0] ?? "");
    };

    const onSelect = (value: string) => {
      if (multiple) {
        commit(
          selected.includes(value)
            ? selected.filter((v) => v !== value)
            : [...selected, value],
        );
      } else {
        commit([value]);
      }
    };

    const removeValue = (value: string) =>
      commit(selected.filter((v) => v !== value));

    const triggerRef = useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => triggerRef.current as HTMLDivElement);

    const lb = useListbox({
      id: baseId,
      options,
      selected,
      multiple,
      disabled,
      onSelect,
      defaultOpen,
      onExtraKey: (e: KeyboardEvent<HTMLElement>) => {
        if (multiple && e.key === "Backspace" && selected.length) {
          e.preventDefault();
          removeValue(selected[selected.length - 1]);
          return true;
        }
        return false;
      },
    });

    const anchorRef = useRef<HTMLDivElement>(null);
    const [floatStyle, setFloatStyle] = useState<CSSProperties>();
    useLayoutEffect(() => {
      if (!floating || !lb.open) return;
      const place = () => {
        const a = anchorRef.current?.getBoundingClientRect();
        const list = document.getElementById(lb.listboxId);
        if (!a) return;
        const gap = 4;
        const h = list?.offsetHeight ?? 0;
        const below = window.innerHeight - a.bottom - gap;
        const up = h > below && a.top - gap > below;
        setFloatStyle({
          position: "fixed",
          left: a.left,
          minWidth: a.width,
          top: up ? a.top - gap - h : a.bottom + gap,
        });
      };
      place();
      window.addEventListener("scroll", place, true);
      window.addEventListener("resize", place);
      return () => {
        window.removeEventListener("scroll", place, true);
        window.removeEventListener("resize", place);
      };
    }, [floating, lb.open, lb.listboxId, options.length]);

    const onControlMouseDown = (e: MouseEvent<HTMLDivElement>) => {
      if (disabled) return;
      if ((e.target as HTMLElement).closest("[data-chip-remove]")) return;
      e.preventDefault();
      triggerRef.current?.focus();
      lb.toggle();
    };

    const selectedOptions = selected
      .map((v) => options.find((o) => o.value === v))
      .filter((o): o is SelectOption => Boolean(o));

    const singleLabel = !multiple ? selectedOptions[0]?.label : undefined;
    const showPlaceholder = multiple
      ? selectedOptions.length === 0
      : !singleLabel;

    const describedBy =
      [helpText ? helpId : null, hasError ? errorId : null]
        .filter(Boolean)
        .join(" ") || undefined;
    const labelledBy =
      ariaLabelledBy ?? (label ? `${labelId} ${valueId}` : undefined);

    return (
      <div
        ref={lb.rootRef}
        className={cx(styles.field, className)}
        style={style}
      >
        {label ? (
          <span
            id={labelId}
            className={styles.label}
            onClick={() => !disabled && triggerRef.current?.focus()}
          >
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

        <div ref={anchorRef} className={styles.anchor}>
          <div
            className={cx(
              styles.control,
              variant === "text" ? styles.vText : styles.vField,
              styles[size],
              multiple && styles.chipMode,
              lb.open && styles.open,
              hasError && styles.error,
              disabled && styles.disabled,
            )}
            onMouseDown={onControlMouseDown}
          >
            {multiple && selectedOptions.length ? (
              <span className={styles.chips}>
                {selectedOptions.map((o) => (
                  <span key={o.value} className={styles.chip}>
                    <span className={styles.chipLabel}>{o.label}</span>
                    {!disabled ? (
                      <button
                        type="button"
                        data-chip-remove=""
                        className={styles.chipRemove}
                        aria-label={`Remove ${o.label}`}
                        tabIndex={-1}
                        onClick={() => {
                          removeValue(o.value);
                          triggerRef.current?.focus();
                        }}
                      >
                        <X />
                      </button>
                    ) : null}
                  </span>
                ))}
              </span>
            ) : null}
            <div
              ref={triggerRef}
              id={baseId}
              role="combobox"
              tabIndex={disabled ? -1 : 0}
              className={styles.trigger}
              aria-haspopup="listbox"
              aria-expanded={lb.open}
              aria-controls={lb.listboxId}
              aria-activedescendant={
                lb.open && lb.activeIndex >= 0
                  ? lb.optionId(lb.activeIndex)
                  : undefined
              }
              aria-label={ariaLabel}
              aria-labelledby={labelledBy}
              aria-describedby={describedBy}
              aria-invalid={hasError || undefined}
              aria-required={required || undefined}
              aria-disabled={disabled || undefined}
              onKeyDown={lb.onKeyDown}
              onBlur={(e) => {
                if (!lb.rootRef.current?.contains(e.relatedTarget as Node))
                  lb.close();
              }}
            >
              <span
                id={valueId}
                className={cx(
                  styles.value,
                  showPlaceholder && styles.placeholder,
                )}
              >
                {showPlaceholder ? (
                  placeholder
                ) : multiple ? (
                  <span className={styles.srOnly}>
                    {selectedOptions.map((o) => o.label).join(", ")}
                  </span>
                ) : (
                  singleLabel
                )}
              </span>
              <span className={styles.icon} aria-hidden="true">
                <ChevronDown />
              </span>
            </div>
          </div>

          {(() => {
            const list = (
              <ul
                id={lb.listboxId}
                role="listbox"
                className={cx(styles.listbox, floating && styles.floating)}
                style={floating ? floatStyle : undefined}
                hidden={!lb.open}
                aria-labelledby={label ? labelId : undefined}
                aria-label={!label ? ariaLabel : undefined}
                aria-multiselectable={multiple || undefined}
              >
                {options.map((o, i) => {
                  const isSel = selected.includes(o.value);
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
                      <span className={styles.optionLabel}>{o.label}</span>
                      {isSel ? (
                        <Check
                          className={styles.optionCheck}
                          aria-hidden="true"
                        />
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            );
            return floating && typeof document !== "undefined"
              ? createPortal(list, document.body)
              : list;
          })()}
        </div>

        {hasError ? (
          <span id={errorId} className={styles.errorText}>
            {errorText}
          </span>
        ) : null}

        {name
          ? (selected.length ? selected : [""]).map((v, i) => (
              <input key={`${v}-${i}`} type="hidden" name={name} value={v} />
            ))
          : null}
      </div>
    );
  },
);
