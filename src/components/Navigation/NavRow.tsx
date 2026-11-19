import type { ButtonHTMLAttributes, ReactNode } from "react";
import { useSidebar } from "./SidebarContext";
import styles from "./NavRow.module.css";

export type NavRowSize = "md" | "sm";

export interface NavRowProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode;
  active?: boolean;
  children: ReactNode;
  /** Icon-only row (Figma Sidebar `Compressed`). The label becomes the
   *  accessible name and a tooltip on hover/focus. Defaults to the enclosing
   *  `<Sidebar collapsed>` state. */
  collapsed?: boolean;
  /** Content aligned to the row's end (count, timestamp, menu…). Hidden when collapsed. */
  trailing?: ReactNode;
  /** `md` = 32px primary rows (default); `sm` = 28px footer rows (FAQs, feedback). */
  size?: NavRowSize;
}

const cx = (...parts: Array<string | false | undefined>) =>
  parts.filter(Boolean).join(" ");

export function NavRow({
  icon,
  active,
  disabled,
  children,
  className,
  collapsed: collapsedProp,
  trailing,
  size = "md",
  "aria-label": ariaLabel,
  ...rest
}: NavRowProps) {
  const ctx = useSidebar();
  const collapsed = collapsedProp ?? ctx.collapsed;
  const label = typeof children === "string" ? children : undefined;

  return (
    <button
      type="button"
      disabled={disabled}
      aria-current={active ? "page" : undefined}
      aria-label={collapsed ? ariaLabel ?? label : ariaLabel}
      className={cx(
        styles.navrow,
        size === "sm" && styles.sm,
        active && styles.active,
        disabled && styles.disabled,
        collapsed && styles.collapsed,
        className,
      )}
      {...rest}
    >
      {icon ? (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      ) : null}
      {collapsed ? (
        <span
          className={styles.tooltip}
          aria-hidden={ariaLabel ?? label ? true : undefined}
        >
          {children}
        </span>
      ) : (
        <>
          <span className={styles.label}>{children}</span>
          {trailing ? <span className={styles.trailing}>{trailing}</span> : null}
        </>
      )}
    </button>
  );
}
