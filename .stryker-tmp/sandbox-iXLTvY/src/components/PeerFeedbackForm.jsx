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
import { FaCheck, FaTimes, FaExclamationCircle, FaUsers, FaUser, FaSpinner, FaExclamationTriangle, FaSearch, FaFilter, FaCheckSquare, FaSquare } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import './PeerFeedbackForm.css';
const PeerFeedbackForm = ({
  dayNumber,
  onComplete,
  onCancel
}) => {
  if (stryMutAct_9fa48("2316")) {
    {}
  } else {
    stryCov_9fa48("2316");
    const {
      user
    } = useAuth();
    const isActive = stryMutAct_9fa48("2319") ? user?.active === false : stryMutAct_9fa48("2318") ? false : stryMutAct_9fa48("2317") ? true : (stryCov_9fa48("2317", "2318", "2319"), (stryMutAct_9fa48("2320") ? user.active : (stryCov_9fa48("2320"), user?.active)) !== (stryMutAct_9fa48("2321") ? true : (stryCov_9fa48("2321"), false)));
    const [users, setUsers] = useState(stryMutAct_9fa48("2322") ? ["Stryker was here"] : (stryCov_9fa48("2322"), []));
    const [loading, setLoading] = useState(stryMutAct_9fa48("2323") ? false : (stryCov_9fa48("2323"), true));
    const [error, setError] = useState(null);
    const [submitError, setSubmitError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(stryMutAct_9fa48("2324") ? true : (stryCov_9fa48("2324"), false));

    // Search filter state
    const [searchTerm, setSearchTerm] = useState(stryMutAct_9fa48("2325") ? "Stryker was here!" : (stryCov_9fa48("2325"), ''));

    // Selected peers and their feedback
    const [selectedPeers, setSelectedPeers] = useState(stryMutAct_9fa48("2326") ? ["Stryker was here"] : (stryCov_9fa48("2326"), []));
    const [peerFeedback, setPeerFeedback] = useState({});

    // Process the user name for capitalization
    const formatName = name => {
      if (stryMutAct_9fa48("2327")) {
        {}
      } else {
        stryCov_9fa48("2327");
        if (stryMutAct_9fa48("2330") ? false : stryMutAct_9fa48("2329") ? true : stryMutAct_9fa48("2328") ? name : (stryCov_9fa48("2328", "2329", "2330"), !name)) return stryMutAct_9fa48("2331") ? "Stryker was here!" : (stryCov_9fa48("2331"), '');
        return stryMutAct_9fa48("2332") ? name.charAt(0).toUpperCase() - name.slice(1).toLowerCase() : (stryCov_9fa48("2332"), (stryMutAct_9fa48("2334") ? name.toUpperCase() : stryMutAct_9fa48("2333") ? name.charAt(0).toLowerCase() : (stryCov_9fa48("2333", "2334"), name.charAt(0).toUpperCase())) + (stryMutAct_9fa48("2336") ? name.toLowerCase() : stryMutAct_9fa48("2335") ? name.slice(1).toUpperCase() : (stryCov_9fa48("2335", "2336"), name.slice(1).toLowerCase())));
      }
    };

    // Fetch all users for the dropdown
    useEffect(() => {
      if (stryMutAct_9fa48("2337")) {
        {}
      } else {
        stryCov_9fa48("2337");
        const fetchUsers = async () => {
          if (stryMutAct_9fa48("2338")) {
            {}
          } else {
            stryCov_9fa48("2338");
            try {
              if (stryMutAct_9fa48("2339")) {
                {}
              } else {
                stryCov_9fa48("2339");
                setLoading(stryMutAct_9fa48("2340") ? false : (stryCov_9fa48("2340"), true));

                // Get current user's cohort from auth context
                const userCohort = stryMutAct_9fa48("2341") ? user.cohort : (stryCov_9fa48("2341"), user?.cohort);
                if (stryMutAct_9fa48("2344") ? false : stryMutAct_9fa48("2343") ? true : stryMutAct_9fa48("2342") ? userCohort : (stryCov_9fa48("2342", "2343", "2344"), !userCohort)) {
                  if (stryMutAct_9fa48("2345")) {
                    {}
                  } else {
                    stryCov_9fa48("2345");
                    setError(stryMutAct_9fa48("2346") ? "" : (stryCov_9fa48("2346"), 'Unable to determine your cohort. Please contact support.'));
                    setLoading(stryMutAct_9fa48("2347") ? true : (stryCov_9fa48("2347"), false));
                    return;
                  }
                }

                // Fetch active builders from the same cohort
                const response = await fetch(stryMutAct_9fa48("2348") ? `` : (stryCov_9fa48("2348"), `${import.meta.env.VITE_API_URL}/api/users?cohort=${encodeURIComponent(userCohort)}`), stryMutAct_9fa48("2349") ? {} : (stryCov_9fa48("2349"), {
                  headers: stryMutAct_9fa48("2350") ? {} : (stryCov_9fa48("2350"), {
                    'Authorization': stryMutAct_9fa48("2351") ? `` : (stryCov_9fa48("2351"), `Bearer ${localStorage.getItem(stryMutAct_9fa48("2352") ? "" : (stryCov_9fa48("2352"), 'token'))}`)
                  })
                }));
                if (stryMutAct_9fa48("2355") ? false : stryMutAct_9fa48("2354") ? true : stryMutAct_9fa48("2353") ? response.ok : (stryCov_9fa48("2353", "2354", "2355"), !response.ok)) {
                  if (stryMutAct_9fa48("2356")) {
                    {}
                  } else {
                    stryCov_9fa48("2356");
                    throw new Error(stryMutAct_9fa48("2357") ? "" : (stryCov_9fa48("2357"), 'Failed to load users'));
                  }
                }
                const data = await response.json();

                // Filter out the current user (they shouldn't give feedback to themselves)
                const otherUsers = stryMutAct_9fa48("2358") ? data : (stryCov_9fa48("2358"), data.filter(stryMutAct_9fa48("2359") ? () => undefined : (stryCov_9fa48("2359"), u => stryMutAct_9fa48("2362") ? u.user_id === user.user_id : stryMutAct_9fa48("2361") ? false : stryMutAct_9fa48("2360") ? true : (stryCov_9fa48("2360", "2361", "2362"), u.user_id !== user.user_id))));

                // Check if there are any other users in this cohort
                if (stryMutAct_9fa48("2365") ? otherUsers.length !== 0 : stryMutAct_9fa48("2364") ? false : stryMutAct_9fa48("2363") ? true : (stryCov_9fa48("2363", "2364", "2365"), otherUsers.length === 0)) {
                  if (stryMutAct_9fa48("2366")) {
                    {}
                  } else {
                    stryCov_9fa48("2366");
                    setError(stryMutAct_9fa48("2367") ? "" : (stryCov_9fa48("2367"), 'No other users found in your cohort. You may be the only active builder in your cohort currently.'));
                    setLoading(stryMutAct_9fa48("2368") ? true : (stryCov_9fa48("2368"), false));
                    return;
                  }
                }

                // Sort users alphabetically by first name, then last name
                const sortedUsers = stryMutAct_9fa48("2369") ? otherUsers : (stryCov_9fa48("2369"), otherUsers.sort((a, b) => {
                  if (stryMutAct_9fa48("2370")) {
                    {}
                  } else {
                    stryCov_9fa48("2370");
                    const nameA = stryMutAct_9fa48("2371") ? `` : (stryCov_9fa48("2371"), `${stryMutAct_9fa48("2372") ? a.first_name.toUpperCase() : (stryCov_9fa48("2372"), a.first_name.toLowerCase())} ${stryMutAct_9fa48("2373") ? a.last_name.toUpperCase() : (stryCov_9fa48("2373"), a.last_name.toLowerCase())}`);
                    const nameB = stryMutAct_9fa48("2374") ? `` : (stryCov_9fa48("2374"), `${stryMutAct_9fa48("2375") ? b.first_name.toUpperCase() : (stryCov_9fa48("2375"), b.first_name.toLowerCase())} ${stryMutAct_9fa48("2376") ? b.last_name.toUpperCase() : (stryCov_9fa48("2376"), b.last_name.toLowerCase())}`);
                    return nameA.localeCompare(nameB);
                  }
                }));
                setUsers(sortedUsers);
                setLoading(stryMutAct_9fa48("2377") ? true : (stryCov_9fa48("2377"), false));
              }
            } catch (err) {
              if (stryMutAct_9fa48("2378")) {
                {}
              } else {
                stryCov_9fa48("2378");
                setError(stryMutAct_9fa48("2379") ? "" : (stryCov_9fa48("2379"), 'Failed to load users. Please refresh and try again.'));
                setLoading(stryMutAct_9fa48("2380") ? true : (stryCov_9fa48("2380"), false));
              }
            }
          }
        };
        fetchUsers();
      }
    }, stryMutAct_9fa48("2381") ? [] : (stryCov_9fa48("2381"), [user]));

    // Filter users based on search term
    const filteredUsers = stryMutAct_9fa48("2382") ? users : (stryCov_9fa48("2382"), users.filter(user => {
      if (stryMutAct_9fa48("2383")) {
        {}
      } else {
        stryCov_9fa48("2383");
        const fullName = stryMutAct_9fa48("2384") ? `${user.first_name} ${user.last_name}`.toUpperCase() : (stryCov_9fa48("2384"), (stryMutAct_9fa48("2385") ? `` : (stryCov_9fa48("2385"), `${user.first_name} ${user.last_name}`)).toLowerCase());
        return fullName.includes(stryMutAct_9fa48("2386") ? searchTerm.toUpperCase() : (stryCov_9fa48("2386"), searchTerm.toLowerCase()));
      }
    }));

    // Handle search input change
    const handleSearchChange = e => {
      if (stryMutAct_9fa48("2387")) {
        {}
      } else {
        stryCov_9fa48("2387");
        setSearchTerm(e.target.value);
      }
    };

    // Clear search
    const clearSearch = () => {
      if (stryMutAct_9fa48("2388")) {
        {}
      } else {
        stryCov_9fa48("2388");
        setSearchTerm(stryMutAct_9fa48("2389") ? "Stryker was here!" : (stryCov_9fa48("2389"), ''));
      }
    };

    // Toggle a peer selection
    const togglePeerSelection = userId => {
      if (stryMutAct_9fa48("2390")) {
        {}
      } else {
        stryCov_9fa48("2390");
        if (stryMutAct_9fa48("2393") ? false : stryMutAct_9fa48("2392") ? true : stryMutAct_9fa48("2391") ? isActive : (stryCov_9fa48("2391", "2392", "2393"), !isActive)) return;
        const userIdStr = userId.toString();
        if (stryMutAct_9fa48("2395") ? false : stryMutAct_9fa48("2394") ? true : (stryCov_9fa48("2394", "2395"), selectedPeers.includes(userIdStr))) {
          if (stryMutAct_9fa48("2396")) {
            {}
          } else {
            stryCov_9fa48("2396");
            // Remove from selection
            setSelectedPeers(stryMutAct_9fa48("2397") ? () => undefined : (stryCov_9fa48("2397"), prev => stryMutAct_9fa48("2398") ? prev : (stryCov_9fa48("2398"), prev.filter(stryMutAct_9fa48("2399") ? () => undefined : (stryCov_9fa48("2399"), id => stryMutAct_9fa48("2402") ? id === userIdStr : stryMutAct_9fa48("2401") ? false : stryMutAct_9fa48("2400") ? true : (stryCov_9fa48("2400", "2401", "2402"), id !== userIdStr))))));

            // Remove feedback for this user
            const newFeedback = stryMutAct_9fa48("2403") ? {} : (stryCov_9fa48("2403"), {
              ...peerFeedback
            });
            delete newFeedback[userIdStr];
            setPeerFeedback(newFeedback);
          }
        } else {
          if (stryMutAct_9fa48("2404")) {
            {}
          } else {
            stryCov_9fa48("2404");
            // Add to selection
            setSelectedPeers(stryMutAct_9fa48("2405") ? () => undefined : (stryCov_9fa48("2405"), prev => stryMutAct_9fa48("2406") ? [] : (stryCov_9fa48("2406"), [...prev, userIdStr])));

            // Initialize feedback for this user
            setPeerFeedback(stryMutAct_9fa48("2407") ? () => undefined : (stryCov_9fa48("2407"), prev => stryMutAct_9fa48("2408") ? {} : (stryCov_9fa48("2408"), {
              ...prev,
              [userIdStr]: stryMutAct_9fa48("2409") ? "Stryker was here!" : (stryCov_9fa48("2409"), '')
            })));
          }
        }
      }
    };

    // Handle feedback text changes
    const handleFeedbackChange = (peerId, feedback) => {
      if (stryMutAct_9fa48("2410")) {
        {}
      } else {
        stryCov_9fa48("2410");
        if (stryMutAct_9fa48("2413") ? false : stryMutAct_9fa48("2412") ? true : stryMutAct_9fa48("2411") ? isActive : (stryCov_9fa48("2411", "2412", "2413"), !isActive)) return;
        setPeerFeedback(stryMutAct_9fa48("2414") ? {} : (stryCov_9fa48("2414"), {
          ...peerFeedback,
          [peerId]: feedback
        }));
      }
    };

    // Submit peer feedback
    const handleSubmit = async () => {
      if (stryMutAct_9fa48("2415")) {
        {}
      } else {
        stryCov_9fa48("2415");
        // If user is inactive, don't allow submission
        if (stryMutAct_9fa48("2418") ? false : stryMutAct_9fa48("2417") ? true : stryMutAct_9fa48("2416") ? isActive : (stryCov_9fa48("2416", "2417", "2418"), !isActive)) {
          if (stryMutAct_9fa48("2419")) {
            {}
          } else {
            stryCov_9fa48("2419");
            setSubmitError(stryMutAct_9fa48("2420") ? "" : (stryCov_9fa48("2420"), 'You have historical access only and cannot submit new feedback.'));
            return;
          }
        }

        // Validate that peers are selected
        if (stryMutAct_9fa48("2423") ? selectedPeers.length !== 0 : stryMutAct_9fa48("2422") ? false : stryMutAct_9fa48("2421") ? true : (stryCov_9fa48("2421", "2422", "2423"), selectedPeers.length === 0)) {
          if (stryMutAct_9fa48("2424")) {
            {}
          } else {
            stryCov_9fa48("2424");
            setSubmitError(stryMutAct_9fa48("2425") ? "" : (stryCov_9fa48("2425"), 'Please select at least one peer to provide feedback for.'));
            return;
          }
        }

        // Validate that feedback is provided for all selected peers
        const isComplete = stryMutAct_9fa48("2426") ? selectedPeers.some(peerId => peerFeedback[peerId]?.trim()) : (stryCov_9fa48("2426"), selectedPeers.every(stryMutAct_9fa48("2427") ? () => undefined : (stryCov_9fa48("2427"), peerId => stryMutAct_9fa48("2429") ? peerFeedback[peerId].trim() : stryMutAct_9fa48("2428") ? peerFeedback[peerId] : (stryCov_9fa48("2428", "2429"), peerFeedback[peerId]?.trim()))));
        if (stryMutAct_9fa48("2432") ? false : stryMutAct_9fa48("2431") ? true : stryMutAct_9fa48("2430") ? isComplete : (stryCov_9fa48("2430", "2431", "2432"), !isComplete)) {
          if (stryMutAct_9fa48("2433")) {
            {}
          } else {
            stryCov_9fa48("2433");
            setSubmitError(stryMutAct_9fa48("2434") ? "" : (stryCov_9fa48("2434"), 'Please provide feedback for all selected peers.'));
            return;
          }
        }
        setIsSubmitting(stryMutAct_9fa48("2435") ? false : (stryCov_9fa48("2435"), true));
        setSubmitError(null);
        try {
          if (stryMutAct_9fa48("2436")) {
            {}
          } else {
            stryCov_9fa48("2436");
            // Format the feedback entries
            const feedbackEntries = selectedPeers.map(stryMutAct_9fa48("2437") ? () => undefined : (stryCov_9fa48("2437"), peerId => stryMutAct_9fa48("2438") ? {} : (stryCov_9fa48("2438"), {
              to_user_id: parseInt(peerId),
              feedback_text: peerFeedback[peerId]
            })));

            // Submit to API
            const response = await fetch(stryMutAct_9fa48("2439") ? `` : (stryCov_9fa48("2439"), `${import.meta.env.VITE_API_URL}/api/feedback/submit`), stryMutAct_9fa48("2440") ? {} : (stryCov_9fa48("2440"), {
              method: stryMutAct_9fa48("2441") ? "" : (stryCov_9fa48("2441"), 'POST'),
              headers: stryMutAct_9fa48("2442") ? {} : (stryCov_9fa48("2442"), {
                'Content-Type': stryMutAct_9fa48("2443") ? "" : (stryCov_9fa48("2443"), 'application/json'),
                'Authorization': stryMutAct_9fa48("2444") ? `` : (stryCov_9fa48("2444"), `Bearer ${localStorage.getItem(stryMutAct_9fa48("2445") ? "" : (stryCov_9fa48("2445"), 'token'))}`)
              }),
              body: JSON.stringify(stryMutAct_9fa48("2446") ? {} : (stryCov_9fa48("2446"), {
                feedbackEntries,
                dayNumber: parseInt(dayNumber)
              }))
            }));
            if (stryMutAct_9fa48("2449") ? false : stryMutAct_9fa48("2448") ? true : stryMutAct_9fa48("2447") ? response.ok : (stryCov_9fa48("2447", "2448", "2449"), !response.ok)) {
              if (stryMutAct_9fa48("2450")) {
                {}
              } else {
                stryCov_9fa48("2450");
                const errorData = await response.json();
                throw new Error(stryMutAct_9fa48("2453") ? errorData.error && 'Failed to submit feedback' : stryMutAct_9fa48("2452") ? false : stryMutAct_9fa48("2451") ? true : (stryCov_9fa48("2451", "2452", "2453"), errorData.error || (stryMutAct_9fa48("2454") ? "" : (stryCov_9fa48("2454"), 'Failed to submit feedback'))));
              }
            }

            // Notify parent component that feedback is complete
            onComplete();
          }
        } catch (err) {
          if (stryMutAct_9fa48("2455")) {
            {}
          } else {
            stryCov_9fa48("2455");
            setSubmitError(stryMutAct_9fa48("2458") ? err.message && 'Failed to submit feedback. Please try again.' : stryMutAct_9fa48("2457") ? false : stryMutAct_9fa48("2456") ? true : (stryCov_9fa48("2456", "2457", "2458"), err.message || (stryMutAct_9fa48("2459") ? "" : (stryCov_9fa48("2459"), 'Failed to submit feedback. Please try again.'))));
          }
        } finally {
          if (stryMutAct_9fa48("2460")) {
            {}
          } else {
            stryCov_9fa48("2460");
            setIsSubmitting(stryMutAct_9fa48("2461") ? true : (stryCov_9fa48("2461"), false));
          }
        }
      }
    };
    if (stryMutAct_9fa48("2463") ? false : stryMutAct_9fa48("2462") ? true : (stryCov_9fa48("2462", "2463"), loading)) {
      if (stryMutAct_9fa48("2464")) {
        {}
      } else {
        stryCov_9fa48("2464");
        return <div className="peer-feedback peer-feedback__loading">
        <div className="peer-feedback__loading-spinner">
          <FaSpinner className="peer-feedback__spinner-icon" />
          <p>Loading peer information...</p>
        </div>
      </div>;
      }
    }
    if (stryMutAct_9fa48("2466") ? false : stryMutAct_9fa48("2465") ? true : (stryCov_9fa48("2465", "2466"), error)) {
      if (stryMutAct_9fa48("2467")) {
        {}
      } else {
        stryCov_9fa48("2467");
        return <div className="peer-feedback">
        <div className="peer-feedback__error">
          <FaExclamationTriangle className="peer-feedback__error-icon" />
          <p>{error}</p>
          <button className="peer-feedback__button peer-feedback__button--primary" onClick={onCancel}>
            <FaTimes /> Skip Peer Feedback
          </button>
        </div>
      </div>;
      }
    }

    // Display historical access notice for inactive users
    if (stryMutAct_9fa48("2470") ? false : stryMutAct_9fa48("2469") ? true : stryMutAct_9fa48("2468") ? isActive : (stryCov_9fa48("2468", "2469", "2470"), !isActive)) {
      if (stryMutAct_9fa48("2471")) {
        {}
      } else {
        stryCov_9fa48("2471");
        return <div className="peer-feedback">
        <div className="peer-feedback__historical-notice">
          <FaExclamationTriangle className="peer-feedback__notice-icon" />
          <h3 className="peer-feedback__notice-title">Historical Access Only</h3>
          <p>You have historical access only and cannot submit new peer feedback.</p>
          <button className="peer-feedback__button peer-feedback__button--primary" onClick={onCancel}>
            <FaTimes /> Go Back
          </button>
        </div>
      </div>;
      }
    }
    return <div className="peer-feedback">
      <div className="peer-feedback__content">
        <h3 className="peer-feedback__title"><FaUsers className="peer-feedback__header-icon" /> Peer Feedback</h3>
        <p className="peer-feedback__description">
          Please provide feedback for peers you worked with today. This feedback will be anonymized before being shared.
        </p>
        
        <div className="peer-feedback__form-group">
          <label className="peer-feedback__label">
            <FaUsers className="peer-feedback__input-icon" /> Who was in your group (at your table) today?
          </label>
          
          {/* Search filter for users */}
          <div className="peer-feedback__search-container">
            <div className="peer-feedback__search-input-wrapper">
              <FaSearch className="peer-feedback__search-icon" />
              <input type="text" className="peer-feedback__search-input" placeholder="Search by name..." value={searchTerm} onChange={handleSearchChange} />
              {stryMutAct_9fa48("2474") ? searchTerm || <button className="peer-feedback__search-clear" onClick={clearSearch} aria-label="Clear search">
                  <FaTimes />
                </button> : stryMutAct_9fa48("2473") ? false : stryMutAct_9fa48("2472") ? true : (stryCov_9fa48("2472", "2473", "2474"), searchTerm && <button className="peer-feedback__search-clear" onClick={clearSearch} aria-label="Clear search">
                  <FaTimes />
                </button>)}
            </div>
            {stryMutAct_9fa48("2477") ? searchTerm || <div className="peer-feedback__search-results">
                Showing {filteredUsers.length} of {users.length} people
              </div> : stryMutAct_9fa48("2476") ? false : stryMutAct_9fa48("2475") ? true : (stryCov_9fa48("2475", "2476", "2477"), searchTerm && <div className="peer-feedback__search-results">
                Showing {filteredUsers.length} of {users.length} people
              </div>)}
          </div>
          
          {/* Checkbox list of users */}
          <div className="peer-feedback__user-list">
            {(stryMutAct_9fa48("2481") ? filteredUsers.length <= 0 : stryMutAct_9fa48("2480") ? filteredUsers.length >= 0 : stryMutAct_9fa48("2479") ? false : stryMutAct_9fa48("2478") ? true : (stryCov_9fa48("2478", "2479", "2480", "2481"), filteredUsers.length > 0)) ? filteredUsers.map(stryMutAct_9fa48("2482") ? () => undefined : (stryCov_9fa48("2482"), user => <div key={user.user_id} className={stryMutAct_9fa48("2483") ? `` : (stryCov_9fa48("2483"), `peer-feedback__user-item ${selectedPeers.includes(user.user_id.toString()) ? stryMutAct_9fa48("2484") ? "" : (stryCov_9fa48("2484"), 'selected') : stryMutAct_9fa48("2485") ? "Stryker was here!" : (stryCov_9fa48("2485"), '')}`)} onClick={stryMutAct_9fa48("2486") ? () => undefined : (stryCov_9fa48("2486"), () => togglePeerSelection(user.user_id))}>
                  {selectedPeers.includes(user.user_id.toString()) ? <FaCheckSquare className="peer-feedback__checkbox-icon peer-feedback__checkbox-icon--checked" /> : <FaSquare className="peer-feedback__checkbox-icon" />}
                  <span className="peer-feedback__user-name">
                    {formatName(user.first_name)} {formatName(user.last_name)}
                  </span>
                </div>)) : <div className="peer-feedback__no-results">
                <p>No users match your search</p>
              </div>}
          </div>
          
          {/* Selected users counter */}
          <div className="peer-feedback__selection-summary">
            <span>{selectedPeers.length} {(stryMutAct_9fa48("2489") ? selectedPeers.length !== 1 : stryMutAct_9fa48("2488") ? false : stryMutAct_9fa48("2487") ? true : (stryCov_9fa48("2487", "2488", "2489"), selectedPeers.length === 1)) ? stryMutAct_9fa48("2490") ? "" : (stryCov_9fa48("2490"), 'person') : stryMutAct_9fa48("2491") ? "" : (stryCov_9fa48("2491"), 'people')} selected</span>
          </div>
        </div>
        
        {(stryMutAct_9fa48("2495") ? selectedPeers.length <= 0 : stryMutAct_9fa48("2494") ? selectedPeers.length >= 0 : stryMutAct_9fa48("2493") ? false : stryMutAct_9fa48("2492") ? true : (stryCov_9fa48("2492", "2493", "2494", "2495"), selectedPeers.length > 0)) ? <>
            <p className="peer-feedback__instruction">
              Please provide specific feedback for each peer (positive or constructive):
            </p>
            
            {selectedPeers.map(peerId => {
            if (stryMutAct_9fa48("2496")) {
              {}
            } else {
              stryCov_9fa48("2496");
              const user = users.find(stryMutAct_9fa48("2497") ? () => undefined : (stryCov_9fa48("2497"), u => stryMutAct_9fa48("2500") ? u.user_id.toString() !== peerId : stryMutAct_9fa48("2499") ? false : stryMutAct_9fa48("2498") ? true : (stryCov_9fa48("2498", "2499", "2500"), u.user_id.toString() === peerId)));
              if (stryMutAct_9fa48("2503") ? false : stryMutAct_9fa48("2502") ? true : stryMutAct_9fa48("2501") ? user : (stryCov_9fa48("2501", "2502", "2503"), !user)) return null; // Skip if user not found

              return <div className="peer-feedback__form-group" key={peerId}>
                  <label htmlFor={stryMutAct_9fa48("2504") ? `` : (stryCov_9fa48("2504"), `feedback-${peerId}`)} className="peer-feedback__label">
                    <FaUser className="peer-feedback__input-icon" /> {formatName(user.first_name)} {formatName(user.last_name)}
                  </label>
                  <textarea id={stryMutAct_9fa48("2505") ? `` : (stryCov_9fa48("2505"), `feedback-${peerId}`)} className="peer-feedback__textarea" rows="3" value={stryMutAct_9fa48("2508") ? peerFeedback[peerId] && '' : stryMutAct_9fa48("2507") ? false : stryMutAct_9fa48("2506") ? true : (stryCov_9fa48("2506", "2507", "2508"), peerFeedback[peerId] || (stryMutAct_9fa48("2509") ? "Stryker was here!" : (stryCov_9fa48("2509"), '')))} onChange={stryMutAct_9fa48("2510") ? () => undefined : (stryCov_9fa48("2510"), e => handleFeedbackChange(peerId, e.target.value))} placeholder={stryMutAct_9fa48("2511") ? `` : (stryCov_9fa48("2511"), `Your feedback for ${formatName(user.first_name)}...`)} disabled={stryMutAct_9fa48("2512") ? isActive : (stryCov_9fa48("2512"), !isActive)} />
                </div>;
            }
          })}
            
            {stryMutAct_9fa48("2515") ? submitError || <div className="peer-feedback__submit-error">
                <FaExclamationCircle /> {submitError}
              </div> : stryMutAct_9fa48("2514") ? false : stryMutAct_9fa48("2513") ? true : (stryCov_9fa48("2513", "2514", "2515"), submitError && <div className="peer-feedback__submit-error">
                <FaExclamationCircle /> {submitError}
              </div>)}
          </> : <>
            <div className="peer-feedback__empty-selection">
              <FaUsers className="peer-feedback__empty-icon" />
              <p>Select at least one peer to provide feedback</p>
            </div>
          </>}
      </div>
      
      <div className="peer-feedback__actions">
        <button className="peer-feedback__button peer-feedback__button--secondary" onClick={onCancel} disabled={isSubmitting}>
          <FaTimes /> Skip
        </button>
        <button className="peer-feedback__button peer-feedback__button--primary" onClick={handleSubmit} disabled={stryMutAct_9fa48("2518") ? isSubmitting && !isActive : stryMutAct_9fa48("2517") ? false : stryMutAct_9fa48("2516") ? true : (stryCov_9fa48("2516", "2517", "2518"), isSubmitting || (stryMutAct_9fa48("2519") ? isActive : (stryCov_9fa48("2519"), !isActive)))}>
          {isSubmitting ? <>
              <FaSpinner className="peer-feedback__spinner-btn" /> Submitting...
            </> : <>
              <FaCheck /> Submit Feedback
            </>}
        </button>
      </div>
    </div>;
  }
};
export default PeerFeedbackForm;