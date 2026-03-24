import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Drawer,
  FormControl,
  IconButton,
  InputLabel,
  Link,
  List,
  ListItemButton,
  ListItemText,
  MenuItem,
  Select,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
  Chip,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Search as SearchIcon,
  Stop as StopIcon,
  Upload as UploadIcon,
  Check as CheckIcon,
  Download as DownloadIcon,
  History as HistoryIcon,
  ChevronRight as ChevronRightIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { pebbleService, type ProspectInput, type Profile, type ResearchSession, type TieredResearchResponse } from '../services/pebbleApi';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../contexts/PermissionsContext';
import PebbleChat from '../components/pebble/PebbleChat';
import ProspectTierTable from '../components/pebble/ProspectTierTable';
import toast from 'react-hot-toast';

const TARGET_FIELDS = [
  { id: 'first_name', label: 'First Name' },
  { id: 'last_name', label: 'Last Name' },
  { id: 'name', label: 'Name (split into First/Last)' },
  { id: 'email', label: 'Email' },
  { id: 'organizations', label: 'Organization(s)' },
];

const Pebble: React.FC = () => {
  const { user } = useAuth();
  const { can } = usePermissions();
  const hasAskPebble = can('use_pebble_chat');
  const [tab, setTab] = useState(0);

  // ── Research tab state ──
  const [contactId, setContactId] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [organization, setOrganization] = useState('');
  const [selectedTier, setSelectedTier] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tierResults, setTierResults] = useState<Array<{ tier: string; result: TieredResearchResponse; timestamp: number }>>([]);
  const [error, setError] = useState<string | null>(null);
  const [lastContactId, setLastContactId] = useState<string>('');
  const abortRef = useRef<AbortController | null>(null);
  const jobIdRef = useRef<string>('');
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackHistory, setFeedbackHistory] = useState<
    Array<{ id: number; claim_id: string; correct: number; text: string | null; contact_id: string; created_at: string }>
  >([]);

  // ── Import tab state ──
  const [csvText, setCsvText] = useState('');
  const [headers, setHeaders] = useState<string[]>([]);
  const [previewRows, setPreviewRows] = useState<Record<string, string>[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [orgColumns, setOrgColumns] = useState<string[]>([]);
  const [parsed, setParsed] = useState<{
    persons: Array<{
      id: string;
      first_name: string;
      last_name: string;
      email?: string;
      affiliations: Array<{ org_name: string; org_type: string }>;
    }>;
  } | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  const [batchId, setBatchId] = useState<string | null>(null);
  const [batchProspects, setBatchProspects] = useState<Array<{
    id: string; name: string; organization: string;
    crm_status: 'in_crm' | 'not_in_crm' | 'ambiguous' | 'not_found';
    identity_confidence: 'high' | 'medium' | 'low' | 'none';
    current_tier: 'pending' | 'T1' | 'T2' | 'T3';
  }>>([]);

  // ── History panel state ──
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historySessions, setHistorySessions] = useState<ResearchSession[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await pebbleService.getHistory(100);
      setHistorySessions(res.data.sessions || []);
    } catch {
      // Silently fail — history is supplementary
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleLoadSession = async (session: ResearchSession) => {
    try {
      const res = await pebbleService.getSession(session.id);
      setProfile(res.data.profile || null);
      setLastContactId(session.contact_id);
      setTab(0);
      toast.success(`Loaded profile for ${session.prospect_name || session.contact_id}`);
    } catch {
      toast.error('Failed to load session');
    }
  };

  const handleDownloadMarkdown = async () => {
    if (!lastContactId) return;
    try {
      const res = await pebbleService.exportProfile(lastContactId, 'md');
      const blob = new Blob([res.data], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `profile-${lastContactId}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Profile downloaded');
    } catch {
      toast.error('Failed to download profile');
    }
  };

  // ── Research handlers ──
  const handleRequestResearch = async () => {
    const id = contactId.trim() || `p-${Date.now()}`;
    setLastContactId(id);

    setLoading(true);
    setError(null);

    // T3 replaces all prior tier results; T1/T2 accumulate
    if (selectedTier === 3) {
      setTierResults([]);
      setProfile(null);
    }

    try {
      const res = await pebbleService.tieredResearch({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        organization: organization.trim(),
        contact_id: id,
        tier: selectedTier,
      });
      const data = res.data;

      // Accumulate tier results (T1/T2 stack, T3 replaces)
      setTierResults((prev) =>
        selectedTier === 3
          ? [{ tier: data.tier, result: data, timestamp: Date.now() }]
          : [...prev, { tier: data.tier, result: data, timestamp: Date.now() }],
      );

      // For T3, also fetch the full profile for the legacy profile display
      if (selectedTier === 3) {
        try {
          const profileRes = await pebbleService.getProfile(data.contact_id || id);
          setProfile(profileRes.data.profile || null);
          const fbRes = await pebbleService.getContactFeedback(data.contact_id || id);
          setFeedbackHistory(fbRes.data.feedback || []);
        } catch {
          setFeedbackHistory([]);
        }
        fetchHistory();
      }

      const tierLabel = `T${selectedTier}`;
      const costStr = data.cost_usd > 0 ? ` ($${data.cost_usd.toFixed(3)})` : '';
      toast.success(`${tierLabel} complete in ${data.elapsed_seconds.toFixed(1)}s${costStr}`);
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || 'Tiered research failed';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    if (jobIdRef.current) {
      pebbleService.cancelResearch(jobIdRef.current).catch(() => {});
    }
    if (abortRef.current) {
      abortRef.current.abort();
    }
  };

  // ── Import handlers ──
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
    setImportLoading(true);
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
      setImportLoading(false);
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

    setImportLoading(true);
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
      setImportLoading(false);
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

  const HISTORY_WIDTH = 300;

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Typography variant="h5" sx={{ flexGrow: 1 }}>
          Pebble — Prospect Research
        </Typography>
        <Button
          variant={historyOpen ? 'contained' : 'outlined'}
          size="small"
          startIcon={<HistoryIcon />}
          onClick={() => setHistoryOpen(!historyOpen)}
        >
          History
        </Button>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Enriches from ProPublica 990, SEC EDGAR, FEC, USAspending, OpenCorporates, and Wikipedia.
      </Typography>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Research" />
        <Tab label="Bulk Import" />
        {hasAskPebble && <Tab label="Ask Pebble" />}
      </Tabs>

      {/* ── Tab 0: Single-Prospect Research ── */}
      {tab === 0 && (
        <>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                <TextField
                  label="Contact ID"
                  value={contactId}
                  onChange={(e) => setContactId(e.target.value)}
                  placeholder="Optional"
                  size="small"
                />
                <TextField
                  label="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  size="small"
                />
                <TextField
                  label="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  size="small"
                />
                <TextField
                  label="Organization"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  size="small"
                  sx={{ minWidth: 200 }}
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                <ToggleButtonGroup
                  value={selectedTier}
                  exclusive
                  onChange={(_, v) => v !== null && setSelectedTier(v)}
                  size="small"
                >
                  <ToggleButton value={1}>Quick ID</ToggleButton>
                  <ToggleButton value={2}>Structured</ToggleButton>
                  <ToggleButton value={3}>Full Research</ToggleButton>
                </ToggleButtonGroup>
                <Button
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={16} /> : <SearchIcon />}
                  onClick={handleRequestResearch}
                  disabled={loading || (!firstName && !lastName && !organization)}
                >
                  {loading ? 'Running...' : `Run T${selectedTier}`}
                </Button>
                {loading && (
                  <Button variant="contained" color="error" startIcon={<StopIcon />} onClick={handleStop}>
                    Stop
                  </Button>
                )}
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                {selectedTier === 1 && 'Quick ID & Triage — ~5s, ~$0.005'}
                {selectedTier === 2 && 'Structured Intelligence — ~20s, ~$0.05'}
                {selectedTier === 3 && 'Full Research Brief — ~1min, ~$0.20'}
              </Typography>
            </CardContent>
          </Card>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* ── Tier Results (T1/T2 accumulate, T3 replaces) ── */}
          {tierResults.length > 0 && (
            <Box sx={{ mb: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {tierResults.map((tr, idx) => (
                <Card key={idx} variant="outlined">
                  <CardContent sx={{ pb: '12px !important' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Chip
                        label={`${tr.tier} \u00b7 ${tr.result.elapsed_seconds.toFixed(1)}s${tr.result.cost_usd > 0 ? ` \u00b7 $${tr.result.cost_usd.toFixed(3)}` : ''}`}
                        size="small"
                        color={tr.tier === 'T1' ? 'primary' : tr.tier === 'T2' ? 'secondary' : 'warning'}
                        variant="outlined"
                      />
                      {tr.result.sources.length > 0 && (
                        <Typography variant="caption" color="text.secondary">
                          {tr.result.sources.length} sources
                        </Typography>
                      )}
                    </Box>

                    {/* T1: Identity card */}
                    {tr.tier === 'T1' && tr.result.data?.identity_card && (
                      <Box>
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{tr.result.text}</Typography>
                      </Box>
                    )}

                    {/* T2: 5 dimensions in accordions */}
                    {tr.tier === 'T2' && tr.result.data?.dimensions && (
                      <Box>
                        <Typography variant="body2" sx={{ mb: 1 }}>{tr.result.data.claims_count} claims across 5 dimensions</Typography>
                        {Object.entries(tr.result.data.dimensions as Record<string, Array<{ text: string; source_url?: string }>>).map(([dim, claims]) => (
                          <Accordion key={dim} disableGutters variant="outlined" sx={{ '&:before': { display: 'none' } }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ minHeight: 36, '& .MuiAccordionSummary-content': { my: 0.5 } }}>
                              <Typography variant="body2" sx={{ fontWeight: 600, textTransform: 'capitalize' }}>
                                {dim.replace(/_/g, ' ')} ({claims.length})
                              </Typography>
                            </AccordionSummary>
                            <AccordionDetails sx={{ pt: 0 }}>
                              {claims.length > 0 ? claims.map((c, i) => (
                                <Typography key={i} variant="body2" sx={{ pl: 1, borderLeft: '2px solid', borderColor: 'divider', mb: 0.5, fontSize: '0.85rem' }}>
                                  {c.text}
                                </Typography>
                              )) : (
                                <Typography variant="body2" color="text.secondary">No data found</Typography>
                              )}
                            </AccordionDetails>
                          </Accordion>
                        ))}
                      </Box>
                    )}

                    {/* T1/T2 fallback: plain text */}
                    {!((tr.tier === 'T1' && tr.result.data?.identity_card) || (tr.tier === 'T2' && tr.result.data?.dimensions)) && tr.tier !== 'T3' && (
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{tr.result.text}</Typography>
                    )}

                    {/* T3: summary teaser (full profile renders below) */}
                    {tr.tier === 'T3' && (
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{tr.result.text}</Typography>
                    )}
                  </CardContent>
                </Card>
              ))}
              <Button size="small" onClick={() => { setTierResults([]); setProfile(null); }} sx={{ alignSelf: 'flex-start', textTransform: 'none' }}>
                Clear Results
              </Button>
            </Box>
          )}

          {profile && (
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h6" sx={{ flexGrow: 1 }}>
                    Profile
                    {profile.partial && (
                      <Chip label="Partial" size="small" color="warning" sx={{ ml: 1 }} />
                    )}
                    {profile.confidence_score && (
                      <Chip
                        label={profile.confidence_score}
                        size="small"
                        color={
                          profile.confidence_score === 'high'
                            ? 'success'
                            : profile.confidence_score === 'medium'
                              ? 'warning'
                              : 'default'
                        }
                        sx={{ ml: 1 }}
                      />
                    )}
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<DownloadIcon />}
                    onClick={handleDownloadMarkdown}
                  >
                    Download Markdown
                  </Button>
                </Box>
                {profile.summary && (
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {profile.summary}
                  </Typography>
                )}
                <Typography variant="subtitle2" gutterBottom>
                  Claims ({profile.claims.length})
                </Typography>
                {profile.claims.map((c, i) => (
                  <Box key={i} sx={{ mb: 1, pl: 1, borderLeft: 2, borderColor: 'divider' }}>
                    <Typography variant="body2">{c.text}</Typography>
                    <Link href={c.source_url} target="_blank" rel="noopener" variant="caption">
                      Source
                    </Link>
                    <Chip label={c.confidence} size="small" sx={{ ml: 1 }} />
                    <Button
                      size="small"
                      onClick={() =>
                        pebbleService
                          .submitFeedback(`${lastContactId}-claim-${i}`, true, undefined, lastContactId)
                          .then(() => toast.success('Thanks!'))
                      }
                      sx={{ ml: 1 }}
                    >
                      Correct
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      onClick={() =>
                        pebbleService
                          .submitFeedback(`${lastContactId}-claim-${i}`, false, undefined, lastContactId)
                          .then(() => toast.success('Noted'))
                      }
                      sx={{ ml: 0.5 }}
                    >
                      Incorrect
                    </Button>
                  </Box>
                ))}

                {/* General text feedback */}
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    General Feedback
                  </Typography>
                  <TextField
                    multiline
                    rows={2}
                    fullWidth
                    size="small"
                    placeholder="Add feedback about this research profile..."
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    sx={{ mb: 1 }}
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    disabled={!feedbackText.trim()}
                    onClick={async () => {
                      try {
                        await pebbleService.submitFeedback(
                          `${lastContactId}-general`,
                          true,
                          feedbackText.trim(),
                          lastContactId,
                        );
                        toast.success('Feedback submitted');
                        setFeedbackText('');
                        // Refresh feedback history
                        const fbRes = await pebbleService.getContactFeedback(lastContactId);
                        setFeedbackHistory(fbRes.data.feedback || []);
                      } catch {
                        toast.error('Failed to submit feedback');
                      }
                    }}
                  >
                    Submit Feedback
                  </Button>
                </Box>

                {/* Previous feedback history */}
                {feedbackHistory.length > 0 && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Previous Feedback ({feedbackHistory.length})
                    </Typography>
                    {feedbackHistory.map((fb) => {
                      const date = fb.created_at
                        ? new Date(fb.created_at + 'Z').toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })
                        : '';
                      const icon = fb.correct ? 'Correct' : 'Incorrect';
                      const claimLabel = fb.claim_id.replace(`${fb.contact_id}-`, '');
                      return (
                        <Typography key={fb.id} variant="body2" sx={{ mb: 0.5, color: 'text.secondary' }}>
                          {date}: {icon} — {claimLabel}
                          {fb.text ? ` — "${fb.text}"` : ''}
                        </Typography>
                      );
                    })}
                  </Box>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* ── Tab 1: Bulk Import ── */}
      {tab === 1 && (
        <>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Upload a messy spreadsheet. Map columns to First Name, Last Name, Organization(s).
                EIN is not required — Pebble finds it when needed.
              </Typography>
              <Button variant="outlined" component="label" startIcon={<UploadIcon />} sx={{ mb: 2 }}>
                Upload CSV
                <input type="file" accept=".csv" hidden onChange={handleFileUpload} />
              </Button>

              {headers.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Column mapping
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                    {!columnMapping.name && (
                      <>
                        <FormControl size="small" sx={{ minWidth: 140 }}>
                          <InputLabel>First Name</InputLabel>
                          <Select
                            value={columnMapping.first_name || ''}
                            label="First Name"
                            onChange={(e) =>
                              setColumnMapping({ ...columnMapping, first_name: e.target.value })
                            }
                          >
                            <MenuItem value="">—</MenuItem>
                            {headers.map((h) => (
                              <MenuItem key={h} value={h}>
                                {h}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <FormControl size="small" sx={{ minWidth: 140 }}>
                          <InputLabel>Last Name</InputLabel>
                          <Select
                            value={columnMapping.last_name || ''}
                            label="Last Name"
                            onChange={(e) =>
                              setColumnMapping({ ...columnMapping, last_name: e.target.value })
                            }
                          >
                            <MenuItem value="">—</MenuItem>
                            {headers.map((h) => (
                              <MenuItem key={h} value={h}>
                                {h}
                              </MenuItem>
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
                          <MenuItem key={h} value={h}>
                            {h}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <InputLabel>Email</InputLabel>
                      <Select
                        value={columnMapping.email || ''}
                        label="Email"
                        onChange={(e) =>
                          setColumnMapping({ ...columnMapping, email: e.target.value })
                        }
                      >
                        <MenuItem value="">—</MenuItem>
                        {headers.map((h) => (
                          <MenuItem key={h} value={h}>
                            {h}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                  <Typography variant="caption" display="block" sx={{ mb: 1 }}>
                    Organization columns (optional)
                  </Typography>
                  {orgColumns.map((col, i) => (
                    <FormControl key={i} size="small" sx={{ minWidth: 160, mr: 1, mb: 1 }}>
                      <Select
                        value={col}
                        displayEmpty
                        onChange={(e) => updateOrgColumn(i, e.target.value)}
                      >
                        <MenuItem value="">—</MenuItem>
                        {headers.map((h) => (
                          <MenuItem key={h} value={h}>
                            {h}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ))}
                  <Button size="small" onClick={addOrgColumn} sx={{ ml: 1 }}>
                    + Org column
                  </Button>
                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="contained"
                      startIcon={importLoading ? null : <CheckIcon />}
                      onClick={handleParse}
                      disabled={
                        importLoading ||
                        (!columnMapping.name && !columnMapping.first_name && !columnMapping.last_name)
                      }
                    >
                      {importLoading ? 'Importing...' : 'Import'}
                    </Button>
                  </Box>
                </Box>
              )}

              {previewRows.length > 0 && (
                <Box sx={{ mt: 2, overflow: 'auto', maxHeight: 200 }}>
                  <Typography variant="caption" color="text.secondary">
                    Preview (first 20 rows)
                  </Typography>
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
                      setImportLoading(true);
                      try {
                        await apiService.prospectImportWriteToCrm(sessionId || undefined);
                        toast.success('Written to Salesforce');
                      } catch (err: any) {
                        toast.error(err.response?.data?.detail?.error || 'Write failed');
                      } finally {
                        setImportLoading(false);
                      }
                    }}
                    disabled={importLoading}
                  >
                    Write to CRM (Salesforce)
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={async () => {
                      if (!parsed?.persons?.length) return;
                      setImportLoading(true);
                      try {
                        const prospects = parsed.persons.map((p) => ({
                          name: `${p.first_name} ${p.last_name}`.trim(),
                          organization: p.affiliations?.[0]?.org_name || '',
                        }));
                        const res = await pebbleService.batchResearch({
                          prospects,
                          target_tier: 1,
                          user_email: user?.email,
                        });
                        setBatchId(res.data.batch_id);
                        // Fetch batch prospects for table
                        const batchRes = await pebbleService.getBatchStatus(res.data.batch_id);
                        setBatchProspects(
                          (batchRes.data.prospects || []).map((p: any) => ({
                            id: p.id,
                            name: p.prospect_name || '',
                            organization: p.prospect_org || '',
                            crm_status: p.crm_status || 'unknown',
                            identity_confidence: p.identity_confidence || 'none',
                            current_tier: p.current_tier || 'pending',
                          })),
                        );
                        toast.success(`T1 complete — ${res.data.completed} prospects identified`);
                      } catch (err: any) {
                        toast.error(err.response?.data?.detail || 'Batch research failed');
                      } finally {
                        setImportLoading(false);
                      }
                    }}
                    disabled={importLoading || !parsed?.persons?.length}
                  >
                    Start Tiered Research (T1)
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
                        <TableCell>
                          {p.first_name} {p.last_name}
                        </TableCell>
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

          {/* ── Batch Tier Results (ProspectTierTable) ── */}
          {batchProspects.length > 0 && (
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  Tiered Research Results
                </Typography>
                <ProspectTierTable
                  prospects={batchProspects}
                  loading={importLoading}
                  onAdvanceSelected={async (selectedIds, targetTier) => {
                    if (!batchId) return;
                    setImportLoading(true);
                    try {
                      const tier = targetTier === 20 ? 2 : 3;
                      await pebbleService.batchResearch({
                        prospects: [],
                        target_tier: tier,
                        batch_id: batchId,
                        selected_ids: selectedIds,
                      } as any);
                      // Refresh batch data
                      const batchRes = await pebbleService.getBatchStatus(batchId);
                      setBatchProspects(
                        (batchRes.data.prospects || []).map((p: any) => ({
                          id: p.id,
                          name: p.prospect_name || '',
                          organization: p.prospect_org || '',
                          crm_status: p.crm_status || 'unknown',
                          identity_confidence: p.identity_confidence || 'none',
                          current_tier: p.current_tier || 'pending',
                        })),
                      );
                      toast.success(`T${tier} complete for ${selectedIds.length} prospects`);
                    } catch (err: any) {
                      toast.error(err.response?.data?.detail || 'Advance failed');
                    } finally {
                      setImportLoading(false);
                    }
                  }}
                  onViewProfile={(prospectId) => {
                    setLastContactId(prospectId);
                    setTab(0);
                  }}
                />
              </CardContent>
            </Card>
          )}
        </>
      )}
      {/* ── Tab 2: Ask Pebble (permission-gated) ── */}
      {tab === 2 && hasAskPebble && (
        <Card>
          <CardContent>
            <PebbleChat mode="embedded" userEmail={user?.email} />
          </CardContent>
        </Card>
      )}
      {/* ── History Drawer ── */}
      <Drawer
        variant="persistent"
        anchor="right"
        open={historyOpen}
        sx={{
          '& .MuiDrawer-paper': {
            width: HISTORY_WIDTH,
            top: 'auto',
            height: 'calc(100% - 64px)',
            mt: '64px',
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Research History
            </Typography>
            <IconButton size="small" onClick={() => setHistoryOpen(false)}>
              <ChevronRightIcon />
            </IconButton>
          </Box>
          <Divider sx={{ mb: 1 }} />
          {historyLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={24} />
            </Box>
          ) : historySessions.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
              No research sessions yet.
            </Typography>
          ) : (
            <List dense disablePadding>
              {historySessions.map((session) => {
                const dateLabel = session.created_at
                  ? formatDistanceToNow(new Date(session.created_at + 'Z'), { addSuffix: true })
                  : '';
                return (
                  <ListItemButton
                    key={session.id}
                    onClick={() => handleLoadSession(session)}
                    sx={{ borderRadius: 1, mb: 0.5 }}
                  >
                    <ListItemText
                      primary={session.prospect_name || session.contact_id}
                      secondary={
                        <React.Fragment>
                          {session.prospect_org && (
                            <Typography variant="caption" component="span" display="block" noWrap>
                              {session.prospect_org}
                            </Typography>
                          )}
                          <Typography variant="caption" component="span" color="text.secondary">
                            {dateLabel}
                          </Typography>
                        </React.Fragment>
                      }
                      primaryTypographyProps={{ variant: 'body2', noWrap: true }}
                    />
                    <Chip
                      label={session.confidence_score}
                      size="small"
                      color={
                        session.confidence_score === 'high'
                          ? 'success'
                          : session.confidence_score === 'medium'
                            ? 'warning'
                            : 'default'
                      }
                      sx={{ ml: 1, minWidth: 56 }}
                    />
                  </ListItemButton>
                );
              })}
            </List>
          )}
        </Box>
      </Drawer>
    </Box>
  );
};

export default Pebble;
