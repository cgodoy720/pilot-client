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
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logoFull from '../../assets/logo-full.png';
import './Login.css';
const Login = () => {
  if (stryMutAct_9fa48("23352")) {
    {}
  } else {
    stryCov_9fa48("23352");
    const [email, setEmail] = useState(stryMutAct_9fa48("23353") ? "Stryker was here!" : (stryCov_9fa48("23353"), ''));
    const [password, setPassword] = useState(stryMutAct_9fa48("23354") ? "Stryker was here!" : (stryCov_9fa48("23354"), ''));
    const [showPassword, setShowPassword] = useState(stryMutAct_9fa48("23355") ? true : (stryCov_9fa48("23355"), false));
    const [error, setError] = useState(stryMutAct_9fa48("23356") ? "Stryker was here!" : (stryCov_9fa48("23356"), ''));
    const [isSubmitting, setIsSubmitting] = useState(stryMutAct_9fa48("23357") ? true : (stryCov_9fa48("23357"), false));
    const [needsVerification, setNeedsVerification] = useState(stryMutAct_9fa48("23358") ? true : (stryCov_9fa48("23358"), false));
    const navigate = useNavigate();
    const {
      login,
      isAuthenticated,
      setAuthState
    } = useAuth();

    // Redirect if already authenticated
    if (stryMutAct_9fa48("23360") ? false : stryMutAct_9fa48("23359") ? true : (stryCov_9fa48("23359", "23360"), isAuthenticated)) {
      if (stryMutAct_9fa48("23361")) {
        {}
      } else {
        stryCov_9fa48("23361");
        navigate(stryMutAct_9fa48("23362") ? "" : (stryCov_9fa48("23362"), '/dashboard'));
        return null;
      }
    }
    const handleSubmit = async e => {
      if (stryMutAct_9fa48("23363")) {
        {}
      } else {
        stryCov_9fa48("23363");
        e.preventDefault();
        setError(stryMutAct_9fa48("23364") ? "Stryker was here!" : (stryCov_9fa48("23364"), ''));
        setNeedsVerification(stryMutAct_9fa48("23365") ? true : (stryCov_9fa48("23365"), false));
        setIsSubmitting(stryMutAct_9fa48("23366") ? false : (stryCov_9fa48("23366"), true));
        try {
          if (stryMutAct_9fa48("23367")) {
            {}
          } else {
            stryCov_9fa48("23367");
            const result = await login(email, password);
            if (stryMutAct_9fa48("23369") ? false : stryMutAct_9fa48("23368") ? true : (stryCov_9fa48("23368", "23369"), result.success)) {
              if (stryMutAct_9fa48("23370")) {
                {}
              } else {
                stryCov_9fa48("23370");
                // Use the redirectTo from unified auth response
                const redirectPath = stryMutAct_9fa48("23373") ? result.redirectTo && '/dashboard' : stryMutAct_9fa48("23372") ? false : stryMutAct_9fa48("23371") ? true : (stryCov_9fa48("23371", "23372", "23373"), result.redirectTo || (stryMutAct_9fa48("23374") ? "" : (stryCov_9fa48("23374"), '/dashboard')));

                // For builder users, the AuthContext will handle the state
                // For applicants, we redirect but don't set AuthContext state
                if (stryMutAct_9fa48("23377") ? result.userType !== 'builder' : stryMutAct_9fa48("23376") ? false : stryMutAct_9fa48("23375") ? true : (stryCov_9fa48("23375", "23376", "23377"), result.userType === (stryMutAct_9fa48("23378") ? "" : (stryCov_9fa48("23378"), 'builder')))) {
                  if (stryMutAct_9fa48("23379")) {
                    {}
                  } else {
                    stryCov_9fa48("23379");
                    // Navigate to the path specified by the backend (could be /dashboard or /volunteer-feedback)
                    navigate(redirectPath);
                  }
                } else if (stryMutAct_9fa48("23382") ? result.userType !== 'applicant' : stryMutAct_9fa48("23381") ? false : stryMutAct_9fa48("23380") ? true : (stryCov_9fa48("23380", "23381", "23382"), result.userType === (stryMutAct_9fa48("23383") ? "" : (stryCov_9fa48("23383"), 'applicant')))) {
                  if (stryMutAct_9fa48("23384")) {
                    {}
                  } else {
                    stryCov_9fa48("23384");
                    // Redirect to applicant dashboard
                    navigate(redirectPath);
                  }
                } else {
                  if (stryMutAct_9fa48("23385")) {
                    {}
                  } else {
                    stryCov_9fa48("23385");
                    // Fallback to dashboard
                    navigate(stryMutAct_9fa48("23386") ? "" : (stryCov_9fa48("23386"), '/dashboard'));
                  }
                }
              }
            } else {
              if (stryMutAct_9fa48("23387")) {
                {}
              } else {
                stryCov_9fa48("23387");
                // Check if the error is related to email verification
                if (stryMutAct_9fa48("23389") ? false : stryMutAct_9fa48("23388") ? true : (stryCov_9fa48("23388", "23389"), result.needsVerification)) {
                  if (stryMutAct_9fa48("23390")) {
                    {}
                  } else {
                    stryCov_9fa48("23390");
                    setNeedsVerification(stryMutAct_9fa48("23391") ? false : (stryCov_9fa48("23391"), true));
                  }
                } else {
                  if (stryMutAct_9fa48("23392")) {
                    {}
                  } else {
                    stryCov_9fa48("23392");
                    setError(stryMutAct_9fa48("23395") ? result.error && 'Invalid email or password' : stryMutAct_9fa48("23394") ? false : stryMutAct_9fa48("23393") ? true : (stryCov_9fa48("23393", "23394", "23395"), result.error || (stryMutAct_9fa48("23396") ? "" : (stryCov_9fa48("23396"), 'Invalid email or password'))));
                  }
                }
              }
            }
          }
        } catch (err) {
          if (stryMutAct_9fa48("23397")) {
            {}
          } else {
            stryCov_9fa48("23397");
            setError(stryMutAct_9fa48("23398") ? "" : (stryCov_9fa48("23398"), 'An unexpected error occurred. Please try again.'));
            console.error(err);
          }
        } finally {
          if (stryMutAct_9fa48("23399")) {
            {}
          } else {
            stryCov_9fa48("23399");
            setIsSubmitting(stryMutAct_9fa48("23400") ? true : (stryCov_9fa48("23400"), false));
          }
        }
      }
    };
    return <div className="login-container">
      <div className="login-form-container">
        <div className="login-logo-container">
          <img src={logoFull} alt="Pursuit Logo" className="login-logo" />
        </div>
        
        <div className="login-headline">
          <h1>LET'S BUILD<br />THE FUTURE<br />—TOGETHER.</h1>
        </div>
        
        {needsVerification ? <div className="login-verification-needed">
            <p>Please verify your email address before logging in.</p>
            <p>Check your email for a verification link or request a new one.</p>
            <div className="login-verification-actions">
              <Link to={stryMutAct_9fa48("23401") ? `` : (stryCov_9fa48("23401"), `/resend-verification`)} className="login-button verification-button">
                Resend Verification Email
              </Link>
              <button onClick={stryMutAct_9fa48("23402") ? () => undefined : (stryCov_9fa48("23402"), () => setNeedsVerification(stryMutAct_9fa48("23403") ? true : (stryCov_9fa48("23403"), false)))} className="login-link back-to-login">
                Back to Login
              </button>
            </div>
          </div> : <form onSubmit={handleSubmit} className="login-form">
            {stryMutAct_9fa48("23406") ? error || <div className="login-error">{error}</div> : stryMutAct_9fa48("23405") ? false : stryMutAct_9fa48("23404") ? true : (stryCov_9fa48("23404", "23405", "23406"), error && <div className="login-error">{error}</div>)}
            
            <div className="login-input-group">
              <input type="email" value={email} onChange={stryMutAct_9fa48("23407") ? () => undefined : (stryCov_9fa48("23407"), e => setEmail(e.target.value))} placeholder="Email" required className="login-input" disabled={isSubmitting} />
            </div>
            
            <div className="login-input-group password-input-group">
              <input type={showPassword ? stryMutAct_9fa48("23408") ? "" : (stryCov_9fa48("23408"), "text") : stryMutAct_9fa48("23409") ? "" : (stryCov_9fa48("23409"), "password")} value={password} onChange={stryMutAct_9fa48("23410") ? () => undefined : (stryCov_9fa48("23410"), e => setPassword(e.target.value))} placeholder="Password" required className="login-input" disabled={isSubmitting} />
              <button type="button" className="password-toggle" onClick={stryMutAct_9fa48("23411") ? () => undefined : (stryCov_9fa48("23411"), () => setShowPassword(stryMutAct_9fa48("23412") ? showPassword : (stryCov_9fa48("23412"), !showPassword)))}>
                {showPassword ? stryMutAct_9fa48("23413") ? "" : (stryCov_9fa48("23413"), "Hide") : stryMutAct_9fa48("23414") ? "" : (stryCov_9fa48("23414"), "Show")}
              </button>
            </div>
            
            <div className="login-links">
              <Link to="/signup" className="login-link">Create an account</Link>
              <Link to="/forgot-password" className="login-link">Forgot Password?</Link>
            </div>
            
            <button type="submit" className="login-button" disabled={isSubmitting}>
              {isSubmitting ? stryMutAct_9fa48("23415") ? "" : (stryCov_9fa48("23415"), 'Logging in...') : stryMutAct_9fa48("23416") ? "" : (stryCov_9fa48("23416"), 'Log In')}
            </button>
          </form>}
      </div>
    </div>;
  }
};
export default Login;