import { Children, useId } from "react";
import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import styles from "./PromptSuggestion.module.css";

const cx = (...parts: Array<string | false | undefined>) => parts.filter(Boolean).join(" ");

/** `card` = full-width outlined row (ZAK "Suggested next"); `pill` = compact grey chip for an empty chat. */
export type PromptSuggestionAppearance = "card" | "pill";

export interface PromptSuggestionProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** The prompt, written the way the user would type it. */
  children: ReactNode;
  appearance?: PromptSuggestionAppearance;
  /** Optional 16px Lucide icon before the text. */
  icon?: ReactNode;
}

/** A prompt the user can send in one click. */
export function PromptSuggestion({
  children,
  appearance = "card",
  icon,
  className,
  type = "button",
  ...rest
}: PromptSuggestionProps) {
  return (
    <button type={type} className={cx(styles.suggestion, styles[appearance], className)} {...rest}>
      {icon ? (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span className={styles.text}>{children}</span>
    </button>
  );
}

export interface PromptSuggestionsProps extends HTMLAttributes<HTMLElement> {
  /** Heading, e.g. "Suggested next". */
  label?: ReactNode;
  appearance?: PromptSuggestionAppearance;
  /** `PromptSuggestion`s — give them the same `appearance`. */
  children: ReactNode;
}

/** Labelled group of suggestions: a stack of cards, or a wrapping row of pills. */
export function PromptSuggestions({
  label,
  appearance = "card",
  children,
  className,
  ...rest
}: PromptSuggestionsProps) {
  const labelId = useId();
  return (
    <section
      className={cx(styles.group, className)}
      aria-labelledby={label ? labelId : undefined}
      {...rest}
    >
      {label ? (
        <h3 id={labelId} className={styles.label}>
          {label}
        </h3>
      ) : null}
      <ul className={cx(styles.list, appearance === "pill" && styles.listPill)}>
        {Children.map(children, (child) => (child ? <li>{child}</li> : null))}
      </ul>
    </section>
  );
}
