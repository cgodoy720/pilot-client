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
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated, getAuthUser, secureLogout, setupSessionMonitoring, getSessionInfo, refreshSession } from '../../utils/attendanceAuth';
import './AttendanceDashboard.css';
import logoImage from '../../assets/logo.png';
import CohortAttendanceCard from '../../components/CohortAttendanceCard/CohortAttendanceCard';
const AttendanceDashboard = () => {
  if (stryMutAct_9fa48("16473")) {
    {}
  } else {
    stryCov_9fa48("16473");
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(stryMutAct_9fa48("16474") ? false : (stryCov_9fa48("16474"), true));
    const [sessionInfo, setSessionInfo] = useState(null);
    const [isLoggingOut, setIsLoggingOut] = useState(stryMutAct_9fa48("16475") ? true : (stryCov_9fa48("16475"), false));

    // Check-in workflow states
    const [searchQuery, setSearchQuery] = useState(stryMutAct_9fa48("16476") ? "Stryker was here!" : (stryCov_9fa48("16476"), ''));
    const [searchResults, setSearchResults] = useState(stryMutAct_9fa48("16477") ? ["Stryker was here"] : (stryCov_9fa48("16477"), []));
    const [selectedBuilder, setSelectedBuilder] = useState(null);
    const [isSearching, setIsSearching] = useState(stryMutAct_9fa48("16478") ? true : (stryCov_9fa48("16478"), false));
    const [showCamera, setShowCamera] = useState(stryMutAct_9fa48("16479") ? true : (stryCov_9fa48("16479"), false));
    const [isCapturing, setIsCapturing] = useState(stryMutAct_9fa48("16480") ? true : (stryCov_9fa48("16480"), false));
    const [capturedPhoto, setCapturedPhoto] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(stryMutAct_9fa48("16481") ? true : (stryCov_9fa48("16481"), false));
    const [checkInStatus, setCheckInStatus] = useState(null);
    const [cameraStream, setCameraStream] = useState(null);

    // Today's attendance states
    const [todayAttendance, setTodayAttendance] = useState(null);
    const [isLoadingAttendance, setIsLoadingAttendance] = useState(stryMutAct_9fa48("16482") ? true : (stryCov_9fa48("16482"), false));

    // Settings modal
    const [showSettings, setShowSettings] = useState(stryMutAct_9fa48("16483") ? true : (stryCov_9fa48("16483"), false));

    // Celebratory animation states
    const [showScanAnimation, setShowScanAnimation] = useState(stryMutAct_9fa48("16484") ? true : (stryCov_9fa48("16484"), false));
    const [showWelcomeCelebration, setShowWelcomeCelebration] = useState(stryMutAct_9fa48("16485") ? true : (stryCov_9fa48("16485"), false));
    const [showPhotoTransport, setShowPhotoTransport] = useState(stryMutAct_9fa48("16486") ? true : (stryCov_9fa48("16486"), false));
    const [welcomeMessage, setWelcomeMessage] = useState(stryMutAct_9fa48("16487") ? "Stryker was here!" : (stryCov_9fa48("16487"), ''));

    // Refs
    const searchInputRef = useRef(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const navigate = useNavigate();
    useEffect(() => {
      if (stryMutAct_9fa48("16488")) {
        {}
      } else {
        stryCov_9fa48("16488");
        const initializeDashboard = async () => {
          if (stryMutAct_9fa48("16489")) {
            {}
          } else {
            stryCov_9fa48("16489");
            // Check authentication using utility
            if (stryMutAct_9fa48("16492") ? false : stryMutAct_9fa48("16491") ? true : stryMutAct_9fa48("16490") ? isAuthenticated() : (stryCov_9fa48("16490", "16491", "16492"), !isAuthenticated())) {
              if (stryMutAct_9fa48("16493")) {
                {}
              } else {
                stryCov_9fa48("16493");
                navigate(stryMutAct_9fa48("16494") ? "" : (stryCov_9fa48("16494"), '/attendance-login'), stryMutAct_9fa48("16495") ? {} : (stryCov_9fa48("16495"), {
                  replace: stryMutAct_9fa48("16496") ? false : (stryCov_9fa48("16496"), true)
                }));
                return;
              }
            }

            // Get user data
            const userData = getAuthUser();
            if (stryMutAct_9fa48("16498") ? false : stryMutAct_9fa48("16497") ? true : (stryCov_9fa48("16497", "16498"), userData)) {
              if (stryMutAct_9fa48("16499")) {
                {}
              } else {
                stryCov_9fa48("16499");
                setUser(userData);
              }
            }

            // Get session information
            const session = getSessionInfo();
            setSessionInfo(session);

            // Load today's attendance
            await loadTodayAttendance();
            setIsLoading(stryMutAct_9fa48("16500") ? true : (stryCov_9fa48("16500"), false));

            // Setup session monitoring
            const cleanup = setupSessionMonitoring(() => {
              if (stryMutAct_9fa48("16501")) {
                {}
              } else {
                stryCov_9fa48("16501");
                // Session expired callback
                setIsLoggingOut(stryMutAct_9fa48("16502") ? false : (stryCov_9fa48("16502"), true));
                setTimeout(() => {
                  if (stryMutAct_9fa48("16503")) {
                    {}
                  } else {
                    stryCov_9fa48("16503");
                    navigate(stryMutAct_9fa48("16504") ? "" : (stryCov_9fa48("16504"), '/attendance-login'), stryMutAct_9fa48("16505") ? {} : (stryCov_9fa48("16505"), {
                      replace: stryMutAct_9fa48("16506") ? false : (stryCov_9fa48("16506"), true)
                    }));
                  }
                }, 1000);
              }
            });
            return cleanup;
          }
        };
        initializeDashboard();
      }
    }, stryMutAct_9fa48("16507") ? [] : (stryCov_9fa48("16507"), [navigate]));

    // Update session info periodically
    useEffect(() => {
      if (stryMutAct_9fa48("16508")) {
        {}
      } else {
        stryCov_9fa48("16508");
        if (stryMutAct_9fa48("16511") ? !isLoading || isAuthenticated() : stryMutAct_9fa48("16510") ? false : stryMutAct_9fa48("16509") ? true : (stryCov_9fa48("16509", "16510", "16511"), (stryMutAct_9fa48("16512") ? isLoading : (stryCov_9fa48("16512"), !isLoading)) && isAuthenticated())) {
          if (stryMutAct_9fa48("16513")) {
            {}
          } else {
            stryCov_9fa48("16513");
            const interval = setInterval(() => {
              if (stryMutAct_9fa48("16514")) {
                {}
              } else {
                stryCov_9fa48("16514");
                const session = getSessionInfo();
                setSessionInfo(session);

                // Refresh session activity
                refreshSession();
              }
            }, 30000); // Update every 30 seconds

            return stryMutAct_9fa48("16515") ? () => undefined : (stryCov_9fa48("16515"), () => clearInterval(interval));
          }
        }
      }
    }, stryMutAct_9fa48("16516") ? [] : (stryCov_9fa48("16516"), [isLoading]));

    // Search builders as user types
    useEffect(() => {
      if (stryMutAct_9fa48("16517")) {
        {}
      } else {
        stryCov_9fa48("16517");
        const timeoutId = setTimeout(() => {
          if (stryMutAct_9fa48("16518")) {
            {}
          } else {
            stryCov_9fa48("16518");
            if (stryMutAct_9fa48("16522") ? searchQuery.trim().length < 2 : stryMutAct_9fa48("16521") ? searchQuery.trim().length > 2 : stryMutAct_9fa48("16520") ? false : stryMutAct_9fa48("16519") ? true : (stryCov_9fa48("16519", "16520", "16521", "16522"), (stryMutAct_9fa48("16523") ? searchQuery.length : (stryCov_9fa48("16523"), searchQuery.trim().length)) >= 2)) {
              if (stryMutAct_9fa48("16524")) {
                {}
              } else {
                stryCov_9fa48("16524");
                searchBuilders(searchQuery);
              }
            } else {
              if (stryMutAct_9fa48("16525")) {
                {}
              } else {
                stryCov_9fa48("16525");
                setSearchResults(stryMutAct_9fa48("16526") ? ["Stryker was here"] : (stryCov_9fa48("16526"), []));
              }
            }
          }
        }, 300); // Increased delay to reduce API calls and prevent focus disruption

        return stryMutAct_9fa48("16527") ? () => undefined : (stryCov_9fa48("16527"), () => clearTimeout(timeoutId));
      }
    }, stryMutAct_9fa48("16528") ? [] : (stryCov_9fa48("16528"), [searchQuery]));

    // Removed aggressive focus restoration that was interfering with natural typing

    // Cleanup camera on component unmount
    useEffect(() => {
      if (stryMutAct_9fa48("16529")) {
        {}
      } else {
        stryCov_9fa48("16529");
        return () => {
          if (stryMutAct_9fa48("16530")) {
            {}
          } else {
            stryCov_9fa48("16530");
            stopCamera();
          }
        };
      }
    }, stryMutAct_9fa48("16531") ? ["Stryker was here"] : (stryCov_9fa48("16531"), []));

    // Debug video element when camera step is shown
    useEffect(() => {
      if (stryMutAct_9fa48("16532")) {
        {}
      } else {
        stryCov_9fa48("16532");
        if (stryMutAct_9fa48("16535") ? showCamera || videoRef.current : stryMutAct_9fa48("16534") ? false : stryMutAct_9fa48("16533") ? true : (stryCov_9fa48("16533", "16534", "16535"), showCamera && videoRef.current)) {
          if (stryMutAct_9fa48("16536")) {
            {}
          } else {
            stryCov_9fa48("16536");
            console.log(stryMutAct_9fa48("16537") ? "" : (stryCov_9fa48("16537"), 'Camera step shown, video element:'), videoRef.current);
            console.log(stryMutAct_9fa48("16538") ? "" : (stryCov_9fa48("16538"), 'Video srcObject:'), videoRef.current.srcObject);
            console.log(stryMutAct_9fa48("16539") ? "" : (stryCov_9fa48("16539"), 'Video readyState:'), videoRef.current.readyState);
            console.log(stryMutAct_9fa48("16540") ? "" : (stryCov_9fa48("16540"), 'Video paused:'), videoRef.current.paused);

            // If we have a stream but no srcObject, try to assign it
            if (stryMutAct_9fa48("16543") ? videoRef.current || !videoRef.current.srcObject : stryMutAct_9fa48("16542") ? false : stryMutAct_9fa48("16541") ? true : (stryCov_9fa48("16541", "16542", "16543"), videoRef.current && (stryMutAct_9fa48("16544") ? videoRef.current.srcObject : (stryCov_9fa48("16544"), !videoRef.current.srcObject)))) {
              if (stryMutAct_9fa48("16545")) {
                {}
              } else {
                stryCov_9fa48("16545");
                console.log(stryMutAct_9fa48("16546") ? "" : (stryCov_9fa48("16546"), 'Video element exists but no srcObject - this might be a timing issue'));
              }
            }
          }
        }
      }
    }, stryMutAct_9fa48("16547") ? [] : (stryCov_9fa48("16547"), [showCamera]));

    // Assign stream when video element is rendered and ready
    useEffect(() => {
      if (stryMutAct_9fa48("16548")) {
        {}
      } else {
        stryCov_9fa48("16548");
        if (stryMutAct_9fa48("16551") ? showCamera || cameraStream : stryMutAct_9fa48("16550") ? false : stryMutAct_9fa48("16549") ? true : (stryCov_9fa48("16549", "16550", "16551"), showCamera && cameraStream)) {
          if (stryMutAct_9fa48("16552")) {
            {}
          } else {
            stryCov_9fa48("16552");
            console.log(stryMutAct_9fa48("16553") ? "" : (stryCov_9fa48("16553"), 'Camera step shown, checking for video element...'));

            // Use a more robust polling mechanism with exponential backoff
            let attempts = 0;
            const maxAttempts = 20; // 1 second total with exponential backoff

            const waitForVideoElement = () => {
              if (stryMutAct_9fa48("16554")) {
                {}
              } else {
                stryCov_9fa48("16554");
                stryMutAct_9fa48("16555") ? attempts-- : (stryCov_9fa48("16555"), attempts++);
                console.log(stryMutAct_9fa48("16556") ? `` : (stryCov_9fa48("16556"), `Attempt ${attempts}: Checking for video element...`));
                if (stryMutAct_9fa48("16558") ? false : stryMutAct_9fa48("16557") ? true : (stryCov_9fa48("16557", "16558"), videoRef.current)) {
                  if (stryMutAct_9fa48("16559")) {
                    {}
                  } else {
                    stryCov_9fa48("16559");
                    console.log(stryMutAct_9fa48("16560") ? "" : (stryCov_9fa48("16560"), '✅ Video element found in DOM!'));
                    console.log(stryMutAct_9fa48("16561") ? "" : (stryCov_9fa48("16561"), 'Video element:'), videoRef.current);
                    console.log(stryMutAct_9fa48("16562") ? "" : (stryCov_9fa48("16562"), 'Video tagName:'), videoRef.current.tagName);
                    console.log(stryMutAct_9fa48("16563") ? "" : (stryCov_9fa48("16563"), 'Video readyState:'), videoRef.current.readyState);

                    // Double-check the element is actually a video element
                    if (stryMutAct_9fa48("16566") ? videoRef.current.tagName !== 'VIDEO' : stryMutAct_9fa48("16565") ? false : stryMutAct_9fa48("16564") ? true : (stryCov_9fa48("16564", "16565", "16566"), videoRef.current.tagName === (stryMutAct_9fa48("16567") ? "" : (stryCov_9fa48("16567"), 'VIDEO')))) {
                      if (stryMutAct_9fa48("16568")) {
                        {}
                      } else {
                        stryCov_9fa48("16568");
                        console.log(stryMutAct_9fa48("16569") ? "" : (stryCov_9fa48("16569"), '✅ Confirmed: Valid video element found'));
                        const assignStream = () => {
                          if (stryMutAct_9fa48("16570")) {
                            {}
                          } else {
                            stryCov_9fa48("16570");
                            if (stryMutAct_9fa48("16573") ? videoRef.current || cameraStream : stryMutAct_9fa48("16572") ? false : stryMutAct_9fa48("16571") ? true : (stryCov_9fa48("16571", "16572", "16573"), videoRef.current && cameraStream)) {
                              if (stryMutAct_9fa48("16574")) {
                                {}
                              } else {
                                stryCov_9fa48("16574");
                                try {
                                  if (stryMutAct_9fa48("16575")) {
                                    {}
                                  } else {
                                    stryCov_9fa48("16575");
                                    console.log(stryMutAct_9fa48("16576") ? "" : (stryCov_9fa48("16576"), '🎥 Assigning stream to video element...'));
                                    videoRef.current.srcObject = cameraStream;
                                    console.log(stryMutAct_9fa48("16577") ? "" : (stryCov_9fa48("16577"), '✅ Stream assigned successfully'));
                                    console.log(stryMutAct_9fa48("16578") ? "" : (stryCov_9fa48("16578"), 'Video srcObject after assignment:'), videoRef.current.srcObject);

                                    // Add event listeners
                                    videoRef.current.onloadedmetadata = () => {
                                      if (stryMutAct_9fa48("16579")) {
                                        {}
                                      } else {
                                        stryCov_9fa48("16579");
                                        console.log(stryMutAct_9fa48("16580") ? "" : (stryCov_9fa48("16580"), '📹 Video metadata loaded, starting playback'));
                                        console.log(stryMutAct_9fa48("16581") ? "" : (stryCov_9fa48("16581"), 'Video dimensions:'), videoRef.current.videoWidth, stryMutAct_9fa48("16582") ? "" : (stryCov_9fa48("16582"), 'x'), videoRef.current.videoHeight);
                                        videoRef.current.play().catch(e => {
                                          if (stryMutAct_9fa48("16583")) {
                                            {}
                                          } else {
                                            stryCov_9fa48("16583");
                                            console.error(stryMutAct_9fa48("16584") ? "" : (stryCov_9fa48("16584"), '❌ Error playing video:'), e);
                                          }
                                        });
                                      }
                                    };
                                    videoRef.current.onerror = e => {
                                      if (stryMutAct_9fa48("16585")) {
                                        {}
                                      } else {
                                        stryCov_9fa48("16585");
                                        console.error(stryMutAct_9fa48("16586") ? "" : (stryCov_9fa48("16586"), '❌ Video error:'), e);
                                      }
                                    };
                                    videoRef.current.onplay = () => {
                                      if (stryMutAct_9fa48("16587")) {
                                        {}
                                      } else {
                                        stryCov_9fa48("16587");
                                        console.log(stryMutAct_9fa48("16588") ? "" : (stryCov_9fa48("16588"), '▶️ Video started playing'));
                                      }
                                    };
                                    videoRef.current.oncanplay = () => {
                                      if (stryMutAct_9fa48("16589")) {
                                        {}
                                      } else {
                                        stryCov_9fa48("16589");
                                        console.log(stryMutAct_9fa48("16590") ? "" : (stryCov_9fa48("16590"), '✅ Video can play'));
                                      }
                                    };
                                    videoRef.current.onloadeddata = () => {
                                      if (stryMutAct_9fa48("16591")) {
                                        {}
                                      } else {
                                        stryCov_9fa48("16591");
                                        console.log(stryMutAct_9fa48("16592") ? "" : (stryCov_9fa48("16592"), '📊 Video data loaded'));
                                        console.log(stryMutAct_9fa48("16593") ? "" : (stryCov_9fa48("16593"), 'Final video dimensions:'), videoRef.current.videoWidth, stryMutAct_9fa48("16594") ? "" : (stryCov_9fa48("16594"), 'x'), videoRef.current.videoHeight);
                                      }
                                    };
                                  }
                                } catch (error) {
                                  if (stryMutAct_9fa48("16595")) {
                                    {}
                                  } else {
                                    stryCov_9fa48("16595");
                                    console.error(stryMutAct_9fa48("16596") ? "" : (stryCov_9fa48("16596"), '❌ Error assigning stream:'), error);
                                  }
                                }
                              }
                            } else {
                              if (stryMutAct_9fa48("16597")) {
                                {}
                              } else {
                                stryCov_9fa48("16597");
                                console.log(stryMutAct_9fa48("16598") ? "" : (stryCov_9fa48("16598"), '❌ Video element or stream not available for assignment'));
                              }
                            }
                          }
                        };

                        // Try immediate assignment
                        assignStream();

                        // Verify assignment worked
                        setTimeout(() => {
                          if (stryMutAct_9fa48("16599")) {
                            {}
                          } else {
                            stryCov_9fa48("16599");
                            if (stryMutAct_9fa48("16602") ? videoRef.current || !videoRef.current.srcObject : stryMutAct_9fa48("16601") ? false : stryMutAct_9fa48("16600") ? true : (stryCov_9fa48("16600", "16601", "16602"), videoRef.current && (stryMutAct_9fa48("16603") ? videoRef.current.srcObject : (stryCov_9fa48("16603"), !videoRef.current.srcObject)))) {
                              if (stryMutAct_9fa48("16604")) {
                                {}
                              } else {
                                stryCov_9fa48("16604");
                                console.log(stryMutAct_9fa48("16605") ? "" : (stryCov_9fa48("16605"), '⚠️ Immediate assignment may have failed, retrying...'));
                                assignStream();
                              }
                            } else {
                              if (stryMutAct_9fa48("16606")) {
                                {}
                              } else {
                                stryCov_9fa48("16606");
                                console.log(stryMutAct_9fa48("16607") ? "" : (stryCov_9fa48("16607"), '✅ Stream assignment verified'));
                              }
                            }
                          }
                        }, 50);
                      }
                    } else {
                      if (stryMutAct_9fa48("16608")) {
                        {}
                      } else {
                        stryCov_9fa48("16608");
                        console.log(stryMutAct_9fa48("16609") ? "" : (stryCov_9fa48("16609"), '❌ Element found but not a video element:'), videoRef.current.tagName);
                      }
                    }
                  }
                } else {
                  if (stryMutAct_9fa48("16610")) {
                    {}
                  } else {
                    stryCov_9fa48("16610");
                    console.log(stryMutAct_9fa48("16611") ? `` : (stryCov_9fa48("16611"), `⏳ Video element not ready yet (attempt ${attempts}/${maxAttempts})`));
                    if (stryMutAct_9fa48("16615") ? attempts >= maxAttempts : stryMutAct_9fa48("16614") ? attempts <= maxAttempts : stryMutAct_9fa48("16613") ? false : stryMutAct_9fa48("16612") ? true : (stryCov_9fa48("16612", "16613", "16614", "16615"), attempts < maxAttempts)) {
                      if (stryMutAct_9fa48("16616")) {
                        {}
                      } else {
                        stryCov_9fa48("16616");
                        // Exponential backoff: 50ms, 100ms, 200ms, 400ms, etc.
                        const delay = stryMutAct_9fa48("16617") ? Math.max(50 * Math.pow(2, attempts - 1), 500) : (stryCov_9fa48("16617"), Math.min(stryMutAct_9fa48("16618") ? 50 / Math.pow(2, attempts - 1) : (stryCov_9fa48("16618"), 50 * Math.pow(2, stryMutAct_9fa48("16619") ? attempts + 1 : (stryCov_9fa48("16619"), attempts - 1))), 500));
                        setTimeout(waitForVideoElement, delay);
                      }
                    } else {
                      if (stryMutAct_9fa48("16620")) {
                        {}
                      } else {
                        stryCov_9fa48("16620");
                        console.error(stryMutAct_9fa48("16621") ? "" : (stryCov_9fa48("16621"), '❌ Failed to find video element after maximum attempts'));
                        console.log(stryMutAct_9fa48("16622") ? "" : (stryCov_9fa48("16622"), 'Current DOM state - searching for video elements:'));
                        const allVideos = document.querySelectorAll(stryMutAct_9fa48("16623") ? "" : (stryCov_9fa48("16623"), 'video'));
                        console.log(stryMutAct_9fa48("16624") ? "" : (stryCov_9fa48("16624"), 'All video elements in DOM:'), allVideos);
                        console.log(stryMutAct_9fa48("16625") ? "" : (stryCov_9fa48("16625"), 'videoRef.current:'), videoRef.current);
                      }
                    }
                  }
                }
              }
            };

            // Start polling for video element with a small initial delay
            setTimeout(waitForVideoElement, 10);
          }
        }
      }
    }, stryMutAct_9fa48("16626") ? [] : (stryCov_9fa48("16626"), [showCamera, cameraStream]));
    const loadTodayAttendance = async () => {
      if (stryMutAct_9fa48("16627")) {
        {}
      } else {
        stryCov_9fa48("16627");
        setIsLoadingAttendance(stryMutAct_9fa48("16628") ? false : (stryCov_9fa48("16628"), true));
        try {
          if (stryMutAct_9fa48("16629")) {
            {}
          } else {
            stryCov_9fa48("16629");
            const response = await fetch(stryMutAct_9fa48("16630") ? `` : (stryCov_9fa48("16630"), `${import.meta.env.VITE_API_URL}/api/attendance/today`), stryMutAct_9fa48("16631") ? {} : (stryCov_9fa48("16631"), {
              headers: stryMutAct_9fa48("16632") ? {} : (stryCov_9fa48("16632"), {
                'Authorization': stryMutAct_9fa48("16633") ? `` : (stryCov_9fa48("16633"), `Bearer ${localStorage.getItem(stryMutAct_9fa48("16634") ? "" : (stryCov_9fa48("16634"), 'attendanceToken'))}`),
                'Content-Type': stryMutAct_9fa48("16635") ? "" : (stryCov_9fa48("16635"), 'application/json')
              })
            }));
            if (stryMutAct_9fa48("16637") ? false : stryMutAct_9fa48("16636") ? true : (stryCov_9fa48("16636", "16637"), response.ok)) {
              if (stryMutAct_9fa48("16638")) {
                {}
              } else {
                stryCov_9fa48("16638");
                const data = await response.json();
                console.log(stryMutAct_9fa48("16639") ? "" : (stryCov_9fa48("16639"), 'Raw attendance data received:'), data);
                setTodayAttendance(data);
              }
            }
          }
        } catch (error) {
          if (stryMutAct_9fa48("16640")) {
            {}
          } else {
            stryCov_9fa48("16640");
            console.error(stryMutAct_9fa48("16641") ? "" : (stryCov_9fa48("16641"), 'Error loading today\'s attendance:'), error);
          }
        } finally {
          if (stryMutAct_9fa48("16642")) {
            {}
          } else {
            stryCov_9fa48("16642");
            setIsLoadingAttendance(stryMutAct_9fa48("16643") ? true : (stryCov_9fa48("16643"), false));
          }
        }
      }
    };
    const searchBuilders = async query => {
      if (stryMutAct_9fa48("16644")) {
        {}
      } else {
        stryCov_9fa48("16644");
        setIsSearching(stryMutAct_9fa48("16645") ? false : (stryCov_9fa48("16645"), true));
        try {
          if (stryMutAct_9fa48("16646")) {
            {}
          } else {
            stryCov_9fa48("16646");
            const response = await fetch(stryMutAct_9fa48("16647") ? `` : (stryCov_9fa48("16647"), `${import.meta.env.VITE_API_URL}/api/attendance/builders?search=${encodeURIComponent(query)}`), stryMutAct_9fa48("16648") ? {} : (stryCov_9fa48("16648"), {
              headers: stryMutAct_9fa48("16649") ? {} : (stryCov_9fa48("16649"), {
                'Authorization': stryMutAct_9fa48("16650") ? `` : (stryCov_9fa48("16650"), `Bearer ${localStorage.getItem(stryMutAct_9fa48("16651") ? "" : (stryCov_9fa48("16651"), 'attendanceToken'))}`),
                'Content-Type': stryMutAct_9fa48("16652") ? "" : (stryCov_9fa48("16652"), 'application/json')
              })
            }));
            if (stryMutAct_9fa48("16654") ? false : stryMutAct_9fa48("16653") ? true : (stryCov_9fa48("16653", "16654"), response.ok)) {
              if (stryMutAct_9fa48("16655")) {
                {}
              } else {
                stryCov_9fa48("16655");
                const data = await response.json();
                setSearchResults(stryMutAct_9fa48("16658") ? data.builders && [] : stryMutAct_9fa48("16657") ? false : stryMutAct_9fa48("16656") ? true : (stryCov_9fa48("16656", "16657", "16658"), data.builders || (stryMutAct_9fa48("16659") ? ["Stryker was here"] : (stryCov_9fa48("16659"), []))));
              }
            }
          }
        } catch (error) {
          if (stryMutAct_9fa48("16660")) {
            {}
          } else {
            stryCov_9fa48("16660");
            console.error(stryMutAct_9fa48("16661") ? "" : (stryCov_9fa48("16661"), 'Error searching builders:'), error);
          }
        } finally {
          if (stryMutAct_9fa48("16662")) {
            {}
          } else {
            stryCov_9fa48("16662");
            setIsSearching(stryMutAct_9fa48("16663") ? true : (stryCov_9fa48("16663"), false));
          }
        }
      }
    };
    const handleBuilderSelect = builder => {
      if (stryMutAct_9fa48("16664")) {
        {}
      } else {
        stryCov_9fa48("16664");
        setSelectedBuilder(builder);
        setSearchQuery(stryMutAct_9fa48("16665") ? `` : (stryCov_9fa48("16665"), `${builder.firstName} ${builder.lastName}`));
        setSearchResults(stryMutAct_9fa48("16666") ? ["Stryker was here"] : (stryCov_9fa48("16666"), []));
        // Don't automatically show camera - let user continue typing if they want
      }
    };
    const handleSearchChange = e => {
      if (stryMutAct_9fa48("16667")) {
        {}
      } else {
        stryCov_9fa48("16667");
        const newQuery = e.target.value;
        setSearchQuery(newQuery);

        // Clear any existing selection when typing
        if (stryMutAct_9fa48("16669") ? false : stryMutAct_9fa48("16668") ? true : (stryCov_9fa48("16668", "16669"), selectedBuilder)) {
          if (stryMutAct_9fa48("16670")) {
            {}
          } else {
            stryCov_9fa48("16670");
            setSelectedBuilder(null);
            setShowCamera(stryMutAct_9fa48("16671") ? true : (stryCov_9fa48("16671"), false));
            setCapturedPhoto(null);
          }
        }
      }
    };
    const handleSearchFocus = e => {
      // Focus handler for future use if needed
    };
    const handleSearchBlur = e => {
      if (stryMutAct_9fa48("16672")) {
        {}
      } else {
        stryCov_9fa48("16672");
        // Only prevent blur if clicking on search results
        const searchResults = stryMutAct_9fa48("16673") ? e.currentTarget.closest('.search-step').querySelector('.search-results') : (stryCov_9fa48("16673"), e.currentTarget.closest(stryMutAct_9fa48("16674") ? "" : (stryCov_9fa48("16674"), '.search-step'))?.querySelector(stryMutAct_9fa48("16675") ? "" : (stryCov_9fa48("16675"), '.search-results')));
        if (stryMutAct_9fa48("16678") ? searchResults.contains(e.relatedTarget) : stryMutAct_9fa48("16677") ? false : stryMutAct_9fa48("16676") ? true : (stryCov_9fa48("16676", "16677", "16678"), searchResults?.contains(e.relatedTarget))) {
          if (stryMutAct_9fa48("16679")) {
            {}
          } else {
            stryCov_9fa48("16679");
            // User clicked on search results - prevent blur to maintain focus
            setTimeout(() => {
              if (stryMutAct_9fa48("16680")) {
                {}
              } else {
                stryCov_9fa48("16680");
                if (stryMutAct_9fa48("16682") ? false : stryMutAct_9fa48("16681") ? true : (stryCov_9fa48("16681", "16682"), searchInputRef.current)) {
                  if (stryMutAct_9fa48("16683")) {
                    {}
                  } else {
                    stryCov_9fa48("16683");
                    searchInputRef.current.focus();
                  }
                }
              }
            }, 0);
          }
        }
        // Otherwise, allow natural blur behavior
      }
    };
    const handleStartCheckIn = async () => {
      if (stryMutAct_9fa48("16684")) {
        {}
      } else {
        stryCov_9fa48("16684");
        if (stryMutAct_9fa48("16686") ? false : stryMutAct_9fa48("16685") ? true : (stryCov_9fa48("16685", "16686"), selectedBuilder)) {
          if (stryMutAct_9fa48("16687")) {
            {}
          } else {
            stryCov_9fa48("16687");
            console.log(stryMutAct_9fa48("16688") ? "" : (stryCov_9fa48("16688"), 'Starting camera process...'));
            await startCamera();
          }
        }
      }
    };
    const startCamera = async () => {
      if (stryMutAct_9fa48("16689")) {
        {}
      } else {
        stryCov_9fa48("16689");
        if (stryMutAct_9fa48("16691") ? false : stryMutAct_9fa48("16690") ? true : (stryCov_9fa48("16690", "16691"), cameraStream)) {
          if (stryMutAct_9fa48("16692")) {
            {}
          } else {
            stryCov_9fa48("16692");
            console.log(stryMutAct_9fa48("16693") ? "" : (stryCov_9fa48("16693"), 'Restarting camera with existing stream...'));
            setShowCamera(stryMutAct_9fa48("16694") ? false : (stryCov_9fa48("16694"), true));
            return;
          }
        }
        console.log(stryMutAct_9fa48("16695") ? "" : (stryCov_9fa48("16695"), 'Starting new camera stream...'));
        try {
          if (stryMutAct_9fa48("16696")) {
            {}
          } else {
            stryCov_9fa48("16696");
            // Request camera access
            const stream = await navigator.mediaDevices.getUserMedia(stryMutAct_9fa48("16697") ? {} : (stryCov_9fa48("16697"), {
              video: stryMutAct_9fa48("16698") ? {} : (stryCov_9fa48("16698"), {
                width: stryMutAct_9fa48("16699") ? {} : (stryCov_9fa48("16699"), {
                  ideal: 640,
                  max: 1280
                }),
                height: stryMutAct_9fa48("16700") ? {} : (stryCov_9fa48("16700"), {
                  ideal: 480,
                  max: 720
                }),
                facingMode: stryMutAct_9fa48("16701") ? "" : (stryCov_9fa48("16701"), 'user') // Front camera
              })
            }));
            console.log(stryMutAct_9fa48("16702") ? "" : (stryCov_9fa48("16702"), 'Camera stream obtained:'), stream);
            setCameraStream(stream);
            setShowCamera(stryMutAct_9fa48("16703") ? false : (stryCov_9fa48("16703"), true));
          }
        } catch (error) {
          if (stryMutAct_9fa48("16704")) {
            {}
          } else {
            stryCov_9fa48("16704");
            console.error(stryMutAct_9fa48("16705") ? "" : (stryCov_9fa48("16705"), 'Error starting camera:'), error);
            setCheckInStatus(stryMutAct_9fa48("16706") ? {} : (stryCov_9fa48("16706"), {
              type: stryMutAct_9fa48("16707") ? "" : (stryCov_9fa48("16707"), 'error'),
              message: stryMutAct_9fa48("16708") ? "" : (stryCov_9fa48("16708"), 'Unable to access camera. Please check permissions and try again.')
            }));
          }
        }
      }
    };
    const stopCamera = () => {
      if (stryMutAct_9fa48("16709")) {
        {}
      } else {
        stryCov_9fa48("16709");
        if (stryMutAct_9fa48("16712") ? videoRef.current || videoRef.current.srcObject : stryMutAct_9fa48("16711") ? false : stryMutAct_9fa48("16710") ? true : (stryCov_9fa48("16710", "16711", "16712"), videoRef.current && videoRef.current.srcObject)) {
          if (stryMutAct_9fa48("16713")) {
            {}
          } else {
            stryCov_9fa48("16713");
            const stream = videoRef.current.srcObject;
            stream.getTracks().forEach(stryMutAct_9fa48("16714") ? () => undefined : (stryCov_9fa48("16714"), track => track.stop()));
            videoRef.current.srcObject = null;
          }
        }

        // Also clean up stored stream
        if (stryMutAct_9fa48("16716") ? false : stryMutAct_9fa48("16715") ? true : (stryCov_9fa48("16715", "16716"), cameraStream)) {
          if (stryMutAct_9fa48("16717")) {
            {}
          } else {
            stryCov_9fa48("16717");
            cameraStream.getTracks().forEach(stryMutAct_9fa48("16718") ? () => undefined : (stryCov_9fa48("16718"), track => track.stop()));
            setCameraStream(null);
          }
        }
      }
    };
    const handlePhotoCapture = async () => {
      if (stryMutAct_9fa48("16719")) {
        {}
      } else {
        stryCov_9fa48("16719");
        if (stryMutAct_9fa48("16722") ? !videoRef.current && !canvasRef.current : stryMutAct_9fa48("16721") ? false : stryMutAct_9fa48("16720") ? true : (stryCov_9fa48("16720", "16721", "16722"), (stryMutAct_9fa48("16723") ? videoRef.current : (stryCov_9fa48("16723"), !videoRef.current)) || (stryMutAct_9fa48("16724") ? canvasRef.current : (stryCov_9fa48("16724"), !canvasRef.current)))) {
          if (stryMutAct_9fa48("16725")) {
            {}
          } else {
            stryCov_9fa48("16725");
            console.error(stryMutAct_9fa48("16726") ? "" : (stryCov_9fa48("16726"), 'Camera elements not available'));
            return;
          }
        }
        setIsCapturing(stryMutAct_9fa48("16727") ? false : (stryCov_9fa48("16727"), true));
        try {
          if (stryMutAct_9fa48("16728")) {
            {}
          } else {
            stryCov_9fa48("16728");
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const ctx = canvas.getContext(stryMutAct_9fa48("16729") ? "" : (stryCov_9fa48("16729"), '2d'));
            console.log(stryMutAct_9fa48("16730") ? "" : (stryCov_9fa48("16730"), 'Video ready state:'), video.readyState);
            console.log(stryMutAct_9fa48("16731") ? "" : (stryCov_9fa48("16731"), 'Video dimensions:'), video.videoWidth, stryMutAct_9fa48("16732") ? "" : (stryCov_9fa48("16732"), 'x'), video.videoHeight);

            // Wait for video to be ready
            if (stryMutAct_9fa48("16736") ? video.readyState >= 2 : stryMutAct_9fa48("16735") ? video.readyState <= 2 : stryMutAct_9fa48("16734") ? false : stryMutAct_9fa48("16733") ? true : (stryCov_9fa48("16733", "16734", "16735", "16736"), video.readyState < 2)) {
              if (stryMutAct_9fa48("16737")) {
                {}
              } else {
                stryCov_9fa48("16737");
                console.log(stryMutAct_9fa48("16738") ? "" : (stryCov_9fa48("16738"), 'Video not ready, waiting...'));
                await new Promise(resolve => {
                  if (stryMutAct_9fa48("16739")) {
                    {}
                  } else {
                    stryCov_9fa48("16739");
                    video.onloadeddata = resolve;
                  }
                });
              }
            }

            // Set canvas dimensions to match video
            canvas.width = stryMutAct_9fa48("16742") ? video.videoWidth && 640 : stryMutAct_9fa48("16741") ? false : stryMutAct_9fa48("16740") ? true : (stryCov_9fa48("16740", "16741", "16742"), video.videoWidth || 640);
            canvas.height = stryMutAct_9fa48("16745") ? video.videoHeight && 480 : stryMutAct_9fa48("16744") ? false : stryMutAct_9fa48("16743") ? true : (stryCov_9fa48("16743", "16744", "16745"), video.videoHeight || 480);
            console.log(stryMutAct_9fa48("16746") ? "" : (stryCov_9fa48("16746"), 'Canvas dimensions set to:'), canvas.width, stryMutAct_9fa48("16747") ? "" : (stryCov_9fa48("16747"), 'x'), canvas.height);

            // Draw video frame to canvas
            ctx.drawImage(video, 0, 0);

            // Convert to base64 with JPEG format and 0.8 quality
            const photoData = canvas.toDataURL(stryMutAct_9fa48("16748") ? "" : (stryCov_9fa48("16748"), 'image/jpeg'), 0.8);

            // Validate file size (2MB limit)
            const base64Data = photoData.split(stryMutAct_9fa48("16749") ? "" : (stryCov_9fa48("16749"), ','))[1];
            const decodedSize = Math.ceil(stryMutAct_9fa48("16750") ? base64Data.length * 3 * 4 : (stryCov_9fa48("16750"), (stryMutAct_9fa48("16751") ? base64Data.length / 3 : (stryCov_9fa48("16751"), base64Data.length * 3)) / 4));
            const maxSize = stryMutAct_9fa48("16752") ? 2 * 1024 / 1024 : (stryCov_9fa48("16752"), (stryMutAct_9fa48("16753") ? 2 / 1024 : (stryCov_9fa48("16753"), 2 * 1024)) * 1024); // 2MB

            if (stryMutAct_9fa48("16757") ? decodedSize <= maxSize : stryMutAct_9fa48("16756") ? decodedSize >= maxSize : stryMutAct_9fa48("16755") ? false : stryMutAct_9fa48("16754") ? true : (stryCov_9fa48("16754", "16755", "16756", "16757"), decodedSize > maxSize)) {
              if (stryMutAct_9fa48("16758")) {
                {}
              } else {
                stryCov_9fa48("16758");
                throw new Error(stryMutAct_9fa48("16759") ? "" : (stryCov_9fa48("16759"), 'Photo is too large. Please try again with a smaller image.'));
              }
            }

            // Validate resolution (1080p max)
            if (stryMutAct_9fa48("16762") ? video.videoWidth > 1920 && video.videoHeight > 1080 : stryMutAct_9fa48("16761") ? false : stryMutAct_9fa48("16760") ? true : (stryCov_9fa48("16760", "16761", "16762"), (stryMutAct_9fa48("16765") ? video.videoWidth <= 1920 : stryMutAct_9fa48("16764") ? video.videoWidth >= 1920 : stryMutAct_9fa48("16763") ? false : (stryCov_9fa48("16763", "16764", "16765"), video.videoWidth > 1920)) || (stryMutAct_9fa48("16768") ? video.videoHeight <= 1080 : stryMutAct_9fa48("16767") ? video.videoHeight >= 1080 : stryMutAct_9fa48("16766") ? false : (stryCov_9fa48("16766", "16767", "16768"), video.videoHeight > 1080)))) {
              if (stryMutAct_9fa48("16769")) {
                {}
              } else {
                stryCov_9fa48("16769");
                throw new Error(stryMutAct_9fa48("16770") ? "" : (stryCov_9fa48("16770"), 'Photo resolution is too high. Please try again.'));
              }
            }
            setCapturedPhoto(photoData);
            console.log(stryMutAct_9fa48("16771") ? "" : (stryCov_9fa48("16771"), 'Photo captured successfully:'), stryMutAct_9fa48("16772") ? {} : (stryCov_9fa48("16772"), {
              width: video.videoWidth,
              height: video.videoHeight,
              size: decodedSize,
              format: stryMutAct_9fa48("16773") ? "" : (stryCov_9fa48("16773"), 'JPEG')
            }));

            // Turn off camera after successful photo capture
            console.log(stryMutAct_9fa48("16774") ? "" : (stryCov_9fa48("16774"), 'Photo captured, turning off camera...'));
            stopCamera();
          }
        } catch (error) {
          if (stryMutAct_9fa48("16775")) {
            {}
          } else {
            stryCov_9fa48("16775");
            console.error(stryMutAct_9fa48("16776") ? "" : (stryCov_9fa48("16776"), 'Error capturing photo:'), error);
            setCheckInStatus(stryMutAct_9fa48("16777") ? {} : (stryCov_9fa48("16777"), {
              type: stryMutAct_9fa48("16778") ? "" : (stryCov_9fa48("16778"), 'error'),
              message: error.message
            }));
          }
        } finally {
          if (stryMutAct_9fa48("16779")) {
            {}
          } else {
            stryCov_9fa48("16779");
            setIsCapturing(stryMutAct_9fa48("16780") ? true : (stryCov_9fa48("16780"), false));
          }
        }
      }
    };
    const handleCheckInSubmit = async () => {
      if (stryMutAct_9fa48("16781")) {
        {}
      } else {
        stryCov_9fa48("16781");
        if (stryMutAct_9fa48("16784") ? !selectedBuilder && !capturedPhoto : stryMutAct_9fa48("16783") ? false : stryMutAct_9fa48("16782") ? true : (stryCov_9fa48("16782", "16783", "16784"), (stryMutAct_9fa48("16785") ? selectedBuilder : (stryCov_9fa48("16785"), !selectedBuilder)) || (stryMutAct_9fa48("16786") ? capturedPhoto : (stryCov_9fa48("16786"), !capturedPhoto)))) return;

        // Debug: Log the selectedBuilder object
        console.log(stryMutAct_9fa48("16787") ? "" : (stryCov_9fa48("16787"), '🔍 Selected Builder Object:'), selectedBuilder);
        console.log(stryMutAct_9fa48("16788") ? "" : (stryCov_9fa48("16788"), '🔍 User ID from id:'), selectedBuilder.id);
        console.log(stryMutAct_9fa48("16789") ? "" : (stryCov_9fa48("16789"), '🔍 User ID from user_id:'), selectedBuilder.user_id);
        console.log(stryMutAct_9fa48("16790") ? "" : (stryCov_9fa48("16790"), '🔍 User ID from userId:'), selectedBuilder.userId);
        setIsSubmitting(stryMutAct_9fa48("16791") ? false : (stryCov_9fa48("16791"), true));
        try {
          if (stryMutAct_9fa48("16792")) {
            {}
          } else {
            stryCov_9fa48("16792");
            const response = await fetch(stryMutAct_9fa48("16793") ? `` : (stryCov_9fa48("16793"), `${import.meta.env.VITE_API_URL}/api/attendance/checkin`), stryMutAct_9fa48("16794") ? {} : (stryCov_9fa48("16794"), {
              method: stryMutAct_9fa48("16795") ? "" : (stryCov_9fa48("16795"), 'POST'),
              headers: stryMutAct_9fa48("16796") ? {} : (stryCov_9fa48("16796"), {
                'Authorization': stryMutAct_9fa48("16797") ? `` : (stryCov_9fa48("16797"), `Bearer ${localStorage.getItem(stryMutAct_9fa48("16798") ? "" : (stryCov_9fa48("16798"), 'attendanceToken'))}`),
                'Content-Type': stryMutAct_9fa48("16799") ? "" : (stryCov_9fa48("16799"), 'application/json')
              }),
              body: JSON.stringify(stryMutAct_9fa48("16800") ? {} : (stryCov_9fa48("16800"), {
                userId: stryMutAct_9fa48("16803") ? (selectedBuilder.id || selectedBuilder.user_id) && selectedBuilder.userId : stryMutAct_9fa48("16802") ? false : stryMutAct_9fa48("16801") ? true : (stryCov_9fa48("16801", "16802", "16803"), (stryMutAct_9fa48("16805") ? selectedBuilder.id && selectedBuilder.user_id : stryMutAct_9fa48("16804") ? false : (stryCov_9fa48("16804", "16805"), selectedBuilder.id || selectedBuilder.user_id)) || selectedBuilder.userId),
                photoData: capturedPhoto
              }))
            }));
            if (stryMutAct_9fa48("16807") ? false : stryMutAct_9fa48("16806") ? true : (stryCov_9fa48("16806", "16807"), response.ok)) {
              if (stryMutAct_9fa48("16808")) {
                {}
              } else {
                stryCov_9fa48("16808");
                const data = await response.json();
                setCheckInStatus(stryMutAct_9fa48("16809") ? {} : (stryCov_9fa48("16809"), {
                  type: stryMutAct_9fa48("16810") ? "" : (stryCov_9fa48("16810"), 'success'),
                  message: stryMutAct_9fa48("16811") ? "" : (stryCov_9fa48("16811"), 'Check-in successful!')
                }));

                // Start celebratory sequence
                startCelebratorySequence(stryMutAct_9fa48("16812") ? `` : (stryCov_9fa48("16812"), `${selectedBuilder.firstName} ${selectedBuilder.lastName}`));

                // Refresh attendance data immediately
                loadTodayAttendance();
              }
            } else {
              if (stryMutAct_9fa48("16813")) {
                {}
              } else {
                stryCov_9fa48("16813");
                const errorData = await response.json();
                setCheckInStatus(stryMutAct_9fa48("16814") ? {} : (stryCov_9fa48("16814"), {
                  type: stryMutAct_9fa48("16815") ? "" : (stryCov_9fa48("16815"), 'error'),
                  message: stryMutAct_9fa48("16818") ? errorData.error && 'Check-in failed' : stryMutAct_9fa48("16817") ? false : stryMutAct_9fa48("16816") ? true : (stryCov_9fa48("16816", "16817", "16818"), errorData.error || (stryMutAct_9fa48("16819") ? "" : (stryCov_9fa48("16819"), 'Check-in failed')))
                }));
              }
            }
          }
        } catch (error) {
          if (stryMutAct_9fa48("16820")) {
            {}
          } else {
            stryCov_9fa48("16820");
            console.error(stryMutAct_9fa48("16821") ? "" : (stryCov_9fa48("16821"), 'Error submitting check-in:'), error);
            setCheckInStatus(stryMutAct_9fa48("16822") ? {} : (stryCov_9fa48("16822"), {
              type: stryMutAct_9fa48("16823") ? "" : (stryCov_9fa48("16823"), 'error'),
              message: stryMutAct_9fa48("16824") ? "" : (stryCov_9fa48("16824"), 'Network error. Please try again.')
            }));
          }
        } finally {
          if (stryMutAct_9fa48("16825")) {
            {}
          } else {
            stryCov_9fa48("16825");
            setIsSubmitting(stryMutAct_9fa48("16826") ? true : (stryCov_9fa48("16826"), false));
          }
        }
      }
    };
    const resetCheckInForm = () => {
      if (stryMutAct_9fa48("16827")) {
        {}
      } else {
        stryCov_9fa48("16827");
        // Stop camera if running
        stopCamera();
        setSearchQuery(stryMutAct_9fa48("16828") ? "Stryker was here!" : (stryCov_9fa48("16828"), ''));
        setSearchResults(stryMutAct_9fa48("16829") ? ["Stryker was here"] : (stryCov_9fa48("16829"), []));
        setSelectedBuilder(null);
        setShowCamera(stryMutAct_9fa48("16830") ? true : (stryCov_9fa48("16830"), false));
        setCapturedPhoto(null);
        setCheckInStatus(null);
        setCameraStream(null);

        // Reset all animation states
        setShowScanAnimation(stryMutAct_9fa48("16831") ? true : (stryCov_9fa48("16831"), false));
        setShowWelcomeCelebration(stryMutAct_9fa48("16832") ? true : (stryCov_9fa48("16832"), false));
        setShowPhotoTransport(stryMutAct_9fa48("16833") ? true : (stryCov_9fa48("16833"), false));
        setWelcomeMessage(stryMutAct_9fa48("16834") ? "Stryker was here!" : (stryCov_9fa48("16834"), ''));
      }
    };
    const handleRetakePhoto = () => {
      if (stryMutAct_9fa48("16835")) {
        {}
      } else {
        stryCov_9fa48("16835");
        console.log(stryMutAct_9fa48("16836") ? "" : (stryCov_9fa48("16836"), 'Retake photo clicked - current state:'), stryMutAct_9fa48("16837") ? {} : (stryCov_9fa48("16837"), {
          isCapturing,
          capturedPhoto: stryMutAct_9fa48("16838") ? !capturedPhoto : (stryCov_9fa48("16838"), !(stryMutAct_9fa48("16839") ? capturedPhoto : (stryCov_9fa48("16839"), !capturedPhoto)))
        }));

        // Reset captured photo and capturing state
        setCapturedPhoto(null);
        setIsCapturing(stryMutAct_9fa48("16840") ? true : (stryCov_9fa48("16840"), false));
        setCheckInStatus(null);

        // Go back to camera step (not confirmation step)
        setShowCamera(stryMutAct_9fa48("16841") ? false : (stryCov_9fa48("16841"), true));

        // Restart camera for retake
        console.log(stryMutAct_9fa48("16842") ? "" : (stryCov_9fa48("16842"), 'Restarting camera for retake...'));
        stopCamera();
        setTimeout(() => {
          if (stryMutAct_9fa48("16843")) {
            {}
          } else {
            stryCov_9fa48("16843");
            startCamera();
          }
        }, 100);
        console.log(stryMutAct_9fa48("16844") ? "" : (stryCov_9fa48("16844"), 'Retake photo - camera restart initiated'));
      }
    };

    // Celebratory animation functions
    const startCelebratorySequence = builderName => {
      if (stryMutAct_9fa48("16845")) {
        {}
      } else {
        stryCov_9fa48("16845");
        setWelcomeMessage(stryMutAct_9fa48("16846") ? `` : (stryCov_9fa48("16846"), `Welcome to class, ${builderName}!`));

        // Start scan animation
        setShowScanAnimation(stryMutAct_9fa48("16847") ? false : (stryCov_9fa48("16847"), true));

        // After 0.3s, automatically show welcome celebration
        setTimeout(() => {
          if (stryMutAct_9fa48("16848")) {
            {}
          } else {
            stryCov_9fa48("16848");
            setShowScanAnimation(stryMutAct_9fa48("16849") ? true : (stryCov_9fa48("16849"), false));
            setShowWelcomeCelebration(stryMutAct_9fa48("16850") ? false : (stryCov_9fa48("16850"), true));

            // After 1s, show photo transport
            setTimeout(() => {
              if (stryMutAct_9fa48("16851")) {
                {}
              } else {
                stryCov_9fa48("16851");
                setShowPhotoTransport(stryMutAct_9fa48("16852") ? false : (stryCov_9fa48("16852"), true));

                // After 0.5s, hide photo transport but keep welcome celebration
                setTimeout(() => {
                  if (stryMutAct_9fa48("16853")) {
                    {}
                  } else {
                    stryCov_9fa48("16853");
                    setShowPhotoTransport(stryMutAct_9fa48("16854") ? true : (stryCov_9fa48("16854"), false));
                    // Keep welcome celebration visible for 2 more seconds so button can appear
                    setTimeout(() => {
                      if (stryMutAct_9fa48("16855")) {
                        {}
                      } else {
                        stryCov_9fa48("16855");
                        setShowWelcomeCelebration(stryMutAct_9fa48("16856") ? true : (stryCov_9fa48("16856"), false));
                      }
                    }, 2000);
                  }
                }, 500);
              }
            }, 1000);
          }
        }, 300);
      }
    };
    const handleLogout = () => {
      if (stryMutAct_9fa48("16857")) {
        {}
      } else {
        stryCov_9fa48("16857");
        setIsLoggingOut(stryMutAct_9fa48("16858") ? false : (stryCov_9fa48("16858"), true));

        // Small delay to show logout state
        setTimeout(() => {
          if (stryMutAct_9fa48("16859")) {
            {}
          } else {
            stryCov_9fa48("16859");
            secureLogout(() => {
              if (stryMutAct_9fa48("16860")) {
                {}
              } else {
                stryCov_9fa48("16860");
                navigate(stryMutAct_9fa48("16861") ? "" : (stryCov_9fa48("16861"), '/attendance-login'), stryMutAct_9fa48("16862") ? {} : (stryCov_9fa48("16862"), {
                  replace: stryMutAct_9fa48("16863") ? false : (stryCov_9fa48("16863"), true)
                }));
              }
            });
          }
        }, 500);
      }
    };
    const formatSessionTime = milliseconds => {
      if (stryMutAct_9fa48("16864")) {
        {}
      } else {
        stryCov_9fa48("16864");
        const hours = Math.floor(stryMutAct_9fa48("16865") ? milliseconds * (1000 * 60 * 60) : (stryCov_9fa48("16865"), milliseconds / (stryMutAct_9fa48("16866") ? 1000 * 60 / 60 : (stryCov_9fa48("16866"), (stryMutAct_9fa48("16867") ? 1000 / 60 : (stryCov_9fa48("16867"), 1000 * 60)) * 60))));
        const minutes = Math.floor(stryMutAct_9fa48("16868") ? milliseconds % (1000 * 60 * 60) * (1000 * 60) : (stryCov_9fa48("16868"), (stryMutAct_9fa48("16869") ? milliseconds * (1000 * 60 * 60) : (stryCov_9fa48("16869"), milliseconds % (stryMutAct_9fa48("16870") ? 1000 * 60 / 60 : (stryCov_9fa48("16870"), (stryMutAct_9fa48("16871") ? 1000 / 60 : (stryCov_9fa48("16871"), 1000 * 60)) * 60)))) / (stryMutAct_9fa48("16872") ? 1000 / 60 : (stryCov_9fa48("16872"), 1000 * 60))));
        if (stryMutAct_9fa48("16876") ? hours <= 0 : stryMutAct_9fa48("16875") ? hours >= 0 : stryMutAct_9fa48("16874") ? false : stryMutAct_9fa48("16873") ? true : (stryCov_9fa48("16873", "16874", "16875", "16876"), hours > 0)) {
          if (stryMutAct_9fa48("16877")) {
            {}
          } else {
            stryCov_9fa48("16877");
            return stryMutAct_9fa48("16878") ? `` : (stryCov_9fa48("16878"), `${hours}h ${minutes}m`);
          }
        }
        return stryMutAct_9fa48("16879") ? `` : (stryCov_9fa48("16879"), `${minutes}m`);
      }
    };

    // Process cohort data from today's attendance
    const processCohortData = () => {
      if (stryMutAct_9fa48("16880")) {
        {}
      } else {
        stryCov_9fa48("16880");
        console.log(stryMutAct_9fa48("16881") ? "" : (stryCov_9fa48("16881"), '🔍 processCohortData called'));
        console.log(stryMutAct_9fa48("16882") ? "" : (stryCov_9fa48("16882"), '🔍 todayAttendance:'), todayAttendance);

        // The backend returns data in todayAttendance.cohorts structure
        const cohortsData = stryMutAct_9fa48("16885") ? todayAttendance?.cohorts && [] : stryMutAct_9fa48("16884") ? false : stryMutAct_9fa48("16883") ? true : (stryCov_9fa48("16883", "16884", "16885"), (stryMutAct_9fa48("16886") ? todayAttendance.cohorts : (stryCov_9fa48("16886"), todayAttendance?.cohorts)) || (stryMutAct_9fa48("16887") ? ["Stryker was here"] : (stryCov_9fa48("16887"), [])));
        console.log(stryMutAct_9fa48("16888") ? "" : (stryCov_9fa48("16888"), '🔍 Using cohorts data:'), cohortsData);
        if (stryMutAct_9fa48("16891") ? !cohortsData && cohortsData.length === 0 : stryMutAct_9fa48("16890") ? false : stryMutAct_9fa48("16889") ? true : (stryCov_9fa48("16889", "16890", "16891"), (stryMutAct_9fa48("16892") ? cohortsData : (stryCov_9fa48("16892"), !cohortsData)) || (stryMutAct_9fa48("16894") ? cohortsData.length !== 0 : stryMutAct_9fa48("16893") ? false : (stryCov_9fa48("16893", "16894"), cohortsData.length === 0)))) {
          if (stryMutAct_9fa48("16895")) {
            {}
          } else {
            stryCov_9fa48("16895");
            console.log(stryMutAct_9fa48("16896") ? "" : (stryCov_9fa48("16896"), 'No cohort data available for processing'));
            return stryMutAct_9fa48("16897") ? ["Stryker was here"] : (stryCov_9fa48("16897"), []);
          }
        }
        console.log(stryMutAct_9fa48("16898") ? "" : (stryCov_9fa48("16898"), 'Processing cohort data from:'), cohortsData);

        // Convert to cohort data structure
        const cohortData = stryMutAct_9fa48("16899") ? ["Stryker was here"] : (stryCov_9fa48("16899"), []);

        // Map cohort names to display names
        const cohortMapping = stryMutAct_9fa48("16900") ? {} : (stryCov_9fa48("16900"), {
          'March 2025': stryMutAct_9fa48("16901") ? {} : (stryCov_9fa48("16901"), {
            name: stryMutAct_9fa48("16902") ? "" : (stryCov_9fa48("16902"), 'Pilot'),
            level: stryMutAct_9fa48("16903") ? "" : (stryCov_9fa48("16903"), 'L3')
          }),
          'June 2025': stryMutAct_9fa48("16904") ? {} : (stryCov_9fa48("16904"), {
            name: stryMutAct_9fa48("16905") ? "" : (stryCov_9fa48("16905"), 'June 2025'),
            level: stryMutAct_9fa48("16906") ? "" : (stryCov_9fa48("16906"), 'L2')
          }),
          'September 2025': stryMutAct_9fa48("16907") ? {} : (stryCov_9fa48("16907"), {
            name: stryMutAct_9fa48("16908") ? "" : (stryCov_9fa48("16908"), 'September'),
            level: stryMutAct_9fa48("16909") ? "" : (stryCov_9fa48("16909"), 'L1')
          }),
          'Unknown Cohort': stryMutAct_9fa48("16910") ? {} : (stryCov_9fa48("16910"), {
            name: stryMutAct_9fa48("16911") ? "" : (stryCov_9fa48("16911"), 'Unknown'),
            level: stryMutAct_9fa48("16912") ? "" : (stryCov_9fa48("16912"), 'L?')
          })
        });
        cohortsData.forEach(cohortGroup => {
          if (stryMutAct_9fa48("16913")) {
            {}
          } else {
            stryCov_9fa48("16913");
            console.log(stryMutAct_9fa48("16914") ? "" : (stryCov_9fa48("16914"), '🔍 Processing cohort group:'), cohortGroup);
            const cohortName = stryMutAct_9fa48("16917") ? cohortGroup.cohort && 'Unknown Cohort' : stryMutAct_9fa48("16916") ? false : stryMutAct_9fa48("16915") ? true : (stryCov_9fa48("16915", "16916", "16917"), cohortGroup.cohort || (stryMutAct_9fa48("16918") ? "" : (stryCov_9fa48("16918"), 'Unknown Cohort')));
            const attendees = stryMutAct_9fa48("16921") ? cohortGroup.records && [] : stryMutAct_9fa48("16920") ? false : stryMutAct_9fa48("16919") ? true : (stryCov_9fa48("16919", "16920", "16921"), cohortGroup.records || (stryMutAct_9fa48("16922") ? ["Stryker was here"] : (stryCov_9fa48("16922"), [])));
            console.log(stryMutAct_9fa48("16923") ? `` : (stryCov_9fa48("16923"), `Processing ${attendees.length} attendees for cohort: ${cohortName}`));

            // Normalize attendee records
            const normalizedAttendees = attendees.map(record => {
              if (stryMutAct_9fa48("16924")) {
                {}
              } else {
                stryCov_9fa48("16924");
                const firstName = stryMutAct_9fa48("16927") ? (record.firstName || record.first_name) && 'Unknown' : stryMutAct_9fa48("16926") ? false : stryMutAct_9fa48("16925") ? true : (stryCov_9fa48("16925", "16926", "16927"), (stryMutAct_9fa48("16929") ? record.firstName && record.first_name : stryMutAct_9fa48("16928") ? false : (stryCov_9fa48("16928", "16929"), record.firstName || record.first_name)) || (stryMutAct_9fa48("16930") ? "" : (stryCov_9fa48("16930"), 'Unknown')));
                const lastName = stryMutAct_9fa48("16933") ? (record.lastName || record.last_name) && 'Unknown' : stryMutAct_9fa48("16932") ? false : stryMutAct_9fa48("16931") ? true : (stryCov_9fa48("16931", "16932", "16933"), (stryMutAct_9fa48("16935") ? record.lastName && record.last_name : stryMutAct_9fa48("16934") ? false : (stryCov_9fa48("16934", "16935"), record.lastName || record.last_name)) || (stryMutAct_9fa48("16936") ? "" : (stryCov_9fa48("16936"), 'Unknown')));
                const checkInTime = stryMutAct_9fa48("16939") ? (record.checkInTime || record.check_in_time) && new Date().toISOString() : stryMutAct_9fa48("16938") ? false : stryMutAct_9fa48("16937") ? true : (stryCov_9fa48("16937", "16938", "16939"), (stryMutAct_9fa48("16941") ? record.checkInTime && record.check_in_time : stryMutAct_9fa48("16940") ? false : (stryCov_9fa48("16940", "16941"), record.checkInTime || record.check_in_time)) || new Date().toISOString());
                console.log(stryMutAct_9fa48("16942") ? `` : (stryCov_9fa48("16942"), `Normalizing record for ${firstName} ${lastName}, checkInTime: ${checkInTime}`));
                return stryMutAct_9fa48("16943") ? {} : (stryCov_9fa48("16943"), {
                  ...record,
                  firstName: firstName,
                  lastName: lastName,
                  checkInTime: checkInTime,
                  attendanceId: stryMutAct_9fa48("16946") ? record.attendanceId && record.attendance_id : stryMutAct_9fa48("16945") ? false : stryMutAct_9fa48("16944") ? true : (stryCov_9fa48("16944", "16945", "16946"), record.attendanceId || record.attendance_id),
                  photoUrl: stryMutAct_9fa48("16949") ? (record.photoUrl || record.photo_url) && null : stryMutAct_9fa48("16948") ? false : stryMutAct_9fa48("16947") ? true : (stryCov_9fa48("16947", "16948", "16949"), (stryMutAct_9fa48("16951") ? record.photoUrl && record.photo_url : stryMutAct_9fa48("16950") ? false : (stryCov_9fa48("16950", "16951"), record.photoUrl || record.photo_url)) || null)
                });
              }
            });
            const mapping = stryMutAct_9fa48("16954") ? cohortMapping[cohortName] && {
              name: cohortName,
              level: 'L?'
            } : stryMutAct_9fa48("16953") ? false : stryMutAct_9fa48("16952") ? true : (stryCov_9fa48("16952", "16953", "16954"), cohortMapping[cohortName] || (stryMutAct_9fa48("16955") ? {} : (stryCov_9fa48("16955"), {
              name: cohortName,
              level: stryMutAct_9fa48("16956") ? "" : (stryCov_9fa48("16956"), 'L?')
            })));
            console.log(stryMutAct_9fa48("16957") ? `` : (stryCov_9fa48("16957"), `Creating cohort card for ${cohortName} -> ${mapping.name} ${mapping.level} with ${normalizedAttendees.length} attendees`));
            cohortData.push(stryMutAct_9fa48("16958") ? {} : (stryCov_9fa48("16958"), {
              cohortName: mapping.name,
              cohortLevel: mapping.level,
              attendees: normalizedAttendees
            }));
          }
        });
        console.log(stryMutAct_9fa48("16959") ? "" : (stryCov_9fa48("16959"), 'Final cohort data:'), cohortData);
        return cohortData;
      }
    };
    const getSessionStatusColor = () => {
      if (stryMutAct_9fa48("16960")) {
        {}
      } else {
        stryCov_9fa48("16960");
        if (stryMutAct_9fa48("16963") ? false : stryMutAct_9fa48("16962") ? true : stryMutAct_9fa48("16961") ? sessionInfo : (stryCov_9fa48("16961", "16962", "16963"), !sessionInfo)) return stryMutAct_9fa48("16964") ? "" : (stryCov_9fa48("16964"), '#a0aec0');
        const remainingPercent = stryMutAct_9fa48("16965") ? sessionInfo.remainingTime / (8 * 60 * 60 * 1000) / 100 : (stryCov_9fa48("16965"), (stryMutAct_9fa48("16966") ? sessionInfo.remainingTime * (8 * 60 * 60 * 1000) : (stryCov_9fa48("16966"), sessionInfo.remainingTime / (stryMutAct_9fa48("16967") ? 8 * 60 * 60 / 1000 : (stryCov_9fa48("16967"), (stryMutAct_9fa48("16968") ? 8 * 60 / 60 : (stryCov_9fa48("16968"), (stryMutAct_9fa48("16969") ? 8 / 60 : (stryCov_9fa48("16969"), 8 * 60)) * 60)) * 1000)))) * 100);
        if (stryMutAct_9fa48("16973") ? remainingPercent <= 75 : stryMutAct_9fa48("16972") ? remainingPercent >= 75 : stryMutAct_9fa48("16971") ? false : stryMutAct_9fa48("16970") ? true : (stryCov_9fa48("16970", "16971", "16972", "16973"), remainingPercent > 75)) return stryMutAct_9fa48("16974") ? "" : (stryCov_9fa48("16974"), '#48bb78'); // Green
        if (stryMutAct_9fa48("16978") ? remainingPercent <= 50 : stryMutAct_9fa48("16977") ? remainingPercent >= 50 : stryMutAct_9fa48("16976") ? false : stryMutAct_9fa48("16975") ? true : (stryCov_9fa48("16975", "16976", "16977", "16978"), remainingPercent > 50)) return stryMutAct_9fa48("16979") ? "" : (stryCov_9fa48("16979"), '#ed8936'); // Orange
        if (stryMutAct_9fa48("16983") ? remainingPercent <= 25 : stryMutAct_9fa48("16982") ? remainingPercent >= 25 : stryMutAct_9fa48("16981") ? false : stryMutAct_9fa48("16980") ? true : (stryCov_9fa48("16980", "16981", "16982", "16983"), remainingPercent > 25)) return stryMutAct_9fa48("16984") ? "" : (stryCov_9fa48("16984"), '#e53e3e'); // Red
        return stryMutAct_9fa48("16985") ? "" : (stryCov_9fa48("16985"), '#c53030'); // Dark red
      }
    };
    if (stryMutAct_9fa48("16987") ? false : stryMutAct_9fa48("16986") ? true : (stryCov_9fa48("16986", "16987"), isLoading)) {
      if (stryMutAct_9fa48("16988")) {
        {}
      } else {
        stryCov_9fa48("16988");
        return <div className="attendance-dashboard-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>;
      }
    }
    if (stryMutAct_9fa48("16990") ? false : stryMutAct_9fa48("16989") ? true : (stryCov_9fa48("16989", "16990"), isLoggingOut)) {
      if (stryMutAct_9fa48("16991")) {
        {}
      } else {
        stryCov_9fa48("16991");
        return <div className="attendance-dashboard-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Logging out...</p>
        </div>
      </div>;
      }
    }
    return <div className="attendance-dashboard">
      <div className="attendance-dashboard-header">
        <div className="attendance-dashboard-title">
          <h1>AI-Native Builder Sign In</h1>
          <p className="attendance-dashboard-subtitle">
            Builder check-in system for classroom attendance
          </p>
        </div>
        
        <div className="attendance-dashboard-controls">
          <div className="attendance-session-info">
            <div className="system-status">
              <span className="status-indicator online"></span>
              <span>System Online</span>
            </div>
          </div>
          
          <div className="attendance-user-info">
            <div className="user-details">
              <span className="user-name">Welcome, {stryMutAct_9fa48("16992") ? user.firstName : (stryCov_9fa48("16992"), user?.firstName)} {stryMutAct_9fa48("16993") ? user.lastName : (stryCov_9fa48("16993"), user?.lastName)}</span>
              <span className="user-role">{(stryMutAct_9fa48("16996") ? user?.role !== 'admin' : stryMutAct_9fa48("16995") ? false : stryMutAct_9fa48("16994") ? true : (stryCov_9fa48("16994", "16995", "16996"), (stryMutAct_9fa48("16997") ? user.role : (stryCov_9fa48("16997"), user?.role)) === (stryMutAct_9fa48("16998") ? "" : (stryCov_9fa48("16998"), 'admin')))) ? stryMutAct_9fa48("16999") ? "" : (stryCov_9fa48("16999"), 'Administrator') : stryMutAct_9fa48("17000") ? "" : (stryCov_9fa48("17000"), 'Staff')}</span>
            </div>
            
            <div className="header-actions">
              <button onClick={stryMutAct_9fa48("17001") ? () => undefined : (stryCov_9fa48("17001"), () => setShowSettings(stryMutAct_9fa48("17002") ? false : (stryCov_9fa48("17002"), true)))} className="settings-button" aria-label="Open settings">
                ⚙️
              </button>
              <button onClick={handleLogout} className="logout-button" disabled={isLoggingOut}>
                {isLoggingOut ? stryMutAct_9fa48("17003") ? "" : (stryCov_9fa48("17003"), 'Logging Out...') : stryMutAct_9fa48("17004") ? "" : (stryCov_9fa48("17004"), 'Logout')}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="attendance-dashboard-content">
        <div className="attendance-dashboard-grid">
          {/* Builder Check-in Card */}
          <div className="attendance-dashboard-card primary-card">
            <div className="card-header">
              <div className="card-icon">📷</div>
              <h2>Builder Check-in</h2>
            </div>
            
            <div className="check-in-workflow">
              {/* Step 1: Search */}
              <div className={stryMutAct_9fa48("17005") ? `` : (stryCov_9fa48("17005"), `search-step ${showCamera ? stryMutAct_9fa48("17006") ? "" : (stryCov_9fa48("17006"), 'search-step-with-camera') : stryMutAct_9fa48("17007") ? "Stryker was here!" : (stryCov_9fa48("17007"), '')}`)}>
                <div className="search-container">
                  <input ref={searchInputRef} type="text" value={searchQuery} onChange={handleSearchChange} onFocus={handleSearchFocus} onBlur={handleSearchBlur} placeholder="Type builder name to search..." className="builder-search-input" disabled={isSearching} autoComplete="off" />
                  {stryMutAct_9fa48("17010") ? isSearching || <div className="search-spinner"></div> : stryMutAct_9fa48("17009") ? false : stryMutAct_9fa48("17008") ? true : (stryCov_9fa48("17008", "17009", "17010"), isSearching && <div className="search-spinner"></div>)}
                  
                                  {stryMutAct_9fa48("17013") ? searchResults.length > 0 || <div className="search-results">
                    {searchResults.map(builder => <button key={builder.id} onClick={() => handleBuilderSelect(builder)} className="search-result-item" type="button">
                          <span className="builder-name">{builder.firstName} {builder.lastName}</span>
                          <span className="builder-cohort">{builder.cohort}</span>
                        </button>)}
                    </div> : stryMutAct_9fa48("17012") ? false : stryMutAct_9fa48("17011") ? true : (stryCov_9fa48("17011", "17012", "17013"), (stryMutAct_9fa48("17016") ? searchResults.length <= 0 : stryMutAct_9fa48("17015") ? searchResults.length >= 0 : stryMutAct_9fa48("17014") ? true : (stryCov_9fa48("17014", "17015", "17016"), searchResults.length > 0)) && <div className="search-results">
                    {searchResults.map(stryMutAct_9fa48("17017") ? () => undefined : (stryCov_9fa48("17017"), builder => <button key={builder.id} onClick={stryMutAct_9fa48("17018") ? () => undefined : (stryCov_9fa48("17018"), () => handleBuilderSelect(builder))} className="search-result-item" type="button">
                          <span className="builder-name">{builder.firstName} {builder.lastName}</span>
                          <span className="builder-cohort">{builder.cohort}</span>
                        </button>))}
                    </div>)}
                </div>
                
                {stryMutAct_9fa48("17021") ? searchQuery && searchResults.length === 0 && !isSearching && !selectedBuilder || <div className="no-results">
                    No builders found matching "{searchQuery}"
                  </div> : stryMutAct_9fa48("17020") ? false : stryMutAct_9fa48("17019") ? true : (stryCov_9fa48("17019", "17020", "17021"), (stryMutAct_9fa48("17023") ? searchQuery && searchResults.length === 0 && !isSearching || !selectedBuilder : stryMutAct_9fa48("17022") ? true : (stryCov_9fa48("17022", "17023"), (stryMutAct_9fa48("17025") ? searchQuery && searchResults.length === 0 || !isSearching : stryMutAct_9fa48("17024") ? true : (stryCov_9fa48("17024", "17025"), (stryMutAct_9fa48("17027") ? searchQuery || searchResults.length === 0 : stryMutAct_9fa48("17026") ? true : (stryCov_9fa48("17026", "17027"), searchQuery && (stryMutAct_9fa48("17029") ? searchResults.length !== 0 : stryMutAct_9fa48("17028") ? true : (stryCov_9fa48("17028", "17029"), searchResults.length === 0)))) && (stryMutAct_9fa48("17030") ? isSearching : (stryCov_9fa48("17030"), !isSearching)))) && (stryMutAct_9fa48("17031") ? selectedBuilder : (stryCov_9fa48("17031"), !selectedBuilder)))) && <div className="no-results">
                    No builders found matching "{searchQuery}"
                  </div>)}

                {/* Show selected builder and start check-in button */}
                {stryMutAct_9fa48("17034") ? selectedBuilder && !showCamera || <div className="selected-builder-info">
                    <div className="selected-builder-display">
                      <span className="selected-name">{selectedBuilder.firstName} {selectedBuilder.lastName}</span>
                      <span className="selected-cohort">{selectedBuilder.cohort}</span>
                    </div>
                    <button onClick={handleStartCheckIn} className="start-checkin-button">
                      Start Check-in 📷
                    </button>
                  </div> : stryMutAct_9fa48("17033") ? false : stryMutAct_9fa48("17032") ? true : (stryCov_9fa48("17032", "17033", "17034"), (stryMutAct_9fa48("17036") ? selectedBuilder || !showCamera : stryMutAct_9fa48("17035") ? true : (stryCov_9fa48("17035", "17036"), selectedBuilder && (stryMutAct_9fa48("17037") ? showCamera : (stryCov_9fa48("17037"), !showCamera)))) && <div className="selected-builder-info">
                    <div className="selected-builder-display">
                      <span className="selected-name">{selectedBuilder.firstName} {selectedBuilder.lastName}</span>
                      <span className="selected-cohort">{selectedBuilder.cohort}</span>
                    </div>
                    <button onClick={handleStartCheckIn} className="start-checkin-button">
                      Start Check-in 📷
                    </button>
                  </div>)}
                
                {/* Remove empty space when builder is selected but camera not started */}
                {stryMutAct_9fa48("17040") ? selectedBuilder && !showCamera && !capturedPhoto || <div style={{
                  display: 'none'
                }}></div> : stryMutAct_9fa48("17039") ? false : stryMutAct_9fa48("17038") ? true : (stryCov_9fa48("17038", "17039", "17040"), (stryMutAct_9fa48("17042") ? selectedBuilder && !showCamera || !capturedPhoto : stryMutAct_9fa48("17041") ? true : (stryCov_9fa48("17041", "17042"), (stryMutAct_9fa48("17044") ? selectedBuilder || !showCamera : stryMutAct_9fa48("17043") ? true : (stryCov_9fa48("17043", "17044"), selectedBuilder && (stryMutAct_9fa48("17045") ? showCamera : (stryCov_9fa48("17045"), !showCamera)))) && (stryMutAct_9fa48("17046") ? capturedPhoto : (stryCov_9fa48("17046"), !capturedPhoto)))) && <div style={stryMutAct_9fa48("17047") ? {} : (stryCov_9fa48("17047"), {
                  display: stryMutAct_9fa48("17048") ? "" : (stryCov_9fa48("17048"), 'none')
                })}></div>)}
              </div>
              
              {/* Step 2: Camera Capture - Side by side */}
              {stryMutAct_9fa48("17051") ? selectedBuilder && showCamera && !capturedPhoto || <div className="camera-step-side">
                  <div className="selected-builder">
                    <h3>Check-in for: {selectedBuilder.firstName} {selectedBuilder.lastName}</h3>
                    <p className="builder-cohort">{selectedBuilder.cohort}</p>
                  </div>
                  
                  <div className="camera-container">
                    <video ref={videoRef} autoPlay playsInline muted className="camera-video" style={{
                    width: '100%',
                    maxWidth: '320px',
                    height: '240px',
                    backgroundColor: '#000',
                    borderRadius: '8px',
                    border: '2px solid red',
                    objectFit: 'cover'
                  }} />
                    <canvas ref={canvasRef} style={{
                    display: 'none'
                  }} />
                    
                    <div className="camera-controls">
                      <button onClick={handlePhotoCapture} className="capture-button" disabled={isCapturing || !cameraStream}>
                        {isCapturing ? 'Capturing...' : cameraStream ? '📸 Take Photo' : '🔄 Starting Camera...'}
                      </button>
                      
                      <button onClick={handleRetakePhoto} className="retry-button" disabled={isCapturing}>
                        Retake Photo
                      </button>
                      
                      <button onClick={() => {
                      stopCamera();
                      setShowCamera(false);
                    }} className="cancel-button">
                        Cancel
                      </button>
                    </div>
                  </div>
                  
                  <button onClick={() => {
                  stopCamera();
                  setSelectedBuilder(null);
                }} className="back-button">
                    ← Back to Search
                  </button>
                </div> : stryMutAct_9fa48("17050") ? false : stryMutAct_9fa48("17049") ? true : (stryCov_9fa48("17049", "17050", "17051"), (stryMutAct_9fa48("17053") ? selectedBuilder && showCamera || !capturedPhoto : stryMutAct_9fa48("17052") ? true : (stryCov_9fa48("17052", "17053"), (stryMutAct_9fa48("17055") ? selectedBuilder || showCamera : stryMutAct_9fa48("17054") ? true : (stryCov_9fa48("17054", "17055"), selectedBuilder && showCamera)) && (stryMutAct_9fa48("17056") ? capturedPhoto : (stryCov_9fa48("17056"), !capturedPhoto)))) && <div className="camera-step-side">
                  <div className="selected-builder">
                    <h3>Check-in for: {selectedBuilder.firstName} {selectedBuilder.lastName}</h3>
                    <p className="builder-cohort">{selectedBuilder.cohort}</p>
                  </div>
                  
                  <div className="camera-container">
                    <video ref={videoRef} autoPlay playsInline muted className="camera-video" style={stryMutAct_9fa48("17057") ? {} : (stryCov_9fa48("17057"), {
                    width: stryMutAct_9fa48("17058") ? "" : (stryCov_9fa48("17058"), '100%'),
                    maxWidth: stryMutAct_9fa48("17059") ? "" : (stryCov_9fa48("17059"), '320px'),
                    height: stryMutAct_9fa48("17060") ? "" : (stryCov_9fa48("17060"), '240px'),
                    backgroundColor: stryMutAct_9fa48("17061") ? "" : (stryCov_9fa48("17061"), '#000'),
                    borderRadius: stryMutAct_9fa48("17062") ? "" : (stryCov_9fa48("17062"), '8px'),
                    border: stryMutAct_9fa48("17063") ? "" : (stryCov_9fa48("17063"), '2px solid red'),
                    objectFit: stryMutAct_9fa48("17064") ? "" : (stryCov_9fa48("17064"), 'cover')
                  })} />
                    <canvas ref={canvasRef} style={stryMutAct_9fa48("17065") ? {} : (stryCov_9fa48("17065"), {
                    display: stryMutAct_9fa48("17066") ? "" : (stryCov_9fa48("17066"), 'none')
                  })} />
                    
                    <div className="camera-controls">
                      <button onClick={handlePhotoCapture} className="capture-button" disabled={stryMutAct_9fa48("17069") ? isCapturing && !cameraStream : stryMutAct_9fa48("17068") ? false : stryMutAct_9fa48("17067") ? true : (stryCov_9fa48("17067", "17068", "17069"), isCapturing || (stryMutAct_9fa48("17070") ? cameraStream : (stryCov_9fa48("17070"), !cameraStream)))}>
                        {isCapturing ? stryMutAct_9fa48("17071") ? "" : (stryCov_9fa48("17071"), 'Capturing...') : cameraStream ? stryMutAct_9fa48("17072") ? "" : (stryCov_9fa48("17072"), '📸 Take Photo') : stryMutAct_9fa48("17073") ? "" : (stryCov_9fa48("17073"), '🔄 Starting Camera...')}
                      </button>
                      
                      <button onClick={handleRetakePhoto} className="retry-button" disabled={isCapturing}>
                        Retake Photo
                      </button>
                      
                      <button onClick={() => {
                      if (stryMutAct_9fa48("17074")) {
                        {}
                      } else {
                        stryCov_9fa48("17074");
                        stopCamera();
                        setShowCamera(stryMutAct_9fa48("17075") ? true : (stryCov_9fa48("17075"), false));
                      }
                    }} className="cancel-button">
                        Cancel
                      </button>
                    </div>
                  </div>
                  
                  <button onClick={() => {
                  if (stryMutAct_9fa48("17076")) {
                    {}
                  } else {
                    stryCov_9fa48("17076");
                    stopCamera();
                    setSelectedBuilder(null);
                  }
                }} className="back-button">
                    ← Back to Search
                  </button>
                </div>)}
              
              {/* Step 3: Confirmation - Side by side */}
              {stryMutAct_9fa48("17079") ? capturedPhoto || <div className="confirmation-step-side">
                  <div className="photo-preview">
                    <img src={capturedPhoto} alt="Captured photo" className="captured-photo" />
                    <p className="photo-caption">Photo captured successfully!</p>
                  </div>
                  
                  {checkInStatus && <div className={`check-in-status ${checkInStatus.type}`}>
                      {checkInStatus.message}
                    </div>}
                  
                  <div className="confirmation-actions">
                    <button onClick={handleCheckInSubmit} className="submit-button" disabled={isSubmitting}>
                      {isSubmitting ? 'Submitting...' : 'Complete Check-in'}
                    </button>
                    
                    <button onClick={handleRetakePhoto} className="retake-button" disabled={isSubmitting}>
                      Retake Photo
                    </button>
                    
                    <button onClick={resetCheckInForm} className="reset-button" disabled={isSubmitting}>
                      Start Over
                    </button>
                  </div>
                </div> : stryMutAct_9fa48("17078") ? false : stryMutAct_9fa48("17077") ? true : (stryCov_9fa48("17077", "17078", "17079"), capturedPhoto && <div className="confirmation-step-side">
                  <div className="photo-preview">
                    <img src={capturedPhoto} alt="Captured photo" className="captured-photo" />
                    <p className="photo-caption">Photo captured successfully!</p>
                  </div>
                  
                  {stryMutAct_9fa48("17082") ? checkInStatus || <div className={`check-in-status ${checkInStatus.type}`}>
                      {checkInStatus.message}
                    </div> : stryMutAct_9fa48("17081") ? false : stryMutAct_9fa48("17080") ? true : (stryCov_9fa48("17080", "17081", "17082"), checkInStatus && <div className={stryMutAct_9fa48("17083") ? `` : (stryCov_9fa48("17083"), `check-in-status ${checkInStatus.type}`)}>
                      {checkInStatus.message}
                    </div>)}
                  
                  <div className="confirmation-actions">
                    <button onClick={handleCheckInSubmit} className="submit-button" disabled={isSubmitting}>
                      {isSubmitting ? stryMutAct_9fa48("17084") ? "" : (stryCov_9fa48("17084"), 'Submitting...') : stryMutAct_9fa48("17085") ? "" : (stryCov_9fa48("17085"), 'Complete Check-in')}
                    </button>
                    
                    <button onClick={handleRetakePhoto} className="retake-button" disabled={isSubmitting}>
                      Retake Photo
                    </button>
                    
                    <button onClick={resetCheckInForm} className="reset-button" disabled={isSubmitting}>
                      Start Over
                    </button>
                  </div>
                </div>)}
            </div>
          </div>
          
          {/* Today's Attendance Card */}
          <div className="attendance-dashboard-card">
            <div className="card-header">
              <div className="card-icon">📊</div>
              <h2>Today's Attendance</h2>
            </div>
            
            {isLoadingAttendance ? <div className="attendance-loading">
                <div className="spinner"></div>
                <p>Loading attendance data...</p>
              </div> : todayAttendance ? <div className="attendance-summary">
                {/* First row: Total, On Time, Late stats */}
                <div className="attendance-stats">
                  <div className="stat-item total">
                    <span className="stat-number">{stryMutAct_9fa48("17088") ? todayAttendance.summary?.totalRecords && 0 : stryMutAct_9fa48("17087") ? false : stryMutAct_9fa48("17086") ? true : (stryCov_9fa48("17086", "17087", "17088"), (stryMutAct_9fa48("17089") ? todayAttendance.summary.totalRecords : (stryCov_9fa48("17089"), todayAttendance.summary?.totalRecords)) || 0)}</span>
                    <span className="stat-label">Total Check-ins</span>
                  </div>
                  <div className="stat-item on-time">
                    <span className="stat-number">{stryMutAct_9fa48("17092") ? todayAttendance.summary?.presentCount && 0 : stryMutAct_9fa48("17091") ? false : stryMutAct_9fa48("17090") ? true : (stryCov_9fa48("17090", "17091", "17092"), (stryMutAct_9fa48("17093") ? todayAttendance.summary.presentCount : (stryCov_9fa48("17093"), todayAttendance.summary?.presentCount)) || 0)}</span>
                    <span className="stat-label">✅ On Time</span>
                  </div>
                  <div className="stat-item late">
                    <span className="stat-number">{stryMutAct_9fa48("17096") ? todayAttendance.summary?.lateCount && 0 : stryMutAct_9fa48("17095") ? false : stryMutAct_9fa48("17094") ? true : (stryCov_9fa48("17094", "17095", "17096"), (stryMutAct_9fa48("17097") ? todayAttendance.summary.lateCount : (stryCov_9fa48("17097"), todayAttendance.summary?.lateCount)) || 0)}</span>
                    <span className="stat-label">⏰ Late</span>
                  </div>
                </div>
                
                {/* Second row: Cohort rectangles */}
                {stryMutAct_9fa48("17100") ? todayAttendance.cohorts && todayAttendance.cohorts.length > 0 || <div className="cohort-stats-row">
                    {todayAttendance.cohorts.map((cohort, index) => {
                  const onTimeCount = cohort.records.filter(r => r.status === 'present').length;
                  const lateCount = cohort.records.filter(r => r.status === 'late').length;
                  const totalCount = cohort.count;
                  return <div key={index} className="cohort-stat-item">
                          <div className="cohort-name">{cohort.cohort}</div>
                          <div className="cohort-numbers">
                            <span className="cohort-total">{totalCount}</span>
                            <div className="cohort-details">
                              <span className="cohort-on-time">✅ {onTimeCount}</span>
                              <span className="cohort-late">⏰ {lateCount}</span>
                            </div>
                          </div>
                        </div>;
                })}
                  </div> : stryMutAct_9fa48("17099") ? false : stryMutAct_9fa48("17098") ? true : (stryCov_9fa48("17098", "17099", "17100"), (stryMutAct_9fa48("17102") ? todayAttendance.cohorts || todayAttendance.cohorts.length > 0 : stryMutAct_9fa48("17101") ? true : (stryCov_9fa48("17101", "17102"), todayAttendance.cohorts && (stryMutAct_9fa48("17105") ? todayAttendance.cohorts.length <= 0 : stryMutAct_9fa48("17104") ? todayAttendance.cohorts.length >= 0 : stryMutAct_9fa48("17103") ? true : (stryCov_9fa48("17103", "17104", "17105"), todayAttendance.cohorts.length > 0)))) && <div className="cohort-stats-row">
                    {todayAttendance.cohorts.map((cohort, index) => {
                  if (stryMutAct_9fa48("17106")) {
                    {}
                  } else {
                    stryCov_9fa48("17106");
                    const onTimeCount = stryMutAct_9fa48("17107") ? cohort.records.length : (stryCov_9fa48("17107"), cohort.records.filter(stryMutAct_9fa48("17108") ? () => undefined : (stryCov_9fa48("17108"), r => stryMutAct_9fa48("17111") ? r.status !== 'present' : stryMutAct_9fa48("17110") ? false : stryMutAct_9fa48("17109") ? true : (stryCov_9fa48("17109", "17110", "17111"), r.status === (stryMutAct_9fa48("17112") ? "" : (stryCov_9fa48("17112"), 'present'))))).length);
                    const lateCount = stryMutAct_9fa48("17113") ? cohort.records.length : (stryCov_9fa48("17113"), cohort.records.filter(stryMutAct_9fa48("17114") ? () => undefined : (stryCov_9fa48("17114"), r => stryMutAct_9fa48("17117") ? r.status !== 'late' : stryMutAct_9fa48("17116") ? false : stryMutAct_9fa48("17115") ? true : (stryCov_9fa48("17115", "17116", "17117"), r.status === (stryMutAct_9fa48("17118") ? "" : (stryCov_9fa48("17118"), 'late'))))).length);
                    const totalCount = cohort.count;
                    return <div key={index} className="cohort-stat-item">
                          <div className="cohort-name">{cohort.cohort}</div>
                          <div className="cohort-numbers">
                            <span className="cohort-total">{totalCount}</span>
                            <div className="cohort-details">
                              <span className="cohort-on-time">✅ {onTimeCount}</span>
                              <span className="cohort-late">⏰ {lateCount}</span>
                            </div>
                          </div>
                        </div>;
                  }
                })}
                  </div>)}
                
                <div className="attendance-date">
                  <strong>Date:</strong> {stryMutAct_9fa48("17121") ? todayAttendance.date && 'Today' : stryMutAct_9fa48("17120") ? false : stryMutAct_9fa48("17119") ? true : (stryCov_9fa48("17119", "17120", "17121"), todayAttendance.date || (stryMutAct_9fa48("17122") ? "" : (stryCov_9fa48("17122"), 'Today')))}
                </div>
                
                <button onClick={loadTodayAttendance} className="refresh-button" disabled={isLoadingAttendance}>
                  {isLoadingAttendance ? stryMutAct_9fa48("17123") ? "" : (stryCov_9fa48("17123"), 'Refreshing...') : stryMutAct_9fa48("17124") ? "" : (stryCov_9fa48("17124"), 'Refresh Data')}
                </button>
              </div> : <div className="attendance-error">
                <p>Unable to load attendance data</p>
                <button onClick={loadTodayAttendance} className="retry-button">
                  Try Again
                </button>
              </div>}
          </div>
        </div>
        
        {/* Cohort Attendance Cards */}
        <div className="cohort-attendance-section">
          {(() => {
            if (stryMutAct_9fa48("17125")) {
              {}
            } else {
              stryCov_9fa48("17125");
              const cohortData = processCohortData();
              console.log(stryMutAct_9fa48("17126") ? "" : (stryCov_9fa48("17126"), '🔍 Rendering cohort cards, data:'), cohortData);
              return cohortData.map(stryMutAct_9fa48("17127") ? () => undefined : (stryCov_9fa48("17127"), (cohort, index) => <CohortAttendanceCard key={stryMutAct_9fa48("17128") ? `` : (stryCov_9fa48("17128"), `${cohort.cohortLevel}-${cohort.cohortName}-${index}`)} cohortName={cohort.cohortName} cohortLevel={cohort.cohortLevel} attendees={cohort.attendees} className="cohort-card" />));
            }
          })()}
        </div>
      </div>
      

      
      {/* Settings Modal */}
      {stryMutAct_9fa48("17131") ? showSettings || <div className="settings-modal">
          <div className="settings-content">
            <div className="settings-header">
              <h3>System Settings</h3>
              <button onClick={() => setShowSettings(false)} className="close-button">
                ×
              </button>
            </div>
            <div className="settings-body">
              <p>Settings configuration will be implemented here.</p>
              <p>This includes camera settings, attendance rules, and system preferences.</p>
            </div>
          </div>
        </div> : stryMutAct_9fa48("17130") ? false : stryMutAct_9fa48("17129") ? true : (stryCov_9fa48("17129", "17130", "17131"), showSettings && <div className="settings-modal">
          <div className="settings-content">
            <div className="settings-header">
              <h3>System Settings</h3>
              <button onClick={stryMutAct_9fa48("17132") ? () => undefined : (stryCov_9fa48("17132"), () => setShowSettings(stryMutAct_9fa48("17133") ? true : (stryCov_9fa48("17133"), false)))} className="close-button">
                ×
              </button>
            </div>
            <div className="settings-body">
              <p>Settings configuration will be implemented here.</p>
              <p>This includes camera settings, attendance rules, and system preferences.</p>
            </div>
          </div>
        </div>)}

      {/* Celebratory Animations */}
      
      {/* Photo Scan Animation */}
      {stryMutAct_9fa48("17136") ? showScanAnimation || <div className="scan-animation-overlay">
          <div className="scan-animation-content">
            <div className="scan-flash"></div>
            <div className="logo-spin-container">
              <img src={logoImage} alt="Pursuit Logo" className="spinning-logo" />
            </div>
            <div className="scan-text">Processing...</div>
          </div>
        </div> : stryMutAct_9fa48("17135") ? false : stryMutAct_9fa48("17134") ? true : (stryCov_9fa48("17134", "17135", "17136"), showScanAnimation && <div className="scan-animation-overlay">
          <div className="scan-animation-content">
            <div className="scan-flash"></div>
            <div className="logo-spin-container">
              <img src={logoImage} alt="Pursuit Logo" className="spinning-logo" />
            </div>
            <div className="scan-text">Processing...</div>
          </div>
        </div>)}

      {/* Welcome Celebration */}
      {stryMutAct_9fa48("17139") ? showWelcomeCelebration || <div className="welcome-celebration-overlay">
          <div className="welcome-celebration-content">
            <div className="welcome-message">{welcomeMessage}</div>
            <div className="celebration-sparkles">
              <span className="sparkle">✨</span>
              <span className="sparkle">🎉</span>
              <span className="sparkle">✨</span>
            </div>
            <button className="next-builder-button-celebration" onClick={() => {
            resetCheckInForm();
          }}>
              Next Builder →
            </button>
          </div>
        </div> : stryMutAct_9fa48("17138") ? false : stryMutAct_9fa48("17137") ? true : (stryCov_9fa48("17137", "17138", "17139"), showWelcomeCelebration && <div className="welcome-celebration-overlay">
          <div className="welcome-celebration-content">
            <div className="welcome-message">{welcomeMessage}</div>
            <div className="celebration-sparkles">
              <span className="sparkle">✨</span>
              <span className="sparkle">🎉</span>
              <span className="sparkle">✨</span>
            </div>
            <button className="next-builder-button-celebration" onClick={() => {
            if (stryMutAct_9fa48("17140")) {
              {}
            } else {
              stryCov_9fa48("17140");
              resetCheckInForm();
            }
          }}>
              Next Builder →
            </button>
          </div>
        </div>)}

      {/* Photo Transport Animation */}
      {stryMutAct_9fa48("17143") ? showPhotoTransport || <div className="photo-transport-animation">
          <div className="photo-transport-content">
            <div className="transport-photo">
              <img src={capturedPhoto} alt="Transporting photo" className="transporting-photo" />
            </div>
            <div className="transport-arrow">→</div>
            <div className="transport-destination">
              <div className="attendance-counter-increment">
                +1
              </div>
            </div>
          </div>
        </div> : stryMutAct_9fa48("17142") ? false : stryMutAct_9fa48("17141") ? true : (stryCov_9fa48("17141", "17142", "17143"), showPhotoTransport && <div className="photo-transport-animation">
          <div className="photo-transport-content">
            <div className="transport-photo">
              <img src={capturedPhoto} alt="Transporting photo" className="transporting-photo" />
            </div>
            <div className="transport-arrow">→</div>
            <div className="transport-destination">
              <div className="attendance-counter-increment">
                +1
              </div>
            </div>
          </div>
        </div>)}
    </div>;
  }
};
export default AttendanceDashboard;