import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";
import { Avatar, AvatarGroup, AvatarStatus } from "./Avatar";
import type { AvatarColor, AvatarProps, AvatarSize, AvatarStatusType } from "./Avatar";
import { Section, Stage, StateCell } from "../../storybook/StoryLayout";

/** Persona photos exported from Figma "Avatar personas" (3412:12958). */
const CURATOR = "/figma/avatar/curator.jpg";
const CLINICIAN = "/figma/avatar/clinician.jpg";

const SIZES: AvatarSize[] = ["sm", "md", "lg"];
const SIZE_LABEL: Record<AvatarSize, string> = { sm: "Default · 36", md: "Medium · 44", lg: "Large · 64" };
const COLORS: AvatarColor[] = [
  "grey",
  "magenta-light",
  "magenta-dark",
  "purple-light",
  "purple-dark",
  "violet-light",
  "violet-dark",
  "yellow-light",
  "yellow-dark",
  "orange-light",
  "orange-dark",
  "turquoise-light",
  "turquoise-dark",
  "green",
];
const STATUSES: AvatarStatusType[] = ["default", "edit", "ready-to-start", "in-progress", "done"];
const noop = () => {};

function Focused({ children }: { children: ReactNode }) {
  return (
    <div className="pseudo-focus-visible-all" style={{ display: "inline-flex" }}>
      {children}
    </div>
  );
}

type AvatarType = "initials" | "image" | "add";
type AvatarStoryArgs = AvatarProps & { type?: AvatarType; withStatus?: boolean; interactive?: boolean };

const meta: Meta<AvatarStoryArgs> = {
  title: "Components/Avatar",
  component: Avatar,
  parameters: {
    docs: {
      description: {
        component:
          "Figma **Avatar** (3412:12710): Add, Initials or Image, at 36 / 44 / 64px, with an optional status dot and a focus ring when interactive. Also exports `AvatarStatus` (Figma **Avatar Status**, 3412:13100) and `AvatarGroup` (Figma **Avatar group**, 3412:12871). Initials colours come from **Avatar with initials** (3412:12971); the persona photos from **Avatar personas** (3412:12958).",
      },
    },
  },
  args: {
    type: "initials",
    name: "Priya Bose",
    size: "sm",
    color: "grey",
    withStatus: false,
    interactive: false,
  },
  argTypes: {
    type: { control: "inline-radio", options: ["initials", "image", "add"], name: "type (story)" },
    size: { control: "inline-radio", options: SIZES },
    color: { control: "select", options: COLORS },
    name: { control: "text" },
    initials: { control: "text" },
    src: { control: "text" },
    withStatus: { control: "boolean", name: "status (story)" },
    interactive: { control: "boolean", name: "interactive (story)", description: "Adds onClick → renders a button." },
    add: { control: false },
    status: { control: false },
    onClick: { control: false },
  },
  render: ({ type, withStatus, interactive, ...rest }) => (
    <Avatar
      {...rest}
      add={type === "add"}
      src={type === "image" ? (rest.src ?? CURATOR) : undefined}
      status={withStatus ? <AvatarStatus curator={1} /> : undefined}
      onClick={interactive ? noop : undefined}
    />
  ),
};
export default meta;

type Story = StoryObj<AvatarStoryArgs>;

export const Playground: Story = {};

/** Figma axes: Type × Size × Status × State (Focus is the real :focus-visible ring). */
export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div>
      {SIZES.map((s) => (
        <Section key={s} title={SIZE_LABEL[s]}>
          <Stage gap={24} align="center">
            {(["add", "initials", "image"] as const).map((t) => {
              const sample = (withStatus: boolean) => (
                <Avatar
                  size={s}
                  add={t === "add"}
                  name="Priya Bose"
                  src={t === "image" ? CURATOR : undefined}
                  status={withStatus ? <AvatarStatus curator={1} /> : undefined}
                  onClick={noop}
                />
              );
              return (
                <Stage key={t} gap={16} align="center">
                  <StateCell label={t}>{sample(false)}</StateCell>
                  <StateCell label="+ status">{sample(true)}</StateCell>
                  <StateCell label="focus">
                    <Focused>{sample(false)}</Focused>
                  </StateCell>
                  <StateCell label="focus + status">
                    <Focused>{sample(true)}</Focused>
                  </StateCell>
                </Stage>
              );
            })}
          </Stage>
        </Section>
      ))}
    </div>
  ),
};

/** Figma "Avatar with initials" — 14 colours; dark tones switch to white initials. */
export const Colors: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Stage gap={16}>
      {COLORS.map((c) => (
        <StateCell key={c} label={c} align="center">
          <Avatar name="Priya Bose" color={c} />
        </StateCell>
      ))}
    </Stage>
  ),
};

/** Figma "Avatar personas" — Curator and Clinician photos. */
export const Personas: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Stage gap={24} align="center">
      <StateCell label="Curator">
        <Avatar src={CURATOR} name="Curator" />
      </StateCell>
      <StateCell label="Clinician">
        <Avatar src={CLINICIAN} name="Clinician" />
      </StateCell>
      <StateCell label="Broken src → initials">
        <Avatar src="/figma/avatar/missing.jpg" name="Alex Lee" color="violet-light" />
      </StateCell>
    </Stage>
  ),
};

/** Figma "Avatar Status" — Status × Curator × State. */
export const Status: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Section title="AvatarStatus" description="14px indicator. `default` shows the curator number.">
      <Stage column gap={16}>
        {[false, true].map((disabled) => (
          <Stage key={String(disabled)} gap={24} align="center">
            <StateCell label={disabled ? "curator 1 · disabled" : "curator 1"} align="center">
              <AvatarStatus curator={1} disabled={disabled} />
            </StateCell>
            <StateCell label="curator 2" align="center">
              <AvatarStatus curator={2} disabled={disabled} />
            </StateCell>
            {STATUSES.slice(1).map((st) => (
              <StateCell key={st} label={st} align="center">
                <AvatarStatus status={st} disabled={disabled} />
              </StateCell>
            ))}
          </Stage>
        ))}
      </Stage>
    </Section>
  ),
};

const MEMBERS = [
  <Avatar key="a" src={CURATOR} name="Curator" />,
  <Avatar key="b" name="Priya Bose" color="yellow-light" />,
  <Avatar key="c" src={CLINICIAN} name="Clinician" status={<AvatarStatus status="in-progress" />} />,
  <Avatar key="d" name="Alex Lee" color="violet-light" />,
  <Avatar key="e" name="Sam Chen" color="turquoise-light" />,
  <Avatar key="f" name="Jo Park" color="orange-light" />,
  <Avatar key="g" name="Kim Nguyen" color="green" />,
];

/** Figma "Avatar group" — Mode × Number (1–5+) × Add More To Group. */
export const Group: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div>
      {(["light", "dark"] as const).map((mode) => (
        <Section key={mode} title={`Mode · ${mode}`} description="Up to five slots; extra members collapse into “+N”.">
          <div
            style={{
              display: "inline-flex",
              gap: 48,
              padding: 16,
              borderRadius: 8,
              background:
                mode === "dark"
                  ? "var(--insight-color-off-black-100)"
                  : "var(--insight-color-background-system-secondary)",
            }}
          >
            {[true, false].map((withAdd) => (
              <Stage key={String(withAdd)} column gap={12}>
                {[7, 4, 3, 2, 1].map((n) =>
                  !withAdd && n === 1 ? null : (
                    <StateCell key={n} label={`${n > 5 ? "5+" : n}${withAdd ? " · add" : ""}`}>
                      <AvatarGroup mode={mode} onAdd={withAdd ? noop : undefined}>
                        {MEMBERS.slice(0, n)}
                      </AvatarGroup>
                    </StateCell>
                  ),
                )}
              </Stage>
            ))}
          </div>
        </Section>
      ))}
      <Section title="Medium" description="Groups support the small and medium sizes only.">
        <AvatarGroup size="md" onAdd={noop}>
          {MEMBERS}
        </AvatarGroup>
      </Section>
    </div>
  ),
};
