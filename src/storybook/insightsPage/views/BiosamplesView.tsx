import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Check, Download, Settings, UserRound } from "lucide-react";
import { Button } from "../../../components/Button/Button";
import { IconButton } from "../../../components/IconButton/IconButton";
import { Switch } from "../../../components/Switch/Switch";
import { Tabs } from "../../../components/Tabs/Tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "../../../components/Table/Table";
import { ChartCard, Oncoprint, PieChart, StackedBarChart, UpSetPlot, fmtNumber } from "../../../components/Charts";
import {
  CATEGORY_TOTALS,
  DISEASE_TOGGLE,
  GENOMIC_SUMMARY,
  ONCO_CLINICAL_TRACKS,
  ONCO_GENES,
  ONCO_SAMPLE_IDS,
  PARTICIPANTS,
  PARTICIPANT_COUNT,
  PARTICIPANT_TOTALS,
  SEQ_OPTIONS,
  SEQ_UPSET_INTERSECTIONS,
  SEQ_UPSET_SETS,
  diseaseChart,
} from "./biosamplesData";
import type { DiseaseBreakdown, SeqKey } from "./biosamplesData";
import styles from "./BiosamplesView.module.css";

/* ─────────────────────────── shared bits ─────────────────────────── */

function SectionHeader({ id, title, children }: { id: string; title: string; children?: ReactNode }) {
  return (
    <header className={styles.sectionHeader}>
      <h3 id={id} className={styles.sectionTitle}>
        {title}
      </h3>
      {children}
      <IconButton aria-label="Download" icon={<Download />} size="md" />
    </header>
  );
}

/** Right-hand settings column inside a chart card. */
function SidePanel({ children }: { children: ReactNode }) {
  return <aside className={styles.side}>{children}</aside>;
}

function PanelGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className={styles.group}>
      <legend className={styles.groupTitle}>{title}</legend>
      <div className={styles.switches}>{children}</div>
    </fieldset>
  );
}

/* ─────────────────────────── 1 · diseases ─────────────────────────── */

function DiseasesSection() {
  const [by, setBy] = useState<DiseaseBreakdown>("event");
  const [showBar, setShowBar] = useState(true);
  const [showPie, setShowPie] = useState(false);
  const chart = useMemo(() => diseaseChart(by), [by]);
  const byLabel = DISEASE_TOGGLE.find((t) => t.value === by)?.label.toLowerCase() ?? "";

  return (
    <section className={styles.section} aria-labelledby="bio-diseases">
      <SectionHeader id="bio-diseases" title="Diseases by Event, Age, Sex at Birth">
        <Tabs
          items={DISEASE_TOGGLE}
          value={by}
          onChange={(v) => setBy(v as DiseaseBreakdown)}
          variant="secondary"
          size="sm"
          aria-label="Break diseases down"
          className={styles.toggle}
        />
      </SectionHeader>

      <div className={styles.card}>
        <div className={styles.cardMain}>
          {showBar ? (
            <StackedBarChart
              series={chart.series}
              data={chart.data}
              height={300}
              yLabel="Number of participants"
              label={`Participants by cancer category, ${byLabel}`}
            />
          ) : null}
          {showPie ? (
            <div className={styles.pie}>
              <PieChart data={CATEGORY_TOTALS} size={240} label="Participants by cancer category" />
            </div>
          ) : null}
          {!showBar && !showPie ? <p className={styles.empty}>Turn on a chart in View to see the data.</p> : null}
        </div>
        <SidePanel>
          <PanelGroup title="View">
            <Switch label="Bar chart" checked={showBar} onChange={(e) => setShowBar(e.target.checked)} />
            <Switch label="Pie chart" checked={showPie} onChange={(e) => setShowPie(e.target.checked)} />
          </PanelGroup>
        </SidePanel>
      </div>
    </section>
  );
}

/* ─────────────────────────── 2 · sequencing ─────────────────────────── */

const ALL_ON = Object.fromEntries(SEQ_OPTIONS.map((o) => [o.key, true])) as Record<SeqKey, boolean>;

function SequencingSection() {
  const [on, setOn] = useState<Record<SeqKey, boolean>>(ALL_ON);
  const [showEmpty, setShowEmpty] = useState(false);

  const sets = SEQ_UPSET_SETS.filter((s) => on[s.key] && (showEmpty || s.size > 0));
  const keys = new Set<string>(sets.map((s) => s.key));
  const intersections = SEQ_UPSET_INTERSECTIONS.filter(
    (x) => x.sets.every((k) => keys.has(k)) && (showEmpty || x.value > 0),
  );

  return (
    <section className={styles.section} aria-labelledby="bio-seq">
      <SectionHeader id="bio-seq" title="Combined sequencing performed per patient" />

      <div className={styles.card}>
        <div className={styles.cardMain}>
          <div className={styles.stats}>
            <div className={styles.statsLead}>
              <span className={styles.statsIcon} aria-hidden="true">
                <UserRound />
              </span>
              <span className={styles.statLabel}>Participant totals</span>
            </div>
            <dl className={styles.statsList}>
              {PARTICIPANT_TOTALS.map((t) => (
                <div key={t.label} className={styles.stat}>
                  <dt className={styles.statLabel}>{t.label}</dt>
                  <dd className={styles.statValue}>{t.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className={styles.upset}>
            {sets.length && intersections.length ? (
              <UpSetPlot
                sets={sets}
                intersections={intersections}
                height={200}
                yLabel="Number of participants"
                label="Sequencing combinations per participant"
              />
            ) : (
              <p className={styles.empty}>Turn on at least one assay to see its combinations.</p>
            )}
          </div>
        </div>
        <SidePanel>
          <PanelGroup title="Sequencing">
            {SEQ_OPTIONS.map((o) => (
              <Switch
                key={o.key}
                label={o.label}
                checked={on[o.key]}
                onChange={(e) => setOn((prev) => ({ ...prev, [o.key]: e.target.checked }))}
              />
            ))}
          </PanelGroup>
          <PanelGroup title="Display">
            <Switch
              label="Show combinations with no members"
              checked={showEmpty}
              onChange={(e) => setShowEmpty(e.target.checked)}
            />
          </PanelGroup>
        </SidePanel>
      </div>
    </section>
  );
}

/* ─────────────────────────── 3 · genomic ─────────────────────────── */

function GenomicSection() {
  return (
    <ChartCard
      data-tour="participants"
      className={styles.genomic}
      title="Genomic alterations"
      controls={
        <span className={styles.subtle}>
          {fmtNumber(GENOMIC_SUMMARY.genes)} genes · {fmtNumber(GENOMIC_SUMMARY.altered)} of{" "}
          {fmtNumber(GENOMIC_SUMMARY.samples)} samples with reportable alterations
        </span>
      }
    >
      <Oncoprint
        samples={ONCO_SAMPLE_IDS}
        genes={ONCO_GENES}
        tracks={ONCO_CLINICAL_TRACKS}
        label={`Oncoprint of ${ONCO_SAMPLE_IDS.length} samples across ${ONCO_GENES.length} genes`}
      />
    </ChartCard>
  );
}

/* ─────────────────────────── 4 · participants ─────────────────────────── */

const COLUMNS = ["Patient ID", "Sex at Birth", "Vital Status", "Study", "Cohort", "Category", "Age Range", "PDX models available?"];

function ParticipantsSection() {
  return (
    <section className={styles.section} aria-labelledby="bio-participants">
      <div className={styles.tableHeader}>
        <h3 id="bio-participants" className={styles.tableTitle}>
          {PARTICIPANT_COUNT} participants
        </h3>
        <Button variant="subtle" size="sm" startIcon={<Settings />}>
          Manage and export
        </Button>
      </div>
      <TableContainer>
        <Table caption={`${PARTICIPANT_COUNT} participants`} captionHidden>
          <TableHead>
            <TableRow>
              {COLUMNS.map((c, i) => (
                <TableHeaderCell key={c} className={i === COLUMNS.length - 1 ? styles.center : undefined}>
                  {c}
                </TableHeaderCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {PARTICIPANTS.map((p) => (
              <TableRow key={p.id}>
                <TableCell>{p.id}</TableCell>
                <TableCell>{p.sex}</TableCell>
                <TableCell>{p.vital}</TableCell>
                <TableCell>{p.study}</TableCell>
                <TableCell>{p.cohort}</TableCell>
                <TableCell>{p.category}</TableCell>
                <TableCell>{p.ageRange}</TableCell>
                <TableCell align="center">
                  {p.pdx ? (
                    <Check className={styles.check} aria-label="Yes" />
                  ) : (
                    <span className={styles.subtle}>No</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </section>
  );
}

/* ─────────────────────────── view ─────────────────────────── */

/** Biosamples tab of the Insights data explorer: diseases, sequencing, genomic alterations, participants. */
export function BiosamplesView(): JSX.Element {
  return (
    <div className={styles.view}>
      <DiseasesSection />
      <SequencingSection />
      <GenomicSection />
      <ParticipantsSection />
    </div>
  );
}
