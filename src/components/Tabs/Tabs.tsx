import { useId, useRef, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import styles from "./Tabs.module.css";

/** `underline` is the original (pre-Figma-sync) style and stays the default for
 *  backward compatibility. `primary` / `secondary` are the Figma "Tab Type" axis. */
export type TabsVariant = "underline" | "primary" | "secondary";
export type TabsTheme = "light" | "dark";
export type TabsSize = "md" | "sm";
export type TabIconPosition = "start" | "end";

export interface TabItem {
  label: string;
  value: string;
  disabled?: boolean;
  /** Optional icon (e.g. a lucide icon) shown beside the label. */
  icon?: ReactNode;
  /** Side of the label the icon sits on. Default `start`. */
  iconPosition?: TabIconPosition;
  /** id of the tabpanel this tab controls (sets aria-controls). */
  panelId?: string;
  /** Second-tier tabs shown under this tab when it is active (double-tier layout). */
  subItems?: TabItem[];
}

export interface TabsProps {
  items: TabItem[];
  /** Controlled active value. Omit for uncontrolled use with `defaultValue`. */
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  "aria-label"?: string;
  /** Visual style. Default `underline` (legacy). */
  variant?: TabsVariant;
  /** Surface the primary tabs sit on. Secondary tabs are light-only in Figma. */
  theme?: TabsTheme;
  /** `md` (default) or `sm` (compact). */
  size?: TabsSize;
  /** `automatic` selects on arrow-key focus; `manual` waits for Enter/Space. */
  activation?: "automatic" | "manual";
  /** Double tier: controlled active sub-tab value. */
  subValue?: string;
  /** Double tier: uncontrolled initial sub-tab value (defaults to the first sub item). */
  defaultSubValue?: string;
  /** Double tier: fires with the sub-tab value and its parent tab value. */
  onSubChange?: (value: string, parentValue: string) => void;
  /** Accessible label for the second-tier tablist. */
  subAriaLabel?: string;
  className?: string;
}

const cx = (...parts: Array<string | false | undefined>) =>
  parts.filter(Boolean).join(" ");

interface TabListProps {
  items: TabItem[];
  active: string;
  onSelect: (value: string) => void;
  ariaLabel?: string;
  variant: TabsVariant;
  theme: TabsTheme;
  size: TabsSize;
  activation: "automatic" | "manual";
  idPrefix: string;
  className?: string;
  fill?: boolean;
}

function TabList({
  items,
  active,
  onSelect,
  ariaLabel,
  variant,
  theme,
  size,
  activation,
  idPrefix,
  className,
  fill = false,
}: TabListProps) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  // Roving tabindex target: the active tab, or the first enabled one if none is active.
  const focusIndex = (() => {
    const i = items.findIndex((it) => it.value === active && !it.disabled);
    return i !== -1 ? i : items.findIndex((it) => !it.disabled);
  })();

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const enabled = items.map((it, i) => (it.disabled ? -1 : i)).filter((i) => i !== -1);
    if (enabled.length === 0) return;
    const pos = enabled.indexOf(index);
    let target: number | undefined;
    switch (e.key) {
      case "ArrowRight":
        target = enabled[(pos + 1) % enabled.length];
        break;
      case "ArrowLeft":
        target = enabled[(pos - 1 + enabled.length) % enabled.length];
        break;
      case "Home":
        target = enabled[0];
        break;
      case "End":
        target = enabled[enabled.length - 1];
        break;
      default:
        return;
    }
    e.preventDefault();
    refs.current[target]?.focus();
    if (activation === "automatic") onSelect(items[target].value);
  };

  return (
    <div
      className={cx(
        styles.tablist,
        styles[variant],
        styles[theme],
        styles[size],
        fill && styles.fill,
        className,
      )}
      role="tablist"
      aria-label={ariaLabel}
      aria-orientation="horizontal"
    >
      {items.map((item, index) => {
        const selected = active === item.value;
        const iconEnd = item.iconPosition === "end";
        return (
          <button
            key={item.value}
            ref={(el) => {
              refs.current[index] = el;
            }}
            id={`${idPrefix}-tab-${item.value}`}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-controls={item.panelId}
            tabIndex={index === focusIndex ? 0 : -1}
            disabled={item.disabled}
            className={cx(styles.tab, selected && styles.active)}
            onClick={() => onSelect(item.value)}
            onKeyDown={(e) => onKeyDown(e, index)}
          >
            {item.icon && !iconEnd ? (
              <span className={styles.icon} aria-hidden="true">
                {item.icon}
              </span>
            ) : null}
            <span className={styles.label}>{item.label}</span>
            {item.icon && iconEnd ? (
              <span className={styles.icon} aria-hidden="true">
                {item.icon}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

export function Tabs({
  items,
  value,
  defaultValue,
  onChange,
  "aria-label": ariaLabel,
  variant = "underline",
  theme = "light",
  size = "md",
  activation = "automatic",
  subValue,
  defaultSubValue,
  onSubChange,
  subAriaLabel,
  className,
}: TabsProps) {
  const idPrefix = useId();
  const [internal, setInternal] = useState(defaultValue ?? items[0]?.value ?? "");
  const active = value ?? internal;
  const activeItem = items.find((it) => it.value === active);
  const subItems = activeItem?.subItems;

  const [internalSub, setInternalSub] = useState<string | undefined>(defaultSubValue);
  const activeSub =
    subValue ??
    (internalSub && subItems?.some((s) => s.value === internalSub)
      ? internalSub
      : subItems?.[0]?.value) ??
    "";

  const select = (v: string) => {
    if (value === undefined) setInternal(v);
    // Moving to another parent resets the second tier to that parent's first sub tab.
    if (v !== active && subValue === undefined) setInternalSub(undefined);
    onChange?.(v);
  };
  const selectSub = (v: string) => {
    if (subValue === undefined) setInternalSub(v);
    onSubChange?.(v, active);
  };

  const primaryList = (
    <TabList
      items={items}
      active={active}
      onSelect={select}
      ariaLabel={ariaLabel}
      variant={variant}
      theme={theme}
      size={size}
      activation={activation}
      idPrefix={idPrefix}
      className={subItems ? undefined : className}
    />
  );

  if (!subItems || subItems.length === 0) return primaryList;

  return (
    <div className={cx(styles.doubleTier, styles[theme], className)}>
      {primaryList}
      <TabList
        items={subItems}
        active={activeSub}
        onSelect={selectSub}
        ariaLabel={subAriaLabel ?? (activeItem ? `${activeItem.label} sections` : undefined)}
        variant="secondary"
        theme="light"
        size="sm"
        activation={activation}
        idPrefix={`${idPrefix}-sub`}
        className={styles.subTier}
        fill
      />
    </div>
  );
}
