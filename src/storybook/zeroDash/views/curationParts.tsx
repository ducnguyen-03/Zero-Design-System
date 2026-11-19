import type { MouseEvent, ReactNode } from "react";
import { Mars, Play, Plus, Venus } from "lucide-react";
import { PAL, PEOPLE } from "./curationData";
import type { Curators, Sex } from "./curationData";
import styles from "./CurationView.module.css";

export const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(" ");

export function SexGlyph({ sex, size = 16 }: { sex: Sex; size?: number }) {
  const Glyph = sex === "F" ? Venus : Mars;
  return <Glyph size={size} strokeWidth={2} aria-hidden="true" />;
}

/** Two overlapping curator avatars: primary (badge "1") and secondary (play badge). Empty slots are dashed "+". */
export function CuratorSlots({
  cur,
  size = 44,
  onSlotClick,
}: {
  cur: Curators;
  size?: number;
  onSlotClick: (slot: 0 | 1, e: MouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <div className={styles.slots}>
      {([0, 1] as const).map((i) => {
        const t = cur[i];
        const p = t ? PEOPLE[t] : null;
        const name = p
          ? `${p[0]} (${i ? "secondary" : "primary"} curator)`
          : i ? "Assign secondary curator" : "Assign primary curator";
        return (
          <button
            key={i}
            type="button"
            title={name}
            aria-label={name}
            className={cx(styles.slot, !p && styles.slotEmpty)}
            style={{
              width: size,
              height: size,
              marginLeft: i ? -4 : 0,
              zIndex: i ? 1 : 2,
              background: p ? PAL[p[1]][0] : undefined,
              borderColor: p ? PAL[p[1]][1] : undefined,
            }}
            onClick={(e) => {
              e.stopPropagation();
              onSlotClick(i, e);
            }}
          >
            {t ?? <Plus size={22} strokeWidth={1.8} aria-hidden="true" />}
            {i === 0 ? (
              <span className={styles.slotPrimary} aria-hidden="true">1</span>
            ) : (
              <span className={styles.slotSecondary} aria-hidden="true">
                <Play size={7} fill="currentColor" strokeWidth={0} />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/** Small uppercase field label + value used across profile cards. */
export function Field({ label, children, className }: { label: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={cx(styles.field, className)}>
      <span className={styles.overline}>{label}</span>
      {children}
    </div>
  );
}
