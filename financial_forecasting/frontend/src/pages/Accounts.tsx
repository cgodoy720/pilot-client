import React, { useState } from 'react';
import { formatDollarMillions } from '../utils/formatters';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tabs,
  Tab,
  Alert,
  TextField,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import {
  Business as BusinessIcon,
  TrendingUp as TrendingUpIcon,
  Payment as PaymentIcon,
  Chat as ChatIcon,
  Person as PersonIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
  VideoCall as VideoCallIcon,
} from '@mui/icons-material';
import { 
  DataGrid, 
  GridColDef, 
  GridRenderCellParams,
  GridValueGetterParams,
} from '@mui/x-data-grid';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

import { apiService } from '../services/api';

interface Account {
  Id: string;
  Name: string;
  Type?: string;
  Industry?: string;
}

interface Opportunity {
  Id: string;
  Name: string;
  StageName: string;
  Amount: number;
  Probability: number;
  CloseDate: string;
  npe01__Payments_Made__c?: number;
  Outstanding_Payments__c?: number;
  AccountId: string;
}

interface SlackMessage {
  text: string;
  user: string;
  channel: string;
  timestamp: string;
  permalink: string;
  date: string | null;
  match_type?: 'mention' | 'channel';
}

interface FirefliesMeeting {
  id: string;
  title: string;
  date: string;
  duration: number;
  attendees: Array<{
    name?: string;
    email?: string;
  }>;
  preview: string;
  keywords: string[];
  action_items: string | string[]; // Can be either a formatted string or an array
  overview?: string;
  match_score: number;
  match_reasons: string[];
  fireflies_url?: string;
  transcript_text?: string; // Full transcript if available
}

interface Contact {
  Id: string;
  Name: string;
  FirstName?: string;
  LastName: string;
  Account?: {
    Name: string;
    attributes?: any;
  };
  npsp__Primary_Affiliation__r?: {
    Name: string;
    attributes?: any;
  };
  Title?: string;
  Email?: string;
  Phone?: string;
}

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

// Format currency values
const formatCurrency = (value: number | undefined): string => {
  if (value === undefined || value === null) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const Accounts: React.FC = () => {
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [createAccountDialogOpen, setCreateAccountDialogOpen] = useState(false);
  const [newAccountData, setNewAccountData] = useState({
    Name: '',
    Type: '',
    Website: '',
    Phone: '',
  });
  const [transcriptModalOpen, setTranscriptModalOpen] = useState(false);
  const [selectedTranscript, setSelectedTranscript] = useState<FirefliesMeeting | null>(null);

  const queryClient = useQueryClient();

  // Fetch all accounts
  const { data: accounts, isLoading: accountsLoading } = useQuery(
    'accounts',
    async () => {
      const response = await apiService.getAccounts();
      return response.data;
    }
  );

  // Fetch all opportunities
  const { data: opportunities, isLoading: oppsLoading } = useQuery(
    'opportunities-for-accounts',
    async () => {
      const response = await apiService.getOpportunities();
      return response.data;
    }
  );

  // Fetch Slack activity for selected account
  const { data: slackActivity, isLoading: slackLoading } = useQuery(
    ['slack-activity', selectedAccount?.Name],
    async () => {
      if (!selectedAccount?.Name) return null;
      try {
        const response = await apiService.getAccountSlackActivity(selectedAccount.Name, 30);
        return response.data;
      } catch (error: any) {
        // If Slack is not configured, return empty data
        if (error.response?.status === 503) {
          return { messages: [], total: 0, configured: false };
        }
        throw error;
      }
    },
    {
      enabled: !!selectedAccount?.Name && dialogOpen,
      retry: false,
    }
  );

  // Fetch Fireflies meeting transcripts for selected account
  const { data: firefliesActivity, isLoading: firefliesLoading } = useQuery(
    ['fireflies-activity', selectedAccount?.Name],
    async () => {
      if (!selectedAccount?.Name) return null;
      try {
        const response = await apiService.getAccountFirefliesMeetings(selectedAccount.Name, 20);
        return response.data;
      } catch (error: any) {
        // If Fireflies is not configured, return empty data
        if (error.response?.status === 503) {
          return { meetings: [], total: 0, configured: false };
        }
        throw error;
      }
    },
    {
      enabled: !!selectedAccount?.Name && dialogOpen,
      retry: false,
    }
  );

  // Fetch contacts for selected account
  const { data: accountContacts, isLoading: contactsLoading } = useQuery(
    ['account-contacts', selectedAccount?.Id],
    async () => {
      if (!selectedAccount?.Id) return null;
      const response = await apiService.getContacts({ account_id: selectedAccount.Id });
      return response.data;
    },
    {
      enabled: !!selectedAccount?.Id && dialogOpen,
    }
  );

  // Create account mutation
  const createAccountMutation = useMutation(
    async (data: any) => {
      const response = await apiService.createAccount(data);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('accounts');
        toast.success('Account created successfully!');
        setCreateAccountDialogOpen(false);
        setNewAccountData({
          Name: '',
          Type: '',
          Website: '',
          Phone: '',
        });
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.detail || 'Failed to create account');
      },
    }
  );

  // Using formatDollarMillions from utils instead

  const getStageColor = (stage: string) => {
    if (stage.includes('Closed Won') || stage.includes('Completed')) return 'success';
    if (stage.includes('Closed Lost') || stage.includes('Withdrawn')) return 'error';
    if (stage.includes('Collecting') || stage.includes('In Collection')) return 'info';
    if (stage.includes('Proposal') || stage.includes('Negotiation')) return 'warning';
    return 'default';
  };

  // Pre-calculate metrics for all accounts (performance optimization)
  const accountMetricsMap = React.useMemo(() => {
    const map = new Map<string, {
      totalOpportunities: number;
      openOpportunities: number;
      wonOpportunities: number;
      openPipelineValue: number;
      wonValue: number;
      totalPaid: number;
      outstanding: number;
    }>();

    if (!opportunities || !accounts) return map;

    // Initialize all accounts
    accounts.forEach((account: Account) => {
      map.set(account.Id, {
        totalOpportunities: 0,
        openOpportunities: 0,
        wonOpportunities: 0,
        openPipelineValue: 0,
        wonValue: 0,
        totalPaid: 0,
        outstanding: 0,
      });
    });

    // Calculate metrics in one pass
    opportunities.forEach((opp: Opportunity) => {
      const metrics = map.get(opp.AccountId);
      if (!metrics) return;

      metrics.totalOpportunities++;

      const isOpen = OPEN_STAGES.includes(opp.StageName);
      const isWon = opp.StageName.includes('Closed Won') || 
                    opp.StageName.includes('Closed / Completed') ||
                    opp.StageName.includes('Collecting') ||
                    opp.StageName.includes('In Collection');

      if (isOpen) {
        metrics.openOpportunities++;
        metrics.openPipelineValue += opp.Amount || 0;
      }
      if (isWon) {
        metrics.wonOpportunities++;
        metrics.wonValue += opp.Amount || 0;
        metrics.totalPaid += opp.npe01__Payments_Made__c || 0;
        metrics.outstanding += (opp.Amount || 0) - (opp.npe01__Payments_Made__c || 0);
      }
    });

    return map;
  }, [opportunities, accounts]);

  const getAccountMetrics = (accountId: string) => {
    return accountMetricsMap.get(accountId) || {
      totalOpportunities: 0,
      openOpportunities: 0,
      wonOpportunities: 0,
      openPipelineValue: 0,
      wonValue: 0,
      totalPaid: 0,
      outstanding: 0,
    };
  };

  const handleAccountClick = (account: Account) => {
    setSelectedAccount(account);
    setDialogOpen(true);
    setActiveTab(0);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedAccount(null);
  };

  const handleCreateAccount = () => {
    if (!newAccountData.Name.trim()) {
      toast.error('Account name is required');
      return;
    }
    createAccountMutation.mutate(newAccountData);
  };

  // Account columns
  const accountColumns: GridColDef[] = [
    {
      field: 'Name',
      headerName: 'Account Name',
      flex: 2,
      minWidth: 250,
      filterable: true,
      renderCell: (params: GridRenderCellParams) => (
        <Box
          sx={{
            cursor: 'pointer',
            color: 'primary.main',
            fontWeight: 600,
            '&:hover': { textDecoration: 'underline' },
          }}
          onClick={() => handleAccountClick(params.row)}
        >
          {params.value}
        </Box>
      ),
    },
    {
      field: 'Type',
      headerName: 'Type',
      flex: 0.8,
      minWidth: 120,
      filterable: true,
    },
    {
      field: 'Industry',
      headerName: 'Industry',
      flex: 1,
      minWidth: 150,
      filterable: true,
    },
    {
      field: 'totalOpportunities',
      headerName: 'Total Opps',
      flex: 0.7,
      minWidth: 100,
      type: 'number',
      filterable: true,
      valueGetter: (params) => {
        return getAccountMetrics(params.row.Id).totalOpportunities;
      },
    },
    {
      field: 'openOpportunities',
      headerName: 'Open',
      flex: 0.6,
      minWidth: 80,
      type: 'number',
      filterable: true,
      valueGetter: (params) => {
        return getAccountMetrics(params.row.Id).openOpportunities;
      },
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value}
          color={params.value > 0 ? 'primary' : 'default'}
          size="small"
        />
      ),
    },
    {
      field: 'wonOpportunities',
      headerName: 'Won',
      flex: 0.6,
      minWidth: 80,
      type: 'number',
      filterable: true,
      valueGetter: (params) => {
        return getAccountMetrics(params.row.Id).wonOpportunities;
      },
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value}
          color={params.value > 0 ? 'success' : 'default'}
          size="small"
        />
      ),
    },
    {
      field: 'openPipelineValue',
      headerName: 'Open Pipeline',
      flex: 1,
      minWidth: 130,
      type: 'number',
      filterable: true,
      valueGetter: (params) => {
        return getAccountMetrics(params.row.Id).openPipelineValue;
      },
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ color: 'primary.main', fontWeight: 600 }}>
          {formatDollarMillions(params.value as number)}
        </Box>
      ),
    },
    {
      field: 'wonValue',
      headerName: 'Amount Won',
      flex: 1,
      minWidth: 130,
      type: 'number',
      filterable: true,
      valueGetter: (params) => {
        return getAccountMetrics(params.row.Id).wonValue;
      },
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ color: 'success.main', fontWeight: 600 }}>
          {formatDollarMillions(params.value as number)}
        </Box>
      ),
    },
    {
      field: 'totalPaid',
      headerName: 'Received',
      flex: 1,
      minWidth: 130,
      type: 'number',
      filterable: true,
      valueGetter: (params) => {
        return getAccountMetrics(params.row.Id).totalPaid;
      },
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ color: 'success.main', fontWeight: 600 }}>
          {formatDollarMillions(params.value as number)}
        </Box>
      ),
    },
    {
      field: 'outstanding',
      headerName: 'Outstanding',
      flex: 1,
      minWidth: 130,
      type: 'number',
      filterable: true,
      valueGetter: (params) => {
        return getAccountMetrics(params.row.Id).outstanding;
      },
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ color: (params.value as number) > 0 ? 'warning.main' : 'text.secondary', fontWeight: 600 }}>
          {formatDollarMillions(params.value as number)}
        </Box>
      ),
    },
  ];

  // Get opportunities for selected account
  const accountOpportunities = selectedAccount
    ? opportunities?.filter((opp: Opportunity) => opp.AccountId === selectedAccount.Id) || []
    : [];

  const openOpps = accountOpportunities.filter((opp: Opportunity) => 
    OPEN_STAGES.includes(opp.StageName)
  );
  const wonOpps = accountOpportunities.filter((opp: Opportunity) => 
    opp.StageName.includes('Closed Won') || 
    opp.StageName.includes('Closed / Completed') ||
    opp.StageName.includes('Collecting') ||
    opp.StageName.includes('In Collection')
  );

  // Opportunity columns for detail view
  const opportunityColumns: GridColDef[] = [
    {
      field: 'Name',
      headerName: 'Opportunity',
      flex: 2,
      minWidth: 200,
    },
    {
      field: 'StageName',
      headerName: 'Stage',
      flex: 1,
      minWidth: 150,
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
      valueFormatter: (params) => formatDollarMillions(params.value as number),
    },
    {
      field: 'Probability',
      headerName: 'Probability',
      flex: 0.7,
      minWidth: 100,
      renderCell: (params: GridRenderCellParams) => `${params.value}%`,
    },
    {
      field: 'CloseDate',
      headerName: 'Close Date',
      flex: 0.9,
      minWidth: 120,
      valueFormatter: (params) => {
        if (!params.value) return 'N/A';
        return format(new Date(params.value as string), 'MMM dd, yyyy');
      },
    },
    {
      field: 'npe01__Payments_Made__c',
      headerName: 'Received',
      flex: 0.9,
      minWidth: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ color: 'success.main', fontWeight: 600 }}>
          {formatDollarMillions((params.value as number) || 0)}
        </Box>
      ),
    },
  ];

  const metrics = selectedAccount ? getAccountMetrics(selectedAccount.Id) : null;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="h4">Funders & Accounts</Typography>
          <Typography variant="body2" color="textSecondary">
            View all funding sources and their grant activity
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            startIcon={<AddIcon />}
            onClick={() => setCreateAccountDialogOpen(true)}
            variant="contained"
            color="primary"
          >
            New Account
          </Button>
          <Button
            startIcon={<RefreshIcon />}
            onClick={() => queryClient.invalidateQueries('accounts')}
            variant="outlined"
          >
            Refresh
          </Button>
        </Box>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        <strong>Click any account name</strong> to see detailed opportunity history and payment tracking.
      </Alert>

      {/* Accounts Table */}
      <Card>
        <CardContent>
          <Box sx={{ height: 'calc(100vh - 400px)', minHeight: 600, width: '100%' }}>
            <DataGrid
              rows={accounts || []}
              columns={accountColumns}
              loading={accountsLoading || oppsLoading}
              getRowId={(row) => row.Id}
              pagination
              pageSizeOptions={[25, 50, 100, 250, 500]}
              initialState={{
                pagination: {
                  paginationModel: { pageSize: 100, page: 0 },
                },
                sorting: {
                  sortModel: [{ field: 'Name', sort: 'asc' }],
                },
              }}
              filterMode="client"
              sortingMode="client"
              paginationMode="client"
              disableRowSelectionOnClick
              disableColumnFilter={false}
              disableColumnMenu={false}
              sortingOrder={['asc', 'desc']}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Account Detail Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BusinessIcon />
            <Box>
              <Typography variant="h6">{selectedAccount?.Name}</Typography>
              {selectedAccount?.Industry && (
                <Typography variant="caption" color="textSecondary">
                  {selectedAccount.Industry}
                </Typography>
              )}
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          {/* Summary Metrics */}
          {metrics && (
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <BusinessIcon color="primary" fontSize="small" sx={{ mr: 1 }} />
                      <Typography variant="caption" color="textSecondary">
                        Total Opportunities
                      </Typography>
                    </Box>
                    <Typography variant="h5">{metrics.totalOpportunities}</Typography>
                    <Typography variant="caption">
                      {metrics.openOpportunities} open, {metrics.wonOpportunities} won
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <TrendingUpIcon color="primary" fontSize="small" sx={{ mr: 1 }} />
                      <Typography variant="caption" color="textSecondary">
                        Open Pipeline
                      </Typography>
                    </Box>
                    <Typography variant="h5" color="primary">{formatDollarMillions(metrics.openPipelineValue)}</Typography>
                    <Typography variant="caption">Active opportunities</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined" sx={{ bgcolor: 'success.50' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <TrendingUpIcon color="success" fontSize="small" sx={{ mr: 1 }} />
                      <Typography variant="caption" color="textSecondary">
                        Amount Won
                      </Typography>
                    </Box>
                    <Typography variant="h5" color="success.main">{formatDollarMillions(metrics.wonValue)}</Typography>
                    <Typography variant="caption">Closed/won grants</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <PaymentIcon color="success" fontSize="small" sx={{ mr: 1 }} />
                      <Typography variant="caption" color="textSecondary">
                        Received
                      </Typography>
                    </Box>
                    <Typography variant="h5" color="success.main">
                      {formatCurrency(metrics.totalPaid)}
                    </Typography>
                    <Typography variant="caption">Payments to date</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <PaymentIcon color="warning" fontSize="small" sx={{ mr: 1 }} />
                      <Typography variant="caption" color="textSecondary">
                        Outstanding
                      </Typography>
                    </Box>
                    <Typography variant="h5" color="warning.main">
                      {formatCurrency(metrics.outstanding)}
                    </Typography>
                    <Typography variant="caption">Still pending</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
              <Tab label={`All Opportunities (${accountOpportunities.length})`} />
              <Tab label={`Open Pipeline (${openOpps.length})`} />
              <Tab label={`Won/Collecting (${wonOpps.length})`} />
              <Tab label="Contacts" icon={<PersonIcon />} iconPosition="start" />
              <Tab label={`Slack Activity (${slackActivity?.total || 0})`} icon={<ChatIcon />} iconPosition="start" />
              <Tab label={`Fireflies Meetings (${firefliesActivity?.total || 0})`} icon={<VideoCallIcon />} iconPosition="start" />
            </Tabs>
          </Box>

          {/* Opportunities List */}
          {activeTab < 3 && (
            <Box sx={{ height: 400 }}>
              <DataGrid
                rows={
                  activeTab === 0
                    ? accountOpportunities
                    : activeTab === 1
                    ? openOpps
                    : wonOpps
                }
                columns={opportunityColumns}
                getRowId={(row) => row.Id}
                hideFooter={accountOpportunities.length <= 10}
                pageSizeOptions={[10, 25, 50]}
                initialState={{
                  pagination: {
                    paginationModel: { pageSize: 10, page: 0 },
                  },
                  sorting: {
                    sortModel: [{ field: 'CloseDate', sort: 'desc' }],
                  },
                }}
                sortingMode="client"
                paginationMode="client"
                filterMode="client"
                disableRowSelectionOnClick
                disableColumnFilter={false}
                disableColumnMenu={false}
              />
            </Box>
          )}

          {/* Contacts List */}
          {activeTab === 3 && (
            <Box sx={{ height: 400, overflow: 'auto' }}>
              {contactsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <Typography>Loading contacts...</Typography>
                </Box>
              ) : !accountContacts || accountContacts.length === 0 ? (
                <Alert severity="info" sx={{ mt: 2 }}>
                  No contacts found for this account.
                </Alert>
              ) : (
                <Grid container spacing={2}>
                  {accountContacts.map((contact: Contact) => (
                    <Grid item xs={12} sm={6} md={4} key={contact.Id}>
                      <Card variant="outlined">
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <PersonIcon color="primary" sx={{ mr: 1 }} />
                            <Typography variant="h6" component="div">
                              {contact.Name}
                            </Typography>
                          </Box>
                          {contact.Title && (
                            <Typography variant="body2" color="textSecondary" gutterBottom>
                              {contact.Title}
                            </Typography>
                          )}
                          {contact.npsp__Primary_Affiliation__r?.Name && (
                            <Typography variant="body2" color="textSecondary" gutterBottom>
                              🏢 {contact.npsp__Primary_Affiliation__r.Name}
                            </Typography>
                          )}
                          {contact.Email && (
                            <Typography variant="body2" sx={{ mt: 1 }}>
                              📧 {contact.Email}
                            </Typography>
                          )}
                          {contact.Phone && (
                            <Typography variant="body2">
                              📞 {contact.Phone}
                            </Typography>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          )}

          {/* Slack Activity */}
          {activeTab === 4 && (
            <Box sx={{ height: 400, overflow: 'auto' }}>
              {slackActivity?.configured === false ? (
                <Alert severity="info" sx={{ mt: 2 }}>
                  <strong>Slack Not Configured</strong>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    To see Slack activity, set the SLACK_BOT_TOKEN environment variable and restart the backend server.
                  </Typography>
                </Alert>
              ) : slackLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <Typography>Loading Slack messages...</Typography>
                </Box>
              ) : !slackActivity || slackActivity.messages.length === 0 ? (
                <Alert severity="info" sx={{ mt: 2 }}>
                  No Slack messages found mentioning "{selectedAccount?.Name}"
                </Alert>
              ) : (
                <Box>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    {slackActivity.total} message{slackActivity.total !== 1 ? 's' : ''} found mentioning this account
                  </Typography>
                  {slackActivity.messages.map((msg: SlackMessage, index: number) => (
                    <Card key={index} sx={{ mb: 2 }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                            <Chip label={`#${msg.channel}`} size="small" color="primary" variant="outlined" />
                            {msg.match_type === 'channel' && (
                              <Chip 
                                label="Dedicated Channel" 
                                size="small" 
                                color="success" 
                                variant="filled"
                              />
                            )}
                            {msg.match_type === 'mention' && (
                              <Chip 
                                label="Mentioned" 
                                size="small" 
                                color="info" 
                                variant="outlined"
                              />
                            )}
                            <Typography variant="caption" color="textSecondary">
                              by {msg.user}
                            </Typography>
                          </Box>
                          {msg.date && (
                            <Typography variant="caption" color="textSecondary">
                              {format(new Date(msg.date), 'MMM dd, yyyy h:mm a')}
                            </Typography>
                          )}
                        </Box>
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mb: 1 }}>
                          {msg.text}
                        </Typography>
                        {msg.permalink && (
                          <Button
                            size="small"
                            href={msg.permalink}
                            target="_blank"
                            rel="noopener noreferrer"
                            startIcon={<ChatIcon />}
                          >
                            View in Slack
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              )}
            </Box>
          )}

          {/* Fireflies Meetings */}
          {activeTab === 5 && (
            <Box sx={{ height: 400, overflow: 'auto' }}>
              {firefliesActivity?.configured === false ? (
                <Alert severity="info" sx={{ mt: 2 }}>
                  <strong>Fireflies Not Configured</strong>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    To see Fireflies meetings, set the FIREFLIES_API_KEY environment variable and restart the backend server.
                  </Typography>
                </Alert>
              ) : firefliesLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <Typography>Loading meeting transcripts...</Typography>
                </Box>
              ) : !firefliesActivity || firefliesActivity.meetings.length === 0 ? (
                <Alert severity="info" sx={{ mt: 2 }}>
                  No Fireflies meetings found related to "{selectedAccount?.Name}"
                </Alert>
              ) : (
                <Box>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    {firefliesActivity.total} meeting{firefliesActivity.total !== 1 ? 's' : ''} found related to this account
                  </Typography>
                  {firefliesActivity.meetings.map((meeting: FirefliesMeeting, index: number) => (
                    <Card key={index} sx={{ mb: 3, boxShadow: 3 }}>
                      <CardContent>
                        {/* Header: Title and Date */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                          <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                            {meeting.title}
                          </Typography>
                          {meeting.date && (
                            <Box sx={{ textAlign: 'right', ml: 2 }}>
                              <Typography variant="body2" color="textSecondary">
                                {format(new Date(meeting.date), 'MMM dd, yyyy')}
                              </Typography>
                              {meeting.duration && (
                                <Typography variant="caption" color="textSecondary">
                                  {Math.round(meeting.duration / 60)} minutes
                                </Typography>
                              )}
                            </Box>
                          )}
                        </Box>

                        {/* Attendees Section */}
                        {meeting.attendees && meeting.attendees.length > 0 && (
                          <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: 'text.primary' }}>
                              👥 Attendees ({meeting.attendees.length})
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                              {meeting.attendees.map((attendee, idx) => (
                                <Chip
                                  key={idx}
                                  label={attendee.name || attendee.email}
                                  size="small"
                                  icon={<PersonIcon />}
                                  sx={{ 
                                    bgcolor: 'primary.light', 
                                    color: 'primary.contrastText',
                                    fontWeight: 500
                                  }}
                                />
                              ))}
                            </Box>
                          </Box>
                        )}

                        {/* Meeting Summary in Scrollable Box */}
                        {meeting.overview && (
                          <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: 'text.primary' }}>
                              📝 Meeting Summary
                            </Typography>
                            <Box 
                              sx={{ 
                                p: 2, 
                                bgcolor: 'grey.50', 
                                borderRadius: 2, 
                                border: '1px solid',
                                borderColor: 'grey.200',
                                maxHeight: '200px',
                                overflowY: 'auto',
                                '&::-webkit-scrollbar': {
                                  width: '8px',
                                },
                                '&::-webkit-scrollbar-track': {
                                  bgcolor: 'grey.100',
                                  borderRadius: '4px',
                                },
                                '&::-webkit-scrollbar-thumb': {
                                  bgcolor: 'grey.400',
                                  borderRadius: '4px',
                                  '&:hover': {
                                    bgcolor: 'grey.500',
                                  },
                                },
                              }}
                            >
                              <Typography variant="body2" sx={{ whiteSpace: 'pre-line', lineHeight: 1.6 }}>
                                {meeting.overview}
                              </Typography>
                            </Box>
                          </Box>
                        )}

                        {/* Action Items */}
                        {meeting.action_items && (
                          <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: 'text.primary' }}>
                              ✅ Action Items
                            </Typography>
                            <Box 
                              sx={{ 
                                p: 2, 
                                bgcolor: '#fff8e1', 
                                borderRadius: 2,
                                border: '1px solid',
                                borderColor: '#ffb74d',
                              }}
                            >
                              {typeof meeting.action_items === 'string' ? (
                                <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                                  {meeting.action_items}
                                </Typography>
                              ) : Array.isArray(meeting.action_items) && meeting.action_items.length > 0 ? (
                                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                                  {meeting.action_items.map((item, idx) => (
                                    <li key={idx}>
                                      <Typography variant="body2">{item}</Typography>
                                    </li>
                                  ))}
                                </ul>
                              ) : null}
                            </Box>
                          </Box>
                        )}

                        {/* Keywords */}
                        {meeting.keywords && meeting.keywords.length > 0 && (
                          <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: 'text.primary' }}>
                              🏷️ Keywords
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                              {meeting.keywords.map((keyword, idx) => (
                                <Chip key={idx} label={keyword} size="small" color="info" variant="outlined" />
                              ))}
                            </Box>
                          </Box>
                        )}

                        {/* View Full Transcript Button */}
                        <Box sx={{ display: 'flex', gap: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                          {meeting.fireflies_url && (
                            <Button
                              size="medium"
                              href={meeting.fireflies_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              startIcon={<VideoCallIcon />}
                              variant="contained"
                              color="primary"
                            >
                              View in Fireflies
                            </Button>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Create Account Dialog */}
      <Dialog open={createAccountDialogOpen} onClose={() => setCreateAccountDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Account</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Account Name"
              fullWidth
              required
              value={newAccountData.Name}
              onChange={(e) => setNewAccountData({ ...newAccountData, Name: e.target.value })}
              placeholder="e.g., Ford Foundation"
            />
            
            <TextField
              label="Type"
              fullWidth
              select
              value={newAccountData.Type}
              onChange={(e) => setNewAccountData({ ...newAccountData, Type: e.target.value })}
              helperText="What type of organization is this?"
            >
              <MenuItem value="">None</MenuItem>
              <MenuItem value="Foundation">Foundation</MenuItem>
              <MenuItem value="Corporate">Corporate</MenuItem>
              <MenuItem value="Government">Government</MenuItem>
              <MenuItem value="Individual">Individual</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </TextField>

            <TextField
              label="Website"
              fullWidth
              value={newAccountData.Website}
              onChange={(e) => setNewAccountData({ ...newAccountData, Website: e.target.value })}
              placeholder="https://example.org"
            />

            <TextField
              label="Phone"
              fullWidth
              value={newAccountData.Phone}
              onChange={(e) => setNewAccountData({ ...newAccountData, Phone: e.target.value })}
              placeholder="(555) 123-4567"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateAccountDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCreateAccount}
            variant="contained"
            disabled={createAccountMutation.isLoading}
            startIcon={createAccountMutation.isLoading ? <CircularProgress size={20} /> : <SaveIcon />}
          >
            {createAccountMutation.isLoading ? 'Creating...' : 'Create Account'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Accounts;

