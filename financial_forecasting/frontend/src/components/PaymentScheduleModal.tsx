import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { apiService } from '../services/api';

interface Payment {
  payment_date: string;
  amount: number;
  status: string;
}

interface PaymentScheduleModalProps {
  open: boolean;
  onClose: () => void;
  opportunityId: string;
  opportunityAmount: number;
  opportunityName: string;
  onScheduleCreated: () => void;
}

export default function PaymentScheduleModal({
  open,
  onClose,
  opportunityId,
  opportunityAmount,
  opportunityName,
  onScheduleCreated,
}: PaymentScheduleModalProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Reset state when modal opens and initialize with one empty payment
  useEffect(() => {
    if (open) {
      setPayments([{
        payment_date: new Date().toISOString().split('T')[0],
        amount: opportunityAmount,
        status: 'Scheduled',
      }]);
      setError('');
      setSuccess('');
    }
  }, [open, opportunityAmount]);

  const handleSaveSchedule = async () => {
    if (payments.length === 0) {
      setError('Please add at least one payment');
      return;
    }

    // Validate total
    const total = payments.reduce((sum, p) => sum + p.amount, 0);
    if (Math.abs(total - opportunityAmount) > 0.01) {
      setError(`Payment total ($${total.toLocaleString()}) must match opportunity amount ($${opportunityAmount.toLocaleString()})`);
      return;
    }

    setSaving(true);
    setError('');

    try {
      await apiService.createPaymentSchedule(opportunityId, { payments });
      setSuccess('Payment schedule created successfully!');
      setTimeout(() => {
        onScheduleCreated();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.detail?.error || 'Failed to create payment schedule');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePayment = (index: number, field: 'payment_date' | 'amount', value: string | number) => {
    const newPayments = [...payments];
    if (field === 'amount') {
      newPayments[index].amount = typeof value === 'string' ? parseFloat(value) : value;
    } else {
      newPayments[index].payment_date = value as string;
    }
    setPayments(newPayments);
  };

  const handleAddPayment = () => {
    setPayments([
      ...payments,
      {
        payment_date: new Date().toISOString().split('T')[0],
        amount: 0,
        status: 'Scheduled',
      },
    ]);
  };

  const handleDeletePayment = (index: number) => {
    setPayments(payments.filter((_, i) => i !== index));
  };

  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
  const isValidTotal = Math.abs(totalAmount - opportunityAmount) < 0.01;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="h6">Payment Schedule for {opportunityName}</Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Total Amount: ${opportunityAmount.toLocaleString()}
        </Typography>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        {/* Payment Schedule Table */}
        {payments.length > 0 && (
          <>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="subtitle2">
                Payment Schedule
              </Typography>
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={handleAddPayment}
              >
                Add Payment
              </Button>
            </Box>

            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Payment Date</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {payments.map((payment, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <TextField
                          type="date"
                          size="small"
                          value={payment.payment_date}
                          onChange={(e) => handleUpdatePayment(index, 'payment_date', e.target.value)}
                          fullWidth
                        />
                      </TableCell>
                      <TableCell align="right">
                        <TextField
                          type="number"
                          size="small"
                          value={payment.amount}
                          onChange={(e) => handleUpdatePayment(index, 'amount', e.target.value)}
                          InputProps={{
                            startAdornment: <span>$</span>,
                          }}
                          fullWidth
                        />
                      </TableCell>
                      <TableCell>
                        <Chip label={payment.status} size="small" color="default" />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => handleDeletePayment(index)}
                          disabled={payments.length === 1}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell>
                      <strong>Total</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>${totalAmount.toLocaleString()}</strong>
                    </TableCell>
                    <TableCell colSpan={2}>
                      {isValidTotal ? (
                        <Chip label="✓ Total matches" size="small" color="success" />
                      ) : (
                        <Chip 
                          label={`Difference: $${(totalAmount - opportunityAmount).toLocaleString()}`}
                          size="small" 
                          color="error" 
                        />
                      )}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Skip for Now
        </Button>
        <Button
          variant="contained"
          onClick={handleSaveSchedule}
          disabled={!isValidTotal || payments.length === 0 || saving}
          startIcon={saving ? <CircularProgress size={20} /> : undefined}
        >
          {saving ? 'Saving...' : 'Save Payment Schedule'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

