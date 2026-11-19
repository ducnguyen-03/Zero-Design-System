import { useDeferredValue, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { icons } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Select } from "../components/Select/Select";

const meta: Meta = {
  title: "Foundations/Icons",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "The product icon set is [Lucide](https://lucide.dev) (`lucide-react`): 24×24 grid, 2px stroke, rounded caps and joins. Import icons by name from `lucide-react` and render them through the `Icon` component (or the `startIcon` / `icon` props on other components) so size, stroke and colour come from tokens.",
      },
    },
  },
};
export default meta;

const ALL = Object.entries(icons as Record<string, LucideIcon>).sort(([a], [b]) => a.localeCompare(b));

/** "ArrowDownAZ" → "arrow down a z", so searching "arrow down" or "down" matches. */
const words = (name: string) =>
  name
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2")
    .toLowerCase();
const INDEX = ALL.map(([name, glyph]) => ({ name, glyph, text: `${name.toLowerCase()} ${words(name)}` }));

const TONES: Record<string, string> = {
  Primary: "var(--insight-color-foreground-text-primary)",
  Secondary: "var(--insight-color-foreground-text-tertiary)",
  Brand: "var(--insight-color-green-200)",
  Success: "var(--insight-color-status-success-foreground)",
  Danger: "var(--insight-color-status-error-foreground)",
  Info: "var(--insight-color-status-info-foreground)",
};

const mono: CSSProperties = { fontFamily: "var(--font-mono)", fontSize: 12 };
const heading: CSSProperties = {
  fontFamily: "var(--font-sans)",
  fontSize: 20,
  fontWeight: 500,
  color: "var(--fg-1)",
  margin: "0 0 8px",
};
const muted: CSSProperties = {
  fontFamily: "var(--font-sans)",
  fontSize: 14,
  lineHeight: 1.5,
  color: "var(--insight-color-foreground-text-tertiary)",
  margin: "0 0 20px",
  maxWidth: 720,
};

function Gallery() {
  const [query, setQuery] = useState("");
  const [size, setSize] = useState(24);
  const [stroke, setStroke] = useState(2);
  const [tone, setTone] = useState("Primary");
  const [copied, setCopied] = useState<string | null>(null);
  const deferred = useDeferredValue(query);

  const results = useMemo(() => {
    const terms = deferred.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return terms.length ? INDEX.filter((i) => terms.every((t) => i.text.includes(t))) : INDEX;
  }, [deferred]);

  const copy = async (name: string) => {
    const snippet = `import { ${name} } from "lucide-react";`;
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(name);
    } catch {
      setCopied(null);
    }
  };

  const control: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    fontFamily: "var(--font-sans)",
    fontSize: 13,
    color: "var(--fg-1)",
  };

  return (
    <div style={{ padding: 32, background: "var(--bg-surface)", minHeight: "100vh" }}>
      <h3 style={heading}>Icon library</h3>
      <p style={muted}>
        {ALL.length.toLocaleString()} Lucide icons (lucide-react). Search by name, preview size, stroke and tone, then
        click an icon to copy its import. Official catalogue with tags and categories:{" "}
        <a href="https://lucide.dev/icons" target="_blank" rel="noreferrer" style={{ color: "var(--insight-color-green-200)" }}>
          lucide.dev/icons
        </a>
        .
      </p>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 24,
          alignItems: "center",
          padding: "12px 16px",
          marginBottom: 20,
          borderRadius: 8,
          background: "var(--insight-color-background-subtle)",
          position: "sticky",
          top: 0,
          zIndex: 1,
        }}
      >
        <label style={control}>
          Search
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. dna, arrow, file…"
            style={{
              width: 240,
              height: 32,
              padding: "0 10px",
              border: "1px solid var(--insight-color-grey-75)",
              borderRadius: "var(--insight-radius-input)",
              font: "inherit",
            }}
          />
        </label>
        <span style={control}>
          <span id="icons-size-label">Size</span>
          <Select
            size="xs"
            aria-labelledby="icons-size-label"
            options={[12, 16, 20, 24, 32, 40].map((s) => ({ value: String(s), label: `${s}px` }))}
            value={String(size)}
            onValueChange={(v) => setSize(Number(v))}
          />
        </span>
        <label style={control}>
          Stroke
          <input
            type="range"
            min={1}
            max={3}
            step={0.25}
            value={stroke}
            onChange={(e) => setStroke(Number(e.target.value))}
          />
          <span style={mono}>{stroke}</span>
        </label>
        <span style={control}>
          <span id="icons-tone-label">Tone</span>
          <Select
            size="xs"
            aria-labelledby="icons-tone-label"
            options={Object.keys(TONES).map((t) => ({ value: t, label: t }))}
            value={tone}
            onValueChange={setTone}
          />
        </span>
        <span style={{ ...mono, color: "var(--insight-color-foreground-text-tertiary)" }} aria-live="polite">
          {results.length.toLocaleString()} shown
          {copied ? ` · copied ${copied}` : ""}
        </span>
      </div>

      <ul
        style={{
          listStyle: "none",
          margin: 0,
          padding: 0,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(112px, 1fr))",
          gap: 8,
        }}
      >
        {results.map(({ name, glyph: Glyph }) => (
          <li key={name}>
            <button
              type="button"
              onClick={() => copy(name)}
              title={`Copy import for ${name}`}
              style={{
                width: "100%",
                height: 96,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                padding: 8,
                border: `1px solid ${copied === name ? "var(--insight-color-green-175)" : "var(--insight-color-grey-50)"}`,
                borderRadius: 8,
                background: copied === name ? "var(--insight-color-green-10)" : "var(--insight-color-white)",
                cursor: "pointer",
                color: TONES[tone],
              }}
            >
              <Glyph size={size} style={{ strokeWidth: stroke }} aria-hidden="true" />
              <span
                style={{
                  ...mono,
                  fontSize: 11,
                  color: "var(--insight-color-foreground-text-secondary)",
                  maxWidth: "100%",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {name}
              </span>
            </button>
          </li>
        ))}
      </ul>
      {results.length === 0 ? <p style={muted}>No icon matches “{query}”.</p> : null}
    </div>
  );
}

export const Library: StoryObj = {
  render: () => <Gallery />,
};

const RULES: Array<[string, string]> = [
  ["One set only", "Use Lucide for every UI icon. Don't mix in Material, Font Awesome or hand-drawn SVGs; brand marks (logo) are the only exception."],
  ["Size from tokens", "xs 12 · sm 16 · md 20 · lg 24 · xl 32 · 2xl 40. Default to md (20px) in controls, sm (16px) inline with 14px text. Off-scale sizes (14, 15, 18px…) are not used."],
  ["One stroke weight", "Every Lucide svg gets the 2px stroke (`--insight-icon-stroke`) from a global rule — don't pass strokeWidth per component. Only tiny control marks (checkbox tick, switch ✓/✕, status dot) are heavier, set in their own CSS."],
  ["Colour follows meaning", "Icons inherit text colour. Use a status tone only when the icon expresses that status (success, danger, warning, info)."],
  ["Label standalone icons", "Decorative icons are aria-hidden. An icon-only control needs an accessible name — `aria-label` on IconButton, or `label` on Icon."],
  ["Direction vs identity", "In buttons, start icons name the object (Plus, Download, Trash2); end icons show direction or destination (ArrowRight, ExternalLink, ChevronDown)."],
];

export const Guidelines: StoryObj = {
  render: () => (
    <div style={{ padding: 32, background: "var(--bg-surface)" }}>
      <h3 style={heading}>Usage guidelines</h3>
      <p style={muted}>
        Install: <code style={mono}>npm i lucide-react</code> · Import:{" "}
        <code style={mono}>{'import { Dna } from "lucide-react"'}</code> · Render:{" "}
        <code style={mono}>{"<Icon icon={Dna} size=\"md\" />"}</code>
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
        {RULES.map(([title, body]) => (
          <div key={title} style={{ border: "1px solid var(--insight-color-grey-50)", borderRadius: 8, padding: 16 }}>
            <div style={{ fontFamily: "var(--font-sans)", fontSize: 15, fontWeight: 500, color: "var(--fg-1)", marginBottom: 6 }}>
              {title}
            </div>
            <div style={{ ...muted, margin: 0 }}>{body}</div>
          </div>
        ))}
      </div>
    </div>
  ),
};
