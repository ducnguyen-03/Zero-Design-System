import type { ReactNode } from "react";
import { EyeOff, Lock, Mars, Venus } from "lucide-react";
import {
  phiAge,
  phiDobText,
  phiHighlightRanges,
  phiName,
  phiTagFor,
} from "../phi";
import type { PhiContext, PhiLevel, PhiMatch, PhiPatient, PhiTagSpec } from "../phi";
import styles from "../OverviewView.module.css";

const cx = (...p: Array<string | false | undefined | null>) => p.filter(Boolean).join(" ");

/** Text with every needle wrapped in a green <mark>. */
export function Hl({ text, needles }: { text: string; needles?: string[] }) {
  const ranges = needles && needles.length ? phiHighlightRanges(text, needles) : [];
  if (!ranges.length) return <>{text}</>;
  const out: ReactNode[] = [];
  let pos = 0;
  ranges.forEach(([a, b], k) => {
    if (a > pos) out.push(text.slice(pos, a));
    out.push(
      <mark key={k} className={styles.mark}>
        {text.slice(a, b)}
      </mark>,
    );
    pos = b;
  });
  if (pos < text.length) out.push(text.slice(pos));
  return <>{out}</>;
}

export function PhiChip({ children }: { children: ReactNode }) {
  return <span className={styles.phiChip}>{children}</span>;
}

export function PhiAvatar({ sex }: { sex: "F" | "M" }) {
  const f = sex === "F";
  const Icon = f ? Venus : Mars;
  return (
    <span className={cx(styles.phiAvatar, f ? styles.phiAvatarF : styles.phiAvatarM)} title={f ? "Female" : "Male"}>
      <Icon size={16} strokeWidth={1.67} aria-hidden="true" />
      <span className={styles.srOnly}>{f ? "Female" : "Male"}</span>
    </span>
  );
}

export function PhiTag({ spec }: { spec: PhiTagSpec }) {
  const hidden = spec.kind === "hidden";
  const Icon = hidden ? EyeOff : Lock;
  return (
    <span className={cx(styles.phiTag, hidden ? styles.phiTagHidden : styles.phiTagRestricted)}>
      <Icon size={16} strokeWidth={1.67} aria-hidden="true" />
      {spec.label}
    </span>
  );
}

/** Info chips. Limited (no pii.read or a patient-level grant): age and sex only. */
export function PhiMeta({ m, ctx, match, withPid }: { m: PhiPatient; ctx: PhiContext; match: PhiMatch | null; withPid?: boolean }) {
  const g = match ? match.group : null;
  const limited = !ctx.pii || ctx.grantOf(m.pid) !== "study";
  const dt = limited ? "" : phiDobText(m, ctx.lvl);
  return (
    <div className={styles.phiMeta}>
      {withPid && !limited ? <PhiChip>{m.pid}</PhiChip> : null}
      {!limited ? (
        <PhiChip>{g === "lm" && match ? <Hl text={m.lm} needles={[match.idq]} /> : m.lm}</PhiChip>
      ) : null}
      <PhiChip>{phiAge(m.dob, ctx.now)}</PhiChip>
      <PhiChip>{m.sex === "F" ? "Female" : "Male"}</PhiChip>
      {dt ? (
        <PhiChip>
          <span key={ctx.lvl} className={styles.fadeIn}>
            {g === "dob" && match ? <Hl text={dt} needles={[match.dobq]} /> : dt}
          </span>
        </PhiChip>
      ) : null}
    </div>
  );
}

export function PhiNameText({ m, lvl, match }: { m: PhiPatient; lvl: PhiLevel; match: PhiMatch | null }) {
  const n = phiName(m, lvl);
  if (match && match.group === "name" && (lvl === "full" || lvl === "partial")) return <Hl text={n} needles={match.tokens} />;
  return <>{n}</>;
}

/** Search suggestion row content (3c). */
export function PhiSuggestion({ m, match, ctx }: { m: PhiPatient; match: PhiMatch; ctx: PhiContext }) {
  const restricted = ctx.pii && ctx.grantOf(m.pid) === "patient";
  const nameRow = match.group === "name" && ctx.lvl !== "codified";
  const tag = phiTagFor(match, ctx.lvl, restricted);
  return (
    <>
      <PhiAvatar sex={m.sex} />
      <div className={styles.phiStack}>
        <div className={styles.phiPrimaryRow}>
          {nameRow ? (
            <span className={styles.phiName}>
              <PhiNameText m={m} lvl={ctx.lvl} match={match} />
            </span>
          ) : (
            <span className={cx(styles.phiName, styles.phiPidStrong)}>
              {match.group === "id" ? <Hl text={m.pid} needles={[match.idq]} /> : m.pid}
            </span>
          )}
          {tag ? <PhiTag spec={tag} /> : null}
        </div>
        <PhiMeta m={m} ctx={ctx} match={match} withPid={nameRow} />
      </div>
    </>
  );
}
