import React, { useState, useCallback, useMemo } from 'react';
import {
  Alert,
  AlertTitle,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  LinearProgress,
  Link,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  OpenInNew as OpenInNewIcon,
  Person as PersonIcon,
  UploadFile as UploadFileIcon,
} from '@mui/icons-material';
import { format, addDays, parseISO, isWithinInterval, startOfDay } from 'date-fns';
import Papa from 'papaparse';
import { useQuery } from 'react-query';

import { apiService } from '../services/api';
import type { Grant, ImportResult, Lead, WeeklyPriorityItem } from '../types/weeklyPriorities';

// ---------------------------------------------------------------------------
// Salesforce Lightning link helper
// ---------------------------------------------------------------------------
function useSalesforceBaseUrl(): string | null {
  const { data } = useQuery(
    'sf-instance',
    async () => {
      const resp = await apiService.servicesHealth();
      return resp.data?.salesforce?.instance || null;
    },
    { retry: 1, staleTime: Infinity }
  );
  // data is like "joinpursuit.my.salesforce.com"
  if (!data) return null;
  const domain = (data as string).replace('.my.salesforce.com', '');
  return `https://${domain}.lightning.force.com`;
}

function SalesforceLink({
  baseUrl,
  objectType,
  recordId,
  children,
}: {
  baseUrl: string | null;
  objectType: string;
  recordId: string;
  children: React.ReactNode;
}) {
  if (!baseUrl) return <>{children}</>;
  const href = `${baseUrl}/lightning/r/${objectType}/${recordId}/view`;
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener"
      underline="hover"
      sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, cursor: 'pointer' }}
    >
      {children}
      <OpenInNewIcon sx={{ fontSize: 14 }} />
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Column alias table: raw CSV header → canonical field name
// ---------------------------------------------------------------------------
type LeadField = 'name' | 'first_name' | 'last_name' | 'organization' | 'title' | 'notes' | 'email' | 'phone';

const COLUMN_ALIASES: Record<string, LeadField> = {
  name: 'name',
  full_name: 'name',
  contact_name: 'name',
  first_name: 'first_name',
  firstname: 'first_name',
  'first name': 'first_name',
  last_name: 'last_name',
  lastname: 'last_name',
  'last name': 'last_name',
  organization: 'organization',
  company: 'organization',
  org: 'organization',
  title: 'title',
  job_title: 'title',
  notes: 'notes',
  note: 'notes',
  email: 'email',
  email_address: 'email',
  phone: 'phone',
  phone_number: 'phone',
};

function normalizeKey(raw: string): string {
  return raw.trim().toLowerCase().replace(/[\s_-]+/g, '_');
}

// ---------------------------------------------------------------------------
// CSV parser: returns ImportResult + leads
// Max 5 MB, 10 000 rows. Bad rows skipped with error entry.
// ---------------------------------------------------------------------------
function parseCSV(file: File): Promise<ImportResult & { leads: Lead[] }> {
  return new Promise((resolve) => {
    if (file.size > 5 * 1024 * 1024) {
      resolve({
        leads: [],
        imported: 0,
        skipped: 0,
        errors: [{ row: 0, message: 'FILE_TOO_LARGE: File exceeds 5 MB limit.' }],
      });
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data as Record<string, string>[];

        if (rows.length > 10000) {
          resolve({
            leads: [],
            imported: 0,
            skipped: 0,
            errors: [{ row: 0, message: `TOO_MANY_ROWS: File has ${rows.length} rows; limit is 10,000.` }],
          });
          return;
        }

        const leads: Lead[] = [];
        const errors: ImportResult['errors'] = [];
        const timestamp = Date.now();

        rows.forEach((row, index) => {
          const fields: Partial<Record<LeadField, string>> = {};
          Object.entries(row).forEach(([k, v]) => {
            const canonical = COLUMN_ALIASES[normalizeKey(k)];
            if (canonical) fields[canonical] = (v || '').trim();
          });

          if (fields['name'] && !fields['first_name'] && !fields['last_name']) {
            const parts = (fields['name'] as string).split(/\s+/);
            fields['first_name'] = parts[0] || '';
            fields['last_name'] = parts.slice(1).join(' ') || '';
          }

          const hasName = ((fields['first_name'] || '') + (fields['last_name'] || '')).trim().length > 0;
          if (!hasName) {
            errors.push({ row: index + 2, message: 'VALIDATION_ERROR: Missing required name field.' });
            return;
          }

          leads.push({
            id: `lead-${timestamp}-${index}`,
            first_name: fields['first_name'] || '',
            last_name: fields['last_name'] || '',
            organization: fields['organization'],
            title: fields['title'],
            notes: fields['notes'],
            email: fields['email'],
            phone: fields['phone'],
            source: file.name,
          });
        });

        resolve({ leads, imported: leads.length, skipped: errors.length, errors });
      },
      error: (err: Error) => {
        resolve({
          leads: [],
          imported: 0,
          skipped: 0,
          errors: [{ row: 0, message: `PARSE_ERROR: ${err.message}` }],
        });
      },
    });
  });
}

// ---------------------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------------------
const LOOKAHEAD_DAYS = 30;

function getThisWeekRange(): { start: Date; end: Date } {
  const start = startOfDay(new Date());
  return { start, end: addDays(start, LOOKAHEAD_DAYS - 1) };
}

function isThisWeek(dateStr: string | null | undefined): boolean {
  if (!dateStr) return false;
  try {
    const { start, end } = getThisWeekRange();
    return isWithinInterval(parseISO(dateStr), { start, end });
  } catch {
    return false;
  }
}

function buildAction(grant: Grant): string {
  return `Follow up before close date ${grant.close_date}`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function WeeklyPriorities() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importing, setImporting] = useState(false);

  const sfBaseUrl = useSalesforceBaseUrl();

  // Fetch opportunities from Salesforce
  const {
    data: oppsData,
    isLoading: grantsLoading,
    error: grantsError,
  } = useQuery('weekly-priorities-opps', () => apiService.getOpportunities(), { retry: 1 });

  // Filter to lookahead window
  const grants: Grant[] = useMemo(() => {
    if (!oppsData?.data) return [];
    return (oppsData.data as any[])
      .filter((o) => isThisWeek(o.CloseDate))
      .map((o) => ({
        id: o.Id,
        name: o.Name,
        close_date: o.CloseDate,
        stage: o.StageName,
      }));
  }, [oppsData]);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    const result = await parseCSV(file);
    setLeads(result.leads);
    setImportResult({ imported: result.imported, skipped: result.skipped, errors: result.errors });
    setImporting(false);
    e.target.value = '';
  }, []);

  const handleGrantAssign = useCallback((leadId: string, grantId: string) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, grant_id: grantId || undefined } : l))
    );
  }, []);

  // Priority items: leads with a grant_id linked to a known grant
  const priorityItems: WeeklyPriorityItem[] = useMemo(() => {
    return leads
      .filter((l) => l.grant_id)
      .map((l) => {
        const grant = grants.find((g) => g.id === l.grant_id);
        if (!grant) return null;
        return { lead: l, grant, suggested_action: buildAction(grant) };
      })
      .filter((item): item is WeeklyPriorityItem => item !== null);
  }, [leads, grants]);

  // Group priority items by grant id
  const groupedByGrant = useMemo(() => {
    const map = new Map<string, WeeklyPriorityItem[]>();
    priorityItems.forEach((item) => {
      map.set(item.grant.id, [...(map.get(item.grant.id) ?? []), item]);
    });
    return map;
  }, [priorityItems]);

  const { start, end } = getThisWeekRange();

  return (
    <Box>
      {/* Page header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Weekly Priorities
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {format(start, 'MMM d')} – {format(end, 'MMM d, yyyy')} · Next {LOOKAHEAD_DAYS} days
        </Typography>
      </Box>

      {/* ── 1. Import CSV ── */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Import Lead List
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadFileIcon />}
              disabled={importing}
            >
              Upload CSV
              <input type="file" accept=".csv" hidden onChange={handleFileChange} />
            </Button>
            {importing && <CircularProgress size={20} />}
            <Typography variant="caption" color="text.secondary">
              Max 5 MB · 10,000 rows · Required: name or first + last name
            </Typography>
          </Stack>

          {importResult && (
            <Box sx={{ mt: 2 }}>
              {importResult.imported > 0 && (
                <Alert severity="success" sx={{ mb: 1 }}>
                  <AlertTitle>Import complete</AlertTitle>
                  {importResult.imported} lead{importResult.imported !== 1 ? 's' : ''} imported
                  {importResult.skipped > 0 &&
                    `, ${importResult.skipped} row${importResult.skipped !== 1 ? 's' : ''} skipped`}
                  .
                </Alert>
              )}
              {importResult.errors.length > 0 && importResult.imported === 0 && (
                <Alert severity="error">
                  <AlertTitle>Import failed</AlertTitle>
                  {importResult.errors[0].message}
                </Alert>
              )}
              {importResult.errors.length > 0 && importResult.imported > 0 && (
                <Alert severity="warning">
                  <AlertTitle>
                    {importResult.skipped} row{importResult.skipped !== 1 ? 's' : ''} skipped
                  </AlertTitle>
                  {importResult.errors.slice(0, 3).map((e, i) => (
                    <Typography key={i} variant="caption" display="block">
                      Row {e.row}: {e.message}
                    </Typography>
                  ))}
                  {importResult.errors.length > 3 && (
                    <Typography variant="caption">…and {importResult.errors.length - 3} more</Typography>
                  )}
                </Alert>
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* ── 2. Leads + Grants side-by-side ── */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }}>
        {/* Lead list with grant assignment */}
        <Card sx={{ flex: 1.5 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6">Leads</Typography>
              <Chip label={leads.length} size="small" color="primary" variant="outlined" />
            </Box>

            {leads.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Upload a CSV above to see leads here.
              </Typography>
            ) : (
              <TableContainer sx={{ maxHeight: 400 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Org</TableCell>
                      <TableCell>Link to Grant</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {leads.map((l) => (
                      <TableRow key={l.id}>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>
                            {[l.first_name, l.last_name].filter(Boolean).join(' ')}
                          </Typography>
                          {l.title && (
                            <Typography variant="caption" color="text.secondary">
                              {l.title}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{l.organization || '—'}</Typography>
                        </TableCell>
                        <TableCell>
                          <FormControl size="small" sx={{ minWidth: 180 }}>
                            <InputLabel>Assign grant</InputLabel>
                            <Select
                              label="Assign grant"
                              value={l.grant_id ?? ''}
                              onChange={(e) => handleGrantAssign(l.id, e.target.value as string)}
                              disabled={grants.length === 0}
                            >
                              <MenuItem value="">—</MenuItem>
                              {grants.map((g) => (
                                <MenuItem key={g.id} value={g.id}>
                                  {g.name} · {g.close_date}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>

        {/* Upcoming grants */}
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6">Upcoming Grants</Typography>
              {grantsLoading ? (
                <CircularProgress size={16} />
              ) : (
                <Chip
                  label={grants.length}
                  size="small"
                  color={grants.length > 0 ? 'warning' : 'default'}
                  variant="outlined"
                />
              )}
            </Box>

            {grantsError ? (
              <Alert severity="error">
                Could not load opportunities. Check your Salesforce connection.
              </Alert>
            ) : grantsLoading ? (
              <LinearProgress />
            ) : grants.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No grants with close dates in the next {LOOKAHEAD_DAYS} days.
              </Typography>
            ) : (
              <Stack spacing={1}>
                {grants.map((g) => (
                  <Box
                    key={g.id}
                    sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
                  >
                    <SalesforceLink baseUrl={sfBaseUrl} objectType="Opportunity" recordId={g.id}>
                      <Typography variant="body2" fontWeight={600}>
                        {g.name}
                      </Typography>
                    </SalesforceLink>
                    <Stack direction="row" spacing={1} sx={{ mt: 0.5 }} flexWrap="wrap">
                      <Chip label={`Close: ${g.close_date}`} size="small" color="warning" variant="outlined" />
                      <Chip label={g.stage} size="small" variant="outlined" />
                    </Stack>
                  </Box>
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>
      </Stack>

      {/* ── 3. Priority list grouped by grant ── */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Priority List</Typography>
            <Chip
              label={`${priorityItems.length} item${priorityItems.length !== 1 ? 's' : ''}`}
              size="small"
            />
          </Box>

          {priorityItems.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              {leads.length === 0
                ? 'Import a lead list and assign grants to build your priority list.'
                : 'Assign leads to grants (above) to see your priority list here.'}
            </Typography>
          ) : (
            Array.from(groupedByGrant.entries()).map(([grantId, items], idx) => (
              <Box key={grantId} sx={{ mb: idx < groupedByGrant.size - 1 ? 3 : 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <AssignmentIcon fontSize="small" color="primary" />
                  <SalesforceLink baseUrl={sfBaseUrl} objectType="Opportunity" recordId={grantId}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {items[0].grant.name}
                    </Typography>
                  </SalesforceLink>
                  <Chip label={`Close: ${items[0].grant.close_date}`} size="small" color="warning" />
                  <Chip label={items[0].grant.stage} size="small" variant="outlined" />
                </Box>

                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Who</TableCell>
                        <TableCell>Org</TableCell>
                        <TableCell>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {items.map((item) => (
                        <TableRow key={item.lead.id}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <PersonIcon fontSize="small" color="action" />
                              <Box>
                                <Typography variant="body2" fontWeight={500}>
                                  {[item.lead.first_name, item.lead.last_name]
                                    .filter(Boolean)
                                    .join(' ')}
                                </Typography>
                                {item.lead.title && (
                                  <Typography variant="caption" color="text.secondary">
                                    {item.lead.title}
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{item.lead.organization || '—'}</Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={item.suggested_action}
                              size="small"
                              color="primary"
                              variant="outlined"
                              icon={<CheckCircleIcon />}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                {idx < groupedByGrant.size - 1 && <Divider sx={{ mt: 2 }} />}
              </Box>
            ))
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
