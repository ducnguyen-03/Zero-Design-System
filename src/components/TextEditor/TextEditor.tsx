import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { HTMLAttributes, KeyboardEvent, ReactNode } from "react";
import {
  Baseline,
  Bold,
  BookOpenText,
  Italic,
  List,
  ListIndentDecrease,
  ListIndentIncrease,
  ListOrdered,
  PaintBucket,
  Redo2,
  Strikethrough,
  Underline,
  Undo2,
} from "lucide-react";
import styles from "./TextEditor.module.css";

export type TextEditorCommand =
  | "undo"
  | "redo"
  | "bold"
  | "italic"
  | "underline"
  | "strikeThrough"
  | "foreColor"
  | "hiliteColor"
  | "insertUnorderedList"
  | "insertOrderedList"
  | "indent"
  | "outdent"
  // Still accepted by `onCommand` for backwards compatibility (no longer in the toolbar).
  | "justifyLeft"
  | "justifyCenter"
  | "justifyRight"
  | "blockquote"
  | "createLink";

interface ToolDef {
  command: TextEditorCommand;
  label: string;
  icon: ReactNode;
  /** Toggle buttons expose aria-pressed. */
  toggle?: boolean;
}

/** Toolbar groups (BioNexus editor): history · inline styles · colour · lists & indent. */
const GROUPS: ToolDef[][] = [
  [
    { command: "undo", label: "Undo", icon: <Undo2 /> },
    { command: "redo", label: "Redo", icon: <Redo2 /> },
  ],
  [
    { command: "bold", label: "Bold", icon: <Bold />, toggle: true },
    { command: "italic", label: "Italic", icon: <Italic />, toggle: true },
    { command: "underline", label: "Underline", icon: <Underline />, toggle: true },
    { command: "strikeThrough", label: "Strikethrough", icon: <Strikethrough />, toggle: true },
  ],
  [
    { command: "foreColor", label: "Text colour", icon: <Baseline /> },
    { command: "hiliteColor", label: "Highlight colour", icon: <PaintBucket /> },
  ],
  [
    { command: "insertUnorderedList", label: "Bulleted list", icon: <List />, toggle: true },
    { command: "insertOrderedList", label: "Numbered list", icon: <ListOrdered />, toggle: true },
    { command: "indent", label: "Increase indent", icon: <ListIndentIncrease /> },
    { command: "outdent", label: "Decrease indent", icon: <ListIndentDecrease /> },
  ],
];

const cx = (...parts: Array<string | false | undefined>) =>
  parts.filter(Boolean).join(" ");

/* ── Toolbar ─────────────────────────────────────────────── */

export interface TextEditorToolbarProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Figma `Add Evidence=True` — shows the trailing "Add evidence" action. */
  addEvidence?: boolean;
  onAddEvidence?: () => void;
  addEvidenceLabel?: string;
  onCommand?: (command: TextEditorCommand) => void;
  /** Commands currently active at the caret (drives aria-pressed). */
  activeCommands?: ReadonlySet<TextEditorCommand>;
  /** Commands that can't run right now — e.g. undo with no history (rendered at 50%). */
  disabledCommands?: ReadonlySet<TextEditorCommand>;
  disabled?: boolean;
}

/**
 * Formatting toolbar (Figma "Text Editor"). A WAI-ARIA `toolbar`: one tab stop,
 * arrow keys / Home / End move between buttons.
 */
export function TextEditorToolbar({
  addEvidence = false,
  onAddEvidence,
  addEvidenceLabel = "Add evidence",
  onCommand,
  activeCommands,
  disabledCommands,
  disabled = false,
  className,
  "aria-label": ariaLabel = "Text formatting",
  ...rest
}: TextEditorToolbarProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [focusIndex, setFocusIndex] = useState(0);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const buttons = Array.from(
      ref.current?.querySelectorAll<HTMLButtonElement>("button[data-tool]") ?? [],
    );
    const current = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (current < 0) return;
    let next = -1;
    if (event.key === "ArrowRight") next = (current + 1) % buttons.length;
    else if (event.key === "ArrowLeft") next = (current - 1 + buttons.length) % buttons.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = buttons.length - 1;
    if (next < 0) return;
    event.preventDefault();
    setFocusIndex(next);
    buttons[next].focus();
  };

  let index = -1;
  const toolButton = (
    key: string,
    label: string,
    icon: ReactNode,
    onClick: (() => void) | undefined,
    pressed?: boolean,
    unavailable = false,
  ) => {
    index += 1;
    const myIndex = index;
    return (
      <button
        key={key}
        type="button"
        data-tool={key}
        className={styles.tool}
        aria-label={label}
        title={label}
        aria-pressed={pressed}
        tabIndex={myIndex === focusIndex ? 0 : -1}
        disabled={disabled || unavailable}
        // Keep the editor's selection when clicking a toolbar button.
        onMouseDown={(e) => e.preventDefault()}
        onFocus={() => setFocusIndex(myIndex)}
        onClick={onClick}
      >
        {icon}
      </button>
    );
  };

  return (
    <div
      ref={ref}
      role="toolbar"
      aria-label={ariaLabel}
      aria-disabled={disabled || undefined}
      className={cx(styles.toolbar, className)}
      onKeyDown={onKeyDown}
      {...rest}
    >
      {GROUPS.map((group, g) => (
        <div key={g} className={styles.group}>
          {group.map((tool) =>
            toolButton(
              tool.command,
              tool.label,
              tool.icon,
              () => onCommand?.(tool.command),
              tool.toggle ? Boolean(activeCommands?.has(tool.command)) : undefined,
              Boolean(disabledCommands?.has(tool.command)),
            ),
          )}
          <span className={styles.divider} aria-hidden="true" />
        </div>
      ))}
      {addEvidence ? (
        <div className={styles.group}>
          {toolButton("addEvidence", addEvidenceLabel, <BookOpenText />, onAddEvidence)}
        </div>
      ) : null}
    </div>
  );
}

/* ── Editor ──────────────────────────────────────────────── */

export interface TextEditorProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  /** Accessible name of the editing area. */
  label: string;
  /** Visually hide the label (still announced). */
  hideLabel?: boolean;
  /** Shows a red asterisk after the label and sets aria-required. */
  required?: boolean;
  /** Controlled HTML value. */
  value?: string;
  /** Initial HTML when uncontrolled. */
  defaultValue?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  /** Figma `Add Evidence` axis. */
  addEvidence?: boolean;
  onAddEvidence?: () => void;
  disabled?: boolean;
  /** Min height of the editing area in px. */
  minHeight?: number;
  /** Called for "Insert link" — return the URL (or null to cancel). Defaults to `window.prompt`. */
  requestLink?: () => string | null;
  /** Called for "Text colour" / "Highlight colour" — return a CSS colour (or null). Defaults to a native colour picker. */
  requestColor?: (command: "foreColor" | "hiliteColor") => string | null | Promise<string | null>;
}

const TRACKED: TextEditorCommand[] = [
  "bold",
  "italic",
  "underline",
  "strikeThrough",
  "justifyLeft",
  "justifyCenter",
  "justifyRight",
  "insertUnorderedList",
  "insertOrderedList",
];

/** Commands whose availability is polled (undo / redo history). */
const AVAILABILITY: TextEditorCommand[] = ["undo", "redo"];

const pickColor = () =>
  new Promise<string | null>((resolve) => {
    const input = document.createElement("input");
    input.type = "color";
    input.addEventListener("change", () => resolve(input.value), { once: true });
    input.addEventListener("cancel", () => resolve(null), { once: true });
    input.click();
  });

/**
 * Minimal rich-text editor: `TextEditorToolbar` over a `contentEditable`
 * region. Dependency-free (uses `document.execCommand`), emits HTML.
 */
export function TextEditor({
  label,
  hideLabel = false,
  required = false,
  value,
  defaultValue = "",
  onChange,
  placeholder,
  addEvidence = false,
  onAddEvidence,
  disabled = false,
  minHeight = 120,
  requestLink = () => window.prompt("Link URL", "https://"),
  requestColor = pickColor,
  className,
  ...rest
}: TextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const labelId = useId();
  const [active, setActive] = useState<Set<TextEditorCommand>>(new Set());
  const [unavailable, setUnavailable] = useState<Set<TextEditorCommand>>(new Set(AVAILABILITY));
  const [empty, setEmpty] = useState(!(value ?? defaultValue));

  // Seed / sync HTML without clobbering the caret while typing.
  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    const next = value ?? (el.innerHTML ? null : defaultValue);
    if (next !== null && next !== el.innerHTML) {
      el.innerHTML = next;
      setEmpty(!el.textContent);
    }
  }, [value, defaultValue]);

  const refreshState = useCallback(() => {
    const el = editorRef.current;
    const sel = document.getSelection();
    if (!el || !sel || !sel.anchorNode || !el.contains(sel.anchorNode)) return;
    const off = new Set<TextEditorCommand>();
    for (const cmd of AVAILABILITY) {
      try {
        if (!document.queryCommandEnabled(cmd)) off.add(cmd);
      } catch {
        /* unsupported command */
      }
    }
    setUnavailable(off);
    const next = new Set<TextEditorCommand>();
    for (const cmd of TRACKED) {
      try {
        if (document.queryCommandState(cmd)) next.add(cmd);
      } catch {
        /* unsupported command */
      }
    }
    setActive(next);
  }, []);

  useEffect(() => {
    document.addEventListener("selectionchange", refreshState);
    return () => document.removeEventListener("selectionchange", refreshState);
  }, [refreshState]);

  const emit = () => {
    const el = editorRef.current;
    if (!el) return;
    setEmpty(!el.textContent);
    onChange?.(el.innerHTML);
  };

  const run = async (command: TextEditorCommand) => {
    const el = editorRef.current;
    if (!el || disabled) return;
    el.focus();
    if (command === "createLink") {
      const url = requestLink();
      if (!url) return;
      document.execCommand("createLink", false, url);
    } else if (command === "foreColor" || command === "hiliteColor") {
      const sel = document.getSelection();
      const range = sel && sel.rangeCount ? sel.getRangeAt(0).cloneRange() : null;
      const color = await requestColor(command);
      if (!color) return;
      el.focus();
      if (range && sel) {
        sel.removeAllRanges();
        sel.addRange(range);
      }
      document.execCommand(command, false, color);
    } else if (command === "blockquote") {
      const inQuote = document.queryCommandValue("formatBlock").toLowerCase() === "blockquote";
      document.execCommand("formatBlock", false, inQuote ? "p" : "blockquote");
    } else {
      document.execCommand(command);
    }
    emit();
    refreshState();
  };

  return (
    <div className={cx(styles.editor, disabled && styles.disabled, className)} {...rest}>
      <span id={labelId} className={hideLabel ? styles.srOnly : styles.label}>
        {label}
        {required ? (
          <span className={styles.required} aria-hidden="true">
            {" *"}
          </span>
        ) : null}
      </span>
      <div className={styles.frame}>
        <TextEditorToolbar
          addEvidence={addEvidence}
          onAddEvidence={onAddEvidence}
          onCommand={run}
          activeCommands={active}
          disabledCommands={unavailable}
          disabled={disabled}
          aria-controls={`${labelId}-area`}
        />
        <div className={styles.areaWrap}>
          {empty && placeholder ? (
            <span className={styles.placeholder} aria-hidden="true">
              {placeholder}
            </span>
          ) : null}
          <div
            ref={editorRef}
            id={`${labelId}-area`}
            className={styles.area}
            style={{ minHeight }}
            role="textbox"
            aria-multiline="true"
            aria-labelledby={labelId}
            aria-placeholder={placeholder}
            aria-required={required || undefined}
            aria-disabled={disabled || undefined}
            contentEditable={!disabled}
            suppressContentEditableWarning
            onInput={() => {
              emit();
              refreshState();
            }}
            onBlur={emit}
          />
        </div>
      </div>
    </div>
  );
}
