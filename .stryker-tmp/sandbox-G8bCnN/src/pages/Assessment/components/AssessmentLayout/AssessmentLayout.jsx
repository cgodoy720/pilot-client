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
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaInfoCircle } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { useAuth } from '../../../../context/AuthContext';
import AssessmentLLMChat from '../AssessmentLLMChat/AssessmentLLMChat';
import AssessmentSubmissionPanel from '../AssessmentSubmissionPanel/AssessmentSubmissionPanel';
import AssessmentSubmissionDisplay from '../AssessmentSubmissionDisplay/AssessmentSubmissionDisplay';
import ResubmissionPanel from '../ResubmissionPanel/ResubmissionPanel';
import './AssessmentLayout.css';
function AssessmentLayout({
  readonly = stryMutAct_9fa48("12129") ? true : (stryCov_9fa48("12129"), false)
}) {
  if (stryMutAct_9fa48("12130")) {
    {}
  } else {
    stryCov_9fa48("12130");
    const {
      assessmentId
    } = useParams();
    const navigate = useNavigate();
    const {
      token,
      user
    } = useAuth();

    // Assessment data
    const [assessment, setAssessment] = useState(null);
    const [loading, setLoading] = useState(stryMutAct_9fa48("12131") ? false : (stryCov_9fa48("12131"), true));
    const [error, setError] = useState(stryMutAct_9fa48("12132") ? "Stryker was here!" : (stryCov_9fa48("12132"), ''));

    // Conversation state (separate from submission)
    const [conversationState, setConversationState] = useState(stryMutAct_9fa48("12133") ? {} : (stryCov_9fa48("12133"), {
      threadId: null,
      messages: stryMutAct_9fa48("12134") ? ["Stryker was here"] : (stryCov_9fa48("12134"), []),
      isLoading: stryMutAct_9fa48("12135") ? true : (stryCov_9fa48("12135"), false),
      error: null
    }));

    // Submission state (type-specific)
    const [submissionState, setSubmissionState] = useState(stryMutAct_9fa48("12136") ? {} : (stryCov_9fa48("12136"), {
      data: {},
      isDraft: stryMutAct_9fa48("12137") ? false : (stryCov_9fa48("12137"), true),
      lastSaved: null,
      isLoading: stryMutAct_9fa48("12138") ? true : (stryCov_9fa48("12138"), false)
    }));

    // UI state
    const [isSubmissionPanelOpen, setIsSubmissionPanelOpen] = useState(stryMutAct_9fa48("12139") ? true : (stryCov_9fa48("12139"), false));
    const [hasShownInstructions, setHasShownInstructions] = useState(stryMutAct_9fa48("12140") ? true : (stryCov_9fa48("12140"), false));

    // Resubmission state
    const [resubmissionMode, setResubmissionMode] = useState(null);
    const [existingSubmission, setExistingSubmission] = useState(null);

    // Fetch assessment data
    useEffect(() => {
      if (stryMutAct_9fa48("12141")) {
        {}
      } else {
        stryCov_9fa48("12141");
        fetchAssessment();
      }
    }, stryMutAct_9fa48("12142") ? [] : (stryCov_9fa48("12142"), [assessmentId]));

    // Show instructions on first load
    useEffect(() => {
      if (stryMutAct_9fa48("12143")) {
        {}
      } else {
        stryCov_9fa48("12143");
        if (stryMutAct_9fa48("12146") ? assessment || !hasShownInstructions : stryMutAct_9fa48("12145") ? false : stryMutAct_9fa48("12144") ? true : (stryCov_9fa48("12144", "12145", "12146"), assessment && (stryMutAct_9fa48("12147") ? hasShownInstructions : (stryCov_9fa48("12147"), !hasShownInstructions)))) {
          if (stryMutAct_9fa48("12148")) {
            {}
          } else {
            stryCov_9fa48("12148");
            showInstructions();
            setHasShownInstructions(stryMutAct_9fa48("12149") ? false : (stryCov_9fa48("12149"), true));
          }
        }
      }
    }, stryMutAct_9fa48("12150") ? [] : (stryCov_9fa48("12150"), [assessment, hasShownInstructions]));
    const fetchAssessment = async () => {
      if (stryMutAct_9fa48("12151")) {
        {}
      } else {
        stryCov_9fa48("12151");
        try {
          if (stryMutAct_9fa48("12152")) {
            {}
          } else {
            stryCov_9fa48("12152");
            setLoading(stryMutAct_9fa48("12153") ? false : (stryCov_9fa48("12153"), true));
            const endpoint = readonly ? stryMutAct_9fa48("12154") ? `` : (stryCov_9fa48("12154"), `${import.meta.env.VITE_API_URL}/api/assessments/${assessmentId}/readonly`) : stryMutAct_9fa48("12155") ? `` : (stryCov_9fa48("12155"), `${import.meta.env.VITE_API_URL}/api/assessments/${assessmentId}`);
            const response = await fetch(endpoint, stryMutAct_9fa48("12156") ? {} : (stryCov_9fa48("12156"), {
              headers: stryMutAct_9fa48("12157") ? {} : (stryCov_9fa48("12157"), {
                'Authorization': stryMutAct_9fa48("12158") ? `` : (stryCov_9fa48("12158"), `Bearer ${token}`),
                'Content-Type': stryMutAct_9fa48("12159") ? "" : (stryCov_9fa48("12159"), 'application/json')
              })
            }));
            if (stryMutAct_9fa48("12161") ? false : stryMutAct_9fa48("12160") ? true : (stryCov_9fa48("12160", "12161"), response.ok)) {
              if (stryMutAct_9fa48("12162")) {
                {}
              } else {
                stryCov_9fa48("12162");
                const data = await response.json();
                setAssessment(data.assessment);

                // Load existing submission if exists
                if (stryMutAct_9fa48("12164") ? false : stryMutAct_9fa48("12163") ? true : (stryCov_9fa48("12163", "12164"), data.submission)) {
                  if (stryMutAct_9fa48("12165")) {
                    {}
                  } else {
                    stryCov_9fa48("12165");
                    setSubmissionState(stryMutAct_9fa48("12166") ? () => undefined : (stryCov_9fa48("12166"), prev => stryMutAct_9fa48("12167") ? {} : (stryCov_9fa48("12167"), {
                      ...prev,
                      data: stryMutAct_9fa48("12170") ? data.submission.submission_data && {} : stryMutAct_9fa48("12169") ? false : stryMutAct_9fa48("12168") ? true : (stryCov_9fa48("12168", "12169", "12170"), data.submission.submission_data || {}),
                      isDraft: stryMutAct_9fa48("12173") ? data.submission.status === 'submitted' : stryMutAct_9fa48("12172") ? false : stryMutAct_9fa48("12171") ? true : (stryCov_9fa48("12171", "12172", "12173"), data.submission.status !== (stryMutAct_9fa48("12174") ? "" : (stryCov_9fa48("12174"), 'submitted'))),
                      lastSaved: data.submission.updated_at
                    })));

                    // Load existing conversation data if exists
                    if (stryMutAct_9fa48("12176") ? false : stryMutAct_9fa48("12175") ? true : (stryCov_9fa48("12175", "12176"), data.submission.llm_conversation_data)) {
                      if (stryMutAct_9fa48("12177")) {
                        {}
                      } else {
                        stryCov_9fa48("12177");
                        setConversationState(stryMutAct_9fa48("12178") ? () => undefined : (stryCov_9fa48("12178"), prev => stryMutAct_9fa48("12179") ? {} : (stryCov_9fa48("12179"), {
                          ...prev,
                          messages: stryMutAct_9fa48("12182") ? data.submission.llm_conversation_data.messages && [] : stryMutAct_9fa48("12181") ? false : stryMutAct_9fa48("12180") ? true : (stryCov_9fa48("12180", "12181", "12182"), data.submission.llm_conversation_data.messages || (stryMutAct_9fa48("12183") ? ["Stryker was here"] : (stryCov_9fa48("12183"), []))),
                          threadId: stryMutAct_9fa48("12186") ? data.submission.llm_conversation_data.thread_id && null : stryMutAct_9fa48("12185") ? false : stryMutAct_9fa48("12184") ? true : (stryCov_9fa48("12184", "12185", "12186"), data.submission.llm_conversation_data.thread_id || null)
                        })));
                      }
                    }

                    // Check for resubmission requirements
                    if (stryMutAct_9fa48("12189") ? data.submission.resubmission_allowed || data.submission.status === 'submitted' : stryMutAct_9fa48("12188") ? false : stryMutAct_9fa48("12187") ? true : (stryCov_9fa48("12187", "12188", "12189"), data.submission.resubmission_allowed && (stryMutAct_9fa48("12191") ? data.submission.status !== 'submitted' : stryMutAct_9fa48("12190") ? true : (stryCov_9fa48("12190", "12191"), data.submission.status === (stryMutAct_9fa48("12192") ? "" : (stryCov_9fa48("12192"), 'submitted')))))) {
                      if (stryMutAct_9fa48("12193")) {
                        {}
                      } else {
                        stryCov_9fa48("12193");
                        setExistingSubmission(data.submission);

                        // Determine resubmission type
                        if (stryMutAct_9fa48("12196") ? data.submission.needs_file_resubmission || data.submission.needs_video_resubmission : stryMutAct_9fa48("12195") ? false : stryMutAct_9fa48("12194") ? true : (stryCov_9fa48("12194", "12195", "12196"), data.submission.needs_file_resubmission && data.submission.needs_video_resubmission)) {
                          if (stryMutAct_9fa48("12197")) {
                            {}
                          } else {
                            stryCov_9fa48("12197");
                            setResubmissionMode(stryMutAct_9fa48("12198") ? "" : (stryCov_9fa48("12198"), 'files_and_video'));
                          }
                        } else if (stryMutAct_9fa48("12200") ? false : stryMutAct_9fa48("12199") ? true : (stryCov_9fa48("12199", "12200"), data.submission.needs_file_resubmission)) {
                          if (stryMutAct_9fa48("12201")) {
                            {}
                          } else {
                            stryCov_9fa48("12201");
                            setResubmissionMode(stryMutAct_9fa48("12202") ? "" : (stryCov_9fa48("12202"), 'files_only'));
                          }
                        } else if (stryMutAct_9fa48("12204") ? false : stryMutAct_9fa48("12203") ? true : (stryCov_9fa48("12203", "12204"), data.submission.needs_video_resubmission)) {
                          if (stryMutAct_9fa48("12205")) {
                            {}
                          } else {
                            stryCov_9fa48("12205");
                            setResubmissionMode(stryMutAct_9fa48("12206") ? "" : (stryCov_9fa48("12206"), 'video_only'));
                          }
                        } else {
                          if (stryMutAct_9fa48("12207")) {
                            {}
                          } else {
                            stryCov_9fa48("12207");
                            setResubmissionMode(stryMutAct_9fa48("12208") ? "" : (stryCov_9fa48("12208"), 'general'));
                          }
                        }
                      }
                    }
                  }
                }
              }
            } else {
              if (stryMutAct_9fa48("12209")) {
                {}
              } else {
                stryCov_9fa48("12209");
                const errorData = await response.json();
                setError(stryMutAct_9fa48("12212") ? errorData.error && 'Failed to load assessment' : stryMutAct_9fa48("12211") ? false : stryMutAct_9fa48("12210") ? true : (stryCov_9fa48("12210", "12211", "12212"), errorData.error || (stryMutAct_9fa48("12213") ? "" : (stryCov_9fa48("12213"), 'Failed to load assessment'))));
              }
            }
          }
        } catch (err) {
          if (stryMutAct_9fa48("12214")) {
            {}
          } else {
            stryCov_9fa48("12214");
            console.error(stryMutAct_9fa48("12215") ? "" : (stryCov_9fa48("12215"), 'Error fetching assessment:'), err);
            setError(stryMutAct_9fa48("12216") ? "" : (stryCov_9fa48("12216"), 'Unable to load assessment. Please try again later.'));
          }
        } finally {
          if (stryMutAct_9fa48("12217")) {
            {}
          } else {
            stryCov_9fa48("12217");
            setLoading(stryMutAct_9fa48("12218") ? true : (stryCov_9fa48("12218"), false));
          }
        }
      }
    };
    const formatInstructions = text => {
      if (stryMutAct_9fa48("12219")) {
        {}
      } else {
        stryCov_9fa48("12219");
        if (stryMutAct_9fa48("12222") ? false : stryMutAct_9fa48("12221") ? true : stryMutAct_9fa48("12220") ? text : (stryCov_9fa48("12220", "12221", "12222"), !text)) return stryMutAct_9fa48("12223") ? "" : (stryCov_9fa48("12223"), 'Instructions will be loaded...');
        let formattedText = stryMutAct_9fa48("12224") ? "Stryker was here!" : (stryCov_9fa48("12224"), '');
        const sections = text.split(stryMutAct_9fa48("12225") ? "" : (stryCov_9fa48("12225"), '\n\n'));
        sections.forEach(section => {
          if (stryMutAct_9fa48("12226")) {
            {}
          } else {
            stryCov_9fa48("12226");
            const lines = section.split(stryMutAct_9fa48("12227") ? "" : (stryCov_9fa48("12227"), '\n'));
            if (stryMutAct_9fa48("12229") ? false : stryMutAct_9fa48("12228") ? true : (stryCov_9fa48("12228", "12229"), section.includes(stryMutAct_9fa48("12230") ? "" : (stryCov_9fa48("12230"), 'Things you might want to explore:')))) {
              if (stryMutAct_9fa48("12231")) {
                {}
              } else {
                stryCov_9fa48("12231");
                const mainText = stryMutAct_9fa48("12232") ? lines[0].replace('Things you might want to explore:', '') : (stryCov_9fa48("12232"), lines[0].replace(stryMutAct_9fa48("12233") ? "" : (stryCov_9fa48("12233"), 'Things you might want to explore:'), stryMutAct_9fa48("12234") ? "Stryker was here!" : (stryCov_9fa48("12234"), '')).trim());
                if (stryMutAct_9fa48("12236") ? false : stryMutAct_9fa48("12235") ? true : (stryCov_9fa48("12235", "12236"), mainText)) {
                  if (stryMutAct_9fa48("12237")) {
                    {}
                  } else {
                    stryCov_9fa48("12237");
                    formattedText += stryMutAct_9fa48("12238") ? `` : (stryCov_9fa48("12238"), `<p>${mainText}</p>`);
                  }
                }
                formattedText += stryMutAct_9fa48("12239") ? `` : (stryCov_9fa48("12239"), `<p><strong>Things you might want to explore:</strong></p><ul>`);
                stryMutAct_9fa48("12240") ? lines.forEach(line => {
                  const trimmed = line.trim();
                  if (trimmed && (trimmed.startsWith('-') || trimmed.startsWith('•'))) {
                    const cleanLine = trimmed.replace(/^[-•]\s*/, '');
                    formattedText += `<li>${cleanLine}</li>`;
                  }
                }) : (stryCov_9fa48("12240"), lines.slice(1).forEach(line => {
                  if (stryMutAct_9fa48("12241")) {
                    {}
                  } else {
                    stryCov_9fa48("12241");
                    const trimmed = stryMutAct_9fa48("12242") ? line : (stryCov_9fa48("12242"), line.trim());
                    if (stryMutAct_9fa48("12245") ? trimmed || trimmed.startsWith('-') || trimmed.startsWith('•') : stryMutAct_9fa48("12244") ? false : stryMutAct_9fa48("12243") ? true : (stryCov_9fa48("12243", "12244", "12245"), trimmed && (stryMutAct_9fa48("12247") ? trimmed.startsWith('-') && trimmed.startsWith('•') : stryMutAct_9fa48("12246") ? true : (stryCov_9fa48("12246", "12247"), (stryMutAct_9fa48("12248") ? trimmed.endsWith('-') : (stryCov_9fa48("12248"), trimmed.startsWith(stryMutAct_9fa48("12249") ? "" : (stryCov_9fa48("12249"), '-')))) || (stryMutAct_9fa48("12250") ? trimmed.endsWith('•') : (stryCov_9fa48("12250"), trimmed.startsWith(stryMutAct_9fa48("12251") ? "" : (stryCov_9fa48("12251"), '•')))))))) {
                      if (stryMutAct_9fa48("12252")) {
                        {}
                      } else {
                        stryCov_9fa48("12252");
                        const cleanLine = trimmed.replace(stryMutAct_9fa48("12256") ? /^[-•]\S*/ : stryMutAct_9fa48("12255") ? /^[-•]\s/ : stryMutAct_9fa48("12254") ? /^[^-•]\s*/ : stryMutAct_9fa48("12253") ? /[-•]\s*/ : (stryCov_9fa48("12253", "12254", "12255", "12256"), /^[-•]\s*/), stryMutAct_9fa48("12257") ? "Stryker was here!" : (stryCov_9fa48("12257"), ''));
                        formattedText += stryMutAct_9fa48("12258") ? `` : (stryCov_9fa48("12258"), `<li>${cleanLine}</li>`);
                      }
                    }
                  }
                }));
                formattedText += stryMutAct_9fa48("12259") ? `` : (stryCov_9fa48("12259"), `</ul>`);
              }
            } else if (stryMutAct_9fa48("12261") ? false : stryMutAct_9fa48("12260") ? true : (stryCov_9fa48("12260", "12261"), section.includes(stryMutAct_9fa48("12262") ? "" : (stryCov_9fa48("12262"), 'Deliverables:')))) {
              if (stryMutAct_9fa48("12263")) {
                {}
              } else {
                stryCov_9fa48("12263");
                formattedText += stryMutAct_9fa48("12264") ? `` : (stryCov_9fa48("12264"), `<p><strong>Deliverables:</strong></p><ul>`);
                lines.forEach(line => {
                  if (stryMutAct_9fa48("12265")) {
                    {}
                  } else {
                    stryCov_9fa48("12265");
                    const trimmed = stryMutAct_9fa48("12266") ? line : (stryCov_9fa48("12266"), line.trim());
                    if (stryMutAct_9fa48("12269") ? trimmed || !trimmed.includes('Deliverables:') : stryMutAct_9fa48("12268") ? false : stryMutAct_9fa48("12267") ? true : (stryCov_9fa48("12267", "12268", "12269"), trimmed && (stryMutAct_9fa48("12270") ? trimmed.includes('Deliverables:') : (stryCov_9fa48("12270"), !trimmed.includes(stryMutAct_9fa48("12271") ? "" : (stryCov_9fa48("12271"), 'Deliverables:')))))) {
                      if (stryMutAct_9fa48("12272")) {
                        {}
                      } else {
                        stryCov_9fa48("12272");
                        const cleanLine = trimmed.replace(stryMutAct_9fa48("12276") ? /^[-•]\S*/ : stryMutAct_9fa48("12275") ? /^[-•]\s/ : stryMutAct_9fa48("12274") ? /^[^-•]\s*/ : stryMutAct_9fa48("12273") ? /[-•]\s*/ : (stryCov_9fa48("12273", "12274", "12275", "12276"), /^[-•]\s*/), stryMutAct_9fa48("12277") ? "Stryker was here!" : (stryCov_9fa48("12277"), ''));
                        if (stryMutAct_9fa48("12279") ? false : stryMutAct_9fa48("12278") ? true : (stryCov_9fa48("12278", "12279"), cleanLine)) {
                          if (stryMutAct_9fa48("12280")) {
                            {}
                          } else {
                            stryCov_9fa48("12280");
                            formattedText += stryMutAct_9fa48("12281") ? `` : (stryCov_9fa48("12281"), `<li>${cleanLine}</li>`);
                          }
                        }
                      }
                    }
                  }
                });
                formattedText += stryMutAct_9fa48("12282") ? `` : (stryCov_9fa48("12282"), `</ul>`);
              }
            } else {
              if (stryMutAct_9fa48("12283")) {
                {}
              } else {
                stryCov_9fa48("12283");
                const cleanSection = stryMutAct_9fa48("12284") ? section : (stryCov_9fa48("12284"), section.trim());
                if (stryMutAct_9fa48("12286") ? false : stryMutAct_9fa48("12285") ? true : (stryCov_9fa48("12285", "12286"), cleanSection)) {
                  if (stryMutAct_9fa48("12287")) {
                    {}
                  } else {
                    stryCov_9fa48("12287");
                    formattedText += stryMutAct_9fa48("12288") ? `` : (stryCov_9fa48("12288"), `<p>${cleanSection.replace(/\n/g, stryMutAct_9fa48("12289") ? "" : (stryCov_9fa48("12289"), '<br>'))}</p>`);
                  }
                }
              }
            }
          }
        });
        return formattedText;
      }
    };
    const showInstructions = () => {
      if (stryMutAct_9fa48("12290")) {
        {}
      } else {
        stryCov_9fa48("12290");
        Swal.fire(stryMutAct_9fa48("12291") ? {} : (stryCov_9fa48("12291"), {
          title: stryMutAct_9fa48("12292") ? "" : (stryCov_9fa48("12292"), 'Assessment Instructions'),
          html: formatInstructions(stryMutAct_9fa48("12293") ? assessment.instructions : (stryCov_9fa48("12293"), assessment?.instructions)),
          showCancelButton: stryMutAct_9fa48("12294") ? true : (stryCov_9fa48("12294"), false),
          confirmButtonText: stryMutAct_9fa48("12295") ? "" : (stryCov_9fa48("12295"), 'Got it, let\'s start!'),
          confirmButtonColor: stryMutAct_9fa48("12296") ? "" : (stryCov_9fa48("12296"), '#4242ea'),
          width: stryMutAct_9fa48("12297") ? "" : (stryCov_9fa48("12297"), '600px'),
          background: stryMutAct_9fa48("12298") ? "" : (stryCov_9fa48("12298"), '#1A1F2C'),
          color: stryMutAct_9fa48("12299") ? "" : (stryCov_9fa48("12299"), 'var(--color-text-primary)'),
          customClass: stryMutAct_9fa48("12300") ? {} : (stryCov_9fa48("12300"), {
            popup: stryMutAct_9fa48("12301") ? "" : (stryCov_9fa48("12301"), 'swal2-popup-dark'),
            title: stryMutAct_9fa48("12302") ? "" : (stryCov_9fa48("12302"), 'swal2-title-custom'),
            htmlContainer: stryMutAct_9fa48("12303") ? "" : (stryCov_9fa48("12303"), 'swal2-html-custom'),
            confirmButton: stryMutAct_9fa48("12304") ? "" : (stryCov_9fa48("12304"), 'swal2-confirm-custom'),
            actions: stryMutAct_9fa48("12305") ? "" : (stryCov_9fa48("12305"), 'swal2-actions-custom')
          })
        }));
      }
    };
    const handleConversationUpdate = conversationData => {
      if (stryMutAct_9fa48("12306")) {
        {}
      } else {
        stryCov_9fa48("12306");
        // Auto-save conversation data separately
        saveConversationData(conversationData);
      }
    };
    const handleSubmissionUpdate = submissionData => {
      if (stryMutAct_9fa48("12307")) {
        {}
      } else {
        stryCov_9fa48("12307");
        console.log(stryMutAct_9fa48("12308") ? "" : (stryCov_9fa48("12308"), 'AssessmentLayout: Received submission update:'), submissionData);

        // Update submission state immediately (no auto-save)
        setSubmissionState(stryMutAct_9fa48("12309") ? () => undefined : (stryCov_9fa48("12309"), prev => stryMutAct_9fa48("12310") ? {} : (stryCov_9fa48("12310"), {
          ...prev,
          data: submissionData,
          isDraft: stryMutAct_9fa48("12311") ? false : (stryCov_9fa48("12311"), true)
        })));
      }
    };
    const saveConversationData = async conversationData => {
      if (stryMutAct_9fa48("12312")) {
        {}
      } else {
        stryCov_9fa48("12312");
        try {
          if (stryMutAct_9fa48("12313")) {
            {}
          } else {
            stryCov_9fa48("12313");
            await fetch(stryMutAct_9fa48("12314") ? `` : (stryCov_9fa48("12314"), `${import.meta.env.VITE_API_URL}/api/assessments/${assessmentId}/llm-conversation`), stryMutAct_9fa48("12315") ? {} : (stryCov_9fa48("12315"), {
              method: stryMutAct_9fa48("12316") ? "" : (stryCov_9fa48("12316"), 'POST'),
              headers: stryMutAct_9fa48("12317") ? {} : (stryCov_9fa48("12317"), {
                'Authorization': stryMutAct_9fa48("12318") ? `` : (stryCov_9fa48("12318"), `Bearer ${token}`),
                'Content-Type': stryMutAct_9fa48("12319") ? "" : (stryCov_9fa48("12319"), 'application/json')
              }),
              body: JSON.stringify(stryMutAct_9fa48("12320") ? {} : (stryCov_9fa48("12320"), {
                conversation_data: conversationData
              }))
            }));
          }
        } catch (error) {
          if (stryMutAct_9fa48("12321")) {
            {}
          } else {
            stryCov_9fa48("12321");
            console.error(stryMutAct_9fa48("12322") ? "" : (stryCov_9fa48("12322"), 'Error saving conversation:'), error);
          }
        }
      }
    };
    const saveSubmissionData = async (submissionData, status = stryMutAct_9fa48("12323") ? "" : (stryCov_9fa48("12323"), 'submitted')) => {
      if (stryMutAct_9fa48("12324")) {
        {}
      } else {
        stryCov_9fa48("12324");
        try {
          if (stryMutAct_9fa48("12325")) {
            {}
          } else {
            stryCov_9fa48("12325");
            console.log(stryMutAct_9fa48("12326") ? "" : (stryCov_9fa48("12326"), 'AssessmentLayout: Saving submission data to backend:'), stryMutAct_9fa48("12327") ? {} : (stryCov_9fa48("12327"), {
              submissionData,
              status
            }));
            const response = await fetch(stryMutAct_9fa48("12328") ? `` : (stryCov_9fa48("12328"), `${import.meta.env.VITE_API_URL}/api/assessments/${assessmentId}/submissions`), stryMutAct_9fa48("12329") ? {} : (stryCov_9fa48("12329"), {
              method: stryMutAct_9fa48("12330") ? "" : (stryCov_9fa48("12330"), 'POST'),
              headers: stryMutAct_9fa48("12331") ? {} : (stryCov_9fa48("12331"), {
                'Authorization': stryMutAct_9fa48("12332") ? `` : (stryCov_9fa48("12332"), `Bearer ${token}`),
                'Content-Type': stryMutAct_9fa48("12333") ? "" : (stryCov_9fa48("12333"), 'application/json')
              }),
              body: JSON.stringify(stryMutAct_9fa48("12334") ? {} : (stryCov_9fa48("12334"), {
                submission_data: submissionData,
                status: status
              }))
            }));
            if (stryMutAct_9fa48("12336") ? false : stryMutAct_9fa48("12335") ? true : (stryCov_9fa48("12335", "12336"), response.ok)) {
              if (stryMutAct_9fa48("12337")) {
                {}
              } else {
                stryCov_9fa48("12337");
                console.log(stryMutAct_9fa48("12338") ? "" : (stryCov_9fa48("12338"), 'AssessmentLayout: Submission data saved successfully'));
                return stryMutAct_9fa48("12339") ? false : (stryCov_9fa48("12339"), true);
              }
            } else {
              if (stryMutAct_9fa48("12340")) {
                {}
              } else {
                stryCov_9fa48("12340");
                console.error(stryMutAct_9fa48("12341") ? "" : (stryCov_9fa48("12341"), 'AssessmentLayout: Failed to save submission data:'), response.status);
                return stryMutAct_9fa48("12342") ? true : (stryCov_9fa48("12342"), false);
              }
            }
          }
        } catch (error) {
          if (stryMutAct_9fa48("12343")) {
            {}
          } else {
            stryCov_9fa48("12343");
            console.error(stryMutAct_9fa48("12344") ? "" : (stryCov_9fa48("12344"), 'Error saving submission:'), error);
            return stryMutAct_9fa48("12345") ? true : (stryCov_9fa48("12345"), false);
          }
        }
      }
    };
    const handleFinalSubmission = async submissionData => {
      if (stryMutAct_9fa48("12346")) {
        {}
      } else {
        stryCov_9fa48("12346");
        try {
          if (stryMutAct_9fa48("12347")) {
            {}
          } else {
            stryCov_9fa48("12347");
            setSubmissionState(stryMutAct_9fa48("12348") ? () => undefined : (stryCov_9fa48("12348"), prev => stryMutAct_9fa48("12349") ? {} : (stryCov_9fa48("12349"), {
              ...prev,
              isLoading: stryMutAct_9fa48("12350") ? false : (stryCov_9fa48("12350"), true)
            })));
            const success = await saveSubmissionData(submissionData, stryMutAct_9fa48("12351") ? "" : (stryCov_9fa48("12351"), 'submitted'));
            if (stryMutAct_9fa48("12354") ? false : stryMutAct_9fa48("12353") ? true : stryMutAct_9fa48("12352") ? success : (stryCov_9fa48("12352", "12353", "12354"), !success)) {
              if (stryMutAct_9fa48("12355")) {
                {}
              } else {
                stryCov_9fa48("12355");
                setSubmissionState(stryMutAct_9fa48("12356") ? () => undefined : (stryCov_9fa48("12356"), prev => stryMutAct_9fa48("12357") ? {} : (stryCov_9fa48("12357"), {
                  ...prev,
                  isLoading: stryMutAct_9fa48("12358") ? true : (stryCov_9fa48("12358"), false)
                })));
                Swal.fire(stryMutAct_9fa48("12359") ? {} : (stryCov_9fa48("12359"), {
                  title: stryMutAct_9fa48("12360") ? "" : (stryCov_9fa48("12360"), 'Submission Failed'),
                  text: stryMutAct_9fa48("12361") ? "" : (stryCov_9fa48("12361"), 'There was an error submitting your assessment. Please try again.'),
                  icon: stryMutAct_9fa48("12362") ? "" : (stryCov_9fa48("12362"), 'error'),
                  confirmButtonColor: stryMutAct_9fa48("12363") ? "" : (stryCov_9fa48("12363"), '#dc3545'),
                  background: stryMutAct_9fa48("12364") ? "" : (stryCov_9fa48("12364"), '#1A1F2C'),
                  color: stryMutAct_9fa48("12365") ? "" : (stryCov_9fa48("12365"), 'var(--color-text-primary)')
                }));
                return;
              }
            }
            setSubmissionState(stryMutAct_9fa48("12366") ? () => undefined : (stryCov_9fa48("12366"), prev => stryMutAct_9fa48("12367") ? {} : (stryCov_9fa48("12367"), {
              ...prev,
              data: submissionData,
              isDraft: stryMutAct_9fa48("12368") ? true : (stryCov_9fa48("12368"), false),
              isLoading: stryMutAct_9fa48("12369") ? true : (stryCov_9fa48("12369"), false),
              lastSaved: new Date().toISOString()
            })));

            // Show success message with navigation option
            Swal.fire(stryMutAct_9fa48("12370") ? {} : (stryCov_9fa48("12370"), {
              title: stryMutAct_9fa48("12371") ? "" : (stryCov_9fa48("12371"), 'Assessment Submitted!'),
              text: stryMutAct_9fa48("12372") ? "" : (stryCov_9fa48("12372"), 'Your assessment has been successfully submitted. The next assessment may now be unlocked.'),
              icon: stryMutAct_9fa48("12373") ? "" : (stryCov_9fa48("12373"), 'success'),
              showCancelButton: stryMutAct_9fa48("12374") ? false : (stryCov_9fa48("12374"), true),
              confirmButtonText: stryMutAct_9fa48("12375") ? "" : (stryCov_9fa48("12375"), 'Back to Assessments'),
              cancelButtonText: stryMutAct_9fa48("12376") ? "" : (stryCov_9fa48("12376"), 'Stay Here'),
              confirmButtonColor: stryMutAct_9fa48("12377") ? "" : (stryCov_9fa48("12377"), '#28a745'),
              cancelButtonColor: stryMutAct_9fa48("12378") ? "" : (stryCov_9fa48("12378"), '#6c757d'),
              background: stryMutAct_9fa48("12379") ? "" : (stryCov_9fa48("12379"), '#1A1F2C'),
              color: stryMutAct_9fa48("12380") ? "" : (stryCov_9fa48("12380"), 'var(--color-text-primary)'),
              customClass: stryMutAct_9fa48("12381") ? {} : (stryCov_9fa48("12381"), {
                popup: stryMutAct_9fa48("12382") ? "" : (stryCov_9fa48("12382"), 'swal2-popup-dark'),
                confirmButton: stryMutAct_9fa48("12383") ? "" : (stryCov_9fa48("12383"), 'swal2-confirm-custom'),
                cancelButton: stryMutAct_9fa48("12384") ? "" : (stryCov_9fa48("12384"), 'swal2-cancel-custom')
              })
            })).then(result => {
              if (stryMutAct_9fa48("12385")) {
                {}
              } else {
                stryCov_9fa48("12385");
                if (stryMutAct_9fa48("12387") ? false : stryMutAct_9fa48("12386") ? true : (stryCov_9fa48("12386", "12387"), result.isConfirmed)) {
                  if (stryMutAct_9fa48("12388")) {
                    {}
                  } else {
                    stryCov_9fa48("12388");
                    navigate(stryMutAct_9fa48("12389") ? "" : (stryCov_9fa48("12389"), '/assessment'));
                  }
                }
              }
            });

            // Close submission panel
            setIsSubmissionPanelOpen(stryMutAct_9fa48("12390") ? true : (stryCov_9fa48("12390"), false));
          }
        } catch (error) {
          if (stryMutAct_9fa48("12391")) {
            {}
          } else {
            stryCov_9fa48("12391");
            console.error(stryMutAct_9fa48("12392") ? "" : (stryCov_9fa48("12392"), 'Error submitting assessment:'), error);
            setSubmissionState(stryMutAct_9fa48("12393") ? () => undefined : (stryCov_9fa48("12393"), prev => stryMutAct_9fa48("12394") ? {} : (stryCov_9fa48("12394"), {
              ...prev,
              isLoading: stryMutAct_9fa48("12395") ? true : (stryCov_9fa48("12395"), false)
            })));
            Swal.fire(stryMutAct_9fa48("12396") ? {} : (stryCov_9fa48("12396"), {
              title: stryMutAct_9fa48("12397") ? "" : (stryCov_9fa48("12397"), 'Submission Failed'),
              text: stryMutAct_9fa48("12398") ? "" : (stryCov_9fa48("12398"), 'There was an error submitting your assessment. Please try again.'),
              icon: stryMutAct_9fa48("12399") ? "" : (stryCov_9fa48("12399"), 'error'),
              confirmButtonColor: stryMutAct_9fa48("12400") ? "" : (stryCov_9fa48("12400"), '#dc3545'),
              background: stryMutAct_9fa48("12401") ? "" : (stryCov_9fa48("12401"), '#1A1F2C'),
              color: stryMutAct_9fa48("12402") ? "" : (stryCov_9fa48("12402"), 'var(--color-text-primary)')
            }));
          }
        }
      }
    };
    const handleResubmissionSubmit = async resubmissionData => {
      if (stryMutAct_9fa48("12403")) {
        {}
      } else {
        stryCov_9fa48("12403");
        try {
          if (stryMutAct_9fa48("12404")) {
            {}
          } else {
            stryCov_9fa48("12404");
            setSubmissionState(stryMutAct_9fa48("12405") ? () => undefined : (stryCov_9fa48("12405"), prev => stryMutAct_9fa48("12406") ? {} : (stryCov_9fa48("12406"), {
              ...prev,
              isLoading: stryMutAct_9fa48("12407") ? false : (stryCov_9fa48("12407"), true)
            })));
            const response = await fetch(stryMutAct_9fa48("12408") ? `` : (stryCov_9fa48("12408"), `${import.meta.env.VITE_API_URL}/api/assessments/${assessmentId}/submissions`), stryMutAct_9fa48("12409") ? {} : (stryCov_9fa48("12409"), {
              method: stryMutAct_9fa48("12410") ? "" : (stryCov_9fa48("12410"), 'POST'),
              headers: stryMutAct_9fa48("12411") ? {} : (stryCov_9fa48("12411"), {
                'Authorization': stryMutAct_9fa48("12412") ? `` : (stryCov_9fa48("12412"), `Bearer ${token}`),
                'Content-Type': stryMutAct_9fa48("12413") ? "" : (stryCov_9fa48("12413"), 'application/json')
              }),
              body: JSON.stringify(stryMutAct_9fa48("12414") ? {} : (stryCov_9fa48("12414"), {
                submission_data: resubmissionData,
                status: stryMutAct_9fa48("12415") ? "" : (stryCov_9fa48("12415"), 'submitted')
              }))
            }));
            if (stryMutAct_9fa48("12417") ? false : stryMutAct_9fa48("12416") ? true : (stryCov_9fa48("12416", "12417"), response.ok)) {
              if (stryMutAct_9fa48("12418")) {
                {}
              } else {
                stryCov_9fa48("12418");
                await Swal.fire(stryMutAct_9fa48("12419") ? {} : (stryCov_9fa48("12419"), {
                  title: stryMutAct_9fa48("12420") ? "" : (stryCov_9fa48("12420"), 'Resubmission Complete!'),
                  text: stryMutAct_9fa48("12421") ? "" : (stryCov_9fa48("12421"), 'Your resubmission has been successfully submitted.'),
                  icon: stryMutAct_9fa48("12422") ? "" : (stryCov_9fa48("12422"), 'success'),
                  confirmButtonColor: stryMutAct_9fa48("12423") ? "" : (stryCov_9fa48("12423"), '#10b981'),
                  background: stryMutAct_9fa48("12424") ? "" : (stryCov_9fa48("12424"), '#1A1F2C'),
                  color: stryMutAct_9fa48("12425") ? "" : (stryCov_9fa48("12425"), 'var(--color-text-primary)')
                }));

                // Navigate back to assessments list
                navigate(stryMutAct_9fa48("12426") ? "" : (stryCov_9fa48("12426"), '/assessment'));
              }
            } else {
              if (stryMutAct_9fa48("12427")) {
                {}
              } else {
                stryCov_9fa48("12427");
                const errorData = await response.json();
                throw new Error(stryMutAct_9fa48("12430") ? errorData.error && 'Resubmission failed' : stryMutAct_9fa48("12429") ? false : stryMutAct_9fa48("12428") ? true : (stryCov_9fa48("12428", "12429", "12430"), errorData.error || (stryMutAct_9fa48("12431") ? "" : (stryCov_9fa48("12431"), 'Resubmission failed'))));
              }
            }
          }
        } catch (error) {
          if (stryMutAct_9fa48("12432")) {
            {}
          } else {
            stryCov_9fa48("12432");
            console.error(stryMutAct_9fa48("12433") ? "" : (stryCov_9fa48("12433"), 'Error submitting resubmission:'), error);
            setSubmissionState(stryMutAct_9fa48("12434") ? () => undefined : (stryCov_9fa48("12434"), prev => stryMutAct_9fa48("12435") ? {} : (stryCov_9fa48("12435"), {
              ...prev,
              isLoading: stryMutAct_9fa48("12436") ? true : (stryCov_9fa48("12436"), false)
            })));
            Swal.fire(stryMutAct_9fa48("12437") ? {} : (stryCov_9fa48("12437"), {
              title: stryMutAct_9fa48("12438") ? "" : (stryCov_9fa48("12438"), 'Resubmission Failed'),
              text: stryMutAct_9fa48("12441") ? error.message && 'There was an error submitting your resubmission. Please try again.' : stryMutAct_9fa48("12440") ? false : stryMutAct_9fa48("12439") ? true : (stryCov_9fa48("12439", "12440", "12441"), error.message || (stryMutAct_9fa48("12442") ? "" : (stryCov_9fa48("12442"), 'There was an error submitting your resubmission. Please try again.'))),
              icon: stryMutAct_9fa48("12443") ? "" : (stryCov_9fa48("12443"), 'error'),
              confirmButtonColor: stryMutAct_9fa48("12444") ? "" : (stryCov_9fa48("12444"), '#dc3545'),
              background: stryMutAct_9fa48("12445") ? "" : (stryCov_9fa48("12445"), '#1A1F2C'),
              color: stryMutAct_9fa48("12446") ? "" : (stryCov_9fa48("12446"), 'var(--color-text-primary)')
            }));
          }
        }
      }
    };
    const handleResubmissionCancel = () => {
      if (stryMutAct_9fa48("12447")) {
        {}
      } else {
        stryCov_9fa48("12447");
        navigate(stryMutAct_9fa48("12448") ? "" : (stryCov_9fa48("12448"), '/assessment'));
      }
    };
    const getAssessmentTypeName = type => {
      if (stryMutAct_9fa48("12449")) {
        {}
      } else {
        stryCov_9fa48("12449");
        const typeMap = stryMutAct_9fa48("12450") ? {} : (stryCov_9fa48("12450"), {
          'business': stryMutAct_9fa48("12451") ? "" : (stryCov_9fa48("12451"), 'Business Assessment'),
          'technical': stryMutAct_9fa48("12452") ? "" : (stryCov_9fa48("12452"), 'Technical Assessment'),
          'professional': stryMutAct_9fa48("12453") ? "" : (stryCov_9fa48("12453"), 'Professional Assessment'),
          'self': stryMutAct_9fa48("12454") ? "" : (stryCov_9fa48("12454"), 'Self Assessment')
        });
        return stryMutAct_9fa48("12457") ? typeMap[type] && type : stryMutAct_9fa48("12456") ? false : stryMutAct_9fa48("12455") ? true : (stryCov_9fa48("12455", "12456", "12457"), typeMap[type] || type);
      }
    };
    if (stryMutAct_9fa48("12459") ? false : stryMutAct_9fa48("12458") ? true : (stryCov_9fa48("12458", "12459"), loading)) {
      if (stryMutAct_9fa48("12460")) {
        {}
      } else {
        stryCov_9fa48("12460");
        return <div className="assessment-layout">
        <div className="assessment-layout__loading">
          <div className="assessment-layout__loading-spinner"></div>
          <p>Loading assessment...</p>
        </div>
      </div>;
      }
    }
    if (stryMutAct_9fa48("12463") ? error && !assessment : stryMutAct_9fa48("12462") ? false : stryMutAct_9fa48("12461") ? true : (stryCov_9fa48("12461", "12462", "12463"), error || (stryMutAct_9fa48("12464") ? assessment : (stryCov_9fa48("12464"), !assessment)))) {
      if (stryMutAct_9fa48("12465")) {
        {}
      } else {
        stryCov_9fa48("12465");
        return <div className="assessment-layout">
        <div className="assessment-layout__error">
          <h2>Error Loading Assessment</h2>
          <p>{error}</p>
          <button onClick={stryMutAct_9fa48("12466") ? () => undefined : (stryCov_9fa48("12466"), () => navigate(stryMutAct_9fa48("12467") ? "" : (stryCov_9fa48("12467"), '/assessment')))} className="assessment-layout__back-btn">
            Back to Assessments
          </button>
        </div>
      </div>;
      }
    }

    // Show resubmission panel if in resubmission mode
    if (stryMutAct_9fa48("12469") ? false : stryMutAct_9fa48("12468") ? true : (stryCov_9fa48("12468", "12469"), resubmissionMode)) {
      if (stryMutAct_9fa48("12470")) {
        {}
      } else {
        stryCov_9fa48("12470");
        return <div className="assessment-layout assessment-layout--resubmission">
        <ResubmissionPanel assessmentType={assessment.assessment_type} resubmissionType={resubmissionMode} existingSubmission={existingSubmission} onSubmit={handleResubmissionSubmit} onCancel={handleResubmissionCancel} isLoading={submissionState.isLoading} />
      </div>;
      }
    }
    return <div className={stryMutAct_9fa48("12471") ? `` : (stryCov_9fa48("12471"), `assessment-layout ${readonly ? stryMutAct_9fa48("12472") ? "" : (stryCov_9fa48("12472"), 'assessment-layout--readonly') : stryMutAct_9fa48("12473") ? "Stryker was here!" : (stryCov_9fa48("12473"), '')}`)}>
      {/* Main Content Area - Chat takes up full space */}
      <div className="assessment-layout__content">
        
        {/* LLM Chat Section - Always prominent with integrated buttons */}
        <div className="assessment-layout__chat-section">
          <AssessmentLLMChat assessmentId={assessmentId} onConversationUpdate={readonly ? null : handleConversationUpdate} initialConversation={conversationState} disabled={stryMutAct_9fa48("12476") ? readonly && submissionState.isLoading : stryMutAct_9fa48("12475") ? false : stryMutAct_9fa48("12474") ? true : (stryCov_9fa48("12474", "12475", "12476"), readonly || submissionState.isLoading)} onShowInstructions={showInstructions} onBackToAssessments={stryMutAct_9fa48("12477") ? () => undefined : (stryCov_9fa48("12477"), () => navigate(stryMutAct_9fa48("12478") ? "" : (stryCov_9fa48("12478"), '/assessment')))} onSubmitDeliverables={readonly ? null : stryMutAct_9fa48("12479") ? () => undefined : (stryCov_9fa48("12479"), () => setIsSubmissionPanelOpen(stryMutAct_9fa48("12480") ? isSubmissionPanelOpen : (stryCov_9fa48("12480"), !isSubmissionPanelOpen)))} isSubmissionPanelOpen={isSubmissionPanelOpen} readonly={readonly} />
        </div>

        {/* Read-only Submission Display */}
        {stryMutAct_9fa48("12483") ? readonly && submissionState.data || <div className="assessment-layout__submission-display">
            <AssessmentSubmissionDisplay assessmentType={assessment?.assessment_type} submissionData={submissionState.data} />
          </div> : stryMutAct_9fa48("12482") ? false : stryMutAct_9fa48("12481") ? true : (stryCov_9fa48("12481", "12482", "12483"), (stryMutAct_9fa48("12485") ? readonly || submissionState.data : stryMutAct_9fa48("12484") ? true : (stryCov_9fa48("12484", "12485"), readonly && submissionState.data)) && <div className="assessment-layout__submission-display">
            <AssessmentSubmissionDisplay assessmentType={stryMutAct_9fa48("12486") ? assessment.assessment_type : (stryCov_9fa48("12486"), assessment?.assessment_type)} submissionData={submissionState.data} />
          </div>)}

        {/* Sliding Submission Panel */}
        {stryMutAct_9fa48("12489") ? !readonly && isSubmissionPanelOpen || <AssessmentSubmissionPanel assessmentType={assessment.assessment_type} submissionData={submissionState.data} isDraft={submissionState.isDraft} isLoading={submissionState.isLoading} onUpdate={handleSubmissionUpdate} onSubmit={handleFinalSubmission} onClose={() => setIsSubmissionPanelOpen(false)} /> : stryMutAct_9fa48("12488") ? false : stryMutAct_9fa48("12487") ? true : (stryCov_9fa48("12487", "12488", "12489"), (stryMutAct_9fa48("12491") ? !readonly || isSubmissionPanelOpen : stryMutAct_9fa48("12490") ? true : (stryCov_9fa48("12490", "12491"), (stryMutAct_9fa48("12492") ? readonly : (stryCov_9fa48("12492"), !readonly)) && isSubmissionPanelOpen)) && <AssessmentSubmissionPanel assessmentType={assessment.assessment_type} submissionData={submissionState.data} isDraft={submissionState.isDraft} isLoading={submissionState.isLoading} onUpdate={handleSubmissionUpdate} onSubmit={handleFinalSubmission} onClose={stryMutAct_9fa48("12493") ? () => undefined : (stryCov_9fa48("12493"), () => setIsSubmissionPanelOpen(stryMutAct_9fa48("12494") ? true : (stryCov_9fa48("12494"), false)))} />)}
      </div>
    </div>;
  }
}
export default AssessmentLayout;