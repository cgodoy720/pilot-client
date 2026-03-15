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
  // Nested relationship fields (from SOQL joins)
  Account?: { Name: string; Id?: string };
  Owner?: { Name: string; Id?: string };
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
