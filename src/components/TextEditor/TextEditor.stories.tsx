import type { Meta, StoryObj } from "@storybook/react-vite";
import { TextEditor, TextEditorToolbar } from "./TextEditor";
import { Stage, StateCell, Section } from "../../storybook/StoryLayout";

const OBJECTIVE =
  "<p>Identify actionable genomic alterations in circulating tumor DNA (ctDNA) to guide therapeutic decision-making following disease progression on second-line therapy. This analysis evaluates key biomarkers associated with treatment resistance and emerging therapeutic targets, enabling clinicians to tailor subsequent treatment strategies based on the patient's unique molecular profile.</p>";
const METHODOLOGY =
  "<ul><li>Extract cfDNA from peripheral blood sample</li><li>Perform hybrid capture-based targeted sequencing using Comprehensive Cancer Panel (PNL-0042)</li><li>Target sequencing depth: 500x for reliable variant detection</li><li>Analysis pipeline: somatic variant calling, CNV detection, MSI status</li></ul>";

const meta: Meta<typeof TextEditor> = {
  title: "Components/TextEditor",
  component: TextEditor,
  parameters: {
    docs: {
      description: {
        component:
          "Dependency-free rich-text editor: `TextEditorToolbar` above a `contentEditable` textbox, styled after the BioNexus LiquidDash editor. " +
          "Toolbar groups: **undo / redo** (greyed out when there is no history) · **bold / italic / underline / strikethrough** · " +
          "**text colour / highlight** · **bulleted / numbered list, indent / outdent**. Lucide icons at 16px in 28px tools on a grey-10 bar; " +
          "the editing area is 14px with 8/12px padding inside an 8px-radius frame. `required` adds the red asterisk to the 16px label. " +
          "**Add Evidence** → `addEvidence` appends the book action. The toolbar is a WAI-ARIA toolbar (one tab stop, arrow keys); toggles expose `aria-pressed`.",
      },
    },
  },
  args: {
    label: "Objective",
    required: true,
    placeholder: "Describe the objective…",
    addEvidence: false,
    disabled: false,
    hideLabel: false,
    defaultValue: OBJECTIVE,
  },
  argTypes: {
    onChange: { action: "change" },
    onAddEvidence: { action: "add-evidence" },
    requestLink: { control: false },
    requestColor: { control: false },
  },
  render: (args) => (
    <div style={{ width: 690 }}>
      <TextEditor {...args} />
    </div>
  ),
};
export default meta;

type Story = StoryObj<typeof TextEditor>;

export const Playground: Story = {};

/** The three fields from the BioNexus request form. */
export const Form: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ width: 690, display: "flex", flexDirection: "column", gap: 24 }}>
      <TextEditor label="Objective" required defaultValue={OBJECTIVE} />
      <TextEditor label="Methodology" required defaultValue={METHODOLOGY} minHeight={80} />
      <TextEditor label="Expected outcomes" required placeholder="List the expected outcomes…" minHeight={80} />
    </div>
  ),
};

export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Section title="Toolbar" description="The toolbar on its own. Undo / redo render at 50% until there is history to step through.">
      <Stage column gap={20} style={{ width: 690 }}>
        <StateCell label="Default (no history)">
          <TextEditorToolbar disabledCommands={new Set(["undo", "redo"])} />
        </StateCell>
        <StateCell label="Pressed tools (bold, bulleted list) + undo available">
          <TextEditorToolbar
            activeCommands={new Set(["bold", "insertUnorderedList"])}
            disabledCommands={new Set(["redo"])}
          />
        </StateCell>
        <StateCell label="Add Evidence = True">
          <TextEditorToolbar addEvidence onAddEvidence={() => {}} disabledCommands={new Set(["undo", "redo"])} />
        </StateCell>
        <StateCell label="Disabled">
          <TextEditorToolbar disabled />
        </StateCell>
      </Stage>
    </Section>
  ),
};

export const Empty: Story = {
  args: { defaultValue: "", label: "Expected outcomes" },
};
