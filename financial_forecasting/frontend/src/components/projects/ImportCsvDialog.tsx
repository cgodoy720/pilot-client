import React, { useState, useMemo, useCallback } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box,
  Alert, Chip, LinearProgress, FormControlLabel, Switch, Table, TableBody,
  TableCell, TableHead, TableRow,
} from '@mui/material';
import { Upload as UploadIcon, Warning as WarningIcon } from '@mui/icons-material';
import Papa from 'papaparse';
import toast from 'react-hot-toast';
import { apiService } from '../../services/api';
import type { Workstream } from './types';

const ALIASES: Record<string, string> = {
  workstream: 'workstream', work_stream: 'workstream', category: 'workstream',
  phase: 'workstream', stream: 'workstream', track: 'workstream',
  milestone: 'milestone', goal: 'milestone', objective: 'milestone',
  task: 'title', title: 'title', task_name: 'title', action_item: 'title',
  action: 'title', item: 'title', task_title: 'title',
  status: 'status', task_status: 'status',
  owner: 'owner', assigned_to: 'owner', assignee: 'owner', responsible: 'owner',
  deadline: 'deadline', due_date: 'deadline', due: 'deadline', target_date: 'deadline', end_date: 'deadline',
  start_date: 'start_date', start: 'start_date', begin_date: 'start_date',
  description: 'description', notes: 'description', details: 'description',
  priority: 'priority', milestone_priority: 'priority',
};

function normalizeKey(raw: string): string { return raw.trim().toLowerCase().replace(/[\s_-]+/g, '_'); }

function parseDate(raw: string): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) return trimmed.slice(0, 10);
  const parts = trimmed.split('/');
  if (parts.length === 3) { const [m, d, y] = parts; return `${y.length === 2 ? `20${y}` : y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`; }
  return null;
}

const STATUS_MAP: Record<string, string> = {
  'not started': 'Not Started', 'todo': 'Not Started', 'to do': 'Not Started', 'pending': 'Not Started',
  'in progress': 'In Progress', 'in-progress': 'In Progress', 'active': 'In Progress', 'wip': 'In Progress', 'working': 'In Progress', 'started': 'In Progress',
  'completed': 'Completed', 'complete': 'Completed', 'done': 'Completed', 'finished': 'Completed',
  'blocked': 'Blocked', 'stuck': 'Blocked',
  'on hold': 'On Hold', 'paused': 'On Hold', 'deferred': 'On Hold',
};
function normalizeStatus(raw: string): string { return raw ? (STATUS_MAP[raw.trim().toLowerCase()] || 'Not Started') : 'Not Started'; }

interface ParsedRow { workstream: string; milestone: string; title: string; status: string; owner: string; deadline: string | null; start_date: string | null; description: string; priority: string; }
interface ParsedHierarchy { workstreams: Array<{ name: string; milestones: Array<{ title: string; priority: string; owner: string; tasks: Array<{ title: string; status: string; owner: string; deadline: string | null; start_date: string | null; description: string }> }> }>; warnings: string[]; totalTasks: number; }

function parseToHierarchy(rows: ParsedRow[]): ParsedHierarchy {
  const warnings: string[] = [];
  const wsMap = new Map<string, Map<string, ParsedRow[]>>();
  for (const row of rows) {
    if (!row.title) continue;
    const wsName = row.workstream || 'Uncategorized';
    const msName = row.milestone || 'General';
    if (!wsMap.has(wsName)) wsMap.set(wsName, new Map());
    const msMap = wsMap.get(wsName)!;
    if (!msMap.has(msName)) msMap.set(msName, []);
    msMap.get(msName)!.push(row);
  }
  let totalTasks = 0;
  const workstreams = Array.from(wsMap.entries()).map(([wsName, msMap]) => ({
    name: wsName,
    milestones: Array.from(msMap.entries()).map(([msTitle, tasks]) => {
      totalTasks += tasks.length;
      const ownerCounts = new Map<string, number>();
      for (const t of tasks) { if (t.owner) ownerCounts.set(t.owner, (ownerCounts.get(t.owner) || 0) + 1); }
      const topOwner = Array.from(ownerCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || '';
      return { title: msTitle, priority: tasks[0]?.priority || 'Now', owner: topOwner,
        tasks: tasks.map((t) => ({ title: t.title, status: normalizeStatus(t.status), owner: t.owner, deadline: t.deadline, start_date: t.start_date, description: t.description })) };
    }),
  }));
  const noDeadline = rows.filter((r) => r.title && !r.deadline).length;
  if (noDeadline > 0) warnings.push(`${noDeadline} tasks have no deadline`);
  const noOwner = rows.filter((r) => r.title && !r.owner).length;
  if (noOwner > 0) warnings.push(`${noOwner} tasks have no owner`);
  return { workstreams, warnings, totalTasks };
}

interface ImportCsvDialogProps { open: boolean; onClose: () => void; projectId: string; existingWorkstreams: Workstream[]; onImportComplete: () => void; }

const ImportCsvDialog: React.FC<ImportCsvDialogProps> = ({ open, onClose, projectId, existingWorkstreams, onImportComplete }) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsed, setParsed] = useState<ParsedHierarchy | null>(null);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [replaceMode, setReplaceMode] = useState(false);
  const [importing, setImporting] = useState(false);
  const [columnMap, setColumnMap] = useState<Record<string, string>>({});

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { setParseErrors(['File exceeds 5 MB limit']); return; }
    setFile(f); setParseErrors([]); setParsed(null);
    Papa.parse(f, {
      header: true, skipEmptyLines: true,
      complete: (results) => {
        const rawRows = results.data as Record<string, string>[];
        if (rawRows.length === 0) { setParseErrors(['CSV has no data rows']); return; }
        if (rawRows.length > 10000) { setParseErrors([`Too many rows: ${rawRows.length} (limit 10,000)`]); return; }
        const headers = Object.keys(rawRows[0]);
        const mapping: Record<string, string> = {};
        for (const h of headers) { const c = ALIASES[normalizeKey(h)]; if (c) mapping[h] = c; }
        setColumnMap(mapping);
        if (!new Set(Object.values(mapping)).has('title')) { setParseErrors([`Cannot find a Task/Title column. Found: ${headers.join(', ')}`]); return; }
        const parsedRows: ParsedRow[] = rawRows.map((row) => {
          const fields: Record<string, string> = {};
          for (const [rh, v] of Object.entries(row)) { const c = mapping[rh]; if (c) fields[c] = (v || '').trim(); }
          return { workstream: fields.workstream || '', milestone: fields.milestone || '', title: fields.title || '', status: fields.status || '', owner: fields.owner || '', deadline: parseDate(fields.deadline || ''), start_date: parseDate(fields.start_date || ''), description: fields.description || '', priority: fields.priority || 'Now' };
        }).filter((r) => r.title);
        setParsed(parseToHierarchy(parsedRows));
      },
      error: (err: Error) => { setParseErrors([`Parse error: ${err.message}`]); },
    });
  }, []);

  const diffPreview = useMemo(() => {
    if (!parsed) return null;
    const eWs = new Set(existingWorkstreams.map((ws) => ws.name.toLowerCase()));
    const eMs = new Set(existingWorkstreams.flatMap((ws) => ws.milestones.map((m) => `${ws.name.toLowerCase()}::${m.title.toLowerCase()}`)));
    const eT = new Set(existingWorkstreams.flatMap((ws) => ws.milestones.flatMap((m) => m.tasks.map((t) => `${ws.name.toLowerCase()}::${m.title.toLowerCase()}::${t.title.toLowerCase()}`))));
    let newWs = 0, updatedWs = 0, newMs = 0, updatedMs = 0, newTasks = 0, updatedTasks = 0;
    for (const ws of parsed.workstreams) {
      if (eWs.has(ws.name.toLowerCase())) updatedWs++; else newWs++;
      for (const ms of ws.milestones) {
        if (eMs.has(`${ws.name.toLowerCase()}::${ms.title.toLowerCase()}`)) updatedMs++; else newMs++;
        for (const t of ms.tasks) { if (eT.has(`${ws.name.toLowerCase()}::${ms.title.toLowerCase()}::${t.title.toLowerCase()}`)) updatedTasks++; else newTasks++; }
      }
    }
    return { newWs, updatedWs, newMs, updatedMs, newTasks, updatedTasks };
  }, [parsed, existingWorkstreams]);

  const handleImport = async () => {
    if (!parsed || !projectId) return;
    setImporting(true);
    try {
      const payload = { workstreams: parsed.workstreams.map((ws) => ({ name: ws.name, milestones: ws.milestones.map((ms) => ({ title: ms.title, priority: ms.priority, owner: ms.owner, tasks: ms.tasks })) })), replace: replaceMode };
      const res = await apiService.importProjectData(projectId, payload);
      const s = res.data?.data;
      if (s) toast.success(`Imported: ${s.workstreams.new} new + ${s.workstreams.updated} updated workstreams, ${s.milestones.new} new + ${s.milestones.updated} updated milestones, ${s.tasks.new} new + ${s.tasks.updated} updated tasks`);
      else toast.success('Import complete');
      onImportComplete(); handleReset(); onClose();
    } catch (err: any) { toast.error(`Import failed: ${err.message}`); }
    finally { setImporting(false); }
  };

  const handleReset = () => { setFile(null); setParsed(null); setParseErrors([]); setReplaceMode(false); setColumnMap({}); };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Import CSV</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Button variant="outlined" component="label" startIcon={<UploadIcon />} fullWidth sx={{ py: 1.5 }}>
            {file ? file.name : 'Choose CSV file'}
            <input type="file" accept=".csv,.tsv,.txt" hidden onChange={handleFileSelect} />
          </Button>
        </Box>
        {parseErrors.length > 0 && <Alert severity="error" sx={{ mb: 2 }}>{parseErrors.map((e, i) => <div key={i}>{e}</div>)}</Alert>}
        {Object.keys(columnMap).length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>Column Mapping</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
              {Object.entries(columnMap).map(([raw, canonical]) => <Chip key={raw} label={`${raw} \u2192 ${canonical}`} size="small" variant="outlined" />)}
            </Box>
          </Box>
        )}
        {parsed && (
          <>
            <Table size="small" sx={{ mb: 2 }}>
              <TableHead><TableRow>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Item</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Count</TableCell>
                {diffPreview && !replaceMode && <><TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.75rem', color: 'success.main' }}>New</TableCell><TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.75rem', color: 'info.main' }}>Updated</TableCell></>}
              </TableRow></TableHead>
              <TableBody>
                <TableRow><TableCell sx={{ fontSize: '0.8rem' }}>Workstreams</TableCell><TableCell align="right" sx={{ fontSize: '0.8rem' }}>{parsed.workstreams.length}</TableCell>{diffPreview && !replaceMode && <><TableCell align="right" sx={{ fontSize: '0.8rem', color: 'success.main' }}>{diffPreview.newWs}</TableCell><TableCell align="right" sx={{ fontSize: '0.8rem', color: 'info.main' }}>{diffPreview.updatedWs}</TableCell></>}</TableRow>
                <TableRow><TableCell sx={{ fontSize: '0.8rem' }}>Milestones</TableCell><TableCell align="right" sx={{ fontSize: '0.8rem' }}>{parsed.workstreams.reduce((s, ws) => s + ws.milestones.length, 0)}</TableCell>{diffPreview && !replaceMode && <><TableCell align="right" sx={{ fontSize: '0.8rem', color: 'success.main' }}>{diffPreview.newMs}</TableCell><TableCell align="right" sx={{ fontSize: '0.8rem', color: 'info.main' }}>{diffPreview.updatedMs}</TableCell></>}</TableRow>
                <TableRow><TableCell sx={{ fontSize: '0.8rem' }}>Tasks</TableCell><TableCell align="right" sx={{ fontSize: '0.8rem' }}>{parsed.totalTasks}</TableCell>{diffPreview && !replaceMode && <><TableCell align="right" sx={{ fontSize: '0.8rem', color: 'success.main' }}>{diffPreview.newTasks}</TableCell><TableCell align="right" sx={{ fontSize: '0.8rem', color: 'info.main' }}>{diffPreview.updatedTasks}</TableCell></>}</TableRow>
              </TableBody>
            </Table>
            {parsed.warnings.length > 0 && <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 2 }}>{parsed.warnings.map((w, i) => <div key={i}>{w}</div>)}</Alert>}
            <FormControlLabel control={<Switch checked={replaceMode} onChange={(e) => setReplaceMode(e.target.checked)} color="error" />}
              label={<Typography variant="body2">Replace all existing data {replaceMode && <Chip label="Destructive" size="small" color="error" sx={{ ml: 0.5 }} />}</Typography>} />
          </>
        )}
        {importing && <LinearProgress sx={{ mt: 2 }} />}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => { handleReset(); onClose(); }}>Cancel</Button>
        <Button onClick={handleImport} variant="contained" disabled={!parsed || importing || parseErrors.length > 0} color={replaceMode ? 'error' : 'primary'}>
          {replaceMode ? 'Replace & Import' : 'Import'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImportCsvDialog;
