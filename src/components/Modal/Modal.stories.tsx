import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Modal, ModalFooter, ConfirmModal } from "./Modal";
import type { ModalProps, ModalSize } from "./Modal";
import { Button } from "../Button/Button";
import { Section, Stage, StateCell } from "../../storybook/StoryLayout";
import styles from "./Modal.module.css";

const PLACEHOLDER = (
  <div className={styles.placeholder}>
    Detach the component to customise content. Once detached you can still change the header
    and footer components via the right sidebar. Control the modal’s size via the header comp.
  </div>
);

const FULL_FOOTER = (
  <ModalFooter
    criticalAction={{ label: "Critical" }}
    secondaryAction={{ label: "Secondary" }}
    primaryAction={{ label: "Primary" }}
  />
);

type PlaygroundArgs = Omit<ModalProps, "open" | "onClose" | "footer"> & {
  criticalAction: boolean;
  secondaryAction: boolean;
  primaryAction: boolean;
  footerDivider: boolean;
};

function ModalDemo({ criticalAction, secondaryAction, primaryAction, footerDivider, ...args }: PlaygroundArgs) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Open modal
      </Button>
      <Modal
        {...args}
        open={open}
        onClose={close}
        footer={
          <ModalFooter
            divider={footerDivider}
            criticalAction={criticalAction ? { label: "Critical", onClick: close } : undefined}
            secondaryAction={secondaryAction ? { label: "Secondary", onClick: close } : undefined}
            primaryAction={primaryAction ? { label: "Primary", onClick: close } : undefined}
          />
        }
      />
    </>
  );
}

const meta: Meta<PlaygroundArgs> = {
  title: "Components/Modal",
  component: Modal as unknown as Meta<PlaygroundArgs>["component"],
  parameters: {
    docs: {
      description: {
        component:
          "Dialog overlay portalled to `document.body`. `role=\"dialog\"` + `aria-modal`, labelled by its title; focus moves into the dialog on open, is trapped while open (Tab / Shift+Tab cycle) and is restored to the trigger on close. Escape and backdrop click call `onClose`. Sizes XS 428 / Small 800 / Medium 1000 / Large 1200. Header shows a close button (hidden on XS by default, per Figma). Footer is a slot, usually `<ModalFooter>` with critical (red outline), secondary (subtle) and primary (bold yellow) actions plus an optional divider. `ConfirmModal` presets the Delete and Discard-changes templates. The Figma “modal / variants” set is product-specific and intentionally not built.",
      },
    },
  },
  args: {
    title: "Title",
    size: "sm",
    children: PLACEHOLDER,
    criticalAction: true,
    secondaryAction: true,
    primaryAction: true,
    footerDivider: false,
    closeOnBackdropClick: true,
    closeOnEscape: true,
  },
  argTypes: {
    size: { control: "inline-radio", options: ["xs", "sm", "md", "lg"] satisfies ModalSize[] },
    title: { control: "text" },
    children: { control: false },
    showCloseButton: { control: "boolean", description: "Defaults to true except for xs." },
    initialFocusRef: { control: false },
    inline: { table: { disable: true } },
  },
  render: (args) => <ModalDemo {...args} />,
};
export default meta;

type Story = StoryObj<PlaygroundArgs>;

export const Playground: Story = {};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ background: "var(--insight-color-background-subtle)", padding: 32 }}>
      {(["xs", "sm", "md", "lg"] as ModalSize[]).map((size) => (
        <Section
          key={size}
          title={`Size = ${size}`}
          description={
            size === "xs"
              ? "428px. No header close button by default."
              : size === "sm"
                ? "800px, content height."
                : size === "md"
                  ? "1000px, max 720px tall — body scrolls."
                  : "1200px, max 900px tall — body scrolls."
          }
        >
          <Modal inline open onClose={() => {}} title="Title" size={size} footer={FULL_FOOTER}>
            {PLACEHOLDER}
          </Modal>
        </Section>
      ))}
    </div>
  ),
};

export const FooterVariants: Story = {
  name: "Footer variants",
  parameters: { controls: { disable: true } },
  render: () => {
    const combos = [
      { c: true, s: true, p: true },
      { c: true, s: false, p: true },
      { c: true, s: true, p: false },
      { c: false, s: true, p: true },
    ];
    return (
      <div style={{ background: "var(--insight-color-background-subtle)", padding: 24 }}>
        <Stage column gap={16}>
          {[false, true].flatMap((divider) =>
            combos.map(({ c, s, p }) => (
              <StateCell
                key={`${divider}-${c}-${s}-${p}`}
                label={`Critical=${c} · Secondary=${s} · Primary=${p} · Divider=${divider}`}
              >
                <div style={{ width: 800, background: "var(--insight-color-white)", borderRadius: 16 }}>
                  <ModalFooter
                    divider={divider}
                    criticalAction={c ? { label: "Critical" } : undefined}
                    secondaryAction={s ? { label: "Secondary" } : undefined}
                    primaryAction={p ? { label: "Primary" } : undefined}
                  />
                </div>
              </StateCell>
            )),
          )}
        </Stage>
      </div>
    );
  },
};

export const HeaderVariants: Story = {
  name: "Header variants",
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ background: "var(--insight-color-background-subtle)", padding: 24 }}>
      <Stage column gap={16}>
        {[true, false].map((close) => (
          <StateCell key={String(close)} label={`Close Button=${close}`}>
            <div style={{ width: 800 }}>
              <Modal inline open onClose={() => {}} title="Title" size="sm" showCloseButton={close} />
            </div>
          </StateCell>
        ))}
      </Stage>
    </div>
  ),
};

export const Templates: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ background: "var(--insight-color-background-subtle)", padding: 32 }}>
      <Stage gap={32}>
        <StateCell label="Type = Delete">
          <div style={{ width: 428 }}>
            <ConfirmModal inline type="delete" label="{label}" open onClose={() => {}} onConfirm={() => {}} />
          </div>
        </StateCell>
        <StateCell label="Type = Discard Changes">
          <div style={{ width: 428 }}>
            <ConfirmModal inline type="discard" open onClose={() => {}} onConfirm={() => {}} />
          </div>
        </StateCell>
      </Stage>
    </div>
  ),
};

function ConfirmDemo() {
  const [open, setOpen] = useState<null | "delete" | "discard">(null);
  const close = () => setOpen(null);
  return (
    <Stage gap={16}>
      <Button variant="warning" onClick={() => setOpen("delete")}>
        Delete report
      </Button>
      <Button variant="subtle" onClick={() => setOpen("discard")}>
        Leave editor
      </Button>
      <ConfirmModal type="delete" label="report" open={open === "delete"} onClose={close} onConfirm={close} />
      <ConfirmModal type="discard" open={open === "discard"} onClose={close} onConfirm={close} />
    </Stage>
  );
}

export const ConfirmInteractive: Story = {
  name: "ConfirmModal (interactive)",
  parameters: { controls: { disable: true } },
  render: () => <ConfirmDemo />,
};
