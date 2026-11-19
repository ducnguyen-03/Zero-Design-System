import { useEffect, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent, PointerEvent } from "react";
import { ChevronDown, Info, Lock, ShieldCheck } from "lucide-react";
import { Tooltip } from "../../../../components/Tooltip/Tooltip";
import { PHI_HELP, PHI_LEVELS, PHI_NAMES } from "../phi";
import type { PhiLevel } from "../phi";
import styles from "../OverviewView.module.css";

const cx = (...p: Array<string | false | undefined | null>) => p.filter(Boolean).join(" ");
const LOCK_TIP = "Needs PHI access";

export interface PhiSliderProps {
  /** Overall width in px (track = width − 60). */
  width: number;
  level: PhiLevel;
  /** Holds pii.read — otherwise the slider is locked at Codified. */
  pii: boolean;
  onChange: (level: PhiLevel) => void;
}

/** Four-stop PHI display level slider (2b): drag, click a stop, or use the arrow keys. */
export function PhiSlider({ width, level, pii, onChange }: PhiSliderProps) {
  const idx = PHI_LEVELS.indexOf(level);
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x0: number } | null>(null);
  const [dragX, setDragX] = useState<number | null>(null);

  const T = width - 60;
  const step = T / 3;
  const pos = dragX != null ? Math.max(0, Math.min(T, dragX - 30)) : step * idx;

  const fromX = (clientX: number, dragging: boolean) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const i = Math.max(0, Math.min(3, Math.round((clientX - r.left - 30) / step)));
    if (dragging) setDragX(clientX - r.left);
    if (PHI_LEVELS[i] !== level) onChange(PHI_LEVELS[i]);
  };

  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!pii) return;
    drag.current = { x0: e.clientX };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* not capturable */
    }
    fromX(e.clientX, false);
  };
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    if (dragX == null && Math.abs(e.clientX - drag.current.x0) < 4) return;
    fromX(e.clientX, true);
  };
  const onUp = () => {
    drag.current = null;
    setDragX(null);
  };
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!pii) return;
    let n: number | null = null;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") n = Math.min(3, idx + 1);
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") n = Math.max(0, idx - 1);
    else if (e.key === "Home") n = 0;
    else if (e.key === "End") n = 3;
    if (n !== null) {
      e.preventDefault();
      onChange(PHI_LEVELS[n]);
    }
  };

  const dragging = dragX != null;
  return (
    <div
      ref={ref}
      role="slider"
      tabIndex={pii ? 0 : -1}
      aria-label="PHI display level"
      aria-valuemin={0}
      aria-valuemax={3}
      aria-valuenow={idx}
      aria-valuetext={PHI_NAMES[idx]}
      aria-disabled={!pii || undefined}
      className={cx(styles.phiSlider, !pii && styles.phiSliderLocked, dragging && styles.phiSliderDragging)}
      style={{ width, "--phi-track": `${T}px`, "--phi-pos": `${pos}px` } as CSSProperties}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      onKeyDown={onKey}
    >
      <span className={styles.phiTrack} aria-hidden="true" />
      <span className={styles.phiFill} aria-hidden="true" />
      {PHI_NAMES.map((label, i) => (
        <span key={label} aria-hidden="true">
          <span className={cx(styles.phiDot, pii && i <= idx && styles.phiDotOn)} style={{ left: 30 + step * i - 3 }} />
          <span className={cx(styles.phiStop, i === idx && styles.phiStopOn)} style={{ left: 30 + step * i }}>
            {label}
          </span>
        </span>
      ))}
      <span className={styles.phiKnob} aria-hidden="true" />
    </div>
  );
}

/** Toolbar version B: shield + "PHI" label + inline slider. */
export function PhiInline({ level, pii, onChange }: Omit<PhiSliderProps, "width">) {
  const body = (
    <div className={styles.phiInline}>
      <div className={cx(styles.phiLabel, !pii && styles.phiLabelLocked)}>
        <ShieldCheck size={20} strokeWidth={1.67} aria-hidden="true" />
        <span>PHI</span>
        {!pii ? <Lock size={20} strokeWidth={1.67} className={styles.lockInk} aria-hidden="true" /> : null}
      </div>
      <PhiSlider width={240} level={level} pii={pii} onChange={onChange} />
    </div>
  );
  return pii ? body : <Tooltip label={LOCK_TIP} appearance="light">{body}</Tooltip>;
}

export interface PhiButtonProps extends Omit<PhiSliderProps, "width"> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Toolbar version A: "PHI [level]" button opening a popover with the slider and help (2c). */
export function PhiButton({ level, pii, onChange, open, onOpenChange }: PhiButtonProps) {
  const wrap = useRef<HTMLDivElement>(null);
  const hoverT = useRef<number | undefined>(undefined);
  const via = useRef<"hover" | "click">("click");
  const idx = PHI_LEVELS.indexOf(level);
  const [mounted, setMounted] = useState(open);

  useEffect(() => {
    if (open) {
      setMounted(true);
      return;
    }
    const t = window.setTimeout(() => setMounted(false), 200);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrap.current && e.target instanceof Node && !wrap.current.contains(e.target)) onOpenChange(false);
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("mousedown", onDown, true);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown, true);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onOpenChange]);
  useEffect(() => () => window.clearTimeout(hoverT.current), []);

  const toggle = () => {
    window.clearTimeout(hoverT.current);
    if (open && via.current === "hover") {
      via.current = "click";
      return;
    }
    via.current = "click";
    onOpenChange(!open);
  };

  return (
    <div
      ref={wrap}
      className={styles.popAnchor}
      onMouseEnter={() => {
        window.clearTimeout(hoverT.current);
        if (!open)
          hoverT.current = window.setTimeout(() => {
            via.current = "hover";
            onOpenChange(true);
          }, 150);
      }}
      onMouseLeave={() => {
        window.clearTimeout(hoverT.current);
        if (open && via.current === "hover") hoverT.current = window.setTimeout(() => onOpenChange(false), 200);
      }}
    >
      <button type="button" className={styles.tbtn} aria-haspopup="dialog" aria-expanded={open} onClick={toggle}>
        <ShieldCheck size={20} strokeWidth={1.67} aria-hidden="true" />
        <span className={styles.tbtnLabelStrong}>PHI</span>
        <span className={styles.greyChip}>{pii ? PHI_NAMES[idx] : "Locked"}</span>
        {!pii ? <Lock size={20} strokeWidth={1.67} className={styles.lockInk} aria-hidden="true" /> : null}
        <ChevronDown size={20} strokeWidth={1.67} className={cx(styles.chev, open && styles.chevOpen)} aria-hidden="true" />
      </button>
      {mounted ? (
        <div role="dialog" aria-label="PHI display level" className={cx(styles.phiPop, open ? styles.dropIn : styles.dropOut)}>
          <div className={styles.phiPopHead}>
            <ShieldCheck size={16} strokeWidth={1.67} aria-hidden="true" />
            <span>PHI display level</span>
          </div>
          {pii ? (
            <PhiSlider width={368} level={level} pii={pii} onChange={onChange} />
          ) : (
            <Tooltip label={LOCK_TIP} appearance="light">
              <PhiSlider width={368} level={level} pii={pii} onChange={onChange} />
            </Tooltip>
          )}
          <div className={styles.phiHelp}>
            <Info size={16} strokeWidth={1.67} aria-hidden="true" />
            <span>{pii ? PHI_HELP[level] : PHI_HELP.locked}</span>
          </div>
          <p className={styles.phiFoot}>Applies on screen only. Generated reports and exports keep the full record.</p>
        </div>
      ) : null}
    </div>
  );
}
