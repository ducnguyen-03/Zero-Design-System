import { AgentAvatar } from "../components/AI/AgentAvatar";
import type { AgentAvatarShape, AgentAvatarSize, AgentAvatarStatus } from "../components/AI/AgentAvatar";
import { ZAK_AGENTS, ZakAgentAvatar } from "../components/AI/agents";
import type { ZakAgentId } from "../components/AI/agents";
import zakWordmark from "../assets/ai/zak-wordmark.svg";

/** Story shorthands over `ZakAgentAvatar` — the marks, tiles and optical sizes live in `ZAK_AGENTS`. */
export const ZAK_BG = ZAK_AGENTS.zak.tile;
export const SIDNEY_BG = ZAK_AGENTS.sidney.tile;

interface DemoProps {
  size?: AgentAvatarSize;
  shape?: AgentAvatarShape;
  status?: AgentAvatarStatus;
  label?: string;
}

function demoAgent(agent: ZakAgentId) {
  return function DemoAgent({ label, ...rest }: DemoProps) {
    return <ZakAgentAvatar agent={agent} labelled={Boolean(label)} {...rest} />;
  };
}

export const ZakAvatar = demoAgent("zak");
export const SidneyAvatar = demoAgent("sidney");
export const KarlAvatar = demoAgent("karl");
export const JanetAvatar = demoAgent("janet");
export const WilliamAvatar = demoAgent("william");
export const PedTrialAvatar = demoAgent("pedtrial");

/** ZAK logo for the workspace sidebar: 20px mark + wordmark. */
export function ZakLogo() {
  return (
    <>
      <AgentAvatar size={20} background={ZAK_AGENTS.zak.tile} markScale={ZAK_AGENTS.zak.markScale}>
        <img src={ZAK_AGENTS.zak.mark} alt="" />
      </AgentAvatar>
      <img src={zakWordmark} alt="ZAK" width={35} height={12} />
    </>
  );
}
