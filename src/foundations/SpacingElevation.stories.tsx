import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta = {
  title: "Foundations/Spacing & Elevation",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Spacing scale, corner radii and elevation from the Figma Foundation variables (`--insight-spacing-*`, `--insight-radius-*`, `--insight-shadow-*`), plus the single signature motion curve that governs every transition in the product.",
      },
    },
  },
};
export default meta;

const SPACING = [
  ["3xs", 1], ["2xs", 2], ["xs", 4], ["sm", 6], ["md", 8], ["10", 10], ["lg", 12],
  ["xl", 16], ["2xl", 24], ["3xl", 32], ["4xl", 40], ["5xl", 48], ["6xl", 56], ["7xl", 64],
] as const;

const RADII = [
  { token: "--insight-radius-xs", px: 2, use: "hairline tags" },
  { token: "--insight-radius-sm", px: 4, use: "inputs (--insight-radius-input)" },
  { token: "--insight-radius-md", px: 8, use: "cards, menus (--insight-radius-card)" },
  { token: "--insight-radius-lg", px: 12, use: "tips, stat tiles (--insight-radius-tip)" },
  { token: "--insight-radius-xl", px: 16, use: "modal" },
  { token: "--insight-radius-4xl", px: 48, use: "large surfaces" },
  { token: "--insight-radius-button-sm", px: 8, use: "small buttons (32px)" },
  { token: "--insight-radius-button-lg", px: 12, use: "medium / large buttons (48px)" },
  { token: "--insight-radius-button", px: 9999, use: "pills — avatars, badges, chips" },
];

const SHADOWS = [
  { token: "--insight-shadow-footer", use: "sticky footers, bars" },
  { token: "--insight-shadow-dropdown", use: "menus, dropdowns, popovers" },
  { token: "--insight-shadow-modal", use: "modal dialogs" },
];

const mono = { fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--c-grey-100)" } as const;
const heading = {
  fontFamily: "var(--font-sans)",
  fontSize: 20,
  fontWeight: 500,
  color: "var(--fg-1)",
  margin: "0 0 16px",
} as const;

export const Spacing: StoryObj = {
  render: () => (
    <div style={{ padding: 32, background: "var(--bg-surface)" }}>
      <h3 style={heading}>Spacing scale</h3>
      <div style={{ display: "grid", gap: 8 }}>
        {SPACING.map(([name, px]) => (
          <div key={name} style={{ display: "grid", gridTemplateColumns: "220px 48px 1fr", alignItems: "center", gap: 16 }}>
            <div style={mono}>--insight-spacing-{name}</div>
            <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--fg-1)" }}>{px}px</div>
            <div style={{ height: 12, width: `var(--insight-spacing-${name})`, background: "var(--insight-color-green-100)" }} />
          </div>
        ))}
      </div>
    </div>
  ),
};

export const Radii: StoryObj = {
  render: () => (
    <div style={{ padding: 32, background: "var(--bg-surface)" }}>
      <h3 style={heading}>Corner radii</h3>
      <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
        {RADII.map((r) => (
          <div key={r.token} style={{ width: 130 }}>
            <div
              style={{
                height: 90,
                background: "var(--c-green-10)",
                border: "1.5px solid var(--c-green-100)",
                borderRadius: `var(${r.token})`,
                marginBottom: 8,
              }}
            />
            <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 500, color: "var(--fg-1)" }}>
              {r.px === 9999 ? "pill" : `${r.px}px`}
            </div>
            <div style={mono}>{r.token}</div>
            <div style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--c-grey-100)" }}>{r.use}</div>
          </div>
        ))}
      </div>
    </div>
  ),
};

export const Elevation: StoryObj = {
  render: () => (
    <div style={{ padding: 32, background: "var(--bg-page)" }}>
      <h3 style={heading}>Shadows</h3>
      <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
        {SHADOWS.map((s) => (
          <div key={s.token} style={{ width: 240 }}>
            <div
              style={{
                height: 120,
                background: "#fff",
                borderRadius: 12,
                boxShadow: `var(${s.token})`,
                marginBottom: 12,
              }}
            />
            <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 500, color: "var(--fg-1)" }}>
              {s.use}
            </div>
            <div style={mono}>{s.token}</div>
          </div>
        ))}
      </div>
    </div>
  ),
};

export const Motion: StoryObj = {
  render: () => (
    <div style={{ padding: 32, background: "var(--bg-surface)" }}>
      <h3 style={heading}>Motion</h3>
      <p style={{ fontFamily: "var(--font-sans)", fontSize: 14, color: "var(--c-grey-100)", maxWidth: 560, lineHeight: 1.5 }}>
        One easing curve for everything:{" "}
        <span style={mono}>cubic-bezier(0.19, 1, 0.22, 1)</span> — a heavy,
        front-loaded ease-out. Three durations: 0.3s (fast), 0.7s (medium), 1s
        (slow). No bounces, springs or parallax. Hover to preview.
      </p>
      <style>{`
        .motion-demo { transition: transform 0.7s cubic-bezier(0.19,1,0.22,1), box-shadow 0.7s cubic-bezier(0.19,1,0.22,1); }
        .motion-demo:hover { transform: translateY(-8px); box-shadow: 0 0 20px rgba(14,201,113,0.2); }
      `}</style>
      <div
        className="motion-demo"
        style={{
          width: 220,
          height: 120,
          marginTop: 20,
          background: "#fff",
          border: "1.5px solid var(--c-grey-50)",
          borderRadius: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--font-sans)",
          fontSize: 13,
          color: "var(--c-grey-100)",
        }}
      >
        Hover me
      </div>
    </div>
  ),
};
