import { useEffect, useRef } from 'react';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Send, Paperclip } from 'lucide-react';

const AutoExpandTextarea = ({ 
  value, 
  onChange, 
  onSubmit, 
  placeholder = "Reply to coach...", 
  disabled = false,
  showAssignmentButton = false,
  onAssignmentClick
}) => {
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = 'auto';
      
      // Calculate new height (min 2 rows, max 5 rows)
      const lineHeight = 26; // 18px font + 8px line spacing
      const minHeight = lineHeight * 2; // 2 rows minimum
      const maxHeight = lineHeight * 5; // 5 rows maximum
      
      const newHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight);
      textarea.style.height = `${newHeight}px`;
    }
  }, [value]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && onSubmit) {
        onSubmit();
      }
    }
  };

  const handleSubmit = () => {
    if (value.trim() && onSubmit) {
      onSubmit();
    }
  };

  return (
    <div className="bg-stardust shadow-lg rounded-t-[20px] p-4">
      <div className="flex flex-col gap-2">
        {/* Main input area */}
        <div className="bg-white rounded-md p-3 mb-2">
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            className="border-0 resize-none bg-transparent text-carbon-black placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 min-h-[26px] text-lg font-proxima leading-[26px] w-full"
            style={{ height: 'auto', minHeight: '26px' }}
          />
        </div>

        {/* Bottom row with buttons */}
        <div className="flex justify-between items-center">
          {/* Left side - Assignment button */}
          <div className="flex gap-2">
            {showAssignmentButton && (
              <Button
                onClick={onAssignmentClick}
                size="sm"
                className="bg-pursuit-purple hover:bg-pursuit-purple/90 text-stardust text-xs px-3 py-1 h-6 rounded-full"
              >
                Assignment
              </Button>
            )}
          </div>

          {/* Right side - LLM dropdown and send button */}
          <div className="flex items-center gap-2">
            {/* LLM Selector */}
            <div className="bg-bg-light rounded-md px-3 py-1.5 text-xs">
              <select className="bg-transparent border-0 text-carbon-black font-proxima text-xs focus:outline-none">
                <option>LLM Item</option>
                <option>Claude</option>
                <option>GPT-4</option>
              </select>
            </div>

            {/* Send button */}
            <Button
              onClick={handleSubmit}
              disabled={!value.trim() || disabled}
              size="sm"
              className="bg-pursuit-purple hover:bg-pursuit-purple/90 text-white p-2 h-8 w-8 rounded-md"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutoExpandTextarea;
