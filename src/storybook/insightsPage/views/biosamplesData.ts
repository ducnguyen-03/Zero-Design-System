/* Biosamples tab — mock data drawn from the Figma "Insights" frame (15230:52569). Layout only. */
import type { AlterationType } from "../../../components/Charts/palette";
import type { StackSeries } from "../../../components/Charts/Plots";
import type { OncoprintGene, OncoprintTrack, UpSetIntersection, UpSetSet } from "../../../components/Charts/Genomic";

/* ─────────────── 1 · Diseases by Event / Age / Sex at Birth ─────────────── */

export type DiseaseBreakdown = "event" | "age" | "sex";

export const CANCER_CATEGORIES = [
  "CNS",
  "HM",
  "Neuroblastoma",
  "Overgrowth syndrome",
  "Sarcoma",
  "Solid tumour",
  "Unknown",
  "Vascular/lymphatic anomalies",
] as const;

type Row = (typeof CANCER_CATEGORIES)[number];

interface Breakdown {
  series: StackSeries[];
  /** Per category, one value per series key. */
  values: Record<Row, Record<string, number>>;
}

const EVENT: Breakdown = {
  series: [
    { key: "diagnosis", label: "Diagnosis", color: "var(--insight-color-blue-100)" },
    { key: "relapse", label: "Relapse of Prior Malignancy", color: "var(--insight-color-green-150)" },
    { key: "progressive", label: "Progressive Disease", color: "var(--insight-color-turquoise-50)" },
    { key: "other", label: "Other", color: "var(--insight-color-orange-100)" },
    { key: "normal", label: "Normal Tissue Sample", color: "var(--insight-color-violet-50)" },
    { key: "unknown", label: "Unknown", color: "var(--insight-color-magenta-50)" },
  ],
  values: {
    CNS: { diagnosis: 820, relapse: 128, progressive: 91 },
    HM: { diagnosis: 930, relapse: 186, progressive: 38 },
    Neuroblastoma: { diagnosis: 160, relapse: 52, progressive: 29 },
    "Overgrowth syndrome": { diagnosis: 3 },
    Sarcoma: { diagnosis: 420, relapse: 158, progressive: 60 },
    "Solid tumour": { diagnosis: 448, relapse: 64, progressive: 17 },
    Unknown: { unknown: 80 },
    "Vascular/lymphatic anomalies": { diagnosis: 22 },
  },
};

const AGE: Breakdown = {
  series: [
    { key: "infant", label: "Infant (0-1)", color: "var(--insight-color-blue-100)" },
    { key: "child", label: "Child (2-12)", color: "var(--insight-color-green-150)" },
    { key: "adolescent", label: "Adolescent (13-19)", color: "var(--insight-color-turquoise-50)" },
    { key: "adult", label: "Young adult (20+)", color: "var(--insight-color-orange-100)" },
    { key: "unknown", label: "Unknown", color: "var(--insight-color-magenta-50)" },
  ],
  values: {
    CNS: { infant: 132, child: 588, adolescent: 246, adult: 61, unknown: 12 },
    HM: { infant: 104, child: 702, adolescent: 271, adult: 63, unknown: 14 },
    Neuroblastoma: { infant: 96, child: 131, adolescent: 11, unknown: 3 },
    "Overgrowth syndrome": { infant: 2, child: 1 },
    Sarcoma: { infant: 18, child: 266, adolescent: 281, adult: 66, unknown: 7 },
    "Solid tumour": { infant: 121, child: 278, adolescent: 92, adult: 31, unknown: 7 },
    Unknown: { child: 22, adolescent: 9, unknown: 49 },
    "Vascular/lymphatic anomalies": { infant: 6, child: 12, adolescent: 4 },
  },
};

const SEX: Breakdown = {
  series: [
    { key: "female", label: "Female", color: "var(--insight-color-magenta-50)" },
    { key: "male", label: "Male", color: "var(--insight-color-blue-100)" },
    { key: "unknown", label: "Unknown", color: "var(--insight-color-grey-75)" },
  ],
  values: {
    CNS: { female: 461, male: 563, unknown: 15 },
    HM: { female: 507, male: 631, unknown: 16 },
    Neuroblastoma: { female: 109, male: 128, unknown: 4 },
    "Overgrowth syndrome": { female: 1, male: 2 },
    Sarcoma: { female: 281, male: 349, unknown: 8 },
    "Solid tumour": { female: 262, male: 259, unknown: 8 },
    Unknown: { female: 21, male: 18, unknown: 41 },
    "Vascular/lymphatic anomalies": { female: 13, male: 9 },
  },
};

const BREAKDOWNS: Record<DiseaseBreakdown, Breakdown> = { event: EVENT, age: AGE, sex: SEX };

export const DISEASE_TOGGLE: Array<{ value: DiseaseBreakdown; label: string }> = [
  { value: "event", label: "By Event" },
  { value: "age", label: "By Age" },
  { value: "sex", label: "By Sex at Birth" },
];

/** Stacked-bar input for the chosen breakdown. */
export function diseaseChart(by: DiseaseBreakdown) {
  const b = BREAKDOWNS[by];
  return {
    series: b.series,
    data: CANCER_CATEGORIES.map((label) => ({ label, values: b.values[label] })),
  };
}

/** Participants per cancer category (bar totals) — the pie view. */
export const CATEGORY_TOTALS = CANCER_CATEGORIES.map((label) => ({
  label,
  value: Object.values(EVENT.values[label]).reduce((a, n) => a + n, 0),
}));

/* ─────────────── 2 · Combined sequencing per patient ─────────────── */

export const PARTICIPANT_TOTALS = [
  { label: "Participants", value: 3706 },
  { label: "WGS", value: 3491 },
  { label: "Methylation", value: 3177 },
  { label: "RNASeq", value: 2679 },
  { label: "PDX", value: 189 },
];

export type SeqKey = "wgs" | "rna" | "meth" | "tds" | "hts" | "pdx";

export const SEQ_OPTIONS: Array<{ key: SeqKey; label: string }> = [
  { key: "wgs", label: "WGS" },
  { key: "rna", label: "RNAseq" },
  { key: "meth", label: "Methylation" },
  { key: "tds", label: "Targeted Sequencing (TDS)" },
  { key: "hts", label: "High-Throughput Drug Screening (HTS)" },
  { key: "pdx", label: "PDX" },
];

/** Set order follows the Figma matrix rows (RNASeq, Methylation, WGS, PDX, then the optional assays). */
export const SEQ_UPSET_SETS: Array<UpSetSet & { key: SeqKey }> = [
  { key: "rna", label: "RNASeq", size: 2679 },
  { key: "meth", label: "Methylation", size: 3177 },
  { key: "wgs", label: "WGS", size: 3491 },
  { key: "pdx", label: "PDX", size: 189 },
  /* No participants in this cohort yet — shown only with "Show combinations with no members". */
  { key: "tds", label: "TDS", size: 0 },
  { key: "hts", label: "HTS", size: 0 },
];

/** Exclusive intersections, largest first (Figma values; empty TDS/HTS combinations last). */
export const SEQ_UPSET_INTERSECTIONS: UpSetIntersection[] = [
  { sets: ["wgs"], value: 3491 },
  { sets: ["meth"], value: 3177 },
  { sets: ["wgs", "meth"], value: 3175 },
  { sets: ["rna", "meth", "wgs"], value: 2679 },
  { sets: ["rna"], value: 2679 },
  { sets: ["rna", "wgs"], value: 2658 },
  { sets: ["rna", "meth"], value: 2658 },
  { sets: ["pdx"], value: 189 },
  { sets: ["wgs", "pdx"], value: 57 },
  { sets: ["meth", "wgs", "pdx"], value: 41 },
  { sets: ["rna", "meth", "pdx"], value: 41 },
  { sets: ["rna", "meth", "wgs", "pdx"], value: 39 },
  { sets: ["rna", "wgs", "pdx"], value: 39 },
  { sets: ["rna", "pdx"], value: 38 },
  { sets: ["meth", "pdx"], value: 38 },
  { sets: ["tds"], value: 0 },
  { sets: ["wgs", "tds"], value: 0 },
  { sets: ["hts"], value: 0 },
  { sets: ["pdx", "hts"], value: 0 },
];

/* ─────────────── 3 · Genomic alterations (oncoprint) ─────────────── */

export const GENOMIC_SUMMARY = { genes: 933, altered: 2381, samples: 2887 };

export const ONCO_SAMPLE_IDS = Array.from({ length: 80 }, (_, i) => `PDX-Biobank${String(i + 1).padStart(2, "0")}`);

const GENES = ["TP53", "MYCN", "ALK", "NF1", "ATRX", "CDKN2A", "H3-3A", "BRAF", "PTEN", "NRAS", "CALD1", "CCDC144B"];
const TYPES: AlterationType[] = ["SNV", "CNV", "SV", "RNA", "Germline", "Methylation"];

export const ONCO_GENES: OncoprintGene[] = GENES.map((gene, g) => ({
  gene,
  alterations: ONCO_SAMPLE_IDS.map((_, s) => {
    const h = (g * 7919 + s * 104729) % 97;
    const rate = [58, 44, 36, 30, 26, 22, 18, 16, 12, 10, 4, 3][g];
    if (h > rate) return [];
    const first = TYPES[(h + g) % TYPES.length];
    return h % 9 === 0 ? [first, TYPES[(h + 3) % TYPES.length]].filter((t, i, a) => a.indexOf(t) === i) : [first];
  }),
}));

const pick = <T,>(arr: readonly T[], s: number, salt: number) => arr[(s * 31 + salt * 17 + ((s * s) % 7)) % arr.length];

const CANCER_TYPE = [
  { value: "HM", color: "var(--insight-color-red-150)" },
  { value: "CNS", color: "var(--insight-color-orange-100)" },
  { value: "Sarcoma", color: "var(--insight-color-blue-100)" },
  { value: "Solid tumour", color: "var(--insight-color-green-150)" },
] as const;
const SEX_AT_BIRTH = [
  { value: "Male", color: "var(--insight-color-red-150)" },
  { value: "Female", color: "var(--insight-color-blue-100)" },
  { value: "Unknown", color: "var(--insight-color-orange-100)" },
  { value: "Other", color: "var(--insight-color-green-150)" },
] as const;
const EVENT_TRACK = [
  { value: "Diagnosis", color: "var(--insight-color-orange-100)" },
  { value: "Relapse of Prior Malignancy", color: "var(--insight-color-blue-100)" },
] as const;
const AGE_TRACK = [
  { value: "Adolescent (13-19)", color: "var(--insight-color-blue-100)" },
  { value: "Child (6-12)", color: "var(--insight-color-orange-100)" },
] as const;
/** TMB as a blue ramp — most samples low. */
const TMB = [
  { value: "Low", color: "var(--insight-color-blue-10)" },
  { value: "Low", color: "var(--insight-color-blue-10)" },
  { value: "Low", color: "var(--insight-color-blue-10)" },
  { value: "Medium", color: "var(--insight-color-blue-30)" },
  { value: "High", color: "var(--insight-color-blue-50)" },
] as const;

export const ONCO_CLINICAL_TRACKS: OncoprintTrack[] = [
  { label: "Cancer Type", values: ONCO_SAMPLE_IDS.map((_, s) => ({ ...pick(CANCER_TYPE, s, 1) })) },
  { label: "Sex at Birth", values: ONCO_SAMPLE_IDS.map((_, s) => ({ ...pick(SEX_AT_BIRTH, s, 2) })) },
  { label: "Event", values: ONCO_SAMPLE_IDS.map((_, s) => ({ ...pick(EVENT_TRACK, s, 3) })) },
  { label: "Age at diagnosis", values: ONCO_SAMPLE_IDS.map((_, s) => ({ ...pick(AGE_TRACK, s, 4) })) },
  { label: "TMB", values: ONCO_SAMPLE_IDS.map((_, s) => ({ ...pick(TMB, s, 5) })) },
];

/* ─────────────── 4 · Participants table ─────────────── */

export interface ParticipantRow {
  id: string;
  sex: string;
  vital: string;
  study: string;
  cohort: string;
  category: string;
  ageRange: string;
  pdx: boolean;
}

export const PARTICIPANT_COUNT = 3706;

export const PARTICIPANTS: ParticipantRow[] = [15, 16, 17, 18, 19, 20, 21, 22].map((n, i) => ({
  id: `PDX-Biobank${n}`,
  sex: i === 5 ? "female" : i === 6 ? "male" : "unknown",
  vital: i === 6 ? "Alive" : "Unknown",
  study: "PDX Biobank",
  cohort: "",
  category: i === 5 ? "Sarcoma" : "Neuroblastoma",
  ageRange: i === 6 ? "Child (6-12)" : "Unknown",
  pdx: true,
}));
