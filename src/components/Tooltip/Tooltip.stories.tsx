import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import {
  Bold,
  CircleQuestionMark,
  Copy,
  Download,
  Italic,
  Link,
  ListOrdered,
  Search,
  Share2,
  Trash2,
  Underline,
} from "lucide-react";
import { Tooltip } from "./Tooltip";
import type { TooltipAlign, TooltipAppearance, TooltipPlacement } from "./Tooltip";
import { IconButton } from "../IconButton/IconButton";
import { Section, Stage, StateCell } from "../../storybook/StoryLayout";

const SHORT = "Download cohort export";
const LONG =
  "Counts are taken against the pinned cohort snapshot (2026.02). Patients added since then are not included until the snapshot is refreshed.";

const meta: Meta<typeof Tooltip> = {
  title: "Components/Tooltip",
  component: Tooltip,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A short label for a control. **dark** (default, off-black) or **light** (white with a hairline — for dark or busy surfaces). " +
          "Opens after a 350ms hover delay — instantly when moving between neighbouring tooltipped controls — and on keyboard focus (not on mouse click). " +
          "Escape dismisses. The bubble renders in a layer above the page, so cards and scroll areas never clip it; it flips to the other side when " +
          "there is no room and shifts to stay on screen, with the arrow still pointing at the trigger. `shortcut` adds a key hint. " +
          "The trigger gets `aria-describedby`; the bubble is `role=\"tooltip\"`.",
      },
    },
  },
  args: { label: SHORT, placement: "top", align: "center", appearance: "dark", multiline: false, delay: 350 },
  argTypes: {
    label: { control: "text" },
    appearance: { control: "inline-radio", options: ["dark", "light"] },
    placement: { control: "inline-radio", options: ["top", "bottom", "left", "right"] },
    align: { control: "inline-radio", options: ["start", "center", "end"] },
    multiline: { control: "boolean" },
    shortcut: { control: "text" },
    delay: { control: { type: "number", min: 0, step: 50 } },
    open: { control: "boolean" },
    children: { control: false },
  },
  render: (args) => (
    <Tooltip {...args}>
      <IconButton aria-label="Download" icon={<Download />} />
    </Tooltip>
  ),
};
export default meta;

type Story = StoryObj<typeof Tooltip>;

/** Hover (after the delay) or Tab to the trigger. */
export const Playground: Story = {
  args: {
    appearance: "light"
  },

  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const btn = c.getByRole("button", { name: "Download" });
    await userEvent.hover(btn);
    const tip = within(document.body).getByRole("tooltip", { hidden: true });
    await waitFor(() => expect(tip).toHaveAttribute("data-state", "open"));
    await userEvent.keyboard("{Escape}");
    await userEvent.unhover(btn);
    await waitFor(() => expect(tip).toHaveAttribute("data-state", "closed"));
  }
};

function Surface({ dark, appearance }: { dark?: boolean; appearance: TooltipAppearance }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 48,
        padding: "64px 56px 40px",
        borderRadius: 12,
        background: dark ? "var(--insight-color-off-black-100)" : "var(--insight-color-white)",
        border: dark ? "none" : "1px solid var(--insight-color-grey-30)",
      }}
    >
      <Tooltip open appearance={appearance} label="Search" shortcut="⌘K">
        <IconButton
          aria-label={`Search (${appearance} on ${dark ? "dark" : "light"})`}
          icon={<Search color={dark ? "white" : undefined} />}
        />
      </Tooltip>
      <Tooltip open appearance={appearance} label="Copy link" placement="bottom">
        <IconButton
          aria-label={`Copy link (${appearance} on ${dark ? "dark" : "light"})`}
          icon={<Link color={dark ? "white" : undefined} />}
        />
      </Tooltip>
    </div>
  );
}

/** Dark and light, each on a light and a dark surface. Light earns its place on dark or image-heavy surfaces. */
export const Appearances: Story = {
  parameters: { controls: { disable: true }, layout: "padded" },
  render: () => (
    <Stage gap={24}>
      <StateCell label="Dark · light surface">
        <Surface appearance="dark" />
      </StateCell>
      <StateCell label="Light · light surface">
        <Surface appearance="light" />
      </StateCell>
      <StateCell label="Light · dark surface">
        <Surface dark appearance="light" />
      </StateCell>
      <StateCell label="Dark · dark surface">
        <Surface dark appearance="dark" />
      </StateCell>
    </Stage>
  ),
};

const PLACEMENTS: TooltipPlacement[] = ["top", "bottom", "left", "right"];
const ALIGNS: TooltipAlign[] = ["start", "center", "end"];

function Grid({ appearance, multiline }: { appearance: TooltipAppearance; multiline: boolean }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, max-content)",
        columnGap: multiline ? 360 : 220,
        rowGap: multiline ? 150 : 96,
        padding: multiline ? "96px 330px" : "56px 190px",
      }}
    >
      {PLACEMENTS.flatMap((p) =>
        ALIGNS.map((a) => (
          <div key={`${p}-${a}`} style={{ display: "grid", justifyItems: "center", gap: 8 }}>
            <Tooltip open appearance={appearance} label={multiline ? LONG : "Download cohort export"} placement={p} align={a} multiline={multiline}>
              <IconButton aria-label={`Help ${appearance} ${p} ${a}${multiline ? " multi" : ""}`} icon={<CircleQuestionMark />} />
            </Tooltip>
            <code style={{ font: "10px var(--insight-font-family-mono)", color: "var(--insight-color-grey-100)" }}>
              {p} · {a}
            </code>
          </div>
        )),
      )}
    </div>
  );
}

/** Every Figma variant: Direction × Align × Lines, in both appearances (forced open). */
export const Variants: Story = {
  parameters: { controls: { disable: true }, layout: "padded" },
  render: () => (
    <div>
      <Section title="Dark · single line">
        <Grid appearance="dark" multiline={false} />
      </Section>
      <Section title="Light · single line">
        <Grid appearance="light" multiline={false} />
      </Section>
      <Section title="Dark · multi line" description="Wraps at a 300px max width.">
        <Grid appearance="dark" multiline />
      </Section>
    </div>
  ),
};

/** Move the pointer along the toolbar: after the first tooltip opens, the next ones open instantly. */
export const Toolbar: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div
      role="toolbar"
      aria-label="Formatting"
      style={{
        display: "flex",
        gap: 4,
        padding: 4,
        borderRadius: 10,
        background: "var(--insight-color-white)",
        border: "1px solid var(--insight-color-grey-30)",
      }}
    >
      {[
        [<Bold key="b" />, "Bold", "⌘B"],
        [<Italic key="i" />, "Italic", "⌘I"],
        [<Underline key="u" />, "Underline", "⌘U"],
        [<ListOrdered key="l" />, "Numbered list", undefined],
        [<Copy key="c" />, "Duplicate", "⌘D"],
        [<Share2 key="s" />, "Share", undefined],
        [<Trash2 key="t" />, "Delete", "⌫"],
      ].map(([icon, label, key]) => (
        <Tooltip key={label as string} label={label as string} shortcut={key as string | undefined} placement="bottom">
          <IconButton aria-label={label as string} icon={icon} />
        </Tooltip>
      ))}
    </div>
  ),
};

/** Near the viewport edge the bubble flips (top → bottom) and shifts inward; the arrow keeps pointing at the trigger. */
export const Collisions: Story = {
  parameters: { controls: { disable: true }, layout: "fullscreen" },
  render: () => (
    <div style={{ position: "relative", height: 320 }}>
      <div style={{ position: "absolute", top: 4, left: 4 }}>
        <Tooltip open label="Flipped below: no room above">
          <IconButton aria-label="Top-left corner" icon={<CircleQuestionMark />} />
        </Tooltip>
      </div>
      <div style={{ position: "absolute", top: 4, right: 4 }}>
        <Tooltip open appearance="light" label="Shifted inward from the right edge">
          <IconButton aria-label="Top-right corner" icon={<CircleQuestionMark />} />
        </Tooltip>
      </div>
      <div style={{ position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)" }}>
        <Tooltip open placement="bottom" label="Flipped above: no room below">
          <IconButton aria-label="Bottom edge" icon={<CircleQuestionMark />} />
        </Tooltip>
      </div>
      <div
        style={{
          position: "absolute",
          top: 120,
          left: 40,
          width: 200,
          height: 72,
          overflow: "hidden",
          borderRadius: 12,
          border: "1px dashed var(--insight-color-grey-75)",
          display: "grid",
          placeItems: "center",
        }}
      >
        <Tooltip open label="Not clipped by overflow: hidden">
          <IconButton aria-label="Inside a clipping card" icon={<CircleQuestionMark />} />
        </Tooltip>
      </div>
    </div>
  ),
};
