import React, { useState } from 'react';
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
} from '@mui/material';
import {
  Business as BusinessIcon,
  TrendingUp as TrendingUpIcon,
  Payment as PaymentIcon,
  Chat as ChatIcon,
} from '@mui/icons-material';
import { 
  DataGrid, 
  GridColDef, 
  GridRenderCellParams,
  GridValueGetterParams,
} from '@mui/x-data-grid';
import { useQuery } from 'react-query';
import { format } from 'date-fns';

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

const Accounts: React.FC = () => {
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // Fetch all accounts
  const { data: accounts, isLoading: accountsLoading } = useQuery(
    'accounts',
    async () => {
      const response = await apiService.getAccounts({ limit: 10000 });
      return response.data;
    }
  );

  // Fetch all opportunities
  const { data: opportunities, isLoading: oppsLoading } = useQuery(
    'opportunities-for-accounts',
    async () => {
      const response = await apiService.getOpportunities({ limit: 10000 });
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
      totalValue: number;
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
        totalValue: 0,
        totalPaid: 0,
        outstanding: 0,
      });
    });

    // Calculate metrics in one pass
    opportunities.forEach((opp: Opportunity) => {
      const metrics = map.get(opp.AccountId);
      if (!metrics) return;

      metrics.totalOpportunities++;
      metrics.totalValue += opp.Amount || 0;

      const isOpen = !opp.StageName.includes('Closed') && !opp.StageName.includes('Withdrawn');
      const isWon = opp.StageName.includes('Closed Won') || 
                    opp.StageName.includes('Closed / Completed') ||
                    opp.StageName.includes('Collecting') ||
                    opp.StageName.includes('In Collection');

      if (isOpen) {
        metrics.openOpportunities++;
      }
      if (isWon) {
        metrics.wonOpportunities++;
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
      totalValue: 0,
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
      field: 'totalValue',
      headerName: 'Total Value',
      flex: 1,
      minWidth: 130,
      type: 'number',
      filterable: true,
      valueGetter: (params) => {
        return getAccountMetrics(params.row.Id).totalValue;
      },
      valueFormatter: (params) => formatCurrency(params.value as number),
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
          {formatCurrency(params.value as number)}
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
          {formatCurrency(params.value as number)}
        </Box>
      ),
    },
  ];

  // Get opportunities for selected account
  const accountOpportunities = selectedAccount
    ? opportunities?.filter((opp: Opportunity) => opp.AccountId === selectedAccount.Id) || []
    : [];

  const openOpps = accountOpportunities.filter((opp: Opportunity) => 
    !opp.StageName.includes('Closed') && !opp.StageName.includes('Withdrawn')
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
      valueFormatter: (params) => formatCurrency(params.value as number),
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
          {formatCurrency((params.value as number) || 0)}
        </Box>
      ),
    },
  ];

  const metrics = selectedAccount ? getAccountMetrics(selectedAccount.Id) : null;

  return (
    <Box>
      {/* Header */}
      <Typography variant="h4" gutterBottom>
        Funders & Accounts
      </Typography>
      <Typography variant="body2" color="textSecondary" gutterBottom sx={{ mb: 3 }}>
        View all funding sources and their grant activity
      </Typography>

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
                        Total Value
                      </Typography>
                    </Box>
                    <Typography variant="h5">{formatCurrency(metrics.totalValue)}</Typography>
                    <Typography variant="caption">All opportunities</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined" sx={{ bgcolor: 'success.50' }}>
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
                <Card variant="outlined" sx={{ bgcolor: 'warning.50' }}>
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
              <Tab label={`Slack Activity (${slackActivity?.total || 0})`} icon={<ChatIcon />} iconPosition="start" />
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

          {/* Slack Activity */}
          {activeTab === 3 && (
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
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Accounts;

