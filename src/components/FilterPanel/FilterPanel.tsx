import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { ButtonHTMLAttributes, KeyboardEvent, ReactNode } from "react";
import { ChevronDown, ChevronUp, FunnelX, Info, RotateCcw, Search, X } from "lucide-react";
import { CheckboxRow } from "../Checkbox/Checkbox";
import styles from "./FilterPanel.module.css";

const cx = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(" ");

const fmt = (n: number) => n.toLocaleString("en-US");

/** Figma draws every filter glyph at a true 2px stroke on a 20px box. */
export const RAIL_ICON = { size: 20, strokeWidth: 2, absoluteStrokeWidth: true } as const;

/* ══════════════════════════════════════════════════════════════════════
 * Text action ("Reset", "Collapse All", "1 more") — Figma `buttons`
 * instance: 32px pill, Body/Small/Bold, optional 20px leading glyph.
 * ════════════════════════════════════════════════════════════════════ */

interface TextActionProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: "neutral" | "brand";
  icon?: ReactNode;
}

function TextAction({ tone = "neutral", icon, className, children, ...rest }: TextActionProps) {
  return (
    <button
      type="button"
      className={cx(styles.textAction, tone === "brand" ? styles.brand : styles.neutral, className)}
      {...rest}
    >
      {icon ? (
        <span className={styles.textActionIcon} aria-hidden="true">
          {icon}
        </span>
      ) : null}
      {children}
    </button>
  );
}

/* ══════════════════════════════════════════════════════════════════════
 * FilterRail — the 83px "Filters" tab strip on the right edge
 * (Figma "Filter Tabs" 4291:19651).
 * ════════════════════════════════════════════════════════════════════ */

export interface FilterRailTab {
  value: string;
  label: string;
  /** 20px glyph — pass a lucide icon with `{...RAIL_ICON}`. */
  icon: ReactNode;
  /** Green badge on the icon: this domain has filters applied. */
  applied?: boolean;
}

export interface FilterRailProps {
  tabs: FilterRailTab[];
  /** Open domain; `null` when the side panel is closed. */
  value: string | null;
  /** Clicking the open tab again passes `null` (closes the panel). */
  onChange: (value: string | null) => void;
  onClearAll?: () => void;
  /** Figma "No filter — disable" state. */
  clearAllDisabled?: boolean;
  /** id of the side panel, for `aria-controls`. */
  panelId?: string;
  className?: string;
}

export function FilterRail({
  tabs,
  value,
  onChange,
  onClearAll,
  clearAllDisabled = false,
  panelId,
  className,
}: FilterRailProps) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    let next: number | undefined;
    if (e.key === "ArrowDown") next = (i + 1) % tabs.length;
    else if (e.key === "ArrowUp") next = (i - 1 + tabs.length) % tabs.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = tabs.length - 1;
    if (next === undefined) return;
    e.preventDefault();
    refs.current[next]?.focus();
  };

  return (
    <nav className={cx(styles.rail, className)} aria-label="Filters">
      <span className={styles.railTitle} aria-hidden="true">
        Filters
      </span>
      {tabs.map((tab, i) => {
        const open = tab.value === value;
        return (
          <button
            key={tab.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            className={cx(styles.railTab, open && styles.railTabOpen)}
            aria-expanded={open}
            aria-controls={open ? panelId : undefined}
            onClick={() => onChange(open ? null : tab.value)}
            onKeyDown={(e) => onKeyDown(e, i)}
          >
            <span className={styles.railIcon} aria-hidden="true">
              {tab.icon}
              {tab.applied ? <span className={styles.appliedBadge} /> : null}
            </span>
            <span className={styles.railLabel}>{tab.label}</span>
            {tab.applied ? <span className={styles.srOnly}> (filters applied)</span> : null}
          </button>
        );
      })}
      {onClearAll ? (
        <>
          <span className={styles.railDivider} aria-hidden="true" />
          <button
            type="button"
            className={cx(styles.railTab, styles.clearAll)}
            disabled={clearAllDisabled}
            onClick={onClearAll}
          >
            <span className={styles.railIcon} aria-hidden="true">
              <FunnelX {...RAIL_ICON} />
            </span>
            <span className={styles.railLabel}>Clear all</span>
          </button>
        </>
      ) : null}
    </nav>
  );
}

/* ══════════════════════════════════════════════════════════════════════
 * FilterPanel — "Filter Side Panel": 380px for checklist domains,
 * 480px (list) / 1106px (tree map) for Cancer category.
 * ════════════════════════════════════════════════════════════════════ */

export interface FilterPanelProps {
  id?: string;
  title: string;
  /** Header control (e.g. the Tree map / List view switch). */
  accessory?: ReactNode;
  /** `start` — right after the title (list view); `end` — before the actions (tree map). */
  accessoryAlign?: "start" | "end";
  onReset?: () => void;
  /** Figma dims Reset to 40 % when the domain has nothing to reset. */
  resetDisabled?: boolean;
  /** Renders "Collapse All" / "Expand All". */
  onToggleAll?: () => void;
  allCollapsed?: boolean;
  onClose?: () => void;
  /** Panel width in px. Default 380. */
  width?: number;
  children: ReactNode;
  className?: string;
}

export function FilterPanel({
  id,
  title,
  accessory,
  accessoryAlign = "start",
  onReset,
  resetDisabled,
  onToggleAll,
  allCollapsed = false,
  onClose,
  width = 380,
  children,
  className,
}: FilterPanelProps) {
  const titleId = useId();
  return (
    <section
      id={id}
      className={cx(styles.panel, className)}
      style={{ width }}
      aria-labelledby={titleId}
    >
      <header className={cx(styles.panelHeader, accessory != null && styles.hasAccessory)}>
        <div className={styles.panelTitleRow}>
          <h2 id={titleId} className={styles.panelTitle}>
            {title}
          </h2>
          {accessoryAlign === "start" ? accessory : null}
        </div>
        {accessoryAlign === "end" ? accessory : null}
        <div className={styles.panelActions}>
          {onReset ? (
            <TextAction icon={<RotateCcw {...RAIL_ICON} />} onClick={onReset} disabled={resetDisabled}>
              Reset
            </TextAction>
          ) : null}
          {onToggleAll ? (
            <TextAction tone="brand" onClick={onToggleAll}>
              {allCollapsed ? "Expand All" : "Collapse All"}
            </TextAction>
          ) : null}
          {onClose ? (
            <button
              type="button"
              className={styles.closeBtn}
              aria-label={`Close ${title} filters`}
              onClick={onClose}
            >
              <X {...RAIL_ICON} />
            </button>
          ) : null}
        </div>
      </header>
      <div className={styles.panelBody}>{children}</div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════════
 * FilterSection — "Sub-Filter V3": chevron, title, applied-count pill,
 * reset + search, then the "Sub-Filters / Input Type / Checklist".
 * ════════════════════════════════════════════════════════════════════ */

export interface FilterStat {
  /** 16px glyph, e.g. `<User size={16} />`. */
  icon: ReactNode;
  value: number;
  /** Accessible noun, e.g. "participants". */
  label: string;
}

export interface FilterOption {
  value: string;
  label: string;
  /** Single count badge (Figma "Badge Container", 41px). */
  count?: number;
  /** Icon-prefixed counts (Figma "Stat item") — used instead of `count`. */
  stats?: FilterStat[];
}

/** Figma "Stat item": 16px glyph + 30px count chip (Label/Regular). */
export function Stat({ icon, value, label, muted }: FilterStat & { muted?: boolean }) {
  return (
    <span className={cx(styles.stat, muted && styles.statMuted)}>
      <span className={styles.statIcon} aria-hidden="true">
        {icon}
      </span>
      <span className={styles.statChip}>
        {fmt(value)}
        <span className={styles.srOnly}> {label}</span>
      </span>
    </span>
  );
}

function optionBadge(o: { count?: number; stats?: FilterStat[] }) {
  if (o.stats?.length) {
    return (
      <span className={styles.stats}>
        {o.stats.map((st) => (
          <Stat key={st.label} {...st} />
        ))}
      </span>
    );
  }
  return o.count != null ? <span className={styles.count}>{fmt(o.count)}</span> : undefined;
}

/** How a section's selection combines (Figma "conditional filters", Insights-UI 7289:46590). */
export type FilterMatch = "any" | "none";

const MATCH_LABEL: Record<FilterMatch, string> = { any: "Any of", none: "None of" };

/** "Match: Any of ▾" — sits after the section title, divided by a hairline. */
function MatchSelect({
  title,
  value,
  onChange,
}: {
  title: string;
  value: FilterMatch;
  onChange: (value: FilterMatch) => void;
}) {
  const id = useId();
  return (
    <span className={styles.match}>
      <span className={styles.matchDivider} aria-hidden="true" />
      <label htmlFor={id} className={styles.matchLabel}>
        Match:
      </label>
      <span className={styles.matchControl}>
        <select
          id={id}
          className={styles.matchSelect}
          value={value}
          aria-label={`${title}: match`}
          onChange={(e) => onChange(e.target.value as FilterMatch)}
        >
          {(Object.keys(MATCH_LABEL) as FilterMatch[]).map((m) => (
            <option key={m} value={m}>
              {MATCH_LABEL[m]}
            </option>
          ))}
        </select>
        <ChevronDown className={styles.matchChevron} size={16} aria-hidden="true" />
      </span>
    </span>
  );
}

export interface FilterSectionProps {
  title: string;
  options: FilterOption[];
  /** Selected option values. */
  value: string[];
  onChange: (value: string[]) => void;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  /** Total for the "All" row. Defaults to the sum of option counts. */
  totalCount?: number;
  /** Rows (including "All") shown before the "N more" toggle. Default 6 (Figma). */
  visibleCount?: number;
  /** Stats on the "All" row (when options use `stats`). */
  totalStats?: FilterStat[];
  /** Show the header search toggle. Default true. */
  searchable?: boolean;
  /** Conditional match ("Any of" / "None of") shown after the title. Omit to hide it. */
  match?: FilterMatch;
  onMatchChange?: (match: FilterMatch) => void;
}

export function FilterSection({
  title,
  options,
  value,
  onChange,
  expanded,
  onExpandedChange,
  totalCount,
  visibleCount = 6,
  totalStats,
  searchable = true,
  match,
  onMatchChange,
}: FilterSectionProps) {
  const id = useId();
  const listId = `${id}-list`;
  const searchId = `${id}-search`;
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const searchBtnRef = useRef<HTMLButtonElement | null>(null);

  const selected = new Set(value);
  const applied = value.length;
  const total = totalCount ?? options.reduce((sum, o) => sum + (o.count ?? 0), 0);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? options.filter((o) => o.label.toLowerCase().includes(q)) : options;
  }, [options, query]);
  const filtering = query.trim() !== "";
  // "All" counts as a row, so the cap applies to it plus the options.
  const cap = Math.max(visibleCount - 1, 1);
  const shown = showAll || filtering ? matches : matches.slice(0, cap);
  const hidden = matches.length - shown.length;

  const allChecked = applied > 0 && applied === options.length;
  const toggle = (v: string) =>
    onChange(selected.has(v) ? value.filter((x) => x !== v) : [...value, v]);

  // Focus the field once it has rendered (opening also expands a collapsed section).
  useEffect(() => {
    if (searching) searchRef.current?.focus();
  }, [searching]);

  const closeSearch = () => {
    setQuery("");
    setSearching(false);
  };
  const toggleSearch = () => {
    if (searching) closeSearch();
    else {
      if (!expanded) onExpandedChange(true);
      setSearching(true);
    }
  };

  const usesStats = options.some((o) => o.stats?.length);

  return (
    <FilterSectionShell
      title={title}
      applied={applied}
      onClear={() => onChange([])}
      expanded={expanded}
      onExpandedChange={onExpandedChange}
      bodyId={listId}
      headerExtra={
        match && onMatchChange ? <MatchSelect title={title} value={match} onChange={onMatchChange} /> : undefined
      }
      actions={
        searchable ? (
          <button
            ref={searchBtnRef}
            type="button"
            className={cx(styles.iconBtn, searching && styles.iconBtnOn)}
            aria-label={`Search ${title}`}
            aria-expanded={searching}
            aria-controls={searching ? searchId : undefined}
            onClick={toggleSearch}
          >
            <Search {...RAIL_ICON} />
          </button>
        ) : null
      }
    >
        {searching ? (
          <div className={styles.searchRow}>
            <input
              ref={searchRef}
              id={searchId}
              type="text"
              className={styles.field}
              placeholder={`Search in ${title}`}
              aria-label={`Find a ${title.toLowerCase()} option`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  closeSearch();
                  searchBtnRef.current?.focus();
                }
              }}
            />
            <button
              type="button"
              className={styles.searchClose}
              aria-label={`Close ${title} search`}
              onClick={() => {
                closeSearch();
                searchBtnRef.current?.focus();
              }}
            >
              <X {...RAIL_ICON} />
            </button>
          </div>
        ) : null}

        {filtering && matches.length === 0 ? (
          <NoMatches />
        ) : (
          <div className={cx(styles.checklist, usesStats && styles.statList)} role="group" aria-label={title}>
            {!filtering ? (
              <CheckboxRow
                size="sm"
                label="All"
                count={optionBadge(usesStats ? { stats: totalStats } : { count: total })}
                checked={allChecked}
                indeterminate={applied > 0 && !allChecked}
                onChange={() => onChange(allChecked ? [] : options.map((o) => o.value))}
              />
            ) : null}
            {shown.map((o) => (
              <CheckboxRow
                key={o.value}
                size="sm"
                label={o.label}
                count={optionBadge(o)}
                checked={selected.has(o.value)}
                onChange={() => toggle(o.value)}
              />
            ))}
          </div>
        )}

        {!filtering && (hidden > 0 || showAll) && matches.length > cap ? (
          <div className={styles.more}>
            <TextAction tone="brand" className={styles.moreBtn} onClick={() => setShowAll((s) => !s)}>
              {showAll ? "Show less" : `${hidden} more`}
            </TextAction>
          </div>
        ) : null}
    </FilterSectionShell>
  );
}

/* ══════════════════════════════════════════════════════════════════════
 * FilterSectionShell — the "Sub-Filter section" frame shared by every
 * section type: chevron + title + applied pill + clear, then a body.
 * ════════════════════════════════════════════════════════════════════ */

export interface FilterSectionShellProps {
  title: string;
  /** Applied-count pill; 0 hides it and the clear button. */
  applied?: number;
  onClear?: () => void;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  /** Extra header buttons (e.g. search toggle). */
  actions?: ReactNode;
  /** Inline control right after the title (e.g. the "Match:" select). */
  headerExtra?: ReactNode;
  /** Figma "disable" state — greyed title (body still renders, e.g. a notice). */
  disabled?: boolean;
  bodyId?: string;
  className?: string;
  children: ReactNode;
}

export function FilterSectionShell({
  title,
  applied = 0,
  onClear,
  expanded,
  onExpandedChange,
  actions,
  headerExtra,
  disabled = false,
  bodyId,
  className,
  children,
}: FilterSectionShellProps) {
  const autoId = useId();
  const id = bodyId ?? `${autoId}-body`;
  return (
    <div
      className={cx(styles.section, expanded && styles.sectionOpen, disabled && styles.sectionDisabled, className)}
    >
      <div className={cx(styles.sectionHeader, headerExtra != null && styles.hasExtra)}>
        <button
          type="button"
          className={styles.sectionToggle}
          aria-expanded={expanded}
          aria-controls={id}
          onClick={() => onExpandedChange(!expanded)}
        >
          <span className={styles.iconBtnBox} aria-hidden="true">
            <ChevronUp className={styles.chevron} {...RAIL_ICON} />
          </span>
          <span className={styles.sectionTitle}>{title}</span>
          {applied > 0 ? (
            <span className={styles.appliedPill}>
              {applied}
              <span className={styles.srOnly}> selected</span>
            </span>
          ) : null}
        </button>
        {headerExtra != null ? <div className={styles.sectionExtra}>{headerExtra}</div> : null}
        <div className={styles.sectionActions}>
          {applied > 0 && onClear ? (
            <button type="button" className={styles.iconBtn} aria-label={`Clear ${title}`} onClick={onClear}>
              <RotateCcw {...RAIL_ICON} />
            </button>
          ) : null}
          {actions}
        </div>
      </div>
      <div id={id} className={styles.sectionBody} hidden={!expanded}>
        {children}
      </div>
    </div>
  );
}

/** Figma group divider band, e.g. "VARIANT CLASSIFICATION". */
export function FilterGroupLabel({ children }: { children: ReactNode }) {
  return (
    <div className={styles.groupLabel} role="heading" aria-level={3}>
      {children}
    </div>
  );
}

/** Figma "notification": grey info box, Body/Tiny. */
export function FilterNotice({ children }: { children: ReactNode }) {
  return (
    <div className={styles.notice} role="note">
      <span className={styles.noticeIcon} aria-hidden="true">
        <Info size={16} />
      </span>
      <p className={styles.noticeText}>{children}</p>
    </div>
  );
}

/** Figma "no result" copy, shared by sections and the cancer-category search. */
export function NoMatches() {
  return (
    <p className={styles.noMatches} role="status">
      No filter options matching your search.
      <br />
      Double check your spelling or try another search term.
    </p>
  );
}

/* ══════════════════════════════════════════════════════════════════════
 * FilterViewSwitch — "mode switcher tabs" (Tree map view / List view).
 * ════════════════════════════════════════════════════════════════════ */

export interface FilterViewSwitchProps<T extends string> {
  options: Array<{ value: T; label: string }>;
  value: T;
  onChange: (value: T) => void;
  "aria-label": string;
  /** Stretch to fill the title row (list view) or hug its content (tree map). */
  stretch?: boolean;
}

export function FilterViewSwitch<T extends string>({
  options,
  value,
  onChange,
  "aria-label": ariaLabel,
  stretch = false,
}: FilterViewSwitchProps<T>) {
  return (
    <div
      className={cx(styles.viewSwitch, stretch && styles.viewSwitchStretch)}
      role="group"
      aria-label={ariaLabel}
    >
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          className={cx(styles.viewOption, o.value === value && styles.viewOptionOn)}
          aria-pressed={o.value === value}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
