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
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import './Unsubscribe.css';
const Unsubscribe = () => {
  if (stryMutAct_9fa48("27911")) {
    {}
  } else {
    stryCov_9fa48("27911");
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(stryMutAct_9fa48("27912") ? true : (stryCov_9fa48("27912"), false));
    const [applicantData, setApplicantData] = useState(null);
    const [alreadyUnsubscribed, setAlreadyUnsubscribed] = useState(stryMutAct_9fa48("27913") ? true : (stryCov_9fa48("27913"), false));
    const [error, setError] = useState(null);
    const [showConfirmation, setShowConfirmation] = useState(stryMutAct_9fa48("27914") ? true : (stryCov_9fa48("27914"), false));
    const [confirmationData, setConfirmationData] = useState(stryMutAct_9fa48("27915") ? {} : (stryCov_9fa48("27915"), {
      decision: stryMutAct_9fa48("27916") ? "Stryker was here!" : (stryCov_9fa48("27916"), ''),
      // 'unsubscribe' or 'defer'
      reason: stryMutAct_9fa48("27917") ? "Stryker was here!" : (stryCov_9fa48("27917"), ''),
      otherReason: stryMutAct_9fa48("27918") ? "Stryker was here!" : (stryCov_9fa48("27918"), '')
    }));
    const applicantId = searchParams.get(stryMutAct_9fa48("27919") ? "" : (stryCov_9fa48("27919"), 'id'));
    useEffect(() => {
      if (stryMutAct_9fa48("27920")) {
        {}
      } else {
        stryCov_9fa48("27920");
        if (stryMutAct_9fa48("27922") ? false : stryMutAct_9fa48("27921") ? true : (stryCov_9fa48("27921", "27922"), applicantId)) {
          if (stryMutAct_9fa48("27923")) {
            {}
          } else {
            stryCov_9fa48("27923");
            fetchApplicantData();
          }
        } else {
          if (stryMutAct_9fa48("27924")) {
            {}
          } else {
            stryCov_9fa48("27924");
            setError(stryMutAct_9fa48("27925") ? "" : (stryCov_9fa48("27925"), 'Invalid unsubscribe link. Missing applicant ID.'));
          }
        }
      }
    }, stryMutAct_9fa48("27926") ? [] : (stryCov_9fa48("27926"), [applicantId]));
    const fetchApplicantData = async () => {
      if (stryMutAct_9fa48("27927")) {
        {}
      } else {
        stryCov_9fa48("27927");
        try {
          if (stryMutAct_9fa48("27928")) {
            {}
          } else {
            stryCov_9fa48("27928");
            setLoading(stryMutAct_9fa48("27929") ? false : (stryCov_9fa48("27929"), true));
            const response = await fetch(stryMutAct_9fa48("27930") ? `` : (stryCov_9fa48("27930"), `${import.meta.env.VITE_API_URL}/api/applications/applicants/${applicantId}/unsubscribe-info`));
            if (stryMutAct_9fa48("27933") ? false : stryMutAct_9fa48("27932") ? true : stryMutAct_9fa48("27931") ? response.ok : (stryCov_9fa48("27931", "27932", "27933"), !response.ok)) {
              if (stryMutAct_9fa48("27934")) {
                {}
              } else {
                stryCov_9fa48("27934");
                if (stryMutAct_9fa48("27937") ? response.status !== 404 : stryMutAct_9fa48("27936") ? false : stryMutAct_9fa48("27935") ? true : (stryCov_9fa48("27935", "27936", "27937"), response.status === 404)) {
                  if (stryMutAct_9fa48("27938")) {
                    {}
                  } else {
                    stryCov_9fa48("27938");
                    setError(stryMutAct_9fa48("27939") ? "" : (stryCov_9fa48("27939"), 'Applicant not found. This unsubscribe link may be invalid.'));
                  }
                } else {
                  if (stryMutAct_9fa48("27940")) {
                    {}
                  } else {
                    stryCov_9fa48("27940");
                    setError(stryMutAct_9fa48("27941") ? "" : (stryCov_9fa48("27941"), 'Unable to load applicant information.'));
                  }
                }
                return;
              }
            }
            const data = await response.json();
            setApplicantData(data);
            setAlreadyUnsubscribed(data.email_opt_out);
          }
        } catch (error) {
          if (stryMutAct_9fa48("27942")) {
            {}
          } else {
            stryCov_9fa48("27942");
            console.error(stryMutAct_9fa48("27943") ? "" : (stryCov_9fa48("27943"), 'Error fetching applicant data:'), error);
            setError(stryMutAct_9fa48("27944") ? "" : (stryCov_9fa48("27944"), 'Unable to connect to the server. Please try again later.'));
          }
        } finally {
          if (stryMutAct_9fa48("27945")) {
            {}
          } else {
            stryCov_9fa48("27945");
            setLoading(stryMutAct_9fa48("27946") ? true : (stryCov_9fa48("27946"), false));
          }
        }
      }
    };
    const handleInitialUnsubscribe = () => {
      if (stryMutAct_9fa48("27947")) {
        {}
      } else {
        stryCov_9fa48("27947");
        setShowConfirmation(stryMutAct_9fa48("27948") ? false : (stryCov_9fa48("27948"), true));
      }
    };
    const handleConfirmationChange = (field, value) => {
      if (stryMutAct_9fa48("27949")) {
        {}
      } else {
        stryCov_9fa48("27949");
        setConfirmationData(stryMutAct_9fa48("27950") ? () => undefined : (stryCov_9fa48("27950"), prev => stryMutAct_9fa48("27951") ? {} : (stryCov_9fa48("27951"), {
          ...prev,
          [field]: value
        })));
      }
    };
    const handleFinalSubmit = async () => {
      if (stryMutAct_9fa48("27952")) {
        {}
      } else {
        stryCov_9fa48("27952");
        // Validate required fields
        if (stryMutAct_9fa48("27955") ? false : stryMutAct_9fa48("27954") ? true : stryMutAct_9fa48("27953") ? confirmationData.decision : (stryCov_9fa48("27953", "27954", "27955"), !confirmationData.decision)) {
          if (stryMutAct_9fa48("27956")) {
            {}
          } else {
            stryCov_9fa48("27956");
            await Swal.fire(stryMutAct_9fa48("27957") ? {} : (stryCov_9fa48("27957"), {
              title: stryMutAct_9fa48("27958") ? "" : (stryCov_9fa48("27958"), 'Please Select an Option'),
              text: stryMutAct_9fa48("27959") ? "" : (stryCov_9fa48("27959"), 'Please choose whether you want to unsubscribe or defer your application.'),
              icon: stryMutAct_9fa48("27960") ? "" : (stryCov_9fa48("27960"), 'warning'),
              confirmButtonColor: stryMutAct_9fa48("27961") ? "" : (stryCov_9fa48("27961"), 'var(--color-primary)'),
              background: stryMutAct_9fa48("27962") ? "" : (stryCov_9fa48("27962"), 'var(--color-background-dark)'),
              color: stryMutAct_9fa48("27963") ? "" : (stryCov_9fa48("27963"), 'var(--color-text-primary)')
            }));
            return;
          }
        }
        if (stryMutAct_9fa48("27966") ? false : stryMutAct_9fa48("27965") ? true : stryMutAct_9fa48("27964") ? confirmationData.reason : (stryCov_9fa48("27964", "27965", "27966"), !confirmationData.reason)) {
          if (stryMutAct_9fa48("27967")) {
            {}
          } else {
            stryCov_9fa48("27967");
            await Swal.fire(stryMutAct_9fa48("27968") ? {} : (stryCov_9fa48("27968"), {
              title: stryMutAct_9fa48("27969") ? "" : (stryCov_9fa48("27969"), 'Please Select a Reason'),
              text: stryMutAct_9fa48("27970") ? "" : (stryCov_9fa48("27970"), 'Please let us know why you\'re making this decision.'),
              icon: stryMutAct_9fa48("27971") ? "" : (stryCov_9fa48("27971"), 'warning'),
              confirmButtonColor: stryMutAct_9fa48("27972") ? "" : (stryCov_9fa48("27972"), 'var(--color-primary)'),
              background: stryMutAct_9fa48("27973") ? "" : (stryCov_9fa48("27973"), 'var(--color-background-dark)'),
              color: stryMutAct_9fa48("27974") ? "" : (stryCov_9fa48("27974"), 'var(--color-text-primary)')
            }));
            return;
          }
        }
        if (stryMutAct_9fa48("27977") ? confirmationData.reason === 'other' || !confirmationData.otherReason.trim() : stryMutAct_9fa48("27976") ? false : stryMutAct_9fa48("27975") ? true : (stryCov_9fa48("27975", "27976", "27977"), (stryMutAct_9fa48("27979") ? confirmationData.reason !== 'other' : stryMutAct_9fa48("27978") ? true : (stryCov_9fa48("27978", "27979"), confirmationData.reason === (stryMutAct_9fa48("27980") ? "" : (stryCov_9fa48("27980"), 'other')))) && (stryMutAct_9fa48("27981") ? confirmationData.otherReason.trim() : (stryCov_9fa48("27981"), !(stryMutAct_9fa48("27982") ? confirmationData.otherReason : (stryCov_9fa48("27982"), confirmationData.otherReason.trim())))))) {
          if (stryMutAct_9fa48("27983")) {
            {}
          } else {
            stryCov_9fa48("27983");
            await Swal.fire(stryMutAct_9fa48("27984") ? {} : (stryCov_9fa48("27984"), {
              title: stryMutAct_9fa48("27985") ? "" : (stryCov_9fa48("27985"), 'Please Provide Details'),
              text: stryMutAct_9fa48("27986") ? "" : (stryCov_9fa48("27986"), 'Please provide more details about your reason.'),
              icon: stryMutAct_9fa48("27987") ? "" : (stryCov_9fa48("27987"), 'warning'),
              confirmButtonColor: stryMutAct_9fa48("27988") ? "" : (stryCov_9fa48("27988"), 'var(--color-primary)'),
              background: stryMutAct_9fa48("27989") ? "" : (stryCov_9fa48("27989"), 'var(--color-background-dark)'),
              color: stryMutAct_9fa48("27990") ? "" : (stryCov_9fa48("27990"), 'var(--color-text-primary)')
            }));
            return;
          }
        }
        try {
          if (stryMutAct_9fa48("27991")) {
            {}
          } else {
            stryCov_9fa48("27991");
            setLoading(stryMutAct_9fa48("27992") ? false : (stryCov_9fa48("27992"), true));
            const requestData = stryMutAct_9fa48("27993") ? {} : (stryCov_9fa48("27993"), {
              decision: confirmationData.decision,
              reason: confirmationData.reason,
              otherReason: (stryMutAct_9fa48("27996") ? confirmationData.reason !== 'other' : stryMutAct_9fa48("27995") ? false : stryMutAct_9fa48("27994") ? true : (stryCov_9fa48("27994", "27995", "27996"), confirmationData.reason === (stryMutAct_9fa48("27997") ? "" : (stryCov_9fa48("27997"), 'other')))) ? confirmationData.otherReason : null
            });
            const response = await fetch(stryMutAct_9fa48("27998") ? `` : (stryCov_9fa48("27998"), `${import.meta.env.VITE_API_URL}/api/applications/applicants/${applicantId}/unsubscribe`), stryMutAct_9fa48("27999") ? {} : (stryCov_9fa48("27999"), {
              method: stryMutAct_9fa48("28000") ? "" : (stryCov_9fa48("28000"), 'POST'),
              headers: stryMutAct_9fa48("28001") ? {} : (stryCov_9fa48("28001"), {
                'Content-Type': stryMutAct_9fa48("28002") ? "" : (stryCov_9fa48("28002"), 'application/json')
              }),
              body: JSON.stringify(requestData)
            }));
            if (stryMutAct_9fa48("28005") ? false : stryMutAct_9fa48("28004") ? true : stryMutAct_9fa48("28003") ? response.ok : (stryCov_9fa48("28003", "28004", "28005"), !response.ok)) {
              if (stryMutAct_9fa48("28006")) {
                {}
              } else {
                stryCov_9fa48("28006");
                throw new Error(stryMutAct_9fa48("28007") ? "" : (stryCov_9fa48("28007"), 'Failed to process request'));
              }
            }

            // Show success message based on decision
            const successTitle = (stryMutAct_9fa48("28010") ? confirmationData.decision !== 'defer' : stryMutAct_9fa48("28009") ? false : stryMutAct_9fa48("28008") ? true : (stryCov_9fa48("28008", "28009", "28010"), confirmationData.decision === (stryMutAct_9fa48("28011") ? "" : (stryCov_9fa48("28011"), 'defer')))) ? stryMutAct_9fa48("28012") ? "" : (stryCov_9fa48("28012"), 'Application Deferred') : stryMutAct_9fa48("28013") ? "" : (stryCov_9fa48("28013"), 'Successfully Unsubscribed');
            const successMessage = (stryMutAct_9fa48("28016") ? confirmationData.decision !== 'defer' : stryMutAct_9fa48("28015") ? false : stryMutAct_9fa48("28014") ? true : (stryCov_9fa48("28014", "28015", "28016"), confirmationData.decision === (stryMutAct_9fa48("28017") ? "" : (stryCov_9fa48("28017"), 'defer')))) ? stryMutAct_9fa48("28018") ? "" : (stryCov_9fa48("28018"), 'Your application has been deferred and you will be considered for a future cohort. We\'ll reach out when the next application cycle opens.') : stryMutAct_9fa48("28019") ? "" : (stryCov_9fa48("28019"), 'You have been successfully unsubscribed from automated emails for the Pursuit AI-Native Program.');
            await Swal.fire(stryMutAct_9fa48("28020") ? {} : (stryCov_9fa48("28020"), {
              title: successTitle,
              text: successMessage,
              icon: stryMutAct_9fa48("28021") ? "" : (stryCov_9fa48("28021"), 'success'),
              confirmButtonText: stryMutAct_9fa48("28022") ? "" : (stryCov_9fa48("28022"), 'Close'),
              confirmButtonColor: stryMutAct_9fa48("28023") ? "" : (stryCov_9fa48("28023"), 'var(--color-primary)'),
              background: stryMutAct_9fa48("28024") ? "" : (stryCov_9fa48("28024"), 'var(--color-background-dark)'),
              color: stryMutAct_9fa48("28025") ? "" : (stryCov_9fa48("28025"), 'var(--color-text-primary)')
            }));
            setAlreadyUnsubscribed(stryMutAct_9fa48("28026") ? false : (stryCov_9fa48("28026"), true));
            setShowConfirmation(stryMutAct_9fa48("28027") ? true : (stryCov_9fa48("28027"), false));
          }
        } catch (error) {
          if (stryMutAct_9fa48("28028")) {
            {}
          } else {
            stryCov_9fa48("28028");
            console.error(stryMutAct_9fa48("28029") ? "" : (stryCov_9fa48("28029"), 'Error processing request:'), error);
            await Swal.fire(stryMutAct_9fa48("28030") ? {} : (stryCov_9fa48("28030"), {
              title: stryMutAct_9fa48("28031") ? "" : (stryCov_9fa48("28031"), 'Error'),
              text: stryMutAct_9fa48("28032") ? "" : (stryCov_9fa48("28032"), 'Unable to process your request. Please try again or contact support.'),
              icon: stryMutAct_9fa48("28033") ? "" : (stryCov_9fa48("28033"), 'error'),
              confirmButtonColor: stryMutAct_9fa48("28034") ? "" : (stryCov_9fa48("28034"), 'var(--color-primary)'),
              background: stryMutAct_9fa48("28035") ? "" : (stryCov_9fa48("28035"), 'var(--color-background-dark)'),
              color: stryMutAct_9fa48("28036") ? "" : (stryCov_9fa48("28036"), 'var(--color-text-primary)')
            }));
          }
        } finally {
          if (stryMutAct_9fa48("28037")) {
            {}
          } else {
            stryCov_9fa48("28037");
            setLoading(stryMutAct_9fa48("28038") ? true : (stryCov_9fa48("28038"), false));
          }
        }
      }
    };
    if (stryMutAct_9fa48("28041") ? loading || !applicantData : stryMutAct_9fa48("28040") ? false : stryMutAct_9fa48("28039") ? true : (stryCov_9fa48("28039", "28040", "28041"), loading && (stryMutAct_9fa48("28042") ? applicantData : (stryCov_9fa48("28042"), !applicantData)))) {
      if (stryMutAct_9fa48("28043")) {
        {}
      } else {
        stryCov_9fa48("28043");
        return <div className="unsubscribe-email-page">
                <div className="unsubscribe-email-page__content">
                    <div className="unsubscribe-email-page__card">
                        <div className="unsubscribe-email-page__loading-spinner">
                            <div className="unsubscribe-email-page__spinner"></div>
                            <p>Loading...</p>
                        </div>
                    </div>
                </div>
            </div>;
      }
    }
    if (stryMutAct_9fa48("28045") ? false : stryMutAct_9fa48("28044") ? true : (stryCov_9fa48("28044", "28045"), error)) {
      if (stryMutAct_9fa48("28046")) {
        {}
      } else {
        stryCov_9fa48("28046");
        return <div className="unsubscribe-email-page">
                <div className="unsubscribe-email-page__content">
                    <div className="unsubscribe-email-page__card">
                        <div className="unsubscribe-email-page__error-message">
                            <h2>⚠️ Error</h2>
                            <p>{error}</p>
                            <p>If you believe this is an error, please contact our support team.</p>
                        </div>
                    </div>
                </div>
            </div>;
      }
    }
    return <div className="unsubscribe-email-page">
            <div className="unsubscribe-email-page__content">
                <div className="unsubscribe-email-page__card">
                    <div className="unsubscribe-email-page__header">
                        <h1>Email Unsubscribe</h1>
                        <p className="program-title">Pursuit AI-Native Program</p>
                    </div>

                    {stryMutAct_9fa48("28049") ? applicantData || <div className="unsubscribe-email-page__applicant-info">
                            <p>
                                <strong>Name:</strong> {applicantData.first_name} {applicantData.last_name}
                            </p>
                            <p>
                                <strong>Email:</strong> {applicantData.email}
                            </p>
                        </div> : stryMutAct_9fa48("28048") ? false : stryMutAct_9fa48("28047") ? true : (stryCov_9fa48("28047", "28048", "28049"), applicantData && <div className="unsubscribe-email-page__applicant-info">
                            <p>
                                <strong>Name:</strong> {applicantData.first_name} {applicantData.last_name}
                            </p>
                            <p>
                                <strong>Email:</strong> {applicantData.email}
                            </p>
                        </div>)}

                {alreadyUnsubscribed ? <div className="unsubscribe-email-page__already-unsubscribed">
                        <div className="unsubscribe-email-page__success-icon">✅</div>
                        <h2>Already Unsubscribed</h2>
                        <p>You have already been unsubscribed from automated emails for the Pursuit AI-Native Program.</p>
                        <p>If you're still receiving emails, please contact our support team.</p>
                    </div> : (stryMutAct_9fa48("28050") ? showConfirmation : (stryCov_9fa48("28050"), !showConfirmation)) ? <div className="unsubscribe-email-page__content-section">
                        <h2>No Longer Interested in Applying?</h2>
                        <p>
                            If you are no longer interested in applying for the program, you can unsubscribe here.
                        </p>
                        
                        <div className="unsubscribe-email-page__content-grid">
                            <div className="unsubscribe-email-page__info-section">
                                <div className="unsubscribe-email-page__email-types">
                                    <p><strong>This will stop:</strong></p>
                                    <ul>
                                        <li>Application reminders</li>
                                        <li>Info session notifications</li>
                                        <li>Workshop invitations</li>
                                        <li>Program updates and deadlines</li>
                                    </ul>
                                </div>

                                <div className="unsubscribe-email-page__important-note">
                                    <p><strong>Important:</strong> You may still receive essential administrative emails related to your application status, acceptance, or other critical program information.</p>
                                </div>
                            </div>

                            <div className="unsubscribe-email-page__actions-section">
                                <div className="unsubscribe-email-page__actions">
                                    <button onClick={handleInitialUnsubscribe} disabled={loading} className="unsubscribe-email-page__continue-btn">
                                        Continue
                                    </button>
                                </div>

                                <div className="unsubscribe-email-page__contact-info">
                                    <p>
                                        If you have questions or need assistance, please contact us at{stryMutAct_9fa48("28051") ? "" : (stryCov_9fa48("28051"), ' ')}
                                        <a href="mailto:admissions@pursuit.org">admissions@pursuit.org</a>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div> : <div className="unsubscribe-email-page__confirmation-content">
                        <h2>Are you sure you don't want to apply?</h2>
                        <p>Please confirm your decision below. Both fields are required.</p>
                        
                        <div className="unsubscribe-email-page__confirmation-form">
                            <div className="decision-column">
                                <div className="unsubscribe-email-page__decision-options">
                                    <h3>Your Decision <span className="required-asterisk">*</span></h3>
                                    
                                    <label className="unsubscribe-email-page__checkbox-option">
                                        <input type="radio" name="decision" value="unsubscribe" checked={stryMutAct_9fa48("28054") ? confirmationData.decision !== 'unsubscribe' : stryMutAct_9fa48("28053") ? false : stryMutAct_9fa48("28052") ? true : (stryCov_9fa48("28052", "28053", "28054"), confirmationData.decision === (stryMutAct_9fa48("28055") ? "" : (stryCov_9fa48("28055"), 'unsubscribe')))} onChange={stryMutAct_9fa48("28056") ? () => undefined : (stryCov_9fa48("28056"), e => handleConfirmationChange(stryMutAct_9fa48("28057") ? "" : (stryCov_9fa48("28057"), 'decision'), e.target.value))} />
                                        I no longer want to apply to the program.
                                    </label>
                                    
                                    <label className="unsubscribe-email-page__checkbox-option">
                                        <input type="radio" name="decision" value="defer" checked={stryMutAct_9fa48("28060") ? confirmationData.decision !== 'defer' : stryMutAct_9fa48("28059") ? false : stryMutAct_9fa48("28058") ? true : (stryCov_9fa48("28058", "28059", "28060"), confirmationData.decision === (stryMutAct_9fa48("28061") ? "" : (stryCov_9fa48("28061"), 'defer')))} onChange={stryMutAct_9fa48("28062") ? () => undefined : (stryCov_9fa48("28062"), e => handleConfirmationChange(stryMutAct_9fa48("28063") ? "" : (stryCov_9fa48("28063"), 'decision'), e.target.value))} />
                                        I want to defer my application and be considered for a future cohort.
                                    </label>
                                </div>
                            </div>

                            <div className="reason-column">
                                <div className="unsubscribe-email-page__reason-section">
                                    <h3>Please let us know why <span className="required-asterisk">*</span></h3>
                                    
                                    <label className="unsubscribe-email-page__checkbox-option">
                                        <input type="radio" name="reason" value="time_commitment" checked={stryMutAct_9fa48("28066") ? confirmationData.reason !== 'time_commitment' : stryMutAct_9fa48("28065") ? false : stryMutAct_9fa48("28064") ? true : (stryCov_9fa48("28064", "28065", "28066"), confirmationData.reason === (stryMutAct_9fa48("28067") ? "" : (stryCov_9fa48("28067"), 'time_commitment')))} onChange={stryMutAct_9fa48("28068") ? () => undefined : (stryCov_9fa48("28068"), e => handleConfirmationChange(stryMutAct_9fa48("28069") ? "" : (stryCov_9fa48("28069"), 'reason'), e.target.value))} />
                                        I cannot commit to the time right now
                                    </label>
                                    
                                    <label className="unsubscribe-email-page__checkbox-option">
                                        <input type="radio" name="reason" value="emergency" checked={stryMutAct_9fa48("28072") ? confirmationData.reason !== 'emergency' : stryMutAct_9fa48("28071") ? false : stryMutAct_9fa48("28070") ? true : (stryCov_9fa48("28070", "28071", "28072"), confirmationData.reason === (stryMutAct_9fa48("28073") ? "" : (stryCov_9fa48("28073"), 'emergency')))} onChange={stryMutAct_9fa48("28074") ? () => undefined : (stryCov_9fa48("28074"), e => handleConfirmationChange(stryMutAct_9fa48("28075") ? "" : (stryCov_9fa48("28075"), 'reason'), e.target.value))} />
                                        I am experiencing a personal or family emergency
                                    </label>
                                    
                                    <label className="unsubscribe-email-page__checkbox-option">
                                        <input type="radio" name="reason" value="not_interested" checked={stryMutAct_9fa48("28078") ? confirmationData.reason !== 'not_interested' : stryMutAct_9fa48("28077") ? false : stryMutAct_9fa48("28076") ? true : (stryCov_9fa48("28076", "28077", "28078"), confirmationData.reason === (stryMutAct_9fa48("28079") ? "" : (stryCov_9fa48("28079"), 'not_interested')))} onChange={stryMutAct_9fa48("28080") ? () => undefined : (stryCov_9fa48("28080"), e => handleConfirmationChange(stryMutAct_9fa48("28081") ? "" : (stryCov_9fa48("28081"), 'reason'), e.target.value))} />
                                        I am no longer interested in the program
                                    </label>
                                    
                                    <label className="unsubscribe-email-page__checkbox-option">
                                        <input type="radio" name="reason" value="other" checked={stryMutAct_9fa48("28084") ? confirmationData.reason !== 'other' : stryMutAct_9fa48("28083") ? false : stryMutAct_9fa48("28082") ? true : (stryCov_9fa48("28082", "28083", "28084"), confirmationData.reason === (stryMutAct_9fa48("28085") ? "" : (stryCov_9fa48("28085"), 'other')))} onChange={stryMutAct_9fa48("28086") ? () => undefined : (stryCov_9fa48("28086"), e => handleConfirmationChange(stryMutAct_9fa48("28087") ? "" : (stryCov_9fa48("28087"), 'reason'), e.target.value))} />
                                        Other
                                    </label>
                                    
                                    {stryMutAct_9fa48("28090") ? confirmationData.reason === 'other' || <div className="unsubscribe-email-page__other-reason">
                                            <textarea placeholder="Please provide more details..." value={confirmationData.otherReason} onChange={e => handleConfirmationChange('otherReason', e.target.value)} className="unsubscribe-email-page__other-reason-input" rows="3" required />
                                        </div> : stryMutAct_9fa48("28089") ? false : stryMutAct_9fa48("28088") ? true : (stryCov_9fa48("28088", "28089", "28090"), (stryMutAct_9fa48("28092") ? confirmationData.reason !== 'other' : stryMutAct_9fa48("28091") ? true : (stryCov_9fa48("28091", "28092"), confirmationData.reason === (stryMutAct_9fa48("28093") ? "" : (stryCov_9fa48("28093"), 'other')))) && <div className="unsubscribe-email-page__other-reason">
                                            <textarea placeholder="Please provide more details..." value={confirmationData.otherReason} onChange={stryMutAct_9fa48("28094") ? () => undefined : (stryCov_9fa48("28094"), e => handleConfirmationChange(stryMutAct_9fa48("28095") ? "" : (stryCov_9fa48("28095"), 'otherReason'), e.target.value))} className="unsubscribe-email-page__other-reason-input" rows="3" required />
                                        </div>)}
                                </div>
                            </div>
                        </div>

                        <div className="unsubscribe-email-page__confirmation-actions">
                            <button onClick={stryMutAct_9fa48("28096") ? () => undefined : (stryCov_9fa48("28096"), () => setShowConfirmation(stryMutAct_9fa48("28097") ? true : (stryCov_9fa48("28097"), false)))} disabled={loading} className="unsubscribe-email-page__back-btn">
                                Back
                            </button>
                            <button onClick={handleFinalSubmit} disabled={loading} className="unsubscribe-email-page__confirm-btn">
                                {loading ? stryMutAct_9fa48("28098") ? "" : (stryCov_9fa48("28098"), 'Processing...') : stryMutAct_9fa48("28099") ? "" : (stryCov_9fa48("28099"), 'Confirm')}
                            </button>
                        </div>
                    </div>}
                </div>
            </div>
        </div>;
  }
};
export default Unsubscribe;