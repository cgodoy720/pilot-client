import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Autocomplete,
  Alert,
  Stepper,
  Step,
  StepLabel,
  InputAdornment,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

interface Account {
  Id: string;
  Name: string;
  Type?: string;
}

interface User {
  Id: string;
  Name: string;
}

interface Contact {
  Id: string;
  Name: string;
  FirstName?: string;
  LastName: string;
  AccountId: string;
  npsp__Primary_Affiliation__r?: {
    Name: string;
    attributes?: any;
  };
  Title?: string;
  Email?: string;
  Phone?: string;
}

const STAGES = [
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
];

const STAGE_PROBABILITY_MAP: { [key: string]: number } = {
  'Lead Gen': 10,
  'New Lead': 20,
  'Qualifying': 30,
  'Design / Proposal Creation': 40,
  'Proposal Negotiation': 60,
  'Contract Creation': 70,
  'Negotiating Contract': 80,
  'Collecting / In Effect': 100,
  'Closed / Did not Fulfill': 0,
  'Closed / Completed': 100,
  'Closed Lost': 0,
};

const steps = ['Basic Information', 'Details', 'Review'];

const NewOpportunity: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeStep, setActiveStep] = useState(0);

  // Opportunity RecordTypes
  const RECORD_TYPES = [
    { id: '0121U0000002h3SQAQ', name: 'Philanthropy', description: 'Foundation/grant funding' },
    { id: '0121U0000002h3LQAQ', name: 'Employer Service', description: 'Employer partnerships' },
    { id: '0121U0000002h3PQAQ', name: 'Debt / Equity', description: 'Financial instruments' },
    { id: '0121U0000002h3OQAQ', name: 'Networked Fellow Hiring', description: 'Fellow placements (non-guaranteed)' },
    { id: '0121U0000002h3NQAQ', name: 'Other Fee For Service', description: 'Other paid services' },
    { id: '0121U0000002h3RQAQ', name: 'Other In-Kind', description: 'In-kind contributions' },
  ];

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    recordTypeId: '0121U0000002h3SQAQ', // Default to Philanthropy
    accountId: '',
    contactId: '',
    amount: '',
    closeDate: '',
    stageName: 'Lead Gen',
    probability: 10,
    ownerId: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [customProbability, setCustomProbability] = useState(false);

  // Account creation dialog state
  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  const [newAccountData, setNewAccountData] = useState({
    Name: '',
    Type: '',
    Website: '',
    Phone: '',
  });

  // Contact creation dialog state
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [newContactData, setNewContactData] = useState({
    FirstName: '',
    LastName: '',
    AccountId: '',
    Title: '',
    Email: '',
    Phone: '',
  });

  // Fetch accounts
  const { data: accounts, isLoading: accountsLoading } = useQuery(
    'accounts',
    async () => {
      const response = await apiService.getAccounts();
      return response.data;
    }
  );

  // Fetch users
  const { data: users, isLoading: usersLoading } = useQuery(
    'users',
    async () => {
      const response = await apiService.getUsers({ limit: 1000 });
      return response.data;
    }
  );

  // Fetch contacts (filtered by selected account if available)
  const { data: contacts, isLoading: contactsLoading } = useQuery(
    ['contacts', formData.accountId],
    async () => {
      const response = await apiService.getContacts({ 
        account_id: formData.accountId || undefined,
        limit: 1000 
      });
      return response.data;
    },
    {
      enabled: !!formData.accountId, // Only fetch when account is selected
    }
  );

  // Create opportunity mutation
  const createOpportunityMutation = useMutation(
    async (data: any) => {
      const response = await apiService.createOpportunity(data);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('opportunities');
        toast.success('Opportunity created successfully!');
        navigate('/opportunities');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.detail || 'Failed to create opportunity');
      },
    }
  );

  // Create account mutation
  const createAccountMutation = useMutation(
    async (data: any) => {
      const response = await apiService.createAccount(data);
      return response.data;
    },
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries('accounts');
        toast.success('Account created successfully!');
        setAccountDialogOpen(false);
        // Set the newly created account as selected
        handleFieldChange('accountId', data.id);
        // Reset form
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

  // Create contact mutation
  const createContactMutation = useMutation(
    async (data: any) => {
      const response = await apiService.createContact(data);
      return response.data;
    },
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(['contacts', formData.accountId]);
        toast.success('Contact created successfully!');
        setContactDialogOpen(false);
        // Set the newly created contact as selected
        handleFieldChange('contactId', data.id);
        // Reset form
        setNewContactData({
          FirstName: '',
          LastName: '',
          AccountId: '',
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

  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // Auto-update probability when stage changes (unless manually overridden)
    if (field === 'stageName' && !customProbability) {
      setFormData((prev) => ({
        ...prev,
        probability: STAGE_PROBABILITY_MAP[value] || 0,
      }));
    }

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleProbabilityChange = (value: number) => {
    setCustomProbability(true);
    setFormData((prev) => ({ ...prev, probability: value }));
  };

  const validateStep = (step: number): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (step === 0) {
      // Step 0: Basic Information
      if (!formData.name.trim()) {
        newErrors.name = 'Opportunity name is required';
      }
      if (!formData.accountId) {
        newErrors.accountId = 'Account is required';
      }
    } else if (step === 1) {
      // Step 1: Details
      if (!formData.amount || parseFloat(formData.amount) <= 0) {
        newErrors.amount = 'Amount must be greater than 0';
      }
      if (!formData.closeDate) {
        newErrors.closeDate = 'Close date is required';
      }
      if (!formData.ownerId) {
        newErrors.ownerId = 'Opportunity owner is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(activeStep - 1)) {
      setActiveStep(1); // Go back to details if validation fails
      return;
    }

    const submitData = {
      Name: formData.name,
      RecordTypeId: formData.recordTypeId,
      AccountId: formData.accountId,
      Amount: parseFloat(formData.amount),
      CloseDate: formData.closeDate,
      StageName: formData.stageName,
      Probability: formData.probability,
      OwnerId: formData.ownerId,
    };

    createOpportunityMutation.mutate(submitData);
  };

  const handleCancel = () => {
    navigate('/opportunities');
  };

  const handleCreateAccount = () => {
    if (!newAccountData.Name.trim()) {
      toast.error('Account name is required');
      return;
    }
    createAccountMutation.mutate(newAccountData);
  };

  const handleCreateContact = () => {
    if (!newContactData.LastName.trim()) {
      toast.error('Last name is required');
      return;
    }
    if (!newContactData.AccountId) {
      toast.error('Account is required for contact');
      return;
    }
    createContactMutation.mutate(newContactData);
  };

  const handleOpenAccountDialog = () => {
    setAccountDialogOpen(true);
  };

  const handleOpenContactDialog = () => {
    if (!formData.accountId) {
      toast.error('Please select an account first before creating a contact');
      return;
    }
    setNewContactData((prev) => ({ ...prev, AccountId: formData.accountId }));
    setContactDialogOpen(true);
  };

  const selectedAccount = accounts?.find((acc: Account) => acc.Id === formData.accountId);
  const selectedOwner = users?.find((user: User) => user.Id === formData.ownerId);
  const selectedContact = contacts?.find((contact: Contact) => contact.Id === formData.contactId);
  const selectedRecordType = RECORD_TYPES.find((rt) => rt.id === formData.recordTypeId);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Create New Opportunity
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Add a new grant opportunity to your pipeline
        </Typography>
      </Box>

      {/* Stepper */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stepper activeStep={activeStep}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>

      {/* Form Content */}
      <Card>
        <CardContent>
          {/* Step 0: Basic Information */}
          {activeStep === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                Start by naming your opportunity and selecting the funder
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    select
                    label="Opportunity Type"
                    value={formData.recordTypeId}
                    onChange={(e) => handleFieldChange('recordTypeId', e.target.value)}
                    helperText="What type of funding is this?"
                    required
                  >
                    {RECORD_TYPES.map((rt) => (
                      <MenuItem key={rt.id} value={rt.id}>
                        <Box>
                          <Typography variant="body2">{rt.name}</Typography>
                          <Typography variant="caption" color="textSecondary">
                            {rt.description}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Opportunity Name"
                    placeholder="e.g., 2026 General Operating Support"
                    value={formData.name}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    error={!!errors.name}
                    helperText={errors.name || 'Be specific and include the year/purpose'}
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                    <Autocomplete
                      sx={{ flex: 1 }}
                      options={accounts || []}
                      getOptionLabel={(option: Account) => option.Name}
                      loading={accountsLoading}
                      value={selectedAccount || null}
                      onChange={(_, newValue) => {
                        handleFieldChange('accountId', newValue?.Id || '');
                        // Clear contact when account changes
                        handleFieldChange('contactId', '');
                      }}
                      isOptionEqualToValue={(option, value) => option.Id === value.Id}
                      filterOptions={(options, state) => {
                        const inputValue = state.inputValue.toLowerCase();
                        if (!inputValue) return options.slice(0, 100); // Show first 100 when empty
                        
                        return options
                          .filter((option) =>
                            option.Name.toLowerCase().includes(inputValue)
                          )
                          .slice(0, 50); // Limit to 50 results
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Funder (Account)"
                          placeholder="Type to search funders..."
                          error={!!errors.accountId}
                          helperText={errors.accountId || 'Start typing to search - e.g., "Ford", "Gates"'}
                          required
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
                      noOptionsText="No funders found - try a different search"
                    />
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={handleOpenAccountDialog}
                      sx={{ mt: 1, minWidth: '150px' }}
                    >
                      New Account
                    </Button>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                    <Autocomplete
                      sx={{ flex: 1 }}
                      options={contacts || []}
                      getOptionLabel={(option: Contact) => option.Name || `${option.FirstName || ''} ${option.LastName}`.trim()}
                      loading={contactsLoading}
                      value={selectedContact || null}
                      onChange={(_, newValue) => {
                        handleFieldChange('contactId', newValue?.Id || '');
                      }}
                      isOptionEqualToValue={(option, value) => option.Id === value.Id}
                      disabled={!formData.accountId}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Primary Contact (Optional)"
                          placeholder={formData.accountId ? "Type to search contacts..." : "Select an account first"}
                          helperText={
                            formData.accountId 
                              ? 'Choose a contact at this funder' 
                              : 'Select an account to see available contacts'
                          }
                        />
                      )}
                      renderOption={(props, option: Contact) => (
                        <li {...props}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PersonIcon fontSize="small" color="action" />
                            <Box>
                              <Typography variant="body2">{option.Name}</Typography>
                              {option.Title && (
                                <Typography variant="caption" color="textSecondary">
                                  {option.Title}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </li>
                      )}
                      noOptionsText="No contacts found for this account"
                    />
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={handleOpenContactDialog}
                      disabled={!formData.accountId}
                      sx={{ mt: 1, minWidth: '150px' }}
                    >
                      New Contact
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Step 1: Details */}
          {activeStep === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Opportunity Details
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                Add financial details and timeline
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Amount"
                    type="number"
                    value={formData.amount}
                    onChange={(e) => handleFieldChange('amount', e.target.value)}
                    error={!!errors.amount}
                    helperText={errors.amount || 'Total grant amount'}
                    required
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Close Date"
                    type="date"
                    value={formData.closeDate}
                    onChange={(e) => handleFieldChange('closeDate', e.target.value)}
                    error={!!errors.closeDate}
                    helperText={errors.closeDate || 'Expected decision date'}
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    select
                    label="Stage"
                    value={formData.stageName}
                    onChange={(e) => handleFieldChange('stageName', e.target.value)}
                    helperText="Current stage in the grant process"
                  >
                    {STAGES.map((stage) => (
                      <MenuItem key={stage} value={stage}>
                        {stage}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Probability"
                    type="number"
                    value={formData.probability}
                    onChange={(e) => handleProbabilityChange(parseInt(e.target.value))}
                    helperText={
                      customProbability
                        ? 'Custom probability set'
                        : `Auto-set based on stage (${STAGE_PROBABILITY_MAP[formData.stageName]}%)`
                    }
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    }}
                    inputProps={{ min: 0, max: 100 }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Autocomplete
                    options={users || []}
                    getOptionLabel={(option: User) => option.Name}
                    loading={usersLoading}
                    value={selectedOwner || null}
                    onChange={(_, newValue) => {
                      handleFieldChange('ownerId', newValue?.Id || '');
                    }}
                    isOptionEqualToValue={(option, value) => option.Id === value.Id}
                    filterOptions={(options, state) => {
                      const inputValue = state.inputValue.toLowerCase();
                      if (!inputValue) return options;
                      
                      return options.filter((option) =>
                        option.Name.toLowerCase().includes(inputValue)
                      );
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Opportunity Owner"
                        placeholder="Type to search team members..."
                        error={!!errors.ownerId}
                        helperText={errors.ownerId || 'Start typing to find your team member'}
                        required
                      />
                    )}
                    renderOption={(props, option: User) => (
                      <li {...props}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PersonIcon fontSize="small" color="action" />
                          <Typography variant="body2">{option.Name}</Typography>
                        </Box>
                      </li>
                    )}
                    noOptionsText="No team members found"
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Step 2: Review */}
          {activeStep === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Review & Submit
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                Please review the information before creating the opportunity
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                        Opportunity Type
                      </Typography>
                      <Chip label={selectedRecordType?.name} color="primary" size="small" sx={{ mb: 2 }} />
                      <Typography variant="caption" color="textSecondary" display="block">
                        {selectedRecordType?.description}
                      </Typography>

                      <Typography variant="subtitle2" color="textSecondary" gutterBottom sx={{ mt: 2 }}>
                        Opportunity Name
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {formData.name}
                      </Typography>

                      <Typography variant="subtitle2" color="textSecondary" gutterBottom sx={{ mt: 2 }}>
                        Funder
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <BusinessIcon fontSize="small" color="action" />
                        <Typography variant="body1">{selectedAccount?.Name}</Typography>
                      </Box>

                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="subtitle2" color="textSecondary">
                            Amount
                          </Typography>
                          <Typography variant="h6" color="primary">
                            ${parseFloat(formData.amount || '0').toLocaleString()}
                          </Typography>
                        </Grid>

                        <Grid item xs={6}>
                          <Typography variant="subtitle2" color="textSecondary">
                            Close Date
                          </Typography>
                          <Typography variant="h6">
                            {new Date(formData.closeDate).toLocaleDateString()}
                          </Typography>
                        </Grid>

                        <Grid item xs={6}>
                          <Typography variant="subtitle2" color="textSecondary">
                            Stage
                          </Typography>
                          <Chip label={formData.stageName} color="primary" size="small" />
                        </Grid>

                        <Grid item xs={6}>
                          <Typography variant="subtitle2" color="textSecondary">
                            Probability
                          </Typography>
                          <Typography variant="body1">{formData.probability}%</Typography>
                        </Grid>

                        <Grid item xs={12}>
                          <Typography variant="subtitle2" color="textSecondary">
                            Owner
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PersonIcon fontSize="small" color="action" />
                            <Typography variant="body1">{selectedOwner?.Name}</Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Navigation Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              variant="outlined"
              onClick={activeStep === 0 ? handleCancel : handleBack}
              startIcon={<CancelIcon />}
            >
              {activeStep === 0 ? 'Cancel' : 'Back'}
            </Button>

            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                startIcon={<SaveIcon />}
                disabled={createOpportunityMutation.isLoading}
              >
                {createOpportunityMutation.isLoading ? 'Creating...' : 'Create Opportunity'}
              </Button>
            ) : (
              <Button variant="contained" onClick={handleNext}>
                Next
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Create Account Dialog */}
      <Dialog open={accountDialogOpen} onClose={() => setAccountDialogOpen(false)} maxWidth="sm" fullWidth>
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
          <Button onClick={() => setAccountDialogOpen(false)}>Cancel</Button>
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

      {/* Create Contact Dialog */}
      <Dialog open={contactDialogOpen} onClose={() => setContactDialogOpen(false)} maxWidth="sm" fullWidth>
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

            <TextField
              label="Account"
              fullWidth
              value={selectedAccount?.Name || ''}
              disabled
              helperText="Contact will be associated with this account"
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
          <Button onClick={() => setContactDialogOpen(false)}>Cancel</Button>
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

export default NewOpportunity;

