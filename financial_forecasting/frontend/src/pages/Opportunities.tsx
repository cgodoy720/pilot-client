import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
import { format, addDays, parseISO, differenceInDays } from 'date-fns';

import { apiService } from '../services/api';

// Opportunity stages - matching Salesforce picklist
const OPPORTUNITY_STAGES = [
  '--None--',
  'Lead Gen',
  'New Lead',
  'Qualifying',
  'Design / Proposal Creation',
  'Proposal Negotiation',
  'Contract Creation',
  'Negotiating Contract',
  'Collecting / In Effect',
  'Closed / Did not Fulfill',
  'Closed / Completed',
  'Closed Lost',
  'Withdrawn',
];

// Open pipeline stages - anything actively being pursued
const OPEN_STAGES = [
  'Lead Gen',
  'New Lead',
  'Qualifying',
  'Design / Proposal Creation',
  'Proposal Negotiation',
  'Contract Creation',
  'Negotiating Contract'
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
  PaymentDate__c?: string;
  Earliest_Scheduled_Payment__c?: string;
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
        const response = await apiService.getAccounts();
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
  const location = useLocation();
  const navigate = useNavigate();
  
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [activeTab, setActiveTab] = useState<number>(0);
  const [recentlyChangedIds, setRecentlyChangedIds] = useState<Set<string>>(new Set());
  const recentlyChangedRef = useRef<Set<string>>(new Set());
  const [filteredPipelineRows, setFilteredPipelineRows] = useState<Opportunity[]>([]);
  const [filteredPaymentRows, setFilteredPaymentRows] = useState<Opportunity[]>([]);
  const [initialFilter, setInitialFilter] = useState<'atRisk' | 'stale' | null>(null);

  const queryClient = useQueryClient();

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
      const response = await apiService.getAccounts();
      return response.data;
    },
    {
      staleTime: 300000, // Cache for 5 minutes
    }
  );

  // Handle incoming filter from Dashboard
  useEffect(() => {
    const state = location.state as { filterAtRisk?: boolean; filterStale?: boolean } | null;
    if (state) {
      if (state.filterAtRisk) {
        setInitialFilter('atRisk');
      } else if (state.filterStale) {
        setInitialFilter('stale');
      }
      // Clear the state so it doesn't persist on refresh
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state]);

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

  // Using formatDollarMillions from utils instead

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

    return newRow; // No changes
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
      valueGetter: (params: GridValueGetterParams) => {
        // Return the owner's name for filtering to work correctly
        const user = users?.find((u: any) => u.Id === params.row.OwnerId);
        return user?.Name || params.row.Owner?.Name || 'Unassigned';
      },
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
      editable: false, // We'll handle editing with custom dropdown
      filterable: true,
      renderCell: (params: GridRenderCellParams) => (
        <Select
          value={params.value || ''}
          onChange={async (e) => {
            const newStage = e.target.value;
            if (newStage === params.value) return;
            
            const loadingToast = toast.loading('Updating stage...');
            
            // Keep item visible for 5 seconds if moving to closed stage
            const closedStages = ['Withdrawn', 'Closed Lost', 'Closed / Did not Fulfill', 'Closed / Completed'];
            const isMovingToClosed = closedStages.includes(newStage);
            
            if (isMovingToClosed) {
              // Use both ref (immediate) and state (triggers re-render)
              console.log('🔴 Moving to closed stage:', newStage, 'ID:', params.row.Id);
              recentlyChangedRef.current.add(params.row.Id);
              setRecentlyChangedIds(prev => {
                const next = new Set(prev).add(params.row.Id);
                console.log('🟡 Updated recentlyChangedIds:', Array.from(next));
                return next;
              });
              
              setTimeout(() => {
                console.log('⏰ 5 seconds passed, removing ID:', params.row.Id);
                recentlyChangedRef.current.delete(params.row.Id);
                setRecentlyChangedIds(prev => {
                  const next = new Set(prev);
                  next.delete(params.row.Id);
                  return next;
                });
              }, 5000); // Keep visible for 5 seconds
            }
            
            // Optimistically update the UI immediately
            const oldData = queryClient.getQueryData('opportunities');
            queryClient.setQueryData('opportunities', (old: any) => {
              if (!old) return old;
              return old.map((opp: any) => 
                opp.Id === params.row.Id 
                  ? { ...opp, StageName: newStage }
                  : opp
              );
            });
            
            try {
              // Only send the StageName field to update
              await apiService.updateOpportunity(params.row.Id, {
                StageName: newStage
              });
              toast.success('Stage updated!', { 
                id: loadingToast
              });
              // Refresh in background to get any server-side changes
              queryClient.invalidateQueries('opportunities');
            } catch (error: any) {
              // Revert on error
              queryClient.setQueryData('opportunities', oldData);
              setRecentlyChangedIds(prev => {
                const next = new Set(prev);
                next.delete(params.row.Id);
                return next;
              });
              toast.error(`Failed: ${error.response?.data?.detail || error.message}`, { id: loadingToast });
            }
          }}
          size="small"
          variant="standard"
          sx={{
            width: '100%',
            '& .MuiSelect-select': {
              padding: '4px 8px',
              fontSize: '0.875rem',
            },
            '&:before': { borderBottom: 'none' },
            '&:hover:not(.Mui-disabled):before': { borderBottom: 'none' },
            '&:after': { borderBottom: 'none' },
          }}
          renderValue={(value) => (
            <Chip
              label={value}
              color={getStageColor(value as string)}
              size="small"
            />
          )}
        >
          {OPPORTUNITY_STAGES.map((stage) => (
            <MenuItem key={stage} value={stage}>
              {stage}
            </MenuItem>
          ))}
        </Select>
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
      valueFormatter: (params) => formatDollarMillions(params.value as number),
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
      field: 'PaymentDate__c',
      headerName: '1st Payment Date',
      flex: 0.9,
      minWidth: 130,
      type: 'date',
      editable: true,
      filterable: true,
      valueGetter: (params: GridValueGetterParams) => {
        return params.value ? new Date(params.value) : null;
      },
      valueFormatter: (params) => {
        if (!params.value) return '-';
        return format(new Date(params.value as string), 'MMM dd, yyyy');
      },
    },
    {
      field: 'LastModifiedDate',
      headerName: 'Last Modified',
      flex: 0.9,
      minWidth: 120,
      type: 'dateTime',
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
      valueFormatter: (params) => formatDollarMillions(params.value as number),
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
      valueGetter: (params: GridValueGetterParams) => {
        // Return the account name for filtering to work correctly
        const account = accounts?.find((acc: any) => acc.Id === params.row.AccountId);
        return account?.Name || params.row.Account?.Name || 'Unknown';
      },
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
      valueFormatter: (params) => formatDollarMillions(params.value as number),
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ fontWeight: 600 }}>
          {formatDollarMillions(params.value as number)}
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
      valueFormatter: (params) => formatDollarMillions((params.value as number) || 0),
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ color: 'success.main', fontWeight: 600 }}>
          {formatDollarMillions((params.value as number) || 0)}
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
      valueFormatter: (params) => formatDollarMillions(params.value as number),
      renderCell: (params: GridRenderCellParams) => {
        const remaining = params.value as number;
        return (
          <Box sx={{ 
            color: remaining > 0 ? 'warning.main' : 'success.main',
            fontWeight: 600 
          }}>
            {formatDollarMillions(remaining)}
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

  // Pipeline: Only include stages actively being pursued
  // Also keep recently changed opportunities visible for 5 seconds
  let pipelineOpps = opportunities?.filter((opp: Opportunity) => {
    const isOpen = OPEN_STAGES.includes(opp.StageName);
    const inRecentSet = recentlyChangedIds.has(opp.Id);
    const inRecentRef = recentlyChangedRef.current.has(opp.Id);
    const shouldInclude = isOpen || inRecentSet || inRecentRef;
    
    if (inRecentSet || inRecentRef) {
      console.log('🟢 Keeping opp visible:', opp.Id, opp.Name, 'Stage:', opp.StageName, 
                  'inRecentSet:', inRecentSet, 'inRecentRef:', inRecentRef);
    }
    
    return shouldInclude;
  }) || [];

  // Apply additional filters from Dashboard navigation
  if (initialFilter === 'atRisk') {
    const now = new Date();
    const currentQuarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
    const currentQuarterEnd = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3 + 3, 0);
    
    pipelineOpps = pipelineOpps.filter((opp: Opportunity) => {
      if (!opp.CloseDate) return false;
      const closeDate = parseISO(opp.CloseDate);
      const inCurrentQuarter = closeDate >= currentQuarterStart && closeDate <= currentQuarterEnd;
      const atRisk = (opp.Probability || 0) < 50 || ['Lead Gen', 'New Lead', 'Qualifying'].includes(opp.StageName || '');
      return inCurrentQuarter && atRisk;
    });
  } else if (initialFilter === 'stale') {
    const now = new Date();
    pipelineOpps = pipelineOpps.filter((opp: Opportunity) => {
      if (!opp.CloseDate) return false;
      const closeDate = parseISO(opp.CloseDate);
      const isPastDue = closeDate < now;
      
      const lastModified = opp.LastModifiedDate ? parseISO(opp.LastModifiedDate) : parseISO(opp.CreatedDate);
      const daysSinceUpdate = differenceInDays(now, lastModified);
      const notUpdated = daysSinceUpdate > 30;
      
      return isPastDue || notUpdated;
    });
  }

  const totalPaymentsReceived = paymentOpps.reduce((sum: number, opp: Opportunity) => 
    sum + (opp.npe01__Payments_Made__c || 0), 0) || 0;

  const totalOutstanding = paymentOpps.reduce((sum: number, opp: Opportunity) => 
    sum + ((opp.Amount || 0) - (opp.npe01__Payments_Made__c || 0)), 0) || 0;
  
  const totalExpected = paymentOpps.reduce((sum: number, opp: Opportunity) => 
    sum + (opp.Amount || 0), 0) || 0;

  // Calculate summary metrics from FILTERED pipeline opportunities (not all opportunities)
  const totalPipeline = pipelineOpps.reduce((sum: number, opp: Opportunity) => 
    sum + (opp.Amount || 0), 0) || 0;
  
  const weightedPipeline = pipelineOpps.reduce((sum: number, opp: Opportunity) => 
    sum + ((opp.Amount || 0) * (opp.Probability || 0) / 100), 0) || 0;

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
                <span>Open Pipeline</span>
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

      {/* Filter Alert */}
      {initialFilter && (
        <Alert 
          severity="warning" 
          sx={{ mb: 3 }}
          onClose={() => setInitialFilter(null)}
        >
          {initialFilter === 'atRisk' && (
            <>
              <strong>Showing At-Risk Deals Only:</strong> Current quarter opportunities with low probability (&lt;50%) or early stage.
            </>
          )}
          {initialFilter === 'stale' && (
            <>
              <strong>Showing Stale Opportunities Only:</strong> Opportunities that are past due or haven't been updated in 30+ days.
            </>
          )}
        </Alert>
      )}

      {/* Inline Editing Hint */}
      {activeTab === 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <strong>Open Pipeline:</strong> Track and manage open opportunities. 
          Edit fields inline to update Salesforce instantly: Name, Account, Owner, Stage, Amount, Probability, Close Date, 1st Payment Date.
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
                <Typography variant="h4">{formatDollarMillions(totalPipeline)}</Typography>
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
                  {formatDollarMillions(weightedPipeline)}
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
                  {formatDollarMillions(totalPipeline / (pipelineOpps.length || 1))}
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
                <Typography variant="h4">{formatDollarMillions(totalExpected)}</Typography>
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
                  {formatDollarMillions(totalPaymentsReceived)}
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
                  {formatDollarMillions(totalOutstanding)}
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
            {/* Filtered Totals Bar */}
            {filteredPipelineRows.length > 0 && (
              <Box sx={{ 
                p: 2, 
                mb: 2, 
                bgcolor: 'background.paper', 
                borderRadius: 1,
                display: 'flex',
                gap: 3,
                flexWrap: 'wrap',
                border: '1px solid',
                borderColor: 'divider'
              }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  Showing: {filteredPipelineRows.length} opportunities
                </Typography>
                <Typography variant="body2">
                  Total Value: {formatDollarMillions(filteredPipelineRows.reduce((sum: number, opp: Opportunity) => sum + (opp.Amount || 0), 0))}
                </Typography>
                <Typography variant="body2">
                  Weighted Value: {formatDollarMillions(filteredPipelineRows.reduce((sum: number, opp: Opportunity) => sum + ((opp.Amount || 0) * (opp.Probability || 0) / 100), 0))}
                </Typography>
                <Typography variant="body2">
                  Avg Probability: {filteredPipelineRows.length > 0 ? Math.round(filteredPipelineRows.reduce((sum: number, opp: Opportunity) => sum + (opp.Probability || 0), 0) / filteredPipelineRows.length) : 0}%
                </Typography>
              </Box>
            )}
            <Box sx={{ height: 'calc(100vh - 500px)', minHeight: 600, width: '100%' }}>
              <DataGrid
                rows={pipelineOpps || []}
                columns={pipelineColumns}
                loading={isLoading}
                onStateChange={(state) => {
                  // Update filtered rows based on current filter/sort state
                  const visibleRows = state.filter.filteredRowsLookup;
                  const filtered = pipelineOpps.filter((opp: Opportunity) => visibleRows[opp.Id] !== false);
                  setFilteredPipelineRows(filtered);
                }}
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
                  // Editable fields for pipeline view (StageName handled by custom dropdown)
                  return ['Name', 'AccountId', 'OwnerId', 'Amount', 'Probability', 'CloseDate', 'PaymentDate__c'].includes(params.field);
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
            {/* Filtered Totals Bar */}
            {filteredPaymentRows.length > 0 && (
              <Box sx={{ 
                p: 2, 
                mb: 2, 
                bgcolor: 'background.paper', 
                borderRadius: 1,
                display: 'flex',
                gap: 3,
                flexWrap: 'wrap',
                border: '1px solid',
                borderColor: 'divider'
              }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  Showing: {filteredPaymentRows.length} opportunities
                </Typography>
                <Typography variant="body2">
                  Total Amount: {formatDollarMillions(filteredPaymentRows.reduce((sum: number, opp: Opportunity) => sum + (opp.Amount || 0), 0))}
                </Typography>
                <Typography variant="body2">
                  Received: {formatDollarMillions(filteredPaymentRows.reduce((sum: number, opp: Opportunity) => sum + (opp.npe01__Payments_Made__c || 0), 0))}
                </Typography>
                <Typography variant="body2">
                  Outstanding: {formatDollarMillions(filteredPaymentRows.reduce((sum: number, opp: Opportunity) => sum + ((opp.Amount || 0) - (opp.npe01__Payments_Made__c || 0)), 0))}
                </Typography>
              </Box>
            )}
            <Box sx={{ height: 'calc(100vh - 500px)', minHeight: 600, width: '100%' }}>
              <DataGrid
                rows={paymentOpps || []}
                columns={paymentColumns}
                loading={isLoading}
                onStateChange={(state) => {
                  // Update filtered rows based on current filter/sort state
                  const visibleRows = state.filter.filteredRowsLookup;
                  const filtered = paymentOpps.filter((opp: Opportunity) => visibleRows[opp.Id] !== false);
                  setFilteredPaymentRows(filtered);
                }}
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
