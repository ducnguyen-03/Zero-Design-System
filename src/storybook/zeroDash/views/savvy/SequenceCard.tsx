import { forwardRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { D, bpWin, coord, idxOf, relLabel } from "../savvyData";
import type { SavvyCase, SiteChange } from "../savvyData";
import { InfoTip, SavCard, Segmented, cx } from "./parts";
import { NUC, RegionViewer } from "./RegionViewer";
import styles from "../SavvyView.module.css";

export interface SequenceCardProps {
  cs: SavvyCase;
  vIdx: number;
  refAlt: "REF" | "ALT";
  onRefAlt: (m: "REF" | "ALT") => void;
  bp: number;
  onBp: (k: number) => void;
  dist: number;
  laneSub: string;
  laneMsg: string;
  sites: SiteChange[];
  recalc: boolean;
  accCaption: string;
  /** Glow on the acceptor tile (after "Inspect the acceptor region"). */
  flash: boolean;
}

interface Cell {
  b: string;
  pos: string;
  coord: string;
  isVar: boolean;
  ins?: boolean;
}

function BaseCell({ c, isRef, width = 26, bpA }: { c: Cell; isRef: boolean; width?: number; bpA?: boolean }) {
  const varCls = c.isVar ? (isRef ? styles.cellVarRef : styles.cellVarAlt) : bpA ? styles.cellBpA : undefined;
  return (
    <div title={c.coord} className={cx(styles.cell, varCls)} style={{ width }}>
      <span className={styles.cellBase} style={{ color: NUC[c.b] }}>
        {c.b}
      </span>
      <span className={cx(styles.cellPos, c.isVar && (isRef ? styles.cellPosRef : styles.cellPosAlt))}>{c.pos}</span>
    </div>
  );
}

export const SequenceCard = forwardRef<HTMLDivElement, SequenceCardProps>(function SequenceCard(p, accRef) {
  const { cs, vIdx: V, refAlt } = p;
  const isRef = refAlt === "REF";
  const indel = cs.view === "indel";
  const varBase = isRef || indel ? cs.ref : cs.alt;
  const seq = D.SEQ.slice(0, V) + varBase + D.SEQ.slice(V + 1);
  const regionText = "17:" + D.start.toLocaleString("en-AU") + "-" + D.end.toLocaleString("en-AU");

  const cell = (i: number, pos: string): Cell => ({ b: seq[i], pos, coord: coord(i) + (i === V ? `, variant (${refAlt})` : ""), isVar: i === V });
  const donor = ["E-3", "E-2", "E-1", "+1", "+2", "+3", "+4", "+5", "+6"].map((pos, k) => cell(D.DON + k, pos));
  const acceptor: Cell[] = [];
  for (let q = -20; q <= -1; q++) acceptor.push(cell(idxOf(q), String(q)));
  ["E+1", "E+2", "E+3"].forEach((pos, k) => {
    acceptor.push(cell(D.VAR + k, pos));
    if (k === 0 && indel && !isRef) acceptor.push({ b: "A", pos: "ins", coord: "A inserted after " + coord(D.VAR), isVar: true, ins: true });
  });

  const bd = D.BP_DIST[p.bp];
  const ws = bpWin(bd);
  const bpCells = [0, 1, 2, 3, 4].map((k) => {
    const q = ws + k;
    const i = idxOf(q);
    const isA = q === -bd;
    return { c: { b: seq[i], pos: String(q), coord: coord(i) + (isA ? ", branch A" : ""), isVar: false }, isA };
  });

  const vRel = relLabel(V);
  const vAcc = V >= D.ACC && V < D.ACC + 23;
  const nBp = D.BP_DIST.length;

  return (
    <SavCard
      title="Splice-site sequence"
      action={
        <Segmented
          ariaLabel="Sequence shown"
          options={[
            { value: "REF", label: "REF" },
            { value: "ALT", label: "ALT" },
          ]}
          value={refAlt}
          onChange={p.onRefAlt}
        />
      }
    >
      <div className={styles.stack16}>
        <p className={styles.b14}>
          {isRef ? "REF sequence shown. Variant position outlined." : "ALT sequence shown. Variant position highlighted in red."} Exons 6 – 7 | {regionText}
        </p>
        <div className={styles.varPos}>
          <span className={styles.varPosDot} />
          <span className={cx(styles.l11m, styles.varPosLabel)}>Variant position</span>
          <span className={cx(styles.b14m, styles.textPrimary)}>
            {vAcc ? "Acceptor" : "Donor"} region, position {/^[+-]/.test(vRel) ? "I" + vRel : vRel}
          </span>
          <span className={cx(styles.b14, styles.textSecondary)}>
            ALT {cs.alt} replaces REF {cs.ref}
          </span>
        </div>

        <div className={styles.tiles}>
          <div className={cx(styles.tile, !vAcc && styles.tileHi)}>
            <div className={cx(styles.tileHead, styles.tileHeadDonor)}>
              <span className={styles.tileDot} />
              <span className={styles.tileName}>Donor</span>
              <span className={styles.tileSub}>(5′ splice site)</span>
            </div>
            <div className={styles.tileBody}>
              <div className={styles.cellRow}>
                {donor.map((c, k) => (
                  <BaseCell key={k} c={c} isRef={isRef} />
                ))}
              </div>
            </div>
            <div className={cx(styles.tileFoot, styles.tileFootDonor)}>Exon–intron boundary between E-1 and +1</div>
          </div>

          <div className={cx(styles.tile, styles.tileBp)}>
            <div className={cx(styles.tileHead, styles.tileHeadBp)}>
              <span className={styles.tileDot} />
              <span className={styles.tileName}>Branchpoint</span>
              <InfoTip tip="branchpoint" label="branchpoints" tone="blue" />
              <div className={styles.bpNav}>
                <button type="button" className={styles.bpNavBtn} aria-label="Previous branchpoint candidate" onClick={() => p.onBp((p.bp + nBp - 1) % nBp)}>
                  <ChevronLeft size={16} aria-hidden="true" />
                </button>
                <span aria-live="polite" className={styles.bpNavLabel}>
                  {p.bp + 1} of {nBp}
                </span>
                <button type="button" className={styles.bpNavBtn} aria-label="Next branchpoint candidate" onClick={() => p.onBp((p.bp + 1) % nBp)}>
                  <ChevronRight size={16} aria-hidden="true" />
                </button>
              </div>
            </div>
            <div className={styles.tileBody}>
              <div key={"bp" + p.bp} className={styles.cellRow}>
                {bpCells.map(({ c, isA }, k) => (
                  <div key={k} className={styles.cellAnim} style={{ animationDelay: k * 40 + "ms" }}>
                    <BaseCell c={c} isRef={isRef} width={32} bpA={isA} />
                  </div>
                ))}
              </div>
            </div>
            <div className={cx(styles.tileFoot, styles.tileFootBp)}>
              Branch A at&nbsp;<span className={styles.tnum}>−{bd}</span>, {bd} nt upstream of AG
            </div>
          </div>

          <div ref={accRef} tabIndex={-1} className={cx(styles.tile, styles.tileAcc, vAcc && styles.tileHi, p.flash && styles.tileFlash)}>
            <div className={cx(styles.tileHead, styles.tileHeadAcc)}>
              <span className={styles.tileDot} />
              <span className={styles.tileName}>Acceptor</span>
              <span className={styles.tileSub}>(3′ splice site)</span>
            </div>
            <div className={cx(styles.tileBody, styles.tileBodyScroll)}>
              <div className={styles.cellRowTight}>
                {acceptor.map((c, k) => (
                  <BaseCell key={k} c={c} isRef={isRef && !c.ins} />
                ))}
              </div>
            </div>
            <div className={cx(styles.tileFoot, styles.tileFootAcc)}>{p.accCaption}</div>
          </div>
        </div>

        <RegionViewer
          vIdx={V}
          varBase={varBase}
          isRef={isRef}
          indel={indel}
          off={cs.off}
          dist={p.dist}
          laneSub={p.laneSub}
          laneMsg={p.laneMsg}
          sites={p.sites}
          recalc={p.recalc}
          bp={p.bp}
          onBp={p.onBp}
        />
        <p className={cx(styles.b14, styles.textTertiary)}>
          Hover to magnify. Drag the navigator, use the scrollbar or Shift + scroll to move along the prediction window.
        </p>
      </div>
    </SavCard>
  );
});
