import React from 'react';
import { Card, CardContent } from '../../../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../../components/ui/table';
import { Badge } from '../../../../components/ui/badge';

const formatCurrency = (n) => {
  if (n == null) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
};

const EmployersTable = ({ employers }) => {
  const rows = employers || [];

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-sm text-gray-500 mb-3">
          {rows.length} {rows.length === 1 ? 'employer' : 'employers'}
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employer</TableHead>
                <TableHead className="text-right">Alumni Placed</TableHead>
                <TableHead className="text-right">Avg Salary</TableHead>
                <TableHead>Repeat Hirer</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-gray-500 py-12">
                    No employer data yet.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((e) => (
                  <TableRow key={e.employer_name}>
                    <TableCell className="font-medium">{e.employer_name}</TableCell>
                    <TableCell className="text-right tabular-nums">{e.alumni_count}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatCurrency(e.avg_salary)}</TableCell>
                    <TableCell>
                      {e.alumni_count > 1 && (
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                          Repeat
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmployersTable;
