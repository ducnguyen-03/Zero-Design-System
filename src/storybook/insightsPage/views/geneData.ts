/* Gene-level view data (Figma Insights-UI 7282:77274). Example values for layout only. */

export const GENE_CONTEXT = "Peripheral nerve sheath tumour";
export const COHORT_SIZE = 4500;

export interface GeneStat {
  id: string;
  label: string;
  value: string;
  unit?: string;
  note?: string;
}

export const GENE_STATS: GeneStat[] = [
  {
    id: "altered",
    label: "Number of altered genes",
    value: "400",
    unit: "unique genes",
    note: "Higher genomic complexity than most solid tumours in this dataset.",
  },
  {
    id: "carriers",
    label: "Participants carry ≥1 alteration",
    value: "80%",
    unit: "of participants",
    note: "3,600 of 4,500 participants",
  },
  { id: "dominant", label: "Dominant alteration", value: "SNV", note: "62% of all alterations" },
  { id: "top", label: "Most frequently altered gene", value: "ALK", unit: "· 41% of participants" },
];

/** Alteration types in the frequency chart, in stacking order. Figma hex → nearest core token. */
export const ALTERATIONS = [
  { id: "snv", label: "SNV", color: "var(--insight-color-green-160)" } /* #0c9f6e */,
  { id: "cnv", label: "CNV", color: "var(--insight-color-orange-100)" } /* #f59e0c */,
  { id: "fusion", label: "Fusion", color: "var(--insight-color-orange-200)" } /* #e05229 */,
  { id: "indel", label: "Indel", color: "var(--insight-color-magenta-50)" },
] as const;

export type AlterationId = (typeof ALTERATIONS)[number]["id"];

export interface TopGene {
  gene: string;
  /** % of participants with any alteration in the gene. */
  pct: number;
  /** Share of each alteration type, summing to `pct`. */
  split: Record<AlterationId, number>;
}

export const TOP_ALTERED_GENES: TopGene[] = [
  { gene: "ALK", pct: 50, split: { snv: 23, cnv: 16, fusion: 7, indel: 4 } },
  { gene: "MYCN", pct: 41, split: { snv: 5, cnv: 3, fusion: 0, indel: 33 } },
  { gene: "ATRX", pct: 36, split: { snv: 6, cnv: 3, fusion: 24, indel: 3 } },
  { gene: "TP53", pct: 32, split: { snv: 4, cnv: 3, fusion: 0, indel: 25 } },
  { gene: "PTPN11", pct: 26, split: { snv: 4, cnv: 0, fusion: 22, indel: 0 } },
  { gene: "NRAS", pct: 23, split: { snv: 4, cnv: 0, fusion: 19, indel: 0 } },
  { gene: "NF1", pct: 15, split: { snv: 4, cnv: 0, fusion: 11, indel: 0 } },
  { gene: "KRAS", pct: 11, split: { snv: 2, cnv: 3, fusion: 6, indel: 0 } },
  { gene: "BRAF", pct: 9, split: { snv: 0, cnv: 0, fusion: 9, indel: 0 } },
  { gene: "CDKN2A", pct: 8, split: { snv: 2, cnv: 3, fusion: 0, indel: 3 } },
];

/** Point mutation consequence columns (Figma "Point mutation" badges). Figma hex → nearest core token. */
export const POINT_MUTATIONS = [
  { id: "M", label: "Missense", color: "var(--insight-color-blue-150)" } /* #3987cd */,
  { id: "FR", label: "Frameshift", color: "var(--insight-color-red-150)" } /* #c83d3d */,
  { id: "N", label: "Nonsense", color: "var(--insight-color-orange-150)" } /* #ff7f0f */,
  { id: "PI", label: "Protein deletion", color: "var(--insight-color-grey-100)" } /* #646464 */,
  { id: "PR", label: "Protein insertion", color: "var(--insight-color-orange-200)" } /* #8d574b */,
  { id: "S", label: "Splice", color: "var(--insight-color-violet-100)" } /* #6733ff */,
  { id: "SR", label: "Splice region", color: "var(--insight-color-purple-100)" } /* #9567bd */,
] as const;

export type PointMutationId = (typeof POINT_MUTATIONS)[number]["id"];

export interface GeneTableRow {
  gene: string;
  role: "Tumour suppressor" | "Oncogene" | "Fusion partner";
  altered: number;
  mutations: Partial<Record<PointMutationId, number>>;
}

const row = (
  gene: string,
  role: GeneTableRow["role"],
  altered: number,
  mutations: GeneTableRow["mutations"],
): GeneTableRow => ({ gene, role, altered, mutations });

export const GENE_ROWS: GeneTableRow[] = [
  row("TP53", "Tumour suppressor", 712, { M: 500, FR: 20, N: 20, PI: 300, PR: 1, S: 2, SR: 20 }),
  row("NRAS", "Oncogene", 640, { M: 10, FR: 300, N: 20, PR: 110 }),
  row("ALK", "Oncogene", 612, { M: 1, FR: 300, N: 20, PR: 110 }),
  row("ATRX", "Tumour suppressor", 540, { FR: 300, N: 2, PR: 110 }),
  row("MYCN", "Oncogene", 498, { FR: 10, N: 234, PR: 345, S: 2 }),
  row("PTPN11", "Oncogene", 410, { M: 120, N: 12, S: 4 }),
  row("NF1", "Tumour suppressor", 388, { M: 40, FR: 66, N: 51, S: 9 }),
  row("KRAS", "Oncogene", 301, { M: 210, PR: 3 }),
  row("BRAF", "Oncogene", 254, { M: 180, PI: 4 }),
  row("CDKN2A", "Tumour suppressor", 221, { FR: 14, N: 30, PI: 70 }),
  row("SMARCB1", "Tumour suppressor", 190, { FR: 22, N: 41, SR: 3 }),
  row("RB1", "Tumour suppressor", 176, { FR: 18, N: 35, S: 7 }),
  row("PIK3CA", "Oncogene", 160, { M: 140 }),
  row("EWSR1", "Fusion partner", 152, { PR: 2 }),
  row("FGFR1", "Oncogene", 141, { M: 61, PR: 4 }),
  row("PHOX2B", "Oncogene", 133, { M: 12, FR: 9 }),
  row("ARID1A", "Tumour suppressor", 121, { FR: 30, N: 25 }),
  row("CTNNB1", "Oncogene", 118, { M: 96 }),
  row("SUZ12", "Tumour suppressor", 104, { FR: 12, N: 8, S: 2 }),
  row("EED", "Tumour suppressor", 96, { FR: 9, N: 6 }),
  row("CIC", "Tumour suppressor", 90, { FR: 11, M: 9 }),
  row("DICER1", "Tumour suppressor", 82, { M: 31, FR: 5 }),
];

/** Genes in the cohort; the table pages through the first `GENE_ROWS.length` of these. */
export const TOTAL_GENES = 400;
