import { useId, useRef, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import styles from "./Accordion.module.css";

export type AccordionVariant = "underline" | "card";
export type AccordionType = "single" | "multiple";

export interface AccordionItem {
  /** Unique key for the item; used in `value` / `defaultValue`. */
  value: string;
  /** Trigger label. */
  title: ReactNode;
  /** Secondary line under the title (card variant). */
  subtitle?: ReactNode;
  /** Leading 16px icon in a 28px box (card variant), e.g. a lucide icon. */
  icon?: ReactNode;
  /** Small trailing tag before the chevron (e.g. "57 Roles"). */
  meta?: ReactNode;
  /** Panel content revealed when expanded. */
  content: ReactNode;
  disabled?: boolean;
}

export interface AccordionProps {
  items: AccordionItem[];
  /** `underline` — flat rows divided by a rule. `card` — each item is a rounded card. */
  variant?: AccordionVariant;
  /** `single` — opening one item closes the others. `multiple` — independent items. */
  type?: AccordionType;
  /** Controlled open item values. */
  value?: string[];
  /** Uncontrolled initial open item values. */
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  /** In `single` mode, allow closing the open item so none are open. Default true. */
  collapsible?: boolean;
  /** Heading level wrapping each trigger (WAI-ARIA accordion pattern). Default 3. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  className?: string;
}

const cx = (...parts: Array<string | false | undefined>) =>
  parts.filter(Boolean).join(" ");

export function Accordion({
  items,
  variant = "underline",
  type = "single",
  value,
  defaultValue,
  onValueChange,
  collapsible = true,
  headingLevel = 3,
  className,
}: AccordionProps) {
  const baseId = useId();
  const [internal, setInternal] = useState<string[]>(defaultValue ?? []);
  const open = value ?? internal;
  const triggers = useRef<Array<HTMLButtonElement | null>>([]);
  const Heading = `h${headingLevel}` as const;

  const toggle = (v: string) => {
    const isOpen = open.includes(v);
    let next: string[];
    if (type === "multiple") {
      next = isOpen ? open.filter((x) => x !== v) : [...open, v];
    } else {
      if (isOpen && !collapsible) return;
      next = isOpen ? [] : [v];
    }
    if (value === undefined) setInternal(next);
    onValueChange?.(next);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const enabled = items
      .map((item, i) => (item.disabled ? -1 : i))
      .filter((i) => i !== -1);
    const pos = enabled.indexOf(index);
    let target: number | undefined;
    if (e.key === "ArrowDown") target = enabled[(pos + 1) % enabled.length];
    else if (e.key === "ArrowUp") target = enabled[(pos - 1 + enabled.length) % enabled.length];
    else if (e.key === "Home") target = enabled[0];
    else if (e.key === "End") target = enabled[enabled.length - 1];
    if (target === undefined) return;
    e.preventDefault();
    triggers.current[target]?.focus();
  };

  return (
    <div className={cx(styles.root, styles[variant], className)}>
      {items.map((item, index) => {
        const expanded = open.includes(item.value);
        const triggerId = `${baseId}-trigger-${index}`;
        const panelId = `${baseId}-panel-${index}`;
        return (
          <div key={item.value} className={cx(styles.item, expanded && styles.expanded)}>
            <Heading className={styles.heading}>
              <button
                ref={(el) => {
                  triggers.current[index] = el;
                }}
                id={triggerId}
                type="button"
                className={styles.trigger}
                aria-expanded={expanded}
                aria-controls={panelId}
                aria-disabled={type === "single" && expanded && !collapsible ? true : undefined}
                disabled={item.disabled}
                onClick={() => toggle(item.value)}
                onKeyDown={(e) => onKeyDown(e, index)}
              >
                <span className={styles.lead}>
                  {variant === "card" && item.icon ? (
                    <span className={styles.iconBox} aria-hidden="true">
                      {item.icon}
                    </span>
                  ) : null}
                  <span className={styles.text}>
                    <span className={styles.title}>{item.title}</span>
                    {item.subtitle ? <span className={styles.subtitle}>{item.subtitle}</span> : null}
                  </span>
                </span>
                <span className={styles.trail}>
                  {item.meta ? <span className={styles.meta}>{item.meta}</span> : null}
                  <ChevronDown className={styles.chevron} aria-hidden="true" />
                </span>
              </button>
            </Heading>
            {/* Grid 0fr → 1fr animates height; closed panels get `visibility: hidden`
                (in CSS) so they leave the tab order and the accessibility tree. */}
            <div className={styles.panelWrap}>
              <div
                id={panelId}
                role="region"
                aria-labelledby={triggerId}
                className={styles.panel}
              >
                {item.content}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
