/**
 * Schema-driven column generator for MUI DataGrid.
 *
 * Converts a Salesforce schema describe response into GridColDef[] arrays,
 * so users can toggle ANY object field as a visible column. Editable fields
 * get appropriate edit cells (text, picklist, lookup, date, boolean).
 *
 * Usage:
 *   const schema = await apiService.getSchemaDescribe('Account');
 *   const columns = buildSchemaColumns(schema.data.fields, { overrides, forceHide });
 */
import React from 'react';
import { Select, MenuItem } from '@mui/material';
import type { GridColDef, GridRenderEditCellParams, GridValueGetterParams } from '@mui/x-data-grid';
import { useGridApiContext } from '@mui/x-data-grid';
import { format } from 'date-fns';

import { formatDollarMillions } from './formatters';
import { AccountEditCell, OwnerEditCell } from '../pages/Opportunities/EditCells';

// ── Types ───────────────────────────────────────────────────────────────────

export interface SchemaField {
  name: string;
  label: string;
  type: string;
  custom: boolean;
  updateable: boolean;
  calculated: boolean;
  nillable: boolean;
  defaultValue: any;
  picklistValues?: Array<{ value: string; label: string; active: boolean }>;
  referenceTo?: string[];
  relationshipName?: string;
}

export interface SchemaColumnOptions {
  /** Field names to exclude entirely from the generated columns. */
  forceHide?: Set<string>;
  /** Per-field column definition overrides (merged after generation). */
  overrides?: Map<string, Partial<GridColDef>>;
}

// ── Constants ───────────────────────────────────────────────────────────────

/** System/metadata fields that clutter the column picker without adding value. */
export const SYSTEM_FIELDS = new Set([
  'Id',
  'IsDeleted',
  'SystemModstamp',
  'CreatedById',
  'CreatedDate',
  'LastModifiedById',
  'LastModifiedDate',
  'LastActivityDate',
  'RecordTypeId',
  'MasterRecordId',
  'attributes',
]);

/** Salesforce field types that map to DataGrid number type. */
const NUMERIC_TYPES = new Set(['double', 'currency', 'int', 'percent']);

/** Salesforce field types that map to currency formatting. */
const CURRENCY_TYPES = new Set(['currency']);

// ── PicklistEditCell ────────────────────────────────────────────────────────

interface PicklistEditCellProps extends GridRenderEditCellParams {
  options: Array<{ value: string; label: string }>;
}

/**
 * Inline edit cell for picklist fields — renders a Select dropdown
 * populated with the field's active picklist values.
 */
export function PicklistEditCell(props: PicklistEditCellProps) {
  const { id, value, field, options } = props;
  const apiRef = useGridApiContext();

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const newValue = (event.target as HTMLSelectElement).value;
    apiRef.current.setEditCellValue({ id, field, value: newValue });
    // Immediately stop editing after selection
    apiRef.current.stopCellEditMode({ id, field });
  };

  return (
    <Select
      value={value || ''}
      onChange={handleChange as any}
      size="small"
      variant="standard"
      autoFocus
      fullWidth
      sx={{ width: '100%', '& .MuiSelect-select': { py: 0.5 } }}
    >
      <MenuItem value="">
        <em>None</em>
      </MenuItem>
      {options.map((opt) => (
        <MenuItem key={opt.value} value={opt.value}>
          {opt.label}
        </MenuItem>
      ))}
    </Select>
  );
}

// ── Column Builder ──────────────────────────────────────────────────────────

/**
 * Convert Salesforce schema fields into MUI DataGrid column definitions.
 *
 * Filters out system fields and dotted pseudo-fields (Account.Name, etc.),
 * maps SF types to DataGrid types, and wires up appropriate edit cells.
 */
export function buildSchemaColumns(
  fields: SchemaField[],
  options?: SchemaColumnOptions,
): GridColDef[] {
  const forceHide = options?.forceHide ?? new Set();
  const overrides = options?.overrides ?? new Map();

  const columns: GridColDef[] = [];

  for (const field of fields) {
    // Skip system fields
    if (SYSTEM_FIELDS.has(field.name)) continue;

    // Skip dotted relationship pseudo-fields (Account.Name, Owner.Name, etc.)
    if (field.name.includes('.')) continue;

    // Skip explicitly hidden fields
    if (forceHide.has(field.name)) continue;

    const col = buildColumnForField(field);
    if (!col) continue;

    // Apply per-field overrides
    const override = overrides.get(field.name);
    if (override) {
      Object.assign(col, override);
    }

    columns.push(col);
  }

  // Sort alphabetically by header name for the column picker
  columns.sort((a, b) => (a.headerName || '').localeCompare(b.headerName || ''));

  return columns;
}

// ── Per-field column builder ────────────────────────────────────────────────

function buildColumnForField(field: SchemaField): GridColDef | null {
  const base: GridColDef = {
    field: field.name,
    headerName: field.label,
    flex: 1,
    minWidth: 120,
    filterable: true,
    editable: field.updateable && !field.calculated,
  };

  const sfType = field.type;

  // ── Numeric types (currency, double, int, percent) ──
  if (NUMERIC_TYPES.has(sfType)) {
    base.type = 'number';
    if (CURRENCY_TYPES.has(sfType)) {
      base.valueFormatter = (params) =>
        params.value != null ? formatDollarMillions(params.value as number) : '';
    }
    if (sfType === 'percent') {
      base.valueFormatter = (params) =>
        params.value != null ? `${params.value}%` : '';
    }
    return base;
  }

  // ── Date ──
  if (sfType === 'date') {
    base.type = 'date';
    base.valueGetter = (params: GridValueGetterParams) =>
      params.value ? new Date(params.value) : null;
    base.valueFormatter = (params) =>
      params.value ? format(new Date(params.value as string), 'MMM dd, yyyy') : '';
    return base;
  }

  // ── DateTime ──
  if (sfType === 'datetime') {
    base.type = 'dateTime';
    base.valueGetter = (params: GridValueGetterParams) =>
      params.value ? new Date(params.value) : null;
    base.valueFormatter = (params) =>
      params.value ? format(new Date(params.value as string), 'MMM dd, yyyy h:mm a') : '';
    return base;
  }

  // ── Boolean ──
  if (sfType === 'boolean') {
    base.type = 'boolean';
    return base;
  }

  // ── Picklist ──
  if (sfType === 'picklist' && field.picklistValues) {
    const activeValues = field.picklistValues.filter((pv) => pv.active);
    if (base.editable) {
      base.renderEditCell = (params: GridRenderEditCellParams) => (
        <PicklistEditCell {...params} options={activeValues} />
      );
    }
    return base;
  }

  // ── Multipicklist — display-only, edit via dialog ──
  if (sfType === 'multipicklist') {
    base.editable = false;
    base.valueFormatter = (params) => {
      if (!params.value) return '';
      return String(params.value).replace(/;/g, ', ');
    };
    return base;
  }

  // ── Reference / Lookup ──
  if (sfType === 'reference') {
    const targets = field.referenceTo || [];
    const relName = field.relationshipName;

    // Display the related record's Name via the relationship object
    if (relName) {
      base.valueGetter = (params: GridValueGetterParams) =>
        params.row[relName]?.Name || '';
    }

    // Wire up known edit cells for Account and User lookups
    if (targets.includes('Account')) {
      if (base.editable) {
        base.renderEditCell = (params: GridRenderEditCellParams) => (
          <AccountEditCell {...params} />
        );
      }
      return base;
    }

    if (targets.includes('User')) {
      if (base.editable) {
        base.renderEditCell = (params: GridRenderEditCellParams) => (
          <OwnerEditCell {...params} />
        );
      }
      return base;
    }

    // Other reference types — read-only in the grid, use the dialog for editing
    base.editable = false;
    return base;
  }

  // ── String / textarea / phone / email / url — default text input ──
  return base;
}
