import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { PointerEvent as ReactPointerEvent, ReactNode } from "react";
import { createPortal } from "react-dom";
import { Toast } from "./Toast";
import type { ToastAction, ToastColor } from "./Toast";
import styles from "./Toaster.module.css";

export type ToasterPlacement = "top-right" | "top-center" | "bottom-right" | "bottom-center";

export interface ToastOptions {
  color?: ToastColor;
  title?: ReactNode;
  /** Message / description. */
  message?: ReactNode;
  /** Text action; clicking it also dismisses the toast. */
  action?: ToastAction;
  /** ms before auto-dismiss. Defaults to 5000, or 8000 for danger / warning. `Infinity` keeps it until closed. */
  duration?: number;
  /** Show the close button (default `true`). */
  dismissible?: boolean;
  icon?: ReactNode;
  /** Pass an existing id to update that toast in place instead of stacking a new one. */
  id?: string;
}

interface ToastRecord extends ToastOptions {
  id: string;
  closing: boolean;
}

interface ToastApi {
  /** Shows a toast and returns its id. */
  toast: (options: ToastOptions) => string;
  dismiss: (id?: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

/** Fire and dismiss toasts from anywhere under `<Toaster>`. */
export function useToast(): ToastApi {
  const api = useContext(ToastContext);
  if (!api) throw new Error("useToast must be used inside <Toaster>.");
  return api;
}

export interface ToasterProps {
  children?: ReactNode;
  placement?: ToasterPlacement;
  /** Older toasts beyond this count are dismissed (default 3). */
  max?: number;
  /** Accessible name of the notifications region. */
  label?: string;
}

const EXIT_MS = 200;
const SWIPE_DISMISS_PX = 80;
let seq = 0;

const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Provider + fixed viewport for transient toasts. Timers pause while the stack is
 * hovered or focused and while the tab is hidden; F8 moves focus to the stack,
 * Escape dismisses the focused toast, and touch users can swipe one away.
 * Announcements go through two persistent live regions, so screen readers hear
 * every toast regardless of when it mounts.
 */
export function Toaster({ children, placement = "bottom-right", max = 3, label = "Notifications" }: ToasterProps) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [announce, setAnnounce] = useState({ polite: "", assertive: "" });
  const [mounted, setMounted] = useState(false);
  const listRef = useRef<HTMLOListElement>(null);

  useEffect(() => setMounted(true), []);

  const remove = useCallback((id: string) => setToasts((all) => all.filter((t) => t.id !== id)), []);

  const dismiss = useCallback(
    (id?: string) => {
      setToasts((all) => all.map((t) => (id === undefined || t.id === id ? { ...t, closing: true } : t)));
      const ids = id === undefined ? null : [id];
      window.setTimeout(
        () => setToasts((all) => all.filter((t) => !(t.closing && (ids === null || ids.includes(t.id))))),
        reducedMotion() ? 0 : EXIT_MS,
      );
    },
    [],
  );

  const toast = useCallback(
    (options: ToastOptions) => {
      const id = options.id ?? `toast-${++seq}`;
      setToasts((all) => {
        if (all.some((t) => t.id === id)) {
          return all.map((t) => (t.id === id ? { ...t, ...options, id, closing: false } : t));
        }
        const next = [...all, { ...options, id, closing: false }];
        const open = next.filter((t) => !t.closing);
        const overflow = open.slice(0, Math.max(0, open.length - max)).map((t) => t.id);
        overflow.forEach((oid) => window.setTimeout(() => remove(oid), reducedMotion() ? 0 : EXIT_MS));
        return next.map((t) => (overflow.includes(t.id) ? { ...t, closing: true } : t));
      });
      return id;
    },
    [max, remove],
  );

  useEffect(() => {
    const onVisibility = () => setHidden(document.visibilityState === "hidden");
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "F8") {
        e.preventDefault();
        listRef.current?.querySelector<HTMLElement>("[data-toast-item]")?.focus();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  // Once a toast has rendered, read its text back out for the live region.
  const announced = useRef(new Set<string>());
  useEffect(() => {
    const fresh = toasts.filter((t) => !t.closing && !announced.current.has(t.id));
    if (!fresh.length || !listRef.current) return;
    for (const t of fresh) {
      announced.current.add(t.id);
      const body = listRef.current.querySelector(`[data-toast-id="${t.id}"] [data-toast-body]`);
      const text = body?.textContent?.trim() ?? "";
      if (!text) continue;
      const assertive = t.color === "danger" || t.color === "warning";
      // Clearing first lets a repeated identical message announce again.
      setAnnounce((a) => ({ ...a, [assertive ? "assertive" : "polite"]: "" }));
      window.setTimeout(() => setAnnounce((a) => ({ ...a, [assertive ? "assertive" : "polite"]: text })), 50);
    }
  }, [toasts]);

  const api = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);
  const paused = hovered || focused || hidden;

  const viewport = (
    <section
      className={styles.viewport}
      data-placement={placement}
      aria-label={`${label} (F8)`}
      tabIndex={-1}
    >
      <ol
        ref={listRef}
        className={styles.list}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onFocus={() => setFocused(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
        }}
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} record={t} paused={paused} onDismiss={dismiss} />
        ))}
      </ol>
      <div className={styles.srOnly} aria-live="polite" aria-atomic="true">
        {announce.polite}
      </div>
      <div className={styles.srOnly} aria-live="assertive" aria-atomic="true">
        {announce.assertive}
      </div>
    </section>
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      {mounted ? createPortal(viewport, document.body) : null}
    </ToastContext.Provider>
  );
}

function ToastItem({
  record,
  paused,
  onDismiss,
}: {
  record: ToastRecord;
  paused: boolean;
  onDismiss: (id: string) => void;
}) {
  const { id, color = "neutral", title, message, action, icon, dismissible = true, closing } = record;
  const duration = record.duration ?? (color === "danger" || color === "warning" ? 8000 : 5000);

  // Remaining-time timer that survives pauses.
  const remaining = useRef(duration);
  useEffect(() => {
    remaining.current = duration;
  }, [duration, title, message]);
  useEffect(() => {
    if (paused || closing || !Number.isFinite(duration)) return;
    const started = Date.now();
    const timer = window.setTimeout(() => onDismiss(id), remaining.current);
    return () => {
      window.clearTimeout(timer);
      remaining.current -= Date.now() - started;
    };
  }, [paused, closing, duration, id, onDismiss, title, message]);

  // Touch swipe-to-dismiss (horizontal).
  const [dragX, setDragX] = useState(0);
  const drag = useRef<{ x: number; pointer: number } | null>(null);
  const onPointerDown = (e: ReactPointerEvent<HTMLLIElement>) => {
    if (e.pointerType === "mouse" || (e.target as HTMLElement).closest("button")) return;
    drag.current = { x: e.clientX, pointer: e.pointerId };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLLIElement>) => {
    if (drag.current?.pointer === e.pointerId) setDragX(e.clientX - drag.current.x);
  };
  const endDrag = () => {
    if (!drag.current) return;
    drag.current = null;
    if (Math.abs(dragX) > SWIPE_DISMISS_PX) onDismiss(id);
    else setDragX(0);
  };

  return (
    <li
      className={styles.item}
      data-toast-item=""
      data-toast-id={id}
      data-state={closing ? "closed" : "open"}
      data-swiping={dragX ? "" : undefined}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Escape" && dismissible) {
          e.stopPropagation();
          onDismiss(id);
        }
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      style={
        dragX
          ? { transform: `translateX(${dragX}px)`, opacity: Math.max(0, 1 - Math.abs(dragX) / 240) }
          : undefined
      }
    >
      <div className={styles.inner}>
        <Toast
          // Announced by the Toaster's live regions instead, so mount timing never swallows it.
          role={undefined}
          aria-live={undefined}
          color={color}
          title={title}
          icon={icon}
          action={
            action
              ? {
                  label: action.label,
                  onClick: () => {
                    action.onClick();
                    onDismiss(id);
                  },
                }
              : undefined
          }
          onClose={dismissible ? () => onDismiss(id) : undefined}
        >
          {message}
        </Toast>
      </div>
    </li>
  );
}
