import { Fragment, useMemo } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { CircleAlert, CircleCheck } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "../Table/Table";
import styles from "./Intake.module.css";

const cx = (...parts: Array<string | false | undefined>) => parts.filter(Boolean).join(" ");

/* ─────────────────────────── Highlighted text ─────────────────────────── */

export interface HighlightedTextProps extends HTMLAttributes<HTMLSpanElement> {
  text: string;
  /** Phrases to mark — e.g. the case-card phrases, so the user sees which of their words became data. */
  phrases?: string[];
}

/** The user's own words with the phrases an agent used marked in place. Longest phrase wins; case-insensitive. */
export function HighlightedText({ text, phrases = [], className, ...rest }: HighlightedTextProps) {
  const parts = useMemo(() => {
    const unique = [...new Set(phrases.filter(Boolean))].sort((a, b) => b.length - a.length);
    if (!unique.length) return [text];
    const re = new RegExp(`(${unique.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi");
    return text.split(re);
  }, [text, phrases]);
  return (
    <span className={cx(styles.highlighted, className)} {...rest}>
      {parts.map((p, i) =>
        // split() with one capture group puts every match at an odd index.
        i % 2 === 1 ? (
          <mark key={i} className={styles.mark}>
            {p}
          </mark>
        ) : (
          <Fragment key={i}>{p}</Fragment>
        ),
      )}
    </span>
  );
}

/* ─────────────────────────── Provenance table (case card) ─────────────────────────── */

export interface ProvenanceRow {
  /** Structured field, e.g. "disease_status.status". */
  field: string;
  value: ReactNode;
  /** The words it came from, verbatim. */
  phrase: string;
}

export interface ProvenanceTableProps extends HTMLAttributes<HTMLDivElement> {
  rows: ProvenanceRow[];
  /** Accessible caption. Default "Case card". */
  caption?: string;
  /** Header of the source column. Default "From your words". */
  sourceLabel?: string;
}

/** Let dotted / snake_case paths wrap after a separator, never inside a word. */
function breakable(path: string) {
  return path.split(/(?<=[._])/).map((part, i) => (
    <Fragment key={i}>
      {i > 0 ? <wbr /> : null}
      {part}
    </Fragment>
  ));
}

/** Field · value · the phrase it came from. Anything not backed by the user's words never reaches this table. */
export function ProvenanceTable({
  rows,
  caption = "Case card",
  sourceLabel = "From your words",
  className,
  ...rest
}: ProvenanceTableProps) {
  return (
    <div className={cx(styles.scroll, className)} {...rest}>
      <Table caption={caption} captionHidden className={styles.compact}>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Field</TableHeaderCell>
            <TableHeaderCell>Value</TableHeaderCell>
            <TableHeaderCell>{sourceLabel}</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.field}>
              <TableCell>
                <code className={styles.field}>{breakable(r.field)}</code>
              </TableCell>
              <TableCell>{r.value}</TableCell>
              <TableCell>
                <q className={styles.phrase}>{r.phrase}</q>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

/* ─────────────────────────── Missing facts ─────────────────────────── */

export interface MissingFactsProps extends HTMLAttributes<HTMLDivElement> {
  /** Field names the agent needs and could not find, e.g. ["age_years"]. */
  fields: string[];
  /** What would help but is not required. */
  optional?: ReactNode;
  /** Lead sentence. Default explains that the agent asks rather than guesses. */
  children?: ReactNode;
}

/** Key facts the agent will not guess: an empty slot per field, waiting on the user. */
export function MissingFacts({ fields, optional, children, className, ...rest }: MissingFactsProps) {
  return (
    <div className={cx(styles.missing, className)} {...rest}>
      {children ? <p className={styles.lead}>{children}</p> : null}
      <ul className={styles.slots} aria-label="Missing facts">
        {fields.map((f) => (
          <li key={f} className={styles.slot}>
            <code className={styles.slotField}>{f}</code>
            <span className={styles.slotEmpty} aria-label="not provided">
              —
            </span>
          </li>
        ))}
      </ul>
      {optional ? (
        <p className={styles.optional}>
          <span className={styles.optionalLabel}>Optional</span> {optional}
        </p>
      ) : null}
    </div>
  );
}

/* ─────────────────────────── Claims (under an agent card) ─────────────────────────── */

export interface ClaimItem {
  text: ReactNode;
  /** How far the claim has been checked: "unverified", "no ground truth"… */
  tag: ReactNode;
}

export interface ClaimListProps extends HTMLAttributes<HTMLUListElement> {
  items: ClaimItem[];
}

/** Headline claims from a run, each wearing how far it has been checked — so nothing reads as settled that is not. */
export function ClaimList({ items, className, ...rest }: ClaimListProps) {
  return (
    <ul className={cx(styles.claims, className)} {...rest}>
      {items.map((c, i) => (
        <li key={i} className={styles.claim}>
          <span className={styles.claimText}>{c.text}</span>
          <span className={styles.claimTag}>{c.tag}</span>
        </li>
      ))}
    </ul>
  );
}

/* ─────────────────────────── Guardrails ─────────────────────────── */

export interface GuardrailItem {
  /** `true` = a guarantee the agent keeps; `false` = a known limit. */
  holds: boolean;
  text: ReactNode;
}

export interface GuardrailListProps extends HTMLAttributes<HTMLDivElement> {
  items: GuardrailItem[];
}

/** What an agent guarantees, then what it does not — limits listed as plainly as the guarantees. */
export function GuardrailList({ items, className, ...rest }: GuardrailListProps) {
  const holds = items.filter((i) => i.holds);
  const limits = items.filter((i) => !i.holds);
  return (
    <div className={cx(styles.guardrails, className)} {...rest}>
      {[
        { key: "holds", label: "Guarantees", list: holds, icon: <CircleCheck /> },
        { key: "limits", label: "Known limits", list: limits, icon: <CircleAlert /> },
      ]
        .filter((g) => g.list.length)
        .map((g) => (
          <ul key={g.key} className={cx(styles.guards, g.key === "limits" && styles.limits)} aria-label={g.label}>
            {g.list.map((item, i) => (
              <li key={i} className={styles.guard}>
                <span className={styles.guardIcon} aria-hidden="true">
                  {g.icon}
                </span>
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
        ))}
    </div>
  );
}
