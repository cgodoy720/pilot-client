import React, { useState, useEffect } from 'react';

function StructuredSubmission({ task, schema, currentSubmission, isSubmitting, isLocked, onSubmit }) {
  const [formData, setFormData] = useState({});
  const [validationError, setValidationError] = useState('');

  // Initialize form data from schema and existing submission
  useEffect(() => {
    const initialData = {};
    
    // Try to parse existing submission if it exists
    let existingData = {};
    if (currentSubmission?.content) {
      try {
        // If content is a JSON string, parse it
        existingData = typeof currentSubmission.content === 'string' 
          ? JSON.parse(currentSubmission.content)
          : currentSubmission.content;
      } catch (e) {
        // If parsing fails, treat as plain text
        console.log('Could not parse submission content as JSON');
      }
    }
    
    // Initialize each field from schema
    schema.fields.forEach(field => {
      initialData[field.name] = existingData[field.name] || '';
    });
    
    setFormData(initialData);
  }, [schema, currentSubmission]);

  const handleChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError('');
    }
  };

  const validateForm = () => {
    // Check all required fields
    for (const field of schema.fields) {
      if (field.required && !formData[field.name]?.trim()) {
        return `Please fill in the "${field.label}" field`;
      }
    }
    return null;
  };

  const handleSubmit = () => {
    // Validate
    const error = validateForm();
    if (error) {
      setValidationError(error);
      return;
    }

    // Submit as JSON object
    onSubmit(formData);
  };

  const renderField = (field) => {
    const isRequired = field.required;
    const value = formData[field.name] || '';

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            className="submission-form__textarea"
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            placeholder={field.placeholder || ''}
            rows={field.rows || 4}
            disabled={isLocked || isSubmitting}
          />
        );
      
      case 'text':
      case 'url':
        return (
          <input
            type={field.type === 'url' ? 'url' : 'text'}
            className="submission-form__input"
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            placeholder={field.placeholder || ''}
            disabled={isLocked || isSubmitting}
          />
        );
      
      default:
        return (
          <input
            type="text"
            className="submission-form__input"
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            placeholder={field.placeholder || ''}
            disabled={isLocked || isSubmitting}
          />
        );
    }
  };

  const isFormComplete = () => {
    return schema.fields
      .filter(f => f.required)
      .every(f => formData[f.name]?.trim());
  };

  return (
    <div className="submission-form">
      {schema.fields.map(field => (
        <div key={field.name} className="submission-form__field">
          <label className={`submission-form__label ${field.required ? 'submission-form__label--required' : ''}`}>
            {field.label}
          </label>
          
          {renderField(field)}
          
          {field.help && (
            <div className="submission-form__help">
              {field.help}
            </div>
          )}
          
          {field.type === 'textarea' && (
            <div className="submission-form__char-counter">
              {(formData[field.name] || '').length} characters
            </div>
          )}
        </div>
      ))}

      {validationError && (
        <div className="submission-form__validation-error">
          {validationError}
        </div>
      )}

      <div className="submission-form__actions">
        <button
          onClick={handleSubmit}
          disabled={!isFormComplete() || isSubmitting || isLocked}
          className="submission-form__btn submission-form__btn--primary"
        >
          {isSubmitting ? (
            <>
              <div className="submission-form__spinner" />
              Submitting...
            </>
          ) : (
            `Submit ${task.deliverable || 'Deliverable'}`
          )}
        </button>
        
        {!isFormComplete() && !isLocked && (
          <div className="submission-form__help">
            All required fields (*) must be completed before submitting.
          </div>
        )}
      </div>
    </div>
  );
}

export default StructuredSubmission;
