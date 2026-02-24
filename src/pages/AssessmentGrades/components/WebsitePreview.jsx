import React from 'react';
import { Button } from '../../../components/ui/button';

const WebsitePreview = ({
  submissionData,
  previewMode,
  setPreviewMode,
  showCode,
  setShowCode,
  websitePreview,
  setWebsitePreview,
  createWebsitePreview
}) => {
  if (!submissionData.files || submissionData.files.length === 0) {
    return null;
  }

  const handleRefresh = () => {
    if (submissionData.files) {
      const newPreview = createWebsitePreview(submissionData.files);
      setWebsitePreview(newPreview);
      console.log('🔄 Website preview refreshed');
    }
  };

  const handleCopyHTML = () => {
    if (submissionData.files) {
      const generatedHTML = createWebsitePreview(submissionData.files);
      navigator.clipboard.writeText(generatedHTML).then(() => {
        console.log('✅ Full HTML copied to clipboard');
        alert('Full HTML copied to clipboard! You can paste it into a text editor to inspect.');
      }).catch(err => {
        console.error('❌ Failed to copy HTML:', err);
        // Fallback: create a downloadable file
        const blob = new Blob([generatedHTML], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'generated-website.html';
        a.click();
        URL.revokeObjectURL(url);
        console.log('✅ HTML downloaded as file');
      });
    }
  };

  const handleDebug = () => {
    console.log('=== WEBSITE PREVIEW DEBUG ===');
    console.log('Current websitePreview state:', websitePreview);
    console.log('Files available:', submissionData.files);
    
    if (submissionData.files && Array.isArray(submissionData.files)) {
      const htmlFiles = submissionData.files.filter(f => f && f.name && f.name.toLowerCase().endsWith('.html'));
      const cssFiles = submissionData.files.filter(f => f && f.name && f.name.toLowerCase().endsWith('.css'));
      const jsFiles = submissionData.files.filter(f => f && f.name && f.name.toLowerCase().endsWith('.js'));
      
      console.log('File breakdown:', {
        html: htmlFiles.map(f => ({ 
          name: f.name, 
          hasContent: !!f.content, 
          contentLength: f.content?.length,
          endsWithTag: f.content?.endsWith('>'),
          lastChars: f.content?.substring(f.content.length - 30)
        })),
        css: cssFiles.map(f => ({ 
          name: f.name, 
          hasContent: !!f.content, 
          contentLength: f.content?.length,
          endsWithBrace: f.content?.endsWith('}'),
          lastChars: f.content?.substring(f.content.length - 30)
        })),
        js: jsFiles.map(f => ({ 
          name: f.name, 
          hasContent: !!f.content, 
          contentLength: f.content?.length,
          lastChars: f.content?.substring(f.content.length - 30)
        }))
      });
    }
    
    const generatedHTML = createWebsitePreview(submissionData.files);
    console.log('Generated HTML length:', generatedHTML.length);
    console.log('=== END DEBUG ===');
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Preview Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-muted/50 border-b border-border">
        <div className="flex gap-2">
          <Button
            variant={previewMode === 'desktop' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPreviewMode('desktop')}
          >
            🖥️ Desktop
          </Button>
          <Button
            variant={previewMode === 'mobile' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPreviewMode('mobile')}
          >
            📱 Mobile
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCode(!showCode)}
          >
            {showCode ? '🙈 Hide Code' : '👀 Show Code'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="text-green-600 border-green-200 hover:bg-green-50"
          >
            🔄 Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyHTML}
            className="text-blue-600 border-blue-200 hover:bg-blue-50"
          >
            📋 Copy HTML
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDebug}
            className="text-orange-600 border-orange-200 hover:bg-orange-50"
          >
            🐛 Debug
          </Button>
        </div>
      </div>

      {/* Website Preview Iframe */}
      <div className="relative bg-white flex justify-center p-8 min-h-[400px]">
        <iframe
          key={`preview-${(websitePreview || '').length}`}
          srcDoc={websitePreview || createWebsitePreview(submissionData.files)}
          className={`border border-gray-300 rounded-lg shadow-lg bg-white transition-all duration-300 ${
            previewMode === 'desktop' 
              ? 'w-full max-w-6xl h-[600px]' 
              : 'w-[375px] h-[667px] rounded-[20px] shadow-xl'
          }`}
          sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups allow-presentation"
          title="Student Website Preview"
          onLoad={() => console.log('Website preview loaded')}
          onError={(e) => console.error('Iframe error:', e)}
        />
      </div>
    </div>
  );
};

export default WebsitePreview;
