import { useEffect, useRef, useState } from "react";
import { ArrowRight, Search, Settings } from "lucide-react";
import { Button } from "../../../components/Button/Button";
import { Checkbox } from "../../../components/Checkbox/Checkbox";
import { Input } from "../../../components/Input/Input";
import { Pagination } from "../../../components/Pagination/Pagination";
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "../../../components/Table/Table";
import { fmtNumber } from "../../../components/Charts";
import {
  ALTERATIONS,
  COHORT_SIZE,
  GENE_CONTEXT,
  GENE_ROWS,
  GENE_STATS,
  POINT_MUTATIONS,
  TOP_ALTERED_GENES,
} from "./geneData";
import type { GeneStat } from "./geneData";
import styles from "./GeneView.module.css";

type Column = "role" | "altered" | "mutations";

const COLUMNS: Array<{ id: Column; label: string }> = [
  { id: "role", label: "Role" },
  { id: "altered", label: "% of cohort altered" },
  { id: "mutations", label: "Point mutations (SNVs + indels)" },
];

/** Gene tab — headline stats, top-10 alteration frequency, gene table (Figma Insights-UI 7282:77274). */
export function GeneView({ onOpenGene }: { onOpenGene?: (gene: string) => void }) {
  return (
    <div className={styles.page}>
      <h2 className={styles.heading}>
        You’re viewing gene level data for <span className={styles.context}>{GENE_CONTEXT}</span> cancer category
      </h2>
      <div className={styles.stats}>
        {GENE_STATS.map((stat) => (
          <StatCard key={stat.id} stat={stat} onOpenGene={onOpenGene} />
        ))}
      </div>
      <FrequencyCard />
      <GeneTable />
    </div>
  );
}

function StatCard({ stat, onOpenGene }: { stat: GeneStat; onOpenGene?: (gene: string) => void }) {
  return (
    <section className={styles.stat} aria-label={stat.label}>
      <h3 className={styles.statLabel}>{stat.label}</h3>
      <p className={styles.statValue}>
        {stat.value}
        {stat.unit ? <span className={styles.statUnit}> {stat.unit}</span> : null}
      </p>
      {stat.id === "dominant" ? (
        <p className={styles.statNote}>
          <span className={styles.swatch} style={{ background: ALTERATIONS[0].color }} aria-hidden="true" />
          {stat.note}
        </p>
      ) : stat.id === "top" ? (
        <button type="button" className={styles.explore} onClick={() => onOpenGene?.(stat.value)}>
          Explore {stat.value}
          <ArrowRight aria-hidden="true" />
        </button>
      ) : stat.note ? (
        <p className={styles.statNote}>{stat.note}</p>
      ) : null}
    </section>
  );
}

function Legend() {
  return (
    <ul className={styles.legend} aria-label="Alteration types">
      {ALTERATIONS.map((a) => (
        <li key={a.id}>
          <span className={styles.swatch} style={{ background: a.color }} aria-hidden="true" />
          {a.label}
        </li>
      ))}
    </ul>
  );
}

function FrequencyCard() {
  const max = Math.max(...TOP_ALTERED_GENES.map((g) => g.pct));
  return (
    <section className={styles.card} aria-labelledby="gene-frequency-title">
      <div className={styles.cardHead}>
        <h3 id="gene-frequency-title" className={styles.cardTitle}>
          Mutation frequency of top 10 altered genes
        </h3>
        <Legend />
      </div>
      <ul className={styles.bars}>
        {TOP_ALTERED_GENES.map((g) => {
          const parts = ALTERATIONS.filter((a) => g.split[a.id] > 0);
          const summary = parts.map((a) => `${a.label} ${g.split[a.id]}%`).join(", ");
          return (
            <li key={g.gene} className={styles.barRow} aria-label={`${g.gene}: ${g.pct}% of participants (${summary})`}>
              <span className={styles.barGene} aria-hidden="true">
                {g.gene}
              </span>
              <span className={styles.barTrack} aria-hidden="true">
                {parts.map((a) => (
                  <span
                    key={a.id}
                    className={styles.barPart}
                    style={{ width: `${(g.split[a.id] / max) * 100}%`, background: a.color }}
                  />
                ))}
              </span>
              <span className={styles.barPct} aria-hidden="true">
                {g.pct}%
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function ManageColumns({ visible, onChange }: { visible: Set<Column>; onChange: (next: Set<Column>) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);
  const toggle = (id: Column) => {
    const next = new Set(visible);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange(next);
  };
  return (
    <div className={styles.manage} ref={ref}>
      <Button
        variant="outline"
        size="sm"
        startIcon={<Settings />}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((o) => !o)}
      >
        Manage Columns
      </Button>
      {open ? (
        <div className={styles.manageMenu} role="group" aria-label="Visible columns">
          {COLUMNS.map((c) => (
            <Checkbox key={c.id} label={c.label} checked={visible.has(c.id)} onChange={() => toggle(c.id)} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function GeneTable() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [visible, setVisible] = useState<Set<Column>>(new Set(COLUMNS.map((c) => c.id)));

  const q = query.trim().toLowerCase();
  const rows = q ? GENE_ROWS.filter((r) => r.gene.toLowerCase().includes(q)) : GENE_ROWS;
  const totalPages = Math.max(1, Math.ceil(rows.length / rowsPerPage));
  const current = Math.min(page, totalPages);
  const start = (current - 1) * rowsPerPage;
  const shown = rows.slice(start, start + rowsPerPage);
  const range = rows.length ? `${start + 1} - ${start + shown.length} of ${rows.length} Genes` : "0 Genes";

  return (
    <section className={styles.tableCard} aria-label="Altered genes">
      <div className={styles.toolbar}>
        <div className={styles.searchField}>
          <Input
            aria-label="Search gene"
            placeholder="Search Gene"
            startIcon={<Search />}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <span className={styles.range} aria-live="polite">
          {range}
        </span>
        <ManageColumns visible={visible} onChange={setVisible} />
      </div>
      <div className={styles.tableScroll} tabIndex={0} role="region" aria-label="Altered genes table">
        <Table caption="Altered genes" captionHidden>
          <TableHead>
            <TableRow>
              <TableHeaderCell rowSpan={2}>Gene</TableHeaderCell>
              {visible.has("role") ? <TableHeaderCell rowSpan={2}>Role</TableHeaderCell> : null}
              {visible.has("altered") ? <TableHeaderCell rowSpan={2}>% of cohort altered</TableHeaderCell> : null}
              {visible.has("mutations") ? (
                <TableHeaderCell colSpan={POINT_MUTATIONS.length} className={styles.groupHead}>
                  Point mutations (SNVs + indels)
                </TableHeaderCell>
              ) : null}
            </TableRow>
            {visible.has("mutations") ? (
              <TableRow>
                {POINT_MUTATIONS.map((m) => (
                  <TableHeaderCell key={m.id} className={styles.mutationHead}>
                    <abbr title={m.label} className={styles.badge} style={{ background: m.color }}>
                      {m.id}
                    </abbr>
                  </TableHeaderCell>
                ))}
              </TableRow>
            ) : null}
          </TableHead>
          <TableBody>
            {shown.map((r) => (
              <TableRow key={r.gene}>
                <TableCell>
                  <strong className={styles.gene}>{r.gene}</strong>
                </TableCell>
                {visible.has("role") ? <TableCell>{r.role}</TableCell> : null}
                {visible.has("altered") ? (
                  <TableCell>
                    <strong>{((r.altered / COHORT_SIZE) * 100).toFixed(1)}%</strong>{" "}
                    <span className={styles.muted}>
                      ({fmtNumber(r.altered)}/{fmtNumber(COHORT_SIZE)})
                    </span>
                  </TableCell>
                ) : null}
                {visible.has("mutations")
                  ? POINT_MUTATIONS.map((m) => {
                      const n = r.mutations[m.id];
                      return (
                        <TableCell key={m.id} className={styles.mutationCell}>
                          {n ? (
                            <span className={styles.badge} style={{ background: m.color }}>
                              {fmtNumber(n)}
                              <span className={styles.srOnly}> {m.label}</span>
                            </span>
                          ) : (
                            <span aria-label={`No ${m.label.toLowerCase()}`}>-</span>
                          )}
                        </TableCell>
                      );
                    })
                  : null}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Pagination
        variant="arrows"
        page={current}
        totalPages={totalPages}
        onPageChange={setPage}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[10, 20, 50]}
        onRowsPerPageChange={(n) => {
          setRowsPerPage(n);
          setPage(1);
        }}
        aria-label="Gene table pages"
      />
    </section>
  );
}
