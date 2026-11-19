import type { HTMLAttributes } from "react";
import styles from "./FeatureCard.module.css";

export interface FeatureCardProps extends HTMLAttributes<HTMLElement> {
  eyebrow?: string;
  title: string;
  description: string;
  /** Bottom-anchored illustration URL. Falls back to a grey placeholder. */
  image?: string;
}

const cx = (...parts: Array<string | false | undefined>) =>
  parts.filter(Boolean).join(" ");

/**
 * CardWithImage — 24px corner, copy 32px in, illustration in a concentric 8px frame.
 * Earns lift only on hover: 1.5px → 3px green stroke + a soft green glow, without moving content.
 */
export function FeatureCard({
  eyebrow,
  title,
  description,
  image,
  className,
  ...rest
}: FeatureCardProps) {
  return (
    <article className={cx(styles.card, className)} {...rest}>
      <div className={styles.body}>
        {eyebrow ? <span className={styles.eyebrow}>{eyebrow}</span> : null}
        <h4 className={styles.title}>{title}</h4>
        <p className={styles.desc}>{description}</p>
      </div>
      <div
        className={styles.imgArea}
        style={image ? { backgroundImage: `url(${image})` } : undefined}
        aria-hidden="true"
      >
        {image ? null : "Illustration"}
      </div>
    </article>
  );
}
