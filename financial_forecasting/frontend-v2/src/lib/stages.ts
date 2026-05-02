/**
 * Stage helpers — no mapping. Show the real SF StageName everywhere; for
 * functional categorization (open / won / lost) defer to SF's own
 * IsClosed + IsWon flags rather than guessing from the stage string.
 *
 * (Per JP 2026-05-02: "no stage mapping; we'll clean up the SF picklist
 * itself later." This file is intentionally thin.)
 */

import type { SfOpportunity } from "@/types/salesforce";

export function isOpen(o: Pick<SfOpportunity, "IsClosed">): boolean {
  // IsClosed === false means open. If the API didn't return the flag
  // (defensive: legacy callers), fall back to a string check.
  return o.IsClosed === false || o.IsClosed == null;
}

export function isWon(o: Pick<SfOpportunity, "IsClosed" | "IsWon">): boolean {
  return o.IsClosed === true && o.IsWon === true;
}

export function isLost(o: Pick<SfOpportunity, "IsClosed" | "IsWon">): boolean {
  return o.IsClosed === true && o.IsWon === false;
}

export type StageStatus = "open" | "won" | "lost";

export function stageStatus(o: Pick<SfOpportunity, "IsClosed" | "IsWon">): StageStatus {
  if (!o.IsClosed) return "open";
  return o.IsWon ? "won" : "lost";
}

/**
 * Real SF picklist values — used by edit dropdowns. Order tracks the
 * funnel position. **These are the literal SF strings**, not bucket
 * labels. If SF adds a new stage, append it here (or fetch the picklist
 * from the API once we wire that up).
 */
export const SF_STAGE_OPTIONS: { value: string; label: string }[] = [
  { value: "New Lead", label: "New Lead" },
  { value: "Identified", label: "Identified" },
  { value: "Lead Gen", label: "Lead Gen" },
  { value: "Qualifying", label: "Qualifying" },
  { value: "Discovery", label: "Discovery" },
  { value: "Cultivation", label: "Cultivation" },
  { value: "Solicitation", label: "Solicitation" },
  { value: "Ask", label: "Ask" },
  { value: "Design / Proposal Creation", label: "Design / Proposal Creation" },
  { value: "Proposal Sent", label: "Proposal Sent" },
  { value: "Proposal Negotiation", label: "Proposal Negotiation" },
  { value: "Verbal Commitment", label: "Verbal Commitment" },
  { value: "Contract Creation", label: "Contract Creation" },
  { value: "Contract Signing", label: "Contract Signing" },
  { value: "Contract Signed", label: "Contract Signed" },
  { value: "Closed Won", label: "Closed Won" },
  { value: "Closed / Completed", label: "Closed / Completed" },
  { value: "Closed / Fulfilled", label: "Closed / Fulfilled" },
  { value: "Closed / Full-Time or Successful Conversion", label: "Closed / Full-Time or Successful Conversion" },
  { value: "Closed / Temporary Hire", label: "Closed / Temporary Hire" },
  { value: "Collecting", label: "Collecting" },
  { value: "Collecting / In Effect", label: "Collecting / In Effect" },
  { value: "In Effect", label: "In Effect" },
  { value: "Closed Lost", label: "Closed Lost" },
  { value: "Closed / Did not Fulfill", label: "Closed / Did not Fulfill" },
  { value: "Closed / Contract or Agreement But No Fellows Hired", label: "Closed / Contract or Agreement But No Fellows Hired" },
  { value: "Withdrawn", label: "Withdrawn" },
];
