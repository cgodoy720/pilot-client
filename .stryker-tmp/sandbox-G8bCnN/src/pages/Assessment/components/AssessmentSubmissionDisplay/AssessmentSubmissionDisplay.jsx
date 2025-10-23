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
import { FaCheckCircle, FaFileAlt, FaLink, FaVideo, FaClipboardCheck } from 'react-icons/fa';
import './AssessmentSubmissionDisplay.css';
function AssessmentSubmissionDisplay({
  assessmentType,
  submissionData
}) {
  if (stryMutAct_9fa48("12495")) {
    {}
  } else {
    stryCov_9fa48("12495");
    if (stryMutAct_9fa48("12498") ? !submissionData && Object.keys(submissionData).length === 0 : stryMutAct_9fa48("12497") ? false : stryMutAct_9fa48("12496") ? true : (stryCov_9fa48("12496", "12497", "12498"), (stryMutAct_9fa48("12499") ? submissionData : (stryCov_9fa48("12499"), !submissionData)) || (stryMutAct_9fa48("12501") ? Object.keys(submissionData).length !== 0 : stryMutAct_9fa48("12500") ? false : (stryCov_9fa48("12500", "12501"), Object.keys(submissionData).length === 0)))) {
      if (stryMutAct_9fa48("12502")) {
        {}
      } else {
        stryCov_9fa48("12502");
        return null;
      }
    }
    const renderBusinessSubmission = stryMutAct_9fa48("12503") ? () => undefined : (stryCov_9fa48("12503"), (() => {
      const renderBusinessSubmission = () => <div className="submission-display">
      <div className="submission-display__header">
        <FaCheckCircle className="submission-display__icon" />
        <h3>Submitted Deliverables</h3>
      </div>
      
      <div className="submission-display__content">
        <div className="submission-display__item">
          <div className="submission-display__label">
            <FaFileAlt className="submission-display__item-icon" />
            Problem Statement
          </div>
          <div className="submission-display__value">
            {stryMutAct_9fa48("12506") ? submissionData.problemStatement && 'No problem statement provided' : stryMutAct_9fa48("12505") ? false : stryMutAct_9fa48("12504") ? true : (stryCov_9fa48("12504", "12505", "12506"), submissionData.problemStatement || (stryMutAct_9fa48("12507") ? "" : (stryCov_9fa48("12507"), 'No problem statement provided')))}
          </div>
        </div>
        
        <div className="submission-display__item">
          <div className="submission-display__label">
            <FaFileAlt className="submission-display__item-icon" />
            Proposed Solution
          </div>
          <div className="submission-display__value">
            {stryMutAct_9fa48("12510") ? submissionData.proposedSolution && 'No proposed solution provided' : stryMutAct_9fa48("12509") ? false : stryMutAct_9fa48("12508") ? true : (stryCov_9fa48("12508", "12509", "12510"), submissionData.proposedSolution || (stryMutAct_9fa48("12511") ? "" : (stryCov_9fa48("12511"), 'No proposed solution provided')))}
          </div>
        </div>
      </div>
    </div>;
      return renderBusinessSubmission;
    })());
    const renderTechnicalSubmission = stryMutAct_9fa48("12512") ? () => undefined : (stryCov_9fa48("12512"), (() => {
      const renderTechnicalSubmission = () => <div className="submission-display">
      <div className="submission-display__header">
        <FaCheckCircle className="submission-display__icon" />
        <h3>Submitted Deliverables</h3>
      </div>
      
      <div className="submission-display__content">
        <div className="submission-display__item">
          <div className="submission-display__label">
            <FaFileAlt className="submission-display__item-icon" />
            AI Conversation
          </div>
          <div className="submission-display__value submission-display__value--conversation">
            {stryMutAct_9fa48("12515") ? submissionData.conversationText && 'No conversation provided' : stryMutAct_9fa48("12514") ? false : stryMutAct_9fa48("12513") ? true : (stryCov_9fa48("12513", "12514", "12515"), submissionData.conversationText || (stryMutAct_9fa48("12516") ? "" : (stryCov_9fa48("12516"), 'No conversation provided')))}
          </div>
        </div>
        
        {stryMutAct_9fa48("12519") ? submissionData.githubUrl || <div className="submission-display__item">
            <div className="submission-display__label">
              <FaLink className="submission-display__item-icon" />
              GitHub/Deployed Link
            </div>
            <div className="submission-display__value">
              <a href={submissionData.githubUrl} target="_blank" rel="noopener noreferrer" className="submission-display__link">
                {submissionData.githubUrl}
              </a>
            </div>
          </div> : stryMutAct_9fa48("12518") ? false : stryMutAct_9fa48("12517") ? true : (stryCov_9fa48("12517", "12518", "12519"), submissionData.githubUrl && <div className="submission-display__item">
            <div className="submission-display__label">
              <FaLink className="submission-display__item-icon" />
              GitHub/Deployed Link
            </div>
            <div className="submission-display__value">
              <a href={submissionData.githubUrl} target="_blank" rel="noopener noreferrer" className="submission-display__link">
                {submissionData.githubUrl}
              </a>
            </div>
          </div>)}
        
        {stryMutAct_9fa48("12522") ? submissionData.files && submissionData.files.length > 0 || <div className="submission-display__item">
            <div className="submission-display__label">
              <FaFileAlt className="submission-display__item-icon" />
              Uploaded Files
            </div>
            <div className="submission-display__value">
              <ul className="submission-display__file-list">
                {submissionData.files.map((file, index) => <li key={index} className="submission-display__file-item">
                    {file.name} ({file.size ? `${Math.round(file.size / 1024)}KB` : 'Unknown size'})
                  </li>)}
              </ul>
            </div>
          </div> : stryMutAct_9fa48("12521") ? false : stryMutAct_9fa48("12520") ? true : (stryCov_9fa48("12520", "12521", "12522"), (stryMutAct_9fa48("12524") ? submissionData.files || submissionData.files.length > 0 : stryMutAct_9fa48("12523") ? true : (stryCov_9fa48("12523", "12524"), submissionData.files && (stryMutAct_9fa48("12527") ? submissionData.files.length <= 0 : stryMutAct_9fa48("12526") ? submissionData.files.length >= 0 : stryMutAct_9fa48("12525") ? true : (stryCov_9fa48("12525", "12526", "12527"), submissionData.files.length > 0)))) && <div className="submission-display__item">
            <div className="submission-display__label">
              <FaFileAlt className="submission-display__item-icon" />
              Uploaded Files
            </div>
            <div className="submission-display__value">
              <ul className="submission-display__file-list">
                {submissionData.files.map(stryMutAct_9fa48("12528") ? () => undefined : (stryCov_9fa48("12528"), (file, index) => <li key={index} className="submission-display__file-item">
                    {file.name} ({file.size ? stryMutAct_9fa48("12529") ? `` : (stryCov_9fa48("12529"), `${Math.round(stryMutAct_9fa48("12530") ? file.size * 1024 : (stryCov_9fa48("12530"), file.size / 1024))}KB`) : stryMutAct_9fa48("12531") ? "" : (stryCov_9fa48("12531"), 'Unknown size')})
                  </li>))}
              </ul>
            </div>
          </div>)}
      </div>
    </div>;
      return renderTechnicalSubmission;
    })());
    const renderProfessionalSubmission = stryMutAct_9fa48("12532") ? () => undefined : (stryCov_9fa48("12532"), (() => {
      const renderProfessionalSubmission = () => <div className="submission-display">
      <div className="submission-display__header">
        <FaCheckCircle className="submission-display__icon" />
        <h3>Submitted Deliverables</h3>
      </div>
      
      <div className="submission-display__content">
        <div className="submission-display__item">
          <div className="submission-display__label">
            <FaVideo className="submission-display__item-icon" />
            Pitch Recording
          </div>
          <div className="submission-display__value">
            <a href={submissionData.loomUrl} target="_blank" rel="noopener noreferrer" className="submission-display__link">
              {stryMutAct_9fa48("12535") ? submissionData.loomUrl && 'No Loom URL provided' : stryMutAct_9fa48("12534") ? false : stryMutAct_9fa48("12533") ? true : (stryCov_9fa48("12533", "12534", "12535"), submissionData.loomUrl || (stryMutAct_9fa48("12536") ? "" : (stryCov_9fa48("12536"), 'No Loom URL provided')))}
            </a>
          </div>
        </div>
      </div>
    </div>;
      return renderProfessionalSubmission;
    })());
    const renderSelfSubmission = () => {
      if (stryMutAct_9fa48("12537")) {
        {}
      } else {
        stryCov_9fa48("12537");
        const responses = stryMutAct_9fa48("12540") ? submissionData.responses && {} : stryMutAct_9fa48("12539") ? false : stryMutAct_9fa48("12538") ? true : (stryCov_9fa48("12538", "12539", "12540"), submissionData.responses || {});
        const sectionTimes = stryMutAct_9fa48("12543") ? submissionData.sectionTimes && {} : stryMutAct_9fa48("12542") ? false : stryMutAct_9fa48("12541") ? true : (stryCov_9fa48("12541", "12542", "12543"), submissionData.sectionTimes || {});

        // Section titles
        const SECTION_TITLES = stryMutAct_9fa48("12544") ? {} : (stryCov_9fa48("12544"), {
          1: stryMutAct_9fa48("12545") ? "" : (stryCov_9fa48("12545"), 'Product & Business Thinking'),
          2: stryMutAct_9fa48("12546") ? "" : (stryCov_9fa48("12546"), 'Professional & Learning Skills'),
          3: stryMutAct_9fa48("12547") ? "" : (stryCov_9fa48("12547"), 'AI Direction & Collaboration'),
          4: stryMutAct_9fa48("12548") ? "" : (stryCov_9fa48("12548"), 'Technical Concepts & Integration')
        });

        // Calculate section scores (simplified version - actual scoring would be done server-side)
        const calculateSectionScore = sectionNum => {
          if (stryMutAct_9fa48("12549")) {
            {}
          } else {
            stryCov_9fa48("12549");
            const sectionResponses = stryMutAct_9fa48("12550") ? Object.entries(responses) : (stryCov_9fa48("12550"), Object.entries(responses).filter(([id]) => {
              if (stryMutAct_9fa48("12551")) {
                {}
              } else {
                stryCov_9fa48("12551");
                const questionId = parseInt(id);
                return stryMutAct_9fa48("12554") ? questionId > (sectionNum - 1) * 5 || questionId <= sectionNum * 5 : stryMutAct_9fa48("12553") ? false : stryMutAct_9fa48("12552") ? true : (stryCov_9fa48("12552", "12553", "12554"), (stryMutAct_9fa48("12557") ? questionId <= (sectionNum - 1) * 5 : stryMutAct_9fa48("12556") ? questionId >= (sectionNum - 1) * 5 : stryMutAct_9fa48("12555") ? true : (stryCov_9fa48("12555", "12556", "12557"), questionId > (stryMutAct_9fa48("12558") ? (sectionNum - 1) / 5 : (stryCov_9fa48("12558"), (stryMutAct_9fa48("12559") ? sectionNum + 1 : (stryCov_9fa48("12559"), sectionNum - 1)) * 5)))) && (stryMutAct_9fa48("12562") ? questionId > sectionNum * 5 : stryMutAct_9fa48("12561") ? questionId < sectionNum * 5 : stryMutAct_9fa48("12560") ? true : (stryCov_9fa48("12560", "12561", "12562"), questionId <= (stryMutAct_9fa48("12563") ? sectionNum / 5 : (stryCov_9fa48("12563"), sectionNum * 5)))));
              }
            }));
            const answeredCount = stryMutAct_9fa48("12564") ? sectionResponses.length : (stryCov_9fa48("12564"), sectionResponses.filter(stryMutAct_9fa48("12565") ? () => undefined : (stryCov_9fa48("12565"), ([_, value]) => stryMutAct_9fa48("12568") ? value !== undefined || value !== '' : stryMutAct_9fa48("12567") ? false : stryMutAct_9fa48("12566") ? true : (stryCov_9fa48("12566", "12567", "12568"), (stryMutAct_9fa48("12570") ? value === undefined : stryMutAct_9fa48("12569") ? true : (stryCov_9fa48("12569", "12570"), value !== undefined)) && (stryMutAct_9fa48("12572") ? value === '' : stryMutAct_9fa48("12571") ? true : (stryCov_9fa48("12571", "12572"), value !== (stryMutAct_9fa48("12573") ? "Stryker was here!" : (stryCov_9fa48("12573"), ''))))))).length);
            return stryMutAct_9fa48("12574") ? `` : (stryCov_9fa48("12574"), `${answeredCount}/5 questions answered`);
          }
        };
        return <div className="submission-display">
        <div className="submission-display__header">
          <FaClipboardCheck className="submission-display__icon" />
          <h3>Self Assessment Results</h3>
        </div>
        
        <div className="submission-display__content">
          {/* Summary */}
          <div className="submission-display__item">
            <div className="submission-display__label">
              <FaFileAlt className="submission-display__item-icon" />
              Assessment Summary
            </div>
            <div className="submission-display__value">
              <div className="self-assessment-summary">
                <div className="self-assessment-summary__row">
                  <div className="self-assessment-summary__label">Questions Answered:</div>
                  <div className="self-assessment-summary__value">
                    {stryMutAct_9fa48("12575") ? Object.values(responses).length : (stryCov_9fa48("12575"), Object.values(responses).filter(stryMutAct_9fa48("12576") ? () => undefined : (stryCov_9fa48("12576"), v => stryMutAct_9fa48("12579") ? v !== undefined || v !== '' : stryMutAct_9fa48("12578") ? false : stryMutAct_9fa48("12577") ? true : (stryCov_9fa48("12577", "12578", "12579"), (stryMutAct_9fa48("12581") ? v === undefined : stryMutAct_9fa48("12580") ? true : (stryCov_9fa48("12580", "12581"), v !== undefined)) && (stryMutAct_9fa48("12583") ? v === '' : stryMutAct_9fa48("12582") ? true : (stryCov_9fa48("12582", "12583"), v !== (stryMutAct_9fa48("12584") ? "Stryker was here!" : (stryCov_9fa48("12584"), ''))))))).length)}/20
                  </div>
                </div>
                <div className="self-assessment-summary__row">
                  <div className="self-assessment-summary__label">Completion Time:</div>
                  <div className="self-assessment-summary__value">
                    {submissionData.completionTime ? new Date(submissionData.completionTime).toLocaleString() : stryMutAct_9fa48("12585") ? "" : (stryCov_9fa48("12585"), 'Not completed')}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Section Scores */}
          <div className="submission-display__item">
            <div className="submission-display__label">
              <FaFileAlt className="submission-display__item-icon" />
              Section Completion
            </div>
            <div className="submission-display__value">
              <div className="self-assessment-sections">
                {(stryMutAct_9fa48("12586") ? [] : (stryCov_9fa48("12586"), [1, 2, 3, 4])).map(stryMutAct_9fa48("12587") ? () => undefined : (stryCov_9fa48("12587"), sectionNum => <div key={sectionNum} className="self-assessment-section">
                    <div className="self-assessment-section__header">
                      <div className="self-assessment-section__title">
                        Section {sectionNum}: {SECTION_TITLES[sectionNum]}
                      </div>
                      <div className="self-assessment-section__score">
                        {calculateSectionScore(sectionNum)}
                      </div>
                    </div>
                    <div className="self-assessment-section__time">
                      Time spent: {sectionTimes[sectionNum] ? stryMutAct_9fa48("12588") ? `` : (stryCov_9fa48("12588"), `${Math.round(stryMutAct_9fa48("12589") ? sectionTimes[sectionNum] * 60 : (stryCov_9fa48("12589"), sectionTimes[sectionNum] / 60))} minutes`) : stryMutAct_9fa48("12590") ? "" : (stryCov_9fa48("12590"), 'Not recorded')}
                    </div>
                  </div>))}
              </div>
            </div>
          </div>
          
          {/* Note about detailed responses */}
          <div className="submission-display__item">
            <div className="submission-display__note">
              <strong>Note:</strong> Detailed question responses and scoring are available to staff for review. 
              This assessment helps us understand your current skills and confidence to provide better support 
              throughout the program.
            </div>
          </div>
        </div>
      </div>;
      }
    };
    switch (assessmentType) {
      case stryMutAct_9fa48("12592") ? "" : (stryCov_9fa48("12592"), 'business'):
        if (stryMutAct_9fa48("12591")) {} else {
          stryCov_9fa48("12591");
          return renderBusinessSubmission();
        }
      case stryMutAct_9fa48("12594") ? "" : (stryCov_9fa48("12594"), 'technical'):
        if (stryMutAct_9fa48("12593")) {} else {
          stryCov_9fa48("12593");
          return renderTechnicalSubmission();
        }
      case stryMutAct_9fa48("12596") ? "" : (stryCov_9fa48("12596"), 'professional'):
        if (stryMutAct_9fa48("12595")) {} else {
          stryCov_9fa48("12595");
          return renderProfessionalSubmission();
        }
      case stryMutAct_9fa48("12598") ? "" : (stryCov_9fa48("12598"), 'self'):
        if (stryMutAct_9fa48("12597")) {} else {
          stryCov_9fa48("12597");
          return renderSelfSubmission();
        }
      default:
        if (stryMutAct_9fa48("12599")) {} else {
          stryCov_9fa48("12599");
          return <div className="submission-display">
          <div className="submission-display__header">
            <FaCheckCircle className="submission-display__icon" />
            <h3>Submitted Deliverables</h3>
          </div>
          <div className="submission-display__content">
            <pre>{JSON.stringify(submissionData, null, 2)}</pre>
          </div>
        </div>;
        }
    }
  }
}
export default AssessmentSubmissionDisplay;