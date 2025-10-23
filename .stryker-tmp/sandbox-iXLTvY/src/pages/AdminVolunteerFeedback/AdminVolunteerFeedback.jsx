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
import './AdminVolunteerFeedback.css';
function AdminVolunteerFeedback() {
  if (stryMutAct_9fa48("5893")) {
    {}
  } else {
    stryCov_9fa48("5893");
    const {
      user,
      token
    } = useAuth();
    const [feedback, setFeedback] = useState(stryMutAct_9fa48("5894") ? ["Stryker was here"] : (stryCov_9fa48("5894"), []));
    const [filteredFeedback, setFilteredFeedback] = useState(stryMutAct_9fa48("5895") ? ["Stryker was here"] : (stryCov_9fa48("5895"), []));
    const [isLoading, setIsLoading] = useState(stryMutAct_9fa48("5896") ? false : (stryCov_9fa48("5896"), true));
    const [error, setError] = useState(null);

    // Filter state
    const [selectedEventType, setSelectedEventType] = useState(stryMutAct_9fa48("5897") ? "Stryker was here!" : (stryCov_9fa48("5897"), ''));
    const [startDate, setStartDate] = useState(stryMutAct_9fa48("5898") ? "Stryker was here!" : (stryCov_9fa48("5898"), ''));
    const [endDate, setEndDate] = useState(stryMutAct_9fa48("5899") ? "Stryker was here!" : (stryCov_9fa48("5899"), ''));
    const [volunteerName, setVolunteerName] = useState(stryMutAct_9fa48("5900") ? "Stryker was here!" : (stryCov_9fa48("5900"), ''));

    // Available event types
    const eventTypes = stryMutAct_9fa48("5901") ? [] : (stryCov_9fa48("5901"), [stryMutAct_9fa48("5902") ? "" : (stryCov_9fa48("5902"), 'AI Native Class'), stryMutAct_9fa48("5903") ? "" : (stryCov_9fa48("5903"), 'Demo Day'), stryMutAct_9fa48("5904") ? "" : (stryCov_9fa48("5904"), 'Networking Event'), stryMutAct_9fa48("5905") ? "" : (stryCov_9fa48("5905"), 'Panel'), stryMutAct_9fa48("5906") ? "" : (stryCov_9fa48("5906"), 'Mock Interview')]);
    const applyFilters = () => {
      if (stryMutAct_9fa48("5907")) {
        {}
      } else {
        stryCov_9fa48("5907");
        let filtered = stryMutAct_9fa48("5908") ? [] : (stryCov_9fa48("5908"), [...feedback]);

        // Filter by event type
        if (stryMutAct_9fa48("5910") ? false : stryMutAct_9fa48("5909") ? true : (stryCov_9fa48("5909", "5910"), selectedEventType)) {
          if (stryMutAct_9fa48("5911")) {
            {}
          } else {
            stryCov_9fa48("5911");
            filtered = stryMutAct_9fa48("5912") ? filtered : (stryCov_9fa48("5912"), filtered.filter(stryMutAct_9fa48("5913") ? () => undefined : (stryCov_9fa48("5913"), item => stryMutAct_9fa48("5916") ? item.feedback_type !== selectedEventType : stryMutAct_9fa48("5915") ? false : stryMutAct_9fa48("5914") ? true : (stryCov_9fa48("5914", "5915", "5916"), item.feedback_type === selectedEventType))));
          }
        }

        // Filter by date range
        if (stryMutAct_9fa48("5918") ? false : stryMutAct_9fa48("5917") ? true : (stryCov_9fa48("5917", "5918"), startDate)) {
          if (stryMutAct_9fa48("5919")) {
            {}
          } else {
            stryCov_9fa48("5919");
            filtered = stryMutAct_9fa48("5920") ? filtered : (stryCov_9fa48("5920"), filtered.filter(stryMutAct_9fa48("5921") ? () => undefined : (stryCov_9fa48("5921"), item => stryMutAct_9fa48("5925") ? new Date(item.feedback_date) < new Date(startDate) : stryMutAct_9fa48("5924") ? new Date(item.feedback_date) > new Date(startDate) : stryMutAct_9fa48("5923") ? false : stryMutAct_9fa48("5922") ? true : (stryCov_9fa48("5922", "5923", "5924", "5925"), new Date(item.feedback_date) >= new Date(startDate)))));
          }
        }
        if (stryMutAct_9fa48("5927") ? false : stryMutAct_9fa48("5926") ? true : (stryCov_9fa48("5926", "5927"), endDate)) {
          if (stryMutAct_9fa48("5928")) {
            {}
          } else {
            stryCov_9fa48("5928");
            filtered = stryMutAct_9fa48("5929") ? filtered : (stryCov_9fa48("5929"), filtered.filter(stryMutAct_9fa48("5930") ? () => undefined : (stryCov_9fa48("5930"), item => stryMutAct_9fa48("5934") ? new Date(item.feedback_date) > new Date(endDate) : stryMutAct_9fa48("5933") ? new Date(item.feedback_date) < new Date(endDate) : stryMutAct_9fa48("5932") ? false : stryMutAct_9fa48("5931") ? true : (stryCov_9fa48("5931", "5932", "5933", "5934"), new Date(item.feedback_date) <= new Date(endDate)))));
          }
        }

        // Filter by volunteer name (search in first name, last name, or email)
        if (stryMutAct_9fa48("5936") ? false : stryMutAct_9fa48("5935") ? true : (stryCov_9fa48("5935", "5936"), volunteerName)) {
          if (stryMutAct_9fa48("5937")) {
            {}
          } else {
            stryCov_9fa48("5937");
            const searchTerm = stryMutAct_9fa48("5938") ? volunteerName.toUpperCase() : (stryCov_9fa48("5938"), volunteerName.toLowerCase());
            filtered = stryMutAct_9fa48("5939") ? filtered : (stryCov_9fa48("5939"), filtered.filter(stryMutAct_9fa48("5940") ? () => undefined : (stryCov_9fa48("5940"), item => stryMutAct_9fa48("5943") ? (item.first_name.toLowerCase().includes(searchTerm) || item.last_name.toLowerCase().includes(searchTerm) || item.email.toLowerCase().includes(searchTerm)) && `${item.first_name} ${item.last_name}`.toLowerCase().includes(searchTerm) : stryMutAct_9fa48("5942") ? false : stryMutAct_9fa48("5941") ? true : (stryCov_9fa48("5941", "5942", "5943"), (stryMutAct_9fa48("5945") ? (item.first_name.toLowerCase().includes(searchTerm) || item.last_name.toLowerCase().includes(searchTerm)) && item.email.toLowerCase().includes(searchTerm) : stryMutAct_9fa48("5944") ? false : (stryCov_9fa48("5944", "5945"), (stryMutAct_9fa48("5947") ? item.first_name.toLowerCase().includes(searchTerm) && item.last_name.toLowerCase().includes(searchTerm) : stryMutAct_9fa48("5946") ? false : (stryCov_9fa48("5946", "5947"), (stryMutAct_9fa48("5948") ? item.first_name.toUpperCase().includes(searchTerm) : (stryCov_9fa48("5948"), item.first_name.toLowerCase().includes(searchTerm))) || (stryMutAct_9fa48("5949") ? item.last_name.toUpperCase().includes(searchTerm) : (stryCov_9fa48("5949"), item.last_name.toLowerCase().includes(searchTerm))))) || (stryMutAct_9fa48("5950") ? item.email.toUpperCase().includes(searchTerm) : (stryCov_9fa48("5950"), item.email.toLowerCase().includes(searchTerm))))) || (stryMutAct_9fa48("5951") ? `${item.first_name} ${item.last_name}`.toUpperCase().includes(searchTerm) : (stryCov_9fa48("5951"), (stryMutAct_9fa48("5952") ? `` : (stryCov_9fa48("5952"), `${item.first_name} ${item.last_name}`)).toLowerCase().includes(searchTerm)))))));
          }
        }
        setFilteredFeedback(filtered);
      }
    };
    useEffect(() => {
      if (stryMutAct_9fa48("5953")) {
        {}
      } else {
        stryCov_9fa48("5953");
        if (stryMutAct_9fa48("5956") ? user || token : stryMutAct_9fa48("5955") ? false : stryMutAct_9fa48("5954") ? true : (stryCov_9fa48("5954", "5955", "5956"), user && token)) {
          if (stryMutAct_9fa48("5957")) {
            {}
          } else {
            stryCov_9fa48("5957");
            fetchAllFeedback();
          }
        } else {
          if (stryMutAct_9fa48("5958")) {
            {}
          } else {
            stryCov_9fa48("5958");
            setIsLoading(stryMutAct_9fa48("5959") ? true : (stryCov_9fa48("5959"), false));
          }
        }
      }
    }, stryMutAct_9fa48("5960") ? [] : (stryCov_9fa48("5960"), [user, token]));

    // Apply filters when feedback or filter values change
    useEffect(() => {
      if (stryMutAct_9fa48("5961")) {
        {}
      } else {
        stryCov_9fa48("5961");
        applyFilters();
      }
    }, stryMutAct_9fa48("5962") ? [] : (stryCov_9fa48("5962"), [feedback, selectedEventType, startDate, endDate, volunteerName]));
    const fetchAllFeedback = async () => {
      if (stryMutAct_9fa48("5963")) {
        {}
      } else {
        stryCov_9fa48("5963");
        try {
          if (stryMutAct_9fa48("5964")) {
            {}
          } else {
            stryCov_9fa48("5964");
            const response = await fetch(stryMutAct_9fa48("5965") ? `` : (stryCov_9fa48("5965"), `${import.meta.env.VITE_API_URL}/api/volunteer-feedback/all`), stryMutAct_9fa48("5966") ? {} : (stryCov_9fa48("5966"), {
              headers: stryMutAct_9fa48("5967") ? {} : (stryCov_9fa48("5967"), {
                'Authorization': stryMutAct_9fa48("5968") ? `` : (stryCov_9fa48("5968"), `Bearer ${token}`),
                'Content-Type': stryMutAct_9fa48("5969") ? "" : (stryCov_9fa48("5969"), 'application/json')
              })
            }));
            if (stryMutAct_9fa48("5971") ? false : stryMutAct_9fa48("5970") ? true : (stryCov_9fa48("5970", "5971"), response.ok)) {
              if (stryMutAct_9fa48("5972")) {
                {}
              } else {
                stryCov_9fa48("5972");
                const data = await response.json();
                setFeedback(stryMutAct_9fa48("5975") ? data.feedback && [] : stryMutAct_9fa48("5974") ? false : stryMutAct_9fa48("5973") ? true : (stryCov_9fa48("5973", "5974", "5975"), data.feedback || (stryMutAct_9fa48("5976") ? ["Stryker was here"] : (stryCov_9fa48("5976"), []))));
              }
            } else {
              if (stryMutAct_9fa48("5977")) {
                {}
              } else {
                stryCov_9fa48("5977");
                const errorData = await response.json().catch(stryMutAct_9fa48("5978") ? () => undefined : (stryCov_9fa48("5978"), () => ({})));
                throw new Error(stryMutAct_9fa48("5981") ? errorData.error && `Failed to fetch feedback (${response.status})` : stryMutAct_9fa48("5980") ? false : stryMutAct_9fa48("5979") ? true : (stryCov_9fa48("5979", "5980", "5981"), errorData.error || (stryMutAct_9fa48("5982") ? `` : (stryCov_9fa48("5982"), `Failed to fetch feedback (${response.status})`))));
              }
            }
          }
        } catch (error) {
          if (stryMutAct_9fa48("5983")) {
            {}
          } else {
            stryCov_9fa48("5983");
            console.error(stryMutAct_9fa48("5984") ? "" : (stryCov_9fa48("5984"), 'Error fetching feedback:'), error);
            setError(stryMutAct_9fa48("5985") ? "" : (stryCov_9fa48("5985"), 'Failed to load feedback. Please try again.'));
          }
        } finally {
          if (stryMutAct_9fa48("5986")) {
            {}
          } else {
            stryCov_9fa48("5986");
            setIsLoading(stryMutAct_9fa48("5987") ? true : (stryCov_9fa48("5987"), false));
          }
        }
      }
    };
    const clearFilters = () => {
      if (stryMutAct_9fa48("5988")) {
        {}
      } else {
        stryCov_9fa48("5988");
        setSelectedEventType(stryMutAct_9fa48("5989") ? "Stryker was here!" : (stryCov_9fa48("5989"), ''));
        setStartDate(stryMutAct_9fa48("5990") ? "Stryker was here!" : (stryCov_9fa48("5990"), ''));
        setEndDate(stryMutAct_9fa48("5991") ? "Stryker was here!" : (stryCov_9fa48("5991"), ''));
        setVolunteerName(stryMutAct_9fa48("5992") ? "Stryker was here!" : (stryCov_9fa48("5992"), ''));
      }
    };
    const formatDate = dateString => {
      if (stryMutAct_9fa48("5993")) {
        {}
      } else {
        stryCov_9fa48("5993");
        return new Date(dateString).toLocaleDateString(stryMutAct_9fa48("5994") ? "" : (stryCov_9fa48("5994"), 'en-US'), stryMutAct_9fa48("5995") ? {} : (stryCov_9fa48("5995"), {
          year: stryMutAct_9fa48("5996") ? "" : (stryCov_9fa48("5996"), 'numeric'),
          month: stryMutAct_9fa48("5997") ? "" : (stryCov_9fa48("5997"), 'short'),
          day: stryMutAct_9fa48("5998") ? "" : (stryCov_9fa48("5998"), 'numeric')
        }));
      }
    };

    // Check if user is admin or staff
    if (stryMutAct_9fa48("6001") ? user?.role !== 'admin' || user?.role !== 'staff' : stryMutAct_9fa48("6000") ? false : stryMutAct_9fa48("5999") ? true : (stryCov_9fa48("5999", "6000", "6001"), (stryMutAct_9fa48("6003") ? user?.role === 'admin' : stryMutAct_9fa48("6002") ? true : (stryCov_9fa48("6002", "6003"), (stryMutAct_9fa48("6004") ? user.role : (stryCov_9fa48("6004"), user?.role)) !== (stryMutAct_9fa48("6005") ? "" : (stryCov_9fa48("6005"), 'admin')))) && (stryMutAct_9fa48("6007") ? user?.role === 'staff' : stryMutAct_9fa48("6006") ? true : (stryCov_9fa48("6006", "6007"), (stryMutAct_9fa48("6008") ? user.role : (stryCov_9fa48("6008"), user?.role)) !== (stryMutAct_9fa48("6009") ? "" : (stryCov_9fa48("6009"), 'staff')))))) {
      if (stryMutAct_9fa48("6010")) {
        {}
      } else {
        stryCov_9fa48("6010");
        return <div className="admin-volunteer-feedback">
                <div className="admin-volunteer-feedback__error">
                    <h2>Access Denied</h2>
                    <p>This page is only available to administrators and staff.</p>
                </div>
            </div>;
      }
    }
    return <div className="admin-volunteer-feedback">
            <div className="admin-volunteer-feedback__header">
                <h1>Volunteer Feedback Administration</h1>
                <p>View and manage feedback from all volunteers across events.</p>
            </div>

            {/* Filters Section */}
            <div className="admin-volunteer-feedback__filters">
                <h2>Filters</h2>
                <div className="admin-volunteer-feedback__filter-row">
                    <div className="admin-volunteer-feedback__filter-group">
                        <label htmlFor="event-type">Event Type:</label>
                        <select id="event-type" value={selectedEventType} onChange={stryMutAct_9fa48("6011") ? () => undefined : (stryCov_9fa48("6011"), e => setSelectedEventType(e.target.value))} className="admin-volunteer-feedback__select">
                            <option value="">All Event Types</option>
                            {eventTypes.map(stryMutAct_9fa48("6012") ? () => undefined : (stryCov_9fa48("6012"), type => <option key={type} value={type}>{type}</option>))}
                        </select>
                    </div>

                    <div className="admin-volunteer-feedback__filter-group">
                        <label htmlFor="start-date">Start Date:</label>
                        <input type="date" id="start-date" value={startDate} onChange={stryMutAct_9fa48("6013") ? () => undefined : (stryCov_9fa48("6013"), e => setStartDate(e.target.value))} className="admin-volunteer-feedback__input" placeholder="Select start date" />
                    </div>

                    <div className="admin-volunteer-feedback__filter-group">
                        <label htmlFor="end-date">End Date:</label>
                        <input type="date" id="end-date" value={endDate} onChange={stryMutAct_9fa48("6014") ? () => undefined : (stryCov_9fa48("6014"), e => setEndDate(e.target.value))} className="admin-volunteer-feedback__input" placeholder="Select end date" />
                    </div>

                    <div className="admin-volunteer-feedback__filter-group">
                        <label htmlFor="volunteer-name">Volunteer Name:</label>
                        <input type="text" id="volunteer-name" value={volunteerName} onChange={stryMutAct_9fa48("6015") ? () => undefined : (stryCov_9fa48("6015"), e => setVolunteerName(e.target.value))} className="admin-volunteer-feedback__input" placeholder="Search by name or email..." />
                    </div>

                    <button onClick={clearFilters} className="admin-volunteer-feedback__clear-btn">
                        Clear Filters
                    </button>
                </div>
            </div>

            {/* Results Summary */}
            <div className="admin-volunteer-feedback__summary">
                <p>
                    Showing {filteredFeedback.length} of {feedback.length} feedback entries
                </p>
            </div>

            {/* Feedback Content */}
            <div className="admin-volunteer-feedback__content">
                {isLoading ? <div className="admin-volunteer-feedback__loading">
                        Loading volunteer feedback...
                    </div> : error ? <div className="admin-volunteer-feedback__error">
                        {error}
                    </div> : (stryMutAct_9fa48("6018") ? filteredFeedback.length !== 0 : stryMutAct_9fa48("6017") ? false : stryMutAct_9fa48("6016") ? true : (stryCov_9fa48("6016", "6017", "6018"), filteredFeedback.length === 0)) ? <div className="admin-volunteer-feedback__empty">
                        {(stryMutAct_9fa48("6021") ? feedback.length !== 0 : stryMutAct_9fa48("6020") ? false : stryMutAct_9fa48("6019") ? true : (stryCov_9fa48("6019", "6020", "6021"), feedback.length === 0)) ? <p>No volunteer feedback has been submitted yet.</p> : <p>No feedback matches the current filters. Try adjusting your search criteria.</p>}
                    </div> : <div className="admin-volunteer-feedback__list">
                        {filteredFeedback.map(stryMutAct_9fa48("6022") ? () => undefined : (stryCov_9fa48("6022"), item => <div key={item.feedback_id} className="admin-volunteer-feedback__item">
                                <div className="admin-volunteer-feedback__item-header">
                                    <div className="admin-volunteer-feedback__volunteer-info">
                                        <h3>{item.first_name} {item.last_name}</h3>
                                        <span className="admin-volunteer-feedback__email">{item.email}</span>
                                    </div>
                                    <div className="admin-volunteer-feedback__event-info">
                                        <span className="admin-volunteer-feedback__event-type">
                                            {item.feedback_type}
                                        </span>
                                        <span className="admin-volunteer-feedback__date">
                                            {formatDate(item.feedback_date)}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="admin-volunteer-feedback__content-section">
                                    {stryMutAct_9fa48("6025") ? item.overall_experience || <div className="admin-volunteer-feedback__question">
                                            <h4>How was your experience overall?</h4>
                                            <p>{item.overall_experience}</p>
                                        </div> : stryMutAct_9fa48("6024") ? false : stryMutAct_9fa48("6023") ? true : (stryCov_9fa48("6023", "6024", "6025"), item.overall_experience && <div className="admin-volunteer-feedback__question">
                                            <h4>How was your experience overall?</h4>
                                            <p>{item.overall_experience}</p>
                                        </div>)}
                                    
                                    {stryMutAct_9fa48("6028") ? item.improvement_suggestions || <div className="admin-volunteer-feedback__question">
                                            <h4>How could we improve going forward?</h4>
                                            <p>{item.improvement_suggestions}</p>
                                        </div> : stryMutAct_9fa48("6027") ? false : stryMutAct_9fa48("6026") ? true : (stryCov_9fa48("6026", "6027", "6028"), item.improvement_suggestions && <div className="admin-volunteer-feedback__question">
                                            <h4>How could we improve going forward?</h4>
                                            <p>{item.improvement_suggestions}</p>
                                        </div>)}
                                    
                                    {stryMutAct_9fa48("6031") ? item.specific_feedback || <div className="admin-volunteer-feedback__question">
                                            <h4>Do you have feedback to share on specific Builders or Fellows?</h4>
                                            <p>{item.specific_feedback}</p>
                                        </div> : stryMutAct_9fa48("6030") ? false : stryMutAct_9fa48("6029") ? true : (stryCov_9fa48("6029", "6030", "6031"), item.specific_feedback && <div className="admin-volunteer-feedback__question">
                                            <h4>Do you have feedback to share on specific Builders or Fellows?</h4>
                                            <p>{item.specific_feedback}</p>
                                        </div>)}
                                    
                                    {stryMutAct_9fa48("6034") ? item.audio_recording_url || <div className="admin-volunteer-feedback__audio">
                                            <h4>Audio Recording:</h4>
                                            <audio controls>
                                                <source src={item.audio_recording_url} type="audio/mpeg" />
                                                Your browser does not support the audio element.
                                            </audio>
                                        </div> : stryMutAct_9fa48("6033") ? false : stryMutAct_9fa48("6032") ? true : (stryCov_9fa48("6032", "6033", "6034"), item.audio_recording_url && <div className="admin-volunteer-feedback__audio">
                                            <h4>Audio Recording:</h4>
                                            <audio controls>
                                                <source src={item.audio_recording_url} type="audio/mpeg" />
                                                Your browser does not support the audio element.
                                            </audio>
                                        </div>)}
                                </div>
                                
                                <div className="admin-volunteer-feedback__metadata">
                                    <small>
                                        Submitted: {formatDate(item.created_at)}
                                    </small>
                                </div>
                            </div>))}
                    </div>}
            </div>
        </div>;
  }
}
export default AdminVolunteerFeedback;