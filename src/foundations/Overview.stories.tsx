import type { Meta, StoryObj } from "@storybook/react-vite";
import { ZeroCloudLogo } from "../storybook/ZeroCloudLogo";

const meta: Meta = {
  title: "Foundations/Overview",
  parameters: { layout: "fullscreen" },
};
export default meta;

const wrap = {
  fontFamily: "var(--font-sans)",
  color: "var(--fg-1)",
  maxWidth: 820,
  margin: "0 auto",
  padding: "48px 32px",
} as const;

export const ReadMe: StoryObj = {
  name: "Read me",
  render: () => (
    <div style={wrap}>
      <div style={{ display: "flex", alignItems: "center", gap: 32, marginBottom: 24 }}>
        <ZeroCloudLogo width={200} />
        <img src="/assets/InsightsLogo.svg" alt="Insights" style={{ width: 160 }} />
      </div>
      <h1 style={{ fontSize: 48, fontWeight: 700, lineHeight: 1.15, letterSpacing: "-0.01em", margin: "0 0 16px" }}>
        Insights — Zero Childhood Cancer Design System
      </h1>
      <p style={{ fontSize: 16, lineHeight: 1.5, color: "var(--c-grey-100)", margin: "0 0 32px" }}>
        A working component library for <strong>ZeroCloud</strong> and its products, led by{" "}
        <strong>Insights</strong>, the data-discovery
        platform for the Zero Childhood Cancer Program (ZCC / “ZERO”). Tokens mirror the
        production <code style={{ fontFamily: "var(--font-mono)" }}>zccTheme</code> (MUI
        corePalette + Roboto ramp); components are React + plain CSS driven by those tokens.
      </p>

      <h2 style={{ fontSize: 34, fontWeight: 500, margin: "0 0 12px" }}>Two surfaces</h2>
      <p style={{ fontSize: 15, lineHeight: 1.55, color: "var(--c-grey-100)", margin: "0 0 8px" }}>
        <strong style={{ color: "var(--fg-1)" }}>Marketing site</strong> — big, bright, illustrated;
        hero on green-200 tucking into a green-100 footer.
      </p>
      <p style={{ fontSize: 15, lineHeight: 1.55, color: "var(--c-grey-100)", margin: "0 0 32px" }}>
        <strong style={{ color: "var(--fg-1)" }}>Insights app</strong> — clean, dense, Roboto;
        white surface on a grey-10 page, MUI-backed.
      </p>

      <h2 style={{ fontSize: 34, fontWeight: 500, margin: "0 0 12px" }}>How this is organised</h2>
      <ul style={{ fontSize: 15, lineHeight: 1.8, color: "var(--c-grey-100)", paddingLeft: 20, margin: "0 0 32px" }}>
        <li><strong style={{ color: "var(--fg-1)" }}>Foundations</strong> — Colors, Typography, Spacing &amp; Elevation, Brand.</li>
        <li><strong style={{ color: "var(--fg-1)" }}>Components</strong> — Button, IconButton, Input, Select, Textarea, Switch, Checkbox, Radio, Chip, Tabs, Navigation, Tooltip, Snackbar, FeatureCard, AudienceCard, StatTile, Typography.</li>
      </ul>

      <div
        style={{
          background: "var(--c-green-10)",
          border: "1px solid var(--c-green-100)",
          borderRadius: 12,
          padding: 20,
          fontSize: 14,
          lineHeight: 1.6,
          color: "var(--c-green-300)",
        }}
      >
        <strong>Principles.</strong> Greens carry every action. Yellow is the primary CTA on dark
        surfaces. Magenta &amp; turquoise belong to the brand marks (ZeroCloud, Insights). Sentence case everywhere. Pill
        buttons at 50px. One easing curve — <code style={{ fontFamily: "var(--font-mono)" }}>cubic-bezier(0.19, 1, 0.22, 1)</code>.
      </div>
    </div>
  ),
};
