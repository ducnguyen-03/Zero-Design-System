import type { ReactNode } from "react";
import { Info } from "lucide-react";
import { Tooltip } from "../../../../components/Tooltip/Tooltip";
import { TIPS } from "../savvyData";
import styles from "../SavvyView.module.css";

export const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(" ");

/** Tooltip body: optional bold title + one or more caption lines (SAVvy's white info tip). */
export function TipBody({ title, lines }: { title?: string; lines: string[] }) {
  return (
    <span className={styles.tipBody}>
      {title ? <span className={styles.tipTitle}>{title}</span> : null}
      {lines.map((l, i) => (
        <span key={i} className={styles.tipLine}>
          {l}
        </span>
      ))}
    </span>
  );
}

/** 16px info icon with the shared white tooltip, keyed into TIPS. */
export function InfoTip({ tip, label, tone }: { tip: string; label: string; tone?: "blue" }) {
  const t = TIPS[tip];
  if (!t) return null;
  return (
    <Tooltip appearance="light" multiline placement="bottom" delay={0} label={<TipBody title={t[0] || undefined} lines={[t[1]]} />}>
      <button type="button" className={cx(styles.info, tone === "blue" && styles.infoBlue)} aria-label={`About ${label}`}>
        <Info size={16} strokeWidth={2.5} aria-hidden="true" />
      </button>
    </Tooltip>
  );
}

/** ZeroDash card: white, 1px grey border, 8px corners, 24px padding, title row with an optional action. */
export function SavCard({
  title,
  action,
  children,
  className,
  titleId,
}: {
  title?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  titleId?: string;
}) {
  return (
    <section className={cx(styles.card, className)} aria-labelledby={titleId}>
      {title || action ? (
        <header className={styles.cardHead}>
          {title ? (
            <h2 id={titleId} className={styles.cardTitle}>
              {title}
            </h2>
          ) : (
            <span />
          )}
          {action ? <div className={styles.cardAction}>{action}</div> : null}
        </header>
      ) : null}
      {children}
    </section>
  );
}

/** Grey segmented control (REF/ALT, zoom, settings options). */
export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  ariaLabel,
  ariaLabelledBy,
  stretch,
  size = "md",
}: {
  options: Array<{ value: T; label: string }>;
  value: T;
  onChange: (v: T) => void;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  stretch?: boolean;
  size?: "sm" | "md";
}) {
  const idx = options.findIndex((o) => o.value === value);
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      className={cx(styles.seg, stretch && styles.segStretch)}
      onKeyDown={(e) => {
        if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) return;
        e.preventDefault();
        const dir = e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 1;
        const next = options[(idx + dir + options.length) % options.length];
        onChange(next.value);
        const btns = (e.currentTarget as HTMLElement).querySelectorAll<HTMLButtonElement>("button");
        btns[(idx + dir + options.length) % options.length]?.focus();
      }}
    >
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={String(o.value)}
            type="button"
            role="radio"
            aria-checked={on}
            tabIndex={on ? 0 : -1}
            className={cx(styles.segBtn, size === "sm" && styles.segBtnSm, on && styles.segBtnOn)}
            onClick={() => onChange(o.value)}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/** 32px white rounded square holding a status icon (banners). */
export function BannerIcon({ children, tone }: { children: ReactNode; tone: "green" | "orange" | "blue" }) {
  return <span className={cx(styles.bannerIcon, styles[`bannerIcon_${tone}`])}>{children}</span>;
}
