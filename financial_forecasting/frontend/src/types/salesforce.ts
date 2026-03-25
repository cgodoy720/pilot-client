/**
 * Pursuit's Salesforce types — single source of truth for the frontend.
 *
 * Stage values MUST match the custom picklist in the Salesforce org and the
 * OpportunityStage enum in financial_forecasting/models.py.
 */

// ── Opportunity Stages ──────────────────────────────────────────────────────

export const OPPORTUNITY_STAGES = [
  '--None--',
  'Lead Gen',
  'New Lead',
  'Qualifying',
  'Design / Proposal Creation',
  'Proposal Negotiation',
  'Contract Creation',
  'Negotiating Contract',
  'Collecting / In Effect',
  'Closed / Did not Fulfill',
  'Closed / Completed',
  'Closed Lost',
  'Withdrawn',
] as const;

export type OpportunityStage = (typeof OPPORTUNITY_STAGES)[number];

/** Per-stage colors: blue (early) → teal → green (closing) → dark green (won) → maroon (lost). */
export const STAGE_COLORS: Record<OpportunityStage, string> = {
  '--None--':                    '#9E9E9E',
  'Lead Gen':                    '#5c6bc0',
  'New Lead':                    '#42a5f5',
  'Qualifying':                  '#26c6da',
  'Design / Proposal Creation':  '#26a69a',
  'Proposal Negotiation':        '#66bb6a',
  'Contract Creation':           '#43a047',
  'Negotiating Contract':        '#388e3c',
  'Collecting / In Effect':      '#2e7d32',
  'Closed / Did not Fulfill':    '#7b1a2c',
  'Closed / Completed':          '#1b5e20',
  'Closed Lost':                 '#7b1a2c',
  'Withdrawn':                   '#8d6e63',
};

/** Pipeline-order index for sorting stages (lower = earlier in pipeline). */
export function stageIndex(stage: string): number {
  const idx = OPPORTUNITY_STAGES.indexOf(stage as OpportunityStage);
  return idx >= 0 ? idx : OPPORTUNITY_STAGES.length;
}

/** Get the hex color for a stage name; falls back to grey for unknown stages. */
export function getStageHexColor(stage: string): string {
  return STAGE_COLORS[stage as OpportunityStage] || '#9E9E9E';
}

export const OPEN_STAGES: readonly OpportunityStage[] = [
  'Lead Gen',
  'New Lead',
  'Qualifying',
  'Design / Proposal Creation',
  'Proposal Negotiation',
  'Contract Creation',
  'Negotiating Contract',
];

export const COLLECTING_STAGES: readonly OpportunityStage[] = [
  'Collecting / In Effect',
];

export const CLOSED_STAGES: readonly OpportunityStage[] = [
  'Closed Lost',
  'Withdrawn',
  'Closed / Did not Fulfill',
  'Closed / Completed',
];

// ── Salesforce Object Interfaces ────────────────────────────────────────────

export interface SalesforceOpportunity {
  Id: string;
  AccountId: string;
  Name: string;
  StageName: OpportunityStage;
  Amount: number | null;
  Probability: number | null;
  CloseDate: string | null;
  ExpectedRevenue: number | null;
  ForecastCategory: string | null;
  Type: string | null;
  LeadSource: string | null;
  NextStep: string | null;
  Description: string | null;
  OwnerId: string;
  CreatedDate: string | null;
  LastModifiedDate: string | null;
  Payment_Terms__c: string | null;
  Contract_Start_Date__c: string | null;
  Contract_End_Date__c: string | null;
  Billing_Frequency__c: string | null;
  // Pursuit custom fields
  RenewalRepeat__c: string | null;
  Active_Opportunity__c: boolean | null;
  LastActivityDate: string | null;
  // NPSP payment rollup fields (read-only in Salesforce — formula/rollup)
  npe01__Payments_Made__c: number | null;
  Outstanding_Payments__c: number | null;
  Number_of_Payments_Received__c: number | null;
  Most_Recent_Payment_Date__c: string | null;
  Last_Actual_Payment__c: string | null;
  npe01__Number_of_Payments__c: number | null;
  PaymentDate__c: string | null;
  Earliest_Scheduled_Payment__c: string | null;
  // Nested relationship fields (from SOQL joins)
  Account?: { Name: string; Id?: string };
  Owner?: { Name: string; Id?: string };
  RecordType?: { Name: string };
}

export interface SalesforceAccount {
  Id: string;
  Name: string;
  Type: string | null;
  Industry: string | null;
  AnnualRevenue: number | null;
  NumberOfEmployees: number | null;
  Phone: string | null;
  Website: string | null;
  CreatedDate: string | null;
  LastModifiedDate: string | null;
}

export interface SalesforceContact {
  Id: string;
  AccountId: string | null;
  FirstName: string | null;
  LastName: string;
  Email: string | null;
  Phone: string | null;
  Title: string | null;
  Department: string | null;
  Primary_Affiliation__c: string | null;
  CreatedDate: string | null;
}

export interface SalesforceTask {
  Id: string;
  Subject: string;
  Status: string;
  Priority: string;
  ActivityDate: string | null;
  Description: string | null;
  OwnerId: string;
  WhatId: string | null;
  WhoId: string | null;
}
