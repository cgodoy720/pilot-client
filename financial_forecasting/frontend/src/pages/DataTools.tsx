import React, { useState, useRef } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Button,
  Alert,
  MenuItem,
  TextField,
  CircularProgress,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material';
import {
  Upload as UploadIcon,
  Download as DownloadIcon,
  CleaningServices as CleanupIcon,
} from '@mui/icons-material';
import { useQuery } from 'react-query';
import toast from 'react-hot-toast';

import { parseCSV } from '../utils/csvParser';
import { apiService } from '../services/api';
import Cleanup from './Cleanup';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

// ── Import Tab ──────────────────────────────────────────────────────────────

function ImportTab() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ imported: number; skipped: number; errors: { row: number; message: string }[] } | null>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setResult(null);
    try {
      const res = await parseCSV(file);
      setResult({ imported: res.imported, skipped: res.skipped, errors: res.errors });
      if (res.imported > 0) {
        toast.success(`Imported ${res.imported} records`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Import failed');
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>CSV Import</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Upload a CSV file to import leads and prospects. Columns are auto-mapped via aliases.
      </Typography>
      <input
        ref={fileRef}
        type="file"
        accept=".csv"
        style={{ display: 'none' }}
        onChange={handleFile}
      />
      <Button
        variant="contained"
        startIcon={importing ? <CircularProgress size={18} /> : <UploadIcon />}
        onClick={() => fileRef.current?.click()}
        disabled={importing}
      >
        {importing ? 'Importing…' : 'Choose CSV File'}
      </Button>
      {result && (
        <Box sx={{ mt: 2 }}>
          <Alert severity={result.errors.length > 0 ? 'warning' : 'success'}>
            {result.imported} imported, {result.skipped} skipped
          </Alert>
          {result.errors.length > 0 && (
            <Table size="small" sx={{ mt: 1 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Row</TableCell>
                  <TableCell>Error</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {result.errors.slice(0, 20).map((err, i) => (
                  <TableRow key={i}>
                    <TableCell>{err.row}</TableCell>
                    <TableCell>{err.message}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Box>
      )}
    </Paper>
  );
}

// ── Export Tab ───────────────────────────────────────────────────────────────

const EXPORT_ENTITIES = ['Opportunities', 'Contacts', 'Leads'] as const;

function ExportTab() {
  const [entity, setEntity] = useState<string>('Opportunities');
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      let data: any[] = [];
      if (entity === 'Opportunities') {
        const res = await apiService.getOpportunities();
        const raw = Array.isArray(res.data) ? res.data : (res.data?.opportunities || res.data?.data || []);
        data = raw;
      }
      // Convert to CSV
      if (data.length === 0) {
        toast.error('No data to export');
        return;
      }
      const headers = Object.keys(data[0]).filter((k) => typeof data[0][k] !== 'object');
      const rows = data.map((row) => headers.map((h) => {
        const val = row[h];
        const str = val == null ? '' : String(val);
        return str.includes(',') || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str;
      }).join(','));
      const csv = [headers.join(','), ...rows].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${entity.toLowerCase()}_export.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Exported ${data.length} ${entity.toLowerCase()}`);
    } catch (err: any) {
      toast.error(err.message || 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>CSV Export</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Download CRM data as a CSV file.
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          select
          label="Entity"
          value={entity}
          onChange={(e) => setEntity(e.target.value)}
          sx={{ minWidth: 200 }}
        >
          {EXPORT_ENTITIES.map((e) => (
            <MenuItem key={e} value={e}>{e}</MenuItem>
          ))}
        </TextField>
        <Button
          variant="contained"
          startIcon={exporting ? <CircularProgress size={18} /> : <DownloadIcon />}
          onClick={handleExport}
          disabled={exporting}
        >
          {exporting ? 'Exporting…' : 'Download CSV'}
        </Button>
      </Box>
    </Paper>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────

const DataTools: React.FC = () => {
  const [tab, setTab] = useState(0);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
        Data Tools
      </Typography>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tab icon={<UploadIcon />} iconPosition="start" label="Import" />
        <Tab icon={<DownloadIcon />} iconPosition="start" label="Export" />
        <Tab icon={<CleanupIcon />} iconPosition="start" label="Cleanup" />
      </Tabs>
      <TabPanel value={tab} index={0}>
        <ImportTab />
      </TabPanel>
      <TabPanel value={tab} index={1}>
        <ExportTab />
      </TabPanel>
      <TabPanel value={tab} index={2}>
        <Cleanup />
      </TabPanel>
    </Box>
  );
};

export default DataTools;
