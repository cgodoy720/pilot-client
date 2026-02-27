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
import { Plus, Trash2, History, Save, X, Clock, GraduationCap, MessageCircle, ArrowRight, Coffee, FileQuestion, ClipboardCheck } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL;

const TaskEditDialog = ({ 
  open, 
  onOpenChange, 
  task, 
  onSave,
  onViewFieldHistory,
  onMoveTask,
  canEdit = true,
  token
}) => {
  // Determine interface type based on task configuration
  const getInterfaceType = (taskData) => {
    if (taskData.feedback_slot && taskData.feedback_slot !== 'none') {
      return 'survey';
    }
    if (taskData.task_type === 'assessment') {
      return 'assessment';
    }
    if (taskData.task_type === 'break') {
      return 'break';
    }
    return 'chat'; // Default conversation/chat interface
  };

  const handleFieldHistory = (fieldName) => {
    if (onViewFieldHistory) {
      onViewFieldHistory(fieldName, 'task', task?.id);
    }
  };

  const [formData, setFormData] = useState({
    task_title: '',
    task_description: '',
    task_type: 'individual',
    intro: '',
    questions: [],
    linked_resources: [],
    conclusion: '',
    deliverable: '',
    deliverable_type: 'none',
    start_time: '',
    end_time: '',
    should_analyze: false,
    analyze_deliverable: false,
    task_mode: 'basic',
    feedback_slot: null,
    assessment_id: null,
    persona: null,
    ai_helper_mode: null
  });

  const [isSaving, setIsSaving] = useState(false);
  const [assessments, setAssessments] = useState([]);
  const [loadingAssessments, setLoadingAssessments] = useState(false);
  const interfaceType = getInterfaceType(formData);

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

  // Helper function to determine if deliverable type should be analyzed
  const shouldAnalyzeDeliverableType = (deliverableType) => {
    // Analyzable types: anything substantial (not text or none)
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

  useEffect(() => {
    if (task) {
      setFormData({
        task_title: task.task_title || '',
        task_description: task.task_description || '',
        task_type: task.task_type || 'individual',
        intro: task.intro || '',
        questions: Array.isArray(task.questions) ? task.questions : [],
        linked_resources: Array.isArray(task.linked_resources) 
          ? task.linked_resources 
          : typeof task.linked_resources === 'string'
          ? []
          : [],
        conclusion: task.conclusion || '',
        deliverable: task.deliverable || '',
        deliverable_type: task.deliverable_type || 'none',
        start_time: task.start_time || '',
        end_time: task.end_time || '',
        should_analyze: task.should_analyze || false,
        analyze_deliverable: task.analyze_deliverable || false,
        task_mode: task.task_mode || 'basic',
        feedback_slot: task.feedback_slot || null,
        assessment_id: task.assessment_id || null,
        persona: task.persona || null,
        ai_helper_mode: task.ai_helper_mode || null
      });
    }
  }, [task]);

  const handleSave = async () => {
    if (!formData.task_title.trim()) {
      toast.error('Task title is required');
      return;
    }

    setIsSaving(true);
    try {
      await onSave?.(task.id, formData);
      toast.success('Task updated successfully');
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to save task');
      console.error('Error saving task:', error);
    } finally {
      setIsSaving(false);
    }
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-proxima-bold text-xl flex items-center gap-2">
            {interfaceType === 'chat' && <MessageCircle className="h-5 w-5 text-blue-600" />}
            {interfaceType === 'survey' && <FileQuestion className="h-5 w-5 text-purple-600" />}
            {interfaceType === 'assessment' && <ClipboardCheck className="h-5 w-5 text-green-600" />}
            {interfaceType === 'break' && <Coffee className="h-5 w-5 text-amber-600" />}
            {canEdit ? 'Edit Task' : 'View Task'}
          </DialogTitle>
          <DialogDescription className="font-proxima text-[#666]">
            {canEdit ? 'Make changes to the task fields below.' : 'Task details (read-only)'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Interface Type Selector */}
          {canEdit && (
            <div className="space-y-3">
              <Label className="font-proxima-bold">Task Interface Type</Label>
              <div className="grid grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, task_type: 'individual', feedback_slot: null }))}
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                    interfaceType === 'chat'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <MessageCircle className={`h-5 w-5 ${interfaceType === 'chat' ? 'text-blue-600' : 'text-gray-400'}`} />
                  <span className={`text-xs font-proxima-bold ${interfaceType === 'chat' ? 'text-blue-900' : 'text-gray-600'}`}>
                    Chat
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, task_type: 'individual', feedback_slot: 'weekly' }))}
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                    interfaceType === 'survey'
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <FileQuestion className={`h-5 w-5 ${interfaceType === 'survey' ? 'text-purple-600' : 'text-gray-400'}`} />
                  <span className={`text-xs font-proxima-bold ${interfaceType === 'survey' ? 'text-purple-900' : 'text-gray-600'}`}>
                    Survey
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, task_type: 'assessment', feedback_slot: null }))}
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                    interfaceType === 'assessment'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <ClipboardCheck className={`h-5 w-5 ${interfaceType === 'assessment' ? 'text-green-600' : 'text-gray-400'}`} />
                  <span className={`text-xs font-proxima-bold ${interfaceType === 'assessment' ? 'text-green-900' : 'text-gray-600'}`}>
                    Assessment
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, task_type: 'break', feedback_slot: null }))}
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                    interfaceType === 'break'
                      ? 'border-amber-500 bg-amber-50'
                      : 'border-gray-200 hover:border-amber-300'
                  }`}
                >
                  <Coffee className={`h-5 w-5 ${interfaceType === 'break' ? 'text-amber-600' : 'text-gray-400'}`} />
                  <span className={`text-xs font-proxima-bold ${interfaceType === 'break' ? 'text-amber-900' : 'text-gray-600'}`}>
                    Break
                  </span>
                </button>
              </div>
            </div>
          )}

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
                <div className="flex items-center justify-between">
                  <Label htmlFor="assessment_id" className="font-proxima-bold text-sm">
                    Assessment *
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFieldHistory('assessment_id')}
                    className="h-8 text-[#666] hover:text-[#4242EA]"
                  >
                    <History className="h-4 w-4 mr-1" />
                    History
                  </Button>
                </div>
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
                    disabled={!canEdit}
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

          {/* Task Title */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="task_title" className="font-proxima-bold">
                Task Title *
              </Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleFieldHistory('task_title')}
                className="h-8 text-[#666] hover:text-[#4242EA]"
              >
                <History className="h-4 w-4 mr-1" />
                History
              </Button>
            </div>
            <Input
              id="task_title"
              value={formData.task_title}
              onChange={(e) => setFormData(prev => ({ ...prev, task_title: e.target.value }))}
              disabled={!canEdit}
              className="font-proxima"
            />
          </div>

          {/* Description - Hidden for assessments and breaks */}
          {interfaceType !== 'assessment' && interfaceType !== 'break' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="task_description" className="font-proxima-bold">
                  Description
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFieldHistory('task_description')}
                  className="h-8 text-[#666] hover:text-[#4242EA]"
                >
                  <History className="h-4 w-4 mr-1" />
                  History
                </Button>
              </div>
              <Textarea
                id="task_description"
                value={formData.task_description}
                onChange={(e) => setFormData(prev => ({ ...prev, task_description: e.target.value }))}
                disabled={!canEdit}
                rows={3}
                className="font-proxima"
              />
            </div>
          )}

          {/* Time Slots */}
          <div className="border-t border-[#E3E3E3] pt-6 mt-6">
            <h3 className="font-proxima-bold text-[#1E1E1E] mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-[#4242EA]" />
              Time & Schedule
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="start_time" className="font-proxima-bold">
                    Start Time
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFieldHistory('start_time')}
                    className="h-8 text-[#666] hover:text-[#4242EA]"
                  >
                    <History className="h-4 w-4 mr-1" />
                    History
                  </Button>
                </div>
                <Input
                  id="start_time"
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                  disabled={!canEdit}
                  className="font-proxima"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="end_time" className="font-proxima-bold">
                    End Time
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFieldHistory('end_time')}
                    className="h-8 text-[#666] hover:text-[#4242EA]"
                  >
                    <History className="h-4 w-4 mr-1" />
                    History
                  </Button>
                </div>
                <Input
                  id="end_time"
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                  disabled={!canEdit}
                  className="font-proxima"
                />
              </div>
            </div>
          </div>

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
                <div className="flex items-center justify-between">
                  <Label htmlFor="intro" className="font-proxima-bold text-sm">
                    Break Message (Optional)
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFieldHistory('intro')}
                    className="h-8 text-[#666] hover:text-[#4242EA]"
                  >
                    <History className="h-4 w-4 mr-1" />
                    History
                  </Button>
                </div>
                <Textarea
                  id="intro"
                  value={formData.intro}
                  onChange={(e) => setFormData(prev => ({ ...prev, intro: e.target.value }))}
                  disabled={!canEdit}
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
                  <div className="flex items-center justify-between">
                    <Label htmlFor="feedback_slot" className="font-proxima-bold text-sm">
                      Survey Type *
                    </Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFieldHistory('feedback_slot')}
                      className="h-8 text-[#666] hover:text-[#4242EA]"
                    >
                      <History className="h-4 w-4 mr-1" />
                      History
                    </Button>
                  </div>
                  <Select
                    value={formData.feedback_slot || 'weekly'}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, feedback_slot: value }))}
                    disabled={!canEdit}
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="intro" className="font-proxima-bold">
                    Survey Introduction (Optional)
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFieldHistory('intro')}
                    className="h-8 text-[#666] hover:text-[#4242EA]"
                  >
                    <History className="h-4 w-4 mr-1" />
                    History
                  </Button>
                </div>
                <Textarea
                  id="intro"
                  value={formData.intro}
                  onChange={(e) => setFormData(prev => ({ ...prev, intro: e.target.value }))}
                  disabled={!canEdit}
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
              {/* Intro */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="intro" className="font-proxima-bold">
                    Introduction Text
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFieldHistory('intro')}
                    className="h-8 text-[#666] hover:text-[#4242EA]"
                  >
                    <History className="h-4 w-4 mr-1" />
                    History
                  </Button>
                </div>
                <Textarea
                  id="intro"
                  value={formData.intro}
                  onChange={(e) => setFormData(prev => ({ ...prev, intro: e.target.value }))}
                  disabled={!canEdit}
                  rows={4}
                  className="font-proxima"
                />
              </div>

              {/* Questions */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="font-proxima-bold">Questions</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFieldHistory('questions')}
                      className="h-8 text-[#666] hover:text-[#4242EA]"
                    >
                      <History className="h-4 w-4 mr-1" />
                      History
                    </Button>
                    {canEdit && (
                      <Button
                        type="button"
                        size="sm"
                        onClick={addQuestion}
                        className="h-8 bg-[#4242EA] hover:bg-[#3535D1]"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Question
                      </Button>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  {formData.questions.map((question, index) => (
                    <div key={index} className="flex gap-2">
                      <Textarea
                        value={question}
                        onChange={(e) => updateQuestion(index, e.target.value)}
                        disabled={!canEdit}
                        placeholder={`Question ${index + 1}`}
                        rows={2}
                        className="font-proxima flex-1"
                      />
                      {canEdit && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeQuestion(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Linked Resources */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="font-proxima-bold">Linked Resources</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFieldHistory('linked_resources')}
                      className="h-8 text-[#666] hover:text-[#4242EA]"
                    >
                      <History className="h-4 w-4 mr-1" />
                      History
                    </Button>
                    {canEdit && (
                      <Button
                        type="button"
                        size="sm"
                        onClick={addResource}
                        className="h-8 bg-[#4242EA] hover:bg-[#3535D1]"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Resource
                      </Button>
                    )}
                  </div>
                </div>
                <div className="space-y-4">
                  {formData.linked_resources.map((resource, index) => (
                    <div key={index} className="border border-[#E3E3E3] rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <Label className="font-proxima text-sm">Resource {index + 1}</Label>
                        {canEdit && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeResource(index)}
                            className="h-6 w-6 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs text-[#666]">Title</Label>
                          <Input
                            value={resource.title}
                            onChange={(e) => updateResource(index, 'title', e.target.value)}
                            disabled={!canEdit}
                            className="font-proxima"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-[#666]">Type</Label>
                          <Select
                            value={resource.type}
                            onValueChange={(value) => updateResource(index, 'type', value)}
                            disabled={!canEdit}
                          >
                            <SelectTrigger className="font-proxima">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="article">Article</SelectItem>
                              <SelectItem value="video">Video</SelectItem>
                              <SelectItem value="documentation">Documentation</SelectItem>
                              <SelectItem value="tutorial">Tutorial</SelectItem>
                              <SelectItem value="tool">Tool</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-[#666]">URL</Label>
                        <Input
                          value={resource.url}
                          onChange={(e) => updateResource(index, 'url', e.target.value)}
                          disabled={!canEdit}
                          placeholder="https://..."
                          className="font-proxima"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-[#666]">Description</Label>
                        <Textarea
                          value={resource.description}
                          onChange={(e) => updateResource(index, 'description', e.target.value)}
                          disabled={!canEdit}
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="conclusion" className="font-proxima-bold">
                    Conclusion Text
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFieldHistory('conclusion')}
                    className="h-8 text-[#666] hover:text-[#4242EA]"
                  >
                    <History className="h-4 w-4 mr-1" />
                    History
                  </Button>
                </div>
                <Textarea
                  id="conclusion"
                  value={formData.conclusion}
                  onChange={(e) => setFormData(prev => ({ ...prev, conclusion: e.target.value }))}
                  disabled={!canEdit}
                  rows={4}
                  className="font-proxima"
                />
              </div>

              {/* Deliverable */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="deliverable" className="font-proxima-bold">
                      Deliverable
                    </Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFieldHistory('deliverable')}
                      className="h-8 text-[#666] hover:text-[#4242EA]"
                    >
                      <History className="h-4 w-4 mr-1" />
                      History
                    </Button>
                  </div>
                  <Input
                    id="deliverable"
                    value={formData.deliverable}
                    onChange={(e) => setFormData(prev => ({ ...prev, deliverable: e.target.value }))}
                    disabled={!canEdit}
                    className="font-proxima"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deliverable_type" className="font-proxima-bold">
                    Deliverable Type
                  </Label>
                  <Select
                    value={formData.deliverable_type || 'none'}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, deliverable_type: value }))}
                    disabled={!canEdit}
                  >
                    <SelectTrigger className="font-proxima">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="link">Link</SelectItem>
                      <SelectItem value="document">Document</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="image">Image</SelectItem>
                      <SelectItem value="presentation">Presentation</SelectItem>
                      <SelectItem value="structured">Structured Data</SelectItem>
                      <SelectItem value="assessment">Assessment</SelectItem>
                      <SelectItem value="feedback">Feedback</SelectItem>
                      <SelectItem value="commitment">Commitment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Task Settings */}
              <div className="border-t border-[#E3E3E3] pt-6 mt-6">
                <h3 className="font-proxima-bold text-[#1E1E1E] mb-4 flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-[#4242EA]" />
                  Task Settings
                </h3>
                <div className="space-y-4">
                  {/* Conversation Mode Checkbox */}
                  <div className="flex items-center justify-between bg-[#F5F5F5] border border-[#E3E3E3] rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="conversation_mode"
                        checked={formData.task_mode === 'conversation'}
                        onCheckedChange={(checked) => setFormData(prev => ({ 
                          ...prev, 
                          task_mode: checked ? 'conversation' : 'basic' 
                        }))}
                        disabled={!canEdit}
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
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFieldHistory('task_mode')}
                      className="h-8 text-[#666] hover:text-[#4242EA]"
                    >
                      <History className="h-4 w-4 mr-1" />
                      History
                    </Button>
                  </div>

                  {/* Graded Task Checkbox */}
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
                        disabled={!canEdit}
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
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFieldHistory('should_analyze')}
                      className="h-8 text-[#666] hover:text-[#4242EA]"
                    >
                      <History className="h-4 w-4 mr-1" />
                      History
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-[#E3E3E3]">
          {/* Move Task Button (left side) */}
          {canEdit && (
            <Button
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                onMoveTask?.();
              }}
              className="border-[#C8C8C8] text-[#666] hover:border-[#4242EA] hover:text-[#4242EA] font-proxima"
            >
              <ArrowRight className="h-4 w-4 mr-1" />
              Move to Different Day
            </Button>
          )}
          
          {/* Save/Cancel Buttons (right side) */}
          <div className="flex gap-2 ml-auto">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="font-proxima"
            >
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            {canEdit && (
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-[#4242EA] hover:bg-[#3535D1] font-proxima"
              >
                <Save className="h-4 w-4 mr-1" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskEditDialog;
