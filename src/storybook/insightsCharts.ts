/* Insights summary page — example data from the Claude Design "Insights Onboarding" prototype. Layout only. */
import type { AlterationType } from "../components/Charts/palette";
import type { GeneMutationRow, RankedRow } from "../components/Charts/ChartCard";
import type { OncoprintGene, OncoprintTrack, UpSetIntersection, UpSetSet } from "../components/Charts/Genomic";

export const KPIS = [
  { label: "Total participants", value: 3_184, total: 4_500, info: "Participants with at least one sample. Small cells (<5) are suppressed." },
  { label: "Total samples", value: 10_703, total: 13_900, info: "Biosamples across all participants and studies." },
  { label: "PDX models", value: 212, total: 241, info: "Patient-derived xenograft models available to order." },
];

export const TOP_CATEGORIES: RankedRow[] = [
  { label: "B Acute Lymphoblastic", value: 830, share: 0.17, color: "var(--insight-color-blue-100)" },
  { label: "Neuroblastoma", value: 630, share: 0.093, color: "var(--insight-color-blue-100)" },
  { label: "Medulloblastoma", value: 512, share: 0.081, color: "var(--insight-color-blue-100)" },
  { label: "Diffuse midline glioma", value: 488, share: 0.077, color: "var(--insight-color-blue-100)" },
  { label: "Wilms tumour", value: 461, share: 0.072, color: "var(--insight-color-blue-100)" },
  { label: "Osteosarcoma", value: 144, share: 0.071, color: "var(--insight-color-orange-100)" },
  { label: "Pilocytic Astrocytoma", value: 124, share: 0.063, color: "var(--insight-color-magenta-100)" },
  { label: "Ewing Sarcoma", value: 102, share: 0.051, color: "var(--insight-color-green-150)" },
];

export const AGE_BANDS = [
  { label: "0-2", value: 210 },
  { label: "3-5", value: 330 },
  { label: "6-12", value: 390 },
  { label: "13-19", value: 330 },
  { label: "20-25", value: 310 },
  { label: "Unk", value: 12 },
];

export const STUDIES = [
  { label: "Cohort B Rare", value: 220 },
  { label: "PDX Biobank", value: 335 },
  { label: "PRISM", value: 390 },
  { label: "TARGET", value: 340 },
  { label: "ZERO2", value: 330 },
];

export const SEX = [
  { label: "Female", value: 2_590, color: "var(--insight-color-blue-100)" },
  { label: "Male", value: 2_074, color: "var(--insight-color-magenta-50)" },
  { label: "Other / unknown", value: 157, color: "var(--insight-color-grey-75)" },
];
export const EVENTS = [
  { label: "Diagnosis", value: 2_074, color: "var(--insight-color-red-150)" },
  { label: "Relapse", value: 2_590, color: "var(--insight-color-orange-100)" },
  { label: "Unknown", value: 157, color: "var(--insight-color-blue-50)" },
];
export const VITAL = [
  { label: "Alive", value: 2_590, color: "var(--insight-color-green-150)" },
  { label: "Deceased", value: 2_074, color: "var(--insight-color-red-150)" },
  { label: "Unknown", value: 157, color: "var(--insight-color-violet-100)" },
];
export const EXPERIMENTS = [
  { label: "WGS", value: 600 },
  { label: "RNAseq", value: 240 },
  { label: "Methylation", value: 270 },
  { label: "Panel", value: 533 },
  { label: "Proteomics", value: 203 },
];

export const SAMPLE_COUNT = [
  { label: "1", value: 3_300, color: "var(--insight-color-blue-100)" },
  { label: "2", value: 1_350, color: "var(--insight-color-orange-100)" },
  { label: "3", value: 560, color: "var(--insight-color-violet-50)" },
  { label: "4", value: 340, color: "var(--insight-color-red-150)" },
  { label: "5+", value: 240, color: "var(--insight-color-magenta-50)" },
];

export const SEQ_SETS: UpSetSet[] = [
  { key: "wgs", label: "WGS", size: 3_322 },
  { key: "rna", label: "RNAseq", size: 2_781 },
  { key: "meth", label: "Methylation", size: 3_230 },
];
export const SEQ_INTERSECTIONS: UpSetIntersection[] = [
  { sets: ["wgs", "rna", "meth"], value: 2_960 },
  { sets: ["wgs"], value: 2_710 },
  { sets: ["meth"], value: 2_480 },
  { sets: ["wgs", "meth"], value: 2_620 },
  { sets: ["rna"], value: 1_980 },
  { sets: ["rna", "meth"], value: 2_270 },
  { sets: ["wgs", "rna"], value: 3_010 },
];

export const PDX_SETS: UpSetSet[] = [
  { key: "flow", label: "Flow cytometry", size: 77 },
  { key: "snp", label: "SNP array", size: 74 },
  { key: "str", label: "STR profiling", size: 189 },
  { key: "ihc", label: "IHC", size: 126 },
];
export const PDX_INTERSECTIONS: UpSetIntersection[] = [
  { sets: ["str"], value: 190 },
  { sets: ["flow", "str"], value: 122 },
  { sets: ["ihc"], value: 121 },
  { sets: ["snp", "str"], value: 76 },
  { sets: ["str", "ihc"], value: 70 },
  { sets: ["snp", "str", "ihc"], value: 64 },
  { sets: ["flow", "snp", "str", "ihc"], value: 52 },
  { sets: ["flow", "ihc"], value: 48 },
];

const mix = (a: Partial<Record<AlterationType, number>>) => a;
export const GENE_MUTATIONS: GeneMutationRow[] = [
  { gene: "TP53", mutations: 4_120, samples: 318, freq: 0.17, breakdown: mix({ SNV: 6, CNV: 3, SV: 1, RNA: 1 }) },
  { gene: "EGFR", mutations: 900, samples: 180, freq: 0.08, breakdown: mix({ SNV: 4, CNV: 4, RNA: 2 }) },
  { gene: "BRAF", mutations: 780, samples: 156, freq: 0.074, breakdown: mix({ SNV: 5, SV: 3, RNA: 1 }) },
  { gene: "KRAS", mutations: 630, samples: 174, freq: 0.071, breakdown: mix({ SNV: 8, CNV: 1 }) },
  { gene: "NRAS", mutations: 630, samples: 132, freq: 0.071, breakdown: mix({ SNV: 7, Germline: 1 }) },
  { gene: "PTEN", mutations: 630, samples: 118, freq: 0.063, breakdown: mix({ SNV: 3, CNV: 5, Methylation: 2 }) },
  { gene: "AKT1", mutations: 450, samples: 90, freq: 0.05, breakdown: mix({ SNV: 6, CNV: 1, RNA: 1 }) },
];

export const TURNAROUND = {
  labels: ["May '23", "Jun '23", "Jul '23", "Aug '23", "Sep '23", "Oct '23", "Nov '23", "Dec '23"],
  series: [
    { key: "wgs", label: "WGS", values: [4.4, 7.4, 7.6, 7.6, 7.3, 4.3, 5.9, 6.2] },
    { key: "rna", label: "RNAseq", values: [3.5, 4.5, 4.4, 4.0, 4.6, 1.2, 1.6, 2.0] },
    { key: "meth", label: "Methylation", values: [3.0, 3.1, 3.5, 4.1, 4.5, 4.4, 5.9, 6.9] },
    { key: "report", label: "Report", values: [3.6, 4.4, 4.2, 4.0, 4.3, 4.5, 5.8, 6.3] },
  ],
};

export const ENROLMENT = {
  series: [
    { key: "zero2", label: "ZERO2" },
    { key: "prism", label: "PRISM" },
    { key: "target", label: "TARGET" },
    { key: "pdx", label: "PDX Biobank" },
    { key: "rare", label: "Cohort B Rare" },
  ],
  data: ["Q1 24", "Q2 24", "Q3 24", "Q4 24", "Q1 25", "Q2 25", "Q3 25", "Q4 25", "Q1 26"].map((label, i) => ({
    label,
    values: { zero2: 120 + ((i * 37) % 90), prism: 60 + ((i * 23) % 50), target: 40 + ((i * 17) % 40), pdx: 30 + ((i * 11) % 30), rare: 20 + ((i * 7) % 20) },
  })),
};

/* Oncoprint — 24 participants × 8 genes, deterministic. */
export const ONCO_SAMPLES = Array.from({ length: 24 }, (_, i) => `0${(i % 7) + 1}-0${String(100 + i * 37).slice(-3)}`);
const ONCO_GENES = ["TP53", "MYCN", "ALK", "NF1", "ATRX", "CDKN2A", "H3-3A", "BRAF"];
const TYPES: AlterationType[] = ["SNV", "CNV", "SV", "RNA", "Germline", "Methylation"];
export const ONCO_GENES_DATA: OncoprintGene[] = ONCO_GENES.map((gene, g) => ({
  gene,
  alterations: ONCO_SAMPLES.map((_, s) => {
    const h = (g * 7919 + s * 104729) % 97;
    const rate = [62, 48, 40, 34, 30, 26, 22, 18][g];
    if (h > rate) return [];
    const first = TYPES[(h + g) % (g === 0 ? 2 : TYPES.length)];
    return h % 9 === 0 ? [first, TYPES[(h + 3) % TYPES.length]].filter((t, i, a) => a.indexOf(t) === i) : [first];
  }),
}));
const SEX_COLOR = { F: "var(--insight-color-magenta-50)", M: "var(--insight-color-blue-50)" };
const EVENT_COLOR = { Diagnosis: "var(--insight-color-grey-50)", Relapse: "var(--insight-color-orange-100)" };
const CAT_COLOR = { CNS: "var(--insight-color-yellow-100)", Sarcoma: "var(--insight-color-green-50)", HM: "var(--insight-color-red-50)", Neuroblastoma: "var(--insight-color-violet-50)" };
export const ONCO_TRACKS: OncoprintTrack[] = [
  { label: "Sex", values: ONCO_SAMPLES.map((_, s) => (s % 3 === 0 ? { value: "M", color: SEX_COLOR.M } : { value: "F", color: SEX_COLOR.F })) },
  { label: "Event", values: ONCO_SAMPLES.map((_, s) => (s % 4 === 1 ? { value: "Relapse", color: EVENT_COLOR.Relapse } : { value: "Diagnosis", color: EVENT_COLOR.Diagnosis })) },
  {
    label: "Category",
    values: ONCO_SAMPLES.map((_, s) => {
      const k = (["CNS", "Sarcoma", "HM", "Neuroblastoma"] as const)[s % 4];
      return { value: k, color: CAT_COLOR[k] };
    }),
  },
];

/* Frequency heatmap — molecular tab. */
export const HEAT_COLUMNS = ["CNS", "Haematological", "Neuroblastoma", "Sarcoma"];
export const HEAT_ROWS = ["KRAS", "PIK3CA", "MYCN", "NF1", "CDKN2A"].map((gene, g) => ({
  label: gene,
  cells: HEAT_COLUMNS.map((_, c) => {
    const opts = [3, 8, 12, 15, 18, 22, 30, 38];
    const p = opts[(g * 5 + c * 3 + g * c) % opts.length];
    return { pct: p, count: `${Math.max(1, Math.round(p * 1.2))}/120` };
  }),
}));
