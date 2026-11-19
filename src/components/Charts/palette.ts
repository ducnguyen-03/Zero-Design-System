/**
 * Chart colours — core tokens only, so charts follow the theme.
 * `CHART_CATEGORICAL` is ordered for neighbouring contrast: never reorder to "match" one chart.
 */
export const CHART_CATEGORICAL = [
  "var(--insight-color-blue-100)",
  "var(--insight-color-green-50)",
  "var(--insight-color-red-150)",
  "var(--insight-color-magenta-50)",
  "var(--insight-color-green-150)",
  "var(--insight-color-orange-100)",
  "var(--insight-color-violet-50)",
  "var(--insight-color-turquoise-100)",
] as const;

export const chartColor = (i: number) => CHART_CATEGORICAL[i % CHART_CATEGORICAL.length];

/** Ink for single-series charts that are not about a category (UpSet, counts). */
export const CHART_INK = "var(--insight-color-off-black-100)";

/** Alteration classes — shared by the oncoprint, the gene table and the participants table chips. */
export const ALTERATION_COLORS = {
  SNV: "var(--insight-color-blue-100)",
  CNV: "var(--insight-color-red-150)",
  SV: "var(--insight-color-orange-100)",
  RNA: "var(--insight-color-grey-100)",
  Germline: "var(--insight-color-green-150)",
  Methylation: "var(--insight-color-purple-100)",
} as const;

export type AlterationType = keyof typeof ALTERATION_COLORS;

/** A "nice" axis maximum and ticks: 0 and four steps of 1/2/2.5/5 × 10ⁿ. */
export function niceTicks(max: number, count = 4): number[] {
  if (max <= 0) return [0, 1];
  const raw = max / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? raw;
  const top = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = 0; v <= top + step / 2; v += step) ticks.push(Math.round(v * 1000) / 1000);
  return ticks;
}

export const fmtNumber = (n: number) => n.toLocaleString("en-AU");
