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
  Chip,
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
import { format, parseISO, differenceInDays } from 'date-fns';

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

const PendingInvoices: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch invoices from Sage Intacct
  const { data: invoicesData, isLoading, error } = useQuery(
    'sage-invoices',
    async () => {
      const response = await apiService.getSageInvoices({ limit: 10000 });
      return response.data;
    }
  );

  // Map Sage Intacct data to our format
  const rawInvoices = Array.isArray(invoicesData?.invoices) 
    ? invoicesData.invoices 
    : Array.isArray(invoicesData)
    ? invoicesData
    : [];

  const allInvoices: Invoice[] = rawInvoices.map((inv: any) => ({
    invoice_id: inv.RECORDNO || inv.invoice_id,
    invoice_number: inv.RECORDNO || inv.invoice_number,
    customer_name: inv.CUSTOMERNAME || inv.customer_name,
    customer_type: inv.CUSTOMERTYPE || inv.customer_type || 'Customer',
    amount: String(inv.TOTALENTERED || inv.amount || '0'),
    due_amount: String(inv.TOTALDUE || inv.due_amount || '0'),
    invoice_date: inv.WHENCREATED || inv.invoice_date,
    due_date: inv.WHENDUE || inv.due_date,
    state: inv.STATE || inv.state || 'Open',
    description: inv.DESCRIPTION || inv.description,
  }));

  // Filter for pending invoices (with outstanding balance)
  const pendingInvoices = allInvoices.filter((invoice) => {
    const dueAmount = parseFloat(invoice.due_amount || '0');
    return dueAmount > 0;
  });

  // Filter by search term
  const filteredInvoices = pendingInvoices.filter((invoice) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      invoice.customer_name?.toLowerCase().includes(search) ||
      invoice.invoice_number?.toLowerCase().includes(search) ||
      invoice.invoice_id?.toLowerCase().includes(search)
    );
  });

  // Calculate summary metrics
  const totalOutstanding = filteredInvoices.reduce((sum, inv) => sum + parseFloat(inv.due_amount || '0'), 0);
  const totalInvoiced = filteredInvoices.reduce((sum, inv) => sum + parseFloat(inv.amount || '0'), 0);
  
  // Count overdue invoices
  const now = new Date();
  const overdueCount = filteredInvoices.filter(inv => {
    if (!inv.due_date) return false;
    try {
      const dueDate = parseISO(inv.due_date);
      return dueDate < now;
    } catch {
      return false;
    }
  }).length;

  const getDaysOverdue = (dueDate: string) => {
    if (!dueDate) return 0;
    try {
      const due = parseISO(dueDate);
      const days = differenceInDays(now, due);
      return days > 0 ? days : 0;
    } catch {
      return 0;
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'invoice_number',
      headerName: 'Invoice #',
      flex: 1,
      minWidth: 130,
    },
    {
      field: 'customer_name',
      headerName: 'Customer',
      flex: 1.5,
      minWidth: 200,
    },
    {
      field: 'customer_type',
      headerName: 'Type',
      flex: 0.8,
      minWidth: 100,
      renderCell: (params: GridRenderCellParams) => (
        <Chip label={params.value} size="small" />
      ),
    },
    {
      field: 'invoice_date',
      headerName: 'Invoice Date',
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
      field: 'due_date',
      headerName: 'Due Date',
      flex: 1,
      minWidth: 130,
      valueGetter: (params) => {
        return params.value ? new Date(params.value) : null;
      },
      renderCell: (params: GridRenderCellParams) => {
        if (!params.value) return 'N/A';
        const daysOverdue = getDaysOverdue(params.row.due_date);
        const dateStr = format(new Date(params.value as string), 'MMM dd, yyyy');
        
        if (daysOverdue > 0) {
          return (
            <Box>
              <Typography variant="body2" color="error">
                {dateStr}
              </Typography>
              <Typography variant="caption" color="error">
                {daysOverdue} days overdue
              </Typography>
            </Box>
          );
        }
        return dateStr;
      },
    },
    {
      field: 'amount',
      headerName: 'Total Amount',
      flex: 1,
      minWidth: 130,
      type: 'number',
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ fontWeight: 600 }}>
          {formatDollarMillions(parseFloat(params.value as string || '0'))}
        </Box>
      ),
    },
    {
      field: 'due_amount',
      headerName: 'Outstanding',
      flex: 1,
      minWidth: 130,
      type: 'number',
      renderCell: (params: GridRenderCellParams) => {
        const amount = parseFloat(params.value as string || '0');
        const daysOverdue = getDaysOverdue(params.row.due_date);
        return (
          <Box sx={{ 
            fontWeight: 600, 
            color: daysOverdue > 30 ? 'error.main' : daysOverdue > 0 ? 'warning.main' : 'warning.main'
          }}>
            {formatDollarMillions(amount)}
          </Box>
        );
      },
    },
    {
      field: 'state',
      headerName: 'Status',
      flex: 0.8,
      minWidth: 100,
      renderCell: (params: GridRenderCellParams) => {
        const daysOverdue = getDaysOverdue(params.row.due_date);
        const color = daysOverdue > 30 ? 'error' : daysOverdue > 0 ? 'warning' : 'info';
        const label = daysOverdue > 30 ? 'Overdue' : daysOverdue > 0 ? 'Past Due' : params.value;
        return <Chip label={label} color={color} size="small" />;
      },
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
        Failed to load invoices. Please check your Sage Intacct connection.
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
                Pending Invoices
              </Typography>
              <Typography variant="h4">{filteredInvoices.length}</Typography>
              <Typography variant="body2" color="textSecondary">
                Outstanding
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'warning.50' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Total Outstanding
              </Typography>
              <Typography variant="h4" color="warning.main">
                {formatDollarMillions(totalOutstanding)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Due to receive
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Total Invoiced
              </Typography>
              <Typography variant="h4">
                {formatDollarMillions(totalInvoiced)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {filteredInvoices.length} invoices
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: overdueCount > 0 ? 'error.50' : 'background.paper' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Overdue Invoices
              </Typography>
              <Typography variant="h4" color={overdueCount > 0 ? 'error.main' : 'text.primary'}>
                {overdueCount}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Past due date
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search by customer name, invoice number, or ID..."
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

      {/* Info Alert */}
      {overdueCount > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <strong>{overdueCount} invoice{overdueCount !== 1 ? 's' : ''} overdue</strong> - 
          Follow up on past due invoices to improve cash flow
        </Alert>
      )}

      {/* Data Grid */}
      <Card>
        <CardContent>
          <Box sx={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={filteredInvoices}
              columns={columns}
              getRowId={(row) => row.invoice_id}
              pagination
              pageSizeOptions={[25, 50, 100]}
              initialState={{
                pagination: {
                  paginationModel: { pageSize: 50, page: 0 },
                },
                sorting: {
                  sortModel: [{ field: 'due_date', sort: 'asc' }],
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

export default PendingInvoices;

