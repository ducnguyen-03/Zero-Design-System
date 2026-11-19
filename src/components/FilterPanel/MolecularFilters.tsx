import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { KeyboardEvent, ReactNode, RefObject } from "react";
import { Check, ChevronDown, Info, Plus, SearchX, User, X } from "lucide-react";
import { Checkbox } from "../Checkbox/Checkbox";
import { Tooltip } from "../Tooltip/Tooltip";
import { FilterNotice, FilterSectionShell, RAIL_ICON, Stat } from "./FilterPanel";
import styles from "./MolecularFilters.module.css";

const cx = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(" ");

/** Field label row — Figma "label row": Label/Regular + optional info tooltip. */
function FieldLabel({ id, children, hint }: { id: string; children: ReactNode; hint?: string }) {
  return (
    <div className={styles.labelRow}>
      <label className={styles.label} htmlFor={id}>
        {children}
      </label>
      {hint ? (
        <Tooltip label={hint} placement="top">
          <button type="button" className={styles.infoBtn} aria-label={hint}>
            <Info size={16} />
          </button>
        </Tooltip>
      ) : null}
    </div>
  );
}

/** Figma "Badge v1.1 / Small" chip with remove (grey or red). */
function Chip({ children, tone = "grey", onRemove }: { children: string; tone?: "grey" | "red"; onRemove?: () => void }) {
  return (
    <span className={cx(styles.chip, tone === "red" && styles.chipRed)}>
      {children}
      {onRemove ? (
        <button type="button" className={styles.chipRemove} aria-label={`Remove ${children}`} onClick={onRemove}>
          <X size={12} strokeWidth={2} absoluteStrokeWidth />
        </button>
      ) : null}
    </span>
  );
}

/* ══════════════════════════════════════════════════════════════════════
 * GeneFilter — Figma "Gene filter" (13134:41051 · 13151:146789 · 13138:133282)
 * ════════════════════════════════════════════════════════════════════ */

export interface GeneOption {
  symbol: string;
  /** Participants carrying a variant in this gene. */
  participants: number;
}

export interface GeneFilterProps {
  genes: GeneOption[];
  value: string[];
  onChange: (value: string[]) => void;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  /** "Choose gene list" — opens a saved list picker (omit to hide). */
  onChooseGeneList?: () => void;
  /** Show "Add custom list" (opens the paste dialog). Default true. */
  allowCustomList?: boolean;
  /** Max rows in the suggestion menu before it scrolls. Default 9. */
  menuRows?: number;
}

export function GeneFilter({
  genes,
  value,
  onChange,
  expanded,
  onExpandedChange,
  onChooseGeneList,
  allowCustomList = true,
  menuRows = 9,
}: GeneFilterProps) {
  const id = useId();
  const inputId = `${id}-input`;
  const listId = `${id}-list`;
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const q = query.trim().toUpperCase();
  const matches = useMemo(
    () => (q ? genes.filter((g) => g.symbol.toUpperCase().startsWith(q)) : []),
    [genes, q],
  );
  const open = q !== "";
  const selected = new Set(value);

  useEffect(() => setActive(0), [q]);

  // Close the menu on outside click.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setQuery("");
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const toggle = (symbol: string) =>
    onChange(selected.has(symbol) ? value.filter((v) => v !== symbol) : [...value, symbol]);

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !query && value.length) {
      onChange(value.slice(0, -1));
      return;
    }
    if (!open) return;
    if (e.key === "ArrowDown") setActive((a) => Math.min(a + 1, matches.length - 1));
    else if (e.key === "ArrowUp") setActive((a) => Math.max(a - 1, 0));
    else if (e.key === "Enter" && matches[active]) toggle(matches[active].symbol);
    else if (e.key === "Escape") setQuery("");
    else return;
    e.preventDefault();
  };

  return (
    <FilterSectionShell
      title="Gene"
      applied={value.length}
      onClear={() => onChange([])}
      expanded={expanded}
      onExpandedChange={onExpandedChange}
      className={styles.overflowVisible}
    >
      <div ref={rootRef} className={styles.block}>
        <FieldLabel id={inputId} hint="Enter a Gene Symbol, Gene Alias or Ensembl ID">
          Search by gene
        </FieldLabel>
        <div className={styles.fieldWrap}>
        {/* Clicking the box focuses the input; chips stay individually removable. */}
        <div className={cx(styles.field, styles.chipField)} onMouseDown={(e) => {
          if (e.target === e.currentTarget) {
            e.preventDefault();
            inputRef.current?.focus();
          }
        }}>
          {value.map((g) => (
            <Chip key={g} onRemove={() => onChange(value.filter((v) => v !== g))}>
              {g}
            </Chip>
          ))}
          <input
            ref={inputRef}
            id={inputId}
            className={styles.chipInput}
            placeholder={value.length ? "" : "e.g. TP53, BRAF"}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            role="combobox"
            aria-expanded={open}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={open && matches[active] ? `${listId}-${active}` : undefined}
            autoComplete="off"
            spellCheck={false}
          />
        </div>

        {open ? (
          matches.length ? (
            <ul
              id={listId}
              role="listbox"
              aria-multiselectable="true"
              aria-label="Matching genes"
              className={styles.menu}
              style={{ maxHeight: menuRows * 42 + 14 }}
            >
              {matches.map((g, i) => {
                const on = selected.has(g.symbol);
                return (
                  <li
                    key={g.symbol}
                    id={`${listId}-${i}`}
                    role="option"
                    aria-selected={on}
                    className={cx(styles.menuItem, on && styles.menuItemOn, i === active && styles.menuItemActive)}
                    onMouseEnter={() => setActive(i)}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => toggle(g.symbol)}
                  >
                    <Checkbox checked={on} readOnly tabIndex={-1} aria-hidden="true" className={styles.menuCheck} />
                    <span className={styles.menuLabel}>{g.symbol}</span>
                    <Stat icon={<User />} value={g.participants} label="participants" />
                  </li>
                );
              })}
            </ul>
          ) : (
            <div id={listId} className={cx(styles.menu, styles.menuEmpty)} role="status">
              <span className={styles.emptyIcon} aria-hidden="true">
                <SearchX size={24} />
              </span>
              <span className={styles.emptyTitle}>No gene found</span>
              <span className={styles.emptyText}>Please check spelling or try different keywords</span>
            </div>
          )
        ) : null}
        </div>

        {onChooseGeneList || allowCustomList ? (
          <div className={styles.actions}>
            {onChooseGeneList ? (
              <button type="button" className={styles.linkAction} onClick={onChooseGeneList}>
                <Plus {...RAIL_ICON} />
                Choose gene list
              </button>
            ) : (
              <span />
            )}
            {allowCustomList ? (
              <button
                type="button"
                className={styles.linkAction}
                aria-haspopup="dialog"
                aria-expanded={dialogOpen}
                onClick={() => setDialogOpen(true)}
              >
                <Plus {...RAIL_ICON} />
                Add custom list
              </button>
            ) : null}
          </div>
        ) : null}

        {dialogOpen ? (
          <CustomGeneListDialog
            anchor={rootRef}
            genes={genes}
            onClose={() => setDialogOpen(false)}
            onAdd={(symbols) => {
              onChange([...value, ...symbols.filter((s) => !selected.has(s))]);
              setDialogOpen(false);
            }}
          />
        ) : null}
      </div>
    </FilterSectionShell>
  );
}

/* ══════════════════════════════════════════════════════════════════════
 * CustomGeneListDialog — Figma "Custom gene list" (13239:48576 / 13239:48665)
 * ════════════════════════════════════════════════════════════════════ */

export interface CustomGeneListDialogProps {
  /** Element inside the filter panel; the dialog opens to the panel's left, level with it. */
  anchor?: RefObject<HTMLElement | null>;
  genes: GeneOption[];
  onAdd: (symbols: string[]) => void;
  onClose: () => void;
}

const tokenize = (text: string) => [
  ...new Set(
    text
      .split(/[;\n,]+/)
      .map((t) => t.trim().toUpperCase())
      .filter(Boolean),
  ),
];

export function CustomGeneListDialog({ anchor, genes, onAdd, onClose }: CustomGeneListDialogProps) {
  const titleId = useId();
  const [pos, setPos] = useState<{ top: number; right: number } | null>(null);

  // The panel body scrolls (and clips), so the dialog is portalled and placed
  // beside the panel: 24px gap, top-aligned with the anchoring section.
  useLayoutEffect(() => {
    const el = anchor?.current;
    if (!el) return;
    const place = () => {
      const panel = el.closest("section") ?? el;
      const a = el.getBoundingClientRect();
      const p = panel.getBoundingClientRect();
      setPos({ top: Math.max(8, a.top - 8), right: window.innerWidth - p.left + 24 });
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [anchor]);
  const [text, setText] = useState("");
  const areaRef = useRef<HTMLTextAreaElement | null>(null);
  const known = useMemo(() => new Set(genes.map((g) => g.symbol.toUpperCase())), [genes]);
  const tokens = tokenize(text);
  const matched = tokens.filter((t) => known.has(t));
  const unknown = tokens.filter((t) => !known.has(t));

  useEffect(() => areaRef.current?.focus(), []);

  const removeToken = (t: string) =>
    setText(tokenize(text).filter((x) => x !== t).join("; "));

  const dialog = (
    <div
      className={styles.dialog}
      style={pos ? { position: "fixed", top: pos.top, right: pos.right } : undefined}
      role="dialog"
      aria-modal="false"
      aria-labelledby={titleId}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.stopPropagation();
          onClose();
        }
      }}
    >
      <div className={styles.dialogHeader}>
        <h3 id={titleId} className={styles.dialogTitle}>
          Custom Gene List
        </h3>
        <button type="button" className={styles.dialogClose} aria-label="Close custom gene list" onClick={onClose}>
          <X {...RAIL_ICON} />
        </button>
      </div>
      <div className={styles.dialogBody}>
        <p className={styles.dialogHelp} id={`${titleId}-help`}>
          Add gene names, separated by semicolon ( ; ) or on their own individual lines separated by enter/return
          in the field below. This will be added to custom gene group allowing you to view all mutations / variants
          related to the genes of interest
        </p>
        <textarea
          ref={areaRef}
          className={styles.textarea}
          placeholder="Paste a list of genes"
          aria-label="Gene list"
          aria-describedby={`${titleId}-help`}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        {tokens.length ? (
          <div className={styles.summary} aria-live="polite">
            <div className={styles.summaryHead}>Summary</div>
            <div className={styles.summaryBody}>
              <div className={styles.summaryRow}>
                <span>Gene matched</span>
                <span>{matched.length}</span>
              </div>
              {matched.length ? (
                <div className={styles.chips}>
                  {matched.map((t) => (
                    <Chip key={t} onRemove={() => removeToken(t)}>
                      {t}
                    </Chip>
                  ))}
                </div>
              ) : null}
              {unknown.length ? (
                <>
                  <hr className={styles.summaryRule} />
                  <div className={cx(styles.summaryRow, styles.summaryRowError)}>
                    <span>Not recognized</span>
                    <span>{unknown.length}</span>
                  </div>
                  <div className={styles.chips}>
                    {unknown.map((t) => (
                      <Chip key={t} tone="red" onRemove={() => removeToken(t)}>
                        {t}
                      </Chip>
                    ))}
                  </div>
                </>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
      <div className={styles.dialogFooter}>
        <button type="button" className={styles.pillGrey} disabled={!text} onClick={() => setText("")}>
          Clear all
        </button>
        <button type="button" className={styles.pillYellow} disabled={!matched.length} onClick={() => onAdd(matched)}>
          Add list
        </button>
      </div>
    </div>
  );
  return anchor ? createPortal(dialog, document.body) : dialog;
}

/* ══════════════════════════════════════════════════════════════════════
 * RangeFilter — Figma "Sub-Filter section" › range (Z-Score Range, Copy Number)
 * ════════════════════════════════════════════════════════════════════ */

export type RangeOperator = "gt" | "lt" | "lte" | "gte" | "between";

export interface RangeValue {
  operator: RangeOperator;
  min: string;
  max: string;
}

const OPERATORS: Array<{ value: RangeOperator; label: string }> = [
  { value: "gt", label: "Greater than" },
  { value: "lt", label: "Less than" },
  { value: "lte", label: "Less than or equal" },
  { value: "gte", label: "Greater than or equal" },
  { value: "between", label: "Between" },
];

export const emptyRange = (): RangeValue => ({ operator: "between", min: "", max: "" });
const rangeApplied = (v: RangeValue) => (v.operator === "between" ? v.min !== "" || v.max !== "" : v.min !== "");

export interface RangeFilterProps {
  title: string;
  value: RangeValue;
  onChange: (value: RangeValue) => void;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  /** Placeholders for the low / high fields. */
  placeholders?: [string, string];
  /** Figma "disable" state: grey title + notice instead of the controls. */
  disabledReason?: ReactNode;
}

export function RangeFilter({
  title,
  value,
  onChange,
  expanded,
  onExpandedChange,
  placeholders = ["e.g. 0", "e.g. 26"],
  disabledReason,
}: RangeFilterProps) {
  const id = useId();
  const between = value.operator === "between";
  const opLabel = OPERATORS.find((o) => o.value === value.operator)!.label;

  return (
    <FilterSectionShell
      title={title}
      applied={!disabledReason && rangeApplied(value) ? 1 : 0}
      onClear={() => onChange(emptyRange())}
      expanded={expanded}
      onExpandedChange={onExpandedChange}
      disabled={Boolean(disabledReason)}
      className={styles.overflowVisible}
    >
      {disabledReason ? (
        <FilterNotice>{disabledReason}</FilterNotice>
      ) : (
        <div className={cx(styles.block, styles.rangeBlock)}>
          <OperatorSelect
            label={`${title} condition`}
            value={value.operator}
            onChange={(operator) => onChange({ ...value, operator })}
          />
          <div className={styles.rangeRow}>
            <input
              id={`${id}-min`}
              className={styles.field}
              inputMode="decimal"
              placeholder={placeholders[0]}
              aria-label={between ? `${title} from` : `${title} ${opLabel.toLowerCase()}`}
              value={value.min}
              onChange={(e) => onChange({ ...value, min: e.target.value })}
            />
            {between ? (
              <>
                <span className={styles.rangeTo} aria-hidden="true">
                  to
                </span>
                <input
                  id={`${id}-max`}
                  className={styles.field}
                  inputMode="decimal"
                  placeholder={placeholders[1]}
                  aria-label={`${title} to`}
                  value={value.max}
                  onChange={(e) => onChange({ ...value, max: e.target.value })}
                />
              </>
            ) : null}
          </div>
        </div>
      )}
    </FilterSectionShell>
  );
}

/** Operator dropdown — Figma "field" + "subtype" menu (single-select listbox). */
function OperatorSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: RangeOperator;
  onChange: (v: RangeOperator) => void;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(() => OPERATORS.findIndex((o) => o.value === value));
  const rootRef = useRef<HTMLDivElement | null>(null);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const current = OPERATORS.find((o) => o.value === value)!;

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const choose = (i: number) => {
    onChange(OPERATORS[i].value);
    setOpen(false);
    btnRef.current?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ")) {
      setActive(OPERATORS.findIndex((o) => o.value === value));
      setOpen(true);
    } else if (open && e.key === "ArrowDown") setActive((a) => Math.min(a + 1, OPERATORS.length - 1));
    else if (open && e.key === "ArrowUp") setActive((a) => Math.max(a - 1, 0));
    else if (open && (e.key === "Enter" || e.key === " ")) choose(active);
    else if (open && (e.key === "Escape" || e.key === "Tab")) {
      setOpen(false);
      if (e.key === "Tab") return;
    } else return;
    e.preventDefault();
  };

  return (
    <div ref={rootRef} className={styles.select}>
      <button
        ref={btnRef}
        type="button"
        className={cx(styles.field, styles.selectBtn)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-label={`${label}: ${current.label}`}
        aria-activedescendant={open ? `${id}-${active}` : undefined}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onKeyDown}
      >
        <span className={styles.selectValue}>{current.label}</span>
        <span className={styles.selectIcon} aria-hidden="true">
          <ChevronDown {...RAIL_ICON} className={cx(open && styles.flip)} />
        </span>
      </button>
      {open ? (
        <ul id={`${id}-list`} role="listbox" aria-label={label} className={styles.selectMenu}>
          {OPERATORS.map((o, i) => (
            <li
              key={o.value}
              id={`${id}-${i}`}
              role="option"
              aria-selected={o.value === value}
              className={cx(
                styles.selectOption,
                o.value === value && styles.selectOptionOn,
                i === active && styles.selectOptionActive,
              )}
              onMouseEnter={() => setActive(i)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => choose(i)}
            >
              {o.label}
              {o.value === value ? <Check size={16} aria-hidden="true" /> : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
 * VariantSearchFilter — Figma "Variant" (14364:79021)
 * ════════════════════════════════════════════════════════════════════ */

export interface VariantSearchFilterProps {
  value: string;
  onChange: (value: string) => void;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  /** Variant types the search is scoped to ("Searching variants in CNV only"). */
  scope?: string[];
}

export function VariantSearchFilter({ value, onChange, expanded, onExpandedChange, scope = [] }: VariantSearchFilterProps) {
  const id = useId();
  return (
    <FilterSectionShell
      title="Variant"
      applied={value.trim() ? 1 : 0}
      onClear={() => onChange("")}
      expanded={expanded}
      onExpandedChange={onExpandedChange}
    >
      <div className={styles.block}>
        <FieldLabel id={id} hint="Search by dbSNP ID (rs…) or protein change (p.…)">
          Search by variant name
        </FieldLabel>
        {scope.length ? (
          <p className={styles.helper} id={`${id}-scope`}>
            Searching variants in
            {scope.map((s) => (
              <span key={s} className={styles.helperBadge}>
                {s}
              </span>
            ))}
            only
          </p>
        ) : null}
        <input
          id={id}
          className={styles.field}
          placeholder="e.g. rs341, p.R175H"
          aria-describedby={scope.length ? `${id}-scope` : undefined}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete="off"
          spellCheck={false}
        />
      </div>
    </FilterSectionShell>
  );
}
