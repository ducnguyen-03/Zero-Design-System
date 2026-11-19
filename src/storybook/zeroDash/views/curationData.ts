/* ZeroDash · Curation — mock data (design: Curation.dc.html). All values are synthetic. */

export type Sex = "M" | "F";
export type CurationStatus = "READY" | "IN PROGRESS" | "ON HOLD";
export type CuratorKey = "DL" | "TT" | "NN" | "DN" | "KD" | "MR" | "RS";
export type Curators = [CuratorKey | null, CuratorKey | null];

export interface HeadChip {
  label: string;
  tone: "neutral" | "danger";
  dna?: boolean;
}

export interface CaseEvent {
  name: string;
  status: CurationStatus;
  coll: string;
  cohort: string;
  pc: "P" | "C";
  dx: string;
  mb: string;
  pur: string;
  cur: Curators;
  exp: boolean;
  tags?: string[];
  hts?: boolean;
  chips?: HeadChip[];
}

export interface CasePatient {
  id: string;
  sex: Sex;
  alive: boolean;
  events: CaseEvent[];
}

type Palette = "orange" | "lilac" | "pink";

export const PEOPLE: Record<CuratorKey, [string, Palette]> = {
  DL: ["Dien Le", "orange"],
  TT: ["Thu Tran", "lilac"],
  NN: ["Ngoc Nguyen", "orange"],
  DN: ["Duc Nguyen", "pink"],
  KD: ["Kimberly Dias", "lilac"],
  MR: ["Megan Rumford", "pink"],
  RS: ["Ravi Singh", "orange"],
};
export const CURATOR_KEYS = Object.keys(PEOPLE) as CuratorKey[];

/** Avatar fill / border per palette (closest ramp tokens). */
export const PAL: Record<Palette, [string, string]> = {
  orange: ["var(--insight-color-orange-50)", "var(--insight-color-orange-100)"],
  lilac: ["var(--insight-color-purple-30)", "var(--insight-color-purple-50)"],
  pink: ["var(--insight-color-magenta-50)", "var(--insight-color-brand-logo-magenta)"],
};

const ALL = "Cohort 6: Acute lymphoblastic leukaemia (ALL)";
const HR = "Cohort 1: High-risk cancers";
const RMS = "Cohort 4: Rhabdomyosarcoma";

export const CASES: CasePatient[] = [
  { id: "zccsGajGDa5F", sex: "M", alive: true, events: [{ name: "Diagnosis 1", status: "READY", coll: "28/07/2025", cohort: "", pc: "P", dx: "", mb: "", pur: "", cur: ["DL", "TT"], exp: true }] },
  { id: "zccsnPjrbXgL", sex: "M", alive: true, events: [{ name: "Diagnosis 1", status: "READY", coll: "05/05/2025", cohort: "", pc: "P", dx: "", mb: "", pur: "", cur: [null, null], exp: true }] },
  { id: "01-0379", sex: "M", alive: true, events: [{ name: "Diagnosis 1", status: "IN PROGRESS", coll: "", cohort: ALL, pc: "C", dx: "", mb: "", pur: "", cur: ["NN", "TT"], exp: true }] },
  { id: "01-0396", sex: "M", alive: true, events: [{ name: "Diagnosis 1", status: "IN PROGRESS", coll: "", cohort: ALL, pc: "C", dx: "B-cell acute lymphoblastic leukaemia", mb: "2.09", pur: "0.59", cur: [null, "DL"], exp: true }] },
  {
    id: "06-0336", sex: "M", alive: true, events: [
      { name: "Relapse 1", status: "IN PROGRESS", coll: "14/03/2025", cohort: HR, pc: "C", dx: "Neuroblastoma", mb: "1.42", pur: "0.71", cur: ["NN", "TT"], exp: true, tags: ["TSO500"], hts: true,
        chips: [{ label: "No panel", tone: "neutral" }, { label: "CAT 2 DECLINED", tone: "danger", dna: true }] },
      { name: "Diagnosis 1", status: "READY", coll: "02/02/2021", cohort: HR, pc: "C", dx: "Neuroblastoma", mb: "0.88", pur: "0.64", cur: ["KD", null], exp: false },
    ],
  },
  { id: "06-0412", sex: "F", alive: true, events: [{ name: "Diagnosis 1", status: "ON HOLD", coll: "19/06/2025", cohort: RMS, pc: "P", dx: "Embryonal rhabdomyosarcoma", mb: "3.15", pur: "0.48", cur: ["MR", null], exp: true }] },
  { id: "zccsQm7RtVw2", sex: "F", alive: false, events: [{ name: "Diagnosis 1", status: "READY", coll: "11/08/2025", cohort: "", pc: "P", dx: "", mb: "", pur: "", cur: [null, null], exp: false, tags: ["Liquid Biopsy"] }] },
  {
    id: "01-0451", sex: "F", alive: true, events: [
      { name: "Relapse 1", status: "IN PROGRESS", coll: "03/09/2025", cohort: ALL, pc: "C", dx: "T-cell acute lymphoblastic leukaemia", mb: "1.07", pur: "0.82", cur: ["DN", "RS"], exp: true, hts: true },
      { name: "Diagnosis 1", status: "READY", coll: "", cohort: ALL, pc: "C", dx: "T-cell acute lymphoblastic leukaemia", mb: "0.94", pur: "0.77", cur: ["RS", null], exp: false },
    ],
  },
];

export const TOTAL_ROWS = 542;

/* ── List: filter menu, sort, columns ─────────────────────────────── */

export interface FilterItemDef {
  label: string;
  options?: string[];
  sex?: Sex;
}

export const FILTER_GROUPS: FilterItemDef[][] = [
  [
    { label: "Show all cases" },
    { label: "Expedited only" },
    { label: "Has HTS" },
    { label: "Curation status", options: ["READY", "IN PROGRESS", "ON HOLD"] },
    { label: "Primary curator", options: CURATOR_KEYS.map((k) => PEOPLE[k][0]) },
    { label: "Registered-only patients" },
    { label: "Withdrawn patients" },
  ],
  [{ label: "Female", sex: "F" }, { label: "Male", sex: "M" }],
  [{ label: "Age range", options: ["0–4 years", "5–9 years", "10–14 years", "15+ years"] }],
  [{ label: "Alive" }, { label: "Deceased" }],
  [
    { label: "Curation date", options: ["Last 7 days", "Last 30 days", "Last 90 days"] },
    { label: "Enrolment date", options: ["Last 30 days", "Last 6 months", "Last year"] },
  ],
  [
    { label: "Study" }, { label: "Event" }, { label: "Cohort" }, { label: "Zero2 category" },
    { label: "Zero2 subcategory 1" }, { label: "Zero2 subcategory 2" }, { label: "Zero2 final diagnosis" },
    { label: "Purity" }, { label: "Mutation burden" },
  ],
];

export type SortKey = "" | "Patient ID" | "Collection date (newest)" | "Status";
export const SORTS: Array<{ label: string; value: SortKey }> = [
  { label: "Default", value: "" },
  { label: "Patient ID", value: "Patient ID" },
  { label: "Collection date (newest)", value: "Collection date (newest)" },
  { label: "Status", value: "Status" },
];
export const STATUS_ORDER: Record<CurationStatus, number> = { "IN PROGRESS": 0, "ON HOLD": 1, READY: 2 };

export const GRID_COLS: Array<[string, number]> = [
  ["Event", 250], ["Status", 180], ["Collection", 110], ["Study", 80], ["Cohort", 200],
  ["Zero2 final diagnosis", 200], ["Mut. burden", 110], ["Purity", 60], ["Curators", 200],
];

/* ── Patient profile ──────────────────────────────────────────────── */

export interface PatientProfile {
  ageDx: string; ageS: string; ageE: string;
  evA: string; evD: string; evS: string;
  finalDx: string; histo: string; subtype: string;
  cohort: string; cohortStatus: "Confirmed" | "Provisional"; rationale: string;
  labmatrix: string; enrol: string; enrolDate: string; hospital: string;
  meta: Array<[string, string]>;
}

const PROFILES: Record<string, PatientProfile> = {
  "06-0336": {
    ageDx: "1", ageS: "2", ageE: "1", evA: "R1", evD: "D1", evS: "R1",
    finalDx: "Neuroblastoma", histo: "Cancer", subtype: "-",
    cohort: "Cohort 1: High-risk cancers", cohortStatus: "Confirmed", rationale: "Relapse or refractory cancer with <30% survival",
    labmatrix: "B1743", enrol: "a year ago", enrolDate: "12/09/2024", hospital: "Queensland Children's Hospital",
    meta: [["Study", "ZERO2"], ["Zero2 category", "Neuroblastoma"], ["Zero2 subcategory 1", "Neuroblastoma"], ["Zero2 subcategory 2", "NBL"],
      ["Primary site", "Paraspinal"], ["Sequenced site", "Forehead"], ["Metastatic disease", "Yes"], ["Metastatic site sequenced", "Yes"]],
  },
};

export function profileFor(pid: string): PatientProfile {
  return PROFILES[pid] ?? {
    ageDx: "3", ageS: "3", ageE: "3", evA: "D1", evD: "D1", evS: "D1",
    finalDx: "-", histo: "-", subtype: "-", cohort: "-", cohortStatus: "Provisional", rationale: "-",
    labmatrix: "", enrol: "a year ago", enrolDate: "04/10/2024", hospital: "Royal Children's Hospital Melbourne",
    meta: [["Study", "ZERO2"], ["Zero2 category", "-"], ["Zero2 subcategory 1", "-"], ["Zero2 subcategory 2", "-"],
      ["Primary site", "-"], ["Sequenced site", "-"], ["Metastatic disease", "-"], ["Metastatic site sequenced", "-"]],
  };
}

export function clinicalDefault(pid: string): string {
  if (pid !== "06-0336") return "";
  const cell = (n: string) =>
    `<p><b>ALL DOCUMENTS CHECKED AT:</b> <i>[dd/mm/yyyy]</i></p><p><b>ZERO2 DOCUMENTS</b></p><ul><li>Document type: Referral letter</li><li>Date: [dd/mm/yyyy]</li><li>Findings: Placeholder summary of the referring clinician's notes for the ${n} sequencing.</li></ul>` +
    `<p><b>IMAGING</b></p><ul><li>Document type: MRI spine</li><li>Date: [dd/mm/yyyy]</li><li>Findings: Placeholder paraspinal mass description, measurements and interval change.</li></ul>` +
    `<p><b>HISTOPATHOLOGY AND OTHER PRIOR MOLECULAR TESTING</b></p><ul><li>Document type: Histopathology report</li><li>Date: [dd/mm/yyyy]</li><li>Findings: Placeholder histology, grade and prior molecular results.</li></ul>` +
    `<p><b>ZERO2 SAMPLES</b></p><ul><li>Sample: [sample ID], site: [site], collected [dd/mm/yyyy]</li></ul><p><b>OTHER DOCUMENTS</b></p><ul><li>Document type: Clinical summary</li><li>Findings: Placeholder text.</li></ul>` +
    `<p><b>Treatment details</b></p><ul><li>Regimen: [protocol], cycles [n], response [placeholder]</li></ul>`;
  return `<ul><li>Synthetic note: patient referred for relapse sequencing.</li><li>Synthetic note: prior induction chemotherapy completed.</li><li>Synthetic note: second sequencing requested by treating team.</li></ul><table><thead><tr><th>First sequencing</th><th>Second sequencing</th></tr></thead><tbody><tr><td>${cell("first")}</td><td>${cell("second")}</td></tr></tbody></table>`;
}

export const SUB_TABS = [
  "Patient profile", "Tumour profile", "SNVs", "CNVs", "SVs", "RNASeq", "Cytogenetics", "Classifiers", "Methylation",
  "Germline SNVs", "Germline CNVs", "Germline SVs", "Germline cytogenetics", "Pathways", "Mut signatures", "HTS",
] as const;
export type SubTab = (typeof SUB_TABS)[number];

export const RC_OPTIONS = ["Yes", "No", "Under review"];
export const MC_OPTIONS = ["No change required", "Refinement", "Change in diagnosis"];

export interface ToolDef {
  label: string;
  src: string;
  kind: "icon" | "tile" | "case";
}
export const TOOLS: ToolDef[] = [
  { label: "Circos", src: "/assets/zerodash/tool-circos.svg", kind: "icon" },
  { label: "LINX", src: "/assets/zerodash/tool-linx.svg", kind: "icon" },
  { label: "IGV", src: "/assets/zerodash/tool-igv.svg", kind: "tile" },
  { label: "Fitting", src: "/assets/zerodash/tool-fitting.svg", kind: "icon" },
  { label: "Library", src: "/assets/zerodash/tool-library.svg", kind: "icon" },
  { label: "Summary", src: "/assets/zerodash/tool-summary.svg", kind: "tile" },
  { label: "Reports", src: "/assets/zerodash/tool-reports.svg", kind: "icon" },
  { label: "Case comparison", src: "", kind: "case" },
];

/* ── Tumour profile ───────────────────────────────────────────────── */

export const QC_FLAGS: Array<{ label: string; value: string; tone: "pass" | "warn" }> = [
  { label: "Contamination", value: "PASS", tone: "pass" },
  { label: "Tumour in normal contamination", value: "PASS", tone: "pass" },
  { label: "PURPLE QC status", value: "WARN", tone: "warn" },
];
export const IMMUNE_STATS: Array<[string, string]> = [
  ["IPASS status", "Cold: 0.49 (27.12)"],
  ["M1M2 status", "0.3 (17.08)"],
  ["CD8 status", "0.3 (17.08)"],
];
export const SAMPLE_QC: Array<{ label: string; id: string; metrics: Array<[string, string]> }> = [
  { label: "Germline DNA ID", id: "LKCGP-P009102-326845-02-04-07-G1", metrics: [["Mean coverage", "37.031"], ["%20 X", "0.963"], ["%30 X", "0.857"], ["%50 X", "0.050"]] },
  { label: "Tumour DNA ID", id: "LKCGP-P009102-326840-01-04-01-D1", metrics: [["Mean coverage", "102.126"], ["%20 X", "0.974"], ["%30 X", "0.971"], ["%50 X", "0.945"]] },
  { label: "Tumour RNA ID", id: "P0009102-288140-01-04-01-R1", metrics: [["Unique mapped reads", "54168256 / 61.9%"], ["Duplication", "0.184"]] },
];

/* ── Timeline ─────────────────────────────────────────────────────── */

const D = (y: number, m: number, d: number) => Date.UTC(y, m - 1, d);
export const TL_FULL: [number, number] = [Date.UTC(2020, 8, 1), Date.UTC(2026, 5, 15)];
export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export type EventTone = "registration" | "diagnosis" | "relapse" | "progression" | "death";
export const EVENT_COLOR: Record<EventTone, string> = {
  registration: "var(--insight-color-green-200)",
  diagnosis: "var(--insight-color-blue-150)",
  relapse: "var(--insight-color-blue-300)",
  progression: "var(--insight-color-orange-150)",
  death: "var(--insight-color-foreground-text-primary)",
};

export const TL_EVENTS: Array<{ tag: string; t: number; tone: EventTone; full: string }> = [
  { tag: "Reg", t: D(2020, 10, 14), tone: "registration", full: "Registration" },
  { tag: "D1", t: D(2021, 1, 18), tone: "diagnosis", full: "Diagnosis" },
  { tag: "R1", t: D(2023, 2, 20), tone: "relapse", full: "Relapse" },
  { tag: "P1", t: D(2023, 5, 22), tone: "progression", full: "Progression" },
  { tag: "P2", t: D(2023, 6, 30), tone: "progression", full: "Progression" },
  { tag: "P3", t: D(2024, 5, 14), tone: "progression", full: "Progression" },
  { tag: "P4", t: D(2024, 8, 19), tone: "progression", full: "Progression" },
  { tag: "P5", t: D(2025, 7, 7), tone: "progression", full: "Progression" },
  { tag: "Death", t: D(2026, 4, 28), tone: "death", full: "Death" },
];

/** [tag, time, sample count, id prefix, subtitle] */
export type SampleMark = [string, number, number, string, string];
export const TL_SAMPLES: Record<string, SampleMark[]> = {
  "Tumour (TT)": [["TT", D(2021, 1, 20), 20, "TT", "TT | Frozen sample"], ["TT", D(2023, 3, 10), 6, "TT", "TT | FFPE"], ["TT", D(2024, 5, 15), 4, "TT", "TT | Frozen sample"]],
  "Liquid biopsies (LB)": [["LB", D(2023, 7, 1), 12, "PB", "LB | cfDNA"], ["LB", D(2024, 8, 20), 15, "PB", "LB | cfDNA"], ["LB", D(2025, 7, 5), 18, "PB", "LB | cfDNA"]],
  "Germline (GP)": [["GP", D(2021, 1, 25), 6, "PB", "GP | DNA"], ["GP - LB panel", D(2025, 7, 7), 6, "PB", "GP | DNA"]],
  "Unknown (UN)": [["UN", D(2022, 4, 1), 3, "UN", "UN | Unknown"], ["UN", D(2024, 1, 10), 3, "UN", "UN | Unknown"], ["UN …", D(2025, 11, 1), 12, "UN", "UN | Unknown"]],
};
export const TL_REPORTS: Record<string, Array<[string, number]>> = {
  "Molecular report": [["FT", D(2025, 8, 1)]],
  "MTB report": [["MTB", D(2025, 9, 2)]],
  "Germline report": [["G", D(2025, 8, 20)]],
};
export const WISP_COLS = ["Biosample ID", "Biomaterial name", "Collection date", "Detected", "Purity (%)", "LB LOD (%)", "Variants", "Fragments"];

export const fmtMonth = (t: number) => {
  const d = new Date(t);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
};
export const fmtDay = (t: number) => {
  const d = new Date(t);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
};
