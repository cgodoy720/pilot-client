import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Checkbox } from '../../../../components/ui/checkbox';
import { Badge } from '../../../../components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../../../../components/ui/table';
import { Settings, Save, RefreshCw, AlertCircle } from 'lucide-react';

const SourceConfigManager = ({ token, sourceConfig, onUpdate }) => {
  const [localConfig, setLocalConfig] = useState([]);
  const [unconfiguredSources, setUnconfiguredSources] = useState([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLocalConfig(sourceConfig.map(c => ({ ...c })));
    setHasChanges(false);
  }, [sourceConfig]);

  const fetchUnconfiguredSources = useCallback(async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admissions/leads/source-config/unconfigured`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      if (response.ok) {
        const data = await response.json();
        setUnconfiguredSources(data.sources || []);
      }
    } catch (err) {
      console.error('Error fetching unconfigured sources:', err);
    }
  }, [token]);

  useEffect(() => {
    fetchUnconfiguredSources();
  }, [fetchUnconfiguredSources]);

  const toggleConfig = (configId) => {
    setLocalConfig(prev => 
      prev.map(c => 
        c.config_id === configId 
          ? { ...c, counts_as_info_session: !c.counts_as_info_session }
          : c
      )
    );
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admissions/leads/source-config`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            configs: localConfig.map(c => ({
              config_id: c.config_id,
              counts_as_info_session: c.counts_as_info_session
            }))
          })
        }
      );

      if (response.ok) {
        setHasChanges(false);
        onUpdate();
      }
    } catch (err) {
      console.error('Error saving config:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleAddUnconfigured = async (source) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admissions/leads/source-config`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            source_type: source.source_type,
            source_name: source.source_name,
            counts_as_info_session: false
          })
        }
      );

      if (response.ok) {
        onUpdate();
        fetchUnconfiguredSources();
      }
    } catch (err) {
      console.error('Error adding config:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRevert = () => {
    setLocalConfig(sourceConfig.map(c => ({ ...c })));
    setHasChanges(false);
  };

  // Group configs by source_type for better organization
  const groupedConfigs = localConfig.reduce((acc, config) => {
    const type = config.source_type || 'other';
    if (!acc[type]) acc[type] = [];
    acc[type].push(config);
    return acc;
  }, {});

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Attended Event Configuration
          </CardTitle>
          {hasChanges && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleRevert}>
                <RefreshCw className="h-4 w-4 mr-1" />
                Revert
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saving}>
                <Save className="h-4 w-4 mr-1" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </div>
        <p className="text-sm text-gray-500">
          Configure which lead sources count as having attended an info session. 
          When leads from these sources sign up as applicants, they'll be marked as having attended.
        </p>
      </CardHeader>
      <CardContent>
        {localConfig.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Settings className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p>No source configurations yet.</p>
            <p className="text-sm">Import leads to populate source types.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Counts</TableHead>
                <TableHead>Source Type</TableHead>
                <TableHead>Source Name</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(groupedConfigs).map(([type, configs]) => (
                configs.map((config, idx) => (
                  <TableRow key={config.config_id}>
                    <TableCell>
                      <Checkbox
                        checked={config.counts_as_info_session}
                        onCheckedChange={() => toggleConfig(config.config_id)}
                      />
                    </TableCell>
                    <TableCell>
                      {idx === 0 ? (
                        <Badge variant="outline" className="capitalize">
                          {type.replace('_', ' ')}
                        </Badge>
                      ) : null}
                    </TableCell>
                    <TableCell className="font-medium">
                      {config.source_name || <span className="text-gray-400 italic">Any</span>}
                    </TableCell>
                  </TableRow>
                ))
              ))}
            </TableBody>
          </Table>
        )}

        {/* Unconfigured Sources Alert */}
        {unconfiguredSources.length > 0 && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <span className="font-medium text-yellow-800">
                New Sources Detected
              </span>
            </div>
            <p className="text-sm text-yellow-700 mb-3">
              The following sources have leads but are not configured. Add them to manage whether they count as attended events.
            </p>
            <div className="flex flex-wrap gap-2">
              {unconfiguredSources.map((source, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddUnconfigured(source)}
                  disabled={loading}
                  className="bg-white"
                >
                  {source.source_type}: {source.source_name || 'Any'} ({source.count})
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SourceConfigManager;
