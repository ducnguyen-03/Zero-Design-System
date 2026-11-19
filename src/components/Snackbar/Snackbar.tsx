import type { HTMLAttributes, ReactNode } from "react";
import { Check, X } from "lucide-react";
import styles from "./Snackbar.module.css";

/** Figma `Status` values. */
export type SnackbarStatusName = "success" | "error" | "warning";
/** Legacy short aliases, still accepted. */
export type SnackbarStatusAlias = "ok" | "err" | "warn";
export type SnackbarStatus = SnackbarStatusName | SnackbarStatusAlias;

export interface SnackbarProps extends Omit<HTMLAttributes<HTMLDivElement>, "role"> {
  /** Status badge colour + icon. Accepts `success | error | warning` or the
   *  legacy aliases `ok | err | warn`. */
  status?: SnackbarStatus;
  children: ReactNode;
}

const ALIAS: Record<SnackbarStatus, SnackbarStatusName> = {
  success: "success",
  ok: "success",
  error: "error",
  err: "error",
  warning: "warning",
  warn: "warning",
};

/** Normalise a status (alias or Figma name) to its Figma name. */
export const toSnackbarStatus = (s: SnackbarStatus): SnackbarStatusName => ALIAS[s] ?? "success";

const ICON: Record<SnackbarStatusName, ReactNode> = {
  success: <Check />,
  error: <X />,
  warning: <span className={styles.bang}>!</span>,
};

const cx = (...parts: Array<string | false | undefined>) =>
  parts.filter(Boolean).join(" ");

/**
 * Dark (off-black-200) feedback bar with a coloured round status icon and bold
 * white 14/20 text. Errors are announced assertively (`role="alert"`).
 */
export function Snackbar({ status = "success", children, className, ...rest }: SnackbarProps) {
  const s = toSnackbarStatus(status);
  return (
    <div
      className={cx(styles.snack, styles[s], className)}
      role={s === "error" ? "alert" : "status"}
      data-status={s}
      {...rest}
    >
      <span className={styles.ico} aria-hidden="true">
        {ICON[s]}
      </span>
      <span className={styles.message}>{children}</span>
    </div>
  );
}
