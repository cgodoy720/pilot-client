import React, { useState, useEffect } from 'react';
import { History, RefreshCw, Filter, CheckCircle, AlertTriangle, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { adminApi } from '../../services/adminApi';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../utils/retryUtils';

const ExportHistory = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    successStatus: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);

  const limit = 20;

  const fetchHistory = async (pageNum = 1, filterParams = {}) => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        limit,
        offset: (pageNum - 1) * limit,
        ...filterParams
      };

      const response = user.role === 'admin' 
        ? await adminApi.getAllCsvExportHistory(params)
        : await adminApi.getCsvExportHistory(params);

      setHistory(response.data || []);
      setTotalPages(Math.ceil((response.pagination?.count || 0) / limit));
      setPage(pageNum);

    } catch (err) {
      console.error('Error fetching export history:', err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handlePageChange = (newPage) => {
    fetchHistory(newPage, filters);
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleApplyFilters = () => {
    const filterParams = {};
    if (filters.startDate) filterParams.startDate = filters.startDate;
    if (filters.endDate) filterParams.endDate = filters.endDate;
    if (filters.successStatus !== 'all') {
      filterParams.successStatus = filters.successStatus === 'success';
    }
    fetchHistory(1, filterParams);
  };

  const handleClearFilters = () => {
    setFilters({ startDate: '', endDate: '', successStatus: 'all' });
    fetchHistory(1, {});
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading && history.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin w-8 h-8 border-4 border-[#4242EA] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <Card className="bg-white border-[#C8C8C8]">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-[#4242EA]" />
            <h2 className="text-xl font-semibold text-[#1E1E1E]">Export History</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#C8C8C8] rounded-lg text-sm text-[#666666] hover:bg-[#F9F9F9] transition-colors"
            >
              <Filter className="h-4 w-4" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
            <button
              onClick={() => fetchHistory(page, filters)}
              disabled={loading}
              className="p-2 hover:bg-[#EFEFEF] rounded-md transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 text-[#666666] ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-red-50 border border-red-200">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span className="text-red-600">{error}</span>
          </div>
        )}

        {/* Filters */}
        {showFilters && (
          <Card className="mb-4 bg-[#F9F9F9] border-[#E3E3E3]">
            <CardContent className="p-4">
              <p className="text-sm font-medium text-[#1E1E1E] mb-3">Filter Export History</p>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
                <div>
                  <Label className="text-[#666666] text-xs">Start Date</Label>
                  <Input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                    className="mt-1 bg-white border-[#C8C8C8]"
                  />
                </div>
                <div>
                  <Label className="text-[#666666] text-xs">End Date</Label>
                  <Input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                    className="mt-1 bg-white border-[#C8C8C8]"
                  />
                </div>
                <div>
                  <Label className="text-[#666666] text-xs">Status</Label>
                  <Select value={filters.successStatus} onValueChange={(v) => handleFilterChange('successStatus', v)}>
                    <SelectTrigger className="mt-1 bg-white border-[#C8C8C8]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleApplyFilters}
                    disabled={loading}
                    className="px-4 py-2 bg-[#4242EA] text-white text-sm rounded-lg hover:bg-[#3636c4] transition-colors disabled:opacity-50"
                  >
                    Apply
                  </button>
                  <button
                    onClick={handleClearFilters}
                    disabled={loading}
                    className="px-4 py-2 border border-[#C8C8C8] text-[#666666] text-sm rounded-lg hover:bg-white transition-colors disabled:opacity-50"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Table */}
        {history.length === 0 ? (
          <div className="flex items-center gap-2 p-4 rounded-lg bg-blue-50 border border-blue-200">
            <Info className="h-5 w-5 text-blue-600" />
            <span className="text-blue-600">No export history found. Start by exporting some attendance data.</span>
          </div>
        ) : (
          <>
            <div className="border border-[#C8C8C8] rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F9F9F9]">
                    <TableHead className="text-[#1E1E1E] font-semibold">Date/Time</TableHead>
                    <TableHead className="text-[#1E1E1E] font-semibold">User</TableHead>
                    <TableHead className="text-[#1E1E1E] font-semibold">Date Range</TableHead>
                    <TableHead className="text-[#1E1E1E] font-semibold">Cohort</TableHead>
                    <TableHead className="text-[#1E1E1E] font-semibold">Status</TableHead>
                    <TableHead className="text-[#1E1E1E] font-semibold">Size</TableHead>
                    <TableHead className="text-[#1E1E1E] font-semibold">Rows</TableHead>
                    <TableHead className="text-[#1E1E1E] font-semibold">Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((record) => (
                    <TableRow key={record.log_id} className="border-b border-[#E3E3E3]">
                      <TableCell className="text-[#1E1E1E] text-sm">{formatDate(record.export_timestamp)}</TableCell>
                      <TableCell className="text-[#666666] text-sm">{record.user_name}</TableCell>
                      <TableCell className="text-[#666666] text-sm">{record.export_start_date} to {record.export_end_date}</TableCell>
                      <TableCell className="text-[#666666] text-sm">{record.cohort_filter || 'All Cohorts'}</TableCell>
                      <TableCell>
                        {record.success_status ? (
                          <Badge className="bg-green-100 text-green-700">
                            <CheckCircle className="h-3 w-3 mr-1" /> Success
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-700" title={record.error_message || 'Export failed'}>
                            <AlertTriangle className="h-3 w-3 mr-1" /> Failed
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-[#666666] text-sm">{formatFileSize(record.file_size_bytes)}</TableCell>
                      <TableCell className="text-[#666666] text-sm">{record.row_count || 'N/A'}</TableCell>
                      <TableCell className="text-[#666666] text-sm">{record.processing_time_ms ? `${record.processing_time_ms}ms` : 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-4">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1 || loading}
                  className="p-2 hover:bg-[#EFEFEF] rounded-md transition-colors disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4 text-[#666666]" />
                </button>
                <span className="text-sm text-[#666666]">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages || loading}
                  className="p-2 hover:bg-[#EFEFEF] rounded-md transition-colors disabled:opacity-50"
                >
                  <ChevronRight className="h-4 w-4 text-[#666666]" />
                </button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ExportHistory;
