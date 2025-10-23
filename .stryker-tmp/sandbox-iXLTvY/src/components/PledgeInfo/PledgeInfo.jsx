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
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './PledgeInfo.css';
const PledgeInfo = () => {
  if (stryMutAct_9fa48("2520")) {
    {}
  } else {
    stryCov_9fa48("2520");
    const navigate = useNavigate();
    const handleBack = () => {
      if (stryMutAct_9fa48("2521")) {
        {}
      } else {
        stryCov_9fa48("2521");
        navigate(stryMutAct_9fa48("2522") ? "" : (stryCov_9fa48("2522"), '/'));
      }
    };
    return <div className="pledge-info-container">
      <div className="pledge-info-header">
        <button onClick={handleBack} className="back-button">
          ← Back to Dashboard
        </button>
      </div>
      <div className="pledge-info-content">
        <h2>How to Sign the Pledge</h2>
        <div className="pledge-info-text">
          <p>If you have questions about AI Native classes, curriculum, schedule, or the pledge, please reach out to Afiya at afiya@pursuit.org.</p>
          <p>If you have questions about the Good Job Guarantee, please reach out to Kirstie at kirstie@pursuit.org.</p>
          <p>Otherwise, you should have received both documents via docusign. Please sign these documents in order to secure your spot in the program!</p>
        </div>
      </div>
    </div>;
  }
};
export default PledgeInfo;