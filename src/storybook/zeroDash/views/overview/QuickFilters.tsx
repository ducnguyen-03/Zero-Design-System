import { useEffect, useRef, useState } from "react";
import { ChevronDown, Zap } from "lucide-react";
import type { QuickFilter } from "../overviewData";
import styles from "../OverviewView.module.css";

const cx = (...p: Array<string | false | undefined | null>) => p.filter(Boolean).join(" ");

export interface QuickFiltersProps {
  toolbar: "A" | "B";
  /** Display order (version A promotes a picked hidden filter into the visible row). */
  order: QuickFilter[];
  selected: Partial<Record<QuickFilter, boolean>>;
  onToggle: (k: QuickFilter) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Multi-select quick filters (AND). Version B: a toolbar button with a pill card below.
 * Version A: the first pills inline, "+ N more" grows the card in place.
 */
export function QuickFilters({ toolbar, order, selected, onToggle, open, onOpenChange }: QuickFiltersProps) {
  const wrap = useRef<HTMLDivElement>(null);
  const hoverT = useRef<number | undefined>(undefined);
  const via = useRef<"hover" | "click">("click");
  const [mounted, setMounted] = useState(open);
  const activeN = order.filter((k) => selected[k]).length;
  const visN = Math.min(order.length, Math.max(3, activeN));

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
    const onKey = (e: KeyboardEvent) => {
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

  const hover = {
    onMouseEnter: () => {
      window.clearTimeout(hoverT.current);
      if (!open)
        hoverT.current = window.setTimeout(() => {
          via.current = "hover";
          onOpenChange(true);
        }, 150);
    },
    onMouseLeave: () => {
      window.clearTimeout(hoverT.current);
      if (open && via.current === "hover") hoverT.current = window.setTimeout(() => onOpenChange(false), 200);
    },
  };
  const click = () => {
    window.clearTimeout(hoverT.current);
    if (open && via.current === "hover") {
      via.current = "click";
      return;
    }
    via.current = "click";
    onOpenChange(!open);
  };

  const pill = (k: QuickFilter, i: number, inCard: boolean) => (
    <button
      key={k}
      type="button"
      className={cx(styles.qpill, inCard && i >= visN && styles.qpillStagger)}
      style={inCard && i >= visN ? { animationDelay: `${(i - visN) * 40}ms` } : undefined}
      aria-pressed={!!selected[k]}
      tabIndex={!inCard && open && toolbar === "A" ? -1 : 0}
      onClick={() => onToggle(k)}
    >
      {k}
    </button>
  );

  if (toolbar === "B") {
    return (
      <div ref={wrap} className={styles.popAnchor} {...hover}>
        <button type="button" className={styles.tbtn} aria-haspopup="true" aria-expanded={open} onClick={click}>
          <Zap size={20} strokeWidth={1.67} aria-hidden="true" />
          <span className={styles.tbtnLabel}>Quick filters</span>
          {activeN ? <span className={styles.greenCount}>{activeN}</span> : null}
          <ChevronDown size={20} strokeWidth={1.67} className={cx(styles.chev, open && styles.chevOpen)} aria-hidden="true" />
        </button>
        {mounted ? (
          <div role="group" aria-label="Quick filters" className={cx(styles.qCardB, open ? styles.dropIn : styles.dropOut)}>
            {order.map((k, i) => pill(k, i, true))}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div ref={wrap} className={styles.qInline}>
      <span className={styles.qInlineLabel}>Quick filters</span>
      <div className={styles.qRow} {...hover}>
        <div className={cx(styles.qRowPills, open && styles.qRowPillsHidden)}>
          {order.slice(0, visN).map((k, i) => pill(k, i, false))}
          {visN < order.length ? (
            <button type="button" className={styles.qpill} aria-expanded={open} tabIndex={open ? -1 : 0} onClick={click}>
              + {order.length - visN} more
            </button>
          ) : null}
        </div>
        {mounted ? (
          <div role="group" aria-label="Quick filters" className={cx(styles.qCardA, open ? styles.qcIn : styles.qcOut)}>
            {order.map((k, i) => pill(k, i, true))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
