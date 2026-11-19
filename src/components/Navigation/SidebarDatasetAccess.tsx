import { useId } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { Button } from "../Button/Button";
import { ChartLegend, ProportionBar } from "../Charts/ProportionBar";
import { fmtNumber } from "../Charts/palette";
import styles from "./SidebarDatasetAccess.module.css";

const cx = (...parts: Array<string | false | undefined>) => parts.filter(Boolean).join(" ");

export interface SidebarDatasetAccessProps extends HTMLAttributes<HTMLElement> {
  /** Records visible at the viewer's tier (participants + samples + PDX models). */
  available: number;
  total: number;
  /** Legend, e.g. "3,184 participants" / "1,316 no access". */
  availableLabel: ReactNode;
  lockedLabel?: ReactNode;
  /** Fill colour. Default purple-100. */
  color?: string;
  /** Opens the tier comparison — the header and bar are one button. */
  onShowTiers?: () => void;
  /** "Request access". Omit to hide the button (top tier). */
  onRequest?: () => void;
  requestLabel?: string;
}

/**
 * "Dataset access" — the Insights sidebar block above the account: how much of the dataset the
 * viewer's tier opens (solid) against what it hides (hatched), a way into the tiers, and the way up.
 * Goes in `Sidebar`'s `access` slot; hidden in the compressed rail.
 */
export function SidebarDatasetAccess({
  available,
  total,
  availableLabel,
  lockedLabel,
  color = "var(--insight-color-purple-100)",
  onShowTiers,
  onRequest,
  requestLabel = "Request access",
  className,
  ...rest
}: SidebarDatasetAccessProps) {
  const titleId = useId();
  const head = (
    <>
      <span className={styles.head}>
        <span id={titleId} className={styles.title}>
          Dataset access
        </span>
        <span className={styles.count}>
          {fmtNumber(available)} / {fmtNumber(total)}
        </span>
      </span>
      <ProportionBar value={available} total={total} color={color} remainder="hatched" />
      <ChartLegend
        items={[
          { label: availableLabel, color },
          ...(lockedLabel ? [{ label: lockedLabel, color: "", hatched: true }] : []),
        ]}
      />
    </>
  );
  return (
    <section className={cx(styles.block, className)} aria-labelledby={titleId} {...rest}>
      {onShowTiers ? (
        <button type="button" className={styles.trigger} onClick={onShowTiers}>
          {head}
          <span className={styles.srOnly}>Show access tiers</span>
        </button>
      ) : (
        <div className={styles.static}>{head}</div>
      )}
      {onRequest ? (
        <Button size="sm" variant="bold" endIcon={<ArrowUpRight />} onClick={onRequest} className={styles.request}>
          {requestLabel}
        </Button>
      ) : null}
    </section>
  );
}
