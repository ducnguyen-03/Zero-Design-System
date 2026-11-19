/* Insights access model — from the Claude Design "Insights Onboarding" prototype. Example values for layout only. */
import type { AccessCapability, AccessTier } from "../components/Insights/AccessTiers";
import type { DatasetBreakdown } from "../components/Insights/DatasetAccess";
import type { DataRequest } from "../components/Insights/RequestHistory";

export const ACCESS_CAPABILITIES: AccessCapability[] = [
  { id: "aggregate", label: "Aggregate counts", description: "Whole-DB summary stats, small cells suppressed i.e. counts <5 not shown" },
  { id: "participant", label: "Participant-level non-molecular", description: "Clinical, demographic, sample metadata, de-identified" },
  { id: "curated", label: "Curated variants", description: "Curated, classified, signed-off by curators" },
  { id: "variants", label: "All variants, incl. VUS", description: "Includes variants of unknown significance" },
  { id: "linkage", label: "Linkage & internal identifiers", description: "PDX to participant or variant to PT with internal IDs" },
];

/** The account page also lists raw files, which no tier opens without a request. */
export const ACCOUNT_CAPABILITIES: AccessCapability[] = [
  ...ACCESS_CAPABILITIES,
  { id: "raw", label: "Raw files", description: "BAM/FASTQ/VCF — can only be accessed through a data access request" },
];

const facts = (state: string, scope: string, molecular: string) => [
  { label: "Data publication state", value: state },
  { label: "Study scope", value: scope },
  { label: "Molecular data default", value: molecular },
];

/** The four tiers, seen by a T1 (Registered) researcher. */
export const ACCESS_TIERS: AccessTier[] = [
  {
    id: "t0",
    code: "T0",
    name: "Browse",
    qualifier: ["No login", "landing page"],
    audience: "Anyone, no login. Landing page only.",
    state: "below",
    grants: { aggregate: true },
    facts: facts("Published + unpublished, counts only", "All (counts)", "—"),
  },
  {
    id: "t1",
    code: "T1",
    name: "Registered",
    qualifier: ["Free account", "terms accepted"],
    audience: "Verified researcher, terms accepted",
    state: "current",
    grants: { aggregate: true, participant: true, curated: true },
    facts: facts("Published only", "All", "Reportables, no toggle"),
  },
  {
    id: "t2",
    code: "T2",
    name: "Collaborator",
    qualifier: ["Executed", "agreement"],
    audience: "Institution with executed agreement",
    state: "next",
    grants: { aggregate: true, participant: true, curated: true, variants: "Within scope" },
    facts: facts("Published, plus your unpublished data", "Named studies only", "Reportables, All variants toggle within scope"),
  },
  {
    id: "t3",
    code: "T3",
    name: "Internal",
    qualifier: ["CCI staff", "approved projects"],
    audience: "CCI staff, curators and researchers on ZERO-approved projects",
    state: "internal",
    grants: { aggregate: true, participant: true, curated: true, variants: true, linkage: true },
    facts: facts("Published + unpublished", "All", "Reportables, All variants toggle to all"),
  },
];

export const ACCESS_NOTES = [
  { holds: true, text: "De-identified data only" },
  { holds: true, text: "Small cells (counts <5) suppressed" },
  { holds: false, text: "Raw files (BAM/FASTQ/VCF) by data access request only" },
];

export const DATASET_ACCESS = {
  available: 14_099,
  total: 18_641,
  participants: { available: 3_184, total: 4_500 },
  samples: { available: 10_703, total: 13_900 },
  pdx: { available: 212, total: 241 },
};

export const PARTICIPANT_BREAKDOWNS: DatasetBreakdown[] = [
  { value: "sex", label: "Sex", rows: [{ label: "female", value: 807 }, { label: "male", value: 812 }, { label: "other", value: 785 }, { label: "unknown", value: 780 }] },
  { value: "age", label: "Age at diagnosis", rows: [{ label: "0–2", value: 612 }, { label: "3–5", value: 704 }, { label: "6–12", value: 1_103 }, { label: "13–19", value: 765 }] },
];
export const SAMPLE_BREAKDOWNS: DatasetBreakdown[] = [
  { value: "tissue", label: "Tissue type", rows: [{ label: "Tumour", value: 8_161 }, { label: "Normal", value: 2_384 }, { label: "Liquid biopsy", value: 158 }] },
  { value: "assay", label: "Assay", rows: [{ label: "WGS", value: 3_322 }, { label: "RNAseq", value: 2_781 }, { label: "Methylation", value: 3_230 }] },
];
export const PDX_BREAKDOWNS: DatasetBreakdown[] = [
  { value: "strain", label: "Mice strain", rows: [{ label: "NSG", value: 211 }, { label: "MISTRG", value: 1 }] },
];

export const DATA_REQUESTS: DataRequest[] = [
  {
    id: "DRS01",
    purpose:
      "Genomic and clinical data for paediatric neuroblastoma patients who have a TP53 somatic mutation, including whole-genome sequencing data and associated de-identified clinical outcomes from the ZERO Childhood Cancer program.",
    scope: "T2 · Collaborator",
    submitted: "11/12/2026",
    expires: "11/12/2028",
    status: "under-review",
  },
  {
    id: "DRS02",
    purpose: "I would like to request genomic information related to neuroblastoma patients.",
    scope: "T2 · Collaborator",
    submitted: "11/12/2025",
    expires: "11/12/2026",
    status: "expired",
  },
  {
    id: "DRS03",
    purpose: "Can you provide genomic data for patients diagnosed with neuroblastoma?",
    scope: "T2 · Collaborator",
    submitted: "11/12/2024",
    expires: "11/12/2025",
    status: "expired",
  },
];

export const SAVED_QUERIES = [
  { title: "Please share the genomic data for neuroblastoma", time: "1h" },
  { title: "Could you provide the genomic information", time: "2h" },
  { title: "I would appreciate it if you could share", time: "1h" },
  { title: "Can you provide genomic data for patients", time: "1h" },
  { title: "I would like to request genomic information", time: "1w" },
  { title: "Please send over the genomic data", time: "2m" },
];
