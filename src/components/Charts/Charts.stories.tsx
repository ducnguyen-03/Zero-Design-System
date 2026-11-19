import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { EllipsisVertical } from "lucide-react";
import { IconButton } from "../IconButton/IconButton";
import { Select } from "../Select/Select";
import {
  AGE_BANDS,
  ENROLMENT,
  EVENTS,
  EXPERIMENTS,
  GENE_MUTATIONS,
  HEAT_COLUMNS,
  HEAT_ROWS,
  KPIS,
  ONCO_GENES_DATA,
  ONCO_SAMPLES,
  ONCO_TRACKS,
  PDX_INTERSECTIONS,
  PDX_SETS,
  SAMPLE_COUNT,
  SEQ_INTERSECTIONS,
  SEQ_SETS,
  SEX,
  STUDIES,
  TOP_CATEGORIES,
  TURNAROUND,
  VITAL,
} from "../../storybook/insightsCharts";
import { ChartCard, GeneMutationTable, MetricCard, RankedTable } from "./ChartCard";
import { FrequencyHeatmap, Oncoprint, UpSetPlot } from "./Genomic";
import { BarChart, LineChart, PieChart, StackedBarChart } from "./Plots";
import { ProportionBar } from "./ProportionBar";
import { CHART_CATEGORICAL, ALTERATION_COLORS } from "./palette";

const meta: Meta = {
  title: "Charts",
  parameters: {
    docs: {
      description: {
        component:
          "Charts for Insights, rebuilt from the summary, participants and molecular views of the *Insights Onboarding* prototype — no chart library, core tokens only. " +
          "`ChartCard` frames any chart (title, inline controls, actions, footnote); `MetricCard` is the headline count with its published / unpublished split. " +
          "Plots: `BarChart`, `StackedBarChart`, `PieChart`, `LineChart`. Genomic: `UpSetPlot`, `Oncoprint`, `FrequencyHeatmap`, `GeneMutationTable`. " +
          "Colours come from `CHART_CATEGORICAL` and `ALTERATION_COLORS`, so the same class reads the same in every chart. Every chart carries an accessible name; " +
          "values live in titles or a hidden table.",
      },
    },
  },
};
export default meta;
type Story = StoryObj;

const menu = <IconButton size="sm" aria-label="Chart options" icon={<EllipsisVertical />} />;

/* ── Summary page (as in the prototype) ── */

function SummaryPage() {
  const [by, setBy] = useState("study");
  const [per, setPer] = useState("qtr");
  const [across, setAcross] = useState("sample");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 1180, padding: 16, background: "var(--insight-color-grey-10)" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
        {KPIS.map((k) => (
          <MetricCard key={k.label} {...k} />
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.3fr) minmax(0, 1.1fr) minmax(0, 0.8fr)", gap: 12 }}>
        <ChartCard title="Top 10 cancer categories by frequency" style={{ gridRow: "span 2" }}>
          <RankedTable rows={TOP_CATEGORIES} labelHeader="Cancer type" />
        </ChartCard>
        <ChartCard title="Age at diagnosis distribution">
          <BarChart data={AGE_BANDS} label="Participants by age at diagnosis" height={140} />
        </ChartCard>
        <ChartCard title="Sex distribution">
          <PieChart data={SEX} label="Participants by sex" size={140} />
        </ChartCard>
        <ChartCard title="Study distribution">
          <BarChart data={STUDIES} colorBy="category" label="Participants by study" height={140} />
        </ChartCard>
        <ChartCard title="Event distribution">
          <PieChart data={EVENTS} label="Samples by event" size={140} />
        </ChartCard>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 12 }}>
        <ChartCard title="Combined sequencing performed per patient" actions={menu}>
          <UpSetPlot sets={SEQ_SETS} intersections={SEQ_INTERSECTIONS} yLabel="Participants" label="Sequencing combinations per participant" />
        </ChartCard>
        <ChartCard
          title="Gene mutation distributed"
          controls={
            <>
              across
              <Select
                size="xs"
                aria-label="Distribute across"
                value={across}
                onValueChange={setAcross}
                options={[
                  { value: "sample", label: "sample" },
                  { value: "participant", label: "participant" },
                ]}
              />
            </>
          }
        >
          <GeneMutationTable rows={GENE_MUTATIONS} />
        </ChartCard>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 12 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <ChartCard title="Sample count" style={{ gridColumn: "span 2" }}>
            <BarChart data={SAMPLE_COUNT} label="Participants by number of samples" height={130} />
          </ChartCard>
          <ChartCard title="Vital status">
            <PieChart data={VITAL} label="Participants by vital status" size={120} />
          </ChartCard>
          <ChartCard title="Experimental distribution" actions={menu}>
            <PieChart data={EXPERIMENTS} label="Samples by experiment" size={120} donut={0.45} />
          </ChartCard>
        </div>
        <ChartCard title="Validation performed per PDX" actions={menu}>
          <UpSetPlot sets={PDX_SETS} intersections={PDX_INTERSECTIONS} yLabel="Number of PDX models" label="Validation combinations per PDX model" height={200} />
        </ChartCard>
      </div>
      <ChartCard title="Turn around times" actions={menu} footnote="Weeks from sample receipt to result, monthly median.">
        <LineChart labels={TURNAROUND.labels} series={TURNAROUND.series} label="Turnaround time by assay, weeks" />
      </ChartCard>
      <ChartCard
        title="Enrolment distribution"
        controls={
          <>
            by
            <Select size="xs" aria-label="Group by" value={by} onValueChange={setBy} options={[{ value: "study", label: "Study" }, { value: "site", label: "Site" }]} />
            per
            <Select size="xs" aria-label="Period" value={per} onValueChange={setPer} options={[{ value: "qtr", label: "Qtr" }, { value: "year", label: "Year" }]} />
          </>
        }
      >
        <StackedBarChart series={ENROLMENT.series} data={ENROLMENT.data} label="Enrolments per quarter by study" />
      </ChartCard>
    </div>
  );
}

/** The summary view, every chart on it rebuilt from DS chart components. */
export const Summary: Story = {
  name: "Summary page",
  parameters: { layout: "fullscreen" },
  render: () => <SummaryPage />,
};

/* ── One story per chart ── */

export const Metrics: Story = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12, maxWidth: 900 }}>
      {KPIS.map((k) => (
        <MetricCard key={k.label} {...k} onRestClick={() => {}} />
      ))}
    </div>
  ),
};

export const Bars: Story = {
  render: function Render() {
    const [sel, setSel] = useState<string | undefined>();
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 12, maxWidth: 960 }}>
        <ChartCard title="Single colour · selectable" footnote={sel ? `Filtered to ${sel}` : "Select a bar to filter"}>
          <BarChart data={AGE_BANDS} label="Age at diagnosis" selected={sel} onSelect={(d) => setSel(sel === d.label ? undefined : d.label)} />
        </ChartCard>
        <ChartCard title="Colour by category">
          <BarChart data={STUDIES} colorBy="category" label="Study distribution" />
        </ChartCard>
      </div>
    );
  },
};

export const Stacked: Story = {
  render: () => (
    <ChartCard title="Enrolment distribution" style={{ maxWidth: 900 }}>
      <StackedBarChart series={ENROLMENT.series} data={ENROLMENT.data} label="Enrolments per quarter by study" />
    </ChartCard>
  ),
};

export const Pies: Story = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, maxWidth: 900 }}>
      <ChartCard title="Sex distribution">
        <PieChart data={SEX} label="Sex" />
      </ChartCard>
      <ChartCard title="Vital status">
        <PieChart data={VITAL} label="Vital status" />
      </ChartCard>
      <ChartCard title="Experimental distribution · donut">
        <PieChart data={EXPERIMENTS} label="Experiments" donut={0.5} />
      </ChartCard>
    </div>
  ),
};

export const Line: Story = {
  render: () => (
    <ChartCard title="Turn around times" style={{ maxWidth: 900 }}>
      <LineChart labels={TURNAROUND.labels} series={TURNAROUND.series} label="Turnaround time by assay" yLabel="Weeks" />
    </ChartCard>
  ),
};

export const UpSet: Story = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))", gap: 12, maxWidth: 1000 }}>
      <ChartCard title="Combined sequencing performed per patient">
        <UpSetPlot sets={SEQ_SETS} intersections={SEQ_INTERSECTIONS} yLabel="Participants" label="Sequencing combinations" />
      </ChartCard>
      <ChartCard title="Validation performed per PDX">
        <UpSetPlot sets={PDX_SETS} intersections={PDX_INTERSECTIONS} yLabel="PDX models" label="Validation combinations" />
      </ChartCard>
    </div>
  ),
};

export const Tables: Story = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: 12, maxWidth: 1000 }}>
      <ChartCard title="Top 10 cancer categories by frequency">
        <RankedTable rows={TOP_CATEGORIES} labelHeader="Cancer type" />
      </ChartCard>
      <ChartCard title="Gene mutation distributed">
        <GeneMutationTable rows={GENE_MUTATIONS} />
      </ChartCard>
    </div>
  ),
};

/** Participants × genes, with clinical tracks. Hover a column to read the sample. */
export const OncoprintStory: Story = {
  name: "Oncoprint",
  render: () => (
    <ChartCard title="Oncoprint" controls={<span>{ONCO_SAMPLES.length} participants · 8 genes</span>} style={{ maxWidth: 760 }}>
      <Oncoprint samples={ONCO_SAMPLES} genes={ONCO_GENES_DATA} tracks={ONCO_TRACKS} label="Oncoprint of 24 participants across 8 genes" />
    </ChartCard>
  ),
};

export const Heatmap: Story = {
  name: "Frequency heatmap",
  render: () => (
    <ChartCard title="Gene frequency by cancer category" style={{ maxWidth: 760 }}>
      <FrequencyHeatmap columns={HEAT_COLUMNS} rows={HEAT_ROWS} label="Share of samples with each gene altered, by cancer category" />
    </ChartCard>
  ),
};

/** The palettes and the proportion bar every chart and access block shares. */
export const Palette: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 640, fontFamily: "var(--insight-font-family-sans)", fontSize: 12 }}>
      <div style={{ display: "flex", gap: 8 }}>
        {CHART_CATEGORICAL.map((c) => (
          <span key={c} title={c} style={{ width: 40, height: 40, borderRadius: 8, background: c }} />
        ))}
      </div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {Object.entries(ALTERATION_COLORS).map(([k, c]) => (
          <span key={k} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 14, height: 14, borderRadius: 3, background: c }} />
            {k}
          </span>
        ))}
      </div>
      <ProportionBar value={3184} total={4500} />
      <ProportionBar value={3184} total={4500} color="var(--insight-color-purple-100)" remainder="hatched" />
    </div>
  ),
};
