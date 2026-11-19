import type { Meta, StoryObj } from "@storybook/react-vite";
import { InsightsLogo } from "../components/Brand/InsightsLogo";
import { ZeroCloudLogo } from "../storybook/ZeroCloudLogo";

const meta: Meta = {
  title: "Foundations/Brand",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "ZeroCloud is the umbrella brand: a yellow cloud folding into a turquoise–magenta loop, set beside a heavy offBlack wordmark. Insights stays the product logo inside the app (TopNav, Sidebar). The Insights wordmark sits beside a multi-coloured wave-form mark — a turquoise crest, three magenta verticals and a yellow accent. Deep offBlack ink signals scientific seriousness; the mark earns the warmth.",
      },
    },
  },
};
export default meta;

const label = {
  fontFamily: "var(--font-sans)",
  fontSize: 12,
  fontWeight: 500,
  textTransform: "uppercase" as const,
  letterSpacing: "0.06em",
  color: "var(--c-grey-100)",
  marginBottom: 16,
};

const panel = {
  padding: 48,
  borderRadius: 16,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 140,
};

const swatch = (name: string, token: string, hex: string) => (
  <div key={token} style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--fg-1)" }}>
    <div style={{ height: 56, borderRadius: 8, background: `var(${token})`, marginBottom: 8 }} />
    <div style={{ fontWeight: 500 }}>{name}</div>
    <div style={{ fontFamily: "var(--font-mono)", color: "var(--c-grey-100)" }}>{hex}</div>
  </div>
);

export const ZeroCloud: StoryObj = {
  name: "ZeroCloud",
  render: () => (
    <div style={{ padding: 32, display: "grid", gap: 24, gridTemplateColumns: "1fr 1fr", background: "var(--bg-surface)" }}>
      <div>
        <div style={label}>Lockup · on light</div>
        <div style={{ ...panel, background: "var(--c-grey-10)", border: "1px solid var(--c-grey-50)" }}>
          <ZeroCloudLogo width={280} />
        </div>
      </div>
      <div>
        <div style={label}>Lockup · on dark</div>
        <div style={{ ...panel, background: "var(--c-offBlack-100)" }}>
          <ZeroCloudLogo width={280} onDark />
        </div>
      </div>
      <div>
        <div style={label}>Mark · on light</div>
        <div style={{ ...panel, background: "var(--c-grey-10)", border: "1px solid var(--c-grey-50)" }}>
          <img src="/assets/ZeroCloudMark.svg" alt="ZeroCloud mark" style={{ height: 56 }} />
        </div>
      </div>
      <div>
        <div style={label}>Mark · on dark</div>
        <div style={{ ...panel, background: "var(--c-offBlack-100)" }}>
          <img src="/assets/ZeroCloudMark.svg" alt="ZeroCloud mark" style={{ height: 56 }} />
        </div>
      </div>
      <div style={{ gridColumn: "1 / -1" }}>
        <div style={label}>Mark colours</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {swatch("Yellow", "--insight-color-brand-zerocloud-yellow", "#FBD53E")}
          {swatch("Turquoise", "--insight-color-brand-zerocloud-turquoise", "#23C6BC")}
          {swatch("Magenta", "--insight-color-brand-zerocloud-magenta", "#F76DE8")}
          {swatch("Ink", "--insight-color-brand-zerocloud-ink", "#030313")}
        </div>
      </div>
    </div>
  ),
};

export const Logo: StoryObj = {
  name: "Insights logo",
  render: () => (
    <div style={{ padding: 32, display: "grid", gap: 24, gridTemplateColumns: "1fr 1fr", background: "var(--bg-surface)" }}>
      <div>
        <div style={label}>Wordmark · on light</div>
        <div style={{ ...panel, background: "var(--c-grey-10)", border: "1px solid var(--c-grey-50)" }}>
          <img src="/assets/InsightsLogo.svg" alt="Insights" style={{ width: 220 }} />
        </div>
      </div>
      <div>
        <div style={label}>Wordmark · on dark</div>
        <div style={{ ...panel, background: "var(--c-offBlack-100)" }}>
          <img src="/assets/InsightsLogo.svg" alt="Insights" style={{ width: 220, filter: "brightness(0) invert(1) saturate(0)" }} />
        </div>
      </div>
    </div>
  ),
};

/** `InsightsLogo`: the wordmark with its release badge — "Beta" while Insights is in beta. Use it in the sidebar (21px) and top bar (28px). */
export const LogoWithBadge: StoryObj = {
  name: "Logo · release badge",
  render: () => (
    <div style={{ padding: 32, display: "grid", gap: 24, gridTemplateColumns: "1fr 1fr", background: "var(--bg-surface)" }}>
      <div>
        <div style={label}>Beta · sidebar 21px and top bar 28px</div>
        <div style={{ ...panel, flexDirection: "column", gap: 24, background: "var(--c-grey-10)", border: "1px solid var(--c-grey-50)" }}>
          <InsightsLogo />
          <InsightsLogo height={28} />
        </div>
      </div>
      <div>
        <div style={label}>Beta · on dark</div>
        <div style={{ ...panel, flexDirection: "column", gap: 24, background: "var(--c-offBlack-100)" }}>
          <InsightsLogo onDark />
          <InsightsLogo onDark height={28} />
        </div>
      </div>
      <div>
        <div style={label}>Other labels · no label</div>
        <div style={{ ...panel, gap: 32, background: "var(--c-grey-10)", border: "1px solid var(--c-grey-50)" }}>
          <InsightsLogo badge="Preview" />
          <InsightsLogo badge={null} />
        </div>
      </div>
    </div>
  ),
};

export const Mark: StoryObj = {
  name: "Insights mark",
  render: () => (
    <div style={{ padding: 32, display: "grid", gap: 24, gridTemplateColumns: "1fr 1fr", background: "var(--bg-surface)" }}>
      <div>
        <div style={label}>Mark · on light</div>
        <div style={{ ...panel, background: "var(--c-grey-10)", border: "1px solid var(--c-grey-50)" }}>
          <img src="/assets/InsightsMark.svg" alt="Insights mark" style={{ height: 56 }} />
        </div>
      </div>
      <div>
        <div style={label}>Mark · on dark</div>
        <div style={{ ...panel, background: "var(--c-offBlack-100)" }}>
          <img src="/assets/InsightsMark.svg" alt="Insights mark" style={{ height: 56 }} />
        </div>
      </div>
    </div>
  ),
};

export const Principles: StoryObj = {
  render: () => (
    <div style={{ padding: 32, background: "var(--bg-surface)" }}>
      <div
        style={{
          background: "var(--c-offBlack-100)",
          color: "var(--c-grey-10)",
          borderRadius: 12,
          padding: 32,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 24,
          maxWidth: 760,
        }}
      >
        {[
          ["Greens carry action", "Every action is green. Yellow carries the primary CTA on dark surfaces. Magenta and turquoise belong to the brand mark — used sparingly elsewhere."],
          ["Sentence case everywhere", "Buttons, nav, headlines — sentence case. Title Case is reserved for proper nouns and personae. Tiny meta tags use uppercase labels."],
          ["One easing curve", "cubic-bezier(0.19, 1, 0.22, 1) for everything. No bounces, springs or parallax."],
          ["Illustrated, never stock", "Warm, hand-illustrated imagery on white. Numerals for stats, + for “or more”, em dashes for asides."],
        ].map(([h, p]) => (
          <div key={h}>
            <h3 style={{ fontFamily: "var(--font-sans)", fontSize: 18, fontWeight: 500, margin: "0 0 8px" }}>{h}</h3>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "rgba(250,251,252,0.7)" }}>{p}</p>
          </div>
        ))}
      </div>
    </div>
  ),
};
