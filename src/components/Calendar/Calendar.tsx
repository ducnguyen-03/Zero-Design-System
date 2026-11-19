import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { HTMLAttributes, KeyboardEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./Calendar.module.css";

const cx = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(" ");

/* ------------------------------------------------------------------ */
/* Native-Date helpers (no date library)                               */
/* ------------------------------------------------------------------ */

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const daysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
/** Add months, clamping the day (31 Jan + 1 month → 28/29 Feb). */
const addMonths = (d: Date, n: number) => {
  const y = d.getFullYear();
  const m = d.getMonth() + n;
  const target = new Date(y, m, 1);
  const day = Math.min(d.getDate(), daysInMonth(target.getFullYear(), target.getMonth()));
  return new Date(target.getFullYear(), target.getMonth(), day);
};
const sameDay = (a: Date | null | undefined, b: Date | null | undefined) =>
  !!a &&
  !!b &&
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();
const sameMonth = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
const dayKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const monthIndex = (d: Date) => d.getFullYear() * 12 + d.getMonth();

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type CalendarSize = "sm" | "md" | "lg";

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

interface CalendarBaseProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  /** Figma Size=Small / Medium / Large. */
  size?: CalendarSize;
  /** Controlled first visible month. */
  month?: Date;
  /** Initial visible month when uncontrolled. Defaults to the selection or today. */
  defaultMonth?: Date;
  onMonthChange?: (month: Date) => void;
  /** Months rendered side by side (2 = the "Advanced Date Picker" layout). */
  numberOfMonths?: 1 | 2;
  minDate?: Date;
  maxDate?: Date;
  /** Extra per-day disabling rule. */
  isDateDisabled?: (date: Date) => boolean;
  /** 0 = Sunday (Figma default), 1 = Monday. */
  weekStartsOn?: 0 | 1;
  /** BCP 47 locale for month / weekday names. */
  locale?: string;
  /** Render leading / trailing days of adjacent months (inactive). Single-month only. */
  showOutsideDays?: boolean;
  /** Used to compute the "today" marker; handy for stable stories/tests. */
  today?: Date;
}

export interface CalendarSingleProps extends CalendarBaseProps {
  mode?: "single";
  value?: Date | null;
  defaultValue?: Date | null;
  onChange?: (date: Date) => void;
}

export interface CalendarRangeProps extends CalendarBaseProps {
  mode: "range";
  value?: DateRange;
  defaultValue?: DateRange;
  onChange?: (range: DateRange) => void;
}

export type CalendarProps = CalendarSingleProps | CalendarRangeProps;

const EMPTY_RANGE: DateRange = { start: null, end: null };

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export function Calendar(props: CalendarProps) {
  const {
    size = "md",
    month: monthProp,
    defaultMonth,
    onMonthChange,
    numberOfMonths = 1,
    minDate,
    maxDate,
    isDateDisabled,
    weekStartsOn = 0,
    locale,
    showOutsideDays = true,
    today: todayProp,
    className,
    mode: _mode,
    value: _value,
    defaultValue: _defaultValue,
    onChange: _onChange,
    ...rest
  } = props;
  void _mode;
  void _value;
  void _defaultValue;
  void _onChange;

  const isRange = props.mode === "range";
  const today = useMemo(() => startOfDay(todayProp ?? new Date()), [todayProp]);

  /* ----- selection state (controlled / uncontrolled) ----- */
  const [innerSingle, setInnerSingle] = useState<Date | null>(
    !isRange ? ((props as CalendarSingleProps).defaultValue ?? null) : null,
  );
  const [innerRange, setInnerRange] = useState<DateRange>(
    isRange ? ((props as CalendarRangeProps).defaultValue ?? EMPTY_RANGE) : EMPTY_RANGE,
  );
  const single: Date | null = !isRange
    ? (props as CalendarSingleProps).value !== undefined
      ? ((props as CalendarSingleProps).value ?? null)
      : innerSingle
    : null;
  const range: DateRange = isRange
    ? ((props as CalendarRangeProps).value ?? innerRange)
    : EMPTY_RANGE;

  const anchor = (isRange ? range.start : single) ?? today;

  /* ----- visible month ----- */
  const [innerMonth, setInnerMonth] = useState<Date>(startOfMonth(defaultMonth ?? anchor));
  const month = startOfMonth(monthProp ?? innerMonth);
  const setMonth = (m: Date) => {
    const next = startOfMonth(m);
    if (monthProp === undefined) setInnerMonth(next);
    onMonthChange?.(next);
  };

  /* ----- focus (roving tabindex) ----- */
  const [focused, setFocused] = useState<Date>(startOfDay(anchor));
  const [hovered, setHovered] = useState<Date | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const uid = useId();
  const moveFocusRef = useRef(false);

  const visibleMonths = Array.from({ length: numberOfMonths }, (_, i) => addMonths(month, i));
  const firstIdx = monthIndex(month);
  const lastIdx = firstIdx + numberOfMonths - 1;
  const isVisible = (d: Date) => monthIndex(d) >= firstIdx && monthIndex(d) <= lastIdx;
  const tabbable = isVisible(focused)
    ? focused
    : (() => {
        const sel = isRange ? range.start : single;
        return sel && isVisible(sel) ? sel : month;
      })();

  useEffect(() => {
    if (!moveFocusRef.current) return;
    moveFocusRef.current = false;
    const el = rootRef.current?.querySelector<HTMLButtonElement>(
      `button[data-date="${dayKey(focused)}"]`,
    );
    el?.focus();
  }, [focused, firstIdx]);

  const disabled = (d: Date) =>
    (!!minDate && d < startOfDay(minDate)) ||
    (!!maxDate && d > startOfDay(maxDate)) ||
    (!!isDateDisabled && isDateDisabled(d));

  /* ----- formatting ----- */
  const monthFmt = useMemo(
    () => new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }),
    [locale],
  );
  const dayLabelFmt = useMemo(
    () => new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
    [locale],
  );
  const weekdayShort = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(locale, { weekday: "short" });
    const fmtLong = new Intl.DateTimeFormat(locale, { weekday: "long" });
    // 2026-01-04 is a Sunday.
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(2026, 0, 4 + ((i + weekStartsOn) % 7));
      return { short: fmt.format(d).slice(0, 2), long: fmtLong.format(d) };
    });
  }, [locale, weekStartsOn]);

  /* ----- selection ----- */
  const select = (d: Date) => {
    if (disabled(d)) return;
    setFocused(d);
    if (!isRange) {
      if ((props as CalendarSingleProps).value === undefined) setInnerSingle(d);
      (props as CalendarSingleProps).onChange?.(d);
      return;
    }
    let next: DateRange;
    if (!range.start || range.end) next = { start: d, end: null };
    else if (d < range.start) next = { start: d, end: range.start };
    else next = { start: range.start, end: d };
    if ((props as CalendarRangeProps).value === undefined) setInnerRange(next);
    (props as CalendarRangeProps).onChange?.(next);
  };

  /* ----- keyboard ----- */
  const moveTo = (d: Date) => {
    moveFocusRef.current = true;
    setFocused(d);
    if (monthIndex(d) < firstIdx) setMonth(startOfMonth(d));
    else if (monthIndex(d) > lastIdx) setMonth(addMonths(startOfMonth(d), -(numberOfMonths - 1)));
  };
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (!target.dataset.date) return;
    const dow = (focused.getDay() - weekStartsOn + 7) % 7;
    let next: Date | null = null;
    switch (e.key) {
      case "ArrowLeft": next = addDays(focused, -1); break;
      case "ArrowRight": next = addDays(focused, 1); break;
      case "ArrowUp": next = addDays(focused, -7); break;
      case "ArrowDown": next = addDays(focused, 7); break;
      case "Home": next = addDays(focused, -dow); break;
      case "End": next = addDays(focused, 6 - dow); break;
      case "PageUp": next = addMonths(focused, e.shiftKey ? -12 : -1); break;
      case "PageDown": next = addMonths(focused, e.shiftKey ? 12 : 1); break;
      default: return;
    }
    e.preventDefault();
    moveTo(next);
    if (isRange && range.start && !range.end) setHovered(next);
  };

  /* ----- range helpers ----- */
  const rangeEnd = isRange ? (range.end ?? (range.start ? hovered : null)) : null;
  const [lo, hi] =
    isRange && range.start && rangeEnd
      ? range.start <= rangeEnd
        ? [range.start, rangeEnd]
        : [rangeEnd, range.start]
      : [null, null];

  const renderMonth = (m: Date, index: number) => {
    const first = startOfMonth(m);
    const offset = (first.getDay() - weekStartsOn + 7) % 7;
    const gridStart = addDays(first, -offset);
    const weeks = Array.from({ length: 6 }, (_, w) =>
      Array.from({ length: 7 }, (_, d) => addDays(gridStart, w * 7 + d)),
    );
    const titleId = `${uid}-${dayKey(first)}`;
    const outside = showOutsideDays && numberOfMonths === 1;
    return (
      <div className={styles.month} key={dayKey(first)}>
        <div className={styles.header}>
          {index === 0 ? (
            <button
              type="button"
              className={styles.nav}
              aria-label="Previous month"
              onClick={() => setMonth(addMonths(month, -1))}
            >
              <ChevronLeft aria-hidden="true" />
            </button>
          ) : (
            <span className={styles.navSpacer} />
          )}
          <h2 className={styles.title} id={titleId} aria-live="polite">
            {monthFmt.format(first)}
          </h2>
          {index === numberOfMonths - 1 ? (
            <button
              type="button"
              className={styles.nav}
              aria-label="Next month"
              onClick={() => setMonth(addMonths(month, 1))}
            >
              <ChevronRight aria-hidden="true" />
            </button>
          ) : (
            <span className={styles.navSpacer} />
          )}
        </div>
        <table className={styles.grid} role="grid" aria-labelledby={titleId}>
          <thead>
            <tr>
              {weekdayShort.map((w) => (
                <th key={w.long} scope="col" abbr={w.long} className={styles.weekday}>
                  {w.short}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weeks.map((week) => (
              <tr key={dayKey(week[0])}>
                {week.map((d) => {
                  const inMonth = sameMonth(d, first);
                  if (!inMonth) {
                    return (
                      <td key={dayKey(d)} className={styles.cell} role="presentation">
                        {outside ? (
                          <span className={cx(styles.day, styles.inactive)} aria-hidden="true">
                            {d.getDate()}
                          </span>
                        ) : null}
                      </td>
                    );
                  }
                  const isDisabled = disabled(d);
                  const isSelected = isRange
                    ? sameDay(d, range.start) || sameDay(d, range.end)
                    : sameDay(d, single);
                  const isEndpoint = isRange && (sameDay(d, lo) || sameDay(d, hi));
                  const inPeriod = !!lo && !!hi && d > lo && d < hi;
                  const isToday = sameDay(d, today);
                  return (
                    <td
                      key={dayKey(d)}
                      className={cx(
                        styles.cell,
                        (isSelected || isEndpoint) && styles.cellSelected,
                        inPeriod && styles.cellPeriod,
                      )}
                      role="gridcell"
                      aria-selected={isSelected || inPeriod || undefined}
                    >
                      <button
                        type="button"
                        data-date={dayKey(d)}
                        className={cx(
                          styles.day,
                          (isSelected || isEndpoint) && styles.selected,
                          inPeriod && styles.period,
                          isDisabled && styles.inactive,
                          isToday && styles.today,
                        )}
                        tabIndex={sameDay(d, tabbable) ? 0 : -1}
                        aria-label={dayLabelFmt.format(d)}
                        aria-current={isToday ? "date" : undefined}
                        aria-disabled={isDisabled || undefined}
                        onClick={() => select(d)}
                        onFocus={() => setFocused(d)}
                        onMouseEnter={isRange ? () => setHovered(d) : undefined}
                      >
                        {d.getDate()}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div
      ref={rootRef}
      className={cx(styles.calendar, styles[size], numberOfMonths > 1 && styles.multi, className)}
      onKeyDown={onKeyDown}
      onMouseLeave={isRange ? () => setHovered(null) : undefined}
      {...rest}
    >
      {visibleMonths.map(renderMonth)}
    </div>
  );
}
