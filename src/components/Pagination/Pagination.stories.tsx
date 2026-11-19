import { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Pagination } from "./Pagination";
import type { PaginationProps } from "./Pagination";
import { Section, Stage, StateCell } from "../../storybook/StoryLayout";

const meta: Meta<typeof Pagination> = {
  title: "Components/Pagination",
  component: Pagination,
  parameters: {
    docs: {
      description: {
        component:
          "Rows-per-page pagination (Figma **Pagination / Rows Per Page**) inside a `<nav>` landmark — the only pagination pattern in the design system. " +
          "The rows selector is the design-system `Select` (Dropdown, XS) with a floating listbox, so it is not clipped by the table card. " +
          "**rowsPerPage** shows the page-size select and a “Page n of N” readout (Table Template 3, placed in the table card footer). " +
          "**arrows** pairs the select with previous / next icon buttons (Table Template 4, placed below the card); its page readout is announced to screen readers only.",
      },
    },
  },
  args: { variant: "rowsPerPage", page: 2, totalPages: 10, rowsPerPage: 10 },
  argTypes: {
    variant: { control: "inline-radio", options: ["rowsPerPage", "arrows"] },
    page: { control: { type: "number", min: 1 } },
    totalPages: { control: { type: "number", min: 1 } },
    rowsPerPage: { control: "select", options: [10, 25, 50, 100] },
  },
};
export default meta;

type Story = StoryObj<typeof Pagination>;

function Controlled(args: PaginationProps) {
  const [page, setPage] = useState(args.page);
  const [rows, setRows] = useState(args.rowsPerPage ?? 10);
  useEffect(() => setPage(args.page), [args.page]);
  useEffect(() => setRows(args.rowsPerPage ?? 10), [args.rowsPerPage]);
  return (
    <Pagination
      {...args}
      page={page}
      onPageChange={setPage}
      rowsPerPage={rows}
      onRowsPerPageChange={setRows}
    />
  );
}

export const Playground: Story = {
  render: (args) => <Controlled {...args} />,
};

/** Both layouts, plus the arrows' disabled ends. The rows selector is the design-system `Select` (XS). */
export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div>
      <Section title="Rows per page" description="Select + “Page n of N”. Used in the table card footer (Table Template 3).">
        <Stage gap={32}>
          <StateCell label="Default">
            <Controlled aria-label="Pagination, default" page={2} totalPages={10} />
          </StateCell>
        </Stage>
      </Section>
      <Section title="Arrows" description="Select + previous / next icon buttons. Used below the table card (Table Template 4).">
        <Stage gap={32}>
          <StateCell label="First page (previous disabled)">
            <Controlled aria-label="Pagination, arrows first" variant="arrows" page={1} totalPages={50} />
          </StateCell>
          <StateCell label="Middle page">
            <Controlled aria-label="Pagination, arrows middle" variant="arrows" page={12} totalPages={50} />
          </StateCell>
          <StateCell label="Last page (next disabled)">
            <Controlled aria-label="Pagination, arrows last" variant="arrows" page={50} totalPages={50} />
          </StateCell>
        </Stage>
      </Section>
    </div>
  ),
};
