import type { HTMLAttributes, ReactNode } from "react";
import styles from "./AudienceCard.module.css";

export interface AudienceCardProps extends HTMLAttributes<HTMLDivElement> {
  /** A lucide icon element, coloured via its own `color` prop. */
  icon: ReactNode;
  title: string;
  description: string;
}

const cx = (...parts: Array<string | false | undefined>) =>
  parts.filter(Boolean).join(" ");

/** Smaller cousin of the FeatureCard — loose 40px icon + title + short copy. Same hover lift. */
export function AudienceCard({
  icon,
  title,
  description,
  className,
  ...rest
}: AudienceCardProps) {
  return (
    <div className={cx(styles.card, className)} {...rest}>
      <span className={styles.icon}>{icon}</span>
      <h4 className={styles.title}>{title}</h4>
      <p className={styles.desc}>{description}</p>
    </div>
  );
}
