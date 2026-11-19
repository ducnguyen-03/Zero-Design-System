import type { HTMLAttributes, ReactNode } from "react";
import { Check } from "lucide-react";
import styles from "./Stepper.module.css";

export type StepperOrientation = "horizontal" | "vertical";
export type StepStatus = "complete" | "current" | "upcoming";

export interface StepperStep {
  label: ReactNode;
  /** Optional helper line under the label. */
  description?: ReactNode;
}

export interface StepperProps extends Omit<HTMLAttributes<HTMLOListElement>, "children"> {
  steps: StepperStep[];
  /** Zero-based index of the current step. Steps before it are complete.
   *  Pass `steps.length` (or more) to mark every step complete (Figma "Completed"). */
  currentStep: number;
  /** Figma lays the "Vertical Stepper" set out in a row; `vertical` stacks the steps. */
  orientation?: StepperOrientation;
  /** Screen-reader status wording. */
  statusLabels?: Partial<Record<StepStatus, string>>;
}

const cx = (...parts: Array<string | false | undefined>) =>
  parts.filter(Boolean).join(" ");

const DEFAULT_STATUS: Record<StepStatus, string> = {
  complete: "Completed",
  current: "Current step",
  upcoming: "Not started",
};

export function Stepper({
  steps,
  currentStep,
  orientation = "horizontal",
  statusLabels,
  className,
  "aria-label": ariaLabel = "Progress",
  ...rest
}: StepperProps) {
  const status = { ...DEFAULT_STATUS, ...statusLabels };
  const hasDescription = steps.some((s) => s.description != null);

  return (
    <ol
      className={cx(
        styles.stepper,
        styles[orientation],
        hasDescription && styles.hasDescription,
        className,
      )}
      aria-label={ariaLabel}
      {...rest}
    >
      {steps.map((step, i) => {
        const state: StepStatus =
          i < currentStep ? "complete" : i === currentStep ? "current" : "upcoming";
        const isLast = i === steps.length - 1;
        return (
          <li
            key={i}
            className={cx(styles.step, styles[state])}
            aria-current={state === "current" ? "step" : undefined}
          >
            <div className={styles.content}>
              <span className={styles.indicator} aria-hidden="true">
                {state === "complete" ? (
                  <Check className={styles.tick} />
                ) : (
                  i + 1
                )}
              </span>
              <span>
                <span className={styles.label}>{step.label}</span>
                <span className={styles.srOnly}>, {status[state]}</span>
                {step.description != null ? (
                  <span className={styles.description}>{step.description}</span>
                ) : null}
              </span>
            </div>
            {isLast ? null : (
              <div className={styles.connector} aria-hidden="true">
                <div className={cx(styles.bar, i < currentStep && styles.barDone)} />
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
