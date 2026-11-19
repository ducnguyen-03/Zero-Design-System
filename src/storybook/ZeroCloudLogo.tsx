import type { CSSProperties } from "react";

/**
 * ZeroCloud lockup (Figma Website › Logo exploration › "Zcloud logo", 38:261).
 * Composes the two exported assets at the Figma geometry: a 1363.9 × 203.45 frame
 * with the mark at the origin and the wordmark at (355, 23).
 *
 * NOTE: this file is intentionally NOT a *.stories.tsx — it is a helper module.
 */

const FRAME_W = 1363.908;
const FRAME_H = 203.452;
const pct = (v: number, of: number) => `${(v / of) * 100}%`;

export function ZeroCloudLogo({
  width = 240,
  onDark = false,
  style,
}: {
  width?: number;
  /** Knocks the wordmark out to white; the multi-coloured mark is kept as-is. */
  onDark?: boolean;
  style?: CSSProperties;
}) {
  return (
    <span
      role="img"
      aria-label="ZeroCloud"
      style={{ position: "relative", display: "inline-block", width, aspectRatio: `${FRAME_W} / ${FRAME_H}`, ...style }}
    >
      <img
        src="/assets/ZeroCloudMark.svg"
        alt=""
        style={{ position: "absolute", left: 0, top: 0, width: pct(302.499, FRAME_W), height: "100%" }}
      />
      <img
        src="/assets/ZeroCloudWordmark.svg"
        alt=""
        style={{
          position: "absolute",
          left: pct(355, FRAME_W),
          top: pct(23, FRAME_H),
          width: pct(1008.908, FRAME_W),
          height: pct(156.73, FRAME_H),
          filter: onDark ? "brightness(0) invert(1)" : undefined,
        }}
      />
    </span>
  );
}
