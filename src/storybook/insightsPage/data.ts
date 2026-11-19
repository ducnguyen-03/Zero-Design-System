/* Mock cohort data for the Insights onboarding-tour prototype
 * (Figma Insights-UI › Hand off, "Untitled query - default state" 15212:85165). */

export const QUERY_TITLE = "Untitled query";

export interface SavedQuery {
  id: string;
  label: string;
  age: string;
  /** Unread-results dot left of the label (Figma "Query status"). */
  status?: "new" | "updated";
}

export const SAVED_QUERIES: SavedQuery[] = [
  { id: "q1", label: "Please share the genomic data associated with neuroblastoma patients.", age: "1h" },
  { id: "q2", label: "Could you provide the genomic information related to neuroblastoma patients?", age: "2h", status: "new" },
  { id: "q3", label: "I would appreciate it if you could share the genomic data for neuroblastoma patients.", age: "1h" },
  { id: "q4", label: "Can you provide genomic data for patients diagnosed with neuroblastoma?", age: "1h", status: "updated" },
  { id: "q5", label: "I would like to request genomic information related to neuroblastoma patients.", age: "1w" },
  { id: "q6", label: "I would like to request genomic information related to neuroblastoma patients.", age: "2w", status: "updated" },
  { id: "q7", label: "Please send over the genomic data pertaining to neuroblastoma patients.", age: "2m" },
  { id: "q8", label: "Can you share the genomic data connected to neuroblastoma patients?", age: "2m" },
  { id: "q9", label: "Would you be able to provide the genomic data for patients with neuroblastoma?", age: "3m" },
  { id: "q10", label: "Could you send the genomic data relevant to neuroblastoma patients?", age: "4m" },
];

export interface SummaryMetric {
  id: string;
  label: string;
  total: number;
  published: number;
}

export const SUMMARY_METRICS: SummaryMetric[] = [
  { id: "participants", label: "Total participants", total: 3706, published: 356 },
  { id: "samples", label: "Total samples", total: 14919, published: 373 },
  { id: "pdx", label: "PDX models", total: 203, published: 126 },
];

/** Chart series colours — every value is a DS hue token. */
export const SERIES = {
  blue: "var(--insight-color-blue-100)",
  red: "var(--insight-color-warm-red-50)",
  teal: "var(--insight-color-turquoise-100)",
  orange: "var(--insight-color-orange-150)",
  lime: "var(--insight-color-green-50)",
  green: "var(--insight-color-green-150)",
  magenta: "var(--insight-color-magenta-50)",
  vermilion: "var(--insight-color-orange-200)",
  violet: "var(--insight-color-purple-50)",
  slate: "var(--insight-color-grey-100)",
  ink: "var(--insight-color-off-black-100)",
  muted: "var(--insight-color-grey-50)",
} as const;

export interface CategoryRow {
  label: string;
  count: number;
  freq: string;
  color: string;
}

export const CANCER_CATEGORIES: CategoryRow[] = [
  { label: "Leukaemia", count: 890, freq: "24.5%", color: SERIES.red },
  { label: "Neuroblastoma", count: 241, freq: "6.6%", color: SERIES.violet },
  { label: "Paediatric-type diffuse HGG", count: 229, freq: "6.3%", color: SERIES.orange },
  { label: "Circumscribed astrocytic glioma", count: 223, freq: "6.2%", color: SERIES.orange },
  { label: "CNS embryonal tumour", count: 199, freq: "5.5%", color: SERIES.orange },
  { label: "Lymphoma", count: 194, freq: "5.4%", color: SERIES.red },
  { label: "Solid other", count: 179, freq: "4.9%", color: SERIES.blue },
  { label: "Sarcoma other", count: 162, freq: "4.5%", color: SERIES.green },
  { label: "Ependymal tumour", count: 151, freq: "4.2%", color: SERIES.orange },
  { label: "Rhabdomyosarcoma", count: 140, freq: "3.9%", color: SERIES.green },
];

export interface BarDatum {
  label: string;
  value: number;
  color?: string;
}

export const AGE_AT_DIAGNOSIS: BarDatum[] = [
  { label: "0-2", value: 400 },
  { label: "3-5", value: 400 },
  { label: "6-12", value: 900 },
  { label: "13-19", value: 950 },
  { label: "20-25", value: 120 },
  { label: "Unknown", value: 40, color: SERIES.muted },
];

export const STUDY_DISTRIBUTION: BarDatum[] = [
  { label: "PDX Biobank", value: 60, color: SERIES.teal },
  { label: "PRISM", value: 380, color: SERIES.teal },
  { label: "Cohort B Rare Cancers", value: 70, color: SERIES.blue },
  { label: "TARGET", value: 40, color: SERIES.orange },
  { label: "ZERO2", value: 2600, color: SERIES.violet },
];

export const EXPERIMENTAL_STRATEGY: BarDatum[] = [
  { label: "PDX", value: 90, color: SERIES.teal },
  { label: "WGS", value: 7000, color: SERIES.magenta },
  { label: "RNASeq", value: 2900, color: SERIES.orange },
  { label: "Methylation", value: 3500, color: SERIES.green },
  { label: "TDS", value: 400, color: SERIES.violet },
  { label: "HTS", value: 150, color: SERIES.blue },
];

export interface PieDatum {
  label: string;
  value: number;
  color: string;
}

export const SEX_DISTRIBUTION: PieDatum[] = [
  { label: "Male", value: 1950, color: SERIES.green },
  { label: "Female", value: 1600, color: SERIES.blue },
  { label: "Unknown", value: 1300, color: "var(--insight-color-grey-50)" },
  { label: "Other", value: 900, color: SERIES.teal },
];

export const EVENT_DISTRIBUTION: PieDatum[] = [
  { label: "Diagnosis", value: 2900, color: SERIES.blue },
  { label: "Relapse", value: 520, color: SERIES.violet },
  { label: "Progressive disease", value: 140, color: SERIES.lime },
  { label: "Other", value: 60, color: SERIES.orange },
  { label: "Unknown", value: 40, color: SERIES.slate },
];

export const VITAL_STATUS: PieDatum[] = [
  { label: "Alive", value: 2100, color: SERIES.blue },
  { label: "Deceased", value: 1500, color: SERIES.green },
  { label: "Unknown", value: 100, color: "var(--insight-color-grey-50)" },
];

/** Cohort Demographics — one slice per cohort. */
export const COHORT_DEMOGRAPHICS: PieDatum[] = [
  { label: "Cohort 1", value: 820, color: "var(--insight-color-orange-200)" },
  { label: "Cohort 2", value: 520, color: SERIES.lime },
  { label: "Cohort 3", value: 470, color: SERIES.teal },
  { label: "Cohort 4", value: 300, color: "var(--insight-color-blue-150)" },
  { label: "Cohort 5", value: 160, color: SERIES.violet },
  { label: "Cohort 6", value: 120, color: SERIES.blue },
  { label: "Cohort 7", value: 110, color: SERIES.green },
  { label: "Cohort 8", value: 100, color: "var(--insight-color-red-100)" },
  { label: "Cohort 9", value: 90, color: SERIES.orange },
  { label: "Cohort 10", value: 80, color: SERIES.magenta },
  { label: "Cohort 11", value: 70, color: "var(--insight-color-yellow-150)" },
  { label: "Cohort 12", value: 60, color: "var(--insight-color-purple-150)" },
  { label: "Other", value: 50, color: SERIES.slate },
];

export interface UpsetData {
  /** Set name, total size. */
  sets: { label: string; size: number }[];
  /** Each intersection: column height + which set indices are members. */
  intersections: { value: number; members: number[] }[];
  max: number;
  yTicks: number[];
  yLabel: string;
}

export const SEQUENCING_UPSET: UpsetData = {
  sets: [
    { label: "RNASeq", size: 2679 },
    { label: "Methylation", size: 3177 },
    { label: "WGS", size: 3491 },
  ],
  intersections: [
    { value: 3491, members: [2] },
    { value: 3177, members: [1] },
    { value: 3175, members: [1, 2] },
    { value: 2679, members: [0, 2] },
    { value: 2679, members: [0] },
    { value: 2658, members: [0, 1] },
    { value: 2658, members: [0, 1, 2] },
  ],
  max: 3500,
  yTicks: [3500, 1750, 0],
  yLabel: "Participants",
};

export const VALIDATION_UPSET: UpsetData = {
  sets: [
    { label: "STR profiling", size: 77 },
    { label: "IHC", size: 74 },
    { label: "SNP array", size: 189 },
    { label: "Flow cytometry", size: 126 },
  ],
  intersections: [
    { value: 189, members: [2] },
    { value: 126, members: [2, 3] },
    { value: 126, members: [3] },
    { value: 77, members: [0] },
    { value: 74, members: [0, 1] },
    { value: 74, members: [1] },
    { value: 63, members: [0, 2] },
    { value: 61, members: [0, 1, 2] },
    { value: 61, members: [1, 2] },
  ],
  max: 200,
  yTicks: [200, 100, 0],
  yLabel: "Number of PDX models",
};

export interface GeneRow {
  gene: string;
  mutations: number;
  samples: number;
  freq: string;
  /** Mutation-type split as fractions (missense, truncating, splice, fusion). */
  split: [number, number, number, number];
}

export const MUTATED_GENES: GeneRow[] = [
  { gene: "CDKN2A", mutations: 365, samples: 352, freq: "9.6%", split: [0.05, 0, 0.9, 0.05] },
  { gene: "TP53", mutations: 257, samples: 348, freq: "9.5%", split: [0.7, 0.05, 0.15, 0.1] },
  { gene: "CDKN2B", mutations: 288, samples: 286, freq: "7.7%", split: [0.05, 0, 0.95, 0] },
  { gene: "KRAS", mutations: 114, samples: 219, freq: "6.3%", split: [0.7, 0, 0.1, 0.2] },
  { gene: "NRAS", mutations: 43, samples: 188, freq: "5.4%", split: [0.5, 0.1, 0.15, 0.25] },
  { gene: "ETV6", mutations: 278, samples: 162, freq: "4.8%", split: [0.8, 0, 0.2, 0] },
  { gene: "BRAF", mutations: 112, samples: 155, freq: "4.7%", split: [0.95, 0, 0, 0.05] },
  { gene: "FLT3", mutations: 195, samples: 150, freq: "4.3%", split: [0.7, 0, 0.2, 0.1] },
];

export const MUTATION_COLORS = [
  "var(--insight-color-green-150)",
  "var(--insight-color-orange-200)",
  "var(--insight-color-purple-50)",
  "var(--insight-color-blue-100)",
] as const;

/* ── Applied query filters (Figma Insights-UI 7282:77049 "Current filter when applied") ── */

export interface AppliedFilter {
  /** Filter domain on the right rail (cancer, study, participant, sample, clinical, molecular). */
  domain: string;
  label: string;
  values: string[];
}

export const APPLIED_FILTERS: AppliedFilter[] = [
  {
    domain: "cancer",
    label: "Cancer category",
    values: ["Solid Tumour", "Peripheral nerve sheath tumour", "Hepatoblastoma/HCC"],
  },
  { domain: "study", label: "Study codes", values: ["Cohort B Rare Cancers", "PRISM", "ZERO-Repeat"] },
  {
    domain: "study",
    label: "Cohort",
    values: [
      "HR",
      "Rare",
      "CNS",
      "NBL",
      "AML + Other",
      "ALL",
      "Lymphoma",
      "Sarcoma",
      "Kidney",
      "Liver",
      "Thyroid + Endocrine",
      "Other",
      "Germline",
    ],
  },
  {
    domain: "participant",
    label: "Sites",
    values: [
      "Adelaide (SA)",
      "John Hunter (NSW)",
      "Monash (VIC)",
      "Perth (WA)",
      "Queensland (QLD)",
      "Randwick (NSW)",
      "Royal (VIC)",
      "Westmead (NSW)",
    ],
  },
  {
    domain: "molecular",
    label: "Gene",
    values: ["ALK", "MYCN", "ATRX", "TP53", "PTPN11", "NRAS", "NF1", "KRAS", "BRAF", "CDKN2A", "SMARCB1", "RB1"],
  },
];

/** Study filter domain (Figma 7288:45465): checklist sections with a conditional "Match:" select. */
export const STUDY_FILTER_SECTIONS = [
  {
    key: "cohort",
    title: "Cohort",
    options: [
      { value: "cohort-1", label: "Cohort 1: High-risk cancers", count: 1234 },
      { value: "cohort-2", label: "Cohort 2: Rare tumours", count: 1234 },
      { value: "cohort-8", label: "Cohort 8: Sarcomas", count: 1234 },
    ],
  },
  {
    key: "study",
    title: "Study",
    options: [
      { value: "cohort-b", label: "Cohort B Rare Cancers", count: 1234 },
      { value: "prism", label: "PRISM", count: 1234 },
      { value: "zero2", label: "ZERO2", count: 1234 },
    ],
  },
];
