import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { FileUpload } from "./FileUpload";
import type { FileUploadProps, FileUploadSize } from "./FileUpload";
import { Stage, StateCell, Section, Forced } from "../../storybook/StoryLayout";

const meta: Meta<typeof FileUpload> = {
  title: "Components/FileUpload",
  component: FileUpload,
  parameters: {
    docs: {
      description: {
        component:
          "Drag-and-drop zone with click-to-browse (Figma `file upload` 3412:11033). The zone is a real button that " +
          "opens a hidden `input[type=file]`; files can also be dropped on it. Sizes Small 40 / Medium 48 (inline " +
          "row), Large 116 (stacked) and Fill (borderless, fills its parent). Label → helper → zone → error message; " +
          "selected files are listed below with remove buttons.",
      },
    },
  },
  args: {
    label: "Label",
    helpText: "This is helper text.",
    size: "lg",
    multiple: true,
  },
  argTypes: {
    label: { control: "text" },
    helpText: { control: "text" },
    hint: { control: "text" },
    errorText: { control: "text" },
    size: { control: "inline-radio", options: ["sm", "md", "lg", "fill"] },
    accept: { control: "text" },
    multiple: { control: "boolean" },
    disabled: { control: "boolean" },
    required: { control: "boolean" },
    showFileList: { control: "boolean" },
  },
  render: (args) => (
    <div style={{ width: 400, height: args.size === "fill" ? 400 : undefined }}>
      <FileUpload {...args} />
    </div>
  ),
};
export default meta;

type Story = StoryObj<typeof FileUpload>;

export const Playground: Story = {};

const SIZES: Array<{ size: FileUploadSize; name: string }> = [
  { size: "sm", name: "Small" },
  { size: "md", name: "Medium" },
  { size: "lg", name: "Large" },
];

const cell = (p: FileUploadProps) => (
  <div style={{ width: 320 }}>
    <FileUpload {...p} />
  </div>
);

export const Variants: Story = {
  name: "Size × Label × Helper × Error",
  parameters: { controls: { disable: true } },
  render: () => (
    <>
      {SIZES.map(({ size, name }) => (
        <Section key={size} title={`Size = ${name}`}>
          <Stage gap={32}>
            <StateCell label="Label + helper">
              {cell({ size, label: "Label", helpText: "This is helper text." })}
            </StateCell>
            <StateCell label="Label">{cell({ size, label: "Label" })}</StateCell>
            <StateCell label="No label">{cell({ size })}</StateCell>
            <StateCell label="Error · label + helper">
              {cell({
                size,
                label: "Label",
                helpText: "This is helper text.",
                errorText: "Error message",
              })}
            </StateCell>
            <StateCell label="Error · label">
              {cell({ size, label: "Label", errorText: "Error message" })}
            </StateCell>
            <StateCell label="Error · no label">
              {cell({ size, errorText: "Error message" })}
            </StateCell>
          </Stage>
        </Section>
      ))}
      <Section title="Size = Fill">
        <Stage gap={32}>
          <StateCell label="Default">
            <div style={{ width: 360, height: 360 }}>
              <FileUpload size="fill" />
            </div>
          </StateCell>
          <StateCell label="Error">
            <div style={{ width: 360, height: 360 }}>
              <FileUpload size="fill" errorText="Error message" />
            </div>
          </StateCell>
        </Stage>
      </Section>
    </>
  ),
};

export const Interaction: Story = {
  name: "States (hover / focus / disabled)",
  parameters: { controls: { disable: true } },
  render: () => (
    <Stage gap={32}>
      <StateCell label="Hover">
        <Forced state="hover">{cell({ size: "lg", label: "Label" })}</Forced>
      </StateCell>
      <StateCell label="Focus">
        <Forced state="focus">{cell({ size: "lg", label: "Label" })}</Forced>
      </StateCell>
      <StateCell label="Disabled">{cell({ size: "lg", label: "Label", disabled: true })}</StateCell>
    </Stage>
  ),
};

const sample = (name: string, kb: number) =>
  new File([new Uint8Array(kb * 1024)], name, { type: "application/octet-stream" });

export const WithFiles: Story = {
  name: "Selected files",
  parameters: { controls: { disable: true } },
  render: () =>
    cell({
      size: "md",
      label: "Supporting documents",
      helpText: "VCF or PDF, up to 50 MB each.",
      multiple: true,
      accept: ".vcf,.pdf",
      defaultFiles: [sample("cohort-a.vcf", 820), sample("consent-form.pdf", 146)],
    }),
};

/** `hint` adds a small line inside stacked zones (`lg`, `fill`), e.g. accepted formats and size. */
export const WithHint: Story = {
  name: "In-zone hint",
  parameters: { controls: { disable: true } },
  render: () =>
    cell({
      size: "lg",
      label: "Upload any supporting documents for this project",
      helpText: "These could be preliminary data, graphs or published papers.",
      hint: "PDF or DOCX · Max 10MB",
      accept: ".pdf,.docx",
      multiple: true,
    }),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("PDF or DOCX · Max 10MB")).toBeVisible();
    await expect(canvas.getByRole("button", { name: /Upload any supporting documents/ })).toHaveAccessibleDescription(
      /PDF or DOCX · Max 10MB/,
    );
  },
};
