import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, KeyboardEvent, MouseEvent as ReactMouseEvent } from "react";
import { Info, Lock, Search, X } from "lucide-react";
import { Tooltip } from "../../../../components/Tooltip/Tooltip";
import { PHI_GROUPS, PHI_SEARCH_BY, phiMatchTerm, phiSplitTerms } from "../phi";
import type { PhiContext, PhiMatch, PhiMatchGroup, PhiPatient, PhiSearchBy } from "../phi";
import { PhiSuggestion } from "./PhiBits";
import styles from "../OverviewView.module.css";

export interface AppliedSearch {
  terms: string[];
  /** Suggestions the user picked keep what they matched on (e.g. a name match picked as an ID). */
  picks: Record<string, PhiMatch>;
  by: PhiSearchBy;
}

export interface SearchFieldProps {
  toolbar: "A" | "B";
  ctx: PhiContext;
  /** Patients the viewer can see at all. */
  patients: PhiPatient[];
  /** Some patients reach the viewer through a patient-level grant. */
  hasPatientGrants: boolean;
  applied: AppliedSearch | null;
  onApply: (next: AppliedSearch | null) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Draft text when the popover starts open (stories). */
  initialDraft?: string;
  initialBy?: PhiSearchBy;
  initialPicks?: Record<string, PhiMatch>;
}

const cx = (...p: Array<string | false | undefined | null>) => p.filter(Boolean).join(" ");
const lastLine = (t: string) => t.split("\n").pop() || "";
const LOCK_TIP = "Needs PHI access";

export function SearchField({
  toolbar,
  ctx,
  patients,
  hasPatientGrants,
  applied,
  onApply,
  open,
  onOpenChange,
  initialDraft = "",
  initialBy = "all",
  initialPicks,
}: SearchFieldProps) {
  const pii = ctx.pii;
  const wrapRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const debT = useRef<number | undefined>(undefined);

  const [draft, setDraft] = useState(initialDraft);
  const [cur, setCur] = useState(lastLine(initialDraft));
  const [q, setQ] = useState(lastLine(initialDraft));
  const [active, setActive] = useState(-1);
  const [picks, setPicks] = useState<Record<string, PhiMatch>>(initialPicks ?? {});
  const [byRaw, setBy] = useState<PhiSearchBy>(initialBy);
  const by: PhiSearchBy = !pii && (byRaw === "name" || byRaw === "dob") ? "all" : byRaw;

  // Keep the popover mounted while it fades out.
  const [mounted, setMounted] = useState(open);
  useEffect(() => {
    if (open) {
      setMounted(true);
      return;
    }
    const t = window.setTimeout(() => setMounted(false), 200);
    return () => window.clearTimeout(t);
  }, [open]);
  useEffect(() => () => window.clearTimeout(debT.current), []);

  const grow = (el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  // Focus the textarea with the caret at the end when the popover opens.
  useLayoutEffect(() => {
    if (!open) return;
    const ta = taRef.current;
    if (!ta) return;
    grow(ta);
    ta.focus();
    const n = ta.value.length;
    ta.setSelectionRange(n, n);
  }, [open]);

  const refocusField = () => requestAnimationFrame(() => fieldRef.current?.focus());
  const close = (refocus: boolean) => {
    window.clearTimeout(debT.current);
    setActive(-1);
    onOpenChange(false);
    if (refocus) refocusField();
  };

  // Outside click / Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && e.target instanceof Node && !wrapRef.current.contains(e.target)) close(false);
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") close(true);
    };
    document.addEventListener("mousedown", onDown, true);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown, true);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const openSearch = () => {
    if (open) return;
    const text = applied ? applied.terms.join("\n") : "";
    const last = lastLine(text);
    setDraft(text);
    setCur(last);
    setQ(last);
    setActive(-1);
    setPicks(applied ? { ...applied.picks } : {});
    onOpenChange(true);
  };

  const lineInfo = (text: string) => {
    const ta = taRef.current;
    const caret = ta ? ta.selectionStart : text.length;
    const idx = text.slice(0, caret).split("\n").length - 1;
    return { idx, line: text.split("\n")[idx] || "" };
  };
  const syncLine = (text: string, debounce: boolean) => {
    const { line } = lineInfo(text);
    if (line === cur) return;
    setCur(line);
    setActive(-1);
    window.clearTimeout(debT.current);
    if (debounce) debT.current = window.setTimeout(() => setQ(line), 300);
    else setQ(line);
  };

  // Suggestions for the line under the caret (3c / 3e).
  const curT = cur.trim();
  const qT = q.trim();
  const helper = curT.length < 2;
  const ready = !helper && qT.length >= 2;
  const results = useMemo(() => {
    const res: Record<PhiMatchGroup, Array<{ m: PhiPatient; match: PhiMatch }>> = { name: [], id: [], lm: [], dob: [] };
    if (!ready) return res;
    patients.forEach((m) => {
      const r = phiMatchTerm(m, qT, by, pii, ctx.grantOf(m.pid));
      if (r) res[r.group].push({ m, match: r });
    });
    return res;
  }, [ready, patients, qT, by, pii, ctx]);
  const flat = PHI_GROUPS.flatMap(([k]) => results[k]);
  const act = Math.min(active, flat.length - 1);

  const submit = (text: string) => {
    const terms = phiSplitTerms(text);
    const kept: Record<string, PhiMatch> = {};
    Object.entries(picks).forEach(([pid, r]) => {
      if (terms.some((t) => t.toLowerCase() === pid.toLowerCase())) kept[pid] = r;
    });
    onApply(terms.length ? { terms, picks: kept, by } : null);
    close(true);
  };

  const pick = (it: { m: PhiPatient; match: PhiMatch }) => {
    const ta = taRef.current;
    const caret = ta ? ta.selectionStart : draft.length;
    const lines = draft.split("\n");
    const idx = draft.slice(0, caret).split("\n").length - 1;
    lines[idx] = it.m.pid;
    lines.splice(idx + 1, 0, "");
    const next = lines.join("\n");
    const pos = lines.slice(0, idx + 2).join("\n").length;
    window.clearTimeout(debT.current);
    setDraft(next);
    setCur("");
    setQ("");
    setActive(-1);
    setPicks((p) => ({ ...p, [it.m.pid]: it.match }));
    window.setTimeout(() => {
      const t = taRef.current;
      if (t) {
        t.focus();
        t.setSelectionRange(pos, pos);
        grow(t);
      }
    }, 0);
  };

  const onInput = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const v = e.target.value;
    grow(e.target);
    setDraft(v);
    syncLine(v, true);
  };
  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.key === "ArrowDown" || e.key === "ArrowUp") && flat.length) {
      e.preventDefault();
      const d = e.key === "ArrowDown" ? 1 : -1;
      setActive(act < 0 ? (d > 0 ? 0 : flat.length - 1) : (act + d + flat.length) % flat.length);
      return;
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (act >= 0 && flat[act]) pick(flat[act]);
      else submit(e.currentTarget.value);
    }
  };
  const onCaret = (e: KeyboardEvent<HTMLTextAreaElement> | ReactMouseEvent<HTMLTextAreaElement>) => {
    if ("key" in e && /^Arrow(Up|Down)$/.test(e.key) && flat.length) return;
    syncLine(e.currentTarget.value, false);
  };
  const clearText = () => {
    window.clearTimeout(debT.current);
    setDraft("");
    setCur("");
    setQ("");
    setActive(-1);
    setPicks({});
    window.setTimeout(() => {
      const t = taRef.current;
      if (t) {
        t.focus();
        grow(t);
      }
    }, 0);
  };

  const placeholder = toolbar === "A" ? "Search" : pii ? "Search name or ID" : "Search patient ID";
  const appliedText = applied ? applied.terms.join("; ") : "";

  let flatI = -1;
  return (
    <div ref={wrapRef} className={cx(styles.search, applied ? styles.searchApplied : toolbar === "A" ? styles.searchA : styles.searchB)}>
      {applied ? (
        <div
          ref={fieldRef}
          role="button"
          tabIndex={0}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-label={`Search: ${appliedText}`}
          className={cx(styles.searchField, styles.searchFieldApplied)}
          onClick={openSearch}
          onKeyDown={(e) => {
            if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) {
              e.preventDefault();
              openSearch();
            }
          }}
        >
          <Search size={20} strokeWidth={1.67} className={styles.searchIcon} aria-hidden="true" />
          <span className={styles.searchText}>{appliedText}</span>
          <button
            type="button"
            className={styles.iconBtn}
            aria-label="Clear search"
            onClick={(e) => {
              e.stopPropagation();
              onApply(null);
              setDraft("");
              setCur("");
              setQ("");
              setPicks({});
            }}
          >
            <X size={16} strokeWidth={1.67} aria-hidden="true" />
          </button>
        </div>
      ) : (
        <div
          ref={fieldRef}
          role="button"
          tabIndex={0}
          aria-haspopup="dialog"
          aria-expanded={open}
          className={styles.searchField}
          onClick={openSearch}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              openSearch();
            }
          }}
        >
          <Search size={20} strokeWidth={1.67} className={styles.searchIcon} aria-hidden="true" />
          <span className={styles.searchPlaceholder}>{placeholder}</span>
        </div>
      )}

      {mounted ? (
        <div role="dialog" aria-label="Search patients" className={cx(styles.searchPop, open ? styles.dropIn : styles.dropOut)}>
          <div className={cx(styles.searchInputRow, draft.includes("\n") && styles.searchInputRowMulti)}>
            <textarea
              ref={taRef}
              rows={1}
              value={draft}
              onChange={onInput}
              onKeyDown={onKeyDown}
              onKeyUp={onCaret}
              onClick={onCaret}
              placeholder={placeholder}
              aria-label="Search terms, one per line"
              spellCheck={false}
              className={styles.searchTa}
            />
            <button type="button" className={cx(styles.iconBtn, styles.iconBtn36)} aria-label="Clear" onClick={clearText}>
              <X size={20} strokeWidth={1.67} aria-hidden="true" />
            </button>
            <span className={styles.searchSep} aria-hidden="true" />
            <button type="button" className={cx(styles.iconBtn, styles.iconBtn36)} aria-label="Search" onClick={() => submit(draft)}>
              <Search size={20} strokeWidth={1.67} aria-hidden="true" />
            </button>
          </div>

          <div className={styles.searchBy}>
            <span className={styles.overline}>Search by</span>
            {PHI_SEARCH_BY.map(([k, label]) => {
              const locked = !pii && (k === "name" || k === "dob");
              const sel = !locked && by === k;
              const pill = (
                <button
                  key={k}
                  type="button"
                  className={cx(styles.qpill, styles.qpillGap)}
                  aria-pressed={sel}
                  aria-disabled={locked || undefined}
                  onClick={() => {
                    if (locked) return;
                    setBy(k);
                    setActive(-1);
                    taRef.current?.focus();
                  }}
                >
                  {locked ? <Lock size={12} strokeWidth={1.67} aria-hidden="true" /> : null}
                  {label}
                </button>
              );
              return locked ? (
                <Tooltip key={k} label={LOCK_TIP} appearance="light">
                  {pill}
                </Tooltip>
              ) : (
                pill
              );
            })}
          </div>

          {helper ? (
            <>
              <div className={styles.hr} />
              <div className={styles.searchHelp}>
                <p>Search for multiple patients by entering one per line, or separated by a semi-colon (;).</p>
                <p>
                  Press <b>Shift + Enter</b> to enter a new line.
                </p>
                {pii ? (
                  <>
                    <p>
                      <b>Supported fields:</b> Sample ID, Patient ID, Labmatrix Subject ID, Public Patient ID, Manifest Name, patient name and
                      date of birth.
                    </p>
                    <p>Names match any part of the first or last name, in any order (di digg finds Dina Diggle).</p>
                  </>
                ) : (
                  <>
                    <p>
                      <b>Supported fields:</b> Sample ID, Patient ID, Labmatrix Subject ID, Public Patient ID and Manifest Name.
                    </p>
                    <p>Name and date of birth search need PHI access.</p>
                  </>
                )}
              </div>
            </>
          ) : null}

          {ready ? (
            <>
              <div className={styles.hr} />
              <div role="listbox" aria-label="Suggestions" className={styles.searchResults}>
                {PHI_GROUPS.filter(([k]) => results[k].length).map(([k, label]) => (
                  <div key={k} role="group" aria-label={label} className={styles.resultGroup}>
                    <div className={styles.resultGroupHead}>
                      <span className={styles.overline}>{label}</span>
                      <span className={styles.countPill}>{results[k].length}</span>
                    </div>
                    {results[k].map((it) => {
                      flatI += 1;
                      const i = flatI;
                      return (
                        <div
                          key={it.m.pid}
                          role="option"
                          aria-selected={i === act}
                          className={cx(styles.resultRow, i === act && styles.resultRowActive)}
                          onMouseEnter={() => setActive(i)}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => pick(it)}
                        >
                          <PhiSuggestion m={it.m} match={it.match} ctx={ctx} />
                        </div>
                      );
                    })}
                  </div>
                ))}
                {flat.length === 0 ? (
                  <div className={styles.searchEmpty}>
                    <span className={styles.searchEmptyTitle}>{pii ? `No patients match “${qT}”` : `No patient ID matches “${qT}”`}</span>
                    <span className={styles.searchEmptyHelp}>
                      {pii ? "Check the spelling, or try part of the patient ID." : "Try part of a patient ID, e.g. “zccs92”."}
                    </span>
                  </div>
                ) : null}
                {pii && hasPatientGrants && by !== "id" ? (
                  <div className={styles.note}>
                    <Info size={16} strokeWidth={1.67} aria-hidden="true" />
                    <span>Name and date of birth search covers patients in your studies. Patients shared with you individually can be found by patient ID.</span>
                  </div>
                ) : null}
                {!pii && flat.length === 0 ? (
                  <div className={styles.note}>
                    <Lock size={16} strokeWidth={1.67} aria-hidden="true" />
                    <span>Name and date-of-birth search need PHI access. You can search by patient ID.</span>
                  </div>
                ) : null}
              </div>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
