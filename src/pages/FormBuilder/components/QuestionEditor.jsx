import { useState } from 'react';
import './QuestionEditor.css';

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
      email: 'Email',
      multiple_choice: 'Multiple Choice',
      scale: 'Scale Rating',
      true_false: 'True/False'
    };
    return labels[type] || type;
  };

  return (
    <div className="question-editor">
      <div className="question-editor__header">
        <h3 className="question-editor__title">
          Question {questionIndex + 1}
          <span className="question-editor__type-badge">{getTypeLabel(question.type)}</span>
        </h3>
        <div className="question-editor__actions">
          <button
            className="question-editor__move-btn"
            onClick={onMoveUp}
            disabled={questionIndex === 0}
            title="Move up"
          >
            ↑
          </button>
          <button
            className="question-editor__move-btn"
            onClick={onMoveDown}
            disabled={questionIndex === totalQuestions - 1}
            title="Move down"
          >
            ↓
          </button>
          <button
            className="question-editor__delete-btn"
            onClick={onDelete}
            title="Delete question"
          >
            🗑️
          </button>
        </div>
      </div>

      <div className="question-editor__field">
        <label className="question-editor__label">
          Question Text <span className="question-editor__required">*</span>
        </label>
        <textarea
          className="question-editor__textarea"
          value={question.text}
          onChange={(e) => handleChange('text', e.target.value)}
          placeholder={
            question.type === 'text' ? "e.g., What is your name?" :
            question.type === 'email' ? "e.g., What is your email address?" :
            question.type === 'multiple_choice' ? "e.g., What is your favorite color?" :
            question.type === 'scale' ? "e.g., How satisfied are you with our service?" :
            question.type === 'true_false' ? "e.g., Do you agree to the terms?" :
            "Enter your question..."
          }
          rows={3}
          autoFocus
        />
      </div>

      <div className="question-editor__field">
        <label className="question-editor__label">Help Text (Optional)</label>
        <input
          type="text"
          className="question-editor__input"
          value={question.help_text}
          onChange={(e) => handleChange('help_text', e.target.value)}
          placeholder="Add additional context or instructions for respondents..."
        />
      </div>

      <div className="question-editor__field">
        <label className="question-editor__checkbox-label">
          <input
            type="checkbox"
            checked={question.required}
            onChange={(e) => handleChange('required', e.target.checked)}
          />
          <span>Required Question</span>
        </label>
      </div>

      {/* Type-specific settings */}
      {question.type === 'text' && (
        <div className="question-editor__type-settings">
          <h4 className="question-editor__subtitle">Text Settings</h4>
          <div className="question-editor__field-group">
            <div className="question-editor__field">
              <label className="question-editor__label">Minimum Length</label>
              <input
                type="number"
                className="question-editor__input question-editor__input--small"
                value={question.validation?.min_length || ''}
                onChange={(e) => handleValidationChange('min_length', parseInt(e.target.value) || null)}
                min="0"
                placeholder="No minimum"
              />
            </div>
            <div className="question-editor__field">
              <label className="question-editor__label">Maximum Length</label>
              <input
                type="number"
                className="question-editor__input question-editor__input--small"
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
        <div className="question-editor__type-settings">
          <h4 className="question-editor__subtitle">Multiple Choice Options</h4>
          <div className="question-editor__options-list">
            {question.options.map((option, index) => (
              <div key={index} className="question-editor__option-item">
                <input
                  type="text"
                  className="question-editor__input"
                  value={option}
                  onChange={(e) => handleUpdateOption(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                />
                <button
                  className="question-editor__remove-option-btn"
                  onClick={() => handleRemoveOption(index)}
                  disabled={question.options.length <= 2}
                  title="Remove option"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <button
            className="question-editor__add-option-btn"
            onClick={handleAddOption}
          >
            + Add Option
          </button>
          <div className="question-editor__field">
            <label className="question-editor__checkbox-label">
              <input
                type="checkbox"
                checked={question.multiple_select || false}
                onChange={(e) => handleChange('multiple_select', e.target.checked)}
              />
              <span>Allow multiple selections</span>
            </label>
          </div>
        </div>
      )}

      {question.type === 'scale' && (
        <div className="question-editor__type-settings">
          <h4 className="question-editor__subtitle">Scale Settings</h4>
          <div className="question-editor__field-group">
            <div className="question-editor__field">
              <label className="question-editor__label">Minimum Value</label>
              <input
                type="number"
                className="question-editor__input question-editor__input--small"
                value={question.scale_config?.min || 1}
                onChange={(e) => handleScaleConfigChange('min', parseInt(e.target.value) || 1)}
                min="0"
              />
            </div>
            <div className="question-editor__field">
              <label className="question-editor__label">Maximum Value</label>
              <input
                type="number"
                className="question-editor__input question-editor__input--small"
                value={question.scale_config?.max || 5}
                onChange={(e) => handleScaleConfigChange('max', parseInt(e.target.value) || 5)}
                min="1"
              />
            </div>
          </div>
          <div className="question-editor__field-group">
            <div className="question-editor__field">
              <label className="question-editor__label">Minimum Label (Optional)</label>
              <input
                type="text"
                className="question-editor__input"
                value={question.scale_config?.min_label || ''}
                onChange={(e) => handleScaleConfigChange('min_label', e.target.value)}
                placeholder="e.g., Not Satisfied"
              />
            </div>
            <div className="question-editor__field">
              <label className="question-editor__label">Maximum Label (Optional)</label>
              <input
                type="text"
                className="question-editor__input"
                value={question.scale_config?.max_label || ''}
                onChange={(e) => handleScaleConfigChange('max_label', e.target.value)}
                placeholder="e.g., Very Satisfied"
              />
            </div>
          </div>
        </div>
      )}

      {question.type === 'true_false' && (
        <div className="question-editor__type-settings">
          <h4 className="question-editor__subtitle">True/False Labels</h4>
          <div className="question-editor__field-group">
            <div className="question-editor__field">
              <label className="question-editor__label">True Label</label>
              <input
                type="text"
                className="question-editor__input"
                value={question.true_label || 'True'}
                onChange={(e) => handleChange('true_label', e.target.value)}
                placeholder="True"
              />
            </div>
            <div className="question-editor__field">
              <label className="question-editor__label">False Label</label>
              <input
                type="text"
                className="question-editor__input"
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

