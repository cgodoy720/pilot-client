import { useEffect, useState } from 'react';
import './FormQuestion.css';

const FormQuestion = ({ question, value, onChange, slideDirection }) => {
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    setAnimating(true);
    const timer = setTimeout(() => setAnimating(false), 300);
    return () => clearTimeout(timer);
  }, [question.question_id]);

  const renderInput = () => {
    switch (question.type) {
      case 'text':
        return (
          <textarea
            className="form-question__textarea"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Type your answer here..."
            rows={4}
            maxLength={question.validation?.max_length}
            autoFocus
          />
        );

      case 'email':
        return (
          <input
            type="email"
            className="form-question__input"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="your.email@example.com"
            autoFocus
          />
        );

      case 'multiple_choice':
        if (question.multiple_select) {
          const selectedValues = value || [];
          return (
            <div className="form-question__options">
              {question.options.map((option, index) => (
                <label key={index} className="form-question__option">
                  <input
                    type="checkbox"
                    checked={selectedValues.includes(option)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        onChange([...selectedValues, option]);
                      } else {
                        onChange(selectedValues.filter(v => v !== option));
                      }
                    }}
                  />
                  <span className="form-question__option-text">{option}</span>
                  <span className="form-question__checkmark">✓</span>
                </label>
              ))}
            </div>
          );
        } else {
          return (
            <div className="form-question__options">
              {question.options.map((option, index) => (
                <label key={index} className="form-question__option">
                  <input
                    type="radio"
                    name={question.question_id}
                    checked={value === option}
                    onChange={() => onChange(option)}
                  />
                  <span className="form-question__option-text">{option}</span>
                  <span className="form-question__radio-circle"></span>
                </label>
              ))}
            </div>
          );
        }

      case 'scale':
        const min = question.scale_config?.min || 1;
        const max = question.scale_config?.max || 5;
        const range = Array.from({ length: max - min + 1 }, (_, i) => min + i);
        
        return (
          <div className="form-question__scale">
            {question.scale_config?.min_label && (
              <div className="form-question__scale-label form-question__scale-label--min">
                {question.scale_config.min_label}
              </div>
            )}
            <div className="form-question__scale-options">
              {range.map((num) => (
                <button
                  key={num}
                  className={`form-question__scale-btn ${value === num ? 'form-question__scale-btn--selected' : ''}`}
                  onClick={() => onChange(num)}
                  type="button"
                >
                  {num}
                </button>
              ))}
            </div>
            {question.scale_config?.max_label && (
              <div className="form-question__scale-label form-question__scale-label--max">
                {question.scale_config.max_label}
              </div>
            )}
          </div>
        );

      case 'true_false':
        return (
          <div className="form-question__true-false">
            <button
              className={`form-question__true-false-btn ${value === true ? 'form-question__true-false-btn--selected' : ''}`}
              onClick={() => onChange(true)}
              type="button"
            >
              {question.true_label || 'True'}
            </button>
            <button
              className={`form-question__true-false-btn ${value === false ? 'form-question__true-false-btn--selected' : ''}`}
              onClick={() => onChange(false)}
              type="button"
            >
              {question.false_label || 'False'}
            </button>
          </div>
        );

      default:
        return <div>Unsupported question type</div>;
    }
  };

  return (
    <div className={`form-question ${animating ? `form-question--slide-${slideDirection}` : ''}`}>
      <div className="form-question__header">
        <h2 className="form-question__text">
          {question.text}
          {question.required && <span className="form-question__required">*</span>}
        </h2>
        {question.help_text && (
          <p className="form-question__help-text">{question.help_text}</p>
        )}
      </div>
      
      <div className="form-question__input-container">
        {renderInput()}
      </div>

      {question.validation?.max_length && question.type === 'text' && (
        <div className="form-question__char-count">
          {(value || '').length} / {question.validation.max_length}
        </div>
      )}
    </div>
  );
};

export default FormQuestion;

