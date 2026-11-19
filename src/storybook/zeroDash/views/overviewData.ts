/** Mock data for the ZeroDash Overview (case list). Mirrors "ZeroDash Overview.dc.html". */

export type CaseStatus =
  | "DONE"
  | "IN PROGRESS"
  | "READY"
  | "UPCOMING"
  | "OVER DUE"
  | "N/A"
  | "CLOSED"
  | "ACTIVE"
  | "ON HOLD"
  | "SEQUENCING"
  | "IN PIPELINE"
  | "FAILED";

export type StudyLabel = "PRISM" | "ZERO2" | "MRD" | "LIQUID BIOPSY";
export type CurationUnderline = "green" | "red" | "dark" | "none";

export interface CaseRow {
  event: string;
  /** Zero2 category ("" = none). */
  cat: string;
  cohort: string;
  /** Curation status. */
  cur: CaseStatus;
  /** Assignee initials, in role order. */
  av: string[];
  ul: CurationUnderline;
  notes?: number;
  noteText?: string;
  /** One status per column of the study (see `STUDY_COLUMNS`). */
  cells: CaseStatus[];
  /** Liquid biopsy event (opens the LB view). */
  lb?: boolean;
  /** Expedited case. */
  overdue?: boolean;
  /** Has high-throughput screening results. */
  hts?: boolean;
}

export interface CaseSection {
  label: StudyLabel;
  rows: CaseRow[];
}

export interface CasePatient {
  patientId: string;
  sex: "F" | "M";
  sections: CaseSection[];
}

export const STUDY_COLUMNS: Record<StudyLabel, string[]> = {
  PRISM: ["MTB slides", "MTB report", "Case status"],
  ZERO2: ["Molecular report", "Germ report", "MTB slides", "MTB report", "Preclinical report", "Case status"],
  MRD: ["MRD report", "Case status"],
  "LIQUID BIOPSY": ["LB report", "MTB slides", "MTB report", "Case status"],
};

export const STUDY_ORDER: Record<StudyLabel, number> = { ZERO2: 1, "LIQUID BIOPSY": 2, MRD: 3, PRISM: 4 };
export const STUDY_SHORT: Record<StudyLabel, string> = { ZERO2: "ZERO2", "LIQUID BIOPSY": "LB", MRD: "MRD", PRISM: "PRISM" };

const C4 = "Cohort 4: Rhabdomyosarcoma";
const C6 = "Cohort 6: Acute lymphoblastic leukaemia";
const C1 = "Cohort 1: High-risk cancers";

export const OVERVIEW_PATIENTS: CasePatient[] = [
  {
    patientId: "zccsGajGDa5F",
    sex: "F",
    sections: [
      {
        label: "PRISM",
        rows: [
          { event: "Diagnosis 1", cat: "Sarcoma", cohort: C4, cur: "DONE", av: ["DL"], ul: "green", notes: 1, noteText: "Case closed — final MTB report signed off.", cells: ["DONE", "DONE", "DONE"] },
        ],
      },
      {
        label: "ZERO2",
        rows: [
          {
            event: "Relapse 1", cat: "Sarcoma", cohort: C4, cur: "DONE", av: ["JP", "TT"], ul: "green", notes: 3,
            noteText: "<b>Awaiting</b> MTB slides review — MO to confirm variant list.",
            cells: ["DONE", "DONE", "DONE", "IN PROGRESS", "UPCOMING", "ACTIVE"],
          },
        ],
      },
      { label: "MRD", rows: [{ event: "Diagnosis 1", cat: "Sarcoma", cohort: C4, cur: "IN PROGRESS", av: ["NN"], ul: "red", cells: ["UPCOMING", "ACTIVE"] }] },
      {
        label: "LIQUID BIOPSY",
        rows: [
          { event: "Liquid biopsy 1", cat: "Sarcoma", cohort: C4, cur: "READY", av: ["RS"], ul: "red", lb: true, overdue: true, cells: ["OVER DUE", "N/A", "N/A", "ACTIVE"] },
          { event: "Liquid biopsy 2", cat: "Sarcoma", cohort: C4, cur: "DONE", av: ["JP", "TT"], ul: "green", lb: true, cells: ["DONE", "DONE", "IN PROGRESS", "ACTIVE"] },
          { event: "Liquid biopsy 3", cat: "Sarcoma", cohort: C4, cur: "IN PROGRESS", av: ["KD"], ul: "red", lb: true, cells: ["IN PROGRESS", "UPCOMING", "N/A", "ACTIVE"] },
          { event: "Liquid biopsy 4", cat: "Sarcoma", cohort: C4, cur: "SEQUENCING", av: ["NN"], ul: "none", lb: true, cells: ["UPCOMING", "N/A", "N/A", "ACTIVE"] },
        ],
      },
    ],
  },
  {
    patientId: "zccs9206Tq",
    sex: "F",
    sections: [
      {
        label: "ZERO2",
        rows: [
          { event: "Relapse 1", cat: "HM", cohort: C6, cur: "SEQUENCING", av: ["NN"], ul: "none", cells: ["UPCOMING", "UPCOMING", "N/A", "N/A", "N/A", "ACTIVE"] },
          { event: "Progression 2", cat: "HM", cohort: C6, cur: "ON HOLD", av: ["DS", "AA"], ul: "dark", cells: ["IN PIPELINE", "UPCOMING", "UPCOMING", "N/A", "N/A", "ACTIVE"] },
        ],
      },
      {
        label: "LIQUID BIOPSY",
        rows: [{ event: "Liquid biopsy 2", cat: "HM", cohort: C6, cur: "DONE", av: ["KD", "MR"], ul: "green", lb: true, cells: ["IN PROGRESS", "DONE", "UPCOMING", "ACTIVE"] }],
      },
    ],
  },
  {
    patientId: "zccsK81mRw2",
    sex: "M",
    sections: [
      {
        label: "ZERO2",
        rows: [
          {
            event: "Diagnosis 1", cat: "CNS", cohort: C1, cur: "IN PROGRESS", av: ["MR"], ul: "red", notes: 2, hts: true,
            noteText: "HTS flagged — prioritised for curation this week.",
            cells: ["IN PROGRESS", "UPCOMING", "UPCOMING", "UPCOMING", "N/A", "ACTIVE"],
          },
        ],
      },
      { label: "MRD", rows: [{ event: "Diagnosis 1", cat: "", cohort: C1, cur: "READY", av: ["DS"], ul: "red", hts: true, cells: ["IN PIPELINE", "ACTIVE"] }] },
      { label: "PRISM", rows: [] },
    ],
  },
  {
    patientId: "zccsP03xLe9",
    sex: "M",
    sections: [
      {
        label: "ZERO2",
        rows: [
          { event: "Diagnosis 1", cat: "Solid", cohort: C1, cur: "DONE", av: ["ST", "KD"], ul: "green", notes: 1, cells: ["DONE", "DONE", "DONE", "DONE", "DONE", "DONE"] },
          { event: "Relapse 1", cat: "Solid", cohort: C1, cur: "IN PROGRESS", av: ["AA"], ul: "red", cells: ["IN PROGRESS", "UPCOMING", "UPCOMING", "N/A", "N/A", "ACTIVE"] },
        ],
      },
      { label: "MRD", rows: [{ event: "Diagnosis 1", cat: "Solid", cohort: C1, cur: "READY", av: ["NN"], ul: "green", cells: ["DONE", "DONE"] }] },
    ],
  },
  {
    patientId: "zccs92Wm7Hn",
    sex: "F",
    sections: [
      {
        label: "ZERO2",
        rows: [{ event: "Progression 1", cat: "CNS", cohort: C1, cur: "SEQUENCING", av: ["MR"], ul: "none", cells: ["UPCOMING", "UPCOMING", "N/A", "N/A", "N/A", "ACTIVE"] }],
      },
      {
        label: "LIQUID BIOPSY",
        rows: [
          { event: "Liquid biopsy 1", cat: "CNS", cohort: C1, cur: "READY", av: ["RS", "DS"], ul: "red", lb: true, overdue: true, cells: ["OVER DUE", "N/A", "N/A", "ACTIVE"] },
          { event: "Liquid biopsy 2", cat: "CNS", cohort: C1, cur: "DONE", av: ["KD"], ul: "green", lb: true, cells: ["DONE", "DONE", "IN PROGRESS", "ACTIVE"] },
        ],
      },
    ],
  },
  {
    patientId: "zccsTe55Ba1",
    sex: "M",
    sections: [
      { label: "PRISM", rows: [{ event: "Diagnosis 1", cat: "HM", cohort: C6, cur: "IN PROGRESS", av: ["JP"], ul: "red", notes: 2, cells: ["IN PROGRESS", "UPCOMING", "ACTIVE"] }] },
      {
        label: "ZERO2",
        rows: [{ event: "Relapse 2", cat: "HM", cohort: C6, cur: "ON HOLD", av: ["DS", "NN"], ul: "dark", cells: ["IN PIPELINE", "UPCOMING", "UPCOMING", "N/A", "N/A", "ACTIVE"] }],
      },
      { label: "MRD", rows: [{ event: "Progression 1", cat: "HM", cohort: C6, cur: "DONE", av: ["TT"], ul: "green", cells: ["DONE", "DONE"] }] },
    ],
  },
  {
    patientId: "zccsDi4mQ02",
    sex: "F",
    sections: [
      {
        label: "ZERO2",
        rows: [{ event: "Diagnosis 1", cat: "Sarcoma", cohort: C4, cur: "DONE", av: ["ST"], ul: "green", hts: true, cells: ["DONE", "DONE", "DONE", "IN PROGRESS", "UPCOMING", "ACTIVE"] }],
      },
      {
        label: "LIQUID BIOPSY",
        rows: [{ event: "Liquid biopsy 1", cat: "Sarcoma", cohort: C4, cur: "READY", av: ["MR"], ul: "green", lb: true, cells: ["READY", "IN PROGRESS", "UPCOMING", "ACTIVE"] }],
      },
    ],
  },
];

/** A row is "completed" when its case status (last column) is DONE. */
export const isDoneRow = (r: CaseRow) => r.cells[r.cells.length - 1] === "DONE";

/* ── People ─────────────────────────────────────────────── */

export const PEOPLE_BY_INITIALS: Record<string, string> = {
  NN: "Ngoc Nguyen",
  TT: "Thu Tran",
  JP: "Jane Park",
  DL: "Duy Le",
  AL: "Amy Lee",
  MK: "Mai Khanh",
  RS: "Ravi Singh",
  MR: "Mia Ross",
  DS: "Dianne Sylvester",
  AA: "Ann-Kristin Altekoester",
  KD: "Kimberly Dias",
  LL: "Loretta Lau",
};

/** Avatar fills per initials (closest ramp tokens to the design's hues). */
export const AVATAR_COLOR: Record<string, string> = {
  NN: "var(--insight-color-orange-100)",
  TT: "var(--insight-color-turquoise-100)",
  JP: "var(--insight-color-orange-100)",
  DL: "var(--insight-color-orange-100)",
  AL: "var(--insight-color-blue-100)",
  MK: "var(--insight-color-magenta-150)",
  RS: "var(--insight-color-turquoise-100)",
  MR: "var(--insight-color-blue-100)",
  DS: "var(--insight-color-orange-100)",
  AA: "var(--insight-color-blue-50)",
  KD: "var(--insight-color-green-200)",
  LL: "var(--insight-color-orange-50)",
};
export const AVATAR_FALLBACK = "var(--insight-color-grey-75)";

/** Assignee picker list. */
export const PEOPLE = [
  "Ann-Kristin Altekoester",
  "Christina Walker",
  "Dianne Sylvester",
  "Dien Le",
  "Duc Nguyen",
  "Jasmine Parhar",
  "Jorge Echeverria",
  "Kimberly Dias",
  "Mark Hong",
  "Megan Rumford",
  "Monaa Mallesh-Kumar",
  "Ngoc Nguyen",
  "Paulette Barahona",
  "Ravi Singh",
  "Thu Tran",
  "Tin Tran",
];
const PICK_PALETTE = [
  "var(--insight-color-orange-100)",
  "var(--insight-color-turquoise-100)",
  "var(--insight-color-blue-100)",
  "var(--insight-color-magenta-150)",
  "var(--insight-color-orange-50)",
  "var(--insight-color-violet-100)",
];
export const initialsOf = (n: string) =>
  n
    .split(/[\s-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
export const colorOfName = (n: string) => PICK_PALETTE[n.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % PICK_PALETTE.length];

/* ── Stage hover popover ────────────────────────────────── */

export interface StageMeta {
  title: string;
  target: string;
  roles: string[];
}
export const STAGE_META: Record<string, StageMeta> = {
  Curation: { title: "Curation", target: "4 business days", roles: ["Primary Curator", "Secondary Curator"] },
  "Molecular report": { title: "Molecular Report", target: "6 weeks", roles: ["Reported by", "Curators", "Molecular Oncologists"] },
  "Germ report": { title: "Germline Report", target: "6 weeks", roles: ["Reported by", "Curators"] },
  "MTB slides": { title: "MTB Slides", target: "2 weeks", roles: ["Curators", "MTB Chairs"] },
  "MTB report": { title: "MTB Report", target: "6 weeks", roles: ["Curators", "Molecular Oncologists"] },
  "Preclinical report": { title: "Preclinical Report", target: "6 weeks", roles: ["Reported by", "MTB Chairs", "Curators", "Molecular Oncologists"] },
  "LB report": { title: "LB Report", target: "6 weeks", roles: ["Reported by", "Curators"] },
  "MRD report": { title: "MRD Report", target: "6 weeks", roles: ["Reported by", "Curators"] },
};

export type BadgeKind = "check" | "dot" | "play";
export function badgeKind(status: CaseStatus): BadgeKind {
  if (status === "DONE" || status === "CLOSED") return "check";
  if (status === "IN PROGRESS" || status === "OVER DUE" || status === "FAILED" || status === "ON HOLD") return "dot";
  return "play";
}

/* ── Quick filters ──────────────────────────────────────── */

export const QUICK_FILTERS = ["Assigned to me", "Assigned second check", "Overdue reports", "Active cases"] as const;
export type QuickFilter = (typeof QUICK_FILTERS)[number];
/** Prototype: the signed-in curator's initials. */
export const QUICK_ME = "NN";

/* ── Filter panel ───────────────────────────────────────── */

export const FILTER_OPTIONS: Record<string, string[]> = {
  "Assignee & Status": ["Su Tong", "Ann-Kristin Altekoester", "Dianne Sylvester", "Kimberly Dias", "Megan Rumford", "Ngoc Nguyen", "Unassigned"],
  Study: ["3DTumouroids", "Cohort B Rare Cancers", "DCROUCHER", "MRD", "PRISM", "TARGET", "ZERO2"],
  Event: ["Diagnosis 1", "Relapse 1", "Progression 1", "Progression 2", "Liquid biopsy 1"],
  Cohort: [C1, C4, C6],
  "Zero 2 Category": ["CNS", "HM", "Neuroblastoma", "Sarcoma", "Solid tumour", "Vascular/lymphatic anomalies"],
  "Zero 2 Subcategory 1": ["Embryonal", "Alveolar", "Glioma", "Medulloblastoma"],
  "Zero 2 Subcategory 2": ["Fusion positive", "Fusion negative", "Not specified"],
  "Zero 2 Final Diagnosis": ["Rhabdomyosarcoma", "Neuroblastoma", "B-ALL", "Ependymoma"],
};
export const FILTER_GROUPS: string[][] = [
  ["Assignee & Status", "Expedited only", "Has HTS", "Registered-only patients", "Withdrawn patients"],
  ["Study", "Event", "Cohort", "Zero 2 Category", "Zero 2 Subcategory 1", "Zero 2 Subcategory 2", "Zero 2 Final Diagnosis"],
];

/* ── Update status dialog ───────────────────────────────── */

export const DIALOG_STAGES = ["Curation", "Molecular Report", "Germline Report", "MTB Report", "Preclinical Report", "MTB Slides", "Case Status"];
export const DIALOG_STATUSES = ["Upcoming", "In Progress", "Done", "On Hold", "Active", "N/A"];

/** Unique key for a row (patient | study | event). */
export const rowKeyOf = (patientId: string, study: string, event: string) => `${patientId}|${study}|${event}`;

/** Total the server would report when nothing narrows the list. */
export const OVERVIEW_TOTAL_ROWS = 537;
export const OVERVIEW_PAGE_ROWS = 20;
