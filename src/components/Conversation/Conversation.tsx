import { useEffect, useId, useRef, useState } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { ChevronDown, ChevronUp, EllipsisVertical, Reply } from "lucide-react";
import { Button } from "../Button/Button";
import styles from "./Conversation.module.css";

export interface ConversationAuthor {
  name: string;
  /** Up to two characters; derived from `name` when omitted. */
  initials?: string;
  /** Photo URL. Falls back to the initials circle. */
  avatarSrc?: string;
}

export interface ConversationComment {
  id: string;
  author: ConversationAuthor;
  /** Pre-formatted, e.g. "10/11/2025" or "3 days ago". */
  timestamp: string;
  /** ISO date for the `<time dateTime>` attribute. */
  dateTime?: string;
  edited?: boolean;
  /** Plain text. Lines starting with "- " or "• " render as a bulleted list. */
  body: string;
  /** Only honoured on the root comment (threads are one level deep, as in Figma). */
  replies?: ConversationComment[];
}

export interface ConversationProps extends Omit<HTMLAttributes<HTMLElement>, "onSubmit"> {
  comment: ConversationComment;
  /** Author used for the "Replying to…" composer. */
  currentUser?: ConversationAuthor;
  /** Called with the parent comment and text. Omit to hide Reply actions. */
  onReply?: (parent: ConversationComment, text: string) => void;
  /** Called with the edited comment and new text. Omit to hide "Edit" in the menu. */
  onEdit?: (comment: ConversationComment, text: string) => void;
  onDelete?: (comment: ConversationComment) => void;
  /** Figma `Collapsed Reply`: when a thread has more replies than this, the
   *  earlier ones hide behind "Show more replies". Omit to always show all (Figma `Full`). */
  collapseAfter?: number;
  /** Open a comment in edit mode initially (Figma `Edit Comment`). */
  defaultEditingId?: string;
  /** Open the reply composer for a comment initially (Figma `Reply To Comment`). */
  defaultReplyingToId?: string;
  /** Can this user edit/delete a comment? Defaults to "is currentUser the author". */
  canModify?: (comment: ConversationComment) => boolean;
}

const cx = (...parts: Array<string | false | undefined>) =>
  parts.filter(Boolean).join(" ");

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

/** Local initials circle / photo (deliberately not the shared Avatar component). */
function AuthorAvatar({ author }: { author: ConversationAuthor }) {
  if (author.avatarSrc) {
    return <img className={styles.avatar} src={author.avatarSrc} alt="" width={32} height={32} />;
  }
  return (
    <span className={cx(styles.avatar, styles.initials)} aria-hidden="true">
      {author.initials ?? initialsOf(author.name)}
    </span>
  );
}

const BULLET = /^\s*(?:[-•*])\s+/;

function Body({ text }: { text: string }) {
  const lines = text.split("\n");
  const blocks: ReactNode[] = [];
  let bullets: string[] = [];
  const flush = () => {
    if (bullets.length) {
      blocks.push(
        <ul key={`ul-${blocks.length}`} className={styles.list}>
          {bullets.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>,
      );
      bullets = [];
    }
  };
  lines.forEach((line, i) => {
    if (BULLET.test(line)) bullets.push(line.replace(BULLET, ""));
    else {
      flush();
      if (line.trim()) blocks.push(<p key={`p-${i}`}>{line}</p>);
    }
  });
  flush();
  return <div className={styles.body}>{blocks}</div>;
}

function CommentMenu({
  label,
  onEdit,
  onDelete,
}: {
  label: string;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
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

  if (!onEdit && !onDelete) return null;

  const item = (text: string, fn: () => void, danger = false) => (
    <button
      type="button"
      role="menuitem"
      className={cx(styles.menuItem, danger && styles.menuDanger)}
      onClick={() => {
        setOpen(false);
        fn();
      }}
    >
      {text}
    </button>
  );

  return (
    <div className={styles.menuRoot} ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className={styles.menuTrigger}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((v) => !v)}
      >
        <EllipsisVertical aria-hidden="true" />
      </button>
      {open ? (
        <div className={styles.menu} role="menu" id={menuId}>
          {onEdit ? item("Edit", onEdit) : null}
          {onDelete ? item("Delete", onDelete, true) : null}
        </div>
      ) : null}
    </div>
  );
}

function Composer({
  initial = "",
  placeholder,
  label,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial?: string;
  placeholder?: string;
  label: string;
  submitLabel: string;
  onSubmit: (text: string) => void;
  onCancel: () => void;
}) {
  const [text, setText] = useState(initial);
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.focus({ preventScroll: true });
    el.setSelectionRange(el.value.length, el.value.length);
  }, []);
  const canSubmit = text.trim().length > 0 && text !== initial;
  return (
    <form
      className={styles.composer}
      onSubmit={(e) => {
        e.preventDefault();
        if (canSubmit) onSubmit(text.trim());
      }}
    >
      <textarea
        ref={ref}
        className={styles.textarea}
        aria-label={label}
        placeholder={placeholder}
        value={text}
        rows={4}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.preventDefault();
            onCancel();
          } else if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && canSubmit) {
            e.preventDefault();
            onSubmit(text.trim());
          }
        }}
      />
      <div className={styles.composerActions}>
        <Button type="submit" variant="bold" size="sm" disabled={!canSubmit}>
          {submitLabel}
        </Button>
        <Button type="button" variant="subtle" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

/**
 * Comment thread (Figma "Conversations"): a root comment with author initials,
 * timestamp, body, Reply action and overflow menu, plus one level of replies
 * joined by a thread rail. Supports inline editing, a reply composer and
 * collapsing earlier replies.
 */
export function Conversation({
  comment,
  currentUser,
  onReply,
  onEdit,
  onDelete,
  collapseAfter,
  defaultEditingId,
  defaultReplyingToId,
  canModify,
  className,
  ...rest
}: ConversationProps) {
  const [editingId, setEditingId] = useState<string | undefined>(defaultEditingId);
  const [replyTo, setReplyTo] = useState<ConversationComment | undefined>(() => {
    if (!defaultReplyingToId) return undefined;
    if (comment.id === defaultReplyingToId) return comment;
    return comment.replies?.find((r) => r.id === defaultReplyingToId);
  });
  const [expanded, setExpanded] = useState(false);

  const mayModify = (c: ConversationComment) =>
    canModify ? canModify(c) : currentUser ? currentUser.name === c.author.name : true;

  const replies = comment.replies ?? [];
  const collapsible = collapseAfter !== undefined && replies.length > collapseAfter;
  const hiddenCount = collapsible && !expanded ? replies.length - (collapseAfter ?? 0) : 0;
  const visibleReplies = replies.slice(hiddenCount);

  const renderComment = (c: ConversationComment, isRoot: boolean) => {
    const editing = editingId === c.id;
    const replyingHere = replyTo?.id === c.id;
    const modifiable = mayModify(c);
    return (
      <article className={cx(styles.comment, isRoot && styles.root)} aria-label={`Comment by ${c.author.name}`}>
        <div className={styles.avatarCol}>
          <AuthorAvatar author={c.author} />
        </div>
        <div className={styles.content}>
          <header className={styles.meta}>
            <span className={styles.author}>{c.author.name}</span>
            <time className={styles.time} dateTime={c.dateTime}>
              {c.timestamp}
            </time>
            {c.edited ? <span className={styles.time}>Edited</span> : null}
            <span className={styles.metaSpacer} />
            {!editing ? (
              <CommentMenu
                label={`More actions for comment by ${c.author.name}`}
                onEdit={onEdit && modifiable ? () => setEditingId(c.id) : undefined}
                onDelete={onDelete && modifiable ? () => onDelete(c) : undefined}
              />
            ) : null}
          </header>
          {editing ? (
            <Composer
              initial={c.body}
              label={`Edit comment by ${c.author.name}`}
              submitLabel="Save"
              onSubmit={(text) => {
                onEdit?.(c, text);
                setEditingId(undefined);
              }}
              onCancel={() => setEditingId(undefined)}
            />
          ) : (
            <Body text={c.body} />
          )}
          {!editing && onReply && !replyingHere ? (
            <div className={styles.actions}>
              <button
                type="button"
                className={styles.replyAction}
                onClick={() => setReplyTo(c)}
                aria-label={`Reply to ${c.author.name}`}
              >
                <Reply aria-hidden="true" />
                Reply
              </button>
            </div>
          ) : null}
        </div>
      </article>
    );
  };

  const composerItem =
    replyTo && onReply ? (
      <li className={styles.threadItem}>
        <div className={styles.comment}>
          <div className={styles.avatarCol}>
            <AuthorAvatar author={currentUser ?? { name: "You" }} />
          </div>
          <div className={styles.content}>
            <div className={styles.meta}>
              <span className={styles.author}>Replying to {replyTo.author.name}</span>
            </div>
            <Composer
              label={`Reply to ${replyTo.author.name}`}
              placeholder="Write a reply..."
              submitLabel="Send"
              onSubmit={(text) => {
                onReply(replyTo, text);
                setReplyTo(undefined);
              }}
              onCancel={() => setReplyTo(undefined)}
            />
          </div>
        </div>
      </li>
    ) : null;

  const hasThread = replies.length > 0 || composerItem !== null;

  return (
    <section className={cx(styles.conversation, className)} {...rest}>
      <div className={cx(styles.rootWrap, hasThread && styles.hasThread)}>
        {renderComment(comment, true)}
      </div>
      {hasThread ? (
        <ul className={styles.thread}>
          {collapsible ? (
            <li className={styles.threadItem}>
              <button
                type="button"
                className={styles.toggleReplies}
                aria-expanded={expanded}
                onClick={() => setExpanded((v) => !v)}
              >
                {expanded ? "Show fewer replies" : `Show more replies`}
                {expanded ? <ChevronUp aria-hidden="true" /> : <ChevronDown aria-hidden="true" />}
                {!expanded ? <span className={styles.srOnly}> ({hiddenCount} hidden)</span> : null}
              </button>
            </li>
          ) : null}
          {visibleReplies.map((r) => (
            <li key={r.id} className={styles.threadItem}>
              {renderComment(r, false)}
            </li>
          ))}
          {composerItem}
        </ul>
      ) : null}
    </section>
  );
}
