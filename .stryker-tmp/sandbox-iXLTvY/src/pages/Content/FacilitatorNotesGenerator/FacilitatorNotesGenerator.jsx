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
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { FaSpinner, FaFileAlt, FaEdit, FaSave, FaTimes, FaExpand, FaDownload, FaChevronDown, FaChevronRight, FaExpandArrowsAlt, FaCompressArrowsAlt } from 'react-icons/fa';
import './FacilitatorNotesGenerator.css';
const FacilitatorNotesGenerator = ({
  sharedData = {},
  updateSharedData = () => {}
}) => {
  if (stryMutAct_9fa48("17562")) {
    {}
  } else {
    stryCov_9fa48("17562");
    const {
      token
    } = useAuth();
    const [originalContent, setOriginalContent] = useState(stryMutAct_9fa48("17563") ? "Stryker was here!" : (stryCov_9fa48("17563"), ''));
    const [sessionData, setSessionData] = useState(null);
    const [facilitatorNotes, setFacilitatorNotes] = useState(null);
    const [isGenerating, setIsGenerating] = useState(stryMutAct_9fa48("17564") ? true : (stryCov_9fa48("17564"), false));
    const [error, setError] = useState(stryMutAct_9fa48("17565") ? "Stryker was here!" : (stryCov_9fa48("17565"), ''));
    const [isModalOpen, setIsModalOpen] = useState(stryMutAct_9fa48("17566") ? true : (stryCov_9fa48("17566"), false));
    const [isEditModalOpen, setIsEditModalOpen] = useState(stryMutAct_9fa48("17567") ? true : (stryCov_9fa48("17567"), false));
    const [editingTask, setEditingTask] = useState(null);
    const [editingDayIndex, setEditingDayIndex] = useState(null);
    const [editingTaskIndex, setEditingTaskIndex] = useState(null);
    const [editingField, setEditingField] = useState(null);
    const [editingFieldValue, setEditingFieldValue] = useState(stryMutAct_9fa48("17568") ? "Stryker was here!" : (stryCov_9fa48("17568"), ''));
    const [collapsedDays, setCollapsedDays] = useState(new Set());
    const [collapsedTasks, setCollapsedTasks] = useState(new Set());

    // Initialize with shared data and fallback to sessionStorage
    useEffect(() => {
      if (stryMutAct_9fa48("17569")) {
        {}
      } else {
        stryCov_9fa48("17569");
        try {
          if (stryMutAct_9fa48("17570")) {
            {}
          } else {
            stryCov_9fa48("17570");
            // Use shared data if available, otherwise fall back to sessionStorage
            const contentToUse = stryMutAct_9fa48("17573") ? (sharedData?.originalContent || sessionStorage.getItem('originalContent')) && '' : stryMutAct_9fa48("17572") ? false : stryMutAct_9fa48("17571") ? true : (stryCov_9fa48("17571", "17572", "17573"), (stryMutAct_9fa48("17575") ? sharedData?.originalContent && sessionStorage.getItem('originalContent') : stryMutAct_9fa48("17574") ? false : (stryCov_9fa48("17574", "17575"), (stryMutAct_9fa48("17576") ? sharedData.originalContent : (stryCov_9fa48("17576"), sharedData?.originalContent)) || sessionStorage.getItem(stryMutAct_9fa48("17577") ? "" : (stryCov_9fa48("17577"), 'originalContent')))) || (stryMutAct_9fa48("17578") ? "Stryker was here!" : (stryCov_9fa48("17578"), '')));
            const sessionToUse = stryMutAct_9fa48("17581") ? (sharedData?.editedJSON || sharedData?.generatedJSON || sessionStorage.getItem('generatedSessionData')) && '' : stryMutAct_9fa48("17580") ? false : stryMutAct_9fa48("17579") ? true : (stryCov_9fa48("17579", "17580", "17581"), (stryMutAct_9fa48("17583") ? (sharedData?.editedJSON || sharedData?.generatedJSON) && sessionStorage.getItem('generatedSessionData') : stryMutAct_9fa48("17582") ? false : (stryCov_9fa48("17582", "17583"), (stryMutAct_9fa48("17585") ? sharedData?.editedJSON && sharedData?.generatedJSON : stryMutAct_9fa48("17584") ? false : (stryCov_9fa48("17584", "17585"), (stryMutAct_9fa48("17586") ? sharedData.editedJSON : (stryCov_9fa48("17586"), sharedData?.editedJSON)) || (stryMutAct_9fa48("17587") ? sharedData.generatedJSON : (stryCov_9fa48("17587"), sharedData?.generatedJSON)))) || sessionStorage.getItem(stryMutAct_9fa48("17588") ? "" : (stryCov_9fa48("17588"), 'generatedSessionData')))) || (stryMutAct_9fa48("17589") ? "Stryker was here!" : (stryCov_9fa48("17589"), '')));
            setOriginalContent(contentToUse);
            if (stryMutAct_9fa48("17591") ? false : stryMutAct_9fa48("17590") ? true : (stryCov_9fa48("17590", "17591"), sessionToUse)) {
              if (stryMutAct_9fa48("17592")) {
                {}
              } else {
                stryCov_9fa48("17592");
                try {
                  if (stryMutAct_9fa48("17593")) {
                    {}
                  } else {
                    stryCov_9fa48("17593");
                    const parsedData = JSON.parse(sessionToUse);
                    setSessionData(parsedData);
                  }
                } catch (parseError) {
                  if (stryMutAct_9fa48("17594")) {
                    {}
                  } else {
                    stryCov_9fa48("17594");
                    console.error(stryMutAct_9fa48("17595") ? "" : (stryCov_9fa48("17595"), 'Error parsing session data:'), parseError);
                    setSessionData(null);
                  }
                }
              }
            }
          }
        } catch (error) {
          if (stryMutAct_9fa48("17596")) {
            {}
          } else {
            stryCov_9fa48("17596");
            console.error(stryMutAct_9fa48("17597") ? "" : (stryCov_9fa48("17597"), 'Error in FacilitatorNotesGenerator useEffect:'), error);
            setError(stryMutAct_9fa48("17598") ? "" : (stryCov_9fa48("17598"), 'Failed to initialize component data'));
          }
        }
      }
    }, stryMutAct_9fa48("17599") ? [] : (stryCov_9fa48("17599"), [sharedData]));

    // Check if facilitator notes already exist in the session data
    const hasFacilitatorNotes = () => {
      if (stryMutAct_9fa48("17600")) {
        {}
      } else {
        stryCov_9fa48("17600");
        if (stryMutAct_9fa48("17603") ? false : stryMutAct_9fa48("17602") ? true : stryMutAct_9fa48("17601") ? sessionData : (stryCov_9fa48("17601", "17602", "17603"), !sessionData)) return stryMutAct_9fa48("17604") ? true : (stryCov_9fa48("17604"), false);
        const isMultiDay = Array.isArray(sessionData);
        const daysToCheck = isMultiDay ? sessionData : stryMutAct_9fa48("17605") ? [] : (stryCov_9fa48("17605"), [sessionData]);
        return stryMutAct_9fa48("17606") ? daysToCheck.every(dayData => {
          if (dayData && dayData.time_blocks) {
            return dayData.time_blocks.some(block => block.task && block.task.facilitator_notes);
          }
          return false;
        }) : (stryCov_9fa48("17606"), daysToCheck.some(dayData => {
          if (stryMutAct_9fa48("17607")) {
            {}
          } else {
            stryCov_9fa48("17607");
            if (stryMutAct_9fa48("17610") ? dayData || dayData.time_blocks : stryMutAct_9fa48("17609") ? false : stryMutAct_9fa48("17608") ? true : (stryCov_9fa48("17608", "17609", "17610"), dayData && dayData.time_blocks)) {
              if (stryMutAct_9fa48("17611")) {
                {}
              } else {
                stryCov_9fa48("17611");
                return stryMutAct_9fa48("17612") ? dayData.time_blocks.every(block => block.task && block.task.facilitator_notes) : (stryCov_9fa48("17612"), dayData.time_blocks.some(stryMutAct_9fa48("17613") ? () => undefined : (stryCov_9fa48("17613"), block => stryMutAct_9fa48("17616") ? block.task || block.task.facilitator_notes : stryMutAct_9fa48("17615") ? false : stryMutAct_9fa48("17614") ? true : (stryCov_9fa48("17614", "17615", "17616"), block.task && block.task.facilitator_notes))));
              }
            }
            return stryMutAct_9fa48("17617") ? true : (stryCov_9fa48("17617"), false);
          }
        }));
      }
    };

    // Initialize facilitator notes if they already exist in session data
    useEffect(() => {
      if (stryMutAct_9fa48("17618")) {
        {}
      } else {
        stryCov_9fa48("17618");
        if (stryMutAct_9fa48("17621") ? sessionData && hasFacilitatorNotes() || !facilitatorNotes : stryMutAct_9fa48("17620") ? false : stryMutAct_9fa48("17619") ? true : (stryCov_9fa48("17619", "17620", "17621"), (stryMutAct_9fa48("17623") ? sessionData || hasFacilitatorNotes() : stryMutAct_9fa48("17622") ? true : (stryCov_9fa48("17622", "17623"), sessionData && hasFacilitatorNotes())) && (stryMutAct_9fa48("17624") ? facilitatorNotes : (stryCov_9fa48("17624"), !facilitatorNotes)))) {
          if (stryMutAct_9fa48("17625")) {
            {}
          } else {
            stryCov_9fa48("17625");
            const extractedNotes = extractFacilitatorNotesFromSession(sessionData);
            setFacilitatorNotes(extractedNotes);
          }
        }
      }
    }, stryMutAct_9fa48("17626") ? [] : (stryCov_9fa48("17626"), [sessionData]));

    // Helper function to extract facilitator notes from embedded session data for display
    const extractFacilitatorNotesFromSession = sessionData => {
      if (stryMutAct_9fa48("17627")) {
        {}
      } else {
        stryCov_9fa48("17627");
        const isMultiDay = Array.isArray(sessionData);
        const daysToProcess = isMultiDay ? sessionData : stryMutAct_9fa48("17628") ? [] : (stryCov_9fa48("17628"), [sessionData]);
        const allDays = stryMutAct_9fa48("17629") ? ["Stryker was here"] : (stryCov_9fa48("17629"), []);
        daysToProcess.forEach((dayData, dayIndex) => {
          if (stryMutAct_9fa48("17630")) {
            {}
          } else {
            stryCov_9fa48("17630");
            const tasks = stryMutAct_9fa48("17631") ? ["Stryker was here"] : (stryCov_9fa48("17631"), []);
            if (stryMutAct_9fa48("17634") ? dayData || dayData.time_blocks : stryMutAct_9fa48("17633") ? false : stryMutAct_9fa48("17632") ? true : (stryCov_9fa48("17632", "17633", "17634"), dayData && dayData.time_blocks)) {
              if (stryMutAct_9fa48("17635")) {
                {}
              } else {
                stryCov_9fa48("17635");
                dayData.time_blocks.forEach((block, blockIndex) => {
                  if (stryMutAct_9fa48("17636")) {
                    {}
                  } else {
                    stryCov_9fa48("17636");
                    if (stryMutAct_9fa48("17638") ? false : stryMutAct_9fa48("17637") ? true : (stryCov_9fa48("17637", "17638"), block.task)) {
                      if (stryMutAct_9fa48("17639")) {
                        {}
                      } else {
                        stryCov_9fa48("17639");
                        tasks.push(stryMutAct_9fa48("17640") ? {} : (stryCov_9fa48("17640"), {
                          task_title: block.task.title,
                          start_time: block.start_time,
                          end_time: block.end_time,
                          facilitator_notes: stryMutAct_9fa48("17643") ? block.task.facilitator_notes && 'No facilitator notes available' : stryMutAct_9fa48("17642") ? false : stryMutAct_9fa48("17641") ? true : (stryCov_9fa48("17641", "17642", "17643"), block.task.facilitator_notes || (stryMutAct_9fa48("17644") ? "" : (stryCov_9fa48("17644"), 'No facilitator notes available')))
                        }));
                      }
                    }
                  }
                });
              }
            }
            allDays.push(stryMutAct_9fa48("17645") ? {} : (stryCov_9fa48("17645"), {
              dayNumber: stryMutAct_9fa48("17648") ? dayData?.day_number && dayIndex + 1 : stryMutAct_9fa48("17647") ? false : stryMutAct_9fa48("17646") ? true : (stryCov_9fa48("17646", "17647", "17648"), (stryMutAct_9fa48("17649") ? dayData.day_number : (stryCov_9fa48("17649"), dayData?.day_number)) || (stryMutAct_9fa48("17650") ? dayIndex - 1 : (stryCov_9fa48("17650"), dayIndex + 1))),
              date: stryMutAct_9fa48("17653") ? dayData?.date && 'Unknown' : stryMutAct_9fa48("17652") ? false : stryMutAct_9fa48("17651") ? true : (stryCov_9fa48("17651", "17652", "17653"), (stryMutAct_9fa48("17654") ? dayData.date : (stryCov_9fa48("17654"), dayData?.date)) || (stryMutAct_9fa48("17655") ? "" : (stryCov_9fa48("17655"), 'Unknown'))),
              dailyGoal: stryMutAct_9fa48("17658") ? dayData?.daily_goal && '' : stryMutAct_9fa48("17657") ? false : stryMutAct_9fa48("17656") ? true : (stryCov_9fa48("17656", "17657", "17658"), (stryMutAct_9fa48("17659") ? dayData.daily_goal : (stryCov_9fa48("17659"), dayData?.daily_goal)) || (stryMutAct_9fa48("17660") ? "Stryker was here!" : (stryCov_9fa48("17660"), ''))),
              cohort: stryMutAct_9fa48("17663") ? dayData?.cohort && '' : stryMutAct_9fa48("17662") ? false : stryMutAct_9fa48("17661") ? true : (stryCov_9fa48("17661", "17662", "17663"), (stryMutAct_9fa48("17664") ? dayData.cohort : (stryCov_9fa48("17664"), dayData?.cohort)) || (stryMutAct_9fa48("17665") ? "Stryker was here!" : (stryCov_9fa48("17665"), ''))),
              tasks: tasks
            }));
          }
        });
        return stryMutAct_9fa48("17666") ? {} : (stryCov_9fa48("17666"), {
          isMultiDay: isMultiDay,
          days: allDays
        });
      }
    };
    const handleGenerateFacilitatorNotes = async () => {
      if (stryMutAct_9fa48("17667")) {
        {}
      } else {
        stryCov_9fa48("17667");
        if (stryMutAct_9fa48("17670") ? false : stryMutAct_9fa48("17669") ? true : stryMutAct_9fa48("17668") ? sessionData : (stryCov_9fa48("17668", "17669", "17670"), !sessionData)) {
          if (stryMutAct_9fa48("17671")) {
            {}
          } else {
            stryCov_9fa48("17671");
            setError(stryMutAct_9fa48("17672") ? "" : (stryCov_9fa48("17672"), 'No session data available. Please complete Phase 1 and 2 first.'));
            return;
          }
        }
        try {
          if (stryMutAct_9fa48("17673")) {
            {}
          } else {
            stryCov_9fa48("17673");
            setIsGenerating(stryMutAct_9fa48("17674") ? false : (stryCov_9fa48("17674"), true));
            setError(stryMutAct_9fa48("17675") ? "Stryker was here!" : (stryCov_9fa48("17675"), ''));
            const response = await fetch(stryMutAct_9fa48("17676") ? `` : (stryCov_9fa48("17676"), `${import.meta.env.VITE_API_URL}/api/content/generate-facilitator-notes`), stryMutAct_9fa48("17677") ? {} : (stryCov_9fa48("17677"), {
              method: stryMutAct_9fa48("17678") ? "" : (stryCov_9fa48("17678"), 'POST'),
              headers: stryMutAct_9fa48("17679") ? {} : (stryCov_9fa48("17679"), {
                'Content-Type': stryMutAct_9fa48("17680") ? "" : (stryCov_9fa48("17680"), 'application/json'),
                'Authorization': stryMutAct_9fa48("17681") ? `` : (stryCov_9fa48("17681"), `Bearer ${token}`)
              }),
              body: JSON.stringify(stryMutAct_9fa48("17682") ? {} : (stryCov_9fa48("17682"), {
                sessionData: sessionData,
                originalContent: originalContent // Include original content for context
              }))
            }));
            if (stryMutAct_9fa48("17685") ? false : stryMutAct_9fa48("17684") ? true : stryMutAct_9fa48("17683") ? response.ok : (stryCov_9fa48("17683", "17684", "17685"), !response.ok)) {
              if (stryMutAct_9fa48("17686")) {
                {}
              } else {
                stryCov_9fa48("17686");
                throw new Error(stryMutAct_9fa48("17687") ? `` : (stryCov_9fa48("17687"), `HTTP error! status: ${response.status}`));
              }
            }
            const result = await response.json();
            if (stryMutAct_9fa48("17689") ? false : stryMutAct_9fa48("17688") ? true : (stryCov_9fa48("17688", "17689"), result.success)) {
              if (stryMutAct_9fa48("17690")) {
                {}
              } else {
                stryCov_9fa48("17690");
                // Update session data with embedded facilitator notes
                setSessionData(result.sessionData);

                // Update shared data to reflect the changes
                const updatedJsonString = JSON.stringify(result.sessionData, null, 2);
                sessionStorage.setItem(stryMutAct_9fa48("17691") ? "" : (stryCov_9fa48("17691"), 'generatedSessionData'), updatedJsonString);
                updateSharedData(stryMutAct_9fa48("17692") ? {} : (stryCov_9fa48("17692"), {
                  editedJSON: updatedJsonString,
                  generatedJSON: updatedJsonString
                }));

                // Set facilitator notes for display (extract from embedded data for backward compatibility)
                const extractedNotes = extractFacilitatorNotesFromSession(result.sessionData);
                setFacilitatorNotes(extractedNotes);
              }
            } else {
              if (stryMutAct_9fa48("17693")) {
                {}
              } else {
                stryCov_9fa48("17693");
                throw new Error(stryMutAct_9fa48("17696") ? result.error && 'Failed to generate facilitator notes' : stryMutAct_9fa48("17695") ? false : stryMutAct_9fa48("17694") ? true : (stryCov_9fa48("17694", "17695", "17696"), result.error || (stryMutAct_9fa48("17697") ? "" : (stryCov_9fa48("17697"), 'Failed to generate facilitator notes'))));
              }
            }
          }
        } catch (error) {
          if (stryMutAct_9fa48("17698")) {
            {}
          } else {
            stryCov_9fa48("17698");
            console.error(stryMutAct_9fa48("17699") ? "" : (stryCov_9fa48("17699"), 'Error generating facilitator notes:'), error);
            setError(stryMutAct_9fa48("17700") ? `` : (stryCov_9fa48("17700"), `Error generating facilitator notes: ${error.message}`));
          }
        } finally {
          if (stryMutAct_9fa48("17701")) {
            {}
          } else {
            stryCov_9fa48("17701");
            setIsGenerating(stryMutAct_9fa48("17702") ? true : (stryCov_9fa48("17702"), false));
          }
        }
      }
    };
    const startEditingNote = (noteIndex, facilitatorNotes, dayIndex = null, taskIndex = null) => {
      if (stryMutAct_9fa48("17703")) {
        {}
      } else {
        stryCov_9fa48("17703");
        // Parse the note index for multi-day scenarios
        let actualDayIndex = dayIndex;
        let actualTaskIndex = taskIndex;
        if (stryMutAct_9fa48("17706") ? typeof noteIndex === 'string' || noteIndex.includes('-') : stryMutAct_9fa48("17705") ? false : stryMutAct_9fa48("17704") ? true : (stryCov_9fa48("17704", "17705", "17706"), (stryMutAct_9fa48("17708") ? typeof noteIndex !== 'string' : stryMutAct_9fa48("17707") ? true : (stryCov_9fa48("17707", "17708"), typeof noteIndex === (stryMutAct_9fa48("17709") ? "" : (stryCov_9fa48("17709"), 'string')))) && noteIndex.includes(stryMutAct_9fa48("17710") ? "" : (stryCov_9fa48("17710"), '-')))) {
          if (stryMutAct_9fa48("17711")) {
            {}
          } else {
            stryCov_9fa48("17711");
            const [dIdx, tIdx] = noteIndex.split(stryMutAct_9fa48("17712") ? "" : (stryCov_9fa48("17712"), '-')).map(Number);
            actualDayIndex = dIdx;
            actualTaskIndex = tIdx;
          }
        } else if (stryMutAct_9fa48("17715") ? typeof noteIndex !== 'number' : stryMutAct_9fa48("17714") ? false : stryMutAct_9fa48("17713") ? true : (stryCov_9fa48("17713", "17714", "17715"), typeof noteIndex === (stryMutAct_9fa48("17716") ? "" : (stryCov_9fa48("17716"), 'number')))) {
          if (stryMutAct_9fa48("17717")) {
            {}
          } else {
            stryCov_9fa48("17717");
            actualDayIndex = 0; // Single day
            actualTaskIndex = noteIndex;
          }
        }
        setEditingDayIndex(actualDayIndex);
        setEditingTaskIndex(actualTaskIndex);
        setEditingTask(facilitatorNotes);
        setIsEditModalOpen(stryMutAct_9fa48("17718") ? false : (stryCov_9fa48("17718"), true));
      }
    };
    const closeEditModal = () => {
      if (stryMutAct_9fa48("17719")) {
        {}
      } else {
        stryCov_9fa48("17719");
        setIsEditModalOpen(stryMutAct_9fa48("17720") ? true : (stryCov_9fa48("17720"), false));
        setEditingTask(null);
        setEditingDayIndex(null);
        setEditingTaskIndex(null);
        setEditingField(null);
        setEditingFieldValue(stryMutAct_9fa48("17721") ? "Stryker was here!" : (stryCov_9fa48("17721"), ''));
        setEditingFaqIndex(null);
      }
    };
    const startEditingField = (field, currentValue) => {
      if (stryMutAct_9fa48("17722")) {
        {}
      } else {
        stryCov_9fa48("17722");
        setEditingField(field);
        setEditingFieldValue(stryMutAct_9fa48("17725") ? currentValue && '' : stryMutAct_9fa48("17724") ? false : stryMutAct_9fa48("17723") ? true : (stryCov_9fa48("17723", "17724", "17725"), currentValue || (stryMutAct_9fa48("17726") ? "Stryker was here!" : (stryCov_9fa48("17726"), ''))));
      }
    };
    const saveEditedField = () => {
      if (stryMutAct_9fa48("17727")) {
        {}
      } else {
        stryCov_9fa48("17727");
        if (stryMutAct_9fa48("17730") ? !editingField && !editingTask : stryMutAct_9fa48("17729") ? false : stryMutAct_9fa48("17728") ? true : (stryCov_9fa48("17728", "17729", "17730"), (stryMutAct_9fa48("17731") ? editingField : (stryCov_9fa48("17731"), !editingField)) || (stryMutAct_9fa48("17732") ? editingTask : (stryCov_9fa48("17732"), !editingTask)))) return;
        const updatedTask = stryMutAct_9fa48("17733") ? {} : (stryCov_9fa48("17733"), {
          ...editingTask
        });
        if (stryMutAct_9fa48("17736") ? editingField.endsWith('faq-') : stryMutAct_9fa48("17735") ? false : stryMutAct_9fa48("17734") ? true : (stryCov_9fa48("17734", "17735", "17736"), editingField.startsWith(stryMutAct_9fa48("17737") ? "" : (stryCov_9fa48("17737"), 'faq-')))) {
          if (stryMutAct_9fa48("17738")) {
            {}
          } else {
            stryCov_9fa48("17738");
            // Handle FAQ editing
            const [, faqIndex, faqField] = editingField.split(stryMutAct_9fa48("17739") ? "" : (stryCov_9fa48("17739"), '-'));
            const faqIdx = parseInt(faqIndex);
            if (stryMutAct_9fa48("17742") ? false : stryMutAct_9fa48("17741") ? true : stryMutAct_9fa48("17740") ? updatedTask.faqs : (stryCov_9fa48("17740", "17741", "17742"), !updatedTask.faqs)) updatedTask.faqs = stryMutAct_9fa48("17743") ? ["Stryker was here"] : (stryCov_9fa48("17743"), []);
            if (stryMutAct_9fa48("17746") ? false : stryMutAct_9fa48("17745") ? true : stryMutAct_9fa48("17744") ? updatedTask.faqs[faqIdx] : (stryCov_9fa48("17744", "17745", "17746"), !updatedTask.faqs[faqIdx])) {
              if (stryMutAct_9fa48("17747")) {
                {}
              } else {
                stryCov_9fa48("17747");
                updatedTask.faqs[faqIdx] = stryMutAct_9fa48("17748") ? {} : (stryCov_9fa48("17748"), {
                  question: stryMutAct_9fa48("17749") ? "Stryker was here!" : (stryCov_9fa48("17749"), ''),
                  facilitator_response: stryMutAct_9fa48("17750") ? "Stryker was here!" : (stryCov_9fa48("17750"), ''),
                  follow_up_questions: stryMutAct_9fa48("17751") ? "Stryker was here!" : (stryCov_9fa48("17751"), '')
                });
              }
            }
            updatedTask.faqs[faqIdx][faqField] = editingFieldValue;
          }
        } else {
          if (stryMutAct_9fa48("17752")) {
            {}
          } else {
            stryCov_9fa48("17752");
            // Handle regular field editing
            updatedTask[editingField] = editingFieldValue;
          }
        }
        setEditingTask(updatedTask);
        setEditingField(null);
        setEditingFieldValue(stryMutAct_9fa48("17753") ? "Stryker was here!" : (stryCov_9fa48("17753"), ''));
      }
    };
    const cancelEditingField = () => {
      if (stryMutAct_9fa48("17754")) {
        {}
      } else {
        stryCov_9fa48("17754");
        setEditingField(null);
        setEditingFieldValue(stryMutAct_9fa48("17755") ? "Stryker was here!" : (stryCov_9fa48("17755"), ''));
      }
    };
    const addNewFaq = () => {
      if (stryMutAct_9fa48("17756")) {
        {}
      } else {
        stryCov_9fa48("17756");
        const updatedTask = stryMutAct_9fa48("17757") ? {} : (stryCov_9fa48("17757"), {
          ...editingTask
        });
        if (stryMutAct_9fa48("17760") ? false : stryMutAct_9fa48("17759") ? true : stryMutAct_9fa48("17758") ? updatedTask.faqs : (stryCov_9fa48("17758", "17759", "17760"), !updatedTask.faqs)) updatedTask.faqs = stryMutAct_9fa48("17761") ? ["Stryker was here"] : (stryCov_9fa48("17761"), []);
        updatedTask.faqs.push(stryMutAct_9fa48("17762") ? {} : (stryCov_9fa48("17762"), {
          question: stryMutAct_9fa48("17763") ? "" : (stryCov_9fa48("17763"), 'New question - click to edit'),
          facilitator_response: stryMutAct_9fa48("17764") ? "" : (stryCov_9fa48("17764"), 'Response guidance - click to edit'),
          follow_up_questions: stryMutAct_9fa48("17765") ? "" : (stryCov_9fa48("17765"), 'Follow-up questions - click to edit')
        }));
        setEditingTask(updatedTask);
      }
    };
    const deleteFaq = faqIndex => {
      if (stryMutAct_9fa48("17766")) {
        {}
      } else {
        stryCov_9fa48("17766");
        const updatedTask = stryMutAct_9fa48("17767") ? {} : (stryCov_9fa48("17767"), {
          ...editingTask
        });
        if (stryMutAct_9fa48("17770") ? updatedTask.faqs || updatedTask.faqs[faqIndex] !== undefined : stryMutAct_9fa48("17769") ? false : stryMutAct_9fa48("17768") ? true : (stryCov_9fa48("17768", "17769", "17770"), updatedTask.faqs && (stryMutAct_9fa48("17772") ? updatedTask.faqs[faqIndex] === undefined : stryMutAct_9fa48("17771") ? true : (stryCov_9fa48("17771", "17772"), updatedTask.faqs[faqIndex] !== undefined)))) {
          if (stryMutAct_9fa48("17773")) {
            {}
          } else {
            stryCov_9fa48("17773");
            updatedTask.faqs.splice(faqIndex, 1);
            setEditingTask(updatedTask);
          }
        }
      }
    };

    // Toggle day collapse/expand
    const toggleDayCollapse = dayIndex => {
      if (stryMutAct_9fa48("17774")) {
        {}
      } else {
        stryCov_9fa48("17774");
        const newCollapsedDays = new Set(collapsedDays);
        if (stryMutAct_9fa48("17776") ? false : stryMutAct_9fa48("17775") ? true : (stryCov_9fa48("17775", "17776"), newCollapsedDays.has(dayIndex))) {
          if (stryMutAct_9fa48("17777")) {
            {}
          } else {
            stryCov_9fa48("17777");
            newCollapsedDays.delete(dayIndex);
          }
        } else {
          if (stryMutAct_9fa48("17778")) {
            {}
          } else {
            stryCov_9fa48("17778");
            newCollapsedDays.add(dayIndex);
          }
        }
        setCollapsedDays(newCollapsedDays);
      }
    };

    // Toggle task collapse/expand
    const toggleTaskCollapse = (dayIndex, taskIndex) => {
      if (stryMutAct_9fa48("17779")) {
        {}
      } else {
        stryCov_9fa48("17779");
        const taskKey = stryMutAct_9fa48("17780") ? `` : (stryCov_9fa48("17780"), `${dayIndex}-${taskIndex}`);
        const newCollapsedTasks = new Set(collapsedTasks);
        if (stryMutAct_9fa48("17782") ? false : stryMutAct_9fa48("17781") ? true : (stryCov_9fa48("17781", "17782"), newCollapsedTasks.has(taskKey))) {
          if (stryMutAct_9fa48("17783")) {
            {}
          } else {
            stryCov_9fa48("17783");
            newCollapsedTasks.delete(taskKey);
          }
        } else {
          if (stryMutAct_9fa48("17784")) {
            {}
          } else {
            stryCov_9fa48("17784");
            newCollapsedTasks.add(taskKey);
          }
        }
        setCollapsedTasks(newCollapsedTasks);
      }
    };

    // Expand all days and tasks
    const expandAll = () => {
      if (stryMutAct_9fa48("17785")) {
        {}
      } else {
        stryCov_9fa48("17785");
        setCollapsedDays(new Set());
        setCollapsedTasks(new Set());
      }
    };

    // Collapse all days and tasks
    const collapseAll = () => {
      if (stryMutAct_9fa48("17786")) {
        {}
      } else {
        stryCov_9fa48("17786");
        if (stryMutAct_9fa48("17789") ? false : stryMutAct_9fa48("17788") ? true : stryMutAct_9fa48("17787") ? facilitatorNotes : (stryCov_9fa48("17787", "17788", "17789"), !facilitatorNotes)) return;
        const allDayIndices = new Set();
        const allTaskKeys = new Set();
        facilitatorNotes.days.forEach((day, dayIndex) => {
          if (stryMutAct_9fa48("17790")) {
            {}
          } else {
            stryCov_9fa48("17790");
            allDayIndices.add(dayIndex);
            day.tasks.forEach((task, taskIndex) => {
              if (stryMutAct_9fa48("17791")) {
                {}
              } else {
                stryCov_9fa48("17791");
                allTaskKeys.add(stryMutAct_9fa48("17792") ? `` : (stryCov_9fa48("17792"), `${dayIndex}-${taskIndex}`));
              }
            });
          }
        });
        setCollapsedDays(allDayIndices);
        setCollapsedTasks(allTaskKeys);
      }
    };
    const saveEditedNote = () => {
      if (stryMutAct_9fa48("17793")) {
        {}
      } else {
        stryCov_9fa48("17793");
        if (stryMutAct_9fa48("17796") ? (!editingTask || editingDayIndex === null || editingTaskIndex === null || !facilitatorNotes) && !sessionData : stryMutAct_9fa48("17795") ? false : stryMutAct_9fa48("17794") ? true : (stryCov_9fa48("17794", "17795", "17796"), (stryMutAct_9fa48("17798") ? (!editingTask || editingDayIndex === null || editingTaskIndex === null) && !facilitatorNotes : stryMutAct_9fa48("17797") ? false : (stryCov_9fa48("17797", "17798"), (stryMutAct_9fa48("17800") ? (!editingTask || editingDayIndex === null) && editingTaskIndex === null : stryMutAct_9fa48("17799") ? false : (stryCov_9fa48("17799", "17800"), (stryMutAct_9fa48("17802") ? !editingTask && editingDayIndex === null : stryMutAct_9fa48("17801") ? false : (stryCov_9fa48("17801", "17802"), (stryMutAct_9fa48("17803") ? editingTask : (stryCov_9fa48("17803"), !editingTask)) || (stryMutAct_9fa48("17805") ? editingDayIndex !== null : stryMutAct_9fa48("17804") ? false : (stryCov_9fa48("17804", "17805"), editingDayIndex === null)))) || (stryMutAct_9fa48("17807") ? editingTaskIndex !== null : stryMutAct_9fa48("17806") ? false : (stryCov_9fa48("17806", "17807"), editingTaskIndex === null)))) || (stryMutAct_9fa48("17808") ? facilitatorNotes : (stryCov_9fa48("17808"), !facilitatorNotes)))) || (stryMutAct_9fa48("17809") ? sessionData : (stryCov_9fa48("17809"), !sessionData)))) {
          if (stryMutAct_9fa48("17810")) {
            {}
          } else {
            stryCov_9fa48("17810");
            return;
          }
        }

        // Update the facilitator notes display
        const updatedNotes = stryMutAct_9fa48("17811") ? {} : (stryCov_9fa48("17811"), {
          ...facilitatorNotes
        });
        if (stryMutAct_9fa48("17813") ? false : stryMutAct_9fa48("17812") ? true : (stryCov_9fa48("17812", "17813"), facilitatorNotes.isMultiDay)) {
          if (stryMutAct_9fa48("17814")) {
            {}
          } else {
            stryCov_9fa48("17814");
            // Multi-day editing
            updatedNotes.days[editingDayIndex].tasks[editingTaskIndex].facilitator_notes = editingTask;

            // Update the embedded facilitator notes in session data
            const updatedSessionData = stryMutAct_9fa48("17815") ? [] : (stryCov_9fa48("17815"), [...sessionData]);
            if (stryMutAct_9fa48("17818") ? updatedSessionData[editingDayIndex] && updatedSessionData[editingDayIndex].time_blocks || updatedSessionData[editingDayIndex].time_blocks[editingTaskIndex] : stryMutAct_9fa48("17817") ? false : stryMutAct_9fa48("17816") ? true : (stryCov_9fa48("17816", "17817", "17818"), (stryMutAct_9fa48("17820") ? updatedSessionData[editingDayIndex] || updatedSessionData[editingDayIndex].time_blocks : stryMutAct_9fa48("17819") ? true : (stryCov_9fa48("17819", "17820"), updatedSessionData[editingDayIndex] && updatedSessionData[editingDayIndex].time_blocks)) && updatedSessionData[editingDayIndex].time_blocks[editingTaskIndex])) {
              if (stryMutAct_9fa48("17821")) {
                {}
              } else {
                stryCov_9fa48("17821");
                updatedSessionData[editingDayIndex].time_blocks[editingTaskIndex].task.facilitator_notes = editingTask;
              }
            }
            setSessionData(updatedSessionData);

            // Update shared data and sessionStorage
            const updatedJsonString = JSON.stringify(updatedSessionData, null, 2);
            sessionStorage.setItem(stryMutAct_9fa48("17822") ? "" : (stryCov_9fa48("17822"), 'generatedSessionData'), updatedJsonString);
            updateSharedData(stryMutAct_9fa48("17823") ? {} : (stryCov_9fa48("17823"), {
              editedJSON: updatedJsonString,
              generatedJSON: updatedJsonString
            }));
          }
        } else {
          if (stryMutAct_9fa48("17824")) {
            {}
          } else {
            stryCov_9fa48("17824");
            // Single day editing
            updatedNotes.days[0].tasks[editingTaskIndex].facilitator_notes = editingTask;

            // Update the embedded facilitator notes in session data
            const updatedSessionData = Array.isArray(sessionData) ? stryMutAct_9fa48("17825") ? [] : (stryCov_9fa48("17825"), [...sessionData]) : stryMutAct_9fa48("17826") ? {} : (stryCov_9fa48("17826"), {
              ...sessionData
            });
            const firstDay = Array.isArray(updatedSessionData) ? updatedSessionData[0] : updatedSessionData;
            if (stryMutAct_9fa48("17829") ? firstDay && firstDay.time_blocks || firstDay.time_blocks[editingTaskIndex] : stryMutAct_9fa48("17828") ? false : stryMutAct_9fa48("17827") ? true : (stryCov_9fa48("17827", "17828", "17829"), (stryMutAct_9fa48("17831") ? firstDay || firstDay.time_blocks : stryMutAct_9fa48("17830") ? true : (stryCov_9fa48("17830", "17831"), firstDay && firstDay.time_blocks)) && firstDay.time_blocks[editingTaskIndex])) {
              if (stryMutAct_9fa48("17832")) {
                {}
              } else {
                stryCov_9fa48("17832");
                firstDay.time_blocks[editingTaskIndex].task.facilitator_notes = editingTask;

                // Update session data state
                setSessionData(updatedSessionData);

                // Update shared data and sessionStorage
                const updatedJsonString = JSON.stringify(updatedSessionData, null, 2);
                sessionStorage.setItem(stryMutAct_9fa48("17833") ? "" : (stryCov_9fa48("17833"), 'generatedSessionData'), updatedJsonString);
                updateSharedData(stryMutAct_9fa48("17834") ? {} : (stryCov_9fa48("17834"), {
                  editedJSON: updatedJsonString,
                  generatedJSON: updatedJsonString
                }));
              }
            }
          }
        }
        setFacilitatorNotes(updatedNotes);
        closeEditModal();
      }
    };
    const handleDownloadNotes = () => {
      if (stryMutAct_9fa48("17835")) {
        {}
      } else {
        stryCov_9fa48("17835");
        if (stryMutAct_9fa48("17838") ? false : stryMutAct_9fa48("17837") ? true : stryMutAct_9fa48("17836") ? sessionData : (stryCov_9fa48("17836", "17837", "17838"), !sessionData)) return;

        // Download the complete session data with embedded facilitator notes
        const dataStr = JSON.stringify(sessionData, null, 2);
        const blob = new Blob(stryMutAct_9fa48("17839") ? [] : (stryCov_9fa48("17839"), [dataStr]), stryMutAct_9fa48("17840") ? {} : (stryCov_9fa48("17840"), {
          type: stryMutAct_9fa48("17841") ? "" : (stryCov_9fa48("17841"), 'application/json')
        }));
        const url = URL.createObjectURL(blob);
        const link = document.createElement(stryMutAct_9fa48("17842") ? "" : (stryCov_9fa48("17842"), 'a'));
        link.href = url;

        // Generate filename based on session data
        const isMultiDay = Array.isArray(sessionData);
        const firstDay = isMultiDay ? sessionData[0] : sessionData;
        const dayNumber = stryMutAct_9fa48("17845") ? firstDay?.day_number && 'unknown' : stryMutAct_9fa48("17844") ? false : stryMutAct_9fa48("17843") ? true : (stryCov_9fa48("17843", "17844", "17845"), (stryMutAct_9fa48("17846") ? firstDay.day_number : (stryCov_9fa48("17846"), firstDay?.day_number)) || (stryMutAct_9fa48("17847") ? "" : (stryCov_9fa48("17847"), 'unknown')));
        const cohort = stryMutAct_9fa48("17850") ? firstDay?.cohort?.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase() && 'cohort' : stryMutAct_9fa48("17849") ? false : stryMutAct_9fa48("17848") ? true : (stryCov_9fa48("17848", "17849", "17850"), (stryMutAct_9fa48("17853") ? firstDay.cohort?.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase() : stryMutAct_9fa48("17852") ? firstDay?.cohort.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase() : stryMutAct_9fa48("17851") ? firstDay?.cohort?.replace(/[^a-zA-Z0-9]/g, '-').toUpperCase() : (stryCov_9fa48("17851", "17852", "17853"), firstDay?.cohort?.replace(stryMutAct_9fa48("17854") ? /[a-zA-Z0-9]/g : (stryCov_9fa48("17854"), /[^a-zA-Z0-9]/g), stryMutAct_9fa48("17855") ? "" : (stryCov_9fa48("17855"), '-')).toLowerCase())) || (stryMutAct_9fa48("17856") ? "" : (stryCov_9fa48("17856"), 'cohort')));
        link.download = stryMutAct_9fa48("17857") ? `` : (stryCov_9fa48("17857"), `${cohort}-day${dayNumber}-with-facilitator-notes.json`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    };
    const handleDownloadNotesOnly = () => {
      if (stryMutAct_9fa48("17858")) {
        {}
      } else {
        stryCov_9fa48("17858");
        if (stryMutAct_9fa48("17861") ? false : stryMutAct_9fa48("17860") ? true : stryMutAct_9fa48("17859") ? facilitatorNotes : (stryCov_9fa48("17859", "17860", "17861"), !facilitatorNotes)) return;

        // Download just the facilitator notes
        const dataStr = JSON.stringify(facilitatorNotes, null, 2);
        const blob = new Blob(stryMutAct_9fa48("17862") ? [] : (stryCov_9fa48("17862"), [dataStr]), stryMutAct_9fa48("17863") ? {} : (stryCov_9fa48("17863"), {
          type: stryMutAct_9fa48("17864") ? "" : (stryCov_9fa48("17864"), 'application/json')
        }));
        const url = URL.createObjectURL(blob);
        const link = document.createElement(stryMutAct_9fa48("17865") ? "" : (stryCov_9fa48("17865"), 'a'));
        link.href = url;

        // Generate filename based on session data
        const isMultiDay = Array.isArray(sessionData);
        const firstDay = isMultiDay ? sessionData[0] : sessionData;
        const dayNumber = stryMutAct_9fa48("17868") ? firstDay?.day_number && 'unknown' : stryMutAct_9fa48("17867") ? false : stryMutAct_9fa48("17866") ? true : (stryCov_9fa48("17866", "17867", "17868"), (stryMutAct_9fa48("17869") ? firstDay.day_number : (stryCov_9fa48("17869"), firstDay?.day_number)) || (stryMutAct_9fa48("17870") ? "" : (stryCov_9fa48("17870"), 'unknown')));
        const cohort = stryMutAct_9fa48("17873") ? firstDay?.cohort?.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase() && 'cohort' : stryMutAct_9fa48("17872") ? false : stryMutAct_9fa48("17871") ? true : (stryCov_9fa48("17871", "17872", "17873"), (stryMutAct_9fa48("17876") ? firstDay.cohort?.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase() : stryMutAct_9fa48("17875") ? firstDay?.cohort.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase() : stryMutAct_9fa48("17874") ? firstDay?.cohort?.replace(/[^a-zA-Z0-9]/g, '-').toUpperCase() : (stryCov_9fa48("17874", "17875", "17876"), firstDay?.cohort?.replace(stryMutAct_9fa48("17877") ? /[a-zA-Z0-9]/g : (stryCov_9fa48("17877"), /[^a-zA-Z0-9]/g), stryMutAct_9fa48("17878") ? "" : (stryCov_9fa48("17878"), '-')).toLowerCase())) || (stryMutAct_9fa48("17879") ? "" : (stryCov_9fa48("17879"), 'cohort')));
        link.download = stryMutAct_9fa48("17880") ? `` : (stryCov_9fa48("17880"), `${cohort}-day${dayNumber}-facilitator-notes-only.json`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    };
    const openReferenceModal = () => {
      if (stryMutAct_9fa48("17881")) {
        {}
      } else {
        stryCov_9fa48("17881");
        setIsModalOpen(stryMutAct_9fa48("17882") ? false : (stryCov_9fa48("17882"), true));
      }
    };
    const closeReferenceModal = () => {
      if (stryMutAct_9fa48("17883")) {
        {}
      } else {
        stryCov_9fa48("17883");
        setIsModalOpen(stryMutAct_9fa48("17884") ? true : (stryCov_9fa48("17884"), false));
      }
    };
    return <div className="facilitator-notes-generator">
      <div className="facilitator-notes-generator__header">
        <h2>Phase 3: Facilitator Notes Generator</h2>
        <p>Generate AI-powered facilitation guidance for your finalized session content</p>
      </div>

      {/* Status indicators */}
      <div className="facilitator-notes-generator__status">
        <div className={stryMutAct_9fa48("17885") ? `` : (stryCov_9fa48("17885"), `status-indicator ${originalContent ? stryMutAct_9fa48("17886") ? "" : (stryCov_9fa48("17886"), 'status-indicator--complete') : stryMutAct_9fa48("17887") ? "" : (stryCov_9fa48("17887"), 'status-indicator--incomplete')}`)}>
          <div className="status-indicator__icon">
            {originalContent ? stryMutAct_9fa48("17888") ? "" : (stryCov_9fa48("17888"), '✓') : stryMutAct_9fa48("17889") ? "" : (stryCov_9fa48("17889"), '!')}
          </div>
          <div className="status-indicator__text">
            <div className="status-indicator__label">Original Content</div>
            <div className="status-indicator__description">
              {originalContent ? stryMutAct_9fa48("17890") ? "" : (stryCov_9fa48("17890"), 'Source material loaded and ready') : stryMutAct_9fa48("17891") ? "" : (stryCov_9fa48("17891"), 'Complete Phase 1 (JSON Generator) first')}
            </div>
          </div>
        </div>
        <div className={stryMutAct_9fa48("17892") ? `` : (stryCov_9fa48("17892"), `status-indicator ${sessionData ? stryMutAct_9fa48("17893") ? "" : (stryCov_9fa48("17893"), 'status-indicator--complete') : stryMutAct_9fa48("17894") ? "" : (stryCov_9fa48("17894"), 'status-indicator--incomplete')}`)}>
          <div className="status-indicator__icon">
            {sessionData ? stryMutAct_9fa48("17895") ? "" : (stryCov_9fa48("17895"), '✓') : stryMutAct_9fa48("17896") ? "" : (stryCov_9fa48("17896"), '!')}
          </div>
          <div className="status-indicator__text">
            <div className="status-indicator__label">Session Data</div>
            <div className="status-indicator__description">
              {sessionData ? stryMutAct_9fa48("17897") ? "" : (stryCov_9fa48("17897"), 'Finalized JSON ready for processing') : stryMutAct_9fa48("17898") ? "" : (stryCov_9fa48("17898"), 'Complete Phase 2 (Session Tester) first')}
            </div>
          </div>
        </div>
      </div>

      {stryMutAct_9fa48("17901") ? error || <div className="facilitator-notes-generator__error">
          {error}
        </div> : stryMutAct_9fa48("17900") ? false : stryMutAct_9fa48("17899") ? true : (stryCov_9fa48("17899", "17900", "17901"), error && <div className="facilitator-notes-generator__error">
          {error}
        </div>)}

      {/* Generate button */}
      {stryMutAct_9fa48("17904") ? !facilitatorNotes || <div className="facilitator-notes-generator__generate-section">
          <button onClick={handleGenerateFacilitatorNotes} disabled={isGenerating || !sessionData} className="facilitator-notes-generator__generate-btn">
            {isGenerating ? <>
                <FaSpinner className="spinning" />
                Generating Facilitator Notes...
              </> : <>
                <FaFileAlt />
                {hasFacilitatorNotes() ? 'Regenerate Facilitator Notes' : 'Generate Facilitator Notes'}
              </>}
          </button>
          {!sessionData && <p className="facilitator-notes-generator__help">
              Complete Phase 1 (JSON Generator) and Phase 2 (Session Tester) first
            </p>}
          {sessionData && hasFacilitatorNotes() && <p className="facilitator-notes-generator__help">
              Facilitator notes already exist in your session data. Click to regenerate or view them below.
            </p>}
        </div> : stryMutAct_9fa48("17903") ? false : stryMutAct_9fa48("17902") ? true : (stryCov_9fa48("17902", "17903", "17904"), (stryMutAct_9fa48("17905") ? facilitatorNotes : (stryCov_9fa48("17905"), !facilitatorNotes)) && <div className="facilitator-notes-generator__generate-section">
          <button onClick={handleGenerateFacilitatorNotes} disabled={stryMutAct_9fa48("17908") ? isGenerating && !sessionData : stryMutAct_9fa48("17907") ? false : stryMutAct_9fa48("17906") ? true : (stryCov_9fa48("17906", "17907", "17908"), isGenerating || (stryMutAct_9fa48("17909") ? sessionData : (stryCov_9fa48("17909"), !sessionData)))} className="facilitator-notes-generator__generate-btn">
            {isGenerating ? <>
                <FaSpinner className="spinning" />
                Generating Facilitator Notes...
              </> : <>
                <FaFileAlt />
                {hasFacilitatorNotes() ? stryMutAct_9fa48("17910") ? "" : (stryCov_9fa48("17910"), 'Regenerate Facilitator Notes') : stryMutAct_9fa48("17911") ? "" : (stryCov_9fa48("17911"), 'Generate Facilitator Notes')}
              </>}
          </button>
          {stryMutAct_9fa48("17914") ? !sessionData || <p className="facilitator-notes-generator__help">
              Complete Phase 1 (JSON Generator) and Phase 2 (Session Tester) first
            </p> : stryMutAct_9fa48("17913") ? false : stryMutAct_9fa48("17912") ? true : (stryCov_9fa48("17912", "17913", "17914"), (stryMutAct_9fa48("17915") ? sessionData : (stryCov_9fa48("17915"), !sessionData)) && <p className="facilitator-notes-generator__help">
              Complete Phase 1 (JSON Generator) and Phase 2 (Session Tester) first
            </p>)}
          {stryMutAct_9fa48("17918") ? sessionData && hasFacilitatorNotes() || <p className="facilitator-notes-generator__help">
              Facilitator notes already exist in your session data. Click to regenerate or view them below.
            </p> : stryMutAct_9fa48("17917") ? false : stryMutAct_9fa48("17916") ? true : (stryCov_9fa48("17916", "17917", "17918"), (stryMutAct_9fa48("17920") ? sessionData || hasFacilitatorNotes() : stryMutAct_9fa48("17919") ? true : (stryCov_9fa48("17919", "17920"), sessionData && hasFacilitatorNotes())) && <p className="facilitator-notes-generator__help">
              Facilitator notes already exist in your session data. Click to regenerate or view them below.
            </p>)}
        </div>)}

      {/* Generated notes */}
      {stryMutAct_9fa48("17923") ? facilitatorNotes || <div className="facilitator-notes-generator__content">
          <div className="facilitator-notes-generator__toolbar">
            <h3>Facilitator Notes {Array.isArray(sessionData) ? `(${sessionData.length} Days)` : `for Day ${sessionData?.day_number || 'Unknown'}`}</h3>
            <div className="facilitator-notes-generator__actions">
              <button onClick={handleGenerateFacilitatorNotes} disabled={isGenerating} className="facilitator-notes-generator__action-btn" title="Regenerate facilitator notes">
                {isGenerating ? <FaSpinner className="spinning" /> : <FaFileAlt />}
                Regenerate
              </button>
              <button onClick={openReferenceModal} className="facilitator-notes-generator__action-btn">
                <FaExpand />
                View Session Reference
              </button>
              <button onClick={handleDownloadNotes} className="facilitator-notes-generator__action-btn">
                <FaDownload />
                Download Complete JSON
              </button>
              <button onClick={handleDownloadNotesOnly} className="facilitator-notes-generator__action-btn">
                <FaFileAlt />
                Download Notes Only
              </button>
              <div className="facilitator-notes-generator__collapse-controls">
                <button onClick={expandAll} className="facilitator-notes-generator__action-btn facilitator-notes-generator__action-btn--small" title="Expand all sections">
                  <FaExpandArrowsAlt />
                  Expand All
                </button>
                <button onClick={collapseAll} className="facilitator-notes-generator__action-btn facilitator-notes-generator__action-btn--small" title="Collapse all sections">
                  <FaCompressArrowsAlt />
                  Collapse All
                </button>
              </div>
            </div>
          </div>

          <div className="facilitator-notes-generator__notes">
            {/* Multi-day or single day display */}
            {facilitatorNotes.isMultiDay ? <div className="facilitator-notes-generator__multi-day">
                {facilitatorNotes.days.map((day, dayIndex) => <div key={dayIndex} className="facilitator-notes-generator__day-section">
                    <div className="facilitator-notes-generator__day-header facilitator-notes-generator__day-header--clickable" onClick={() => toggleDayCollapse(dayIndex)}>
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
                    
                    {!collapsedDays.has(dayIndex) && <div className="facilitator-notes-generator__day-tasks">
                        {day.tasks.map((task, taskIndex) => {
                  const taskKey = `${dayIndex}-${taskIndex}`;
                  const isTaskCollapsed = collapsedTasks.has(taskKey);
                  return <div key={`${dayIndex}-${taskIndex}`} className="facilitator-notes-generator__task">
                              <div className="facilitator-notes-generator__task-header facilitator-notes-generator__task-header--clickable" onClick={() => toggleTaskCollapse(dayIndex, taskIndex)}>
                                <div className="facilitator-notes-generator__task-title-section">
                                  {isTaskCollapsed ? <FaChevronRight /> : <FaChevronDown />}
                                  <h5>{task.task_title}</h5>
                                </div>
                                <div className="facilitator-notes-generator__task-meta">
                                  <span className="time">{task.start_time} - {task.end_time}</span>
                                  <button onClick={e => {
                          e.stopPropagation();
                          startEditingNote(`${dayIndex}-${taskIndex}`, task.facilitator_notes, dayIndex, taskIndex);
                        }} className="facilitator-notes-generator__edit-btn" title="Edit facilitator notes">
                                    <FaEdit />
                                  </button>
                                </div>
                              </div>
                              
                              {!isTaskCollapsed && <div className="facilitator-notes-generator__task-content">
                                  <div className="facilitator-notes-generator__note-text">
                                    {typeof task.facilitator_notes === 'string' ? <p>{task.facilitator_notes}</p> : <div className="facilitator-notes-generator__structured-notes">
                                        {Object.entries(task.facilitator_notes || {}).map(([category, content]) => <div key={category} className="facilitator-notes-generator__note-section">
                                            <h6>{category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h6>
                                            {category === 'faqs' ? <div className="facilitator-notes-generator__faqs">
                                                {Array.isArray(content) ? content.map((faq, faqIndex) => <div key={faqIndex} className="facilitator-notes-generator__faq">
                                                    <div className="facilitator-notes-generator__faq-question">
                                                      <strong>Q: {faq.question}</strong>
                                                    </div>
                                                    <div className="facilitator-notes-generator__faq-response">
                                                      <strong>A: </strong>{faq.facilitator_response}
                                                    </div>
                                                    {faq.follow_up_questions && <div className="facilitator-notes-generator__faq-followup">
                                                        <strong>Follow-up: </strong>{faq.follow_up_questions}
                                                      </div>}
                                                  </div>) : <p>No FAQs available</p>}
                                              </div> : <p>{typeof content === 'string' ? content : JSON.stringify(content)}</p>}
                                          </div>)}
                                      </div>}
                                  </div>
                                </div>}
                            </div>;
                })}
                      </div>}
                  </div>)}
              </div> : <div className="facilitator-notes-generator__single-day">
                {/* Single day display */}
                {facilitatorNotes.days && facilitatorNotes.days[0] && <>
                    <div className="facilitator-notes-generator__daily-goal">
                      <h4>Daily Goal</h4>
                      <p>{facilitatorNotes.days[0].dailyGoal}</p>
                    </div>

                    <div className="facilitator-notes-generator__tasks">
                      <h4>Task-by-Task Facilitation Guidance</h4>
                      
                      {facilitatorNotes.days[0].tasks.map((task, index) => {
                  const taskKey = `0-${index}`;
                  const isTaskCollapsed = collapsedTasks.has(taskKey);
                  return <div key={index} className="facilitator-notes-generator__task">
                            <div className="facilitator-notes-generator__task-header facilitator-notes-generator__task-header--clickable" onClick={() => toggleTaskCollapse(0, index)}>
                              <div className="facilitator-notes-generator__task-title-section">
                                {isTaskCollapsed ? <FaChevronRight /> : <FaChevronDown />}
                                <h5>{task.task_title}</h5>
                              </div>
                              <div className="facilitator-notes-generator__task-meta">
                                <span className="time">{task.start_time} - {task.end_time}</span>
                                <button onClick={e => {
                          e.stopPropagation();
                          startEditingNote(index, task.facilitator_notes, 0, index);
                        }} className="facilitator-notes-generator__edit-btn" title="Edit facilitator notes">
                                  <FaEdit />
                                </button>
                              </div>
                            </div>
                            
                            {!isTaskCollapsed && <div className="facilitator-notes-generator__task-content">
                                <div className="facilitator-notes-generator__note-text">
                                  {typeof task.facilitator_notes === 'string' ? <p>{task.facilitator_notes}</p> : <div className="facilitator-notes-generator__structured-notes">
                                      {Object.entries(task.facilitator_notes || {}).map(([category, content]) => <div key={category} className="facilitator-notes-generator__note-section">
                                          <h6>{category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h6>
                                          {category === 'faqs' ? <div className="facilitator-notes-generator__faqs">
                                              {Array.isArray(content) ? content.map((faq, faqIndex) => <div key={faqIndex} className="facilitator-notes-generator__faq">
                                                  <div className="facilitator-notes-generator__faq-question">
                                                    <strong>Q: {faq.question}</strong>
                                                  </div>
                                                  <div className="facilitator-notes-generator__faq-response">
                                                    <strong>A: </strong>{faq.facilitator_response}
                                                  </div>
                                                  {faq.follow_up_questions && <div className="facilitator-notes-generator__faq-followup">
                                                      <strong>Follow-up: </strong>{faq.follow_up_questions}
                                                    </div>}
                                                </div>) : <p>No FAQs available</p>}
                                            </div> : <p>{typeof content === 'string' ? content : JSON.stringify(content)}</p>}
                                        </div>)}
                                    </div>}
                                </div>
                              </div>}
                          </div>;
                })}
                    </div>
                  </>}
              </div>}
          </div>
        </div> : stryMutAct_9fa48("17922") ? false : stryMutAct_9fa48("17921") ? true : (stryCov_9fa48("17921", "17922", "17923"), facilitatorNotes && <div className="facilitator-notes-generator__content">
          <div className="facilitator-notes-generator__toolbar">
            <h3>Facilitator Notes {Array.isArray(sessionData) ? stryMutAct_9fa48("17924") ? `` : (stryCov_9fa48("17924"), `(${sessionData.length} Days)`) : stryMutAct_9fa48("17925") ? `` : (stryCov_9fa48("17925"), `for Day ${stryMutAct_9fa48("17928") ? sessionData?.day_number && 'Unknown' : stryMutAct_9fa48("17927") ? false : stryMutAct_9fa48("17926") ? true : (stryCov_9fa48("17926", "17927", "17928"), (stryMutAct_9fa48("17929") ? sessionData.day_number : (stryCov_9fa48("17929"), sessionData?.day_number)) || (stryMutAct_9fa48("17930") ? "" : (stryCov_9fa48("17930"), 'Unknown')))}`)}</h3>
            <div className="facilitator-notes-generator__actions">
              <button onClick={handleGenerateFacilitatorNotes} disabled={isGenerating} className="facilitator-notes-generator__action-btn" title="Regenerate facilitator notes">
                {isGenerating ? <FaSpinner className="spinning" /> : <FaFileAlt />}
                Regenerate
              </button>
              <button onClick={openReferenceModal} className="facilitator-notes-generator__action-btn">
                <FaExpand />
                View Session Reference
              </button>
              <button onClick={handleDownloadNotes} className="facilitator-notes-generator__action-btn">
                <FaDownload />
                Download Complete JSON
              </button>
              <button onClick={handleDownloadNotesOnly} className="facilitator-notes-generator__action-btn">
                <FaFileAlt />
                Download Notes Only
              </button>
              <div className="facilitator-notes-generator__collapse-controls">
                <button onClick={expandAll} className="facilitator-notes-generator__action-btn facilitator-notes-generator__action-btn--small" title="Expand all sections">
                  <FaExpandArrowsAlt />
                  Expand All
                </button>
                <button onClick={collapseAll} className="facilitator-notes-generator__action-btn facilitator-notes-generator__action-btn--small" title="Collapse all sections">
                  <FaCompressArrowsAlt />
                  Collapse All
                </button>
              </div>
            </div>
          </div>

          <div className="facilitator-notes-generator__notes">
            {/* Multi-day or single day display */}
            {facilitatorNotes.isMultiDay ? <div className="facilitator-notes-generator__multi-day">
                {facilitatorNotes.days.map(stryMutAct_9fa48("17931") ? () => undefined : (stryCov_9fa48("17931"), (day, dayIndex) => <div key={dayIndex} className="facilitator-notes-generator__day-section">
                    <div className="facilitator-notes-generator__day-header facilitator-notes-generator__day-header--clickable" onClick={stryMutAct_9fa48("17932") ? () => undefined : (stryCov_9fa48("17932"), () => toggleDayCollapse(dayIndex))}>
                      <div className="facilitator-notes-generator__day-header-content">
                        <div className="facilitator-notes-generator__day-title">
                          {collapsedDays.has(dayIndex) ? <FaChevronRight /> : <FaChevronDown />}
                          <h4>Day {day.dayNumber} - {day.dailyGoal}</h4>
                        </div>
                        <div className="facilitator-notes-generator__day-meta">
                          <span>{day.date}</span>
                          <span>{day.cohort}</span>
                          <span className="facilitator-notes-generator__task-count">
                            {day.tasks.length} task{(stryMutAct_9fa48("17935") ? day.tasks.length === 1 : stryMutAct_9fa48("17934") ? false : stryMutAct_9fa48("17933") ? true : (stryCov_9fa48("17933", "17934", "17935"), day.tasks.length !== 1)) ? stryMutAct_9fa48("17936") ? "" : (stryCov_9fa48("17936"), 's') : stryMutAct_9fa48("17937") ? "Stryker was here!" : (stryCov_9fa48("17937"), '')}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {stryMutAct_9fa48("17940") ? !collapsedDays.has(dayIndex) || <div className="facilitator-notes-generator__day-tasks">
                        {day.tasks.map((task, taskIndex) => {
                  const taskKey = `${dayIndex}-${taskIndex}`;
                  const isTaskCollapsed = collapsedTasks.has(taskKey);
                  return <div key={`${dayIndex}-${taskIndex}`} className="facilitator-notes-generator__task">
                              <div className="facilitator-notes-generator__task-header facilitator-notes-generator__task-header--clickable" onClick={() => toggleTaskCollapse(dayIndex, taskIndex)}>
                                <div className="facilitator-notes-generator__task-title-section">
                                  {isTaskCollapsed ? <FaChevronRight /> : <FaChevronDown />}
                                  <h5>{task.task_title}</h5>
                                </div>
                                <div className="facilitator-notes-generator__task-meta">
                                  <span className="time">{task.start_time} - {task.end_time}</span>
                                  <button onClick={e => {
                          e.stopPropagation();
                          startEditingNote(`${dayIndex}-${taskIndex}`, task.facilitator_notes, dayIndex, taskIndex);
                        }} className="facilitator-notes-generator__edit-btn" title="Edit facilitator notes">
                                    <FaEdit />
                                  </button>
                                </div>
                              </div>
                              
                              {!isTaskCollapsed && <div className="facilitator-notes-generator__task-content">
                                  <div className="facilitator-notes-generator__note-text">
                                    {typeof task.facilitator_notes === 'string' ? <p>{task.facilitator_notes}</p> : <div className="facilitator-notes-generator__structured-notes">
                                        {Object.entries(task.facilitator_notes || {}).map(([category, content]) => <div key={category} className="facilitator-notes-generator__note-section">
                                            <h6>{category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h6>
                                            {category === 'faqs' ? <div className="facilitator-notes-generator__faqs">
                                                {Array.isArray(content) ? content.map((faq, faqIndex) => <div key={faqIndex} className="facilitator-notes-generator__faq">
                                                    <div className="facilitator-notes-generator__faq-question">
                                                      <strong>Q: {faq.question}</strong>
                                                    </div>
                                                    <div className="facilitator-notes-generator__faq-response">
                                                      <strong>A: </strong>{faq.facilitator_response}
                                                    </div>
                                                    {faq.follow_up_questions && <div className="facilitator-notes-generator__faq-followup">
                                                        <strong>Follow-up: </strong>{faq.follow_up_questions}
                                                      </div>}
                                                  </div>) : <p>No FAQs available</p>}
                                              </div> : <p>{typeof content === 'string' ? content : JSON.stringify(content)}</p>}
                                          </div>)}
                                      </div>}
                                  </div>
                                </div>}
                            </div>;
                })}
                      </div> : stryMutAct_9fa48("17939") ? false : stryMutAct_9fa48("17938") ? true : (stryCov_9fa48("17938", "17939", "17940"), (stryMutAct_9fa48("17941") ? collapsedDays.has(dayIndex) : (stryCov_9fa48("17941"), !collapsedDays.has(dayIndex))) && <div className="facilitator-notes-generator__day-tasks">
                        {day.tasks.map((task, taskIndex) => {
                  if (stryMutAct_9fa48("17942")) {
                    {}
                  } else {
                    stryCov_9fa48("17942");
                    const taskKey = stryMutAct_9fa48("17943") ? `` : (stryCov_9fa48("17943"), `${dayIndex}-${taskIndex}`);
                    const isTaskCollapsed = collapsedTasks.has(taskKey);
                    return <div key={stryMutAct_9fa48("17944") ? `` : (stryCov_9fa48("17944"), `${dayIndex}-${taskIndex}`)} className="facilitator-notes-generator__task">
                              <div className="facilitator-notes-generator__task-header facilitator-notes-generator__task-header--clickable" onClick={stryMutAct_9fa48("17945") ? () => undefined : (stryCov_9fa48("17945"), () => toggleTaskCollapse(dayIndex, taskIndex))}>
                                <div className="facilitator-notes-generator__task-title-section">
                                  {isTaskCollapsed ? <FaChevronRight /> : <FaChevronDown />}
                                  <h5>{task.task_title}</h5>
                                </div>
                                <div className="facilitator-notes-generator__task-meta">
                                  <span className="time">{task.start_time} - {task.end_time}</span>
                                  <button onClick={e => {
                            if (stryMutAct_9fa48("17946")) {
                              {}
                            } else {
                              stryCov_9fa48("17946");
                              e.stopPropagation();
                              startEditingNote(stryMutAct_9fa48("17947") ? `` : (stryCov_9fa48("17947"), `${dayIndex}-${taskIndex}`), task.facilitator_notes, dayIndex, taskIndex);
                            }
                          }} className="facilitator-notes-generator__edit-btn" title="Edit facilitator notes">
                                    <FaEdit />
                                  </button>
                                </div>
                              </div>
                              
                              {stryMutAct_9fa48("17950") ? !isTaskCollapsed || <div className="facilitator-notes-generator__task-content">
                                  <div className="facilitator-notes-generator__note-text">
                                    {typeof task.facilitator_notes === 'string' ? <p>{task.facilitator_notes}</p> : <div className="facilitator-notes-generator__structured-notes">
                                        {Object.entries(task.facilitator_notes || {}).map(([category, content]) => <div key={category} className="facilitator-notes-generator__note-section">
                                            <h6>{category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h6>
                                            {category === 'faqs' ? <div className="facilitator-notes-generator__faqs">
                                                {Array.isArray(content) ? content.map((faq, faqIndex) => <div key={faqIndex} className="facilitator-notes-generator__faq">
                                                    <div className="facilitator-notes-generator__faq-question">
                                                      <strong>Q: {faq.question}</strong>
                                                    </div>
                                                    <div className="facilitator-notes-generator__faq-response">
                                                      <strong>A: </strong>{faq.facilitator_response}
                                                    </div>
                                                    {faq.follow_up_questions && <div className="facilitator-notes-generator__faq-followup">
                                                        <strong>Follow-up: </strong>{faq.follow_up_questions}
                                                      </div>}
                                                  </div>) : <p>No FAQs available</p>}
                                              </div> : <p>{typeof content === 'string' ? content : JSON.stringify(content)}</p>}
                                          </div>)}
                                      </div>}
                                  </div>
                                </div> : stryMutAct_9fa48("17949") ? false : stryMutAct_9fa48("17948") ? true : (stryCov_9fa48("17948", "17949", "17950"), (stryMutAct_9fa48("17951") ? isTaskCollapsed : (stryCov_9fa48("17951"), !isTaskCollapsed)) && <div className="facilitator-notes-generator__task-content">
                                  <div className="facilitator-notes-generator__note-text">
                                    {(stryMutAct_9fa48("17954") ? typeof task.facilitator_notes !== 'string' : stryMutAct_9fa48("17953") ? false : stryMutAct_9fa48("17952") ? true : (stryCov_9fa48("17952", "17953", "17954"), typeof task.facilitator_notes === (stryMutAct_9fa48("17955") ? "" : (stryCov_9fa48("17955"), 'string')))) ? <p>{task.facilitator_notes}</p> : <div className="facilitator-notes-generator__structured-notes">
                                        {Object.entries(stryMutAct_9fa48("17958") ? task.facilitator_notes && {} : stryMutAct_9fa48("17957") ? false : stryMutAct_9fa48("17956") ? true : (stryCov_9fa48("17956", "17957", "17958"), task.facilitator_notes || {})).map(stryMutAct_9fa48("17959") ? () => undefined : (stryCov_9fa48("17959"), ([category, content]) => <div key={category} className="facilitator-notes-generator__note-section">
                                            <h6>{category.replace(/_/g, stryMutAct_9fa48("17960") ? "" : (stryCov_9fa48("17960"), ' ')).replace(stryMutAct_9fa48("17961") ? /\b\W/g : (stryCov_9fa48("17961"), /\b\w/g), stryMutAct_9fa48("17962") ? () => undefined : (stryCov_9fa48("17962"), l => stryMutAct_9fa48("17963") ? l.toLowerCase() : (stryCov_9fa48("17963"), l.toUpperCase())))}</h6>
                                            {(stryMutAct_9fa48("17966") ? category !== 'faqs' : stryMutAct_9fa48("17965") ? false : stryMutAct_9fa48("17964") ? true : (stryCov_9fa48("17964", "17965", "17966"), category === (stryMutAct_9fa48("17967") ? "" : (stryCov_9fa48("17967"), 'faqs')))) ? <div className="facilitator-notes-generator__faqs">
                                                {Array.isArray(content) ? content.map(stryMutAct_9fa48("17968") ? () => undefined : (stryCov_9fa48("17968"), (faq, faqIndex) => <div key={faqIndex} className="facilitator-notes-generator__faq">
                                                    <div className="facilitator-notes-generator__faq-question">
                                                      <strong>Q: {faq.question}</strong>
                                                    </div>
                                                    <div className="facilitator-notes-generator__faq-response">
                                                      <strong>A: </strong>{faq.facilitator_response}
                                                    </div>
                                                    {stryMutAct_9fa48("17971") ? faq.follow_up_questions || <div className="facilitator-notes-generator__faq-followup">
                                                        <strong>Follow-up: </strong>{faq.follow_up_questions}
                                                      </div> : stryMutAct_9fa48("17970") ? false : stryMutAct_9fa48("17969") ? true : (stryCov_9fa48("17969", "17970", "17971"), faq.follow_up_questions && <div className="facilitator-notes-generator__faq-followup">
                                                        <strong>Follow-up: </strong>{faq.follow_up_questions}
                                                      </div>)}
                                                  </div>)) : <p>No FAQs available</p>}
                                              </div> : <p>{(stryMutAct_9fa48("17974") ? typeof content !== 'string' : stryMutAct_9fa48("17973") ? false : stryMutAct_9fa48("17972") ? true : (stryCov_9fa48("17972", "17973", "17974"), typeof content === (stryMutAct_9fa48("17975") ? "" : (stryCov_9fa48("17975"), 'string')))) ? content : JSON.stringify(content)}</p>}
                                          </div>))}
                                      </div>}
                                  </div>
                                </div>)}
                            </div>;
                  }
                })}
                      </div>)}
                  </div>))}
              </div> : <div className="facilitator-notes-generator__single-day">
                {/* Single day display */}
                {stryMutAct_9fa48("17978") ? facilitatorNotes.days && facilitatorNotes.days[0] || <>
                    <div className="facilitator-notes-generator__daily-goal">
                      <h4>Daily Goal</h4>
                      <p>{facilitatorNotes.days[0].dailyGoal}</p>
                    </div>

                    <div className="facilitator-notes-generator__tasks">
                      <h4>Task-by-Task Facilitation Guidance</h4>
                      
                      {facilitatorNotes.days[0].tasks.map((task, index) => {
                  const taskKey = `0-${index}`;
                  const isTaskCollapsed = collapsedTasks.has(taskKey);
                  return <div key={index} className="facilitator-notes-generator__task">
                            <div className="facilitator-notes-generator__task-header facilitator-notes-generator__task-header--clickable" onClick={() => toggleTaskCollapse(0, index)}>
                              <div className="facilitator-notes-generator__task-title-section">
                                {isTaskCollapsed ? <FaChevronRight /> : <FaChevronDown />}
                                <h5>{task.task_title}</h5>
                              </div>
                              <div className="facilitator-notes-generator__task-meta">
                                <span className="time">{task.start_time} - {task.end_time}</span>
                                <button onClick={e => {
                          e.stopPropagation();
                          startEditingNote(index, task.facilitator_notes, 0, index);
                        }} className="facilitator-notes-generator__edit-btn" title="Edit facilitator notes">
                                  <FaEdit />
                                </button>
                              </div>
                            </div>
                            
                            {!isTaskCollapsed && <div className="facilitator-notes-generator__task-content">
                                <div className="facilitator-notes-generator__note-text">
                                  {typeof task.facilitator_notes === 'string' ? <p>{task.facilitator_notes}</p> : <div className="facilitator-notes-generator__structured-notes">
                                      {Object.entries(task.facilitator_notes || {}).map(([category, content]) => <div key={category} className="facilitator-notes-generator__note-section">
                                          <h6>{category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h6>
                                          {category === 'faqs' ? <div className="facilitator-notes-generator__faqs">
                                              {Array.isArray(content) ? content.map((faq, faqIndex) => <div key={faqIndex} className="facilitator-notes-generator__faq">
                                                  <div className="facilitator-notes-generator__faq-question">
                                                    <strong>Q: {faq.question}</strong>
                                                  </div>
                                                  <div className="facilitator-notes-generator__faq-response">
                                                    <strong>A: </strong>{faq.facilitator_response}
                                                  </div>
                                                  {faq.follow_up_questions && <div className="facilitator-notes-generator__faq-followup">
                                                      <strong>Follow-up: </strong>{faq.follow_up_questions}
                                                    </div>}
                                                </div>) : <p>No FAQs available</p>}
                                            </div> : <p>{typeof content === 'string' ? content : JSON.stringify(content)}</p>}
                                        </div>)}
                                    </div>}
                                </div>
                              </div>}
                          </div>;
                })}
                    </div>
                  </> : stryMutAct_9fa48("17977") ? false : stryMutAct_9fa48("17976") ? true : (stryCov_9fa48("17976", "17977", "17978"), (stryMutAct_9fa48("17980") ? facilitatorNotes.days || facilitatorNotes.days[0] : stryMutAct_9fa48("17979") ? true : (stryCov_9fa48("17979", "17980"), facilitatorNotes.days && facilitatorNotes.days[0])) && <>
                    <div className="facilitator-notes-generator__daily-goal">
                      <h4>Daily Goal</h4>
                      <p>{facilitatorNotes.days[0].dailyGoal}</p>
                    </div>

                    <div className="facilitator-notes-generator__tasks">
                      <h4>Task-by-Task Facilitation Guidance</h4>
                      
                      {facilitatorNotes.days[0].tasks.map((task, index) => {
                  if (stryMutAct_9fa48("17981")) {
                    {}
                  } else {
                    stryCov_9fa48("17981");
                    const taskKey = stryMutAct_9fa48("17982") ? `` : (stryCov_9fa48("17982"), `0-${index}`);
                    const isTaskCollapsed = collapsedTasks.has(taskKey);
                    return <div key={index} className="facilitator-notes-generator__task">
                            <div className="facilitator-notes-generator__task-header facilitator-notes-generator__task-header--clickable" onClick={stryMutAct_9fa48("17983") ? () => undefined : (stryCov_9fa48("17983"), () => toggleTaskCollapse(0, index))}>
                              <div className="facilitator-notes-generator__task-title-section">
                                {isTaskCollapsed ? <FaChevronRight /> : <FaChevronDown />}
                                <h5>{task.task_title}</h5>
                              </div>
                              <div className="facilitator-notes-generator__task-meta">
                                <span className="time">{task.start_time} - {task.end_time}</span>
                                <button onClick={e => {
                            if (stryMutAct_9fa48("17984")) {
                              {}
                            } else {
                              stryCov_9fa48("17984");
                              e.stopPropagation();
                              startEditingNote(index, task.facilitator_notes, 0, index);
                            }
                          }} className="facilitator-notes-generator__edit-btn" title="Edit facilitator notes">
                                  <FaEdit />
                                </button>
                              </div>
                            </div>
                            
                            {stryMutAct_9fa48("17987") ? !isTaskCollapsed || <div className="facilitator-notes-generator__task-content">
                                <div className="facilitator-notes-generator__note-text">
                                  {typeof task.facilitator_notes === 'string' ? <p>{task.facilitator_notes}</p> : <div className="facilitator-notes-generator__structured-notes">
                                      {Object.entries(task.facilitator_notes || {}).map(([category, content]) => <div key={category} className="facilitator-notes-generator__note-section">
                                          <h6>{category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h6>
                                          {category === 'faqs' ? <div className="facilitator-notes-generator__faqs">
                                              {Array.isArray(content) ? content.map((faq, faqIndex) => <div key={faqIndex} className="facilitator-notes-generator__faq">
                                                  <div className="facilitator-notes-generator__faq-question">
                                                    <strong>Q: {faq.question}</strong>
                                                  </div>
                                                  <div className="facilitator-notes-generator__faq-response">
                                                    <strong>A: </strong>{faq.facilitator_response}
                                                  </div>
                                                  {faq.follow_up_questions && <div className="facilitator-notes-generator__faq-followup">
                                                      <strong>Follow-up: </strong>{faq.follow_up_questions}
                                                    </div>}
                                                </div>) : <p>No FAQs available</p>}
                                            </div> : <p>{typeof content === 'string' ? content : JSON.stringify(content)}</p>}
                                        </div>)}
                                    </div>}
                                </div>
                              </div> : stryMutAct_9fa48("17986") ? false : stryMutAct_9fa48("17985") ? true : (stryCov_9fa48("17985", "17986", "17987"), (stryMutAct_9fa48("17988") ? isTaskCollapsed : (stryCov_9fa48("17988"), !isTaskCollapsed)) && <div className="facilitator-notes-generator__task-content">
                                <div className="facilitator-notes-generator__note-text">
                                  {(stryMutAct_9fa48("17991") ? typeof task.facilitator_notes !== 'string' : stryMutAct_9fa48("17990") ? false : stryMutAct_9fa48("17989") ? true : (stryCov_9fa48("17989", "17990", "17991"), typeof task.facilitator_notes === (stryMutAct_9fa48("17992") ? "" : (stryCov_9fa48("17992"), 'string')))) ? <p>{task.facilitator_notes}</p> : <div className="facilitator-notes-generator__structured-notes">
                                      {Object.entries(stryMutAct_9fa48("17995") ? task.facilitator_notes && {} : stryMutAct_9fa48("17994") ? false : stryMutAct_9fa48("17993") ? true : (stryCov_9fa48("17993", "17994", "17995"), task.facilitator_notes || {})).map(stryMutAct_9fa48("17996") ? () => undefined : (stryCov_9fa48("17996"), ([category, content]) => <div key={category} className="facilitator-notes-generator__note-section">
                                          <h6>{category.replace(/_/g, stryMutAct_9fa48("17997") ? "" : (stryCov_9fa48("17997"), ' ')).replace(stryMutAct_9fa48("17998") ? /\b\W/g : (stryCov_9fa48("17998"), /\b\w/g), stryMutAct_9fa48("17999") ? () => undefined : (stryCov_9fa48("17999"), l => stryMutAct_9fa48("18000") ? l.toLowerCase() : (stryCov_9fa48("18000"), l.toUpperCase())))}</h6>
                                          {(stryMutAct_9fa48("18003") ? category !== 'faqs' : stryMutAct_9fa48("18002") ? false : stryMutAct_9fa48("18001") ? true : (stryCov_9fa48("18001", "18002", "18003"), category === (stryMutAct_9fa48("18004") ? "" : (stryCov_9fa48("18004"), 'faqs')))) ? <div className="facilitator-notes-generator__faqs">
                                              {Array.isArray(content) ? content.map(stryMutAct_9fa48("18005") ? () => undefined : (stryCov_9fa48("18005"), (faq, faqIndex) => <div key={faqIndex} className="facilitator-notes-generator__faq">
                                                  <div className="facilitator-notes-generator__faq-question">
                                                    <strong>Q: {faq.question}</strong>
                                                  </div>
                                                  <div className="facilitator-notes-generator__faq-response">
                                                    <strong>A: </strong>{faq.facilitator_response}
                                                  </div>
                                                  {stryMutAct_9fa48("18008") ? faq.follow_up_questions || <div className="facilitator-notes-generator__faq-followup">
                                                      <strong>Follow-up: </strong>{faq.follow_up_questions}
                                                    </div> : stryMutAct_9fa48("18007") ? false : stryMutAct_9fa48("18006") ? true : (stryCov_9fa48("18006", "18007", "18008"), faq.follow_up_questions && <div className="facilitator-notes-generator__faq-followup">
                                                      <strong>Follow-up: </strong>{faq.follow_up_questions}
                                                    </div>)}
                                                </div>)) : <p>No FAQs available</p>}
                                            </div> : <p>{(stryMutAct_9fa48("18011") ? typeof content !== 'string' : stryMutAct_9fa48("18010") ? false : stryMutAct_9fa48("18009") ? true : (stryCov_9fa48("18009", "18010", "18011"), typeof content === (stryMutAct_9fa48("18012") ? "" : (stryCov_9fa48("18012"), 'string')))) ? content : JSON.stringify(content)}</p>}
                                        </div>))}
                                    </div>}
                                </div>
                              </div>)}
                          </div>;
                  }
                })}
                    </div>
                  </>)}
              </div>}
          </div>
        </div>)}

      {/* Reference Modal */}
      {stryMutAct_9fa48("18015") ? isModalOpen && sessionData || <div className="facilitator-notes-generator__modal-overlay" onClick={closeReferenceModal}>
          <div className="facilitator-notes-generator__modal" onClick={e => e.stopPropagation()}>
            <div className="facilitator-notes-generator__modal-header">
              <h3>Session Reference {Array.isArray(sessionData) ? `(${sessionData.length} Days)` : `- Day ${sessionData?.day_number || 'Unknown'}`}</h3>
              <button onClick={closeReferenceModal} className="facilitator-notes-generator__modal-close">
                <FaTimes />
              </button>
            </div>
            
            <div className="facilitator-notes-generator__modal-content">
              {Array.isArray(sessionData) ?
            // Multi-day display
            sessionData.map((day, dayIndex) => <div key={dayIndex} className="facilitator-notes-generator__modal-day">
                    <div className="facilitator-notes-generator__modal-section">
                      <h4>Day {day.day_number} - Session Overview</h4>
                      <p><strong>Date:</strong> {day.date}</p>
                      <p><strong>Cohort:</strong> {day.cohort}</p>
                      <p><strong>Daily Goal:</strong> {day.daily_goal}</p>
                    </div>
                    
                    <div className="facilitator-notes-generator__modal-section">
                      <h4>Time Blocks & Tasks</h4>
                      <div className="facilitator-notes-generator__time-blocks">
                        {day.time_blocks?.map((block, index) => <div key={index} className="facilitator-notes-generator__time-block">
                            <div className="time-block-header">
                              <strong>{block.start_time} - {block.end_time}</strong>
                              <span className="time-block-category">{block.category}</span>
                            </div>
                            <div className="time-block-task">
                              <h5>{block.task.title}</h5>
                              <p>{block.task.description}</p>
                              {block.task.questions?.length > 0 && <div className="time-block-questions">
                                  <strong>Questions:</strong>
                                  <ul>
                                    {block.task.questions.map((q, qIndex) => <li key={qIndex}>{q}</li>)}
                                  </ul>
                                </div>}
                            </div>
                          </div>)}
                      </div>
                    </div>
                  </div>) :
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
                      {sessionData.time_blocks?.map((block, index) => <div key={index} className="facilitator-notes-generator__time-block">
                          <div className="time-block-header">
                            <strong>{block.start_time} - {block.end_time}</strong>
                            <span className="time-block-category">{block.category}</span>
                          </div>
                          <div className="time-block-task">
                            <h5>{block.task.title}</h5>
                            <p>{block.task.description}</p>
                            {block.task.questions?.length > 0 && <div className="time-block-questions">
                                <strong>Questions:</strong>
                                <ul>
                                  {block.task.questions.map((q, qIndex) => <li key={qIndex}>{q}</li>)}
                                </ul>
                              </div>}
                          </div>
                        </div>)}
                    </div>
                  </div>
                </>}
            </div>
          </div>
        </div> : stryMutAct_9fa48("18014") ? false : stryMutAct_9fa48("18013") ? true : (stryCov_9fa48("18013", "18014", "18015"), (stryMutAct_9fa48("18017") ? isModalOpen || sessionData : stryMutAct_9fa48("18016") ? true : (stryCov_9fa48("18016", "18017"), isModalOpen && sessionData)) && <div className="facilitator-notes-generator__modal-overlay" onClick={closeReferenceModal}>
          <div className="facilitator-notes-generator__modal" onClick={stryMutAct_9fa48("18018") ? () => undefined : (stryCov_9fa48("18018"), e => e.stopPropagation())}>
            <div className="facilitator-notes-generator__modal-header">
              <h3>Session Reference {Array.isArray(sessionData) ? stryMutAct_9fa48("18019") ? `` : (stryCov_9fa48("18019"), `(${sessionData.length} Days)`) : stryMutAct_9fa48("18020") ? `` : (stryCov_9fa48("18020"), `- Day ${stryMutAct_9fa48("18023") ? sessionData?.day_number && 'Unknown' : stryMutAct_9fa48("18022") ? false : stryMutAct_9fa48("18021") ? true : (stryCov_9fa48("18021", "18022", "18023"), (stryMutAct_9fa48("18024") ? sessionData.day_number : (stryCov_9fa48("18024"), sessionData?.day_number)) || (stryMutAct_9fa48("18025") ? "" : (stryCov_9fa48("18025"), 'Unknown')))}`)}</h3>
              <button onClick={closeReferenceModal} className="facilitator-notes-generator__modal-close">
                <FaTimes />
              </button>
            </div>
            
            <div className="facilitator-notes-generator__modal-content">
              {Array.isArray(sessionData) ?
            // Multi-day display
            sessionData.map(stryMutAct_9fa48("18026") ? () => undefined : (stryCov_9fa48("18026"), (day, dayIndex) => <div key={dayIndex} className="facilitator-notes-generator__modal-day">
                    <div className="facilitator-notes-generator__modal-section">
                      <h4>Day {day.day_number} - Session Overview</h4>
                      <p><strong>Date:</strong> {day.date}</p>
                      <p><strong>Cohort:</strong> {day.cohort}</p>
                      <p><strong>Daily Goal:</strong> {day.daily_goal}</p>
                    </div>
                    
                    <div className="facilitator-notes-generator__modal-section">
                      <h4>Time Blocks & Tasks</h4>
                      <div className="facilitator-notes-generator__time-blocks">
                        {stryMutAct_9fa48("18027") ? day.time_blocks.map((block, index) => <div key={index} className="facilitator-notes-generator__time-block">
                            <div className="time-block-header">
                              <strong>{block.start_time} - {block.end_time}</strong>
                              <span className="time-block-category">{block.category}</span>
                            </div>
                            <div className="time-block-task">
                              <h5>{block.task.title}</h5>
                              <p>{block.task.description}</p>
                              {block.task.questions?.length > 0 && <div className="time-block-questions">
                                  <strong>Questions:</strong>
                                  <ul>
                                    {block.task.questions.map((q, qIndex) => <li key={qIndex}>{q}</li>)}
                                  </ul>
                                </div>}
                            </div>
                          </div>) : (stryCov_9fa48("18027"), day.time_blocks?.map(stryMutAct_9fa48("18028") ? () => undefined : (stryCov_9fa48("18028"), (block, index) => <div key={index} className="facilitator-notes-generator__time-block">
                            <div className="time-block-header">
                              <strong>{block.start_time} - {block.end_time}</strong>
                              <span className="time-block-category">{block.category}</span>
                            </div>
                            <div className="time-block-task">
                              <h5>{block.task.title}</h5>
                              <p>{block.task.description}</p>
                              {stryMutAct_9fa48("18031") ? block.task.questions?.length > 0 || <div className="time-block-questions">
                                  <strong>Questions:</strong>
                                  <ul>
                                    {block.task.questions.map((q, qIndex) => <li key={qIndex}>{q}</li>)}
                                  </ul>
                                </div> : stryMutAct_9fa48("18030") ? false : stryMutAct_9fa48("18029") ? true : (stryCov_9fa48("18029", "18030", "18031"), (stryMutAct_9fa48("18034") ? block.task.questions?.length <= 0 : stryMutAct_9fa48("18033") ? block.task.questions?.length >= 0 : stryMutAct_9fa48("18032") ? true : (stryCov_9fa48("18032", "18033", "18034"), (stryMutAct_9fa48("18035") ? block.task.questions.length : (stryCov_9fa48("18035"), block.task.questions?.length)) > 0)) && <div className="time-block-questions">
                                  <strong>Questions:</strong>
                                  <ul>
                                    {block.task.questions.map(stryMutAct_9fa48("18036") ? () => undefined : (stryCov_9fa48("18036"), (q, qIndex) => <li key={qIndex}>{q}</li>))}
                                  </ul>
                                </div>)}
                            </div>
                          </div>)))}
                      </div>
                    </div>
                  </div>)) :
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
                      {stryMutAct_9fa48("18037") ? sessionData.time_blocks.map((block, index) => <div key={index} className="facilitator-notes-generator__time-block">
                          <div className="time-block-header">
                            <strong>{block.start_time} - {block.end_time}</strong>
                            <span className="time-block-category">{block.category}</span>
                          </div>
                          <div className="time-block-task">
                            <h5>{block.task.title}</h5>
                            <p>{block.task.description}</p>
                            {block.task.questions?.length > 0 && <div className="time-block-questions">
                                <strong>Questions:</strong>
                                <ul>
                                  {block.task.questions.map((q, qIndex) => <li key={qIndex}>{q}</li>)}
                                </ul>
                              </div>}
                          </div>
                        </div>) : (stryCov_9fa48("18037"), sessionData.time_blocks?.map(stryMutAct_9fa48("18038") ? () => undefined : (stryCov_9fa48("18038"), (block, index) => <div key={index} className="facilitator-notes-generator__time-block">
                          <div className="time-block-header">
                            <strong>{block.start_time} - {block.end_time}</strong>
                            <span className="time-block-category">{block.category}</span>
                          </div>
                          <div className="time-block-task">
                            <h5>{block.task.title}</h5>
                            <p>{block.task.description}</p>
                            {stryMutAct_9fa48("18041") ? block.task.questions?.length > 0 || <div className="time-block-questions">
                                <strong>Questions:</strong>
                                <ul>
                                  {block.task.questions.map((q, qIndex) => <li key={qIndex}>{q}</li>)}
                                </ul>
                              </div> : stryMutAct_9fa48("18040") ? false : stryMutAct_9fa48("18039") ? true : (stryCov_9fa48("18039", "18040", "18041"), (stryMutAct_9fa48("18044") ? block.task.questions?.length <= 0 : stryMutAct_9fa48("18043") ? block.task.questions?.length >= 0 : stryMutAct_9fa48("18042") ? true : (stryCov_9fa48("18042", "18043", "18044"), (stryMutAct_9fa48("18045") ? block.task.questions.length : (stryCov_9fa48("18045"), block.task.questions?.length)) > 0)) && <div className="time-block-questions">
                                <strong>Questions:</strong>
                                <ul>
                                  {block.task.questions.map(stryMutAct_9fa48("18046") ? () => undefined : (stryCov_9fa48("18046"), (q, qIndex) => <li key={qIndex}>{q}</li>))}
                                </ul>
                              </div>)}
                          </div>
                        </div>)))}
                    </div>
                  </div>
                </>}
            </div>
          </div>
        </div>)}

      {/* Structured Editing Modal */}
      {stryMutAct_9fa48("18049") ? isEditModalOpen && editingTask || <div className="facilitator-notes-generator__edit-overlay" onClick={e => e.target === e.currentTarget && closeEditModal()}>
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
                {editingField === 'context' ? <div className="facilitator-notes-generator__field-editor">
                    <textarea value={editingFieldValue} onChange={e => setEditingFieldValue(e.target.value)} className="facilitator-notes-generator__edit-textarea" rows={3} placeholder="Brief explanation of where this task fits in the day..." />
                    <div className="facilitator-notes-generator__field-actions">
                      <button onClick={saveEditedField} className="btn-save">
                        <FaSave /> Save
                      </button>
                      <button onClick={cancelEditingField} className="btn-cancel">
                        <FaTimes /> Cancel
                      </button>
                    </div>
                  </div> : <div className="facilitator-notes-generator__field-display" onClick={() => startEditingField('context', editingTask.context)}>
                    <p>{editingTask.context || 'Click to add context...'}</p>
                    <FaEdit className="facilitator-notes-generator__field-edit-icon" />
                  </div>}
              </div>

              {/* Preparation Section */}
              <div className="facilitator-notes-generator__edit-section">
                <h4>Preparation</h4>
                {editingField === 'preparation' ? <div className="facilitator-notes-generator__field-editor">
                    <textarea value={editingFieldValue} onChange={e => setEditingFieldValue(e.target.value)} className="facilitator-notes-generator__edit-textarea" rows={3} placeholder="Specific items facilitator should review or prep..." />
                    <div className="facilitator-notes-generator__field-actions">
                      <button onClick={saveEditedField} className="btn-save">
                        <FaSave /> Save
                      </button>
                      <button onClick={cancelEditingField} className="btn-cancel">
                        <FaTimes /> Cancel
                      </button>
                    </div>
                  </div> : <div className="facilitator-notes-generator__field-display" onClick={() => startEditingField('preparation', editingTask.preparation)}>
                    <p>{editingTask.preparation || 'Click to add preparation notes...'}</p>
                    <FaEdit className="facilitator-notes-generator__field-edit-icon" />
                  </div>}
              </div>

              {/* Facilitation Approach Section */}
              <div className="facilitator-notes-generator__edit-section">
                <h4>Facilitation Approach</h4>
                {editingField === 'facilitation_approach' ? <div className="facilitator-notes-generator__field-editor">
                    <textarea value={editingFieldValue} onChange={e => setEditingFieldValue(e.target.value)} className="facilitator-notes-generator__edit-textarea" rows={4} placeholder="How to introduce, guide, and conclude this task..." />
                    <div className="facilitator-notes-generator__field-actions">
                      <button onClick={saveEditedField} className="btn-save">
                        <FaSave /> Save
                      </button>
                      <button onClick={cancelEditingField} className="btn-cancel">
                        <FaTimes /> Cancel
                      </button>
                    </div>
                  </div> : <div className="facilitator-notes-generator__field-display" onClick={() => startEditingField('facilitation_approach', editingTask.facilitation_approach)}>
                    <p>{editingTask.facilitation_approach || 'Click to add facilitation approach...'}</p>
                    <FaEdit className="facilitator-notes-generator__field-edit-icon" />
                  </div>}
              </div>

              {/* Key Learning Moments Section */}
              <div className="facilitator-notes-generator__edit-section">
                <h4>Key Learning Moments</h4>
                {editingField === 'key_learning_moments' ? <div className="facilitator-notes-generator__field-editor">
                    <textarea value={editingFieldValue} onChange={e => setEditingFieldValue(e.target.value)} className="facilitator-notes-generator__edit-textarea" rows={3} placeholder="What to watch for, when to intervene..." />
                    <div className="facilitator-notes-generator__field-actions">
                      <button onClick={saveEditedField} className="btn-save">
                        <FaSave /> Save
                      </button>
                      <button onClick={cancelEditingField} className="btn-cancel">
                        <FaTimes /> Cancel
                      </button>
                    </div>
                  </div> : <div className="facilitator-notes-generator__field-display" onClick={() => startEditingField('key_learning_moments', editingTask.key_learning_moments)}>
                    <p>{editingTask.key_learning_moments || 'Click to add key learning moments...'}</p>
                    <FaEdit className="facilitator-notes-generator__field-edit-icon" />
                  </div>}
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
                  {editingTask.faqs && editingTask.faqs.length > 0 ? editingTask.faqs.map((faq, faqIndex) => <div key={faqIndex} className="facilitator-notes-generator__faq-editor">
                        <div className="facilitator-notes-generator__faq-header">
                          <h5>FAQ #{faqIndex + 1}</h5>
                          <button onClick={() => deleteFaq(faqIndex)} className="facilitator-notes-generator__delete-btn">
                            <FaTimes />
                          </button>
                        </div>
                        
                        {/* Question */}
                        <div className="facilitator-notes-generator__faq-field">
                          <label>Question:</label>
                          {editingField === `faq-${faqIndex}-question` ? <div className="facilitator-notes-generator__field-editor">
                              <input type="text" value={editingFieldValue} onChange={e => setEditingFieldValue(e.target.value)} className="facilitator-notes-generator__edit-input" placeholder="Enter the question..." />
                              <div className="facilitator-notes-generator__field-actions">
                                <button onClick={saveEditedField} className="btn-save">
                                  <FaSave />
                                </button>
                                <button onClick={cancelEditingField} className="btn-cancel">
                                  <FaTimes />
                                </button>
                              </div>
                            </div> : <div className="facilitator-notes-generator__field-display" onClick={() => startEditingField(`faq-${faqIndex}-question`, faq.question)}>
                              <p>{faq.question || 'Click to add question...'}</p>
                              <FaEdit className="facilitator-notes-generator__field-edit-icon" />
                            </div>}
                        </div>

                        {/* Facilitator Response */}
                        <div className="facilitator-notes-generator__faq-field">
                          <label>Facilitator Response:</label>
                          {editingField === `faq-${faqIndex}-facilitator_response` ? <div className="facilitator-notes-generator__field-editor">
                              <textarea value={editingFieldValue} onChange={e => setEditingFieldValue(e.target.value)} className="facilitator-notes-generator__edit-textarea" rows={3} placeholder="How the facilitator should respond..." />
                              <div className="facilitator-notes-generator__field-actions">
                                <button onClick={saveEditedField} className="btn-save">
                                  <FaSave />
                                </button>
                                <button onClick={cancelEditingField} className="btn-cancel">
                                  <FaTimes />
                                </button>
                              </div>
                            </div> : <div className="facilitator-notes-generator__field-display" onClick={() => startEditingField(`faq-${faqIndex}-facilitator_response`, faq.facilitator_response)}>
                              <p>{faq.facilitator_response || 'Click to add response...'}</p>
                              <FaEdit className="facilitator-notes-generator__field-edit-icon" />
                            </div>}
                        </div>

                        {/* Follow-up Questions */}
                        <div className="facilitator-notes-generator__faq-field">
                          <label>Follow-up Questions:</label>
                          {editingField === `faq-${faqIndex}-follow_up_questions` ? <div className="facilitator-notes-generator__field-editor">
                              <textarea value={editingFieldValue} onChange={e => setEditingFieldValue(e.target.value)} className="facilitator-notes-generator__edit-textarea" rows={2} placeholder="Questions facilitator can ask to guide thinking..." />
                              <div className="facilitator-notes-generator__field-actions">
                                <button onClick={saveEditedField} className="btn-save">
                                  <FaSave />
                                </button>
                                <button onClick={cancelEditingField} className="btn-cancel">
                                  <FaTimes />
                                </button>
                              </div>
                            </div> : <div className="facilitator-notes-generator__field-display" onClick={() => startEditingField(`faq-${faqIndex}-follow_up_questions`, faq.follow_up_questions)}>
                              <p>{faq.follow_up_questions || 'Click to add follow-up questions...'}</p>
                              <FaEdit className="facilitator-notes-generator__field-edit-icon" />
                            </div>}
                        </div>
                      </div>) : <p className="facilitator-notes-generator__empty-faqs">No FAQs yet. Click "Add FAQ" to create one.</p>}
                </div>
              </div>

              {/* Success Indicators Section */}
              <div className="facilitator-notes-generator__edit-section">
                <h4>Success Indicators</h4>
                {editingField === 'success_indicators' ? <div className="facilitator-notes-generator__field-editor">
                    <textarea value={editingFieldValue} onChange={e => setEditingFieldValue(e.target.value)} className="facilitator-notes-generator__edit-textarea" rows={3} placeholder="How to recognize when builders are on track..." />
                    <div className="facilitator-notes-generator__field-actions">
                      <button onClick={saveEditedField} className="btn-save">
                        <FaSave /> Save
                      </button>
                      <button onClick={cancelEditingField} className="btn-cancel">
                        <FaTimes /> Cancel
                      </button>
                    </div>
                  </div> : <div className="facilitator-notes-generator__field-display" onClick={() => startEditingField('success_indicators', editingTask.success_indicators)}>
                    <p>{editingTask.success_indicators || 'Click to add success indicators...'}</p>
                    <FaEdit className="facilitator-notes-generator__field-edit-icon" />
                  </div>}
              </div>

              {/* Time Management Section */}
              <div className="facilitator-notes-generator__edit-section">
                <h4>Time Management</h4>
                {editingField === 'time_management' ? <div className="facilitator-notes-generator__field-editor">
                    <textarea value={editingFieldValue} onChange={e => setEditingFieldValue(e.target.value)} className="facilitator-notes-generator__edit-textarea" rows={3} placeholder="Pacing guidance, what to do if running over/under time..." />
                    <div className="facilitator-notes-generator__field-actions">
                      <button onClick={saveEditedField} className="btn-save">
                        <FaSave /> Save
                      </button>
                      <button onClick={cancelEditingField} className="btn-cancel">
                        <FaTimes /> Cancel
                      </button>
                    </div>
                  </div> : <div className="facilitator-notes-generator__field-display" onClick={() => startEditingField('time_management', editingTask.time_management)}>
                    <p>{editingTask.time_management || 'Click to add time management notes...'}</p>
                    <FaEdit className="facilitator-notes-generator__field-edit-icon" />
                  </div>}
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
        </div> : stryMutAct_9fa48("18048") ? false : stryMutAct_9fa48("18047") ? true : (stryCov_9fa48("18047", "18048", "18049"), (stryMutAct_9fa48("18051") ? isEditModalOpen || editingTask : stryMutAct_9fa48("18050") ? true : (stryCov_9fa48("18050", "18051"), isEditModalOpen && editingTask)) && <div className="facilitator-notes-generator__edit-overlay" onClick={stryMutAct_9fa48("18052") ? () => undefined : (stryCov_9fa48("18052"), e => stryMutAct_9fa48("18055") ? e.target === e.currentTarget || closeEditModal() : stryMutAct_9fa48("18054") ? false : stryMutAct_9fa48("18053") ? true : (stryCov_9fa48("18053", "18054", "18055"), (stryMutAct_9fa48("18057") ? e.target !== e.currentTarget : stryMutAct_9fa48("18056") ? true : (stryCov_9fa48("18056", "18057"), e.target === e.currentTarget)) && closeEditModal()))}>
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
                {(stryMutAct_9fa48("18060") ? editingField !== 'context' : stryMutAct_9fa48("18059") ? false : stryMutAct_9fa48("18058") ? true : (stryCov_9fa48("18058", "18059", "18060"), editingField === (stryMutAct_9fa48("18061") ? "" : (stryCov_9fa48("18061"), 'context')))) ? <div className="facilitator-notes-generator__field-editor">
                    <textarea value={editingFieldValue} onChange={stryMutAct_9fa48("18062") ? () => undefined : (stryCov_9fa48("18062"), e => setEditingFieldValue(e.target.value))} className="facilitator-notes-generator__edit-textarea" rows={3} placeholder="Brief explanation of where this task fits in the day..." />
                    <div className="facilitator-notes-generator__field-actions">
                      <button onClick={saveEditedField} className="btn-save">
                        <FaSave /> Save
                      </button>
                      <button onClick={cancelEditingField} className="btn-cancel">
                        <FaTimes /> Cancel
                      </button>
                    </div>
                  </div> : <div className="facilitator-notes-generator__field-display" onClick={stryMutAct_9fa48("18063") ? () => undefined : (stryCov_9fa48("18063"), () => startEditingField(stryMutAct_9fa48("18064") ? "" : (stryCov_9fa48("18064"), 'context'), editingTask.context))}>
                    <p>{stryMutAct_9fa48("18067") ? editingTask.context && 'Click to add context...' : stryMutAct_9fa48("18066") ? false : stryMutAct_9fa48("18065") ? true : (stryCov_9fa48("18065", "18066", "18067"), editingTask.context || (stryMutAct_9fa48("18068") ? "" : (stryCov_9fa48("18068"), 'Click to add context...')))}</p>
                    <FaEdit className="facilitator-notes-generator__field-edit-icon" />
                  </div>}
              </div>

              {/* Preparation Section */}
              <div className="facilitator-notes-generator__edit-section">
                <h4>Preparation</h4>
                {(stryMutAct_9fa48("18071") ? editingField !== 'preparation' : stryMutAct_9fa48("18070") ? false : stryMutAct_9fa48("18069") ? true : (stryCov_9fa48("18069", "18070", "18071"), editingField === (stryMutAct_9fa48("18072") ? "" : (stryCov_9fa48("18072"), 'preparation')))) ? <div className="facilitator-notes-generator__field-editor">
                    <textarea value={editingFieldValue} onChange={stryMutAct_9fa48("18073") ? () => undefined : (stryCov_9fa48("18073"), e => setEditingFieldValue(e.target.value))} className="facilitator-notes-generator__edit-textarea" rows={3} placeholder="Specific items facilitator should review or prep..." />
                    <div className="facilitator-notes-generator__field-actions">
                      <button onClick={saveEditedField} className="btn-save">
                        <FaSave /> Save
                      </button>
                      <button onClick={cancelEditingField} className="btn-cancel">
                        <FaTimes /> Cancel
                      </button>
                    </div>
                  </div> : <div className="facilitator-notes-generator__field-display" onClick={stryMutAct_9fa48("18074") ? () => undefined : (stryCov_9fa48("18074"), () => startEditingField(stryMutAct_9fa48("18075") ? "" : (stryCov_9fa48("18075"), 'preparation'), editingTask.preparation))}>
                    <p>{stryMutAct_9fa48("18078") ? editingTask.preparation && 'Click to add preparation notes...' : stryMutAct_9fa48("18077") ? false : stryMutAct_9fa48("18076") ? true : (stryCov_9fa48("18076", "18077", "18078"), editingTask.preparation || (stryMutAct_9fa48("18079") ? "" : (stryCov_9fa48("18079"), 'Click to add preparation notes...')))}</p>
                    <FaEdit className="facilitator-notes-generator__field-edit-icon" />
                  </div>}
              </div>

              {/* Facilitation Approach Section */}
              <div className="facilitator-notes-generator__edit-section">
                <h4>Facilitation Approach</h4>
                {(stryMutAct_9fa48("18082") ? editingField !== 'facilitation_approach' : stryMutAct_9fa48("18081") ? false : stryMutAct_9fa48("18080") ? true : (stryCov_9fa48("18080", "18081", "18082"), editingField === (stryMutAct_9fa48("18083") ? "" : (stryCov_9fa48("18083"), 'facilitation_approach')))) ? <div className="facilitator-notes-generator__field-editor">
                    <textarea value={editingFieldValue} onChange={stryMutAct_9fa48("18084") ? () => undefined : (stryCov_9fa48("18084"), e => setEditingFieldValue(e.target.value))} className="facilitator-notes-generator__edit-textarea" rows={4} placeholder="How to introduce, guide, and conclude this task..." />
                    <div className="facilitator-notes-generator__field-actions">
                      <button onClick={saveEditedField} className="btn-save">
                        <FaSave /> Save
                      </button>
                      <button onClick={cancelEditingField} className="btn-cancel">
                        <FaTimes /> Cancel
                      </button>
                    </div>
                  </div> : <div className="facilitator-notes-generator__field-display" onClick={stryMutAct_9fa48("18085") ? () => undefined : (stryCov_9fa48("18085"), () => startEditingField(stryMutAct_9fa48("18086") ? "" : (stryCov_9fa48("18086"), 'facilitation_approach'), editingTask.facilitation_approach))}>
                    <p>{stryMutAct_9fa48("18089") ? editingTask.facilitation_approach && 'Click to add facilitation approach...' : stryMutAct_9fa48("18088") ? false : stryMutAct_9fa48("18087") ? true : (stryCov_9fa48("18087", "18088", "18089"), editingTask.facilitation_approach || (stryMutAct_9fa48("18090") ? "" : (stryCov_9fa48("18090"), 'Click to add facilitation approach...')))}</p>
                    <FaEdit className="facilitator-notes-generator__field-edit-icon" />
                  </div>}
              </div>

              {/* Key Learning Moments Section */}
              <div className="facilitator-notes-generator__edit-section">
                <h4>Key Learning Moments</h4>
                {(stryMutAct_9fa48("18093") ? editingField !== 'key_learning_moments' : stryMutAct_9fa48("18092") ? false : stryMutAct_9fa48("18091") ? true : (stryCov_9fa48("18091", "18092", "18093"), editingField === (stryMutAct_9fa48("18094") ? "" : (stryCov_9fa48("18094"), 'key_learning_moments')))) ? <div className="facilitator-notes-generator__field-editor">
                    <textarea value={editingFieldValue} onChange={stryMutAct_9fa48("18095") ? () => undefined : (stryCov_9fa48("18095"), e => setEditingFieldValue(e.target.value))} className="facilitator-notes-generator__edit-textarea" rows={3} placeholder="What to watch for, when to intervene..." />
                    <div className="facilitator-notes-generator__field-actions">
                      <button onClick={saveEditedField} className="btn-save">
                        <FaSave /> Save
                      </button>
                      <button onClick={cancelEditingField} className="btn-cancel">
                        <FaTimes /> Cancel
                      </button>
                    </div>
                  </div> : <div className="facilitator-notes-generator__field-display" onClick={stryMutAct_9fa48("18096") ? () => undefined : (stryCov_9fa48("18096"), () => startEditingField(stryMutAct_9fa48("18097") ? "" : (stryCov_9fa48("18097"), 'key_learning_moments'), editingTask.key_learning_moments))}>
                    <p>{stryMutAct_9fa48("18100") ? editingTask.key_learning_moments && 'Click to add key learning moments...' : stryMutAct_9fa48("18099") ? false : stryMutAct_9fa48("18098") ? true : (stryCov_9fa48("18098", "18099", "18100"), editingTask.key_learning_moments || (stryMutAct_9fa48("18101") ? "" : (stryCov_9fa48("18101"), 'Click to add key learning moments...')))}</p>
                    <FaEdit className="facilitator-notes-generator__field-edit-icon" />
                  </div>}
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
                  {(stryMutAct_9fa48("18104") ? editingTask.faqs || editingTask.faqs.length > 0 : stryMutAct_9fa48("18103") ? false : stryMutAct_9fa48("18102") ? true : (stryCov_9fa48("18102", "18103", "18104"), editingTask.faqs && (stryMutAct_9fa48("18107") ? editingTask.faqs.length <= 0 : stryMutAct_9fa48("18106") ? editingTask.faqs.length >= 0 : stryMutAct_9fa48("18105") ? true : (stryCov_9fa48("18105", "18106", "18107"), editingTask.faqs.length > 0)))) ? editingTask.faqs.map(stryMutAct_9fa48("18108") ? () => undefined : (stryCov_9fa48("18108"), (faq, faqIndex) => <div key={faqIndex} className="facilitator-notes-generator__faq-editor">
                        <div className="facilitator-notes-generator__faq-header">
                          <h5>FAQ #{stryMutAct_9fa48("18109") ? faqIndex - 1 : (stryCov_9fa48("18109"), faqIndex + 1)}</h5>
                          <button onClick={stryMutAct_9fa48("18110") ? () => undefined : (stryCov_9fa48("18110"), () => deleteFaq(faqIndex))} className="facilitator-notes-generator__delete-btn">
                            <FaTimes />
                          </button>
                        </div>
                        
                        {/* Question */}
                        <div className="facilitator-notes-generator__faq-field">
                          <label>Question:</label>
                          {(stryMutAct_9fa48("18113") ? editingField !== `faq-${faqIndex}-question` : stryMutAct_9fa48("18112") ? false : stryMutAct_9fa48("18111") ? true : (stryCov_9fa48("18111", "18112", "18113"), editingField === (stryMutAct_9fa48("18114") ? `` : (stryCov_9fa48("18114"), `faq-${faqIndex}-question`)))) ? <div className="facilitator-notes-generator__field-editor">
                              <input type="text" value={editingFieldValue} onChange={stryMutAct_9fa48("18115") ? () => undefined : (stryCov_9fa48("18115"), e => setEditingFieldValue(e.target.value))} className="facilitator-notes-generator__edit-input" placeholder="Enter the question..." />
                              <div className="facilitator-notes-generator__field-actions">
                                <button onClick={saveEditedField} className="btn-save">
                                  <FaSave />
                                </button>
                                <button onClick={cancelEditingField} className="btn-cancel">
                                  <FaTimes />
                                </button>
                              </div>
                            </div> : <div className="facilitator-notes-generator__field-display" onClick={stryMutAct_9fa48("18116") ? () => undefined : (stryCov_9fa48("18116"), () => startEditingField(stryMutAct_9fa48("18117") ? `` : (stryCov_9fa48("18117"), `faq-${faqIndex}-question`), faq.question))}>
                              <p>{stryMutAct_9fa48("18120") ? faq.question && 'Click to add question...' : stryMutAct_9fa48("18119") ? false : stryMutAct_9fa48("18118") ? true : (stryCov_9fa48("18118", "18119", "18120"), faq.question || (stryMutAct_9fa48("18121") ? "" : (stryCov_9fa48("18121"), 'Click to add question...')))}</p>
                              <FaEdit className="facilitator-notes-generator__field-edit-icon" />
                            </div>}
                        </div>

                        {/* Facilitator Response */}
                        <div className="facilitator-notes-generator__faq-field">
                          <label>Facilitator Response:</label>
                          {(stryMutAct_9fa48("18124") ? editingField !== `faq-${faqIndex}-facilitator_response` : stryMutAct_9fa48("18123") ? false : stryMutAct_9fa48("18122") ? true : (stryCov_9fa48("18122", "18123", "18124"), editingField === (stryMutAct_9fa48("18125") ? `` : (stryCov_9fa48("18125"), `faq-${faqIndex}-facilitator_response`)))) ? <div className="facilitator-notes-generator__field-editor">
                              <textarea value={editingFieldValue} onChange={stryMutAct_9fa48("18126") ? () => undefined : (stryCov_9fa48("18126"), e => setEditingFieldValue(e.target.value))} className="facilitator-notes-generator__edit-textarea" rows={3} placeholder="How the facilitator should respond..." />
                              <div className="facilitator-notes-generator__field-actions">
                                <button onClick={saveEditedField} className="btn-save">
                                  <FaSave />
                                </button>
                                <button onClick={cancelEditingField} className="btn-cancel">
                                  <FaTimes />
                                </button>
                              </div>
                            </div> : <div className="facilitator-notes-generator__field-display" onClick={stryMutAct_9fa48("18127") ? () => undefined : (stryCov_9fa48("18127"), () => startEditingField(stryMutAct_9fa48("18128") ? `` : (stryCov_9fa48("18128"), `faq-${faqIndex}-facilitator_response`), faq.facilitator_response))}>
                              <p>{stryMutAct_9fa48("18131") ? faq.facilitator_response && 'Click to add response...' : stryMutAct_9fa48("18130") ? false : stryMutAct_9fa48("18129") ? true : (stryCov_9fa48("18129", "18130", "18131"), faq.facilitator_response || (stryMutAct_9fa48("18132") ? "" : (stryCov_9fa48("18132"), 'Click to add response...')))}</p>
                              <FaEdit className="facilitator-notes-generator__field-edit-icon" />
                            </div>}
                        </div>

                        {/* Follow-up Questions */}
                        <div className="facilitator-notes-generator__faq-field">
                          <label>Follow-up Questions:</label>
                          {(stryMutAct_9fa48("18135") ? editingField !== `faq-${faqIndex}-follow_up_questions` : stryMutAct_9fa48("18134") ? false : stryMutAct_9fa48("18133") ? true : (stryCov_9fa48("18133", "18134", "18135"), editingField === (stryMutAct_9fa48("18136") ? `` : (stryCov_9fa48("18136"), `faq-${faqIndex}-follow_up_questions`)))) ? <div className="facilitator-notes-generator__field-editor">
                              <textarea value={editingFieldValue} onChange={stryMutAct_9fa48("18137") ? () => undefined : (stryCov_9fa48("18137"), e => setEditingFieldValue(e.target.value))} className="facilitator-notes-generator__edit-textarea" rows={2} placeholder="Questions facilitator can ask to guide thinking..." />
                              <div className="facilitator-notes-generator__field-actions">
                                <button onClick={saveEditedField} className="btn-save">
                                  <FaSave />
                                </button>
                                <button onClick={cancelEditingField} className="btn-cancel">
                                  <FaTimes />
                                </button>
                              </div>
                            </div> : <div className="facilitator-notes-generator__field-display" onClick={stryMutAct_9fa48("18138") ? () => undefined : (stryCov_9fa48("18138"), () => startEditingField(stryMutAct_9fa48("18139") ? `` : (stryCov_9fa48("18139"), `faq-${faqIndex}-follow_up_questions`), faq.follow_up_questions))}>
                              <p>{stryMutAct_9fa48("18142") ? faq.follow_up_questions && 'Click to add follow-up questions...' : stryMutAct_9fa48("18141") ? false : stryMutAct_9fa48("18140") ? true : (stryCov_9fa48("18140", "18141", "18142"), faq.follow_up_questions || (stryMutAct_9fa48("18143") ? "" : (stryCov_9fa48("18143"), 'Click to add follow-up questions...')))}</p>
                              <FaEdit className="facilitator-notes-generator__field-edit-icon" />
                            </div>}
                        </div>
                      </div>)) : <p className="facilitator-notes-generator__empty-faqs">No FAQs yet. Click "Add FAQ" to create one.</p>}
                </div>
              </div>

              {/* Success Indicators Section */}
              <div className="facilitator-notes-generator__edit-section">
                <h4>Success Indicators</h4>
                {(stryMutAct_9fa48("18146") ? editingField !== 'success_indicators' : stryMutAct_9fa48("18145") ? false : stryMutAct_9fa48("18144") ? true : (stryCov_9fa48("18144", "18145", "18146"), editingField === (stryMutAct_9fa48("18147") ? "" : (stryCov_9fa48("18147"), 'success_indicators')))) ? <div className="facilitator-notes-generator__field-editor">
                    <textarea value={editingFieldValue} onChange={stryMutAct_9fa48("18148") ? () => undefined : (stryCov_9fa48("18148"), e => setEditingFieldValue(e.target.value))} className="facilitator-notes-generator__edit-textarea" rows={3} placeholder="How to recognize when builders are on track..." />
                    <div className="facilitator-notes-generator__field-actions">
                      <button onClick={saveEditedField} className="btn-save">
                        <FaSave /> Save
                      </button>
                      <button onClick={cancelEditingField} className="btn-cancel">
                        <FaTimes /> Cancel
                      </button>
                    </div>
                  </div> : <div className="facilitator-notes-generator__field-display" onClick={stryMutAct_9fa48("18149") ? () => undefined : (stryCov_9fa48("18149"), () => startEditingField(stryMutAct_9fa48("18150") ? "" : (stryCov_9fa48("18150"), 'success_indicators'), editingTask.success_indicators))}>
                    <p>{stryMutAct_9fa48("18153") ? editingTask.success_indicators && 'Click to add success indicators...' : stryMutAct_9fa48("18152") ? false : stryMutAct_9fa48("18151") ? true : (stryCov_9fa48("18151", "18152", "18153"), editingTask.success_indicators || (stryMutAct_9fa48("18154") ? "" : (stryCov_9fa48("18154"), 'Click to add success indicators...')))}</p>
                    <FaEdit className="facilitator-notes-generator__field-edit-icon" />
                  </div>}
              </div>

              {/* Time Management Section */}
              <div className="facilitator-notes-generator__edit-section">
                <h4>Time Management</h4>
                {(stryMutAct_9fa48("18157") ? editingField !== 'time_management' : stryMutAct_9fa48("18156") ? false : stryMutAct_9fa48("18155") ? true : (stryCov_9fa48("18155", "18156", "18157"), editingField === (stryMutAct_9fa48("18158") ? "" : (stryCov_9fa48("18158"), 'time_management')))) ? <div className="facilitator-notes-generator__field-editor">
                    <textarea value={editingFieldValue} onChange={stryMutAct_9fa48("18159") ? () => undefined : (stryCov_9fa48("18159"), e => setEditingFieldValue(e.target.value))} className="facilitator-notes-generator__edit-textarea" rows={3} placeholder="Pacing guidance, what to do if running over/under time..." />
                    <div className="facilitator-notes-generator__field-actions">
                      <button onClick={saveEditedField} className="btn-save">
                        <FaSave /> Save
                      </button>
                      <button onClick={cancelEditingField} className="btn-cancel">
                        <FaTimes /> Cancel
                      </button>
                    </div>
                  </div> : <div className="facilitator-notes-generator__field-display" onClick={stryMutAct_9fa48("18160") ? () => undefined : (stryCov_9fa48("18160"), () => startEditingField(stryMutAct_9fa48("18161") ? "" : (stryCov_9fa48("18161"), 'time_management'), editingTask.time_management))}>
                    <p>{stryMutAct_9fa48("18164") ? editingTask.time_management && 'Click to add time management notes...' : stryMutAct_9fa48("18163") ? false : stryMutAct_9fa48("18162") ? true : (stryCov_9fa48("18162", "18163", "18164"), editingTask.time_management || (stryMutAct_9fa48("18165") ? "" : (stryCov_9fa48("18165"), 'Click to add time management notes...')))}</p>
                    <FaEdit className="facilitator-notes-generator__field-edit-icon" />
                  </div>}
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
        </div>)}

      {stryMutAct_9fa48("18168") ? !originalContent && !sessionData || <div className="facilitator-notes-generator__empty-state">
          <FaFileAlt size={48} />
          <h3>Ready for Facilitator Notes</h3>
          <p>Complete Phase 1 (JSON Generator) and Phase 2 (Session Tester) to generate facilitator notes</p>
        </div> : stryMutAct_9fa48("18167") ? false : stryMutAct_9fa48("18166") ? true : (stryCov_9fa48("18166", "18167", "18168"), (stryMutAct_9fa48("18170") ? !originalContent || !sessionData : stryMutAct_9fa48("18169") ? true : (stryCov_9fa48("18169", "18170"), (stryMutAct_9fa48("18171") ? originalContent : (stryCov_9fa48("18171"), !originalContent)) && (stryMutAct_9fa48("18172") ? sessionData : (stryCov_9fa48("18172"), !sessionData)))) && <div className="facilitator-notes-generator__empty-state">
          <FaFileAlt size={48} />
          <h3>Ready for Facilitator Notes</h3>
          <p>Complete Phase 1 (JSON Generator) and Phase 2 (Session Tester) to generate facilitator notes</p>
        </div>)}
    </div>;
  }
};
export default FacilitatorNotesGenerator;