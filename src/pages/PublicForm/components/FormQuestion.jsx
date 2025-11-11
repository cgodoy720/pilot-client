const FormQuestion = ({ question, value, onChange, slideDirection, onEnter }) => {

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && value && onEnter) {
      onEnter();
    }
  };

  const renderInput = () => {
    switch (question.type) {
      case 'text':
        return (
          <textarea
            className="w-full px-0 py-2 border-0 border-b-2 border-white/60 bg-transparent text-white text-lg placeholder:text-white/40 focus:border-white focus:ring-0 focus:outline-none rounded-none resize-vertical min-h-[80px] box-border transition-all focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your answer here..."
            rows={3}
            maxLength={question.validation?.max_length}
            autoFocus
          />
        );

      case 'email':
        return (
          <input
            type="email"
            className="w-full px-0 py-2 border-0 border-b-2 border-white/60 bg-transparent text-white text-lg placeholder:text-white/40 focus:border-white focus:ring-0 focus:outline-none rounded-none box-border transition-all focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your answer here..."
            autoFocus
          />
        );

      case 'multiple_choice':
        if (question.multiple_select) {
          const selectedValues = value || [];
          return (
            <div className="flex flex-col md:flex-row gap-6 mb-16">
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
                    className={`w-full md:w-[210px] min-h-[200px] border rounded-[20px] shadow-[4px_4px_40px_rgba(0,0,0,0.05)] flex flex-col items-center justify-center p-6 gap-4 cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-white bg-white/10' 
                        : 'border-white/30 bg-transparent hover:bg-white/5'
                    }`}
                  >
                    <p className="text-white text-sm md:text-base leading-tight text-center">
                      {option}
                    </p>
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                        <span className="text-[#4E4DED] text-sm font-bold">✓</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        } else {
          return (
            <div className="flex flex-col md:flex-row gap-6 mb-16">
              {question.options.map((option, index) => {
                const isSelected = value === option;
                return (
                  <div 
                    key={index}
                    onClick={() => onChange(option)}
                    className={`w-full md:w-[210px] min-h-[200px] border rounded-[20px] shadow-[4px_4px_40px_rgba(0,0,0,0.05)] flex flex-col items-center justify-center p-6 gap-4 cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-white bg-white/10' 
                        : 'border-white/30 bg-transparent hover:bg-white/5'
                    }`}
                  >
                    <p className="text-white text-sm md:text-base leading-tight text-center">
                      {option}
                    </p>
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                        <span className="text-[#4E4DED] text-sm font-bold">✓</span>
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
                  className={`w-16 h-16 rounded-[20px] border ${
                    value === num
                      ? 'border-white bg-white/10' 
                      : 'border-white/30 bg-transparent hover:bg-white/5'
                  } text-white text-xl font-semibold cursor-pointer transition-all duration-300 flex items-center justify-center shadow-[4px_4px_40px_rgba(0,0,0,0.05)]`}
                  onClick={() => onChange(num)}
                  type="button"
                >
                  {num}
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
          <div className="flex flex-col md:flex-row gap-6 mb-16">
            <div 
              onClick={() => onChange(true)}
              className={`w-full md:w-[210px] min-h-[200px] border rounded-[20px] shadow-[4px_4px_40px_rgba(0,0,0,0.05)] flex flex-col items-center justify-center p-6 gap-4 cursor-pointer transition-all ${
                value === true 
                  ? 'border-white bg-white/10' 
                  : 'border-white/30 bg-transparent hover:bg-white/5'
              }`}
            >
              <p className="text-white text-sm md:text-base leading-tight text-center">
                {question.true_label || 'True'}
              </p>
              {value === true && (
                <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                  <span className="text-[#4E4DED] text-sm font-bold">✓</span>
                </div>
              )}
            </div>
            <div 
              onClick={() => onChange(false)}
              className={`w-full md:w-[210px] min-h-[200px] border rounded-[20px] shadow-[4px_4px_40px_rgba(0,0,0,0.05)] flex flex-col items-center justify-center p-6 gap-4 cursor-pointer transition-all ${
                value === false 
                  ? 'border-white bg-white/10' 
                  : 'border-white/30 bg-transparent hover:bg-white/5'
              }`}
            >
              <p className="text-white text-sm md:text-base leading-tight text-center">
                {question.false_label || 'False'}
              </p>
              {value === false && (
                <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                  <span className="text-[#4E4DED] text-sm font-bold">✓</span>
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

      {question.validation?.max_length && question.type === 'text' && (
        <div className="text-right text-sm text-white/50 mt-2">
          {(value || '').length} / {question.validation.max_length}
        </div>
      )}
    </div>
  );
};

export default FormQuestion;
