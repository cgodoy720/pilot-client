import { useEffect, useRef, useState } from 'react';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Send, Paperclip } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

// Available LLM models
const LLM_MODELS = [
  { value: 'anthropic/claude-sonnet-4.5', label: 'Claude Sonnet 4.5', description: 'Advanced reasoning' },
  { value: 'anthropic/claude-haiku-4.5', label: 'Claude Haiku 4.5', description: 'Fast & efficient' },
  { value: 'openai/gpt-4o-mini', label: 'GPT-4o Mini', description: 'Quick responses' },
  { value: 'google/gemini-2.0-flash-thinking-exp', label: 'Gemini Flash 2.0', description: 'Reasoning optimized' },
  { value: 'deepseek/deepseek-chat', label: 'DeepSeek Chat', description: 'Code specialist' },
  { value: 'x-ai/grok-4-fast', label: 'Grok 4 Fast', description: 'Fast reasoning' }
];

const AutoExpandTextarea = ({ 
  onSubmit, 
  placeholder = "Reply to coach...", 
  disabled = false,
  showAssignmentButton = false,
  onAssignmentClick,
  showLlmDropdown = false
}) => {
  const textareaRef = useRef(null);
  const [localModel, setLocalModel] = useState(LLM_MODELS[0].value);

  // Auto-resize textarea based on content
  const handleResize = () => {
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
  };

  // Handle input changes for auto-resize
  const handleInput = () => {
    handleResize();
  };

  // Initial resize on mount
  useEffect(() => {
    handleResize();
  }, []);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const message = textareaRef.current?.value || '';
      if (message.trim() && onSubmit) {
        onSubmit(message, localModel);
        textareaRef.current.value = '';
        handleResize(); // Reset height after clearing
      }
    }
  };

  const handleSubmit = () => {
    const message = textareaRef.current?.value || '';
    if (message.trim() && onSubmit) {
      onSubmit(message, localModel);
      textareaRef.current.value = '';
      handleResize(); // Reset height after clearing
    }
  };

  return (
    <div className="bg-stardust shadow-lg rounded-t-[20px] p-4">
      <div className="flex flex-col gap-2">
        {/* Main input area */}
        <div className="bg-white rounded-md p-3 mb-2">
          <Textarea
            ref={textareaRef}
            onInput={handleInput}
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
            {/* LLM Selector - Only show for conversation mode */}
            {showLlmDropdown && (
              <Select value={localModel} onValueChange={setLocalModel}>
                <SelectTrigger className="bg-bg-light border-0 rounded-md px-3 py-1.5 text-xs h-auto w-auto font-proxima focus:ring-0 focus:ring-offset-0">
                  <SelectValue>
                    {LLM_MODELS.find(model => model.value === localModel)?.label}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {LLM_MODELS.map(model => (
                    <SelectItem key={model.value} value={model.value} className="text-xs font-proxima">
                      <div className="flex flex-col">
                        <span>{model.label}</span>
                        <span className="text-xs text-gray-500">{model.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Send button */}
            <Button
              onClick={handleSubmit}
              disabled={disabled}
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
