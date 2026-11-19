import { Fragment, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent, ReactNode } from "react";
import { ChevronRight, Dna, Rat, Search, User, X } from "lucide-react";
import { NoMatches } from "./FilterPanel";
import styles from "./CancerCategoryTree.module.css";

const cx = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(" ");

export interface CancerCategoryCounts {
  participants: number;
  samples: number;
  pdx: number;
}

export interface CancerCategoryNode {
  id: string;
  label: string;
  /** Top-level categories only: the swatch / tile hue. Descendants get lighter tints. */
  color?: string;
  counts: CancerCategoryCounts;
  children?: CancerCategoryNode[];
  /** Overrides the "n subcategories" figure when children aren't loaded. */
  subcategoryCount?: number;
}

export type CancerCategoryView = "list" | "treemap";

export interface CancerCategoryFilterProps {
  categories: CancerCategoryNode[];
  /** Selected category id, or `null`. */
  value: string | null;
  onChange: (id: string | null) => void;
  /** `list` — indented tree (Figma "List view"); `treemap` — squarified tiles. */
  view?: CancerCategoryView;
  className?: string;
}

interface FlatRow {
  node: CancerCategoryNode;
  depth: number;
  color: string;
  path: CancerCategoryNode[];
}

/* Figma tints: level 1 = hue, level 2 ≈ 70 %, level 3 ≈ 40 % over white
 * (CNS #ffae2f → #ffc66d → #ffdfac; Solid #54a4ff → #92c5ff → #c5e0ff). */
const TINT = [100, 68, 38];
const tint = (hue: string, depth: number) =>
  depth === 0 ? hue : `color-mix(in srgb, ${hue} ${TINT[Math.min(depth, 2)]}%, white)`;

function flatten(nodes: CancerCategoryNode[], depth = 0, hue = "", path: CancerCategoryNode[] = []): FlatRow[] {
  return nodes.flatMap((node) => {
    const h = depth === 0 ? node.color ?? "#7c95ae" : hue;
    const row: FlatRow = { node, depth, color: tint(h, depth), path: [...path, node] };
    return [row, ...flatten(node.children ?? [], depth + 1, h, row.path)];
  });
}

/** Keep every ancestor of a match (so the hierarchy still reads); a matching
 *  node keeps its whole subtree (Figma: searching "Solid Tumour" lists all of it). */
function prune(nodes: CancerCategoryNode[], q: string): CancerCategoryNode[] {
  return nodes.flatMap((n) => {
    if (n.label.toLowerCase().includes(q)) return [n];
    const kids = prune(n.children ?? [], q);
    return kids.length > 0 ? [{ ...n, children: kids }] : [];
  });
}

const descendants = (n: CancerCategoryNode): number =>
  n.subcategoryCount ??
  (n.children ?? []).reduce((sum, c) => sum + 1 + (c.subcategoryCount ?? descendants(c)), 0);

/** Wrap the matched substring in a highlight (Figma: mint fill behind the match). */
function highlight(label: string, q: string): ReactNode {
  if (!q) return label;
  const i = label.toLowerCase().indexOf(q);
  if (i < 0) return label;
  return (
    <>
      {label.slice(0, i)}
      <mark className={styles.match}>{label.slice(i, i + q.length)}</mark>
      {label.slice(i + q.length)}
    </>
  );
}

const COUNTS: Array<{ key: keyof CancerCategoryCounts; label: string; Icon: typeof User }> = [
  { key: "participants", label: "participants", Icon: User },
  { key: "samples", label: "samples", Icon: Dna },
  { key: "pdx", label: "PDX models", Icon: Rat },
];

/* ══════════════════════════════════════════════════════════════════════
 * CancerCategoryFilter
 * ════════════════════════════════════════════════════════════════════ */

export function CancerCategoryFilter({
  categories,
  value,
  onChange,
  view = "list",
  className,
}: CancerCategoryFilterProps) {
  const uid = useId();
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const all = useMemo(() => flatten(categories), [categories]);
  const byId = useMemo(() => new Map(all.map((r) => [r.node.id, r])), [all]);
  const selectedRow = value ? byId.get(value) ?? null : null;
  const visible = useMemo(() => (q ? prune(categories, q) : categories), [categories, q]);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const [scrollTo, setScrollTo] = useState<string | null>(null);

  const pick = (id: string | null) => {
    onChange(id);
    // In the tree map the result list is a dropdown: choosing closes it.
    if (view === "treemap") setQuery("");
  };

  const list = (
    <CategoryList
      nodes={visible}
      query={q}
      value={value}
      onSelect={(id) => pick(id === value ? null : id)}
      scrollTo={scrollTo}
      onScrolled={() => setScrollTo(null)}
      labelledBy={`${uid}-all`}
    />
  );

  return (
    <div className={cx(styles.root, view === "treemap" && styles.rootTreemap, className)}>
      <div className={styles.searchStack}>
        <label className={styles.search}>
          <Search className={styles.searchIcon} size={16} aria-hidden="true" />
          <input
            ref={searchRef}
            type="text"
            className={styles.searchInput}
            placeholder="Search for a diagnosis"
            aria-label="Search for a diagnosis"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setQuery("");
            }}
          />
          {query ? (
            <button
              type="button"
              className={styles.searchClear}
              aria-label="Clear search"
              onClick={() => {
                setQuery("");
                searchRef.current?.focus();
              }}
            >
              <X size={20} strokeWidth={2} absoluteStrokeWidth />
            </button>
          ) : null}
        </label>

        {selectedRow && !q ? (
          <div className={styles.selection}>
            <span className={styles.selectionTitle} id={`${uid}-selected`}>
              Selected category
            </span>
            <ol className={styles.path} aria-labelledby={`${uid}-selected`}>
              {selectedRow.path.map((n, k) => {
                const r = byId.get(n.id)!;
                const parent = k > 0 ? selectedRow.path[k - 1].id : null;
                return (
                  <Fragment key={n.id}>
                    {k > 0 ? (
                      <li className={styles.pathSep} aria-hidden="true">
                        <ChevronRight size={16} />
                      </li>
                    ) : null}
                    <li className={styles.pathItem}>
                      <button
                        type="button"
                        className={styles.pathChip}
                        title={n.label}
                        aria-current={k === selectedRow.path.length - 1 ? "true" : undefined}
                        onClick={() => {
                          onChange(n.id);
                          setScrollTo(n.id);
                        }}
                      >
                        <span className={styles.swatch} style={{ "--swatch": r.color } as CSSProperties} aria-hidden="true" />
                        <span className={styles.pathLabel}>{n.label}</span>
                      </button>
                      <button
                        type="button"
                        className={styles.pathRemove}
                        aria-label={`Remove ${n.label}`}
                        onClick={() => onChange(parent)}
                      >
                        <X size={14} />
                      </button>
                    </li>
                  </Fragment>
                );
              })}
            </ol>
          </div>
        ) : null}

        {view === "treemap" && q ? (
          <div className={styles.dropdown}>{visible.length ? list : <NoMatches />}</div>
        ) : null}
      </div>

      {view === "list" ? (
        <div className={styles.results}>
          <div className={styles.resultsHeader} id={`${uid}-all`}>
            All categories
          </div>
          {visible.length ? list : <NoMatches />}
        </div>
      ) : (
        <Treemap categories={categories} byId={byId} value={value} onSelect={pick} />
      )}
    </div>
  );
}

/** @deprecated Use `CancerCategoryFilter` (list view is its default). */
export const CancerCategoryTree = CancerCategoryFilter;

/* ── List view ─────────────────────────────────────────────────────── */

interface CategoryListProps {
  nodes: CancerCategoryNode[];
  query: string;
  value: string | null;
  onSelect: (id: string) => void;
  scrollTo: string | null;
  onScrolled: () => void;
  labelledBy: string;
}

function CategoryList({ nodes, query, value, onSelect, scrollTo, onScrolled, labelledBy }: CategoryListProps) {
  const rows = useMemo(() => flatten(nodes), [nodes]);
  const rowRefs = useRef(new Map<string, HTMLDivElement>());
  const [focusId, setFocusId] = useState<string | null>(null);
  const tabStop = rows.find((r) => r.node.id === (focusId ?? value))?.node.id ?? rows[0]?.node.id;

  // "If clicked on a selected category it also scrolls down to it on the list view."
  useEffect(() => {
    if (!scrollTo) return;
    rowRefs.current.get(scrollTo)?.scrollIntoView({ block: "center", behavior: "smooth" });
    onScrolled();
  }, [scrollTo, onScrolled]);

  const focusRow = (i: number) => {
    const row = rows[Math.max(0, Math.min(rows.length - 1, i))];
    if (!row) return;
    setFocusId(row.node.id);
    rowRefs.current.get(row.node.id)?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>, i: number, id: string) => {
    switch (e.key) {
      case "ArrowDown":
        focusRow(i + 1);
        break;
      case "ArrowUp":
        focusRow(i - 1);
        break;
      case "Home":
        focusRow(0);
        break;
      case "End":
        focusRow(rows.length - 1);
        break;
      case "Enter":
      case " ":
        onSelect(id);
        break;
      default:
        return;
    }
    e.preventDefault();
  };

  const render = (list: CancerCategoryNode[], depth: number, hue: string): ReactNode =>
    list.map((node) => {
      const h = depth === 0 ? node.color ?? "#7c95ae" : hue;
      const i = rows.findIndex((r) => r.node.id === node.id);
      const selected = node.id === value;
      const kids = node.children ?? [];
      return (
        <li key={node.id} className={cx(styles.branch, depth > 0 && styles.child)} role="none">
          <div
            ref={(el) => {
              if (el) rowRefs.current.set(node.id, el);
              else rowRefs.current.delete(node.id);
            }}
            role="treeitem"
            aria-level={depth + 1}
            aria-selected={selected}
            aria-expanded={kids.length > 0 ? true : undefined}
            tabIndex={node.id === tabStop ? 0 : -1}
            className={cx(styles.row, selected && styles.selected)}
            onClick={() => {
              setFocusId(node.id);
              onSelect(node.id);
            }}
            onKeyDown={(e) => onKeyDown(e, i, node.id)}
          >
            <span className={styles.swatch} style={{ "--swatch": tint(h, depth) } as CSSProperties} aria-hidden="true" />
            <span className={styles.label} title={node.label}>
              {highlight(node.label, query)}
            </span>
            <span className={styles.counts}>
              {COUNTS.map(({ key, label, Icon }) => (
                <span key={key} className={cx(styles.countItem, node.counts[key] === 0 && styles.zero)}>
                  <Icon className={styles.countIcon} size={16} aria-hidden="true" />
                  <span className={styles.countChip}>
                    {node.counts[key].toLocaleString("en-US")}
                    <span className={styles.srOnly}> {label}</span>
                  </span>
                </span>
              ))}
            </span>
          </div>
          {kids.length > 0 ? (
            <ul role="group" className={styles.group}>
              {render(kids, depth + 1, h)}
            </ul>
          ) : null}
        </li>
      );
    });

  return (
    <ul role="tree" aria-labelledby={labelledBy} className={styles.tree}>
      {render(nodes, 0, "")}
    </ul>
  );
}

/* ── Tree map view ─────────────────────────────────────────────────── */

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Squarified treemap (Bruls, Huizing & van Wijk) — keeps tiles close to square. */
function squarify<T>(items: Array<{ item: T; value: number }>, box: Rect): Array<{ item: T } & Rect> {
  const total = items.reduce((s, i) => s + i.value, 0);
  if (!total || box.w <= 0 || box.h <= 0) return [];
  const scale = (box.w * box.h) / total;
  const queue = [...items].sort((a, b) => b.value - a.value).map((i) => ({ ...i, area: i.value * scale }));
  const out: Array<{ item: T } & Rect> = [];
  let { x, y, w, h } = box;

  const worst = (row: typeof queue, side: number) => {
    const sum = row.reduce((s, r) => s + r.area, 0);
    const max = Math.max(...row.map((r) => r.area));
    const min = Math.min(...row.map((r) => r.area));
    return Math.max((side * side * max) / (sum * sum), (sum * sum) / (side * side * min));
  };

  while (queue.length) {
    const side = Math.min(w, h);
    const row = [queue.shift()!];
    while (queue.length && worst([...row, queue[0]], side) <= worst(row, side)) row.push(queue.shift()!);
    const sum = row.reduce((s, r) => s + r.area, 0);
    if (w >= h) {
      const colW = sum / h;
      let cy = y;
      for (const r of row) {
        const rh = r.area / colW;
        out.push({ item: r.item, x, y: cy, w: colW, h: rh });
        cy += rh;
      }
      x += colW;
      w -= colW;
    } else {
      const rowH = sum / w;
      let cx2 = x;
      for (const r of row) {
        const rw = r.area / rowH;
        out.push({ item: r.item, x: cx2, y, w: rw, h: rowH });
        cx2 += rw;
      }
      y += rowH;
      h -= rowH;
    }
  }
  return out;
}

interface TreemapProps {
  categories: CancerCategoryNode[];
  byId: Map<string, FlatRow>;
  value: string | null;
  onSelect: (id: string | null) => void;
}

function Treemap({ categories, byId, value, onSelect }: TreemapProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ w: width, h: height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Drill: show the selected node's children; a selected leaf shows its siblings.
  const sel = value ? byId.get(value) : undefined;
  const focus = sel && (sel.node.children?.length ?? 0) > 0 ? sel : sel ? sel.path.length > 1 ? byId.get(sel.path[sel.path.length - 2].id) : undefined : undefined;
  const tiles = focus ? focus.node.children ?? [] : categories;

  const rects = squarify(
    tiles.map((n) => ({ item: n, value: Math.max(n.counts.participants, 1) })),
    { x: 0, y: 0, w: size.w, h: size.h },
  );

  return (
    <div ref={ref} className={styles.treemap} role="group" aria-label="Cancer categories tree map">
      {rects.map(({ item: n, x, y, w, h }) => {
        const row = byId.get(n.id)!;
        const subs = descendants(n);
        const selected = n.id === value;
        return (
          <button
            key={n.id}
            type="button"
            className={cx(styles.tile, selected && styles.tileSelected, h < 120 && styles.tileCompact)}
            style={{ left: x, top: y, width: w, height: h, "--tile": row.color } as CSSProperties}
            aria-pressed={selected}
            onClick={() => onSelect(selected ? null : n.id)}
          >
            <span className={styles.tileTitle}>
              <span className={styles.tileName}>{n.label}</span>
              {subs > 0 ? (
                <span className={styles.tileSub}>
                  {subs} subcategor{subs === 1 ? "y" : "ies"}
                </span>
              ) : null}
            </span>
            <span className={styles.tilePills}>
              <span className={styles.tilePill}>
                <User size={20} aria-hidden="true" />
                {n.counts.participants.toLocaleString("en-US")}
                <span className={styles.srOnly}> participants</span>
              </span>
              {n.counts.pdx > 0 ? (
                <span className={styles.tilePill}>
                  <Rat size={20} aria-hidden="true" />
                  {n.counts.pdx.toLocaleString("en-US")}
                  <span className={styles.srOnly}> PDX models</span>
                </span>
              ) : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}
