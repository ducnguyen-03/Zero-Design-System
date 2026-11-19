import { useId, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { ClipboardList, Dna, Download, UserRound } from "lucide-react";
import { LineChart, PieChart, StackedBarChart, fmtNumber } from "../../../components/Charts";
import { IconButton } from "../../../components/IconButton/IconButton";
import { Switch } from "../../../components/Switch/Switch";
import { CANCER_SHARES, EXPERIMENT_SHARES, MONITORING_STATS, QUARTER_SERIES, STUDY_SHARES, quarterData } from "./studyMonitoringData";
import type { MonitoringStat, QuarterGrouping, ShareRow } from "./studyMonitoringData";
import styles from "./StudyMonitoringView.module.css";

const cx = (...parts: Array<string | false | undefined>) => parts.filter(Boolean).join(" ");

const STAT_ICONS: Record<MonitoringStat["id"], ReactNode> = {
  enrolments: <UserRound />,
  sequencing: <Dna />,
  mtb: <ClipboardList />,
};

function StatCard({ stat }: { stat: MonitoringStat }) {
  return (
    <div className={styles.stat}>
      <span className={styles.statIcon} aria-hidden="true">
        {STAT_ICONS[stat.id]}
      </span>
      <span className={styles.statText}>
        <span className={styles.statValue}>{fmtNumber(stat.value).replace(/,/g, "")}</span>
        <span className={styles.statLabel}>{stat.label}</span>
      </span>
    </div>
  );
}

/** Donut + value/percentage legend (Figma "Study" card 15230:84920). */
function ShareCard({ title, rows }: { title: string; rows: ShareRow[] }) {
  const titleId = useId();
  const total = rows.reduce((a, r) => a + r.value, 0);
  return (
    <section className={styles.share} aria-labelledby={titleId}>
      <h2 id={titleId} className={styles.shareTitle}>
        {title}
      </h2>
      <div className={styles.donut}>
        <PieChart data={rows} donut={0.5} size={240} legend={false} label={`${title} distribution`} />
      </div>
      <ul className={styles.legend}>
        {rows.map((r) => (
          <li key={r.label} className={styles.legendRow}>
            <span className={styles.legendName}>
              <span className={styles.dot} style={{ background: r.color }} aria-hidden="true" />
              {r.label}
            </span>
            <span className={styles.legendValue}>
              <strong>{r.value}</strong>
              <span className={styles.legendPct}>({((r.value / total) * 100).toFixed(1)}%)</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

type QuarterView = "bar" | "cumulative" | "pie";

const GROUPINGS: Array<{ key: QuarterGrouping; label: string }> = [
  { key: "study", label: "By study" },
  { key: "cancer", label: "By cancer category" },
];

function ParticipantsPerQuarter() {
  const [grouping, setGrouping] = useState<QuarterGrouping>("study");
  const [view, setView] = useState<QuarterView>("bar");
  const panelTitle = useId();
  const series = QUARTER_SERIES[grouping];
  const data = quarterData(grouping);

  const cumulative = useMemo(
    () =>
      series.map((s) => {
        let run = 0;
        return { key: s.key, label: s.label, color: s.color, values: data.map((d) => (run += d.values[s.key] ?? 0)) };
      }),
    [series, data],
  );
  const totals = useMemo(
    () => series.map((s) => ({ label: s.label, color: s.color, value: data.reduce((a, d) => a + (d.values[s.key] ?? 0), 0) })),
    [series, data],
  );

  // One view at a time; switching the active one off falls back to the bar chart.
  const setOnly = (v: QuarterView) => (checked: boolean) => setView(checked ? v : "bar");

  return (
    <section className={styles.section} aria-labelledby="quarter-title">
      <header className={styles.sectionHead}>
        <h2 id="quarter-title" className={styles.sectionTitle}>
          Participants per quarter
        </h2>
        <div className={styles.segmented} role="group" aria-label="Group participants">
          {GROUPINGS.map((g) => (
            <button
              key={g.key}
              type="button"
              className={cx(styles.segment, grouping === g.key && styles.segmentActive)}
              aria-pressed={grouping === g.key}
              onClick={() => setGrouping(g.key)}
            >
              {g.label}
            </button>
          ))}
        </div>
        <IconButton aria-label="Download participants per quarter" icon={<Download />} size="md" />
      </header>
      <div className={styles.card}>
        <div className={styles.cardMain}>
          {view === "bar" ? (
            <StackedBarChart
              series={series}
              data={data}
              height={260}
              yLabel="Number of participants"
              label={`Participants per quarter, ${grouping === "study" ? "by study" : "by cancer category"}`}
              className={styles.quarterChart}
            />
          ) : view === "cumulative" ? (
            <LineChart
              labels={data.map((d) => d.label)}
              series={cumulative}
              height={260}
              yLabel="Cumulative participants"
              label="Cumulative participants per quarter"
            />
          ) : (
            <div className={styles.pieWrap}>
              <PieChart data={totals} size={260} label="Participants by group, all quarters" />
            </div>
          )}
        </div>
        <aside className={styles.side}>
          <div role="group" aria-labelledby={panelTitle} className={styles.switchGroup}>
            <span id={panelTitle} className={styles.panelTitle}>
              View
            </span>
            <Switch label="Bar Chart" checked={view === "bar"} onChange={(e) => setView(e.target.checked ? "bar" : "cumulative")} />
            <Switch label="Cumulative Chart" checked={view === "cumulative"} onChange={(e) => setOnly("cumulative")(e.target.checked)} />
            <Switch label="Pie Chart" checked={view === "pie"} onChange={(e) => setOnly("pie")(e.target.checked)} />
          </div>
        </aside>
      </div>
    </section>
  );
}

/** Study monitoring tab — Figma Insights-UI 15230:84688. */
export function StudyMonitoringView() {
  return (
    <div className={styles.root}>
      <div className={styles.stats} data-tour="monitoring">
        {MONITORING_STATS.map((s) => (
          <StatCard key={s.id} stat={s} />
        ))}
      </div>
      <div className={styles.shares}>
        <ShareCard title="Study" rows={STUDY_SHARES} />
        <ShareCard title="Experimental Distribution" rows={EXPERIMENT_SHARES} />
        <ShareCard title="Cancer Type" rows={CANCER_SHARES} />
      </div>
      <ParticipantsPerQuarter />
    </div>
  );
}
