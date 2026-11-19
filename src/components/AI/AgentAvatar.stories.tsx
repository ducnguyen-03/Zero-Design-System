import type { Meta, StoryObj } from "@storybook/react-vite";
import { AgentAvatarGroup } from "./AgentAvatar";
import type { AgentAvatarSize, AgentAvatarStatus } from "./AgentAvatar";
import { ZAK_AGENTS, ZakAgentAvatar } from "./agents";
import type { ZakAgentId } from "./agents";

const meta: Meta = {
  title: "AI/Agent Avatar",
  parameters: {
    docs: {
      description: {
        component:
          "Identity tile for each ZAK agent, from the official marks. `ZAK_AGENTS` holds name, role, mark, logo colour, " +
          "an **opaque** tile tint (pre-mixed on white, so it reads the same on grey wells) and the mark's **optical size** — " +
          "Sidney's four discs and William's stacked pill fill their box, Zak's glyph is open, PedTrial's violet cross sits in between, so each sits at its own scale. " +
          "`status` puts live state on the tile: a running ring for `working`, a corner dot for `done`, `attention` and `blocked`. " +
          "`AgentAvatarGroup` stacks the agents of a turn or a space.",
      },
    },
  },
};
export default meta;
type Story = StoryObj;

const IDS = Object.keys(ZAK_AGENTS) as ZakAgentId[];
const SIZES: AgentAvatarSize[] = [20, 24, 28, 32, 40];
const label: React.CSSProperties = {
  font: "500 11.2px/1.4 var(--insight-font-family-sans)",
  letterSpacing: "0.784px",
  textTransform: "uppercase",
  color: "var(--insight-color-grey-100)",
};

/** Every agent at every size, square and circle. */
export const Agents: Story = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "180px repeat(10, auto)", gap: "16px 20px", alignItems: "center", fontFamily: "var(--insight-font-family-sans)" }}>
      <span />
      {SIZES.map((s) => (
        <span key={`sq${s}`} style={label}>
          {s}
        </span>
      ))}
      {SIZES.map((s) => (
        <span key={`ci${s}`} style={label}>
          {s} ●
        </span>
      ))}
      {IDS.map((id) => (
        <div key={id} style={{ display: "contents" }}>
          <span style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ font: "500 14px/20px var(--insight-font-family-sans)", color: "var(--insight-color-off-black-100)" }}>
              {ZAK_AGENTS[id].name}
            </span>
            <span style={{ font: "12px/16px var(--insight-font-family-sans)", color: "var(--insight-color-grey-100)" }}>
              {ZAK_AGENTS[id].role}
            </span>
          </span>
          {SIZES.map((s) => (
            <ZakAgentAvatar key={`sq${s}`} agent={id} size={s} labelled />
          ))}
          {SIZES.map((s) => (
            <ZakAgentAvatar key={`ci${s}`} agent={id} size={s} shape="circle" labelled />
          ))}
        </div>
      ))}
    </div>
  ),
};

/** Live state on the tile — readable at 20px in a chip, and on grey surfaces. */
export const Status: Story = {
  render: () => {
    const statuses: Array<[AgentAvatarStatus | undefined, string]> = [
      [undefined, "Idle"],
      ["working", "Working"],
      ["done", "Done"],
      ["attention", "Needs attention"],
      ["blocked", "Blocked"],
    ];
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {(["var(--insight-color-white)", "var(--insight-color-grey-30)"] as const).map((surface) => (
          <div
            key={surface}
            style={{ display: "flex", gap: 32, padding: 20, borderRadius: 12, background: surface, ["--agent-avatar-surface" as string]: surface }}
          >
            {statuses.map(([st, text], i) => (
              <div key={text} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                <span style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <ZakAgentAvatar agent={IDS[i]} size={32} status={st} labelled />
                  <ZakAgentAvatar agent={IDS[i]} size={20} shape="circle" status={st} labelled />
                </span>
                <span style={label}>{text}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  },
};

/** Who worked on a turn, who is in a space. */
export const Group: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
      {([20, 24, 32] as const).map((size) => (
        <AgentAvatarGroup key={size} size={size} aria-label="Agents in this space">
          {IDS.map((id) => (
            <ZakAgentAvatar key={id} agent={id} size={size} labelled />
          ))}
        </AgentAvatarGroup>
      ))}
      <AgentAvatarGroup size={24} max={3} aria-label="Agents in this space">
        {IDS.map((id) => (
          <ZakAgentAvatar key={id} agent={id} size={24} labelled />
        ))}
      </AgentAvatarGroup>
    </div>
  ),
};
