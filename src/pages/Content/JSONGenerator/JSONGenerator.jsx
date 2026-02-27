import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileText, Link as LinkIcon, Play, Download, Copy, Check, Loader2 } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { toast } from 'sonner';

const JSONGenerator = ({ sharedData, updateSharedData }) => {
  const { token } = useAuth();
  const [inputMethod, setInputMethod] = useState(sharedData?.inputMethod || 'text');
  const [textInput, setTextInput] = useState(sharedData?.textInput || '');
  const [urlInput, setUrlInput] = useState(sharedData?.urlInput || '');
  const [fileInput, setFileInput] = useState(sharedData?.fileInput || null);
  const [generatedJSON, setGeneratedJSON] = useState(sharedData?.generatedJSON || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef(null);

  // Sync local state with shared state
  useEffect(() => {
    if (sharedData) {
      setInputMethod(sharedData.inputMethod || 'text');
      setTextInput(sharedData.textInput || '');
      setUrlInput(sharedData.urlInput || '');
      setFileInput(sharedData.fileInput || null);
      setGeneratedJSON(sharedData.generatedJSON || '');
    }
  }, [sharedData]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileInput(file);
      setError('');
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        setTextInput(content);
        updateSharedData?.({
          fileInput: file,
          textInput: content
        });
      };
      reader.readAsText(file);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError('');
    
    try {
      let content = '';
      
      switch (inputMethod) {
        case 'text':
          content = textInput.trim();
          if (!content) throw new Error('Please enter some content');
          break;
        case 'url':
          if (!urlInput.trim()) throw new Error('Please enter a URL');
          content = await fetchContentFromUrl(urlInput);
          break;
        case 'file':
          if (!fileInput) throw new Error('Please select a file');
          content = textInput;
          break;
        default:
          throw new Error('Invalid input method');
      }
      
      if (!content) {
        throw new Error('No content provided for generation');
      }
      
      sessionStorage.setItem('originalContent', content);
      
      const generatedData = await generateJSONFromContent(content);
      const jsonString = JSON.stringify(generatedData, null, 2);
      setGeneratedJSON(jsonString);
      
      updateSharedData?.({
        originalContent: content,
        generatedJSON: jsonString
      });
      
      toast.success('JSON generated successfully!');
      
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const fetchContentFromUrl = async (url) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/content/generate-json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          contentType: 'url',
          url: url,
          cohort: 'Generated Cohort',
          weekNumber: 1,
          dayNumber: 1,
          date: new Date().toISOString().split('T')[0]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch content from URL');
      }

      const result = await response.json();
      return result.generatedContent;
    } catch (error) {
      console.error('Error fetching content from URL:', error);
      throw error;
    }
  };

  const generateJSONFromContent = async (content) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/content/generate-json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          contentType: inputMethod === 'file' ? 'file' : 'text',
          content: content,
          cohort: 'Generated Cohort',
          weekNumber: 1,
          dayNumber: 1,
          date: new Date().toISOString().split('T')[0]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate JSON from content');
      }

      const result = await response.json();
      return result.generatedContent;
    } catch (error) {
      console.error('Error generating JSON from content:', error);
      throw error;
    }
  };

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(generatedJSON);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJSON = () => {
    const blob = new Blob([generatedJSON], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'session-data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Downloaded successfully!');
  };

  const handleUseInTester = () => {
    try {
      const parsedData = JSON.parse(generatedJSON);
      
      if (Array.isArray(parsedData)) {
        sessionStorage.setItem('generatedSessionData', generatedJSON);
        toast.success(`Multi-day content detected! Testing all ${parsedData.length} days.`);
        window.dispatchEvent(new CustomEvent('switchToSessionTester', { 
          detail: { generatedJSON } 
        }));
      } else {
        sessionStorage.setItem('generatedSessionData', generatedJSON);
        toast.success('Ready to test in Session Tester!');
        window.dispatchEvent(new CustomEvent('switchToSessionTester', { 
          detail: { generatedJSON } 
        }));
      }
    } catch (error) {
      toast.error('Error parsing generated JSON. Please check the output format.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card className="border-[#C8C8C8]">
        <CardHeader>
          <CardTitle className="font-proxima-bold text-[#1E1E1E]">
            Content Input
          </CardTitle>
          <CardDescription className="font-proxima text-[#666]">
            Provide your curriculum content through one of the methods below
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Input Method Selector */}
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={inputMethod === 'text' ? 'default' : 'outline'}
              onClick={() => setInputMethod('text')}
              className={inputMethod === 'text' 
                ? 'bg-[#4242EA] hover:bg-[#3535D1] text-white font-proxima' 
                : 'border-[#C8C8C8] text-[#666] hover:border-[#4242EA] hover:text-[#4242EA] font-proxima'
              }
            >
              <FileText className="h-4 w-4 mr-2" />
              Text Input
            </Button>
            <Button
              variant={inputMethod === 'url' ? 'default' : 'outline'}
              onClick={() => setInputMethod('url')}
              className={inputMethod === 'url' 
                ? 'bg-[#4242EA] hover:bg-[#3535D1] text-white font-proxima' 
                : 'border-[#C8C8C8] text-[#666] hover:border-[#4242EA] hover:text-[#4242EA] font-proxima'
              }
            >
              <LinkIcon className="h-4 w-4 mr-2" />
              Google Doc URL
            </Button>
            <Button
              variant={inputMethod === 'file' ? 'default' : 'outline'}
              onClick={() => setInputMethod('file')}
              className={inputMethod === 'file' 
                ? 'bg-[#4242EA] hover:bg-[#3535D1] text-white font-proxima' 
                : 'border-[#C8C8C8] text-[#666] hover:border-[#4242EA] hover:text-[#4242EA] font-proxima'
              }
            >
              <Upload className="h-4 w-4 mr-2" />
              File Upload
            </Button>
          </div>

          {/* Input Forms */}
          {inputMethod === 'text' && (
            <div className="space-y-2">
              <label className="text-sm font-proxima-bold text-[#1E1E1E]">
                Paste your curriculum content here:
              </label>
              <Textarea
                value={textInput}
                onChange={(e) => {
                  setTextInput(e.target.value);
                  updateSharedData?.({ textInput: e.target.value });
                }}
                placeholder="Enter your curriculum content, learning objectives, activities, etc..."
                rows={12}
                className="font-proxima"
              />
            </div>
          )}

          {inputMethod === 'url' && (
            <div className="space-y-2">
              <label className="text-sm font-proxima-bold text-[#1E1E1E]">
                Google Doc URL (make sure it's publicly accessible):
              </label>
              <Input
                type="url"
                value={urlInput}
                onChange={(e) => {
                  setUrlInput(e.target.value);
                  updateSharedData?.({ urlInput: e.target.value });
                }}
                placeholder="https://docs.google.com/document/d/..."
                className="font-proxima"
              />
              <p className="text-xs text-[#666] font-proxima">
                Tip: Make sure your Google Doc is shared with "Anyone with the link can view"
              </p>
            </div>
          )}

          {inputMethod === 'file' && (
            <div className="space-y-2">
              <label className="text-sm font-proxima-bold text-[#1E1E1E]">
                Upload a content file (.txt, .md, .docx):
              </label>
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.md,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="border-[#C8C8C8] font-proxima"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {fileInput ? fileInput.name : 'Choose File'}
                </Button>
              </div>
            </div>
          )}

          {/* Generate Button */}
          <div className="flex gap-2">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="bg-[#4242EA] hover:bg-[#3535D1] font-proxima"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Generate JSON
                </>
              )}
            </Button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800 font-proxima">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Output Section */}
      {generatedJSON && (
        <Card className="border-[#C8C8C8]">
          <CardHeader>
            <CardTitle className="font-proxima-bold text-[#1E1E1E]">
              Generated Session Data
            </CardTitle>
            <CardDescription className="font-proxima text-[#666]">
              JSON structure ready for testing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Multi-day indicator */}
            {(() => {
              try {
                const parsedData = JSON.parse(generatedJSON);
                if (Array.isArray(parsedData)) {
                  return (
                    <div className="bg-[#4242EA] bg-opacity-10 border border-[#4242EA] rounded-lg p-3">
                      <p className="text-sm font-proxima-bold text-[#1E1E1E]">
                        Multi-Day Content Generated: {parsedData.length} days of curriculum
                      </p>
                    </div>
                  );
                }
              } catch {}
              return null;
            })()}

            {/* Actions */}
            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={handleCopyJSON}
                variant="outline"
                className="border-[#C8C8C8] font-proxima"
              >
                {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                {copied ? 'Copied!' : 'Copy'}
              </Button>
              <Button
                onClick={handleDownloadJSON}
                variant="outline"
                className="border-[#C8C8C8] font-proxima"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button
                onClick={handleUseInTester}
                className="bg-[#4242EA] hover:bg-[#3535D1] font-proxima"
              >
                <Play className="h-4 w-4 mr-2" />
                Test in Session Tester
              </Button>
            </div>
            
            {/* JSON Display */}
            <div className="bg-[#F5F5F5] border border-[#E3E3E3] rounded-lg p-4 max-h-[500px] overflow-auto">
              <pre className="font-mono text-xs text-[#1E1E1E] whitespace-pre-wrap">
                {generatedJSON}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!generatedJSON && !isGenerating && (
        <Card className="border-[#C8C8C8]">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-[#F5F5F5] p-4 mb-4">
              <FileText className="h-8 w-8 text-[#666]" />
            </div>
            <p className="font-proxima text-[#666]">Your generated JSON will appear here</p>
            <p className="text-sm font-proxima text-[#999] mt-2">
              Enter content above and click "Generate JSON" to get started
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default JSONGenerator;
