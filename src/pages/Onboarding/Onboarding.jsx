import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import './Onboarding.css';

const Onboarding = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [currentApplicantId, setCurrentApplicantId] = useState(null);
  const [onboardingTasks, setOnboardingTasks] = useState([]);
  const [completionStatus, setCompletionStatus] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [visitedPages, setVisitedPages] = useState({});

  // Map task IDs to their routes
  const taskRouteMap = {
    'program-details': '/onboarding/guide',
    'task-2': '/onboarding/attendance-policy',
    'task-3': '/onboarding/slack',
    'task-4': '/onboarding/pursuit-email',
    'task-5': '/onboarding/google-calendar',
    'task-6': '/onboarding/kisi',
    'task-7': '/onboarding/building-in-public',
    'task-8': '/onboarding/engage-tech-news',
    'task-9': '/onboarding/additional-systems'
  };

  // Check if a page has been visited
  const hasVisitedPage = (taskId) => {
    // For tasks without dedicated pages, always allow completion
    if (!taskRouteMap[taskId]) {
      return true;
    }
    
    // Check localStorage for visit tracking
    const visitKey = `onboarding-visited-${taskId}`;
    return localStorage.getItem(visitKey) === 'true' || visitedPages[taskId];
  };

  // Load visited pages from localStorage on mount and when window regains focus
  useEffect(() => {
    const loadVisitedPages = () => {
      const visited = {};
      Object.keys(taskRouteMap).forEach(taskId => {
        const visitKey = `onboarding-visited-${taskId}`;
        if (localStorage.getItem(visitKey) === 'true') {
          visited[taskId] = true;
        }
      });
      setVisitedPages(visited);
    };
    
    loadVisitedPages();
    
    // Refresh visited pages when window regains focus (user returns from another page)
    const handleFocus = () => {
      loadVisitedPages();
    };
    
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  useEffect(() => {
    // Load user data from localStorage (same as Pledge page)
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        
        const loadApplicantId = async () => {
          if (!userData?.email) {
            navigate('/login');
            return;
          }
          
          try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/applications/applicant/by-email/${userData.email}`);
            if (response.ok) {
              const applicant = await response.json();
              setCurrentApplicantId(applicant.applicant_id);
              await loadOnboardingData(applicant.applicant_id);
            } else {
              navigate('/apply');
            }
          } catch (error) {
            console.error('Error loading applicant ID:', error);
            navigate('/apply');
          }
        };
        
        loadApplicantId();
      } catch (error) {
        console.error('Error parsing user data:', error);
        navigate('/login');
      }
    } else {
      // Redirect to login if no user data
      navigate('/login');
    }
  }, [navigate]);

  const loadOnboardingData = async (applicantId) => {
    try {
      // Expected task names from the user's list
      const expectedTasks = [
        { title: 'Review Program Details and Requirements', is_required: true },
        { title: 'Review the Attendance Policy and Calendar', is_required: true },
        { title: 'Join Slack and the AI-Native Builder Channel', is_required: true },
        { title: 'Set-Up Your Pursuit Email', is_required: true },
        { title: 'Set-Up Your Google Calendar', is_required: true },
        { title: 'Download and Sign Into Kisi', is_required: true },
        { title: 'Building in Public', is_required: true },
        { title: 'Engage with Tech News', is_required: true },
        { title: 'Additional Systems Set-Up (optional but encouraged)', is_required: false }
      ];
      
      // Create task list starting with program details, then map database tasks to expected tasks
      const tasksList = [];
      
      // Task 1: Review Program Details (always first)
      tasksList.push({
        task_id: 'program-details',
        title: expectedTasks[0].title,
        description: 'Review the program details, requirements, and expectations for the AI-Native program.',
        link_url: null,
        link_text: null,
        is_required: true,
        display_order: 1,
        is_completed: false,
        completion_id: null,
        completed_at: null,
        detailed_description: 'Review the program overview, schedule, payment agreement, and all requirements for participation in the AI-Native program.'
      });
      
      // Load tasks from database
      try {
        const tasksResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/admissions/onboarding-tasks?applicantId=${applicantId}`);
        if (tasksResponse.ok) {
          const tasks = await tasksResponse.json();
          
          // Map remaining tasks from database or create placeholders
          for (let i = 1; i < expectedTasks.length; i++) {
            const expectedTask = expectedTasks[i];
            // For step 2 (attendance policy), always use placeholder since it has a dedicated page
            if (i === 1 && expectedTask.title.toLowerCase().includes('attendance policy')) {
              tasksList.push({
                task_id: `task-${i + 1}`,
                title: expectedTask.title,
                description: `Complete this task: ${expectedTask.title}`,
                link_url: null,
                link_text: null,
                is_required: expectedTask.is_required !== false,
                display_order: i + 1,
                is_completed: false,
                completion_id: null,
                completed_at: null,
                detailed_description: `Complete this onboarding task: ${expectedTask.title}`
              });
              continue;
            }
            
            // Try to find matching task in database by title or use placeholder
            const matchingTask = tasks.find(t => 
              t.title.toLowerCase().includes(expectedTask.title.toLowerCase().split(' ')[0].toLowerCase())
            );
            
            if (matchingTask) {
              tasksList.push({
                ...matchingTask,
                title: expectedTask.title,
                display_order: i + 1,
                is_required: expectedTask.is_required !== false,
                detailed_description: matchingTask.description || `Complete this onboarding task: ${expectedTask.title}`
              });
            } else {
              // Create placeholder task
              tasksList.push({
                task_id: `task-${i + 1}`,
                title: expectedTask.title,
                description: `Complete this task: ${expectedTask.title}`,
                link_url: null,
                link_text: null,
                is_required: expectedTask.is_required !== false,
                display_order: i + 1,
                is_completed: false,
                completion_id: null,
                completed_at: null,
                detailed_description: `Complete this onboarding task: ${expectedTask.title}`
              });
            }
          }
        } else {
          // If API fails, create all tasks as placeholders
          for (let i = 1; i < expectedTasks.length; i++) {
            const expectedTask = expectedTasks[i];
            tasksList.push({
              task_id: `task-${i + 1}`,
              title: expectedTask.title,
              description: `Complete this task: ${expectedTask.title}`,
              link_url: null,
              link_text: null,
              is_required: expectedTask.is_required !== false,
              display_order: i + 1,
              is_completed: false,
              completion_id: null,
              completed_at: null,
              detailed_description: `Complete this onboarding task: ${expectedTask.title}`
            });
          }
        }
      } catch (taskError) {
        console.error('Error loading tasks:', taskError);
        // Create all tasks as placeholders if API fails
        for (let i = 1; i < expectedTasks.length; i++) {
          const expectedTask = expectedTasks[i];
          tasksList.push({
            task_id: `task-${i + 1}`,
            title: expectedTask.title,
            description: `Complete this task: ${expectedTask.title}`,
            link_url: null,
            link_text: null,
            is_required: expectedTask.is_required !== false,
            display_order: i + 1,
            is_completed: false,
            completion_id: null,
            completed_at: null,
            detailed_description: `Complete this onboarding task: ${expectedTask.title}`
          });
        }
      }
      
      // Load saved completion state from localStorage
      const savedState = localStorage.getItem(`onboarding-state-${applicantId}`);
      if (savedState) {
        try {
          const saved = JSON.parse(savedState);
          // Merge saved state with loaded tasks
          tasksList = tasksList.map(task => {
            const savedTask = saved.tasks?.find(t => t.task_id === task.task_id);
            return savedTask ? { ...task, is_completed: savedTask.is_completed } : task;
          });
        } catch (error) {
          console.error('Error loading saved onboarding state:', error);
        }
      }
      
      setOnboardingTasks(tasksList);
      
      // Calculate completion status directly from tasks array to ensure accuracy
      const completedCount = tasksList.filter(t => t.is_completed === true).length;
      const completedRequiredCount = tasksList.filter(t => t.is_completed === true && t.is_required !== false).length;
      const totalRequiredTasks = tasksList.filter(t => t.is_required !== false).length;
      
      // Set completion status based on actual task states
      setCompletionStatus({
        completed_tasks: completedCount,
        completed_required_tasks: completedRequiredCount,
        required_tasks: totalRequiredTasks,
        total_tasks: tasksList.length
      });
      
      // Save state to localStorage
      localStorage.setItem(`onboarding-state-${applicantId}`, JSON.stringify({
        tasks: tasksList,
        completed_tasks: completedCount,
        completed_required_tasks: completedRequiredCount
      }));
    } catch (error) {
      console.error('Error loading onboarding data:', error);
      // Ensure we always set loading to false and have some data
      setCompletionStatus({
        completed_tasks: 0,
        completed_required_tasks: 0,
        required_tasks: 8,
        total_tasks: 9
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleTaskCompletion = (task, isCompleted) => {
    // Check if the page has been visited before allowing completion
    if (!hasVisitedPage(task.task_id)) {
      Swal.fire({
        icon: 'info',
        title: 'Visit Required',
        text: `Please visit the "${task.title}" page before marking it as complete.`,
        confirmButtonText: 'Go to Page',
        showCancelButton: true,
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.isConfirmed && taskRouteMap[task.task_id]) {
          navigate(taskRouteMap[task.task_id]);
        }
      });
      return;
    }

    // For all tasks (1-9), update UI state immediately without API calls
    // This ensures no page reload and instant feedback
    
    // Update task completion status
    const updatedTasks = onboardingTasks.map(t => 
      t.task_id === task.task_id 
        ? { ...t, is_completed: !isCompleted }
        : t
    );
    setOnboardingTasks(updatedTasks);
    
    // Calculate completion counts directly from the updated tasks array
    // This ensures accuracy based on actual checked boxes
    const completedCount = updatedTasks.filter(t => t.is_completed === true).length;
    const completedRequiredCount = updatedTasks.filter(t => t.is_completed === true && t.is_required !== false).length;
    const totalRequiredTasks = updatedTasks.filter(t => t.is_required !== false).length;
    
    // Update completion status immediately based on actual task states
    setCompletionStatus({
      completed_tasks: completedCount,
      completed_required_tasks: completedRequiredCount,
      required_tasks: totalRequiredTasks,
      total_tasks: updatedTasks.length
    });
    
    // Save state to localStorage for persistence
    if (currentApplicantId) {
      localStorage.setItem(`onboarding-state-${currentApplicantId}`, JSON.stringify({
        tasks: updatedTasks,
        completed_tasks: completedCount,
        completed_required_tasks: completedRequiredCount
      }));
    }
  };

  // Check if all required tasks (steps 1-8) are completed
  const areAllTasksCompleted = () => {
    if (!onboardingTasks || onboardingTasks.length === 0) {
      return false;
    }
    // Check if all required tasks are completed (step 9 is optional)
    return onboardingTasks
      .filter(task => task.is_required !== false) // Only check required tasks
      .every(task => task.is_completed === true);
  };

  // Handle finishing onboarding
  const handleFinishOnboarding = async () => {
    if (!areAllTasksCompleted()) {
      return;
    }

    try {
      // Mark onboarding as complete in localStorage
      if (currentApplicantId) {
        const currentState = localStorage.getItem(`onboarding-state-${currentApplicantId}`);
        if (currentState) {
          const saved = JSON.parse(currentState);
          saved.completed = true;
          saved.completed_at = new Date().toISOString();
          localStorage.setItem(`onboarding-state-${currentApplicantId}`, JSON.stringify(saved));
        }
      }
      
      Swal.fire({
        icon: 'success',
        title: 'Onboarding Complete!',
        text: 'Congratulations! You have completed all onboarding steps.',
        confirmButtonText: 'Continue',
        confirmButtonColor: '#4242ea'
      }).then(() => {
        // Navigate back to dashboard
        navigate('/apply');
      });
    } catch (error) {
      console.error('Error finishing onboarding:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to complete onboarding. Please try again.',
        confirmButtonText: 'OK'
      });
    }
  };

  // Always render something, even if loading
  if (loading) {
    return (
      <div className="onboarding-page">
        <div className="onboarding-page__container">
          <div className="onboarding-page__loading">Loading onboarding...</div>
        </div>
      </div>
    );
  }

  // Ensure we have tasks before rendering
  if (!onboardingTasks || onboardingTasks.length === 0) {
    return (
      <div className="onboarding-page">
        <div className="onboarding-page__container">
          <div className="onboarding-page__loading">Setting up onboarding tasks...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="onboarding-page">
      <div className="onboarding-page__container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <button 
            onClick={() => navigate('/apply')}
            className="onboarding-page__back-button"
          >
            ← Back to Dashboard
          </button>
          {user && (
            <div style={{ fontSize: '1rem', color: '#666' }}>
              Welcome, {user.firstName || user.first_name}!
            </div>
          )}
        </div>

        <div className="onboarding-page__content">
          <h1 className="onboarding-page__title">Welcome to AI-Native Onboarding!</h1>
          
          <div className="onboarding-page__intro">
            <p>
              It's great to have you join us as a Builder for the Pursuit AI-Native December 2025 Cohort.
            </p>
            <p>
              We're excited to officially welcome you to Pursuit's AI Native Program! This program is an opportunity to explore AI in a hands-on, collaborative environment, and we can't wait to get started. Below are the key details to ensure you're prepared for a successful kickoff. Please be sure to read all materials carefully.
            </p>
          </div>

          <section className="onboarding-page__section">
            <h2 className="onboarding-page__section-title">Program Kickoff Details</h2>
            <div className="onboarding-page__details-text">
              <p><strong>Start Date:</strong> December 6th, 2025</p>
              <p><strong>Arrival Time:</strong> 9:30 AM</p>
              <p className="onboarding-page__note">(If you have requested a loaner laptop, please arrive at 9:15 AM to ensure time for proper setup)</p>
              <p><strong>Program Start Time:</strong> 10:00 AM</p>
              <p><strong>Location:</strong> Pursuit HQ, 47-10 Austell Pl 2nd floor, Long Island City, NY 11101</p>
              <p className="onboarding-page__note">Please check MTA for transit updates to ensure you arrive on time</p>
            </div>
          </section>

          <section className="onboarding-page__section">
            <h2 className="onboarding-page__section-title">Program Logistics</h2>
            <ol className="onboarding-page__numbered-list">
              <li>Please bring your laptop to all sessions moving forward.</li>
              <li>Make sure to check your email daily.</li>
              <li>Throughout this program, we will communicate via Slack and email. It's essential to check both daily to stay up to date with important information.</li>
              <li>Lunch is not provided during session, so please plan to bring it going forward.</li>
            </ol>
          </section>

          <section className="onboarding-page__section">
            <h2 className="onboarding-page__section-title">Onboarding Instructions</h2>
            <div className="onboarding-page__instructions-text">
              <p>
                Below you'll find all the resources that we will review during Systems Onboarding on December 3rd. This platform is a resource hub to help you get up to speed on program norms and operations, set up internal systems, and prepare to build. You should have received notifications with invitations to access key program systems. Detailed instructions on these systems can be found below, but we will go over everything in person together.
              </p>
              <p>
                If you have questions, feel free get in touch with the Admissions team or reach out to your fellow Builders for support — we're all one big team!
              </p>
            </div>
          </section>

          {/* Tasks List */}
          <section className="onboarding-page__section onboarding-page__tasks-section">
            <h2 className="onboarding-page__section-title">Onboarding Steps</h2>
            <div className="onboarding-page__tasks-list">
              {onboardingTasks.map((task, index) => (
                <div
                  key={task.task_id}
                  className={`onboarding-page__task ${
                    task.is_required ? 'onboarding-page__task--required' : ''
                  }`}
                >
                  <div className="onboarding-page__task-content">
                    <div className="onboarding-page__task-header">
                      <span 
                        className="onboarding-page__task-title"
                      >
                        {(task.title && task.title.toLowerCase().includes('review program details')) ? (
                          <Link 
                            to="/onboarding/guide"
                            className="onboarding-page__task-link-title"
                            onClick={() => window.scrollTo(0, 0)}
                          >
                            {task.title}
                          </Link>
                        ) : (task.title && task.title.toLowerCase().includes('review the attendance policy')) ? (
                          <Link 
                            to="/onboarding/attendance-policy"
                            className="onboarding-page__task-link-title"
                            onClick={() => window.scrollTo(0, 0)}
                          >
                            {task.title}
                          </Link>
                        ) : (task.title && task.title.toLowerCase().includes('set-up your pursuit email')) ? (
                          <Link 
                            to="/onboarding/pursuit-email"
                            className="onboarding-page__task-link-title"
                            onClick={() => window.scrollTo(0, 0)}
                          >
                            {task.title}
                          </Link>
                        ) : (task.title && task.title.toLowerCase().includes('set-up your google calendar')) ? (
                          <Link 
                            to="/onboarding/google-calendar"
                            className="onboarding-page__task-link-title"
                            onClick={() => window.scrollTo(0, 0)}
                          >
                            {task.title}
                          </Link>
                        ) : (task.title && task.title.toLowerCase().includes('join slack')) ? (
                          <Link 
                            to="/onboarding/slack"
                            className="onboarding-page__task-link-title"
                            onClick={() => window.scrollTo(0, 0)}
                          >
                            {task.title}
                          </Link>
                        ) : (task.title && task.title.toLowerCase().includes('download and sign into kisi')) ? (
                          <Link 
                            to="/onboarding/kisi"
                            className="onboarding-page__task-link-title"
                            onClick={() => window.scrollTo(0, 0)}
                          >
                            {task.title}
                          </Link>
                        ) : (task.title && task.title.toLowerCase().includes('building in public')) ? (
                          <Link 
                            to="/onboarding/building-in-public"
                            className="onboarding-page__task-link-title"
                            onClick={() => window.scrollTo(0, 0)}
                          >
                            {task.title}
                          </Link>
                        ) : (task.title && task.title.toLowerCase().includes('engage with tech news')) ? (
                          <Link 
                            to="/onboarding/engage-tech-news"
                            className="onboarding-page__task-link-title"
                            onClick={() => window.scrollTo(0, 0)}
                          >
                            {task.title}
                          </Link>
                        ) : (task.title && task.title.toLowerCase().includes('additional systems')) ? (
                          <Link 
                            to="/onboarding/additional-systems"
                            className="onboarding-page__task-link-title"
                            onClick={() => window.scrollTo(0, 0)}
                          >
                            {task.title}
                          </Link>
                        ) : (
                          task.title
                        )}
                      </span>
                    </div>

                    {task.description && (
                      <div className="onboarding-page__task-description">{task.description}</div>
                    )}


                    {task.link_url && (
                      <div className="onboarding-page__task-actions">
                        <a
                          href={task.link_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="onboarding-page__task-link"
                        >
                          {task.link_text || 'Open Link'} →
                        </a>
                      </div>
                    )}

                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Task Detail Modal */}
        {selectedTask && (
          <div 
            className="onboarding-page__modal-overlay"
            onClick={() => setSelectedTask(null)}
          >
            <div 
              className="onboarding-page__modal"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="onboarding-page__modal-close"
                onClick={() => setSelectedTask(null)}
              >
                ×
              </button>
              <h2 className="onboarding-page__modal-title">{selectedTask.title}</h2>
              <div className="onboarding-page__modal-description">
                {selectedTask.detailed_description || selectedTask.description || 'Complete this onboarding step to prepare for the program.'}
              </div>
              {selectedTask.link_url && (
                <a
                  href={selectedTask.link_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="onboarding-page__modal-button"
                >
                  {selectedTask.link_text || 'Open Link'} →
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;

