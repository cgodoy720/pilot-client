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
import React, { useState, useRef, useEffect } from 'react';
import { FaCheckCircle, FaUsers, FaUserAlt, FaBook, FaPaperPlane, FaArrowLeft, FaArrowRight, FaBars, FaLink, FaExternalLinkAlt, FaEdit, FaCheck, FaTimes, FaFileAlt, FaVideo, FaBrain, FaComments, FaClipboardList } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import PeerFeedbackForm from '../../components/PeerFeedbackForm';
import TaskSubmission from '../../components/TaskSubmission/TaskSubmission';
import AnalysisModal from '../../components/AnalysisModal/AnalysisModal';
import BuilderFeedbackForm from '../../components/BuilderFeedbackForm/BuilderFeedbackForm';
import './Learning.css';
import '../../styles/smart-tasks.css';
function Learning() {
  if (stryMutAct_9fa48("21652")) {
    {}
  } else {
    stryCov_9fa48("21652");
    const {
      token,
      user
    } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [messages, setMessages] = useState(stryMutAct_9fa48("21653") ? ["Stryker was here"] : (stryCov_9fa48("21653"), []));
    const [newMessage, setNewMessage] = useState(stryMutAct_9fa48("21654") ? "Stryker was here!" : (stryCov_9fa48("21654"), ''));
    const [isSending, setIsSending] = useState(stryMutAct_9fa48("21655") ? true : (stryCov_9fa48("21655"), false));
    const [isAiThinking, setIsAiThinking] = useState(stryMutAct_9fa48("21656") ? true : (stryCov_9fa48("21656"), false));
    const [error, setError] = useState(stryMutAct_9fa48("21657") ? "Stryker was here!" : (stryCov_9fa48("21657"), ''));
    const [isPageLoading, setIsPageLoading] = useState(stryMutAct_9fa48("21658") ? false : (stryCov_9fa48("21658"), true));
    const [isMessagesLoading, setIsMessagesLoading] = useState(stryMutAct_9fa48("21659") ? true : (stryCov_9fa48("21659"), false));

    // Check if user has active status
    const isActive = stryMutAct_9fa48("21662") ? user?.active === false : stryMutAct_9fa48("21661") ? false : stryMutAct_9fa48("21660") ? true : (stryCov_9fa48("21660", "21661", "21662"), (stryMutAct_9fa48("21663") ? user.active : (stryCov_9fa48("21663"), user?.active)) !== (stryMutAct_9fa48("21664") ? true : (stryCov_9fa48("21664"), false)));

    // Add state variables for message editing
    const [editingMessageId, setEditingMessageId] = useState(null);
    const [editMessageContent, setEditMessageContent] = useState(stryMutAct_9fa48("21665") ? "Stryker was here!" : (stryCov_9fa48("21665"), ''));
    const [isUpdating, setIsUpdating] = useState(stryMutAct_9fa48("21666") ? true : (stryCov_9fa48("21666"), false));

    // Current day and task data
    const [currentDay, setCurrentDay] = useState(null);
    const [tasks, setTasks] = useState(stryMutAct_9fa48("21667") ? ["Stryker was here"] : (stryCov_9fa48("21667"), []));
    const [currentTaskIndex, setCurrentTaskIndex] = useState(0);

    // Get dayId from URL query parameters
    const queryParams = new URLSearchParams(location.search);
    const dayId = queryParams.get(stryMutAct_9fa48("21668") ? "" : (stryCov_9fa48("21668"), 'dayId'));
    const taskId = queryParams.get(stryMutAct_9fa48("21669") ? "" : (stryCov_9fa48("21669"), 'taskId'));
    const cohort = queryParams.get(stryMutAct_9fa48("21670") ? "" : (stryCov_9fa48("21670"), 'cohort'));
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);
    const editTextareaRef = useRef(null);

    // Add a debounce mechanism to prevent multiple calls
    const fetchingTasks = {};

    // Add state for the submission modal
    const [showSubmissionModal, setShowSubmissionModal] = useState(stryMutAct_9fa48("21671") ? true : (stryCov_9fa48("21671"), false));
    const [submissionUrl, setSubmissionUrl] = useState(stryMutAct_9fa48("21672") ? "Stryker was here!" : (stryCov_9fa48("21672"), ''));
    const [isSubmitting, setIsSubmitting] = useState(stryMutAct_9fa48("21673") ? true : (stryCov_9fa48("21673"), false));
    const [submissionError, setSubmissionError] = useState(stryMutAct_9fa48("21674") ? "Stryker was here!" : (stryCov_9fa48("21674"), ''));

    // Add state for peer feedback
    const [showPeerFeedback, setShowPeerFeedback] = useState(stryMutAct_9fa48("21675") ? true : (stryCov_9fa48("21675"), false));
    const [peerFeedbackCompleted, setPeerFeedbackCompleted] = useState(stryMutAct_9fa48("21676") ? true : (stryCov_9fa48("21676"), false));

    // Add state for task analysis
    const [isAnalyzing, setIsAnalyzing] = useState(stryMutAct_9fa48("21677") ? true : (stryCov_9fa48("21677"), false));
    const [analysisResults, setAnalysisResults] = useState(null);
    const [analysisError, setAnalysisError] = useState(null);
    const [availableAnalyses, setAvailableAnalyses] = useState({});
    const [analysisType, setAnalysisType] = useState(null);

    // Add state for modal visibility
    const [showAnalysisModal, setShowAnalysisModal] = useState(stryMutAct_9fa48("21678") ? true : (stryCov_9fa48("21678"), false));

    // Initialize submission state
    const [submission, setSubmission] = useState(null);

    // Add useEffect to log analysis results changes
    useEffect(() => {
      if (stryMutAct_9fa48("21679")) {
        {}
      } else {
        stryCov_9fa48("21679");
        console.log(stryMutAct_9fa48("21680") ? "" : (stryCov_9fa48("21680"), 'Analysis results state changed:'), analysisResults ? stryMutAct_9fa48("21681") ? "" : (stryCov_9fa48("21681"), 'Has results') : stryMutAct_9fa48("21682") ? "" : (stryCov_9fa48("21682"), 'No results'));
      }
    }, stryMutAct_9fa48("21683") ? [] : (stryCov_9fa48("21683"), [analysisResults]));

    // Helper function to format time
    const formatTime = timeString => {
      if (stryMutAct_9fa48("21684")) {
        {}
      } else {
        stryCov_9fa48("21684");
        if (stryMutAct_9fa48("21687") ? false : stryMutAct_9fa48("21686") ? true : stryMutAct_9fa48("21685") ? timeString : (stryCov_9fa48("21685", "21686", "21687"), !timeString)) return stryMutAct_9fa48("21688") ? "Stryker was here!" : (stryCov_9fa48("21688"), '');

        // If the timeString includes seconds (HH:MM:SS), remove the seconds
        const timeParts = timeString.split(stryMutAct_9fa48("21689") ? "" : (stryCov_9fa48("21689"), ':'));
        const hours = parseInt(timeParts[0], 10);
        const minutes = timeParts[1];
        const period = (stryMutAct_9fa48("21693") ? hours < 12 : stryMutAct_9fa48("21692") ? hours > 12 : stryMutAct_9fa48("21691") ? false : stryMutAct_9fa48("21690") ? true : (stryCov_9fa48("21690", "21691", "21692", "21693"), hours >= 12)) ? stryMutAct_9fa48("21694") ? "" : (stryCov_9fa48("21694"), 'PM') : stryMutAct_9fa48("21695") ? "" : (stryCov_9fa48("21695"), 'AM');
        const formattedHours = stryMutAct_9fa48("21698") ? hours % 12 && 12 : stryMutAct_9fa48("21697") ? false : stryMutAct_9fa48("21696") ? true : (stryCov_9fa48("21696", "21697", "21698"), (stryMutAct_9fa48("21699") ? hours * 12 : (stryCov_9fa48("21699"), hours % 12)) || 12); // Convert 0 to 12 for 12 AM

        return stryMutAct_9fa48("21700") ? `` : (stryCov_9fa48("21700"), `${formattedHours}:${minutes} ${period}`);
      }
    };

    // Fetch messages for the current task
    const fetchTaskMessages = async (taskId, retryCount = 0) => {
      if (stryMutAct_9fa48("21701")) {
        {}
      } else {
        stryCov_9fa48("21701");
        // Generate a unique timestamp for this fetch
        const fetchTimestamp = Date.now();
        fetchTaskMessages.lastFetchTimestamp = fetchTimestamp;
        try {
          if (stryMutAct_9fa48("21702")) {
            {}
          } else {
            stryCov_9fa48("21702");
            // Clear any previous error
            setError(stryMutAct_9fa48("21703") ? "Stryker was here!" : (stryCov_9fa48("21703"), ''));

            // Check if we already have messages for this task
            // If we're switching tasks, we might already have messages for the new task
            const existingMessages = stryMutAct_9fa48("21704") ? messages : (stryCov_9fa48("21704"), messages.filter(stryMutAct_9fa48("21705") ? () => undefined : (stryCov_9fa48("21705"), msg => stryMutAct_9fa48("21708") ? msg.role !== 'system' && !msg.content?.includes('Loading') || !msg.content?.includes('Error') : stryMutAct_9fa48("21707") ? false : stryMutAct_9fa48("21706") ? true : (stryCov_9fa48("21706", "21707", "21708"), (stryMutAct_9fa48("21710") ? msg.role !== 'system' || !msg.content?.includes('Loading') : stryMutAct_9fa48("21709") ? true : (stryCov_9fa48("21709", "21710"), (stryMutAct_9fa48("21712") ? msg.role === 'system' : stryMutAct_9fa48("21711") ? true : (stryCov_9fa48("21711", "21712"), msg.role !== (stryMutAct_9fa48("21713") ? "" : (stryCov_9fa48("21713"), 'system')))) && (stryMutAct_9fa48("21714") ? msg.content?.includes('Loading') : (stryCov_9fa48("21714"), !(stryMutAct_9fa48("21715") ? msg.content.includes('Loading') : (stryCov_9fa48("21715"), msg.content?.includes(stryMutAct_9fa48("21716") ? "" : (stryCov_9fa48("21716"), 'Loading')))))))) && (stryMutAct_9fa48("21717") ? msg.content?.includes('Error') : (stryCov_9fa48("21717"), !(stryMutAct_9fa48("21718") ? msg.content.includes('Error') : (stryCov_9fa48("21718"), msg.content?.includes(stryMutAct_9fa48("21719") ? "" : (stryCov_9fa48("21719"), 'Error'))))))))));

            // Only show loading state if we don't have meaningful messages
            if (stryMutAct_9fa48("21722") ? existingMessages.length !== 0 : stryMutAct_9fa48("21721") ? false : stryMutAct_9fa48("21720") ? true : (stryCov_9fa48("21720", "21721", "21722"), existingMessages.length === 0)) {
              if (stryMutAct_9fa48("21723")) {
                {}
              } else {
                stryCov_9fa48("21723");
                setIsMessagesLoading(stryMutAct_9fa48("21724") ? false : (stryCov_9fa48("21724"), true));

                // Show a loading message with the current task title
                const currentTask = tasks.find(stryMutAct_9fa48("21725") ? () => undefined : (stryCov_9fa48("21725"), task => stryMutAct_9fa48("21728") ? task.id !== taskId : stryMutAct_9fa48("21727") ? false : stryMutAct_9fa48("21726") ? true : (stryCov_9fa48("21726", "21727", "21728"), task.id === taskId)));
                if (stryMutAct_9fa48("21730") ? false : stryMutAct_9fa48("21729") ? true : (stryCov_9fa48("21729", "21730"), currentTask)) {
                  if (stryMutAct_9fa48("21731")) {
                    {}
                  } else {
                    stryCov_9fa48("21731");
                    setMessages(stryMutAct_9fa48("21732") ? [] : (stryCov_9fa48("21732"), [stryMutAct_9fa48("21733") ? {} : (stryCov_9fa48("21733"), {
                      id: stryMutAct_9fa48("21734") ? "" : (stryCov_9fa48("21734"), 'loading'),
                      content: stryMutAct_9fa48("21735") ? `` : (stryCov_9fa48("21735"), `Loading ${currentTask.title}...`),
                      role: stryMutAct_9fa48("21736") ? "" : (stryCov_9fa48("21736"), 'system')
                    })]));
                  }
                }
              }
            }
            console.log(stryMutAct_9fa48("21737") ? `` : (stryCov_9fa48("21737"), `Fetching messages for task ${taskId} at timestamp ${fetchTimestamp}`));

            // Add dayNumber parameter to the API request if available
            let apiUrl = stryMutAct_9fa48("21738") ? `` : (stryCov_9fa48("21738"), `${import.meta.env.VITE_API_URL}/api/learning/task-messages/${taskId}`);
            let hasQueryParam = stryMutAct_9fa48("21739") ? true : (stryCov_9fa48("21739"), false);
            if (stryMutAct_9fa48("21742") ? currentDay || currentDay.day_number : stryMutAct_9fa48("21741") ? false : stryMutAct_9fa48("21740") ? true : (stryCov_9fa48("21740", "21741", "21742"), currentDay && currentDay.day_number)) {
              if (stryMutAct_9fa48("21743")) {
                {}
              } else {
                stryCov_9fa48("21743");
                apiUrl += stryMutAct_9fa48("21744") ? `` : (stryCov_9fa48("21744"), `?dayNumber=${currentDay.day_number}`);
                hasQueryParam = stryMutAct_9fa48("21745") ? false : (stryCov_9fa48("21745"), true);
              }
            }

            // Add cohort parameter if available
            if (stryMutAct_9fa48("21747") ? false : stryMutAct_9fa48("21746") ? true : (stryCov_9fa48("21746", "21747"), cohort)) {
              if (stryMutAct_9fa48("21748")) {
                {}
              } else {
                stryCov_9fa48("21748");
                stryMutAct_9fa48("21749") ? apiUrl -= hasQueryParam ? `&cohort=${encodeURIComponent(cohort)}` : `?cohort=${encodeURIComponent(cohort)}` : (stryCov_9fa48("21749"), apiUrl += hasQueryParam ? stryMutAct_9fa48("21750") ? `` : (stryCov_9fa48("21750"), `&cohort=${encodeURIComponent(cohort)}`) : stryMutAct_9fa48("21751") ? `` : (stryCov_9fa48("21751"), `?cohort=${encodeURIComponent(cohort)}`));
              }
            }

            // First, try to get existing messages
            const response = await fetch(apiUrl, stryMutAct_9fa48("21752") ? {} : (stryCov_9fa48("21752"), {
              headers: stryMutAct_9fa48("21753") ? {} : (stryCov_9fa48("21753"), {
                'Authorization': stryMutAct_9fa48("21754") ? `` : (stryCov_9fa48("21754"), `Bearer ${token}`)
              })
            }));

            // Check if this is still the most recent fetch
            if (stryMutAct_9fa48("21757") ? fetchTaskMessages.lastFetchTimestamp === fetchTimestamp : stryMutAct_9fa48("21756") ? false : stryMutAct_9fa48("21755") ? true : (stryCov_9fa48("21755", "21756", "21757"), fetchTaskMessages.lastFetchTimestamp !== fetchTimestamp)) {
              if (stryMutAct_9fa48("21758")) {
                {}
              } else {
                stryCov_9fa48("21758");
                console.log(stryMutAct_9fa48("21759") ? `` : (stryCov_9fa48("21759"), `Aborting fetch for task ${taskId} - newer fetch in progress`));
                return;
              }
            }
            if (stryMutAct_9fa48("21762") ? false : stryMutAct_9fa48("21761") ? true : stryMutAct_9fa48("21760") ? response.ok : (stryCov_9fa48("21760", "21761", "21762"), !response.ok)) {
              if (stryMutAct_9fa48("21763")) {
                {}
              } else {
                stryCov_9fa48("21763");
                throw new Error(stryMutAct_9fa48("21764") ? `` : (stryCov_9fa48("21764"), `Failed to fetch messages: ${response.status}`));
              }
            }
            const data = await response.json();
            console.log(stryMutAct_9fa48("21765") ? `` : (stryCov_9fa48("21765"), `Received ${data.messages.length} messages for task ${taskId}`));

            // Check if this is still the most recent fetch
            if (stryMutAct_9fa48("21768") ? fetchTaskMessages.lastFetchTimestamp === fetchTimestamp : stryMutAct_9fa48("21767") ? false : stryMutAct_9fa48("21766") ? true : (stryCov_9fa48("21766", "21767", "21768"), fetchTaskMessages.lastFetchTimestamp !== fetchTimestamp)) {
              if (stryMutAct_9fa48("21769")) {
                {}
              } else {
                stryCov_9fa48("21769");
                console.log(stryMutAct_9fa48("21770") ? `` : (stryCov_9fa48("21770"), `Aborting fetch for task ${taskId} - newer fetch in progress`));
                return;
              }
            }
            if (stryMutAct_9fa48("21773") ? data.messages || data.messages.length > 0 : stryMutAct_9fa48("21772") ? false : stryMutAct_9fa48("21771") ? true : (stryCov_9fa48("21771", "21772", "21773"), data.messages && (stryMutAct_9fa48("21776") ? data.messages.length <= 0 : stryMutAct_9fa48("21775") ? data.messages.length >= 0 : stryMutAct_9fa48("21774") ? true : (stryCov_9fa48("21774", "21775", "21776"), data.messages.length > 0)))) {
              if (stryMutAct_9fa48("21777")) {
                {}
              } else {
                stryCov_9fa48("21777");
                // We have existing messages, format and display them
                const formattedMessages = data.messages.map(stryMutAct_9fa48("21778") ? () => undefined : (stryCov_9fa48("21778"), msg => stryMutAct_9fa48("21779") ? {} : (stryCov_9fa48("21779"), {
                  id: msg.message_id,
                  message_id: msg.message_id,
                  content: (stryMutAct_9fa48("21782") ? typeof msg.content !== 'object' : stryMutAct_9fa48("21781") ? false : stryMutAct_9fa48("21780") ? true : (stryCov_9fa48("21780", "21781", "21782"), typeof msg.content === (stryMutAct_9fa48("21783") ? "" : (stryCov_9fa48("21783"), 'object')))) ? JSON.stringify(msg.content) : msg.content,
                  role: msg.role,
                  timestamp: msg.timestamp
                })));

                // Filter out system metadata objects that shouldn't be displayed
                const filteredMessages = stryMutAct_9fa48("21784") ? formattedMessages : (stryCov_9fa48("21784"), formattedMessages.filter(message => {
                  if (stryMutAct_9fa48("21785")) {
                    {}
                  } else {
                    stryCov_9fa48("21785");
                    // Skip system metadata objects that shouldn't be displayed
                    if (stryMutAct_9fa48("21788") ? typeof message.content === 'string' || message.content.includes('"conversation_started":') || message.content.includes('"last_message_timestamp":') || message.content.includes('"topics_discussed":') : stryMutAct_9fa48("21787") ? false : stryMutAct_9fa48("21786") ? true : (stryCov_9fa48("21786", "21787", "21788"), (stryMutAct_9fa48("21790") ? typeof message.content !== 'string' : stryMutAct_9fa48("21789") ? true : (stryCov_9fa48("21789", "21790"), typeof message.content === (stryMutAct_9fa48("21791") ? "" : (stryCov_9fa48("21791"), 'string')))) && (stryMutAct_9fa48("21793") ? (message.content.includes('"conversation_started":') || message.content.includes('"last_message_timestamp":')) && message.content.includes('"topics_discussed":') : stryMutAct_9fa48("21792") ? true : (stryCov_9fa48("21792", "21793"), (stryMutAct_9fa48("21795") ? message.content.includes('"conversation_started":') && message.content.includes('"last_message_timestamp":') : stryMutAct_9fa48("21794") ? false : (stryCov_9fa48("21794", "21795"), message.content.includes(stryMutAct_9fa48("21796") ? "" : (stryCov_9fa48("21796"), '"conversation_started":')) || message.content.includes(stryMutAct_9fa48("21797") ? "" : (stryCov_9fa48("21797"), '"last_message_timestamp":')))) || message.content.includes(stryMutAct_9fa48("21798") ? "" : (stryCov_9fa48("21798"), '"topics_discussed":')))))) {
                      if (stryMutAct_9fa48("21799")) {
                        {}
                      } else {
                        stryCov_9fa48("21799");
                        console.log(stryMutAct_9fa48("21800") ? "" : (stryCov_9fa48("21800"), 'Skipping system metadata object'));
                        return stryMutAct_9fa48("21801") ? true : (stryCov_9fa48("21801"), false);
                      }
                    }
                    return stryMutAct_9fa48("21802") ? false : (stryCov_9fa48("21802"), true);
                  }
                }));
                console.log(stryMutAct_9fa48("21803") ? `` : (stryCov_9fa48("21803"), `Filtered out ${stryMutAct_9fa48("21804") ? formattedMessages.length + filteredMessages.length : (stryCov_9fa48("21804"), formattedMessages.length - filteredMessages.length)} system metadata messages`));
                setMessages(filteredMessages);
                console.log(stryMutAct_9fa48("21805") ? `` : (stryCov_9fa48("21805"), `Displayed ${filteredMessages.length} messages`));
              }
            } else {
              if (stryMutAct_9fa48("21806")) {
                {}
              } else {
                stryCov_9fa48("21806");
                // No existing messages, send initial 'start' message
                console.log(stryMutAct_9fa48("21807") ? `` : (stryCov_9fa48("21807"), `No existing messages found, sending initial 'start' message`));

                // Prepare message content based on whether the task has resources
                const currentTask = tasks.find(stryMutAct_9fa48("21808") ? () => undefined : (stryCov_9fa48("21808"), task => stryMutAct_9fa48("21811") ? task.id !== taskId : stryMutAct_9fa48("21810") ? false : stryMutAct_9fa48("21809") ? true : (stryCov_9fa48("21809", "21810", "21811"), task.id === taskId)));
                let messageContent = stryMutAct_9fa48("21812") ? "" : (stryCov_9fa48("21812"), 'start');
                try {
                  if (stryMutAct_9fa48("21813")) {
                    {}
                  } else {
                    stryCov_9fa48("21813");
                    // Send the initial message
                    const messageResponse = await fetch(stryMutAct_9fa48("21814") ? `` : (stryCov_9fa48("21814"), `${import.meta.env.VITE_API_URL}/api/learning/messages/start`), stryMutAct_9fa48("21815") ? {} : (stryCov_9fa48("21815"), {
                      method: stryMutAct_9fa48("21816") ? "" : (stryCov_9fa48("21816"), 'POST'),
                      headers: stryMutAct_9fa48("21817") ? {} : (stryCov_9fa48("21817"), {
                        'Content-Type': stryMutAct_9fa48("21818") ? "" : (stryCov_9fa48("21818"), 'application/json'),
                        'Authorization': stryMutAct_9fa48("21819") ? `` : (stryCov_9fa48("21819"), `Bearer ${token}`)
                      }),
                      body: JSON.stringify(stryMutAct_9fa48("21820") ? {} : (stryCov_9fa48("21820"), {
                        taskId: taskId,
                        dayNumber: stryMutAct_9fa48("21821") ? currentDay.day_number : (stryCov_9fa48("21821"), currentDay?.day_number),
                        cohort: cohort
                      }))
                    }));

                    // Check if this is still the most recent fetch
                    if (stryMutAct_9fa48("21824") ? fetchTaskMessages.lastFetchTimestamp === fetchTimestamp : stryMutAct_9fa48("21823") ? false : stryMutAct_9fa48("21822") ? true : (stryCov_9fa48("21822", "21823", "21824"), fetchTaskMessages.lastFetchTimestamp !== fetchTimestamp)) {
                      if (stryMutAct_9fa48("21825")) {
                        {}
                      } else {
                        stryCov_9fa48("21825");
                        console.log(stryMutAct_9fa48("21826") ? `` : (stryCov_9fa48("21826"), `Aborting fetch for task ${taskId} - newer fetch in progress`));
                        return;
                      }
                    }

                    // Handle 429 Too Many Requests with retry
                    if (stryMutAct_9fa48("21829") ? messageResponse.status !== 429 : stryMutAct_9fa48("21828") ? false : stryMutAct_9fa48("21827") ? true : (stryCov_9fa48("21827", "21828", "21829"), messageResponse.status === 429)) {
                      if (stryMutAct_9fa48("21830")) {
                        {}
                      } else {
                        stryCov_9fa48("21830");
                        const data = await messageResponse.json();
                        const retryAfter = stryMutAct_9fa48("21833") ? data.retryAfter && Math.pow(2, retryCount) * 1000 : stryMutAct_9fa48("21832") ? false : stryMutAct_9fa48("21831") ? true : (stryCov_9fa48("21831", "21832", "21833"), data.retryAfter || (stryMutAct_9fa48("21834") ? Math.pow(2, retryCount) / 1000 : (stryCov_9fa48("21834"), Math.pow(2, retryCount) * 1000))); // Exponential backoff

                        if (stryMutAct_9fa48("21838") ? retryCount >= 3 : stryMutAct_9fa48("21837") ? retryCount <= 3 : stryMutAct_9fa48("21836") ? false : stryMutAct_9fa48("21835") ? true : (stryCov_9fa48("21835", "21836", "21837", "21838"), retryCount < 3)) {
                          if (stryMutAct_9fa48("21839")) {
                            {}
                          } else {
                            stryCov_9fa48("21839");
                            // Limit to 3 retries
                            console.log(stryMutAct_9fa48("21840") ? `` : (stryCov_9fa48("21840"), `Rate limited, retrying after ${retryAfter}ms (retry ${stryMutAct_9fa48("21841") ? retryCount - 1 : (stryCov_9fa48("21841"), retryCount + 1)}/3)`));

                            // Show a temporary message
                            setMessages(stryMutAct_9fa48("21842") ? [] : (stryCov_9fa48("21842"), [stryMutAct_9fa48("21843") ? {} : (stryCov_9fa48("21843"), {
                              id: stryMutAct_9fa48("21844") ? "" : (stryCov_9fa48("21844"), 'retry'),
                              content: stryMutAct_9fa48("21845") ? `` : (stryCov_9fa48("21845"), `Loading task content, please wait...`),
                              role: stryMutAct_9fa48("21846") ? "" : (stryCov_9fa48("21846"), 'system')
                            })]));

                            // Wait and retry
                            setTimeout(() => {
                              if (stryMutAct_9fa48("21847")) {
                                {}
                              } else {
                                stryCov_9fa48("21847");
                                fetchTaskMessages(taskId, stryMutAct_9fa48("21848") ? retryCount - 1 : (stryCov_9fa48("21848"), retryCount + 1));
                              }
                            }, retryAfter);
                            return;
                          }
                        }
                      }
                    }
                    if (stryMutAct_9fa48("21851") ? false : stryMutAct_9fa48("21850") ? true : stryMutAct_9fa48("21849") ? messageResponse.ok : (stryCov_9fa48("21849", "21850", "21851"), !messageResponse.ok)) {
                      if (stryMutAct_9fa48("21852")) {
                        {}
                      } else {
                        stryCov_9fa48("21852");
                        throw new Error(stryMutAct_9fa48("21853") ? `` : (stryCov_9fa48("21853"), `Failed to send initial message: ${messageResponse.status}`));
                      }
                    }
                    const messageData = await messageResponse.json();

                    // Check if the message is a system metadata object that shouldn't be displayed
                    const messageContent = (stryMutAct_9fa48("21856") ? typeof messageData.content !== 'object' : stryMutAct_9fa48("21855") ? false : stryMutAct_9fa48("21854") ? true : (stryCov_9fa48("21854", "21855", "21856"), typeof messageData.content === (stryMutAct_9fa48("21857") ? "" : (stryCov_9fa48("21857"), 'object')))) ? JSON.stringify(messageData.content) : messageData.content;
                    if (stryMutAct_9fa48("21860") ? typeof messageContent === 'string' || messageContent.includes('"conversation_started":') || messageContent.includes('"last_message_timestamp":') || messageContent.includes('"topics_discussed":') : stryMutAct_9fa48("21859") ? false : stryMutAct_9fa48("21858") ? true : (stryCov_9fa48("21858", "21859", "21860"), (stryMutAct_9fa48("21862") ? typeof messageContent !== 'string' : stryMutAct_9fa48("21861") ? true : (stryCov_9fa48("21861", "21862"), typeof messageContent === (stryMutAct_9fa48("21863") ? "" : (stryCov_9fa48("21863"), 'string')))) && (stryMutAct_9fa48("21865") ? (messageContent.includes('"conversation_started":') || messageContent.includes('"last_message_timestamp":')) && messageContent.includes('"topics_discussed":') : stryMutAct_9fa48("21864") ? true : (stryCov_9fa48("21864", "21865"), (stryMutAct_9fa48("21867") ? messageContent.includes('"conversation_started":') && messageContent.includes('"last_message_timestamp":') : stryMutAct_9fa48("21866") ? false : (stryCov_9fa48("21866", "21867"), messageContent.includes(stryMutAct_9fa48("21868") ? "" : (stryCov_9fa48("21868"), '"conversation_started":')) || messageContent.includes(stryMutAct_9fa48("21869") ? "" : (stryCov_9fa48("21869"), '"last_message_timestamp":')))) || messageContent.includes(stryMutAct_9fa48("21870") ? "" : (stryCov_9fa48("21870"), '"topics_discussed":')))))) {
                      if (stryMutAct_9fa48("21871")) {
                        {}
                      } else {
                        stryCov_9fa48("21871");
                        console.log(stryMutAct_9fa48("21872") ? "" : (stryCov_9fa48("21872"), 'Skipping system metadata object in initial message'));
                        setMessages(stryMutAct_9fa48("21873") ? [] : (stryCov_9fa48("21873"), [stryMutAct_9fa48("21874") ? {} : (stryCov_9fa48("21874"), {
                          id: stryMutAct_9fa48("21875") ? "" : (stryCov_9fa48("21875"), 'system'),
                          content: stryMutAct_9fa48("21876") ? "" : (stryCov_9fa48("21876"), 'Starting conversation...'),
                          role: stryMutAct_9fa48("21877") ? "" : (stryCov_9fa48("21877"), 'system')
                        })]));
                      }
                    } else {
                      if (stryMutAct_9fa48("21878")) {
                        {}
                      } else {
                        stryCov_9fa48("21878");
                        // Display the assistant's response
                        setMessages(stryMutAct_9fa48("21879") ? [] : (stryCov_9fa48("21879"), [stryMutAct_9fa48("21880") ? {} : (stryCov_9fa48("21880"), {
                          id: messageData.message_id,
                          content: messageContent,
                          role: messageData.role,
                          timestamp: messageData.timestamp
                        })]));
                      }
                    }
                    console.log(stryMutAct_9fa48("21881") ? `` : (stryCov_9fa48("21881"), `Displayed initial assistant message`));
                  }
                } catch (error) {
                  if (stryMutAct_9fa48("21882")) {
                    {}
                  } else {
                    stryCov_9fa48("21882");
                    // If we get an error sending the initial message, try to handle it gracefully
                    console.error(stryMutAct_9fa48("21883") ? "" : (stryCov_9fa48("21883"), 'Error sending initial message:'), error);

                    // If we're still the most recent fetch, show an error
                    if (stryMutAct_9fa48("21886") ? fetchTaskMessages.lastFetchTimestamp !== fetchTimestamp : stryMutAct_9fa48("21885") ? false : stryMutAct_9fa48("21884") ? true : (stryCov_9fa48("21884", "21885", "21886"), fetchTaskMessages.lastFetchTimestamp === fetchTimestamp)) {
                      if (stryMutAct_9fa48("21887")) {
                        {}
                      } else {
                        stryCov_9fa48("21887");
                        setError(stryMutAct_9fa48("21888") ? `` : (stryCov_9fa48("21888"), `Failed to start conversation: ${error.message}. Please try refreshing the page.`));
                        setMessages(stryMutAct_9fa48("21889") ? [] : (stryCov_9fa48("21889"), [stryMutAct_9fa48("21890") ? {} : (stryCov_9fa48("21890"), {
                          id: stryMutAct_9fa48("21891") ? "" : (stryCov_9fa48("21891"), 'error'),
                          content: stryMutAct_9fa48("21892") ? `` : (stryCov_9fa48("21892"), `Error starting conversation: ${error.message}. Please try refreshing the page.`),
                          role: stryMutAct_9fa48("21893") ? "" : (stryCov_9fa48("21893"), 'system')
                        })]));
                      }
                    }
                  }
                }
              }
            }
          }
        } catch (error) {
          if (stryMutAct_9fa48("21894")) {
            {}
          } else {
            stryCov_9fa48("21894");
            // Check if this is still the most recent fetch
            if (stryMutAct_9fa48("21897") ? fetchTaskMessages.lastFetchTimestamp === fetchTimestamp : stryMutAct_9fa48("21896") ? false : stryMutAct_9fa48("21895") ? true : (stryCov_9fa48("21895", "21896", "21897"), fetchTaskMessages.lastFetchTimestamp !== fetchTimestamp)) {
              if (stryMutAct_9fa48("21898")) {
                {}
              } else {
                stryCov_9fa48("21898");
                console.log(stryMutAct_9fa48("21899") ? `` : (stryCov_9fa48("21899"), `Aborting error handling for task ${taskId} - newer fetch in progress`));
                return;
              }
            }
            console.error(stryMutAct_9fa48("21900") ? "" : (stryCov_9fa48("21900"), 'Error fetching task messages:'), error);
            setError(stryMutAct_9fa48("21901") ? `` : (stryCov_9fa48("21901"), `Failed to load messages: ${error.message}`));

            // Display a fallback message
            setMessages(stryMutAct_9fa48("21902") ? [] : (stryCov_9fa48("21902"), [stryMutAct_9fa48("21903") ? {} : (stryCov_9fa48("21903"), {
              id: stryMutAct_9fa48("21904") ? "" : (stryCov_9fa48("21904"), 'error'),
              content: stryMutAct_9fa48("21905") ? `` : (stryCov_9fa48("21905"), `Error loading task: ${error.message}. Please try refreshing the page.`),
              role: stryMutAct_9fa48("21906") ? "" : (stryCov_9fa48("21906"), 'system')
            })]));
          }
        } finally {
          if (stryMutAct_9fa48("21907")) {
            {}
          } else {
            stryCov_9fa48("21907");
            // Only update loading state if this is still the most recent fetch
            // and if we set it to true earlier (when we didn't have existing messages)
            if (stryMutAct_9fa48("21910") ? fetchTaskMessages.lastFetchTimestamp !== fetchTimestamp : stryMutAct_9fa48("21909") ? false : stryMutAct_9fa48("21908") ? true : (stryCov_9fa48("21908", "21909", "21910"), fetchTaskMessages.lastFetchTimestamp === fetchTimestamp)) {
              if (stryMutAct_9fa48("21911")) {
                {}
              } else {
                stryCov_9fa48("21911");
                // Check if we had set loading state to true (when we didn't have existing messages)
                const existingMessages = stryMutAct_9fa48("21912") ? messages : (stryCov_9fa48("21912"), messages.filter(stryMutAct_9fa48("21913") ? () => undefined : (stryCov_9fa48("21913"), msg => stryMutAct_9fa48("21916") ? msg.role !== 'system' && !msg.content?.includes('Loading') || !msg.content?.includes('Error') : stryMutAct_9fa48("21915") ? false : stryMutAct_9fa48("21914") ? true : (stryCov_9fa48("21914", "21915", "21916"), (stryMutAct_9fa48("21918") ? msg.role !== 'system' || !msg.content?.includes('Loading') : stryMutAct_9fa48("21917") ? true : (stryCov_9fa48("21917", "21918"), (stryMutAct_9fa48("21920") ? msg.role === 'system' : stryMutAct_9fa48("21919") ? true : (stryCov_9fa48("21919", "21920"), msg.role !== (stryMutAct_9fa48("21921") ? "" : (stryCov_9fa48("21921"), 'system')))) && (stryMutAct_9fa48("21922") ? msg.content?.includes('Loading') : (stryCov_9fa48("21922"), !(stryMutAct_9fa48("21923") ? msg.content.includes('Loading') : (stryCov_9fa48("21923"), msg.content?.includes(stryMutAct_9fa48("21924") ? "" : (stryCov_9fa48("21924"), 'Loading')))))))) && (stryMutAct_9fa48("21925") ? msg.content?.includes('Error') : (stryCov_9fa48("21925"), !(stryMutAct_9fa48("21926") ? msg.content.includes('Error') : (stryCov_9fa48("21926"), msg.content?.includes(stryMutAct_9fa48("21927") ? "" : (stryCov_9fa48("21927"), 'Error'))))))))));

                // Only turn off loading state if we had turned it on
                if (stryMutAct_9fa48("21930") ? existingMessages.length !== 0 : stryMutAct_9fa48("21929") ? false : stryMutAct_9fa48("21928") ? true : (stryCov_9fa48("21928", "21929", "21930"), existingMessages.length === 0)) {
                  if (stryMutAct_9fa48("21931")) {
                    {}
                  } else {
                    stryCov_9fa48("21931");
                    setIsMessagesLoading(stryMutAct_9fa48("21932") ? true : (stryCov_9fa48("21932"), false));
                  }
                }
              }
            }

            // Clear the fetching flag after a delay to prevent immediate re-fetching
            setTimeout(() => {
              if (stryMutAct_9fa48("21933")) {
                {}
              } else {
                stryCov_9fa48("21933");
                delete fetchingTasks[taskId];
              }
            }, 2000);
          }
        }
      }
    };

    // Fetch current day data and tasks
    useEffect(() => {
      if (stryMutAct_9fa48("21934")) {
        {}
      } else {
        stryCov_9fa48("21934");
        const fetchCurrentDayData = async () => {
          if (stryMutAct_9fa48("21935")) {
            {}
          } else {
            stryCov_9fa48("21935");
            setIsPageLoading(stryMutAct_9fa48("21936") ? false : (stryCov_9fa48("21936"), true));
            setError(stryMutAct_9fa48("21937") ? "Stryker was here!" : (stryCov_9fa48("21937"), ''));
            try {
              if (stryMutAct_9fa48("21938")) {
                {}
              } else {
                stryCov_9fa48("21938");
                let url;

                // If dayId is provided, fetch that specific day
                if (stryMutAct_9fa48("21940") ? false : stryMutAct_9fa48("21939") ? true : (stryCov_9fa48("21939", "21940"), dayId)) {
                  if (stryMutAct_9fa48("21941")) {
                    {}
                  } else {
                    stryCov_9fa48("21941");
                    url = stryMutAct_9fa48("21942") ? `` : (stryCov_9fa48("21942"), `${import.meta.env.VITE_API_URL}/api/curriculum/days/${dayId}/schedule`);
                    // Add cohort parameter if available
                    if (stryMutAct_9fa48("21944") ? false : stryMutAct_9fa48("21943") ? true : (stryCov_9fa48("21943", "21944"), cohort)) {
                      if (stryMutAct_9fa48("21945")) {
                        {}
                      } else {
                        stryCov_9fa48("21945");
                        url += stryMutAct_9fa48("21946") ? `` : (stryCov_9fa48("21946"), `?cohort=${encodeURIComponent(cohort)}`);
                      }
                    }
                  }
                } else {
                  if (stryMutAct_9fa48("21947")) {
                    {}
                  } else {
                    stryCov_9fa48("21947");
                    // Otherwise fetch the current day
                    url = stryMutAct_9fa48("21948") ? `` : (stryCov_9fa48("21948"), `${import.meta.env.VITE_API_URL}/api/progress/current-day`);
                    // Add cohort parameter if available
                    if (stryMutAct_9fa48("21950") ? false : stryMutAct_9fa48("21949") ? true : (stryCov_9fa48("21949", "21950"), cohort)) {
                      if (stryMutAct_9fa48("21951")) {
                        {}
                      } else {
                        stryCov_9fa48("21951");
                        url += stryMutAct_9fa48("21952") ? `` : (stryCov_9fa48("21952"), `?cohort=${encodeURIComponent(cohort)}`);
                      }
                    }
                  }
                }

                // Fetch day's schedule and progress
                const response = await fetch(url, stryMutAct_9fa48("21953") ? {} : (stryCov_9fa48("21953"), {
                  headers: stryMutAct_9fa48("21954") ? {} : (stryCov_9fa48("21954"), {
                    'Authorization': stryMutAct_9fa48("21955") ? `` : (stryCov_9fa48("21955"), `Bearer ${token}`)
                  })
                }));
                if (stryMutAct_9fa48("21958") ? false : stryMutAct_9fa48("21957") ? true : stryMutAct_9fa48("21956") ? response.ok : (stryCov_9fa48("21956", "21957", "21958"), !response.ok)) {
                  if (stryMutAct_9fa48("21959")) {
                    {}
                  } else {
                    stryCov_9fa48("21959");
                    const errorData = await response.json().catch(stryMutAct_9fa48("21960") ? () => undefined : (stryCov_9fa48("21960"), () => ({})));
                    const error = new Error(stryMutAct_9fa48("21963") ? errorData.error && 'Failed to fetch learning data' : stryMutAct_9fa48("21962") ? false : stryMutAct_9fa48("21961") ? true : (stryCov_9fa48("21961", "21962", "21963"), errorData.error || (stryMutAct_9fa48("21964") ? "" : (stryCov_9fa48("21964"), 'Failed to fetch learning data'))));
                    error.response = stryMutAct_9fa48("21965") ? {} : (stryCov_9fa48("21965"), {
                      status: response.status,
                      data: errorData
                    });
                    throw error;
                  }
                }
                const data = await response.json();
                console.log(stryMutAct_9fa48("21966") ? "" : (stryCov_9fa48("21966"), 'Learning API Response Data:'), JSON.stringify(data, null, 2));
                if (stryMutAct_9fa48("21969") ? data.message !== 'No schedule for today' : stryMutAct_9fa48("21968") ? false : stryMutAct_9fa48("21967") ? true : (stryCov_9fa48("21967", "21968", "21969"), data.message === (stryMutAct_9fa48("21970") ? "" : (stryCov_9fa48("21970"), 'No schedule for today')))) {
                  if (stryMutAct_9fa48("21971")) {
                    {}
                  } else {
                    stryCov_9fa48("21971");
                    setError(stryMutAct_9fa48("21972") ? "" : (stryCov_9fa48("21972"), 'No learning schedule available for today.'));
                    setIsPageLoading(stryMutAct_9fa48("21973") ? true : (stryCov_9fa48("21973"), false));
                    return;
                  }
                }

                // Process the data
                const dayData = data.day;

                // Extract tasks from all time blocks
                const allTasks = stryMutAct_9fa48("21974") ? ["Stryker was here"] : (stryCov_9fa48("21974"), []);

                // Handle different response formats based on the endpoint
                const timeBlocks = dayId ? data.timeBlocks : data.timeBlocks;
                const taskProgress = dayId ? stryMutAct_9fa48("21975") ? ["Stryker was here"] : (stryCov_9fa48("21975"), []) : data.taskProgress; // We might not have progress for historical days

                timeBlocks.forEach(block => {
                  if (stryMutAct_9fa48("21976")) {
                    {}
                  } else {
                    stryCov_9fa48("21976");
                    // Add tasks with their completion status
                    block.tasks.forEach(task => {
                      if (stryMutAct_9fa48("21977")) {
                        {}
                      } else {
                        stryCov_9fa48("21977");
                        const taskProgressItem = Array.isArray(taskProgress) ? taskProgress.find(stryMutAct_9fa48("21978") ? () => undefined : (stryCov_9fa48("21978"), progress => stryMutAct_9fa48("21981") ? progress.task_id !== task.id : stryMutAct_9fa48("21980") ? false : stryMutAct_9fa48("21979") ? true : (stryCov_9fa48("21979", "21980", "21981"), progress.task_id === task.id))) : null;

                        // Parse linked_resources if it's a string
                        let resources = stryMutAct_9fa48("21982") ? ["Stryker was here"] : (stryCov_9fa48("21982"), []);
                        if (stryMutAct_9fa48("21984") ? false : stryMutAct_9fa48("21983") ? true : (stryCov_9fa48("21983", "21984"), task.linked_resources)) {
                          if (stryMutAct_9fa48("21985")) {
                            {}
                          } else {
                            stryCov_9fa48("21985");
                            try {
                              if (stryMutAct_9fa48("21986")) {
                                {}
                              } else {
                                stryCov_9fa48("21986");
                                // If it's a string, try to parse it
                                if (stryMutAct_9fa48("21989") ? typeof task.linked_resources !== 'string' : stryMutAct_9fa48("21988") ? false : stryMutAct_9fa48("21987") ? true : (stryCov_9fa48("21987", "21988", "21989"), typeof task.linked_resources === (stryMutAct_9fa48("21990") ? "" : (stryCov_9fa48("21990"), 'string')))) {
                                  if (stryMutAct_9fa48("21991")) {
                                    {}
                                  } else {
                                    stryCov_9fa48("21991");
                                    resources = JSON.parse(task.linked_resources);
                                  }
                                } // If it's already an array, use it directly
                                else if (stryMutAct_9fa48("21993") ? false : stryMutAct_9fa48("21992") ? true : (stryCov_9fa48("21992", "21993"), Array.isArray(task.linked_resources))) {
                                  if (stryMutAct_9fa48("21994")) {
                                    {}
                                  } else {
                                    stryCov_9fa48("21994");
                                    resources = task.linked_resources;
                                  }
                                } // If it's a JSONB object from PostgreSQL, it might already be parsed
                                else {
                                  if (stryMutAct_9fa48("21995")) {
                                    {}
                                  } else {
                                    stryCov_9fa48("21995");
                                    resources = task.linked_resources;
                                  }
                                }
                              }
                            } catch (e) {
                              if (stryMutAct_9fa48("21996")) {
                                {}
                              } else {
                                stryCov_9fa48("21996");
                                console.error(stryMutAct_9fa48("21997") ? "" : (stryCov_9fa48("21997"), 'Error parsing linked_resources:'), e);
                                resources = stryMutAct_9fa48("21998") ? ["Stryker was here"] : (stryCov_9fa48("21998"), []);
                              }
                            }
                          }
                        }
                        allTasks.push(stryMutAct_9fa48("21999") ? {} : (stryCov_9fa48("21999"), {
                          id: task.id,
                          title: task.task_title,
                          description: task.task_description,
                          type: task.task_type,
                          blockTitle: task.task_title,
                          blockTime: formatTime(block.start_time),
                          completed: taskProgressItem ? stryMutAct_9fa48("22002") ? taskProgressItem.status !== 'completed' : stryMutAct_9fa48("22001") ? false : stryMutAct_9fa48("22000") ? true : (stryCov_9fa48("22000", "22001", "22002"), taskProgressItem.status === (stryMutAct_9fa48("22003") ? "" : (stryCov_9fa48("22003"), 'completed'))) : stryMutAct_9fa48("22004") ? true : (stryCov_9fa48("22004"), false),
                          resources: resources,
                          deliverable: task.deliverable,
                          deliverable_type: stryMutAct_9fa48("22007") ? task.deliverable_type && 'none' : stryMutAct_9fa48("22006") ? false : stryMutAct_9fa48("22005") ? true : (stryCov_9fa48("22005", "22006", "22007"), task.deliverable_type || (stryMutAct_9fa48("22008") ? "" : (stryCov_9fa48("22008"), 'none'))),
                          should_analyze: stryMutAct_9fa48("22011") ? task.should_analyze && false : stryMutAct_9fa48("22010") ? false : stryMutAct_9fa48("22009") ? true : (stryCov_9fa48("22009", "22010", "22011"), task.should_analyze || (stryMutAct_9fa48("22012") ? true : (stryCov_9fa48("22012"), false))),
                          analyze_deliverable: stryMutAct_9fa48("22015") ? task.analyze_deliverable && false : stryMutAct_9fa48("22014") ? false : stryMutAct_9fa48("22013") ? true : (stryCov_9fa48("22013", "22014", "22015"), task.analyze_deliverable || (stryMutAct_9fa48("22016") ? true : (stryCov_9fa48("22016"), false))),
                          task_mode: stryMutAct_9fa48("22019") ? task.task_mode && 'basic' : stryMutAct_9fa48("22018") ? false : stryMutAct_9fa48("22017") ? true : (stryCov_9fa48("22017", "22018", "22019"), task.task_mode || (stryMutAct_9fa48("22020") ? "" : (stryCov_9fa48("22020"), 'basic'))),
                          // Add task mode support
                          smart_prompt: stryMutAct_9fa48("22023") ? task.smart_prompt && null : stryMutAct_9fa48("22022") ? false : stryMutAct_9fa48("22021") ? true : (stryCov_9fa48("22021", "22022", "22023"), task.smart_prompt || null),
                          conversation_model: stryMutAct_9fa48("22026") ? task.conversation_model && null : stryMutAct_9fa48("22025") ? false : stryMutAct_9fa48("22024") ? true : (stryCov_9fa48("22024", "22025", "22026"), task.conversation_model || null),
                          feedback_slot: stryMutAct_9fa48("22029") ? task.feedback_slot && false : stryMutAct_9fa48("22028") ? false : stryMutAct_9fa48("22027") ? true : (stryCov_9fa48("22027", "22028", "22029"), task.feedback_slot || (stryMutAct_9fa48("22030") ? true : (stryCov_9fa48("22030"), false))) // Add feedback slot support
                        }));
                      }
                    });
                  }
                });

                // If a specific taskId is provided in the URL, find its index
                let initialTaskIndex = 0;
                if (stryMutAct_9fa48("22032") ? false : stryMutAct_9fa48("22031") ? true : (stryCov_9fa48("22031", "22032"), taskId)) {
                  if (stryMutAct_9fa48("22033")) {
                    {}
                  } else {
                    stryCov_9fa48("22033");
                    const taskIndex = allTasks.findIndex(stryMutAct_9fa48("22034") ? () => undefined : (stryCov_9fa48("22034"), task => stryMutAct_9fa48("22037") ? task.id !== parseInt(taskId) : stryMutAct_9fa48("22036") ? false : stryMutAct_9fa48("22035") ? true : (stryCov_9fa48("22035", "22036", "22037"), task.id === parseInt(taskId))));
                    if (stryMutAct_9fa48("22041") ? taskIndex < 0 : stryMutAct_9fa48("22040") ? taskIndex > 0 : stryMutAct_9fa48("22039") ? false : stryMutAct_9fa48("22038") ? true : (stryCov_9fa48("22038", "22039", "22040", "22041"), taskIndex >= 0)) {
                      if (stryMutAct_9fa48("22042")) {
                        {}
                      } else {
                        stryCov_9fa48("22042");
                        initialTaskIndex = taskIndex;
                      }
                    }
                  }
                } else {
                  if (stryMutAct_9fa48("22043")) {
                    {}
                  } else {
                    stryCov_9fa48("22043");
                    // Otherwise, find the first incomplete task to start with
                    const firstIncompleteIndex = allTasks.findIndex(stryMutAct_9fa48("22044") ? () => undefined : (stryCov_9fa48("22044"), task => stryMutAct_9fa48("22045") ? task.completed : (stryCov_9fa48("22045"), !task.completed)));
                    initialTaskIndex = (stryMutAct_9fa48("22049") ? firstIncompleteIndex < 0 : stryMutAct_9fa48("22048") ? firstIncompleteIndex > 0 : stryMutAct_9fa48("22047") ? false : stryMutAct_9fa48("22046") ? true : (stryCov_9fa48("22046", "22047", "22048", "22049"), firstIncompleteIndex >= 0)) ? firstIncompleteIndex : 0;
                  }
                }

                // Batch update state to reduce renders
                setCurrentDay(dayData);
                setTasks(allTasks);
                setCurrentTaskIndex(initialTaskIndex);

                // Fetch messages for the initial task (only if it's not a feedback slot)
                if (stryMutAct_9fa48("22053") ? allTasks.length <= 0 : stryMutAct_9fa48("22052") ? allTasks.length >= 0 : stryMutAct_9fa48("22051") ? false : stryMutAct_9fa48("22050") ? true : (stryCov_9fa48("22050", "22051", "22052", "22053"), allTasks.length > 0)) {
                  if (stryMutAct_9fa48("22054")) {
                    {}
                  } else {
                    stryCov_9fa48("22054");
                    const initialTask = allTasks[initialTaskIndex];
                    if (stryMutAct_9fa48("22057") ? false : stryMutAct_9fa48("22056") ? true : stryMutAct_9fa48("22055") ? initialTask.feedback_slot : (stryCov_9fa48("22055", "22056", "22057"), !initialTask.feedback_slot)) {
                      if (stryMutAct_9fa48("22058")) {
                        {}
                      } else {
                        stryCov_9fa48("22058");
                        await fetchTaskMessages(initialTask.id);

                        // Check if there's an existing analysis for this task
                        if (stryMutAct_9fa48("22060") ? false : stryMutAct_9fa48("22059") ? true : (stryCov_9fa48("22059", "22060"), initialTask.should_analyze)) {
                          if (stryMutAct_9fa48("22061")) {
                            {}
                          } else {
                            stryCov_9fa48("22061");
                            await fetchTaskAnalysis(initialTask.id);
                          }
                        }
                      }
                    }
                  }
                }
              }
            } catch (err) {
              if (stryMutAct_9fa48("22062")) {
                {}
              } else {
                stryCov_9fa48("22062");
                console.error(stryMutAct_9fa48("22063") ? "" : (stryCov_9fa48("22063"), 'Error fetching learning data:'), err);
                setError(stryMutAct_9fa48("22064") ? "" : (stryCov_9fa48("22064"), 'Failed to load learning data. Please try again later.'));
              }
            } finally {
              if (stryMutAct_9fa48("22065")) {
                {}
              } else {
                stryCov_9fa48("22065");
                setIsPageLoading(stryMutAct_9fa48("22066") ? true : (stryCov_9fa48("22066"), false));
              }
            }
          }
        };
        fetchCurrentDayData();
      }
    }, stryMutAct_9fa48("22067") ? [] : (stryCov_9fa48("22067"), [token, dayId, cohort]));

    // Auto-scroll to bottom when messages change
    useEffect(() => {
      if (stryMutAct_9fa48("22068")) {
        {}
      } else {
        stryCov_9fa48("22068");
        if (stryMutAct_9fa48("22070") ? false : stryMutAct_9fa48("22069") ? true : (stryCov_9fa48("22069", "22070"), messagesEndRef.current)) {
          if (stryMutAct_9fa48("22071")) {
            {}
          } else {
            stryCov_9fa48("22071");
            messagesEndRef.current.scrollIntoView(stryMutAct_9fa48("22072") ? {} : (stryCov_9fa48("22072"), {
              behavior: stryMutAct_9fa48("22073") ? "" : (stryCov_9fa48("22073"), 'smooth')
            }));
          }
        }
      }
    }, stryMutAct_9fa48("22074") ? [] : (stryCov_9fa48("22074"), [messages]));

    // Handle sending a message
    const handleSendMessage = async e => {
      if (stryMutAct_9fa48("22075")) {
        {}
      } else {
        stryCov_9fa48("22075");
        e.preventDefault();
        if (stryMutAct_9fa48("22078") ? !newMessage.trim() && isSending : stryMutAct_9fa48("22077") ? false : stryMutAct_9fa48("22076") ? true : (stryCov_9fa48("22076", "22077", "22078"), (stryMutAct_9fa48("22079") ? newMessage.trim() : (stryCov_9fa48("22079"), !(stryMutAct_9fa48("22080") ? newMessage : (stryCov_9fa48("22080"), newMessage.trim())))) || isSending)) return;

        // Prevent sending if the user is inactive
        if (stryMutAct_9fa48("22083") ? false : stryMutAct_9fa48("22082") ? true : stryMutAct_9fa48("22081") ? isActive : (stryCov_9fa48("22081", "22082", "22083"), !isActive)) {
          if (stryMutAct_9fa48("22084")) {
            {}
          } else {
            stryCov_9fa48("22084");
            setError(stryMutAct_9fa48("22085") ? "" : (stryCov_9fa48("22085"), 'You have historical access only and cannot send new messages.'));
            return;
          }
        }

        // Prevent double-clicks
        setIsSending(stryMutAct_9fa48("22086") ? false : (stryCov_9fa48("22086"), true));

        // Store the message locally for optimistic UI update
        const messageToSend = stryMutAct_9fa48("22087") ? newMessage : (stryCov_9fa48("22087"), newMessage.trim());

        // Clear the input
        setNewMessage(stryMutAct_9fa48("22088") ? "Stryker was here!" : (stryCov_9fa48("22088"), ''));

        // Resize the textarea back to its original size
        if (stryMutAct_9fa48("22090") ? false : stryMutAct_9fa48("22089") ? true : (stryCov_9fa48("22089", "22090"), textareaRef.current)) {
          if (stryMutAct_9fa48("22091")) {
            {}
          } else {
            stryCov_9fa48("22091");
            textareaRef.current.style.height = stryMutAct_9fa48("22092") ? "" : (stryCov_9fa48("22092"), 'auto');
          }
        }

        // Create a temporary ID for this message
        const temporaryId = stryMutAct_9fa48("22093") ? `` : (stryCov_9fa48("22093"), `temp-${Date.now()}`);

        // Optimistically add message to the UI
        setMessages(stryMutAct_9fa48("22094") ? () => undefined : (stryCov_9fa48("22094"), prevMessages => stryMutAct_9fa48("22095") ? [] : (stryCov_9fa48("22095"), [...(stryMutAct_9fa48("22096") ? prevMessages : (stryCov_9fa48("22096"), prevMessages.filter(stryMutAct_9fa48("22097") ? () => undefined : (stryCov_9fa48("22097"), msg => stryMutAct_9fa48("22100") ? msg.id === 'loading' : stryMutAct_9fa48("22099") ? false : stryMutAct_9fa48("22098") ? true : (stryCov_9fa48("22098", "22099", "22100"), msg.id !== (stryMutAct_9fa48("22101") ? "" : (stryCov_9fa48("22101"), 'loading'))))))), stryMutAct_9fa48("22102") ? {} : (stryCov_9fa48("22102"), {
          id: temporaryId,
          content: messageToSend,
          role: stryMutAct_9fa48("22103") ? "" : (stryCov_9fa48("22103"), 'user'),
          isTemporary: stryMutAct_9fa48("22104") ? false : (stryCov_9fa48("22104"), true)
        })])));

        // Show the AI thinking indicator
        setIsAiThinking(stryMutAct_9fa48("22105") ? false : (stryCov_9fa48("22105"), true));
        try {
          if (stryMutAct_9fa48("22106")) {
            {}
          } else {
            stryCov_9fa48("22106");
            // Get the current task ID
            const currentTaskId = stryMutAct_9fa48("22107") ? tasks[currentTaskIndex].id : (stryCov_9fa48("22107"), tasks[currentTaskIndex]?.id);

            // Get day number if available
            const currentDayNumber = stryMutAct_9fa48("22108") ? currentDay.day_number : (stryCov_9fa48("22108"), currentDay?.day_number);

            // Prepare request body with dayNumber if available
            const requestBody = stryMutAct_9fa48("22109") ? {} : (stryCov_9fa48("22109"), {
              content: messageToSend,
              taskId: currentTaskId
            });
            if (stryMutAct_9fa48("22111") ? false : stryMutAct_9fa48("22110") ? true : (stryCov_9fa48("22110", "22111"), currentDayNumber)) {
              if (stryMutAct_9fa48("22112")) {
                {}
              } else {
                stryCov_9fa48("22112");
                requestBody.dayNumber = currentDayNumber;
              }
            }

            // Add cohort parameter if available
            if (stryMutAct_9fa48("22114") ? false : stryMutAct_9fa48("22113") ? true : (stryCov_9fa48("22113", "22114"), cohort)) {
              if (stryMutAct_9fa48("22115")) {
                {}
              } else {
                stryCov_9fa48("22115");
                requestBody.cohort = cohort;
              }
            }

            // Send message to learning API
            const response = await fetch(stryMutAct_9fa48("22116") ? `` : (stryCov_9fa48("22116"), `${import.meta.env.VITE_API_URL}/api/learning/messages/continue`), stryMutAct_9fa48("22117") ? {} : (stryCov_9fa48("22117"), {
              method: stryMutAct_9fa48("22118") ? "" : (stryCov_9fa48("22118"), 'POST'),
              headers: stryMutAct_9fa48("22119") ? {} : (stryCov_9fa48("22119"), {
                'Content-Type': stryMutAct_9fa48("22120") ? "" : (stryCov_9fa48("22120"), 'application/json'),
                'Authorization': stryMutAct_9fa48("22121") ? `` : (stryCov_9fa48("22121"), `Bearer ${token}`)
              }),
              body: JSON.stringify(requestBody)
            }));
            if (stryMutAct_9fa48("22124") ? false : stryMutAct_9fa48("22123") ? true : stryMutAct_9fa48("22122") ? response.ok : (stryCov_9fa48("22122", "22123", "22124"), !response.ok)) {
              if (stryMutAct_9fa48("22125")) {
                {}
              } else {
                stryCov_9fa48("22125");
                throw new Error(stryMutAct_9fa48("22126") ? "" : (stryCov_9fa48("22126"), 'Failed to send message'));
              }
            }

            // Get AI response
            const aiResponseData = await response.json();

            // Extract the user message ID from the response if available
            // The server might include the user_message_id in its response
            const userMessageId = aiResponseData.user_message_id;

            // If the server returned the user message ID, update our state to use it
            if (stryMutAct_9fa48("22128") ? false : stryMutAct_9fa48("22127") ? true : (stryCov_9fa48("22127", "22128"), userMessageId)) {
              if (stryMutAct_9fa48("22129")) {
                {}
              } else {
                stryCov_9fa48("22129");
                console.log(stryMutAct_9fa48("22130") ? `` : (stryCov_9fa48("22130"), `User message ID from server: ${userMessageId}, replacing temporary ID: ${temporaryId}`));
                // Update the user message with the real server ID
                setMessages(stryMutAct_9fa48("22131") ? () => undefined : (stryCov_9fa48("22131"), prevMessages => prevMessages.map(stryMutAct_9fa48("22132") ? () => undefined : (stryCov_9fa48("22132"), msg => (stryMutAct_9fa48("22135") ? msg.id !== temporaryId : stryMutAct_9fa48("22134") ? false : stryMutAct_9fa48("22133") ? true : (stryCov_9fa48("22133", "22134", "22135"), msg.id === temporaryId)) ? stryMutAct_9fa48("22136") ? {} : (stryCov_9fa48("22136"), {
                  ...msg,
                  id: userMessageId,
                  message_id: userMessageId
                }) : msg))));
              }
            } else {
              if (stryMutAct_9fa48("22137")) {
                {}
              } else {
                stryCov_9fa48("22137");
                console.log(stryMutAct_9fa48("22138") ? "" : (stryCov_9fa48("22138"), 'Server did not return user_message_id, keeping temporary ID'));
              }
            }

            // Regular AI response
            let aiResponse;
            if (stryMutAct_9fa48("22141") ? aiResponseData || aiResponseData.content : stryMutAct_9fa48("22140") ? false : stryMutAct_9fa48("22139") ? true : (stryCov_9fa48("22139", "22140", "22141"), aiResponseData && aiResponseData.content)) {
              if (stryMutAct_9fa48("22142")) {
                {}
              } else {
                stryCov_9fa48("22142");
                // Use the actual AI response from the API
                aiResponse = stryMutAct_9fa48("22143") ? {} : (stryCov_9fa48("22143"), {
                  id: stryMutAct_9fa48("22146") ? aiResponseData.message_id && Date.now() + 1 : stryMutAct_9fa48("22145") ? false : stryMutAct_9fa48("22144") ? true : (stryCov_9fa48("22144", "22145", "22146"), aiResponseData.message_id || (stryMutAct_9fa48("22147") ? Date.now() - 1 : (stryCov_9fa48("22147"), Date.now() + 1))),
                  message_id: aiResponseData.message_id,
                  // Store original message_id for API calls
                  role: stryMutAct_9fa48("22148") ? "" : (stryCov_9fa48("22148"), 'assistant'),
                  content: (stryMutAct_9fa48("22151") ? typeof aiResponseData.content !== 'object' : stryMutAct_9fa48("22150") ? false : stryMutAct_9fa48("22149") ? true : (stryCov_9fa48("22149", "22150", "22151"), typeof aiResponseData.content === (stryMutAct_9fa48("22152") ? "" : (stryCov_9fa48("22152"), 'object')))) ? JSON.stringify(aiResponseData.content) : aiResponseData.content,
                  timestamp: stryMutAct_9fa48("22155") ? aiResponseData.timestamp && new Date().toISOString() : stryMutAct_9fa48("22154") ? false : stryMutAct_9fa48("22153") ? true : (stryCov_9fa48("22153", "22154", "22155"), aiResponseData.timestamp || new Date().toISOString())
                });
              }
            } else {
              if (stryMutAct_9fa48("22156")) {
                {}
              } else {
                stryCov_9fa48("22156");
                // Fallback response if API doesn't return expected format
                const fallbackId = stryMutAct_9fa48("22157") ? Date.now() - 1 : (stryCov_9fa48("22157"), Date.now() + 1);
                aiResponse = stryMutAct_9fa48("22158") ? {} : (stryCov_9fa48("22158"), {
                  id: fallbackId,
                  message_id: fallbackId,
                  // Store id as message_id for consistency
                  role: stryMutAct_9fa48("22159") ? "" : (stryCov_9fa48("22159"), 'assistant'),
                  content: stryMutAct_9fa48("22160") ? "" : (stryCov_9fa48("22160"), "I'm processing your message. Could you provide more details or clarify your thoughts?"),
                  timestamp: new Date().toISOString()
                });
              }
            }

            // Apply deduplication before adding the new message
            setMessages(prevMessages => {
              if (stryMutAct_9fa48("22161")) {
                {}
              } else {
                stryCov_9fa48("22161");
                // Create a new array with all previous messages
                const updatedMessages = stryMutAct_9fa48("22162") ? [] : (stryCov_9fa48("22162"), [...prevMessages]);

                // Skip system metadata objects that shouldn't be displayed
                if (stryMutAct_9fa48("22165") ? typeof aiResponse.content === 'string' || aiResponse.content.includes('"conversation_started":') || aiResponse.content.includes('"last_message_timestamp":') || aiResponse.content.includes('"topics_discussed":') : stryMutAct_9fa48("22164") ? false : stryMutAct_9fa48("22163") ? true : (stryCov_9fa48("22163", "22164", "22165"), (stryMutAct_9fa48("22167") ? typeof aiResponse.content !== 'string' : stryMutAct_9fa48("22166") ? true : (stryCov_9fa48("22166", "22167"), typeof aiResponse.content === (stryMutAct_9fa48("22168") ? "" : (stryCov_9fa48("22168"), 'string')))) && (stryMutAct_9fa48("22170") ? (aiResponse.content.includes('"conversation_started":') || aiResponse.content.includes('"last_message_timestamp":')) && aiResponse.content.includes('"topics_discussed":') : stryMutAct_9fa48("22169") ? true : (stryCov_9fa48("22169", "22170"), (stryMutAct_9fa48("22172") ? aiResponse.content.includes('"conversation_started":') && aiResponse.content.includes('"last_message_timestamp":') : stryMutAct_9fa48("22171") ? false : (stryCov_9fa48("22171", "22172"), aiResponse.content.includes(stryMutAct_9fa48("22173") ? "" : (stryCov_9fa48("22173"), '"conversation_started":')) || aiResponse.content.includes(stryMutAct_9fa48("22174") ? "" : (stryCov_9fa48("22174"), '"last_message_timestamp":')))) || aiResponse.content.includes(stryMutAct_9fa48("22175") ? "" : (stryCov_9fa48("22175"), '"topics_discussed":')))))) {
                  if (stryMutAct_9fa48("22176")) {
                    {}
                  } else {
                    stryCov_9fa48("22176");
                    console.log(stryMutAct_9fa48("22177") ? "" : (stryCov_9fa48("22177"), 'Skipping system metadata object in AI response'));
                    return updatedMessages;
                  }
                }

                // Add the new message
                return stryMutAct_9fa48("22178") ? [] : (stryCov_9fa48("22178"), [...updatedMessages, aiResponse]);
              }
            });
          }
        } catch (err) {
          if (stryMutAct_9fa48("22179")) {
            {}
          } else {
            stryCov_9fa48("22179");
            console.error(stryMutAct_9fa48("22180") ? "" : (stryCov_9fa48("22180"), 'Error sending/receiving message:'), err);
            setError(stryMutAct_9fa48("22181") ? "" : (stryCov_9fa48("22181"), 'Failed to communicate with the learning assistant. Please try again.'));

            // Fallback AI response for development
            // Regular AI response based on current task
            const responseOptions = stryMutAct_9fa48("22182") ? [] : (stryCov_9fa48("22182"), [stryMutAct_9fa48("22183") ? "" : (stryCov_9fa48("22183"), "That's a great example! Could you tell me more about specific features you found helpful?"), stryMutAct_9fa48("22184") ? "" : (stryCov_9fa48("22184"), "Interesting perspective! How do you think this compares to traditional learning methods?"), stryMutAct_9fa48("22185") ? "" : (stryCov_9fa48("22185"), "Thank you for sharing your experience! Your insights will help us design better learning experiences.")]);
            const aiResponse = stryMutAct_9fa48("22186") ? {} : (stryCov_9fa48("22186"), {
              id: stryMutAct_9fa48("22187") ? Date.now() - 1 : (stryCov_9fa48("22187"), Date.now() + 1),
              role: stryMutAct_9fa48("22188") ? "" : (stryCov_9fa48("22188"), 'assistant'),
              content: responseOptions[stryMutAct_9fa48("22189") ? Math.max(messages.length - 1, responseOptions.length - 1) : (stryCov_9fa48("22189"), Math.min(stryMutAct_9fa48("22190") ? messages.length + 1 : (stryCov_9fa48("22190"), messages.length - 1), stryMutAct_9fa48("22191") ? responseOptions.length + 1 : (stryCov_9fa48("22191"), responseOptions.length - 1)))],
              timestamp: new Date().toISOString()
            });

            // Apply deduplication before adding the new message
            setMessages(prevMessages => {
              if (stryMutAct_9fa48("22192")) {
                {}
              } else {
                stryCov_9fa48("22192");
                // Create a new array with all previous messages
                const updatedMessages = stryMutAct_9fa48("22193") ? [] : (stryCov_9fa48("22193"), [...prevMessages]);

                // Skip system metadata objects that shouldn't be displayed
                if (stryMutAct_9fa48("22196") ? typeof aiResponse.content === 'string' || aiResponse.content.includes('"conversation_started":') || aiResponse.content.includes('"last_message_timestamp":') || aiResponse.content.includes('"topics_discussed":') : stryMutAct_9fa48("22195") ? false : stryMutAct_9fa48("22194") ? true : (stryCov_9fa48("22194", "22195", "22196"), (stryMutAct_9fa48("22198") ? typeof aiResponse.content !== 'string' : stryMutAct_9fa48("22197") ? true : (stryCov_9fa48("22197", "22198"), typeof aiResponse.content === (stryMutAct_9fa48("22199") ? "" : (stryCov_9fa48("22199"), 'string')))) && (stryMutAct_9fa48("22201") ? (aiResponse.content.includes('"conversation_started":') || aiResponse.content.includes('"last_message_timestamp":')) && aiResponse.content.includes('"topics_discussed":') : stryMutAct_9fa48("22200") ? true : (stryCov_9fa48("22200", "22201"), (stryMutAct_9fa48("22203") ? aiResponse.content.includes('"conversation_started":') && aiResponse.content.includes('"last_message_timestamp":') : stryMutAct_9fa48("22202") ? false : (stryCov_9fa48("22202", "22203"), aiResponse.content.includes(stryMutAct_9fa48("22204") ? "" : (stryCov_9fa48("22204"), '"conversation_started":')) || aiResponse.content.includes(stryMutAct_9fa48("22205") ? "" : (stryCov_9fa48("22205"), '"last_message_timestamp":')))) || aiResponse.content.includes(stryMutAct_9fa48("22206") ? "" : (stryCov_9fa48("22206"), '"topics_discussed":')))))) {
                  if (stryMutAct_9fa48("22207")) {
                    {}
                  } else {
                    stryCov_9fa48("22207");
                    console.log(stryMutAct_9fa48("22208") ? "" : (stryCov_9fa48("22208"), 'Skipping system metadata object in AI response'));
                    return updatedMessages;
                  }
                }

                // Add the new message
                return stryMutAct_9fa48("22209") ? [] : (stryCov_9fa48("22209"), [...updatedMessages, aiResponse]);
              }
            });
          }
        } finally {
          if (stryMutAct_9fa48("22210")) {
            {}
          } else {
            stryCov_9fa48("22210");
            setIsSending(stryMutAct_9fa48("22211") ? true : (stryCov_9fa48("22211"), false));
            setIsAiThinking(stryMutAct_9fa48("22212") ? true : (stryCov_9fa48("22212"), false));
          }
        }
      }
    };

    // Add a helper function to check if current task is the Independent Retrospective
    const isIndependentRetroTask = () => {
      if (stryMutAct_9fa48("22213")) {
        {}
      } else {
        stryCov_9fa48("22213");
        if (stryMutAct_9fa48("22216") ? !tasks.length && currentTaskIndex >= tasks.length : stryMutAct_9fa48("22215") ? false : stryMutAct_9fa48("22214") ? true : (stryCov_9fa48("22214", "22215", "22216"), (stryMutAct_9fa48("22217") ? tasks.length : (stryCov_9fa48("22217"), !tasks.length)) || (stryMutAct_9fa48("22220") ? currentTaskIndex < tasks.length : stryMutAct_9fa48("22219") ? currentTaskIndex > tasks.length : stryMutAct_9fa48("22218") ? false : (stryCov_9fa48("22218", "22219", "22220"), currentTaskIndex >= tasks.length)))) return stryMutAct_9fa48("22221") ? true : (stryCov_9fa48("22221"), false);
        const currentTask = tasks[currentTaskIndex];
        // Check by title - a more robust approach would be to check by task ID or type
        return stryMutAct_9fa48("22224") ? currentTask.title !== "Independent Retrospective" : stryMutAct_9fa48("22223") ? false : stryMutAct_9fa48("22222") ? true : (stryCov_9fa48("22222", "22223", "22224"), currentTask.title === (stryMutAct_9fa48("22225") ? "" : (stryCov_9fa48("22225"), "Independent Retrospective")));
      }
    };

    // Add a function to handle peer feedback completion
    const handlePeerFeedbackComplete = () => {
      if (stryMutAct_9fa48("22226")) {
        {}
      } else {
        stryCov_9fa48("22226");
        // Mark peer feedback as completed
        setPeerFeedbackCompleted(stryMutAct_9fa48("22227") ? false : (stryCov_9fa48("22227"), true));

        // Hide the peer feedback form
        setShowPeerFeedback(stryMutAct_9fa48("22228") ? true : (stryCov_9fa48("22228"), false));

        // Success status will be shown by the inline status element
      }
    };

    // Add a function to handle peer feedback cancellation
    const handlePeerFeedbackCancel = () => {
      if (stryMutAct_9fa48("22229")) {
        {}
      } else {
        stryCov_9fa48("22229");
        // Hide the peer feedback form without marking as completed
        setShowPeerFeedback(stryMutAct_9fa48("22230") ? true : (stryCov_9fa48("22230"), false));
      }
    };

    // Add a function to handle builder feedback completion
    const handleBuilderFeedbackComplete = () => {
      if (stryMutAct_9fa48("22231")) {
        {}
      } else {
        stryCov_9fa48("22231");
        // Builder feedback completion doesn't need special handling
        // The form will show success state and can navigate away
        console.log(stryMutAct_9fa48("22232") ? "" : (stryCov_9fa48("22232"), 'Builder feedback completed successfully'));
      }
    };

    // Helper function to check if current task is a feedback slot
    const isCurrentTaskFeedbackSlot = () => {
      if (stryMutAct_9fa48("22233")) {
        {}
      } else {
        stryCov_9fa48("22233");
        if (stryMutAct_9fa48("22236") ? !tasks.length && currentTaskIndex >= tasks.length : stryMutAct_9fa48("22235") ? false : stryMutAct_9fa48("22234") ? true : (stryCov_9fa48("22234", "22235", "22236"), (stryMutAct_9fa48("22237") ? tasks.length : (stryCov_9fa48("22237"), !tasks.length)) || (stryMutAct_9fa48("22240") ? currentTaskIndex < tasks.length : stryMutAct_9fa48("22239") ? currentTaskIndex > tasks.length : stryMutAct_9fa48("22238") ? false : (stryCov_9fa48("22238", "22239", "22240"), currentTaskIndex >= tasks.length)))) return stryMutAct_9fa48("22241") ? true : (stryCov_9fa48("22241"), false);
        return stryMutAct_9fa48("22244") ? tasks[currentTaskIndex].feedback_slot !== true : stryMutAct_9fa48("22243") ? false : stryMutAct_9fa48("22242") ? true : (stryCov_9fa48("22242", "22243", "22244"), tasks[currentTaskIndex].feedback_slot === (stryMutAct_9fa48("22245") ? false : (stryCov_9fa48("22245"), true)));
      }
    };

    // Modify the markTaskAsCompleted function to not handle peer feedback
    const markTaskAsCompleted = async taskId => {
      if (stryMutAct_9fa48("22246")) {
        {}
      } else {
        stryCov_9fa48("22246");
        try {
          if (stryMutAct_9fa48("22247")) {
            {}
          } else {
            stryCov_9fa48("22247");
            // No need to check for Independent Retrospective task anymore
            // as we're not showing the Complete button for it

            const response = await fetch(stryMutAct_9fa48("22248") ? `` : (stryCov_9fa48("22248"), `${import.meta.env.VITE_API_URL}/api/learning/complete-task/${taskId}`), stryMutAct_9fa48("22249") ? {} : (stryCov_9fa48("22249"), {
              method: stryMutAct_9fa48("22250") ? "" : (stryCov_9fa48("22250"), 'POST'),
              headers: stryMutAct_9fa48("22251") ? {} : (stryCov_9fa48("22251"), {
                'Content-Type': stryMutAct_9fa48("22252") ? "" : (stryCov_9fa48("22252"), 'application/json'),
                'Authorization': stryMutAct_9fa48("22253") ? `` : (stryCov_9fa48("22253"), `Bearer ${token}`)
              }),
              body: JSON.stringify(stryMutAct_9fa48("22254") ? {} : (stryCov_9fa48("22254"), {
                notes: stryMutAct_9fa48("22255") ? "Stryker was here!" : (stryCov_9fa48("22255"), '')
              }))
            }));
            if (stryMutAct_9fa48("22258") ? false : stryMutAct_9fa48("22257") ? true : stryMutAct_9fa48("22256") ? response.ok : (stryCov_9fa48("22256", "22257", "22258"), !response.ok)) {
              if (stryMutAct_9fa48("22259")) {
                {}
              } else {
                stryCov_9fa48("22259");
                throw new Error(stryMutAct_9fa48("22260") ? "" : (stryCov_9fa48("22260"), 'Failed to update task status'));
              }
            }

            // Update local state
            setTasks(stryMutAct_9fa48("22261") ? () => undefined : (stryCov_9fa48("22261"), prevTasks => prevTasks.map(stryMutAct_9fa48("22262") ? () => undefined : (stryCov_9fa48("22262"), task => (stryMutAct_9fa48("22265") ? task.id !== taskId : stryMutAct_9fa48("22264") ? false : stryMutAct_9fa48("22263") ? true : (stryCov_9fa48("22263", "22264", "22265"), task.id === taskId)) ? stryMutAct_9fa48("22266") ? {} : (stryCov_9fa48("22266"), {
              ...task,
              completed: stryMutAct_9fa48("22267") ? false : (stryCov_9fa48("22267"), true)
            }) : task))));

            // Automatically transition to the next task if available
            const nextTaskIndex = stryMutAct_9fa48("22268") ? currentTaskIndex - 1 : (stryCov_9fa48("22268"), currentTaskIndex + 1);
            if (stryMutAct_9fa48("22272") ? nextTaskIndex >= tasks.length : stryMutAct_9fa48("22271") ? nextTaskIndex <= tasks.length : stryMutAct_9fa48("22270") ? false : stryMutAct_9fa48("22269") ? true : (stryCov_9fa48("22269", "22270", "22271", "22272"), nextTaskIndex < tasks.length)) {
              if (stryMutAct_9fa48("22273")) {
                {}
              } else {
                stryCov_9fa48("22273");
                // Add a transition message
                setMessages(stryMutAct_9fa48("22274") ? () => undefined : (stryCov_9fa48("22274"), prevMessages => stryMutAct_9fa48("22275") ? [] : (stryCov_9fa48("22275"), [...prevMessages, stryMutAct_9fa48("22276") ? {} : (stryCov_9fa48("22276"), {
                  id: Date.now(),
                  role: stryMutAct_9fa48("22277") ? "" : (stryCov_9fa48("22277"), 'assistant'),
                  content: stryMutAct_9fa48("22278") ? "" : (stryCov_9fa48("22278"), "Great job completing this task! Let's move on to the next one."),
                  timestamp: new Date().toISOString()
                })])));

                // Wait a moment before transitioning
                setTimeout(() => {
                  if (stryMutAct_9fa48("22279")) {
                    {}
                  } else {
                    stryCov_9fa48("22279");
                    setCurrentTaskIndex(nextTaskIndex);
                    fetchTaskMessages(tasks[nextTaskIndex].id);
                  }
                }, 1500);
              }
            }
          }
        } catch (err) {
          if (stryMutAct_9fa48("22280")) {
            {}
          } else {
            stryCov_9fa48("22280");
            console.error(stryMutAct_9fa48("22281") ? "" : (stryCov_9fa48("22281"), 'Error marking task as completed:'), err);
            // Still update the UI even if the API call fails
            setTasks(stryMutAct_9fa48("22282") ? () => undefined : (stryCov_9fa48("22282"), prevTasks => prevTasks.map(stryMutAct_9fa48("22283") ? () => undefined : (stryCov_9fa48("22283"), task => (stryMutAct_9fa48("22286") ? task.id !== taskId : stryMutAct_9fa48("22285") ? false : stryMutAct_9fa48("22284") ? true : (stryCov_9fa48("22284", "22285", "22286"), task.id === taskId)) ? stryMutAct_9fa48("22287") ? {} : (stryCov_9fa48("22287"), {
              ...task,
              completed: stryMutAct_9fa48("22288") ? false : (stryCov_9fa48("22288"), true)
            }) : task))));
          }
        }
      }
    };

    // Handle quick reply
    const handleQuickReply = reply => {
      if (stryMutAct_9fa48("22289")) {
        {}
      } else {
        stryCov_9fa48("22289");
        if (stryMutAct_9fa48("22291") ? false : stryMutAct_9fa48("22290") ? true : (stryCov_9fa48("22290", "22291"), isSending)) return;
        setNewMessage(reply);
        // Optional: automatically send the quick reply
        // setTimeout(() => {
        //   handleSendMessage({ preventDefault: () => {} });
        // }, 500);
      }
    };

    // Helper function to get task icon based on type
    const getTaskIcon = (type, completed, taskMode, feedbackSlot) => {
      if (stryMutAct_9fa48("22292")) {
        {}
      } else {
        stryCov_9fa48("22292");
        // Check if this is a feedback slot task - use clipboard icon
        if (stryMutAct_9fa48("22294") ? false : stryMutAct_9fa48("22293") ? true : (stryCov_9fa48("22293", "22294"), feedbackSlot)) {
          if (stryMutAct_9fa48("22295")) {
            {}
          } else {
            stryCov_9fa48("22295");
            if (stryMutAct_9fa48("22297") ? false : stryMutAct_9fa48("22296") ? true : (stryCov_9fa48("22296", "22297"), completed)) {
              if (stryMutAct_9fa48("22298")) {
                {}
              } else {
                stryCov_9fa48("22298");
                return <FaCheckCircle className="task-icon completed" />;
              }
            }
            return <FaClipboardList className="task-icon feedback" />;
          }
        }

        // Check if this is a conversation task - use brain icon
        if (stryMutAct_9fa48("22301") ? taskMode !== 'conversation' : stryMutAct_9fa48("22300") ? false : stryMutAct_9fa48("22299") ? true : (stryCov_9fa48("22299", "22300", "22301"), taskMode === (stryMutAct_9fa48("22302") ? "" : (stryCov_9fa48("22302"), 'conversation')))) {
          if (stryMutAct_9fa48("22303")) {
            {}
          } else {
            stryCov_9fa48("22303");
            if (stryMutAct_9fa48("22305") ? false : stryMutAct_9fa48("22304") ? true : (stryCov_9fa48("22304", "22305"), completed)) {
              if (stryMutAct_9fa48("22306")) {
                {}
              } else {
                stryCov_9fa48("22306");
                return <FaCheckCircle className="task-icon completed" />;
              }
            }
            return <FaBrain className="task-icon conversation" />;
          }
        }

        // Special case for Independent Retrospective
        if (stryMutAct_9fa48("22309") ? type === 'reflect' && tasks.length > 0 && currentTaskIndex < tasks.length || tasks[currentTaskIndex].title === "Independent Retrospective" : stryMutAct_9fa48("22308") ? false : stryMutAct_9fa48("22307") ? true : (stryCov_9fa48("22307", "22308", "22309"), (stryMutAct_9fa48("22311") ? type === 'reflect' && tasks.length > 0 || currentTaskIndex < tasks.length : stryMutAct_9fa48("22310") ? true : (stryCov_9fa48("22310", "22311"), (stryMutAct_9fa48("22313") ? type === 'reflect' || tasks.length > 0 : stryMutAct_9fa48("22312") ? true : (stryCov_9fa48("22312", "22313"), (stryMutAct_9fa48("22315") ? type !== 'reflect' : stryMutAct_9fa48("22314") ? true : (stryCov_9fa48("22314", "22315"), type === (stryMutAct_9fa48("22316") ? "" : (stryCov_9fa48("22316"), 'reflect')))) && (stryMutAct_9fa48("22319") ? tasks.length <= 0 : stryMutAct_9fa48("22318") ? tasks.length >= 0 : stryMutAct_9fa48("22317") ? true : (stryCov_9fa48("22317", "22318", "22319"), tasks.length > 0)))) && (stryMutAct_9fa48("22322") ? currentTaskIndex >= tasks.length : stryMutAct_9fa48("22321") ? currentTaskIndex <= tasks.length : stryMutAct_9fa48("22320") ? true : (stryCov_9fa48("22320", "22321", "22322"), currentTaskIndex < tasks.length)))) && (stryMutAct_9fa48("22324") ? tasks[currentTaskIndex].title !== "Independent Retrospective" : stryMutAct_9fa48("22323") ? true : (stryCov_9fa48("22323", "22324"), tasks[currentTaskIndex].title === (stryMutAct_9fa48("22325") ? "" : (stryCov_9fa48("22325"), "Independent Retrospective")))))) {
          if (stryMutAct_9fa48("22326")) {
            {}
          } else {
            stryCov_9fa48("22326");
            // Always show the original icon for Independent Retrospective
            return <FaBook className="task-icon reflect" />;
          }
        }

        // Show type-specific icons based on task type
        switch (type) {
          case stryMutAct_9fa48("22327") ? "" : (stryCov_9fa48("22327"), 'share'):
          case stryMutAct_9fa48("22329") ? "" : (stryCov_9fa48("22329"), 'discussion'):
            if (stryMutAct_9fa48("22328")) {} else {
              stryCov_9fa48("22328");
              return <FaCheckCircle className="task-icon share" />;
            }
          case stryMutAct_9fa48("22330") ? "" : (stryCov_9fa48("22330"), 'discuss'):
          case stryMutAct_9fa48("22332") ? "" : (stryCov_9fa48("22332"), 'group'):
            if (stryMutAct_9fa48("22331")) {} else {
              stryCov_9fa48("22331");
              return <FaUsers className="task-icon discuss" />;
            }
          case stryMutAct_9fa48("22333") ? "" : (stryCov_9fa48("22333"), 'reflect'):
          case stryMutAct_9fa48("22335") ? "" : (stryCov_9fa48("22335"), 'individual'):
            if (stryMutAct_9fa48("22334")) {} else {
              stryCov_9fa48("22334");
              return <FaBook className="task-icon reflect" />;
            }
          default:
            if (stryMutAct_9fa48("22336")) {} else {
              stryCov_9fa48("22336");
              // For unknown types or if completed is true, show checkmark
              if (stryMutAct_9fa48("22338") ? false : stryMutAct_9fa48("22337") ? true : (stryCov_9fa48("22337", "22338"), completed)) {
                if (stryMutAct_9fa48("22339")) {
                  {}
                } else {
                  stryCov_9fa48("22339");
                  return <FaCheckCircle className="task-icon completed" />;
                }
              }
              return <FaCheckCircle className="task-icon" />;
            }
        }
      }
    };

    // Helper function to check if a resource is a YouTube video
    const isYouTubeVideo = resource => {
      if (stryMutAct_9fa48("22340")) {
        {}
      } else {
        stryCov_9fa48("22340");
        const type = resource.type;
        const url = resource.url;

        // Check for video type or YouTube URL patterns
        return stryMutAct_9fa48("22343") ? type && type.toLowerCase() === 'video' && url && (url.includes('youtube.com/watch') || url.includes('youtu.be/') || url.includes('youtube.com/embed') || url.includes('youtube.com/v/')) : stryMutAct_9fa48("22342") ? false : stryMutAct_9fa48("22341") ? true : (stryCov_9fa48("22341", "22342", "22343"), (stryMutAct_9fa48("22345") ? type || type.toLowerCase() === 'video' : stryMutAct_9fa48("22344") ? false : (stryCov_9fa48("22344", "22345"), type && (stryMutAct_9fa48("22347") ? type.toLowerCase() !== 'video' : stryMutAct_9fa48("22346") ? true : (stryCov_9fa48("22346", "22347"), (stryMutAct_9fa48("22348") ? type.toUpperCase() : (stryCov_9fa48("22348"), type.toLowerCase())) === (stryMutAct_9fa48("22349") ? "" : (stryCov_9fa48("22349"), 'video')))))) || (stryMutAct_9fa48("22351") ? url || url.includes('youtube.com/watch') || url.includes('youtu.be/') || url.includes('youtube.com/embed') || url.includes('youtube.com/v/') : stryMutAct_9fa48("22350") ? false : (stryCov_9fa48("22350", "22351"), url && (stryMutAct_9fa48("22353") ? (url.includes('youtube.com/watch') || url.includes('youtu.be/') || url.includes('youtube.com/embed')) && url.includes('youtube.com/v/') : stryMutAct_9fa48("22352") ? true : (stryCov_9fa48("22352", "22353"), (stryMutAct_9fa48("22355") ? (url.includes('youtube.com/watch') || url.includes('youtu.be/')) && url.includes('youtube.com/embed') : stryMutAct_9fa48("22354") ? false : (stryCov_9fa48("22354", "22355"), (stryMutAct_9fa48("22357") ? url.includes('youtube.com/watch') && url.includes('youtu.be/') : stryMutAct_9fa48("22356") ? false : (stryCov_9fa48("22356", "22357"), url.includes(stryMutAct_9fa48("22358") ? "" : (stryCov_9fa48("22358"), 'youtube.com/watch')) || url.includes(stryMutAct_9fa48("22359") ? "" : (stryCov_9fa48("22359"), 'youtu.be/')))) || url.includes(stryMutAct_9fa48("22360") ? "" : (stryCov_9fa48("22360"), 'youtube.com/embed')))) || url.includes(stryMutAct_9fa48("22361") ? "" : (stryCov_9fa48("22361"), 'youtube.com/v/')))))));
      }
    };

    // Add this function to render resources
    const renderTaskResources = resources => {
      if (stryMutAct_9fa48("22362")) {
        {}
      } else {
        stryCov_9fa48("22362");
        if (stryMutAct_9fa48("22365") ? !resources && resources.length === 0 : stryMutAct_9fa48("22364") ? false : stryMutAct_9fa48("22363") ? true : (stryCov_9fa48("22363", "22364", "22365"), (stryMutAct_9fa48("22366") ? resources : (stryCov_9fa48("22366"), !resources)) || (stryMutAct_9fa48("22368") ? resources.length !== 0 : stryMutAct_9fa48("22367") ? false : (stryCov_9fa48("22367", "22368"), resources.length === 0)))) return null;

        // Ensure resources are properly parsed
        const parsedResources = stryMutAct_9fa48("22369") ? resources.map(resource => {
          if (typeof resource === 'string') {
            try {
              return JSON.parse(resource);
            } catch (e) {
              console.error('Error parsing resource:', e);
              return null;
            }
          }
          return resource;
        }) : (stryCov_9fa48("22369"), resources.map(resource => {
          if (stryMutAct_9fa48("22370")) {
            {}
          } else {
            stryCov_9fa48("22370");
            if (stryMutAct_9fa48("22373") ? typeof resource !== 'string' : stryMutAct_9fa48("22372") ? false : stryMutAct_9fa48("22371") ? true : (stryCov_9fa48("22371", "22372", "22373"), typeof resource === (stryMutAct_9fa48("22374") ? "" : (stryCov_9fa48("22374"), 'string')))) {
              if (stryMutAct_9fa48("22375")) {
                {}
              } else {
                stryCov_9fa48("22375");
                try {
                  if (stryMutAct_9fa48("22376")) {
                    {}
                  } else {
                    stryCov_9fa48("22376");
                    return JSON.parse(resource);
                  }
                } catch (e) {
                  if (stryMutAct_9fa48("22377")) {
                    {}
                  } else {
                    stryCov_9fa48("22377");
                    console.error(stryMutAct_9fa48("22378") ? "" : (stryCov_9fa48("22378"), 'Error parsing resource:'), e);
                    return null;
                  }
                }
              }
            }
            return resource;
          }
        }).filter(Boolean)); // Remove any null resources

        if (stryMutAct_9fa48("22381") ? parsedResources.length !== 0 : stryMutAct_9fa48("22380") ? false : stryMutAct_9fa48("22379") ? true : (stryCov_9fa48("22379", "22380", "22381"), parsedResources.length === 0)) return null;

        // Group resources by type
        const groupedResources = parsedResources.reduce((acc, resource) => {
          if (stryMutAct_9fa48("22382")) {
            {}
          } else {
            stryCov_9fa48("22382");
            const type = stryMutAct_9fa48("22385") ? resource.type && 'other' : stryMutAct_9fa48("22384") ? false : stryMutAct_9fa48("22383") ? true : (stryCov_9fa48("22383", "22384", "22385"), resource.type || (stryMutAct_9fa48("22386") ? "" : (stryCov_9fa48("22386"), 'other')));
            if (stryMutAct_9fa48("22389") ? false : stryMutAct_9fa48("22388") ? true : stryMutAct_9fa48("22387") ? acc[type] : (stryCov_9fa48("22387", "22388", "22389"), !acc[type])) {
              if (stryMutAct_9fa48("22390")) {
                {}
              } else {
                stryCov_9fa48("22390");
                acc[type] = stryMutAct_9fa48("22391") ? ["Stryker was here"] : (stryCov_9fa48("22391"), []);
              }
            }
            acc[type].push(resource);
            return acc;
          }
        }, {});
        return <div className="learning__task-resources">
        <h3>Resources</h3>
        {Object.entries(groupedResources).map(stryMutAct_9fa48("22392") ? () => undefined : (stryCov_9fa48("22392"), ([type, typeResources]) => <div key={type} className="learning__resource-group">
            {/* <h4>{type.charAt(0).toUpperCase() + type.slice(1)}s</h4> */}
            <ul>
              {typeResources.map(stryMutAct_9fa48("22393") ? () => undefined : (stryCov_9fa48("22393"), (resource, index) => <li key={index} className="learning__resource-item">
                  <div className="learning__resource-content">
                    <a href={resource.url} target="_blank" rel="noopener noreferrer">
                      {resource.title}
                    </a>
                    {stryMutAct_9fa48("22396") ? resource.description || <p className="resource-description">{resource.description}</p> : stryMutAct_9fa48("22395") ? false : stryMutAct_9fa48("22394") ? true : (stryCov_9fa48("22394", "22395", "22396"), resource.description && <p className="resource-description">{resource.description}</p>)}
                  </div>

                </li>))}
            </ul>
          </div>))}
      </div>;
      }
    };

    // Helper function to preprocess code content for better wrapping
    const preprocessCodeContent = code => {
      if (stryMutAct_9fa48("22397")) {
        {}
      } else {
        stryCov_9fa48("22397");
        if (stryMutAct_9fa48("22400") ? false : stryMutAct_9fa48("22399") ? true : stryMutAct_9fa48("22398") ? code : (stryCov_9fa48("22398", "22399", "22400"), !code)) return code;

        // Split code into lines
        const lines = code.split(stryMutAct_9fa48("22401") ? "" : (stryCov_9fa48("22401"), '\n'));
        const maxLineLength = 80; // Reasonable line length for code

        const processedLines = lines.map(line => {
          if (stryMutAct_9fa48("22402")) {
            {}
          } else {
            stryCov_9fa48("22402");
            // If line is too long, try to break it intelligently
            if (stryMutAct_9fa48("22406") ? line.length <= maxLineLength : stryMutAct_9fa48("22405") ? line.length >= maxLineLength : stryMutAct_9fa48("22404") ? false : stryMutAct_9fa48("22403") ? true : (stryCov_9fa48("22403", "22404", "22405", "22406"), line.length > maxLineLength)) {
              if (stryMutAct_9fa48("22407")) {
                {}
              } else {
                stryCov_9fa48("22407");
                // Try to break at logical points (spaces, operators, etc.)
                const breakPoints = stryMutAct_9fa48("22408") ? [] : (stryCov_9fa48("22408"), [stryMutAct_9fa48("22409") ? "" : (stryCov_9fa48("22409"), ' '), stryMutAct_9fa48("22410") ? "" : (stryCov_9fa48("22410"), '.'), stryMutAct_9fa48("22411") ? "" : (stryCov_9fa48("22411"), '('), stryMutAct_9fa48("22412") ? "" : (stryCov_9fa48("22412"), ')'), stryMutAct_9fa48("22413") ? "" : (stryCov_9fa48("22413"), '{'), stryMutAct_9fa48("22414") ? "" : (stryCov_9fa48("22414"), '}'), stryMutAct_9fa48("22415") ? "" : (stryCov_9fa48("22415"), '['), stryMutAct_9fa48("22416") ? "" : (stryCov_9fa48("22416"), ']'), stryMutAct_9fa48("22417") ? "" : (stryCov_9fa48("22417"), ','), stryMutAct_9fa48("22418") ? "" : (stryCov_9fa48("22418"), ';'), stryMutAct_9fa48("22419") ? "" : (stryCov_9fa48("22419"), '='), stryMutAct_9fa48("22420") ? "" : (stryCov_9fa48("22420"), '+'), stryMutAct_9fa48("22421") ? "" : (stryCov_9fa48("22421"), '-')]);
                let bestBreak = stryMutAct_9fa48("22422") ? +1 : (stryCov_9fa48("22422"), -1);

                // Find the best break point within reasonable range
                for (let i = stryMutAct_9fa48("22423") ? maxLineLength + 10 : (stryCov_9fa48("22423"), maxLineLength - 10); stryMutAct_9fa48("22425") ? i >= maxLineLength - 30 || i >= 0 : stryMutAct_9fa48("22424") ? false : (stryCov_9fa48("22424", "22425"), (stryMutAct_9fa48("22428") ? i < maxLineLength - 30 : stryMutAct_9fa48("22427") ? i > maxLineLength - 30 : stryMutAct_9fa48("22426") ? true : (stryCov_9fa48("22426", "22427", "22428"), i >= (stryMutAct_9fa48("22429") ? maxLineLength + 30 : (stryCov_9fa48("22429"), maxLineLength - 30)))) && (stryMutAct_9fa48("22432") ? i < 0 : stryMutAct_9fa48("22431") ? i > 0 : stryMutAct_9fa48("22430") ? true : (stryCov_9fa48("22430", "22431", "22432"), i >= 0))); stryMutAct_9fa48("22433") ? i++ : (stryCov_9fa48("22433"), i--)) {
                  if (stryMutAct_9fa48("22434")) {
                    {}
                  } else {
                    stryCov_9fa48("22434");
                    if (stryMutAct_9fa48("22436") ? false : stryMutAct_9fa48("22435") ? true : (stryCov_9fa48("22435", "22436"), breakPoints.includes(line[i]))) {
                      if (stryMutAct_9fa48("22437")) {
                        {}
                      } else {
                        stryCov_9fa48("22437");
                        bestBreak = stryMutAct_9fa48("22438") ? i - 1 : (stryCov_9fa48("22438"), i + 1);
                        break;
                      }
                    }
                  }
                }

                // If we found a good break point, split the line
                if (stryMutAct_9fa48("22441") ? bestBreak > 0 || bestBreak < line.length : stryMutAct_9fa48("22440") ? false : stryMutAct_9fa48("22439") ? true : (stryCov_9fa48("22439", "22440", "22441"), (stryMutAct_9fa48("22444") ? bestBreak <= 0 : stryMutAct_9fa48("22443") ? bestBreak >= 0 : stryMutAct_9fa48("22442") ? true : (stryCov_9fa48("22442", "22443", "22444"), bestBreak > 0)) && (stryMutAct_9fa48("22447") ? bestBreak >= line.length : stryMutAct_9fa48("22446") ? bestBreak <= line.length : stryMutAct_9fa48("22445") ? true : (stryCov_9fa48("22445", "22446", "22447"), bestBreak < line.length)))) {
                  if (stryMutAct_9fa48("22448")) {
                    {}
                  } else {
                    stryCov_9fa48("22448");
                    const firstPart = stryMutAct_9fa48("22449") ? line : (stryCov_9fa48("22449"), line.substring(0, bestBreak));
                    const secondPart = (stryMutAct_9fa48("22450") ? "" : (stryCov_9fa48("22450"), '  ')) + (stryMutAct_9fa48("22452") ? line.trim() : stryMutAct_9fa48("22451") ? line.substring(bestBreak) : (stryCov_9fa48("22451", "22452"), line.substring(bestBreak).trim())); // Indent continuation
                    return firstPart + (stryMutAct_9fa48("22453") ? "" : (stryCov_9fa48("22453"), '\n')) + secondPart;
                  }
                }
              }
            }
            return line;
          }
        });
        return processedLines.join(stryMutAct_9fa48("22454") ? "" : (stryCov_9fa48("22454"), '\n'));
      }
    };

    // Update the formatMessageContent function to NOT include resources for every message
    const formatMessageContent = content => {
      if (stryMutAct_9fa48("22455")) {
        {}
      } else {
        stryCov_9fa48("22455");
        if (stryMutAct_9fa48("22458") ? false : stryMutAct_9fa48("22457") ? true : stryMutAct_9fa48("22456") ? content : (stryCov_9fa48("22456", "22457", "22458"), !content)) return null;

        // Check if content is an object and not a string
        if (stryMutAct_9fa48("22461") ? typeof content !== 'object' : stryMutAct_9fa48("22460") ? false : stryMutAct_9fa48("22459") ? true : (stryCov_9fa48("22459", "22460", "22461"), typeof content === (stryMutAct_9fa48("22462") ? "" : (stryCov_9fa48("22462"), 'object')))) {
          if (stryMutAct_9fa48("22463")) {
            {}
          } else {
            stryCov_9fa48("22463");
            // Convert the object to a readable string format
            try {
              if (stryMutAct_9fa48("22464")) {
                {}
              } else {
                stryCov_9fa48("22464");
                return <pre className="system-message">System message: {JSON.stringify(content, null, 2)}</pre>;
              }
            } catch (e) {
              if (stryMutAct_9fa48("22465")) {
                {}
              } else {
                stryCov_9fa48("22465");
                console.error(stryMutAct_9fa48("22466") ? "" : (stryCov_9fa48("22466"), 'Error stringifying content object:'), e);
                return <p className="error-message">Error displaying message content</p>;
              }
            }
          }
        }

        // Split content by code blocks to handle them separately
        const parts = content.split(stryMutAct_9fa48("22470") ? /(```[\s\s]*?```)/g : stryMutAct_9fa48("22469") ? /(```[\S\S]*?```)/g : stryMutAct_9fa48("22468") ? /(```[^\s\S]*?```)/g : stryMutAct_9fa48("22467") ? /(```[\s\S]```)/g : (stryCov_9fa48("22467", "22468", "22469", "22470"), /(```[\s\S]*?```)/g));
        return <>
        {parts.map((part, index) => {
            if (stryMutAct_9fa48("22471")) {
              {}
            } else {
              stryCov_9fa48("22471");
              // Check if this part is a code block
              if (stryMutAct_9fa48("22474") ? part.startsWith('```') || part.endsWith('```') : stryMutAct_9fa48("22473") ? false : stryMutAct_9fa48("22472") ? true : (stryCov_9fa48("22472", "22473", "22474"), (stryMutAct_9fa48("22475") ? part.endsWith('```') : (stryCov_9fa48("22475"), part.startsWith(stryMutAct_9fa48("22476") ? "" : (stryCov_9fa48("22476"), '```')))) && (stryMutAct_9fa48("22477") ? part.startsWith('```') : (stryCov_9fa48("22477"), part.endsWith(stryMutAct_9fa48("22478") ? "" : (stryCov_9fa48("22478"), '```')))))) {
                if (stryMutAct_9fa48("22479")) {
                  {}
                } else {
                  stryCov_9fa48("22479");
                  // Extract language and code
                  const match = part.match(stryMutAct_9fa48("22485") ? /```(\w*)\n([\s\s]*?)```/ : stryMutAct_9fa48("22484") ? /```(\w*)\n([\S\S]*?)```/ : stryMutAct_9fa48("22483") ? /```(\w*)\n([^\s\S]*?)```/ : stryMutAct_9fa48("22482") ? /```(\w*)\n([\s\S])```/ : stryMutAct_9fa48("22481") ? /```(\W*)\n([\s\S]*?)```/ : stryMutAct_9fa48("22480") ? /```(\w)\n([\s\S]*?)```/ : (stryCov_9fa48("22480", "22481", "22482", "22483", "22484", "22485"), /```(\w*)\n([\s\S]*?)```/));
                  if (stryMutAct_9fa48("22487") ? false : stryMutAct_9fa48("22486") ? true : (stryCov_9fa48("22486", "22487"), match)) {
                    if (stryMutAct_9fa48("22488")) {
                      {}
                    } else {
                      stryCov_9fa48("22488");
                      const [, language, code] = match;

                      // Preprocess the code content for better wrapping
                      const processedCode = preprocessCodeContent(code);
                      return <div key={index} className="code-block-wrapper">
                  <div className="code-block-header">
                    {stryMutAct_9fa48("22491") ? language || <span className="code-language">{language}</span> : stryMutAct_9fa48("22490") ? false : stryMutAct_9fa48("22489") ? true : (stryCov_9fa48("22489", "22490", "22491"), language && <span className="code-language">{language}</span>)}
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
              return <ReactMarkdown key={index} components={stryMutAct_9fa48("22492") ? {} : (stryCov_9fa48("22492"), {
                p: stryMutAct_9fa48("22493") ? () => undefined : (stryCov_9fa48("22493"), ({
                  node,
                  children,
                  ...props
                }) => <p className="markdown-paragraph" {...props}>{children}</p>),
                h1: stryMutAct_9fa48("22494") ? () => undefined : (stryCov_9fa48("22494"), ({
                  node,
                  children,
                  ...props
                }) => <h1 className="markdown-heading" {...props}>{children}</h1>),
                h2: stryMutAct_9fa48("22495") ? () => undefined : (stryCov_9fa48("22495"), ({
                  node,
                  children,
                  ...props
                }) => <h2 className="markdown-heading" {...props}>{children}</h2>),
                h3: stryMutAct_9fa48("22496") ? () => undefined : (stryCov_9fa48("22496"), ({
                  node,
                  children,
                  ...props
                }) => <h3 className="markdown-heading" {...props}>{children}</h3>),
                ul: stryMutAct_9fa48("22497") ? () => undefined : (stryCov_9fa48("22497"), ({
                  node,
                  children,
                  ...props
                }) => <ul className="markdown-list" {...props}>{children}</ul>),
                ol: stryMutAct_9fa48("22498") ? () => undefined : (stryCov_9fa48("22498"), ({
                  node,
                  children,
                  ...props
                }) => <ol className="markdown-list" {...props}>{children}</ol>),
                li: stryMutAct_9fa48("22499") ? () => undefined : (stryCov_9fa48("22499"), ({
                  node,
                  children,
                  ...props
                }) => <li className="markdown-list-item" {...props}>{children}</li>),
                a: stryMutAct_9fa48("22500") ? () => undefined : (stryCov_9fa48("22500"), ({
                  node,
                  children,
                  ...props
                }) => <a className="markdown-link" target="_blank" rel="noopener noreferrer" {...props}>{children}</a>),
                strong: stryMutAct_9fa48("22501") ? () => undefined : (stryCov_9fa48("22501"), ({
                  node,
                  children,
                  ...props
                }) => <strong {...props}>{children}</strong>),
                em: stryMutAct_9fa48("22502") ? () => undefined : (stryCov_9fa48("22502"), ({
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
                  if (stryMutAct_9fa48("22503")) {
                    {}
                  } else {
                    stryCov_9fa48("22503");
                    if (stryMutAct_9fa48("22505") ? false : stryMutAct_9fa48("22504") ? true : (stryCov_9fa48("22504", "22505"), inline)) {
                      if (stryMutAct_9fa48("22506")) {
                        {}
                      } else {
                        stryCov_9fa48("22506");
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

    // Handle textarea auto-resize
    const handleTextareaChange = e => {
      if (stryMutAct_9fa48("22507")) {
        {}
      } else {
        stryCov_9fa48("22507");
        setNewMessage(e.target.value);
        if (stryMutAct_9fa48("22509") ? false : stryMutAct_9fa48("22508") ? true : (stryCov_9fa48("22508", "22509"), textareaRef.current)) {
          if (stryMutAct_9fa48("22510")) {
            {}
          } else {
            stryCov_9fa48("22510");
            textareaRef.current.style.height = stryMutAct_9fa48("22511") ? "" : (stryCov_9fa48("22511"), 'auto');
            textareaRef.current.style.height = stryMutAct_9fa48("22512") ? `` : (stryCov_9fa48("22512"), `${textareaRef.current.scrollHeight}px`);
          }
        }
      }
    };

    // Add this function to handle task navigation
    const navigateToTask = direction => {
      if (stryMutAct_9fa48("22513")) {
        {}
      } else {
        stryCov_9fa48("22513");
        const newIndex = (stryMutAct_9fa48("22516") ? direction !== 'next' : stryMutAct_9fa48("22515") ? false : stryMutAct_9fa48("22514") ? true : (stryCov_9fa48("22514", "22515", "22516"), direction === (stryMutAct_9fa48("22517") ? "" : (stryCov_9fa48("22517"), 'next')))) ? stryMutAct_9fa48("22518") ? Math.max(currentTaskIndex + 1, tasks.length - 1) : (stryCov_9fa48("22518"), Math.min(stryMutAct_9fa48("22519") ? currentTaskIndex - 1 : (stryCov_9fa48("22519"), currentTaskIndex + 1), stryMutAct_9fa48("22520") ? tasks.length + 1 : (stryCov_9fa48("22520"), tasks.length - 1))) : stryMutAct_9fa48("22521") ? Math.min(currentTaskIndex - 1, 0) : (stryCov_9fa48("22521"), Math.max(stryMutAct_9fa48("22522") ? currentTaskIndex + 1 : (stryCov_9fa48("22522"), currentTaskIndex - 1), 0));
        if (stryMutAct_9fa48("22525") ? newIndex === currentTaskIndex : stryMutAct_9fa48("22524") ? false : stryMutAct_9fa48("22523") ? true : (stryCov_9fa48("22523", "22524", "22525"), newIndex !== currentTaskIndex)) {
          if (stryMutAct_9fa48("22526")) {
            {}
          } else {
            stryCov_9fa48("22526");
            // Reset the analysis results
            setAnalysisResults(null);
            setShowAnalysisModal(stryMutAct_9fa48("22527") ? true : (stryCov_9fa48("22527"), false));

            // Update the current task index
            setCurrentTaskIndex(newIndex);

            // Update the URL to reflect the current task
            const newTaskId = tasks[newIndex].id;

            // Preserve the dayId parameter if it exists
            const params = new URLSearchParams(location.search);
            params.set(stryMutAct_9fa48("22528") ? "" : (stryCov_9fa48("22528"), 'taskId'), newTaskId);

            // Update the URL without reloading the page
            navigate(stryMutAct_9fa48("22529") ? `` : (stryCov_9fa48("22529"), `/learning?${params.toString()}`), stryMutAct_9fa48("22530") ? {} : (stryCov_9fa48("22530"), {
              replace: stryMutAct_9fa48("22531") ? false : (stryCov_9fa48("22531"), true)
            }));

            // Handle different task types
            const currentTask = tasks[newIndex];
            if (stryMutAct_9fa48("22534") ? false : stryMutAct_9fa48("22533") ? true : stryMutAct_9fa48("22532") ? currentTask.feedback_slot : (stryCov_9fa48("22532", "22533", "22534"), !currentTask.feedback_slot)) {
              if (stryMutAct_9fa48("22535")) {
                {}
              } else {
                stryCov_9fa48("22535");
                // IMPORTANT: Immediately clear previous messages and show loading state
                // This prevents the previous task's messages from showing while loading
                setMessages(stryMutAct_9fa48("22536") ? [] : (stryCov_9fa48("22536"), [stryMutAct_9fa48("22537") ? {} : (stryCov_9fa48("22537"), {
                  id: stryMutAct_9fa48("22538") ? "" : (stryCov_9fa48("22538"), 'loading'),
                  content: stryMutAct_9fa48("22539") ? `` : (stryCov_9fa48("22539"), `Loading ${currentTask.title}...`),
                  role: stryMutAct_9fa48("22540") ? "" : (stryCov_9fa48("22540"), 'system')
                })]));
                setIsMessagesLoading(stryMutAct_9fa48("22541") ? false : (stryCov_9fa48("22541"), true));

                // Then fetch the messages for the new task
                fetchTaskMessages(newTaskId);

                // Check if current task can be analyzed and if there's an existing analysis
                if (stryMutAct_9fa48("22543") ? false : stryMutAct_9fa48("22542") ? true : (stryCov_9fa48("22542", "22543"), tasks[newIndex].should_analyze)) {
                  if (stryMutAct_9fa48("22544")) {
                    {}
                  } else {
                    stryCov_9fa48("22544");
                    fetchTaskAnalysis(newTaskId);
                  }
                }
              }
            } else {
              if (stryMutAct_9fa48("22545")) {
                {}
              } else {
                stryCov_9fa48("22545");
                // For feedback tasks, clear messages and loading state
                setMessages(stryMutAct_9fa48("22546") ? ["Stryker was here"] : (stryCov_9fa48("22546"), []));
                setIsMessagesLoading(stryMutAct_9fa48("22547") ? true : (stryCov_9fa48("22547"), false));
              }
            }
          }
        }
      }
    };

    // Handle deliverable submission
    const handleDeliverableSubmit = async e => {
      if (stryMutAct_9fa48("22548")) {
        {}
      } else {
        stryCov_9fa48("22548");
        e.preventDefault();
        if (stryMutAct_9fa48("22551") ? false : stryMutAct_9fa48("22550") ? true : stryMutAct_9fa48("22549") ? submissionUrl.trim() : (stryCov_9fa48("22549", "22550", "22551"), !(stryMutAct_9fa48("22552") ? submissionUrl : (stryCov_9fa48("22552"), submissionUrl.trim())))) {
          if (stryMutAct_9fa48("22553")) {
            {}
          } else {
            stryCov_9fa48("22553");
            setSubmissionError(stryMutAct_9fa48("22554") ? "" : (stryCov_9fa48("22554"), 'Please enter a valid URL'));
            return;
          }
        }
        setIsSubmitting(stryMutAct_9fa48("22555") ? false : (stryCov_9fa48("22555"), true));
        setSubmissionError(stryMutAct_9fa48("22556") ? "Stryker was here!" : (stryCov_9fa48("22556"), ''));
        try {
          if (stryMutAct_9fa48("22557")) {
            {}
          } else {
            stryCov_9fa48("22557");
            const response = await fetch(stryMutAct_9fa48("22558") ? `` : (stryCov_9fa48("22558"), `${import.meta.env.VITE_API_URL}/api/submissions`), stryMutAct_9fa48("22559") ? {} : (stryCov_9fa48("22559"), {
              method: stryMutAct_9fa48("22560") ? "" : (stryCov_9fa48("22560"), 'POST'),
              headers: stryMutAct_9fa48("22561") ? {} : (stryCov_9fa48("22561"), {
                'Content-Type': stryMutAct_9fa48("22562") ? "" : (stryCov_9fa48("22562"), 'application/json'),
                'Authorization': stryMutAct_9fa48("22563") ? `` : (stryCov_9fa48("22563"), `Bearer ${token}`)
              }),
              body: JSON.stringify(stryMutAct_9fa48("22564") ? {} : (stryCov_9fa48("22564"), {
                taskId: tasks[currentTaskIndex].id,
                content: submissionUrl
              }))
            }));
            if (stryMutAct_9fa48("22566") ? false : stryMutAct_9fa48("22565") ? true : (stryCov_9fa48("22565", "22566"), response.ok)) {
              if (stryMutAct_9fa48("22567")) {
                {}
              } else {
                stryCov_9fa48("22567");
                // Close the modal on success
                setShowSubmissionModal(stryMutAct_9fa48("22568") ? true : (stryCov_9fa48("22568"), false));
                setSubmissionUrl(stryMutAct_9fa48("22569") ? "Stryker was here!" : (stryCov_9fa48("22569"), ''));

                // Show success message
                setError(stryMutAct_9fa48("22570") ? "" : (stryCov_9fa48("22570"), 'Deliverable submitted successfully!'));
                setTimeout(stryMutAct_9fa48("22571") ? () => undefined : (stryCov_9fa48("22571"), () => setError(stryMutAct_9fa48("22572") ? "Stryker was here!" : (stryCov_9fa48("22572"), ''))), 3000);
              }
            } else {
              if (stryMutAct_9fa48("22573")) {
                {}
              } else {
                stryCov_9fa48("22573");
                const data = await response.json();
                setSubmissionError(stryMutAct_9fa48("22576") ? data.error && 'Failed to submit deliverable' : stryMutAct_9fa48("22575") ? false : stryMutAct_9fa48("22574") ? true : (stryCov_9fa48("22574", "22575", "22576"), data.error || (stryMutAct_9fa48("22577") ? "" : (stryCov_9fa48("22577"), 'Failed to submit deliverable'))));
              }
            }
          }
        } catch (err) {
          if (stryMutAct_9fa48("22578")) {
            {}
          } else {
            stryCov_9fa48("22578");
            console.error(stryMutAct_9fa48("22579") ? "" : (stryCov_9fa48("22579"), 'Error submitting deliverable:'), err);
            setSubmissionError(stryMutAct_9fa48("22580") ? "" : (stryCov_9fa48("22580"), 'Network error. Please try again.'));
          }
        } finally {
          if (stryMutAct_9fa48("22581")) {
            {}
          } else {
            stryCov_9fa48("22581");
            setIsSubmitting(stryMutAct_9fa48("22582") ? true : (stryCov_9fa48("22582"), false));
          }
        }
      }
    };

    // Add message editing functions after the handleSendMessage function
    // Handle edit message button click
    const handleEditMessage = message => {
      if (stryMutAct_9fa48("22583")) {
        {}
      } else {
        stryCov_9fa48("22583");
        console.log(stryMutAct_9fa48("22584") ? "" : (stryCov_9fa48("22584"), 'Editing message with full data:'), message);

        // Check if message has an actual server-assigned ID
        // Some messages might have been generated client-side and only have the timestamp ID
        const messageId = stryMutAct_9fa48("22587") ? message.message_id && message.id : stryMutAct_9fa48("22586") ? false : stryMutAct_9fa48("22585") ? true : (stryCov_9fa48("22585", "22586", "22587"), message.message_id || message.id);
        console.log(stryMutAct_9fa48("22588") ? "" : (stryCov_9fa48("22588"), 'Message ID type:'), typeof messageId, stryMutAct_9fa48("22589") ? "" : (stryCov_9fa48("22589"), 'Value:'), messageId);
        console.log(stryMutAct_9fa48("22590") ? "" : (stryCov_9fa48("22590"), 'Message properties:'), Object.keys(message).join(stryMutAct_9fa48("22591") ? "" : (stryCov_9fa48("22591"), ', ')));

        // Debug: check if the message has the message_id property
        if (stryMutAct_9fa48("22593") ? false : stryMutAct_9fa48("22592") ? true : (stryCov_9fa48("22592", "22593"), message.hasOwnProperty(stryMutAct_9fa48("22594") ? "" : (stryCov_9fa48("22594"), 'message_id')))) {
          if (stryMutAct_9fa48("22595")) {
            {}
          } else {
            stryCov_9fa48("22595");
            console.log(stryMutAct_9fa48("22596") ? "" : (stryCov_9fa48("22596"), 'Message has message_id property:'), message.message_id);
          }
        } else {
          if (stryMutAct_9fa48("22597")) {
            {}
          } else {
            stryCov_9fa48("22597");
            console.log(stryMutAct_9fa48("22598") ? "" : (stryCov_9fa48("22598"), 'Message does NOT have message_id property, using id:'), message.id);
          }
        }

        // Ensure ID is treated as a string
        setEditingMessageId(String(messageId));
        setEditMessageContent(message.content);

        // Focus the textarea after it's rendered
        setTimeout(() => {
          if (stryMutAct_9fa48("22599")) {
            {}
          } else {
            stryCov_9fa48("22599");
            if (stryMutAct_9fa48("22601") ? false : stryMutAct_9fa48("22600") ? true : (stryCov_9fa48("22600", "22601"), editTextareaRef.current)) {
              if (stryMutAct_9fa48("22602")) {
                {}
              } else {
                stryCov_9fa48("22602");
                editTextareaRef.current.focus();

                // Auto-resize the textarea
                editTextareaRef.current.style.height = stryMutAct_9fa48("22603") ? "" : (stryCov_9fa48("22603"), 'auto');
                editTextareaRef.current.style.height = stryMutAct_9fa48("22604") ? `` : (stryCov_9fa48("22604"), `${editTextareaRef.current.scrollHeight}px`);
              }
            }
          }
        }, 0);
      }
    };

    // Handle edit message form submission
    const handleUpdateMessage = async messageId => {
      if (stryMutAct_9fa48("22605")) {
        {}
      } else {
        stryCov_9fa48("22605");
        if (stryMutAct_9fa48("22608") ? !editMessageContent.trim() && isUpdating : stryMutAct_9fa48("22607") ? false : stryMutAct_9fa48("22606") ? true : (stryCov_9fa48("22606", "22607", "22608"), (stryMutAct_9fa48("22609") ? editMessageContent.trim() : (stryCov_9fa48("22609"), !(stryMutAct_9fa48("22610") ? editMessageContent : (stryCov_9fa48("22610"), editMessageContent.trim())))) || isUpdating)) return;
        console.log(stryMutAct_9fa48("22611") ? "" : (stryCov_9fa48("22611"), 'Attempting to update message ID:'), messageId, stryMutAct_9fa48("22612") ? "" : (stryCov_9fa48("22612"), 'Type:'), typeof messageId);
        setIsUpdating(stryMutAct_9fa48("22613") ? false : (stryCov_9fa48("22613"), true));
        try {
          if (stryMutAct_9fa48("22614")) {
            {}
          } else {
            stryCov_9fa48("22614");
            // Convert messageId to string to ensure consistent handling
            const messageIdStr = String(messageId);

            // First, verify the message ID with the server
            console.log(stryMutAct_9fa48("22615") ? `` : (stryCov_9fa48("22615"), `Verifying message ID before update: ${messageIdStr}`));
            const verifiedId = await verifyMessageId(messageIdStr);

            // Use the verified ID if available, otherwise use the original ID
            const finalMessageId = stryMutAct_9fa48("22618") ? verifiedId && messageIdStr : stryMutAct_9fa48("22617") ? false : stryMutAct_9fa48("22616") ? true : (stryCov_9fa48("22616", "22617", "22618"), verifiedId || messageIdStr);
            console.log(stryMutAct_9fa48("22619") ? `` : (stryCov_9fa48("22619"), `Using ID for update: ${finalMessageId} (verified: ${Boolean(verifiedId)})`));
            const apiUrl = stryMutAct_9fa48("22620") ? `` : (stryCov_9fa48("22620"), `${import.meta.env.VITE_API_URL}/api/learning/messages/${finalMessageId}`);
            console.log(stryMutAct_9fa48("22621") ? "" : (stryCov_9fa48("22621"), 'Sending PUT request to:'), apiUrl);
            const response = await fetch(apiUrl, stryMutAct_9fa48("22622") ? {} : (stryCov_9fa48("22622"), {
              method: stryMutAct_9fa48("22623") ? "" : (stryCov_9fa48("22623"), 'PUT'),
              headers: stryMutAct_9fa48("22624") ? {} : (stryCov_9fa48("22624"), {
                'Content-Type': stryMutAct_9fa48("22625") ? "" : (stryCov_9fa48("22625"), 'application/json'),
                'Authorization': stryMutAct_9fa48("22626") ? `` : (stryCov_9fa48("22626"), `Bearer ${token}`)
              }),
              body: JSON.stringify(stryMutAct_9fa48("22627") ? {} : (stryCov_9fa48("22627"), {
                content: editMessageContent
              }))
            }));
            console.log(stryMutAct_9fa48("22628") ? "" : (stryCov_9fa48("22628"), 'PUT response status:'), response.status);
            if (stryMutAct_9fa48("22631") ? false : stryMutAct_9fa48("22630") ? true : stryMutAct_9fa48("22629") ? response.ok : (stryCov_9fa48("22629", "22630", "22631"), !response.ok)) {
              if (stryMutAct_9fa48("22632")) {
                {}
              } else {
                stryCov_9fa48("22632");
                const errorData = await response.json();
                console.error(stryMutAct_9fa48("22633") ? "" : (stryCov_9fa48("22633"), 'Error response data:'), errorData);
                throw new Error(stryMutAct_9fa48("22636") ? errorData.error && 'Failed to update message' : stryMutAct_9fa48("22635") ? false : stryMutAct_9fa48("22634") ? true : (stryCov_9fa48("22634", "22635", "22636"), errorData.error || (stryMutAct_9fa48("22637") ? "" : (stryCov_9fa48("22637"), 'Failed to update message'))));
              }
            }
            const updatedMessage = await response.json();
            console.log(stryMutAct_9fa48("22638") ? "" : (stryCov_9fa48("22638"), 'Successfully updated message:'), updatedMessage);

            // Update the message in the state
            // Use the ID returned from the server, not the one we sent
            setMessages(stryMutAct_9fa48("22639") ? () => undefined : (stryCov_9fa48("22639"), prevMessages => prevMessages.map(stryMutAct_9fa48("22640") ? () => undefined : (stryCov_9fa48("22640"), msg => (stryMutAct_9fa48("22643") ? String(msg.id) !== messageIdStr : stryMutAct_9fa48("22642") ? false : stryMutAct_9fa48("22641") ? true : (stryCov_9fa48("22641", "22642", "22643"), String(msg.id) === messageIdStr)) ? stryMutAct_9fa48("22644") ? {} : (stryCov_9fa48("22644"), {
              ...msg,
              id: updatedMessage.message_id,
              // Use the server's ID
              message_id: updatedMessage.message_id,
              // Store both versions for consistency
              content: updatedMessage.content,
              updated: stryMutAct_9fa48("22645") ? false : (stryCov_9fa48("22645"), true)
            }) : msg))));

            // Reset edit state
            setEditingMessageId(null);
            setEditMessageContent(stryMutAct_9fa48("22646") ? "Stryker was here!" : (stryCov_9fa48("22646"), ''));

            // Show success notification
            setError(stryMutAct_9fa48("22647") ? "" : (stryCov_9fa48("22647"), 'Message updated successfully!'));
            setTimeout(stryMutAct_9fa48("22648") ? () => undefined : (stryCov_9fa48("22648"), () => setError(stryMutAct_9fa48("22649") ? "Stryker was here!" : (stryCov_9fa48("22649"), ''))), 3000);
          }
        } catch (err) {
          if (stryMutAct_9fa48("22650")) {
            {}
          } else {
            stryCov_9fa48("22650");
            console.error(stryMutAct_9fa48("22651") ? "" : (stryCov_9fa48("22651"), 'Error updating message:'), err);
            setError(stryMutAct_9fa48("22652") ? `` : (stryCov_9fa48("22652"), `Failed to update message: ${err.message}`));
          }
        } finally {
          if (stryMutAct_9fa48("22653")) {
            {}
          } else {
            stryCov_9fa48("22653");
            setIsUpdating(stryMutAct_9fa48("22654") ? true : (stryCov_9fa48("22654"), false));
          }
        }
      }
    };

    // Handle cancel edit
    const handleCancelEdit = () => {
      if (stryMutAct_9fa48("22655")) {
        {}
      } else {
        stryCov_9fa48("22655");
        setEditingMessageId(null);
        setEditMessageContent(stryMutAct_9fa48("22656") ? "Stryker was here!" : (stryCov_9fa48("22656"), ''));
      }
    };

    // Handle edit textarea auto-resize
    const handleEditTextareaChange = e => {
      if (stryMutAct_9fa48("22657")) {
        {}
      } else {
        stryCov_9fa48("22657");
        setEditMessageContent(e.target.value);
        if (stryMutAct_9fa48("22659") ? false : stryMutAct_9fa48("22658") ? true : (stryCov_9fa48("22658", "22659"), editTextareaRef.current)) {
          if (stryMutAct_9fa48("22660")) {
            {}
          } else {
            stryCov_9fa48("22660");
            editTextareaRef.current.style.height = stryMutAct_9fa48("22661") ? "" : (stryCov_9fa48("22661"), 'auto');
            editTextareaRef.current.style.height = stryMutAct_9fa48("22662") ? `` : (stryCov_9fa48("22662"), `${editTextareaRef.current.scrollHeight}px`);
          }
        }
      }
    };

    // Add a function to fetch a message by ID to verify we have the correct ID
    const verifyMessageId = async messageId => {
      if (stryMutAct_9fa48("22663")) {
        {}
      } else {
        stryCov_9fa48("22663");
        try {
          if (stryMutAct_9fa48("22664")) {
            {}
          } else {
            stryCov_9fa48("22664");
            console.log(stryMutAct_9fa48("22665") ? `` : (stryCov_9fa48("22665"), `Verifying message ID: ${messageId}`));
            const response = await fetch(stryMutAct_9fa48("22666") ? `` : (stryCov_9fa48("22666"), `${import.meta.env.VITE_API_URL}/api/learning/messages/${messageId}/verify`), stryMutAct_9fa48("22667") ? {} : (stryCov_9fa48("22667"), {
              headers: stryMutAct_9fa48("22668") ? {} : (stryCov_9fa48("22668"), {
                'Authorization': stryMutAct_9fa48("22669") ? `` : (stryCov_9fa48("22669"), `Bearer ${token}`)
              })
            }));
            if (stryMutAct_9fa48("22672") ? false : stryMutAct_9fa48("22671") ? true : stryMutAct_9fa48("22670") ? response.ok : (stryCov_9fa48("22670", "22671", "22672"), !response.ok)) {
              if (stryMutAct_9fa48("22673")) {
                {}
              } else {
                stryCov_9fa48("22673");
                console.log(stryMutAct_9fa48("22674") ? `` : (stryCov_9fa48("22674"), `Message verification failed with status: ${response.status}`));
                return null;
              }
            }
            const data = await response.json();
            console.log(stryMutAct_9fa48("22675") ? `` : (stryCov_9fa48("22675"), `Message verification result:`), data);
            return data.message_id;
          }
        } catch (error) {
          if (stryMutAct_9fa48("22676")) {
            {}
          } else {
            stryCov_9fa48("22676");
            console.error(stryMutAct_9fa48("22677") ? `` : (stryCov_9fa48("22677"), `Error verifying message ID:`), error);
            return null;
          }
        }
      }
    };

    // Update fetchTaskAnalysis to handle specific analysis types
    const fetchTaskAnalysis = async (taskId, type = null) => {
      if (stryMutAct_9fa48("22678")) {
        {}
      } else {
        stryCov_9fa48("22678");
        if (stryMutAct_9fa48("22681") ? false : stryMutAct_9fa48("22680") ? true : stryMutAct_9fa48("22679") ? taskId : (stryCov_9fa48("22679", "22680", "22681"), !taskId)) {
          if (stryMutAct_9fa48("22682")) {
            {}
          } else {
            stryCov_9fa48("22682");
            console.log(stryMutAct_9fa48("22683") ? "" : (stryCov_9fa48("22683"), 'No taskId provided to fetchTaskAnalysis'));
            return stryMutAct_9fa48("22684") ? true : (stryCov_9fa48("22684"), false);
          }
        }
        try {
          if (stryMutAct_9fa48("22685")) {
            {}
          } else {
            stryCov_9fa48("22685");
            // Build URL with type parameter if provided
            let url = stryMutAct_9fa48("22686") ? `` : (stryCov_9fa48("22686"), `${import.meta.env.VITE_API_URL}/api/analyze-task/${taskId}/analysis`);
            if (stryMutAct_9fa48("22688") ? false : stryMutAct_9fa48("22687") ? true : (stryCov_9fa48("22687", "22688"), type)) {
              if (stryMutAct_9fa48("22689")) {
                {}
              } else {
                stryCov_9fa48("22689");
                url += stryMutAct_9fa48("22690") ? `` : (stryCov_9fa48("22690"), `?type=${type}`);
              }
            }
            const response = await fetch(url, stryMutAct_9fa48("22691") ? {} : (stryCov_9fa48("22691"), {
              headers: stryMutAct_9fa48("22692") ? {} : (stryCov_9fa48("22692"), {
                'Authorization': stryMutAct_9fa48("22693") ? `` : (stryCov_9fa48("22693"), `Bearer ${token}`)
              })
            }));
            if (stryMutAct_9fa48("22695") ? false : stryMutAct_9fa48("22694") ? true : (stryCov_9fa48("22694", "22695"), response.ok)) {
              if (stryMutAct_9fa48("22696")) {
                {}
              } else {
                stryCov_9fa48("22696");
                const data = await response.json();
                setAnalysisResults(data);
                setAnalysisType(stryMutAct_9fa48("22699") ? type && data.analysis_type : stryMutAct_9fa48("22698") ? false : stryMutAct_9fa48("22697") ? true : (stryCov_9fa48("22697", "22698", "22699"), type || data.analysis_type)); // Store which type of analysis is being viewed
                return stryMutAct_9fa48("22700") ? false : (stryCov_9fa48("22700"), true);
              }
            } else {
              if (stryMutAct_9fa48("22701")) {
                {}
              } else {
                stryCov_9fa48("22701");
                console.log(stryMutAct_9fa48("22702") ? `` : (stryCov_9fa48("22702"), `No analysis found for task ${taskId} type ${type}, status: ${response.status}`));
                if (stryMutAct_9fa48("22705") ? false : stryMutAct_9fa48("22704") ? true : stryMutAct_9fa48("22703") ? type : (stryCov_9fa48("22703", "22704", "22705"), !type)) {
                  if (stryMutAct_9fa48("22706")) {
                    {}
                  } else {
                    stryCov_9fa48("22706");
                    // Only clear results if not looking for a specific type
                    setAnalysisResults(null);
                  }
                }
                return stryMutAct_9fa48("22707") ? true : (stryCov_9fa48("22707"), false);
              }
            }
          }
        } catch (error) {
          if (stryMutAct_9fa48("22708")) {
            {}
          } else {
            stryCov_9fa48("22708");
            console.error(stryMutAct_9fa48("22709") ? `` : (stryCov_9fa48("22709"), `Error fetching task analysis for task ${taskId}:`), error);
            if (stryMutAct_9fa48("22712") ? false : stryMutAct_9fa48("22711") ? true : stryMutAct_9fa48("22710") ? type : (stryCov_9fa48("22710", "22711", "22712"), !type)) {
              if (stryMutAct_9fa48("22713")) {
                {}
              } else {
                stryCov_9fa48("22713");
                // Only clear results if not looking for a specific type
                setAnalysisResults(null);
              }
            }
            return stryMutAct_9fa48("22714") ? true : (stryCov_9fa48("22714"), false);
          }
        }
      }
    };

    // Update handleAnalyzeTask to refresh available analyses
    const handleAnalyzeTask = async () => {
      if (stryMutAct_9fa48("22715")) {
        {}
      } else {
        stryCov_9fa48("22715");
        if (stryMutAct_9fa48("22718") ? !tasks.length && currentTaskIndex >= tasks.length : stryMutAct_9fa48("22717") ? false : stryMutAct_9fa48("22716") ? true : (stryCov_9fa48("22716", "22717", "22718"), (stryMutAct_9fa48("22719") ? tasks.length : (stryCov_9fa48("22719"), !tasks.length)) || (stryMutAct_9fa48("22722") ? currentTaskIndex < tasks.length : stryMutAct_9fa48("22721") ? currentTaskIndex > tasks.length : stryMutAct_9fa48("22720") ? false : (stryCov_9fa48("22720", "22721", "22722"), currentTaskIndex >= tasks.length)))) return;
        const currentTask = tasks[currentTaskIndex];
        if (stryMutAct_9fa48("22725") ? false : stryMutAct_9fa48("22724") ? true : stryMutAct_9fa48("22723") ? currentTask.should_analyze : (stryCov_9fa48("22723", "22724", "22725"), !currentTask.should_analyze)) return;
        setIsAnalyzing(stryMutAct_9fa48("22726") ? false : (stryCov_9fa48("22726"), true));
        setAnalysisError(null);
        try {
          if (stryMutAct_9fa48("22727")) {
            {}
          } else {
            stryCov_9fa48("22727");
            const response = await fetch(stryMutAct_9fa48("22728") ? `` : (stryCov_9fa48("22728"), `${import.meta.env.VITE_API_URL}/api/analyze-task/${currentTask.id}/analyze-chat`), stryMutAct_9fa48("22729") ? {} : (stryCov_9fa48("22729"), {
              method: stryMutAct_9fa48("22730") ? "" : (stryCov_9fa48("22730"), 'POST'),
              headers: stryMutAct_9fa48("22731") ? {} : (stryCov_9fa48("22731"), {
                'Authorization': stryMutAct_9fa48("22732") ? `` : (stryCov_9fa48("22732"), `Bearer ${token}`)
              })
            }));
            if (stryMutAct_9fa48("22735") ? false : stryMutAct_9fa48("22734") ? true : stryMutAct_9fa48("22733") ? response.ok : (stryCov_9fa48("22733", "22734", "22735"), !response.ok)) {
              if (stryMutAct_9fa48("22736")) {
                {}
              } else {
                stryCov_9fa48("22736");
                throw new Error(stryMutAct_9fa48("22737") ? "" : (stryCov_9fa48("22737"), 'Failed to analyze task'));
              }
            }
            const data = await response.json();
            setAnalysisResults(data);
            setAnalysisType(stryMutAct_9fa48("22738") ? "" : (stryCov_9fa48("22738"), 'conversation'));

            // Refresh available analyses
            await fetchAvailableAnalyses(currentTask.id);
            setShowAnalysisModal(stryMutAct_9fa48("22739") ? false : (stryCov_9fa48("22739"), true));
            setError(stryMutAct_9fa48("22740") ? "" : (stryCov_9fa48("22740"), 'Analysis completed successfully!'));
            setTimeout(stryMutAct_9fa48("22741") ? () => undefined : (stryCov_9fa48("22741"), () => setError(stryMutAct_9fa48("22742") ? "Stryker was here!" : (stryCov_9fa48("22742"), ''))), 3000);
          }
        } catch (error) {
          if (stryMutAct_9fa48("22743")) {
            {}
          } else {
            stryCov_9fa48("22743");
            setAnalysisError(error.message);
            setError((stryMutAct_9fa48("22744") ? "" : (stryCov_9fa48("22744"), 'Failed to analyze task: ')) + error.message);
          }
        } finally {
          if (stryMutAct_9fa48("22745")) {
            {}
          } else {
            stryCov_9fa48("22745");
            setIsAnalyzing(stryMutAct_9fa48("22746") ? true : (stryCov_9fa48("22746"), false));
          }
        }
      }
    };

    // Update handleAnalyzeDeliverable to include proper error handling
    const handleAnalyzeDeliverable = async url => {
      if (stryMutAct_9fa48("22747")) {
        {}
      } else {
        stryCov_9fa48("22747");
        if (stryMutAct_9fa48("22750") ? !tasks.length && currentTaskIndex >= tasks.length : stryMutAct_9fa48("22749") ? false : stryMutAct_9fa48("22748") ? true : (stryCov_9fa48("22748", "22749", "22750"), (stryMutAct_9fa48("22751") ? tasks.length : (stryCov_9fa48("22751"), !tasks.length)) || (stryMutAct_9fa48("22754") ? currentTaskIndex < tasks.length : stryMutAct_9fa48("22753") ? currentTaskIndex > tasks.length : stryMutAct_9fa48("22752") ? false : (stryCov_9fa48("22752", "22753", "22754"), currentTaskIndex >= tasks.length)))) return;
        const currentTask = tasks[currentTaskIndex];

        // Log debugging information
        console.log(stryMutAct_9fa48("22755") ? "" : (stryCov_9fa48("22755"), 'handleAnalyzeDeliverable called with:'), stryMutAct_9fa48("22756") ? {} : (stryCov_9fa48("22756"), {
          url,
          taskId: currentTask.id,
          analyze_deliverable: stryMutAct_9fa48("22759") ? currentTask.analyze_deliverable && false : stryMutAct_9fa48("22758") ? false : stryMutAct_9fa48("22757") ? true : (stryCov_9fa48("22757", "22758", "22759"), currentTask.analyze_deliverable || (stryMutAct_9fa48("22760") ? true : (stryCov_9fa48("22760"), false)))
        }));

        // Set loading state
        setIsAnalyzing(stryMutAct_9fa48("22761") ? false : (stryCov_9fa48("22761"), true));
        setError(stryMutAct_9fa48("22762") ? "Stryker was here!" : (stryCov_9fa48("22762"), ''));
        try {
          if (stryMutAct_9fa48("22763")) {
            {}
          } else {
            stryCov_9fa48("22763");
            // Call the API to analyze the deliverable
            const response = await fetch(stryMutAct_9fa48("22764") ? `` : (stryCov_9fa48("22764"), `${import.meta.env.VITE_API_URL}/api/analyze-task/${currentTask.id}/analyze-deliverable`), stryMutAct_9fa48("22765") ? {} : (stryCov_9fa48("22765"), {
              method: stryMutAct_9fa48("22766") ? "" : (stryCov_9fa48("22766"), 'POST'),
              headers: stryMutAct_9fa48("22767") ? {} : (stryCov_9fa48("22767"), {
                'Content-Type': stryMutAct_9fa48("22768") ? "" : (stryCov_9fa48("22768"), 'application/json'),
                'Authorization': stryMutAct_9fa48("22769") ? `` : (stryCov_9fa48("22769"), `Bearer ${token}`)
              }),
              body: JSON.stringify(stryMutAct_9fa48("22770") ? {} : (stryCov_9fa48("22770"), {
                url
              }))
            }));
            console.log(stryMutAct_9fa48("22771") ? "" : (stryCov_9fa48("22771"), 'Analyze deliverable response:'), response.status, response.statusText);
            if (stryMutAct_9fa48("22774") ? false : stryMutAct_9fa48("22773") ? true : stryMutAct_9fa48("22772") ? response.ok : (stryCov_9fa48("22772", "22773", "22774"), !response.ok)) {
              if (stryMutAct_9fa48("22775")) {
                {}
              } else {
                stryCov_9fa48("22775");
                const errorData = await response.json().catch(stryMutAct_9fa48("22776") ? () => undefined : (stryCov_9fa48("22776"), () => stryMutAct_9fa48("22777") ? {} : (stryCov_9fa48("22777"), {
                  error: stryMutAct_9fa48("22778") ? `` : (stryCov_9fa48("22778"), `HTTP error ${response.status}`)
                })));
                const errorMessage = stryMutAct_9fa48("22781") ? errorData.error && `Failed to analyze deliverable: ${response.status} ${response.statusText}` : stryMutAct_9fa48("22780") ? false : stryMutAct_9fa48("22779") ? true : (stryCov_9fa48("22779", "22780", "22781"), errorData.error || (stryMutAct_9fa48("22782") ? `` : (stryCov_9fa48("22782"), `Failed to analyze deliverable: ${response.status} ${response.statusText}`)));
                console.error(stryMutAct_9fa48("22783") ? "" : (stryCov_9fa48("22783"), 'Error response data:'), errorData);
                throw new Error(errorMessage);
              }
            }
            const data = await response.json();
            console.log(stryMutAct_9fa48("22784") ? "" : (stryCov_9fa48("22784"), 'Analyze deliverable success, data received'));

            // Update UI with results
            setAnalysisResults(data);
            setAnalysisType(stryMutAct_9fa48("22785") ? "" : (stryCov_9fa48("22785"), 'deliverable'));

            // Refresh available analyses
            await fetchAvailableAnalyses(currentTask.id);
            setShowAnalysisModal(stryMutAct_9fa48("22786") ? false : (stryCov_9fa48("22786"), true));
            setError(stryMutAct_9fa48("22787") ? "" : (stryCov_9fa48("22787"), 'Deliverable analyzed successfully!'));
            setTimeout(stryMutAct_9fa48("22788") ? () => undefined : (stryCov_9fa48("22788"), () => setError(stryMutAct_9fa48("22789") ? "Stryker was here!" : (stryCov_9fa48("22789"), ''))), 3000);
            return data;
          }
        } catch (error) {
          if (stryMutAct_9fa48("22790")) {
            {}
          } else {
            stryCov_9fa48("22790");
            console.error(stryMutAct_9fa48("22791") ? "" : (stryCov_9fa48("22791"), 'Error analyzing deliverable:'), error);
            setError(stryMutAct_9fa48("22792") ? `` : (stryCov_9fa48("22792"), `Failed to analyze deliverable: ${error.message}`));

            // Propagate the error so the TaskSubmission component can handle it
            throw error;
          }
        } finally {
          if (stryMutAct_9fa48("22793")) {
            {}
          } else {
            stryCov_9fa48("22793");
            setIsAnalyzing(stryMutAct_9fa48("22794") ? true : (stryCov_9fa48("22794"), false));
          }
        }
      }
    };

    // Handle switching between different analysis types
    const handleSwitchAnalysis = async type => {
      if (stryMutAct_9fa48("22795")) {
        {}
      } else {
        stryCov_9fa48("22795");
        if (stryMutAct_9fa48("22798") ? (!type || !tasks.length) && currentTaskIndex >= tasks.length : stryMutAct_9fa48("22797") ? false : stryMutAct_9fa48("22796") ? true : (stryCov_9fa48("22796", "22797", "22798"), (stryMutAct_9fa48("22800") ? !type && !tasks.length : stryMutAct_9fa48("22799") ? false : (stryCov_9fa48("22799", "22800"), (stryMutAct_9fa48("22801") ? type : (stryCov_9fa48("22801"), !type)) || (stryMutAct_9fa48("22802") ? tasks.length : (stryCov_9fa48("22802"), !tasks.length)))) || (stryMutAct_9fa48("22805") ? currentTaskIndex < tasks.length : stryMutAct_9fa48("22804") ? currentTaskIndex > tasks.length : stryMutAct_9fa48("22803") ? false : (stryCov_9fa48("22803", "22804", "22805"), currentTaskIndex >= tasks.length)))) return;
        const currentTask = tasks[currentTaskIndex];
        setAnalysisType(type);

        // Fetch the appropriate analysis based on type
        if (stryMutAct_9fa48("22808") ? type !== 'deliverable' : stryMutAct_9fa48("22807") ? false : stryMutAct_9fa48("22806") ? true : (stryCov_9fa48("22806", "22807", "22808"), type === (stryMutAct_9fa48("22809") ? "" : (stryCov_9fa48("22809"), 'deliverable')))) {
          if (stryMutAct_9fa48("22810")) {
            {}
          } else {
            stryCov_9fa48("22810");
            // Make sure we have the submission data for deliverable analysis
            await fetchTaskSubmission(currentTask.id);
          }
        }

        // Fetch the analysis for the selected type
        await fetchTaskAnalysis(currentTask.id, type);
      }
    };

    // Add a function to fetch all available analyses for a task
    const fetchAvailableAnalyses = async taskId => {
      if (stryMutAct_9fa48("22811")) {
        {}
      } else {
        stryCov_9fa48("22811");
        if (stryMutAct_9fa48("22814") ? false : stryMutAct_9fa48("22813") ? true : stryMutAct_9fa48("22812") ? taskId : (stryCov_9fa48("22812", "22813", "22814"), !taskId)) return;
        try {
          if (stryMutAct_9fa48("22815")) {
            {}
          } else {
            stryCov_9fa48("22815");
            const response = await fetch(stryMutAct_9fa48("22816") ? `` : (stryCov_9fa48("22816"), `${import.meta.env.VITE_API_URL}/api/analyze-task/${taskId}/all-analyses`), stryMutAct_9fa48("22817") ? {} : (stryCov_9fa48("22817"), {
              headers: stryMutAct_9fa48("22818") ? {} : (stryCov_9fa48("22818"), {
                'Authorization': stryMutAct_9fa48("22819") ? `` : (stryCov_9fa48("22819"), `Bearer ${token}`)
              })
            }));
            if (stryMutAct_9fa48("22821") ? false : stryMutAct_9fa48("22820") ? true : (stryCov_9fa48("22820", "22821"), response.ok)) {
              if (stryMutAct_9fa48("22822")) {
                {}
              } else {
                stryCov_9fa48("22822");
                const data = await response.json();
                setAvailableAnalyses(data);

                // If we already have a selected analysis type, keep it
                // Otherwise, select the first available type
                if (stryMutAct_9fa48("22825") ? !analysisType || Object.keys(data).length > 0 : stryMutAct_9fa48("22824") ? false : stryMutAct_9fa48("22823") ? true : (stryCov_9fa48("22823", "22824", "22825"), (stryMutAct_9fa48("22826") ? analysisType : (stryCov_9fa48("22826"), !analysisType)) && (stryMutAct_9fa48("22829") ? Object.keys(data).length <= 0 : stryMutAct_9fa48("22828") ? Object.keys(data).length >= 0 : stryMutAct_9fa48("22827") ? true : (stryCov_9fa48("22827", "22828", "22829"), Object.keys(data).length > 0)))) {
                  if (stryMutAct_9fa48("22830")) {
                    {}
                  } else {
                    stryCov_9fa48("22830");
                    const firstType = Object.keys(data)[0];
                    setAnalysisType(firstType);

                    // Load the first analysis of this type
                    if (stryMutAct_9fa48("22833") ? data[firstType] || data[firstType].length > 0 : stryMutAct_9fa48("22832") ? false : stryMutAct_9fa48("22831") ? true : (stryCov_9fa48("22831", "22832", "22833"), data[firstType] && (stryMutAct_9fa48("22836") ? data[firstType].length <= 0 : stryMutAct_9fa48("22835") ? data[firstType].length >= 0 : stryMutAct_9fa48("22834") ? true : (stryCov_9fa48("22834", "22835", "22836"), data[firstType].length > 0)))) {
                      if (stryMutAct_9fa48("22837")) {
                        {}
                      } else {
                        stryCov_9fa48("22837");
                        await fetchTaskAnalysis(taskId, firstType);
                      }
                    }
                  }
                }
                return data;
              }
            } else {
              if (stryMutAct_9fa48("22838")) {
                {}
              } else {
                stryCov_9fa48("22838");
                // 404 is expected if no analyses exist yet
                if (stryMutAct_9fa48("22841") ? response.status === 404 : stryMutAct_9fa48("22840") ? false : stryMutAct_9fa48("22839") ? true : (stryCov_9fa48("22839", "22840", "22841"), response.status !== 404)) {
                  if (stryMutAct_9fa48("22842")) {
                    {}
                  } else {
                    stryCov_9fa48("22842");
                    console.error(stryMutAct_9fa48("22843") ? `` : (stryCov_9fa48("22843"), `Error fetching analyses: ${response.status}`));
                  }
                }
                setAvailableAnalyses({});
                return {};
              }
            }
          }
        } catch (error) {
          if (stryMutAct_9fa48("22844")) {
            {}
          } else {
            stryCov_9fa48("22844");
            console.error(stryMutAct_9fa48("22845") ? `` : (stryCov_9fa48("22845"), `Error fetching analyses:`), error);
            setAvailableAnalyses({});
            return {};
          }
        }
      }
    };

    // Update useEffect to fetch analyses when the task changes
    useEffect(() => {
      if (stryMutAct_9fa48("22846")) {
        {}
      } else {
        stryCov_9fa48("22846");
        if (stryMutAct_9fa48("22849") ? tasks.length > 0 && currentTaskIndex >= 0 || currentTaskIndex < tasks.length : stryMutAct_9fa48("22848") ? false : stryMutAct_9fa48("22847") ? true : (stryCov_9fa48("22847", "22848", "22849"), (stryMutAct_9fa48("22851") ? tasks.length > 0 || currentTaskIndex >= 0 : stryMutAct_9fa48("22850") ? true : (stryCov_9fa48("22850", "22851"), (stryMutAct_9fa48("22854") ? tasks.length <= 0 : stryMutAct_9fa48("22853") ? tasks.length >= 0 : stryMutAct_9fa48("22852") ? true : (stryCov_9fa48("22852", "22853", "22854"), tasks.length > 0)) && (stryMutAct_9fa48("22857") ? currentTaskIndex < 0 : stryMutAct_9fa48("22856") ? currentTaskIndex > 0 : stryMutAct_9fa48("22855") ? true : (stryCov_9fa48("22855", "22856", "22857"), currentTaskIndex >= 0)))) && (stryMutAct_9fa48("22860") ? currentTaskIndex >= tasks.length : stryMutAct_9fa48("22859") ? currentTaskIndex <= tasks.length : stryMutAct_9fa48("22858") ? true : (stryCov_9fa48("22858", "22859", "22860"), currentTaskIndex < tasks.length)))) {
          if (stryMutAct_9fa48("22861")) {
            {}
          } else {
            stryCov_9fa48("22861");
            const currentTask = tasks[currentTaskIndex];
            if (stryMutAct_9fa48("22863") ? false : stryMutAct_9fa48("22862") ? true : (stryCov_9fa48("22862", "22863"), currentTask)) {
              if (stryMutAct_9fa48("22864")) {
                {}
              } else {
                stryCov_9fa48("22864");
                console.log(stryMutAct_9fa48("22865") ? `` : (stryCov_9fa48("22865"), `Current task changed to task ${currentTask.id}, checking for analyses`));
                fetchAvailableAnalyses(currentTask.id);
              }
            }
          }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }
    }, stryMutAct_9fa48("22866") ? [] : (stryCov_9fa48("22866"), [currentTaskIndex, tasks]));

    // Update this function to organize analysis results by analysis type instead of submission ID
    const organizeAnalysisBySubmission = analysis => {
      if (stryMutAct_9fa48("22867")) {
        {}
      } else {
        stryCov_9fa48("22867");
        if (stryMutAct_9fa48("22870") ? false : stryMutAct_9fa48("22869") ? true : stryMutAct_9fa48("22868") ? analysis : (stryCov_9fa48("22868", "22869", "22870"), !analysis)) return {};
        const result = {};

        // For conversation analysis, create a single conversation entry
        if (stryMutAct_9fa48("22873") ? analysisType !== 'conversation' : stryMutAct_9fa48("22872") ? false : stryMutAct_9fa48("22871") ? true : (stryCov_9fa48("22871", "22872", "22873"), analysisType === (stryMutAct_9fa48("22874") ? "" : (stryCov_9fa48("22874"), 'conversation')))) {
          if (stryMutAct_9fa48("22875")) {
            {}
          } else {
            stryCov_9fa48("22875");
            result[stryMutAct_9fa48("22876") ? "" : (stryCov_9fa48("22876"), 'conversation')] = stryMutAct_9fa48("22877") ? {} : (stryCov_9fa48("22877"), {
              criteria_met: stryMutAct_9fa48("22880") ? analysis.analysis_result?.criteria_met && [] : stryMutAct_9fa48("22879") ? false : stryMutAct_9fa48("22878") ? true : (stryCov_9fa48("22878", "22879", "22880"), (stryMutAct_9fa48("22881") ? analysis.analysis_result.criteria_met : (stryCov_9fa48("22881"), analysis.analysis_result?.criteria_met)) || (stryMutAct_9fa48("22882") ? ["Stryker was here"] : (stryCov_9fa48("22882"), []))),
              areas_for_improvement: stryMutAct_9fa48("22885") ? analysis.analysis_result?.areas_for_improvement && [] : stryMutAct_9fa48("22884") ? false : stryMutAct_9fa48("22883") ? true : (stryCov_9fa48("22883", "22884", "22885"), (stryMutAct_9fa48("22886") ? analysis.analysis_result.areas_for_improvement : (stryCov_9fa48("22886"), analysis.analysis_result?.areas_for_improvement)) || (stryMutAct_9fa48("22887") ? ["Stryker was here"] : (stryCov_9fa48("22887"), []))),
              feedback: stryMutAct_9fa48("22890") ? analysis.feedback && "No detailed feedback available" : stryMutAct_9fa48("22889") ? false : stryMutAct_9fa48("22888") ? true : (stryCov_9fa48("22888", "22889", "22890"), analysis.feedback || (stryMutAct_9fa48("22891") ? "" : (stryCov_9fa48("22891"), "No detailed feedback available")))
            });
          }
        } // For deliverable analysis, create a single deliverable entry
        else if (stryMutAct_9fa48("22894") ? analysisType !== 'deliverable' : stryMutAct_9fa48("22893") ? false : stryMutAct_9fa48("22892") ? true : (stryCov_9fa48("22892", "22893", "22894"), analysisType === (stryMutAct_9fa48("22895") ? "" : (stryCov_9fa48("22895"), 'deliverable')))) {
          if (stryMutAct_9fa48("22896")) {
            {}
          } else {
            stryCov_9fa48("22896");
            result[stryMutAct_9fa48("22897") ? "" : (stryCov_9fa48("22897"), 'deliverable')] = stryMutAct_9fa48("22898") ? {} : (stryCov_9fa48("22898"), {
              criteria_met: stryMutAct_9fa48("22901") ? analysis.analysis_result?.criteria_met && [] : stryMutAct_9fa48("22900") ? false : stryMutAct_9fa48("22899") ? true : (stryCov_9fa48("22899", "22900", "22901"), (stryMutAct_9fa48("22902") ? analysis.analysis_result.criteria_met : (stryCov_9fa48("22902"), analysis.analysis_result?.criteria_met)) || (stryMutAct_9fa48("22903") ? ["Stryker was here"] : (stryCov_9fa48("22903"), []))),
              areas_for_improvement: stryMutAct_9fa48("22906") ? analysis.analysis_result?.areas_for_improvement && [] : stryMutAct_9fa48("22905") ? false : stryMutAct_9fa48("22904") ? true : (stryCov_9fa48("22904", "22905", "22906"), (stryMutAct_9fa48("22907") ? analysis.analysis_result.areas_for_improvement : (stryCov_9fa48("22907"), analysis.analysis_result?.areas_for_improvement)) || (stryMutAct_9fa48("22908") ? ["Stryker was here"] : (stryCov_9fa48("22908"), []))),
              feedback: stryMutAct_9fa48("22911") ? analysis.feedback && "No detailed feedback available" : stryMutAct_9fa48("22910") ? false : stryMutAct_9fa48("22909") ? true : (stryCov_9fa48("22909", "22910", "22911"), analysis.feedback || (stryMutAct_9fa48("22912") ? "" : (stryCov_9fa48("22912"), "No detailed feedback available")))
            });
          }
        }
        return result;
      }
    };

    // Add a function to fetch the most recent submission
    const fetchTaskSubmission = async taskId => {
      if (stryMutAct_9fa48("22913")) {
        {}
      } else {
        stryCov_9fa48("22913");
        if (stryMutAct_9fa48("22916") ? false : stryMutAct_9fa48("22915") ? true : stryMutAct_9fa48("22914") ? taskId : (stryCov_9fa48("22914", "22915", "22916"), !taskId)) return null;
        try {
          if (stryMutAct_9fa48("22917")) {
            {}
          } else {
            stryCov_9fa48("22917");
            const response = await fetch(stryMutAct_9fa48("22918") ? `` : (stryCov_9fa48("22918"), `${import.meta.env.VITE_API_URL}/api/submissions/${taskId}`), stryMutAct_9fa48("22919") ? {} : (stryCov_9fa48("22919"), {
              headers: stryMutAct_9fa48("22920") ? {} : (stryCov_9fa48("22920"), {
                'Authorization': stryMutAct_9fa48("22921") ? `` : (stryCov_9fa48("22921"), `Bearer ${token}`)
              })
            }));
            if (stryMutAct_9fa48("22923") ? false : stryMutAct_9fa48("22922") ? true : (stryCov_9fa48("22922", "22923"), response.ok)) {
              if (stryMutAct_9fa48("22924")) {
                {}
              } else {
                stryCov_9fa48("22924");
                const data = await response.json();
                console.log(stryMutAct_9fa48("22925") ? "" : (stryCov_9fa48("22925"), 'Fetched submission:'), data);
                setSubmission(data);
                return data;
              }
            } else if (stryMutAct_9fa48("22928") ? response.status === 404 : stryMutAct_9fa48("22927") ? false : stryMutAct_9fa48("22926") ? true : (stryCov_9fa48("22926", "22927", "22928"), response.status !== 404)) {
              if (stryMutAct_9fa48("22929")) {
                {}
              } else {
                stryCov_9fa48("22929");
                // 404 is expected if no submission exists yet
                console.log(stryMutAct_9fa48("22930") ? `` : (stryCov_9fa48("22930"), `No submission found for task ${taskId}`));
              }
            }
            setSubmission(null);
            return null;
          }
        } catch (error) {
          if (stryMutAct_9fa48("22931")) {
            {}
          } else {
            stryCov_9fa48("22931");
            console.error(stryMutAct_9fa48("22932") ? `` : (stryCov_9fa48("22932"), `Error fetching submission for task ${taskId}:`), error);
            setSubmission(null);
            return null;
          }
        }
      }
    };

    // Update this function to also fetch the submission when showing the modal
    const handleViewAnalysis = async () => {
      if (stryMutAct_9fa48("22933")) {
        {}
      } else {
        stryCov_9fa48("22933");
        if (stryMutAct_9fa48("22936") ? !tasks.length && currentTaskIndex >= tasks.length : stryMutAct_9fa48("22935") ? false : stryMutAct_9fa48("22934") ? true : (stryCov_9fa48("22934", "22935", "22936"), (stryMutAct_9fa48("22937") ? tasks.length : (stryCov_9fa48("22937"), !tasks.length)) || (stryMutAct_9fa48("22940") ? currentTaskIndex < tasks.length : stryMutAct_9fa48("22939") ? currentTaskIndex > tasks.length : stryMutAct_9fa48("22938") ? false : (stryCov_9fa48("22938", "22939", "22940"), currentTaskIndex >= tasks.length)))) return;
        const currentTask = tasks[currentTaskIndex];

        // Reset analysis results to avoid showing stale data
        setAnalysisResults(null);
        try {
          if (stryMutAct_9fa48("22941")) {
            {}
          } else {
            stryCov_9fa48("22941");
            console.log(stryMutAct_9fa48("22942") ? `` : (stryCov_9fa48("22942"), `Fetching analysis for task ${currentTask.id}`));

            // First, fetch all available analyses for this task
            const analyses = await fetchAvailableAnalyses(currentTask.id);
            console.log(stryMutAct_9fa48("22943") ? "" : (stryCov_9fa48("22943"), 'Available analyses:'), analyses);

            // Check if there are any available analyses
            if (stryMutAct_9fa48("22946") ? !analyses && Object.keys(analyses).length === 0 : stryMutAct_9fa48("22945") ? false : stryMutAct_9fa48("22944") ? true : (stryCov_9fa48("22944", "22945", "22946"), (stryMutAct_9fa48("22947") ? analyses : (stryCov_9fa48("22947"), !analyses)) || (stryMutAct_9fa48("22949") ? Object.keys(analyses).length !== 0 : stryMutAct_9fa48("22948") ? false : (stryCov_9fa48("22948", "22949"), Object.keys(analyses).length === 0)))) {
              if (stryMutAct_9fa48("22950")) {
                {}
              } else {
                stryCov_9fa48("22950");
                setError(stryMutAct_9fa48("22951") ? "" : (stryCov_9fa48("22951"), 'No feedback available for this task yet.'));
                return;
              }
            }

            // Determine which analysis type to show
            let analysisTypeToShow = null;

            // If the task supports deliverable analysis, prioritize that
            if (stryMutAct_9fa48("22954") ? currentTask.analyze_deliverable || analyses.deliverable : stryMutAct_9fa48("22953") ? false : stryMutAct_9fa48("22952") ? true : (stryCov_9fa48("22952", "22953", "22954"), currentTask.analyze_deliverable && analyses.deliverable)) {
              if (stryMutAct_9fa48("22955")) {
                {}
              } else {
                stryCov_9fa48("22955");
                analysisTypeToShow = stryMutAct_9fa48("22956") ? "" : (stryCov_9fa48("22956"), 'deliverable');
              }
            } // Otherwise if the task supports conversation analysis, use that
            else if (stryMutAct_9fa48("22959") ? currentTask.should_analyze || analyses.conversation : stryMutAct_9fa48("22958") ? false : stryMutAct_9fa48("22957") ? true : (stryCov_9fa48("22957", "22958", "22959"), currentTask.should_analyze && analyses.conversation)) {
              if (stryMutAct_9fa48("22960")) {
                {}
              } else {
                stryCov_9fa48("22960");
                analysisTypeToShow = stryMutAct_9fa48("22961") ? "" : (stryCov_9fa48("22961"), 'conversation');
              }
            } // If neither is explicitly set, use the first available type
            else if (stryMutAct_9fa48("22965") ? Object.keys(analyses).length <= 0 : stryMutAct_9fa48("22964") ? Object.keys(analyses).length >= 0 : stryMutAct_9fa48("22963") ? false : stryMutAct_9fa48("22962") ? true : (stryCov_9fa48("22962", "22963", "22964", "22965"), Object.keys(analyses).length > 0)) {
              if (stryMutAct_9fa48("22966")) {
                {}
              } else {
                stryCov_9fa48("22966");
                analysisTypeToShow = Object.keys(analyses)[0];
              }
            }
            if (stryMutAct_9fa48("22969") ? false : stryMutAct_9fa48("22968") ? true : stryMutAct_9fa48("22967") ? analysisTypeToShow : (stryCov_9fa48("22967", "22968", "22969"), !analysisTypeToShow)) {
              if (stryMutAct_9fa48("22970")) {
                {}
              } else {
                stryCov_9fa48("22970");
                setError(stryMutAct_9fa48("22971") ? "" : (stryCov_9fa48("22971"), 'No analysis available for this task.'));
                return;
              }
            }

            // Fetch the task submission (for context only)
            await fetchTaskSubmission(currentTask.id);

            // Fetch the specific analysis
            const success = await fetchTaskAnalysis(currentTask.id, analysisTypeToShow);
            if (stryMutAct_9fa48("22973") ? false : stryMutAct_9fa48("22972") ? true : (stryCov_9fa48("22972", "22973"), success)) {
              if (stryMutAct_9fa48("22974")) {
                {}
              } else {
                stryCov_9fa48("22974");
                // Show the modal with the fresh results
                setShowAnalysisModal(stryMutAct_9fa48("22975") ? false : (stryCov_9fa48("22975"), true));
              }
            } else {
              if (stryMutAct_9fa48("22976")) {
                {}
              } else {
                stryCov_9fa48("22976");
                setError(stryMutAct_9fa48("22977") ? "" : (stryCov_9fa48("22977"), 'Failed to load feedback. Please try again.'));
              }
            }
          }
        } catch (error) {
          if (stryMutAct_9fa48("22978")) {
            {}
          } else {
            stryCov_9fa48("22978");
            console.error(stryMutAct_9fa48("22979") ? "" : (stryCov_9fa48("22979"), 'Error in handleViewAnalysis:'), error);
            setError((stryMutAct_9fa48("22980") ? "" : (stryCov_9fa48("22980"), 'Failed to load feedback: ')) + error.message);
          }
        }
      }
    };

    // Get a list of available analysis types
    const getAvailableAnalysisTypes = () => {
      if (stryMutAct_9fa48("22981")) {
        {}
      } else {
        stryCov_9fa48("22981");
        if (stryMutAct_9fa48("22984") ? false : stryMutAct_9fa48("22983") ? true : stryMutAct_9fa48("22982") ? availableAnalyses : (stryCov_9fa48("22982", "22983", "22984"), !availableAnalyses)) return stryMutAct_9fa48("22985") ? ["Stryker was here"] : (stryCov_9fa48("22985"), []);
        return Object.keys(availableAnalyses);
      }
    };

    // Add a historical notification banner at the top of the component render
    const renderHistoricalBanner = () => {
      if (stryMutAct_9fa48("22986")) {
        {}
      } else {
        stryCov_9fa48("22986");
        if (stryMutAct_9fa48("22989") ? false : stryMutAct_9fa48("22988") ? true : stryMutAct_9fa48("22987") ? isActive : (stryCov_9fa48("22987", "22988", "22989"), !isActive)) {
          if (stryMutAct_9fa48("22990")) {
            {}
          } else {
            stryCov_9fa48("22990");
            return <div className="learning__historical-banner">
          <p>You have historical access only. You can view your past content but cannot submit new work or generate new feedback.</p>
        </div>;
          }
        }
        return null;
      }
    };

    // Only show the full page loading state if we don't have tasks yet
    if (stryMutAct_9fa48("22993") ? isPageLoading || tasks.length === 0 : stryMutAct_9fa48("22992") ? false : stryMutAct_9fa48("22991") ? true : (stryCov_9fa48("22991", "22992", "22993"), isPageLoading && (stryMutAct_9fa48("22995") ? tasks.length !== 0 : stryMutAct_9fa48("22994") ? true : (stryCov_9fa48("22994", "22995"), tasks.length === 0)))) {
      if (stryMutAct_9fa48("22996")) {
        {}
      } else {
        stryCov_9fa48("22996");
        return <div className="learning loading">Loading learning session...</div>;
      }
    }

    // Add a check for empty tasks
    if (stryMutAct_9fa48("22999") ? tasks.length !== 0 : stryMutAct_9fa48("22998") ? false : stryMutAct_9fa48("22997") ? true : (stryCov_9fa48("22997", "22998", "22999"), tasks.length === 0)) {
      if (stryMutAct_9fa48("23000")) {
        {}
      } else {
        stryCov_9fa48("23000");
        return <div className="learning">
        <div className="learning__empty-state">
          <h2>No Tasks Available</h2>
          <p>There are no tasks scheduled for today.</p>
          <p>Check back tomorrow for your next scheduled activities.</p>
          <button className="learning__back-btn" onClick={stryMutAct_9fa48("23001") ? () => undefined : (stryCov_9fa48("23001"), () => navigate(stryMutAct_9fa48("23002") ? "" : (stryCov_9fa48("23002"), '/dashboard')))}>
            Back to Dashboard
          </button>
        </div>
      </div>;
      }
    }
    return <div className="learning">
      {renderHistoricalBanner()}
      <div className="learning__content">
        <div className="learning__task-panel">
          <div className={stryMutAct_9fa48("23003") ? `` : (stryCov_9fa48("23003"), `learning__task-header ${dayId ? stryMutAct_9fa48("23004") ? "" : (stryCov_9fa48("23004"), 'learning__task-header--with-back') : stryMutAct_9fa48("23005") ? "Stryker was here!" : (stryCov_9fa48("23005"), '')}`)}>
            <h2>{dayId ? stryMutAct_9fa48("23006") ? `` : (stryCov_9fa48("23006"), `Day ${stryMutAct_9fa48("23009") ? currentDay?.day_number && '' : stryMutAct_9fa48("23008") ? false : stryMutAct_9fa48("23007") ? true : (stryCov_9fa48("23007", "23008", "23009"), (stryMutAct_9fa48("23010") ? currentDay.day_number : (stryCov_9fa48("23010"), currentDay?.day_number)) || (stryMutAct_9fa48("23011") ? "Stryker was here!" : (stryCov_9fa48("23011"), '')))} Tasks`) : stryMutAct_9fa48("23012") ? "" : (stryCov_9fa48("23012"), "Today's Tasks")}</h2>
            {stryMutAct_9fa48("23015") ? dayId || <button className="back-to-calendar-btn" onClick={() => navigate('/calendar')}>
                <FaArrowLeft /> Back to Calendar
              </button> : stryMutAct_9fa48("23014") ? false : stryMutAct_9fa48("23013") ? true : (stryCov_9fa48("23013", "23014", "23015"), dayId && <button className="back-to-calendar-btn" onClick={stryMutAct_9fa48("23016") ? () => undefined : (stryCov_9fa48("23016"), () => navigate(stryMutAct_9fa48("23017") ? "" : (stryCov_9fa48("23017"), '/calendar')))}>
                <FaArrowLeft /> Back to Calendar
              </button>)}
          </div>
          {(stryMutAct_9fa48("23021") ? tasks.length <= 0 : stryMutAct_9fa48("23020") ? tasks.length >= 0 : stryMutAct_9fa48("23019") ? false : stryMutAct_9fa48("23018") ? true : (stryCov_9fa48("23018", "23019", "23020", "23021"), tasks.length > 0)) ? <div className="learning__tasks-list">
              {tasks.map(stryMutAct_9fa48("23022") ? () => undefined : (stryCov_9fa48("23022"), (task, index) => <div key={task.id} className={stryMutAct_9fa48("23023") ? `` : (stryCov_9fa48("23023"), `learning__task-item ${(stryMutAct_9fa48("23026") ? index !== currentTaskIndex : stryMutAct_9fa48("23025") ? false : stryMutAct_9fa48("23024") ? true : (stryCov_9fa48("23024", "23025", "23026"), index === currentTaskIndex)) ? stryMutAct_9fa48("23027") ? "" : (stryCov_9fa48("23027"), 'current') : stryMutAct_9fa48("23028") ? "Stryker was here!" : (stryCov_9fa48("23028"), '')} ${task.completed ? stryMutAct_9fa48("23029") ? "" : (stryCov_9fa48("23029"), 'completed') : stryMutAct_9fa48("23030") ? "Stryker was here!" : (stryCov_9fa48("23030"), '')}`)} data-mode={task.task_mode} data-feedback-slot={task.feedback_slot} onClick={() => {
              if (stryMutAct_9fa48("23031")) {
                {}
              } else {
                stryCov_9fa48("23031");
                if (stryMutAct_9fa48("23034") ? index === currentTaskIndex : stryMutAct_9fa48("23033") ? false : stryMutAct_9fa48("23032") ? true : (stryCov_9fa48("23032", "23033", "23034"), index !== currentTaskIndex)) {
                  if (stryMutAct_9fa48("23035")) {
                    {}
                  } else {
                    stryCov_9fa48("23035");
                    // Update the current task index
                    setCurrentTaskIndex(index);

                    // Only fetch messages for non-feedback tasks
                    if (stryMutAct_9fa48("23038") ? false : stryMutAct_9fa48("23037") ? true : stryMutAct_9fa48("23036") ? task.feedback_slot : (stryCov_9fa48("23036", "23037", "23038"), !task.feedback_slot)) {
                      if (stryMutAct_9fa48("23039")) {
                        {}
                      } else {
                        stryCov_9fa48("23039");
                        // IMPORTANT: Immediately clear previous messages and show loading state
                        setMessages(stryMutAct_9fa48("23040") ? [] : (stryCov_9fa48("23040"), [stryMutAct_9fa48("23041") ? {} : (stryCov_9fa48("23041"), {
                          id: stryMutAct_9fa48("23042") ? "" : (stryCov_9fa48("23042"), 'loading'),
                          content: stryMutAct_9fa48("23043") ? `` : (stryCov_9fa48("23043"), `Loading ${task.title}...`),
                          role: stryMutAct_9fa48("23044") ? "" : (stryCov_9fa48("23044"), 'system')
                        })]));
                        setIsMessagesLoading(stryMutAct_9fa48("23045") ? false : (stryCov_9fa48("23045"), true));
                        console.log(stryMutAct_9fa48("23046") ? "" : (stryCov_9fa48("23046"), 'Task should_analyze:'), task.should_analyze);
                        fetchTaskMessages(task.id);
                      }
                    } else {
                      if (stryMutAct_9fa48("23047")) {
                        {}
                      } else {
                        stryCov_9fa48("23047");
                        // Clear messages for feedback tasks
                        setMessages(stryMutAct_9fa48("23048") ? ["Stryker was here"] : (stryCov_9fa48("23048"), []));
                        setIsMessagesLoading(stryMutAct_9fa48("23049") ? true : (stryCov_9fa48("23049"), false));
                      }
                    }
                  }
                }
              }
            }}>
                  <div className="learning__task-icon">
                    {getTaskIcon(task.type, task.completed, task.task_mode, task.feedback_slot)}
                  </div>
                  <div className="learning__task-content">
                    <h3 className="learning__task-title">
                      <span className="learning__task-title-text">{task.title}</span>

                      {stryMutAct_9fa48("23052") ? task.deliverable_type === 'link' || task.deliverable_type === 'file' || task.deliverable_type === 'document' || task.deliverable_type === 'video' || <span className="learning__task-deliverable-indicator">
                          <FaLink />
                        </span> : stryMutAct_9fa48("23051") ? false : stryMutAct_9fa48("23050") ? true : (stryCov_9fa48("23050", "23051", "23052"), (stryMutAct_9fa48("23054") ? (task.deliverable_type === 'link' || task.deliverable_type === 'file' || task.deliverable_type === 'document') && task.deliverable_type === 'video' : stryMutAct_9fa48("23053") ? true : (stryCov_9fa48("23053", "23054"), (stryMutAct_9fa48("23056") ? (task.deliverable_type === 'link' || task.deliverable_type === 'file') && task.deliverable_type === 'document' : stryMutAct_9fa48("23055") ? false : (stryCov_9fa48("23055", "23056"), (stryMutAct_9fa48("23058") ? task.deliverable_type === 'link' && task.deliverable_type === 'file' : stryMutAct_9fa48("23057") ? false : (stryCov_9fa48("23057", "23058"), (stryMutAct_9fa48("23060") ? task.deliverable_type !== 'link' : stryMutAct_9fa48("23059") ? false : (stryCov_9fa48("23059", "23060"), task.deliverable_type === (stryMutAct_9fa48("23061") ? "" : (stryCov_9fa48("23061"), 'link')))) || (stryMutAct_9fa48("23063") ? task.deliverable_type !== 'file' : stryMutAct_9fa48("23062") ? false : (stryCov_9fa48("23062", "23063"), task.deliverable_type === (stryMutAct_9fa48("23064") ? "" : (stryCov_9fa48("23064"), 'file')))))) || (stryMutAct_9fa48("23066") ? task.deliverable_type !== 'document' : stryMutAct_9fa48("23065") ? false : (stryCov_9fa48("23065", "23066"), task.deliverable_type === (stryMutAct_9fa48("23067") ? "" : (stryCov_9fa48("23067"), 'document')))))) || (stryMutAct_9fa48("23069") ? task.deliverable_type !== 'video' : stryMutAct_9fa48("23068") ? false : (stryCov_9fa48("23068", "23069"), task.deliverable_type === (stryMutAct_9fa48("23070") ? "" : (stryCov_9fa48("23070"), 'video')))))) && <span className="learning__task-deliverable-indicator">
                          <FaLink />
                        </span>)}
                    </h3>
                    <div className="learning__task-block">
                      {task.blockTime}

                    </div>
                  </div>
                </div>))}
            </div> : <div className="learning__no-tasks">
              <p>No tasks available for this day.</p>
            </div>}
        </div>
        
        <div className={stryMutAct_9fa48("23071") ? `` : (stryCov_9fa48("23071"), `learning__chat-container ${(stryMutAct_9fa48("23075") ? currentTaskIndex >= tasks.length : stryMutAct_9fa48("23074") ? currentTaskIndex <= tasks.length : stryMutAct_9fa48("23073") ? false : stryMutAct_9fa48("23072") ? true : (stryCov_9fa48("23072", "23073", "23074", "23075"), currentTaskIndex < tasks.length)) ? stryMutAct_9fa48("23076") ? `` : (stryCov_9fa48("23076"), `learning__chat-container--${tasks[currentTaskIndex].task_mode}`) : stryMutAct_9fa48("23077") ? "Stryker was here!" : (stryCov_9fa48("23077"), '')}`)}>
          {showPeerFeedback ?
          // Show the peer feedback form when needed
          <PeerFeedbackForm dayNumber={stryMutAct_9fa48("23078") ? currentDay.day_number : (stryCov_9fa48("23078"), currentDay?.day_number)} onComplete={handlePeerFeedbackComplete} onCancel={handlePeerFeedbackCancel} /> : isCurrentTaskFeedbackSlot() ?
          // Show the builder feedback form for feedback slot tasks
          <BuilderFeedbackForm taskId={tasks[currentTaskIndex].id} dayNumber={stryMutAct_9fa48("23079") ? currentDay.day_number : (stryCov_9fa48("23079"), currentDay?.day_number)} cohort={cohort} onComplete={handleBuilderFeedbackComplete} /> : <div className="learning__chat-panel">
              {/* Display resources at the top of the chat panel */}
              {stryMutAct_9fa48("23082") ? currentTaskIndex < tasks.length && tasks[currentTaskIndex].resources && tasks[currentTaskIndex].resources.length > 0 || <div className="learning__task-resources-container">
                  {renderTaskResources(tasks[currentTaskIndex].resources)}
                </div> : stryMutAct_9fa48("23081") ? false : stryMutAct_9fa48("23080") ? true : (stryCov_9fa48("23080", "23081", "23082"), (stryMutAct_9fa48("23084") ? currentTaskIndex < tasks.length && tasks[currentTaskIndex].resources || tasks[currentTaskIndex].resources.length > 0 : stryMutAct_9fa48("23083") ? true : (stryCov_9fa48("23083", "23084"), (stryMutAct_9fa48("23086") ? currentTaskIndex < tasks.length || tasks[currentTaskIndex].resources : stryMutAct_9fa48("23085") ? true : (stryCov_9fa48("23085", "23086"), (stryMutAct_9fa48("23089") ? currentTaskIndex >= tasks.length : stryMutAct_9fa48("23088") ? currentTaskIndex <= tasks.length : stryMutAct_9fa48("23087") ? true : (stryCov_9fa48("23087", "23088", "23089"), currentTaskIndex < tasks.length)) && tasks[currentTaskIndex].resources)) && (stryMutAct_9fa48("23092") ? tasks[currentTaskIndex].resources.length <= 0 : stryMutAct_9fa48("23091") ? tasks[currentTaskIndex].resources.length >= 0 : stryMutAct_9fa48("23090") ? true : (stryCov_9fa48("23090", "23091", "23092"), tasks[currentTaskIndex].resources.length > 0)))) && <div className="learning__task-resources-container">
                  {renderTaskResources(tasks[currentTaskIndex].resources)}
                </div>)}
              

              
              <div className={stryMutAct_9fa48("23093") ? `` : (stryCov_9fa48("23093"), `learning__messages ${(stryMutAct_9fa48("23096") ? isMessagesLoading || messages.length === 0 : stryMutAct_9fa48("23095") ? false : stryMutAct_9fa48("23094") ? true : (stryCov_9fa48("23094", "23095", "23096"), isMessagesLoading && (stryMutAct_9fa48("23098") ? messages.length !== 0 : stryMutAct_9fa48("23097") ? true : (stryCov_9fa48("23097", "23098"), messages.length === 0)))) ? stryMutAct_9fa48("23099") ? "" : (stryCov_9fa48("23099"), 'loading') : stryMutAct_9fa48("23100") ? "Stryker was here!" : (stryCov_9fa48("23100"), '')} ${(stryMutAct_9fa48("23103") ? editingMessageId === null : stryMutAct_9fa48("23102") ? false : stryMutAct_9fa48("23101") ? true : (stryCov_9fa48("23101", "23102", "23103"), editingMessageId !== null)) ? stryMutAct_9fa48("23104") ? "" : (stryCov_9fa48("23104"), 'has-editing-message') : stryMutAct_9fa48("23105") ? "Stryker was here!" : (stryCov_9fa48("23105"), '')}`)}>
                {(stryMutAct_9fa48("23108") ? isMessagesLoading || messages.length === 0 : stryMutAct_9fa48("23107") ? false : stryMutAct_9fa48("23106") ? true : (stryCov_9fa48("23106", "23107", "23108"), isMessagesLoading && (stryMutAct_9fa48("23110") ? messages.length !== 0 : stryMutAct_9fa48("23109") ? true : (stryCov_9fa48("23109", "23110"), messages.length === 0)))) ? <div className="learning__loading-messages">
                    <p>Loading messages...</p>
                  </div> : (stryMutAct_9fa48("23114") ? messages.length <= 0 : stryMutAct_9fa48("23113") ? messages.length >= 0 : stryMutAct_9fa48("23112") ? false : stryMutAct_9fa48("23111") ? true : (stryCov_9fa48("23111", "23112", "23113", "23114"), messages.length > 0)) ? messages.map(stryMutAct_9fa48("23115") ? () => undefined : (stryCov_9fa48("23115"), message => <div key={message.id} className={stryMutAct_9fa48("23116") ? `` : (stryCov_9fa48("23116"), `learning__message learning__message--${message.role} ${(stryMutAct_9fa48("23119") ? String(editingMessageId) !== String(message.id) : stryMutAct_9fa48("23118") ? false : stryMutAct_9fa48("23117") ? true : (stryCov_9fa48("23117", "23118", "23119"), String(editingMessageId) === String(message.id))) ? stryMutAct_9fa48("23120") ? "" : (stryCov_9fa48("23120"), 'editing') : stryMutAct_9fa48("23121") ? "Stryker was here!" : (stryCov_9fa48("23121"), '')}`)}>
                      <div className={stryMutAct_9fa48("23122") ? `` : (stryCov_9fa48("23122"), `learning__message-content ${(stryMutAct_9fa48("23125") ? isMessagesLoading || message === messages[messages.length - 1] : stryMutAct_9fa48("23124") ? false : stryMutAct_9fa48("23123") ? true : (stryCov_9fa48("23123", "23124", "23125"), isMessagesLoading && (stryMutAct_9fa48("23127") ? message !== messages[messages.length - 1] : stryMutAct_9fa48("23126") ? true : (stryCov_9fa48("23126", "23127"), message === messages[stryMutAct_9fa48("23128") ? messages.length + 1 : (stryCov_9fa48("23128"), messages.length - 1)])))) ? stryMutAct_9fa48("23129") ? "" : (stryCov_9fa48("23129"), 'learning__message-content--loading') : stryMutAct_9fa48("23130") ? "Stryker was here!" : (stryCov_9fa48("23130"), '')} ${(stryMutAct_9fa48("23133") ? message.role !== 'user' : stryMutAct_9fa48("23132") ? false : stryMutAct_9fa48("23131") ? true : (stryCov_9fa48("23131", "23132", "23133"), message.role === (stryMutAct_9fa48("23134") ? "" : (stryCov_9fa48("23134"), 'user')))) ? stryMutAct_9fa48("23135") ? "" : (stryCov_9fa48("23135"), 'learning__message-content--editable') : stryMutAct_9fa48("23136") ? "Stryker was here!" : (stryCov_9fa48("23136"), '')}`)} onClick={(stryMutAct_9fa48("23139") ? message.role === 'user' || editingMessageId === null : stryMutAct_9fa48("23138") ? false : stryMutAct_9fa48("23137") ? true : (stryCov_9fa48("23137", "23138", "23139"), (stryMutAct_9fa48("23141") ? message.role !== 'user' : stryMutAct_9fa48("23140") ? true : (stryCov_9fa48("23140", "23141"), message.role === (stryMutAct_9fa48("23142") ? "" : (stryCov_9fa48("23142"), 'user')))) && (stryMutAct_9fa48("23144") ? editingMessageId !== null : stryMutAct_9fa48("23143") ? true : (stryCov_9fa48("23143", "23144"), editingMessageId === null)))) ? stryMutAct_9fa48("23145") ? () => undefined : (stryCov_9fa48("23145"), () => handleEditMessage(message)) : undefined}>
                        {(stryMutAct_9fa48("23148") ? String(editingMessageId) !== String(message.id) : stryMutAct_9fa48("23147") ? false : stryMutAct_9fa48("23146") ? true : (stryCov_9fa48("23146", "23147", "23148"), String(editingMessageId) === String(message.id))) ? <div className="learning__message-edit">
                            <textarea ref={editTextareaRef} value={editMessageContent} onChange={handleEditTextareaChange} className="learning__edit-textarea" disabled={isUpdating} placeholder="Edit your message..." />
                            <div className="learning__edit-actions">
                              <button onClick={stryMutAct_9fa48("23149") ? () => undefined : (stryCov_9fa48("23149"), () => handleUpdateMessage(message.id))} className="learning__edit-save-btn" disabled={isUpdating}>
                                {isUpdating ? stryMutAct_9fa48("23150") ? "" : (stryCov_9fa48("23150"), 'Saving...') : <FaCheck />}
                              </button>
                              <button onClick={handleCancelEdit} className="learning__edit-cancel-btn" disabled={isUpdating}>
                                <FaTimes />
                              </button>
                            </div>
                          </div> : <>
                            {formatMessageContent(message.content)}
                            {stryMutAct_9fa48("23153") ? message.updated || <span className="learning__message-edited-indicator">(edited)</span> : stryMutAct_9fa48("23152") ? false : stryMutAct_9fa48("23151") ? true : (stryCov_9fa48("23151", "23152", "23153"), message.updated && <span className="learning__message-edited-indicator">(edited)</span>)}
                          </>}
                      </div>
                    </div>)) : <div className="learning__message-note">
                    <p>The AI Coach will start the conversation based on your task. Ask questions or share your thoughts to continue the discussion.</p>
                  </div>}
                
                {/* Show thinking indicator when AI is generating a response */}
                {stryMutAct_9fa48("23156") ? isAiThinking || <div className="learning__message learning__message--assistant">
                    <div className="learning__message-content learning__message-content--thinking">
                      <div className="learning__typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div> : stryMutAct_9fa48("23155") ? false : stryMutAct_9fa48("23154") ? true : (stryCov_9fa48("23154", "23155", "23156"), isAiThinking && <div className="learning__message learning__message--assistant">
                    <div className="learning__message-content learning__message-content--thinking">
                      <div className="learning__typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>)}
                
                {/* Add a ref for auto-scrolling */}
                <div ref={messagesEndRef} />
              </div>
              
              {stryMutAct_9fa48("23159") ? tasks.length > 0 && currentTaskIndex < tasks.length || <div className="learning__task-navigation">
                  <button className="learning__task-nav-button" onClick={() => navigateToTask('prev')} disabled={currentTaskIndex === 0}>
                    <FaArrowLeft /> Prev Task
                  </button>
                  
                  {tasks[currentTaskIndex].should_analyze && isActive && <button className="learning__task-nav-button" onClick={handleAnalyzeTask} disabled={isAnalyzing}>
                      {isAnalyzing ? 'Generating Feedback...' : 'Generate AI Feedback'}
                    </button>}
                  
                  {Object.keys(availableAnalyses).length > 0 && <button className="learning__task-nav-button" onClick={handleViewAnalysis}>
                      View Feedback
                    </button>}
                  
                  {isIndependentRetroTask() && messages.length > 0 && !tasks[currentTaskIndex].completed ? peerFeedbackCompleted ? <div className="learning__feedback-status">
                        <FaCheck /> Peer feedback submitted successfully!
                      </div> : <button className="learning__feedback-btn" onClick={() => setShowPeerFeedback(true)}>
                        <FaUsers /> Provide Peer Feedback
                      </button> : !isIndependentRetroTask() && <button className="learning__task-nav-button" onClick={() => navigateToTask('next')} disabled={currentTaskIndex === tasks.length - 1}>
                      Next Task <FaArrowRight />
                    </button>}
                </div> : stryMutAct_9fa48("23158") ? false : stryMutAct_9fa48("23157") ? true : (stryCov_9fa48("23157", "23158", "23159"), (stryMutAct_9fa48("23161") ? tasks.length > 0 || currentTaskIndex < tasks.length : stryMutAct_9fa48("23160") ? true : (stryCov_9fa48("23160", "23161"), (stryMutAct_9fa48("23164") ? tasks.length <= 0 : stryMutAct_9fa48("23163") ? tasks.length >= 0 : stryMutAct_9fa48("23162") ? true : (stryCov_9fa48("23162", "23163", "23164"), tasks.length > 0)) && (stryMutAct_9fa48("23167") ? currentTaskIndex >= tasks.length : stryMutAct_9fa48("23166") ? currentTaskIndex <= tasks.length : stryMutAct_9fa48("23165") ? true : (stryCov_9fa48("23165", "23166", "23167"), currentTaskIndex < tasks.length)))) && <div className="learning__task-navigation">
                  <button className="learning__task-nav-button" onClick={stryMutAct_9fa48("23168") ? () => undefined : (stryCov_9fa48("23168"), () => navigateToTask(stryMutAct_9fa48("23169") ? "" : (stryCov_9fa48("23169"), 'prev')))} disabled={stryMutAct_9fa48("23172") ? currentTaskIndex !== 0 : stryMutAct_9fa48("23171") ? false : stryMutAct_9fa48("23170") ? true : (stryCov_9fa48("23170", "23171", "23172"), currentTaskIndex === 0)}>
                    <FaArrowLeft /> Prev Task
                  </button>
                  
                  {stryMutAct_9fa48("23175") ? tasks[currentTaskIndex].should_analyze && isActive || <button className="learning__task-nav-button" onClick={handleAnalyzeTask} disabled={isAnalyzing}>
                      {isAnalyzing ? 'Generating Feedback...' : 'Generate AI Feedback'}
                    </button> : stryMutAct_9fa48("23174") ? false : stryMutAct_9fa48("23173") ? true : (stryCov_9fa48("23173", "23174", "23175"), (stryMutAct_9fa48("23177") ? tasks[currentTaskIndex].should_analyze || isActive : stryMutAct_9fa48("23176") ? true : (stryCov_9fa48("23176", "23177"), tasks[currentTaskIndex].should_analyze && isActive)) && <button className="learning__task-nav-button" onClick={handleAnalyzeTask} disabled={isAnalyzing}>
                      {isAnalyzing ? stryMutAct_9fa48("23178") ? "" : (stryCov_9fa48("23178"), 'Generating Feedback...') : stryMutAct_9fa48("23179") ? "" : (stryCov_9fa48("23179"), 'Generate AI Feedback')}
                    </button>)}
                  
                  {stryMutAct_9fa48("23182") ? Object.keys(availableAnalyses).length > 0 || <button className="learning__task-nav-button" onClick={handleViewAnalysis}>
                      View Feedback
                    </button> : stryMutAct_9fa48("23181") ? false : stryMutAct_9fa48("23180") ? true : (stryCov_9fa48("23180", "23181", "23182"), (stryMutAct_9fa48("23185") ? Object.keys(availableAnalyses).length <= 0 : stryMutAct_9fa48("23184") ? Object.keys(availableAnalyses).length >= 0 : stryMutAct_9fa48("23183") ? true : (stryCov_9fa48("23183", "23184", "23185"), Object.keys(availableAnalyses).length > 0)) && <button className="learning__task-nav-button" onClick={handleViewAnalysis}>
                      View Feedback
                    </button>)}
                  
                  {(stryMutAct_9fa48("23188") ? isIndependentRetroTask() && messages.length > 0 || !tasks[currentTaskIndex].completed : stryMutAct_9fa48("23187") ? false : stryMutAct_9fa48("23186") ? true : (stryCov_9fa48("23186", "23187", "23188"), (stryMutAct_9fa48("23190") ? isIndependentRetroTask() || messages.length > 0 : stryMutAct_9fa48("23189") ? true : (stryCov_9fa48("23189", "23190"), isIndependentRetroTask() && (stryMutAct_9fa48("23193") ? messages.length <= 0 : stryMutAct_9fa48("23192") ? messages.length >= 0 : stryMutAct_9fa48("23191") ? true : (stryCov_9fa48("23191", "23192", "23193"), messages.length > 0)))) && (stryMutAct_9fa48("23194") ? tasks[currentTaskIndex].completed : (stryCov_9fa48("23194"), !tasks[currentTaskIndex].completed)))) ? peerFeedbackCompleted ? <div className="learning__feedback-status">
                        <FaCheck /> Peer feedback submitted successfully!
                      </div> : <button className="learning__feedback-btn" onClick={stryMutAct_9fa48("23195") ? () => undefined : (stryCov_9fa48("23195"), () => setShowPeerFeedback(stryMutAct_9fa48("23196") ? false : (stryCov_9fa48("23196"), true)))}>
                        <FaUsers /> Provide Peer Feedback
                      </button> : stryMutAct_9fa48("23199") ? !isIndependentRetroTask() || <button className="learning__task-nav-button" onClick={() => navigateToTask('next')} disabled={currentTaskIndex === tasks.length - 1}>
                      Next Task <FaArrowRight />
                    </button> : stryMutAct_9fa48("23198") ? false : stryMutAct_9fa48("23197") ? true : (stryCov_9fa48("23197", "23198", "23199"), (stryMutAct_9fa48("23200") ? isIndependentRetroTask() : (stryCov_9fa48("23200"), !isIndependentRetroTask())) && <button className="learning__task-nav-button" onClick={stryMutAct_9fa48("23201") ? () => undefined : (stryCov_9fa48("23201"), () => navigateToTask(stryMutAct_9fa48("23202") ? "" : (stryCov_9fa48("23202"), 'next')))} disabled={stryMutAct_9fa48("23205") ? currentTaskIndex !== tasks.length - 1 : stryMutAct_9fa48("23204") ? false : stryMutAct_9fa48("23203") ? true : (stryCov_9fa48("23203", "23204", "23205"), currentTaskIndex === (stryMutAct_9fa48("23206") ? tasks.length + 1 : (stryCov_9fa48("23206"), tasks.length - 1)))}>
                      Next Task <FaArrowRight />
                    </button>)}
                </div>)}
              
              <form className="learning__input-form" onSubmit={handleSendMessage}>
                <textarea ref={textareaRef} className="learning__input" value={newMessage} onChange={handleTextareaChange} placeholder={(stryMutAct_9fa48("23207") ? isActive : (stryCov_9fa48("23207"), !isActive)) ? stryMutAct_9fa48("23208") ? "" : (stryCov_9fa48("23208"), "Historical view only") : isSending ? stryMutAct_9fa48("23209") ? "" : (stryCov_9fa48("23209"), "Sending...") : stryMutAct_9fa48("23210") ? "" : (stryCov_9fa48("23210"), "Type your message...")} disabled={stryMutAct_9fa48("23213") ? (!isActive || isSending) && isAiThinking : stryMutAct_9fa48("23212") ? false : stryMutAct_9fa48("23211") ? true : (stryCov_9fa48("23211", "23212", "23213"), (stryMutAct_9fa48("23215") ? !isActive && isSending : stryMutAct_9fa48("23214") ? false : (stryCov_9fa48("23214", "23215"), (stryMutAct_9fa48("23216") ? isActive : (stryCov_9fa48("23216"), !isActive)) || isSending)) || isAiThinking)} onKeyDown={e => {
                if (stryMutAct_9fa48("23217")) {
                  {}
                } else {
                  stryCov_9fa48("23217");
                  if (stryMutAct_9fa48("23220") ? e.key === 'Enter' || !e.shiftKey : stryMutAct_9fa48("23219") ? false : stryMutAct_9fa48("23218") ? true : (stryCov_9fa48("23218", "23219", "23220"), (stryMutAct_9fa48("23222") ? e.key !== 'Enter' : stryMutAct_9fa48("23221") ? true : (stryCov_9fa48("23221", "23222"), e.key === (stryMutAct_9fa48("23223") ? "" : (stryCov_9fa48("23223"), 'Enter')))) && (stryMutAct_9fa48("23224") ? e.shiftKey : (stryCov_9fa48("23224"), !e.shiftKey)))) {
                    if (stryMutAct_9fa48("23225")) {
                      {}
                    } else {
                      stryCov_9fa48("23225");
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }
                }
              }} rows={1} />
                <div className="learning__input-actions">
                  {(() => {
                  if (stryMutAct_9fa48("23226")) {
                    {}
                  } else {
                    stryCov_9fa48("23226");
                    return stryMutAct_9fa48("23229") ? currentTaskIndex < tasks.length && (tasks[currentTaskIndex].deliverable_type === 'link' || tasks[currentTaskIndex].deliverable_type === 'file' || tasks[currentTaskIndex].deliverable_type === 'document' || tasks[currentTaskIndex].deliverable_type === 'video') || <button type="button" className="learning__deliverable-btn" onClick={() => setShowSubmissionModal(true)} title={`Submit ${tasks[currentTaskIndex].deliverable}`}>
                        <FaLink />
                      </button> : stryMutAct_9fa48("23228") ? false : stryMutAct_9fa48("23227") ? true : (stryCov_9fa48("23227", "23228", "23229"), (stryMutAct_9fa48("23231") ? currentTaskIndex < tasks.length || tasks[currentTaskIndex].deliverable_type === 'link' || tasks[currentTaskIndex].deliverable_type === 'file' || tasks[currentTaskIndex].deliverable_type === 'document' || tasks[currentTaskIndex].deliverable_type === 'video' : stryMutAct_9fa48("23230") ? true : (stryCov_9fa48("23230", "23231"), (stryMutAct_9fa48("23234") ? currentTaskIndex >= tasks.length : stryMutAct_9fa48("23233") ? currentTaskIndex <= tasks.length : stryMutAct_9fa48("23232") ? true : (stryCov_9fa48("23232", "23233", "23234"), currentTaskIndex < tasks.length)) && (stryMutAct_9fa48("23236") ? (tasks[currentTaskIndex].deliverable_type === 'link' || tasks[currentTaskIndex].deliverable_type === 'file' || tasks[currentTaskIndex].deliverable_type === 'document') && tasks[currentTaskIndex].deliverable_type === 'video' : stryMutAct_9fa48("23235") ? true : (stryCov_9fa48("23235", "23236"), (stryMutAct_9fa48("23238") ? (tasks[currentTaskIndex].deliverable_type === 'link' || tasks[currentTaskIndex].deliverable_type === 'file') && tasks[currentTaskIndex].deliverable_type === 'document' : stryMutAct_9fa48("23237") ? false : (stryCov_9fa48("23237", "23238"), (stryMutAct_9fa48("23240") ? tasks[currentTaskIndex].deliverable_type === 'link' && tasks[currentTaskIndex].deliverable_type === 'file' : stryMutAct_9fa48("23239") ? false : (stryCov_9fa48("23239", "23240"), (stryMutAct_9fa48("23242") ? tasks[currentTaskIndex].deliverable_type !== 'link' : stryMutAct_9fa48("23241") ? false : (stryCov_9fa48("23241", "23242"), tasks[currentTaskIndex].deliverable_type === (stryMutAct_9fa48("23243") ? "" : (stryCov_9fa48("23243"), 'link')))) || (stryMutAct_9fa48("23245") ? tasks[currentTaskIndex].deliverable_type !== 'file' : stryMutAct_9fa48("23244") ? false : (stryCov_9fa48("23244", "23245"), tasks[currentTaskIndex].deliverable_type === (stryMutAct_9fa48("23246") ? "" : (stryCov_9fa48("23246"), 'file')))))) || (stryMutAct_9fa48("23248") ? tasks[currentTaskIndex].deliverable_type !== 'document' : stryMutAct_9fa48("23247") ? false : (stryCov_9fa48("23247", "23248"), tasks[currentTaskIndex].deliverable_type === (stryMutAct_9fa48("23249") ? "" : (stryCov_9fa48("23249"), 'document')))))) || (stryMutAct_9fa48("23251") ? tasks[currentTaskIndex].deliverable_type !== 'video' : stryMutAct_9fa48("23250") ? false : (stryCov_9fa48("23250", "23251"), tasks[currentTaskIndex].deliverable_type === (stryMutAct_9fa48("23252") ? "" : (stryCov_9fa48("23252"), 'video')))))))) && <button type="button" className="learning__deliverable-btn" onClick={stryMutAct_9fa48("23253") ? () => undefined : (stryCov_9fa48("23253"), () => setShowSubmissionModal(stryMutAct_9fa48("23254") ? false : (stryCov_9fa48("23254"), true)))} title={stryMutAct_9fa48("23255") ? `` : (stryCov_9fa48("23255"), `Submit ${tasks[currentTaskIndex].deliverable}`)}>
                        <FaLink />
                      </button>);
                  }
                })()}
                </div>
                <button className="learning__send-btn" type="submit" disabled={stryMutAct_9fa48("23258") ? (!isActive || !newMessage.trim() || isSending) && isAiThinking : stryMutAct_9fa48("23257") ? false : stryMutAct_9fa48("23256") ? true : (stryCov_9fa48("23256", "23257", "23258"), (stryMutAct_9fa48("23260") ? (!isActive || !newMessage.trim()) && isSending : stryMutAct_9fa48("23259") ? false : (stryCov_9fa48("23259", "23260"), (stryMutAct_9fa48("23262") ? !isActive && !newMessage.trim() : stryMutAct_9fa48("23261") ? false : (stryCov_9fa48("23261", "23262"), (stryMutAct_9fa48("23263") ? isActive : (stryCov_9fa48("23263"), !isActive)) || (stryMutAct_9fa48("23264") ? newMessage.trim() : (stryCov_9fa48("23264"), !(stryMutAct_9fa48("23265") ? newMessage : (stryCov_9fa48("23265"), newMessage.trim())))))) || isSending)) || isAiThinking)}>
                  {isSending ? stryMutAct_9fa48("23266") ? "" : (stryCov_9fa48("23266"), "Sending...") : <FaPaperPlane />}
                </button>
              </form>
              
              {stryMutAct_9fa48("23269") ? error || <div className="learning__error">{error}</div> : stryMutAct_9fa48("23268") ? false : stryMutAct_9fa48("23267") ? true : (stryCov_9fa48("23267", "23268", "23269"), error && <div className="learning__error">{error}</div>)}
              
              {stryMutAct_9fa48("23272") ? currentTaskIndex < tasks.length && tasks[currentTaskIndex].type === 'reflect' || <div className="learning__quick-replies">
                  <h4 className="learning__quick-replies-title">Quick Replies</h4>
                  <div className="learning__quick-replies-list">
                    <button className="learning__quick-reply-btn" onClick={() => handleQuickReply("I've used Khan Academy for math and found the interactive exercises helped me understand concepts better than textbooks.")} disabled={isSending || isAiThinking}>
                      I've used Khan Academy
                    </button>
                    <button className="learning__quick-reply-btn" onClick={() => handleQuickReply("Interactive exercises helped me learn faster because I could immediately apply what I was learning.")} disabled={isSending || isAiThinking}>
                      Interactive exercises helped
                    </button>
                    <button className="learning__quick-reply-btn" onClick={() => handleQuickReply("I found digital tools more effective than traditional textbooks because they provided immediate feedback.")} disabled={isSending || isAiThinking}>
                      More effective than textbooks
                    </button>
                  </div>
                </div> : stryMutAct_9fa48("23271") ? false : stryMutAct_9fa48("23270") ? true : (stryCov_9fa48("23270", "23271", "23272"), (stryMutAct_9fa48("23274") ? currentTaskIndex < tasks.length || tasks[currentTaskIndex].type === 'reflect' : stryMutAct_9fa48("23273") ? true : (stryCov_9fa48("23273", "23274"), (stryMutAct_9fa48("23277") ? currentTaskIndex >= tasks.length : stryMutAct_9fa48("23276") ? currentTaskIndex <= tasks.length : stryMutAct_9fa48("23275") ? true : (stryCov_9fa48("23275", "23276", "23277"), currentTaskIndex < tasks.length)) && (stryMutAct_9fa48("23279") ? tasks[currentTaskIndex].type !== 'reflect' : stryMutAct_9fa48("23278") ? true : (stryCov_9fa48("23278", "23279"), tasks[currentTaskIndex].type === (stryMutAct_9fa48("23280") ? "" : (stryCov_9fa48("23280"), 'reflect')))))) && <div className="learning__quick-replies">
                  <h4 className="learning__quick-replies-title">Quick Replies</h4>
                  <div className="learning__quick-replies-list">
                    <button className="learning__quick-reply-btn" onClick={stryMutAct_9fa48("23281") ? () => undefined : (stryCov_9fa48("23281"), () => handleQuickReply(stryMutAct_9fa48("23282") ? "" : (stryCov_9fa48("23282"), "I've used Khan Academy for math and found the interactive exercises helped me understand concepts better than textbooks.")))} disabled={stryMutAct_9fa48("23285") ? isSending && isAiThinking : stryMutAct_9fa48("23284") ? false : stryMutAct_9fa48("23283") ? true : (stryCov_9fa48("23283", "23284", "23285"), isSending || isAiThinking)}>
                      I've used Khan Academy
                    </button>
                    <button className="learning__quick-reply-btn" onClick={stryMutAct_9fa48("23286") ? () => undefined : (stryCov_9fa48("23286"), () => handleQuickReply(stryMutAct_9fa48("23287") ? "" : (stryCov_9fa48("23287"), "Interactive exercises helped me learn faster because I could immediately apply what I was learning.")))} disabled={stryMutAct_9fa48("23290") ? isSending && isAiThinking : stryMutAct_9fa48("23289") ? false : stryMutAct_9fa48("23288") ? true : (stryCov_9fa48("23288", "23289", "23290"), isSending || isAiThinking)}>
                      Interactive exercises helped
                    </button>
                    <button className="learning__quick-reply-btn" onClick={stryMutAct_9fa48("23291") ? () => undefined : (stryCov_9fa48("23291"), () => handleQuickReply(stryMutAct_9fa48("23292") ? "" : (stryCov_9fa48("23292"), "I found digital tools more effective than traditional textbooks because they provided immediate feedback.")))} disabled={stryMutAct_9fa48("23295") ? isSending && isAiThinking : stryMutAct_9fa48("23294") ? false : stryMutAct_9fa48("23293") ? true : (stryCov_9fa48("23293", "23294", "23295"), isSending || isAiThinking)}>
                      More effective than textbooks
                    </button>
                  </div>
                </div>)}
            </div>}
        </div>
      </div>
      
      {/* Submission Modal */}
      {stryMutAct_9fa48("23298") ? showSubmissionModal || <div className="learning__modal-overlay">
          <div className="learning__modal learning__modal--submission">
            <div className="learning__modal-header">
              <h3>Submit Deliverable</h3>
              <button className="learning__modal-close" onClick={() => setShowSubmissionModal(false)}>
                &times;
              </button>
            </div>
            <div className="learning__modal-body">
              <TaskSubmission taskId={tasks[currentTaskIndex].id} deliverable={tasks[currentTaskIndex].deliverable} canAnalyzeDeliverable={true} onAnalyzeDeliverable={handleAnalyzeDeliverable} />
            </div>
          </div>
        </div> : stryMutAct_9fa48("23297") ? false : stryMutAct_9fa48("23296") ? true : (stryCov_9fa48("23296", "23297", "23298"), showSubmissionModal && <div className="learning__modal-overlay">
          <div className="learning__modal learning__modal--submission">
            <div className="learning__modal-header">
              <h3>Submit Deliverable</h3>
              <button className="learning__modal-close" onClick={stryMutAct_9fa48("23299") ? () => undefined : (stryCov_9fa48("23299"), () => setShowSubmissionModal(stryMutAct_9fa48("23300") ? true : (stryCov_9fa48("23300"), false)))}>
                &times;
              </button>
            </div>
            <div className="learning__modal-body">
              <TaskSubmission taskId={tasks[currentTaskIndex].id} deliverable={tasks[currentTaskIndex].deliverable} canAnalyzeDeliverable={stryMutAct_9fa48("23301") ? false : (stryCov_9fa48("23301"), true)} onAnalyzeDeliverable={handleAnalyzeDeliverable} />
            </div>
          </div>
        </div>)}

      {/* Analysis Modal */}
      {stryMutAct_9fa48("23304") ? showAnalysisModal && analysisResults || <AnalysisModal isOpen={showAnalysisModal} onClose={() => setShowAnalysisModal(false)} analysisResults={organizeAnalysisBySubmission(analysisResults)} analysisType={analysisType} availableAnalysisTypes={getAvailableAnalysisTypes()} onSwitchAnalysisType={handleSwitchAnalysis} /> : stryMutAct_9fa48("23303") ? false : stryMutAct_9fa48("23302") ? true : (stryCov_9fa48("23302", "23303", "23304"), (stryMutAct_9fa48("23306") ? showAnalysisModal || analysisResults : stryMutAct_9fa48("23305") ? true : (stryCov_9fa48("23305", "23306"), showAnalysisModal && analysisResults)) && <AnalysisModal isOpen={showAnalysisModal} onClose={stryMutAct_9fa48("23307") ? () => undefined : (stryCov_9fa48("23307"), () => setShowAnalysisModal(stryMutAct_9fa48("23308") ? true : (stryCov_9fa48("23308"), false)))} analysisResults={organizeAnalysisBySubmission(analysisResults)} analysisType={analysisType} availableAnalysisTypes={getAvailableAnalysisTypes()} onSwitchAnalysisType={handleSwitchAnalysis} />)}
      

    </div>;
  }
}
export default Learning;