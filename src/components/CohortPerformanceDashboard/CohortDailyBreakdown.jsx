import React from 'react';
import { Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

const CohortDailyBreakdown = ({ 
  dailyBreakdown, 
  cohort, 
  requirement, 
  onDayClick,
  loading = false 
}) => {
  if (loading) {
    return (
      <Card className="bg-white border border-slate-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-slate-600">Loading daily breakdown...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!dailyBreakdown || dailyBreakdown.length === 0) {
    return (
      <Card className="bg-white border border-slate-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Calendar className="h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No Data Available
            </h3>
            <p className="text-slate-600 max-w-md">
              No attendance data found for the selected timeframe. This may be because there are no curriculum days in this period.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      weekday: 'short'
    });
  };

  return (
    <Card className="bg-white border border-slate-200 shadow-sm">
      <CardContent className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-slate-900">
            Daily Attendance - {cohort}
          </h3>
          <p className="text-sm text-slate-600 mt-1">
            Click on any day to see individual builder status
          </p>
        </div>

        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="text-slate-900 font-semibold">Date</TableHead>
                <TableHead className="text-slate-900 font-semibold text-center">Day #</TableHead>
                <TableHead className="text-slate-900 font-semibold text-right">Present</TableHead>
                <TableHead className="text-slate-900 font-semibold text-right">Absent</TableHead>
                <TableHead className="text-slate-900 font-semibold text-right">Excused</TableHead>
                <TableHead className="text-slate-900 font-semibold text-right">Rate</TableHead>
                <TableHead className="text-slate-900 font-semibold text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dailyBreakdown.map((day, index) => {
                const isMeetingRequirement = day.attendanceRate >= requirement;
                const isLow = day.attendanceRate < requirement - 10;
                
                return (
                  <TableRow 
                    key={`${day.date}-${index}`}
                    className="border-b border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() => onDayClick(day)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <span className="font-medium text-slate-900">
                          {formatDate(day.date)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center text-slate-700">
                      {day.dayNumber}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                        {day.present + (day.late || 0)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="inline-flex items-center gap-1 text-red-600 font-semibold">
                        {day.absent}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="inline-flex items-center gap-1 text-blue-600 font-semibold">
                        {day.excused}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {isMeetingRequirement ? (
                          <TrendingUp className="h-3 w-3 text-emerald-500" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-red-500" />
                        )}
                        <span className={`font-semibold ${
                          isMeetingRequirement ? 'text-emerald-600' : 'text-red-600'
                        }`}>
                          {day.attendanceRate}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge 
                        className={
                          isMeetingRequirement 
                            ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                            : isLow
                            ? 'bg-red-100 text-red-700 border-red-200'
                            : 'bg-amber-100 text-amber-700 border-amber-200'
                        }
                      >
                        {isMeetingRequirement ? 'On Track' : isLow ? 'Critical' : 'Below'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
          <div className="flex items-center gap-4">
            <span>Total Days: <strong>{dailyBreakdown.length}</strong></span>
            <span className="text-slate-400">|</span>
            <span>
              Target: <strong className="text-slate-900">{requirement}%</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">
              Days meeting target: {dailyBreakdown.filter(d => d.attendanceRate >= requirement).length} / {dailyBreakdown.length}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CohortDailyBreakdown;

