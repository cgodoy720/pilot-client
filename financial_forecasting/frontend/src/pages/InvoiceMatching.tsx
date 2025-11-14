import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Button,
  TextField,
  Typography,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  CircularProgress,
  Alert,
  Paper,
  Divider,
  Stack,
  IconButton,
  InputAdornment,
} from '@mui/material';
import {
  Search as SearchIcon,
  Link as LinkIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { apiService } from '../services/api';

interface Invoice {
  invoice_id: string;
  invoice_number: string;
  customer_name: string;
  customer_type: string;
  amount: string;
  due_amount: string;
  invoice_date: string;
  due_date: string;
  state: string;
  description?: string;
}

interface Opportunity {
  Id: string;
  Name: string;
  AccountName: string;
  Amount: number;
  StageName: string;
  CloseDate: string;
  Description: string;
  Type: string;
  matchScore?: number;
  matchExplanation?: {
    name_match?: number;
    amount_match?: number;
    date_proximity_days?: number;
    stage_bonus?: string;
  };
}

interface Match {
  opportunity_id: string;
  confidence: string;
  notes: string;
  matched_at: string;
}

interface MatchedInvoice extends Invoice {
  matched: boolean;
  opportunity_id?: string;
  match_confidence?: string;
  notes?: string;
}

export default function InvoiceMatching() {
  const [invoices, setInvoices] = useState<MatchedInvoice[]>([]);
  const [matches, setMatches] = useState<Record<string, Match>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'matched' | 'unmatched'>('unmatched');
  
  // Matching modal state
  const [matchDialogOpen, setMatchDialogOpen] = useState(false);
  const [matchingInvoice, setMatchingInvoice] = useState<MatchedInvoice | null>(null);
  const [oppSearchTerm, setOppSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Opportunity[]>([]);
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);
  const [confidence, setConfidence] = useState('Confirmed');
  const [notes, setNotes] = useState('');
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);

  // Define searchOpportunities first (before useEffect that uses it)
  const searchOpportunities = useCallback(async () => {
    if (!matchDialogOpen) return;
    setSearching(true);
    try {
      const res = await apiService.searchOpportunities(oppSearchTerm, 50, matchingInvoice ? {
        customer_name: matchingInvoice.customer_name,
        invoice_amount: parseFloat(matchingInvoice.amount),
        invoice_date: matchingInvoice.invoice_date
      } : undefined);
      setSearchResults(res.data.opportunities || []);
    } catch (error) {
      console.error('Error searching opportunities:', error);
    } finally {
      setSearching(false);
    }
  }, [oppSearchTerm, matchingInvoice, matchDialogOpen]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (oppSearchTerm.length >= 2 && matchDialogOpen) {
        searchOpportunities();
      } else if (matchDialogOpen) {
        setSearchResults([]);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [oppSearchTerm, matchDialogOpen, searchOpportunities]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [invoicesRes, matchesRes] = await Promise.all([
        apiService.getGrantInvoices(),
        apiService.getInvoiceMatches()
      ]);

      const invoicesData = invoicesRes.data.invoices || [];
      const matchesData = matchesRes.data.matches || {};

      setMatches(matchesData);

      const mergedInvoices = invoicesData.map((inv: Invoice) => ({
        ...inv,
        matched: inv.invoice_id in matchesData,
        opportunity_id: matchesData[inv.invoice_id]?.opportunity_id || '',
        match_confidence: matchesData[inv.invoice_id]?.confidence || '',
        notes: matchesData[inv.invoice_id]?.notes || '',
      }));

      setInvoices(mergedInvoices);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Failed to load invoice data');
    } finally {
      setLoading(false);
    }
  };

  const startMatching = (invoice: MatchedInvoice) => {
    setMatchingInvoice(invoice);
    setMatchDialogOpen(true);
    setSelectedOpp(null);
    setOppSearchTerm(invoice.customer_name);
    setConfidence('Confirmed');
    setNotes('');
  };

  const saveMatch = async () => {
    if (!matchingInvoice || !selectedOpp) return;

    setSaving(true);
    try {
      await apiService.saveInvoiceMatch({
        invoice_id: matchingInvoice.invoice_id,
        opportunity_id: selectedOpp.Id,
        confidence: confidence,
        notes: notes,
        customer_name: matchingInvoice.customer_name,
        invoice_amount: parseFloat(matchingInvoice.amount),
        invoice_date: matchingInvoice.invoice_date,
      });

      alert('✓ Match saved successfully!');
      setMatchDialogOpen(false);
      setMatchingInvoice(null);
      setSelectedOpp(null);
      await loadData();
    } catch (error) {
      console.error('Error saving match:', error);
      alert('Failed to save match');
    } finally {
      setSaving(false);
    }
  };

  const deleteMatch = async (invoiceId: string) => {
    if (!window.confirm('Delete this match?')) return;

    try {
      await apiService.deleteInvoiceMatch(invoiceId);
      alert('✓ Match deleted');
      await loadData();
    } catch (error) {
      console.error('Error deleting match:', error);
      alert('Failed to delete match');
    }
  };

  const filteredInvoices = invoices.filter((inv) => {
    if (filterStatus === 'matched' && !inv.matched) return false;
    if (filterStatus === 'unmatched' && inv.matched) return false;

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        inv.customer_name.toLowerCase().includes(search) ||
        inv.invoice_number?.toLowerCase().includes(search) ||
        inv.invoice_id.toLowerCase().includes(search) ||
        inv.amount.toLowerCase().includes(search)
      );
    }

    return true;
  });

  const stats = {
    total: invoices.length,
    matched: invoices.filter((inv) => inv.matched).length,
    unmatched: invoices.filter((inv) => !inv.matched).length,
    totalAmount: invoices.reduce((sum, inv) => sum + parseFloat(inv.amount || '0'), 0),
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          🔗 Invoice → Opportunity Matching
        </Typography>
        <Typography variant="body1">
          Match Sage Intacct grant invoices to Salesforce opportunities
        </Typography>
      </Paper>

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderLeft: '4px solid #2196f3' }}>
            <CardContent>
              <Typography color="textSecondary" variant="body2">Total Invoices</Typography>
              <Typography variant="h4" fontWeight="bold">{stats.total.toLocaleString()}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderLeft: '4px solid #4caf50' }}>
            <CardContent>
              <Typography color="textSecondary" variant="body2">Matched</Typography>
              <Typography variant="h4" fontWeight="bold" color="success.main">
                {stats.matched.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderLeft: '4px solid #ff9800' }}>
            <CardContent>
              <Typography color="textSecondary" variant="body2">Unmatched</Typography>
              <Typography variant="h4" fontWeight="bold" color="warning.main">
                {stats.unmatched.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderLeft: '4px solid #9c27b0' }}>
            <CardContent>
              <Typography color="textSecondary" variant="body2">Total Amount</Typography>
              <Typography variant="h5" fontWeight="bold">
                ${stats.totalAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Controls */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <TextField
            fullWidth
            placeholder="Search invoices by customer name, ID, or amount..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Stack direction="row" spacing={1}>
            <Button
              variant={filterStatus === 'all' ? 'contained' : 'outlined'}
              onClick={() => setFilterStatus('all')}
            >
              All ({stats.total})
            </Button>
            <Button
              variant={filterStatus === 'unmatched' ? 'contained' : 'outlined'}
              onClick={() => setFilterStatus('unmatched')}
              color="warning"
            >
              Unmatched ({stats.unmatched})
            </Button>
            <Button
              variant={filterStatus === 'matched' ? 'contained' : 'outlined'}
              onClick={() => setFilterStatus('matched')}
              color="success"
            >
              Matched ({stats.matched})
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* Invoice Cards */}
      <Stack spacing={2}>
        {filteredInvoices.slice(0, 50).map((invoice) => (
          <Card key={invoice.invoice_id} sx={{ borderLeft: invoice.matched ? '4px solid #4caf50' : '4px solid #ccc' }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={8}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                    <Chip
                      icon={invoice.matched ? <CheckCircleIcon /> : <WarningIcon />}
                      label={invoice.matched ? 'Matched' : 'Unmatched'}
                      color={invoice.matched ? 'success' : 'warning'}
                      size="small"
                    />
                    <Typography variant="caption" color="textSecondary">
                      Invoice #{invoice.invoice_id}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {invoice.invoice_date}
                    </Typography>
                  </Stack>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="caption" color="textSecondary">Customer</Typography>
                      <Typography variant="body1" fontWeight="600">{invoice.customer_name}</Typography>
                      <Chip label={invoice.customer_type} size="small" sx={{ mt: 0.5 }} />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="caption" color="textSecondary">Amount</Typography>
                      <Typography variant="h6" color="success.main" fontWeight="bold">
                        ${parseFloat(invoice.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </Typography>
                      {parseFloat(invoice.due_amount) > 0 && (
                        <Typography variant="caption" color="warning.main">
                          Due: ${parseFloat(invoice.due_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </Typography>
                      )}
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="caption" color="textSecondary">Status</Typography>
                      <Typography variant="body1">{invoice.state}</Typography>
                      {invoice.due_date && (
                        <Typography variant="caption" color="textSecondary">Due: {invoice.due_date}</Typography>
                      )}
                    </Grid>
                  </Grid>

                  {invoice.matched && invoice.opportunity_id && (
                    <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #e0e0e0' }}>
                      <Typography variant="caption" color="textSecondary">Matched to Opportunity</Typography>
                      <Typography variant="body2" color="primary" fontWeight="600">
                        {invoice.opportunity_id}
                      </Typography>
                      {invoice.notes && (
                        <Typography variant="caption" color="textSecondary">{invoice.notes}</Typography>
                      )}
                    </Box>
                  )}
                </Grid>

                <Grid item xs={12} md={4} sx={{ textAlign: 'right' }}>
                  {!invoice.matched ? (
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<LinkIcon />}
                      onClick={() => startMatching(invoice)}
                      fullWidth
                    >
                      Match to Opportunity
                    </Button>
                  ) : (
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => deleteMatch(invoice.invoice_id)}
                      fullWidth
                    >
                      Unmatch
                    </Button>
                  )}
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {filteredInvoices.length === 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          No invoices found matching your filters.
        </Alert>
      )}

      {filteredInvoices.length > 50 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          Showing first 50 of {filteredInvoices.length} invoices. Use search to find specific invoices.
        </Alert>
      )}

      {/* Matching Dialog */}
      <Dialog open={matchDialogOpen} onClose={() => setMatchDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Match Invoice to Opportunity</Typography>
            <IconButton onClick={() => setMatchDialogOpen(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {matchingInvoice && (
            <>
              <Grid container spacing={3} sx={{ mb: 3 }}>
                {/* Invoice Details */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, bgcolor: '#e3f2fd' }}>
                    <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                      📄 Invoice Details
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="body2"><strong>Customer:</strong> {matchingInvoice.customer_name}</Typography>
                    <Typography variant="h6" color="success.main" sx={{ my: 1 }}>
                      ${parseFloat(matchingInvoice.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </Typography>
                    <Typography variant="body2"><strong>Date:</strong> {matchingInvoice.invoice_date}</Typography>
                    <Typography variant="body2"><strong>Type:</strong> {matchingInvoice.customer_type}</Typography>
                  </Paper>
                </Grid>

                {/* Selected Opportunity */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, bgcolor: '#f3e5f5' }}>
                    <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                      🎯 Selected Opportunity
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    {selectedOpp ? (
                      <>
                        <Typography variant="body2"><strong>Name:</strong> {selectedOpp.Name}</Typography>
                        <Typography variant="body2"><strong>Account:</strong> {selectedOpp.AccountName}</Typography>
                        <Typography variant="h6" color="primary" sx={{ my: 1 }}>
                          ${(selectedOpp.Amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </Typography>
                        <Typography variant="body2"><strong>Stage:</strong> {selectedOpp.StageName}</Typography>
                        <Typography variant="body2"><strong>Close Date:</strong> {selectedOpp.CloseDate}</Typography>
                      </>
                    ) : (
                      <Typography variant="body2" color="textSecondary" textAlign="center" sx={{ py: 2 }}>
                        Search and select an opportunity below
                      </Typography>
                    )}
                  </Paper>
                </Grid>
              </Grid>

              {/* Opportunity Search */}
              <TextField
                fullWidth
                label="Search Salesforce Opportunities"
                placeholder="Search by opportunity name or account name..."
                value={oppSearchTerm}
                onChange={(e) => setOppSearchTerm(e.target.value)}
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      {searching ? <CircularProgress size={20} /> : <SearchIcon />}
                    </InputAdornment>
                  ),
                }}
              />

              {/* Search Results */}
              {searchResults.length > 0 && (
                <Paper variant="outlined" sx={{ maxHeight: 400, overflow: 'auto', mb: 2 }}>
                  <List>
                    {searchResults.map((opp, index) => {
                      const isBestMatch = index === 0 && (opp.matchScore || 0) > 50;
                      return (
                        <ListItem 
                          key={opp.Id} 
                          disablePadding
                          sx={{
                            borderLeft: isBestMatch ? '4px solid #4caf50' : 'none',
                            bgcolor: isBestMatch ? 'action.hover' : 'inherit'
                          }}
                        >
                          <ListItemButton
                            selected={selectedOpp?.Id === opp.Id}
                            onClick={() => setSelectedOpp(opp)}
                          >
                            <Box sx={{ width: '100%' }}>
                              <Stack direction="row" justifyContent="space-between" alignItems="start">
                                <Box flex={1}>
                                  <Stack direction="row" spacing={1} alignItems="center">
                                    <Typography variant="subtitle1">{opp.Name}</Typography>
                                    {isBestMatch && (
                                      <Chip 
                                        label="Best Match" 
                                        size="small" 
                                        color="success" 
                                        icon={<CheckCircleIcon />}
                                      />
                                    )}
                                    {opp.matchScore && (
                                      <Chip 
                                        label={`${Math.round(opp.matchScore)}% match`}
                                        size="small"
                                        color={
                                          opp.matchScore >= 70 ? 'success' :
                                          opp.matchScore >= 50 ? 'warning' : 'default'
                                        }
                                      />
                                    )}
                                  </Stack>
                                  <Typography variant="body2" color="text.secondary">
                                    {opp.AccountName}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {opp.StageName} • {opp.CloseDate}
                                  </Typography>
                                  {opp.matchExplanation && opp.matchScore && (
                                    <Box mt={0.5}>
                                      <Typography variant="caption" color="text.secondary">
                                        {opp.matchExplanation.name_match && (
                                          <span>Name: {Math.round(opp.matchExplanation.name_match)}% • </span>
                                        )}
                                        {opp.matchExplanation.amount_match !== undefined && (
                                          <span>Amount: {Math.round(opp.matchExplanation.amount_match)}% • </span>
                                        )}
                                        {opp.matchExplanation.date_proximity_days !== undefined && opp.matchExplanation.date_proximity_days !== null && (
                                          <span>{opp.matchExplanation.date_proximity_days} days apart • </span>
                                        )}
                                        {opp.matchExplanation.stage_bonus && (
                                          <span>{opp.matchExplanation.stage_bonus}</span>
                                        )}
                                      </Typography>
                                    </Box>
                                  )}
                                </Box>
                                <Typography variant="h6" color="primary" sx={{ ml: 2 }}>
                                  ${(opp.Amount || 0).toLocaleString()}
                                </Typography>
                              </Stack>
                            </Box>
                          </ListItemButton>
                        </ListItem>
                      );
                    })}
                  </List>
                </Paper>
              )}

              {/* Confidence & Notes */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Confidence Level</InputLabel>
                    <Select value={confidence} onChange={(e) => setConfidence(e.target.value)} label="Confidence Level">
                      <MenuItem value="Confirmed">✅ Confirmed</MenuItem>
                      <MenuItem value="High">🟢 High</MenuItem>
                      <MenuItem value="Medium">🟡 Medium</MenuItem>
                      <MenuItem value="Low">🔴 Low</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Notes (Optional)"
                    placeholder="Add any notes about this match..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </Grid>
              </Grid>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMatchDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={saveMatch}
            disabled={!selectedOpp || saving}
            startIcon={saving ? <CircularProgress size={20} /> : <CheckCircleIcon />}
          >
            {saving ? 'Saving...' : 'Save Match'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
