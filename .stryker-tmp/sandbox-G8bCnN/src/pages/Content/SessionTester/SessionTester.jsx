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
import { FaUpload, FaEye, FaTrash, FaCheckCircle, FaUsers, FaBook, FaPaperPlane, FaArrowLeft, FaArrowRight, FaBars, FaLink, FaExternalLinkAlt, FaFileAlt, FaVideo, FaExpand, FaTimes, FaEdit, FaPlus, FaSave, FaDownload, FaCheck } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import './SessionTester.css';
const SessionTester = ({
  sharedData,
  updateSharedData
}) => {
  if (stryMutAct_9fa48("18486")) {
    {}
  } else {
    stryCov_9fa48("18486");
    const [sessionData, setSessionData] = useState(null);
    const [jsonInput, setJsonInput] = useState(stryMutAct_9fa48("18487") ? "Stryker was here!" : (stryCov_9fa48("18487"), ''));
    const [error, setError] = useState(stryMutAct_9fa48("18488") ? "Stryker was here!" : (stryCov_9fa48("18488"), ''));
    const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
    const [previewMode, setPreviewMode] = useState(stryMutAct_9fa48("18489") ? "" : (stryCov_9fa48("18489"), 'learning')); // 'learning' or 'past-session'
    const [tasks, setTasks] = useState(stryMutAct_9fa48("18490") ? ["Stryker was here"] : (stryCov_9fa48("18490"), []));
    const [currentDay, setCurrentDay] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(stryMutAct_9fa48("18491") ? true : (stryCov_9fa48("18491"), false));
    const [messages, setMessages] = useState(stryMutAct_9fa48("18492") ? ["Stryker was here"] : (stryCov_9fa48("18492"), []));
    const [allDays, setAllDays] = useState(stryMutAct_9fa48("18493") ? ["Stryker was here"] : (stryCov_9fa48("18493"), []));
    const [currentDayIndex, setCurrentDayIndex] = useState(0);
    const [editingMessageId, setEditingMessageId] = useState(null);
    const [editingText, setEditingText] = useState(stryMutAct_9fa48("18494") ? "Stryker was here!" : (stryCov_9fa48("18494"), ''));
    const [editingTaskField, setEditingTaskField] = useState(null); // 'title', 'description', 'startTime', 'endTime'
    const [editingTaskValue, setEditingTaskValue] = useState(stryMutAct_9fa48("18495") ? "Stryker was here!" : (stryCov_9fa48("18495"), ''));
    const [editingResourceIndex, setEditingResourceIndex] = useState(null);
    const [editingResourceField, setEditingResourceField] = useState(null); // 'title', 'url', 'description'
    const [editingResourceValue, setEditingResourceValue] = useState(stryMutAct_9fa48("18496") ? "Stryker was here!" : (stryCov_9fa48("18496"), ''));
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(stryMutAct_9fa48("18497") ? true : (stryCov_9fa48("18497"), false));
    const [isUpdatingFromEdit, setIsUpdatingFromEdit] = useState(stryMutAct_9fa48("18498") ? true : (stryCov_9fa48("18498"), false));
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(stryMutAct_9fa48("18499") ? true : (stryCov_9fa48("18499"), false));
    const [taskToDelete, setTaskToDelete] = useState(null);
    const fileInputRef = useRef(null);

    // Listen for generated JSON from JSON Generator
    useEffect(() => {
      if (stryMutAct_9fa48("18500")) {
        {}
      } else {
        stryCov_9fa48("18500");
        // Initialize with shared data first
        if (stryMutAct_9fa48("18503") ? sharedData.generatedJSON : stryMutAct_9fa48("18502") ? false : stryMutAct_9fa48("18501") ? true : (stryCov_9fa48("18501", "18502", "18503"), sharedData?.generatedJSON)) {
          if (stryMutAct_9fa48("18504")) {
            {}
          } else {
            stryCov_9fa48("18504");
            setJsonInput(sharedData.generatedJSON);
            handleLoadFromInput(sharedData.generatedJSON);
          }
        }
        const handleSwitchToSessionTester = event => {
          if (stryMutAct_9fa48("18505")) {
            {}
          } else {
            stryCov_9fa48("18505");
            if (stryMutAct_9fa48("18508") ? event.detail.generatedJSON : stryMutAct_9fa48("18507") ? false : stryMutAct_9fa48("18506") ? true : (stryCov_9fa48("18506", "18507", "18508"), event.detail?.generatedJSON)) {
              if (stryMutAct_9fa48("18509")) {
                {}
              } else {
                stryCov_9fa48("18509");
                setJsonInput(event.detail.generatedJSON);
                handleLoadFromInput(event.detail.generatedJSON);
              }
            }
          }
        };

        // Check for pre-loaded JSON from sessionStorage (fallback)
        const savedJSON = sessionStorage.getItem(stryMutAct_9fa48("18510") ? "" : (stryCov_9fa48("18510"), 'generatedSessionData'));
        if (stryMutAct_9fa48("18513") ? savedJSON || !sharedData?.generatedJSON : stryMutAct_9fa48("18512") ? false : stryMutAct_9fa48("18511") ? true : (stryCov_9fa48("18511", "18512", "18513"), savedJSON && (stryMutAct_9fa48("18514") ? sharedData?.generatedJSON : (stryCov_9fa48("18514"), !(stryMutAct_9fa48("18515") ? sharedData.generatedJSON : (stryCov_9fa48("18515"), sharedData?.generatedJSON)))))) {
          if (stryMutAct_9fa48("18516")) {
            {}
          } else {
            stryCov_9fa48("18516");
            setJsonInput(savedJSON);
            handleLoadFromInput(savedJSON);
          }
        }
        window.addEventListener(stryMutAct_9fa48("18517") ? "" : (stryCov_9fa48("18517"), 'switchToSessionTester'), handleSwitchToSessionTester);
        return () => {
          if (stryMutAct_9fa48("18518")) {
            {}
          } else {
            stryCov_9fa48("18518");
            window.removeEventListener(stryMutAct_9fa48("18519") ? "" : (stryCov_9fa48("18519"), 'switchToSessionTester'), handleSwitchToSessionTester);
          }
        };
      }
    }, stryMutAct_9fa48("18520") ? [] : (stryCov_9fa48("18520"), [sharedData]));

    // Handle escape key for modal
    useEffect(() => {
      if (stryMutAct_9fa48("18521")) {
        {}
      } else {
        stryCov_9fa48("18521");
        const handleEscape = event => {
          if (stryMutAct_9fa48("18522")) {
            {}
          } else {
            stryCov_9fa48("18522");
            if (stryMutAct_9fa48("18525") ? event.key === 'Escape' || isModalOpen : stryMutAct_9fa48("18524") ? false : stryMutAct_9fa48("18523") ? true : (stryCov_9fa48("18523", "18524", "18525"), (stryMutAct_9fa48("18527") ? event.key !== 'Escape' : stryMutAct_9fa48("18526") ? true : (stryCov_9fa48("18526", "18527"), event.key === (stryMutAct_9fa48("18528") ? "" : (stryCov_9fa48("18528"), 'Escape')))) && isModalOpen)) {
              if (stryMutAct_9fa48("18529")) {
                {}
              } else {
                stryCov_9fa48("18529");
                setIsModalOpen(stryMutAct_9fa48("18530") ? true : (stryCov_9fa48("18530"), false));
              }
            }
          }
        };
        if (stryMutAct_9fa48("18532") ? false : stryMutAct_9fa48("18531") ? true : (stryCov_9fa48("18531", "18532"), isModalOpen)) {
          if (stryMutAct_9fa48("18533")) {
            {}
          } else {
            stryCov_9fa48("18533");
            document.addEventListener(stryMutAct_9fa48("18534") ? "" : (stryCov_9fa48("18534"), 'keydown'), handleEscape);
            // Prevent body scroll when modal is open
            document.body.style.overflow = stryMutAct_9fa48("18535") ? "" : (stryCov_9fa48("18535"), 'hidden');
          }
        } else {
          if (stryMutAct_9fa48("18536")) {
            {}
          } else {
            stryCov_9fa48("18536");
            document.body.style.overflow = stryMutAct_9fa48("18537") ? "" : (stryCov_9fa48("18537"), 'unset');
          }
        }
        return () => {
          if (stryMutAct_9fa48("18538")) {
            {}
          } else {
            stryCov_9fa48("18538");
            document.removeEventListener(stryMutAct_9fa48("18539") ? "" : (stryCov_9fa48("18539"), 'keydown'), handleEscape);
            document.body.style.overflow = stryMutAct_9fa48("18540") ? "" : (stryCov_9fa48("18540"), 'unset');
          }
        };
      }
    }, stryMutAct_9fa48("18541") ? [] : (stryCov_9fa48("18541"), [isModalOpen]));

    // Auto-update preview when JSON input changes
    useEffect(() => {
      if (stryMutAct_9fa48("18542")) {
        {}
      } else {
        stryCov_9fa48("18542");
        if (stryMutAct_9fa48("18545") ? jsonInput.trim() || !isUpdatingFromEdit : stryMutAct_9fa48("18544") ? false : stryMutAct_9fa48("18543") ? true : (stryCov_9fa48("18543", "18544", "18545"), (stryMutAct_9fa48("18546") ? jsonInput : (stryCov_9fa48("18546"), jsonInput.trim())) && (stryMutAct_9fa48("18547") ? isUpdatingFromEdit : (stryCov_9fa48("18547"), !isUpdatingFromEdit)))) {
          if (stryMutAct_9fa48("18548")) {
            {}
          } else {
            stryCov_9fa48("18548");
            // Add a small delay to avoid excessive parsing while typing
            const timeoutId = setTimeout(() => {
              if (stryMutAct_9fa48("18549")) {
                {}
              } else {
                stryCov_9fa48("18549");
                handleLoadFromInput(jsonInput);
              }
            }, 500);
            return stryMutAct_9fa48("18550") ? () => undefined : (stryCov_9fa48("18550"), () => clearTimeout(timeoutId));
          }
        }
      }
    }, stryMutAct_9fa48("18551") ? [] : (stryCov_9fa48("18551"), [jsonInput, isUpdatingFromEdit]));
    const handleFileUpload = event => {
      if (stryMutAct_9fa48("18552")) {
        {}
      } else {
        stryCov_9fa48("18552");
        const file = event.target.files[0];
        if (stryMutAct_9fa48("18555") ? file || file.type === 'application/json' : stryMutAct_9fa48("18554") ? false : stryMutAct_9fa48("18553") ? true : (stryCov_9fa48("18553", "18554", "18555"), file && (stryMutAct_9fa48("18557") ? file.type !== 'application/json' : stryMutAct_9fa48("18556") ? true : (stryCov_9fa48("18556", "18557"), file.type === (stryMutAct_9fa48("18558") ? "" : (stryCov_9fa48("18558"), 'application/json')))))) {
          if (stryMutAct_9fa48("18559")) {
            {}
          } else {
            stryCov_9fa48("18559");
            const reader = new FileReader();
            reader.onload = e => {
              if (stryMutAct_9fa48("18560")) {
                {}
              } else {
                stryCov_9fa48("18560");
                try {
                  if (stryMutAct_9fa48("18561")) {
                    {}
                  } else {
                    stryCov_9fa48("18561");
                    const content = e.target.result;
                    setJsonInput(content);
                    handleLoadFromInput(content);
                  }
                } catch (error) {
                  if (stryMutAct_9fa48("18562")) {
                    {}
                  } else {
                    stryCov_9fa48("18562");
                    setError((stryMutAct_9fa48("18563") ? "" : (stryCov_9fa48("18563"), 'Error reading file: ')) + error.message);
                  }
                }
              }
            };
            reader.readAsText(file);
          }
        } else {
          if (stryMutAct_9fa48("18564")) {
            {}
          } else {
            stryCov_9fa48("18564");
            setError(stryMutAct_9fa48("18565") ? "" : (stryCov_9fa48("18565"), 'Please select a valid JSON file'));
          }
        }
      }
    };
    const handleLoadFromInput = (jsonString = jsonInput) => {
      if (stryMutAct_9fa48("18566")) {
        {}
      } else {
        stryCov_9fa48("18566");
        try {
          if (stryMutAct_9fa48("18567")) {
            {}
          } else {
            stryCov_9fa48("18567");
            const data = JSON.parse(jsonString);

            // Check if data is an array of days or a single day
            let daysArray = stryMutAct_9fa48("18568") ? ["Stryker was here"] : (stryCov_9fa48("18568"), []);
            let currentDayData = null;
            if (stryMutAct_9fa48("18570") ? false : stryMutAct_9fa48("18569") ? true : (stryCov_9fa48("18569", "18570"), Array.isArray(data))) {
              if (stryMutAct_9fa48("18571")) {
                {}
              } else {
                stryCov_9fa48("18571");
                // Multiple days from JSON Generator
                daysArray = data;
                currentDayData = data[0]; // Start with first day
                setCurrentDayIndex(0);
              }
            } else {
              if (stryMutAct_9fa48("18572")) {
                {}
              } else {
                stryCov_9fa48("18572");
                // Single day object
                daysArray = stryMutAct_9fa48("18573") ? [] : (stryCov_9fa48("18573"), [data]);
                currentDayData = data;
                setCurrentDayIndex(0);
              }
            }
            setAllDays(daysArray);
            setSessionData(currentDayData);
            setCurrentDay(currentDayData);

            // Extract tasks from the current day's time_blocks
            const extractedTasks = stryMutAct_9fa48("18574") ? ["Stryker was here"] : (stryCov_9fa48("18574"), []);
            if (stryMutAct_9fa48("18577") ? currentDayData || currentDayData.time_blocks : stryMutAct_9fa48("18576") ? false : stryMutAct_9fa48("18575") ? true : (stryCov_9fa48("18575", "18576", "18577"), currentDayData && currentDayData.time_blocks)) {
              if (stryMutAct_9fa48("18578")) {
                {}
              } else {
                stryCov_9fa48("18578");
                currentDayData.time_blocks.forEach((block, blockIndex) => {
                  if (stryMutAct_9fa48("18579")) {
                    {}
                  } else {
                    stryCov_9fa48("18579");
                    if (stryMutAct_9fa48("18581") ? false : stryMutAct_9fa48("18580") ? true : (stryCov_9fa48("18580", "18581"), block.task)) {
                      if (stryMutAct_9fa48("18582")) {
                        {}
                      } else {
                        stryCov_9fa48("18582");
                        extractedTasks.push(stryMutAct_9fa48("18583") ? {} : (stryCov_9fa48("18583"), {
                          ...block.task,
                          id: stryMutAct_9fa48("18584") ? `` : (stryCov_9fa48("18584"), `task-${blockIndex}`),
                          blockIndex,
                          startTime: block.start_time,
                          endTime: block.end_time,
                          category: block.category
                        }));
                      }
                    }
                  }
                });
              }
            }
            setTasks(extractedTasks);
            setCurrentTaskIndex(0);
            setError(stryMutAct_9fa48("18585") ? "Stryker was here!" : (stryCov_9fa48("18585"), ''));

            // Initialize messages for the first task
            if (stryMutAct_9fa48("18589") ? extractedTasks.length <= 0 : stryMutAct_9fa48("18588") ? extractedTasks.length >= 0 : stryMutAct_9fa48("18587") ? false : stryMutAct_9fa48("18586") ? true : (stryCov_9fa48("18586", "18587", "18588", "18589"), extractedTasks.length > 0)) {
              if (stryMutAct_9fa48("18590")) {
                {}
              } else {
                stryCov_9fa48("18590");
                initializeMessages(extractedTasks[0]);
              }
            }
          }
        } catch (err) {
          if (stryMutAct_9fa48("18591")) {
            {}
          } else {
            stryCov_9fa48("18591");
            setError((stryMutAct_9fa48("18592") ? "" : (stryCov_9fa48("18592"), 'Invalid JSON format: ')) + err.message);
            setSessionData(null);
            setTasks(stryMutAct_9fa48("18593") ? ["Stryker was here"] : (stryCov_9fa48("18593"), []));
            setAllDays(stryMutAct_9fa48("18594") ? ["Stryker was here"] : (stryCov_9fa48("18594"), []));
            setCurrentDay(null);
          }
        }
      }
    };
    const initializeMessages = task => {
      if (stryMutAct_9fa48("18595")) {
        {}
      } else {
        stryCov_9fa48("18595");
        const msgs = stryMutAct_9fa48("18596") ? ["Stryker was here"] : (stryCov_9fa48("18596"), []);

        // Add intro message
        if (stryMutAct_9fa48("18598") ? false : stryMutAct_9fa48("18597") ? true : (stryCov_9fa48("18597", "18598"), task.intro)) {
          if (stryMutAct_9fa48("18599")) {
            {}
          } else {
            stryCov_9fa48("18599");
            msgs.push(stryMutAct_9fa48("18600") ? {} : (stryCov_9fa48("18600"), {
              id: stryMutAct_9fa48("18601") ? "" : (stryCov_9fa48("18601"), 'intro'),
              role: stryMutAct_9fa48("18602") ? "" : (stryCov_9fa48("18602"), 'assistant'),
              content: task.intro,
              timestamp: new Date().toISOString()
            }));
          }
        }

        // Add questions as individual messages
        if (stryMutAct_9fa48("18605") ? task.questions || task.questions.length > 0 : stryMutAct_9fa48("18604") ? false : stryMutAct_9fa48("18603") ? true : (stryCov_9fa48("18603", "18604", "18605"), task.questions && (stryMutAct_9fa48("18608") ? task.questions.length <= 0 : stryMutAct_9fa48("18607") ? task.questions.length >= 0 : stryMutAct_9fa48("18606") ? true : (stryCov_9fa48("18606", "18607", "18608"), task.questions.length > 0)))) {
          if (stryMutAct_9fa48("18609")) {
            {}
          } else {
            stryCov_9fa48("18609");
            task.questions.forEach((question, index) => {
              if (stryMutAct_9fa48("18610")) {
                {}
              } else {
                stryCov_9fa48("18610");
                msgs.push(stryMutAct_9fa48("18611") ? {} : (stryCov_9fa48("18611"), {
                  id: stryMutAct_9fa48("18612") ? `` : (stryCov_9fa48("18612"), `question-${index}`),
                  role: stryMutAct_9fa48("18613") ? "" : (stryCov_9fa48("18613"), 'assistant'),
                  content: question,
                  timestamp: new Date().toISOString()
                }));
              }
            });
          }
        }

        // Add conclusion message
        if (stryMutAct_9fa48("18615") ? false : stryMutAct_9fa48("18614") ? true : (stryCov_9fa48("18614", "18615"), task.conclusion)) {
          if (stryMutAct_9fa48("18616")) {
            {}
          } else {
            stryCov_9fa48("18616");
            msgs.push(stryMutAct_9fa48("18617") ? {} : (stryCov_9fa48("18617"), {
              id: stryMutAct_9fa48("18618") ? "" : (stryCov_9fa48("18618"), 'conclusion'),
              role: stryMutAct_9fa48("18619") ? "" : (stryCov_9fa48("18619"), 'assistant'),
              content: task.conclusion,
              timestamp: new Date().toISOString()
            }));
          }
        }
        setMessages(msgs);
      }
    };
    const handleTaskChange = taskIndex => {
      if (stryMutAct_9fa48("18620")) {
        {}
      } else {
        stryCov_9fa48("18620");
        setCurrentTaskIndex(taskIndex);
        if (stryMutAct_9fa48("18622") ? false : stryMutAct_9fa48("18621") ? true : (stryCov_9fa48("18621", "18622"), tasks[taskIndex])) {
          if (stryMutAct_9fa48("18623")) {
            {}
          } else {
            stryCov_9fa48("18623");
            initializeMessages(tasks[taskIndex]);
          }
        }
      }
    };
    const clearData = () => {
      if (stryMutAct_9fa48("18624")) {
        {}
      } else {
        stryCov_9fa48("18624");
        setSessionData(null);
        setJsonInput(stryMutAct_9fa48("18625") ? "Stryker was here!" : (stryCov_9fa48("18625"), ''));
        setTasks(stryMutAct_9fa48("18626") ? ["Stryker was here"] : (stryCov_9fa48("18626"), []));
        setMessages(stryMutAct_9fa48("18627") ? ["Stryker was here"] : (stryCov_9fa48("18627"), []));
        setError(stryMutAct_9fa48("18628") ? "Stryker was here!" : (stryCov_9fa48("18628"), ''));
        setCurrentTaskIndex(0);
        setAllDays(stryMutAct_9fa48("18629") ? ["Stryker was here"] : (stryCov_9fa48("18629"), []));
        setCurrentDay(null);
        setCurrentDayIndex(0);
      }
    };
    const handleDayChange = dayIndex => {
      if (stryMutAct_9fa48("18630")) {
        {}
      } else {
        stryCov_9fa48("18630");
        if (stryMutAct_9fa48("18632") ? false : stryMutAct_9fa48("18631") ? true : (stryCov_9fa48("18631", "18632"), allDays[dayIndex])) {
          if (stryMutAct_9fa48("18633")) {
            {}
          } else {
            stryCov_9fa48("18633");
            setCurrentDayIndex(dayIndex);
            const dayData = allDays[dayIndex];
            setCurrentDay(dayData);
            setSessionData(dayData);

            // Extract tasks from the new day's time_blocks
            const extractedTasks = stryMutAct_9fa48("18634") ? ["Stryker was here"] : (stryCov_9fa48("18634"), []);
            if (stryMutAct_9fa48("18636") ? false : stryMutAct_9fa48("18635") ? true : (stryCov_9fa48("18635", "18636"), dayData.time_blocks)) {
              if (stryMutAct_9fa48("18637")) {
                {}
              } else {
                stryCov_9fa48("18637");
                dayData.time_blocks.forEach((block, blockIndex) => {
                  if (stryMutAct_9fa48("18638")) {
                    {}
                  } else {
                    stryCov_9fa48("18638");
                    if (stryMutAct_9fa48("18640") ? false : stryMutAct_9fa48("18639") ? true : (stryCov_9fa48("18639", "18640"), block.task)) {
                      if (stryMutAct_9fa48("18641")) {
                        {}
                      } else {
                        stryCov_9fa48("18641");
                        extractedTasks.push(stryMutAct_9fa48("18642") ? {} : (stryCov_9fa48("18642"), {
                          ...block.task,
                          id: stryMutAct_9fa48("18643") ? `` : (stryCov_9fa48("18643"), `task-${blockIndex}`),
                          blockIndex,
                          startTime: block.start_time,
                          endTime: block.end_time,
                          category: block.category
                        }));
                      }
                    }
                  }
                });
              }
            }
            setTasks(extractedTasks);
            setCurrentTaskIndex(0);

            // Initialize messages for the first task of the new day
            if (stryMutAct_9fa48("18647") ? extractedTasks.length <= 0 : stryMutAct_9fa48("18646") ? extractedTasks.length >= 0 : stryMutAct_9fa48("18645") ? false : stryMutAct_9fa48("18644") ? true : (stryCov_9fa48("18644", "18645", "18646", "18647"), extractedTasks.length > 0)) {
              if (stryMutAct_9fa48("18648")) {
                {}
              } else {
                stryCov_9fa48("18648");
                initializeMessages(extractedTasks[0]);
              }
            } else {
              if (stryMutAct_9fa48("18649")) {
                {}
              } else {
                stryCov_9fa48("18649");
                setMessages(stryMutAct_9fa48("18650") ? ["Stryker was here"] : (stryCov_9fa48("18650"), []));
              }
            }
          }
        }
      }
    };
    const currentTask = tasks[currentTaskIndex];

    // Update session data when changes are made
    const updateSessionData = updatedAllDays => {
      if (stryMutAct_9fa48("18651")) {
        {}
      } else {
        stryCov_9fa48("18651");
        setIsUpdatingFromEdit(stryMutAct_9fa48("18652") ? false : (stryCov_9fa48("18652"), true));
        setAllDays(updatedAllDays);
        setCurrentDay(updatedAllDays[currentDayIndex]);
        setSessionData(updatedAllDays[currentDayIndex]);

        // Update JSON input to reflect changes
        const newJsonInput = JSON.stringify((stryMutAct_9fa48("18655") ? updatedAllDays.length !== 1 : stryMutAct_9fa48("18654") ? false : stryMutAct_9fa48("18653") ? true : (stryCov_9fa48("18653", "18654", "18655"), updatedAllDays.length === 1)) ? updatedAllDays[0] : updatedAllDays, null, 2);
        setJsonInput(newJsonInput);
        setHasUnsavedChanges(stryMutAct_9fa48("18656") ? false : (stryCov_9fa48("18656"), true));

        // Save to sessionStorage and update shared data
        sessionStorage.setItem(stryMutAct_9fa48("18657") ? "" : (stryCov_9fa48("18657"), 'generatedSessionData'), newJsonInput);
        stryMutAct_9fa48("18658") ? updateSharedData({
          editedJSON: newJsonInput,
          generatedJSON: newJsonInput
        }) : (stryCov_9fa48("18658"), updateSharedData?.(stryMutAct_9fa48("18659") ? {} : (stryCov_9fa48("18659"), {
          editedJSON: newJsonInput,
          generatedJSON: newJsonInput
        })));

        // Clear the flag after a brief delay to allow state updates to complete
        setTimeout(stryMutAct_9fa48("18660") ? () => undefined : (stryCov_9fa48("18660"), () => setIsUpdatingFromEdit(stryMutAct_9fa48("18661") ? true : (stryCov_9fa48("18661"), false))), 100);
      }
    };

    // Update task checkbox values
    const updateTaskCheckbox = (field, value) => {
      if (stryMutAct_9fa48("18662")) {
        {}
      } else {
        stryCov_9fa48("18662");
        const updatedAllDays = stryMutAct_9fa48("18663") ? [] : (stryCov_9fa48("18663"), [...allDays]);
        const currentDayData = updatedAllDays[currentDayIndex];
        const taskBlockIndex = tasks[currentTaskIndex].blockIndex;
        if (stryMutAct_9fa48("18666") ? currentDayData.time_blocks[taskBlockIndex] || currentDayData.time_blocks[taskBlockIndex].task : stryMutAct_9fa48("18665") ? false : stryMutAct_9fa48("18664") ? true : (stryCov_9fa48("18664", "18665", "18666"), currentDayData.time_blocks[taskBlockIndex] && currentDayData.time_blocks[taskBlockIndex].task)) {
          if (stryMutAct_9fa48("18667")) {
            {}
          } else {
            stryCov_9fa48("18667");
            currentDayData.time_blocks[taskBlockIndex].task[field] = value;

            // Update tasks array too
            const updatedTasks = stryMutAct_9fa48("18668") ? [] : (stryCov_9fa48("18668"), [...tasks]);
            updatedTasks[currentTaskIndex][field] = value;
            setTasks(updatedTasks);
            updateSessionData(updatedAllDays);
          }
        }
      }
    };

    // Start editing a message
    const startEditingMessage = (messageId, currentContent) => {
      if (stryMutAct_9fa48("18669")) {
        {}
      } else {
        stryCov_9fa48("18669");
        setEditingMessageId(messageId);
        setEditingText(currentContent);
      }
    };

    // Save edited message
    const saveEditedMessage = () => {
      if (stryMutAct_9fa48("18670")) {
        {}
      } else {
        stryCov_9fa48("18670");
        if (stryMutAct_9fa48("18673") ? !editingMessageId && !editingText.trim() : stryMutAct_9fa48("18672") ? false : stryMutAct_9fa48("18671") ? true : (stryCov_9fa48("18671", "18672", "18673"), (stryMutAct_9fa48("18674") ? editingMessageId : (stryCov_9fa48("18674"), !editingMessageId)) || (stryMutAct_9fa48("18675") ? editingText.trim() : (stryCov_9fa48("18675"), !(stryMutAct_9fa48("18676") ? editingText : (stryCov_9fa48("18676"), editingText.trim())))))) return;
        const updatedAllDays = stryMutAct_9fa48("18677") ? [] : (stryCov_9fa48("18677"), [...allDays]);
        const currentDayData = updatedAllDays[currentDayIndex];
        const taskBlockIndex = tasks[currentTaskIndex].blockIndex;
        const task = currentDayData.time_blocks[taskBlockIndex].task;
        if (stryMutAct_9fa48("18680") ? editingMessageId !== 'intro' : stryMutAct_9fa48("18679") ? false : stryMutAct_9fa48("18678") ? true : (stryCov_9fa48("18678", "18679", "18680"), editingMessageId === (stryMutAct_9fa48("18681") ? "" : (stryCov_9fa48("18681"), 'intro')))) {
          if (stryMutAct_9fa48("18682")) {
            {}
          } else {
            stryCov_9fa48("18682");
            task.intro = stryMutAct_9fa48("18683") ? editingText : (stryCov_9fa48("18683"), editingText.trim());
          }
        } else if (stryMutAct_9fa48("18686") ? editingMessageId !== 'conclusion' : stryMutAct_9fa48("18685") ? false : stryMutAct_9fa48("18684") ? true : (stryCov_9fa48("18684", "18685", "18686"), editingMessageId === (stryMutAct_9fa48("18687") ? "" : (stryCov_9fa48("18687"), 'conclusion')))) {
          if (stryMutAct_9fa48("18688")) {
            {}
          } else {
            stryCov_9fa48("18688");
            task.conclusion = stryMutAct_9fa48("18689") ? editingText : (stryCov_9fa48("18689"), editingText.trim());
          }
        } else if (stryMutAct_9fa48("18692") ? editingMessageId.endsWith('question-') : stryMutAct_9fa48("18691") ? false : stryMutAct_9fa48("18690") ? true : (stryCov_9fa48("18690", "18691", "18692"), editingMessageId.startsWith(stryMutAct_9fa48("18693") ? "" : (stryCov_9fa48("18693"), 'question-')))) {
          if (stryMutAct_9fa48("18694")) {
            {}
          } else {
            stryCov_9fa48("18694");
            const questionIndex = parseInt(editingMessageId.split(stryMutAct_9fa48("18695") ? "" : (stryCov_9fa48("18695"), '-'))[1]);
            if (stryMutAct_9fa48("18698") ? task.questions || task.questions[questionIndex] !== undefined : stryMutAct_9fa48("18697") ? false : stryMutAct_9fa48("18696") ? true : (stryCov_9fa48("18696", "18697", "18698"), task.questions && (stryMutAct_9fa48("18700") ? task.questions[questionIndex] === undefined : stryMutAct_9fa48("18699") ? true : (stryCov_9fa48("18699", "18700"), task.questions[questionIndex] !== undefined)))) {
              if (stryMutAct_9fa48("18701")) {
                {}
              } else {
                stryCov_9fa48("18701");
                task.questions[questionIndex] = stryMutAct_9fa48("18702") ? editingText : (stryCov_9fa48("18702"), editingText.trim());
              }
            }
          }
        }

        // Update tasks array and reinitialize messages
        const updatedTasks = stryMutAct_9fa48("18703") ? [] : (stryCov_9fa48("18703"), [...tasks]);
        updatedTasks[currentTaskIndex] = stryMutAct_9fa48("18704") ? {} : (stryCov_9fa48("18704"), {
          ...updatedTasks[currentTaskIndex],
          ...task
        });
        setTasks(updatedTasks);
        updateSessionData(updatedAllDays);
        initializeMessages(updatedTasks[currentTaskIndex]);
        setEditingMessageId(null);
        setEditingText(stryMutAct_9fa48("18705") ? "Stryker was here!" : (stryCov_9fa48("18705"), ''));
      }
    };

    // Cancel editing
    const cancelEditing = () => {
      if (stryMutAct_9fa48("18706")) {
        {}
      } else {
        stryCov_9fa48("18706");
        setEditingMessageId(null);
        setEditingText(stryMutAct_9fa48("18707") ? "Stryker was here!" : (stryCov_9fa48("18707"), ''));
      }
    };

    // Start editing task field
    const startEditingTaskField = (field, currentValue) => {
      if (stryMutAct_9fa48("18708")) {
        {}
      } else {
        stryCov_9fa48("18708");
        setEditingTaskField(field);
        setEditingTaskValue(currentValue);
      }
    };

    // Save edited task field
    const saveEditedTaskField = () => {
      if (stryMutAct_9fa48("18709")) {
        {}
      } else {
        stryCov_9fa48("18709");
        if (stryMutAct_9fa48("18712") ? !editingTaskField && !editingTaskValue.trim() : stryMutAct_9fa48("18711") ? false : stryMutAct_9fa48("18710") ? true : (stryCov_9fa48("18710", "18711", "18712"), (stryMutAct_9fa48("18713") ? editingTaskField : (stryCov_9fa48("18713"), !editingTaskField)) || (stryMutAct_9fa48("18714") ? editingTaskValue.trim() : (stryCov_9fa48("18714"), !(stryMutAct_9fa48("18715") ? editingTaskValue : (stryCov_9fa48("18715"), editingTaskValue.trim())))))) return;
        const updatedAllDays = stryMutAct_9fa48("18716") ? [] : (stryCov_9fa48("18716"), [...allDays]);
        const currentDayData = updatedAllDays[currentDayIndex];
        const taskBlockIndex = tasks[currentTaskIndex].blockIndex;
        const task = currentDayData.time_blocks[taskBlockIndex].task;
        const timeBlock = currentDayData.time_blocks[taskBlockIndex];
        if (stryMutAct_9fa48("18719") ? editingTaskField !== 'title' : stryMutAct_9fa48("18718") ? false : stryMutAct_9fa48("18717") ? true : (stryCov_9fa48("18717", "18718", "18719"), editingTaskField === (stryMutAct_9fa48("18720") ? "" : (stryCov_9fa48("18720"), 'title')))) {
          if (stryMutAct_9fa48("18721")) {
            {}
          } else {
            stryCov_9fa48("18721");
            task.title = stryMutAct_9fa48("18722") ? editingTaskValue : (stryCov_9fa48("18722"), editingTaskValue.trim());
          }
        } else if (stryMutAct_9fa48("18725") ? editingTaskField !== 'description' : stryMutAct_9fa48("18724") ? false : stryMutAct_9fa48("18723") ? true : (stryCov_9fa48("18723", "18724", "18725"), editingTaskField === (stryMutAct_9fa48("18726") ? "" : (stryCov_9fa48("18726"), 'description')))) {
          if (stryMutAct_9fa48("18727")) {
            {}
          } else {
            stryCov_9fa48("18727");
            task.description = stryMutAct_9fa48("18728") ? editingTaskValue : (stryCov_9fa48("18728"), editingTaskValue.trim());
          }
        } else if (stryMutAct_9fa48("18731") ? editingTaskField === 'startTime' && editingTaskField === 'endTime' : stryMutAct_9fa48("18730") ? false : stryMutAct_9fa48("18729") ? true : (stryCov_9fa48("18729", "18730", "18731"), (stryMutAct_9fa48("18733") ? editingTaskField !== 'startTime' : stryMutAct_9fa48("18732") ? false : (stryCov_9fa48("18732", "18733"), editingTaskField === (stryMutAct_9fa48("18734") ? "" : (stryCov_9fa48("18734"), 'startTime')))) || (stryMutAct_9fa48("18736") ? editingTaskField !== 'endTime' : stryMutAct_9fa48("18735") ? false : (stryCov_9fa48("18735", "18736"), editingTaskField === (stryMutAct_9fa48("18737") ? "" : (stryCov_9fa48("18737"), 'endTime')))))) {
          if (stryMutAct_9fa48("18738")) {
            {}
          } else {
            stryCov_9fa48("18738");
            // Parse time with AM/PM support
            const timeValue = stryMutAct_9fa48("18739") ? editingTaskValue : (stryCov_9fa48("18739"), editingTaskValue.trim());
            let convertedTime = timeValue;

            // Check for 12-hour format with AM/PM
            const twelveHourRegex = stryMutAct_9fa48("18748") ? /^(1[0-2]|0?[1-9]):([0-5][0-9])\S*(AM|PM|am|pm)$/i : stryMutAct_9fa48("18747") ? /^(1[0-2]|0?[1-9]):([0-5][0-9])\s(AM|PM|am|pm)$/i : stryMutAct_9fa48("18746") ? /^(1[0-2]|0?[1-9]):([0-5][^0-9])\s*(AM|PM|am|pm)$/i : stryMutAct_9fa48("18745") ? /^(1[0-2]|0?[1-9]):([^0-5][0-9])\s*(AM|PM|am|pm)$/i : stryMutAct_9fa48("18744") ? /^(1[0-2]|0?[^1-9]):([0-5][0-9])\s*(AM|PM|am|pm)$/i : stryMutAct_9fa48("18743") ? /^(1[0-2]|0[1-9]):([0-5][0-9])\s*(AM|PM|am|pm)$/i : stryMutAct_9fa48("18742") ? /^(1[^0-2]|0?[1-9]):([0-5][0-9])\s*(AM|PM|am|pm)$/i : stryMutAct_9fa48("18741") ? /^(1[0-2]|0?[1-9]):([0-5][0-9])\s*(AM|PM|am|pm)/i : stryMutAct_9fa48("18740") ? /(1[0-2]|0?[1-9]):([0-5][0-9])\s*(AM|PM|am|pm)$/i : (stryCov_9fa48("18740", "18741", "18742", "18743", "18744", "18745", "18746", "18747", "18748"), /^(1[0-2]|0?[1-9]):([0-5][0-9])\s*(AM|PM|am|pm)$/i);
            const twentyFourHourRegex = stryMutAct_9fa48("18756") ? /^([0-1]?[0-9]|2[0-3]):([0-5][^0-9])$/ : stryMutAct_9fa48("18755") ? /^([0-1]?[0-9]|2[0-3]):([^0-5][0-9])$/ : stryMutAct_9fa48("18754") ? /^([0-1]?[0-9]|2[^0-3]):([0-5][0-9])$/ : stryMutAct_9fa48("18753") ? /^([0-1]?[^0-9]|2[0-3]):([0-5][0-9])$/ : stryMutAct_9fa48("18752") ? /^([^0-1]?[0-9]|2[0-3]):([0-5][0-9])$/ : stryMutAct_9fa48("18751") ? /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/ : stryMutAct_9fa48("18750") ? /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])/ : stryMutAct_9fa48("18749") ? /([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/ : (stryCov_9fa48("18749", "18750", "18751", "18752", "18753", "18754", "18755", "18756"), /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/);
            if (stryMutAct_9fa48("18758") ? false : stryMutAct_9fa48("18757") ? true : (stryCov_9fa48("18757", "18758"), twelveHourRegex.test(timeValue))) {
              if (stryMutAct_9fa48("18759")) {
                {}
              } else {
                stryCov_9fa48("18759");
                const match = timeValue.match(twelveHourRegex);
                let hours = parseInt(match[1], 10);
                const minutes = match[2];
                const period = stryMutAct_9fa48("18760") ? match[3].toLowerCase() : (stryCov_9fa48("18760"), match[3].toUpperCase());

                // Convert to 24-hour format
                if (stryMutAct_9fa48("18763") ? period === 'PM' || hours < 12 : stryMutAct_9fa48("18762") ? false : stryMutAct_9fa48("18761") ? true : (stryCov_9fa48("18761", "18762", "18763"), (stryMutAct_9fa48("18765") ? period !== 'PM' : stryMutAct_9fa48("18764") ? true : (stryCov_9fa48("18764", "18765"), period === (stryMutAct_9fa48("18766") ? "" : (stryCov_9fa48("18766"), 'PM')))) && (stryMutAct_9fa48("18769") ? hours >= 12 : stryMutAct_9fa48("18768") ? hours <= 12 : stryMutAct_9fa48("18767") ? true : (stryCov_9fa48("18767", "18768", "18769"), hours < 12)))) {
                  if (stryMutAct_9fa48("18770")) {
                    {}
                  } else {
                    stryCov_9fa48("18770");
                    stryMutAct_9fa48("18771") ? hours -= 12 : (stryCov_9fa48("18771"), hours += 12);
                  }
                } else if (stryMutAct_9fa48("18774") ? period === 'AM' || hours === 12 : stryMutAct_9fa48("18773") ? false : stryMutAct_9fa48("18772") ? true : (stryCov_9fa48("18772", "18773", "18774"), (stryMutAct_9fa48("18776") ? period !== 'AM' : stryMutAct_9fa48("18775") ? true : (stryCov_9fa48("18775", "18776"), period === (stryMutAct_9fa48("18777") ? "" : (stryCov_9fa48("18777"), 'AM')))) && (stryMutAct_9fa48("18779") ? hours !== 12 : stryMutAct_9fa48("18778") ? true : (stryCov_9fa48("18778", "18779"), hours === 12)))) {
                  if (stryMutAct_9fa48("18780")) {
                    {}
                  } else {
                    stryCov_9fa48("18780");
                    hours = 0;
                  }
                }

                // Format as HH:MM for storage
                convertedTime = stryMutAct_9fa48("18781") ? `` : (stryCov_9fa48("18781"), `${hours.toString().padStart(2, stryMutAct_9fa48("18782") ? "" : (stryCov_9fa48("18782"), '0'))}:${minutes}`);
              }
            } else if (stryMutAct_9fa48("18785") ? false : stryMutAct_9fa48("18784") ? true : stryMutAct_9fa48("18783") ? twentyFourHourRegex.test(timeValue) : (stryCov_9fa48("18783", "18784", "18785"), !twentyFourHourRegex.test(timeValue))) {
              if (stryMutAct_9fa48("18786")) {
                {}
              } else {
                stryCov_9fa48("18786");
                alert(stryMutAct_9fa48("18787") ? "" : (stryCov_9fa48("18787"), 'Please enter time in format HH:MM AM/PM (e.g., 2:30 PM) or 24-hour format (e.g., 14:30)'));
                return;
              }
            }
            if (stryMutAct_9fa48("18790") ? editingTaskField !== 'startTime' : stryMutAct_9fa48("18789") ? false : stryMutAct_9fa48("18788") ? true : (stryCov_9fa48("18788", "18789", "18790"), editingTaskField === (stryMutAct_9fa48("18791") ? "" : (stryCov_9fa48("18791"), 'startTime')))) {
              if (stryMutAct_9fa48("18792")) {
                {}
              } else {
                stryCov_9fa48("18792");
                timeBlock.start_time = convertedTime;
              }
            } else {
              if (stryMutAct_9fa48("18793")) {
                {}
              } else {
                stryCov_9fa48("18793");
                timeBlock.end_time = convertedTime;
              }
            }
          }
        }

        // Update tasks array
        const updatedTasks = stryMutAct_9fa48("18794") ? [] : (stryCov_9fa48("18794"), [...tasks]);
        updatedTasks[currentTaskIndex] = stryMutAct_9fa48("18795") ? {} : (stryCov_9fa48("18795"), {
          ...updatedTasks[currentTaskIndex],
          ...task,
          startTime: timeBlock.start_time,
          endTime: timeBlock.end_time
        });
        setTasks(updatedTasks);
        updateSessionData(updatedAllDays);
        setEditingTaskField(null);
        setEditingTaskValue(stryMutAct_9fa48("18796") ? "Stryker was here!" : (stryCov_9fa48("18796"), ''));
      }
    };

    // Cancel editing task field
    const cancelEditingTaskField = () => {
      if (stryMutAct_9fa48("18797")) {
        {}
      } else {
        stryCov_9fa48("18797");
        setEditingTaskField(null);
        setEditingTaskValue(stryMutAct_9fa48("18798") ? "Stryker was here!" : (stryCov_9fa48("18798"), ''));
      }
    };

    // Add new question
    const addNewQuestion = () => {
      if (stryMutAct_9fa48("18799")) {
        {}
      } else {
        stryCov_9fa48("18799");
        const updatedAllDays = stryMutAct_9fa48("18800") ? [] : (stryCov_9fa48("18800"), [...allDays]);
        const currentDayData = updatedAllDays[currentDayIndex];
        const taskBlockIndex = tasks[currentTaskIndex].blockIndex;
        const task = currentDayData.time_blocks[taskBlockIndex].task;
        if (stryMutAct_9fa48("18803") ? false : stryMutAct_9fa48("18802") ? true : stryMutAct_9fa48("18801") ? task.questions : (stryCov_9fa48("18801", "18802", "18803"), !task.questions)) {
          if (stryMutAct_9fa48("18804")) {
            {}
          } else {
            stryCov_9fa48("18804");
            task.questions = stryMutAct_9fa48("18805") ? ["Stryker was here"] : (stryCov_9fa48("18805"), []);
          }
        }
        task.questions.push(stryMutAct_9fa48("18806") ? "" : (stryCov_9fa48("18806"), 'New question - click to edit'));

        // Update tasks array and reinitialize messages
        const updatedTasks = stryMutAct_9fa48("18807") ? [] : (stryCov_9fa48("18807"), [...tasks]);
        updatedTasks[currentTaskIndex] = stryMutAct_9fa48("18808") ? {} : (stryCov_9fa48("18808"), {
          ...updatedTasks[currentTaskIndex],
          ...task
        });
        setTasks(updatedTasks);
        updateSessionData(updatedAllDays);
        initializeMessages(updatedTasks[currentTaskIndex]);
      }
    };

    // Delete question
    const deleteQuestion = questionIndex => {
      if (stryMutAct_9fa48("18809")) {
        {}
      } else {
        stryCov_9fa48("18809");
        const updatedAllDays = stryMutAct_9fa48("18810") ? [] : (stryCov_9fa48("18810"), [...allDays]);
        const currentDayData = updatedAllDays[currentDayIndex];
        const taskBlockIndex = tasks[currentTaskIndex].blockIndex;
        const task = currentDayData.time_blocks[taskBlockIndex].task;
        if (stryMutAct_9fa48("18813") ? task.questions || task.questions[questionIndex] !== undefined : stryMutAct_9fa48("18812") ? false : stryMutAct_9fa48("18811") ? true : (stryCov_9fa48("18811", "18812", "18813"), task.questions && (stryMutAct_9fa48("18815") ? task.questions[questionIndex] === undefined : stryMutAct_9fa48("18814") ? true : (stryCov_9fa48("18814", "18815"), task.questions[questionIndex] !== undefined)))) {
          if (stryMutAct_9fa48("18816")) {
            {}
          } else {
            stryCov_9fa48("18816");
            task.questions.splice(questionIndex, 1);

            // Update tasks array and reinitialize messages
            const updatedTasks = stryMutAct_9fa48("18817") ? [] : (stryCov_9fa48("18817"), [...tasks]);
            updatedTasks[currentTaskIndex] = stryMutAct_9fa48("18818") ? {} : (stryCov_9fa48("18818"), {
              ...updatedTasks[currentTaskIndex],
              ...task
            });
            setTasks(updatedTasks);
            updateSessionData(updatedAllDays);
            initializeMessages(updatedTasks[currentTaskIndex]);
          }
        }
      }
    };

    // Start editing a resource field
    const startEditingResource = (index, field, currentValue) => {
      if (stryMutAct_9fa48("18819")) {
        {}
      } else {
        stryCov_9fa48("18819");
        setEditingResourceIndex(index);
        setEditingResourceField(field);
        setEditingResourceValue(stryMutAct_9fa48("18822") ? currentValue && '' : stryMutAct_9fa48("18821") ? false : stryMutAct_9fa48("18820") ? true : (stryCov_9fa48("18820", "18821", "18822"), currentValue || (stryMutAct_9fa48("18823") ? "Stryker was here!" : (stryCov_9fa48("18823"), ''))));
      }
    };

    // Save edited resource field
    const saveEditedResource = () => {
      if (stryMutAct_9fa48("18824")) {
        {}
      } else {
        stryCov_9fa48("18824");
        if (stryMutAct_9fa48("18827") ? (editingResourceIndex === null || !editingResourceField) && !editingResourceValue.trim() : stryMutAct_9fa48("18826") ? false : stryMutAct_9fa48("18825") ? true : (stryCov_9fa48("18825", "18826", "18827"), (stryMutAct_9fa48("18829") ? editingResourceIndex === null && !editingResourceField : stryMutAct_9fa48("18828") ? false : (stryCov_9fa48("18828", "18829"), (stryMutAct_9fa48("18831") ? editingResourceIndex !== null : stryMutAct_9fa48("18830") ? false : (stryCov_9fa48("18830", "18831"), editingResourceIndex === null)) || (stryMutAct_9fa48("18832") ? editingResourceField : (stryCov_9fa48("18832"), !editingResourceField)))) || (stryMutAct_9fa48("18833") ? editingResourceValue.trim() : (stryCov_9fa48("18833"), !(stryMutAct_9fa48("18834") ? editingResourceValue : (stryCov_9fa48("18834"), editingResourceValue.trim())))))) return;
        const updatedAllDays = stryMutAct_9fa48("18835") ? [] : (stryCov_9fa48("18835"), [...allDays]);
        const currentDayData = updatedAllDays[currentDayIndex];
        const taskBlockIndex = tasks[currentTaskIndex].blockIndex;
        const task = currentDayData.time_blocks[taskBlockIndex].task;
        if (stryMutAct_9fa48("18838") ? false : stryMutAct_9fa48("18837") ? true : stryMutAct_9fa48("18836") ? task.linked_resources : (stryCov_9fa48("18836", "18837", "18838"), !task.linked_resources)) {
          if (stryMutAct_9fa48("18839")) {
            {}
          } else {
            stryCov_9fa48("18839");
            task.linked_resources = stryMutAct_9fa48("18840") ? ["Stryker was here"] : (stryCov_9fa48("18840"), []);
          }
        }

        // If this is a new resource being added
        if (stryMutAct_9fa48("18843") ? editingResourceIndex !== -1 : stryMutAct_9fa48("18842") ? false : stryMutAct_9fa48("18841") ? true : (stryCov_9fa48("18841", "18842", "18843"), editingResourceIndex === (stryMutAct_9fa48("18844") ? +1 : (stryCov_9fa48("18844"), -1)))) {
          if (stryMutAct_9fa48("18845")) {
            {}
          } else {
            stryCov_9fa48("18845");
            const newResource = stryMutAct_9fa48("18846") ? {} : (stryCov_9fa48("18846"), {
              type: stryMutAct_9fa48("18847") ? "" : (stryCov_9fa48("18847"), 'article'),
              // Default type
              title: stryMutAct_9fa48("18848") ? "" : (stryCov_9fa48("18848"), 'New Resource'),
              url: stryMutAct_9fa48("18849") ? "" : (stryCov_9fa48("18849"), '#'),
              description: stryMutAct_9fa48("18850") ? "Stryker was here!" : (stryCov_9fa48("18850"), '')
            });
            newResource[editingResourceField] = stryMutAct_9fa48("18851") ? editingResourceValue : (stryCov_9fa48("18851"), editingResourceValue.trim());
            task.linked_resources.push(newResource);
          }
        } else {
          if (stryMutAct_9fa48("18852")) {
            {}
          } else {
            stryCov_9fa48("18852");
            // Update existing resource
            const resource = task.linked_resources[editingResourceIndex];
            resource[editingResourceField] = stryMutAct_9fa48("18853") ? editingResourceValue : (stryCov_9fa48("18853"), editingResourceValue.trim());
          }
        }

        // Update tasks array
        const updatedTasks = stryMutAct_9fa48("18854") ? [] : (stryCov_9fa48("18854"), [...tasks]);
        updatedTasks[currentTaskIndex] = stryMutAct_9fa48("18855") ? {} : (stryCov_9fa48("18855"), {
          ...updatedTasks[currentTaskIndex],
          ...task
        });
        setTasks(updatedTasks);
        updateSessionData(updatedAllDays);
        setEditingResourceIndex(null);
        setEditingResourceField(null);
        setEditingResourceValue(stryMutAct_9fa48("18856") ? "Stryker was here!" : (stryCov_9fa48("18856"), ''));
      }
    };

    // Cancel editing resource
    const cancelEditingResource = () => {
      if (stryMutAct_9fa48("18857")) {
        {}
      } else {
        stryCov_9fa48("18857");
        setEditingResourceIndex(null);
        setEditingResourceField(null);
        setEditingResourceValue(stryMutAct_9fa48("18858") ? "Stryker was here!" : (stryCov_9fa48("18858"), ''));
      }
    };

    // Delete resource
    const deleteResource = index => {
      if (stryMutAct_9fa48("18859")) {
        {}
      } else {
        stryCov_9fa48("18859");
        const updatedAllDays = stryMutAct_9fa48("18860") ? [] : (stryCov_9fa48("18860"), [...allDays]);
        const currentDayData = updatedAllDays[currentDayIndex];
        const taskBlockIndex = tasks[currentTaskIndex].blockIndex;
        const task = currentDayData.time_blocks[taskBlockIndex].task;
        if (stryMutAct_9fa48("18863") ? task.linked_resources || task.linked_resources[index] !== undefined : stryMutAct_9fa48("18862") ? false : stryMutAct_9fa48("18861") ? true : (stryCov_9fa48("18861", "18862", "18863"), task.linked_resources && (stryMutAct_9fa48("18865") ? task.linked_resources[index] === undefined : stryMutAct_9fa48("18864") ? true : (stryCov_9fa48("18864", "18865"), task.linked_resources[index] !== undefined)))) {
          if (stryMutAct_9fa48("18866")) {
            {}
          } else {
            stryCov_9fa48("18866");
            task.linked_resources.splice(index, 1);

            // Update tasks array
            const updatedTasks = stryMutAct_9fa48("18867") ? [] : (stryCov_9fa48("18867"), [...tasks]);
            updatedTasks[currentTaskIndex] = stryMutAct_9fa48("18868") ? {} : (stryCov_9fa48("18868"), {
              ...updatedTasks[currentTaskIndex],
              ...task
            });
            setTasks(updatedTasks);
            updateSessionData(updatedAllDays);
          }
        }
      }
    };

    // Add new resource
    const addNewResource = () => {
      if (stryMutAct_9fa48("18869")) {
        {}
      } else {
        stryCov_9fa48("18869");
        setEditingResourceIndex(stryMutAct_9fa48("18870") ? +1 : (stryCov_9fa48("18870"), -1)); // -1 indicates a new resource
        setEditingResourceField(stryMutAct_9fa48("18871") ? "" : (stryCov_9fa48("18871"), 'title'));
        setEditingResourceValue(stryMutAct_9fa48("18872") ? "" : (stryCov_9fa48("18872"), 'New Resource - click to edit'));
      }
    };

    // Show delete confirmation modal
    const showDeleteTaskConfirmation = taskIndex => {
      if (stryMutAct_9fa48("18873")) {
        {}
      } else {
        stryCov_9fa48("18873");
        setTaskToDelete(taskIndex);
        setShowDeleteConfirm(stryMutAct_9fa48("18874") ? false : (stryCov_9fa48("18874"), true));
      }
    };

    // Cancel delete task
    const cancelDeleteTask = () => {
      if (stryMutAct_9fa48("18875")) {
        {}
      } else {
        stryCov_9fa48("18875");
        setTaskToDelete(null);
        setShowDeleteConfirm(stryMutAct_9fa48("18876") ? true : (stryCov_9fa48("18876"), false));
      }
    };

    // Confirm delete task
    const confirmDeleteTask = () => {
      if (stryMutAct_9fa48("18877")) {
        {}
      } else {
        stryCov_9fa48("18877");
        if (stryMutAct_9fa48("18880") ? taskToDelete !== null : stryMutAct_9fa48("18879") ? false : stryMutAct_9fa48("18878") ? true : (stryCov_9fa48("18878", "18879", "18880"), taskToDelete === null)) return;
        const updatedAllDays = stryMutAct_9fa48("18881") ? [] : (stryCov_9fa48("18881"), [...allDays]);
        const currentDayData = updatedAllDays[currentDayIndex];

        // Remove the time block at the specified index
        if (stryMutAct_9fa48("18884") ? currentDayData.time_blocks || currentDayData.time_blocks[taskToDelete] : stryMutAct_9fa48("18883") ? false : stryMutAct_9fa48("18882") ? true : (stryCov_9fa48("18882", "18883", "18884"), currentDayData.time_blocks && currentDayData.time_blocks[taskToDelete])) {
          if (stryMutAct_9fa48("18885")) {
            {}
          } else {
            stryCov_9fa48("18885");
            currentDayData.time_blocks.splice(taskToDelete, 1);

            // Update tasks array - rebuild from remaining time blocks
            const updatedTasks = stryMutAct_9fa48("18886") ? ["Stryker was here"] : (stryCov_9fa48("18886"), []);
            currentDayData.time_blocks.forEach((block, blockIndex) => {
              if (stryMutAct_9fa48("18887")) {
                {}
              } else {
                stryCov_9fa48("18887");
                if (stryMutAct_9fa48("18889") ? false : stryMutAct_9fa48("18888") ? true : (stryCov_9fa48("18888", "18889"), block.task)) {
                  if (stryMutAct_9fa48("18890")) {
                    {}
                  } else {
                    stryCov_9fa48("18890");
                    updatedTasks.push(stryMutAct_9fa48("18891") ? {} : (stryCov_9fa48("18891"), {
                      ...block.task,
                      id: stryMutAct_9fa48("18892") ? `` : (stryCov_9fa48("18892"), `task-${blockIndex}`),
                      blockIndex,
                      startTime: block.start_time,
                      endTime: block.end_time,
                      category: block.category
                    }));
                  }
                }
              }
            });
            setTasks(updatedTasks);

            // Adjust current task index if necessary
            let newTaskIndex = currentTaskIndex;
            if (stryMutAct_9fa48("18895") ? taskToDelete <= currentTaskIndex || currentTaskIndex > 0 : stryMutAct_9fa48("18894") ? false : stryMutAct_9fa48("18893") ? true : (stryCov_9fa48("18893", "18894", "18895"), (stryMutAct_9fa48("18898") ? taskToDelete > currentTaskIndex : stryMutAct_9fa48("18897") ? taskToDelete < currentTaskIndex : stryMutAct_9fa48("18896") ? true : (stryCov_9fa48("18896", "18897", "18898"), taskToDelete <= currentTaskIndex)) && (stryMutAct_9fa48("18901") ? currentTaskIndex <= 0 : stryMutAct_9fa48("18900") ? currentTaskIndex >= 0 : stryMutAct_9fa48("18899") ? true : (stryCov_9fa48("18899", "18900", "18901"), currentTaskIndex > 0)))) {
              if (stryMutAct_9fa48("18902")) {
                {}
              } else {
                stryCov_9fa48("18902");
                newTaskIndex = stryMutAct_9fa48("18903") ? currentTaskIndex + 1 : (stryCov_9fa48("18903"), currentTaskIndex - 1);
              }
            } else if (stryMutAct_9fa48("18907") ? taskToDelete >= currentTaskIndex : stryMutAct_9fa48("18906") ? taskToDelete <= currentTaskIndex : stryMutAct_9fa48("18905") ? false : stryMutAct_9fa48("18904") ? true : (stryCov_9fa48("18904", "18905", "18906", "18907"), taskToDelete < currentTaskIndex)) {
              if (stryMutAct_9fa48("18908")) {
                {}
              } else {
                stryCov_9fa48("18908");
                newTaskIndex = stryMutAct_9fa48("18909") ? currentTaskIndex + 1 : (stryCov_9fa48("18909"), currentTaskIndex - 1);
              }
            } else if (stryMutAct_9fa48("18913") ? currentTaskIndex < updatedTasks.length : stryMutAct_9fa48("18912") ? currentTaskIndex > updatedTasks.length : stryMutAct_9fa48("18911") ? false : stryMutAct_9fa48("18910") ? true : (stryCov_9fa48("18910", "18911", "18912", "18913"), currentTaskIndex >= updatedTasks.length)) {
              if (stryMutAct_9fa48("18914")) {
                {}
              } else {
                stryCov_9fa48("18914");
                newTaskIndex = stryMutAct_9fa48("18915") ? Math.min(0, updatedTasks.length - 1) : (stryCov_9fa48("18915"), Math.max(0, stryMutAct_9fa48("18916") ? updatedTasks.length + 1 : (stryCov_9fa48("18916"), updatedTasks.length - 1)));
              }
            }
            setCurrentTaskIndex(newTaskIndex);

            // Initialize messages for the new current task
            if (stryMutAct_9fa48("18919") ? updatedTasks.length > 0 || updatedTasks[newTaskIndex] : stryMutAct_9fa48("18918") ? false : stryMutAct_9fa48("18917") ? true : (stryCov_9fa48("18917", "18918", "18919"), (stryMutAct_9fa48("18922") ? updatedTasks.length <= 0 : stryMutAct_9fa48("18921") ? updatedTasks.length >= 0 : stryMutAct_9fa48("18920") ? true : (stryCov_9fa48("18920", "18921", "18922"), updatedTasks.length > 0)) && updatedTasks[newTaskIndex])) {
              if (stryMutAct_9fa48("18923")) {
                {}
              } else {
                stryCov_9fa48("18923");
                initializeMessages(updatedTasks[newTaskIndex]);
              }
            } else {
              if (stryMutAct_9fa48("18924")) {
                {}
              } else {
                stryCov_9fa48("18924");
                setMessages(stryMutAct_9fa48("18925") ? ["Stryker was here"] : (stryCov_9fa48("18925"), []));
              }
            }
            updateSessionData(updatedAllDays);
          }
        }

        // Close confirmation modal
        setTaskToDelete(null);
        setShowDeleteConfirm(stryMutAct_9fa48("18926") ? true : (stryCov_9fa48("18926"), false));
      }
    };

    // Export edited JSON
    const exportEditedJSON = () => {
      if (stryMutAct_9fa48("18927")) {
        {}
      } else {
        stryCov_9fa48("18927");
        const dataToExport = (stryMutAct_9fa48("18930") ? allDays.length !== 1 : stryMutAct_9fa48("18929") ? false : stryMutAct_9fa48("18928") ? true : (stryCov_9fa48("18928", "18929", "18930"), allDays.length === 1)) ? allDays[0] : allDays;
        const jsonString = JSON.stringify(dataToExport, null, 2);

        // Generate filename based on content dates and cohort
        const generateFileName = () => {
          if (stryMutAct_9fa48("18931")) {
            {}
          } else {
            stryCov_9fa48("18931");
            if (stryMutAct_9fa48("18934") ? allDays.length !== 0 : stryMutAct_9fa48("18933") ? false : stryMutAct_9fa48("18932") ? true : (stryCov_9fa48("18932", "18933", "18934"), allDays.length === 0)) {
              if (stryMutAct_9fa48("18935")) {
                {}
              } else {
                stryCov_9fa48("18935");
                return stryMutAct_9fa48("18936") ? `` : (stryCov_9fa48("18936"), `session-data-${new Date().toISOString().split(stryMutAct_9fa48("18937") ? "" : (stryCov_9fa48("18937"), 'T'))[0]}.json`);
              }
            }
            const cohort = stryMutAct_9fa48("18940") ? allDays[0]?.cohort && 'cohort' : stryMutAct_9fa48("18939") ? false : stryMutAct_9fa48("18938") ? true : (stryCov_9fa48("18938", "18939", "18940"), (stryMutAct_9fa48("18941") ? allDays[0].cohort : (stryCov_9fa48("18941"), allDays[0]?.cohort)) || (stryMutAct_9fa48("18942") ? "" : (stryCov_9fa48("18942"), 'cohort')));
            const cleanCohort = stryMutAct_9fa48("18943") ? cohort.replace(/[^a-zA-Z0-9]/g, '-').toUpperCase() : (stryCov_9fa48("18943"), cohort.replace(stryMutAct_9fa48("18944") ? /[a-zA-Z0-9]/g : (stryCov_9fa48("18944"), /[^a-zA-Z0-9]/g), stryMutAct_9fa48("18945") ? "" : (stryCov_9fa48("18945"), '-')).toLowerCase());
            if (stryMutAct_9fa48("18948") ? allDays.length !== 1 : stryMutAct_9fa48("18947") ? false : stryMutAct_9fa48("18946") ? true : (stryCov_9fa48("18946", "18947", "18948"), allDays.length === 1)) {
              if (stryMutAct_9fa48("18949")) {
                {}
              } else {
                stryCov_9fa48("18949");
                // Single day
                const day = allDays[0];
                const date = stryMutAct_9fa48("18952") ? day.date && new Date().toISOString().split('T')[0] : stryMutAct_9fa48("18951") ? false : stryMutAct_9fa48("18950") ? true : (stryCov_9fa48("18950", "18951", "18952"), day.date || new Date().toISOString().split(stryMutAct_9fa48("18953") ? "" : (stryCov_9fa48("18953"), 'T'))[0]);
                const dayNum = stryMutAct_9fa48("18956") ? day.day_number && '' : stryMutAct_9fa48("18955") ? false : stryMutAct_9fa48("18954") ? true : (stryCov_9fa48("18954", "18955", "18956"), day.day_number || (stryMutAct_9fa48("18957") ? "Stryker was here!" : (stryCov_9fa48("18957"), '')));
                const dayPart = dayNum ? stryMutAct_9fa48("18958") ? `` : (stryCov_9fa48("18958"), `-day${dayNum}`) : stryMutAct_9fa48("18959") ? "Stryker was here!" : (stryCov_9fa48("18959"), '');
                return stryMutAct_9fa48("18960") ? `` : (stryCov_9fa48("18960"), `${cleanCohort}${dayPart}-${date}.json`);
              }
            } else {
              if (stryMutAct_9fa48("18961")) {
                {}
              } else {
                stryCov_9fa48("18961");
                // Multiple days
                const dates = stryMutAct_9fa48("18962") ? allDays.map(day => day.date) : (stryCov_9fa48("18962"), allDays.map(stryMutAct_9fa48("18963") ? () => undefined : (stryCov_9fa48("18963"), day => day.date)).filter(Boolean));
                if (stryMutAct_9fa48("18967") ? dates.length <= 0 : stryMutAct_9fa48("18966") ? dates.length >= 0 : stryMutAct_9fa48("18965") ? false : stryMutAct_9fa48("18964") ? true : (stryCov_9fa48("18964", "18965", "18966", "18967"), dates.length > 0)) {
                  if (stryMutAct_9fa48("18968")) {
                    {}
                  } else {
                    stryCov_9fa48("18968");
                    const startDate = dates[0];
                    const endDate = dates[stryMutAct_9fa48("18969") ? dates.length + 1 : (stryCov_9fa48("18969"), dates.length - 1)];
                    const dayNums = stryMutAct_9fa48("18970") ? allDays.map(day => day.day_number) : (stryCov_9fa48("18970"), allDays.map(stryMutAct_9fa48("18971") ? () => undefined : (stryCov_9fa48("18971"), day => day.day_number)).filter(Boolean));
                    const dayRange = (stryMutAct_9fa48("18975") ? dayNums.length <= 0 : stryMutAct_9fa48("18974") ? dayNums.length >= 0 : stryMutAct_9fa48("18973") ? false : stryMutAct_9fa48("18972") ? true : (stryCov_9fa48("18972", "18973", "18974", "18975"), dayNums.length > 0)) ? stryMutAct_9fa48("18976") ? `` : (stryCov_9fa48("18976"), `-days${dayNums[0]}-${dayNums[stryMutAct_9fa48("18977") ? dayNums.length + 1 : (stryCov_9fa48("18977"), dayNums.length - 1)]}`) : stryMutAct_9fa48("18978") ? "Stryker was here!" : (stryCov_9fa48("18978"), '');
                    if (stryMutAct_9fa48("18981") ? startDate !== endDate : stryMutAct_9fa48("18980") ? false : stryMutAct_9fa48("18979") ? true : (stryCov_9fa48("18979", "18980", "18981"), startDate === endDate)) {
                      if (stryMutAct_9fa48("18982")) {
                        {}
                      } else {
                        stryCov_9fa48("18982");
                        return stryMutAct_9fa48("18983") ? `` : (stryCov_9fa48("18983"), `${cleanCohort}${dayRange}-${startDate}.json`);
                      }
                    } else {
                      if (stryMutAct_9fa48("18984")) {
                        {}
                      } else {
                        stryCov_9fa48("18984");
                        return stryMutAct_9fa48("18985") ? `` : (stryCov_9fa48("18985"), `${cleanCohort}${dayRange}-${startDate}_to_${endDate}.json`);
                      }
                    }
                  }
                } else {
                  if (stryMutAct_9fa48("18986")) {
                    {}
                  } else {
                    stryCov_9fa48("18986");
                    return stryMutAct_9fa48("18987") ? `` : (stryCov_9fa48("18987"), `${cleanCohort}-${new Date().toISOString().split(stryMutAct_9fa48("18988") ? "" : (stryCov_9fa48("18988"), 'T'))[0]}.json`);
                  }
                }
              }
            }
          }
        };

        // Create blob with explicit MIME type and charset
        const blob = new Blob(stryMutAct_9fa48("18989") ? [] : (stryCov_9fa48("18989"), [jsonString]), stryMutAct_9fa48("18990") ? {} : (stryCov_9fa48("18990"), {
          type: stryMutAct_9fa48("18991") ? "" : (stryCov_9fa48("18991"), 'application/json;charset=utf-8')
        }));
        const url = URL.createObjectURL(blob);
        const link = document.createElement(stryMutAct_9fa48("18992") ? "" : (stryCov_9fa48("18992"), 'a'));
        const fileName = generateFileName();

        // Set additional attributes to force download
        link.href = url;
        link.download = fileName;
        link.setAttribute(stryMutAct_9fa48("18993") ? "" : (stryCov_9fa48("18993"), 'download'), fileName);
        link.style.display = stryMutAct_9fa48("18994") ? "" : (stryCov_9fa48("18994"), 'none');

        // Append to body, click, and clean up
        document.body.appendChild(link);
        link.click();

        // Clean up immediately after click
        setTimeout(() => {
          if (stryMutAct_9fa48("18995")) {
            {}
          } else {
            stryCov_9fa48("18995");
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          }
        }, 100);
        setHasUnsavedChanges(stryMutAct_9fa48("18996") ? true : (stryCov_9fa48("18996"), false));
      }
    };
    const getTaskIcon = type => {
      if (stryMutAct_9fa48("18997")) {
        {}
      } else {
        stryCov_9fa48("18997");
        switch (type) {
          case stryMutAct_9fa48("18998") ? "" : (stryCov_9fa48("18998"), 'standup'):
          case stryMutAct_9fa48("19000") ? "" : (stryCov_9fa48("19000"), 'discussion'):
            if (stryMutAct_9fa48("18999")) {} else {
              stryCov_9fa48("18999");
              return <FaCheckCircle className="task-icon standup" />;
            }
          case stryMutAct_9fa48("19002") ? "" : (stryCov_9fa48("19002"), 'group'):
            if (stryMutAct_9fa48("19001")) {} else {
              stryCov_9fa48("19001");
              return <FaUsers className="task-icon group" />;
            }
          case stryMutAct_9fa48("19004") ? "" : (stryCov_9fa48("19004"), 'individual'):
            if (stryMutAct_9fa48("19003")) {} else {
              stryCov_9fa48("19003");
              return <FaUsers className="task-icon individual" />;
            }
          case stryMutAct_9fa48("19006") ? "" : (stryCov_9fa48("19006"), 'reflection'):
            if (stryMutAct_9fa48("19005")) {} else {
              stryCov_9fa48("19005");
              return <FaBook className="task-icon reflection" />;
            }
          default:
            if (stryMutAct_9fa48("19007")) {} else {
              stryCov_9fa48("19007");
              return <FaCheckCircle className="task-icon" />;
            }
        }
      }
    };
    const getResourceIcon = type => {
      if (stryMutAct_9fa48("19008")) {
        {}
      } else {
        stryCov_9fa48("19008");
        switch (type) {
          case stryMutAct_9fa48("19010") ? "" : (stryCov_9fa48("19010"), 'video'):
            if (stryMutAct_9fa48("19009")) {} else {
              stryCov_9fa48("19009");
              return <FaVideo className="resource-icon video" />;
            }
          case stryMutAct_9fa48("19011") ? "" : (stryCov_9fa48("19011"), 'article'):
          case stryMutAct_9fa48("19013") ? "" : (stryCov_9fa48("19013"), 'link'):
            if (stryMutAct_9fa48("19012")) {} else {
              stryCov_9fa48("19012");
              return <FaLink className="resource-icon article" />;
            }
          default:
            if (stryMutAct_9fa48("19014")) {} else {
              stryCov_9fa48("19014");
              return <FaFileAlt className="resource-icon" />;
            }
        }
      }
    };
    const formatTime = timeString => {
      if (stryMutAct_9fa48("19015")) {
        {}
      } else {
        stryCov_9fa48("19015");
        if (stryMutAct_9fa48("19018") ? false : stryMutAct_9fa48("19017") ? true : stryMutAct_9fa48("19016") ? timeString : (stryCov_9fa48("19016", "19017", "19018"), !timeString)) return stryMutAct_9fa48("19019") ? "Stryker was here!" : (stryCov_9fa48("19019"), '');
        const timeParts = timeString.split(stryMutAct_9fa48("19020") ? "" : (stryCov_9fa48("19020"), ':'));
        const hours = parseInt(timeParts[0], 10);
        const minutes = stryMutAct_9fa48("19023") ? timeParts[1] && '00' : stryMutAct_9fa48("19022") ? false : stryMutAct_9fa48("19021") ? true : (stryCov_9fa48("19021", "19022", "19023"), timeParts[1] || (stryMutAct_9fa48("19024") ? "" : (stryCov_9fa48("19024"), '00')));
        const period = (stryMutAct_9fa48("19028") ? hours < 12 : stryMutAct_9fa48("19027") ? hours > 12 : stryMutAct_9fa48("19026") ? false : stryMutAct_9fa48("19025") ? true : (stryCov_9fa48("19025", "19026", "19027", "19028"), hours >= 12)) ? stryMutAct_9fa48("19029") ? "" : (stryCov_9fa48("19029"), 'PM') : stryMutAct_9fa48("19030") ? "" : (stryCov_9fa48("19030"), 'AM');
        const formattedHours = stryMutAct_9fa48("19033") ? hours % 12 && 12 : stryMutAct_9fa48("19032") ? false : stryMutAct_9fa48("19031") ? true : (stryCov_9fa48("19031", "19032", "19033"), (stryMutAct_9fa48("19034") ? hours * 12 : (stryCov_9fa48("19034"), hours % 12)) || 12);
        return stryMutAct_9fa48("19035") ? `` : (stryCov_9fa48("19035"), `${formattedHours}:${minutes} ${period}`);
      }
    };
    return <div className="session-data-tester">
      <div className="session-data-tester__content">
        {/* Input Panel */}
        <div className="session-data-tester__input-panel">
          <div className="session-data-tester__header">
            <h2>Session Data Input</h2>
            <p>Upload a JSON file or paste session data to preview</p>
          </div>

          <div className="session-data-tester__actions">
            <button onClick={stryMutAct_9fa48("19036") ? () => undefined : (stryCov_9fa48("19036"), () => stryMutAct_9fa48("19037") ? fileInputRef.current.click() : (stryCov_9fa48("19037"), fileInputRef.current?.click()))} className="session-data-tester__btn session-data-tester__btn--upload">
              <FaUpload />
              Upload JSON
            </button>
            
            <button onClick={clearData} className="session-data-tester__btn session-data-tester__btn--clear">
              <FaTrash />
              Clear
            </button>
          </div>

          <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileUpload} style={stryMutAct_9fa48("19038") ? {} : (stryCov_9fa48("19038"), {
            display: stryMutAct_9fa48("19039") ? "" : (stryCov_9fa48("19039"), 'none')
          })} />

          <div className="session-data-tester__input">
            <label htmlFor="jsonInput">Session JSON Data:</label>
            <textarea id="jsonInput" value={jsonInput} onChange={stryMutAct_9fa48("19040") ? () => undefined : (stryCov_9fa48("19040"), e => setJsonInput(e.target.value))} placeholder="Paste your session JSON data here and the preview will update automatically..." rows={20} />
          </div>



          {stryMutAct_9fa48("19043") ? error || <div className="session-data-tester__error">
              {error}
            </div> : stryMutAct_9fa48("19042") ? false : stryMutAct_9fa48("19041") ? true : (stryCov_9fa48("19041", "19042", "19043"), error && <div className="session-data-tester__error">
              {error}
            </div>)}
        </div>

        {/* Preview Panel */}
        <div className="session-data-tester__preview-panel">
          {sessionData ? <>
              {/* Preview Header with Action Buttons */}
              <div className="session-data-tester__preview-header">
                <div>
                  <h2>Session Preview & Editor</h2>
                  {stryMutAct_9fa48("19046") ? hasUnsavedChanges || <p className="session-data-tester__unsaved-notice">
                      You have unsaved changes - click "Export JSON" to save
                    </p> : stryMutAct_9fa48("19045") ? false : stryMutAct_9fa48("19044") ? true : (stryCov_9fa48("19044", "19045", "19046"), hasUnsavedChanges && <p className="session-data-tester__unsaved-notice">
                      You have unsaved changes - click "Export JSON" to save
                    </p>)}
                </div>
                <div className="session-data-tester__header-actions">
                  <button onClick={exportEditedJSON} className="session-data-tester__btn session-data-tester__btn--save" disabled={stryMutAct_9fa48("19047") ? sessionData : (stryCov_9fa48("19047"), !sessionData)} title="Export edited JSON">
                    <FaDownload />
                    Export JSON
                  </button>
                  <button onClick={stryMutAct_9fa48("19048") ? () => undefined : (stryCov_9fa48("19048"), () => setIsModalOpen(stryMutAct_9fa48("19049") ? false : (stryCov_9fa48("19049"), true)))} className="session-data-tester__btn session-data-tester__btn--fullscreen" title="Open in fullscreen editor" disabled={stryMutAct_9fa48("19050") ? sessionData : (stryCov_9fa48("19050"), !sessionData)}>
                    <FaExpand />
                    Fullscreen Editor
                  </button>
                </div>
              </div>
              {/* Multi-Day Navigation */}
              {stryMutAct_9fa48("19053") ? allDays.length > 1 || <div className="session-data-tester__day-nav">
                  <h3>Days ({allDays.length})</h3>
                  <div className="session-data-tester__day-list">
                    {allDays.map((day, index) => <button key={index} onClick={() => handleDayChange(index)} className={`session-data-tester__day-item ${index === currentDayIndex ? 'active' : ''}`}>
                        <div className="session-data-tester__day-info-nav">
                          <div className="session-data-tester__day-title">
                            Day {day.day_number}
                          </div>
                          <div className="session-data-tester__day-date">
                            {day.date}
                          </div>
                          <div className="session-data-tester__day-goal">
                            {day.daily_goal}
                          </div>
                        </div>
                      </button>)}
                  </div>
                </div> : stryMutAct_9fa48("19052") ? false : stryMutAct_9fa48("19051") ? true : (stryCov_9fa48("19051", "19052", "19053"), (stryMutAct_9fa48("19056") ? allDays.length <= 1 : stryMutAct_9fa48("19055") ? allDays.length >= 1 : stryMutAct_9fa48("19054") ? true : (stryCov_9fa48("19054", "19055", "19056"), allDays.length > 1)) && <div className="session-data-tester__day-nav">
                  <h3>Days ({allDays.length})</h3>
                  <div className="session-data-tester__day-list">
                    {allDays.map(stryMutAct_9fa48("19057") ? () => undefined : (stryCov_9fa48("19057"), (day, index) => <button key={index} onClick={stryMutAct_9fa48("19058") ? () => undefined : (stryCov_9fa48("19058"), () => handleDayChange(index))} className={stryMutAct_9fa48("19059") ? `` : (stryCov_9fa48("19059"), `session-data-tester__day-item ${(stryMutAct_9fa48("19062") ? index !== currentDayIndex : stryMutAct_9fa48("19061") ? false : stryMutAct_9fa48("19060") ? true : (stryCov_9fa48("19060", "19061", "19062"), index === currentDayIndex)) ? stryMutAct_9fa48("19063") ? "" : (stryCov_9fa48("19063"), 'active') : stryMutAct_9fa48("19064") ? "Stryker was here!" : (stryCov_9fa48("19064"), '')}`)}>
                        <div className="session-data-tester__day-info-nav">
                          <div className="session-data-tester__day-title">
                            Day {day.day_number}
                          </div>
                          <div className="session-data-tester__day-date">
                            {day.date}
                          </div>
                          <div className="session-data-tester__day-goal">
                            {day.daily_goal}
                          </div>
                        </div>
                      </button>))}
                  </div>
                </div>)}

              {/* Day Info Header */}
              <div className="session-data-tester__day-info">
                <div className="session-data-tester__day-header">
                  <h2>
                    Day {stryMutAct_9fa48("19065") ? currentDay.day_number : (stryCov_9fa48("19065"), currentDay?.day_number)} - {stryMutAct_9fa48("19066") ? currentDay.daily_goal : (stryCov_9fa48("19066"), currentDay?.daily_goal)}
                  </h2>
                  <div className="session-data-tester__day-meta">
                    {stryMutAct_9fa48("19067") ? currentDay.date : (stryCov_9fa48("19067"), currentDay?.date)} • {stryMutAct_9fa48("19068") ? currentDay.cohort : (stryCov_9fa48("19068"), currentDay?.cohort)}
                  </div>
                </div>
                
                {stryMutAct_9fa48("19071") ? currentDay?.learning_objectives || <div className="session-data-tester__objectives">
                    <h3>Learning Objectives</h3>
                    <ul>
                      {currentDay.learning_objectives.map((objective, index) => <li key={index}>{objective}</li>)}
                    </ul>
                  </div> : stryMutAct_9fa48("19070") ? false : stryMutAct_9fa48("19069") ? true : (stryCov_9fa48("19069", "19070", "19071"), (stryMutAct_9fa48("19072") ? currentDay.learning_objectives : (stryCov_9fa48("19072"), currentDay?.learning_objectives)) && <div className="session-data-tester__objectives">
                    <h3>Learning Objectives</h3>
                    <ul>
                      {currentDay.learning_objectives.map(stryMutAct_9fa48("19073") ? () => undefined : (stryCov_9fa48("19073"), (objective, index) => <li key={index}>{objective}</li>))}
                    </ul>
                  </div>)}
              </div>

              {/* Task Navigation */}
              {stryMutAct_9fa48("19076") ? tasks.length > 0 || <div className="session-data-tester__task-nav">
                  <div className="session-data-tester__task-nav-header">
                    <h3>Tasks ({tasks.length})</h3>
                    {/* Add Question button moved below conclusion */}
                  </div>
                  {tasks.length > 1 && <div className="session-data-tester__task-list">
                      {tasks.map((task, index) => <button key={task.id} onClick={() => handleTaskChange(index)} className={`session-data-tester__task-item ${index === currentTaskIndex ? 'active' : ''}`}>
                          {getTaskIcon(task.type)}
                          <div className="session-data-tester__task-info">
                            <div className="session-data-tester__task-title">
                              {task.title}
                            </div>
                            <div className="session-data-tester__task-time">
                              {formatTime(task.startTime)} - {formatTime(task.endTime)}
                            </div>
                          </div>
                        </button>)}
                    </div>}
                </div> : stryMutAct_9fa48("19075") ? false : stryMutAct_9fa48("19074") ? true : (stryCov_9fa48("19074", "19075", "19076"), (stryMutAct_9fa48("19079") ? tasks.length <= 0 : stryMutAct_9fa48("19078") ? tasks.length >= 0 : stryMutAct_9fa48("19077") ? true : (stryCov_9fa48("19077", "19078", "19079"), tasks.length > 0)) && <div className="session-data-tester__task-nav">
                  <div className="session-data-tester__task-nav-header">
                    <h3>Tasks ({tasks.length})</h3>
                    {/* Add Question button moved below conclusion */}
                  </div>
                  {stryMutAct_9fa48("19082") ? tasks.length > 1 || <div className="session-data-tester__task-list">
                      {tasks.map((task, index) => <button key={task.id} onClick={() => handleTaskChange(index)} className={`session-data-tester__task-item ${index === currentTaskIndex ? 'active' : ''}`}>
                          {getTaskIcon(task.type)}
                          <div className="session-data-tester__task-info">
                            <div className="session-data-tester__task-title">
                              {task.title}
                            </div>
                            <div className="session-data-tester__task-time">
                              {formatTime(task.startTime)} - {formatTime(task.endTime)}
                            </div>
                          </div>
                        </button>)}
                    </div> : stryMutAct_9fa48("19081") ? false : stryMutAct_9fa48("19080") ? true : (stryCov_9fa48("19080", "19081", "19082"), (stryMutAct_9fa48("19085") ? tasks.length <= 1 : stryMutAct_9fa48("19084") ? tasks.length >= 1 : stryMutAct_9fa48("19083") ? true : (stryCov_9fa48("19083", "19084", "19085"), tasks.length > 1)) && <div className="session-data-tester__task-list">
                      {tasks.map(stryMutAct_9fa48("19086") ? () => undefined : (stryCov_9fa48("19086"), (task, index) => <button key={task.id} onClick={stryMutAct_9fa48("19087") ? () => undefined : (stryCov_9fa48("19087"), () => handleTaskChange(index))} className={stryMutAct_9fa48("19088") ? `` : (stryCov_9fa48("19088"), `session-data-tester__task-item ${(stryMutAct_9fa48("19091") ? index !== currentTaskIndex : stryMutAct_9fa48("19090") ? false : stryMutAct_9fa48("19089") ? true : (stryCov_9fa48("19089", "19090", "19091"), index === currentTaskIndex)) ? stryMutAct_9fa48("19092") ? "" : (stryCov_9fa48("19092"), 'active') : stryMutAct_9fa48("19093") ? "Stryker was here!" : (stryCov_9fa48("19093"), '')}`)}>
                          {getTaskIcon(task.type)}
                          <div className="session-data-tester__task-info">
                            <div className="session-data-tester__task-title">
                              {task.title}
                            </div>
                            <div className="session-data-tester__task-time">
                              {formatTime(task.startTime)} - {formatTime(task.endTime)}
                            </div>
                          </div>
                        </button>))}
                    </div>)}
                </div>)}

              {/* Current Task Preview */}
              {stryMutAct_9fa48("19096") ? currentTask || <div className="session-data-tester__task-preview">
                  <div className="session-data-tester__task-header">
                    <div className="session-data-tester__task-title-section">
                      <div className="session-data-tester__task-content">
                        {/* Editable Title */}
                        {editingTaskField === 'title' ? <div className="session-data-tester__task-field-editor">
                            <input type="text" value={editingTaskValue} onChange={e => setEditingTaskValue(e.target.value)} className="session-data-tester__task-input" autoFocus />
                            <div className="session-data-tester__task-field-actions">
                              <button onClick={saveEditedTaskField} className="session-data-tester__btn session-data-tester__btn--save-small">
                                <FaCheck />
                              </button>
                              <button onClick={cancelEditingTaskField} className="session-data-tester__btn session-data-tester__btn--cancel">
                                <FaTimes />
                              </button>
                            </div>
                          </div> : <div className="session-data-tester__task-field-display">
                            <h3 onClick={() => startEditingTaskField('title', currentTask.title)}>
                              {currentTask.title}
                            </h3>
                            <button onClick={() => startEditingTaskField('title', currentTask.title)} className="session-data-tester__task-field-edit-btn" title="Click to edit title">
                              <FaEdit />
                            </button>
                          </div>}
                        
                        {/* Editable Time - moved under title */}
                        {currentTask.startTime && <div className="session-data-tester__task-time-section">
                            {editingTaskField === 'startTime' ? <div className="session-data-tester__task-time-editor">
                                <input type="text" value={editingTaskValue} onChange={e => setEditingTaskValue(e.target.value)} className="session-data-tester__task-time-input" placeholder="2:30 PM or 14:30" autoFocus />
                                <div className="session-data-tester__task-field-actions">
                                  <button onClick={saveEditedTaskField} className="session-data-tester__btn session-data-tester__btn--save-small">
                                    <FaCheck />
                                  </button>
                                  <button onClick={cancelEditingTaskField} className="session-data-tester__btn session-data-tester__btn--cancel">
                                    <FaTimes />
                                  </button>
                                </div>
                              </div> : <div className="session-data-tester__task-time-display">
                                <span onClick={() => startEditingTaskField('startTime', currentTask.startTime)} className="session-data-tester__task-time-value">
                                  {formatTime(currentTask.startTime)}
                                </span>
                                <button onClick={() => startEditingTaskField('startTime', currentTask.startTime)} className="session-data-tester__task-field-edit-btn" title="Click to edit start time">
                                  <FaEdit />
                                </button>
                              </div>}
                            
                            <span className="session-data-tester__task-time-separator">-</span>
                            
                            {editingTaskField === 'endTime' ? <div className="session-data-tester__task-time-editor">
                                <input type="text" value={editingTaskValue} onChange={e => setEditingTaskValue(e.target.value)} className="session-data-tester__task-time-input" placeholder="2:30 PM or 14:30" autoFocus />
                                <div className="session-data-tester__task-field-actions">
                                  <button onClick={saveEditedTaskField} className="session-data-tester__btn session-data-tester__btn--save-small">
                                    <FaCheck />
                                  </button>
                                  <button onClick={cancelEditingTaskField} className="session-data-tester__btn session-data-tester__btn--cancel">
                                    <FaTimes />
                                  </button>
                                </div>
                              </div> : <div className="session-data-tester__task-time-display">
                                <span onClick={() => startEditingTaskField('endTime', currentTask.endTime)} className="session-data-tester__task-time-value">
                                  {formatTime(currentTask.endTime)}
                                </span>
                                <button onClick={() => startEditingTaskField('endTime', currentTask.endTime)} className="session-data-tester__task-field-edit-btn" title="Click to edit end time">
                                  <FaEdit />
                                </button>
                              </div>}
                          </div>}
                        
                        {/* Editable Description */}
                        {editingTaskField === 'description' ? <div className="session-data-tester__task-field-editor">
                            <input type="text" value={editingTaskValue} onChange={e => setEditingTaskValue(e.target.value)} className="session-data-tester__task-input" autoFocus />
                            <div className="session-data-tester__task-field-actions">
                              <button onClick={saveEditedTaskField} className="session-data-tester__btn session-data-tester__btn--save-small">
                                <FaCheck />
                              </button>
                              <button onClick={cancelEditingTaskField} className="session-data-tester__btn session-data-tester__btn--cancel">
                                <FaTimes />
                              </button>
                            </div>
                          </div> : <div className="session-data-tester__task-field-display">
                            <p onClick={() => startEditingTaskField('description', currentTask.description)}>
                              {currentTask.description}
                            </p>
                            <button onClick={() => startEditingTaskField('description', currentTask.description)} className="session-data-tester__task-field-edit-btn" title="Click to edit description">
                              <FaEdit />
                            </button>
                          </div>}
                      </div>
                    </div>
                    
                    <div className="session-data-tester__task-meta">
                      {/* Analysis Checkboxes - centered */}
                      <div className="session-data-tester__task-analysis">
                        <label className="session-data-tester__checkbox-label">
                          <input type="checkbox" checked={currentTask.should_analyze || false} onChange={e => updateTaskCheckbox('should_analyze', e.target.checked)} className="session-data-tester__checkbox" />
                          <span className="session-data-tester__checkbox-text">Should Analyze</span>
                        </label>
                        
                        <label className="session-data-tester__checkbox-label">
                          <input type="checkbox" checked={currentTask.analyze_deliverable || false} onChange={e => updateTaskCheckbox('analyze_deliverable', e.target.checked)} className="session-data-tester__checkbox" />
                          <span className="session-data-tester__checkbox-text">Analyze Deliverable</span>
                        </label>
                      </div>
                      
                      {/* Add Resource & Add Question Buttons - right side */}
                      <div className="session-data-tester__task-actions">
                        <button onClick={addNewResource} className="session-data-tester__btn session-data-tester__btn--add-resource" title="Add new resource to current task">
                          <FaPlus />
                          Add Resource
                        </button>
                        <button onClick={addNewQuestion} className="session-data-tester__btn session-data-tester__btn--add-question" title="Add new question to current task">
                          <FaPlus />
                          Add Question
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Resources */}
                  {currentTask.linked_resources && currentTask.linked_resources.length > 0 && <div className="session-data-tester__resources">
                      <h4>Resources</h4>
                      <div className="session-data-tester__resource-list">
                        {currentTask.linked_resources.map((resource, index) => <div key={index} className="session-data-tester__resource">
                            {getResourceIcon(resource.type)}
                            <div className="session-data-tester__resource-content">
                              <a href={resource.url} target="_blank" rel="noopener noreferrer" className="session-data-tester__resource-title">
                                {resource.title}
                                <FaExternalLinkAlt />
                              </a>
                              {resource.description && <p className="session-data-tester__resource-description">
                                  {resource.description}
                                </p>}
                            </div>
                            <div className="session-data-tester__resource-actions">
                              <button onClick={() => startEditingResource(index, 'title', resource.title)} className="session-data-tester__btn session-data-tester__btn--edit-small" title="Edit title">
                                <FaEdit />
                              </button>
                              <button onClick={() => startEditingResource(index, 'url', resource.url)} className="session-data-tester__btn session-data-tester__btn--edit-small" title="Edit URL">
                                <FaLink />
                              </button>
                              <button onClick={() => startEditingResource(index, 'description', resource.description)} className="session-data-tester__btn session-data-tester__btn--edit-small" title="Edit description">
                                <FaFileAlt />
                              </button>
                              <button onClick={() => deleteResource(index)} className="session-data-tester__btn session-data-tester__btn--delete-small" title="Delete resource">
                                <FaTrash />
                              </button>
                            </div>
                          </div>)}
                      </div>
                    </div>}

                  {/* Messages Preview */}
                  <div className="session-data-tester__messages">
                    <h4>Conversation Flow (Click to Edit)</h4>
                    <div className="session-data-tester__message-list">
                      {messages.map((message, messageIndex) => <div key={message.id} className={`session-data-tester__message session-data-tester__message--${message.role}`}>
                          {message.id === 'intro' && <div className="session-data-tester__message-label">Introduction</div>}
                          {message.id === 'conclusion' && <div className="session-data-tester__message-label">Conclusion</div>}
                          {editingMessageId === message.id ? <div className="session-data-tester__message-editor">
                              <textarea value={editingText} onChange={e => setEditingText(e.target.value)} className="session-data-tester__message-textarea" rows={5} autoFocus />
                              <div className="session-data-tester__message-actions">
                                <button onClick={saveEditedMessage} className="session-data-tester__btn session-data-tester__btn--save-small">
                                  <FaCheck />
                                  Save
                                </button>
                                <button onClick={cancelEditing} className="session-data-tester__btn session-data-tester__btn--cancel">
                                  <FaTimes />
                                  Cancel
                                </button>
                                {message.id.startsWith('question-') && <button onClick={() => {
                          const questionIndex = parseInt(message.id.split('-')[1]);
                          deleteQuestion(questionIndex);
                          cancelEditing();
                        }} className="session-data-tester__btn session-data-tester__btn--delete">
                                    <FaTrash />
                                    Delete
                                  </button>}
                              </div>
                            </div> : <div className="session-data-tester__message-content">
                              <div className="session-data-tester__message-text">
                                <ReactMarkdown>{message.content}</ReactMarkdown>
                              </div>
                              <button onClick={() => startEditingMessage(message.id, message.content)} className="session-data-tester__message-edit-btn" title="Click to edit">
                                <FaEdit />
                              </button>
                            </div>}
                        </div>)}
                    </div>
                  </div>
                </div> : stryMutAct_9fa48("19095") ? false : stryMutAct_9fa48("19094") ? true : (stryCov_9fa48("19094", "19095", "19096"), currentTask && <div className="session-data-tester__task-preview">
                  <div className="session-data-tester__task-header">
                    <div className="session-data-tester__task-title-section">
                      <div className="session-data-tester__task-content">
                        {/* Editable Title */}
                        {(stryMutAct_9fa48("19099") ? editingTaskField !== 'title' : stryMutAct_9fa48("19098") ? false : stryMutAct_9fa48("19097") ? true : (stryCov_9fa48("19097", "19098", "19099"), editingTaskField === (stryMutAct_9fa48("19100") ? "" : (stryCov_9fa48("19100"), 'title')))) ? <div className="session-data-tester__task-field-editor">
                            <input type="text" value={editingTaskValue} onChange={stryMutAct_9fa48("19101") ? () => undefined : (stryCov_9fa48("19101"), e => setEditingTaskValue(e.target.value))} className="session-data-tester__task-input" autoFocus />
                            <div className="session-data-tester__task-field-actions">
                              <button onClick={saveEditedTaskField} className="session-data-tester__btn session-data-tester__btn--save-small">
                                <FaCheck />
                              </button>
                              <button onClick={cancelEditingTaskField} className="session-data-tester__btn session-data-tester__btn--cancel">
                                <FaTimes />
                              </button>
                            </div>
                          </div> : <div className="session-data-tester__task-field-display">
                            <h3 onClick={stryMutAct_9fa48("19102") ? () => undefined : (stryCov_9fa48("19102"), () => startEditingTaskField(stryMutAct_9fa48("19103") ? "" : (stryCov_9fa48("19103"), 'title'), currentTask.title))}>
                              {currentTask.title}
                            </h3>
                            <button onClick={stryMutAct_9fa48("19104") ? () => undefined : (stryCov_9fa48("19104"), () => startEditingTaskField(stryMutAct_9fa48("19105") ? "" : (stryCov_9fa48("19105"), 'title'), currentTask.title))} className="session-data-tester__task-field-edit-btn" title="Click to edit title">
                              <FaEdit />
                            </button>
                          </div>}
                        
                        {/* Editable Time - moved under title */}
                        {stryMutAct_9fa48("19108") ? currentTask.startTime || <div className="session-data-tester__task-time-section">
                            {editingTaskField === 'startTime' ? <div className="session-data-tester__task-time-editor">
                                <input type="text" value={editingTaskValue} onChange={e => setEditingTaskValue(e.target.value)} className="session-data-tester__task-time-input" placeholder="2:30 PM or 14:30" autoFocus />
                                <div className="session-data-tester__task-field-actions">
                                  <button onClick={saveEditedTaskField} className="session-data-tester__btn session-data-tester__btn--save-small">
                                    <FaCheck />
                                  </button>
                                  <button onClick={cancelEditingTaskField} className="session-data-tester__btn session-data-tester__btn--cancel">
                                    <FaTimes />
                                  </button>
                                </div>
                              </div> : <div className="session-data-tester__task-time-display">
                                <span onClick={() => startEditingTaskField('startTime', currentTask.startTime)} className="session-data-tester__task-time-value">
                                  {formatTime(currentTask.startTime)}
                                </span>
                                <button onClick={() => startEditingTaskField('startTime', currentTask.startTime)} className="session-data-tester__task-field-edit-btn" title="Click to edit start time">
                                  <FaEdit />
                                </button>
                              </div>}
                            
                            <span className="session-data-tester__task-time-separator">-</span>
                            
                            {editingTaskField === 'endTime' ? <div className="session-data-tester__task-time-editor">
                                <input type="text" value={editingTaskValue} onChange={e => setEditingTaskValue(e.target.value)} className="session-data-tester__task-time-input" placeholder="2:30 PM or 14:30" autoFocus />
                                <div className="session-data-tester__task-field-actions">
                                  <button onClick={saveEditedTaskField} className="session-data-tester__btn session-data-tester__btn--save-small">
                                    <FaCheck />
                                  </button>
                                  <button onClick={cancelEditingTaskField} className="session-data-tester__btn session-data-tester__btn--cancel">
                                    <FaTimes />
                                  </button>
                                </div>
                              </div> : <div className="session-data-tester__task-time-display">
                                <span onClick={() => startEditingTaskField('endTime', currentTask.endTime)} className="session-data-tester__task-time-value">
                                  {formatTime(currentTask.endTime)}
                                </span>
                                <button onClick={() => startEditingTaskField('endTime', currentTask.endTime)} className="session-data-tester__task-field-edit-btn" title="Click to edit end time">
                                  <FaEdit />
                                </button>
                              </div>}
                          </div> : stryMutAct_9fa48("19107") ? false : stryMutAct_9fa48("19106") ? true : (stryCov_9fa48("19106", "19107", "19108"), currentTask.startTime && <div className="session-data-tester__task-time-section">
                            {(stryMutAct_9fa48("19111") ? editingTaskField !== 'startTime' : stryMutAct_9fa48("19110") ? false : stryMutAct_9fa48("19109") ? true : (stryCov_9fa48("19109", "19110", "19111"), editingTaskField === (stryMutAct_9fa48("19112") ? "" : (stryCov_9fa48("19112"), 'startTime')))) ? <div className="session-data-tester__task-time-editor">
                                <input type="text" value={editingTaskValue} onChange={stryMutAct_9fa48("19113") ? () => undefined : (stryCov_9fa48("19113"), e => setEditingTaskValue(e.target.value))} className="session-data-tester__task-time-input" placeholder="2:30 PM or 14:30" autoFocus />
                                <div className="session-data-tester__task-field-actions">
                                  <button onClick={saveEditedTaskField} className="session-data-tester__btn session-data-tester__btn--save-small">
                                    <FaCheck />
                                  </button>
                                  <button onClick={cancelEditingTaskField} className="session-data-tester__btn session-data-tester__btn--cancel">
                                    <FaTimes />
                                  </button>
                                </div>
                              </div> : <div className="session-data-tester__task-time-display">
                                <span onClick={stryMutAct_9fa48("19114") ? () => undefined : (stryCov_9fa48("19114"), () => startEditingTaskField(stryMutAct_9fa48("19115") ? "" : (stryCov_9fa48("19115"), 'startTime'), currentTask.startTime))} className="session-data-tester__task-time-value">
                                  {formatTime(currentTask.startTime)}
                                </span>
                                <button onClick={stryMutAct_9fa48("19116") ? () => undefined : (stryCov_9fa48("19116"), () => startEditingTaskField(stryMutAct_9fa48("19117") ? "" : (stryCov_9fa48("19117"), 'startTime'), currentTask.startTime))} className="session-data-tester__task-field-edit-btn" title="Click to edit start time">
                                  <FaEdit />
                                </button>
                              </div>}
                            
                            <span className="session-data-tester__task-time-separator">-</span>
                            
                            {(stryMutAct_9fa48("19120") ? editingTaskField !== 'endTime' : stryMutAct_9fa48("19119") ? false : stryMutAct_9fa48("19118") ? true : (stryCov_9fa48("19118", "19119", "19120"), editingTaskField === (stryMutAct_9fa48("19121") ? "" : (stryCov_9fa48("19121"), 'endTime')))) ? <div className="session-data-tester__task-time-editor">
                                <input type="text" value={editingTaskValue} onChange={stryMutAct_9fa48("19122") ? () => undefined : (stryCov_9fa48("19122"), e => setEditingTaskValue(e.target.value))} className="session-data-tester__task-time-input" placeholder="2:30 PM or 14:30" autoFocus />
                                <div className="session-data-tester__task-field-actions">
                                  <button onClick={saveEditedTaskField} className="session-data-tester__btn session-data-tester__btn--save-small">
                                    <FaCheck />
                                  </button>
                                  <button onClick={cancelEditingTaskField} className="session-data-tester__btn session-data-tester__btn--cancel">
                                    <FaTimes />
                                  </button>
                                </div>
                              </div> : <div className="session-data-tester__task-time-display">
                                <span onClick={stryMutAct_9fa48("19123") ? () => undefined : (stryCov_9fa48("19123"), () => startEditingTaskField(stryMutAct_9fa48("19124") ? "" : (stryCov_9fa48("19124"), 'endTime'), currentTask.endTime))} className="session-data-tester__task-time-value">
                                  {formatTime(currentTask.endTime)}
                                </span>
                                <button onClick={stryMutAct_9fa48("19125") ? () => undefined : (stryCov_9fa48("19125"), () => startEditingTaskField(stryMutAct_9fa48("19126") ? "" : (stryCov_9fa48("19126"), 'endTime'), currentTask.endTime))} className="session-data-tester__task-field-edit-btn" title="Click to edit end time">
                                  <FaEdit />
                                </button>
                              </div>}
                          </div>)}
                        
                        {/* Editable Description */}
                        {(stryMutAct_9fa48("19129") ? editingTaskField !== 'description' : stryMutAct_9fa48("19128") ? false : stryMutAct_9fa48("19127") ? true : (stryCov_9fa48("19127", "19128", "19129"), editingTaskField === (stryMutAct_9fa48("19130") ? "" : (stryCov_9fa48("19130"), 'description')))) ? <div className="session-data-tester__task-field-editor">
                            <input type="text" value={editingTaskValue} onChange={stryMutAct_9fa48("19131") ? () => undefined : (stryCov_9fa48("19131"), e => setEditingTaskValue(e.target.value))} className="session-data-tester__task-input" autoFocus />
                            <div className="session-data-tester__task-field-actions">
                              <button onClick={saveEditedTaskField} className="session-data-tester__btn session-data-tester__btn--save-small">
                                <FaCheck />
                              </button>
                              <button onClick={cancelEditingTaskField} className="session-data-tester__btn session-data-tester__btn--cancel">
                                <FaTimes />
                              </button>
                            </div>
                          </div> : <div className="session-data-tester__task-field-display">
                            <p onClick={stryMutAct_9fa48("19132") ? () => undefined : (stryCov_9fa48("19132"), () => startEditingTaskField(stryMutAct_9fa48("19133") ? "" : (stryCov_9fa48("19133"), 'description'), currentTask.description))}>
                              {currentTask.description}
                            </p>
                            <button onClick={stryMutAct_9fa48("19134") ? () => undefined : (stryCov_9fa48("19134"), () => startEditingTaskField(stryMutAct_9fa48("19135") ? "" : (stryCov_9fa48("19135"), 'description'), currentTask.description))} className="session-data-tester__task-field-edit-btn" title="Click to edit description">
                              <FaEdit />
                            </button>
                          </div>}
                      </div>
                    </div>
                    
                    <div className="session-data-tester__task-meta">
                      {/* Analysis Checkboxes - centered */}
                      <div className="session-data-tester__task-analysis">
                        <label className="session-data-tester__checkbox-label">
                          <input type="checkbox" checked={stryMutAct_9fa48("19138") ? currentTask.should_analyze && false : stryMutAct_9fa48("19137") ? false : stryMutAct_9fa48("19136") ? true : (stryCov_9fa48("19136", "19137", "19138"), currentTask.should_analyze || (stryMutAct_9fa48("19139") ? true : (stryCov_9fa48("19139"), false)))} onChange={stryMutAct_9fa48("19140") ? () => undefined : (stryCov_9fa48("19140"), e => updateTaskCheckbox(stryMutAct_9fa48("19141") ? "" : (stryCov_9fa48("19141"), 'should_analyze'), e.target.checked))} className="session-data-tester__checkbox" />
                          <span className="session-data-tester__checkbox-text">Should Analyze</span>
                        </label>
                        
                        <label className="session-data-tester__checkbox-label">
                          <input type="checkbox" checked={stryMutAct_9fa48("19144") ? currentTask.analyze_deliverable && false : stryMutAct_9fa48("19143") ? false : stryMutAct_9fa48("19142") ? true : (stryCov_9fa48("19142", "19143", "19144"), currentTask.analyze_deliverable || (stryMutAct_9fa48("19145") ? true : (stryCov_9fa48("19145"), false)))} onChange={stryMutAct_9fa48("19146") ? () => undefined : (stryCov_9fa48("19146"), e => updateTaskCheckbox(stryMutAct_9fa48("19147") ? "" : (stryCov_9fa48("19147"), 'analyze_deliverable'), e.target.checked))} className="session-data-tester__checkbox" />
                          <span className="session-data-tester__checkbox-text">Analyze Deliverable</span>
                        </label>
                      </div>
                      
                      {/* Add Resource & Add Question Buttons - right side */}
                      <div className="session-data-tester__task-actions">
                        <button onClick={addNewResource} className="session-data-tester__btn session-data-tester__btn--add-resource" title="Add new resource to current task">
                          <FaPlus />
                          Add Resource
                        </button>
                        <button onClick={addNewQuestion} className="session-data-tester__btn session-data-tester__btn--add-question" title="Add new question to current task">
                          <FaPlus />
                          Add Question
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Resources */}
                  {stryMutAct_9fa48("19150") ? currentTask.linked_resources && currentTask.linked_resources.length > 0 || <div className="session-data-tester__resources">
                      <h4>Resources</h4>
                      <div className="session-data-tester__resource-list">
                        {currentTask.linked_resources.map((resource, index) => <div key={index} className="session-data-tester__resource">
                            {getResourceIcon(resource.type)}
                            <div className="session-data-tester__resource-content">
                              <a href={resource.url} target="_blank" rel="noopener noreferrer" className="session-data-tester__resource-title">
                                {resource.title}
                                <FaExternalLinkAlt />
                              </a>
                              {resource.description && <p className="session-data-tester__resource-description">
                                  {resource.description}
                                </p>}
                            </div>
                            <div className="session-data-tester__resource-actions">
                              <button onClick={() => startEditingResource(index, 'title', resource.title)} className="session-data-tester__btn session-data-tester__btn--edit-small" title="Edit title">
                                <FaEdit />
                              </button>
                              <button onClick={() => startEditingResource(index, 'url', resource.url)} className="session-data-tester__btn session-data-tester__btn--edit-small" title="Edit URL">
                                <FaLink />
                              </button>
                              <button onClick={() => startEditingResource(index, 'description', resource.description)} className="session-data-tester__btn session-data-tester__btn--edit-small" title="Edit description">
                                <FaFileAlt />
                              </button>
                              <button onClick={() => deleteResource(index)} className="session-data-tester__btn session-data-tester__btn--delete-small" title="Delete resource">
                                <FaTrash />
                              </button>
                            </div>
                          </div>)}
                      </div>
                    </div> : stryMutAct_9fa48("19149") ? false : stryMutAct_9fa48("19148") ? true : (stryCov_9fa48("19148", "19149", "19150"), (stryMutAct_9fa48("19152") ? currentTask.linked_resources || currentTask.linked_resources.length > 0 : stryMutAct_9fa48("19151") ? true : (stryCov_9fa48("19151", "19152"), currentTask.linked_resources && (stryMutAct_9fa48("19155") ? currentTask.linked_resources.length <= 0 : stryMutAct_9fa48("19154") ? currentTask.linked_resources.length >= 0 : stryMutAct_9fa48("19153") ? true : (stryCov_9fa48("19153", "19154", "19155"), currentTask.linked_resources.length > 0)))) && <div className="session-data-tester__resources">
                      <h4>Resources</h4>
                      <div className="session-data-tester__resource-list">
                        {currentTask.linked_resources.map(stryMutAct_9fa48("19156") ? () => undefined : (stryCov_9fa48("19156"), (resource, index) => <div key={index} className="session-data-tester__resource">
                            {getResourceIcon(resource.type)}
                            <div className="session-data-tester__resource-content">
                              <a href={resource.url} target="_blank" rel="noopener noreferrer" className="session-data-tester__resource-title">
                                {resource.title}
                                <FaExternalLinkAlt />
                              </a>
                              {stryMutAct_9fa48("19159") ? resource.description || <p className="session-data-tester__resource-description">
                                  {resource.description}
                                </p> : stryMutAct_9fa48("19158") ? false : stryMutAct_9fa48("19157") ? true : (stryCov_9fa48("19157", "19158", "19159"), resource.description && <p className="session-data-tester__resource-description">
                                  {resource.description}
                                </p>)}
                            </div>
                            <div className="session-data-tester__resource-actions">
                              <button onClick={stryMutAct_9fa48("19160") ? () => undefined : (stryCov_9fa48("19160"), () => startEditingResource(index, stryMutAct_9fa48("19161") ? "" : (stryCov_9fa48("19161"), 'title'), resource.title))} className="session-data-tester__btn session-data-tester__btn--edit-small" title="Edit title">
                                <FaEdit />
                              </button>
                              <button onClick={stryMutAct_9fa48("19162") ? () => undefined : (stryCov_9fa48("19162"), () => startEditingResource(index, stryMutAct_9fa48("19163") ? "" : (stryCov_9fa48("19163"), 'url'), resource.url))} className="session-data-tester__btn session-data-tester__btn--edit-small" title="Edit URL">
                                <FaLink />
                              </button>
                              <button onClick={stryMutAct_9fa48("19164") ? () => undefined : (stryCov_9fa48("19164"), () => startEditingResource(index, stryMutAct_9fa48("19165") ? "" : (stryCov_9fa48("19165"), 'description'), resource.description))} className="session-data-tester__btn session-data-tester__btn--edit-small" title="Edit description">
                                <FaFileAlt />
                              </button>
                              <button onClick={stryMutAct_9fa48("19166") ? () => undefined : (stryCov_9fa48("19166"), () => deleteResource(index))} className="session-data-tester__btn session-data-tester__btn--delete-small" title="Delete resource">
                                <FaTrash />
                              </button>
                            </div>
                          </div>))}
                      </div>
                    </div>)}

                  {/* Messages Preview */}
                  <div className="session-data-tester__messages">
                    <h4>Conversation Flow (Click to Edit)</h4>
                    <div className="session-data-tester__message-list">
                      {messages.map(stryMutAct_9fa48("19167") ? () => undefined : (stryCov_9fa48("19167"), (message, messageIndex) => <div key={message.id} className={stryMutAct_9fa48("19168") ? `` : (stryCov_9fa48("19168"), `session-data-tester__message session-data-tester__message--${message.role}`)}>
                          {stryMutAct_9fa48("19171") ? message.id === 'intro' || <div className="session-data-tester__message-label">Introduction</div> : stryMutAct_9fa48("19170") ? false : stryMutAct_9fa48("19169") ? true : (stryCov_9fa48("19169", "19170", "19171"), (stryMutAct_9fa48("19173") ? message.id !== 'intro' : stryMutAct_9fa48("19172") ? true : (stryCov_9fa48("19172", "19173"), message.id === (stryMutAct_9fa48("19174") ? "" : (stryCov_9fa48("19174"), 'intro')))) && <div className="session-data-tester__message-label">Introduction</div>)}
                          {stryMutAct_9fa48("19177") ? message.id === 'conclusion' || <div className="session-data-tester__message-label">Conclusion</div> : stryMutAct_9fa48("19176") ? false : stryMutAct_9fa48("19175") ? true : (stryCov_9fa48("19175", "19176", "19177"), (stryMutAct_9fa48("19179") ? message.id !== 'conclusion' : stryMutAct_9fa48("19178") ? true : (stryCov_9fa48("19178", "19179"), message.id === (stryMutAct_9fa48("19180") ? "" : (stryCov_9fa48("19180"), 'conclusion')))) && <div className="session-data-tester__message-label">Conclusion</div>)}
                          {(stryMutAct_9fa48("19183") ? editingMessageId !== message.id : stryMutAct_9fa48("19182") ? false : stryMutAct_9fa48("19181") ? true : (stryCov_9fa48("19181", "19182", "19183"), editingMessageId === message.id)) ? <div className="session-data-tester__message-editor">
                              <textarea value={editingText} onChange={stryMutAct_9fa48("19184") ? () => undefined : (stryCov_9fa48("19184"), e => setEditingText(e.target.value))} className="session-data-tester__message-textarea" rows={5} autoFocus />
                              <div className="session-data-tester__message-actions">
                                <button onClick={saveEditedMessage} className="session-data-tester__btn session-data-tester__btn--save-small">
                                  <FaCheck />
                                  Save
                                </button>
                                <button onClick={cancelEditing} className="session-data-tester__btn session-data-tester__btn--cancel">
                                  <FaTimes />
                                  Cancel
                                </button>
                                {stryMutAct_9fa48("19187") ? message.id.startsWith('question-') || <button onClick={() => {
                          const questionIndex = parseInt(message.id.split('-')[1]);
                          deleteQuestion(questionIndex);
                          cancelEditing();
                        }} className="session-data-tester__btn session-data-tester__btn--delete">
                                    <FaTrash />
                                    Delete
                                  </button> : stryMutAct_9fa48("19186") ? false : stryMutAct_9fa48("19185") ? true : (stryCov_9fa48("19185", "19186", "19187"), (stryMutAct_9fa48("19188") ? message.id.endsWith('question-') : (stryCov_9fa48("19188"), message.id.startsWith(stryMutAct_9fa48("19189") ? "" : (stryCov_9fa48("19189"), 'question-')))) && <button onClick={() => {
                          if (stryMutAct_9fa48("19190")) {
                            {}
                          } else {
                            stryCov_9fa48("19190");
                            const questionIndex = parseInt(message.id.split(stryMutAct_9fa48("19191") ? "" : (stryCov_9fa48("19191"), '-'))[1]);
                            deleteQuestion(questionIndex);
                            cancelEditing();
                          }
                        }} className="session-data-tester__btn session-data-tester__btn--delete">
                                    <FaTrash />
                                    Delete
                                  </button>)}
                              </div>
                            </div> : <div className="session-data-tester__message-content">
                              <div className="session-data-tester__message-text">
                                <ReactMarkdown>{message.content}</ReactMarkdown>
                              </div>
                              <button onClick={stryMutAct_9fa48("19192") ? () => undefined : (stryCov_9fa48("19192"), () => startEditingMessage(message.id, message.content))} className="session-data-tester__message-edit-btn" title="Click to edit">
                                <FaEdit />
                              </button>
                            </div>}
                        </div>))}
                    </div>
                  </div>
                </div>)}
            </> : <div className="session-data-tester__empty-state">
              <FaFileAlt size={64} />
              <h3>No Session Data Loaded</h3>
              <p>Upload a JSON file or paste session data in the input panel to see the preview</p>
            </div>}
        </div>
      </div>

      {/* Fullscreen Modal */}
      {stryMutAct_9fa48("19195") ? isModalOpen && sessionData || <div className="session-data-tester__modal-overlay" onClick={e => e.target === e.currentTarget && setIsModalOpen(false)}>
          <div className="session-data-tester__modal">
            <div className="session-data-tester__modal-header">
              <div>
                <h1>Day {currentDay?.day_number}: {currentDay?.daily_goal}</h1>
                {currentTask && <p className="session-data-tester__modal-current-task">
                    Editing Task: {currentTask.title}
                  </p>}
                {hasUnsavedChanges && <p className="session-data-tester__modal-unsaved-notice">
                    You have unsaved changes - click "Export JSON" to save
                  </p>}
              </div>
              <div className="session-data-tester__modal-header-actions">
                <button onClick={exportEditedJSON} className="session-data-tester__btn session-data-tester__btn--save" title="Export edited JSON">
                  <FaDownload />
                  Export JSON
                </button>
                <button onClick={() => setIsModalOpen(false)} className="session-data-tester__modal-close">
                  <FaTimes />
                </button>
              </div>
            </div>
            
            <div className="session-data-tester__modal-content">
              {/* Left Sidebar - Day Navigation */}
              <div className="session-data-tester__modal-sidebar">
                {allDays.length > 1 && <>
                    <h3>Days ({allDays.length})</h3>
                    <div className="session-data-tester__modal-day-list">
                      {allDays.map((day, index) => <button key={index} onClick={() => handleDayChange(index)} className={`session-data-tester__modal-day-item ${index === currentDayIndex ? 'active' : ''}`}>
                          <div className="session-data-tester__modal-day-number">
                            Day {day.day_number}
                          </div>
                          <div className="session-data-tester__modal-day-date">
                            {day.date}
                          </div>
                          <div className="session-data-tester__modal-day-goal">
                            {day.daily_goal}
                          </div>
                        </button>)}
                    </div>
                  </>}

                {/* Task Navigation */}
                {tasks.length > 0 && <>
                    <h3>Tasks ({tasks.length})</h3>
                    <div className="session-data-tester__modal-task-list">
                      {tasks.map((task, index) => <button key={task.id} onClick={() => handleTaskChange(index)} className={`session-data-tester__modal-task-item ${index === currentTaskIndex ? 'active' : ''}`}>
                          {getTaskIcon(task.type)}
                          <div className="session-data-tester__modal-task-info">
                            <div className="session-data-tester__modal-task-title">
                              {task.title}
                            </div>
                            <div className="session-data-tester__modal-task-time">
                              {formatTime(task.startTime)} - {formatTime(task.endTime)}
                            </div>
                          </div>
                          <button onClick={e => {
                      e.stopPropagation();
                      showDeleteTaskConfirmation(index);
                    }} className="session-data-tester__modal-task-delete-btn" title="Delete this task">
                            <FaTrash />
                          </button>
                        </button>)}
                    </div>
                  </>}
              </div>

              {/* Right Content - Current Day/Task Content */}
              <div className="session-data-tester__modal-main">
                {/* Day Meta Info */}
                <div className="session-data-tester__modal-day-header">
                  <div className="session-data-tester__modal-day-meta">
                    {currentDay?.date} • {currentDay?.cohort}
                  </div>
                  
                  {currentDay?.learning_objectives && <div className="session-data-tester__modal-objectives">
                      <h4>Learning Objectives</h4>
                      <ul>
                        {currentDay.learning_objectives.map((objective, index) => <li key={index}>{objective}</li>)}
                      </ul>
                    </div>}
                </div>

                {/* Task Navigation Bar */}
                {tasks.length > 0 && <div className="session-data-tester__modal-task-nav">
                    <div className="session-data-tester__modal-task-nav-header">
                      {/* Task navigation header - button removed and moved to below conclusion */}
                    </div>
                    <div className="session-data-tester__modal-task-nav-list">
                      {tasks.map((task, index) => <button key={task.id} onClick={() => handleTaskChange(index)} className={`session-data-tester__modal-task-nav-item ${index === currentTaskIndex ? 'active' : ''}`}>
                          {getTaskIcon(task.type)}
                          <div className="session-data-tester__modal-task-nav-info">
                            <div className="session-data-tester__modal-task-nav-title">
                              {task.title}
                            </div>
                            <div className="session-data-tester__modal-task-nav-time">
                              {formatTime(task.startTime)} - {formatTime(task.endTime)}
                            </div>
                          </div>
                        </button>)}
                    </div>
                  </div>}

                {/* Current Task Preview */}
                {currentTask && <div className="session-data-tester__modal-task-preview">
                    <div className="session-data-tester__modal-task-header">
                      <div className="session-data-tester__modal-task-title-section">
                        <div className="session-data-tester__modal-task-content">
                          {/* Editable Title */}
                          {editingTaskField === 'title' ? <div className="session-data-tester__modal-task-field-editor">
                              <input type="text" value={editingTaskValue} onChange={e => setEditingTaskValue(e.target.value)} className="session-data-tester__modal-task-input" autoFocus />
                              <div className="session-data-tester__modal-task-field-actions">
                                <button onClick={saveEditedTaskField} className="session-data-tester__btn session-data-tester__btn--save-small">
                                  <FaCheck />
                                </button>
                                <button onClick={cancelEditingTaskField} className="session-data-tester__btn session-data-tester__btn--cancel">
                                  <FaTimes />
                                </button>
                              </div>
                            </div> : <div className="session-data-tester__modal-task-field-display">
                              <h3 onClick={() => startEditingTaskField('title', currentTask.title)}>
                                {currentTask.title}
                              </h3>
                              <button onClick={() => startEditingTaskField('title', currentTask.title)} className="session-data-tester__modal-task-field-edit-btn" title="Click to edit title">
                                <FaEdit />
                              </button>
                            </div>}
                          
                          {/* Editable Time - moved under title */}
                          {currentTask.startTime && <div className="session-data-tester__modal-task-time-section">
                              {editingTaskField === 'startTime' ? <div className="session-data-tester__modal-task-time-editor">
                                  <input type="text" value={editingTaskValue} onChange={e => setEditingTaskValue(e.target.value)} className="session-data-tester__modal-task-time-input" placeholder="2:30 PM or 14:30" autoFocus />
                                  <div className="session-data-tester__modal-task-field-actions">
                                    <button onClick={saveEditedTaskField} className="session-data-tester__btn session-data-tester__btn--save-small">
                                      <FaCheck />
                                    </button>
                                    <button onClick={cancelEditingTaskField} className="session-data-tester__btn session-data-tester__btn--cancel">
                                      <FaTimes />
                                    </button>
                                  </div>
                                </div> : <div className="session-data-tester__modal-task-time-display">
                                  <span onClick={() => startEditingTaskField('startTime', currentTask.startTime)} className="session-data-tester__modal-task-time-value">
                                    {formatTime(currentTask.startTime)}
                                  </span>
                                  <button onClick={() => startEditingTaskField('startTime', currentTask.startTime)} className="session-data-tester__modal-task-field-edit-btn" title="Click to edit start time">
                                    <FaEdit />
                                  </button>
                                </div>}
                              
                              <span className="session-data-tester__modal-task-time-separator">-</span>
                              
                              {editingTaskField === 'endTime' ? <div className="session-data-tester__modal-task-time-editor">
                                  <input type="text" value={editingTaskValue} onChange={e => setEditingTaskValue(e.target.value)} className="session-data-tester__modal-task-time-input" placeholder="2:30 PM or 14:30" autoFocus />
                                  <div className="session-data-tester__modal-task-field-actions">
                                    <button onClick={saveEditedTaskField} className="session-data-tester__btn session-data-tester__btn--save-small">
                                      <FaCheck />
                                    </button>
                                    <button onClick={cancelEditingTaskField} className="session-data-tester__btn session-data-tester__btn--cancel">
                                      <FaTimes />
                                    </button>
                                  </div>
                                </div> : <div className="session-data-tester__modal-task-time-display">
                                  <span onClick={() => startEditingTaskField('endTime', currentTask.endTime)} className="session-data-tester__modal-task-time-value">
                                    {formatTime(currentTask.endTime)}
                                  </span>
                                  <button onClick={() => startEditingTaskField('endTime', currentTask.endTime)} className="session-data-tester__modal-task-field-edit-btn" title="Click to edit end time">
                                    <FaEdit />
                                  </button>
                                </div>}
                            </div>}
                          
                          {/* Editable Description */}
                          {editingTaskField === 'description' ? <div className="session-data-tester__modal-task-field-editor">
                              <input type="text" value={editingTaskValue} onChange={e => setEditingTaskValue(e.target.value)} className="session-data-tester__modal-task-input" autoFocus />
                              <div className="session-data-tester__modal-task-field-actions">
                                <button onClick={saveEditedTaskField} className="session-data-tester__btn session-data-tester__btn--save-small">
                                  <FaCheck />
                                </button>
                                <button onClick={cancelEditingTaskField} className="session-data-tester__btn session-data-tester__btn--cancel">
                                  <FaTimes />
                                </button>
                              </div>
                            </div> : <div className="session-data-tester__modal-task-field-display">
                              <p onClick={() => startEditingTaskField('description', currentTask.description)}>
                                {currentTask.description}
                              </p>
                              <button onClick={() => startEditingTaskField('description', currentTask.description)} className="session-data-tester__modal-task-field-edit-btn" title="Click to edit description">
                                <FaEdit />
                              </button>
                            </div>}
                        </div>
                      </div>
                      
                      <div className="session-data-tester__modal-task-meta">
                        {/* Analysis Checkboxes - centered */}
                        <div className="session-data-tester__modal-task-analysis">
                          <label className="session-data-tester__checkbox-label">
                            <input type="checkbox" checked={currentTask.should_analyze || false} onChange={e => updateTaskCheckbox('should_analyze', e.target.checked)} className="session-data-tester__checkbox" />
                            <span className="session-data-tester__checkbox-text">Should Analyze</span>
                          </label>
                          
                          <label className="session-data-tester__checkbox-label">
                            <input type="checkbox" checked={currentTask.analyze_deliverable || false} onChange={e => updateTaskCheckbox('analyze_deliverable', e.target.checked)} className="session-data-tester__checkbox" />
                            <span className="session-data-tester__checkbox-text">Analyze Deliverable</span>
                          </label>
                        </div>
                        
                        {/* Add Resource & Add Question Buttons - right side */}
                        <div className="session-data-tester__modal-task-actions">
                          <button onClick={addNewResource} className="session-data-tester__btn session-data-tester__btn--add-resource" title="Add new resource to current task">
                            <FaPlus />
                            Add Resource
                          </button>
                          <button onClick={addNewQuestion} className="session-data-tester__btn session-data-tester__btn--add-question" title="Add new question to current task">
                            <FaPlus />
                            Add Question
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Resources */}
                    {currentTask.linked_resources && currentTask.linked_resources.length > 0 && <div className="session-data-tester__modal-resources">
                        <h4>Resources</h4>
                        <div className="session-data-tester__modal-resource-list">
                          {currentTask.linked_resources.map((resource, index) => <div key={index} className="session-data-tester__modal-resource">
                              {getResourceIcon(resource.type)}
                              <div className="session-data-tester__modal-resource-content">
                                <a href={resource.url} target="_blank" rel="noopener noreferrer" className="session-data-tester__modal-resource-title">
                                  {resource.title}
                                  <FaExternalLinkAlt />
                                </a>
                                {resource.description && <p className="session-data-tester__modal-resource-description">
                                    {resource.description}
                                  </p>}
                              </div>
                              <div className="session-data-tester__modal-resource-actions">
                                <button onClick={() => startEditingResource(index, 'title', resource.title)} className="session-data-tester__btn session-data-tester__btn--edit-small" title="Edit title">
                                  <FaEdit />
                                </button>
                                <button onClick={() => startEditingResource(index, 'url', resource.url)} className="session-data-tester__btn session-data-tester__btn--edit-small" title="Edit URL">
                                  <FaLink />
                                </button>
                                <button onClick={() => startEditingResource(index, 'description', resource.description)} className="session-data-tester__btn session-data-tester__btn--edit-small" title="Edit description">
                                  <FaFileAlt />
                                </button>
                                <button onClick={() => deleteResource(index)} className="session-data-tester__btn session-data-tester__btn--delete-small" title="Delete resource">
                                  <FaTrash />
                                </button>
                              </div>
                            </div>)}
                        </div>
                      </div>}

                    {/* Messages Preview */}
                    <div className="session-data-tester__modal-messages">
                      <h4>Conversation Flow (Click to Edit)</h4>
                      <div className="session-data-tester__modal-message-list">
                        {messages.map((message, messageIndex) => <div key={message.id} className={`session-data-tester__modal-message session-data-tester__modal-message--${message.role}`}>
                            {message.id === 'intro' && <div className="session-data-tester__modal-message-label">Introduction</div>}
                            {message.id === 'conclusion' && <div className="session-data-tester__modal-message-label">Conclusion</div>}
                            {editingMessageId === message.id ? <div className="session-data-tester__modal-message-editor">
                                <textarea value={editingText} onChange={e => setEditingText(e.target.value)} className="session-data-tester__modal-message-textarea" rows={5} autoFocus />
                                <div className="session-data-tester__modal-message-actions">
                                  <button onClick={saveEditedMessage} className="session-data-tester__btn session-data-tester__btn--save-small">
                                    <FaCheck />
                                    Save
                                  </button>
                                  <button onClick={cancelEditing} className="session-data-tester__btn session-data-tester__btn--cancel">
                                    <FaTimes />
                                    Cancel
                                  </button>
                                  {message.id.startsWith('question-') && <button onClick={() => {
                            const questionIndex = parseInt(message.id.split('-')[1]);
                            deleteQuestion(questionIndex);
                            cancelEditing();
                          }} className="session-data-tester__btn session-data-tester__btn--delete">
                                      <FaTrash />
                                      Delete
                                    </button>}
                                </div>
                              </div> : <div className="session-data-tester__modal-message-content">
                                <div className="session-data-tester__modal-message-text">
                                  <ReactMarkdown>{message.content}</ReactMarkdown>
                                </div>
                                <button onClick={() => startEditingMessage(message.id, message.content)} className="session-data-tester__modal-message-edit-btn" title="Click to edit">
                                  <FaEdit />
                                </button>
                              </div>}
                          </div>)}
                      </div>
                    </div>
                  </div>}
              </div>
            </div>
          </div>
        </div> : stryMutAct_9fa48("19194") ? false : stryMutAct_9fa48("19193") ? true : (stryCov_9fa48("19193", "19194", "19195"), (stryMutAct_9fa48("19197") ? isModalOpen || sessionData : stryMutAct_9fa48("19196") ? true : (stryCov_9fa48("19196", "19197"), isModalOpen && sessionData)) && <div className="session-data-tester__modal-overlay" onClick={stryMutAct_9fa48("19198") ? () => undefined : (stryCov_9fa48("19198"), e => stryMutAct_9fa48("19201") ? e.target === e.currentTarget || setIsModalOpen(false) : stryMutAct_9fa48("19200") ? false : stryMutAct_9fa48("19199") ? true : (stryCov_9fa48("19199", "19200", "19201"), (stryMutAct_9fa48("19203") ? e.target !== e.currentTarget : stryMutAct_9fa48("19202") ? true : (stryCov_9fa48("19202", "19203"), e.target === e.currentTarget)) && setIsModalOpen(stryMutAct_9fa48("19204") ? true : (stryCov_9fa48("19204"), false))))}>
          <div className="session-data-tester__modal">
            <div className="session-data-tester__modal-header">
              <div>
                <h1>Day {stryMutAct_9fa48("19205") ? currentDay.day_number : (stryCov_9fa48("19205"), currentDay?.day_number)}: {stryMutAct_9fa48("19206") ? currentDay.daily_goal : (stryCov_9fa48("19206"), currentDay?.daily_goal)}</h1>
                {stryMutAct_9fa48("19209") ? currentTask || <p className="session-data-tester__modal-current-task">
                    Editing Task: {currentTask.title}
                  </p> : stryMutAct_9fa48("19208") ? false : stryMutAct_9fa48("19207") ? true : (stryCov_9fa48("19207", "19208", "19209"), currentTask && <p className="session-data-tester__modal-current-task">
                    Editing Task: {currentTask.title}
                  </p>)}
                {stryMutAct_9fa48("19212") ? hasUnsavedChanges || <p className="session-data-tester__modal-unsaved-notice">
                    You have unsaved changes - click "Export JSON" to save
                  </p> : stryMutAct_9fa48("19211") ? false : stryMutAct_9fa48("19210") ? true : (stryCov_9fa48("19210", "19211", "19212"), hasUnsavedChanges && <p className="session-data-tester__modal-unsaved-notice">
                    You have unsaved changes - click "Export JSON" to save
                  </p>)}
              </div>
              <div className="session-data-tester__modal-header-actions">
                <button onClick={exportEditedJSON} className="session-data-tester__btn session-data-tester__btn--save" title="Export edited JSON">
                  <FaDownload />
                  Export JSON
                </button>
                <button onClick={stryMutAct_9fa48("19213") ? () => undefined : (stryCov_9fa48("19213"), () => setIsModalOpen(stryMutAct_9fa48("19214") ? true : (stryCov_9fa48("19214"), false)))} className="session-data-tester__modal-close">
                  <FaTimes />
                </button>
              </div>
            </div>
            
            <div className="session-data-tester__modal-content">
              {/* Left Sidebar - Day Navigation */}
              <div className="session-data-tester__modal-sidebar">
                {stryMutAct_9fa48("19217") ? allDays.length > 1 || <>
                    <h3>Days ({allDays.length})</h3>
                    <div className="session-data-tester__modal-day-list">
                      {allDays.map((day, index) => <button key={index} onClick={() => handleDayChange(index)} className={`session-data-tester__modal-day-item ${index === currentDayIndex ? 'active' : ''}`}>
                          <div className="session-data-tester__modal-day-number">
                            Day {day.day_number}
                          </div>
                          <div className="session-data-tester__modal-day-date">
                            {day.date}
                          </div>
                          <div className="session-data-tester__modal-day-goal">
                            {day.daily_goal}
                          </div>
                        </button>)}
                    </div>
                  </> : stryMutAct_9fa48("19216") ? false : stryMutAct_9fa48("19215") ? true : (stryCov_9fa48("19215", "19216", "19217"), (stryMutAct_9fa48("19220") ? allDays.length <= 1 : stryMutAct_9fa48("19219") ? allDays.length >= 1 : stryMutAct_9fa48("19218") ? true : (stryCov_9fa48("19218", "19219", "19220"), allDays.length > 1)) && <>
                    <h3>Days ({allDays.length})</h3>
                    <div className="session-data-tester__modal-day-list">
                      {allDays.map(stryMutAct_9fa48("19221") ? () => undefined : (stryCov_9fa48("19221"), (day, index) => <button key={index} onClick={stryMutAct_9fa48("19222") ? () => undefined : (stryCov_9fa48("19222"), () => handleDayChange(index))} className={stryMutAct_9fa48("19223") ? `` : (stryCov_9fa48("19223"), `session-data-tester__modal-day-item ${(stryMutAct_9fa48("19226") ? index !== currentDayIndex : stryMutAct_9fa48("19225") ? false : stryMutAct_9fa48("19224") ? true : (stryCov_9fa48("19224", "19225", "19226"), index === currentDayIndex)) ? stryMutAct_9fa48("19227") ? "" : (stryCov_9fa48("19227"), 'active') : stryMutAct_9fa48("19228") ? "Stryker was here!" : (stryCov_9fa48("19228"), '')}`)}>
                          <div className="session-data-tester__modal-day-number">
                            Day {day.day_number}
                          </div>
                          <div className="session-data-tester__modal-day-date">
                            {day.date}
                          </div>
                          <div className="session-data-tester__modal-day-goal">
                            {day.daily_goal}
                          </div>
                        </button>))}
                    </div>
                  </>)}

                {/* Task Navigation */}
                {stryMutAct_9fa48("19231") ? tasks.length > 0 || <>
                    <h3>Tasks ({tasks.length})</h3>
                    <div className="session-data-tester__modal-task-list">
                      {tasks.map((task, index) => <button key={task.id} onClick={() => handleTaskChange(index)} className={`session-data-tester__modal-task-item ${index === currentTaskIndex ? 'active' : ''}`}>
                          {getTaskIcon(task.type)}
                          <div className="session-data-tester__modal-task-info">
                            <div className="session-data-tester__modal-task-title">
                              {task.title}
                            </div>
                            <div className="session-data-tester__modal-task-time">
                              {formatTime(task.startTime)} - {formatTime(task.endTime)}
                            </div>
                          </div>
                          <button onClick={e => {
                      e.stopPropagation();
                      showDeleteTaskConfirmation(index);
                    }} className="session-data-tester__modal-task-delete-btn" title="Delete this task">
                            <FaTrash />
                          </button>
                        </button>)}
                    </div>
                  </> : stryMutAct_9fa48("19230") ? false : stryMutAct_9fa48("19229") ? true : (stryCov_9fa48("19229", "19230", "19231"), (stryMutAct_9fa48("19234") ? tasks.length <= 0 : stryMutAct_9fa48("19233") ? tasks.length >= 0 : stryMutAct_9fa48("19232") ? true : (stryCov_9fa48("19232", "19233", "19234"), tasks.length > 0)) && <>
                    <h3>Tasks ({tasks.length})</h3>
                    <div className="session-data-tester__modal-task-list">
                      {tasks.map(stryMutAct_9fa48("19235") ? () => undefined : (stryCov_9fa48("19235"), (task, index) => <button key={task.id} onClick={stryMutAct_9fa48("19236") ? () => undefined : (stryCov_9fa48("19236"), () => handleTaskChange(index))} className={stryMutAct_9fa48("19237") ? `` : (stryCov_9fa48("19237"), `session-data-tester__modal-task-item ${(stryMutAct_9fa48("19240") ? index !== currentTaskIndex : stryMutAct_9fa48("19239") ? false : stryMutAct_9fa48("19238") ? true : (stryCov_9fa48("19238", "19239", "19240"), index === currentTaskIndex)) ? stryMutAct_9fa48("19241") ? "" : (stryCov_9fa48("19241"), 'active') : stryMutAct_9fa48("19242") ? "Stryker was here!" : (stryCov_9fa48("19242"), '')}`)}>
                          {getTaskIcon(task.type)}
                          <div className="session-data-tester__modal-task-info">
                            <div className="session-data-tester__modal-task-title">
                              {task.title}
                            </div>
                            <div className="session-data-tester__modal-task-time">
                              {formatTime(task.startTime)} - {formatTime(task.endTime)}
                            </div>
                          </div>
                          <button onClick={e => {
                      if (stryMutAct_9fa48("19243")) {
                        {}
                      } else {
                        stryCov_9fa48("19243");
                        e.stopPropagation();
                        showDeleteTaskConfirmation(index);
                      }
                    }} className="session-data-tester__modal-task-delete-btn" title="Delete this task">
                            <FaTrash />
                          </button>
                        </button>))}
                    </div>
                  </>)}
              </div>

              {/* Right Content - Current Day/Task Content */}
              <div className="session-data-tester__modal-main">
                {/* Day Meta Info */}
                <div className="session-data-tester__modal-day-header">
                  <div className="session-data-tester__modal-day-meta">
                    {stryMutAct_9fa48("19244") ? currentDay.date : (stryCov_9fa48("19244"), currentDay?.date)} • {stryMutAct_9fa48("19245") ? currentDay.cohort : (stryCov_9fa48("19245"), currentDay?.cohort)}
                  </div>
                  
                  {stryMutAct_9fa48("19248") ? currentDay?.learning_objectives || <div className="session-data-tester__modal-objectives">
                      <h4>Learning Objectives</h4>
                      <ul>
                        {currentDay.learning_objectives.map((objective, index) => <li key={index}>{objective}</li>)}
                      </ul>
                    </div> : stryMutAct_9fa48("19247") ? false : stryMutAct_9fa48("19246") ? true : (stryCov_9fa48("19246", "19247", "19248"), (stryMutAct_9fa48("19249") ? currentDay.learning_objectives : (stryCov_9fa48("19249"), currentDay?.learning_objectives)) && <div className="session-data-tester__modal-objectives">
                      <h4>Learning Objectives</h4>
                      <ul>
                        {currentDay.learning_objectives.map(stryMutAct_9fa48("19250") ? () => undefined : (stryCov_9fa48("19250"), (objective, index) => <li key={index}>{objective}</li>))}
                      </ul>
                    </div>)}
                </div>

                {/* Task Navigation Bar */}
                {stryMutAct_9fa48("19253") ? tasks.length > 0 || <div className="session-data-tester__modal-task-nav">
                    <div className="session-data-tester__modal-task-nav-header">
                      {/* Task navigation header - button removed and moved to below conclusion */}
                    </div>
                    <div className="session-data-tester__modal-task-nav-list">
                      {tasks.map((task, index) => <button key={task.id} onClick={() => handleTaskChange(index)} className={`session-data-tester__modal-task-nav-item ${index === currentTaskIndex ? 'active' : ''}`}>
                          {getTaskIcon(task.type)}
                          <div className="session-data-tester__modal-task-nav-info">
                            <div className="session-data-tester__modal-task-nav-title">
                              {task.title}
                            </div>
                            <div className="session-data-tester__modal-task-nav-time">
                              {formatTime(task.startTime)} - {formatTime(task.endTime)}
                            </div>
                          </div>
                        </button>)}
                    </div>
                  </div> : stryMutAct_9fa48("19252") ? false : stryMutAct_9fa48("19251") ? true : (stryCov_9fa48("19251", "19252", "19253"), (stryMutAct_9fa48("19256") ? tasks.length <= 0 : stryMutAct_9fa48("19255") ? tasks.length >= 0 : stryMutAct_9fa48("19254") ? true : (stryCov_9fa48("19254", "19255", "19256"), tasks.length > 0)) && <div className="session-data-tester__modal-task-nav">
                    <div className="session-data-tester__modal-task-nav-header">
                      {/* Task navigation header - button removed and moved to below conclusion */}
                    </div>
                    <div className="session-data-tester__modal-task-nav-list">
                      {tasks.map(stryMutAct_9fa48("19257") ? () => undefined : (stryCov_9fa48("19257"), (task, index) => <button key={task.id} onClick={stryMutAct_9fa48("19258") ? () => undefined : (stryCov_9fa48("19258"), () => handleTaskChange(index))} className={stryMutAct_9fa48("19259") ? `` : (stryCov_9fa48("19259"), `session-data-tester__modal-task-nav-item ${(stryMutAct_9fa48("19262") ? index !== currentTaskIndex : stryMutAct_9fa48("19261") ? false : stryMutAct_9fa48("19260") ? true : (stryCov_9fa48("19260", "19261", "19262"), index === currentTaskIndex)) ? stryMutAct_9fa48("19263") ? "" : (stryCov_9fa48("19263"), 'active') : stryMutAct_9fa48("19264") ? "Stryker was here!" : (stryCov_9fa48("19264"), '')}`)}>
                          {getTaskIcon(task.type)}
                          <div className="session-data-tester__modal-task-nav-info">
                            <div className="session-data-tester__modal-task-nav-title">
                              {task.title}
                            </div>
                            <div className="session-data-tester__modal-task-nav-time">
                              {formatTime(task.startTime)} - {formatTime(task.endTime)}
                            </div>
                          </div>
                        </button>))}
                    </div>
                  </div>)}

                {/* Current Task Preview */}
                {stryMutAct_9fa48("19267") ? currentTask || <div className="session-data-tester__modal-task-preview">
                    <div className="session-data-tester__modal-task-header">
                      <div className="session-data-tester__modal-task-title-section">
                        <div className="session-data-tester__modal-task-content">
                          {/* Editable Title */}
                          {editingTaskField === 'title' ? <div className="session-data-tester__modal-task-field-editor">
                              <input type="text" value={editingTaskValue} onChange={e => setEditingTaskValue(e.target.value)} className="session-data-tester__modal-task-input" autoFocus />
                              <div className="session-data-tester__modal-task-field-actions">
                                <button onClick={saveEditedTaskField} className="session-data-tester__btn session-data-tester__btn--save-small">
                                  <FaCheck />
                                </button>
                                <button onClick={cancelEditingTaskField} className="session-data-tester__btn session-data-tester__btn--cancel">
                                  <FaTimes />
                                </button>
                              </div>
                            </div> : <div className="session-data-tester__modal-task-field-display">
                              <h3 onClick={() => startEditingTaskField('title', currentTask.title)}>
                                {currentTask.title}
                              </h3>
                              <button onClick={() => startEditingTaskField('title', currentTask.title)} className="session-data-tester__modal-task-field-edit-btn" title="Click to edit title">
                                <FaEdit />
                              </button>
                            </div>}
                          
                          {/* Editable Time - moved under title */}
                          {currentTask.startTime && <div className="session-data-tester__modal-task-time-section">
                              {editingTaskField === 'startTime' ? <div className="session-data-tester__modal-task-time-editor">
                                  <input type="text" value={editingTaskValue} onChange={e => setEditingTaskValue(e.target.value)} className="session-data-tester__modal-task-time-input" placeholder="2:30 PM or 14:30" autoFocus />
                                  <div className="session-data-tester__modal-task-field-actions">
                                    <button onClick={saveEditedTaskField} className="session-data-tester__btn session-data-tester__btn--save-small">
                                      <FaCheck />
                                    </button>
                                    <button onClick={cancelEditingTaskField} className="session-data-tester__btn session-data-tester__btn--cancel">
                                      <FaTimes />
                                    </button>
                                  </div>
                                </div> : <div className="session-data-tester__modal-task-time-display">
                                  <span onClick={() => startEditingTaskField('startTime', currentTask.startTime)} className="session-data-tester__modal-task-time-value">
                                    {formatTime(currentTask.startTime)}
                                  </span>
                                  <button onClick={() => startEditingTaskField('startTime', currentTask.startTime)} className="session-data-tester__modal-task-field-edit-btn" title="Click to edit start time">
                                    <FaEdit />
                                  </button>
                                </div>}
                              
                              <span className="session-data-tester__modal-task-time-separator">-</span>
                              
                              {editingTaskField === 'endTime' ? <div className="session-data-tester__modal-task-time-editor">
                                  <input type="text" value={editingTaskValue} onChange={e => setEditingTaskValue(e.target.value)} className="session-data-tester__modal-task-time-input" placeholder="2:30 PM or 14:30" autoFocus />
                                  <div className="session-data-tester__modal-task-field-actions">
                                    <button onClick={saveEditedTaskField} className="session-data-tester__btn session-data-tester__btn--save-small">
                                      <FaCheck />
                                    </button>
                                    <button onClick={cancelEditingTaskField} className="session-data-tester__btn session-data-tester__btn--cancel">
                                      <FaTimes />
                                    </button>
                                  </div>
                                </div> : <div className="session-data-tester__modal-task-time-display">
                                  <span onClick={() => startEditingTaskField('endTime', currentTask.endTime)} className="session-data-tester__modal-task-time-value">
                                    {formatTime(currentTask.endTime)}
                                  </span>
                                  <button onClick={() => startEditingTaskField('endTime', currentTask.endTime)} className="session-data-tester__modal-task-field-edit-btn" title="Click to edit end time">
                                    <FaEdit />
                                  </button>
                                </div>}
                            </div>}
                          
                          {/* Editable Description */}
                          {editingTaskField === 'description' ? <div className="session-data-tester__modal-task-field-editor">
                              <input type="text" value={editingTaskValue} onChange={e => setEditingTaskValue(e.target.value)} className="session-data-tester__modal-task-input" autoFocus />
                              <div className="session-data-tester__modal-task-field-actions">
                                <button onClick={saveEditedTaskField} className="session-data-tester__btn session-data-tester__btn--save-small">
                                  <FaCheck />
                                </button>
                                <button onClick={cancelEditingTaskField} className="session-data-tester__btn session-data-tester__btn--cancel">
                                  <FaTimes />
                                </button>
                              </div>
                            </div> : <div className="session-data-tester__modal-task-field-display">
                              <p onClick={() => startEditingTaskField('description', currentTask.description)}>
                                {currentTask.description}
                              </p>
                              <button onClick={() => startEditingTaskField('description', currentTask.description)} className="session-data-tester__modal-task-field-edit-btn" title="Click to edit description">
                                <FaEdit />
                              </button>
                            </div>}
                        </div>
                      </div>
                      
                      <div className="session-data-tester__modal-task-meta">
                        {/* Analysis Checkboxes - centered */}
                        <div className="session-data-tester__modal-task-analysis">
                          <label className="session-data-tester__checkbox-label">
                            <input type="checkbox" checked={currentTask.should_analyze || false} onChange={e => updateTaskCheckbox('should_analyze', e.target.checked)} className="session-data-tester__checkbox" />
                            <span className="session-data-tester__checkbox-text">Should Analyze</span>
                          </label>
                          
                          <label className="session-data-tester__checkbox-label">
                            <input type="checkbox" checked={currentTask.analyze_deliverable || false} onChange={e => updateTaskCheckbox('analyze_deliverable', e.target.checked)} className="session-data-tester__checkbox" />
                            <span className="session-data-tester__checkbox-text">Analyze Deliverable</span>
                          </label>
                        </div>
                        
                        {/* Add Resource & Add Question Buttons - right side */}
                        <div className="session-data-tester__modal-task-actions">
                          <button onClick={addNewResource} className="session-data-tester__btn session-data-tester__btn--add-resource" title="Add new resource to current task">
                            <FaPlus />
                            Add Resource
                          </button>
                          <button onClick={addNewQuestion} className="session-data-tester__btn session-data-tester__btn--add-question" title="Add new question to current task">
                            <FaPlus />
                            Add Question
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Resources */}
                    {currentTask.linked_resources && currentTask.linked_resources.length > 0 && <div className="session-data-tester__modal-resources">
                        <h4>Resources</h4>
                        <div className="session-data-tester__modal-resource-list">
                          {currentTask.linked_resources.map((resource, index) => <div key={index} className="session-data-tester__modal-resource">
                              {getResourceIcon(resource.type)}
                              <div className="session-data-tester__modal-resource-content">
                                <a href={resource.url} target="_blank" rel="noopener noreferrer" className="session-data-tester__modal-resource-title">
                                  {resource.title}
                                  <FaExternalLinkAlt />
                                </a>
                                {resource.description && <p className="session-data-tester__modal-resource-description">
                                    {resource.description}
                                  </p>}
                              </div>
                              <div className="session-data-tester__modal-resource-actions">
                                <button onClick={() => startEditingResource(index, 'title', resource.title)} className="session-data-tester__btn session-data-tester__btn--edit-small" title="Edit title">
                                  <FaEdit />
                                </button>
                                <button onClick={() => startEditingResource(index, 'url', resource.url)} className="session-data-tester__btn session-data-tester__btn--edit-small" title="Edit URL">
                                  <FaLink />
                                </button>
                                <button onClick={() => startEditingResource(index, 'description', resource.description)} className="session-data-tester__btn session-data-tester__btn--edit-small" title="Edit description">
                                  <FaFileAlt />
                                </button>
                                <button onClick={() => deleteResource(index)} className="session-data-tester__btn session-data-tester__btn--delete-small" title="Delete resource">
                                  <FaTrash />
                                </button>
                              </div>
                            </div>)}
                        </div>
                      </div>}

                    {/* Messages Preview */}
                    <div className="session-data-tester__modal-messages">
                      <h4>Conversation Flow (Click to Edit)</h4>
                      <div className="session-data-tester__modal-message-list">
                        {messages.map((message, messageIndex) => <div key={message.id} className={`session-data-tester__modal-message session-data-tester__modal-message--${message.role}`}>
                            {message.id === 'intro' && <div className="session-data-tester__modal-message-label">Introduction</div>}
                            {message.id === 'conclusion' && <div className="session-data-tester__modal-message-label">Conclusion</div>}
                            {editingMessageId === message.id ? <div className="session-data-tester__modal-message-editor">
                                <textarea value={editingText} onChange={e => setEditingText(e.target.value)} className="session-data-tester__modal-message-textarea" rows={5} autoFocus />
                                <div className="session-data-tester__modal-message-actions">
                                  <button onClick={saveEditedMessage} className="session-data-tester__btn session-data-tester__btn--save-small">
                                    <FaCheck />
                                    Save
                                  </button>
                                  <button onClick={cancelEditing} className="session-data-tester__btn session-data-tester__btn--cancel">
                                    <FaTimes />
                                    Cancel
                                  </button>
                                  {message.id.startsWith('question-') && <button onClick={() => {
                            const questionIndex = parseInt(message.id.split('-')[1]);
                            deleteQuestion(questionIndex);
                            cancelEditing();
                          }} className="session-data-tester__btn session-data-tester__btn--delete">
                                      <FaTrash />
                                      Delete
                                    </button>}
                                </div>
                              </div> : <div className="session-data-tester__modal-message-content">
                                <div className="session-data-tester__modal-message-text">
                                  <ReactMarkdown>{message.content}</ReactMarkdown>
                                </div>
                                <button onClick={() => startEditingMessage(message.id, message.content)} className="session-data-tester__modal-message-edit-btn" title="Click to edit">
                                  <FaEdit />
                                </button>
                              </div>}
                          </div>)}
                      </div>
                    </div>
                  </div> : stryMutAct_9fa48("19266") ? false : stryMutAct_9fa48("19265") ? true : (stryCov_9fa48("19265", "19266", "19267"), currentTask && <div className="session-data-tester__modal-task-preview">
                    <div className="session-data-tester__modal-task-header">
                      <div className="session-data-tester__modal-task-title-section">
                        <div className="session-data-tester__modal-task-content">
                          {/* Editable Title */}
                          {(stryMutAct_9fa48("19270") ? editingTaskField !== 'title' : stryMutAct_9fa48("19269") ? false : stryMutAct_9fa48("19268") ? true : (stryCov_9fa48("19268", "19269", "19270"), editingTaskField === (stryMutAct_9fa48("19271") ? "" : (stryCov_9fa48("19271"), 'title')))) ? <div className="session-data-tester__modal-task-field-editor">
                              <input type="text" value={editingTaskValue} onChange={stryMutAct_9fa48("19272") ? () => undefined : (stryCov_9fa48("19272"), e => setEditingTaskValue(e.target.value))} className="session-data-tester__modal-task-input" autoFocus />
                              <div className="session-data-tester__modal-task-field-actions">
                                <button onClick={saveEditedTaskField} className="session-data-tester__btn session-data-tester__btn--save-small">
                                  <FaCheck />
                                </button>
                                <button onClick={cancelEditingTaskField} className="session-data-tester__btn session-data-tester__btn--cancel">
                                  <FaTimes />
                                </button>
                              </div>
                            </div> : <div className="session-data-tester__modal-task-field-display">
                              <h3 onClick={stryMutAct_9fa48("19273") ? () => undefined : (stryCov_9fa48("19273"), () => startEditingTaskField(stryMutAct_9fa48("19274") ? "" : (stryCov_9fa48("19274"), 'title'), currentTask.title))}>
                                {currentTask.title}
                              </h3>
                              <button onClick={stryMutAct_9fa48("19275") ? () => undefined : (stryCov_9fa48("19275"), () => startEditingTaskField(stryMutAct_9fa48("19276") ? "" : (stryCov_9fa48("19276"), 'title'), currentTask.title))} className="session-data-tester__modal-task-field-edit-btn" title="Click to edit title">
                                <FaEdit />
                              </button>
                            </div>}
                          
                          {/* Editable Time - moved under title */}
                          {stryMutAct_9fa48("19279") ? currentTask.startTime || <div className="session-data-tester__modal-task-time-section">
                              {editingTaskField === 'startTime' ? <div className="session-data-tester__modal-task-time-editor">
                                  <input type="text" value={editingTaskValue} onChange={e => setEditingTaskValue(e.target.value)} className="session-data-tester__modal-task-time-input" placeholder="2:30 PM or 14:30" autoFocus />
                                  <div className="session-data-tester__modal-task-field-actions">
                                    <button onClick={saveEditedTaskField} className="session-data-tester__btn session-data-tester__btn--save-small">
                                      <FaCheck />
                                    </button>
                                    <button onClick={cancelEditingTaskField} className="session-data-tester__btn session-data-tester__btn--cancel">
                                      <FaTimes />
                                    </button>
                                  </div>
                                </div> : <div className="session-data-tester__modal-task-time-display">
                                  <span onClick={() => startEditingTaskField('startTime', currentTask.startTime)} className="session-data-tester__modal-task-time-value">
                                    {formatTime(currentTask.startTime)}
                                  </span>
                                  <button onClick={() => startEditingTaskField('startTime', currentTask.startTime)} className="session-data-tester__modal-task-field-edit-btn" title="Click to edit start time">
                                    <FaEdit />
                                  </button>
                                </div>}
                              
                              <span className="session-data-tester__modal-task-time-separator">-</span>
                              
                              {editingTaskField === 'endTime' ? <div className="session-data-tester__modal-task-time-editor">
                                  <input type="text" value={editingTaskValue} onChange={e => setEditingTaskValue(e.target.value)} className="session-data-tester__modal-task-time-input" placeholder="2:30 PM or 14:30" autoFocus />
                                  <div className="session-data-tester__modal-task-field-actions">
                                    <button onClick={saveEditedTaskField} className="session-data-tester__btn session-data-tester__btn--save-small">
                                      <FaCheck />
                                    </button>
                                    <button onClick={cancelEditingTaskField} className="session-data-tester__btn session-data-tester__btn--cancel">
                                      <FaTimes />
                                    </button>
                                  </div>
                                </div> : <div className="session-data-tester__modal-task-time-display">
                                  <span onClick={() => startEditingTaskField('endTime', currentTask.endTime)} className="session-data-tester__modal-task-time-value">
                                    {formatTime(currentTask.endTime)}
                                  </span>
                                  <button onClick={() => startEditingTaskField('endTime', currentTask.endTime)} className="session-data-tester__modal-task-field-edit-btn" title="Click to edit end time">
                                    <FaEdit />
                                  </button>
                                </div>}
                            </div> : stryMutAct_9fa48("19278") ? false : stryMutAct_9fa48("19277") ? true : (stryCov_9fa48("19277", "19278", "19279"), currentTask.startTime && <div className="session-data-tester__modal-task-time-section">
                              {(stryMutAct_9fa48("19282") ? editingTaskField !== 'startTime' : stryMutAct_9fa48("19281") ? false : stryMutAct_9fa48("19280") ? true : (stryCov_9fa48("19280", "19281", "19282"), editingTaskField === (stryMutAct_9fa48("19283") ? "" : (stryCov_9fa48("19283"), 'startTime')))) ? <div className="session-data-tester__modal-task-time-editor">
                                  <input type="text" value={editingTaskValue} onChange={stryMutAct_9fa48("19284") ? () => undefined : (stryCov_9fa48("19284"), e => setEditingTaskValue(e.target.value))} className="session-data-tester__modal-task-time-input" placeholder="2:30 PM or 14:30" autoFocus />
                                  <div className="session-data-tester__modal-task-field-actions">
                                    <button onClick={saveEditedTaskField} className="session-data-tester__btn session-data-tester__btn--save-small">
                                      <FaCheck />
                                    </button>
                                    <button onClick={cancelEditingTaskField} className="session-data-tester__btn session-data-tester__btn--cancel">
                                      <FaTimes />
                                    </button>
                                  </div>
                                </div> : <div className="session-data-tester__modal-task-time-display">
                                  <span onClick={stryMutAct_9fa48("19285") ? () => undefined : (stryCov_9fa48("19285"), () => startEditingTaskField(stryMutAct_9fa48("19286") ? "" : (stryCov_9fa48("19286"), 'startTime'), currentTask.startTime))} className="session-data-tester__modal-task-time-value">
                                    {formatTime(currentTask.startTime)}
                                  </span>
                                  <button onClick={stryMutAct_9fa48("19287") ? () => undefined : (stryCov_9fa48("19287"), () => startEditingTaskField(stryMutAct_9fa48("19288") ? "" : (stryCov_9fa48("19288"), 'startTime'), currentTask.startTime))} className="session-data-tester__modal-task-field-edit-btn" title="Click to edit start time">
                                    <FaEdit />
                                  </button>
                                </div>}
                              
                              <span className="session-data-tester__modal-task-time-separator">-</span>
                              
                              {(stryMutAct_9fa48("19291") ? editingTaskField !== 'endTime' : stryMutAct_9fa48("19290") ? false : stryMutAct_9fa48("19289") ? true : (stryCov_9fa48("19289", "19290", "19291"), editingTaskField === (stryMutAct_9fa48("19292") ? "" : (stryCov_9fa48("19292"), 'endTime')))) ? <div className="session-data-tester__modal-task-time-editor">
                                  <input type="text" value={editingTaskValue} onChange={stryMutAct_9fa48("19293") ? () => undefined : (stryCov_9fa48("19293"), e => setEditingTaskValue(e.target.value))} className="session-data-tester__modal-task-time-input" placeholder="2:30 PM or 14:30" autoFocus />
                                  <div className="session-data-tester__modal-task-field-actions">
                                    <button onClick={saveEditedTaskField} className="session-data-tester__btn session-data-tester__btn--save-small">
                                      <FaCheck />
                                    </button>
                                    <button onClick={cancelEditingTaskField} className="session-data-tester__btn session-data-tester__btn--cancel">
                                      <FaTimes />
                                    </button>
                                  </div>
                                </div> : <div className="session-data-tester__modal-task-time-display">
                                  <span onClick={stryMutAct_9fa48("19294") ? () => undefined : (stryCov_9fa48("19294"), () => startEditingTaskField(stryMutAct_9fa48("19295") ? "" : (stryCov_9fa48("19295"), 'endTime'), currentTask.endTime))} className="session-data-tester__modal-task-time-value">
                                    {formatTime(currentTask.endTime)}
                                  </span>
                                  <button onClick={stryMutAct_9fa48("19296") ? () => undefined : (stryCov_9fa48("19296"), () => startEditingTaskField(stryMutAct_9fa48("19297") ? "" : (stryCov_9fa48("19297"), 'endTime'), currentTask.endTime))} className="session-data-tester__modal-task-field-edit-btn" title="Click to edit end time">
                                    <FaEdit />
                                  </button>
                                </div>}
                            </div>)}
                          
                          {/* Editable Description */}
                          {(stryMutAct_9fa48("19300") ? editingTaskField !== 'description' : stryMutAct_9fa48("19299") ? false : stryMutAct_9fa48("19298") ? true : (stryCov_9fa48("19298", "19299", "19300"), editingTaskField === (stryMutAct_9fa48("19301") ? "" : (stryCov_9fa48("19301"), 'description')))) ? <div className="session-data-tester__modal-task-field-editor">
                              <input type="text" value={editingTaskValue} onChange={stryMutAct_9fa48("19302") ? () => undefined : (stryCov_9fa48("19302"), e => setEditingTaskValue(e.target.value))} className="session-data-tester__modal-task-input" autoFocus />
                              <div className="session-data-tester__modal-task-field-actions">
                                <button onClick={saveEditedTaskField} className="session-data-tester__btn session-data-tester__btn--save-small">
                                  <FaCheck />
                                </button>
                                <button onClick={cancelEditingTaskField} className="session-data-tester__btn session-data-tester__btn--cancel">
                                  <FaTimes />
                                </button>
                              </div>
                            </div> : <div className="session-data-tester__modal-task-field-display">
                              <p onClick={stryMutAct_9fa48("19303") ? () => undefined : (stryCov_9fa48("19303"), () => startEditingTaskField(stryMutAct_9fa48("19304") ? "" : (stryCov_9fa48("19304"), 'description'), currentTask.description))}>
                                {currentTask.description}
                              </p>
                              <button onClick={stryMutAct_9fa48("19305") ? () => undefined : (stryCov_9fa48("19305"), () => startEditingTaskField(stryMutAct_9fa48("19306") ? "" : (stryCov_9fa48("19306"), 'description'), currentTask.description))} className="session-data-tester__modal-task-field-edit-btn" title="Click to edit description">
                                <FaEdit />
                              </button>
                            </div>}
                        </div>
                      </div>
                      
                      <div className="session-data-tester__modal-task-meta">
                        {/* Analysis Checkboxes - centered */}
                        <div className="session-data-tester__modal-task-analysis">
                          <label className="session-data-tester__checkbox-label">
                            <input type="checkbox" checked={stryMutAct_9fa48("19309") ? currentTask.should_analyze && false : stryMutAct_9fa48("19308") ? false : stryMutAct_9fa48("19307") ? true : (stryCov_9fa48("19307", "19308", "19309"), currentTask.should_analyze || (stryMutAct_9fa48("19310") ? true : (stryCov_9fa48("19310"), false)))} onChange={stryMutAct_9fa48("19311") ? () => undefined : (stryCov_9fa48("19311"), e => updateTaskCheckbox(stryMutAct_9fa48("19312") ? "" : (stryCov_9fa48("19312"), 'should_analyze'), e.target.checked))} className="session-data-tester__checkbox" />
                            <span className="session-data-tester__checkbox-text">Should Analyze</span>
                          </label>
                          
                          <label className="session-data-tester__checkbox-label">
                            <input type="checkbox" checked={stryMutAct_9fa48("19315") ? currentTask.analyze_deliverable && false : stryMutAct_9fa48("19314") ? false : stryMutAct_9fa48("19313") ? true : (stryCov_9fa48("19313", "19314", "19315"), currentTask.analyze_deliverable || (stryMutAct_9fa48("19316") ? true : (stryCov_9fa48("19316"), false)))} onChange={stryMutAct_9fa48("19317") ? () => undefined : (stryCov_9fa48("19317"), e => updateTaskCheckbox(stryMutAct_9fa48("19318") ? "" : (stryCov_9fa48("19318"), 'analyze_deliverable'), e.target.checked))} className="session-data-tester__checkbox" />
                            <span className="session-data-tester__checkbox-text">Analyze Deliverable</span>
                          </label>
                        </div>
                        
                        {/* Add Resource & Add Question Buttons - right side */}
                        <div className="session-data-tester__modal-task-actions">
                          <button onClick={addNewResource} className="session-data-tester__btn session-data-tester__btn--add-resource" title="Add new resource to current task">
                            <FaPlus />
                            Add Resource
                          </button>
                          <button onClick={addNewQuestion} className="session-data-tester__btn session-data-tester__btn--add-question" title="Add new question to current task">
                            <FaPlus />
                            Add Question
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Resources */}
                    {stryMutAct_9fa48("19321") ? currentTask.linked_resources && currentTask.linked_resources.length > 0 || <div className="session-data-tester__modal-resources">
                        <h4>Resources</h4>
                        <div className="session-data-tester__modal-resource-list">
                          {currentTask.linked_resources.map((resource, index) => <div key={index} className="session-data-tester__modal-resource">
                              {getResourceIcon(resource.type)}
                              <div className="session-data-tester__modal-resource-content">
                                <a href={resource.url} target="_blank" rel="noopener noreferrer" className="session-data-tester__modal-resource-title">
                                  {resource.title}
                                  <FaExternalLinkAlt />
                                </a>
                                {resource.description && <p className="session-data-tester__modal-resource-description">
                                    {resource.description}
                                  </p>}
                              </div>
                              <div className="session-data-tester__modal-resource-actions">
                                <button onClick={() => startEditingResource(index, 'title', resource.title)} className="session-data-tester__btn session-data-tester__btn--edit-small" title="Edit title">
                                  <FaEdit />
                                </button>
                                <button onClick={() => startEditingResource(index, 'url', resource.url)} className="session-data-tester__btn session-data-tester__btn--edit-small" title="Edit URL">
                                  <FaLink />
                                </button>
                                <button onClick={() => startEditingResource(index, 'description', resource.description)} className="session-data-tester__btn session-data-tester__btn--edit-small" title="Edit description">
                                  <FaFileAlt />
                                </button>
                                <button onClick={() => deleteResource(index)} className="session-data-tester__btn session-data-tester__btn--delete-small" title="Delete resource">
                                  <FaTrash />
                                </button>
                              </div>
                            </div>)}
                        </div>
                      </div> : stryMutAct_9fa48("19320") ? false : stryMutAct_9fa48("19319") ? true : (stryCov_9fa48("19319", "19320", "19321"), (stryMutAct_9fa48("19323") ? currentTask.linked_resources || currentTask.linked_resources.length > 0 : stryMutAct_9fa48("19322") ? true : (stryCov_9fa48("19322", "19323"), currentTask.linked_resources && (stryMutAct_9fa48("19326") ? currentTask.linked_resources.length <= 0 : stryMutAct_9fa48("19325") ? currentTask.linked_resources.length >= 0 : stryMutAct_9fa48("19324") ? true : (stryCov_9fa48("19324", "19325", "19326"), currentTask.linked_resources.length > 0)))) && <div className="session-data-tester__modal-resources">
                        <h4>Resources</h4>
                        <div className="session-data-tester__modal-resource-list">
                          {currentTask.linked_resources.map(stryMutAct_9fa48("19327") ? () => undefined : (stryCov_9fa48("19327"), (resource, index) => <div key={index} className="session-data-tester__modal-resource">
                              {getResourceIcon(resource.type)}
                              <div className="session-data-tester__modal-resource-content">
                                <a href={resource.url} target="_blank" rel="noopener noreferrer" className="session-data-tester__modal-resource-title">
                                  {resource.title}
                                  <FaExternalLinkAlt />
                                </a>
                                {stryMutAct_9fa48("19330") ? resource.description || <p className="session-data-tester__modal-resource-description">
                                    {resource.description}
                                  </p> : stryMutAct_9fa48("19329") ? false : stryMutAct_9fa48("19328") ? true : (stryCov_9fa48("19328", "19329", "19330"), resource.description && <p className="session-data-tester__modal-resource-description">
                                    {resource.description}
                                  </p>)}
                              </div>
                              <div className="session-data-tester__modal-resource-actions">
                                <button onClick={stryMutAct_9fa48("19331") ? () => undefined : (stryCov_9fa48("19331"), () => startEditingResource(index, stryMutAct_9fa48("19332") ? "" : (stryCov_9fa48("19332"), 'title'), resource.title))} className="session-data-tester__btn session-data-tester__btn--edit-small" title="Edit title">
                                  <FaEdit />
                                </button>
                                <button onClick={stryMutAct_9fa48("19333") ? () => undefined : (stryCov_9fa48("19333"), () => startEditingResource(index, stryMutAct_9fa48("19334") ? "" : (stryCov_9fa48("19334"), 'url'), resource.url))} className="session-data-tester__btn session-data-tester__btn--edit-small" title="Edit URL">
                                  <FaLink />
                                </button>
                                <button onClick={stryMutAct_9fa48("19335") ? () => undefined : (stryCov_9fa48("19335"), () => startEditingResource(index, stryMutAct_9fa48("19336") ? "" : (stryCov_9fa48("19336"), 'description'), resource.description))} className="session-data-tester__btn session-data-tester__btn--edit-small" title="Edit description">
                                  <FaFileAlt />
                                </button>
                                <button onClick={stryMutAct_9fa48("19337") ? () => undefined : (stryCov_9fa48("19337"), () => deleteResource(index))} className="session-data-tester__btn session-data-tester__btn--delete-small" title="Delete resource">
                                  <FaTrash />
                                </button>
                              </div>
                            </div>))}
                        </div>
                      </div>)}

                    {/* Messages Preview */}
                    <div className="session-data-tester__modal-messages">
                      <h4>Conversation Flow (Click to Edit)</h4>
                      <div className="session-data-tester__modal-message-list">
                        {messages.map(stryMutAct_9fa48("19338") ? () => undefined : (stryCov_9fa48("19338"), (message, messageIndex) => <div key={message.id} className={stryMutAct_9fa48("19339") ? `` : (stryCov_9fa48("19339"), `session-data-tester__modal-message session-data-tester__modal-message--${message.role}`)}>
                            {stryMutAct_9fa48("19342") ? message.id === 'intro' || <div className="session-data-tester__modal-message-label">Introduction</div> : stryMutAct_9fa48("19341") ? false : stryMutAct_9fa48("19340") ? true : (stryCov_9fa48("19340", "19341", "19342"), (stryMutAct_9fa48("19344") ? message.id !== 'intro' : stryMutAct_9fa48("19343") ? true : (stryCov_9fa48("19343", "19344"), message.id === (stryMutAct_9fa48("19345") ? "" : (stryCov_9fa48("19345"), 'intro')))) && <div className="session-data-tester__modal-message-label">Introduction</div>)}
                            {stryMutAct_9fa48("19348") ? message.id === 'conclusion' || <div className="session-data-tester__modal-message-label">Conclusion</div> : stryMutAct_9fa48("19347") ? false : stryMutAct_9fa48("19346") ? true : (stryCov_9fa48("19346", "19347", "19348"), (stryMutAct_9fa48("19350") ? message.id !== 'conclusion' : stryMutAct_9fa48("19349") ? true : (stryCov_9fa48("19349", "19350"), message.id === (stryMutAct_9fa48("19351") ? "" : (stryCov_9fa48("19351"), 'conclusion')))) && <div className="session-data-tester__modal-message-label">Conclusion</div>)}
                            {(stryMutAct_9fa48("19354") ? editingMessageId !== message.id : stryMutAct_9fa48("19353") ? false : stryMutAct_9fa48("19352") ? true : (stryCov_9fa48("19352", "19353", "19354"), editingMessageId === message.id)) ? <div className="session-data-tester__modal-message-editor">
                                <textarea value={editingText} onChange={stryMutAct_9fa48("19355") ? () => undefined : (stryCov_9fa48("19355"), e => setEditingText(e.target.value))} className="session-data-tester__modal-message-textarea" rows={5} autoFocus />
                                <div className="session-data-tester__modal-message-actions">
                                  <button onClick={saveEditedMessage} className="session-data-tester__btn session-data-tester__btn--save-small">
                                    <FaCheck />
                                    Save
                                  </button>
                                  <button onClick={cancelEditing} className="session-data-tester__btn session-data-tester__btn--cancel">
                                    <FaTimes />
                                    Cancel
                                  </button>
                                  {stryMutAct_9fa48("19358") ? message.id.startsWith('question-') || <button onClick={() => {
                            const questionIndex = parseInt(message.id.split('-')[1]);
                            deleteQuestion(questionIndex);
                            cancelEditing();
                          }} className="session-data-tester__btn session-data-tester__btn--delete">
                                      <FaTrash />
                                      Delete
                                    </button> : stryMutAct_9fa48("19357") ? false : stryMutAct_9fa48("19356") ? true : (stryCov_9fa48("19356", "19357", "19358"), (stryMutAct_9fa48("19359") ? message.id.endsWith('question-') : (stryCov_9fa48("19359"), message.id.startsWith(stryMutAct_9fa48("19360") ? "" : (stryCov_9fa48("19360"), 'question-')))) && <button onClick={() => {
                            if (stryMutAct_9fa48("19361")) {
                              {}
                            } else {
                              stryCov_9fa48("19361");
                              const questionIndex = parseInt(message.id.split(stryMutAct_9fa48("19362") ? "" : (stryCov_9fa48("19362"), '-'))[1]);
                              deleteQuestion(questionIndex);
                              cancelEditing();
                            }
                          }} className="session-data-tester__btn session-data-tester__btn--delete">
                                      <FaTrash />
                                      Delete
                                    </button>)}
                                </div>
                              </div> : <div className="session-data-tester__modal-message-content">
                                <div className="session-data-tester__modal-message-text">
                                  <ReactMarkdown>{message.content}</ReactMarkdown>
                                </div>
                                <button onClick={stryMutAct_9fa48("19363") ? () => undefined : (stryCov_9fa48("19363"), () => startEditingMessage(message.id, message.content))} className="session-data-tester__modal-message-edit-btn" title="Click to edit">
                                  <FaEdit />
                                </button>
                              </div>}
                          </div>))}
                      </div>
                    </div>
                  </div>)}
              </div>
            </div>
          </div>
        </div>)}

      {/* Delete Task Confirmation Modal */}
      {stryMutAct_9fa48("19366") ? showDeleteConfirm || <div className="session-data-tester__delete-confirm-overlay">
          <div className="session-data-tester__delete-confirm-modal">
            <div className="session-data-tester__delete-confirm-header">
              <h3>Delete Task</h3>
              <button onClick={cancelDeleteTask} className="session-data-tester__delete-confirm-close">
                <FaTimes />
              </button>
            </div>
            
            <div className="session-data-tester__delete-confirm-content">
              <div className="session-data-tester__delete-confirm-icon">
                <FaTrash />
              </div>
              <div className="session-data-tester__delete-confirm-text">
                <p>Are you sure you want to delete this task?</p>
                {taskToDelete !== null && tasks[taskToDelete] && <div className="session-data-tester__delete-confirm-task-info">
                    <strong>{tasks[taskToDelete].title}</strong>
                    <span>{formatTime(tasks[taskToDelete].startTime)} - {formatTime(tasks[taskToDelete].endTime)}</span>
                  </div>}
                <p className="session-data-tester__delete-confirm-warning">
                  <strong>This action cannot be undone.</strong>
                </p>
              </div>
            </div>
            
            <div className="session-data-tester__delete-confirm-actions">
              <button onClick={cancelDeleteTask} className="session-data-tester__btn session-data-tester__btn--cancel">
                Cancel
              </button>
              <button onClick={confirmDeleteTask} className="session-data-tester__btn session-data-tester__btn--delete">
                <FaTrash />
                Delete Task
              </button>
            </div>
          </div>
        </div> : stryMutAct_9fa48("19365") ? false : stryMutAct_9fa48("19364") ? true : (stryCov_9fa48("19364", "19365", "19366"), showDeleteConfirm && <div className="session-data-tester__delete-confirm-overlay">
          <div className="session-data-tester__delete-confirm-modal">
            <div className="session-data-tester__delete-confirm-header">
              <h3>Delete Task</h3>
              <button onClick={cancelDeleteTask} className="session-data-tester__delete-confirm-close">
                <FaTimes />
              </button>
            </div>
            
            <div className="session-data-tester__delete-confirm-content">
              <div className="session-data-tester__delete-confirm-icon">
                <FaTrash />
              </div>
              <div className="session-data-tester__delete-confirm-text">
                <p>Are you sure you want to delete this task?</p>
                {stryMutAct_9fa48("19369") ? taskToDelete !== null && tasks[taskToDelete] || <div className="session-data-tester__delete-confirm-task-info">
                    <strong>{tasks[taskToDelete].title}</strong>
                    <span>{formatTime(tasks[taskToDelete].startTime)} - {formatTime(tasks[taskToDelete].endTime)}</span>
                  </div> : stryMutAct_9fa48("19368") ? false : stryMutAct_9fa48("19367") ? true : (stryCov_9fa48("19367", "19368", "19369"), (stryMutAct_9fa48("19371") ? taskToDelete !== null || tasks[taskToDelete] : stryMutAct_9fa48("19370") ? true : (stryCov_9fa48("19370", "19371"), (stryMutAct_9fa48("19373") ? taskToDelete === null : stryMutAct_9fa48("19372") ? true : (stryCov_9fa48("19372", "19373"), taskToDelete !== null)) && tasks[taskToDelete])) && <div className="session-data-tester__delete-confirm-task-info">
                    <strong>{tasks[taskToDelete].title}</strong>
                    <span>{formatTime(tasks[taskToDelete].startTime)} - {formatTime(tasks[taskToDelete].endTime)}</span>
                  </div>)}
                <p className="session-data-tester__delete-confirm-warning">
                  <strong>This action cannot be undone.</strong>
                </p>
              </div>
            </div>
            
            <div className="session-data-tester__delete-confirm-actions">
              <button onClick={cancelDeleteTask} className="session-data-tester__btn session-data-tester__btn--cancel">
                Cancel
              </button>
              <button onClick={confirmDeleteTask} className="session-data-tester__btn session-data-tester__btn--delete">
                <FaTrash />
                Delete Task
              </button>
            </div>
          </div>
        </div>)}

      {/* Resource Editing Modal */}
      {stryMutAct_9fa48("19376") ? editingResourceIndex !== null || <div className="session-data-tester__resource-editor-overlay">
          <div className="session-data-tester__resource-editor">
            <h3>{editingResourceIndex === -1 ? 'Add New Resource' : 'Edit Resource'}</h3>
            
            <div className="session-data-tester__resource-field">
              <label>
                {editingResourceField === 'title' && 'Resource Title:'}
                {editingResourceField === 'url' && 'Resource URL:'}
                {editingResourceField === 'description' && 'Resource Description:'}
              </label>
              {editingResourceField === 'description' ? <textarea value={editingResourceValue} onChange={e => setEditingResourceValue(e.target.value)} className="session-data-tester__resource-textarea" placeholder="Enter resource description" rows={3} autoFocus /> : <input type="text" value={editingResourceValue} onChange={e => setEditingResourceValue(e.target.value)} className="session-data-tester__resource-input" placeholder={editingResourceField === 'title' ? 'Enter resource title' : editingResourceField === 'url' ? 'Enter resource URL' : 'Enter value'} autoFocus />}
            </div>
            
            <div className="session-data-tester__resource-editor-actions">
              <button onClick={saveEditedResource} className="session-data-tester__btn session-data-tester__btn--save-small">
                <FaCheck />
                Save
              </button>
              <button onClick={cancelEditingResource} className="session-data-tester__btn session-data-tester__btn--cancel">
                <FaTimes />
                Cancel
              </button>
            </div>
          </div>
        </div> : stryMutAct_9fa48("19375") ? false : stryMutAct_9fa48("19374") ? true : (stryCov_9fa48("19374", "19375", "19376"), (stryMutAct_9fa48("19378") ? editingResourceIndex === null : stryMutAct_9fa48("19377") ? true : (stryCov_9fa48("19377", "19378"), editingResourceIndex !== null)) && <div className="session-data-tester__resource-editor-overlay">
          <div className="session-data-tester__resource-editor">
            <h3>{(stryMutAct_9fa48("19381") ? editingResourceIndex !== -1 : stryMutAct_9fa48("19380") ? false : stryMutAct_9fa48("19379") ? true : (stryCov_9fa48("19379", "19380", "19381"), editingResourceIndex === (stryMutAct_9fa48("19382") ? +1 : (stryCov_9fa48("19382"), -1)))) ? stryMutAct_9fa48("19383") ? "" : (stryCov_9fa48("19383"), 'Add New Resource') : stryMutAct_9fa48("19384") ? "" : (stryCov_9fa48("19384"), 'Edit Resource')}</h3>
            
            <div className="session-data-tester__resource-field">
              <label>
                {stryMutAct_9fa48("19387") ? editingResourceField === 'title' || 'Resource Title:' : stryMutAct_9fa48("19386") ? false : stryMutAct_9fa48("19385") ? true : (stryCov_9fa48("19385", "19386", "19387"), (stryMutAct_9fa48("19389") ? editingResourceField !== 'title' : stryMutAct_9fa48("19388") ? true : (stryCov_9fa48("19388", "19389"), editingResourceField === (stryMutAct_9fa48("19390") ? "" : (stryCov_9fa48("19390"), 'title')))) && (stryMutAct_9fa48("19391") ? "" : (stryCov_9fa48("19391"), 'Resource Title:')))}
                {stryMutAct_9fa48("19394") ? editingResourceField === 'url' || 'Resource URL:' : stryMutAct_9fa48("19393") ? false : stryMutAct_9fa48("19392") ? true : (stryCov_9fa48("19392", "19393", "19394"), (stryMutAct_9fa48("19396") ? editingResourceField !== 'url' : stryMutAct_9fa48("19395") ? true : (stryCov_9fa48("19395", "19396"), editingResourceField === (stryMutAct_9fa48("19397") ? "" : (stryCov_9fa48("19397"), 'url')))) && (stryMutAct_9fa48("19398") ? "" : (stryCov_9fa48("19398"), 'Resource URL:')))}
                {stryMutAct_9fa48("19401") ? editingResourceField === 'description' || 'Resource Description:' : stryMutAct_9fa48("19400") ? false : stryMutAct_9fa48("19399") ? true : (stryCov_9fa48("19399", "19400", "19401"), (stryMutAct_9fa48("19403") ? editingResourceField !== 'description' : stryMutAct_9fa48("19402") ? true : (stryCov_9fa48("19402", "19403"), editingResourceField === (stryMutAct_9fa48("19404") ? "" : (stryCov_9fa48("19404"), 'description')))) && (stryMutAct_9fa48("19405") ? "" : (stryCov_9fa48("19405"), 'Resource Description:')))}
              </label>
              {(stryMutAct_9fa48("19408") ? editingResourceField !== 'description' : stryMutAct_9fa48("19407") ? false : stryMutAct_9fa48("19406") ? true : (stryCov_9fa48("19406", "19407", "19408"), editingResourceField === (stryMutAct_9fa48("19409") ? "" : (stryCov_9fa48("19409"), 'description')))) ? <textarea value={editingResourceValue} onChange={stryMutAct_9fa48("19410") ? () => undefined : (stryCov_9fa48("19410"), e => setEditingResourceValue(e.target.value))} className="session-data-tester__resource-textarea" placeholder="Enter resource description" rows={3} autoFocus /> : <input type="text" value={editingResourceValue} onChange={stryMutAct_9fa48("19411") ? () => undefined : (stryCov_9fa48("19411"), e => setEditingResourceValue(e.target.value))} className="session-data-tester__resource-input" placeholder={(stryMutAct_9fa48("19414") ? editingResourceField !== 'title' : stryMutAct_9fa48("19413") ? false : stryMutAct_9fa48("19412") ? true : (stryCov_9fa48("19412", "19413", "19414"), editingResourceField === (stryMutAct_9fa48("19415") ? "" : (stryCov_9fa48("19415"), 'title')))) ? stryMutAct_9fa48("19416") ? "" : (stryCov_9fa48("19416"), 'Enter resource title') : (stryMutAct_9fa48("19419") ? editingResourceField !== 'url' : stryMutAct_9fa48("19418") ? false : stryMutAct_9fa48("19417") ? true : (stryCov_9fa48("19417", "19418", "19419"), editingResourceField === (stryMutAct_9fa48("19420") ? "" : (stryCov_9fa48("19420"), 'url')))) ? stryMutAct_9fa48("19421") ? "" : (stryCov_9fa48("19421"), 'Enter resource URL') : stryMutAct_9fa48("19422") ? "" : (stryCov_9fa48("19422"), 'Enter value')} autoFocus />}
            </div>
            
            <div className="session-data-tester__resource-editor-actions">
              <button onClick={saveEditedResource} className="session-data-tester__btn session-data-tester__btn--save-small">
                <FaCheck />
                Save
              </button>
              <button onClick={cancelEditingResource} className="session-data-tester__btn session-data-tester__btn--cancel">
                <FaTimes />
                Cancel
              </button>
            </div>
          </div>
        </div>)}
    </div>;
  }
};
export default SessionTester;