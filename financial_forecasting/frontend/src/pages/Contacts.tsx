import React, { useState } from 'react';
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
  CircularProgress,
  Alert,
  Autocomplete,
} from '@mui/material';
import {
  Person as PersonIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { 
  DataGrid, 
  GridColDef, 
  GridRenderCellParams,
} from '@mui/x-data-grid';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';

import { apiService } from '../services/api';

interface Contact {
  Id: string;
  Name: string;
  FirstName?: string;
  LastName: string;
  AccountId: string;
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

interface Account {
  Id: string;
  Name: string;
  Type?: string;
}

const Contacts: React.FC = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newContactData, setNewContactData] = useState({
    FirstName: '',
    LastName: '',
    npsp__Primary_Affiliation__c: '', // Organization where they work
    Title: '',
    Email: '',
    Phone: '',
  });

  const queryClient = useQueryClient();

  // Fetch all contacts
  const { data: contacts, isLoading: contactsLoading, error: contactsError } = useQuery(
    'all-contacts',
    async () => {
      const response = await apiService.getContacts();
      return response.data;
    },
    {
      onError: (error: any) => {
        console.error('Error fetching contacts:', error);
        toast.error('Failed to load contacts: ' + (error.response?.data?.detail || error.message));
      }
    }
  );

  // Fetch accounts for dropdown
  const { data: accounts, isLoading: accountsLoading } = useQuery(
    'accounts',
    async () => {
      const response = await apiService.getAccounts();
      return response.data;
    }
  );

  // Create contact mutation
  const createContactMutation = useMutation(
    async (data: any) => {
      const response = await apiService.createContact(data);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('all-contacts');
        queryClient.invalidateQueries(['account-contacts']);
        toast.success('Contact created successfully!');
        setCreateDialogOpen(false);
        setNewContactData({
          FirstName: '',
          LastName: '',
          npsp__Primary_Affiliation__c: '',
          Title: '',
          Email: '',
          Phone: '',
        });
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.detail || 'Failed to create contact');
      },
    }
  );

  const handleCreateContact = () => {
    if (!newContactData.LastName.trim()) {
      toast.error('Last name is required');
      return;
    }
    if (!newContactData.npsp__Primary_Affiliation__c) {
      toast.error('Primary Affiliation is required');
      return;
    }
    createContactMutation.mutate(newContactData);
  };

  const selectedAccount = accounts?.find((acc: Account) => acc.Id === newContactData.npsp__Primary_Affiliation__c);

  // Contact columns
  const contactColumns: GridColDef[] = [
    {
      field: 'Name',
      headerName: 'Name',
      flex: 1.5,
      minWidth: 200,
      filterable: true,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonIcon fontSize="small" color="action" />
          <Typography variant="body2">{params.value}</Typography>
        </Box>
      ),
    },
    {
      field: 'AccountId',
      headerName: 'Account',
      flex: 1.5,
      minWidth: 200,
      filterable: true,
      valueGetter: (params) => {
        const account = accounts?.find((acc: Account) => acc.Id === params.row.AccountId);
        return account?.Name || 'Unknown';
      },
      renderCell: (params: GridRenderCellParams) => {
        const account = accounts?.find((acc: Account) => acc.Id === params.row.AccountId);
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BusinessIcon fontSize="small" color="action" />
            <Typography variant="body2">{account?.Name || 'Unknown'}</Typography>
          </Box>
        );
      },
    },
    {
      field: 'Title',
      headerName: 'Title',
      flex: 1,
      minWidth: 150,
      filterable: true,
    },
    {
      field: 'primaryAffiliation',
      headerName: 'Primary Affiliation',
      flex: 1.2,
      minWidth: 180,
      filterable: true,
      valueGetter: (params) => params.row.npsp__Primary_Affiliation__r?.Name || '',
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" sx={{ fontStyle: params.value ? 'normal' : 'italic', color: params.value ? 'inherit' : 'text.secondary' }}>
          {params.value || 'No affiliation'}
        </Typography>
      ),
    },
    {
      field: 'Email',
      headerName: 'Email',
      flex: 1.2,
      minWidth: 180,
      filterable: true,
    },
    {
      field: 'Phone',
      headerName: 'Phone',
      flex: 1,
      minWidth: 130,
      filterable: true,
    },
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="h4">Contacts</Typography>
          <Typography variant="body2" color="textSecondary">
            View and manage all contacts across funders
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
            variant="contained"
            color="primary"
          >
            New Contact
          </Button>
          <Button
            startIcon={<RefreshIcon />}
            onClick={() => queryClient.invalidateQueries('all-contacts')}
            variant="outlined"
          >
            Refresh
          </Button>
        </Box>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        <strong>All Contacts:</strong> View and manage contacts from all funders. You can also view
        contacts for a specific funder on the Accounts page.
      </Alert>

      {/* Error Display */}
      {contactsError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to load contacts. Please check your connection or try refreshing.
        </Alert>
      )}

      {/* No contacts message */}
      {!contactsLoading && !contactsError && contacts && contacts.length === 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body1" gutterBottom>
            <strong>No contacts found</strong>
          </Typography>
          <Typography variant="body2">
            You don't have any contacts in your system yet. Click "New Contact" to create your first contact,
            or contacts will be automatically added when you create them during opportunity creation.
          </Typography>
        </Alert>
      )}

      {/* Debug Info - showing count when there are contacts */}
      {!contactsLoading && contacts && contacts.length > 0 && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Loaded {contacts.length} contact(s)
        </Alert>
      )}

      {/* Contacts Table */}
      <Card>
        <CardContent>
          <Box sx={{ height: 'calc(100vh - 400px)', minHeight: 600, width: '100%' }}>
            <DataGrid
              rows={contacts || []}
              columns={contactColumns}
              loading={contactsLoading}
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
              slotProps={{
                noRowsOverlay: {
                  style: {
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                  },
                },
              }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Create Contact Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Contact</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="First Name"
                  fullWidth
                  value={newContactData.FirstName}
                  onChange={(e) => setNewContactData({ ...newContactData, FirstName: e.target.value })}
                  placeholder="John"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Last Name"
                  fullWidth
                  required
                  value={newContactData.LastName}
                  onChange={(e) => setNewContactData({ ...newContactData, LastName: e.target.value })}
                  placeholder="Doe"
                />
              </Grid>
            </Grid>

            <Autocomplete
              options={accounts || []}
              getOptionLabel={(option: Account) => option.Name}
              loading={accountsLoading}
              value={selectedAccount || null}
              onChange={(_, newValue) => {
                setNewContactData({ ...newContactData, npsp__Primary_Affiliation__c: newValue?.Id || '' });
              }}
              isOptionEqualToValue={(option, value) => option.Id === value.Id}
              filterOptions={(options, state) => {
                const inputValue = state.inputValue.toLowerCase();
                if (!inputValue) return options.slice(0, 100);
                return options.filter((option) =>
                  option.Name.toLowerCase().includes(inputValue)
                ).slice(0, 50);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Primary Affiliation (Company/Organization)"
                  placeholder="Type to search for their employer..."
                  required
                  helperText="Select the organization where this person works (e.g., foundation, company). Leave Account blank - a household account will be auto-created."
                />
              )}
              renderOption={(props, option: Account) => (
                <li {...props}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BusinessIcon fontSize="small" color="action" />
                    <Box>
                      <Typography variant="body2">{option.Name}</Typography>
                      {option.Type && (
                        <Typography variant="caption" color="textSecondary">
                          {option.Type}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </li>
              )}
              noOptionsText="No accounts found"
            />

            <TextField
              label="Title"
              fullWidth
              value={newContactData.Title}
              onChange={(e) => setNewContactData({ ...newContactData, Title: e.target.value })}
              placeholder="e.g., Program Officer"
            />


            <TextField
              label="Email"
              fullWidth
              type="email"
              value={newContactData.Email}
              onChange={(e) => setNewContactData({ ...newContactData, Email: e.target.value })}
              placeholder="john.doe@example.org"
            />

            <TextField
              label="Phone"
              fullWidth
              value={newContactData.Phone}
              onChange={(e) => setNewContactData({ ...newContactData, Phone: e.target.value })}
              placeholder="(555) 123-4567"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCreateContact}
            variant="contained"
            disabled={createContactMutation.isLoading}
            startIcon={createContactMutation.isLoading ? <CircularProgress size={20} /> : <SaveIcon />}
          >
            {createContactMutation.isLoading ? 'Creating...' : 'Create Contact'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Contacts;

