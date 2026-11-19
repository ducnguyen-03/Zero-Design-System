import { forwardRef, useCallback, useEffect, useId, useImperativeHandle, useRef, useState } from "react";
import type { CSSProperties, HTMLAttributes, KeyboardEvent, ReactNode } from "react";
import { Plus, X } from "lucide-react";
import styles from "./Fab.module.css";

/**
 * Menu layout when open (Figma `Variant`):
 * - `vertical`  — labelled pills stacked above the button, right-aligned.
 * - `arc-right` — icon-only mini buttons on a quarter arc up/right of the button.
 * - `arc-left`  — mirror of `arc-right` (up/left).
 * - `radial`    — icon-only mini buttons on a half circle above the button (Figma "Radical").
 */
export type FabLayout = "vertical" | "arc-right" | "arc-left" | "radial";

export interface FabAction {
  /** Stable key; falls back to the label. */
  id?: string;
  /** Visible label (vertical) / accessible name + tooltip (arc & radial). */
  label: string;
  icon: ReactNode;
  onSelect?: () => void;
  disabled?: boolean;
}

export interface FabProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  actions: FabAction[];
  /** Layout of the expanded menu. */
  layout?: FabLayout;
  /** Controlled open state (Figma `State=On`). */
  open?: boolean;
  /** Uncontrolled initial open state. */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Icon shown while closed. Defaults to a plus. */
  icon?: ReactNode;
  /** Icon shown while open. Defaults to an X. */
  closeIcon?: ReactNode;
  /** Accessible name of the trigger while closed / open. */
  openLabel?: string;
  closeLabel?: string;
  /** Close the menu after an action is chosen. */
  closeOnSelect?: boolean;
  /** `inline` renders in flow; the others pin the FAB to a viewport corner. */
  placement?: "inline" | "bottom-right" | "bottom-left";
}

/* Arc geometry: 64px main button, 40px minis (touch-sized), a 12px gap between
   the trigger's edge and each mini — 32 + 12 + 20 = 64px centre to centre. */
const RADIUS = 64;
const ARCS: Record<Exclude<FabLayout, "vertical">, [number, number]> = {
  "arc-right": [80, -6],
  "arc-left": [100, 186],
  radial: [180, 0],
};

function arcOffset(layout: Exclude<FabLayout, "vertical">, index: number, count: number) {
  const [from, to] = ARCS[layout];
  const t = count <= 1 ? 0.5 : index / (count - 1);
  const deg = from + (to - from) * t;
  const rad = (deg * Math.PI) / 180;
  return { x: Math.round(Math.cos(rad) * RADIUS), y: Math.round(-Math.sin(rad) * RADIUS) };
}

const cx = (...parts: Array<string | false | undefined>) => parts.filter(Boolean).join(" ");

export const Fab = forwardRef<HTMLDivElement, FabProps>(function Fab(
  {
    actions,
    layout = "vertical",
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    icon,
    closeIcon,
    openLabel = "Open actions",
    closeLabel = "Close actions",
    closeOnSelect = true,
    placement = "inline",
    className,
    ...rest
  },
  ref,
) {
  const [uncontrolled, setUncontrolled] = useState(defaultOpen);
  const open = openProp ?? uncontrolled;
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  useImperativeHandle(ref, () => rootRef.current as HTMLDivElement);

  const setOpen = useCallback(
    (next: boolean) => {
      if (openProp === undefined) setUncontrolled(next);
      onOpenChange?.(next);
    },
    [openProp, onOpenChange],
  );

  // Close on outside pointer-down.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open, setOpen]);

  const focusables = () =>
    Array.from(
      rootRef.current?.querySelectorAll<HTMLButtonElement>("[data-fab-item]:not(:disabled)") ?? [],
    );

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape" && open) {
      e.stopPropagation();
      setOpen(false);
      triggerRef.current?.focus();
      return;
    }
    if (!open) return;
    const keys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Home", "End"];
    if (!keys.includes(e.key)) return;
    const items = focusables();
    if (items.length === 0) return;
    e.preventDefault();
    const current = items.indexOf(document.activeElement as HTMLButtonElement);
    let next: number;
    if (e.key === "Home") next = 0;
    else if (e.key === "End") next = items.length - 1;
    else {
      const forward = e.key === "ArrowDown" || e.key === "ArrowRight";
      next = current === -1 ? 0 : (current + (forward ? 1 : -1) + items.length) % items.length;
    }
    items[next]?.focus();
  };

  const select = (action: FabAction) => {
    action.onSelect?.();
    if (closeOnSelect) {
      setOpen(false);
      triggerRef.current?.focus();
    }
  };

  const isArc = layout !== "vertical";
  // With the default icons, one plus rotates into an × instead of swapping glyphs.
  const morph = icon === undefined && closeIcon === undefined;

  return (
    <div
      ref={rootRef}
      className={cx(
        styles.fab,
        styles[layout === "vertical" ? "vertical" : layout === "radial" ? "radial" : layout === "arc-left" ? "arcLeft" : "arcRight"],
        open && styles.open,
        placement === "bottom-right" && styles.fixedRight,
        placement === "bottom-left" && styles.fixedLeft,
        className,
      )}
      data-state={open ? "open" : "closed"}
      onKeyDown={onKeyDown}
      {...rest}
    >
      <ul id={menuId} className={styles.menu} aria-label="Actions">
        {actions.map((action, i) => {
          const offset = isArc ? arcOffset(layout, i, actions.length) : null;
          const style = offset
            ? ({ "--fab-x": `${offset.x}px`, "--fab-y": `${offset.y}px`, "--fab-i": i } as CSSProperties)
            : ({ "--fab-i": actions.length - 1 - i } as CSSProperties);
          return (
            <li key={action.id ?? action.label} className={styles.item} style={style}>
              <button
                type="button"
                data-fab-item=""
                className={isArc ? styles.mini : styles.pill}
                disabled={action.disabled}
                tabIndex={open ? 0 : -1}
                aria-label={isArc ? action.label : undefined}
                title={isArc ? action.label : undefined}
                onClick={() => select(action)}
              >
                <span className={styles.itemIcon} aria-hidden="true">
                  {action.icon}
                </span>
                {isArc ? null : <span className={styles.pillLabel}>{action.label}</span>}
              </button>
            </li>
          );
        })}
      </ul>
      <button
        ref={triggerRef}
        type="button"
        data-fab-item=""
        className={styles.main}
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={open ? closeLabel : openLabel}
        onClick={() => setOpen(!open)}
      >
        <span className={styles.mainIcon} aria-hidden="true" data-morph={morph ? "" : undefined}>
          {morph ? <Plus /> : open ? (closeIcon ?? <X />) : (icon ?? <Plus />)}
        </span>
      </button>
    </div>
  );
});
