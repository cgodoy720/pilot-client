import React, { useState } from 'react';
import { formatDollarMillions } from '../utils/formatters';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Search as SearchIcon,
} from '@mui/icons-material';
import { 
  DataGrid, 
  GridColDef, 
  GridRenderCellParams,
} from '@mui/x-data-grid';
import { useQuery } from 'react-query';
import { format } from 'date-fns';

import { apiService } from '../services/api';

interface Payment {
  payment_id: string;
  customer_name: string;
  payment_date: string;
  amount: number;
  payment_method?: string;
  reference_number?: string;
  memo?: string;
}

const ReceivedPayments: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch payments from Sage Intacct
  const { data: paymentsData, isLoading, error } = useQuery(
    'sage-payments',
    async () => {
      const response = await apiService.getSagePayments({ limit: 10000 });
      return response.data;
    }
  );

  // Map Sage Intacct data to our format
  const rawPayments = Array.isArray(paymentsData?.payments) 
    ? paymentsData.payments 
    : Array.isArray(paymentsData)
    ? paymentsData
    : [];

  const payments: Payment[] = rawPayments.map((p: any) => ({
    payment_id: p.RECORDNO || p.payment_id,
    customer_name: p.CUSTOMERNAME || p.customer_name,
    payment_date: p.PAYMENTDATE || p.RECEIPTDATE || p.payment_date,
    amount: parseFloat(p.PAYMENTAMOUNT || p.TOTALENTERED || p.amount || '0'),
    payment_method: p.PAYMENTTYPE || p.payment_method,
    reference_number: p.DOCUMENTNUMBER || p.reference_number || '',
    memo: p.MEMO || p.memo || '',
  }));

  // Filter payments by search term
  const filteredPayments = payments.filter((payment) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      payment.customer_name?.toLowerCase().includes(search) ||
      payment.payment_id?.toLowerCase().includes(search) ||
      payment.reference_number?.toLowerCase().includes(search)
    );
  });

  // Calculate summary metrics
  const totalReceived = filteredPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
  const avgPayment = filteredPayments.length > 0 ? totalReceived / filteredPayments.length : 0;

  const columns: GridColDef[] = [
    {
      field: 'payment_id',
      headerName: 'Payment ID',
      flex: 1,
      minWidth: 150,
    },
    {
      field: 'customer_name',
      headerName: 'Customer',
      flex: 1.5,
      minWidth: 200,
    },
    {
      field: 'payment_date',
      headerName: 'Payment Date',
      flex: 1,
      minWidth: 130,
      valueGetter: (params) => {
        return params.value ? new Date(params.value) : null;
      },
      valueFormatter: (params) => {
        if (!params.value) return 'N/A';
        return format(new Date(params.value as string), 'MMM dd, yyyy');
      },
    },
    {
      field: 'amount',
      headerName: 'Amount',
      flex: 1,
      minWidth: 130,
      type: 'number',
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ fontWeight: 600, color: 'success.main' }}>
          {formatDollarMillions(params.value as number)}
        </Box>
      ),
    },
    {
      field: 'payment_method',
      headerName: 'Method',
      flex: 0.8,
      minWidth: 100,
    },
    {
      field: 'reference_number',
      headerName: 'Reference',
      flex: 1,
      minWidth: 130,
    },
    {
      field: 'memo',
      headerName: 'Memo',
      flex: 1.5,
      minWidth: 200,
    },
  ];

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Failed to load payments. Please check your Sage Intacct connection.
      </Alert>
    );
  }

  return (
    <Box>
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Total Payments
              </Typography>
              <Typography variant="h4">{filteredPayments.length}</Typography>
              <Typography variant="body2" color="textSecondary">
                Received
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'success.50' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Total Received
              </Typography>
              <Typography variant="h4" color="success.main">
                {formatDollarMillions(totalReceived)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                All time
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Average Payment
              </Typography>
              <Typography variant="h4">
                {formatDollarMillions(avgPayment)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Per transaction
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search by customer name, payment ID, or reference..."
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
      </Box>

      {/* Data Grid */}
      <Card>
        <CardContent>
          <Box sx={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={filteredPayments}
              columns={columns}
              getRowId={(row) => row.payment_id}
              pagination
              pageSizeOptions={[25, 50, 100]}
              initialState={{
                pagination: {
                  paginationModel: { pageSize: 50, page: 0 },
                },
                sorting: {
                  sortModel: [{ field: 'payment_date', sort: 'desc' }],
                },
              }}
              disableRowSelectionOnClick
            />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ReceivedPayments;

