import './FormPreview.css';

const FormPreview = ({ title, description, questions, settings }) => {
  const renderQuestionPreview = (question, index) => {
    switch (question.type) {
      case 'text':
        return (
          <textarea
            className="form-preview__input form-preview__textarea"
            placeholder="Your answer..."
            disabled
            rows={3}
          />
        );

      case 'email':
        return (
          <input
            type="email"
            className="form-preview__input"
            placeholder="your.email@example.com"
            disabled
          />
        );

      case 'multiple_choice':
        return (
          <div className="form-preview__options">
            {question.options.map((option, i) => (
              <label key={i} className="form-preview__option">
                <input
                  type={question.multiple_select ? 'checkbox' : 'radio'}
                  name={`question-${index}`}
                  disabled
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        );

      case 'scale':
        const min = question.scale_config?.min || 1;
        const max = question.scale_config?.max || 5;
        const range = Array.from({ length: max - min + 1 }, (_, i) => min + i);
        
        return (
          <div className="form-preview__scale">
            {question.scale_config?.min_label && (
              <span className="form-preview__scale-label">
                {question.scale_config.min_label}
              </span>
            )}
            <div className="form-preview__scale-options">
              {range.map((value) => (
                <label key={value} className="form-preview__scale-option">
                  <input
                    type="radio"
                    name={`question-${index}`}
                    value={value}
                    disabled
                  />
                  <span className="form-preview__scale-value">{value}</span>
                </label>
              ))}
            </div>
            {question.scale_config?.max_label && (
              <span className="form-preview__scale-label">
                {question.scale_config.max_label}
              </span>
            )}
          </div>
        );

      case 'true_false':
        return (
          <div className="form-preview__options">
            <label className="form-preview__option">
              <input type="radio" name={`question-${index}`} disabled />
              <span>{question.true_label || 'True'}</span>
            </label>
            <label className="form-preview__option">
              <input type="radio" name={`question-${index}`} disabled />
              <span>{question.false_label || 'False'}</span>
            </label>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="form-preview">
      <div className="form-preview__container">
        <div className="form-preview__header">
          <h2 className="form-preview__title">{title || 'Untitled Form'}</h2>
          {description && (
            <p className="form-preview__description">{description}</p>
          )}
        </div>

        {questions.length === 0 ? (
          <div className="form-preview__empty">
            <p>No questions added yet</p>
            <p className="form-preview__empty-hint">Switch to the Questions tab to add questions</p>
          </div>
        ) : (
          <div className="form-preview__questions">
            {questions.map((question, index) => (
              <div key={question.question_id} className="form-preview__question">
                <div className="form-preview__question-header">
                  <h3 className="form-preview__question-text">
                    {question.text || 'Untitled Question'}
                    {question.required && (
                      <span className="form-preview__required">*</span>
                    )}
                  </h3>
                  {question.help_text && (
                    <p className="form-preview__help-text">{question.help_text}</p>
                  )}
                </div>
                <div className="form-preview__question-input">
                  {renderQuestionPreview(question, index)}
                </div>
              </div>
            ))}
          </div>
        )}

        {questions.length > 0 && (
          <div className="form-preview__footer">
            <button className="form-preview__submit-btn" disabled>
              Submit
            </button>
          </div>
        )}

        <div className="form-preview__notice">
          ℹ️ This is a preview. The actual form will show one question at a time.
        </div>
      </div>
    </div>
  );
};

export default FormPreview;

