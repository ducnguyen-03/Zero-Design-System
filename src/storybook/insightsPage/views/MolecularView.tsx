import { useId, useState } from "react";
import type { KeyboardEvent } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronRight as Crumb, Search, Settings } from "lucide-react";
import { Badge } from "../../../components/Badge/Badge";
import { Button } from "../../../components/Button/Button";
import { Chip } from "../../../components/Chip/Chip";
import { IconButton } from "../../../components/IconButton/IconButton";
import { Input } from "../../../components/Input/Input";
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "../../../components/Table/Table";
import { fmtNumber } from "../../../components/Charts";
import { ALTERATION_TABS, FREQUENCY_TABLES, FREQUENT_GENES, TOP_ALTERATIONS } from "./molecularData";
import type { AlterationRow, AlterationTab, FrequencyTable } from "./molecularData";
import { MolecularGeneDetail } from "./MolecularGeneDetail";
import styles from "./MolecularView.module.css";

const cx = (...parts: Array<string | false | undefined>) => parts.filter(Boolean).join(" ");

/** Molecular tab: gene-level overview, and the gene detail it drills into. */
export function MolecularView({ initialGene }: { initialGene?: string }): JSX.Element {
  const [gene, setGene] = useState<string | undefined>(initialGene);

  if (gene) return <MolecularGeneDetail gene={gene} onBack={() => setGene(undefined)} onOpenGene={setGene} />;
  return <MolecularOverview onOpenGene={setGene} />;
}

/* ─────────────────────────── Overview ─────────────────────────── */

function MolecularOverview({ onOpenGene }: { onOpenGene: (gene: string) => void }) {
  return (
    <div className={styles.page}>
      <div className={styles.tourBlock} data-tour="molecular">
        <GeneSearch onOpenGene={onOpenGene} />
        <FrequencyCard onOpenGene={onOpenGene} />
      </div>
      <TopAlterationsCard />
    </div>
  );
}

function GeneSearch({ onOpenGene }: { onOpenGene: (gene: string) => void }) {
  const [query, setQuery] = useState("");
  const headingId = useId();
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const q = query.trim().toUpperCase();
    if (e.key === "Enter" && q) onOpenGene(q);
  };
  return (
    <section className={styles.search} aria-labelledby={headingId}>
      <h2 id={headingId} className={styles.searchTitle}>
        You're viewing <span className={styles.accent}>all</span> gene level data
      </h2>
      <div className={styles.searchField}>
        <Input
          aria-label="Search a gene or variant name"
          placeholder="Search a gene or variant name"
          startIcon={<Search />}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
        />
      </div>
      <p className={styles.eyebrow}>Frequently searched</p>
      <ul className={styles.frequent}>
        {FREQUENT_GENES.map((g) => (
          <li key={g}>
            <button type="button" className={styles.chipButton} onClick={() => onOpenGene(g)}>
              <Chip variant="outline" size="sm" radius="soft">
                {g}
              </Chip>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ── Frequency of reportable alterations ── */

function FrequencyCard({ onOpenGene }: { onOpenGene: (gene: string) => void }) {
  const headingId = useId();
  return (
    <section className={styles.card} aria-labelledby={headingId}>
      <h2 id={headingId} className={styles.cardTitle}>
        Frequency of reportable alterations by type and gene
      </h2>
      <div className={styles.freqGrid}>
        {FREQUENCY_TABLES.map((t) => (
          <FrequencyMiniTable key={t.key} table={t} onOpenGene={onOpenGene} />
        ))}
      </div>
    </section>
  );
}

function FrequencyMiniTable({ table, onOpenGene }: { table: FrequencyTable; onOpenGene: (gene: string) => void }) {
  return (
    <div className={styles.mini}>
      <div className={styles.miniHead}>
        <span className={styles.miniTitle}>{table.title}</span>
        <span className={styles.countTag}>{table.countLabel}</span>
      </div>
      <div className={styles.miniScroll} tabIndex={0} aria-label={`${table.title}, scrollable`}>
        <Table caption={`${table.title} by number of samples`} captionHidden className={styles.miniTable}>
          <TableHead>
            <TableRow>
              <TableHeaderCell className={styles.miniTh}>{table.nameHeader}</TableHeaderCell>
              <TableHeaderCell className={styles.miniTh}># Samples</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {table.rows.map((r) => (
              <TableRow key={r.name}>
                <TableCell className={styles.miniTd}>
                  {table.linkable ? (
                    <button type="button" className={styles.geneLink} onClick={() => onOpenGene(r.name)}>
                      {r.name}
                    </button>
                  ) : (
                    <span className={styles.geneText}>{r.name}</span>
                  )}
                </TableCell>
                <TableCell className={styles.miniTd}>{fmtNumber(r.samples)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

/* ── Top reportable alterations ── */

const PAGE_SIZE = 10;

function TopAlterationsCard() {
  const headingId = useId();
  const tabsId = useId();
  const [tab, setTab] = useState<AlterationTab>("snv");
  const [page, setPage] = useState(1);
  const active = ALTERATION_TABS.find((t) => t.value === tab) ?? ALTERATION_TABS[0];
  const totalPages = Math.ceil(active.count / PAGE_SIZE);
  const from = (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, active.count);

  const select = (value: AlterationTab) => {
    setTab(value);
    setPage(1);
  };
  const onTabKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const i = ALTERATION_TABS.findIndex((t) => t.value === tab);
    const next = ALTERATION_TABS[(i + (e.key === "ArrowRight" ? 1 : ALTERATION_TABS.length - 1)) % ALTERATION_TABS.length];
    select(next.value);
    document.getElementById(`${tabsId}-${next.value}`)?.focus();
  };

  return (
    <section className={styles.card} aria-labelledby={headingId}>
      <h2 id={headingId} className={styles.cardTitleLg}>
        Top reportable alterations by type
      </h2>
      {/* DS Tabs labels are strings only; the Figma tabs carry a count pill, so the tablist is local. */}
      <div className={styles.altTabs} role="tablist" aria-label="Alteration type" onKeyDown={onTabKey}>
        {ALTERATION_TABS.map((t) => {
          const on = t.value === tab;
          return (
            <button
              key={t.value}
              id={`${tabsId}-${t.value}`}
              type="button"
              role="tab"
              aria-selected={on}
              aria-controls={`${tabsId}-panel`}
              tabIndex={on ? 0 : -1}
              className={cx(styles.altTab, on && styles.altTabOn)}
              onClick={() => select(t.value)}
            >
              {t.label}
              <span className={styles.altCount}>{fmtNumber(t.count)}</span>
            </button>
          );
        })}
      </div>
      <div id={`${tabsId}-panel`} role="tabpanel" aria-labelledby={`${tabsId}-${tab}`} className={styles.altPanel}>
        <div className={styles.altToolbar}>
          <span className={styles.altSummary}>
            {fmtNumber(from)} - {fmtNumber(to)} of {fmtNumber(active.count)} {active.noun}
          </span>
          <Button variant="subtle" size="sm" startIcon={<Settings />} endIcon={<ChevronDown />}>
            Manage Columns
          </Button>
        </div>
        <div className={styles.altTableCard}>
          <div className={styles.altScroll}>
            <Table caption={`Top ${active.noun}`} captionHidden className={styles.altTable}>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Biosample ID</TableHeaderCell>
                  <TableHeaderCell>Variant</TableHeaderCell>
                  <TableHeaderCell>Cohort</TableHeaderCell>
                  <TableHeaderCell>Cancer Category</TableHeaderCell>
                  <TableHeaderCell>Pathogenicity</TableHeaderCell>
                  <TableHeaderCell>DNA VAF</TableHeaderCell>
                  <TableHeaderCell align="center">Targetable</TableHeaderCell>
                  <TableHeaderCell>Comments</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {TOP_ALTERATIONS.map((r, i) => (
                  <AlterationTableRow key={`${r.biosample}-${i}`} row={r} />
                ))}
              </TableBody>
            </Table>
          </div>
          <div className={styles.altFooter}>
            <span aria-live="polite">
              {fmtNumber(from)}–{fmtNumber(to)} of {fmtNumber(active.count)}
            </span>
            <IconButton aria-label="Previous page" icon={<ChevronLeft />} disabled={page <= 1} onClick={() => setPage(page - 1)} />
            <IconButton aria-label="Next page" icon={<ChevronRight />} disabled={page >= totalPages} onClick={() => setPage(page + 1)} />
          </div>
        </div>
      </div>
    </section>
  );
}

const IMPACT_LABEL: Record<AlterationRow["impact"], string> = { L: "Low impact", M: "Moderate impact", N: "Null (loss of function)", F: "Frameshift" };

function AlterationTableRow({ row }: { row: AlterationRow }) {
  const [cat, type, subtype] = row.cancer;
  const tone = CATEGORY_TONE[cat];
  return (
    <TableRow>
      <TableCell className={cx(styles.altTd, styles.colId)} truncate title={row.biosample}>
        {row.biosample}
      </TableCell>
      <TableCell className={cx(styles.altTd, styles.colVariant)}>
        <span className={styles.variant}>
          <span className={styles.variantText} title={row.variant}>
            {row.variant}
          </span>
          <span className={cx(styles.impact, styles[`impact${row.impact}`])} title={IMPACT_LABEL[row.impact]}>
            {row.impact}
          </span>
        </span>
      </TableCell>
      <TableCell className={cx(styles.altTd, styles.nowrap)}>{row.cohort}</TableCell>
      <TableCell className={cx(styles.altTd, styles.nowrap)}>
        <span className={styles.crumbs}>
          {[cat, type, subtype].map((label, i) => (
            <span key={i} className={styles.crumb}>
              {i > 0 ? <Crumb className={styles.crumbSep} aria-hidden="true" /> : null}
              <span className={styles.square} style={{ background: tone[i] }} aria-hidden="true" />
              {label}
            </span>
          ))}
        </span>
      </TableCell>
      <TableCell className={styles.altTd}>
        <Badge variant={row.pathogenicity === "C5" ? "danger" : "warning"}>{row.pathogenicity}</Badge>
      </TableCell>
      <TableCell className={cx(styles.altTd, styles.nowrap)}>{row.vaf}</TableCell>
      <TableCell className={styles.altTd} align="center">
        {row.targetable ? "Yes" : "No"}
      </TableCell>
      <TableCell className={cx(styles.altTd, styles.nowrap)}>
        <Button variant="text" size="sm" endIcon={<ChevronRight />}>
          View Comment
        </Button>
      </TableCell>
    </TableRow>
  );
}

/** Category → [category, type, subtype] square colours (darkest to lightest). */
const CATEGORY_TONE: Record<AlterationRow["cancer"][0], [string, string, string]> = {
  Sarcoma: ["var(--insight-color-green-50)", "var(--insight-color-green-30)", "var(--insight-color-green-10)"],
  CNS: ["var(--insight-color-orange-100)", "var(--insight-color-orange-50)", "var(--insight-color-orange-30)"],
  HM: ["var(--insight-color-red-50)", "var(--insight-color-red-30)", "var(--insight-color-red-10)"],
  "Solid tumour": ["var(--insight-color-blue-50)", "var(--insight-color-blue-30)", "var(--insight-color-blue-10)"],
  Neuroblastoma: ["var(--insight-color-violet-50)", "var(--insight-color-violet-30)", "var(--insight-color-violet-10)"],
};
