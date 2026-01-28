import { useRef, useEffect } from 'react';

const FormQuestion = ({ question, value, onChange, slideDirection, onEnter }) => {
  const textareaRef = useRef(null);

  // Auto-resize textarea for long_text
  useEffect(() => {
    if (question.type === 'long_text' && textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [value, question.type]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && value && onEnter) {
      onEnter();
    }
  };

  const renderInput = () => {
    switch (question.type) {
      case 'text':
        return (
          <input
            type="text"
            className="w-full px-0 py-2 border-0 border-b-2 border-white/60 bg-transparent text-white text-lg placeholder:text-white/40 focus:border-white focus:ring-0 focus:outline-none rounded-none box-border transition-all focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your answer here..."
            maxLength={question.validation?.max_length}
            autoFocus
          />
        );

      case 'long_text':
        return (
          <textarea
            ref={textareaRef}
            className="w-full px-0 py-2 border-0 border-b-2 border-white/60 bg-transparent text-white text-lg placeholder:text-white/40 focus:border-white focus:ring-0 focus:outline-none rounded-none resize-none box-border transition-all focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 overflow-hidden"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Type your detailed answer here..."
            rows={1}
            maxLength={question.validation?.max_length}
            autoFocus
          />
        );

      case 'multiple_choice':
        if (question.multiple_select) {
          const selectedValues = value || [];
          return (
            <div className="flex flex-col gap-3 mb-16 w-full max-w-2xl">
              {question.options.map((option, index) => {
                const isSelected = selectedValues.includes(option);
                return (
                  <div 
                    key={index}
                    onClick={() => {
                      if (isSelected) {
                        onChange(selectedValues.filter(v => v !== option));
                      } else {
                        onChange([...selectedValues, option]);
                      }
                    }}
                    className={`group relative w-full min-h-[56px] border rounded-[12px] shadow-[4px_4px_40px_rgba(0,0,0,0.05)] flex items-center justify-between px-5 py-4 cursor-pointer transition-colors duration-200 overflow-hidden ${
                      isSelected 
                        ? 'border-white bg-white' 
                        : 'border-white/30 bg-transparent hover:border-white'
                    }`}
                  >
                    {/* Hover fill animation - only show when not selected */}
                    <div className={`absolute inset-0 bg-white transition-transform duration-300 ${
                      isSelected ? 'translate-x-0' : '-translate-x-full group-hover:translate-x-0'
                    }`} />
                    
                    <p className={`relative z-10 text-base leading-snug text-left flex-1 transition-colors duration-200 ${
                      isSelected 
                        ? 'text-[#4E4DED]' 
                        : 'text-white group-hover:text-[#4E4DED]'
                    }`}>
                      {option}
                    </p>
                    {isSelected && (
                      <div className="relative z-10 w-5 h-5 rounded-full bg-[#4E4DED] flex items-center justify-center flex-shrink-0 ml-4">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        } else {
          return (
            <div className="flex flex-col gap-3 mb-16 w-full max-w-2xl">
              {question.options.map((option, index) => {
                const isSelected = value === option;
                return (
                  <div 
                    key={index}
                    onClick={() => onChange(option)}
                    className={`group relative w-full min-h-[56px] border rounded-[12px] shadow-[4px_4px_40px_rgba(0,0,0,0.05)] flex items-center justify-between px-5 py-4 cursor-pointer transition-colors duration-200 overflow-hidden ${
                      isSelected 
                        ? 'border-white bg-white' 
                        : 'border-white/30 bg-transparent hover:border-white'
                    }`}
                  >
                    {/* Hover fill animation - only show when not selected */}
                    <div className={`absolute inset-0 bg-white transition-transform duration-300 ${
                      isSelected ? 'translate-x-0' : '-translate-x-full group-hover:translate-x-0'
                    }`} />
                    
                    <p className={`relative z-10 text-base leading-snug text-left flex-1 transition-colors duration-200 ${
                      isSelected 
                        ? 'text-[#4E4DED]' 
                        : 'text-white group-hover:text-[#4E4DED]'
                    }`}>
                      {option}
                    </p>
                    {isSelected && (
                      <div className="relative z-10 w-5 h-5 rounded-full bg-[#4E4DED] flex items-center justify-center flex-shrink-0 ml-4">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        }

      case 'scale':
        const min = question.scale_config?.min || 1;
        const max = question.scale_config?.max || 5;
        const range = Array.from({ length: max - min + 1 }, (_, i) => min + i);
        
        return (
          <div className="flex flex-col gap-8 mb-16">
            <div className="flex gap-4 justify-start flex-wrap">
              {range.map((num) => (
                <button
                  key={num}
                  className={`group relative w-16 h-16 rounded-[20px] border transition-all duration-300 flex items-center justify-center shadow-[4px_4px_40px_rgba(0,0,0,0.05)] overflow-hidden ${
                    value === num
                      ? 'border-white bg-white' 
                      : 'border-white/30 bg-transparent hover:border-white'
                  }`}
                  onClick={() => onChange(num)}
                  type="button"
                >
                  {/* Hover fill animation */}
                  {value !== num && (
                    <div className="absolute inset-0 bg-white -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
                  )}
                  
                  <span className={`relative z-10 text-xl font-semibold transition-colors duration-300 ${
                    value === num
                      ? 'text-[#4E4DED]'
                      : 'text-white group-hover:text-[#4E4DED]'
                  }`}>
                  {num}
                  </span>
                </button>
              ))}
            </div>
            {(question.scale_config?.min_label || question.scale_config?.max_label) && (
              <div className="flex justify-between">
                <div className="text-sm text-white/70">
                  {question.scale_config?.min_label || ''}
                </div>
                <div className="text-sm text-white/70">
                  {question.scale_config?.max_label || ''}
                </div>
              </div>
            )}
          </div>
        );

      case 'true_false':
        return (
          <div className="flex flex-col md:flex-row gap-6 mb-16 justify-center items-center">
            <div 
              onClick={() => onChange(true)}
              className={`group relative w-full md:w-[160px] min-h-[80px] border rounded-[20px] shadow-[4px_4px_40px_rgba(0,0,0,0.05)] flex flex-col items-center justify-center p-4 gap-3 cursor-pointer transition-all overflow-hidden ${
                value === true 
                  ? 'border-white bg-white' 
                  : 'border-white/30 bg-transparent hover:border-white'
              }`}
            >
              {/* Hover fill animation */}
              {value !== true && (
                <div className="absolute inset-0 bg-white -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
              )}
              
              <p className={`relative z-10 text-sm md:text-base leading-tight text-center transition-colors duration-300 ${
                value === true 
                  ? 'text-[#4E4DED]' 
                  : 'text-white group-hover:text-[#4E4DED]'
              }`}>
                {question.true_label || 'True'}
              </p>
              {value === true && (
                <div className="relative z-10 w-6 h-6 rounded-full bg-[#4E4DED] flex items-center justify-center">
                  <span className="text-white text-sm font-bold">✓</span>
                </div>
              )}
            </div>
            <div 
              onClick={() => onChange(false)}
              className={`group relative w-full md:w-[160px] min-h-[80px] border rounded-[20px] shadow-[4px_4px_40px_rgba(0,0,0,0.05)] flex flex-col items-center justify-center p-4 gap-3 cursor-pointer transition-all overflow-hidden ${
                value === false 
                  ? 'border-white bg-white' 
                  : 'border-white/30 bg-transparent hover:border-white'
              }`}
            >
              {/* Hover fill animation */}
              {value !== false && (
                <div className="absolute inset-0 bg-white -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
              )}
              
              <p className={`relative z-10 text-sm md:text-base leading-tight text-center transition-colors duration-300 ${
                value === false 
                  ? 'text-[#4E4DED]' 
                  : 'text-white group-hover:text-[#4E4DED]'
              }`}>
                {question.false_label || 'False'}
              </p>
              {value === false && (
                <div className="relative z-10 w-6 h-6 rounded-full bg-[#4E4DED] flex items-center justify-center">
                  <span className="text-white text-sm font-bold">✓</span>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return <div className="text-white">Unsupported question type</div>;
    }
  };

  return (
    <div className="flex flex-col text-left">
      <h2 className="text-white text-2xl md:text-3xl font-bold mb-8">
        {question.text}
        {question.required && <span className="text-[#FFFFCC] ml-1">*</span>}
      </h2>
      {question.help_text && (
        <p className="text-white/70 text-sm md:text-base leading-tight mb-6">
          {question.help_text}
        </p>
      )}
      
      <div className="flex flex-col">
        {renderInput()}
      </div>

      {question.validation?.max_length && (question.type === 'text' || question.type === 'long_text') && (
        <div className="text-right text-sm text-white/50 mt-2">
          {(value || '').length} / {question.validation.max_length}
        </div>
      )}
    </div>
  );
};

export default FormQuestion;
