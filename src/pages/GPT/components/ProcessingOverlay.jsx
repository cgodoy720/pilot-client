import React from 'react';
import { Loader2 } from 'lucide-react';

function ProcessingOverlay({ 
  isProcessing, 
  processingStep, 
  processingFileName, 
  processingUrl 
}) {
  if (!isProcessing) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white border border-divider rounded-[12px] p-8 max-w-md w-[90%] shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
        {/* Spinner */}
        <div className="flex justify-center mb-6">
          <Loader2 className="w-10 h-10 text-pursuit-purple animate-spin" />
        </div>

        {/* Text */}
        <div className="text-center">
          <h4 className="text-carbon-black font-proxima text-xl font-semibold mb-2">
            Processing Content
          </h4>
          <p className="text-pursuit-purple font-proxima text-base font-medium mb-3">
            {processingStep}
          </p>
          {processingFileName && (
            <p className="text-gray-600 font-proxima text-sm bg-pursuit-purple/10 px-3 py-2 rounded border-l-3 border-pursuit-purple">
              File: {processingFileName}
            </p>
          )}
          {processingUrl && (
            <p className="text-gray-600 font-proxima text-sm bg-green-50 px-3 py-2 rounded border-l-3 border-green-500 break-all">
              URL: {processingUrl}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProcessingOverlay;

