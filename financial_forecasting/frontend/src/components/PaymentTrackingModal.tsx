import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  TextField,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { apiService } from '../services/api';
import { format, parseISO, isPast } from 'date-fns';
import toast from 'react-hot-toast';

interface Payment {
  id: string;
  payment_date: string;
  received_date?: string;
  amount: number;
  paid: boolean;
  payment_method?: string;
  check_number?: string;
  notes?: string;
  status: string;
}

interface PaymentTrackingModalProps {
  open: boolean;
  onClose: () => void;
  opportunityId: string;
  opportunityName: string;
  onPaymentUpdated: () => void;
}

export default function PaymentTrackingModal({
  open,
  onClose,
  opportunityId,
  opportunityName,
  onPaymentUpdated,
}: PaymentTrackingModalProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      loadPayments();
    }
  }, [open, opportunityId]);

  const loadPayments = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiService.getPaymentSchedule(opportunityId);
      setPayments(response.data.payments || []);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkReceived = async (payment: Payment) => {
    if (!window.confirm(`Mark payment of $${payment.amount.toLocaleString()} as received?`)) {
      return;
    }

    setUpdating(payment.id);
    try {
      const response = await apiService.updatePayment(
        opportunityId,
        payment.id,
        {
          paid: true,
          received_date: new Date().toISOString().split('T')[0],
        }
      );

      if (response.data.all_payments_received) {
        toast.success('🎉 All payments received! Opportunity marked as Completed.', { duration: 5000 });
      } else {
        toast.success('Payment marked as received');
      }

      await loadPayments();
      onPaymentUpdated();
    } catch (err: any) {
      toast.error(err.response?.data?.detail?.error || 'Failed to update payment');
    } finally {
      setUpdating(null);
    }
  };

  const handleMarkUnpaid = async (payment: Payment) => {
    if (!window.confirm('Mark payment as unpaid?')) {
      return;
    }

    setUpdating(payment.id);
    try {
      await apiService.updatePayment(opportunityId, payment.id, { paid: false });
      toast.success('Payment marked as unpaid');
      await loadPayments();
      onPaymentUpdated();
    } catch (err: any) {
      toast.error(err.response?.data?.detail?.error || 'Failed to update payment');
    } finally {
      setUpdating(null);
    }
  };

  const getStatusChip = (payment: Payment) => {
    if (payment.paid) {
      return <Chip label="Received" color="success" size="small" icon={<CheckIcon />} />;
    }
    
    const isOverdue = isPast(parseISO(payment.payment_date));
    if (isOverdue) {
      return <Chip label="Overdue" color="error" size="small" />;
    }
    
    return <Chip label="Scheduled" color="default" size="small" />;
  };

  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
  const paidAmount = payments.reduce((sum, p) => sum + (p.paid ? p.amount : 0), 0);
  const outstandingAmount = totalAmount - paidAmount;
  const paidCount = payments.filter(p => p.paid).length;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h6">Payment Tracking</Typography>
        <Typography variant="body2" color="text.secondary">
          {opportunityName}
        </Typography>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Summary */}
        <Box mb={2} display="flex" gap={2}>
          <Box flex={1}>
            <Typography variant="caption" color="text.secondary">Total Amount</Typography>
            <Typography variant="h6">${totalAmount.toLocaleString()}</Typography>
          </Box>
          <Box flex={1}>
            <Typography variant="caption" color="text.secondary">Received</Typography>
            <Typography variant="h6" color="success.main">${paidAmount.toLocaleString()}</Typography>
          </Box>
          <Box flex={1}>
            <Typography variant="caption" color="text.secondary">Outstanding</Typography>
            <Typography variant="h6" color="error.main">${outstandingAmount.toLocaleString()}</Typography>
          </Box>
          <Box flex={1}>
            <Typography variant="caption" color="text.secondary">Progress</Typography>
            <Typography variant="h6">{paidCount}/{payments.length} payments</Typography>
          </Box>
        </Box>

        {/* Payments Table */}
        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Scheduled Date</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Received Date</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      {format(parseISO(payment.payment_date), 'MM/dd/yyyy')}
                    </TableCell>
                    <TableCell>
                      <strong>${payment.amount.toLocaleString()}</strong>
                    </TableCell>
                    <TableCell>{getStatusChip(payment)}</TableCell>
                    <TableCell>
                      {payment.received_date 
                        ? format(parseISO(payment.received_date), 'MM/dd/yyyy')
                        : '-'
                      }
                    </TableCell>
                    <TableCell align="center">
                      {payment.paid ? (
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleMarkUnpaid(payment)}
                          disabled={updating === payment.id}
                        >
                          {updating === payment.id ? (
                            <CircularProgress size={20} />
                          ) : (
                            <CancelIcon />
                          )}
                        </IconButton>
                      ) : (
                        <Button
                          variant="contained"
                          size="small"
                          color="success"
                          startIcon={updating === payment.id ? <CircularProgress size={16} /> : <CheckIcon />}
                          onClick={() => handleMarkReceived(payment)}
                          disabled={updating === payment.id}
                        >
                          Mark Received
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

