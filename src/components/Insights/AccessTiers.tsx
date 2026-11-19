import { useId, useState } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { Button } from "../Button/Button";
import { Modal } from "../Modal/Modal";
import styles from "./Insights.module.css";

const cx = (...parts: Array<string | false | undefined>) => parts.filter(Boolean).join(" ");

/* ─────────────────────────── Model ─────────────────────────── */

/** A kind of data a tier may open, e.g. "Curated variants". */
export interface AccessCapability {
  id: string;
  label: string;
  /** One line on what it means, shown on the account page. */
  description?: string;
}

/** `true` = included; `false` = not; a string = included with a qualifier ("Within scope"). */
export type CapabilityGrant = boolean | string;

export interface AccessFact {
  label: string;
  value: ReactNode;
}

/** Where a tier stands relative to the viewer. Sets the column band and the button. */
export type AccessTierState = "below" | "current" | "next" | "internal" | "above";

export interface AccessTier {
  id: string;
  /** "T2". */
  code: string;
  /** "Collaborator". */
  name: string;
  /** Two short lines beside the code: "Executed" / "agreement". */
  qualifier?: [string, string?];
  /** Who it is for: "Institution with executed agreement". */
  audience: string;
  state: AccessTierState;
  /** Band label above the column. Defaults by state. */
  band?: string;
  grants: Record<string, CapabilityGrant>;
  facts: AccessFact[];
  /** Button label; defaults by state ("Request T2 access", "Contact CCI"…). */
  actionLabel?: string;
}

const BAND: Record<AccessTierState, string> = {
  below: "Open to everyone",
  current: "Your current tier",
  next: "Recommended next step",
  internal: "CCI internal only",
  above: "Available on request",
};

/* ─────────────────────────── Grant mark ─────────────────────────── */

function Grant({ grant, label }: { grant: CapabilityGrant | undefined; label: string }) {
  const on = Boolean(grant);
  return (
    <li className={cx(styles.grant, !on && styles.grantOff)}>
      <span className={styles.grantIcon} aria-hidden="true">
        {on ? <Check /> : <X />}
      </span>
      <span className={styles.grantLabel}>
        <span className={styles.srOnly}>{on ? "Included: " : "Not included: "}</span>
        {label}
        {typeof grant === "string" ? <span className={styles.grantNote}>{grant}</span> : null}
      </span>
    </li>
  );
}

/* ─────────────────────────── Tier comparison ─────────────────────────── */

export interface AccessTierTableProps extends HTMLAttributes<HTMLDivElement> {
  tiers: AccessTier[];
  capabilities: AccessCapability[];
  /** Rules that hold at every tier, under the columns. */
  notes?: Array<{ holds: boolean; text: ReactNode }>;
  /** Called with the tier whose button was pressed (not called for the current tier). */
  onSelectTier?: (tier: AccessTier) => void;
}

/**
 * Every tier side by side: who it is for, what it opens, where you stand. The current tier and the
 * recommended next step carry coloured bands; only tiers above yours have a live button.
 */
export function AccessTierTable({ tiers, capabilities, notes, onSelectTier, className, ...rest }: AccessTierTableProps) {
  return (
    <div className={cx(styles.tiers, className)} {...rest}>
      <ol className={styles.tierGrid} style={{ gridTemplateColumns: `repeat(${tiers.length}, minmax(200px, 1fr))` }}>
        {tiers.map((t) => {
          const action =
            t.actionLabel ??
            (t.state === "below"
              ? "Included in your tier"
              : t.state === "current"
                ? "Your current tier"
                : t.state === "internal"
                  ? "Contact CCI"
                  : `Request ${t.code} access`);
          const live = t.state === "next" || t.state === "above" || t.state === "internal";
          return (
            <li
              key={t.id}
              className={cx(styles.tier, styles[`tier-${t.state}`])}
              aria-current={t.state === "current" ? "true" : undefined}
            >
              <span className={styles.tierBand}>{t.band ?? BAND[t.state]}</span>
              <div className={styles.tierCard}>
                <h3 className={styles.tierName}>{t.name}</h3>
                <p className={styles.tierCodeRow}>
                  <span className={styles.tierCode}>{t.code}</span>
                  {t.qualifier ? (
                    <span className={styles.tierQualifier}>
                      {t.qualifier[0]}
                      {t.qualifier[1] ? (
                        <>
                          <br />
                          {t.qualifier[1]}
                        </>
                      ) : null}
                    </span>
                  ) : null}
                </p>
                <p className={styles.tierAudience}>{t.audience}</p>
                {live ? (
                  <Button
                    size="md"
                    variant={t.state === "internal" ? "outline" : "bold"}
                    className={styles.tierAction}
                    onClick={() => onSelectTier?.(t)}
                  >
                    {action}
                  </Button>
                ) : (
                  <span className={styles.tierStatic}>{action}</span>
                )}
                <ul className={styles.grants} aria-label={`${t.name} includes`}>
                  {capabilities.map((c) => (
                    <Grant key={c.id} grant={t.grants[c.id]} label={c.label} />
                  ))}
                </ul>
                <dl className={styles.facts}>
                  {t.facts.map((f) => (
                    <div key={f.label} className={styles.fact}>
                      <dt>{f.label}</dt>
                      <dd>{f.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </li>
          );
        })}
      </ol>
      {notes?.length ? (
        <ul className={styles.tierNotes}>
          {notes.map((n, i) => (
            <li key={i} className={cx(styles.grant, !n.holds && styles.grantOff)}>
              <span className={styles.grantIcon} aria-hidden="true">
                {n.holds ? <Check /> : <X />}
              </span>
              <span>{n.text}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

/* ─────────────────────────── Modal ─────────────────────────── */

export interface AccessTierModalProps extends Omit<AccessTierTableProps, "title"> {
  open: boolean;
  onClose: () => void;
  /** Default "One platform, four levels of access." */
  title?: ReactNode;
  /** Line under the title. */
  description?: ReactNode;
}

/** The tier comparison in a large DS `Modal` — opened from the sidebar's Dataset access block or "Compare all tiers". */
export function AccessTierModal({
  open,
  onClose,
  title = "One platform, four levels of access.",
  description = "Each tier adds more detail to what you can see. Move up a tier by submitting a data access request.",
  ...table
}: AccessTierModalProps) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="lg" className={styles.tierModal}>
      <p className={styles.tierLead}>{description}</p>
      <AccessTierTable {...table} />
    </Modal>
  );
}

/* ─────────────────────────── Access details (account page) ─────────────────────────── */

export interface AccessDetailsProps extends HTMLAttributes<HTMLDivElement> {
  capabilities: AccessCapability[];
  /** The viewer's tier. */
  tier: AccessTier;
  /** "Access is set by your tier. Request data access to move up a tier." */
  note?: ReactNode;
  onCompare?: () => void;
}

/** What the viewer's tier opens, line by line, with the tier's rules beside it. */
export function AccessDetails({
  capabilities,
  tier,
  note = "Access is set by your tier. Request data access to move up a tier.",
  onCompare,
  className,
  ...rest
}: AccessDetailsProps) {
  return (
    <div className={cx(styles.details, className)} {...rest}>
      <div className={styles.detailsBody}>
        <div className={styles.detailsMain}>
          <h3 className={styles.eyebrow}>Granularity of data</h3>
          <ul className={styles.detailGrants}>
            {capabilities.map((c) => {
              const g = tier.grants[c.id];
              const on = Boolean(g);
              return (
                <li key={c.id} className={cx(styles.grant, styles.detailGrant, !on && styles.grantOff)}>
                  <span className={cx(styles.grantIcon, styles.grantIconRing)} aria-hidden="true">
                    {on ? <Check /> : <X />}
                  </span>
                  <span className={styles.detailText}>
                    <span className={styles.detailLabel}>
                      <span className={styles.srOnly}>{on ? "Included: " : "Not included: "}</span>
                      {c.label}
                      {typeof g === "string" ? <span className={styles.grantNote}>{g}</span> : null}
                    </span>
                    {c.description ? <span className={styles.detailDesc}>{c.description}</span> : null}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
        <dl className={styles.detailFacts}>
          {tier.facts.map((f) => (
            <div key={f.label} className={styles.fact}>
              <dt>{f.label}</dt>
              <dd>{f.value}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className={styles.detailsFoot}>
        <span>{note}</span>
        {onCompare ? (
          <Button size="sm" variant="bold" onClick={onCompare}>
            Compare all tiers
          </Button>
        ) : null}
      </div>
    </div>
  );
}

/* ─────────────────────────── Account summary ─────────────────────────── */

export interface AccountSummaryProps extends HTMLAttributes<HTMLElement> {
  name: string;
  email?: string;
  initials?: string;
  /** "T1 · Registered". */
  tierLabel: ReactNode;
  /** Expanded under the header by "View access details" — usually `AccessDetails`. */
  details?: ReactNode;
  defaultOpen?: boolean;
}

/** The account header: who you are, your tier, and — on demand — what that tier opens. */
export function AccountSummary({
  name,
  email,
  initials,
  tierLabel,
  details,
  defaultOpen = false,
  className,
  ...rest
}: AccountSummaryProps) {
  const [open, setOpen] = useState(defaultOpen);
  const regionId = useId();
  const short =
    initials ??
    name
      .split(/\s+/)
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  return (
    <section className={cx(styles.account, className)} aria-label="Your account" {...rest}>
      <div className={styles.accountHead}>
        <span className={styles.accountAvatar} aria-hidden="true">
          {short}
        </span>
        <div className={styles.accountText}>
          <span className={styles.accountNameRow}>
            <span className={styles.accountName}>{name}</span>
            <span className={styles.tierChip}>{tierLabel}</span>
          </span>
          {email ? <span className={styles.accountEmail}>{email}</span> : null}
        </div>
        {details ? (
          <Button
            size="sm"
            variant="subtle"
            aria-expanded={open}
            aria-controls={regionId}
            endIcon={<ChevronDown className={cx(styles.chevron, open && styles.chevronOpen)} />}
            onClick={() => setOpen((v) => !v)}
          >
            View access details
          </Button>
        ) : null}
      </div>
      {details ? (
        <div id={regionId} hidden={!open} className={styles.accountDetails}>
          {details}
        </div>
      ) : null}
    </section>
  );
}
