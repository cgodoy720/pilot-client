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
import './Workshops.css';

// TEMP: Replace with real user/admin logic
const isAdmin = stryMutAct_9fa48("28413") ? true : (stryCov_9fa48("28413"), false);
const currentUserName = stryMutAct_9fa48("28414") ? "" : (stryCov_9fa48("28414"), 'You');
const Workshops = () => {
  if (stryMutAct_9fa48("28415")) {
    {}
  } else {
    stryCov_9fa48("28415");
    const navigate = useNavigate();
    const [events, setEvents] = useState(stryMutAct_9fa48("28416") ? ["Stryker was here"] : (stryCov_9fa48("28416"), []));
    const [user, setUser] = useState(null);
    const [newEvent, setNewEvent] = useState(stryMutAct_9fa48("28417") ? {} : (stryCov_9fa48("28417"), {
      title: stryMutAct_9fa48("28418") ? "Stryker was here!" : (stryCov_9fa48("28418"), ''),
      description: stryMutAct_9fa48("28419") ? "Stryker was here!" : (stryCov_9fa48("28419"), ''),
      start_time: stryMutAct_9fa48("28420") ? "Stryker was here!" : (stryCov_9fa48("28420"), ''),
      end_time: stryMutAct_9fa48("28421") ? "Stryker was here!" : (stryCov_9fa48("28421"), ''),
      location: stryMutAct_9fa48("28422") ? "Stryker was here!" : (stryCov_9fa48("28422"), ''),
      capacity: stryMutAct_9fa48("28423") ? "Stryker was here!" : (stryCov_9fa48("28423"), ''),
      is_online: stryMutAct_9fa48("28424") ? true : (stryCov_9fa48("28424"), false),
      meeting_link: stryMutAct_9fa48("28425") ? "Stryker was here!" : (stryCov_9fa48("28425"), '')
    }));
    const [currentApplicantId, setCurrentApplicantId] = useState(null);
    const [registrationStatus, setRegistrationStatus] = useState(null);
    const [statusMessage, setStatusMessage] = useState(stryMutAct_9fa48("28426") ? "Stryker was here!" : (stryCov_9fa48("28426"), ''));
    const [processingEventId, setProcessingEventId] = useState(null);
    const [rescheduleEvent, setRescheduleEvent] = useState(null);
    const [cancelReason, setCancelReason] = useState(stryMutAct_9fa48("28427") ? "Stryker was here!" : (stryCov_9fa48("28427"), ''));
    const [showCancelModal, setShowCancelModal] = useState(stryMutAct_9fa48("28428") ? true : (stryCov_9fa48("28428"), false));
    const [showRescheduleModal, setShowRescheduleModal] = useState(stryMutAct_9fa48("28429") ? true : (stryCov_9fa48("28429"), false));
    const [showLaptopModal, setShowLaptopModal] = useState(stryMutAct_9fa48("28430") ? true : (stryCov_9fa48("28430"), false));
    const [selectedEventId, setSelectedEventId] = useState(null);
    const [needsLaptop, setNeedsLaptop] = useState(stryMutAct_9fa48("28431") ? true : (stryCov_9fa48("28431"), false));

    // Self-managed status state (no longer relying on props)
    const [workshopStatus, setWorkshopStatus] = useState(stryMutAct_9fa48("28434") ? localStorage.getItem('workshopStatus') && 'locked' : stryMutAct_9fa48("28433") ? false : stryMutAct_9fa48("28432") ? true : (stryCov_9fa48("28432", "28433", "28434"), localStorage.getItem(stryMutAct_9fa48("28435") ? "" : (stryCov_9fa48("28435"), 'workshopStatus')) || (stryMutAct_9fa48("28436") ? "" : (stryCov_9fa48("28436"), 'locked'))));
    const [workshopDetails, setWorkshopDetails] = useState(() => {
      if (stryMutAct_9fa48("28437")) {
        {}
      } else {
        stryCov_9fa48("28437");
        const saved = localStorage.getItem(stryMutAct_9fa48("28438") ? "" : (stryCov_9fa48("28438"), 'workshopDetails'));
        return saved ? JSON.parse(saved) : null;
      }
    });

    // Load current applicant ID on mount
    useEffect(() => {
      if (stryMutAct_9fa48("28439")) {
        {}
      } else {
        stryCov_9fa48("28439");
        const loadApplicantId = async () => {
          if (stryMutAct_9fa48("28440")) {
            {}
          } else {
            stryCov_9fa48("28440");
            try {
              if (stryMutAct_9fa48("28441")) {
                {}
              } else {
                stryCov_9fa48("28441");
                const savedUser = localStorage.getItem(stryMutAct_9fa48("28442") ? "" : (stryCov_9fa48("28442"), 'user'));
                if (stryMutAct_9fa48("28444") ? false : stryMutAct_9fa48("28443") ? true : (stryCov_9fa48("28443", "28444"), savedUser)) {
                  if (stryMutAct_9fa48("28445")) {
                    {}
                  } else {
                    stryCov_9fa48("28445");
                    const userData = JSON.parse(savedUser);
                    setUser(userData);

                    // Get applicant ID from the database using email
                    const response = await fetch(stryMutAct_9fa48("28446") ? `` : (stryCov_9fa48("28446"), `${import.meta.env.VITE_API_URL}/api/applications/applicant/by-email/${userData.email}`));
                    if (stryMutAct_9fa48("28448") ? false : stryMutAct_9fa48("28447") ? true : (stryCov_9fa48("28447", "28448"), response.ok)) {
                      if (stryMutAct_9fa48("28449")) {
                        {}
                      } else {
                        stryCov_9fa48("28449");
                        const applicant = await response.json();
                        setCurrentApplicantId(applicant.applicant_id);
                        console.log(stryMutAct_9fa48("28450") ? "" : (stryCov_9fa48("28450"), 'Loaded applicant ID:'), applicant.applicant_id);
                      }
                    } else {
                      if (stryMutAct_9fa48("28451")) {
                        {}
                      } else {
                        stryCov_9fa48("28451");
                        console.warn(stryMutAct_9fa48("28452") ? "" : (stryCov_9fa48("28452"), 'Could not load applicant ID'));
                      }
                    }
                  }
                }
              }
            } catch (error) {
              if (stryMutAct_9fa48("28453")) {
                {}
              } else {
                stryCov_9fa48("28453");
                console.error(stryMutAct_9fa48("28454") ? "" : (stryCov_9fa48("28454"), 'Error loading applicant ID:'), error);
              }
            }
          }
        };
        loadApplicantId();
      }
    }, stryMutAct_9fa48("28455") ? ["Stryker was here"] : (stryCov_9fa48("28455"), []));

    // Clear status messages after 5 seconds
    useEffect(() => {
      if (stryMutAct_9fa48("28456")) {
        {}
      } else {
        stryCov_9fa48("28456");
        if (stryMutAct_9fa48("28458") ? false : stryMutAct_9fa48("28457") ? true : (stryCov_9fa48("28457", "28458"), registrationStatus)) {
          if (stryMutAct_9fa48("28459")) {
            {}
          } else {
            stryCov_9fa48("28459");
            const timer = setTimeout(() => {
              if (stryMutAct_9fa48("28460")) {
                {}
              } else {
                stryCov_9fa48("28460");
                setRegistrationStatus(null);
                setStatusMessage(stryMutAct_9fa48("28461") ? "Stryker was here!" : (stryCov_9fa48("28461"), ''));
              }
            }, 5000);
            return stryMutAct_9fa48("28462") ? () => undefined : (stryCov_9fa48("28462"), () => clearTimeout(timer));
          }
        }
      }
    }, stryMutAct_9fa48("28463") ? [] : (stryCov_9fa48("28463"), [registrationStatus]));

    // Fetch workshops on mount
    useEffect(() => {
      if (stryMutAct_9fa48("28464")) {
        {}
      } else {
        stryCov_9fa48("28464");
        const fetchEvents = async () => {
          if (stryMutAct_9fa48("28465")) {
            {}
          } else {
            stryCov_9fa48("28465");
            try {
              if (stryMutAct_9fa48("28466")) {
                {}
              } else {
                stryCov_9fa48("28466");
                console.log(stryMutAct_9fa48("28467") ? "" : (stryCov_9fa48("28467"), '=== STARTING WORKSHOPS FETCH ==='));
                console.log(stryMutAct_9fa48("28468") ? "" : (stryCov_9fa48("28468"), 'API URL:'), import.meta.env.VITE_API_URL);
                console.log(stryMutAct_9fa48("28469") ? "" : (stryCov_9fa48("28469"), 'Full URL:'), stryMutAct_9fa48("28470") ? `` : (stryCov_9fa48("28470"), `${import.meta.env.VITE_API_URL}/api/workshops`));
                const response = await fetch(stryMutAct_9fa48("28471") ? `` : (stryCov_9fa48("28471"), `${import.meta.env.VITE_API_URL}/api/workshops`));
                console.log(stryMutAct_9fa48("28472") ? "" : (stryCov_9fa48("28472"), 'Response received:'), response);
                console.log(stryMutAct_9fa48("28473") ? "" : (stryCov_9fa48("28473"), 'Response status:'), response.status);
                console.log(stryMutAct_9fa48("28474") ? "" : (stryCov_9fa48("28474"), 'Response ok:'), response.ok);
                if (stryMutAct_9fa48("28477") ? false : stryMutAct_9fa48("28476") ? true : stryMutAct_9fa48("28475") ? response.ok : (stryCov_9fa48("28475", "28476", "28477"), !response.ok)) {
                  if (stryMutAct_9fa48("28478")) {
                    {}
                  } else {
                    stryCov_9fa48("28478");
                    throw new Error(stryMutAct_9fa48("28479") ? `` : (stryCov_9fa48("28479"), `Failed to fetch workshops: ${response.status}`));
                  }
                }
                const data = await response.json();
                console.log(stryMutAct_9fa48("28480") ? "" : (stryCov_9fa48("28480"), '=== WORKSHOPS DATA RECEIVED ==='));
                console.log(stryMutAct_9fa48("28481") ? "" : (stryCov_9fa48("28481"), 'Raw data:'), data);
                console.log(stryMutAct_9fa48("28482") ? "" : (stryCov_9fa48("28482"), 'Data type:'), typeof data);
                console.log(stryMutAct_9fa48("28483") ? "" : (stryCov_9fa48("28483"), 'Is array:'), Array.isArray(data));
                console.log(stryMutAct_9fa48("28484") ? "" : (stryCov_9fa48("28484"), 'Number of workshops:'), data.length);

                // Add registrations data to each event
                const eventsWithRegistrations = data.map(stryMutAct_9fa48("28485") ? () => undefined : (stryCov_9fa48("28485"), event => stryMutAct_9fa48("28486") ? {} : (stryCov_9fa48("28486"), {
                  ...event,
                  registrations: stryMutAct_9fa48("28489") ? event.registrations && [] : stryMutAct_9fa48("28488") ? false : stryMutAct_9fa48("28487") ? true : (stryCov_9fa48("28487", "28488", "28489"), event.registrations || (stryMutAct_9fa48("28490") ? ["Stryker was here"] : (stryCov_9fa48("28490"), [])))
                })));
                console.log(stryMutAct_9fa48("28491") ? "" : (stryCov_9fa48("28491"), 'Events with registrations:'), eventsWithRegistrations);
                console.log(stryMutAct_9fa48("28492") ? "" : (stryCov_9fa48("28492"), 'About to set events state...'));
                setEvents(eventsWithRegistrations);
                console.log(stryMutAct_9fa48("28493") ? "" : (stryCov_9fa48("28493"), 'setEvents called with:'), eventsWithRegistrations.length, stryMutAct_9fa48("28494") ? "" : (stryCov_9fa48("28494"), 'events'));
              }
            } catch (error) {
              if (stryMutAct_9fa48("28495")) {
                {}
              } else {
                stryCov_9fa48("28495");
                console.error(stryMutAct_9fa48("28496") ? "" : (stryCov_9fa48("28496"), '=== WORKSHOPS FETCH ERROR ==='));
                console.error(stryMutAct_9fa48("28497") ? "" : (stryCov_9fa48("28497"), 'Error fetching events:'), error);
                console.error(stryMutAct_9fa48("28498") ? "" : (stryCov_9fa48("28498"), 'Error message:'), error.message);
                setEvents(stryMutAct_9fa48("28499") ? ["Stryker was here"] : (stryCov_9fa48("28499"), [])); // Ensure events is always an array
              }
            }
          }
        };
        console.log(stryMutAct_9fa48("28500") ? "" : (stryCov_9fa48("28500"), '=== WORKSHOPS USEEFFECT TRIGGERED ==='));
        fetchEvents();
      }
    }, stryMutAct_9fa48("28501") ? ["Stryker was here"] : (stryCov_9fa48("28501"), [])); // Remove currentUserId dependency since we don't need it for fetching

    // Add new event (admin only - not implemented for applicants)
    const handleAddEvent = async e => {
      if (stryMutAct_9fa48("28502")) {
        {}
      } else {
        stryCov_9fa48("28502");
        e.preventDefault();
        console.log(stryMutAct_9fa48("28503") ? "" : (stryCov_9fa48("28503"), 'Event creation not available for applicants'));
      }
    };

    // Show laptop selection modal
    const handleReserveClick = eventId => {
      if (stryMutAct_9fa48("28504")) {
        {}
      } else {
        stryCov_9fa48("28504");
        setSelectedEventId(eventId);
        setNeedsLaptop(stryMutAct_9fa48("28505") ? true : (stryCov_9fa48("28505"), false)); // Reset selection
        setShowLaptopModal(stryMutAct_9fa48("28506") ? false : (stryCov_9fa48("28506"), true));
      }
    };

    // Close laptop modal
    const handleCloseLaptopModal = () => {
      if (stryMutAct_9fa48("28507")) {
        {}
      } else {
        stryCov_9fa48("28507");
        setShowLaptopModal(stryMutAct_9fa48("28508") ? true : (stryCov_9fa48("28508"), false));
        setSelectedEventId(null);
        setNeedsLaptop(stryMutAct_9fa48("28509") ? true : (stryCov_9fa48("28509"), false));
      }
    };

    // Complete registration after laptop selection
    const handleCompleteRegistration = async () => {
      if (stryMutAct_9fa48("28510")) {
        {}
      } else {
        stryCov_9fa48("28510");
        if (stryMutAct_9fa48("28513") ? false : stryMutAct_9fa48("28512") ? true : stryMutAct_9fa48("28511") ? selectedEventId : (stryCov_9fa48("28511", "28512", "28513"), !selectedEventId)) return;
        setProcessingEventId(selectedEventId);
        setShowLaptopModal(stryMutAct_9fa48("28514") ? true : (stryCov_9fa48("28514"), false));
        try {
          if (stryMutAct_9fa48("28515")) {
            {}
          } else {
            stryCov_9fa48("28515");
            if (stryMutAct_9fa48("28518") ? false : stryMutAct_9fa48("28517") ? true : stryMutAct_9fa48("28516") ? currentApplicantId : (stryCov_9fa48("28516", "28517", "28518"), !currentApplicantId)) {
              if (stryMutAct_9fa48("28519")) {
                {}
              } else {
                stryCov_9fa48("28519");
                throw new Error(stryMutAct_9fa48("28520") ? "" : (stryCov_9fa48("28520"), 'Applicant ID not available'));
              }
            }
            const registrationData = stryMutAct_9fa48("28521") ? {} : (stryCov_9fa48("28521"), {
              applicantId: currentApplicantId,
              name: stryMutAct_9fa48("28524") ? user?.firstName && 'Applicant' : stryMutAct_9fa48("28523") ? false : stryMutAct_9fa48("28522") ? true : (stryCov_9fa48("28522", "28523", "28524"), (stryMutAct_9fa48("28525") ? user.firstName : (stryCov_9fa48("28525"), user?.firstName)) || (stryMutAct_9fa48("28526") ? "" : (stryCov_9fa48("28526"), 'Applicant'))),
              email: stryMutAct_9fa48("28529") ? user?.email && 'jac@pursuit.org' : stryMutAct_9fa48("28528") ? false : stryMutAct_9fa48("28527") ? true : (stryCov_9fa48("28527", "28528", "28529"), (stryMutAct_9fa48("28530") ? user.email : (stryCov_9fa48("28530"), user?.email)) || (stryMutAct_9fa48("28531") ? "" : (stryCov_9fa48("28531"), 'jac@pursuit.org'))),
              needsLaptop: needsLaptop
            });
            const response = await fetch(stryMutAct_9fa48("28532") ? `` : (stryCov_9fa48("28532"), `${import.meta.env.VITE_API_URL}/api/workshops/${selectedEventId}/register`), stryMutAct_9fa48("28533") ? {} : (stryCov_9fa48("28533"), {
              method: stryMutAct_9fa48("28534") ? "" : (stryCov_9fa48("28534"), 'POST'),
              headers: stryMutAct_9fa48("28535") ? {} : (stryCov_9fa48("28535"), {
                'Content-Type': stryMutAct_9fa48("28536") ? "" : (stryCov_9fa48("28536"), 'application/json')
              }),
              body: JSON.stringify(registrationData)
            }));
            if (stryMutAct_9fa48("28539") ? false : stryMutAct_9fa48("28538") ? true : stryMutAct_9fa48("28537") ? response.ok : (stryCov_9fa48("28537", "28538", "28539"), !response.ok)) {
              if (stryMutAct_9fa48("28540")) {
                {}
              } else {
                stryCov_9fa48("28540");
                const errorData = await response.json();
                throw new Error(stryMutAct_9fa48("28543") ? errorData.message && 'Failed to register for event' : stryMutAct_9fa48("28542") ? false : stryMutAct_9fa48("28541") ? true : (stryCov_9fa48("28541", "28542", "28543"), errorData.message || (stryMutAct_9fa48("28544") ? "" : (stryCov_9fa48("28544"), 'Failed to register for event'))));
              }
            }
            const responseData = await response.json();

            // SUCCESS - Show success status
            const event = events.find(stryMutAct_9fa48("28545") ? () => undefined : (stryCov_9fa48("28545"), e => stryMutAct_9fa48("28548") ? e.event_id !== selectedEventId : stryMutAct_9fa48("28547") ? false : stryMutAct_9fa48("28546") ? true : (stryCov_9fa48("28546", "28547", "28548"), e.event_id === selectedEventId)));
            const easternEventTime = getEasternTimeParts(event.start_time);
            const eventDate = format(easternEventTime, stryMutAct_9fa48("28549") ? "" : (stryCov_9fa48("28549"), 'MMMM d, yyyy'));
            const eventTime = formatInEasternTime(event.start_time, stryMutAct_9fa48("28550") ? "" : (stryCov_9fa48("28550"), 'time'));
            const laptopMessage = needsLaptop ? stryMutAct_9fa48("28551") ? "" : (stryCov_9fa48("28551"), ' A laptop will be provided for you.') : stryMutAct_9fa48("28552") ? "Stryker was here!" : (stryCov_9fa48("28552"), '');
            setRegistrationStatus(stryMutAct_9fa48("28553") ? "" : (stryCov_9fa48("28553"), 'success'));
            setStatusMessage(stryMutAct_9fa48("28554") ? `` : (stryCov_9fa48("28554"), `You're registered for the Workshop on ${eventDate} at ${eventTime}!${laptopMessage}`));

            // Update local status state (multiple registrations now allowed)
            setWorkshopStatus(stryMutAct_9fa48("28555") ? "" : (stryCov_9fa48("28555"), 'signed-up'));

            // IMMEDIATE STATE UPDATE - Add the registration to the event in state
            setEvents(stryMutAct_9fa48("28556") ? () => undefined : (stryCov_9fa48("28556"), prevEvents => prevEvents.map(evt => {
              if (stryMutAct_9fa48("28557")) {
                {}
              } else {
                stryCov_9fa48("28557");
                if (stryMutAct_9fa48("28560") ? evt.event_id !== selectedEventId : stryMutAct_9fa48("28559") ? false : stryMutAct_9fa48("28558") ? true : (stryCov_9fa48("28558", "28559", "28560"), evt.event_id === selectedEventId)) {
                  if (stryMutAct_9fa48("28561")) {
                    {}
                  } else {
                    stryCov_9fa48("28561");
                    const newRegistration = stryMutAct_9fa48("28562") ? {} : (stryCov_9fa48("28562"), {
                      registration_id: stryMutAct_9fa48("28565") ? responseData.registration_id && `temp-${Date.now()}` : stryMutAct_9fa48("28564") ? false : stryMutAct_9fa48("28563") ? true : (stryCov_9fa48("28563", "28564", "28565"), responseData.registration_id || (stryMutAct_9fa48("28566") ? `` : (stryCov_9fa48("28566"), `temp-${Date.now()}`))),
                      applicant_id: currentApplicantId,
                      name: stryMutAct_9fa48("28569") ? user?.firstName && 'Applicant' : stryMutAct_9fa48("28568") ? false : stryMutAct_9fa48("28567") ? true : (stryCov_9fa48("28567", "28568", "28569"), (stryMutAct_9fa48("28570") ? user.firstName : (stryCov_9fa48("28570"), user?.firstName)) || (stryMutAct_9fa48("28571") ? "" : (stryCov_9fa48("28571"), 'Applicant'))),
                      email: stryMutAct_9fa48("28574") ? user?.email && 'jac@pursuit.org' : stryMutAct_9fa48("28573") ? false : stryMutAct_9fa48("28572") ? true : (stryCov_9fa48("28572", "28573", "28574"), (stryMutAct_9fa48("28575") ? user.email : (stryCov_9fa48("28575"), user?.email)) || (stryMutAct_9fa48("28576") ? "" : (stryCov_9fa48("28576"), 'jac@pursuit.org'))),
                      status: stryMutAct_9fa48("28577") ? "" : (stryCov_9fa48("28577"), 'registered'),
                      registered_at: new Date().toISOString(),
                      needs_laptop: needsLaptop
                    });
                    return stryMutAct_9fa48("28578") ? {} : (stryCov_9fa48("28578"), {
                      ...evt,
                      registrations: stryMutAct_9fa48("28579") ? [] : (stryCov_9fa48("28579"), [...(stryMutAct_9fa48("28582") ? evt.registrations && [] : stryMutAct_9fa48("28581") ? false : stryMutAct_9fa48("28580") ? true : (stryCov_9fa48("28580", "28581", "28582"), evt.registrations || (stryMutAct_9fa48("28583") ? ["Stryker was here"] : (stryCov_9fa48("28583"), [])))), newRegistration])
                    });
                  }
                }
                return evt;
              }
            })));
          }
        } catch (error) {
          if (stryMutAct_9fa48("28584")) {
            {}
          } else {
            stryCov_9fa48("28584");
            console.error(stryMutAct_9fa48("28585") ? "" : (stryCov_9fa48("28585"), 'Error signing up for event:'), error);

            // Enhanced error messages based on error type
            let errorMessage = stryMutAct_9fa48("28586") ? "" : (stryCov_9fa48("28586"), 'Failed to register for this workshop.');
            if (stryMutAct_9fa48("28589") ? (error.message.includes('already registered') || error.message.includes('User already registered')) && error.message.includes("You're already registered for an event") : stryMutAct_9fa48("28588") ? false : stryMutAct_9fa48("28587") ? true : (stryCov_9fa48("28587", "28588", "28589"), (stryMutAct_9fa48("28591") ? error.message.includes('already registered') && error.message.includes('User already registered') : stryMutAct_9fa48("28590") ? false : (stryCov_9fa48("28590", "28591"), error.message.includes(stryMutAct_9fa48("28592") ? "" : (stryCov_9fa48("28592"), 'already registered')) || error.message.includes(stryMutAct_9fa48("28593") ? "" : (stryCov_9fa48("28593"), 'User already registered')))) || error.message.includes(stryMutAct_9fa48("28594") ? "" : (stryCov_9fa48("28594"), "You're already registered for an event")))) {
              if (stryMutAct_9fa48("28595")) {
                {}
              } else {
                stryCov_9fa48("28595");
                errorMessage = error.message; // Use the backend message directly
              }
            } else if (stryMutAct_9fa48("28598") ? error.message.includes('capacity') && error.message.includes('full') : stryMutAct_9fa48("28597") ? false : stryMutAct_9fa48("28596") ? true : (stryCov_9fa48("28596", "28597", "28598"), error.message.includes(stryMutAct_9fa48("28599") ? "" : (stryCov_9fa48("28599"), 'capacity')) || error.message.includes(stryMutAct_9fa48("28600") ? "" : (stryCov_9fa48("28600"), 'full')))) {
              if (stryMutAct_9fa48("28601")) {
                {}
              } else {
                stryCov_9fa48("28601");
                errorMessage = stryMutAct_9fa48("28602") ? "" : (stryCov_9fa48("28602"), 'Sorry, this workshop is fully booked. Please try registering for another session.');
              }
            } else if (stryMutAct_9fa48("28604") ? false : stryMutAct_9fa48("28603") ? true : (stryCov_9fa48("28603", "28604"), error.message.includes(stryMutAct_9fa48("28605") ? "" : (stryCov_9fa48("28605"), 'not found')))) {
              if (stryMutAct_9fa48("28606")) {
                {}
              } else {
                stryCov_9fa48("28606");
                errorMessage = stryMutAct_9fa48("28607") ? "" : (stryCov_9fa48("28607"), 'This workshop is no longer available. Please refresh the page and try again.');
              }
            } else {
              if (stryMutAct_9fa48("28608")) {
                {}
              } else {
                stryCov_9fa48("28608");
                errorMessage = stryMutAct_9fa48("28609") ? `` : (stryCov_9fa48("28609"), `Registration failed: ${error.message}. Please try again or contact support.`);
              }
            }
            setRegistrationStatus(stryMutAct_9fa48("28610") ? "" : (stryCov_9fa48("28610"), 'error'));
            setStatusMessage(errorMessage);
          }
        } finally {
          if (stryMutAct_9fa48("28611")) {
            {}
          } else {
            stryCov_9fa48("28611");
            setProcessingEventId(null);
            setSelectedEventId(null);
            setNeedsLaptop(stryMutAct_9fa48("28612") ? true : (stryCov_9fa48("28612"), false));
          }
        }
      }
    };

    // Sign up for an event (keeping original for backward compatibility)
    const handleSignUp = async eventId => {
      if (stryMutAct_9fa48("28613")) {
        {}
      } else {
        stryCov_9fa48("28613");
        setProcessingEventId(eventId);
        try {
          if (stryMutAct_9fa48("28614")) {
            {}
          } else {
            stryCov_9fa48("28614");
            if (stryMutAct_9fa48("28617") ? false : stryMutAct_9fa48("28616") ? true : stryMutAct_9fa48("28615") ? currentApplicantId : (stryCov_9fa48("28615", "28616", "28617"), !currentApplicantId)) {
              if (stryMutAct_9fa48("28618")) {
                {}
              } else {
                stryCov_9fa48("28618");
                throw new Error(stryMutAct_9fa48("28619") ? "" : (stryCov_9fa48("28619"), 'Applicant ID not available'));
              }
            }
            const registrationData = stryMutAct_9fa48("28620") ? {} : (stryCov_9fa48("28620"), {
              applicantId: currentApplicantId,
              name: stryMutAct_9fa48("28623") ? user?.firstName && 'Applicant' : stryMutAct_9fa48("28622") ? false : stryMutAct_9fa48("28621") ? true : (stryCov_9fa48("28621", "28622", "28623"), (stryMutAct_9fa48("28624") ? user.firstName : (stryCov_9fa48("28624"), user?.firstName)) || (stryMutAct_9fa48("28625") ? "" : (stryCov_9fa48("28625"), 'Applicant'))),
              email: stryMutAct_9fa48("28628") ? user?.email && 'jac@pursuit.org' : stryMutAct_9fa48("28627") ? false : stryMutAct_9fa48("28626") ? true : (stryCov_9fa48("28626", "28627", "28628"), (stryMutAct_9fa48("28629") ? user.email : (stryCov_9fa48("28629"), user?.email)) || (stryMutAct_9fa48("28630") ? "" : (stryCov_9fa48("28630"), 'jac@pursuit.org')))
            });
            const response = await fetch(stryMutAct_9fa48("28631") ? `` : (stryCov_9fa48("28631"), `${import.meta.env.VITE_API_URL}/api/workshops/${eventId}/register`), stryMutAct_9fa48("28632") ? {} : (stryCov_9fa48("28632"), {
              method: stryMutAct_9fa48("28633") ? "" : (stryCov_9fa48("28633"), 'POST'),
              headers: stryMutAct_9fa48("28634") ? {} : (stryCov_9fa48("28634"), {
                'Content-Type': stryMutAct_9fa48("28635") ? "" : (stryCov_9fa48("28635"), 'application/json')
              }),
              body: JSON.stringify(registrationData)
            }));
            if (stryMutAct_9fa48("28638") ? false : stryMutAct_9fa48("28637") ? true : stryMutAct_9fa48("28636") ? response.ok : (stryCov_9fa48("28636", "28637", "28638"), !response.ok)) {
              if (stryMutAct_9fa48("28639")) {
                {}
              } else {
                stryCov_9fa48("28639");
                const errorData = await response.json();
                throw new Error(stryMutAct_9fa48("28642") ? errorData.message && 'Failed to register for event' : stryMutAct_9fa48("28641") ? false : stryMutAct_9fa48("28640") ? true : (stryCov_9fa48("28640", "28641", "28642"), errorData.message || (stryMutAct_9fa48("28643") ? "" : (stryCov_9fa48("28643"), 'Failed to register for event'))));
              }
            }
            const responseData = await response.json();

            // SUCCESS - Show success status
            const event = events.find(stryMutAct_9fa48("28644") ? () => undefined : (stryCov_9fa48("28644"), e => stryMutAct_9fa48("28647") ? e.event_id !== eventId : stryMutAct_9fa48("28646") ? false : stryMutAct_9fa48("28645") ? true : (stryCov_9fa48("28645", "28646", "28647"), e.event_id === eventId)));
            const easternEventTime = getEasternTimeParts(event.start_time);
            const eventDate = format(easternEventTime, stryMutAct_9fa48("28648") ? "" : (stryCov_9fa48("28648"), 'MMMM d, yyyy'));
            const eventTime = formatInEasternTime(event.start_time, stryMutAct_9fa48("28649") ? "" : (stryCov_9fa48("28649"), 'time'));
            setRegistrationStatus(stryMutAct_9fa48("28650") ? "" : (stryCov_9fa48("28650"), 'success'));
            setStatusMessage(stryMutAct_9fa48("28651") ? `` : (stryCov_9fa48("28651"), `You're registered for the Workshop on ${eventDate} at ${eventTime}!`));

            // Update local status state (multiple registrations now allowed)
            setWorkshopStatus(stryMutAct_9fa48("28652") ? "" : (stryCov_9fa48("28652"), 'signed-up'));

            // IMMEDIATE STATE UPDATE - Add the registration to the event in state
            setEvents(stryMutAct_9fa48("28653") ? () => undefined : (stryCov_9fa48("28653"), prevEvents => prevEvents.map(evt => {
              if (stryMutAct_9fa48("28654")) {
                {}
              } else {
                stryCov_9fa48("28654");
                if (stryMutAct_9fa48("28657") ? evt.event_id !== eventId : stryMutAct_9fa48("28656") ? false : stryMutAct_9fa48("28655") ? true : (stryCov_9fa48("28655", "28656", "28657"), evt.event_id === eventId)) {
                  if (stryMutAct_9fa48("28658")) {
                    {}
                  } else {
                    stryCov_9fa48("28658");
                    const newRegistration = stryMutAct_9fa48("28659") ? {} : (stryCov_9fa48("28659"), {
                      registration_id: stryMutAct_9fa48("28662") ? responseData.registration_id && `temp-${Date.now()}` : stryMutAct_9fa48("28661") ? false : stryMutAct_9fa48("28660") ? true : (stryCov_9fa48("28660", "28661", "28662"), responseData.registration_id || (stryMutAct_9fa48("28663") ? `` : (stryCov_9fa48("28663"), `temp-${Date.now()}`))),
                      applicant_id: currentApplicantId,
                      name: stryMutAct_9fa48("28666") ? user?.firstName && 'Applicant' : stryMutAct_9fa48("28665") ? false : stryMutAct_9fa48("28664") ? true : (stryCov_9fa48("28664", "28665", "28666"), (stryMutAct_9fa48("28667") ? user.firstName : (stryCov_9fa48("28667"), user?.firstName)) || (stryMutAct_9fa48("28668") ? "" : (stryCov_9fa48("28668"), 'Applicant'))),
                      email: stryMutAct_9fa48("28671") ? user?.email && 'jac@pursuit.org' : stryMutAct_9fa48("28670") ? false : stryMutAct_9fa48("28669") ? true : (stryCov_9fa48("28669", "28670", "28671"), (stryMutAct_9fa48("28672") ? user.email : (stryCov_9fa48("28672"), user?.email)) || (stryMutAct_9fa48("28673") ? "" : (stryCov_9fa48("28673"), 'jac@pursuit.org'))),
                      status: stryMutAct_9fa48("28674") ? "" : (stryCov_9fa48("28674"), 'registered'),
                      registered_at: new Date().toISOString()
                    });
                    return stryMutAct_9fa48("28675") ? {} : (stryCov_9fa48("28675"), {
                      ...evt,
                      registrations: stryMutAct_9fa48("28676") ? [] : (stryCov_9fa48("28676"), [...(stryMutAct_9fa48("28679") ? evt.registrations && [] : stryMutAct_9fa48("28678") ? false : stryMutAct_9fa48("28677") ? true : (stryCov_9fa48("28677", "28678", "28679"), evt.registrations || (stryMutAct_9fa48("28680") ? ["Stryker was here"] : (stryCov_9fa48("28680"), [])))), newRegistration])
                    });
                  }
                }
                return evt;
              }
            })));
          }
        } catch (error) {
          if (stryMutAct_9fa48("28681")) {
            {}
          } else {
            stryCov_9fa48("28681");
            console.error(stryMutAct_9fa48("28682") ? "" : (stryCov_9fa48("28682"), 'Error signing up for event:'), error);

            // Enhanced error messages based on error type
            let errorMessage = stryMutAct_9fa48("28683") ? "" : (stryCov_9fa48("28683"), 'Failed to register for this workshop.');
            if (stryMutAct_9fa48("28686") ? (error.message.includes('already registered') || error.message.includes('User already registered')) && error.message.includes("You're already registered for an event") : stryMutAct_9fa48("28685") ? false : stryMutAct_9fa48("28684") ? true : (stryCov_9fa48("28684", "28685", "28686"), (stryMutAct_9fa48("28688") ? error.message.includes('already registered') && error.message.includes('User already registered') : stryMutAct_9fa48("28687") ? false : (stryCov_9fa48("28687", "28688"), error.message.includes(stryMutAct_9fa48("28689") ? "" : (stryCov_9fa48("28689"), 'already registered')) || error.message.includes(stryMutAct_9fa48("28690") ? "" : (stryCov_9fa48("28690"), 'User already registered')))) || error.message.includes(stryMutAct_9fa48("28691") ? "" : (stryCov_9fa48("28691"), "You're already registered for an event")))) {
              if (stryMutAct_9fa48("28692")) {
                {}
              } else {
                stryCov_9fa48("28692");
                errorMessage = error.message; // Use the backend message directly
              }
            } else if (stryMutAct_9fa48("28695") ? error.message.includes('capacity') && error.message.includes('full') : stryMutAct_9fa48("28694") ? false : stryMutAct_9fa48("28693") ? true : (stryCov_9fa48("28693", "28694", "28695"), error.message.includes(stryMutAct_9fa48("28696") ? "" : (stryCov_9fa48("28696"), 'capacity')) || error.message.includes(stryMutAct_9fa48("28697") ? "" : (stryCov_9fa48("28697"), 'full')))) {
              if (stryMutAct_9fa48("28698")) {
                {}
              } else {
                stryCov_9fa48("28698");
                errorMessage = stryMutAct_9fa48("28699") ? "" : (stryCov_9fa48("28699"), 'Sorry, this workshop is fully booked. Please try registering for another session.');
              }
            } else if (stryMutAct_9fa48("28701") ? false : stryMutAct_9fa48("28700") ? true : (stryCov_9fa48("28700", "28701"), error.message.includes(stryMutAct_9fa48("28702") ? "" : (stryCov_9fa48("28702"), 'not found')))) {
              if (stryMutAct_9fa48("28703")) {
                {}
              } else {
                stryCov_9fa48("28703");
                errorMessage = stryMutAct_9fa48("28704") ? "" : (stryCov_9fa48("28704"), 'This workshop is no longer available. Please refresh the page and try again.');
              }
            } else {
              if (stryMutAct_9fa48("28705")) {
                {}
              } else {
                stryCov_9fa48("28705");
                errorMessage = stryMutAct_9fa48("28706") ? `` : (stryCov_9fa48("28706"), `Registration failed: ${error.message}. Please try again or contact support.`);
              }
            }
            setRegistrationStatus(stryMutAct_9fa48("28707") ? "" : (stryCov_9fa48("28707"), 'error'));
            setStatusMessage(errorMessage);
          }
        } finally {
          if (stryMutAct_9fa48("28708")) {
            {}
          } else {
            stryCov_9fa48("28708");
            setProcessingEventId(null);
          }
        }
      }
    };

    // Mark attendance
    const handleMarkAttendance = async (eventId, registrationId) => {
      if (stryMutAct_9fa48("28709")) {
        {}
      } else {
        stryCov_9fa48("28709");
        try {
          if (stryMutAct_9fa48("28710")) {
            {}
          } else {
            stryCov_9fa48("28710");
            await EventService.updateRegistrationStatus(eventId, registrationId, stryMutAct_9fa48("28711") ? "" : (stryCov_9fa48("28711"), 'attended'));
            const updatedEvents = await EventService.getEvents(stryMutAct_9fa48("28712") ? {} : (stryCov_9fa48("28712"), {
              type: stryMutAct_9fa48("28713") ? "" : (stryCov_9fa48("28713"), 'workshop')
            }));
            setEvents(updatedEvents);
          }
        } catch (error) {
          if (stryMutAct_9fa48("28714")) {
            {}
          } else {
            stryCov_9fa48("28714");
            console.error(stryMutAct_9fa48("28715") ? "" : (stryCov_9fa48("28715"), 'Error marking attendance:'), error);
          }
        }
      }
    };

    // Check if user is registered for an event (only active registrations)
    const isUserRegistered = event => {
      if (stryMutAct_9fa48("28716")) {
        {}
      } else {
        stryCov_9fa48("28716");
        return stryMutAct_9fa48("28718") ? event.registrations.some(reg => reg.applicant_id === currentApplicantId && reg.status !== 'cancelled') : stryMutAct_9fa48("28717") ? event.registrations?.every(reg => reg.applicant_id === currentApplicantId && reg.status !== 'cancelled') : (stryCov_9fa48("28717", "28718"), event.registrations?.some(stryMutAct_9fa48("28719") ? () => undefined : (stryCov_9fa48("28719"), reg => stryMutAct_9fa48("28722") ? reg.applicant_id === currentApplicantId || reg.status !== 'cancelled' : stryMutAct_9fa48("28721") ? false : stryMutAct_9fa48("28720") ? true : (stryCov_9fa48("28720", "28721", "28722"), (stryMutAct_9fa48("28724") ? reg.applicant_id !== currentApplicantId : stryMutAct_9fa48("28723") ? true : (stryCov_9fa48("28723", "28724"), reg.applicant_id === currentApplicantId)) && (stryMutAct_9fa48("28726") ? reg.status === 'cancelled' : stryMutAct_9fa48("28725") ? true : (stryCov_9fa48("28725", "28726"), reg.status !== (stryMutAct_9fa48("28727") ? "" : (stryCov_9fa48("28727"), 'cancelled'))))))));
      }
    };

    // Get user's active registration for an event
    const getUserRegistration = event => {
      if (stryMutAct_9fa48("28728")) {
        {}
      } else {
        stryCov_9fa48("28728");
        return stryMutAct_9fa48("28729") ? event.registrations.find(reg => reg.applicant_id === currentApplicantId && reg.status !== 'cancelled') : (stryCov_9fa48("28729"), event.registrations?.find(stryMutAct_9fa48("28730") ? () => undefined : (stryCov_9fa48("28730"), reg => stryMutAct_9fa48("28733") ? reg.applicant_id === currentApplicantId || reg.status !== 'cancelled' : stryMutAct_9fa48("28732") ? false : stryMutAct_9fa48("28731") ? true : (stryCov_9fa48("28731", "28732", "28733"), (stryMutAct_9fa48("28735") ? reg.applicant_id !== currentApplicantId : stryMutAct_9fa48("28734") ? true : (stryCov_9fa48("28734", "28735"), reg.applicant_id === currentApplicantId)) && (stryMutAct_9fa48("28737") ? reg.status === 'cancelled' : stryMutAct_9fa48("28736") ? true : (stryCov_9fa48("28736", "28737"), reg.status !== (stryMutAct_9fa48("28738") ? "" : (stryCov_9fa48("28738"), 'cancelled'))))))));
      }
    };

    // Check if an event has already passed
    const isEventPassed = event => {
      if (stryMutAct_9fa48("28739")) {
        {}
      } else {
        stryCov_9fa48("28739");
        const easternEventTime = getEasternTimeParts(event.start_time);
        const now = new Date();
        return stryMutAct_9fa48("28742") ? easternEventTime || easternEventTime < now : stryMutAct_9fa48("28741") ? false : stryMutAct_9fa48("28740") ? true : (stryCov_9fa48("28740", "28741", "28742"), easternEventTime && (stryMutAct_9fa48("28745") ? easternEventTime >= now : stryMutAct_9fa48("28744") ? easternEventTime <= now : stryMutAct_9fa48("28743") ? true : (stryCov_9fa48("28743", "28744", "28745"), easternEventTime < now)));
      }
    };

    // Get registered events
    const registeredEvents = stryMutAct_9fa48("28746") ? events : (stryCov_9fa48("28746"), events.filter(stryMutAct_9fa48("28747") ? () => undefined : (stryCov_9fa48("28747"), event => isUserRegistered(event))));
    const availableEvents = stryMutAct_9fa48("28748") ? events : (stryCov_9fa48("28748"), events.filter(stryMutAct_9fa48("28749") ? () => undefined : (stryCov_9fa48("28749"), event => stryMutAct_9fa48("28750") ? isUserRegistered(event) : (stryCov_9fa48("28750"), !isUserRegistered(event)))));

    // Cancel registration
    const handleCancelRegistration = async (eventId, registrationId) => {
      if (stryMutAct_9fa48("28751")) {
        {}
      } else {
        stryCov_9fa48("28751");
        setProcessingEventId(eventId);
        try {
          if (stryMutAct_9fa48("28752")) {
            {}
          } else {
            stryCov_9fa48("28752");
            console.log(stryMutAct_9fa48("28753") ? "" : (stryCov_9fa48("28753"), '=== WORKSHOP CANCELLATION ATTEMPT ==='));
            console.log(stryMutAct_9fa48("28754") ? "" : (stryCov_9fa48("28754"), 'Event ID:'), eventId);
            console.log(stryMutAct_9fa48("28755") ? "" : (stryCov_9fa48("28755"), 'Applicant ID:'), currentApplicantId);
            console.log(stryMutAct_9fa48("28756") ? "" : (stryCov_9fa48("28756"), 'Registration ID:'), registrationId);
            console.log(stryMutAct_9fa48("28757") ? "" : (stryCov_9fa48("28757"), 'Full URL:'), stryMutAct_9fa48("28758") ? `` : (stryCov_9fa48("28758"), `${import.meta.env.VITE_API_URL}/api/workshops/${eventId}/register/${currentApplicantId}`));
            const response = await fetch(stryMutAct_9fa48("28759") ? `` : (stryCov_9fa48("28759"), `${import.meta.env.VITE_API_URL}/api/workshops/${eventId}/register/${currentApplicantId}`), stryMutAct_9fa48("28760") ? {} : (stryCov_9fa48("28760"), {
              method: stryMutAct_9fa48("28761") ? "" : (stryCov_9fa48("28761"), 'DELETE')
            }));
            console.log(stryMutAct_9fa48("28762") ? "" : (stryCov_9fa48("28762"), 'Cancel response status:'), response.status);
            console.log(stryMutAct_9fa48("28763") ? "" : (stryCov_9fa48("28763"), 'Cancel response ok:'), response.ok);
            if (stryMutAct_9fa48("28766") ? false : stryMutAct_9fa48("28765") ? true : stryMutAct_9fa48("28764") ? response.ok : (stryCov_9fa48("28764", "28765", "28766"), !response.ok)) {
              if (stryMutAct_9fa48("28767")) {
                {}
              } else {
                stryCov_9fa48("28767");
                const errorData = await response.json().catch(stryMutAct_9fa48("28768") ? () => undefined : (stryCov_9fa48("28768"), () => stryMutAct_9fa48("28769") ? {} : (stryCov_9fa48("28769"), {
                  message: stryMutAct_9fa48("28770") ? "" : (stryCov_9fa48("28770"), 'Unknown error')
                })));
                console.error(stryMutAct_9fa48("28771") ? "" : (stryCov_9fa48("28771"), 'Cancel response error:'), errorData);
                throw new Error(stryMutAct_9fa48("28774") ? errorData.message && `Failed to cancel registration (${response.status})` : stryMutAct_9fa48("28773") ? false : stryMutAct_9fa48("28772") ? true : (stryCov_9fa48("28772", "28773", "28774"), errorData.message || (stryMutAct_9fa48("28775") ? `` : (stryCov_9fa48("28775"), `Failed to cancel registration (${response.status})`))));
              }
            }
            const responseData = await response.json();
            console.log(stryMutAct_9fa48("28776") ? "" : (stryCov_9fa48("28776"), 'Cancel response data:'), responseData);

            // IMMEDIATE STATE UPDATE - Mark registration as cancelled
            setEvents(prevEvents => {
              if (stryMutAct_9fa48("28777")) {
                {}
              } else {
                stryCov_9fa48("28777");
                return prevEvents.map(evt => {
                  if (stryMutAct_9fa48("28778")) {
                    {}
                  } else {
                    stryCov_9fa48("28778");
                    if (stryMutAct_9fa48("28781") ? evt.event_id !== eventId : stryMutAct_9fa48("28780") ? false : stryMutAct_9fa48("28779") ? true : (stryCov_9fa48("28779", "28780", "28781"), evt.event_id === eventId)) {
                      if (stryMutAct_9fa48("28782")) {
                        {}
                      } else {
                        stryCov_9fa48("28782");
                        const updatedRegistrations = (stryMutAct_9fa48("28785") ? evt.registrations && [] : stryMutAct_9fa48("28784") ? false : stryMutAct_9fa48("28783") ? true : (stryCov_9fa48("28783", "28784", "28785"), evt.registrations || (stryMutAct_9fa48("28786") ? ["Stryker was here"] : (stryCov_9fa48("28786"), [])))).map(reg => {
                          if (stryMutAct_9fa48("28787")) {
                            {}
                          } else {
                            stryCov_9fa48("28787");
                            if (stryMutAct_9fa48("28790") ? reg.registration_id !== registrationId : stryMutAct_9fa48("28789") ? false : stryMutAct_9fa48("28788") ? true : (stryCov_9fa48("28788", "28789", "28790"), reg.registration_id === registrationId)) {
                              if (stryMutAct_9fa48("28791")) {
                                {}
                              } else {
                                stryCov_9fa48("28791");
                                return stryMutAct_9fa48("28792") ? {} : (stryCov_9fa48("28792"), {
                                  ...reg,
                                  status: stryMutAct_9fa48("28793") ? "" : (stryCov_9fa48("28793"), 'cancelled')
                                });
                              }
                            }
                            return reg;
                          }
                        });
                        return stryMutAct_9fa48("28794") ? {} : (stryCov_9fa48("28794"), {
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
            setRegistrationStatus(stryMutAct_9fa48("28795") ? "" : (stryCov_9fa48("28795"), 'success'));
            setStatusMessage(stryMutAct_9fa48("28796") ? "" : (stryCov_9fa48("28796"), 'Registration cancelled successfully.'));

            // Check if user still has other workshop registrations
            const remainingRegistrations = stryMutAct_9fa48("28797") ? events : (stryCov_9fa48("28797"), events.filter(stryMutAct_9fa48("28798") ? () => undefined : (stryCov_9fa48("28798"), evt => stryMutAct_9fa48("28801") ? evt.event_id !== eventId || evt.registrations?.some(reg => reg.applicant_id === currentApplicantId && reg.status !== 'cancelled') : stryMutAct_9fa48("28800") ? false : stryMutAct_9fa48("28799") ? true : (stryCov_9fa48("28799", "28800", "28801"), (stryMutAct_9fa48("28803") ? evt.event_id === eventId : stryMutAct_9fa48("28802") ? true : (stryCov_9fa48("28802", "28803"), evt.event_id !== eventId)) && (stryMutAct_9fa48("28805") ? evt.registrations.some(reg => reg.applicant_id === currentApplicantId && reg.status !== 'cancelled') : stryMutAct_9fa48("28804") ? evt.registrations?.every(reg => reg.applicant_id === currentApplicantId && reg.status !== 'cancelled') : (stryCov_9fa48("28804", "28805"), evt.registrations?.some(stryMutAct_9fa48("28806") ? () => undefined : (stryCov_9fa48("28806"), reg => stryMutAct_9fa48("28809") ? reg.applicant_id === currentApplicantId || reg.status !== 'cancelled' : stryMutAct_9fa48("28808") ? false : stryMutAct_9fa48("28807") ? true : (stryCov_9fa48("28807", "28808", "28809"), (stryMutAct_9fa48("28811") ? reg.applicant_id !== currentApplicantId : stryMutAct_9fa48("28810") ? true : (stryCov_9fa48("28810", "28811"), reg.applicant_id === currentApplicantId)) && (stryMutAct_9fa48("28813") ? reg.status === 'cancelled' : stryMutAct_9fa48("28812") ? true : (stryCov_9fa48("28812", "28813"), reg.status !== (stryMutAct_9fa48("28814") ? "" : (stryCov_9fa48("28814"), 'cancelled')))))))))))));

            // Only clear status if no other registrations exist
            if (stryMutAct_9fa48("28817") ? remainingRegistrations.length !== 0 : stryMutAct_9fa48("28816") ? false : stryMutAct_9fa48("28815") ? true : (stryCov_9fa48("28815", "28816", "28817"), remainingRegistrations.length === 0)) {
              if (stryMutAct_9fa48("28818")) {
                {}
              } else {
                stryCov_9fa48("28818");
                setWorkshopStatus(stryMutAct_9fa48("28819") ? "" : (stryCov_9fa48("28819"), 'locked'));
              }
            }

            // Force refresh to ensure we have the latest data from server
            setTimeout(async () => {
              if (stryMutAct_9fa48("28820")) {
                {}
              } else {
                stryCov_9fa48("28820");
                try {
                  if (stryMutAct_9fa48("28821")) {
                    {}
                  } else {
                    stryCov_9fa48("28821");
                    const response = await fetch(stryMutAct_9fa48("28822") ? `` : (stryCov_9fa48("28822"), `${import.meta.env.VITE_API_URL}/api/workshops`));
                    if (stryMutAct_9fa48("28824") ? false : stryMutAct_9fa48("28823") ? true : (stryCov_9fa48("28823", "28824"), response.ok)) {
                      if (stryMutAct_9fa48("28825")) {
                        {}
                      } else {
                        stryCov_9fa48("28825");
                        const data = await response.json();
                        const eventsWithRegistrations = data.map(stryMutAct_9fa48("28826") ? () => undefined : (stryCov_9fa48("28826"), event => stryMutAct_9fa48("28827") ? {} : (stryCov_9fa48("28827"), {
                          ...event,
                          registrations: stryMutAct_9fa48("28830") ? event.registrations && [] : stryMutAct_9fa48("28829") ? false : stryMutAct_9fa48("28828") ? true : (stryCov_9fa48("28828", "28829", "28830"), event.registrations || (stryMutAct_9fa48("28831") ? ["Stryker was here"] : (stryCov_9fa48("28831"), [])))
                        })));
                        setEvents(eventsWithRegistrations);
                      }
                    }
                  }
                } catch (error) {
                  if (stryMutAct_9fa48("28832")) {
                    {}
                  } else {
                    stryCov_9fa48("28832");
                    console.error(stryMutAct_9fa48("28833") ? "" : (stryCov_9fa48("28833"), 'Error refreshing after cancellation:'), error);
                  }
                }
              }
            }, 100); // Small delay to ensure server state is updated
          }
        } catch (error) {
          if (stryMutAct_9fa48("28834")) {
            {}
          } else {
            stryCov_9fa48("28834");
            console.error(stryMutAct_9fa48("28835") ? "" : (stryCov_9fa48("28835"), 'Error cancelling registration:'), error);
            setRegistrationStatus(stryMutAct_9fa48("28836") ? "" : (stryCov_9fa48("28836"), 'error'));
            setStatusMessage(stryMutAct_9fa48("28837") ? `` : (stryCov_9fa48("28837"), `Failed to cancel registration: ${error.message}`));
          }
        } finally {
          if (stryMutAct_9fa48("28838")) {
            {}
          } else {
            stryCov_9fa48("28838");
            setProcessingEventId(null);
          }
        }
      }
    };

    // Cancel event (admin only - not available for applicants)
    const handleCancelEvent = async eventId => {
      if (stryMutAct_9fa48("28839")) {
        {}
      } else {
        stryCov_9fa48("28839");
        console.log(stryMutAct_9fa48("28840") ? "" : (stryCov_9fa48("28840"), 'Event cancellation not available for applicants'));
      }
    };

    // Reschedule event (admin only - not available for applicants)
    const handleRescheduleEvent = async eventId => {
      if (stryMutAct_9fa48("28841")) {
        {}
      } else {
        stryCov_9fa48("28841");
        console.log(stryMutAct_9fa48("28842") ? "" : (stryCov_9fa48("28842"), 'Event rescheduling not available for applicants'));
      }
    };
    const handleLogout = () => {
      if (stryMutAct_9fa48("28843")) {
        {}
      } else {
        stryCov_9fa48("28843");
        localStorage.removeItem(stryMutAct_9fa48("28844") ? "" : (stryCov_9fa48("28844"), 'user'));
        setUser(null);
        navigate(stryMutAct_9fa48("28845") ? "" : (stryCov_9fa48("28845"), '/login'));
      }
    };
    const handleBackToMainApp = () => {
      if (stryMutAct_9fa48("28846")) {
        {}
      } else {
        stryCov_9fa48("28846");
        navigate(stryMutAct_9fa48("28847") ? "" : (stryCov_9fa48("28847"), '/dashboard'));
      }
    };
    const handleBackToDashboard = () => {
      if (stryMutAct_9fa48("28848")) {
        {}
      } else {
        stryCov_9fa48("28848");
        navigate(stryMutAct_9fa48("28849") ? "" : (stryCov_9fa48("28849"), '/apply'));
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
                        Welcome, {stryMutAct_9fa48("28852") ? user?.firstName && 'John' : stryMutAct_9fa48("28851") ? false : stryMutAct_9fa48("28850") ? true : (stryCov_9fa48("28850", "28851", "28852"), (stryMutAct_9fa48("28853") ? user.firstName : (stryCov_9fa48("28853"), user?.firstName)) || (stryMutAct_9fa48("28854") ? "" : (stryCov_9fa48("28854"), 'John')))}!
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

            {/* Workshops Container */}
            <div className="workshops-main">
                {/* Title */}
                <div className="admissions-dashboard__title-section">
                    <h1 className="admissions-dashboard__title">
                        Select a time slot for your workshop at Pursuit HQ in Long Island City, Queens.
                    </h1>
                </div>

                <div className="workshops-content">
                    {/* Status Messages */}
                    {stryMutAct_9fa48("28857") ? registrationStatus || <div className={`status-banner ${registrationStatus}`}>
                            <div className="status-content">
                                <span className="status-icon">
                                    {registrationStatus === 'success' ? '🎉' : '⚠️'}
                                </span>
                                <strong>{statusMessage}</strong>
                            </div>
                        </div> : stryMutAct_9fa48("28856") ? false : stryMutAct_9fa48("28855") ? true : (stryCov_9fa48("28855", "28856", "28857"), registrationStatus && <div className={stryMutAct_9fa48("28858") ? `` : (stryCov_9fa48("28858"), `status-banner ${registrationStatus}`)}>
                            <div className="status-content">
                                <span className="status-icon">
                                    {(stryMutAct_9fa48("28861") ? registrationStatus !== 'success' : stryMutAct_9fa48("28860") ? false : stryMutAct_9fa48("28859") ? true : (stryCov_9fa48("28859", "28860", "28861"), registrationStatus === (stryMutAct_9fa48("28862") ? "" : (stryCov_9fa48("28862"), 'success')))) ? stryMutAct_9fa48("28863") ? "" : (stryCov_9fa48("28863"), '🎉') : stryMutAct_9fa48("28864") ? "" : (stryCov_9fa48("28864"), '⚠️')}
                                </span>
                                <strong>{statusMessage}</strong>
                            </div>
                        </div>)}

                    {/* Time Slots Grid */}
                    <div className="time-slots-grid">
                        {(stryMutAct_9fa48("28867") ? events.length !== 0 : stryMutAct_9fa48("28866") ? false : stryMutAct_9fa48("28865") ? true : (stryCov_9fa48("28865", "28866", "28867"), events.length === 0)) ? <div className="no-sessions-message">
                                <h3>No Workshops Scheduled</h3>
                                <p>We'll add workshops as soon as they're scheduled. Check back regularly!</p>
                            </div> : events.map(event => {
              if (stryMutAct_9fa48("28868")) {
                {}
              } else {
                stryCov_9fa48("28868");
                const isRegistered = isUserRegistered(event);
                const isFull = stryMutAct_9fa48("28872") ? (event.registered_count || 0) < event.capacity : stryMutAct_9fa48("28871") ? (event.registered_count || 0) > event.capacity : stryMutAct_9fa48("28870") ? false : stryMutAct_9fa48("28869") ? true : (stryCov_9fa48("28869", "28870", "28871", "28872"), (stryMutAct_9fa48("28875") ? event.registered_count && 0 : stryMutAct_9fa48("28874") ? false : stryMutAct_9fa48("28873") ? true : (stryCov_9fa48("28873", "28874", "28875"), event.registered_count || 0)) >= event.capacity);
                const isPassed = isEventPassed(event);
                const registration = getUserRegistration(event);

                // Convert UTC times to Eastern Time for display
                const easternStartTime = getEasternTimeParts(event.start_time);
                const easternEndTime = getEasternTimeParts(event.end_time);
                const month = format(easternStartTime, stryMutAct_9fa48("28876") ? "" : (stryCov_9fa48("28876"), 'MMMM'));
                const day = format(easternStartTime, stryMutAct_9fa48("28877") ? "" : (stryCov_9fa48("28877"), 'd'));
                const dayOfWeek = format(easternStartTime, stryMutAct_9fa48("28878") ? "" : (stryCov_9fa48("28878"), 'EEEE'));
                const timeRange = stryMutAct_9fa48("28879") ? `` : (stryCov_9fa48("28879"), `${formatInEasternTime(event.start_time, stryMutAct_9fa48("28880") ? "" : (stryCov_9fa48("28880"), 'time'))} - ${formatInEasternTime(event.end_time, stryMutAct_9fa48("28881") ? "" : (stryCov_9fa48("28881"), 'time'))}`);
                return <div key={event.event_id} className={stryMutAct_9fa48("28882") ? `` : (stryCov_9fa48("28882"), `time-slot-card ${isRegistered ? stryMutAct_9fa48("28883") ? "" : (stryCov_9fa48("28883"), 'selected') : stryMutAct_9fa48("28884") ? "Stryker was here!" : (stryCov_9fa48("28884"), '')} ${(stryMutAct_9fa48("28887") ? isFull || !isRegistered : stryMutAct_9fa48("28886") ? false : stryMutAct_9fa48("28885") ? true : (stryCov_9fa48("28885", "28886", "28887"), isFull && (stryMutAct_9fa48("28888") ? isRegistered : (stryCov_9fa48("28888"), !isRegistered)))) ? stryMutAct_9fa48("28889") ? "" : (stryCov_9fa48("28889"), 'full') : stryMutAct_9fa48("28890") ? "Stryker was here!" : (stryCov_9fa48("28890"), '')} ${isPassed ? stryMutAct_9fa48("28891") ? "" : (stryCov_9fa48("28891"), 'passed') : stryMutAct_9fa48("28892") ? "Stryker was here!" : (stryCov_9fa48("28892"), '')}`)}>
                                        <div className="time-slot-header">
                                            <div className="date-info">
                                                <span className="month">{month}</span>
                                                <span className="day">{day}</span>
                                                <span className="day-of-week">{dayOfWeek}</span>
                                            </div>
                                            <div className="time-info">
                                                <span className="time-range">{timeRange}</span>
                                            </div>
                                        </div>
                                        <div className="location-info">
                                            <span className="location-type">
                                                {event.is_online ? stryMutAct_9fa48("28893") ? "" : (stryCov_9fa48("28893"), '💻 Online') : stryMutAct_9fa48("28894") ? "" : (stryCov_9fa48("28894"), '🏢 In-Person')}
                                            </span>
                                        </div>
                                        {isRegistered ? <div className="slot-actions registered-actions">
                                                <button className="cancel-selection-btn" onClick={stryMutAct_9fa48("28895") ? () => undefined : (stryCov_9fa48("28895"), () => handleCancelRegistration(event.event_id, stryMutAct_9fa48("28896") ? registration.registration_id : (stryCov_9fa48("28896"), registration?.registration_id)))} disabled={stryMutAct_9fa48("28899") ? processingEventId !== event.event_id : stryMutAct_9fa48("28898") ? false : stryMutAct_9fa48("28897") ? true : (stryCov_9fa48("28897", "28898", "28899"), processingEventId === event.event_id)}>
                                                    {(stryMutAct_9fa48("28902") ? processingEventId !== event.event_id : stryMutAct_9fa48("28901") ? false : stryMutAct_9fa48("28900") ? true : (stryCov_9fa48("28900", "28901", "28902"), processingEventId === event.event_id)) ? stryMutAct_9fa48("28903") ? "" : (stryCov_9fa48("28903"), 'Cancelling...') : stryMutAct_9fa48("28904") ? "" : (stryCov_9fa48("28904"), 'Cancel')}
                                                </button>
                                                <div className="selected-indicator">Reserved</div>
                                            </div> : <div className="slot-actions">
                                                <button className={stryMutAct_9fa48("28905") ? `` : (stryCov_9fa48("28905"), `select-btn ${isFull ? stryMutAct_9fa48("28906") ? "" : (stryCov_9fa48("28906"), 'full-btn') : stryMutAct_9fa48("28907") ? "Stryker was here!" : (stryCov_9fa48("28907"), '')} ${isPassed ? stryMutAct_9fa48("28908") ? "" : (stryCov_9fa48("28908"), 'select-btn--disabled') : stryMutAct_9fa48("28909") ? "Stryker was here!" : (stryCov_9fa48("28909"), '')}`)} onClick={stryMutAct_9fa48("28910") ? () => undefined : (stryCov_9fa48("28910"), () => stryMutAct_9fa48("28913") ? !isFull && !isPassed || handleReserveClick(event.event_id) : stryMutAct_9fa48("28912") ? false : stryMutAct_9fa48("28911") ? true : (stryCov_9fa48("28911", "28912", "28913"), (stryMutAct_9fa48("28915") ? !isFull || !isPassed : stryMutAct_9fa48("28914") ? true : (stryCov_9fa48("28914", "28915"), (stryMutAct_9fa48("28916") ? isFull : (stryCov_9fa48("28916"), !isFull)) && (stryMutAct_9fa48("28917") ? isPassed : (stryCov_9fa48("28917"), !isPassed)))) && handleReserveClick(event.event_id)))} disabled={stryMutAct_9fa48("28920") ? (processingEventId === event.event_id || isFull) && isPassed : stryMutAct_9fa48("28919") ? false : stryMutAct_9fa48("28918") ? true : (stryCov_9fa48("28918", "28919", "28920"), (stryMutAct_9fa48("28922") ? processingEventId === event.event_id && isFull : stryMutAct_9fa48("28921") ? false : (stryCov_9fa48("28921", "28922"), (stryMutAct_9fa48("28924") ? processingEventId !== event.event_id : stryMutAct_9fa48("28923") ? false : (stryCov_9fa48("28923", "28924"), processingEventId === event.event_id)) || isFull)) || isPassed)}>
                                                    {isPassed ? stryMutAct_9fa48("28925") ? "" : (stryCov_9fa48("28925"), 'Event Passed') : isFull ? stryMutAct_9fa48("28926") ? "" : (stryCov_9fa48("28926"), 'Full') : (stryMutAct_9fa48("28929") ? processingEventId !== event.event_id : stryMutAct_9fa48("28928") ? false : stryMutAct_9fa48("28927") ? true : (stryCov_9fa48("28927", "28928", "28929"), processingEventId === event.event_id)) ? stryMutAct_9fa48("28930") ? "" : (stryCov_9fa48("28930"), 'Reserving...') : stryMutAct_9fa48("28931") ? "" : (stryCov_9fa48("28931"), 'Reserve')}
                                                </button>
                                            </div>}
                                        {stryMutAct_9fa48("28934") ? event.is_online && event.meeting_link && isRegistered || <div className="meeting-link-section">
                                                <a href={event.meeting_link} target="_blank" rel="noopener noreferrer" className="meeting-link">
                                                    Join Meeting
                                                </a>
                                            </div> : stryMutAct_9fa48("28933") ? false : stryMutAct_9fa48("28932") ? true : (stryCov_9fa48("28932", "28933", "28934"), (stryMutAct_9fa48("28936") ? event.is_online && event.meeting_link || isRegistered : stryMutAct_9fa48("28935") ? true : (stryCov_9fa48("28935", "28936"), (stryMutAct_9fa48("28938") ? event.is_online || event.meeting_link : stryMutAct_9fa48("28937") ? true : (stryCov_9fa48("28937", "28938"), event.is_online && event.meeting_link)) && isRegistered)) && <div className="meeting-link-section">
                                                <a href={event.meeting_link} target="_blank" rel="noopener noreferrer" className="meeting-link">
                                                    Join Meeting
                                                </a>
                                            </div>)}
                                    </div>;
              }
            })}
                    </div>

                    {/* Admin form */}
                    {stryMutAct_9fa48("28941") ? isAdmin || <div className="admin-form-section">
                            <h3>Add New Workshop</h3>
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
                                <button type="submit">Add Workshop</button>
                            </form>
                        </div> : stryMutAct_9fa48("28940") ? false : stryMutAct_9fa48("28939") ? true : (stryCov_9fa48("28939", "28940", "28941"), isAdmin && <div className="admin-form-section">
                            <h3>Add New Workshop</h3>
                            <form onSubmit={handleAddEvent}>
                                <input type="text" placeholder="Title" value={newEvent.title} onChange={stryMutAct_9fa48("28942") ? () => undefined : (stryCov_9fa48("28942"), e => setNewEvent(stryMutAct_9fa48("28943") ? {} : (stryCov_9fa48("28943"), {
                ...newEvent,
                title: e.target.value
              })))} required />
                                <input type="datetime-local" value={newEvent.start_time} onChange={stryMutAct_9fa48("28944") ? () => undefined : (stryCov_9fa48("28944"), e => setNewEvent(stryMutAct_9fa48("28945") ? {} : (stryCov_9fa48("28945"), {
                ...newEvent,
                start_time: e.target.value
              })))} required />
                                <input type="datetime-local" value={newEvent.end_time} onChange={stryMutAct_9fa48("28946") ? () => undefined : (stryCov_9fa48("28946"), e => setNewEvent(stryMutAct_9fa48("28947") ? {} : (stryCov_9fa48("28947"), {
                ...newEvent,
                end_time: e.target.value
              })))} required />
                                <input type="text" placeholder="Location" value={newEvent.location} onChange={stryMutAct_9fa48("28948") ? () => undefined : (stryCov_9fa48("28948"), e => setNewEvent(stryMutAct_9fa48("28949") ? {} : (stryCov_9fa48("28949"), {
                ...newEvent,
                location: e.target.value
              })))} required />
                                <input type="number" placeholder="Capacity" value={newEvent.capacity} onChange={stryMutAct_9fa48("28950") ? () => undefined : (stryCov_9fa48("28950"), e => setNewEvent(stryMutAct_9fa48("28951") ? {} : (stryCov_9fa48("28951"), {
                ...newEvent,
                capacity: e.target.value
              })))} />
                                <label>
                                    <input type="checkbox" checked={newEvent.is_online} onChange={stryMutAct_9fa48("28952") ? () => undefined : (stryCov_9fa48("28952"), e => setNewEvent(stryMutAct_9fa48("28953") ? {} : (stryCov_9fa48("28953"), {
                  ...newEvent,
                  is_online: e.target.checked
                })))} />
                                    Online Event
                                </label>
                                {stryMutAct_9fa48("28956") ? newEvent.is_online || <input type="text" placeholder="Meeting Link" value={newEvent.meeting_link} onChange={e => setNewEvent({
                ...newEvent,
                meeting_link: e.target.value
              })} /> : stryMutAct_9fa48("28955") ? false : stryMutAct_9fa48("28954") ? true : (stryCov_9fa48("28954", "28955", "28956"), newEvent.is_online && <input type="text" placeholder="Meeting Link" value={newEvent.meeting_link} onChange={stryMutAct_9fa48("28957") ? () => undefined : (stryCov_9fa48("28957"), e => setNewEvent(stryMutAct_9fa48("28958") ? {} : (stryCov_9fa48("28958"), {
                ...newEvent,
                meeting_link: e.target.value
              })))} />)}
                                <button type="submit">Add Workshop</button>
                            </form>
                        </div>)}
                </div>
            </div>

            {/* Laptop Selection Modal */}
            {stryMutAct_9fa48("28961") ? showLaptopModal || <div className="modal-overlay" onClick={handleCloseLaptopModal}>
                    <div className="modal-content laptop-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Workshop Registration</h3>
                            <button className="modal-close" onClick={handleCloseLaptopModal}>×</button>
                        </div>
                        <div className="modal-body">
                            <p>Please let us know about your laptop situation for the workshop:</p>
                            <div className="laptop-options">
                                <label className="laptop-option">
                                    <input type="radio" name="laptop" value="have" checked={!needsLaptop} onChange={() => setNeedsLaptop(false)} />
                                    <span className="radio-custom"></span>
                                    <div className="option-content">
                                        <strong>I have my own laptop</strong>
                                        <p>I'll bring my own laptop to the workshop</p>
                                    </div>
                                </label>
                                <label className="laptop-option">
                                    <input type="radio" name="laptop" value="need" checked={needsLaptop} onChange={() => setNeedsLaptop(true)} />
                                    <span className="radio-custom"></span>
                                    <div className="option-content">
                                        <strong>I need to borrow a laptop</strong>
                                        <p>Please provide a laptop for me to use during the workshop</p>
                                    </div>
                                </label>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={handleCloseLaptopModal}>
                                Cancel
                            </button>
                            <button className="btn-primary" onClick={handleCompleteRegistration} disabled={processingEventId === selectedEventId}>
                                {processingEventId === selectedEventId ? 'Registering...' : 'Complete Registration'}
                            </button>
                        </div>
                    </div>
                </div> : stryMutAct_9fa48("28960") ? false : stryMutAct_9fa48("28959") ? true : (stryCov_9fa48("28959", "28960", "28961"), showLaptopModal && <div className="modal-overlay" onClick={handleCloseLaptopModal}>
                    <div className="modal-content laptop-modal" onClick={stryMutAct_9fa48("28962") ? () => undefined : (stryCov_9fa48("28962"), e => e.stopPropagation())}>
                        <div className="modal-header">
                            <h3>Workshop Registration</h3>
                            <button className="modal-close" onClick={handleCloseLaptopModal}>×</button>
                        </div>
                        <div className="modal-body">
                            <p>Please let us know about your laptop situation for the workshop:</p>
                            <div className="laptop-options">
                                <label className="laptop-option">
                                    <input type="radio" name="laptop" value="have" checked={stryMutAct_9fa48("28963") ? needsLaptop : (stryCov_9fa48("28963"), !needsLaptop)} onChange={stryMutAct_9fa48("28964") ? () => undefined : (stryCov_9fa48("28964"), () => setNeedsLaptop(stryMutAct_9fa48("28965") ? true : (stryCov_9fa48("28965"), false)))} />
                                    <span className="radio-custom"></span>
                                    <div className="option-content">
                                        <strong>I have my own laptop</strong>
                                        <p>I'll bring my own laptop to the workshop</p>
                                    </div>
                                </label>
                                <label className="laptop-option">
                                    <input type="radio" name="laptop" value="need" checked={needsLaptop} onChange={stryMutAct_9fa48("28966") ? () => undefined : (stryCov_9fa48("28966"), () => setNeedsLaptop(stryMutAct_9fa48("28967") ? false : (stryCov_9fa48("28967"), true)))} />
                                    <span className="radio-custom"></span>
                                    <div className="option-content">
                                        <strong>I need to borrow a laptop</strong>
                                        <p>Please provide a laptop for me to use during the workshop</p>
                                    </div>
                                </label>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={handleCloseLaptopModal}>
                                Cancel
                            </button>
                            <button className="btn-primary" onClick={handleCompleteRegistration} disabled={stryMutAct_9fa48("28970") ? processingEventId !== selectedEventId : stryMutAct_9fa48("28969") ? false : stryMutAct_9fa48("28968") ? true : (stryCov_9fa48("28968", "28969", "28970"), processingEventId === selectedEventId)}>
                                {(stryMutAct_9fa48("28973") ? processingEventId !== selectedEventId : stryMutAct_9fa48("28972") ? false : stryMutAct_9fa48("28971") ? true : (stryCov_9fa48("28971", "28972", "28973"), processingEventId === selectedEventId)) ? stryMutAct_9fa48("28974") ? "" : (stryCov_9fa48("28974"), 'Registering...') : stryMutAct_9fa48("28975") ? "" : (stryCov_9fa48("28975"), 'Complete Registration')}
                            </button>
                        </div>
                    </div>
                </div>)}
        </div>;
  }
};
export default Workshops;