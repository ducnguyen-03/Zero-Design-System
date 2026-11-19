import { useEffect, useId, useState } from "react";
import { Construction, X } from "lucide-react";
import { Button } from "../../components/Button/Button";
import { Modal, ModalFooter } from "../../components/Modal/Modal";
import styles from "./Maintenance.module.css";

/**
 * Where the platform is in a maintenance cycle. The shell maps it to UI:
 * - `off` — nothing shown.
 * - `scheduled` — persistent yellow alert bar ("Scheduled maintenance: start – end"); optionally the
 *   `MaintenanceNoticeModal` once per session.
 * - `imminent` — alert bar switches to "Maintenance starts in {countdown}" and the `MaintenanceSnackbar` slides in.
 * - `offline` — the full-screen `MaintenancePage` replaces the app.
 */
export type MaintenanceStage = "off" | "scheduled" | "imminent" | "offline";

/** A maintenance window as displayed to users (pre-formatted strings, with time zone). */
export interface MaintenanceWindow {
  /** Start, e.g. "10:00 PM, Sat 28 Jul (AEST)". */
  start: string;
  /** Expected end, e.g. "2:00 AM, Sun 29 Jul (AEST)". */
  end: string;
  /** Human countdown to `start` for the imminent stage, e.g. "10 minutes". */
  countdown?: string;
}

/** The design's sample window. */
export const DEFAULT_MAINTENANCE_WINDOW: MaintenanceWindow = {
  start: "10:00 PM, Sat 28 Jul (AEST)",
  end: "2:00 AM, Sun 29 Jul (AEST)",
  countdown: "10 minutes",
};

/** Exit transition length; matches `--insight-duration-fast`. */
const EXIT_MS = 300;

const cx = (...parts: Array<string | false | undefined>) => parts.filter(Boolean).join(" ");

/* ------------------------------------------------------------------ */

export interface MaintenanceSnackbarProps {
  /** Show / hide. The card slides in from the left and stays mounted while it slides out. */
  open: boolean;
  /** Window copy; `countdown` drives the title ("Maintenance starts in 10 minutes"). */
  window?: MaintenanceWindow;
  /** Called by the close (X) button and "Got it". The shell should set `open` to false. */
  onClose: () => void;
  /** Optional "View details" action (e.g. open `MaintenanceNoticeModal`). Hidden when omitted. */
  onDetails?: () => void;
  /** Render in normal flow instead of fixed to the bottom-left corner (docs / previews). */
  inline?: boolean;
  className?: string;
}

/**
 * 10-minute warning: dark card fixed bottom-left (z 880), shown during the `imminent` stage.
 * Announced politely (`role="status"`).
 */
export function MaintenanceSnackbar({
  open,
  window: win = DEFAULT_MAINTENANCE_WINDOW,
  onClose,
  onDetails,
  inline = false,
  className,
}: MaintenanceSnackbarProps) {
  const [mounted, setMounted] = useState(open);
  const [shown, setShown] = useState(false);
  const titleId = useId();

  useEffect(() => {
    if (open) {
      setMounted(true);
      // Two frames so the off-screen start position is painted before sliding in.
      let f2 = 0;
      const f1 = requestAnimationFrame(() => {
        f2 = requestAnimationFrame(() => setShown(true));
      });
      return () => {
        cancelAnimationFrame(f1);
        cancelAnimationFrame(f2);
      };
    }
    setShown(false);
    const t = setTimeout(() => setMounted(false), EXIT_MS);
    return () => clearTimeout(t);
  }, [open]);

  if (!mounted) return null;

  return (
    <div
      role="status"
      aria-labelledby={titleId}
      data-screen-label="Maintenance snackbar"
      className={cx(styles.snack, inline && styles.snackInline, shown && styles.snackShown, className)}
    >
      <div className={styles.snackHead}>
        <Construction className={styles.snackIcon} aria-hidden="true" />
        <div id={titleId} className={styles.snackTitle}>
          Maintenance starts in {win.countdown ?? "a few minutes"}
        </div>
        <button type="button" className={styles.snackClose} aria-label="Dismiss" onClick={onClose}>
          <X aria-hidden="true" />
        </button>
      </div>
      <p className={styles.snackBody}>Please save your work now. ZeroDash will be unavailable during maintenance.</p>
      <div className={styles.snackTimes}>
        <div>
          Starts at: <strong>{win.start}</strong>
        </div>
        <div>
          Expected back: <strong>{win.end}</strong>
        </div>
      </div>
      <div className={styles.snackActions}>
        {onDetails ? (
          <button type="button" className={styles.snackLink} onClick={onDetails}>
            View details
          </button>
        ) : null}
        <Button size="sm" variant="bold" onClick={onClose}>
          Got it
        </Button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

export interface MaintenanceNoticeModalProps {
  /** Show / hide (the design opens it once when the `scheduled` stage begins). */
  open: boolean;
  /** Window copy. */
  window?: MaintenanceWindow;
  /** Escape, backdrop, X and "Got it" all call this. */
  onClose: () => void;
  /** Render in place without a portal / backdrop (docs only). */
  inline?: boolean;
}

/** "Scheduled maintenance" notice — XS `Modal` with a construction icon and a single "Got it" action. */
export function MaintenanceNoticeModal({
  open,
  window: win = DEFAULT_MAINTENANCE_WINDOW,
  onClose,
  inline,
}: MaintenanceNoticeModalProps) {
  const descId = useId();
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="xs"
      showCloseButton
      inline={inline}
      aria-describedby={descId}
      className={styles.notice}
      title={
        <span className={styles.noticeTitle}>
          <span className={styles.noticeIcon} aria-hidden="true">
            <Construction />
          </span>
          Scheduled maintenance
        </span>
      }
      footer={<ModalFooter primaryAction={{ label: "Got it", onClick: onClose }} />}
    >
      <p id={descId} className={styles.noticeBody} data-screen-label="Scheduled maintenance notice">
        ZeroDash will be unavailable from <strong>{win.start}</strong> to <strong>{win.end}</strong>. Please save
        your work before maintenance begins.
      </p>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */

export type MaintenancePageTheme = "light" | "dark";

export interface MaintenancePageProps {
  /** Window copy (shown as "Scheduled window: start – end"). */
  window?: MaintenanceWindow;
  /** `light` (grey-10 page) or `dark` (deep navy page). Default `light`. */
  theme?: MaintenancePageTheme;
  /** Fill the nearest positioned ancestor instead of the viewport (docs / previews). */
  contained?: boolean;
  className?: string;
}

const SEQUENCE = "ACGTTGACCAGTGATCAGCTTACGGATCACGTTGACGGATCAGCTTGACCAGTGATCACGGTTACAGCTTGACGGATCAGCTTACGGTTGACCAGTGATCAGCTTACGG".repeat(4);

/** Scattered coloured bases: [letter, top %, left %, font px, colour slot]. */
const BASES: Array<[string, number, number, number, "green" | "teal" | "violet" | "amber" | "magenta"]> = [
  ["A", 15, 12, 30, "green"],
  ["C", 78, 24, 26, "teal"],
  ["G", 12, 70, 28, "violet"],
  ["T", 72, 82, 32, "amber"],
  ["G", 60, 16, 24, "magenta"],
  ["T", 88, 60, 22, "green"],
  ["A", 6, 40, 26, "teal"],
  ["C", 40, 88, 34, "violet"],
];

/**
 * Full-screen "ZeroDash is under maintenance" page for the `offline` stage (fixed, z 2000).
 * A faint rotated DNA sequence fills the edges behind the message (masked clear in the centre).
 */
export function MaintenancePage({
  window: win = DEFAULT_MAINTENANCE_WINDOW,
  theme = "light",
  contained = false,
  className,
}: MaintenancePageProps) {
  return (
    <div
      role="main"
      data-screen-label="Maintenance page"
      data-theme={theme}
      className={cx(styles.page, theme === "dark" && styles.pageDark, contained && styles.pageContained, className)}
    >
      <div className={styles.pageDecor} aria-hidden="true">
        <div className={styles.sequence}>{SEQUENCE}</div>
        {BASES.map(([ch, top, left, size, tone], i) => (
          <span
            key={i}
            className={cx(styles.base, styles[tone])}
            style={{ top: `${top}%`, left: `${left}%`, fontSize: size }}
          >
            {ch}
          </span>
        ))}
      </div>

      <div className={styles.pageContent}>
        <div className={styles.brand}>
          <svg width="84" height="68" viewBox="0 0 84 68" fill="none" aria-hidden="true">
            <path
              transform="translate(6 12) scale(1.7)"
              d="M 13.183 26 C 10.772 26 8.557 25.446 6.536 24.337 C 4.54 23.228 2.946 21.685 1.753 19.708 C 0.584 17.707 0 15.465 0 12.982 C 0 10.499 0.584 8.269 1.753 6.292 C 2.946 4.315 4.54 2.772 6.536 1.663 C 8.557 0.554 10.772 0 13.183 0 C 15.593 0 17.796 0.554 19.792 1.663 C 21.813 2.772 23.395 4.315 24.539 6.292 C 25.708 8.269 26.292 10.499 26.292 12.982 C 26.292 15.465 25.708 17.707 24.539 19.708 C 23.371 21.685 21.788 23.228 19.792 24.337 C 17.796 25.446 15.593 26 13.183 26 Z M 13.183 20.359 C 15.227 20.359 16.859 19.684 18.076 18.334 C 19.317 16.984 19.938 15.2 19.938 12.982 C 19.938 10.74 19.317 8.956 18.076 7.63 C 16.859 6.28 15.227 5.605 13.183 5.605 C 11.113 5.605 9.458 6.268 8.216 7.594 C 6.999 8.92 6.39 10.716 6.39 12.982 C 6.39 15.224 6.999 17.02 8.216 18.37 C 9.458 19.696 11.113 20.359 13.183 20.359 Z"
              fill="var(--insight-color-brand-logo-yellow)"
            />
            <rect x="54" y="44" width="26" height="15" rx="7.5" fill="var(--insight-color-brand-logo-magenta)" />
          </svg>
          <span className={styles.brandName}>ZeroDash</span>
        </div>
        <h1 className={styles.pageTitle}>ZeroDash is under maintenance</h1>
        <p className={styles.pageBody}>
          We're upgrading the genomic curation platform so variant review and precision-medicine reporting stay fast
          and reliable for every child on ZERO. ZeroDash is temporarily unavailable, please check back shortly.
        </p>
        <div className={styles.windowBox}>
          <Construction className={styles.windowIcon} aria-hidden="true" />
          <span>
            Scheduled window:{" "}
            <strong className={styles.windowTimes}>
              {win.start} – {win.end}
            </strong>
          </span>
        </div>
        <p className={styles.pageFoot}>If this takes longer than expected, please contact your ZERO platform administrator.</p>
      </div>
    </div>
  );
}
