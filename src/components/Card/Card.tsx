import type { HTMLAttributes, ReactNode } from "react";
import { Quote, User } from "lucide-react";
import styles from "./Card.module.css";

const cx = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(" ");

/** `default` = Clinical Domain=Default; `category` = Cancer Category Tile. */
export type CardVariant = "default" | "category";

export interface CardProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  variant?: CardVariant;
  /** Image URL or any media node. Rendered in a 220px-tall rounded frame. */
  image?: ReactNode;
  /** Alt text when `image` is a URL. Empty string = decorative. */
  imageAlt?: string;
  /** Chips slot (use CardChip, or any chip component). Rendered above the media. */
  chips?: ReactNode;
  label?: ReactNode;
  description?: ReactNode;
  /** Label + Description Stacked: description below the label instead of inline. */
  stacked?: boolean;
  /** Citation text, shown with an open-quote mark. */
  citation?: ReactNode;
  /** `category`: sample count shown with a person icon. */
  count?: ReactNode;
  /** `category`: accessible suffix for the count (default "participants"). */
  countLabel?: string;
  /** Heading element for the label. */
  labelAs?: "h2" | "h3" | "h4" | "p";
  /** Make the whole card a link. */
  href?: string;
  children?: ReactNode;
}

/** Neutral pill chip used in the Card chips slot. */
export function CardChip({ className, ...rest }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={cx(styles.chip, className)} {...rest} />;
}

export interface CardTextProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  label?: ReactNode;
  description?: ReactNode;
  stacked?: boolean;
  labelAs?: "h2" | "h3" | "h4" | "p";
}

/** Label + description block. Card renders one for you; use this for an extra block via children. */
export function CardText({
  label,
  description,
  stacked = false,
  labelAs: LabelTag = "h3",
  className,
  ...rest
}: CardTextProps) {
  return (
    <div className={cx(styles.text, stacked ? styles.stacked : styles.inline, className)} {...rest}>
      {label ? <LabelTag className={styles.label}>{label}</LabelTag> : null}
      {description ? <p className={styles.description}>{description}</p> : null}
    </div>
  );
}

export function Card({
  variant = "default",
  image,
  imageAlt = "",
  chips,
  label,
  description,
  stacked = false,
  citation,
  count,
  countLabel = "participants",
  labelAs: LabelTag = "h3",
  href,
  className,
  children,
  ...rest
}: CardProps) {
  const isCategory = variant === "category";
  const rootClass = cx(
    styles.card,
    isCategory ? styles.category : styles.default,
    href && styles.interactive,
    className,
  );

  const body = isCategory ? (
    <>
      <div className={styles.categoryText}>
        {label ? <LabelTag className={cx(styles.label, styles.ellipsis)}>{label}</LabelTag> : null}
        {description ? (
          <p className={cx(styles.description, styles.ellipsis)}>{description}</p>
        ) : null}
      </div>
      {count !== undefined ? (
        <span className={styles.count}>
          <User aria-hidden="true" />
          <span>
            {count}
            <span className={styles.srOnly}> {countLabel}</span>
          </span>
        </span>
      ) : null}
      {children}
    </>
  ) : (
    <>
      {chips ? <div className={styles.chips}>{chips}</div> : null}
      {image ? (
        <div className={styles.media}>
          {typeof image === "string" ? <img src={image} alt={imageAlt} /> : image}
        </div>
      ) : null}
      {label || description ? (
        <CardText label={label} description={description} stacked={stacked} labelAs={LabelTag} />
      ) : null}
      {children}
      {citation ? (
        <figure className={styles.citation}>
          <span className={styles.quoteIcon} aria-hidden="true">
            <Quote />
          </span>
          <blockquote className={styles.citationText}>{citation}</blockquote>
        </figure>
      ) : null}
    </>
  );

  if (href) {
    return (
      <a href={href} className={rootClass} {...(rest as HTMLAttributes<HTMLAnchorElement>)}>
        {body}
      </a>
    );
  }
  return (
    <article className={rootClass} {...rest}>
      {body}
    </article>
  );
}
