import { useId } from "react";
import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { ArrowRight, CircleCheck, CircleMinus, Info, MessageSquareQuote, OctagonAlert, TriangleAlert } from "lucide-react";
import { StatusBadge } from "../Badge/Badge";
import type { BadgeVariant } from "../Badge/Badge";
import { Chip } from "../Chip/Chip";
import styles from "./Classifier.module.css";

const cx = (...parts: Array<string | false | undefined>) => parts.filter(Boolean).join(" ");

/* ─────────────────────────── Question ─────────────────────────── */

export interface CanvasQuestionProps extends HTMLAttributes<HTMLElement> {
  /** The researcher's question, verbatim. */
  children: ReactNode;
  /** Right-aligned trace, e.g. "Turns 4–5 · classifier tooling, taxonomy tooling". */
  meta?: ReactNode;
  /** Where the input came from, e.g. "Patient set from turn 3: AML with monosomy 7 …". */
  context?: ReactNode;
}

/** "Researcher asked" — keeps the question pinned above the answer it produced. */
export function CanvasQuestion({ children, meta, context, className, ...rest }: CanvasQuestionProps) {
  return (
    <section className={cx(styles.question, className)} aria-label="Researcher asked" {...rest}>
      <MessageSquareQuote className={styles.questionIcon} aria-hidden="true" />
      <div className={styles.questionBody}>
        <div className={styles.questionRow}>
          <span className={styles.eyebrow}>Researcher asked</span>
          {meta ? <span className={styles.questionMeta}>{meta}</span> : null}
        </div>
        <blockquote className={styles.questionText}>{children}</blockquote>
        {context ? <p className={styles.questionContext}>{context}</p> : null}
      </div>
    </section>
  );
}

/* ─────────────────────────── Verdict ─────────────────────────── */

export interface CanvasVerdictProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  /** Status tag (DS `StatusBadge`). Default "Provisional" — classifier output never reads as a diagnosis. */
  status?: ReactNode;
  /** Badge colour. Default `warning`: provisional, pending review. */
  statusVariant?: BadgeVariant;
  /** Line after the tag, e.g. "WHO-HAEM5 entity, mapped from the classifier result". */
  statusNote?: ReactNode;
  /** The answer, e.g. the mapped entity or "4 of 5 patients classified". */
  title: ReactNode;
  /** Taxonomy path; the last step is emphasised. */
  path?: ReactNode[];
  /** Identifier chips — sample ids, model versions. Use `CanvasIdTag`. */
  tags?: ReactNode;
  /** Buttons, e.g. "View WHO-HAEM5 criteria", "Add to report". */
  actions?: ReactNode;
}

/** The answer block: provisional tag, headline, taxonomy path, identifiers and actions. */
export function CanvasVerdict({
  status = "Provisional",
  statusVariant = "warning",
  statusNote,
  title,
  path,
  tags,
  actions,
  className,
  ...rest
}: CanvasVerdictProps) {
  return (
    <header className={cx(styles.verdict, className)} {...rest}>
      <div className={styles.verdictMain}>
        <p className={styles.statusLine}>
          <StatusBadge variant={statusVariant}>{status}</StatusBadge>
          {statusNote ? <span className={styles.statusNote}>{statusNote}</span> : null}
        </p>
        <h1 className={styles.verdictTitle}>{title}</h1>
        {path && path.length > 0 ? (
          <ol className={styles.path} aria-label="Taxonomy path">
            {path.map((step, i) => (
              <li key={i} aria-current={i === path.length - 1 ? "location" : undefined}>
                {step}
              </li>
            ))}
          </ol>
        ) : null}
        {tags ? <div className={styles.tags}>{tags}</div> : null}
      </div>
      {actions ? <div className={styles.verdictActions}>{actions}</div> : null}
    </header>
  );
}

export interface CanvasIdTagProps extends Omit<HTMLAttributes<HTMLSpanElement>, "color"> {
  /** e.g. "Methylation sample". */
  label: ReactNode;
  /** The id itself, set in mono. */
  children: ReactNode;
}

/** Label + mono identifier, for sample ids and model versions — a small soft DS `Chip`. */
export function CanvasIdTag({ label, children, className, ...rest }: CanvasIdTagProps) {
  return (
    <Chip size="sm" radius="soft" className={cx(styles.idTag, className)} {...rest}>
      {label} <code>{children}</code>
    </Chip>
  );
}

/* ─────────────────────────── Agreement ─────────────────────────── */

export type AgreementStatus = "same" | "mapped" | "disagrees" | "blocked" | "unavailable";

const AGREEMENT: Record<AgreementStatus, { icon: ReactNode; text: string }> = {
  same: { icon: <CircleCheck />, text: "Same class" },
  mapped: { icon: <CircleCheck />, text: "Same entity (after mapping)" },
  disagrees: { icon: <TriangleAlert />, text: "Disagrees" },
  blocked: { icon: <OctagonAlert />, text: "Blocked" },
  unavailable: { icon: <CircleMinus />, text: "Not available" },
};

export interface AgreementLabelProps extends HTMLAttributes<HTMLSpanElement> {
  status: AgreementStatus;
  /** Overrides the default wording. */
  children?: ReactNode;
}

/** Icon + words — status is never colour alone. */
export function AgreementLabel({ status, children, className, ...rest }: AgreementLabelProps) {
  return (
    <span className={cx(styles.agreement, styles[`agree-${status}`], className)} {...rest}>
      <span className={styles.agreementIcon} aria-hidden="true">
        {AGREEMENT[status].icon}
      </span>
      {children ?? AGREEMENT[status].text}
    </span>
  );
}

/* ─────────────────────────── Probability ─────────────────────────── */

export interface ProbabilityBarProps extends HTMLAttributes<HTMLDivElement> {
  /** 0–1 probability, or a count when `max` is set. */
  value: number;
  max?: number;
  /** Low-confidence threshold (0–1): values below it are flagged and a tick marks the line. */
  threshold?: number;
  /** `brand` for the leading call, `neutral` for alternatives, `muted` for "not classified". */
  tone?: "brand" | "neutral" | "muted";
  /** Value text; defaults to two decimals. Pass `null` to hide it. */
  display?: ReactNode | null;
  /** Fill colour override — e.g. the class colour from the UMAP, so a bar and its cluster read as one. */
  color?: string;
}

/** 6px track + value. Below threshold the bar turns amber and says so. */
export function ProbabilityBar({
  value,
  max = 1,
  threshold,
  tone = "brand",
  display,
  color,
  className,
  style,
  ...rest
}: ProbabilityBarProps) {
  const pct = Math.max(0, Math.min(1, value / max)) * 100;
  const low = threshold !== undefined && value / max < threshold;
  return (
    <div
      className={cx(styles.prob, styles[`prob-${tone}`], low && styles.probLow, className)}
      style={
        {
          "--prob": `${pct}%`,
          "--threshold": threshold !== undefined ? `${threshold * 100}%` : undefined,
          ...(color && !low ? { "--prob-fill": color } : null),
          ...style,
        } as CSSProperties
      }
      {...rest}
    >
      <span className={styles.probTrack} aria-hidden="true">
        <span className={styles.probFill} />
        {threshold !== undefined ? <span className={styles.probThreshold} /> : null}
      </span>
      {display === null ? null : (
        <span className={styles.probValue}>
          {display ?? value.toFixed(2)}
          {low ? <span className={styles.srOnly}> (below the low-confidence threshold)</span> : null}
        </span>
      )}
    </div>
  );
}

/* ─────────────────────────── By taxonomy level ─────────────────────────── */

export interface ClassifierCall {
  label: ReactNode;
  p: number;
}

export interface ClassifierLevel {
  /** "Level 1" */
  level: ReactNode;
  /** Which classifier answered, e.g. "Haem sub-classifier". */
  classifier?: ReactNode;
  /** One call per modality, in `modalities` order; `null` = not run / not available. */
  calls: Array<ClassifierCall | null>;
  agreement?: AgreementStatus;
}

export interface ClassifierLevelsProps extends HTMLAttributes<HTMLDivElement> {
  /** Column names, e.g. ["Methylation", "Expression"]. */
  modalities: string[];
  levels: ClassifierLevel[];
  threshold?: number;
  /** Table caption for assistive tech. */
  caption?: string;
}

/** "Prediction by taxonomy level": each row is a separate classifier in the hierarchy. */
export function ClassifierLevels({
  modalities,
  levels,
  threshold,
  caption = "Prediction by taxonomy level",
  className,
  ...rest
}: ClassifierLevelsProps) {
  const hasAgreement = levels.some((l) => l.agreement);
  return (
    <div className={cx(styles.levelsWrap, className)} {...rest}>
      <table className={styles.levels}>
        <caption className={styles.srOnly}>{caption}</caption>
        <thead>
          <tr>
            <th scope="col">Level</th>
            {modalities.map((m) => (
              <th scope="col" key={m}>
                {m}
              </th>
            ))}
            {hasAgreement ? <th scope="col">Agreement</th> : null}
          </tr>
        </thead>
        <tbody>
          {levels.map((l, i) => (
            <tr key={i}>
              <th scope="row">
                <span className={styles.levelName}>{l.level}</span>
                {l.classifier ? <span className={styles.levelClassifier}>{l.classifier}</span> : null}
              </th>
              {modalities.map((m, j) => {
                const call = l.calls[j];
                return (
                  <td key={m} data-label={m}>
                    {call ? (
                      <div className={styles.call}>
                        <span className={styles.callLabel}>{call.label}</span>
                        <ProbabilityBar value={call.p} threshold={threshold} />
                      </div>
                    ) : (
                      <span className={styles.callNone}>Not available</span>
                    )}
                  </td>
                );
              })}
              {hasAgreement ? (
                <td data-label="Agreement">{l.agreement ? <AgreementLabel status={l.agreement} /> : null}</td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─────────────────────────── Ranked bars ─────────────────────────── */

export interface RankedBarItem {
  label: ReactNode;
  value: number;
  /** Value text, e.g. "0.84" or "3". */
  display?: ReactNode;
  tone?: "brand" | "neutral" | "muted";
  /** Class colour (matches the UMAP legend). Overrides `tone`. */
  color?: string;
}

export interface RankedBarsProps extends HTMLAttributes<HTMLDivElement> {
  items: RankedBarItem[];
  /** Scale; default the largest value (counts) — pass 1 for probabilities. */
  max?: number;
  threshold?: number;
  /** Note under the list, e.g. the low-confidence rule. */
  footnote?: ReactNode;
}

/** "Top classes at Level 3" / "Mapped WHO-HAEM5 entities": label over bar, value right. */
export function RankedBars({ items, max, threshold, footnote, className, ...rest }: RankedBarsProps) {
  const top = max ?? Math.max(1, ...items.map((i) => i.value));
  return (
    <div className={cx(styles.ranked, className)} {...rest}>
      <ol className={styles.rankedList}>
        {items.map((item, i) => (
          <li key={i} className={styles.rankedItem}>
            <span className={styles.rankedLabel}>{item.label}</span>
            <ProbabilityBar
              value={item.value}
              max={top}
              threshold={threshold}
              tone={item.tone ?? (i === 0 ? "brand" : "neutral")}
              color={item.color}
              display={item.display ?? (max === 1 ? item.value.toFixed(2) : item.value.toLocaleString())}
            />
          </li>
        ))}
      </ol>
      {footnote ? <p className={styles.footnote}>{footnote}</p> : null}
    </div>
  );
}

/* ─────────────────────────── Paired bars by level ─────────────────────────── */

export interface LevelBarsSeries {
  label: string;
  /** Any CSS colour. Defaults: grey-200 for the first series, grey-60 for the second (as in the mockup). */
  color?: string;
}

export interface LevelBarsRow {
  /** "Level 1" */
  level: ReactNode;
  /** The class predicted at this level, e.g. "Haematological malignancy". */
  label: ReactNode;
  /** One value per series; `null` = not available. */
  values: Array<number | null>;
}

export interface LevelBarsProps extends HTMLAttributes<HTMLDivElement> {
  series: LevelBarsSeries[];
  rows: LevelBarsRow[];
  threshold?: number;
}

const SERIES_COLORS = ["var(--insight-color-grey-200)", "var(--insight-color-grey-60)"];

/** "Prediction by taxonomy level" as a chart: one row per level, one bar per modality. */
export function LevelBars({ series, rows, threshold, className, ...rest }: LevelBarsProps) {
  return (
    <div className={cx(styles.levelBars, className)} {...rest}>
      <ul className={styles.seriesKey} aria-label="Series">
        {series.map((s, i) => (
          <li key={s.label}>
            <span className={styles.seriesSwatch} style={{ background: s.color ?? SERIES_COLORS[i] }} aria-hidden="true" />
            {s.label}
          </li>
        ))}
      </ul>
      <ol className={styles.levelBarRows}>
        {rows.map((r, i) => (
          <li key={i} className={styles.levelBarRow}>
            <span className={styles.levelBarHead}>
              <span className={styles.levelName}>{r.level}</span>
              <span className={styles.levelBarLabel}>{r.label}</span>
            </span>
            <span className={styles.levelBarStack}>
              {series.map((s, j) => {
                const v = r.values[j];
                return v == null ? (
                  <span key={s.label} className={styles.callNone}>
                    {s.label}: not available
                  </span>
                ) : (
                  <ProbabilityBar
                    key={s.label}
                    value={v}
                    threshold={threshold}
                    color={s.color ?? SERIES_COLORS[j]}
                    aria-label={`${s.label} ${v.toFixed(2)}`}
                  />
                );
              })}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ─────────────────────────── Reconcile ─────────────────────────── */

export interface ReconcileSource {
  /** Eyebrow, e.g. "Classifier · Level 3, methylation". */
  label: ReactNode;
  value: ReactNode;
  /** Provenance in mono, e.g. "Molecular classifier [MODEL VERSION]". */
  source?: ReactNode;
  /** Extra line, e.g. "Uses WHO revised 4th edition (2016) terminology". */
  note?: ReactNode;
}

export interface SourceReconcileProps extends HTMLAttributes<HTMLDivElement> {
  /** Usually three: classifier → mapped entity ← recorded diagnosis. */
  sources: ReconcileSource[];
  /** Why the sources differ — an `AlertBanner` or a `ConstraintList`. */
  children?: ReactNode;
}

/** "Classifier result vs recorded diagnosis": grounded sources side by side with the step between them. */
export function SourceReconcile({ sources, children, className, ...rest }: SourceReconcileProps) {
  return (
    <div className={cx(styles.reconcile, className)} {...rest}>
      <ol className={styles.sources}>
        {sources.map((s, i) => (
          <li key={i} className={styles.source}>
            {i > 0 ? <ArrowRight className={styles.sourceArrow} aria-hidden="true" /> : null}
            <span className={styles.eyebrow}>{s.label}</span>
            <span className={styles.sourceValue}>{s.value}</span>
            {s.source ? <span className={styles.sourceProv}>{s.source}</span> : null}
            {s.note ? <span className={styles.sourceNote}>{s.note}</span> : null}
          </li>
        ))}
      </ol>
      {children}
    </div>
  );
}

/* ─────────────────────────── Cases & constraints ─────────────────────────── */

export interface CaseMarkerProps extends HTMLAttributes<HTMLSpanElement> {
  /** Ringed when its UMAP marker or table row is under the pointer. */
  active?: boolean;
}

/** "C1" disc that ties a table row to its marker on the UMAP. */
export function CaseMarker({ active = false, className, ...rest }: CaseMarkerProps) {
  return <span className={cx(styles.caseMarker, active && styles.caseMarkerActive, className)} {...rest} />;
}

export interface ConstraintItem {
  kind: "block" | "warning" | "critic";
  /** Assertion id, e.g. "PKB-[ID]". */
  id?: ReactNode;
  text: ReactNode;
  /** Affected cases, e.g. `<CaseMarker>C5</CaseMarker>`. */
  cases?: ReactNode;
}

const CONSTRAINT: Record<ConstraintItem["kind"], { icon: ReactNode; label: string }> = {
  block: { icon: <OctagonAlert />, label: "Block" },
  warning: { icon: <TriangleAlert />, label: "Warning" },
  critic: { icon: <Info />, label: "Critic" },
};

export interface ConstraintListProps extends HTMLAttributes<HTMLUListElement> {
  items: ConstraintItem[];
}

/** Domain assertions evaluated before dispatch — each traceable by id. */
export function ConstraintList({ items, className, ...rest }: ConstraintListProps) {
  return (
    <ul className={cx(styles.constraints, className)} {...rest}>
      {items.map((c, i) => (
        <li key={i} className={cx(styles.constraint, styles[`c-${c.kind}`])}>
          <span className={styles.constraintKind}>
            <span className={styles.constraintIcon} aria-hidden="true">
              {CONSTRAINT[c.kind].icon}
            </span>
            {CONSTRAINT[c.kind].label}
          </span>
          <code className={styles.constraintId}>{c.id ?? "—"}</code>
          <span className={styles.constraintText}>{c.text}</span>
          {c.cases ? <span className={styles.constraintCases}>{c.cases}</span> : null}
        </li>
      ))}
    </ul>
  );
}

/* ─────────────────────────── Sources footer ─────────────────────────── */

export interface CanvasSourcesProps extends HTMLAttributes<HTMLElement> {
  /** e.g. [{ label: "Sources", value: "molecular classifier [MODEL VERSION] · …" }]. */
  rows: Array<{ label: ReactNode; value: ReactNode }>;
  /** Standing caveat, e.g. "Provisional: classifier output supports, but does not replace, pathology review." */
  disclaimer?: ReactNode;
}

/** Provenance footer: sources, assertions fired, render profile, and the caveat. */
export function CanvasSources({ rows, disclaimer, className, ...rest }: CanvasSourcesProps) {
  const id = useId();
  return (
    <footer className={cx(styles.sourcesFoot, className)} aria-labelledby={id} {...rest}>
      <h2 id={id} className={styles.srOnly}>
        Provenance
      </h2>
      <dl className={styles.provenance}>
        {rows.map((r, i) => (
          <div key={i}>
            <dt>{r.label}</dt>
            <dd>{r.value}</dd>
          </div>
        ))}
      </dl>
      {disclaimer ? <p className={styles.disclaimer}>{disclaimer}</p> : null}
    </footer>
  );
}
