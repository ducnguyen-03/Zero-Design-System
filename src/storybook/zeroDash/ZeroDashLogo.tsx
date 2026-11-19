import styles from "./ZeroDashShell.module.css";

const O_PATH =
  "M13.183 26C10.772 26 8.557 25.446 6.536 24.337 4.54 23.228 2.946 21.685 1.753 19.708.584 17.707 0 15.465 0 12.982 0 10.499.584 8.269 1.753 6.292 2.946 4.315 4.54 2.772 6.536 1.663 8.557.554 10.772 0 13.183 0c2.41 0 4.613.554 6.609 1.663 2.021 1.109 3.603 2.652 4.747 4.629 1.169 1.977 1.753 4.207 1.753 6.69 0 2.483-.584 4.725-1.753 6.726-1.168 1.977-2.751 3.52-4.747 4.629C17.796 25.446 15.593 26 13.183 26Zm0-5.641c2.044 0 3.676-.675 4.893-2.025 1.241-1.35 1.862-3.134 1.862-5.352 0-2.242-.621-4.026-1.862-5.352-1.217-1.35-2.849-2.025-4.893-2.025-2.07 0-3.725.663-4.967 1.989C6.999 8.92 6.39 10.716 6.39 12.982c0 2.242.609 4.038 1.826 5.388 1.242 1.326 2.897 1.989 4.967 1.989Z";

/** The brand "O" plus the magenta dash — the compact ZeroDash mark (sidebar rail). */
export function ZeroDashMark() {
  return (
    <span className={styles.mark} aria-label="Zero" role="img">
      <svg width="22" height="22" viewBox="0 0 26.292 26" fill="none" aria-hidden="true">
        <path d={O_PATH} fill="var(--insight-color-brand-logo-yellow)" />
      </svg>
      <span className={styles.markDash} aria-hidden="true" />
    </span>
  );
}

/** "zer" + the brand O + dash — the full ZeroDash wordmark (expanded sidebar). */
export function ZeroDashLogo() {
  return (
    <span className={styles.wordmark} aria-label="Zero" role="img">
      <span className={styles.wordmarkText} aria-hidden="true">
        zer
      </span>
      <svg width="22" height="22" viewBox="0 0 26.292 26" fill="none" aria-hidden="true">
        <path d={O_PATH} fill="var(--insight-color-brand-logo-yellow)" />
      </svg>
      <span className={styles.markDash} aria-hidden="true" />
    </span>
  );
}
