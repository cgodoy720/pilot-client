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
import './ResendVerification.css';
const ResendVerification = () => {
  if (stryMutAct_9fa48("23417")) {
    {}
  } else {
    stryCov_9fa48("23417");
    const [email, setEmail] = useState(stryMutAct_9fa48("23418") ? "Stryker was here!" : (stryCov_9fa48("23418"), ''));
    const [isSubmitting, setIsSubmitting] = useState(stryMutAct_9fa48("23419") ? true : (stryCov_9fa48("23419"), false));
    const [message, setMessage] = useState(stryMutAct_9fa48("23420") ? "Stryker was here!" : (stryCov_9fa48("23420"), ''));
    const [error, setError] = useState(stryMutAct_9fa48("23421") ? "Stryker was here!" : (stryCov_9fa48("23421"), ''));
    const [isSuccess, setIsSuccess] = useState(stryMutAct_9fa48("23422") ? true : (stryCov_9fa48("23422"), false));
    const handleSubmit = async e => {
      if (stryMutAct_9fa48("23423")) {
        {}
      } else {
        stryCov_9fa48("23423");
        e.preventDefault();
        setError(stryMutAct_9fa48("23424") ? "Stryker was here!" : (stryCov_9fa48("23424"), ''));
        setMessage(stryMutAct_9fa48("23425") ? "Stryker was here!" : (stryCov_9fa48("23425"), ''));
        setIsSubmitting(stryMutAct_9fa48("23426") ? false : (stryCov_9fa48("23426"), true));
        try {
          if (stryMutAct_9fa48("23427")) {
            {}
          } else {
            stryCov_9fa48("23427");
            const response = await fetch(stryMutAct_9fa48("23428") ? `` : (stryCov_9fa48("23428"), `${import.meta.env.VITE_API_URL}/api/users/resend-verification`), stryMutAct_9fa48("23429") ? {} : (stryCov_9fa48("23429"), {
              method: stryMutAct_9fa48("23430") ? "" : (stryCov_9fa48("23430"), 'POST'),
              headers: stryMutAct_9fa48("23431") ? {} : (stryCov_9fa48("23431"), {
                'Content-Type': stryMutAct_9fa48("23432") ? "" : (stryCov_9fa48("23432"), 'application/json')
              }),
              body: JSON.stringify(stryMutAct_9fa48("23433") ? {} : (stryCov_9fa48("23433"), {
                email
              }))
            }));
            const data = await response.json();
            if (stryMutAct_9fa48("23435") ? false : stryMutAct_9fa48("23434") ? true : (stryCov_9fa48("23434", "23435"), response.ok)) {
              if (stryMutAct_9fa48("23436")) {
                {}
              } else {
                stryCov_9fa48("23436");
                setIsSuccess(stryMutAct_9fa48("23437") ? false : (stryCov_9fa48("23437"), true));
                setMessage(stryMutAct_9fa48("23440") ? data.message && 'If an account exists with this email, a verification link will be sent.' : stryMutAct_9fa48("23439") ? false : stryMutAct_9fa48("23438") ? true : (stryCov_9fa48("23438", "23439", "23440"), data.message || (stryMutAct_9fa48("23441") ? "" : (stryCov_9fa48("23441"), 'If an account exists with this email, a verification link will be sent.'))));
              }
            } else {
              if (stryMutAct_9fa48("23442")) {
                {}
              } else {
                stryCov_9fa48("23442");
                setError(stryMutAct_9fa48("23445") ? data.error && 'An error occurred. Please try again.' : stryMutAct_9fa48("23444") ? false : stryMutAct_9fa48("23443") ? true : (stryCov_9fa48("23443", "23444", "23445"), data.error || (stryMutAct_9fa48("23446") ? "" : (stryCov_9fa48("23446"), 'An error occurred. Please try again.'))));
              }
            }
          }
        } catch (err) {
          if (stryMutAct_9fa48("23447")) {
            {}
          } else {
            stryCov_9fa48("23447");
            setError(stryMutAct_9fa48("23448") ? "" : (stryCov_9fa48("23448"), 'An unexpected error occurred. Please try again.'));
            console.error(err);
          }
        } finally {
          if (stryMutAct_9fa48("23449")) {
            {}
          } else {
            stryCov_9fa48("23449");
            setIsSubmitting(stryMutAct_9fa48("23450") ? true : (stryCov_9fa48("23450"), false));
          }
        }
      }
    };
    return <div className="resend-verification-container">
      <div className="resend-verification-form-container">
        <div className="resend-verification-logo-container">
          <img src={logoFull} alt="Pursuit Logo" className="resend-verification-logo" />
        </div>
        
        <div className="resend-verification-headline">
          <h1>RESEND<br />VERIFICATION</h1>
        </div>
        
        {isSuccess ? <div className="resend-verification-success">
            <p>{message}</p>
            <Link to="/login" className="resend-verification-button">Back to Login</Link>
          </div> : <form onSubmit={handleSubmit} className="resend-verification-form">
            {stryMutAct_9fa48("23453") ? error || <div className="resend-verification-error">{error}</div> : stryMutAct_9fa48("23452") ? false : stryMutAct_9fa48("23451") ? true : (stryCov_9fa48("23451", "23452", "23453"), error && <div className="resend-verification-error">{error}</div>)}
            {stryMutAct_9fa48("23456") ? message || <div className="resend-verification-message">{message}</div> : stryMutAct_9fa48("23455") ? false : stryMutAct_9fa48("23454") ? true : (stryCov_9fa48("23454", "23455", "23456"), message && <div className="resend-verification-message">{message}</div>)}
            
            <p className="resend-verification-instructions">
              Enter your email address and we'll send you another verification link.
            </p>
            
            <div className="resend-verification-input-group">
              <input type="email" value={email} onChange={stryMutAct_9fa48("23457") ? () => undefined : (stryCov_9fa48("23457"), e => setEmail(e.target.value))} placeholder="Email" required className="resend-verification-input" disabled={isSubmitting} />
            </div>
            
            <div className="resend-verification-links">
              <Link to="/login" className="resend-verification-link">Back to Login</Link>
            </div>
            
            <button type="submit" className="resend-verification-button" disabled={isSubmitting}>
              {isSubmitting ? stryMutAct_9fa48("23458") ? "" : (stryCov_9fa48("23458"), 'Sending...') : stryMutAct_9fa48("23459") ? "" : (stryCov_9fa48("23459"), 'Resend Verification Link')}
            </button>
          </form>}
      </div>
    </div>;
  }
};
export default ResendVerification;