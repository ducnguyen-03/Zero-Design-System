import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta = {
  title: "Foundations/Typography",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Roboto is the system face — Light/Regular/Medium/Bold. Roboto Mono for identifiers and code. Sizes are MUI rem-based. Hierarchy moves through weight (400 → 500 → 700) as often as size.",
      },
    },
  },
};
export default meta;

const WEIGHTS = [
  { name: "Light", num: "300 · footer fine print", w: 300 },
  { name: "Regular", num: "400 · body", w: 400 },
  { name: "Medium", num: "500 · titles, labels", w: 500 },
  { name: "Bold", num: "700 · hero h1", w: 700 },
];

const SCALE = [
  { sample: "Leverage curated genomic insights", meta: "h1 · 48 / 3rem · 700", style: { fontSize: 48, fontWeight: 700, lineHeight: 1.15, letterSpacing: "-0.01em" } },
  { sample: "Slice and segment", meta: "h2 · 34 / 2.125rem · 500", style: { fontSize: 34, fontWeight: 500, lineHeight: 1.2 } },
  { sample: "Drill down into specific cohorts", meta: "h3 · 24 / 1.5rem · 500", style: { fontSize: 24, fontWeight: 500, lineHeight: 1.3 } },
  { sample: "Biosamples & Variants", meta: "titleRegular · 20 · 500", style: { fontSize: 20, fontWeight: 500 } },
  { sample: "Filter category", meta: "titleSmall · 16 · 500", style: { fontSize: 16, fontWeight: 500 } },
  { sample: "Explore structured clinical and high-resolution genomic data.", meta: "bodyRegular · 16 · 400", style: { fontSize: 16, fontWeight: 400, lineHeight: 1.5 } },
  { sample: "Filter by file type, ID and category to pinpoint what matters.", meta: "bodySmall · 14 · 400", style: { fontSize: 14, fontWeight: 400, lineHeight: 1.45, color: "var(--c-grey-100)" } },
  { sample: "DIAGNOSTIC CATEGORY", meta: "label · 12 uppercase · 500 · 0.06em", style: { fontSize: 12, fontWeight: 500, textTransform: "uppercase" as const, letterSpacing: "0.06em" } },
];

export const Weights: StoryObj = {
  render: () => (
    <div style={{ padding: 32, background: "var(--bg-surface)", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
      {WEIGHTS.map((w) => (
        <div key={w.name} style={{ border: "1px solid var(--c-grey-50)", borderRadius: 12, padding: 24 }}>
          <div style={{ fontFamily: "var(--font-sans)", fontSize: 56, lineHeight: 1, fontWeight: w.w, color: "var(--fg-1)", marginBottom: 16 }}>Aa</div>
          <div style={{ fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 500, color: "var(--fg-1)" }}>{w.name}</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--c-grey-100)" }}>{w.num}</div>
        </div>
      ))}
    </div>
  ),
};

export const Scale: StoryObj = {
  render: () => (
    <div style={{ padding: 32, background: "var(--bg-surface)" }}>
      {SCALE.map((row, i) => (
        <div
          key={i}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 260px",
            gap: 32,
            alignItems: "baseline",
            padding: "24px 0",
            borderBottom: i === SCALE.length - 1 ? "none" : "1px solid var(--c-grey-50)",
          }}
        >
          <div style={{ fontFamily: "var(--font-sans)", color: "var(--fg-1)", ...row.style }}>{row.sample}</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--c-grey-100)" }}>{row.meta}</div>
        </div>
      ))}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: 32, alignItems: "baseline", paddingTop: 24, borderTop: "1px solid var(--c-grey-50)" }}>
        <code style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--c-grey-200)", background: "var(--c-grey-30)", padding: "8px 12px", borderRadius: 6, justifySelf: "start" }}>
          P-XXXX-XXXX-DNA-WGS
        </code>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--c-grey-100)" }}>mono · 14 · Roboto Mono 400</div>
      </div>
    </div>
  ),
};
