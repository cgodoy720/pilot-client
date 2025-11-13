import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDollarMillions } from '../utils/formatters';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Chip,
  Alert,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Receipt as ReceiptIcon,
  CheckCircle as CheckCircleIcon,
  Payment as PaymentIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { 
  DataGrid, 
  GridColDef, 
  GridRenderCellParams,
} from '@mui/x-data-grid';
import { useQuery, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import { format, parseISO, differenceInDays } from 'date-fns';

import { apiService } from '../services/api';

interface Opportunity {
  Id: string;
  Name: string;
  AccountId: string;
  Account?: { Name: string };
  StageName: string;
  Amount: number;
  CloseDate: string;
  CreatedDate: string;
  LastModifiedDate: string;
  OwnerId: string;
  Owner?: { Name: string };
  npe01__Payments_Made__c?: number;
  Outstanding_Payments__c?: number;
  Number_of_Payments_Received__c?: number;
  Most_Recent_Payment_Date__c?: string;
  Last_Actual_Payment__c?: string;
  npe01__Number_of_Payments__c?: number;
  PaymentDate__c?: string;
  Earliest_Scheduled_Payment__c?: string;
}

const PaymentProcessing: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [invoiceData, setInvoiceData] = useState({
    amount: '',
    dueDate: '',
    notes: '',
  });

  // Fetch opportunities
  const { data: opportunities, isLoading, error } = useQuery(
    'opportunities',
    async () => {
      const response = await apiService.getOpportunities();
      return response.data;
    },
    {
      refetchInterval: 30000, // Refresh every 30 seconds
    }
  );

  // Filter for closed/won deals that need payment processing
  const closedDeals = opportunities?.filter((opp: Opportunity) => {
    const stage = opp.StageName || '';
    return stage.includes('Collecting') || 
           stage.includes('Closed Won') ||
           (stage.includes('Closed / Completed') && (opp.Outstanding_Payments__c || 0) > 0);
  }).sort((a: Opportunity, b: Opportunity) => {
    // Sort by most recently closed first
    return new Date(b.CloseDate).getTime() - new Date(a.CloseDate).getTime();
  }) || [];

  // Identify newly closed deals (closed within last 7 days)
  const newlyClosedDeals = closedDeals.filter((opp: Opportunity) => {
    const closeDays = differenceInDays(new Date(), parseISO(opp.CloseDate));
    return closeDays <= 7;
  });

  // Calculate summary metrics
  const totalOutstanding = closedDeals.reduce((sum: number, opp: Opportunity) => 
    sum + (opp.Outstanding_Payments__c || 0), 0);
  
  const totalExpected = closedDeals.reduce((sum: number, opp: Opportunity) => 
    sum + (opp.Amount || 0), 0);
  
  const totalReceived = closedDeals.reduce((sum: number, opp: Opportunity) => 
    sum + (opp.npe01__Payments_Made__c || 0), 0);

  const handleRefresh = () => {
    queryClient.invalidateQueries('opportunities');
    toast.success('Refreshed payment data');
  };

  const handleInitiateInvoice = (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity);
    setInvoiceData({
      amount: opportunity.Outstanding_Payments__c?.toString() || opportunity.Amount?.toString() || '',
      dueDate: format(new Date(new Date().setDate(new Date().getDate() + 30)), 'yyyy-MM-dd'),
      notes: '',
    });
    setInvoiceDialogOpen(true);
  };

  const handleCreateInvoice = () => {
    if (!selectedOpportunity) return;
    
    // TODO: Implement actual invoice creation API call
    toast.success(`Invoice initiated for ${selectedOpportunity.Name}`);
    setInvoiceDialogOpen(false);
    setSelectedOpportunity(null);
  };

  // Columns for the payment processing table
  const columns: GridColDef[] = [
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params: GridRenderCellParams) => {
        const closeDays = differenceInDays(new Date(), parseISO(params.row.CloseDate));
        const isNew = closeDays <= 7;
        const hasOutstanding = (params.row.Outstanding_Payments__c || 0) > 0;
        
        return (
          <Chip
            size="small"
            icon={isNew ? <WarningIcon /> : hasOutstanding ? <ScheduleIcon /> : <CheckCircleIcon />}
            label={isNew ? 'NEW' : hasOutstanding ? 'Pending' : 'Complete'}
            color={isNew ? 'error' : hasOutstanding ? 'warning' : 'success'}
          />
        );
      },
    },
    {
      field: 'Name',
      headerName: 'Grant Name',
      flex: 2,
      minWidth: 250,
    },
    {
      field: 'Account.Name',
      headerName: 'Funder',
      flex: 1.5,
      minWidth: 180,
      valueGetter: (params) => params.row.Account?.Name || '',
    },
    {
      field: 'CloseDate',
      headerName: 'Close Date',
      width: 120,
      valueFormatter: (params) => {
        try {
          return format(parseISO(params.value as string), 'MM/dd/yyyy');
        } catch {
          return params.value as string;
        }
      },
    },
    {
      field: 'Amount',
      headerName: 'Total Amount',
      width: 140,
      type: 'number',
      valueFormatter: (params) => formatDollarMillions(params.value as number),
    },
    {
      field: 'npe01__Payments_Made__c',
      headerName: 'Received',
      width: 140,
      type: 'number',
      valueFormatter: (params) => formatDollarMillions(params.value as number || 0),
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 'bold' }}>
          {formatDollarMillions(params.value as number || 0)}
        </Typography>
      ),
    },
    {
      field: 'Outstanding_Payments__c',
      headerName: 'Outstanding',
      width: 140,
      type: 'number',
      valueFormatter: (params) => formatDollarMillions(params.value as number || 0),
      renderCell: (params: GridRenderCellParams) => (
        <Typography 
          variant="body2" 
          sx={{ 
            color: (params.value as number || 0) > 0 ? 'warning.main' : 'text.secondary',
            fontWeight: (params.value as number || 0) > 0 ? 'bold' : 'normal'
          }}
        >
          {formatDollarMillions(params.value as number || 0)}
        </Typography>
      ),
    },
    {
      field: 'PaymentDate__c',
      headerName: '1st Payment Due',
      width: 130,
      valueFormatter: (params) => {
        if (!params.value) return 'Not set';
        try {
          return format(parseISO(params.value as string), 'MM/dd/yyyy');
        } catch {
          return params.value as string;
        }
      },
    },
    {
      field: 'npe01__Number_of_Payments__c',
      headerName: '# Payments',
      width: 110,
      type: 'number',
      valueFormatter: (params) => params.value ? `${params.value} pmts` : '-',
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams) => {
        const hasOutstanding = (params.row.Outstanding_Payments__c || 0) > 0;
        return (
          <Button
            size="small"
            variant="contained"
            color="primary"
            startIcon={<ReceiptIcon />}
            onClick={() => handleInitiateInvoice(params.row)}
            disabled={!hasOutstanding}
          >
            Invoice
          </Button>
        );
      },
    },
  ];

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Payment Processing
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Monitor closed deals, track payments, and initiate invoices
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <IconButton onClick={handleRefresh} color="primary" title="Refresh data">
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Alert for new deals */}
      {newlyClosedDeals.length > 0 && (
        <Alert 
          severity="warning" 
          icon={<WarningIcon />}
          sx={{ mb: 3 }}
        >
          <strong>{newlyClosedDeals.length} New Deal(s) Closed!</strong> 
          {' '}Review payment schedules and initiate invoices for recently closed grants.
        </Alert>
      )}

      {/* Summary Metrics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <PaymentIcon color="primary" />
                <Typography variant="body2" color="textSecondary">
                  Total Expected
                </Typography>
              </Box>
              <Typography variant="h4">
                {formatDollarMillions(totalExpected)}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                From {closedDeals.length} closed deals
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <CheckCircleIcon color="success" />
                <Typography variant="body2" color="textSecondary">
                  Payments Received
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ color: 'success.main' }}>
                {formatDollarMillions(totalReceived)}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {totalExpected > 0 ? `${((totalReceived / totalExpected) * 100).toFixed(1)}% collected` : '-'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <ScheduleIcon color="warning" />
                <Typography variant="body2" color="textSecondary">
                  Outstanding
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ color: 'warning.main' }}>
                {formatDollarMillions(totalOutstanding)}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {totalExpected > 0 ? `${((totalOutstanding / totalExpected) * 100).toFixed(1)}% pending` : '-'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <WarningIcon color="error" />
                <Typography variant="body2" color="textSecondary">
                  New Deals (7d)
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ color: 'error.main' }}>
                {newlyClosedDeals.length}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Require immediate attention
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Data Grid */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Closed Deals Awaiting Payment
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {closedDeals.length} total deals
            </Typography>
          </Box>
          
          <Divider sx={{ mb: 2 }} />
          
          <Box sx={{ height: 'calc(100vh - 550px)', minHeight: 600, width: '100%' }}>
            <DataGrid
              rows={closedDeals || []}
              columns={columns}
              loading={isLoading}
              getRowId={(row) => row.Id}
              initialState={{
                pagination: {
                  paginationModel: { pageSize: 25 },
                },
                sorting: {
                  sortModel: [{ field: 'CloseDate', sort: 'desc' }],
                },
              }}
              pageSizeOptions={[10, 25, 50, 100]}
              disableRowSelectionOnClick
              density="comfortable"
              sx={{
                '& .MuiDataGrid-row:hover': {
                  cursor: 'pointer',
                  backgroundColor: 'action.hover',
                },
              }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Invoice Creation Dialog */}
      <Dialog 
        open={invoiceDialogOpen} 
        onClose={() => setInvoiceDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ReceiptIcon color="primary" />
            Initiate Invoice
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Alert severity="info">
              Creating invoice for <strong>{selectedOpportunity?.Name}</strong>
              {' '}from <strong>{selectedOpportunity?.Account?.Name}</strong>
            </Alert>

            <TextField
              label="Grant Name"
              fullWidth
              disabled
              value={selectedOpportunity?.Name || ''}
            />

            <TextField
              label="Funder"
              fullWidth
              disabled
              value={selectedOpportunity?.Account?.Name || ''}
            />

            <TextField
              label="Invoice Amount"
              fullWidth
              required
              type="number"
              value={invoiceData.amount}
              onChange={(e) => setInvoiceData({ ...invoiceData, amount: e.target.value })}
              helperText={`Outstanding: ${formatDollarMillions(selectedOpportunity?.Outstanding_Payments__c || 0)}`}
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
              }}
            />

            <TextField
              label="Due Date"
              fullWidth
              required
              type="date"
              value={invoiceData.dueDate}
              onChange={(e) => setInvoiceData({ ...invoiceData, dueDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="Notes"
              fullWidth
              multiline
              rows={3}
              value={invoiceData.notes}
              onChange={(e) => setInvoiceData({ ...invoiceData, notes: e.target.value })}
              placeholder="Add any special instructions or notes..."
            />

            <Alert severity="warning">
              <Typography variant="body2">
                <strong>Note:</strong> Invoice creation will be implemented in the next phase. 
                This dialog is currently for demonstration purposes.
              </Typography>
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInvoiceDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateInvoice}
            disabled={!invoiceData.amount || !invoiceData.dueDate}
            startIcon={<ReceiptIcon />}
          >
            Create Invoice
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PaymentProcessing;

