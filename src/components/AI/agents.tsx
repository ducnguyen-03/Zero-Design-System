import type { ReactNode } from "react";
import { AgentAvatar } from "./AgentAvatar";
import type { AgentAvatarProps } from "./AgentAvatar";
import zakMark from "../../assets/ai/zak-glyph.svg";
import sidneyMark from "../../assets/ai/sidney-glyph.svg";
import karlMark from "../../assets/ai/karl-glyph.svg";
import janetMark from "../../assets/ai/janet-glyph.svg";
import williamMark from "../../assets/ai/william-glyph.svg";
import pedtrialMark from "../../assets/ai/pedtrial-glyph.svg";

export type ZakAgentId = "zak" | "sidney" | "karl" | "janet" | "william" | "pedtrial";

export interface ZakAgent {
  id: ZakAgentId;
  name: string;
  role: string;
  /** Official logo (SVG). */
  mark: string;
  /** Logo colour — for accents that point at the agent (timeline rails, chart keys). */
  color: string;
  /** Opaque tile tint, pre-mixed on white so it reads the same on grey-10 / grey-30 surfaces. */
  tile: string;
  /** Optical size of the mark in the tile: dense marks sit smaller than open ones. */
  markScale: number;
}

/**
 * The ZAK agents and their official marks — one source for name, role and colour, so a chip,
 * a run card and a timeline marker always agree on who an agent is.
 */
export const ZAK_AGENTS: Record<ZakAgentId, ZakAgent> = {
  zak: { id: "zak", name: "Zak", role: "Conductor", mark: zakMark, color: "#f9d51a", tile: "#ffe788", markScale: 0.62 },
  sidney: { id: "sidney", name: "Sidney", role: "Cohort Expert", mark: sidneyMark, color: "#e05229", tile: "#fbeae5", markScale: 0.54 },
  karl: { id: "karl", name: "Karl", role: "Literature Expert", mark: karlMark, color: "#f76de8", tile: "#fdecfc", markScale: 0.56 },
  janet: { id: "janet", name: "Janet", role: "Variant Expert", mark: janetMark, color: "#fbd53e", tile: "#fff4d1", markScale: 0.6 },
  william: { id: "william", name: "William", role: "Case & Patient Expert", mark: williamMark, color: "#23c6bc", tile: "#e3f7f6", markScale: 0.52 },
  pedtrial: { id: "pedtrial", name: "PedTrial", role: "Trial-matching Expert", mark: pedtrialMark, color: "#8e7cf3", tile: "#efedfd", markScale: 0.6 },
};

export interface ZakAgentAvatarProps extends Omit<AgentAvatarProps, "children" | "background" | "markScale" | "label"> {
  agent: ZakAgentId;
  /** Announce the agent's name. Leave off when the name is printed beside the avatar. */
  labelled?: boolean;
  /** Override the mark, e.g. for a seasonal variant. */
  children?: ReactNode;
}

/** `AgentAvatar` for a known ZAK agent: mark, tile and optical size come from `ZAK_AGENTS`. */
export function ZakAgentAvatar({ agent, labelled = false, children, ...rest }: ZakAgentAvatarProps) {
  const a = ZAK_AGENTS[agent];
  return (
    <AgentAvatar background={a.tile} markScale={a.markScale} label={labelled ? a.name : undefined} {...rest}>
      {children ?? <img src={a.mark} alt="" />}
    </AgentAvatar>
  );
}
