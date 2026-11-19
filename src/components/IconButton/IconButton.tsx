import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./IconButton.module.css";

export type IconButtonSize = "sm" | "md" | "lg";

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** The icon element (e.g. a lucide-react icon). */
  icon: ReactNode;
  /** Accessible label — required, since there is no visible text. */
  "aria-label": string;
  /** `sm` = 24px (16px glyph), `md` = 32px (20px glyph), `lg` = 48px (24px glyph). */
  size?: IconButtonSize;
  /** Toggle buttons only: renders the persistent "on" tint (Figma `Active, Index=2`)
   *  and sets `aria-pressed`. Leave undefined for plain action buttons. */
  pressed?: boolean;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { icon, size = "md", pressed, className, type = "button", ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      aria-pressed={pressed}
      className={[styles.iconBtn, styles[size], pressed && styles.pressed, className]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {icon}
    </button>
  );
});
