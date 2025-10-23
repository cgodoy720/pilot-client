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
import React, { useState, useEffect } from 'react';
function BusinessSubmission({
  submissionData,
  isDraft,
  isLoading,
  onUpdate,
  onSubmit
}) {
  if (stryMutAct_9fa48("12626")) {
    {}
  } else {
    stryCov_9fa48("12626");
    const [formData, setFormData] = useState(stryMutAct_9fa48("12627") ? {} : (stryCov_9fa48("12627"), {
      problemStatement: stryMutAct_9fa48("12628") ? "Stryker was here!" : (stryCov_9fa48("12628"), ''),
      proposedSolution: stryMutAct_9fa48("12629") ? "Stryker was here!" : (stryCov_9fa48("12629"), '')
    }));

    // Initialize form data
    useEffect(() => {
      if (stryMutAct_9fa48("12630")) {
        {}
      } else {
        stryCov_9fa48("12630");
        if (stryMutAct_9fa48("12632") ? false : stryMutAct_9fa48("12631") ? true : (stryCov_9fa48("12631", "12632"), submissionData)) {
          if (stryMutAct_9fa48("12633")) {
            {}
          } else {
            stryCov_9fa48("12633");
            setFormData(stryMutAct_9fa48("12634") ? {} : (stryCov_9fa48("12634"), {
              problemStatement: stryMutAct_9fa48("12637") ? submissionData.problemStatement && '' : stryMutAct_9fa48("12636") ? false : stryMutAct_9fa48("12635") ? true : (stryCov_9fa48("12635", "12636", "12637"), submissionData.problemStatement || (stryMutAct_9fa48("12638") ? "Stryker was here!" : (stryCov_9fa48("12638"), ''))),
              proposedSolution: stryMutAct_9fa48("12641") ? submissionData.proposedSolution && '' : stryMutAct_9fa48("12640") ? false : stryMutAct_9fa48("12639") ? true : (stryCov_9fa48("12639", "12640", "12641"), submissionData.proposedSolution || (stryMutAct_9fa48("12642") ? "Stryker was here!" : (stryCov_9fa48("12642"), '')))
            }));
          }
        }
      }
    }, stryMutAct_9fa48("12643") ? [] : (stryCov_9fa48("12643"), [submissionData]));
    const handleChange = (field, value) => {
      if (stryMutAct_9fa48("12644")) {
        {}
      } else {
        stryCov_9fa48("12644");
        const newFormData = stryMutAct_9fa48("12645") ? {} : (stryCov_9fa48("12645"), {
          ...formData,
          [field]: value
        });
        setFormData(newFormData);

        // Update parent state immediately (no auto-save)
        onUpdate(newFormData);
      }
    };
    const handleSubmit = () => {
      if (stryMutAct_9fa48("12646")) {
        {}
      } else {
        stryCov_9fa48("12646");
        if (stryMutAct_9fa48("12649") ? !formData.problemStatement.trim() && !formData.proposedSolution.trim() : stryMutAct_9fa48("12648") ? false : stryMutAct_9fa48("12647") ? true : (stryCov_9fa48("12647", "12648", "12649"), (stryMutAct_9fa48("12650") ? formData.problemStatement.trim() : (stryCov_9fa48("12650"), !(stryMutAct_9fa48("12651") ? formData.problemStatement : (stryCov_9fa48("12651"), formData.problemStatement.trim())))) || (stryMutAct_9fa48("12652") ? formData.proposedSolution.trim() : (stryCov_9fa48("12652"), !(stryMutAct_9fa48("12653") ? formData.proposedSolution : (stryCov_9fa48("12653"), formData.proposedSolution.trim())))))) {
          if (stryMutAct_9fa48("12654")) {
            {}
          } else {
            stryCov_9fa48("12654");
            alert(stryMutAct_9fa48("12655") ? "" : (stryCov_9fa48("12655"), 'Please fill in both the problem statement and proposed solution before submitting.'));
            return;
          }
        }
        // Submit with current form data
        onSubmit(formData);
      }
    };
    const isComplete = stryMutAct_9fa48("12658") ? formData.problemStatement.trim() || formData.proposedSolution.trim() : stryMutAct_9fa48("12657") ? false : stryMutAct_9fa48("12656") ? true : (stryCov_9fa48("12656", "12657", "12658"), (stryMutAct_9fa48("12659") ? formData.problemStatement : (stryCov_9fa48("12659"), formData.problemStatement.trim())) && (stryMutAct_9fa48("12660") ? formData.proposedSolution : (stryCov_9fa48("12660"), formData.proposedSolution.trim())));
    return <div className="submission-form">
      <div className="submission-form__field">
        <label className="submission-form__label">
          Problem Statement *
        </label>
        <textarea className="submission-form__textarea submission-form__textarea--large" value={formData.problemStatement} onChange={stryMutAct_9fa48("12661") ? () => undefined : (stryCov_9fa48("12661"), e => handleChange(stryMutAct_9fa48("12662") ? "" : (stryCov_9fa48("12662"), 'problemStatement'), e.target.value))} placeholder="Enter your one-sentence problem statement here..." disabled={stryMutAct_9fa48("12665") ? !isDraft && isLoading : stryMutAct_9fa48("12664") ? false : stryMutAct_9fa48("12663") ? true : (stryCov_9fa48("12663", "12664", "12665"), (stryMutAct_9fa48("12666") ? isDraft : (stryCov_9fa48("12666"), !isDraft)) || isLoading)} rows={4} />
        <div className="submission-form__char-counter">
          {formData.problemStatement.length} characters
        </div>
        <div className="submission-form__help">
          Clearly state the main problem the coffee shop is facing in one concise sentence.
        </div>
      </div>

      <div className="submission-form__field">
        <label className="submission-form__label">
          Proposed Solution *
        </label>
        <textarea className="submission-form__textarea submission-form__textarea--large" value={formData.proposedSolution} onChange={stryMutAct_9fa48("12667") ? () => undefined : (stryCov_9fa48("12667"), e => handleChange(stryMutAct_9fa48("12668") ? "" : (stryCov_9fa48("12668"), 'proposedSolution'), e.target.value))} placeholder="Enter your one-sentence proposed solution here..." disabled={stryMutAct_9fa48("12671") ? !isDraft && isLoading : stryMutAct_9fa48("12670") ? false : stryMutAct_9fa48("12669") ? true : (stryCov_9fa48("12669", "12670", "12671"), (stryMutAct_9fa48("12672") ? isDraft : (stryCov_9fa48("12672"), !isDraft)) || isLoading)} rows={4} />
        <div className="submission-form__char-counter">
          {formData.proposedSolution.length} characters
        </div>
        <div className="submission-form__help">
          Describe your AI-powered solution to the problem in one clear sentence.
        </div>
      </div>


      <div className="submission-form__actions">
        {isDraft ? <button onClick={handleSubmit} disabled={stryMutAct_9fa48("12675") ? !isComplete && isLoading : stryMutAct_9fa48("12674") ? false : stryMutAct_9fa48("12673") ? true : (stryCov_9fa48("12673", "12674", "12675"), (stryMutAct_9fa48("12676") ? isComplete : (stryCov_9fa48("12676"), !isComplete)) || isLoading)} className="submission-form__btn submission-form__btn--primary">
            {isLoading ? <>
                <div className="submission-form__spinner" />
                Submitting...
              </> : stryMutAct_9fa48("12677") ? "" : (stryCov_9fa48("12677"), 'Submit Final Assessment')}
          </button> : <div className="submission-form__submitted">
            <div className="submission-form__field">
              <label className="submission-form__label">Problem Statement</label>
              <div className="submission-form__readonly">
                {formData.problemStatement}
              </div>
            </div>
            
            <div className="submission-form__field">
              <label className="submission-form__label">Proposed Solution</label>
              <div className="submission-form__readonly">
                {formData.proposedSolution}
              </div>
            </div>
          </div>}
        
        {stryMutAct_9fa48("12680") ? !isComplete && isDraft || <div className="submission-form__help">
            Both fields are required before you can submit your assessment.
          </div> : stryMutAct_9fa48("12679") ? false : stryMutAct_9fa48("12678") ? true : (stryCov_9fa48("12678", "12679", "12680"), (stryMutAct_9fa48("12682") ? !isComplete || isDraft : stryMutAct_9fa48("12681") ? true : (stryCov_9fa48("12681", "12682"), (stryMutAct_9fa48("12683") ? isComplete : (stryCov_9fa48("12683"), !isComplete)) && isDraft)) && <div className="submission-form__help">
            Both fields are required before you can submit your assessment.
          </div>)}
      </div>
    </div>;
  }
}
export default BusinessSubmission;