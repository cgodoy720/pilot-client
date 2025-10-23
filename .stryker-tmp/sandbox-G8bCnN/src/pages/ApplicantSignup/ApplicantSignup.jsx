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
import { useNavigate, Link } from 'react-router-dom';
import databaseService from '../../services/databaseService';
import './ApplicantSignup.css';
const ApplicantSignup = () => {
  if (stryMutAct_9fa48("10399")) {
    {}
  } else {
    stryCov_9fa48("10399");
    const navigate = useNavigate();
    const [formData, setFormData] = useState(stryMutAct_9fa48("10400") ? {} : (stryCov_9fa48("10400"), {
      firstName: stryMutAct_9fa48("10401") ? "Stryker was here!" : (stryCov_9fa48("10401"), ''),
      lastName: stryMutAct_9fa48("10402") ? "Stryker was here!" : (stryCov_9fa48("10402"), ''),
      email: stryMutAct_9fa48("10403") ? "Stryker was here!" : (stryCov_9fa48("10403"), ''),
      password: stryMutAct_9fa48("10404") ? "Stryker was here!" : (stryCov_9fa48("10404"), ''),
      confirmPassword: stryMutAct_9fa48("10405") ? "Stryker was here!" : (stryCov_9fa48("10405"), '')
    }));
    const [loading, setLoading] = useState(stryMutAct_9fa48("10406") ? true : (stryCov_9fa48("10406"), false));
    const [error, setError] = useState(stryMutAct_9fa48("10407") ? "Stryker was here!" : (stryCov_9fa48("10407"), ''));
    const handleChange = e => {
      if (stryMutAct_9fa48("10408")) {
        {}
      } else {
        stryCov_9fa48("10408");
        setFormData(stryMutAct_9fa48("10409") ? {} : (stryCov_9fa48("10409"), {
          ...formData,
          [e.target.name]: e.target.value
        }));
        // Clear error when user starts typing
        if (stryMutAct_9fa48("10411") ? false : stryMutAct_9fa48("10410") ? true : (stryCov_9fa48("10410", "10411"), error)) setError(stryMutAct_9fa48("10412") ? "Stryker was here!" : (stryCov_9fa48("10412"), ''));
      }
    };
    const handleSubmit = async e => {
      if (stryMutAct_9fa48("10413")) {
        {}
      } else {
        stryCov_9fa48("10413");
        e.preventDefault();
        setLoading(stryMutAct_9fa48("10414") ? false : (stryCov_9fa48("10414"), true));
        setError(stryMutAct_9fa48("10415") ? "Stryker was here!" : (stryCov_9fa48("10415"), ''));

        // Validate passwords match
        if (stryMutAct_9fa48("10418") ? formData.password === formData.confirmPassword : stryMutAct_9fa48("10417") ? false : stryMutAct_9fa48("10416") ? true : (stryCov_9fa48("10416", "10417", "10418"), formData.password !== formData.confirmPassword)) {
          if (stryMutAct_9fa48("10419")) {
            {}
          } else {
            stryCov_9fa48("10419");
            setError(stryMutAct_9fa48("10420") ? "" : (stryCov_9fa48("10420"), 'Passwords do not match'));
            setLoading(stryMutAct_9fa48("10421") ? true : (stryCov_9fa48("10421"), false));
            return;
          }
        }
        try {
          if (stryMutAct_9fa48("10422")) {
            {}
          } else {
            stryCov_9fa48("10422");
            await databaseService.signup(formData.firstName, formData.lastName, formData.email, formData.password);
            // Redirect to application dashboard
            navigate(stryMutAct_9fa48("10423") ? "" : (stryCov_9fa48("10423"), '/apply'));
          }
        } catch (error) {
          if (stryMutAct_9fa48("10424")) {
            {}
          } else {
            stryCov_9fa48("10424");
            setError(error.message);
          }
        } finally {
          if (stryMutAct_9fa48("10425")) {
            {}
          } else {
            stryCov_9fa48("10425");
            setLoading(stryMutAct_9fa48("10426") ? true : (stryCov_9fa48("10426"), false));
          }
        }
      }
    };
    return <div className="applicant-signup-container">
            <div className="applicant-signup-card">
                <div className="applicant-signup-header">
                    <h1>Join Pursuit</h1>
                    <p>Create your account to start your application</p>
                </div>

                <form onSubmit={handleSubmit} className="applicant-signup-form">
                    {stryMutAct_9fa48("10429") ? error || <div className="error-message">
                            {error}
                        </div> : stryMutAct_9fa48("10428") ? false : stryMutAct_9fa48("10427") ? true : (stryCov_9fa48("10427", "10428", "10429"), error && <div className="error-message">
                            {error}
                        </div>)}

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="firstName">First Name</label>
                            <input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required placeholder="First name" />
                        </div>

                        <div className="form-group">
                            <label htmlFor="lastName">Last Name</label>
                            <input type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required placeholder="Last name" />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required placeholder="Enter your email" />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required placeholder="Create a password" />
                        <small className="password-hint">
                            Password must be at least 8 characters long
                        </small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input type="password" id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required placeholder="Confirm your password" />
                    </div>

                    <button type="submit" className="signup-button" disabled={loading}>
                        {loading ? stryMutAct_9fa48("10430") ? "" : (stryCov_9fa48("10430"), 'Creating Account...') : stryMutAct_9fa48("10431") ? "" : (stryCov_9fa48("10431"), 'Create Account')}
                    </button>
                </form>

                <div className="applicant-signup-footer">
                    <p>
                        Already have an account? <Link to="/login">Sign in here</Link>
                    </p>
                </div>
            </div>
        </div>;
  }
};
export default ApplicantSignup;