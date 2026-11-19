import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";
import { AlertBanner } from "./AlertBanner";
import type { AlertBannerColor } from "./AlertBanner";
import { Section, Stage, StateCell } from "../../storybook/StoryLayout";

const noop = () => {};

interface Copy {
  title: string;
  body: string;
  action: string;
  timestamp?: ReactNode;
}

/** Sample copy from the Figma frames. */
const INLINE: Record<AlertBannerColor, Copy> = {
  info: { title: "Insight DS v2.4 Live", body: "All 45 semantic token roles and corner radius hierarchies have been calibrated and locked.", action: "View Changelog" },
  success: { title: "Figma Token Sync Succeeded", body: "2,925 primitive paint layers bound with 100% coverage and zero unbound styles.", action: "Download Audit" },
  warning: { title: "Legacy Token Sunset", body: "3 deprecated color variables scheduled for removal in Q4. Rebind components to semantic aliases.", action: "Review Migration" },
  danger: { title: "Publish Pipeline Halted", body: "NPM package upload failed due to auth token expiration. Build artifact held in quarantine.", action: "Retry Deploy" },
  neutral: { title: "Scheduled Maintenance Window", body: "Routine CDN cache optimization and token bundle indexing this Sunday at 02:00 UTC.", action: "Maintenance Info" },
};
const STANDARD: Record<AlertBannerColor, Copy> = {
  info: { title: "Core Engine Update", body: "Insight token compiler upgraded with sub-pixel rounding and CSS custom property trees for optimal performance.", timestamp: "Just now", action: "Configure" },
  success: { title: "Contrast Check Passed", body: "100% WCAG AAA contrast ratio verified on all background surface tiers and active input controls.", timestamp: "18m ago", action: "View Audit" },
  warning: { title: "Unbound Variables", body: "Found 4 raw hex fills in legacy slider thumb tooltip nodes that are not linked to global tokens.", timestamp: "1h ago", action: "Rebind Tokens" },
  danger: { title: "Variant Property Conflict", body: "Colliding component properties detected between State=Hover and State=Active in Button group.", timestamp: "2h ago", action: "Resolve Conflict" },
  neutral: { title: "Daily Token Snapshot", body: "Automated token export archive generated and synced with Github semantic-promotion release branch.", timestamp: "Yesterday", action: "View Snapshot" },
};
/** One message per status tone. */
const TONES: Array<{ color: "danger" | "success" | "warning" | "info"; title: string; body: string }> = [
  { color: "danger", title: "Email and password don’t match", body: "Check them and try again or reset your password" },
  { color: "success", title: "Login successful", body: "You’re now signed in and ready to continue" },
  { color: "warning", title: "Action required", body: "Review this case before the deadline or it will be reassigned" },
  { color: "info", title: "System update available", body: "A new version is ready to install. Review the release notes before updating." },
];
const COLORS: AlertBannerColor[] = ["info", "success", "warning", "danger", "neutral"];

const meta: Meta<typeof AlertBanner> = {
  title: "Components/AlertBanner",
  component: AlertBanner,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Status banner: a tinted row with a 1px border in the status colour, the icon on a white tile, " +
          "and a 14px medium title over a 12px description. `action` is an underlined link under the description, `secondaryAction` follows after a “·”; dismiss (x) sits top-right. " +
          "`variant=\"inline\"` spans the container; `variant=\"standard\"` is a 390px card that can add a mono timestamp to the action row. " +
          "`color` = Figma Color. Danger / warning render `role=\"alert\"`, others `role=\"status\"`.",
      },
    },
  },
  args: {
    variant: "inline",
    color: "info",
    title: INLINE.info.title,
    children: INLINE.info.body,
    action: { label: INLINE.info.action, onClick: noop },
    secondaryAction: { label: "Learn more", onClick: noop },
    onDismiss: noop,
  },
  argTypes: {
    variant: { control: "inline-radio", options: ["inline", "standard"] },
    color: { control: "inline-radio", options: COLORS },
    title: { control: "text" },
    children: { control: "text", description: "Description." },
    timestamp: { control: "text" },
    action: { control: false },
    secondaryAction: { control: false },
    icon: { control: false },
  },
};
export default meta;

type Story = StoryObj<typeof AlertBanner>;

export const Playground: Story = {};

/** Danger, success, warning and info: title + description, no action or dismiss. */
export const Tones: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Stage column gap={16}>
      {TONES.map((f) => (
        <AlertBanner key={f.color} variant="standard" color={f.color} title={f.title}>
          {f.body}
        </AlertBanner>
      ))}
    </Stage>
  ),
};

/** Every Figma Variant x Color combination. */
export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Stage column gap={8}>
      {COLORS.map((c) => {
        const i = INLINE[c];
        const s = STANDARD[c];
        return (
          <Section key={c} title={`Color=${c[0].toUpperCase()}${c.slice(1)}`}>
            <Stage column gap={14}>
              <StateCell label="Variant=Inline">
                <AlertBanner
                  color={c}
                  title={i.title}
                  action={{ label: i.action, onClick: noop }}
                  secondaryAction={{ label: "Learn more", onClick: noop }}
                  onDismiss={noop}
                >
                  {i.body}
                </AlertBanner>
              </StateCell>
              <StateCell label="Variant=Standard">
                <AlertBanner
                  variant="standard"
                  color={c}
                  title={s.title}
                  timestamp={s.timestamp}
                  action={{ label: s.action, onClick: noop }}
                  onDismiss={noop}
                >
                  {s.body}
                </AlertBanner>
              </StateCell>
            </Stage>
          </Section>
        );
      })}
    </Stage>
  ),
};
