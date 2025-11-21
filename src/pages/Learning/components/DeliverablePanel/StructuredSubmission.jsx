import React, { useState, useEffect } from 'react';
import { Button } from '../../../../components/ui/button';
import { Textarea } from '../../../../components/ui/textarea';
import { Input } from '../../../../components/ui/input';
import { Loader2 } from 'lucide-react';

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
          <Textarea
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            placeholder={field.placeholder || ''}
            rows={field.rows || 4}
            disabled={isLocked || isSubmitting}
            className="resize-none font-proxima"
          />
        );
      
      case 'text':
      case 'url':
        return (
          <Input
            type={field.type === 'url' ? 'url' : 'text'}
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            placeholder={field.placeholder || ''}
            disabled={isLocked || isSubmitting}
            className="font-proxima"
          />
        );
      
      default:
        return (
          <Input
            type="text"
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            placeholder={field.placeholder || ''}
            disabled={isLocked || isSubmitting}
            className="font-proxima"
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
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {schema.fields.map(field => (
          <div key={field.name} className="space-y-2">
            <label className={`block text-sm font-medium font-proxima text-carbon-black ${field.required ? 'after:content-["*"] after:ml-0.5 after:text-red-500' : ''}`}>
              {field.label}
            </label>
            
            {renderField(field)}
            
            {field.help && (
              <p className="text-xs text-carbon-black/60 font-proxima">
                {field.help}
              </p>
            )}
            
            {field.type === 'textarea' && (
              <p className="text-xs text-carbon-black/40 font-proxima">
                {(formData[field.name] || '').length} characters
              </p>
            )}
          </div>
        ))}

        {validationError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-xs text-red-600 font-proxima">
              {validationError}
            </p>
          </div>
        )}

        {!isFormComplete() && !isLocked && (
          <p className="text-xs text-carbon-black/60 font-proxima">
            All required fields (*) must be completed before submitting.
          </p>
        )}
      </div>

      {/* Submit Button - Fixed at bottom */}
      <div className="border-t border-divider px-6 py-4">
        <Button
          onClick={handleSubmit}
          disabled={!isFormComplete() || isSubmitting || isLocked}
          className="w-full bg-pursuit-purple hover:bg-pursuit-purple/90 text-white font-proxima text-sm"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            `Submit ${task.deliverable || 'Deliverable'}`
          )}
        </Button>
      </div>
    </div>
  );
}

export default StructuredSubmission;
