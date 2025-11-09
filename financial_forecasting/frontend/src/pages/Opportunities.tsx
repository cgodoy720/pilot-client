import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  MenuItem,
  Grid,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  Select,
  Autocomplete,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Edit as EditIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { 
  DataGrid, 
  GridColDef, 
  GridRenderCellParams,
  GridRenderEditCellParams,
  GridValueGetterParams,
  GridFilterModel,
  GridSortModel,
  useGridApiContext,
} from '@mui/x-data-grid';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import { format, addDays } from 'date-fns';

import { apiService } from '../services/api';

// Opportunity stages
const OPPORTUNITY_STAGES = [
  'Prospecting',
  'Qualification',
  'Qualifying',
  'New Lead',
  'Lead Gen',
  'Needs Analysis',
  'Value Proposition',
  'Design / Proposal Creation',
  'Proposal Submitted',
  'Negotiation/Review',
  'Closed Won',
  'Closed / Completed',
  'Closed Lost',
  'Withdrawn',
];

interface Opportunity {
  Id: string;
  Name: string;
  AccountId: string;
  Account?: { Name: string };
  StageName: string;
  Amount: number;
  Probability: number;
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
}

// Custom Autocomplete Edit Component for Account
function AccountEditCell(props: GridRenderEditCellParams) {
  const { id, value, field, hasFocus } = props;
  const apiRef = useGridApiContext();
  const [options, setOptions] = React.useState<any[]>([]);

  React.useEffect(() => {
    // Fetch accounts from query cache
    const fetchAccounts = async () => {
      try {
        const response = await apiService.getAccounts({ limit: 1000 });
        setOptions(response.data || []);
      } catch (error) {
        console.error('Failed to fetch accounts:', error);
      }
    };
    fetchAccounts();
  }, []);

  const handleChange = (event: any, newValue: any) => {
    apiRef.current.setEditCellValue({ id, field, value: newValue?.Id || '' });
  };

  const selectedAccount = options.find((acc) => acc.Id === value);

  return (
    <Autocomplete
      value={selectedAccount || null}
      onChange={handleChange}
      options={options}
      getOptionLabel={(option) => option.Name || ''}
      isOptionEqualToValue={(option, value) => option.Id === value?.Id}
      autoFocus={hasFocus}
      fullWidth
      sx={{ width: '100%' }}
      renderInput={(params) => (
        <TextField {...params} placeholder="Search accounts..." variant="standard" />
      )}
    />
  );
}

// Custom Autocomplete Edit Component for Owner
function OwnerEditCell(props: GridRenderEditCellParams) {
  const { id, value, field, hasFocus } = props;
  const apiRef = useGridApiContext();
  const [options, setOptions] = React.useState<any[]>([]);

  React.useEffect(() => {
    // Fetch users from query cache
    const fetchUsers = async () => {
      try {
        const response = await apiService.getUsers({ limit: 1000 });
        setOptions(response.data || []);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    };
    fetchUsers();
  }, []);

  const handleChange = (event: any, newValue: any) => {
    apiRef.current.setEditCellValue({ id, field, value: newValue?.Id || '' });
  };

  const selectedUser = options.find((user) => user.Id === value);

  return (
    <Autocomplete
      value={selectedUser || null}
      onChange={handleChange}
      options={options}
      getOptionLabel={(option) => option.Name || ''}
      isOptionEqualToValue={(option, value) => option.Id === value?.Id}
      autoFocus={hasFocus}
      fullWidth
      sx={{ width: '100%' }}
      renderInput={(params) => (
        <TextField {...params} placeholder="Search users..." variant="standard" />
      )}
    />
  );
}

const Opportunities: React.FC = () => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [activeTab, setActiveTab] = useState<number>(0);

  const queryClient = useQueryClient();

  // Fetch opportunities
  const { data: opportunities, isLoading, error } = useQuery(
    'opportunities',
    async () => {
      const response = await apiService.getOpportunities({ limit: 10000 });
      return response.data;
    },
    {
      refetchInterval: 30000, // Refresh every 30 seconds
    }
  );

  // Fetch users for Owner autocomplete
  const { data: users } = useQuery(
    'users',
    async () => {
      const response = await apiService.getUsers({ limit: 1000 });
      return response.data;
    },
    {
      staleTime: 300000, // Cache for 5 minutes
    }
  );

  // Fetch accounts for Account autocomplete
  const { data: accounts } = useQuery(
    'accounts',
    async () => {
      const response = await apiService.getAccounts({ limit: 1000 });
      return response.data;
    },
    {
      staleTime: 300000, // Cache for 5 minutes
    }
  );

  // Update opportunity mutation
  const updateMutation = useMutation(
    async ({ oppId, updates }: { oppId: string; updates: any }) => {
      return await apiService.updateOpportunity(oppId, updates);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('opportunities');
        toast.success('Opportunity updated successfully!');
        setEditDialogOpen(false);
      },
      onError: (error: any) => {
        toast.error(`Failed to update: ${error.message}`);
      },
    }
  );

  const handleEdit = (opp: Opportunity) => {
    setSelectedOpp(opp);
    setEditForm({
      Name: opp.Name,
      StageName: opp.StageName,
      Amount: opp.Amount,
      Probability: opp.Probability,
      CloseDate: opp.CloseDate,
    });
    setEditDialogOpen(true);
  };

  const handleSave = () => {
    if (selectedOpp) {
      const updates: any = {};
      
      // Only include changed fields
      if (editForm.Name !== selectedOpp.Name) updates.Name = editForm.Name;
      if (editForm.StageName !== selectedOpp.StageName) updates.StageName = editForm.StageName;
      if (editForm.Amount !== selectedOpp.Amount) updates.Amount = parseFloat(editForm.Amount);
      if (editForm.Probability !== selectedOpp.Probability) updates.Probability = parseInt(editForm.Probability);
      if (editForm.CloseDate !== selectedOpp.CloseDate) updates.CloseDate = editForm.CloseDate;

      if (Object.keys(updates).length > 0) {
        updateMutation.mutate({ oppId: selectedOpp.Id, updates });
      } else {
        toast('No changes detected');
        setEditDialogOpen(false);
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const getStageColor = (stage: string) => {
    if (stage.includes('Closed Won') || stage.includes('Completed')) return 'success';
    if (stage.includes('Closed Lost') || stage.includes('Withdrawn')) return 'error';
    if (stage.includes('Proposal') || stage.includes('Negotiation')) return 'warning';
    return 'info';
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 70) return 'success';
    if (probability >= 40) return 'warning';
    return 'error';
  };

  // Calculate expected payment date (30 days after close date)
  const calculatePaymentDate = (closeDate: string) => {
    if (!closeDate) return null;
    try {
      return addDays(new Date(closeDate), 30);
    } catch {
      return null;
    }
  };

  // Handle cell edit
  const handleCellEdit = async (newRow: any, oldRow: any) => {
    // Find what changed
    const updates: any = {};
    Object.keys(newRow).forEach(key => {
      if (newRow[key] !== oldRow[key] && key !== 'Id') {
        // Handle date conversion for CloseDate
        if (key === 'CloseDate' && newRow[key] instanceof Date) {
          updates[key] = newRow[key].toISOString().split('T')[0];
        }
        // Handle Owner (OwnerId update)
        else if (key === 'OwnerId') {
          updates.OwnerId = newRow[key];
        }
        // Handle Account (AccountId update)
        else if (key === 'AccountId') {
          updates.AccountId = newRow[key];
        }
        // Skip nested objects (Account, Owner) - we use the Id fields instead
        else if (key !== 'Account' && key !== 'Owner') {
          updates[key] = newRow[key];
        }
      }
    });

    if (Object.keys(updates).length > 0) {
      // Show loading toast immediately
      const loadingToast = toast.loading('Saving to Salesforce...');
      
      try {
        await apiService.updateOpportunity(newRow.Id, updates);
        toast.success('Saved!', { id: loadingToast, duration: 2000 });
        
        // Optimistically update without refetching (faster UI)
        // Data will refresh in background
        setTimeout(() => queryClient.invalidateQueries('opportunities'), 1000);
        
        return newRow;
      } catch (error: any) {
        toast.error(`Failed: ${error.response?.data?.detail || error.message}`, { id: loadingToast });
        return oldRow; // Revert the change
      }
    }
    
    return oldRow;
  };

  // Pipeline columns (for Sales team - focus on closing deals)
  const pipelineColumns: GridColDef[] = [
    {
      field: 'Name',
      headerName: 'Opportunity Name',
      flex: 2,
      minWidth: 250,
      editable: true,
      filterable: true,
    },
    {
      field: 'AccountId',
      headerName: 'Funder/Account',
      flex: 1.5,
      minWidth: 180,
      editable: true,
      valueGetter: (params: GridValueGetterParams) => params.row.AccountId,
      renderCell: (params: GridRenderCellParams) => {
        const account = accounts?.find((acc: any) => acc.Id === params.row.AccountId);
        return account?.Name || params.row.Account?.Name || 'Unknown';
      },
      renderEditCell: (params: GridRenderEditCellParams) => <AccountEditCell {...params} />,
      filterable: true,
    },
    {
      field: 'OwnerId',
      headerName: 'Owner',
      flex: 1,
      minWidth: 150,
      editable: true,
      valueGetter: (params: GridValueGetterParams) => params.row.OwnerId,
      renderCell: (params: GridRenderCellParams) => {
        const user = users?.find((u: any) => u.Id === params.row.OwnerId);
        return user?.Name || params.row.Owner?.Name || 'Unassigned';
      },
      renderEditCell: (params: GridRenderEditCellParams) => <OwnerEditCell {...params} />,
      filterable: true,
    },
    {
      field: 'StageName',
      headerName: 'Stage',
      flex: 1.2,
      minWidth: 160,
      editable: true,
      type: 'singleSelect',
      valueOptions: OPPORTUNITY_STAGES,
      filterable: true,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value}
          color={getStageColor(params.value as string)}
          size="small"
        />
      ),
    },
    {
      field: 'Amount',
      headerName: 'Amount',
      flex: 0.8,
      minWidth: 120,
      type: 'number',
      editable: true,
      filterable: true,
      valueFormatter: (params) => formatCurrency(params.value as number),
    },
    {
      field: 'Probability',
      headerName: 'Probability',
      flex: 0.7,
      minWidth: 110,
      type: 'number',
      editable: true,
      filterable: true,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={`${params.value}%`}
          color={getProbabilityColor(params.value as number)}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      field: 'CloseDate',
      headerName: 'Close Date',
      flex: 0.9,
      minWidth: 120,
      type: 'date',
      editable: true,
      filterable: true,
      valueGetter: (params: GridValueGetterParams) => {
        return params.value ? new Date(params.value) : null;
      },
      valueFormatter: (params) => {
        if (!params.value) return 'N/A';
        return format(new Date(params.value as string), 'MMM dd, yyyy');
      },
    },
    {
      field: 'expectedValue',
      headerName: 'Expected Value',
      flex: 0.9,
      minWidth: 130,
      filterable: true,
      valueGetter: (params: GridValueGetterParams) => {
        const amount = params.row.Amount || 0;
        const probability = params.row.Probability || 0;
        return (amount * probability) / 100;
      },
      valueFormatter: (params) => formatCurrency(params.value as number),
    },
  ];

  // Payment columns (for Finance team - focus on tracking payments)
  const paymentColumns: GridColDef[] = [
    {
      field: 'Name',
      headerName: 'Grant Name',
      flex: 2,
      minWidth: 250,
      filterable: true,
    },
    {
      field: 'AccountId',
      headerName: 'Funder',
      flex: 1.3,
      minWidth: 180,
      valueGetter: (params: GridValueGetterParams) => params.row.AccountId,
      renderCell: (params: GridRenderCellParams) => {
        const account = accounts?.find((acc: any) => acc.Id === params.row.AccountId);
        return account?.Name || params.row.Account?.Name || 'Unknown';
      },
      filterable: true,
    },
    {
      field: 'CloseDate',
      headerName: 'Close Date',
      flex: 0.9,
      minWidth: 120,
      type: 'date',
      filterable: true,
      valueGetter: (params: GridValueGetterParams) => {
        return params.value ? new Date(params.value) : null;
      },
      valueFormatter: (params) => {
        if (!params.value) return 'N/A';
        return format(new Date(params.value as string), 'MMM dd, yyyy');
      },
    },
    {
      field: 'Amount',
      headerName: 'Total Amount',
      flex: 0.9,
      minWidth: 130,
      type: 'number',
      filterable: true,
      valueFormatter: (params) => formatCurrency(params.value as number),
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ fontWeight: 600 }}>
          {formatCurrency(params.value as number)}
        </Box>
      ),
    },
    {
      field: 'npe01__Payments_Made__c',
      headerName: 'Received',
      flex: 0.9,
      minWidth: 130,
      type: 'number',
      filterable: true,
      valueGetter: (params: GridValueGetterParams) => params.row.npe01__Payments_Made__c || 0,
      valueFormatter: (params) => formatCurrency((params.value as number) || 0),
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ color: 'success.main', fontWeight: 600 }}>
          {formatCurrency((params.value as number) || 0)}
        </Box>
      ),
    },
    {
      field: 'remainingAmount',
      headerName: 'Remaining',
      flex: 0.9,
      minWidth: 130,
      type: 'number',
      filterable: true,
      valueGetter: (params: GridValueGetterParams) => {
        const total = params.row.Amount || 0;
        const received = params.row.npe01__Payments_Made__c || 0;
        return total - received;
      },
      valueFormatter: (params) => formatCurrency(params.value as number),
      renderCell: (params: GridRenderCellParams) => {
        const remaining = params.value as number;
        return (
          <Box sx={{ 
            color: remaining > 0 ? 'warning.main' : 'success.main',
            fontWeight: 600 
          }}>
            {formatCurrency(remaining)}
          </Box>
        );
      },
    },
    {
      field: 'paymentProgress',
      headerName: 'Progress',
      flex: 1,
      minWidth: 140,
      filterable: true,
      valueGetter: (params: GridValueGetterParams) => {
        const amount = params.row.Amount || 0;
        const received = params.row.npe01__Payments_Made__c || 0;
        if (amount === 0) return 0;
        return Math.round((received / amount) * 100);
      },
      renderCell: (params: GridRenderCellParams) => {
        const percentage = params.value as number;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
            <Box
              sx={{
                flex: 1,
                height: 10,
                bgcolor: 'grey.300',
                borderRadius: 1,
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  width: `${Math.min(percentage, 100)}%`,
                  height: '100%',
                  bgcolor: percentage >= 100 ? 'success.main' : percentage > 0 ? 'warning.main' : 'grey.400',
                  transition: 'width 0.3s',
                }}
              />
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 40 }}>
              {percentage}%
            </Typography>
          </Box>
        );
      },
    },
    {
      field: 'Number_of_Payments_Received__c',
      headerName: 'Payments',
      flex: 0.7,
      minWidth: 100,
      type: 'number',
      filterable: true,
      valueGetter: (params: GridValueGetterParams) => params.row.Number_of_Payments_Received__c || 0,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={`${params.value || 0} / ${params.row.npe01__Number_of_Payments__c || 0}`}
          color={((params.value as number) || 0) > 0 ? 'success' : 'default'}
          size="small"
        />
      ),
    },
    {
      field: 'Most_Recent_Payment_Date__c',
      headerName: 'Last Payment',
      flex: 0.9,
      minWidth: 130,
      type: 'date',
      filterable: true,
      valueGetter: (params: GridValueGetterParams) => {
        return params.value ? new Date(params.value) : null;
      },
      valueFormatter: (params) => {
        if (!params.value) return 'No payments yet';
        return format(new Date(params.value as string), 'MMM dd, yyyy');
      },
    },
    {
      field: 'expectedPaymentDate',
      headerName: 'Next Expected',
      flex: 0.9,
      minWidth: 130,
      filterable: true,
      valueGetter: (params: GridValueGetterParams) => {
        const paymentDate = calculatePaymentDate(params.row.CloseDate);
        return paymentDate;
      },
      valueFormatter: (params) => {
        if (!params.value) return 'N/A';
        return format(params.value as Date, 'MMM dd, yyyy');
      },
    },
    {
      field: 'paymentStatus',
      headerName: 'Status',
      flex: 0.8,
      minWidth: 120,
      filterable: true,
      valueGetter: (params: GridValueGetterParams) => {
        const amount = params.row.Amount || 0;
        const received = params.row.npe01__Payments_Made__c || 0;
        const outstanding = params.row.Outstanding_Payments__c || 0;
        
        if (amount === 0) return 'No amount';
        if (received >= amount) return 'Paid';
        if (received > 0) return 'Partial';
        if (outstanding > 0) return 'Scheduled';
        return 'Pending';
      },
      renderCell: (params: GridRenderCellParams) => {
        const status = params.value as string;
        let color: 'success' | 'warning' | 'info' | 'default' | 'error' = 'default';
        
        if (status === 'Paid') color = 'success';
        else if (status === 'Partial') color = 'warning';
        else if (status === 'Scheduled') color = 'info';
        else if (status === 'Pending') color = 'error';
        
        return (
          <Chip
            label={status}
            color={color}
            size="small"
          />
        );
      },
    },
  ];

  // Calculate summary metrics
  const totalPipeline = opportunities?.reduce((sum: number, opp: Opportunity) => 
    sum + (opp.Amount || 0), 0) || 0;
  
  const weightedPipeline = opportunities?.reduce((sum: number, opp: Opportunity) => 
    sum + ((opp.Amount || 0) * (opp.Probability || 0) / 100), 0) || 0;

  // Split opportunities into Pipeline (open) and Payments (closed/won)
  // Payment Tracking: Won/Completed/Collection stages (any stage with payment activity)
  const paymentOpps = opportunities?.filter((opp: Opportunity) => {
    const stage = opp.StageName || '';
    return stage.includes('Closed Won') || 
           stage.includes('Closed / Completed') ||
           stage.includes('Collecting') ||
           stage.includes('In Collection') ||
           stage.includes('In Effect');
  }) || [];

  // Pipeline: Everything else that's not closed/won/collecting and not withdrawn/lost
  const pipelineOpps = opportunities?.filter((opp: Opportunity) => {
    const stage = opp.StageName || '';
    // Exclude if it's in payment tracking
    const isPaymentTracking = stage.includes('Closed Won') || 
                              stage.includes('Closed / Completed') ||
                              stage.includes('Collecting') ||
                              stage.includes('In Collection') ||
                              stage.includes('In Effect');
    // Exclude if it's closed lost or withdrawn
    const isClosedLost = stage.includes('Closed Lost') || 
                         stage.includes('Withdrawn') ||
                         stage.includes('Did not Fulfill');
    
    return !isPaymentTracking && !isClosedLost;
  }) || [];

  const totalPaymentsReceived = paymentOpps.reduce((sum: number, opp: Opportunity) => 
    sum + (opp.npe01__Payments_Made__c || 0), 0) || 0;

  const totalOutstanding = paymentOpps.reduce((sum: number, opp: Opportunity) => 
    sum + ((opp.Amount || 0) - (opp.npe01__Payments_Made__c || 0)), 0) || 0;
  
  const totalExpected = paymentOpps.reduce((sum: number, opp: Opportunity) => 
    sum + (opp.Amount || 0), 0) || 0;

  const navigate = useNavigate();

  return (
    <>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="h4">Grant Management</Typography>
          <Typography variant="body2" color="textSecondary">
            Manage your pipeline and track closed grants
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            startIcon={<AddIcon />}
            onClick={() => navigate('/opportunities/new')}
            variant="contained"
            color="primary"
          >
            New Opportunity
          </Button>
          <Button
            startIcon={<RefreshIcon />}
            onClick={() => queryClient.invalidateQueries('opportunities')}
            variant="outlined"
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span>Sales Pipeline</span>
                <Chip label={pipelineOpps.length} size="small" color="primary" />
              </Box>
            } 
            value={0}
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span>Payment Tracking</span>
                <Chip label={paymentOpps.length} size="small" color="success" />
              </Box>
            } 
            value={1}
          />
        </Tabs>
      </Box>

      {/* Inline Editing Hint */}
      {activeTab === 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <strong>Sales Pipeline:</strong> Track and manage open opportunities. 
          Edit fields inline to update Salesforce instantly: Name, Account, Owner, Stage, Amount, Probability, Close Date.
        </Alert>
      )}
      
      {activeTab === 1 && (
        <Alert severity="success" sx={{ mb: 3 }}>
          <strong>Payment Tracking:</strong> Monitor closed/won grants and payment status. 
          Track received payments, outstanding amounts, and payment schedules.
        </Alert>
      )}

      {/* Summary Cards - Pipeline View */}
      {activeTab === 0 && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Open Opportunities
                </Typography>
                <Typography variant="h4">{pipelineOpps.length}</Typography>
                <Typography variant="body2" color="textSecondary">
                  Active deals
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Total Pipeline Value
                </Typography>
                <Typography variant="h4">{formatCurrency(totalPipeline)}</Typography>
                <Typography variant="body2" color="textSecondary">
                  Potential revenue
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'primary.50' }}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Weighted Pipeline
                </Typography>
                <Typography variant="h4" color="primary.main">
                  {formatCurrency(weightedPipeline)}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Expected value
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Avg Deal Size
                </Typography>
                <Typography variant="h4">
                  {formatCurrency(totalPipeline / (pipelineOpps.length || 1))}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Per opportunity
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Summary Cards - Payment View */}
      {activeTab === 1 && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Closed/Won Grants
                </Typography>
                <Typography variant="h4">{paymentOpps.length}</Typography>
                <Typography variant="body2" color="textSecondary">
                  Awarded deals
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Total Expected
                </Typography>
                <Typography variant="h4">{formatCurrency(totalExpected)}</Typography>
                <Typography variant="body2" color="textSecondary">
                  Awarded amount
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'success.50' }}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Payments Received
                </Typography>
                <Typography variant="h4" color="success.main">
                  {formatCurrency(totalPaymentsReceived)}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {totalExpected > 0 ? Math.round((totalPaymentsReceived / totalExpected) * 100) : 0}% received
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'warning.50' }}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Outstanding
                </Typography>
                <Typography variant="h4" color="warning.main">
                  {formatCurrency(totalOutstanding)}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {totalExpected > 0 ? Math.round((totalOutstanding / totalExpected) * 100) : 0}% remaining
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to load opportunities. Please check your connection.
        </Alert>
      )}

      {/* Data Grid - Pipeline View */}
      {activeTab === 0 && (
        <Card>
          <CardContent>
            <Box sx={{ height: 'calc(100vh - 500px)', minHeight: 600, width: '100%' }}>
              <DataGrid
                rows={pipelineOpps || []}
                columns={pipelineColumns}
                loading={isLoading}
                getRowId={(row) => row.Id}
                pagination
                pageSizeOptions={[25, 50, 100, 250, 500]}
                editMode="cell"
                processRowUpdate={handleCellEdit}
                onProcessRowUpdateError={(error) => {
                  console.error('Error updating row:', error);
                }}
                initialState={{
                  pagination: {
                    paginationModel: { pageSize: 100, page: 0 },
                  },
                  sorting: {
                    sortModel: [{ field: 'CloseDate', sort: 'asc' }],
                  },
                  filter: {
                    filterModel: {
                      items: [],
                    },
                  },
                }}
                filterMode="client"
                sortingMode="client"
                paginationMode="client"
                disableRowSelectionOnClick
                disableColumnFilter={false}
                disableColumnMenu={false}
                isCellEditable={(params) => {
                  // Editable fields for pipeline view
                  return ['Name', 'AccountId', 'OwnerId', 'StageName', 'Amount', 'Probability', 'CloseDate'].includes(params.field);
                }}
                sx={{
                  '& .MuiDataGrid-cell:focus': {
                    outline: 'none',
                  },
                  '& .MuiDataGrid-cell--editable': {
                    cursor: 'pointer',
                    bgcolor: 'background.paper',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                      boxShadow: 'inset 0 0 0 1px rgba(25, 118, 210, 0.5)',
                    },
                  },
                  '& .MuiDataGrid-cell--editing': {
                    backgroundColor: 'primary.light',
                    boxShadow: 'inset 0 0 0 2px #1976d2',
                  },
                  '& .MuiDataGrid-row:hover .MuiDataGrid-cell--editable': {
                    backgroundColor: 'action.hover',
                  },
                }}
              />
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Data Grid - Payment View */}
      {activeTab === 1 && (
        <Card>
          <CardContent>
            <Box sx={{ height: 'calc(100vh - 500px)', minHeight: 600, width: '100%' }}>
              <DataGrid
                rows={paymentOpps || []}
                columns={paymentColumns}
                loading={isLoading}
                getRowId={(row) => row.Id}
                pagination
                pageSizeOptions={[25, 50, 100, 250, 500]}
                initialState={{
                  pagination: {
                    paginationModel: { pageSize: 100, page: 0 },
                  },
                  sorting: {
                    sortModel: [{ field: 'Most_Recent_Payment_Date__c', sort: 'desc' }],
                  },
                  filter: {
                    filterModel: {
                      items: [],
                    },
                  },
                }}
                filterMode="client"
                sortingMode="client"
                paginationMode="client"
                disableRowSelectionOnClick
                disableColumnFilter={false}
                disableColumnMenu={false}
                sx={{
                  '& .MuiDataGrid-cell:focus': {
                    outline: 'none',
                  },
                }}
              />
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Edit Opportunity
          {selectedOpp && (
            <Typography variant="body2" color="textSecondary">
              {selectedOpp.Name}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Opportunity Name"
              fullWidth
              value={editForm.Name || ''}
              onChange={(e) => setEditForm({ ...editForm, Name: e.target.value })}
            />
            
            <TextField
              label="Stage"
              fullWidth
              select
              value={editForm.StageName || ''}
              onChange={(e) => setEditForm({ ...editForm, StageName: e.target.value })}
            >
              {OPPORTUNITY_STAGES.map((stage) => (
                <MenuItem key={stage} value={stage}>
                  {stage}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Amount"
              fullWidth
              type="number"
              value={editForm.Amount || ''}
              onChange={(e) => setEditForm({ ...editForm, Amount: e.target.value })}
              InputProps={{
                startAdornment: '$',
              }}
            />

            <TextField
              label="Probability (%)"
              fullWidth
              type="number"
              value={editForm.Probability || ''}
              onChange={(e) => setEditForm({ ...editForm, Probability: e.target.value })}
              inputProps={{ min: 0, max: 100 }}
            />

            <TextField
              label="Close Date"
              fullWidth
              type="date"
              value={editForm.CloseDate || ''}
              onChange={(e) => setEditForm({ ...editForm, CloseDate: e.target.value })}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={updateMutation.isLoading}
          >
            {updateMutation.isLoading ? <CircularProgress size={24} /> : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Opportunities;
