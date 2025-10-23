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
import { useState } from 'react';
import { Link } from 'react-router-dom';
import logoFull from '../../assets/logo-full.png';
import './ForgotPassword.css';
const ForgotPassword = () => {
  if (stryMutAct_9fa48("23309")) {
    {}
  } else {
    stryCov_9fa48("23309");
    const [email, setEmail] = useState(stryMutAct_9fa48("23310") ? "Stryker was here!" : (stryCov_9fa48("23310"), ''));
    const [isSubmitting, setIsSubmitting] = useState(stryMutAct_9fa48("23311") ? true : (stryCov_9fa48("23311"), false));
    const [message, setMessage] = useState(stryMutAct_9fa48("23312") ? "Stryker was here!" : (stryCov_9fa48("23312"), ''));
    const [error, setError] = useState(stryMutAct_9fa48("23313") ? "Stryker was here!" : (stryCov_9fa48("23313"), ''));
    const [isSuccess, setIsSuccess] = useState(stryMutAct_9fa48("23314") ? true : (stryCov_9fa48("23314"), false));
    const handleSubmit = async e => {
      if (stryMutAct_9fa48("23315")) {
        {}
      } else {
        stryCov_9fa48("23315");
        e.preventDefault();
        setError(stryMutAct_9fa48("23316") ? "Stryker was here!" : (stryCov_9fa48("23316"), ''));
        setMessage(stryMutAct_9fa48("23317") ? "Stryker was here!" : (stryCov_9fa48("23317"), ''));
        setIsSubmitting(stryMutAct_9fa48("23318") ? false : (stryCov_9fa48("23318"), true));
        try {
          if (stryMutAct_9fa48("23319")) {
            {}
          } else {
            stryCov_9fa48("23319");
            const response = await fetch(stryMutAct_9fa48("23320") ? `` : (stryCov_9fa48("23320"), `${import.meta.env.VITE_API_URL}/api/users/forgot-password`), stryMutAct_9fa48("23321") ? {} : (stryCov_9fa48("23321"), {
              method: stryMutAct_9fa48("23322") ? "" : (stryCov_9fa48("23322"), 'POST'),
              headers: stryMutAct_9fa48("23323") ? {} : (stryCov_9fa48("23323"), {
                'Content-Type': stryMutAct_9fa48("23324") ? "" : (stryCov_9fa48("23324"), 'application/json')
              }),
              body: JSON.stringify(stryMutAct_9fa48("23325") ? {} : (stryCov_9fa48("23325"), {
                email
              }))
            }));
            const data = await response.json();
            if (stryMutAct_9fa48("23327") ? false : stryMutAct_9fa48("23326") ? true : (stryCov_9fa48("23326", "23327"), response.ok)) {
              if (stryMutAct_9fa48("23328")) {
                {}
              } else {
                stryCov_9fa48("23328");
                setIsSuccess(stryMutAct_9fa48("23329") ? false : (stryCov_9fa48("23329"), true));
                setMessage(stryMutAct_9fa48("23332") ? data.message && 'If an account exists with this email, a password reset link will be sent.' : stryMutAct_9fa48("23331") ? false : stryMutAct_9fa48("23330") ? true : (stryCov_9fa48("23330", "23331", "23332"), data.message || (stryMutAct_9fa48("23333") ? "" : (stryCov_9fa48("23333"), 'If an account exists with this email, a password reset link will be sent.'))));
              }
            } else {
              if (stryMutAct_9fa48("23334")) {
                {}
              } else {
                stryCov_9fa48("23334");
                setError(stryMutAct_9fa48("23337") ? data.error && 'An error occurred. Please try again.' : stryMutAct_9fa48("23336") ? false : stryMutAct_9fa48("23335") ? true : (stryCov_9fa48("23335", "23336", "23337"), data.error || (stryMutAct_9fa48("23338") ? "" : (stryCov_9fa48("23338"), 'An error occurred. Please try again.'))));
              }
            }
          }
        } catch (err) {
          if (stryMutAct_9fa48("23339")) {
            {}
          } else {
            stryCov_9fa48("23339");
            setError(stryMutAct_9fa48("23340") ? "" : (stryCov_9fa48("23340"), 'An unexpected error occurred. Please try again.'));
            console.error(err);
          }
        } finally {
          if (stryMutAct_9fa48("23341")) {
            {}
          } else {
            stryCov_9fa48("23341");
            setIsSubmitting(stryMutAct_9fa48("23342") ? true : (stryCov_9fa48("23342"), false));
          }
        }
      }
    };
    return <div className="forgot-password-container">
      <div className="forgot-password-form-container">
        <div className="forgot-password-logo-container">
          <img src={logoFull} alt="Pursuit Logo" className="forgot-password-logo" />
        </div>
        
        <div className="forgot-password-headline">
          <h1>FORGOT YOUR<br />PASSWORD?</h1>
        </div>
        
        {isSuccess ? <div className="forgot-password-success">
            <p>{message}</p>
            <Link to="/login" className="forgot-password-button">Back to Login</Link>
          </div> : <form onSubmit={handleSubmit} className="forgot-password-form">
            {stryMutAct_9fa48("23345") ? error || <div className="forgot-password-error">{error}</div> : stryMutAct_9fa48("23344") ? false : stryMutAct_9fa48("23343") ? true : (stryCov_9fa48("23343", "23344", "23345"), error && <div className="forgot-password-error">{error}</div>)}
            {stryMutAct_9fa48("23348") ? message || <div className="forgot-password-message">{message}</div> : stryMutAct_9fa48("23347") ? false : stryMutAct_9fa48("23346") ? true : (stryCov_9fa48("23346", "23347", "23348"), message && <div className="forgot-password-message">{message}</div>)}
            
            <p className="forgot-password-instructions">
              Enter your email address and we'll send you a link to reset your password.
            </p>
            
            <div className="forgot-password-input-group">
              <input type="email" value={email} onChange={stryMutAct_9fa48("23349") ? () => undefined : (stryCov_9fa48("23349"), e => setEmail(e.target.value))} placeholder="Email" required className="forgot-password-input" disabled={isSubmitting} />
            </div>
            
            <div className="forgot-password-links">
              <Link to="/login" className="forgot-password-link">Back to Login</Link>
            </div>
            
            <button type="submit" className="forgot-password-button" disabled={isSubmitting}>
              {isSubmitting ? stryMutAct_9fa48("23350") ? "" : (stryCov_9fa48("23350"), 'Sending...') : stryMutAct_9fa48("23351") ? "" : (stryCov_9fa48("23351"), 'Send Reset Link')}
            </button>
          </form>}
      </div>
    </div>;
  }
};
export default ForgotPassword;