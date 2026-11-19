/* SAVvy (Curation Atlas › SAVvy) — mock data and pure helpers.
   Everything here is deterministic; the view only holds UI state. */

export type SavvyCaseView = "passed" | "failed" | "low" | "noevents" | "indel";
export type SavvyMode = "empty" | SavvyCaseView;

export interface SavvyCase {
  view: SavvyCaseView;
  name: string;
  /** Variant position relative to the first base of the exon (E+1, chr17:31,181,710). */
  off: number;
  ref: string;
  alt: string;
  hgvs: string;
  csq: string;
  shows: string;
}

/** Example variants. Each case is decided by the normalised gnomAD ID, never by the input format. */
export const CASES: Record<string, SavvyCase> = {
  "17-31181710-G-T": { view: "passed", name: "Checks passed", off: 0, ref: "G", alt: "T", hgvs: "NM_001042492.3(NF1):c.655G>T", csq: "missense_variant", shows: "Acceptor E+1, spliceogenicity 96.8%, predictors agree" },
  "17-31181708-A-G": { view: "failed", name: "Failed check", off: -2, ref: "A", alt: "G", hgvs: "NM_001042492.3(NF1):c.655-2A>G", csq: "splice_acceptor_variant", shows: "Amber requirements banner, caution chip" },
  "17-31181712-A-G": { view: "low", name: "Low spliceogenicity", off: 2, ref: "A", alt: "G", hgvs: "NM_001042492.3(NF1):c.657A>G", csq: "splice_region_variant", shows: "23.4%, unlikely splice-altering, predictors agree" },
  "17-31181700-T-C": { view: "noevents", name: "No event breakdown", off: -10, ref: "T", alt: "C", hgvs: "NM_001042492.3(NF1):c.655-10T>C", csq: "splice_polypyrimidine_tract_variant", shows: "Splicing-events empty state" },
  "17-31181710-G-GA": { view: "indel", name: "Indel", off: 0, ref: "G", alt: "GA", hgvs: "NM_001042492.3(NF1):c.655_656insA", csq: "frameshift_variant", shows: "In silico predictions only" },
};
export const DEFAULT_CASE = "17-31181710-G-T";
export const caseKeyForView = (view: SavvyMode): string =>
  Object.keys(CASES).find((k) => CASES[k].view === view) ?? DEFAULT_CASE;

export const FORMATS: Array<[string, string]> = [
  ["gnomAD ID", "17-31181710-G-T"],
  ["gnomAD API", "17:31181710:G:T"],
  ["HGVS genomic", "17:31181710:g.G>T"],
  ["HGVS transcript", "NM_001042492.3:c.655G>T"],
];

/* ---------------- Sequence ---------------- */

const RAW_SEQ =
  "AAAAGGTAAGTTACAACCTCTCTGGTATTAAAATTTTGTTTTTGATGTAAAATTTGCTGTTGTTAGCATCCTGAATCAAAAAGTTATGACTTGAGTGATAGTTTCACATTCATTTTCAGGAAGAATACATTGTAATATTATTATGAAGGAAGTTAGAAGTTTGTGACATTTTATTTACTGTATTACAAAAAATCACTGTAAAGACATGTGGTTCTTTATTTATAGTCATT";
const ACC = RAW_SEQ.indexOf("ATGTGGTTCTTTATTTATAGTCA");
const VAR = ACC + 20;
const DON = RAW_SEQ.indexOf("AAGGTAAGT");
const VAR_POS = 31181710;
const START = VAR_POS - VAR;

/** Reference sequence (230 nt) around the variant; reference base at E+1 is G. */
export const D = {
  SEQ: RAW_SEQ.slice(0, VAR) + "G" + RAW_SEQ.slice(VAR + 1),
  ACC,
  VAR,
  DON,
  VAR_POS,
  start: START,
  end: START + RAW_SEQ.length - 1,
  /** Distance (nt) from each branch A to the acceptor AG. */
  BP_DIST: [25, 31, 41, 49],
};

export const EXONS: Array<[number, number]> = [
  [31181422, 31181489],
  [31181710, 31181785],
];
const MOTIFS: Record<number, string> = { 31181786: "G", 31181787: "T", 31181788: "A", 31181789: "A", 31181790: "G", 31181791: "T", 31181420: "A", 31181421: "G" };

/** Bases outside the 230 bp region: deterministic per genomic position, intron/exon-like composition. */
export function mockBase(g: number): string {
  if (MOTIFS[g]) return MOTIFS[g];
  let h = g | 0;
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  const r = ((h >>> 0) % 1000) / 1000;
  const [[a6, b6], [a7, b7]] = EXONS;
  const exon = (g >= a6 && g <= b6) || (g >= a7 && g <= b7);
  if (!exon && g >= a6 - 22 && g < a6 - 2) return r < 0.45 ? "T" : r < 0.8 ? "C" : r < 0.9 ? "A" : "G";
  const cum = exon ? [0.26, 0.5, 0.76] : [0.3, 0.5, 0.7];
  return r < cum[0] ? "A" : r < cum[1] ? "C" : r < cum[2] ? "G" : "T";
}

export const baseAt = (i: number): string => (i >= 0 && i < D.SEQ.length ? D.SEQ[i] : mockBase(D.start + i));
export const fmt = (n: number): string => n.toLocaleString("en-AU");
export const coord = (i: number): string => "17:" + fmt(D.start + i);
/** Region index of an acceptor-relative position (p = -20 … -1, 0 = E+1). */
export const idxOf = (p: number): number => D.ACC + 20 + p;
/** First position of the 5-mer branchpoint window (branch A at position 4). */
export const bpWin = (d: number): number => -d - 3;
export const bpIndexOf = (i: number): number =>
  D.BP_DIST.findIndex((d) => {
    const s = idxOf(bpWin(d));
    return i >= s && i < s + 5;
  });

export function relLabel(i: number): string {
  const g = D.start + i;
  const [[a6, b6], [a7, b7]] = EXONS;
  if (g >= a6 && g <= b6) return "E-" + (b6 - g + 1);
  if (g >= a7 && g <= b7) return "E+" + (g - a7 + 1);
  if (g > b6 && g < a7) return g < (b6 + a7) / 2 ? "+" + (g - b6) : "-" + (a7 - g);
  return g < a6 ? "-" + (a6 - g) : "+" + (g - b7);
}

export type RegionKind = "var" | "donor" | "acc" | "bp" | null;
export function regionOf(i: number, vIdx: number): { k: RegionKind; n?: number } {
  if (i === vIdx) return { k: "var" };
  if (i >= D.DON && i < D.DON + 9) return { k: "donor" };
  if (i >= D.ACC && i < D.ACC + 23) return { k: "acc" };
  const b = bpIndexOf(i);
  if (b >= 0) return { k: "bp", n: b };
  return { k: null };
}

/* ---------------- Variant parsing ---------------- */

export type ParseResult = { ok: true; key: string; indel: boolean } | { ok: false };

/** Accepts gnomAD ID, gnomAD API, HGVS genomic and HGVS transcript; normalises to a gnomAD ID. */
export function parseVariant(input: string): ParseResult {
  const q = String(input).trim();
  const c = "([1-9]|1\\d|2[0-2]|X|Y|MT?)";
  const N = "([ACGT]+)";
  const pre = "^(?:chr)?" + c;
  const key = (ch: string, pos: number | string, ref: string, alt: string): ParseResult => ({
    ok: true,
    key: String(ch).toUpperCase() + "-" + pos + "-" + ref.toUpperCase() + "-" + alt.toUpperCase(),
    indel: ref.length !== alt.length,
  });
  const pats = [
    new RegExp(pre + "-(\\d+)-" + N + "-" + N + "$", "i"),
    new RegExp(pre + ":(\\d+):" + N + ":" + N + "$", "i"),
    new RegExp(pre + ":(\\d+):g\\." + N + ">" + N + "$", "i"),
    new RegExp(pre + ":g\\.(\\d+)" + N + ">" + N + "$", "i"),
    new RegExp(pre + ":(\\d+)" + N + ">" + N + "$", "i"),
  ];
  for (const r of pats) {
    const m = q.match(r);
    if (m) return key(m[1], m[2], m[3], m[4]);
  }
  // HGVS transcript on NM_001042492.3: c.655 is the first base of the exon shown (chr17:31,181,710).
  const t = q.match(
    /^N[MR]_\d+(?:\.\d+)?(?:\([A-Za-z0-9-]+\))?:c\.(\d+)([+-]\d+)?(?:([ACGT])>([ACGT])|_\d+(?:[+-]\d+)?ins([ACGT]+)|(?:_\d+(?:[+-]\d+)?)?(?:del[ACGT]*|dup[ACGT]*|delins[ACGT]+))$/i,
  );
  if (t) {
    const pos = D.VAR_POS + (+t[1] - 655) + (t[2] ? +t[2] : 0);
    if (t[3]) return key("17", pos, t[3], t[4]);
    const refB = D.SEQ[D.VAR + (pos - D.VAR_POS)] || "N";
    if (t[5]) return key("17", pos, refB, refB + t[5]);
    return { ok: true, key: "17-" + pos + "-other", indel: true };
  }
  return { ok: false };
}

export function csqLetter(csq: string): string {
  const c = csq.toLowerCase();
  if (c.includes("missense")) return "M";
  if (c.includes("frameshift")) return "FR";
  if (c.includes("stop_gained") || c.includes("nonsense")) return "N";
  if (c.includes("inframe_deletion")) return "PI";
  if (c.includes("inframe_insertion")) return "PR";
  if (c.includes("splice_donor") || c.includes("splice_acceptor")) return "S";
  if (c.includes("splice_region") || c.includes("polypyrimidine")) return "SR";
  return "?";
}

/* ---------------- Spliceogenicity & outcomes ---------------- */

export const scoreFor = (view: SavvyMode) =>
  view === "low" ? { score: 23.4, lo: 15.2, hi: 33.0, n: 64 } : { score: 96.8, lo: 90.1, hi: 100, n: 157 };
export const ciText = (s: { lo: number; hi: number }) => s.lo.toFixed(1) + " – " + (s.hi === 100 ? "100" : s.hi.toFixed(1)) + "%";

export type EventKind = "skip" | "trunc" | "ext" | "ir";
export interface SplicingEvent {
  kind: EventKind;
  title: string;
  /** CSS custom property defined in SavvyMode.module.css. */
  color: string;
  desc: string;
}
export const EVENTS: SplicingEvent[] = [
  { kind: "skip", title: "Exon skipping", color: "var(--sav-event-skipping)", desc: "The whole exon is left out of the mature transcript." },
  { kind: "trunc", title: "Exon truncation", color: "var(--sav-event-truncation)", desc: "A cryptic splice site inside the exon is used, shortening the exon." },
  { kind: "ext", title: "Exon extension", color: "var(--sav-event-extension)", desc: "A cryptic splice site in the intron is used, lengthening the exon." },
  { kind: "ir", title: "Intron retention", color: "var(--sav-event-retention)", desc: "The intron is not removed and stays in the transcript." },
];
export const eventPcts = (view: SavvyMode) => (view === "low" ? [22, 9, 5, 6] : [61, 17, 10, 17]);

/* ---------------- Splicing requirement checks ---------------- */

export interface CheckRow {
  metric: string;
  req: string;
  ref: string;
  alt: string;
  failed: boolean;
}
export function checksFor(view: SavvyMode): CheckRow[] {
  const bpRow = D.BP_DIST.slice().sort((a, b) => b - a).join(", ");
  const rows: Array<[string, string, string, string, string]> = [
    ["5′SS MaxEntScan", "≥1.45", "11", "11", "11"],
    ["3′SS MaxEntScan", "≥1.38", "8.27", "6.16", "0.32"],
    ["Total MaxEntScan", "≥7.41", "19.27", "17.16", "11.32"],
    ["Number of Ts and Cs", "≥9", "12", "12", "12"],
    ["Additional AG", "=0", "0", "0", "0"],
    ["Intron length", "≥80", "220", "220", "220"],
    ["Branchpoint to AG", "≥17", bpRow, bpRow, bpRow],
  ];
  const altNo: Record<number, string> = { 1: "8.44", 2: "19.44" };
  return rows.map((r, k) => ({
    metric: r[0],
    req: r[1],
    ref: r[2],
    alt: view === "failed" ? r[4] : view === "noevents" && altNo[k] ? altNo[k] : r[3],
    failed: view === "failed" && k === 1,
  }));
}

/* ---------------- In silico predictions ---------------- */

export type PredictorKey = "spliceai" | "pangolin" | "introme" | "alphagenome";
export interface SignalBand {
  min: number;
  label: string;
  color: "green" | "orange";
}
export interface Predictor {
  name: string;
  url: string;
  ver: string;
  tip: string;
  bands: SignalBand[];
  tick: number | null;
  support: { by: "delta" | "score"; min: number };
}
const SPLICE_BANDS: SignalBand[] = [
  { min: 0.5, label: "Strong (Δ ≥ 0.5)", color: "green" },
  { min: 0.2, label: "Moderate (Δ 0.2 to 0.5)", color: "orange" },
];
export const PRED: Record<PredictorKey, Predictor> = {
  spliceai: { name: "SpliceAI", url: "https://github.com/Illumina/SpliceAI", ver: "Illumina, version to confirm", tip: "spliceai", bands: SPLICE_BANDS, tick: 0.2, support: { by: "delta", min: 0.2 } },
  pangolin: { name: "Pangolin", url: "https://github.com/tkzeng/Pangolin", ver: "Version to confirm", tip: "pangolin", bands: SPLICE_BANDS, tick: 0.2, support: { by: "delta", min: 0.2 } },
  introme: { name: "Introme", url: "https://github.com/CCICB/introme", ver: "CCI, Sullivan et al. 2023", tip: "introme", bands: [], tick: null, support: { by: "score", min: 0.5 } },
  alphagenome: { name: "AlphaGenome AVI", url: "https://github.com/google-deepmind/alphagenome", ver: "AlphaGenome Atlas", tip: "alphagenome-avi", bands: [], tick: null, support: { by: "score", min: 0.5 } },
};

export const TIPS: Record<string, [string, string]> = {
  disagree: ["", "In silico predictors and SAVvy disagree for this variant. It needs manual review before classifying."],
  spliceai: ["SpliceAI", "Deep-learning model that predicts how likely each nearby position is to be used as a splice acceptor or donor, with and without the variant. Jaganathan et al., Cell 2019."],
  pangolin: ["Pangolin", "Deep-learning splice predictor trained on RNA sequencing from several tissues and species. Reports splice gain and loss without separating acceptor and donor. Zeng and Li, Genome Biology 2022."],
  introme: ["Introme", "Machine-learning model from Children's Cancer Institute that combines several splice predictors and splicing rules into one score. Sullivan et al., Genome Biology 2023."],
  "alphagenome-avi": ["AlphaGenome AVI", "AlphaGenome Variant Impact score. Summarises the predicted effect of the variant across molecular processes such as splicing and gene expression. Precomputed for SNVs on GRCh38."],
  "predicted-change": ["Predicted change", "Type of change at that position: acceptor or donor site, gained (a new site is created) or lost (an existing site is weakened)."],
  delta: ["Δ score", "Difference between the ALT and REF scores at that position, from 0 to 1. A higher value means a bigger predicted change."],
  position: ["Position", "Distance from the variant in base pairs. Negative values are upstream (5′), positive values are downstream (3′)."],
  "ref-score": ["REF score", "Predicted probability that this position is used as a splice site in the reference sequence."],
  "alt-score": ["ALT score", "Predicted probability that this position is used as a splice site when the variant is present."],
  signal: ["Signal", "Strength of the prediction using published SpliceAI cut-offs: Strong at Δ 0.5 or above, Moderate at Δ 0.2 to 0.5. Changes below 0.2 are not listed."],
  "overall-score": ["Score", "Predictor output from 0 to 1. A higher value means a larger predicted impact."],
  threshold: ["Threshold", "Score at or above which the predictor considers the variant to have an impact."],
  "main-driver": ["Main driver", "Molecular process that contributes most to the score, where the predictor reports it."],
  "in-silico": ["In silico predictions", "Independent computational predictions shown alongside SAVvy. They are not used to calculate spliceogenicity."],
  lane: ["Predicted splice-site changes", "Bars show where each predictor expects a splice site to be created (up) or lost (down). Bar height is the Δ score, from 0 to 1."],
  outcomes: ["Predicted splicing outcomes", "How often each splicing event was observed among splice-altering variants in this SAVvy category."],
  hgvs: ["HGVS", "Variant described on the MANE Select transcript using HGVS nomenclature."],
  transcript: ["Transcript", "MANE Select is the single representative transcript for this gene agreed by NCBI and Ensembl."],
  region: ["Region coordinates", "Genomic region shown in the sequence view, on GRCh38."],
  branchpoint: ["What is a branchpoint?", "An adenosine (A) in the intron, usually 18 to 40 nt upstream of the acceptor site, that anchors the lariat during splicing. A sequence can have several candidates; use the arrows to step through them."],
};

export interface SiteChange {
  p: "spliceai" | "pangolin";
  change: string;
  changeSub: string;
  type: "gain" | "loss";
  /** Position relative to E+1. */
  site: number;
  d: number;
  ref: number | null;
  alt: number | null;
  /** Outside the 230 bp region shown. */
  out?: boolean;
  laneLabel?: string;
}
export interface InSilico {
  sites: SiteChange[];
  saiMax?: number;
  table?: string;
  lane?: string;
  tenK: { title: string; tile: number } | null;
  avi?: string;
  noVerdict?: boolean;
}

export function inSilicoFor(view: SavvyMode): InSilico {
  if (view === "passed")
    return {
      sites: [
        { p: "spliceai", change: "Acceptor loss", changeSub: "Existing acceptor weakened", type: "loss", site: 0, d: 0.37, ref: 0.99, alt: 0.62 },
        { p: "spliceai", change: "Donor loss", changeSub: "Exon 7 donor weakened", type: "loss", site: 75, d: 0.21, ref: 1.0, alt: 0.79, out: true, laneLabel: "Exon 7 donor loss" },
        { p: "pangolin", change: "Splice loss", changeSub: "Acceptor and donor combined", type: "loss", site: 0, d: 0.28, ref: 0.92, alt: 0.63 },
        { p: "pangolin", change: "Splice loss", changeSub: "Acceptor and donor combined", type: "loss", site: 75, d: 0.25, ref: 0.9, alt: 0.65, out: true, laneLabel: "Exon 7 donor loss" },
      ],
      tenK: { title: "SpliceAI-10k predicts exon 7 skipping (76 nt, frameshift, premature stop codon)", tile: 0 },
    };
  if (view === "low")
    return {
      sites: [],
      saiMax: 0.01,
      table: "No predicted changes with Δ ≥ 0.2. Highest Δ: SpliceAI acceptor gain 0.01 (−24 bp), Pangolin splice gain 0.00.",
      lane: "No splice-site changes with Δ ≥ 0.2 for this variant. Highest Δ: SpliceAI 0.01, Pangolin 0.00.",
      tenK: null,
    };
  if (view === "indel")
    return {
      sites: [],
      saiMax: 0.01,
      table: "No predicted changes with Δ ≥ 0.2. Highest Δ: SpliceAI acceptor gain 0.01 (0 bp), Pangolin splice gain 0.03 (+75 bp).",
      lane: "No splice-site changes with Δ ≥ 0.2 for this variant. Highest Δ: SpliceAI 0.01, Pangolin 0.03.",
      tenK: null,
    };
  if (view === "failed")
    return {
      sites: [
        { p: "spliceai", change: "Acceptor loss", changeSub: "Existing acceptor weakened", type: "loss", site: 0, d: 0.99, ref: null, alt: null },
        { p: "spliceai", change: "Donor loss", changeSub: "Exon 7 donor weakened", type: "loss", site: 75, d: 0.66, ref: null, alt: null, out: true, laneLabel: "Exon 7 donor loss" },
        { p: "pangolin", change: "Splice loss", changeSub: "Acceptor and donor combined", type: "loss", site: 0, d: 0.88, ref: null, alt: null },
      ],
      tenK: { title: "SpliceAI-10k predicts exon 7 skipping (76 nt, frameshift)", tile: 0 },
      avi: "32.23 (top 0.1% of all SNVs)",
    };
  return {
    sites: [],
    saiMax: 0.0,
    noVerdict: true,
    avi: "15.49 (top 2.8% of all SNVs)",
    table: "No predicted changes with Δ ≥ 0.2. Highest Δ: Pangolin splice loss 0.01 (+85 bp), SpliceAI 0.00.",
    lane: "No splice-site changes with Δ ≥ 0.2 for this variant. Highest Δ: SpliceAI 0.00, Pangolin 0.01.",
    tenK: null,
  };
}

export interface OverallScore {
  p: "introme" | "alphagenome";
  /** number, "tbc" (to confirm) or "na" (not available). */
  score: number | "tbc" | "na";
  show?: string;
  what: string;
  drv: string;
  cov: string;
}
export const overallFor = (view: SavvyMode, ins: InSilico): OverallScore[] => {
  const indel = view === "indel";
  return [
    { p: "introme", score: "tbc", what: "Likelihood that the variant alters splicing, combining several splice predictors", drv: "[To confirm]", cov: "[To confirm]" },
    { p: "alphagenome", score: indel ? "na" : "tbc", show: ins.avi, what: "Overall predicted impact across molecular processes", drv: indel ? "Not available" : "[To confirm]", cov: "SNVs on hg38 only" },
  ];
};

/* ---------------- Prediction settings ---------------- */

export interface PredictionSettings {
  tx: string;
  ann: "basic" | "comprehensive";
  dist: string;
  mask: "raw" | "masked";
}
/** Defaults; every new search returns to these. */
export const PS0: PredictionSettings = { tx: "ENST00000358273", ann: "basic", dist: "500", mask: "raw" };
