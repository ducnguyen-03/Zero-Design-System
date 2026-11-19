import type { Meta, StoryObj } from "@storybook/react-vite";
import { LogOut, UserRound } from "lucide-react";
import { TopNav } from "./TopNav";
import type { TopNavProps } from "./TopNav";
import { Stage, StateCell, Section } from "../../storybook/StoryLayout";

const links = [
  { label: "Explore data", href: "#explore", active: true },
  { label: "FAQs", href: "#faqs" },
];

const user = { name: "Kimberly Tran", initials: "KT", email: "kimberly@ccia.org.au" };
const noop = () => {};
const menu = [
  { label: "Profile", icon: <UserRound />, onSelect: noop },
  { label: "Sign out", icon: <LogOut />, onSelect: noop },
];

type PlaygroundArgs = TopNavProps & { loggedIn: boolean };

const meta: Meta<PlaygroundArgs> = {
  title: "Components/TopNav",
  component: TopNav,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Global header (`<header>` landmark). Figma axes: **Type** → `theme` (light/dark); **Authentication status** → pass `user` for Logged in, omit it for Not logged in (Login button). Tabs are links with `aria-current` on the active one.",
      },
    },
  },
  args: { theme: "light", loggedIn: true, feedbackHref: "https://example.org/feedback" },
  argTypes: {
    theme: { control: "inline-radio", options: ["light", "dark"] },
    loggedIn: { control: "boolean", description: "Story-only toggle for `user`." },
    links: { control: false },
    user: { control: false },
    logo: { control: false },
    userMenuItems: { control: false },
    onSignIn: { action: "sign-in" },
  },
  render: ({ loggedIn, ...args }) => (
    <TopNav
      {...args}
      links={links}
      user={loggedIn ? user : undefined}
      userMenuItems={menu}
    />
  ),
};
export default meta;

type Story = StoryObj<PlaygroundArgs>;

export const Playground: Story = {};

export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Section title="Type × Authentication status">
      <Stage column gap={24}>
        <StateCell label="Light · Logged in">
          <TopNav navLabel="Primary (light, logged in)" links={links} user={user} userMenuItems={menu} feedbackHref="#feedback" />
        </StateCell>
        <StateCell label="Dark · Logged in">
          <TopNav navLabel="Primary (dark, logged in)" theme="dark" links={links} user={user} userMenuItems={menu} />
        </StateCell>
        <StateCell label="Light · Not logged in">
          <TopNav navLabel="Primary (light, logged out)" links={links} feedbackHref="#feedback" onSignIn={noop} />
        </StateCell>
        <StateCell label="Dark · Not logged in">
          <TopNav navLabel="Primary (dark, logged out)" theme="dark" links={links} feedbackHref="#feedback" onSignIn={noop} />
        </StateCell>
      </Stage>
    </Section>
  ),
};
