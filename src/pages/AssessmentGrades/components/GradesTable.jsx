import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import { Checkbox } from '../../../components/ui/checkbox';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';

const GradesTable = ({
  assessmentGrades,
  selectedUsers,
  loading,
  pagination,
  onSelectAll,
  onUserSelection,
  onViewGrade,
  onLoadMore,
  onLoadAllRecords
}) => {
  if (loading && assessmentGrades.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-8">
        <div className="text-center text-muted-foreground text-lg">
          Loading assessment grades...
        </div>
      </div>
    );
  }

  if (assessmentGrades.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-8">
        <div className="text-center text-muted-foreground text-lg">
          No assessment grades found with current filters.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedUsers.size === assessmentGrades.length && assessmentGrades.length > 0}
                  onCheckedChange={(checked) => onSelectAll(!!checked)}
                  aria-label="Select all rows"
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Cohort</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Assessment Period</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assessmentGrades.map((grade, index) => (
              <TableRow key={`${grade.user_id}-${grade.level || 'NA'}-${grade.assessment_period || 'NA'}-${grade.cohort || 'NA'}-${index}`}>
                <TableCell>
                  <Checkbox
                    checked={selectedUsers.has(grade.user_id)}
                    onCheckedChange={(checked) => onUserSelection(grade.user_id, checked)}
                    aria-label={`Select ${grade.user_first_name} ${grade.user_last_name}`}
                  />
                </TableCell>
                <TableCell className="font-medium">
                  {grade.user_first_name} {grade.user_last_name}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {grade.user_email}
                </TableCell>
                <TableCell>{grade.cohort}</TableCell>
                <TableCell>
                  <Badge 
                    variant="outline" 
                    className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                  >
                    {grade.level || 'N/A'}
                  </Badge>
                </TableCell>
                <TableCell>{grade.assessment_period || 'N/A'}</TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    onClick={() => onViewGrade(grade)}
                  >
                    View Grade
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Load More Section */}
      {pagination.hasMore && (
        <div className="border-t border-border bg-muted/50 p-6">
          <div className="flex flex-col items-center gap-4">
            <div className="text-center text-sm text-muted-foreground">
              <p className="font-medium text-foreground">
                Showing {assessmentGrades.length} of {pagination.total} records
              </p>
              <p>{pagination.total - assessmentGrades.length} more records available</p>
            </div>
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={onLoadMore}
                disabled={loading}
                size="sm"
              >
                {loading ? 'Loading...' : `Load Next ${Math.min(pagination.limit, pagination.total - assessmentGrades.length)}`}
              </Button>
              <Button
                onClick={onLoadAllRecords}
                disabled={loading}
                size="sm"
              >
                {loading ? 'Loading...' : 'Load All Remaining'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GradesTable;
