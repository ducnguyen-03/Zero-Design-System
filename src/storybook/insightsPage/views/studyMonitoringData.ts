/* Mock data for the Study monitoring tab (Figma Insights-UI 15230:84688). */

export interface MonitoringStat {
  id: "enrolments" | "sequencing" | "mtb";
  value: number;
  label: string;
}

export const MONITORING_STATS: MonitoringStat[] = [
  { id: "enrolments", value: 3706, label: "Unique enrolments" },
  { id: "sequencing", value: 20, label: "Time to sequencing (days)" },
  { id: "mtb", value: 0, label: "Enrolment to MTB (days)" },
];

export interface ShareRow {
  label: string;
  value: number;
  color: string;
}

/* Figma swatches with no exact token are local custom properties in StudyMonitoringView.module.css. */
export const STUDY_SHARES: ShareRow[] = [
  { label: "ZERO2", value: 2571, color: "var(--insight-color-purple-50)" },
  { label: "PRISM", value: 771, color: "var(--sm-teal)" },
  { label: "Cohort B Rare Cancers", value: 164, color: "var(--insight-color-blue-100)" },
  { label: "PDX Biobank", value: 127, color: "var(--sm-green)" },
  { label: "TARGET", value: 48, color: "var(--sm-amber)" },
];

export const EXPERIMENT_SHARES: ShareRow[] = [
  { label: "WGS", value: 7422, color: "var(--insight-color-magenta-50)" },
  { label: "Methylation", value: 3531, color: "var(--sm-green)" },
  { label: "RNASeq", value: 2963, color: "var(--sm-amber)" },
  { label: "Targeted Sequencing (TDS)", value: 611, color: "var(--insight-color-purple-50)" },
  { label: "PDX", value: 203, color: "var(--sm-teal)" },
  { label: "High-Throughput Drug Screening (HTS)", value: 189, color: "var(--insight-color-blue-100)" },
];

export const CANCER_SHARES: ShareRow[] = [
  { label: "HM", value: 1154, color: "var(--sm-green)" },
  { label: "CNS", value: 1039, color: "var(--insight-color-blue-100)" },
  { label: "Sarcoma", value: 638, color: "var(--insight-color-purple-50)" },
  { label: "Solid tumour", value: 529, color: "var(--insight-color-magenta-50)" },
  { label: "Neuroblastoma", value: 241, color: "var(--sm-teal)" },
  { label: "Vascular/lymphatic anomalies", value: 22, color: "var(--insight-color-orange-200)" },
  { label: "Overgrowth syndrome", value: 3, color: "var(--sm-amber)" },
];

export type QuarterGrouping = "study" | "cancer";

export interface QuarterSeries {
  key: string;
  label: string;
  color: string;
}

/** "Participants per quarter" series — the bar chart uses its own palette in Figma. */
export const QUARTER_SERIES: Record<QuarterGrouping, QuarterSeries[]> = {
  study: [
    { key: "cohortB", label: "Cohort B Rare Cancers", color: "var(--insight-color-blue-100)" },
    { key: "prism", label: "PRISM", color: "var(--sm-green)" },
    { key: "target", label: "TARGET", color: "var(--sm-teal)" },
    { key: "zero2", label: "ZERO2", color: "var(--sm-amber)" },
  ],
  cancer: CANCER_SHARES.map((c, i) => ({ key: `c${i}`, label: c.label, color: c.color })),
};

/** Totals per quarter, 2015 Q1 → 2026 Q4, read from the Figma bars. */
const QUARTER_TOTALS = [
  73, 88, 74, 94, 61, 75, 80, 93, 67, 97, 57, 71, 79, 66, 61, 72, 75, 74, 78, 87, 83, 70, 77, 90,
  76, 63, 85, 75, 65, 85, 75, 69, 85, 85, 79, 79, 76, 66, 68, 70, 74, 63, 71, 86, 74, 65, 74, 4,
];

/** Deterministic 0–1 jitter so the mock split varies quarter to quarter but never between renders. */
const jitter = (i: number, salt: number) => {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

function split(total: number, shares: number[], i: number): number[] {
  const weights = shares.map((s, k) => s * (0.7 + 0.6 * jitter(i, k)));
  const sum = weights.reduce((a, b) => a + b, 0);
  const parts = weights.map((w) => Math.floor((w / sum) * total));
  parts[parts.length - 1] += total - parts.reduce((a, b) => a + b, 0);
  return parts;
}

export interface QuarterDatum {
  label: string;
  values: Record<string, number>;
}

const STUDY_MIX = [0.04, 0.2, 0.02, 0.74];
const CANCER_MIX = CANCER_SHARES.map((c) => c.value);

export const QUARTERS: QuarterDatum[][] = (["study", "cancer"] as QuarterGrouping[]).map((g) =>
  QUARTER_TOTALS.map((total, i) => {
    const year = 2015 + Math.floor(i / 4);
    const parts = split(total, g === "study" ? STUDY_MIX : CANCER_MIX, i);
    const values: Record<string, number> = {};
    QUARTER_SERIES[g].forEach((s, k) => {
      values[s.key] = parts[k];
    });
    return { label: `${year} Q${(i % 4) + 1}`, values };
  }),
);

export const quarterData = (g: QuarterGrouping) => QUARTERS[g === "study" ? 0 : 1];
