import React, { useState } from 'react';
import { ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';

const toolIcons = {
  search_curriculum: '📚',
  get_builder_progress: '📊',
  check_attendance: '📅',
  search_resources: '🔍',
  get_llm_usage: '💰',
  get_performance_insights: '📈',
  search_pathfinder_data: '🎯',
  search_thread_history: '🔎'
};

const toolDescriptions = {
  search_curriculum: 'Searching curriculum...',
  get_builder_progress: 'Checking your progress...',
  check_attendance: 'Retrieving attendance...',
  search_resources: 'Finding resources...',
  get_llm_usage: 'Calculating token usage...',
  get_performance_insights: 'Analyzing performance...',
  search_pathfinder_data: 'Fetching career data...',
  search_thread_history: 'Searching past conversations...'
};

export default function ToolCall({ toolName, toolInput, result, isLoading = false }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const icon = toolIcons[toolName] || '⚙️';
  const description = toolDescriptions[toolName] || `Using ${toolName}...`;

  const formatValue = (val) => {
    if (typeof val === 'object') {
      return JSON.stringify(val, null, 2);
    }
    return String(val);
  };

  return (
    <div className="my-4 border-l-4 border-pursuit-purple bg-stardust rounded-r-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-100 transition-colors text-left"
      >
        <span className="text-lg">{icon}</span>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-carbon-black text-sm">{toolName}</div>
          <div className="text-xs text-gray-600">{description}</div>
        </div>
        <div className="flex-shrink-0">
          {isLoading ? (
            <RefreshCw className="w-4 h-4 animate-spin text-pursuit-purple" />
          ) : (
            <>
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-gray-600" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-600" />
              )}
            </>
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-gray-300 px-4 py-3 bg-white text-sm space-y-3">
          {/* Input Parameters */}
          {toolInput && Object.keys(toolInput).length > 0 && (
            <div>
              <div className="font-semibold text-carbon-black text-xs uppercase tracking-wide mb-2">
                Input
              </div>
              <div className="bg-gray-50 p-2 rounded font-mono text-xs overflow-x-auto">
                <pre className="text-gray-700">
                  {formatValue(toolInput)}
                </pre>
              </div>
            </div>
          )}

          {/* Results */}
          {result && (
            <div>
              <div className="font-semibold text-carbon-black text-xs uppercase tracking-wide mb-2">
                Result
                {result.success === false && (
                  <span className="text-red-600 ml-2">— Error</span>
                )}
              </div>
              {result.error ? (
                <div className="bg-red-50 border border-red-200 p-2 rounded text-red-700 text-xs">
                  {result.error}
                </div>
              ) : (
                <div className="bg-gray-50 p-2 rounded font-mono text-xs overflow-x-auto max-h-64 overflow-y-auto">
                  <pre className="text-gray-700">
                    {formatValue(result)}
                  </pre>
                </div>
              )}
            </div>
          )}

          {isLoading && (
            <div className="text-gray-600 text-xs italic">
              Executing tool...
            </div>
          )}
        </div>
      )}
    </div>
  );
}
