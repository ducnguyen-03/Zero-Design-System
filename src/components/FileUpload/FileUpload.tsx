import { forwardRef, useEffect, useId, useImperativeHandle, useRef, useState } from "react";
import type { ChangeEvent, CSSProperties, DragEvent, ReactNode } from "react";
import { FileText, Upload, X } from "lucide-react";
import styles from "./FileUpload.module.css";

/**
 * Figma `Size`: Small → "sm" (40px row), Medium → "md" (48px row),
 * Large → "lg" (116px stacked zone), Fill → "fill" (borderless, fills its parent).
 */
export type FileUploadSize = "sm" | "md" | "lg" | "fill";

export interface FileUploadProps {
  label?: string;
  /** Helper text between the label and the drop zone. */
  helpText?: string;
  /** Error message below the zone; presence flips the border to red. */
  errorText?: string;
  size?: FileUploadSize;
  /** Passed to the hidden file input, e.g. ".vcf,.bam" or "image/*". */
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  id?: string;
  /** Controlled file list. */
  files?: File[];
  defaultFiles?: File[];
  /** Fires with the full, updated list after add or remove. */
  onFilesChange?: (files: File[]) => void;
  /** Show the selected-files list under the zone. Default true. */
  showFileList?: boolean;
  /** Lead copy. Default "Drag and drop or". */
  title?: ReactNode;
  /** Link-styled action copy. Default "browse your files". */
  actionText?: ReactNode;
  /** Small line inside the drop zone under the copy, e.g. "PDF or DOCX · Max 10MB". Stacked sizes (`lg`, `fill`) only. */
  hint?: ReactNode;
  /** Accessible name for the drop zone when the visible label is rendered outside the component. */
  "aria-label"?: string;
  className?: string;
  style?: CSSProperties;
}

const cx = (...parts: Array<string | false | undefined | null>) =>
  parts.filter(Boolean).join(" ");

const formatBytes = (n: number) => {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`;
  return `${(n / 1024 / 1024 / 1024).toFixed(1)} GB`;
};

/** Matches a file against an `accept` string (extensions, exact or wildcard MIME). */
const accepts = (file: File, accept?: string) => {
  if (!accept) return true;
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return accept
    .split(",")
    .map((a) => a.trim().toLowerCase())
    .filter(Boolean)
    .some((a) =>
      a.startsWith(".")
        ? name.endsWith(a)
        : a.endsWith("/*")
          ? type.startsWith(a.slice(0, -1))
          : type === a,
    );
};

export const FileUpload = forwardRef<HTMLInputElement, FileUploadProps>(
  function FileUpload(
    {
      label,
      helpText,
      errorText,
      size = "lg",
      accept,
      multiple = false,
      disabled = false,
      required,
      name,
      id,
      files: filesProp,
      defaultFiles,
      onFilesChange,
      showFileList = true,
      title = "Drag and drop or",
      actionText = "browse your files",
      hint,
      "aria-label": ariaLabel,
      className,
      style,
    },
    ref,
  ) {
    const autoId = useId();
    const baseId = id ?? autoId;
    const labelId = `${baseId}-label`;
    const helpId = `${baseId}-help`;
    const errorId = `${baseId}-error`;
    const hasError = Boolean(errorText);

    const inputRef = useRef<HTMLInputElement>(null);
    useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    const isControlled = filesProp !== undefined;
    const [inner, setInner] = useState<File[]>(defaultFiles ?? []);
    const files = isControlled ? filesProp : inner;
    const [dragging, setDragging] = useState(false);
    const dragDepth = useRef(0);

    // Mirror the list into the native input so `name` submits dropped files too.
    useEffect(() => {
      const input = inputRef.current;
      if (!input || typeof DataTransfer === "undefined") return;
      try {
        const dt = new DataTransfer();
        files.forEach((f) => dt.items.add(f));
        input.files = dt.files;
      } catch {
        /* Older browsers: form submission only carries browsed files. */
      }
    }, [files]);

    const commit = (next: File[]) => {
      if (!isControlled) setInner(next);
      onFilesChange?.(next);
    };

    const addFiles = (list: FileList | null) => {
      if (!list || !list.length) return;
      const incoming = Array.from(list).filter((f) => accepts(f, accept));
      if (!incoming.length) return;
      commit(multiple ? [...files, ...incoming] : incoming.slice(0, 1));
    };

    const removeAt = (i: number) => commit(files.filter((_, k) => k !== i));

    const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
      addFiles(e.target.files);
    };

    const onDragEnter = (e: DragEvent<HTMLButtonElement>) => {
      if (disabled) return;
      e.preventDefault();
      dragDepth.current += 1;
      setDragging(true);
    };
    const onDragOver = (e: DragEvent<HTMLButtonElement>) => {
      if (disabled) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
    };
    const onDragLeave = () => {
      dragDepth.current = Math.max(0, dragDepth.current - 1);
      if (dragDepth.current === 0) setDragging(false);
    };
    const onDrop = (e: DragEvent<HTMLButtonElement>) => {
      if (disabled) return;
      e.preventDefault();
      dragDepth.current = 0;
      setDragging(false);
      addFiles(e.dataTransfer.files);
    };

    const stacked = size === "lg" || size === "fill";
    const showHint = hint != null && stacked;
    const hintId = `${baseId}-hint`;

    const describedBy =
      [helpText ? helpId : null, showHint ? hintId : null, hasError ? errorId : null]
        .filter(Boolean)
        .join(" ") || undefined;

    const errorNode = hasError ? (
      <span id={errorId} className={styles.errorText} role="alert">
        {errorText}
      </span>
    ) : null;

    return (
      <div
        className={cx(styles.field, size === "fill" && styles.fieldFill, className)}
        style={style}
      >
        {label ? (
          <span id={labelId} className={styles.label}>
            {label}
            {required ? (
              <span className={styles.required} aria-hidden="true">
                {" "}
                *
              </span>
            ) : null}
          </span>
        ) : null}
        {helpText ? (
          <span id={helpId} className={styles.help}>
            {helpText}
          </span>
        ) : null}

        <button
          type="button"
          className={cx(
            styles.zone,
            styles[size],
            stacked && styles.stacked,
            hasError && styles.error,
            dragging && styles.dragging,
          )}
          disabled={disabled}
          aria-labelledby={label ? `${labelId} ${baseId}-cta` : undefined}
          aria-label={label ? undefined : (ariaLabel ?? "Upload files")}
          aria-describedby={describedBy}
          aria-invalid={hasError || undefined}
          onClick={() => inputRef.current?.click()}
          onDragEnter={onDragEnter}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          <Upload className={styles.icon} aria-hidden="true" />
          <span id={`${baseId}-cta`} className={styles.copy}>
            <span className={styles.title}>{title}</span>{" "}
            <span className={styles.action}>{actionText}</span>
          </span>
          {showHint ? (
            <span id={hintId} className={styles.hint}>
              {hint}
            </span>
          ) : null}
          {size === "fill" ? errorNode : null}
        </button>

        <input
          ref={inputRef}
          id={baseId}
          type="file"
          className={styles.srOnly}
          tabIndex={-1}
          aria-hidden="true"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          required={required && files.length === 0}
          name={name}
          onChange={onInputChange}
        />

        {size !== "fill" ? errorNode : null}

        {showFileList && files.length ? (
          <ul className={styles.files} aria-label="Selected files">
            {files.map((f, i) => (
              <li key={`${f.name}-${f.size}-${i}`} className={styles.file}>
                <FileText className={styles.fileIcon} aria-hidden="true" />
                <span className={styles.fileName} title={f.name}>
                  {f.name}
                </span>
                <span className={styles.fileSize}>{formatBytes(f.size)}</span>
                {!disabled ? (
                  <button
                    type="button"
                    className={styles.fileRemove}
                    aria-label={`Remove ${f.name}`}
                    onClick={() => removeAt(i)}
                  >
                    <X />
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    );
  },
);
