import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
  Grid,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-hot-toast';
import { format, parseISO } from 'date-fns';
import { apiService } from '../services/api';
import CreateInvoiceModal from '../components/CreateInvoiceModal';
import ReceiptIcon from '@mui/icons-material/Receipt';

export default function FinanceDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);

  // Fetch payments awaiting invoices
  const { data: awaitingData, isLoading: awaitingLoading } = useQuery(
    'awaiting-invoices',
    () => apiService.getAwaitingInvoices(),
  );

  const awaitingPayments = awaitingData?.data?.payments || [];
  const awaitingSummary = awaitingData?.data?.summary || {};

  // Mutation for creating invoice (per payment)
  const createInvoiceMutation = useMutation(
    (invoiceData: any) => apiService.createSageInvoice(invoiceData.payment_id, false),
    {
      onSuccess: (response) => {
        toast.success(`Invoice ${response.data.sage_invoice_id} created!`);
        queryClient.invalidateQueries('awaiting-invoices');
        setInvoiceModalOpen(false);
        setSelectedPayment(null);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.detail?.error || error.response?.data?.detail || 'Failed to create invoice');
      },
    }
  );

  const handleOpenInvoiceModal = (payment: any) => {
    setSelectedPayment(payment);
    setInvoiceModalOpen(true);
  };

  const handleCloseInvoiceModal = () => {
    setInvoiceModalOpen(false);
    setSelectedPayment(null);
  };

  const handleSubmitInvoice = (invoiceData: any) => {
    createInvoiceMutation.mutate(invoiceData);
  };

  // Column definitions for Payments tab
  const awaitingColumns: GridColDef[] = [
    { field: 'OpportunityName', headerName: 'Opportunity', flex: 1, minWidth: 200 },
    { field: 'AccountName', headerName: 'Account', flex: 1, minWidth: 150 },
    {
      field: 'PaymentAmount',
      headerName: 'Payment Amount',
      width: 130,
      valueFormatter: (params) => `$${params.value?.toLocaleString() || 0}`,
    },
    {
      field: 'ScheduledDate',
      headerName: 'Due Date',
      width: 120,
      valueFormatter: (params) => params.value ? format(parseISO(params.value), 'MM/dd/yyyy') : '',
    },
    {
      field: 'CloseDate',
      headerName: 'Opp Close Date',
      width: 130,
      valueFormatter: (params) => params.value ? format(parseISO(params.value), 'MM/dd/yyyy') : '',
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Button
          variant="contained"
          size="small"
          onClick={() => handleOpenInvoiceModal(params.row)}
          disabled={createInvoiceMutation.isLoading}
        >
          Create Invoice
        </Button>
      ),
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Finance Dashboard
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1}>
                <ReceiptIcon color="primary" />
                <Typography variant="h6">{awaitingPayments.length}</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Payments Need Invoice
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ${awaitingSummary.total_amount?.toLocaleString() || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Payments Awaiting Invoice */}
      <Card>
        <Box p={2}>
          <Typography variant="h6" gutterBottom>
            Payments Awaiting Invoice
          </Typography>

          {awaitingPayments.length > 0 && (
            <Alert severity="info" sx={{ mb: 2 }}>
              💰 {awaitingPayments.length} payment(s) ready to invoice. 
              Total amount: ${awaitingSummary.total_amount?.toLocaleString() || 0}
            </Alert>
          )}

          {awaitingPayments.length === 0 && !awaitingLoading && (
            <Alert severity="success" sx={{ mb: 2 }}>
              ✅ All payments have invoices!
            </Alert>
          )}

          {awaitingLoading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : (
            <DataGrid
              rows={awaitingPayments}
              columns={awaitingColumns}
              autoHeight
              initialState={{
                pagination: { paginationModel: { pageSize: 10 } },
              }}
              pageSizeOptions={[10, 25, 50]}
              disableRowSelectionOnClick
              getRowId={(row) => row.Id}
            />
          )}
        </Box>
      </Card>

      {/* Invoice Creation Modal */}
      <CreateInvoiceModal
        open={invoiceModalOpen}
        payment={selectedPayment}
        onClose={handleCloseInvoiceModal}
        onSubmit={handleSubmitInvoice}
        loading={createInvoiceMutation.isLoading}
      />
    </Box>
  );
}
