import type { CSSProperties, ReactNode } from "react";

/**
 * Shared layout primitives for "States" stories so every component page reads
 * the same way: labelled cells, grouped sections, consistent spacing.
 *
 * NOTE: this file is intentionally NOT a *.stories.tsx — it is a helper module.
 */

const labelStyle: CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: 11,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  color: "var(--c-grey-100)",
  whiteSpace: "nowrap",
};

export function Stage({
  children,
  column = false,
  gap = 24,
  align,
  style,
}: {
  children: ReactNode;
  column?: boolean;
  gap?: number;
  align?: CSSProperties["alignItems"];
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: column ? "column" : "row",
        flexWrap: column ? "nowrap" : "wrap",
        gap,
        alignItems: align ?? (column ? "stretch" : "flex-start"),
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/** A single labelled state cell (label above the sample). */
export function StateCell({
  label,
  children,
  align = "flex-start",
}: {
  label: string;
  children: ReactNode;
  align?: CSSProperties["alignItems"];
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: align }}>
      <span style={labelStyle}>{label}</span>
      {children}
    </div>
  );
}

/** A titled + described section for grouping related state rows. */
export function Section({
  title,
  description,
  children,
  style,
}: {
  title?: string;
  description?: ReactNode;
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <section style={{ marginBottom: 36, ...style }}>
      {title ? (
        <h3
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 16,
            fontWeight: 500,
            color: "var(--fg-1)",
            margin: "0 0 4px",
          }}
        >
          {title}
        </h3>
      ) : null}
      {description ? (
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 13,
            color: "var(--c-grey-100)",
            margin: "0 0 16px",
            maxWidth: 640,
            lineHeight: 1.5,
          }}
        >
          {description}
        </p>
      ) : null}
      {children}
    </section>
  );
}

/**
 * Forced pseudo-state class names, applied by storybook-addon-pseudo-states.
 * Add to the same element whose CSS carries the matching pseudo-selector.
 */
export const pseudo = {
  hover: "pseudo-hover",
  focus: "pseudo-focus-visible",
  active: "pseudo-active",
} as const;

/** The `-all` variants force the state on every descendant of the wrapper —
 *  use when the pseudo-selector lives on a nested element (inputs, switches…). */
const pseudoAll = {
  hover: "pseudo-hover-all",
  focus: "pseudo-focus-visible-all",
  focusWithin: "pseudo-focus-within-all",
  active: "pseudo-active-all",
} as const;

/** Wrap a sample to force a pseudo-state on it (and its descendants). */
export function Forced({
  state,
  children,
}: {
  state: keyof typeof pseudoAll;
  children: ReactNode;
}) {
  return (
    <div className={pseudoAll[state]} style={{ display: "inline-flex" }}>
      {children}
    </div>
  );
}
