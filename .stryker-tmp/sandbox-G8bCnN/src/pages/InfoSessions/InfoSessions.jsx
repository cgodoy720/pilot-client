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
import { format } from 'date-fns';
import { useNavigate, Link } from 'react-router-dom';
import pursuitLogoFull from '../../assets/logo-full.png';
import { getEasternTimeParts, formatInEasternTime } from '../../utils/dateHelpers';
import './InfoSessions.css';
// TEMP: Replace with real user/admin logic
const isAdmin = stryMutAct_9fa48("21185") ? true : (stryCov_9fa48("21185"), false);
const currentUserName = stryMutAct_9fa48("21186") ? "" : (stryCov_9fa48("21186"), 'You');
const InfoSessions = () => {
  if (stryMutAct_9fa48("21187")) {
    {}
  } else {
    stryCov_9fa48("21187");
    const navigate = useNavigate();
    const [events, setEvents] = useState(stryMutAct_9fa48("21188") ? ["Stryker was here"] : (stryCov_9fa48("21188"), []));
    const [user, setUser] = useState(null);
    const [newEvent, setNewEvent] = useState(stryMutAct_9fa48("21189") ? {} : (stryCov_9fa48("21189"), {
      title: stryMutAct_9fa48("21190") ? "Stryker was here!" : (stryCov_9fa48("21190"), ''),
      description: stryMutAct_9fa48("21191") ? "Stryker was here!" : (stryCov_9fa48("21191"), ''),
      start_time: stryMutAct_9fa48("21192") ? "Stryker was here!" : (stryCov_9fa48("21192"), ''),
      end_time: stryMutAct_9fa48("21193") ? "Stryker was here!" : (stryCov_9fa48("21193"), ''),
      location: stryMutAct_9fa48("21194") ? "Stryker was here!" : (stryCov_9fa48("21194"), ''),
      capacity: stryMutAct_9fa48("21195") ? "Stryker was here!" : (stryCov_9fa48("21195"), ''),
      is_online: stryMutAct_9fa48("21196") ? true : (stryCov_9fa48("21196"), false),
      meeting_link: stryMutAct_9fa48("21197") ? "Stryker was here!" : (stryCov_9fa48("21197"), '')
    }));
    const [currentApplicantId, setCurrentApplicantId] = useState(null);
    const [registrationStatus, setRegistrationStatus] = useState(null); // 'success', 'error', or null
    const [statusMessage, setStatusMessage] = useState(stryMutAct_9fa48("21198") ? "Stryker was here!" : (stryCov_9fa48("21198"), ''));
    const [processingEventId, setProcessingEventId] = useState(null);
    const [showRescheduleModal, setShowRescheduleModal] = useState(stryMutAct_9fa48("21199") ? true : (stryCov_9fa48("21199"), false));
    const [rescheduleFromEvent, setRescheduleFromEvent] = useState(null);
    const [selectedNewSessionId, setSelectedNewSessionId] = useState(stryMutAct_9fa48("21200") ? "Stryker was here!" : (stryCov_9fa48("21200"), ''));

    // Self-managed status state (no longer relying on props)
    const [infoSessionStatus, setInfoSessionStatus] = useState(stryMutAct_9fa48("21203") ? localStorage.getItem('infoSessionStatus') && 'not signed-up' : stryMutAct_9fa48("21202") ? false : stryMutAct_9fa48("21201") ? true : (stryCov_9fa48("21201", "21202", "21203"), localStorage.getItem(stryMutAct_9fa48("21204") ? "" : (stryCov_9fa48("21204"), 'infoSessionStatus')) || (stryMutAct_9fa48("21205") ? "" : (stryCov_9fa48("21205"), 'not signed-up'))));
    const [sessionDetails, setSessionDetails] = useState(() => {
      if (stryMutAct_9fa48("21206")) {
        {}
      } else {
        stryCov_9fa48("21206");
        const saved = localStorage.getItem(stryMutAct_9fa48("21207") ? "" : (stryCov_9fa48("21207"), 'infoSessionDetails'));
        return saved ? JSON.parse(saved) : null;
      }
    });

    // Load current applicant ID on mount
    useEffect(() => {
      if (stryMutAct_9fa48("21208")) {
        {}
      } else {
        stryCov_9fa48("21208");
        const loadApplicantId = async () => {
          if (stryMutAct_9fa48("21209")) {
            {}
          } else {
            stryCov_9fa48("21209");
            try {
              if (stryMutAct_9fa48("21210")) {
                {}
              } else {
                stryCov_9fa48("21210");
                const savedUser = localStorage.getItem(stryMutAct_9fa48("21211") ? "" : (stryCov_9fa48("21211"), 'user'));
                if (stryMutAct_9fa48("21213") ? false : stryMutAct_9fa48("21212") ? true : (stryCov_9fa48("21212", "21213"), savedUser)) {
                  if (stryMutAct_9fa48("21214")) {
                    {}
                  } else {
                    stryCov_9fa48("21214");
                    const userData = JSON.parse(savedUser);
                    setUser(userData);

                    // Get applicant ID from the database using email
                    const response = await fetch(stryMutAct_9fa48("21215") ? `` : (stryCov_9fa48("21215"), `${import.meta.env.VITE_API_URL}/api/applications/applicant/by-email/${userData.email}`));
                    if (stryMutAct_9fa48("21217") ? false : stryMutAct_9fa48("21216") ? true : (stryCov_9fa48("21216", "21217"), response.ok)) {
                      if (stryMutAct_9fa48("21218")) {
                        {}
                      } else {
                        stryCov_9fa48("21218");
                        const applicant = await response.json();
                        setCurrentApplicantId(applicant.applicant_id);
                        console.log(stryMutAct_9fa48("21219") ? "" : (stryCov_9fa48("21219"), 'Loaded applicant ID:'), applicant.applicant_id);
                      }
                    } else {
                      if (stryMutAct_9fa48("21220")) {
                        {}
                      } else {
                        stryCov_9fa48("21220");
                        console.warn(stryMutAct_9fa48("21221") ? "" : (stryCov_9fa48("21221"), 'Could not load applicant ID'));
                      }
                    }
                  }
                }
              }
            } catch (error) {
              if (stryMutAct_9fa48("21222")) {
                {}
              } else {
                stryCov_9fa48("21222");
                console.error(stryMutAct_9fa48("21223") ? "" : (stryCov_9fa48("21223"), 'Error loading applicant ID:'), error);
              }
            }
          }
        };
        loadApplicantId();
      }
    }, stryMutAct_9fa48("21224") ? ["Stryker was here"] : (stryCov_9fa48("21224"), []));
    const handleLogout = () => {
      if (stryMutAct_9fa48("21225")) {
        {}
      } else {
        stryCov_9fa48("21225");
        localStorage.removeItem(stryMutAct_9fa48("21226") ? "" : (stryCov_9fa48("21226"), 'user'));
        setUser(null);
        navigate(stryMutAct_9fa48("21227") ? "" : (stryCov_9fa48("21227"), '/login'));
      }
    };
    const handleBackToMainApp = () => {
      if (stryMutAct_9fa48("21228")) {
        {}
      } else {
        stryCov_9fa48("21228");
        navigate(stryMutAct_9fa48("21229") ? "" : (stryCov_9fa48("21229"), '/dashboard'));
      }
    };
    const handleBackToDashboard = () => {
      if (stryMutAct_9fa48("21230")) {
        {}
      } else {
        stryCov_9fa48("21230");
        navigate(stryMutAct_9fa48("21231") ? "" : (stryCov_9fa48("21231"), '/apply'));
      }
    };

    // Clear status messages after 5 seconds
    useEffect(() => {
      if (stryMutAct_9fa48("21232")) {
        {}
      } else {
        stryCov_9fa48("21232");
        if (stryMutAct_9fa48("21234") ? false : stryMutAct_9fa48("21233") ? true : (stryCov_9fa48("21233", "21234"), registrationStatus)) {
          if (stryMutAct_9fa48("21235")) {
            {}
          } else {
            stryCov_9fa48("21235");
            const timer = setTimeout(() => {
              if (stryMutAct_9fa48("21236")) {
                {}
              } else {
                stryCov_9fa48("21236");
                setRegistrationStatus(null);
                setStatusMessage(stryMutAct_9fa48("21237") ? "Stryker was here!" : (stryCov_9fa48("21237"), ''));
              }
            }, 5000);
            return stryMutAct_9fa48("21238") ? () => undefined : (stryCov_9fa48("21238"), () => clearTimeout(timer));
          }
        }
      }
    }, stryMutAct_9fa48("21239") ? [] : (stryCov_9fa48("21239"), [registrationStatus]));

    // Fetch info sessions on mount
    useEffect(() => {
      if (stryMutAct_9fa48("21240")) {
        {}
      } else {
        stryCov_9fa48("21240");
        const fetchEvents = async () => {
          if (stryMutAct_9fa48("21241")) {
            {}
          } else {
            stryCov_9fa48("21241");
            try {
              if (stryMutAct_9fa48("21242")) {
                {}
              } else {
                stryCov_9fa48("21242");
                console.log(stryMutAct_9fa48("21243") ? "" : (stryCov_9fa48("21243"), '=== STARTING FETCH ==='));
                console.log(stryMutAct_9fa48("21244") ? "" : (stryCov_9fa48("21244"), 'API URL:'), import.meta.env.VITE_API_URL);
                console.log(stryMutAct_9fa48("21245") ? "" : (stryCov_9fa48("21245"), 'Full URL:'), stryMutAct_9fa48("21246") ? `` : (stryCov_9fa48("21246"), `${import.meta.env.VITE_API_URL}/api/info-sessions`));
                const response = await fetch(stryMutAct_9fa48("21247") ? `` : (stryCov_9fa48("21247"), `${import.meta.env.VITE_API_URL}/api/info-sessions`));
                console.log(stryMutAct_9fa48("21248") ? "" : (stryCov_9fa48("21248"), 'Response received:'), response);
                console.log(stryMutAct_9fa48("21249") ? "" : (stryCov_9fa48("21249"), 'Response status:'), response.status);
                console.log(stryMutAct_9fa48("21250") ? "" : (stryCov_9fa48("21250"), 'Response ok:'), response.ok);
                if (stryMutAct_9fa48("21253") ? false : stryMutAct_9fa48("21252") ? true : stryMutAct_9fa48("21251") ? response.ok : (stryCov_9fa48("21251", "21252", "21253"), !response.ok)) {
                  if (stryMutAct_9fa48("21254")) {
                    {}
                  } else {
                    stryCov_9fa48("21254");
                    throw new Error(stryMutAct_9fa48("21255") ? `` : (stryCov_9fa48("21255"), `Failed to fetch info sessions: ${response.status}`));
                  }
                }
                const data = await response.json();
                console.log(stryMutAct_9fa48("21256") ? "" : (stryCov_9fa48("21256"), '=== DATA RECEIVED ==='));
                console.log(stryMutAct_9fa48("21257") ? "" : (stryCov_9fa48("21257"), 'Raw data:'), data);
                console.log(stryMutAct_9fa48("21258") ? "" : (stryCov_9fa48("21258"), 'Data type:'), typeof data);
                console.log(stryMutAct_9fa48("21259") ? "" : (stryCov_9fa48("21259"), 'Is array:'), Array.isArray(data));
                console.log(stryMutAct_9fa48("21260") ? "" : (stryCov_9fa48("21260"), 'Number of sessions:'), data.length);

                // Add registrations data to each event
                const eventsWithRegistrations = data.map(stryMutAct_9fa48("21261") ? () => undefined : (stryCov_9fa48("21261"), event => stryMutAct_9fa48("21262") ? {} : (stryCov_9fa48("21262"), {
                  ...event,
                  registrations: stryMutAct_9fa48("21265") ? event.registrations && [] : stryMutAct_9fa48("21264") ? false : stryMutAct_9fa48("21263") ? true : (stryCov_9fa48("21263", "21264", "21265"), event.registrations || (stryMutAct_9fa48("21266") ? ["Stryker was here"] : (stryCov_9fa48("21266"), [])))
                })));
                console.log(stryMutAct_9fa48("21267") ? "" : (stryCov_9fa48("21267"), 'Events with registrations:'), eventsWithRegistrations);
                console.log(stryMutAct_9fa48("21268") ? "" : (stryCov_9fa48("21268"), 'About to set events state...'));
                setEvents(eventsWithRegistrations);
                console.log(stryMutAct_9fa48("21269") ? "" : (stryCov_9fa48("21269"), 'setEvents called with:'), eventsWithRegistrations.length, stryMutAct_9fa48("21270") ? "" : (stryCov_9fa48("21270"), 'events'));

                // Force a re-render check
                setTimeout(() => {
                  if (stryMutAct_9fa48("21271")) {
                    {}
                  } else {
                    stryCov_9fa48("21271");
                    console.log(stryMutAct_9fa48("21272") ? "" : (stryCov_9fa48("21272"), '=== POST-SETSTATE CHECK ==='));
                    console.log(stryMutAct_9fa48("21273") ? "" : (stryCov_9fa48("21273"), 'Events state should now be:'), eventsWithRegistrations.length);
                  }
                }, 100);
              }
            } catch (error) {
              if (stryMutAct_9fa48("21274")) {
                {}
              } else {
                stryCov_9fa48("21274");
                console.error(stryMutAct_9fa48("21275") ? "" : (stryCov_9fa48("21275"), 'Error fetching events:'), error);
                setEvents(stryMutAct_9fa48("21276") ? ["Stryker was here"] : (stryCov_9fa48("21276"), [])); // Ensure events is always an array
              }
            }
          }
        };
        fetchEvents();
      }
    }, stryMutAct_9fa48("21277") ? ["Stryker was here"] : (stryCov_9fa48("21277"), [])); // Remove currentUserId dependency since we don't need it for fetching

    // Add new event
    const handleAddEvent = async e => {
      if (stryMutAct_9fa48("21278")) {
        {}
      } else {
        stryCov_9fa48("21278");
        e.preventDefault();
        try {
          if (stryMutAct_9fa48("21279")) {
            {}
          } else {
            stryCov_9fa48("21279");
            const eventToAdd = stryMutAct_9fa48("21280") ? {} : (stryCov_9fa48("21280"), {
              ...newEvent,
              capacity: (stryMutAct_9fa48("21283") ? newEvent.capacity !== '' : stryMutAct_9fa48("21282") ? false : stryMutAct_9fa48("21281") ? true : (stryCov_9fa48("21281", "21282", "21283"), newEvent.capacity === (stryMutAct_9fa48("21284") ? "Stryker was here!" : (stryCov_9fa48("21284"), '')))) ? 50 : parseInt(newEvent.capacity)
            });
            const response = await fetch(stryMutAct_9fa48("21285") ? `` : (stryCov_9fa48("21285"), `${import.meta.env.VITE_API_URL}/api/info-sessions`), stryMutAct_9fa48("21286") ? {} : (stryCov_9fa48("21286"), {
              method: stryMutAct_9fa48("21287") ? "" : (stryCov_9fa48("21287"), 'POST'),
              headers: stryMutAct_9fa48("21288") ? {} : (stryCov_9fa48("21288"), {
                'Content-Type': stryMutAct_9fa48("21289") ? "" : (stryCov_9fa48("21289"), 'application/json')
              }),
              body: JSON.stringify(eventToAdd)
            }));
            if (stryMutAct_9fa48("21292") ? false : stryMutAct_9fa48("21291") ? true : stryMutAct_9fa48("21290") ? response.ok : (stryCov_9fa48("21290", "21291", "21292"), !response.ok)) {
              if (stryMutAct_9fa48("21293")) {
                {}
              } else {
                stryCov_9fa48("21293");
                throw new Error(stryMutAct_9fa48("21294") ? "" : (stryCov_9fa48("21294"), 'Failed to create info session'));
              }
            }

            // Refresh the events list
            const refreshResponse = await fetch(stryMutAct_9fa48("21295") ? `` : (stryCov_9fa48("21295"), `${import.meta.env.VITE_API_URL}/api/info-sessions`));
            if (stryMutAct_9fa48("21297") ? false : stryMutAct_9fa48("21296") ? true : (stryCov_9fa48("21296", "21297"), refreshResponse.ok)) {
              if (stryMutAct_9fa48("21298")) {
                {}
              } else {
                stryCov_9fa48("21298");
                const updatedData = await refreshResponse.json();
                const eventsWithRegistrations = updatedData.map(stryMutAct_9fa48("21299") ? () => undefined : (stryCov_9fa48("21299"), event => stryMutAct_9fa48("21300") ? {} : (stryCov_9fa48("21300"), {
                  ...event,
                  registrations: stryMutAct_9fa48("21303") ? event.registrations && [] : stryMutAct_9fa48("21302") ? false : stryMutAct_9fa48("21301") ? true : (stryCov_9fa48("21301", "21302", "21303"), event.registrations || (stryMutAct_9fa48("21304") ? ["Stryker was here"] : (stryCov_9fa48("21304"), [])))
                })));
                setEvents(eventsWithRegistrations);
              }
            }
            setNewEvent(stryMutAct_9fa48("21305") ? {} : (stryCov_9fa48("21305"), {
              title: stryMutAct_9fa48("21306") ? "Stryker was here!" : (stryCov_9fa48("21306"), ''),
              description: stryMutAct_9fa48("21307") ? "Stryker was here!" : (stryCov_9fa48("21307"), ''),
              start_time: stryMutAct_9fa48("21308") ? "Stryker was here!" : (stryCov_9fa48("21308"), ''),
              end_time: stryMutAct_9fa48("21309") ? "Stryker was here!" : (stryCov_9fa48("21309"), ''),
              location: stryMutAct_9fa48("21310") ? "Stryker was here!" : (stryCov_9fa48("21310"), ''),
              capacity: stryMutAct_9fa48("21311") ? "Stryker was here!" : (stryCov_9fa48("21311"), ''),
              is_online: stryMutAct_9fa48("21312") ? true : (stryCov_9fa48("21312"), false),
              meeting_link: stryMutAct_9fa48("21313") ? "Stryker was here!" : (stryCov_9fa48("21313"), '')
            }));
          }
        } catch (error) {
          if (stryMutAct_9fa48("21314")) {
            {}
          } else {
            stryCov_9fa48("21314");
            console.error(stryMutAct_9fa48("21315") ? "" : (stryCov_9fa48("21315"), 'Error adding event:'), error);
          }
        }
      }
    };

    // Sign up for an event
    const handleSignUp = async eventId => {
      if (stryMutAct_9fa48("21316")) {
        {}
      } else {
        stryCov_9fa48("21316");
        setProcessingEventId(eventId);
        try {
          if (stryMutAct_9fa48("21317")) {
            {}
          } else {
            stryCov_9fa48("21317");
            if (stryMutAct_9fa48("21320") ? false : stryMutAct_9fa48("21319") ? true : stryMutAct_9fa48("21318") ? currentApplicantId : (stryCov_9fa48("21318", "21319", "21320"), !currentApplicantId)) {
              if (stryMutAct_9fa48("21321")) {
                {}
              } else {
                stryCov_9fa48("21321");
                throw new Error(stryMutAct_9fa48("21322") ? "" : (stryCov_9fa48("21322"), 'Applicant ID not available'));
              }
            }
            const registrationData = stryMutAct_9fa48("21323") ? {} : (stryCov_9fa48("21323"), {
              applicantId: currentApplicantId,
              name: stryMutAct_9fa48("21326") ? user?.firstName && 'Applicant' : stryMutAct_9fa48("21325") ? false : stryMutAct_9fa48("21324") ? true : (stryCov_9fa48("21324", "21325", "21326"), (stryMutAct_9fa48("21327") ? user.firstName : (stryCov_9fa48("21327"), user?.firstName)) || (stryMutAct_9fa48("21328") ? "" : (stryCov_9fa48("21328"), 'Applicant'))),
              email: stryMutAct_9fa48("21331") ? user?.email && 'jac@pursuit.org' : stryMutAct_9fa48("21330") ? false : stryMutAct_9fa48("21329") ? true : (stryCov_9fa48("21329", "21330", "21331"), (stryMutAct_9fa48("21332") ? user.email : (stryCov_9fa48("21332"), user?.email)) || (stryMutAct_9fa48("21333") ? "" : (stryCov_9fa48("21333"), 'jac@pursuit.org')))
            });
            const response = await fetch(stryMutAct_9fa48("21334") ? `` : (stryCov_9fa48("21334"), `${import.meta.env.VITE_API_URL}/api/info-sessions/${eventId}/register`), stryMutAct_9fa48("21335") ? {} : (stryCov_9fa48("21335"), {
              method: stryMutAct_9fa48("21336") ? "" : (stryCov_9fa48("21336"), 'POST'),
              headers: stryMutAct_9fa48("21337") ? {} : (stryCov_9fa48("21337"), {
                'Content-Type': stryMutAct_9fa48("21338") ? "" : (stryCov_9fa48("21338"), 'application/json')
              }),
              body: JSON.stringify(registrationData)
            }));
            if (stryMutAct_9fa48("21341") ? false : stryMutAct_9fa48("21340") ? true : stryMutAct_9fa48("21339") ? response.ok : (stryCov_9fa48("21339", "21340", "21341"), !response.ok)) {
              if (stryMutAct_9fa48("21342")) {
                {}
              } else {
                stryCov_9fa48("21342");
                const errorData = await response.json();
                throw new Error(stryMutAct_9fa48("21345") ? errorData.message && 'Failed to register for event' : stryMutAct_9fa48("21344") ? false : stryMutAct_9fa48("21343") ? true : (stryCov_9fa48("21343", "21344", "21345"), errorData.message || (stryMutAct_9fa48("21346") ? "" : (stryCov_9fa48("21346"), 'Failed to register for event'))));
              }
            }
            const responseData = await response.json();

            // SUCCESS - Show success status
            const event = events.find(stryMutAct_9fa48("21347") ? () => undefined : (stryCov_9fa48("21347"), e => stryMutAct_9fa48("21350") ? e.event_id !== eventId : stryMutAct_9fa48("21349") ? false : stryMutAct_9fa48("21348") ? true : (stryCov_9fa48("21348", "21349", "21350"), e.event_id === eventId)));
            const easternEventTime = getEasternTimeParts(event.start_time);
            const eventDate = format(easternEventTime, stryMutAct_9fa48("21351") ? "" : (stryCov_9fa48("21351"), 'MMMM d, yyyy'));
            const eventTime = formatInEasternTime(event.start_time, stryMutAct_9fa48("21352") ? "" : (stryCov_9fa48("21352"), 'time'));
            setRegistrationStatus(stryMutAct_9fa48("21353") ? "" : (stryCov_9fa48("21353"), 'success'));
            setStatusMessage(stryMutAct_9fa48("21354") ? `` : (stryCov_9fa48("21354"), `You're registered for the Information Session on ${eventDate} at ${eventTime}!`));

            // Update local status state (multiple registrations now allowed)
            setInfoSessionStatus(stryMutAct_9fa48("21355") ? "" : (stryCov_9fa48("21355"), 'signed-up'));

            // IMMEDIATE STATE UPDATE - Add the registration to the event in state
            setEvents(stryMutAct_9fa48("21356") ? () => undefined : (stryCov_9fa48("21356"), prevEvents => prevEvents.map(evt => {
              if (stryMutAct_9fa48("21357")) {
                {}
              } else {
                stryCov_9fa48("21357");
                if (stryMutAct_9fa48("21360") ? evt.event_id !== eventId : stryMutAct_9fa48("21359") ? false : stryMutAct_9fa48("21358") ? true : (stryCov_9fa48("21358", "21359", "21360"), evt.event_id === eventId)) {
                  if (stryMutAct_9fa48("21361")) {
                    {}
                  } else {
                    stryCov_9fa48("21361");
                    const newRegistration = stryMutAct_9fa48("21362") ? {} : (stryCov_9fa48("21362"), {
                      registration_id: stryMutAct_9fa48("21365") ? responseData.registration_id && `temp-${Date.now()}` : stryMutAct_9fa48("21364") ? false : stryMutAct_9fa48("21363") ? true : (stryCov_9fa48("21363", "21364", "21365"), responseData.registration_id || (stryMutAct_9fa48("21366") ? `` : (stryCov_9fa48("21366"), `temp-${Date.now()}`))),
                      applicant_id: currentApplicantId,
                      name: stryMutAct_9fa48("21369") ? user?.firstName && 'Applicant' : stryMutAct_9fa48("21368") ? false : stryMutAct_9fa48("21367") ? true : (stryCov_9fa48("21367", "21368", "21369"), (stryMutAct_9fa48("21370") ? user.firstName : (stryCov_9fa48("21370"), user?.firstName)) || (stryMutAct_9fa48("21371") ? "" : (stryCov_9fa48("21371"), 'Applicant'))),
                      email: stryMutAct_9fa48("21374") ? user?.email && 'jac@pursuit.org' : stryMutAct_9fa48("21373") ? false : stryMutAct_9fa48("21372") ? true : (stryCov_9fa48("21372", "21373", "21374"), (stryMutAct_9fa48("21375") ? user.email : (stryCov_9fa48("21375"), user?.email)) || (stryMutAct_9fa48("21376") ? "" : (stryCov_9fa48("21376"), 'jac@pursuit.org'))),
                      status: stryMutAct_9fa48("21377") ? "" : (stryCov_9fa48("21377"), 'registered'),
                      registered_at: new Date().toISOString()
                    });
                    return stryMutAct_9fa48("21378") ? {} : (stryCov_9fa48("21378"), {
                      ...evt,
                      registrations: stryMutAct_9fa48("21379") ? [] : (stryCov_9fa48("21379"), [...(stryMutAct_9fa48("21382") ? evt.registrations && [] : stryMutAct_9fa48("21381") ? false : stryMutAct_9fa48("21380") ? true : (stryCov_9fa48("21380", "21381", "21382"), evt.registrations || (stryMutAct_9fa48("21383") ? ["Stryker was here"] : (stryCov_9fa48("21383"), [])))), newRegistration])
                    });
                  }
                }
                return evt;
              }
            })));

            // Update status (multiple registrations now allowed)
            setInfoSessionStatus(stryMutAct_9fa48("21384") ? "" : (stryCov_9fa48("21384"), 'signed-up'));
          }
        } catch (error) {
          if (stryMutAct_9fa48("21385")) {
            {}
          } else {
            stryCov_9fa48("21385");
            console.error(stryMutAct_9fa48("21386") ? "" : (stryCov_9fa48("21386"), 'Error signing up for event:'), error);

            // Enhanced error messages based on error type
            let errorMessage = stryMutAct_9fa48("21387") ? "" : (stryCov_9fa48("21387"), 'Failed to register for this event.');
            if (stryMutAct_9fa48("21390") ? (error.message.includes('already registered') || error.message.includes('User already registered')) && error.message.includes("You're already registered for an event") : stryMutAct_9fa48("21389") ? false : stryMutAct_9fa48("21388") ? true : (stryCov_9fa48("21388", "21389", "21390"), (stryMutAct_9fa48("21392") ? error.message.includes('already registered') && error.message.includes('User already registered') : stryMutAct_9fa48("21391") ? false : (stryCov_9fa48("21391", "21392"), error.message.includes(stryMutAct_9fa48("21393") ? "" : (stryCov_9fa48("21393"), 'already registered')) || error.message.includes(stryMutAct_9fa48("21394") ? "" : (stryCov_9fa48("21394"), 'User already registered')))) || error.message.includes(stryMutAct_9fa48("21395") ? "" : (stryCov_9fa48("21395"), "You're already registered for an event")))) {
              if (stryMutAct_9fa48("21396")) {
                {}
              } else {
                stryCov_9fa48("21396");
                errorMessage = error.message; // Use the backend message directly
              }
            } else if (stryMutAct_9fa48("21399") ? error.message.includes('capacity') && error.message.includes('full') : stryMutAct_9fa48("21398") ? false : stryMutAct_9fa48("21397") ? true : (stryCov_9fa48("21397", "21398", "21399"), error.message.includes(stryMutAct_9fa48("21400") ? "" : (stryCov_9fa48("21400"), 'capacity')) || error.message.includes(stryMutAct_9fa48("21401") ? "" : (stryCov_9fa48("21401"), 'full')))) {
              if (stryMutAct_9fa48("21402")) {
                {}
              } else {
                stryCov_9fa48("21402");
                errorMessage = stryMutAct_9fa48("21403") ? "" : (stryCov_9fa48("21403"), 'Sorry, this event is fully booked. Please try registering for another session.');
              }
            } else if (stryMutAct_9fa48("21405") ? false : stryMutAct_9fa48("21404") ? true : (stryCov_9fa48("21404", "21405"), error.message.includes(stryMutAct_9fa48("21406") ? "" : (stryCov_9fa48("21406"), 'not found')))) {
              if (stryMutAct_9fa48("21407")) {
                {}
              } else {
                stryCov_9fa48("21407");
                errorMessage = stryMutAct_9fa48("21408") ? "" : (stryCov_9fa48("21408"), 'This event is no longer available. Please refresh the page and try again.');
              }
            } else {
              if (stryMutAct_9fa48("21409")) {
                {}
              } else {
                stryCov_9fa48("21409");
                errorMessage = stryMutAct_9fa48("21410") ? `` : (stryCov_9fa48("21410"), `Registration failed: ${error.message}. Please try again or contact support.`);
              }
            }
            setRegistrationStatus(stryMutAct_9fa48("21411") ? "" : (stryCov_9fa48("21411"), 'error'));
            setStatusMessage(errorMessage);
          }
        } finally {
          if (stryMutAct_9fa48("21412")) {
            {}
          } else {
            stryCov_9fa48("21412");
            setProcessingEventId(null);
          }
        }
      }
    };

    // Mark attendance
    const handleMarkAttendance = async (eventId, registrationId) => {
      if (stryMutAct_9fa48("21413")) {
        {}
      } else {
        stryCov_9fa48("21413");
        try {
          if (stryMutAct_9fa48("21414")) {
            {}
          } else {
            stryCov_9fa48("21414");
            await EventService.updateRegistrationStatus(eventId, registrationId, stryMutAct_9fa48("21415") ? "" : (stryCov_9fa48("21415"), 'attended'));
            const updatedEvents = await EventService.getEvents(stryMutAct_9fa48("21416") ? {} : (stryCov_9fa48("21416"), {
              type: stryMutAct_9fa48("21417") ? "" : (stryCov_9fa48("21417"), 'info_session')
            }));
            setEvents(updatedEvents);
          }
        } catch (error) {
          if (stryMutAct_9fa48("21418")) {
            {}
          } else {
            stryCov_9fa48("21418");
            console.error(stryMutAct_9fa48("21419") ? "" : (stryCov_9fa48("21419"), 'Error marking attendance:'), error);
          }
        }
      }
    };

    // Check if user is registered for an event (only active registrations)
    const isUserRegistered = event => {
      if (stryMutAct_9fa48("21420")) {
        {}
      } else {
        stryCov_9fa48("21420");
        return stryMutAct_9fa48("21422") ? event.registrations.some(reg => reg.applicant_id === currentApplicantId && reg.status !== 'cancelled') : stryMutAct_9fa48("21421") ? event.registrations?.every(reg => reg.applicant_id === currentApplicantId && reg.status !== 'cancelled') : (stryCov_9fa48("21421", "21422"), event.registrations?.some(stryMutAct_9fa48("21423") ? () => undefined : (stryCov_9fa48("21423"), reg => stryMutAct_9fa48("21426") ? reg.applicant_id === currentApplicantId || reg.status !== 'cancelled' : stryMutAct_9fa48("21425") ? false : stryMutAct_9fa48("21424") ? true : (stryCov_9fa48("21424", "21425", "21426"), (stryMutAct_9fa48("21428") ? reg.applicant_id !== currentApplicantId : stryMutAct_9fa48("21427") ? true : (stryCov_9fa48("21427", "21428"), reg.applicant_id === currentApplicantId)) && (stryMutAct_9fa48("21430") ? reg.status === 'cancelled' : stryMutAct_9fa48("21429") ? true : (stryCov_9fa48("21429", "21430"), reg.status !== (stryMutAct_9fa48("21431") ? "" : (stryCov_9fa48("21431"), 'cancelled'))))))));
      }
    };

    // Get user's active registration for an event
    const getUserRegistration = event => {
      if (stryMutAct_9fa48("21432")) {
        {}
      } else {
        stryCov_9fa48("21432");
        return stryMutAct_9fa48("21433") ? event.registrations.find(reg => reg.applicant_id === currentApplicantId && reg.status !== 'cancelled') : (stryCov_9fa48("21433"), event.registrations?.find(stryMutAct_9fa48("21434") ? () => undefined : (stryCov_9fa48("21434"), reg => stryMutAct_9fa48("21437") ? reg.applicant_id === currentApplicantId || reg.status !== 'cancelled' : stryMutAct_9fa48("21436") ? false : stryMutAct_9fa48("21435") ? true : (stryCov_9fa48("21435", "21436", "21437"), (stryMutAct_9fa48("21439") ? reg.applicant_id !== currentApplicantId : stryMutAct_9fa48("21438") ? true : (stryCov_9fa48("21438", "21439"), reg.applicant_id === currentApplicantId)) && (stryMutAct_9fa48("21441") ? reg.status === 'cancelled' : stryMutAct_9fa48("21440") ? true : (stryCov_9fa48("21440", "21441"), reg.status !== (stryMutAct_9fa48("21442") ? "" : (stryCov_9fa48("21442"), 'cancelled'))))))));
      }
    };

    // Check if an event has already passed
    const isEventPassed = event => {
      if (stryMutAct_9fa48("21443")) {
        {}
      } else {
        stryCov_9fa48("21443");
        const easternEventTime = getEasternTimeParts(event.start_time);
        const now = new Date();
        return stryMutAct_9fa48("21446") ? easternEventTime || easternEventTime < now : stryMutAct_9fa48("21445") ? false : stryMutAct_9fa48("21444") ? true : (stryCov_9fa48("21444", "21445", "21446"), easternEventTime && (stryMutAct_9fa48("21449") ? easternEventTime >= now : stryMutAct_9fa48("21448") ? easternEventTime <= now : stryMutAct_9fa48("21447") ? true : (stryCov_9fa48("21447", "21448", "21449"), easternEventTime < now)));
      }
    };

    // Get registered events
    const registeredEvents = stryMutAct_9fa48("21450") ? events : (stryCov_9fa48("21450"), events.filter(stryMutAct_9fa48("21451") ? () => undefined : (stryCov_9fa48("21451"), event => isUserRegistered(event))));
    const availableEvents = stryMutAct_9fa48("21452") ? events : (stryCov_9fa48("21452"), events.filter(stryMutAct_9fa48("21453") ? () => undefined : (stryCov_9fa48("21453"), event => stryMutAct_9fa48("21454") ? isUserRegistered(event) : (stryCov_9fa48("21454"), !isUserRegistered(event)))));

    // Cancel registration
    const handleCancelRegistration = async (eventId, registrationId) => {
      if (stryMutAct_9fa48("21455")) {
        {}
      } else {
        stryCov_9fa48("21455");
        setProcessingEventId(eventId);
        try {
          if (stryMutAct_9fa48("21456")) {
            {}
          } else {
            stryCov_9fa48("21456");
            console.log(stryMutAct_9fa48("21457") ? "" : (stryCov_9fa48("21457"), '=== CANCELLATION ATTEMPT ==='));
            console.log(stryMutAct_9fa48("21458") ? "" : (stryCov_9fa48("21458"), 'Event ID:'), eventId);
            console.log(stryMutAct_9fa48("21459") ? "" : (stryCov_9fa48("21459"), 'Applicant ID:'), currentApplicantId);
            console.log(stryMutAct_9fa48("21460") ? "" : (stryCov_9fa48("21460"), 'Registration ID:'), registrationId);
            console.log(stryMutAct_9fa48("21461") ? "" : (stryCov_9fa48("21461"), 'Full URL:'), stryMutAct_9fa48("21462") ? `` : (stryCov_9fa48("21462"), `${import.meta.env.VITE_API_URL}/api/info-sessions/${eventId}/register/${currentApplicantId}`));
            const response = await fetch(stryMutAct_9fa48("21463") ? `` : (stryCov_9fa48("21463"), `${import.meta.env.VITE_API_URL}/api/info-sessions/${eventId}/register/${currentApplicantId}`), stryMutAct_9fa48("21464") ? {} : (stryCov_9fa48("21464"), {
              method: stryMutAct_9fa48("21465") ? "" : (stryCov_9fa48("21465"), 'DELETE')
            }));
            console.log(stryMutAct_9fa48("21466") ? "" : (stryCov_9fa48("21466"), 'Cancel response status:'), response.status);
            console.log(stryMutAct_9fa48("21467") ? "" : (stryCov_9fa48("21467"), 'Cancel response ok:'), response.ok);
            if (stryMutAct_9fa48("21470") ? false : stryMutAct_9fa48("21469") ? true : stryMutAct_9fa48("21468") ? response.ok : (stryCov_9fa48("21468", "21469", "21470"), !response.ok)) {
              if (stryMutAct_9fa48("21471")) {
                {}
              } else {
                stryCov_9fa48("21471");
                const errorData = await response.json().catch(stryMutAct_9fa48("21472") ? () => undefined : (stryCov_9fa48("21472"), () => stryMutAct_9fa48("21473") ? {} : (stryCov_9fa48("21473"), {
                  message: stryMutAct_9fa48("21474") ? "" : (stryCov_9fa48("21474"), 'Unknown error')
                })));
                console.error(stryMutAct_9fa48("21475") ? "" : (stryCov_9fa48("21475"), 'Cancel response error:'), errorData);
                throw new Error(stryMutAct_9fa48("21478") ? errorData.message && `Failed to cancel registration (${response.status})` : stryMutAct_9fa48("21477") ? false : stryMutAct_9fa48("21476") ? true : (stryCov_9fa48("21476", "21477", "21478"), errorData.message || (stryMutAct_9fa48("21479") ? `` : (stryCov_9fa48("21479"), `Failed to cancel registration (${response.status})`))));
              }
            }
            const responseData = await response.json();
            console.log(stryMutAct_9fa48("21480") ? "" : (stryCov_9fa48("21480"), 'Cancel response data:'), responseData);

            // IMMEDIATE STATE UPDATE - Mark registration as cancelled
            setEvents(prevEvents => {
              if (stryMutAct_9fa48("21481")) {
                {}
              } else {
                stryCov_9fa48("21481");
                return prevEvents.map(evt => {
                  if (stryMutAct_9fa48("21482")) {
                    {}
                  } else {
                    stryCov_9fa48("21482");
                    if (stryMutAct_9fa48("21485") ? evt.event_id !== eventId : stryMutAct_9fa48("21484") ? false : stryMutAct_9fa48("21483") ? true : (stryCov_9fa48("21483", "21484", "21485"), evt.event_id === eventId)) {
                      if (stryMutAct_9fa48("21486")) {
                        {}
                      } else {
                        stryCov_9fa48("21486");
                        const updatedRegistrations = (stryMutAct_9fa48("21489") ? evt.registrations && [] : stryMutAct_9fa48("21488") ? false : stryMutAct_9fa48("21487") ? true : (stryCov_9fa48("21487", "21488", "21489"), evt.registrations || (stryMutAct_9fa48("21490") ? ["Stryker was here"] : (stryCov_9fa48("21490"), [])))).map(reg => {
                          if (stryMutAct_9fa48("21491")) {
                            {}
                          } else {
                            stryCov_9fa48("21491");
                            if (stryMutAct_9fa48("21494") ? reg.registration_id !== registrationId : stryMutAct_9fa48("21493") ? false : stryMutAct_9fa48("21492") ? true : (stryCov_9fa48("21492", "21493", "21494"), reg.registration_id === registrationId)) {
                              if (stryMutAct_9fa48("21495")) {
                                {}
                              } else {
                                stryCov_9fa48("21495");
                                return stryMutAct_9fa48("21496") ? {} : (stryCov_9fa48("21496"), {
                                  ...reg,
                                  status: stryMutAct_9fa48("21497") ? "" : (stryCov_9fa48("21497"), 'cancelled')
                                });
                              }
                            }
                            return reg;
                          }
                        });
                        return stryMutAct_9fa48("21498") ? {} : (stryCov_9fa48("21498"), {
                          ...evt,
                          registrations: updatedRegistrations
                        });
                      }
                    }
                    return evt;
                  }
                });
              }
            });
            setRegistrationStatus(stryMutAct_9fa48("21499") ? "" : (stryCov_9fa48("21499"), 'success'));
            setStatusMessage(stryMutAct_9fa48("21500") ? "" : (stryCov_9fa48("21500"), 'Registration cancelled successfully.'));

            // Check if user still has other info session registrations
            const remainingRegistrations = stryMutAct_9fa48("21501") ? events : (stryCov_9fa48("21501"), events.filter(stryMutAct_9fa48("21502") ? () => undefined : (stryCov_9fa48("21502"), evt => stryMutAct_9fa48("21505") ? evt.event_id !== eventId || evt.registrations?.some(reg => reg.applicant_id === currentApplicantId && reg.status !== 'cancelled') : stryMutAct_9fa48("21504") ? false : stryMutAct_9fa48("21503") ? true : (stryCov_9fa48("21503", "21504", "21505"), (stryMutAct_9fa48("21507") ? evt.event_id === eventId : stryMutAct_9fa48("21506") ? true : (stryCov_9fa48("21506", "21507"), evt.event_id !== eventId)) && (stryMutAct_9fa48("21509") ? evt.registrations.some(reg => reg.applicant_id === currentApplicantId && reg.status !== 'cancelled') : stryMutAct_9fa48("21508") ? evt.registrations?.every(reg => reg.applicant_id === currentApplicantId && reg.status !== 'cancelled') : (stryCov_9fa48("21508", "21509"), evt.registrations?.some(stryMutAct_9fa48("21510") ? () => undefined : (stryCov_9fa48("21510"), reg => stryMutAct_9fa48("21513") ? reg.applicant_id === currentApplicantId || reg.status !== 'cancelled' : stryMutAct_9fa48("21512") ? false : stryMutAct_9fa48("21511") ? true : (stryCov_9fa48("21511", "21512", "21513"), (stryMutAct_9fa48("21515") ? reg.applicant_id !== currentApplicantId : stryMutAct_9fa48("21514") ? true : (stryCov_9fa48("21514", "21515"), reg.applicant_id === currentApplicantId)) && (stryMutAct_9fa48("21517") ? reg.status === 'cancelled' : stryMutAct_9fa48("21516") ? true : (stryCov_9fa48("21516", "21517"), reg.status !== (stryMutAct_9fa48("21518") ? "" : (stryCov_9fa48("21518"), 'cancelled')))))))))))));

            // Only clear status if no other registrations exist
            if (stryMutAct_9fa48("21521") ? remainingRegistrations.length !== 0 : stryMutAct_9fa48("21520") ? false : stryMutAct_9fa48("21519") ? true : (stryCov_9fa48("21519", "21520", "21521"), remainingRegistrations.length === 0)) {
              if (stryMutAct_9fa48("21522")) {
                {}
              } else {
                stryCov_9fa48("21522");
                setInfoSessionStatus(stryMutAct_9fa48("21523") ? "" : (stryCov_9fa48("21523"), 'not signed-up'));
              }
            }

            // Force refresh to ensure we have the latest data from server
            setTimeout(async () => {
              if (stryMutAct_9fa48("21524")) {
                {}
              } else {
                stryCov_9fa48("21524");
                try {
                  if (stryMutAct_9fa48("21525")) {
                    {}
                  } else {
                    stryCov_9fa48("21525");
                    const response = await fetch(stryMutAct_9fa48("21526") ? `` : (stryCov_9fa48("21526"), `${import.meta.env.VITE_API_URL}/api/info-sessions`));
                    if (stryMutAct_9fa48("21528") ? false : stryMutAct_9fa48("21527") ? true : (stryCov_9fa48("21527", "21528"), response.ok)) {
                      if (stryMutAct_9fa48("21529")) {
                        {}
                      } else {
                        stryCov_9fa48("21529");
                        const data = await response.json();
                        const eventsWithRegistrations = data.map(stryMutAct_9fa48("21530") ? () => undefined : (stryCov_9fa48("21530"), event => stryMutAct_9fa48("21531") ? {} : (stryCov_9fa48("21531"), {
                          ...event,
                          registrations: stryMutAct_9fa48("21534") ? event.registrations && [] : stryMutAct_9fa48("21533") ? false : stryMutAct_9fa48("21532") ? true : (stryCov_9fa48("21532", "21533", "21534"), event.registrations || (stryMutAct_9fa48("21535") ? ["Stryker was here"] : (stryCov_9fa48("21535"), [])))
                        })));
                        setEvents(eventsWithRegistrations);
                      }
                    }
                  }
                } catch (error) {
                  if (stryMutAct_9fa48("21536")) {
                    {}
                  } else {
                    stryCov_9fa48("21536");
                    console.error(stryMutAct_9fa48("21537") ? "" : (stryCov_9fa48("21537"), 'Error refreshing after cancellation:'), error);
                  }
                }
              }
            }, 100); // Small delay to ensure server state is updated
          }
        } catch (error) {
          if (stryMutAct_9fa48("21538")) {
            {}
          } else {
            stryCov_9fa48("21538");
            console.error(stryMutAct_9fa48("21539") ? "" : (stryCov_9fa48("21539"), 'Error cancelling registration:'), error);
            setRegistrationStatus(stryMutAct_9fa48("21540") ? "" : (stryCov_9fa48("21540"), 'error'));
            setStatusMessage(stryMutAct_9fa48("21541") ? `` : (stryCov_9fa48("21541"), `Failed to cancel registration: ${error.message}`));
          }
        } finally {
          if (stryMutAct_9fa48("21542")) {
            {}
          } else {
            stryCov_9fa48("21542");
            setProcessingEventId(null);
          }
        }
      }
    };
    return <div className="admissions-dashboard">
            {/* Top Bar */}
            <div className="admissions-dashboard__topbar">
                <div className="admissions-dashboard__topbar-left">
                            <div className="admissions-dashboard__logo-section">
          <Link to="/apply">
            <img src={pursuitLogoFull} alt="Pursuit Logo" className="admissions-dashboard__logo-full" />
          </Link>
        </div>
                    <div className="admissions-dashboard__welcome-text">
                        Welcome, {stryMutAct_9fa48("21545") ? user?.firstName && 'John' : stryMutAct_9fa48("21544") ? false : stryMutAct_9fa48("21543") ? true : (stryCov_9fa48("21543", "21544", "21545"), (stryMutAct_9fa48("21546") ? user.firstName : (stryCov_9fa48("21546"), user?.firstName)) || (stryMutAct_9fa48("21547") ? "" : (stryCov_9fa48("21547"), 'John')))}!
                    </div>
                </div>
                <div className="admissions-dashboard__topbar-right">
                    <button onClick={handleBackToDashboard} className="admissions-dashboard__button--secondary">
                        ← Back to Dashboard
                    </button>
                    <button onClick={handleLogout} className="admissions-dashboard__button--primary">
                        Log Out
                    </button>
                </div>
            </div>

            {/* Info Sessions Container */}
            <div className="info-sessions__main">
                {/* Title */}
                <div className="admissions-dashboard__title-section">
                    <h1 className="admissions-dashboard__title">
                        Select a time slot for your info session at Pursuit HQ.
                    </h1>
                </div>

                <div className="info-sessions__content">
                    
                    {/* Status Messages */}
                    {stryMutAct_9fa48("21550") ? registrationStatus || <div className={`info-sessions__status-banner info-sessions__status-banner--${registrationStatus}`}>
                            <div className="info-sessions__status-content">
                                <span className="info-sessions__status-icon">
                                    {registrationStatus === 'success' ? '🎉' : '⚠️'}
                                </span>
                                <strong>{statusMessage}</strong>
                            </div>
                        </div> : stryMutAct_9fa48("21549") ? false : stryMutAct_9fa48("21548") ? true : (stryCov_9fa48("21548", "21549", "21550"), registrationStatus && <div className={stryMutAct_9fa48("21551") ? `` : (stryCov_9fa48("21551"), `info-sessions__status-banner info-sessions__status-banner--${registrationStatus}`)}>
                            <div className="info-sessions__status-content">
                                <span className="info-sessions__status-icon">
                                    {(stryMutAct_9fa48("21554") ? registrationStatus !== 'success' : stryMutAct_9fa48("21553") ? false : stryMutAct_9fa48("21552") ? true : (stryCov_9fa48("21552", "21553", "21554"), registrationStatus === (stryMutAct_9fa48("21555") ? "" : (stryCov_9fa48("21555"), 'success')))) ? stryMutAct_9fa48("21556") ? "" : (stryCov_9fa48("21556"), '🎉') : stryMutAct_9fa48("21557") ? "" : (stryCov_9fa48("21557"), '⚠️')}
                                </span>
                                <strong>{statusMessage}</strong>
                            </div>
                        </div>)}

                    {/* Time Slots Grid */}
                    <div className="info-sessions__time-slots-grid">
                        {(stryMutAct_9fa48("21560") ? events.length !== 0 : stryMutAct_9fa48("21559") ? false : stryMutAct_9fa48("21558") ? true : (stryCov_9fa48("21558", "21559", "21560"), events.length === 0)) ? <div className="info-sessions__no-sessions-message">
                                <h3>No Information Sessions Scheduled</h3>
                                <p>We'll add sessions as soon as they're scheduled. Check back regularly!</p>
                            </div> : events.map(event => {
              if (stryMutAct_9fa48("21561")) {
                {}
              } else {
                stryCov_9fa48("21561");
                const isRegistered = isUserRegistered(event);
                const isFull = stryMutAct_9fa48("21565") ? (event.registered_count || 0) < event.capacity : stryMutAct_9fa48("21564") ? (event.registered_count || 0) > event.capacity : stryMutAct_9fa48("21563") ? false : stryMutAct_9fa48("21562") ? true : (stryCov_9fa48("21562", "21563", "21564", "21565"), (stryMutAct_9fa48("21568") ? event.registered_count && 0 : stryMutAct_9fa48("21567") ? false : stryMutAct_9fa48("21566") ? true : (stryCov_9fa48("21566", "21567", "21568"), event.registered_count || 0)) >= event.capacity);
                const isPassed = isEventPassed(event);
                const registration = getUserRegistration(event);

                // Convert UTC times to Eastern Time for display
                const easternStartTime = getEasternTimeParts(event.start_time);
                const easternEndTime = getEasternTimeParts(event.end_time);
                const month = format(easternStartTime, stryMutAct_9fa48("21569") ? "" : (stryCov_9fa48("21569"), 'MMMM'));
                const day = format(easternStartTime, stryMutAct_9fa48("21570") ? "" : (stryCov_9fa48("21570"), 'd'));
                const dayOfWeek = format(easternStartTime, stryMutAct_9fa48("21571") ? "" : (stryCov_9fa48("21571"), 'EEEE'));
                const timeRange = stryMutAct_9fa48("21572") ? `` : (stryCov_9fa48("21572"), `${formatInEasternTime(event.start_time, stryMutAct_9fa48("21573") ? "" : (stryCov_9fa48("21573"), 'time'))} - ${formatInEasternTime(event.end_time, stryMutAct_9fa48("21574") ? "" : (stryCov_9fa48("21574"), 'time'))}`);
                return <div key={event.event_id} className={stryMutAct_9fa48("21575") ? `` : (stryCov_9fa48("21575"), `info-sessions__time-slot-card ${isRegistered ? stryMutAct_9fa48("21576") ? "" : (stryCov_9fa48("21576"), 'info-sessions__time-slot-card--selected') : stryMutAct_9fa48("21577") ? "Stryker was here!" : (stryCov_9fa48("21577"), '')} ${(stryMutAct_9fa48("21580") ? isFull || !isRegistered : stryMutAct_9fa48("21579") ? false : stryMutAct_9fa48("21578") ? true : (stryCov_9fa48("21578", "21579", "21580"), isFull && (stryMutAct_9fa48("21581") ? isRegistered : (stryCov_9fa48("21581"), !isRegistered)))) ? stryMutAct_9fa48("21582") ? "" : (stryCov_9fa48("21582"), 'info-sessions__time-slot-card--full') : stryMutAct_9fa48("21583") ? "Stryker was here!" : (stryCov_9fa48("21583"), '')} ${isPassed ? stryMutAct_9fa48("21584") ? "" : (stryCov_9fa48("21584"), 'info-sessions__time-slot-card--passed') : stryMutAct_9fa48("21585") ? "Stryker was here!" : (stryCov_9fa48("21585"), '')}`)}>
                                        <div className="info-sessions__time-slot-header">
                                            <div className="info-sessions__date-info">
                                                <span className="info-sessions__month">{month}</span>
                                                <span className="info-sessions__day">{day}</span>
                                                <span className="info-sessions__day-of-week">{dayOfWeek}</span>
                                            </div>
                                            <div className="info-sessions__time-info">
                                                <span className="info-sessions__time-range">{timeRange}</span>
                                            </div>
                                        </div>
                                        
                                        <div className="info-sessions__location-info">
                                            <span className="info-sessions__location-type">
                                                {event.is_online ? stryMutAct_9fa48("21586") ? "" : (stryCov_9fa48("21586"), '💻 Online') : stryMutAct_9fa48("21587") ? "" : (stryCov_9fa48("21587"), '🏢 In-Person')}
                                            </span>
                                        </div>
                                        
                                        {isRegistered ? <div className="info-sessions__slot-actions info-sessions__registered-actions">
                                                <button className="info-sessions__cancel-selection-btn" onClick={stryMutAct_9fa48("21588") ? () => undefined : (stryCov_9fa48("21588"), () => handleCancelRegistration(event.event_id, stryMutAct_9fa48("21589") ? registration.registration_id : (stryCov_9fa48("21589"), registration?.registration_id)))} disabled={stryMutAct_9fa48("21592") ? processingEventId !== event.event_id : stryMutAct_9fa48("21591") ? false : stryMutAct_9fa48("21590") ? true : (stryCov_9fa48("21590", "21591", "21592"), processingEventId === event.event_id)}>
                                                    {(stryMutAct_9fa48("21595") ? processingEventId !== event.event_id : stryMutAct_9fa48("21594") ? false : stryMutAct_9fa48("21593") ? true : (stryCov_9fa48("21593", "21594", "21595"), processingEventId === event.event_id)) ? stryMutAct_9fa48("21596") ? "" : (stryCov_9fa48("21596"), 'Cancelling...') : stryMutAct_9fa48("21597") ? "" : (stryCov_9fa48("21597"), 'Cancel')}
                                                </button>
                                                <div className="info-sessions__selected-indicator">Reserved</div>
                                            </div> : <div className="info-sessions__slot-actions">
                                                <button className={stryMutAct_9fa48("21598") ? `` : (stryCov_9fa48("21598"), `info-sessions__select-btn ${isFull ? stryMutAct_9fa48("21599") ? "" : (stryCov_9fa48("21599"), 'info-sessions__select-btn--full') : stryMutAct_9fa48("21600") ? "Stryker was here!" : (stryCov_9fa48("21600"), '')} ${isPassed ? stryMutAct_9fa48("21601") ? "" : (stryCov_9fa48("21601"), 'info-sessions__select-btn--disabled') : stryMutAct_9fa48("21602") ? "Stryker was here!" : (stryCov_9fa48("21602"), '')}`)} onClick={stryMutAct_9fa48("21603") ? () => undefined : (stryCov_9fa48("21603"), () => stryMutAct_9fa48("21606") ? !isFull && !isPassed || handleSignUp(event.event_id) : stryMutAct_9fa48("21605") ? false : stryMutAct_9fa48("21604") ? true : (stryCov_9fa48("21604", "21605", "21606"), (stryMutAct_9fa48("21608") ? !isFull || !isPassed : stryMutAct_9fa48("21607") ? true : (stryCov_9fa48("21607", "21608"), (stryMutAct_9fa48("21609") ? isFull : (stryCov_9fa48("21609"), !isFull)) && (stryMutAct_9fa48("21610") ? isPassed : (stryCov_9fa48("21610"), !isPassed)))) && handleSignUp(event.event_id)))} disabled={stryMutAct_9fa48("21613") ? (processingEventId === event.event_id || isFull) && isPassed : stryMutAct_9fa48("21612") ? false : stryMutAct_9fa48("21611") ? true : (stryCov_9fa48("21611", "21612", "21613"), (stryMutAct_9fa48("21615") ? processingEventId === event.event_id && isFull : stryMutAct_9fa48("21614") ? false : (stryCov_9fa48("21614", "21615"), (stryMutAct_9fa48("21617") ? processingEventId !== event.event_id : stryMutAct_9fa48("21616") ? false : (stryCov_9fa48("21616", "21617"), processingEventId === event.event_id)) || isFull)) || isPassed)}>
                                                    {isPassed ? stryMutAct_9fa48("21618") ? "" : (stryCov_9fa48("21618"), 'Event Passed') : isFull ? stryMutAct_9fa48("21619") ? "" : (stryCov_9fa48("21619"), 'Full') : (stryMutAct_9fa48("21622") ? processingEventId !== event.event_id : stryMutAct_9fa48("21621") ? false : stryMutAct_9fa48("21620") ? true : (stryCov_9fa48("21620", "21621", "21622"), processingEventId === event.event_id)) ? stryMutAct_9fa48("21623") ? "" : (stryCov_9fa48("21623"), 'Reserving...') : stryMutAct_9fa48("21624") ? "" : (stryCov_9fa48("21624"), 'Reserve')}
                                                </button>
                                            </div>}
                                        
                                        {stryMutAct_9fa48("21627") ? event.is_online && event.meeting_link && isRegistered || <div className="info-sessions__meeting-link-section">
                                                <a href={event.meeting_link} target="_blank" rel="noopener noreferrer" className="info-sessions__meeting-link">
                                                    Join Meeting
                                                </a>
                                            </div> : stryMutAct_9fa48("21626") ? false : stryMutAct_9fa48("21625") ? true : (stryCov_9fa48("21625", "21626", "21627"), (stryMutAct_9fa48("21629") ? event.is_online && event.meeting_link || isRegistered : stryMutAct_9fa48("21628") ? true : (stryCov_9fa48("21628", "21629"), (stryMutAct_9fa48("21631") ? event.is_online || event.meeting_link : stryMutAct_9fa48("21630") ? true : (stryCov_9fa48("21630", "21631"), event.is_online && event.meeting_link)) && isRegistered)) && <div className="info-sessions__meeting-link-section">
                                                <a href={event.meeting_link} target="_blank" rel="noopener noreferrer" className="info-sessions__meeting-link">
                                                    Join Meeting
                                                </a>
                                            </div>)}
                                    </div>;
              }
            })}
                    </div>

                    {/* Admin form */}
                    {stryMutAct_9fa48("21634") ? isAdmin || <div className="info-sessions__admin-form-section">
                            <h3>Add New Info Session</h3>
                            <form onSubmit={handleAddEvent}>
                                <input type="text" placeholder="Title" value={newEvent.title} onChange={e => setNewEvent({
                ...newEvent,
                title: e.target.value
              })} required />
                                <input type="datetime-local" value={newEvent.start_time} onChange={e => setNewEvent({
                ...newEvent,
                start_time: e.target.value
              })} required />
                                <input type="datetime-local" value={newEvent.end_time} onChange={e => setNewEvent({
                ...newEvent,
                end_time: e.target.value
              })} required />
                                <input type="text" placeholder="Location" value={newEvent.location} onChange={e => setNewEvent({
                ...newEvent,
                location: e.target.value
              })} required />
                                <input type="number" placeholder="Capacity" value={newEvent.capacity} onChange={e => setNewEvent({
                ...newEvent,
                capacity: e.target.value
              })} />
                                <label>
                                    <input type="checkbox" checked={newEvent.is_online} onChange={e => setNewEvent({
                  ...newEvent,
                  is_online: e.target.checked
                })} />
                                    Online Event
                                </label>
                                {newEvent.is_online && <input type="text" placeholder="Meeting Link" value={newEvent.meeting_link} onChange={e => setNewEvent({
                ...newEvent,
                meeting_link: e.target.value
              })} />}
                                <button type="submit">Add Session</button>
                            </form>
                        </div> : stryMutAct_9fa48("21633") ? false : stryMutAct_9fa48("21632") ? true : (stryCov_9fa48("21632", "21633", "21634"), isAdmin && <div className="info-sessions__admin-form-section">
                            <h3>Add New Info Session</h3>
                            <form onSubmit={handleAddEvent}>
                                <input type="text" placeholder="Title" value={newEvent.title} onChange={stryMutAct_9fa48("21635") ? () => undefined : (stryCov_9fa48("21635"), e => setNewEvent(stryMutAct_9fa48("21636") ? {} : (stryCov_9fa48("21636"), {
                ...newEvent,
                title: e.target.value
              })))} required />
                                <input type="datetime-local" value={newEvent.start_time} onChange={stryMutAct_9fa48("21637") ? () => undefined : (stryCov_9fa48("21637"), e => setNewEvent(stryMutAct_9fa48("21638") ? {} : (stryCov_9fa48("21638"), {
                ...newEvent,
                start_time: e.target.value
              })))} required />
                                <input type="datetime-local" value={newEvent.end_time} onChange={stryMutAct_9fa48("21639") ? () => undefined : (stryCov_9fa48("21639"), e => setNewEvent(stryMutAct_9fa48("21640") ? {} : (stryCov_9fa48("21640"), {
                ...newEvent,
                end_time: e.target.value
              })))} required />
                                <input type="text" placeholder="Location" value={newEvent.location} onChange={stryMutAct_9fa48("21641") ? () => undefined : (stryCov_9fa48("21641"), e => setNewEvent(stryMutAct_9fa48("21642") ? {} : (stryCov_9fa48("21642"), {
                ...newEvent,
                location: e.target.value
              })))} required />
                                <input type="number" placeholder="Capacity" value={newEvent.capacity} onChange={stryMutAct_9fa48("21643") ? () => undefined : (stryCov_9fa48("21643"), e => setNewEvent(stryMutAct_9fa48("21644") ? {} : (stryCov_9fa48("21644"), {
                ...newEvent,
                capacity: e.target.value
              })))} />
                                <label>
                                    <input type="checkbox" checked={newEvent.is_online} onChange={stryMutAct_9fa48("21645") ? () => undefined : (stryCov_9fa48("21645"), e => setNewEvent(stryMutAct_9fa48("21646") ? {} : (stryCov_9fa48("21646"), {
                  ...newEvent,
                  is_online: e.target.checked
                })))} />
                                    Online Event
                                </label>
                                {stryMutAct_9fa48("21649") ? newEvent.is_online || <input type="text" placeholder="Meeting Link" value={newEvent.meeting_link} onChange={e => setNewEvent({
                ...newEvent,
                meeting_link: e.target.value
              })} /> : stryMutAct_9fa48("21648") ? false : stryMutAct_9fa48("21647") ? true : (stryCov_9fa48("21647", "21648", "21649"), newEvent.is_online && <input type="text" placeholder="Meeting Link" value={newEvent.meeting_link} onChange={stryMutAct_9fa48("21650") ? () => undefined : (stryCov_9fa48("21650"), e => setNewEvent(stryMutAct_9fa48("21651") ? {} : (stryCov_9fa48("21651"), {
                ...newEvent,
                meeting_link: e.target.value
              })))} />)}
                                <button type="submit">Add Session</button>
                            </form>
                        </div>)}
                </div>
            </div>
        </div>;
  }
};
export default InfoSessions;