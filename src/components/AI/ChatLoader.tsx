import type { HTMLAttributes } from "react";
import { LoaderCircle } from "lucide-react";
import styles from "./ChatLoader.module.css";

const cx = (...parts: Array<string | false | undefined>) => parts.filter(Boolean).join(" ");

/**
 * `dots` — three pulsing dots, while the reply has not started.
 * `spinner` — Lucide loader + what the agent is doing (the ZAK run summary).
 * `text` — the label alone with a light sweep across it, for inline status.
 */
export type ChatLoaderVariant = "dots" | "spinner" | "text";

export interface ChatLoaderProps extends HTMLAttributes<HTMLDivElement> {
  variant?: ChatLoaderVariant;
  /** What is happening, e.g. "Searching the data". Visible for `spinner` / `text`,
   *  announced for `dots`. */
  label?: string;
}

/** Live status while an agent works. Announced politely; motion slows under reduced-motion. */
export function ChatLoader({
  variant = "dots",
  label = "Thinking",
  className,
  ...rest
}: ChatLoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cx(styles.loader, className)}
      data-variant={variant}
      {...rest}
    >
      {variant === "dots" ? (
        <>
          <span className={styles.dots} aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <span className={styles.srOnly}>{label}</span>
        </>
      ) : variant === "spinner" ? (
        <>
          <LoaderCircle className={styles.spinnerIcon} aria-hidden="true" />
          <span className={styles.label}>{label}</span>
        </>
      ) : (
        <span className={cx(styles.label, styles.shimmer)}>{label}</span>
      )}
    </div>
  );
}
