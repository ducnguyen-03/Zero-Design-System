import type { HTMLAttributes, ReactNode } from "react";
import styles from "./Brand.module.css";

const cx = (...parts: Array<string | false | undefined>) => parts.filter(Boolean).join(" ");

export interface InsightsLogoProps extends HTMLAttributes<HTMLSpanElement> {
  /** Release label after the wordmark. Default "Beta"; pass `null` for the plain wordmark. */
  badge?: ReactNode | null;
  /** Wordmark height in px. 21 in the sidebar, 28 in the top bar. Default 21. */
  height?: number;
  /** White wordmark and a lighter badge, for dark surfaces. */
  onDark?: boolean;
}

/** The Insights wordmark with its release label — the purple outlined "BETA" pill from the onboarding prototype. */
export function InsightsLogo({ badge = "Beta", height = 21, onDark = false, className, ...rest }: InsightsLogoProps) {
  return (
    <span className={cx(styles.logo, onDark && styles.onDark, className)} {...rest}>
      <img src="/assets/InsightsLogo.svg" alt="Insights" style={{ height, width: "auto" }} />
      {badge ? <span className={styles.badge}>{badge}</span> : null}
    </span>
  );
}
