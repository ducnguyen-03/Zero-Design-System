import { useCallback, useEffect, useId, useRef } from "react";
import type { KeyboardEvent as ReactKeyboardEvent, MouseEvent, ReactNode, RefObject } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Button } from "../Button/Button";
import styles from "./Modal.module.css";

export type ModalSize = "xs" | "sm" | "md" | "lg";

export interface ModalProps {
  /** Whether the dialog is shown. */
  open: boolean;
  /** Called on Escape, backdrop click, or the header close button. */
  onClose: () => void;
  /** Header title — also the dialog's accessible name. */
  title: ReactNode;
  /** `xs` 428px, `sm` 800px, `md` 1000px (max 720 tall), `lg` 1200px (max 900 tall). */
  size?: ModalSize;
  /** Body content. Scrolls when it overflows the max height. */
  children?: ReactNode;
  /** Footer slot — usually a `<ModalFooter>`. */
  footer?: ReactNode;
  /** Header close (X) button. Defaults to shown for sm/md/lg, hidden for xs (per Figma). */
  showCloseButton?: boolean;
  /** Close when the dimmed backdrop is clicked. Default true. */
  closeOnBackdropClick?: boolean;
  /** Close when Escape is pressed. Default true. */
  closeOnEscape?: boolean;
  /** Element to focus on open. Defaults to the first focusable element in the body/footer. */
  initialFocusRef?: RefObject<HTMLElement | null>;
  /** Accessible label for the close button. */
  closeLabel?: string;
  /** id of the element describing the dialog (aria-describedby). */
  "aria-describedby"?: string;
  /** Use role="alertdialog" (for confirmations that interrupt the user). */
  alert?: boolean;
  /** Render in place instead of portalling to document.body with a backdrop.
   *  Intended for documentation/static previews only; no focus trap or scroll lock. */
  inline?: boolean;
  className?: string;
}

const cx = (...parts: Array<string | false | undefined>) =>
  parts.filter(Boolean).join(" ");

const FOCUSABLE =
  'a[href], area[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), iframe, [contenteditable="true"], [tabindex]:not([tabindex="-1"])';

/** Stack of open modals so Escape / focus trapping only affects the topmost one. */
const openStack: string[] = [];

function getFocusable(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => !el.hasAttribute("disabled") && el.getAttribute("aria-hidden") !== "true",
  );
}

export function Modal({
  open,
  onClose,
  title,
  size = "xs",
  children,
  footer,
  showCloseButton,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  initialFocusRef,
  closeLabel = "Close",
  "aria-describedby": describedBy,
  alert = false,
  inline = false,
  className,
}: ModalProps) {
  const id = useId();
  const titleId = `${id}-title`;
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const backdropDown = useRef(false);

  const withClose = showCloseButton ?? size !== "xs";

  // Focus management, scroll lock, stack registration.
  useEffect(() => {
    if (!open || inline) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    openStack.push(id);

    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    const frame = requestAnimationFrame(() => {
      const dialog = dialogRef.current;
      if (!dialog) return;
      const target =
        initialFocusRef?.current ??
        getFocusable(dialog).find((el) => el !== closeRef.current) ??
        closeRef.current ??
        dialog;
      target.focus();
    });

    // Pull focus back if it escapes the topmost dialog (e.g. clicking the page behind).
    const onFocusIn = (e: FocusEvent) => {
      const dialog = dialogRef.current;
      if (!dialog || openStack[openStack.length - 1] !== id) return;
      if (e.target instanceof Node && !dialog.contains(e.target)) dialog.focus();
    };
    document.addEventListener("focusin", onFocusIn);

    return () => {
      document.removeEventListener("focusin", onFocusIn);
      cancelAnimationFrame(frame);
      const idx = openStack.lastIndexOf(id);
      if (idx !== -1) openStack.splice(idx, 1);
      if (openStack.length === 0) document.body.style.overflow = overflow;
      previouslyFocused?.focus?.();
    };
  }, [open, inline, id, initialFocusRef]);

  const onKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLDivElement>) => {
      if (inline || openStack[openStack.length - 1] !== id) return;
      if (e.key === "Escape" && closeOnEscape) {
        e.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (e.key !== "Tab") return;
      const dialog = dialogRef.current;
      if (!dialog) return;
      const focusable = getFocusable(dialog);
      if (focusable.length === 0) {
        e.preventDefault();
        dialog.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || active === dialog)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    },
    [closeOnEscape, id, inline],
  );

  if (!open) return null;

  const onBackdropMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    backdropDown.current = e.target === e.currentTarget;
  };
  const onBackdropClick = (e: MouseEvent<HTMLDivElement>) => {
    // Only close when the press both started and ended on the backdrop,
    // so drag-selecting text inside the dialog never dismisses it.
    if (closeOnBackdropClick && backdropDown.current && e.target === e.currentTarget) {
      onCloseRef.current();
    }
    backdropDown.current = false;
  };

  const node = (
    <div
      className={cx(styles.backdrop, inline && styles.inline)}
      onMouseDown={inline ? undefined : onBackdropMouseDown}
      onClick={inline ? undefined : onBackdropClick}
      onKeyDown={onKeyDown}
    >
      <div
        ref={dialogRef}
        role={alert ? "alertdialog" : "dialog"}
        aria-modal={inline ? undefined : true}
        aria-labelledby={titleId}
        aria-describedby={describedBy}
        tabIndex={-1}
        className={cx(styles.modal, styles[size], className)}
      >
        <div className={styles.header}>
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          {withClose ? (
            <button
              ref={closeRef}
              type="button"
              className={styles.close}
              aria-label={closeLabel}
              onClick={() => onCloseRef.current()}
            >
              <X aria-hidden="true" />
            </button>
          ) : null}
        </div>
        {children != null ? <div className={styles.body}>{children}</div> : null}
        {footer}
      </div>
    </div>
  );

  if (inline || typeof document === "undefined") return node;
  return createPortal(node, document.body);
}

/* ------------------------------------------------------------------ */

export interface ModalAction {
  label: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  /** Stretch the button to fill remaining footer space (Figma "Discard changes" template). */
  grow?: boolean;
}

export interface ModalFooterProps {
  /** Destructive action on the left (red outline). */
  criticalAction?: ModalAction;
  /** Neutral action (grey subtle button). */
  secondaryAction?: ModalAction;
  /** Main action (yellow bold button). */
  primaryAction?: ModalAction;
  /** 1px top border separating the footer from scrolling content. */
  divider?: boolean;
  /** Custom content instead of the action buttons. */
  children?: ReactNode;
  className?: string;
}

/** Figma "modal footer" (Critical Action × Primary × Secondary × Footer Divider). */
export function ModalFooter({
  criticalAction,
  secondaryAction,
  primaryAction,
  divider = false,
  children,
  className,
}: ModalFooterProps) {
  const anyGrow = secondaryAction?.grow || primaryAction?.grow;
  return (
    <div
      className={cx(
        styles.footer,
        !criticalAction && styles.footerEnd,
        divider && styles.divider,
        className,
      )}
    >
      {children ?? (
        <>
          {criticalAction ? (
            // `warning` is the destructive-outline variant (kept as an alias of `destructive`).
            <Button
              variant="warning"
              onClick={criticalAction.onClick}
              disabled={criticalAction.disabled}
              className={cx(criticalAction.grow && styles.grow)}
            >
              {criticalAction.label}
            </Button>
          ) : null}
          {secondaryAction || primaryAction ? (
            <div className={cx(styles.accessories, anyGrow && styles.discardAccessories)}>
              {secondaryAction ? (
                <Button
                  variant="subtle"
                  onClick={secondaryAction.onClick}
                  disabled={secondaryAction.disabled}
                  className={cx(secondaryAction.grow && styles.grow)}
                >
                  {secondaryAction.label}
                </Button>
              ) : null}
              {primaryAction ? (
                <Button
                  variant="bold"
                  onClick={primaryAction.onClick}
                  disabled={primaryAction.disabled}
                  className={cx(primaryAction.grow && styles.grow)}
                >
                  {primaryAction.label}
                </Button>
              ) : null}
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

export type ConfirmModalType = "delete" | "discard";

export interface ConfirmModalProps
  extends Pick<ModalProps, "open" | "onClose" | "closeOnBackdropClick" | "inline" | "className"> {
  /** `delete` — shred illustration + red "Delete … permanently" action.
   *  `discard` — unsaved-changes confirmation. */
  type: ConfirmModalType;
  /** Called when the user confirms (delete / discard). */
  onConfirm: () => void;
  /** Object name used in the default Delete title: "Delete {label}?". */
  label?: string;
  title?: ReactNode;
  description?: ReactNode;
  confirmLabel?: ReactNode;
  cancelLabel?: ReactNode;
  /** Hide the shred illustration on the delete template. */
  hideIllustration?: boolean;
}

const CONFIRM_DEFAULTS: Record<
  ConfirmModalType,
  { title: (label: string) => string; description: string; confirm: string; cancel: string }
> = {
  delete: {
    title: (label) => `Delete ${label}?`,
    description: "This will permanently delete the file and you will not be able to recover it",
    confirm: "Delete file permanently",
    cancel: "Cancel",
  },
  discard: {
    title: () => "Discard changes?",
    description: "Changes you made so far will not be saved.",
    confirm: "Discard changes",
    cancel: "Keep editing",
  },
};

/** Figma "modal templates" (Type = Delete / Discard Changes). Always XS width. */
export function ConfirmModal({
  type,
  open,
  onClose,
  onConfirm,
  label = "file",
  title,
  description,
  confirmLabel,
  cancelLabel,
  hideIllustration = false,
  closeOnBackdropClick,
  inline,
  className,
}: ConfirmModalProps) {
  const descId = useId();
  const d = CONFIRM_DEFAULTS[type];
  const text = <p id={descId}>{description ?? d.description}</p>;

  const footer =
    type === "delete" ? (
      <ModalFooter
        criticalAction={{ label: confirmLabel ?? d.confirm, onClick: onConfirm }}
        secondaryAction={{ label: cancelLabel ?? d.cancel, onClick: onClose }}
      />
    ) : (
      <ModalFooter
        secondaryAction={{ label: confirmLabel ?? d.confirm, onClick: onConfirm, grow: true }}
        primaryAction={{ label: cancelLabel ?? d.cancel, onClick: onClose }}
      />
    );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title ?? d.title(label)}
      size="xs"
      showCloseButton={false}
      alert
      aria-describedby={descId}
      closeOnBackdropClick={closeOnBackdropClick}
      inline={inline}
      className={className}
      footer={footer}
    >
      {type === "delete" ? (
        <div className={styles.confirmBody}>
          {hideIllustration ? null : (
            <img
              className={styles.illustration}
              src="/figma/modal/shred-illustration.svg"
              width={64}
              height={64}
              alt=""
            />
          )}
          {text}
        </div>
      ) : (
        <div className={styles.confirmBody}>{text}</div>
      )}
    </Modal>
  );
}
