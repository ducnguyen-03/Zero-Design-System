/* Mock data, types and pure helpers for the ZeroDash "Fitting v2" screen (purity & ploidy fitting). */

export type PlotKey = "circos" | "raw" | "scores" | "clonality" | "somatic";
export type FitStatus = "queued" | "preparing" | "fitting" | "ready" | "failed" | "cancelled" | "noFit";
export type VariantType = "SNV" | "CNV" | "SV";
export type VariantResult = "calculating" | "ready" | "notFound" | "failed";
export type SubmissionStatus = "submitting" | "submitted" | "failed" | "unknown" | "checking" | "recovery";

export interface Constraints {
  minPurity?: number | null;
  maxPurity?: number | null;
  minPloidy?: number | null;
  maxPloidy?: number | null;
}

export interface Fit {
  id: string;
  name: string;
  status: FitStatus;
  purity?: number;
  ploidy?: number;
  constraints: Constraints;
  plots: PlotKey[];
  variantValues: Record<string, string>;
  nextAt?: number | null;
  fail?: boolean;
  coldStart?: boolean;
}

export interface Variant {
  id: string;
  label: string;
  type: VariantType;
  build: string;
  chromosome: string;
  position: string;
  ref?: string;
  alt?: string;
  end?: string;
  partnerChromosome?: string;
  partnerPosition?: string;
  location: string;
  classification: string;
  resultStatus?: VariantResult;
  nextAt?: number | null;
  resultOutcome?: VariantResult;
}

export interface Submission {
  fitId: string;
  rationale: string;
  status: SubmissionStatus;
  requestId: string;
  fail?: boolean;
  nextAt?: number;
  checkAt?: number;
}

export type ModalState =
  | { kind: "new" }
  | { kind: "zoom"; k: PlotKey; id: string }
  | { kind: "review"; id: string }
  | { kind: "impact" }
  | { kind: "recovery" }
  | null;

export interface VariantDraft {
  type: VariantType;
  build: string;
  label?: string;
  chromosome?: string;
  position?: string;
  ref?: string;
  alt?: string;
  end?: string;
  partnerChromosome?: string;
  partnerPosition?: string;
}

export interface NewFitForm {
  name: string;
  minPurity: string;
  maxPurity: string;
  minPloidy: string;
  maxPloidy: string;
}

export type ImpactKey = "profile" | "curation" | "comments" | "reports";

export interface FittingState {
  closed: boolean;
  warm: boolean;
  fits: Fit[];
  variants: Variant[];
  currentFitId: string;
  leftFitId: string;
  rightFitId: string;
  visiblePlots: PlotKey[];
  submission: Submission | null;
  seq: number;
  stale: boolean;
  externalClosed: boolean;
  /** `failed` shows the error panel; `loading` shows the DNA loader. */
  loadState: "failed" | "loading" | null;
  loadNextAt: number | null;
  previewState: PreviewStateId | null;
  applyAllowed: boolean;
  reviewRequired: boolean;
  impact: Partial<Record<ImpactKey, boolean>>;
  modal: ModalState;
  form: NewFitForm;
  errs: Partial<Record<keyof NewFitForm, string>>;
  formErr: string;
  rationale: string;
  trackOpen: boolean;
  draft: VariantDraft;
  trackErr: string;
}

export const PLOTS: Record<PlotKey, string> = {
  circos: "Circos",
  raw: "Raw-data Circos",
  scores: "Purity–ploidy scores",
  clonality: "Clonality model",
  somatic: "Somatic variant ploidy",
};
export const ALL_PLOTS = Object.keys(PLOTS) as PlotKey[];

const ASSET = "/assets/zerodash/";
export function plotSrc(k: PlotKey, fit: Fit): string {
  const def = fit.id === "FIT-001";
  switch (k) {
    case "circos":
      return ASSET + "plot-circos.png";
    case "raw":
      return ASSET + "plot-raw.png";
    default:
      return ASSET + `plot-${k}-${def ? "default" : "refit"}.png`;
  }
}

export const BASE_VARIANTS: Variant[] = [
  { id: "v1", label: "KIAA1549::BRAF | DUP", type: "SV", build: "GRCh38", chromosome: "7", position: "138863333", partnerChromosome: "7", partnerPosition: "140790234", location: "chr7:138863333–140790234", classification: "C5 · Pathogenic" },
  { id: "v2", label: "BRAF::INTERGENIC | DISRUPTION", type: "SV", build: "GRCh38", chromosome: "7", position: "140790234", partnerChromosome: "7", partnerPosition: "138863333", location: "chr7:140790234–138863333", classification: "C5 · Pathogenic" },
  { id: "v3", label: "KIAA1549::INTERGENIC | DISRUPTION", type: "SV", build: "GRCh38", chromosome: "7", position: "138863333", partnerChromosome: "7", partnerPosition: "140790234", location: "chr7:138863333–140790234", classification: "C3 · VOUS" },
  { id: "v4", label: "BRAF", type: "CNV", build: "GRCh38", chromosome: "7", position: "140719327", end: "140924929", location: "chr7:140719327–140924929 (chr7 q34)", classification: "C5 · Pathogenic" },
];

export const BASE_FITS: Fit[] = [
  { id: "FIT-001", name: "Pipeline default", status: "ready", purity: 16, ploidy: 2, constraints: {}, plots: ALL_PLOTS, variantValues: { v1: "4.82", v2: "4.82", v3: "4.82", v4: "2.04–6.77" } },
  { id: "FIT-002", name: "Purity 46% refit", status: "ready", purity: 46, ploidy: 2, constraints: { minPurity: 40, maxPurity: 55, minPloidy: 1.8, maxPloidy: 2.2 }, plots: ALL_PLOTS, variantValues: { v1: "2.13", v2: "2.13", v3: "2.13", v4: "2.02–3.87" } },
  { id: "FIT-003", name: "Purity 93% refit", status: "ready", purity: 93, ploidy: 2, constraints: { minPurity: 87, maxPurity: 100, minPloidy: 1.8, maxPloidy: 2.2 }, plots: ["circos", "raw", "scores", "clonality"], variantValues: { v1: "0.83", v2: "0.83", v3: "0.83", v4: "2.01–2.82" } },
];

export const ACTIVE: FitStatus[] = ["queued", "preparing", "fitting"];
export const EMPTY_CMP_DESC =
  "Use New fit to explore another purity–ploidy solution. The first fit usually takes about 8 minutes while the data is prepared; further fits about 1 minute.";
export const STATUS_LABEL: Record<FitStatus, string> = {
  queued: "Queued",
  preparing: "Preparing inputs",
  fitting: "Fitting",
  ready: "Ready",
  failed: "Failed",
  cancelled: "Cancelled",
  noFit: "No valid fit",
};

export type PreviewStateId =
  | "fresh" | "explored" | "returning"
  | "queued" | "fitting" | "failed" | "noFit"
  | "applying" | "applyFailed" | "unknownApply" | "applied"
  | "notFound" | "variantFailed"
  | "loadFailed" | "missingPlot" | "stale" | "closed";

export const PREVIEW_GROUPS: Array<{ title: string; items: Array<[PreviewStateId, string]> }> = [
  { title: "Start & return", items: [["fresh", "First visit"], ["explored", "Ready to compare"], ["returning", "Return to running fit"]] },
  { title: "Generate fit", items: [["queued", "Queued"], ["fitting", "Running"], ["failed", "Run failed"], ["noFit", "No valid fit"]] },
  { title: "Apply fit", items: [["applying", "Applying"], ["applyFailed", "Application failed"], ["unknownApply", "Connection interrupted"], ["applied", "Applied"]] },
  { title: "Track variant", items: [["notFound", "Variant not found"], ["variantFailed", "Calculation failed"]] },
  { title: "Case & outputs", items: [["loadFailed", "Outputs unavailable"], ["missingPlot", "Missing plot"], ["stale", "Case changed"], ["closed", "Case closed"]] },
];
export const previewLabel = (id: PreviewStateId | null) =>
  id ? PREVIEW_GROUPS.flatMap((g) => g.items).find((x) => x[0] === id)?.[1] ?? "" : "";

export const IMPACT: Array<[ImpactKey, string, string]> = [
  ["profile", "Tumour profile and fit outputs", "Review the updated purity, ploidy and outputs."],
  ["curation", "Variant curation and classifications", "Check whether previous decisions need review against the new fit."],
  ["comments", "Comments and interpretation", "Check whether existing text still describes the current results."],
  ["reports", "Reports and exports", "Check whether documents based on the previous fit need revision."],
];
/** Prototype default: first two items checked. */
export const IMPACT_DEFAULT: Partial<Record<ImpactKey, boolean>> = { profile: true, curation: true };

const clone = <T,>(o: T): T => JSON.parse(JSON.stringify(o)) as T;

export const num = (v: number | undefined) =>
  v == null ? "" : Number.isInteger(v) ? v.toFixed(2) : String(Math.round(v * 100) / 100);

const consChip = (label: string, a: number | null | undefined, b: number | null | undefined, s: string) =>
  a == null && b == null ? `${label} Unconstrained` : a == null ? `${label} ≤ ${b}${s}` : b == null ? `${label} ≥ ${a}${s}` : `${label} ${a}–${b}${s}`;
export const consChips = (f: Fit) => [
  consChip("Purity", f.constraints.minPurity, f.constraints.maxPurity, "%"),
  consChip("Ploidy", f.constraints.minPloidy, f.constraints.maxPloidy, ""),
];

const chr = (v: string | undefined) => String(v ?? "").trim().replace(/^chr/i, "").toUpperCase();
const ident = (v: Variant | VariantDraft) =>
  [
    v.type, v.build, chr(v.chromosome), Number(v.position),
    ...(v.type === "SNV"
      ? [String(v.ref).toUpperCase(), String(v.alt).toUpperCase()]
      : v.type === "CNV"
        ? [Number(v.end)]
        : [chr(v.partnerChromosome), Number(v.partnerPosition)]),
  ].join(":");

const CONSTRAINT_KEYS = ["minPurity", "maxPurity", "minPloidy", "maxPloidy"] as const;

export function validateConstraints(input: NewFitForm) {
  const errors: Partial<Record<keyof NewFitForm, string>> = {};
  const c: Record<(typeof CONSTRAINT_KEYS)[number], number | null> = { minPurity: null, maxPurity: null, minPloidy: null, maxPloidy: null };
  for (const k of CONSTRAINT_KEYS) {
    const raw = input[k];
    const v = raw == null || String(raw).trim() === "" ? null : Number(raw);
    c[k] = v;
    const purity = k.includes("Purity");
    if (v !== null && (!Number.isFinite(v) || (purity ? v < 0 || v > 100 : v <= 0)))
      errors[k] = purity ? "Enter a number from 0 to 100." : "Enter a number greater than 0.";
  }
  if (c.minPurity !== null && c.maxPurity !== null && c.minPurity > c.maxPurity) errors.maxPurity = "Maximum must be at least the minimum.";
  if (c.minPloidy !== null && c.maxPloidy !== null && c.minPloidy > c.maxPloidy) errors.maxPloidy = "Maximum must be at least the minimum.";
  return { valid: Object.keys(errors).length === 0, errors, constraints: c as Constraints };
}

export function validateVariant(v: VariantDraft, rows: Variant[]): string {
  const int = (n: string | undefined) => Number.isSafeInteger(Number(n)) && Number(n) > 0;
  const chrom = (c: string | undefined) => /^(?:[1-9]|1\d|2[0-2]|X|Y|MT)$/.test(chr(c));
  if (!chrom(v.chromosome) || !int(v.position)) return "Enter a chromosome (1–22, X, Y or MT) and a positive whole-number position.";
  if (v.type === "SNV" && (!/^[ACGT]+$/i.test(v.ref || "") || !/^[ACGT]+$/i.test(v.alt || "") || String(v.ref).toUpperCase() === String(v.alt).toUpperCase()))
    return "Enter different reference and alternate alleles using A, C, G or T.";
  if (v.type === "CNV" && (!int(v.end) || Number(v.end) < Number(v.position))) return "End position must be a whole number at or after the start.";
  if (v.type === "SV" && (!chrom(v.partnerChromosome) || !int(v.partnerPosition))) return "Enter a valid partner chromosome and position.";
  if (rows.some((r) => ident(r) === ident(v))) return "This variant is already tracked for this reference build.";
  return "";
}

export const EMPTY_FORM: NewFitForm = { name: "", minPurity: "", maxPurity: "", minPloidy: "", maxPloidy: "" };

export function initialState(scn: "fresh" | "explored" | "closed"): FittingState {
  return {
    closed: scn === "closed",
    warm: scn !== "fresh",
    fits: clone(scn === "fresh" ? BASE_FITS.slice(0, 1) : BASE_FITS),
    variants: clone(BASE_VARIANTS),
    currentFitId: "FIT-001",
    leftFitId: "FIT-001",
    rightFitId: scn === "fresh" ? "" : "FIT-003",
    visiblePlots: ["circos", "raw", "scores", "clonality"],
    submission: null,
    seq: 4,
    stale: false,
    externalClosed: false,
    loadState: null,
    loadNextAt: null,
    previewState: null,
    applyAllowed: true,
    reviewRequired: false,
    impact: {},
    modal: null,
    form: { ...EMPTY_FORM },
    errs: {},
    formErr: "",
    rationale: "",
    trackOpen: false,
    draft: { type: "SNV", build: "GRCh38" },
    trackErr: "",
  };
}

/** Builds the demo state for a "Prototype controls" preview state (design `openPreview`). */
export function previewState(id: PreviewStateId): FittingState {
  const freshIds: PreviewStateId[] = ["fresh", "returning", "queued", "fitting", "failed", "noFit"];
  const fresh = freshIds.includes(id);
  const N = initialState(fresh ? "fresh" : id === "closed" ? "closed" : "explored");
  N.previewState = id;
  if (fresh && id !== "fresh") {
    N.seq = 5;
    N.fits.push({
      id: "FIT-004", name: "Diploid exploration",
      status: id === "returning" ? "preparing" : (id as FitStatus),
      coldStart: true,
      constraints: { minPurity: 40, maxPurity: 60, minPloidy: 1.8, maxPloidy: 2.2 },
      plots: [], variantValues: {},
    });
  }
  if (id === "applying" || id === "applyFailed" || id === "applied" || id === "unknownApply") {
    N.rightFitId = "FIT-002";
    N.submission = { fitId: "FIT-002", rationale: "Reviewed plots and tracked variants.", status: "submitting", requestId: "APP-06-0397-004" };
    if (id === "applyFailed") N.submission.status = "failed";
    if (id === "applied") {
      N.submission.status = "submitted";
      N.currentFitId = "FIT-002";
      N.leftFitId = "FIT-002";
      N.rightFitId = "FIT-001";
      N.reviewRequired = true;
      N.impact = { ...IMPACT_DEFAULT };
    }
    if (id === "unknownApply") N.submission.status = "unknown";
  }
  if (id === "notFound" || id === "variantFailed")
    N.variants.push({ id: "preview-variant", label: "BRAF additional variant", type: "SNV", build: "GRCh38", chromosome: "7", position: "140753400", ref: "G", alt: "A", location: "chr7:140753400 G > A", classification: "Unclassified", resultStatus: id === "variantFailed" ? "failed" : "notFound" });
  if (id === "loadFailed") N.loadState = "failed";
  if (id === "missingPlot") {
    N.rightFitId = "FIT-003";
    N.visiblePlots = ["somatic"];
  }
  if (id === "stale") N.stale = true;
  return N;
}
