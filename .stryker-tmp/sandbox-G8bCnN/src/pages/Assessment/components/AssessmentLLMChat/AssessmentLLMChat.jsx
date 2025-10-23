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
import { FaPaperPlane, FaRobot, FaUser, FaInfoCircle, FaArrowLeft } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../../../../context/AuthContext';
import './AssessmentLLMChat.css';
function AssessmentLLMChat({
  assessmentId,
  onConversationUpdate,
  initialConversation = null,
  disabled = stryMutAct_9fa48("11770") ? true : (stryCov_9fa48("11770"), false),
  onShowInstructions,
  onBackToAssessments,
  onSubmitDeliverables,
  isSubmissionPanelOpen,
  readonly = stryMutAct_9fa48("11771") ? true : (stryCov_9fa48("11771"), false)
}) {
  if (stryMutAct_9fa48("11772")) {
    {}
  } else {
    stryCov_9fa48("11772");
    const {
      token,
      user
    } = useAuth();
    const [messages, setMessages] = useState(stryMutAct_9fa48("11773") ? ["Stryker was here"] : (stryCov_9fa48("11773"), []));
    const [newMessage, setNewMessage] = useState(stryMutAct_9fa48("11774") ? "Stryker was here!" : (stryCov_9fa48("11774"), ''));
    const [isSending, setIsSending] = useState(stryMutAct_9fa48("11775") ? true : (stryCov_9fa48("11775"), false));
    const [isAiThinking, setIsAiThinking] = useState(stryMutAct_9fa48("11776") ? true : (stryCov_9fa48("11776"), false));
    const [error, setError] = useState(stryMutAct_9fa48("11777") ? "Stryker was here!" : (stryCov_9fa48("11777"), ''));
    const [threadId, setThreadId] = useState(null);
    const [isCreatingThread, setIsCreatingThread] = useState(stryMutAct_9fa48("11778") ? true : (stryCov_9fa48("11778"), false));
    const threadCreationInitiated = useRef(stryMutAct_9fa48("11779") ? true : (stryCov_9fa48("11779"), false));
    const currentAssessmentId = useRef(null);
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);

    // Reset thread creation flag when assessment changes
    useEffect(() => {
      if (stryMutAct_9fa48("11780")) {
        {}
      } else {
        stryCov_9fa48("11780");
        console.log(stryMutAct_9fa48("11781") ? "" : (stryCov_9fa48("11781"), 'Assessment changed, resetting thread creation flag:'), assessmentId);

        // Only reset if this is actually a different assessment
        if (stryMutAct_9fa48("11784") ? currentAssessmentId.current === assessmentId : stryMutAct_9fa48("11783") ? false : stryMutAct_9fa48("11782") ? true : (stryCov_9fa48("11782", "11783", "11784"), currentAssessmentId.current !== assessmentId)) {
          if (stryMutAct_9fa48("11785")) {
            {}
          } else {
            stryCov_9fa48("11785");
            console.log(stryMutAct_9fa48("11786") ? "" : (stryCov_9fa48("11786"), 'Different assessment detected, resetting state'));
            currentAssessmentId.current = assessmentId;
            threadCreationInitiated.current = stryMutAct_9fa48("11787") ? true : (stryCov_9fa48("11787"), false);
            setThreadId(null);
            setIsCreatingThread(stryMutAct_9fa48("11788") ? true : (stryCov_9fa48("11788"), false));
          }
        } else {
          if (stryMutAct_9fa48("11789")) {
            {}
          } else {
            stryCov_9fa48("11789");
            console.log(stryMutAct_9fa48("11790") ? "" : (stryCov_9fa48("11790"), 'Same assessment, skipping reset (React Strict Mode double execution)'));
          }
        }

        // Cleanup function
        return () => {
          if (stryMutAct_9fa48("11791")) {
            {}
          } else {
            stryCov_9fa48("11791");
            console.log(stryMutAct_9fa48("11792") ? "" : (stryCov_9fa48("11792"), 'Cleanup: Assessment effect cleanup for:'), assessmentId);
          }
        };
      }
    }, stryMutAct_9fa48("11793") ? [] : (stryCov_9fa48("11793"), [assessmentId]));

    // Initialize messages from initial conversation and get/create thread
    useEffect(() => {
      if (stryMutAct_9fa48("11794")) {
        {}
      } else {
        stryCov_9fa48("11794");
        console.log(stryMutAct_9fa48("11795") ? "" : (stryCov_9fa48("11795"), 'AssessmentLLMChat useEffect triggered:'), stryMutAct_9fa48("11796") ? {} : (stryCov_9fa48("11796"), {
          token: stryMutAct_9fa48("11797") ? !token : (stryCov_9fa48("11797"), !(stryMutAct_9fa48("11798") ? token : (stryCov_9fa48("11798"), !token))),
          assessmentId,
          isCreatingThread,
          threadId,
          threadCreationInitiated: threadCreationInitiated.current
        }));

        // Only create thread if we have a token and assessment ID, haven't initiated creation, and don't already have a thread
        if (stryMutAct_9fa48("11801") ? token && assessmentId && !threadCreationInitiated.current || !threadId : stryMutAct_9fa48("11800") ? false : stryMutAct_9fa48("11799") ? true : (stryCov_9fa48("11799", "11800", "11801"), (stryMutAct_9fa48("11803") ? token && assessmentId || !threadCreationInitiated.current : stryMutAct_9fa48("11802") ? true : (stryCov_9fa48("11802", "11803"), (stryMutAct_9fa48("11805") ? token || assessmentId : stryMutAct_9fa48("11804") ? true : (stryCov_9fa48("11804", "11805"), token && assessmentId)) && (stryMutAct_9fa48("11806") ? threadCreationInitiated.current : (stryCov_9fa48("11806"), !threadCreationInitiated.current)))) && (stryMutAct_9fa48("11807") ? threadId : (stryCov_9fa48("11807"), !threadId)))) {
          if (stryMutAct_9fa48("11808")) {
            {}
          } else {
            stryCov_9fa48("11808");
            console.log(stryMutAct_9fa48("11809") ? "" : (stryCov_9fa48("11809"), 'Calling getOrCreateAssessmentThread from useEffect'));
            threadCreationInitiated.current = stryMutAct_9fa48("11810") ? false : (stryCov_9fa48("11810"), true);
            getOrCreateAssessmentThread();
          }
        } else {
          if (stryMutAct_9fa48("11811")) {
            {}
          } else {
            stryCov_9fa48("11811");
            console.log(stryMutAct_9fa48("11812") ? "" : (stryCov_9fa48("11812"), 'Skipping thread creation:'), stryMutAct_9fa48("11813") ? {} : (stryCov_9fa48("11813"), {
              hasToken: stryMutAct_9fa48("11814") ? !token : (stryCov_9fa48("11814"), !(stryMutAct_9fa48("11815") ? token : (stryCov_9fa48("11815"), !token))),
              hasAssessmentId: stryMutAct_9fa48("11816") ? !assessmentId : (stryCov_9fa48("11816"), !(stryMutAct_9fa48("11817") ? assessmentId : (stryCov_9fa48("11817"), !assessmentId))),
              threadCreationInitiated: threadCreationInitiated.current,
              hasThreadId: stryMutAct_9fa48("11818") ? !threadId : (stryCov_9fa48("11818"), !(stryMutAct_9fa48("11819") ? threadId : (stryCov_9fa48("11819"), !threadId)))
            }));
          }
        }
      }
    }, stryMutAct_9fa48("11820") ? [] : (stryCov_9fa48("11820"), [assessmentId, token]));

    // Load initial conversation data when available
    useEffect(() => {
      if (stryMutAct_9fa48("11821")) {
        {}
      } else {
        stryCov_9fa48("11821");
        if (stryMutAct_9fa48("11824") ? initialConversation && initialConversation.messages || initialConversation.messages.length > 0 : stryMutAct_9fa48("11823") ? false : stryMutAct_9fa48("11822") ? true : (stryCov_9fa48("11822", "11823", "11824"), (stryMutAct_9fa48("11826") ? initialConversation || initialConversation.messages : stryMutAct_9fa48("11825") ? true : (stryCov_9fa48("11825", "11826"), initialConversation && initialConversation.messages)) && (stryMutAct_9fa48("11829") ? initialConversation.messages.length <= 0 : stryMutAct_9fa48("11828") ? initialConversation.messages.length >= 0 : stryMutAct_9fa48("11827") ? true : (stryCov_9fa48("11827", "11828", "11829"), initialConversation.messages.length > 0)))) {
          if (stryMutAct_9fa48("11830")) {
            {}
          } else {
            stryCov_9fa48("11830");
            console.log(stryMutAct_9fa48("11831") ? "" : (stryCov_9fa48("11831"), 'Loading initial conversation:'), initialConversation.messages.length, stryMutAct_9fa48("11832") ? "" : (stryCov_9fa48("11832"), 'messages'));
            setMessages(initialConversation.messages);
            if (stryMutAct_9fa48("11834") ? false : stryMutAct_9fa48("11833") ? true : (stryCov_9fa48("11833", "11834"), initialConversation.threadId)) {
              if (stryMutAct_9fa48("11835")) {
                {}
              } else {
                stryCov_9fa48("11835");
                setThreadId(initialConversation.threadId);
              }
            }
          }
        }
      }
    }, stryMutAct_9fa48("11836") ? [] : (stryCov_9fa48("11836"), [initialConversation]));
    const getOrCreateAssessmentThread = async () => {
      if (stryMutAct_9fa48("11837")) {
        {}
      } else {
        stryCov_9fa48("11837");
        console.log(stryMutAct_9fa48("11838") ? "" : (stryCov_9fa48("11838"), 'getOrCreateAssessmentThread called:'), stryMutAct_9fa48("11839") ? {} : (stryCov_9fa48("11839"), {
          isCreatingThread,
          threadId,
          assessmentId
        }));

        // Prevent concurrent thread creation
        if (stryMutAct_9fa48("11842") ? isCreatingThread && threadId : stryMutAct_9fa48("11841") ? false : stryMutAct_9fa48("11840") ? true : (stryCov_9fa48("11840", "11841", "11842"), isCreatingThread || threadId)) {
          if (stryMutAct_9fa48("11843")) {
            {}
          } else {
            stryCov_9fa48("11843");
            console.log(stryMutAct_9fa48("11844") ? "" : (stryCov_9fa48("11844"), 'Thread creation already in progress or thread exists, skipping...'), stryMutAct_9fa48("11845") ? {} : (stryCov_9fa48("11845"), {
              isCreatingThread,
              threadId
            }));
            return threadId;
          }
        }
        try {
          if (stryMutAct_9fa48("11846")) {
            {}
          } else {
            stryCov_9fa48("11846");
            console.log(stryMutAct_9fa48("11847") ? "" : (stryCov_9fa48("11847"), 'Setting isCreatingThread to true'));
            setIsCreatingThread(stryMutAct_9fa48("11848") ? false : (stryCov_9fa48("11848"), true));
            console.log(stryMutAct_9fa48("11849") ? "" : (stryCov_9fa48("11849"), 'Creating thread for assessment:'), assessmentId);
            const response = await fetch(stryMutAct_9fa48("11850") ? `` : (stryCov_9fa48("11850"), `${import.meta.env.VITE_API_URL}/api/assessments/${assessmentId}/thread`), stryMutAct_9fa48("11851") ? {} : (stryCov_9fa48("11851"), {
              method: stryMutAct_9fa48("11852") ? "" : (stryCov_9fa48("11852"), 'POST'),
              headers: stryMutAct_9fa48("11853") ? {} : (stryCov_9fa48("11853"), {
                'Authorization': stryMutAct_9fa48("11854") ? `` : (stryCov_9fa48("11854"), `Bearer ${token}`),
                'Content-Type': stryMutAct_9fa48("11855") ? "" : (stryCov_9fa48("11855"), 'application/json')
              })
            }));
            console.log(stryMutAct_9fa48("11856") ? "" : (stryCov_9fa48("11856"), 'Thread creation response status:'), response.status);
            if (stryMutAct_9fa48("11858") ? false : stryMutAct_9fa48("11857") ? true : (stryCov_9fa48("11857", "11858"), response.ok)) {
              if (stryMutAct_9fa48("11859")) {
                {}
              } else {
                stryCov_9fa48("11859");
                const data = await response.json();
                console.log(stryMutAct_9fa48("11860") ? "" : (stryCov_9fa48("11860"), 'Thread created successfully:'), data);
                setThreadId(data.threadId);

                // Only load messages from thread if we don't already have messages from initial conversation
                if (stryMutAct_9fa48("11863") ? messages.length !== 0 : stryMutAct_9fa48("11862") ? false : stryMutAct_9fa48("11861") ? true : (stryCov_9fa48("11861", "11862", "11863"), messages.length === 0)) {
                  if (stryMutAct_9fa48("11864")) {
                    {}
                  } else {
                    stryCov_9fa48("11864");
                    loadThreadMessages(data.threadId);
                  }
                }
                return data.threadId;
              }
            } else {
              if (stryMutAct_9fa48("11865")) {
                {}
              } else {
                stryCov_9fa48("11865");
                const errorData = await response.json();
                console.error(stryMutAct_9fa48("11866") ? "" : (stryCov_9fa48("11866"), 'Failed to get/create assessment thread:'), errorData);
                return null;
              }
            }
          }
        } catch (error) {
          if (stryMutAct_9fa48("11867")) {
            {}
          } else {
            stryCov_9fa48("11867");
            console.error(stryMutAct_9fa48("11868") ? "" : (stryCov_9fa48("11868"), 'Error getting assessment thread:'), error);
            return null;
          }
        } finally {
          if (stryMutAct_9fa48("11869")) {
            {}
          } else {
            stryCov_9fa48("11869");
            setIsCreatingThread(stryMutAct_9fa48("11870") ? true : (stryCov_9fa48("11870"), false));
          }
        }
      }
    };
    const loadThreadMessages = async threadId => {
      if (stryMutAct_9fa48("11871")) {
        {}
      } else {
        stryCov_9fa48("11871");
        try {
          if (stryMutAct_9fa48("11872")) {
            {}
          } else {
            stryCov_9fa48("11872");
            const response = await fetch(stryMutAct_9fa48("11873") ? `` : (stryCov_9fa48("11873"), `${import.meta.env.VITE_API_URL}/api/chat/messages?threadId=${threadId}`), stryMutAct_9fa48("11874") ? {} : (stryCov_9fa48("11874"), {
              headers: stryMutAct_9fa48("11875") ? {} : (stryCov_9fa48("11875"), {
                'Authorization': stryMutAct_9fa48("11876") ? `` : (stryCov_9fa48("11876"), `Bearer ${token}`),
                'Content-Type': stryMutAct_9fa48("11877") ? "" : (stryCov_9fa48("11877"), 'application/json')
              })
            }));
            if (stryMutAct_9fa48("11879") ? false : stryMutAct_9fa48("11878") ? true : (stryCov_9fa48("11878", "11879"), response.ok)) {
              if (stryMutAct_9fa48("11880")) {
                {}
              } else {
                stryCov_9fa48("11880");
                const data = await response.json();
                const formattedMessages = data.map(stryMutAct_9fa48("11881") ? () => undefined : (stryCov_9fa48("11881"), msg => stryMutAct_9fa48("11882") ? {} : (stryCov_9fa48("11882"), {
                  id: msg.message_id,
                  role: msg.message_role,
                  content: msg.content,
                  timestamp: msg.created_at
                })));
                setMessages(formattedMessages);
              }
            }
          }
        } catch (error) {
          if (stryMutAct_9fa48("11883")) {
            {}
          } else {
            stryCov_9fa48("11883");
            console.error(stryMutAct_9fa48("11884") ? "" : (stryCov_9fa48("11884"), 'Error loading thread messages:'), error);
          }
        }
      }
    };

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
      if (stryMutAct_9fa48("11885")) {
        {}
      } else {
        stryCov_9fa48("11885");
        scrollToBottom();
      }
    }, stryMutAct_9fa48("11886") ? [] : (stryCov_9fa48("11886"), [messages]));

    // Auto-resize textarea
    useEffect(() => {
      if (stryMutAct_9fa48("11887")) {
        {}
      } else {
        stryCov_9fa48("11887");
        if (stryMutAct_9fa48("11889") ? false : stryMutAct_9fa48("11888") ? true : (stryCov_9fa48("11888", "11889"), textareaRef.current)) {
          if (stryMutAct_9fa48("11890")) {
            {}
          } else {
            stryCov_9fa48("11890");
            textareaRef.current.style.height = stryMutAct_9fa48("11891") ? "" : (stryCov_9fa48("11891"), 'auto');
            textareaRef.current.style.height = textareaRef.current.scrollHeight + (stryMutAct_9fa48("11892") ? "" : (stryCov_9fa48("11892"), 'px'));
          }
        }
      }
    }, stryMutAct_9fa48("11893") ? [] : (stryCov_9fa48("11893"), [newMessage]));
    const scrollToBottom = () => {
      if (stryMutAct_9fa48("11894")) {
        {}
      } else {
        stryCov_9fa48("11894");
        stryMutAct_9fa48("11895") ? messagesEndRef.current.scrollIntoView({
          behavior: 'smooth'
        }) : (stryCov_9fa48("11895"), messagesEndRef.current?.scrollIntoView(stryMutAct_9fa48("11896") ? {} : (stryCov_9fa48("11896"), {
          behavior: stryMutAct_9fa48("11897") ? "" : (stryCov_9fa48("11897"), 'smooth')
        })));
      }
    };
    const updateConversationData = updatedMessages => {
      if (stryMutAct_9fa48("11898")) {
        {}
      } else {
        stryCov_9fa48("11898");
        const conversationData = stryMutAct_9fa48("11899") ? {} : (stryCov_9fa48("11899"), {
          conversation_id: stryMutAct_9fa48("11902") ? threadId && `conv_${Date.now()}` : stryMutAct_9fa48("11901") ? false : stryMutAct_9fa48("11900") ? true : (stryCov_9fa48("11900", "11901", "11902"), threadId || (stryMutAct_9fa48("11903") ? `` : (stryCov_9fa48("11903"), `conv_${Date.now()}`))),
          assessment_id: assessmentId,
          thread_id: threadId,
          threadId: threadId,
          // Also include threadId for easier access
          messages: updatedMessages,
          conversation_metadata: stryMutAct_9fa48("11904") ? {} : (stryCov_9fa48("11904"), {
            total_messages: updatedMessages.length,
            user_message_count: stryMutAct_9fa48("11905") ? updatedMessages.length : (stryCov_9fa48("11905"), updatedMessages.filter(stryMutAct_9fa48("11906") ? () => undefined : (stryCov_9fa48("11906"), m => stryMutAct_9fa48("11909") ? m.role !== 'user' : stryMutAct_9fa48("11908") ? false : stryMutAct_9fa48("11907") ? true : (stryCov_9fa48("11907", "11908", "11909"), m.role === (stryMutAct_9fa48("11910") ? "" : (stryCov_9fa48("11910"), 'user'))))).length),
            assistant_message_count: stryMutAct_9fa48("11911") ? updatedMessages.length : (stryCov_9fa48("11911"), updatedMessages.filter(stryMutAct_9fa48("11912") ? () => undefined : (stryCov_9fa48("11912"), m => stryMutAct_9fa48("11915") ? m.role !== 'assistant' : stryMutAct_9fa48("11914") ? false : stryMutAct_9fa48("11913") ? true : (stryCov_9fa48("11913", "11914", "11915"), m.role === (stryMutAct_9fa48("11916") ? "" : (stryCov_9fa48("11916"), 'assistant'))))).length),
            last_updated: new Date().toISOString(),
            conversation_duration_minutes: Math.round(stryMutAct_9fa48("11917") ? (new Date() - new Date(updatedMessages[0]?.timestamp || Date.now())) * (1000 * 60) : (stryCov_9fa48("11917"), (stryMutAct_9fa48("11918") ? new Date() + new Date(updatedMessages[0]?.timestamp || Date.now()) : (stryCov_9fa48("11918"), new Date() - new Date(stryMutAct_9fa48("11921") ? updatedMessages[0]?.timestamp && Date.now() : stryMutAct_9fa48("11920") ? false : stryMutAct_9fa48("11919") ? true : (stryCov_9fa48("11919", "11920", "11921"), (stryMutAct_9fa48("11922") ? updatedMessages[0].timestamp : (stryCov_9fa48("11922"), updatedMessages[0]?.timestamp)) || Date.now())))) / (stryMutAct_9fa48("11923") ? 1000 / 60 : (stryCov_9fa48("11923"), 1000 * 60))))
          })
        });
        if (stryMutAct_9fa48("11925") ? false : stryMutAct_9fa48("11924") ? true : (stryCov_9fa48("11924", "11925"), onConversationUpdate)) {
          if (stryMutAct_9fa48("11926")) {
            {}
          } else {
            stryCov_9fa48("11926");
            onConversationUpdate(conversationData);
          }
        }
      }
    };

    // Format message content similar to GPT component
    const formatMessageContent = content => {
      if (stryMutAct_9fa48("11927")) {
        {}
      } else {
        stryCov_9fa48("11927");
        // More robust regex to handle multiple code blocks
        const parts = content.split(stryMutAct_9fa48("11931") ? /(```[\s\s]*?```)/g : stryMutAct_9fa48("11930") ? /(```[\S\S]*?```)/g : stryMutAct_9fa48("11929") ? /(```[^\s\S]*?```)/g : stryMutAct_9fa48("11928") ? /(```[\s\S]```)/g : (stryCov_9fa48("11928", "11929", "11930", "11931"), /(```[\s\S]*?```)/g));
        return stryMutAct_9fa48("11932") ? parts.map((part, index) => {
          if (part.startsWith('```')) {
            // Extract language and code with better regex
            const match = part.match(/```(\w+)?\s*\n?([\s\S]*?)\s*```/);
            const language = match?.[1] || '';
            const code = match?.[2] || '';
            return <pre key={index} className="assessment-code-block">
            {language && <div className="assessment-code-language">{language}</div>}
            <code>{code}</code>
          </pre>;
          }

          // Skip empty parts
          if (!part.trim()) {
            return null;
          }
          return <ReactMarkdown key={index} components={{
            // Override code handling to ensure no ReactMarkdown code blocks interfere
            code: ({
              node,
              inline,
              className,
              children,
              ...props
            }) => {
              if (inline) {
                return <code className="inline-code" {...props}>
                    {children}
                  </code>;
              }
              // For block code that ReactMarkdown tries to render, force our styling
              return <pre className="assessment-code-block" {...props}>
                  <code>{children}</code>
                </pre>;
            },
            pre: ({
              node,
              children,
              ...props
            }) => {
              // Override pre elements to use our styling
              return <pre className="assessment-code-block" {...props}>
                  {children}
                </pre>;
            },
            p: ({
              node,
              children,
              ...props
            }) => <p className="markdown-paragraph" {...props}>{children}</p>,
            h1: ({
              node,
              children,
              ...props
            }) => <h1 className="markdown-heading" {...props}>{children}</h1>,
            h2: ({
              node,
              children,
              ...props
            }) => <h2 className="markdown-heading" {...props}>{children}</h2>,
            h3: ({
              node,
              children,
              ...props
            }) => <h3 className="markdown-heading" {...props}>{children}</h3>,
            h4: ({
              node,
              children,
              ...props
            }) => <h4 className="markdown-heading" {...props}>{children}</h4>,
            h5: ({
              node,
              children,
              ...props
            }) => <h5 className="markdown-heading" {...props}>{children}</h5>,
            h6: ({
              node,
              children,
              ...props
            }) => <h6 className="markdown-heading" {...props}>{children}</h6>,
            ul: ({
              node,
              children,
              ...props
            }) => <ul className="markdown-list" {...props}>{children}</ul>,
            ol: ({
              node,
              children,
              ...props
            }) => <ol className="markdown-list" {...props}>{children}</ol>,
            li: ({
              node,
              children,
              ...props
            }) => <li className="markdown-list-item" {...props}>{children}</li>,
            a: ({
              node,
              children,
              ...props
            }) => <a className="markdown-link" target="_blank" rel="noopener noreferrer" {...props}>{children}</a>,
            blockquote: ({
              node,
              children,
              ...props
            }) => <blockquote className="markdown-blockquote" {...props}>{children}</blockquote>,
            table: ({
              node,
              children,
              ...props
            }) => <table className="markdown-table" {...props}>{children}</table>
          }}>
          {part}
        </ReactMarkdown>;
        }) : (stryCov_9fa48("11932"), parts.map((part, index) => {
          if (stryMutAct_9fa48("11933")) {
            {}
          } else {
            stryCov_9fa48("11933");
            if (stryMutAct_9fa48("11936") ? part.endsWith('```') : stryMutAct_9fa48("11935") ? false : stryMutAct_9fa48("11934") ? true : (stryCov_9fa48("11934", "11935", "11936"), part.startsWith(stryMutAct_9fa48("11937") ? "" : (stryCov_9fa48("11937"), '```')))) {
              if (stryMutAct_9fa48("11938")) {
                {}
              } else {
                stryCov_9fa48("11938");
                // Extract language and code with better regex
                const match = part.match(stryMutAct_9fa48("11950") ? /```(\w+)?\s*\n?([\s\S]*?)\S*```/ : stryMutAct_9fa48("11949") ? /```(\w+)?\s*\n?([\s\S]*?)\s```/ : stryMutAct_9fa48("11948") ? /```(\w+)?\s*\n?([\s\s]*?)\s*```/ : stryMutAct_9fa48("11947") ? /```(\w+)?\s*\n?([\S\S]*?)\s*```/ : stryMutAct_9fa48("11946") ? /```(\w+)?\s*\n?([^\s\S]*?)\s*```/ : stryMutAct_9fa48("11945") ? /```(\w+)?\s*\n?([\s\S])\s*```/ : stryMutAct_9fa48("11944") ? /```(\w+)?\s*\n([\s\S]*?)\s*```/ : stryMutAct_9fa48("11943") ? /```(\w+)?\S*\n?([\s\S]*?)\s*```/ : stryMutAct_9fa48("11942") ? /```(\w+)?\s\n?([\s\S]*?)\s*```/ : stryMutAct_9fa48("11941") ? /```(\W+)?\s*\n?([\s\S]*?)\s*```/ : stryMutAct_9fa48("11940") ? /```(\w)?\s*\n?([\s\S]*?)\s*```/ : stryMutAct_9fa48("11939") ? /```(\w+)\s*\n?([\s\S]*?)\s*```/ : (stryCov_9fa48("11939", "11940", "11941", "11942", "11943", "11944", "11945", "11946", "11947", "11948", "11949", "11950"), /```(\w+)?\s*\n?([\s\S]*?)\s*```/));
                const language = stryMutAct_9fa48("11953") ? match?.[1] && '' : stryMutAct_9fa48("11952") ? false : stryMutAct_9fa48("11951") ? true : (stryCov_9fa48("11951", "11952", "11953"), (stryMutAct_9fa48("11954") ? match[1] : (stryCov_9fa48("11954"), match?.[1])) || (stryMutAct_9fa48("11955") ? "Stryker was here!" : (stryCov_9fa48("11955"), '')));
                const code = stryMutAct_9fa48("11958") ? match?.[2] && '' : stryMutAct_9fa48("11957") ? false : stryMutAct_9fa48("11956") ? true : (stryCov_9fa48("11956", "11957", "11958"), (stryMutAct_9fa48("11959") ? match[2] : (stryCov_9fa48("11959"), match?.[2])) || (stryMutAct_9fa48("11960") ? "Stryker was here!" : (stryCov_9fa48("11960"), '')));
                return <pre key={index} className="assessment-code-block">
            {stryMutAct_9fa48("11963") ? language || <div className="assessment-code-language">{language}</div> : stryMutAct_9fa48("11962") ? false : stryMutAct_9fa48("11961") ? true : (stryCov_9fa48("11961", "11962", "11963"), language && <div className="assessment-code-language">{language}</div>)}
            <code>{code}</code>
          </pre>;
              }
            }

            // Skip empty parts
            if (stryMutAct_9fa48("11966") ? false : stryMutAct_9fa48("11965") ? true : stryMutAct_9fa48("11964") ? part.trim() : (stryCov_9fa48("11964", "11965", "11966"), !(stryMutAct_9fa48("11967") ? part : (stryCov_9fa48("11967"), part.trim())))) {
              if (stryMutAct_9fa48("11968")) {
                {}
              } else {
                stryCov_9fa48("11968");
                return null;
              }
            }
            return <ReactMarkdown key={index} components={stryMutAct_9fa48("11969") ? {} : (stryCov_9fa48("11969"), {
              // Override code handling to ensure no ReactMarkdown code blocks interfere
              code: ({
                node,
                inline,
                className,
                children,
                ...props
              }) => {
                if (stryMutAct_9fa48("11970")) {
                  {}
                } else {
                  stryCov_9fa48("11970");
                  if (stryMutAct_9fa48("11972") ? false : stryMutAct_9fa48("11971") ? true : (stryCov_9fa48("11971", "11972"), inline)) {
                    if (stryMutAct_9fa48("11973")) {
                      {}
                    } else {
                      stryCov_9fa48("11973");
                      return <code className="inline-code" {...props}>
                    {children}
                  </code>;
                    }
                  }
                  // For block code that ReactMarkdown tries to render, force our styling
                  return <pre className="assessment-code-block" {...props}>
                  <code>{children}</code>
                </pre>;
                }
              },
              pre: ({
                node,
                children,
                ...props
              }) => {
                if (stryMutAct_9fa48("11974")) {
                  {}
                } else {
                  stryCov_9fa48("11974");
                  // Override pre elements to use our styling
                  return <pre className="assessment-code-block" {...props}>
                  {children}
                </pre>;
                }
              },
              p: stryMutAct_9fa48("11975") ? () => undefined : (stryCov_9fa48("11975"), ({
                node,
                children,
                ...props
              }) => <p className="markdown-paragraph" {...props}>{children}</p>),
              h1: stryMutAct_9fa48("11976") ? () => undefined : (stryCov_9fa48("11976"), ({
                node,
                children,
                ...props
              }) => <h1 className="markdown-heading" {...props}>{children}</h1>),
              h2: stryMutAct_9fa48("11977") ? () => undefined : (stryCov_9fa48("11977"), ({
                node,
                children,
                ...props
              }) => <h2 className="markdown-heading" {...props}>{children}</h2>),
              h3: stryMutAct_9fa48("11978") ? () => undefined : (stryCov_9fa48("11978"), ({
                node,
                children,
                ...props
              }) => <h3 className="markdown-heading" {...props}>{children}</h3>),
              h4: stryMutAct_9fa48("11979") ? () => undefined : (stryCov_9fa48("11979"), ({
                node,
                children,
                ...props
              }) => <h4 className="markdown-heading" {...props}>{children}</h4>),
              h5: stryMutAct_9fa48("11980") ? () => undefined : (stryCov_9fa48("11980"), ({
                node,
                children,
                ...props
              }) => <h5 className="markdown-heading" {...props}>{children}</h5>),
              h6: stryMutAct_9fa48("11981") ? () => undefined : (stryCov_9fa48("11981"), ({
                node,
                children,
                ...props
              }) => <h6 className="markdown-heading" {...props}>{children}</h6>),
              ul: stryMutAct_9fa48("11982") ? () => undefined : (stryCov_9fa48("11982"), ({
                node,
                children,
                ...props
              }) => <ul className="markdown-list" {...props}>{children}</ul>),
              ol: stryMutAct_9fa48("11983") ? () => undefined : (stryCov_9fa48("11983"), ({
                node,
                children,
                ...props
              }) => <ol className="markdown-list" {...props}>{children}</ol>),
              li: stryMutAct_9fa48("11984") ? () => undefined : (stryCov_9fa48("11984"), ({
                node,
                children,
                ...props
              }) => <li className="markdown-list-item" {...props}>{children}</li>),
              a: stryMutAct_9fa48("11985") ? () => undefined : (stryCov_9fa48("11985"), ({
                node,
                children,
                ...props
              }) => <a className="markdown-link" target="_blank" rel="noopener noreferrer" {...props}>{children}</a>),
              blockquote: stryMutAct_9fa48("11986") ? () => undefined : (stryCov_9fa48("11986"), ({
                node,
                children,
                ...props
              }) => <blockquote className="markdown-blockquote" {...props}>{children}</blockquote>),
              table: stryMutAct_9fa48("11987") ? () => undefined : (stryCov_9fa48("11987"), ({
                node,
                children,
                ...props
              }) => <table className="markdown-table" {...props}>{children}</table>)
            })}>
          {part}
        </ReactMarkdown>;
          }
        }).filter(Boolean));
      }
    };
    const handleSendMessage = async e => {
      if (stryMutAct_9fa48("11988")) {
        {}
      } else {
        stryCov_9fa48("11988");
        e.preventDefault();
        if (stryMutAct_9fa48("11991") ? (!newMessage.trim() || isSending || disabled) && isCreatingThread : stryMutAct_9fa48("11990") ? false : stryMutAct_9fa48("11989") ? true : (stryCov_9fa48("11989", "11990", "11991"), (stryMutAct_9fa48("11993") ? (!newMessage.trim() || isSending) && disabled : stryMutAct_9fa48("11992") ? false : (stryCov_9fa48("11992", "11993"), (stryMutAct_9fa48("11995") ? !newMessage.trim() && isSending : stryMutAct_9fa48("11994") ? false : (stryCov_9fa48("11994", "11995"), (stryMutAct_9fa48("11996") ? newMessage.trim() : (stryCov_9fa48("11996"), !(stryMutAct_9fa48("11997") ? newMessage : (stryCov_9fa48("11997"), newMessage.trim())))) || isSending)) || disabled)) || isCreatingThread)) return;

        // If no threadId yet, try to create one first
        let currentThreadId = threadId;
        if (stryMutAct_9fa48("12000") ? false : stryMutAct_9fa48("11999") ? true : stryMutAct_9fa48("11998") ? currentThreadId : (stryCov_9fa48("11998", "11999", "12000"), !currentThreadId)) {
          if (stryMutAct_9fa48("12001")) {
            {}
          } else {
            stryCov_9fa48("12001");
            console.log(stryMutAct_9fa48("12002") ? "" : (stryCov_9fa48("12002"), 'No threadId, attempting to create thread...'));
            currentThreadId = await getOrCreateAssessmentThread();
            if (stryMutAct_9fa48("12005") ? false : stryMutAct_9fa48("12004") ? true : stryMutAct_9fa48("12003") ? currentThreadId : (stryCov_9fa48("12003", "12004", "12005"), !currentThreadId)) {
              if (stryMutAct_9fa48("12006")) {
                {}
              } else {
                stryCov_9fa48("12006");
                console.error(stryMutAct_9fa48("12007") ? "" : (stryCov_9fa48("12007"), 'Could not create thread, cannot send message'));
                setError(stryMutAct_9fa48("12008") ? "" : (stryCov_9fa48("12008"), 'Unable to create conversation thread. Please refresh the page.'));
                return;
              }
            }
          }
        }
        const messageToSend = stryMutAct_9fa48("12009") ? newMessage : (stryCov_9fa48("12009"), newMessage.trim());
        setNewMessage(stryMutAct_9fa48("12010") ? "Stryker was here!" : (stryCov_9fa48("12010"), ''));
        setError(stryMutAct_9fa48("12011") ? "Stryker was here!" : (stryCov_9fa48("12011"), ''));
        setIsSending(stryMutAct_9fa48("12012") ? false : (stryCov_9fa48("12012"), true));
        setIsAiThinking(stryMutAct_9fa48("12013") ? false : (stryCov_9fa48("12013"), true));

        // Add user message immediately
        const userMessage = stryMutAct_9fa48("12014") ? {} : (stryCov_9fa48("12014"), {
          id: Date.now(),
          role: stryMutAct_9fa48("12015") ? "" : (stryCov_9fa48("12015"), 'user'),
          content: messageToSend,
          timestamp: new Date().toISOString()
        });
        const updatedMessages = stryMutAct_9fa48("12016") ? [] : (stryCov_9fa48("12016"), [...messages, userMessage]);
        setMessages(updatedMessages);
        try {
          if (stryMutAct_9fa48("12017")) {
            {}
          } else {
            stryCov_9fa48("12017");
            // Send message to GPT API
            const response = await fetch(stryMutAct_9fa48("12018") ? `` : (stryCov_9fa48("12018"), `${import.meta.env.VITE_API_URL}/api/chat/messages`), stryMutAct_9fa48("12019") ? {} : (stryCov_9fa48("12019"), {
              method: stryMutAct_9fa48("12020") ? "" : (stryCov_9fa48("12020"), 'POST'),
              headers: stryMutAct_9fa48("12021") ? {} : (stryCov_9fa48("12021"), {
                'Authorization': stryMutAct_9fa48("12022") ? `` : (stryCov_9fa48("12022"), `Bearer ${token}`),
                'Content-Type': stryMutAct_9fa48("12023") ? "" : (stryCov_9fa48("12023"), 'application/json')
              }),
              body: JSON.stringify(stryMutAct_9fa48("12024") ? {} : (stryCov_9fa48("12024"), {
                content: messageToSend,
                threadId: currentThreadId // Use the current thread ID (might be newly created)
              }))
            }));
            if (stryMutAct_9fa48("12026") ? false : stryMutAct_9fa48("12025") ? true : (stryCov_9fa48("12025", "12026"), response.ok)) {
              if (stryMutAct_9fa48("12027")) {
                {}
              } else {
                stryCov_9fa48("12027");
                const data = await response.json();

                // Add AI response
                const aiMessage = stryMutAct_9fa48("12028") ? {} : (stryCov_9fa48("12028"), {
                  id: stryMutAct_9fa48("12029") ? Date.now() - 1 : (stryCov_9fa48("12029"), Date.now() + 1),
                  role: stryMutAct_9fa48("12030") ? "" : (stryCov_9fa48("12030"), 'assistant'),
                  content: stryMutAct_9fa48("12033") ? (data.reply?.content || data.content) && "I'm here to help you work through this assessment task." : stryMutAct_9fa48("12032") ? false : stryMutAct_9fa48("12031") ? true : (stryCov_9fa48("12031", "12032", "12033"), (stryMutAct_9fa48("12035") ? data.reply?.content && data.content : stryMutAct_9fa48("12034") ? false : (stryCov_9fa48("12034", "12035"), (stryMutAct_9fa48("12036") ? data.reply.content : (stryCov_9fa48("12036"), data.reply?.content)) || data.content)) || (stryMutAct_9fa48("12037") ? "" : (stryCov_9fa48("12037"), "I'm here to help you work through this assessment task."))),
                  timestamp: new Date().toISOString()
                });
                const finalMessages = stryMutAct_9fa48("12038") ? [] : (stryCov_9fa48("12038"), [...updatedMessages, aiMessage]);
                setMessages(finalMessages);
                updateConversationData(finalMessages);
              }
            } else {
              if (stryMutAct_9fa48("12039")) {
                {}
              } else {
                stryCov_9fa48("12039");
                throw new Error(stryMutAct_9fa48("12040") ? "" : (stryCov_9fa48("12040"), 'Failed to get AI response'));
              }
            }
          }
        } catch (err) {
          if (stryMutAct_9fa48("12041")) {
            {}
          } else {
            stryCov_9fa48("12041");
            console.error(stryMutAct_9fa48("12042") ? "" : (stryCov_9fa48("12042"), 'Error sending message:'), err);
            setError(stryMutAct_9fa48("12043") ? "" : (stryCov_9fa48("12043"), 'Failed to get AI response. Please try again.'));

            // Add fallback AI response
            const fallbackMessage = stryMutAct_9fa48("12044") ? {} : (stryCov_9fa48("12044"), {
              id: stryMutAct_9fa48("12045") ? Date.now() - 1 : (stryCov_9fa48("12045"), Date.now() + 1),
              role: stryMutAct_9fa48("12046") ? "" : (stryCov_9fa48("12046"), 'assistant'),
              content: stryMutAct_9fa48("12047") ? "" : (stryCov_9fa48("12047"), "I'm having trouble connecting right now. Please try sending your message again."),
              timestamp: new Date().toISOString()
            });
            const finalMessages = stryMutAct_9fa48("12048") ? [] : (stryCov_9fa48("12048"), [...updatedMessages, fallbackMessage]);
            setMessages(finalMessages);
            updateConversationData(finalMessages);
          }
        } finally {
          if (stryMutAct_9fa48("12049")) {
            {}
          } else {
            stryCov_9fa48("12049");
            setIsSending(stryMutAct_9fa48("12050") ? true : (stryCov_9fa48("12050"), false));
            setIsAiThinking(stryMutAct_9fa48("12051") ? true : (stryCov_9fa48("12051"), false));
          }
        }
      }
    };
    const handleKeyPress = e => {
      if (stryMutAct_9fa48("12052")) {
        {}
      } else {
        stryCov_9fa48("12052");
        if (stryMutAct_9fa48("12055") ? e.key === 'Enter' || !e.shiftKey : stryMutAct_9fa48("12054") ? false : stryMutAct_9fa48("12053") ? true : (stryCov_9fa48("12053", "12054", "12055"), (stryMutAct_9fa48("12057") ? e.key !== 'Enter' : stryMutAct_9fa48("12056") ? true : (stryCov_9fa48("12056", "12057"), e.key === (stryMutAct_9fa48("12058") ? "" : (stryCov_9fa48("12058"), 'Enter')))) && (stryMutAct_9fa48("12059") ? e.shiftKey : (stryCov_9fa48("12059"), !e.shiftKey)))) {
          if (stryMutAct_9fa48("12060")) {
            {}
          } else {
            stryCov_9fa48("12060");
            e.preventDefault();
            handleSendMessage(e);
          }
        }
      }
    };
    return <div className="assessment-llm-chat">
      <div className="assessment-llm-chat__header">
        <div className="assessment-llm-chat__title">
          <FaRobot className="assessment-llm-chat__icon" />
          AI Assistant
          {stryMutAct_9fa48("12063") ? threadId || <span className="assessment-llm-chat__thread-status">✓ Connected</span> : stryMutAct_9fa48("12062") ? false : stryMutAct_9fa48("12061") ? true : (stryCov_9fa48("12061", "12062", "12063"), threadId && <span className="assessment-llm-chat__thread-status">✓ Connected</span>)}
          {stryMutAct_9fa48("12066") ? !threadId || <span className="assessment-llm-chat__thread-status">⏳ Connecting...</span> : stryMutAct_9fa48("12065") ? false : stryMutAct_9fa48("12064") ? true : (stryCov_9fa48("12064", "12065", "12066"), (stryMutAct_9fa48("12067") ? threadId : (stryCov_9fa48("12067"), !threadId)) && <span className="assessment-llm-chat__thread-status">⏳ Connecting...</span>)}
        </div>
        <div className="assessment-llm-chat__header-buttons">
          {stryMutAct_9fa48("12070") ? disabled || <span className="assessment-llm-chat__disabled-notice">
              View Only
            </span> : stryMutAct_9fa48("12069") ? false : stryMutAct_9fa48("12068") ? true : (stryCov_9fa48("12068", "12069", "12070"), disabled && <span className="assessment-llm-chat__disabled-notice">
              View Only
            </span>)}
          {stryMutAct_9fa48("12073") ? onBackToAssessments || <button onClick={onBackToAssessments} className="assessment-llm-chat__header-btn">
              <FaArrowLeft /> Back to Assessments
            </button> : stryMutAct_9fa48("12072") ? false : stryMutAct_9fa48("12071") ? true : (stryCov_9fa48("12071", "12072", "12073"), onBackToAssessments && <button onClick={onBackToAssessments} className="assessment-llm-chat__header-btn">
              <FaArrowLeft /> Back to Assessments
            </button>)}
          {stryMutAct_9fa48("12076") ? onShowInstructions || <button onClick={onShowInstructions} className="assessment-llm-chat__header-btn">
              <FaInfoCircle /> View Instructions
            </button> : stryMutAct_9fa48("12075") ? false : stryMutAct_9fa48("12074") ? true : (stryCov_9fa48("12074", "12075", "12076"), onShowInstructions && <button onClick={onShowInstructions} className="assessment-llm-chat__header-btn">
              <FaInfoCircle /> View Instructions
            </button>)}
          {stryMutAct_9fa48("12079") ? onSubmitDeliverables && !readonly || <button onClick={onSubmitDeliverables} className={`assessment-llm-chat__header-btn ${isSubmissionPanelOpen ? '' : 'assessment-llm-chat__header-btn--primary'}`}>
              {isSubmissionPanelOpen ? 'Close Deliverables' : 'Submit Deliverables'}
            </button> : stryMutAct_9fa48("12078") ? false : stryMutAct_9fa48("12077") ? true : (stryCov_9fa48("12077", "12078", "12079"), (stryMutAct_9fa48("12081") ? onSubmitDeliverables || !readonly : stryMutAct_9fa48("12080") ? true : (stryCov_9fa48("12080", "12081"), onSubmitDeliverables && (stryMutAct_9fa48("12082") ? readonly : (stryCov_9fa48("12082"), !readonly)))) && <button onClick={onSubmitDeliverables} className={stryMutAct_9fa48("12083") ? `` : (stryCov_9fa48("12083"), `assessment-llm-chat__header-btn ${isSubmissionPanelOpen ? stryMutAct_9fa48("12084") ? "Stryker was here!" : (stryCov_9fa48("12084"), '') : stryMutAct_9fa48("12085") ? "" : (stryCov_9fa48("12085"), 'assessment-llm-chat__header-btn--primary')}`)}>
              {isSubmissionPanelOpen ? stryMutAct_9fa48("12086") ? "" : (stryCov_9fa48("12086"), 'Close Deliverables') : stryMutAct_9fa48("12087") ? "" : (stryCov_9fa48("12087"), 'Submit Deliverables')}
            </button>)}
          {stryMutAct_9fa48("12090") ? readonly || <span className="assessment-llm-chat__readonly-badge">
              Read Only
            </span> : stryMutAct_9fa48("12089") ? false : stryMutAct_9fa48("12088") ? true : (stryCov_9fa48("12088", "12089", "12090"), readonly && <span className="assessment-llm-chat__readonly-badge">
              Read Only
            </span>)}
        </div>
      </div>

      <div className="assessment-llm-chat__messages">
        {stryMutAct_9fa48("12093") ? messages.length === 0 || <div className="assessment-llm-chat__welcome">
            <FaRobot className="assessment-llm-chat__welcome-icon" />
            <div>
              <h3>Welcome to your AI Assistant</h3>
              <p>
                I'm here to help you work through this assessment task. 
                Ask me questions, explore ideas, or discuss your approach to the problem.
              </p>
            </div>
          </div> : stryMutAct_9fa48("12092") ? false : stryMutAct_9fa48("12091") ? true : (stryCov_9fa48("12091", "12092", "12093"), (stryMutAct_9fa48("12095") ? messages.length !== 0 : stryMutAct_9fa48("12094") ? true : (stryCov_9fa48("12094", "12095"), messages.length === 0)) && <div className="assessment-llm-chat__welcome">
            <FaRobot className="assessment-llm-chat__welcome-icon" />
            <div>
              <h3>Welcome to your AI Assistant</h3>
              <p>
                I'm here to help you work through this assessment task. 
                Ask me questions, explore ideas, or discuss your approach to the problem.
              </p>
            </div>
          </div>)}

        {messages.map(stryMutAct_9fa48("12096") ? () => undefined : (stryCov_9fa48("12096"), message => <div key={message.id} className={stryMutAct_9fa48("12097") ? `` : (stryCov_9fa48("12097"), `assessment-llm-chat__message assessment-llm-chat__message--${message.role}`)}>
            <div className="assessment-llm-chat__message-avatar">
              {(stryMutAct_9fa48("12100") ? message.role !== 'user' : stryMutAct_9fa48("12099") ? false : stryMutAct_9fa48("12098") ? true : (stryCov_9fa48("12098", "12099", "12100"), message.role === (stryMutAct_9fa48("12101") ? "" : (stryCov_9fa48("12101"), 'user')))) ? <FaUser /> : <FaRobot />}
            </div>
            <div className="assessment-llm-chat__message-content">
              <div className="assessment-llm-chat__message-text">
                {(stryMutAct_9fa48("12104") ? message.role !== 'assistant' : stryMutAct_9fa48("12103") ? false : stryMutAct_9fa48("12102") ? true : (stryCov_9fa48("12102", "12103", "12104"), message.role === (stryMutAct_9fa48("12105") ? "" : (stryCov_9fa48("12105"), 'assistant')))) ? formatMessageContent(message.content) : <p>{message.content}</p>}
              </div>
              <div className="assessment-llm-chat__message-time">
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>))}

        {stryMutAct_9fa48("12108") ? isAiThinking || <div className="assessment-llm-chat__message assessment-llm-chat__message--assistant">
            <div className="assessment-llm-chat__message-avatar">
              <FaRobot />
            </div>
            <div className="assessment-llm-chat__message-content">
              <div className="assessment-llm-chat__thinking">
                <div className="assessment-llm-chat__thinking-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span>AI is thinking...</span>
              </div>
            </div>
          </div> : stryMutAct_9fa48("12107") ? false : stryMutAct_9fa48("12106") ? true : (stryCov_9fa48("12106", "12107", "12108"), isAiThinking && <div className="assessment-llm-chat__message assessment-llm-chat__message--assistant">
            <div className="assessment-llm-chat__message-avatar">
              <FaRobot />
            </div>
            <div className="assessment-llm-chat__message-content">
              <div className="assessment-llm-chat__thinking">
                <div className="assessment-llm-chat__thinking-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span>AI is thinking...</span>
              </div>
            </div>
          </div>)}

        <div ref={messagesEndRef} />
      </div>

      {stryMutAct_9fa48("12111") ? error || <div className="assessment-llm-chat__error">
          <p>{error}</p>
          <button onClick={() => setError('')}>×</button>
        </div> : stryMutAct_9fa48("12110") ? false : stryMutAct_9fa48("12109") ? true : (stryCov_9fa48("12109", "12110", "12111"), error && <div className="assessment-llm-chat__error">
          <p>{error}</p>
          <button onClick={stryMutAct_9fa48("12112") ? () => undefined : (stryCov_9fa48("12112"), () => setError(stryMutAct_9fa48("12113") ? "Stryker was here!" : (stryCov_9fa48("12113"), '')))}>×</button>
        </div>)}

      {stryMutAct_9fa48("12116") ? !disabled || <form onSubmit={handleSendMessage} className="assessment-llm-chat__input-form">
          <div className="assessment-llm-chat__input-container">
            <textarea ref={textareaRef} value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyPress={handleKeyPress} placeholder="Ask questions or discuss your approach to this assessment..." className="assessment-llm-chat__input" disabled={isSending || isCreatingThread} rows={1} />
            <button type="submit" disabled={!newMessage.trim() || isSending || isCreatingThread} className="assessment-llm-chat__send-btn">
              <FaPaperPlane />
            </button>
          </div>
        </form> : stryMutAct_9fa48("12115") ? false : stryMutAct_9fa48("12114") ? true : (stryCov_9fa48("12114", "12115", "12116"), (stryMutAct_9fa48("12117") ? disabled : (stryCov_9fa48("12117"), !disabled)) && <form onSubmit={handleSendMessage} className="assessment-llm-chat__input-form">
          <div className="assessment-llm-chat__input-container">
            <textarea ref={textareaRef} value={newMessage} onChange={stryMutAct_9fa48("12118") ? () => undefined : (stryCov_9fa48("12118"), e => setNewMessage(e.target.value))} onKeyPress={handleKeyPress} placeholder="Ask questions or discuss your approach to this assessment..." className="assessment-llm-chat__input" disabled={stryMutAct_9fa48("12121") ? isSending && isCreatingThread : stryMutAct_9fa48("12120") ? false : stryMutAct_9fa48("12119") ? true : (stryCov_9fa48("12119", "12120", "12121"), isSending || isCreatingThread)} rows={1} />
            <button type="submit" disabled={stryMutAct_9fa48("12124") ? (!newMessage.trim() || isSending) && isCreatingThread : stryMutAct_9fa48("12123") ? false : stryMutAct_9fa48("12122") ? true : (stryCov_9fa48("12122", "12123", "12124"), (stryMutAct_9fa48("12126") ? !newMessage.trim() && isSending : stryMutAct_9fa48("12125") ? false : (stryCov_9fa48("12125", "12126"), (stryMutAct_9fa48("12127") ? newMessage.trim() : (stryCov_9fa48("12127"), !(stryMutAct_9fa48("12128") ? newMessage : (stryCov_9fa48("12128"), newMessage.trim())))) || isSending)) || isCreatingThread)} className="assessment-llm-chat__send-btn">
              <FaPaperPlane />
            </button>
          </div>
        </form>)}
    </div>;
  }
}
export default AssessmentLLMChat;