import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useState,
} from "react";
import type { HTMLAttributes, MouseEventHandler, ReactElement, ReactNode } from "react";
import { Check, CircleDashed, CircleDot, Pencil, Plus } from "lucide-react";
import styles from "./Avatar.module.css";

const cx = (...parts: Array<string | false | undefined>) =>
  parts.filter(Boolean).join(" ");

/* ════════════════════════════════════════════════════════════════
   Avatar — Figma "Avatar" (3412:12710), "Avatar with initials"
   (3412:12971) and "Avatar personas" (3412:12958).
   ════════════════════════════════════════════════════════════════ */

/** Figma Size: default 36px (sm) · Medium 44px (md) · Large 64px (lg). */
export type AvatarSize = "sm" | "md" | "lg";

/** Figma "Avatar with initials" Color axis. Dark tones use white initials. */
export type AvatarColor =
  | "grey"
  | "purple-light"
  | "purple-dark"
  | "violet-light"
  | "violet-dark"
  | "magenta-light"
  | "magenta-dark"
  | "turquoise-light"
  | "turquoise-dark"
  | "green"
  | "yellow-light"
  | "yellow-dark"
  | "orange-light"
  | "orange-dark";

export interface AvatarProps extends Omit<HTMLAttributes<HTMLElement>, "color"> {
  size?: AvatarSize;
  /** Photo URL (Figma Type=Image). Falls back to initials if it fails to load. */
  src?: string;
  /** Person's name — used for the accessible label, image alt text and derived initials. */
  name?: string;
  /** Override the initials derived from `name` (Figma Type=Initials). */
  initials?: string;
  /** Background colour for the initials avatar. */
  color?: AvatarColor;
  /** Render the dashed "add person" affordance (Figma Type=Add). Always a button. */
  add?: boolean;
  /** Corner indicator, typically an <AvatarStatus /> (Figma Status=True). */
  status?: ReactNode;
  /** Makes the avatar a button (focus ring = Figma State=Focus). */
  onClick?: MouseEventHandler<HTMLElement>;
}

function deriveInitials(name?: string): string {
  if (!name) return "";
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";
  const first = words[0][0] ?? "";
  const last = words.length > 1 ? (words[words.length - 1][0] ?? "") : "";
  return (first + last).toUpperCase();
}

export function Avatar({
  size = "sm",
  src,
  name,
  initials,
  color = "grey",
  add = false,
  status,
  onClick,
  className,
  "aria-label": ariaLabel,
  ...rest
}: AvatarProps) {
  const [broken, setBroken] = useState(false);
  useEffect(() => setBroken(false), [src]);

  const showImage = !add && !!src && !broken;
  const text = initials ?? deriveInitials(name);
  const label = ariaLabel ?? (add ? name ?? "Add person" : name);
  const interactive = add || !!onClick;

  const content = add ? (
    <Plus className={styles.plus} aria-hidden="true" />
  ) : showImage ? (
    <img className={styles.img} src={src} alt="" onError={() => setBroken(true)} />
  ) : (
    <span className={styles.initials} aria-hidden="true">
      {text}
    </span>
  );

  const faceClass = cx(
    styles.face,
    add ? styles.add : showImage ? styles.image : styles[color],
    interactive && styles.interactive,
  );

  return (
    <span className={cx(styles.root, styles[size], className)} {...rest}>
      {interactive ? (
        <button type="button" className={faceClass} aria-label={label} onClick={onClick}>
          {content}
        </button>
      ) : (
        <span className={faceClass} role="img" aria-label={label}>
          {content}
        </span>
      )}
      {status != null ? <span className={styles.status}>{status}</span> : null}
    </span>
  );
}

/* ════════════════════════════════════════════════════════════════
   AvatarStatus — Figma "Avatar Status" (3412:13100). 14px dot.
   ════════════════════════════════════════════════════════════════ */

export type AvatarStatusType =
  | "default"
  | "edit"
  | "ready-to-start"
  | "in-progress"
  | "done";

export interface AvatarStatusProps extends HTMLAttributes<HTMLSpanElement> {
  /** Figma Status. `default` shows the curator number. */
  status?: AvatarStatusType;
  /** Curator number / short label shown by the `default` status (Figma Curator 1 / 2). */
  curator?: ReactNode;
  /** Greyed-out (Figma State=Disabled). */
  disabled?: boolean;
  /** Accessible label. Defaults to a readable form of the status. */
  label?: string;
}

const STATUS_TEXT: Record<AvatarStatusType, string> = {
  default: "Curator",
  edit: "Editing",
  "ready-to-start": "Ready to start",
  "in-progress": "In progress",
  done: "Done",
};

export function AvatarStatus({
  status = "default",
  curator = 1,
  disabled = false,
  label,
  className,
  ...rest
}: AvatarStatusProps) {
  const fallbackLabel =
    status === "default" && (typeof curator === "string" || typeof curator === "number")
      ? `Curator ${curator}`
      : STATUS_TEXT[status];

  return (
    <span
      className={cx(
        styles.dot,
        styles[`dot-${status}`],
        disabled && styles.dotDisabled,
        className,
      )}
      role="img"
      aria-label={label ?? fallbackLabel}
      {...rest}
    >
      {status === "default" ? <span aria-hidden="true">{curator}</span> : null}
      {status === "edit" ? <Pencil className={styles.dotIconSm} aria-hidden="true" /> : null}
      {status === "ready-to-start" ? <CircleDot aria-hidden="true" /> : null}
      {status === "in-progress" ? <CircleDashed aria-hidden="true" /> : null}
      {status === "done" ? <Check strokeWidth={3} aria-hidden="true" /> : null}
    </span>
  );
}

/* ════════════════════════════════════════════════════════════════
   AvatarGroup — Figma "Avatar group" (3412:12871).
   ════════════════════════════════════════════════════════════════ */

export interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** <Avatar /> elements. Their `size` is overridden by the group. */
  children: ReactNode;
  /** Group avatars only come in small or medium (Figma guidance). */
  size?: Extract<AvatarSize, "sm" | "md">;
  /** Surface the group sits on: light (white rings) or dark (off-black rings, white add). */
  mode?: "light" | "dark";
  /** Maximum slots shown, including the overflow "+N" and add buttons. Figma: 5. */
  max?: number;
  /** Show a trailing add button (Figma Add More To Group=True). */
  onAdd?: () => void;
  /** Accessible label for the add button. */
  addLabel?: string;
}

export function AvatarGroup({
  children,
  size = "sm",
  mode = "light",
  max = 5,
  onAdd,
  addLabel = "Add to group",
  className,
  "aria-label": ariaLabel = "Group members",
  ...rest
}: AvatarGroupProps) {
  const items = Children.toArray(children).filter(isValidElement) as Array<
    ReactElement<AvatarProps>
  >;
  const slots = Math.max(1, max - (onAdd ? 1 : 0));
  const overflowing = items.length > slots;
  const visible = overflowing ? items.slice(0, slots - 1) : items;
  const hidden = items.length - visible.length;

  let z = visible.length + (overflowing ? 1 : 0) + (onAdd ? 1 : 0);

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cx(styles.group, styles[`group-${mode}`], className)}
      {...rest}
    >
      {visible.map((child, i) => (
        <span key={child.key ?? i} className={styles.groupItem} style={{ zIndex: z-- }}>
          {cloneElement(child, { size })}
        </span>
      ))}
      {overflowing ? (
        <span className={styles.groupItem} style={{ zIndex: z-- }}>
          <span className={cx(styles.root, styles[size])}>
            <span className={cx(styles.face, styles.overflow)} role="img" aria-label={`${hidden} more`}>
              <span aria-hidden="true">+{hidden}</span>
            </span>
          </span>
        </span>
      ) : null}
      {onAdd ? (
        <span className={cx(styles.groupItem, styles.groupAdd)} style={{ zIndex: z-- }}>
          <Avatar add size={size} onClick={onAdd} aria-label={addLabel} />
        </span>
      ) : null}
    </div>
  );
}
