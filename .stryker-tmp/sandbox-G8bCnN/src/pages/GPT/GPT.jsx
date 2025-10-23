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
import './GPT.css';
import { FaPlus, FaChevronLeft, FaFileAlt, FaVideo, FaLink, FaTimes } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../../context/AuthContext';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getThreads, getThreadMessages, createThread, sendMessageToGPT } from '../../utils/api';
import SummaryModal from '../../components/SummaryModal/SummaryModal';
function GPT() {
  if (stryMutAct_9fa48("20187")) {
    {}
  } else {
    stryCov_9fa48("20187");
    const {
      token,
      user
    } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const [threads, setThreads] = useState(stryMutAct_9fa48("20188") ? ["Stryker was here"] : (stryCov_9fa48("20188"), []));
    const [activeThread, setActiveThread] = useState(null); // Start with no active thread
    const [messages, setMessages] = useState(stryMutAct_9fa48("20189") ? ["Stryker was here"] : (stryCov_9fa48("20189"), []));
    const [newMessage, setNewMessage] = useState(stryMutAct_9fa48("20190") ? "Stryker was here!" : (stryCov_9fa48("20190"), ''));
    const [isSending, setIsSending] = useState(stryMutAct_9fa48("20191") ? true : (stryCov_9fa48("20191"), false));
    const [isAiThinking, setIsAiThinking] = useState(stryMutAct_9fa48("20192") ? true : (stryCov_9fa48("20192"), false));
    const [sidebarVisible, setSidebarVisible] = useState(stryMutAct_9fa48("20193") ? false : (stryCov_9fa48("20193"), true));
    const [error, setError] = useState(stryMutAct_9fa48("20194") ? "Stryker was here!" : (stryCov_9fa48("20194"), ''));
    const [isLoading, setIsLoading] = useState(stryMutAct_9fa48("20195") ? false : (stryCov_9fa48("20195"), true));

    // Summary-related state
    const [currentThreadSummary, setCurrentThreadSummary] = useState(null);
    const [showSummaryModal, setShowSummaryModal] = useState(stryMutAct_9fa48("20196") ? true : (stryCov_9fa48("20196"), false));
    const [summaryThreadId, setSummaryThreadId] = useState(null); // Track which thread the summary belongs to
    const [summaryLoading, setSummaryLoading] = useState(stryMutAct_9fa48("20197") ? true : (stryCov_9fa48("20197"), false)); // Track if we're fetching summary
    const [modalSummaryData, setModalSummaryData] = useState(null); // Summary data for the modal

    // Enhanced content management state
    const [contentSources, setContentSources] = useState({}); // Store multiple content sources per thread
    const [showUploadDropdown, setShowUploadDropdown] = useState(stryMutAct_9fa48("20198") ? true : (stryCov_9fa48("20198"), false));
    const [isProcessingUpload, setIsProcessingUpload] = useState(stryMutAct_9fa48("20199") ? true : (stryCov_9fa48("20199"), false));
    const [processingFileName, setProcessingFileName] = useState(stryMutAct_9fa48("20200") ? "Stryker was here!" : (stryCov_9fa48("20200"), '')); // Track what's being processed
    const [processingUrl, setProcessingUrl] = useState(stryMutAct_9fa48("20201") ? "Stryker was here!" : (stryCov_9fa48("20201"), '')); // Track URL being processed
    const [processingStep, setProcessingStep] = useState(stryMutAct_9fa48("20202") ? "Stryker was here!" : (stryCov_9fa48("20202"), '')); // Track current processing step
    const [showUrlInput, setShowUrlInput] = useState(stryMutAct_9fa48("20203") ? true : (stryCov_9fa48("20203"), false));
    const [urlInput, setUrlInput] = useState(stryMutAct_9fa48("20204") ? "Stryker was here!" : (stryCov_9fa48("20204"), ''));
    const textareaRef = useRef(null);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const uploadDropdownRef = useRef(null);

    // Check if user is inactive (in historical access mode)
    const isInactiveUser = stryMutAct_9fa48("20207") ? user || user.active === false : stryMutAct_9fa48("20206") ? false : stryMutAct_9fa48("20205") ? true : (stryCov_9fa48("20205", "20206", "20207"), user && (stryMutAct_9fa48("20209") ? user.active !== false : stryMutAct_9fa48("20208") ? true : (stryCov_9fa48("20208", "20209"), user.active === (stryMutAct_9fa48("20210") ? true : (stryCov_9fa48("20210"), false)))));

    // Get threadId and summary data from URL parameters
    const threadIdFromUrl = searchParams.get(stryMutAct_9fa48("20211") ? "" : (stryCov_9fa48("20211"), 'threadId'));
    const summaryUrl = searchParams.get(stryMutAct_9fa48("20212") ? "" : (stryCov_9fa48("20212"), 'summaryUrl'));
    const summaryTitle = searchParams.get(stryMutAct_9fa48("20213") ? "" : (stryCov_9fa48("20213"), 'summaryTitle'));
    const summaryData = searchParams.get(stryMutAct_9fa48("20214") ? "" : (stryCov_9fa48("20214"), 'summaryData'));

    // Fetch threads on component mount
    useEffect(() => {
      if (stryMutAct_9fa48("20215")) {
        {}
      } else {
        stryCov_9fa48("20215");
        if (stryMutAct_9fa48("20217") ? false : stryMutAct_9fa48("20216") ? true : (stryCov_9fa48("20216", "20217"), token)) {
          if (stryMutAct_9fa48("20218")) {
            {}
          } else {
            stryCov_9fa48("20218");
            fetchThreads();
          }
        }
      }
    }, stryMutAct_9fa48("20219") ? [] : (stryCov_9fa48("20219"), [token]));

    // Handle summary data from URL parameters
    useEffect(() => {
      if (stryMutAct_9fa48("20220")) {
        {}
      } else {
        stryCov_9fa48("20220");
        if (stryMutAct_9fa48("20223") ? summaryUrl && summaryTitle || summaryData : stryMutAct_9fa48("20222") ? false : stryMutAct_9fa48("20221") ? true : (stryCov_9fa48("20221", "20222", "20223"), (stryMutAct_9fa48("20225") ? summaryUrl || summaryTitle : stryMutAct_9fa48("20224") ? true : (stryCov_9fa48("20224", "20225"), summaryUrl && summaryTitle)) && summaryData)) {
          if (stryMutAct_9fa48("20226")) {
            {}
          } else {
            stryCov_9fa48("20226");
            try {
              if (stryMutAct_9fa48("20227")) {
                {}
              } else {
                stryCov_9fa48("20227");
                // Parse the summary data from URL parameter
                const parsedSummaryData = JSON.parse(decodeURIComponent(summaryData));

                // Set up the summary for the current thread
                setCurrentThreadSummary(stryMutAct_9fa48("20228") ? {} : (stryCov_9fa48("20228"), {
                  url: summaryUrl,
                  title: summaryTitle,
                  ...parsedSummaryData
                }));

                // Wait for threadIdFromUrl to be processed, then set the summary thread ID
                if (stryMutAct_9fa48("20230") ? false : stryMutAct_9fa48("20229") ? true : (stryCov_9fa48("20229", "20230"), threadIdFromUrl)) {
                  if (stryMutAct_9fa48("20231")) {
                    {}
                  } else {
                    stryCov_9fa48("20231");
                    setSummaryThreadId(threadIdFromUrl);
                  }
                }

                // Clean up URL parameters
                const newSearchParams = new URLSearchParams(searchParams);
                newSearchParams.delete(stryMutAct_9fa48("20232") ? "" : (stryCov_9fa48("20232"), 'summaryUrl'));
                newSearchParams.delete(stryMutAct_9fa48("20233") ? "" : (stryCov_9fa48("20233"), 'summaryTitle'));
                newSearchParams.delete(stryMutAct_9fa48("20234") ? "" : (stryCov_9fa48("20234"), 'summaryData'));
                setSearchParams(newSearchParams, stryMutAct_9fa48("20235") ? {} : (stryCov_9fa48("20235"), {
                  replace: stryMutAct_9fa48("20236") ? false : (stryCov_9fa48("20236"), true)
                }));
              }
            } catch (error) {
              if (stryMutAct_9fa48("20237")) {
                {}
              } else {
                stryCov_9fa48("20237");
                console.error(stryMutAct_9fa48("20238") ? "" : (stryCov_9fa48("20238"), 'Error parsing summary data from URL:'), error);
                // Clean up invalid parameters
                const newSearchParams = new URLSearchParams(searchParams);
                newSearchParams.delete(stryMutAct_9fa48("20239") ? "" : (stryCov_9fa48("20239"), 'summaryUrl'));
                newSearchParams.delete(stryMutAct_9fa48("20240") ? "" : (stryCov_9fa48("20240"), 'summaryTitle'));
                newSearchParams.delete(stryMutAct_9fa48("20241") ? "" : (stryCov_9fa48("20241"), 'summaryData'));
                setSearchParams(newSearchParams, stryMutAct_9fa48("20242") ? {} : (stryCov_9fa48("20242"), {
                  replace: stryMutAct_9fa48("20243") ? false : (stryCov_9fa48("20243"), true)
                }));
              }
            }
          }
        }
      }
    }, stryMutAct_9fa48("20244") ? [] : (stryCov_9fa48("20244"), [summaryUrl, summaryTitle, summaryData, searchParams, setSearchParams, threadIdFromUrl]));

    // Handle threadId URL parameter
    useEffect(() => {
      if (stryMutAct_9fa48("20245")) {
        {}
      } else {
        stryCov_9fa48("20245");
        if (stryMutAct_9fa48("20248") ? threadIdFromUrl || threads.length > 0 : stryMutAct_9fa48("20247") ? false : stryMutAct_9fa48("20246") ? true : (stryCov_9fa48("20246", "20247", "20248"), threadIdFromUrl && (stryMutAct_9fa48("20251") ? threads.length <= 0 : stryMutAct_9fa48("20250") ? threads.length >= 0 : stryMutAct_9fa48("20249") ? true : (stryCov_9fa48("20249", "20250", "20251"), threads.length > 0)))) {
          if (stryMutAct_9fa48("20252")) {
            {}
          } else {
            stryCov_9fa48("20252");
            // Check if the thread exists in our threads list
            const targetThread = threads.find(stryMutAct_9fa48("20253") ? () => undefined : (stryCov_9fa48("20253"), thread => stryMutAct_9fa48("20256") ? String(getThreadId(thread)) !== String(threadIdFromUrl) : stryMutAct_9fa48("20255") ? false : stryMutAct_9fa48("20254") ? true : (stryCov_9fa48("20254", "20255", "20256"), String(getThreadId(thread)) === String(threadIdFromUrl))));
            if (stryMutAct_9fa48("20258") ? false : stryMutAct_9fa48("20257") ? true : (stryCov_9fa48("20257", "20258"), targetThread)) {
              if (stryMutAct_9fa48("20259")) {
                {}
              } else {
                stryCov_9fa48("20259");
                setActiveThread(getThreadId(targetThread));
                // Remove the threadId from URL after loading
                const newSearchParams = new URLSearchParams(searchParams);
                newSearchParams.delete(stryMutAct_9fa48("20260") ? "" : (stryCov_9fa48("20260"), 'threadId'));
                setSearchParams(newSearchParams, stryMutAct_9fa48("20261") ? {} : (stryCov_9fa48("20261"), {
                  replace: stryMutAct_9fa48("20262") ? false : (stryCov_9fa48("20262"), true)
                }));

                // If we have summary data waiting, associate it with this thread
                if (stryMutAct_9fa48("20265") ? currentThreadSummary || !summaryThreadId : stryMutAct_9fa48("20264") ? false : stryMutAct_9fa48("20263") ? true : (stryCov_9fa48("20263", "20264", "20265"), currentThreadSummary && (stryMutAct_9fa48("20266") ? summaryThreadId : (stryCov_9fa48("20266"), !summaryThreadId)))) {
                  if (stryMutAct_9fa48("20267")) {
                    {}
                  } else {
                    stryCov_9fa48("20267");
                    setSummaryThreadId(getThreadId(targetThread));
                  }
                }
              }
            } else {
              if (stryMutAct_9fa48("20268")) {
                {}
              } else {
                stryCov_9fa48("20268");
                // Thread not found, clear the parameter
                const newSearchParams = new URLSearchParams(searchParams);
                newSearchParams.delete(stryMutAct_9fa48("20269") ? "" : (stryCov_9fa48("20269"), 'threadId'));
                setSearchParams(newSearchParams, stryMutAct_9fa48("20270") ? {} : (stryCov_9fa48("20270"), {
                  replace: stryMutAct_9fa48("20271") ? false : (stryCov_9fa48("20271"), true)
                }));
                setError(stryMutAct_9fa48("20272") ? "" : (stryCov_9fa48("20272"), 'Thread not found or access denied.'));
              }
            }
          }
        }
      }
    }, stryMutAct_9fa48("20273") ? [] : (stryCov_9fa48("20273"), [threadIdFromUrl, threads, searchParams, setSearchParams]));

    // Fetch messages when active thread changes
    useEffect(() => {
      if (stryMutAct_9fa48("20274")) {
        {}
      } else {
        stryCov_9fa48("20274");
        if (stryMutAct_9fa48("20277") ? activeThread || token : stryMutAct_9fa48("20276") ? false : stryMutAct_9fa48("20275") ? true : (stryCov_9fa48("20275", "20276", "20277"), activeThread && token)) {
          if (stryMutAct_9fa48("20278")) {
            {}
          } else {
            stryCov_9fa48("20278");
            fetchMessages(activeThread);
          }
        } else {
          if (stryMutAct_9fa48("20279")) {
            {}
          } else {
            stryCov_9fa48("20279");
            setMessages(stryMutAct_9fa48("20280") ? ["Stryker was here"] : (stryCov_9fa48("20280"), []));
          }
        }
      }
    }, stryMutAct_9fa48("20281") ? [] : (stryCov_9fa48("20281"), [activeThread, token]));

    // Clear summary data when switching to a thread without summary
    useEffect(() => {
      if (stryMutAct_9fa48("20282")) {
        {}
      } else {
        stryCov_9fa48("20282");
        if (stryMutAct_9fa48("20285") ? activeThread && summaryThreadId || String(activeThread) !== String(summaryThreadId) : stryMutAct_9fa48("20284") ? false : stryMutAct_9fa48("20283") ? true : (stryCov_9fa48("20283", "20284", "20285"), (stryMutAct_9fa48("20287") ? activeThread || summaryThreadId : stryMutAct_9fa48("20286") ? true : (stryCov_9fa48("20286", "20287"), activeThread && summaryThreadId)) && (stryMutAct_9fa48("20289") ? String(activeThread) === String(summaryThreadId) : stryMutAct_9fa48("20288") ? true : (stryCov_9fa48("20288", "20289"), String(activeThread) !== String(summaryThreadId))))) {
          if (stryMutAct_9fa48("20290")) {
            {}
          } else {
            stryCov_9fa48("20290");
            // User switched to a different thread, clear summary data
            setCurrentThreadSummary(null);
            setSummaryThreadId(null);
          }
        }

        // Clear modal summary data when switching threads
        setModalSummaryData(null);
      }
    }, stryMutAct_9fa48("20291") ? [] : (stryCov_9fa48("20291"), [activeThread, summaryThreadId]));

    // Scroll to bottom when messages change
    useEffect(() => {
      if (stryMutAct_9fa48("20292")) {
        {}
      } else {
        stryCov_9fa48("20292");
        if (stryMutAct_9fa48("20294") ? false : stryMutAct_9fa48("20293") ? true : (stryCov_9fa48("20293", "20294"), messagesEndRef.current)) {
          if (stryMutAct_9fa48("20295")) {
            {}
          } else {
            stryCov_9fa48("20295");
            messagesEndRef.current.scrollIntoView(stryMutAct_9fa48("20296") ? {} : (stryCov_9fa48("20296"), {
              behavior: stryMutAct_9fa48("20297") ? "" : (stryCov_9fa48("20297"), 'smooth')
            }));
          }
        }
      }
    }, stryMutAct_9fa48("20298") ? [] : (stryCov_9fa48("20298"), [messages]));
    const fetchThreads = async () => {
      if (stryMutAct_9fa48("20299")) {
        {}
      } else {
        stryCov_9fa48("20299");
        try {
          if (stryMutAct_9fa48("20300")) {
            {}
          } else {
            stryCov_9fa48("20300");
            setIsLoading(stryMutAct_9fa48("20301") ? false : (stryCov_9fa48("20301"), true));
            const data = await getThreads(token);

            // Check the structure of the response and adapt accordingly
            const threadsArray = Array.isArray(data) ? data : data.threads ? data.threads : data.data ? data.data : stryMutAct_9fa48("20302") ? ["Stryker was here"] : (stryCov_9fa48("20302"), []);
            setThreads(threadsArray);

            // Remove the automatic selection of the first thread
            // Only set active thread if we're refreshing threads after creating a new one
            // This will be handled by the handleCreateThread function instead

            setError(stryMutAct_9fa48("20303") ? "Stryker was here!" : (stryCov_9fa48("20303"), ''));
          }
        } catch (err) {
          if (stryMutAct_9fa48("20304")) {
            {}
          } else {
            stryCov_9fa48("20304");
            console.error(stryMutAct_9fa48("20305") ? "" : (stryCov_9fa48("20305"), 'Error fetching threads:'), err);
            setError(stryMutAct_9fa48("20306") ? "" : (stryCov_9fa48("20306"), 'Failed to load conversations. Please try again.'));
          }
        } finally {
          if (stryMutAct_9fa48("20307")) {
            {}
          } else {
            stryCov_9fa48("20307");
            setIsLoading(stryMutAct_9fa48("20308") ? true : (stryCov_9fa48("20308"), false));
          }
        }
      }
    };
    const fetchMessages = async threadId => {
      if (stryMutAct_9fa48("20309")) {
        {}
      } else {
        stryCov_9fa48("20309");
        try {
          if (stryMutAct_9fa48("20310")) {
            {}
          } else {
            stryCov_9fa48("20310");
            setIsLoading(stryMutAct_9fa48("20311") ? false : (stryCov_9fa48("20311"), true));
            const data = await getThreadMessages(threadId, token);

            // The API returns an array of messages directly
            let messagesArray = Array.isArray(data) ? data : data.messages ? data.messages : data.data ? data.data : stryMutAct_9fa48("20312") ? ["Stryker was here"] : (stryCov_9fa48("20312"), []);

            // Sort messages by created_at timestamp if available
            if (stryMutAct_9fa48("20315") ? messagesArray.length > 0 || messagesArray[0].created_at : stryMutAct_9fa48("20314") ? false : stryMutAct_9fa48("20313") ? true : (stryCov_9fa48("20313", "20314", "20315"), (stryMutAct_9fa48("20318") ? messagesArray.length <= 0 : stryMutAct_9fa48("20317") ? messagesArray.length >= 0 : stryMutAct_9fa48("20316") ? true : (stryCov_9fa48("20316", "20317", "20318"), messagesArray.length > 0)) && messagesArray[0].created_at)) {
              if (stryMutAct_9fa48("20319")) {
                {}
              } else {
                stryCov_9fa48("20319");
                messagesArray = stryMutAct_9fa48("20320") ? [...messagesArray] : (stryCov_9fa48("20320"), (stryMutAct_9fa48("20321") ? [] : (stryCov_9fa48("20321"), [...messagesArray])).sort(stryMutAct_9fa48("20322") ? () => undefined : (stryCov_9fa48("20322"), (a, b) => stryMutAct_9fa48("20323") ? new Date(a.created_at) + new Date(b.created_at) : (stryCov_9fa48("20323"), new Date(a.created_at) - new Date(b.created_at)))));
              }
            }

            // Add message_id if not present (using timestamp or index as fallback)
            messagesArray = messagesArray.map((message, index) => {
              if (stryMutAct_9fa48("20324")) {
                {}
              } else {
                stryCov_9fa48("20324");
                if (stryMutAct_9fa48("20327") ? !message.message_id || !message.id : stryMutAct_9fa48("20326") ? false : stryMutAct_9fa48("20325") ? true : (stryCov_9fa48("20325", "20326", "20327"), (stryMutAct_9fa48("20328") ? message.message_id : (stryCov_9fa48("20328"), !message.message_id)) && (stryMutAct_9fa48("20329") ? message.id : (stryCov_9fa48("20329"), !message.id)))) {
                  if (stryMutAct_9fa48("20330")) {
                    {}
                  } else {
                    stryCov_9fa48("20330");
                    return stryMutAct_9fa48("20331") ? {} : (stryCov_9fa48("20331"), {
                      ...message,
                      message_id: message.created_at ? new Date(message.created_at).getTime() : stryMutAct_9fa48("20332") ? Date.now() - index : (stryCov_9fa48("20332"), Date.now() + index)
                    });
                  }
                }
                return message;
              }
            });
            setMessages(messagesArray);
            setError(stryMutAct_9fa48("20333") ? "Stryker was here!" : (stryCov_9fa48("20333"), ''));
          }
        } catch (err) {
          if (stryMutAct_9fa48("20334")) {
            {}
          } else {
            stryCov_9fa48("20334");
            console.error(stryMutAct_9fa48("20335") ? "" : (stryCov_9fa48("20335"), 'Error fetching messages:'), err);
            setError(stryMutAct_9fa48("20336") ? "" : (stryCov_9fa48("20336"), 'Failed to load messages. Please try again.'));
          }
        } finally {
          if (stryMutAct_9fa48("20337")) {
            {}
          } else {
            stryCov_9fa48("20337");
            setIsLoading(stryMutAct_9fa48("20338") ? true : (stryCov_9fa48("20338"), false));
          }
        }
      }
    };
    const handleThreadClick = threadId => {
      if (stryMutAct_9fa48("20339")) {
        {}
      } else {
        stryCov_9fa48("20339");
        setActiveThread(threadId);
      }
    };
    const handleCreateThread = async () => {
      if (stryMutAct_9fa48("20340")) {
        {}
      } else {
        stryCov_9fa48("20340");
        // Prevent inactive users from creating new threads
        if (stryMutAct_9fa48("20342") ? false : stryMutAct_9fa48("20341") ? true : (stryCov_9fa48("20341", "20342"), isInactiveUser)) {
          if (stryMutAct_9fa48("20343")) {
            {}
          } else {
            stryCov_9fa48("20343");
            setError(stryMutAct_9fa48("20344") ? "" : (stryCov_9fa48("20344"), 'You are in historical access mode and cannot create new conversations.'));
            return;
          }
        }
        try {
          if (stryMutAct_9fa48("20345")) {
            {}
          } else {
            stryCov_9fa48("20345");
            setIsLoading(stryMutAct_9fa48("20346") ? false : (stryCov_9fa48("20346"), true));
            const data = await createThread(null, token);

            // Adapt to your API's response structure
            const newThread = stryMutAct_9fa48("20349") ? (data.thread || data.data) && data : stryMutAct_9fa48("20348") ? false : stryMutAct_9fa48("20347") ? true : (stryCov_9fa48("20347", "20348", "20349"), (stryMutAct_9fa48("20351") ? data.thread && data.data : stryMutAct_9fa48("20350") ? false : (stryCov_9fa48("20350", "20351"), data.thread || data.data)) || data);
            if (stryMutAct_9fa48("20353") ? false : stryMutAct_9fa48("20352") ? true : (stryCov_9fa48("20352", "20353"), newThread)) {
              if (stryMutAct_9fa48("20354")) {
                {}
              } else {
                stryCov_9fa48("20354");
                // Adapt to your API's thread ID field name
                const threadIdField = newThread.thread_id ? stryMutAct_9fa48("20355") ? "" : (stryCov_9fa48("20355"), 'thread_id') : stryMutAct_9fa48("20356") ? "" : (stryCov_9fa48("20356"), 'id');
                setThreads(stryMutAct_9fa48("20357") ? () => undefined : (stryCov_9fa48("20357"), prev => stryMutAct_9fa48("20358") ? [] : (stryCov_9fa48("20358"), [newThread, ...prev])));
                setActiveThread(newThread[threadIdField]);
                setMessages(stryMutAct_9fa48("20359") ? ["Stryker was here"] : (stryCov_9fa48("20359"), []));
              }
            }
            setError(stryMutAct_9fa48("20360") ? "Stryker was here!" : (stryCov_9fa48("20360"), ''));
          }
        } catch (err) {
          if (stryMutAct_9fa48("20361")) {
            {}
          } else {
            stryCov_9fa48("20361");
            console.error(stryMutAct_9fa48("20362") ? "" : (stryCov_9fa48("20362"), 'Error creating thread:'), err);
            setError(stryMutAct_9fa48("20363") ? "" : (stryCov_9fa48("20363"), 'Failed to create new conversation. Please try again.'));
          }
        } finally {
          if (stryMutAct_9fa48("20364")) {
            {}
          } else {
            stryCov_9fa48("20364");
            setIsLoading(stryMutAct_9fa48("20365") ? true : (stryCov_9fa48("20365"), false));
          }
        }
      }
    };
    const handleSendMessage = async e => {
      if (stryMutAct_9fa48("20366")) {
        {}
      } else {
        stryCov_9fa48("20366");
        e.preventDefault();
        if (stryMutAct_9fa48("20369") ? (!newMessage.trim() || !activeThread) && isSending : stryMutAct_9fa48("20368") ? false : stryMutAct_9fa48("20367") ? true : (stryCov_9fa48("20367", "20368", "20369"), (stryMutAct_9fa48("20371") ? !newMessage.trim() && !activeThread : stryMutAct_9fa48("20370") ? false : (stryCov_9fa48("20370", "20371"), (stryMutAct_9fa48("20372") ? newMessage.trim() : (stryCov_9fa48("20372"), !(stryMutAct_9fa48("20373") ? newMessage : (stryCov_9fa48("20373"), newMessage.trim())))) || (stryMutAct_9fa48("20374") ? activeThread : (stryCov_9fa48("20374"), !activeThread)))) || isSending)) return;

        // Prevent inactive users from sending messages
        if (stryMutAct_9fa48("20376") ? false : stryMutAct_9fa48("20375") ? true : (stryCov_9fa48("20375", "20376"), isInactiveUser)) {
          if (stryMutAct_9fa48("20377")) {
            {}
          } else {
            stryCov_9fa48("20377");
            setError(stryMutAct_9fa48("20378") ? "" : (stryCov_9fa48("20378"), 'You are in historical access mode and cannot send new messages.'));
            return;
          }
        }
        const messageToSend = newMessage;
        if (stryMutAct_9fa48("20380") ? false : stryMutAct_9fa48("20379") ? true : (stryCov_9fa48("20379", "20380"), textareaRef.current)) {
          if (stryMutAct_9fa48("20381")) {
            {}
          } else {
            stryCov_9fa48("20381");
            textareaRef.current.style.height = stryMutAct_9fa48("20382") ? "" : (stryCov_9fa48("20382"), 'auto');
          }
        }

        // Add user message to UI immediately
        const tempUserMessageId = Date.now();
        const tempUserMessage = stryMutAct_9fa48("20383") ? {} : (stryCov_9fa48("20383"), {
          message_id: tempUserMessageId,
          content: messageToSend,
          message_role: stryMutAct_9fa48("20384") ? "" : (stryCov_9fa48("20384"), 'user'),
          created_at: new Date().toISOString()
        });
        setMessages(stryMutAct_9fa48("20385") ? () => undefined : (stryCov_9fa48("20385"), prevMessages => stryMutAct_9fa48("20386") ? [] : (stryCov_9fa48("20386"), [...prevMessages, tempUserMessage])));
        setNewMessage(stryMutAct_9fa48("20387") ? "Stryker was here!" : (stryCov_9fa48("20387"), ''));
        setIsSending(stryMutAct_9fa48("20388") ? false : (stryCov_9fa48("20388"), true));
        setIsAiThinking(stryMutAct_9fa48("20389") ? false : (stryCov_9fa48("20389"), true));
        try {
          if (stryMutAct_9fa48("20390")) {
            {}
          } else {
            stryCov_9fa48("20390");
            // Check if this is the first message in the thread
            const isFirstMessage = stryMutAct_9fa48("20393") ? messages.length !== 0 : stryMutAct_9fa48("20392") ? false : stryMutAct_9fa48("20391") ? true : (stryCov_9fa48("20391", "20392", "20393"), messages.length === 0);

            // Send message to API
            const response = await sendMessageToGPT(messageToSend, activeThread, token);

            // If this is the first message, refresh threads to get updated titles
            if (stryMutAct_9fa48("20395") ? false : stryMutAct_9fa48("20394") ? true : (stryCov_9fa48("20394", "20395"), isFirstMessage)) {
              if (stryMutAct_9fa48("20396")) {
                {}
              } else {
                stryCov_9fa48("20396");
                setTimeout(() => {
                  if (stryMutAct_9fa48("20397")) {
                    {}
                  } else {
                    stryCov_9fa48("20397");
                    fetchThreads();
                  }
                }, 1000);
              }
            }

            // The API returns a single reply message in the 'reply' field
            if (stryMutAct_9fa48("20400") ? response || response.reply : stryMutAct_9fa48("20399") ? false : stryMutAct_9fa48("20398") ? true : (stryCov_9fa48("20398", "20399", "20400"), response && response.reply)) {
              if (stryMutAct_9fa48("20401")) {
                {}
              } else {
                stryCov_9fa48("20401");
                // Add the assistant's reply to the messages
                setMessages(stryMutAct_9fa48("20402") ? () => undefined : (stryCov_9fa48("20402"), prevMessages => stryMutAct_9fa48("20403") ? [] : (stryCov_9fa48("20403"), [...(stryMutAct_9fa48("20404") ? prevMessages : (stryCov_9fa48("20404"), prevMessages.filter(stryMutAct_9fa48("20405") ? () => undefined : (stryCov_9fa48("20405"), msg => stryMutAct_9fa48("20408") ? msg.message_id === tempUserMessageId : stryMutAct_9fa48("20407") ? false : stryMutAct_9fa48("20406") ? true : (stryCov_9fa48("20406", "20407", "20408"), msg.message_id !== tempUserMessageId))))),
                // Add the confirmed user message from the server if available, otherwise keep the temp one
                tempUserMessage,
                // Add the assistant's reply
                response.reply])));
              }
            } else {
              if (stryMutAct_9fa48("20409")) {
                {}
              } else {
                stryCov_9fa48("20409");
                // If the response doesn't contain a reply, fetch all messages to ensure we have the latest state
                await fetchMessages(activeThread);
              }
            }
            setError(stryMutAct_9fa48("20410") ? "Stryker was here!" : (stryCov_9fa48("20410"), ''));
          }
        } catch (err) {
          if (stryMutAct_9fa48("20411")) {
            {}
          } else {
            stryCov_9fa48("20411");
            console.error(stryMutAct_9fa48("20412") ? "" : (stryCov_9fa48("20412"), 'Error sending message:'), err);
            setError(stryMutAct_9fa48("20413") ? "" : (stryCov_9fa48("20413"), 'Failed to send message. Please try again.'));

            // Remove the temporary user message if there was an error
            setMessages(stryMutAct_9fa48("20414") ? () => undefined : (stryCov_9fa48("20414"), prevMessages => stryMutAct_9fa48("20415") ? prevMessages : (stryCov_9fa48("20415"), prevMessages.filter(stryMutAct_9fa48("20416") ? () => undefined : (stryCov_9fa48("20416"), msg => stryMutAct_9fa48("20419") ? msg.message_id === tempUserMessageId : stryMutAct_9fa48("20418") ? false : stryMutAct_9fa48("20417") ? true : (stryCov_9fa48("20417", "20418", "20419"), msg.message_id !== tempUserMessageId))))));
          }
        } finally {
          if (stryMutAct_9fa48("20420")) {
            {}
          } else {
            stryCov_9fa48("20420");
            setIsSending(stryMutAct_9fa48("20421") ? true : (stryCov_9fa48("20421"), false));
            setIsAiThinking(stryMutAct_9fa48("20422") ? true : (stryCov_9fa48("20422"), false));
          }
        }
      }
    };
    const formatMessageContent = content => {
      if (stryMutAct_9fa48("20423")) {
        {}
      } else {
        stryCov_9fa48("20423");
        const parts = content.split(stryMutAct_9fa48("20427") ? /(```[\s\s]*?```)/ : stryMutAct_9fa48("20426") ? /(```[\S\S]*?```)/ : stryMutAct_9fa48("20425") ? /(```[^\s\S]*?```)/ : stryMutAct_9fa48("20424") ? /(```[\s\S]```)/ : (stryCov_9fa48("20424", "20425", "20426", "20427"), /(```[\s\S]*?```)/));
        return parts.map((part, index) => {
          if (stryMutAct_9fa48("20428")) {
            {}
          } else {
            stryCov_9fa48("20428");
            if (stryMutAct_9fa48("20431") ? part.endsWith('```') : stryMutAct_9fa48("20430") ? false : stryMutAct_9fa48("20429") ? true : (stryCov_9fa48("20429", "20430", "20431"), part.startsWith(stryMutAct_9fa48("20432") ? "" : (stryCov_9fa48("20432"), '```')))) {
              if (stryMutAct_9fa48("20433")) {
                {}
              } else {
                stryCov_9fa48("20433");
                // Extract language and code
                const match = part.match(stryMutAct_9fa48("20441") ? /```(\w+)?\n?([\s\s]*?)```/ : stryMutAct_9fa48("20440") ? /```(\w+)?\n?([\S\S]*?)```/ : stryMutAct_9fa48("20439") ? /```(\w+)?\n?([^\s\S]*?)```/ : stryMutAct_9fa48("20438") ? /```(\w+)?\n?([\s\S])```/ : stryMutAct_9fa48("20437") ? /```(\w+)?\n([\s\S]*?)```/ : stryMutAct_9fa48("20436") ? /```(\W+)?\n?([\s\S]*?)```/ : stryMutAct_9fa48("20435") ? /```(\w)?\n?([\s\S]*?)```/ : stryMutAct_9fa48("20434") ? /```(\w+)\n?([\s\S]*?)```/ : (stryCov_9fa48("20434", "20435", "20436", "20437", "20438", "20439", "20440", "20441"), /```(\w+)?\n?([\s\S]*?)```/));
                const language = stryMutAct_9fa48("20444") ? match?.[1] && '' : stryMutAct_9fa48("20443") ? false : stryMutAct_9fa48("20442") ? true : (stryCov_9fa48("20442", "20443", "20444"), (stryMutAct_9fa48("20445") ? match[1] : (stryCov_9fa48("20445"), match?.[1])) || (stryMutAct_9fa48("20446") ? "Stryker was here!" : (stryCov_9fa48("20446"), '')));
                const code = stryMutAct_9fa48("20449") ? match?.[2] && '' : stryMutAct_9fa48("20448") ? false : stryMutAct_9fa48("20447") ? true : (stryCov_9fa48("20447", "20448", "20449"), (stryMutAct_9fa48("20450") ? match[2] : (stryCov_9fa48("20450"), match?.[2])) || (stryMutAct_9fa48("20451") ? "Stryker was here!" : (stryCov_9fa48("20451"), '')));
                return <pre key={index} className="code-block">
            {stryMutAct_9fa48("20454") ? language || <div className="code-language">{language}</div> : stryMutAct_9fa48("20453") ? false : stryMutAct_9fa48("20452") ? true : (stryCov_9fa48("20452", "20453", "20454"), language && <div className="code-language">{language}</div>)}
            <code>{code}</code>
          </pre>;
              }
            }
            return <ReactMarkdown key={index} components={stryMutAct_9fa48("20455") ? {} : (stryCov_9fa48("20455"), {
              p: stryMutAct_9fa48("20456") ? () => undefined : (stryCov_9fa48("20456"), ({
                node,
                children,
                ...props
              }) => <p className="markdown-paragraph" {...props}>{children}</p>),
              h1: stryMutAct_9fa48("20457") ? () => undefined : (stryCov_9fa48("20457"), ({
                node,
                children,
                ...props
              }) => <h1 className="markdown-heading" {...props}>{children}</h1>),
              h2: stryMutAct_9fa48("20458") ? () => undefined : (stryCov_9fa48("20458"), ({
                node,
                children,
                ...props
              }) => <h2 className="markdown-heading" {...props}>{children}</h2>),
              h3: stryMutAct_9fa48("20459") ? () => undefined : (stryCov_9fa48("20459"), ({
                node,
                children,
                ...props
              }) => <h3 className="markdown-heading" {...props}>{children}</h3>),
              ul: stryMutAct_9fa48("20460") ? () => undefined : (stryCov_9fa48("20460"), ({
                node,
                children,
                ...props
              }) => <ul className="markdown-list" {...props}>{children}</ul>),
              ol: stryMutAct_9fa48("20461") ? () => undefined : (stryCov_9fa48("20461"), ({
                node,
                children,
                ...props
              }) => <ol className="markdown-list" {...props}>{children}</ol>),
              li: stryMutAct_9fa48("20462") ? () => undefined : (stryCov_9fa48("20462"), ({
                node,
                children,
                ...props
              }) => <li className="markdown-list-item" {...props}>{children}</li>),
              a: stryMutAct_9fa48("20463") ? () => undefined : (stryCov_9fa48("20463"), ({
                node,
                children,
                ...props
              }) => <a className="markdown-link" target="_blank" rel="noopener noreferrer" {...props}>{children}</a>),
              blockquote: stryMutAct_9fa48("20464") ? () => undefined : (stryCov_9fa48("20464"), ({
                node,
                children,
                ...props
              }) => <blockquote className="markdown-blockquote" {...props}>{children}</blockquote>),
              table: stryMutAct_9fa48("20465") ? () => undefined : (stryCov_9fa48("20465"), ({
                node,
                children,
                ...props
              }) => <table className="markdown-table" {...props}>{children}</table>),
              code: ({
                node,
                inline,
                className,
                children,
                ...props
              }) => {
                if (stryMutAct_9fa48("20466")) {
                  {}
                } else {
                  stryCov_9fa48("20466");
                  if (stryMutAct_9fa48("20468") ? false : stryMutAct_9fa48("20467") ? true : (stryCov_9fa48("20467", "20468"), inline)) {
                    if (stryMutAct_9fa48("20469")) {
                      {}
                    } else {
                      stryCov_9fa48("20469");
                      return <code className="inline-code" {...props}>
                    {children}
                  </code>;
                    }
                  }
                  return <code {...props}>
                  {children}
                </code>;
                }
              }
            })}>
          {part}
        </ReactMarkdown>;
          }
        });
      }
    };

    // Helper function to get thread title
    const getThreadTitle = thread => {
      if (stryMutAct_9fa48("20470")) {
        {}
      } else {
        stryCov_9fa48("20470");
        // Adapt to your API's title field name
        return stryMutAct_9fa48("20473") ? (thread.title || thread.name) && 'New Conversation' : stryMutAct_9fa48("20472") ? false : stryMutAct_9fa48("20471") ? true : (stryCov_9fa48("20471", "20472", "20473"), (stryMutAct_9fa48("20475") ? thread.title && thread.name : stryMutAct_9fa48("20474") ? false : (stryCov_9fa48("20474", "20475"), thread.title || thread.name)) || (stryMutAct_9fa48("20476") ? "" : (stryCov_9fa48("20476"), 'New Conversation')));
      }
    };

    // Helper function to get thread ID
    const getThreadId = thread => {
      if (stryMutAct_9fa48("20477")) {
        {}
      } else {
        stryCov_9fa48("20477");
        // Adapt to your API's thread ID field name
        return stryMutAct_9fa48("20480") ? thread.thread_id && thread.id : stryMutAct_9fa48("20479") ? false : stryMutAct_9fa48("20478") ? true : (stryCov_9fa48("20478", "20479", "20480"), thread.thread_id || thread.id);
      }
    };

    // Helper function to get message ID
    const getMessageId = message => {
      if (stryMutAct_9fa48("20481")) {
        {}
      } else {
        stryCov_9fa48("20481");
        // Adapt to your API's message ID field name
        return stryMutAct_9fa48("20484") ? (message.message_id || message.id) && message.created_at : stryMutAct_9fa48("20483") ? false : stryMutAct_9fa48("20482") ? true : (stryCov_9fa48("20482", "20483", "20484"), (stryMutAct_9fa48("20486") ? message.message_id && message.id : stryMutAct_9fa48("20485") ? false : (stryCov_9fa48("20485", "20486"), message.message_id || message.id)) || message.created_at);
      }
    };

    // Helper function to get message role
    const getMessageRole = message => {
      if (stryMutAct_9fa48("20487")) {
        {}
      } else {
        stryCov_9fa48("20487");
        // Adapt to your API's role field name
        return stryMutAct_9fa48("20490") ? message.message_role && message.role : stryMutAct_9fa48("20489") ? false : stryMutAct_9fa48("20488") ? true : (stryCov_9fa48("20488", "20489", "20490"), message.message_role || message.role);
      }
    };

    // Helper function to check if current thread is an article discussion
    const isArticleDiscussionThread = () => {
      if (stryMutAct_9fa48("20491")) {
        {}
      } else {
        stryCov_9fa48("20491");
        if (stryMutAct_9fa48("20494") ? !activeThread && !threads.length : stryMutAct_9fa48("20493") ? false : stryMutAct_9fa48("20492") ? true : (stryCov_9fa48("20492", "20493", "20494"), (stryMutAct_9fa48("20495") ? activeThread : (stryCov_9fa48("20495"), !activeThread)) || (stryMutAct_9fa48("20496") ? threads.length : (stryCov_9fa48("20496"), !threads.length)))) return stryMutAct_9fa48("20497") ? true : (stryCov_9fa48("20497"), false);
        const currentThread = threads.find(stryMutAct_9fa48("20498") ? () => undefined : (stryCov_9fa48("20498"), thread => stryMutAct_9fa48("20501") ? getThreadId(thread) !== activeThread : stryMutAct_9fa48("20500") ? false : stryMutAct_9fa48("20499") ? true : (stryCov_9fa48("20499", "20500", "20501"), getThreadId(thread) === activeThread)));
        if (stryMutAct_9fa48("20504") ? false : stryMutAct_9fa48("20503") ? true : stryMutAct_9fa48("20502") ? currentThread : (stryCov_9fa48("20502", "20503", "20504"), !currentThread)) return stryMutAct_9fa48("20505") ? true : (stryCov_9fa48("20505"), false);

        // Check if thread title indicates it's an article discussion
        const threadTitle = getThreadTitle(currentThread);
        return stryMutAct_9fa48("20508") ? threadTitle || threadTitle.startsWith('Discussion: ') : stryMutAct_9fa48("20507") ? false : stryMutAct_9fa48("20506") ? true : (stryCov_9fa48("20506", "20507", "20508"), threadTitle && (stryMutAct_9fa48("20509") ? threadTitle.endsWith('Discussion: ') : (stryCov_9fa48("20509"), threadTitle.startsWith(stryMutAct_9fa48("20510") ? "" : (stryCov_9fa48("20510"), 'Discussion: ')))));
      }
    };

    // Helper function to extract article info from thread messages
    const getArticleInfoFromThread = () => {
      if (stryMutAct_9fa48("20511")) {
        {}
      } else {
        stryCov_9fa48("20511");
        if (stryMutAct_9fa48("20514") ? false : stryMutAct_9fa48("20513") ? true : stryMutAct_9fa48("20512") ? messages.length : (stryCov_9fa48("20512", "20513", "20514"), !messages.length)) return null;

        // Look for the assistant's welcome message that contains article info
        const welcomeMessage = messages.find(stryMutAct_9fa48("20515") ? () => undefined : (stryCov_9fa48("20515"), msg => stryMutAct_9fa48("20518") ? getMessageRole(msg) === 'assistant' && msg.content && msg.content.includes('**Article:**') || msg.content.includes('**URL:**') : stryMutAct_9fa48("20517") ? false : stryMutAct_9fa48("20516") ? true : (stryCov_9fa48("20516", "20517", "20518"), (stryMutAct_9fa48("20520") ? getMessageRole(msg) === 'assistant' && msg.content || msg.content.includes('**Article:**') : stryMutAct_9fa48("20519") ? true : (stryCov_9fa48("20519", "20520"), (stryMutAct_9fa48("20522") ? getMessageRole(msg) === 'assistant' || msg.content : stryMutAct_9fa48("20521") ? true : (stryCov_9fa48("20521", "20522"), (stryMutAct_9fa48("20524") ? getMessageRole(msg) !== 'assistant' : stryMutAct_9fa48("20523") ? true : (stryCov_9fa48("20523", "20524"), getMessageRole(msg) === (stryMutAct_9fa48("20525") ? "" : (stryCov_9fa48("20525"), 'assistant')))) && msg.content)) && msg.content.includes(stryMutAct_9fa48("20526") ? "" : (stryCov_9fa48("20526"), '**Article:**')))) && msg.content.includes(stryMutAct_9fa48("20527") ? "" : (stryCov_9fa48("20527"), '**URL:**')))));
        if (stryMutAct_9fa48("20529") ? false : stryMutAct_9fa48("20528") ? true : (stryCov_9fa48("20528", "20529"), welcomeMessage)) {
          if (stryMutAct_9fa48("20530")) {
            {}
          } else {
            stryCov_9fa48("20530");
            // Extract URL and title from the welcome message
            const urlMatch = welcomeMessage.content.match(stryMutAct_9fa48("20531") ? /\*\*URL:\*\* (.)/ : (stryCov_9fa48("20531"), /\*\*URL:\*\* (.+)/));
            const titleMatch = welcomeMessage.content.match(stryMutAct_9fa48("20532") ? /\*\*Article:\*\* (.)/ : (stryCov_9fa48("20532"), /\*\*Article:\*\* (.+)/));
            if (stryMutAct_9fa48("20535") ? urlMatch || titleMatch : stryMutAct_9fa48("20534") ? false : stryMutAct_9fa48("20533") ? true : (stryCov_9fa48("20533", "20534", "20535"), urlMatch && titleMatch)) {
              if (stryMutAct_9fa48("20536")) {
                {}
              } else {
                stryCov_9fa48("20536");
                return stryMutAct_9fa48("20537") ? {} : (stryCov_9fa48("20537"), {
                  url: stryMutAct_9fa48("20538") ? urlMatch[1] : (stryCov_9fa48("20538"), urlMatch[1].trim()),
                  title: stryMutAct_9fa48("20539") ? titleMatch[1] : (stryCov_9fa48("20539"), titleMatch[1].trim())
                });
              }
            }
          }
        }
        return null;
      }
    };

    // Helper function to check if we should show summary button
    const shouldShowSummaryButton = () => {
      if (stryMutAct_9fa48("20540")) {
        {}
      } else {
        stryCov_9fa48("20540");
        // Show if we have summary data for current thread
        if (stryMutAct_9fa48("20543") ? currentThreadSummary || String(activeThread) === String(summaryThreadId) : stryMutAct_9fa48("20542") ? false : stryMutAct_9fa48("20541") ? true : (stryCov_9fa48("20541", "20542", "20543"), currentThreadSummary && (stryMutAct_9fa48("20545") ? String(activeThread) !== String(summaryThreadId) : stryMutAct_9fa48("20544") ? true : (stryCov_9fa48("20544", "20545"), String(activeThread) === String(summaryThreadId))))) {
          if (stryMutAct_9fa48("20546")) {
            {}
          } else {
            stryCov_9fa48("20546");
            return stryMutAct_9fa48("20547") ? false : (stryCov_9fa48("20547"), true);
          }
        }

        // Show if current thread is an article discussion (even without summary data)
        if (stryMutAct_9fa48("20550") ? isArticleDiscussionThread() || getArticleInfoFromThread() : stryMutAct_9fa48("20549") ? false : stryMutAct_9fa48("20548") ? true : (stryCov_9fa48("20548", "20549", "20550"), isArticleDiscussionThread() && getArticleInfoFromThread())) {
          if (stryMutAct_9fa48("20551")) {
            {}
          } else {
            stryCov_9fa48("20551");
            return stryMutAct_9fa48("20552") ? false : (stryCov_9fa48("20552"), true);
          }
        }
        return stryMutAct_9fa48("20553") ? true : (stryCov_9fa48("20553"), false);
      }
    };

    // Helper function to get current article info (from summary or thread)
    const getCurrentArticleInfo = () => {
      if (stryMutAct_9fa48("20554")) {
        {}
      } else {
        stryCov_9fa48("20554");
        // First check if we have summary data
        if (stryMutAct_9fa48("20557") ? currentThreadSummary || String(activeThread) === String(summaryThreadId) : stryMutAct_9fa48("20556") ? false : stryMutAct_9fa48("20555") ? true : (stryCov_9fa48("20555", "20556", "20557"), currentThreadSummary && (stryMutAct_9fa48("20559") ? String(activeThread) !== String(summaryThreadId) : stryMutAct_9fa48("20558") ? true : (stryCov_9fa48("20558", "20559"), String(activeThread) === String(summaryThreadId))))) {
          if (stryMutAct_9fa48("20560")) {
            {}
          } else {
            stryCov_9fa48("20560");
            return currentThreadSummary;
          }
        }

        // Otherwise try to extract from thread messages
        return getArticleInfoFromThread();
      }
    };

    // Helper function to get summary data for modal (prioritizes modal-specific data)
    const getSummaryDataForModal = () => {
      if (stryMutAct_9fa48("20561")) {
        {}
      } else {
        stryCov_9fa48("20561");
        // First check if we have modal-specific summary data
        if (stryMutAct_9fa48("20563") ? false : stryMutAct_9fa48("20562") ? true : (stryCov_9fa48("20562", "20563"), modalSummaryData)) {
          if (stryMutAct_9fa48("20564")) {
            {}
          } else {
            stryCov_9fa48("20564");
            return modalSummaryData;
          }
        }

        // Fall back to current article info
        return getCurrentArticleInfo();
      }
    };

    // Helper function to check if the summary is for a YouTube video
    const isYouTubeVideo = url => {
      if (stryMutAct_9fa48("20565")) {
        {}
      } else {
        stryCov_9fa48("20565");
        if (stryMutAct_9fa48("20568") ? false : stryMutAct_9fa48("20567") ? true : stryMutAct_9fa48("20566") ? url : (stryCov_9fa48("20566", "20567", "20568"), !url)) return stryMutAct_9fa48("20569") ? true : (stryCov_9fa48("20569"), false);
        return stryMutAct_9fa48("20572") ? (url.includes('youtube.com/watch') || url.includes('youtu.be/') || url.includes('youtube.com/embed')) && url.includes('youtube.com/v/') : stryMutAct_9fa48("20571") ? false : stryMutAct_9fa48("20570") ? true : (stryCov_9fa48("20570", "20571", "20572"), (stryMutAct_9fa48("20574") ? (url.includes('youtube.com/watch') || url.includes('youtu.be/')) && url.includes('youtube.com/embed') : stryMutAct_9fa48("20573") ? false : (stryCov_9fa48("20573", "20574"), (stryMutAct_9fa48("20576") ? url.includes('youtube.com/watch') && url.includes('youtu.be/') : stryMutAct_9fa48("20575") ? false : (stryCov_9fa48("20575", "20576"), url.includes(stryMutAct_9fa48("20577") ? "" : (stryCov_9fa48("20577"), 'youtube.com/watch')) || url.includes(stryMutAct_9fa48("20578") ? "" : (stryCov_9fa48("20578"), 'youtu.be/')))) || url.includes(stryMutAct_9fa48("20579") ? "" : (stryCov_9fa48("20579"), 'youtube.com/embed')))) || url.includes(stryMutAct_9fa48("20580") ? "" : (stryCov_9fa48("20580"), 'youtube.com/v/')));
      }
    };

    // Helper function to open full summary modal
    const openSummaryModal = async () => {
      if (stryMutAct_9fa48("20581")) {
        {}
      } else {
        stryCov_9fa48("20581");
        const articleInfo = getCurrentArticleInfo();
        if (stryMutAct_9fa48("20584") ? false : stryMutAct_9fa48("20583") ? true : stryMutAct_9fa48("20582") ? articleInfo : (stryCov_9fa48("20582", "20583", "20584"), !articleInfo)) return;

        // If we already have summary data, just show the modal
        if (stryMutAct_9fa48("20586") ? false : stryMutAct_9fa48("20585") ? true : (stryCov_9fa48("20585", "20586"), articleInfo.summary)) {
          if (stryMutAct_9fa48("20587")) {
            {}
          } else {
            stryCov_9fa48("20587");
            setModalSummaryData(articleInfo);
            setShowSummaryModal(stryMutAct_9fa48("20588") ? false : (stryCov_9fa48("20588"), true));
            return;
          }
        }

        // If we don't have summary data, try to fetch it
        if (stryMutAct_9fa48("20591") ? articleInfo.url || articleInfo.title : stryMutAct_9fa48("20590") ? false : stryMutAct_9fa48("20589") ? true : (stryCov_9fa48("20589", "20590", "20591"), articleInfo.url && articleInfo.title)) {
          if (stryMutAct_9fa48("20592")) {
            {}
          } else {
            stryCov_9fa48("20592");
            // Check if user is active
            if (stryMutAct_9fa48("20595") ? false : stryMutAct_9fa48("20594") ? true : stryMutAct_9fa48("20593") ? user?.active : (stryCov_9fa48("20593", "20594", "20595"), !(stryMutAct_9fa48("20596") ? user.active : (stryCov_9fa48("20596"), user?.active)))) {
              if (stryMutAct_9fa48("20597")) {
                {}
              } else {
                stryCov_9fa48("20597");
                setError(stryMutAct_9fa48("20598") ? "" : (stryCov_9fa48("20598"), 'You have historical access only and cannot generate summaries.'));
                return;
              }
            }
            setSummaryLoading(stryMutAct_9fa48("20599") ? false : (stryCov_9fa48("20599"), true));
            setShowSummaryModal(stryMutAct_9fa48("20600") ? false : (stryCov_9fa48("20600"), true)); // Show modal with loading state

            try {
              if (stryMutAct_9fa48("20601")) {
                {}
              } else {
                stryCov_9fa48("20601");
                const response = await fetch(stryMutAct_9fa48("20602") ? `` : (stryCov_9fa48("20602"), `${import.meta.env.VITE_API_URL}/api/resources/summarize`), stryMutAct_9fa48("20603") ? {} : (stryCov_9fa48("20603"), {
                  method: stryMutAct_9fa48("20604") ? "" : (stryCov_9fa48("20604"), 'POST'),
                  headers: stryMutAct_9fa48("20605") ? {} : (stryCov_9fa48("20605"), {
                    'Content-Type': stryMutAct_9fa48("20606") ? "" : (stryCov_9fa48("20606"), 'application/json'),
                    'Authorization': stryMutAct_9fa48("20607") ? `` : (stryCov_9fa48("20607"), `Bearer ${token}`)
                  }),
                  body: JSON.stringify(stryMutAct_9fa48("20608") ? {} : (stryCov_9fa48("20608"), {
                    url: articleInfo.url,
                    title: articleInfo.title
                  }))
                }));
                if (stryMutAct_9fa48("20611") ? false : stryMutAct_9fa48("20610") ? true : stryMutAct_9fa48("20609") ? response.ok : (stryCov_9fa48("20609", "20610", "20611"), !response.ok)) {
                  if (stryMutAct_9fa48("20612")) {
                    {}
                  } else {
                    stryCov_9fa48("20612");
                    const errorData = await response.json();
                    throw new Error(stryMutAct_9fa48("20615") ? (errorData.details || errorData.error) && 'Failed to generate summary' : stryMutAct_9fa48("20614") ? false : stryMutAct_9fa48("20613") ? true : (stryCov_9fa48("20613", "20614", "20615"), (stryMutAct_9fa48("20617") ? errorData.details && errorData.error : stryMutAct_9fa48("20616") ? false : (stryCov_9fa48("20616", "20617"), errorData.details || errorData.error)) || (stryMutAct_9fa48("20618") ? "" : (stryCov_9fa48("20618"), 'Failed to generate summary'))));
                  }
                }
                const summaryData = await response.json();

                // Set modal summary data for display
                setModalSummaryData(stryMutAct_9fa48("20619") ? {} : (stryCov_9fa48("20619"), {
                  url: articleInfo.url,
                  title: articleInfo.title,
                  summary: summaryData.summary,
                  cached: summaryData.cached
                }));

                // Also update the current thread summary if this is from URL parameters
                if (stryMutAct_9fa48("20622") ? String(activeThread) !== String(summaryThreadId) : stryMutAct_9fa48("20621") ? false : stryMutAct_9fa48("20620") ? true : (stryCov_9fa48("20620", "20621", "20622"), String(activeThread) === String(summaryThreadId))) {
                  if (stryMutAct_9fa48("20623")) {
                    {}
                  } else {
                    stryCov_9fa48("20623");
                    setCurrentThreadSummary(stryMutAct_9fa48("20624") ? {} : (stryCov_9fa48("20624"), {
                      ...currentThreadSummary,
                      summary: summaryData.summary,
                      cached: summaryData.cached
                    }));
                  }
                }
              }
            } catch (error) {
              if (stryMutAct_9fa48("20625")) {
                {}
              } else {
                stryCov_9fa48("20625");
                console.error(stryMutAct_9fa48("20626") ? "" : (stryCov_9fa48("20626"), 'Error fetching summary:'), error);
                setError(stryMutAct_9fa48("20627") ? `` : (stryCov_9fa48("20627"), `Failed to load summary: ${error.message}`));
              }
            } finally {
              if (stryMutAct_9fa48("20628")) {
                {}
              } else {
                stryCov_9fa48("20628");
                setSummaryLoading(stryMutAct_9fa48("20629") ? true : (stryCov_9fa48("20629"), false));
              }
            }
          }
        } else {
          if (stryMutAct_9fa48("20630")) {
            {}
          } else {
            stryCov_9fa48("20630");
            // Just show modal even without summary data
            setShowSummaryModal(stryMutAct_9fa48("20631") ? false : (stryCov_9fa48("20631"), true));
          }
        }
      }
    };

    // Helper function to close summary modal
    const closeSummaryModal = () => {
      if (stryMutAct_9fa48("20632")) {
        {}
      } else {
        stryCov_9fa48("20632");
        setShowSummaryModal(stryMutAct_9fa48("20633") ? true : (stryCov_9fa48("20633"), false));
        setModalSummaryData(null); // Clear modal-specific data
      }
    };

    // Upload handling functions
    const handleFileUpload = async file => {
      if (stryMutAct_9fa48("20634")) {
        {}
      } else {
        stryCov_9fa48("20634");
        if (stryMutAct_9fa48("20637") ? false : stryMutAct_9fa48("20636") ? true : stryMutAct_9fa48("20635") ? user?.active : (stryCov_9fa48("20635", "20636", "20637"), !(stryMutAct_9fa48("20638") ? user.active : (stryCov_9fa48("20638"), user?.active)))) {
          if (stryMutAct_9fa48("20639")) {
            {}
          } else {
            stryCov_9fa48("20639");
            setError(stryMutAct_9fa48("20640") ? "" : (stryCov_9fa48("20640"), 'You have historical access only and cannot upload files.'));
            return;
          }
        }
        if (stryMutAct_9fa48("20643") ? false : stryMutAct_9fa48("20642") ? true : stryMutAct_9fa48("20641") ? activeThread : (stryCov_9fa48("20641", "20642", "20643"), !activeThread)) {
          if (stryMutAct_9fa48("20644")) {
            {}
          } else {
            stryCov_9fa48("20644");
            setError(stryMutAct_9fa48("20645") ? "" : (stryCov_9fa48("20645"), 'Please select or create a conversation thread first.'));
            return;
          }
        }

        // Add file size validation (50MB limit)
        const maxFileSize = stryMutAct_9fa48("20646") ? 50 * 1024 / 1024 : (stryCov_9fa48("20646"), (stryMutAct_9fa48("20647") ? 50 / 1024 : (stryCov_9fa48("20647"), 50 * 1024)) * 1024); // 50MB in bytes
        if (stryMutAct_9fa48("20651") ? file.size <= maxFileSize : stryMutAct_9fa48("20650") ? file.size >= maxFileSize : stryMutAct_9fa48("20649") ? false : stryMutAct_9fa48("20648") ? true : (stryCov_9fa48("20648", "20649", "20650", "20651"), file.size > maxFileSize)) {
          if (stryMutAct_9fa48("20652")) {
            {}
          } else {
            stryCov_9fa48("20652");
            setError(stryMutAct_9fa48("20653") ? `` : (stryCov_9fa48("20653"), `File size too large. Please upload files smaller than 50MB. Your file is ${(stryMutAct_9fa48("20654") ? file.size * (1024 * 1024) : (stryCov_9fa48("20654"), file.size / (stryMutAct_9fa48("20655") ? 1024 / 1024 : (stryCov_9fa48("20655"), 1024 * 1024)))).toFixed(1)}MB.`));
            return;
          }
        }
        setIsProcessingUpload(stryMutAct_9fa48("20656") ? false : (stryCov_9fa48("20656"), true));
        setProcessingFileName(file.name);
        setProcessingStep(stryMutAct_9fa48("20657") ? "" : (stryCov_9fa48("20657"), 'Uploading file...'));
        setShowUploadDropdown(stryMutAct_9fa48("20658") ? true : (stryCov_9fa48("20658"), false));
        try {
          if (stryMutAct_9fa48("20659")) {
            {}
          } else {
            stryCov_9fa48("20659");
            const formData = new FormData();
            formData.append(stryMutAct_9fa48("20660") ? "" : (stryCov_9fa48("20660"), 'file'), file);
            formData.append(stryMutAct_9fa48("20661") ? "" : (stryCov_9fa48("20661"), 'title'), stryMutAct_9fa48("20662") ? `` : (stryCov_9fa48("20662"), `${file.name} Summary`));
            setProcessingStep(stryMutAct_9fa48("20663") ? "" : (stryCov_9fa48("20663"), 'Processing content...'));
            const response = await fetch(stryMutAct_9fa48("20664") ? `` : (stryCov_9fa48("20664"), `${import.meta.env.VITE_API_URL}/api/resources/summarize`), stryMutAct_9fa48("20665") ? {} : (stryCov_9fa48("20665"), {
              method: stryMutAct_9fa48("20666") ? "" : (stryCov_9fa48("20666"), 'POST'),
              headers: stryMutAct_9fa48("20667") ? {} : (stryCov_9fa48("20667"), {
                'Authorization': stryMutAct_9fa48("20668") ? `` : (stryCov_9fa48("20668"), `Bearer ${token}`)
              }),
              body: formData
            }));
            if (stryMutAct_9fa48("20671") ? false : stryMutAct_9fa48("20670") ? true : stryMutAct_9fa48("20669") ? response.ok : (stryCov_9fa48("20669", "20670", "20671"), !response.ok)) {
              if (stryMutAct_9fa48("20672")) {
                {}
              } else {
                stryCov_9fa48("20672");
                let errorMessage = stryMutAct_9fa48("20673") ? "" : (stryCov_9fa48("20673"), 'Failed to process file');
                try {
                  if (stryMutAct_9fa48("20674")) {
                    {}
                  } else {
                    stryCov_9fa48("20674");
                    // Try to parse as JSON first
                    const errorData = await response.json();
                    errorMessage = stryMutAct_9fa48("20677") ? (errorData.details || errorData.error) && `Server error: ${response.status}` : stryMutAct_9fa48("20676") ? false : stryMutAct_9fa48("20675") ? true : (stryCov_9fa48("20675", "20676", "20677"), (stryMutAct_9fa48("20679") ? errorData.details && errorData.error : stryMutAct_9fa48("20678") ? false : (stryCov_9fa48("20678", "20679"), errorData.details || errorData.error)) || (stryMutAct_9fa48("20680") ? `` : (stryCov_9fa48("20680"), `Server error: ${response.status}`)));
                  }
                } catch (parseError) {
                  if (stryMutAct_9fa48("20681")) {
                    {}
                  } else {
                    stryCov_9fa48("20681");
                    // If JSON parsing fails, it might be an HTML error page
                    const textResponse = await response.text();
                    if (stryMutAct_9fa48("20684") ? response.status !== 500 : stryMutAct_9fa48("20683") ? false : stryMutAct_9fa48("20682") ? true : (stryCov_9fa48("20682", "20683", "20684"), response.status === 500)) {
                      if (stryMutAct_9fa48("20685")) {
                        {}
                      } else {
                        stryCov_9fa48("20685");
                        if (stryMutAct_9fa48("20689") ? file.size <= 10 * 1024 * 1024 : stryMutAct_9fa48("20688") ? file.size >= 10 * 1024 * 1024 : stryMutAct_9fa48("20687") ? false : stryMutAct_9fa48("20686") ? true : (stryCov_9fa48("20686", "20687", "20688", "20689"), file.size > (stryMutAct_9fa48("20690") ? 10 * 1024 / 1024 : (stryCov_9fa48("20690"), (stryMutAct_9fa48("20691") ? 10 / 1024 : (stryCov_9fa48("20691"), 10 * 1024)) * 1024)))) {
                          if (stryMutAct_9fa48("20692")) {
                            {}
                          } else {
                            stryCov_9fa48("20692");
                            // 10MB
                            errorMessage = stryMutAct_9fa48("20693") ? `` : (stryCov_9fa48("20693"), `File too large or complex to process. Try uploading a smaller file or splitting large documents into sections.`);
                          }
                        } else {
                          if (stryMutAct_9fa48("20694")) {
                            {}
                          } else {
                            stryCov_9fa48("20694");
                            errorMessage = stryMutAct_9fa48("20695") ? `` : (stryCov_9fa48("20695"), `Server error while processing file. The file might be corrupted or in an unsupported format.`);
                          }
                        }
                      }
                    } else if (stryMutAct_9fa48("20698") ? response.status !== 413 : stryMutAct_9fa48("20697") ? false : stryMutAct_9fa48("20696") ? true : (stryCov_9fa48("20696", "20697", "20698"), response.status === 413)) {
                      if (stryMutAct_9fa48("20699")) {
                        {}
                      } else {
                        stryCov_9fa48("20699");
                        errorMessage = stryMutAct_9fa48("20700") ? `` : (stryCov_9fa48("20700"), `File too large. Please upload files smaller than 50MB.`);
                      }
                    } else if (stryMutAct_9fa48("20703") ? response.status !== 415 : stryMutAct_9fa48("20702") ? false : stryMutAct_9fa48("20701") ? true : (stryCov_9fa48("20701", "20702", "20703"), response.status === 415)) {
                      if (stryMutAct_9fa48("20704")) {
                        {}
                      } else {
                        stryCov_9fa48("20704");
                        errorMessage = stryMutAct_9fa48("20705") ? `` : (stryCov_9fa48("20705"), `Unsupported file type. Please upload PDF, TXT, MD, or DOCX files.`);
                      }
                    } else {
                      if (stryMutAct_9fa48("20706")) {
                        {}
                      } else {
                        stryCov_9fa48("20706");
                        errorMessage = stryMutAct_9fa48("20707") ? `` : (stryCov_9fa48("20707"), `Server error (${response.status}). Please try again or contact support if the problem persists.`);
                      }
                    }
                    console.error(stryMutAct_9fa48("20708") ? "" : (stryCov_9fa48("20708"), 'Server returned non-JSON response:'), stryMutAct_9fa48("20709") ? textResponse : (stryCov_9fa48("20709"), textResponse.substring(0, 200)));
                  }
                }
                throw new Error(errorMessage);
              }
            }
            setProcessingStep(stryMutAct_9fa48("20710") ? "" : (stryCov_9fa48("20710"), 'Generating summary...'));
            const summaryData = await response.json();
            setProcessingStep(stryMutAct_9fa48("20711") ? "" : (stryCov_9fa48("20711"), 'Finalizing...'));

            // Add a hidden system message for AI context (not visible to user)
            const hiddenSummaryMessage = stryMutAct_9fa48("20712") ? `` : (stryCov_9fa48("20712"), `File uploaded: ${file.name}\nSummary: ${summaryData.summary}`);

            // Send the summary to the backend as a system message for AI context
            try {
              if (stryMutAct_9fa48("20713")) {
                {}
              } else {
                stryCov_9fa48("20713");
                await fetch(stryMutAct_9fa48("20714") ? `` : (stryCov_9fa48("20714"), `${import.meta.env.VITE_API_URL}/api/chat/messages`), stryMutAct_9fa48("20715") ? {} : (stryCov_9fa48("20715"), {
                  method: stryMutAct_9fa48("20716") ? "" : (stryCov_9fa48("20716"), 'POST'),
                  headers: stryMutAct_9fa48("20717") ? {} : (stryCov_9fa48("20717"), {
                    'Content-Type': stryMutAct_9fa48("20718") ? "" : (stryCov_9fa48("20718"), 'application/json'),
                    'Authorization': stryMutAct_9fa48("20719") ? `` : (stryCov_9fa48("20719"), `Bearer ${token}`)
                  }),
                  body: JSON.stringify(stryMutAct_9fa48("20720") ? {} : (stryCov_9fa48("20720"), {
                    content: hiddenSummaryMessage,
                    threadId: activeThread,
                    messageType: stryMutAct_9fa48("20721") ? "" : (stryCov_9fa48("20721"), 'system_content_summary') // Special type for system messages
                  }))
                }));
              }
            } catch (err) {
              if (stryMutAct_9fa48("20722")) {
                {}
              } else {
                stryCov_9fa48("20722");
                console.warn(stryMutAct_9fa48("20723") ? "" : (stryCov_9fa48("20723"), 'Failed to send system message, continuing anyway:'), err);
              }
            }

            // Add content source as a special message-like component (UI only, not stored as message)
            const contentSourceMessage = stryMutAct_9fa48("20724") ? {} : (stryCov_9fa48("20724"), {
              message_id: Date.now(),
              content: null,
              // No content, this is a special component
              message_role: stryMutAct_9fa48("20725") ? "" : (stryCov_9fa48("20725"), 'content_source'),
              created_at: new Date().toISOString(),
              contentSource: stryMutAct_9fa48("20726") ? {} : (stryCov_9fa48("20726"), {
                id: Date.now(),
                type: stryMutAct_9fa48("20727") ? "" : (stryCov_9fa48("20727"), 'file'),
                title: summaryData.title,
                summary: summaryData.summary,
                fileName: file.name,
                contentType: stryMutAct_9fa48("20730") ? summaryData.contentType && 'document' : stryMutAct_9fa48("20729") ? false : stryMutAct_9fa48("20728") ? true : (stryCov_9fa48("20728", "20729", "20730"), summaryData.contentType || (stryMutAct_9fa48("20731") ? "" : (stryCov_9fa48("20731"), 'document'))),
                processedAt: summaryData.created_at
              })
            });
            setMessages(stryMutAct_9fa48("20732") ? () => undefined : (stryCov_9fa48("20732"), prevMessages => stryMutAct_9fa48("20733") ? [] : (stryCov_9fa48("20733"), [...prevMessages, contentSourceMessage])));

            // Store the file summary in content sources for reference
            setContentSources(stryMutAct_9fa48("20734") ? () => undefined : (stryCov_9fa48("20734"), prev => stryMutAct_9fa48("20735") ? {} : (stryCov_9fa48("20735"), {
              ...prev,
              [activeThread]: stryMutAct_9fa48("20736") ? [] : (stryCov_9fa48("20736"), [...(stryMutAct_9fa48("20739") ? prev[activeThread] && [] : stryMutAct_9fa48("20738") ? false : stryMutAct_9fa48("20737") ? true : (stryCov_9fa48("20737", "20738", "20739"), prev[activeThread] || (stryMutAct_9fa48("20740") ? ["Stryker was here"] : (stryCov_9fa48("20740"), [])))), contentSourceMessage.contentSource])
            })));

            // Refresh threads to update title (especially for new threads)
            setTimeout(() => {
              if (stryMutAct_9fa48("20741")) {
                {}
              } else {
                stryCov_9fa48("20741");
                fetchThreads();
              }
            }, 1000);
          }
        } catch (error) {
          if (stryMutAct_9fa48("20742")) {
            {}
          } else {
            stryCov_9fa48("20742");
            console.error(stryMutAct_9fa48("20743") ? "" : (stryCov_9fa48("20743"), 'Error processing file:'), error);
            setError(stryMutAct_9fa48("20744") ? `` : (stryCov_9fa48("20744"), `Failed to process file: ${error.message}`));
          }
        } finally {
          if (stryMutAct_9fa48("20745")) {
            {}
          } else {
            stryCov_9fa48("20745");
            setIsProcessingUpload(stryMutAct_9fa48("20746") ? true : (stryCov_9fa48("20746"), false));
            setProcessingFileName(stryMutAct_9fa48("20747") ? "Stryker was here!" : (stryCov_9fa48("20747"), ''));
            setProcessingStep(stryMutAct_9fa48("20748") ? "Stryker was here!" : (stryCov_9fa48("20748"), ''));
          }
        }
      }
    };
    const handleUrlSubmit = async () => {
      if (stryMutAct_9fa48("20749")) {
        {}
      } else {
        stryCov_9fa48("20749");
        if (stryMutAct_9fa48("20752") ? false : stryMutAct_9fa48("20751") ? true : stryMutAct_9fa48("20750") ? urlInput.trim() : (stryCov_9fa48("20750", "20751", "20752"), !(stryMutAct_9fa48("20753") ? urlInput : (stryCov_9fa48("20753"), urlInput.trim())))) return;
        if (stryMutAct_9fa48("20756") ? false : stryMutAct_9fa48("20755") ? true : stryMutAct_9fa48("20754") ? user?.active : (stryCov_9fa48("20754", "20755", "20756"), !(stryMutAct_9fa48("20757") ? user.active : (stryCov_9fa48("20757"), user?.active)))) {
          if (stryMutAct_9fa48("20758")) {
            {}
          } else {
            stryCov_9fa48("20758");
            setError(stryMutAct_9fa48("20759") ? "" : (stryCov_9fa48("20759"), 'You have historical access only and cannot process URLs.'));
            return;
          }
        }
        if (stryMutAct_9fa48("20762") ? false : stryMutAct_9fa48("20761") ? true : stryMutAct_9fa48("20760") ? activeThread : (stryCov_9fa48("20760", "20761", "20762"), !activeThread)) {
          if (stryMutAct_9fa48("20763")) {
            {}
          } else {
            stryCov_9fa48("20763");
            setError(stryMutAct_9fa48("20764") ? "" : (stryCov_9fa48("20764"), 'Please select or create a conversation thread first.'));
            return;
          }
        }
        setIsProcessingUpload(stryMutAct_9fa48("20765") ? false : (stryCov_9fa48("20765"), true));
        setProcessingUrl(urlInput);
        setProcessingStep(stryMutAct_9fa48("20766") ? "" : (stryCov_9fa48("20766"), 'Analyzing URL...'));
        setShowUrlInput(stryMutAct_9fa48("20767") ? true : (stryCov_9fa48("20767"), false));
        setShowUploadDropdown(stryMutAct_9fa48("20768") ? true : (stryCov_9fa48("20768"), false));
        try {
          if (stryMutAct_9fa48("20769")) {
            {}
          } else {
            stryCov_9fa48("20769");
            setProcessingStep(stryMutAct_9fa48("20770") ? "" : (stryCov_9fa48("20770"), 'Extracting content...'));
            const response = await fetch(stryMutAct_9fa48("20771") ? `` : (stryCov_9fa48("20771"), `${import.meta.env.VITE_API_URL}/api/resources/summarize`), stryMutAct_9fa48("20772") ? {} : (stryCov_9fa48("20772"), {
              method: stryMutAct_9fa48("20773") ? "" : (stryCov_9fa48("20773"), 'POST'),
              headers: stryMutAct_9fa48("20774") ? {} : (stryCov_9fa48("20774"), {
                'Content-Type': stryMutAct_9fa48("20775") ? "" : (stryCov_9fa48("20775"), 'application/json'),
                'Authorization': stryMutAct_9fa48("20776") ? `` : (stryCov_9fa48("20776"), `Bearer ${token}`)
              }),
              body: JSON.stringify(stryMutAct_9fa48("20777") ? {} : (stryCov_9fa48("20777"), {
                url: urlInput
              }))
            }));
            if (stryMutAct_9fa48("20780") ? false : stryMutAct_9fa48("20779") ? true : stryMutAct_9fa48("20778") ? response.ok : (stryCov_9fa48("20778", "20779", "20780"), !response.ok)) {
              if (stryMutAct_9fa48("20781")) {
                {}
              } else {
                stryCov_9fa48("20781");
                let errorMessage = stryMutAct_9fa48("20782") ? "" : (stryCov_9fa48("20782"), 'Failed to process URL');
                try {
                  if (stryMutAct_9fa48("20783")) {
                    {}
                  } else {
                    stryCov_9fa48("20783");
                    // Try to parse as JSON first
                    const errorData = await response.json();
                    errorMessage = stryMutAct_9fa48("20786") ? (errorData.details || errorData.error) && `Server error: ${response.status}` : stryMutAct_9fa48("20785") ? false : stryMutAct_9fa48("20784") ? true : (stryCov_9fa48("20784", "20785", "20786"), (stryMutAct_9fa48("20788") ? errorData.details && errorData.error : stryMutAct_9fa48("20787") ? false : (stryCov_9fa48("20787", "20788"), errorData.details || errorData.error)) || (stryMutAct_9fa48("20789") ? `` : (stryCov_9fa48("20789"), `Server error: ${response.status}`)));
                  }
                } catch (parseError) {
                  if (stryMutAct_9fa48("20790")) {
                    {}
                  } else {
                    stryCov_9fa48("20790");
                    // If JSON parsing fails, it might be an HTML error page
                    const textResponse = await response.text();
                    if (stryMutAct_9fa48("20793") ? response.status !== 500 : stryMutAct_9fa48("20792") ? false : stryMutAct_9fa48("20791") ? true : (stryCov_9fa48("20791", "20792", "20793"), response.status === 500)) {
                      if (stryMutAct_9fa48("20794")) {
                        {}
                      } else {
                        stryCov_9fa48("20794");
                        errorMessage = stryMutAct_9fa48("20795") ? `` : (stryCov_9fa48("20795"), `Server error while processing URL. The content might be too large, restricted, or in an unsupported format.`);
                      }
                    } else if (stryMutAct_9fa48("20798") ? response.status !== 404 : stryMutAct_9fa48("20797") ? false : stryMutAct_9fa48("20796") ? true : (stryCov_9fa48("20796", "20797", "20798"), response.status === 404)) {
                      if (stryMutAct_9fa48("20799")) {
                        {}
                      } else {
                        stryCov_9fa48("20799");
                        errorMessage = stryMutAct_9fa48("20800") ? `` : (stryCov_9fa48("20800"), `URL not found or inaccessible. Please check the URL and try again.`);
                      }
                    } else if (stryMutAct_9fa48("20803") ? response.status !== 403 : stryMutAct_9fa48("20802") ? false : stryMutAct_9fa48("20801") ? true : (stryCov_9fa48("20801", "20802", "20803"), response.status === 403)) {
                      if (stryMutAct_9fa48("20804")) {
                        {}
                      } else {
                        stryCov_9fa48("20804");
                        errorMessage = stryMutAct_9fa48("20805") ? `` : (stryCov_9fa48("20805"), `Access denied. The content might be behind a paywall or login required.`);
                      }
                    } else {
                      if (stryMutAct_9fa48("20806")) {
                        {}
                      } else {
                        stryCov_9fa48("20806");
                        errorMessage = stryMutAct_9fa48("20807") ? `` : (stryCov_9fa48("20807"), `Server error (${response.status}). Please try again or contact support if the problem persists.`);
                      }
                    }
                    console.error(stryMutAct_9fa48("20808") ? "" : (stryCov_9fa48("20808"), 'Server returned non-JSON response:'), stryMutAct_9fa48("20809") ? textResponse : (stryCov_9fa48("20809"), textResponse.substring(0, 200)));
                  }
                }
                throw new Error(errorMessage);
              }
            }
            setProcessingStep(stryMutAct_9fa48("20810") ? "" : (stryCov_9fa48("20810"), 'Generating summary...'));
            const summaryData = await response.json();
            setProcessingStep(stryMutAct_9fa48("20811") ? "" : (stryCov_9fa48("20811"), 'Finalizing...'));

            // Add a hidden system message for AI context
            const isVideo = stryMutAct_9fa48("20814") ? urlInput.includes('youtube.com') && urlInput.includes('youtu.be') : stryMutAct_9fa48("20813") ? false : stryMutAct_9fa48("20812") ? true : (stryCov_9fa48("20812", "20813", "20814"), urlInput.includes(stryMutAct_9fa48("20815") ? "" : (stryCov_9fa48("20815"), 'youtube.com')) || urlInput.includes(stryMutAct_9fa48("20816") ? "" : (stryCov_9fa48("20816"), 'youtu.be')));
            const type = isVideo ? stryMutAct_9fa48("20817") ? "" : (stryCov_9fa48("20817"), 'Video') : stryMutAct_9fa48("20818") ? "" : (stryCov_9fa48("20818"), 'Article');
            const hiddenSummaryMessage = stryMutAct_9fa48("20819") ? `` : (stryCov_9fa48("20819"), `${type} processed: ${summaryData.title}\nURL: ${urlInput}\nSummary: ${summaryData.summary}`);

            // Send the summary to the backend as a system message for AI context
            try {
              if (stryMutAct_9fa48("20820")) {
                {}
              } else {
                stryCov_9fa48("20820");
                await fetch(stryMutAct_9fa48("20821") ? `` : (stryCov_9fa48("20821"), `${import.meta.env.VITE_API_URL}/api/chat/messages`), stryMutAct_9fa48("20822") ? {} : (stryCov_9fa48("20822"), {
                  method: stryMutAct_9fa48("20823") ? "" : (stryCov_9fa48("20823"), 'POST'),
                  headers: stryMutAct_9fa48("20824") ? {} : (stryCov_9fa48("20824"), {
                    'Content-Type': stryMutAct_9fa48("20825") ? "" : (stryCov_9fa48("20825"), 'application/json'),
                    'Authorization': stryMutAct_9fa48("20826") ? `` : (stryCov_9fa48("20826"), `Bearer ${token}`)
                  }),
                  body: JSON.stringify(stryMutAct_9fa48("20827") ? {} : (stryCov_9fa48("20827"), {
                    content: hiddenSummaryMessage,
                    threadId: activeThread,
                    messageType: stryMutAct_9fa48("20828") ? "" : (stryCov_9fa48("20828"), 'system_content_summary')
                  }))
                }));
              }
            } catch (err) {
              if (stryMutAct_9fa48("20829")) {
                {}
              } else {
                stryCov_9fa48("20829");
                console.warn(stryMutAct_9fa48("20830") ? "" : (stryCov_9fa48("20830"), 'Failed to send system message, continuing anyway:'), err);
              }
            }

            // Add content source as a special message-like component
            const contentSourceMessage = stryMutAct_9fa48("20831") ? {} : (stryCov_9fa48("20831"), {
              message_id: Date.now(),
              content: null,
              message_role: stryMutAct_9fa48("20832") ? "" : (stryCov_9fa48("20832"), 'content_source'),
              created_at: new Date().toISOString(),
              contentSource: stryMutAct_9fa48("20833") ? {} : (stryCov_9fa48("20833"), {
                id: Date.now(),
                type: stryMutAct_9fa48("20834") ? "" : (stryCov_9fa48("20834"), 'url'),
                title: summaryData.title,
                summary: summaryData.summary,
                url: urlInput,
                contentType: isVideo ? stryMutAct_9fa48("20835") ? "" : (stryCov_9fa48("20835"), 'video') : stryMutAct_9fa48("20836") ? "" : (stryCov_9fa48("20836"), 'article'),
                processedAt: summaryData.created_at,
                cached: summaryData.cached
              })
            });
            setMessages(stryMutAct_9fa48("20837") ? () => undefined : (stryCov_9fa48("20837"), prevMessages => stryMutAct_9fa48("20838") ? [] : (stryCov_9fa48("20838"), [...prevMessages, contentSourceMessage])));

            // Store the URL summary in content sources for reference
            setContentSources(stryMutAct_9fa48("20839") ? () => undefined : (stryCov_9fa48("20839"), prev => stryMutAct_9fa48("20840") ? {} : (stryCov_9fa48("20840"), {
              ...prev,
              [activeThread]: stryMutAct_9fa48("20841") ? [] : (stryCov_9fa48("20841"), [...(stryMutAct_9fa48("20844") ? prev[activeThread] && [] : stryMutAct_9fa48("20843") ? false : stryMutAct_9fa48("20842") ? true : (stryCov_9fa48("20842", "20843", "20844"), prev[activeThread] || (stryMutAct_9fa48("20845") ? ["Stryker was here"] : (stryCov_9fa48("20845"), [])))), contentSourceMessage.contentSource])
            })));
            setUrlInput(stryMutAct_9fa48("20846") ? "Stryker was here!" : (stryCov_9fa48("20846"), ''));

            // Refresh threads to update title (especially for new threads)
            setTimeout(() => {
              if (stryMutAct_9fa48("20847")) {
                {}
              } else {
                stryCov_9fa48("20847");
                fetchThreads();
              }
            }, 1000);
          }
        } catch (error) {
          if (stryMutAct_9fa48("20848")) {
            {}
          } else {
            stryCov_9fa48("20848");
            console.error(stryMutAct_9fa48("20849") ? "" : (stryCov_9fa48("20849"), 'Error processing URL:'), error);
            setError(stryMutAct_9fa48("20850") ? `` : (stryCov_9fa48("20850"), `Failed to process URL: ${error.message}`));
          }
        } finally {
          if (stryMutAct_9fa48("20851")) {
            {}
          } else {
            stryCov_9fa48("20851");
            setIsProcessingUpload(stryMutAct_9fa48("20852") ? true : (stryCov_9fa48("20852"), false));
            setProcessingUrl(stryMutAct_9fa48("20853") ? "Stryker was here!" : (stryCov_9fa48("20853"), ''));
            setProcessingStep(stryMutAct_9fa48("20854") ? "Stryker was here!" : (stryCov_9fa48("20854"), ''));
          }
        }
      }
    };
    const handleFileInputChange = e => {
      if (stryMutAct_9fa48("20855")) {
        {}
      } else {
        stryCov_9fa48("20855");
        const file = e.target.files[0];
        if (stryMutAct_9fa48("20857") ? false : stryMutAct_9fa48("20856") ? true : (stryCov_9fa48("20856", "20857"), file)) {
          if (stryMutAct_9fa48("20858")) {
            {}
          } else {
            stryCov_9fa48("20858");
            handleFileUpload(file);
          }
        }
        // Reset file input
        e.target.value = stryMutAct_9fa48("20859") ? "Stryker was here!" : (stryCov_9fa48("20859"), '');
      }
    };
    const toggleUploadDropdown = () => {
      if (stryMutAct_9fa48("20860")) {
        {}
      } else {
        stryCov_9fa48("20860");
        setShowUploadDropdown(stryMutAct_9fa48("20861") ? showUploadDropdown : (stryCov_9fa48("20861"), !showUploadDropdown));
        setShowUrlInput(stryMutAct_9fa48("20862") ? true : (stryCov_9fa48("20862"), false));
      }
    };
    const openFileDialog = () => {
      if (stryMutAct_9fa48("20863")) {
        {}
      } else {
        stryCov_9fa48("20863");
        setShowUploadDropdown(stryMutAct_9fa48("20864") ? true : (stryCov_9fa48("20864"), false));
        stryMutAct_9fa48("20865") ? fileInputRef.current.click() : (stryCov_9fa48("20865"), fileInputRef.current?.click());
      }
    };
    const openUrlInput = () => {
      if (stryMutAct_9fa48("20866")) {
        {}
      } else {
        stryCov_9fa48("20866");
        setShowUrlInput(stryMutAct_9fa48("20867") ? false : (stryCov_9fa48("20867"), true));
        setShowUploadDropdown(stryMutAct_9fa48("20868") ? true : (stryCov_9fa48("20868"), false));
      }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
      if (stryMutAct_9fa48("20869")) {
        {}
      } else {
        stryCov_9fa48("20869");
        const handleClickOutside = event => {
          if (stryMutAct_9fa48("20870")) {
            {}
          } else {
            stryCov_9fa48("20870");
            if (stryMutAct_9fa48("20873") ? uploadDropdownRef.current || !uploadDropdownRef.current.contains(event.target) : stryMutAct_9fa48("20872") ? false : stryMutAct_9fa48("20871") ? true : (stryCov_9fa48("20871", "20872", "20873"), uploadDropdownRef.current && (stryMutAct_9fa48("20874") ? uploadDropdownRef.current.contains(event.target) : (stryCov_9fa48("20874"), !uploadDropdownRef.current.contains(event.target))))) {
              if (stryMutAct_9fa48("20875")) {
                {}
              } else {
                stryCov_9fa48("20875");
                setShowUploadDropdown(stryMutAct_9fa48("20876") ? true : (stryCov_9fa48("20876"), false));
                setShowUrlInput(stryMutAct_9fa48("20877") ? true : (stryCov_9fa48("20877"), false));
              }
            }
          }
        };
        document.addEventListener(stryMutAct_9fa48("20878") ? "" : (stryCov_9fa48("20878"), 'mousedown'), handleClickOutside);
        return () => {
          if (stryMutAct_9fa48("20879")) {
            {}
          } else {
            stryCov_9fa48("20879");
            document.removeEventListener(stryMutAct_9fa48("20880") ? "" : (stryCov_9fa48("20880"), 'mousedown'), handleClickOutside);
          }
        };
      }
    }, stryMutAct_9fa48("20881") ? ["Stryker was here"] : (stryCov_9fa48("20881"), []));

    // Function to get current content sources for active thread
    const getCurrentContentSources = () => {
      if (stryMutAct_9fa48("20882")) {
        {}
      } else {
        stryCov_9fa48("20882");
        return stryMutAct_9fa48("20885") ? contentSources[activeThread] && [] : stryMutAct_9fa48("20884") ? false : stryMutAct_9fa48("20883") ? true : (stryCov_9fa48("20883", "20884", "20885"), contentSources[activeThread] || (stryMutAct_9fa48("20886") ? ["Stryker was here"] : (stryCov_9fa48("20886"), [])));
      }
    };

    // Function to show summary for a specific content source
    const showContentSummary = source => {
      if (stryMutAct_9fa48("20887")) {
        {}
      } else {
        stryCov_9fa48("20887");
        setModalSummaryData(stryMutAct_9fa48("20888") ? {} : (stryCov_9fa48("20888"), {
          title: (stryMutAct_9fa48("20891") ? source.type !== 'file' : stryMutAct_9fa48("20890") ? false : stryMutAct_9fa48("20889") ? true : (stryCov_9fa48("20889", "20890", "20891"), source.type === (stryMutAct_9fa48("20892") ? "" : (stryCov_9fa48("20892"), 'file')))) ? stryMutAct_9fa48("20893") ? `` : (stryCov_9fa48("20893"), `File Summary: ${source.fileName}`) : source.title,
          summary: source.summary,
          url: source.url,
          contentType: source.contentType,
          isAnalysis: stryMutAct_9fa48("20894") ? true : (stryCov_9fa48("20894"), false)
        }));
        setShowSummaryModal(stryMutAct_9fa48("20895") ? false : (stryCov_9fa48("20895"), true));
      }
    };
    return <div className="gpt">
      {stryMutAct_9fa48("20898") ? isInactiveUser || <div className="historical-access-banner">
          <p>Historical access mode: View past conversations only.</p>
        </div> : stryMutAct_9fa48("20897") ? false : stryMutAct_9fa48("20896") ? true : (stryCov_9fa48("20896", "20897", "20898"), isInactiveUser && <div className="historical-access-banner">
          <p>Historical access mode: View past conversations only.</p>
        </div>)}
      <div className="gpt__content">
        <div className="gpt__chat-container">
          <div className={stryMutAct_9fa48("20899") ? `` : (stryCov_9fa48("20899"), `gpt__sidebar ${(stryMutAct_9fa48("20900") ? sidebarVisible : (stryCov_9fa48("20900"), !sidebarVisible)) ? stryMutAct_9fa48("20901") ? "" : (stryCov_9fa48("20901"), 'gpt__sidebar--collapsed') : stryMutAct_9fa48("20902") ? "Stryker was here!" : (stryCov_9fa48("20902"), '')}`)}>
            <div className="gpt__sidebar-header">
              <h3 className="gpt__sidebar-title">Conversations</h3>
              <div className="gpt__sidebar-actions">
                <button className="gpt__new-thread-btn" onClick={handleCreateThread} title={isInactiveUser ? stryMutAct_9fa48("20903") ? "" : (stryCov_9fa48("20903"), "Cannot create new conversations in historical access mode") : stryMutAct_9fa48("20904") ? "" : (stryCov_9fa48("20904"), "New Conversation")} disabled={stryMutAct_9fa48("20907") ? isLoading && isInactiveUser : stryMutAct_9fa48("20906") ? false : stryMutAct_9fa48("20905") ? true : (stryCov_9fa48("20905", "20906", "20907"), isLoading || isInactiveUser)}>
                  <FaPlus size={14} />
                </button>
                {stryMutAct_9fa48("20910") ? sidebarVisible || <button className="gpt__toggle-sidebar-btn" onClick={() => setSidebarVisible(false)} title="Hide sidebar">
                    <FaChevronLeft size={14} />
                  </button> : stryMutAct_9fa48("20909") ? false : stryMutAct_9fa48("20908") ? true : (stryCov_9fa48("20908", "20909", "20910"), sidebarVisible && <button className="gpt__toggle-sidebar-btn" onClick={stryMutAct_9fa48("20911") ? () => undefined : (stryCov_9fa48("20911"), () => setSidebarVisible(stryMutAct_9fa48("20912") ? true : (stryCov_9fa48("20912"), false)))} title="Hide sidebar">
                    <FaChevronLeft size={14} />
                  </button>)}
              </div>
            </div>
            
            {stryMutAct_9fa48("20915") ? error || <div className="gpt__error">{error}</div> : stryMutAct_9fa48("20914") ? false : stryMutAct_9fa48("20913") ? true : (stryCov_9fa48("20913", "20914", "20915"), error && <div className="gpt__error">{error}</div>)}
            
            <div className="gpt__threads-list">
              {(stryMutAct_9fa48("20918") ? isLoading || threads.length === 0 : stryMutAct_9fa48("20917") ? false : stryMutAct_9fa48("20916") ? true : (stryCov_9fa48("20916", "20917", "20918"), isLoading && (stryMutAct_9fa48("20920") ? threads.length !== 0 : stryMutAct_9fa48("20919") ? true : (stryCov_9fa48("20919", "20920"), threads.length === 0)))) ? <div className="gpt__loading">Loading conversations...</div> : (stryMutAct_9fa48("20923") ? threads.length !== 0 : stryMutAct_9fa48("20922") ? false : stryMutAct_9fa48("20921") ? true : (stryCov_9fa48("20921", "20922", "20923"), threads.length === 0)) ? <div className="gpt__empty-threads">No conversations yet</div> : threads.map(stryMutAct_9fa48("20924") ? () => undefined : (stryCov_9fa48("20924"), thread => <div key={getThreadId(thread)} className={stryMutAct_9fa48("20925") ? `` : (stryCov_9fa48("20925"), `gpt__thread-item ${(stryMutAct_9fa48("20928") ? activeThread !== getThreadId(thread) : stryMutAct_9fa48("20927") ? false : stryMutAct_9fa48("20926") ? true : (stryCov_9fa48("20926", "20927", "20928"), activeThread === getThreadId(thread))) ? stryMutAct_9fa48("20929") ? "" : (stryCov_9fa48("20929"), 'gpt__thread-item--active') : stryMutAct_9fa48("20930") ? "Stryker was here!" : (stryCov_9fa48("20930"), '')}`)} onClick={stryMutAct_9fa48("20931") ? () => undefined : (stryCov_9fa48("20931"), () => handleThreadClick(getThreadId(thread)))}>
                    {getThreadTitle(thread)}
                  </div>))}
            </div>
          </div>
          <div className="gpt__chat-panel">
            {stryMutAct_9fa48("20934") ? !sidebarVisible || <button className="gpt__toggle-sidebar-btn" onClick={() => setSidebarVisible(true)} title="Show sidebar">
                <FaChevronLeft size={14} style={{
                transform: 'rotate(180deg)'
              }} />
              </button> : stryMutAct_9fa48("20933") ? false : stryMutAct_9fa48("20932") ? true : (stryCov_9fa48("20932", "20933", "20934"), (stryMutAct_9fa48("20935") ? sidebarVisible : (stryCov_9fa48("20935"), !sidebarVisible)) && <button className="gpt__toggle-sidebar-btn" onClick={stryMutAct_9fa48("20936") ? () => undefined : (stryCov_9fa48("20936"), () => setSidebarVisible(stryMutAct_9fa48("20937") ? false : (stryCov_9fa48("20937"), true)))} title="Show sidebar">
                <FaChevronLeft size={14} style={stryMutAct_9fa48("20938") ? {} : (stryCov_9fa48("20938"), {
                transform: stryMutAct_9fa48("20939") ? "" : (stryCov_9fa48("20939"), 'rotate(180deg)')
              })} />
              </button>)}
            
            {/* Summary button for article discussions */}
            {stryMutAct_9fa48("20942") ? shouldShowSummaryButton() || <div className="gpt__chat-header">
                <div className="gpt__summary-controls">
                  <button className="gpt__summary-btn" onClick={openSummaryModal} title="View article/video summary">
                    {isYouTubeVideo(getCurrentArticleInfo()?.url) ? <FaVideo /> : <FaFileAlt />}
                    <span>
                      View {isYouTubeVideo(getCurrentArticleInfo()?.url) ? 'Video' : 'Article'} Summary
                    </span>
                  </button>
                </div>
              </div> : stryMutAct_9fa48("20941") ? false : stryMutAct_9fa48("20940") ? true : (stryCov_9fa48("20940", "20941", "20942"), shouldShowSummaryButton() && <div className="gpt__chat-header">
                <div className="gpt__summary-controls">
                  <button className="gpt__summary-btn" onClick={openSummaryModal} title="View article/video summary">
                    {isYouTubeVideo(stryMutAct_9fa48("20943") ? getCurrentArticleInfo().url : (stryCov_9fa48("20943"), getCurrentArticleInfo()?.url)) ? <FaVideo /> : <FaFileAlt />}
                    <span>
                      View {isYouTubeVideo(stryMutAct_9fa48("20944") ? getCurrentArticleInfo().url : (stryCov_9fa48("20944"), getCurrentArticleInfo()?.url)) ? stryMutAct_9fa48("20945") ? "" : (stryCov_9fa48("20945"), 'Video') : stryMutAct_9fa48("20946") ? "" : (stryCov_9fa48("20946"), 'Article')} Summary
                    </span>
                  </button>
                </div>
              </div>)}
            
            {(stryMutAct_9fa48("20947") ? activeThread : (stryCov_9fa48("20947"), !activeThread)) ? <div className="gpt__empty-state">
                <h3 className="gpt__empty-state-title">Welcome to GPT-4-TURBO</h3>
                <p className="gpt__empty-state-text">
                  {isInactiveUser ? stryMutAct_9fa48("20948") ? "" : (stryCov_9fa48("20948"), "You can view your past conversations, but cannot create new ones in historical access mode.") : stryMutAct_9fa48("20949") ? "" : (stryCov_9fa48("20949"), "Start a new conversation or select an existing thread from the sidebar")}
                </p>
                {stryMutAct_9fa48("20952") ? !isInactiveUser || <button className="gpt__empty-state-btn" onClick={handleCreateThread} disabled={isLoading}>
                    {isLoading ? 'Creating...' : 'New Conversation'}
                  </button> : stryMutAct_9fa48("20951") ? false : stryMutAct_9fa48("20950") ? true : (stryCov_9fa48("20950", "20951", "20952"), (stryMutAct_9fa48("20953") ? isInactiveUser : (stryCov_9fa48("20953"), !isInactiveUser)) && <button className="gpt__empty-state-btn" onClick={handleCreateThread} disabled={isLoading}>
                    {isLoading ? stryMutAct_9fa48("20954") ? "" : (stryCov_9fa48("20954"), 'Creating...') : stryMutAct_9fa48("20955") ? "" : (stryCov_9fa48("20955"), 'New Conversation')}
                  </button>)}
              </div> : <>
                {/* Processing Overlay - moved outside message conditional to always show when processing */}
                {stryMutAct_9fa48("20958") ? isProcessingUpload || <div className="gpt__processing-overlay">
                    <div className="gpt__processing-content">
                      <div className="gpt__processing-spinner">
                        <div className="gpt__spinner"></div>
                      </div>
                      <div className="gpt__processing-text">
                        <h4>Processing Content</h4>
                        <p className="gpt__processing-step">{processingStep}</p>
                        {processingFileName && <p className="gpt__processing-file">File: {processingFileName}</p>}
                        {processingUrl && <p className="gpt__processing-url">URL: {processingUrl}</p>}
                      </div>
                    </div>
                  </div> : stryMutAct_9fa48("20957") ? false : stryMutAct_9fa48("20956") ? true : (stryCov_9fa48("20956", "20957", "20958"), isProcessingUpload && <div className="gpt__processing-overlay">
                    <div className="gpt__processing-content">
                      <div className="gpt__processing-spinner">
                        <div className="gpt__spinner"></div>
                      </div>
                      <div className="gpt__processing-text">
                        <h4>Processing Content</h4>
                        <p className="gpt__processing-step">{processingStep}</p>
                        {stryMutAct_9fa48("20961") ? processingFileName || <p className="gpt__processing-file">File: {processingFileName}</p> : stryMutAct_9fa48("20960") ? false : stryMutAct_9fa48("20959") ? true : (stryCov_9fa48("20959", "20960", "20961"), processingFileName && <p className="gpt__processing-file">File: {processingFileName}</p>)}
                        {stryMutAct_9fa48("20964") ? processingUrl || <p className="gpt__processing-url">URL: {processingUrl}</p> : stryMutAct_9fa48("20963") ? false : stryMutAct_9fa48("20962") ? true : (stryCov_9fa48("20962", "20963", "20964"), processingUrl && <p className="gpt__processing-url">URL: {processingUrl}</p>)}
                      </div>
                    </div>
                  </div>)}
                
                <div className="gpt__messages">
                  {(stryMutAct_9fa48("20967") ? isLoading || messages.length === 0 : stryMutAct_9fa48("20966") ? false : stryMutAct_9fa48("20965") ? true : (stryCov_9fa48("20965", "20966", "20967"), isLoading && (stryMutAct_9fa48("20969") ? messages.length !== 0 : stryMutAct_9fa48("20968") ? true : (stryCov_9fa48("20968", "20969"), messages.length === 0)))) ? <div className="gpt__loading-messages">Loading messages...</div> : (stryMutAct_9fa48("20972") ? messages.length !== 0 : stryMutAct_9fa48("20971") ? false : stryMutAct_9fa48("20970") ? true : (stryCov_9fa48("20970", "20971", "20972"), messages.length === 0)) ? <div className="gpt__empty-messages">
                      <p>
                        {isInactiveUser ? stryMutAct_9fa48("20973") ? "" : (stryCov_9fa48("20973"), "This conversation has no messages.") : stryMutAct_9fa48("20974") ? "" : (stryCov_9fa48("20974"), "No messages yet. Start the conversation by sending a message below.")}
                      </p>
                    </div> : <>
                      {/* Regular messages */}
                      {stryMutAct_9fa48("20975") ? messages.map(message => {
                    // Handle system_content_summary messages to recreate content source cards
                    if (getMessageRole(message) === 'system_content_summary') {
                      const content = message.content;

                      // Parse the content to extract info
                      let source = {};
                      if (content.startsWith('File uploaded:')) {
                        // Parse file format: "File uploaded: filename\nSummary: summary"
                        const lines = content.split('\n');
                        const fileName = lines[0].replace('File uploaded: ', '');
                        const summary = lines.slice(1).join('\n').replace('Summary: ', '');
                        source = {
                          id: getMessageId(message),
                          type: 'file',
                          fileName: fileName,
                          title: `${fileName} Summary`,
                          summary: summary,
                          contentType: 'document',
                          processedAt: message.created_at
                        };
                      } else if (content.includes(' processed:')) {
                        // Parse URL format: "Video/Article processed: title\nURL: url\nSummary: summary"
                        const lines = content.split('\n');
                        const firstLine = lines[0];
                        const isVideo = firstLine.startsWith('Video processed:');
                        const title = firstLine.replace(/^(Video|Article) processed: /, '');
                        const url = lines.find(line => line.startsWith('URL: '))?.replace('URL: ', '');
                        const summary = lines.slice(lines.findIndex(line => line.startsWith('Summary: '))).join('\n').replace('Summary: ', '');
                        source = {
                          id: getMessageId(message),
                          type: 'url',
                          title: title,
                          summary: summary,
                          url: url,
                          contentType: isVideo ? 'video' : 'article',
                          processedAt: message.created_at
                        };
                      }

                      // Only render if we successfully parsed the content
                      if (source.summary) {
                        const isVideo = source.contentType === 'video';
                        const icon = source.type === 'file' ? '📄' : isVideo ? '🎥' : '📰';
                        return <div key={getMessageId(message)} className="gpt__message gpt__message--content-source">
                                <div className="gpt__content-source-card">
                                  <div className="gpt__content-source-header">
                                    <span className="gpt__content-source-icon-large">{icon}</span>
                                    <div className="gpt__content-source-info">
                                      <div className="gpt__content-source-type-title">
                                        <span className="gpt__content-source-type">{source.contentType}</span>
                                        <h4 className="gpt__content-source-title">
                                          {source.type === 'file' ? source.fileName : source.title}
                                        </h4>
                                      </div>
                                      {source.url && <a href={source.url} target="_blank" rel="noopener noreferrer" className="gpt__content-source-link">
                                          View original →
                                        </a>}
                                    </div>
                                    <button className="gpt__view-summary-btn" onClick={() => showContentSummary(source)} title="View summary">
                                      View Summary
                                    </button>
                                  </div>
                                </div>
                              </div>;
                      }

                      // If parsing failed, don't render anything (hide the system message)
                      return null;
                    }

                    // Handle content source messages specially (keep existing logic for new uploads)
                    if (getMessageRole(message) === 'content_source' && message.contentSource) {
                      const source = message.contentSource;
                      const isVideo = source.contentType === 'video';
                      const icon = source.type === 'file' ? '📄' : isVideo ? '🎥' : '📰';
                      return <div key={getMessageId(message)} className="gpt__message gpt__message--content-source">
                              <div className="gpt__content-source-card">
                                <div className="gpt__content-source-header">
                                  <span className="gpt__content-source-icon-large">{icon}</span>
                                  <div className="gpt__content-source-info">
                                    <div className="gpt__content-source-type-title">
                                      <span className="gpt__content-source-type">{source.contentType}</span>
                                      <h4 className="gpt__content-source-title">
                                        {source.type === 'file' ? source.fileName : source.title}
                                      </h4>
                                    </div>
                                    {source.url && <a href={source.url} target="_blank" rel="noopener noreferrer" className="gpt__content-source-link">
                                        View original →
                                      </a>}
                                  </div>
                                  <button className="gpt__view-summary-btn" onClick={() => showContentSummary(source)} title="View summary">
                                    View Summary
                                  </button>
                                </div>
                              </div>
                            </div>;
                    }

                    // Regular messages
                    return <div key={getMessageId(message)} className={`gpt__message ${getMessageRole(message) === 'user' ? 'gpt__message--user' : 'gpt__message--assistant'}`}>
                            <div className="gpt__message-content">
                              {formatMessageContent(message.content)}
                            </div>
                          </div>;
                  }) : (stryCov_9fa48("20975"), messages.map(message => {
                    if (stryMutAct_9fa48("20976")) {
                      {}
                    } else {
                      stryCov_9fa48("20976");
                      // Handle system_content_summary messages to recreate content source cards
                      if (stryMutAct_9fa48("20979") ? getMessageRole(message) !== 'system_content_summary' : stryMutAct_9fa48("20978") ? false : stryMutAct_9fa48("20977") ? true : (stryCov_9fa48("20977", "20978", "20979"), getMessageRole(message) === (stryMutAct_9fa48("20980") ? "" : (stryCov_9fa48("20980"), 'system_content_summary')))) {
                        if (stryMutAct_9fa48("20981")) {
                          {}
                        } else {
                          stryCov_9fa48("20981");
                          const content = message.content;

                          // Parse the content to extract info
                          let source = {};
                          if (stryMutAct_9fa48("20984") ? content.endsWith('File uploaded:') : stryMutAct_9fa48("20983") ? false : stryMutAct_9fa48("20982") ? true : (stryCov_9fa48("20982", "20983", "20984"), content.startsWith(stryMutAct_9fa48("20985") ? "" : (stryCov_9fa48("20985"), 'File uploaded:')))) {
                            if (stryMutAct_9fa48("20986")) {
                              {}
                            } else {
                              stryCov_9fa48("20986");
                              // Parse file format: "File uploaded: filename\nSummary: summary"
                              const lines = content.split(stryMutAct_9fa48("20987") ? "" : (stryCov_9fa48("20987"), '\n'));
                              const fileName = lines[0].replace(stryMutAct_9fa48("20988") ? "" : (stryCov_9fa48("20988"), 'File uploaded: '), stryMutAct_9fa48("20989") ? "Stryker was here!" : (stryCov_9fa48("20989"), ''));
                              const summary = stryMutAct_9fa48("20990") ? lines.join('\n').replace('Summary: ', '') : (stryCov_9fa48("20990"), lines.slice(1).join(stryMutAct_9fa48("20991") ? "" : (stryCov_9fa48("20991"), '\n')).replace(stryMutAct_9fa48("20992") ? "" : (stryCov_9fa48("20992"), 'Summary: '), stryMutAct_9fa48("20993") ? "Stryker was here!" : (stryCov_9fa48("20993"), '')));
                              source = stryMutAct_9fa48("20994") ? {} : (stryCov_9fa48("20994"), {
                                id: getMessageId(message),
                                type: stryMutAct_9fa48("20995") ? "" : (stryCov_9fa48("20995"), 'file'),
                                fileName: fileName,
                                title: stryMutAct_9fa48("20996") ? `` : (stryCov_9fa48("20996"), `${fileName} Summary`),
                                summary: summary,
                                contentType: stryMutAct_9fa48("20997") ? "" : (stryCov_9fa48("20997"), 'document'),
                                processedAt: message.created_at
                              });
                            }
                          } else if (stryMutAct_9fa48("20999") ? false : stryMutAct_9fa48("20998") ? true : (stryCov_9fa48("20998", "20999"), content.includes(stryMutAct_9fa48("21000") ? "" : (stryCov_9fa48("21000"), ' processed:')))) {
                            if (stryMutAct_9fa48("21001")) {
                              {}
                            } else {
                              stryCov_9fa48("21001");
                              // Parse URL format: "Video/Article processed: title\nURL: url\nSummary: summary"
                              const lines = content.split(stryMutAct_9fa48("21002") ? "" : (stryCov_9fa48("21002"), '\n'));
                              const firstLine = lines[0];
                              const isVideo = stryMutAct_9fa48("21003") ? firstLine.endsWith('Video processed:') : (stryCov_9fa48("21003"), firstLine.startsWith(stryMutAct_9fa48("21004") ? "" : (stryCov_9fa48("21004"), 'Video processed:')));
                              const title = firstLine.replace(stryMutAct_9fa48("21005") ? /(Video|Article) processed: / : (stryCov_9fa48("21005"), /^(Video|Article) processed: /), stryMutAct_9fa48("21006") ? "Stryker was here!" : (stryCov_9fa48("21006"), ''));
                              const url = stryMutAct_9fa48("21007") ? lines.find(line => line.startsWith('URL: ')).replace('URL: ', '') : (stryCov_9fa48("21007"), lines.find(stryMutAct_9fa48("21008") ? () => undefined : (stryCov_9fa48("21008"), line => stryMutAct_9fa48("21009") ? line.endsWith('URL: ') : (stryCov_9fa48("21009"), line.startsWith(stryMutAct_9fa48("21010") ? "" : (stryCov_9fa48("21010"), 'URL: ')))))?.replace(stryMutAct_9fa48("21011") ? "" : (stryCov_9fa48("21011"), 'URL: '), stryMutAct_9fa48("21012") ? "Stryker was here!" : (stryCov_9fa48("21012"), '')));
                              const summary = stryMutAct_9fa48("21013") ? lines.join('\n').replace('Summary: ', '') : (stryCov_9fa48("21013"), lines.slice(lines.findIndex(stryMutAct_9fa48("21014") ? () => undefined : (stryCov_9fa48("21014"), line => stryMutAct_9fa48("21015") ? line.endsWith('Summary: ') : (stryCov_9fa48("21015"), line.startsWith(stryMutAct_9fa48("21016") ? "" : (stryCov_9fa48("21016"), 'Summary: ')))))).join(stryMutAct_9fa48("21017") ? "" : (stryCov_9fa48("21017"), '\n')).replace(stryMutAct_9fa48("21018") ? "" : (stryCov_9fa48("21018"), 'Summary: '), stryMutAct_9fa48("21019") ? "Stryker was here!" : (stryCov_9fa48("21019"), '')));
                              source = stryMutAct_9fa48("21020") ? {} : (stryCov_9fa48("21020"), {
                                id: getMessageId(message),
                                type: stryMutAct_9fa48("21021") ? "" : (stryCov_9fa48("21021"), 'url'),
                                title: title,
                                summary: summary,
                                url: url,
                                contentType: isVideo ? stryMutAct_9fa48("21022") ? "" : (stryCov_9fa48("21022"), 'video') : stryMutAct_9fa48("21023") ? "" : (stryCov_9fa48("21023"), 'article'),
                                processedAt: message.created_at
                              });
                            }
                          }

                          // Only render if we successfully parsed the content
                          if (stryMutAct_9fa48("21025") ? false : stryMutAct_9fa48("21024") ? true : (stryCov_9fa48("21024", "21025"), source.summary)) {
                            if (stryMutAct_9fa48("21026")) {
                              {}
                            } else {
                              stryCov_9fa48("21026");
                              const isVideo = stryMutAct_9fa48("21029") ? source.contentType !== 'video' : stryMutAct_9fa48("21028") ? false : stryMutAct_9fa48("21027") ? true : (stryCov_9fa48("21027", "21028", "21029"), source.contentType === (stryMutAct_9fa48("21030") ? "" : (stryCov_9fa48("21030"), 'video')));
                              const icon = (stryMutAct_9fa48("21033") ? source.type !== 'file' : stryMutAct_9fa48("21032") ? false : stryMutAct_9fa48("21031") ? true : (stryCov_9fa48("21031", "21032", "21033"), source.type === (stryMutAct_9fa48("21034") ? "" : (stryCov_9fa48("21034"), 'file')))) ? stryMutAct_9fa48("21035") ? "" : (stryCov_9fa48("21035"), '📄') : isVideo ? stryMutAct_9fa48("21036") ? "" : (stryCov_9fa48("21036"), '🎥') : stryMutAct_9fa48("21037") ? "" : (stryCov_9fa48("21037"), '📰');
                              return <div key={getMessageId(message)} className="gpt__message gpt__message--content-source">
                                <div className="gpt__content-source-card">
                                  <div className="gpt__content-source-header">
                                    <span className="gpt__content-source-icon-large">{icon}</span>
                                    <div className="gpt__content-source-info">
                                      <div className="gpt__content-source-type-title">
                                        <span className="gpt__content-source-type">{source.contentType}</span>
                                        <h4 className="gpt__content-source-title">
                                          {(stryMutAct_9fa48("21040") ? source.type !== 'file' : stryMutAct_9fa48("21039") ? false : stryMutAct_9fa48("21038") ? true : (stryCov_9fa48("21038", "21039", "21040"), source.type === (stryMutAct_9fa48("21041") ? "" : (stryCov_9fa48("21041"), 'file')))) ? source.fileName : source.title}
                                        </h4>
                                      </div>
                                      {stryMutAct_9fa48("21044") ? source.url || <a href={source.url} target="_blank" rel="noopener noreferrer" className="gpt__content-source-link">
                                          View original →
                                        </a> : stryMutAct_9fa48("21043") ? false : stryMutAct_9fa48("21042") ? true : (stryCov_9fa48("21042", "21043", "21044"), source.url && <a href={source.url} target="_blank" rel="noopener noreferrer" className="gpt__content-source-link">
                                          View original →
                                        </a>)}
                                    </div>
                                    <button className="gpt__view-summary-btn" onClick={stryMutAct_9fa48("21045") ? () => undefined : (stryCov_9fa48("21045"), () => showContentSummary(source))} title="View summary">
                                      View Summary
                                    </button>
                                  </div>
                                </div>
                              </div>;
                            }
                          }

                          // If parsing failed, don't render anything (hide the system message)
                          return null;
                        }
                      }

                      // Handle content source messages specially (keep existing logic for new uploads)
                      if (stryMutAct_9fa48("21048") ? getMessageRole(message) === 'content_source' || message.contentSource : stryMutAct_9fa48("21047") ? false : stryMutAct_9fa48("21046") ? true : (stryCov_9fa48("21046", "21047", "21048"), (stryMutAct_9fa48("21050") ? getMessageRole(message) !== 'content_source' : stryMutAct_9fa48("21049") ? true : (stryCov_9fa48("21049", "21050"), getMessageRole(message) === (stryMutAct_9fa48("21051") ? "" : (stryCov_9fa48("21051"), 'content_source')))) && message.contentSource)) {
                        if (stryMutAct_9fa48("21052")) {
                          {}
                        } else {
                          stryCov_9fa48("21052");
                          const source = message.contentSource;
                          const isVideo = stryMutAct_9fa48("21055") ? source.contentType !== 'video' : stryMutAct_9fa48("21054") ? false : stryMutAct_9fa48("21053") ? true : (stryCov_9fa48("21053", "21054", "21055"), source.contentType === (stryMutAct_9fa48("21056") ? "" : (stryCov_9fa48("21056"), 'video')));
                          const icon = (stryMutAct_9fa48("21059") ? source.type !== 'file' : stryMutAct_9fa48("21058") ? false : stryMutAct_9fa48("21057") ? true : (stryCov_9fa48("21057", "21058", "21059"), source.type === (stryMutAct_9fa48("21060") ? "" : (stryCov_9fa48("21060"), 'file')))) ? stryMutAct_9fa48("21061") ? "" : (stryCov_9fa48("21061"), '📄') : isVideo ? stryMutAct_9fa48("21062") ? "" : (stryCov_9fa48("21062"), '🎥') : stryMutAct_9fa48("21063") ? "" : (stryCov_9fa48("21063"), '📰');
                          return <div key={getMessageId(message)} className="gpt__message gpt__message--content-source">
                              <div className="gpt__content-source-card">
                                <div className="gpt__content-source-header">
                                  <span className="gpt__content-source-icon-large">{icon}</span>
                                  <div className="gpt__content-source-info">
                                    <div className="gpt__content-source-type-title">
                                      <span className="gpt__content-source-type">{source.contentType}</span>
                                      <h4 className="gpt__content-source-title">
                                        {(stryMutAct_9fa48("21066") ? source.type !== 'file' : stryMutAct_9fa48("21065") ? false : stryMutAct_9fa48("21064") ? true : (stryCov_9fa48("21064", "21065", "21066"), source.type === (stryMutAct_9fa48("21067") ? "" : (stryCov_9fa48("21067"), 'file')))) ? source.fileName : source.title}
                                      </h4>
                                    </div>
                                    {stryMutAct_9fa48("21070") ? source.url || <a href={source.url} target="_blank" rel="noopener noreferrer" className="gpt__content-source-link">
                                        View original →
                                      </a> : stryMutAct_9fa48("21069") ? false : stryMutAct_9fa48("21068") ? true : (stryCov_9fa48("21068", "21069", "21070"), source.url && <a href={source.url} target="_blank" rel="noopener noreferrer" className="gpt__content-source-link">
                                        View original →
                                      </a>)}
                                  </div>
                                  <button className="gpt__view-summary-btn" onClick={stryMutAct_9fa48("21071") ? () => undefined : (stryCov_9fa48("21071"), () => showContentSummary(source))} title="View summary">
                                    View Summary
                                  </button>
                                </div>
                              </div>
                            </div>;
                        }
                      }

                      // Regular messages
                      return <div key={getMessageId(message)} className={stryMutAct_9fa48("21072") ? `` : (stryCov_9fa48("21072"), `gpt__message ${(stryMutAct_9fa48("21075") ? getMessageRole(message) !== 'user' : stryMutAct_9fa48("21074") ? false : stryMutAct_9fa48("21073") ? true : (stryCov_9fa48("21073", "21074", "21075"), getMessageRole(message) === (stryMutAct_9fa48("21076") ? "" : (stryCov_9fa48("21076"), 'user')))) ? stryMutAct_9fa48("21077") ? "" : (stryCov_9fa48("21077"), 'gpt__message--user') : stryMutAct_9fa48("21078") ? "" : (stryCov_9fa48("21078"), 'gpt__message--assistant')}`)}>
                            <div className="gpt__message-content">
                              {formatMessageContent(message.content)}
                            </div>
                          </div>;
                    }
                  }).filter(Boolean))}
                      {stryMutAct_9fa48("21081") ? isAiThinking || <div className="gpt__message gpt__message--assistant">
                          <div className="gpt__message-content gpt__message-content--thinking">
                            <div className="gpt__typing-indicator">
                              <span></span>
                              <span></span>
                              <span></span>
                            </div>
                          </div>
                        </div> : stryMutAct_9fa48("21080") ? false : stryMutAct_9fa48("21079") ? true : (stryCov_9fa48("21079", "21080", "21081"), isAiThinking && <div className="gpt__message gpt__message--assistant">
                          <div className="gpt__message-content gpt__message-content--thinking">
                            <div className="gpt__typing-indicator">
                              <span></span>
                              <span></span>
                              <span></span>
                            </div>
                          </div>
                        </div>)}
                      <div ref={messagesEndRef} />
                    </>}
                </div>
                
                <form className="gpt__input-form" onSubmit={handleSendMessage}>
                  {/* Upload Controls */}
                  <div className="gpt__upload-container" ref={uploadDropdownRef}>
                    <button type="button" className={stryMutAct_9fa48("21082") ? `` : (stryCov_9fa48("21082"), `gpt__upload-btn ${showUploadDropdown ? stryMutAct_9fa48("21083") ? "" : (stryCov_9fa48("21083"), 'gpt__upload-btn--active') : stryMutAct_9fa48("21084") ? "Stryker was here!" : (stryCov_9fa48("21084"), '')}`)} onClick={toggleUploadDropdown} disabled={stryMutAct_9fa48("21087") ? (!activeThread || isProcessingUpload || isLoading) && isInactiveUser : stryMutAct_9fa48("21086") ? false : stryMutAct_9fa48("21085") ? true : (stryCov_9fa48("21085", "21086", "21087"), (stryMutAct_9fa48("21089") ? (!activeThread || isProcessingUpload) && isLoading : stryMutAct_9fa48("21088") ? false : (stryCov_9fa48("21088", "21089"), (stryMutAct_9fa48("21091") ? !activeThread && isProcessingUpload : stryMutAct_9fa48("21090") ? false : (stryCov_9fa48("21090", "21091"), (stryMutAct_9fa48("21092") ? activeThread : (stryCov_9fa48("21092"), !activeThread)) || isProcessingUpload)) || isLoading)) || isInactiveUser)} title={isInactiveUser ? stryMutAct_9fa48("21093") ? "" : (stryCov_9fa48("21093"), "Cannot upload in historical access mode") : stryMutAct_9fa48("21094") ? "" : (stryCov_9fa48("21094"), "Upload file or add URL for AI to summarize and discuss")}>
                      <FaPlus size={16} />
                    </button>
                    
                    {/* Upload Dropdown */}
                    {stryMutAct_9fa48("21097") ? showUploadDropdown || <div className="gpt__upload-dropdown">
                        <button type="button" className="gpt__upload-option" onClick={openFileDialog} disabled={isProcessingUpload}>
                          <FaFileAlt size={14} />
                          <span>Upload File</span>
                          <small>PDF, TXT, MD, DOCX</small>
                        </button>
                        <button type="button" className="gpt__upload-option" onClick={openUrlInput} disabled={isProcessingUpload}>
                          <FaLink size={14} />
                          <span>Add URL</span>
                          <small>Google Docs, Articles, YouTube Videos</small>
                        </button>
                      </div> : stryMutAct_9fa48("21096") ? false : stryMutAct_9fa48("21095") ? true : (stryCov_9fa48("21095", "21096", "21097"), showUploadDropdown && <div className="gpt__upload-dropdown">
                        <button type="button" className="gpt__upload-option" onClick={openFileDialog} disabled={isProcessingUpload}>
                          <FaFileAlt size={14} />
                          <span>Upload File</span>
                          <small>PDF, TXT, MD, DOCX</small>
                        </button>
                        <button type="button" className="gpt__upload-option" onClick={openUrlInput} disabled={isProcessingUpload}>
                          <FaLink size={14} />
                          <span>Add URL</span>
                          <small>Google Docs, Articles, YouTube Videos</small>
                        </button>
                      </div>)}
                    
                    {/* URL Input */}
                    {stryMutAct_9fa48("21100") ? showUrlInput || <div className="gpt__url-input-container">
                        <input type="url" value={urlInput} onChange={e => setUrlInput(e.target.value)} placeholder="Enter URL (Google Docs, article, video...)" className="gpt__url-input" onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleUrlSubmit();
                      } else if (e.key === 'Escape') {
                        setShowUrlInput(false);
                        setUrlInput('');
                      }
                    }} autoFocus />
                        <div className="gpt__url-actions">
                          <button type="button" className="gpt__url-submit" onClick={handleUrlSubmit} disabled={!urlInput.trim() || isProcessingUpload}>
                            Summarize
                          </button>
                          <button type="button" className="gpt__url-cancel" onClick={() => {
                        setShowUrlInput(false);
                        setUrlInput('');
                      }}>
                            <FaTimes size={12} />
                          </button>
                        </div>
                      </div> : stryMutAct_9fa48("21099") ? false : stryMutAct_9fa48("21098") ? true : (stryCov_9fa48("21098", "21099", "21100"), showUrlInput && <div className="gpt__url-input-container">
                        <input type="url" value={urlInput} onChange={stryMutAct_9fa48("21101") ? () => undefined : (stryCov_9fa48("21101"), e => setUrlInput(e.target.value))} placeholder="Enter URL (Google Docs, article, video...)" className="gpt__url-input" onKeyDown={e => {
                      if (stryMutAct_9fa48("21102")) {
                        {}
                      } else {
                        stryCov_9fa48("21102");
                        if (stryMutAct_9fa48("21105") ? e.key !== 'Enter' : stryMutAct_9fa48("21104") ? false : stryMutAct_9fa48("21103") ? true : (stryCov_9fa48("21103", "21104", "21105"), e.key === (stryMutAct_9fa48("21106") ? "" : (stryCov_9fa48("21106"), 'Enter')))) {
                          if (stryMutAct_9fa48("21107")) {
                            {}
                          } else {
                            stryCov_9fa48("21107");
                            e.preventDefault();
                            handleUrlSubmit();
                          }
                        } else if (stryMutAct_9fa48("21110") ? e.key !== 'Escape' : stryMutAct_9fa48("21109") ? false : stryMutAct_9fa48("21108") ? true : (stryCov_9fa48("21108", "21109", "21110"), e.key === (stryMutAct_9fa48("21111") ? "" : (stryCov_9fa48("21111"), 'Escape')))) {
                          if (stryMutAct_9fa48("21112")) {
                            {}
                          } else {
                            stryCov_9fa48("21112");
                            setShowUrlInput(stryMutAct_9fa48("21113") ? true : (stryCov_9fa48("21113"), false));
                            setUrlInput(stryMutAct_9fa48("21114") ? "Stryker was here!" : (stryCov_9fa48("21114"), ''));
                          }
                        }
                      }
                    }} autoFocus />
                        <div className="gpt__url-actions">
                          <button type="button" className="gpt__url-submit" onClick={handleUrlSubmit} disabled={stryMutAct_9fa48("21117") ? !urlInput.trim() && isProcessingUpload : stryMutAct_9fa48("21116") ? false : stryMutAct_9fa48("21115") ? true : (stryCov_9fa48("21115", "21116", "21117"), (stryMutAct_9fa48("21118") ? urlInput.trim() : (stryCov_9fa48("21118"), !(stryMutAct_9fa48("21119") ? urlInput : (stryCov_9fa48("21119"), urlInput.trim())))) || isProcessingUpload)}>
                            Summarize
                          </button>
                          <button type="button" className="gpt__url-cancel" onClick={() => {
                        if (stryMutAct_9fa48("21120")) {
                          {}
                        } else {
                          stryCov_9fa48("21120");
                          setShowUrlInput(stryMutAct_9fa48("21121") ? true : (stryCov_9fa48("21121"), false));
                          setUrlInput(stryMutAct_9fa48("21122") ? "Stryker was here!" : (stryCov_9fa48("21122"), ''));
                        }
                      }}>
                            <FaTimes size={12} />
                          </button>
                        </div>
                      </div>)}
                  </div>
                  
                  {/* Hidden File Input */}
                  <input ref={fileInputRef} type="file" accept=".pdf,.txt,.md,.docx" onChange={handleFileInputChange} style={stryMutAct_9fa48("21123") ? {} : (stryCov_9fa48("21123"), {
                  display: stryMutAct_9fa48("21124") ? "" : (stryCov_9fa48("21124"), 'none')
                })} />
                  
                  <textarea ref={textareaRef} rows="1" value={newMessage} onChange={e => {
                  if (stryMutAct_9fa48("21125")) {
                    {}
                  } else {
                    stryCov_9fa48("21125");
                    setNewMessage(e.target.value);
                    e.target.style.height = stryMutAct_9fa48("21126") ? "" : (stryCov_9fa48("21126"), 'auto');
                    e.target.style.height = e.target.scrollHeight + (stryMutAct_9fa48("21127") ? "" : (stryCov_9fa48("21127"), 'px'));
                  }
                }} onKeyDown={e => {
                  if (stryMutAct_9fa48("21128")) {
                    {}
                  } else {
                    stryCov_9fa48("21128");
                    if (stryMutAct_9fa48("21131") ? e.key === 'Enter' || !e.shiftKey : stryMutAct_9fa48("21130") ? false : stryMutAct_9fa48("21129") ? true : (stryCov_9fa48("21129", "21130", "21131"), (stryMutAct_9fa48("21133") ? e.key !== 'Enter' : stryMutAct_9fa48("21132") ? true : (stryCov_9fa48("21132", "21133"), e.key === (stryMutAct_9fa48("21134") ? "" : (stryCov_9fa48("21134"), 'Enter')))) && (stryMutAct_9fa48("21135") ? e.shiftKey : (stryCov_9fa48("21135"), !e.shiftKey)))) {
                      if (stryMutAct_9fa48("21136")) {
                        {}
                      } else {
                        stryCov_9fa48("21136");
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }
                  }
                }} placeholder={isInactiveUser ? stryMutAct_9fa48("21137") ? "" : (stryCov_9fa48("21137"), "Historical access mode - cannot send messages") : isSending ? stryMutAct_9fa48("21138") ? "" : (stryCov_9fa48("21138"), "Sending...") : stryMutAct_9fa48("21139") ? "" : (stryCov_9fa48("21139"), "Type your message...")} disabled={stryMutAct_9fa48("21142") ? (!activeThread || isSending || isLoading) && isInactiveUser : stryMutAct_9fa48("21141") ? false : stryMutAct_9fa48("21140") ? true : (stryCov_9fa48("21140", "21141", "21142"), (stryMutAct_9fa48("21144") ? (!activeThread || isSending) && isLoading : stryMutAct_9fa48("21143") ? false : (stryCov_9fa48("21143", "21144"), (stryMutAct_9fa48("21146") ? !activeThread && isSending : stryMutAct_9fa48("21145") ? false : (stryCov_9fa48("21145", "21146"), (stryMutAct_9fa48("21147") ? activeThread : (stryCov_9fa48("21147"), !activeThread)) || isSending)) || isLoading)) || isInactiveUser)} className={stryMutAct_9fa48("21148") ? `` : (stryCov_9fa48("21148"), `gpt__input ${isInactiveUser ? stryMutAct_9fa48("21149") ? "" : (stryCov_9fa48("21149"), 'gpt__input--disabled') : stryMutAct_9fa48("21150") ? "Stryker was here!" : (stryCov_9fa48("21150"), '')}`)} />
                  <button type="submit" disabled={stryMutAct_9fa48("21153") ? (!activeThread || !newMessage.trim() || isSending || isLoading) && isInactiveUser : stryMutAct_9fa48("21152") ? false : stryMutAct_9fa48("21151") ? true : (stryCov_9fa48("21151", "21152", "21153"), (stryMutAct_9fa48("21155") ? (!activeThread || !newMessage.trim() || isSending) && isLoading : stryMutAct_9fa48("21154") ? false : (stryCov_9fa48("21154", "21155"), (stryMutAct_9fa48("21157") ? (!activeThread || !newMessage.trim()) && isSending : stryMutAct_9fa48("21156") ? false : (stryCov_9fa48("21156", "21157"), (stryMutAct_9fa48("21159") ? !activeThread && !newMessage.trim() : stryMutAct_9fa48("21158") ? false : (stryCov_9fa48("21158", "21159"), (stryMutAct_9fa48("21160") ? activeThread : (stryCov_9fa48("21160"), !activeThread)) || (stryMutAct_9fa48("21161") ? newMessage.trim() : (stryCov_9fa48("21161"), !(stryMutAct_9fa48("21162") ? newMessage : (stryCov_9fa48("21162"), newMessage.trim())))))) || isSending)) || isLoading)) || isInactiveUser)} className={stryMutAct_9fa48("21163") ? `` : (stryCov_9fa48("21163"), `gpt__send-btn ${isInactiveUser ? stryMutAct_9fa48("21164") ? "" : (stryCov_9fa48("21164"), 'gpt__send-btn--disabled') : stryMutAct_9fa48("21165") ? "Stryker was here!" : (stryCov_9fa48("21165"), '')}`)}>
                    {isInactiveUser ? stryMutAct_9fa48("21166") ? "" : (stryCov_9fa48("21166"), "Historical") : isSending ? stryMutAct_9fa48("21167") ? "" : (stryCov_9fa48("21167"), "Sending...") : stryMutAct_9fa48("21168") ? "" : (stryCov_9fa48("21168"), "Send")}
                  </button>
                </form>
              </>}
          </div>
        </div>
      </div>
      
      {/* Summary Modal */}
      {stryMutAct_9fa48("21171") ? getCurrentArticleInfo() || modalSummaryData || <SummaryModal isOpen={showSummaryModal} onClose={closeSummaryModal} summary={getSummaryDataForModal()?.summary} title={getSummaryDataForModal()?.title} url={getSummaryDataForModal()?.url} cached={getSummaryDataForModal()?.cached} loading={summaryLoading} error={null} sourceInfo={getSummaryDataForModal()?.sourceInfo} contentType={getSummaryDataForModal()?.contentType} isAnalysis={getSummaryDataForModal()?.isAnalysis || false} /> : stryMutAct_9fa48("21170") ? false : stryMutAct_9fa48("21169") ? true : (stryCov_9fa48("21169", "21170", "21171"), (stryMutAct_9fa48("21173") ? getCurrentArticleInfo() && modalSummaryData : stryMutAct_9fa48("21172") ? true : (stryCov_9fa48("21172", "21173"), getCurrentArticleInfo() || modalSummaryData)) && <SummaryModal isOpen={showSummaryModal} onClose={closeSummaryModal} summary={stryMutAct_9fa48("21174") ? getSummaryDataForModal().summary : (stryCov_9fa48("21174"), getSummaryDataForModal()?.summary)} title={stryMutAct_9fa48("21175") ? getSummaryDataForModal().title : (stryCov_9fa48("21175"), getSummaryDataForModal()?.title)} url={stryMutAct_9fa48("21176") ? getSummaryDataForModal().url : (stryCov_9fa48("21176"), getSummaryDataForModal()?.url)} cached={stryMutAct_9fa48("21177") ? getSummaryDataForModal().cached : (stryCov_9fa48("21177"), getSummaryDataForModal()?.cached)} loading={summaryLoading} error={null} sourceInfo={stryMutAct_9fa48("21178") ? getSummaryDataForModal().sourceInfo : (stryCov_9fa48("21178"), getSummaryDataForModal()?.sourceInfo)} contentType={stryMutAct_9fa48("21179") ? getSummaryDataForModal().contentType : (stryCov_9fa48("21179"), getSummaryDataForModal()?.contentType)} isAnalysis={stryMutAct_9fa48("21182") ? getSummaryDataForModal()?.isAnalysis && false : stryMutAct_9fa48("21181") ? false : stryMutAct_9fa48("21180") ? true : (stryCov_9fa48("21180", "21181", "21182"), (stryMutAct_9fa48("21183") ? getSummaryDataForModal().isAnalysis : (stryCov_9fa48("21183"), getSummaryDataForModal()?.isAnalysis)) || (stryMutAct_9fa48("21184") ? true : (stryCov_9fa48("21184"), false)))} />)}
    </div>;
  }
}
export default GPT;