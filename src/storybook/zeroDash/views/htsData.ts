/* HTS Dashboard mock data — ported from the ZeroDash prototype (seeded, deterministic). */

export const HTS_COMPLETE = ["READY TO START", "IN PROGRESS", "DONE"] as const;
export const HTS_REPORT = ["UPCOMING", "IN PROGRESS", "ON HOLD", "DONE", "N/A"] as const;
export const HTS_EVENTS = ["Diagnosis 1", "Progression 1", "Relapse 1", "Relapse 2", "Diagnosis 2"];
export const DIAGNOSES = [
  "Embryonal rhabdomyosarcoma",
  "Diffuse high grade glioma, H3-wildtype and IDH-wildtype",
  "Osteosarcoma",
  "Ewing sarcoma, bone",
  "Alveolar rhabdomyosarcoma",
  "Neuroblastoma",
  "Medulloblastoma, SHH-activated",
  "Synovial sarcoma",
  "Wilms tumour",
  "Ependymoma, posterior fossa group A",
];
export const SCREENS = ["hts_screen150_v2.0", "standard_126", "hts_combo96_v1.1"];
export const NOT_SET = "Not set";

export type HtsComplete = (typeof HTS_COMPLETE)[number];
export type HtsReport = (typeof HTS_REPORT)[number];
export type QcValue = "PASS" | "PENDING" | "FAIL";
export type Sex = "F" | "M" | null;

/** Status tone, mapped to a token pair in the view's CSS. */
export type Tone = "success" | "primary" | "neutral" | "warning" | "danger";

export const QC_TONE: Record<string, Tone> = { PASS: "success", PENDING: "neutral", FAIL: "danger" };
export const COMPLETE_TONE: Record<string, Tone> = {
  DONE: "neutral",
  "IN PROGRESS": "primary",
  "READY TO START": "success",
};
export const REPORT_TONE: Record<string, Tone> = {
  UPCOMING: "neutral",
  "IN PROGRESS": "primary",
  "ON HOLD": "warning",
  DONE: "success",
  "N/A": "neutral",
};

export interface HtsScreen {
  id: string;
  patientId: string;
  sex: Sex;
  event: string;
  diagnosis: string;
  biosample: string;
  screen: string;
  screenDate: string | null;
  dataQc: QcValue;
  sampleQc: QcValue | null;
  curationDate: string | null;
  screenStatus: QcValue | null;
  complete: HtsComplete;
  comments: string;
}

export interface HtsReportEntry {
  status: HtsReport;
  updated: string;
}

export interface HtsData {
  screens: HtsScreen[];
  reports: Record<string, HtsReportEntry>;
  /** Event-level HTS complete, keyed by `evKey(patientId, event)`. */
  events: Record<string, HtsComplete>;
}

const ID = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const UP = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789";

function rng(seed: number) {
  let a = seed >>> 0;
  return () => (a = (a * 1664525 + 1013904223) >>> 0) / 2 ** 32;
}
type Rng = () => number;
const pick = <T,>(r: Rng, arr: readonly T[]): T => arr[Math.floor(r() * arr.length)];
const code = (r: Rng, n: number, c = ID) => Array.from({ length: n }, () => pick(r, [...c])).join("");
const dmy = (r: Rng) =>
  `${String(1 + Math.floor(r() * 28)).padStart(2, "0")}/${String(1 + Math.floor(r() * 12)).padStart(2, "0")}/2025`;
const iso = (r: Rng) =>
  `2026-${String(1 + Math.floor(r() * 10)).padStart(2, "0")}-${String(1 + Math.floor(r() * 28)).padStart(2, "0")}T09:00:00Z`;

export const evKey = (pid: string, ev: string) => `${pid}|${ev}`;

type Base = Pick<HtsScreen, "patientId" | "sex" | "event" | "diagnosis">;

function screenRow(r: Rng, base: Base, screen: string, complete?: HtsComplete): HtsScreen {
  const bio = `${code(r, 8, UP)}_T_${code(r, 8, UP)}_H`;
  const screened = r() < 0.85;
  const dataQc: QcValue = screened && r() < 0.8 ? "PASS" : "PENDING";
  const sampleQc: QcValue | null = screened ? (r() < 0.9 ? "PASS" : "FAIL") : null;
  const curated = screened && dataQc === "PASS" && r() < 0.6;
  const screenStatus: QcValue | null = screened ? (curated ? "PASS" : r() < 0.5 ? "FAIL" : null) : null;
  return {
    ...base,
    id: `${bio}|${screen}`,
    biosample: bio,
    screen,
    screenDate: screened ? dmy(r) : null,
    dataQc,
    sampleQc,
    curationDate: curated ? dmy(r) : null,
    screenStatus,
    complete: complete || (curated && r() < 0.5 ? "DONE" : screened ? "IN PROGRESS" : "READY TO START"),
    comments: "",
  };
}

export function buildHtsData(): HtsData {
  const r = rng(2982);
  const screens: HtsScreen[] = [];
  const reports: Record<string, HtsReportEntry> = {};
  const events: Record<string, HtsComplete> = {};

  const a: Base = {
    patientId: "06-0336",
    sex: "F",
    event: "Diagnosis 1",
    diagnosis: "Diffuse high grade glioma, H3-wildtype and IDH-wildtype",
  };
  const a1 = screenRow(r, a, "hts_screen150_v2.0", "IN PROGRESS");
  const a2 = screenRow(r, a, "standard_126", "IN PROGRESS");
  a1.comments = "Second culture expanded; re-plating 12/11.";
  screens.push(a1, a2);
  reports[a1.id] = { status: "IN PROGRESS", updated: "2026-10-20T09:00:00Z" };
  reports[a2.id] = { status: "N/A", updated: "2026-10-28T09:00:00Z" };
  events[evKey(a.patientId, a.event)] = "IN PROGRESS";

  const b: Base = { patientId: "07-0388", sex: "M", event: "Diagnosis 1", diagnosis: "Embryonal rhabdomyosarcoma" };
  const b1 = screenRow(r, b, "hts_screen150_v2.0", "DONE");
  const b2 = screenRow(r, b, "hts_combo96_v1.1", "IN PROGRESS");
  screens.push(b1, b2);
  reports[b1.id] = { status: "ON HOLD", updated: "2026-09-10T09:00:00Z" };
  reports[b2.id] = { status: "DONE", updated: "2026-10-15T09:00:00Z" };
  events[evKey(b.patientId, b.event)] = "IN PROGRESS";

  for (let i = 0; i < 11; i++) {
    const pid = "zccs" + code(r, 8);
    const sex: Sex = r() < 0.45 ? "M" : r() < 0.85 ? "F" : null;
    const nEv = r() < 0.35 ? 2 : 1;
    const evs = [...HTS_EVENTS]
      .map((e) => [r(), e] as const)
      .sort((x, y) => x[0] - y[0])
      .map((x) => x[1])
      .slice(0, nEv);
    for (const ev of evs) {
      const base: Base = { patientId: pid, sex, event: ev, diagnosis: DIAGNOSES[(i + 3) % DIAGNOSES.length] };
      const n = 1 + Math.floor(r() * 3);
      const rows = Array.from({ length: n }, (_, c) => screenRow(r, base, c === 0 ? SCREENS[0] : pick(r, SCREENS)));
      screens.push(...rows);
      rows.forEach((s) => {
        if (s.curationDate || r() < 0.4) reports[s.id] = { status: pick(r, HTS_REPORT), updated: iso(r) };
      });
      const allDone = rows.every((s) => s.complete === "DONE");
      events[evKey(pid, ev)] =
        allDone && r() < 0.7 ? "DONE" : rows.some((s) => s.complete !== "READY TO START") ? "IN PROGRESS" : "READY TO START";
    }
  }
  return { screens, reports, events };
}

export const reportOf = (d: HtsData, id: string): HtsReport => d.reports[id]?.status ?? "UPCOMING";

/** Context passed to filter accessors. */
export interface MatchCtx {
  s: HtsScreen;
  report: HtsReport;
  eventComplete: HtsComplete;
}

export const FILTER_FIELDS: Array<{ label: string; get: (x: MatchCtx) => string; options: readonly string[] }> = [
  { label: "HTS complete (event)", get: (x) => x.eventComplete, options: HTS_COMPLETE },
  { label: "HTS complete (screen)", get: (x) => x.s.complete, options: HTS_COMPLETE },
  { label: "HTS report", get: (x) => x.report, options: HTS_REPORT },
  { label: "HTS screen status", get: (x) => x.s.screenStatus || NOT_SET, options: ["PASS", "FAIL", NOT_SET] },
  { label: "HTS data QC", get: (x) => x.s.dataQc, options: ["PASS", "PENDING"] },
  { label: "HTS sample QC", get: (x) => x.s.sampleQc || NOT_SET, options: ["PASS", "FAIL", NOT_SET] },
  { label: "Event", get: (x) => x.s.event, options: HTS_EVENTS },
  { label: "ZERO2 final diagnosis", get: (x) => x.s.diagnosis, options: DIAGNOSES },
];

export const FILTER_CHECKS = ["Screened only", "Curated only"] as const;
export type FilterCheck = (typeof FILTER_CHECKS)[number];

/** Sentence-case option label (status enums are stored upper case). */
export const optionLabel = (field: string, v: string) =>
  field === "Event" || field === "ZERO2 final diagnosis" || v === NOT_SET ? v : v.charAt(0) + v.slice(1).toLowerCase();

/** Screen table columns: label, width (px), extra class hook. */
export const HTS_COLUMNS: Array<{ label: string; width: number; key: string }> = [
  { label: "Biosample", width: 236, key: "biosample" },
  { label: "Screen", width: 168, key: "screen" },
  { label: "Date HTS screen", width: 124, key: "screenDate" },
  { label: "HTS data QC", width: 120, key: "dataQc" },
  { label: "HTS sample QC", width: 120, key: "sampleQc" },
  { label: "HTS curation date", width: 124, key: "curationDate" },
  { label: "HTS screen status", width: 120, key: "screenStatus" },
  { label: "HTS report", width: 128, key: "report" },
  { label: "HTS complete", width: 148, key: "complete" },
  { label: "Notes", width: 200, key: "notes" },
  { label: "", width: 48, key: "menu" },
];
