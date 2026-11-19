import type { CSSProperties, ReactNode } from "react";
import { BookOpen, Bookmark, Box, Check, ChevronDown, ChevronUp, FileText, Hospital, Lock, Microscope, MousePointer2, Network, Plus, RotateCcw, Search, Sparkle, User, X } from "lucide-react";
import s from "./TourIllustrations.module.css";

/* Step illustrations from Claude Design "Insights Onboarding" — one per tour step, drawn for the
   420 × 180 picture header of an illustrated TourCard. Pass one as a step's `illustration`. */

export type TourIllustrationName =
  | "views"
  | "search"
  | "metrics"
  | "published"
  | "cohort"
  | "oncoprint"
  | "pdx"
  | "molecular"
  | "filters"
  | "saved"
  | "access"
  | "request"
  | "assistant"
  | "ready";

const c = (name: string) => `var(--insight-color-${name})`;
const at = (left: number, top: number, extra?: CSSProperties): CSSProperties => ({ left, top, ...extra });
const Line = ({ w, color }: { w: number | string; color?: string }) => (
  <span className={s.line} style={{ width: w, background: color }} />
);

function Views() {
  return (
    <div className={`${s.sheet} ${s.col}`} style={at(34, 26, { width: 320, padding: "12px 14px", gap: 12 })}>
      <div className={s.tabs}>
        {["SUMMARY", "PARTICIPANTS", "PDX", "MOLECULAR"].map((t, i) => (
          <span key={t} className={i === 0 ? `${s.tab} ${s.tabOn}` : s.tab}>
            {t}
          </span>
        ))}
      </div>
      <div className={s.tiles}>
        {[
          ["60%", "40%", "green-150"],
          ["50%", "55%", "yellow-100"],
          ["70%", "35%", "off-black-100"],
        ].map(([a, b, col]) => (
          <div key={col} className={s.tile}>
            <Line w={a} color={c("grey-50")} />
            <span className={s.line} style={{ width: b, height: 10, background: c(col) }} />
          </div>
        ))}
      </div>
    </div>
  );
}

function SearchScene() {
  const pill = (label: string, bg: string, fg: string) => (
    <span className={s.pill} style={{ background: c(bg), color: c(fg) }}>
      {label}
    </span>
  );
  return (
    <>
      <div className={`${s.sheet} ${s.searchField}`} style={at(54, 24, { width: 280 })}>
        <Search size={14} strokeWidth={2.2} color={c("green-200")} aria-hidden="true" />
        <span className={s.mono} style={{ fontSize: 12 }}>
          BRAF
        </span>
        <span className={s.caret} />
        <span className={s.kbd}>⌘K</span>
      </div>
      <div className={`${s.sheet} ${s.col}`} style={at(54, 68, { width: 280, padding: 6, gap: 2 })}>
        <div className={`${s.hit} ${s.hitOn}`}>
          {pill("Gene", "green-10", "green-200")}
          <span className={s.mono}>BRAF</span>
          <span className={s.line} style={{ width: 40, marginLeft: "auto" }} />
        </div>
        <div className={s.hit}>
          {pill("Variant", "yellow-30", "off-black-100")}
          <span className={s.mono}>BRAF V600E</span>
          <span className={s.line} style={{ width: 28, marginLeft: "auto" }} />
        </div>
        <div className={s.hit}>
          {pill("Diagnosis", "grey-10", "grey-200")}
          <Line w={90} />
        </div>
      </div>
    </>
  );
}

function Metrics() {
  return (
    <div style={{ position: "absolute", left: 34, top: 28, display: "flex", gap: 12 }}>
      <div className={`${s.sheet} ${s.col}`} style={{ position: "relative", width: 154, height: 112, padding: 12, gap: 6 }}>
        <span className={s.caps}>PARTICIPANTS</span>
        <span className={s.figure}>3,184</span>
        <div className={s.bars} style={{ height: 34, marginTop: "auto" }}>
          {[40, 70, 100, 55, 30].map((h, i) => (
            <span key={i} style={{ height: `${h}%`, background: c(i === 2 ? "green-150" : "green-50") }} />
          ))}
        </div>
      </div>
      <div className={`${s.sheet} ${s.col}`} style={{ position: "relative", width: 154, height: 112, padding: 12, gap: 6, transform: "translateY(10px)" }}>
        <span className={s.caps}>SAMPLES</span>
        <span className={s.figure}>7,412</span>
        <div className={s.col} style={{ gap: 5, marginTop: "auto" }}>
          <span className={s.line} style={{ width: "90%", height: 6, background: c("yellow-100") }} />
          <span className={s.line} style={{ width: "64%", height: 6, background: c("yellow-50") }} />
          <span className={s.line} style={{ width: "38%", height: 6, background: c("yellow-50") }} />
        </div>
      </div>
    </div>
  );
}

function Published() {
  return (
    <>
      <div className={`${s.sheet} ${s.col}`} style={at(44, 30, { width: 300, padding: 14, gap: 10 })}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
          <span className={s.figure} style={{ fontSize: 18 }}>
            3,184
          </span>
          <span className={s.mono} style={{ fontSize: 11, color: c("grey-200") }}>
            / 4,500
          </span>
        </div>
        <div className={s.proportion}>
          <span style={{ width: "71%" }} />
        </div>
        <div className={s.row}>
          <span className={s.pill} style={{ gap: 5, padding: "4px 9px", fontSize: 10, background: c("green-10"), color: c("green-200") }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: c("green-150") }} />
            Published
          </span>
          <span className={s.pill} style={{ gap: 5, padding: "4px 9px", fontSize: 10, background: c("white"), outline: `1.5px dashed ${c("grey-100")}` }}>
            <Lock aria-hidden="true" />
            Unpublished
          </span>
        </div>
      </div>
      <MousePointer2 className={s.cursor} style={at(196, 116)} aria-hidden="true" />
    </>
  );
}

/* The charts under the metrics: categories, sex, genes — one gene selected. */
const CATEGORIES = [
  ["yellow-100", "92%"],
  ["violet-50", "70%"],
  ["green-50", "52%"],
  ["red-50", "38%"],
  ["blue-50", "24%"],
];
const GENES = [
  ["TP53", [44, 18, 8]],
  ["BRAF", [30, 14, 0]],
  ["MYCN", [8, 34, 0]],
  ["NF1", [22, 6, 6]],
] as const;

function Cohort() {
  return (
    <>
      <div className={`${s.sheet} ${s.col}`} style={at(24, 26, { width: 150, padding: 12, gap: 8 })}>
        <span className={s.caps}>CANCER CATEGORY</span>
        {CATEGORIES.map(([col, w]) => (
          <div key={col} className={s.row} style={{ gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: 2, flexShrink: 0, background: c(col) }} />
            <span className={s.line} style={{ width: w, height: 6, background: c(col) }} />
          </div>
        ))}
      </div>
      <div className={`${s.sheet} ${s.col}`} style={at(184, 38, { width: 92, padding: 12, gap: 10, alignItems: "center" })}>
        <span className={s.caps} style={{ alignSelf: "flex-start" }}>
          SEX
        </span>
        <span className={s.donut} />
      </div>
      <div className={`${s.sheet} ${s.raised} ${s.col}`} style={at(286, 50, { width: 112, padding: 10, gap: 4 })}>
        <span className={s.caps} style={{ padding: "0 4px 2px" }}>
          GENES
        </span>
        {GENES.map(([gene, [snv, cnv, sv]]) => (
          <div key={gene} className={gene === "BRAF" ? `${s.geneRow} ${s.hitOn}` : s.geneRow}>
            <span className={s.mono} style={{ width: 30 }}>
              {gene}
            </span>
            <span className={s.stack}>
              <span style={{ width: snv, background: c("blue-100") }} />
              <span style={{ width: cnv, background: c("red-150") }} />
              <span style={{ width: sv, background: c("orange-100") }} />
            </span>
          </div>
        ))}
      </div>
      <MousePointer2 className={s.cursor} style={at(330, 94)} aria-hidden="true" />
    </>
  );
}

const ONCO = ["grey-10", "green-150", "pink-100", "yellow-100", "off-black-100"];
const ONCO_CELLS = Array.from({ length: 108 }, (_, i) => {
  const h = ((i * 2654435761) >>> 0) % 97;
  const r = Math.floor(i / 18);
  return h < 58 - r * 6 ? 0 : h < 76 ? 1 : h < 86 ? 2 : h < 93 ? 3 : 4;
});

function OncoprintScene() {
  return (
    <div className={s.sheet} style={at(24, 22, { width: 340, padding: 12, display: "flex", gap: 12 })}>
      <div className={`${s.oncoGenes} ${s.mono}`}>
        {["TP53", "MYCN", "ALK", "NF1", "ATRX", "CDKN2A"].map((g) => (
          <span key={g}>{g}</span>
        ))}
      </div>
      <div className={s.oncoGrid}>
        {ONCO_CELLS.map((k, i) => (
          <span key={i} style={{ background: k === 2 ? "#dd0951" : c(ONCO[k]) }} />
        ))}
      </div>
    </div>
  );
}

function Pdx() {
  const model = (id: string, on: boolean, foot: ReactNode) => (
    <div
      className={`${s.sheet} ${s.col} ${on ? s.raised : ""}`}
      style={{ position: "relative", width: on ? 112 : 100, padding: 12, gap: 8, marginTop: on ? 0 : 12 }}
    >
      <span className={s.modelIcon} style={on ? { background: c("green-10"), color: c("green-200") } : undefined}>
        <Box aria-hidden="true" />
      </span>
      <span className={s.mono} style={{ fontSize: 10 }}>
        {id}
      </span>
      {foot}
    </div>
  );
  return (
    <div style={{ position: "absolute", left: 30, top: 34, display: "flex", gap: 12, alignItems: "flex-start" }}>
      {model("PDX-0142", false, <Line w="70%" />)}
      {model(
        "PDX-0217",
        true,
        <span className={s.pill} style={{ alignSelf: "flex-start", background: c("green-10"), color: c("green-200") }}>
          <Check aria-hidden="true" />
          Validated
        </span>,
      )}
      {model("PDX-0388", false, <Line w="55%" />)}
    </div>
  );
}

const HEAT = ["#e9eef3", "#fceaa8", "#f5902b", "#c0202f"];
const LOLLI = [30, 55, 20, 88, 40, 64, 25, 48, 34];

function Molecular() {
  return (
    <>
      <div className={`${s.sheet} ${s.heatGrid}`} style={at(24, 28, { width: 148 })}>
        {Array.from({ length: 36 }, (_, i) => (
          <span key={i} style={{ background: HEAT[((((i * 7 + (i >> 2)) * 13) >>> 0) % 4)] }} />
        ))}
      </div>
      <div className={`${s.sheet} ${s.col}`} style={at(184, 44, { width: 180, height: 96, padding: "10px 12px" })}>
        <div className={s.lollipops}>
          {LOLLI.map((h, i) => (
            <span key={i} className={s.stem} style={{ height: h * 0.62 }}>
              <span className={s.head} style={i === 3 ? { background: "#dd0951" } : i === 5 ? { background: c("green-150") } : undefined} />
            </span>
          ))}
        </div>
        <div className={s.domains}>
          <span style={{ marginLeft: "18%", width: "22%", background: c("green-100") }} />
          <span style={{ marginLeft: "14%", width: "26%", background: c("yellow-100") }} />
        </div>
      </div>
    </>
  );
}

/* A slice of the real FilterPanel: the drawer (header, accordion section, checkbox rows with counts)
   beside the domain rail, Participant selected — cropped at the bottom like a panel that continues. */
const RAIL = [
  [Network, "Cancer category"],
  [BookOpen, "Study"],
  [User, "Participant"],
  [Microscope, "Sample"],
  [Hospital, "Clinical"],
] as const;

function Filters() {
  const row = (label: string, count: string, on = false) => (
    <div className={s.fpRow}>
      <span className={on ? `${s.box} ${s.boxOn}` : s.box}>{on ? <Check aria-hidden="true" /> : null}</span>
      <span className={s.fpLabel}>{label}</span>
      <span className={s.fpCount}>{count}</span>
    </div>
  );
  return (
    <>
      <div className={`${s.sheet} ${s.fpDrawer}`} style={at(62, 20, { width: 236 })}>
        <div className={s.fpHead}>
          <span className={s.fpTitle}>Participant</span>
          <span className={s.fpReset}>
            <RotateCcw aria-hidden="true" />
            Reset
          </span>
          <X className={s.fpClose} aria-hidden="true" />
        </div>
        <div className={s.fpSection}>
          <ChevronUp aria-hidden="true" />
          Sex
          <Search className={s.fpSearch} aria-hidden="true" />
        </div>
        {row("Female", "1,568", true)}
        {row("Male", "1,512")}
        {row("Unknown", "104")}
        <div className={s.fpSection} style={{ borderTop: `1px solid ${c("grey-30")}`, marginTop: 6 }}>
          <ChevronDown aria-hidden="true" />
          Vital Status
        </div>
      </div>
      <div className={`${s.sheet} ${s.fpRail}`} style={at(304, 20, { width: 54 })}>
        <span className={s.fpRailTitle}>Filters</span>
        {RAIL.map(([Icon, label]) => (
          <span key={label} className={label === "Participant" ? `${s.fpRailItem} ${s.fpRailOn}` : s.fpRailItem}>
            <Icon aria-hidden="true" />
            {label}
          </span>
        ))}
      </div>
      <MousePointer2 className={s.cursor} style={at(118, 82)} aria-hidden="true" />
    </>
  );
}

function Saved() {
  return (
    <div className={s.col} style={{ position: "absolute", left: 44, top: 22, width: 300, gap: 8 }}>
      <span className={`${s.cta} ${s.pill}`} style={{ alignSelf: "flex-end", padding: "5px 10px", fontSize: 10 }}>
        <Plus aria-hidden="true" />
        New query
      </span>
      <div className={s.query}>
        <Bookmark fill={c("green-150")} color={c("green-150")} aria-hidden="true" />
        MYCN amplified, under 5
        <span className={s.mono} style={{ marginLeft: "auto", fontSize: 10, fontWeight: 400, color: c("grey-200") }}>
          128
        </span>
      </div>
      {[0.75, 0.5].map((o, i) => (
        <div key={o} className={s.query} style={{ opacity: o }}>
          <Bookmark color={c("grey-200")} aria-hidden="true" />
          <Line w={i ? 90 : 120} />
          <span className={s.line} style={{ width: 18, marginLeft: "auto" }} />
        </div>
      ))}
    </div>
  );
}

function Access() {
  const tier = (label: string, on: boolean) => (
    <span className={s.pill} style={{ padding: "3px 8px", background: c(on ? "green-150" : "grey-10"), color: c(on ? "white" : "grey-200") }}>
      {label}
    </span>
  );
  return (
    <div className={`${s.sheet} ${s.col}`} style={at(44, 32, { width: 300, padding: 14, gap: 10 })}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
        <span className={s.caps}>YOUR DATASET ACCESS</span>
        <span className={s.figure} style={{ fontSize: 16 }}>
          71%
        </span>
      </div>
      <div className={s.proportion}>
        <span style={{ width: "71%" }} />
      </div>
      <div className={s.row} style={{ gap: 6 }}>
        {tier("T1 Registered", true)}
        {tier("T2", false)}
        {tier("T3", false)}
      </div>
    </div>
  );
}

function Request() {
  return (
    <>
      <div className={`${s.sheet} ${s.col}`} style={at(40, 26, { width: 130, padding: 12, gap: 7 })}>
        <span className={s.modelIcon} style={{ width: 26, height: 26, borderRadius: 6 }}>
          <Lock style={{ width: 14, height: 14 }} aria-hidden="true" />
        </span>
        <Line w="90%" />
        <Line w="70%" />
        <Line w="80%" />
        <Line w="50%" />
      </div>
      <span className={s.dash} style={at(176, 84, { width: 30 })} />
      <span className={s.cta} style={at(210, 70, { position: "absolute", height: 30, padding: "0 14px", fontSize: 11, boxShadow: "0 6px 18px rgba(2,32,52,0.12)" })}>
        Request data access
      </span>
      <MousePointer2 className={s.cursor} style={at(318, 92)} aria-hidden="true" />
    </>
  );
}

function Assistant() {
  return (
    <div className={s.col} style={{ position: "absolute", left: 40, top: 20, width: 308, gap: 8 }}>
      <span className={s.bubbleUser}>How many MYCN amplified cases?</span>
      <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
        <span className={s.spark}>
          <Sparkle aria-hidden="true" />
        </span>
        <div className={s.bubbleAi}>
          <Line w="85%" />
          <Line w="60%" />
          <div className={s.bars} style={{ height: 26, gap: 4 }}>
            {[50, 100, 70, 35].map((h, i) => (
              <span key={i} style={{ flex: "0 0 14px", height: `${h}%`, background: c(i === 1 ? "green-150" : "green-50") }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Ready() {
  return (
    <>
      <div className={`${s.sheet} ${s.col}`} style={at(60, 30, { width: 230, padding: 6, gap: 2 })}>
        <div className={`${s.menuItem} ${s.hitOn}`} style={{ fontWeight: 500, color: c("off-black-100") }}>
          <RotateCcw size={12} strokeWidth={2.5} color={c("green-200")} aria-hidden="true" />
          Replay onboarding tour
        </div>
        <div className={s.menuItem}>
          <FileText size={12} aria-hidden="true" />
          Data access agreement
        </div>
        <div className={s.menuItem}>
          <span className={s.box} style={{ borderRadius: "50%" }} />
          FAQs
        </div>
      </div>
      <span className={s.done} style={at(268, 84)}>
        <Check aria-hidden="true" />
      </span>
    </>
  );
}

const SCENES: Record<TourIllustrationName, () => ReactNode> = {
  views: Views,
  search: SearchScene,
  metrics: Metrics,
  published: Published,
  cohort: Cohort,
  oncoprint: OncoprintScene,
  pdx: Pdx,
  molecular: Molecular,
  filters: Filters,
  saved: Saved,
  access: Access,
  request: Request,
  assistant: Assistant,
  ready: Ready,
};

export const TOUR_ILLUSTRATIONS = Object.keys(SCENES) as TourIllustrationName[];

/** One of the tour's step illustrations, for an illustrated TourCard's picture header. */
export function TourIllustration({ name }: { name: TourIllustrationName }) {
  const Scene = SCENES[name];
  return (
    <div className={s.scene}>
      <Scene />
    </div>
  );
}
