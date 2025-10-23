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
import { useParams, useNavigate, Link } from 'react-router-dom';
import logoFull from '../../assets/logo-full.png';
import './VerifyEmail.css';
const VerifyEmail = () => {
  if (stryMutAct_9fa48("23541")) {
    {}
  } else {
    stryCov_9fa48("23541");
    const [verifying, setVerifying] = useState(stryMutAct_9fa48("23542") ? false : (stryCov_9fa48("23542"), true));
    const [success, setSuccess] = useState(stryMutAct_9fa48("23543") ? true : (stryCov_9fa48("23543"), false));
    const [error, setError] = useState(stryMutAct_9fa48("23544") ? "Stryker was here!" : (stryCov_9fa48("23544"), ''));
    const {
      token
    } = useParams();
    const navigate = useNavigate();
    useEffect(() => {
      if (stryMutAct_9fa48("23545")) {
        {}
      } else {
        stryCov_9fa48("23545");
        const verifyEmail = async () => {
          if (stryMutAct_9fa48("23546")) {
            {}
          } else {
            stryCov_9fa48("23546");
            try {
              if (stryMutAct_9fa48("23547")) {
                {}
              } else {
                stryCov_9fa48("23547");
                const response = await fetch(stryMutAct_9fa48("23548") ? `` : (stryCov_9fa48("23548"), `${import.meta.env.VITE_API_URL}/api/users/verify-email/${token}`), stryMutAct_9fa48("23549") ? {} : (stryCov_9fa48("23549"), {
                  method: stryMutAct_9fa48("23550") ? "" : (stryCov_9fa48("23550"), 'GET'),
                  headers: stryMutAct_9fa48("23551") ? {} : (stryCov_9fa48("23551"), {
                    'Content-Type': stryMutAct_9fa48("23552") ? "" : (stryCov_9fa48("23552"), 'application/json')
                  })
                }));
                const data = await response.json();
                if (stryMutAct_9fa48("23554") ? false : stryMutAct_9fa48("23553") ? true : (stryCov_9fa48("23553", "23554"), response.ok)) {
                  if (stryMutAct_9fa48("23555")) {
                    {}
                  } else {
                    stryCov_9fa48("23555");
                    setSuccess(stryMutAct_9fa48("23556") ? false : (stryCov_9fa48("23556"), true));

                    // Store token in localStorage
                    if (stryMutAct_9fa48("23558") ? false : stryMutAct_9fa48("23557") ? true : (stryCov_9fa48("23557", "23558"), data.token)) {
                      if (stryMutAct_9fa48("23559")) {
                        {}
                      } else {
                        stryCov_9fa48("23559");
                        localStorage.setItem(stryMutAct_9fa48("23560") ? "" : (stryCov_9fa48("23560"), 'authToken'), data.token);

                        // Redirect to dashboard after a short delay
                        setTimeout(() => {
                          if (stryMutAct_9fa48("23561")) {
                            {}
                          } else {
                            stryCov_9fa48("23561");
                            navigate(stryMutAct_9fa48("23562") ? "" : (stryCov_9fa48("23562"), '/dashboard'));
                          }
                        }, 3000);
                      }
                    }
                  }
                } else {
                  if (stryMutAct_9fa48("23563")) {
                    {}
                  } else {
                    stryCov_9fa48("23563");
                    setError(stryMutAct_9fa48("23566") ? data.error && 'Verification failed' : stryMutAct_9fa48("23565") ? false : stryMutAct_9fa48("23564") ? true : (stryCov_9fa48("23564", "23565", "23566"), data.error || (stryMutAct_9fa48("23567") ? "" : (stryCov_9fa48("23567"), 'Verification failed'))));
                  }
                }
              }
            } catch (err) {
              if (stryMutAct_9fa48("23568")) {
                {}
              } else {
                stryCov_9fa48("23568");
                setError(stryMutAct_9fa48("23569") ? "" : (stryCov_9fa48("23569"), 'An unexpected error occurred'));
                console.error(err);
              }
            } finally {
              if (stryMutAct_9fa48("23570")) {
                {}
              } else {
                stryCov_9fa48("23570");
                setVerifying(stryMutAct_9fa48("23571") ? true : (stryCov_9fa48("23571"), false));
              }
            }
          }
        };
        if (stryMutAct_9fa48("23573") ? false : stryMutAct_9fa48("23572") ? true : (stryCov_9fa48("23572", "23573"), token)) {
          if (stryMutAct_9fa48("23574")) {
            {}
          } else {
            stryCov_9fa48("23574");
            verifyEmail();
          }
        } else {
          if (stryMutAct_9fa48("23575")) {
            {}
          } else {
            stryCov_9fa48("23575");
            setVerifying(stryMutAct_9fa48("23576") ? true : (stryCov_9fa48("23576"), false));
            setError(stryMutAct_9fa48("23577") ? "" : (stryCov_9fa48("23577"), 'Invalid verification link'));
          }
        }
      }
    }, stryMutAct_9fa48("23578") ? [] : (stryCov_9fa48("23578"), [token, navigate]));
    return <div className="verify-email-container">
      <div className="verify-email-form-container">
        <div className="verify-email-logo-container">
          <img src={logoFull} alt="Pursuit Logo" className="verify-email-logo" />
        </div>
        
        <div className="verify-email-headline">
          <h1>EMAIL<br />VERIFICATION</h1>
        </div>
        
        <div className="verify-email-content">
          {verifying ? <div className="verify-email-message">
              <p>Verifying your email address...</p>
              <div className="verify-email-spinner"></div>
            </div> : success ? <div className="verify-email-success">
              <p>Your email has been verified successfully!</p>
              <p>You will be redirected to the dashboard shortly...</p>
              <Link to="/dashboard" className="verify-email-button">Go to Dashboard</Link>
            </div> : <div className="verify-email-error">
              <p>{error}</p>
              {stryMutAct_9fa48("23581") ? error.includes('expired') || <div className="verify-email-resend">
                  <p>Would you like to request a new verification link?</p>
                  <Link to="/resend-verification" className="verify-email-button">Resend Verification</Link>
                </div> : stryMutAct_9fa48("23580") ? false : stryMutAct_9fa48("23579") ? true : (stryCov_9fa48("23579", "23580", "23581"), error.includes(stryMutAct_9fa48("23582") ? "" : (stryCov_9fa48("23582"), 'expired')) && <div className="verify-email-resend">
                  <p>Would you like to request a new verification link?</p>
                  <Link to="/resend-verification" className="verify-email-button">Resend Verification</Link>
                </div>)}
              <Link to="/login" className="verify-email-link">Back to Login</Link>
            </div>}
        </div>
      </div>
    </div>;
  }
};
export default VerifyEmail;