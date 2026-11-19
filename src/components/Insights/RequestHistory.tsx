import type { HTMLAttributes, ReactNode } from "react";
import { StatusBadge } from "../Badge/Badge";
import type { BadgeVariant } from "../Badge/Badge";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableHeaderCell, TableRow } from "../Table/Table";
import styles from "./Insights.module.css";

const cx = (...parts: Array<string | false | undefined>) => parts.filter(Boolean).join(" ");

export type DataRequestStatus = "draft" | "submitted" | "under-review" | "approved" | "rejected" | "expired";

const STATUS: Record<DataRequestStatus, { label: string; variant: BadgeVariant }> = {
  draft: { label: "Draft", variant: "neutral" },
  submitted: { label: "Submitted", variant: "inverted" },
  "under-review": { label: "Under review", variant: "primary" },
  approved: { label: "Approved", variant: "success" },
  rejected: { label: "Rejected", variant: "danger" },
  expired: { label: "Expired", variant: "danger" },
};

export interface DataRequest {
  /** "DRS01". */
  id: string;
  purpose: ReactNode;
  /** Tier the request asks for: "T2 · Collaborator". */
  scope: ReactNode;
  submitted: string;
  expires: string;
  status: DataRequestStatus;
}

export interface RequestHistoryTableProps extends HTMLAttributes<HTMLDivElement> {
  requests: DataRequest[];
  /** Open one request. Makes the id a link-style button. */
  onOpen?: (request: DataRequest) => void;
}

/** Data access requests the user has made: purpose, the tier asked for, dates and status. */
export function RequestHistoryTable({ requests, onOpen, className, ...rest }: RequestHistoryTableProps) {
  return (
    <TableContainer className={cx(styles.history, className)} {...rest}>
      <Table caption="Request history" captionHidden>
        <TableHead>
          <TableRow>
            <TableHeaderCell>DRS ID</TableHeaderCell>
            <TableHeaderCell>Research purpose</TableHeaderCell>
            <TableHeaderCell>Data scope</TableHeaderCell>
            <TableHeaderCell>Submitted</TableHeaderCell>
            <TableHeaderCell>Expires</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {requests.map((r) => (
            <TableRow key={r.id}>
              <TableCell>
                {onOpen ? (
                  <button type="button" className={styles.requestId} onClick={() => onOpen(r)}>
                    {r.id}
                  </button>
                ) : (
                  <span className={styles.requestIdText}>{r.id}</span>
                )}
              </TableCell>
              <TableCell clamp={3} className={styles.purpose}>
                {r.purpose}
              </TableCell>
              <TableCell>
                <span className={styles.tierChip}>{r.scope}</span>
              </TableCell>
              <TableCell tone="secondary" className={styles.date}>
                {r.submitted}
              </TableCell>
              <TableCell tone="secondary" className={styles.date}>
                {r.expires}
              </TableCell>
              <TableCell>
                <StatusBadge variant={STATUS[r.status].variant}>{STATUS[r.status].label}</StatusBadge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
