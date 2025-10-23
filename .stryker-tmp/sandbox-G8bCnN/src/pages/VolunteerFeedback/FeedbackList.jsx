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
import React, { useState } from 'react';
import FeedbackModal from './FeedbackModal';
import './FeedbackList.css';
function FeedbackList({
  feedback,
  onDelete,
  onUpdate,
  token
}) {
  if (stryMutAct_9fa48("28100")) {
    {}
  } else {
    stryCov_9fa48("28100");
    const [editingFeedback, setEditingFeedback] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(stryMutAct_9fa48("28101") ? true : (stryCov_9fa48("28101"), false));
    const handleEdit = feedbackItem => {
      if (stryMutAct_9fa48("28102")) {
        {}
      } else {
        stryCov_9fa48("28102");
        setEditingFeedback(feedbackItem);
        setIsEditModalOpen(stryMutAct_9fa48("28103") ? false : (stryCov_9fa48("28103"), true));
      }
    };
    const handleDelete = async feedbackId => {
      if (stryMutAct_9fa48("28104")) {
        {}
      } else {
        stryCov_9fa48("28104");
        if (stryMutAct_9fa48("28106") ? false : stryMutAct_9fa48("28105") ? true : (stryCov_9fa48("28105", "28106"), window.confirm(stryMutAct_9fa48("28107") ? "" : (stryCov_9fa48("28107"), 'Are you sure you want to delete this feedback? This action cannot be undone.')))) {
          if (stryMutAct_9fa48("28108")) {
            {}
          } else {
            stryCov_9fa48("28108");
            try {
              if (stryMutAct_9fa48("28109")) {
                {}
              } else {
                stryCov_9fa48("28109");
                const response = await fetch(stryMutAct_9fa48("28110") ? `` : (stryCov_9fa48("28110"), `${import.meta.env.VITE_API_URL}/api/volunteer-feedback/${feedbackId}`), stryMutAct_9fa48("28111") ? {} : (stryCov_9fa48("28111"), {
                  method: stryMutAct_9fa48("28112") ? "" : (stryCov_9fa48("28112"), 'DELETE'),
                  headers: stryMutAct_9fa48("28113") ? {} : (stryCov_9fa48("28113"), {
                    'Authorization': stryMutAct_9fa48("28114") ? `` : (stryCov_9fa48("28114"), `Bearer ${token}`),
                    'Content-Type': stryMutAct_9fa48("28115") ? "" : (stryCov_9fa48("28115"), 'application/json')
                  })
                }));
                if (stryMutAct_9fa48("28117") ? false : stryMutAct_9fa48("28116") ? true : (stryCov_9fa48("28116", "28117"), response.ok)) {
                  if (stryMutAct_9fa48("28118")) {
                    {}
                  } else {
                    stryCov_9fa48("28118");
                    onDelete(feedbackId);
                  }
                } else {
                  if (stryMutAct_9fa48("28119")) {
                    {}
                  } else {
                    stryCov_9fa48("28119");
                    alert(stryMutAct_9fa48("28120") ? "" : (stryCov_9fa48("28120"), 'Failed to delete feedback. Please try again.'));
                  }
                }
              }
            } catch (error) {
              if (stryMutAct_9fa48("28121")) {
                {}
              } else {
                stryCov_9fa48("28121");
                console.error(stryMutAct_9fa48("28122") ? "" : (stryCov_9fa48("28122"), 'Error deleting feedback:'), error);
                alert(stryMutAct_9fa48("28123") ? "" : (stryCov_9fa48("28123"), 'An error occurred while deleting feedback.'));
              }
            }
          }
        }
      }
    };
    const handleEditSubmit = async updatedFeedback => {
      if (stryMutAct_9fa48("28124")) {
        {}
      } else {
        stryCov_9fa48("28124");
        try {
          if (stryMutAct_9fa48("28125")) {
            {}
          } else {
            stryCov_9fa48("28125");
            const response = await fetch(stryMutAct_9fa48("28126") ? `` : (stryCov_9fa48("28126"), `${import.meta.env.VITE_API_URL}/api/volunteer-feedback/${updatedFeedback.feedback_id}`), stryMutAct_9fa48("28127") ? {} : (stryCov_9fa48("28127"), {
              method: stryMutAct_9fa48("28128") ? "" : (stryCov_9fa48("28128"), 'PUT'),
              headers: stryMutAct_9fa48("28129") ? {} : (stryCov_9fa48("28129"), {
                'Authorization': stryMutAct_9fa48("28130") ? `` : (stryCov_9fa48("28130"), `Bearer ${token}`),
                'Content-Type': stryMutAct_9fa48("28131") ? "" : (stryCov_9fa48("28131"), 'application/json')
              }),
              body: JSON.stringify(stryMutAct_9fa48("28132") ? {} : (stryCov_9fa48("28132"), {
                feedbackDate: updatedFeedback.feedback_date,
                feedbackType: updatedFeedback.feedback_type,
                overallExperience: updatedFeedback.overall_experience,
                improvementSuggestions: updatedFeedback.improvement_suggestions,
                specificFeedback: updatedFeedback.specific_feedback,
                audioRecordingUrl: updatedFeedback.audio_recording_url
              }))
            }));
            if (stryMutAct_9fa48("28134") ? false : stryMutAct_9fa48("28133") ? true : (stryCov_9fa48("28133", "28134"), response.ok)) {
              if (stryMutAct_9fa48("28135")) {
                {}
              } else {
                stryCov_9fa48("28135");
                const data = await response.json();
                onUpdate(data.feedback);
                setIsEditModalOpen(stryMutAct_9fa48("28136") ? true : (stryCov_9fa48("28136"), false));
                setEditingFeedback(null);
              }
            } else {
              if (stryMutAct_9fa48("28137")) {
                {}
              } else {
                stryCov_9fa48("28137");
                const errorData = await response.json();
                alert(stryMutAct_9fa48("28140") ? errorData.error && 'Failed to update feedback. Please try again.' : stryMutAct_9fa48("28139") ? false : stryMutAct_9fa48("28138") ? true : (stryCov_9fa48("28138", "28139", "28140"), errorData.error || (stryMutAct_9fa48("28141") ? "" : (stryCov_9fa48("28141"), 'Failed to update feedback. Please try again.'))));
              }
            }
          }
        } catch (error) {
          if (stryMutAct_9fa48("28142")) {
            {}
          } else {
            stryCov_9fa48("28142");
            console.error(stryMutAct_9fa48("28143") ? "" : (stryCov_9fa48("28143"), 'Error updating feedback:'), error);
            alert(stryMutAct_9fa48("28144") ? "" : (stryCov_9fa48("28144"), 'An error occurred while updating feedback.'));
          }
        }
      }
    };
    const formatDate = dateString => {
      if (stryMutAct_9fa48("28145")) {
        {}
      } else {
        stryCov_9fa48("28145");
        const date = new Date(dateString);
        return date.toLocaleDateString(stryMutAct_9fa48("28146") ? "" : (stryCov_9fa48("28146"), 'en-US'), stryMutAct_9fa48("28147") ? {} : (stryCov_9fa48("28147"), {
          year: stryMutAct_9fa48("28148") ? "" : (stryCov_9fa48("28148"), 'numeric'),
          month: stryMutAct_9fa48("28149") ? "" : (stryCov_9fa48("28149"), 'long'),
          day: stryMutAct_9fa48("28150") ? "" : (stryCov_9fa48("28150"), 'numeric')
        }));
      }
    };
    const getFeedbackTypeIcon = type => {
      if (stryMutAct_9fa48("28151")) {
        {}
      } else {
        stryCov_9fa48("28151");
        const icons = stryMutAct_9fa48("28152") ? {} : (stryCov_9fa48("28152"), {
          'AI Native Class': stryMutAct_9fa48("28153") ? "" : (stryCov_9fa48("28153"), '🤖'),
          'Demo Day': stryMutAct_9fa48("28154") ? "" : (stryCov_9fa48("28154"), '🎯'),
          'Networking Event': stryMutAct_9fa48("28155") ? "" : (stryCov_9fa48("28155"), '🤝'),
          'Panel': stryMutAct_9fa48("28156") ? "" : (stryCov_9fa48("28156"), '👥'),
          'Mock Interview': stryMutAct_9fa48("28157") ? "" : (stryCov_9fa48("28157"), '💼')
        });
        return stryMutAct_9fa48("28160") ? icons[type] && '📝' : stryMutAct_9fa48("28159") ? false : stryMutAct_9fa48("28158") ? true : (stryCov_9fa48("28158", "28159", "28160"), icons[type] || (stryMutAct_9fa48("28161") ? "" : (stryCov_9fa48("28161"), '📝')));
      }
    };
    const getFeedbackTypeColor = type => {
      if (stryMutAct_9fa48("28162")) {
        {}
      } else {
        stryCov_9fa48("28162");
        const colors = stryMutAct_9fa48("28163") ? {} : (stryCov_9fa48("28163"), {
          'AI Native Class': stryMutAct_9fa48("28164") ? "" : (stryCov_9fa48("28164"), '#4CAF50'),
          'Demo Day': stryMutAct_9fa48("28165") ? "" : (stryCov_9fa48("28165"), '#2196F3'),
          'Networking Event': stryMutAct_9fa48("28166") ? "" : (stryCov_9fa48("28166"), '#FF9800'),
          'Panel': stryMutAct_9fa48("28167") ? "" : (stryCov_9fa48("28167"), '#9C27B0'),
          'Mock Interview': stryMutAct_9fa48("28168") ? "" : (stryCov_9fa48("28168"), '#F44336')
        });
        return stryMutAct_9fa48("28171") ? colors[type] && '#666' : stryMutAct_9fa48("28170") ? false : stryMutAct_9fa48("28169") ? true : (stryCov_9fa48("28169", "28170", "28171"), colors[type] || (stryMutAct_9fa48("28172") ? "" : (stryCov_9fa48("28172"), '#666')));
      }
    };
    return <div className="feedback-list">
            {feedback.map(stryMutAct_9fa48("28173") ? () => undefined : (stryCov_9fa48("28173"), feedbackItem => <div key={feedbackItem.feedback_id} className="feedback-item">
                    <div className="feedback-item__header">
                        <div className="feedback-item__type">
                            <span className="feedback-item__type-icon" style={stryMutAct_9fa48("28174") ? {} : (stryCov_9fa48("28174"), {
              backgroundColor: getFeedbackTypeColor(feedbackItem.feedback_type)
            })}>
                                {getFeedbackTypeIcon(feedbackItem.feedback_type)}
                            </span>
                            <span className="feedback-item__type-text">
                                {feedbackItem.feedback_type}
                            </span>
                        </div>
                        <div className="feedback-item__date">
                            {formatDate(feedbackItem.feedback_date)}
                        </div>
                    </div>

                    <div className="feedback-item__content">
                        {/* Question 1: Overall Experience (Always present) */}
                        {stryMutAct_9fa48("28177") ? feedbackItem.overall_experience || <div className="feedback-item__question">
                                <div className="feedback-item__question-label">
                                    How was your experience overall?
                                </div>
                                <div className="feedback-item__question-answer">
                                    {feedbackItem.overall_experience}
                                </div>
                            </div> : stryMutAct_9fa48("28176") ? false : stryMutAct_9fa48("28175") ? true : (stryCov_9fa48("28175", "28176", "28177"), feedbackItem.overall_experience && <div className="feedback-item__question">
                                <div className="feedback-item__question-label">
                                    How was your experience overall?
                                </div>
                                <div className="feedback-item__question-answer">
                                    {feedbackItem.overall_experience}
                                </div>
                            </div>)}

                        {/* Question 2: Improvement Suggestions (Optional) */}
                        {stryMutAct_9fa48("28180") ? feedbackItem.improvement_suggestions || <div className="feedback-item__question">
                                <div className="feedback-item__question-label">
                                    How could we improve going forward?
                                </div>
                                <div className="feedback-item__question-answer">
                                    {feedbackItem.improvement_suggestions}
                                </div>
                            </div> : stryMutAct_9fa48("28179") ? false : stryMutAct_9fa48("28178") ? true : (stryCov_9fa48("28178", "28179", "28180"), feedbackItem.improvement_suggestions && <div className="feedback-item__question">
                                <div className="feedback-item__question-label">
                                    How could we improve going forward?
                                </div>
                                <div className="feedback-item__question-answer">
                                    {feedbackItem.improvement_suggestions}
                                </div>
                            </div>)}

                        {/* Question 3: Specific Feedback (Optional) */}
                        {stryMutAct_9fa48("28183") ? feedbackItem.specific_feedback || <div className="feedback-item__question">
                                <div className="feedback-item__question-label">
                                    Do you have feedback to share on specific Builders or Fellows?
                                </div>
                                <div className="feedback-item__question-answer">
                                    {feedbackItem.specific_feedback}
                                </div>
                            </div> : stryMutAct_9fa48("28182") ? false : stryMutAct_9fa48("28181") ? true : (stryCov_9fa48("28181", "28182", "28183"), feedbackItem.specific_feedback && <div className="feedback-item__question">
                                <div className="feedback-item__question-label">
                                    Do you have feedback to share on specific Builders or Fellows?
                                </div>
                                <div className="feedback-item__question-answer">
                                    {feedbackItem.specific_feedback}
                                </div>
                            </div>)}

                        {/* Audio Recording (if present) */}
                        {stryMutAct_9fa48("28186") ? feedbackItem.audio_recording_url || <div className="feedback-item__audio">
                                🎤 Audio feedback recorded
                                {feedbackItem.audio_recording_url !== 'placeholder-audio-url' && <a href={feedbackItem.audio_recording_url} target="_blank" rel="noopener noreferrer" className="feedback-item__audio-link">
                                        Listen to recording
                                    </a>}
                            </div> : stryMutAct_9fa48("28185") ? false : stryMutAct_9fa48("28184") ? true : (stryCov_9fa48("28184", "28185", "28186"), feedbackItem.audio_recording_url && <div className="feedback-item__audio">
                                🎤 Audio feedback recorded
                                {stryMutAct_9fa48("28189") ? feedbackItem.audio_recording_url !== 'placeholder-audio-url' || <a href={feedbackItem.audio_recording_url} target="_blank" rel="noopener noreferrer" className="feedback-item__audio-link">
                                        Listen to recording
                                    </a> : stryMutAct_9fa48("28188") ? false : stryMutAct_9fa48("28187") ? true : (stryCov_9fa48("28187", "28188", "28189"), (stryMutAct_9fa48("28191") ? feedbackItem.audio_recording_url === 'placeholder-audio-url' : stryMutAct_9fa48("28190") ? true : (stryCov_9fa48("28190", "28191"), feedbackItem.audio_recording_url !== (stryMutAct_9fa48("28192") ? "" : (stryCov_9fa48("28192"), 'placeholder-audio-url')))) && <a href={feedbackItem.audio_recording_url} target="_blank" rel="noopener noreferrer" className="feedback-item__audio-link">
                                        Listen to recording
                                    </a>)}
                            </div>)}

                        {/* Fallback for completely empty feedback */}
                        {stryMutAct_9fa48("28195") ? !feedbackItem.overall_experience && !feedbackItem.improvement_suggestions && !feedbackItem.specific_feedback && !feedbackItem.audio_recording_url || <div className="feedback-item__empty">
                                No feedback content available
                            </div> : stryMutAct_9fa48("28194") ? false : stryMutAct_9fa48("28193") ? true : (stryCov_9fa48("28193", "28194", "28195"), (stryMutAct_9fa48("28197") ? !feedbackItem.overall_experience && !feedbackItem.improvement_suggestions && !feedbackItem.specific_feedback || !feedbackItem.audio_recording_url : stryMutAct_9fa48("28196") ? true : (stryCov_9fa48("28196", "28197"), (stryMutAct_9fa48("28199") ? !feedbackItem.overall_experience && !feedbackItem.improvement_suggestions || !feedbackItem.specific_feedback : stryMutAct_9fa48("28198") ? true : (stryCov_9fa48("28198", "28199"), (stryMutAct_9fa48("28201") ? !feedbackItem.overall_experience || !feedbackItem.improvement_suggestions : stryMutAct_9fa48("28200") ? true : (stryCov_9fa48("28200", "28201"), (stryMutAct_9fa48("28202") ? feedbackItem.overall_experience : (stryCov_9fa48("28202"), !feedbackItem.overall_experience)) && (stryMutAct_9fa48("28203") ? feedbackItem.improvement_suggestions : (stryCov_9fa48("28203"), !feedbackItem.improvement_suggestions)))) && (stryMutAct_9fa48("28204") ? feedbackItem.specific_feedback : (stryCov_9fa48("28204"), !feedbackItem.specific_feedback)))) && (stryMutAct_9fa48("28205") ? feedbackItem.audio_recording_url : (stryCov_9fa48("28205"), !feedbackItem.audio_recording_url)))) && <div className="feedback-item__empty">
                                No feedback content available
                            </div>)}
                    </div>

                    <div className="feedback-item__actions">
                        <button className="feedback-item__edit-btn" onClick={stryMutAct_9fa48("28206") ? () => undefined : (stryCov_9fa48("28206"), () => handleEdit(feedbackItem))}>
                            ✏️ Edit
                        </button>
                        <button className="feedback-item__delete-btn" onClick={stryMutAct_9fa48("28207") ? () => undefined : (stryCov_9fa48("28207"), () => handleDelete(feedbackItem.feedback_id))}>
                            🗑️ Delete
                        </button>
                    </div>

                    <div className="feedback-item__meta">
                        <small>
                            Submitted on {formatDate(feedbackItem.created_at)}
                            {stryMutAct_9fa48("28210") ? feedbackItem.updated_at !== feedbackItem.created_at || <span> • Updated on {formatDate(feedbackItem.updated_at)}</span> : stryMutAct_9fa48("28209") ? false : stryMutAct_9fa48("28208") ? true : (stryCov_9fa48("28208", "28209", "28210"), (stryMutAct_9fa48("28212") ? feedbackItem.updated_at === feedbackItem.created_at : stryMutAct_9fa48("28211") ? true : (stryCov_9fa48("28211", "28212"), feedbackItem.updated_at !== feedbackItem.created_at)) && <span> • Updated on {formatDate(feedbackItem.updated_at)}</span>)}
                        </small>
                    </div>
                </div>))}

            {/* Edit Modal */}
            {stryMutAct_9fa48("28215") ? editingFeedback || <FeedbackModal isOpen={isEditModalOpen} onClose={() => {
        setIsEditModalOpen(false);
        setEditingFeedback(null);
      }} onSubmit={handleEditSubmit} token={token} isEditing={true} initialData={{
        feedbackDate: editingFeedback.feedback_date,
        feedbackType: editingFeedback.feedback_type,
        overallExperience: editingFeedback.overall_experience || '',
        improvementSuggestions: editingFeedback.improvement_suggestions || '',
        specificFeedback: editingFeedback.specific_feedback || '',
        audioRecordingUrl: editingFeedback.audio_recording_url || ''
      }} /> : stryMutAct_9fa48("28214") ? false : stryMutAct_9fa48("28213") ? true : (stryCov_9fa48("28213", "28214", "28215"), editingFeedback && <FeedbackModal isOpen={isEditModalOpen} onClose={() => {
        if (stryMutAct_9fa48("28216")) {
          {}
        } else {
          stryCov_9fa48("28216");
          setIsEditModalOpen(stryMutAct_9fa48("28217") ? true : (stryCov_9fa48("28217"), false));
          setEditingFeedback(null);
        }
      }} onSubmit={handleEditSubmit} token={token} isEditing={stryMutAct_9fa48("28218") ? false : (stryCov_9fa48("28218"), true)} initialData={stryMutAct_9fa48("28219") ? {} : (stryCov_9fa48("28219"), {
        feedbackDate: editingFeedback.feedback_date,
        feedbackType: editingFeedback.feedback_type,
        overallExperience: stryMutAct_9fa48("28222") ? editingFeedback.overall_experience && '' : stryMutAct_9fa48("28221") ? false : stryMutAct_9fa48("28220") ? true : (stryCov_9fa48("28220", "28221", "28222"), editingFeedback.overall_experience || (stryMutAct_9fa48("28223") ? "Stryker was here!" : (stryCov_9fa48("28223"), ''))),
        improvementSuggestions: stryMutAct_9fa48("28226") ? editingFeedback.improvement_suggestions && '' : stryMutAct_9fa48("28225") ? false : stryMutAct_9fa48("28224") ? true : (stryCov_9fa48("28224", "28225", "28226"), editingFeedback.improvement_suggestions || (stryMutAct_9fa48("28227") ? "Stryker was here!" : (stryCov_9fa48("28227"), ''))),
        specificFeedback: stryMutAct_9fa48("28230") ? editingFeedback.specific_feedback && '' : stryMutAct_9fa48("28229") ? false : stryMutAct_9fa48("28228") ? true : (stryCov_9fa48("28228", "28229", "28230"), editingFeedback.specific_feedback || (stryMutAct_9fa48("28231") ? "Stryker was here!" : (stryCov_9fa48("28231"), ''))),
        audioRecordingUrl: stryMutAct_9fa48("28234") ? editingFeedback.audio_recording_url && '' : stryMutAct_9fa48("28233") ? false : stryMutAct_9fa48("28232") ? true : (stryCov_9fa48("28232", "28233", "28234"), editingFeedback.audio_recording_url || (stryMutAct_9fa48("28235") ? "Stryker was here!" : (stryCov_9fa48("28235"), '')))
      })} />)}
        </div>;
  }
}
export default FeedbackList;