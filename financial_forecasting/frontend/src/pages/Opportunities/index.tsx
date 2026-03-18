/**
 * Opportunities page — re-exports the main component.
 *
 * The monolithic Opportunities.tsx has been decomposed into:
 *  - helpers.ts:            pure utility functions + Opportunity interface
 *  - useOpportunityData.ts: data fetching hook (queries, mutations, derived state)
 *  - columns.tsx:           DataGrid column definitions
 *  - EditCells.tsx:         Autocomplete edit cells (Account, Owner)
 *  - SummaryCards.tsx:      metric cards above the grid
 *  - ../Opportunities.tsx:  orchestrator component (layout + wiring)
 *  - index.tsx:             barrel export (this file)
 */
export { default } from '../Opportunities';
