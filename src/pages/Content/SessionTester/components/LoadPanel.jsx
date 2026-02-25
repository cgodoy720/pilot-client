import React, { useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Textarea } from '../../../../components/ui/textarea';
import { Upload, FileText, Play, Trash2 } from 'lucide-react';

const LoadPanel = ({ 
  jsonInput, 
  setJsonInput, 
  onLoad, 
  onClear, 
  error 
}) => {
  const fileInputRef = useRef(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/json') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target.result;
          setJsonInput(content);
        } catch (error) {
          console.error('Error reading file:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <Card className="border-[#C8C8C8]">
      <CardHeader>
        <CardTitle className="font-proxima-bold text-[#1E1E1E]">
          Load Session Data
        </CardTitle>
        <CardDescription className="font-proxima text-[#666]">
          Paste or upload JSON session data to preview
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* JSON Input */}
        <div className="space-y-2">
          <label className="text-sm font-proxima-bold text-[#1E1E1E]">
            Session JSON:
          </label>
          <Textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder="Paste your session JSON here..."
            rows={10}
            className="font-mono text-xs"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2 flex-wrap">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="border-[#C8C8C8] font-proxima"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload JSON
          </Button>
          <Button
            onClick={onLoad}
            className="bg-[#4242EA] hover:bg-[#3535D1] font-proxima"
          >
            <Play className="h-4 w-4 mr-2" />
            Load & Preview
          </Button>
          {jsonInput && (
            <Button
              onClick={onClear}
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50 font-proxima"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear
            </Button>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800 font-proxima">
            {error}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LoadPanel;
