import { useId, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { ChevronDown, ChevronRight, ChevronUp, Info, Search, TriangleAlert } from "lucide-react";
import { Button } from "../../../components/Button/Button";
import { Input } from "../../../components/Input/Input";
import { ChartCard, FrequencyHeatmap, StackedBarChart } from "../../../components/Charts";
import {
  HEAT_CATEGORIES,
  HEAT_CO_OCCURRING,
  HEAT_GENE_ROW,
  HEAT_MORE,
  MUTATION_DATA,
  MUTATION_GROUPS,
  MUTATION_SERIES,
  NETWORK_EDGES,
  NETWORK_NODES,
  PROTEIN_DOMAINS,
  PROTEIN_LENGTH,
  PROTEIN_MUTATIONS,
  emptyHeatRow,
  geneProfile,
} from "./molecularData";
import type { GeneProfile, NetworkNode } from "./molecularData";
import viewStyles from "./MolecularView.module.css";
import styles from "./MolecularGeneDetail.module.css";

export interface MolecularGeneDetailProps {
  gene: string;
  /** Back to the molecular overview (the "Genes" breadcrumb). */
  onBack: () => void;
  /** Open another gene (co-occurring gene links). */
  onOpenGene: (gene: string) => void;
}

/** Gene detail (Figma 15230:18886). Only TP53 has real data; other genes reuse its layout. */
export function MolecularGeneDetail({ gene, onBack, onOpenGene }: MolecularGeneDetailProps) {
  const profile = geneProfile(gene);
  return (
    <div className={viewStyles.detail}>
      <nav aria-label="Breadcrumb">
        <ol className={styles.breadcrumb}>
          <li>
            <button type="button" className={styles.crumbLink} onClick={onBack}>
              Genes
            </button>
          </li>
          <li aria-hidden="true" className={styles.crumbSep}>
            <ChevronRight />
          </li>
          <li>
            <span className={styles.crumbCurrent} aria-current="page">
              {profile.symbol}
            </span>
          </li>
        </ol>
      </nav>
      <GeneHeader profile={profile} onOpenGene={onOpenGene} />
      <ChartCard title={`Cancer Types with ${profile.symbol} Mutations`} className={styles.mutationCard}>
        <MutationChart symbol={profile.symbol} />
      </ChartCard>
      <MutationHeatmap symbol={profile.symbol} />
      <CoOccurrenceNetwork symbol={profile.symbol} />
      <ProteinPaint symbol={profile.symbol} />
    </div>
  );
}

/* ─────────────────────────── Header + impact overview ─────────────────────────── */

function InfoLabel({ children }: { children: ReactNode }) {
  return (
    <span className={styles.statLabel}>
      {children}
      <Info aria-hidden="true" className={styles.statInfo} />
    </span>
  );
}

function GeneHeader({ profile, onOpenGene }: { profile: GeneProfile; onOpenGene: (gene: string) => void }) {
  const headingId = useId();
  return (
    <section className={styles.header} aria-labelledby={headingId}>
      <div className={styles.identity}>
        <div className={styles.idCard}>
          <div className={styles.idTitle}>
            <h2 id={headingId} className={styles.symbol}>
              {profile.symbol}
            </h2>
            <span className={styles.fullName}>{profile.name}</span>
          </div>
          <hr className={styles.rule} />
          <p className={styles.meta}>
            <span className={styles.metaKey}>Location:</span> {profile.location}
          </p>
          <p className={styles.meta}>
            <span className={styles.metaKey}>Aliases:</span> {profile.aliases}
          </p>
        </div>
        <p className={styles.description}>{profile.description}</p>
      </div>

      <div className={styles.impact}>
        <h3 className={styles.impactTitle}>Impact overview</h3>
        <div className={styles.ticket}>
          <span className={styles.ticketPart}>{profile.participants}</span>
          <span className={styles.ticketNotch} aria-hidden="true" />
          <span className={styles.ticketPart}>{profile.subtypes}</span>
        </div>

        <div className={styles.statRow2}>
          <div className={styles.stat}>
            <InfoLabel>Top affected cancer</InfoLabel>
            <div className={styles.statValueRow}>
              <span className={styles.statValue}>{profile.topCancer.name}</span>
              <span className={styles.tag}>{profile.topCancer.share}</span>
            </div>
            <Button variant="text" size="sm" className={styles.statLink}>
              View breakdown
            </Button>
          </div>
          <div className={styles.stat}>
            <InfoLabel>Co-occurrence genes</InfoLabel>
            {profile.coOccurrence.map((c) => (
              <div key={c.gene} className={styles.statValueRowSpread}>
                <button type="button" className={styles.statGene} onClick={() => onOpenGene(c.gene)}>
                  {c.gene}
                </button>
                <span className={styles.tag}>{c.share}</span>
              </div>
            ))}
            <Button variant="text" size="sm" className={styles.statLink}>
              View network
            </Button>
          </div>
        </div>

        <hr className={styles.ruleWide} />

        <div className={styles.statRow3}>
          <div className={styles.stat}>
            <InfoLabel>Common class type</InfoLabel>
            <div className={styles.statValueRow}>
              <span className={styles.classCount}>{profile.classType.count}</span>
              <span className={styles.classLabel}>{profile.classType.label}</span>
            </div>
          </div>
          <div className={styles.stat}>
            <InfoLabel>Most common variant</InfoLabel>
            <div className={styles.statValueRow}>
              <span className={styles.statValue}>{profile.commonVariant.name}</span>
              <span className={styles.consequence}>{profile.commonVariant.consequence}</span>
              <span className={styles.significance}>
                <TriangleAlert aria-hidden="true" />
                {profile.commonVariant.significance}
              </span>
            </div>
            <Button variant="text" size="sm" className={styles.statLink}>
              View detail
            </Button>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Number of PDX model</span>
            <span className={styles.statValue}>{profile.pdxModels}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Number of participant</span>
            <span className={styles.statValue}>{profile.participantCount}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── Stacked bar ─────────────────────────── */

function MutationChart({ symbol }: { symbol: string }) {
  return (
    <div className={styles.mutationChart}>
      <StackedBarChart
        series={MUTATION_SERIES}
        data={MUTATION_DATA}
        height={240}
        yLabel="# Variants"
        label={`${symbol} variants by cancer type and alteration class`}
      />
      {/* Disease-category grouping under the bars — each group spans its cancer types. */}
      <div className={styles.groups} aria-hidden="true">
        {MUTATION_GROUPS.map((g) => (
          <span key={g.category} className={styles.group} style={{ flexGrow: g.types.length }}>
            {g.category}
          </span>
        ))}
      </div>
      <p className={styles.axisTitle}>Disease</p>
    </div>
  );
}

/* ─────────────────────────── Heatmap ─────────────────────────── */

function MutationHeatmap({ symbol }: { symbol: string }) {
  const headingId = useId();
  const [more, setMore] = useState(false);
  const [added, setAdded] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const rows = [
    { ...HEAT_GENE_ROW, label: symbol },
    ...HEAT_CO_OCCURRING,
    ...(more ? HEAT_MORE : []),
    ...added.map(emptyHeatRow),
  ];
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const g = query.trim().toUpperCase();
    if (e.key !== "Enter" || !g) return;
    if (!rows.some((r) => r.label === g)) setAdded((a) => [...a, g]);
    setQuery("");
  };
  return (
    <section className={styles.section} aria-labelledby={headingId}>
      <h3 id={headingId} className={styles.sectionTitle}>
        {symbol} mutation frequency across
      </h3>
      <div className={styles.panel}>
        <p className={styles.heatNote}>
          First row: {symbol}. Following rows: genes co-occurring with {symbol}, as a share of {symbol}-mutated participants in each
          category.
        </p>
        <FrequencyHeatmap
          className={styles.heatmap}
          columns={HEAT_CATEGORIES}
          rows={rows}
          label={`${symbol} and co-occurring gene mutation frequency by cancer category`}
        />
        <div className={styles.heatActions}>
          <Button variant="text" size="sm" endIcon={more ? <ChevronUp /> : <ChevronDown />} onClick={() => setMore(!more)}>
            {more ? "Show less" : "Show more"}
          </Button>
          <div className={styles.heatSearch}>
            <Input
              aria-label="Search a gene name to add"
              placeholder="Search a gene name to add"
              startIcon={<Search />}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── Co-occurrence network ─────────────────────────── */

const edgeStrength = (pct: number) => (pct > 50 ? "strong" : pct >= 25 ? "medium" : "weak");

function CoOccurrenceNetwork({ symbol }: { symbol: string }) {
  const headingId = useId();
  const nodes: NetworkNode[] = NETWORK_NODES.map((n, i) => (i === 0 ? { ...n, gene: symbol } : n));
  const byGene = new Map(nodes.map((n, i) => [i === 0 ? "TP53" : n.gene, n]));
  return (
    <section className={styles.section} aria-labelledby={headingId}>
      <h3 id={headingId} className={styles.sectionTitle}>
        Co-occurring Genes with {symbol}
      </h3>
      <div className={styles.networkIntro}>
        <p>This network shows genes that frequently mutate in the same participants as {symbol} across the filtered cohort.</p>
        <ul>
          <li>
            <b>Node size</b> reflects how often each gene is mutated overall.
          </li>
          <li>
            <b>Edge style</b> indicates the strength of co-occurrence.
          </li>
          <li>
            <b>Percentages</b> show the proportion of {symbol}-mutated participants where each partner gene also appears.
          </li>
        </ul>
      </div>
      <div className={styles.panel}>
        <svg
          className={styles.network}
          viewBox="0 0 1000 560"
          role="img"
          aria-label={`Network of genes co-occurring with ${symbol}: ${NETWORK_EDGES.filter((e) => e.from === "TP53")
            .map((e) => `${e.to} ${e.pct}%`)
            .join(", ")}`}
        >
          {NETWORK_EDGES.map((e) => {
            const a = byGene.get(e.from);
            const b = byGene.get(e.to);
            if (!a || !b) return null;
            const s = edgeStrength(e.pct);
            const mx = (a.x + b.x) / 2;
            const my = (a.y + b.y) / 2;
            return (
              <g key={`${e.from}-${e.to}`}>
                <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} className={styles[`edge-${s}`]} />
                <rect x={mx - 20} y={my - 9} width={40} height={18} rx={3} className={s === "weak" ? styles.edgeTag : styles.edgeTagDark} />
                <text x={mx} y={my + 4} className={styles.edgeLabel}>
                  {e.pct}%
                </text>
              </g>
            );
          })}
          {nodes.map((n) => (
            <g key={n.gene}>
              <circle cx={n.x} cy={n.y} r={n.r} style={{ fill: n.color }} />
              <text x={n.x} y={n.y + n.r * 0.14} className={styles.nodeLabel} style={{ fontSize: Math.max(10, n.r * 0.38) }}>
                {n.gene}
              </text>
              <text x={n.x} y={n.y + n.r + 16} className={styles.nodeCount}>
                {n.count}
              </text>
            </g>
          ))}
        </svg>
        <ul className={styles.lineLegend}>
          <li>
            <span className={styles.lineStrong} aria-hidden="true" />
            Strong co-occurrence (&gt;50%)
          </li>
          <li>
            <span className={styles.lineMedium} aria-hidden="true" />
            Medium co-occurrence (25 - 50%)
          </li>
          <li>
            <span className={styles.lineWeak} aria-hidden="true" />
            Weak co-occurrence (&lt;25%)
          </li>
        </ul>
      </div>
    </section>
  );
}

/* ─────────────────────────── Protein paint ─────────────────────────── */

const PP = { left: 40, right: 960, axis: 190 };
const ppX = (pos: number) => PP.left + ((pos - 1) / (PROTEIN_LENGTH - 1)) * (PP.right - PP.left);

function ProteinPaint({ symbol }: { symbol: string }) {
  const headingId = useId();
  const max = Math.max(...PROTEIN_MUTATIONS.map((m) => m.count));
  return (
    <section className={styles.section} aria-labelledby={headingId}>
      <h3 id={headingId} className={styles.sectionTitle}>
        Protein paint
      </h3>
      <div className={styles.panel}>
        <svg
          className={styles.protein}
          viewBox="0 0 1000 250"
          role="img"
          aria-label={`${symbol} protein (${PROTEIN_LENGTH} aa) with recurrent mutations: ${PROTEIN_MUTATIONS.map((m) => `${m.label} ×${m.count}`).join(", ")}`}
        >
          {PROTEIN_MUTATIONS.map((m) => {
            const x = ppX(m.pos);
            const top = PP.axis - 24 - (m.count / max) * 120;
            const r = 4 + (m.count / max) * 6;
            return (
              <g key={m.label}>
                <line x1={x} y1={PP.axis - 10} x2={x} y2={top} className={styles.stem} />
                <circle cx={x} cy={top} r={r} className={styles.head} />
                {m.count / max >= 0.5 ? (
                  <text x={x} y={top - r - 6} className={styles.ppLabel}>
                    {m.label}
                  </text>
                ) : null}
                <title>{`${m.label}: ${m.count} participants`}</title>
              </g>
            );
          })}
          <rect x={PP.left} y={PP.axis - 4} width={PP.right - PP.left} height={8} rx={2} className={styles.backbone} />
          {PROTEIN_DOMAINS.map((d) => (
            <g key={d.label}>
              <rect x={ppX(d.start)} y={PP.axis - 12} width={ppX(d.end) - ppX(d.start)} height={24} rx={4} style={{ fill: d.color }} />
              <text x={(ppX(d.start) + ppX(d.end)) / 2} y={PP.axis + 4} className={styles.domainLabel}>
                {d.label}
              </text>
            </g>
          ))}
          {[1, 100, 200, 300, PROTEIN_LENGTH].map((t) => (
            <text key={t} x={ppX(t)} y={PP.axis + 34} className={styles.ppTick}>
              {t}
            </text>
          ))}
        </svg>
      </div>
    </section>
  );
}
