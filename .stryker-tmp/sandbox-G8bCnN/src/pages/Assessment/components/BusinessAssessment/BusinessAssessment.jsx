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
import { FaArrowLeft, FaPaperPlane, FaSave, FaCheck, FaInfoCircle } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { useAuth } from '../../../../context/AuthContext';
import AssessmentLLMChat from '../AssessmentLLMChat/AssessmentLLMChat';
import './BusinessAssessment.css';
function BusinessAssessment() {
  if (stryMutAct_9fa48("13608")) {
    {}
  } else {
    stryCov_9fa48("13608");
    const {
      token,
      user
    } = useAuth();
    const {
      assessmentId
    } = useParams();
    const navigate = useNavigate();
    const [assessment, setAssessment] = useState(null);
    const [submission, setSubmission] = useState(null);
    const [loading, setLoading] = useState(stryMutAct_9fa48("13609") ? false : (stryCov_9fa48("13609"), true));
    const [error, setError] = useState(stryMutAct_9fa48("13610") ? "Stryker was here!" : (stryCov_9fa48("13610"), ''));
    const [saving, setSaving] = useState(stryMutAct_9fa48("13611") ? true : (stryCov_9fa48("13611"), false));
    const [submitting, setSubmitting] = useState(stryMutAct_9fa48("13612") ? true : (stryCov_9fa48("13612"), false));

    // Form state
    const [problemStatement, setProblemStatement] = useState(stryMutAct_9fa48("13613") ? "Stryker was here!" : (stryCov_9fa48("13613"), ''));
    const [proposedSolution, setProposedSolution] = useState(stryMutAct_9fa48("13614") ? "Stryker was here!" : (stryCov_9fa48("13614"), ''));
    const [conversationData, setConversationData] = useState(null);

    // Modal state
    const [hasShownInstructions, setHasShownInstructions] = useState(stryMutAct_9fa48("13615") ? true : (stryCov_9fa48("13615"), false));

    // Check if user has active status
    const isActive = stryMutAct_9fa48("13618") ? user?.active === false : stryMutAct_9fa48("13617") ? false : stryMutAct_9fa48("13616") ? true : (stryCov_9fa48("13616", "13617", "13618"), (stryMutAct_9fa48("13619") ? user.active : (stryCov_9fa48("13619"), user?.active)) !== (stryMutAct_9fa48("13620") ? true : (stryCov_9fa48("13620"), false)));
    useEffect(() => {
      if (stryMutAct_9fa48("13621")) {
        {}
      } else {
        stryCov_9fa48("13621");
        fetchAssessmentData();
      }
    }, stryMutAct_9fa48("13622") ? [] : (stryCov_9fa48("13622"), [assessmentId]));
    useEffect(() => {
      if (stryMutAct_9fa48("13623")) {
        {}
      } else {
        stryCov_9fa48("13623");
        if (stryMutAct_9fa48("13626") ? assessment || !hasShownInstructions : stryMutAct_9fa48("13625") ? false : stryMutAct_9fa48("13624") ? true : (stryCov_9fa48("13624", "13625", "13626"), assessment && (stryMutAct_9fa48("13627") ? hasShownInstructions : (stryCov_9fa48("13627"), !hasShownInstructions)))) {
          if (stryMutAct_9fa48("13628")) {
            {}
          } else {
            stryCov_9fa48("13628");
            showInstructionsModal();
            setHasShownInstructions(stryMutAct_9fa48("13629") ? false : (stryCov_9fa48("13629"), true));
          }
        }
      }
    }, stryMutAct_9fa48("13630") ? [] : (stryCov_9fa48("13630"), [assessment, hasShownInstructions]));
    const fetchAssessmentData = async () => {
      if (stryMutAct_9fa48("13631")) {
        {}
      } else {
        stryCov_9fa48("13631");
        try {
          if (stryMutAct_9fa48("13632")) {
            {}
          } else {
            stryCov_9fa48("13632");
            setLoading(stryMutAct_9fa48("13633") ? false : (stryCov_9fa48("13633"), true));
            const response = await fetch(stryMutAct_9fa48("13634") ? `` : (stryCov_9fa48("13634"), `${import.meta.env.VITE_API_URL}/api/assessments/${assessmentId}`), stryMutAct_9fa48("13635") ? {} : (stryCov_9fa48("13635"), {
              headers: stryMutAct_9fa48("13636") ? {} : (stryCov_9fa48("13636"), {
                'Authorization': stryMutAct_9fa48("13637") ? `` : (stryCov_9fa48("13637"), `Bearer ${token}`),
                'Content-Type': stryMutAct_9fa48("13638") ? "" : (stryCov_9fa48("13638"), 'application/json')
              })
            }));
            if (stryMutAct_9fa48("13640") ? false : stryMutAct_9fa48("13639") ? true : (stryCov_9fa48("13639", "13640"), response.ok)) {
              if (stryMutAct_9fa48("13641")) {
                {}
              } else {
                stryCov_9fa48("13641");
                const data = await response.json();
                setAssessment(data.assessment);
                setSubmission(data.submission);

                // Load existing submission data if available
                if (stryMutAct_9fa48("13643") ? false : stryMutAct_9fa48("13642") ? true : (stryCov_9fa48("13642", "13643"), data.submission)) {
                  if (stryMutAct_9fa48("13644")) {
                    {}
                  } else {
                    stryCov_9fa48("13644");
                    const submissionData = stryMutAct_9fa48("13647") ? data.submission.submission_data && {} : stryMutAct_9fa48("13646") ? false : stryMutAct_9fa48("13645") ? true : (stryCov_9fa48("13645", "13646", "13647"), data.submission.submission_data || {});
                    setProblemStatement(stryMutAct_9fa48("13650") ? submissionData.deliverables?.problem_statement?.content && '' : stryMutAct_9fa48("13649") ? false : stryMutAct_9fa48("13648") ? true : (stryCov_9fa48("13648", "13649", "13650"), (stryMutAct_9fa48("13652") ? submissionData.deliverables.problem_statement?.content : stryMutAct_9fa48("13651") ? submissionData.deliverables?.problem_statement.content : (stryCov_9fa48("13651", "13652"), submissionData.deliverables?.problem_statement?.content)) || (stryMutAct_9fa48("13653") ? "Stryker was here!" : (stryCov_9fa48("13653"), ''))));
                    setProposedSolution(stryMutAct_9fa48("13656") ? submissionData.deliverables?.proposed_solution?.content && '' : stryMutAct_9fa48("13655") ? false : stryMutAct_9fa48("13654") ? true : (stryCov_9fa48("13654", "13655", "13656"), (stryMutAct_9fa48("13658") ? submissionData.deliverables.proposed_solution?.content : stryMutAct_9fa48("13657") ? submissionData.deliverables?.proposed_solution.content : (stryCov_9fa48("13657", "13658"), submissionData.deliverables?.proposed_solution?.content)) || (stryMutAct_9fa48("13659") ? "Stryker was here!" : (stryCov_9fa48("13659"), ''))));
                    setConversationData(data.submission.llm_conversation_data);
                  }
                }
              }
            } else {
              if (stryMutAct_9fa48("13660")) {
                {}
              } else {
                stryCov_9fa48("13660");
                const errorData = await response.json();
                setError(stryMutAct_9fa48("13663") ? errorData.error && 'Failed to load assessment' : stryMutAct_9fa48("13662") ? false : stryMutAct_9fa48("13661") ? true : (stryCov_9fa48("13661", "13662", "13663"), errorData.error || (stryMutAct_9fa48("13664") ? "" : (stryCov_9fa48("13664"), 'Failed to load assessment'))));
              }
            }
          }
        } catch (err) {
          if (stryMutAct_9fa48("13665")) {
            {}
          } else {
            stryCov_9fa48("13665");
            console.error(stryMutAct_9fa48("13666") ? "" : (stryCov_9fa48("13666"), 'Error fetching assessment:'), err);
            setError(stryMutAct_9fa48("13667") ? "" : (stryCov_9fa48("13667"), 'Unable to load assessment. Please try again later.'));
          }
        } finally {
          if (stryMutAct_9fa48("13668")) {
            {}
          } else {
            stryCov_9fa48("13668");
            setLoading(stryMutAct_9fa48("13669") ? true : (stryCov_9fa48("13669"), false));
          }
        }
      }
    };
    const handleConversationUpdate = conversationData => {
      if (stryMutAct_9fa48("13670")) {
        {}
      } else {
        stryCov_9fa48("13670");
        setConversationData(conversationData);
        // Auto-save conversation data
        saveConversationData(conversationData);
      }
    };
    const saveConversationData = async conversationData => {
      if (stryMutAct_9fa48("13671")) {
        {}
      } else {
        stryCov_9fa48("13671");
        try {
          if (stryMutAct_9fa48("13672")) {
            {}
          } else {
            stryCov_9fa48("13672");
            await fetch(stryMutAct_9fa48("13673") ? `` : (stryCov_9fa48("13673"), `${import.meta.env.VITE_API_URL}/api/assessments/${assessmentId}/llm-conversation`), stryMutAct_9fa48("13674") ? {} : (stryCov_9fa48("13674"), {
              method: stryMutAct_9fa48("13675") ? "" : (stryCov_9fa48("13675"), 'POST'),
              headers: stryMutAct_9fa48("13676") ? {} : (stryCov_9fa48("13676"), {
                'Authorization': stryMutAct_9fa48("13677") ? `` : (stryCov_9fa48("13677"), `Bearer ${token}`),
                'Content-Type': stryMutAct_9fa48("13678") ? "" : (stryCov_9fa48("13678"), 'application/json')
              }),
              body: JSON.stringify(stryMutAct_9fa48("13679") ? {} : (stryCov_9fa48("13679"), {
                conversation_data: conversationData
              }))
            }));
          }
        } catch (error) {
          if (stryMutAct_9fa48("13680")) {
            {}
          } else {
            stryCov_9fa48("13680");
            console.error(stryMutAct_9fa48("13681") ? "" : (stryCov_9fa48("13681"), 'Error saving conversation data:'), error);
          }
        }
      }
    };
    const saveDraft = async () => {
      if (stryMutAct_9fa48("13682")) {
        {}
      } else {
        stryCov_9fa48("13682");
        if (stryMutAct_9fa48("13685") ? false : stryMutAct_9fa48("13684") ? true : stryMutAct_9fa48("13683") ? isActive : (stryCov_9fa48("13683", "13684", "13685"), !isActive)) return;
        try {
          if (stryMutAct_9fa48("13686")) {
            {}
          } else {
            stryCov_9fa48("13686");
            setSaving(stryMutAct_9fa48("13687") ? false : (stryCov_9fa48("13687"), true));
            const submissionData = stryMutAct_9fa48("13688") ? {} : (stryCov_9fa48("13688"), {
              assessment_type: stryMutAct_9fa48("13689") ? "" : (stryCov_9fa48("13689"), 'business'),
              deliverables: stryMutAct_9fa48("13690") ? {} : (stryCov_9fa48("13690"), {
                problem_statement: stryMutAct_9fa48("13691") ? {} : (stryCov_9fa48("13691"), {
                  type: stryMutAct_9fa48("13692") ? "" : (stryCov_9fa48("13692"), 'text'),
                  content: stryMutAct_9fa48("13693") ? problemStatement : (stryCov_9fa48("13693"), problemStatement.trim()),
                  word_count: stryMutAct_9fa48("13694") ? problemStatement.split(' ').length : (stryCov_9fa48("13694"), problemStatement.trim().split(stryMutAct_9fa48("13695") ? "" : (stryCov_9fa48("13695"), ' ')).length),
                  submitted_at: new Date().toISOString()
                }),
                proposed_solution: stryMutAct_9fa48("13696") ? {} : (stryCov_9fa48("13696"), {
                  type: stryMutAct_9fa48("13697") ? "" : (stryCov_9fa48("13697"), 'text'),
                  content: stryMutAct_9fa48("13698") ? proposedSolution : (stryCov_9fa48("13698"), proposedSolution.trim()),
                  word_count: stryMutAct_9fa48("13699") ? proposedSolution.split(' ').length : (stryCov_9fa48("13699"), proposedSolution.trim().split(stryMutAct_9fa48("13700") ? "" : (stryCov_9fa48("13700"), ' ')).length),
                  submitted_at: new Date().toISOString()
                })
              }),
              metadata: stryMutAct_9fa48("13701") ? {} : (stryCov_9fa48("13701"), {
                submission_timestamp: new Date().toISOString(),
                user_agent: navigator.userAgent
              })
            });
            const response = await fetch(stryMutAct_9fa48("13702") ? `` : (stryCov_9fa48("13702"), `${import.meta.env.VITE_API_URL}/api/assessments/${assessmentId}/submissions`), stryMutAct_9fa48("13703") ? {} : (stryCov_9fa48("13703"), {
              method: stryMutAct_9fa48("13704") ? "" : (stryCov_9fa48("13704"), 'POST'),
              headers: stryMutAct_9fa48("13705") ? {} : (stryCov_9fa48("13705"), {
                'Authorization': stryMutAct_9fa48("13706") ? `` : (stryCov_9fa48("13706"), `Bearer ${token}`),
                'Content-Type': stryMutAct_9fa48("13707") ? "" : (stryCov_9fa48("13707"), 'application/json')
              }),
              body: JSON.stringify(stryMutAct_9fa48("13708") ? {} : (stryCov_9fa48("13708"), {
                submission_data: submissionData,
                status: stryMutAct_9fa48("13709") ? "" : (stryCov_9fa48("13709"), 'draft')
              }))
            }));
            if (stryMutAct_9fa48("13711") ? false : stryMutAct_9fa48("13710") ? true : (stryCov_9fa48("13710", "13711"), response.ok)) {
              if (stryMutAct_9fa48("13712")) {
                {}
              } else {
                stryCov_9fa48("13712");
                const data = await response.json();
                setSubmission(data.submission);
              }
            } else {
              if (stryMutAct_9fa48("13713")) {
                {}
              } else {
                stryCov_9fa48("13713");
                const errorData = await response.json();
                setError(stryMutAct_9fa48("13716") ? errorData.error && 'Failed to save draft' : stryMutAct_9fa48("13715") ? false : stryMutAct_9fa48("13714") ? true : (stryCov_9fa48("13714", "13715", "13716"), errorData.error || (stryMutAct_9fa48("13717") ? "" : (stryCov_9fa48("13717"), 'Failed to save draft'))));
              }
            }
          }
        } catch (error) {
          if (stryMutAct_9fa48("13718")) {
            {}
          } else {
            stryCov_9fa48("13718");
            console.error(stryMutAct_9fa48("13719") ? "" : (stryCov_9fa48("13719"), 'Error saving draft:'), error);
            setError(stryMutAct_9fa48("13720") ? "" : (stryCov_9fa48("13720"), 'Unable to save draft. Please try again.'));
          }
        } finally {
          if (stryMutAct_9fa48("13721")) {
            {}
          } else {
            stryCov_9fa48("13721");
            setSaving(stryMutAct_9fa48("13722") ? true : (stryCov_9fa48("13722"), false));
          }
        }
      }
    };
    const submitAssessment = async () => {
      if (stryMutAct_9fa48("13723")) {
        {}
      } else {
        stryCov_9fa48("13723");
        if (stryMutAct_9fa48("13726") ? false : stryMutAct_9fa48("13725") ? true : stryMutAct_9fa48("13724") ? isActive : (stryCov_9fa48("13724", "13725", "13726"), !isActive)) return;

        // Validate required fields
        if (stryMutAct_9fa48("13729") ? false : stryMutAct_9fa48("13728") ? true : stryMutAct_9fa48("13727") ? problemStatement.trim() : (stryCov_9fa48("13727", "13728", "13729"), !(stryMutAct_9fa48("13730") ? problemStatement : (stryCov_9fa48("13730"), problemStatement.trim())))) {
          if (stryMutAct_9fa48("13731")) {
            {}
          } else {
            stryCov_9fa48("13731");
            setError(stryMutAct_9fa48("13732") ? "" : (stryCov_9fa48("13732"), 'Please enter your problem statement.'));
            return;
          }
        }
        if (stryMutAct_9fa48("13735") ? false : stryMutAct_9fa48("13734") ? true : stryMutAct_9fa48("13733") ? proposedSolution.trim() : (stryCov_9fa48("13733", "13734", "13735"), !(stryMutAct_9fa48("13736") ? proposedSolution : (stryCov_9fa48("13736"), proposedSolution.trim())))) {
          if (stryMutAct_9fa48("13737")) {
            {}
          } else {
            stryCov_9fa48("13737");
            setError(stryMutAct_9fa48("13738") ? "" : (stryCov_9fa48("13738"), 'Please enter your proposed solution.'));
            return;
          }
        }
        try {
          if (stryMutAct_9fa48("13739")) {
            {}
          } else {
            stryCov_9fa48("13739");
            setSubmitting(stryMutAct_9fa48("13740") ? false : (stryCov_9fa48("13740"), true));
            const submissionData = stryMutAct_9fa48("13741") ? {} : (stryCov_9fa48("13741"), {
              assessment_type: stryMutAct_9fa48("13742") ? "" : (stryCov_9fa48("13742"), 'business'),
              deliverables: stryMutAct_9fa48("13743") ? {} : (stryCov_9fa48("13743"), {
                problem_statement: stryMutAct_9fa48("13744") ? {} : (stryCov_9fa48("13744"), {
                  type: stryMutAct_9fa48("13745") ? "" : (stryCov_9fa48("13745"), 'text'),
                  content: stryMutAct_9fa48("13746") ? problemStatement : (stryCov_9fa48("13746"), problemStatement.trim()),
                  word_count: stryMutAct_9fa48("13747") ? problemStatement.split(' ').length : (stryCov_9fa48("13747"), problemStatement.trim().split(stryMutAct_9fa48("13748") ? "" : (stryCov_9fa48("13748"), ' ')).length),
                  submitted_at: new Date().toISOString()
                }),
                proposed_solution: stryMutAct_9fa48("13749") ? {} : (stryCov_9fa48("13749"), {
                  type: stryMutAct_9fa48("13750") ? "" : (stryCov_9fa48("13750"), 'text'),
                  content: stryMutAct_9fa48("13751") ? proposedSolution : (stryCov_9fa48("13751"), proposedSolution.trim()),
                  word_count: stryMutAct_9fa48("13752") ? proposedSolution.split(' ').length : (stryCov_9fa48("13752"), proposedSolution.trim().split(stryMutAct_9fa48("13753") ? "" : (stryCov_9fa48("13753"), ' ')).length),
                  submitted_at: new Date().toISOString()
                })
              }),
              metadata: stryMutAct_9fa48("13754") ? {} : (stryCov_9fa48("13754"), {
                submission_timestamp: new Date().toISOString(),
                user_agent: navigator.userAgent
              })
            });
            const response = await fetch(stryMutAct_9fa48("13755") ? `` : (stryCov_9fa48("13755"), `${import.meta.env.VITE_API_URL}/api/assessments/${assessmentId}/submissions`), stryMutAct_9fa48("13756") ? {} : (stryCov_9fa48("13756"), {
              method: stryMutAct_9fa48("13757") ? "" : (stryCov_9fa48("13757"), 'POST'),
              headers: stryMutAct_9fa48("13758") ? {} : (stryCov_9fa48("13758"), {
                'Authorization': stryMutAct_9fa48("13759") ? `` : (stryCov_9fa48("13759"), `Bearer ${token}`),
                'Content-Type': stryMutAct_9fa48("13760") ? "" : (stryCov_9fa48("13760"), 'application/json')
              }),
              body: JSON.stringify(stryMutAct_9fa48("13761") ? {} : (stryCov_9fa48("13761"), {
                submission_data: submissionData,
                status: stryMutAct_9fa48("13762") ? "" : (stryCov_9fa48("13762"), 'submitted')
              }))
            }));
            if (stryMutAct_9fa48("13764") ? false : stryMutAct_9fa48("13763") ? true : (stryCov_9fa48("13763", "13764"), response.ok)) {
              if (stryMutAct_9fa48("13765")) {
                {}
              } else {
                stryCov_9fa48("13765");
                const data = await response.json();
                setSubmission(data.submission);
                // Navigate back to main assessment page
                navigate(stryMutAct_9fa48("13766") ? "" : (stryCov_9fa48("13766"), '/assessment'));
              }
            } else {
              if (stryMutAct_9fa48("13767")) {
                {}
              } else {
                stryCov_9fa48("13767");
                const errorData = await response.json();
                setError(stryMutAct_9fa48("13770") ? errorData.error && 'Failed to submit assessment' : stryMutAct_9fa48("13769") ? false : stryMutAct_9fa48("13768") ? true : (stryCov_9fa48("13768", "13769", "13770"), errorData.error || (stryMutAct_9fa48("13771") ? "" : (stryCov_9fa48("13771"), 'Failed to submit assessment'))));
              }
            }
          }
        } catch (error) {
          if (stryMutAct_9fa48("13772")) {
            {}
          } else {
            stryCov_9fa48("13772");
            console.error(stryMutAct_9fa48("13773") ? "" : (stryCov_9fa48("13773"), 'Error submitting assessment:'), error);
            setError(stryMutAct_9fa48("13774") ? "" : (stryCov_9fa48("13774"), 'Unable to submit assessment. Please try again.'));
          }
        } finally {
          if (stryMutAct_9fa48("13775")) {
            {}
          } else {
            stryCov_9fa48("13775");
            setSubmitting(stryMutAct_9fa48("13776") ? true : (stryCov_9fa48("13776"), false));
          }
        }
      }
    };
    const showInstructionsModal = () => {
      if (stryMutAct_9fa48("13777")) {
        {}
      } else {
        stryCov_9fa48("13777");
        // Format instructions text to convert line breaks and create proper lists
        const formatInstructions = text => {
          if (stryMutAct_9fa48("13778")) {
            {}
          } else {
            stryCov_9fa48("13778");
            if (stryMutAct_9fa48("13781") ? false : stryMutAct_9fa48("13780") ? true : stryMutAct_9fa48("13779") ? text : (stryCov_9fa48("13779", "13780", "13781"), !text)) return stryMutAct_9fa48("13782") ? "" : (stryCov_9fa48("13782"), 'Instructions will be loaded...');
            let formattedText = stryMutAct_9fa48("13783") ? "Stryker was here!" : (stryCov_9fa48("13783"), '');

            // Split the text into sections
            const sections = text.split(stryMutAct_9fa48("13784") ? "" : (stryCov_9fa48("13784"), '\n\n'));
            sections.forEach((section, index) => {
              if (stryMutAct_9fa48("13785")) {
                {}
              } else {
                stryCov_9fa48("13785");
                const lines = section.split(stryMutAct_9fa48("13786") ? "" : (stryCov_9fa48("13786"), '\n'));
                if (stryMutAct_9fa48("13788") ? false : stryMutAct_9fa48("13787") ? true : (stryCov_9fa48("13787", "13788"), section.includes(stryMutAct_9fa48("13789") ? "" : (stryCov_9fa48("13789"), 'Things you might want to explore:')))) {
                  if (stryMutAct_9fa48("13790")) {
                    {}
                  } else {
                    stryCov_9fa48("13790");
                    // Extract the main paragraph before the list
                    const mainText = stryMutAct_9fa48("13791") ? lines[0].replace('Things you might want to explore:', '') : (stryCov_9fa48("13791"), lines[0].replace(stryMutAct_9fa48("13792") ? "" : (stryCov_9fa48("13792"), 'Things you might want to explore:'), stryMutAct_9fa48("13793") ? "Stryker was here!" : (stryCov_9fa48("13793"), '')).trim());
                    if (stryMutAct_9fa48("13795") ? false : stryMutAct_9fa48("13794") ? true : (stryCov_9fa48("13794", "13795"), mainText)) {
                      if (stryMutAct_9fa48("13796")) {
                        {}
                      } else {
                        stryCov_9fa48("13796");
                        formattedText += stryMutAct_9fa48("13797") ? `` : (stryCov_9fa48("13797"), `<p>${mainText}</p>`);
                      }
                    }
                    formattedText += stryMutAct_9fa48("13798") ? `` : (stryCov_9fa48("13798"), `<p><strong>Things you might want to explore:</strong></p>`);
                    formattedText += stryMutAct_9fa48("13799") ? `` : (stryCov_9fa48("13799"), `<ul>`);
                    stryMutAct_9fa48("13800") ? lines.forEach(line => {
                      const trimmed = line.trim();
                      if (trimmed && (trimmed.startsWith('-') || trimmed.startsWith('•'))) {
                        const cleanLine = trimmed.replace(/^[-•]\s*/, '');
                        formattedText += `<li>${cleanLine}</li>`;
                      }
                    }) : (stryCov_9fa48("13800"), lines.slice(1).forEach(line => {
                      if (stryMutAct_9fa48("13801")) {
                        {}
                      } else {
                        stryCov_9fa48("13801");
                        const trimmed = stryMutAct_9fa48("13802") ? line : (stryCov_9fa48("13802"), line.trim());
                        if (stryMutAct_9fa48("13805") ? trimmed || trimmed.startsWith('-') || trimmed.startsWith('•') : stryMutAct_9fa48("13804") ? false : stryMutAct_9fa48("13803") ? true : (stryCov_9fa48("13803", "13804", "13805"), trimmed && (stryMutAct_9fa48("13807") ? trimmed.startsWith('-') && trimmed.startsWith('•') : stryMutAct_9fa48("13806") ? true : (stryCov_9fa48("13806", "13807"), (stryMutAct_9fa48("13808") ? trimmed.endsWith('-') : (stryCov_9fa48("13808"), trimmed.startsWith(stryMutAct_9fa48("13809") ? "" : (stryCov_9fa48("13809"), '-')))) || (stryMutAct_9fa48("13810") ? trimmed.endsWith('•') : (stryCov_9fa48("13810"), trimmed.startsWith(stryMutAct_9fa48("13811") ? "" : (stryCov_9fa48("13811"), '•')))))))) {
                          if (stryMutAct_9fa48("13812")) {
                            {}
                          } else {
                            stryCov_9fa48("13812");
                            const cleanLine = trimmed.replace(stryMutAct_9fa48("13816") ? /^[-•]\S*/ : stryMutAct_9fa48("13815") ? /^[-•]\s/ : stryMutAct_9fa48("13814") ? /^[^-•]\s*/ : stryMutAct_9fa48("13813") ? /[-•]\s*/ : (stryCov_9fa48("13813", "13814", "13815", "13816"), /^[-•]\s*/), stryMutAct_9fa48("13817") ? "Stryker was here!" : (stryCov_9fa48("13817"), ''));
                            formattedText += stryMutAct_9fa48("13818") ? `` : (stryCov_9fa48("13818"), `<li>${cleanLine}</li>`);
                          }
                        }
                      }
                    }));
                    formattedText += stryMutAct_9fa48("13819") ? `` : (stryCov_9fa48("13819"), `</ul>`);
                  }
                } else if (stryMutAct_9fa48("13821") ? false : stryMutAct_9fa48("13820") ? true : (stryCov_9fa48("13820", "13821"), section.includes(stryMutAct_9fa48("13822") ? "" : (stryCov_9fa48("13822"), 'Deliverables:')))) {
                  if (stryMutAct_9fa48("13823")) {
                    {}
                  } else {
                    stryCov_9fa48("13823");
                    formattedText += stryMutAct_9fa48("13824") ? `` : (stryCov_9fa48("13824"), `<p><strong>Deliverables:</strong></p>`);
                    formattedText += stryMutAct_9fa48("13825") ? `` : (stryCov_9fa48("13825"), `<ul>`);
                    lines.forEach(line => {
                      if (stryMutAct_9fa48("13826")) {
                        {}
                      } else {
                        stryCov_9fa48("13826");
                        const trimmed = stryMutAct_9fa48("13827") ? line : (stryCov_9fa48("13827"), line.trim());
                        if (stryMutAct_9fa48("13830") ? trimmed || !trimmed.includes('Deliverables:') : stryMutAct_9fa48("13829") ? false : stryMutAct_9fa48("13828") ? true : (stryCov_9fa48("13828", "13829", "13830"), trimmed && (stryMutAct_9fa48("13831") ? trimmed.includes('Deliverables:') : (stryCov_9fa48("13831"), !trimmed.includes(stryMutAct_9fa48("13832") ? "" : (stryCov_9fa48("13832"), 'Deliverables:')))))) {
                          if (stryMutAct_9fa48("13833")) {
                            {}
                          } else {
                            stryCov_9fa48("13833");
                            // Clean up any leading dashes or bullets
                            const cleanLine = trimmed.replace(stryMutAct_9fa48("13837") ? /^[-•]\S*/ : stryMutAct_9fa48("13836") ? /^[-•]\s/ : stryMutAct_9fa48("13835") ? /^[^-•]\s*/ : stryMutAct_9fa48("13834") ? /[-•]\s*/ : (stryCov_9fa48("13834", "13835", "13836", "13837"), /^[-•]\s*/), stryMutAct_9fa48("13838") ? "Stryker was here!" : (stryCov_9fa48("13838"), ''));
                            if (stryMutAct_9fa48("13840") ? false : stryMutAct_9fa48("13839") ? true : (stryCov_9fa48("13839", "13840"), cleanLine)) {
                              if (stryMutAct_9fa48("13841")) {
                                {}
                              } else {
                                stryCov_9fa48("13841");
                                formattedText += stryMutAct_9fa48("13842") ? `` : (stryCov_9fa48("13842"), `<li>${cleanLine}</li>`);
                              }
                            }
                          }
                        }
                      }
                    });
                    formattedText += stryMutAct_9fa48("13843") ? `` : (stryCov_9fa48("13843"), `</ul>`);
                  }
                } else {
                  if (stryMutAct_9fa48("13844")) {
                    {}
                  } else {
                    stryCov_9fa48("13844");
                    // Regular paragraph - handle line breaks within paragraphs
                    const cleanSection = stryMutAct_9fa48("13845") ? section : (stryCov_9fa48("13845"), section.trim());
                    if (stryMutAct_9fa48("13847") ? false : stryMutAct_9fa48("13846") ? true : (stryCov_9fa48("13846", "13847"), cleanSection)) {
                      if (stryMutAct_9fa48("13848")) {
                        {}
                      } else {
                        stryCov_9fa48("13848");
                        formattedText += stryMutAct_9fa48("13849") ? `` : (stryCov_9fa48("13849"), `<p>${cleanSection.replace(/\n/g, stryMutAct_9fa48("13850") ? "" : (stryCov_9fa48("13850"), '<br>'))}</p>`);
                      }
                    }
                  }
                }
              }
            });
            return formattedText;
          }
        };
        Swal.fire(stryMutAct_9fa48("13851") ? {} : (stryCov_9fa48("13851"), {
          title: stryMutAct_9fa48("13852") ? "" : (stryCov_9fa48("13852"), 'Assessment Instructions'),
          html: formatInstructions(stryMutAct_9fa48("13853") ? assessment.instructions : (stryCov_9fa48("13853"), assessment?.instructions)),
          showCancelButton: stryMutAct_9fa48("13854") ? true : (stryCov_9fa48("13854"), false),
          confirmButtonText: stryMutAct_9fa48("13855") ? "" : (stryCov_9fa48("13855"), 'Got it, let\'s start!'),
          confirmButtonColor: stryMutAct_9fa48("13856") ? "" : (stryCov_9fa48("13856"), '#4242ea'),
          width: stryMutAct_9fa48("13857") ? "" : (stryCov_9fa48("13857"), '600px'),
          background: stryMutAct_9fa48("13858") ? "" : (stryCov_9fa48("13858"), '#1A1F2C'),
          // Using the same background as admin-prompts
          color: stryMutAct_9fa48("13859") ? "" : (stryCov_9fa48("13859"), 'var(--color-text-primary)'),
          // Using CSS variable for consistency
          customClass: stryMutAct_9fa48("13860") ? {} : (stryCov_9fa48("13860"), {
            popup: stryMutAct_9fa48("13861") ? "" : (stryCov_9fa48("13861"), 'swal2-popup-dark'),
            title: stryMutAct_9fa48("13862") ? "" : (stryCov_9fa48("13862"), 'swal2-title-custom'),
            htmlContainer: stryMutAct_9fa48("13863") ? "" : (stryCov_9fa48("13863"), 'swal2-html-custom'),
            confirmButton: stryMutAct_9fa48("13864") ? "" : (stryCov_9fa48("13864"), 'swal2-confirm-custom')
          })
        }));
      }
    };
    const isSubmitted = stryMutAct_9fa48("13867") ? submission?.status !== 'submitted' : stryMutAct_9fa48("13866") ? false : stryMutAct_9fa48("13865") ? true : (stryCov_9fa48("13865", "13866", "13867"), (stryMutAct_9fa48("13868") ? submission.status : (stryCov_9fa48("13868"), submission?.status)) === (stryMutAct_9fa48("13869") ? "" : (stryCov_9fa48("13869"), 'submitted')));
    const canEdit = stryMutAct_9fa48("13872") ? isActive || !isSubmitted : stryMutAct_9fa48("13871") ? false : stryMutAct_9fa48("13870") ? true : (stryCov_9fa48("13870", "13871", "13872"), isActive && (stryMutAct_9fa48("13873") ? isSubmitted : (stryCov_9fa48("13873"), !isSubmitted)));
    if (stryMutAct_9fa48("13875") ? false : stryMutAct_9fa48("13874") ? true : (stryCov_9fa48("13874", "13875"), loading)) {
      if (stryMutAct_9fa48("13876")) {
        {}
      } else {
        stryCov_9fa48("13876");
        return <div className="business-assessment">
        <div className="business-assessment__loading">
          <div className="business-assessment__loading-spinner"></div>
          <p>Loading assessment...</p>
        </div>
      </div>;
      }
    }
    if (stryMutAct_9fa48("13879") ? error || !assessment : stryMutAct_9fa48("13878") ? false : stryMutAct_9fa48("13877") ? true : (stryCov_9fa48("13877", "13878", "13879"), error && (stryMutAct_9fa48("13880") ? assessment : (stryCov_9fa48("13880"), !assessment)))) {
      if (stryMutAct_9fa48("13881")) {
        {}
      } else {
        stryCov_9fa48("13881");
        return <div className="business-assessment">
        <div className="business-assessment__error">
          <h2>Error Loading Assessment</h2>
          <p>{error}</p>
          <button onClick={stryMutAct_9fa48("13882") ? () => undefined : (stryCov_9fa48("13882"), () => navigate(stryMutAct_9fa48("13883") ? "" : (stryCov_9fa48("13883"), '/assessment')))} className="business-assessment__back-btn">
            <FaArrowLeft /> Back to Assessments
          </button>
        </div>
      </div>;
      }
    }
    return <div className="business-assessment">
      <div className="business-assessment__header">
        <div className="business-assessment__title-section">
          <h1 className="business-assessment__title">{stryMutAct_9fa48("13884") ? assessment.assessment_name : (stryCov_9fa48("13884"), assessment?.assessment_name)}</h1>
          {stryMutAct_9fa48("13887") ? isSubmitted || <div className="business-assessment__submitted-badge">
              <FaCheck /> Submitted
            </div> : stryMutAct_9fa48("13886") ? false : stryMutAct_9fa48("13885") ? true : (stryCov_9fa48("13885", "13886", "13887"), isSubmitted && <div className="business-assessment__submitted-badge">
              <FaCheck /> Submitted
            </div>)}
        </div>
        
        <div className="business-assessment__header-buttons">
          <button onClick={stryMutAct_9fa48("13888") ? () => undefined : (stryCov_9fa48("13888"), () => navigate(stryMutAct_9fa48("13889") ? "" : (stryCov_9fa48("13889"), '/assessment')))} className="business-assessment__back-btn">
            <FaArrowLeft /> Back to Assessments
          </button>
          
          <button onClick={showInstructionsModal} className="business-assessment__instructions-btn">
            <FaInfoCircle /> View Instructions
          </button>
        </div>
      </div>

      {stryMutAct_9fa48("13892") ? !isActive || <div className="business-assessment__inactive-notice">
          <p>You have historical access only and cannot make changes to this assessment.</p>
        </div> : stryMutAct_9fa48("13891") ? false : stryMutAct_9fa48("13890") ? true : (stryCov_9fa48("13890", "13891", "13892"), (stryMutAct_9fa48("13893") ? isActive : (stryCov_9fa48("13893"), !isActive)) && <div className="business-assessment__inactive-notice">
          <p>You have historical access only and cannot make changes to this assessment.</p>
        </div>)}

      {stryMutAct_9fa48("13896") ? error || <div className="business-assessment__error-banner">
          <p>{error}</p>
          <button onClick={() => setError('')} className="business-assessment__error-close">×</button>
        </div> : stryMutAct_9fa48("13895") ? false : stryMutAct_9fa48("13894") ? true : (stryCov_9fa48("13894", "13895", "13896"), error && <div className="business-assessment__error-banner">
          <p>{error}</p>
          <button onClick={stryMutAct_9fa48("13897") ? () => undefined : (stryCov_9fa48("13897"), () => setError(stryMutAct_9fa48("13898") ? "Stryker was here!" : (stryCov_9fa48("13898"), '')))} className="business-assessment__error-close">×</button>
        </div>)}

      <div className="business-assessment__content">

        <div className="business-assessment__sections">
          {/* LLM Chat Section */}
          <div className="business-assessment__section">
            <h2 className="business-assessment__section-title">
              LLM Window to Work Through the Task
            </h2>
            <div className="business-assessment__chat-container">
              <AssessmentLLMChat assessmentId={assessmentId} onConversationUpdate={handleConversationUpdate} initialConversation={conversationData} disabled={stryMutAct_9fa48("13899") ? canEdit : (stryCov_9fa48("13899"), !canEdit)} />
            </div>
          </div>

          {/* Problem Statement Section */}
          <div className="business-assessment__section">
            <h2 className="business-assessment__section-title">
              Problem Statement <span className="business-assessment__required">*</span>
            </h2>
            <p className="business-assessment__field-description">
              Enter your 1 sentence problem statement below:
            </p>
            <textarea className="business-assessment__textarea" value={problemStatement} onChange={stryMutAct_9fa48("13900") ? () => undefined : (stryCov_9fa48("13900"), e => setProblemStatement(e.target.value))} placeholder="Enter your problem statement here..." disabled={stryMutAct_9fa48("13901") ? canEdit : (stryCov_9fa48("13901"), !canEdit)} rows={3} />
            <div className="business-assessment__word-count">
              {stryMutAct_9fa48("13903") ? problemStatement.split(' ').filter(word => word.length > 0).length : stryMutAct_9fa48("13902") ? problemStatement.trim().split(' ').length : (stryCov_9fa48("13902", "13903"), problemStatement.trim().split(stryMutAct_9fa48("13904") ? "" : (stryCov_9fa48("13904"), ' ')).filter(stryMutAct_9fa48("13905") ? () => undefined : (stryCov_9fa48("13905"), word => stryMutAct_9fa48("13909") ? word.length <= 0 : stryMutAct_9fa48("13908") ? word.length >= 0 : stryMutAct_9fa48("13907") ? false : stryMutAct_9fa48("13906") ? true : (stryCov_9fa48("13906", "13907", "13908", "13909"), word.length > 0))).length)} words
            </div>
          </div>

          {/* Proposed Solution Section */}
          <div className="business-assessment__section">
            <h2 className="business-assessment__section-title">
              Proposed Solution <span className="business-assessment__required">*</span>
            </h2>
            <p className="business-assessment__field-description">
              Enter your 1 sentence proposed solution below:
            </p>
            <textarea className="business-assessment__textarea" value={proposedSolution} onChange={stryMutAct_9fa48("13910") ? () => undefined : (stryCov_9fa48("13910"), e => setProposedSolution(e.target.value))} placeholder="Enter your proposed solution here..." disabled={stryMutAct_9fa48("13911") ? canEdit : (stryCov_9fa48("13911"), !canEdit)} rows={3} />
            <div className="business-assessment__word-count">
              {stryMutAct_9fa48("13913") ? proposedSolution.split(' ').filter(word => word.length > 0).length : stryMutAct_9fa48("13912") ? proposedSolution.trim().split(' ').length : (stryCov_9fa48("13912", "13913"), proposedSolution.trim().split(stryMutAct_9fa48("13914") ? "" : (stryCov_9fa48("13914"), ' ')).filter(stryMutAct_9fa48("13915") ? () => undefined : (stryCov_9fa48("13915"), word => stryMutAct_9fa48("13919") ? word.length <= 0 : stryMutAct_9fa48("13918") ? word.length >= 0 : stryMutAct_9fa48("13917") ? false : stryMutAct_9fa48("13916") ? true : (stryCov_9fa48("13916", "13917", "13918", "13919"), word.length > 0))).length)} words
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {stryMutAct_9fa48("13922") ? canEdit || <div className="business-assessment__actions">
            <button onClick={saveDraft} disabled={saving} className="business-assessment__save-btn">
              <FaSave /> {saving ? 'Saving...' : 'Save Draft'}
            </button>
            
            <button onClick={submitAssessment} disabled={submitting || !problemStatement.trim() || !proposedSolution.trim()} className="business-assessment__submit-btn">
              <FaPaperPlane /> {submitting ? 'Submitting...' : 'Submit Assessment'}
            </button>
          </div> : stryMutAct_9fa48("13921") ? false : stryMutAct_9fa48("13920") ? true : (stryCov_9fa48("13920", "13921", "13922"), canEdit && <div className="business-assessment__actions">
            <button onClick={saveDraft} disabled={saving} className="business-assessment__save-btn">
              <FaSave /> {saving ? stryMutAct_9fa48("13923") ? "" : (stryCov_9fa48("13923"), 'Saving...') : stryMutAct_9fa48("13924") ? "" : (stryCov_9fa48("13924"), 'Save Draft')}
            </button>
            
            <button onClick={submitAssessment} disabled={stryMutAct_9fa48("13927") ? (submitting || !problemStatement.trim()) && !proposedSolution.trim() : stryMutAct_9fa48("13926") ? false : stryMutAct_9fa48("13925") ? true : (stryCov_9fa48("13925", "13926", "13927"), (stryMutAct_9fa48("13929") ? submitting && !problemStatement.trim() : stryMutAct_9fa48("13928") ? false : (stryCov_9fa48("13928", "13929"), submitting || (stryMutAct_9fa48("13930") ? problemStatement.trim() : (stryCov_9fa48("13930"), !(stryMutAct_9fa48("13931") ? problemStatement : (stryCov_9fa48("13931"), problemStatement.trim())))))) || (stryMutAct_9fa48("13932") ? proposedSolution.trim() : (stryCov_9fa48("13932"), !(stryMutAct_9fa48("13933") ? proposedSolution : (stryCov_9fa48("13933"), proposedSolution.trim())))))} className="business-assessment__submit-btn">
              <FaPaperPlane /> {submitting ? stryMutAct_9fa48("13934") ? "" : (stryCov_9fa48("13934"), 'Submitting...') : stryMutAct_9fa48("13935") ? "" : (stryCov_9fa48("13935"), 'Submit Assessment')}
            </button>
          </div>)}

        {stryMutAct_9fa48("13938") ? isSubmitted || <div className="business-assessment__submitted-notice">
            <FaCheck />
            <div>
              <h3>Assessment Submitted Successfully</h3>
              <p>Submitted on {new Date(submission.submitted_at).toLocaleString()}</p>
            </div>
          </div> : stryMutAct_9fa48("13937") ? false : stryMutAct_9fa48("13936") ? true : (stryCov_9fa48("13936", "13937", "13938"), isSubmitted && <div className="business-assessment__submitted-notice">
            <FaCheck />
            <div>
              <h3>Assessment Submitted Successfully</h3>
              <p>Submitted on {new Date(submission.submitted_at).toLocaleString()}</p>
            </div>
          </div>)}
      </div>
    </div>;
  }
}
export default BusinessAssessment;