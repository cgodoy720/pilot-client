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
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logoFull from '../../assets/logo-full.png';
import './Signup.css';
const Signup = () => {
  if (stryMutAct_9fa48("25645")) {
    {}
  } else {
    stryCov_9fa48("25645");
    const [userType, setUserType] = useState(stryMutAct_9fa48("25646") ? "Stryker was here!" : (stryCov_9fa48("25646"), '')); // 'builder' or 'applicant'
    const [firstName, setFirstName] = useState(stryMutAct_9fa48("25647") ? "Stryker was here!" : (stryCov_9fa48("25647"), ''));
    const [lastName, setLastName] = useState(stryMutAct_9fa48("25648") ? "Stryker was here!" : (stryCov_9fa48("25648"), ''));
    const [email, setEmail] = useState(stryMutAct_9fa48("25649") ? "Stryker was here!" : (stryCov_9fa48("25649"), ''));
    const [password, setPassword] = useState(stryMutAct_9fa48("25650") ? "Stryker was here!" : (stryCov_9fa48("25650"), ''));
    const [confirmPassword, setConfirmPassword] = useState(stryMutAct_9fa48("25651") ? "Stryker was here!" : (stryCov_9fa48("25651"), ''));
    const [showPassword, setShowPassword] = useState(stryMutAct_9fa48("25652") ? true : (stryCov_9fa48("25652"), false));
    const [error, setError] = useState(stryMutAct_9fa48("25653") ? "Stryker was here!" : (stryCov_9fa48("25653"), ''));
    const [successMessage, setSuccessMessage] = useState(stryMutAct_9fa48("25654") ? "Stryker was here!" : (stryCov_9fa48("25654"), ''));
    const [isSubmitting, setIsSubmitting] = useState(stryMutAct_9fa48("25655") ? true : (stryCov_9fa48("25655"), false));
    const [isPasswordFocused, setIsPasswordFocused] = useState(stryMutAct_9fa48("25656") ? true : (stryCov_9fa48("25656"), false));
    const [registrationComplete, setRegistrationComplete] = useState(stryMutAct_9fa48("25657") ? true : (stryCov_9fa48("25657"), false));
    const [passwordValidation, setPasswordValidation] = useState(stryMutAct_9fa48("25658") ? {} : (stryCov_9fa48("25658"), {
      length: stryMutAct_9fa48("25659") ? true : (stryCov_9fa48("25659"), false),
      uppercase: stryMutAct_9fa48("25660") ? true : (stryCov_9fa48("25660"), false),
      lowercase: stryMutAct_9fa48("25661") ? true : (stryCov_9fa48("25661"), false),
      number: stryMutAct_9fa48("25662") ? true : (stryCov_9fa48("25662"), false),
      special: stryMutAct_9fa48("25663") ? true : (stryCov_9fa48("25663"), false),
      match: stryMutAct_9fa48("25664") ? true : (stryCov_9fa48("25664"), false)
    }));
    const navigate = useNavigate();
    const {
      signup,
      isAuthenticated
    } = useAuth();

    // Redirect if already authenticated
    useEffect(() => {
      if (stryMutAct_9fa48("25665")) {
        {}
      } else {
        stryCov_9fa48("25665");
        if (stryMutAct_9fa48("25667") ? false : stryMutAct_9fa48("25666") ? true : (stryCov_9fa48("25666", "25667"), isAuthenticated)) {
          if (stryMutAct_9fa48("25668")) {
            {}
          } else {
            stryCov_9fa48("25668");
            navigate(stryMutAct_9fa48("25669") ? "" : (stryCov_9fa48("25669"), '/dashboard'));
          }
        }
      }
    }, stryMutAct_9fa48("25670") ? [] : (stryCov_9fa48("25670"), [isAuthenticated, navigate]));

    // Validate password as user types
    useEffect(() => {
      if (stryMutAct_9fa48("25671")) {
        {}
      } else {
        stryCov_9fa48("25671");
        setPasswordValidation(stryMutAct_9fa48("25672") ? {} : (stryCov_9fa48("25672"), {
          length: stryMutAct_9fa48("25676") ? password.length < 8 : stryMutAct_9fa48("25675") ? password.length > 8 : stryMutAct_9fa48("25674") ? false : stryMutAct_9fa48("25673") ? true : (stryCov_9fa48("25673", "25674", "25675", "25676"), password.length >= 8),
          uppercase: (stryMutAct_9fa48("25677") ? /[^A-Z]/ : (stryCov_9fa48("25677"), /[A-Z]/)).test(password),
          lowercase: (stryMutAct_9fa48("25678") ? /[^a-z]/ : (stryCov_9fa48("25678"), /[a-z]/)).test(password),
          number: (stryMutAct_9fa48("25679") ? /[^0-9]/ : (stryCov_9fa48("25679"), /[0-9]/)).test(password),
          special: (stryMutAct_9fa48("25680") ? /[^!@#$%^&*(),.?":{}|<>]/ : (stryCov_9fa48("25680"), /[!@#$%^&*(),.?":{}|<>]/)).test(password),
          match: stryMutAct_9fa48("25683") ? password === confirmPassword || password !== '' : stryMutAct_9fa48("25682") ? false : stryMutAct_9fa48("25681") ? true : (stryCov_9fa48("25681", "25682", "25683"), (stryMutAct_9fa48("25685") ? password !== confirmPassword : stryMutAct_9fa48("25684") ? true : (stryCov_9fa48("25684", "25685"), password === confirmPassword)) && (stryMutAct_9fa48("25687") ? password === '' : stryMutAct_9fa48("25686") ? true : (stryCov_9fa48("25686", "25687"), password !== (stryMutAct_9fa48("25688") ? "Stryker was here!" : (stryCov_9fa48("25688"), '')))))
        }));
      }
    }, stryMutAct_9fa48("25689") ? [] : (stryCov_9fa48("25689"), [password, confirmPassword]));
    const handleUserTypeSelect = type => {
      if (stryMutAct_9fa48("25690")) {
        {}
      } else {
        stryCov_9fa48("25690");
        setUserType(type);
        setError(stryMutAct_9fa48("25691") ? "Stryker was here!" : (stryCov_9fa48("25691"), ''));
      }
    };
    const handleSubmit = async e => {
      if (stryMutAct_9fa48("25692")) {
        {}
      } else {
        stryCov_9fa48("25692");
        e.preventDefault();
        setError(stryMutAct_9fa48("25693") ? "Stryker was here!" : (stryCov_9fa48("25693"), ''));
        setSuccessMessage(stryMutAct_9fa48("25694") ? "Stryker was here!" : (stryCov_9fa48("25694"), ''));

        // Check if user type is selected
        if (stryMutAct_9fa48("25697") ? false : stryMutAct_9fa48("25696") ? true : stryMutAct_9fa48("25695") ? userType : (stryCov_9fa48("25695", "25696", "25697"), !userType)) {
          if (stryMutAct_9fa48("25698")) {
            {}
          } else {
            stryCov_9fa48("25698");
            setError(stryMutAct_9fa48("25699") ? "" : (stryCov_9fa48("25699"), 'Please select an account type'));
            return;
          }
        }

        // Check if all password validations pass
        const allValidationsPass = stryMutAct_9fa48("25700") ? Object.values(passwordValidation).some(value => value) : (stryCov_9fa48("25700"), Object.values(passwordValidation).every(stryMutAct_9fa48("25701") ? () => undefined : (stryCov_9fa48("25701"), value => value)));
        if (stryMutAct_9fa48("25704") ? false : stryMutAct_9fa48("25703") ? true : stryMutAct_9fa48("25702") ? allValidationsPass : (stryCov_9fa48("25702", "25703", "25704"), !allValidationsPass)) {
          if (stryMutAct_9fa48("25705")) {
            {}
          } else {
            stryCov_9fa48("25705");
            setError(stryMutAct_9fa48("25706") ? "" : (stryCov_9fa48("25706"), 'Please ensure your password meets all requirements'));
            return;
          }
        }
        setIsSubmitting(stryMutAct_9fa48("25707") ? false : (stryCov_9fa48("25707"), true));
        try {
          if (stryMutAct_9fa48("25708")) {
            {}
          } else {
            stryCov_9fa48("25708");
            let response;
            let endpoint;
            let requestBody;
            if (stryMutAct_9fa48("25711") ? userType !== 'builder' : stryMutAct_9fa48("25710") ? false : stryMutAct_9fa48("25709") ? true : (stryCov_9fa48("25709", "25710", "25711"), userType === (stryMutAct_9fa48("25712") ? "" : (stryCov_9fa48("25712"), 'builder')))) {
              if (stryMutAct_9fa48("25713")) {
                {}
              } else {
                stryCov_9fa48("25713");
                // Create builder account using the existing AuthContext signup
                const result = await signup(firstName, lastName, email, password);
                if (stryMutAct_9fa48("25715") ? false : stryMutAct_9fa48("25714") ? true : (stryCov_9fa48("25714", "25715"), result.success)) {
                  if (stryMutAct_9fa48("25716")) {
                    {}
                  } else {
                    stryCov_9fa48("25716");
                    setRegistrationComplete(stryMutAct_9fa48("25717") ? false : (stryCov_9fa48("25717"), true));
                    setSuccessMessage(stryMutAct_9fa48("25720") ? result.message && 'Builder account created successfully! Please check your email to verify your account.' : stryMutAct_9fa48("25719") ? false : stryMutAct_9fa48("25718") ? true : (stryCov_9fa48("25718", "25719", "25720"), result.message || (stryMutAct_9fa48("25721") ? "" : (stryCov_9fa48("25721"), 'Builder account created successfully! Please check your email to verify your account.'))));
                  }
                } else {
                  if (stryMutAct_9fa48("25722")) {
                    {}
                  } else {
                    stryCov_9fa48("25722");
                    setError(stryMutAct_9fa48("25725") ? result.error && 'Failed to create account' : stryMutAct_9fa48("25724") ? false : stryMutAct_9fa48("25723") ? true : (stryCov_9fa48("25723", "25724", "25725"), result.error || (stryMutAct_9fa48("25726") ? "" : (stryCov_9fa48("25726"), 'Failed to create account'))));
                  }
                }
                return;
              }
            } else {
              if (stryMutAct_9fa48("25727")) {
                {}
              } else {
                stryCov_9fa48("25727");
                // Create applicant account in admissions app
                endpoint = stryMutAct_9fa48("25728") ? `` : (stryCov_9fa48("25728"), `${import.meta.env.VITE_API_URL}/api/applications/signup`);
                requestBody = stryMutAct_9fa48("25729") ? {} : (stryCov_9fa48("25729"), {
                  firstName,
                  lastName,
                  email,
                  password
                });
                response = await fetch(endpoint, stryMutAct_9fa48("25730") ? {} : (stryCov_9fa48("25730"), {
                  method: stryMutAct_9fa48("25731") ? "" : (stryCov_9fa48("25731"), 'POST'),
                  headers: stryMutAct_9fa48("25732") ? {} : (stryCov_9fa48("25732"), {
                    'Content-Type': stryMutAct_9fa48("25733") ? "" : (stryCov_9fa48("25733"), 'application/json')
                  }),
                  body: JSON.stringify(requestBody)
                }));
                const data = await response.json();
                if (stryMutAct_9fa48("25735") ? false : stryMutAct_9fa48("25734") ? true : (stryCov_9fa48("25734", "25735"), response.ok)) {
                  if (stryMutAct_9fa48("25736")) {
                    {}
                  } else {
                    stryCov_9fa48("25736");
                    setRegistrationComplete(stryMutAct_9fa48("25737") ? false : (stryCov_9fa48("25737"), true));
                    setSuccessMessage(stryMutAct_9fa48("25738") ? "" : (stryCov_9fa48("25738"), 'Applicant account created successfully! You can now log in to access the admissions portal.'));
                  }
                } else {
                  if (stryMutAct_9fa48("25739")) {
                    {}
                  } else {
                    stryCov_9fa48("25739");
                    setError(stryMutAct_9fa48("25742") ? (data.error || data.message) && 'Failed to create account' : stryMutAct_9fa48("25741") ? false : stryMutAct_9fa48("25740") ? true : (stryCov_9fa48("25740", "25741", "25742"), (stryMutAct_9fa48("25744") ? data.error && data.message : stryMutAct_9fa48("25743") ? false : (stryCov_9fa48("25743", "25744"), data.error || data.message)) || (stryMutAct_9fa48("25745") ? "" : (stryCov_9fa48("25745"), 'Failed to create account'))));
                  }
                }
              }
            }
          }
        } catch (err) {
          if (stryMutAct_9fa48("25746")) {
            {}
          } else {
            stryCov_9fa48("25746");
            setError(stryMutAct_9fa48("25747") ? "" : (stryCov_9fa48("25747"), 'An unexpected error occurred. Please try again.'));
            console.error(err);
          }
        } finally {
          if (stryMutAct_9fa48("25748")) {
            {}
          } else {
            stryCov_9fa48("25748");
            setIsSubmitting(stryMutAct_9fa48("25749") ? true : (stryCov_9fa48("25749"), false));
          }
        }
      }
    };

    // If still loading auth state, show nothing
    if (stryMutAct_9fa48("25752") ? isAuthenticated !== null : stryMutAct_9fa48("25751") ? false : stryMutAct_9fa48("25750") ? true : (stryCov_9fa48("25750", "25751", "25752"), isAuthenticated === null)) {
      if (stryMutAct_9fa48("25753")) {
        {}
      } else {
        stryCov_9fa48("25753");
        return null;
      }
    }

    // User type selection screen
    if (stryMutAct_9fa48("25756") ? false : stryMutAct_9fa48("25755") ? true : stryMutAct_9fa48("25754") ? userType : (stryCov_9fa48("25754", "25755", "25756"), !userType)) {
      if (stryMutAct_9fa48("25757")) {
        {}
      } else {
        stryCov_9fa48("25757");
        return <div className="signup-container">
        <div className="signup-form-container">
          <div className="signup-logo-container">
            <img src={logoFull} alt="Pursuit Logo" className="signup-logo" />
          </div>
          
          <div className="signup-headline">
            <h1>CHOOSE YOUR<br />ACCOUNT TYPE</h1>
          </div>
          
          <div className="user-type-selection">
            <p className="user-type-description">
              Select the type of account you'd like to create:
            </p>
            
            <div className="user-type-options">
              <button onClick={stryMutAct_9fa48("25758") ? () => undefined : (stryCov_9fa48("25758"), () => handleUserTypeSelect(stryMutAct_9fa48("25759") ? "" : (stryCov_9fa48("25759"), 'applicant')))} className="user-type-option">
                <div className="user-type-icon">📝</div>
                <h3>Applicant</h3>
                <p>For prospective students applying to the AI-Native Program</p>
              </button>
              
              <button onClick={stryMutAct_9fa48("25760") ? () => undefined : (stryCov_9fa48("25760"), () => handleUserTypeSelect(stryMutAct_9fa48("25761") ? "" : (stryCov_9fa48("25761"), 'builder')))} className="user-type-option">
                <div className="user-type-icon">🔧</div>
                <h3>Builder</h3>
                <p>For current Pursuit students and alumni who want to access the main learning platform</p>
              </button>
            </div>
            
            <div className="signup-back-to-login">
              <Link to="/login" className="login-link">Already have an account? Log in</Link>
            </div>
          </div>
        </div>
      </div>;
      }
    }
    return <div className="signup-container">
      <div className="signup-form-container">
        <div className="signup-logo-container">
          <img src={logoFull} alt="Pursuit Logo" className="signup-logo" />
        </div>
        
        <div className="signup-headline">
          <h1>CREATE YOUR<br />{stryMutAct_9fa48("25762") ? userType.toLowerCase() : (stryCov_9fa48("25762"), userType.toUpperCase())}<br />ACCOUNT</h1>
        </div>
        
        {registrationComplete ? <div className="signup-success">
            <p className="signup-success-message">{successMessage}</p>
            {stryMutAct_9fa48("25765") ? userType === 'builder' || <div className="signup-verification-instructions">
                <h3>What's next?</h3>
                <ol>
                  <li>Check your email inbox for a verification message</li>
                  <li>Click the verification link in the email</li>
                  <li>Once verified, you can log into your account</li>
                </ol>
                <p>Don't see the email? Check your spam folder or request a new verification link.</p>
              </div> : stryMutAct_9fa48("25764") ? false : stryMutAct_9fa48("25763") ? true : (stryCov_9fa48("25763", "25764", "25765"), (stryMutAct_9fa48("25767") ? userType !== 'builder' : stryMutAct_9fa48("25766") ? true : (stryCov_9fa48("25766", "25767"), userType === (stryMutAct_9fa48("25768") ? "" : (stryCov_9fa48("25768"), 'builder')))) && <div className="signup-verification-instructions">
                <h3>What's next?</h3>
                <ol>
                  <li>Check your email inbox for a verification message</li>
                  <li>Click the verification link in the email</li>
                  <li>Once verified, you can log into your account</li>
                </ol>
                <p>Don't see the email? Check your spam folder or request a new verification link.</p>
              </div>)}
            <div className="signup-actions">
              <Link to="/login" className="signup-button">Go to Login</Link>
              {stryMutAct_9fa48("25771") ? userType === 'builder' || <Link to="/resend-verification" className="signup-link">Resend Verification Email</Link> : stryMutAct_9fa48("25770") ? false : stryMutAct_9fa48("25769") ? true : (stryCov_9fa48("25769", "25770", "25771"), (stryMutAct_9fa48("25773") ? userType !== 'builder' : stryMutAct_9fa48("25772") ? true : (stryCov_9fa48("25772", "25773"), userType === (stryMutAct_9fa48("25774") ? "" : (stryCov_9fa48("25774"), 'builder')))) && <Link to="/resend-verification" className="signup-link">Resend Verification Email</Link>)}
            </div>
          </div> : <form onSubmit={handleSubmit} className="signup-form">
            {stryMutAct_9fa48("25777") ? error || <div className="signup-error">{error}</div> : stryMutAct_9fa48("25776") ? false : stryMutAct_9fa48("25775") ? true : (stryCov_9fa48("25775", "25776", "25777"), error && <div className="signup-error">{error}</div>)}
            {stryMutAct_9fa48("25780") ? successMessage || <div className="signup-success-message">{successMessage}</div> : stryMutAct_9fa48("25779") ? false : stryMutAct_9fa48("25778") ? true : (stryCov_9fa48("25778", "25779", "25780"), successMessage && <div className="signup-success-message">{successMessage}</div>)}
            
            <div className="signup-account-type">
              <p>Creating a <strong>{userType}</strong> account</p>
              <button type="button" onClick={stryMutAct_9fa48("25781") ? () => undefined : (stryCov_9fa48("25781"), () => setUserType(stryMutAct_9fa48("25782") ? "Stryker was here!" : (stryCov_9fa48("25782"), '')))} className="change-account-type">
                Change account type
              </button>
            </div>
            
            <div className="signup-input-group">
              <input type="text" value={firstName} onChange={stryMutAct_9fa48("25783") ? () => undefined : (stryCov_9fa48("25783"), e => setFirstName(e.target.value))} placeholder="First Name" required className="signup-input" disabled={isSubmitting} />
            </div>
            
            <div className="signup-input-group">
              <input type="text" value={lastName} onChange={stryMutAct_9fa48("25784") ? () => undefined : (stryCov_9fa48("25784"), e => setLastName(e.target.value))} placeholder="Last Name" required className="signup-input" disabled={isSubmitting} />
            </div>
            
            <div className="signup-input-group">
              <input type="email" value={email} onChange={stryMutAct_9fa48("25785") ? () => undefined : (stryCov_9fa48("25785"), e => setEmail(e.target.value))} placeholder="Email" required className="signup-input" disabled={isSubmitting} />
            </div>
            
            <div className="signup-input-group password-input-group">
              <input type={showPassword ? stryMutAct_9fa48("25786") ? "" : (stryCov_9fa48("25786"), "text") : stryMutAct_9fa48("25787") ? "" : (stryCov_9fa48("25787"), "password")} value={password} onChange={stryMutAct_9fa48("25788") ? () => undefined : (stryCov_9fa48("25788"), e => setPassword(e.target.value))} placeholder="Password" required className="signup-input" disabled={isSubmitting} onFocus={stryMutAct_9fa48("25789") ? () => undefined : (stryCov_9fa48("25789"), () => setIsPasswordFocused(stryMutAct_9fa48("25790") ? false : (stryCov_9fa48("25790"), true)))} onBlur={stryMutAct_9fa48("25791") ? () => undefined : (stryCov_9fa48("25791"), () => setIsPasswordFocused(stryMutAct_9fa48("25792") ? true : (stryCov_9fa48("25792"), false)))} />
              <button type="button" className="password-toggle" onClick={stryMutAct_9fa48("25793") ? () => undefined : (stryCov_9fa48("25793"), () => setShowPassword(stryMutAct_9fa48("25794") ? showPassword : (stryCov_9fa48("25794"), !showPassword)))}>
                {showPassword ? stryMutAct_9fa48("25795") ? "" : (stryCov_9fa48("25795"), "Hide") : stryMutAct_9fa48("25796") ? "" : (stryCov_9fa48("25796"), "Show")}
              </button>
            </div>
            
            <div className="signup-input-group">
              <input type={showPassword ? stryMutAct_9fa48("25797") ? "" : (stryCov_9fa48("25797"), "text") : stryMutAct_9fa48("25798") ? "" : (stryCov_9fa48("25798"), "password")} value={confirmPassword} onChange={stryMutAct_9fa48("25799") ? () => undefined : (stryCov_9fa48("25799"), e => setConfirmPassword(e.target.value))} placeholder="Confirm Password" required className="signup-input" disabled={isSubmitting} />
            </div>
            
            {/* Password validation feedback - only show when password field is focused or has content */}
            {stryMutAct_9fa48("25802") ? isPasswordFocused || password.length > 0 || <div className="password-validation">
                <h4>Password must:</h4>
                <ul>
                  <li className={passwordValidation.length ? 'valid' : 'invalid'}>
                    Be at least 8 characters long
                  </li>
                  <li className={passwordValidation.uppercase ? 'valid' : 'invalid'}>
                    Include at least one uppercase letter
                  </li>
                  <li className={passwordValidation.lowercase ? 'valid' : 'invalid'}>
                    Include at least one lowercase letter
                  </li>
                  <li className={passwordValidation.number ? 'valid' : 'invalid'}>
                    Include at least one number
                  </li>
                  <li className={passwordValidation.special ? 'valid' : 'invalid'}>
                    Include at least one special character
                  </li>
                </ul>
                
                {confirmPassword.length > 0 && <div className={`password-match ${passwordValidation.match ? 'valid' : 'invalid'}`}>
                    {passwordValidation.match ? 'Passwords match ✓' : 'Passwords do not match ✗'}
                  </div>}
              </div> : stryMutAct_9fa48("25801") ? false : stryMutAct_9fa48("25800") ? true : (stryCov_9fa48("25800", "25801", "25802"), (stryMutAct_9fa48("25804") ? isPasswordFocused && password.length > 0 : stryMutAct_9fa48("25803") ? true : (stryCov_9fa48("25803", "25804"), isPasswordFocused || (stryMutAct_9fa48("25807") ? password.length <= 0 : stryMutAct_9fa48("25806") ? password.length >= 0 : stryMutAct_9fa48("25805") ? false : (stryCov_9fa48("25805", "25806", "25807"), password.length > 0)))) && <div className="password-validation">
                <h4>Password must:</h4>
                <ul>
                  <li className={passwordValidation.length ? stryMutAct_9fa48("25808") ? "" : (stryCov_9fa48("25808"), 'valid') : stryMutAct_9fa48("25809") ? "" : (stryCov_9fa48("25809"), 'invalid')}>
                    Be at least 8 characters long
                  </li>
                  <li className={passwordValidation.uppercase ? stryMutAct_9fa48("25810") ? "" : (stryCov_9fa48("25810"), 'valid') : stryMutAct_9fa48("25811") ? "" : (stryCov_9fa48("25811"), 'invalid')}>
                    Include at least one uppercase letter
                  </li>
                  <li className={passwordValidation.lowercase ? stryMutAct_9fa48("25812") ? "" : (stryCov_9fa48("25812"), 'valid') : stryMutAct_9fa48("25813") ? "" : (stryCov_9fa48("25813"), 'invalid')}>
                    Include at least one lowercase letter
                  </li>
                  <li className={passwordValidation.number ? stryMutAct_9fa48("25814") ? "" : (stryCov_9fa48("25814"), 'valid') : stryMutAct_9fa48("25815") ? "" : (stryCov_9fa48("25815"), 'invalid')}>
                    Include at least one number
                  </li>
                  <li className={passwordValidation.special ? stryMutAct_9fa48("25816") ? "" : (stryCov_9fa48("25816"), 'valid') : stryMutAct_9fa48("25817") ? "" : (stryCov_9fa48("25817"), 'invalid')}>
                    Include at least one special character
                  </li>
                </ul>
                
                {stryMutAct_9fa48("25820") ? confirmPassword.length > 0 || <div className={`password-match ${passwordValidation.match ? 'valid' : 'invalid'}`}>
                    {passwordValidation.match ? 'Passwords match ✓' : 'Passwords do not match ✗'}
                  </div> : stryMutAct_9fa48("25819") ? false : stryMutAct_9fa48("25818") ? true : (stryCov_9fa48("25818", "25819", "25820"), (stryMutAct_9fa48("25823") ? confirmPassword.length <= 0 : stryMutAct_9fa48("25822") ? confirmPassword.length >= 0 : stryMutAct_9fa48("25821") ? true : (stryCov_9fa48("25821", "25822", "25823"), confirmPassword.length > 0)) && <div className={stryMutAct_9fa48("25824") ? `` : (stryCov_9fa48("25824"), `password-match ${passwordValidation.match ? stryMutAct_9fa48("25825") ? "" : (stryCov_9fa48("25825"), 'valid') : stryMutAct_9fa48("25826") ? "" : (stryCov_9fa48("25826"), 'invalid')}`)}>
                    {passwordValidation.match ? stryMutAct_9fa48("25827") ? "" : (stryCov_9fa48("25827"), 'Passwords match ✓') : stryMutAct_9fa48("25828") ? "" : (stryCov_9fa48("25828"), 'Passwords do not match ✗')}
                  </div>)}
              </div>)}
            
            <div className="signup-links">
              <span>Already have an account?</span>
              <Link to="/login" className="signup-link">Log in</Link>
            </div>
            
            <div className="signup-links">
              <span>Changed your mind?</span>
              <button type="button" onClick={stryMutAct_9fa48("25829") ? () => undefined : (stryCov_9fa48("25829"), () => setUserType(stryMutAct_9fa48("25830") ? "Stryker was here!" : (stryCov_9fa48("25830"), '')))} className="signup-link change-type-button">
                Change account type
              </button>
            </div>
            
            <button type="submit" className="signup-button" disabled={isSubmitting}>
              {isSubmitting ? stryMutAct_9fa48("25831") ? "" : (stryCov_9fa48("25831"), 'Creating Account...') : stryMutAct_9fa48("25832") ? "" : (stryCov_9fa48("25832"), 'Create Account')}
            </button>
          </form>}
      </div>
    </div>;
  }
};
export default Signup;