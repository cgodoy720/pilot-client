import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../../components/ui/dialog';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Textarea } from '../../../../components/ui/textarea';
import { Checkbox } from '../../../../components/ui/checkbox';

const PromptFormDialog = ({
  open,
  onClose,
  onSubmit,
  title,
  confirmText = 'Save',
  initialData = {},
  fields = []
}) => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      // Initialize form data with initial values
      const initial = {};
      fields.forEach(field => {
        initial[field.name] = initialData[field.name] || field.defaultValue || '';
      });
      setFormData(initial);
      setErrors({});
    }
  }, [open, initialData, fields]);

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    fields.forEach(field => {
      if (field.required && !formData[field.name]?.toString().trim()) {
        newErrors[field.name] = `${field.label} is required`;
      }
      if (field.validate) {
        const error = field.validate(formData[field.name], formData);
        if (error) newErrors[field.name] = error;
      }
    });
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    onSubmit(formData);
  };

  const renderField = (field) => {
    const value = formData[field.name] || '';
    const error = errors[field.name];

    switch (field.type) {
      case 'textarea':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name} className="font-proxima text-[#1E1E1E]">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Textarea
              id={field.name}
              value={value}
              onChange={(e) => handleChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              rows={field.rows || 6}
              className={`font-mono text-sm bg-white border-[#C8C8C8] text-[#1E1E1E] placeholder:text-[#999] ${
                error ? 'border-red-500' : ''
              }`}
            />
            {field.helpText && (
              <p className="text-xs text-[#666] font-proxima">{field.helpText}</p>
            )}
            {error && (
              <p className="text-xs text-red-500 font-proxima">{error}</p>
            )}
          </div>
        );

      case 'checkbox':
        return (
          <div key={field.name} className="flex items-center space-x-2">
            <Checkbox
              id={field.name}
              checked={value === true}
              onCheckedChange={(checked) => handleChange(field.name, checked)}
            />
            <Label
              htmlFor={field.name}
              className="font-proxima text-[#1E1E1E] cursor-pointer"
            >
              {field.label}
            </Label>
          </div>
        );

      case 'select':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name} className="font-proxima text-[#1E1E1E]">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <select
              id={field.name}
              value={value}
              onChange={(e) => handleChange(field.name, e.target.value)}
              className={`w-full px-3 py-2 bg-white border border-[#C8C8C8] rounded-md font-proxima text-[#1E1E1E] focus:outline-none focus:ring-2 focus:ring-[#4242EA] ${
                error ? 'border-red-500' : ''
              }`}
            >
              {field.options?.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {field.helpText && (
              <p className="text-xs text-[#666] font-proxima">{field.helpText}</p>
            )}
            {error && (
              <p className="text-xs text-red-500 font-proxima">{error}</p>
            )}
          </div>
        );

      default: // text input
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name} className="font-proxima text-[#1E1E1E]">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={field.name}
              type={field.type || 'text'}
              value={value}
              onChange={(e) => handleChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              className={`bg-white border-[#C8C8C8] text-[#1E1E1E] placeholder:text-[#999] ${
                error ? 'border-red-500' : ''
              }`}
            />
            {field.helpText && (
              <p className="text-xs text-[#666] font-proxima">{field.helpText}</p>
            )}
            {error && (
              <p className="text-xs text-red-500 font-proxima">{error}</p>
            )}
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="font-proxima-bold text-[#1E1E1E] text-xl">
              {title}
            </DialogTitle>
            <DialogDescription className="font-proxima text-[#666]">
              Fill in the details below. Fields marked with * are required.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {fields.map(field => renderField(field))}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-[#C8C8C8] text-[#1E1E1E] hover:bg-[#E3E3E3]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#4242EA] text-white hover:bg-[#3535D1]"
            >
              {confirmText}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PromptFormDialog;

