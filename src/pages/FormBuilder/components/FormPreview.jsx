const FormPreview = ({ title, description, questions, settings }) => {
  const renderQuestionPreview = (question, index) => {
    switch (question.type) {
      case 'text':
        return (
          <input
            type="text"
            className="w-full px-4 py-3 border-b-2 border-gray-300 bg-transparent text-base opacity-60 focus:outline-none"
            placeholder="Your answer..."
            disabled
          />
        );

      case 'long_text':
        return (
          <textarea
            className="w-full px-0 py-2 border-0 border-b-2 border-gray-300 bg-transparent text-base resize-none opacity-60 focus:outline-none min-h-[40px]"
            placeholder="Your detailed answer..."
            disabled
            rows={1}
          />
        );

      case 'multiple_choice':
        return (
          <div className="flex flex-col gap-3">
            {question.options.map((option, i) => (
              <label key={i} className="flex items-center justify-between gap-4 px-5 py-4 bg-gray-50 border border-gray-200 rounded-lg cursor-not-allowed opacity-60 min-h-[56px]">
                <span className="text-gray-800 text-left flex-1">{option}</span>
                <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center flex-shrink-0">
                  {question.multiple_select ? (
                    <input
                      type="checkbox"
                      disabled
                      className="w-4 h-4 pointer-events-none"
                    />
                  ) : (
                    <div className="w-3 h-3 rounded-full bg-gray-300" />
                  )}
                </div>
              </label>
            ))}
          </div>
        );

      case 'scale':
        const min = question.scale_config?.min || 1;
        const max = question.scale_config?.max || 5;
        const range = Array.from({ length: max - min + 1 }, (_, i) => min + i);
        
        return (
          <div className="flex flex-col gap-4">
            <div className="flex gap-3 justify-center flex-wrap">
              {range.map((value) => (
                <label key={value} className="flex items-center justify-center w-12 h-12 border-2 border-gray-300 rounded-lg bg-gray-50 text-lg font-semibold text-gray-600 cursor-not-allowed opacity-60">
                  {value}
                </label>
              ))}
            </div>
            {(question.scale_config?.min_label || question.scale_config?.max_label) && (
              <div className="flex justify-between text-sm text-gray-500 italic">
                <span>{question.scale_config?.min_label || ''}</span>
                <span>{question.scale_config?.max_label || ''}</span>
              </div>
            )}
          </div>
        );

      case 'true_false':
        return (
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center justify-center px-6 py-4 border-2 border-gray-300 rounded-lg bg-gray-50 text-lg font-semibold text-gray-600 cursor-not-allowed opacity-60">
              {question.true_label || 'True'}
            </label>
            <label className="flex items-center justify-center px-6 py-4 border-2 border-gray-300 rounded-lg bg-gray-50 text-lg font-semibold text-gray-600 cursor-not-allowed opacity-60">
              {question.false_label || 'False'}
            </label>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
        {/* Header */}
        <div className="mb-8 pb-6 border-b border-gray-200">
          <h2 className="text-3xl font-bold text-gray-800 mb-3">
            {title || 'Untitled Form'}
          </h2>
          {description && (
            <p className="text-base text-gray-600 leading-relaxed">{description}</p>
          )}
        </div>

        {/* Questions */}
        {questions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-2">No questions added yet</p>
            <p className="text-sm text-gray-400">Switch to the Questions tab to add questions</p>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {questions.map((question, index) => (
              <div key={question.question_id} className="pb-6 border-b border-gray-100 last:border-0">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {index + 1}. {question.text || 'Untitled Question'}
                    {question.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </h3>
                  {question.help_text && (
                    <p className="text-sm text-gray-600">{question.help_text}</p>
                  )}
                </div>
                <div>
                  {renderQuestionPreview(question, index)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Submit Button */}
        {questions.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <button 
              disabled
              className="w-full px-6 py-4 bg-gray-300 text-gray-500 border-none rounded-lg text-lg font-semibold cursor-not-allowed"
            >
              Submit
            </button>
          </div>
        )}

        {/* Notice */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800 flex items-start gap-2">
          <span>ℹ️</span>
          <span>This is a preview. The actual form will show one question at a time with slide animations.</span>
        </div>
      </div>
    </div>
  );
};

export default FormPreview;
