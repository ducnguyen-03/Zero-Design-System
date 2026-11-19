import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { Section, Stage, StateCell } from "../../storybook/StoryLayout";
import { ChatAttachment, ChatAttachmentList } from "./ChatAttachment";

const meta: Meta<typeof ChatAttachment> = {
  title: "AI/Chat Attachment",
  component: ChatAttachment,
  parameters: {
    docs: {
      description: {
        component:
          "A file or data source attached to a prompt or a message. Not drawn in the ZAK prototype, so it is assembled from its parts: " +
          "**md** — the white 12px-radius card with a grey-30 border (stage cards) and a 34px icon tile; **sm** — the grey-30 pill of the composer's \"ZERO cohort\" source chip. " +
          "The icon follows the file extension (document, spreadsheet, image, code, genomic data). `uploading` shows a spinner, percentage and a 2px green bar; " +
          "`error` turns the frame red and states the reason. Group them with `ChatAttachmentList`.",
      },
    },
  },
  args: { name: "AML-cohort-export.csv", meta: "CSV · 24 KB", status: "ready", size: "md" },
  argTypes: {
    status: { control: "inline-radio", options: ["ready", "uploading", "error"] },
    size: { control: "inline-radio", options: ["md", "sm"] },
    kind: { control: "select", options: [undefined, "document", "spreadsheet", "image", "code", "data", "file"] },
    progress: { control: { type: "range", min: 0, max: 100 } },
    onRemove: { action: "remove" },
  },
};
export default meta;

type Story = StoryObj<typeof ChatAttachment>;

export const Playground: Story = {};

export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div>
      <Section title="Card (md)" description="Icon by file type.">
        <Stage gap={16}>
          <ChatAttachment name="Tumour-board-note.pdf" meta="PDF · 312 KB" onRemove={() => {}} />
          <ChatAttachment name="AML-cohort-export.csv" meta="CSV · 24 KB" onRemove={() => {}} />
          <ChatAttachment name="ZC-0418.vcf" meta="VCF · 1.2 MB" onRemove={() => {}} />
          <ChatAttachment name="survival-model.py" meta="Python · 4 KB" onRemove={() => {}} />
          <ChatAttachment name="Kaplan-Meier.png" meta="PNG · 88 KB" onRemove={() => {}} />
        </Stage>
      </Section>
      <Section title="States">
        <Stage gap={16}>
          <StateCell label="Ready">
            <ChatAttachment name="AML-cohort-export.csv" meta="CSV · 24 KB" onRemove={() => {}} />
          </StateCell>
          <StateCell label="Uploading">
            <ChatAttachment name="ZC-0418.bam" status="uploading" progress={42} onRemove={() => {}} />
          </StateCell>
          <StateCell label="Error">
            <ChatAttachment
              name="outcomes-2019.xlsx"
              status="error"
              error="Larger than 25 MB — split the file"
              onRemove={() => {}}
            />
          </StateCell>
          <StateCell label="Read-only (in a sent message)">
            <ChatAttachment name="Tumour-board-note.pdf" meta="PDF · 312 KB" />
          </StateCell>
        </Stage>
      </Section>
      <Section title="Pill (sm)" description="Compact form for sources and for attachments inside a sent message.">
        <Stage gap={12}>
          <ChatAttachment size="sm" name="ZERO cohort" kind="data" />
          <ChatAttachment size="sm" name="AML-cohort-export.csv" onRemove={() => {}} />
          <ChatAttachment size="sm" name="ZC-0418.bam" status="uploading" />
          <ChatAttachment size="sm" name="outcomes-2019.xlsx" status="error" error="Upload failed" onRemove={() => {}} />
        </Stage>
      </Section>
    </div>
  ),
};

function RemovableList() {
  const [files, setFiles] = useState(["Tumour-board-note.pdf", "AML-cohort-export.csv", "ZC-0418.vcf"]);
  return (
    <ChatAttachmentList>
      {files.map((f) => (
        <ChatAttachment key={f} name={f} meta="Attached" onRemove={() => setFiles(files.filter((x) => x !== f))} />
      ))}
    </ChatAttachmentList>
  );
}

export const List: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ width: 640 }}>
      <RemovableList />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getAllByRole("listitem")).toHaveLength(3);
    await userEvent.click(c.getByRole("button", { name: "Remove ZC-0418.vcf" }));
    await expect(c.getAllByRole("listitem")).toHaveLength(2);
  },
};
