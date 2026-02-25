import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { CheckCircle2, Circle, ArrowLeft, ArrowRight, Mail } from 'lucide-react';
import Swal from 'sweetalert2';

// Import step components
import ProgramDetails from './components/ProgramDetails';
import AttendancePolicy from './components/AttendancePolicy';
import SlackSetup from './components/SlackSetup';
import PursuitEmail from './components/PursuitEmail';
import GoogleCalendar from './components/GoogleCalendar';
import KisiSetup from './components/KisiSetup';
import BuildingInPublic from './components/BuildingInPublic';
import EngageTechNews from './components/EngageTechNews';
import CheckEmailSuccess from './components/CheckEmailSuccess';

const STEP_COMPONENTS = [
  { component: ProgramDetails, title: 'Review Program Details and Requirements', order: 1 },
  { component: AttendancePolicy, title: 'Review the Attendance Policy & Calendar', order: 2 },
  { component: SlackSetup, title: 'Join Slack and the AI-Native Builder channel', order: 3 },
  { component: PursuitEmail, title: 'Set-Up your Pursuit email', order: 4 },
  { component: GoogleCalendar, title: 'Set up your Google Calendar', order: 5 },
  { component: KisiSetup, title: 'Download & Sign into Kisi', order: 6 },
  { component: BuildingInPublic, title: 'Building in Public', order: 7 },
  { component: EngageTechNews, title: 'Engage with Tech news', order: 8 }
];

function OnboardingWizard({ user, applicantId, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [tasks, setTasks] = useState([]);
  const [completionStatus, setCompletionStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [creatingAccount, setCreatingAccount] = useState(false);

  // Load onboarding tasks and completion status
  useEffect(() => {
    loadOnboardingData();
  }, [applicantId]);

  const loadOnboardingData = async () => {
    try {
      setLoading(true);
      
      // Load tasks with completion status
      const tasksResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/api/onboarding/tasks?applicantId=${applicantId}`
      );
      
      if (tasksResponse.ok) {
        const tasksData = await tasksResponse.json();
        setTasks(tasksData);
      } else {
        console.error('Failed to load tasks, status:', tasksResponse.status);
        // If backend isn't ready, create placeholder tasks
        const placeholderTasks = STEP_COMPONENTS.map((step, index) => ({
          task_id: index + 1,
          title: step.title,
          description: `Complete this task: ${step.title}`,
          detailed_description: `Complete this onboarding task: ${step.title}`,
          link_url: null,
          link_text: null,
          is_required: true,
          display_order: index + 1,
          is_active: true,
          is_completed: false,
          completion_id: null,
          completed_at: null,
          notes: null
        }));
        setTasks(placeholderTasks);
      }

      // Load completion summary
      const statusResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/api/onboarding/status/${applicantId}`
      );
      
      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        setCompletionStatus(statusData);
      } else {
        // Create placeholder status
        setCompletionStatus({
          total_tasks: 8,
          required_tasks: 8,
          completed_tasks: 0,
          completed_required_tasks: 0,
          all_required_completed: false
        });
      }
    } catch (error) {
      console.error('Error loading onboarding data:', error);
      
      // Create fallback data so the UI still works
      const placeholderTasks = STEP_COMPONENTS.map((step, index) => ({
        task_id: index + 1,
        title: step.title,
        description: `Complete this task: ${step.title}`,
        detailed_description: `Complete this onboarding task: ${step.title}`,
        link_url: null,
        link_text: null,
        is_required: true,
        display_order: index + 1,
        is_active: true,
        is_completed: false,
        completion_id: null,
        completed_at: null,
        notes: null
      }));
      setTasks(placeholderTasks);
      
      setCompletionStatus({
        total_tasks: 8,
        required_tasks: 8,
        completed_tasks: 0,
        completed_required_tasks: 0,
        all_required_completed: false
      });

      Swal.fire({
        icon: 'warning',
        title: 'Backend Not Ready',
        text: 'The onboarding system backend is not yet available. You can preview the interface, but task completion won\'t be saved until the database is set up.',
        confirmButtonColor: '#4242ea'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTaskComplete = async (taskId, isCompleted) => {
    if (!taskId) {
      console.error('Task ID is undefined');
      return;
    }

    // Optimistically update local state immediately for better UX
    const updatedTasks = tasks.map(task => 
      task.task_id === taskId 
        ? { ...task, is_completed: isCompleted, completed_at: isCompleted ? new Date().toISOString() : null }
        : task
    );
    setTasks(updatedTasks);
    
    // Update completion status locally
    const completedCount = updatedTasks.filter(t => t.is_completed).length;
    const requiredCount = updatedTasks.filter(t => t.is_required).length;
    const completedRequiredCount = updatedTasks.filter(t => t.is_completed && t.is_required).length;
    
    setCompletionStatus(prev => ({
      ...prev,
      completed_tasks: completedCount,
      completed_required_tasks: completedRequiredCount,
      all_required_completed: completedRequiredCount === requiredCount
    }));

    // Then sync with backend (fire and forget, with error handling)
    try {
      const url = `${import.meta.env.VITE_API_URL}/api/onboarding/tasks/${taskId}/complete`;
      
      if (isCompleted) {
        // Mark as complete
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ applicantId })
        });
        
        if (!response.ok) {
          throw new Error('Failed to mark task as complete');
        }
      } else {
        // Mark as incomplete
        const response = await fetch(url, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ applicantId })
        });
        
        if (!response.ok) {
          throw new Error('Failed to mark task as incomplete');
        }
      }
    } catch (error) {
      console.error('Error syncing task completion with backend:', error);
      
      // Only show error and revert if it's a real backend error (not network/500)
      if (!error.message.includes('Failed to fetch') && !error.message.includes('500')) {
        // Revert the optimistic update on error
        setTasks(tasks);
        
        // Revert completion status
        const revertedCompletedCount = tasks.filter(t => t.is_completed).length;
        const revertedRequiredCount = tasks.filter(t => t.is_required).length;
        const revertedCompletedRequiredCount = tasks.filter(t => t.is_completed && t.is_required).length;
        
        setCompletionStatus(prev => ({
          ...prev,
          completed_tasks: revertedCompletedCount,
          completed_required_tasks: revertedCompletedRequiredCount,
          all_required_completed: revertedCompletedRequiredCount === revertedRequiredCount
        }));
        
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to update task completion. Please try again.',
          confirmButtonColor: '#4242ea'
        });
      }
      // If backend isn't ready (network error or 500), just keep the local state
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleNextStep = () => {
    if (currentStep < STEP_COMPONENTS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleCreateBuilderAccount = async () => {
    try {
      setCreatingAccount(true);
      
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/onboarding/create-builder-account`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            applicantId,
            personalEmail: user.email
          })
        }
      );

      const data = await response.json();

      if (response.ok) {
        setShowSuccessScreen(true);
      } else {
        throw new Error(data.error || 'Failed to create builder account');
      }
    } catch (error) {
      console.error('Error creating builder account:', error);
      Swal.fire({
        icon: 'error',
        title: 'Account Creation Failed',
        text: error.message || 'Failed to create builder account. Please try again.',
        confirmButtonColor: '#4242ea'
      });
    } finally {
      setCreatingAccount(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-[#1E1E1E] text-xl">Loading onboarding tasks...</div>
      </div>
    );
  }

  if (showSuccessScreen) {
    return (
      <CheckEmailSuccess 
        user={user}
        onBackToDashboard={onComplete}
      />
    );
  }

  // Match tasks with components by display_order
  const getTaskForStep = (stepIndex) => {
    const expectedOrder = stepIndex + 1; // display_order is 1-based
    return tasks.find(task => task.display_order === expectedOrder);
  };

  const currentTask = getTaskForStep(currentStep);
  const CurrentStepComponent = STEP_COMPONENTS[currentStep]?.component;

  const isAllRequiredCompleted = completionStatus?.all_required_completed || false;
  const completedCount = completionStatus?.completed_required_tasks || 0;
  const totalRequired = completionStatus?.required_tasks || 8;

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="flex flex-col lg:flex-row min-h-[600px]">
        {/* Progress Sidebar */}
        <div className="lg:w-80 bg-[#F8F9FA] border-r border-[#E5E7EB] p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-[#1E1E1E] mb-2">
              Onboarding Progress
            </h2>
            <div className="text-sm text-[#666]">
              {completedCount} of {totalRequired} required tasks completed
            </div>
            <div className="w-full bg-[#E5E7EB] rounded-full h-2 mt-2">
              <div 
                className="bg-[#4242EA] h-2 rounded-full transition-all duration-300"
                style={{ width: `${totalRequired > 0 ? (completedCount / totalRequired) * 100 : 0}%` }}
              />
            </div>
          </div>

          {/* Task List */}
          <div className="space-y-3">
            {STEP_COMPONENTS.map((stepComponent, index) => {
              const task = getTaskForStep(index);
              return (
                <div
                  key={index}
                  className={`
                    flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors
                    ${currentStep === index ? 'bg-[#4242EA] text-white' : 'hover:bg-[#E5E7EB]'}
                  `}
                  onClick={() => setCurrentStep(index)}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {task?.is_completed ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <Circle className={`h-5 w-5 ${currentStep === index ? 'text-white' : 'text-[#666]'}`} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium leading-tight ${currentStep === index ? 'text-white' : 'text-[#1E1E1E]'}`}>
                      {task?.title || stepComponent.title}
                    </div>
                    {(task?.is_required !== false) && (
                      <div className={`text-xs mt-1 ${currentStep === index ? 'text-blue-100' : 'text-[#666]'}`}>
                        Required
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Create Builder Account Button */}
          <div className="mt-8 pt-6 border-t border-[#E5E7EB]">
            <Button
              onClick={handleCreateBuilderAccount}
              disabled={!isAllRequiredCompleted || creatingAccount}
              className={`
                w-full py-3 rounded-xl font-semibold text-white transition-all
                ${isAllRequiredCompleted 
                  ? 'bg-gradient-to-r from-[#4242EA] to-[#6366F1] hover:from-[#3535D1] hover:to-[#4F46E5] shadow-lg' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              {creatingAccount ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating Account...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Mail className="h-4 w-4" />
                  Create Builder Account
                </div>
              )}
            </Button>
            {!isAllRequiredCompleted && (
              <div className="text-xs text-[#666] text-center mt-2">
                Complete all required tasks to unlock
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Step Header */}
          <div className="p-6 border-b border-[#E5E7EB]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                  ${currentTask?.is_completed ? 'bg-green-500 text-white' : 'bg-[#4242EA] text-white'}
                `}>
                  {currentTask?.is_completed ? '✓' : currentStep + 1}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-[#1E1E1E]">
                    {currentTask?.title || STEP_COMPONENTS[currentStep]?.title}
                  </h1>
                  {currentTask?.is_required && (
                    <div className="text-sm text-[#666]">Required Task</div>
                  )}
                </div>
              </div>
              
              {/* Task Completion Checkbox */}
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={currentTask?.is_completed || false}
                    onChange={(e) => handleTaskComplete(currentTask?.task_id, e.target.checked)}
                    className="w-4 h-4 text-[#4242EA] border-gray-300 rounded focus:ring-[#4242EA]"
                  />
                  <span className="text-sm text-[#666]">Mark as complete</span>
                </label>
              </div>
            </div>
          </div>

          {/* Step Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {CurrentStepComponent && (
              <CurrentStepComponent 
                task={currentTask}
                onComplete={(completed) => handleTaskComplete(currentTask?.task_id, completed)}
              />
            )}
          </div>

          {/* Navigation Footer */}
          <div className="p-6 border-t border-[#E5E7EB] flex justify-between">
            <Button
              onClick={handlePreviousStep}
              disabled={currentStep === 0}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>
            
            <div className="text-sm text-[#666] flex items-center">
              Step {currentStep + 1} of {STEP_COMPONENTS.length}
            </div>

            <Button
              onClick={handleNextStep}
              disabled={currentStep === STEP_COMPONENTS.length - 1}
              className="flex items-center gap-2"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OnboardingWizard;
