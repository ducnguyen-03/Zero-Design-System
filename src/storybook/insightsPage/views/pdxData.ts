/* PDX models view — mock data transcribed from Figma "Insights" (15230:9800), PDX models tab. Layout only. */
import type { PieDatum, StackSeries } from "../../../components/Charts/Plots";
import type { UpSetSet } from "../../../components/Charts/Genomic";

/* ── Summary panel ── */

export const PDX_TOTAL = 203;

export const PDX_VALIDATED_WITH = [
  { label: "Flow cytometry", share: 62 },
  { label: "IHC", share: 36 },
  { label: "SNP array", share: 93 },
  { label: "STR profiling", share: 38 },
];

export const PDX_MICE_STRAINS = [
  { label: "NSG", value: "99.5%" },
  { label: "MISTRG", value: "0.5%" },
];

export const PDX_CONTRIBUTOR_SHARES = [
  { label: "Leukemia Biology", value: "62%" },
  { label: "ZERO", value: "33%" },
  { label: "Experimental Therapeutics", value: "5%" },
];

/* ── PDX models by Event, Age, Sex at Birth ── */

export type PdxGrouping = "event" | "age" | "sex";

export const PDX_GROUPINGS: Array<{ key: PdxGrouping; label: string }> = [
  { key: "event", label: "By Event" },
  { key: "age", label: "By Age" },
  { key: "sex", label: "By Sex at Birth" },
];

export const PDX_CATEGORIES = ["CNS", "HM", "Neuroblastoma", "Sarcoma", "Solid tumour", "Unknown"] as const;

type Row = { label: string; values: Record<string, number> };
const rows = (values: Array<Record<string, number>>): Row[] =>
  PDX_CATEGORIES.map((label, i) => ({ label, values: values[i] }));

export const PDX_BY: Record<PdxGrouping, { series: StackSeries[]; data: Row[] }> = {
  event: {
    series: [
      { key: "diagnosis", label: "Diagnosis", color: "var(--insight-color-blue-100)" },
      { key: "relapse", label: "Relapse of Prior Malignancy", color: "var(--insight-color-green-160)" },
      { key: "progressive", label: "Progressive Disease", color: "var(--insight-color-turquoise-100)" },
      { key: "other", label: "Other", color: "var(--insight-color-orange-100)" },
      { key: "unknown", label: "Unknown", color: "var(--insight-color-purple-50)" },
    ],
    data: rows([
      { diagnosis: 2 },
      { diagnosis: 98, relapse: 28, progressive: 1, other: 5 },
      { diagnosis: 5, relapse: 12, progressive: 1 },
      { diagnosis: 14, relapse: 18, progressive: 10 },
      { diagnosis: 1, relapse: 2 },
      { unknown: 6 },
    ]),
  },
  age: {
    series: [
      { key: "a0", label: "0–2", color: "var(--insight-color-blue-100)" },
      { key: "a3", label: "3–5", color: "var(--insight-color-green-160)" },
      { key: "a6", label: "6–12", color: "var(--insight-color-turquoise-100)" },
      { key: "a13", label: "13–19", color: "var(--insight-color-orange-100)" },
      { key: "a20", label: "20+", color: "var(--insight-color-magenta-50)" },
      { key: "unknown", label: "Unknown", color: "var(--insight-color-purple-50)" },
    ],
    data: rows([
      { a6: 2 },
      { a0: 14, a3: 38, a6: 44, a13: 30, a20: 6 },
      { a0: 6, a3: 10, a6: 2 },
      { a3: 4, a6: 12, a13: 22, a20: 4 },
      { a0: 1, a6: 2 },
      { unknown: 6 },
    ]),
  },
  sex: {
    series: [
      { key: "female", label: "Female", color: "var(--insight-color-magenta-50)" },
      { key: "male", label: "Male", color: "var(--insight-color-blue-100)" },
      { key: "unknown", label: "Unknown", color: "var(--insight-color-purple-50)" },
    ],
    data: rows([
      { female: 1, male: 1 },
      { female: 58, male: 74 },
      { female: 8, male: 10 },
      { female: 19, male: 23 },
      { female: 2, male: 1 },
      { female: 1, male: 2, unknown: 3 },
    ]),
  },
};

/** Totals per cancer category (pie view). */
export const PDX_CATEGORY_TOTALS: PieDatum[] = PDX_BY.event.data.map((d, i) => ({
  label: d.label,
  value: Object.values(d.values).reduce((a, b) => a + b, 0),
  color: [
    "var(--insight-color-blue-100)",
    "var(--insight-color-green-160)",
    "var(--insight-color-turquoise-100)",
    "var(--insight-color-orange-100)",
    "var(--insight-color-magenta-50)",
    "var(--insight-color-purple-50)",
  ][i],
}));

/* ── Validation performed ── */

export type ValidationKey = "flow" | "ihc" | "snp" | "str";
export type ContributorKey = "et" | "lb" | "zero";

/** Top-to-bottom order of the UpSet matrix rows (Figma). */
export const PDX_VALIDATION_SETS: Array<UpSetSet & { key: ValidationKey }> = [
  { key: "str", label: "STR profiling", size: 77 },
  { key: "ihc", label: "IHC", size: 74 },
  { key: "snp", label: "SNP array", size: 189 },
  { key: "flow", label: "Flow cytometry", size: 126 },
];

/** Switch-panel order (Figma). */
export const PDX_VALIDATION_METHODS: Array<{ key: ValidationKey; label: string }> = [
  { key: "flow", label: "Flow cytometry" },
  { key: "ihc", label: "IHC" },
  { key: "snp", label: "SNP array" },
  { key: "str", label: "STR profiling" },
];

export const PDX_CONTRIBUTORS: Array<{ key: ContributorKey; label: string; models: number }> = [
  { key: "et", label: "Experimental Therapeutics", models: 10 },
  { key: "lb", label: "Leukemia Biology", models: 126 },
  { key: "zero", label: "ZERO", models: 67 },
];

/** Exclusive intersections, largest first, split by contributor (sums match the Figma column labels). */
export const PDX_VALIDATION_INTERSECTIONS: Array<{ sets: ValidationKey[]; by: Record<ContributorKey, number> }> = [
  { sets: ["snp"], by: { lb: 117, zero: 62, et: 10 } }, // 189
  { sets: ["snp", "flow"], by: { lb: 80, zero: 42, et: 4 } }, // 126
  { sets: ["flow"], by: { lb: 78, zero: 42, et: 6 } }, // 126
  { sets: ["str"], by: { lb: 48, zero: 25, et: 4 } }, // 77
  { sets: ["str", "ihc"], by: { lb: 49, zero: 25, et: 0 } }, // 74
  { sets: ["ihc"], by: { lb: 46, zero: 24, et: 4 } }, // 74
  { sets: ["str", "snp"], by: { lb: 42, zero: 21, et: 0 } }, // 63
  { sets: ["str", "ihc", "snp"], by: { lb: 38, zero: 20, et: 3 } }, // 61
  { sets: ["ihc", "snp"], by: { lb: 40, zero: 21, et: 0 } }, // 61
];

/** "PDX model totals" strip. */
export const PDX_VALIDATION_TOTALS: Array<{ key: ValidationKey | "all"; label: string; value: number }> = [
  { key: "all", label: "PDX models", value: 203 },
  { key: "snp", label: "SNP array", value: 189 },
  { key: "flow", label: "Flow cytometry", value: 126 },
  { key: "str", label: "STR profiling", value: 77 },
  { key: "ihc", label: "IHC", value: 74 },
];

/* ── PDX models table ── */

export interface PdxModelRow {
  id: string;
  category: string;
  subcategory1: string;
  subcategory2: string;
  finalDiagnosis: string;
  subtype: string;
  mouseStrain: string;
  staging: string;
}

const preB = { category: "HM", subcategory1: "Leukaemia", subcategory2: "PreB ALL/lymphoma", finalDiagnosis: "B Acute Lymphoblastic Leukemia", subtype: "-", mouseStrain: "NSG", staging: "-" };
const tAll = { ...preB, subcategory2: "TALL/lymphoma", finalDiagnosis: "T Acute Lymphoblastic Leukemia" };

export const PDX_COLUMNS: Array<{ key: keyof PdxModelRow; label: string }> = [
  { key: "id", label: "PDX Model ID" },
  { key: "category", label: "Category" },
  { key: "subcategory1", label: "Subcategory 1" },
  { key: "subcategory2", label: "Subcategory 2" },
  { key: "finalDiagnosis", label: "Final Diagnosis" },
  { key: "subtype", label: "Subtype" },
  { key: "mouseStrain", label: "Mouse Strain" },
  { key: "staging", label: "Staging" },
];

export const PDX_MODELS: PdxModelRow[] = [
  { id: "ALL-100", ...preB, subcategory1: "-", mouseStrain: "-" },
  { id: "ALL-87", ...preB },
  { id: "ALL-95", ...preB },
  { id: "ALL-77", ...preB },
  { id: "ALL-76", ...tAll },
  { id: "ALL-68", ...tAll },
  { id: "ETP-1", ...tAll, subtype: "ETP" },
  { id: "ETP-2", ...tAll, subtype: "ETP" },
  { id: "ETP-3", ...tAll, subtype: "ETP" },
  { id: "ETP-4", ...tAll, subtype: "ETP" },
];
