/**
 * Stage bucketing — maps the live SF StageName values (22 distinct values
 * per `product/crm-architecture/canonical-definitions.md` §1) to the 7-bucket
 * display vocabulary used by the redesign.
 *
 * Per JP directive 2026-04-16: SF stages are sacred — we don't rewrite them
 * in SOQL. Buckets exist purely in the display layer.
 */

export type StageBucket =
  | "lead"
  | "qual"
  | "ask"
  | "prop"
  | "contract"
  | "won"
  | "lost";

export interface BucketMeta {
  bucket: StageBucket;
  label: string;
  className: string; // tailwind classes for the chip background + text
}

const BUCKET_META: Record<StageBucket, Pick<BucketMeta, "label" | "className">> = {
  lead: { label: "Lead", className: "bg-stage-lead text-stage-lead-ink" },
  qual: { label: "Qual", className: "bg-stage-qual text-stage-qual-ink" },
  ask: { label: "Ask", className: "bg-stage-ask text-stage-ask-ink" },
  prop: { label: "Prop", className: "bg-stage-prop text-stage-prop-ink" },
  contract: {
    label: "Contract",
    className: "bg-stage-contract text-stage-contract-ink",
  },
  won: { label: "Won", className: "bg-stage-won text-stage-won-ink" },
  lost: { label: "Lost", className: "bg-stage-lost text-stage-lost-ink" },
};

/**
 * Live SF StageName -> bucket. Order matters for "anything else" fallback.
 * Sourced from canonical-definitions.md §1 (live SF drift table) and the
 * F1 bucket plan in tasks/f1-stage-buckets-plan.md.
 */
const SF_STAGE_TO_BUCKET: Record<string, StageBucket> = {
  // Direct bucket strings (so callers can pass a bucket and get the chip)
  lead: "lead",
  qual: "qual",
  ask: "ask",
  prop: "prop",
  contract: "contract",
  won: "won",
  lost: "lost",

  // Identification / lead-gen
  "Lead Gen": "lead",
  "New Lead": "lead",
  "Identified": "lead",
  "identified": "lead",

  // Qualification
  "Qualifying": "qual",
  "qualified": "qual",
  "Discovery": "qual",

  // Ask / proposal-pre
  "Ask": "ask",
  "Cultivation": "ask",
  "Solicitation": "ask",

  // Proposal sent
  "Design / Proposal Creation": "prop",
  "Proposal Sent": "prop",
  "proposal-sent": "prop",
  "Proposal": "prop",
  "Proposal Negotiation": "prop",
  "in-negotiation": "prop",

  // Contract / verbal-commit
  "Contract Creation": "contract",
  "Negotiating Contract": "contract",
  "Contract Signing": "contract",
  "Contract Signed": "contract",
  "Verbal Commitment": "contract",
  "verbal-commit": "contract",

  // Won (incl. legacy "money in flight")
  "Closed Won": "won",
  "closed-won": "won",
  "Closed / Completed": "won",
  "Closed / Fulfilled": "won",
  "Collecting": "won",
  "Collecting / In Effect": "won",
  "In Effect": "won",
  "Closed / Full-Time or Successful Conversion": "won",
  "Closed / Temporary Hire": "won",

  // Lost / withdrawn
  "Closed Lost": "lost",
  "closed-lost": "lost",
  "Withdrawn": "lost",
  "Did not Fulfill": "lost",
  "Closed / Did not Fulfill": "lost",
  "Closed / Contract or Agreement But No Fellows Hired": "lost",
};

export function bucketForStage(sfStage: string | null | undefined): StageBucket {
  if (!sfStage) return "lead";
  // Exact match first
  const direct = SF_STAGE_TO_BUCKET[sfStage];
  if (direct) return direct;
  // Heuristic fallback for anything we missed
  const s = sfStage.toLowerCase();
  if (s.includes("won") || s.includes("collect") || s.includes("effect") ||
      s.includes("complete") || s.includes("fulfill") || s.includes("conversion") ||
      s.includes("hire")) return "won";
  if (s.includes("lost") || s.includes("withdrawn") || s.includes("did not")) return "lost";
  if (s.includes("contract") || s.includes("verbal") || s.includes("commit")) return "contract";
  if (s.includes("proposal") || s.includes("design") || s.includes("negoti")) return "prop";
  if (s.includes("ask") || s.includes("solicit") || s.includes("cultivat")) return "ask";
  if (s.includes("qual") || s.includes("discover")) return "qual";
  return "lead";
}

export function bucketMeta(bucket: StageBucket): BucketMeta {
  return { bucket, ...BUCKET_META[bucket] };
}

export const ALL_BUCKETS: StageBucket[] = [
  "lead",
  "qual",
  "ask",
  "prop",
  "contract",
  "won",
  "lost",
];

export const OPEN_BUCKETS: StageBucket[] = ["lead", "qual", "ask", "prop", "contract"];
export const CLOSED_BUCKETS: StageBucket[] = ["won", "lost"];

/** Real SF StageName values for dropdowns — ordered by funnel position. */
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
  { value: "Collecting", label: "Collecting" },
  { value: "Collecting / In Effect", label: "Collecting / In Effect" },
  { value: "In Effect", label: "In Effect" },
  { value: "Closed Lost", label: "Closed Lost" },
  { value: "Withdrawn", label: "Withdrawn" },
];
