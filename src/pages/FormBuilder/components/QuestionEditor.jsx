import { ArrowUp, ArrowDown, Trash2, Plus, X } from 'lucide-react';

const QuestionEditor = ({ 
  question, 
  questionIndex, 
  totalQuestions,
  onUpdate, 
  onDelete,
  onMoveUp,
  onMoveDown
}) => {
  const handleChange = (field, value) => {
    onUpdate({ ...question, [field]: value });
  };

  const handleValidationChange = (field, value) => {
    onUpdate({
      ...question,
      validation: { ...question.validation, [field]: value }
    });
  };

  const handleScaleConfigChange = (field, value) => {
    onUpdate({
      ...question,
      scale_config: { ...question.scale_config, [field]: value }
    });
  };

  const handleAddOption = () => {
    const newOptions = [...question.options, `Option ${question.options.length + 1}`];
    onUpdate({ ...question, options: newOptions });
  };

  const handleUpdateOption = (index, value) => {
    const newOptions = [...question.options];
    newOptions[index] = value;
    onUpdate({ ...question, options: newOptions });
  };

  const handleRemoveOption = (index) => {
    const newOptions = question.options.filter((_, i) => i !== index);
    onUpdate({ ...question, options: newOptions });
  };

  const getTypeLabel = (type) => {
    const labels = {
      text: 'Text Input',
      long_text: 'Long Text',
      multiple_choice: 'Multiple Choice',
      scale: 'Scale Rating',
      true_false: 'True/False'
    };
    return labels[type] || type;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-3">
          Question {questionIndex + 1}
          <span className="px-3 py-1 bg-[#4242ea]/10 text-[#4242ea] rounded-full text-xs font-semibold">
            {getTypeLabel(question.type)}
          </span>
        </h3>
        <div className="flex gap-2">
          <button
            onClick={onMoveUp}
            disabled={questionIndex === 0}
            title="Move up"
            className="w-8 h-8 border border-gray-300 rounded-lg bg-white text-gray-600 cursor-pointer transition-all duration-200 flex items-center justify-center hover:bg-gray-50 hover:border-[#4242ea] hover:text-[#4242ea] disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
          <button
            onClick={onMoveDown}
            disabled={questionIndex === totalQuestions - 1}
            title="Move down"
            className="w-8 h-8 border border-gray-300 rounded-lg bg-white text-gray-600 cursor-pointer transition-all duration-200 flex items-center justify-center hover:bg-gray-50 hover:border-[#4242ea] hover:text-[#4242ea] disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ArrowDown className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            title="Delete question"
            className="w-8 h-8 border border-red-300 rounded-lg bg-white text-red-600 cursor-pointer transition-all duration-200 flex items-center justify-center hover:bg-red-50 hover:border-red-400"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Question Text */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Question Text <span className="text-red-500">*</span>
        </label>
        <textarea
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base resize-vertical transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#4242ea] focus:border-transparent"
          value={question.text}
          onChange={(e) => handleChange('text', e.target.value)}
          placeholder={
            question.type === 'text' ? "e.g., What is your name?" :
            question.type === 'long_text' ? "e.g., Please describe your experience in detail." :
            question.type === 'multiple_choice' ? "e.g., What is your favorite color?" :
            question.type === 'scale' ? "e.g., How satisfied are you with our service?" :
            question.type === 'true_false' ? "e.g., Do you agree to the terms?" :
            "Enter your question..."
          }
          rows={3}
          autoFocus
        />
      </div>

      {/* Help Text */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Help Text (Optional)</label>
        <input
          type="text"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#4242ea] focus:border-transparent"
          value={question.help_text}
          onChange={(e) => handleChange('help_text', e.target.value)}
          placeholder="Add additional context or instructions for respondents..."
        />
      </div>

      {/* Required Checkbox */}
      <div className="mb-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={question.required}
            onChange={(e) => handleChange('required', e.target.checked)}
            className="w-4 h-4 accent-[#4242ea] cursor-pointer"
          />
          <span className="text-sm font-medium text-gray-700">Required Question</span>
        </label>
      </div>

      {/* Type-specific settings */}
      {(question.type === 'text' || question.type === 'long_text') && (
        <div className="pt-6 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-4">
            {question.type === 'long_text' ? 'Long Text Settings' : 'Text Settings'}
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Length</label>
              <input
                type="number"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#4242ea] focus:border-transparent"
                value={question.validation?.min_length || ''}
                onChange={(e) => handleValidationChange('min_length', parseInt(e.target.value) || null)}
                min="0"
                placeholder="No minimum"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Length</label>
              <input
                type="number"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#4242ea] focus:border-transparent"
                value={question.validation?.max_length || ''}
                onChange={(e) => handleValidationChange('max_length', parseInt(e.target.value) || null)}
                min="0"
                placeholder="No maximum"
              />
            </div>
          </div>
        </div>
      )}

      {question.type === 'multiple_choice' && (
        <div className="pt-6 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-4">Multiple Choice Options</h4>
          <div className="flex flex-col gap-3 mb-4">
            {question.options.map((option, index) => (
              <div key={index} className="flex gap-2 items-center">
                <input
                  type="text"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#4242ea] focus:border-transparent"
                  value={option}
                  onChange={(e) => handleUpdateOption(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                />
                <button
                  onClick={() => handleRemoveOption(index)}
                  disabled={question.options.length <= 2}
                  title="Remove option"
                  className="w-8 h-8 border border-red-300 rounded-lg bg-white text-red-600 cursor-pointer transition-all duration-200 flex items-center justify-center hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={handleAddOption}
            className="px-4 py-2 bg-white text-[#4242ea] border border-[#4242ea] rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 inline-flex items-center gap-2 hover:bg-[#4242ea]/5"
          >
            <Plus className="w-4 h-4" />
            Add Option
          </button>
          <div className="mt-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={question.multiple_select || false}
                onChange={(e) => handleChange('multiple_select', e.target.checked)}
                className="w-4 h-4 accent-[#4242ea] cursor-pointer"
              />
              <span className="text-sm font-medium text-gray-700">Allow multiple selections</span>
            </label>
          </div>
        </div>
      )}

      {question.type === 'scale' && (
        <div className="pt-6 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-4">Scale Settings</h4>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Value</label>
              <input
                type="number"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#4242ea] focus:border-transparent"
                value={question.scale_config?.min || 1}
                onChange={(e) => handleScaleConfigChange('min', parseInt(e.target.value) || 1)}
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Value</label>
              <input
                type="number"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#4242ea] focus:border-transparent"
                value={question.scale_config?.max || 5}
                onChange={(e) => handleScaleConfigChange('max', parseInt(e.target.value) || 5)}
                min="1"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Label (Optional)</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#4242ea] focus:border-transparent"
                value={question.scale_config?.min_label || ''}
                onChange={(e) => handleScaleConfigChange('min_label', e.target.value)}
                placeholder="e.g., Not Satisfied"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Label (Optional)</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#4242ea] focus:border-transparent"
                value={question.scale_config?.max_label || ''}
                onChange={(e) => handleScaleConfigChange('max_label', e.target.value)}
                placeholder="e.g., Very Satisfied"
              />
            </div>
          </div>
        </div>
      )}

      {question.type === 'true_false' && (
        <div className="pt-6 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-4">True/False Labels</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">True Label</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#4242ea] focus:border-transparent"
                value={question.true_label || 'True'}
                onChange={(e) => handleChange('true_label', e.target.value)}
                placeholder="True"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">False Label</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#4242ea] focus:border-transparent"
                value={question.false_label || 'False'}
                onChange={(e) => handleChange('false_label', e.target.value)}
                placeholder="False"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionEditor;
