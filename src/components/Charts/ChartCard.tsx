import { useId } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { Info } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "../Table/Table";
import { Tooltip } from "../Tooltip/Tooltip";
import { ProportionBar, ChartLegend } from "./ProportionBar";
import { ALTERATION_COLORS, fmtNumber } from "./palette";
import type { AlterationType } from "./palette";
import styles from "./Charts.module.css";

const cx = (...parts: Array<string | false | undefined>) => parts.filter(Boolean).join(" ");

/* ─────────────────────────── Chart card ─────────────────────────── */

export interface ChartCardProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  title: ReactNode;
  /** Inline controls after the title — e.g. "across [Sample ▾]", "by [Study ▾] per [Qtr ▾]". */
  controls?: ReactNode;
  /** Right-aligned icon actions (menu, expand). */
  actions?: ReactNode;
  /** Note under the chart: source, suppression rule. */
  footnote?: ReactNode;
  children: ReactNode;
}

/** The summary-page frame for one chart: title, inline controls, actions, chart, footnote. */
export function ChartCard({ title, controls, actions, footnote, children, className, ...rest }: ChartCardProps) {
  const id = useId();
  return (
    <section className={cx(styles.card, className)} aria-labelledby={id} {...rest}>
      <header className={styles.cardHead}>
        <h3 id={id} className={styles.cardTitle}>
          {title}
        </h3>
        {controls ? <div className={styles.cardControls}>{controls}</div> : null}
        {actions ? <div className={styles.cardActions}>{actions}</div> : null}
      </header>
      <div className={styles.cardBody}>{children}</div>
      {footnote ? <p className={styles.footnote}>{footnote}</p> : null}
    </section>
  );
}

/* ─────────────────────────── Metric card ─────────────────────────── */

export interface MetricCardProps extends HTMLAttributes<HTMLElement> {
  /** "Total participants". */
  label: string;
  value: number;
  /** Everything that exists, shown as "/ 4,500". */
  total?: number;
  /** Explains the metric — shown in a DS tooltip on the info icon. */
  info?: string;
  /** Labels for the split. Default "Published" / "Unpublished". */
  partLabel?: string;
  restLabel?: string;
  color?: string;
  /** Click on the rest (e.g. open "what is unpublished"). */
  onRestClick?: () => void;
}

/** A headline count with what it is part of: value / total, a split bar and its legend. */
export function MetricCard({
  label,
  value,
  total,
  info,
  partLabel = "Published",
  restLabel = "Unpublished",
  color,
  onRestClick,
  className,
  ...rest
}: MetricCardProps) {
  const fill = color ?? "var(--insight-color-green-150)";
  return (
    <section className={cx(styles.metric, className)} aria-label={label} {...rest}>
      <span className={styles.metricLabel}>
        {label}
        {info ? (
          <Tooltip label={info} placement="bottom" appearance="light">
            <button type="button" className={styles.infoButton} aria-label={`About ${label.toLowerCase()}`}>
              <Info aria-hidden="true" />
            </button>
          </Tooltip>
        ) : null}
      </span>
      <span className={styles.metricValue}>
        {fmtNumber(value)}
        {total !== undefined ? <span className={styles.metricTotal}> / {fmtNumber(total)}</span> : null}
      </span>
      {total !== undefined ? (
        <>
          <ProportionBar value={value} total={total} color={fill} size="sm" />
          <div className={styles.metricLegend}>
            <ChartLegend items={[{ label: `${fmtNumber(value)} ${partLabel}`, color: fill }]} />
            {total > value ? (
              onRestClick ? (
                <button type="button" className={styles.metricRest} onClick={onRestClick}>
                  <span className={styles.swatch} style={{ background: "var(--insight-color-grey-50)" }} aria-hidden="true" />
                  {fmtNumber(total - value)} {restLabel}
                </button>
              ) : (
                <ChartLegend items={[{ label: `${fmtNumber(total - value)} ${restLabel}`, color: "var(--insight-color-grey-50)" }]} />
              )
            ) : null}
          </div>
        </>
      ) : null}
    </section>
  );
}

/* ─────────────────────────── Ranked table ─────────────────────────── */

export interface RankedRow {
  label: string;
  value: number;
  /** Share of the whole, 0–1. */
  share: number;
  color?: string;
}

export interface RankedTableProps extends HTMLAttributes<HTMLDivElement> {
  rows: RankedRow[];
  /** Column headers. Default "Category" / "Count" / "Freq". */
  labelHeader?: string;
  valueHeader?: string;
  shareHeader?: string;
}

/** "Top 10 … by frequency": a colour key, the count and the share. */
export function RankedTable({ rows, labelHeader = "Category", valueHeader = "Count", shareHeader = "Freq", className, ...rest }: RankedTableProps) {
  return (
    <div className={cx(styles.tableWrap, className)} {...rest}>
      <Table caption={labelHeader} captionHidden className={styles.compact}>
        <TableHead>
          <TableRow>
            <TableHeaderCell>{labelHeader}</TableHeaderCell>
            <TableHeaderCell>{valueHeader}</TableHeaderCell>
            <TableHeaderCell>{shareHeader}</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((r, i) => (
            <TableRow key={`${r.label}-${i}`}>
              <TableCell>
                <span className={styles.keyed}>
                  <span className={cx(styles.swatch, styles.swatchSquare)} style={{ background: r.color }} aria-hidden="true" />
                  {r.label}
                </span>
              </TableCell>
              <TableCell className={styles.num}>{fmtNumber(r.value)}</TableCell>
              <TableCell className={styles.num}>{(r.share * 100).toFixed(1)}%</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

/* ─────────────────────────── Gene mutation table ─────────────────────────── */

export interface GeneMutationRow {
  gene: string;
  mutations: number;
  samples: number;
  /** Share of samples, 0–1. */
  freq: number;
  /** Mutations by alteration class — drawn as a stacked mini bar. */
  breakdown: Partial<Record<AlterationType, number>>;
}

export interface GeneMutationTableProps extends HTMLAttributes<HTMLDivElement> {
  rows: GeneMutationRow[];
}

/** Genes ranked by how many samples carry them, with each gene's mix of alteration classes. */
export function GeneMutationTable({ rows, className, ...rest }: GeneMutationTableProps) {
  const types = Object.keys(ALTERATION_COLORS) as AlterationType[];
  const used = types.filter((t) => rows.some((r) => r.breakdown[t]));
  return (
    <div className={cx(styles.tableWrap, className)} {...rest}>
      <Table caption="Gene mutations" captionHidden className={styles.compact}>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Gene</TableHeaderCell>
            <TableHeaderCell># Mutation</TableHeaderCell>
            <TableHeaderCell># Samples</TableHeaderCell>
            <TableHeaderCell>Freq</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((r, i) => {
            const sum = Object.values(r.breakdown).reduce((a, b) => a + (b ?? 0), 0) || 1;
            return (
              <TableRow key={`${r.gene}-${i}`}>
                <TableCell>
                  <span className={styles.gene}>{r.gene}</span>
                </TableCell>
                <TableCell>
                  <span className={styles.mixCell}>
                    <span className={styles.num}>{fmtNumber(r.mutations)}</span>
                    <span
                      className={styles.mix}
                      role="img"
                      aria-label={used.filter((t) => r.breakdown[t]).map((t) => `${t} ${r.breakdown[t]}`).join(", ")}
                    >
                      {used.map((t) =>
                        r.breakdown[t] ? (
                          <span key={t} style={{ flexGrow: r.breakdown[t]! / sum, background: ALTERATION_COLORS[t] }} />
                        ) : null,
                      )}
                    </span>
                  </span>
                </TableCell>
                <TableCell className={styles.num}>{fmtNumber(r.samples)}</TableCell>
                <TableCell className={styles.num}>{(r.freq * 100).toFixed(1)}%</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <ChartLegend items={used.map((t) => ({ label: t, color: ALTERATION_COLORS[t] }))} swatch="square" className={styles.tableLegend} />
    </div>
  );
}
