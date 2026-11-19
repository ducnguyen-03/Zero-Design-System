import type { Meta, StoryObj } from "@storybook/react-vite";
import { useRef } from "react";
import { Toast } from "./Toast";
import type { ToastColor } from "./Toast";
import { Toaster, useToast } from "./Toaster";
import type { ToasterPlacement } from "./Toaster";
import { Button } from "../Button/Button";
import { Section, Stage, StateCell } from "../../storybook/StoryLayout";

const STANDARD_COPY =
  "Every approved amendment is snapshotted for audit. Data access runs under the most recently approved scope — a pending amendment does not change the active scope until it is approved.";
const INLINE_COPY =
  "Every approved amendment is snapshotted for audit. Select any point on the timeline to open that version's full application snapshot alongside the list.";

/** One message per status tone. */
const TONES: Array<{ color: "danger" | "success" | "warning" | "info"; title: string; body: string }> = [
  { color: "danger", title: "Email and password don’t match", body: "Check them and try again or reset your password" },
  { color: "success", title: "Login successful", body: "You’re now signed in and ready to continue" },
  { color: "warning", title: "Action required", body: "Review this case before the deadline or it will be reassigned" },
  { color: "info", title: "System update available", body: "A new version is ready to install. Review the release notes before updating." },
];
const COLORS: ToastColor[] = ["neutral", "info", "success", "danger", "warning"];
const noop = () => {};

const meta: Meta<typeof Toast> = {
  title: "Components/Toast",
  component: Toast,
  parameters: {
    docs: {
      description: {
        component:
          "Tinted, bordered notification: 1px border in the status colour, radius 8, 8px padding, " +
          "the icon on a white tile, a 14px medium title over a 12px message. `variant` = Standard 390px floating card / Inline full-width, " +
          "`color` = Figma Color. Optional `title`, `action` (underlined link under the message), `secondaryAction` (after a “·”) and close button (`onClose`). Danger / warning use `role=\"alert\"`, " +
          "others `role=\"status\"`. Figma's stray `Variant=False, Color=Warning` is treated as Standard. " +
          "To fire transient toasts, wrap the app in `<Toaster>` and call `useToast().toast({ color, title, message, action, duration })`.",
      },
    },
  },
  args: { variant: "standard", color: "neutral", children: STANDARD_COPY },
  argTypes: {
    variant: { control: "inline-radio", options: ["standard", "inline"] },
    color: { control: "inline-radio", options: COLORS },
    title: { control: "text" },
    children: { control: "text", description: "Description." },
    action: { control: false },
    secondaryAction: { control: false },
    icon: { control: false },
  },
};
export default meta;

type Story = StoryObj<typeof Toast>;

export const Playground: Story = {
  args: { onClose: noop },
};

/** Danger, success, warning and info: title + message. */
export const Tones: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Stage column gap={16}>
      {TONES.map((f) => (
        <Toast key={f.color} color={f.color} title={f.title}>
          {f.body}
        </Toast>
      ))}
    </Stage>
  ),
};

/** Every Figma Variant × Color combination, exactly as designed (message only). */
export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Stage column gap={32}>
      {COLORS.map((c) => (
        <Section key={c} title={`Color=${c[0].toUpperCase()}${c.slice(1)}`} style={{ marginBottom: 0 }}>
          <Stage column gap={14}>
            <StateCell label="Variant=Standard">
              <Toast variant="standard" color={c}>{STANDARD_COPY}</Toast>
            </StateCell>
            <StateCell label="Variant=Inline">
              <Toast variant="inline" color={c}>{INLINE_COPY}</Toast>
            </StateCell>
          </Stage>
        </Section>
      ))}
    </Stage>
  ),
};

/** Optional slots: title, a main and a secondary action, and close button. */
export const WithTitleAndActions: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Stage column gap={16}>
      <Toast
        color="success"
        title="Amendment approved"
        action={{ label: "View", onClick: noop }}
        secondaryAction={{ label: "Learn more", onClick: noop }}
        onClose={noop}
      >
        The new data scope is active from today.
      </Toast>
      <Toast
        variant="inline"
        color="danger"
        action={{ label: "Retry", onClick: noop }}
        onClose={noop}
      >
        Could not save the amendment. Check your connection and try again.
      </Toast>
    </Stage>
  ),
};

function ToasterDemo() {
  const { toast, dismiss } = useToast();
  const n = useRef(0);
  return (
    <Stage gap={12}>
      <Button
        size="sm"
        variant="outline"
        onClick={() =>
          toast({ color: "success", title: "Amendment approved", message: "The new data scope is active from today.", action: { label: "View", onClick: noop } })
        }
      >
        Success
      </Button>
      <Button size="sm" variant="outline" onClick={() => toast({ color: "info", message: `Export queued — we'll email you when it's ready. (${++n.current})` })}>
        Info
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() =>
          toast({ color: "danger", message: "Could not save the amendment. Check your connection and try again.", action: { label: "Retry", onClick: noop } })
        }
      >
        Danger
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => {
          const id = toast({ color: "neutral", message: "Uploading 3 files…", duration: Infinity, dismissible: false });
          window.setTimeout(() => toast({ id, color: "success", message: "3 files uploaded.", duration: 4000, dismissible: true }), 2000);
        }}
      >
        Update in place
      </Button>
      <Button size="sm" variant="text" onClick={() => dismiss()}>
        Dismiss all
      </Button>
    </Stage>
  );
}

/**
 * Live stack: newest toast lands nearest the edge, max 3. Timers pause on hover, focus
 * and hidden tabs; F8 jumps to the stack, Escape dismisses, swipe on touch.
 */
export const Toaster_: StoryObj<{ placement: ToasterPlacement }> = {
  name: "Toaster",
  args: { placement: "bottom-right" },
  argTypes: { placement: { control: "inline-radio", options: ["bottom-right", "bottom-center", "top-right", "top-center"] } },
  parameters: { layout: "fullscreen" },
  render: ({ placement }) => (
    <Toaster placement={placement}>
      <div style={{ padding: 24, minHeight: "100vh", boxSizing: "border-box" }}>
        <ToasterDemo />
      </div>
    </Toaster>
  ),
};
