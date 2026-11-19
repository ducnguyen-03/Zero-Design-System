import { Children, useId, useState } from "react";
import type { DetailsHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { ChevronRight, Send } from "lucide-react";
import { StatusBadge } from "../Badge/Badge";
import type { BadgeVariant } from "../Badge/Badge";
import { Checkbox } from "../Checkbox/Checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "../Table/Table";
import styles from "./TrialMatch.module.css";

const cx = (...parts: Array<string | false | undefined>) => parts.filter(Boolean).join(" ");

/* ─────────────────────────── Criterion reading ─────────────────────────── */

/** How a criterion reads against the case card (TrialGPT labels). */
export type CriterionReadingValue = "met" | "not_met" | "insufficient_info" | "not_applicable";

export type CriterionType = "inclusion" | "exclusion";

/* Colour follows the consequence, not the word: an exclusion criterion that is "met" rules the trial out. */
const READING: Record<CriterionType, Record<CriterionReadingValue, { label: string; variant: BadgeVariant }>> = {
  inclusion: {
    met: { label: "Met", variant: "success" },
    not_met: { label: "Not met", variant: "danger" },
    insufficient_info: { label: "Insufficient info", variant: "warning" },
    not_applicable: { label: "Not applicable", variant: "neutral" },
  },
  exclusion: {
    met: { label: "Applies", variant: "danger" },
    not_met: { label: "Does not apply", variant: "success" },
    insufficient_info: { label: "Insufficient info", variant: "warning" },
    not_applicable: { label: "Not applicable", variant: "neutral" },
  },
};

/** Whether a reading rules the trial out. */
export function rulesOut(type: CriterionType, reading: CriterionReadingValue) {
  return type === "exclusion" ? reading === "met" : reading === "not_met";
}

export interface CriterionReadingProps extends HTMLAttributes<HTMLSpanElement> {
  reading: CriterionReadingValue;
  /** Default `inclusion`. For exclusion criteria "met" reads "Applies" (red), "not met" reads "Does not apply" (green). */
  type?: CriterionType;
}

/** One criterion's reading as a DS `StatusBadge`, coloured by what it means for eligibility. */
export function CriterionReading({ reading, type = "inclusion", ...rest }: CriterionReadingProps) {
  const r = READING[type][reading];
  return (
    <StatusBadge variant={r.variant} {...rest}>
      {r.label}
    </StatusBadge>
  );
}

/* ─────────────────────────── Criterion table ─────────────────────────── */

export interface TrialCriterion {
  /** "I3", "E1". */
  id: string;
  /** Default: inferred from the id ("E…" = exclusion). */
  type?: CriterionType;
  text: ReactNode;
  /** Cohorts the criterion applies to. */
  cohorts?: string[];
  reading: CriterionReadingValue;
  /** Why it reads that way. */
  why: ReactNode;
  /** Case-card fields the reading cited. */
  evidence?: string[];
}

export interface CriterionTableProps extends HTMLAttributes<HTMLDivElement> {
  criteria: TrialCriterion[];
  /** Under the table, e.g. "Readings unverified · ClinicalTrials.gov 7 oct 2026 · model". */
  footnote?: ReactNode;
  /** Show this many rows, then a "Show all" button. Default: all. Criteria that rule the trial out are always shown. */
  initialCount?: number;
}

/** Every eligibility criterion, how it reads against the case, why, and which case-card fields it used. */
export function CriterionTable({ criteria, footnote, initialCount, className, ...rest }: CriterionTableProps) {
  const [all, setAll] = useState(false);
  const limited = !all && initialCount !== undefined && criteria.length > initialCount;
  const typeOf = (c: TrialCriterion): CriterionType => c.type ?? (/^E/i.test(c.id) ? "exclusion" : "inclusion");
  const shown = limited ? criteria.filter((c, i) => i < initialCount || rulesOut(typeOf(c), c.reading)) : criteria;
  return (
    <div className={cx(styles.criteria, className)} {...rest}>
      <div className={styles.scroll}>
        <Table caption="Eligibility criteria" captionHidden className={styles.compact}>
          <TableHead>
            <TableRow>
              <TableHeaderCell>ID</TableHeaderCell>
              <TableHeaderCell>Criterion</TableHeaderCell>
              <TableHeaderCell>Reading</TableHeaderCell>
              <TableHeaderCell>Why</TableHeaderCell>
              <TableHeaderCell>Evidence</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {shown.map((c) => (
              <TableRow key={c.id} data-rules-out={rulesOut(typeOf(c), c.reading) || undefined}>
                <TableCell>
                  <code className={styles.mono}>{c.id}</code>
                </TableCell>
                <TableCell className={styles.criterionText} data-label="Criterion">
                  {c.text}
                  {c.cohorts?.length ? <span className={styles.sub}>Cohort: {c.cohorts.join("; ")}</span> : null}
                </TableCell>
                <TableCell>
                  <CriterionReading reading={c.reading} type={typeOf(c)} />
                </TableCell>
                <TableCell className={styles.why} data-label="Why">
                  {c.why}
                </TableCell>
                <TableCell data-label="Evidence">
                  <code className={cx(styles.mono, styles.evidence)}>{c.evidence?.join(", ") || "—"}</code>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {limited || footnote ? (
        <div className={styles.criteriaFoot}>
          {limited ? (
            <button type="button" className={styles.more} onClick={() => setAll(true)}>
              Show all {criteria.length} criteria
            </button>
          ) : null}
          {footnote ? <p className={styles.footnote}>{footnote}</p> : null}
        </div>
      ) : null}
    </div>
  );
}

/* ─────────────────────────── Trial card ─────────────────────────── */

export interface TrialCardProps extends Omit<DetailsHTMLAttributes<HTMLDetailsElement>, "title"> {
  rank: number;
  title: ReactNode;
  /** "NCT05580562". */
  nct: string;
  /** "Phase 3". */
  phase?: ReactNode;
  /** Inclusion criteria met, e.g. "7 of 12". */
  inclusion?: ReactNode;
  /** How the trial matches the case's molecular findings. `direct` = the drug targets the alteration. */
  match?: "direct" | "none";
  /** Override the match label, e.g. "Direct target · ONC201". */
  matchLabel?: ReactNode;
  /** Criteria the case card could not answer. */
  unknown?: number;
  /** The trial in focus — ink edge, opens by default. */
  focus?: boolean;
  /** Expanded content, usually a `CriterionTable`. Without it the card does not expand. */
  children?: ReactNode;
}

/** One ranked trial: rank, title, registry line, molecular match and unknowns; opens to its criteria. */
export function TrialCard({
  rank,
  title,
  nct,
  phase,
  inclusion,
  match = "none",
  matchLabel,
  unknown,
  focus = false,
  children,
  open,
  className,
  ...rest
}: TrialCardProps) {
  const head = (
    <>
      <span className={styles.rank} aria-label={`Rank ${rank}`}>
        {rank}
      </span>
      <span className={styles.trialMain}>
        <span className={styles.trialTitle}>{title}</span>
        <span className={styles.trialMeta}>
          <code className={styles.mono}>{nct}</code>
          {phase ? <span>{phase}</span> : null}
          {inclusion ? <span>{inclusion} inclusion met</span> : null}
        </span>
      </span>
      <span className={styles.trialSide}>
        <StatusBadge variant={match === "direct" ? "secondary" : "neutral"}>
          {matchLabel ?? (match === "direct" ? "Direct target" : "No molecular match")}
        </StatusBadge>
        {unknown !== undefined ? <span className={styles.unknown}>{unknown} unknown</span> : null}
      </span>
    </>
  );
  if (!children) {
    return (
      <div className={cx(styles.trial, focus && styles.focus, className)}>
        <div className={styles.trialHead}>{head}</div>
      </div>
    );
  }
  return (
    <details className={cx(styles.trial, focus && styles.focus, className)} open={open ?? focus} {...rest}>
      <summary className={styles.trialHead}>
        <ChevronRight className={styles.chevron} aria-hidden="true" />
        {head}
      </summary>
      <div className={styles.trialBody}>{children}</div>
    </details>
  );
}

export interface TrialListProps extends HTMLAttributes<HTMLOListElement> {
  children: ReactNode;
}

/** Ranked trials, in order. */
export function TrialList({ className, children, ...rest }: TrialListProps) {
  return (
    <ol className={cx(styles.trials, className)} {...rest}>
      {Children.toArray(children).map((c, i) => (
        <li key={i}>{c}</li>
      ))}
    </ol>
  );
}

/* ─────────────────────────── Excluded trials ─────────────────────────── */

export interface ExcludedTrial {
  nct: string;
  title: ReactNode;
  /** The criterion that failed and why. */
  reason: ReactNode;
}

export interface ExcludedTrialsProps extends DetailsHTMLAttributes<HTMLDetailsElement> {
  items: ExcludedTrial[];
}

/** Trials ruled out, each with the criterion that ruled it out — collapsed, but never hidden. */
export function ExcludedTrials({ items, className, ...rest }: ExcludedTrialsProps) {
  return (
    <details className={cx(styles.disclosure, className)} {...rest}>
      <summary className={styles.disclosureHead}>
        <ChevronRight className={styles.chevron} aria-hidden="true" />
        Excluded ({items.length}) and why
      </summary>
      <ul className={styles.excluded}>
        {items.map((x) => (
          <li key={x.nct} className={styles.excludedItem}>
            <span>
              <code className={styles.mono}>{x.nct}</code> {x.title}
            </span>
            <span className={styles.sub}>{x.reason}</span>
          </li>
        ))}
      </ul>
    </details>
  );
}

/* ─────────────────────────── Scenario table (now vs at relapse) ─────────────────────────── */

export type TrialState = "ranked" | "excluded" | "closes" | "opens" | "still-open";

const STATE: Record<TrialState, { label: string; variant: BadgeVariant }> = {
  ranked: { label: "Ranked", variant: "success" },
  excluded: { label: "Excluded", variant: "neutral" },
  closes: { label: "Closes", variant: "danger" },
  opens: { label: "Opens", variant: "primary" },
  "still-open": { label: "Still open", variant: "success" },
};

export interface ScenarioRow {
  nct: string;
  title: ReactNode;
  now: TrialState;
  then: TrialState;
  why: ReactNode;
}

export interface ScenarioTableProps extends HTMLAttributes<HTMLDivElement> {
  rows: ScenarioRow[];
  /** Column labels. Default "Now" / "At relapse". */
  nowLabel?: string;
  thenLabel?: string;
}

/** How each trial's standing changes under a hypothetical scenario — what closes, what opens, and why. */
export function ScenarioTable({ rows, nowLabel = "Now", thenLabel = "At relapse", className, ...rest }: ScenarioTableProps) {
  return (
    <div className={cx(styles.scroll, styles.scenario, className)} {...rest}>
      <Table caption={`${nowLabel} and ${thenLabel.toLowerCase()}`} captionHidden className={styles.compact}>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Trial</TableHeaderCell>
            <TableHeaderCell>{nowLabel}</TableHeaderCell>
            <TableHeaderCell>{thenLabel}</TableHeaderCell>
            <TableHeaderCell>Why</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.nct}>
              <TableCell className={styles.criterionText}>
                <code className={styles.mono}>{r.nct}</code>
                <span className={styles.sub}>{r.title}</span>
              </TableCell>
              <TableCell data-label={nowLabel}>
                <StatusBadge variant={STATE[r.now].variant}>{STATE[r.now].label}</StatusBadge>
              </TableCell>
              <TableCell data-label={thenLabel}>
                <StatusBadge variant={STATE[r.then].variant}>{STATE[r.then].label}</StatusBadge>
              </TableCell>
              <TableCell className={styles.why}>{r.why}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

/* ─────────────────────────── Report excerpt (MTB summary) ─────────────────────────── */

export interface ReportExcerptProps extends HTMLAttributes<HTMLDivElement> {
  /** The paragraph that goes into the report. */
  children: ReactNode;
  /** Let the reader edit the paragraph in place. */
  editable?: boolean;
  /** Stated assumptions, under the paragraph. */
  assumption?: ReactNode;
  /** Numbered references, collapsed. */
  references?: ReactNode[];
}

/** A paragraph written for a report (MTB trial summary): editable, with its assumption and references. */
export function ReportExcerpt({ children, editable = false, assumption, references, className, ...rest }: ReportExcerptProps) {
  return (
    <div className={cx(styles.report, className)} {...rest}>
      <div
        className={styles.reportText}
        contentEditable={editable || undefined}
        suppressContentEditableWarning
        role={editable ? "textbox" : undefined}
        aria-multiline={editable || undefined}
        aria-label={editable ? "Report paragraph" : undefined}
      >
        {children}
      </div>
      {assumption ? <p className={styles.footnote}>{assumption}</p> : null}
      {references?.length ? (
        <details className={styles.disclosure}>
          <summary className={styles.disclosureHead}>
            <ChevronRight className={styles.chevron} aria-hidden="true" />
            References ({references.length})
          </summary>
          <ol className={styles.refs}>
            {references.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ol>
        </details>
      ) : null}
    </div>
  );
}

/* ─────────────────────────── Recipient picker ─────────────────────────── */

export interface SiteRecipient {
  id: string;
  facility: string;
  city?: string;
  /** Who the draft goes to. Omit when the registry lists nobody with an email. */
  recipient?: { name?: string; email: string; role?: "site contact" | "PI" | "central contact" };
  /** Why there is no recipient, e.g. "Phone only — no email listed". */
  note?: ReactNode;
}

export interface RecipientPickerProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  sites: SiteRecipient[];
  value: string[];
  onChange: (ids: string[]) => void;
  /** How many sites can be chosen. Default 2. */
  max?: number;
  /** The user's question, shown under the list. */
  question?: ReactNode;
}

/** Pick the site(s) to write to. The recipient comes from the registry; sites with no email cannot be picked. */
export function RecipientPicker({ sites, value, onChange, max = 2, question, className, ...rest }: RecipientPickerProps) {
  const full = value.length >= max;
  const qId = useId();
  return (
    <div className={cx(styles.picker, className)} {...rest}>
      <ul className={styles.sites} aria-label={`Sites — choose up to ${max}`}>
        {sites.map((s) => {
          const on = value.includes(s.id);
          const disabled = !s.recipient || (full && !on);
          return (
            <li key={s.id} className={cx(styles.site, on && styles.siteOn, !s.recipient && styles.siteNone)}>
              <Checkbox
                checked={on}
                disabled={disabled}
                onChange={() => onChange(on ? value.filter((v) => v !== s.id) : [...value, s.id])}
                label={
                  <span className={styles.siteText}>
                    <span>
                      <span className={styles.facility}>{s.facility}</span>
                      {s.city ? <span className={styles.city}> · {s.city}</span> : null}
                    </span>
                    <span className={styles.to}>
                      {s.recipient ? (
                        <>
                          To {s.recipient.name ?? "site contact"} &lt;{s.recipient.email}&gt;
                          {s.recipient.role === "central contact" ? " · central contact" : ""}
                        </>
                      ) : (
                        s.note ?? "No email listed"
                      )}
                    </span>
                  </span>
                }
              />
            </li>
          );
        })}
      </ul>
      {question ? (
        <div className={styles.question} aria-labelledby={qId} role="group">
          <span id={qId} className={styles.questionLabel}>
            Your question
          </span>
          <p>{question}</p>
        </div>
      ) : null}
    </div>
  );
}

/* ─────────────────────────── Draft email ─────────────────────────── */

export interface DraftEmailProps extends HTMLAttributes<HTMLDivElement> {
  to: ReactNode;
  subject: ReactNode;
  /** Facts-check flags. Empty = nothing to flag. */
  flags?: ReactNode[];
  /** Plain-text body. Lines quoting a criterion or an automated reading are set apart. */
  body: string;
  /** The previous draft's body — lines new in this draft are marked. */
  previousBody?: string;
  /** Banner above the email. Pass `null` to drop it. */
  notice?: ReactNode;
}

/** An email draft the agent cannot send: headers, body with quoted criteria set apart, and what changed. */
export function DraftEmail({
  to,
  subject,
  flags = [],
  body,
  previousBody,
  notice = "PedTrial cannot send email. Review it here, download it, and send it yourself.",
  className,
  ...rest
}: DraftEmailProps) {
  const before = previousBody ? new Set(previousBody.split("\n")) : null;
  return (
    <div className={cx(styles.email, className)} {...rest}>
      {notice ? (
        <p className={styles.emailNotice}>
          <Send aria-hidden="true" />
          <span>
            <b>Draft only.</b> {notice}
          </span>
        </p>
      ) : null}
      <dl className={styles.emailHead}>
        <dt>To</dt>
        <dd>{to}</dd>
        <dt>Subject</dt>
        <dd>{subject}</dd>
        <dt>Flags</dt>
        <dd>{flags.length ? flags.map((f, i) => <span key={i}>{f}</span>) : "—"}</dd>
      </dl>
      <div className={styles.emailBody}>
        {body.split("\n").map((line, i) => {
          const kind = /^\s+Relevant criterion/.test(line) ? styles.lineCriterion : /^\s+Our automated reading/.test(line) ? styles.lineReading : undefined;
          const added = Boolean(before && line.trim() && !before.has(line)) && /^(\d+\.|\s+(Relevant|Our))/.test(line);
          return (
            <span key={i} className={cx(styles.line, kind, added && styles.lineAdded)}>
              {added ? <span className={styles.srOnly}>New in this draft: </span> : null}
              {line.trim() ? line.trimStart() : " "}
            </span>
          );
        })}
      </div>
    </div>
  );
}
