import React, { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { ScrollArea } from '../../../components/ui/scroll-area';
import { RefreshCw } from 'lucide-react';
import LoadingState from './shared/LoadingState';

const StatusTab = ({ showNotification, reloadPrompts, canEdit }) => {
  const [currentPrompt, setCurrentPrompt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurrentPrompt();
  }, []);

  const fetchCurrentPrompt = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/prompts/current-system-prompt`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentPrompt(data);
      } else {
        throw new Error('Failed to fetch current system prompt');
      }
    } catch (error) {
      console.error('Error fetching current prompt:', error);
      showNotification('Failed to load current system prompt', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReload = async () => {
    await reloadPrompts();
    await fetchCurrentPrompt();
  };

  if (loading) {
    return <LoadingState count={2} />;
  }

  if (!currentPrompt) {
    return (
      <Alert variant="destructive" className="bg-red-50 border-red-200">
        <AlertDescription className="font-proxima text-red-800">
          Failed to load current system prompt. Please try refreshing the page.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start gap-4 flex-wrap">
        <div>
          <h2 className="font-proxima-bold text-2xl text-[#1E1E1E] mb-2">
            Current AI System Prompt
          </h2>
          <p className="font-proxima text-[#666]">
            This is the complete assembled prompt that gets sent to the AI API for a sample task.
          </p>
        </div>
        {canEdit && (
          <Button
            onClick={handleReload}
            variant="outline"
            className="border-[#C8C8C8] text-[#1E1E1E] hover:bg-[#E3E3E3]"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reload & Refresh
          </Button>
        )}
      </div>

      {/* Current Assembled Prompt */}
      <Card className="bg-white border-[#C8C8C8]">
        <CardHeader>
          <CardTitle className="font-proxima-bold text-[#1E1E1E]">
            Current Assembled System Prompt
          </CardTitle>
          <CardDescription className="font-proxima text-[#666]">
            Generated: {new Date(currentPrompt.assembled_at).toLocaleString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[60vh] w-full rounded-lg">
            <div className="bg-[#F5F5F5] border border-[#E3E3E3] rounded-lg p-4">
              <pre className="font-mono text-sm text-[#1E1E1E] whitespace-pre-wrap leading-relaxed">
                {currentPrompt.complete_system_prompt}
              </pre>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Sample Task */}
      <Card className="bg-white border-[#C8C8C8]">
        <CardHeader>
          <CardTitle className="font-proxima-bold text-[#1E1E1E]">
            Sample Task Used for Demo
          </CardTitle>
          <CardDescription className="font-proxima text-[#666]">
            This sample task shows how variables are replaced in the prompt.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-[#F5F5F5] border border-[#E3E3E3] rounded-lg p-4">
            <pre className="font-mono text-sm text-[#1E1E1E] whitespace-pre-wrap">
              {JSON.stringify(currentPrompt.components.sample_task, null, 2)}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatusTab;
