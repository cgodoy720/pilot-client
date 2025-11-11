import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createForm, getFormById, updateForm } from '../../services/formService';
import QuestionEditor from './components/QuestionEditor';
import FormSettings from './components/FormSettings';
import FormPreview from './components/FormPreview';
import Swal from 'sweetalert2';

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
      navigate('/forms');
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
        navigate(`/forms/${newForm.form_id}/edit`, { replace: true });
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
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-600">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-[#4242ea] rounded-full animate-spin mb-4"></div>
        <p>Loading form...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full mx-auto overflow-x-hidden box-border bg-[#f5f5f5] min-h-screen text-[#1a1a1a]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-16 py-6 shadow-sm">
        <div className="flex gap-8 items-start mb-6">
          <div className="flex-1 max-w-[800px] flex flex-col gap-2">
            <input
              type="text"
              className="text-3xl font-bold border-none p-2 w-full rounded-md focus:outline-none focus:bg-gray-50 transition-colors"
              placeholder="Untitled Form"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            <textarea
              className="text-base border-none p-2 w-full rounded-md resize-vertical focus:outline-none focus:bg-gray-50 transition-colors"
              placeholder="Form description (optional)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
            />
          </div>
          <div className="flex items-start pt-2">
            <button 
              onClick={() => navigate('/forms')}
              className="px-4 py-2.5 bg-white text-[#4242ea] border border-gray-200 rounded-md text-sm font-medium cursor-pointer transition-all duration-200 whitespace-nowrap hover:bg-gray-50 hover:border-[#4242ea] hover:shadow-sm"
            >
              ← Back to Forms
            </button>
          </div>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => handleSave(false)}
            disabled={saving}
            className="px-6 py-3 bg-white text-[#4242ea] border border-[#4242ea] rounded-md text-base font-semibold cursor-pointer transition-all duration-200 hover:bg-gray-50 hover:shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Draft'}
          </button>
          <button 
            onClick={() => handleSave(true)}
            disabled={saving}
            className="px-6 py-3 bg-[#4242ea] text-white border-none rounded-md text-base font-semibold cursor-pointer transition-all duration-200 shadow-md hover:bg-[#3333d1] hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 flex gap-0 px-16">
        <button
          onClick={() => setActiveTab('questions')}
          className={`px-6 py-4 border-none bg-transparent cursor-pointer text-base transition-all duration-200 border-b-4 ${
            activeTab === 'questions'
              ? 'text-[#4242ea] border-[#4242ea] font-semibold bg-[#4242ea]/5'
              : 'text-gray-600 border-transparent hover:text-[#4242ea]'
          }`}
        >
          Questions ({formData.questions.length})
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-6 py-4 border-none bg-transparent cursor-pointer text-base transition-all duration-200 border-b-4 ${
            activeTab === 'settings'
              ? 'text-[#4242ea] border-[#4242ea] font-semibold bg-[#4242ea]/5'
              : 'text-gray-600 border-transparent hover:text-[#4242ea]'
          }`}
        >
          Settings
        </button>
        <button
          onClick={() => setActiveTab('preview')}
          className={`px-6 py-4 border-none bg-transparent cursor-pointer text-base transition-all duration-200 border-b-4 ${
            activeTab === 'preview'
              ? 'text-[#4242ea] border-[#4242ea] font-semibold bg-[#4242ea]/5'
              : 'text-gray-600 border-transparent hover:text-[#4242ea]'
          }`}
        >
          Preview
        </button>
      </div>

      {/* Content */}
      <div className="w-full max-w-full mx-auto p-8 box-border">
        {activeTab === 'questions' && (
          <div className="grid grid-cols-[300px_1fr] gap-8">
            <div className="sticky top-0 h-fit">
              <h3 className="text-sm font-semibold mb-4 text-gray-600 uppercase tracking-wide">Questions</h3>
              <div className="flex flex-col gap-2">
                {formData.questions.length === 0 ? (
                  <p className="text-sm text-gray-500 italic p-4">No questions yet</p>
                ) : (
                  formData.questions.map((question, index) => (
                    <div
                      key={question.question_id}
                      onClick={() => setSelectedQuestionIndex(index)}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 border-2 ${
                        selectedQuestionIndex === index
                          ? 'bg-[#4242ea]/10 border-[#4242ea] shadow-sm'
                          : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                        selectedQuestionIndex === index
                          ? 'bg-[#4242ea] text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-800 truncate">
                          {question.text || 'Untitled Question'}
                        </div>
                        <div className="text-xs text-gray-500 capitalize">{question.type.replace('_', ' ')}</div>
                      </div>
                      {question.required && (
                        <span className="text-red-500 font-bold">*</span>
                      )}
                    </div>
                  ))
                )}
              </div>
              
              {/* Add Question Type */}
              <div className="pt-6 border-t border-gray-200 mt-6">
                <h4 className="text-xs font-semibold mb-4 text-gray-600 uppercase tracking-wider">Add Question Type</h4>
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => handleAddQuestion('text')} 
                    title="Text input for short or long answers"
                    className="flex items-center gap-3 p-3.5 border-2 border-gray-200 rounded-xl bg-white cursor-pointer text-left text-sm transition-all duration-300 relative overflow-hidden hover:border-[#4242ea] hover:text-[#4242ea] hover:translate-x-1 hover:shadow-sm"
                  >
                    <span className="text-xl relative z-10">📝</span>
                    <span className="flex-1 font-medium relative z-10">Text Input</span>
                  </button>
                  <button 
                    onClick={() => handleAddQuestion('email')} 
                    title="Email address with validation"
                    className="flex items-center gap-3 p-3.5 border-2 border-gray-200 rounded-xl bg-white cursor-pointer text-left text-sm transition-all duration-300 relative overflow-hidden hover:border-[#4242ea] hover:text-[#4242ea] hover:translate-x-1 hover:shadow-sm"
                  >
                    <span className="text-xl relative z-10">📧</span>
                    <span className="flex-1 font-medium relative z-10">Email</span>
                  </button>
                  <button 
                    onClick={() => handleAddQuestion('multiple_choice')} 
                    title="Single or multiple selection"
                    className="flex items-center gap-3 p-3.5 border-2 border-gray-200 rounded-xl bg-white cursor-pointer text-left text-sm transition-all duration-300 relative overflow-hidden hover:border-[#4242ea] hover:text-[#4242ea] hover:translate-x-1 hover:shadow-sm"
                  >
                    <span className="text-xl relative z-10">☑️</span>
                    <span className="flex-1 font-medium relative z-10">Multiple Choice</span>
                  </button>
                  <button 
                    onClick={() => handleAddQuestion('scale')} 
                    title="Rating scale (1-5, 1-10, etc.)"
                    className="flex items-center gap-3 p-3.5 border-2 border-gray-200 rounded-xl bg-white cursor-pointer text-left text-sm transition-all duration-300 relative overflow-hidden hover:border-[#4242ea] hover:text-[#4242ea] hover:translate-x-1 hover:shadow-sm"
                  >
                    <span className="text-xl relative z-10">📊</span>
                    <span className="flex-1 font-medium relative z-10">Scale Rating</span>
                  </button>
                  <button 
                    onClick={() => handleAddQuestion('true_false')} 
                    title="Yes/No or True/False"
                    className="flex items-center gap-3 p-3.5 border-2 border-gray-200 rounded-xl bg-white cursor-pointer text-left text-sm transition-all duration-300 relative overflow-hidden hover:border-[#4242ea] hover:text-[#4242ea] hover:translate-x-1 hover:shadow-sm"
                  >
                    <span className="text-xl relative z-10">✓</span>
                    <span className="flex-1 font-medium relative z-10">True/False</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1">
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
                <div className="flex flex-col items-center justify-center p-16 text-center">
                  <div className="text-6xl mb-4">👈</div>
                  <p className="text-gray-500">Select a question to edit, or add a new question</p>
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

