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
import { format, parse, differenceInDays } from 'date-fns';

import { apiService } from '../services/api';

interface Bill {
  id: string;
  record_id: string;
  vendor_id: string;
  vendor_name: string;
  description: string;
  date_created: string;
  due_date: string;
  total_entered: number;
  total_due: number;
  total_paid: number;
  state: string;
  priority: string;
  on_hold: boolean;
  doc_number: string;
}

/**
 * Safely parse Intacct date strings (MM/DD/YYYY format) to Date objects.
 */
function parseIntacctDate(dateStr: string | null | undefined): Date | null {
  if (!dateStr) return null;
  try {
    // Intacct returns MM/DD/YYYY
    return parse(dateStr, 'MM/dd/yyyy', new Date());
  } catch {
    try {
      return new Date(dateStr);
    } catch {
      return null;
    }
  }
}

function formatIntacctDate(dateStr: string | null | undefined): string {
  const d = parseIntacctDate(dateStr);
  if (!d || isNaN(d.getTime())) return 'N/A';
  return format(d, 'MMM dd, yyyy');
}

const UnpaidBills: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: billsData, isLoading, error } = useQuery(
    'sage-unpaid-bills',
    async () => {
      const response = await apiService.getSageUnpaidBills({ limit: 500 });
      return response.data;
    },
    { staleTime: 5 * 60 * 1000 }
  );

  const rawBills = Array.isArray(billsData?.bills) ? billsData.bills : [];

  const allBills: Bill[] = rawBills.map((b: any) => ({
    id: b.RECORDNO || '',
    record_id: b.RECORDID || '',
    vendor_id: b.VENDORID || '',
    vendor_name: b.VENDORNAME || '',
    description: b.DESCRIPTION || '',
    date_created: b.WHENCREATED || '',
    due_date: b.WHENDUE || '',
    total_entered: parseFloat(b.TOTALENTERED || '0'),
    total_due: parseFloat(b.TOTALDUE || '0'),
    total_paid: parseFloat(b.TOTALPAID || '0'),
    state: b.STATE || '',
    priority: b.PAYMENTPRIORITY || 'normal',
    on_hold: b.ONHOLD === 'true',
    doc_number: b.DOCNUMBER || '',
  }));

  // Filter by search
  const filteredBills = allBills.filter((bill) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      bill.vendor_name.toLowerCase().includes(search) ||
      bill.record_id.toLowerCase().includes(search) ||
      bill.description.toLowerCase().includes(search) ||
      bill.doc_number.toLowerCase().includes(search)
    );
  });

  // Metrics
  const totalOutstanding = filteredBills.reduce((sum, b) => sum + b.total_due, 0);
  const totalBilled = filteredBills.reduce((sum, b) => sum + Math.abs(b.total_entered), 0);
  const totalPaid = filteredBills.reduce((sum, b) => sum + Math.abs(b.total_paid), 0);

  const now = new Date();
  const overdueBills = filteredBills.filter((b) => {
    const due = parseIntacctDate(b.due_date);
    return due && due < now;
  });
  const overdueAmount = overdueBills.reduce((sum, b) => sum + b.total_due, 0);

  const getDaysOverdue = (dueDate: string): number => {
    const due = parseIntacctDate(dueDate);
    if (!due) return 0;
    const days = differenceInDays(now, due);
    return days > 0 ? days : 0;
  };

  const columns: GridColDef[] = [
    {
      field: 'record_id',
      headerName: 'Bill ID',
      flex: 1,
      minWidth: 180,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap title={params.value as string}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'vendor_name',
      headerName: 'Vendor',
      flex: 1.5,
      minWidth: 200,
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 1.5,
      minWidth: 200,
    },
    {
      field: 'date_created',
      headerName: 'Bill Date',
      flex: 0.9,
      minWidth: 120,
      valueGetter: (params) => {
        const d = parseIntacctDate(params.value);
        return d || null;
      },
      valueFormatter: (params) => {
        if (!params.value) return 'N/A';
        return format(params.value as Date, 'MMM dd, yyyy');
      },
    },
    {
      field: 'due_date',
      headerName: 'Due Date',
      flex: 1,
      minWidth: 140,
      valueGetter: (params) => {
        const d = parseIntacctDate(params.value);
        return d || null;
      },
      renderCell: (params: GridRenderCellParams) => {
        if (!params.value) return 'N/A';
        const dateStr = format(params.value as Date, 'MMM dd, yyyy');
        const daysOverdue = getDaysOverdue(params.row.due_date);

        if (daysOverdue > 0) {
          return (
            <Box>
              <Typography variant="body2" color="error">{dateStr}</Typography>
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
      field: 'total_entered',
      headerName: 'Bill Amount',
      flex: 0.9,
      minWidth: 120,
      type: 'number',
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ fontWeight: 600 }}>
          {formatDollarMillions(Math.abs(params.value as number))}
        </Box>
      ),
    },
    {
      field: 'total_paid',
      headerName: 'Paid',
      flex: 0.8,
      minWidth: 110,
      type: 'number',
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ color: 'success.main' }}>
          {formatDollarMillions(Math.abs(params.value as number))}
        </Box>
      ),
    },
    {
      field: 'total_due',
      headerName: 'Outstanding',
      flex: 0.9,
      minWidth: 120,
      type: 'number',
      renderCell: (params: GridRenderCellParams) => {
        const amount = params.value as number;
        const daysOverdue = getDaysOverdue(params.row.due_date);
        return (
          <Box sx={{
            fontWeight: 700,
            color: daysOverdue > 30 ? 'error.main' : daysOverdue > 0 ? 'warning.main' : 'text.primary',
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
      minWidth: 120,
      renderCell: (params: GridRenderCellParams) => {
        const daysOverdue = getDaysOverdue(params.row.due_date);
        const onHold = params.row.on_hold;
        let color: 'error' | 'warning' | 'info' | 'default' = 'info';
        let label = params.value as string;

        if (onHold) {
          color = 'default';
          label = 'On Hold';
        } else if (daysOverdue > 60) {
          color = 'error';
          label = 'Overdue 60+';
        } else if (daysOverdue > 30) {
          color = 'error';
          label = 'Overdue 30+';
        } else if (daysOverdue > 0) {
          color = 'warning';
          label = 'Past Due';
        }
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
        Failed to load unpaid bills. Please check your Sage Intacct connection.
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
                Unpaid Bills
              </Typography>
              <Typography variant="h4">{filteredBills.length}</Typography>
              <Typography variant="body2" color="textSecondary">
                Invoices received
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Total Outstanding
              </Typography>
              <Typography variant="h4" color="error.main">
                {formatDollarMillions(totalOutstanding)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Owed to vendors
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Already Paid
              </Typography>
              <Typography variant="h4" color="success.main">
                {formatDollarMillions(totalPaid)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Of {formatDollarMillions(totalBilled)} billed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: overdueBills.length > 0 ? 'error.50' : 'background.paper' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Overdue
              </Typography>
              <Typography variant="h4" color={overdueBills.length > 0 ? 'error.main' : 'text.primary'}>
                {overdueBills.length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {formatDollarMillions(overdueAmount)} past due
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search by vendor name, bill ID, description, or doc number..."
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

      {/* Overdue Alert */}
      {overdueBills.length > 0 && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <strong>{overdueBills.length} bill{overdueBills.length !== 1 ? 's' : ''} overdue</strong> — 
          {formatDollarMillions(overdueAmount)} in past-due vendor invoices need attention
        </Alert>
      )}

      {/* Data Grid */}
      <Card>
        <CardContent>
          <Box sx={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={filteredBills}
              columns={columns}
              getRowId={(row) => row.id}
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

export default UnpaidBills;
