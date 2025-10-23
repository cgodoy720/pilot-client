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
import { FaTimes } from 'react-icons/fa';
import BusinessSubmission from './BusinessSubmission';
import TechnicalSubmission from './TechnicalSubmission';
import ProfessionalSubmission from './ProfessionalSubmission';
import SelfSubmission from './SelfSubmission';
import './AssessmentSubmissionPanel.css';
import './SelfSubmission.css';
function AssessmentSubmissionPanel({
  assessmentType,
  submissionData,
  isDraft,
  isLoading,
  onUpdate,
  onSubmit,
  onClose
}) {
  if (stryMutAct_9fa48("12600")) {
    {}
  } else {
    stryCov_9fa48("12600");
    const getSubmissionComponent = () => {
      if (stryMutAct_9fa48("12601")) {
        {}
      } else {
        stryCov_9fa48("12601");
        const commonProps = stryMutAct_9fa48("12602") ? {} : (stryCov_9fa48("12602"), {
          submissionData,
          isDraft,
          isLoading,
          onUpdate,
          onSubmit
        });
        switch (assessmentType) {
          case stryMutAct_9fa48("12604") ? "" : (stryCov_9fa48("12604"), 'business'):
            if (stryMutAct_9fa48("12603")) {} else {
              stryCov_9fa48("12603");
              return <BusinessSubmission {...commonProps} />;
            }
          case stryMutAct_9fa48("12606") ? "" : (stryCov_9fa48("12606"), 'technical'):
            if (stryMutAct_9fa48("12605")) {} else {
              stryCov_9fa48("12605");
              return <TechnicalSubmission {...commonProps} />;
            }
          case stryMutAct_9fa48("12608") ? "" : (stryCov_9fa48("12608"), 'professional'):
            if (stryMutAct_9fa48("12607")) {} else {
              stryCov_9fa48("12607");
              return <ProfessionalSubmission {...commonProps} />;
            }
          case stryMutAct_9fa48("12610") ? "" : (stryCov_9fa48("12610"), 'self'):
            if (stryMutAct_9fa48("12609")) {} else {
              stryCov_9fa48("12609");
              return <SelfSubmission {...commonProps} />;
            }
          default:
            if (stryMutAct_9fa48("12611")) {} else {
              stryCov_9fa48("12611");
              return <div className="submission-panel__error">
            <p>Unknown assessment type: {assessmentType}</p>
          </div>;
            }
        }
      }
    };
    const getTitle = () => {
      if (stryMutAct_9fa48("12612")) {
        {}
      } else {
        stryCov_9fa48("12612");
        const titleMap = stryMutAct_9fa48("12613") ? {} : (stryCov_9fa48("12613"), {
          'business': stryMutAct_9fa48("12614") ? "" : (stryCov_9fa48("12614"), 'Submit Business Assessment'),
          'technical': stryMutAct_9fa48("12615") ? "" : (stryCov_9fa48("12615"), 'Submit Technical Assessment'),
          'professional': stryMutAct_9fa48("12616") ? "" : (stryCov_9fa48("12616"), 'Submit Professional Assessment'),
          'self': stryMutAct_9fa48("12617") ? "" : (stryCov_9fa48("12617"), 'Submit Self Assessment')
        });
        return stryMutAct_9fa48("12620") ? titleMap[assessmentType] && 'Submit Assessment' : stryMutAct_9fa48("12619") ? false : stryMutAct_9fa48("12618") ? true : (stryCov_9fa48("12618", "12619", "12620"), titleMap[assessmentType] || (stryMutAct_9fa48("12621") ? "" : (stryCov_9fa48("12621"), 'Submit Assessment')));
      }
    };
    return <div className="submission-panel">
      <div className="submission-panel__overlay" onClick={onClose} />
      
      <div className="submission-panel__content">
        {/* Header */}
        <div className="submission-panel__header">
          <h2 className="submission-panel__title">{getTitle()}</h2>
          <button onClick={onClose} className="submission-panel__close-btn" disabled={isLoading}>
            <FaTimes />
          </button>
        </div>

        {/* Content */}
        <div className="submission-panel__body">
          {getSubmissionComponent()}
        </div>

        {/* Status */}
        {stryMutAct_9fa48("12624") ? !isDraft || <div className="submission-panel__status">
            <div className="submission-panel__status-badge submission-panel__status-badge--submitted">
              ✓ Submitted
            </div>
          </div> : stryMutAct_9fa48("12623") ? false : stryMutAct_9fa48("12622") ? true : (stryCov_9fa48("12622", "12623", "12624"), (stryMutAct_9fa48("12625") ? isDraft : (stryCov_9fa48("12625"), !isDraft)) && <div className="submission-panel__status">
            <div className="submission-panel__status-badge submission-panel__status-badge--submitted">
              ✓ Submitted
            </div>
          </div>)}
      </div>
    </div>;
  }
}
export default AssessmentSubmissionPanel;