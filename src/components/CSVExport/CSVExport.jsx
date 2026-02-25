import React, { useState } from 'react';
import { Download, Calendar, Info, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { adminApi } from '../../services/adminApi';
import { getErrorMessage } from '../../utils/retryUtils';
import attendanceActionQueue from '../../utils/attendanceActionQueue';
import { useNetworkStatus } from '../../utils/networkStatus';
import ExportHistory from '../ExportHistory/ExportHistory';

const CSVExport = () => {
  const { isOnline } = useNetworkStatus(React);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [cohort, setCohort] = useState('all');
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState(null);
  const [error, setError] = useState(null);
  const [queuedExport, setQueuedExport] = useState(null);

  const today = new Date().toISOString().split('T')[0];
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const cohortOptions = [
    { value: 'all', label: 'All Cohorts' },
    { value: 'March 2025 L2', label: 'March 2025 L2' },
    { value: 'June 2025 L2', label: 'June 2025 L2' },
    { value: 'September 2025', label: 'September 2025' }
  ];

  const handleExportToday = async () => {
    setStartDate(today);
    setEndDate(today);
    setCohort('all');
    await handleExport(today, today, 'all');
  };

  const handleExportWeek = async () => {
    setStartDate(oneWeekAgo);
    setEndDate(today);
    setCohort('all');
    await handleExport(oneWeekAgo, today, 'all');
  };

  const handleExportCustom = async () => {
    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      return;
    }
    await handleExport(startDate, endDate, cohort);
  };

  const handleExport = async (start, end, selectedCohort) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication token not found');
      return;
    }

    const exportParams = {
      startDate: start,
      endDate: end,
      cohort: selectedCohort === 'all' ? null : selectedCohort
    };

    if (!isOnline) {
      try {
        await attendanceActionQueue.queueCSVExport(exportParams, token);
        setQueuedExport({
          startDate: start,
          endDate: end,
          cohort: selectedCohort === 'all' ? 'All Cohorts' : selectedCohort,
          queuedAt: new Date()
        });
        setExportStatus({ type: 'info', message: 'Export queued for when you reconnect' });
        setTimeout(() => setExportStatus(null), 5000);
      } catch (err) {
        setError('Failed to queue export: ' + err.message);
      }
      return;
    }

    setIsExporting(true);
    setError(null);
    setExportStatus(null);

    try {
      const result = await adminApi.exportAttendanceCSV(start, end, selectedCohort);
      setExportStatus({
        type: 'success',
        message: `CSV exported successfully: ${result.filename}`,
        filename: result.filename
      });
    } catch (err) {
      console.error('Export error:', err);
      
      if (!isOnline || (err.name === 'TypeError' && err.message.includes('fetch'))) {
        try {
          await attendanceActionQueue.queueCSVExport(exportParams, token);
          setQueuedExport({
            startDate: start,
            endDate: end,
            cohort: selectedCohort === 'all' ? 'All Cohorts' : selectedCohort,
            queuedAt: new Date()
          });
          setExportStatus({ type: 'info', message: 'Export queued due to connection issue' });
          setTimeout(() => setExportStatus(null), 5000);
        } catch (queueErr) {
          setError('Failed to queue export: ' + queueErr.message);
        }
      } else {
        const userFriendlyMessage = getErrorMessage(err);
        setError(userFriendlyMessage);
        setExportStatus({ type: 'error', message: userFriendlyMessage });
      }
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white border-[#C8C8C8]">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Download className="h-6 w-6 text-[#4242EA]" />
            <div>
              <CardTitle className="text-xl text-[#1E1E1E]">Export Attendance Data</CardTitle>
              <CardDescription className="text-[#666666]">Export attendance records to CSV format for analysis and reporting</CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Quick Export */}
          <div>
            <h3 className="text-sm font-semibold text-[#1E1E1E] mb-3">Quick Export</h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleExportToday}
                disabled={isExporting}
                className="group relative overflow-hidden inline-flex items-center gap-2 px-6 py-2.5 bg-[#4242EA] border border-[#4242EA] rounded-full font-medium text-white transition-colors duration-300 disabled:opacity-50"
              >
                <Calendar className="h-4 w-4 relative z-10 transition-colors duration-300 group-hover:text-[#4242EA]" />
                <span className="relative z-10 transition-colors duration-300 group-hover:text-[#4242EA]">Export Today</span>
                <div className="absolute inset-0 bg-[#EFEFEF] -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
              </button>
              <button
                onClick={handleExportWeek}
                disabled={isExporting}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-white border-2 border-[#4242EA] rounded-full font-medium text-[#4242EA] hover:bg-[#4242EA]/5 transition-colors disabled:opacity-50"
              >
                <Calendar className="h-4 w-4" />
                Export This Week
              </button>
            </div>
          </div>

          <hr className="border-[#E3E3E3]" />

          {/* Custom Export */}
          <div>
            <h3 className="text-sm font-semibold text-[#1E1E1E] mb-4">Custom Export</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-[#1E1E1E] font-semibold">Start Date</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    disabled={isExporting}
                    className="mt-1 bg-white border-[#C8C8C8] focus:border-[#4242EA]"
                  />
                </div>
                <div>
                  <Label className="text-[#1E1E1E] font-semibold">Cohort Filter</Label>
                  <Select value={cohort} onValueChange={setCohort} disabled={isExporting}>
                    <SelectTrigger className="mt-1 bg-white border-[#C8C8C8]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {cohortOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label className="text-[#1E1E1E] font-semibold">End Date</Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    disabled={isExporting}
                    className="mt-1 bg-white border-[#C8C8C8] focus:border-[#4242EA]"
                  />
                </div>
                <div className="pt-6">
                  <button
                    onClick={handleExportCustom}
                    disabled={isExporting || !startDate || !endDate}
                    className="group relative overflow-hidden w-full inline-flex justify-center items-center gap-2 px-6 py-3 bg-[#4242EA] border border-[#4242EA] rounded-full font-medium text-white transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isExporting ? (
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full relative z-10"></div>
                    ) : (
                      <Download className="h-5 w-5 relative z-10 transition-colors duration-300 group-hover:text-[#4242EA]" />
                    )}
                    <span className="relative z-10 transition-colors duration-300 group-hover:text-[#4242EA]">
                      {isExporting ? 'Exporting...' : 'Export CSV'}
                    </span>
                    <div className="absolute inset-0 bg-[#EFEFEF] -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Export Status */}
          {exportStatus && (
            <div className={`flex items-center gap-3 p-4 rounded-lg ${
              exportStatus.type === 'success' ? 'bg-green-50 border border-green-200' :
              exportStatus.type === 'error' ? 'bg-red-50 border border-red-200' :
              'bg-blue-50 border border-blue-200'
            }`}>
              {exportStatus.type === 'success' && <CheckCircle className="h-5 w-5 text-green-600" />}
              {exportStatus.type === 'error' && <AlertTriangle className="h-5 w-5 text-red-600" />}
              {exportStatus.type === 'info' && <Info className="h-5 w-5 text-blue-600" />}
              <span className={`flex-1 ${
                exportStatus.type === 'success' ? 'text-green-700' :
                exportStatus.type === 'error' ? 'text-red-700' :
                'text-blue-700'
              }`}>{exportStatus.message}</span>
              {exportStatus.filename && (
                <Badge variant="outline" className="border-[#4242EA] text-[#4242EA]">{exportStatus.filename}</Badge>
              )}
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50 border border-red-200">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          {/* Export Information */}
          <div className="space-y-2 p-4 bg-[#F9F9F9] rounded-lg border border-[#E3E3E3]">
            <p className="text-sm text-[#666666]">
              <strong className="text-[#1E1E1E]">CSV Format:</strong> Date, Builder Name, Cohort, Check-in Time, Status, Late Minutes, Excuse Type, Excuse Details, Staff Notes, Attendance Notes
            </p>
            <p className="text-sm text-[#666666]">
              <strong className="text-[#1E1E1E]">Note:</strong> The export includes all builders in the selected cohort(s), including those who didn't check in (marked as "Absent").
            </p>
          </div>

          {/* Queued Export Indicator */}
          {queuedExport && (
            <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-50 border border-blue-200">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-blue-700">
                  <strong>Export Queued:</strong> {queuedExport.startDate} to {queuedExport.endDate}
                  {queuedExport.cohort !== 'All Cohorts' && ` (${queuedExport.cohort})`}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  This export will be processed when you reconnect to the internet.
                </p>
              </div>
              <Badge variant="outline" className="border-blue-400 text-blue-700">
                Queued at {queuedExport.queuedAt.toLocaleTimeString()}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Export History */}
      <ExportHistory />
    </div>
  );
};

export default CSVExport;
