import { forwardRef, useImperativeHandle, useLayoutEffect, useRef, useState } from "react";
import type { ButtonHTMLAttributes, FormEvent, KeyboardEvent, ReactNode } from "react";
import { ArrowUp, ChevronDown, Plus, Square } from "lucide-react";
import { IconButton } from "../IconButton/IconButton";
import styles from "./PromptInput.module.css";

const cx = (...parts: Array<string | false | undefined>) => parts.filter(Boolean).join(" ");

export interface PromptInputProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Enter (without Shift) or the send button. Receives the trimmed text. Uncontrolled inputs clear afterwards. */
  onSubmit?: (text: string) => void;
  placeholder?: string;
  /** Accessible name for the text box. Defaults to the placeholder, then "Message". */
  "aria-label"?: string;
  disabled?: boolean;
  /** The agent is answering: the send button becomes Stop (`onStop`) and Enter no longer sends. */
  busy?: boolean;
  onStop?: () => void;
  /** Grey tab above the box — team / agents status, e.g. "2 Agents tasks running". */
  banner?: ReactNode;
  /** `ChatAttachmentList` shown above the text box. */
  attachments?: ReactNode;
  /** Shows the round + button (attach a file or a source). */
  onAdd?: () => void;
  addLabel?: string;
  /** Extra controls after the + button — usually a `PromptInputChip` for the data source. */
  actions?: ReactNode;
  sendLabel?: string;
  /** Height cap before the text box scrolls. Default 140px (Figma). */
  maxHeight?: number;
  className?: string;
  id?: string;
}

/**
 * The ZAK chat box: an 18px-radius composer with an optional status tab on top,
 * attachments, an auto-growing text box and a footer of + / source / send.
 */
export const PromptInput = forwardRef<HTMLTextAreaElement, PromptInputProps>(function PromptInput(
  {
    value,
    defaultValue = "",
    onValueChange,
    onSubmit,
    placeholder = "Ask about a cohort, mutation, or build a chart…",
    "aria-label": ariaLabel,
    disabled = false,
    busy = false,
    onStop,
    banner,
    attachments,
    onAdd,
    addLabel = "Add attachment",
    actions,
    sendLabel = "Send message",
    maxHeight = 140,
    className,
    id,
  },
  ref,
) {
  const controlled = value !== undefined;
  const [inner, setInner] = useState(defaultValue);
  const text = controlled ? value : inner;
  const areaRef = useRef<HTMLTextAreaElement>(null);
  useImperativeHandle(ref, () => areaRef.current as HTMLTextAreaElement);

  // Grow with the content up to maxHeight, then scroll.
  useLayoutEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
  }, [text, maxHeight]);

  const setText = (next: string) => {
    if (!controlled) setInner(next);
    onValueChange?.(next);
  };

  const canSend = !disabled && !busy && text.trim().length > 0;
  const send = () => {
    if (!canSend) return;
    onSubmit?.(text.trim());
    if (!controlled) setInner("");
  };

  const onFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    send();
  };
  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className={cx(styles.root, disabled && styles.disabled, className)}>
      {banner ? <div className={styles.banner}>{banner}</div> : null}
      <form className={styles.form} onSubmit={onFormSubmit} aria-busy={busy || undefined}>
        {attachments ? <div className={styles.attachments}>{attachments}</div> : null}
        <textarea
          ref={areaRef}
          id={id}
          className={styles.area}
          rows={1}
          value={text}
          placeholder={placeholder}
          aria-label={ariaLabel ?? placeholder ?? "Message"}
          disabled={disabled}
          style={{ maxHeight }}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
        />
        <div className={styles.footer}>
          <div className={styles.left}>
            {onAdd ? (
              <IconButton
                className={styles.round}
                icon={<Plus />}
                aria-label={addLabel}
                disabled={disabled}
                onClick={onAdd}
              />
            ) : null}
            {actions}
          </div>
          {busy ? (
            <IconButton
              className={cx(styles.round, styles.stop)}
              icon={<Square />}
              aria-label="Stop"
              onClick={onStop}
            />
          ) : (
            <IconButton
              type="submit"
              className={cx(styles.round, styles.send)}
              icon={<ArrowUp />}
              aria-label={sendLabel}
              disabled={!canSend}
            />
          )}
        </div>
      </form>
    </div>
  );
});

export interface PromptInputChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** 16px Lucide icon, e.g. `<Database />`. */
  icon?: ReactNode;
  children: ReactNode;
  /** Adds the chevron and `aria-haspopup` — the chip opens a picker. */
  menu?: boolean;
}

/** Pill in the composer footer — the data source in scope ("ZERO cohort"), a mode, a model. */
export function PromptInputChip({
  icon,
  children,
  menu = true,
  className,
  type = "button",
  ...rest
}: PromptInputChipProps) {
  return (
    <button
      type={type}
      className={cx(styles.chip, className)}
      aria-haspopup={menu ? "menu" : undefined}
      {...rest}
    >
      {icon ? (
        <span className={styles.chipIcon} aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span className={styles.chipLabel}>{children}</span>
      {menu ? <ChevronDown className={styles.chipChevron} aria-hidden="true" /> : null}
    </button>
  );
}

export interface PromptInputBannerProps {
  /** 16px Lucide icon or agent avatars. */
  icon?: ReactNode;
  children: ReactNode;
  /** Right-aligned action, e.g. a text button "Change source". */
  action?: ReactNode;
}

/** Content for `PromptInput`'s `banner`: icon + one line of grey-100 status text. */
export function PromptInputBanner({ icon, children, action }: PromptInputBannerProps) {
  return (
    <div className={styles.bannerRow}>
      {icon ? <span className={styles.bannerIcon}>{icon}</span> : null}
      <span className={styles.bannerText}>{children}</span>
      {action ? <span className={styles.bannerAction}>{action}</span> : null}
    </div>
  );
}
