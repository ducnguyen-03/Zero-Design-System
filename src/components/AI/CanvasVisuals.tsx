import { createContext, useContext, useId, useMemo, useState } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { Check, EyeOff, LayoutGrid } from "lucide-react";
import { CanvasOutput, CanvasOutputAction } from "./Canvas";
import styles from "./CanvasVisuals.module.css";

const cx = (...parts: Array<string | false | undefined>) => parts.filter(Boolean).join(" ");

/* ─────────────────────────── Visual registry ─────────────────────────── */

export interface CanvasVisualMeta {
  id: string;
  /** Short toggle label, e.g. "Reference cohort". */
  label: string;
  /** 16px Lucide icon for the toggle. */
  icon?: ReactNode;
}

interface VisualsContextValue {
  isVisible: (id: string) => boolean;
  hide: (id: string) => void;
  labelOf: (id: string) => string;
}

const VisualsContext = createContext<VisualsContextValue | null>(null);

export interface CanvasVisualsProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  /** Every visual the agent produced, in reading order. Each one gets a toggle. */
  visuals: CanvasVisualMeta[];
  /** Controlled list of visible ids. */
  visible?: string[];
  /** Uncontrolled initial visible ids. Default: all. */
  defaultVisible?: string[];
  onVisibleChange?: (visible: string[]) => void;
  /** Toolbar heading. Default "Evidence". */
  title?: ReactNode;
  /** `CanvasVisual`s. Their order is the layout order. */
  children: ReactNode;
}

/**
 * The canvas's evidence area: a toolbar of toggles (one per visual) above a
 * two-column grid. Researchers switch off what they don't need, so the answer
 * stays digestible; hidden visuals keep their slot in the toolbar to come back.
 */
export function CanvasVisuals({
  visuals,
  visible: visibleProp,
  defaultVisible,
  onVisibleChange,
  title = "Evidence",
  children,
  className,
  ...rest
}: CanvasVisualsProps) {
  const headingId = useId();
  const [inner, setInner] = useState<string[]>(defaultVisible ?? visuals.map((v) => v.id));
  const visible = visibleProp ?? inner;
  const set = (next: string[]) => {
    // Keep reading order, whatever order the toggles were pressed in.
    const ordered = visuals.map((v) => v.id).filter((id) => next.includes(id));
    if (visibleProp === undefined) setInner(ordered);
    onVisibleChange?.(ordered);
  };
  const toggle = (id: string) => set(visible.includes(id) ? visible.filter((v) => v !== id) : [...visible, id]);

  const ctx = useMemo<VisualsContextValue>(
    () => ({
      isVisible: (id) => visible.includes(id),
      hide: (id) => set(visible.filter((v) => v !== id)),
      labelOf: (id) => visuals.find((v) => v.id === id)?.label ?? id,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [visible, visuals],
  );

  const shown = visuals.filter((v) => visible.includes(v.id)).length;
  const allShown = shown === visuals.length;

  return (
    <section className={cx(styles.visuals, className)} aria-labelledby={headingId} {...rest}>
      <div className={styles.toolbar}>
        <div className={styles.toolbarHead}>
          <h2 id={headingId} className={styles.eyebrow}>
            {title}
          </h2>
          <span className={styles.tally} aria-live="polite">
            {shown} of {visuals.length} shown
          </span>
        </div>
        <ul className={styles.toggles} aria-label="Show or hide visuals">
          {visuals.map((v) => {
            const on = visible.includes(v.id);
            return (
              <li key={v.id}>
                <button
                  type="button"
                  className={cx(styles.toggle, on && styles.toggleOn)}
                  aria-pressed={on}
                  onClick={() => toggle(v.id)}
                >
                  <span className={styles.toggleMark} aria-hidden="true">
                    {on ? <Check /> : v.icon ?? null}
                  </span>
                  {v.label}
                </button>
              </li>
            );
          })}
          <li className={styles.toggleAllItem}>
            <button
              type="button"
              className={styles.toggleAll}
              onClick={() => set(allShown ? [] : visuals.map((v) => v.id))}
            >
              {allShown ? "Hide all" : "Show all"}
            </button>
          </li>
        </ul>
      </div>

      <VisualsContext.Provider value={ctx}>
        {shown > 0 ? (
          <div className={styles.grid}>{children}</div>
        ) : (
          <div className={styles.empty}>
            <LayoutGrid aria-hidden="true" />
            <p>All visuals are hidden. The summary above still answers the question.</p>
            <button type="button" className={styles.toggleAll} onClick={() => set(visuals.map((v) => v.id))}>
              Show all visuals
            </button>
          </div>
        )}
      </VisualsContext.Provider>
    </section>
  );
}

/* ─────────────────────────── One visual ─────────────────────────── */

export interface CanvasVisualProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  /** Matches an id in `CanvasVisuals.visuals`. */
  id: string;
  title: ReactNode;
  subtitle?: ReactNode;
  /** `full` spans both grid columns (UMAPs, wide tables); `half` sits beside another. Default `half`. */
  span?: "half" | "full";
  /** A row of view controls under the title, e.g. `CanvasSegmented`s for modality and level. */
  controls?: ReactNode;
  /** Extra icon actions (download, expand). */
  actions?: ReactNode;
  children: ReactNode;
}

/** A `CanvasOutput` that lives in `CanvasVisuals`: it can be hidden from its own header. */
export function CanvasVisual({
  id,
  title,
  subtitle,
  span = "half",
  controls,
  actions,
  children,
  className,
  ...rest
}: CanvasVisualProps) {
  const ctx = useContext(VisualsContext);
  if (ctx && !ctx.isVisible(id)) return null;
  return (
    <CanvasOutput
      id={`visual-${id}`}
      title={title}
      subtitle={subtitle}
      className={cx(styles.visual, span === "full" && styles.full, className)}
      actions={
        <>
          {actions}
          {ctx ? (
            <CanvasOutputAction
              icon={<EyeOff aria-hidden="true" />}
              aria-label={`Hide ${ctx.labelOf(id)}`}
              onClick={() => ctx.hide(id)}
            />
          ) : null}
        </>
      }
      {...rest}
    >
      {controls ? <div className={styles.controls}>{controls}</div> : null}
      {children}
    </CanvasOutput>
  );
}

/* ─────────────────────────── Segmented control ─────────────────────────── */

export interface CanvasSegmentedProps<T extends string> {
  options: Array<{ value: T; label: string; disabled?: boolean }>;
  value: T;
  onChange: (value: T) => void;
  "aria-label": string;
}

/** Compact switch for a visual's dimension: Methylation / Expression, Level 1 / 2 / 3. */
export function CanvasSegmented<T extends string>({
  options,
  value,
  onChange,
  "aria-label": ariaLabel,
}: CanvasSegmentedProps<T>) {
  return (
    <div className={styles.segmented} role="group" aria-label={ariaLabel}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          className={styles.segment}
          aria-pressed={o.value === value}
          disabled={o.disabled}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
