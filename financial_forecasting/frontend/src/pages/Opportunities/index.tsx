/**
 * Opportunities page — re-exports the main component.
 *
 * The original monolithic Opportunities.tsx has been refactored:
 *  - helpers.ts:  pure utility functions (getStageColor, etc.) + Opportunity interface
 *  - index.tsx:   barrel export (this file)
 *  - ../Opportunities.tsx: main component (still exists for now; import paths unchanged)
 *
 * To complete the decomposition, the remaining large component can be further
 * split into OpportunityGrid, OpportunityFilters, and BulkOperations.
 */
export { default } from '../Opportunities';
