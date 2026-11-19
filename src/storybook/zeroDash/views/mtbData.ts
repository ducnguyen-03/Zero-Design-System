/**
 * Mock data for ZeroDash › Clinical › Cases (the "MTB slides dashboard").
 * Sample-level rows; a patient's liquid-biopsy samples are clustered into one expandable case row.
 */

export type MtbSex = "M" | "F";

export interface MtbSample {
  /** Sample ID (monospace). */
  sid: string;
  patientId: string;
  sex: MtbSex;
  /** Status pill copy, e.g. "N/A". */
  status: string;
  /** Meeting date, "—" when unscheduled. */
  meeting: string;
  /** ZERO2 final diagnosis. */
  dx: string;
  event: string;
  tissue: string;
  /** Age at sample, in years. */
  age: string;
  /** Liquid-biopsy sample kind (shown under the patient ID on LB child rows). */
  kind?: string;
}

export interface MtbLbCase {
  /** Clustered case ID, e.g. "06-0114_XXXXXX_LB". */
  sid: string;
  patientId: string;
  sex: MtbSex;
  dx: string;
  /** Case event label ("Liquid biopsies"). */
  event: string;
  samples: MtbSample[];
}

export const MTB_COLUMNS = [
  "Sample ID",
  "Status",
  "Meeting date",
  "ZERO2 final diagnosis",
  "Event",
  "Tissue",
  "Age (sample)",
  "Curators",
  "Somatic",
  "Germline",
] as const;

const base = { patientId: "06-0114", sex: "M" as const, status: "N/A", meeting: "—", dx: "Neuroblastoma" };

export const MTB_SOLID_SAMPLES: MtbSample[] = [
  { ...base, sid: "06-0114_414818_T_W", event: "Diagnosis 1", tissue: "TT", age: "4" },
  { ...base, sid: "06-0114_477989_T_W", event: "Progression 1", tissue: "TT", age: "5" },
  { ...base, sid: "06-0114_429661_T_W", event: "Diagnosis 1", tissue: "TT", age: "4" },
];

export const MTB_LB_CASE: MtbLbCase = {
  sid: "06-0114_XXXXXX_LB",
  patientId: "06-0114",
  sex: "M",
  dx: "Neuroblastoma",
  event: "Liquid biopsies",
  samples: [
    { ...base, sid: "06-0114_486698_LB", event: "Relapse 1", tissue: "PB", age: "5", kind: "Plasma cfDNA" },
    { ...base, sid: "06-0114_486629_LB", event: "Progression 2", tissue: "PB", age: "5", kind: "Buffy coat germline" },
    { ...base, sid: "06-0114_491624_LB", event: "Progression 4", tissue: "PB", age: "6", kind: "Plasma cfDNA" },
  ],
};

/** Toolbar summary copy the shell shows above this view ("3 of 3 rows loaded"). */
export const MTB_ROWS_LOADED = "3 of 3 rows loaded";
