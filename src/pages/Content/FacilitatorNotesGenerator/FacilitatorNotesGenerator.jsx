import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Loader2, FileText, Edit, Save, X, Expand, Download, ChevronDown, ChevronRight, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Textarea } from '../../../components/ui/textarea';
import { toast } from 'sonner';
import './FacilitatorNotesGenerator.css';

const FacilitatorNotesGenerator = ({ sharedData = {}, updateSharedData = () => {} }) => {
  const { token } = useAuth();
  const [originalContent, setOriginalContent] = useState('');
  const [sessionData, setSessionData] = useState(null);
  const [facilitatorNotes, setFacilitatorNotes] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editingDayIndex, setEditingDayIndex] = useState(null);
  const [editingTaskIndex, setEditingTaskIndex] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [editingFieldValue, setEditingFieldValue] = useState('');
  const [collapsedDays, setCollapsedDays] = useState(new Set());
  const [collapsedTasks, setCollapsedTasks] = useState(new Set());


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

  // Check if facilitator notes already exist in the session data
  const hasFacilitatorNotes = () => {
    if (!sessionData) return false;
    
    const isMultiDay = Array.isArray(sessionData);
    const daysToCheck = isMultiDay ? sessionData : [sessionData];
    
    return daysToCheck.some(dayData => {
      if (dayData && dayData.time_blocks) {
        return dayData.time_blocks.some(block => 
          block.task && block.task.facilitator_notes
        );
      }
      return false;
    });
  };

  // Initialize facilitator notes if they already exist in session data
  useEffect(() => {
    if (sessionData && hasFacilitatorNotes() && !facilitatorNotes) {
      const extractedNotes = extractFacilitatorNotesFromSession(sessionData);
      setFacilitatorNotes(extractedNotes);
    }
  }, [sessionData]);

  // Helper function to extract facilitator notes from embedded session data for display
  const extractFacilitatorNotesFromSession = (sessionData) => {
    const isMultiDay = Array.isArray(sessionData);
    const daysToProcess = isMultiDay ? sessionData : [sessionData];
    
    const allDays = [];
    
    daysToProcess.forEach((dayData, dayIndex) => {
      const tasks = [];
      if (dayData && dayData.time_blocks) {
        dayData.time_blocks.forEach((block, blockIndex) => {
          if (block.task) {
            tasks.push({
              task_title: block.task.title,
              start_time: block.start_time,
              end_time: block.end_time,
              facilitator_notes: block.task.facilitator_notes || 'No facilitator notes available'
            });
          }
        });
      }
      
      allDays.push({
        dayNumber: dayData?.day_number || dayIndex + 1,
        date: dayData?.date || 'Unknown',
        dailyGoal: dayData?.daily_goal || '',
        cohort: dayData?.cohort || '',
        tasks: tasks
      });
    });
    
    return {
      isMultiDay: isMultiDay,
      days: allDays
    };
  };

  const handleGenerateFacilitatorNotes = async () => {
    if (!sessionData) {
      setError('No session data available. Please complete Phase 1 and 2 first.');
      return;
    }

    try {
      setIsGenerating(true);
      setError('');
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/content/generate-facilitator-notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          sessionData: sessionData,
          originalContent: originalContent // Include original content for context
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        // Update session data with embedded facilitator notes
        setSessionData(result.sessionData);
        
        // Update shared data to reflect the changes
        const updatedJsonString = JSON.stringify(result.sessionData, null, 2);
        sessionStorage.setItem('generatedSessionData', updatedJsonString);
        updateSharedData({
          editedJSON: updatedJsonString,
          generatedJSON: updatedJsonString
        });
        
        // Set facilitator notes for display (extract from embedded data for backward compatibility)
        const extractedNotes = extractFacilitatorNotesFromSession(result.sessionData);
        setFacilitatorNotes(extractedNotes);
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

  const startEditingNote = (noteIndex, facilitatorNotes, dayIndex = null, taskIndex = null) => {
    // Parse the note index for multi-day scenarios
    let actualDayIndex = dayIndex;
    let actualTaskIndex = taskIndex;
    
    if (typeof noteIndex === 'string' && noteIndex.includes('-')) {
      const [dIdx, tIdx] = noteIndex.split('-').map(Number);
      actualDayIndex = dIdx;
      actualTaskIndex = tIdx;
    } else if (typeof noteIndex === 'number') {
      actualDayIndex = 0; // Single day
      actualTaskIndex = noteIndex;
    }
    
    setEditingDayIndex(actualDayIndex);
    setEditingTaskIndex(actualTaskIndex);
    setEditingTask(facilitatorNotes);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingTask(null);
    setEditingDayIndex(null);
    setEditingTaskIndex(null);
    setEditingField(null);
    setEditingFieldValue('');
    setEditingFaqIndex(null);
  };

  const startEditingField = (field, currentValue) => {
    setEditingField(field);
    setEditingFieldValue(currentValue || '');
  };

  const saveEditedField = () => {
    if (!editingField || !editingTask) return;
    
    const updatedTask = { ...editingTask };
    
    if (editingField.startsWith('faq-')) {
      // Handle FAQ editing
      const [, faqIndex, faqField] = editingField.split('-');
      const faqIdx = parseInt(faqIndex);
      
      if (!updatedTask.faqs) updatedTask.faqs = [];
      if (!updatedTask.faqs[faqIdx]) {
        updatedTask.faqs[faqIdx] = { question: '', facilitator_response: '', follow_up_questions: '' };
      }
      
      updatedTask.faqs[faqIdx][faqField] = editingFieldValue;
    } else {
      // Handle regular field editing
      updatedTask[editingField] = editingFieldValue;
    }
    
    setEditingTask(updatedTask);
    setEditingField(null);
    setEditingFieldValue('');
  };

  const cancelEditingField = () => {
    setEditingField(null);
    setEditingFieldValue('');
  };

  const addNewFaq = () => {
    const updatedTask = { ...editingTask };
    if (!updatedTask.faqs) updatedTask.faqs = [];
    updatedTask.faqs.push({
      question: 'New question - click to edit',
      facilitator_response: 'Response guidance - click to edit',
      follow_up_questions: 'Follow-up questions - click to edit'
    });
    setEditingTask(updatedTask);
  };

  const deleteFaq = (faqIndex) => {
    const updatedTask = { ...editingTask };
    if (updatedTask.faqs && updatedTask.faqs[faqIndex] !== undefined) {
      updatedTask.faqs.splice(faqIndex, 1);
      setEditingTask(updatedTask);
    }
  };

  // Toggle day collapse/expand
  const toggleDayCollapse = (dayIndex) => {
    const newCollapsedDays = new Set(collapsedDays);
    if (newCollapsedDays.has(dayIndex)) {
      newCollapsedDays.delete(dayIndex);
    } else {
      newCollapsedDays.add(dayIndex);
    }
    setCollapsedDays(newCollapsedDays);
  };

  // Toggle task collapse/expand
  const toggleTaskCollapse = (dayIndex, taskIndex) => {
    const taskKey = `${dayIndex}-${taskIndex}`;
    const newCollapsedTasks = new Set(collapsedTasks);
    if (newCollapsedTasks.has(taskKey)) {
      newCollapsedTasks.delete(taskKey);
    } else {
      newCollapsedTasks.add(taskKey);
    }
    setCollapsedTasks(newCollapsedTasks);
  };

  // Expand all days and tasks
  const expandAll = () => {
    setCollapsedDays(new Set());
    setCollapsedTasks(new Set());
  };

  // Collapse all days and tasks
  const collapseAll = () => {
    if (!facilitatorNotes) return;
    
    const allDayIndices = new Set();
    const allTaskKeys = new Set();
    
    facilitatorNotes.days.forEach((day, dayIndex) => {
      allDayIndices.add(dayIndex);
      day.tasks.forEach((task, taskIndex) => {
        allTaskKeys.add(`${dayIndex}-${taskIndex}`);
      });
    });
    
    setCollapsedDays(allDayIndices);
    setCollapsedTasks(allTaskKeys);
  };

  const saveEditedNote = () => {
    if (!editingTask || editingDayIndex === null || editingTaskIndex === null || !facilitatorNotes || !sessionData) {
      return;
    }

    // Update the facilitator notes display
    const updatedNotes = { ...facilitatorNotes };
    
    if (facilitatorNotes.isMultiDay) {
      // Multi-day editing
      updatedNotes.days[editingDayIndex].tasks[editingTaskIndex].facilitator_notes = editingTask;
      
      // Update the embedded facilitator notes in session data
      const updatedSessionData = [...sessionData];
      if (updatedSessionData[editingDayIndex] && updatedSessionData[editingDayIndex].time_blocks && updatedSessionData[editingDayIndex].time_blocks[editingTaskIndex]) {
        updatedSessionData[editingDayIndex].time_blocks[editingTaskIndex].task.facilitator_notes = editingTask;
      }
      
      setSessionData(updatedSessionData);
      
      // Update shared data and sessionStorage
      const updatedJsonString = JSON.stringify(updatedSessionData, null, 2);
      sessionStorage.setItem('generatedSessionData', updatedJsonString);
      updateSharedData({
        editedJSON: updatedJsonString,
        generatedJSON: updatedJsonString
      });
    } else {
      // Single day editing
      updatedNotes.days[0].tasks[editingTaskIndex].facilitator_notes = editingTask;
      
      // Update the embedded facilitator notes in session data
      const updatedSessionData = Array.isArray(sessionData) ? [...sessionData] : { ...sessionData };
      const firstDay = Array.isArray(updatedSessionData) ? updatedSessionData[0] : updatedSessionData;
      
      if (firstDay && firstDay.time_blocks && firstDay.time_blocks[editingTaskIndex]) {
        firstDay.time_blocks[editingTaskIndex].task.facilitator_notes = editingTask;
        
        // Update session data state
        setSessionData(updatedSessionData);
        
        // Update shared data and sessionStorage
        const updatedJsonString = JSON.stringify(updatedSessionData, null, 2);
        sessionStorage.setItem('generatedSessionData', updatedJsonString);
        updateSharedData({
          editedJSON: updatedJsonString,
          generatedJSON: updatedJsonString
        });
      }
    }
    
    setFacilitatorNotes(updatedNotes);
    closeEditModal();
  };



  const handleDownloadNotes = () => {
    if (!sessionData) return;
    
    // Download the complete session data with embedded facilitator notes
    const dataStr = JSON.stringify(sessionData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Generate filename based on session data
    const isMultiDay = Array.isArray(sessionData);
    const firstDay = isMultiDay ? sessionData[0] : sessionData;
    const dayNumber = firstDay?.day_number || 'unknown';
    const cohort = firstDay?.cohort?.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase() || 'cohort';
    
    link.download = `${cohort}-day${dayNumber}-with-facilitator-notes.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadNotesOnly = () => {
    if (!facilitatorNotes) return;
    
    // Download just the facilitator notes
    const dataStr = JSON.stringify(facilitatorNotes, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Generate filename based on session data
    const isMultiDay = Array.isArray(sessionData);
    const firstDay = isMultiDay ? sessionData[0] : sessionData;
    const dayNumber = firstDay?.day_number || 'unknown';
    const cohort = firstDay?.cohort?.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase() || 'cohort';
    
    link.download = `${cohort}-day${dayNumber}-facilitator-notes-only.json`;
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
    <div className="space-y-6">
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
                {hasFacilitatorNotes() ? 'Regenerate Facilitator Notes' : 'Generate Facilitator Notes'}
              </>
            )}
          </button>
          {!sessionData && (
            <p className="facilitator-notes-generator__help">
              Complete Phase 1 (JSON Generator) and Phase 2 (Session Tester) first
            </p>
          )}
          {sessionData && hasFacilitatorNotes() && (
            <p className="facilitator-notes-generator__help">
              Facilitator notes already exist in your session data. Click to regenerate or view them below.
            </p>
          )}
        </div>
      )}

      {/* Generated notes */}
      {facilitatorNotes && (
        <div className="facilitator-notes-generator__content">
          <div className="facilitator-notes-generator__toolbar">
            <h3>Facilitator Notes {Array.isArray(sessionData) ? `(${sessionData.length} Days)` : `for Day ${sessionData?.day_number || 'Unknown'}`}</h3>
            <div className="facilitator-notes-generator__actions">
              <button
                onClick={handleGenerateFacilitatorNotes}
                disabled={isGenerating}
                className="facilitator-notes-generator__action-btn"
                title="Regenerate facilitator notes"
              >
                {isGenerating ? (
                  <FaSpinner className="spinning" />
                ) : (
                  <FaFileAlt />
                )}
                Regenerate
              </button>
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
                Download Complete JSON
              </button>
              <button
                onClick={handleDownloadNotesOnly}
                className="facilitator-notes-generator__action-btn"
              >
                <FaFileAlt />
                Download Notes Only
              </button>
              <div className="facilitator-notes-generator__collapse-controls">
                <button
                  onClick={expandAll}
                  className="facilitator-notes-generator__action-btn facilitator-notes-generator__action-btn--small"
                  title="Expand all sections"
                >
                  <FaExpandArrowsAlt />
                  Expand All
                </button>
                <button
                  onClick={collapseAll}
                  className="facilitator-notes-generator__action-btn facilitator-notes-generator__action-btn--small"
                  title="Collapse all sections"
                >
                  <FaCompressArrowsAlt />
                  Collapse All
                </button>
              </div>
            </div>
          </div>

          <div className="facilitator-notes-generator__notes">
            {/* Multi-day or single day display */}
            {facilitatorNotes.isMultiDay ? (
              <div className="facilitator-notes-generator__multi-day">
                {facilitatorNotes.days.map((day, dayIndex) => (
                  <div key={dayIndex} className="facilitator-notes-generator__day-section">
                    <div 
                      className="facilitator-notes-generator__day-header facilitator-notes-generator__day-header--clickable"
                      onClick={() => toggleDayCollapse(dayIndex)}
                    >
                      <div className="facilitator-notes-generator__day-header-content">
                        <div className="facilitator-notes-generator__day-title">
                          {collapsedDays.has(dayIndex) ? <FaChevronRight /> : <FaChevronDown />}
                          <h4>Day {day.dayNumber} - {day.dailyGoal}</h4>
                        </div>
                        <div className="facilitator-notes-generator__day-meta">
                          <span>{day.date}</span>
                          <span>{day.cohort}</span>
                          <span className="facilitator-notes-generator__task-count">
                            {day.tasks.length} task{day.tasks.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {!collapsedDays.has(dayIndex) && (
                      <div className="facilitator-notes-generator__day-tasks">
                        {day.tasks.map((task, taskIndex) => {
                          const taskKey = `${dayIndex}-${taskIndex}`;
                          const isTaskCollapsed = collapsedTasks.has(taskKey);
                          
                          return (
                            <div key={`${dayIndex}-${taskIndex}`} className="facilitator-notes-generator__task">
                              <div 
                                className="facilitator-notes-generator__task-header facilitator-notes-generator__task-header--clickable"
                                onClick={() => toggleTaskCollapse(dayIndex, taskIndex)}
                              >
                                <div className="facilitator-notes-generator__task-title-section">
                                  {isTaskCollapsed ? <FaChevronRight /> : <FaChevronDown />}
                                  <h5>{task.task_title}</h5>
                                </div>
                                <div className="facilitator-notes-generator__task-meta">
                                  <span className="time">{task.start_time} - {task.end_time}</span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      startEditingNote(`${dayIndex}-${taskIndex}`, task.facilitator_notes, dayIndex, taskIndex);
                                    }}
                                    className="facilitator-notes-generator__edit-btn"
                                    title="Edit facilitator notes"
                                  >
                                    <FaEdit />
                                  </button>
                                </div>
                              </div>
                              
                              {!isTaskCollapsed && (
                                <div className="facilitator-notes-generator__task-content">
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
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="facilitator-notes-generator__single-day">
                {/* Single day display */}
                {facilitatorNotes.days && facilitatorNotes.days[0] && (
                  <>
                    <div className="facilitator-notes-generator__daily-goal">
                      <h4>Daily Goal</h4>
                      <p>{facilitatorNotes.days[0].dailyGoal}</p>
                    </div>

                    <div className="facilitator-notes-generator__tasks">
                      <h4>Task-by-Task Facilitation Guidance</h4>
                      
                      {facilitatorNotes.days[0].tasks.map((task, index) => {
                        const taskKey = `0-${index}`;
                        const isTaskCollapsed = collapsedTasks.has(taskKey);
                        
                        return (
                          <div key={index} className="facilitator-notes-generator__task">
                            <div 
                              className="facilitator-notes-generator__task-header facilitator-notes-generator__task-header--clickable"
                              onClick={() => toggleTaskCollapse(0, index)}
                            >
                              <div className="facilitator-notes-generator__task-title-section">
                                {isTaskCollapsed ? <FaChevronRight /> : <FaChevronDown />}
                                <h5>{task.task_title}</h5>
                              </div>
                              <div className="facilitator-notes-generator__task-meta">
                                <span className="time">{task.start_time} - {task.end_time}</span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    startEditingNote(index, task.facilitator_notes, 0, index);
                                  }}
                                  className="facilitator-notes-generator__edit-btn"
                                  title="Edit facilitator notes"
                                >
                                  <FaEdit />
                                </button>
                              </div>
                            </div>
                            
                            {!isTaskCollapsed && (
                              <div className="facilitator-notes-generator__task-content">
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
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reference Modal */}
      {isModalOpen && sessionData && (
        <div className="facilitator-notes-generator__modal-overlay" onClick={closeReferenceModal}>
          <div className="facilitator-notes-generator__modal" onClick={(e) => e.stopPropagation()}>
            <div className="facilitator-notes-generator__modal-header">
              <h3>Session Reference {Array.isArray(sessionData) ? `(${sessionData.length} Days)` : `- Day ${sessionData?.day_number || 'Unknown'}`}</h3>
              <button onClick={closeReferenceModal} className="facilitator-notes-generator__modal-close">
                <FaTimes />
              </button>
            </div>
            
            <div className="facilitator-notes-generator__modal-content">
              {Array.isArray(sessionData) ? (
                // Multi-day display
                sessionData.map((day, dayIndex) => (
                  <div key={dayIndex} className="facilitator-notes-generator__modal-day">
                    <div className="facilitator-notes-generator__modal-section">
                      <h4>Day {day.day_number} - Session Overview</h4>
                      <p><strong>Date:</strong> {day.date}</p>
                      <p><strong>Cohort:</strong> {day.cohort}</p>
                      <p><strong>Daily Goal:</strong> {day.daily_goal}</p>
                    </div>
                    
                    <div className="facilitator-notes-generator__modal-section">
                      <h4>Time Blocks & Tasks</h4>
                      <div className="facilitator-notes-generator__time-blocks">
                        {day.time_blocks?.map((block, index) => (
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
                ))
              ) : (
                // Single day display
                <>
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
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Structured Editing Modal */}
      {isEditModalOpen && editingTask && (
        <div className="facilitator-notes-generator__edit-overlay" onClick={(e) => e.target === e.currentTarget && closeEditModal()}>
          <div className="facilitator-notes-generator__edit-modal">
            <div className="facilitator-notes-generator__edit-header">
              <h3>Edit Facilitator Notes</h3>
              <button onClick={closeEditModal} className="facilitator-notes-generator__edit-close">
                <FaTimes />
              </button>
            </div>
            
            <div className="facilitator-notes-generator__edit-content">
              {/* Context Section */}
              <div className="facilitator-notes-generator__edit-section">
                <h4>Context</h4>
                {editingField === 'context' ? (
                  <div className="facilitator-notes-generator__field-editor">
                    <textarea
                      value={editingFieldValue}
                      onChange={(e) => setEditingFieldValue(e.target.value)}
                      className="facilitator-notes-generator__edit-textarea"
                      rows={3}
                      placeholder="Brief explanation of where this task fits in the day..."
                    />
                    <div className="facilitator-notes-generator__field-actions">
                      <button onClick={saveEditedField} className="btn-save">
                        <FaSave /> Save
                      </button>
                      <button onClick={cancelEditingField} className="btn-cancel">
                        <FaTimes /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="facilitator-notes-generator__field-display" onClick={() => startEditingField('context', editingTask.context)}>
                    <p>{editingTask.context || 'Click to add context...'}</p>
                    <FaEdit className="facilitator-notes-generator__field-edit-icon" />
                  </div>
                )}
              </div>

              {/* Preparation Section */}
              <div className="facilitator-notes-generator__edit-section">
                <h4>Preparation</h4>
                {editingField === 'preparation' ? (
                  <div className="facilitator-notes-generator__field-editor">
                    <textarea
                      value={editingFieldValue}
                      onChange={(e) => setEditingFieldValue(e.target.value)}
                      className="facilitator-notes-generator__edit-textarea"
                      rows={3}
                      placeholder="Specific items facilitator should review or prep..."
                    />
                    <div className="facilitator-notes-generator__field-actions">
                      <button onClick={saveEditedField} className="btn-save">
                        <FaSave /> Save
                      </button>
                      <button onClick={cancelEditingField} className="btn-cancel">
                        <FaTimes /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="facilitator-notes-generator__field-display" onClick={() => startEditingField('preparation', editingTask.preparation)}>
                    <p>{editingTask.preparation || 'Click to add preparation notes...'}</p>
                    <FaEdit className="facilitator-notes-generator__field-edit-icon" />
                  </div>
                )}
              </div>

              {/* Facilitation Approach Section */}
              <div className="facilitator-notes-generator__edit-section">
                <h4>Facilitation Approach</h4>
                {editingField === 'facilitation_approach' ? (
                  <div className="facilitator-notes-generator__field-editor">
                    <textarea
                      value={editingFieldValue}
                      onChange={(e) => setEditingFieldValue(e.target.value)}
                      className="facilitator-notes-generator__edit-textarea"
                      rows={4}
                      placeholder="How to introduce, guide, and conclude this task..."
                    />
                    <div className="facilitator-notes-generator__field-actions">
                      <button onClick={saveEditedField} className="btn-save">
                        <FaSave /> Save
                      </button>
                      <button onClick={cancelEditingField} className="btn-cancel">
                        <FaTimes /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="facilitator-notes-generator__field-display" onClick={() => startEditingField('facilitation_approach', editingTask.facilitation_approach)}>
                    <p>{editingTask.facilitation_approach || 'Click to add facilitation approach...'}</p>
                    <FaEdit className="facilitator-notes-generator__field-edit-icon" />
                  </div>
                )}
              </div>

              {/* Key Learning Moments Section */}
              <div className="facilitator-notes-generator__edit-section">
                <h4>Key Learning Moments</h4>
                {editingField === 'key_learning_moments' ? (
                  <div className="facilitator-notes-generator__field-editor">
                    <textarea
                      value={editingFieldValue}
                      onChange={(e) => setEditingFieldValue(e.target.value)}
                      className="facilitator-notes-generator__edit-textarea"
                      rows={3}
                      placeholder="What to watch for, when to intervene..."
                    />
                    <div className="facilitator-notes-generator__field-actions">
                      <button onClick={saveEditedField} className="btn-save">
                        <FaSave /> Save
                      </button>
                      <button onClick={cancelEditingField} className="btn-cancel">
                        <FaTimes /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="facilitator-notes-generator__field-display" onClick={() => startEditingField('key_learning_moments', editingTask.key_learning_moments)}>
                    <p>{editingTask.key_learning_moments || 'Click to add key learning moments...'}</p>
                    <FaEdit className="facilitator-notes-generator__field-edit-icon" />
                  </div>
                )}
              </div>

              {/* FAQs Section */}
              <div className="facilitator-notes-generator__edit-section">
                <div className="facilitator-notes-generator__section-header">
                  <h4>Frequently Asked Questions</h4>
                  <button onClick={addNewFaq} className="facilitator-notes-generator__add-btn">
                    <FaEdit /> Add FAQ
                  </button>
                </div>
                
                <div className="facilitator-notes-generator__faqs-editor">
                  {editingTask.faqs && editingTask.faqs.length > 0 ? (
                    editingTask.faqs.map((faq, faqIndex) => (
                      <div key={faqIndex} className="facilitator-notes-generator__faq-editor">
                        <div className="facilitator-notes-generator__faq-header">
                          <h5>FAQ #{faqIndex + 1}</h5>
                          <button onClick={() => deleteFaq(faqIndex)} className="facilitator-notes-generator__delete-btn">
                            <FaTimes />
                          </button>
                        </div>
                        
                        {/* Question */}
                        <div className="facilitator-notes-generator__faq-field">
                          <label>Question:</label>
                          {editingField === `faq-${faqIndex}-question` ? (
                            <div className="facilitator-notes-generator__field-editor">
                              <input
                                type="text"
                                value={editingFieldValue}
                                onChange={(e) => setEditingFieldValue(e.target.value)}
                                className="facilitator-notes-generator__edit-input"
                                placeholder="Enter the question..."
                              />
                              <div className="facilitator-notes-generator__field-actions">
                                <button onClick={saveEditedField} className="btn-save">
                                  <FaSave />
                                </button>
                                <button onClick={cancelEditingField} className="btn-cancel">
                                  <FaTimes />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="facilitator-notes-generator__field-display" onClick={() => startEditingField(`faq-${faqIndex}-question`, faq.question)}>
                              <p>{faq.question || 'Click to add question...'}</p>
                              <FaEdit className="facilitator-notes-generator__field-edit-icon" />
                            </div>
                          )}
                        </div>

                        {/* Facilitator Response */}
                        <div className="facilitator-notes-generator__faq-field">
                          <label>Facilitator Response:</label>
                          {editingField === `faq-${faqIndex}-facilitator_response` ? (
                            <div className="facilitator-notes-generator__field-editor">
                              <textarea
                                value={editingFieldValue}
                                onChange={(e) => setEditingFieldValue(e.target.value)}
                                className="facilitator-notes-generator__edit-textarea"
                                rows={3}
                                placeholder="How the facilitator should respond..."
                              />
                              <div className="facilitator-notes-generator__field-actions">
                                <button onClick={saveEditedField} className="btn-save">
                                  <FaSave />
                                </button>
                                <button onClick={cancelEditingField} className="btn-cancel">
                                  <FaTimes />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="facilitator-notes-generator__field-display" onClick={() => startEditingField(`faq-${faqIndex}-facilitator_response`, faq.facilitator_response)}>
                              <p>{faq.facilitator_response || 'Click to add response...'}</p>
                              <FaEdit className="facilitator-notes-generator__field-edit-icon" />
                            </div>
                          )}
                        </div>

                        {/* Follow-up Questions */}
                        <div className="facilitator-notes-generator__faq-field">
                          <label>Follow-up Questions:</label>
                          {editingField === `faq-${faqIndex}-follow_up_questions` ? (
                            <div className="facilitator-notes-generator__field-editor">
                              <textarea
                                value={editingFieldValue}
                                onChange={(e) => setEditingFieldValue(e.target.value)}
                                className="facilitator-notes-generator__edit-textarea"
                                rows={2}
                                placeholder="Questions facilitator can ask to guide thinking..."
                              />
                              <div className="facilitator-notes-generator__field-actions">
                                <button onClick={saveEditedField} className="btn-save">
                                  <FaSave />
                                </button>
                                <button onClick={cancelEditingField} className="btn-cancel">
                                  <FaTimes />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="facilitator-notes-generator__field-display" onClick={() => startEditingField(`faq-${faqIndex}-follow_up_questions`, faq.follow_up_questions)}>
                              <p>{faq.follow_up_questions || 'Click to add follow-up questions...'}</p>
                              <FaEdit className="facilitator-notes-generator__field-edit-icon" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="facilitator-notes-generator__empty-faqs">No FAQs yet. Click "Add FAQ" to create one.</p>
                  )}
                </div>
              </div>

              {/* Success Indicators Section */}
              <div className="facilitator-notes-generator__edit-section">
                <h4>Success Indicators</h4>
                {editingField === 'success_indicators' ? (
                  <div className="facilitator-notes-generator__field-editor">
                    <textarea
                      value={editingFieldValue}
                      onChange={(e) => setEditingFieldValue(e.target.value)}
                      className="facilitator-notes-generator__edit-textarea"
                      rows={3}
                      placeholder="How to recognize when builders are on track..."
                    />
                    <div className="facilitator-notes-generator__field-actions">
                      <button onClick={saveEditedField} className="btn-save">
                        <FaSave /> Save
                      </button>
                      <button onClick={cancelEditingField} className="btn-cancel">
                        <FaTimes /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="facilitator-notes-generator__field-display" onClick={() => startEditingField('success_indicators', editingTask.success_indicators)}>
                    <p>{editingTask.success_indicators || 'Click to add success indicators...'}</p>
                    <FaEdit className="facilitator-notes-generator__field-edit-icon" />
                  </div>
                )}
              </div>

              {/* Time Management Section */}
              <div className="facilitator-notes-generator__edit-section">
                <h4>Time Management</h4>
                {editingField === 'time_management' ? (
                  <div className="facilitator-notes-generator__field-editor">
                    <textarea
                      value={editingFieldValue}
                      onChange={(e) => setEditingFieldValue(e.target.value)}
                      className="facilitator-notes-generator__edit-textarea"
                      rows={3}
                      placeholder="Pacing guidance, what to do if running over/under time..."
                    />
                    <div className="facilitator-notes-generator__field-actions">
                      <button onClick={saveEditedField} className="btn-save">
                        <FaSave /> Save
                      </button>
                      <button onClick={cancelEditingField} className="btn-cancel">
                        <FaTimes /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="facilitator-notes-generator__field-display" onClick={() => startEditingField('time_management', editingTask.time_management)}>
                    <p>{editingTask.time_management || 'Click to add time management notes...'}</p>
                    <FaEdit className="facilitator-notes-generator__field-edit-icon" />
                  </div>
                )}
              </div>
            </div>
            
            <div className="facilitator-notes-generator__edit-footer">
              <button onClick={closeEditModal} className="facilitator-notes-generator__btn facilitator-notes-generator__btn--cancel">
                Cancel
              </button>
              <button onClick={saveEditedNote} className="facilitator-notes-generator__btn facilitator-notes-generator__btn--save">
                <FaSave /> Save Changes
              </button>
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
    </div>
  );
};

export default FacilitatorNotesGenerator;