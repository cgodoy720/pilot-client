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
import { useNavigate } from 'react-router-dom';
import databaseService from '../../services/databaseService';
import AddressAutocomplete from '../../components/AddressAutocomplete/AddressAutocomplete';
import IneligibleModal from '../../components/IneligibleScreen/IneligibleScreen';
import Swal from 'sweetalert2';
import './ApplicationForm.css';
const ApplicationForm = () => {
  if (stryMutAct_9fa48("10432")) {
    {}
  } else {
    stryCov_9fa48("10432");
    const navigate = useNavigate();
    const saveTimeoutRef = useRef(null);

    // Handle logout
    const handleLogout = () => {
      if (stryMutAct_9fa48("10433")) {
        {}
      } else {
        stryCov_9fa48("10433");
        localStorage.removeItem(stryMutAct_9fa48("10434") ? "" : (stryCov_9fa48("10434"), 'user'));
        navigate(stryMutAct_9fa48("10435") ? "" : (stryCov_9fa48("10435"), '/login'));
      }
    };

    // Core state
    const [applicationQuestions, setApplicationQuestions] = useState(stryMutAct_9fa48("10436") ? ["Stryker was here"] : (stryCov_9fa48("10436"), []));
    const [formData, setFormData] = useState({});
    const [currentSection, setCurrentSection] = useState(stryMutAct_9fa48("10437") ? +1 : (stryCov_9fa48("10437"), -1)); // Start at -1 for intro tab
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(stryMutAct_9fa48("10438") ? false : (stryCov_9fa48("10438"), true));
    const [error, setError] = useState(null);
    const [currentSession, setCurrentSession] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(stryMutAct_9fa48("10439") ? true : (stryCov_9fa48("10439"), false));
    const [progress, setProgress] = useState(0);
    const [isOneQuestionMode, setIsOneQuestionMode] = useState(stryMutAct_9fa48("10440") ? true : (stryCov_9fa48("10440"), false));
    const [validationErrors, setValidationErrors] = useState({});
    const [showValidation, setShowValidation] = useState(stryMutAct_9fa48("10441") ? true : (stryCov_9fa48("10441"), false));
    const [isIneligible, setIsIneligible] = useState(stryMutAct_9fa48("10442") ? true : (stryCov_9fa48("10442"), false));
    const [eligibilityFailures, setEligibilityFailures] = useState(stryMutAct_9fa48("10443") ? ["Stryker was here"] : (stryCov_9fa48("10443"), []));

    // Initialize application
    useEffect(() => {
      if (stryMutAct_9fa48("10444")) {
        {}
      } else {
        stryCov_9fa48("10444");
        const initializeApplication = async () => {
          if (stryMutAct_9fa48("10445")) {
            {}
          } else {
            stryCov_9fa48("10445");
            try {
              if (stryMutAct_9fa48("10446")) {
                {}
              } else {
                stryCov_9fa48("10446");
                setIsLoading(stryMutAct_9fa48("10447") ? false : (stryCov_9fa48("10447"), true));

                // Fetch questions from database
                const questions = await databaseService.fetchApplicationQuestions();
                setApplicationQuestions(questions);

                // Get user info - try localStorage first, then fallback
                const savedUser = localStorage.getItem(stryMutAct_9fa48("10448") ? "" : (stryCov_9fa48("10448"), 'user'));
                let email = stryMutAct_9fa48("10449") ? "" : (stryCov_9fa48("10449"), 'jac@pursuit.org');
                let firstName = stryMutAct_9fa48("10450") ? "" : (stryCov_9fa48("10450"), 'John');
                let lastName = stryMutAct_9fa48("10451") ? "" : (stryCov_9fa48("10451"), 'Doe');
                if (stryMutAct_9fa48("10453") ? false : stryMutAct_9fa48("10452") ? true : (stryCov_9fa48("10452", "10453"), savedUser)) {
                  if (stryMutAct_9fa48("10454")) {
                    {}
                  } else {
                    stryCov_9fa48("10454");
                    try {
                      if (stryMutAct_9fa48("10455")) {
                        {}
                      } else {
                        stryCov_9fa48("10455");
                        const userData = JSON.parse(savedUser);
                        email = stryMutAct_9fa48("10458") ? userData.email && email : stryMutAct_9fa48("10457") ? false : stryMutAct_9fa48("10456") ? true : (stryCov_9fa48("10456", "10457", "10458"), userData.email || email);
                        firstName = stryMutAct_9fa48("10461") ? (userData.firstName || userData.first_name) && firstName : stryMutAct_9fa48("10460") ? false : stryMutAct_9fa48("10459") ? true : (stryCov_9fa48("10459", "10460", "10461"), (stryMutAct_9fa48("10463") ? userData.firstName && userData.first_name : stryMutAct_9fa48("10462") ? false : (stryCov_9fa48("10462", "10463"), userData.firstName || userData.first_name)) || firstName);
                        lastName = stryMutAct_9fa48("10466") ? (userData.lastName || userData.last_name) && lastName : stryMutAct_9fa48("10465") ? false : stryMutAct_9fa48("10464") ? true : (stryCov_9fa48("10464", "10465", "10466"), (stryMutAct_9fa48("10468") ? userData.lastName && userData.last_name : stryMutAct_9fa48("10467") ? false : (stryCov_9fa48("10467", "10468"), userData.lastName || userData.last_name)) || lastName);
                      }
                    } catch (e) {
                      if (stryMutAct_9fa48("10469")) {
                        {}
                      } else {
                        stryCov_9fa48("10469");
                        console.warn(stryMutAct_9fa48("10470") ? "" : (stryCov_9fa48("10470"), 'Could not parse saved user data'));
                      }
                    }
                  }
                }

                // Get or create applicant first
                const applicant = await databaseService.createOrGetApplicant(email, firstName, lastName);
                console.log(stryMutAct_9fa48("10471") ? "" : (stryCov_9fa48("10471"), 'Applicant:'), applicant);

                // Check for existing applications for this applicant
                let existingApplication = null;
                try {
                  if (stryMutAct_9fa48("10472")) {
                    {}
                  } else {
                    stryCov_9fa48("10472");
                    // Try to get existing in-progress application
                    const response = await fetch(stryMutAct_9fa48("10473") ? `` : (stryCov_9fa48("10473"), `${import.meta.env.VITE_API_URL}/api/applications/applicant/${applicant.applicant_id}/application`), stryMutAct_9fa48("10474") ? {} : (stryCov_9fa48("10474"), {
                      headers: stryMutAct_9fa48("10475") ? {} : (stryCov_9fa48("10475"), {
                        'Content-Type': stryMutAct_9fa48("10476") ? "" : (stryCov_9fa48("10476"), 'application/json')
                      })
                    }));
                    if (stryMutAct_9fa48("10478") ? false : stryMutAct_9fa48("10477") ? true : (stryCov_9fa48("10477", "10478"), response.ok)) {
                      if (stryMutAct_9fa48("10479")) {
                        {}
                      } else {
                        stryCov_9fa48("10479");
                        existingApplication = await response.json();
                        console.log(stryMutAct_9fa48("10480") ? "" : (stryCov_9fa48("10480"), 'Found existing application:'), existingApplication);
                      }
                    }
                  }
                } catch (error) {
                  if (stryMutAct_9fa48("10481")) {
                    {}
                  } else {
                    stryCov_9fa48("10481");
                    console.log(stryMutAct_9fa48("10482") ? "" : (stryCov_9fa48("10482"), 'No existing application found, will create new one'));
                  }
                }

                // Create application only if none exists
                let application = existingApplication;
                if (stryMutAct_9fa48("10485") ? false : stryMutAct_9fa48("10484") ? true : stryMutAct_9fa48("10483") ? application : (stryCov_9fa48("10483", "10484", "10485"), !application)) {
                  if (stryMutAct_9fa48("10486")) {
                    {}
                  } else {
                    stryCov_9fa48("10486");
                    console.log(stryMutAct_9fa48("10487") ? "" : (stryCov_9fa48("10487"), 'Creating new application...'));
                    // Set the current applicant on the service before creating application
                    databaseService.currentApplicant = applicant;
                    application = await databaseService.createApplication();
                    console.log(stryMutAct_9fa48("10488") ? "" : (stryCov_9fa48("10488"), 'Created new application:'), application);
                  }
                }

                // Check if application is ineligible and handle accordingly
                if (stryMutAct_9fa48("10491") ? application || application.status === 'ineligible' : stryMutAct_9fa48("10490") ? false : stryMutAct_9fa48("10489") ? true : (stryCov_9fa48("10489", "10490", "10491"), application && (stryMutAct_9fa48("10493") ? application.status !== 'ineligible' : stryMutAct_9fa48("10492") ? true : (stryCov_9fa48("10492", "10493"), application.status === (stryMutAct_9fa48("10494") ? "" : (stryCov_9fa48("10494"), 'ineligible')))))) {
                  if (stryMutAct_9fa48("10495")) {
                    {}
                  } else {
                    stryCov_9fa48("10495");
                    const wasResetForEditing = localStorage.getItem(stryMutAct_9fa48("10496") ? "" : (stryCov_9fa48("10496"), 'eligibilityResetForEditing'));
                    const urlParams = new URLSearchParams(window.location.search);
                    const resetFromUrl = stryMutAct_9fa48("10499") ? urlParams.get('resetEligibility') !== 'true' : stryMutAct_9fa48("10498") ? false : stryMutAct_9fa48("10497") ? true : (stryCov_9fa48("10497", "10498", "10499"), urlParams.get(stryMutAct_9fa48("10500") ? "" : (stryCov_9fa48("10500"), 'resetEligibility')) === (stryMutAct_9fa48("10501") ? "" : (stryCov_9fa48("10501"), 'true')));
                    console.log(stryMutAct_9fa48("10502") ? "" : (stryCov_9fa48("10502"), '🔍 RESET DEBUG: Found ineligible application'), stryMutAct_9fa48("10503") ? {} : (stryCov_9fa48("10503"), {
                      applicationId: application.application_id,
                      status: application.status,
                      wasResetForEditing,
                      resetFromUrl,
                      applicantId: applicant.applicant_id,
                      allLocalStorageKeys: Object.keys(localStorage),
                      currentUrl: window.location.href
                    }));
                    if (stryMutAct_9fa48("10506") ? wasResetForEditing === 'true' && resetFromUrl : stryMutAct_9fa48("10505") ? false : stryMutAct_9fa48("10504") ? true : (stryCov_9fa48("10504", "10505", "10506"), (stryMutAct_9fa48("10508") ? wasResetForEditing !== 'true' : stryMutAct_9fa48("10507") ? false : (stryCov_9fa48("10507", "10508"), wasResetForEditing === (stryMutAct_9fa48("10509") ? "" : (stryCov_9fa48("10509"), 'true')))) || resetFromUrl)) {
                      if (stryMutAct_9fa48("10510")) {
                        {}
                      } else {
                        stryCov_9fa48("10510");
                        console.log(stryMutAct_9fa48("10511") ? "" : (stryCov_9fa48("10511"), '🔄 RESET DEBUG: Starting reset process...'));
                        localStorage.removeItem(stryMutAct_9fa48("10512") ? "" : (stryCov_9fa48("10512"), 'eligibilityResetForEditing'));

                        // Clean up URL parameter
                        if (stryMutAct_9fa48("10514") ? false : stryMutAct_9fa48("10513") ? true : (stryCov_9fa48("10513", "10514"), resetFromUrl)) {
                          if (stryMutAct_9fa48("10515")) {
                            {}
                          } else {
                            stryCov_9fa48("10515");
                            const url = new URL(window.location);
                            url.searchParams.delete(stryMutAct_9fa48("10516") ? "" : (stryCov_9fa48("10516"), 'resetEligibility'));
                            window.history.replaceState({}, stryMutAct_9fa48("10517") ? "Stryker was here!" : (stryCov_9fa48("10517"), ''), url);
                          }
                        }
                        try {
                          if (stryMutAct_9fa48("10518")) {
                            {}
                          } else {
                            stryCov_9fa48("10518");
                            // Reset the application status synchronously before proceeding
                            console.log(stryMutAct_9fa48("10519") ? "" : (stryCov_9fa48("10519"), '🔄 RESET DEBUG: Calling resetEligibility...'));
                            const resetResult = await databaseService.resetEligibility(applicant.applicant_id);
                            console.log(stryMutAct_9fa48("10520") ? "" : (stryCov_9fa48("10520"), '🔄 RESET DEBUG: Reset result:'), resetResult);
                            if (stryMutAct_9fa48("10523") ? resetResult || resetResult.success : stryMutAct_9fa48("10522") ? false : stryMutAct_9fa48("10521") ? true : (stryCov_9fa48("10521", "10522", "10523"), resetResult && resetResult.success)) {
                              if (stryMutAct_9fa48("10524")) {
                                {}
                              } else {
                                stryCov_9fa48("10524");
                                // Re-fetch the application to ensure we have the updated status
                                console.log(stryMutAct_9fa48("10525") ? "" : (stryCov_9fa48("10525"), '🔄 RESET DEBUG: Re-fetching application after reset...'));
                                try {
                                  if (stryMutAct_9fa48("10526")) {
                                    {}
                                  } else {
                                    stryCov_9fa48("10526");
                                    const updatedApplication = await fetch(stryMutAct_9fa48("10527") ? `` : (stryCov_9fa48("10527"), `${import.meta.env.VITE_API_URL}/api/applications/applicant/${applicant.applicant_id}/application`), stryMutAct_9fa48("10528") ? {} : (stryCov_9fa48("10528"), {
                                      headers: stryMutAct_9fa48("10529") ? {} : (stryCov_9fa48("10529"), {
                                        'Content-Type': stryMutAct_9fa48("10530") ? "" : (stryCov_9fa48("10530"), 'application/json')
                                      })
                                    }));
                                    if (stryMutAct_9fa48("10532") ? false : stryMutAct_9fa48("10531") ? true : (stryCov_9fa48("10531", "10532"), updatedApplication.ok)) {
                                      if (stryMutAct_9fa48("10533")) {
                                        {}
                                      } else {
                                        stryCov_9fa48("10533");
                                        application = await updatedApplication.json();
                                        console.log(stryMutAct_9fa48("10534") ? "" : (stryCov_9fa48("10534"), '✅ RESET DEBUG: Re-fetched application:'), application);
                                      }
                                    } else {
                                      if (stryMutAct_9fa48("10535")) {
                                        {}
                                      } else {
                                        stryCov_9fa48("10535");
                                        // Fallback: just update the local object
                                        application.status = stryMutAct_9fa48("10536") ? "" : (stryCov_9fa48("10536"), 'in_progress');
                                        console.log(stryMutAct_9fa48("10537") ? "" : (stryCov_9fa48("10537"), '⚠️ RESET DEBUG: Could not re-fetch, updating local object'));
                                      }
                                    }
                                  }
                                } catch (fetchError) {
                                  if (stryMutAct_9fa48("10538")) {
                                    {}
                                  } else {
                                    stryCov_9fa48("10538");
                                    console.warn(stryMutAct_9fa48("10539") ? "" : (stryCov_9fa48("10539"), '⚠️ RESET DEBUG: Error re-fetching application:'), fetchError);
                                    // Fallback: just update the local object
                                    application.status = stryMutAct_9fa48("10540") ? "" : (stryCov_9fa48("10540"), 'in_progress');
                                  }
                                }
                                console.log(stryMutAct_9fa48("10541") ? "" : (stryCov_9fa48("10541"), '✅ RESET DEBUG: Application status after reset:'), application.status);

                                // Also update localStorage to reflect the change
                                localStorage.setItem(stryMutAct_9fa48("10542") ? "" : (stryCov_9fa48("10542"), 'applicationStatus'), stryMutAct_9fa48("10543") ? "" : (stryCov_9fa48("10543"), 'in_progress'));
                              }
                            } else {
                              if (stryMutAct_9fa48("10544")) {
                                {}
                              } else {
                                stryCov_9fa48("10544");
                                console.error(stryMutAct_9fa48("10545") ? "" : (stryCov_9fa48("10545"), '❌ RESET DEBUG: Reset result indicates failure:'), resetResult);
                                throw new Error(stryMutAct_9fa48("10546") ? "" : (stryCov_9fa48("10546"), 'Reset eligibility failed - invalid response'));
                              }
                            }
                          }
                        } catch (error) {
                          if (stryMutAct_9fa48("10547")) {
                            {}
                          } else {
                            stryCov_9fa48("10547");
                            console.error(stryMutAct_9fa48("10548") ? "" : (stryCov_9fa48("10548"), '❌ RESET DEBUG: Error during reset:'), error);
                            alert(stryMutAct_9fa48("10549") ? "" : (stryCov_9fa48("10549"), 'Failed to reset your application. Please try again.'));
                            navigate(stryMutAct_9fa48("10550") ? "" : (stryCov_9fa48("10550"), '/apply'));
                            return;
                          }
                        }
                      }
                    } else {
                      if (stryMutAct_9fa48("10551")) {
                        {}
                      } else {
                        stryCov_9fa48("10551");
                        // Normal ineligible flow
                        console.log(stryMutAct_9fa48("10552") ? "" : (stryCov_9fa48("10552"), 'Application is marked as ineligible, redirecting to dashboard'));
                        localStorage.setItem(stryMutAct_9fa48("10553") ? "" : (stryCov_9fa48("10553"), 'applicationStatus'), stryMutAct_9fa48("10554") ? "" : (stryCov_9fa48("10554"), 'ineligible'));
                        navigate(stryMutAct_9fa48("10555") ? "" : (stryCov_9fa48("10555"), '/apply'));
                        return;
                      }
                    }
                  }
                }
                console.log(stryMutAct_9fa48("10556") ? "" : (stryCov_9fa48("10556"), '🔍 RESET DEBUG: After reset check, application status:'), stryMutAct_9fa48("10557") ? application.status : (stryCov_9fa48("10557"), application?.status));

                // Note: eligibilityResetForEditing is now handled above in the ineligible check

                const session = stryMutAct_9fa48("10558") ? {} : (stryCov_9fa48("10558"), {
                  applicant,
                  application
                });
                setCurrentSession(session);

                // Also set the application on the service for auto-save
                databaseService.currentApplication = application;

                // Check for existing progress
                if (stryMutAct_9fa48("10561") ? application.application_id : stryMutAct_9fa48("10560") ? false : stryMutAct_9fa48("10559") ? true : (stryCov_9fa48("10559", "10560", "10561"), application?.application_id)) {
                  if (stryMutAct_9fa48("10562")) {
                    {}
                  } else {
                    stryCov_9fa48("10562");
                    console.log(stryMutAct_9fa48("10563") ? "" : (stryCov_9fa48("10563"), 'Loading form data for application:'), application.application_id);
                    const savedFormData = await databaseService.loadFormData(application.application_id);
                    console.log(stryMutAct_9fa48("10564") ? "" : (stryCov_9fa48("10564"), 'Loaded form data:'), savedFormData);
                    if (stryMutAct_9fa48("10568") ? Object.keys(savedFormData).length <= 0 : stryMutAct_9fa48("10567") ? Object.keys(savedFormData).length >= 0 : stryMutAct_9fa48("10566") ? false : stryMutAct_9fa48("10565") ? true : (stryCov_9fa48("10565", "10566", "10567", "10568"), Object.keys(savedFormData).length > 0)) {
                      if (stryMutAct_9fa48("10569")) {
                        {}
                      } else {
                        stryCov_9fa48("10569");
                        // Automatically load saved data
                        setFormData(savedFormData);

                        // Restore current section (including intro section -1)
                        const savedSection = localStorage.getItem(stryMutAct_9fa48("10570") ? "" : (stryCov_9fa48("10570"), 'applicationCurrentSection'));
                        if (stryMutAct_9fa48("10572") ? false : stryMutAct_9fa48("10571") ? true : (stryCov_9fa48("10571", "10572"), savedSection)) {
                          if (stryMutAct_9fa48("10573")) {
                            {}
                          } else {
                            stryCov_9fa48("10573");
                            const sectionIndex = parseInt(savedSection, 10);
                            setCurrentSection(sectionIndex);
                          }
                        }

                        // Restore question index for one-question mode
                        const savedQuestionIndex = localStorage.getItem(stryMutAct_9fa48("10574") ? "" : (stryCov_9fa48("10574"), 'applicationCurrentQuestionIndex'));
                        if (stryMutAct_9fa48("10576") ? false : stryMutAct_9fa48("10575") ? true : (stryCov_9fa48("10575", "10576"), savedQuestionIndex)) {
                          if (stryMutAct_9fa48("10577")) {
                            {}
                          } else {
                            stryCov_9fa48("10577");
                            setCurrentQuestionIndex(parseInt(savedQuestionIndex, 10));
                          }
                        }
                        console.log(stryMutAct_9fa48("10578") ? "" : (stryCov_9fa48("10578"), 'Automatically restored saved progress'));
                      }
                    }
                  }
                }
                console.log(stryMutAct_9fa48("10579") ? "" : (stryCov_9fa48("10579"), 'Application initialized successfully'));
              }
            } catch (error) {
              if (stryMutAct_9fa48("10580")) {
                {}
              } else {
                stryCov_9fa48("10580");
                console.error(stryMutAct_9fa48("10581") ? "" : (stryCov_9fa48("10581"), 'Error initializing application:'), error);
                setError(stryMutAct_9fa48("10582") ? "" : (stryCov_9fa48("10582"), 'Failed to load application. Please refresh the page.'));
              }
            } finally {
              if (stryMutAct_9fa48("10583")) {
                {}
              } else {
                stryCov_9fa48("10583");
                setIsLoading(stryMutAct_9fa48("10584") ? true : (stryCov_9fa48("10584"), false));
              }
            }
          }
        };
        initializeApplication();
      }
    }, stryMutAct_9fa48("10585") ? ["Stryker was here"] : (stryCov_9fa48("10585"), []));

    // Load questions from backend
    useEffect(() => {
      if (stryMutAct_9fa48("10586")) {
        {}
      } else {
        stryCov_9fa48("10586");
        const loadQuestions = async () => {
          if (stryMutAct_9fa48("10587")) {
            {}
          } else {
            stryCov_9fa48("10587");
            try {
              if (stryMutAct_9fa48("10588")) {
                {}
              } else {
                stryCov_9fa48("10588");
                const questionsData = await databaseService.fetchApplicationQuestions();
                setApplicationQuestions(questionsData);
              }
            } catch (error) {
              if (stryMutAct_9fa48("10589")) {
                {}
              } else {
                stryCov_9fa48("10589");
                console.error(stryMutAct_9fa48("10590") ? "" : (stryCov_9fa48("10590"), 'Error loading questions:'), error);
              }
            }
          }
        };
        loadQuestions();
      }
    }, stryMutAct_9fa48("10591") ? ["Stryker was here"] : (stryCov_9fa48("10591"), []));

    // Calculate progress
    useEffect(() => {
      if (stryMutAct_9fa48("10592")) {
        {}
      } else {
        stryCov_9fa48("10592");
        if (stryMutAct_9fa48("10596") ? applicationQuestions.length <= 0 : stryMutAct_9fa48("10595") ? applicationQuestions.length >= 0 : stryMutAct_9fa48("10594") ? false : stryMutAct_9fa48("10593") ? true : (stryCov_9fa48("10593", "10594", "10595", "10596"), applicationQuestions.length > 0)) {
          if (stryMutAct_9fa48("10597")) {
            {}
          } else {
            stryCov_9fa48("10597");
            const allQuestions = getAllRootQuestions();
            const totalQuestions = allQuestions.length;
            const answeredQuestions = stryMutAct_9fa48("10598") ? Object.keys(formData).length : (stryCov_9fa48("10598"), Object.keys(formData).filter(key => {
              if (stryMutAct_9fa48("10599")) {
                {}
              } else {
                stryCov_9fa48("10599");
                const value = formData[key];
                return stryMutAct_9fa48("10602") ? value !== null && value !== undefined && value !== '' || !(Array.isArray(value) && value.length === 0) : stryMutAct_9fa48("10601") ? false : stryMutAct_9fa48("10600") ? true : (stryCov_9fa48("10600", "10601", "10602"), (stryMutAct_9fa48("10604") ? value !== null && value !== undefined || value !== '' : stryMutAct_9fa48("10603") ? true : (stryCov_9fa48("10603", "10604"), (stryMutAct_9fa48("10606") ? value !== null || value !== undefined : stryMutAct_9fa48("10605") ? true : (stryCov_9fa48("10605", "10606"), (stryMutAct_9fa48("10608") ? value === null : stryMutAct_9fa48("10607") ? true : (stryCov_9fa48("10607", "10608"), value !== null)) && (stryMutAct_9fa48("10610") ? value === undefined : stryMutAct_9fa48("10609") ? true : (stryCov_9fa48("10609", "10610"), value !== undefined)))) && (stryMutAct_9fa48("10612") ? value === '' : stryMutAct_9fa48("10611") ? true : (stryCov_9fa48("10611", "10612"), value !== (stryMutAct_9fa48("10613") ? "Stryker was here!" : (stryCov_9fa48("10613"), '')))))) && (stryMutAct_9fa48("10614") ? Array.isArray(value) && value.length === 0 : (stryCov_9fa48("10614"), !(stryMutAct_9fa48("10617") ? Array.isArray(value) || value.length === 0 : stryMutAct_9fa48("10616") ? false : stryMutAct_9fa48("10615") ? true : (stryCov_9fa48("10615", "10616", "10617"), Array.isArray(value) && (stryMutAct_9fa48("10619") ? value.length !== 0 : stryMutAct_9fa48("10618") ? true : (stryCov_9fa48("10618", "10619"), value.length === 0)))))));
              }
            }).length);
            const progressPercentage = Math.round(stryMutAct_9fa48("10620") ? answeredQuestions / totalQuestions / 100 : (stryCov_9fa48("10620"), (stryMutAct_9fa48("10621") ? answeredQuestions * totalQuestions : (stryCov_9fa48("10621"), answeredQuestions / totalQuestions)) * 100));
            setProgress(progressPercentage);
          }
        }
      }
    }, stryMutAct_9fa48("10622") ? [] : (stryCov_9fa48("10622"), [formData, applicationQuestions]));

    // Auto-save with debounce
    useEffect(() => {
      if (stryMutAct_9fa48("10623")) {
        {}
      } else {
        stryCov_9fa48("10623");
        if (stryMutAct_9fa48("10626") ? Object.keys(formData).length === 0 && !currentSession?.application?.application_id : stryMutAct_9fa48("10625") ? false : stryMutAct_9fa48("10624") ? true : (stryCov_9fa48("10624", "10625", "10626"), (stryMutAct_9fa48("10628") ? Object.keys(formData).length !== 0 : stryMutAct_9fa48("10627") ? false : (stryCov_9fa48("10627", "10628"), Object.keys(formData).length === 0)) || (stryMutAct_9fa48("10629") ? currentSession?.application?.application_id : (stryCov_9fa48("10629"), !(stryMutAct_9fa48("10631") ? currentSession.application?.application_id : stryMutAct_9fa48("10630") ? currentSession?.application.application_id : (stryCov_9fa48("10630", "10631"), currentSession?.application?.application_id)))))) return;

        // Clear existing timeout
        if (stryMutAct_9fa48("10633") ? false : stryMutAct_9fa48("10632") ? true : (stryCov_9fa48("10632", "10633"), saveTimeoutRef.current)) {
          if (stryMutAct_9fa48("10634")) {
            {}
          } else {
            stryCov_9fa48("10634");
            clearTimeout(saveTimeoutRef.current);
          }
        }

        // Set new timeout for auto-save
        saveTimeoutRef.current = setTimeout(async () => {
          if (stryMutAct_9fa48("10635")) {
            {}
          } else {
            stryCov_9fa48("10635");
            try {
              if (stryMutAct_9fa48("10636")) {
                {}
              } else {
                stryCov_9fa48("10636");
                console.log(stryMutAct_9fa48("10637") ? "" : (stryCov_9fa48("10637"), 'Auto-saving form data...'), stryMutAct_9fa48("10638") ? {} : (stryCov_9fa48("10638"), {
                  formDataKeys: Object.keys(formData),
                  applicationId: stryMutAct_9fa48("10640") ? currentSession.application?.application_id : stryMutAct_9fa48("10639") ? currentSession?.application.application_id : (stryCov_9fa48("10639", "10640"), currentSession?.application?.application_id),
                  sessionExists: stryMutAct_9fa48("10641") ? !currentSession : (stryCov_9fa48("10641"), !(stryMutAct_9fa48("10642") ? currentSession : (stryCov_9fa48("10642"), !currentSession)))
                }));

                // Save to localStorage immediately
                localStorage.setItem(stryMutAct_9fa48("10643") ? "" : (stryCov_9fa48("10643"), 'applicationFormData'), JSON.stringify(formData));
                console.log(stryMutAct_9fa48("10644") ? "" : (stryCov_9fa48("10644"), 'Saved to localStorage'));

                // Save to database
                if (stryMutAct_9fa48("10648") ? currentSession.application?.application_id : stryMutAct_9fa48("10647") ? currentSession?.application.application_id : stryMutAct_9fa48("10646") ? false : stryMutAct_9fa48("10645") ? true : (stryCov_9fa48("10645", "10646", "10647", "10648"), currentSession?.application?.application_id)) {
                  if (stryMutAct_9fa48("10649")) {
                    {}
                  } else {
                    stryCov_9fa48("10649");
                    let savedCount = 0;
                    for (const [questionId, value] of Object.entries(formData)) {
                      if (stryMutAct_9fa48("10650")) {
                        {}
                      } else {
                        stryCov_9fa48("10650");
                        if (stryMutAct_9fa48("10653") ? value !== null && value !== undefined || value !== '' : stryMutAct_9fa48("10652") ? false : stryMutAct_9fa48("10651") ? true : (stryCov_9fa48("10651", "10652", "10653"), (stryMutAct_9fa48("10655") ? value !== null || value !== undefined : stryMutAct_9fa48("10654") ? true : (stryCov_9fa48("10654", "10655"), (stryMutAct_9fa48("10657") ? value === null : stryMutAct_9fa48("10656") ? true : (stryCov_9fa48("10656", "10657"), value !== null)) && (stryMutAct_9fa48("10659") ? value === undefined : stryMutAct_9fa48("10658") ? true : (stryCov_9fa48("10658", "10659"), value !== undefined)))) && (stryMutAct_9fa48("10661") ? value === '' : stryMutAct_9fa48("10660") ? true : (stryCov_9fa48("10660", "10661"), value !== (stryMutAct_9fa48("10662") ? "Stryker was here!" : (stryCov_9fa48("10662"), '')))))) {
                          if (stryMutAct_9fa48("10663")) {
                            {}
                          } else {
                            stryCov_9fa48("10663");
                            const responseValue = (stryMutAct_9fa48("10666") ? typeof value !== 'object' : stryMutAct_9fa48("10665") ? false : stryMutAct_9fa48("10664") ? true : (stryCov_9fa48("10664", "10665", "10666"), typeof value === (stryMutAct_9fa48("10667") ? "" : (stryCov_9fa48("10667"), 'object')))) ? JSON.stringify(value) : String(value);
                            console.log(stryMutAct_9fa48("10668") ? `` : (stryCov_9fa48("10668"), `Saving response: Q${questionId} = ${responseValue}`));
                            await databaseService.saveResponse(currentSession.application.application_id, questionId, responseValue);
                            stryMutAct_9fa48("10669") ? savedCount-- : (stryCov_9fa48("10669"), savedCount++);
                          }
                        }
                      }
                    }
                    console.log(stryMutAct_9fa48("10670") ? `` : (stryCov_9fa48("10670"), `Auto-save completed: ${savedCount} responses saved to database`));
                  }
                } else {
                  if (stryMutAct_9fa48("10671")) {
                    {}
                  } else {
                    stryCov_9fa48("10671");
                    console.warn(stryMutAct_9fa48("10672") ? "" : (stryCov_9fa48("10672"), 'No application ID available for database save'));
                  }
                }
              }
            } catch (error) {
              if (stryMutAct_9fa48("10673")) {
                {}
              } else {
                stryCov_9fa48("10673");
                console.error(stryMutAct_9fa48("10674") ? "" : (stryCov_9fa48("10674"), 'Error auto-saving:'), error);
              }
            }
          }
        }, 1000); // 1 second debounce

        return () => {
          if (stryMutAct_9fa48("10675")) {
            {}
          } else {
            stryCov_9fa48("10675");
            if (stryMutAct_9fa48("10677") ? false : stryMutAct_9fa48("10676") ? true : (stryCov_9fa48("10676", "10677"), saveTimeoutRef.current)) {
              if (stryMutAct_9fa48("10678")) {
                {}
              } else {
                stryCov_9fa48("10678");
                clearTimeout(saveTimeoutRef.current);
              }
            }
          }
        };
      }
    }, stryMutAct_9fa48("10679") ? [] : (stryCov_9fa48("10679"), [formData, currentSession]));

    // Initialize navigation when questions load
    useEffect(() => {
      if (stryMutAct_9fa48("10680")) {
        {}
      } else {
        stryCov_9fa48("10680");
        if (stryMutAct_9fa48("10684") ? applicationQuestions.length <= 0 : stryMutAct_9fa48("10683") ? applicationQuestions.length >= 0 : stryMutAct_9fa48("10682") ? false : stryMutAct_9fa48("10681") ? true : (stryCov_9fa48("10681", "10682", "10683", "10684"), applicationQuestions.length > 0)) {
          if (stryMutAct_9fa48("10685")) {
            {}
          } else {
            stryCov_9fa48("10685");
            // Check if we need to navigate to eligibility section for editing
            const wasResetForEditing = localStorage.getItem(stryMutAct_9fa48("10686") ? "" : (stryCov_9fa48("10686"), 'eligibilityResetForEditing'));
            if (stryMutAct_9fa48("10689") ? wasResetForEditing !== 'true' : stryMutAct_9fa48("10688") ? false : stryMutAct_9fa48("10687") ? true : (stryCov_9fa48("10687", "10688", "10689"), wasResetForEditing === (stryMutAct_9fa48("10690") ? "" : (stryCov_9fa48("10690"), 'true')))) {
              if (stryMutAct_9fa48("10691")) {
                {}
              } else {
                stryCov_9fa48("10691");
                console.log(stryMutAct_9fa48("10692") ? "" : (stryCov_9fa48("10692"), 'Navigating to eligibility section for editing'));
                localStorage.removeItem(stryMutAct_9fa48("10693") ? "" : (stryCov_9fa48("10693"), 'eligibilityResetForEditing'));
                // Find the eligibility section and navigate to it
                const eligibilitySection = applicationQuestions.findIndex(stryMutAct_9fa48("10694") ? () => undefined : (stryCov_9fa48("10694"), section => stryMutAct_9fa48("10697") ? section.id !== 'your_eligibility' : stryMutAct_9fa48("10696") ? false : stryMutAct_9fa48("10695") ? true : (stryCov_9fa48("10695", "10696", "10697"), section.id === (stryMutAct_9fa48("10698") ? "" : (stryCov_9fa48("10698"), 'your_eligibility')))));
                if (stryMutAct_9fa48("10701") ? eligibilitySection === -1 : stryMutAct_9fa48("10700") ? false : stryMutAct_9fa48("10699") ? true : (stryCov_9fa48("10699", "10700", "10701"), eligibilitySection !== (stryMutAct_9fa48("10702") ? +1 : (stryCov_9fa48("10702"), -1)))) {
                  if (stryMutAct_9fa48("10703")) {
                    {}
                  } else {
                    stryCov_9fa48("10703");
                    setCurrentSection(eligibilitySection);
                    setCurrentQuestionIndex(0);
                    localStorage.setItem(stryMutAct_9fa48("10704") ? "" : (stryCov_9fa48("10704"), 'applicationCurrentSection'), eligibilitySection.toString());
                    localStorage.setItem(stryMutAct_9fa48("10705") ? "" : (stryCov_9fa48("10705"), 'applicationCurrentQuestionIndex'), stryMutAct_9fa48("10706") ? "" : (stryCov_9fa48("10706"), '0'));
                  }
                }
              }
            } else {
              if (stryMutAct_9fa48("10707")) {
                {}
              } else {
                stryCov_9fa48("10707");
                // Only initialize if we don't have a saved position or if the saved position is invalid
                const savedSection = localStorage.getItem(stryMutAct_9fa48("10708") ? "" : (stryCov_9fa48("10708"), 'applicationCurrentSection'));
                const savedQuestionIndex = localStorage.getItem(stryMutAct_9fa48("10709") ? "" : (stryCov_9fa48("10709"), 'applicationCurrentQuestionIndex'));
                if (stryMutAct_9fa48("10712") ? !savedSection && !savedQuestionIndex : stryMutAct_9fa48("10711") ? false : stryMutAct_9fa48("10710") ? true : (stryCov_9fa48("10710", "10711", "10712"), (stryMutAct_9fa48("10713") ? savedSection : (stryCov_9fa48("10713"), !savedSection)) || (stryMutAct_9fa48("10714") ? savedQuestionIndex : (stryCov_9fa48("10714"), !savedQuestionIndex)))) {
                  if (stryMutAct_9fa48("10715")) {
                    {}
                  } else {
                    stryCov_9fa48("10715");
                    initializeNavigation();
                  }
                } else {
                  if (stryMutAct_9fa48("10716")) {
                    {}
                  } else {
                    stryCov_9fa48("10716");
                    const sectionIndex = parseInt(savedSection, 10);
                    // Handle intro section (-1) or validate normal sections
                    if (stryMutAct_9fa48("10719") ? sectionIndex !== -1 : stryMutAct_9fa48("10718") ? false : stryMutAct_9fa48("10717") ? true : (stryCov_9fa48("10717", "10718", "10719"), sectionIndex === (stryMutAct_9fa48("10720") ? +1 : (stryCov_9fa48("10720"), -1)))) {
                      if (stryMutAct_9fa48("10721")) {
                        {}
                      } else {
                        stryCov_9fa48("10721");
                        setCurrentSection(stryMutAct_9fa48("10722") ? +1 : (stryCov_9fa48("10722"), -1));
                        setCurrentQuestionIndex(0);
                      }
                    } else if (stryMutAct_9fa48("10725") ? sectionIndex >= 0 || sectionIndex < applicationQuestions.length : stryMutAct_9fa48("10724") ? false : stryMutAct_9fa48("10723") ? true : (stryCov_9fa48("10723", "10724", "10725"), (stryMutAct_9fa48("10728") ? sectionIndex < 0 : stryMutAct_9fa48("10727") ? sectionIndex > 0 : stryMutAct_9fa48("10726") ? true : (stryCov_9fa48("10726", "10727", "10728"), sectionIndex >= 0)) && (stryMutAct_9fa48("10731") ? sectionIndex >= applicationQuestions.length : stryMutAct_9fa48("10730") ? sectionIndex <= applicationQuestions.length : stryMutAct_9fa48("10729") ? true : (stryCov_9fa48("10729", "10730", "10731"), sectionIndex < applicationQuestions.length)))) {
                      if (stryMutAct_9fa48("10732")) {
                        {}
                      } else {
                        stryCov_9fa48("10732");
                        // Ensure the saved position points to a root question
                        ensureRootQuestionPosition();
                      }
                    } else {
                      if (stryMutAct_9fa48("10733")) {
                        {}
                      } else {
                        stryCov_9fa48("10733");
                        // Invalid saved position, initialize navigation
                        initializeNavigation();
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }, stryMutAct_9fa48("10734") ? [] : (stryCov_9fa48("10734"), [applicationQuestions]));

    // Ensure we stay on root questions when navigation changes
    useEffect(() => {
      if (stryMutAct_9fa48("10735")) {
        {}
      } else {
        stryCov_9fa48("10735");
        ensureRootQuestionPosition();
      }
    }, stryMutAct_9fa48("10736") ? [] : (stryCov_9fa48("10736"), [currentSection, currentQuestionIndex, applicationQuestions]));

    // Handle input changes with immediate saving
    const handleInputChange = async (questionId, value) => {
      if (stryMutAct_9fa48("10737")) {
        {}
      } else {
        stryCov_9fa48("10737");
        console.log(stryMutAct_9fa48("10738") ? `` : (stryCov_9fa48("10738"), `Input changed: ${questionId} = ${value}`));

        // Find if this question has any conditional children
        const currentSectionData = applicationQuestions.find(stryMutAct_9fa48("10739") ? () => undefined : (stryCov_9fa48("10739"), section => stryMutAct_9fa48("10742") ? section.questions || section.questions.find(q => q.id === questionId) : stryMutAct_9fa48("10741") ? false : stryMutAct_9fa48("10740") ? true : (stryCov_9fa48("10740", "10741", "10742"), section.questions && section.questions.find(stryMutAct_9fa48("10743") ? () => undefined : (stryCov_9fa48("10743"), q => stryMutAct_9fa48("10746") ? q.id !== questionId : stryMutAct_9fa48("10745") ? false : stryMutAct_9fa48("10744") ? true : (stryCov_9fa48("10744", "10745", "10746"), q.id === questionId))))));
        let updatedFormData = stryMutAct_9fa48("10747") ? {} : (stryCov_9fa48("10747"), {
          ...formData,
          [questionId]: value
        });

        // If this question has conditional children, clear their values when parent changes
        if (stryMutAct_9fa48("10749") ? false : stryMutAct_9fa48("10748") ? true : (stryCov_9fa48("10748", "10749"), currentSectionData)) {
          if (stryMutAct_9fa48("10750")) {
            {}
          } else {
            stryCov_9fa48("10750");
            const conditionalChildren = stryMutAct_9fa48("10751") ? currentSectionData.questions : (stryCov_9fa48("10751"), currentSectionData.questions.filter(stryMutAct_9fa48("10752") ? () => undefined : (stryCov_9fa48("10752"), q => stryMutAct_9fa48("10755") ? q.parentQuestionId !== questionId : stryMutAct_9fa48("10754") ? false : stryMutAct_9fa48("10753") ? true : (stryCov_9fa48("10753", "10754", "10755"), q.parentQuestionId === questionId))));
            conditionalChildren.forEach(child => {
              if (stryMutAct_9fa48("10756")) {
                {}
              } else {
                stryCov_9fa48("10756");
                // Clear the child question's value
                console.log(stryMutAct_9fa48("10757") ? `` : (stryCov_9fa48("10757"), `Clearing conditional question ${child.id} due to parent change`));
                updatedFormData[child.id] = stryMutAct_9fa48("10758") ? "Stryker was here!" : (stryCov_9fa48("10758"), '');
              }
            });
          }
        }
        setFormData(updatedFormData);

        // Clear validation error for this field when user starts typing
        if (stryMutAct_9fa48("10760") ? false : stryMutAct_9fa48("10759") ? true : (stryCov_9fa48("10759", "10760"), validationErrors[questionId])) {
          if (stryMutAct_9fa48("10761")) {
            {}
          } else {
            stryCov_9fa48("10761");
            setValidationErrors(prev => {
              if (stryMutAct_9fa48("10762")) {
                {}
              } else {
                stryCov_9fa48("10762");
                const newErrors = stryMutAct_9fa48("10763") ? {} : (stryCov_9fa48("10763"), {
                  ...prev
                });
                delete newErrors[questionId];
                return newErrors;
              }
            });
          }
        }

        // Note: Eligibility checking moved to moveToNextQuestion() when leaving eligibility section
        // This allows users to complete all questions before being checked
      }
    };

    // Validation functions
    const validateQuestion = question => {
      if (stryMutAct_9fa48("10764")) {
        {}
      } else {
        stryCov_9fa48("10764");
        // Skip validation for info cards
        if (stryMutAct_9fa48("10767") ? question.type !== 'info' : stryMutAct_9fa48("10766") ? false : stryMutAct_9fa48("10765") ? true : (stryCov_9fa48("10765", "10766", "10767"), question.type === (stryMutAct_9fa48("10768") ? "" : (stryCov_9fa48("10768"), 'info')))) return null;
        if (stryMutAct_9fa48("10771") ? false : stryMutAct_9fa48("10770") ? true : stryMutAct_9fa48("10769") ? question.required : (stryCov_9fa48("10769", "10770", "10771"), !question.required)) return null;
        const value = formData[question.id];

        // Check if value is empty or invalid
        if (stryMutAct_9fa48("10774") ? (!value || value === '' || Array.isArray(value) && value.length === 0) && typeof value === 'string' && value.trim() === '' : stryMutAct_9fa48("10773") ? false : stryMutAct_9fa48("10772") ? true : (stryCov_9fa48("10772", "10773", "10774"), (stryMutAct_9fa48("10776") ? (!value || value === '') && Array.isArray(value) && value.length === 0 : stryMutAct_9fa48("10775") ? false : (stryCov_9fa48("10775", "10776"), (stryMutAct_9fa48("10778") ? !value && value === '' : stryMutAct_9fa48("10777") ? false : (stryCov_9fa48("10777", "10778"), (stryMutAct_9fa48("10779") ? value : (stryCov_9fa48("10779"), !value)) || (stryMutAct_9fa48("10781") ? value !== '' : stryMutAct_9fa48("10780") ? false : (stryCov_9fa48("10780", "10781"), value === (stryMutAct_9fa48("10782") ? "Stryker was here!" : (stryCov_9fa48("10782"), '')))))) || (stryMutAct_9fa48("10784") ? Array.isArray(value) || value.length === 0 : stryMutAct_9fa48("10783") ? false : (stryCov_9fa48("10783", "10784"), Array.isArray(value) && (stryMutAct_9fa48("10786") ? value.length !== 0 : stryMutAct_9fa48("10785") ? true : (stryCov_9fa48("10785", "10786"), value.length === 0)))))) || (stryMutAct_9fa48("10788") ? typeof value === 'string' || value.trim() === '' : stryMutAct_9fa48("10787") ? false : (stryCov_9fa48("10787", "10788"), (stryMutAct_9fa48("10790") ? typeof value !== 'string' : stryMutAct_9fa48("10789") ? true : (stryCov_9fa48("10789", "10790"), typeof value === (stryMutAct_9fa48("10791") ? "" : (stryCov_9fa48("10791"), 'string')))) && (stryMutAct_9fa48("10793") ? value.trim() !== '' : stryMutAct_9fa48("10792") ? true : (stryCov_9fa48("10792", "10793"), (stryMutAct_9fa48("10794") ? value : (stryCov_9fa48("10794"), value.trim())) === (stryMutAct_9fa48("10795") ? "Stryker was here!" : (stryCov_9fa48("10795"), '')))))))) {
          if (stryMutAct_9fa48("10796")) {
            {}
          } else {
            stryCov_9fa48("10796");
            return stryMutAct_9fa48("10797") ? "" : (stryCov_9fa48("10797"), "This question is required.");
          }
        }
        return null;
      }
    };
    const validateCurrentQuestions = () => {
      if (stryMutAct_9fa48("10798")) {
        {}
      } else {
        stryCov_9fa48("10798");
        const currentQuestionGroup = getCurrentQuestions();
        const errors = {};

        // Validate the root question
        if (stryMutAct_9fa48("10800") ? false : stryMutAct_9fa48("10799") ? true : (stryCov_9fa48("10799", "10800"), currentQuestionGroup.rootQuestion)) {
          if (stryMutAct_9fa48("10801")) {
            {}
          } else {
            stryCov_9fa48("10801");
            const error = validateQuestion(currentQuestionGroup.rootQuestion);
            if (stryMutAct_9fa48("10803") ? false : stryMutAct_9fa48("10802") ? true : (stryCov_9fa48("10802", "10803"), error)) {
              if (stryMutAct_9fa48("10804")) {
                {}
              } else {
                stryCov_9fa48("10804");
                errors[currentQuestionGroup.rootQuestion.id] = error;
              }
            }
          }
        }

        // Validate all visible conditional questions
        currentQuestionGroup.conditionalQuestions.forEach(question => {
          if (stryMutAct_9fa48("10805")) {
            {}
          } else {
            stryCov_9fa48("10805");
            const error = validateQuestion(question);
            if (stryMutAct_9fa48("10807") ? false : stryMutAct_9fa48("10806") ? true : (stryCov_9fa48("10806", "10807"), error)) {
              if (stryMutAct_9fa48("10808")) {
                {}
              } else {
                stryCov_9fa48("10808");
                errors[question.id] = error;
              }
            }
          }
        });
        return errors;
      }
    };
    const validateSection = sectionQuestions => {
      if (stryMutAct_9fa48("10809")) {
        {}
      } else {
        stryCov_9fa48("10809");
        const visibleQuestions = getVisibleQuestions(sectionQuestions);
        const errors = {};
        visibleQuestions.forEach(question => {
          if (stryMutAct_9fa48("10810")) {
            {}
          } else {
            stryCov_9fa48("10810");
            const error = validateQuestion(question);
            if (stryMutAct_9fa48("10812") ? false : stryMutAct_9fa48("10811") ? true : (stryCov_9fa48("10811", "10812"), error)) {
              if (stryMutAct_9fa48("10813")) {
                {}
              } else {
                stryCov_9fa48("10813");
                errors[question.id] = error;
              }
            }
          }
        });
        return errors;
      }
    };

    // Check if section has any validation errors
    const sectionHasErrors = sectionQuestions => {
      if (stryMutAct_9fa48("10814")) {
        {}
      } else {
        stryCov_9fa48("10814");
        const errors = validateSection(sectionQuestions);
        return stryMutAct_9fa48("10818") ? Object.keys(errors).length <= 0 : stryMutAct_9fa48("10817") ? Object.keys(errors).length >= 0 : stryMutAct_9fa48("10816") ? false : stryMutAct_9fa48("10815") ? true : (stryCov_9fa48("10815", "10816", "10817", "10818"), Object.keys(errors).length > 0);
      }
    };

    // Check if conditional question should be shown
    const shouldShowQuestion = question => {
      if (stryMutAct_9fa48("10819")) {
        {}
      } else {
        stryCov_9fa48("10819");
        if (stryMutAct_9fa48("10822") ? false : stryMutAct_9fa48("10821") ? true : stryMutAct_9fa48("10820") ? question.parentQuestionId : (stryCov_9fa48("10820", "10821", "10822"), !question.parentQuestionId)) return stryMutAct_9fa48("10823") ? false : (stryCov_9fa48("10823"), true);
        const parentValue = formData[question.parentQuestionId];
        if (stryMutAct_9fa48("10826") ? false : stryMutAct_9fa48("10825") ? true : stryMutAct_9fa48("10824") ? parentValue : (stryCov_9fa48("10824", "10825", "10826"), !parentValue)) return stryMutAct_9fa48("10827") ? true : (stryCov_9fa48("10827"), false);
        switch (question.conditionType) {
          case stryMutAct_9fa48("10828") ? "" : (stryCov_9fa48("10828"), 'show_when_equals'):
          case stryMutAct_9fa48("10830") ? "" : (stryCov_9fa48("10830"), 'equals'):
            if (stryMutAct_9fa48("10829")) {} else {
              stryCov_9fa48("10829");
              return stryMutAct_9fa48("10833") ? parentValue !== question.showWhenParentEquals : stryMutAct_9fa48("10832") ? false : stryMutAct_9fa48("10831") ? true : (stryCov_9fa48("10831", "10832", "10833"), parentValue === question.showWhenParentEquals);
            }
          case stryMutAct_9fa48("10835") ? "" : (stryCov_9fa48("10835"), 'not_equals'):
            if (stryMutAct_9fa48("10834")) {} else {
              stryCov_9fa48("10834");
              return stryMutAct_9fa48("10838") ? parentValue === question.showWhenParentEquals : stryMutAct_9fa48("10837") ? false : stryMutAct_9fa48("10836") ? true : (stryCov_9fa48("10836", "10837", "10838"), parentValue !== question.showWhenParentEquals);
            }
          case stryMutAct_9fa48("10840") ? "" : (stryCov_9fa48("10840"), 'contains'):
            if (stryMutAct_9fa48("10839")) {} else {
              stryCov_9fa48("10839");
              return Array.isArray(parentValue) ? parentValue.includes(question.showWhenParentEquals) : parentValue.toString().includes(question.showWhenParentEquals);
            }
          default:
            if (stryMutAct_9fa48("10841")) {} else {
              stryCov_9fa48("10841");
              return stryMutAct_9fa48("10844") ? parentValue !== question.showWhenParentEquals : stryMutAct_9fa48("10843") ? false : stryMutAct_9fa48("10842") ? true : (stryCov_9fa48("10842", "10843", "10844"), parentValue === question.showWhenParentEquals);
            }
        }
      }
    };

    // Get visible questions for current section
    const getVisibleQuestions = sectionQuestions => {
      if (stryMutAct_9fa48("10845")) {
        {}
      } else {
        stryCov_9fa48("10845");
        return stryMutAct_9fa48("10846") ? sectionQuestions : (stryCov_9fa48("10846"), sectionQuestions.filter(shouldShowQuestion));
      }
    };

    // Get all root questions (non-conditional) flattened across all sections
    const getAllRootQuestions = () => {
      if (stryMutAct_9fa48("10847")) {
        {}
      } else {
        stryCov_9fa48("10847");
        let allQuestions = stryMutAct_9fa48("10848") ? ["Stryker was here"] : (stryCov_9fa48("10848"), []);
        applicationQuestions.forEach((section, sectionIndex) => {
          if (stryMutAct_9fa48("10849")) {
            {}
          } else {
            stryCov_9fa48("10849");
            if (stryMutAct_9fa48("10851") ? false : stryMutAct_9fa48("10850") ? true : (stryCov_9fa48("10850", "10851"), section.questions)) {
              if (stryMutAct_9fa48("10852")) {
                {}
              } else {
                stryCov_9fa48("10852");
                // Only include root questions (non-conditional) in the main flow
                const rootQuestions = stryMutAct_9fa48("10853") ? section.questions : (stryCov_9fa48("10853"), section.questions.filter(stryMutAct_9fa48("10854") ? () => undefined : (stryCov_9fa48("10854"), q => stryMutAct_9fa48("10855") ? q.parentQuestionId : (stryCov_9fa48("10855"), !q.parentQuestionId))));
                const visibleRootQuestions = stryMutAct_9fa48("10856") ? rootQuestions : (stryCov_9fa48("10856"), rootQuestions.filter(shouldShowQuestion));
                visibleRootQuestions.forEach(question => {
                  if (stryMutAct_9fa48("10857")) {
                    {}
                  } else {
                    stryCov_9fa48("10857");
                    allQuestions.push(stryMutAct_9fa48("10858") ? {} : (stryCov_9fa48("10858"), {
                      ...question,
                      sectionIndex,
                      sectionTitle: section.title
                    }));
                  }
                });
              }
            }
          }
        });
        return allQuestions;
      }
    };

    // Get conditional questions for a specific parent question
    const getConditionalQuestionsForParent = (parentQuestionId, sectionQuestions) => {
      if (stryMutAct_9fa48("10859")) {
        {}
      } else {
        stryCov_9fa48("10859");
        if (stryMutAct_9fa48("10862") ? false : stryMutAct_9fa48("10861") ? true : stryMutAct_9fa48("10860") ? sectionQuestions : (stryCov_9fa48("10860", "10861", "10862"), !sectionQuestions)) return stryMutAct_9fa48("10863") ? ["Stryker was here"] : (stryCov_9fa48("10863"), []);
        return stryMutAct_9fa48("10864") ? sectionQuestions : (stryCov_9fa48("10864"), sectionQuestions.filter(stryMutAct_9fa48("10865") ? () => undefined : (stryCov_9fa48("10865"), question => stryMutAct_9fa48("10868") ? question.parentQuestionId === parentQuestionId || shouldShowQuestion(question) : stryMutAct_9fa48("10867") ? false : stryMutAct_9fa48("10866") ? true : (stryCov_9fa48("10866", "10867", "10868"), (stryMutAct_9fa48("10870") ? question.parentQuestionId !== parentQuestionId : stryMutAct_9fa48("10869") ? true : (stryCov_9fa48("10869", "10870"), question.parentQuestionId === parentQuestionId)) && shouldShowQuestion(question)))));
      }
    };

    // Get current question group (parent + its visible conditional children)
    const getCurrentQuestions = () => {
      if (stryMutAct_9fa48("10871")) {
        {}
      } else {
        stryCov_9fa48("10871");
        const allRootQuestions = getAllRootQuestions();
        if (stryMutAct_9fa48("10874") ? allRootQuestions.length !== 0 : stryMutAct_9fa48("10873") ? false : stryMutAct_9fa48("10872") ? true : (stryCov_9fa48("10872", "10873", "10874"), allRootQuestions.length === 0)) return stryMutAct_9fa48("10875") ? {} : (stryCov_9fa48("10875"), {
          rootQuestion: null,
          conditionalQuestions: stryMutAct_9fa48("10876") ? ["Stryker was here"] : (stryCov_9fa48("10876"), [])
        });

        // Get the current root question
        const currentQuestionGlobalIndex = getCurrentQuestionGlobalIndex();
        if (stryMutAct_9fa48("10879") ? currentQuestionGlobalIndex >= 0 || currentQuestionGlobalIndex < allRootQuestions.length : stryMutAct_9fa48("10878") ? false : stryMutAct_9fa48("10877") ? true : (stryCov_9fa48("10877", "10878", "10879"), (stryMutAct_9fa48("10882") ? currentQuestionGlobalIndex < 0 : stryMutAct_9fa48("10881") ? currentQuestionGlobalIndex > 0 : stryMutAct_9fa48("10880") ? true : (stryCov_9fa48("10880", "10881", "10882"), currentQuestionGlobalIndex >= 0)) && (stryMutAct_9fa48("10885") ? currentQuestionGlobalIndex >= allRootQuestions.length : stryMutAct_9fa48("10884") ? currentQuestionGlobalIndex <= allRootQuestions.length : stryMutAct_9fa48("10883") ? true : (stryCov_9fa48("10883", "10884", "10885"), currentQuestionGlobalIndex < allRootQuestions.length)))) {
          if (stryMutAct_9fa48("10886")) {
            {}
          } else {
            stryCov_9fa48("10886");
            const currentRootQuestion = allRootQuestions[currentQuestionGlobalIndex];

            // Find the section this question belongs to
            const section = applicationQuestions[currentRootQuestion.sectionIndex];

            // Get any conditional questions for this parent
            const conditionalQuestions = getConditionalQuestionsForParent(currentRootQuestion.id, section.questions);

            // Return the parent question with its conditional children
            return stryMutAct_9fa48("10887") ? {} : (stryCov_9fa48("10887"), {
              rootQuestion: currentRootQuestion,
              conditionalQuestions: conditionalQuestions
            });
          }
        }
        return stryMutAct_9fa48("10888") ? {} : (stryCov_9fa48("10888"), {
          rootQuestion: null,
          conditionalQuestions: stryMutAct_9fa48("10889") ? ["Stryker was here"] : (stryCov_9fa48("10889"), [])
        });
      }
    };

    // Get the global index of the current root question
    const getCurrentQuestionGlobalIndex = () => {
      if (stryMutAct_9fa48("10890")) {
        {}
      } else {
        stryCov_9fa48("10890");
        if (stryMutAct_9fa48("10893") ? applicationQuestions.length !== 0 : stryMutAct_9fa48("10892") ? false : stryMutAct_9fa48("10891") ? true : (stryCov_9fa48("10891", "10892", "10893"), applicationQuestions.length === 0)) return 0;
        let globalIndex = 0;

        // Count root questions in previous sections
        for (let sectionIndex = 0; stryMutAct_9fa48("10896") ? sectionIndex >= currentSection : stryMutAct_9fa48("10895") ? sectionIndex <= currentSection : stryMutAct_9fa48("10894") ? false : (stryCov_9fa48("10894", "10895", "10896"), sectionIndex < currentSection); stryMutAct_9fa48("10897") ? sectionIndex-- : (stryCov_9fa48("10897"), sectionIndex++)) {
          if (stryMutAct_9fa48("10898")) {
            {}
          } else {
            stryCov_9fa48("10898");
            if (stryMutAct_9fa48("10901") ? applicationQuestions[sectionIndex].questions : stryMutAct_9fa48("10900") ? false : stryMutAct_9fa48("10899") ? true : (stryCov_9fa48("10899", "10900", "10901"), applicationQuestions[sectionIndex]?.questions)) {
              if (stryMutAct_9fa48("10902")) {
                {}
              } else {
                stryCov_9fa48("10902");
                const rootQuestions = stryMutAct_9fa48("10903") ? applicationQuestions[sectionIndex].questions : (stryCov_9fa48("10903"), applicationQuestions[sectionIndex].questions.filter(stryMutAct_9fa48("10904") ? () => undefined : (stryCov_9fa48("10904"), q => stryMutAct_9fa48("10905") ? q.parentQuestionId : (stryCov_9fa48("10905"), !q.parentQuestionId))));
                const visibleRootQuestions = stryMutAct_9fa48("10906") ? rootQuestions : (stryCov_9fa48("10906"), rootQuestions.filter(shouldShowQuestion));
                stryMutAct_9fa48("10907") ? globalIndex -= visibleRootQuestions.length : (stryCov_9fa48("10907"), globalIndex += visibleRootQuestions.length);
              }
            }
          }
        }

        // Add the current question index within the current section (only for root questions)
        if (stryMutAct_9fa48("10910") ? applicationQuestions[currentSection].questions : stryMutAct_9fa48("10909") ? false : stryMutAct_9fa48("10908") ? true : (stryCov_9fa48("10908", "10909", "10910"), applicationQuestions[currentSection]?.questions)) {
          if (stryMutAct_9fa48("10911")) {
            {}
          } else {
            stryCov_9fa48("10911");
            const currentSectionQuestions = applicationQuestions[currentSection].questions;
            const currentQuestion = currentSectionQuestions[currentQuestionIndex];

            // Only add to global index if the current question is a root question
            if (stryMutAct_9fa48("10914") ? currentQuestion || !currentQuestion.parentQuestionId : stryMutAct_9fa48("10913") ? false : stryMutAct_9fa48("10912") ? true : (stryCov_9fa48("10912", "10913", "10914"), currentQuestion && (stryMutAct_9fa48("10915") ? currentQuestion.parentQuestionId : (stryCov_9fa48("10915"), !currentQuestion.parentQuestionId)))) {
              if (stryMutAct_9fa48("10916")) {
                {}
              } else {
                stryCov_9fa48("10916");
                const rootQuestions = stryMutAct_9fa48("10917") ? currentSectionQuestions : (stryCov_9fa48("10917"), currentSectionQuestions.filter(stryMutAct_9fa48("10918") ? () => undefined : (stryCov_9fa48("10918"), q => stryMutAct_9fa48("10919") ? q.parentQuestionId : (stryCov_9fa48("10919"), !q.parentQuestionId))));
                const visibleRootQuestions = stryMutAct_9fa48("10920") ? rootQuestions : (stryCov_9fa48("10920"), rootQuestions.filter(shouldShowQuestion));
                const rootQuestionIndex = visibleRootQuestions.findIndex(stryMutAct_9fa48("10921") ? () => undefined : (stryCov_9fa48("10921"), q => stryMutAct_9fa48("10924") ? q.id !== currentQuestion.id : stryMutAct_9fa48("10923") ? false : stryMutAct_9fa48("10922") ? true : (stryCov_9fa48("10922", "10923", "10924"), q.id === currentQuestion.id)));
                if (stryMutAct_9fa48("10927") ? rootQuestionIndex === -1 : stryMutAct_9fa48("10926") ? false : stryMutAct_9fa48("10925") ? true : (stryCov_9fa48("10925", "10926", "10927"), rootQuestionIndex !== (stryMutAct_9fa48("10928") ? +1 : (stryCov_9fa48("10928"), -1)))) {
                  if (stryMutAct_9fa48("10929")) {
                    {}
                  } else {
                    stryCov_9fa48("10929");
                    stryMutAct_9fa48("10930") ? globalIndex -= rootQuestionIndex : (stryCov_9fa48("10930"), globalIndex += rootQuestionIndex);
                  }
                }
              }
            }
          }
        }
        return globalIndex;
      }
    };

    // Initialize navigation to first root question
    const initializeNavigation = () => {
      if (stryMutAct_9fa48("10931")) {
        {}
      } else {
        stryCov_9fa48("10931");
        if (stryMutAct_9fa48("10934") ? applicationQuestions.length !== 0 : stryMutAct_9fa48("10933") ? false : stryMutAct_9fa48("10932") ? true : (stryCov_9fa48("10932", "10933", "10934"), applicationQuestions.length === 0)) return;

        // Find the first section with root questions
        for (let sectionIndex = 0; stryMutAct_9fa48("10937") ? sectionIndex >= applicationQuestions.length : stryMutAct_9fa48("10936") ? sectionIndex <= applicationQuestions.length : stryMutAct_9fa48("10935") ? false : (stryCov_9fa48("10935", "10936", "10937"), sectionIndex < applicationQuestions.length); stryMutAct_9fa48("10938") ? sectionIndex-- : (stryCov_9fa48("10938"), sectionIndex++)) {
          if (stryMutAct_9fa48("10939")) {
            {}
          } else {
            stryCov_9fa48("10939");
            const section = applicationQuestions[sectionIndex];
            if (stryMutAct_9fa48("10942") ? section.questions : stryMutAct_9fa48("10941") ? false : stryMutAct_9fa48("10940") ? true : (stryCov_9fa48("10940", "10941", "10942"), section?.questions)) {
              if (stryMutAct_9fa48("10943")) {
                {}
              } else {
                stryCov_9fa48("10943");
                const rootQuestions = stryMutAct_9fa48("10944") ? section.questions : (stryCov_9fa48("10944"), section.questions.filter(stryMutAct_9fa48("10945") ? () => undefined : (stryCov_9fa48("10945"), q => stryMutAct_9fa48("10946") ? q.parentQuestionId : (stryCov_9fa48("10946"), !q.parentQuestionId))));
                const visibleRootQuestions = stryMutAct_9fa48("10947") ? rootQuestions : (stryCov_9fa48("10947"), rootQuestions.filter(shouldShowQuestion));
                if (stryMutAct_9fa48("10951") ? visibleRootQuestions.length <= 0 : stryMutAct_9fa48("10950") ? visibleRootQuestions.length >= 0 : stryMutAct_9fa48("10949") ? false : stryMutAct_9fa48("10948") ? true : (stryCov_9fa48("10948", "10949", "10950", "10951"), visibleRootQuestions.length > 0)) {
                  if (stryMutAct_9fa48("10952")) {
                    {}
                  } else {
                    stryCov_9fa48("10952");
                    // Find the index of the first root question in the section's questions array
                    const firstRootQuestion = visibleRootQuestions[0];
                    const questionIndex = section.questions.findIndex(stryMutAct_9fa48("10953") ? () => undefined : (stryCov_9fa48("10953"), q => stryMutAct_9fa48("10956") ? q.id !== firstRootQuestion.id : stryMutAct_9fa48("10955") ? false : stryMutAct_9fa48("10954") ? true : (stryCov_9fa48("10954", "10955", "10956"), q.id === firstRootQuestion.id)));
                    setCurrentSection(sectionIndex);
                    setCurrentQuestionIndex(questionIndex);
                    localStorage.setItem(stryMutAct_9fa48("10957") ? "" : (stryCov_9fa48("10957"), 'applicationCurrentSection'), sectionIndex.toString());
                    localStorage.setItem(stryMutAct_9fa48("10958") ? "" : (stryCov_9fa48("10958"), 'applicationCurrentQuestionIndex'), questionIndex.toString());
                    return;
                  }
                }
              }
            }
          }
        }
      }
    };

    // Ensure we're always on a root question when navigation changes
    const ensureRootQuestionPosition = () => {
      if (stryMutAct_9fa48("10959")) {
        {}
      } else {
        stryCov_9fa48("10959");
        if (stryMutAct_9fa48("10962") ? applicationQuestions.length !== 0 : stryMutAct_9fa48("10961") ? false : stryMutAct_9fa48("10960") ? true : (stryCov_9fa48("10960", "10961", "10962"), applicationQuestions.length === 0)) return;
        const currentSectionData = applicationQuestions[currentSection];
        if (stryMutAct_9fa48("10965") ? false : stryMutAct_9fa48("10964") ? true : stryMutAct_9fa48("10963") ? currentSectionData?.questions : (stryCov_9fa48("10963", "10964", "10965"), !(stryMutAct_9fa48("10966") ? currentSectionData.questions : (stryCov_9fa48("10966"), currentSectionData?.questions)))) return;
        const currentQuestion = currentSectionData.questions[currentQuestionIndex];

        // If current question is conditional, find the nearest root question
        if (stryMutAct_9fa48("10969") ? currentQuestion.parentQuestionId : stryMutAct_9fa48("10968") ? false : stryMutAct_9fa48("10967") ? true : (stryCov_9fa48("10967", "10968", "10969"), currentQuestion?.parentQuestionId)) {
          if (stryMutAct_9fa48("10970")) {
            {}
          } else {
            stryCov_9fa48("10970");
            const rootQuestions = stryMutAct_9fa48("10971") ? currentSectionData.questions : (stryCov_9fa48("10971"), currentSectionData.questions.filter(stryMutAct_9fa48("10972") ? () => undefined : (stryCov_9fa48("10972"), q => stryMutAct_9fa48("10973") ? q.parentQuestionId : (stryCov_9fa48("10973"), !q.parentQuestionId))));
            const visibleRootQuestions = stryMutAct_9fa48("10974") ? rootQuestions : (stryCov_9fa48("10974"), rootQuestions.filter(shouldShowQuestion));
            if (stryMutAct_9fa48("10978") ? visibleRootQuestions.length <= 0 : stryMutAct_9fa48("10977") ? visibleRootQuestions.length >= 0 : stryMutAct_9fa48("10976") ? false : stryMutAct_9fa48("10975") ? true : (stryCov_9fa48("10975", "10976", "10977", "10978"), visibleRootQuestions.length > 0)) {
              if (stryMutAct_9fa48("10979")) {
                {}
              } else {
                stryCov_9fa48("10979");
                // Move to the first root question in this section
                const firstRootQuestion = visibleRootQuestions[0];
                const questionIndex = currentSectionData.questions.findIndex(stryMutAct_9fa48("10980") ? () => undefined : (stryCov_9fa48("10980"), q => stryMutAct_9fa48("10983") ? q.id !== firstRootQuestion.id : stryMutAct_9fa48("10982") ? false : stryMutAct_9fa48("10981") ? true : (stryCov_9fa48("10981", "10982", "10983"), q.id === firstRootQuestion.id)));
                setCurrentQuestionIndex(questionIndex);
                localStorage.setItem(stryMutAct_9fa48("10984") ? "" : (stryCov_9fa48("10984"), 'applicationCurrentQuestionIndex'), questionIndex.toString());
              }
            }
          }
        }
      }
    };

    // Navigation functions
    const handleNext = async () => {
      if (stryMutAct_9fa48("10985")) {
        {}
      } else {
        stryCov_9fa48("10985");
        // Validate current questions before proceeding
        const errors = validateCurrentQuestions();
        if (stryMutAct_9fa48("10989") ? Object.keys(errors).length <= 0 : stryMutAct_9fa48("10988") ? Object.keys(errors).length >= 0 : stryMutAct_9fa48("10987") ? false : stryMutAct_9fa48("10986") ? true : (stryCov_9fa48("10986", "10987", "10988", "10989"), Object.keys(errors).length > 0)) {
          if (stryMutAct_9fa48("10990")) {
            {}
          } else {
            stryCov_9fa48("10990");
            setValidationErrors(errors);
            setShowValidation(stryMutAct_9fa48("10991") ? false : (stryCov_9fa48("10991"), true));

            // Scroll to first error
            const firstErrorId = Object.keys(errors)[0];
            const errorElement = document.getElementById(firstErrorId);
            if (stryMutAct_9fa48("10993") ? false : stryMutAct_9fa48("10992") ? true : (stryCov_9fa48("10992", "10993"), errorElement)) {
              if (stryMutAct_9fa48("10994")) {
                {}
              } else {
                stryCov_9fa48("10994");
                errorElement.scrollIntoView(stryMutAct_9fa48("10995") ? {} : (stryCov_9fa48("10995"), {
                  behavior: stryMutAct_9fa48("10996") ? "" : (stryCov_9fa48("10996"), 'smooth'),
                  block: stryMutAct_9fa48("10997") ? "" : (stryCov_9fa48("10997"), 'center')
                }));
                errorElement.focus();
              }
            }
            return; // Don't proceed with navigation
          }
        }

        // Clear any existing validation errors
        setValidationErrors({});
        setShowValidation(stryMutAct_9fa48("10998") ? true : (stryCov_9fa48("10998"), false));
        await moveToNextQuestion();
      }
    };
    const handlePrevious = () => {
      if (stryMutAct_9fa48("10999")) {
        {}
      } else {
        stryCov_9fa48("10999");
        moveToPreviousQuestion();
      }
    };
    const moveToNextQuestion = async () => {
      if (stryMutAct_9fa48("11000")) {
        {}
      } else {
        stryCov_9fa48("11000");
        const allQuestions = getAllRootQuestions();
        const currentGlobalIndex = getCurrentQuestionGlobalIndex();
        console.log(stryMutAct_9fa48("11001") ? "" : (stryCov_9fa48("11001"), '=== moveToNextQuestion DEBUG ==='));
        console.log(stryMutAct_9fa48("11002") ? "" : (stryCov_9fa48("11002"), 'Current section:'), currentSection);
        console.log(stryMutAct_9fa48("11003") ? "" : (stryCov_9fa48("11003"), 'Current section title:'), stryMutAct_9fa48("11004") ? applicationQuestions[currentSection].title : (stryCov_9fa48("11004"), applicationQuestions[currentSection]?.title));
        console.log(stryMutAct_9fa48("11005") ? "" : (stryCov_9fa48("11005"), 'isEligibilitySection():'), isEligibilitySection());
        console.log(stryMutAct_9fa48("11006") ? "" : (stryCov_9fa48("11006"), 'Current global index:'), currentGlobalIndex);
        console.log(stryMutAct_9fa48("11007") ? "" : (stryCov_9fa48("11007"), 'All questions length:'), allQuestions.length);
        if (stryMutAct_9fa48("11011") ? currentGlobalIndex >= allQuestions.length - 1 : stryMutAct_9fa48("11010") ? currentGlobalIndex <= allQuestions.length - 1 : stryMutAct_9fa48("11009") ? false : stryMutAct_9fa48("11008") ? true : (stryCov_9fa48("11008", "11009", "11010", "11011"), currentGlobalIndex < (stryMutAct_9fa48("11012") ? allQuestions.length + 1 : (stryCov_9fa48("11012"), allQuestions.length - 1)))) {
          if (stryMutAct_9fa48("11013")) {
            {}
          } else {
            stryCov_9fa48("11013");
            // Check if we're moving from eligibility section to next section
            const nextGlobalIndex = stryMutAct_9fa48("11014") ? currentGlobalIndex - 1 : (stryCov_9fa48("11014"), currentGlobalIndex + 1);
            const {
              sectionIndex: nextSectionIndex
            } = getLocalIndicesFromGlobal(nextGlobalIndex);
            console.log(stryMutAct_9fa48("11015") ? "" : (stryCov_9fa48("11015"), 'Next section index:'), nextSectionIndex);
            console.log(stryMutAct_9fa48("11016") ? "" : (stryCov_9fa48("11016"), 'Current section index:'), currentSection);
            console.log(stryMutAct_9fa48("11017") ? "" : (stryCov_9fa48("11017"), 'Will move to different section:'), stryMutAct_9fa48("11020") ? nextSectionIndex === currentSection : stryMutAct_9fa48("11019") ? false : stryMutAct_9fa48("11018") ? true : (stryCov_9fa48("11018", "11019", "11020"), nextSectionIndex !== currentSection));

            // If we're currently in eligibility section and moving to a different section
            if (stryMutAct_9fa48("11023") ? isEligibilitySection() || nextSectionIndex !== currentSection : stryMutAct_9fa48("11022") ? false : stryMutAct_9fa48("11021") ? true : (stryCov_9fa48("11021", "11022", "11023"), isEligibilitySection() && (stryMutAct_9fa48("11025") ? nextSectionIndex === currentSection : stryMutAct_9fa48("11024") ? true : (stryCov_9fa48("11024", "11025"), nextSectionIndex !== currentSection)))) {
              if (stryMutAct_9fa48("11026")) {
                {}
              } else {
                stryCov_9fa48("11026");
                console.log(stryMutAct_9fa48("11027") ? "" : (stryCov_9fa48("11027"), 'Moving from eligibility section to next section, checking eligibility...'));
                console.log(stryMutAct_9fa48("11028") ? "" : (stryCov_9fa48("11028"), 'Form data for eligibility check:'), formData);
                console.log(stryMutAct_9fa48("11029") ? "" : (stryCov_9fa48("11029"), 'Current session:'), currentSession);
                const isEligible = await checkEligibility();
                console.log(stryMutAct_9fa48("11030") ? "" : (stryCov_9fa48("11030"), 'Eligibility check result:'), isEligible);
                if (stryMutAct_9fa48("11033") ? false : stryMutAct_9fa48("11032") ? true : stryMutAct_9fa48("11031") ? isEligible : (stryCov_9fa48("11031", "11032", "11033"), !isEligible)) {
                  if (stryMutAct_9fa48("11034")) {
                    {}
                  } else {
                    stryCov_9fa48("11034");
                    // User is not eligible, eligibility state will be set in checkEligibility
                    console.log(stryMutAct_9fa48("11035") ? "" : (stryCov_9fa48("11035"), 'User is not eligible, stopping navigation'));
                    return;
                  }
                }
              }
            }

            // Move to next question
            const {
              sectionIndex,
              questionIndex
            } = getLocalIndicesFromGlobal(nextGlobalIndex);
            console.log(stryMutAct_9fa48("11036") ? "" : (stryCov_9fa48("11036"), 'Moving to section:'), sectionIndex, stryMutAct_9fa48("11037") ? "" : (stryCov_9fa48("11037"), 'question:'), questionIndex);
            setCurrentSection(sectionIndex);
            setCurrentQuestionIndex(questionIndex);
            localStorage.setItem(stryMutAct_9fa48("11038") ? "" : (stryCov_9fa48("11038"), 'applicationCurrentSection'), sectionIndex.toString());
            localStorage.setItem(stryMutAct_9fa48("11039") ? "" : (stryCov_9fa48("11039"), 'applicationCurrentQuestionIndex'), questionIndex.toString());
          }
        } else {
          if (stryMutAct_9fa48("11040")) {
            {}
          } else {
            stryCov_9fa48("11040");
            console.log(stryMutAct_9fa48("11041") ? "" : (stryCov_9fa48("11041"), 'At last question, cannot move to next'));
          }
        }
      }
    };
    const moveToPreviousQuestion = () => {
      if (stryMutAct_9fa48("11042")) {
        {}
      } else {
        stryCov_9fa48("11042");
        const currentGlobalIndex = getCurrentQuestionGlobalIndex();
        if (stryMutAct_9fa48("11046") ? currentGlobalIndex <= 0 : stryMutAct_9fa48("11045") ? currentGlobalIndex >= 0 : stryMutAct_9fa48("11044") ? false : stryMutAct_9fa48("11043") ? true : (stryCov_9fa48("11043", "11044", "11045", "11046"), currentGlobalIndex > 0)) {
          if (stryMutAct_9fa48("11047")) {
            {}
          } else {
            stryCov_9fa48("11047");
            // Move to previous question
            const prevGlobalIndex = stryMutAct_9fa48("11048") ? currentGlobalIndex + 1 : (stryCov_9fa48("11048"), currentGlobalIndex - 1);
            const {
              sectionIndex,
              questionIndex
            } = getLocalIndicesFromGlobal(prevGlobalIndex);
            setCurrentSection(sectionIndex);
            setCurrentQuestionIndex(questionIndex);
            localStorage.setItem(stryMutAct_9fa48("11049") ? "" : (stryCov_9fa48("11049"), 'applicationCurrentSection'), sectionIndex.toString());
            localStorage.setItem(stryMutAct_9fa48("11050") ? "" : (stryCov_9fa48("11050"), 'applicationCurrentQuestionIndex'), questionIndex.toString());
          }
        }
      }
    };

    // Convert global question index to section and question indices (root questions only)
    const getLocalIndicesFromGlobal = globalIndex => {
      if (stryMutAct_9fa48("11051")) {
        {}
      } else {
        stryCov_9fa48("11051");
        let currentGlobal = 0;
        for (let sectionIndex = 0; stryMutAct_9fa48("11054") ? sectionIndex >= applicationQuestions.length : stryMutAct_9fa48("11053") ? sectionIndex <= applicationQuestions.length : stryMutAct_9fa48("11052") ? false : (stryCov_9fa48("11052", "11053", "11054"), sectionIndex < applicationQuestions.length); stryMutAct_9fa48("11055") ? sectionIndex-- : (stryCov_9fa48("11055"), sectionIndex++)) {
          if (stryMutAct_9fa48("11056")) {
            {}
          } else {
            stryCov_9fa48("11056");
            if (stryMutAct_9fa48("11059") ? applicationQuestions[sectionIndex].questions : stryMutAct_9fa48("11058") ? false : stryMutAct_9fa48("11057") ? true : (stryCov_9fa48("11057", "11058", "11059"), applicationQuestions[sectionIndex]?.questions)) {
              if (stryMutAct_9fa48("11060")) {
                {}
              } else {
                stryCov_9fa48("11060");
                const rootQuestions = stryMutAct_9fa48("11061") ? applicationQuestions[sectionIndex].questions : (stryCov_9fa48("11061"), applicationQuestions[sectionIndex].questions.filter(stryMutAct_9fa48("11062") ? () => undefined : (stryCov_9fa48("11062"), q => stryMutAct_9fa48("11063") ? q.parentQuestionId : (stryCov_9fa48("11063"), !q.parentQuestionId))));
                const visibleRootQuestions = stryMutAct_9fa48("11064") ? rootQuestions : (stryCov_9fa48("11064"), rootQuestions.filter(shouldShowQuestion));
                if (stryMutAct_9fa48("11068") ? currentGlobal + visibleRootQuestions.length <= globalIndex : stryMutAct_9fa48("11067") ? currentGlobal + visibleRootQuestions.length >= globalIndex : stryMutAct_9fa48("11066") ? false : stryMutAct_9fa48("11065") ? true : (stryCov_9fa48("11065", "11066", "11067", "11068"), (stryMutAct_9fa48("11069") ? currentGlobal - visibleRootQuestions.length : (stryCov_9fa48("11069"), currentGlobal + visibleRootQuestions.length)) > globalIndex)) {
                  if (stryMutAct_9fa48("11070")) {
                    {}
                  } else {
                    stryCov_9fa48("11070");
                    // The target question is in this section
                    const questionIndex = stryMutAct_9fa48("11071") ? globalIndex + currentGlobal : (stryCov_9fa48("11071"), globalIndex - currentGlobal);

                    // Find the actual index of this root question within all questions in the section
                    const targetRootQuestion = visibleRootQuestions[questionIndex];
                    const actualQuestionIndex = applicationQuestions[sectionIndex].questions.findIndex(stryMutAct_9fa48("11072") ? () => undefined : (stryCov_9fa48("11072"), q => stryMutAct_9fa48("11075") ? q.id !== targetRootQuestion.id : stryMutAct_9fa48("11074") ? false : stryMutAct_9fa48("11073") ? true : (stryCov_9fa48("11073", "11074", "11075"), q.id === targetRootQuestion.id)));
                    return stryMutAct_9fa48("11076") ? {} : (stryCov_9fa48("11076"), {
                      sectionIndex,
                      questionIndex: actualQuestionIndex
                    });
                  }
                }
                stryMutAct_9fa48("11077") ? currentGlobal -= visibleRootQuestions.length : (stryCov_9fa48("11077"), currentGlobal += visibleRootQuestions.length);
              }
            }
          }
        }

        // Default to last section and question if not found
        return stryMutAct_9fa48("11078") ? {} : (stryCov_9fa48("11078"), {
          sectionIndex: stryMutAct_9fa48("11079") ? applicationQuestions.length + 1 : (stryCov_9fa48("11079"), applicationQuestions.length - 1),
          questionIndex: 0
        });
      }
    };

    // Navigate to first question of a specific section
    const navigateToSection = targetSectionIndex => {
      if (stryMutAct_9fa48("11080")) {
        {}
      } else {
        stryCov_9fa48("11080");
        // Handle intro section
        if (stryMutAct_9fa48("11083") ? targetSectionIndex !== -1 : stryMutAct_9fa48("11082") ? false : stryMutAct_9fa48("11081") ? true : (stryCov_9fa48("11081", "11082", "11083"), targetSectionIndex === (stryMutAct_9fa48("11084") ? +1 : (stryCov_9fa48("11084"), -1)))) {
          if (stryMutAct_9fa48("11085")) {
            {}
          } else {
            stryCov_9fa48("11085");
            console.log(stryMutAct_9fa48("11086") ? "" : (stryCov_9fa48("11086"), 'Navigating to intro section'));
            setCurrentSection(stryMutAct_9fa48("11087") ? +1 : (stryCov_9fa48("11087"), -1));
            setCurrentQuestionIndex(0);
            setShowValidation(stryMutAct_9fa48("11088") ? true : (stryCov_9fa48("11088"), false));
            setValidationErrors({});
            // Save to localStorage
            localStorage.setItem(stryMutAct_9fa48("11089") ? "" : (stryCov_9fa48("11089"), 'applicationCurrentSection'), stryMutAct_9fa48("11090") ? "" : (stryCov_9fa48("11090"), '-1'));
            localStorage.setItem(stryMutAct_9fa48("11091") ? "" : (stryCov_9fa48("11091"), 'applicationCurrentQuestionIndex'), stryMutAct_9fa48("11092") ? "" : (stryCov_9fa48("11092"), '0'));
            return;
          }
        }

        // Calculate the global index of the first question in the target section
        let globalIndex = 0;
        for (let sectionIndex = 0; stryMutAct_9fa48("11095") ? sectionIndex >= targetSectionIndex : stryMutAct_9fa48("11094") ? sectionIndex <= targetSectionIndex : stryMutAct_9fa48("11093") ? false : (stryCov_9fa48("11093", "11094", "11095"), sectionIndex < targetSectionIndex); stryMutAct_9fa48("11096") ? sectionIndex-- : (stryCov_9fa48("11096"), sectionIndex++)) {
          if (stryMutAct_9fa48("11097")) {
            {}
          } else {
            stryCov_9fa48("11097");
            const sectionQuestions = stryMutAct_9fa48("11100") ? applicationQuestions[sectionIndex].questions && [] : stryMutAct_9fa48("11099") ? false : stryMutAct_9fa48("11098") ? true : (stryCov_9fa48("11098", "11099", "11100"), applicationQuestions[sectionIndex].questions || (stryMutAct_9fa48("11101") ? ["Stryker was here"] : (stryCov_9fa48("11101"), [])));
            const rootQuestions = stryMutAct_9fa48("11102") ? sectionQuestions : (stryCov_9fa48("11102"), sectionQuestions.filter(stryMutAct_9fa48("11103") ? () => undefined : (stryCov_9fa48("11103"), q => stryMutAct_9fa48("11104") ? q.parentQuestionId : (stryCov_9fa48("11104"), !q.parentQuestionId))));
            const visibleRootQuestions = stryMutAct_9fa48("11105") ? rootQuestions : (stryCov_9fa48("11105"), rootQuestions.filter(shouldShowQuestion));
            stryMutAct_9fa48("11106") ? globalIndex -= visibleRootQuestions.length : (stryCov_9fa48("11106"), globalIndex += visibleRootQuestions.length);
          }
        }

        // Set current question to first question of the target section
        setCurrentQuestionIndex(globalIndex);
        setCurrentSection(targetSectionIndex);

        // Save to localStorage
        localStorage.setItem(stryMutAct_9fa48("11107") ? "" : (stryCov_9fa48("11107"), 'applicationCurrentQuestionIndex'), globalIndex.toString());
        localStorage.setItem(stryMutAct_9fa48("11108") ? "" : (stryCov_9fa48("11108"), 'applicationCurrentSection'), targetSectionIndex.toString());
      }
    };

    // Submit application
    const handleSubmit = async e => {
      if (stryMutAct_9fa48("11109")) {
        {}
      } else {
        stryCov_9fa48("11109");
        e.preventDefault();
        setIsSubmitting(stryMutAct_9fa48("11110") ? false : (stryCov_9fa48("11110"), true));
        try {
          if (stryMutAct_9fa48("11111")) {
            {}
          } else {
            stryCov_9fa48("11111");
            // Validate entire form before submission
            let allErrors = {};
            applicationQuestions.forEach(section => {
              if (stryMutAct_9fa48("11112")) {
                {}
              } else {
                stryCov_9fa48("11112");
                const sectionErrors = validateSection(section.questions);
                allErrors = stryMutAct_9fa48("11113") ? {} : (stryCov_9fa48("11113"), {
                  ...allErrors,
                  ...sectionErrors
                });
              }
            });
            if (stryMutAct_9fa48("11117") ? Object.keys(allErrors).length <= 0 : stryMutAct_9fa48("11116") ? Object.keys(allErrors).length >= 0 : stryMutAct_9fa48("11115") ? false : stryMutAct_9fa48("11114") ? true : (stryCov_9fa48("11114", "11115", "11116", "11117"), Object.keys(allErrors).length > 0)) {
              if (stryMutAct_9fa48("11118")) {
                {}
              } else {
                stryCov_9fa48("11118");
                setValidationErrors(allErrors);
                setShowValidation(stryMutAct_9fa48("11119") ? false : (stryCov_9fa48("11119"), true));
                setIsSubmitting(stryMutAct_9fa48("11120") ? true : (stryCov_9fa48("11120"), false));

                // Find the first section with errors
                let errorSectionIndex = stryMutAct_9fa48("11121") ? +1 : (stryCov_9fa48("11121"), -1);
                for (let i = 0; stryMutAct_9fa48("11124") ? i >= applicationQuestions.length : stryMutAct_9fa48("11123") ? i <= applicationQuestions.length : stryMutAct_9fa48("11122") ? false : (stryCov_9fa48("11122", "11123", "11124"), i < applicationQuestions.length); stryMutAct_9fa48("11125") ? i-- : (stryCov_9fa48("11125"), i++)) {
                  if (stryMutAct_9fa48("11126")) {
                    {}
                  } else {
                    stryCov_9fa48("11126");
                    const sectionQuestions = getVisibleQuestions(applicationQuestions[i].questions);
                    const hasError = stryMutAct_9fa48("11127") ? sectionQuestions.every(q => allErrors[q.id]) : (stryCov_9fa48("11127"), sectionQuestions.some(stryMutAct_9fa48("11128") ? () => undefined : (stryCov_9fa48("11128"), q => allErrors[q.id])));
                    if (stryMutAct_9fa48("11130") ? false : stryMutAct_9fa48("11129") ? true : (stryCov_9fa48("11129", "11130"), hasError)) {
                      if (stryMutAct_9fa48("11131")) {
                        {}
                      } else {
                        stryCov_9fa48("11131");
                        errorSectionIndex = i;
                        break;
                      }
                    }
                  }
                }
                if (stryMutAct_9fa48("11134") ? errorSectionIndex === -1 : stryMutAct_9fa48("11133") ? false : stryMutAct_9fa48("11132") ? true : (stryCov_9fa48("11132", "11133", "11134"), errorSectionIndex !== (stryMutAct_9fa48("11135") ? +1 : (stryCov_9fa48("11135"), -1)))) {
                  if (stryMutAct_9fa48("11136")) {
                    {}
                  } else {
                    stryCov_9fa48("11136");
                    setCurrentSection(errorSectionIndex);
                    localStorage.setItem(stryMutAct_9fa48("11137") ? "" : (stryCov_9fa48("11137"), 'applicationCurrentSection'), errorSectionIndex.toString());

                    // Scroll to first error after a brief delay
                    setTimeout(() => {
                      if (stryMutAct_9fa48("11138")) {
                        {}
                      } else {
                        stryCov_9fa48("11138");
                        const firstErrorId = Object.keys(allErrors)[0];
                        const errorElement = document.getElementById(firstErrorId);
                        if (stryMutAct_9fa48("11140") ? false : stryMutAct_9fa48("11139") ? true : (stryCov_9fa48("11139", "11140"), errorElement)) {
                          if (stryMutAct_9fa48("11141")) {
                            {}
                          } else {
                            stryCov_9fa48("11141");
                            errorElement.scrollIntoView(stryMutAct_9fa48("11142") ? {} : (stryCov_9fa48("11142"), {
                              behavior: stryMutAct_9fa48("11143") ? "" : (stryCov_9fa48("11143"), 'smooth'),
                              block: stryMutAct_9fa48("11144") ? "" : (stryCov_9fa48("11144"), 'center')
                            }));
                            errorElement.focus();
                          }
                        }
                      }
                    }, 100);
                  }
                }
                await Swal.fire(stryMutAct_9fa48("11145") ? {} : (stryCov_9fa48("11145"), {
                  icon: stryMutAct_9fa48("11146") ? "" : (stryCov_9fa48("11146"), 'warning'),
                  title: stryMutAct_9fa48("11147") ? "" : (stryCov_9fa48("11147"), 'Incomplete Application'),
                  text: stryMutAct_9fa48("11148") ? `` : (stryCov_9fa48("11148"), `Please complete all required fields. Found ${Object.keys(allErrors).length} missing required field(s).`),
                  confirmButtonColor: stryMutAct_9fa48("11149") ? "" : (stryCov_9fa48("11149"), '#4242ea'),
                  background: stryMutAct_9fa48("11150") ? "" : (stryCov_9fa48("11150"), 'var(--color-background-dark)'),
                  color: stryMutAct_9fa48("11151") ? "" : (stryCov_9fa48("11151"), 'var(--color-text-primary)'),
                  confirmButtonText: stryMutAct_9fa48("11152") ? "" : (stryCov_9fa48("11152"), 'OK, I\'ll complete them')
                }));
                return;
              }
            }
            if (stryMutAct_9fa48("11155") ? currentSession.application : stryMutAct_9fa48("11154") ? false : stryMutAct_9fa48("11153") ? true : (stryCov_9fa48("11153", "11154", "11155"), currentSession?.application)) {
              if (stryMutAct_9fa48("11156")) {
                {}
              } else {
                stryCov_9fa48("11156");
                await databaseService.submitApplication(currentSession.application.application_id);

                // Clear saved data
                localStorage.removeItem(stryMutAct_9fa48("11157") ? "" : (stryCov_9fa48("11157"), 'applicationFormData'));
                localStorage.removeItem(stryMutAct_9fa48("11158") ? "" : (stryCov_9fa48("11158"), 'applicationCurrentSection'));
                localStorage.removeItem(stryMutAct_9fa48("11159") ? "" : (stryCov_9fa48("11159"), 'applicationCurrentQuestionIndex'));
                localStorage.setItem(stryMutAct_9fa48("11160") ? "" : (stryCov_9fa48("11160"), 'applicationStatus'), stryMutAct_9fa48("11161") ? "" : (stryCov_9fa48("11161"), 'submitted'));
                await Swal.fire(stryMutAct_9fa48("11162") ? {} : (stryCov_9fa48("11162"), {
                  icon: stryMutAct_9fa48("11163") ? "" : (stryCov_9fa48("11163"), 'success'),
                  title: stryMutAct_9fa48("11164") ? "" : (stryCov_9fa48("11164"), '🎉 Application Submitted!'),
                  html: stryMutAct_9fa48("11165") ? `` : (stryCov_9fa48("11165"), `
            <div style="text-align: center;">
              <p style="font-size: 18px; margin: 15px 0;">Your application has been successfully submitted!</p>
              <p style="font-size: 16px; margin: 10px 0;">We'll review your application and get back to you soon.</p>
              <p style="font-size: 14px; color: #888; margin-top: 20px;">Thank you for your interest in our program!</p>
            </div>
          `),
                  confirmButtonText: stryMutAct_9fa48("11166") ? "" : (stryCov_9fa48("11166"), 'Continue to Dashboard'),
                  confirmButtonColor: stryMutAct_9fa48("11167") ? "" : (stryCov_9fa48("11167"), '#4242ea'),
                  background: stryMutAct_9fa48("11168") ? "" : (stryCov_9fa48("11168"), 'var(--color-background-dark)'),
                  color: stryMutAct_9fa48("11169") ? "" : (stryCov_9fa48("11169"), 'var(--color-text-primary)'),
                  timer: 5000,
                  timerProgressBar: stryMutAct_9fa48("11170") ? false : (stryCov_9fa48("11170"), true),
                  showClass: stryMutAct_9fa48("11171") ? {} : (stryCov_9fa48("11171"), {
                    popup: stryMutAct_9fa48("11172") ? "" : (stryCov_9fa48("11172"), 'animate__animated animate__bounceIn')
                  })
                }));
                navigate(stryMutAct_9fa48("11173") ? "" : (stryCov_9fa48("11173"), '/apply'));
              }
            } else {
              if (stryMutAct_9fa48("11174")) {
                {}
              } else {
                stryCov_9fa48("11174");
                throw new Error(stryMutAct_9fa48("11175") ? "" : (stryCov_9fa48("11175"), 'No active application session'));
              }
            }
          }
        } catch (error) {
          if (stryMutAct_9fa48("11176")) {
            {}
          } else {
            stryCov_9fa48("11176");
            console.error(stryMutAct_9fa48("11177") ? "" : (stryCov_9fa48("11177"), 'Error submitting application:'), error);
            await Swal.fire(stryMutAct_9fa48("11178") ? {} : (stryCov_9fa48("11178"), {
              icon: stryMutAct_9fa48("11179") ? "" : (stryCov_9fa48("11179"), 'error'),
              title: stryMutAct_9fa48("11180") ? "" : (stryCov_9fa48("11180"), 'Submission Failed'),
              text: stryMutAct_9fa48("11181") ? "" : (stryCov_9fa48("11181"), 'Error submitting application. Please try again.'),
              confirmButtonColor: stryMutAct_9fa48("11182") ? "" : (stryCov_9fa48("11182"), '#4242ea'),
              background: stryMutAct_9fa48("11183") ? "" : (stryCov_9fa48("11183"), 'var(--color-background-dark)'),
              color: stryMutAct_9fa48("11184") ? "" : (stryCov_9fa48("11184"), 'var(--color-text-primary)'),
              confirmButtonText: stryMutAct_9fa48("11185") ? "" : (stryCov_9fa48("11185"), 'Try Again')
            }));
          }
        } finally {
          if (stryMutAct_9fa48("11186")) {
            {}
          } else {
            stryCov_9fa48("11186");
            setIsSubmitting(stryMutAct_9fa48("11187") ? true : (stryCov_9fa48("11187"), false));
          }
        }
      }
    };

    // Check if current section is the eligibility section (section ID 'your_eligibility')
    const isEligibilitySection = () => {
      if (stryMutAct_9fa48("11188")) {
        {}
      } else {
        stryCov_9fa48("11188");
        if (stryMutAct_9fa48("11191") ? false : stryMutAct_9fa48("11190") ? true : stryMutAct_9fa48("11189") ? applicationQuestions[currentSection] : (stryCov_9fa48("11189", "11190", "11191"), !applicationQuestions[currentSection])) return stryMutAct_9fa48("11192") ? true : (stryCov_9fa48("11192"), false);
        return stryMutAct_9fa48("11195") ? applicationQuestions[currentSection].id !== 'your_eligibility' : stryMutAct_9fa48("11194") ? false : stryMutAct_9fa48("11193") ? true : (stryCov_9fa48("11193", "11194", "11195"), applicationQuestions[currentSection].id === (stryMutAct_9fa48("11196") ? "" : (stryCov_9fa48("11196"), 'your_eligibility')));
      }
    };

    // Check eligibility
    const checkEligibility = async () => {
      if (stryMutAct_9fa48("11197")) {
        {}
      } else {
        stryCov_9fa48("11197");
        try {
          if (stryMutAct_9fa48("11198")) {
            {}
          } else {
            stryCov_9fa48("11198");
            console.log(stryMutAct_9fa48("11199") ? "" : (stryCov_9fa48("11199"), '=== checkEligibility DEBUG ==='));
            console.log(stryMutAct_9fa48("11200") ? "" : (stryCov_9fa48("11200"), 'Current session:'), currentSession);
            console.log(stryMutAct_9fa48("11201") ? "" : (stryCov_9fa48("11201"), 'Applicant ID:'), stryMutAct_9fa48("11203") ? currentSession.applicant?.applicant_id : stryMutAct_9fa48("11202") ? currentSession?.applicant.applicant_id : (stryCov_9fa48("11202", "11203"), currentSession?.applicant?.applicant_id));
            console.log(stryMutAct_9fa48("11204") ? "" : (stryCov_9fa48("11204"), 'Form data being sent:'), formData);
            if (stryMutAct_9fa48("11207") ? false : stryMutAct_9fa48("11206") ? true : stryMutAct_9fa48("11205") ? currentSession?.applicant?.applicant_id : (stryCov_9fa48("11205", "11206", "11207"), !(stryMutAct_9fa48("11209") ? currentSession.applicant?.applicant_id : stryMutAct_9fa48("11208") ? currentSession?.applicant.applicant_id : (stryCov_9fa48("11208", "11209"), currentSession?.applicant?.applicant_id)))) {
              if (stryMutAct_9fa48("11210")) {
                {}
              } else {
                stryCov_9fa48("11210");
                console.warn(stryMutAct_9fa48("11211") ? "" : (stryCov_9fa48("11211"), 'No applicant ID available for eligibility check'));
                return stryMutAct_9fa48("11212") ? false : (stryCov_9fa48("11212"), true); // Allow to continue if we can't check
              }
            }
            console.log(stryMutAct_9fa48("11213") ? "" : (stryCov_9fa48("11213"), 'Calling databaseService.checkEligibility...'));
            const eligibilityResults = await databaseService.checkEligibility(formData, currentSession.applicant.applicant_id);
            console.log(stryMutAct_9fa48("11214") ? "" : (stryCov_9fa48("11214"), 'Eligibility results received:'), eligibilityResults);
            if (stryMutAct_9fa48("11217") ? false : stryMutAct_9fa48("11216") ? true : stryMutAct_9fa48("11215") ? eligibilityResults.isEligible : (stryCov_9fa48("11215", "11216", "11217"), !eligibilityResults.isEligible)) {
              if (stryMutAct_9fa48("11218")) {
                {}
              } else {
                stryCov_9fa48("11218");
                console.log(stryMutAct_9fa48("11219") ? "" : (stryCov_9fa48("11219"), 'User is ineligible, showing modal'));
                console.log(stryMutAct_9fa48("11220") ? "" : (stryCov_9fa48("11220"), 'Failed criteria:'), eligibilityResults.failedCriteria);
                setIsIneligible(stryMutAct_9fa48("11221") ? false : (stryCov_9fa48("11221"), true));
                setEligibilityFailures(stryMutAct_9fa48("11224") ? eligibilityResults.failedCriteria && [] : stryMutAct_9fa48("11223") ? false : stryMutAct_9fa48("11222") ? true : (stryCov_9fa48("11222", "11223", "11224"), eligibilityResults.failedCriteria || (stryMutAct_9fa48("11225") ? ["Stryker was here"] : (stryCov_9fa48("11225"), []))));

                // Set application status to ineligible
                localStorage.setItem(stryMutAct_9fa48("11226") ? "" : (stryCov_9fa48("11226"), 'applicationStatus'), stryMutAct_9fa48("11227") ? "" : (stryCov_9fa48("11227"), 'ineligible'));
                return stryMutAct_9fa48("11228") ? true : (stryCov_9fa48("11228"), false);
              }
            }
            console.log(stryMutAct_9fa48("11229") ? "" : (stryCov_9fa48("11229"), 'User is eligible, continuing navigation'));
            return stryMutAct_9fa48("11230") ? false : (stryCov_9fa48("11230"), true);
          }
        } catch (error) {
          if (stryMutAct_9fa48("11231")) {
            {}
          } else {
            stryCov_9fa48("11231");
            console.error(stryMutAct_9fa48("11232") ? "" : (stryCov_9fa48("11232"), 'Error checking eligibility:'), error);
            // On error, allow user to continue rather than block them
            return stryMutAct_9fa48("11233") ? false : (stryCov_9fa48("11233"), true);
          }
        }
      }
    };

    // Handle modal close - navigate back to dashboard
    const handleIneligibleModalClose = () => {
      if (stryMutAct_9fa48("11234")) {
        {}
      } else {
        stryCov_9fa48("11234");
        setIsIneligible(stryMutAct_9fa48("11235") ? true : (stryCov_9fa48("11235"), false));
        navigate(stryMutAct_9fa48("11236") ? "" : (stryCov_9fa48("11236"), '/apply'));
      }
    };

    // Handle starting the application from intro
    const handleBeginApplication = () => {
      if (stryMutAct_9fa48("11237")) {
        {}
      } else {
        stryCov_9fa48("11237");
        setCurrentSection(0);
        setCurrentQuestionIndex(0);
      }
    };

    // Helper function to render question label with inline links
    const renderQuestionLabel = question => {
      if (stryMutAct_9fa48("11238")) {
        {}
      } else {
        stryCov_9fa48("11238");
        if (stryMutAct_9fa48("11241") ? question.link || question.link.replaceInLabel : stryMutAct_9fa48("11240") ? false : stryMutAct_9fa48("11239") ? true : (stryCov_9fa48("11239", "11240", "11241"), question.link && question.link.replaceInLabel)) {
          if (stryMutAct_9fa48("11242")) {
            {}
          } else {
            stryCov_9fa48("11242");
            // Replace the link text in the label with an actual clickable link
            const parts = question.label.split(question.link.text);
            return <>
          {stryMutAct_9fa48("11245") ? parts[0]?.trimEnd() && '' : stryMutAct_9fa48("11244") ? false : stryMutAct_9fa48("11243") ? true : (stryCov_9fa48("11243", "11244", "11245"), (stryMutAct_9fa48("11247") ? parts[0].trimEnd() : stryMutAct_9fa48("11246") ? parts[0]?.trimStart() : (stryCov_9fa48("11246", "11247"), parts[0]?.trimEnd())) || (stryMutAct_9fa48("11248") ? "Stryker was here!" : (stryCov_9fa48("11248"), '')))}
          <a href={question.link.url} target="_blank" rel="noopener noreferrer" style={stryMutAct_9fa48("11249") ? {} : (stryCov_9fa48("11249"), {
                color: stryMutAct_9fa48("11250") ? "" : (stryCov_9fa48("11250"), 'var(--color-primary)'),
                textDecoration: stryMutAct_9fa48("11251") ? "" : (stryCov_9fa48("11251"), 'none')
              })}>
            {question.link.text}
          </a>
          {stryMutAct_9fa48("11254") ? parts[1]?.trimStart() && '' : stryMutAct_9fa48("11253") ? false : stryMutAct_9fa48("11252") ? true : (stryCov_9fa48("11252", "11253", "11254"), (stryMutAct_9fa48("11256") ? parts[1].trimStart() : stryMutAct_9fa48("11255") ? parts[1]?.trimEnd() : (stryCov_9fa48("11255", "11256"), parts[1]?.trimStart())) || (stryMutAct_9fa48("11257") ? "Stryker was here!" : (stryCov_9fa48("11257"), '')))}
        </>;
          }
        } else {
          if (stryMutAct_9fa48("11258")) {
            {}
          } else {
            stryCov_9fa48("11258");
            // Regular label + separate link
            return <>
          {question.label}
          {stryMutAct_9fa48("11261") ? question.link || <a href={question.link.url} target="_blank" rel="noopener noreferrer">
              {question.link.text}
            </a> : stryMutAct_9fa48("11260") ? false : stryMutAct_9fa48("11259") ? true : (stryCov_9fa48("11259", "11260", "11261"), question.link && <a href={question.link.url} target="_blank" rel="noopener noreferrer">
              {question.link.text}
            </a>)}
        </>;
          }
        }
      }
    };

    // Render different input types
    const renderQuestion = question => {
      if (stryMutAct_9fa48("11262")) {
        {}
      } else {
        stryCov_9fa48("11262");
        const hasError = stryMutAct_9fa48("11265") ? showValidation || validationErrors[question.id] : stryMutAct_9fa48("11264") ? false : stryMutAct_9fa48("11263") ? true : (stryCov_9fa48("11263", "11264", "11265"), showValidation && validationErrors[question.id]);
        const commonProps = stryMutAct_9fa48("11266") ? {} : (stryCov_9fa48("11266"), {
          id: question.id,
          value: stryMutAct_9fa48("11269") ? formData[question.id] && '' : stryMutAct_9fa48("11268") ? false : stryMutAct_9fa48("11267") ? true : (stryCov_9fa48("11267", "11268", "11269"), formData[question.id] || (stryMutAct_9fa48("11270") ? "Stryker was here!" : (stryCov_9fa48("11270"), ''))),
          onChange: stryMutAct_9fa48("11271") ? () => undefined : (stryCov_9fa48("11271"), e => handleInputChange(question.id, e.target.value)),
          required: question.required,
          className: stryMutAct_9fa48("11272") ? `` : (stryCov_9fa48("11272"), `application-form__input ${hasError ? stryMutAct_9fa48("11273") ? "" : (stryCov_9fa48("11273"), 'application-form__input--error') : stryMutAct_9fa48("11274") ? "Stryker was here!" : (stryCov_9fa48("11274"), '')}`)
        });

        // Address question with Google Maps
        if (stryMutAct_9fa48("11277") ? question.label || question.label.toLowerCase().includes('address') : stryMutAct_9fa48("11276") ? false : stryMutAct_9fa48("11275") ? true : (stryCov_9fa48("11275", "11276", "11277"), question.label && (stryMutAct_9fa48("11278") ? question.label.toUpperCase().includes('address') : (stryCov_9fa48("11278"), question.label.toLowerCase().includes(stryMutAct_9fa48("11279") ? "" : (stryCov_9fa48("11279"), 'address')))))) {
          if (stryMutAct_9fa48("11280")) {
            {}
          } else {
            stryCov_9fa48("11280");
            return <AddressAutocomplete value={stryMutAct_9fa48("11283") ? formData[question.id] && '' : stryMutAct_9fa48("11282") ? false : stryMutAct_9fa48("11281") ? true : (stryCov_9fa48("11281", "11282", "11283"), formData[question.id] || (stryMutAct_9fa48("11284") ? "Stryker was here!" : (stryCov_9fa48("11284"), '')))} onChange={stryMutAct_9fa48("11285") ? () => undefined : (stryCov_9fa48("11285"), value => handleInputChange(question.id, value))} placeholder="Enter your address" required={question.required} className={hasError ? stryMutAct_9fa48("11286") ? "" : (stryCov_9fa48("11286"), 'application-form__input--error') : stryMutAct_9fa48("11287") ? "Stryker was here!" : (stryCov_9fa48("11287"), '')} />;
          }
        }
        switch (question.type) {
          case stryMutAct_9fa48("11289") ? "" : (stryCov_9fa48("11289"), 'textarea'):
            if (stryMutAct_9fa48("11288")) {} else {
              stryCov_9fa48("11288");
              return <div className="application-form__long-text-container">
          <textarea {...commonProps} rows={12} className={stryMutAct_9fa48("11290") ? `` : (stryCov_9fa48("11290"), `application-form__input application-form__long-text-input ${hasError ? stryMutAct_9fa48("11291") ? "" : (stryCov_9fa48("11291"), 'application-form__input--error') : stryMutAct_9fa48("11292") ? "Stryker was here!" : (stryCov_9fa48("11292"), '')}`)} placeholder={stryMutAct_9fa48("11295") ? question.placeholder && "Please provide your response..." : stryMutAct_9fa48("11294") ? false : stryMutAct_9fa48("11293") ? true : (stryCov_9fa48("11293", "11294", "11295"), question.placeholder || (stryMutAct_9fa48("11296") ? "" : (stryCov_9fa48("11296"), "Please provide your response...")))} maxLength={2000} />
            <div className="application-form__long-text-counter">
              {(stryMutAct_9fa48("11299") ? formData[question.id] && '' : stryMutAct_9fa48("11298") ? false : stryMutAct_9fa48("11297") ? true : (stryCov_9fa48("11297", "11298", "11299"), formData[question.id] || (stryMutAct_9fa48("11300") ? "Stryker was here!" : (stryCov_9fa48("11300"), '')))).length} / 2000 characters
          </div>
        </div>;
            }
          case stryMutAct_9fa48("11302") ? "" : (stryCov_9fa48("11302"), 'radio'):
            if (stryMutAct_9fa48("11301")) {} else {
              stryCov_9fa48("11301");
              // Use dropdown if more than 6 options, otherwise use radio buttons
              if (stryMutAct_9fa48("11305") ? question.options || question.options.length > 6 : stryMutAct_9fa48("11304") ? false : stryMutAct_9fa48("11303") ? true : (stryCov_9fa48("11303", "11304", "11305"), question.options && (stryMutAct_9fa48("11308") ? question.options.length <= 6 : stryMutAct_9fa48("11307") ? question.options.length >= 6 : stryMutAct_9fa48("11306") ? true : (stryCov_9fa48("11306", "11307", "11308"), question.options.length > 6)))) {
                if (stryMutAct_9fa48("11309")) {
                  {}
                } else {
                  stryCov_9fa48("11309");
                  return <select {...commonProps} value={stryMutAct_9fa48("11312") ? formData[question.id] && '' : stryMutAct_9fa48("11311") ? false : stryMutAct_9fa48("11310") ? true : (stryCov_9fa48("11310", "11311", "11312"), formData[question.id] || (stryMutAct_9fa48("11313") ? "Stryker was here!" : (stryCov_9fa48("11313"), '')))} onChange={stryMutAct_9fa48("11314") ? () => undefined : (stryCov_9fa48("11314"), e => handleInputChange(question.id, e.target.value))}>
              <option value="">Please select...</option>
              {question.options.map(stryMutAct_9fa48("11315") ? () => undefined : (stryCov_9fa48("11315"), option => <option key={option} value={option}>{option}</option>))}
          </select>;
                }
              } else {
                if (stryMutAct_9fa48("11316")) {
                  {}
                } else {
                  stryCov_9fa48("11316");
                  return <div className="application-form__radio-group">
              {stryMutAct_9fa48("11319") ? question.options || question.options.map(option => <label key={option} className="application-form__radio-option">
                  <input type="radio" name={question.id} value={option} checked={formData[question.id] === option} onChange={e => handleInputChange(question.id, e.target.value)} required={question.required} />
                  {option}
                </label>) : stryMutAct_9fa48("11318") ? false : stryMutAct_9fa48("11317") ? true : (stryCov_9fa48("11317", "11318", "11319"), question.options && question.options.map(stryMutAct_9fa48("11320") ? () => undefined : (stryCov_9fa48("11320"), option => <label key={option} className="application-form__radio-option">
                  <input type="radio" name={question.id} value={option} checked={stryMutAct_9fa48("11323") ? formData[question.id] !== option : stryMutAct_9fa48("11322") ? false : stryMutAct_9fa48("11321") ? true : (stryCov_9fa48("11321", "11322", "11323"), formData[question.id] === option)} onChange={stryMutAct_9fa48("11324") ? () => undefined : (stryCov_9fa48("11324"), e => handleInputChange(question.id, e.target.value))} required={question.required} />
                  {option}
                </label>)))}
            </div>;
                }
              }
            }
          case stryMutAct_9fa48("11326") ? "" : (stryCov_9fa48("11326"), 'checkbox'):
            if (stryMutAct_9fa48("11325")) {} else {
              stryCov_9fa48("11325");
              return <div className={stryMutAct_9fa48("11327") ? `` : (stryCov_9fa48("11327"), `application-form__checkbox-group ${hasError ? stryMutAct_9fa48("11328") ? "" : (stryCov_9fa48("11328"), 'application-form__checkbox-group--error') : stryMutAct_9fa48("11329") ? "Stryker was here!" : (stryCov_9fa48("11329"), '')}`)}>
            {stryMutAct_9fa48("11332") ? question.options || question.options.map(option => <label key={option} className="application-form__checkbox-option">
                <input type="checkbox" name={question.id} value={option} checked={formData[question.id]?.includes(option) || false} onChange={e => {
                    const value = e.target.value;
                    const checked = e.target.checked;
                    const currentOptions = formData[question.id] || [];
                    let newValue;
                    if (checked) {
                      newValue = [...currentOptions, value];
                    } else {
                      newValue = currentOptions.filter(item => item !== value);
                    }
                    handleInputChange(question.id, newValue);
                  }} required={question.required} />
                {option}
              </label>) : stryMutAct_9fa48("11331") ? false : stryMutAct_9fa48("11330") ? true : (stryCov_9fa48("11330", "11331", "11332"), question.options && question.options.map(stryMutAct_9fa48("11333") ? () => undefined : (stryCov_9fa48("11333"), option => <label key={option} className="application-form__checkbox-option">
                <input type="checkbox" name={question.id} value={option} checked={stryMutAct_9fa48("11336") ? formData[question.id]?.includes(option) && false : stryMutAct_9fa48("11335") ? false : stryMutAct_9fa48("11334") ? true : (stryCov_9fa48("11334", "11335", "11336"), (stryMutAct_9fa48("11337") ? formData[question.id].includes(option) : (stryCov_9fa48("11337"), formData[question.id]?.includes(option))) || (stryMutAct_9fa48("11338") ? true : (stryCov_9fa48("11338"), false)))} onChange={e => {
                    if (stryMutAct_9fa48("11339")) {
                      {}
                    } else {
                      stryCov_9fa48("11339");
                      const value = e.target.value;
                      const checked = e.target.checked;
                      const currentOptions = stryMutAct_9fa48("11342") ? formData[question.id] && [] : stryMutAct_9fa48("11341") ? false : stryMutAct_9fa48("11340") ? true : (stryCov_9fa48("11340", "11341", "11342"), formData[question.id] || (stryMutAct_9fa48("11343") ? ["Stryker was here"] : (stryCov_9fa48("11343"), [])));
                      let newValue;
                      if (stryMutAct_9fa48("11345") ? false : stryMutAct_9fa48("11344") ? true : (stryCov_9fa48("11344", "11345"), checked)) {
                        if (stryMutAct_9fa48("11346")) {
                          {}
                        } else {
                          stryCov_9fa48("11346");
                          newValue = stryMutAct_9fa48("11347") ? [] : (stryCov_9fa48("11347"), [...currentOptions, value]);
                        }
                      } else {
                        if (stryMutAct_9fa48("11348")) {
                          {}
                        } else {
                          stryCov_9fa48("11348");
                          newValue = stryMutAct_9fa48("11349") ? currentOptions : (stryCov_9fa48("11349"), currentOptions.filter(stryMutAct_9fa48("11350") ? () => undefined : (stryCov_9fa48("11350"), item => stryMutAct_9fa48("11353") ? item === value : stryMutAct_9fa48("11352") ? false : stryMutAct_9fa48("11351") ? true : (stryCov_9fa48("11351", "11352", "11353"), item !== value))));
                        }
                      }
                      handleInputChange(question.id, newValue);
                    }
                  }} required={question.required} />
                {option}
              </label>)))}
          </div>;
            }
          case stryMutAct_9fa48("11355") ? "" : (stryCov_9fa48("11355"), 'select'):
            if (stryMutAct_9fa48("11354")) {} else {
              stryCov_9fa48("11354");
              return <div className="application-form__radio-group">
            {stryMutAct_9fa48("11358") ? question.options || question.options.map(option => <label key={option} className="application-form__radio-option">
                <input type="radio" name={question.id} value={option} checked={formData[question.id] === option} onChange={e => handleInputChange(question.id, e.target.value)} required={question.required} />
                {option}
              </label>) : stryMutAct_9fa48("11357") ? false : stryMutAct_9fa48("11356") ? true : (stryCov_9fa48("11356", "11357", "11358"), question.options && question.options.map(stryMutAct_9fa48("11359") ? () => undefined : (stryCov_9fa48("11359"), option => <label key={option} className="application-form__radio-option">
                <input type="radio" name={question.id} value={option} checked={stryMutAct_9fa48("11362") ? formData[question.id] !== option : stryMutAct_9fa48("11361") ? false : stryMutAct_9fa48("11360") ? true : (stryCov_9fa48("11360", "11361", "11362"), formData[question.id] === option)} onChange={stryMutAct_9fa48("11363") ? () => undefined : (stryCov_9fa48("11363"), e => handleInputChange(question.id, e.target.value))} required={question.required} />
                {option}
              </label>)))}
          </div>;
            }
          case stryMutAct_9fa48("11365") ? "" : (stryCov_9fa48("11365"), 'date'):
            if (stryMutAct_9fa48("11364")) {} else {
              stryCov_9fa48("11364");
              return <input {...commonProps} type="date" />;
            }
          case stryMutAct_9fa48("11367") ? "" : (stryCov_9fa48("11367"), 'email'):
            if (stryMutAct_9fa48("11366")) {} else {
              stryCov_9fa48("11366");
              return <input {...commonProps} type="email" placeholder="your@email.com" />;
            }
          case stryMutAct_9fa48("11369") ? "" : (stryCov_9fa48("11369"), 'tel'):
            if (stryMutAct_9fa48("11368")) {} else {
              stryCov_9fa48("11368");
              return <input {...commonProps} type="tel" placeholder="(555) 123-4567" />;
            }
          case stryMutAct_9fa48("11371") ? "" : (stryCov_9fa48("11371"), 'number'):
            if (stryMutAct_9fa48("11370")) {} else {
              stryCov_9fa48("11370");
              return <input {...commonProps} type="number" placeholder="Enter a number" />;
            }
          case stryMutAct_9fa48("11373") ? "" : (stryCov_9fa48("11373"), 'info'):
            if (stryMutAct_9fa48("11372")) {} else {
              stryCov_9fa48("11372");
              // For info cards - display content without input fields
              return <div className="application-form__info-card">
            <div className="application-form__info-card-content">
              {question.label.split(stryMutAct_9fa48("11374") ? "" : (stryCov_9fa48("11374"), '\n')).map(stryMutAct_9fa48("11375") ? () => undefined : (stryCov_9fa48("11375"), (line, index) => <p key={index}>{line}</p>))}
            </div>
          </div>;
            }
          default:
            if (stryMutAct_9fa48("11376")) {} else {
              stryCov_9fa48("11376");
              return <input {...commonProps} type="text" placeholder={stryMutAct_9fa48("11379") ? question.placeholder && "Enter your response" : stryMutAct_9fa48("11378") ? false : stryMutAct_9fa48("11377") ? true : (stryCov_9fa48("11377", "11378", "11379"), question.placeholder || (stryMutAct_9fa48("11380") ? "" : (stryCov_9fa48("11380"), "Enter your response")))} />;
            }
        }
      }
    };

    // Loading state
    if (stryMutAct_9fa48("11382") ? false : stryMutAct_9fa48("11381") ? true : (stryCov_9fa48("11381", "11382"), isLoading)) {
      if (stryMutAct_9fa48("11383")) {
        {}
      } else {
        stryCov_9fa48("11383");
        return <div className="admissions-dashboard">
        <div className="application-form__loading-state">
          <h2>Loading Application...</h2>
          <p>Please wait while we prepare your application form.</p>
        </div>
      </div>;
      }
    }

    // Error state
    if (stryMutAct_9fa48("11385") ? false : stryMutAct_9fa48("11384") ? true : (stryCov_9fa48("11384", "11385"), error)) {
      if (stryMutAct_9fa48("11386")) {
        {}
      } else {
        stryCov_9fa48("11386");
        return <div className="admissions-dashboard">
        <div className="application-form__error-state">
          <h2>Error Loading Application</h2>
          <p>{error}</p>
          <button onClick={stryMutAct_9fa48("11387") ? () => undefined : (stryCov_9fa48("11387"), () => window.location.reload())}>Retry</button>
        </div>
      </div>;
      }
    }

    // No questions available
    if (stryMutAct_9fa48("11390") ? applicationQuestions.length !== 0 : stryMutAct_9fa48("11389") ? false : stryMutAct_9fa48("11388") ? true : (stryCov_9fa48("11388", "11389", "11390"), applicationQuestions.length === 0)) {
      if (stryMutAct_9fa48("11391")) {
        {}
      } else {
        stryCov_9fa48("11391");
        return <div className="admissions-dashboard">
        <div className="application-form__error-state">
          <h2>No Questions Available</h2>
          <p>There are no application questions available at this time.</p>
          <button onClick={stryMutAct_9fa48("11392") ? () => undefined : (stryCov_9fa48("11392"), () => navigate(stryMutAct_9fa48("11393") ? "" : (stryCov_9fa48("11393"), '/apply')))}>Back to Dashboard</button>
        </div>
      </div>;
      }
    }
    const currentQuestions = getCurrentQuestions();
    const currentSectionData = applicationQuestions[currentSection];

    // Get completed questions count for a specific section (only root questions)
    const getCompletedQuestionsInSection = sectionQuestions => {
      if (stryMutAct_9fa48("11394")) {
        {}
      } else {
        stryCov_9fa48("11394");
        const rootQuestions = stryMutAct_9fa48("11395") ? sectionQuestions : (stryCov_9fa48("11395"), sectionQuestions.filter(stryMutAct_9fa48("11396") ? () => undefined : (stryCov_9fa48("11396"), q => stryMutAct_9fa48("11397") ? q.parentQuestionId : (stryCov_9fa48("11397"), !q.parentQuestionId))));
        const visibleRootQuestions = stryMutAct_9fa48("11398") ? rootQuestions : (stryCov_9fa48("11398"), rootQuestions.filter(shouldShowQuestion));
        return stryMutAct_9fa48("11399") ? visibleRootQuestions.length : (stryCov_9fa48("11399"), visibleRootQuestions.filter(question => {
          if (stryMutAct_9fa48("11400")) {
            {}
          } else {
            stryCov_9fa48("11400");
            const value = formData[question.id];
            return stryMutAct_9fa48("11403") ? value !== null && value !== undefined && value !== '' || !(Array.isArray(value) && value.length === 0) : stryMutAct_9fa48("11402") ? false : stryMutAct_9fa48("11401") ? true : (stryCov_9fa48("11401", "11402", "11403"), (stryMutAct_9fa48("11405") ? value !== null && value !== undefined || value !== '' : stryMutAct_9fa48("11404") ? true : (stryCov_9fa48("11404", "11405"), (stryMutAct_9fa48("11407") ? value !== null || value !== undefined : stryMutAct_9fa48("11406") ? true : (stryCov_9fa48("11406", "11407"), (stryMutAct_9fa48("11409") ? value === null : stryMutAct_9fa48("11408") ? true : (stryCov_9fa48("11408", "11409"), value !== null)) && (stryMutAct_9fa48("11411") ? value === undefined : stryMutAct_9fa48("11410") ? true : (stryCov_9fa48("11410", "11411"), value !== undefined)))) && (stryMutAct_9fa48("11413") ? value === '' : stryMutAct_9fa48("11412") ? true : (stryCov_9fa48("11412", "11413"), value !== (stryMutAct_9fa48("11414") ? "Stryker was here!" : (stryCov_9fa48("11414"), '')))))) && (stryMutAct_9fa48("11415") ? Array.isArray(value) && value.length === 0 : (stryCov_9fa48("11415"), !(stryMutAct_9fa48("11418") ? Array.isArray(value) || value.length === 0 : stryMutAct_9fa48("11417") ? false : stryMutAct_9fa48("11416") ? true : (stryCov_9fa48("11416", "11417", "11418"), Array.isArray(value) && (stryMutAct_9fa48("11420") ? value.length !== 0 : stryMutAct_9fa48("11419") ? true : (stryCov_9fa48("11419", "11420"), value.length === 0)))))));
          }
        }).length);
      }
    };

    // Get current question info within its section (only count root questions)
    const getCurrentQuestionInfo = () => {
      if (stryMutAct_9fa48("11421")) {
        {}
      } else {
        stryCov_9fa48("11421");
        const currentQuestionGroup = getCurrentQuestions();
        if (stryMutAct_9fa48("11424") ? false : stryMutAct_9fa48("11423") ? true : stryMutAct_9fa48("11422") ? currentQuestionGroup.rootQuestion : (stryCov_9fa48("11422", "11423", "11424"), !currentQuestionGroup.rootQuestion)) {
          if (stryMutAct_9fa48("11425")) {
            {}
          } else {
            stryCov_9fa48("11425");
            return stryMutAct_9fa48("11426") ? {} : (stryCov_9fa48("11426"), {
              sectionName: stryMutAct_9fa48("11427") ? "Stryker was here!" : (stryCov_9fa48("11427"), ''),
              questionNumber: 1,
              totalInSection: 1
            });
          }
        }
        const currentQuestion = currentQuestionGroup.rootQuestion;
        const sectionQuestions = stryMutAct_9fa48("11430") ? applicationQuestions[currentQuestion.sectionIndex]?.questions && [] : stryMutAct_9fa48("11429") ? false : stryMutAct_9fa48("11428") ? true : (stryCov_9fa48("11428", "11429", "11430"), (stryMutAct_9fa48("11431") ? applicationQuestions[currentQuestion.sectionIndex].questions : (stryCov_9fa48("11431"), applicationQuestions[currentQuestion.sectionIndex]?.questions)) || (stryMutAct_9fa48("11432") ? ["Stryker was here"] : (stryCov_9fa48("11432"), [])));
        const rootQuestions = stryMutAct_9fa48("11433") ? sectionQuestions : (stryCov_9fa48("11433"), sectionQuestions.filter(stryMutAct_9fa48("11434") ? () => undefined : (stryCov_9fa48("11434"), q => stryMutAct_9fa48("11435") ? q.parentQuestionId : (stryCov_9fa48("11435"), !q.parentQuestionId))));
        const visibleRootQuestions = stryMutAct_9fa48("11436") ? rootQuestions : (stryCov_9fa48("11436"), rootQuestions.filter(shouldShowQuestion));

        // Find the position of the current question within the visible root questions
        const questionPosition = stryMutAct_9fa48("11437") ? visibleRootQuestions.findIndex(q => q.id === currentQuestion.id) - 1 : (stryCov_9fa48("11437"), visibleRootQuestions.findIndex(stryMutAct_9fa48("11438") ? () => undefined : (stryCov_9fa48("11438"), q => stryMutAct_9fa48("11441") ? q.id !== currentQuestion.id : stryMutAct_9fa48("11440") ? false : stryMutAct_9fa48("11439") ? true : (stryCov_9fa48("11439", "11440", "11441"), q.id === currentQuestion.id))) + 1);
        return stryMutAct_9fa48("11442") ? {} : (stryCov_9fa48("11442"), {
          sectionName: stryMutAct_9fa48("11445") ? currentQuestion.sectionTitle && '' : stryMutAct_9fa48("11444") ? false : stryMutAct_9fa48("11443") ? true : (stryCov_9fa48("11443", "11444", "11445"), currentQuestion.sectionTitle || (stryMutAct_9fa48("11446") ? "Stryker was here!" : (stryCov_9fa48("11446"), ''))),
          questionNumber: questionPosition,
          totalInSection: visibleRootQuestions.length
        });
      }
    };

    // Check if user is ineligible and redirect
    if (stryMutAct_9fa48("11449") ? currentSession?.application?.status !== 'ineligible' : stryMutAct_9fa48("11448") ? false : stryMutAct_9fa48("11447") ? true : (stryCov_9fa48("11447", "11448", "11449"), (stryMutAct_9fa48("11451") ? currentSession.application?.status : stryMutAct_9fa48("11450") ? currentSession?.application.status : (stryCov_9fa48("11450", "11451"), currentSession?.application?.status)) === (stryMutAct_9fa48("11452") ? "" : (stryCov_9fa48("11452"), 'ineligible')))) {
      if (stryMutAct_9fa48("11453")) {
        {}
      } else {
        stryCov_9fa48("11453");
        console.log(stryMutAct_9fa48("11454") ? "" : (stryCov_9fa48("11454"), 'Application is ineligible, redirecting to dashboard'));
        localStorage.setItem(stryMutAct_9fa48("11455") ? "" : (stryCov_9fa48("11455"), 'applicationStatus'), stryMutAct_9fa48("11456") ? "" : (stryCov_9fa48("11456"), 'ineligible'));
        navigate(stryMutAct_9fa48("11457") ? "" : (stryCov_9fa48("11457"), '/apply'));
        return null;
      }
    }
    return <div className="admissions-dashboard">
      {/* Top Bar */}
      <div className="admissions-dashboard__topbar">
        <div className="admissions-dashboard__topbar-left">
          <div className="admissions-dashboard__logo-section">
            <img src="/logo-full.png" alt="Pursuit Logo" className="admissions-dashboard__logo-full" />
          </div>
          {stryMutAct_9fa48("11460") ? currentSession || <div className="admissions-dashboard__welcome-text">
              Welcome, {currentSession.applicant.first_name}
          </div> : stryMutAct_9fa48("11459") ? false : stryMutAct_9fa48("11458") ? true : (stryCov_9fa48("11458", "11459", "11460"), currentSession && <div className="admissions-dashboard__welcome-text">
              Welcome, {currentSession.applicant.first_name}
          </div>)}
        </div>
        <div className="admissions-dashboard__topbar-right">
          <button onClick={stryMutAct_9fa48("11461") ? () => undefined : (stryCov_9fa48("11461"), () => navigate(stryMutAct_9fa48("11462") ? "" : (stryCov_9fa48("11462"), '/apply')))} className="admissions-dashboard__button--secondary">
            ← Back to Dashboard
          </button>
          <button onClick={handleLogout} className="admissions-dashboard__button--primary">
            Log Out
          </button>
        </div>
      </div>

      {/* Main Content - Single Column Layout */}
      <div className="application-form__main">
        {/* Form Content - Full Width */}
        <div className="application-form__column">
          {/* Section Navigation - Moved here from left sidebar */}
          <div className="section-nav">
            {/* Intro Tab */}
            <div className={stryMutAct_9fa48("11463") ? `` : (stryCov_9fa48("11463"), `section-nav__item ${(stryMutAct_9fa48("11466") ? currentSection !== -1 : stryMutAct_9fa48("11465") ? false : stryMutAct_9fa48("11464") ? true : (stryCov_9fa48("11464", "11465", "11466"), currentSection === (stryMutAct_9fa48("11467") ? +1 : (stryCov_9fa48("11467"), -1)))) ? stryMutAct_9fa48("11468") ? "" : (stryCov_9fa48("11468"), 'section-nav__item--active') : stryMutAct_9fa48("11469") ? "Stryker was here!" : (stryCov_9fa48("11469"), '')}`)} onClick={stryMutAct_9fa48("11470") ? () => undefined : (stryCov_9fa48("11470"), () => navigateToSection(stryMutAct_9fa48("11471") ? +1 : (stryCov_9fa48("11471"), -1)))} style={stryMutAct_9fa48("11472") ? {} : (stryCov_9fa48("11472"), {
              cursor: stryMutAct_9fa48("11473") ? "" : (stryCov_9fa48("11473"), 'pointer')
            })}>
              <span className="section-nav__title">
                0. INTRODUCTION
              </span>
              <span className="section-nav__progress">
                
              </span>
        </div>

            {/* Form Section Tabs */}
            {applicationQuestions.map((section, index) => {
              if (stryMutAct_9fa48("11474")) {
                {}
              } else {
                stryCov_9fa48("11474");
                const sectionQuestions = stryMutAct_9fa48("11477") ? section.questions && [] : stryMutAct_9fa48("11476") ? false : stryMutAct_9fa48("11475") ? true : (stryCov_9fa48("11475", "11476", "11477"), section.questions || (stryMutAct_9fa48("11478") ? ["Stryker was here"] : (stryCov_9fa48("11478"), [])));
                const rootQuestions = stryMutAct_9fa48("11479") ? sectionQuestions : (stryCov_9fa48("11479"), sectionQuestions.filter(stryMutAct_9fa48("11480") ? () => undefined : (stryCov_9fa48("11480"), q => stryMutAct_9fa48("11481") ? q.parentQuestionId : (stryCov_9fa48("11481"), !q.parentQuestionId))));
                const visibleRootQuestions = stryMutAct_9fa48("11482") ? rootQuestions : (stryCov_9fa48("11482"), rootQuestions.filter(shouldShowQuestion));
                const completedCount = getCompletedQuestionsInSection(sectionQuestions);
                const totalCount = visibleRootQuestions.length;
                return <div key={section.id} className={stryMutAct_9fa48("11483") ? `` : (stryCov_9fa48("11483"), `section-nav__item ${(stryMutAct_9fa48("11486") ? index !== currentSection : stryMutAct_9fa48("11485") ? false : stryMutAct_9fa48("11484") ? true : (stryCov_9fa48("11484", "11485", "11486"), index === currentSection)) ? stryMutAct_9fa48("11487") ? "" : (stryCov_9fa48("11487"), 'section-nav__item--active') : stryMutAct_9fa48("11488") ? "Stryker was here!" : (stryCov_9fa48("11488"), '')}`)} onClick={stryMutAct_9fa48("11489") ? () => undefined : (stryCov_9fa48("11489"), () => navigateToSection(index))} style={stryMutAct_9fa48("11490") ? {} : (stryCov_9fa48("11490"), {
                  cursor: stryMutAct_9fa48("11491") ? "" : (stryCov_9fa48("11491"), 'pointer')
                })}>
                  <span className="section-nav__title">
                    {stryMutAct_9fa48("11492") ? index - 1 : (stryCov_9fa48("11492"), index + 1)}. {section.title}
                  </span>
                  <span className="section-nav__progress">
                    {completedCount} / {totalCount}
                  </span>
                </div>;
              }
            })}
            </div>

          <div className="application-form">
            {/* Show intro content when on intro tab */}
            {(stryMutAct_9fa48("11495") ? currentSection !== -1 : stryMutAct_9fa48("11494") ? false : stryMutAct_9fa48("11493") ? true : (stryCov_9fa48("11493", "11494", "11495"), currentSection === (stryMutAct_9fa48("11496") ? +1 : (stryCov_9fa48("11496"), -1)))) ? <div className="application-form__intro-tab">
                <div className="application-form__intro-tab-content">
                  <h2 className="application-form__intro-tab-title">WELCOME TO YOUR AI-NATIVE APPLICATION!</h2>
                  <div className="application-form__intro-tab-description">
                    <p className="first-paragraph"><strong>The goal of this program is to train AI-natives. It's about approaching problems using AI first, knowing how to engage with it effectively, and being comfortable adapting as the technology evolves.</strong></p>

                    <p><strong>No coding experience is required.</strong></p>
                    
                    <p>If you're open to learning, excited by new ideas, and eager to explore the potential of AI, this program is for you.</p>
                    
                    <p>We highly encourage communities underrepresented in tech and those without college degrees to apply.</p>
                  </div>
                  
                  <div className="application-form__intro-tab-actions">
                    <button onClick={handleBeginApplication} className="application-form__intro-button" type="button">
                      Begin Application
                    </button>
                  </div>
                </div>
              </div> : <form onSubmit={handleSubmit}>
              <div className="application-form__form-section">
                  <h2 className="application-form__form-section-title">
                  {(() => {
                    if (stryMutAct_9fa48("11497")) {
                      {}
                    } else {
                      stryCov_9fa48("11497");
                      const questionInfo = getCurrentQuestionInfo();
                      return <>
                        {questionInfo.sectionName}
                          <span className="application-form__question-counter">
                          Question {questionInfo.questionNumber} of {questionInfo.totalInSection}
                        </span>
                      </>;
                    }
                  })()}
                </h2>
                
                {(() => {
                  if (stryMutAct_9fa48("11498")) {
                    {}
                  } else {
                    stryCov_9fa48("11498");
                    const currentQuestionGroup = getCurrentQuestions();
                    if (stryMutAct_9fa48("11501") ? false : stryMutAct_9fa48("11500") ? true : stryMutAct_9fa48("11499") ? currentQuestionGroup.rootQuestion : (stryCov_9fa48("11499", "11500", "11501"), !currentQuestionGroup.rootQuestion)) {
                      if (stryMutAct_9fa48("11502")) {
                        {}
                      } else {
                        stryCov_9fa48("11502");
                        return <div>Loading...</div>;
                      }
                    }
                    return <>
                      {/* Root Question */}
                      {(stryMutAct_9fa48("11505") ? currentQuestionGroup.rootQuestion.type !== 'info' : stryMutAct_9fa48("11504") ? false : stryMutAct_9fa48("11503") ? true : (stryCov_9fa48("11503", "11504", "11505"), currentQuestionGroup.rootQuestion.type === (stryMutAct_9fa48("11506") ? "" : (stryCov_9fa48("11506"), 'info')))) ?
                      // Special handling for info cards - no labels or form structure
                      <div key={currentQuestionGroup.rootQuestion.id} className="application-form__question-group application-form__question-group--info">
                          {renderQuestion(currentQuestionGroup.rootQuestion)}
                        </div> : <div key={currentQuestionGroup.rootQuestion.id} className="application-form__question-group application-form__question-group--root">
                          <label htmlFor={currentQuestionGroup.rootQuestion.id} className="application-form__question-label">
                            {renderQuestionLabel(currentQuestionGroup.rootQuestion)}
                            {currentQuestionGroup.rootQuestion.required ? <span className="application-form__question-required">*</span> : <span className="application-form__question-optional">(optional)</span>}
                          </label>
                          {renderQuestion(currentQuestionGroup.rootQuestion)}
                          {stryMutAct_9fa48("11509") ? showValidation && validationErrors[currentQuestionGroup.rootQuestion.id] || <div className="application-form__validation-error">
                              {validationErrors[currentQuestionGroup.rootQuestion.id]}
                            </div> : stryMutAct_9fa48("11508") ? false : stryMutAct_9fa48("11507") ? true : (stryCov_9fa48("11507", "11508", "11509"), (stryMutAct_9fa48("11511") ? showValidation || validationErrors[currentQuestionGroup.rootQuestion.id] : stryMutAct_9fa48("11510") ? true : (stryCov_9fa48("11510", "11511"), showValidation && validationErrors[currentQuestionGroup.rootQuestion.id])) && <div className="application-form__validation-error">
                              {validationErrors[currentQuestionGroup.rootQuestion.id]}
                            </div>)}
                        </div>}

                      {/* Conditional Questions */}
                      {currentQuestionGroup.conditionalQuestions.map(stryMutAct_9fa48("11512") ? () => undefined : (stryCov_9fa48("11512"), question => (stryMutAct_9fa48("11515") ? question.type !== 'info' : stryMutAct_9fa48("11514") ? false : stryMutAct_9fa48("11513") ? true : (stryCov_9fa48("11513", "11514", "11515"), question.type === (stryMutAct_9fa48("11516") ? "" : (stryCov_9fa48("11516"), 'info')))) ?
                      // Special handling for info cards - no labels or form structure
                      <div key={question.id} className="application-form__question-group application-form__question-group--info">
                            {renderQuestion(question)}
                          </div> : <div key={question.id} className="application-form__question-group application-form__question-group--conditional">
                            <label htmlFor={question.id} className="application-form__question-label">
                              {renderQuestionLabel(question)}
                              {question.required ? <span className="application-form__question-required">*</span> : <span className="application-form__question-optional">(optional)</span>}
                            </label>
                            {renderQuestion(question)}
                            {stryMutAct_9fa48("11519") ? showValidation && validationErrors[question.id] || <div className="application-form__validation-error">
                                {validationErrors[question.id]}
                              </div> : stryMutAct_9fa48("11518") ? false : stryMutAct_9fa48("11517") ? true : (stryCov_9fa48("11517", "11518", "11519"), (stryMutAct_9fa48("11521") ? showValidation || validationErrors[question.id] : stryMutAct_9fa48("11520") ? true : (stryCov_9fa48("11520", "11521"), showValidation && validationErrors[question.id])) && <div className="application-form__validation-error">
                                {validationErrors[question.id]}
                              </div>)}
                          </div>))}
                    </>;
                  }
                })()}
              </div>
              
              {/* Navigation */}
              <div className="application-form__navigation">
                {stryMutAct_9fa48("11524") ? getCurrentQuestionGlobalIndex() > 0 || <button type="button" onClick={handlePrevious} className="application-form__nav-button application-form__nav-button--previous">
                    Previous
                  </button> : stryMutAct_9fa48("11523") ? false : stryMutAct_9fa48("11522") ? true : (stryCov_9fa48("11522", "11523", "11524"), (stryMutAct_9fa48("11527") ? getCurrentQuestionGlobalIndex() <= 0 : stryMutAct_9fa48("11526") ? getCurrentQuestionGlobalIndex() >= 0 : stryMutAct_9fa48("11525") ? true : (stryCov_9fa48("11525", "11526", "11527"), getCurrentQuestionGlobalIndex() > 0)) && <button type="button" onClick={handlePrevious} className="application-form__nav-button application-form__nav-button--previous">
                    Previous
                  </button>)}
                
                {(stryMutAct_9fa48("11531") ? getCurrentQuestionGlobalIndex() >= getAllRootQuestions().length - 1 : stryMutAct_9fa48("11530") ? getCurrentQuestionGlobalIndex() <= getAllRootQuestions().length - 1 : stryMutAct_9fa48("11529") ? false : stryMutAct_9fa48("11528") ? true : (stryCov_9fa48("11528", "11529", "11530", "11531"), getCurrentQuestionGlobalIndex() < (stryMutAct_9fa48("11532") ? getAllRootQuestions().length + 1 : (stryCov_9fa48("11532"), getAllRootQuestions().length - 1)))) ? <button type="button" onClick={handleNext} className="application-form__nav-button application-form__nav-button--next">
                    Next
                  </button> : <button type="submit" disabled={isSubmitting} className="application-form__nav-button application-form__nav-button--next">
                    {isSubmitting ? stryMutAct_9fa48("11533") ? "" : (stryCov_9fa48("11533"), 'Submitting...') : stryMutAct_9fa48("11534") ? "" : (stryCov_9fa48("11534"), 'Submit Application')}
                  </button>}
            </div>
          </form>}
          </div>
        </div>
      </div>
      
      {/* Ineligible Modal */}
      <IneligibleModal isOpen={isIneligible} onClose={handleIneligibleModalClose} failedCriteria={eligibilityFailures} />
    </div>;
  }
};
export default ApplicationForm;