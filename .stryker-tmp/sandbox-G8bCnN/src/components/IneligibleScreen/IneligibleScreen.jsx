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
import { FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import './IneligibleScreen.css';
const IneligibleModal = ({
  isOpen,
  onClose,
  failedCriteria = stryMutAct_9fa48("1227") ? ["Stryker was here"] : (stryCov_9fa48("1227"), [])
}) => {
  if (stryMutAct_9fa48("1228")) {
    {}
  } else {
    stryCov_9fa48("1228");
    if (stryMutAct_9fa48("1231") ? false : stryMutAct_9fa48("1230") ? true : stryMutAct_9fa48("1229") ? isOpen : (stryCov_9fa48("1229", "1230", "1231"), !isOpen)) return null;
    const handleOverlayClick = e => {
      if (stryMutAct_9fa48("1232")) {
        {}
      } else {
        stryCov_9fa48("1232");
        if (stryMutAct_9fa48("1235") ? e.target !== e.currentTarget : stryMutAct_9fa48("1234") ? false : stryMutAct_9fa48("1233") ? true : (stryCov_9fa48("1233", "1234", "1235"), e.target === e.currentTarget)) {
          if (stryMutAct_9fa48("1236")) {
            {}
          } else {
            stryCov_9fa48("1236");
            onClose();
          }
        }
      }
    };
    return <div className={stryMutAct_9fa48("1237") ? `` : (stryCov_9fa48("1237"), `ineligible-modal__overlay ${isOpen ? stryMutAct_9fa48("1238") ? "" : (stryCov_9fa48("1238"), 'open') : stryMutAct_9fa48("1239") ? "Stryker was here!" : (stryCov_9fa48("1239"), '')}`)} onClick={handleOverlayClick}>
      <div className="ineligible-modal__container">
        <div className="ineligible-modal__header">
          <div className="ineligible-modal__title-section">
            <FaExclamationTriangle className="ineligible-modal__icon" />
            <h3 className="ineligible-modal__title">Application Status Update</h3>
          </div>
          <button className="ineligible-modal__close-btn" onClick={onClose} aria-label="Close modal">
            <FaTimes />
          </button>
        </div>
        
        <div className="ineligible-modal__body">
          <div className="ineligible-modal__message">
            <p>
              Thank you for taking the time to learn about Pursuit and for beginning an application.
            </p>
            
            <p className="ineligible-modal__main-message">
              Unfortunately, based on your responses, you do not meet the eligibility requirements for this program.
            </p>

            {stryMutAct_9fa48("1242") ? failedCriteria.length > 0 || <div className="ineligible-modal__criteria">
                <strong>Requirements not met:</strong>
                <ul>
                  {failedCriteria.map((criteria, index) => <li key={index}>{criteria}</li>)}
                </ul>
              </div> : stryMutAct_9fa48("1241") ? false : stryMutAct_9fa48("1240") ? true : (stryCov_9fa48("1240", "1241", "1242"), (stryMutAct_9fa48("1245") ? failedCriteria.length <= 0 : stryMutAct_9fa48("1244") ? failedCriteria.length >= 0 : stryMutAct_9fa48("1243") ? true : (stryCov_9fa48("1243", "1244", "1245"), failedCriteria.length > 0)) && <div className="ineligible-modal__criteria">
                <strong>Requirements not met:</strong>
                <ul>
                  {failedCriteria.map(stryMutAct_9fa48("1246") ? () => undefined : (stryCov_9fa48("1246"), (criteria, index) => <li key={index}>{criteria}</li>))}
                </ul>
              </div>)}
            
            <p>
              We encourage you to reapply in the future if your circumstances change.
            </p>
            
            <p>
              We truly appreciate your interest in joining our program.
            </p>
            
            <p className="ineligible-modal__email-note">
              An email confirmation has been sent to you regarding this decision.
            </p>
          </div>
        </div>
        
        <div className="ineligible-modal__footer">
          <button onClick={onClose} className="ineligible-modal__button">
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>;
  }
};
export default IneligibleModal;