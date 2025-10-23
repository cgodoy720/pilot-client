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
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import logoFull from '../../assets/logo-full.png';
import './ResetPassword.css';
const ResetPassword = () => {
  if (stryMutAct_9fa48("23460")) {
    {}
  } else {
    stryCov_9fa48("23460");
    const [password, setPassword] = useState(stryMutAct_9fa48("23461") ? "Stryker was here!" : (stryCov_9fa48("23461"), ''));
    const [confirmPassword, setConfirmPassword] = useState(stryMutAct_9fa48("23462") ? "Stryker was here!" : (stryCov_9fa48("23462"), ''));
    const [message, setMessage] = useState(stryMutAct_9fa48("23463") ? "Stryker was here!" : (stryCov_9fa48("23463"), ''));
    const [isLoading, setIsLoading] = useState(stryMutAct_9fa48("23464") ? true : (stryCov_9fa48("23464"), false));
    const [error, setError] = useState(stryMutAct_9fa48("23465") ? "Stryker was here!" : (stryCov_9fa48("23465"), ''));
    const [showPassword, setShowPassword] = useState(stryMutAct_9fa48("23466") ? true : (stryCov_9fa48("23466"), false));
    const [showConfirmPassword, setShowConfirmPassword] = useState(stryMutAct_9fa48("23467") ? true : (stryCov_9fa48("23467"), false));
    const {
      token
    } = useParams();
    const navigate = useNavigate();
    const handleSubmit = async e => {
      if (stryMutAct_9fa48("23468")) {
        {}
      } else {
        stryCov_9fa48("23468");
        e.preventDefault();
        if (stryMutAct_9fa48("23471") ? password === confirmPassword : stryMutAct_9fa48("23470") ? false : stryMutAct_9fa48("23469") ? true : (stryCov_9fa48("23469", "23470", "23471"), password !== confirmPassword)) {
          if (stryMutAct_9fa48("23472")) {
            {}
          } else {
            stryCov_9fa48("23472");
            setError(stryMutAct_9fa48("23473") ? "" : (stryCov_9fa48("23473"), 'Passwords do not match'));
            return;
          }
        }
        setIsLoading(stryMutAct_9fa48("23474") ? false : (stryCov_9fa48("23474"), true));
        setError(stryMutAct_9fa48("23475") ? "Stryker was here!" : (stryCov_9fa48("23475"), ''));
        setMessage(stryMutAct_9fa48("23476") ? "Stryker was here!" : (stryCov_9fa48("23476"), ''));
        try {
          if (stryMutAct_9fa48("23477")) {
            {}
          } else {
            stryCov_9fa48("23477");
            console.log(stryMutAct_9fa48("23478") ? "" : (stryCov_9fa48("23478"), 'Submitting reset request with token:'), token);

            // Try different token handling approaches
            const cleanToken = stryMutAct_9fa48("23479") ? token : (stryCov_9fa48("23479"), token.trim()); // Remove any whitespace

            // Try with URL encoding
            const encodedToken = encodeURIComponent(cleanToken);
            console.log(stryMutAct_9fa48("23480") ? "" : (stryCov_9fa48("23480"), 'Encoded token:'), encodedToken);
            const apiUrl = stryMutAct_9fa48("23481") ? `` : (stryCov_9fa48("23481"), `${import.meta.env.VITE_API_URL}/api/users/reset-password/${encodedToken}`);
            console.log(stryMutAct_9fa48("23482") ? "" : (stryCov_9fa48("23482"), 'API URL:'), apiUrl);

            // Check if the password meets the requirements
            const minLength = stryMutAct_9fa48("23486") ? password.length < 8 : stryMutAct_9fa48("23485") ? password.length > 8 : stryMutAct_9fa48("23484") ? false : stryMutAct_9fa48("23483") ? true : (stryCov_9fa48("23483", "23484", "23485", "23486"), password.length >= 8);
            const hasUpperCase = (stryMutAct_9fa48("23487") ? /[^A-Z]/ : (stryCov_9fa48("23487"), /[A-Z]/)).test(password);
            const hasLowerCase = (stryMutAct_9fa48("23488") ? /[^a-z]/ : (stryCov_9fa48("23488"), /[a-z]/)).test(password);
            const hasNumbers = (stryMutAct_9fa48("23489") ? /\D/ : (stryCov_9fa48("23489"), /\d/)).test(password);
            const hasSpecialChar = (stryMutAct_9fa48("23490") ? /[^@$!%*?&]/ : (stryCov_9fa48("23490"), /[@$!%*?&]/)).test(password);
            console.log(stryMutAct_9fa48("23491") ? "" : (stryCov_9fa48("23491"), 'Password validation:'), stryMutAct_9fa48("23492") ? {} : (stryCov_9fa48("23492"), {
              minLength,
              hasUpperCase,
              hasLowerCase,
              hasNumbers,
              hasSpecialChar
            }));
            const response = await fetch(apiUrl, stryMutAct_9fa48("23493") ? {} : (stryCov_9fa48("23493"), {
              method: stryMutAct_9fa48("23494") ? "" : (stryCov_9fa48("23494"), 'POST'),
              headers: stryMutAct_9fa48("23495") ? {} : (stryCov_9fa48("23495"), {
                'Content-Type': stryMutAct_9fa48("23496") ? "" : (stryCov_9fa48("23496"), 'application/json')
              }),
              body: JSON.stringify(stryMutAct_9fa48("23497") ? {} : (stryCov_9fa48("23497"), {
                password
              }))
            }));
            const data = await response.json();
            console.log(stryMutAct_9fa48("23498") ? "" : (stryCov_9fa48("23498"), 'Response status:'), response.status);
            console.log(stryMutAct_9fa48("23499") ? "" : (stryCov_9fa48("23499"), 'Response data:'), data);
            if (stryMutAct_9fa48("23501") ? false : stryMutAct_9fa48("23500") ? true : (stryCov_9fa48("23500", "23501"), response.ok)) {
              if (stryMutAct_9fa48("23502")) {
                {}
              } else {
                stryCov_9fa48("23502");
                setMessage(stryMutAct_9fa48("23505") ? data.message && 'Your password has been successfully reset.' : stryMutAct_9fa48("23504") ? false : stryMutAct_9fa48("23503") ? true : (stryCov_9fa48("23503", "23504", "23505"), data.message || (stryMutAct_9fa48("23506") ? "" : (stryCov_9fa48("23506"), 'Your password has been successfully reset.'))));
                // Redirect to login after 3 seconds
                setTimeout(() => {
                  if (stryMutAct_9fa48("23507")) {
                    {}
                  } else {
                    stryCov_9fa48("23507");
                    navigate(stryMutAct_9fa48("23508") ? "" : (stryCov_9fa48("23508"), '/login'));
                  }
                }, 3000);
              }
            } else {
              if (stryMutAct_9fa48("23509")) {
                {}
              } else {
                stryCov_9fa48("23509");
                setError(stryMutAct_9fa48("23512") ? data.error && 'An error occurred. Please try again.' : stryMutAct_9fa48("23511") ? false : stryMutAct_9fa48("23510") ? true : (stryCov_9fa48("23510", "23511", "23512"), data.error || (stryMutAct_9fa48("23513") ? "" : (stryCov_9fa48("23513"), 'An error occurred. Please try again.'))));
              }
            }
          }
        } catch (err) {
          if (stryMutAct_9fa48("23514")) {
            {}
          } else {
            stryCov_9fa48("23514");
            setError(stryMutAct_9fa48("23515") ? "" : (stryCov_9fa48("23515"), 'An error occurred. Please try again later.'));
            console.error(stryMutAct_9fa48("23516") ? "" : (stryCov_9fa48("23516"), 'Error details:'), err);
          }
        } finally {
          if (stryMutAct_9fa48("23517")) {
            {}
          } else {
            stryCov_9fa48("23517");
            setIsLoading(stryMutAct_9fa48("23518") ? true : (stryCov_9fa48("23518"), false));
          }
        }
      }
    };
    return <div className="reset-password-container">
            <div className="reset-password-form-container">
                <div className="reset-password-logo-container">
                    <img src={logoFull} alt="Pursuit Logo" className="reset-password-logo" />
                </div>
                
                <div className="reset-password-headline">
                    <h1>RESET YOUR<br />PASSWORD</h1>
                </div>
                
                <form onSubmit={handleSubmit} className="reset-password-form">
                    {stryMutAct_9fa48("23521") ? error || <div className="reset-password-error">{error}</div> : stryMutAct_9fa48("23520") ? false : stryMutAct_9fa48("23519") ? true : (stryCov_9fa48("23519", "23520", "23521"), error && <div className="reset-password-error">{error}</div>)}
                    {stryMutAct_9fa48("23524") ? message || <div className="reset-password-message">{message}</div> : stryMutAct_9fa48("23523") ? false : stryMutAct_9fa48("23522") ? true : (stryCov_9fa48("23522", "23523", "23524"), message && <div className="reset-password-message">{message}</div>)}
                    
                    <div className="reset-password-input-group">
                        <input type={showPassword ? stryMutAct_9fa48("23525") ? "" : (stryCov_9fa48("23525"), "text") : stryMutAct_9fa48("23526") ? "" : (stryCov_9fa48("23526"), "password")} value={password} onChange={stryMutAct_9fa48("23527") ? () => undefined : (stryCov_9fa48("23527"), e => setPassword(e.target.value))} placeholder="New Password" required className="reset-password-input" disabled={isLoading} minLength="8" pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$" title="Password must contain at least 8 characters, including uppercase, lowercase, number and special character (@$!%*?&)" />
                        <button type="button" className="password-toggle" onClick={stryMutAct_9fa48("23528") ? () => undefined : (stryCov_9fa48("23528"), () => setShowPassword(stryMutAct_9fa48("23529") ? showPassword : (stryCov_9fa48("23529"), !showPassword)))} aria-label={showPassword ? stryMutAct_9fa48("23530") ? "" : (stryCov_9fa48("23530"), "Hide password") : stryMutAct_9fa48("23531") ? "" : (stryCov_9fa48("23531"), "Show password")}>
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>
                    
                    <div className="password-requirements-hint">
                        Password must contain at least 8 characters, including uppercase, lowercase, number and special character (@$!%*?&)
                    </div>
                    
                    <div className="reset-password-input-group">
                        <input type={showConfirmPassword ? stryMutAct_9fa48("23532") ? "" : (stryCov_9fa48("23532"), "text") : stryMutAct_9fa48("23533") ? "" : (stryCov_9fa48("23533"), "password")} value={confirmPassword} onChange={stryMutAct_9fa48("23534") ? () => undefined : (stryCov_9fa48("23534"), e => setConfirmPassword(e.target.value))} placeholder="Confirm New Password" required className="reset-password-input" disabled={isLoading} minLength="8" />
                        <button type="button" className="password-toggle" onClick={stryMutAct_9fa48("23535") ? () => undefined : (stryCov_9fa48("23535"), () => setShowConfirmPassword(stryMutAct_9fa48("23536") ? showConfirmPassword : (stryCov_9fa48("23536"), !showConfirmPassword)))} aria-label={showConfirmPassword ? stryMutAct_9fa48("23537") ? "" : (stryCov_9fa48("23537"), "Hide password") : stryMutAct_9fa48("23538") ? "" : (stryCov_9fa48("23538"), "Show password")}>
                            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>
                    
                    <div className="reset-password-links">
                        <Link to="/login" className="reset-password-link">Back to Login</Link>
                    </div>
                    
                    <button type="submit" className="reset-password-button" disabled={isLoading}>
                        {isLoading ? stryMutAct_9fa48("23539") ? "" : (stryCov_9fa48("23539"), 'Resetting...') : stryMutAct_9fa48("23540") ? "" : (stryCov_9fa48("23540"), 'Reset Password')}
                    </button>
                </form>
            </div>
        </div>;
  }
};
export default ResetPassword;