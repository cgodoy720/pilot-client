import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { FaSpinner, FaFileAlt, FaEdit, FaSave, FaTimes, FaExpand, FaDownload } from 'react-icons/fa';
import './FacilitatorNotesGenerator.css';

const FacilitatorNotesGenerator = ({ sharedData = {}, updateSharedData = () => {} }) => {
  const { token } = useAuth();
  const [originalContent, setOriginalContent] = useState('');
  const [sessionData, setSessionData] = useState(null);
  const [facilitatorNotes, setFacilitatorNotes] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNoteIndex, setEditingNoteIndex] = useState(null);
  const [editingNoteText, setEditingNoteText] = useState('');

  // Initialize with shared data and fallback to sessionStorage
  useEffect(() => {
    try {
      // Use shared data if available, otherwise fall back to sessionStorage
      const contentToUse = sharedData?.originalContent || sessionStorage.getItem('originalContent') || '';
      const sessionToUse = sharedData?.editedJSON || sharedData?.generatedJSON || sessionStorage.getItem('generatedSessionData') || '';
      
      setOriginalContent(contentToUse);
      
      if (sessionToUse) {
        try {
          const parsedData = JSON.parse(sessionToUse);
          setSessionData(parsedData);
        } catch (parseError) {
          console.error('Error parsing session data:', parseError);
          setSessionData(null);
        }
      }
    } catch (error) {
      console.error('Error in FacilitatorNotesGenerator useEffect:', error);
      setError('Failed to initialize component data');
    }
  }, [sharedData]);

  const handleGenerateFacilitatorNotes = async () => {
    if (!sessionData) {
      setError('No session data available. Please complete Phase 1 and 2 first.');
      return;
    }

    try {
      setIsGenerating(true);
      setError('');
      
      // Use first day if multi-day data
      const sessionToUse = Array.isArray(sessionData) ? sessionData[0] : sessionData;
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/content/generate-facilitator-notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          sessionData: sessionToUse,
          originalContent: originalContent // Include original content for context
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setFacilitatorNotes(result.facilitatorNotes);
      } else {
        throw new Error(result.error || 'Failed to generate facilitator notes');
      }
      
    } catch (error) {
      console.error('Error generating facilitator notes:', error);
      setError(`Error generating facilitator notes: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const startEditingNote = (taskIndex, currentText) => {
    setEditingNoteIndex(taskIndex);
    setEditingNoteText(currentText);
  };

  const saveEditedNote = () => {
    if (editingNoteIndex !== null && facilitatorNotes) {
      const updatedNotes = { ...facilitatorNotes };
      updatedNotes.tasks[editingNoteIndex].facilitator_notes = editingNoteText;
      setFacilitatorNotes(updatedNotes);
      setEditingNoteIndex(null);
      setEditingNoteText('');
    }
  };

  const cancelEditingNote = () => {
    setEditingNoteIndex(null);
    setEditingNoteText('');
  };

  const handleDownloadNotes = () => {
    if (!facilitatorNotes) return;
    
    const dataStr = JSON.stringify(facilitatorNotes, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `facilitator-notes-day-${facilitatorNotes.tasks[0]?.day_number || 'unknown'}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const openReferenceModal = () => {
    setIsModalOpen(true);
  };

  const closeReferenceModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="facilitator-notes-generator">
      <div className="facilitator-notes-generator__header">
        <h2>Phase 3: Facilitator Notes Generator</h2>
        <p>Generate AI-powered facilitation guidance for your finalized session content</p>
      </div>

      {/* Status indicators */}
      <div className="facilitator-notes-generator__status">
        <div className={`status-indicator ${originalContent ? 'status-indicator--complete' : 'status-indicator--incomplete'}`}>
          <div className="status-indicator__icon">
            {originalContent ? '✓' : '!'}
          </div>
          <div className="status-indicator__text">
            <div className="status-indicator__label">Original Content</div>
            <div className="status-indicator__description">
              {originalContent ? 'Source material loaded and ready' : 'Complete Phase 1 (JSON Generator) first'}
            </div>
          </div>
        </div>
        <div className={`status-indicator ${sessionData ? 'status-indicator--complete' : 'status-indicator--incomplete'}`}>
          <div className="status-indicator__icon">
            {sessionData ? '✓' : '!'}
          </div>
          <div className="status-indicator__text">
            <div className="status-indicator__label">Session Data</div>
            <div className="status-indicator__description">
              {sessionData ? 'Finalized JSON ready for processing' : 'Complete Phase 2 (Session Tester) first'}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="facilitator-notes-generator__error">
          {error}
        </div>
      )}

      {/* Generate button */}
      {!facilitatorNotes && (
        <div className="facilitator-notes-generator__generate-section">
          <button
            onClick={handleGenerateFacilitatorNotes}
            disabled={isGenerating || !sessionData}
            className="facilitator-notes-generator__generate-btn"
          >
            {isGenerating ? (
              <>
                <FaSpinner className="spinning" />
                Generating Facilitator Notes...
              </>
            ) : (
              <>
                <FaFileAlt />
                Generate Facilitator Notes
              </>
            )}
          </button>
          {!sessionData && (
            <p className="facilitator-notes-generator__help">
              Complete Phase 1 (JSON Generator) and Phase 2 (Session Tester) first
            </p>
          )}
        </div>
      )}

      {/* Generated notes */}
      {facilitatorNotes && (
        <div className="facilitator-notes-generator__content">
          <div className="facilitator-notes-generator__toolbar">
            <h3>Facilitator Notes for Day {sessionData?.day_number || 'Unknown'}</h3>
            <div className="facilitator-notes-generator__actions">
              <button
                onClick={openReferenceModal}
                className="facilitator-notes-generator__action-btn"
              >
                <FaExpand />
                View Session Reference
              </button>
              <button
                onClick={handleDownloadNotes}
                className="facilitator-notes-generator__action-btn"
              >
                <FaDownload />
                Download Notes
              </button>
            </div>
          </div>

          <div className="facilitator-notes-generator__notes">
            {/* Daily Goal */}
            {facilitatorNotes.dailyGoal && (
              <div className="facilitator-notes-generator__daily-goal">
                <h4>Daily Goal</h4>
                <p>{facilitatorNotes.dailyGoal}</p>
              </div>
            )}

            {/* Task-by-task notes */}
            <div className="facilitator-notes-generator__tasks">
              <h4>Task-by-Task Facilitation Guidance</h4>
              
              {facilitatorNotes.tasks.map((task, index) => (
                <div key={index} className="facilitator-notes-generator__task">
                  <div className="facilitator-notes-generator__task-header">
                    <h5>{task.task_title}</h5>
                    <div className="facilitator-notes-generator__task-meta">
                      <span className="time">{task.start_time} - {task.end_time}</span>
                      <button
                        onClick={() => startEditingNote(index, task.facilitator_notes)}
                        className="facilitator-notes-generator__edit-btn"
                      >
                        <FaEdit />
                      </button>
                    </div>
                  </div>
                  
                  <div className="facilitator-notes-generator__task-content">
                    {editingNoteIndex === index ? (
                      <div className="facilitator-notes-generator__editor">
                        <textarea
                          value={editingNoteText}
                          onChange={(e) => setEditingNoteText(e.target.value)}
                          className="facilitator-notes-generator__textarea"
                          rows={8}
                        />
                        <div className="facilitator-notes-generator__editor-actions">
                          <button onClick={saveEditedNote} className="btn-save">
                            <FaSave /> Save
                          </button>
                          <button onClick={cancelEditingNote} className="btn-cancel">
                            <FaTimes /> Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="facilitator-notes-generator__note-text">
                        {typeof task.facilitator_notes === 'string' ? (
                          <p>{task.facilitator_notes}</p>
                        ) : (
                          <div className="facilitator-notes-generator__structured-notes">
                            {Object.entries(task.facilitator_notes || {}).map(([category, content]) => (
                              <div key={category} className="facilitator-notes-generator__note-section">
                                <h6>{category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h6>
                                {category === 'faqs' ? (
                                  <div className="facilitator-notes-generator__faqs">
                                    {Array.isArray(content) ? content.map((faq, faqIndex) => (
                                      <div key={faqIndex} className="facilitator-notes-generator__faq">
                                        <div className="facilitator-notes-generator__faq-question">
                                          <strong>Q: {faq.question}</strong>
                                        </div>
                                        <div className="facilitator-notes-generator__faq-response">
                                          <strong>A: </strong>{faq.facilitator_response}
                                        </div>
                                        {faq.follow_up_questions && (
                                          <div className="facilitator-notes-generator__faq-followup">
                                            <strong>Follow-up: </strong>{faq.follow_up_questions}
                                          </div>
                                        )}
                                      </div>
                                    )) : (
                                      <p>No FAQs available</p>
                                    )}
                                  </div>
                                ) : (
                                  <p>{typeof content === 'string' ? content : JSON.stringify(content)}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Reference Modal */}
      {isModalOpen && sessionData && (
        <div className="facilitator-notes-generator__modal-overlay" onClick={closeReferenceModal}>
          <div className="facilitator-notes-generator__modal" onClick={(e) => e.stopPropagation()}>
            <div className="facilitator-notes-generator__modal-header">
              <h3>Session Reference - Day {sessionData?.day_number || 'Unknown'}</h3>
              <button onClick={closeReferenceModal} className="facilitator-notes-generator__modal-close">
                <FaTimes />
              </button>
            </div>
            
            <div className="facilitator-notes-generator__modal-content">
              <div className="facilitator-notes-generator__modal-section">
                <h4>Session Overview</h4>
                <p><strong>Date:</strong> {sessionData.date}</p>
                <p><strong>Cohort:</strong> {sessionData.cohort}</p>
                <p><strong>Daily Goal:</strong> {sessionData.daily_goal}</p>
              </div>
              
              <div className="facilitator-notes-generator__modal-section">
                <h4>Time Blocks & Tasks</h4>
                <div className="facilitator-notes-generator__time-blocks">
                  {sessionData.time_blocks?.map((block, index) => (
                    <div key={index} className="facilitator-notes-generator__time-block">
                      <div className="time-block-header">
                        <strong>{block.start_time} - {block.end_time}</strong>
                        <span className="time-block-category">{block.category}</span>
                      </div>
                      <div className="time-block-task">
                        <h5>{block.task.title}</h5>
                        <p>{block.task.description}</p>
                        {block.task.questions?.length > 0 && (
                          <div className="time-block-questions">
                            <strong>Questions:</strong>
                            <ul>
                              {block.task.questions.map((q, qIndex) => (
                                <li key={qIndex}>{q}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {!originalContent && !sessionData && (
        <div className="facilitator-notes-generator__empty-state">
          <FaFileAlt size={48} />
          <h3>Ready for Facilitator Notes</h3>
          <p>Complete Phase 1 (JSON Generator) and Phase 2 (Session Tester) to generate facilitator notes</p>
        </div>
      )}
    </div>
  );
};

export default FacilitatorNotesGenerator; 