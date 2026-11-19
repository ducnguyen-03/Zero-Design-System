import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  TableHTMLAttributes,
  TdHTMLAttributes,
  ThHTMLAttributes,
} from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, Check, EllipsisVertical, Minus, Plus } from "lucide-react";
import { Select } from "../Select/Select";
import styles from "./Table.module.css";

const cx = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(" ");

/* ------------------------------------------------------------------ */
/* Structure                                                           */
/* ------------------------------------------------------------------ */

export interface TableProps extends TableHTMLAttributes<HTMLTableElement> {
  /** Visible or visually-hidden caption. Strongly recommended for screen readers. */
  caption?: ReactNode;
  /** Hide the caption visually but keep it for assistive tech. */
  captionHidden?: boolean;
  /** Stretch the table to its container width. Default true. */
  fullWidth?: boolean;
}

export interface TableContainerProps extends HTMLAttributes<HTMLDivElement> {
  /** Row above the card — usually a `TableToolbar` (search, result count, actions). */
  toolbar?: ReactNode;
  /** Bottom of the card, right-aligned — usually `<Pagination variant="rowsPerPage" />`. */
  footer?: ReactNode;
  /** Content below the card, right-aligned — e.g. `<Pagination variant="arrows" />` (Figma Template 4). */
  after?: ReactNode;
  /** The `<Table>`. */
  children: ReactNode;
}

/**
 * Figma "Table V3" shell: white card with a support-grey border and 8px radius.
 * The table scrolls horizontally inside it; toolbar and footer slots follow the
 * Table Template layout (16px gaps).
 */
export function TableContainer({ toolbar, footer, after, className, children, ...rest }: TableContainerProps) {
  return (
    <div className={cx(styles.container, className)} {...rest}>
      {toolbar}
      <div className={cx(styles.card, footer ? styles.hasFooter : undefined)}>
        <div className={styles.scroll}>{children}</div>
        {footer ? <div className={styles.footer}>{footer}</div> : null}
      </div>
      {after ? <div className={styles.after}>{after}</div> : null}
    </div>
  );
}

export interface TableToolbarProps extends HTMLAttributes<HTMLDivElement> {
  /** Left: search field (Figma 372px wide). */
  search?: ReactNode;
  /** Result summary, e.g. "1 - 20 of 400 Genes". */
  summary?: ReactNode;
  /** Right-aligned actions, e.g. a "Manage columns" button. */
  actions?: ReactNode;
}

/** Figma Table Template "Actions" row: search · summary ······ actions. */
export function TableToolbar({ search, summary, actions, className, ...rest }: TableToolbarProps) {
  return (
    <div className={cx(styles.toolbar, className)} {...rest}>
      {search ? <div className={styles.toolbarSearch}>{search}</div> : null}
      <div className={styles.toolbarRight}>
        {summary ? <span className={styles.toolbarSummary}>{summary}</span> : <span />}
        {actions ? <div className={styles.toolbarActions}>{actions}</div> : null}
      </div>
    </div>
  );
}

/** Semantic `<table>` styled to the Insight "table-block" spec. */
export function Table({
  caption,
  captionHidden = false,
  fullWidth = true,
  className,
  children,
  ...rest
}: TableProps) {
  return (
    <table className={cx(styles.table, fullWidth && styles.fullWidth, className)} {...rest}>
      {caption ? (
        <caption className={cx(styles.caption, captionHidden && styles.srOnly)}>{caption}</caption>
      ) : null}
      {children}
    </table>
  );
}

export type TableSectionProps = HTMLAttributes<HTMLTableSectionElement>;

export function TableHead({ className, ...rest }: TableSectionProps) {
  return <thead className={cx(styles.head, className)} {...rest} />;
}

export function TableBody({ className, ...rest }: TableSectionProps) {
  return <tbody className={cx(styles.body, className)} {...rest} />;
}

export interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  /** Mark the row as selected (persistent hover colour + aria-selected). */
  selected?: boolean;
}

export function TableRow({ selected, className, ...rest }: TableRowProps) {
  return (
    <tr
      className={cx(styles.row, selected && styles.selected, className)}
      aria-selected={selected || undefined}
      {...rest}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Cells                                                               */
/* ------------------------------------------------------------------ */

export type SortDirection = "ascending" | "descending" | "none";

export interface TableHeaderCellProps extends Omit<ThHTMLAttributes<HTMLTableCellElement>, "align"> {
  /** Render the header as a sort toggle. */
  sortable?: boolean;
  /** Current sort state; mirrored to `aria-sort`. */
  sortDirection?: SortDirection;
  /** Fired when the sort toggle is activated. */
  onSort?: () => void;
  /** Optional "add" affordance (the + that appears on hover in Figma). */
  onAdd?: () => void;
  /** Accessible label for the add affordance. */
  addLabel?: string;
  /** Horizontal alignment — `center` for grouped / sub-column headers. */
  align?: "start" | "center" | "end";
  children?: ReactNode;
}

export function TableHeaderCell({
  sortable = false,
  sortDirection = "none",
  onSort,
  onAdd,
  addLabel = "Add",
  align = "start",
  scope = "col",
  className,
  children,
  ...rest
}: TableHeaderCellProps) {
  const SortIcon =
    sortDirection === "ascending" ? ArrowUp : sortDirection === "descending" ? ArrowDown : ArrowUpDown;
  return (
    <th
      scope={scope}
      aria-sort={sortable ? sortDirection : undefined}
      className={cx(
        styles.th,
        sortable && styles.sortable,
        sortDirection !== "none" && styles.sorted,
        align !== "start" && styles[`align-${align}`],
        className,
      )}
      {...rest}
    >
      <span className={styles.thInner}>
        {sortable ? (
          <button type="button" className={styles.sortButton} onClick={onSort}>
            <span>{children}</span>
            <span className={styles.sortIcon} aria-hidden="true">
              <SortIcon />
            </span>
          </button>
        ) : (
          <span className={styles.thLabel}>{children}</span>
        )}
        {onAdd ? (
          <button type="button" className={styles.thAdd} aria-label={addLabel} onClick={onAdd}>
            <Plus aria-hidden="true" />
          </button>
        ) : null}
      </span>
    </th>
  );
}

export interface TableCellProps extends Omit<TdHTMLAttributes<HTMLTableCellElement>, "align"> {
  /** Truncate overflowing text with an ellipsis (single line). */
  truncate?: boolean;
  /** Right-align (numeric columns). */
  numeric?: boolean;
  /** Clamp long text to N lines with an ellipsis (Figma query titles use 3). */
  clamp?: number;
  /** `secondary` = grey-200 text for supporting columns (dates, "last updated"). */
  tone?: "primary" | "secondary";
  /** Horizontal alignment of the cell content. */
  align?: "start" | "center" | "end";
}

export function TableCell({
  truncate,
  numeric,
  clamp,
  tone = "primary",
  align = "start",
  className,
  children,
  ...rest
}: TableCellProps) {
  return (
    <td
      className={cx(
        styles.td,
        truncate && styles.truncate,
        numeric && styles.numeric,
        tone === "secondary" && styles.secondary,
        align !== "start" && styles[`align-${align}`],
        className,
      )}
      {...rest}
    >
      {clamp ? (
        <span className={styles.clamp} style={{ WebkitLineClamp: clamp }}>
          {children}
        </span>
      ) : (
        children
      )}
    </td>
  );
}

/* ------------------------------------------------------------------ */
/* Cell content renderers                                              */
/* ------------------------------------------------------------------ */

export interface TableBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** `default` = cell-foundation badge (14px). `label` = Table Template type tag
   *  (EGA / SAMPLE / DATA): 12px bold uppercase on grey-30. */
  appearance?: "default" | "label";
}

/** "Badge" data cell — neutral 4px-radius label. */
export function TableBadge({ appearance = "default", className, ...rest }: TableBadgeProps) {
  return <span className={cx(styles.badge, appearance === "label" && styles.badgeLabel, className)} {...rest} />;
}

/** "Badge Number" data cell — fixed-width neutral count / score pill. */
export function TableCount({ className, ...rest }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={cx(styles.count, className)} {...rest} />;
}

export interface TableDropdownProps {
  /** Accessible label (the column header is not programmatically attached). */
  "aria-label": string;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  name?: string;
  className?: string;
}

/** "Dropdown" data cell — the design-system Select (Text Dropdown, XS) with a floating listbox. */
export function TableDropdown({ placeholder = "Select", className, ...rest }: TableDropdownProps) {
  return (
    <Select
      className={cx(styles.dropdown, className)}
      variant="text"
      size="xs"
      floating
      placeholder={placeholder}
      {...rest}
    />
  );
}

export interface TableAddButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  "aria-label": string;
}

/** "Add Button" data cell — 24px round + button. */
export function TableAddButton({ className, type = "button", ...rest }: TableAddButtonProps) {
  return (
    <button type={type} className={cx(styles.addButton, className)} {...rest}>
      <Plus aria-hidden="true" />
    </button>
  );
}

export interface TableAvatarProps extends HTMLAttributes<HTMLSpanElement> {
  /** Person's name — used for alt text and the initials fallback. */
  name: string;
  src?: string;
  /** `sm` 24px (cell foundation, default) or `md` 32px (Table Template). */
  size?: "sm" | "md";
}

/**
 * "Avatar" data cell — a minimal 24px avatar. Kept local so Table has no
 * dependency on the Avatar component; pass any ReactNode to TableCell to use
 * the full Avatar instead.
 */
export function TableAvatar({ name, src, size = "sm", className, ...rest }: TableAvatarProps) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
  return (
    <span className={cx(styles.avatar, size === "md" && styles.avatarMd, className)} title={name} {...rest}>
      {src ? <img src={src} alt={name} /> : <span aria-label={name} role="img">{initials}</span>}
    </span>
  );
}

export interface TableCheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  /** Accessible label — e.g. "Select APP-2026-00423" or "Select all rows". */
  "aria-label": string;
  /** Mixed state for a "select all" header checkbox. */
  indeterminate?: boolean;
}

/** 16px row-selection checkbox from the Figma Table Template (first column). */
export function TableCheckbox({ indeterminate = false, className, ...rest }: TableCheckboxProps) {
  return (
    <span className={cx(styles.checkbox, className)}>
      <input
        type="checkbox"
        className={styles.checkboxInput}
        ref={(el) => {
          if (el) el.indeterminate = indeterminate;
        }}
        aria-checked={indeterminate ? "mixed" : undefined}
        {...rest}
      />
      <span className={styles.checkboxBox} aria-hidden="true">
        {indeterminate ? <Minus className={styles.checkboxMark} /> : <Check className={styles.checkboxMark} />}
      </span>
    </span>
  );
}

export interface TableRowMenuProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Accessible label — e.g. "Actions for APP-2026-00423". */
  "aria-label": string;
}

/** Row "more actions" kebab (Lucide EllipsisVertical, 20px) from the Table Template. */
export function TableRowMenu({ className, type = "button", ...rest }: TableRowMenuProps) {
  return (
    <button type={type} className={cx(styles.rowMenu, className)} {...rest}>
      <EllipsisVertical aria-hidden="true" />
    </button>
  );
}
