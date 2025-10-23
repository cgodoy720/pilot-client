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
import './FeedbackModal.css';
function FeedbackModal({
  isOpen,
  onClose,
  onSubmit,
  token,
  isEditing = stryMutAct_9fa48("28236") ? true : (stryCov_9fa48("28236"), false),
  initialData = null
}) {
  if (stryMutAct_9fa48("28237")) {
    {}
  } else {
    stryCov_9fa48("28237");
    const [formData, setFormData] = useState(stryMutAct_9fa48("28238") ? {} : (stryCov_9fa48("28238"), {
      feedbackDate: stryMutAct_9fa48("28239") ? "Stryker was here!" : (stryCov_9fa48("28239"), ''),
      feedbackType: stryMutAct_9fa48("28240") ? "Stryker was here!" : (stryCov_9fa48("28240"), ''),
      overallExperience: stryMutAct_9fa48("28241") ? "Stryker was here!" : (stryCov_9fa48("28241"), ''),
      improvementSuggestions: stryMutAct_9fa48("28242") ? "Stryker was here!" : (stryCov_9fa48("28242"), ''),
      specificFeedback: stryMutAct_9fa48("28243") ? "Stryker was here!" : (stryCov_9fa48("28243"), '')
    }));
    const [isSubmitting, setIsSubmitting] = useState(stryMutAct_9fa48("28244") ? true : (stryCov_9fa48("28244"), false));
    const [error, setError] = useState(stryMutAct_9fa48("28245") ? "Stryker was here!" : (stryCov_9fa48("28245"), ''));

    // Set today's date as default when modal opens, or use initial data for editing
    useEffect(() => {
      if (stryMutAct_9fa48("28246")) {
        {}
      } else {
        stryCov_9fa48("28246");
        if (stryMutAct_9fa48("28248") ? false : stryMutAct_9fa48("28247") ? true : (stryCov_9fa48("28247", "28248"), isOpen)) {
          if (stryMutAct_9fa48("28249")) {
            {}
          } else {
            stryCov_9fa48("28249");
            if (stryMutAct_9fa48("28252") ? isEditing || initialData : stryMutAct_9fa48("28251") ? false : stryMutAct_9fa48("28250") ? true : (stryCov_9fa48("28250", "28251", "28252"), isEditing && initialData)) {
              if (stryMutAct_9fa48("28253")) {
                {}
              } else {
                stryCov_9fa48("28253");
                setFormData(initialData);
              }
            } else {
              if (stryMutAct_9fa48("28254")) {
                {}
              } else {
                stryCov_9fa48("28254");
                const today = new Date().toISOString().split(stryMutAct_9fa48("28255") ? "" : (stryCov_9fa48("28255"), 'T'))[0];
                setFormData(stryMutAct_9fa48("28256") ? () => undefined : (stryCov_9fa48("28256"), prev => stryMutAct_9fa48("28257") ? {} : (stryCov_9fa48("28257"), {
                  ...prev,
                  feedbackDate: today
                })));
              }
            }
          }
        }
      }
    }, stryMutAct_9fa48("28258") ? [] : (stryCov_9fa48("28258"), [isOpen, isEditing, initialData]));
    const handleInputChange = e => {
      if (stryMutAct_9fa48("28259")) {
        {}
      } else {
        stryCov_9fa48("28259");
        const {
          name,
          value
        } = e.target;
        setFormData(stryMutAct_9fa48("28260") ? () => undefined : (stryCov_9fa48("28260"), prev => stryMutAct_9fa48("28261") ? {} : (stryCov_9fa48("28261"), {
          ...prev,
          [name]: value
        })));
        setError(stryMutAct_9fa48("28262") ? "Stryker was here!" : (stryCov_9fa48("28262"), '')); // Clear error when user types
      }
    };
    const handleSubmit = async e => {
      if (stryMutAct_9fa48("28263")) {
        {}
      } else {
        stryCov_9fa48("28263");
        e.preventDefault();
        setError(stryMutAct_9fa48("28264") ? "Stryker was here!" : (stryCov_9fa48("28264"), ''));

        // Validation
        if (stryMutAct_9fa48("28267") ? !formData.feedbackDate && !formData.feedbackType : stryMutAct_9fa48("28266") ? false : stryMutAct_9fa48("28265") ? true : (stryCov_9fa48("28265", "28266", "28267"), (stryMutAct_9fa48("28268") ? formData.feedbackDate : (stryCov_9fa48("28268"), !formData.feedbackDate)) || (stryMutAct_9fa48("28269") ? formData.feedbackType : (stryCov_9fa48("28269"), !formData.feedbackType)))) {
          if (stryMutAct_9fa48("28270")) {
            {}
          } else {
            stryCov_9fa48("28270");
            setError(stryMutAct_9fa48("28271") ? "" : (stryCov_9fa48("28271"), 'Please select both a date and feedback type.'));
            return;
          }
        }
        if (stryMutAct_9fa48("28274") ? false : stryMutAct_9fa48("28273") ? true : stryMutAct_9fa48("28272") ? formData.overallExperience.trim() : (stryCov_9fa48("28272", "28273", "28274"), !(stryMutAct_9fa48("28275") ? formData.overallExperience : (stryCov_9fa48("28275"), formData.overallExperience.trim())))) {
          if (stryMutAct_9fa48("28276")) {
            {}
          } else {
            stryCov_9fa48("28276");
            setError(stryMutAct_9fa48("28277") ? "" : (stryCov_9fa48("28277"), 'Please answer: How was your experience overall?'));
            return;
          }
        }
        setIsSubmitting(stryMutAct_9fa48("28278") ? false : (stryCov_9fa48("28278"), true));
        try {
          if (stryMutAct_9fa48("28279")) {
            {}
          } else {
            stryCov_9fa48("28279");
            const response = await fetch(stryMutAct_9fa48("28280") ? `` : (stryCov_9fa48("28280"), `${import.meta.env.VITE_API_URL}/api/volunteer-feedback`), stryMutAct_9fa48("28281") ? {} : (stryCov_9fa48("28281"), {
              method: stryMutAct_9fa48("28282") ? "" : (stryCov_9fa48("28282"), 'POST'),
              headers: stryMutAct_9fa48("28283") ? {} : (stryCov_9fa48("28283"), {
                'Authorization': stryMutAct_9fa48("28284") ? `` : (stryCov_9fa48("28284"), `Bearer ${token}`),
                'Content-Type': stryMutAct_9fa48("28285") ? "" : (stryCov_9fa48("28285"), 'application/json')
              }),
              body: JSON.stringify(formData)
            }));
            if (stryMutAct_9fa48("28287") ? false : stryMutAct_9fa48("28286") ? true : (stryCov_9fa48("28286", "28287"), response.ok)) {
              if (stryMutAct_9fa48("28288")) {
                {}
              } else {
                stryCov_9fa48("28288");
                const data = await response.json();
                onSubmit(data.feedback);
                // Reset form
                setFormData(stryMutAct_9fa48("28289") ? {} : (stryCov_9fa48("28289"), {
                  feedbackDate: stryMutAct_9fa48("28290") ? "Stryker was here!" : (stryCov_9fa48("28290"), ''),
                  feedbackType: stryMutAct_9fa48("28291") ? "Stryker was here!" : (stryCov_9fa48("28291"), ''),
                  overallExperience: stryMutAct_9fa48("28292") ? "Stryker was here!" : (stryCov_9fa48("28292"), ''),
                  improvementSuggestions: stryMutAct_9fa48("28293") ? "Stryker was here!" : (stryCov_9fa48("28293"), ''),
                  specificFeedback: stryMutAct_9fa48("28294") ? "Stryker was here!" : (stryCov_9fa48("28294"), '')
                }));
              }
            } else {
              if (stryMutAct_9fa48("28295")) {
                {}
              } else {
                stryCov_9fa48("28295");
                const errorData = await response.json();
                setError(stryMutAct_9fa48("28298") ? errorData.error && 'Failed to submit feedback. Please try again.' : stryMutAct_9fa48("28297") ? false : stryMutAct_9fa48("28296") ? true : (stryCov_9fa48("28296", "28297", "28298"), errorData.error || (stryMutAct_9fa48("28299") ? "" : (stryCov_9fa48("28299"), 'Failed to submit feedback. Please try again.'))));
              }
            }
          }
        } catch (error) {
          if (stryMutAct_9fa48("28300")) {
            {}
          } else {
            stryCov_9fa48("28300");
            console.error(stryMutAct_9fa48("28301") ? "" : (stryCov_9fa48("28301"), 'Error submitting feedback:'), error);
            setError(stryMutAct_9fa48("28302") ? "" : (stryCov_9fa48("28302"), 'An unexpected error occurred. Please try again.'));
          }
        } finally {
          if (stryMutAct_9fa48("28303")) {
            {}
          } else {
            stryCov_9fa48("28303");
            setIsSubmitting(stryMutAct_9fa48("28304") ? true : (stryCov_9fa48("28304"), false));
          }
        }
      }
    };
    const handleClose = () => {
      if (stryMutAct_9fa48("28305")) {
        {}
      } else {
        stryCov_9fa48("28305");
        if (stryMutAct_9fa48("28308") ? false : stryMutAct_9fa48("28307") ? true : stryMutAct_9fa48("28306") ? isSubmitting : (stryCov_9fa48("28306", "28307", "28308"), !isSubmitting)) {
          if (stryMutAct_9fa48("28309")) {
            {}
          } else {
            stryCov_9fa48("28309");
            setFormData(stryMutAct_9fa48("28310") ? {} : (stryCov_9fa48("28310"), {
              feedbackDate: stryMutAct_9fa48("28311") ? "Stryker was here!" : (stryCov_9fa48("28311"), ''),
              feedbackType: stryMutAct_9fa48("28312") ? "Stryker was here!" : (stryCov_9fa48("28312"), ''),
              overallExperience: stryMutAct_9fa48("28313") ? "Stryker was here!" : (stryCov_9fa48("28313"), ''),
              improvementSuggestions: stryMutAct_9fa48("28314") ? "Stryker was here!" : (stryCov_9fa48("28314"), ''),
              specificFeedback: stryMutAct_9fa48("28315") ? "Stryker was here!" : (stryCov_9fa48("28315"), '')
            }));
            setError(stryMutAct_9fa48("28316") ? "Stryker was here!" : (stryCov_9fa48("28316"), ''));
            onClose();
          }
        }
      }
    };
    if (stryMutAct_9fa48("28319") ? false : stryMutAct_9fa48("28318") ? true : stryMutAct_9fa48("28317") ? isOpen : (stryCov_9fa48("28317", "28318", "28319"), !isOpen)) return null;
    return <div className="feedback-modal-overlay" onClick={handleClose}>
            <div className="feedback-modal" onClick={stryMutAct_9fa48("28320") ? () => undefined : (stryCov_9fa48("28320"), e => e.stopPropagation())}>
                <div className="feedback-modal__header">
                    <h2>{isEditing ? stryMutAct_9fa48("28321") ? "" : (stryCov_9fa48("28321"), 'Edit Feedback') : stryMutAct_9fa48("28322") ? "" : (stryCov_9fa48("28322"), 'Record Feedback')}</h2>
                    <button className="feedback-modal__close" onClick={handleClose} disabled={isSubmitting}>
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="feedback-modal__form">
                    {stryMutAct_9fa48("28325") ? error || <div className="feedback-modal__error">{error}</div> : stryMutAct_9fa48("28324") ? false : stryMutAct_9fa48("28323") ? true : (stryCov_9fa48("28323", "28324", "28325"), error && <div className="feedback-modal__error">{error}</div>)}

                    {/* Date Selection */}
                    <div className="form-group">
                        <label htmlFor="feedbackDate">Date *</label>
                        <input type="date" id="feedbackDate" name="feedbackDate" value={formData.feedbackDate} onChange={handleInputChange} required max={new Date().toISOString().split(stryMutAct_9fa48("28326") ? "" : (stryCov_9fa48("28326"), 'T'))[0]} />
                    </div>

                    {/* Feedback Type Selection */}
                    <div className="form-group">
                        <label htmlFor="feedbackType">Event Type *</label>
                        <select id="feedbackType" name="feedbackType" value={formData.feedbackType} onChange={handleInputChange} required>
                            <option value="">Select an event type</option>
                            <option value="AI Native Class">AI Native Class</option>
                            <option value="Demo Day">Demo Day</option>
                            <option value="Networking Event">Networking Event</option>
                            <option value="Panel">Panel</option>
                            <option value="Mock Interview">Mock Interview</option>
                        </select>
                    </div>

                    {/* Question 1: Overall Experience (Mandatory) */}
                    <div className="form-group">
                        <label htmlFor="overallExperience">1. How was your experience overall? *</label>
                        <textarea id="overallExperience" name="overallExperience" value={formData.overallExperience} onChange={handleInputChange} placeholder="" rows={4} required />
                    </div>

                    {/* Question 2: Improvement Suggestions (Optional) */}
                    <div className="form-group">
                        <label htmlFor="improvementSuggestions">2. How could we improve going forward?</label>
                        <textarea id="improvementSuggestions" name="improvementSuggestions" value={formData.improvementSuggestions} onChange={handleInputChange} placeholder="" rows={3} />
                    </div>

                    {/* Question 3: Specific Feedback (Optional) */}
                    <div className="form-group">
                        <label htmlFor="specificFeedback">3. Do you have feedback to share on specific Builders or Fellows?</label>
                        <textarea id="specificFeedback" name="specificFeedback" value={formData.specificFeedback} onChange={handleInputChange} placeholder="" rows={3} />
                    </div>

                    {/* Submit Button */}
                    <div className="feedback-modal__actions">
                        <button type="button" className="feedback-modal__cancel" onClick={handleClose} disabled={isSubmitting}>
                            Cancel
                        </button>
                        <button type="submit" className="feedback-modal__submit" disabled={isSubmitting}>
                            {isSubmitting ? stryMutAct_9fa48("28327") ? "" : (stryCov_9fa48("28327"), 'Submitting...') : isEditing ? stryMutAct_9fa48("28328") ? "" : (stryCov_9fa48("28328"), 'Update Feedback') : stryMutAct_9fa48("28329") ? "" : (stryCov_9fa48("28329"), 'Submit Feedback')}
                        </button>
                    </div>
                </form>
            </div>
        </div>;
  }
}
export default FeedbackModal;