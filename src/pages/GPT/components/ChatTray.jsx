import React, { useState, useRef, useEffect } from 'react';
import { Plus, Upload, ArrowUp, Settings } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Textarea } from '../../../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import { cn } from '../../../lib/utils';

function ChatTray({
  newMessage,
  setNewMessage,
  onSend,
  onFileUpload,
  onUrlInput,
  selectedModel,
  setSelectedModel,
  isSending,
  isLoading,
  isProcessingUpload,
  disabled,
  fileInputRef
}) {
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [newMessage]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending || disabled) return;
    onSend(e);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div 
        className="flex flex-col justify-between items-center gap-[10px] p-[15px_10px] bg-stardust shadow-[4px_4px_10px_rgba(0,0,0,0.15)] rounded-[20px]"
      >
        {/* Input Field */}
        <div className="w-full">
          <div className="flex flex-col gap-2 w-full">
            {/* Text Input */}
            <div className="w-full bg-white rounded-[5px] px-[11px] py-[4px]">
              <Textarea
                ref={textareaRef}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Reply to coach...."
                disabled={disabled || isSending || isLoading}
                className={cn(
                  'w-full text-[18px] leading-[26px] font-proxima font-normal text-carbon-black placeholder:text-divider resize-none border-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0 min-h-[26px] max-h-[150px] bg-transparent',
                  (disabled || isSending) && 'opacity-60 cursor-not-allowed'
                )}
                rows={1}
              />
            </div>

            {/* Controls Row */}
            <div className="flex items-center justify-between w-full">
              {/* Left side - placeholder */}
              <div className="flex gap-[5px]">
                {/* Future: Assignment button or other controls */}
              </div>

              {/* Right side - LLM, Upload, Send */}
              <div className="flex items-center gap-[6px]">
                {/* LLM Selector */}
                <Select 
                  value={selectedModel} 
                  onValueChange={setSelectedModel}
                  disabled={disabled || isLoading}
                >
                  <SelectTrigger className="w-[140px] h-[30px] bg-bg-light rounded-[5px] border-none text-[12px] font-proxima text-carbon-black">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="anthropic/claude-sonnet-4.5">Auto</SelectItem>
                    <SelectItem value="anthropic/claude-3.7-sonnet">Claude 3.7</SelectItem>
                    <SelectItem value="anthropic/claude-3.5-sonnet">Claude 3.5</SelectItem>
                    <SelectItem value="openai/gpt-4o">ChatGPT 4o</SelectItem>
                  </SelectContent>
                </Select>

                {/* Upload Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      className="w-[30px] h-[30px] bg-bg-light hover:bg-gray-200 rounded-[5px] p-0"
                      disabled={disabled || isProcessingUpload || isLoading}
                    >
                      <div className="relative w-[14px] h-[14px]">
                        <Plus className="w-[14px] h-[14px] text-carbon-black" />
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isProcessingUpload}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload File
                      <span className="text-xs text-gray-500 ml-2">PDF, TXT, MD, DOCX</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={onUrlInput}
                      disabled={isProcessingUpload}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Add URL
                      <span className="text-xs text-gray-500 ml-2">Articles, Videos</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Send Button */}
                <Button
                  onClick={handleSubmit}
                  disabled={!newMessage.trim() || isSending || disabled || isLoading}
                  className="w-[30px] h-[30px] bg-pursuit-purple hover:bg-pursuit-purple/90 rounded-[5px] p-0"
                >
                  <ArrowUp className="w-[14px] h-[14px] text-bg-light" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatTray;

