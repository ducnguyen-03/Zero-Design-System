import { useEffect, useId, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent, ReactNode } from "react";
import { createPortal } from "react-dom";
import { ArrowDown, CircleHelp, Download, FileText, RotateCcw, X } from "lucide-react";
import { Button } from "../Button/Button";
import { Checkbox } from "../Checkbox/Checkbox";
import { InsightsLogo } from "../Brand/InsightsLogo";
import styles from "./OnboardingTour.module.css";

const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(" ");

/** Keep Tab inside `root` and focus `selector` (or the first control) when it opens. */
function useTrap(open: boolean, selector?: string) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const root = ref.current;
    (root?.querySelector<HTMLElement>(selector ?? "button:not([disabled])") ?? root)?.focus();
  }, [open, selector]);
  const onKeyDown = (e: ReactKeyboardEvent) => {
    if (e.key !== "Tab" || !ref.current) return;
    const f = Array.from(ref.current.querySelectorAll<HTMLElement>('button:not([disabled]),a[href],input:not([disabled]),[tabindex="0"]'));
    if (!f.length) return;
    const i = f.indexOf(document.activeElement as HTMLElement);
    if (e.shiftKey ? i <= 0 : i === -1 || i === f.length - 1) {
      e.preventDefault();
      (e.shiftKey ? f[f.length - 1] : f[0]).focus();
    }
  };
  return { ref, onKeyDown };
}

/** Render inline (for docs) instead of portalled over the page. */
interface Placement {
  /** Render in place without the fixed backdrop — for docs and side-by-side stories. */
  inline?: boolean;
}

function Layer({ inline, tone = "scrim", children }: Placement & { tone?: "scrim" | "page" | "overTour"; children: ReactNode }) {
  if (inline) return <div className={styles.inlineLayer}>{children}</div>;
  return createPortal(<div className={cx(styles.layer, styles[`layer_${tone}`])}>{children}</div>, document.body);
}

/* ─────────────────────────── 1 · Terms ─────────────────────────── */

export interface TermsSection {
  heading: string;
  paragraphs: string[];
}

export interface TourTermsProps extends Placement {
  open: boolean;
  title?: ReactNode;
  /** "Your agreement with Children’s Cancer Institute · Effective September 2026". */
  subtitle?: ReactNode;
  intro?: ReactNode;
  sections: TermsSection[];
  /** Accept stays disabled until the terms are scrolled to the end. Default true. */
  requireScroll?: boolean;
  confirmLabel?: ReactNode;
  onAccept: () => void;
  onDecline: () => void;
  onDownload?: () => void;
}

/** First login: the data access agreement. Scroll to the end and tick the confirmation to accept. */
export function TourTerms({
  open,
  title = "Terms and Conditions",
  subtitle,
  intro,
  sections,
  requireScroll = true,
  confirmLabel = "I confirm I have read and understood these terms, and I will comply with them.",
  onAccept,
  onDecline,
  onDownload,
  inline,
}: TourTermsProps) {
  const titleId = useId();
  const box = useRef<HTMLDivElement>(null);
  const [read, setRead] = useState(!requireScroll);
  const [checked, setChecked] = useState(false);
  const trap = useTrap(open && !inline, "[data-terms-box]");
  useEffect(() => {
    if (open) {
      setRead(!requireScroll);
      setChecked(false);
    }
  }, [open, requireScroll]);
  if (!open) return null;
  const canAccept = read && checked;
  const onScroll = () => {
    const el = box.current;
    if (el && !read && el.scrollTop + el.clientHeight >= el.scrollHeight - 4) setRead(true);
  };
  return (
    <Layer inline={inline}>
      <div ref={trap.ref} onKeyDown={trap.onKeyDown} className={styles.terms} role="dialog" aria-modal={!inline} aria-labelledby={titleId}>
        <div className={styles.termsHead}>
          <div className={styles.termsHeading}>
            <h2 id={titleId} className={styles.termsTitle}>
              {title}
            </h2>
            {subtitle ? <p className={styles.termsSubtitle}>{subtitle}</p> : null}
          </div>
          {onDownload ? (
            <Button size="sm" variant="subtle" startIcon={<Download />} onClick={onDownload}>
              Download PDF
            </Button>
          ) : null}
        </div>
        <div className={styles.termsFrame}>
          <div ref={box} data-terms-box="" className={styles.termsBox} tabIndex={0} onScroll={onScroll} aria-label="Terms">
            {intro ? <p className={styles.termsLead}>{intro}</p> : null}
            {sections.map((sec, i) => (
              <section key={sec.heading} className={styles.termsSection}>
                <h3>
                  {i + 1}. {sec.heading}
                </h3>
                {sec.paragraphs.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </section>
            ))}
          </div>
          {!read ? (
            <span className={styles.termsFade}>
              <Button
                size="sm"
                variant="subtle"
                startIcon={<ArrowDown />}
                onClick={() => box.current?.scrollTo({ top: box.current.scrollHeight, behavior: "smooth" })}
              >
                Scroll to the end of the terms to continue
              </Button>
            </span>
          ) : null}
        </div>
        <div className={styles.termsFoot}>
          <Checkbox label={confirmLabel} checked={checked} onChange={(e) => setChecked(e.currentTarget.checked)} />
          <div className={styles.actions}>
            <Button size="md" variant="subtle" className={styles.btn} onClick={onDecline}>
              Decline and sign out
            </Button>
            <Button size="md" variant="bold" className={styles.btn} disabled={!canAccept} onClick={onAccept} title={!read ? "Scroll to the end of the terms first" : undefined}>
              Accept and continue
            </Button>
          </div>
        </div>
      </div>
    </Layer>
  );
}

/* ─────────────────────────── 2 · Welcome ─────────────────────────── */

export interface TourWelcomeProps extends Placement {
  open: boolean;
  /** "Hi Alicia, welcome to Insights". */
  title: ReactNode;
  body: ReactNode;
  /** Header picture, e.g. a screenshot of the product. */
  image?: ReactNode;
  /** Where the user is in onboarding: value 0–1 and a label like "Terms accepted · Tour next". */
  progress?: { value: number; label: ReactNode };
  onStart: () => void;
  onSkip: () => void;
  startLabel?: string;
  skipLabel?: string;
}

/** The invitation before the tour: a look at the product, what the tour covers, Start or Skip. */
export function TourWelcome({
  open,
  title,
  body,
  image,
  progress,
  onStart,
  onSkip,
  startLabel = "Start tour",
  skipLabel = "Skip tour",
  inline,
}: TourWelcomeProps) {
  const titleId = useId();
  const trap = useTrap(open && !inline, "[data-start]");
  if (!open) return null;
  return (
    <Layer inline={inline}>
      <div
        ref={trap.ref}
        className={styles.welcome}
        role="dialog"
        aria-modal={!inline}
        aria-labelledby={titleId}
        onKeyDown={(e) => {
          trap.onKeyDown(e);
          if (e.key === "Escape") onSkip();
        }}
      >
        <button type="button" className={styles.welcomeClose} aria-label="Close" onClick={onSkip}>
          <X aria-hidden="true" />
        </button>
        {image ? <div className={styles.welcomeImage}>{image}</div> : null}
        <h2 id={titleId} className={styles.welcomeTitle}>
          {title}
        </h2>
        <p className={styles.welcomeBody}>{body}</p>
        <div className={styles.welcomeFoot}>
          {progress ? (
            <span className={styles.welcomeProgress}>
              <span className={styles.track} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress.value * 100)}>
                <span style={{ width: `${progress.value * 100}%` }} />
              </span>
              <span>{progress.label}</span>
            </span>
          ) : (
            <span />
          )}
          <span className={styles.actions}>
            <Button size="md" variant="subtle" className={styles.btn} onClick={onSkip}>
              {skipLabel}
            </Button>
            <Button size="md" variant="bold" className={cx(styles.btn, styles.startButton)} onClick={onStart} data-start="">
              {startLabel}
            </Button>
          </span>
        </div>
      </div>
    </Layer>
  );
}

/* ─────────────────────────── Skip confirmation ─────────────────────────── */

export interface TourSkipConfirmProps extends Placement {
  open: boolean;
  /** Where the tour can be replayed. */
  hint?: ReactNode;
  onContinue: () => void;
  onSkip: () => void;
}

/** "Skip the tour?" — asked when the tour is closed before its last step. */
export function TourSkipConfirm({
  open,
  hint = "You can replay it at any time from Help and support in the sidebar.",
  onContinue,
  onSkip,
  inline,
}: TourSkipConfirmProps) {
  const titleId = useId();
  const trap = useTrap(open && !inline);
  if (!open) return null;
  return (
    <Layer inline={inline} tone="overTour">
      <div ref={trap.ref} onKeyDown={trap.onKeyDown} className={styles.confirm} role="alertdialog" aria-modal={!inline} aria-labelledby={titleId}>
        <h2 id={titleId} className={styles.confirmTitle}>
          Skip the tour?
        </h2>
        <p className={styles.confirmBody}>{hint}</p>
        <div className={cx(styles.actions, styles.confirmActions)}>
          <Button size="md" variant="subtle" className={styles.btn} onClick={onContinue}>
            Continue tour
          </Button>
          <Button size="md" variant="bold" className={styles.btn} onClick={onSkip}>
            Skip tour
          </Button>
        </div>
      </div>
    </Layer>
  );
}

/* ─────────────────────────── Declined ─────────────────────────── */

export interface TourSignedOutProps extends Placement {
  open: boolean;
  title?: ReactNode;
  body?: ReactNode;
  onSignIn: () => void;
}

/** After "Decline and sign out": the user cannot use Insights without the agreement. */
export function TourSignedOut({
  open,
  title = "You have been signed out",
  body = "Access to Insights requires accepting the data access and ethics agreement. Sign in again to review it.",
  onSignIn,
  inline,
}: TourSignedOutProps) {
  const titleId = useId();
  const trap = useTrap(open && !inline);
  if (!open) return null;
  return (
    <Layer inline={inline} tone="page">
      <div ref={trap.ref} onKeyDown={trap.onKeyDown} className={styles.signedOut} role="alertdialog" aria-modal={!inline} aria-labelledby={titleId}>
        <InsightsLogo height={26} badge={null} />
        <h2 id={titleId} className={styles.signedOutTitle}>
          {title}
        </h2>
        <p className={styles.confirmBody}>{body}</p>
        <Button size="md" variant="bold" className={cx(styles.btn, styles.signIn)} onClick={onSignIn}>
          Sign in again
        </Button>
      </div>
    </Layer>
  );
}

/* ─────────────────────────── Help menu ─────────────────────────── */

export interface TourHelpMenuProps {
  onReplay: () => void;
  onTerms?: () => void;
  onFaq?: () => void;
  className?: string;
}

/** The sidebar's Help and support menu — where the tour and the agreement can be reopened. */
export function TourHelpMenu({ onReplay, onTerms, onFaq, className }: TourHelpMenuProps) {
  return (
    <div role="menu" aria-label="Help and support" className={cx(styles.helpMenu, className)}>
      <button type="button" role="menuitem" onClick={onReplay}>
        <RotateCcw aria-hidden="true" />
        Replay onboarding tour
      </button>
      {onTerms ? (
        <button type="button" role="menuitem" onClick={onTerms}>
          <FileText aria-hidden="true" />
          Data access agreement
        </button>
      ) : null}
      {onFaq ? (
        <button type="button" role="menuitem" onClick={onFaq}>
          <CircleHelp aria-hidden="true" />
          FAQs
        </button>
      ) : null}
    </div>
  );
}
