import React from 'react';
import { Button } from '../../../components/ui/button';

const ActionsBar = ({
  selectedUsers,
  assessmentGrades,
  loading,
  onSelectAll,
  onSendEmails,
  onLoadAllRecords,
  onExportData,
  onRefresh
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 p-4 bg-card border border-border rounded-lg">
      {/* Left side - Selection controls */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => onSelectAll(selectedUsers.size !== assessmentGrades.length)}
          size="sm"
        >
          {selectedUsers.size === assessmentGrades.length && assessmentGrades.length > 0 ? 'Deselect All' : 'Select All'}
        </Button>
        <span className="text-sm text-muted-foreground">
          {selectedUsers.size} user{selectedUsers.size !== 1 ? 's' : ''} selected
        </span>
      </div>

      {/* Right side - Action buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          className="bg-green-600 hover:bg-green-700 text-white"
          onClick={onSendEmails}
          disabled={selectedUsers.size === 0}
          size="sm"
        >
          Send Mass Email
        </Button>
        <Button
          onClick={onLoadAllRecords}
          disabled={loading}
          title="Load all assessment grades (may take a moment)"
          size="sm"
        >
          {loading ? 'Loading...' : 'Load All'}
        </Button>
        <Button
          variant="outline"
          onClick={() => onExportData('csv')}
          size="sm"
        >
          Export CSV
        </Button>
        <Button
          variant="outline"
          onClick={() => onExportData('json')}
          size="sm"
        >
          Export JSON
        </Button>
        <Button
          variant="outline"
          onClick={onRefresh}
          size="sm"
        >
          Refresh
        </Button>
      </div>
    </div>
  );
};

export default ActionsBar;
