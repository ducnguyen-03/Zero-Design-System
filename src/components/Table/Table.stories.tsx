import { useMemo, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ChevronDown, Download, ExternalLink, Settings } from "lucide-react";
import {
  Table,
  TableAddButton,
  TableAvatar,
  TableBadge,
  TableBody,
  TableCell,
  TableCheckbox,
  TableContainer,
  TableCount,
  TableDropdown,
  TableHead,
  TableHeaderCell,
  TableRow,
  TableRowMenu,
  TableToolbar,
} from "./Table";
import type { SortDirection } from "./Table";
import { Pagination } from "../Pagination/Pagination";
import { Avatar, AvatarGroup, AvatarStatus } from "../Avatar/Avatar";
import { StatusBadge } from "../Badge/Badge";
import { Button } from "../Button/Button";
import { Input } from "../Input/Input";
import { Section, Stage, StateCell, pseudo } from "../../storybook/StoryLayout";

const meta: Meta<typeof Table> = {
  title: "Components/Table",
  component: Table,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Data table from the Figma **Table Template** / Table V3 (3593:11439) and the **table-block** cell foundations. " +
          "Wrap a semantic `<Table>` in `TableContainer` for the white card (support-grey border, 8px radius), an optional " +
          "`TableToolbar` above (search · result count · actions) and a pagination `footer` inside the card (or `after` it). " +
          "Headers are 32px, 11.2px medium uppercase with vertical dividers; body cells are 14px with 16/8px padding. " +
          "Cell helpers — `TableCheckbox`, `TableRowMenu`, `TableBadge`, `TableCount`, `TableDropdown`, `TableAddButton`, " +
          "`TableAvatar` — cover each Figma cell type; any ReactNode works too.",
      },
    },
  },
  args: { caption: "Data access applications", captionHidden: true, fullWidth: true },
};
export default meta;

type Story = StoryObj<typeof Table>;

/* ------------------------------------------------------------------ */
/* Template 1 — Data access applications                               */
/* ------------------------------------------------------------------ */

type AppRow = {
  id: string;
  title: string;
  applicants: Array<{ name: string; signed?: boolean }>;
  extra: number;
  type: string;
  applied: string;
  assigned: { name: string; color: "violet-dark" | "grey" | "purple-dark" | "yellow-light" };
  updated: string;
  status: { label: string; variant: "success" | "danger" };
};

const LONG =
  "Genomic and clinical data for paediatric neuroblastoma patients who have a TP53 somatic mutation, including whole-genome sequencing data and associated de-identified clinical outcomes from the ZERO Childhood Cancer dataset.";

const APPS: AppRow[] = [
  { id: "APP-2026-00423", title: LONG, applicants: [{ name: "Marie Wong" }, { name: "Paul Brown" }], extra: 3, type: "EGA", applied: "11/12/2025", assigned: { name: "Kim Tran", color: "violet-dark" }, updated: "20 minutes ago", status: { label: "Ready for final review", variant: "success" } },
  { id: "APP-2026-00424", title: LONG, applicants: [{ name: "Marie Wong", signed: true }, { name: "Paul Brown", signed: true }], extra: 3, type: "Sample", applied: "11/12/2025", assigned: { name: "Paul Brown", color: "grey" }, updated: "1 hour ago", status: { label: "Ready for final review", variant: "success" } },
  { id: "APP-2026-00425", title: "I would like to request genomic information related to neuroblastoma patients.", applicants: [{ name: "Marie Wong", signed: true }, { name: "Paul Brown", signed: true }], extra: 3, type: "Data", applied: "11/12/2025", assigned: { name: "Jamie Jones", color: "purple-dark" }, updated: "3 days ago", status: { label: "Ready for final review", variant: "success" } },
  { id: "APP-2026-00426", title: "Can you provide genomic data for patients diagnosed with neuroblastoma?", applicants: [{ name: "Ana Diaz", signed: true }, { name: "Paul Brown", signed: true }], extra: 0, type: "EGA", applied: "11/12/2025", assigned: { name: "Kate Moss", color: "yellow-light" }, updated: "02/02/2026", status: { label: "Approved", variant: "success" } },
  { id: "APP-2026-00427", title: "Can you provide genomic data for patients diagnosed with neuroblastoma?", applicants: [{ name: "Ana Diaz", signed: true }, { name: "Paul Brown", signed: true }], extra: 0, type: "EGA", applied: "11/12/2025", assigned: { name: "Kate Moss", color: "yellow-light" }, updated: "02/02/2026", status: { label: "Rejected", variant: "danger" } },
];

function ApplicationsTable(args: Story["args"]) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const all = selected.size === APPS.length;
  const some = selected.size > 0 && !all;
  const toggle = (id: string) =>
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  return (
    <TableContainer>
      <Table {...args}>
        <TableHead>
          <TableRow>
            <TableHeaderCell style={{ width: 150 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <TableCheckbox
                  aria-label="Select all applications"
                  checked={all}
                  indeterminate={some}
                  onChange={() => setSelected(all ? new Set() : new Set(APPS.map((a) => a.id)))}
                />
                Application ID
              </span>
            </TableHeaderCell>
            <TableHeaderCell style={{ minWidth: 260 }}>Query title</TableHeaderCell>
            <TableHeaderCell style={{ minWidth: 120 }}>Applicants</TableHeaderCell>
            <TableHeaderCell style={{ width: 110 }}>Type</TableHeaderCell>
            <TableHeaderCell style={{ width: 110 }}>Applied on</TableHeaderCell>
            <TableHeaderCell style={{ minWidth: 80 }}>Assigned</TableHeaderCell>
            <TableHeaderCell style={{ width: 120 }}>Last updated</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {APPS.map((a) => (
            <TableRow key={a.id} selected={selected.has(a.id)}>
              <TableCell>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8, whiteSpace: "nowrap" }}>
                  <TableCheckbox aria-label={`Select ${a.id}`} checked={selected.has(a.id)} onChange={() => toggle(a.id)} />
                  {a.id}
                </span>
              </TableCell>
              <TableCell clamp={3}>{a.title}</TableCell>
              <TableCell>
                <AvatarGroup size="sm" max={3} aria-label={`Applicants for ${a.id}`}>
                  {a.applicants.map((p, i) => (
                    <Avatar
                      key={p.name}
                      name={p.name}
                      src={i === 0 ? "/figma/avatar/curator.jpg" : undefined}
                      color={i === 0 ? undefined : "yellow-light"}
                      status={p.signed ? <AvatarStatus status="done" label="Signed" /> : undefined}
                    />
                  ))}
                  {Array.from({ length: a.extra }, (_, i) => (
                    <Avatar key={`x${i}`} name={`Collaborator ${i + 1}`} />
                  ))}
                </AvatarGroup>
              </TableCell>
              <TableCell>
                <TableBadge appearance="label">{a.type}</TableBadge>
              </TableCell>
              <TableCell tone="secondary">{a.applied}</TableCell>
              <TableCell>
                <Avatar size="sm" name={a.assigned.name} color={a.assigned.color} />
              </TableCell>
              <TableCell tone="secondary" style={{ whiteSpace: "nowrap" }}>
                {a.updated}
              </TableCell>
              <TableCell align="end">
                <span style={{ display: "inline-flex", alignItems: "center", gap: 12 }}>
                  <StatusBadge variant={a.status.variant}>{a.status.label}</StatusBadge>
                  <TableRowMenu aria-label={`Actions for ${a.id}`} />
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

/** Figma Table Template 1: selection checkboxes, clamped query titles, avatar groups, status + row menu. */
export const Applications: Story = {
  name: "Template · Applications",
  render: (args) => <ApplicationsTable {...args} />,
};

/* ------------------------------------------------------------------ */
/* Template 3 — Genes (grouped header, toolbar, rows-per-page footer)  */
/* ------------------------------------------------------------------ */

/** Mutation-class swatches. Figma uses one-off data-viz hexes; mapped to the nearest ramp tokens. */
const MUTATIONS = [
  { key: "M", label: "Missense", color: "var(--insight-color-blue-150)" },
  { key: "FR", label: "Frameshift", color: "var(--insight-color-red-200)" },
  { key: "N", label: "Nonsense", color: "var(--insight-color-orange-200)" },
  { key: "PI", label: "Protein-altering indel", color: "var(--insight-color-grey-100)" },
  { key: "PR", label: "Promoter", color: "var(--insight-color-orange-300)" },
  { key: "S", label: "Splice", color: "var(--insight-color-violet-150)" },
  { key: "SR", label: "Splice region", color: "var(--insight-color-purple-100)" },
] as const;

const tag = (color: string): CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: 22,
  height: 20,
  padding: "0 6px",
  boxSizing: "border-box",
  borderRadius: 4,
  background: color,
  color: "var(--insight-color-white)",
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: "0.24px",
  lineHeight: 1.3,
});

const GENES: Array<{ gene: string; counts: Array<number | null> }> = [
  { gene: "TP53", counts: [500, 20, 20, 300, 1, 2, 20] },
  { gene: "NRAS", counts: [10, 300, 20, null, 110, null, null] },
  { gene: "TP53", counts: [1, 300, 20, null, 110, null, null] },
  { gene: "TP53", counts: [null, 300, 2, null, 110, null, null] },
  { gene: "TP53", counts: [null, 10, 234, null, 345, 2, null] },
];

function GenesTable(args: Story["args"]) {
  const [page, setPage] = useState(2);
  const [rows, setRows] = useState(10);
  return (
    <TableContainer
      toolbar={
        <TableToolbar
          search={<Input aria-label="Search gene" placeholder="Search Gene" size="sm" />}
          summary="1 - 20 of 400 Genes"
          actions={
            <Button variant="subtle" size="sm" startIcon={<Settings />} endIcon={<ChevronDown />}>
              Manage Columns
            </Button>
          }
        />
      }
      footer={
        <Pagination
          variant="rowsPerPage"
          aria-label="Genes pagination"
          page={page}
          totalPages={10}
          onPageChange={setPage}
          rowsPerPage={rows}
          onRowsPerPageChange={setRows}
        />
      }
    >
      <Table {...args} caption="Top mutated genes">
        <TableHead>
          <TableRow>
            <TableHeaderCell rowSpan={2} style={{ width: 100 }}>Gene</TableHeaderCell>
            <TableHeaderCell rowSpan={2} style={{ width: 205 }}>Role</TableHeaderCell>
            <TableHeaderCell rowSpan={2} style={{ width: 165 }}>% of cohort altered</TableHeaderCell>
            <TableHeaderCell colSpan={MUTATIONS.length} align="center" scope="colgroup">
              Point mutations (SNVs + indels)
            </TableHeaderCell>
          </TableRow>
          <TableRow>
            {MUTATIONS.map((m) => (
              <TableHeaderCell key={m.key} align="center" title={m.label} aria-label={m.label}>
                <span style={tag(m.color)}>{m.key}</span>
              </TableHeaderCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {GENES.map((g, i) => (
            <TableRow key={i}>
              <TableCell style={{ fontWeight: 500 }}>{g.gene}</TableCell>
              <TableCell>Tumour suppressor</TableCell>
              <TableCell style={{ whiteSpace: "nowrap" }}>
                <span style={{ fontWeight: 500, color: "var(--insight-color-off-black-200)" }}>19.3%</span>{" "}
                <span style={{ color: "var(--insight-color-grey-100)" }}>(712/4,500)</span>
              </TableCell>
              {g.counts.map((c, j) => (
                <TableCell key={j} align="center">
                  {c == null ? "-" : <span style={tag(MUTATIONS[j].color)}>{c}</span>}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

/** Figma Table Template 3: toolbar, two-tier grouped header and the rows-per-page footer inside the card. */
export const Genes: Story = {
  name: "Template · Grouped header + rows per page",
  render: (args) => <GenesTable {...args} />,
};

/* ------------------------------------------------------------------ */
/* Template 4 — Somatic SVs (arrows pagination below the card)         */
/* ------------------------------------------------------------------ */

const SVS = [
  { variant: "PDGFRB", kind: "Disruption", fusion: "PDGFRB(ENST00000261799) : Exon 15" },
  { variant: "TP53 :: GIMAP8", kind: "Del", fusion: "TP53(ENST00000261799) : Exon 15" },
  { variant: "TP53 :: GIMAP8", kind: "BND", fusion: "TP53(ENST00000297268) : Exon 22\nGIMAP8(ENST00000304636) : Exon 4" },
  { variant: "PAPPA :: TP53", kind: "Del", fusion: "PAPPA(ENST00000297268) : Exon 22\nTP53(ENST00000304636) : Exon 4" },
  { variant: "GCGR :: TP53", kind: "Ins", fusion: "GCGR(ENST00000297268) : Exon 22\nTP53(ENST00000304636) : Exon 4" },
];

function SvTable(args: Story["args"]) {
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState(10);
  return (
    <TableContainer
      toolbar={
        <TableToolbar
          summary="1-10 of 500 somatic SVs"
          actions={
            <Button variant="subtle" size="sm" startIcon={<Download />} endIcon={<ChevronDown />}>
              Export/Manage Columns
            </Button>
          }
        />
      }
      after={
        <Pagination
          variant="arrows"
          aria-label="Somatic SV pagination"
          page={page}
          totalPages={50}
          onPageChange={setPage}
          rowsPerPage={rows}
          onRowsPerPageChange={setRows}
        />
      }
    >
      <Table {...args} caption="Somatic structural variants">
        <TableHead>
          <TableRow>
            <TableHeaderCell>Biosample ID</TableHeaderCell>
            <TableHeaderCell style={{ minWidth: 250 }}>Variant</TableHeaderCell>
            <TableHeaderCell style={{ minWidth: 300 }}>Fusion</TableHeaderCell>
            <TableHeaderCell>Cohort</TableHeaderCell>
            <TableHeaderCell>Pathogenicity</TableHeaderCell>
            <TableHeaderCell>Targetable</TableHeaderCell>
            <TableHeaderCell>Comments</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {SVS.map((r, i) => (
            <TableRow key={i}>
              <TableCell style={{ whiteSpace: "nowrap" }}>06-0381_481878_T_W</TableCell>
              <TableCell>
                <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                  <span style={{ fontWeight: 500 }}>{r.variant}</span>
                  <span style={tag("var(--insight-color-grey-100)")}>{r.kind.toUpperCase()}</span>
                </span>
              </TableCell>
              <TableCell style={{ whiteSpace: "pre-line" }}>{r.fusion}</TableCell>
              <TableCell style={{ whiteSpace: "nowrap" }}>Cohort 2 : Rare tumours</TableCell>
              <TableCell>
                <StatusBadge variant="danger">C5</StatusBadge>
              </TableCell>
              <TableCell>Yes</TableCell>
              <TableCell>
                <a
                  href="#zerodash"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: 12,
                    textDecoration: "none",
                    color: "var(--insight-color-green-200)",
                    whiteSpace: "nowrap",
                  }}
                >
                  View in ZeroDash <ExternalLink size={16} aria-hidden="true" />
                </a>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

/** Figma Table Template 4: summary + export action above; rows-per-page and arrow buttons below the card. */
export const SomaticSVs: Story = {
  name: "Template · Arrows pagination",
  render: (args) => <SvTable {...args} />,
};

/* ------------------------------------------------------------------ */
/* Sortable playground (cell foundations)                              */
/* ------------------------------------------------------------------ */

type Row = { id: number; name: string; study: string; tier: string; score: number };
const ROWS: Row[] = [
  { id: 1, name: "Alex Chen", study: "Paediatric sarcoma cohort", tier: "Tier 1", score: 2.0 },
  { id: 2, name: "Priya Nair", study: "Neuroblastoma WGS", tier: "Tier 2", score: 4.5 },
  { id: 3, name: "Sam O'Neil", study: "Leukaemia relapse panel", tier: "Tier 1", score: 3.2 },
  { id: 4, name: "Maria Lopez", study: "CNS tumour methylation", tier: "Tier 3", score: 1.1 },
];

function SortableDemo(args: Story["args"]) {
  const [sort, setSort] = useState<{ key: keyof Row; dir: SortDirection }>({
    key: "name",
    dir: "ascending",
  });
  const rows = useMemo(() => {
    const r = [...ROWS];
    if (sort.dir === "none") return r;
    r.sort((a, b) => {
      const av = a[sort.key];
      const bv = b[sort.key];
      const c = av < bv ? -1 : av > bv ? 1 : 0;
      return sort.dir === "ascending" ? c : -c;
    });
    return r;
  }, [sort]);
  const toggle = (key: keyof Row) =>
    setSort((s) => ({
      key,
      dir: s.key !== key ? "ascending" : s.dir === "ascending" ? "descending" : "ascending",
    }));
  const dirFor = (key: keyof Row): SortDirection => (sort.key === key ? sort.dir : "none");

  return (
    <TableContainer>
      <Table {...args} caption="Approved datasets">
        <TableHead>
          <TableRow>
            <TableHeaderCell sortable sortDirection={dirFor("name")} onSort={() => toggle("name")}>
              Researcher
            </TableHeaderCell>
            <TableHeaderCell sortable sortDirection={dirFor("study")} onSort={() => toggle("study")}>
              Study
            </TableHeaderCell>
            <TableHeaderCell>Tier</TableHeaderCell>
            <TableHeaderCell sortable sortDirection={dirFor("score")} onSort={() => toggle("score")}>
              Score
            </TableHeaderCell>
            <TableHeaderCell>Curation</TableHeaderCell>
            <TableHeaderCell onAdd={() => undefined} addLabel="Add column">
              Actions
            </TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.id}>
              <TableCell>
                <span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
                  <TableAvatar name={r.name} />
                  {r.name}
                </span>
              </TableCell>
              <TableCell truncate>{r.study}</TableCell>
              <TableCell>
                <TableBadge>{r.tier}</TableBadge>
              </TableCell>
              <TableCell>
                <TableCount>{r.score.toFixed(1)}</TableCount>
              </TableCell>
              <TableCell>
                <TableDropdown
                  aria-label={`Curation class for ${r.name}`}
                  options={[
                    { value: "pathogenic", label: "Pathogenic" },
                    { value: "likely", label: "Likely pathogenic" },
                    { value: "vus", label: "VUS" },
                  ]}
                />
              </TableCell>
              <TableCell>
                <TableAddButton aria-label={`Add ${r.name} to cohort`} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

/** Sortable headers (aria-sort) and every cell-foundation renderer in one table. */
export const Playground: Story = {
  render: (args) => <SortableDemo {...args} />,
};

/** Single-cell table so each Figma Data Cell can be shown in isolation. */
function One({ header, children, hover }: { header?: boolean; children: ReactNode; hover?: boolean }) {
  return (
    <Table fullWidth={false} aria-label="Sample cell">
      {header ? (
        <TableHead>
          <TableRow>{children}</TableRow>
        </TableHead>
      ) : (
        <TableBody>
          <TableRow className={hover ? pseudo.hover : undefined}>{children}</TableRow>
        </TableBody>
      )}
    </Table>
  );
}

const CELLS: { label: string; render: () => ReactNode }[] = [
  { label: "Text", render: () => <TableCell>Info goes here</TableCell> },
  {
    label: "Badge",
    render: () => (
      <TableCell>
        <TableBadge>badge text</TableBadge>
      </TableCell>
    ),
  },
  {
    label: "Badge Number",
    render: () => (
      <TableCell>
        <TableCount>2.0</TableCount>
      </TableCell>
    ),
  },
  {
    label: "Dropdown",
    render: () => (
      <TableCell>
        <TableDropdown aria-label="Class" options={[{ value: "a", label: "Option A" }]} />
      </TableCell>
    ),
  },
  {
    label: "Add Button",
    render: () => (
      <TableCell>
        <TableAddButton aria-label="Add" />
      </TableCell>
    ),
  },
  {
    label: "Avatar",
    render: () => (
      <TableCell>
        <TableAvatar name="Jo Smith" />
      </TableCell>
    ),
  },
];

/** Every Figma Data Cell × State (default / hover). Hover is forced with pseudo-states. */
export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div>
      <Section title="Header" description="Sortable headers reveal the sort toggle on hover; the + affordance is optional (onAdd).">
        <Stage gap={32} align="flex-start">
          <StateCell label="Default">
            <One header>
              <TableHeaderCell sortable onAdd={() => undefined}>header</TableHeaderCell>
            </One>
          </StateCell>
          <StateCell label="Hover">
            <One header>
              <TableHeaderCell sortable onAdd={() => undefined} className={pseudo.hover}>
                header
              </TableHeaderCell>
            </One>
          </StateCell>
          <StateCell label="Sorted ascending">
            <One header>
              <TableHeaderCell sortable sortDirection="ascending">header</TableHeaderCell>
            </One>
          </StateCell>
        </Stage>
      </Section>
      {CELLS.map((c) => (
        <Section key={c.label} title={c.label}>
          <Stage gap={32} align="flex-start">
            <StateCell label="Default">
              <One>{c.render()}</One>
            </StateCell>
            <StateCell label="Hover">
              <One hover>{c.render()}</One>
            </StateCell>
          </Stage>
        </Section>
      ))}
    </div>
  ),
};
