import { Children } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import {
  CircleAlert,
  Database,
  File,
  FileCode,
  FileSpreadsheet,
  FileText,
  Image as ImageIcon,
  LoaderCircle,
  X,
} from "lucide-react";
import styles from "./ChatAttachment.module.css";

const cx = (...parts: Array<string | false | undefined>) => parts.filter(Boolean).join(" ");

export type ChatAttachmentKind = "document" | "spreadsheet" | "image" | "code" | "data" | "file";
export type ChatAttachmentStatus = "ready" | "uploading" | "error";

const EXT: Record<string, ChatAttachmentKind> = {
  pdf: "document", doc: "document", docx: "document", txt: "document", md: "document", rtf: "document",
  csv: "spreadsheet", tsv: "spreadsheet", xls: "spreadsheet", xlsx: "spreadsheet",
  png: "image", jpg: "image", jpeg: "image", gif: "image", webp: "image", svg: "image",
  json: "code", py: "code", r: "code", js: "code", ts: "code", sql: "code", ipynb: "code",
  vcf: "data", maf: "data", bam: "data", fastq: "data", parquet: "data",
};

const kindOf = (name: string): ChatAttachmentKind =>
  EXT[name.split(".").pop()?.toLowerCase() ?? ""] ?? "file";

const ICONS: Record<ChatAttachmentKind, ReactNode> = {
  document: <FileText />,
  spreadsheet: <FileSpreadsheet />,
  image: <ImageIcon />,
  code: <FileCode />,
  data: <Database />,
  file: <File />,
};

export interface ChatAttachmentProps extends HTMLAttributes<HTMLDivElement> {
  /** File or source name, e.g. "cohort-export.csv". */
  name: string;
  /** Secondary line, e.g. "CSV · 24 KB". Replaced by progress / error text when relevant. */
  meta?: string;
  /** Picks the icon. Inferred from the file extension when omitted. */
  kind?: ChatAttachmentKind;
  status?: ChatAttachmentStatus;
  /** 0–100, shown while `uploading`. */
  progress?: number;
  /** Why the upload failed — shown in red with `status="error"`. */
  error?: string;
  /** Thumbnail for images (card size only). */
  previewSrc?: string;
  /** Shows the remove button. */
  onRemove?: () => void;
  /** `md` = 52px card (attachments above the prompt); `sm` = 28px pill, like the "ZERO cohort" source chip. */
  size?: "md" | "sm";
}

/** A file or data source attached to a prompt or a message. */
export function ChatAttachment({
  name,
  meta,
  kind,
  status = "ready",
  progress,
  error,
  previewSrc,
  onRemove,
  size = "md",
  className,
  ...rest
}: ChatAttachmentProps) {
  const k = kind ?? kindOf(name);
  const uploading = status === "uploading";
  const failed = status === "error";
  const pct = progress === undefined ? undefined : Math.round(Math.min(100, Math.max(0, progress)));
  const icon = failed ? (
    <CircleAlert />
  ) : uploading ? (
    <LoaderCircle className={styles.spin} />
  ) : (
    ICONS[k]
  );
  const detail = failed
    ? (error ?? "Upload failed")
    : uploading
      ? pct === undefined
        ? "Uploading…"
        : `Uploading · ${pct}%`
      : meta;

  return (
    <div
      className={cx(styles.attachment, styles[size], failed && styles.error, className)}
      aria-busy={uploading || undefined}
      {...rest}
    >
      {size === "md" && previewSrc && status === "ready" ? (
        <img className={styles.thumb} src={previewSrc} alt="" />
      ) : (
        <span className={styles.tile} aria-hidden="true">
          {icon}
        </span>
      )}
      <span className={styles.text}>
        <span className={styles.name} title={name}>
          {name}
        </span>
        {size === "md" && detail ? (
          <span className={styles.meta} role={failed ? "alert" : undefined}>
            {detail}
          </span>
        ) : size === "sm" && (failed || uploading) ? (
          <span className={styles.srOnly}>{detail}</span>
        ) : null}
      </span>
      {onRemove ? (
        <button
          type="button"
          className={styles.remove}
          aria-label={`Remove ${name}`}
          onClick={onRemove}
        >
          <X aria-hidden="true" />
        </button>
      ) : null}
      {uploading && pct !== undefined && size === "md" ? (
        <span className={styles.progress} aria-hidden="true">
          <span style={{ width: `${pct}%` }} />
        </span>
      ) : null}
    </div>
  );
}

export interface ChatAttachmentListProps extends HTMLAttributes<HTMLUListElement> {
  /** `ChatAttachment`s. */
  children: ReactNode;
  "aria-label"?: string;
}

/** Wrapping row of attachments, exposed as a list. */
export function ChatAttachmentList({
  children,
  className,
  "aria-label": ariaLabel = "Attachments",
  ...rest
}: ChatAttachmentListProps) {
  return (
    <ul className={cx(styles.list, className)} aria-label={ariaLabel} {...rest}>
      {Children.map(children, (child) => (child ? <li>{child}</li> : null))}
    </ul>
  );
}
