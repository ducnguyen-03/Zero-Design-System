import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { driver } from "driver.js";
import type { Alignment, Driver, DriveStep, Side } from "driver.js";
import "driver.js/dist/driver.css";
import { TourCard } from "./TourCard";
import type { TourIconName } from "./TourCard";
import { TourSkipConfirm } from "./TourModals";

export type TourPlacement = "top" | "bottom" | "left" | "right" | "inside";
/** `illustrated` — picture header (light card); `light` / `dark` — icon above the title. */
export type TourTheme = "illustrated" | "light" | "dark";

export interface TourStep {
  /** CSS selector of what to spotlight, e.g. `[data-tour="kpi"]`. Several matches are framed together. */
  target: string;
  title: ReactNode;
  body: ReactNode;
  /** Side of the target the card sits on; flips when there is no room. `inside` = the target's
   *  bottom-right corner, for targets as large as a whole panel. Default `bottom`. */
  placement?: TourPlacement;
  /** Card alignment along that side. Default `center`. */
  align?: Alignment;
  /** Shown by the `light` and `dark` themes. */
  icon?: TourIconName | ReactNode;
  /** Shown by the `illustrated` theme — e.g. `<TourIllustration name="search" />`. */
  illustration?: ReactNode;
  /** Runs before the step is highlighted — e.g. switch to the tab the target lives on. */
  onEnter?: () => void;
}

export interface OnboardingTourProps {
  open: boolean;
  steps: TourStep[];
  /** `finish` after the last step, `skip` when the user leaves early. */
  onClose: (reason: "finish" | "skip") => void;
  /** Controlled step. */
  step?: number;
  onStepChange?: (step: number) => void;
  /** Default `illustrated`. */
  theme?: TourTheme;
  /** `false` drops icons and pictures — text-only cards. Default true. */
  showMedia?: boolean;
  /** Ask "Skip the tour?" before leaving early. Default true. */
  confirmSkip?: boolean;
  /** Where the user can replay it — said in the skip confirmation. */
  replayHint?: ReactNode;
  /** Label of the last step's button. Default "Start exploring". */
  finishLabel?: string;
}

const SIDE: Record<TourPlacement, Side> = { top: "top", bottom: "bottom", left: "left", right: "right", inside: "bottom" };
const PROXY_ID = "cci-tour-proxy";

/** The target, or — when the selector matches several elements — a frame around all of them. */
function resolveTarget(selector: string): Element {
  document.getElementById(PROXY_ID)?.remove();
  const els = Array.from(document.querySelectorAll(selector));
  if (els.length <= 1) return els[0] ?? document.body;
  els[0].scrollIntoView({ block: "nearest" });
  const rects = els.map((el) => el.getBoundingClientRect());
  const l = Math.min(...rects.map((r) => r.left));
  const t = Math.min(...rects.map((r) => r.top));
  const r = Math.max(...rects.map((q) => q.right));
  const b = Math.max(...rects.map((q) => q.bottom));
  const proxy = document.createElement("div");
  proxy.id = PROXY_ID;
  proxy.setAttribute("aria-hidden", "true");
  Object.assign(proxy.style, {
    position: "absolute",
    left: `${l + window.scrollX}px`,
    top: `${t + window.scrollY}px`,
    width: `${r - l}px`,
    height: `${b - t}px`,
    borderRadius: "10px",
    pointerEvents: "none",
  });
  document.body.appendChild(proxy);
  return proxy;
}

/** `inside`: pin the card to the target's bottom-right corner, as the design does for whole panels. */
function placeInside(wrapper: HTMLElement | undefined, target: Element | undefined) {
  if (!wrapper || !target) return;
  const M = 16;
  const r = target.getBoundingClientRect();
  const w = wrapper.offsetWidth;
  const h = wrapper.offsetHeight;
  const left = Math.max(M, Math.min(r.right + 6 - w - 24, window.innerWidth - w - M));
  const top = Math.max(M, Math.min(r.bottom + 6, window.innerHeight) - h - 24);
  Object.assign(wrapper.style, { left: `${left}px`, top: `${top}px`, right: "auto", bottom: "auto" });
  wrapper.querySelector(".driver-popover-arrow")?.setAttribute("class", "driver-popover-arrow driver-popover-arrow-none");
}

/**
 * The guided tour over the real interface (Claude Design *Insights Onboarding*). **driver.js** dims
 * the page, cuts out the target with a yellow ring and places the card; the card itself is a React
 * `TourCard` — illustrated, icon or text-only, light or dark. ← → move, Escape or ✕ ask
 * "Skip the tour?". Mark targets with `data-tour="…"`.
 */
export function OnboardingTour({
  open,
  steps,
  onClose,
  step,
  onStepChange,
  theme = "illustrated",
  showMedia = true,
  confirmSkip = true,
  replayHint,
  finishLabel,
}: OnboardingTourProps) {
  const drv = useRef<Driver | null>(null);
  const cardRoot = useRef<Root | null>(null);
  const finishing = useRef(false);
  const endRef = useRef<(reason: "finish" | "skip") => void>(() => {});
  const [asking, setAsking] = useState(false);
  // driver.js hooks are bound once per tour; read the latest props through this ref.
  const cb = useRef({ onClose, onStepChange, confirmSkip, steps });
  cb.current = { onClose, onStepChange, confirmSkip, steps };

  useEffect(() => {
    if (!open || !steps.length) return;
    finishing.current = false;
    const unmountCard = () => {
      const r = cardRoot.current;
      cardRoot.current = null;
      if (r) queueMicrotask(() => r.unmount());
    };
    const ask = () => (cb.current.confirmSkip ? setAsking(true) : endTour("skip"));
    let reInside: (() => void) | null = null;

    const driveSteps: DriveStep[] = steps.map((s) => ({
      // onEnter first (e.g. switch tab), rendered synchronously so the target exists when it is looked up.
      element: () => {
        if (s.onEnter) flushSync(s.onEnter);
        return resolveTarget(s.target);
      },
      onHighlighted: (el) => {
        if (s.placement !== "inside") return;
        placeInside(d.getState("popover")?.wrapper, el);
      },
      // driver.js only honours ← → for buttons it shows; its footer is hidden by CSS and the card has its own.
      popover: { side: SIDE[s.placement ?? "bottom"], align: s.align ?? "center", showButtons: ["next", "previous", "close"] },
    }));

    const d = driver({
      steps: driveSteps,
      animate: !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      overlayColor: "rgb(2, 32, 52)",
      overlayOpacity: 0.6,
      stagePadding: 6,
      stageRadius: 10,
      popoverOffset: 12,
      allowClose: true,
      overlayClickBehavior: "none",
      disableActiveInteraction: true,
      popoverClass: `cci-tour cci-tour--${theme === "dark" ? "dark" : "light"}`,
      onPopoverRender: (popover, { state }) => {
        const index = state.activeIndex ?? 0;
        const total = cb.current.steps.length;
        const s = cb.current.steps[index];
        unmountCard();
        const host = document.createElement("div");
        host.className = "cci-tour__host";
        popover.wrapper.appendChild(host);
        popover.wrapper.setAttribute("aria-labelledby", "cci-tour-title");
        popover.wrapper.setAttribute("aria-describedby", "cci-tour-body");
        popover.wrapper.setAttribute("aria-modal", "true");
        const root = createRoot(host);
        // Synchronous, so driver.js measures the real card when it positions it.
        flushSync(() =>
          root.render(
            <TourCard
              role="group"
              labelId="cci-tour"
              title={s.title}
              body={s.body}
              step={index}
              total={total}
              tone={theme === "dark" ? "dark" : "light"}
              illustration={showMedia && theme === "illustrated" ? s.illustration : undefined}
              icon={showMedia && (theme !== "illustrated" || !s.illustration) ? s.icon : undefined}
              nextLabel={index === total - 1 ? finishLabel : undefined}
              onNext={() => (index === total - 1 ? endTour("finish") : d.moveNext())}
              onBack={() => d.movePrevious()}
              onSkip={ask}
              onClose={() => (index === total - 1 ? endTour("finish") : ask())}
            />,
          ),
        );
        cardRoot.current = root;
        // Next is where the keyboard starts, as in the design.
        requestAnimationFrame(() => host.querySelector<HTMLButtonElement>("[data-tour-next]")?.focus());
        cb.current.onStepChange?.(index);
      },
      // Escape (and the arrow past the last step) land here.
      onDestroyStarted: () => {
        if (d.isLastStep()) endTour("finish");
        else ask();
      },
    });

    // driver.js's public destroy() skips onDestroyStarted, so every exit goes through here.
    const endTour = (reason: "finish" | "skip") => {
      if (finishing.current) return;
      finishing.current = true;
      unmountCard();
      d.destroy();
      document.getElementById(PROXY_ID)?.remove();
      cb.current.onClose(reason);
    };
    endRef.current = endTour;

    // Re-pin `inside` cards after driver.js repositions on resize / scroll.
    reInside = () =>
      requestAnimationFrame(() => {
        const i = d.getActiveIndex();
        if (i !== undefined && cb.current.steps[i]?.placement === "inside") placeInside(d.getState("popover")?.wrapper, d.getActiveElement());
      });
    window.addEventListener("resize", reInside);
    window.addEventListener("scroll", reInside, true);

    drv.current = d;
    // Start outside React's commit phase, where flushSync (used to render the card) is a no-op.
    const start = window.setTimeout(() => d.drive(step ?? 0));
    return () => {
      window.clearTimeout(start);
      finishing.current = true;
      if (reInside) {
        window.removeEventListener("resize", reInside);
        window.removeEventListener("scroll", reInside, true);
      }
      unmountCard();
      if (d.isActive()) d.destroy();
      document.getElementById(PROXY_ID)?.remove();
      drv.current = null;
    };
    // The tour is rebuilt when it opens, its steps change or its look changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, steps, theme, showMedia]);

  // Controlled step.
  useEffect(() => {
    const d = drv.current;
    if (!d || step === undefined) return;
    const t = window.setTimeout(() => {
      if (d.isActive() && d.getActiveIndex() !== step) d.moveTo(step);
    });
    return () => window.clearTimeout(t);
  }, [step]);

  useEffect(() => {
    if (!open) setAsking(false);
  }, [open]);

  // While asking, keep ← → Escape from reaching driver.js (it listens on window).
  useEffect(() => {
    if (!asking) return;
    const stop = (e: KeyboardEvent) => {
      if (!["Escape", "ArrowLeft", "ArrowRight"].includes(e.key)) return;
      e.stopImmediatePropagation();
      if (e.key === "Escape" && e.type === "keyup") {
        setAsking(false);
        drv.current?.refresh();
      }
    };
    window.addEventListener("keyup", stop, true);
    window.addEventListener("keydown", stop, true);
    return () => {
      window.removeEventListener("keyup", stop, true);
      window.removeEventListener("keydown", stop, true);
    };
  }, [asking]);

  return (
    <TourSkipConfirm
      open={asking}
      hint={replayHint}
      onContinue={() => {
        setAsking(false);
        drv.current?.refresh();
      }}
      onSkip={() => {
        setAsking(false);
        endRef.current("skip");
      }}
    />
  );
}
