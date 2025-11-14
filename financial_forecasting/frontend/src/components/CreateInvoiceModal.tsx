import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  MenuItem,
  Alert,
  Divider,
  CircularProgress,
  Autocomplete,
} from '@mui/material';
import { format } from 'date-fns';
import { apiService } from '../services/api';

interface Payment {
  Id: string;
  PaymentAmount: number;
  ScheduledDate: string;
  OpportunityName: string;
  AccountName: string;
  OpportunityId: string;
}

interface CreateInvoiceModalProps {
  open: boolean;
  payment: Payment | null;
  onClose: () => void;
  onSubmit: (invoiceData: any) => void;
  loading?: boolean;
}

const PAYMENT_TERMS = [
  { value: 'NET_30', label: 'Net 30' },
  { value: 'NET_60', label: 'Net 60' },
  { value: 'NET_90', label: 'Net 90' },
  { value: 'DUE_ON_RECEIPT', label: 'Due on Receipt' },
];

export default function CreateInvoiceModal({
  open,
  payment,
  onClose,
  onSubmit,
  loading = false,
}: CreateInvoiceModalProps) {
  const today = format(new Date(), 'yyyy-MM-dd');
  const defaultDueDate = payment?.ScheduledDate || today;

  const [formData, setFormData] = useState({
    customer: payment?.AccountName || '',
    invoiceDate: today,
    dueDate: defaultDueDate,
    amount: payment?.PaymentAmount || 0,
    description: payment ? `${payment.OpportunityName} - Payment` : '',
    referenceNumber: '',
    paymentTerms: 'NET_30',
    glAccount: '',  // Will be set from Sage
    location: '',  // Will be set from Sage
    department: '',  // Will be set from Sage
    class: '',  // Will be set from Sage
    memo: '',
  });

  // Sage master data (fetched dynamically)
  const [customers, setCustomers] = useState<{ id: string; name: string }[]>([]);
  const [glAccounts, setGlAccounts] = useState<{ value: string; label: string }[]>([]);
  const [departments, setDepartments] = useState<{ value: string; label: string }[]>([]);
  const [classes, setClasses] = useState<{ value: string; label: string }[]>([]);
  const [locations, setLocations] = useState<{ value: string; label: string }[]>([]);
  const [loadingMasterData, setLoadingMasterData] = useState(false);

  // Debug: Log customers state when it changes
  useEffect(() => {
    console.log('✅ Customers state updated:', customers.length, 'customers');
    if (customers.length > 0) {
      console.log('   First 3 customers:', customers.slice(0, 3));
    }
  }, [customers]);

  // Fetch all Sage master data when modal opens
  useEffect(() => {
    if (open) {
      fetchSageMasterData();
    }
  }, [open]);

  const fetchSageMasterData = async () => {
    try {
      setLoadingMasterData(true);
      
      // Fetch all data in parallel, but handle failures gracefully
      const [customersRes, glAccountsRes, departmentsRes, classesRes, locationsRes] = await Promise.allSettled([
        apiService.getSageCustomers(),
        apiService.getSageGLAccounts(),
        apiService.getSageDepartments(),
        apiService.getSageClasses(),
        apiService.getSageLocations(),
      ]);
      
      // Handle customers (most important - from CSV, should always work)
      if (customersRes.status === 'fulfilled') {
        const customersList = customersRes.value.data.customers || [];
        console.log('✅ Loaded', customersList.length, 'customers');
        setCustomers(customersList);
      } else {
        console.error('❌ Failed to load customers:', customersRes.reason);
      }
      
      // Handle GL accounts (gracefully fail if Sage API has issues)
      if (glAccountsRes.status === 'fulfilled') {
        setGlAccounts(glAccountsRes.value.data.accounts || []);
      } else {
        console.warn('⚠️ Failed to load GL accounts, using defaults');
        setGlAccounts([{ value: '9100', label: '9100 - Reconciliation Discrepancies' }]);
      }
      
      // Handle departments
      if (departmentsRes.status === 'fulfilled') {
        setDepartments(departmentsRes.value.data.departments || []);
      } else {
        console.warn('⚠️ Failed to load departments, using defaults');
        setDepartments([{ value: '999', label: '999 - HISTORICAL' }]);
      }
      
      // Handle classes
      if (classesRes.status === 'fulfilled') {
        setClasses(classesRes.value.data.classes || []);
      } else {
        console.warn('⚠️ Failed to load classes, using defaults');
        setClasses([{ value: '22', label: '22 - PURPOSE RESTRICTION' }]);
      }
      
      // Handle locations
      if (locationsRes.status === 'fulfilled') {
        setLocations(locationsRes.value.data.locations || []);
      } else {
        console.warn('⚠️ Failed to load locations, using defaults');
        setLocations([{ value: 'PURSUIT', label: 'PURSUIT - Pursuit Transformation Company' }]);
      }
      
    } catch (error) {
      console.error('Error fetching Sage master data:', error);
    } finally {
      setLoadingMasterData(false);
    }
  };

  // Update form when payment changes or master data loads
  React.useEffect(() => {
    if (payment) {
      setFormData(prev => ({
        ...prev,
        customer: payment.AccountName || '',
        invoiceDate: today,
        dueDate: payment.ScheduledDate || today,
        amount: payment.PaymentAmount || 0,
        description: `${payment.OpportunityName} - Payment`,
        // Keep existing Sage field selections if already set
      }));
    }
  }, [payment, today]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    onSubmit({
      payment_id: payment?.Id,
      customer: formData.customer,
      invoice_date: formData.invoiceDate,
      due_date: formData.dueDate,
      amount: formData.amount,
      description: formData.description,
      reference_number: formData.referenceNumber,
      payment_terms: formData.paymentTerms,
      gl_account: formData.glAccount,
      location: formData.location,
      department: formData.department,
      class: formData.class,
      memo: formData.memo,
    });
  };

  const handleCancel = () => {
    onClose();
  };

  if (!payment) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box>
          <Box sx={{ fontSize: '1.25rem', fontWeight: 500 }}>Create Invoice</Box>
          <Box sx={{ fontSize: '0.875rem', color: 'text.secondary', mt: 0.5 }}>
            {payment.OpportunityName}
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ pt: 2 }}>
          {/* Context Info */}
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Opportunity:</strong> {payment.OpportunityName}
            </Typography>
            <Typography variant="body2">
              <strong>Payment Amount:</strong> ${payment.PaymentAmount.toLocaleString()}
            </Typography>
          </Alert>

          {/* Loading Master Data */}
          {loadingMasterData && (
            <Alert severity="info" icon={<CircularProgress size={20} />} sx={{ mb: 3 }}>
              Loading customers, GL accounts, and dimensions from Sage Intacct...
            </Alert>
          )}

          {/* Customer Selection */}
          <Typography variant="subtitle2" gutterBottom sx={{ mb: 2 }}>
            Customer
          </Typography>
          
          <Autocomplete
            freeSolo
            options={customers.map(c => c.name)}
            value={formData.customer}
            onChange={(event, newValue) => {
              console.log('🔸 Autocomplete onChange:', newValue);
              handleChange('customer', newValue || '');
            }}
            onInputChange={(event, newValue) => {
              console.log('🔸 Autocomplete onInputChange:', newValue);
              handleChange('customer', newValue);
            }}
            onOpen={() => {
              console.log('🔸 Autocomplete opened. Options:', customers.map(c => c.name).slice(0, 5));
            }}
            loading={loadingMasterData}
            disabled={loadingMasterData}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Customer Name (from Sage Intacct)"
                placeholder="Select customer from Sage"
                helperText={loadingMasterData ? 'Loading customers from Sage...' : `${customers.length} customers available`}
                required
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loadingMasterData ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
            sx={{ mb: 3 }}
          />

          <Divider sx={{ mb: 3 }} />

          {/* Invoice Details */}
          <Typography variant="subtitle2" gutterBottom sx={{ mb: 2 }}>
            Invoice Details
          </Typography>

          <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2} mb={2}>
            <TextField
              label="Invoice Date"
              type="date"
              value={formData.invoiceDate}
              onChange={(e) => handleChange('invoiceDate', e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="Due Date"
              type="date"
              value={formData.dueDate}
              onChange={(e) => handleChange('dueDate', e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
              helperText="From payment schedule"
            />
          </Box>

          <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2} mb={2}>
            <TextField
              label="Payment Terms"
              select
              value={formData.paymentTerms}
              onChange={(e) => handleChange('paymentTerms', e.target.value)}
              fullWidth
            >
              {PAYMENT_TERMS.map((term) => (
                <MenuItem key={term.value} value={term.value}>
                  {term.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Reference Number"
              value={formData.referenceNumber}
              onChange={(e) => handleChange('referenceNumber', e.target.value)}
              placeholder="PO#, Grant#, etc."
              fullWidth
              helperText="Optional"
            />
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Line Item */}
          <Typography variant="subtitle2" gutterBottom sx={{ mb: 2 }}>
            Line Item
          </Typography>

          <TextField
            label="Description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            fullWidth
            multiline
            rows={2}
            sx={{ mb: 2 }}
            helperText="What this payment is for"
          />

          <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2} mb={2}>
            <TextField
              label="Amount"
              type="number"
              value={formData.amount}
              onChange={(e) => handleChange('amount', parseFloat(e.target.value))}
              fullWidth
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
              }}
            />

            <TextField
              label="GL Account"
              select
              value={formData.glAccount}
              onChange={(e) => handleChange('glAccount', e.target.value)}
              fullWidth
              helperText="Revenue account (from Sage)"
              required
              disabled={loadingMasterData || glAccounts.length === 0}
            >
              {glAccounts.map((account) => (
                <MenuItem key={account.value} value={account.value}>
                  {account.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          {/* Sage Dimensions (Required) */}
          <Typography variant="caption" color="text.secondary" display="block" gutterBottom sx={{ mt: 2 }}>
            Sage Intacct Dimensions (Required - loaded from Sage)
          </Typography>
          <Box display="grid" gridTemplateColumns="1fr 1fr 1fr" gap={2} mb={2}>
            <TextField
              label="Location"
              select
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              fullWidth
              size="small"
              required
              disabled={loadingMasterData || locations.length === 0}
            >
              {locations.map((loc) => (
                <MenuItem key={loc.value} value={loc.value}>
                  {loc.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Department"
              select
              value={formData.department}
              onChange={(e) => handleChange('department', e.target.value)}
              fullWidth
              size="small"
              required
              disabled={loadingMasterData || departments.length === 0}
            >
              {departments.map((dept) => (
                <MenuItem key={dept.value} value={dept.value}>
                  {dept.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Class"
              select
              value={formData.class}
              onChange={(e) => handleChange('class', e.target.value)}
              fullWidth
              size="small"
              required
              disabled={loadingMasterData || classes.length === 0}
            >
              {classes.map((cls) => (
                <MenuItem key={cls.value} value={cls.value}>
                  {cls.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <TextField
            label="Internal Memo"
            value={formData.memo}
            onChange={(e) => handleChange('memo', e.target.value)}
            fullWidth
            multiline
            rows={2}
            placeholder="Internal notes (not visible to customer)"
            helperText="Optional"
          />

          {/* Summary */}
          <Divider sx={{ my: 3 }} />
          <Box bgcolor="grey.50" p={2} borderRadius={1}>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body2"><strong>Invoice Total:</strong></Typography>
              <Typography variant="body2"><strong>${formData.amount.toLocaleString()}</strong></Typography>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">Payment Terms:</Typography>
              <Typography variant="body2" color="text.secondary">
                {PAYMENT_TERMS.find(t => t.value === formData.paymentTerms)?.label}
              </Typography>
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleCancel} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !formData.description || formData.amount <= 0}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Creating...' : 'Create Invoice'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

