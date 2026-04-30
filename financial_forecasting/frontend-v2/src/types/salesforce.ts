/**
 * Salesforce-shaped types — keys are PascalCase to match the SF REST API
 * (and per `tasks/lessons.md` 2026-03-26: SF returns PascalCase, do not
 * lowercase).
 *
 * Mirrors the field set returned by `GET /api/salesforce/accounts` in
 * financial_forecasting/main.py:535.
 */

export interface SfReference {
  Name?: string | null;
}

export interface SfAccount {
  Id: string;
  Name: string;
  Type?: string | null;
  Industry?: string | null;
  Phone?: string | null;
  Website?: string | null;
  Description?: string | null;
  BillingCity?: string | null;
  BillingState?: string | null;
  BillingCountry?: string | null;
  AnnualRevenue?: number | null;
  NumberOfEmployees?: number | null;
  AccountSource?: string | null;
  OwnerId?: string | null;
  Owner?: SfReference | null;
  RecordTypeId?: string | null;
  RecordType?: SfReference | null;
  CreatedDate?: string | null;
  LastModifiedDate?: string | null;
  LastActivityDate?: string | null;

  // Pursuit custom fields (from main.py:535 query)
  Account_Tier__c?: string | null;
  Active__c?: boolean | null;
  Company_Size__c?: string | null;
  Philanthropy__c?: boolean | null;
  Fee_For_Service__c?: boolean | null;
  Hiring__c?: boolean | null;
  Investment__c?: boolean | null;
  Volunteering__c?: boolean | null;
  Fellow_Recruitment__c?: boolean | null;
  Media_Marketing__c?: boolean | null;
  Influence__c?: boolean | null;
  Startup__c?: boolean | null;
  Organization_Focus_Area_s__c?: string | null;

  // npo02 / npsp aggregates
  npo02__TotalOppAmount__c?: number | null;
  npo02__NumberOfClosedOpps__c?: number | null;
  npo02__AverageAmount__c?: number | null;
  npo02__LargestAmount__c?: number | null;
  npo02__LastCloseDate__c?: string | null;
  npo02__OppAmountThisYear__c?: number | null;
  npo02__OppAmountLastYear__c?: number | null;
  npsp__Grantmaker__c?: boolean | null;
  npsp__Funding_Focus__c?: string | null;

  Total_Revenue_Generated__c?: number | null;
  Last_Activity_Date__c?: string | null;
}

/**
 * Mirrors `GET /api/salesforce/opportunities` (main.py:306).
 */
export interface SfOpportunity {
  Id: string;
  Name: string;
  AccountId?: string | null;
  Account?: SfReference | null;

  StageName: string;
  Probability?: number | null;
  ForecastCategory?: string | null;

  Amount?: number | null;
  CloseDate?: string | null;
  LeadSource?: string | null;
  NextStep?: string | null;
  Description?: string | null;

  OwnerId?: string | null;
  Owner?: SfReference | null;
  CreatedDate?: string | null;
  LastModifiedDate?: string | null;

  RecordTypeId?: string | null;
  RecordType?: SfReference | null;
  Active_Opportunity__c?: boolean | null;

  // Payments roll-ups
  npe01__Payments_Made__c?: number | null;
  Outstanding_Payments__c?: number | null;
  Number_of_Payments_Received__c?: number | null;
  npe01__Number_of_Payments__c?: number | null;
  Most_Recent_Payment_Date__c?: string | null;
  Last_Actual_Payment__c?: string | null;
  PaymentDate__c?: string | null;
  Earliest_Scheduled_Payment__c?: string | null;
  RenewalRepeat__c?: string | null;

  // Primary contact (NPSP lookup)
  npsp__Primary_Contact__c?: string | null;
  npsp__Primary_Contact__r?: {
    Name?: string | null;
    Email?: string | null;
  } | null;
}
