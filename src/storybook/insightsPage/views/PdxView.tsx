import { useId, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Download, Settings, UserRound } from "lucide-react";
import { PieChart, StackedBarChart } from "../../../components/Charts/Plots";
import { UpSetPlot } from "../../../components/Charts/Genomic";
import { fmtNumber } from "../../../components/Charts/palette";
import { Switch } from "../../../components/Switch/Switch";
import { Button } from "../../../components/Button/Button";
import { IconButton } from "../../../components/IconButton/IconButton";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeaderCell,
  TableRow,
  TableToolbar,
} from "../../../components/Table/Table";
import {
  PDX_BY,
  PDX_CATEGORY_TOTALS,
  PDX_COLUMNS,
  PDX_CONTRIBUTORS,
  PDX_CONTRIBUTOR_SHARES,
  PDX_GROUPINGS,
  PDX_MICE_STRAINS,
  PDX_MODELS,
  PDX_TOTAL,
  PDX_VALIDATED_WITH,
  PDX_VALIDATION_INTERSECTIONS,
  PDX_VALIDATION_METHODS,
  PDX_VALIDATION_SETS,
  PDX_VALIDATION_TOTALS,
} from "./pdxData";
import type { ContributorKey, PdxGrouping, ValidationKey } from "./pdxData";
import styles from "./PdxView.module.css";

const cx = (...parts: Array<string | false | undefined>) => parts.filter(Boolean).join(" ");

/* ── Local building blocks ── */

function Section({ title, actions, children }: { title: ReactNode; actions?: ReactNode; children: ReactNode }) {
  const id = useId();
  return (
    <section className={styles.section} aria-labelledby={id}>
      <header className={styles.sectionHead}>
        <h3 id={id} className={styles.sectionTitle}>
          {title}
        </h3>
        {actions ? <div className={styles.sectionActions}>{actions}</div> : null}
      </header>
      {children}
    </section>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.tile}>
      <span className={styles.tileLabel}>{label}</span>
      <span className={styles.tileValue}>{value}</span>
    </div>
  );
}

function SwitchGroup({ title, children }: { title: string; children: ReactNode }) {
  const id = useId();
  return (
    <div className={styles.switchGroup} role="group" aria-labelledby={id}>
      <span id={id} className={styles.panelTitle}>
        {title}
      </span>
      <div className={styles.switchList}>{children}</div>
    </div>
  );
}

const download = (what: string) => <IconButton aria-label={`Download ${what}`} icon={<Download />} size="md" />;

/* ── 1. Summary panel ── */

function SummaryPanel() {
  return (
    <div className={styles.summary} data-tour="pdx">
      <div className={styles.summaryTotal}>
        <span className={styles.eyebrow}>PDX models available</span>
        <span className={styles.bigNumber}>{fmtNumber(PDX_TOTAL)}</span>
        <span className={cx(styles.eyebrow, styles.eyebrowAccent)}>Validated with</span>
        <dl className={styles.validatedGrid}>
          {PDX_VALIDATED_WITH.map((v) => (
            <div key={v.label} className={styles.validatedItem}>
              <dt className={styles.validatedShare}>{v.share}%</dt>
              <dd className={styles.validatedLabel}>{v.label}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className={styles.summaryGroup}>
        <span className={cx(styles.eyebrow, styles.groupTitle)}>Mice strains for PDX models</span>
        <div className={styles.tiles}>
          {PDX_MICE_STRAINS.map((m) => (
            <Tile key={m.label} {...m} />
          ))}
        </div>
      </div>
      <div className={styles.summaryGroup}>
        <span className={cx(styles.eyebrow, styles.groupTitle)}>Model contributors</span>
        <div className={styles.tiles}>
          {PDX_CONTRIBUTOR_SHARES.map((m) => (
            <Tile key={m.label} {...m} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── 2. PDX models by Event, Age, Sex at Birth ── */

function DistributionSection() {
  const [grouping, setGrouping] = useState<PdxGrouping>("event");
  const [view, setView] = useState<"bar" | "pie">("bar");
  const current = PDX_BY[grouping];
  const groupLabel = PDX_GROUPINGS.find((g) => g.key === grouping)?.label.toLowerCase() ?? "";
  return (
    <Section
      title="PDX Models by Event, Age, Sex at Birth"
      actions={
        <>
          <div className={styles.segmented} role="group" aria-label="Group PDX models">
            {PDX_GROUPINGS.map((g) => (
              <button
                key={g.key}
                type="button"
                className={cx(styles.segment, grouping === g.key && styles.segmentActive)}
                aria-pressed={grouping === g.key}
                onClick={() => setGrouping(g.key)}
                disabled={view === "pie"}
              >
                {g.label}
              </button>
            ))}
          </div>
          {download("PDX models chart")}
        </>
      }
    >
      <div className={styles.card}>
        <div className={styles.cardMain}>
          {view === "bar" ? (
            <StackedBarChart
              series={current.series}
              data={current.data}
              height={320}
              yLabel="Number of PDX models"
              label={`PDX models by cancer category, ${groupLabel}`}
              className={styles.stacked}
            />
          ) : (
            <PieChart data={PDX_CATEGORY_TOTALS} label="PDX models by cancer category" size={260} className={styles.pie} />
          )}
        </div>
        <aside className={styles.cardPanel}>
          <SwitchGroup title="View">
            <Switch label="Bar chart" checked={view === "bar"} onChange={(e) => setView(e.target.checked ? "bar" : "pie")} />
            <Switch label="Pie chart" checked={view === "pie"} onChange={(e) => setView(e.target.checked ? "pie" : "bar")} />
          </SwitchGroup>
        </aside>
      </div>
    </Section>
  );
}

/* ── 3. Validation performed ── */

const allOn = <K extends string>(keys: K[]) => Object.fromEntries(keys.map((k) => [k, true])) as Record<K, boolean>;

function ValidationSection() {
  const [methods, setMethods] = useState(() => allOn<ValidationKey>(PDX_VALIDATION_METHODS.map((m) => m.key)));
  const [contributors, setContributors] = useState(() => allOn<ContributorKey>(PDX_CONTRIBUTORS.map((c) => c.key)));
  const [showEmpty, setShowEmpty] = useState(false);

  const { sets, intersections, totals } = useMemo(() => {
    const activeContrib = PDX_CONTRIBUTORS.filter((c) => contributors[c.key]);
    const share = activeContrib.reduce((a, c) => a + c.models, 0) / PDX_TOTAL;
    const scale = (n: number) => Math.round(n * share);
    return {
      sets: PDX_VALIDATION_SETS.filter((s) => methods[s.key]).map((s) => ({ ...s, size: scale(s.size) })),
      intersections: PDX_VALIDATION_INTERSECTIONS.filter((x) => x.sets.every((k) => methods[k]))
        .map((x) => ({ sets: x.sets, value: activeContrib.reduce((a, c) => a + x.by[c.key], 0) }))
        .filter((x) => showEmpty || x.value > 0)
        .sort((a, b) => b.value - a.value),
      totals: PDX_VALIDATION_TOTALS.map((t) => ({ ...t, value: scale(t.value), off: t.key !== "all" && !methods[t.key] })),
    };
  }, [methods, contributors, showEmpty]);

  return (
    <Section title="Validation Performed" actions={download("validation chart")}>
      <div className={styles.card}>
        <div className={cx(styles.cardMain, styles.validationMain)}>
          <div className={styles.stats}>
            <div className={styles.statsHead}>
              <span className={styles.statsIcon} aria-hidden="true">
                <UserRound />
              </span>
              <span className={styles.statsHeadLabel}>PDX model totals</span>
            </div>
            <dl className={styles.statsCells}>
              {totals.map((t) => (
                <div key={t.key} className={cx(styles.statsCell, t.off && styles.statsCellOff)}>
                  <dt className={styles.statsLabel}>{t.label}</dt>
                  <dd className={styles.statsValue}>{fmtNumber(t.value)}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className={styles.upsetWell}>
            {sets.length && intersections.length ? (
              <UpSetPlot
                sets={sets}
                intersections={intersections}
                height={140}
                yLabel="Number of PDX models"
                label="Validation methods performed per PDX model"
              />
            ) : (
              <p className={styles.empty}>No PDX models match the selected validation methods and contributors.</p>
            )}
          </div>
        </div>
        <aside className={styles.cardPanel}>
          <SwitchGroup title="Validation Method">
            {PDX_VALIDATION_METHODS.map((m) => (
              <Switch
                key={m.key}
                label={m.label}
                checked={methods[m.key]}
                onChange={(e) => setMethods((s) => ({ ...s, [m.key]: e.target.checked }))}
              />
            ))}
          </SwitchGroup>
          <SwitchGroup title="Contributors">
            {PDX_CONTRIBUTORS.map((c) => (
              <Switch
                key={c.key}
                label={c.label}
                checked={contributors[c.key]}
                onChange={(e) => setContributors((s) => ({ ...s, [c.key]: e.target.checked }))}
              />
            ))}
          </SwitchGroup>
          <SwitchGroup title="Display">
            <Switch label="Show empty" checked={showEmpty} onChange={(e) => setShowEmpty(e.target.checked)} />
          </SwitchGroup>
        </aside>
      </div>
    </Section>
  );
}

/* ── 4. PDX models table ── */

function ModelsTable() {
  return (
    <TableContainer
      toolbar={
        <TableToolbar
          className={styles.tableToolbar}
          summary={`${fmtNumber(PDX_TOTAL)} PDX models`}
          actions={
            <Button variant="subtle" size="sm" startIcon={<Settings />}>
              Manage and export
            </Button>
          }
        />
      }
    >
      <Table caption="PDX models" captionHidden>
        <TableHead>
          <TableRow>
            {PDX_COLUMNS.map((c) => (
              <TableHeaderCell key={c.key}>{c.label}</TableHeaderCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {PDX_MODELS.map((row) => (
            <TableRow key={row.id}>
              {PDX_COLUMNS.map((c) => (
                <TableCell key={c.key}>{row[c.key]}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

/** Insights data explorer — the "PDX models" tab body (below the view tabs). */
export function PdxView(): JSX.Element {
  return (
    <div className={styles.root}>
      <SummaryPanel />
      <DistributionSection />
      <ValidationSection />
      <ModelsTable />
    </div>
  );
}
