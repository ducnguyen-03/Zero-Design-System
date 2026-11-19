import { useState } from "react";
import type { KeyboardEvent, MouseEvent } from "react";
import { ChevronRight, EllipsisVertical, Mars, Plus, Venus } from "lucide-react";
import { Badge } from "../../../components/Badge/Badge";
import { IconButton } from "../../../components/IconButton/IconButton";
import { MTB_COLUMNS, MTB_LB_CASE, MTB_SOLID_SAMPLES } from "./mtbData";
import type { MtbLbCase, MtbSample, MtbSex } from "./mtbData";
import styles from "./MtbView.module.css";

export interface MtbViewProps {
  /**
   * Called when a row is opened (the design navigates to the Unified Patient View):
   * `"solid"` for a tumour sample row, `"lb"` for the liquid-biopsy case row or one of its samples.
   */
  onOpenPatient?: (event: "solid" | "lb") => void;
  /** Sample rows. Defaults to the design's mock data. */
  samples?: MtbSample[];
  /** Clustered liquid-biopsy case (rendered after the samples). Defaults to the design's mock data; `null` hides it. */
  lbCase?: MtbLbCase | null;
  /** Start with the liquid-biopsy case expanded. */
  defaultLbOpen?: boolean;
  className?: string;
}

const cx = (...parts: Array<string | false | undefined>) => parts.filter(Boolean).join(" ");

const stop = (e: MouseEvent) => e.stopPropagation();

function SexIcon({ sex }: { sex: MtbSex }) {
  const male = sex === "M";
  return (
    <span className={styles.sex} title={male ? "Male" : "Female"}>
      {male ? <Mars aria-hidden="true" /> : <Venus aria-hidden="true" />}
      <span className={styles.srOnly}>{male ? "Male" : "Female"}</span>
    </span>
  );
}

/** Two dashed "+" placeholders: nobody assigned yet. */
function Unassigned() {
  return (
    <div className={styles.adders}>
      <span className={styles.adder} aria-hidden="true">
        <Plus />
      </span>
      <span className={styles.adder} aria-hidden="true">
        <Plus />
      </span>
      <span className={styles.srOnly}>Unassigned</span>
    </div>
  );
}

function Kebab() {
  return (
    <div className={styles.kebabCell} role="cell">
      <IconButton
        size="sm"
        className={styles.kebab}
        aria-label="More actions"
        icon={<EllipsisVertical />}
        onClick={stop}
      />
    </div>
  );
}

/** Make a whole grid row open on click and Enter / Space. */
function rowProps(open: () => void) {
  return {
    role: "row" as const,
    tabIndex: 0,
    onClick: open,
    onKeyDown: (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.target !== e.currentTarget) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        open();
      }
    },
  };
}

function SampleRow({ s, child, first, onOpen }: { s: MtbSample; child: boolean; first: boolean; onOpen: () => void }) {
  return (
    <div
      {...rowProps(onOpen)}
      className={cx(styles.row, styles.sampleRow, child && styles.childRow, first && styles.firstRow)}
    >
      <div role="cell" className={cx(styles.cell, styles.idCell)}>
        <span className={styles.sid}>{s.sid}</span>
        <span className={styles.pid}>
          Patient ID: {s.patientId}
          <SexIcon sex={s.sex} />
        </span>
        {s.kind ? <span className={styles.kind}>{s.kind}</span> : null}
      </div>
      <div role="cell" className={styles.cell}>
        <Badge variant="neutral">{s.status}</Badge>
      </div>
      <div role="cell" className={cx(styles.cell, styles.muted)}>{s.meeting}</div>
      <div role="cell" className={styles.cell}>{s.dx}</div>
      <div role="cell" className={styles.cell}>{s.event}</div>
      <div role="cell" className={styles.cell}>{s.tissue}</div>
      <div role="cell" className={cx(styles.cell, styles.num)}>{s.age}</div>
      <div role="cell" className={styles.cell}><Unassigned /></div>
      <div role="cell" className={styles.cell}><Unassigned /></div>
      <div role="cell" className={styles.cell}><Unassigned /></div>
      <Kebab />
    </div>
  );
}

/**
 * ZeroDash › Clinical › Cases ("MTB slides dashboard"). Sample-level table where a patient's
 * liquid-biopsy samples are clustered into one expandable case row. Page content only —
 * the shell supplies navigation, toolbar and row count.
 */
export function MtbView({
  onOpenPatient,
  samples = MTB_SOLID_SAMPLES,
  lbCase = MTB_LB_CASE,
  defaultLbOpen = false,
  className,
}: MtbViewProps) {
  const [lbOpen, setLbOpen] = useState(defaultLbOpen);
  const openSolid = () => onOpenPatient?.("solid");
  const openLb = () => onOpenPatient?.("lb");

  return (
    <div className={cx(styles.root, className)} data-screen-label="MTB Slides Dashboard">
      <div className={styles.table} role="table" aria-label="Clinical cases">
        <div className={cx(styles.row, styles.head)} role="row">
          {MTB_COLUMNS.map((c) => (
            <div key={c} role="columnheader" className={styles.th}>
              {c}
            </div>
          ))}
          <div role="columnheader" className={styles.th}>
            <span className={styles.srOnly}>Actions</span>
          </div>
        </div>

        <div role="rowgroup">
          {samples.map((s, i) => (
            <SampleRow key={s.sid} s={s} child={false} first={i === 0} onOpen={openSolid} />
          ))}

          {lbCase ? (
            <>
              <div {...rowProps(openLb)} className={cx(styles.row, styles.lbRow)} aria-expanded={lbOpen}>
                <div role="cell" className={cx(styles.cell, styles.lbIdCell)}>
                  <button
                    type="button"
                    className={styles.toggle}
                    aria-label={lbOpen ? "Collapse liquid biopsies" : "Expand liquid biopsies"}
                    aria-expanded={lbOpen}
                    onClick={(e) => {
                      e.stopPropagation();
                      setLbOpen((v) => !v);
                    }}
                  >
                    <ChevronRight className={cx(styles.chev, lbOpen && styles.chevOpen)} aria-hidden="true" />
                  </button>
                  <div className={styles.idCell}>
                    <span className={cx(styles.sid, styles.lbSid)}>{lbCase.sid}</span>
                    <span className={cx(styles.pid, styles.lbPid)}>
                      Patient ID: {lbCase.patientId}
                      <SexIcon sex={lbCase.sex} />
                    </span>
                  </div>
                </div>
                <div role="cell" className={styles.cell}>
                  <span className={styles.lbCount}>{lbCase.samples.length} LB</span>
                </div>
                <div role="cell" className={styles.cell} />
                <div role="cell" className={cx(styles.cell, styles.lbDx)}>{lbCase.dx}</div>
                <div role="cell" className={cx(styles.cell, styles.lbEvent)}>{lbCase.event}</div>
                <div role="cell" className={styles.cell} />
                <div role="cell" className={styles.cell} />
                <div role="cell" className={styles.cell} />
                <div role="cell" className={styles.cell} />
                <div role="cell" className={styles.cell} />
                <Kebab />
              </div>
              {lbOpen
                ? lbCase.samples.map((s) => (
                    <SampleRow key={s.sid} s={s} child first={false} onOpen={openLb} />
                  ))
                : null}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
