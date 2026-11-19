import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { Activity, Bookmark, Box, ChartColumn, CircleCheck, Dna, LayoutGrid, ListFilter, Lock, Search, Sparkle, Users, X } from "lucide-react";
import { Button } from "../Button/Button";
import styles from "./OnboardingTour.module.css";

const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(" ");

/** Step icons from the Insights tour, one per kind of place the tour points at. */
export const TOUR_ICONS = {
  views: LayoutGrid,
  charts: ChartColumn,
  filters: ListFilter,
  locked: Lock,
  done: CircleCheck,
  search: Search,
  participants: Users,
  pdx: Box,
  molecular: Dna,
  saved: Bookmark,
  access: Activity,
  assistant: Sparkle,
} as const;
export type TourIconName = keyof typeof TOUR_ICONS;

export type TourTone = "light" | "dark";
export type TourArrow = "top" | "bottom" | "left" | "right";

export interface TourCardProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title: ReactNode;
  body: ReactNode;
  /** 0-based step and step count — "n of N", dots, Skip tour on the first step, the last step's label. */
  step: number;
  total: number;
  /** `light` (default) or `dark` card. A picture header always sits on a light card. */
  tone?: TourTone;
  /** Picture header — layout **illustrated**. Wins over `icon`. */
  illustration?: ReactNode;
  /** Icon above the title — layout **icon**: a green disc on light, a bare yellow glyph on dark. */
  icon?: TourIconName | ReactNode;
  /** Progress under "n of N". Default: dots, except the illustrated layout which shows the count only. */
  progress?: "dots" | "count";
  /** Draw the card's own arrow (static use). Inside a running tour, driver.js draws it. */
  arrow?: TourArrow;
  /** Arrow position along its edge, px from the start. Default 32. */
  arrowOffset?: number;
  nextLabel?: string;
  onNext?: () => void;
  onBack?: () => void;
  /** First step only — replaces Back. */
  onSkip?: () => void;
  onClose?: () => void;
  /** id prefix for aria-labelledby / describedby. */
  labelId?: string;
}

/**
 * One step of the onboarding tour (Claude Design *Insights Onboarding*). Three layouts —
 * **illustrated** (picture header), **icon** (icon above the title) and **text** (neither) — on a
 * light or dark card. Footer: "n of N" with progress dots, Skip tour on step 1 then Back, and Next
 * (the last step reads "Start exploring").
 */
export const TourCard = forwardRef<HTMLDivElement, TourCardProps>(function TourCard(
  {
    title,
    body,
    step,
    total,
    tone = "light",
    illustration,
    icon,
    progress,
    arrow,
    arrowOffset = 32,
    nextLabel,
    onNext,
    onBack,
    onSkip,
    onClose,
    labelId = "tour-step",
    className,
    ...rest
  },
  ref,
) {
  const layout = illustration ? "illustrated" : icon ? "icon" : "text";
  const dark = tone === "dark" && layout !== "illustrated";
  const last = step === total - 1;
  const first = step === 0;
  const showDots = (progress ?? (layout === "illustrated" ? "count" : "dots")) === "dots";
  const Glyph = typeof icon === "string" && icon in TOUR_ICONS ? TOUR_ICONS[icon as TourIconName] : null;
  const arrowStyle = arrow === "top" || arrow === "bottom" ? { left: arrowOffset } : arrow ? { top: arrowOffset } : undefined;

  return (
    <div
      ref={ref}
      role="dialog"
      aria-labelledby={`${labelId}-title`}
      aria-describedby={`${labelId}-body`}
      data-layout={layout}
      data-tone={dark ? "dark" : "light"}
      className={cx(styles.card, dark && styles.dark, layout === "illustrated" && styles.illustrated, className)}
      {...rest}
    >
      {arrow ? <span className={cx(styles.arrow, styles[`arrow_${arrow}`])} style={arrowStyle} aria-hidden="true" /> : null}
      {layout === "illustrated" ? (
        <div className={styles.picture} aria-hidden="true">
          {illustration}
        </div>
      ) : null}
      {layout === "icon" ? (
        <span className={styles.icon} aria-hidden="true">
          {Glyph ? <Glyph strokeWidth={1.75} /> : (icon as ReactNode)}
        </span>
      ) : null}
      {onClose ? (
        <button type="button" className={styles.cardClose} aria-label="Close tour" onClick={onClose}>
          <X aria-hidden="true" />
        </button>
      ) : null}
      <h2 id={`${labelId}-title`} className={styles.cardTitle}>
        {title}
      </h2>
      <p id={`${labelId}-body`} className={styles.cardBody}>
        {body}
      </p>
      <div className={styles.cardFoot}>
        <div className={styles.progress}>
          <span className={styles.count}>
            {step + 1} of {total}
          </span>
          {showDots ? (
            <span className={styles.dots} aria-hidden="true">
              {Array.from({ length: total }, (_, i) => (
                <span key={i} className={cx(styles.dot, i === step && styles.dotOn, i < step && styles.dotDone)} />
              ))}
            </span>
          ) : null}
        </div>
        {first && onSkip ? (
          <Button size="md" variant="subtle" className={cx(styles.btn, styles.footButton)} onClick={onSkip}>
            Skip tour
          </Button>
        ) : null}
        {!first && onBack ? (
          <Button size="md" variant="subtle" className={cx(styles.btn, styles.footButton)} onClick={onBack}>
            Back
          </Button>
        ) : null}
        <Button size="md" variant="bold" className={cx(styles.btn, styles.next, dark && !last && styles.nextOnDark)} onClick={onNext} data-tour-next="">
          {nextLabel ?? (last ? "Start exploring" : "Next")}
        </Button>
      </div>
    </div>
  );
});
