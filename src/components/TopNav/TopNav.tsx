import { useEffect, useId, useRef, useState } from "react";
import type { HTMLAttributes, MouseEvent, ReactNode } from "react";
import { ChevronDown, SquareArrowOutUpRight } from "lucide-react";
import { Button } from "../Button/Button";
import styles from "./TopNav.module.css";

export type TopNavTheme = "light" | "dark";

export interface TopNavLink {
  label: string;
  href?: string;
  /** Marks the current section (renders the green top indicator + `aria-current`). */
  active?: boolean;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
}

export interface TopNavUser {
  name: string;
  /** Up to two characters. Derived from `name` when omitted. */
  initials?: string;
  email?: string;
}

export interface TopNavMenuItem {
  label: string;
  icon?: ReactNode;
  onSelect: () => void;
}

export interface TopNavProps extends Omit<HTMLAttributes<HTMLElement>, "children"> {
  /** Figma `Type` — `light` (white bar) or `dark` (off-black bar). */
  theme?: TopNavTheme;
  links?: TopNavLink[];
  /** Figma `Authentication status=Logged in` — pass the signed-in user.
   *  Omit for the logged-out variant (shows the Login button). */
  user?: TopNavUser;
  /** Items in the avatar dropdown (e.g. Profile, Sign out). */
  userMenuItems?: TopNavMenuItem[];
  onSignIn?: () => void;
  signInLabel?: string;
  /** "Provide feedback" link target. Hidden when neither `feedbackHref` nor `onFeedback` is given. */
  feedbackHref?: string;
  onFeedback?: () => void;
  feedbackLabel?: string;
  /** Where the logo links to. */
  homeHref?: string;
  /** Accessible name of the nav landmark. Must be unique when several TopNavs share a page. */
  navLabel?: string;
  /** Override the logo (defaults to the Insights wordmark for the chosen theme). */
  logo?: ReactNode;
}

const cx = (...parts: Array<string | false | undefined>) =>
  parts.filter(Boolean).join(" ");

export const getInitials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const LOGO_SRC: Record<TopNavTheme, string> = {
  light: "/assets/InsightsLogo.svg",
  dark: "/figma/topnav/insights-logo-on-dark.svg",
};

function UserMenu({
  user,
  items,
}: {
  user: TopNavUser;
  items: TopNavMenuItem[];
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  const initials = user.initials ?? getInitials(user.name);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: globalThis.MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const hasMenu = items.length > 0;

  return (
    <div className={styles.userMenu} ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className={styles.avatar}
        aria-label={`Account: ${user.name}`}
        aria-haspopup={hasMenu ? "menu" : undefined}
        aria-expanded={hasMenu ? open : undefined}
        aria-controls={hasMenu && open ? menuId : undefined}
        onClick={() => hasMenu && setOpen((v) => !v)}
      >
        <span aria-hidden="true">{initials}</span>
      </button>
      {hasMenu && open ? (
        <div className={styles.menu} role="menu" id={menuId} aria-label="Account">
          <div className={styles.menuHeader}>
            <span className={styles.menuName}>{user.name}</span>
            {user.email ? <span className={styles.menuEmail}>{user.email}</span> : null}
          </div>
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              className={styles.menuItem}
              onClick={() => {
                setOpen(false);
                item.onSelect();
              }}
            >
              {item.icon ? <span className={styles.menuIcon}>{item.icon}</span> : null}
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/**
 * Global application header (Figma "Top Nav"). A `<header>` landmark with the
 * Insights logo, primary section tabs, a feedback link and either a Login button
 * (logged out) or the user's avatar menu (logged in).
 */
export function TopNav({
  theme = "light",
  links = [],
  user,
  userMenuItems = [],
  onSignIn,
  signInLabel = "Login",
  feedbackHref,
  onFeedback,
  feedbackLabel = "Provide feedback",
  homeHref = "/",
  navLabel = "Primary",
  logo,
  className,
  ...rest
}: TopNavProps) {
  const showFeedback = Boolean(feedbackHref || onFeedback);

  return (
    <header
      className={cx(styles.topnav, theme === "dark" && styles.dark, className)}
      {...rest}
    >
      <div className={styles.start}>
        <a href={homeHref} className={styles.logo} aria-label="Insights home">
          {logo ?? <img src={LOGO_SRC[theme]} alt="" width={134} height={24} />}
        </a>
        {links.length > 0 ? (
          <nav aria-label={navLabel}>
            <ul className={styles.tabs}>
              {links.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href ?? "#"}
                    className={cx(styles.tab, link.active && styles.active)}
                    aria-current={link.active ? "page" : undefined}
                    onClick={link.onClick}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </div>

      <div className={styles.end}>
        {showFeedback ? (
          <a
            className={styles.feedback}
            href={feedbackHref ?? "#"}
            target={feedbackHref ? "_blank" : undefined}
            rel={feedbackHref ? "noreferrer" : undefined}
            onClick={(e) => {
              if (onFeedback) {
                if (!feedbackHref) e.preventDefault();
                onFeedback();
              }
            }}
          >
            {feedbackLabel}
            <SquareArrowOutUpRight aria-hidden="true" />
            {feedbackHref ? <span className={styles.srOnly}>(opens in a new tab)</span> : null}
          </a>
        ) : null}
        {user ? (
          <UserMenu user={user} items={userMenuItems} />
        ) : (
          <Button
            variant="bold"
            size="sm"
            endIcon={<ChevronDown />}
            onClick={onSignIn}
          >
            {signInLabel}
          </Button>
        )}
      </div>
    </header>
  );
}
