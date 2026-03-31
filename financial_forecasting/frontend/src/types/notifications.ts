/**
 * Types for the Notification Center (NotificationDropdown).
 *
 * Three notification categories:
 * - task-assignment:   someone assigned a task to the current user
 * - ownership-gained:  current user was given ownership of an opportunity
 * - ownership-lost:    current user's opportunity ownership was reassigned
 * - close-date-warning: an open opportunity's CloseDate is approaching
 */

export type NotificationType =
  | 'task-assignment'
  | 'ownership-gained'
  | 'ownership-lost'
  | 'close-date-warning'
  | 'permission-request';

export type NotificationSeverity = 'error' | 'warning' | 'info';

export interface CrmNotification {
  /** Dedup key, e.g. "task-assignment:00Txxx" or "ownership-gained:006xxx:2026-03-24T..." */
  id: string;
  type: NotificationType;
  severity: NotificationSeverity;
  /** Primary text, e.g. "JP Rivera assigned you a task" */
  title: string;
  /** Detail text, e.g. "Call Sponsor re: Q2 Grant" */
  subtitle: string;
  /** ISO timestamp for sorting and "new" calculation */
  timestamp: string;
  /** For ownership and close-date notifications */
  opportunityId?: string;
  /** For task assignment notifications */
  taskId?: string;
  /** WhatId linking a task to an opportunity (used for TaskPanel) */
  whatId?: string | null;
  /** Whether the notification arrived after the last time the dropdown was opened */
  isNew: boolean;
}

export interface NotificationState {
  /** IDs of notifications the user has explicitly marked as read */
  readIds: string[];
}

/** Matches the response shape from GET /api/salesforce/opportunities/ownership-history */
export interface OwnershipChangeRecord {
  OpportunityId: string;
  OpportunityName: string;
  Amount: number;
  CurrentStage: string;
  CurrentOwnerId: string;
  CurrentOwnerName: string | null;
  OldValue: string;
  NewValue: string;
  OldOwnerName: string;
  NewOwnerName: string;
  ChangedById: string;
  ChangedByName: string | null;
  CreatedDate: string;
}
