import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Users,
  Dna,
  Folder,
  NotebookPen,
  FileClock,
  FileCheck,
  FileX,
  Pencil,
  X,
  MoreHorizontal,
} from "lucide-react";
import { StatTile } from "./StatTile";
import { Section, Stage, StateCell } from "../../storybook/StoryLayout";

const meta: Meta<typeof StatTile> = {
  title: "Components/StatTile",
  component: StatTile,
  parameters: {
    docs: {
      description: {
        component:
          "Headline numbers. `appearance=\"tile\"` (default) is the original landing Statistics tile. The Figma **Stats** set maps to `change` (Style 1: previous → current with a delta chip), `icon` (Style 2: round icon + value + label) and `summary` (Style 3: header actions + legend breakdown). `variant` (default / success / danger) colours the current value, delta chip and icon. Numerals always; use + for “or more”.",
      },
    },
  },
  args: {
    appearance: "tile",
    variant: "default",
    icon: <Users color="var(--insight-color-green-175)" />,
    value: "3,000",
    label: "Participants enrolled",
    previousValue: "3",
    delta: "+2",
  },
  argTypes: {
    appearance: { control: "inline-radio", options: ["tile", "change", "icon", "summary"] },
    variant: { control: "inline-radio", options: ["default", "success", "danger"] },
    value: { control: "text", description: "Headline numeral (e.g. 3,000 or 4M+)." },
    label: { control: "text" },
    previousValue: { control: "text", description: "`change` only." },
    delta: { control: "text", description: "`change` only." },
    icon: { control: false, description: "lucide icon." },
    annotation: { control: false },
    actions: { control: false },
    breakdown: { control: false },
  },
  render: (args) => (
    <div style={{ width: 280 }}>
      <StatTile {...args} />
    </div>
  ),
};
export default meta;

type Story = StoryObj<typeof StatTile>;

export const Playground: Story = {};

export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Stage gap={16}>
      <StateCell label="Default">
        <div style={{ width: 280 }}>
          <StatTile icon={<Users color="var(--insight-color-green-175)" />} value="3,000" label="Participants enrolled" />
        </div>
      </StateCell>
      <StateCell label="Abbreviated value">
        <div style={{ width: 280 }}>
          <StatTile icon={<Dna color="var(--insight-color-magenta-150)" />} value="4M+" label="Genomic variants" />
        </div>
      </StateCell>
      <StateCell label="Long label">
        <div style={{ width: 280 }}>
          <StatTile icon={<Folder color="var(--insight-color-blue-150)" />} value="60+" label="Cancer types & diagnostic categories" />
        </div>
      </StateCell>
    </Stage>
  ),
};

export const Grid: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 280px)", gap: 16 }}>
      <StatTile icon={<Users color="var(--insight-color-green-175)" />} value="3,000" label="Participants enrolled" />
      <StatTile icon={<Dna color="var(--insight-color-magenta-150)" />} value="4M+" label="Genomic variants" />
      <StatTile icon={<Folder color="var(--insight-color-blue-150)" />} value="60+" label="Cancer types & categories" />
      <StatTile icon={<NotebookPen color="var(--insight-color-orange-150)" />} value="120+" label="Curated studies" />
    </div>
  ),
};

const editCount = (
  <>
    <Pencil aria-hidden="true" />
    <span>
      1<span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}> edit</span>
    </span>
  </>
);

/** Figma Stats: Style 1 / 2 / 3 × Variant default / Success / Danger. */
export const FigmaStyles: Story = {
  name: "Figma styles",
  parameters: { controls: { disable: true } },
  render: () => (
    <div>
      <Section title="Style 1 — change" description="Previous value struck through → current value. Delta chip and value colour follow the variant.">
        <Stage gap={16}>
          <StateCell label="Default">
            <StatTile appearance="change" label="Approved personnel" previousValue="3" value="3" annotation={editCount} />
          </StateCell>
          <StateCell label="Success">
            <StatTile appearance="change" variant="success" label="Approved personnel" previousValue="3" value="5" delta="+2" />
          </StateCell>
          <StateCell label="Danger">
            <StatTile
              appearance="change"
              variant="danger"
              label="Approved personnel"
              previousValue="5"
              value="3"
              delta="-2"
              annotation={editCount}
            />
          </StateCell>
        </Stage>
      </Section>
      <Section title="Style 2 — icon">
        <Stage gap={16}>
          <StateCell label="Default">
            <div style={{ width: 280 }}>
              <StatTile appearance="icon" icon={<FileClock />} value="915" label="Total applicants" />
            </div>
          </StateCell>
          <StateCell label="Success">
            <div style={{ width: 280 }}>
              <StatTile appearance="icon" variant="success" icon={<FileCheck />} value="879" label="Approved" />
            </div>
          </StateCell>
          <StateCell label="Danger">
            <div style={{ width: 280 }}>
              <StatTile appearance="icon" variant="danger" icon={<FileX />} value="32" label="Rejected" />
            </div>
          </StateCell>
        </Stage>
      </Section>
      <Section title="Style 3 — summary" description="Only Variant=default exists in Figma.">
        <div style={{ width: 260 }}>
          <StatTile
            appearance="summary"
            label="Total participants"
            value="4,500"
            actions={
              <>
                <button type="button" aria-label="Dismiss">
                  <X aria-hidden="true" />
                </button>
                <button type="button" aria-label="More options">
                  <MoreHorizontal aria-hidden="true" />
                </button>
              </>
            }
            breakdown={[
              { label: "294 Published", tone: "success" },
              { label: "621 Unpublished", tone: "hatched" },
            ]}
          />
        </div>
      </Section>
    </div>
  ),
};
