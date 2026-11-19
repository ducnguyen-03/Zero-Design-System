import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta = {
  title: "Foundations/Colors",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Each hue is a 7-step ramp (10, 30, 50, 100, 150, 200, 300), mirrored from the Figma Foundation variables as `--insight-color-<hue>-<step>`. 100 is the canonical mid, 150 is action-strength, 300 the deepest. Greens carry every action; magenta and turquoise belong to the brand mark. Swatches render from the live CSS variable, so they always match `tokens.css`.",
      },
    },
  },
};
export default meta;

type Ramp = { name: string; hue: string; steps: Array<{ step: string; hex: string }> };

/** `hue` is the token segment: `--insight-color-${hue}-${step}` (empty hue → `--insight-color-${step}`). */
const ramp = (name: string, hue: string, entries: Record<string, string>): Ramp => ({
  name,
  hue,
  steps: Object.entries(entries)
    .map(([step, hex]) => ({ step, hex }))
    .sort((a, b) => Number(b.step) - Number(a.step)),
});

const tokenOf = (hue: string, step: string) => `--insight-color-${hue ? `${hue}-` : ""}${step}`;

const NEUTRALS: Ramp = {
  name: "Neutral",
  hue: "",
  steps: [
    { step: "off-black-200", hex: "#030D13" },
    { step: "off-black-100", hex: "#022034" },
    { step: "grey-200", hex: "#273957" },
    { step: "grey-100", hex: "#596983" },
    { step: "grey-75", hex: "#7C95AE" },
    { step: "grey-60", hex: "#AEB9C5" },
    { step: "grey-50", hex: "#D0D9E2" },
    { step: "grey-40", hex: "#CED8E2" },
    { step: "grey-30", hex: "#ECF0F3" },
    { step: "grey-20", hex: "#F3F5F7" },
    { step: "grey-10", hex: "#FAFBFC" },
    { step: "white", hex: "#FFFFFF" },
  ],
};

const HUES: Ramp[] = [
  ramp("Green (primary action)", "green", {
    300: "#015831", 200: "#00723F", 150: "#00AB59", 100: "#0EC971",
    50: "#40E58D", 30: "#84FFBE", 10: "#D1FCE6",
  }),
  ramp("Yellow (bold CTA)", "yellow", {
    300: "#A4821E", 200: "#DDB418", 150: "#F8CA19", 100: "#FAD74B",
    50: "#FFE974", 30: "#FFF6B2", 10: "#FFFAE8",
  }),
  ramp("Magenta (brand mark)", "magenta", {
    300: "#871578", 200: "#AD239D", 150: "#CA44BC", 100: "#E06AD3",
    50: "#EF91E5", 30: "#F9C1F2", 10: "#FADEF6",
  }),
  ramp("Turquoise (brand mark)", "turquoise", {
    300: "#053835", 200: "#075C57", 150: "#08827A", 100: "#27B8AF",
    50: "#43DED3", 30: "#7EF2EB", 10: "#D7FAF8",
  }),
  ramp("Blue", "blue", {
    300: "#082F7E", 200: "#004EB4", 150: "#016EE9", 100: "#1E86FC",
    50: "#75B6FF", 30: "#BBDEFF", 10: "#EDF6FF",
  }),
  ramp("Red", "red", {
    300: "#B00047", 200: "#DD0951", 150: "#EE1A59", 100: "#FF2969",
    50: "#FF5E8E", 30: "#FFAAC4", 10: "#FEE0E9",
  }),
  ramp("Violet", "violet", {
    300: "#271C7A", 200: "#362A93", 150: "#5A4ACF", 100: "#6F60E4",
    50: "#9A8DFF", 30: "#D2CCFF", 10: "#ECEAFC",
  }),
  ramp("Purple", "purple", {
    300: "#45107A", 200: "#6116A9", 150: "#7E2DC9", 100: "#9B51E0",
    50: "#B97DF1", 30: "#D8B2FC", 10: "#E9D5FD",
  }),
  ramp("Orange", "orange", {
    300: "#9C3D07", 200: "#BC4A09", 150: "#E97307", 100: "#F39D41",
    50: "#FCB874", 30: "#FCD7B1", 10: "#FFF2E6",
  }),
  ramp("Warm red", "warm-red", {
    300: "#8A0116", 200: "#B00047", 150: "#DD0951", 100: "#FF2969",
    50: "#FC7489", 30: "#FCC8D0", 10: "#FFE8EB",
  }),
];

/** Pick the swatch label colour (dark ink or white) with the higher WCAG contrast. */
const lum = (hex: string) => {
  const n = parseInt(hex.slice(1, 7), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
};
const contrast = (a: number, b: number) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
const labelColor = (hex: string) =>
  contrast(lum(hex), lum("#022034")) >= contrast(lum(hex), 1) ? "#022034" : "#FFFFFF";

function RampRow({ data }: { data: Ramp }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: 14,
          fontWeight: 500,
          marginBottom: 8,
          color: "var(--fg-1)",
        }}
      >
        {data.name}
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {data.steps.map(({ step, hex }) => (
          <div
            key={step}
            style={{
              width: 168,
              height: 92,
              borderRadius: 8,
              background: `var(${tokenOf(data.hue, step)})`,
              border: "1px solid rgba(0,0,0,0.08)",
              padding: 10,
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              color: labelColor(hex),
              fontFamily: "var(--font-mono)",
              fontSize: 11,
            }}
          >
            <div style={{ fontWeight: 500 }}>{step}</div>
            <div>{hex}</div>
            <div style={{ fontSize: 10 }}>{tokenOf(data.hue, step)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export const Neutrals: StoryObj = {
  render: () => (
    <div style={{ padding: 32, background: "var(--bg-surface)" }}>
      <RampRow data={NEUTRALS} />
    </div>
  ),
};

export const BrandAndStatus: StoryObj = {
  name: "Brand & status hues",
  render: () => (
    <div style={{ padding: 32, background: "var(--bg-surface)" }}>
      {HUES.map((r) => (
        <RampRow key={r.name} data={r} />
      ))}
    </div>
  ),
};
