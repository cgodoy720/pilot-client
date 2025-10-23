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
import { useNavigate } from 'react-router-dom';
import logoFull from '../../assets/logo-full.png';
import { storeAuthData, isAuthenticated, validateToken } from '../../utils/attendanceAuth';
import './AttendanceLogin.css';
const AttendanceLogin = () => {
  if (stryMutAct_9fa48("17144")) {
    {}
  } else {
    stryCov_9fa48("17144");
    const [email, setEmail] = useState(stryMutAct_9fa48("17145") ? "Stryker was here!" : (stryCov_9fa48("17145"), ''));
    const [password, setPassword] = useState(stryMutAct_9fa48("17146") ? "Stryker was here!" : (stryCov_9fa48("17146"), ''));
    const [showPassword, setShowPassword] = useState(stryMutAct_9fa48("17147") ? true : (stryCov_9fa48("17147"), false));
    const [error, setError] = useState(stryMutAct_9fa48("17148") ? "Stryker was here!" : (stryCov_9fa48("17148"), ''));
    const [isSubmitting, setIsSubmitting] = useState(stryMutAct_9fa48("17149") ? true : (stryCov_9fa48("17149"), false));
    const [successMessage, setSuccessMessage] = useState(stryMutAct_9fa48("17150") ? "Stryker was here!" : (stryCov_9fa48("17150"), ''));
    const [isRedirecting, setIsRedirecting] = useState(stryMutAct_9fa48("17151") ? true : (stryCov_9fa48("17151"), false));
    const navigate = useNavigate();

    // Check for existing session on component mount
    useEffect(() => {
      if (stryMutAct_9fa48("17152")) {
        {}
      } else {
        stryCov_9fa48("17152");
        const checkExistingSession = async () => {
          if (stryMutAct_9fa48("17153")) {
            {}
          } else {
            stryCov_9fa48("17153");
            if (stryMutAct_9fa48("17155") ? false : stryMutAct_9fa48("17154") ? true : (stryCov_9fa48("17154", "17155"), isAuthenticated())) {
              if (stryMutAct_9fa48("17156")) {
                {}
              } else {
                stryCov_9fa48("17156");
                // Valid session exists, redirect to dashboard
                setIsRedirecting(stryMutAct_9fa48("17157") ? false : (stryCov_9fa48("17157"), true));
                setSuccessMessage(stryMutAct_9fa48("17158") ? "" : (stryCov_9fa48("17158"), 'Session found. Redirecting to dashboard...'));

                // Small delay to show the message
                setTimeout(() => {
                  if (stryMutAct_9fa48("17159")) {
                    {}
                  } else {
                    stryCov_9fa48("17159");
                    navigate(stryMutAct_9fa48("17160") ? "" : (stryCov_9fa48("17160"), '/attendance-dashboard'), stryMutAct_9fa48("17161") ? {} : (stryCov_9fa48("17161"), {
                      replace: stryMutAct_9fa48("17162") ? false : (stryCov_9fa48("17162"), true)
                    }));
                  }
                }, 500);
              }
            } else {
              if (stryMutAct_9fa48("17163")) {
                {}
              } else {
                stryCov_9fa48("17163");
                // Clear any invalid session data
                localStorage.removeItem(stryMutAct_9fa48("17164") ? "" : (stryCov_9fa48("17164"), 'attendanceToken'));
                localStorage.removeItem(stryMutAct_9fa48("17165") ? "" : (stryCov_9fa48("17165"), 'attendanceUser'));
                localStorage.removeItem(stryMutAct_9fa48("17166") ? "" : (stryCov_9fa48("17166"), 'attendanceSessionStart'));
                localStorage.removeItem(stryMutAct_9fa48("17167") ? "" : (stryCov_9fa48("17167"), 'attendanceLastActivity'));
              }
            }
          }
        };
        checkExistingSession();
      }
    }, stryMutAct_9fa48("17168") ? [] : (stryCov_9fa48("17168"), [navigate]));
    const handleSubmit = async e => {
      if (stryMutAct_9fa48("17169")) {
        {}
      } else {
        stryCov_9fa48("17169");
        e.preventDefault();
        setError(stryMutAct_9fa48("17170") ? "Stryker was here!" : (stryCov_9fa48("17170"), ''));
        setSuccessMessage(stryMutAct_9fa48("17171") ? "Stryker was here!" : (stryCov_9fa48("17171"), ''));
        setIsSubmitting(stryMutAct_9fa48("17172") ? false : (stryCov_9fa48("17172"), true));
        setIsRedirecting(stryMutAct_9fa48("17173") ? true : (stryCov_9fa48("17173"), false));

        // Input validation
        if (stryMutAct_9fa48("17176") ? !email.trim() && !password.trim() : stryMutAct_9fa48("17175") ? false : stryMutAct_9fa48("17174") ? true : (stryCov_9fa48("17174", "17175", "17176"), (stryMutAct_9fa48("17177") ? email.trim() : (stryCov_9fa48("17177"), !(stryMutAct_9fa48("17178") ? email : (stryCov_9fa48("17178"), email.trim())))) || (stryMutAct_9fa48("17179") ? password.trim() : (stryCov_9fa48("17179"), !(stryMutAct_9fa48("17180") ? password : (stryCov_9fa48("17180"), password.trim())))))) {
          if (stryMutAct_9fa48("17181")) {
            {}
          } else {
            stryCov_9fa48("17181");
            setError(stryMutAct_9fa48("17182") ? "" : (stryCov_9fa48("17182"), 'Please enter both email and password.'));
            setIsSubmitting(stryMutAct_9fa48("17183") ? true : (stryCov_9fa48("17183"), false));
            return;
          }
        }

        // Email format validation
        const emailRegex = stryMutAct_9fa48("17194") ? /^[^\s@]+@[^\s@]+\.[^\S@]+$/ : stryMutAct_9fa48("17193") ? /^[^\s@]+@[^\s@]+\.[\s@]+$/ : stryMutAct_9fa48("17192") ? /^[^\s@]+@[^\s@]+\.[^\s@]$/ : stryMutAct_9fa48("17191") ? /^[^\s@]+@[^\S@]+\.[^\s@]+$/ : stryMutAct_9fa48("17190") ? /^[^\s@]+@[\s@]+\.[^\s@]+$/ : stryMutAct_9fa48("17189") ? /^[^\s@]+@[^\s@]\.[^\s@]+$/ : stryMutAct_9fa48("17188") ? /^[^\S@]+@[^\s@]+\.[^\s@]+$/ : stryMutAct_9fa48("17187") ? /^[\s@]+@[^\s@]+\.[^\s@]+$/ : stryMutAct_9fa48("17186") ? /^[^\s@]@[^\s@]+\.[^\s@]+$/ : stryMutAct_9fa48("17185") ? /^[^\s@]+@[^\s@]+\.[^\s@]+/ : stryMutAct_9fa48("17184") ? /[^\s@]+@[^\s@]+\.[^\s@]+$/ : (stryCov_9fa48("17184", "17185", "17186", "17187", "17188", "17189", "17190", "17191", "17192", "17193", "17194"), /^[^\s@]+@[^\s@]+\.[^\s@]+$/);
        if (stryMutAct_9fa48("17197") ? false : stryMutAct_9fa48("17196") ? true : stryMutAct_9fa48("17195") ? emailRegex.test(email.trim()) : (stryCov_9fa48("17195", "17196", "17197"), !emailRegex.test(stryMutAct_9fa48("17198") ? email : (stryCov_9fa48("17198"), email.trim())))) {
          if (stryMutAct_9fa48("17199")) {
            {}
          } else {
            stryCov_9fa48("17199");
            setError(stryMutAct_9fa48("17200") ? "" : (stryCov_9fa48("17200"), 'Please enter a valid email address.'));
            setIsSubmitting(stryMutAct_9fa48("17201") ? true : (stryCov_9fa48("17201"), false));
            return;
          }
        }
        try {
          if (stryMutAct_9fa48("17202")) {
            {}
          } else {
            stryCov_9fa48("17202");
            // Clear any existing session data
            localStorage.removeItem(stryMutAct_9fa48("17203") ? "" : (stryCov_9fa48("17203"), 'attendanceToken'));
            localStorage.removeItem(stryMutAct_9fa48("17204") ? "" : (stryCov_9fa48("17204"), 'attendanceUser'));
            const response = await fetch(stryMutAct_9fa48("17205") ? `` : (stryCov_9fa48("17205"), `${import.meta.env.VITE_API_URL}/api/attendance/login`), stryMutAct_9fa48("17206") ? {} : (stryCov_9fa48("17206"), {
              method: stryMutAct_9fa48("17207") ? "" : (stryCov_9fa48("17207"), 'POST'),
              headers: stryMutAct_9fa48("17208") ? {} : (stryCov_9fa48("17208"), {
                'Content-Type': stryMutAct_9fa48("17209") ? "" : (stryCov_9fa48("17209"), 'application/json')
              }),
              body: JSON.stringify(stryMutAct_9fa48("17210") ? {} : (stryCov_9fa48("17210"), {
                email: stryMutAct_9fa48("17212") ? email.toLowerCase() : stryMutAct_9fa48("17211") ? email.trim().toUpperCase() : (stryCov_9fa48("17211", "17212"), email.trim().toLowerCase()),
                password: password
              }))
            }));
            const data = await response.json();
            if (stryMutAct_9fa48("17215") ? false : stryMutAct_9fa48("17214") ? true : stryMutAct_9fa48("17213") ? response.ok : (stryCov_9fa48("17213", "17214", "17215"), !response.ok)) {
              if (stryMutAct_9fa48("17216")) {
                {}
              } else {
                stryCov_9fa48("17216");
                // Handle specific error cases with user-friendly messages
                if (stryMutAct_9fa48("17219") ? response.status !== 400 : stryMutAct_9fa48("17218") ? false : stryMutAct_9fa48("17217") ? true : (stryCov_9fa48("17217", "17218", "17219"), response.status === 400)) {
                  if (stryMutAct_9fa48("17220")) {
                    {}
                  } else {
                    stryCov_9fa48("17220");
                    setError(stryMutAct_9fa48("17223") ? data.error && 'Please check your input and try again.' : stryMutAct_9fa48("17222") ? false : stryMutAct_9fa48("17221") ? true : (stryCov_9fa48("17221", "17222", "17223"), data.error || (stryMutAct_9fa48("17224") ? "" : (stryCov_9fa48("17224"), 'Please check your input and try again.'))));
                  }
                } else if (stryMutAct_9fa48("17227") ? response.status !== 401 : stryMutAct_9fa48("17226") ? false : stryMutAct_9fa48("17225") ? true : (stryCov_9fa48("17225", "17226", "17227"), response.status === 401)) {
                  if (stryMutAct_9fa48("17228")) {
                    {}
                  } else {
                    stryCov_9fa48("17228");
                    setError(stryMutAct_9fa48("17229") ? "" : (stryCov_9fa48("17229"), 'Invalid email or password. Please try again.'));
                  }
                } else if (stryMutAct_9fa48("17232") ? response.status !== 403 : stryMutAct_9fa48("17231") ? false : stryMutAct_9fa48("17230") ? true : (stryCov_9fa48("17230", "17231", "17232"), response.status === 403)) {
                  if (stryMutAct_9fa48("17233")) {
                    {}
                  } else {
                    stryCov_9fa48("17233");
                    if (stryMutAct_9fa48("17235") ? false : stryMutAct_9fa48("17234") ? true : (stryCov_9fa48("17234", "17235"), data.needsVerification)) {
                      if (stryMutAct_9fa48("17236")) {
                        {}
                      } else {
                        stryCov_9fa48("17236");
                        setError(stryMutAct_9fa48("17237") ? "" : (stryCov_9fa48("17237"), 'Please verify your email address before logging in.'));
                      }
                    } else if (stryMutAct_9fa48("17240") ? data.error.includes('Admin or staff privileges') : stryMutAct_9fa48("17239") ? false : stryMutAct_9fa48("17238") ? true : (stryCov_9fa48("17238", "17239", "17240"), data.error?.includes(stryMutAct_9fa48("17241") ? "" : (stryCov_9fa48("17241"), 'Admin or staff privileges')))) {
                      if (stryMutAct_9fa48("17242")) {
                        {}
                      } else {
                        stryCov_9fa48("17242");
                        setError(stryMutAct_9fa48("17243") ? "" : (stryCov_9fa48("17243"), 'Access denied. Admin or staff privileges required for attendance management.'));
                      }
                    } else {
                      if (stryMutAct_9fa48("17244")) {
                        {}
                      } else {
                        stryCov_9fa48("17244");
                        setError(stryMutAct_9fa48("17245") ? "" : (stryCov_9fa48("17245"), 'Access denied. Please contact your administrator.'));
                      }
                    }
                  }
                } else if (stryMutAct_9fa48("17248") ? response.status !== 500 : stryMutAct_9fa48("17247") ? false : stryMutAct_9fa48("17246") ? true : (stryCov_9fa48("17246", "17247", "17248"), response.status === 500)) {
                  if (stryMutAct_9fa48("17249")) {
                    {}
                  } else {
                    stryCov_9fa48("17249");
                    setError(stryMutAct_9fa48("17250") ? "" : (stryCov_9fa48("17250"), 'Server error. Please try again later.'));
                  }
                } else {
                  if (stryMutAct_9fa48("17251")) {
                    {}
                  } else {
                    stryCov_9fa48("17251");
                    setError(stryMutAct_9fa48("17254") ? data.error && 'An error occurred. Please try again.' : stryMutAct_9fa48("17253") ? false : stryMutAct_9fa48("17252") ? true : (stryCov_9fa48("17252", "17253", "17254"), data.error || (stryMutAct_9fa48("17255") ? "" : (stryCov_9fa48("17255"), 'An error occurred. Please try again.'))));
                  }
                }
                return;
              }
            }

            // Validate response data
            if (stryMutAct_9fa48("17258") ? !data.token && !data.user : stryMutAct_9fa48("17257") ? false : stryMutAct_9fa48("17256") ? true : (stryCov_9fa48("17256", "17257", "17258"), (stryMutAct_9fa48("17259") ? data.token : (stryCov_9fa48("17259"), !data.token)) || (stryMutAct_9fa48("17260") ? data.user : (stryCov_9fa48("17260"), !data.user)))) {
              if (stryMutAct_9fa48("17261")) {
                {}
              } else {
                stryCov_9fa48("17261");
                setError(stryMutAct_9fa48("17262") ? "" : (stryCov_9fa48("17262"), 'Invalid response from server. Please try again.'));
                return;
              }
            }

            // Validate JWT token using utility function
            const tokenValidation = validateToken(data.token);
            if (stryMutAct_9fa48("17265") ? false : stryMutAct_9fa48("17264") ? true : stryMutAct_9fa48("17263") ? tokenValidation.isValid : (stryCov_9fa48("17263", "17264", "17265"), !tokenValidation.isValid)) {
              if (stryMutAct_9fa48("17266")) {
                {}
              } else {
                stryCov_9fa48("17266");
                setError(stryMutAct_9fa48("17269") ? tokenValidation.error && 'Invalid authentication token.' : stryMutAct_9fa48("17268") ? false : stryMutAct_9fa48("17267") ? true : (stryCov_9fa48("17267", "17268", "17269"), tokenValidation.error || (stryMutAct_9fa48("17270") ? "" : (stryCov_9fa48("17270"), 'Invalid authentication token.'))));
                return;
              }
            }

            // Store attendance token and user data securely using utility
            const storageSuccess = storeAuthData(data.token, data.user);
            if (stryMutAct_9fa48("17273") ? false : stryMutAct_9fa48("17272") ? true : stryMutAct_9fa48("17271") ? storageSuccess : (stryCov_9fa48("17271", "17272", "17273"), !storageSuccess)) {
              if (stryMutAct_9fa48("17274")) {
                {}
              } else {
                stryCov_9fa48("17274");
                setError(stryMutAct_9fa48("17275") ? "" : (stryCov_9fa48("17275"), 'Unable to save session data. Please try again.'));
                return;
              }
            }

            // Show success message and prepare for redirect
            setSuccessMessage(stryMutAct_9fa48("17276") ? "" : (stryCov_9fa48("17276"), 'Authentication successful! Redirecting to dashboard...'));
            setIsRedirecting(stryMutAct_9fa48("17277") ? false : (stryCov_9fa48("17277"), true));

            // Clear form
            setEmail(stryMutAct_9fa48("17278") ? "Stryker was here!" : (stryCov_9fa48("17278"), ''));
            setPassword(stryMutAct_9fa48("17279") ? "Stryker was here!" : (stryCov_9fa48("17279"), ''));

            // Redirect after brief delay to show success message
            setTimeout(() => {
              if (stryMutAct_9fa48("17280")) {
                {}
              } else {
                stryCov_9fa48("17280");
                try {
                  if (stryMutAct_9fa48("17281")) {
                    {}
                  } else {
                    stryCov_9fa48("17281");
                    const redirectPath = stryMutAct_9fa48("17284") ? data.redirectTo && '/attendance-dashboard' : stryMutAct_9fa48("17283") ? false : stryMutAct_9fa48("17282") ? true : (stryCov_9fa48("17282", "17283", "17284"), data.redirectTo || (stryMutAct_9fa48("17285") ? "" : (stryCov_9fa48("17285"), '/attendance-dashboard')));
                    navigate(redirectPath, stryMutAct_9fa48("17286") ? {} : (stryCov_9fa48("17286"), {
                      replace: stryMutAct_9fa48("17287") ? false : (stryCov_9fa48("17287"), true)
                    }));
                  }
                } catch (redirectError) {
                  if (stryMutAct_9fa48("17288")) {
                    {}
                  } else {
                    stryCov_9fa48("17288");
                    console.error(stryMutAct_9fa48("17289") ? "" : (stryCov_9fa48("17289"), 'Redirect error:'), redirectError);
                    setError(stryMutAct_9fa48("17290") ? "" : (stryCov_9fa48("17290"), 'Redirect failed. Please try navigating manually.'));
                    setIsRedirecting(stryMutAct_9fa48("17291") ? true : (stryCov_9fa48("17291"), false));
                  }
                }
              }
            }, 1500);
          }
        } catch (err) {
          if (stryMutAct_9fa48("17292")) {
            {}
          } else {
            stryCov_9fa48("17292");
            console.error(stryMutAct_9fa48("17293") ? "" : (stryCov_9fa48("17293"), 'Attendance login error:'), err);

            // Handle network errors
            if (stryMutAct_9fa48("17296") ? err.name === 'TypeError' || err.message.includes('fetch') : stryMutAct_9fa48("17295") ? false : stryMutAct_9fa48("17294") ? true : (stryCov_9fa48("17294", "17295", "17296"), (stryMutAct_9fa48("17298") ? err.name !== 'TypeError' : stryMutAct_9fa48("17297") ? true : (stryCov_9fa48("17297", "17298"), err.name === (stryMutAct_9fa48("17299") ? "" : (stryCov_9fa48("17299"), 'TypeError')))) && err.message.includes(stryMutAct_9fa48("17300") ? "" : (stryCov_9fa48("17300"), 'fetch')))) {
              if (stryMutAct_9fa48("17301")) {
                {}
              } else {
                stryCov_9fa48("17301");
                setError(stryMutAct_9fa48("17302") ? "" : (stryCov_9fa48("17302"), 'Network error. Please check your connection and try again.'));
              }
            } else {
              if (stryMutAct_9fa48("17303")) {
                {}
              } else {
                stryCov_9fa48("17303");
                setError(stryMutAct_9fa48("17304") ? "" : (stryCov_9fa48("17304"), 'An unexpected error occurred. Please try again.'));
              }
            }
          }
        } finally {
          if (stryMutAct_9fa48("17305")) {
            {}
          } else {
            stryCov_9fa48("17305");
            setIsSubmitting(stryMutAct_9fa48("17306") ? true : (stryCov_9fa48("17306"), false));
          }
        }
      }
    };

    // Handle form reset
    const handleReset = () => {
      if (stryMutAct_9fa48("17307")) {
        {}
      } else {
        stryCov_9fa48("17307");
        setEmail(stryMutAct_9fa48("17308") ? "Stryker was here!" : (stryCov_9fa48("17308"), ''));
        setPassword(stryMutAct_9fa48("17309") ? "Stryker was here!" : (stryCov_9fa48("17309"), ''));
        setError(stryMutAct_9fa48("17310") ? "Stryker was here!" : (stryCov_9fa48("17310"), ''));
        setSuccessMessage(stryMutAct_9fa48("17311") ? "Stryker was here!" : (stryCov_9fa48("17311"), ''));
        setIsSubmitting(stryMutAct_9fa48("17312") ? true : (stryCov_9fa48("17312"), false));
        setIsRedirecting(stryMutAct_9fa48("17313") ? true : (stryCov_9fa48("17313"), false));
      }
    };
    return <div className="attendance-login-container">
      <div className="attendance-login-form-container">
        <div className="attendance-login-logo-container">
          <img src={logoFull} alt="Pursuit Logo" className="attendance-login-logo" />
        </div>
        
        <div className="attendance-login-headline">
          <h1>ATTENDANCE<br />MANAGEMENT<br />SYSTEM</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="attendance-login-form">
          {stryMutAct_9fa48("17316") ? error || <div className="attendance-login-error">{error}</div> : stryMutAct_9fa48("17315") ? false : stryMutAct_9fa48("17314") ? true : (stryCov_9fa48("17314", "17315", "17316"), error && <div className="attendance-login-error">{error}</div>)}
          {stryMutAct_9fa48("17319") ? successMessage || <div className={`attendance-login-success ${isRedirecting ? 'redirecting' : ''}`}>
              {successMessage}
              {isRedirecting && <div className="redirect-spinner"></div>}
            </div> : stryMutAct_9fa48("17318") ? false : stryMutAct_9fa48("17317") ? true : (stryCov_9fa48("17317", "17318", "17319"), successMessage && <div className={stryMutAct_9fa48("17320") ? `` : (stryCov_9fa48("17320"), `attendance-login-success ${isRedirecting ? stryMutAct_9fa48("17321") ? "" : (stryCov_9fa48("17321"), 'redirecting') : stryMutAct_9fa48("17322") ? "Stryker was here!" : (stryCov_9fa48("17322"), '')}`)}>
              {successMessage}
              {stryMutAct_9fa48("17325") ? isRedirecting || <div className="redirect-spinner"></div> : stryMutAct_9fa48("17324") ? false : stryMutAct_9fa48("17323") ? true : (stryCov_9fa48("17323", "17324", "17325"), isRedirecting && <div className="redirect-spinner"></div>)}
            </div>)}
          
          <div className="attendance-login-input-group">
            <input type="email" value={email} onChange={stryMutAct_9fa48("17326") ? () => undefined : (stryCov_9fa48("17326"), e => setEmail(e.target.value))} placeholder="Admin Email" required className="attendance-login-input" disabled={stryMutAct_9fa48("17329") ? isSubmitting && isRedirecting : stryMutAct_9fa48("17328") ? false : stryMutAct_9fa48("17327") ? true : (stryCov_9fa48("17327", "17328", "17329"), isSubmitting || isRedirecting)} aria-label="Admin email address" />
          </div>
          
          <div className="attendance-login-input-group password-input-group">
            <input type={showPassword ? stryMutAct_9fa48("17330") ? "" : (stryCov_9fa48("17330"), "text") : stryMutAct_9fa48("17331") ? "" : (stryCov_9fa48("17331"), "password")} value={password} onChange={stryMutAct_9fa48("17332") ? () => undefined : (stryCov_9fa48("17332"), e => setPassword(e.target.value))} placeholder="Password" required className="attendance-login-input" disabled={stryMutAct_9fa48("17335") ? isSubmitting && isRedirecting : stryMutAct_9fa48("17334") ? false : stryMutAct_9fa48("17333") ? true : (stryCov_9fa48("17333", "17334", "17335"), isSubmitting || isRedirecting)} aria-label="Admin password" />
            <button type="button" className="password-toggle" onClick={stryMutAct_9fa48("17336") ? () => undefined : (stryCov_9fa48("17336"), () => setShowPassword(stryMutAct_9fa48("17337") ? showPassword : (stryCov_9fa48("17337"), !showPassword)))} disabled={stryMutAct_9fa48("17340") ? isSubmitting && isRedirecting : stryMutAct_9fa48("17339") ? false : stryMutAct_9fa48("17338") ? true : (stryCov_9fa48("17338", "17339", "17340"), isSubmitting || isRedirecting)} aria-label={showPassword ? stryMutAct_9fa48("17341") ? "" : (stryCov_9fa48("17341"), "Hide password") : stryMutAct_9fa48("17342") ? "" : (stryCov_9fa48("17342"), "Show password")}>
              {showPassword ? stryMutAct_9fa48("17343") ? "" : (stryCov_9fa48("17343"), "Hide") : stryMutAct_9fa48("17344") ? "" : (stryCov_9fa48("17344"), "Show")}
            </button>
          </div>
          
          <div className="attendance-login-button-group">
            <button type="submit" className="attendance-login-button" disabled={stryMutAct_9fa48("17347") ? isSubmitting && isRedirecting : stryMutAct_9fa48("17346") ? false : stryMutAct_9fa48("17345") ? true : (stryCov_9fa48("17345", "17346", "17347"), isSubmitting || isRedirecting)} aria-label="Sign in to attendance system">
              {isSubmitting ? <>
                  <span className="button-spinner"></span>
                  Signing In...
                </> : isRedirecting ? stryMutAct_9fa48("17348") ? "" : (stryCov_9fa48("17348"), 'Redirecting...') : stryMutAct_9fa48("17349") ? "" : (stryCov_9fa48("17349"), 'Sign In')}
            </button>
            
            {stryMutAct_9fa48("17352") ? !isSubmitting && !isRedirecting || <button type="button" className="attendance-login-reset-button" onClick={handleReset} aria-label="Clear form">
                Clear Form
              </button> : stryMutAct_9fa48("17351") ? false : stryMutAct_9fa48("17350") ? true : (stryCov_9fa48("17350", "17351", "17352"), (stryMutAct_9fa48("17354") ? !isSubmitting || !isRedirecting : stryMutAct_9fa48("17353") ? true : (stryCov_9fa48("17353", "17354"), (stryMutAct_9fa48("17355") ? isSubmitting : (stryCov_9fa48("17355"), !isSubmitting)) && (stryMutAct_9fa48("17356") ? isRedirecting : (stryCov_9fa48("17356"), !isRedirecting)))) && <button type="button" className="attendance-login-reset-button" onClick={handleReset} aria-label="Clear form">
                Clear Form
              </button>)}
          </div>
        </form>
        
        <div className="attendance-login-footer">
          <p>Staff and admin access only</p>
          <p className="attendance-login-help">
            Having trouble? Contact your system administrator
          </p>
        </div>
      </div>
    </div>;
  }
};
export default AttendanceLogin;