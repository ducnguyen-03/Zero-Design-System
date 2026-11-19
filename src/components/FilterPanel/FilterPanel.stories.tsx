import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent } from "storybook/test";
import { Book, Dna, FlaskConical, Hospital, Microscope, Network, User } from "lucide-react";
import { FilterGroupLabel, FilterPanel, FilterRail, FilterSection, FilterViewSwitch, RAIL_ICON } from "./FilterPanel";
import type { FilterMatch, FilterOption, FilterStat } from "./FilterPanel";
import { GeneFilter, RangeFilter, VariantSearchFilter, emptyRange } from "./MolecularFilters";
import type { GeneOption, RangeValue } from "./MolecularFilters";
import { CancerCategoryFilter } from "./CancerCategoryTree";
import type { CancerCategoryNode, CancerCategoryView } from "./CancerCategoryTree";

/* ── Figma sample data. Counts are Figma placeholders; top-level participant
 *    counts are set so the tree map reproduces Figma's tile proportions. ── */

const opts = (...labels: string[]): FilterOption[] =>
  labels.map((label) => ({ value: label.toLowerCase().replace(/[^a-z0-9]+/g, "-"), label, count: 1234 }));

const AGE = opts(
  "Infant (0-2)",
  "Child, Preschool (3-5)",
  "Child (6-12)",
  "Adolescent (13-19)",
  "Young Adult (20-25)",
  "Adult (26+)",
);

interface SectionSpec {
  key: string;
  title: string;
  options: FilterOption[];
}

const DOMAINS: Record<string, SectionSpec[]> = {
  study: [
    { key: "cohort", title: "Cohort", options: opts("Cohort 1: High-risk cancers", "Cohort 2: Rare tumours", "Cohort 8: Sarcomas") },
    { key: "study", title: "Study", options: opts("Cohort B Rare Cancers", "PRISM", "ZERO2") },
  ],
  participant: [
    { key: "sex", title: "Sex", options: opts("Female", "Male", "Unknown") },
    { key: "vital", title: "Vital Status", options: opts("Alive", "Deceased") },
    { key: "ageDx", title: "Age at Diagnosis", options: AGE },
    { key: "ageSample", title: "Age at Sample", options: AGE },
  ],
  sample: [
    { key: "tissue", title: "Tissue Type", options: opts("Normal", "Tumour") },
    {
      key: "strategy",
      title: "Experimental Strategy",
      options: opts(
        "WGS",
        "RNASeq",
        "Methylation",
        "Targeted Sequencing (TDS)",
        "High-Throughput Drug Screening (HTS)",
        "Proteomics",
      ),
    },
    { key: "event", title: "Event", options: opts("Diagnosis", "Relapse", "Progression") },
  ],
};

const c = (participants: number, samples: number, pdx: number) => ({ participants, samples, pdx });

const CATEGORIES: CancerCategoryNode[] = [
  {
    id: "cns", label: "CNS", color: "#ffae2f", counts: c(185, 100, 0),
    children: [
      { id: "cns-pnst", label: "Peripheral nerve sheath tumour", counts: c(30, 18, 20), children: [
        { id: "cns-hb", label: "Hepatoblastoma/HCC", counts: c(15, 2, 12) },
        { id: "cns-sub2", label: "Sub Category 2", counts: c(15, 9, 8) },
      ] },
      { id: "cns-rcc", label: "Renal cell carcinoma", counts: c(100, 54, 0), children: [
        { id: "cns-mb", label: "Medulloblastoma", counts: c(60, 21, 60) },
        { id: "cns-es", label: "Ewing sarcoma", counts: c(40, 92, 20) },
      ] },
      { id: "cns-kidney", label: "Kidney tumour", counts: c(28, 76, 21), children: [
        { id: "cns-wt", label: "WT", counts: c(28, 2, 21) },
      ] },
    ],
  },
  { id: "hm", label: "HM", color: "#eb6e6e", counts: c(185, 0, 0), subcategoryCount: 4 },
  { id: "neuroblastoma", label: "Neuroblastoma", color: "#b58ade", counts: c(89, 0, 200), subcategoryCount: 2 },
  {
    id: "solid", label: "Solid Tumour", color: "#54a4ff", counts: c(336, 121, 121),
    children: [
      { id: "solid-pnst", label: "Peripheral nerve sheath tumour", counts: c(30, 11, 0), children: [
        { id: "solid-hb", label: "Hepatoblastoma/HCC", counts: c(15, 32, 12) },
        { id: "solid-act", label: "Adrenal cortical tumour", counts: c(15, 1, 8) },
      ] },
      { id: "solid-rcc", label: "Renal cell carcinoma", counts: c(100, 31, 80), children: [
        { id: "solid-mb", label: "Medulloblastoma", counts: c(60, 54, 60) },
        { id: "solid-es", label: "Ewing sarcoma", counts: c(40, 35, 20) },
      ] },
      { id: "solid-kidney", label: "Kidney tumour", counts: c(28, 78, 0), children: [
        { id: "solid-wt", label: "WT", counts: c(28, 80, 21) },
      ] },
    ],
  },
  {
    id: "sarcoma", label: "Sarcoma", color: "#52d292", counts: c(264, 100, 0),
    children: [
      { id: "sarc-other", label: "Sarcoma other", counts: c(30, 18, 20), children: [
        { id: "sarc-rt", label: "Rhabdoid tumour", counts: c(15, 2, 12) },
        { id: "sarc-gist", label: "GIST", counts: c(15, 9, 8) },
        { id: "sarc-syn", label: "Synovial Sarcoma", counts: c(60, 21, 60) },
        { id: "sarc-dsrct", label: "Desmoplastic small round cell tumour", counts: c(40, 92, 20) },
        { id: "sarc-angio", label: "Angiosarcoma", counts: c(60, 21, 60) },
        { id: "sarc-fibro", label: "Fibroblastic and myofibroblastic tumour", counts: c(40, 92, 20) },
      ] },
      { id: "sarc-bone", label: "Bone tumours", counts: c(28, 76, 21), children: [
        { id: "sarc-ost", label: "OST", counts: c(28, 2, 21) },
      ] },
    ],
  },
];

const TABS = [
  { value: "cancer", label: "Cancer category", icon: <Network {...RAIL_ICON} /> },
  { value: "study", label: "Study", icon: <Book {...RAIL_ICON} /> },
  { value: "participant", label: "Participant", icon: <User {...RAIL_ICON} /> },
  { value: "sample", label: "Sample", icon: <Microscope {...RAIL_ICON} /> },
  { value: "clinical", label: "Clinical", icon: <Hospital {...RAIL_ICON} /> },
  { value: "molecular", label: "Molecular", icon: <Dna {...RAIL_ICON} /> },
];

/* ── Molecular (Figma Insights UI › Molecular filters 12641:53880) ─────── */

const people = (value: number): FilterStat => ({ icon: <User />, value, label: "participants" });
const samples = (value: number): FilterStat => ({ icon: <FlaskConical />, value, label: "samples" });
const variants = (value: number): FilterStat => ({ icon: <Dna />, value, label: "variants" });
const slug = (l: string) => l.toLowerCase().replace(/[^a-z0-9]+/g, "-");
const withStats = (rows: Array<[string, ...FilterStat[]]>): FilterOption[] =>
  rows.map(([label, ...stats]) => ({ value: slug(label), label, stats }));

const GENES: GeneOption[] = [
  "NRAD1", "NRADDP", "NRAL", "NRAP", "NRARP", "NRAS", "NR0B1", "NR1D1", "NR1D2", "NR1H2", "NR1H3",
  "TP53", "BRAF", "KRAS", "EGFR", "ALK", "MYCN", "PIK3CA", "PTEN", "NF1",
].map((symbol) => ({ symbol, participants: 279 }));

interface MolecularChecklist {
  key: string;
  title: string;
  options: FilterOption[];
  totalStats: FilterStat[];
  visibleCount?: number;
  searchable?: boolean;
}

const VARIANT_TYPE: MolecularChecklist = {
  key: "variantType",
  title: "Variant Type",
  searchable: false,
  visibleCount: 7,
  totalStats: [people(398), samples(1358)],
  options: withStats([
    ["SNV", people(391), samples(1302)],
    ["CNV", people(377), samples(1214)],
    ["SV", people(352), samples(1046)],
    ["Fusion", people(118), samples(297)],
    ["Indel", people(346), samples(1091)],
    ["RNA Expression", people(301), samples(734)],
    ["MNV", people(84), samples(212)],
    ["Insertion", people(66), samples(150)],
    ["Deletion", people(71), samples(168)],
    ["Complex", people(19), samples(40)],
  ]),
};

const CHROMOSOME: MolecularChecklist = {
  key: "chromosome",
  title: "Chromosome",
  visibleCount: 9,
  totalStats: [variants(8642)],
  options: withStats([
    ["1", variants(742)], ["2", variants(701)], ["3", variants(556)], ["4", variants(519)],
    ["5", variants(498)], ["6", variants(471)], ["X", variants(312)], ["Y", variants(21)],
    ...Array.from({ length: 16 }, (_, i): [string, FilterStat] => [String(i + 7), variants(440 - i * 22)]),
  ]),
};

const ZYGOSITY: MolecularChecklist = {
  key: "zygosity",
  title: "Zygosity",
  totalStats: [variants(8642)],
  options: withStats([["Heterozygous", variants(6915)], ["Homozygous", variants(1284)], ["Hemizygous", variants(443)]]),
};

const CLASSIFICATION: MolecularChecklist[] = [
  {
    key: "clinvar",
    title: "ClinVar",
    visibleCount: 8,
    totalStats: [variants(8642)],
    options: withStats([
      ["Pathogenic", variants(214)],
      ["Likely pathogenic", variants(367)],
      ["Uncertain significance", variants(2941)],
      ["Likely benign", variants(1386)],
      ["Benign", variants(2203)],
      ["Conflicting classifications of pathogenicity", variants(488)],
    ]),
  },
  {
    key: "gnomad",
    title: "Gnomad",
    totalStats: [variants(8642)],
    options: withStats([
      ["Absent from gnomAD", variants(3108)],
      ["Ultra-rare (<0.01%)", variants(1962)],
      ["Rare (0.01–0.1%)", variants(1247)],
      ["Low frequency (0.1–1%)", variants(1093)],
      ["Common (>1%)", variants(1232)],
    ]),
  },
  {
    key: "vep",
    title: "VEP",
    totalStats: [variants(8642)],
    options: withStats([
      ["MODIFIER", variants(5371)],
      ["LOW", variants(1478)],
      ["MODERATE", variants(1406)],
      ["HIGH", variants(387)],
    ]),
  },
];

const MOLECULAR_KEYS = ["gene", "variantType", "variant", "zscore", "chromosome", "copyNumber", "zygosity", "clinvar", "gnomad", "vep"];
const MOLECULAR_CHECKLISTS = [VARIANT_TYPE, CHROMOSOME, ZYGOSITY, ...CLASSIFICATION];

interface MolecularState {
  genes: string[];
  variant: string;
  zscore: RangeValue;
  copyNumber: RangeValue;
}
const emptyMolecular = (): MolecularState => ({ genes: [], variant: "", zscore: emptyRange(), copyNumber: emptyRange() });
const rangeSet = (r: RangeValue) => r.min !== "" || r.max !== "";

/* ── Wired-up drawer: rail + side panel ─────────────────────────────── */

type Selection = Record<string, string[]>;

interface DrawerProps {
  initialDomain: string | null;
  initialSelection?: Selection;
  initialCollapsed?: string[];
  initialCategory?: string | null;
  initialView?: CancerCategoryView;
  initialMolecular?: Partial<MolecularState>;
  /** Section key → match mode; shows the "Match:" select on checklist sections. */
  initialMatch?: Record<string, FilterMatch>;
}

function FilterDrawer({
  initialDomain,
  initialSelection = {},
  initialCollapsed = [],
  initialCategory = null,
  initialView = "list",
  initialMolecular = {},
  initialMatch,
}: DrawerProps) {
  // Conditional match per section (Insights-UI 7289:46590); only shown when the story passes `initialMatch`.
  const [match, setMatch] = useState<Record<string, FilterMatch> | undefined>(initialMatch);
  const [domain, setDomain] = useState<string | null>(initialDomain);
  const [selection, setSelection] = useState<Selection>(initialSelection);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set(initialCollapsed));
  const [category, setCategory] = useState<string | null>(initialCategory);
  const [view, setView] = useState<CancerCategoryView>(initialView);
  const [molecular, setMolecular] = useState<MolecularState>({ ...emptyMolecular(), ...initialMolecular });

  const sectionsOf = (d: string): Array<{ key: string }> =>
    d === "molecular" ? MOLECULAR_KEYS.map((key) => ({ key })) : DOMAINS[d] ?? [];
  const appliedIn = (d: string) =>
    d === "cancer"
      ? category != null
      : d === "molecular"
        ? molecular.genes.length > 0 ||
          molecular.variant.trim() !== "" ||
          rangeSet(molecular.zscore) ||
          rangeSet(molecular.copyNumber) ||
          MOLECULAR_CHECKLISTS.some((c) => (selection[c.key] ?? []).length > 0)
        : sectionsOf(d).some((s) => (selection[s.key] ?? []).length > 0);
  const isOpen = (key: string) => !collapsed.has(key);
  const setOpen = (key: string) => (open: boolean) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (open) next.delete(key);
      else next.add(key);
      return next;
    });
  const anyApplied = TABS.some((t) => appliedIn(t.value));
  const tab = TABS.find((t) => t.value === domain);
  const sections = domain ? sectionsOf(domain) : [];
  const allCollapsed = sections.length > 0 && sections.every((s) => collapsed.has(s.key));

  const resetDomain = (d: string) => {
    if (d === "cancer") setCategory(null);
    if (d === "molecular") setMolecular(emptyMolecular());
    setSelection((sel) => {
      const next = { ...sel };
      for (const s of sectionsOf(d)) delete next[s.key];
      return next;
    });
  };

  const checklist = (c: MolecularChecklist) => (
    <FilterSection
      key={c.key}
      title={c.title}
      options={c.options}
      totalStats={c.totalStats}
      visibleCount={c.visibleCount}
      searchable={c.searchable}
      value={selection[c.key] ?? []}
      onChange={(v) => setSelection((sel) => ({ ...sel, [c.key]: v }))}
      expanded={isOpen(c.key)}
      onExpandedChange={setOpen(c.key)}
    />
  );
  const variantTypes = selection.variantType ?? [];
  const typeLabel = (v: string) => VARIANT_TYPE.options.find((o) => o.value === v)?.label ?? v;

  return (
    <div style={{ display: "flex", justifyContent: "flex-end", height: "100vh", minHeight: 640, background: "var(--insight-color-grey-10)" }}>
      {domain && tab ? (
        <FilterPanel
          id="filter-panel"
          title={tab.label}
          width={domain === "cancer" ? (view === "treemap" ? 1106 : 480) : domain === "molecular" ? 440 : 380}
          accessoryAlign={view === "treemap" ? "end" : "start"}
          accessory={
            domain === "cancer" ? (
              <FilterViewSwitch
                aria-label="Cancer category view"
                stretch={view === "list"}
                value={view}
                onChange={setView}
                options={[
                  { value: "treemap", label: "Tree map view" },
                  { value: "list", label: "List view" },
                ]}
              />
            ) : undefined
          }
          onReset={() => resetDomain(domain)}
          resetDisabled={!appliedIn(domain)}
          onToggleAll={
            sections.length > 0
              ? () => setCollapsed(allCollapsed ? new Set() : new Set(sections.map((s) => s.key)))
              : undefined
          }
          allCollapsed={allCollapsed}
          onClose={() => setDomain(null)}
        >
          {domain === "cancer" ? (
            <CancerCategoryFilter categories={CATEGORIES} value={category} onChange={setCategory} view={view} />
          ) : domain === "molecular" ? (
            <>
              <GeneFilter
                genes={GENES}
                value={molecular.genes}
                onChange={(genes) => setMolecular((m) => ({ ...m, genes }))}
                expanded={isOpen("gene")}
                onExpandedChange={setOpen("gene")}
                onChooseGeneList={() => undefined}
              />
              {checklist(VARIANT_TYPE)}
              <VariantSearchFilter
                value={molecular.variant}
                onChange={(variant) => setMolecular((m) => ({ ...m, variant }))}
                scope={variantTypes.map(typeLabel)}
                expanded={isOpen("variant")}
                onExpandedChange={setOpen("variant")}
              />
              <RangeFilter
                title="Z-Score Range"
                value={molecular.zscore}
                onChange={(zscore) => setMolecular((m) => ({ ...m, zscore }))}
                expanded={isOpen("zscore")}
                onExpandedChange={setOpen("zscore")}
                disabledReason={
                  variantTypes.includes("rna-expression")
                    ? undefined
                    : "Select RNA Expression under Variant Type to filter by z-score."
                }
              />
              {checklist(CHROMOSOME)}
              <RangeFilter
                title="Copy Number"
                value={molecular.copyNumber}
                onChange={(copyNumber) => setMolecular((m) => ({ ...m, copyNumber }))}
                expanded={isOpen("copyNumber")}
                onExpandedChange={setOpen("copyNumber")}
              />
              {checklist(ZYGOSITY)}
              <FilterGroupLabel>Variant classification</FilterGroupLabel>
              {CLASSIFICATION.map(checklist)}
            </>
          ) : sections.length > 0 ? (
            (DOMAINS[domain] ?? []).map((s) => (
              <FilterSection
                key={s.key}
                title={s.title}
                options={s.options}
                totalCount={2468}
                value={selection[s.key] ?? []}
                onChange={(v) => setSelection((sel) => ({ ...sel, [s.key]: v }))}
                match={match ? (match[s.key] ?? "any") : undefined}
                onMatchChange={match ? (m) => setMatch((prev) => ({ ...prev, [s.key]: m })) : undefined}
                expanded={!collapsed.has(s.key)}
                onExpandedChange={(open) =>
                  setCollapsed((prev) => {
                    const next = new Set(prev);
                    if (open) next.delete(s.key);
                    else next.add(s.key);
                    return next;
                  })
                }
              />
            ))
          ) : (
            <p style={{ margin: 0, padding: 16, fontFamily: "var(--insight-font-family-sans)", color: "var(--insight-color-grey-100)" }}>
              No {tab.label.toLowerCase()} filters are configured yet.
            </p>
          )}
        </FilterPanel>
      ) : null}
      <FilterRail
        tabs={TABS.map((t) => ({ ...t, applied: appliedIn(t.value) }))}
        value={domain}
        onChange={setDomain}
        panelId="filter-panel"
        onClearAll={() => {
          setSelection({});
          setCategory(null);
          setMolecular(emptyMolecular());
        }}
        clearAllDisabled={!anyApplied}
      />
    </div>
  );
}

const meta: Meta<typeof FilterDrawer> = {
  title: "Components/FilterPanel",
  component: FilterDrawer,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Right-hand filter drawer (Figma *Insights dev-ready file* › Hand off section 4291:6515). A vertical **FilterRail** lists the filter domains; opening one slides a **FilterPanel** in beside it. Domains are made of collapsible **FilterSection**s — a `CheckboxRow` checklist with counts, an applied-count pill, per-section clear and search, and an *N more* overflow. The Cancer category domain uses **CancerCategoryFilter** in two views — *List* (colour-coded hierarchy with participant / sample / PDX counts) and *Tree map* (squarified tiles that drill into subcategories) — sharing one search and a removable selected-category path. The rail marks domains with applied filters with a green dot, and *Clear all* is disabled until something is applied.",
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof FilterDrawer>;

/** Figma Variant=Study. */
export const Study: Story = { args: { initialDomain: "study" } };

/** Conditional filters (Insights-UI 7289:46590): each section chooses whether rows match *Any of* or *None of* the ticked options. */
export const StudyMatch: Story = {
  name: "Study · match any / none",
  args: { initialDomain: "study", initialMatch: { cohort: "any", study: "none" } },
  play: async ({ canvas }) => {
    const study = canvas.getByRole("combobox", { name: "Study: match" });
    await expect(study).toHaveValue("none");
    await userEvent.selectOptions(study, "any");
    await expect(study).toHaveValue("any");
  },
};

/** Figma Variant=Participant: "Age at Diagnosis" collapsed with 2 applied, "Age at Sample" open with 2 checked. */
export const Participant: Story = {
  args: {
    initialDomain: "participant",
    initialSelection: { ageDx: ["infant-0-2", "child-6-12"], ageSample: ["infant-0-2", "child-6-12"] },
    initialCollapsed: ["ageDx"],
  },
};

/** Figma Variant=Sample: overflow ("1 more") on Experimental Strategy, "Event" collapsed with 2 applied. */
export const Sample: Story = {
  args: {
    initialDomain: "sample",
    initialSelection: { event: ["diagnosis", "relapse"] },
    initialCollapsed: ["event"],
  },
};

/** Figma Variant=Cancer Categories: Solid Tumour › Peripheral nerve sheath tumour › Adrenal cortical tumour selected. */
export const CancerCategory: Story = {
  args: { initialDomain: "cancer", initialCategory: "solid-act" },
};

/** Figma "Cancer category- show tree map": squarified tiles; click a tile to drill into its subcategories. */
export const CancerCategoryTreeMap: Story = {
  args: { initialDomain: "cancer", initialView: "treemap" },
};

/** Figma "Filter panel / Molecular" (440px): gene search, variant type, variant search,
 *  z-score / copy-number ranges and the variant-classification checklists. */
export const Molecular: Story = { args: { initialDomain: "molecular" } };

/** Molecular with filters applied: RNA Expression enables Z-Score, genes chosen. */
export const MolecularApplied: Story = {
  args: {
    initialDomain: "molecular",
    initialSelection: { variantType: ["rna-expression"] },
    initialMolecular: { genes: ["TP53", "NRADDP", "NRAS"] },
  },
};

/** Figma collapsed overview — every Molecular section closed. */
export const MolecularCollapsed: Story = {
  args: { initialDomain: "molecular", initialCollapsed: MOLECULAR_KEYS },
};

/** Rail only — panel closed, nothing applied ("Clear all" disabled). */
export const RailOnly: Story = { args: { initialDomain: null } };
