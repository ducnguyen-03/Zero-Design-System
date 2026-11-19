import type { ElementType, HTMLAttributes } from "react";
import styles from "./Typography.module.css";

export type TypographyVariant =
  | "h1"
  | "h2"
  | "h3"
  | "title"
  | "titleSm"
  | "body"
  | "bodySm"
  | "label"
  | "mono";

export interface TypographyProps extends HTMLAttributes<HTMLElement> {
  variant?: TypographyVariant;
  /** Override the rendered element. Defaults to a sensible tag per variant. */
  as?: ElementType;
}

const DEFAULT_TAG: Record<TypographyVariant, ElementType> = {
  h1: "h1",
  h2: "h2",
  h3: "h3",
  title: "p",
  titleSm: "p",
  body: "p",
  bodySm: "p",
  label: "span",
  mono: "code",
};

const cx = (...parts: Array<string | false | undefined>) =>
  parts.filter(Boolean).join(" ");

export function Typography({
  variant = "body",
  as,
  className,
  children,
  ...rest
}: TypographyProps) {
  const Tag = as ?? DEFAULT_TAG[variant];
  return (
    <Tag className={cx(styles.base, styles[variant], className)} {...rest}>
      {children}
    </Tag>
  );
}
