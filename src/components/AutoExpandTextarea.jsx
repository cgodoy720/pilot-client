import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import ArrowButton from './ArrowButton/ArrowButton';

// Available LLM models
const LLM_MODELS = [
  { value: 'anthropic/claude-sonnet-4.6', label: 'Claude Sonnet 4.6', description: 'Latest Claude model' },
  { value: 'anthropic/claude-sonnet-4.5', label: 'Claude Sonnet 4.5', description: 'Advanced reasoning' },
  { value: 'anthropic/claude-opus-4.6', label: 'Claude Opus 4.6', description: 'Most capable Claude' },
  { value: 'openai/gpt-5.2', label: 'GPT 5.2', description: 'Latest GPT model' },
  { value: 'google/gemini-3-flash-preview', label: 'Gemini 3 Flash Preview', description: 'Fast & efficient' },
  { value: 'x-ai/grok-4', label: 'Grok 4', description: 'Fast reasoning' },
  { value: 'moonshotai/kimi-k2.5', label: 'Kimi K2.5', description: 'Advanced model' },
  { value: 'minimax/minimax-m2.5', label: 'Minimax M2.5', description: 'Versatile model' },
  { value: 'deepseek/deepseek-v3.2', label: 'Deepseek V3.2', description: 'Code specialist' }
];

const AutoExpandTextarea = forwardRef(({ 
  onSubmit, 
  placeholder = "Reply to coach...", 
  disabled = false,
  showAssignmentButton = false,
  onAssignmentClick,
  assignmentButtonText = "Assignment",
  showInstructionsButton = false,
  onInstructionsClick,
  showPeerFeedbackButton = false,
  onPeerFeedbackClick,
  peerFeedbackButtonText = "Peer Feedback",
  showLlmDropdown = false,
  shouldFocus = false,
  onHeightChange
}, ref) => {
  const textareaRef = useRef(null);
  const containerRef = useRef(null);
  const [localModel, setLocalModel] = useState(LLM_MODELS[0].value);
  const [hasContent, setHasContent] = useState(false);

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
      
      // Notify parent of height change after textarea resizes
      if (containerRef.current && onHeightChange) {
        // Use requestAnimationFrame to ensure DOM has updated
        requestAnimationFrame(() => {
          const height = containerRef.current.getBoundingClientRect().height;
          onHeightChange(height + 24);
        });
      }
    }
  };

  // Handle input changes for auto-resize and content tracking
  const handleInput = () => {
    handleResize();
    const value = textareaRef.current?.value || '';
    setHasContent(value.trim().length > 0);
  };

  // Initial resize on mount
  useEffect(() => {
    handleResize();
  }, []);

  // Expose focus method to parent components
  useImperativeHandle(ref, () => ({
    focus: () => {
      if (textareaRef.current && !disabled) {
        textareaRef.current.focus();
      }
    }
  }));

  // Handle shouldFocus prop changes
  useEffect(() => {
    if (shouldFocus && !disabled && textareaRef.current) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [shouldFocus, disabled]);

  // Track container height and notify parent of changes
  useEffect(() => {
    if (!containerRef.current || !onHeightChange) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const height = entry.target.getBoundingClientRect().height;
        onHeightChange(height + 24);
      }
    });

    resizeObserver.observe(containerRef.current);

    // Initial height notification
    const initialHeight = containerRef.current.getBoundingClientRect().height;
    onHeightChange(initialHeight + 24);

    return () => {
      resizeObserver.disconnect();
    };
  }, [onHeightChange]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const message = textareaRef.current?.value || '';
      if (message.trim() && onSubmit) {
        onSubmit(message, localModel);
        textareaRef.current.value = '';
        setHasContent(false);
        handleResize(); // Reset height after clearing
      }
    }
  };

  const handleSubmit = () => {
    const message = textareaRef.current?.value || '';
    if (message.trim() && onSubmit) {
      onSubmit(message, localModel);
      textareaRef.current.value = '';
      setHasContent(false);
      handleResize(); // Reset height after clearing
    }
  };

  return (
    <div ref={containerRef} className="bg-stardust shadow-lg rounded-t-[20px] p-4">
      <div className="flex flex-col gap-2">
        {/* Main input area */}
        <div className="bg-white rounded-md p-3 mb-2">
          <Textarea
            ref={textareaRef}
            onInput={handleInput}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            className="border-0 resize-none bg-transparent text-carbon-black placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 min-h-[26px] text-[18px] md:text-[18px] placeholder:text-[18px] md:placeholder:text-[18px] font-proxima leading-[26px] w-full"
            style={{ height: 'auto', minHeight: '26px' }}
          />
        </div>

        {/* Bottom row with buttons */}
        <div className="flex justify-between items-center">
          {/* Left side - Assignment, Instructions, and Peer Feedback buttons */}
          <div className="flex gap-2">
            {showInstructionsButton && (
              <Button
                onClick={onInstructionsClick}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 h-6 rounded-full"
              >
                Instructions
              </Button>
            )}
            {showAssignmentButton && (
              <Button
                onClick={onAssignmentClick}
                size="sm"
                className="bg-pursuit-purple hover:bg-pursuit-purple/90 text-stardust text-xs px-3 py-1 h-6 rounded-full"
              >
                {assignmentButtonText}
              </Button>
            )}
            {showPeerFeedbackButton && (
              <Button
                onClick={onPeerFeedbackClick}
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1 h-6 rounded-full"
              >
                {peerFeedbackButtonText}
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

            {/* Send button - ArrowButton with left-to-right fill animation */}
            <ArrowButton
              onClick={handleSubmit}
              disabled={disabled || !hasContent}
              size="lg"
              rotation={-90}
              borderColor="#4242EA"
              backgroundColor="#4242EA"
              arrowColor="white"
              hoverBackgroundColor="#EFEFEF"
              hoverArrowColor="#4242EA"
              className="w-[30px] h-[30px] disabled:opacity-50"
              strokeWidth={1}
            />
          </div>
        </div>
      </div>
    </div>
  );
});

AutoExpandTextarea.displayName = 'AutoExpandTextarea';

export default AutoExpandTextarea;
