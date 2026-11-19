/* Molecular tab — mock data transcribed from Figma "Insights" (overview 15230:17286, gene detail 15230:18879). Layout only. */
import type { StackSeries } from "../../../components/Charts/Plots";
import type { HeatmapCell } from "../../../components/Charts/Genomic";

/* ─────────────────────────── Overview · search ─────────────────────────── */

export const FREQUENT_GENES = ["TP53", "CDKN2A", "ETV6", "CDKN2B", "BRAF", "KRAS", "RUNX1", "NRAS", "PAX5", "KIAA1549"];

/* ─────────────── Overview · frequency of reportable alterations ─────────────── */

export interface FrequencyRow {
  name: string;
  samples: number;
}

export interface FrequencyTable {
  key: string;
  title: string;
  /** "40,946 genes" */
  countLabel: string;
  /** Column header for the name column — "Gene" or "Event". */
  nameHeader: string;
  /** Fusion events are not genes, so they do not open the gene detail. */
  linkable: boolean;
  rows: FrequencyRow[];
}

export const FREQUENCY_TABLES: FrequencyTable[] = [
  {
    key: "snv",
    title: "SNVs",
    countLabel: "40,946 genes",
    nameHeader: "Gene",
    linkable: true,
    rows: [
      { name: "TP53", samples: 274 },
      { name: "KRAS", samples: 186 },
      { name: "NRAS", samples: 168 },
      { name: "BRAF", samples: 145 },
      { name: "FLT3", samples: 119 },
      { name: "H3-3A", samples: 119 },
      { name: "PTPN11", samples: 111 },
      { name: "NF1", samples: 98 },
      { name: "PIK3CA", samples: 87 },
      { name: "ATRX", samples: 81 },
    ],
  },
  {
    key: "cnv",
    title: "CNVs",
    countLabel: "245 genes",
    nameHeader: "Gene",
    linkable: true,
    rows: [
      { name: "CDKN2A", samples: 265 },
      { name: "CDKN2B", samples: 250 },
      { name: "ETV6", samples: 64 },
      { name: "MYCN", samples: 61 },
      { name: "CDKN1B", samples: 45 },
      { name: "MYC", samples: 37 },
      { name: "TP53", samples: 36 },
      { name: "RB1", samples: 33 },
      { name: "PTEN", samples: 29 },
      { name: "IKZF1", samples: 27 },
    ],
  },
  {
    key: "rna",
    title: "RNA Expression",
    countLabel: "398 genes",
    nameHeader: "Gene",
    linkable: true,
    rows: [
      { name: "IGF2", samples: 95 },
      { name: "H19", samples: 90 },
      { name: "FGFR4", samples: 64 },
      { name: "SMARCB1", samples: 52 },
      { name: "TP53", samples: 44 },
      { name: "CDKN2A", samples: 38 },
      { name: "JAK1", samples: 34 },
      { name: "MYCN", samples: 31 },
      { name: "ALK", samples: 28 },
      { name: "WT1", samples: 24 },
    ],
  },
  {
    key: "sv",
    title: "SVs and Fusion",
    countLabel: "698 events",
    nameHeader: "Event",
    linkable: false,
    rows: [
      { name: "KIAA1549-BRAF", samples: 124 },
      { name: "ETV6-RUNX1", samples: 101 },
      { name: "EWSR1-FLI1", samples: 83 },
      { name: "PAX5", samples: 46 },
      { name: "IKZF1", samples: 41 },
      { name: "PAX3-FOXO1", samples: 40 },
      { name: "DLG2", samples: 31 },
      { name: "KMT2A-AFF1", samples: 28 },
      { name: "BCR-ABL1", samples: 22 },
      { name: "TCF3-PBX1", samples: 19 },
    ],
  },
];

/* ─────────────── Overview · top reportable alterations ─────────────── */

export type AlterationTab = "snv" | "sv" | "cnv" | "rna";

export const ALTERATION_TABS: Array<{ value: AlterationTab; label: string; count: number; noun: string }> = [
  { value: "snv", label: "Somatic SNVs", count: 27_514_525, noun: "somatic SNVs" },
  { value: "sv", label: "Somatic SVs", count: 698, noun: "somatic SVs" },
  { value: "cnv", label: "CNVs", count: 1_636, noun: "CNVs" },
  { value: "rna", label: "RNA Expression", count: 2_559, noun: "RNA expression outliers" },
];

/** Variant impact: Low, Moderate, Null (loss of function), Frameshift. */
export type Impact = "L" | "M" | "N" | "F";

/** Top-level cancer category — drives the colour of the breadcrumb squares. */
export type CancerCategory = "CNS" | "HM" | "Sarcoma" | "Solid tumour" | "Neuroblastoma";

export interface AlterationRow {
  biosample: string;
  variant: string;
  impact: Impact;
  cohort: string;
  /** [category, type, subtype] */
  cancer: [CancerCategory, string, string];
  pathogenicity: "C4" | "C5";
  vaf: string;
  targetable: boolean;
}

export const TOP_ALTERATIONS: AlterationRow[] = [
  { biosample: "ZVRRXRG8-T-2ES566H5-W", variant: "NM_014159.6(SETD2):c.4715+1G>A", impact: "L", cohort: "Cohort 1: High-risk cancers", cancer: ["Sarcoma", "Rhabdomyosarcoma", "RMS FOXO1 fusion positive"], pathogenicity: "C4", vaf: "0.39 (20/134)", targetable: false },
  { biosample: "ZT6TNSM3-T-1M2S6SLQ-W", variant: "NM_004985.5(KRAS):c.183A>C (p.Gln61His)", impact: "M", cohort: "Cohort 1: High-risk cancers", cancer: ["CNS", "Adult-type diffuse glioma", "HGG"], pathogenicity: "C5", vaf: "0.77 (59/128)", targetable: true },
  { biosample: "ZT6TNSM3-T-1M2S6SLQ-W", variant: "NM_002834.5(PTPN11):c.154A>G (p.Thr52Ala)", impact: "M", cohort: "Cohort 1: High-risk cancers", cancer: ["CNS", "Adult-type diffuse glioma", "HGG"], pathogenicity: "C4", vaf: "0.07 (5/108)", targetable: true },
  { biosample: "ZRJUJA7Q-T-N41X6B3B-W", variant: "NM_181523.3(PIK3R1):c.2170C>T (p.Arg724Ter)", impact: "N", cohort: "Cohort 1: High-risk cancers", cancer: ["CNS", "Paediatric-type diffuse HGG", "HGG"], pathogenicity: "C4", vaf: "0.48 (24/84)", targetable: true },
  { biosample: "ZMZF74Q3-T-2GX970MS-W", variant: "NM_002834.5(PTPN11):c.215C>T (p.Ala72Val)", impact: "M", cohort: "Cohort 1: High-risk cancers", cancer: ["HM", "Leukaemia", "Myeloproliferative neoplasm"], pathogenicity: "C5", vaf: "0.48 (65/135)", targetable: false },
  { biosample: "ZL48SBR3-T-93RPLPPY-W", variant: "NM_003073.5(SMARCB1):c.837dup (p.Glu280Ter)", impact: "F", cohort: "Cohort 1: High-risk cancers", cancer: ["Sarcoma", "Kidney tumour", "Rhabdoid tumour"], pathogenicity: "C4", vaf: "0.65 (64/108)", targetable: false },
  { biosample: "ZKF1EQS6-T-31XLDDVW-W", variant: "NM_001904.4(CTNNB1):c.133T>C (p.Ser45Pro)", impact: "M", cohort: "Cohort 12: Other tumours", cancer: ["Solid tumour", "Solid other", "Fibroblastic and myofibroblastic tumour"], pathogenicity: "C4", vaf: "0.48 (44/118)", targetable: false },
  { biosample: "ZFPKKQH6-T-2A7U9HK3-W", variant: "NM_005324.5(H3-3B):c.83A>T (p.Lys28Ile)", impact: "M", cohort: "Cohort 1: High-risk cancers", cancer: ["CNS", "Paediatric-type diffuse HGG", "DMG"], pathogenicity: "C5", vaf: "0.58 (73/160)", targetable: false },
  { biosample: "ZFPKKQH6-T-2A7U9HK3-W", variant: "NM_001042492.3(NF1):c.3888T>A (p.Tyr1296Ter)", impact: "N", cohort: "Cohort 1: High-risk cancers", cancer: ["CNS", "Paediatric-type diffuse HGG", "DMG"], pathogenicity: "C5", vaf: "0.91 (68/85)", targetable: true },
  { biosample: "ZDK3PQ81-T-7HW2KX5C-W", variant: "NM_000546.6(TP53):c.817C>T (p.Arg273Cys)", impact: "M", cohort: "Cohort 1: High-risk cancers", cancer: ["Sarcoma", "Bone tumours", "Osteosarcoma"], pathogenicity: "C5", vaf: "0.52 (61/117)", targetable: false },
];

/* ─────────────────────────── Gene detail ─────────────────────────── */

export interface GeneProfile {
  symbol: string;
  name: string;
  location: string;
  aliases: string;
  description: string;
  participants: string;
  subtypes: string;
  topCancer: { name: string; share: string };
  coOccurrence: Array<{ gene: string; share: string }>;
  classType: { count: number; label: string };
  commonVariant: { name: string; consequence: string; significance: string };
  pdxModels: string;
  participantCount: string;
}

export const TP53_PROFILE: GeneProfile = {
  symbol: "TP53",
  name: "tumor protein p53",
  location: "chr17:7687489-7668420",
  aliases: "BCC7; BMFS5; LFS1; P53; TRP53",
  description:
    "This gene encodes a tumor suppressor protein containing transcriptional activation, DNA binding, and oligomerization domains. The encoded protein responds to diverse cellular stresses to regulate expression of target genes, thereby inducing cell cycle arrest, apoptosis, senescence, DNA repair, or changes in metabolism. Mutations in this gene are associated with a variety of human cancers, including hereditary cancers such as Li-Fraumeni syndrome. Alternative splicing of this gene and the use of alternate promoters result in multiple transcript variants and isoforms. Additional isoforms have also been shown to result from the use of alternate translation initiation codons from identical transcript variants (PMIDs: 12032546, 20937277). [provided by RefSeq, Dec 2016]",
  participants: "223 of 2,824 participants (7.9%)",
  subtypes: "53 cancer subtypes",
  topCancer: { name: "CNS", share: "117/856 participants (13.7%)" },
  coOccurrence: [
    { gene: "H3-3A", share: "65/223 (29.1%)" },
    { gene: "ATRX", share: "26/223 (11.7%)" },
  ],
  classType: { count: 190, label: "Missense" },
  commonVariant: { name: "R273C", consequence: "Missense", significance: "Pathogenic" },
  pdxModels: "10 Models",
  participantCount: "223 Participants",
};

/** Only TP53 carries real data; other genes reuse its layout with the symbol swapped. */
export function geneProfile(symbol: string): GeneProfile {
  if (symbol === TP53_PROFILE.symbol) return TP53_PROFILE;
  return { ...TP53_PROFILE, symbol, name: `${symbol} (example data)` };
}

/* ── Cancer types with mutations (stacked bar) ── */

export const MUTATION_SERIES: StackSeries[] = [
  { key: "somaticSv", label: "somatic sv", color: "var(--molecular-somatic-sv)" },
  { key: "germlineSv", label: "germline sv", color: "var(--molecular-germline-sv)" },
  { key: "somaticSnv", label: "somatic snv", color: "var(--molecular-somatic-snv)" },
  { key: "germlineSnv", label: "germline snv", color: "var(--molecular-germline-snv)" },
  { key: "cnv", label: "cnv", color: "var(--molecular-cnv)" },
  { key: "rnaexp", label: "rnaexp", color: "var(--molecular-rnaexp)" },
];

type Counts = Partial<Record<"somaticSv" | "germlineSv" | "somaticSnv" | "germlineSnv" | "cnv" | "rnaexp", number>>;

export const MUTATION_GROUPS: Array<{ category: string; types: Array<{ label: string; values: Counts }> }> = [
  {
    category: "CNS",
    types: [
      { label: "Adult-type diffuse glioma", values: { somaticSnv: 24, cnv: 1, rnaexp: 1 } },
      { label: "CNS embryonal tumour", values: { somaticSv: 2, somaticSnv: 9, rnaexp: 2 } },
      { label: "CNS mesenchymal tumour", values: { somaticSnv: 1 } },
      { label: "CNS other", values: { somaticSnv: 2 } },
      { label: "Choroid plexus tumour", values: { somaticSnv: 1, rnaexp: 1 } },
      { label: "Germ cell tumour", values: { cnv: 1 } },
      { label: "Paediatric-type diffuse HGG", values: { somaticSv: 3, somaticSnv: 107, cnv: 8, rnaexp: 9 } },
    ],
  },
  {
    category: "HM",
    types: [
      { label: "Leukaemia", values: { somaticSnv: 17, cnv: 4, rnaexp: 1 } },
      { label: "Lymphoma", values: { somaticSv: 2, somaticSnv: 28 } },
      { label: "Myelodysplastic syndrome", values: { somaticSnv: 1, cnv: 1 } },
    ],
  },
  { category: "Neuroblastoma", types: [{ label: "Neuroblastoma", values: { somaticSnv: 3, rnaexp: 1 } }] },
  {
    category: "Sarcoma",
    types: [
      { label: "Bone tumours", values: { somaticSv: 55, somaticSnv: 14, cnv: 17, rnaexp: 19 } },
      { label: "Ewing sarcoma", values: { somaticSv: 1, somaticSnv: 17, cnv: 2, rnaexp: 1 } },
      { label: "Kidney tumour", values: { somaticSnv: 1 } },
      { label: "Liver tumour", values: { somaticSnv: 1, rnaexp: 1 } },
      { label: "Peripheral nerve sheath tumour", values: { somaticSv: 3, somaticSnv: 1, rnaexp: 2 } },
      { label: "Rhabdomyosarcoma", values: { somaticSv: 1, somaticSnv: 10, rnaexp: 2 } },
      { label: "Sarcoma other", values: { somaticSv: 1, somaticSnv: 8, rnaexp: 2 } },
    ],
  },
  {
    category: "Solid tumour",
    types: [
      { label: "Adrenal cortical tumour", values: { somaticSnv: 1, rnaexp: 1 } },
      { label: "Carcinoma", values: { somaticSnv: 4, rnaexp: 1 } },
      { label: "Kidney tumour", values: { somaticSnv: 9, rnaexp: 1 } },
      { label: "Solid other", values: { somaticSnv: 3 } },
    ],
  },
];

export const MUTATION_DATA = MUTATION_GROUPS.flatMap((g) => g.types.map((t) => ({ label: t.label, values: t.values as Record<string, number> })));

/* ── Mutation frequency heatmap ── */

export const HEAT_CATEGORIES = [
  "CNS",
  "HM",
  "Neuroblastoma",
  "Overgrowth syndrome",
  "Sarcoma",
  "Solid tumour",
  "Vascular/lymphatic anomalies",
];

const cells = (pairs: Array<[number, number]>): HeatmapCell[] =>
  pairs.map(([n, d]) => ({ pct: d ? Math.round((n / d) * 1000) / 10 : 0, count: `${n}/${d}` }));

export const HEAT_GENE_ROW = {
  label: "TP53",
  cells: cells([[117, 856], [38, 878], [3, 170], [0, 2], [49, 479], [16, 425], [0, 18]]),
};

export const HEAT_CO_OCCURRING = [
  { label: "H3-3A", cells: cells([[65, 117], [0, 38], [0, 3], [0, 0], [0, 49], [0, 16], [0, 0]]) },
  { label: "ATRX", cells: cells([[23, 117], [1, 38], [0, 3], [0, 0], [2, 49], [0, 16], [0, 0]]) },
  { label: "ID3", cells: cells([[0, 117], [15, 38], [0, 3], [0, 0], [0, 49], [0, 16], [0, 0]]) },
  { label: "PDGFRA", cells: cells([[14, 117], [0, 38], [0, 3], [0, 0], [0, 49], [0, 16], [0, 0]]) },
  { label: "PIK3CA", cells: cells([[11, 117], [0, 38], [0, 3], [0, 0], [1, 49], [0, 16], [0, 0]]) },
];

/** Rows shown by "Show more". */
export const HEAT_MORE = [
  { label: "NF1", cells: cells([[8, 117], [2, 38], [0, 3], [0, 0], [3, 49], [1, 16], [0, 0]]) },
  { label: "PTEN", cells: cells([[5, 117], [0, 38], [0, 3], [0, 0], [1, 49], [0, 16], [0, 0]]) },
];

export const emptyHeatRow = (label: string) => ({ label, cells: HEAT_CATEGORIES.map(() => ({ pct: 0, count: "0/0" })) });

/* ── Co-occurring genes network ── */

export interface NetworkNode {
  gene: string;
  /** Position in the 1000 × 560 viewBox. */
  x: number;
  y: number;
  r: number;
  count: string;
  color: string;
}

export interface NetworkEdge {
  from: string;
  to: string;
  pct: number;
}

export const NETWORK_NODES: NetworkNode[] = [
  { gene: "TP53", x: 500, y: 300, r: 52, count: "223/2824 (7.9%)", color: "var(--molecular-node-focus)" },
  { gene: "PIK3CA", x: 340, y: 150, r: 34, count: "62/2824 (2.2%)", color: "var(--insight-color-purple-50)" },
  { gene: "H3-3A", x: 630, y: 140, r: 40, count: "103/2824 (3.6%)", color: "var(--insight-color-blue-100)" },
  { gene: "PDGFRA", x: 790, y: 225, r: 24, count: "26/2824 (0.9%)", color: "var(--insight-color-orange-100)" },
  { gene: "ATRX", x: 750, y: 370, r: 30, count: "41/2824 (1.5%)", color: "var(--insight-color-green-160)" },
  { gene: "ID3", x: 460, y: 500, r: 20, count: "23/2824 (0.8%)", color: "var(--insight-color-turquoise-100)" },
];

export const NETWORK_EDGES: NetworkEdge[] = [
  { from: "TP53", to: "H3-3A", pct: 29.1 },
  { from: "TP53", to: "PIK3CA", pct: 5.4 },
  { from: "TP53", to: "PDGFRA", pct: 6.3 },
  { from: "TP53", to: "ATRX", pct: 11.7 },
  { from: "TP53", to: "ID3", pct: 6.7 },
  { from: "H3-3A", to: "PDGFRA", pct: 4.9 },
  { from: "H3-3A", to: "ATRX", pct: 6.7 },
  { from: "PDGFRA", to: "ATRX", pct: 3.6 },
];

/* ── Protein paint (lollipop) ── */

export const PROTEIN_LENGTH = 393;

export const PROTEIN_DOMAINS = [
  { label: "Transactivation", start: 1, end: 61, color: "var(--insight-color-blue-50)" },
  { label: "DNA-binding", start: 94, end: 292, color: "var(--insight-color-green-50)" },
  { label: "Tetramerisation", start: 325, end: 356, color: "var(--insight-color-orange-50)" },
];

export const PROTEIN_MUTATIONS = [
  { label: "R175H", pos: 175, count: 14 },
  { label: "Y220C", pos: 220, count: 6 },
  { label: "G245S", pos: 245, count: 8 },
  { label: "R248Q", pos: 248, count: 12 },
  { label: "R273C", pos: 273, count: 19 },
  { label: "R282W", pos: 282, count: 5 },
  { label: "R337H", pos: 337, count: 4 },
  { label: "P72R", pos: 72, count: 3 },
];
