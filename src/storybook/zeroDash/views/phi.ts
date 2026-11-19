/**
 * ZDDM-3375 · Patient name search & PHI display levels (ZeroDash Overview).
 * On-screen masking only — generated reports and exports keep the full record.
 * Pure helpers: no React, no DOM.
 */

export type PhiLevel = "full" | "partial" | "initials" | "codified";
export type PhiProfileKey = "A" | "B" | "C" | "D" | "E";
/** How a user reaches a patient: through a study grant (default), a patient-level grant, or not at all. */
export type PhiGrant = "study" | "patient" | "none";
export type PhiSearchBy = "all" | "name" | "id" | "dob";
export type PhiMatchGroup = "name" | "id" | "lm" | "dob";
/** Which patient headers show a name when nothing is searched. */
export type PhiNameScope = "matched" | "all";

export const PHI_LEVELS: PhiLevel[] = ["full", "partial", "initials", "codified"];
export const PHI_NAMES = ["Full", "Partial", "Initials", "Codified"] as const;

export interface PhiPatient {
  sex: "F" | "M";
  first: string;
  last: string;
  /** Patient ID (zccs…). */
  pid: string;
  /** LabMatrix subject ID. */
  lm: string;
  /** ISO date of birth. */
  dob: string;
  sample: string;
  pub: string;
  manifest: string;
}

const phiMk = (sex: "F" | "M", first: string, last: string, pid: string, lm: string, dob: string): PhiPatient => ({
  sex,
  first,
  last,
  pid,
  lm,
  dob,
  sample: `${pid}_T_WGS`,
  pub: `P${lm.replace("-", "")}`,
  manifest: `MANIFEST_${lm.replace("-", "_")}`,
});

export const PHI_MOCK: PhiPatient[] = [
  phiMk("F", "Amara", "Okonkwo", "zccsGajGDa5F", "01-0438", "2023-07-02"),
  phiMk("F", "Dina", "Diggle", "zccs9206Tq", "01-0512", "2019-03-14"),
  phiMk("M", "Digby", "Okafor", "zccsK81mRw2", "02-1177", "2016-11-21"),
  phiMk("M", "Liam", "Diggory", "zccsP03xLe9", "03-0090", "2021-07-08"),
  phiMk("F", "Sophie", "Nguyen", "zccs92Wm7Hn", "05-0261", "2012-01-30"),
  phiMk("M", "Oliver", "Tran", "zccsTe55Ba1", "01-0597", "2018-09-02"),
  phiMk("F", "Ruby", "Chen", "zccsDi4mQ02", "04-0331", "2019-10-05"),
];

export const PHI_BY_PID: Record<string, PhiPatient> = Object.fromEntries(PHI_MOCK.map((m) => [m.pid, m]));

const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function phiDob(iso: string) {
  const [y, mo, d] = iso.split("-").map(Number);
  const dd = String(d).padStart(2, "0");
  const mm = String(mo).padStart(2, "0");
  return { y, long: `${dd} ${MON[mo - 1]} ${y}`, slash: `${dd}/${mm}/${y}`, iso, my: `${MON[mo - 1]} ${y}` };
}

/** "4y 2m" relative to `now` (defaults to today). */
export function phiAge(iso: string, now: Date = new Date()) {
  const [y, mo, d] = iso.split("-").map(Number);
  let months = (now.getFullYear() - y) * 12 + (now.getMonth() + 1 - mo);
  if (now.getDate() < d) months -= 1;
  months = Math.max(0, months);
  return `${Math.floor(months / 12)}y ${months % 12}m`;
}

/** Masked display name for a level ("" at Codified). */
export function phiName(m: PhiPatient, lvl: PhiLevel) {
  if (lvl === "full") return `${m.first} ${m.last}`;
  if (lvl === "partial") return `${m.first} ${m.last[0]}.`;
  if (lvl === "initials") return `${m.first[0]}. ${m.last[0]}.`;
  return "";
}

/** Masked date of birth chip text for a level ("" at Codified). */
export function phiDobText(m: PhiPatient, lvl: PhiLevel) {
  const f = phiDob(m.dob);
  if (lvl === "full") return `DOB ${f.long}`;
  if (lvl === "partial") return `DOB ${f.my}`;
  if (lvl === "initials") return `DOB ${f.y}`;
  return "";
}

export interface PhiProfile {
  /** Holds `pii.read`. */
  pii: boolean;
  desc: string;
  /** Per-patient grant overrides; `*` sets the default. */
  grants: Record<string, PhiGrant>;
}

/** Access profiles (Figma "PHI" › Profiles A–E). */
export const PHI_PROFILES: Record<PhiProfileKey, PhiProfile> = {
  A: { pii: true, desc: "pii.read, every patient through a study grant", grants: {} },
  B: { pii: true, desc: "pii.read, Dina shared through a patient-level grant", grants: { zccs9206Tq: "patient" } },
  C: { pii: false, desc: "No pii.read, study grants", grants: {} },
  D: { pii: false, desc: "No pii.read, only Dina through a patient-level grant", grants: { "*": "none", zccs9206Tq: "patient" } },
  E: { pii: true, desc: "Like A, but no grant for Amara", grants: { zccsGajGDa5F: "none" } },
};

export const phiGrant = (prof: PhiProfile, pid: string): PhiGrant => prof.grants[pid] || prof.grants["*"] || "study";

export const PHI_HELP: Record<PhiLevel | "locked", string> = {
  full: "Full names and dates of birth are visible on every record. You can search by name, patient ID and date of birth.",
  partial:
    "Names show as first name and last initial, and dates of birth as month and year. Search still matches full names and dates of birth.",
  initials: "Only initials and year of birth are shown. Name matches appear in search with a Name hidden tag.",
  codified:
    "Names and dates of birth are hidden, so only patient IDs show. Name and date of birth matches appear in search with a hidden tag.",
  locked: "You don’t have PHI access. Only patient IDs are shown, and you can search by patient ID only.",
};

export const PHI_BY_LABEL: Record<PhiSearchBy, string> = { all: "All", name: "Name", id: "Patient ID", dob: "Date of birth" };
export const PHI_SEARCH_BY: Array<[PhiSearchBy, string]> = [
  ["all", "All"],
  ["name", "Name"],
  ["id", "Patient ID"],
  ["dob", "Date of birth"],
];
export const PHI_GROUPS: Array<[PhiMatchGroup, string]> = [
  ["name", "Patient name"],
  ["id", "Patient ID"],
  ["lm", "LabMatrix ID"],
  ["dob", "Date of birth"],
];
export const PHI_GROUP_RANK: Record<PhiMatchGroup, number> = { name: 0, id: 1, lm: 2, dob: 3 };

export interface PhiMatch {
  group: PhiMatchGroup;
  /** Name tokens (for highlighting). */
  tokens: string[];
  /** ID query with whitespace removed. */
  idq: string;
  /** Lower-cased date query. */
  dobq: string;
  term: string;
}

/** Match one term against one patient (3e). Returns the best group it matched on, or null. */
export function phiMatchTerm(
  m: PhiPatient,
  term: string,
  by: PhiSearchBy,
  pii: boolean,
  grant: PhiGrant,
): PhiMatch | null {
  const ql = String(term || "").trim().toLowerCase();
  if (!ql || grant === "none") return null;
  const full = pii && grant === "study";
  const tokens = ql.split(/\s+/).filter(Boolean);
  const idq = ql.replace(/\s+/g, "");
  const f = phiDob(m.dob);
  const allow: PhiMatchGroup[] =
    by === "name" ? ["name"] : by === "id" ? ["id", "lm"] : by === "dob" ? ["dob"] : ["name", "id", "lm", "dob"];
  const tests: Record<PhiMatchGroup, () => boolean> = {
    name: () => full && tokens.every((t) => m.first.toLowerCase().includes(t) || m.last.toLowerCase().includes(t)),
    id: () => [m.sample, m.pid, m.pub, m.manifest].some((x) => x.toLowerCase().includes(idq)),
    lm: () => full && m.lm.toLowerCase().includes(idq),
    dob: () => full && [f.long, f.slash, f.iso, f.my].some((x) => x.toLowerCase().includes(ql)),
  };
  for (const [g] of PHI_GROUPS) if (allow.includes(g) && tests[g]()) return { group: g, tokens, idq, dobq: ql, term };
  return null;
}

/** Best (lowest-rank) match of any term. */
export function phiBestMatch(m: PhiPatient, terms: string[], by: PhiSearchBy, pii: boolean, grant: PhiGrant) {
  let best: PhiMatch | null = null;
  for (const t of terms) {
    const r = phiMatchTerm(m, t, by, pii, grant);
    if (r && (!best || PHI_GROUP_RANK[r.group] < PHI_GROUP_RANK[best.group])) best = r;
  }
  return best;
}

/** Split on new lines and semicolons, trim, de-duplicate case-insensitively. */
export function phiSplitTerms(text: string) {
  const seen = new Set<string>();
  const out: string[] = [];
  String(text || "")
    .split(/[\n;]/)
    .map((t) => t.trim())
    .filter(Boolean)
    .forEach((t) => {
      const k = t.toLowerCase();
      if (!seen.has(k)) {
        seen.add(k);
        out.push(t);
      }
    });
  return out;
}

/** Merged [start, end) ranges of every needle inside `text` (case-insensitive). */
export function phiHighlightRanges(text: string, needles: string[]) {
  const low = text.toLowerCase();
  const ranges: Array<[number, number]> = [];
  needles.filter(Boolean).forEach((n) => {
    const nl = n.toLowerCase();
    let i = low.indexOf(nl);
    while (i !== -1) {
      ranges.push([i, i + nl.length]);
      i = low.indexOf(nl, i + Math.max(1, nl.length));
    }
  });
  ranges.sort((a, b) => a[0] - b[0]);
  const merged: Array<[number, number]> = [];
  ranges.forEach((r) => {
    const last = merged[merged.length - 1];
    if (last && r[0] <= last[1]) last[1] = Math.max(last[1], r[1]);
    else merged.push([r[0], r[1]]);
  });
  return merged;
}

export type PhiTagKind = "hidden" | "restricted";
export interface PhiTagSpec {
  kind: PhiTagKind;
  label: string;
}

/** Tag explaining a masked match (5): "hidden" follows the PHI level, "restricted" follows the grant. */
export function phiTagFor(match: PhiMatch | null, lvl: PhiLevel, restricted: boolean): PhiTagSpec | null {
  if (restricted) return { kind: "restricted", label: "Name restricted" };
  if (!match) return null;
  if (match.group === "name" && lvl === "initials") return { kind: "hidden", label: "Name hidden" };
  if (match.group === "name" && lvl === "codified") return { kind: "hidden", label: "Name match hidden" };
  if (match.group === "dob" && lvl === "codified") return { kind: "hidden", label: "DOB hidden" };
  return null;
}

/** Everything the masked renderers need to know about the viewer. */
export interface PhiContext {
  lvl: PhiLevel;
  pii: boolean;
  grantOf: (pid: string) => PhiGrant;
  scope: PhiNameScope;
  /** Applied search: what each matching patient matched on. */
  applied: Record<string, PhiMatch> | null;
  /** Reference date for ages (fixed in stories so snapshots don't drift). */
  now?: Date;
}
