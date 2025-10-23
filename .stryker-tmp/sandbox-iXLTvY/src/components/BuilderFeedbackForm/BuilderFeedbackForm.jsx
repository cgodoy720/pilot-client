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
import { FaCheck, FaTimes, FaSpinner, FaClipboardList, FaExclamationCircle, FaCheckCircle, FaEye, FaEdit } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';
import './BuilderFeedbackForm.css';
const BuilderFeedbackForm = ({
  taskId,
  dayNumber,
  cohort,
  onComplete,
  onCancel
}) => {
  if (stryMutAct_9fa48("666")) {
    {}
  } else {
    stryCov_9fa48("666");
    const {
      token,
      user
    } = useAuth();
    const isActive = stryMutAct_9fa48("669") ? user?.active === false : stryMutAct_9fa48("668") ? false : stryMutAct_9fa48("667") ? true : (stryCov_9fa48("667", "668", "669"), (stryMutAct_9fa48("670") ? user.active : (stryCov_9fa48("670"), user?.active)) !== (stryMutAct_9fa48("671") ? true : (stryCov_9fa48("671"), false)));

    // Form state
    const [formData, setFormData] = useState(stryMutAct_9fa48("672") ? {} : (stryCov_9fa48("672"), {
      referral_likelihood: stryMutAct_9fa48("673") ? "Stryker was here!" : (stryCov_9fa48("673"), ''),
      what_we_did_well: stryMutAct_9fa48("674") ? "Stryker was here!" : (stryCov_9fa48("674"), ''),
      what_to_improve: stryMutAct_9fa48("675") ? "Stryker was here!" : (stryCov_9fa48("675"), ''),
      tools_used: stryMutAct_9fa48("676") ? "Stryker was here!" : (stryCov_9fa48("676"), ''),
      programming_languages: stryMutAct_9fa48("677") ? "Stryker was here!" : (stryCov_9fa48("677"), '')
    }));

    // UI state
    const [isLoading, setIsLoading] = useState(stryMutAct_9fa48("678") ? false : (stryCov_9fa48("678"), true));
    const [isSubmitting, setIsSubmitting] = useState(stryMutAct_9fa48("679") ? true : (stryCov_9fa48("679"), false));
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(stryMutAct_9fa48("680") ? true : (stryCov_9fa48("680"), false));
    const [existingFeedback, setExistingFeedback] = useState(null);
    const [isSubmitted, setIsSubmitted] = useState(stryMutAct_9fa48("681") ? true : (stryCov_9fa48("681"), false));
    const [submittedAt, setSubmittedAt] = useState(null);

    // Load existing feedback if any
    useEffect(() => {
      if (stryMutAct_9fa48("682")) {
        {}
      } else {
        stryCov_9fa48("682");
        const loadExistingFeedback = async () => {
          if (stryMutAct_9fa48("683")) {
            {}
          } else {
            stryCov_9fa48("683");
            if (stryMutAct_9fa48("686") ? !taskId && !token : stryMutAct_9fa48("685") ? false : stryMutAct_9fa48("684") ? true : (stryCov_9fa48("684", "685", "686"), (stryMutAct_9fa48("687") ? taskId : (stryCov_9fa48("687"), !taskId)) || (stryMutAct_9fa48("688") ? token : (stryCov_9fa48("688"), !token)))) return;
            try {
              if (stryMutAct_9fa48("689")) {
                {}
              } else {
                stryCov_9fa48("689");
                setIsLoading(stryMutAct_9fa48("690") ? false : (stryCov_9fa48("690"), true));
                const response = await fetch(stryMutAct_9fa48("691") ? `` : (stryCov_9fa48("691"), `${import.meta.env.VITE_API_URL}/api/builder-feedback/${taskId}`), stryMutAct_9fa48("692") ? {} : (stryCov_9fa48("692"), {
                  headers: stryMutAct_9fa48("693") ? {} : (stryCov_9fa48("693"), {
                    'Authorization': stryMutAct_9fa48("694") ? `` : (stryCov_9fa48("694"), `Bearer ${token}`)
                  })
                }));
                if (stryMutAct_9fa48("696") ? false : stryMutAct_9fa48("695") ? true : (stryCov_9fa48("695", "696"), response.ok)) {
                  if (stryMutAct_9fa48("697")) {
                    {}
                  } else {
                    stryCov_9fa48("697");
                    const data = await response.json();
                    if (stryMutAct_9fa48("699") ? false : stryMutAct_9fa48("698") ? true : (stryCov_9fa48("698", "699"), data.feedback)) {
                      if (stryMutAct_9fa48("700")) {
                        {}
                      } else {
                        stryCov_9fa48("700");
                        setExistingFeedback(data.feedback);
                        setFormData(stryMutAct_9fa48("701") ? {} : (stryCov_9fa48("701"), {
                          referral_likelihood: stryMutAct_9fa48("704") ? data.feedback.referral_likelihood?.toString() && '' : stryMutAct_9fa48("703") ? false : stryMutAct_9fa48("702") ? true : (stryCov_9fa48("702", "703", "704"), (stryMutAct_9fa48("705") ? data.feedback.referral_likelihood.toString() : (stryCov_9fa48("705"), data.feedback.referral_likelihood?.toString())) || (stryMutAct_9fa48("706") ? "Stryker was here!" : (stryCov_9fa48("706"), ''))),
                          what_we_did_well: stryMutAct_9fa48("709") ? data.feedback.what_we_did_well && '' : stryMutAct_9fa48("708") ? false : stryMutAct_9fa48("707") ? true : (stryCov_9fa48("707", "708", "709"), data.feedback.what_we_did_well || (stryMutAct_9fa48("710") ? "Stryker was here!" : (stryCov_9fa48("710"), ''))),
                          what_to_improve: stryMutAct_9fa48("713") ? data.feedback.what_to_improve && '' : stryMutAct_9fa48("712") ? false : stryMutAct_9fa48("711") ? true : (stryCov_9fa48("711", "712", "713"), data.feedback.what_to_improve || (stryMutAct_9fa48("714") ? "Stryker was here!" : (stryCov_9fa48("714"), ''))),
                          tools_used: stryMutAct_9fa48("717") ? data.feedback.tools_used && '' : stryMutAct_9fa48("716") ? false : stryMutAct_9fa48("715") ? true : (stryCov_9fa48("715", "716", "717"), data.feedback.tools_used || (stryMutAct_9fa48("718") ? "Stryker was here!" : (stryCov_9fa48("718"), ''))),
                          programming_languages: stryMutAct_9fa48("721") ? data.feedback.programming_languages && '' : stryMutAct_9fa48("720") ? false : stryMutAct_9fa48("719") ? true : (stryCov_9fa48("719", "720", "721"), data.feedback.programming_languages || (stryMutAct_9fa48("722") ? "Stryker was here!" : (stryCov_9fa48("722"), '')))
                        }));
                        setIsSubmitted(stryMutAct_9fa48("723") ? false : (stryCov_9fa48("723"), true));
                        setSubmittedAt(data.feedback.created_at);
                      }
                    }
                  }
                } else if (stryMutAct_9fa48("726") ? response.status === 404 : stryMutAct_9fa48("725") ? false : stryMutAct_9fa48("724") ? true : (stryCov_9fa48("724", "725", "726"), response.status !== 404)) {
                  if (stryMutAct_9fa48("727")) {
                    {}
                  } else {
                    stryCov_9fa48("727");
                    // 404 is expected if no feedback exists yet
                    console.error(stryMutAct_9fa48("728") ? "" : (stryCov_9fa48("728"), 'Failed to load existing feedback'));
                  }
                }
              }
            } catch (err) {
              if (stryMutAct_9fa48("729")) {
                {}
              } else {
                stryCov_9fa48("729");
                console.error(stryMutAct_9fa48("730") ? "" : (stryCov_9fa48("730"), 'Error loading existing feedback:'), err);
              }
            } finally {
              if (stryMutAct_9fa48("731")) {
                {}
              } else {
                stryCov_9fa48("731");
                setIsLoading(stryMutAct_9fa48("732") ? true : (stryCov_9fa48("732"), false));
              }
            }
          }
        };
        loadExistingFeedback();
      }
    }, stryMutAct_9fa48("733") ? [] : (stryCov_9fa48("733"), [taskId, token]));

    // Handle form input changes
    const handleInputChange = (field, value) => {
      if (stryMutAct_9fa48("734")) {
        {}
      } else {
        stryCov_9fa48("734");
        setFormData(stryMutAct_9fa48("735") ? () => undefined : (stryCov_9fa48("735"), prev => stryMutAct_9fa48("736") ? {} : (stryCov_9fa48("736"), {
          ...prev,
          [field]: value
        })));

        // Clear error when user starts typing
        if (stryMutAct_9fa48("738") ? false : stryMutAct_9fa48("737") ? true : (stryCov_9fa48("737", "738"), error)) {
          if (stryMutAct_9fa48("739")) {
            {}
          } else {
            stryCov_9fa48("739");
            setError(null);
          }
        }
      }
    };

    // Validate form data
    const validateForm = () => {
      if (stryMutAct_9fa48("740")) {
        {}
      } else {
        stryCov_9fa48("740");
        // Check referral likelihood
        const referralNum = parseInt(formData.referral_likelihood);
        if (stryMutAct_9fa48("743") ? (!referralNum || referralNum < 1) && referralNum > 10 : stryMutAct_9fa48("742") ? false : stryMutAct_9fa48("741") ? true : (stryCov_9fa48("741", "742", "743"), (stryMutAct_9fa48("745") ? !referralNum && referralNum < 1 : stryMutAct_9fa48("744") ? false : (stryCov_9fa48("744", "745"), (stryMutAct_9fa48("746") ? referralNum : (stryCov_9fa48("746"), !referralNum)) || (stryMutAct_9fa48("749") ? referralNum >= 1 : stryMutAct_9fa48("748") ? referralNum <= 1 : stryMutAct_9fa48("747") ? false : (stryCov_9fa48("747", "748", "749"), referralNum < 1)))) || (stryMutAct_9fa48("752") ? referralNum <= 10 : stryMutAct_9fa48("751") ? referralNum >= 10 : stryMutAct_9fa48("750") ? false : (stryCov_9fa48("750", "751", "752"), referralNum > 10)))) {
          if (stryMutAct_9fa48("753")) {
            {}
          } else {
            stryCov_9fa48("753");
            return stryMutAct_9fa48("754") ? "" : (stryCov_9fa48("754"), 'Please select a referral likelihood between 1 and 10');
          }
        }

        // Check that at least one text field is filled
        const textFields = stryMutAct_9fa48("755") ? [] : (stryCov_9fa48("755"), [formData.what_we_did_well, formData.what_to_improve, formData.tools_used, formData.programming_languages]);
        const hasTextContent = stryMutAct_9fa48("756") ? textFields.every(field => field && field.trim().length > 0) : (stryCov_9fa48("756"), textFields.some(stryMutAct_9fa48("757") ? () => undefined : (stryCov_9fa48("757"), field => stryMutAct_9fa48("760") ? field || field.trim().length > 0 : stryMutAct_9fa48("759") ? false : stryMutAct_9fa48("758") ? true : (stryCov_9fa48("758", "759", "760"), field && (stryMutAct_9fa48("763") ? field.trim().length <= 0 : stryMutAct_9fa48("762") ? field.trim().length >= 0 : stryMutAct_9fa48("761") ? true : (stryCov_9fa48("761", "762", "763"), (stryMutAct_9fa48("764") ? field.length : (stryCov_9fa48("764"), field.trim().length)) > 0))))));
        if (stryMutAct_9fa48("767") ? false : stryMutAct_9fa48("766") ? true : stryMutAct_9fa48("765") ? hasTextContent : (stryCov_9fa48("765", "766", "767"), !hasTextContent)) {
          if (stryMutAct_9fa48("768")) {
            {}
          } else {
            stryCov_9fa48("768");
            return stryMutAct_9fa48("769") ? "" : (stryCov_9fa48("769"), 'Please fill out at least one of the text fields');
          }
        }
        return null;
      }
    };

    // Show confirmation modal before submission
    const showConfirmationModal = async () => {
      if (stryMutAct_9fa48("770")) {
        {}
      } else {
        stryCov_9fa48("770");
        const result = await Swal.fire(stryMutAct_9fa48("771") ? {} : (stryCov_9fa48("771"), {
          title: stryMutAct_9fa48("772") ? "" : (stryCov_9fa48("772"), 'Submit Feedback?'),
          html: stryMutAct_9fa48("773") ? `` : (stryCov_9fa48("773"), `
        <div style="text-align: left; color: var(--color-text-primary);">
          <p style="margin-bottom: 1rem;">Are you sure you want to submit this feedback? Once submitted, you won't be able to edit it.</p>
          <div style="background: var(--color-background-dark); padding: 1rem; border-radius: 8px; border: 1px solid var(--color-border);">
            <p style="margin: 0 0 0.5rem 0; font-weight: 600;">Your feedback summary:</p>
            <p style="margin: 0 0 0.5rem 0;"><strong>Referral likelihood:</strong> ${formData.referral_likelihood}/10</p>
            ${formData.what_we_did_well ? stryMutAct_9fa48("774") ? `` : (stryCov_9fa48("774"), `<p style="margin: 0 0 0.5rem 0;"><strong>What we did well:</strong> ${stryMutAct_9fa48("775") ? formData.what_we_did_well : (stryCov_9fa48("775"), formData.what_we_did_well.substring(0, 100))}${(stryMutAct_9fa48("779") ? formData.what_we_did_well.length <= 100 : stryMutAct_9fa48("778") ? formData.what_we_did_well.length >= 100 : stryMutAct_9fa48("777") ? false : stryMutAct_9fa48("776") ? true : (stryCov_9fa48("776", "777", "778", "779"), formData.what_we_did_well.length > 100)) ? stryMutAct_9fa48("780") ? "" : (stryCov_9fa48("780"), '...') : stryMutAct_9fa48("781") ? "Stryker was here!" : (stryCov_9fa48("781"), '')}</p>`) : stryMutAct_9fa48("782") ? "Stryker was here!" : (stryCov_9fa48("782"), '')}
            ${formData.what_to_improve ? stryMutAct_9fa48("783") ? `` : (stryCov_9fa48("783"), `<p style="margin: 0 0 0.5rem 0;"><strong>What to improve:</strong> ${stryMutAct_9fa48("784") ? formData.what_to_improve : (stryCov_9fa48("784"), formData.what_to_improve.substring(0, 100))}${(stryMutAct_9fa48("788") ? formData.what_to_improve.length <= 100 : stryMutAct_9fa48("787") ? formData.what_to_improve.length >= 100 : stryMutAct_9fa48("786") ? false : stryMutAct_9fa48("785") ? true : (stryCov_9fa48("785", "786", "787", "788"), formData.what_to_improve.length > 100)) ? stryMutAct_9fa48("789") ? "" : (stryCov_9fa48("789"), '...') : stryMutAct_9fa48("790") ? "Stryker was here!" : (stryCov_9fa48("790"), '')}</p>`) : stryMutAct_9fa48("791") ? "Stryker was here!" : (stryCov_9fa48("791"), '')}
            ${formData.tools_used ? stryMutAct_9fa48("792") ? `` : (stryCov_9fa48("792"), `<p style="margin: 0 0 0.5rem 0;"><strong>Tools used:</strong> ${stryMutAct_9fa48("793") ? formData.tools_used : (stryCov_9fa48("793"), formData.tools_used.substring(0, 100))}${(stryMutAct_9fa48("797") ? formData.tools_used.length <= 100 : stryMutAct_9fa48("796") ? formData.tools_used.length >= 100 : stryMutAct_9fa48("795") ? false : stryMutAct_9fa48("794") ? true : (stryCov_9fa48("794", "795", "796", "797"), formData.tools_used.length > 100)) ? stryMutAct_9fa48("798") ? "" : (stryCov_9fa48("798"), '...') : stryMutAct_9fa48("799") ? "Stryker was here!" : (stryCov_9fa48("799"), '')}</p>`) : stryMutAct_9fa48("800") ? "Stryker was here!" : (stryCov_9fa48("800"), '')}
            ${formData.programming_languages ? stryMutAct_9fa48("801") ? `` : (stryCov_9fa48("801"), `<p style="margin: 0;"><strong>Languages:</strong> ${stryMutAct_9fa48("802") ? formData.programming_languages : (stryCov_9fa48("802"), formData.programming_languages.substring(0, 100))}${(stryMutAct_9fa48("806") ? formData.programming_languages.length <= 100 : stryMutAct_9fa48("805") ? formData.programming_languages.length >= 100 : stryMutAct_9fa48("804") ? false : stryMutAct_9fa48("803") ? true : (stryCov_9fa48("803", "804", "805", "806"), formData.programming_languages.length > 100)) ? stryMutAct_9fa48("807") ? "" : (stryCov_9fa48("807"), '...') : stryMutAct_9fa48("808") ? "Stryker was here!" : (stryCov_9fa48("808"), '')}</p>`) : stryMutAct_9fa48("809") ? "Stryker was here!" : (stryCov_9fa48("809"), '')}
          </div>
        </div>
      `),
          icon: stryMutAct_9fa48("810") ? "" : (stryCov_9fa48("810"), 'question'),
          showCancelButton: stryMutAct_9fa48("811") ? false : (stryCov_9fa48("811"), true),
          confirmButtonText: stryMutAct_9fa48("812") ? "" : (stryCov_9fa48("812"), 'Yes, Submit Feedback'),
          cancelButtonText: stryMutAct_9fa48("813") ? "" : (stryCov_9fa48("813"), 'Review Again'),
          confirmButtonColor: stryMutAct_9fa48("814") ? "" : (stryCov_9fa48("814"), 'var(--color-primary)'),
          cancelButtonColor: stryMutAct_9fa48("815") ? "" : (stryCov_9fa48("815"), 'var(--color-border)'),
          background: stryMutAct_9fa48("816") ? "" : (stryCov_9fa48("816"), 'var(--color-background-darker)'),
          color: stryMutAct_9fa48("817") ? "" : (stryCov_9fa48("817"), 'var(--color-text-primary)'),
          customClass: stryMutAct_9fa48("818") ? {} : (stryCov_9fa48("818"), {
            popup: stryMutAct_9fa48("819") ? "" : (stryCov_9fa48("819"), 'swal-dark-theme'),
            title: stryMutAct_9fa48("820") ? "" : (stryCov_9fa48("820"), 'swal-title-dark'),
            content: stryMutAct_9fa48("821") ? "" : (stryCov_9fa48("821"), 'swal-content-dark'),
            confirmButton: stryMutAct_9fa48("822") ? "" : (stryCov_9fa48("822"), 'swal-confirm-dark'),
            cancelButton: stryMutAct_9fa48("823") ? "" : (stryCov_9fa48("823"), 'swal-cancel-dark')
          })
        }));
        return result.isConfirmed;
      }
    };

    // Handle form submission
    const handleSubmit = async e => {
      if (stryMutAct_9fa48("824")) {
        {}
      } else {
        stryCov_9fa48("824");
        e.preventDefault();
        if (stryMutAct_9fa48("827") ? false : stryMutAct_9fa48("826") ? true : stryMutAct_9fa48("825") ? isActive : (stryCov_9fa48("825", "826", "827"), !isActive)) {
          if (stryMutAct_9fa48("828")) {
            {}
          } else {
            stryCov_9fa48("828");
            setError(stryMutAct_9fa48("829") ? "" : (stryCov_9fa48("829"), 'You have historical access only and cannot submit feedback.'));
            return;
          }
        }
        const validationError = validateForm();
        if (stryMutAct_9fa48("831") ? false : stryMutAct_9fa48("830") ? true : (stryCov_9fa48("830", "831"), validationError)) {
          if (stryMutAct_9fa48("832")) {
            {}
          } else {
            stryCov_9fa48("832");
            setError(validationError);
            return;
          }
        }

        // Show confirmation modal
        const confirmed = await showConfirmationModal();
        if (stryMutAct_9fa48("835") ? false : stryMutAct_9fa48("834") ? true : stryMutAct_9fa48("833") ? confirmed : (stryCov_9fa48("833", "834", "835"), !confirmed)) {
          if (stryMutAct_9fa48("836")) {
            {}
          } else {
            stryCov_9fa48("836");
            return;
          }
        }
        setIsSubmitting(stryMutAct_9fa48("837") ? false : (stryCov_9fa48("837"), true));
        setError(null);
        try {
          if (stryMutAct_9fa48("838")) {
            {}
          } else {
            stryCov_9fa48("838");
            const submitData = stryMutAct_9fa48("839") ? {} : (stryCov_9fa48("839"), {
              taskId: parseInt(taskId),
              referral_likelihood: parseInt(formData.referral_likelihood),
              what_we_did_well: stryMutAct_9fa48("842") ? formData.what_we_did_well.trim() && null : stryMutAct_9fa48("841") ? false : stryMutAct_9fa48("840") ? true : (stryCov_9fa48("840", "841", "842"), (stryMutAct_9fa48("843") ? formData.what_we_did_well : (stryCov_9fa48("843"), formData.what_we_did_well.trim())) || null),
              what_to_improve: stryMutAct_9fa48("846") ? formData.what_to_improve.trim() && null : stryMutAct_9fa48("845") ? false : stryMutAct_9fa48("844") ? true : (stryCov_9fa48("844", "845", "846"), (stryMutAct_9fa48("847") ? formData.what_to_improve : (stryCov_9fa48("847"), formData.what_to_improve.trim())) || null),
              tools_used: stryMutAct_9fa48("850") ? formData.tools_used.trim() && null : stryMutAct_9fa48("849") ? false : stryMutAct_9fa48("848") ? true : (stryCov_9fa48("848", "849", "850"), (stryMutAct_9fa48("851") ? formData.tools_used : (stryCov_9fa48("851"), formData.tools_used.trim())) || null),
              programming_languages: stryMutAct_9fa48("854") ? formData.programming_languages.trim() && null : stryMutAct_9fa48("853") ? false : stryMutAct_9fa48("852") ? true : (stryCov_9fa48("852", "853", "854"), (stryMutAct_9fa48("855") ? formData.programming_languages : (stryCov_9fa48("855"), formData.programming_languages.trim())) || null),
              dayNumber,
              cohort
            });
            const url = existingFeedback ? stryMutAct_9fa48("856") ? `` : (stryCov_9fa48("856"), `${import.meta.env.VITE_API_URL}/api/builder-feedback/${taskId}`) : stryMutAct_9fa48("857") ? `` : (stryCov_9fa48("857"), `${import.meta.env.VITE_API_URL}/api/builder-feedback/submit`);
            const method = existingFeedback ? stryMutAct_9fa48("858") ? "" : (stryCov_9fa48("858"), 'PUT') : stryMutAct_9fa48("859") ? "" : (stryCov_9fa48("859"), 'POST');
            const response = await fetch(url, stryMutAct_9fa48("860") ? {} : (stryCov_9fa48("860"), {
              method,
              headers: stryMutAct_9fa48("861") ? {} : (stryCov_9fa48("861"), {
                'Content-Type': stryMutAct_9fa48("862") ? "" : (stryCov_9fa48("862"), 'application/json'),
                'Authorization': stryMutAct_9fa48("863") ? `` : (stryCov_9fa48("863"), `Bearer ${token}`)
              }),
              body: JSON.stringify(submitData)
            }));
            if (stryMutAct_9fa48("865") ? false : stryMutAct_9fa48("864") ? true : (stryCov_9fa48("864", "865"), response.ok)) {
              if (stryMutAct_9fa48("866")) {
                {}
              } else {
                stryCov_9fa48("866");
                setSuccess(stryMutAct_9fa48("867") ? false : (stryCov_9fa48("867"), true));
                setIsSubmitted(stryMutAct_9fa48("868") ? false : (stryCov_9fa48("868"), true));
                setSubmittedAt(new Date().toISOString());
                if (stryMutAct_9fa48("870") ? false : stryMutAct_9fa48("869") ? true : (stryCov_9fa48("869", "870"), onComplete)) {
                  if (stryMutAct_9fa48("871")) {
                    {}
                  } else {
                    stryCov_9fa48("871");
                    setTimeout(stryMutAct_9fa48("872") ? () => undefined : (stryCov_9fa48("872"), () => onComplete()), 1500);
                  }
                }
              }
            } else {
              if (stryMutAct_9fa48("873")) {
                {}
              } else {
                stryCov_9fa48("873");
                const errorData = await response.json();
                setError(stryMutAct_9fa48("876") ? errorData.error && 'Failed to submit feedback' : stryMutAct_9fa48("875") ? false : stryMutAct_9fa48("874") ? true : (stryCov_9fa48("874", "875", "876"), errorData.error || (stryMutAct_9fa48("877") ? "" : (stryCov_9fa48("877"), 'Failed to submit feedback'))));
              }
            }
          }
        } catch (err) {
          if (stryMutAct_9fa48("878")) {
            {}
          } else {
            stryCov_9fa48("878");
            console.error(stryMutAct_9fa48("879") ? "" : (stryCov_9fa48("879"), 'Error submitting feedback:'), err);
            setError(stryMutAct_9fa48("880") ? "" : (stryCov_9fa48("880"), 'Network error. Please try again.'));
          }
        } finally {
          if (stryMutAct_9fa48("881")) {
            {}
          } else {
            stryCov_9fa48("881");
            setIsSubmitting(stryMutAct_9fa48("882") ? true : (stryCov_9fa48("882"), false));
          }
        }
      }
    };

    // Render rating scale buttons
    const renderRatingScale = () => {
      if (stryMutAct_9fa48("883")) {
        {}
      } else {
        stryCov_9fa48("883");
        return <div className="builder-feedback__rating-scale">
        {(stryMutAct_9fa48("884") ? [] : (stryCov_9fa48("884"), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10])).map(stryMutAct_9fa48("885") ? () => undefined : (stryCov_9fa48("885"), num => <button key={num} type="button" className={stryMutAct_9fa48("886") ? `` : (stryCov_9fa48("886"), `builder-feedback__rating-button ${(stryMutAct_9fa48("889") ? formData.referral_likelihood !== num.toString() : stryMutAct_9fa48("888") ? false : stryMutAct_9fa48("887") ? true : (stryCov_9fa48("887", "888", "889"), formData.referral_likelihood === num.toString())) ? stryMutAct_9fa48("890") ? "" : (stryCov_9fa48("890"), 'builder-feedback__rating-button--selected') : stryMutAct_9fa48("891") ? "Stryker was here!" : (stryCov_9fa48("891"), '')}`)} onClick={stryMutAct_9fa48("892") ? () => undefined : (stryCov_9fa48("892"), () => handleInputChange(stryMutAct_9fa48("893") ? "" : (stryCov_9fa48("893"), 'referral_likelihood'), num.toString()))} disabled={stryMutAct_9fa48("896") ? !isActive && isSubmitting : stryMutAct_9fa48("895") ? false : stryMutAct_9fa48("894") ? true : (stryCov_9fa48("894", "895", "896"), (stryMutAct_9fa48("897") ? isActive : (stryCov_9fa48("897"), !isActive)) || isSubmitting)}>
            {num}
          </button>))}
      </div>;
      }
    };
    if (stryMutAct_9fa48("899") ? false : stryMutAct_9fa48("898") ? true : (stryCov_9fa48("898", "899"), isLoading)) {
      if (stryMutAct_9fa48("900")) {
        {}
      } else {
        stryCov_9fa48("900");
        return <div className="builder-feedback builder-feedback--loading">
        <div className="builder-feedback__loading">
          <FaSpinner className="builder-feedback__loading-icon" />
          <p>Loading feedback form...</p>
        </div>
      </div>;
      }
    }
    if (stryMutAct_9fa48("902") ? false : stryMutAct_9fa48("901") ? true : (stryCov_9fa48("901", "902"), success)) {
      if (stryMutAct_9fa48("903")) {
        {}
      } else {
        stryCov_9fa48("903");
        return <div className="builder-feedback builder-feedback--success">
        <div className="builder-feedback__success">
          <FaCheckCircle className="builder-feedback__success-icon" />
          <h2>Thank you for your feedback!</h2>
          <p>Your response has been {existingFeedback ? stryMutAct_9fa48("904") ? "" : (stryCov_9fa48("904"), 'updated') : stryMutAct_9fa48("905") ? "" : (stryCov_9fa48("905"), 'submitted')} successfully.</p>
        </div>
      </div>;
      }
    }

    // Show read-only view if feedback has been submitted
    if (stryMutAct_9fa48("908") ? isSubmitted || existingFeedback : stryMutAct_9fa48("907") ? false : stryMutAct_9fa48("906") ? true : (stryCov_9fa48("906", "907", "908"), isSubmitted && existingFeedback)) {
      if (stryMutAct_9fa48("909")) {
        {}
      } else {
        stryCov_9fa48("909");
        return <div className="builder-feedback builder-feedback--readonly">
        <div className="builder-feedback__header">
          <FaEye className="builder-feedback__icon" />
          <h2 className="builder-feedback__title">Feedback Submitted</h2>
          <p className="builder-feedback__subtitle">
            Your feedback has been captured and locked. This preserves your moment-in-time perspective.
          </p>
          {stryMutAct_9fa48("912") ? submittedAt || <p className="builder-feedback__submitted-date">
              Submitted on {new Date(submittedAt).toLocaleDateString()} at {new Date(submittedAt).toLocaleTimeString()}
            </p> : stryMutAct_9fa48("911") ? false : stryMutAct_9fa48("910") ? true : (stryCov_9fa48("910", "911", "912"), submittedAt && <p className="builder-feedback__submitted-date">
              Submitted on {new Date(submittedAt).toLocaleDateString()} at {new Date(submittedAt).toLocaleTimeString()}
            </p>)}
        </div>
        
        <div className="builder-feedback__form">
          <div className="builder-feedback__form-group">
            <label className="builder-feedback__label">How likely are you to refer this pilot to someone you know?</label>
            <div className="builder-feedback__rating-container">
              <span className="builder-feedback__rating-label">Not likely</span>
              <div className="builder-feedback__rating-scale">
                {(stryMutAct_9fa48("913") ? [] : (stryCov_9fa48("913"), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10])).map(stryMutAct_9fa48("914") ? () => undefined : (stryCov_9fa48("914"), num => <div key={num} className={stryMutAct_9fa48("915") ? `` : (stryCov_9fa48("915"), `builder-feedback__rating-display ${(stryMutAct_9fa48("918") ? formData.referral_likelihood !== num.toString() : stryMutAct_9fa48("917") ? false : stryMutAct_9fa48("916") ? true : (stryCov_9fa48("916", "917", "918"), formData.referral_likelihood === num.toString())) ? stryMutAct_9fa48("919") ? "" : (stryCov_9fa48("919"), 'builder-feedback__rating-display--selected') : stryMutAct_9fa48("920") ? "Stryker was here!" : (stryCov_9fa48("920"), '')}`)}>
                    {num}
                  </div>))}
              </div>
              <span className="builder-feedback__rating-label">Very likely</span>
            </div>
          </div>

          <div className="builder-feedback__form-group">
            <label className="builder-feedback__label">What did we do well?</label>
            <div className="builder-feedback__readonly-text">
              {stryMutAct_9fa48("923") ? formData.what_we_did_well && <em>No response provided</em> : stryMutAct_9fa48("922") ? false : stryMutAct_9fa48("921") ? true : (stryCov_9fa48("921", "922", "923"), formData.what_we_did_well || <em>No response provided</em>)}
            </div>
          </div>

          <div className="builder-feedback__form-group">
            <label className="builder-feedback__label">What do we need to improve on?</label>
            <div className="builder-feedback__readonly-text">
              {stryMutAct_9fa48("926") ? formData.what_to_improve && <em>No response provided</em> : stryMutAct_9fa48("925") ? false : stryMutAct_9fa48("924") ? true : (stryCov_9fa48("924", "925", "926"), formData.what_to_improve || <em>No response provided</em>)}
            </div>
          </div>

          <div className="builder-feedback__form-group">
            <label className="builder-feedback__label">What tools did you use this week?</label>
            <div className="builder-feedback__readonly-text">
              {stryMutAct_9fa48("929") ? formData.tools_used && <em>No response provided</em> : stryMutAct_9fa48("928") ? false : stryMutAct_9fa48("927") ? true : (stryCov_9fa48("927", "928", "929"), formData.tools_used || <em>No response provided</em>)}
            </div>
          </div>

          <div className="builder-feedback__form-group">
            <label className="builder-feedback__label">What programming languages did you work with this week?</label>
            <div className="builder-feedback__readonly-text">
              {stryMutAct_9fa48("932") ? formData.programming_languages && <em>No response provided</em> : stryMutAct_9fa48("931") ? false : stryMutAct_9fa48("930") ? true : (stryCov_9fa48("930", "931", "932"), formData.programming_languages || <em>No response provided</em>)}
            </div>
          </div>
        </div>
      </div>;
      }
    }
    return <div className="builder-feedback">
      <div className="builder-feedback__header">
        <FaClipboardList className="builder-feedback__icon" />
        <h2 className="builder-feedback__title">Weekly Builder Feedback</h2>
        <p className="builder-feedback__subtitle">
          Help us improve your experience by sharing your thoughts from this week.
        </p>
      </div>

      <form className="builder-feedback__form" onSubmit={handleSubmit}>
        {/* Referral Likelihood */}
        <div className="builder-feedback__form-group">
          <label className="builder-feedback__label" htmlFor="referral_likelihood">
            How likely are you to refer this pilot to someone you know?
          </label>
          <div className="builder-feedback__rating-container">
            <span className="builder-feedback__rating-label">Not likely</span>
            {renderRatingScale()}
            <span className="builder-feedback__rating-label">Very likely</span>
          </div>
        </div>

        {/* What we did well */}
        <div className="builder-feedback__form-group">
          <label className="builder-feedback__label" htmlFor="what_we_did_well">
            What did we do well?
          </label>
          <textarea id="what_we_did_well" className="builder-feedback__textarea" rows="4" value={formData.what_we_did_well} onChange={stryMutAct_9fa48("933") ? () => undefined : (stryCov_9fa48("933"), e => handleInputChange(stryMutAct_9fa48("934") ? "" : (stryCov_9fa48("934"), 'what_we_did_well'), e.target.value))} placeholder="Share what you found valuable or enjoyed..." disabled={stryMutAct_9fa48("937") ? !isActive && isSubmitting : stryMutAct_9fa48("936") ? false : stryMutAct_9fa48("935") ? true : (stryCov_9fa48("935", "936", "937"), (stryMutAct_9fa48("938") ? isActive : (stryCov_9fa48("938"), !isActive)) || isSubmitting)} />
        </div>

        {/* What to improve */}
        <div className="builder-feedback__form-group">
          <label className="builder-feedback__label" htmlFor="what_to_improve">
            What do we need to improve on?
          </label>
          <textarea id="what_to_improve" className="builder-feedback__textarea" rows="4" value={formData.what_to_improve} onChange={stryMutAct_9fa48("939") ? () => undefined : (stryCov_9fa48("939"), e => handleInputChange(stryMutAct_9fa48("940") ? "" : (stryCov_9fa48("940"), 'what_to_improve'), e.target.value))} placeholder="Share areas where we could do better..." disabled={stryMutAct_9fa48("943") ? !isActive && isSubmitting : stryMutAct_9fa48("942") ? false : stryMutAct_9fa48("941") ? true : (stryCov_9fa48("941", "942", "943"), (stryMutAct_9fa48("944") ? isActive : (stryCov_9fa48("944"), !isActive)) || isSubmitting)} />
        </div>

        {/* Tools used */}
        <div className="builder-feedback__form-group">
          <label className="builder-feedback__label" htmlFor="tools_used">
            What tools did you use this week?
          </label>
          <textarea id="tools_used" className="builder-feedback__textarea" rows="3" value={formData.tools_used} onChange={stryMutAct_9fa48("945") ? () => undefined : (stryCov_9fa48("945"), e => handleInputChange(stryMutAct_9fa48("946") ? "" : (stryCov_9fa48("946"), 'tools_used'), e.target.value))} placeholder="List the tools, software, or platforms you worked with..." disabled={stryMutAct_9fa48("949") ? !isActive && isSubmitting : stryMutAct_9fa48("948") ? false : stryMutAct_9fa48("947") ? true : (stryCov_9fa48("947", "948", "949"), (stryMutAct_9fa48("950") ? isActive : (stryCov_9fa48("950"), !isActive)) || isSubmitting)} />
        </div>

        {/* Programming languages */}
        <div className="builder-feedback__form-group">
          <label className="builder-feedback__label" htmlFor="programming_languages">
            What programming languages did you work with this week?
          </label>
          <textarea id="programming_languages" className="builder-feedback__textarea" rows="3" value={formData.programming_languages} onChange={stryMutAct_9fa48("951") ? () => undefined : (stryCov_9fa48("951"), e => handleInputChange(stryMutAct_9fa48("952") ? "" : (stryCov_9fa48("952"), 'programming_languages'), e.target.value))} placeholder="List the programming languages you used..." disabled={stryMutAct_9fa48("955") ? !isActive && isSubmitting : stryMutAct_9fa48("954") ? false : stryMutAct_9fa48("953") ? true : (stryCov_9fa48("953", "954", "955"), (stryMutAct_9fa48("956") ? isActive : (stryCov_9fa48("956"), !isActive)) || isSubmitting)} />
        </div>

        {/* Error message */}
        {stryMutAct_9fa48("959") ? error || <div className="builder-feedback__error">
            <FaExclamationCircle className="builder-feedback__error-icon" />
            {error}
          </div> : stryMutAct_9fa48("958") ? false : stryMutAct_9fa48("957") ? true : (stryCov_9fa48("957", "958", "959"), error && <div className="builder-feedback__error">
            <FaExclamationCircle className="builder-feedback__error-icon" />
            {error}
          </div>)}

        {/* Form actions */}
        <div className="builder-feedback__actions">
          {stryMutAct_9fa48("962") ? onCancel || <button type="button" className="builder-feedback__button builder-feedback__button--cancel" onClick={onCancel} disabled={isSubmitting}>
              <FaTimes />
              Cancel
            </button> : stryMutAct_9fa48("961") ? false : stryMutAct_9fa48("960") ? true : (stryCov_9fa48("960", "961", "962"), onCancel && <button type="button" className="builder-feedback__button builder-feedback__button--cancel" onClick={onCancel} disabled={isSubmitting}>
              <FaTimes />
              Cancel
            </button>)}
          <button type="submit" className="builder-feedback__button builder-feedback__button--submit" disabled={stryMutAct_9fa48("965") ? !isActive && isSubmitting : stryMutAct_9fa48("964") ? false : stryMutAct_9fa48("963") ? true : (stryCov_9fa48("963", "964", "965"), (stryMutAct_9fa48("966") ? isActive : (stryCov_9fa48("966"), !isActive)) || isSubmitting)}>
            {isSubmitting ? <>
                <FaSpinner className="builder-feedback__button-icon--spinning" />
                {existingFeedback ? stryMutAct_9fa48("967") ? "" : (stryCov_9fa48("967"), 'Updating...') : stryMutAct_9fa48("968") ? "" : (stryCov_9fa48("968"), 'Submitting...')}
              </> : <>
                <FaCheck />
                {existingFeedback ? stryMutAct_9fa48("969") ? "" : (stryCov_9fa48("969"), 'Update Feedback') : stryMutAct_9fa48("970") ? "" : (stryCov_9fa48("970"), 'Submit Feedback')}
              </>}
          </button>
        </div>
      </form>
    </div>;
  }
};
export default BuilderFeedbackForm;