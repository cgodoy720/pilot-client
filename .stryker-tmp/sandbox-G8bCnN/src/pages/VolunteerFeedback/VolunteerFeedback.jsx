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
import FeedbackHeader from '../../components/FeedbackHeader/FeedbackHeader';
import FeedbackModal from './FeedbackModal';
import FeedbackList from './FeedbackList';
import './VolunteerFeedback.css';
function VolunteerFeedback() {
  if (stryMutAct_9fa48("28330")) {
    {}
  } else {
    stryCov_9fa48("28330");
    const {
      user,
      token
    } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(stryMutAct_9fa48("28331") ? true : (stryCov_9fa48("28331"), false));
    const [feedback, setFeedback] = useState(stryMutAct_9fa48("28332") ? ["Stryker was here"] : (stryCov_9fa48("28332"), []));
    const [isLoading, setIsLoading] = useState(stryMutAct_9fa48("28333") ? false : (stryCov_9fa48("28333"), true));
    const [error, setError] = useState(null);

    // Debug logging
    console.log(stryMutAct_9fa48("28334") ? "" : (stryCov_9fa48("28334"), '🔍 VolunteerFeedback rendering with:'), stryMutAct_9fa48("28335") ? {} : (stryCov_9fa48("28335"), {
      user,
      token,
      userRole: stryMutAct_9fa48("28336") ? user.role : (stryCov_9fa48("28336"), user?.role)
    }));
    useEffect(() => {
      if (stryMutAct_9fa48("28337")) {
        {}
      } else {
        stryCov_9fa48("28337");
        console.log(stryMutAct_9fa48("28338") ? "" : (stryCov_9fa48("28338"), '🔍 useEffect running with:'), stryMutAct_9fa48("28339") ? {} : (stryCov_9fa48("28339"), {
          user,
          token,
          userRole: stryMutAct_9fa48("28340") ? user.role : (stryCov_9fa48("28340"), user?.role)
        }));
        if (stryMutAct_9fa48("28343") ? user || token : stryMutAct_9fa48("28342") ? false : stryMutAct_9fa48("28341") ? true : (stryCov_9fa48("28341", "28342", "28343"), user && token)) {
          if (stryMutAct_9fa48("28344")) {
            {}
          } else {
            stryCov_9fa48("28344");
            console.log(stryMutAct_9fa48("28345") ? "" : (stryCov_9fa48("28345"), '🔍 User and token exist, fetching data...'));
            fetchFeedback();
          }
        } else {
          if (stryMutAct_9fa48("28346")) {
            {}
          } else {
            stryCov_9fa48("28346");
            console.log(stryMutAct_9fa48("28347") ? "" : (stryCov_9fa48("28347"), '🔍 User or token missing:'), stryMutAct_9fa48("28348") ? {} : (stryCov_9fa48("28348"), {
              hasUser: stryMutAct_9fa48("28349") ? !user : (stryCov_9fa48("28349"), !(stryMutAct_9fa48("28350") ? user : (stryCov_9fa48("28350"), !user))),
              hasToken: stryMutAct_9fa48("28351") ? !token : (stryCov_9fa48("28351"), !(stryMutAct_9fa48("28352") ? token : (stryCov_9fa48("28352"), !token)))
            }));
            setIsLoading(stryMutAct_9fa48("28353") ? true : (stryCov_9fa48("28353"), false));
          }
        }
      }
    }, stryMutAct_9fa48("28354") ? [] : (stryCov_9fa48("28354"), [user, token]));
    const fetchFeedback = async () => {
      if (stryMutAct_9fa48("28355")) {
        {}
      } else {
        stryCov_9fa48("28355");
        try {
          if (stryMutAct_9fa48("28356")) {
            {}
          } else {
            stryCov_9fa48("28356");
            const response = await fetch(stryMutAct_9fa48("28357") ? `` : (stryCov_9fa48("28357"), `${import.meta.env.VITE_API_URL}/api/volunteer-feedback/user`), stryMutAct_9fa48("28358") ? {} : (stryCov_9fa48("28358"), {
              headers: stryMutAct_9fa48("28359") ? {} : (stryCov_9fa48("28359"), {
                'Authorization': stryMutAct_9fa48("28360") ? `` : (stryCov_9fa48("28360"), `Bearer ${token}`),
                'Content-Type': stryMutAct_9fa48("28361") ? "" : (stryCov_9fa48("28361"), 'application/json')
              })
            }));
            if (stryMutAct_9fa48("28363") ? false : stryMutAct_9fa48("28362") ? true : (stryCov_9fa48("28362", "28363"), response.ok)) {
              if (stryMutAct_9fa48("28364")) {
                {}
              } else {
                stryCov_9fa48("28364");
                const data = await response.json();
                setFeedback(data.feedback);
              }
            } else {
              if (stryMutAct_9fa48("28365")) {
                {}
              } else {
                stryCov_9fa48("28365");
                throw new Error(stryMutAct_9fa48("28366") ? "" : (stryCov_9fa48("28366"), 'Failed to fetch feedback'));
              }
            }
          }
        } catch (error) {
          if (stryMutAct_9fa48("28367")) {
            {}
          } else {
            stryCov_9fa48("28367");
            console.error(stryMutAct_9fa48("28368") ? "" : (stryCov_9fa48("28368"), 'Error fetching feedback:'), error);
            setError(stryMutAct_9fa48("28369") ? "" : (stryCov_9fa48("28369"), 'Failed to load feedback. Please try again.'));
          }
        } finally {
          if (stryMutAct_9fa48("28370")) {
            {}
          } else {
            stryCov_9fa48("28370");
            setIsLoading(stryMutAct_9fa48("28371") ? true : (stryCov_9fa48("28371"), false));
          }
        }
      }
    };
    const handleFeedbackSubmitted = newFeedback => {
      if (stryMutAct_9fa48("28372")) {
        {}
      } else {
        stryCov_9fa48("28372");
        setFeedback(stryMutAct_9fa48("28373") ? () => undefined : (stryCov_9fa48("28373"), prev => stryMutAct_9fa48("28374") ? [] : (stryCov_9fa48("28374"), [newFeedback, ...prev])));
        setIsModalOpen(stryMutAct_9fa48("28375") ? true : (stryCov_9fa48("28375"), false));
      }
    };
    const handleFeedbackDeleted = feedbackId => {
      if (stryMutAct_9fa48("28376")) {
        {}
      } else {
        stryCov_9fa48("28376");
        setFeedback(stryMutAct_9fa48("28377") ? () => undefined : (stryCov_9fa48("28377"), prev => stryMutAct_9fa48("28378") ? prev : (stryCov_9fa48("28378"), prev.filter(stryMutAct_9fa48("28379") ? () => undefined : (stryCov_9fa48("28379"), f => stryMutAct_9fa48("28382") ? f.feedback_id === feedbackId : stryMutAct_9fa48("28381") ? false : stryMutAct_9fa48("28380") ? true : (stryCov_9fa48("28380", "28381", "28382"), f.feedback_id !== feedbackId))))));
      }
    };
    const handleFeedbackUpdated = updatedFeedback => {
      if (stryMutAct_9fa48("28383")) {
        {}
      } else {
        stryCov_9fa48("28383");
        setFeedback(stryMutAct_9fa48("28384") ? () => undefined : (stryCov_9fa48("28384"), prev => prev.map(stryMutAct_9fa48("28385") ? () => undefined : (stryCov_9fa48("28385"), f => (stryMutAct_9fa48("28388") ? f.feedback_id !== updatedFeedback.feedback_id : stryMutAct_9fa48("28387") ? false : stryMutAct_9fa48("28386") ? true : (stryCov_9fa48("28386", "28387", "28388"), f.feedback_id === updatedFeedback.feedback_id)) ? updatedFeedback : f))));
      }
    };
    console.log(stryMutAct_9fa48("28389") ? "" : (stryCov_9fa48("28389"), '🔍 Role check:'), stryMutAct_9fa48("28390") ? {} : (stryCov_9fa48("28390"), {
      userRole: stryMutAct_9fa48("28391") ? user.role : (stryCov_9fa48("28391"), user?.role),
      isVolunteer: stryMutAct_9fa48("28394") ? user?.role !== 'volunteer' : stryMutAct_9fa48("28393") ? false : stryMutAct_9fa48("28392") ? true : (stryCov_9fa48("28392", "28393", "28394"), (stryMutAct_9fa48("28395") ? user.role : (stryCov_9fa48("28395"), user?.role)) === (stryMutAct_9fa48("28396") ? "" : (stryCov_9fa48("28396"), 'volunteer')))
    }));
    if (stryMutAct_9fa48("28399") ? user?.role === 'volunteer' : stryMutAct_9fa48("28398") ? false : stryMutAct_9fa48("28397") ? true : (stryCov_9fa48("28397", "28398", "28399"), (stryMutAct_9fa48("28400") ? user.role : (stryCov_9fa48("28400"), user?.role)) !== (stryMutAct_9fa48("28401") ? "" : (stryCov_9fa48("28401"), 'volunteer')))) {
      if (stryMutAct_9fa48("28402")) {
        {}
      } else {
        stryCov_9fa48("28402");
        console.log(stryMutAct_9fa48("28403") ? "" : (stryCov_9fa48("28403"), '🔍 Access denied - user is not a volunteer'));
        return <div className="volunteer-feedback-page">
                <FeedbackHeader />
                <div className="volunteer-feedback">
                    <div className="volunteer-feedback__error">
                        <h2>Access Denied</h2>
                        <p>This page is only available to volunteers.</p>
                    </div>
                </div>
            </div>;
      }
    }
    console.log(stryMutAct_9fa48("28404") ? "" : (stryCov_9fa48("28404"), '🔍 User is a volunteer, rendering feedback form'));
    console.log(stryMutAct_9fa48("28405") ? "" : (stryCov_9fa48("28405"), '🔍 Rendering main feedback form content'));
    return <div className="volunteer-feedback-page">
            <FeedbackHeader />
            <div className="volunteer-feedback">
                <div className="volunteer-feedback__header">
                    <h1>Volunteer Feedback</h1>
                    <p>Share your insights and experiences to help improve our programs.</p>
                </div>

                {/* Action Section */}
                <div className="volunteer-feedback__actions">
                    <button className="volunteer-feedback__record-button" onClick={stryMutAct_9fa48("28406") ? () => undefined : (stryCov_9fa48("28406"), () => setIsModalOpen(stryMutAct_9fa48("28407") ? false : (stryCov_9fa48("28407"), true)))}>
                        📝 Record Feedback
                    </button>
                </div>

                {/* Feedback List */}
                <div className="volunteer-feedback__content">
                    <h2>Your Feedback History</h2>
                    {isLoading ? <div className="volunteer-feedback__loading">Loading your feedback...</div> : error ? <div className="volunteer-feedback__error">{error}</div> : (stryMutAct_9fa48("28410") ? feedback.length !== 0 : stryMutAct_9fa48("28409") ? false : stryMutAct_9fa48("28408") ? true : (stryCov_9fa48("28408", "28409", "28410"), feedback.length === 0)) ? <div className="volunteer-feedback__empty">
                            <p>You haven't submitted any feedback yet.</p>
                            <p>Click "Record Feedback" to get started!</p>
                        </div> : <FeedbackList feedback={feedback} onDelete={handleFeedbackDeleted} onUpdate={handleFeedbackUpdated} token={token} />}
                </div>

                {/* Feedback Modal */}
                <FeedbackModal isOpen={isModalOpen} onClose={stryMutAct_9fa48("28411") ? () => undefined : (stryCov_9fa48("28411"), () => setIsModalOpen(stryMutAct_9fa48("28412") ? true : (stryCov_9fa48("28412"), false)))} onSubmit={handleFeedbackSubmitted} token={token} />
            </div>
        </div>;
  }
}
export default VolunteerFeedback;