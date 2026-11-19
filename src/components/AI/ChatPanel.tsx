import { useEffect, useRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { EllipsisVertical, Minimize2, X } from "lucide-react";
import styles from "./ChatPanel.module.css";

const cx = (...parts: Array<string | false | undefined>) => parts.filter(Boolean).join(" ");

export interface ChatPanelProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  /** The chat's subject, e.g. "AML patients in ZERO". */
  title: ReactNode;
  /** `ChatMessage`s, agent cards, suggestions… Scrolls; pinned to the newest message. */
  children: ReactNode;
  /** Pinned bottom — a `PromptInput`. */
  composer?: ReactNode;
  onMenu?: () => void;
  /** Minimise back to the canvas. */
  onMinimize?: () => void;
  onClose?: () => void;
  /** Change this (e.g. message count) to scroll to the bottom. */
  scrollKey?: unknown;
  /** `panel` = beside the canvas (440px column); `page` = the chat is the whole canvas, centred at 680px. */
  variant?: "panel" | "page";
}

/** The conversation column of the workspace: header, scrolling thread, composer. */
export function ChatPanel({
  title,
  children,
  composer,
  onMenu,
  onMinimize,
  onClose,
  scrollKey,
  variant = "panel",
  className,
  "aria-label": ariaLabel,
  ...rest
}: ChatPanelProps) {
  const threadRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = threadRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [scrollKey]);

  return (
    <section
      className={cx(styles.panel, variant === "page" && styles.page, className)}
      aria-label={ariaLabel ?? (typeof title === "string" ? `Chat: ${title}` : "Chat")}
      {...rest}
    >
      <header className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        <div className={styles.tools}>
          {onMenu ? (
            <button type="button" className={styles.tool} aria-label="Chat options" aria-haspopup="menu" onClick={onMenu}>
              <EllipsisVertical aria-hidden="true" />
            </button>
          ) : null}
          {onMinimize ? (
            <button type="button" className={styles.tool} aria-label="Minimise chat" onClick={onMinimize}>
              <Minimize2 aria-hidden="true" />
            </button>
          ) : null}
          {onClose ? (
            <button type="button" className={styles.tool} aria-label="Close chat" onClick={onClose}>
              <X aria-hidden="true" />
            </button>
          ) : null}
        </div>
      </header>
      <div ref={threadRef} className={styles.thread} role="log" aria-live="polite" tabIndex={0}>
        <div className={styles.threadInner}>{children}</div>
      </div>
      {composer ? (
        <div className={styles.composer}>
          <div className={styles.composerInner}>{composer}</div>
        </div>
      ) : null}
    </section>
  );
}
