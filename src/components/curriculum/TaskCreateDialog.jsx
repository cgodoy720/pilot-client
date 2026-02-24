import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Plus, Trash2, X, Clock, GraduationCap, MessageCircle, AlertCircle, Coffee, FileQuestion, ClipboardCheck } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL;

const TaskCreateDialog = ({ 
  open, 
  onOpenChange,
  onSave,
  dayNumber,
  token
}) => {
  // Determine interface type based on task configuration
  const getInterfaceType = (formData) => {
    if (formData.feedback_slot && formData.feedback_slot !== 'none') {
      return 'survey';
    }
    if (formData.task_type === 'assessment') {
      return 'assessment';
    }
    if (formData.task_type === 'break') {
      return 'break';
    }
    return 'chat'; // Default conversation/chat interface
  };

  const [formData, setFormData] = useState({
    // Core fields
    task_title: '',
    task_description: '',
    task_type: 'individual',
    duration_minutes: 30,
    start_time: '',
    end_time: '',
    
    // Content fields
    intro: '',
    questions: [],
    linked_resources: [],
    conclusion: '',
    
    // Deliverable fields
    deliverable: '',
    deliverable_type: 'text',
    deliverable_schema: null,
    
    // Smart task fields
    task_mode: 'conversation',
    conversation_model: null,
    persona: null,
    ai_helper_mode: 'coach_only',
    feedback_slot: null,
    assessment_id: null,
    
    // Analysis fields
    should_analyze: false,
    analyze_deliverable: false
  });

  const [isSaving, setIsSaving] = useState(false);
  const [assessments, setAssessments] = useState([]);
  const [loadingAssessments, setLoadingAssessments] = useState(false);
  const interfaceType = getInterfaceType(formData);

  // Apply smart defaults when task type or feedback_slot changes
  useEffect(() => {
    const newInterfaceType = getInterfaceType(formData);
    
    if (newInterfaceType === 'break') {
      // Break task defaults
      setFormData(prev => ({
        ...prev,
        task_mode: 'basic',
        deliverable_type: 'none',
        should_analyze: false,
        analyze_deliverable: false,
        ai_helper_mode: null,
        persona: null
      }));
    } else if (newInterfaceType === 'survey') {
      // Survey task defaults
      setFormData(prev => ({
        ...prev,
        task_type: 'individual',
        task_mode: 'conversation',
        ai_helper_mode: 'coach_only',
        deliverable_type: 'text',
        should_analyze: false,
        analyze_deliverable: false
      }));
    } else if (newInterfaceType === 'assessment') {
      // Assessment task defaults
      setFormData(prev => ({
        ...prev,
        task_mode: 'conversation',
        ai_helper_mode: 'coach_only',
        deliverable_type: 'assessment',
        should_analyze: true,
        analyze_deliverable: true
      }));
    }
  }, [formData.task_type, formData.feedback_slot, formData.task_mode]);

  // Helper function to determine if deliverable type should be analyzed
  const shouldAnalyzeDeliverableType = (deliverableType) => {
    const analyzableTypes = ['link', 'document', 'video', 'presentation', 'structured', 'assessment', 'feedback', 'commitment', 'image'];
    return analyzableTypes.includes(deliverableType);
  };

  // Update analyze_deliverable when deliverable_type changes and grading is enabled
  useEffect(() => {
    if (formData.should_analyze) {
      const shouldAnalyze = shouldAnalyzeDeliverableType(formData.deliverable_type);
      
      if (formData.analyze_deliverable !== shouldAnalyze) {
        setFormData(prev => ({
          ...prev,
          analyze_deliverable: shouldAnalyze
        }));
      }
    }
  }, [formData.deliverable_type, formData.should_analyze]);

  // Fetch assessments when modal opens with assessment interface type
  useEffect(() => {
    const fetchAssessments = async () => {
      if (!token) return;
      
      try {
        setLoadingAssessments(true);
        const response = await axios.get(
          `${API_URL}/api/preview/assessments`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAssessments(response.data.assessments || []);
      } catch (error) {
        console.error('Error fetching assessments:', error);
        toast.error('Failed to load assessments');
      } finally {
        setLoadingAssessments(false);
      }
    };

    if (open && interfaceType === 'assessment') {
      fetchAssessments();
    }
  }, [open, interfaceType, token]);

  // Calculate duration from start_time and end_time
  useEffect(() => {
    if (formData.start_time && formData.end_time) {
      const [startHour, startMin] = formData.start_time.split(':').map(Number);
      const [endHour, endMin] = formData.end_time.split(':').map(Number);
      
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      
      let duration = endMinutes - startMinutes;
      
      // Handle case where end time is before start time (crosses midnight)
      if (duration < 0) {
        duration = 0;
      }
      
      if (duration !== formData.duration_minutes) {
        setFormData(prev => ({ ...prev, duration_minutes: duration }));
      }
    }
  }, [formData.start_time, formData.end_time]);

  const handleSave = async () => {
    if (!formData.task_title.trim()) {
      toast.error('Task title is required');
      return;
    }

    // Validate start and end times
    if (!formData.start_time || !formData.end_time) {
      toast.error('Start time and end time are required');
      return;
    }

    // Validate that end time is after start time
    if (formData.duration_minutes <= 0) {
      toast.error('End time must be after start time');
      return;
    }

    // Validate assessment_id if task type is assessment
    if (formData.task_type === 'assessment' && !formData.assessment_id) {
      toast.error('Assessment ID is required for assessment tasks');
      return;
    }

    // Validate feedback_slot if survey
    if (interfaceType === 'survey' && (!formData.feedback_slot || formData.feedback_slot === 'none')) {
      toast.error('Survey type is required for survey tasks');
      return;
    }

    setIsSaving(true);
    try {
      await onSave?.(formData);
      // Reset form
      setFormData({
        task_title: '',
        task_description: '',
        task_type: 'individual',
        duration_minutes: 30,
        start_time: '',
        end_time: '',
        intro: '',
        questions: [],
        linked_resources: [],
        conclusion: '',
        deliverable: '',
        deliverable_type: 'text',
        deliverable_schema: null,
        task_mode: 'conversation',
        conversation_model: null,
        persona: null,
        ai_helper_mode: 'coach_only',
        feedback_slot: null,
        assessment_id: null,
        should_analyze: false,
        analyze_deliverable: false
      });
    } catch (error) {
      console.error('Error creating task:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    // Reset form on close
    setFormData({
      task_title: '',
      task_description: '',
      task_type: 'individual',
      duration_minutes: 30,
      start_time: '',
      end_time: '',
      intro: '',
      questions: [],
      linked_resources: [],
      conclusion: '',
      deliverable: '',
      deliverable_type: 'text',
      deliverable_schema: null,
      task_mode: 'conversation',
      conversation_model: null,
      persona: null,
      ai_helper_mode: 'coach_only',
      feedback_slot: null,
      assessment_id: null,
      should_analyze: false,
      analyze_deliverable: false
    });
    onOpenChange(false);
  };

  const addQuestion = () => {
    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, '']
    }));
  };

  const updateQuestion = (index, value) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => i === index ? value : q)
    }));
  };

  const removeQuestion = (index) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const addResource = () => {
    setFormData(prev => ({
      ...prev,
      linked_resources: [...prev.linked_resources, {
        title: '',
        url: '',
        type: 'article',
        description: ''
      }]
    }));
  };

  const updateResource = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      linked_resources: prev.linked_resources.map((r, i) => 
        i === index ? { ...r, [field]: value } : r
      )
    }));
  };

  const removeResource = (index) => {
    setFormData(prev => ({
      ...prev,
      linked_resources: prev.linked_resources.filter((_, i) => i !== index)
    }));
  };

  // Get modal title based on interface type
  const getModalTitle = () => {
    switch (interfaceType) {
      case 'survey': return 'Add Survey Task';
      case 'assessment': return 'Add Assessment Task';
      case 'break': return 'Add Break Task';
      default: return 'Add New Task';
    }
  };

  // Get modal icon based on interface type
  const getModalIcon = () => {
    switch (interfaceType) {
      case 'survey': return <FileQuestion className="h-5 w-5 text-[#4242EA]" />;
      case 'assessment': return <ClipboardCheck className="h-5 w-5 text-[#4242EA]" />;
      case 'break': return <Coffee className="h-5 w-5 text-[#4242EA]" />;
      default: return <MessageCircle className="h-5 w-5 text-[#4242EA]" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-proxima-bold text-xl flex items-center gap-2">
            {getModalIcon()}
            {getModalTitle()}
          </DialogTitle>
          <DialogDescription className="font-proxima text-[#666]">
            {dayNumber ? `Create a new ${interfaceType} task for Day ${dayNumber}` : `Create a new ${interfaceType} task for this day`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Interface Type Selector */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <Label className="font-proxima-bold text-sm mb-2 block">Interface Type</Label>
            <div className="grid grid-cols-4 gap-2">
              <Button
                type="button"
                variant={interfaceType === 'chat' ? 'default' : 'outline'}
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    task_type: 'individual',
                    feedback_slot: null
                  }));
                }}
                className={`${interfaceType === 'chat' ? 'bg-[#4242EA]' : ''} font-proxima`}
              >
                <MessageCircle className="h-4 w-4 mr-1" />
                Chat
              </Button>
              <Button
                type="button"
                variant={interfaceType === 'survey' ? 'default' : 'outline'}
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    feedback_slot: 'weekly',
                    task_type: 'individual'
                  }));
                }}
                className={`${interfaceType === 'survey' ? 'bg-[#4242EA]' : ''} font-proxima`}
              >
                <FileQuestion className="h-4 w-4 mr-1" />
                Survey
              </Button>
              <Button
                type="button"
                variant={interfaceType === 'assessment' ? 'default' : 'outline'}
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    task_type: 'assessment',
                    feedback_slot: null
                  }));
                }}
                className={`${interfaceType === 'assessment' ? 'bg-[#4242EA]' : ''} font-proxima`}
              >
                <ClipboardCheck className="h-4 w-4 mr-1" />
                Assessment
              </Button>
              <Button
                type="button"
                variant={interfaceType === 'break' ? 'default' : 'outline'}
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    task_type: 'break',
                    feedback_slot: null
                  }));
                }}
                className={`${interfaceType === 'break' ? 'bg-[#4242EA]' : ''} font-proxima`}
              >
                <Coffee className="h-4 w-4 mr-1" />
                Break
              </Button>
            </div>
          </div>

          {/* ASSESSMENT INTERFACE - Assessment Configuration (shown first) */}
          {interfaceType === 'assessment' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-2 mb-3">
                <ClipboardCheck className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-proxima-bold text-green-900 text-sm">Assessment Configuration</p>
                  <p className="text-xs text-green-700 font-proxima">Select an assessment from the database.</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="assessment_id" className="font-proxima-bold text-sm">
                  Assessment *
                </Label>
                {loadingAssessments ? (
                  <div className="text-sm text-green-700 font-proxima py-2">Loading assessments...</div>
                ) : (
                  <Select
                    value={formData.assessment_id?.toString() || ''}
                    onValueChange={(value) => {
                      const selectedAssessment = assessments.find(a => a.value.toString() === value);
                      
                      if (selectedAssessment) {
                        setFormData(prev => ({ 
                          ...prev, 
                          assessment_id: parseInt(value),
                          task_title: selectedAssessment.label
                        }));
                      }
                    }}
                  >
                    <SelectTrigger className="font-proxima">
                      <SelectValue placeholder="Select an assessment..." />
                    </SelectTrigger>
                    <SelectContent>
                      {assessments.map(assessment => (
                        <SelectItem 
                          key={assessment.value} 
                          value={assessment.value.toString()}
                        >
                          {assessment.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          )}

          {/* Task Title - Always shown */}
          <div className="space-y-2">
            <Label htmlFor="task_title" className="font-proxima-bold">
              Task Title *
            </Label>
            <Input
              id="task_title"
              value={formData.task_title}
              onChange={(e) => setFormData(prev => ({ ...prev, task_title: e.target.value }))}
              placeholder={
                interfaceType === 'break' ? 'e.g., Lunch Break' :
                interfaceType === 'survey' ? 'e.g., Weekly Feedback Survey' :
                interfaceType === 'assessment' ? 'e.g., Technical Assessment' :
                'Enter task title'
              }
              className="font-proxima"
            />
          </div>

          {/* Description - Hidden for assessments (not used) */}
          {interfaceType !== 'assessment' && (
            <div className="space-y-2">
              <Label htmlFor="task_description" className="font-proxima-bold">
                Description
              </Label>
              <Textarea
                id="task_description"
                value={formData.task_description}
                onChange={(e) => setFormData(prev => ({ ...prev, task_description: e.target.value }))}
                placeholder="Brief description of the task"
                rows={2}
                className="font-proxima"
              />
            </div>
          )}

          {/* Time Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_time" className="font-proxima-bold">
                Start Time *
              </Label>
              <Input
                id="start_time"
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                className="font-proxima"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_time" className="font-proxima-bold">
                End Time *
              </Label>
              <Input
                id="end_time"
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                className="font-proxima"
                required
              />
            </div>
          </div>

          {/* Duration Display - Auto-calculated */}
          {formData.start_time && formData.end_time && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm font-proxima">
                <span className="font-proxima-bold">Duration:</span> {formData.duration_minutes} minutes
              </p>
            </div>
          )}

          {/* BREAK INTERFACE - Minimal fields */}
          {interfaceType === 'break' && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-2 mb-3">
                <Coffee className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-proxima-bold text-amber-900 text-sm">Break Task Configuration</p>
                  <p className="text-xs text-amber-700 font-proxima">Break tasks use a simple interface with minimal configuration.</p>
                </div>
              </div>
              
              {/* Optional intro for break */}
              <div className="space-y-2">
                <Label htmlFor="intro" className="font-proxima-bold text-sm">
                  Break Message (Optional)
                </Label>
                <Textarea
                  id="intro"
                  value={formData.intro}
                  onChange={(e) => setFormData(prev => ({ ...prev, intro: e.target.value }))}
                  placeholder="e.g., Time to recharge! Use this break to network with fellow Builders..."
                  rows={3}
                  className="font-proxima"
                />
              </div>
            </div>
          )}

          {/* SURVEY INTERFACE - Survey-specific fields */}
          {interfaceType === 'survey' && (
            <>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-start gap-2 mb-3">
                  <FileQuestion className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <p className="font-proxima-bold text-purple-900 text-sm">Survey Configuration</p>
                    <p className="text-xs text-purple-700 font-proxima">Survey questions are hardcoded in the frontend based on survey type.</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="feedback_slot" className="font-proxima-bold text-sm">
                    Survey Type *
                  </Label>
                  <Select
                    value={formData.feedback_slot || 'weekly'}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, feedback_slot: value }))}
                  >
                    <SelectTrigger className="font-proxima">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly Survey (5 questions)</SelectItem>
                      <SelectItem value="l1_final">L1 Final Survey (6 questions)</SelectItem>
                      <SelectItem value="end_of_l1">End of L1</SelectItem>
                      <SelectItem value="mid_program">Mid Program</SelectItem>
                      <SelectItem value="final">Final</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Survey intro/description */}
              <div className="space-y-2">
                <Label htmlFor="intro" className="font-proxima-bold">
                  Survey Introduction (Optional)
                </Label>
                <Textarea
                  id="intro"
                  value={formData.intro}
                  onChange={(e) => setFormData(prev => ({ ...prev, intro: e.target.value }))}
                  placeholder="Introductory text for the survey..."
                  rows={3}
                  className="font-proxima"
                />
              </div>
            </>
          )}

          {/* CHAT INTERFACE - Full conversation fields */}
          {interfaceType === 'chat' && (
            <>
              {/* Task Type for Chat */}
              <div className="space-y-2">
                <Label htmlFor="task_type" className="font-proxima-bold">
                  Task Type
                </Label>
                <Select
                  value={formData.task_type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, task_type: value }))}
                >
                  <SelectTrigger className="font-proxima">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="group">Group</SelectItem>
                    <SelectItem value="discussion">Discussion</SelectItem>
                    <SelectItem value="practice">Practice</SelectItem>
                    <SelectItem value="reflection">Reflection</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Intro */}
              <div className="space-y-2">
                <Label htmlFor="intro" className="font-proxima-bold">
                  Introduction Text
                </Label>
                <Textarea
                  id="intro"
                  value={formData.intro}
                  onChange={(e) => setFormData(prev => ({ ...prev, intro: e.target.value }))}
                  placeholder="Text shown at the start of the task (supports markdown)"
                  rows={4}
                  className="font-proxima"
                />
              </div>

              {/* Questions */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="font-proxima-bold">Guiding Questions</Label>
                  <Button
                    type="button"
                    size="sm"
                    onClick={addQuestion}
                    className="h-8 bg-[#4242EA] hover:bg-[#3535D1]"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Question
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.questions.map((question, index) => (
                    <div key={index} className="flex gap-2">
                      <Textarea
                        value={question}
                        onChange={(e) => updateQuestion(index, e.target.value)}
                        placeholder={`Question ${index + 1}`}
                        rows={2}
                        className="font-proxima flex-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeQuestion(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Linked Resources */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="font-proxima-bold">Linked Resources</Label>
                  <Button
                    type="button"
                    size="sm"
                    onClick={addResource}
                    className="h-8 bg-[#4242EA] hover:bg-[#3535D1]"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Resource
                  </Button>
                </div>
                <div className="space-y-4">
                  {formData.linked_resources.map((resource, index) => (
                    <div key={index} className="border border-[#E3E3E3] rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <Label className="font-proxima text-sm">Resource {index + 1}</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeResource(index)}
                          className="h-6 w-6 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs text-[#666]">Title</Label>
                          <Input
                            value={resource.title}
                            onChange={(e) => updateResource(index, 'title', e.target.value)}
                            placeholder="Resource title"
                            className="font-proxima"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-[#666]">Type</Label>
                          <Select
                            value={resource.type}
                            onValueChange={(value) => updateResource(index, 'type', value)}
                          >
                            <SelectTrigger className="font-proxima">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Article">Article</SelectItem>
                              <SelectItem value="Video">Video</SelectItem>
                              <SelectItem value="Documentation">Documentation</SelectItem>
                              <SelectItem value="Tutorial">Tutorial</SelectItem>
                              <SelectItem value="Tool">Tool</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-[#666]">URL</Label>
                        <Input
                          value={resource.url}
                          onChange={(e) => updateResource(index, 'url', e.target.value)}
                          placeholder="https://..."
                          className="font-proxima"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-[#666]">Description</Label>
                        <Textarea
                          value={resource.description}
                          onChange={(e) => updateResource(index, 'description', e.target.value)}
                          placeholder="Brief description of the resource"
                          rows={2}
                          className="font-proxima"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Conclusion */}
              <div className="space-y-2">
                <Label htmlFor="conclusion" className="font-proxima-bold">
                  Conclusion Text
                </Label>
                <Textarea
                  id="conclusion"
                  value={formData.conclusion}
                  onChange={(e) => setFormData(prev => ({ ...prev, conclusion: e.target.value }))}
                  placeholder="Text shown at the end of the task"
                  rows={3}
                  className="font-proxima"
                />
              </div>

              {/* Deliverable */}
              <div className="border-t border-[#E3E3E3] pt-6 mt-6">
                <h3 className="font-proxima-bold text-[#1E1E1E] mb-4">Deliverable Configuration</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="deliverable" className="font-proxima-bold">
                      Deliverable Description
                    </Label>
                    <Input
                      id="deliverable"
                      value={formData.deliverable}
                      onChange={(e) => setFormData(prev => ({ ...prev, deliverable: e.target.value }))}
                      placeholder="What learners need to submit"
                      className="font-proxima"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deliverable_type" className="font-proxima-bold">
                      Deliverable Type
                    </Label>
                    <Select
                      value={formData.deliverable_type || 'text'}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, deliverable_type: value }))}
                    >
                      <SelectTrigger className="font-proxima">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None (no submission UI)</SelectItem>
                        <SelectItem value="text">Text (conversation is deliverable)</SelectItem>
                        <SelectItem value="link">Link (shows Assignment button)</SelectItem>
                        <SelectItem value="document">Document</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                        <SelectItem value="image">Image (shows Assignment button)</SelectItem>
                        <SelectItem value="presentation">Presentation</SelectItem>
                        <SelectItem value="structured">Structured Data</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Task Settings */}
              <div className="border-t border-[#E3E3E3] pt-6 mt-6">
                <h3 className="font-proxima-bold text-[#1E1E1E] mb-4 flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-[#4242EA]" />
                  AI & Analysis Settings
                </h3>
                <div className="space-y-4">
                  {/* Conversation Mode */}
                  <div className="flex items-center justify-between bg-[#F5F5F5] border border-[#E3E3E3] rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="conversation_mode"
                        checked={formData.task_mode === 'conversation'}
                        onCheckedChange={(checked) => setFormData(prev => ({ 
                          ...prev, 
                          task_mode: checked ? 'conversation' : 'basic' 
                        }))}
                      />
                      <div>
                        <label
                          htmlFor="conversation_mode"
                          className="text-sm font-proxima-bold text-[#1E1E1E] cursor-pointer flex items-center gap-2"
                        >
                          <MessageCircle className="h-4 w-4 text-[#4242EA]" />
                          Conversation Mode
                        </label>
                        <p className="text-xs text-[#666] font-proxima mt-1">
                          Enable AI chat interaction for this task
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* AI Configuration (shown when conversation mode is enabled) */}
                  {formData.task_mode === 'conversation' && (
                    <div className="grid grid-cols-2 gap-4 pl-4">
                      <div className="space-y-2">
                        <Label htmlFor="persona" className="font-proxima-bold text-sm">
                          AI Persona (Optional)
                        </Label>
                        <Select
                          value={formData.persona || 'none'}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, persona: value === 'none' ? null : value }))}
                        >
                          <SelectTrigger className="font-proxima">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="mentor">Mentor</SelectItem>
                            <SelectItem value="engineer">Engineer</SelectItem>
                            <SelectItem value="product_manager">Product Manager</SelectItem>
                            <SelectItem value="coach">Coach</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="ai_helper_mode" className="font-proxima-bold text-sm">
                          AI Helper Mode
                        </Label>
                        <Select
                          value={formData.ai_helper_mode || 'coach_only'}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, ai_helper_mode: value === 'none' ? null : value }))}
                        >
                          <SelectTrigger className="font-proxima">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="coach_only">Coach Only</SelectItem>
                            <SelectItem value="research_partner">Research Partner</SelectItem>
                            <SelectItem value="technical_assistant">Technical Assistant</SelectItem>
                            <SelectItem value="tutor">Tutor</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {/* Graded Task */}
                  <div className="flex items-center justify-between bg-[#F5F5F5] border border-[#E3E3E3] rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="graded_task"
                        checked={formData.should_analyze}
                        onCheckedChange={(checked) => {
                          const shouldAnalyze = checked && shouldAnalyzeDeliverableType(formData.deliverable_type);
                          
                          setFormData(prev => ({ 
                            ...prev, 
                            should_analyze: checked,
                            analyze_deliverable: shouldAnalyze
                          }));
                        }}
                      />
                      <div>
                        <label
                          htmlFor="graded_task"
                          className="text-sm font-proxima-bold text-[#1E1E1E] cursor-pointer flex items-center gap-2"
                        >
                          <GraduationCap className="h-4 w-4 text-[#4242EA]" />
                          Graded Task
                        </label>
                        <p className="text-xs text-[#666] font-proxima mt-1">
                          Student submissions will be analyzed and graded
                          {formData.should_analyze && shouldAnalyzeDeliverableType(formData.deliverable_type) && (
                            <span className="block mt-1 text-green-600">✓ Deliverable will be analyzed with rubric</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-[#E3E3E3]">
          <Button
            variant="outline"
            onClick={handleClose}
            className="font-proxima"
          >
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-[#4242EA] hover:bg-[#3535D1] font-proxima"
          >
            <Plus className="h-4 w-4 mr-1" />
            {isSaving ? 'Creating...' : 'Create Task'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskCreateDialog;
