import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { Upload as UploadIcon, Check as CheckIcon } from '@mui/icons-material';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

const TARGET_FIELDS = [
  { id: 'first_name', label: 'First Name' },
  { id: 'last_name', label: 'Last Name' },
  { id: 'name', label: 'Name (split into First/Last)' },
  { id: 'email', label: 'Email' },
  { id: 'organizations', label: 'Organization(s)' },
];

export default function ProspectImport() {
  const [csvText, setCsvText] = useState('');
  const [headers, setHeaders] = useState<string[]>([]);
  const [previewRows, setPreviewRows] = useState<Record<string, string>[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [orgColumns, setOrgColumns] = useState<string[]>([]);
  const [parsed, setParsed] = useState<{ persons: Array<{ id: string; first_name: string; last_name: string; email?: string; affiliations: Array<{ org_name: string; org_type: string }> }> } | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result);
      setCsvText(text);
      setParsed(null);
      handlePreview(text);
    };
    reader.readAsText(file);
  };

  const handlePreview = async (text: string) => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res = await apiService.prospectImportPreview(text);
      const data = res.data as { headers: string[]; rows: Record<string, string>[] };
      setHeaders(data.headers || []);
      setPreviewRows(data.rows || []);
      setColumnMapping({});
      setOrgColumns([]);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Preview failed');
    } finally {
      setLoading(false);
    }
  };

  const handleParse = async () => {
    if (!csvText.trim()) {
      toast.error('Upload a CSV first');
      return;
    }
    const mapping: Record<string, string | string[]> = {};
    if (columnMapping.name) {
      mapping.name = columnMapping.name;
    } else {
      if (columnMapping.first_name) mapping.first_name = columnMapping.first_name;
      if (columnMapping.last_name) mapping.last_name = columnMapping.last_name;
    }
    if (columnMapping.email) mapping.email = columnMapping.email;
    if (orgColumns.filter(Boolean).length) mapping.organizations = orgColumns.filter(Boolean);

    setLoading(true);
    try {
      const parseRes = await apiService.prospectImportParse(csvText, mapping);
      const sid = (parseRes.data as { session_id?: string })?.session_id;
      setSessionId(sid || null);
      const res = await apiService.prospectImportGetPersons(sid);
      setParsed(res.data as NonNullable<typeof parsed>);
      toast.success('Import complete');
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      toast.error(typeof detail === 'object' ? detail?.error || 'Parse failed' : detail || 'Parse failed');
    } finally {
      setLoading(false);
    }
  };

  const addOrgColumn = () => {
    setOrgColumns([...orgColumns, headers[0] || '']);
  };

  const updateOrgColumn = (idx: number, val: string) => {
    const next = [...orgColumns];
    next[idx] = val;
    setOrgColumns(next);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Prospect Import
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Upload a messy spreadsheet. Map columns to First Name, Last Name, Organization(s). EIN is not required — Pebble finds it when needed. Organization is optional; some prospects (e.g. HNWI families) have many affiliations.
      </Typography>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Button variant="outlined" component="label" startIcon={<UploadIcon />} sx={{ mb: 2 }}>
            Upload CSV
            <input type="file" accept=".csv" hidden onChange={handleFileUpload} />
          </Button>

          {headers.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>Column mapping</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                {!columnMapping.name && (
                  <>
                    <FormControl size="small" sx={{ minWidth: 140 }}>
                      <InputLabel>First Name</InputLabel>
                      <Select
                        value={columnMapping.first_name || ''}
                        label="First Name"
                        onChange={(e) => setColumnMapping({ ...columnMapping, first_name: e.target.value })}
                      >
                        <MenuItem value="">—</MenuItem>
                        {headers.map((h) => (
                          <MenuItem key={h} value={h}>{h}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ minWidth: 140 }}>
                      <InputLabel>Last Name</InputLabel>
                      <Select
                        value={columnMapping.last_name || ''}
                        label="Last Name"
                        onChange={(e) => setColumnMapping({ ...columnMapping, last_name: e.target.value })}
                      >
                        <MenuItem value="">—</MenuItem>
                        {headers.map((h) => (
                          <MenuItem key={h} value={h}>{h}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </>
                )}
                <FormControl size="small" sx={{ minWidth: 200 }}>
                  <InputLabel>Name (or split)</InputLabel>
                  <Select
                    value={columnMapping.name || ''}
                    label="Name (or split)"
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v) {
                        const { name, ...rest } = columnMapping;
                        setColumnMapping({ ...rest, name: v });
                      } else {
                        const { name, ...rest } = columnMapping;
                        setColumnMapping(rest);
                      }
                    }}
                  >
                    <MenuItem value="">— Use First/Last</MenuItem>
                    {headers.map((h) => (
                      <MenuItem key={h} value={h}>{h}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Email</InputLabel>
                  <Select
                    value={columnMapping.email || ''}
                    label="Email"
                    onChange={(e) => setColumnMapping({ ...columnMapping, email: e.target.value })}
                  >
                    <MenuItem value="">—</MenuItem>
                    {headers.map((h) => (
                      <MenuItem key={h} value={h}>{h}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Typography variant="caption" display="block" sx={{ mb: 1 }}>Organization columns (optional)</Typography>
              {orgColumns.map((col, i) => (
                <FormControl key={i} size="small" sx={{ minWidth: 160, mr: 1, mb: 1 }}>
                  <Select
                    value={col}
                    displayEmpty
                    onChange={(e) => updateOrgColumn(i, e.target.value)}
                  >
                    <MenuItem value="">—</MenuItem>
                    {headers.map((h) => (
                      <MenuItem key={h} value={h}>{h}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ))}
              <Button size="small" onClick={addOrgColumn} sx={{ ml: 1 }}>+ Org column</Button>
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  startIcon={loading ? null : <CheckIcon />}
                  onClick={handleParse}
                  disabled={loading || (!columnMapping.name && !columnMapping.first_name && !columnMapping.last_name)}
                >
                  {loading ? 'Importing...' : 'Import'}
                </Button>
              </Box>
            </Box>
          )}

          {previewRows.length > 0 && (
            <Box sx={{ mt: 2, overflow: 'auto', maxHeight: 200 }}>
              <Typography variant="caption" color="text.secondary">Preview (first 20 rows)</Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {headers.map((h) => (
                      <TableCell key={h}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {previewRows.slice(0, 10).map((row, i) => (
                    <TableRow key={i}>
                      {headers.map((h) => (
                        <TableCell key={h}>{row[h] || ''}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}
        </CardContent>
      </Card>

      {parsed && parsed.persons && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Imported: {parsed.persons.length} person(s)
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={async () => {
                  setLoading(true);
                  try {
                    await apiService.prospectImportWriteToCrm(sessionId || undefined);
                    toast.success('Written to Salesforce');
                  } catch (err: any) {
                    toast.error(err.response?.data?.detail?.error || 'Write failed');
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
              >
                Write to CRM (Salesforce)
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={async () => {
                  if (!parsed?.persons?.length) return;
                  setLoading(true);
                  try {
                    const { pebbleService } = await import('../services/pebbleApi');
                    const prospects = parsed.persons.slice(0, 5).map((p) => ({
                      id: p.id,
                      first_name: p.first_name,
                      last_name: p.last_name,
                      organization: p.affiliations?.[0]?.org_name,
                      organizations: p.affiliations?.map((a) => a.org_name).filter(Boolean),
                    }));
                    await pebbleService.requestResearch({
                      contact_ids: prospects.map((x) => x.id),
                      prospects,
                    });
                    toast.success('Research requested (check Pebble page for profiles)');
                  } catch (err: any) {
                    toast.error(err.response?.data?.detail || 'Pebble request failed');
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading || !parsed?.persons?.length}
              >
                Research with Pebble (first 5)
              </Button>
            </Box>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Affiliations</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {parsed.persons.slice(0, 50).map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{p.first_name} {p.last_name}</TableCell>
                    <TableCell>{p.email || '—'}</TableCell>
                    <TableCell>
                      {p.affiliations?.length
                        ? p.affiliations.map((a) => a.org_name).join(', ')
                        : '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {parsed.persons.length > 50 && (
              <Typography variant="caption" color="text.secondary">
                Showing first 50 of {parsed.persons.length}
              </Typography>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
