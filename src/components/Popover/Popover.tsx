import {
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import type { KeyboardEvent, MouseEvent, ReactElement, ReactNode } from "react";
import { X } from "lucide-react";
import styles from "./Popover.module.css";

/** Side of the trigger the panel opens on. The arrow sits on the opposite edge
 *  (Figma `Direction` names the arrow edge: placement="bottom" = Direction=Top). */
export type PopoverPlacement = "top" | "bottom" | "left" | "right";
/** Where the arrow sits along the panel edge; it always points at the trigger centre. */
export type PopoverAlign = "start" | "center" | "end";

type TriggerProps = {
  onClick?: (e: MouseEvent<HTMLElement>) => void;
  "aria-expanded"?: boolean;
  "aria-controls"?: string;
  "aria-haspopup"?: "dialog";
};

export interface PopoverProps {
  /** A single clickable element (e.g. a Button). Receives onClick + aria-expanded/controls. */
  trigger: ReactElement<TriggerProps>;
  /** Bold heading; also the dialog's accessible name. */
  title?: ReactNode;
  /** Body copy / content. */
  children?: ReactNode;
  /** Footer slot, right-aligned (e.g. Cancel + Save buttons). */
  footer?: ReactNode;
  placement?: PopoverPlacement;
  align?: PopoverAlign;
  /** Controlled open state. */
  open?: boolean;
  /** Uncontrolled initial state. */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Show the × close button (default true). */
  showClose?: boolean;
  closeLabel?: string;
  /** Accessible name when there is no `title`. */
  "aria-label"?: string;
  className?: string;
}

const cx = (...parts: Array<string | false | undefined>) =>
  parts.filter(Boolean).join(" ");

/**
 * Anchored popup panel (white, radius 8, arrow). Opens on trigger click; closes
 * on Escape, outside click or the × button, returning focus to the trigger.
 */
export function Popover({
  trigger,
  title,
  children,
  footer,
  placement = "bottom",
  align = "start",
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  showClose = true,
  closeLabel = "Close",
  "aria-label": ariaLabel,
  className,
}: PopoverProps) {
  const id = useId();
  const panelId = `${id}-panel`;
  const titleId = `${id}-title`;
  const rootRef = useRef<HTMLSpanElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [uncontrolled, setUncontrolled] = useState(defaultOpen);
  const controlled = openProp !== undefined;
  const open = controlled ? openProp : uncontrolled;

  const setOpen = useCallback(
    (next: boolean) => {
      if (!controlled) setUncontrolled(next);
      onOpenChange?.(next);
    },
    [controlled, onOpenChange],
  );

  const close = useCallback(
    (restoreFocus: boolean) => {
      setOpen(false);
      if (restoreFocus) {
        const t = rootRef.current?.querySelector<HTMLElement>("[data-popover-trigger]");
        t?.focus();
      }
    },
    [setOpen],
  );

  // Outside click
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) close(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open, close]);

  // Move focus into the panel when it opens
  useEffect(() => {
    if (open) panelRef.current?.focus({ preventScroll: true });
  }, [open]);

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape" && open) {
      e.stopPropagation();
      close(true);
    }
  };

  const triggerEl = isValidElement(trigger)
    ? cloneElement(trigger, {
        onClick: (e: MouseEvent<HTMLElement>) => {
          trigger.props.onClick?.(e);
          setOpen(!open);
        },
        "aria-expanded": open,
        "aria-controls": panelId,
        "aria-haspopup": "dialog",
        "data-popover-trigger": "",
      } as TriggerProps)
    : trigger;

  return (
    <span
      ref={rootRef}
      className={styles.root}
      data-placement={placement}
      data-align={align}
      onKeyDown={onKeyDown}
    >
      {triggerEl}
      <div
        ref={panelRef}
        id={panelId}
        role="dialog"
        aria-labelledby={title ? titleId : undefined}
        aria-label={title ? undefined : ariaLabel}
        tabIndex={-1}
        hidden={!open}
        className={cx(styles.panel, className)}
      >
        {title || showClose ? (
          <div className={styles.header}>
            {title ? (
              <p id={titleId} className={styles.title}>
                {title}
              </p>
            ) : (
              <span />
            )}
            {showClose ? (
              <button
                type="button"
                className={styles.close}
                aria-label={closeLabel}
                onClick={() => close(true)}
              >
                <X aria-hidden="true" />
              </button>
            ) : null}
          </div>
        ) : null}
        {children ? <div className={styles.body}>{children}</div> : null}
        {footer ? <div className={styles.footer}>{footer}</div> : null}
        <span className={styles.arrow} aria-hidden="true" />
      </div>
    </span>
  );
}
