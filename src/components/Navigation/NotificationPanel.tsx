import { useId, useRef, useState } from "react";
import type { HTMLAttributes, KeyboardEvent, ReactNode } from "react";
import { BellDot, Bell, PanelLeft, Settings, X } from "lucide-react";
import styles from "./NotificationPanel.module.css";

export interface NotificationTab {
  id: string;
  label: string;
  /** Unread count badge. Hidden when 0/undefined. */
  count?: number;
}

export interface NotificationItem {
  id: string;
  /** Leading visual — a lucide icon (rendered in a green circle) … */
  icon?: ReactNode;
  /** … or the actor's avatar. */
  avatar?: { initials: string; src?: string };
  /** Headline, e.g. "Marie Wong-Erasmus commented on". Use <strong>/<span> for emphasis. */
  title: ReactNode;
  /** Context line, e.g. "CCI Insights / APP-2026-00423". */
  context?: ReactNode;
  /** Body text (clamped to two lines). */
  body?: ReactNode;
  /** Quoted content rendered in a subtle card (comment text, insight summary). */
  quote?: ReactNode;
  timestamp: string;
  unread?: boolean;
  onSelect?: () => void;
}

export interface NotificationPanelProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  title?: ReactNode;
  notifications: NotificationItem[];
  tabs?: NotificationTab[];
  /** Controlled active tab id. */
  activeTab?: string;
  defaultActiveTab?: string;
  onTabChange?: (id: string) => void;
  onMarkAllRead?: () => void;
  onClose?: () => void;
  /** Collapses the panel back into the sidebar (the panel-left affordance). */
  onToggleSidebar?: () => void;
  onSettings?: () => void;
  emptyTitle?: ReactNode;
  emptyDescription?: ReactNode;
}

const cx = (...parts: Array<string | false | undefined>) =>
  parts.filter(Boolean).join(" ");

/**
 * Notification inbox shown in the sidebar slot (Figma Sidebar
 * `Variant=Notification Tab` / `Notification Empty`).
 */
export function NotificationPanel({
  title = "Notifications",
  notifications,
  tabs = [],
  activeTab: activeProp,
  defaultActiveTab,
  onTabChange,
  onMarkAllRead,
  onClose,
  onToggleSidebar,
  onSettings,
  emptyTitle = "You’re all caught up",
  emptyDescription = "You’ll be notified here for @mentions, activity, and more",
  className,
  ...rest
}: NotificationPanelProps) {
  const [internalTab, setInternalTab] = useState(defaultActiveTab ?? tabs[0]?.id);
  const active = activeProp ?? internalTab;
  const baseId = useId();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const titleId = `${baseId}-title`;
  const isEmpty = notifications.length === 0;
  const hasUnread = notifications.some((n) => n.unread);

  const select = (id: string) => {
    if (activeProp === undefined) setInternalTab(id);
    onTabChange?.(id);
  };

  const onTabKey = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = tabs.length - 1;
    let next = -1;
    if (event.key === "ArrowRight") next = index === last ? 0 : index + 1;
    else if (event.key === "ArrowLeft") next = index === 0 ? last : index - 1;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = last;
    if (next < 0) return;
    event.preventDefault();
    select(tabs[next].id);
    tabRefs.current[next]?.focus();
  };

  const list = (
    <ul className={styles.list}>
      {notifications.map((n) => {
        const content = (
          <>
            <span className={cx(styles.lead, n.icon ? styles.leadIcon : undefined)} aria-hidden="true">
              {n.icon ??
                (n.avatar?.src ? (
                  <img src={n.avatar.src} alt="" width={24} height={24} />
                ) : (
                  n.avatar?.initials
                ))}
            </span>
            <span className={styles.itemBody}>
              <span className={styles.itemTitle}>{n.title}</span>
              {n.context ? <span className={styles.itemContext}>{n.context}</span> : null}
              {n.body ? <span className={styles.itemText}>{n.body}</span> : null}
              {n.quote ? <span className={styles.itemQuote}>{n.quote}</span> : null}
              <span className={styles.itemTime}>{n.timestamp}</span>
            </span>
            {n.unread ? (
              <span className={styles.unreadDot}>
                <span className={styles.srOnly}>Unread</span>
              </span>
            ) : null}
          </>
        );
        return (
          <li key={n.id} className={cx(styles.item, n.unread && styles.unread)}>
            {n.onSelect ? (
              <button type="button" className={styles.itemInner} onClick={n.onSelect}>
                {content}
              </button>
            ) : (
              <div className={styles.itemInner}>{content}</div>
            )}
          </li>
        );
      })}
    </ul>
  );

  return (
    <section
      className={cx(styles.panel, isEmpty && styles.empty, className)}
      aria-labelledby={titleId}
      {...rest}
    >
      <header className={styles.header}>
        <h2 id={titleId} className={styles.title}>
          {isEmpty ? <Bell className={styles.titleIcon} aria-hidden="true" /> : null}
          {title}
        </h2>
        <div className={styles.headerActions}>
          {onMarkAllRead && hasUnread ? (
            <button type="button" className={styles.textAction} onClick={onMarkAllRead}>
              Mark all read
            </button>
          ) : null}
          {onToggleSidebar ? (
            <button
              type="button"
              className={styles.iconAction}
              aria-label="Toggle sidebar"
              onClick={onToggleSidebar}
            >
              <PanelLeft aria-hidden="true" />
            </button>
          ) : null}
          {onClose ? (
            <button
              type="button"
              className={styles.iconAction}
              aria-label="Close notifications"
              onClick={onClose}
            >
              <X aria-hidden="true" />
            </button>
          ) : null}
        </div>
      </header>

      {isEmpty ? (
        <div className={styles.emptyState} role="status">
          <BellDot className={styles.emptyIcon} aria-hidden="true" />
          <p className={styles.emptyTitle}>{emptyTitle}</p>
          <p className={styles.emptyText}>{emptyDescription}</p>
        </div>
      ) : (
        <>
          {tabs.length > 0 ? (
            <div className={styles.tabs} role="tablist" aria-label="Filter notifications">
              {tabs.map((tab, i) => {
                const selected = tab.id === active;
                return (
                  <button
                    key={tab.id}
                    ref={(el) => {
                      tabRefs.current[i] = el;
                    }}
                    type="button"
                    role="tab"
                    id={`${baseId}-tab-${tab.id}`}
                    aria-selected={selected}
                    aria-controls={`${baseId}-panel`}
                    tabIndex={selected ? 0 : -1}
                    className={cx(styles.tab, selected && styles.tabActive)}
                    onClick={() => select(tab.id)}
                    onKeyDown={(e) => onTabKey(e, i)}
                  >
                    {tab.label}
                    {tab.count ? (
                      <span className={styles.count}>
                        {tab.count}
                        <span className={styles.srOnly}> unread</span>
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          ) : null}
          <div
            className={styles.scroll}
            id={`${baseId}-panel`}
            role={tabs.length > 0 ? "tabpanel" : undefined}
            aria-labelledby={tabs.length > 0 ? `${baseId}-tab-${active}` : undefined}
          >
            {list}
          </div>
        </>
      )}

      {onSettings && !isEmpty ? (
        <footer className={styles.footer}>
          <button type="button" className={styles.settings} onClick={onSettings}>
            <Settings aria-hidden="true" />
            Notification Settings
          </button>
        </footer>
      ) : null}
    </section>
  );
}
