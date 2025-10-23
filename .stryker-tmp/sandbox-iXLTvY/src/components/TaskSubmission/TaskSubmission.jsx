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
import { useAuth } from '../../context/AuthContext';
import { formatSubmissionTimestamp } from '../../utils/dateHelpers';
import './TaskSubmission.css';

// Confirmation Modal Component
const ConfirmationModal = ({
  isOpen,
  message,
  onConfirm,
  onCancel
}) => {
  if (stryMutAct_9fa48("2776")) {
    {}
  } else {
    stryCov_9fa48("2776");
    if (stryMutAct_9fa48("2779") ? false : stryMutAct_9fa48("2778") ? true : stryMutAct_9fa48("2777") ? isOpen : (stryCov_9fa48("2777", "2778", "2779"), !isOpen)) return null;
    return <div className="confirmation-modal-overlay">
      <div className="confirmation-modal">
        <div className="confirmation-modal__content">
          <p>{message}</p>
          <div className="confirmation-modal__actions">
            <button className="confirmation-modal__cancel-btn" onClick={onCancel}>
              Cancel
            </button>
            <button className="confirmation-modal__confirm-btn" onClick={onConfirm}>
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>;
  }
};
const TaskSubmission = ({
  taskId,
  deliverable,
  canAnalyzeDeliverable,
  onAnalyzeDeliverable
}) => {
  if (stryMutAct_9fa48("2780")) {
    {}
  } else {
    stryCov_9fa48("2780");
    const {
      token,
      user
    } = useAuth();
    const isActive = stryMutAct_9fa48("2783") ? user?.active === false : stryMutAct_9fa48("2782") ? false : stryMutAct_9fa48("2781") ? true : (stryCov_9fa48("2781", "2782", "2783"), (stryMutAct_9fa48("2784") ? user.active : (stryCov_9fa48("2784"), user?.active)) !== (stryMutAct_9fa48("2785") ? true : (stryCov_9fa48("2785"), false)));
    const [submissionData, setSubmissionData] = useState(stryMutAct_9fa48("2786") ? {} : (stryCov_9fa48("2786"), {
      type: stryMutAct_9fa48("2787") ? "" : (stryCov_9fa48("2787"), 'link'),
      content: stryMutAct_9fa48("2788") ? "Stryker was here!" : (stryCov_9fa48("2788"), '')
    }));
    const [feedback, setFeedback] = useState(stryMutAct_9fa48("2789") ? "Stryker was here!" : (stryCov_9fa48("2789"), ''));
    const [isSubmitting, setIsSubmitting] = useState(stryMutAct_9fa48("2790") ? true : (stryCov_9fa48("2790"), false));
    const [isAnalyzing, setIsAnalyzing] = useState(stryMutAct_9fa48("2791") ? true : (stryCov_9fa48("2791"), false));
    const [error, setError] = useState(stryMutAct_9fa48("2792") ? "Stryker was here!" : (stryCov_9fa48("2792"), ''));
    const [submission, setSubmission] = useState(null);
    const [submissionError, setSubmissionError] = useState(null);

    // State for confirmation modal
    const [showConfirmModal, setShowConfirmModal] = useState(stryMutAct_9fa48("2793") ? true : (stryCov_9fa48("2793"), false));
    const [confirmAction, setConfirmAction] = useState(null);
    const [confirmMessage, setConfirmMessage] = useState(stryMutAct_9fa48("2794") ? "Stryker was here!" : (stryCov_9fa48("2794"), ''));

    // Function to show confirmation modal
    const confirmAndExecute = (message, action) => {
      if (stryMutAct_9fa48("2795")) {
        {}
      } else {
        stryCov_9fa48("2795");
        setConfirmMessage(message);
        setConfirmAction(stryMutAct_9fa48("2796") ? () => undefined : (stryCov_9fa48("2796"), () => action));
        setShowConfirmModal(stryMutAct_9fa48("2797") ? false : (stryCov_9fa48("2797"), true));
      }
    };

    // Function to handle confirmation
    const handleConfirm = () => {
      if (stryMutAct_9fa48("2798")) {
        {}
      } else {
        stryCov_9fa48("2798");
        if (stryMutAct_9fa48("2800") ? false : stryMutAct_9fa48("2799") ? true : (stryCov_9fa48("2799", "2800"), confirmAction)) {
          if (stryMutAct_9fa48("2801")) {
            {}
          } else {
            stryCov_9fa48("2801");
            confirmAction();
          }
        }
        setShowConfirmModal(stryMutAct_9fa48("2802") ? true : (stryCov_9fa48("2802"), false));
      }
    };

    // Function to cancel confirmation
    const handleCancel = () => {
      if (stryMutAct_9fa48("2803")) {
        {}
      } else {
        stryCov_9fa48("2803");
        setShowConfirmModal(stryMutAct_9fa48("2804") ? true : (stryCov_9fa48("2804"), false));
      }
    };

    // Fetch existing submission if available
    useEffect(() => {
      if (stryMutAct_9fa48("2805")) {
        {}
      } else {
        stryCov_9fa48("2805");
        const fetchSubmission = async () => {
          if (stryMutAct_9fa48("2806")) {
            {}
          } else {
            stryCov_9fa48("2806");
            try {
              if (stryMutAct_9fa48("2807")) {
                {}
              } else {
                stryCov_9fa48("2807");
                const response = await fetch(stryMutAct_9fa48("2808") ? `` : (stryCov_9fa48("2808"), `${import.meta.env.VITE_API_URL}/api/submissions/${taskId}`), stryMutAct_9fa48("2809") ? {} : (stryCov_9fa48("2809"), {
                  headers: stryMutAct_9fa48("2810") ? {} : (stryCov_9fa48("2810"), {
                    'Authorization': stryMutAct_9fa48("2811") ? `` : (stryCov_9fa48("2811"), `Bearer ${token}`)
                  })
                }));
                if (stryMutAct_9fa48("2813") ? false : stryMutAct_9fa48("2812") ? true : (stryCov_9fa48("2812", "2813"), response.ok)) {
                  if (stryMutAct_9fa48("2814")) {
                    {}
                  } else {
                    stryCov_9fa48("2814");
                    const data = await response.json();
                    setSubmission(data);

                    // Handle parsing the content based on format
                    try {
                      if (stryMutAct_9fa48("2815")) {
                        {}
                      } else {
                        stryCov_9fa48("2815");
                        // Check if the content is JSON (from legacy format)
                        const parsedContent = JSON.parse(data.content);
                        if (stryMutAct_9fa48("2818") ? Array.isArray(parsedContent) || parsedContent.length > 0 : stryMutAct_9fa48("2817") ? false : stryMutAct_9fa48("2816") ? true : (stryCov_9fa48("2816", "2817", "2818"), Array.isArray(parsedContent) && (stryMutAct_9fa48("2821") ? parsedContent.length <= 0 : stryMutAct_9fa48("2820") ? parsedContent.length >= 0 : stryMutAct_9fa48("2819") ? true : (stryCov_9fa48("2819", "2820", "2821"), parsedContent.length > 0)))) {
                          if (stryMutAct_9fa48("2822")) {
                            {}
                          } else {
                            stryCov_9fa48("2822");
                            // Use only the first item from the array
                            setSubmissionData(parsedContent[0]);
                          }
                        } else if (stryMutAct_9fa48("2825") ? typeof parsedContent !== 'object' : stryMutAct_9fa48("2824") ? false : stryMutAct_9fa48("2823") ? true : (stryCov_9fa48("2823", "2824", "2825"), typeof parsedContent === (stryMutAct_9fa48("2826") ? "" : (stryCov_9fa48("2826"), 'object')))) {
                          if (stryMutAct_9fa48("2827")) {
                            {}
                          } else {
                            stryCov_9fa48("2827");
                            // If it's an object but not an array
                            setSubmissionData(stryMutAct_9fa48("2828") ? {} : (stryCov_9fa48("2828"), {
                              type: stryMutAct_9fa48("2829") ? "" : (stryCov_9fa48("2829"), 'link'),
                              content: data.content,
                              label: stryMutAct_9fa48("2830") ? "" : (stryCov_9fa48("2830"), 'Submission')
                            }));
                          }
                        }
                      }
                    } catch (e) {
                      if (stryMutAct_9fa48("2831")) {
                        {}
                      } else {
                        stryCov_9fa48("2831");
                        // If it's not valid JSON, determine the type based on content
                        let submissionType = stryMutAct_9fa48("2832") ? "" : (stryCov_9fa48("2832"), 'link'); // default to link

                        // Check if it's a Loom video URL
                        try {
                          if (stryMutAct_9fa48("2833")) {
                            {}
                          } else {
                            stryCov_9fa48("2833");
                            const url = new URL(data.content);
                            if (stryMutAct_9fa48("2835") ? false : stryMutAct_9fa48("2834") ? true : (stryCov_9fa48("2834", "2835"), url.hostname.includes(stryMutAct_9fa48("2836") ? "" : (stryCov_9fa48("2836"), 'loom.com')))) {
                              if (stryMutAct_9fa48("2837")) {
                                {}
                              } else {
                                stryCov_9fa48("2837");
                                submissionType = stryMutAct_9fa48("2838") ? "" : (stryCov_9fa48("2838"), 'video');
                              }
                            }
                          }
                        } catch (urlError) {
                          if (stryMutAct_9fa48("2839")) {
                            {}
                          } else {
                            stryCov_9fa48("2839");
                            // If it's not a valid URL, check if it looks like text content
                            if (stryMutAct_9fa48("2842") ? data.content && data.content.length > 100 || !data.content.startsWith('http') : stryMutAct_9fa48("2841") ? false : stryMutAct_9fa48("2840") ? true : (stryCov_9fa48("2840", "2841", "2842"), (stryMutAct_9fa48("2844") ? data.content || data.content.length > 100 : stryMutAct_9fa48("2843") ? true : (stryCov_9fa48("2843", "2844"), data.content && (stryMutAct_9fa48("2847") ? data.content.length <= 100 : stryMutAct_9fa48("2846") ? data.content.length >= 100 : stryMutAct_9fa48("2845") ? true : (stryCov_9fa48("2845", "2846", "2847"), data.content.length > 100)))) && (stryMutAct_9fa48("2848") ? data.content.startsWith('http') : (stryCov_9fa48("2848"), !(stryMutAct_9fa48("2849") ? data.content.endsWith('http') : (stryCov_9fa48("2849"), data.content.startsWith(stryMutAct_9fa48("2850") ? "" : (stryCov_9fa48("2850"), 'http')))))))) {
                              if (stryMutAct_9fa48("2851")) {
                                {}
                              } else {
                                stryCov_9fa48("2851");
                                submissionType = stryMutAct_9fa48("2852") ? "" : (stryCov_9fa48("2852"), 'text');
                              }
                            }
                          }
                        }
                        setSubmissionData(stryMutAct_9fa48("2853") ? {} : (stryCov_9fa48("2853"), {
                          type: submissionType,
                          content: data.content,
                          label: stryMutAct_9fa48("2854") ? "" : (stryCov_9fa48("2854"), 'Submission')
                        }));
                      }
                    }
                    setFeedback(stryMutAct_9fa48("2857") ? data.feedback && '' : stryMutAct_9fa48("2856") ? false : stryMutAct_9fa48("2855") ? true : (stryCov_9fa48("2855", "2856", "2857"), data.feedback || (stryMutAct_9fa48("2858") ? "Stryker was here!" : (stryCov_9fa48("2858"), ''))));
                  }
                } else if (stryMutAct_9fa48("2861") ? response.status === 404 : stryMutAct_9fa48("2860") ? false : stryMutAct_9fa48("2859") ? true : (stryCov_9fa48("2859", "2860", "2861"), response.status !== 404)) {
                  if (stryMutAct_9fa48("2862")) {
                    {}
                  } else {
                    stryCov_9fa48("2862");
                    // 404 is expected if no submission exists yet
                    const errorData = await response.json();
                    setError(stryMutAct_9fa48("2865") ? errorData.error && 'Failed to fetch submission' : stryMutAct_9fa48("2864") ? false : stryMutAct_9fa48("2863") ? true : (stryCov_9fa48("2863", "2864", "2865"), errorData.error || (stryMutAct_9fa48("2866") ? "" : (stryCov_9fa48("2866"), 'Failed to fetch submission'))));
                  }
                }
              }
            } catch (error) {
              if (stryMutAct_9fa48("2867")) {
                {}
              } else {
                stryCov_9fa48("2867");
                console.error(stryMutAct_9fa48("2868") ? "" : (stryCov_9fa48("2868"), 'Error fetching submission:'), error);
                setError(stryMutAct_9fa48("2869") ? "" : (stryCov_9fa48("2869"), 'Unable to load previous submission. Please check your internet connection and try refreshing the page.'));
              }
            }
          }
        };
        if (stryMutAct_9fa48("2871") ? false : stryMutAct_9fa48("2870") ? true : (stryCov_9fa48("2870", "2871"), taskId)) {
          if (stryMutAct_9fa48("2872")) {
            {}
          } else {
            stryCov_9fa48("2872");
            fetchSubmission();
          }
        }
      }
    }, stryMutAct_9fa48("2873") ? [] : (stryCov_9fa48("2873"), [taskId, token]));

    // Check if a URL is a Google Doc
    const isGoogleDoc = url => {
      if (stryMutAct_9fa48("2874")) {
        {}
      } else {
        stryCov_9fa48("2874");
        return stryMutAct_9fa48("2877") ? url || url.startsWith('https://docs.google.com/') : stryMutAct_9fa48("2876") ? false : stryMutAct_9fa48("2875") ? true : (stryCov_9fa48("2875", "2876", "2877"), url && (stryMutAct_9fa48("2878") ? url.endsWith('https://docs.google.com/') : (stryCov_9fa48("2878"), url.startsWith(stryMutAct_9fa48("2879") ? "" : (stryCov_9fa48("2879"), 'https://docs.google.com/')))));
      }
    };

    // Handle analyzing a deliverable
    const handleAnalyzeSubmission = () => {
      if (stryMutAct_9fa48("2880")) {
        {}
      } else {
        stryCov_9fa48("2880");
        if (stryMutAct_9fa48("2883") ? !submission && !submissionData.content : stryMutAct_9fa48("2882") ? false : stryMutAct_9fa48("2881") ? true : (stryCov_9fa48("2881", "2882", "2883"), (stryMutAct_9fa48("2884") ? submission : (stryCov_9fa48("2884"), !submission)) || (stryMutAct_9fa48("2885") ? submissionData.content : (stryCov_9fa48("2885"), !submissionData.content)))) return;

        // Only proceed if it's a Google Doc
        if (stryMutAct_9fa48("2888") ? false : stryMutAct_9fa48("2887") ? true : stryMutAct_9fa48("2886") ? isGoogleDoc(submissionData.content) : (stryCov_9fa48("2886", "2887", "2888"), !isGoogleDoc(submissionData.content))) {
          if (stryMutAct_9fa48("2889")) {
            {}
          } else {
            stryCov_9fa48("2889");
            setSubmissionError(stryMutAct_9fa48("2890") ? "" : (stryCov_9fa48("2890"), "Only Google Docs can be analyzed. Please submit a Google Doc URL."));
            return;
          }
        }

        // Clear previous errors
        setSubmissionError(null);

        // Call the onAnalyzeDeliverable callback with the submission URL
        if (stryMutAct_9fa48("2893") ? onAnalyzeDeliverable || submissionData.content : stryMutAct_9fa48("2892") ? false : stryMutAct_9fa48("2891") ? true : (stryCov_9fa48("2891", "2892", "2893"), onAnalyzeDeliverable && submissionData.content)) {
          if (stryMutAct_9fa48("2894")) {
            {}
          } else {
            stryCov_9fa48("2894");
            setIsAnalyzing(stryMutAct_9fa48("2895") ? false : (stryCov_9fa48("2895"), true));
            onAnalyzeDeliverable(submissionData.content).then(() => {
              // Success message will be handled by parent component
            }).catch(err => {
              if (stryMutAct_9fa48("2896")) {
                {}
              } else {
                stryCov_9fa48("2896");
                console.error(stryMutAct_9fa48("2897") ? "" : (stryCov_9fa48("2897"), 'Analysis failed:'), err);

                // Check for specific Google Doc access error
                if (stryMutAct_9fa48("2900") ? err.message || err.message.includes("Could not access Google Doc") || err.message.includes("status code 401") || err.message.includes("status code 403") : stryMutAct_9fa48("2899") ? false : stryMutAct_9fa48("2898") ? true : (stryCov_9fa48("2898", "2899", "2900"), err.message && (stryMutAct_9fa48("2902") ? (err.message.includes("Could not access Google Doc") || err.message.includes("status code 401")) && err.message.includes("status code 403") : stryMutAct_9fa48("2901") ? true : (stryCov_9fa48("2901", "2902"), (stryMutAct_9fa48("2904") ? err.message.includes("Could not access Google Doc") && err.message.includes("status code 401") : stryMutAct_9fa48("2903") ? false : (stryCov_9fa48("2903", "2904"), err.message.includes(stryMutAct_9fa48("2905") ? "" : (stryCov_9fa48("2905"), "Could not access Google Doc")) || err.message.includes(stryMutAct_9fa48("2906") ? "" : (stryCov_9fa48("2906"), "status code 401")))) || err.message.includes(stryMutAct_9fa48("2907") ? "" : (stryCov_9fa48("2907"), "status code 403")))))) {
                  if (stryMutAct_9fa48("2908")) {
                    {}
                  } else {
                    stryCov_9fa48("2908");
                    setSubmissionError(stryMutAct_9fa48("2909") ? "" : (stryCov_9fa48("2909"), "Please set the visibility for this Google Doc to 'Anyone with the link can view'"));
                  }
                } else {
                  if (stryMutAct_9fa48("2910")) {
                    {}
                  } else {
                    stryCov_9fa48("2910");
                    setSubmissionError(stryMutAct_9fa48("2913") ? err.message && "Analysis failed. Please try again." : stryMutAct_9fa48("2912") ? false : stryMutAct_9fa48("2911") ? true : (stryCov_9fa48("2911", "2912", "2913"), err.message || (stryMutAct_9fa48("2914") ? "" : (stryCov_9fa48("2914"), "Analysis failed. Please try again."))));
                  }
                }
              }
            }).finally(() => {
              if (stryMutAct_9fa48("2915")) {
                {}
              } else {
                stryCov_9fa48("2915");
                setIsAnalyzing(stryMutAct_9fa48("2916") ? true : (stryCov_9fa48("2916"), false));
              }
            });
          }
        }
      }
    };
    const handleSubmit = async e => {
      if (stryMutAct_9fa48("2917")) {
        {}
      } else {
        stryCov_9fa48("2917");
        e.preventDefault();

        // If user is inactive, don't allow submission
        if (stryMutAct_9fa48("2920") ? false : stryMutAct_9fa48("2919") ? true : stryMutAct_9fa48("2918") ? isActive : (stryCov_9fa48("2918", "2919", "2920"), !isActive)) {
          if (stryMutAct_9fa48("2921")) {
            {}
          } else {
            stryCov_9fa48("2921");
            setError(stryMutAct_9fa48("2922") ? "" : (stryCov_9fa48("2922"), 'You have historical access only and cannot submit new work.'));
            return;
          }
        }
        setIsSubmitting(stryMutAct_9fa48("2923") ? false : (stryCov_9fa48("2923"), true));
        setError(stryMutAct_9fa48("2924") ? "Stryker was here!" : (stryCov_9fa48("2924"), ''));

        // Validate submission
        let isValid = stryMutAct_9fa48("2927") ? submissionData.content.trim() === '' : stryMutAct_9fa48("2926") ? false : stryMutAct_9fa48("2925") ? true : (stryCov_9fa48("2925", "2926", "2927"), (stryMutAct_9fa48("2928") ? submissionData.content : (stryCov_9fa48("2928"), submissionData.content.trim())) !== (stryMutAct_9fa48("2929") ? "Stryker was here!" : (stryCov_9fa48("2929"), '')));

        // Additional validation for link and video types
        if (stryMutAct_9fa48("2932") ? submissionData.type === 'link' || !isValidUrl(submissionData.content) : stryMutAct_9fa48("2931") ? false : stryMutAct_9fa48("2930") ? true : (stryCov_9fa48("2930", "2931", "2932"), (stryMutAct_9fa48("2934") ? submissionData.type !== 'link' : stryMutAct_9fa48("2933") ? true : (stryCov_9fa48("2933", "2934"), submissionData.type === (stryMutAct_9fa48("2935") ? "" : (stryCov_9fa48("2935"), 'link')))) && (stryMutAct_9fa48("2936") ? isValidUrl(submissionData.content) : (stryCov_9fa48("2936"), !isValidUrl(submissionData.content))))) {
          if (stryMutAct_9fa48("2937")) {
            {}
          } else {
            stryCov_9fa48("2937");
            isValid = stryMutAct_9fa48("2938") ? true : (stryCov_9fa48("2938"), false);
          }
        }

        // Validate Loom URLs for video type
        if (stryMutAct_9fa48("2941") ? submissionData.type !== 'video' : stryMutAct_9fa48("2940") ? false : stryMutAct_9fa48("2939") ? true : (stryCov_9fa48("2939", "2940", "2941"), submissionData.type === (stryMutAct_9fa48("2942") ? "" : (stryCov_9fa48("2942"), 'video')))) {
          if (stryMutAct_9fa48("2943")) {
            {}
          } else {
            stryCov_9fa48("2943");
            if (stryMutAct_9fa48("2946") ? false : stryMutAct_9fa48("2945") ? true : stryMutAct_9fa48("2944") ? isValidUrl(submissionData.content) : (stryCov_9fa48("2944", "2945", "2946"), !isValidUrl(submissionData.content))) {
              if (stryMutAct_9fa48("2947")) {
                {}
              } else {
                stryCov_9fa48("2947");
                isValid = stryMutAct_9fa48("2948") ? true : (stryCov_9fa48("2948"), false);
              }
            } else if (stryMutAct_9fa48("2951") ? false : stryMutAct_9fa48("2950") ? true : stryMutAct_9fa48("2949") ? isLoomUrl(submissionData.content) : (stryCov_9fa48("2949", "2950", "2951"), !isLoomUrl(submissionData.content))) {
              if (stryMutAct_9fa48("2952")) {
                {}
              } else {
                stryCov_9fa48("2952");
                isValid = stryMutAct_9fa48("2953") ? true : (stryCov_9fa48("2953"), false);
                setError(stryMutAct_9fa48("2954") ? "" : (stryCov_9fa48("2954"), 'Please provide a valid Loom video URL (loom.com).'));
                setIsSubmitting(stryMutAct_9fa48("2955") ? true : (stryCov_9fa48("2955"), false));
                return;
              }
            }
          }
        }
        if (stryMutAct_9fa48("2958") ? false : stryMutAct_9fa48("2957") ? true : stryMutAct_9fa48("2956") ? isValid : (stryCov_9fa48("2956", "2957", "2958"), !isValid)) {
          if (stryMutAct_9fa48("2959")) {
            {}
          } else {
            stryCov_9fa48("2959");
            setError(stryMutAct_9fa48("2960") ? "" : (stryCov_9fa48("2960"), 'Please fill in all submission fields. Ensure links are valid URLs.'));
            setIsSubmitting(stryMutAct_9fa48("2961") ? true : (stryCov_9fa48("2961"), false));
            return;
          }
        }
        try {
          if (stryMutAct_9fa48("2962")) {
            {}
          } else {
            stryCov_9fa48("2962");
            let contentToSubmit = submissionData.content;

            // Submit the task with the content (URL for video uploads)
            const response = await fetch(stryMutAct_9fa48("2963") ? `` : (stryCov_9fa48("2963"), `${import.meta.env.VITE_API_URL}/api/submissions`), stryMutAct_9fa48("2964") ? {} : (stryCov_9fa48("2964"), {
              method: stryMutAct_9fa48("2965") ? "" : (stryCov_9fa48("2965"), 'POST'),
              headers: stryMutAct_9fa48("2966") ? {} : (stryCov_9fa48("2966"), {
                'Content-Type': stryMutAct_9fa48("2967") ? "" : (stryCov_9fa48("2967"), 'application/json'),
                'Authorization': stryMutAct_9fa48("2968") ? `` : (stryCov_9fa48("2968"), `Bearer ${token}`)
              }),
              body: JSON.stringify(stryMutAct_9fa48("2969") ? {} : (stryCov_9fa48("2969"), {
                taskId,
                content: contentToSubmit
              }))
            }));
            if (stryMutAct_9fa48("2971") ? false : stryMutAct_9fa48("2970") ? true : (stryCov_9fa48("2970", "2971"), response.ok)) {
              if (stryMutAct_9fa48("2972")) {
                {}
              } else {
                stryCov_9fa48("2972");
                const data = await response.json();
                setSubmission(data);
                setFeedback(stryMutAct_9fa48("2975") ? data.feedback && '' : stryMutAct_9fa48("2974") ? false : stryMutAct_9fa48("2973") ? true : (stryCov_9fa48("2973", "2974", "2975"), data.feedback || (stryMutAct_9fa48("2976") ? "Stryker was here!" : (stryCov_9fa48("2976"), ''))));
              }
            } else {
              if (stryMutAct_9fa48("2977")) {
                {}
              } else {
                stryCov_9fa48("2977");
                const errorData = await response.json();
                setError(stryMutAct_9fa48("2980") ? errorData.error && 'Failed to submit' : stryMutAct_9fa48("2979") ? false : stryMutAct_9fa48("2978") ? true : (stryCov_9fa48("2978", "2979", "2980"), errorData.error || (stryMutAct_9fa48("2981") ? "" : (stryCov_9fa48("2981"), 'Failed to submit'))));
              }
            }
          }
        } catch (error) {
          if (stryMutAct_9fa48("2982")) {
            {}
          } else {
            stryCov_9fa48("2982");
            console.error(stryMutAct_9fa48("2983") ? "" : (stryCov_9fa48("2983"), 'Error submitting:'), error);
            setError(stryMutAct_9fa48("2984") ? "" : (stryCov_9fa48("2984"), 'Unable to submit your work. Please check your internet connection and try again.'));
          }
        } finally {
          if (stryMutAct_9fa48("2985")) {
            {}
          } else {
            stryCov_9fa48("2985");
            setIsSubmitting(stryMutAct_9fa48("2986") ? true : (stryCov_9fa48("2986"), false));
          }
        }
      }
    };
    const handleContentChange = value => {
      if (stryMutAct_9fa48("2987")) {
        {}
      } else {
        stryCov_9fa48("2987");
        setSubmissionData(stryMutAct_9fa48("2988") ? {} : (stryCov_9fa48("2988"), {
          ...submissionData,
          content: value
        }));

        // Clear any existing error when the content changes
        if (stryMutAct_9fa48("2990") ? false : stryMutAct_9fa48("2989") ? true : (stryCov_9fa48("2989", "2990"), submissionError)) {
          if (stryMutAct_9fa48("2991")) {
            {}
          } else {
            stryCov_9fa48("2991");
            setSubmissionError(null);
          }
        }
      }
    };
    const handleTypeChange = type => {
      if (stryMutAct_9fa48("2992")) {
        {}
      } else {
        stryCov_9fa48("2992");
        setSubmissionData(stryMutAct_9fa48("2993") ? {} : (stryCov_9fa48("2993"), {
          ...submissionData,
          type: type,
          content: stryMutAct_9fa48("2994") ? "Stryker was here!" : (stryCov_9fa48("2994"), '')
        }));

        // Clear any existing error
        if (stryMutAct_9fa48("2996") ? false : stryMutAct_9fa48("2995") ? true : (stryCov_9fa48("2995", "2996"), submissionError)) {
          if (stryMutAct_9fa48("2997")) {
            {}
          } else {
            stryCov_9fa48("2997");
            setSubmissionError(null);
          }
        }
      }
    };

    // Simple URL validation
    const isValidUrl = url => {
      if (stryMutAct_9fa48("2998")) {
        {}
      } else {
        stryCov_9fa48("2998");
        try {
          if (stryMutAct_9fa48("2999")) {
            {}
          } else {
            stryCov_9fa48("2999");
            new URL(url);
            return stryMutAct_9fa48("3000") ? false : (stryCov_9fa48("3000"), true);
          }
        } catch (e) {
          if (stryMutAct_9fa48("3001")) {
            {}
          } else {
            stryCov_9fa48("3001");
            return stryMutAct_9fa48("3002") ? true : (stryCov_9fa48("3002"), false);
          }
        }
      }
    };

    // Loom URL validation
    const isLoomUrl = url => {
      if (stryMutAct_9fa48("3003")) {
        {}
      } else {
        stryCov_9fa48("3003");
        try {
          if (stryMutAct_9fa48("3004")) {
            {}
          } else {
            stryCov_9fa48("3004");
            const urlObj = new URL(url);
            return urlObj.hostname.includes(stryMutAct_9fa48("3005") ? "" : (stryCov_9fa48("3005"), 'loom.com'));
          }
        } catch (e) {
          if (stryMutAct_9fa48("3006")) {
            {}
          } else {
            stryCov_9fa48("3006");
            return stryMutAct_9fa48("3007") ? true : (stryCov_9fa48("3007"), false);
          }
        }
      }
    };
    return <div className="task-submission">
      {(stryMutAct_9fa48("3008") ? isActive : (stryCov_9fa48("3008"), !isActive)) ? <div className="task-submission__historical-notice">
          <p>You have historical access only. New submissions are not allowed.</p>
          {stryMutAct_9fa48("3011") ? submission || <div className="task-submission__previous">
              <h4>Your Previous Submission:</h4>
              <a href={submission.content} target="_blank" rel="noopener noreferrer">
                {submission.content}
              </a>
            </div> : stryMutAct_9fa48("3010") ? false : stryMutAct_9fa48("3009") ? true : (stryCov_9fa48("3009", "3010", "3011"), submission && <div className="task-submission__previous">
              <h4>Your Previous Submission:</h4>
              <a href={submission.content} target="_blank" rel="noopener noreferrer">
                {submission.content}
              </a>
            </div>)}
        </div> : <>
          <h3 className="task-submission__title">Task Submission</h3>
          <p className="task-submission__description">
            {deliverable}
          </p>

          <form onSubmit={handleSubmit} className="task-submission__form">
            <div className="task-submission__item">
              <div className="task-submission__item-header">
                <div className="task-submission__type-selector">
                  <label className={stryMutAct_9fa48("3012") ? `` : (stryCov_9fa48("3012"), `task-submission__type-option ${(stryMutAct_9fa48("3015") ? submissionData.type !== 'text' : stryMutAct_9fa48("3014") ? false : stryMutAct_9fa48("3013") ? true : (stryCov_9fa48("3013", "3014", "3015"), submissionData.type === (stryMutAct_9fa48("3016") ? "" : (stryCov_9fa48("3016"), 'text')))) ? stryMutAct_9fa48("3017") ? "" : (stryCov_9fa48("3017"), 'task-submission__type-option--active') : stryMutAct_9fa48("3018") ? "Stryker was here!" : (stryCov_9fa48("3018"), '')}`)}>
                    <input type="radio" name="type" value="text" checked={stryMutAct_9fa48("3021") ? submissionData.type !== 'text' : stryMutAct_9fa48("3020") ? false : stryMutAct_9fa48("3019") ? true : (stryCov_9fa48("3019", "3020", "3021"), submissionData.type === (stryMutAct_9fa48("3022") ? "" : (stryCov_9fa48("3022"), 'text')))} onChange={stryMutAct_9fa48("3023") ? () => undefined : (stryCov_9fa48("3023"), () => handleTypeChange(stryMutAct_9fa48("3024") ? "" : (stryCov_9fa48("3024"), 'text')))} />
                    Text
                  </label>
                  <label className={stryMutAct_9fa48("3025") ? `` : (stryCov_9fa48("3025"), `task-submission__type-option ${(stryMutAct_9fa48("3028") ? submissionData.type !== 'link' : stryMutAct_9fa48("3027") ? false : stryMutAct_9fa48("3026") ? true : (stryCov_9fa48("3026", "3027", "3028"), submissionData.type === (stryMutAct_9fa48("3029") ? "" : (stryCov_9fa48("3029"), 'link')))) ? stryMutAct_9fa48("3030") ? "" : (stryCov_9fa48("3030"), 'task-submission__type-option--active') : stryMutAct_9fa48("3031") ? "Stryker was here!" : (stryCov_9fa48("3031"), '')}`)}>
                    <input type="radio" name="type" value="link" checked={stryMutAct_9fa48("3034") ? submissionData.type !== 'link' : stryMutAct_9fa48("3033") ? false : stryMutAct_9fa48("3032") ? true : (stryCov_9fa48("3032", "3033", "3034"), submissionData.type === (stryMutAct_9fa48("3035") ? "" : (stryCov_9fa48("3035"), 'link')))} onChange={stryMutAct_9fa48("3036") ? () => undefined : (stryCov_9fa48("3036"), () => handleTypeChange(stryMutAct_9fa48("3037") ? "" : (stryCov_9fa48("3037"), 'link')))} />
                    Google Drive Link
                  </label>
                  <label className={stryMutAct_9fa48("3038") ? `` : (stryCov_9fa48("3038"), `task-submission__type-option ${(stryMutAct_9fa48("3041") ? submissionData.type !== 'video' : stryMutAct_9fa48("3040") ? false : stryMutAct_9fa48("3039") ? true : (stryCov_9fa48("3039", "3040", "3041"), submissionData.type === (stryMutAct_9fa48("3042") ? "" : (stryCov_9fa48("3042"), 'video')))) ? stryMutAct_9fa48("3043") ? "" : (stryCov_9fa48("3043"), 'task-submission__type-option--active') : stryMutAct_9fa48("3044") ? "Stryker was here!" : (stryCov_9fa48("3044"), '')}`)}>
                    <input type="radio" name="type" value="video" checked={stryMutAct_9fa48("3047") ? submissionData.type !== 'video' : stryMutAct_9fa48("3046") ? false : stryMutAct_9fa48("3045") ? true : (stryCov_9fa48("3045", "3046", "3047"), submissionData.type === (stryMutAct_9fa48("3048") ? "" : (stryCov_9fa48("3048"), 'video')))} onChange={stryMutAct_9fa48("3049") ? () => undefined : (stryCov_9fa48("3049"), () => handleTypeChange(stryMutAct_9fa48("3050") ? "" : (stryCov_9fa48("3050"), 'video')))} />
                    Video
                  </label>
                </div>
              </div>

              {(stryMutAct_9fa48("3053") ? submissionData.type !== 'text' : stryMutAct_9fa48("3052") ? false : stryMutAct_9fa48("3051") ? true : (stryCov_9fa48("3051", "3052", "3053"), submissionData.type === (stryMutAct_9fa48("3054") ? "" : (stryCov_9fa48("3054"), 'text')))) ? <textarea className="task-submission__textarea" value={submissionData.content} onChange={stryMutAct_9fa48("3055") ? () => undefined : (stryCov_9fa48("3055"), e => handleContentChange(e.target.value))} placeholder="Enter your text submission here..." rows={6} /> : (stryMutAct_9fa48("3058") ? submissionData.type !== 'video' : stryMutAct_9fa48("3057") ? false : stryMutAct_9fa48("3056") ? true : (stryCov_9fa48("3056", "3057", "3058"), submissionData.type === (stryMutAct_9fa48("3059") ? "" : (stryCov_9fa48("3059"), 'video')))) ? <div className="task-submission__video-upload-container">
                  <input type="url" className="task-submission__link-input" value={submissionData.content} onChange={stryMutAct_9fa48("3060") ? () => undefined : (stryCov_9fa48("3060"), e => handleContentChange(e.target.value))} placeholder="Paste your Loom video URL here" />
                  {stryMutAct_9fa48("3063") ? submissionData.content && !isValidUrl(submissionData.content) || <p className="task-submission__link-warning">Please enter a valid URL</p> : stryMutAct_9fa48("3062") ? false : stryMutAct_9fa48("3061") ? true : (stryCov_9fa48("3061", "3062", "3063"), (stryMutAct_9fa48("3065") ? submissionData.content || !isValidUrl(submissionData.content) : stryMutAct_9fa48("3064") ? true : (stryCov_9fa48("3064", "3065"), submissionData.content && (stryMutAct_9fa48("3066") ? isValidUrl(submissionData.content) : (stryCov_9fa48("3066"), !isValidUrl(submissionData.content))))) && <p className="task-submission__link-warning">Please enter a valid URL</p>)}
                  {stryMutAct_9fa48("3069") ? submissionData.content && isValidUrl(submissionData.content) && !isLoomUrl(submissionData.content) || <p className="task-submission__link-warning">Please enter a Loom video URL (loom.com)</p> : stryMutAct_9fa48("3068") ? false : stryMutAct_9fa48("3067") ? true : (stryCov_9fa48("3067", "3068", "3069"), (stryMutAct_9fa48("3071") ? submissionData.content && isValidUrl(submissionData.content) || !isLoomUrl(submissionData.content) : stryMutAct_9fa48("3070") ? true : (stryCov_9fa48("3070", "3071"), (stryMutAct_9fa48("3073") ? submissionData.content || isValidUrl(submissionData.content) : stryMutAct_9fa48("3072") ? true : (stryCov_9fa48("3072", "3073"), submissionData.content && isValidUrl(submissionData.content))) && (stryMutAct_9fa48("3074") ? isLoomUrl(submissionData.content) : (stryCov_9fa48("3074"), !isLoomUrl(submissionData.content))))) && <p className="task-submission__link-warning">Please enter a Loom video URL (loom.com)</p>)}
                  {stryMutAct_9fa48("3077") ? submissionData.content && isValidUrl(submissionData.content) && isLoomUrl(submissionData.content) || <div className="task-submission__video-preview">
                      <div className="task-submission__loom-embed">
                        <iframe src={submissionData.content.includes('/share/') ? submissionData.content.replace('/share/', '/embed/') : submissionData.content} frameBorder="0" allowFullScreen className="task-submission__video-player"></iframe>
                      </div>
                      <div className="task-submission__link-actions" style={{
                  justifyContent: 'center',
                  width: '100%'
                }}>
                        <a href={submissionData.content} target="_blank" rel="noreferrer" className="task-submission__link-preview">
                          View Loom video
                        </a>
                      </div>
                    </div> : stryMutAct_9fa48("3076") ? false : stryMutAct_9fa48("3075") ? true : (stryCov_9fa48("3075", "3076", "3077"), (stryMutAct_9fa48("3079") ? submissionData.content && isValidUrl(submissionData.content) || isLoomUrl(submissionData.content) : stryMutAct_9fa48("3078") ? true : (stryCov_9fa48("3078", "3079"), (stryMutAct_9fa48("3081") ? submissionData.content || isValidUrl(submissionData.content) : stryMutAct_9fa48("3080") ? true : (stryCov_9fa48("3080", "3081"), submissionData.content && isValidUrl(submissionData.content))) && isLoomUrl(submissionData.content))) && <div className="task-submission__video-preview">
                      <div className="task-submission__loom-embed">
                        <iframe src={submissionData.content.includes(stryMutAct_9fa48("3082") ? "" : (stryCov_9fa48("3082"), '/share/')) ? submissionData.content.replace(stryMutAct_9fa48("3083") ? "" : (stryCov_9fa48("3083"), '/share/'), stryMutAct_9fa48("3084") ? "" : (stryCov_9fa48("3084"), '/embed/')) : submissionData.content} frameBorder="0" allowFullScreen className="task-submission__video-player"></iframe>
                      </div>
                      <div className="task-submission__link-actions" style={stryMutAct_9fa48("3085") ? {} : (stryCov_9fa48("3085"), {
                  justifyContent: stryMutAct_9fa48("3086") ? "" : (stryCov_9fa48("3086"), 'center'),
                  width: stryMutAct_9fa48("3087") ? "" : (stryCov_9fa48("3087"), '100%')
                })}>
                        <a href={submissionData.content} target="_blank" rel="noreferrer" className="task-submission__link-preview">
                          View Loom video
                        </a>
                      </div>
                    </div>)}
                </div> : <div className="task-submission__link-input-container">
                  <input type="url" className="task-submission__link-input" value={submissionData.content} onChange={stryMutAct_9fa48("3088") ? () => undefined : (stryCov_9fa48("3088"), e => handleContentChange(e.target.value))} placeholder="Paste your Google Drive share link here" />
                  {stryMutAct_9fa48("3091") ? submissionData.content && !isValidUrl(submissionData.content) || <p className="task-submission__link-warning">Please enter a valid URL</p> : stryMutAct_9fa48("3090") ? false : stryMutAct_9fa48("3089") ? true : (stryCov_9fa48("3089", "3090", "3091"), (stryMutAct_9fa48("3093") ? submissionData.content || !isValidUrl(submissionData.content) : stryMutAct_9fa48("3092") ? true : (stryCov_9fa48("3092", "3093"), submissionData.content && (stryMutAct_9fa48("3094") ? isValidUrl(submissionData.content) : (stryCov_9fa48("3094"), !isValidUrl(submissionData.content))))) && <p className="task-submission__link-warning">Please enter a valid URL</p>)}
                  {stryMutAct_9fa48("3097") ? submissionData.content && isValidUrl(submissionData.content) || <div className="task-submission__link-actions">
                      <a href={submissionData.content} target="_blank" rel="noreferrer" className="task-submission__link-preview">
                        View shared document
                      </a>
                      
                      {/* Only show analyze button for Google Docs */}
                      {submission && isGoogleDoc(submissionData.content) && <button type="button" className="task-submission__analyze-btn" onClick={handleAnalyzeSubmission} disabled={isAnalyzing || !isActive}>
                          {isAnalyzing ? 'Analyzing...' : 'Analyze This Submission'}
                        </button>}
                      
                      {/* Show message if URL is not a Google Doc */}
                      {submission && !isGoogleDoc(submissionData.content) && submissionData.type === 'link' && <div className="task-submission__not-google-doc">
                          <span>Only Google Docs can be analyzed</span>
                        </div>}
                    </div> : stryMutAct_9fa48("3096") ? false : stryMutAct_9fa48("3095") ? true : (stryCov_9fa48("3095", "3096", "3097"), (stryMutAct_9fa48("3099") ? submissionData.content || isValidUrl(submissionData.content) : stryMutAct_9fa48("3098") ? true : (stryCov_9fa48("3098", "3099"), submissionData.content && isValidUrl(submissionData.content))) && <div className="task-submission__link-actions">
                      <a href={submissionData.content} target="_blank" rel="noreferrer" className="task-submission__link-preview">
                        View shared document
                      </a>
                      
                      {/* Only show analyze button for Google Docs */}
                      {stryMutAct_9fa48("3102") ? submission && isGoogleDoc(submissionData.content) || <button type="button" className="task-submission__analyze-btn" onClick={handleAnalyzeSubmission} disabled={isAnalyzing || !isActive}>
                          {isAnalyzing ? 'Analyzing...' : 'Analyze This Submission'}
                        </button> : stryMutAct_9fa48("3101") ? false : stryMutAct_9fa48("3100") ? true : (stryCov_9fa48("3100", "3101", "3102"), (stryMutAct_9fa48("3104") ? submission || isGoogleDoc(submissionData.content) : stryMutAct_9fa48("3103") ? true : (stryCov_9fa48("3103", "3104"), submission && isGoogleDoc(submissionData.content))) && <button type="button" className="task-submission__analyze-btn" onClick={handleAnalyzeSubmission} disabled={stryMutAct_9fa48("3107") ? isAnalyzing && !isActive : stryMutAct_9fa48("3106") ? false : stryMutAct_9fa48("3105") ? true : (stryCov_9fa48("3105", "3106", "3107"), isAnalyzing || (stryMutAct_9fa48("3108") ? isActive : (stryCov_9fa48("3108"), !isActive)))}>
                          {isAnalyzing ? stryMutAct_9fa48("3109") ? "" : (stryCov_9fa48("3109"), 'Analyzing...') : stryMutAct_9fa48("3110") ? "" : (stryCov_9fa48("3110"), 'Analyze This Submission')}
                        </button>)}
                      
                      {/* Show message if URL is not a Google Doc */}
                      {stryMutAct_9fa48("3113") ? submission && !isGoogleDoc(submissionData.content) && submissionData.type === 'link' || <div className="task-submission__not-google-doc">
                          <span>Only Google Docs can be analyzed</span>
                        </div> : stryMutAct_9fa48("3112") ? false : stryMutAct_9fa48("3111") ? true : (stryCov_9fa48("3111", "3112", "3113"), (stryMutAct_9fa48("3115") ? submission && !isGoogleDoc(submissionData.content) || submissionData.type === 'link' : stryMutAct_9fa48("3114") ? true : (stryCov_9fa48("3114", "3115"), (stryMutAct_9fa48("3117") ? submission || !isGoogleDoc(submissionData.content) : stryMutAct_9fa48("3116") ? true : (stryCov_9fa48("3116", "3117"), submission && (stryMutAct_9fa48("3118") ? isGoogleDoc(submissionData.content) : (stryCov_9fa48("3118"), !isGoogleDoc(submissionData.content))))) && (stryMutAct_9fa48("3120") ? submissionData.type !== 'link' : stryMutAct_9fa48("3119") ? true : (stryCov_9fa48("3119", "3120"), submissionData.type === (stryMutAct_9fa48("3121") ? "" : (stryCov_9fa48("3121"), 'link')))))) && <div className="task-submission__not-google-doc">
                          <span>Only Google Docs can be analyzed</span>
                        </div>)}
                    </div>)}
                  
                  {/* Display error message for this submission */}
                  {stryMutAct_9fa48("3124") ? submissionError || <div className="task-submission__submission-error">
                      <p>
                        <span className="task-submission__error-icon">⚠️</span> 
                        {submissionError}
                      </p>
                      {submissionError.includes("Google Doc") && <div className="task-submission__error-help">
                          <p>How to fix:</p>
                          <ol>
                            <li>Open your Google Doc</li>
                            <li>Click the "Share" button in the top right</li>
                            <li>In the "Get Link" section, click "Change to anyone with the link"</li>
                            <li>Ensure the permission is set to "Viewer"</li>
                            <li>Click "Copy link" and try again</li>
                          </ol>
                        </div>}
                    </div> : stryMutAct_9fa48("3123") ? false : stryMutAct_9fa48("3122") ? true : (stryCov_9fa48("3122", "3123", "3124"), submissionError && <div className="task-submission__submission-error">
                      <p>
                        <span className="task-submission__error-icon">⚠️</span> 
                        {submissionError}
                      </p>
                      {stryMutAct_9fa48("3127") ? submissionError.includes("Google Doc") || <div className="task-submission__error-help">
                          <p>How to fix:</p>
                          <ol>
                            <li>Open your Google Doc</li>
                            <li>Click the "Share" button in the top right</li>
                            <li>In the "Get Link" section, click "Change to anyone with the link"</li>
                            <li>Ensure the permission is set to "Viewer"</li>
                            <li>Click "Copy link" and try again</li>
                          </ol>
                        </div> : stryMutAct_9fa48("3126") ? false : stryMutAct_9fa48("3125") ? true : (stryCov_9fa48("3125", "3126", "3127"), submissionError.includes(stryMutAct_9fa48("3128") ? "" : (stryCov_9fa48("3128"), "Google Doc")) && <div className="task-submission__error-help">
                          <p>How to fix:</p>
                          <ol>
                            <li>Open your Google Doc</li>
                            <li>Click the "Share" button in the top right</li>
                            <li>In the "Get Link" section, click "Change to anyone with the link"</li>
                            <li>Ensure the permission is set to "Viewer"</li>
                            <li>Click "Copy link" and try again</li>
                          </ol>
                        </div>)}
                    </div>)}
                </div>}
            </div>

            <div className="task-submission__actions">
              <button type="submit" className="task-submission__button" disabled={stryMutAct_9fa48("3131") ? isSubmitting && !submissionData.content.trim() : stryMutAct_9fa48("3130") ? false : stryMutAct_9fa48("3129") ? true : (stryCov_9fa48("3129", "3130", "3131"), isSubmitting || (stryMutAct_9fa48("3132") ? submissionData.content.trim() : (stryCov_9fa48("3132"), !(stryMutAct_9fa48("3133") ? submissionData.content : (stryCov_9fa48("3133"), submissionData.content.trim())))))}>
                {isSubmitting ? stryMutAct_9fa48("3134") ? "" : (stryCov_9fa48("3134"), 'Submitting...') : submission ? stryMutAct_9fa48("3135") ? "" : (stryCov_9fa48("3135"), 'Update Submission') : stryMutAct_9fa48("3136") ? "" : (stryCov_9fa48("3136"), 'Submit')}
              </button>
            </div>

            {stryMutAct_9fa48("3139") ? error || <div className="task-submission__error">
                {error}
              </div> : stryMutAct_9fa48("3138") ? false : stryMutAct_9fa48("3137") ? true : (stryCov_9fa48("3137", "3138", "3139"), error && <div className="task-submission__error">
                {error}
              </div>)}

            {stryMutAct_9fa48("3142") ? submission || <div className="task-submission__status">
                <p>Last updated: {formatSubmissionTimestamp(submission.updated_at)}</p>
              </div> : stryMutAct_9fa48("3141") ? false : stryMutAct_9fa48("3140") ? true : (stryCov_9fa48("3140", "3141", "3142"), submission && <div className="task-submission__status">
                <p>Last updated: {formatSubmissionTimestamp(submission.updated_at)}</p>
              </div>)}

            {stryMutAct_9fa48("3145") ? feedback || <div className="task-submission__feedback">
                <h4 className="task-submission__feedback-title">Feedback</h4>
                <p className="task-submission__feedback-content">{feedback}</p>
              </div> : stryMutAct_9fa48("3144") ? false : stryMutAct_9fa48("3143") ? true : (stryCov_9fa48("3143", "3144", "3145"), feedback && <div className="task-submission__feedback">
                <h4 className="task-submission__feedback-title">Feedback</h4>
                <p className="task-submission__feedback-content">{feedback}</p>
              </div>)}
          </form>

          {/* Add the Confirmation Modal */}
          <ConfirmationModal isOpen={showConfirmModal} message={confirmMessage} onConfirm={handleConfirm} onCancel={handleCancel} />
        </>}
    </div>;
  }
};
export default TaskSubmission;