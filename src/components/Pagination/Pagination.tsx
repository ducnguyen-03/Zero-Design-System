import { useId } from "react";
import type { HTMLAttributes } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { IconButton } from "../IconButton/IconButton";
import { Select } from "../Select/Select";
import styles from "./Pagination.module.css";

const cx = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(" ");

/**
 * Figma "Pagination / Rows Per Page" (3540:1211). The design system only uses the
 * rows-per-page pattern:
 * - `rowsPerPage` — rows selector + "Page x of y" readout (Table Template 3, inside the card).
 * - `arrows` — rows selector + previous / next icon buttons (Table Template 4, below the card).
 */
export type PaginationVariant = "rowsPerPage" | "arrows";

export interface PaginationProps extends Omit<HTMLAttributes<HTMLElement>, "onChange"> {
  variant?: PaginationVariant;
  /** Current page, 1-based. */
  page: number;
  /** Total number of pages (>= 1). */
  totalPages: number;
  /** Fired by the arrow buttons (`arrows` variant). */
  onPageChange?: (page: number) => void;
  /** Selected page size. */
  rowsPerPage?: number;
  rowsPerPageOptions?: number[];
  onRowsPerPageChange?: (rows: number) => void;
  /** Visible label before the select. */
  rowsPerPageLabel?: string;
  /** Accessible name for the nav landmark. */
  "aria-label"?: string;
}

export function Pagination({
  variant = "rowsPerPage",
  page,
  totalPages,
  onPageChange,
  rowsPerPage = 10,
  rowsPerPageOptions = [10, 25, 50, 100],
  onRowsPerPageChange,
  rowsPerPageLabel = "Rows per page:",
  className,
  "aria-label": ariaLabel = "Pagination",
  ...rest
}: PaginationProps) {
  const labelId = useId();
  const total = Math.max(1, totalPages);
  const current = Math.min(Math.max(1, page), total);
  const go = (p: number) => {
    const next = Math.min(Math.max(1, p), total);
    if (next !== current) onPageChange?.(next);
  };

  return (
    <nav
      aria-label={ariaLabel}
      className={cx(styles.root, variant === "arrows" && styles.arrows, className)}
      {...rest}
    >
      <span id={labelId} className={styles.label}>
        {rowsPerPageLabel}
      </span>
      <Select
        className={styles.select}
        size="xs"
        floating
        aria-labelledby={labelId}
        options={rowsPerPageOptions.map((n) => ({ value: String(n), label: String(n) }))}
        value={String(rowsPerPage)}
        onValueChange={(v) => onRowsPerPageChange?.(Number(v))}
      />

      {variant === "rowsPerPage" ? (
        <span className={styles.label} aria-live="polite">
          Page {current} of {total}
        </span>
      ) : (
        <>
          <span className={styles.srOnly} aria-live="polite">
            Page {current} of {total}
          </span>
          <span className={styles.arrowButtons}>
            <IconButton
              aria-label="Go to previous page"
              icon={<ChevronLeft />}
              disabled={current <= 1}
              onClick={() => go(current - 1)}
            />
            <IconButton
              aria-label="Go to next page"
              icon={<ChevronRight />}
              disabled={current >= total}
              onClick={() => go(current + 1)}
            />
          </span>
        </>
      )}
    </nav>
  );
}
