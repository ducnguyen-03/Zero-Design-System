import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { OtpInput } from "./OtpInput";
import type { OtpInputSize, OtpInputVariant } from "./OtpInput";
import { Section, StateCell } from "../../storybook/StoryLayout";

const meta: Meta<typeof OtpInput> = {
  title: "Components/OtpInput",
  component: OtpInput,
  parameters: {
    docs: {
      description: {
        component:
          "One-time-code entry: N single-character slots (default 6, split 3 + 3 by a dash). Shares the `Input` field anatomy (label → helper → slots → error message) and slot styling: white fill, 1px grey-75 border, focus draws a 2px green-160 border, error a red-150 border with a red-300 message. Typing auto-advances, Backspace clears and steps back, arrows / Home / End move, and pasting a code (or SMS autofill via `autocomplete=\"one-time-code\"`) fills every slot. Variants: rounded, square, underline, pill; sizes lg (60px) / md (40px) / sm (32px).",
      },
    },
  },
  args: {
    label: "Verification code",
    helpText: "Enter the 6-digit code we emailed you.",
    length: 6,
    variant: "rounded",
    size: "lg",
    error: false,
    disabled: false,
    groupSize: 3,
    mode: "numeric",
    mask: false,
    defaultValue: "123",
  },
  argTypes: {
    variant: { control: "inline-radio", options: ["rounded", "square", "underline", "pill"] },
    size: { control: "inline-radio", options: ["lg", "md", "sm"] },
    mode: { control: "inline-radio", options: ["numeric", "alphanumeric"] },
    length: { control: { type: "number", min: 2, max: 10 } },
    groupSize: { control: { type: "number", min: 0, max: 6 } },
    label: { control: "text" },
    helpText: { control: "text" },
    errorText: { control: "text" },
    required: { control: "boolean" },
    error: { control: "boolean" },
    disabled: { control: "boolean" },
    mask: { control: "boolean" },
  },
};
export default meta;

type Story = StoryObj<typeof OtpInput>;

export const Playground: Story = {};

const variants: OtpInputVariant[] = ["rounded", "underline", "pill", "square"];
const sizes: OtpInputSize[] = ["lg", "md", "sm"];
const states = [
  { label: "Default", props: {} },
  { label: "Disabled", props: { disabled: true } },
  { label: "Error", props: { errorText: "That code is not valid" } },
] as const;

export const Variants: Story = {
  parameters: { controls: { disable: true }, layout: "padded" },
  render: () => (
    <div>
      {variants.map((v) => (
        <Section key={v} title={v[0].toUpperCase() + v.slice(1)}>
          <div style={{ display: "grid", gridTemplateColumns: "auto auto auto", gap: "20px 40px", alignItems: "end", justifyContent: "start" }}>
            {states.flatMap((s) =>
              sizes.map((sz) => (
                <StateCell key={`${s.label}-${sz}`} label={`${s.label} · ${sz}`}>
                  <OtpInput
                    aria-label={`${v} ${s.label} ${sz}`}
                    variant={v}
                    size={sz}
                    defaultValue={s.label === "Default" ? "123" : "123456"}
                    {...s.props}
                  />
                </StateCell>
              )),
            )}
          </div>
        </Section>
      ))}
    </div>
  ),
};

export const Verification: Story = {
  parameters: { controls: { disable: true } },
  render: function VerificationStory() {
    const [code, setCode] = useState("");
    const [status, setStatus] = useState<"idle" | "ok" | "bad">("idle");
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <OtpInput
          label="Verification code"
          helpText="Enter the 6-digit code we emailed you. (Try 424242.)"
          required
          size="md"
          value={code}
          errorText={status === "bad" ? "That code is not valid. Check the email and try again." : undefined}
          onChange={(v) => {
            setCode(v);
            setStatus("idle");
          }}
          onComplete={(v) => setStatus(v === "424242" ? "ok" : "bad")}
        />
        <span role="status" style={{ fontFamily: "var(--insight-font-family-sans)", fontSize: 14, color: "var(--insight-color-green-200)" }}>
          {status === "ok" ? "Code accepted" : ""}
        </span>
      </div>
    );
  },
};
