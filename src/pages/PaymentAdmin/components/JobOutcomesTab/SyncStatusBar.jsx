import React from 'react';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { RefreshCw, CheckCircle, AlertCircle, Clock } from 'lucide-react';

const relativeTime = (iso) => {
  if (!iso) return 'never';
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
};

const SyncStatusBar = ({ syncStatus, onRefresh, isRefreshing }) => {
  const status = syncStatus?.status;

  return (
    <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-3">
      <div className="flex items-center gap-3 text-sm">
        {status === 'success' && (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Last sync succeeded
          </Badge>
        )}
        {status === 'failed' && (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <AlertCircle className="h-3 w-3 mr-1" />
            Last sync failed
          </Badge>
        )}
        {status === 'running' && (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Clock className="h-3 w-3 mr-1" />
            Sync running
          </Badge>
        )}
        {!syncStatus && (
          <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
            No sync run yet
          </Badge>
        )}

        <span className="text-gray-500">
          Last synced: <span className="text-gray-900 font-medium">{relativeTime(syncStatus?.finished_at)}</span>
        </span>

        {syncStatus?.contacts_upserted != null && (
          <span className="text-gray-500">
            • {syncStatus.contacts_upserted} alumni, {syncStatus.affiliations_upserted} jobs
          </span>
        )}

        {syncStatus?.unmatched_emails > 0 && (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            {syncStatus.unmatched_emails} unmatched
          </Badge>
        )}
      </div>

      <Button
        onClick={onRefresh}
        disabled={isRefreshing || status === 'running'}
        variant="outline"
        size="sm"
      >
        <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
        {isRefreshing ? 'Syncing…' : 'Refresh from Salesforce'}
      </Button>
    </div>
  );
};

export default SyncStatusBar;
