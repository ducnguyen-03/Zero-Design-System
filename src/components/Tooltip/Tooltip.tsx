import {
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { CSSProperties, FocusEvent, KeyboardEvent, ReactElement, ReactNode } from "react";
import { createPortal } from "react-dom";
import styles from "./Tooltip.module.css";

export type TooltipPlacement = "top" | "bottom" | "left" | "right";
export type TooltipAlign = "start" | "center" | "end";
/** `dark` = off-black bubble (default, Figma); `light` = white bubble with a hairline, for dark or busy surfaces. */
export type TooltipAppearance = "dark" | "light";

export interface TooltipProps {
  /** Tooltip content. */
  label: ReactNode;
  /** The trigger. A single focusable element (button, link…) is preferred —
   *  it receives `aria-describedby`. Anything else gets wrapped in a focusable span. */
  children: ReactNode;
  /** Preferred side (Figma `Direction`). Flips to the opposite side when there is no room. */
  placement?: TooltipPlacement;
  /** Alignment along the trigger edge (Figma `Align`). The bubble still shifts to stay on screen. */
  align?: TooltipAlign;
  /** Figma `Lines=Multi Line`: wraps text with a 300px max width. */
  multiline?: boolean;
  appearance?: TooltipAppearance;
  /** Keyboard shortcut shown after the label, e.g. "⌘K". */
  shortcut?: string;
  /** Hover delay in ms before opening. Skipped while another tooltip was open moments ago. Default 350. */
  delay?: number;
  /** Force the tooltip visible (docs / controlled usage). */
  open?: boolean;
  className?: string;
}

const cx = (...parts: Array<string | false | undefined>) => parts.filter(Boolean).join(" ");

/* Moving between tooltipped controls (a toolbar, a row of tools) should not
   wait out the delay each time: if a tooltip closed within this window, open instantly. */
const WARM_MS = 500;
let lastClosedAt = 0;

const GAP = 8; // trigger ↔ bubble, includes the 5px arrow
const EDGE = 8; // keep this far from the viewport edge
const ARROW_INSET = 14; // the arrow never sits closer than this to a bubble corner

const OPPOSITE: Record<TooltipPlacement, TooltipPlacement> = {
  top: "bottom",
  bottom: "top",
  left: "right",
  right: "left",
};

interface Position {
  top: number;
  left: number;
  side: TooltipPlacement;
  arrow: number;
}

function computePosition(
  t: DOMRect,
  b: { width: number; height: number },
  placement: TooltipPlacement,
  align: TooltipAlign,
): Position {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const fits = (side: TooltipPlacement) =>
    side === "top"
      ? t.top - GAP - b.height >= EDGE
      : side === "bottom"
        ? t.bottom + GAP + b.height <= vh - EDGE
        : side === "left"
          ? t.left - GAP - b.width >= EDGE
          : t.right + GAP + b.width <= vw - EDGE;
  const side = fits(placement) || !fits(OPPOSITE[placement]) ? placement : OPPOSITE[placement];
  const vertical = side === "top" || side === "bottom";
  const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), Math.max(min, max));

  let top: number;
  let left: number;
  if (vertical) {
    top = side === "top" ? t.top - GAP - b.height : t.bottom + GAP;
    left =
      align === "start"
        ? t.left
        : align === "end"
          ? t.right - b.width
          : t.left + t.width / 2 - b.width / 2;
    left = clamp(left, EDGE, vw - EDGE - b.width);
  } else {
    left = side === "left" ? t.left - GAP - b.width : t.right + GAP;
    top =
      align === "start"
        ? t.top
        : align === "end"
          ? t.bottom - b.height
          : t.top + t.height / 2 - b.height / 2;
    top = clamp(top, EDGE, vh - EDGE - b.height);
  }
  // Arrow points at the trigger's centre wherever the bubble ended up.
  const arrow = vertical
    ? clamp(t.left + t.width / 2 - left, ARROW_INSET, b.width - ARROW_INSET)
    : clamp(t.top + t.height / 2 - top, ARROW_INSET, b.height - ARROW_INSET);
  return { top, left, side, arrow };
}

/**
 * Tooltip — a short label for a control, on hover (after a short delay) and keyboard focus.
 * Rendered in a layer above the page so containers never clip it; it flips and shifts to
 * stay on screen, and its arrow keeps pointing at the trigger. Escape dismisses it.
 */
export function Tooltip({
  label,
  children,
  placement = "top",
  align = "center",
  multiline = false,
  appearance = "dark",
  shortcut,
  delay = 350,
  open: forced,
  className,
}: TooltipProps) {
  const id = useId();
  const wrapRef = useRef<HTMLSpanElement>(null);
  const bubbleRef = useRef<HTMLSpanElement>(null);
  const timer = useRef<number | undefined>(undefined);
  const [shown, setShown] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [pos, setPos] = useState<Position | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const visible = forced ?? (shown && !dismissed);

  const clear = () => window.clearTimeout(timer.current);
  const show = useCallback(
    (immediate: boolean) => {
      clear();
      const warm = Date.now() - lastClosedAt < WARM_MS;
      if (immediate || warm || delay <= 0) setShown(true);
      else timer.current = window.setTimeout(() => setShown(true), delay);
    },
    [delay],
  );
  const shownRef = useRef(false);
  shownRef.current = shown;
  const hide = useCallback(() => {
    clear();
    if (shownRef.current) lastClosedAt = Date.now();
    setShown(false);
    setDismissed(false);
  }, []);
  useEffect(() => clear, []);

  // Position while visible; follow scroll and resize.
  useLayoutEffect(() => {
    if (!visible) return;
    const place = () => {
      const w = wrapRef.current;
      const bb = bubbleRef.current;
      if (!w || !bb) return;
      const anchor = (w.firstElementChild as HTMLElement | null) ?? w;
      setPos(computePosition(anchor.getBoundingClientRect(), { width: bb.offsetWidth, height: bb.offsetHeight }, placement, align));
    };
    place();
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    return () => {
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
    };
  }, [visible, mounted, placement, align, label, multiline, shortcut]);

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape" && visible) {
      e.stopPropagation();
      setDismissed(true);
    }
  };
  const onFocus = (e: FocusEvent) => {
    // Keyboard focus only — a mouse click focusing the button should not pop a tooltip.
    const target = e.target as HTMLElement;
    if (target.matches?.(":focus-visible")) show(true);
  };

  const focusableChild = isValidElement(children);
  const trigger = focusableChild
    ? cloneElement(children as ReactElement<{ "aria-describedby"?: string }>, { "aria-describedby": id })
    : children;

  const style = pos
    ? ({ top: pos.top, left: pos.left, "--tooltip-arrow-offset": `${pos.arrow}px` } as CSSProperties)
    : undefined;

  const bubble = (
    <span
      ref={bubbleRef}
      role="tooltip"
      id={id}
      className={cx(styles.bubble, styles[appearance], multiline && styles.multi)}
      data-side={pos?.side ?? placement}
      data-state={visible && pos ? "open" : "closed"}
      style={style}
    >
      <span className={styles.text}>{label}</span>
      {shortcut ? (
        <kbd className={styles.kbd} aria-label={`Shortcut ${shortcut}`}>
          {shortcut}
        </kbd>
      ) : null}
      <span className={styles.arrow} aria-hidden="true" />
    </span>
  );

  return (
    <span
      ref={wrapRef}
      className={cx(styles.wrap, className)}
      onPointerEnter={(e) => e.pointerType !== "touch" && show(false)}
      onPointerLeave={hide}
      onFocus={onFocus}
      onBlur={hide}
      onKeyDown={onKeyDown}
      {...(focusableChild ? {} : { tabIndex: 0, "aria-describedby": id })}
    >
      {trigger}
      {mounted ? createPortal(bubble, document.body) : null}
    </span>
  );
}
