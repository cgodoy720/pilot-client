// @ts-nocheck
function stryNS_9fa48() {
  var g = typeof globalThis === 'object' && globalThis && globalThis.Math === Math && globalThis || new Function("return this")();
  var ns = g.__stryker__ || (g.__stryker__ = {});
  if (ns.activeMutant === undefined && g.process && g.process.env && g.process.env.__STRYKER_ACTIVE_MUTANT__) {
    ns.activeMutant = g.process.env.__STRYKER_ACTIVE_MUTANT__;
  }
  function retrieveNS() {
    return ns;
  }
  stryNS_9fa48 = retrieveNS;
  return retrieveNS();
}
stryNS_9fa48();
function stryCov_9fa48() {
  var ns = stryNS_9fa48();
  var cov = ns.mutantCoverage || (ns.mutantCoverage = {
    static: {},
    perTest: {}
  });
  function cover() {
    var c = cov.static;
    if (ns.currentTestId) {
      c = cov.perTest[ns.currentTestId] = cov.perTest[ns.currentTestId] || {};
    }
    var a = arguments;
    for (var i = 0; i < a.length; i++) {
      c[a[i]] = (c[a[i]] || 0) + 1;
    }
  }
  stryCov_9fa48 = cover;
  cover.apply(null, arguments);
}
function stryMutAct_9fa48(id) {
  var ns = stryNS_9fa48();
  function isActive(id) {
    if (ns.activeMutant === id) {
      if (ns.hitCount !== void 0 && ++ns.hitCount > ns.hitLimit) {
        throw new Error('Stryker: Hit count limit reached (' + ns.hitCount + ')');
      }
      return true;
    }
    return false;
  }
  stryMutAct_9fa48 = isActive;
  return isActive(id);
}
import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaUsers, FaBook, FaArrowLeft, FaArrowRight, FaCalendarAlt, FaPaperPlane, FaCheck, FaTimes, FaLink, FaExternalLinkAlt, FaFileAlt, FaVideo, FaBars, FaBrain, FaComments, FaClipboardList } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../../context/AuthContext';
import PeerFeedbackForm from '../../components/PeerFeedbackForm';
import BuilderFeedbackForm from '../../components/BuilderFeedbackForm/BuilderFeedbackForm';
import TaskSubmission from '../../components/TaskSubmission/TaskSubmission';
import AnalysisModal from '../../components/AnalysisModal/AnalysisModal';
import './PastSession.css';
import '../../styles/smart-tasks.css';
function PastSession() {
  if (stryMutAct_9fa48("23583")) {
    {}
  } else {
    stryCov_9fa48("23583");
    const [searchParams] = useSearchParams();
    const dayId = searchParams.get(stryMutAct_9fa48("23584") ? "" : (stryCov_9fa48("23584"), 'dayId'));
    const dayNumber = searchParams.get(stryMutAct_9fa48("23585") ? "" : (stryCov_9fa48("23585"), 'dayNumber'));
    const cohort = searchParams.get(stryMutAct_9fa48("23586") ? "" : (stryCov_9fa48("23586"), 'cohort'));
    const {
      token,
      user
    } = useAuth();
    const navigate = useNavigate();

    // Check if user has active status
    const isActive = stryMutAct_9fa48("23589") ? user?.active === false : stryMutAct_9fa48("23588") ? false : stryMutAct_9fa48("23587") ? true : (stryCov_9fa48("23587", "23588", "23589"), (stryMutAct_9fa48("23590") ? user.active : (stryCov_9fa48("23590"), user?.active)) !== (stryMutAct_9fa48("23591") ? true : (stryCov_9fa48("23591"), false)));
    const [daySchedule, setDaySchedule] = useState(null);
    const [isLoading, setIsLoading] = useState(stryMutAct_9fa48("23592") ? false : (stryCov_9fa48("23592"), true));
    const [tasksLoading, setTasksLoading] = useState(stryMutAct_9fa48("23593") ? true : (stryCov_9fa48("23593"), false));
    const [error, setError] = useState(null);
    const [tasks, setTasks] = useState(stryMutAct_9fa48("23594") ? ["Stryker was here"] : (stryCov_9fa48("23594"), []));
    const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
    const [messages, setMessages] = useState(stryMutAct_9fa48("23595") ? ["Stryker was here"] : (stryCov_9fa48("23595"), []));
    const [messagesLoading, setMessagesLoading] = useState(stryMutAct_9fa48("23596") ? true : (stryCov_9fa48("23596"), false));
    const [isPastSession, setIsPastSession] = useState(stryMutAct_9fa48("23597") ? false : (stryCov_9fa48("23597"), true));

    // Add new state variables for message input and sending
    const [newMessage, setNewMessage] = useState(stryMutAct_9fa48("23598") ? "Stryker was here!" : (stryCov_9fa48("23598"), ''));
    const [isSending, setIsSending] = useState(stryMutAct_9fa48("23599") ? true : (stryCov_9fa48("23599"), false));
    const [isAiThinking, setIsAiThinking] = useState(stryMutAct_9fa48("23600") ? true : (stryCov_9fa48("23600"), false));

    // Add state variables for message editing
    const [editingMessageId, setEditingMessageId] = useState(null);
    const [editMessageContent, setEditMessageContent] = useState(stryMutAct_9fa48("23601") ? "Stryker was here!" : (stryCov_9fa48("23601"), ''));
    const [isUpdating, setIsUpdating] = useState(stryMutAct_9fa48("23602") ? true : (stryCov_9fa48("23602"), false));

    // Add new lazy loading and rate limiting states
    const [isLazyLoading, setIsLazyLoading] = useState(stryMutAct_9fa48("23603") ? true : (stryCov_9fa48("23603"), false));
    const [rateLimitHit, setRateLimitHit] = useState(stryMutAct_9fa48("23604") ? true : (stryCov_9fa48("23604"), false));

    // Add state for the submission modal
    const [showSubmissionModal, setShowSubmissionModal] = useState(stryMutAct_9fa48("23605") ? true : (stryCov_9fa48("23605"), false));
    const [submissionUrl, setSubmissionUrl] = useState(stryMutAct_9fa48("23606") ? "Stryker was here!" : (stryCov_9fa48("23606"), ''));
    const [isSubmitting, setIsSubmitting] = useState(stryMutAct_9fa48("23607") ? true : (stryCov_9fa48("23607"), false));
    const [submissionError, setSubmissionError] = useState(stryMutAct_9fa48("23608") ? "Stryker was here!" : (stryCov_9fa48("23608"), ''));

    // Add peer feedback state
    const [showPeerFeedback, setShowPeerFeedback] = useState(stryMutAct_9fa48("23609") ? true : (stryCov_9fa48("23609"), false));
    const [peerFeedbackCompleted, setPeerFeedbackCompleted] = useState(stryMutAct_9fa48("23610") ? true : (stryCov_9fa48("23610"), false));

    // Add state for task analysis
    const [isAnalyzing, setIsAnalyzing] = useState(stryMutAct_9fa48("23611") ? true : (stryCov_9fa48("23611"), false));
    const [analysisResults, setAnalysisResults] = useState(null);
    const [analysisError, setAnalysisError] = useState(null);
    const [availableAnalyses, setAvailableAnalyses] = useState({});
    const [analysisType, setAnalysisType] = useState(null);

    // Add state for modal visibility
    const [showAnalysisModal, setShowAnalysisModal] = useState(stryMutAct_9fa48("23612") ? true : (stryCov_9fa48("23612"), false));

    // Initialize submission state
    const [submission, setSubmission] = useState(null);

    // Add refs for scrolling and textarea handling
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);
    const editTextareaRef = useRef(null);

    // Add a ref to the fetchTaskMessages function
    const fetchTaskMessagesRef = useRef(null);

    // After the existing useEffects, add a new one to fetch task details
    const fetchedTasksRef = useRef(new Set());
    const lastTaskIdRef = useRef(null);

    // Add a new state variable for success messages
    const [successMessage, setSuccessMessage] = useState(stryMutAct_9fa48("23613") ? "Stryker was here!" : (stryCov_9fa48("23613"), ''));
    useEffect(() => {
      if (stryMutAct_9fa48("23614")) {
        {}
      } else {
        stryCov_9fa48("23614");
        const fetchDaySchedule = async () => {
          if (stryMutAct_9fa48("23615")) {
            {}
          } else {
            stryCov_9fa48("23615");
            // Check if we have either dayId or dayNumber
            if (stryMutAct_9fa48("23618") ? !dayId || !dayNumber : stryMutAct_9fa48("23617") ? false : stryMutAct_9fa48("23616") ? true : (stryCov_9fa48("23616", "23617", "23618"), (stryMutAct_9fa48("23619") ? dayId : (stryCov_9fa48("23619"), !dayId)) && (stryMutAct_9fa48("23620") ? dayNumber : (stryCov_9fa48("23620"), !dayNumber)))) {
              if (stryMutAct_9fa48("23621")) {
                {}
              } else {
                stryCov_9fa48("23621");
                setError(stryMutAct_9fa48("23622") ? "" : (stryCov_9fa48("23622"), 'No day identifier provided'));
                setIsLoading(stryMutAct_9fa48("23623") ? true : (stryCov_9fa48("23623"), false));
                return;
              }
            }
            try {
              if (stryMutAct_9fa48("23624")) {
                {}
              } else {
                stryCov_9fa48("23624");
                setIsLoading(stryMutAct_9fa48("23625") ? false : (stryCov_9fa48("23625"), true));

                // Choose the appropriate API URL based on available parameters
                let apiUrl;
                if (stryMutAct_9fa48("23627") ? false : stryMutAct_9fa48("23626") ? true : (stryCov_9fa48("23626", "23627"), dayNumber)) {
                  if (stryMutAct_9fa48("23628")) {
                    {}
                  } else {
                    stryCov_9fa48("23628");
                    apiUrl = stryMutAct_9fa48("23629") ? `` : (stryCov_9fa48("23629"), `${import.meta.env.VITE_API_URL}/api/curriculum/days/number/${dayNumber}/full-details`);
                    // Add cohort parameter if available
                    if (stryMutAct_9fa48("23631") ? false : stryMutAct_9fa48("23630") ? true : (stryCov_9fa48("23630", "23631"), cohort)) {
                      if (stryMutAct_9fa48("23632")) {
                        {}
                      } else {
                        stryCov_9fa48("23632");
                        apiUrl += stryMutAct_9fa48("23633") ? `` : (stryCov_9fa48("23633"), `?cohort=${encodeURIComponent(cohort)}`);
                      }
                    }
                  }
                } else {
                  if (stryMutAct_9fa48("23634")) {
                    {}
                  } else {
                    stryCov_9fa48("23634");
                    apiUrl = stryMutAct_9fa48("23635") ? `` : (stryCov_9fa48("23635"), `${import.meta.env.VITE_API_URL}/api/curriculum/days/${dayId}/full-details`);
                    // Add cohort parameter if available
                    if (stryMutAct_9fa48("23637") ? false : stryMutAct_9fa48("23636") ? true : (stryCov_9fa48("23636", "23637"), cohort)) {
                      if (stryMutAct_9fa48("23638")) {
                        {}
                      } else {
                        stryCov_9fa48("23638");
                        apiUrl += stryMutAct_9fa48("23639") ? `` : (stryCov_9fa48("23639"), `?cohort=${encodeURIComponent(cohort)}`);
                      }
                    }
                  }
                }
                const response = await fetch(apiUrl, stryMutAct_9fa48("23640") ? {} : (stryCov_9fa48("23640"), {
                  headers: stryMutAct_9fa48("23641") ? {} : (stryCov_9fa48("23641"), {
                    'Authorization': stryMutAct_9fa48("23642") ? `` : (stryCov_9fa48("23642"), `Bearer ${token}`)
                  })
                }));
                if (stryMutAct_9fa48("23645") ? false : stryMutAct_9fa48("23644") ? true : stryMutAct_9fa48("23643") ? response.ok : (stryCov_9fa48("23643", "23644", "23645"), !response.ok)) {
                  if (stryMutAct_9fa48("23646")) {
                    {}
                  } else {
                    stryCov_9fa48("23646");
                    throw new Error(stryMutAct_9fa48("23647") ? `` : (stryCov_9fa48("23647"), `Failed to fetch day details: ${response.status} ${response.statusText}`));
                  }
                }
                const data = await response.json();
                console.log(stryMutAct_9fa48("23648") ? "" : (stryCov_9fa48("23648"), 'Day details data:'), data);

                // Set day schedule data
                setDaySchedule(data);

                // Set tasks data from the response, ensuring task_mode is set
                if (stryMutAct_9fa48("23651") ? data.flattenedTasks || Array.isArray(data.flattenedTasks) : stryMutAct_9fa48("23650") ? false : stryMutAct_9fa48("23649") ? true : (stryCov_9fa48("23649", "23650", "23651"), data.flattenedTasks && Array.isArray(data.flattenedTasks))) {
                  if (stryMutAct_9fa48("23652")) {
                    {}
                  } else {
                    stryCov_9fa48("23652");
                    // Process flattened tasks to ensure task_mode is set
                    const processedTasks = data.flattenedTasks.map(stryMutAct_9fa48("23653") ? () => undefined : (stryCov_9fa48("23653"), task => stryMutAct_9fa48("23654") ? {} : (stryCov_9fa48("23654"), {
                      ...task,
                      task_mode: stryMutAct_9fa48("23657") ? task.task_mode && 'basic' : stryMutAct_9fa48("23656") ? false : stryMutAct_9fa48("23655") ? true : (stryCov_9fa48("23655", "23656", "23657"), task.task_mode || (stryMutAct_9fa48("23658") ? "" : (stryCov_9fa48("23658"), 'basic'))) // Ensure task_mode is set
                    })));
                    console.log(stryMutAct_9fa48("23659") ? "" : (stryCov_9fa48("23659"), 'Processed flattenedTasks with task_mode:'), processedTasks.map(stryMutAct_9fa48("23660") ? () => undefined : (stryCov_9fa48("23660"), t => stryMutAct_9fa48("23661") ? {} : (stryCov_9fa48("23661"), {
                      id: t.id,
                      title: t.title,
                      task_mode: t.task_mode
                    }))));
                    setTasks(processedTasks);
                    setTasksLoading(stryMutAct_9fa48("23662") ? true : (stryCov_9fa48("23662"), false));
                  }
                } else {
                  if (stryMutAct_9fa48("23663")) {
                    {}
                  } else {
                    stryCov_9fa48("23663");
                    // Fallback to processing from timeBlocks if needed
                    processTasksFromTimeBlocks(data);
                  }
                }
              }
            } catch (error) {
              if (stryMutAct_9fa48("23664")) {
                {}
              } else {
                stryCov_9fa48("23664");
                setError(stryMutAct_9fa48("23665") ? "" : (stryCov_9fa48("23665"), 'Failed to load the day details. Please try again later.'));
              }
            } finally {
              if (stryMutAct_9fa48("23666")) {
                {}
              } else {
                stryCov_9fa48("23666");
                setIsLoading(stryMutAct_9fa48("23667") ? true : (stryCov_9fa48("23667"), false));
              }
            }
          }
        };

        // Helper function to process tasks from timeBlocks if needed
        const processTasksFromTimeBlocks = data => {
          if (stryMutAct_9fa48("23668")) {
            {}
          } else {
            stryCov_9fa48("23668");
            if (stryMutAct_9fa48("23671") ? !data && !data.timeBlocks : stryMutAct_9fa48("23670") ? false : stryMutAct_9fa48("23669") ? true : (stryCov_9fa48("23669", "23670", "23671"), (stryMutAct_9fa48("23672") ? data : (stryCov_9fa48("23672"), !data)) || (stryMutAct_9fa48("23673") ? data.timeBlocks : (stryCov_9fa48("23673"), !data.timeBlocks)))) return;
            const allTasks = stryMutAct_9fa48("23674") ? ["Stryker was here"] : (stryCov_9fa48("23674"), []);
            data.timeBlocks.forEach(block => {
              if (stryMutAct_9fa48("23675")) {
                {}
              } else {
                stryCov_9fa48("23675");
                if (stryMutAct_9fa48("23678") ? block.tasks || block.tasks.length > 0 : stryMutAct_9fa48("23677") ? false : stryMutAct_9fa48("23676") ? true : (stryCov_9fa48("23676", "23677", "23678"), block.tasks && (stryMutAct_9fa48("23681") ? block.tasks.length <= 0 : stryMutAct_9fa48("23680") ? block.tasks.length >= 0 : stryMutAct_9fa48("23679") ? true : (stryCov_9fa48("23679", "23680", "23681"), block.tasks.length > 0)))) {
                  if (stryMutAct_9fa48("23682")) {
                    {}
                  } else {
                    stryCov_9fa48("23682");
                    block.tasks.forEach(task => {
                      if (stryMutAct_9fa48("23683")) {
                        {}
                      } else {
                        stryCov_9fa48("23683");
                        // Handle resources and linked_resource fields
                        let taskResources = stryMutAct_9fa48("23684") ? ["Stryker was here"] : (stryCov_9fa48("23684"), []);
                        if (stryMutAct_9fa48("23687") ? task.resources && Array.isArray(task.resources) || task.resources.length > 0 : stryMutAct_9fa48("23686") ? false : stryMutAct_9fa48("23685") ? true : (stryCov_9fa48("23685", "23686", "23687"), (stryMutAct_9fa48("23689") ? task.resources || Array.isArray(task.resources) : stryMutAct_9fa48("23688") ? true : (stryCov_9fa48("23688", "23689"), task.resources && Array.isArray(task.resources))) && (stryMutAct_9fa48("23692") ? task.resources.length <= 0 : stryMutAct_9fa48("23691") ? task.resources.length >= 0 : stryMutAct_9fa48("23690") ? true : (stryCov_9fa48("23690", "23691", "23692"), task.resources.length > 0)))) {
                          if (stryMutAct_9fa48("23693")) {
                            {}
                          } else {
                            stryCov_9fa48("23693");
                            taskResources = task.resources;
                          }
                        } else if (stryMutAct_9fa48("23695") ? false : stryMutAct_9fa48("23694") ? true : (stryCov_9fa48("23694", "23695"), task.linked_resources)) {
                          if (stryMutAct_9fa48("23696")) {
                            {}
                          } else {
                            stryCov_9fa48("23696");
                            // Handle linked_resources field
                            if (stryMutAct_9fa48("23699") ? typeof task.linked_resources !== 'string' : stryMutAct_9fa48("23698") ? false : stryMutAct_9fa48("23697") ? true : (stryCov_9fa48("23697", "23698", "23699"), typeof task.linked_resources === (stryMutAct_9fa48("23700") ? "" : (stryCov_9fa48("23700"), 'string')))) {
                              if (stryMutAct_9fa48("23701")) {
                                {}
                              } else {
                                stryCov_9fa48("23701");
                                try {
                                  if (stryMutAct_9fa48("23702")) {
                                    {}
                                  } else {
                                    stryCov_9fa48("23702");
                                    // Try to parse if it's a JSON string
                                    const parsed = JSON.parse(task.linked_resources);
                                    taskResources = Array.isArray(parsed) ? parsed : stryMutAct_9fa48("23703") ? [] : (stryCov_9fa48("23703"), [parsed]);
                                  }
                                } catch (e) {
                                  if (stryMutAct_9fa48("23704")) {
                                    {}
                                  } else {
                                    stryCov_9fa48("23704");
                                    // If not parseable JSON, assume it's a URL
                                    taskResources = stryMutAct_9fa48("23705") ? [] : (stryCov_9fa48("23705"), [stryMutAct_9fa48("23706") ? {} : (stryCov_9fa48("23706"), {
                                      title: stryMutAct_9fa48("23707") ? "" : (stryCov_9fa48("23707"), 'Resource Link'),
                                      url: task.linked_resources,
                                      type: stryMutAct_9fa48("23708") ? "" : (stryCov_9fa48("23708"), 'link')
                                    })]);
                                  }
                                }
                              }
                            } else if (stryMutAct_9fa48("23711") ? typeof task.linked_resources !== 'object' : stryMutAct_9fa48("23710") ? false : stryMutAct_9fa48("23709") ? true : (stryCov_9fa48("23709", "23710", "23711"), typeof task.linked_resources === (stryMutAct_9fa48("23712") ? "" : (stryCov_9fa48("23712"), 'object')))) {
                              if (stryMutAct_9fa48("23713")) {
                                {}
                              } else {
                                stryCov_9fa48("23713");
                                // If it's already an object, use it directly
                                taskResources = Array.isArray(task.linked_resources) ? task.linked_resources : stryMutAct_9fa48("23714") ? [] : (stryCov_9fa48("23714"), [task.linked_resources]);
                              }
                            }
                          }
                        }

                        // Debug: Log the task data to see what we're getting
                        console.log(stryMutAct_9fa48("23715") ? "" : (stryCov_9fa48("23715"), 'Processing task:'), stryMutAct_9fa48("23716") ? {} : (stryCov_9fa48("23716"), {
                          id: stryMutAct_9fa48("23719") ? task.task_id && task.id : stryMutAct_9fa48("23718") ? false : stryMutAct_9fa48("23717") ? true : (stryCov_9fa48("23717", "23718", "23719"), task.task_id || task.id),
                          title: stryMutAct_9fa48("23722") ? task.task_title && task.title : stryMutAct_9fa48("23721") ? false : stryMutAct_9fa48("23720") ? true : (stryCov_9fa48("23720", "23721", "23722"), task.task_title || task.title),
                          task_mode: task.task_mode,
                          raw_task: task
                        }));

                        // Ensure task_mode is properly set
                        const taskMode = stryMutAct_9fa48("23725") ? task.task_mode && 'basic' : stryMutAct_9fa48("23724") ? false : stryMutAct_9fa48("23723") ? true : (stryCov_9fa48("23723", "23724", "23725"), task.task_mode || (stryMutAct_9fa48("23726") ? "" : (stryCov_9fa48("23726"), 'basic')));
                        console.log(stryMutAct_9fa48("23727") ? `` : (stryCov_9fa48("23727"), `Setting task_mode for task ${stryMutAct_9fa48("23730") ? task.task_id && task.id : stryMutAct_9fa48("23729") ? false : stryMutAct_9fa48("23728") ? true : (stryCov_9fa48("23728", "23729", "23730"), task.task_id || task.id)} to: ${taskMode}`));
                        allTasks.push(stryMutAct_9fa48("23731") ? {} : (stryCov_9fa48("23731"), {
                          id: stryMutAct_9fa48("23734") ? task.task_id && task.id : stryMutAct_9fa48("23733") ? false : stryMutAct_9fa48("23732") ? true : (stryCov_9fa48("23732", "23733", "23734"), task.task_id || task.id),
                          title: stryMutAct_9fa48("23737") ? task.task_title && task.title : stryMutAct_9fa48("23736") ? false : stryMutAct_9fa48("23735") ? true : (stryCov_9fa48("23735", "23736", "23737"), task.task_title || task.title),
                          description: stryMutAct_9fa48("23740") ? task.task_description && task.description : stryMutAct_9fa48("23739") ? false : stryMutAct_9fa48("23738") ? true : (stryCov_9fa48("23738", "23739", "23740"), task.task_description || task.description),
                          type: stryMutAct_9fa48("23743") ? (task.task_type || task.type) && 'individual' : stryMutAct_9fa48("23742") ? false : stryMutAct_9fa48("23741") ? true : (stryCov_9fa48("23741", "23742", "23743"), (stryMutAct_9fa48("23745") ? task.task_type && task.type : stryMutAct_9fa48("23744") ? false : (stryCov_9fa48("23744", "23745"), task.task_type || task.type)) || (stryMutAct_9fa48("23746") ? "" : (stryCov_9fa48("23746"), 'individual'))),
                          blockTime: stryMutAct_9fa48("23747") ? `` : (stryCov_9fa48("23747"), `${new Date(block.start_time).toLocaleTimeString(stryMutAct_9fa48("23748") ? "" : (stryCov_9fa48("23748"), 'en-US'), stryMutAct_9fa48("23749") ? {} : (stryCov_9fa48("23749"), {
                            hour: stryMutAct_9fa48("23750") ? "" : (stryCov_9fa48("23750"), '2-digit'),
                            minute: stryMutAct_9fa48("23751") ? "" : (stryCov_9fa48("23751"), '2-digit')
                          }))} - ${new Date(block.end_time).toLocaleTimeString(stryMutAct_9fa48("23752") ? "" : (stryCov_9fa48("23752"), 'en-US'), stryMutAct_9fa48("23753") ? {} : (stryCov_9fa48("23753"), {
                            hour: stryMutAct_9fa48("23754") ? "" : (stryCov_9fa48("23754"), '2-digit'),
                            minute: stryMutAct_9fa48("23755") ? "" : (stryCov_9fa48("23755"), '2-digit')
                          }))}`),
                          blockTitle: stryMutAct_9fa48("23758") ? (block.block_category || block.block_title) && '' : stryMutAct_9fa48("23757") ? false : stryMutAct_9fa48("23756") ? true : (stryCov_9fa48("23756", "23757", "23758"), (stryMutAct_9fa48("23760") ? block.block_category && block.block_title : stryMutAct_9fa48("23759") ? false : (stryCov_9fa48("23759", "23760"), block.block_category || block.block_title)) || (stryMutAct_9fa48("23761") ? "Stryker was here!" : (stryCov_9fa48("23761"), ''))),
                          completed: stryMutAct_9fa48("23762") ? true : (stryCov_9fa48("23762"), false),
                          resources: taskResources,
                          deliverable: task.deliverable,
                          deliverable_type: stryMutAct_9fa48("23765") ? task.deliverable_type && 'none' : stryMutAct_9fa48("23764") ? false : stryMutAct_9fa48("23763") ? true : (stryCov_9fa48("23763", "23764", "23765"), task.deliverable_type || (stryMutAct_9fa48("23766") ? "" : (stryCov_9fa48("23766"), 'none'))),
                          should_analyze: stryMutAct_9fa48("23769") ? task.should_analyze && false : stryMutAct_9fa48("23768") ? false : stryMutAct_9fa48("23767") ? true : (stryCov_9fa48("23767", "23768", "23769"), task.should_analyze || (stryMutAct_9fa48("23770") ? true : (stryCov_9fa48("23770"), false))),
                          analyze_deliverable: stryMutAct_9fa48("23773") ? task.analyze_deliverable && false : stryMutAct_9fa48("23772") ? false : stryMutAct_9fa48("23771") ? true : (stryCov_9fa48("23771", "23772", "23773"), task.analyze_deliverable || (stryMutAct_9fa48("23774") ? true : (stryCov_9fa48("23774"), false))),
                          analyze_conversation: stryMutAct_9fa48("23777") ? task.analyze_conversation && false : stryMutAct_9fa48("23776") ? false : stryMutAct_9fa48("23775") ? true : (stryCov_9fa48("23775", "23776", "23777"), task.analyze_conversation || (stryMutAct_9fa48("23778") ? true : (stryCov_9fa48("23778"), false))),
                          task_mode: taskMode,
                          // Explicitly set task mode
                          smart_prompt: stryMutAct_9fa48("23781") ? task.smart_prompt && null : stryMutAct_9fa48("23780") ? false : stryMutAct_9fa48("23779") ? true : (stryCov_9fa48("23779", "23780", "23781"), task.smart_prompt || null),
                          conversation_model: stryMutAct_9fa48("23784") ? task.conversation_model && null : stryMutAct_9fa48("23783") ? false : stryMutAct_9fa48("23782") ? true : (stryCov_9fa48("23782", "23783", "23784"), task.conversation_model || null)
                        }));
                      }
                    });
                  }
                }
              }
            });

            // Debug: Log the final tasks array
            console.log(stryMutAct_9fa48("23785") ? "" : (stryCov_9fa48("23785"), 'Final tasks array:'), allTasks.map(stryMutAct_9fa48("23786") ? () => undefined : (stryCov_9fa48("23786"), t => stryMutAct_9fa48("23787") ? {} : (stryCov_9fa48("23787"), {
              id: t.id,
              title: t.title,
              task_mode: t.task_mode
            }))));
            setTasks(allTasks);
            setTasksLoading(stryMutAct_9fa48("23788") ? true : (stryCov_9fa48("23788"), false));
          }
        };
        fetchDaySchedule();
      }
    }, stryMutAct_9fa48("23789") ? [] : (stryCov_9fa48("23789"), [dayId, dayNumber, cohort, token]));

    // Add auto-scroll effect when messages change
    useEffect(() => {
      if (stryMutAct_9fa48("23790")) {
        {}
      } else {
        stryCov_9fa48("23790");
        if (stryMutAct_9fa48("23792") ? false : stryMutAct_9fa48("23791") ? true : (stryCov_9fa48("23791", "23792"), messagesEndRef.current)) {
          if (stryMutAct_9fa48("23793")) {
            {}
          } else {
            stryCov_9fa48("23793");
            messagesEndRef.current.scrollIntoView(stryMutAct_9fa48("23794") ? {} : (stryCov_9fa48("23794"), {
              behavior: stryMutAct_9fa48("23795") ? "" : (stryCov_9fa48("23795"), 'smooth')
            }));
          }
        }
      }
    }, stryMutAct_9fa48("23796") ? [] : (stryCov_9fa48("23796"), [messages]));

    // Update existing useEffect for fetching task messages
    useEffect(() => {
      if (stryMutAct_9fa48("23797")) {
        {}
      } else {
        stryCov_9fa48("23797");
        const fetchTaskMessages = async taskId => {
          if (stryMutAct_9fa48("23798")) {
            {}
          } else {
            stryCov_9fa48("23798");
            if (stryMutAct_9fa48("23801") ? false : stryMutAct_9fa48("23800") ? true : stryMutAct_9fa48("23799") ? taskId : (stryCov_9fa48("23799", "23800", "23801"), !taskId)) return;

            // Skip refetching if we're already on this task
            if (stryMutAct_9fa48("23804") ? lastTaskIdRef.current !== taskId : stryMutAct_9fa48("23803") ? false : stryMutAct_9fa48("23802") ? true : (stryCov_9fa48("23802", "23803", "23804"), lastTaskIdRef.current === taskId)) {
              if (stryMutAct_9fa48("23805")) {
                {}
              } else {
                stryCov_9fa48("23805");
                return;
              }
            }

            // Set loading state and update last task id
            setMessagesLoading(stryMutAct_9fa48("23806") ? false : (stryCov_9fa48("23806"), true));
            setRateLimitHit(stryMutAct_9fa48("23807") ? true : (stryCov_9fa48("23807"), false)); // Reset any previous rate limit flag
            lastTaskIdRef.current = taskId;
            try {
              if (stryMutAct_9fa48("23808")) {
                {}
              } else {
                stryCov_9fa48("23808");
                // Add lazy loading delay (mimic network latency)
                setIsLazyLoading(stryMutAct_9fa48("23809") ? false : (stryCov_9fa48("23809"), true));
                await new Promise(stryMutAct_9fa48("23810") ? () => undefined : (stryCov_9fa48("23810"), resolve => setTimeout(resolve, 800))); // 800ms delay
                setIsLazyLoading(stryMutAct_9fa48("23811") ? true : (stryCov_9fa48("23811"), false));

                // Add dayNumber parameter to the API request if available
                let apiUrl = stryMutAct_9fa48("23812") ? `` : (stryCov_9fa48("23812"), `${import.meta.env.VITE_API_URL}/api/learning/task-messages/${taskId}`);
                let hasQueryParam = stryMutAct_9fa48("23813") ? true : (stryCov_9fa48("23813"), false);
                if (stryMutAct_9fa48("23816") ? daySchedule && daySchedule.day || daySchedule.day.day_number : stryMutAct_9fa48("23815") ? false : stryMutAct_9fa48("23814") ? true : (stryCov_9fa48("23814", "23815", "23816"), (stryMutAct_9fa48("23818") ? daySchedule || daySchedule.day : stryMutAct_9fa48("23817") ? true : (stryCov_9fa48("23817", "23818"), daySchedule && daySchedule.day)) && daySchedule.day.day_number)) {
                  if (stryMutAct_9fa48("23819")) {
                    {}
                  } else {
                    stryCov_9fa48("23819");
                    apiUrl += stryMutAct_9fa48("23820") ? `` : (stryCov_9fa48("23820"), `?dayNumber=${daySchedule.day.day_number}`);
                    hasQueryParam = stryMutAct_9fa48("23821") ? false : (stryCov_9fa48("23821"), true);
                  }
                }

                // Add cohort parameter if available
                if (stryMutAct_9fa48("23823") ? false : stryMutAct_9fa48("23822") ? true : (stryCov_9fa48("23822", "23823"), cohort)) {
                  if (stryMutAct_9fa48("23824")) {
                    {}
                  } else {
                    stryCov_9fa48("23824");
                    stryMutAct_9fa48("23825") ? apiUrl -= hasQueryParam ? `&cohort=${encodeURIComponent(cohort)}` : `?cohort=${encodeURIComponent(cohort)}` : (stryCov_9fa48("23825"), apiUrl += hasQueryParam ? stryMutAct_9fa48("23826") ? `` : (stryCov_9fa48("23826"), `&cohort=${encodeURIComponent(cohort)}`) : stryMutAct_9fa48("23827") ? `` : (stryCov_9fa48("23827"), `?cohort=${encodeURIComponent(cohort)}`));
                  }
                }
                console.log(stryMutAct_9fa48("23828") ? "" : (stryCov_9fa48("23828"), 'Fetching task messages from URL:'), apiUrl);
                const response = await fetch(apiUrl, stryMutAct_9fa48("23829") ? {} : (stryCov_9fa48("23829"), {
                  headers: stryMutAct_9fa48("23830") ? {} : (stryCov_9fa48("23830"), {
                    'Authorization': stryMutAct_9fa48("23831") ? `` : (stryCov_9fa48("23831"), `Bearer ${token}`)
                  })
                }));
                if (stryMutAct_9fa48("23834") ? false : stryMutAct_9fa48("23833") ? true : stryMutAct_9fa48("23832") ? response.ok : (stryCov_9fa48("23832", "23833", "23834"), !response.ok)) {
                  if (stryMutAct_9fa48("23835")) {
                    {}
                  } else {
                    stryCov_9fa48("23835");
                    if (stryMutAct_9fa48("23838") ? response.status !== 429 : stryMutAct_9fa48("23837") ? false : stryMutAct_9fa48("23836") ? true : (stryCov_9fa48("23836", "23837", "23838"), response.status === 429)) {
                      if (stryMutAct_9fa48("23839")) {
                        {}
                      } else {
                        stryCov_9fa48("23839");
                        setRateLimitHit(stryMutAct_9fa48("23840") ? false : (stryCov_9fa48("23840"), true));
                        throw new Error(stryMutAct_9fa48("23841") ? "" : (stryCov_9fa48("23841"), 'Rate limit exceeded. Please wait before trying again.'));
                      }
                    } else if (stryMutAct_9fa48("23844") ? response.status !== 404 : stryMutAct_9fa48("23843") ? false : stryMutAct_9fa48("23842") ? true : (stryCov_9fa48("23842", "23843", "23844"), response.status === 404)) {
                      if (stryMutAct_9fa48("23845")) {
                        {}
                      } else {
                        stryCov_9fa48("23845");
                        // No messages for this task yet - this is not an error
                        // Instead of automatic thread starting, show UI to let user start manually
                        setMessages(stryMutAct_9fa48("23846") ? ["Stryker was here"] : (stryCov_9fa48("23846"), []));
                        setMessagesLoading(stryMutAct_9fa48("23847") ? true : (stryCov_9fa48("23847"), false));
                        return;
                      }
                    }
                    throw new Error(stryMutAct_9fa48("23848") ? `` : (stryCov_9fa48("23848"), `Failed to fetch messages: ${response.status} ${response.statusText}`));
                  }
                }
                const data = await response.json();

                // Process and format the messages if we got them
                if (stryMutAct_9fa48("23851") ? data && data.messages && Array.isArray(data.messages) || data.messages.length > 0 : stryMutAct_9fa48("23850") ? false : stryMutAct_9fa48("23849") ? true : (stryCov_9fa48("23849", "23850", "23851"), (stryMutAct_9fa48("23853") ? data && data.messages || Array.isArray(data.messages) : stryMutAct_9fa48("23852") ? true : (stryCov_9fa48("23852", "23853"), (stryMutAct_9fa48("23855") ? data || data.messages : stryMutAct_9fa48("23854") ? true : (stryCov_9fa48("23854", "23855"), data && data.messages)) && Array.isArray(data.messages))) && (stryMutAct_9fa48("23858") ? data.messages.length <= 0 : stryMutAct_9fa48("23857") ? data.messages.length >= 0 : stryMutAct_9fa48("23856") ? true : (stryCov_9fa48("23856", "23857", "23858"), data.messages.length > 0)))) {
                  if (stryMutAct_9fa48("23859")) {
                    {}
                  } else {
                    stryCov_9fa48("23859");
                    console.log(stryMutAct_9fa48("23860") ? `` : (stryCov_9fa48("23860"), `Loaded ${data.messages.length} existing messages for task ${taskId}`));
                    setMessages(data.messages.map(msg => {
                      if (stryMutAct_9fa48("23861")) {
                        {}
                      } else {
                        stryCov_9fa48("23861");
                        // Only include a timestamp if it's valid
                        const timestamp = msg.timestamp ? new Date(msg.timestamp) : null;
                        const formattedTimestamp = (stryMutAct_9fa48("23864") ? timestamp || !isNaN(timestamp) : stryMutAct_9fa48("23863") ? false : stryMutAct_9fa48("23862") ? true : (stryCov_9fa48("23862", "23863", "23864"), timestamp && (stryMutAct_9fa48("23865") ? isNaN(timestamp) : (stryCov_9fa48("23865"), !isNaN(timestamp))))) ? timestamp.toLocaleTimeString() : null;
                        return stryMutAct_9fa48("23866") ? {} : (stryCov_9fa48("23866"), {
                          id: msg.message_id,
                          message_id: msg.message_id,
                          role: msg.role,
                          content: msg.content,
                          timestamp: formattedTimestamp
                        });
                      }
                    }));
                  }
                } else if (stryMutAct_9fa48("23869") ? data && Array.isArray(data) || data.length > 0 : stryMutAct_9fa48("23868") ? false : stryMutAct_9fa48("23867") ? true : (stryCov_9fa48("23867", "23868", "23869"), (stryMutAct_9fa48("23871") ? data || Array.isArray(data) : stryMutAct_9fa48("23870") ? true : (stryCov_9fa48("23870", "23871"), data && Array.isArray(data))) && (stryMutAct_9fa48("23874") ? data.length <= 0 : stryMutAct_9fa48("23873") ? data.length >= 0 : stryMutAct_9fa48("23872") ? true : (stryCov_9fa48("23872", "23873", "23874"), data.length > 0)))) {
                  if (stryMutAct_9fa48("23875")) {
                    {}
                  } else {
                    stryCov_9fa48("23875");
                    // Fallback for direct array response
                    console.log(stryMutAct_9fa48("23876") ? `` : (stryCov_9fa48("23876"), `Loaded ${data.length} existing messages in fallback format for task ${taskId}`));
                    setMessages(data.map(msg => {
                      if (stryMutAct_9fa48("23877")) {
                        {}
                      } else {
                        stryCov_9fa48("23877");
                        // Only include a timestamp if it's valid
                        const timestamp = msg.created_at ? new Date(msg.created_at) : null;
                        const formattedTimestamp = (stryMutAct_9fa48("23880") ? timestamp || !isNaN(timestamp) : stryMutAct_9fa48("23879") ? false : stryMutAct_9fa48("23878") ? true : (stryCov_9fa48("23878", "23879", "23880"), timestamp && (stryMutAct_9fa48("23881") ? isNaN(timestamp) : (stryCov_9fa48("23881"), !isNaN(timestamp))))) ? timestamp.toLocaleTimeString() : null;
                        return stryMutAct_9fa48("23882") ? {} : (stryCov_9fa48("23882"), {
                          id: msg.id,
                          message_id: msg.id,
                          role: msg.role,
                          content: msg.content,
                          timestamp: formattedTimestamp
                        });
                      }
                    }));
                  }
                } else {
                  if (stryMutAct_9fa48("23883")) {
                    {}
                  } else {
                    stryCov_9fa48("23883");
                    // No messages found but API returned successfully - this means we need empty state
                    console.log(stryMutAct_9fa48("23884") ? `` : (stryCov_9fa48("23884"), `No messages found for task ${taskId} - showing empty state`));
                    setMessages(stryMutAct_9fa48("23885") ? ["Stryker was here"] : (stryCov_9fa48("23885"), []));
                  }
                }
              }
            } catch (error) {
              if (stryMutAct_9fa48("23886")) {
                {}
              } else {
                stryCov_9fa48("23886");
                console.error(stryMutAct_9fa48("23887") ? "" : (stryCov_9fa48("23887"), 'Error fetching messages:'), error);
                setMessages(stryMutAct_9fa48("23888") ? ["Stryker was here"] : (stryCov_9fa48("23888"), []));
                if (stryMutAct_9fa48("23891") ? false : stryMutAct_9fa48("23890") ? true : stryMutAct_9fa48("23889") ? rateLimitHit : (stryCov_9fa48("23889", "23890", "23891"), !rateLimitHit)) {
                  if (stryMutAct_9fa48("23892")) {
                    {}
                  } else {
                    stryCov_9fa48("23892");
                    setError(stryMutAct_9fa48("23893") ? "" : (stryCov_9fa48("23893"), 'Failed to load messages. Please try again.'));
                  }
                }
              }
            } finally {
              if (stryMutAct_9fa48("23894")) {
                {}
              } else {
                stryCov_9fa48("23894");
                setMessagesLoading(stryMutAct_9fa48("23895") ? true : (stryCov_9fa48("23895"), false));
              }
            }
          }
        };

        // Only fetch messages automatically when the component first mounts
        // Don't fetch on task index changes - that will be handled by click handlers
        if (stryMutAct_9fa48("23898") ? tasks.length > 0 && currentTaskIndex < tasks.length || !lastTaskIdRef.current : stryMutAct_9fa48("23897") ? false : stryMutAct_9fa48("23896") ? true : (stryCov_9fa48("23896", "23897", "23898"), (stryMutAct_9fa48("23900") ? tasks.length > 0 || currentTaskIndex < tasks.length : stryMutAct_9fa48("23899") ? true : (stryCov_9fa48("23899", "23900"), (stryMutAct_9fa48("23903") ? tasks.length <= 0 : stryMutAct_9fa48("23902") ? tasks.length >= 0 : stryMutAct_9fa48("23901") ? true : (stryCov_9fa48("23901", "23902", "23903"), tasks.length > 0)) && (stryMutAct_9fa48("23906") ? currentTaskIndex >= tasks.length : stryMutAct_9fa48("23905") ? currentTaskIndex <= tasks.length : stryMutAct_9fa48("23904") ? true : (stryCov_9fa48("23904", "23905", "23906"), currentTaskIndex < tasks.length)))) && (stryMutAct_9fa48("23907") ? lastTaskIdRef.current : (stryCov_9fa48("23907"), !lastTaskIdRef.current)))) {
          if (stryMutAct_9fa48("23908")) {
            {}
          } else {
            stryCov_9fa48("23908");
            fetchTaskMessages(tasks[currentTaskIndex].id);
          }
        }

        // Expose fetchTaskMessages to be called from outside the effect
        fetchTaskMessagesRef.current = fetchTaskMessages;
      }
    }, stryMutAct_9fa48("23909") ? [] : (stryCov_9fa48("23909"), [token, tasks, daySchedule, dayNumber, cohort, isPastSession])); // Add cohort to dependency array

    useEffect(() => {
      if (stryMutAct_9fa48("23910")) {
        {}
      } else {
        stryCov_9fa48("23910");
        if (stryMutAct_9fa48("23913") ? daySchedule && daySchedule.day || daySchedule.day.day_date : stryMutAct_9fa48("23912") ? false : stryMutAct_9fa48("23911") ? true : (stryCov_9fa48("23911", "23912", "23913"), (stryMutAct_9fa48("23915") ? daySchedule || daySchedule.day : stryMutAct_9fa48("23914") ? true : (stryCov_9fa48("23914", "23915"), daySchedule && daySchedule.day)) && daySchedule.day.day_date)) {
          if (stryMutAct_9fa48("23916")) {
            {}
          } else {
            stryCov_9fa48("23916");
            // Compare the day's date to current date to determine if it's a past session
            const sessionDate = new Date(daySchedule.day.day_date);
            stryMutAct_9fa48("23917") ? sessionDate.setMinutes(0, 0, 0, 0) : (stryCov_9fa48("23917"), sessionDate.setHours(0, 0, 0, 0)); // Reset time to start of day for accurate comparison

            const today = new Date();
            stryMutAct_9fa48("23918") ? today.setMinutes(0, 0, 0, 0) : (stryCov_9fa48("23918"), today.setHours(0, 0, 0, 0)); // Reset time to start of day for accurate comparison

            // Calculate the difference in days
            const timeDiff = stryMutAct_9fa48("23919") ? sessionDate.getTime() + today.getTime() : (stryCov_9fa48("23919"), sessionDate.getTime() - today.getTime());
            const dayDiff = stryMutAct_9fa48("23920") ? timeDiff * (1000 * 3600 * 24) : (stryCov_9fa48("23920"), timeDiff / (stryMutAct_9fa48("23921") ? 1000 * 3600 / 24 : (stryCov_9fa48("23921"), (stryMutAct_9fa48("23922") ? 1000 / 3600 : (stryCov_9fa48("23922"), 1000 * 3600)) * 24)));
            if (stryMutAct_9fa48("23926") ? dayDiff >= 0 : stryMutAct_9fa48("23925") ? dayDiff <= 0 : stryMutAct_9fa48("23924") ? false : stryMutAct_9fa48("23923") ? true : (stryCov_9fa48("23923", "23924", "23925", "23926"), dayDiff < 0)) {
              if (stryMutAct_9fa48("23927")) {
                {}
              } else {
                stryCov_9fa48("23927");
                // Past session
                setIsPastSession(stryMutAct_9fa48("23928") ? false : (stryCov_9fa48("23928"), true));
              }
            } else {
              if (stryMutAct_9fa48("23929")) {
                {}
              } else {
                stryCov_9fa48("23929");
                // Today or future session
                setIsPastSession(stryMutAct_9fa48("23930") ? true : (stryCov_9fa48("23930"), false));
              }
            }
          }
        }
      }
    }, stryMutAct_9fa48("23931") ? [] : (stryCov_9fa48("23931"), [daySchedule]));

    // Add useEffect to fetch analyses when the task changes
    useEffect(() => {
      if (stryMutAct_9fa48("23932")) {
        {}
      } else {
        stryCov_9fa48("23932");
        if (stryMutAct_9fa48("23935") ? tasks.length > 0 && currentTaskIndex >= 0 || currentTaskIndex < tasks.length : stryMutAct_9fa48("23934") ? false : stryMutAct_9fa48("23933") ? true : (stryCov_9fa48("23933", "23934", "23935"), (stryMutAct_9fa48("23937") ? tasks.length > 0 || currentTaskIndex >= 0 : stryMutAct_9fa48("23936") ? true : (stryCov_9fa48("23936", "23937"), (stryMutAct_9fa48("23940") ? tasks.length <= 0 : stryMutAct_9fa48("23939") ? tasks.length >= 0 : stryMutAct_9fa48("23938") ? true : (stryCov_9fa48("23938", "23939", "23940"), tasks.length > 0)) && (stryMutAct_9fa48("23943") ? currentTaskIndex < 0 : stryMutAct_9fa48("23942") ? currentTaskIndex > 0 : stryMutAct_9fa48("23941") ? true : (stryCov_9fa48("23941", "23942", "23943"), currentTaskIndex >= 0)))) && (stryMutAct_9fa48("23946") ? currentTaskIndex >= tasks.length : stryMutAct_9fa48("23945") ? currentTaskIndex <= tasks.length : stryMutAct_9fa48("23944") ? true : (stryCov_9fa48("23944", "23945", "23946"), currentTaskIndex < tasks.length)))) {
          if (stryMutAct_9fa48("23947")) {
            {}
          } else {
            stryCov_9fa48("23947");
            const currentTask = tasks[currentTaskIndex];
            if (stryMutAct_9fa48("23949") ? false : stryMutAct_9fa48("23948") ? true : (stryCov_9fa48("23948", "23949"), currentTask)) {
              if (stryMutAct_9fa48("23950")) {
                {}
              } else {
                stryCov_9fa48("23950");
                console.log(stryMutAct_9fa48("23951") ? `` : (stryCov_9fa48("23951"), `Current task changed to task ${currentTask.id}, checking for analyses`));
                fetchAvailableAnalyses(currentTask.id);
              }
            }
          }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }
    }, stryMutAct_9fa48("23952") ? [] : (stryCov_9fa48("23952"), [currentTaskIndex, tasks]));

    // After the existing useEffects, add a new one to fetch task details
    useEffect(() => {
      if (stryMutAct_9fa48("23953")) {
        {}
      } else {
        stryCov_9fa48("23953");
        const fetchTaskDetails = async () => {
          if (stryMutAct_9fa48("23954")) {
            {}
          } else {
            stryCov_9fa48("23954");
            // This function can be simplified now but kept for edge cases
            if (stryMutAct_9fa48("23957") ? !tasks.length && currentTaskIndex >= tasks.length : stryMutAct_9fa48("23956") ? false : stryMutAct_9fa48("23955") ? true : (stryCov_9fa48("23955", "23956", "23957"), (stryMutAct_9fa48("23958") ? tasks.length : (stryCov_9fa48("23958"), !tasks.length)) || (stryMutAct_9fa48("23961") ? currentTaskIndex < tasks.length : stryMutAct_9fa48("23960") ? currentTaskIndex > tasks.length : stryMutAct_9fa48("23959") ? false : (stryCov_9fa48("23959", "23960", "23961"), currentTaskIndex >= tasks.length)))) return;
            const selectedTask = tasks[currentTaskIndex];
            if (stryMutAct_9fa48("23964") ? false : stryMutAct_9fa48("23963") ? true : stryMutAct_9fa48("23962") ? selectedTask?.id : (stryCov_9fa48("23962", "23963", "23964"), !(stryMutAct_9fa48("23965") ? selectedTask.id : (stryCov_9fa48("23965"), selectedTask?.id)))) return;
            const taskId = selectedTask.id;

            // Skip if we've already fetched details for this task or if it already has resources
            if (stryMutAct_9fa48("23968") ? fetchedTasksRef.current.has(taskId) && selectedTask.resources && selectedTask.resources.length > 0 : stryMutAct_9fa48("23967") ? false : stryMutAct_9fa48("23966") ? true : (stryCov_9fa48("23966", "23967", "23968"), fetchedTasksRef.current.has(taskId) || (stryMutAct_9fa48("23970") ? selectedTask.resources || selectedTask.resources.length > 0 : stryMutAct_9fa48("23969") ? false : (stryCov_9fa48("23969", "23970"), selectedTask.resources && (stryMutAct_9fa48("23973") ? selectedTask.resources.length <= 0 : stryMutAct_9fa48("23972") ? selectedTask.resources.length >= 0 : stryMutAct_9fa48("23971") ? true : (stryCov_9fa48("23971", "23972", "23973"), selectedTask.resources.length > 0)))))) {
              if (stryMutAct_9fa48("23974")) {
                {}
              } else {
                stryCov_9fa48("23974");
                return;
              }
            }

            // Mark this task as fetched to prevent repeated fetches
            fetchedTasksRef.current.add(taskId);
            try {
              if (stryMutAct_9fa48("23975")) {
                {}
              } else {
                stryCov_9fa48("23975");
                const apiUrl = stryMutAct_9fa48("23976") ? `` : (stryCov_9fa48("23976"), `${import.meta.env.VITE_API_URL}/api/curriculum/tasks/${taskId}`);
                const response = await fetch(apiUrl, stryMutAct_9fa48("23977") ? {} : (stryCov_9fa48("23977"), {
                  headers: stryMutAct_9fa48("23978") ? {} : (stryCov_9fa48("23978"), {
                    'Authorization': stryMutAct_9fa48("23979") ? `` : (stryCov_9fa48("23979"), `Bearer ${token}`)
                  })
                }));
                if (stryMutAct_9fa48("23982") ? false : stryMutAct_9fa48("23981") ? true : stryMutAct_9fa48("23980") ? response.ok : (stryCov_9fa48("23980", "23981", "23982"), !response.ok)) {
                  if (stryMutAct_9fa48("23983")) {
                    {}
                  } else {
                    stryCov_9fa48("23983");
                    return;
                  }
                }
                const taskData = await response.json();

                // Check if the task has linked_resources
                if (stryMutAct_9fa48("23985") ? false : stryMutAct_9fa48("23984") ? true : (stryCov_9fa48("23984", "23985"), taskData.linked_resources)) {
                  if (stryMutAct_9fa48("23986")) {
                    {}
                  } else {
                    stryCov_9fa48("23986");
                    // Process linked_resources to usable format
                    let resourceObj;
                    if (stryMutAct_9fa48("23989") ? typeof taskData.linked_resources !== 'string' : stryMutAct_9fa48("23988") ? false : stryMutAct_9fa48("23987") ? true : (stryCov_9fa48("23987", "23988", "23989"), typeof taskData.linked_resources === (stryMutAct_9fa48("23990") ? "" : (stryCov_9fa48("23990"), 'string')))) {
                      if (stryMutAct_9fa48("23991")) {
                        {}
                      } else {
                        stryCov_9fa48("23991");
                        try {
                          if (stryMutAct_9fa48("23992")) {
                            {}
                          } else {
                            stryCov_9fa48("23992");
                            // Try to parse if it's a JSON string
                            resourceObj = JSON.parse(taskData.linked_resources);
                          }
                        } catch (e) {
                          if (stryMutAct_9fa48("23993")) {
                            {}
                          } else {
                            stryCov_9fa48("23993");
                            // If it's a URL, create a simple resource object
                            if (stryMutAct_9fa48("23996") ? taskData.linked_resources.endsWith('http') : stryMutAct_9fa48("23995") ? false : stryMutAct_9fa48("23994") ? true : (stryCov_9fa48("23994", "23995", "23996"), taskData.linked_resources.startsWith(stryMutAct_9fa48("23997") ? "" : (stryCov_9fa48("23997"), 'http')))) {
                              if (stryMutAct_9fa48("23998")) {
                                {}
                              } else {
                                stryCov_9fa48("23998");
                                resourceObj = stryMutAct_9fa48("23999") ? {} : (stryCov_9fa48("23999"), {
                                  title: stryMutAct_9fa48("24000") ? "" : (stryCov_9fa48("24000"), 'Resource Link'),
                                  url: taskData.linked_resources,
                                  type: stryMutAct_9fa48("24001") ? "" : (stryCov_9fa48("24001"), 'link')
                                });
                              }
                            } else {
                              if (stryMutAct_9fa48("24002")) {
                                {}
                              } else {
                                stryCov_9fa48("24002");
                                // Try to extract a URL if present
                                const urlMatch = taskData.linked_resources.match(stryMutAct_9fa48("24006") ? /(https?:\/\/[^\S]+)/g : stryMutAct_9fa48("24005") ? /(https?:\/\/[\s]+)/g : stryMutAct_9fa48("24004") ? /(https?:\/\/[^\s])/g : stryMutAct_9fa48("24003") ? /(https:\/\/[^\s]+)/g : (stryCov_9fa48("24003", "24004", "24005", "24006"), /(https?:\/\/[^\s]+)/g));
                                if (stryMutAct_9fa48("24009") ? urlMatch || urlMatch.length > 0 : stryMutAct_9fa48("24008") ? false : stryMutAct_9fa48("24007") ? true : (stryCov_9fa48("24007", "24008", "24009"), urlMatch && (stryMutAct_9fa48("24012") ? urlMatch.length <= 0 : stryMutAct_9fa48("24011") ? urlMatch.length >= 0 : stryMutAct_9fa48("24010") ? true : (stryCov_9fa48("24010", "24011", "24012"), urlMatch.length > 0)))) {
                                  if (stryMutAct_9fa48("24013")) {
                                    {}
                                  } else {
                                    stryCov_9fa48("24013");
                                    resourceObj = stryMutAct_9fa48("24014") ? {} : (stryCov_9fa48("24014"), {
                                      title: stryMutAct_9fa48("24015") ? "" : (stryCov_9fa48("24015"), 'Extracted Resource'),
                                      url: urlMatch[0],
                                      type: stryMutAct_9fa48("24016") ? "" : (stryCov_9fa48("24016"), 'link')
                                    });
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    } else if (stryMutAct_9fa48("24019") ? typeof taskData.linked_resources !== 'object' : stryMutAct_9fa48("24018") ? false : stryMutAct_9fa48("24017") ? true : (stryCov_9fa48("24017", "24018", "24019"), typeof taskData.linked_resources === (stryMutAct_9fa48("24020") ? "" : (stryCov_9fa48("24020"), 'object')))) {
                      if (stryMutAct_9fa48("24021")) {
                        {}
                      } else {
                        stryCov_9fa48("24021");
                        resourceObj = taskData.linked_resources;
                      }
                    }
                    if (stryMutAct_9fa48("24023") ? false : stryMutAct_9fa48("24022") ? true : (stryCov_9fa48("24022", "24023"), resourceObj)) {
                      if (stryMutAct_9fa48("24024")) {
                        {}
                      } else {
                        stryCov_9fa48("24024");
                        // Update the task with the linked_resources
                        setTasks(prevTasks => {
                          if (stryMutAct_9fa48("24025")) {
                            {}
                          } else {
                            stryCov_9fa48("24025");
                            // Find the current index of the task (may have changed since fetch started)
                            const taskIndex = prevTasks.findIndex(stryMutAct_9fa48("24026") ? () => undefined : (stryCov_9fa48("24026"), t => stryMutAct_9fa48("24029") ? t.id !== taskId : stryMutAct_9fa48("24028") ? false : stryMutAct_9fa48("24027") ? true : (stryCov_9fa48("24027", "24028", "24029"), t.id === taskId)));
                            if (stryMutAct_9fa48("24032") ? taskIndex !== -1 : stryMutAct_9fa48("24031") ? false : stryMutAct_9fa48("24030") ? true : (stryCov_9fa48("24030", "24031", "24032"), taskIndex === (stryMutAct_9fa48("24033") ? +1 : (stryCov_9fa48("24033"), -1)))) return prevTasks;
                            const updatedTasks = stryMutAct_9fa48("24034") ? [] : (stryCov_9fa48("24034"), [...prevTasks]);
                            updatedTasks[taskIndex] = stryMutAct_9fa48("24035") ? {} : (stryCov_9fa48("24035"), {
                              ...updatedTasks[taskIndex],
                              resources: Array.isArray(resourceObj) ? resourceObj : stryMutAct_9fa48("24036") ? [] : (stryCov_9fa48("24036"), [resourceObj])
                            });
                            return updatedTasks;
                          }
                        });
                      }
                    }
                  }
                }
              }
            } catch (error) {
              // Error handling without console.log
            }
          }
        };
        if (stryMutAct_9fa48("24039") ? tasks.length > 0 || currentTaskIndex < tasks.length : stryMutAct_9fa48("24038") ? false : stryMutAct_9fa48("24037") ? true : (stryCov_9fa48("24037", "24038", "24039"), (stryMutAct_9fa48("24042") ? tasks.length <= 0 : stryMutAct_9fa48("24041") ? tasks.length >= 0 : stryMutAct_9fa48("24040") ? true : (stryCov_9fa48("24040", "24041", "24042"), tasks.length > 0)) && (stryMutAct_9fa48("24045") ? currentTaskIndex >= tasks.length : stryMutAct_9fa48("24044") ? currentTaskIndex <= tasks.length : stryMutAct_9fa48("24043") ? true : (stryCov_9fa48("24043", "24044", "24045"), currentTaskIndex < tasks.length)))) {
          if (stryMutAct_9fa48("24046")) {
            {}
          } else {
            stryCov_9fa48("24046");
            fetchTaskDetails();
          }
        }
      }
    }, stryMutAct_9fa48("24047") ? [] : (stryCov_9fa48("24047"), [currentTaskIndex, token])); // Remove tasks from dependency array

    const handleBackToCalendar = () => {
      if (stryMutAct_9fa48("24048")) {
        {}
      } else {
        stryCov_9fa48("24048");
        navigate(stryMutAct_9fa48("24049") ? "" : (stryCov_9fa48("24049"), '/calendar'));
      }
    };
    const getTaskIcon = (type, taskMode, feedbackSlot) => {
      if (stryMutAct_9fa48("24050")) {
        {}
      } else {
        stryCov_9fa48("24050");
        // Ensure task_mode has a value (default to 'basic')
        const mode = stryMutAct_9fa48("24053") ? taskMode && 'basic' : stryMutAct_9fa48("24052") ? false : stryMutAct_9fa48("24051") ? true : (stryCov_9fa48("24051", "24052", "24053"), taskMode || (stryMutAct_9fa48("24054") ? "" : (stryCov_9fa48("24054"), 'basic')));
        console.log(stryMutAct_9fa48("24055") ? "" : (stryCov_9fa48("24055"), 'getTaskIcon called with:'), stryMutAct_9fa48("24056") ? {} : (stryCov_9fa48("24056"), {
          type,
          taskMode,
          normalizedMode: mode,
          feedbackSlot
        }));

        // Check if this is a feedback slot task - use clipboard icon
        if (stryMutAct_9fa48("24058") ? false : stryMutAct_9fa48("24057") ? true : (stryCov_9fa48("24057", "24058"), feedbackSlot)) {
          if (stryMutAct_9fa48("24059")) {
            {}
          } else {
            stryCov_9fa48("24059");
            return <FaClipboardList className="task-icon feedback" />;
          }
        }

        // Check if this is a conversation task - use brain icon
        if (stryMutAct_9fa48("24062") ? mode !== 'conversation' : stryMutAct_9fa48("24061") ? false : stryMutAct_9fa48("24060") ? true : (stryCov_9fa48("24060", "24061", "24062"), mode === (stryMutAct_9fa48("24063") ? "" : (stryCov_9fa48("24063"), 'conversation')))) {
          if (stryMutAct_9fa48("24064")) {
            {}
          } else {
            stryCov_9fa48("24064");
            console.log(stryMutAct_9fa48("24065") ? "" : (stryCov_9fa48("24065"), 'Returning brain icon for conversation task'));
            return <FaBrain className="task-icon conversation" />;
          }
        }

        // Special case for Independent Retrospective
        if (stryMutAct_9fa48("24068") ? type === 'reflect' && tasks.length > 0 && currentTaskIndex < tasks.length || tasks[currentTaskIndex].title === "Independent Retrospective" : stryMutAct_9fa48("24067") ? false : stryMutAct_9fa48("24066") ? true : (stryCov_9fa48("24066", "24067", "24068"), (stryMutAct_9fa48("24070") ? type === 'reflect' && tasks.length > 0 || currentTaskIndex < tasks.length : stryMutAct_9fa48("24069") ? true : (stryCov_9fa48("24069", "24070"), (stryMutAct_9fa48("24072") ? type === 'reflect' || tasks.length > 0 : stryMutAct_9fa48("24071") ? true : (stryCov_9fa48("24071", "24072"), (stryMutAct_9fa48("24074") ? type !== 'reflect' : stryMutAct_9fa48("24073") ? true : (stryCov_9fa48("24073", "24074"), type === (stryMutAct_9fa48("24075") ? "" : (stryCov_9fa48("24075"), 'reflect')))) && (stryMutAct_9fa48("24078") ? tasks.length <= 0 : stryMutAct_9fa48("24077") ? tasks.length >= 0 : stryMutAct_9fa48("24076") ? true : (stryCov_9fa48("24076", "24077", "24078"), tasks.length > 0)))) && (stryMutAct_9fa48("24081") ? currentTaskIndex >= tasks.length : stryMutAct_9fa48("24080") ? currentTaskIndex <= tasks.length : stryMutAct_9fa48("24079") ? true : (stryCov_9fa48("24079", "24080", "24081"), currentTaskIndex < tasks.length)))) && (stryMutAct_9fa48("24083") ? tasks[currentTaskIndex].title !== "Independent Retrospective" : stryMutAct_9fa48("24082") ? true : (stryCov_9fa48("24082", "24083"), tasks[currentTaskIndex].title === (stryMutAct_9fa48("24084") ? "" : (stryCov_9fa48("24084"), "Independent Retrospective")))))) {
          if (stryMutAct_9fa48("24085")) {
            {}
          } else {
            stryCov_9fa48("24085");
            // Always show the original icon for the Independent Retrospective task
            return <FaBook className="task-icon reflect" />;
          }
        }

        // Remove the completed check - always show the icon based on type
        switch (type) {
          case stryMutAct_9fa48("24086") ? "" : (stryCov_9fa48("24086"), 'share'):
          case stryMutAct_9fa48("24088") ? "" : (stryCov_9fa48("24088"), 'discussion'):
            if (stryMutAct_9fa48("24087")) {} else {
              stryCov_9fa48("24087");
              return <FaCheckCircle className="task-icon share" />;
            }
          case stryMutAct_9fa48("24089") ? "" : (stryCov_9fa48("24089"), 'discuss'):
          case stryMutAct_9fa48("24091") ? "" : (stryCov_9fa48("24091"), 'group'):
            if (stryMutAct_9fa48("24090")) {} else {
              stryCov_9fa48("24090");
              return <FaUsers className="task-icon discuss" />;
            }
          case stryMutAct_9fa48("24092") ? "" : (stryCov_9fa48("24092"), 'reflect'):
          case stryMutAct_9fa48("24094") ? "" : (stryCov_9fa48("24094"), 'individual'):
            if (stryMutAct_9fa48("24093")) {} else {
              stryCov_9fa48("24093");
              return <FaBook className="task-icon reflect" />;
            }
          default:
            if (stryMutAct_9fa48("24095")) {} else {
              stryCov_9fa48("24095");
              return <FaCheckCircle className="task-icon" />;
            }
        }
      }
    };
    const renderTaskResources = resources => {
      if (stryMutAct_9fa48("24096")) {
        {}
      } else {
        stryCov_9fa48("24096");
        if (stryMutAct_9fa48("24099") ? !resources && resources.length === 0 : stryMutAct_9fa48("24098") ? false : stryMutAct_9fa48("24097") ? true : (stryCov_9fa48("24097", "24098", "24099"), (stryMutAct_9fa48("24100") ? resources : (stryCov_9fa48("24100"), !resources)) || (stryMutAct_9fa48("24102") ? resources.length !== 0 : stryMutAct_9fa48("24101") ? false : (stryCov_9fa48("24101", "24102"), resources.length === 0)))) {
          if (stryMutAct_9fa48("24103")) {
            {}
          } else {
            stryCov_9fa48("24103");
            return null;
          }
        }

        // Ensure resources are properly parsed
        const parsedResources = stryMutAct_9fa48("24104") ? resources.map(resource => {
          if (typeof resource === 'string') {
            try {
              const parsed = JSON.parse(resource);
              return parsed;
            } catch (e) {
              // Try to handle it as a direct URL string
              if (resource.startsWith('http')) {
                return {
                  title: 'Resource Link',
                  url: resource,
                  type: 'link'
                };
              }
              return null;
            }
          }

          // If it's already an object, ensure it has required properties
          if (resource && typeof resource === 'object') {
            const processedResource = {
              ...resource
            };

            // Handle different property names
            if (!processedResource.url && processedResource.link) {
              processedResource.url = processedResource.link;
            }
            if (!processedResource.title && processedResource.name) {
              processedResource.title = processedResource.name;
            } else if (!processedResource.title) {
              processedResource.title = 'Resource';
            }
            if (!processedResource.type) {
              processedResource.type = 'link';
            }
            if (processedResource.url) {
              return processedResource;
            } else {
              return null;
            }
          }
          return resource;
        }) : (stryCov_9fa48("24104"), resources.map(resource => {
          if (stryMutAct_9fa48("24105")) {
            {}
          } else {
            stryCov_9fa48("24105");
            if (stryMutAct_9fa48("24108") ? typeof resource !== 'string' : stryMutAct_9fa48("24107") ? false : stryMutAct_9fa48("24106") ? true : (stryCov_9fa48("24106", "24107", "24108"), typeof resource === (stryMutAct_9fa48("24109") ? "" : (stryCov_9fa48("24109"), 'string')))) {
              if (stryMutAct_9fa48("24110")) {
                {}
              } else {
                stryCov_9fa48("24110");
                try {
                  if (stryMutAct_9fa48("24111")) {
                    {}
                  } else {
                    stryCov_9fa48("24111");
                    const parsed = JSON.parse(resource);
                    return parsed;
                  }
                } catch (e) {
                  if (stryMutAct_9fa48("24112")) {
                    {}
                  } else {
                    stryCov_9fa48("24112");
                    // Try to handle it as a direct URL string
                    if (stryMutAct_9fa48("24115") ? resource.endsWith('http') : stryMutAct_9fa48("24114") ? false : stryMutAct_9fa48("24113") ? true : (stryCov_9fa48("24113", "24114", "24115"), resource.startsWith(stryMutAct_9fa48("24116") ? "" : (stryCov_9fa48("24116"), 'http')))) {
                      if (stryMutAct_9fa48("24117")) {
                        {}
                      } else {
                        stryCov_9fa48("24117");
                        return stryMutAct_9fa48("24118") ? {} : (stryCov_9fa48("24118"), {
                          title: stryMutAct_9fa48("24119") ? "" : (stryCov_9fa48("24119"), 'Resource Link'),
                          url: resource,
                          type: stryMutAct_9fa48("24120") ? "" : (stryCov_9fa48("24120"), 'link')
                        });
                      }
                    }
                    return null;
                  }
                }
              }
            }

            // If it's already an object, ensure it has required properties
            if (stryMutAct_9fa48("24123") ? resource || typeof resource === 'object' : stryMutAct_9fa48("24122") ? false : stryMutAct_9fa48("24121") ? true : (stryCov_9fa48("24121", "24122", "24123"), resource && (stryMutAct_9fa48("24125") ? typeof resource !== 'object' : stryMutAct_9fa48("24124") ? true : (stryCov_9fa48("24124", "24125"), typeof resource === (stryMutAct_9fa48("24126") ? "" : (stryCov_9fa48("24126"), 'object')))))) {
              if (stryMutAct_9fa48("24127")) {
                {}
              } else {
                stryCov_9fa48("24127");
                const processedResource = stryMutAct_9fa48("24128") ? {} : (stryCov_9fa48("24128"), {
                  ...resource
                });

                // Handle different property names
                if (stryMutAct_9fa48("24131") ? !processedResource.url || processedResource.link : stryMutAct_9fa48("24130") ? false : stryMutAct_9fa48("24129") ? true : (stryCov_9fa48("24129", "24130", "24131"), (stryMutAct_9fa48("24132") ? processedResource.url : (stryCov_9fa48("24132"), !processedResource.url)) && processedResource.link)) {
                  if (stryMutAct_9fa48("24133")) {
                    {}
                  } else {
                    stryCov_9fa48("24133");
                    processedResource.url = processedResource.link;
                  }
                }
                if (stryMutAct_9fa48("24136") ? !processedResource.title || processedResource.name : stryMutAct_9fa48("24135") ? false : stryMutAct_9fa48("24134") ? true : (stryCov_9fa48("24134", "24135", "24136"), (stryMutAct_9fa48("24137") ? processedResource.title : (stryCov_9fa48("24137"), !processedResource.title)) && processedResource.name)) {
                  if (stryMutAct_9fa48("24138")) {
                    {}
                  } else {
                    stryCov_9fa48("24138");
                    processedResource.title = processedResource.name;
                  }
                } else if (stryMutAct_9fa48("24141") ? false : stryMutAct_9fa48("24140") ? true : stryMutAct_9fa48("24139") ? processedResource.title : (stryCov_9fa48("24139", "24140", "24141"), !processedResource.title)) {
                  if (stryMutAct_9fa48("24142")) {
                    {}
                  } else {
                    stryCov_9fa48("24142");
                    processedResource.title = stryMutAct_9fa48("24143") ? "" : (stryCov_9fa48("24143"), 'Resource');
                  }
                }
                if (stryMutAct_9fa48("24146") ? false : stryMutAct_9fa48("24145") ? true : stryMutAct_9fa48("24144") ? processedResource.type : (stryCov_9fa48("24144", "24145", "24146"), !processedResource.type)) {
                  if (stryMutAct_9fa48("24147")) {
                    {}
                  } else {
                    stryCov_9fa48("24147");
                    processedResource.type = stryMutAct_9fa48("24148") ? "" : (stryCov_9fa48("24148"), 'link');
                  }
                }
                if (stryMutAct_9fa48("24150") ? false : stryMutAct_9fa48("24149") ? true : (stryCov_9fa48("24149", "24150"), processedResource.url)) {
                  if (stryMutAct_9fa48("24151")) {
                    {}
                  } else {
                    stryCov_9fa48("24151");
                    return processedResource;
                  }
                } else {
                  if (stryMutAct_9fa48("24152")) {
                    {}
                  } else {
                    stryCov_9fa48("24152");
                    return null;
                  }
                }
              }
            }
            return resource;
          }
        }).filter(Boolean)); // Remove any null resources

        if (stryMutAct_9fa48("24155") ? parsedResources.length !== 0 : stryMutAct_9fa48("24154") ? false : stryMutAct_9fa48("24153") ? true : (stryCov_9fa48("24153", "24154", "24155"), parsedResources.length === 0)) {
          if (stryMutAct_9fa48("24156")) {
            {}
          } else {
            stryCov_9fa48("24156");
            return null;
          }
        }

        // Group resources by type
        const groupedResources = parsedResources.reduce((acc, resource) => {
          if (stryMutAct_9fa48("24157")) {
            {}
          } else {
            stryCov_9fa48("24157");
            const type = stryMutAct_9fa48("24160") ? resource.type && 'other' : stryMutAct_9fa48("24159") ? false : stryMutAct_9fa48("24158") ? true : (stryCov_9fa48("24158", "24159", "24160"), resource.type || (stryMutAct_9fa48("24161") ? "" : (stryCov_9fa48("24161"), 'other')));
            if (stryMutAct_9fa48("24164") ? false : stryMutAct_9fa48("24163") ? true : stryMutAct_9fa48("24162") ? acc[type] : (stryCov_9fa48("24162", "24163", "24164"), !acc[type])) {
              if (stryMutAct_9fa48("24165")) {
                {}
              } else {
                stryCov_9fa48("24165");
                acc[type] = stryMutAct_9fa48("24166") ? ["Stryker was here"] : (stryCov_9fa48("24166"), []);
              }
            }
            acc[type].push(resource);
            return acc;
          }
        }, {});
        return <div className="past-session__task-resources">
        <h3>Learning Resources</h3>
        {Object.entries(groupedResources).map(stryMutAct_9fa48("24167") ? () => undefined : (stryCov_9fa48("24167"), ([type, typeResources]) => <div key={type} className="past-session__resource-group">
            <ul>
              {typeResources.map(stryMutAct_9fa48("24168") ? () => undefined : (stryCov_9fa48("24168"), (resource, index) => <li key={index} className="past-session__resource-item">
                  <div className="past-session__resource-content">
                    <a href={resource.url} target="_blank" rel="noopener noreferrer">
                      {stryMutAct_9fa48("24171") ? resource.title && 'Resource Link' : stryMutAct_9fa48("24170") ? false : stryMutAct_9fa48("24169") ? true : (stryCov_9fa48("24169", "24170", "24171"), resource.title || (stryMutAct_9fa48("24172") ? "" : (stryCov_9fa48("24172"), 'Resource Link')))}
                    </a>
                  </div>

                </li>))}
            </ul>
          </div>))}
      </div>;
      }
    };

    // Helper function to preprocess code content for better wrapping
    const preprocessCodeContent = code => {
      if (stryMutAct_9fa48("24173")) {
        {}
      } else {
        stryCov_9fa48("24173");
        if (stryMutAct_9fa48("24176") ? false : stryMutAct_9fa48("24175") ? true : stryMutAct_9fa48("24174") ? code : (stryCov_9fa48("24174", "24175", "24176"), !code)) return code;

        // Split code into lines
        const lines = code.split(stryMutAct_9fa48("24177") ? "" : (stryCov_9fa48("24177"), '\n'));
        const maxLineLength = 80; // Reasonable line length for code

        const processedLines = lines.map(line => {
          if (stryMutAct_9fa48("24178")) {
            {}
          } else {
            stryCov_9fa48("24178");
            // If line is too long, try to break it intelligently
            if (stryMutAct_9fa48("24182") ? line.length <= maxLineLength : stryMutAct_9fa48("24181") ? line.length >= maxLineLength : stryMutAct_9fa48("24180") ? false : stryMutAct_9fa48("24179") ? true : (stryCov_9fa48("24179", "24180", "24181", "24182"), line.length > maxLineLength)) {
              if (stryMutAct_9fa48("24183")) {
                {}
              } else {
                stryCov_9fa48("24183");
                // Try to break at logical points (spaces, operators, etc.)
                const breakPoints = stryMutAct_9fa48("24184") ? [] : (stryCov_9fa48("24184"), [stryMutAct_9fa48("24185") ? "" : (stryCov_9fa48("24185"), ' '), stryMutAct_9fa48("24186") ? "" : (stryCov_9fa48("24186"), '.'), stryMutAct_9fa48("24187") ? "" : (stryCov_9fa48("24187"), '('), stryMutAct_9fa48("24188") ? "" : (stryCov_9fa48("24188"), ')'), stryMutAct_9fa48("24189") ? "" : (stryCov_9fa48("24189"), '{'), stryMutAct_9fa48("24190") ? "" : (stryCov_9fa48("24190"), '}'), stryMutAct_9fa48("24191") ? "" : (stryCov_9fa48("24191"), '['), stryMutAct_9fa48("24192") ? "" : (stryCov_9fa48("24192"), ']'), stryMutAct_9fa48("24193") ? "" : (stryCov_9fa48("24193"), ','), stryMutAct_9fa48("24194") ? "" : (stryCov_9fa48("24194"), ';'), stryMutAct_9fa48("24195") ? "" : (stryCov_9fa48("24195"), '='), stryMutAct_9fa48("24196") ? "" : (stryCov_9fa48("24196"), '+'), stryMutAct_9fa48("24197") ? "" : (stryCov_9fa48("24197"), '-')]);
                let bestBreak = stryMutAct_9fa48("24198") ? +1 : (stryCov_9fa48("24198"), -1);

                // Find the best break point within reasonable range
                for (let i = stryMutAct_9fa48("24199") ? maxLineLength + 10 : (stryCov_9fa48("24199"), maxLineLength - 10); stryMutAct_9fa48("24201") ? i >= maxLineLength - 30 || i >= 0 : stryMutAct_9fa48("24200") ? false : (stryCov_9fa48("24200", "24201"), (stryMutAct_9fa48("24204") ? i < maxLineLength - 30 : stryMutAct_9fa48("24203") ? i > maxLineLength - 30 : stryMutAct_9fa48("24202") ? true : (stryCov_9fa48("24202", "24203", "24204"), i >= (stryMutAct_9fa48("24205") ? maxLineLength + 30 : (stryCov_9fa48("24205"), maxLineLength - 30)))) && (stryMutAct_9fa48("24208") ? i < 0 : stryMutAct_9fa48("24207") ? i > 0 : stryMutAct_9fa48("24206") ? true : (stryCov_9fa48("24206", "24207", "24208"), i >= 0))); stryMutAct_9fa48("24209") ? i++ : (stryCov_9fa48("24209"), i--)) {
                  if (stryMutAct_9fa48("24210")) {
                    {}
                  } else {
                    stryCov_9fa48("24210");
                    if (stryMutAct_9fa48("24212") ? false : stryMutAct_9fa48("24211") ? true : (stryCov_9fa48("24211", "24212"), breakPoints.includes(line[i]))) {
                      if (stryMutAct_9fa48("24213")) {
                        {}
                      } else {
                        stryCov_9fa48("24213");
                        bestBreak = stryMutAct_9fa48("24214") ? i - 1 : (stryCov_9fa48("24214"), i + 1);
                        break;
                      }
                    }
                  }
                }

                // If we found a good break point, split the line
                if (stryMutAct_9fa48("24217") ? bestBreak > 0 || bestBreak < line.length : stryMutAct_9fa48("24216") ? false : stryMutAct_9fa48("24215") ? true : (stryCov_9fa48("24215", "24216", "24217"), (stryMutAct_9fa48("24220") ? bestBreak <= 0 : stryMutAct_9fa48("24219") ? bestBreak >= 0 : stryMutAct_9fa48("24218") ? true : (stryCov_9fa48("24218", "24219", "24220"), bestBreak > 0)) && (stryMutAct_9fa48("24223") ? bestBreak >= line.length : stryMutAct_9fa48("24222") ? bestBreak <= line.length : stryMutAct_9fa48("24221") ? true : (stryCov_9fa48("24221", "24222", "24223"), bestBreak < line.length)))) {
                  if (stryMutAct_9fa48("24224")) {
                    {}
                  } else {
                    stryCov_9fa48("24224");
                    const firstPart = stryMutAct_9fa48("24225") ? line : (stryCov_9fa48("24225"), line.substring(0, bestBreak));
                    const secondPart = (stryMutAct_9fa48("24226") ? "" : (stryCov_9fa48("24226"), '  ')) + (stryMutAct_9fa48("24228") ? line.trim() : stryMutAct_9fa48("24227") ? line.substring(bestBreak) : (stryCov_9fa48("24227", "24228"), line.substring(bestBreak).trim())); // Indent continuation
                    return firstPart + (stryMutAct_9fa48("24229") ? "" : (stryCov_9fa48("24229"), '\n')) + secondPart;
                  }
                }
              }
            }
            return line;
          }
        });
        return processedLines.join(stryMutAct_9fa48("24230") ? "" : (stryCov_9fa48("24230"), '\n'));
      }
    };

    // Add a format function for message content with markdown support
    const formatMessageContent = content => {
      if (stryMutAct_9fa48("24231")) {
        {}
      } else {
        stryCov_9fa48("24231");
        if (stryMutAct_9fa48("24234") ? false : stryMutAct_9fa48("24233") ? true : stryMutAct_9fa48("24232") ? content : (stryCov_9fa48("24232", "24233", "24234"), !content)) return null;

        // Check if content is an object and not a string
        if (stryMutAct_9fa48("24237") ? typeof content !== 'object' : stryMutAct_9fa48("24236") ? false : stryMutAct_9fa48("24235") ? true : (stryCov_9fa48("24235", "24236", "24237"), typeof content === (stryMutAct_9fa48("24238") ? "" : (stryCov_9fa48("24238"), 'object')))) {
          if (stryMutAct_9fa48("24239")) {
            {}
          } else {
            stryCov_9fa48("24239");
            // Convert the object to a readable string format
            try {
              if (stryMutAct_9fa48("24240")) {
                {}
              } else {
                stryCov_9fa48("24240");
                return <pre className="system-message">System message: {JSON.stringify(content, null, 2)}</pre>;
              }
            } catch (e) {
              if (stryMutAct_9fa48("24241")) {
                {}
              } else {
                stryCov_9fa48("24241");
                console.error(stryMutAct_9fa48("24242") ? "" : (stryCov_9fa48("24242"), 'Error stringifying content object:'), e);
                return <p className="error-message">Error displaying message content</p>;
              }
            }
          }
        }

        // Split content by code blocks to handle them separately
        const parts = content.split(stryMutAct_9fa48("24246") ? /(```[\s\s]*?```)/g : stryMutAct_9fa48("24245") ? /(```[\S\S]*?```)/g : stryMutAct_9fa48("24244") ? /(```[^\s\S]*?```)/g : stryMutAct_9fa48("24243") ? /(```[\s\S]```)/g : (stryCov_9fa48("24243", "24244", "24245", "24246"), /(```[\s\S]*?```)/g));
        return <>
        {parts.map((part, index) => {
            if (stryMutAct_9fa48("24247")) {
              {}
            } else {
              stryCov_9fa48("24247");
              // Check if this part is a code block
              if (stryMutAct_9fa48("24250") ? part.startsWith('```') || part.endsWith('```') : stryMutAct_9fa48("24249") ? false : stryMutAct_9fa48("24248") ? true : (stryCov_9fa48("24248", "24249", "24250"), (stryMutAct_9fa48("24251") ? part.endsWith('```') : (stryCov_9fa48("24251"), part.startsWith(stryMutAct_9fa48("24252") ? "" : (stryCov_9fa48("24252"), '```')))) && (stryMutAct_9fa48("24253") ? part.startsWith('```') : (stryCov_9fa48("24253"), part.endsWith(stryMutAct_9fa48("24254") ? "" : (stryCov_9fa48("24254"), '```')))))) {
                if (stryMutAct_9fa48("24255")) {
                  {}
                } else {
                  stryCov_9fa48("24255");
                  // Extract language and code
                  const match = part.match(stryMutAct_9fa48("24261") ? /```(\w*)\n([\s\s]*?)```/ : stryMutAct_9fa48("24260") ? /```(\w*)\n([\S\S]*?)```/ : stryMutAct_9fa48("24259") ? /```(\w*)\n([^\s\S]*?)```/ : stryMutAct_9fa48("24258") ? /```(\w*)\n([\s\S])```/ : stryMutAct_9fa48("24257") ? /```(\W*)\n([\s\S]*?)```/ : stryMutAct_9fa48("24256") ? /```(\w)\n([\s\S]*?)```/ : (stryCov_9fa48("24256", "24257", "24258", "24259", "24260", "24261"), /```(\w*)\n([\s\S]*?)```/));
                  if (stryMutAct_9fa48("24263") ? false : stryMutAct_9fa48("24262") ? true : (stryCov_9fa48("24262", "24263"), match)) {
                    if (stryMutAct_9fa48("24264")) {
                      {}
                    } else {
                      stryCov_9fa48("24264");
                      const [, language, code] = match;

                      // Preprocess the code content for better wrapping
                      const processedCode = preprocessCodeContent(code);
                      return <div key={index} className="code-block-wrapper">
                  <div className="code-block-header">
                    {stryMutAct_9fa48("24267") ? language || <span className="code-language">{language}</span> : stryMutAct_9fa48("24266") ? false : stryMutAct_9fa48("24265") ? true : (stryCov_9fa48("24265", "24266", "24267"), language && <span className="code-language">{language}</span>)}
                  </div>
                  <div className="code-block-content">
                    {processedCode}
                  </div>
                </div>;
                    }
                  }
                }
              }

              // Regular markdown for non-code parts
              return <ReactMarkdown key={index} components={stryMutAct_9fa48("24268") ? {} : (stryCov_9fa48("24268"), {
                p: stryMutAct_9fa48("24269") ? () => undefined : (stryCov_9fa48("24269"), ({
                  node,
                  children,
                  ...props
                }) => <p className="markdown-paragraph" {...props}>{children}</p>),
                h1: stryMutAct_9fa48("24270") ? () => undefined : (stryCov_9fa48("24270"), ({
                  node,
                  children,
                  ...props
                }) => <h1 className="markdown-heading" {...props}>{children}</h1>),
                h2: stryMutAct_9fa48("24271") ? () => undefined : (stryCov_9fa48("24271"), ({
                  node,
                  children,
                  ...props
                }) => <h2 className="markdown-heading" {...props}>{children}</h2>),
                h3: stryMutAct_9fa48("24272") ? () => undefined : (stryCov_9fa48("24272"), ({
                  node,
                  children,
                  ...props
                }) => <h3 className="markdown-heading" {...props}>{children}</h3>),
                ul: stryMutAct_9fa48("24273") ? () => undefined : (stryCov_9fa48("24273"), ({
                  node,
                  children,
                  ...props
                }) => <ul className="markdown-list" {...props}>{children}</ul>),
                ol: stryMutAct_9fa48("24274") ? () => undefined : (stryCov_9fa48("24274"), ({
                  node,
                  children,
                  ...props
                }) => <ol className="markdown-list" {...props}>{children}</ol>),
                li: stryMutAct_9fa48("24275") ? () => undefined : (stryCov_9fa48("24275"), ({
                  node,
                  children,
                  ...props
                }) => <li className="markdown-list-item" {...props}>{children}</li>),
                a: stryMutAct_9fa48("24276") ? () => undefined : (stryCov_9fa48("24276"), ({
                  node,
                  children,
                  ...props
                }) => <a className="markdown-link" target="_blank" rel="noopener noreferrer" {...props}>{children}</a>),
                strong: stryMutAct_9fa48("24277") ? () => undefined : (stryCov_9fa48("24277"), ({
                  node,
                  children,
                  ...props
                }) => <strong {...props}>{children}</strong>),
                em: stryMutAct_9fa48("24278") ? () => undefined : (stryCov_9fa48("24278"), ({
                  node,
                  children,
                  ...props
                }) => <em {...props}>{children}</em>),
                code: ({
                  node,
                  inline,
                  className,
                  children,
                  ...props
                }) => {
                  if (stryMutAct_9fa48("24279")) {
                    {}
                  } else {
                    stryCov_9fa48("24279");
                    if (stryMutAct_9fa48("24281") ? false : stryMutAct_9fa48("24280") ? true : (stryCov_9fa48("24280", "24281"), inline)) {
                      if (stryMutAct_9fa48("24282")) {
                        {}
                      } else {
                        stryCov_9fa48("24282");
                        return <code className="inline-code" {...props}>{children}</code>;
                      }
                    }
                    return <code {...props}>{children}</code>;
                  }
                }
              })}>
              {part}
            </ReactMarkdown>;
            }
          })}
      </>;
      }
    };

    // Add a historical notification banner at the top of the component render
    const renderHistoricalBanner = () => {
      if (stryMutAct_9fa48("24283")) {
        {}
      } else {
        stryCov_9fa48("24283");
        if (stryMutAct_9fa48("24286") ? false : stryMutAct_9fa48("24285") ? true : stryMutAct_9fa48("24284") ? isActive : (stryCov_9fa48("24284", "24285", "24286"), !isActive)) {
          if (stryMutAct_9fa48("24287")) {
            {}
          } else {
            stryCov_9fa48("24287");
            return <div className="past-session__historical-banner">
          <p>You have historical access only. You can view your past content but cannot submit new work or generate new feedback.</p>
        </div>;
          }
        }
        return null;
      }
    };

    // Update the handleSendMessage to check for active status
    const handleSendMessage = async e => {
      if (stryMutAct_9fa48("24288")) {
        {}
      } else {
        stryCov_9fa48("24288");
        e.preventDefault();
        if (stryMutAct_9fa48("24291") ? false : stryMutAct_9fa48("24290") ? true : stryMutAct_9fa48("24289") ? newMessage.trim() : (stryCov_9fa48("24289", "24290", "24291"), !(stryMutAct_9fa48("24292") ? newMessage : (stryCov_9fa48("24292"), newMessage.trim())))) {
          if (stryMutAct_9fa48("24293")) {
            {}
          } else {
            stryCov_9fa48("24293");
            return;
          }
        }

        // Prevent sending if the user is inactive
        if (stryMutAct_9fa48("24296") ? false : stryMutAct_9fa48("24295") ? true : stryMutAct_9fa48("24294") ? isActive : (stryCov_9fa48("24294", "24295", "24296"), !isActive)) {
          if (stryMutAct_9fa48("24297")) {
            {}
          } else {
            stryCov_9fa48("24297");
            setError(stryMutAct_9fa48("24298") ? "" : (stryCov_9fa48("24298"), 'You have historical access only and cannot send new messages.'));
            return;
          }
        }

        // Get the current task
        const currentTask = tasks[currentTaskIndex];
        if (stryMutAct_9fa48("24301") ? false : stryMutAct_9fa48("24300") ? true : stryMutAct_9fa48("24299") ? currentTask : (stryCov_9fa48("24299", "24300", "24301"), !currentTask)) {
          if (stryMutAct_9fa48("24302")) {
            {}
          } else {
            stryCov_9fa48("24302");
            setError(stryMutAct_9fa48("24303") ? "" : (stryCov_9fa48("24303"), 'No task selected.'));
            return;
          }
        }
        try {
          if (stryMutAct_9fa48("24304")) {
            {}
          } else {
            stryCov_9fa48("24304");
            setError(null);
            setIsSending(stryMutAct_9fa48("24305") ? false : (stryCov_9fa48("24305"), true));

            // Show optimistic UI update
            const optimisticId = stryMutAct_9fa48("24306") ? `` : (stryCov_9fa48("24306"), `optimistic-${Date.now()}`);
            const optimisticMessage = stryMutAct_9fa48("24307") ? {} : (stryCov_9fa48("24307"), {
              id: optimisticId,
              content: newMessage,
              role: stryMutAct_9fa48("24308") ? "" : (stryCov_9fa48("24308"), 'user'),
              timestamp: new Date().toLocaleTimeString(),
              status: stryMutAct_9fa48("24309") ? "" : (stryCov_9fa48("24309"), 'sending')
            });
            setMessages(stryMutAct_9fa48("24310") ? () => undefined : (stryCov_9fa48("24310"), prev => stryMutAct_9fa48("24311") ? [] : (stryCov_9fa48("24311"), [...prev, optimisticMessage])));
            setNewMessage(stryMutAct_9fa48("24312") ? "Stryker was here!" : (stryCov_9fa48("24312"), ''));

            // Show AI thinking indicator
            setIsAiThinking(stryMutAct_9fa48("24313") ? false : (stryCov_9fa48("24313"), true));

            // Auto expand the textarea
            if (stryMutAct_9fa48("24315") ? false : stryMutAct_9fa48("24314") ? true : (stryCov_9fa48("24314", "24315"), textareaRef.current)) {
              if (stryMutAct_9fa48("24316")) {
                {}
              } else {
                stryCov_9fa48("24316");
                textareaRef.current.style.height = stryMutAct_9fa48("24317") ? "" : (stryCov_9fa48("24317"), 'auto');
              }
            }

            // Add cohort parameter to the URL for debugging
            console.log(stryMutAct_9fa48("24318") ? "" : (stryCov_9fa48("24318"), 'Sending message with cohort:'), cohort);

            // Send the message
            const response = await fetch(stryMutAct_9fa48("24319") ? `` : (stryCov_9fa48("24319"), `${import.meta.env.VITE_API_URL}/api/learning/messages/continue`), stryMutAct_9fa48("24320") ? {} : (stryCov_9fa48("24320"), {
              method: stryMutAct_9fa48("24321") ? "" : (stryCov_9fa48("24321"), 'POST'),
              headers: stryMutAct_9fa48("24322") ? {} : (stryCov_9fa48("24322"), {
                'Content-Type': stryMutAct_9fa48("24323") ? "" : (stryCov_9fa48("24323"), 'application/json'),
                'Authorization': stryMutAct_9fa48("24324") ? `` : (stryCov_9fa48("24324"), `Bearer ${token}`)
              }),
              body: JSON.stringify(stryMutAct_9fa48("24325") ? {} : (stryCov_9fa48("24325"), {
                content: newMessage,
                taskId: currentTask.id,
                dayNumber: dayNumber,
                cohort: cohort
              }))
            }));
            if (stryMutAct_9fa48("24328") ? false : stryMutAct_9fa48("24327") ? true : stryMutAct_9fa48("24326") ? response.ok : (stryCov_9fa48("24326", "24327", "24328"), !response.ok)) {
              if (stryMutAct_9fa48("24329")) {
                {}
              } else {
                stryCov_9fa48("24329");
                throw new Error(stryMutAct_9fa48("24330") ? `` : (stryCov_9fa48("24330"), `Failed to send message: ${response.status}`));
              }
            }

            // Get AI response
            const aiResponseData = await response.json();

            // Extract the user message ID from the response if available
            const userMessageId = aiResponseData.user_message_id;

            // If the server returned the user message ID, update our state to use it
            if (stryMutAct_9fa48("24332") ? false : stryMutAct_9fa48("24331") ? true : (stryCov_9fa48("24331", "24332"), userMessageId)) {
              if (stryMutAct_9fa48("24333")) {
                {}
              } else {
                stryCov_9fa48("24333");
                // Update the user message with the real server ID
                setMessages(stryMutAct_9fa48("24334") ? () => undefined : (stryCov_9fa48("24334"), prevMessages => prevMessages.map(stryMutAct_9fa48("24335") ? () => undefined : (stryCov_9fa48("24335"), msg => (stryMutAct_9fa48("24338") ? msg.id !== optimisticId : stryMutAct_9fa48("24337") ? false : stryMutAct_9fa48("24336") ? true : (stryCov_9fa48("24336", "24337", "24338"), msg.id === optimisticId)) ? stryMutAct_9fa48("24339") ? {} : (stryCov_9fa48("24339"), {
                  ...msg,
                  id: userMessageId,
                  message_id: userMessageId
                }) : msg))));
              }
            }

            // Add AI response
            const aiResponse = stryMutAct_9fa48("24340") ? {} : (stryCov_9fa48("24340"), {
              id: aiResponseData.message_id,
              message_id: aiResponseData.message_id,
              content: aiResponseData.content,
              role: aiResponseData.role,
              timestamp: aiResponseData.timestamp
            });
            setMessages(stryMutAct_9fa48("24341") ? () => undefined : (stryCov_9fa48("24341"), prevMessages => stryMutAct_9fa48("24342") ? [] : (stryCov_9fa48("24342"), [...prevMessages, aiResponse])));
          }
        } catch (err) {
          if (stryMutAct_9fa48("24343")) {
            {}
          } else {
            stryCov_9fa48("24343");
            setError(stryMutAct_9fa48("24344") ? "" : (stryCov_9fa48("24344"), 'Failed to communicate with the learning assistant. Please try again.'));

            // Remove the temporary message on error
            setMessages(stryMutAct_9fa48("24345") ? () => undefined : (stryCov_9fa48("24345"), prevMessages => stryMutAct_9fa48("24346") ? prevMessages : (stryCov_9fa48("24346"), prevMessages.filter(stryMutAct_9fa48("24347") ? () => undefined : (stryCov_9fa48("24347"), msg => stryMutAct_9fa48("24350") ? msg.id === optimisticId : stryMutAct_9fa48("24349") ? false : stryMutAct_9fa48("24348") ? true : (stryCov_9fa48("24348", "24349", "24350"), msg.id !== optimisticId))))));
          }
        } finally {
          if (stryMutAct_9fa48("24351")) {
            {}
          } else {
            stryCov_9fa48("24351");
            setIsSending(stryMutAct_9fa48("24352") ? true : (stryCov_9fa48("24352"), false));
            setIsAiThinking(stryMutAct_9fa48("24353") ? true : (stryCov_9fa48("24353"), false));
          }
        }
      }
    };

    // Handle text input changes for the message input
    const handleTextareaChange = e => {
      if (stryMutAct_9fa48("24354")) {
        {}
      } else {
        stryCov_9fa48("24354");
        setNewMessage(e.target.value);
        if (stryMutAct_9fa48("24356") ? false : stryMutAct_9fa48("24355") ? true : (stryCov_9fa48("24355", "24356"), textareaRef.current)) {
          if (stryMutAct_9fa48("24357")) {
            {}
          } else {
            stryCov_9fa48("24357");
            textareaRef.current.style.height = stryMutAct_9fa48("24358") ? "" : (stryCov_9fa48("24358"), 'auto');
            textareaRef.current.style.height = stryMutAct_9fa48("24359") ? `` : (stryCov_9fa48("24359"), `${textareaRef.current.scrollHeight}px`);
          }
        }
      }
    };

    // Handle starting to edit a message
    const handleEditMessage = message => {
      if (stryMutAct_9fa48("24360")) {
        {}
      } else {
        stryCov_9fa48("24360");
        // Check if message has an actual server-assigned ID
        const messageId = stryMutAct_9fa48("24363") ? message.message_id && message.id : stryMutAct_9fa48("24362") ? false : stryMutAct_9fa48("24361") ? true : (stryCov_9fa48("24361", "24362", "24363"), message.message_id || message.id);

        // Ensure ID is treated as a string
        setEditingMessageId(String(messageId));
        setEditMessageContent(message.content);

        // Focus the textarea after it's rendered
        setTimeout(() => {
          if (stryMutAct_9fa48("24364")) {
            {}
          } else {
            stryCov_9fa48("24364");
            if (stryMutAct_9fa48("24366") ? false : stryMutAct_9fa48("24365") ? true : (stryCov_9fa48("24365", "24366"), editTextareaRef.current)) {
              if (stryMutAct_9fa48("24367")) {
                {}
              } else {
                stryCov_9fa48("24367");
                editTextareaRef.current.focus();

                // Auto-resize the textarea
                editTextareaRef.current.style.height = stryMutAct_9fa48("24368") ? "" : (stryCov_9fa48("24368"), 'auto');
                editTextareaRef.current.style.height = stryMutAct_9fa48("24369") ? `` : (stryCov_9fa48("24369"), `${editTextareaRef.current.scrollHeight}px`);
              }
            }
          }
        }, 0);
      }
    };

    // Handle updating a message
    const handleUpdateMessage = async messageId => {
      if (stryMutAct_9fa48("24370")) {
        {}
      } else {
        stryCov_9fa48("24370");
        if (stryMutAct_9fa48("24373") ? !editMessageContent.trim() && isUpdating : stryMutAct_9fa48("24372") ? false : stryMutAct_9fa48("24371") ? true : (stryCov_9fa48("24371", "24372", "24373"), (stryMutAct_9fa48("24374") ? editMessageContent.trim() : (stryCov_9fa48("24374"), !(stryMutAct_9fa48("24375") ? editMessageContent : (stryCov_9fa48("24375"), editMessageContent.trim())))) || isUpdating)) return;
        setIsUpdating(stryMutAct_9fa48("24376") ? false : (stryCov_9fa48("24376"), true));
        try {
          if (stryMutAct_9fa48("24377")) {
            {}
          } else {
            stryCov_9fa48("24377");
            // Ensure messageId is treated as a string for comparisons
            const messageIdStr = String(messageId);

            // Send update request to API
            const response = await fetch(stryMutAct_9fa48("24378") ? `` : (stryCov_9fa48("24378"), `${import.meta.env.VITE_API_URL}/api/learning/messages/${messageId}`), stryMutAct_9fa48("24379") ? {} : (stryCov_9fa48("24379"), {
              method: stryMutAct_9fa48("24380") ? "" : (stryCov_9fa48("24380"), 'PUT'),
              headers: stryMutAct_9fa48("24381") ? {} : (stryCov_9fa48("24381"), {
                'Content-Type': stryMutAct_9fa48("24382") ? "" : (stryCov_9fa48("24382"), 'application/json'),
                'Authorization': stryMutAct_9fa48("24383") ? `` : (stryCov_9fa48("24383"), `Bearer ${token}`)
              }),
              body: JSON.stringify(stryMutAct_9fa48("24384") ? {} : (stryCov_9fa48("24384"), {
                content: stryMutAct_9fa48("24385") ? editMessageContent : (stryCov_9fa48("24385"), editMessageContent.trim())
              }))
            }));
            if (stryMutAct_9fa48("24388") ? false : stryMutAct_9fa48("24387") ? true : stryMutAct_9fa48("24386") ? response.ok : (stryCov_9fa48("24386", "24387", "24388"), !response.ok)) {
              if (stryMutAct_9fa48("24389")) {
                {}
              } else {
                stryCov_9fa48("24389");
                throw new Error(stryMutAct_9fa48("24390") ? `` : (stryCov_9fa48("24390"), `Failed to update message: ${response.status}`));
              }
            }
            const updatedMessage = await response.json();

            // Update the message in the UI
            setMessages(stryMutAct_9fa48("24391") ? () => undefined : (stryCov_9fa48("24391"), prevMessages => prevMessages.map(stryMutAct_9fa48("24392") ? () => undefined : (stryCov_9fa48("24392"), msg => (stryMutAct_9fa48("24395") ? String(msg.id) !== messageIdStr : stryMutAct_9fa48("24394") ? false : stryMutAct_9fa48("24393") ? true : (stryCov_9fa48("24393", "24394", "24395"), String(msg.id) === messageIdStr)) ? stryMutAct_9fa48("24396") ? {} : (stryCov_9fa48("24396"), {
              ...msg,
              id: updatedMessage.message_id,
              // Use the server's ID
              message_id: updatedMessage.message_id,
              // Store both versions for consistency
              content: updatedMessage.content,
              updated: stryMutAct_9fa48("24397") ? false : (stryCov_9fa48("24397"), true)
            }) : msg))));

            // Reset edit state
            setEditingMessageId(null);
            setEditMessageContent(stryMutAct_9fa48("24398") ? "Stryker was here!" : (stryCov_9fa48("24398"), ''));
          }
        } catch (err) {
          if (stryMutAct_9fa48("24399")) {
            {}
          } else {
            stryCov_9fa48("24399");
            setError(stryMutAct_9fa48("24400") ? `` : (stryCov_9fa48("24400"), `Failed to update message: ${err.message}`));
          }
        } finally {
          if (stryMutAct_9fa48("24401")) {
            {}
          } else {
            stryCov_9fa48("24401");
            setIsUpdating(stryMutAct_9fa48("24402") ? true : (stryCov_9fa48("24402"), false));
          }
        }
      }
    };

    // Handle canceling an edit
    const handleCancelEdit = () => {
      if (stryMutAct_9fa48("24403")) {
        {}
      } else {
        stryCov_9fa48("24403");
        setEditingMessageId(null);
        setEditMessageContent(stryMutAct_9fa48("24404") ? "Stryker was here!" : (stryCov_9fa48("24404"), ''));
      }
    };

    // Handle edit textarea auto-resize
    const handleEditTextareaChange = e => {
      if (stryMutAct_9fa48("24405")) {
        {}
      } else {
        stryCov_9fa48("24405");
        setEditMessageContent(e.target.value);
        if (stryMutAct_9fa48("24407") ? false : stryMutAct_9fa48("24406") ? true : (stryCov_9fa48("24406", "24407"), editTextareaRef.current)) {
          if (stryMutAct_9fa48("24408")) {
            {}
          } else {
            stryCov_9fa48("24408");
            editTextareaRef.current.style.height = stryMutAct_9fa48("24409") ? "" : (stryCov_9fa48("24409"), 'auto');
            editTextareaRef.current.style.height = stryMutAct_9fa48("24410") ? `` : (stryCov_9fa48("24410"), `${editTextareaRef.current.scrollHeight}px`);
          }
        }
      }
    };

    // Handle task navigation
    const navigateToTask = direction => {
      if (stryMutAct_9fa48("24411")) {
        {}
      } else {
        stryCov_9fa48("24411");
        const newIndex = (stryMutAct_9fa48("24414") ? direction !== 'next' : stryMutAct_9fa48("24413") ? false : stryMutAct_9fa48("24412") ? true : (stryCov_9fa48("24412", "24413", "24414"), direction === (stryMutAct_9fa48("24415") ? "" : (stryCov_9fa48("24415"), 'next')))) ? stryMutAct_9fa48("24416") ? Math.max(currentTaskIndex + 1, tasks.length - 1) : (stryCov_9fa48("24416"), Math.min(stryMutAct_9fa48("24417") ? currentTaskIndex - 1 : (stryCov_9fa48("24417"), currentTaskIndex + 1), stryMutAct_9fa48("24418") ? tasks.length + 1 : (stryCov_9fa48("24418"), tasks.length - 1))) : stryMutAct_9fa48("24419") ? Math.min(currentTaskIndex - 1, 0) : (stryCov_9fa48("24419"), Math.max(stryMutAct_9fa48("24420") ? currentTaskIndex + 1 : (stryCov_9fa48("24420"), currentTaskIndex - 1), 0));
        if (stryMutAct_9fa48("24423") ? newIndex === currentTaskIndex : stryMutAct_9fa48("24422") ? false : stryMutAct_9fa48("24421") ? true : (stryCov_9fa48("24421", "24422", "24423"), newIndex !== currentTaskIndex)) {
          if (stryMutAct_9fa48("24424")) {
            {}
          } else {
            stryCov_9fa48("24424");
            // Reset the analysis results
            setAnalysisResults(null);
            setShowAnalysisModal(stryMutAct_9fa48("24425") ? true : (stryCov_9fa48("24425"), false));

            // Update the current task index
            setCurrentTaskIndex(newIndex);

            // Set loading state
            setMessagesLoading(stryMutAct_9fa48("24426") ? false : (stryCov_9fa48("24426"), true));

            // Preserve the dayId parameter if it exists
            const params = new URLSearchParams(location.search);
            const currentDayId = stryMutAct_9fa48("24429") ? params.get('dayId') && params.get('dayNumber') : stryMutAct_9fa48("24428") ? false : stryMutAct_9fa48("24427") ? true : (stryCov_9fa48("24427", "24428", "24429"), params.get(stryMutAct_9fa48("24430") ? "" : (stryCov_9fa48("24430"), 'dayId')) || params.get(stryMutAct_9fa48("24431") ? "" : (stryCov_9fa48("24431"), 'dayNumber')));
            if (stryMutAct_9fa48("24433") ? false : stryMutAct_9fa48("24432") ? true : (stryCov_9fa48("24432", "24433"), currentDayId)) {
              if (stryMutAct_9fa48("24434")) {
                {}
              } else {
                stryCov_9fa48("24434");
                console.log(stryMutAct_9fa48("24435") ? `` : (stryCov_9fa48("24435"), `Navigating to task: ${tasks[newIndex].id} for day: ${currentDayId}`));
              }
            }

            // Use the shared fetchTaskMessages function to maintain consistency
            // This will get existing messages or set up the UI to start a new thread
            fetchTaskMessagesRef.current(tasks[newIndex].id);
          }
        }
      }
    };

    // Update startTaskThread to work with our new approach
    const startTaskThread = async taskId => {
      if (stryMutAct_9fa48("24436")) {
        {}
      } else {
        stryCov_9fa48("24436");
        if (stryMutAct_9fa48("24439") ? false : stryMutAct_9fa48("24438") ? true : stryMutAct_9fa48("24437") ? taskId : (stryCov_9fa48("24437", "24438", "24439"), !taskId)) return;

        // Check if user is active, if not, show error and return
        if (stryMutAct_9fa48("24442") ? false : stryMutAct_9fa48("24441") ? true : stryMutAct_9fa48("24440") ? isActive : (stryCov_9fa48("24440", "24441", "24442"), !isActive)) {
          if (stryMutAct_9fa48("24443")) {
            {}
          } else {
            stryCov_9fa48("24443");
            setError(stryMutAct_9fa48("24444") ? "" : (stryCov_9fa48("24444"), 'You have historical access only and cannot start new conversations.'));
            return;
          }
        }

        // Show starting message
        setMessages(stryMutAct_9fa48("24445") ? [] : (stryCov_9fa48("24445"), [stryMutAct_9fa48("24446") ? {} : (stryCov_9fa48("24446"), {
          id: stryMutAct_9fa48("24447") ? "" : (stryCov_9fa48("24447"), 'starting'),
          content: stryMutAct_9fa48("24448") ? "" : (stryCov_9fa48("24448"), 'Starting conversation...'),
          role: stryMutAct_9fa48("24449") ? "" : (stryCov_9fa48("24449"), 'system')
        })]));
        try {
          if (stryMutAct_9fa48("24450")) {
            {}
          } else {
            stryCov_9fa48("24450");
            setError(null);
            setIsSending(stryMutAct_9fa48("24451") ? false : (stryCov_9fa48("24451"), true));

            // Send the start request
            const response = await fetch(stryMutAct_9fa48("24452") ? `` : (stryCov_9fa48("24452"), `${import.meta.env.VITE_API_URL}/api/learning/messages/start`), stryMutAct_9fa48("24453") ? {} : (stryCov_9fa48("24453"), {
              method: stryMutAct_9fa48("24454") ? "" : (stryCov_9fa48("24454"), 'POST'),
              headers: stryMutAct_9fa48("24455") ? {} : (stryCov_9fa48("24455"), {
                'Content-Type': stryMutAct_9fa48("24456") ? "" : (stryCov_9fa48("24456"), 'application/json'),
                'Authorization': stryMutAct_9fa48("24457") ? `` : (stryCov_9fa48("24457"), `Bearer ${token}`)
              }),
              body: JSON.stringify(stryMutAct_9fa48("24458") ? {} : (stryCov_9fa48("24458"), {
                taskId: taskId,
                dayNumber: dayNumber,
                cohort: cohort
              }))
            }));
            if (stryMutAct_9fa48("24461") ? false : stryMutAct_9fa48("24460") ? true : stryMutAct_9fa48("24459") ? response.ok : (stryCov_9fa48("24459", "24460", "24461"), !response.ok)) {
              if (stryMutAct_9fa48("24462")) {
                {}
              } else {
                stryCov_9fa48("24462");
                throw new Error(stryMutAct_9fa48("24463") ? `` : (stryCov_9fa48("24463"), `Failed to start thread: ${response.status}`));
              }
            }

            // Get the initial message
            const data = await response.json();

            // Add the assistant message to the state
            setMessages(stryMutAct_9fa48("24464") ? [] : (stryCov_9fa48("24464"), [stryMutAct_9fa48("24465") ? {} : (stryCov_9fa48("24465"), {
              id: data.message_id,
              message_id: data.message_id,
              content: data.content,
              role: data.role,
              timestamp: new Date().toLocaleTimeString()
            })]));
          }
        } catch (error) {
          if (stryMutAct_9fa48("24466")) {
            {}
          } else {
            stryCov_9fa48("24466");
            console.error(stryMutAct_9fa48("24467") ? "" : (stryCov_9fa48("24467"), 'Error starting thread:'), error);
            if (stryMutAct_9fa48("24470") ? false : stryMutAct_9fa48("24469") ? true : stryMutAct_9fa48("24468") ? rateLimitHit : (stryCov_9fa48("24468", "24469", "24470"), !rateLimitHit)) {
              if (stryMutAct_9fa48("24471")) {
                {}
              } else {
                stryCov_9fa48("24471");
                setError(stryMutAct_9fa48("24472") ? "" : (stryCov_9fa48("24472"), 'Failed to start conversation. Please try again.'));
              }
            }
          }
        } finally {
          if (stryMutAct_9fa48("24473")) {
            {}
          } else {
            stryCov_9fa48("24473");
            setIsSending(stryMutAct_9fa48("24474") ? true : (stryCov_9fa48("24474"), false));
          }
        }
      }
    };

    // Add a retry handler function
    const handleRetry = async () => {
      if (stryMutAct_9fa48("24475")) {
        {}
      } else {
        stryCov_9fa48("24475");
        setError(null);
        setRateLimitHit(stryMutAct_9fa48("24476") ? true : (stryCov_9fa48("24476"), false));

        // Add a delay before retrying
        await new Promise(stryMutAct_9fa48("24477") ? () => undefined : (stryCov_9fa48("24477"), resolve => setTimeout(resolve, 2000))); // 2 second delay

        if (stryMutAct_9fa48("24481") ? tasks.length <= 0 : stryMutAct_9fa48("24480") ? tasks.length >= 0 : stryMutAct_9fa48("24479") ? false : stryMutAct_9fa48("24478") ? true : (stryCov_9fa48("24478", "24479", "24480", "24481"), tasks.length > 0)) {
          if (stryMutAct_9fa48("24482")) {
            {}
          } else {
            stryCov_9fa48("24482");
            fetchTaskMessagesRef.current(tasks[currentTaskIndex].id);
          }
        }
      }
    };

    // Handle deliverable submission
    const handleDeliverableSubmit = async e => {
      if (stryMutAct_9fa48("24483")) {
        {}
      } else {
        stryCov_9fa48("24483");
        e.preventDefault();
        if (stryMutAct_9fa48("24486") ? false : stryMutAct_9fa48("24485") ? true : stryMutAct_9fa48("24484") ? submissionUrl.trim() : (stryCov_9fa48("24484", "24485", "24486"), !(stryMutAct_9fa48("24487") ? submissionUrl : (stryCov_9fa48("24487"), submissionUrl.trim())))) {
          if (stryMutAct_9fa48("24488")) {
            {}
          } else {
            stryCov_9fa48("24488");
            setSubmissionError(stryMutAct_9fa48("24489") ? "" : (stryCov_9fa48("24489"), 'Please enter a valid URL'));
            return;
          }
        }
        setIsSubmitting(stryMutAct_9fa48("24490") ? false : (stryCov_9fa48("24490"), true));
        setSubmissionError(stryMutAct_9fa48("24491") ? "Stryker was here!" : (stryCov_9fa48("24491"), ''));
        try {
          if (stryMutAct_9fa48("24492")) {
            {}
          } else {
            stryCov_9fa48("24492");
            const response = await fetch(stryMutAct_9fa48("24493") ? `` : (stryCov_9fa48("24493"), `${import.meta.env.VITE_API_URL}/api/submissions`), stryMutAct_9fa48("24494") ? {} : (stryCov_9fa48("24494"), {
              method: stryMutAct_9fa48("24495") ? "" : (stryCov_9fa48("24495"), 'POST'),
              headers: stryMutAct_9fa48("24496") ? {} : (stryCov_9fa48("24496"), {
                'Content-Type': stryMutAct_9fa48("24497") ? "" : (stryCov_9fa48("24497"), 'application/json'),
                'Authorization': stryMutAct_9fa48("24498") ? `` : (stryCov_9fa48("24498"), `Bearer ${token}`)
              }),
              body: JSON.stringify(stryMutAct_9fa48("24499") ? {} : (stryCov_9fa48("24499"), {
                taskId: tasks[currentTaskIndex].id,
                content: submissionUrl
              }))
            }));
            if (stryMutAct_9fa48("24501") ? false : stryMutAct_9fa48("24500") ? true : (stryCov_9fa48("24500", "24501"), response.ok)) {
              if (stryMutAct_9fa48("24502")) {
                {}
              } else {
                stryCov_9fa48("24502");
                // Close the modal on success
                setShowSubmissionModal(stryMutAct_9fa48("24503") ? true : (stryCov_9fa48("24503"), false));
                setSubmissionUrl(stryMutAct_9fa48("24504") ? "Stryker was here!" : (stryCov_9fa48("24504"), ''));

                // Show success message without using error state
                setSuccessMessage(stryMutAct_9fa48("24505") ? "" : (stryCov_9fa48("24505"), 'Deliverable submitted successfully!'));
                setTimeout(stryMutAct_9fa48("24506") ? () => undefined : (stryCov_9fa48("24506"), () => setSuccessMessage(stryMutAct_9fa48("24507") ? "Stryker was here!" : (stryCov_9fa48("24507"), ''))), 3000);
              }
            } else {
              if (stryMutAct_9fa48("24508")) {
                {}
              } else {
                stryCov_9fa48("24508");
                const data = await response.json();
                setSubmissionError(stryMutAct_9fa48("24511") ? data.error && 'Failed to submit deliverable' : stryMutAct_9fa48("24510") ? false : stryMutAct_9fa48("24509") ? true : (stryCov_9fa48("24509", "24510", "24511"), data.error || (stryMutAct_9fa48("24512") ? "" : (stryCov_9fa48("24512"), 'Failed to submit deliverable'))));
              }
            }
          }
        } catch (err) {
          if (stryMutAct_9fa48("24513")) {
            {}
          } else {
            stryCov_9fa48("24513");
            setSubmissionError(stryMutAct_9fa48("24514") ? "" : (stryCov_9fa48("24514"), 'Network error. Please try again.'));
          }
        } finally {
          if (stryMutAct_9fa48("24515")) {
            {}
          } else {
            stryCov_9fa48("24515");
            setIsSubmitting(stryMutAct_9fa48("24516") ? true : (stryCov_9fa48("24516"), false));
          }
        }
      }
    };

    // Add a helper function to check if current task is the Independent Retrospective
    const isIndependentRetroTask = () => {
      if (stryMutAct_9fa48("24517")) {
        {}
      } else {
        stryCov_9fa48("24517");
        if (stryMutAct_9fa48("24520") ? !tasks.length && currentTaskIndex >= tasks.length : stryMutAct_9fa48("24519") ? false : stryMutAct_9fa48("24518") ? true : (stryCov_9fa48("24518", "24519", "24520"), (stryMutAct_9fa48("24521") ? tasks.length : (stryCov_9fa48("24521"), !tasks.length)) || (stryMutAct_9fa48("24524") ? currentTaskIndex < tasks.length : stryMutAct_9fa48("24523") ? currentTaskIndex > tasks.length : stryMutAct_9fa48("24522") ? false : (stryCov_9fa48("24522", "24523", "24524"), currentTaskIndex >= tasks.length)))) return stryMutAct_9fa48("24525") ? true : (stryCov_9fa48("24525"), false);
        const currentTask = tasks[currentTaskIndex];
        // Check by title - a more robust approach would be to check by task ID or type
        return stryMutAct_9fa48("24528") ? currentTask.title !== "Independent Retrospective" : stryMutAct_9fa48("24527") ? false : stryMutAct_9fa48("24526") ? true : (stryCov_9fa48("24526", "24527", "24528"), currentTask.title === (stryMutAct_9fa48("24529") ? "" : (stryCov_9fa48("24529"), "Independent Retrospective")));
      }
    };

    // Add a function to handle peer feedback completion
    const handlePeerFeedbackComplete = () => {
      if (stryMutAct_9fa48("24530")) {
        {}
      } else {
        stryCov_9fa48("24530");
        // Mark peer feedback as completed
        setPeerFeedbackCompleted(stryMutAct_9fa48("24531") ? false : (stryCov_9fa48("24531"), true));

        // Hide the peer feedback form
        setShowPeerFeedback(stryMutAct_9fa48("24532") ? true : (stryCov_9fa48("24532"), false));

        // Success status will be shown inline in the task action area
      }
    };

    // Add a function to handle peer feedback cancellation
    const handlePeerFeedbackCancel = () => {
      if (stryMutAct_9fa48("24533")) {
        {}
      } else {
        stryCov_9fa48("24533");
        // Hide the peer feedback form without marking as completed
        setShowPeerFeedback(stryMutAct_9fa48("24534") ? true : (stryCov_9fa48("24534"), false));
      }
    };

    // Add a function to show the peer feedback form
    const showPeerFeedbackForm = () => {
      if (stryMutAct_9fa48("24535")) {
        {}
      } else {
        stryCov_9fa48("24535");
        if (stryMutAct_9fa48("24538") ? isIndependentRetroTask() || isPastSession : stryMutAct_9fa48("24537") ? false : stryMutAct_9fa48("24536") ? true : (stryCov_9fa48("24536", "24537", "24538"), isIndependentRetroTask() && isPastSession)) {
          if (stryMutAct_9fa48("24539")) {
            {}
          } else {
            stryCov_9fa48("24539");
            setShowPeerFeedback(stryMutAct_9fa48("24540") ? false : (stryCov_9fa48("24540"), true));
          }
        }
      }
    };

    // Function to fetch task analysis
    const fetchTaskAnalysis = async (taskId, type = null) => {
      if (stryMutAct_9fa48("24541")) {
        {}
      } else {
        stryCov_9fa48("24541");
        if (stryMutAct_9fa48("24544") ? false : stryMutAct_9fa48("24543") ? true : stryMutAct_9fa48("24542") ? taskId : (stryCov_9fa48("24542", "24543", "24544"), !taskId)) {
          if (stryMutAct_9fa48("24545")) {
            {}
          } else {
            stryCov_9fa48("24545");
            console.log(stryMutAct_9fa48("24546") ? "" : (stryCov_9fa48("24546"), 'No taskId provided to fetchTaskAnalysis'));
            return stryMutAct_9fa48("24547") ? true : (stryCov_9fa48("24547"), false);
          }
        }
        try {
          if (stryMutAct_9fa48("24548")) {
            {}
          } else {
            stryCov_9fa48("24548");
            // Build URL with type parameter if provided
            let url = stryMutAct_9fa48("24549") ? `` : (stryCov_9fa48("24549"), `${import.meta.env.VITE_API_URL}/api/analyze-task/${taskId}/analysis`);
            if (stryMutAct_9fa48("24551") ? false : stryMutAct_9fa48("24550") ? true : (stryCov_9fa48("24550", "24551"), type)) {
              if (stryMutAct_9fa48("24552")) {
                {}
              } else {
                stryCov_9fa48("24552");
                url += stryMutAct_9fa48("24553") ? `` : (stryCov_9fa48("24553"), `?type=${type}`);
              }
            }
            const response = await fetch(url, stryMutAct_9fa48("24554") ? {} : (stryCov_9fa48("24554"), {
              headers: stryMutAct_9fa48("24555") ? {} : (stryCov_9fa48("24555"), {
                'Authorization': stryMutAct_9fa48("24556") ? `` : (stryCov_9fa48("24556"), `Bearer ${token}`)
              })
            }));
            if (stryMutAct_9fa48("24558") ? false : stryMutAct_9fa48("24557") ? true : (stryCov_9fa48("24557", "24558"), response.ok)) {
              if (stryMutAct_9fa48("24559")) {
                {}
              } else {
                stryCov_9fa48("24559");
                const data = await response.json();
                setAnalysisResults(data);
                setAnalysisType(stryMutAct_9fa48("24562") ? type && data.analysis_type : stryMutAct_9fa48("24561") ? false : stryMutAct_9fa48("24560") ? true : (stryCov_9fa48("24560", "24561", "24562"), type || data.analysis_type)); // Store which type of analysis is being viewed
                return stryMutAct_9fa48("24563") ? false : (stryCov_9fa48("24563"), true);
              }
            } else {
              if (stryMutAct_9fa48("24564")) {
                {}
              } else {
                stryCov_9fa48("24564");
                console.log(stryMutAct_9fa48("24565") ? `` : (stryCov_9fa48("24565"), `No analysis found for task ${taskId} type ${type}, status: ${response.status}`));
                if (stryMutAct_9fa48("24568") ? false : stryMutAct_9fa48("24567") ? true : stryMutAct_9fa48("24566") ? type : (stryCov_9fa48("24566", "24567", "24568"), !type)) {
                  if (stryMutAct_9fa48("24569")) {
                    {}
                  } else {
                    stryCov_9fa48("24569");
                    // Only clear results if not looking for a specific type
                    setAnalysisResults(null);
                  }
                }
                return stryMutAct_9fa48("24572") ? response.status === 404 : stryMutAct_9fa48("24571") ? false : stryMutAct_9fa48("24570") ? true : (stryCov_9fa48("24570", "24571", "24572"), response.status !== 404); // Return true for non-404 errors, false for 404 (not found)
              }
            }
          }
        } catch (error) {
          if (stryMutAct_9fa48("24573")) {
            {}
          } else {
            stryCov_9fa48("24573");
            console.error(stryMutAct_9fa48("24574") ? `` : (stryCov_9fa48("24574"), `Error fetching task analysis for task ${taskId}:`), error);
            if (stryMutAct_9fa48("24577") ? false : stryMutAct_9fa48("24576") ? true : stryMutAct_9fa48("24575") ? type : (stryCov_9fa48("24575", "24576", "24577"), !type)) {
              if (stryMutAct_9fa48("24578")) {
                {}
              } else {
                stryCov_9fa48("24578");
                // Only clear results if not looking for a specific type
                setAnalysisResults(null);
              }
            }
            return stryMutAct_9fa48("24579") ? true : (stryCov_9fa48("24579"), false);
          }
        }
      }
    };

    // Function to generate feedback for the current task
    const handleAnalyzeTask = async () => {
      if (stryMutAct_9fa48("24580")) {
        {}
      } else {
        stryCov_9fa48("24580");
        if (stryMutAct_9fa48("24583") ? !tasks.length && currentTaskIndex >= tasks.length : stryMutAct_9fa48("24582") ? false : stryMutAct_9fa48("24581") ? true : (stryCov_9fa48("24581", "24582", "24583"), (stryMutAct_9fa48("24584") ? tasks.length : (stryCov_9fa48("24584"), !tasks.length)) || (stryMutAct_9fa48("24587") ? currentTaskIndex < tasks.length : stryMutAct_9fa48("24586") ? currentTaskIndex > tasks.length : stryMutAct_9fa48("24585") ? false : (stryCov_9fa48("24585", "24586", "24587"), currentTaskIndex >= tasks.length)))) return;

        // Check if user is active
        if (stryMutAct_9fa48("24590") ? false : stryMutAct_9fa48("24589") ? true : stryMutAct_9fa48("24588") ? isActive : (stryCov_9fa48("24588", "24589", "24590"), !isActive)) {
          if (stryMutAct_9fa48("24591")) {
            {}
          } else {
            stryCov_9fa48("24591");
            setError(stryMutAct_9fa48("24592") ? "" : (stryCov_9fa48("24592"), 'You have historical access only and cannot generate new feedback.'));
            return;
          }
        }
        const currentTask = tasks[currentTaskIndex];
        setIsAnalyzing(stryMutAct_9fa48("24593") ? false : (stryCov_9fa48("24593"), true));
        setAnalysisError(null);
        try {
          if (stryMutAct_9fa48("24594")) {
            {}
          } else {
            stryCov_9fa48("24594");
            const response = await fetch(stryMutAct_9fa48("24595") ? `` : (stryCov_9fa48("24595"), `${import.meta.env.VITE_API_URL}/api/analyze-task/${currentTask.id}/analyze-chat`), stryMutAct_9fa48("24596") ? {} : (stryCov_9fa48("24596"), {
              method: stryMutAct_9fa48("24597") ? "" : (stryCov_9fa48("24597"), 'POST'),
              headers: stryMutAct_9fa48("24598") ? {} : (stryCov_9fa48("24598"), {
                'Authorization': stryMutAct_9fa48("24599") ? `` : (stryCov_9fa48("24599"), `Bearer ${token}`)
              })
            }));
            if (stryMutAct_9fa48("24602") ? false : stryMutAct_9fa48("24601") ? true : stryMutAct_9fa48("24600") ? response.ok : (stryCov_9fa48("24600", "24601", "24602"), !response.ok)) {
              if (stryMutAct_9fa48("24603")) {
                {}
              } else {
                stryCov_9fa48("24603");
                throw new Error(stryMutAct_9fa48("24604") ? "" : (stryCov_9fa48("24604"), 'Failed to analyze task'));
              }
            }
            const data = await response.json();
            setAnalysisResults(data);
            setAnalysisType(stryMutAct_9fa48("24605") ? "" : (stryCov_9fa48("24605"), 'conversation'));

            // Refresh available analyses
            await fetchAvailableAnalyses(currentTask.id);
            setShowAnalysisModal(stryMutAct_9fa48("24606") ? false : (stryCov_9fa48("24606"), true));
            // Use success message instead of error message
            setSuccessMessage(stryMutAct_9fa48("24607") ? "" : (stryCov_9fa48("24607"), 'Analysis completed successfully!'));
            setTimeout(stryMutAct_9fa48("24608") ? () => undefined : (stryCov_9fa48("24608"), () => setSuccessMessage(stryMutAct_9fa48("24609") ? "Stryker was here!" : (stryCov_9fa48("24609"), ''))), 3000);
          }
        } catch (error) {
          if (stryMutAct_9fa48("24610")) {
            {}
          } else {
            stryCov_9fa48("24610");
            setAnalysisError(error.message);
            setError((stryMutAct_9fa48("24611") ? "" : (stryCov_9fa48("24611"), 'Failed to analyze task: ')) + error.message);
          }
        } finally {
          if (stryMutAct_9fa48("24612")) {
            {}
          } else {
            stryCov_9fa48("24612");
            setIsAnalyzing(stryMutAct_9fa48("24613") ? true : (stryCov_9fa48("24613"), false));
          }
        }
      }
    };

    // Function to analyze a deliverable submission
    const handleAnalyzeDeliverable = async url => {
      if (stryMutAct_9fa48("24614")) {
        {}
      } else {
        stryCov_9fa48("24614");
        if (stryMutAct_9fa48("24617") ? !tasks.length && currentTaskIndex >= tasks.length : stryMutAct_9fa48("24616") ? false : stryMutAct_9fa48("24615") ? true : (stryCov_9fa48("24615", "24616", "24617"), (stryMutAct_9fa48("24618") ? tasks.length : (stryCov_9fa48("24618"), !tasks.length)) || (stryMutAct_9fa48("24621") ? currentTaskIndex < tasks.length : stryMutAct_9fa48("24620") ? currentTaskIndex > tasks.length : stryMutAct_9fa48("24619") ? false : (stryCov_9fa48("24619", "24620", "24621"), currentTaskIndex >= tasks.length)))) return;

        // Check if user is active
        if (stryMutAct_9fa48("24624") ? false : stryMutAct_9fa48("24623") ? true : stryMutAct_9fa48("24622") ? isActive : (stryCov_9fa48("24622", "24623", "24624"), !isActive)) {
          if (stryMutAct_9fa48("24625")) {
            {}
          } else {
            stryCov_9fa48("24625");
            setError(stryMutAct_9fa48("24626") ? "" : (stryCov_9fa48("24626"), 'You have historical access only and cannot analyze deliverables.'));
            return;
          }
        }
        const currentTask = tasks[currentTaskIndex];

        // Log debugging information
        console.log(stryMutAct_9fa48("24627") ? "" : (stryCov_9fa48("24627"), 'handleAnalyzeDeliverable called with:'), stryMutAct_9fa48("24628") ? {} : (stryCov_9fa48("24628"), {
          url,
          taskId: currentTask.id
        }));

        // Set loading state
        setIsAnalyzing(stryMutAct_9fa48("24629") ? false : (stryCov_9fa48("24629"), true));
        setError(stryMutAct_9fa48("24630") ? "Stryker was here!" : (stryCov_9fa48("24630"), ''));
        try {
          if (stryMutAct_9fa48("24631")) {
            {}
          } else {
            stryCov_9fa48("24631");
            // Call the API to analyze the deliverable
            const response = await fetch(stryMutAct_9fa48("24632") ? `` : (stryCov_9fa48("24632"), `${import.meta.env.VITE_API_URL}/api/analyze-task/${currentTask.id}/analyze-deliverable`), stryMutAct_9fa48("24633") ? {} : (stryCov_9fa48("24633"), {
              method: stryMutAct_9fa48("24634") ? "" : (stryCov_9fa48("24634"), 'POST'),
              headers: stryMutAct_9fa48("24635") ? {} : (stryCov_9fa48("24635"), {
                'Content-Type': stryMutAct_9fa48("24636") ? "" : (stryCov_9fa48("24636"), 'application/json'),
                'Authorization': stryMutAct_9fa48("24637") ? `` : (stryCov_9fa48("24637"), `Bearer ${token}`)
              }),
              body: JSON.stringify(stryMutAct_9fa48("24638") ? {} : (stryCov_9fa48("24638"), {
                url
              }))
            }));
            console.log(stryMutAct_9fa48("24639") ? "" : (stryCov_9fa48("24639"), 'Analyze deliverable response:'), response.status, response.statusText);
            if (stryMutAct_9fa48("24642") ? false : stryMutAct_9fa48("24641") ? true : stryMutAct_9fa48("24640") ? response.ok : (stryCov_9fa48("24640", "24641", "24642"), !response.ok)) {
              if (stryMutAct_9fa48("24643")) {
                {}
              } else {
                stryCov_9fa48("24643");
                const errorData = await response.json().catch(stryMutAct_9fa48("24644") ? () => undefined : (stryCov_9fa48("24644"), () => stryMutAct_9fa48("24645") ? {} : (stryCov_9fa48("24645"), {
                  error: stryMutAct_9fa48("24646") ? `` : (stryCov_9fa48("24646"), `HTTP error ${response.status}`)
                })));
                const errorMessage = stryMutAct_9fa48("24649") ? errorData.error && `Failed to analyze deliverable: ${response.status} ${response.statusText}` : stryMutAct_9fa48("24648") ? false : stryMutAct_9fa48("24647") ? true : (stryCov_9fa48("24647", "24648", "24649"), errorData.error || (stryMutAct_9fa48("24650") ? `` : (stryCov_9fa48("24650"), `Failed to analyze deliverable: ${response.status} ${response.statusText}`)));
                console.error(stryMutAct_9fa48("24651") ? "" : (stryCov_9fa48("24651"), 'Error response data:'), errorData);
                throw new Error(errorMessage);
              }
            }
            const data = await response.json();
            console.log(stryMutAct_9fa48("24652") ? "" : (stryCov_9fa48("24652"), 'Analyze deliverable success, data received'));

            // Update UI with results
            setAnalysisResults(data);
            setAnalysisType(stryMutAct_9fa48("24653") ? "" : (stryCov_9fa48("24653"), 'deliverable'));

            // Refresh available analyses
            await fetchAvailableAnalyses(currentTask.id);
            setShowAnalysisModal(stryMutAct_9fa48("24654") ? false : (stryCov_9fa48("24654"), true));
            setSuccessMessage(stryMutAct_9fa48("24655") ? "" : (stryCov_9fa48("24655"), 'Deliverable analyzed successfully!'));
            setTimeout(stryMutAct_9fa48("24656") ? () => undefined : (stryCov_9fa48("24656"), () => setSuccessMessage(stryMutAct_9fa48("24657") ? "Stryker was here!" : (stryCov_9fa48("24657"), ''))), 3000);
            return data;
          }
        } catch (error) {
          if (stryMutAct_9fa48("24658")) {
            {}
          } else {
            stryCov_9fa48("24658");
            console.error(stryMutAct_9fa48("24659") ? "" : (stryCov_9fa48("24659"), 'Error analyzing deliverable:'), error);
            setError(stryMutAct_9fa48("24660") ? `` : (stryCov_9fa48("24660"), `Failed to analyze deliverable: ${error.message}`));

            // Propagate the error so the TaskSubmission component can handle it
            throw error;
          }
        } finally {
          if (stryMutAct_9fa48("24661")) {
            {}
          } else {
            stryCov_9fa48("24661");
            setIsAnalyzing(stryMutAct_9fa48("24662") ? true : (stryCov_9fa48("24662"), false));
          }
        }
      }
    };

    // Function to handle switching between different analysis types
    const handleSwitchAnalysis = async type => {
      if (stryMutAct_9fa48("24663")) {
        {}
      } else {
        stryCov_9fa48("24663");
        if (stryMutAct_9fa48("24666") ? (!type || !tasks.length) && currentTaskIndex >= tasks.length : stryMutAct_9fa48("24665") ? false : stryMutAct_9fa48("24664") ? true : (stryCov_9fa48("24664", "24665", "24666"), (stryMutAct_9fa48("24668") ? !type && !tasks.length : stryMutAct_9fa48("24667") ? false : (stryCov_9fa48("24667", "24668"), (stryMutAct_9fa48("24669") ? type : (stryCov_9fa48("24669"), !type)) || (stryMutAct_9fa48("24670") ? tasks.length : (stryCov_9fa48("24670"), !tasks.length)))) || (stryMutAct_9fa48("24673") ? currentTaskIndex < tasks.length : stryMutAct_9fa48("24672") ? currentTaskIndex > tasks.length : stryMutAct_9fa48("24671") ? false : (stryCov_9fa48("24671", "24672", "24673"), currentTaskIndex >= tasks.length)))) return;
        const currentTask = tasks[currentTaskIndex];
        setAnalysisType(type);

        // Fetch the appropriate analysis based on type
        if (stryMutAct_9fa48("24676") ? type !== 'deliverable' : stryMutAct_9fa48("24675") ? false : stryMutAct_9fa48("24674") ? true : (stryCov_9fa48("24674", "24675", "24676"), type === (stryMutAct_9fa48("24677") ? "" : (stryCov_9fa48("24677"), 'deliverable')))) {
          if (stryMutAct_9fa48("24678")) {
            {}
          } else {
            stryCov_9fa48("24678");
            // Make sure we have the submission data for deliverable analysis
            await fetchTaskSubmission(currentTask.id);
          }
        }

        // Fetch the analysis for the selected type
        await fetchTaskAnalysis(currentTask.id, type);
      }
    };

    // Function to fetch all available analyses for a task
    const fetchAvailableAnalyses = async taskId => {
      if (stryMutAct_9fa48("24679")) {
        {}
      } else {
        stryCov_9fa48("24679");
        if (stryMutAct_9fa48("24682") ? false : stryMutAct_9fa48("24681") ? true : stryMutAct_9fa48("24680") ? taskId : (stryCov_9fa48("24680", "24681", "24682"), !taskId)) return;
        try {
          if (stryMutAct_9fa48("24683")) {
            {}
          } else {
            stryCov_9fa48("24683");
            const response = await fetch(stryMutAct_9fa48("24684") ? `` : (stryCov_9fa48("24684"), `${import.meta.env.VITE_API_URL}/api/analyze-task/${taskId}/all-analyses`), stryMutAct_9fa48("24685") ? {} : (stryCov_9fa48("24685"), {
              headers: stryMutAct_9fa48("24686") ? {} : (stryCov_9fa48("24686"), {
                'Authorization': stryMutAct_9fa48("24687") ? `` : (stryCov_9fa48("24687"), `Bearer ${token}`)
              })
            }));
            if (stryMutAct_9fa48("24689") ? false : stryMutAct_9fa48("24688") ? true : (stryCov_9fa48("24688", "24689"), response.ok)) {
              if (stryMutAct_9fa48("24690")) {
                {}
              } else {
                stryCov_9fa48("24690");
                const data = await response.json();
                setAvailableAnalyses(data);

                // If we already have a selected analysis type, keep it
                // Otherwise, select the first available type
                if (stryMutAct_9fa48("24693") ? !analysisType || Object.keys(data).length > 0 : stryMutAct_9fa48("24692") ? false : stryMutAct_9fa48("24691") ? true : (stryCov_9fa48("24691", "24692", "24693"), (stryMutAct_9fa48("24694") ? analysisType : (stryCov_9fa48("24694"), !analysisType)) && (stryMutAct_9fa48("24697") ? Object.keys(data).length <= 0 : stryMutAct_9fa48("24696") ? Object.keys(data).length >= 0 : stryMutAct_9fa48("24695") ? true : (stryCov_9fa48("24695", "24696", "24697"), Object.keys(data).length > 0)))) {
                  if (stryMutAct_9fa48("24698")) {
                    {}
                  } else {
                    stryCov_9fa48("24698");
                    const firstType = Object.keys(data)[0];
                    setAnalysisType(firstType);

                    // Load the first analysis of this type
                    if (stryMutAct_9fa48("24701") ? data[firstType] || data[firstType].length > 0 : stryMutAct_9fa48("24700") ? false : stryMutAct_9fa48("24699") ? true : (stryCov_9fa48("24699", "24700", "24701"), data[firstType] && (stryMutAct_9fa48("24704") ? data[firstType].length <= 0 : stryMutAct_9fa48("24703") ? data[firstType].length >= 0 : stryMutAct_9fa48("24702") ? true : (stryCov_9fa48("24702", "24703", "24704"), data[firstType].length > 0)))) {
                      if (stryMutAct_9fa48("24705")) {
                        {}
                      } else {
                        stryCov_9fa48("24705");
                        await fetchTaskAnalysis(taskId, firstType);
                      }
                    }
                  }
                }
                return data;
              }
            } else {
              if (stryMutAct_9fa48("24706")) {
                {}
              } else {
                stryCov_9fa48("24706");
                // 404 is expected if no analyses exist yet
                if (stryMutAct_9fa48("24709") ? response.status === 404 : stryMutAct_9fa48("24708") ? false : stryMutAct_9fa48("24707") ? true : (stryCov_9fa48("24707", "24708", "24709"), response.status !== 404)) {
                  if (stryMutAct_9fa48("24710")) {
                    {}
                  } else {
                    stryCov_9fa48("24710");
                    console.error(stryMutAct_9fa48("24711") ? `` : (stryCov_9fa48("24711"), `Error fetching analyses: ${response.status}`));
                  }
                }
                setAvailableAnalyses({});
                return {};
              }
            }
          }
        } catch (error) {
          if (stryMutAct_9fa48("24712")) {
            {}
          } else {
            stryCov_9fa48("24712");
            console.error(stryMutAct_9fa48("24713") ? `` : (stryCov_9fa48("24713"), `Error fetching analyses:`), error);
            setAvailableAnalyses({});
            return {};
          }
        }
      }
    };

    // Function to fetch the most recent submission
    const fetchTaskSubmission = async taskId => {
      if (stryMutAct_9fa48("24714")) {
        {}
      } else {
        stryCov_9fa48("24714");
        if (stryMutAct_9fa48("24717") ? false : stryMutAct_9fa48("24716") ? true : stryMutAct_9fa48("24715") ? taskId : (stryCov_9fa48("24715", "24716", "24717"), !taskId)) return null;
        try {
          if (stryMutAct_9fa48("24718")) {
            {}
          } else {
            stryCov_9fa48("24718");
            const response = await fetch(stryMutAct_9fa48("24719") ? `` : (stryCov_9fa48("24719"), `${import.meta.env.VITE_API_URL}/api/submissions/${taskId}`), stryMutAct_9fa48("24720") ? {} : (stryCov_9fa48("24720"), {
              headers: stryMutAct_9fa48("24721") ? {} : (stryCov_9fa48("24721"), {
                'Authorization': stryMutAct_9fa48("24722") ? `` : (stryCov_9fa48("24722"), `Bearer ${token}`)
              })
            }));
            if (stryMutAct_9fa48("24724") ? false : stryMutAct_9fa48("24723") ? true : (stryCov_9fa48("24723", "24724"), response.ok)) {
              if (stryMutAct_9fa48("24725")) {
                {}
              } else {
                stryCov_9fa48("24725");
                const data = await response.json();
                console.log(stryMutAct_9fa48("24726") ? "" : (stryCov_9fa48("24726"), 'Fetched submission:'), data);
                setSubmission(data);
                return data;
              }
            } else if (stryMutAct_9fa48("24729") ? response.status === 404 : stryMutAct_9fa48("24728") ? false : stryMutAct_9fa48("24727") ? true : (stryCov_9fa48("24727", "24728", "24729"), response.status !== 404)) {
              if (stryMutAct_9fa48("24730")) {
                {}
              } else {
                stryCov_9fa48("24730");
                // 404 is expected if no submission exists yet
                console.log(stryMutAct_9fa48("24731") ? `` : (stryCov_9fa48("24731"), `No submission found for task ${taskId}`));
              }
            }
            setSubmission(null);
            return null;
          }
        } catch (error) {
          if (stryMutAct_9fa48("24732")) {
            {}
          } else {
            stryCov_9fa48("24732");
            console.error(stryMutAct_9fa48("24733") ? `` : (stryCov_9fa48("24733"), `Error fetching submission for task ${taskId}:`), error);
            setSubmission(null);
            return null;
          }
        }
      }
    };

    // Function to view analysis in modal
    const handleViewAnalysis = async () => {
      if (stryMutAct_9fa48("24734")) {
        {}
      } else {
        stryCov_9fa48("24734");
        if (stryMutAct_9fa48("24737") ? !tasks.length && currentTaskIndex >= tasks.length : stryMutAct_9fa48("24736") ? false : stryMutAct_9fa48("24735") ? true : (stryCov_9fa48("24735", "24736", "24737"), (stryMutAct_9fa48("24738") ? tasks.length : (stryCov_9fa48("24738"), !tasks.length)) || (stryMutAct_9fa48("24741") ? currentTaskIndex < tasks.length : stryMutAct_9fa48("24740") ? currentTaskIndex > tasks.length : stryMutAct_9fa48("24739") ? false : (stryCov_9fa48("24739", "24740", "24741"), currentTaskIndex >= tasks.length)))) return;
        const currentTask = tasks[currentTaskIndex];

        // Fetch the task submission first
        await fetchTaskSubmission(currentTask.id);

        // Then show the modal
        setShowAnalysisModal(stryMutAct_9fa48("24742") ? false : (stryCov_9fa48("24742"), true));
      }
    };

    // Helper function to organize analysis results
    const organizeAnalysisBySubmission = analysis => {
      if (stryMutAct_9fa48("24743")) {
        {}
      } else {
        stryCov_9fa48("24743");
        if (stryMutAct_9fa48("24746") ? false : stryMutAct_9fa48("24745") ? true : stryMutAct_9fa48("24744") ? analysis : (stryCov_9fa48("24744", "24745", "24746"), !analysis)) return {};
        const result = {};

        // For conversation analysis, create a single conversation entry
        if (stryMutAct_9fa48("24749") ? analysisType !== 'conversation' : stryMutAct_9fa48("24748") ? false : stryMutAct_9fa48("24747") ? true : (stryCov_9fa48("24747", "24748", "24749"), analysisType === (stryMutAct_9fa48("24750") ? "" : (stryCov_9fa48("24750"), 'conversation')))) {
          if (stryMutAct_9fa48("24751")) {
            {}
          } else {
            stryCov_9fa48("24751");
            result[stryMutAct_9fa48("24752") ? "" : (stryCov_9fa48("24752"), 'conversation')] = stryMutAct_9fa48("24753") ? {} : (stryCov_9fa48("24753"), {
              criteria_met: stryMutAct_9fa48("24756") ? analysis.analysis_result?.criteria_met && [] : stryMutAct_9fa48("24755") ? false : stryMutAct_9fa48("24754") ? true : (stryCov_9fa48("24754", "24755", "24756"), (stryMutAct_9fa48("24757") ? analysis.analysis_result.criteria_met : (stryCov_9fa48("24757"), analysis.analysis_result?.criteria_met)) || (stryMutAct_9fa48("24758") ? ["Stryker was here"] : (stryCov_9fa48("24758"), []))),
              areas_for_improvement: stryMutAct_9fa48("24761") ? analysis.analysis_result?.areas_for_improvement && [] : stryMutAct_9fa48("24760") ? false : stryMutAct_9fa48("24759") ? true : (stryCov_9fa48("24759", "24760", "24761"), (stryMutAct_9fa48("24762") ? analysis.analysis_result.areas_for_improvement : (stryCov_9fa48("24762"), analysis.analysis_result?.areas_for_improvement)) || (stryMutAct_9fa48("24763") ? ["Stryker was here"] : (stryCov_9fa48("24763"), []))),
              feedback: stryMutAct_9fa48("24766") ? analysis.feedback && "No detailed feedback available" : stryMutAct_9fa48("24765") ? false : stryMutAct_9fa48("24764") ? true : (stryCov_9fa48("24764", "24765", "24766"), analysis.feedback || (stryMutAct_9fa48("24767") ? "" : (stryCov_9fa48("24767"), "No detailed feedback available")))
            });
          }
        } // For deliverable analysis, create a single deliverable entry
        else if (stryMutAct_9fa48("24770") ? analysisType !== 'deliverable' : stryMutAct_9fa48("24769") ? false : stryMutAct_9fa48("24768") ? true : (stryCov_9fa48("24768", "24769", "24770"), analysisType === (stryMutAct_9fa48("24771") ? "" : (stryCov_9fa48("24771"), 'deliverable')))) {
          if (stryMutAct_9fa48("24772")) {
            {}
          } else {
            stryCov_9fa48("24772");
            result[stryMutAct_9fa48("24773") ? "" : (stryCov_9fa48("24773"), 'deliverable')] = stryMutAct_9fa48("24774") ? {} : (stryCov_9fa48("24774"), {
              criteria_met: stryMutAct_9fa48("24777") ? analysis.analysis_result?.criteria_met && [] : stryMutAct_9fa48("24776") ? false : stryMutAct_9fa48("24775") ? true : (stryCov_9fa48("24775", "24776", "24777"), (stryMutAct_9fa48("24778") ? analysis.analysis_result.criteria_met : (stryCov_9fa48("24778"), analysis.analysis_result?.criteria_met)) || (stryMutAct_9fa48("24779") ? ["Stryker was here"] : (stryCov_9fa48("24779"), []))),
              areas_for_improvement: stryMutAct_9fa48("24782") ? analysis.analysis_result?.areas_for_improvement && [] : stryMutAct_9fa48("24781") ? false : stryMutAct_9fa48("24780") ? true : (stryCov_9fa48("24780", "24781", "24782"), (stryMutAct_9fa48("24783") ? analysis.analysis_result.areas_for_improvement : (stryCov_9fa48("24783"), analysis.analysis_result?.areas_for_improvement)) || (stryMutAct_9fa48("24784") ? ["Stryker was here"] : (stryCov_9fa48("24784"), []))),
              feedback: stryMutAct_9fa48("24787") ? analysis.feedback && "No detailed feedback available" : stryMutAct_9fa48("24786") ? false : stryMutAct_9fa48("24785") ? true : (stryCov_9fa48("24785", "24786", "24787"), analysis.feedback || (stryMutAct_9fa48("24788") ? "" : (stryCov_9fa48("24788"), "No detailed feedback available")))
            });
          }
        }
        return result;
      }
    };

    // Get a list of available analysis types
    const getAvailableAnalysisTypes = () => {
      if (stryMutAct_9fa48("24789")) {
        {}
      } else {
        stryCov_9fa48("24789");
        if (stryMutAct_9fa48("24792") ? false : stryMutAct_9fa48("24791") ? true : stryMutAct_9fa48("24790") ? availableAnalyses : (stryCov_9fa48("24790", "24791", "24792"), !availableAnalyses)) return stryMutAct_9fa48("24793") ? ["Stryker was here"] : (stryCov_9fa48("24793"), []);
        return Object.keys(availableAnalyses);
      }
    };
    if (stryMutAct_9fa48("24795") ? false : stryMutAct_9fa48("24794") ? true : (stryCov_9fa48("24794", "24795"), isLoading)) {
      if (stryMutAct_9fa48("24796")) {
        {}
      } else {
        stryCov_9fa48("24796");
        return <div className="learning past-session">
        <div className="learning__content">
          <div className={stryMutAct_9fa48("24797") ? `` : (stryCov_9fa48("24797"), `learning__chat-container ${(stryMutAct_9fa48("24801") ? currentTaskIndex >= tasks.length : stryMutAct_9fa48("24800") ? currentTaskIndex <= tasks.length : stryMutAct_9fa48("24799") ? false : stryMutAct_9fa48("24798") ? true : (stryCov_9fa48("24798", "24799", "24800", "24801"), currentTaskIndex < tasks.length)) ? stryMutAct_9fa48("24802") ? `` : (stryCov_9fa48("24802"), `learning__chat-container--${stryMutAct_9fa48("24805") ? tasks[currentTaskIndex].task_mode && 'basic' : stryMutAct_9fa48("24804") ? false : stryMutAct_9fa48("24803") ? true : (stryCov_9fa48("24803", "24804", "24805"), tasks[currentTaskIndex].task_mode || (stryMutAct_9fa48("24806") ? "" : (stryCov_9fa48("24806"), 'basic')))}`) : stryMutAct_9fa48("24807") ? "Stryker was here!" : (stryCov_9fa48("24807"), '')}`)}>
            <div className="learning__loading">
              <p>Loading session details...</p>
            </div>
          </div>
        </div>
      </div>;
      }
    }
    if (stryMutAct_9fa48("24810") ? error && !daySchedule : stryMutAct_9fa48("24809") ? false : stryMutAct_9fa48("24808") ? true : (stryCov_9fa48("24808", "24809", "24810"), error || (stryMutAct_9fa48("24811") ? daySchedule : (stryCov_9fa48("24811"), !daySchedule)))) {
      if (stryMutAct_9fa48("24812")) {
        {}
      } else {
        stryCov_9fa48("24812");
        return <div className="learning past-session">
        <div className="learning__content">
          <div className={stryMutAct_9fa48("24813") ? `` : (stryCov_9fa48("24813"), `learning__chat-container ${(stryMutAct_9fa48("24817") ? currentTaskIndex >= tasks.length : stryMutAct_9fa48("24816") ? currentTaskIndex <= tasks.length : stryMutAct_9fa48("24815") ? false : stryMutAct_9fa48("24814") ? true : (stryCov_9fa48("24814", "24815", "24816", "24817"), currentTaskIndex < tasks.length)) ? stryMutAct_9fa48("24818") ? `` : (stryCov_9fa48("24818"), `learning__chat-container--${stryMutAct_9fa48("24821") ? tasks[currentTaskIndex].task_mode && 'basic' : stryMutAct_9fa48("24820") ? false : stryMutAct_9fa48("24819") ? true : (stryCov_9fa48("24819", "24820", "24821"), tasks[currentTaskIndex].task_mode || (stryMutAct_9fa48("24822") ? "" : (stryCov_9fa48("24822"), 'basic')))}`) : stryMutAct_9fa48("24823") ? "Stryker was here!" : (stryCov_9fa48("24823"), '')}`)}>
            <div className="learning__error">
              <h2>Error</h2>
              <p>{stryMutAct_9fa48("24826") ? error && 'Unable to load session details' : stryMutAct_9fa48("24825") ? false : stryMutAct_9fa48("24824") ? true : (stryCov_9fa48("24824", "24825", "24826"), error || (stryMutAct_9fa48("24827") ? "" : (stryCov_9fa48("24827"), 'Unable to load session details')))}</p>
              <button onClick={handleBackToCalendar} className="learning__back-btn">
                Back to Calendar
              </button>
            </div>
          </div>
        </div>
      </div>;
      }
    }
    const {
      day
    } = daySchedule;

    // Force the date to be interpreted in UTC to match what's in the database
    const formattedDate = new Date(day.day_date).toLocaleDateString(stryMutAct_9fa48("24828") ? "" : (stryCov_9fa48("24828"), 'en-US'), stryMutAct_9fa48("24829") ? {} : (stryCov_9fa48("24829"), {
      weekday: stryMutAct_9fa48("24830") ? "" : (stryCov_9fa48("24830"), 'long'),
      year: stryMutAct_9fa48("24831") ? "" : (stryCov_9fa48("24831"), 'numeric'),
      month: stryMutAct_9fa48("24832") ? "" : (stryCov_9fa48("24832"), 'long'),
      day: stryMutAct_9fa48("24833") ? "" : (stryCov_9fa48("24833"), 'numeric'),
      timeZone: stryMutAct_9fa48("24834") ? "" : (stryCov_9fa48("24834"), 'UTC') // This is the key - interpret the date in UTC
    }));
    return <div className="learning past-session">
      {renderHistoricalBanner()}
      <div className="learning__content">
        <div className="learning__task-panel">
          <div className="learning__task-header learning__task-header--with-back">
            <div className="past-session__date-display">
              <FaCalendarAlt /> {formattedDate}
            </div>
          </div>
          
          {stryMutAct_9fa48("24837") ? day.daily_goal || <div className="past-session__goal">
              <h2>Daily Goal</h2>
              <p>{day.daily_goal}</p>
            </div> : stryMutAct_9fa48("24836") ? false : stryMutAct_9fa48("24835") ? true : (stryCov_9fa48("24835", "24836", "24837"), day.daily_goal && <div className="past-session__goal">
              <h2>Daily Goal</h2>
              <p>{day.daily_goal}</p>
            </div>)}
          
          {tasksLoading ? <div className="learning__loading-tasks">
              <p>Loading tasks...</p>
            </div> : (stryMutAct_9fa48("24841") ? tasks.length <= 0 : stryMutAct_9fa48("24840") ? tasks.length >= 0 : stryMutAct_9fa48("24839") ? false : stryMutAct_9fa48("24838") ? true : (stryCov_9fa48("24838", "24839", "24840", "24841"), tasks.length > 0)) ? <div className="learning__tasks-list">
              {tasks.map(stryMutAct_9fa48("24842") ? () => undefined : (stryCov_9fa48("24842"), (task, index) => <div key={task.id} className={stryMutAct_9fa48("24843") ? `` : (stryCov_9fa48("24843"), `learning__task-item ${(stryMutAct_9fa48("24846") ? index !== currentTaskIndex : stryMutAct_9fa48("24845") ? false : stryMutAct_9fa48("24844") ? true : (stryCov_9fa48("24844", "24845", "24846"), index === currentTaskIndex)) ? stryMutAct_9fa48("24847") ? "" : (stryCov_9fa48("24847"), 'current') : stryMutAct_9fa48("24848") ? "Stryker was here!" : (stryCov_9fa48("24848"), '')}`)} data-mode={stryMutAct_9fa48("24851") ? task.task_mode && 'basic' : stryMutAct_9fa48("24850") ? false : stryMutAct_9fa48("24849") ? true : (stryCov_9fa48("24849", "24850", "24851"), task.task_mode || (stryMutAct_9fa48("24852") ? "" : (stryCov_9fa48("24852"), 'basic')))} onClick={() => {
              if (stryMutAct_9fa48("24853")) {
                {}
              } else {
                stryCov_9fa48("24853");
                if (stryMutAct_9fa48("24856") ? index === currentTaskIndex : stryMutAct_9fa48("24855") ? false : stryMutAct_9fa48("24854") ? true : (stryCov_9fa48("24854", "24855", "24856"), index !== currentTaskIndex)) {
                  if (stryMutAct_9fa48("24857")) {
                    {}
                  } else {
                    stryCov_9fa48("24857");
                    // Update the task index
                    setCurrentTaskIndex(index);

                    // Reset analysis state
                    setAnalysisResults(null);
                    setShowAnalysisModal(stryMutAct_9fa48("24858") ? true : (stryCov_9fa48("24858"), false));

                    // Set loading state
                    setMessagesLoading(stryMutAct_9fa48("24859") ? false : (stryCov_9fa48("24859"), true));

                    // Get task messages - first try to GET existing messages, if none exist 
                    // the function will handle starting a new thread if needed
                    fetchTaskMessagesRef.current(task.id);
                  }
                }
              }
            }}>
                  <div className="learning__task-icon">
                    {getTaskIcon(task.type, task.task_mode, task.feedback_slot)}
                  </div>
                  <div className="learning__task-content">
                    <h3 className="learning__task-title">
                      <span className="learning__task-title-text">{task.title}</span>

                      {stryMutAct_9fa48("24862") ? task.deliverable_type === 'link' || task.deliverable_type === 'file' || task.deliverable_type === 'document' || task.deliverable_type === 'video' || <span className="learning__task-deliverable-indicator">
                          <FaLink />
                        </span> : stryMutAct_9fa48("24861") ? false : stryMutAct_9fa48("24860") ? true : (stryCov_9fa48("24860", "24861", "24862"), (stryMutAct_9fa48("24864") ? (task.deliverable_type === 'link' || task.deliverable_type === 'file' || task.deliverable_type === 'document') && task.deliverable_type === 'video' : stryMutAct_9fa48("24863") ? true : (stryCov_9fa48("24863", "24864"), (stryMutAct_9fa48("24866") ? (task.deliverable_type === 'link' || task.deliverable_type === 'file') && task.deliverable_type === 'document' : stryMutAct_9fa48("24865") ? false : (stryCov_9fa48("24865", "24866"), (stryMutAct_9fa48("24868") ? task.deliverable_type === 'link' && task.deliverable_type === 'file' : stryMutAct_9fa48("24867") ? false : (stryCov_9fa48("24867", "24868"), (stryMutAct_9fa48("24870") ? task.deliverable_type !== 'link' : stryMutAct_9fa48("24869") ? false : (stryCov_9fa48("24869", "24870"), task.deliverable_type === (stryMutAct_9fa48("24871") ? "" : (stryCov_9fa48("24871"), 'link')))) || (stryMutAct_9fa48("24873") ? task.deliverable_type !== 'file' : stryMutAct_9fa48("24872") ? false : (stryCov_9fa48("24872", "24873"), task.deliverable_type === (stryMutAct_9fa48("24874") ? "" : (stryCov_9fa48("24874"), 'file')))))) || (stryMutAct_9fa48("24876") ? task.deliverable_type !== 'document' : stryMutAct_9fa48("24875") ? false : (stryCov_9fa48("24875", "24876"), task.deliverable_type === (stryMutAct_9fa48("24877") ? "" : (stryCov_9fa48("24877"), 'document')))))) || (stryMutAct_9fa48("24879") ? task.deliverable_type !== 'video' : stryMutAct_9fa48("24878") ? false : (stryCov_9fa48("24878", "24879"), task.deliverable_type === (stryMutAct_9fa48("24880") ? "" : (stryCov_9fa48("24880"), 'video')))))) && <span className="learning__task-deliverable-indicator">
                          <FaLink />
                        </span>)}
                    </h3>

                  </div>
                </div>))}
            </div> : <div className="learning__no-tasks">
              <p>No tasks available for this day.</p>
              <button className="past-session__back-to-calendar" onClick={handleBackToCalendar}>
                Check other days on the calendar
              </button>
            </div>}
          
          {/* Add Peer Feedback button for Independent Retrospective tasks */}
          {stryMutAct_9fa48("24883") ? isIndependentRetroTask() && isPastSession && messages.length > 0 || <div className="past-session__task-action">
              {peerFeedbackCompleted ? <div className="past-session__feedback-status">
                  <FaCheck /> Peer feedback submitted successfully!
                </div> : <button className="past-session__feedback-btn" onClick={showPeerFeedbackForm}>
                  <FaUsers /> Provide Peer Feedback
                </button>}
            </div> : stryMutAct_9fa48("24882") ? false : stryMutAct_9fa48("24881") ? true : (stryCov_9fa48("24881", "24882", "24883"), (stryMutAct_9fa48("24885") ? isIndependentRetroTask() && isPastSession || messages.length > 0 : stryMutAct_9fa48("24884") ? true : (stryCov_9fa48("24884", "24885"), (stryMutAct_9fa48("24887") ? isIndependentRetroTask() || isPastSession : stryMutAct_9fa48("24886") ? true : (stryCov_9fa48("24886", "24887"), isIndependentRetroTask() && isPastSession)) && (stryMutAct_9fa48("24890") ? messages.length <= 0 : stryMutAct_9fa48("24889") ? messages.length >= 0 : stryMutAct_9fa48("24888") ? true : (stryCov_9fa48("24888", "24889", "24890"), messages.length > 0)))) && <div className="past-session__task-action">
              {peerFeedbackCompleted ? <div className="past-session__feedback-status">
                  <FaCheck /> Peer feedback submitted successfully!
                </div> : <button className="past-session__feedback-btn" onClick={showPeerFeedbackForm}>
                  <FaUsers /> Provide Peer Feedback
                </button>}
            </div>)}
          
          <button className="back-to-calendar-btn" onClick={handleBackToCalendar}>
            <FaArrowLeft /> Back to Calendar
          </button>
        </div>
        
        <div className={stryMutAct_9fa48("24891") ? `` : (stryCov_9fa48("24891"), `learning__chat-container ${(stryMutAct_9fa48("24895") ? currentTaskIndex >= tasks.length : stryMutAct_9fa48("24894") ? currentTaskIndex <= tasks.length : stryMutAct_9fa48("24893") ? false : stryMutAct_9fa48("24892") ? true : (stryCov_9fa48("24892", "24893", "24894", "24895"), currentTaskIndex < tasks.length)) ? stryMutAct_9fa48("24896") ? `` : (stryCov_9fa48("24896"), `learning__chat-container--${tasks[currentTaskIndex].task_mode}`) : stryMutAct_9fa48("24897") ? "Stryker was here!" : (stryCov_9fa48("24897"), '')}`)}>
          {showPeerFeedback ?
          // Show the peer feedback form when needed
          <PeerFeedbackForm dayNumber={stryMutAct_9fa48("24900") ? daySchedule?.day?.day_number && dayNumber : stryMutAct_9fa48("24899") ? false : stryMutAct_9fa48("24898") ? true : (stryCov_9fa48("24898", "24899", "24900"), (stryMutAct_9fa48("24902") ? daySchedule.day?.day_number : stryMutAct_9fa48("24901") ? daySchedule?.day.day_number : (stryCov_9fa48("24901", "24902"), daySchedule?.day?.day_number)) || dayNumber)} onComplete={handlePeerFeedbackComplete} onCancel={handlePeerFeedbackCancel} /> : (stryMutAct_9fa48("24905") ? tasks.length > 0 || tasks[currentTaskIndex]?.feedback_slot : stryMutAct_9fa48("24904") ? false : stryMutAct_9fa48("24903") ? true : (stryCov_9fa48("24903", "24904", "24905"), (stryMutAct_9fa48("24908") ? tasks.length <= 0 : stryMutAct_9fa48("24907") ? tasks.length >= 0 : stryMutAct_9fa48("24906") ? true : (stryCov_9fa48("24906", "24907", "24908"), tasks.length > 0)) && (stryMutAct_9fa48("24909") ? tasks[currentTaskIndex].feedback_slot : (stryCov_9fa48("24909"), tasks[currentTaskIndex]?.feedback_slot)))) ?
          // Show the builder feedback form for feedback_slot tasks
          <BuilderFeedbackForm taskId={tasks[currentTaskIndex].id} dayNumber={stryMutAct_9fa48("24912") ? daySchedule?.day?.day_number && dayNumber : stryMutAct_9fa48("24911") ? false : stryMutAct_9fa48("24910") ? true : (stryCov_9fa48("24910", "24911", "24912"), (stryMutAct_9fa48("24914") ? daySchedule.day?.day_number : stryMutAct_9fa48("24913") ? daySchedule?.day.day_number : (stryCov_9fa48("24913", "24914"), daySchedule?.day?.day_number)) || dayNumber)} cohort={cohort} onComplete={() => {
            if (stryMutAct_9fa48("24915")) {
              {}
            } else {
              stryCov_9fa48("24915");
              // Optional: Add any completion logic here
              console.log(stryMutAct_9fa48("24916") ? "" : (stryCov_9fa48("24916"), 'Builder feedback completed'));
            }
          }} /> : <div className="learning__chat-panel">
              {tasksLoading ? <div className="past-session__loading-details">
                  <p>Loading task details...</p>
                </div> : (stryMutAct_9fa48("24919") ? tasks.length > 0 && tasks[currentTaskIndex]?.resources || tasks[currentTaskIndex].resources.length > 0 : stryMutAct_9fa48("24918") ? false : stryMutAct_9fa48("24917") ? true : (stryCov_9fa48("24917", "24918", "24919"), (stryMutAct_9fa48("24921") ? tasks.length > 0 || tasks[currentTaskIndex]?.resources : stryMutAct_9fa48("24920") ? true : (stryCov_9fa48("24920", "24921"), (stryMutAct_9fa48("24924") ? tasks.length <= 0 : stryMutAct_9fa48("24923") ? tasks.length >= 0 : stryMutAct_9fa48("24922") ? true : (stryCov_9fa48("24922", "24923", "24924"), tasks.length > 0)) && (stryMutAct_9fa48("24925") ? tasks[currentTaskIndex].resources : (stryCov_9fa48("24925"), tasks[currentTaskIndex]?.resources)))) && (stryMutAct_9fa48("24928") ? tasks[currentTaskIndex].resources.length <= 0 : stryMutAct_9fa48("24927") ? tasks[currentTaskIndex].resources.length >= 0 : stryMutAct_9fa48("24926") ? true : (stryCov_9fa48("24926", "24927", "24928"), tasks[currentTaskIndex].resources.length > 0)))) ? <div className="past-session__task-resources-container">
                  {renderTaskResources(tasks[currentTaskIndex].resources)}
                </div> : (stryMutAct_9fa48("24932") ? tasks.length <= 0 : stryMutAct_9fa48("24931") ? tasks.length >= 0 : stryMutAct_9fa48("24930") ? false : stryMutAct_9fa48("24929") ? true : (stryCov_9fa48("24929", "24930", "24931", "24932"), tasks.length > 0)) ? <div className="past-session__no-resources">
                  <p>No resources available for this task.</p>
                </div> : null}
              
              {/* Message display area - updated to show messages */}
              <div className={stryMutAct_9fa48("24933") ? `` : (stryCov_9fa48("24933"), `learning__messages ${messagesLoading ? stryMutAct_9fa48("24934") ? "" : (stryCov_9fa48("24934"), 'loading') : stryMutAct_9fa48("24935") ? "Stryker was here!" : (stryCov_9fa48("24935"), '')} ${(stryMutAct_9fa48("24938") ? editingMessageId === null : stryMutAct_9fa48("24937") ? false : stryMutAct_9fa48("24936") ? true : (stryCov_9fa48("24936", "24937", "24938"), editingMessageId !== null)) ? stryMutAct_9fa48("24939") ? "" : (stryCov_9fa48("24939"), 'has-editing-message') : stryMutAct_9fa48("24940") ? "Stryker was here!" : (stryCov_9fa48("24940"), '')}`)}>
                {(stryMutAct_9fa48("24943") ? messagesLoading && isLazyLoading : stryMutAct_9fa48("24942") ? false : stryMutAct_9fa48("24941") ? true : (stryCov_9fa48("24941", "24942", "24943"), messagesLoading || isLazyLoading)) ? <div className="past-session__loading-messages">
                    <p>
                      {isLazyLoading ? stryMutAct_9fa48("24944") ? "" : (stryCov_9fa48("24944"), 'Preparing to load messages...') : stryMutAct_9fa48("24945") ? "" : (stryCov_9fa48("24945"), 'Loading previous messages...')}
                    </p>
                  </div> : <div className={stryMutAct_9fa48("24946") ? `` : (stryCov_9fa48("24946"), `learning__messages ${messagesLoading ? stryMutAct_9fa48("24947") ? "" : (stryCov_9fa48("24947"), 'loading') : stryMutAct_9fa48("24948") ? "Stryker was here!" : (stryCov_9fa48("24948"), '')} ${(stryMutAct_9fa48("24951") ? editingMessageId === null : stryMutAct_9fa48("24950") ? false : stryMutAct_9fa48("24949") ? true : (stryCov_9fa48("24949", "24950", "24951"), editingMessageId !== null)) ? stryMutAct_9fa48("24952") ? "" : (stryCov_9fa48("24952"), 'has-editing-message') : stryMutAct_9fa48("24953") ? "Stryker was here!" : (stryCov_9fa48("24953"), '')}`)}>
                    {(stryMutAct_9fa48("24957") ? messages.length <= 0 : stryMutAct_9fa48("24956") ? messages.length >= 0 : stryMutAct_9fa48("24955") ? false : stryMutAct_9fa48("24954") ? true : (stryCov_9fa48("24954", "24955", "24956", "24957"), messages.length > 0)) ? messages.map(stryMutAct_9fa48("24958") ? () => undefined : (stryCov_9fa48("24958"), message => <div key={message.id} className={stryMutAct_9fa48("24959") ? `` : (stryCov_9fa48("24959"), `learning__message learning__message--${message.role} ${(stryMutAct_9fa48("24962") ? String(editingMessageId) !== String(message.id) : stryMutAct_9fa48("24961") ? false : stryMutAct_9fa48("24960") ? true : (stryCov_9fa48("24960", "24961", "24962"), String(editingMessageId) === String(message.id))) ? stryMutAct_9fa48("24963") ? "" : (stryCov_9fa48("24963"), 'editing') : stryMutAct_9fa48("24964") ? "Stryker was here!" : (stryCov_9fa48("24964"), '')}`)}>
                          <div className={stryMutAct_9fa48("24965") ? `` : (stryCov_9fa48("24965"), `learning__message-content ${(stryMutAct_9fa48("24968") ? message.role === 'user' || isPastSession : stryMutAct_9fa48("24967") ? false : stryMutAct_9fa48("24966") ? true : (stryCov_9fa48("24966", "24967", "24968"), (stryMutAct_9fa48("24970") ? message.role !== 'user' : stryMutAct_9fa48("24969") ? true : (stryCov_9fa48("24969", "24970"), message.role === (stryMutAct_9fa48("24971") ? "" : (stryCov_9fa48("24971"), 'user')))) && isPastSession)) ? stryMutAct_9fa48("24972") ? "" : (stryCov_9fa48("24972"), 'learning__message-content--editable') : stryMutAct_9fa48("24973") ? "Stryker was here!" : (stryCov_9fa48("24973"), '')}`)} onClick={(stryMutAct_9fa48("24976") ? message.role === 'user' && editingMessageId === null || isPastSession : stryMutAct_9fa48("24975") ? false : stryMutAct_9fa48("24974") ? true : (stryCov_9fa48("24974", "24975", "24976"), (stryMutAct_9fa48("24978") ? message.role === 'user' || editingMessageId === null : stryMutAct_9fa48("24977") ? true : (stryCov_9fa48("24977", "24978"), (stryMutAct_9fa48("24980") ? message.role !== 'user' : stryMutAct_9fa48("24979") ? true : (stryCov_9fa48("24979", "24980"), message.role === (stryMutAct_9fa48("24981") ? "" : (stryCov_9fa48("24981"), 'user')))) && (stryMutAct_9fa48("24983") ? editingMessageId !== null : stryMutAct_9fa48("24982") ? true : (stryCov_9fa48("24982", "24983"), editingMessageId === null)))) && isPastSession)) ? stryMutAct_9fa48("24984") ? () => undefined : (stryCov_9fa48("24984"), () => handleEditMessage(message)) : undefined}>
                            {(stryMutAct_9fa48("24987") ? String(editingMessageId) !== String(message.id) : stryMutAct_9fa48("24986") ? false : stryMutAct_9fa48("24985") ? true : (stryCov_9fa48("24985", "24986", "24987"), String(editingMessageId) === String(message.id))) ? <div className="learning__message-edit">
                                <textarea ref={editTextareaRef} value={editMessageContent} onChange={handleEditTextareaChange} className="learning__edit-textarea" disabled={isUpdating} placeholder="Edit your message..." />
                                <div className="learning__edit-actions">
                                  <button onClick={stryMutAct_9fa48("24988") ? () => undefined : (stryCov_9fa48("24988"), () => handleUpdateMessage(message.id))} className="learning__edit-save-btn" disabled={isUpdating}>
                                    {isUpdating ? stryMutAct_9fa48("24989") ? "" : (stryCov_9fa48("24989"), 'Saving...') : <FaCheck />}
                                  </button>
                                  <button onClick={handleCancelEdit} className="learning__edit-cancel-btn" disabled={isUpdating}>
                                    <FaTimes />
                                  </button>
                                </div>
                              </div> : <>
                                {formatMessageContent(message.content)}
                                {stryMutAct_9fa48("24992") ? message.updated || <span className="learning__message-edited-indicator">(edited)</span> : stryMutAct_9fa48("24991") ? false : stryMutAct_9fa48("24990") ? true : (stryCov_9fa48("24990", "24991", "24992"), message.updated && <span className="learning__message-edited-indicator">(edited)</span>)}
                              </>}
                          </div>
                        </div>)) : isAiThinking ? <div className="past-session__loading-messages">
                        <p>Starting conversation for this task...</p>
                      </div> : <div className="past-session__message-note">
                        {rateLimitHit ? <div className="past-session__error-note">
                            <p>The server is busy at the moment. Please wait a moment before trying again.</p>
                            <button onClick={handleRetry} className="past-session__retry-btn" disabled={isLazyLoading}>
                              Try Again
                            </button>
                          </div> : <>
                            <p>No previous messages available for this task.</p>
                            {stryMutAct_9fa48("24995") ? isPastSession || <button onClick={() => tasks.length > 0 && currentTaskIndex < tasks.length && startTaskThread(tasks[currentTaskIndex].id)} className="past-session__start-conversation-btn" disabled={!isActive || !tasks.length || tasksLoading || isLazyLoading}>
                                {isLazyLoading ? 'Preparing...' : 'Start Conversation'}
                              </button> : stryMutAct_9fa48("24994") ? false : stryMutAct_9fa48("24993") ? true : (stryCov_9fa48("24993", "24994", "24995"), isPastSession && <button onClick={stryMutAct_9fa48("24996") ? () => undefined : (stryCov_9fa48("24996"), () => stryMutAct_9fa48("24999") ? tasks.length > 0 && currentTaskIndex < tasks.length || startTaskThread(tasks[currentTaskIndex].id) : stryMutAct_9fa48("24998") ? false : stryMutAct_9fa48("24997") ? true : (stryCov_9fa48("24997", "24998", "24999"), (stryMutAct_9fa48("25001") ? tasks.length > 0 || currentTaskIndex < tasks.length : stryMutAct_9fa48("25000") ? true : (stryCov_9fa48("25000", "25001"), (stryMutAct_9fa48("25004") ? tasks.length <= 0 : stryMutAct_9fa48("25003") ? tasks.length >= 0 : stryMutAct_9fa48("25002") ? true : (stryCov_9fa48("25002", "25003", "25004"), tasks.length > 0)) && (stryMutAct_9fa48("25007") ? currentTaskIndex >= tasks.length : stryMutAct_9fa48("25006") ? currentTaskIndex <= tasks.length : stryMutAct_9fa48("25005") ? true : (stryCov_9fa48("25005", "25006", "25007"), currentTaskIndex < tasks.length)))) && startTaskThread(tasks[currentTaskIndex].id)))} className="past-session__start-conversation-btn" disabled={stryMutAct_9fa48("25010") ? (!isActive || !tasks.length || tasksLoading) && isLazyLoading : stryMutAct_9fa48("25009") ? false : stryMutAct_9fa48("25008") ? true : (stryCov_9fa48("25008", "25009", "25010"), (stryMutAct_9fa48("25012") ? (!isActive || !tasks.length) && tasksLoading : stryMutAct_9fa48("25011") ? false : (stryCov_9fa48("25011", "25012"), (stryMutAct_9fa48("25014") ? !isActive && !tasks.length : stryMutAct_9fa48("25013") ? false : (stryCov_9fa48("25013", "25014"), (stryMutAct_9fa48("25015") ? isActive : (stryCov_9fa48("25015"), !isActive)) || (stryMutAct_9fa48("25016") ? tasks.length : (stryCov_9fa48("25016"), !tasks.length)))) || tasksLoading)) || isLazyLoading)}>
                                {isLazyLoading ? stryMutAct_9fa48("25017") ? "" : (stryCov_9fa48("25017"), 'Preparing...') : stryMutAct_9fa48("25018") ? "" : (stryCov_9fa48("25018"), 'Start Conversation')}
                              </button>)}
                          </>}
                      </div>}
                    
                    {stryMutAct_9fa48("25021") ? isAiThinking || <div className="learning__message learning__message--assistant">
                        <div className="learning__message-content learning__message-content--thinking">
                          <div className="learning__typing-indicator">
                            <span></span>
                            <span></span>
                            <span></span>
                          </div>
                        </div>
                      </div> : stryMutAct_9fa48("25020") ? false : stryMutAct_9fa48("25019") ? true : (stryCov_9fa48("25019", "25020", "25021"), isAiThinking && <div className="learning__message learning__message--assistant">
                        <div className="learning__message-content learning__message-content--thinking">
                          <div className="learning__typing-indicator">
                            <span></span>
                            <span></span>
                            <span></span>
                          </div>
                        </div>
                      </div>)}
                    <div ref={messagesEndRef} />
                  </div>}
                
                {/* Display success message if there is one */}
                {stryMutAct_9fa48("25024") ? successMessage || <div className="learning__success">{successMessage}</div> : stryMutAct_9fa48("25023") ? false : stryMutAct_9fa48("25022") ? true : (stryCov_9fa48("25022", "25023", "25024"), successMessage && <div className="learning__success">{successMessage}</div>)}
              </div>
              
              {/* Task Navigation with Analysis Actions */}
              {stryMutAct_9fa48("25027") ? isPastSession && tasks.length > 0 && currentTaskIndex < tasks.length || <div className="learning__task-navigation">
                  <button className="learning__task-nav-button" onClick={() => navigateToTask('prev')} disabled={currentTaskIndex === 0}>
                    <FaArrowLeft /> Prev Task
                  </button>
                  
                  {tasks[currentTaskIndex].should_analyze && isActive && <button className="learning__task-nav-button" onClick={handleAnalyzeTask} disabled={isAnalyzing}>
                      {isAnalyzing ? 'Generating Feedback...' : 'Generate AI Feedback'}
                    </button>}
                  
                  {Object.keys(availableAnalyses).length > 0 && <button className="learning__task-nav-button" onClick={handleViewAnalysis}>
                      View Feedback
                    </button>}
                  
                  {isIndependentRetroTask() && messages.length > 0 ? peerFeedbackCompleted ? <div className="learning__feedback-status">
                        <FaCheck /> Peer feedback submitted successfully!
                      </div> : <button className="learning__feedback-btn" onClick={showPeerFeedbackForm}>
                        <FaUsers /> Provide Peer Feedback
                      </button> : <button className="learning__task-nav-button" onClick={() => navigateToTask('next')} disabled={currentTaskIndex === tasks.length - 1}>
                      Next Task <FaArrowRight />
                    </button>}
                </div> : stryMutAct_9fa48("25026") ? false : stryMutAct_9fa48("25025") ? true : (stryCov_9fa48("25025", "25026", "25027"), (stryMutAct_9fa48("25029") ? isPastSession && tasks.length > 0 || currentTaskIndex < tasks.length : stryMutAct_9fa48("25028") ? true : (stryCov_9fa48("25028", "25029"), (stryMutAct_9fa48("25031") ? isPastSession || tasks.length > 0 : stryMutAct_9fa48("25030") ? true : (stryCov_9fa48("25030", "25031"), isPastSession && (stryMutAct_9fa48("25034") ? tasks.length <= 0 : stryMutAct_9fa48("25033") ? tasks.length >= 0 : stryMutAct_9fa48("25032") ? true : (stryCov_9fa48("25032", "25033", "25034"), tasks.length > 0)))) && (stryMutAct_9fa48("25037") ? currentTaskIndex >= tasks.length : stryMutAct_9fa48("25036") ? currentTaskIndex <= tasks.length : stryMutAct_9fa48("25035") ? true : (stryCov_9fa48("25035", "25036", "25037"), currentTaskIndex < tasks.length)))) && <div className="learning__task-navigation">
                  <button className="learning__task-nav-button" onClick={stryMutAct_9fa48("25038") ? () => undefined : (stryCov_9fa48("25038"), () => navigateToTask(stryMutAct_9fa48("25039") ? "" : (stryCov_9fa48("25039"), 'prev')))} disabled={stryMutAct_9fa48("25042") ? currentTaskIndex !== 0 : stryMutAct_9fa48("25041") ? false : stryMutAct_9fa48("25040") ? true : (stryCov_9fa48("25040", "25041", "25042"), currentTaskIndex === 0)}>
                    <FaArrowLeft /> Prev Task
                  </button>
                  
                  {stryMutAct_9fa48("25045") ? tasks[currentTaskIndex].should_analyze && isActive || <button className="learning__task-nav-button" onClick={handleAnalyzeTask} disabled={isAnalyzing}>
                      {isAnalyzing ? 'Generating Feedback...' : 'Generate AI Feedback'}
                    </button> : stryMutAct_9fa48("25044") ? false : stryMutAct_9fa48("25043") ? true : (stryCov_9fa48("25043", "25044", "25045"), (stryMutAct_9fa48("25047") ? tasks[currentTaskIndex].should_analyze || isActive : stryMutAct_9fa48("25046") ? true : (stryCov_9fa48("25046", "25047"), tasks[currentTaskIndex].should_analyze && isActive)) && <button className="learning__task-nav-button" onClick={handleAnalyzeTask} disabled={isAnalyzing}>
                      {isAnalyzing ? stryMutAct_9fa48("25048") ? "" : (stryCov_9fa48("25048"), 'Generating Feedback...') : stryMutAct_9fa48("25049") ? "" : (stryCov_9fa48("25049"), 'Generate AI Feedback')}
                    </button>)}
                  
                  {stryMutAct_9fa48("25052") ? Object.keys(availableAnalyses).length > 0 || <button className="learning__task-nav-button" onClick={handleViewAnalysis}>
                      View Feedback
                    </button> : stryMutAct_9fa48("25051") ? false : stryMutAct_9fa48("25050") ? true : (stryCov_9fa48("25050", "25051", "25052"), (stryMutAct_9fa48("25055") ? Object.keys(availableAnalyses).length <= 0 : stryMutAct_9fa48("25054") ? Object.keys(availableAnalyses).length >= 0 : stryMutAct_9fa48("25053") ? true : (stryCov_9fa48("25053", "25054", "25055"), Object.keys(availableAnalyses).length > 0)) && <button className="learning__task-nav-button" onClick={handleViewAnalysis}>
                      View Feedback
                    </button>)}
                  
                  {(stryMutAct_9fa48("25058") ? isIndependentRetroTask() || messages.length > 0 : stryMutAct_9fa48("25057") ? false : stryMutAct_9fa48("25056") ? true : (stryCov_9fa48("25056", "25057", "25058"), isIndependentRetroTask() && (stryMutAct_9fa48("25061") ? messages.length <= 0 : stryMutAct_9fa48("25060") ? messages.length >= 0 : stryMutAct_9fa48("25059") ? true : (stryCov_9fa48("25059", "25060", "25061"), messages.length > 0)))) ? peerFeedbackCompleted ? <div className="learning__feedback-status">
                        <FaCheck /> Peer feedback submitted successfully!
                      </div> : <button className="learning__feedback-btn" onClick={showPeerFeedbackForm}>
                        <FaUsers /> Provide Peer Feedback
                      </button> : <button className="learning__task-nav-button" onClick={stryMutAct_9fa48("25062") ? () => undefined : (stryCov_9fa48("25062"), () => navigateToTask(stryMutAct_9fa48("25063") ? "" : (stryCov_9fa48("25063"), 'next')))} disabled={stryMutAct_9fa48("25066") ? currentTaskIndex !== tasks.length - 1 : stryMutAct_9fa48("25065") ? false : stryMutAct_9fa48("25064") ? true : (stryCov_9fa48("25064", "25065", "25066"), currentTaskIndex === (stryMutAct_9fa48("25067") ? tasks.length + 1 : (stryCov_9fa48("25067"), tasks.length - 1)))}>
                      Next Task <FaArrowRight />
                    </button>}
                </div>)}
              
              {/* Message input area for past sessions */}
              {isPastSession ? (stryMutAct_9fa48("25071") ? messages.length <= 0 : stryMutAct_9fa48("25070") ? messages.length >= 0 : stryMutAct_9fa48("25069") ? false : stryMutAct_9fa48("25068") ? true : (stryCov_9fa48("25068", "25069", "25070", "25071"), messages.length > 0)) ? <form className="learning__input-form" onSubmit={handleSendMessage}>
                    <textarea ref={textareaRef} className="learning__input" value={newMessage} onChange={handleTextareaChange} placeholder={(stryMutAct_9fa48("25072") ? isActive : (stryCov_9fa48("25072"), !isActive)) ? stryMutAct_9fa48("25073") ? "" : (stryCov_9fa48("25073"), "Historical view only") : isSending ? stryMutAct_9fa48("25074") ? "" : (stryCov_9fa48("25074"), "Sending...") : stryMutAct_9fa48("25075") ? "" : (stryCov_9fa48("25075"), "Type your message...")} disabled={stryMutAct_9fa48("25078") ? (!isActive || isSending) && isAiThinking : stryMutAct_9fa48("25077") ? false : stryMutAct_9fa48("25076") ? true : (stryCov_9fa48("25076", "25077", "25078"), (stryMutAct_9fa48("25080") ? !isActive && isSending : stryMutAct_9fa48("25079") ? false : (stryCov_9fa48("25079", "25080"), (stryMutAct_9fa48("25081") ? isActive : (stryCov_9fa48("25081"), !isActive)) || isSending)) || isAiThinking)} onKeyDown={e => {
                if (stryMutAct_9fa48("25082")) {
                  {}
                } else {
                  stryCov_9fa48("25082");
                  if (stryMutAct_9fa48("25085") ? e.key === 'Enter' || !e.shiftKey : stryMutAct_9fa48("25084") ? false : stryMutAct_9fa48("25083") ? true : (stryCov_9fa48("25083", "25084", "25085"), (stryMutAct_9fa48("25087") ? e.key !== 'Enter' : stryMutAct_9fa48("25086") ? true : (stryCov_9fa48("25086", "25087"), e.key === (stryMutAct_9fa48("25088") ? "" : (stryCov_9fa48("25088"), 'Enter')))) && (stryMutAct_9fa48("25089") ? e.shiftKey : (stryCov_9fa48("25089"), !e.shiftKey)))) {
                    if (stryMutAct_9fa48("25090")) {
                      {}
                    } else {
                      stryCov_9fa48("25090");
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }
                }
              }} rows={1} />
                    <div className="learning__input-actions">
                      {(() => {
                  if (stryMutAct_9fa48("25091")) {
                    {}
                  } else {
                    stryCov_9fa48("25091");
                    return stryMutAct_9fa48("25094") ? tasks.length > 0 && (tasks[currentTaskIndex]?.deliverable_type === 'link' || tasks[currentTaskIndex]?.deliverable_type === 'file' || tasks[currentTaskIndex]?.deliverable_type === 'document' || tasks[currentTaskIndex]?.deliverable_type === 'video') || <button type="button" className="learning__deliverable-btn" onClick={() => setShowSubmissionModal(true)} title={`Submit ${tasks[currentTaskIndex].deliverable}`}>
                            <FaLink />
                          </button> : stryMutAct_9fa48("25093") ? false : stryMutAct_9fa48("25092") ? true : (stryCov_9fa48("25092", "25093", "25094"), (stryMutAct_9fa48("25096") ? tasks.length > 0 || tasks[currentTaskIndex]?.deliverable_type === 'link' || tasks[currentTaskIndex]?.deliverable_type === 'file' || tasks[currentTaskIndex]?.deliverable_type === 'document' || tasks[currentTaskIndex]?.deliverable_type === 'video' : stryMutAct_9fa48("25095") ? true : (stryCov_9fa48("25095", "25096"), (stryMutAct_9fa48("25099") ? tasks.length <= 0 : stryMutAct_9fa48("25098") ? tasks.length >= 0 : stryMutAct_9fa48("25097") ? true : (stryCov_9fa48("25097", "25098", "25099"), tasks.length > 0)) && (stryMutAct_9fa48("25101") ? (tasks[currentTaskIndex]?.deliverable_type === 'link' || tasks[currentTaskIndex]?.deliverable_type === 'file' || tasks[currentTaskIndex]?.deliverable_type === 'document') && tasks[currentTaskIndex]?.deliverable_type === 'video' : stryMutAct_9fa48("25100") ? true : (stryCov_9fa48("25100", "25101"), (stryMutAct_9fa48("25103") ? (tasks[currentTaskIndex]?.deliverable_type === 'link' || tasks[currentTaskIndex]?.deliverable_type === 'file') && tasks[currentTaskIndex]?.deliverable_type === 'document' : stryMutAct_9fa48("25102") ? false : (stryCov_9fa48("25102", "25103"), (stryMutAct_9fa48("25105") ? tasks[currentTaskIndex]?.deliverable_type === 'link' && tasks[currentTaskIndex]?.deliverable_type === 'file' : stryMutAct_9fa48("25104") ? false : (stryCov_9fa48("25104", "25105"), (stryMutAct_9fa48("25107") ? tasks[currentTaskIndex]?.deliverable_type !== 'link' : stryMutAct_9fa48("25106") ? false : (stryCov_9fa48("25106", "25107"), (stryMutAct_9fa48("25108") ? tasks[currentTaskIndex].deliverable_type : (stryCov_9fa48("25108"), tasks[currentTaskIndex]?.deliverable_type)) === (stryMutAct_9fa48("25109") ? "" : (stryCov_9fa48("25109"), 'link')))) || (stryMutAct_9fa48("25111") ? tasks[currentTaskIndex]?.deliverable_type !== 'file' : stryMutAct_9fa48("25110") ? false : (stryCov_9fa48("25110", "25111"), (stryMutAct_9fa48("25112") ? tasks[currentTaskIndex].deliverable_type : (stryCov_9fa48("25112"), tasks[currentTaskIndex]?.deliverable_type)) === (stryMutAct_9fa48("25113") ? "" : (stryCov_9fa48("25113"), 'file')))))) || (stryMutAct_9fa48("25115") ? tasks[currentTaskIndex]?.deliverable_type !== 'document' : stryMutAct_9fa48("25114") ? false : (stryCov_9fa48("25114", "25115"), (stryMutAct_9fa48("25116") ? tasks[currentTaskIndex].deliverable_type : (stryCov_9fa48("25116"), tasks[currentTaskIndex]?.deliverable_type)) === (stryMutAct_9fa48("25117") ? "" : (stryCov_9fa48("25117"), 'document')))))) || (stryMutAct_9fa48("25119") ? tasks[currentTaskIndex]?.deliverable_type !== 'video' : stryMutAct_9fa48("25118") ? false : (stryCov_9fa48("25118", "25119"), (stryMutAct_9fa48("25120") ? tasks[currentTaskIndex].deliverable_type : (stryCov_9fa48("25120"), tasks[currentTaskIndex]?.deliverable_type)) === (stryMutAct_9fa48("25121") ? "" : (stryCov_9fa48("25121"), 'video')))))))) && <button type="button" className="learning__deliverable-btn" onClick={stryMutAct_9fa48("25122") ? () => undefined : (stryCov_9fa48("25122"), () => setShowSubmissionModal(stryMutAct_9fa48("25123") ? false : (stryCov_9fa48("25123"), true)))} title={stryMutAct_9fa48("25124") ? `` : (stryCov_9fa48("25124"), `Submit ${tasks[currentTaskIndex].deliverable}`)}>
                            <FaLink />
                          </button>);
                  }
                })()}
                    </div>
                    <button className="learning__send-btn" type="submit" disabled={stryMutAct_9fa48("25127") ? (!isActive || !newMessage.trim() || isSending) && isAiThinking : stryMutAct_9fa48("25126") ? false : stryMutAct_9fa48("25125") ? true : (stryCov_9fa48("25125", "25126", "25127"), (stryMutAct_9fa48("25129") ? (!isActive || !newMessage.trim()) && isSending : stryMutAct_9fa48("25128") ? false : (stryCov_9fa48("25128", "25129"), (stryMutAct_9fa48("25131") ? !isActive && !newMessage.trim() : stryMutAct_9fa48("25130") ? false : (stryCov_9fa48("25130", "25131"), (stryMutAct_9fa48("25132") ? isActive : (stryCov_9fa48("25132"), !isActive)) || (stryMutAct_9fa48("25133") ? newMessage.trim() : (stryCov_9fa48("25133"), !(stryMutAct_9fa48("25134") ? newMessage : (stryCov_9fa48("25134"), newMessage.trim())))))) || isSending)) || isAiThinking)}>
                      {isSending ? stryMutAct_9fa48("25135") ? "" : (stryCov_9fa48("25135"), "Sending...") : <FaPaperPlane />}
                    </button>
                  </form> : <div className="past-session__message-input-placeholder">
                    <p>Start a conversation to interact with this task</p>
                  </div> : <div className="past-session__message-disclaimer">
                  <p>This session is scheduled for the future. You can send messages on the scheduled day.</p>
                </div>}
              
              {/* Display error message if there is one */}
              {stryMutAct_9fa48("25138") ? error && !rateLimitHit || <div className="learning__error">{error}</div> : stryMutAct_9fa48("25137") ? false : stryMutAct_9fa48("25136") ? true : (stryCov_9fa48("25136", "25137", "25138"), (stryMutAct_9fa48("25140") ? error || !rateLimitHit : stryMutAct_9fa48("25139") ? true : (stryCov_9fa48("25139", "25140"), error && (stryMutAct_9fa48("25141") ? rateLimitHit : (stryCov_9fa48("25141"), !rateLimitHit)))) && <div className="learning__error">{error}</div>)}
            </div>}
        </div>
      </div>
      
      {/* Submission Modal */}
      {stryMutAct_9fa48("25144") ? showSubmissionModal || <div className="learning__modal-overlay">
          <div className="learning__modal learning__modal--submission">
            <div className="learning__modal-header">
              <h3>Submit Deliverable</h3>
              <button className="learning__modal-close" onClick={() => setShowSubmissionModal(false)}>
                &times;
              </button>
            </div>
            <div className="learning__modal-body">
              <TaskSubmission taskId={tasks[currentTaskIndex].id} deliverable={tasks[currentTaskIndex].deliverable} canAnalyzeDeliverable={Boolean(tasks[currentTaskIndex].analyze_deliverable)} onAnalyzeDeliverable={handleAnalyzeDeliverable} />
            </div>
          </div>
        </div> : stryMutAct_9fa48("25143") ? false : stryMutAct_9fa48("25142") ? true : (stryCov_9fa48("25142", "25143", "25144"), showSubmissionModal && <div className="learning__modal-overlay">
          <div className="learning__modal learning__modal--submission">
            <div className="learning__modal-header">
              <h3>Submit Deliverable</h3>
              <button className="learning__modal-close" onClick={stryMutAct_9fa48("25145") ? () => undefined : (stryCov_9fa48("25145"), () => setShowSubmissionModal(stryMutAct_9fa48("25146") ? true : (stryCov_9fa48("25146"), false)))}>
                &times;
              </button>
            </div>
            <div className="learning__modal-body">
              <TaskSubmission taskId={tasks[currentTaskIndex].id} deliverable={tasks[currentTaskIndex].deliverable} canAnalyzeDeliverable={Boolean(tasks[currentTaskIndex].analyze_deliverable)} onAnalyzeDeliverable={handleAnalyzeDeliverable} />
            </div>
          </div>
        </div>)}
      
      {/* Analysis Modal */}
      {stryMutAct_9fa48("25149") ? showAnalysisModal && analysisResults || <AnalysisModal isOpen={showAnalysisModal} onClose={() => setShowAnalysisModal(false)} analysisResults={organizeAnalysisBySubmission(analysisResults)} analysisType={analysisType} availableAnalysisTypes={getAvailableAnalysisTypes()} onSwitchAnalysisType={handleSwitchAnalysis} /> : stryMutAct_9fa48("25148") ? false : stryMutAct_9fa48("25147") ? true : (stryCov_9fa48("25147", "25148", "25149"), (stryMutAct_9fa48("25151") ? showAnalysisModal || analysisResults : stryMutAct_9fa48("25150") ? true : (stryCov_9fa48("25150", "25151"), showAnalysisModal && analysisResults)) && <AnalysisModal isOpen={showAnalysisModal} onClose={stryMutAct_9fa48("25152") ? () => undefined : (stryCov_9fa48("25152"), () => setShowAnalysisModal(stryMutAct_9fa48("25153") ? true : (stryCov_9fa48("25153"), false)))} analysisResults={organizeAnalysisBySubmission(analysisResults)} analysisType={analysisType} availableAnalysisTypes={getAvailableAnalysisTypes()} onSwitchAnalysisType={handleSwitchAnalysis} />)}
      

    </div>;
  }
}
export default PastSession;