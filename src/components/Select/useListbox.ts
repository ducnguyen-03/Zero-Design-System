import { useCallback, useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";

export interface ListboxOption {
  label: string;
  value: string;
  disabled?: boolean;
}

interface UseListboxArgs {
  id: string;
  options: ListboxOption[];
  selected: string[];
  multiple?: boolean;
  disabled?: boolean;
  onSelect: (value: string) => void;
  /** Start with the popup open (docs / uncontrolled demos). */
  defaultOpen?: boolean;
  /** Extra key handling that runs before the listbox logic (return true to stop). */
  onExtraKey?: (e: KeyboardEvent<HTMLElement>) => boolean;
}

/**
 * Select-only combobox behaviour (WAI-ARIA APG "select-only combobox"):
 * focus stays on the trigger, the active option is exposed through
 * aria-activedescendant. ↑/↓/Home/End move, Enter/Space select, Esc/Tab close,
 * printable keys do a simple type-ahead.
 */
export function useListbox({
  id,
  options,
  selected,
  multiple = false,
  disabled = false,
  onSelect,
  onExtraKey,
  defaultOpen = false,
}: UseListboxArgs) {
  const [open, setOpen] = useState(defaultOpen && !disabled);
  const [activeIndex, setActiveIndex] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);
  const listboxId = `${id}-listbox`;
  const optionId = (i: number) => `${id}-opt-${i}`;

  const enabledStep = useCallback(
    (from: number, dir: 1 | -1) => {
      const n = options.length;
      if (!n) return -1;
      let i = from;
      for (let k = 0; k < n; k++) {
        i = (i + dir + n) % n;
        if (!options[i].disabled) return i;
      }
      return -1;
    },
    [options],
  );

  const firstIndex = () => enabledStep(-1, 1);
  const lastIndex = () => enabledStep(0, -1);
  const selectedIndex = () =>
    options.findIndex((o) => selected.includes(o.value) && !o.disabled);

  const openList = (index?: number) => {
    if (disabled) return;
    setOpen(true);
    const sel = selectedIndex();
    setActiveIndex(index ?? (sel >= 0 ? sel : firstIndex()));
  };
  const close = () => {
    setOpen(false);
    setActiveIndex(-1);
  };
  const toggle = () => (open ? close() : openList());

  const choose = (i: number) => {
    const opt = options[i];
    if (!opt || opt.disabled) return;
    onSelect(opt.value);
    if (!multiple) close();
    else setActiveIndex(i);
  };

  // Close on outside pointer down.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (rootRef.current?.contains(t)) return;
      // A floating listbox is portalled outside the root.
      if (document.getElementById(listboxId)?.contains(t)) return;
      close();
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  // Keep the active option visible.
  useEffect(() => {
    if (!open || activeIndex < 0) return;
    const el = document.getElementById(optionId(activeIndex));
    el?.scrollIntoView?.({ block: "nearest" });
  }, [open, activeIndex]);

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (disabled) return;
    if (onExtraKey?.(e)) return;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (!open) openList();
        else setActiveIndex((i) => enabledStep(i, 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        if (!open) openList();
        else setActiveIndex((i) => enabledStep(i < 0 ? 0 : i, -1));
        break;
      case "Home":
        if (open) {
          e.preventDefault();
          setActiveIndex(firstIndex());
        }
        break;
      case "End":
        if (open) {
          e.preventDefault();
          setActiveIndex(lastIndex());
        }
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (!open) openList();
        else if (activeIndex >= 0) choose(activeIndex);
        break;
      case "Escape":
        if (open) {
          e.preventDefault();
          e.stopPropagation();
          close();
        }
        break;
      case "Tab":
        if (open) close();
        break;
      default:
        if (e.key.length === 1 && !e.altKey && !e.ctrlKey && !e.metaKey) {
          const ch = e.key.toLowerCase();
          const start = activeIndex < 0 ? -1 : activeIndex;
          for (let k = 1; k <= options.length; k++) {
            const i = (start + k) % options.length;
            const o = options[i];
            if (!o.disabled && o.label.toLowerCase().startsWith(ch)) {
              if (!open) openList(i);
              else setActiveIndex(i);
              break;
            }
          }
        }
    }
  };

  return {
    open,
    activeIndex,
    setActiveIndex,
    openList,
    close,
    toggle,
    choose,
    onKeyDown,
    rootRef,
    listboxId,
    optionId,
  };
}
