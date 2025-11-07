import React from 'react';
import './RichTextEditor.css';

const RichTextEditor = ({ value, onChange, placeholder }) => {
  return (
    <div className="rich-text-editor">
      <div className="rich-text-editor__toolbar">
        <span className="rich-text-editor__hint">
          Use • or - for bullet points, blank lines for paragraph breaks
        </span>
      </div>
      <textarea
        className="rich-text-editor__textarea"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={12}
      />
    </div>
  );
};

export default RichTextEditor;
