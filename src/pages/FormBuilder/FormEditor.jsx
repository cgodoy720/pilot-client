import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createForm, getFormById, updateForm } from '../../services/formService';
import QuestionEditor from './components/QuestionEditor';
import FormSettings from './components/FormSettings';
import FormPreview from './components/FormPreview';
import Swal from 'sweetalert2';
import './FormEditor.css';

const FormEditor = () => {
  const navigate = useNavigate();
  const { formId } = useParams();
  const isEditMode = Boolean(formId);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    questions: [],
    settings: {
      allow_multiple_submissions: false,
      require_email: false,
      show_progress: true,
      enable_save_continue: false,
      thank_you_message: 'Thank you for your submission!',
      redirect_url: null,
      email_notifications: false,
      notification_emails: []
    }
  });

  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(null);
  const [activeTab, setActiveTab] = useState('questions'); // questions, settings, preview
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      loadForm();
    }
  }, [formId]);

  const loadForm = async () => {
    try {
      setLoading(true);
      const data = await getFormById(formId);
      setFormData({
        title: data.title,
        description: data.description || '',
        questions: data.questions || [],
        settings: data.settings || formData.settings
      });
    } catch (error) {
      console.error('Error loading form:', error);
      Swal.fire('Error', 'Failed to load form', 'error');
      navigate('/dashboard/forms');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (publish = false) => {
    try {
      // Validation
      if (!formData.title.trim()) {
        Swal.fire('Error', 'Please enter a form title', 'error');
        return;
      }

      if (formData.questions.length === 0) {
        Swal.fire('Error', 'Please add at least one question', 'error');
        return;
      }

      setSaving(true);

      const dataToSave = {
        ...formData,
        status: publish ? 'active' : 'draft'
      };

      if (isEditMode) {
        await updateForm(formId, dataToSave);
      } else {
        const newForm = await createForm(dataToSave);
        navigate(`/dashboard/forms/${newForm.form_id}/edit`, { replace: true });
      }

      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: publish ? 'Form published successfully' : 'Form saved as draft',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error saving form:', error);
      Swal.fire('Error', 'Failed to save form', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAddQuestion = (type) => {
    const newQuestion = {
      question_id: `q${Date.now()}`,
      type,
      text: type === 'text' ? 'What is your answer?' : 
            type === 'email' ? 'What is your email address?' :
            type === 'multiple_choice' ? 'Select an option:' :
            type === 'scale' ? 'How would you rate this?' :
            type === 'true_false' ? 'Please choose:' : '',
      help_text: '',
      required: true,
      order: formData.questions.length + 1,
      validation: type === 'text' ? { min_length: null, max_length: null } : {},
      options: type === 'multiple_choice' ? ['Option 1', 'Option 2', 'Option 3'] : [],
      multiple_select: false,
      scale_config: type === 'scale' ? { min: 1, max: 5, min_label: 'Not Satisfied', max_label: 'Very Satisfied' } : {},
      true_label: 'Yes',
      false_label: 'No',
      conditional_logic: null
    };

    const newQuestions = [...formData.questions, newQuestion];
    setFormData({
      ...formData,
      questions: newQuestions
    });
    setSelectedQuestionIndex(newQuestions.length - 1);
  };

  const handleUpdateQuestion = (index, updatedQuestion) => {
    const newQuestions = [...formData.questions];
    newQuestions[index] = updatedQuestion;
    setFormData({ ...formData, questions: newQuestions });
  };

  const handleDeleteQuestion = (index) => {
    Swal.fire({
      title: 'Delete Question?',
      text: 'This cannot be undone',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
      confirmButtonColor: '#d33'
    }).then((result) => {
      if (result.isConfirmed) {
        const newQuestions = formData.questions.filter((_, i) => i !== index);
        setFormData({ ...formData, questions: newQuestions });
        setSelectedQuestionIndex(null);
      }
    });
  };

  const handleReorderQuestions = (fromIndex, toIndex) => {
    const newQuestions = [...formData.questions];
    const [movedQuestion] = newQuestions.splice(fromIndex, 1);
    newQuestions.splice(toIndex, 0, movedQuestion);
    
    // Update order property
    newQuestions.forEach((q, i) => {
      q.order = i + 1;
    });
    
    setFormData({ ...formData, questions: newQuestions });
  };

  const handleUpdateSettings = (updatedSettings) => {
    setFormData({ ...formData, settings: updatedSettings });
  };

  if (loading) {
    return (
      <div className="form-editor__loading">
        <div className="form-editor__spinner"></div>
        <p>Loading form...</p>
      </div>
    );
  }

  return (
    <div className="form-editor">
      <div className="form-editor__header">
        <div className="form-editor__header-top">
          <div className="form-editor__header-content">
            <input
              type="text"
              className="form-editor__title-input"
              placeholder="Untitled Form"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            <textarea
              className="form-editor__description-input"
              placeholder="Form description (optional)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
            />
          </div>
          <div className="form-editor__header-right">
            <button 
              className="form-editor__back-btn"
              onClick={() => navigate('/dashboard/forms')}
            >
              ← Back to Forms
            </button>
          </div>
        </div>
        <div className="form-editor__header-actions">
          <button 
            className="form-editor__save-btn"
            onClick={() => handleSave(false)}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Draft'}
          </button>
          <button 
            className="form-editor__publish-btn"
            onClick={() => handleSave(true)}
            disabled={saving}
          >
            {saving ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      </div>

      <div className="form-editor__tabs">
        <button
          className={`form-editor__tab ${activeTab === 'questions' ? 'form-editor__tab--active' : ''}`}
          onClick={() => setActiveTab('questions')}
        >
          Questions ({formData.questions.length})
        </button>
        <button
          className={`form-editor__tab ${activeTab === 'settings' ? 'form-editor__tab--active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
        <button
          className={`form-editor__tab ${activeTab === 'preview' ? 'form-editor__tab--active' : ''}`}
          onClick={() => setActiveTab('preview')}
        >
          Preview
        </button>
      </div>

      <div className="form-editor__content">
        {activeTab === 'questions' && (
          <div className="form-editor__questions-view">
            <div className="form-editor__sidebar">
              <h3 className="form-editor__sidebar-title">Questions</h3>
              <div className="form-editor__question-list">
                {formData.questions.length === 0 ? (
                  <p className="form-editor__empty-message">No questions yet</p>
                ) : (
                  formData.questions.map((question, index) => (
                    <div
                      key={question.question_id}
                      className={`form-editor__question-item ${selectedQuestionIndex === index ? 'form-editor__question-item--active' : ''}`}
                      onClick={() => setSelectedQuestionIndex(index)}
                    >
                      <div className="form-editor__question-item-number">{index + 1}</div>
                      <div className="form-editor__question-item-content">
                        <div className="form-editor__question-item-text">
                          {question.text || 'Untitled Question'}
                        </div>
                        <div className="form-editor__question-item-type">{question.type}</div>
                      </div>
                      {question.required && (
                        <span className="form-editor__required-badge">*</span>
                      )}
                    </div>
                  ))
                )}
              </div>
              <div className="form-editor__add-question">
                <h4>Add Question Type</h4>
                <div className="form-editor__question-types">
                  <button onClick={() => handleAddQuestion('text')} title="Text input for short or long answers">
                    <span className="form-editor__btn-icon">📝</span>
                    <span className="form-editor__btn-label">Text Input</span>
                  </button>
                  <button onClick={() => handleAddQuestion('email')} title="Email address with validation">
                    <span className="form-editor__btn-icon">📧</span>
                    <span className="form-editor__btn-label">Email</span>
                  </button>
                  <button onClick={() => handleAddQuestion('multiple_choice')} title="Single or multiple selection">
                    <span className="form-editor__btn-icon">☑️</span>
                    <span className="form-editor__btn-label">Multiple Choice</span>
                  </button>
                  <button onClick={() => handleAddQuestion('scale')} title="Rating scale (1-5, 1-10, etc.)">
                    <span className="form-editor__btn-icon">📊</span>
                    <span className="form-editor__btn-label">Scale Rating</span>
                  </button>
                  <button onClick={() => handleAddQuestion('true_false')} title="Yes/No or True/False">
                    <span className="form-editor__btn-icon">✓</span>
                    <span className="form-editor__btn-label">True/False</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="form-editor__main">
              {selectedQuestionIndex !== null && formData.questions[selectedQuestionIndex] ? (
                <QuestionEditor
                  question={formData.questions[selectedQuestionIndex]}
                  questionIndex={selectedQuestionIndex}
                  totalQuestions={formData.questions.length}
                  onUpdate={(updatedQuestion) => handleUpdateQuestion(selectedQuestionIndex, updatedQuestion)}
                  onDelete={() => handleDeleteQuestion(selectedQuestionIndex)}
                  onMoveUp={() => {
                    if (selectedQuestionIndex > 0) {
                      handleReorderQuestions(selectedQuestionIndex, selectedQuestionIndex - 1);
                      setSelectedQuestionIndex(selectedQuestionIndex - 1);
                    }
                  }}
                  onMoveDown={() => {
                    if (selectedQuestionIndex < formData.questions.length - 1) {
                      handleReorderQuestions(selectedQuestionIndex, selectedQuestionIndex + 1);
                      setSelectedQuestionIndex(selectedQuestionIndex + 1);
                    }
                  }}
                />
              ) : (
                <div className="form-editor__no-selection">
                  <div className="form-editor__no-selection-icon">👈</div>
                  <p>Select a question to edit, or add a new question</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <FormSettings
            settings={formData.settings}
            onUpdate={handleUpdateSettings}
          />
        )}

        {activeTab === 'preview' && (
          <FormPreview
            title={formData.title}
            description={formData.description}
            questions={formData.questions}
            settings={formData.settings}
          />
        )}
      </div>
    </div>
  );
};

export default FormEditor;

