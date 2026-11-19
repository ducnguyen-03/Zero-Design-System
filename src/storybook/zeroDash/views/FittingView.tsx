import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties, JSX, ReactNode } from "react";
import {
  ArrowRight,
  Check,
  ChevronDown,
  CircleAlert,
  Clock,
  Eye,
  EyeOff,
  Layers,
  Lock,
  Maximize2,
  Plus,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { Button } from "../../../components/Button/Button";
import { Checkbox } from "../../../components/Checkbox/Checkbox";
import { Input } from "../../../components/Input/Input";
import { Modal, ModalFooter } from "../../../components/Modal/Modal";
import { Switch } from "../../../components/Switch/Switch";
import { Textarea } from "../../../components/Textarea/Textarea";
import { DnaLoader } from "../DnaLoader";
import {
  ACTIVE,
  ALL_PLOTS,
  EMPTY_CMP_DESC,
  IMPACT,
  IMPACT_DEFAULT,
  PLOTS,
  PREVIEW_GROUPS,
  STATUS_LABEL,
  consChips,
  initialState,
  num,
  plotSrc,
  previewLabel,
  previewState,
  validateConstraints,
  validateVariant,
} from "./fittingData";
import type {
  Fit,
  FittingState,
  NewFitForm,
  PlotKey,
  PreviewStateId,
  Variant,
  VariantDraft,
  VariantType,
} from "./fittingData";
import styles from "./FittingView.module.css";

export interface FittingViewProps {
  /** Shown in the breadcrumb. Defaults to the design mock "06-0397". */
  patientId?: string;
  /** Back to patient curation. The breadcrumb crumbs are only interactive when this is provided. */
  onBack?: () => void;
  /** `compact` puts two plots side by side per row (four columns); `large` shows one plot per row. */
  plotDensity?: "large" | "compact";
  /** Shows the floating "Prototype controls" panel used to jump between demo states. */
  showPreviewStates?: boolean;
  /** Keeps the reference / comparison fit headers pinned while the page scrolls. */
  stickyCompare?: boolean;
  /** Storybook only: start in one of the design's preview states instead of "Ready to compare". */
  initialPreviewState?: PreviewStateId;
}

const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(" ");

type Tone = "neutral" | "info" | "warning" | "success";
interface Notice {
  title: string;
  desc: string;
  tone: Tone;
  action?: string;
  onAction?: () => void;
  pending?: string;
}

/* ───────────────────────── small local pieces ───────────────────────── */

function IdTag({ children, accent }: { children: ReactNode; accent?: "green" }) {
  return <span className={cx(styles.idTag, accent === "green" && styles.idTagGreen)}>{children}</span>;
}

function Overline({ children }: { children: ReactNode }) {
  return <span className={styles.overline}>{children}</span>;
}

interface DropOption {
  key: string;
  label: string;
  id?: string;
  selected: boolean;
  muted?: boolean;
  onSelect: () => void;
}

/** Listbox dropdown with an optional fit-ID tag next to each option (design "fit selector"). */
function Dropdown({
  open,
  onToggle,
  onClose,
  label,
  id,
  options,
  compact,
  ariaLabel,
}: {
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  label: string;
  id?: string;
  options: DropOption[];
  compact?: boolean;
  ariaLabel?: string;
}) {
  return (
    <div className={styles.ddWrap}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={onToggle}
        className={cx(styles.ddBtn, compact && styles.ddBtnCompact, open && styles.ddBtnOpen)}
      >
        <span className={styles.ddLabel}>{label}</span>
        {id ? <IdTag>{id}</IdTag> : null}
        <ChevronDown size={compact ? 18 : 20} strokeWidth={1.8} className={cx(styles.chev, open && styles.chevOpen)} aria-hidden="true" />
      </button>
      {open ? (
        <>
          <div className={styles.scrim} onClick={onClose} />
          <div role="listbox" className={cx(styles.menu, compact && styles.menuCompact)}>
            {options.map((o) => (
              <div
                key={o.key}
                role="option"
                aria-selected={o.selected}
                tabIndex={0}
                onClick={o.onSelect}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    o.onSelect();
                  }
                }}
                className={cx(styles.option, o.selected && styles.optionSelected, o.muted && styles.optionMuted)}
              >
                <span className={styles.optionText}>
                  <span>{o.label}</span>
                  {o.id ? <IdTag>{o.id}</IdTag> : null}
                </span>
                {o.selected ? <Check size={compact ? 14 : 16} strokeWidth={2} className={styles.optionCheck} aria-hidden="true" /> : null}
              </div>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

function FormAlert({ children }: { children: ReactNode }) {
  return (
    <div role="alert" className={styles.formAlert}>
      <span className={styles.formAlertIcon}>
        <CircleAlert size={24} strokeWidth={2} aria-hidden="true" />
      </span>
      <span>{children}</span>
    </div>
  );
}

/* ───────────────────────── view ───────────────────────── */

export function FittingView({
  patientId = "06-0397",
  onBack,
  plotDensity = "compact",
  showPreviewStates = true,
  stickyCompare = true,
  initialPreviewState,
}: FittingViewProps): JSX.Element {
  const [S, setS] = useState<FittingState>(() =>
    initialPreviewState ? previewState(initialPreviewState) : initialState("explored"),
  );
  const SRef = useRef(S);
  SRef.current = S;
  const patch = useCallback((p: Partial<FittingState> | ((s: FittingState) => Partial<FittingState>)) => {
    setS((s) => ({ ...s, ...(typeof p === "function" ? p(s) : p) }));
  }, []);

  const [dd, setDd] = useState<string | null>(null);
  const [pcOpen, setPcOpen] = useState(false);
  const [trackSettled, setTrackSettled] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const toastT = useRef<number>();
  const trackT = useRef<number>();
  const trackRef = useRef<HTMLDivElement>(null);

  const toast = useCallback((msg: string) => {
    setToastMsg(msg);
    window.clearTimeout(toastT.current);
    toastT.current = window.setTimeout(() => setToastMsg(""), 4500);
  }, []);

  /* ── derived guards ── */
  const fit = (id: string, st: FittingState = S) => st.fits.find((f) => f.id === id);
  const appLocked = (st: FittingState = S) =>
    ["submitting", "unknown", "checking", "recovery"].includes(st.submission?.status ?? "");
  const locked = (st: FittingState = S) => st.closed || appLocked(st) || st.stale || !!st.loadState;
  const canGen = (st: FittingState = S) => !locked(st) && !st.fits.some((f) => ACTIVE.includes(f.status));
  const canSubmit = (id: string, st: FittingState = S) =>
    st.applyAllowed && !locked(st) && id !== st.currentFitId && st.fits.some((f) => f.id === id && f.status === "ready");

  /* ── simulated back end: job progress, application, variant calculation ── */
  useEffect(() => {
    const tick = () => {
      const st = SRef.current;
      const now = Date.now();
      const p: Partial<FittingState> = {};
      let changed = false;
      let msg: string | null = null;

      let fits = st.fits.map((j) => {
        if (!ACTIVE.includes(j.status) || !j.nextAt || j.nextAt > now) return j;
        changed = true;
        const next: Fit["status"] =
          j.fail && j.status === "fitting"
            ? "failed"
            : j.status === "queued"
              ? j.coldStart ? "preparing" : "fitting"
              : j.status === "preparing" ? "fitting" : "ready";
        let u: Fit = { ...j, status: next, nextAt: now + 3000 };
        if (next === "ready") {
          const mid = (a: number | null | undefined, b: number | null | undefined, fb: number) =>
            a == null && b == null ? fb : a == null ? (b as number) : b == null ? a : a + (b - a) / 2;
          const c = j.constraints;
          u = {
            ...u,
            purity: Math.round(mid(c.minPurity, c.maxPurity, 58)),
            ploidy: mid(c.minPloidy, c.maxPloidy, 2.42),
            plots: ALL_PLOTS,
            variantValues: { v1: "1.36", v2: "1.36", v3: "1.36", v4: "2.10–4.20" },
          };
          p.warm = true;
          p.rightFitId = j.id;
          msg = `${j.id} is ready to compare.`;
        }
        return u;
      });

      const sub = st.submission;
      if (
        sub &&
        ((sub.status === "checking" && (sub.checkAt ?? 0) <= now) ||
          (sub.status === "submitting" && sub.nextAt && sub.nextAt <= now))
      ) {
        const ok = !sub.fail;
        changed = true;
        if (ok)
          Object.assign(p, {
            currentFitId: sub.fitId,
            leftFitId: sub.fitId,
            rightFitId: st.currentFitId,
            reviewRequired: true,
            impact: { ...IMPACT_DEFAULT },
          });
        p.submission = { ...sub, status: ok ? "submitted" : "failed" };
        msg = ok
          ? `${sub.fitId} applied. The current fit has been updated.`
          : `${sub.fitId} could not be applied. The current fit is unchanged; you can retry.`;
      }

      let vChanged = false;
      const variants = st.variants.map((r) => {
        if (r.resultStatus === "calculating" && r.nextAt && r.nextAt <= now) {
          vChanged = true;
          const out = r.resultOutcome || "ready";
          if (out === "ready")
            fits = fits.map((f, i) =>
              f.status === "ready" ? { ...f, variantValues: { ...f.variantValues, [r.id]: (1.12 + i * 0.25).toFixed(2) } } : f,
            );
          return { ...r, resultStatus: out, nextAt: null };
        }
        return r;
      });
      if (vChanged) {
        p.variants = variants;
        changed = true;
      }
      if (changed) p.fits = fits;
      if (st.loadNextAt && st.loadNextAt <= now) {
        p.loadState = null;
        p.loadNextAt = null;
        changed = true;
      }
      if (changed) {
        SRef.current = { ...st, ...p };
        setS((s) => ({ ...s, ...p }));
      }
      if (msg) toast(msg);
    };
    const t = window.setInterval(tick, 400);
    return () => {
      window.clearInterval(t);
      window.clearTimeout(toastT.current);
      window.clearTimeout(trackT.current);
    };
  }, [toast]);

  /* ── actions ── */
  const openNew = (retry?: Fit) => {
    if (!canGen()) return toast("New fits are unavailable while a run is active or curation is locked.");
    const c = retry?.constraints ?? {};
    const s = (v: number | null | undefined) => (v == null ? "" : String(v));
    patch({
      modal: { kind: "new" },
      errs: {},
      formErr: "",
      form: {
        name: retry ? `${retry.name} · retry` : "",
        minPurity: s(c.minPurity),
        maxPurity: s(c.maxPurity),
        minPloidy: s(c.minPloidy),
        maxPloidy: s(c.maxPloidy),
      },
    });
  };

  const submitNew = () => {
    const r = validateConstraints(S.form);
    if (!r.valid) return patch({ errs: r.errors, formErr: "Check the highlighted bounds before generating a fit." });
    const id = "FIT-" + String(S.seq).padStart(3, "0");
    const job: Fit = {
      id,
      name: S.form.name.trim().slice(0, 80) || `Exploration ${id.slice(-3)}`,
      status: "queued",
      coldStart: !S.warm,
      constraints: r.constraints,
      plots: [],
      variantValues: {},
      nextAt: Date.now() + 3000,
    };
    patch({ fits: [...S.fits, job], seq: S.seq + 1, modal: null });
    toast(`${id} queued.`);
  };

  const openReview = (id: string) => {
    if (!canSubmit(id)) return;
    const prev = S.submission?.fitId === id ? S.submission.rationale : "";
    patch({ modal: { kind: "review", id }, rationale: prev, formErr: "" });
  };

  const submitReview = () => {
    if (S.modal?.kind !== "review") return;
    const id = S.modal.id;
    if (!canSubmit(id)) return patch({ modal: null });
    patch({
      modal: null,
      submission: {
        fitId: id,
        rationale: S.rationale.trim(),
        status: "submitting",
        requestId: "APP-" + Date.now(),
        nextAt: Date.now() + 2000,
      },
    });
  };

  const setTrackOpen = (open: boolean) => {
    window.clearTimeout(trackT.current);
    setTrackSettled(false);
    setDd(null);
    patch({ trackOpen: open, trackErr: "" });
    if (open) trackT.current = window.setTimeout(() => setTrackSettled(true), 240);
  };

  const scrollToTrack = () => {
    const el = trackRef.current;
    if (!el) return;
    let p = el.parentElement;
    while (p && p !== document.body) {
      const cs = getComputedStyle(p);
      if (/(auto|scroll)/.test(cs.overflowY) && p.scrollHeight > p.clientHeight) break;
      p = p.parentElement;
    }
    const r = el.getBoundingClientRect();
    if (p && p !== document.body) {
      const pr = p.getBoundingClientRect();
      p.scrollTo({ top: p.scrollTop + r.top - pr.top - 160, behavior: "smooth" });
    } else window.scrollTo({ top: window.scrollY + r.top - 160, behavior: "smooth" });
  };

  const addVariant = () => {
    if (locked()) return;
    const d = S.draft;
    const err = validateVariant(d, S.variants);
    if (err) return patch({ trackErr: err });
    const c = String(d.chromosome).replace(/^chr/i, "");
    const location =
      `chr${c}:${d.position}` +
      (d.type === "SNV"
        ? ` ${String(d.ref).toUpperCase()} > ${String(d.alt).toUpperCase()}`
        : d.type === "CNV"
          ? `–${d.end}`
          : ` → chr${String(d.partnerChromosome).replace(/^chr/i, "")}:${d.partnerPosition}`);
    const row: Variant = {
      ...d,
      chromosome: d.chromosome ?? "",
      position: d.position ?? "",
      id: `manual-${S.seq}`,
      label: String(d.label || "").trim().slice(0, 80) || location,
      location,
      classification: "Unclassified",
      resultStatus: "calculating",
      nextAt: Date.now() + 1500,
      resultOutcome: "ready",
    };
    setTrackSettled(false);
    patch({ variants: [...S.variants, row], seq: S.seq + 1, trackOpen: false, draft: { type: "SNV", build: "GRCh38" }, trackErr: "" });
    toast("Variant added.");
  };

  const openPreview = (id: PreviewStateId) => {
    setDd(null);
    setS(previewState(id));
  };

  const noticeAction = (kind: "refresh" | "check" | "recovery" | "retry" | "complete" | "impact") => {
    const sub = S.submission;
    if (kind === "refresh")
      patch(
        S.externalClosed
          ? { stale: false, closed: true, externalClosed: false }
          : { stale: false, currentFitId: "FIT-003", leftFitId: "FIT-003", rightFitId: "FIT-001" },
      );
    if (kind === "check" && sub) patch({ submission: { ...sub, status: "checking", checkAt: Date.now() + 1500 } });
    if (kind === "recovery") patch({ modal: { kind: "recovery" } });
    if (kind === "retry" && sub) openReview(sub.fitId);
    if (kind === "complete" && sub) patch({ submission: { ...sub, nextAt: Date.now() } });
    if (kind === "impact") patch({ modal: { kind: "impact" } });
  };

  const closeModal = () => patch({ modal: null });

  /* ── derived view data ── */
  const ready = S.fits.filter((f) => f.status === "ready");
  const sub = S.submission;
  const unconfirmed = ["unknown", "checking", "recovery"].includes(sub?.status ?? "");
  const curLabel = ["unknown", "checking"].includes(sub?.status ?? "") ? "Last confirmed" : "Current";
  const trackDisabled = locked();

  let notice: Notice | null = null;
  if (S.stale)
    notice = S.externalClosed
      ? { title: "Curation was closed by another user", desc: "Refresh the case to view the locked fit. Your exploration cannot be applied.", tone: "warning", action: "Refresh case", onAction: () => noticeAction("refresh") }
      : { title: "This case has changed", desc: "Another curator applied a fit while you were exploring. Refresh and compare against the updated case before applying.", tone: "warning", action: "Refresh case", onAction: () => noticeAction("refresh") };
  else if (sub && (sub.status === "unknown" || sub.status === "checking"))
    notice = {
      title: sub.status === "checking" ? "Checking application status…" : "Connection lost after application request",
      desc: `Request ${sub.requestId} · ${sub.fitId}. The server may still be applying this fit. The values below are the last confirmed case data. Further changes are paused until the outcome is known.`,
      tone: "warning",
      ...(sub.status === "checking"
        ? { pending: "Checking existing request…" }
        : { action: "Check application status", onAction: () => noticeAction("check") }),
    };
  else if (sub?.status === "recovery")
    notice = { title: "Application requires recovery", desc: `Request ${sub.requestId} · ${sub.fitId}. Updates stopped partway through. Contact bioinformatics with the request reference; further changes are paused.`, tone: "warning", action: "View recovery details", onAction: () => noticeAction("recovery") };
  else if (!S.applyAllowed)
    notice = { title: "You can explore fits, but cannot apply them", desc: "You can generate fits, track variants and compare results. Applying a fit requires an authorised curator.", tone: "warning" };
  else if (sub?.status === "submitting")
    notice = { title: `Applying ${sub.fitId}`, desc: "Updating case files and data. The current fit remains active until completion. Editing and generation are paused.", tone: "info", action: "Show completion", onAction: () => noticeAction("complete") };
  else if (sub?.status === "failed")
    notice = { title: "Fit could not be applied", desc: "The current case fit is unchanged. Review the selected fit and retry.", tone: "warning", action: "Review and retry", onAction: () => noticeAction("retry") };
  else if (sub?.status === "submitted")
    notice = { title: `${sub.fitId} is now the current case fit`, desc: "The reference shows the updated case. The previous fit remains available for comparison.", tone: "success", ...(S.reviewRequired ? { action: "Review affected information", onAction: () => noticeAction("impact") } : {}) };
  else if (S.previewState === "returning")
    notice = { title: "Your fit is still running", desc: "The request has been restored. You can continue reviewing the current case while results are prepared.", tone: "neutral" };

  const jobs = S.fits
    .filter((f) => f.status !== "ready")
    .map((f) => {
      const active = ACTIVE.includes(f.status);
      const desc =
        f.status === "noFit" ? "No valid fit was found within these bounds. Adjust the constraints and try again."
        : f.status === "failed" ? "Run failed. Retry with the same constraints."
        : f.status === "cancelled" ? "Cancelled. No outputs were produced."
        : f.status === "preparing" ? "Preparing inputs…"
        : f.status === "fitting" ? "Generating fit outputs…"
        : "Waiting to start…";
      return {
        f,
        active,
        desc,
        tone: active ? styles.jobActive : f.status === "failed" ? styles.jobFailed : styles.jobIdle,
        action: active ? "Cancel run" : f.status === "noFit" ? "Adjust bounds" : "Retry",
        enabled: active || canGen(),
        onAction: active
          ? () => {
              patch((s) => ({ fits: s.fits.map((x) => (x.id === f.id ? { ...x, status: "cancelled" } : x)) }));
              toast(`${f.id} cancelled. No outputs were produced.`);
            }
          : () => openNew(f),
      };
    });

  const hasAlt = ready.some((f) => f.id !== S.currentFitId);
  const running = S.fits.some((f) => ACTIVE.includes(f.status));
  const sideFits = [fit(S.leftFitId), fit(S.rightFitId)] as const;
  const per = plotDensity === "compact" ? 2 : 1;

  const tCols = `minmax(200px,1.3fr) minmax(200px,1.3fr) 110px 160px repeat(${ready.length},minmax(152px,1fr))`;
  const tMinW = 220 + 220 + 110 + 160 + 152 * ready.length;

  /* ── renderers ── */
  const renderHead = (side: "left" | "right") => {
    const headLabel = side === "left" ? "Reference fit" : "Comparison fit";
    if (side === "right" && !hasAlt) {
      return (
        <div className={styles.headCard} key={side}>
          <div className={styles.headTop}>
            <Overline>{headLabel}</Overline>
          </div>
          <div className={styles.headEmpty}>
            <span className={styles.headEmptyIcon} aria-hidden="true">
              {running ? <Clock size={24} strokeWidth={1.6} /> : <Layers size={24} strokeWidth={1.6} />}
            </span>
            <div className={styles.stack2}>
              <strong className={styles.medium}>{running ? "Your first alternative fit is running" : "No alternative fits yet"}</strong>
              <span className={styles.caption}>
                {!running
                  ? EMPTY_CMP_DESC
                  : S.warm
                    ? "New fits usually take about 1 minute."
                    : "The first refit usually takes about 8 minutes while the data is prepared. Further fits usually take about 1 minute."}
              </span>
            </div>
          </div>
        </div>
      );
    }
    const id = side === "left" ? S.leftFitId : S.rightFitId;
    const f = fit(id);
    const isCur = !!f && f.id === S.currentFitId;
    const can = !!f && !isCur && canSubmit(f.id);
    const key = side === "left" ? "leftFitId" : "rightFitId";
    const options: DropOption[] = ready.map((o) => ({
      key: o.id,
      label: o.name,
      id: o.id,
      selected: o.id === id,
      onSelect: () => {
        patch({ [key]: o.id } as Partial<FittingState>);
        setDd(null);
      },
    }));
    if (side === "right")
      options.unshift({ key: "none", label: "Select a fit", selected: !id, muted: true, onSelect: () => { patch({ rightFitId: "" }); setDd(null); } });

    return (
      <div className={styles.headCard} key={side}>
        <div className={styles.headTop}>
          <Overline>{headLabel}</Overline>
          {f ? <span className={cx(styles.statusTag, isCur ? styles.statusTagCurrent : styles.statusTagReady)}>{isCur ? curLabel : "Ready"}</span> : null}
          <span className={styles.spacer} />
          {side === "right" && f ? (
            <Button variant="outline" size="sm" disabled={!can} onClick={() => openReview(f.id)} endIcon={<ArrowRight size={16} strokeWidth={1.8} />}>
              Apply fit
            </Button>
          ) : null}
        </div>
        <div className={styles.headBody}>
          <div className={styles.headSelect}>
            <Dropdown
              ariaLabel={`${headLabel}: ${f ? f.name : "none selected"}`}
              open={dd === side}
              onToggle={() => setDd(dd === side ? null : side)}
              onClose={() => setDd(null)}
              label={f ? f.name : "Select a fit"}
              id={f?.id}
              options={options}
            />
          </div>
          <div className={styles.metrics}>
            <div className={cx(styles.stack2, styles.metricPurity)}>
              <Overline>Purity</Overline>
              <span className={styles.metricValue}>{f ? `${f.purity}%` : ""}</span>
            </div>
            <div className={styles.stack2}>
              <Overline>Ploidy</Overline>
              <span className={styles.metricValue}>{f ? num(f.ploidy) : ""}</span>
            </div>
          </div>
        </div>
        <div className={styles.consRow}>
          <span className={styles.caption}>Constraints</span>
          {f ? consChips(f).map((t) => <span key={t} className={styles.consChip}>{t}</span>) : null}
        </div>
        {isCur && unconfirmed ? <span className={styles.srOnly}>Last confirmed case fit</span> : null}
      </div>
    );
  };

  const renderPlotCell = (k: PlotKey, f: Fit | undefined, side: "left" | "right") => {
    const key = `${k}-${side}`;
    const accent = side === "right" ? "green" : undefined;
    let body: ReactNode;
    if (!f) body = <div className={cx(styles.plotBody, styles.plotBlank)}>No comparison fit selected</div>;
    else if (!f.plots.includes(k))
      body = (
        <div className={cx(styles.plotBody, styles.plotMissing)}>
          <strong className={styles.medium}>Plot not available</strong>
          <span className={styles.caption}>{`${PLOTS[k]} is not available for ${f.id}.`}</span>
        </div>
      );
    else {
      const src = plotSrc(k, f);
      body = (
        <div
          role="img"
          aria-label={`${PLOTS[k]} — ${f.id}`}
          className={styles.plotImg}
          style={{ backgroundImage: `url("${src}")`, backgroundPosition: k === "clonality" ? "left center" : "center" }}
          onClick={() => patch({ modal: { kind: "zoom", k, id: f.id } })}
        />
      );
    }
    return (
      <div className={styles.plotCard} key={key}>
        <div className={styles.plotHead}>
          <span className={styles.plotTitle}>{PLOTS[k]}</span>
          {f ? <IdTag accent={accent}>{f.id}</IdTag> : null}
          <span className={styles.spacer} />
          {f && f.plots.includes(k) ? (
            <button
              type="button"
              className={styles.expandBtn}
              aria-label={`Expand ${PLOTS[k]} for ${f.id}`}
              title="Expand"
              onClick={() => patch({ modal: { kind: "zoom", k, id: f.id } })}
            >
              <Maximize2 size={16} strokeWidth={1.2} aria-hidden="true" />
            </button>
          ) : null}
        </div>
        {body}
      </div>
    );
  };

  const plotRows: PlotKey[][] = [];
  for (let i = 0; i < S.visiblePlots.length; i += per) plotRows.push(S.visiblePlots.slice(i, i + per));

  const togglePlot = (k: PlotKey) =>
    patch((s) => {
      const on = s.visiblePlots.includes(k);
      return { visiblePlots: ALL_PLOTS.filter((x) => (x === k ? !on : s.visiblePlots.includes(x))) };
    });

  const clsTone = (c: string) => {
    const k = c.split(" ")[0];
    return k === "C5" || k === "C4" ? styles.clsDanger : k === "C3" ? styles.clsSuccess : styles.clsNeutral;
  };

  const renderVariantCell = (r: Variant, f: Fit) => {
    const cmp = f.id === S.rightFitId;
    let content: ReactNode;
    if (r.resultStatus === "calculating")
      content = <DnaLoader scale={0.2} size="sm" label="Calculating…" className={styles.cellLoader} />;
    else if (r.resultStatus === "notFound") content = <span className={styles.cellMuted}>Not found in this fit</span>;
    else if (r.resultStatus === "failed")
      content = (
        <>
          <span className={styles.cellMuted}>Calculation failed</span>
          {!locked() ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                patch((s) => ({
                  variants: s.variants.map((x) =>
                    x.id === r.id ? { ...x, resultStatus: "calculating", nextAt: Date.now() + 1500, resultOutcome: "ready" } : x,
                  ),
                }))
              }
            >
              Retry
            </Button>
          ) : null}
        </>
      );
    else if (f.variantValues[r.id] == null) content = <span className={styles.cellMuted}>Not available</span>;
    else content = <span className={styles.cellValue}>{f.variantValues[r.id]}</span>;
    return (
      <div role="cell" key={f.id} className={cx(styles.td, styles.tdFit, cmp && styles.tdCompare)}>
        {content}
      </div>
    );
  };

  /* track variant form */
  const D = S.draft;
  const setDraft = (k: keyof VariantDraft, v: string) => patch((s) => ({ draft: { ...s.draft, [k]: v } }));
  const trackFields: Array<[keyof VariantDraft, string, string]> = [
    ["label", "Display name (optional)", "e.g. BRAF"],
    ["chromosome", "Chromosome", "e.g. 7"],
    ["position", "Position / start", "e.g. 140753336"],
    ...(D.type === "SNV"
      ? ([["ref", "Reference allele", "A"], ["alt", "Alternate allele", "T"]] as Array<[keyof VariantDraft, string, string]>)
      : D.type === "CNV"
        ? ([["end", "End position", "e.g. 140753500"]] as Array<[keyof VariantDraft, string, string]>)
        : ([["partnerChromosome", "Partner chromosome", "e.g. 7"], ["partnerPosition", "Partner position", "e.g. 138866488"]] as Array<[keyof VariantDraft, string, string]>)),
  ];
  const trackSelects: Array<{ key: "type" | "build"; label: string; values: string[] }> = [
    { key: "type", label: "Variant type", values: ["SNV", "CNV", "SV"] },
    { key: "build", label: "Reference build", values: ["GRCh38", "GRCh37"] },
  ];

  /* modal */
  const M = S.modal;
  const impactDone = IMPACT.every(([k]) => S.impact[k]);
  let modalTitle = "";
  let modalSub = "";
  let modalBody: ReactNode = null;
  let modalFooter: ReactNode = null;
  if (M?.kind === "new") {
    modalTitle = "Create a new fit";
    modalSub = "Set optional purity and ploidy bounds.";
    const field = (k: keyof NewFitForm) => ({
      value: S.form[k],
      errorText: S.errs[k],
      onChange: (e: { target: { value: string } }) => {
        const v = e.target.value;
        patch((s) => ({ form: { ...s.form, [k]: v } }));
      },
    });
    modalBody = (
      <div className={styles.stack16}>
        {S.formErr ? <FormAlert>{S.formErr}</FormAlert> : null}
        <Input label="Fit name" placeholder="e.g. Lower-purity exploration" {...field("name")} />
        {(
          [
            ["Purity", "percentage", "minPurity", "maxPurity"],
            ["Ploidy", "copy number", "minPloidy", "maxPloidy"],
          ] as const
        ).map(([title, unit, lo, hi]) => (
          <fieldset key={title} className={styles.boundGroup}>
            <legend className={styles.boundLegend}>
              {title}
              <span className={styles.boundUnit}> · {unit}</span>
            </legend>
            <div className={styles.twoCol}>
              <Input label="Minimum" inputMode="decimal" placeholder="Unconstrained" {...field(lo)} />
              <Input label="Maximum" inputMode="decimal" placeholder="Unconstrained" {...field(hi)} />
            </div>
          </fieldset>
        ))}
        <p className={styles.caption}>Leave a bound empty to keep it unconstrained.</p>
        <div className={styles.runtime}>
          <strong className={styles.runtimeTitle}>
            <Clock size={20} strokeWidth={2} aria-hidden="true" />
            Estimated runtime: {S.warm ? "about 1 minute" : "about 8 minutes"}
          </strong>
          <p className={cx(styles.caption, styles.runtimeNote)}>
            {S.warm
              ? "Queue time may add to this."
              : "Intermediate files need preparing, so this run usually takes about 8 minutes. Queue time may add to this."}
          </p>
        </div>
      </div>
    );
    modalFooter = <ModalFooter secondaryAction={{ label: "Cancel", onClick: closeModal }} primaryAction={{ label: "Generate fit", onClick: submitNew }} />;
  } else if (M?.kind === "zoom") {
    const f = fit(M.id);
    modalTitle = PLOTS[M.k];
    modalSub = f ? `${f.name} · ${f.id}` : "";
    modalBody = f ? (
      <div role="img" aria-label={modalTitle} className={styles.zoomImg} style={{ backgroundImage: `url("${plotSrc(M.k, f)}")` }} />
    ) : (
      <p className={styles.zoomEmpty}>No image supplied for this plot.</p>
    );
    modalFooter = <ModalFooter secondaryAction={{ label: "Close", onClick: closeModal }} />;
  } else if (M?.kind === "review") {
    const cur = fit(S.currentFitId);
    const nx = fit(M.id);
    modalTitle = "Review fit before applying";
    modalSub = "Check the selected fit before applying it to the case.";
    modalBody =
      cur && nx ? (
        <div className={styles.stack16}>
          <div className={styles.twoCol}>
            {([[cur, "Current fit", false], [nx, "Proposed fit", true]] as const).map(([f, label, alt]) => (
              <div key={label} className={cx(styles.reviewCard, alt && styles.reviewCardAlt)}>
                <Overline>{label}</Overline>
                <strong className={styles.medium}>{f.name}</strong>
                <span className={styles.caption}>{f.id}</span>
                <span className={styles.reviewValue}>{`${f.purity}% / ${num(f.ploidy)}`}</span>
                <span className={styles.caption}>Purity / ploidy</span>
              </div>
            ))}
          </div>
          <p className={styles.caption}>
            {`Change: ${((nx.purity ?? 0) - (cur.purity ?? 0)).toFixed(1)} percentage points purity · ${((nx.ploidy ?? 0) - (cur.ploidy ?? 0)).toFixed(2)} ploidy.`}
          </p>
          <p className={styles.bodyText}>Applying this fit will replace the current fit and its associated case data.</p>
          <Textarea
            label="Reason for choosing this fit"
            maxLength={1000}
            placeholder="Summarise the evidence reviewed…"
            value={S.rationale}
            errorText={S.formErr || undefined}
            onChange={(e) => {
              const v = e.target.value;
              patch({ rationale: v, formErr: "" });
            }}
          />
        </div>
      ) : null;
    modalFooter = <ModalFooter secondaryAction={{ label: "Keep exploring", onClick: closeModal }} primaryAction={{ label: "Apply fit", onClick: submitReview }} />;
  } else if (M?.kind === "impact") {
    modalTitle = "Review affected case information";
    modalSub = "Proposed checklist — affected areas need team confirmation.";
    modalBody = (
      <div className={styles.stack12}>
        <p className={styles.bodyText}>
          Current fit: <strong className={styles.medium}>{S.currentFitId}</strong>. This preview does not change classifications, comments or reports.
        </p>
        {IMPACT.map(([k, title, desc]) => (
          <div key={k} className={cx(styles.impactItem, S.impact[k] && styles.impactItemOn)}>
            <Checkbox
              checked={!!S.impact[k]}
              onChange={() => patch((s) => ({ impact: { ...s.impact, [k]: !s.impact[k] } }))}
              label={
                <span className={styles.impactText}>
                  <strong className={styles.medium}>{title}</strong>
                  <span className={styles.caption}>{desc}</span>
                </span>
              }
            />
          </div>
        ))}
      </div>
    );
    modalFooter = (
      <ModalFooter
        secondaryAction={{ label: "Review later", onClick: closeModal }}
        primaryAction={{
          label: "Complete review",
          disabled: !impactDone,
          onClick: () => {
            patch({ modal: null, reviewRequired: false });
            toast("Review completed. No external records were changed.");
          },
        }}
      />
    );
  } else if (M?.kind === "recovery") {
    modalTitle = "Application recovery details";
    modalSub = "Share this reference with bioinformatics through your usual support channel.";
    modalBody = (
      <div className={styles.recovery}>
        <p>
          Case <strong className={styles.medium}>{patientId}</strong> · Request <strong className={styles.medium}>{sub?.requestId ?? ""}</strong>
        </p>
        <p>
          Selected fit: <strong className={styles.medium}>{sub?.fitId ?? ""}</strong>
        </p>
        <p>Rationale: {sub?.rationale || "Not provided"}</p>
        <p className={styles.textSecondary}>
          The application stopped after updates began. The active case version is unconfirmed. Further changes are paused until recovery is confirmed.
        </p>
      </div>
    );
    modalFooter = <ModalFooter secondaryAction={{ label: "Close", onClick: closeModal }} />;
  }

  const crumb = (label: string) =>
    onBack ? (
      <button type="button" className={styles.crumbLink} onClick={onBack}>
        {label}
      </button>
    ) : (
      <span className={styles.crumb}>{label}</span>
    );

  const gridStyle: CSSProperties = { gridTemplateColumns: `repeat(${per * 2},minmax(0,1fr))` };

  return (
    <div className={styles.page} data-screen-label="Fitting v2">
      <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
        {crumb(`Patient ${patientId}`)}
        <span aria-hidden="true">/</span>
        {crumb("Tumour profile")}
        <span aria-hidden="true">/</span>
        <span className={styles.crumbCurrent} aria-current="page">Fitting</span>
      </nav>

      <div className={styles.titleRow}>
        <h1 className={styles.h1}>Purity &amp; ploidy fitting</h1>
        <div className={styles.titleActions}>
          {jobs.map((j) => (
            <div key={j.f.id} title={j.desc} className={cx(styles.job, j.tone)}>
              <span className={styles.jobDot} aria-hidden="true" />
              <span className={styles.jobId}>{j.f.id}</span>
              <span className={styles.jobStatus}>{STATUS_LABEL[j.f.status]}</span>
              <button type="button" className={styles.jobAction} disabled={!j.enabled} onClick={j.onAction}>
                {j.action}
              </button>
            </div>
          ))}
          <Button
            variant="outline"
            disabled={trackDisabled}
            startIcon={<Plus size={20} strokeWidth={1.8} />}
            onClick={() => {
              if (locked()) return;
              setTrackOpen(true);
              window.setTimeout(scrollToTrack, 60);
            }}
          >
            Track variant
          </Button>
          <Button
            variant="bold"
            disabled={!canGen()}
            title={canGen() ? undefined : "New fits are unavailable while a run is active or curation is locked"}
            startIcon={<Plus size={20} strokeWidth={1.8} />}
            onClick={() => openNew()}
          >
            New fit
          </Button>
        </div>
      </div>

      {notice ? (
        <section role="status" className={cx(styles.notice, styles[`notice_${notice.tone}`])}>
          <div className={styles.noticeText}>
            <strong className={styles.noticeTitle}>{notice.title}</strong>
            <p className={styles.noticeDesc}>{notice.desc}</p>
          </div>
          {notice.action ? (
            <Button variant="text" size="sm" className={styles.noticeAction} onClick={notice.onAction}>
              {notice.action}
            </Button>
          ) : null}
          {notice.pending ? (
            <span className={styles.noticePending}>
              <DnaLoader scale={0.2} />
              {notice.pending}
            </span>
          ) : null}
        </section>
      ) : null}

      {S.closed ? (
        <div className={styles.closedBanner}>
          <Lock size={18} strokeWidth={1.35} aria-hidden="true" />
          <span>
            <strong className={styles.medium}>Curation is closed.</strong> This case is read-only. Fits and annotations are locked.
          </span>
        </div>
      ) : null}

      {S.loadState === "failed" ? (
        <div className={styles.loadPanel}>
          <h2 className={styles.h2}>Fit outputs could not be loaded</h2>
          <p className={styles.textTertiary}>The case outputs could not be retrieved. No case data has changed.</p>
          <Button variant="bold" onClick={() => patch({ loadState: "loading", loadNextAt: Date.now() + 1400 })}>
            Retry loading
          </Button>
        </div>
      ) : S.loadState === "loading" ? (
        <div className={cx(styles.loadPanel, styles.loadPanelBusy)}>
          <DnaLoader label="Loading fit outputs…" />
        </div>
      ) : (
        <>
          <div className={cx(styles.compare, stickyCompare && styles.compareSticky)}>
            <div className={styles.compareGrid}>
              {renderHead("left")}
              {renderHead("right")}
            </div>
            {S.rightFitId && S.leftFitId === S.rightFitId ? (
              <p className={cx(styles.caption, styles.sameFit)}>The same fit is selected on both sides. Choose another fit to compare differences.</p>
            ) : null}
          </div>

          <section aria-label="Plots" className={styles.plots}>
            <div className={styles.plotsHead}>
              <h2 className={styles.h2}>Plots</h2>
              <div role="group" aria-label="Visible plots" className={styles.plotToggles}>
                {ALL_PLOTS.map((k) => (
                  <Switch key={k} label={PLOTS[k]} checked={S.visiblePlots.includes(k)} onChange={() => togglePlot(k)} />
                ))}
              </div>
            </div>
            {S.visiblePlots.length ? (
              <div className={styles.plotRows}>
                {plotRows.map((row) => (
                  <div key={row.join("-")} className={styles.plotGrid} style={gridStyle}>
                    {row.flatMap((k) => [renderPlotCell(k, sideFits[0], "left"), renderPlotCell(k, sideFits[1], "right")])}
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.noPlots}>All plots are hidden. Select a plot above to show it.</p>
            )}
          </section>

          <section aria-label="Variant and gene copy number comparison" className={styles.tableCard}>
            <div className={styles.tableHead}>
              <h2 className={styles.h2}>Variant and gene copy number</h2>
              <span className={styles.countPill}>{S.variants.length}</span>
              <span className={cx(styles.caption, styles.tableHint)}>Use the eye icon to set the comparison fit</span>
            </div>
            <div className={styles.tableScroll}>
              <div role="table" style={{ minWidth: tMinW }}>
                <div role="row" className={cx(styles.tr, styles.thead)} style={{ gridTemplateColumns: tCols }}>
                  {["Variant", "Variant info", "Variant type", "Pathclass"].map((h) => (
                    <div role="columnheader" key={h} className={styles.th}>
                      {h}
                    </div>
                  ))}
                  {ready.map((f) => {
                    const ref = f.id === S.leftFitId;
                    const on = ref || f.id === S.rightFitId;
                    const title = ref
                      ? `${f.id} is the reference; change it with the left dropdown`
                      : `${on ? "Hide" : "Show"} ${f.id} in the right comparison`;
                    return (
                      <div role="columnheader" key={f.id} className={cx(styles.thFit, f.id === S.rightFitId && styles.thFitCompare)}>
                        <div className={styles.thFitText}>
                          <strong className={styles.thFitId}>{f.id}</strong>
                          <span>{f.id === S.currentFitId ? curLabel : f.id === "FIT-001" ? "Pipeline default" : "Refit"}</span>
                          <span className={styles.thFitVals}>{`${f.purity}% · ${num(f.ploidy)}`}</span>
                        </div>
                        <button
                          type="button"
                          aria-pressed={on}
                          aria-label={title}
                          title={title}
                          className={cx(styles.eyeBtn, on && styles.eyeOn, ref && styles.eyeRef)}
                          onClick={ref ? undefined : () => patch({ rightFitId: f.id === S.rightFitId ? "" : f.id })}
                        >
                          {on ? <Eye size={18} strokeWidth={1.8} aria-hidden="true" /> : <EyeOff size={18} strokeWidth={1.8} aria-hidden="true" />}
                        </button>
                      </div>
                    );
                  })}
                </div>
                {S.variants.map((r) => (
                  <div role="row" key={r.id} className={cx(styles.tr, styles.trBody)} style={{ gridTemplateColumns: tCols }}>
                    <div role="cell" className={cx(styles.td, styles.tdLabel)}>{r.label}</div>
                    <div role="cell" className={cx(styles.td, styles.tdLoc)}>{r.location}</div>
                    <div role="cell" className={styles.td}>{r.type}</div>
                    <div role="cell" className={cx(styles.td, styles.tdCls)}>
                      <span className={cx(styles.clsPill, clsTone(r.classification))}>{r.classification}</span>
                    </div>
                    {ready.map((f) => renderVariantCell(r, f))}
                  </div>
                ))}
              </div>
            </div>

            <div ref={trackRef}>
              <button
                type="button"
                aria-expanded={S.trackOpen}
                disabled={trackDisabled}
                className={styles.trackToggle}
                onClick={() => !locked() && setTrackOpen(!S.trackOpen)}
              >
                <span className={styles.trackToggleLabel}>
                  <Plus size={20} strokeWidth={1.8} aria-hidden="true" />
                  Track variant
                </span>
                <ChevronDown size={18} strokeWidth={1.8} className={cx(styles.chev, S.trackOpen && styles.chevOpen)} aria-hidden="true" />
              </button>
              <div
                aria-hidden={!S.trackOpen}
                {...({ inert: S.trackOpen ? undefined : "" } as Record<string, string | undefined>)}
                className={cx(styles.trackCollapse, S.trackOpen && styles.trackCollapseOpen)}
              >
                <div className={cx(styles.trackClip, S.trackOpen && trackSettled && styles.trackClipSettled)}>
                  <div role="region" aria-label="Track variant" className={styles.trackForm}>
                    {S.trackErr ? (
                      <div role="alert" className={styles.trackErr}>
                        {S.trackErr}
                      </div>
                    ) : null}
                    <div className={styles.trackGrid}>
                      {trackSelects.map((ts) => (
                        <div key={ts.key} className={styles.trackField}>
                          <span>{ts.label}</span>
                          <Dropdown
                            compact
                            ariaLabel={ts.label}
                            open={dd === ts.key}
                            onToggle={() => setDd(dd === ts.key ? null : ts.key)}
                            onClose={() => setDd(null)}
                            label={D[ts.key]}
                            options={ts.values.map((v) => ({
                              key: v,
                              label: v,
                              selected: D[ts.key] === v,
                              onSelect: () => {
                                patch((s) => ({ draft: { ...s.draft, [ts.key]: ts.key === "type" ? (v as VariantType) : v }, trackErr: "" }));
                                setDd(null);
                              },
                            }))}
                          />
                        </div>
                      ))}
                      {trackFields.map(([name, label, ph]) => (
                        <label key={name} className={styles.trackField}>
                          <span className={styles.ellipsis}>{label}</span>
                          <input
                            className={styles.trackInput}
                            value={D[name] ?? ""}
                            placeholder={ph}
                            onChange={(e) => setDraft(name, e.target.value)}
                          />
                        </label>
                      ))}
                    </div>
                    <div className={styles.trackActions}>
                      <Button variant="subtle" size="sm" onClick={() => setTrackOpen(false)}>
                        Cancel
                      </Button>
                      <Button variant="bold" size="sm" onClick={addVariant}>
                        Add variant
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {showPreviewStates ? (
        <>
          {pcOpen ? (
            <>
              <div className={styles.pcScrim} onClick={() => setPcOpen(false)} />
              <div role="dialog" aria-label="Prototype controls" className={styles.pcPanel}>
                <div className={styles.pcHead}>
                  <div className={styles.stack2}>
                    <strong className={styles.medium}>Prototype controls</strong>
                    <span className={styles.caption}>Testing only. Select a state to reset the demo.</span>
                  </div>
                  <button type="button" aria-label="Close prototype controls" className={styles.pcClose} onClick={() => setPcOpen(false)}>
                    <X size={18} strokeWidth={1.8} aria-hidden="true" />
                  </button>
                </div>
                <div className={styles.pcBody}>
                  {PREVIEW_GROUPS.map((g) => (
                    <div key={g.title} className={styles.pcGroup}>
                      <Overline>{g.title}</Overline>
                      <div className={styles.pcItems}>
                        {g.items.map(([id, label]) => (
                          <button
                            type="button"
                            key={id}
                            aria-pressed={S.previewState === id}
                            className={cx(styles.pcItem, S.previewState === id && styles.pcItemOn)}
                            onClick={() => openPreview(id)}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : null}
          <button
            type="button"
            aria-expanded={pcOpen}
            className={cx(styles.pcToggle, pcOpen && styles.pcToggleOpen)}
            onClick={() => setPcOpen((o) => !o)}
          >
            <SlidersHorizontal size={18} strokeWidth={1.8} aria-hidden="true" />
            Prototype controls
            {S.previewState ? <span className={styles.pcState}>{previewLabel(S.previewState)}</span> : null}
          </button>
        </>
      ) : null}

      <Modal
        open={!!M}
        onClose={closeModal}
        title={modalTitle}
        size="sm"
        className={M?.kind === "zoom" ? undefined : styles.modalNarrow}
        footer={modalFooter}
      >
        <div className={styles.stack16}>
          <p className={styles.modalSub}>{modalSub}</p>
          {modalBody}
        </div>
      </Modal>

      {toastMsg ? (
        <div role="status" className={styles.toast}>
          {toastMsg}
        </div>
      ) : null}
    </div>
  );
}

