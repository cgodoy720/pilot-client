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
import './AnalysisModal.css';
const AnalysisModal = ({
  isOpen,
  onClose,
  analysisResults,
  analysisType,
  availableAnalysisTypes,
  onSwitchAnalysisType
}) => {
  if (stryMutAct_9fa48("562")) {
    {}
  } else {
    stryCov_9fa48("562");
    const [currentAnalysis, setCurrentAnalysis] = useState(null);
    const [currentAnalysisType, setCurrentAnalysisType] = useState(analysisType);

    // Reset state when the modal is opened/closed or when analysis type changes
    useEffect(() => {
      if (stryMutAct_9fa48("563")) {
        {}
      } else {
        stryCov_9fa48("563");
        if (stryMutAct_9fa48("565") ? false : stryMutAct_9fa48("564") ? true : (stryCov_9fa48("564", "565"), isOpen)) {
          if (stryMutAct_9fa48("566")) {
            {}
          } else {
            stryCov_9fa48("566");
            // Set current analysis type from props
            setCurrentAnalysisType(analysisType);
          }
        }
      }
    }, stryMutAct_9fa48("567") ? [] : (stryCov_9fa48("567"), [isOpen, analysisType]));

    // Update current analysis when analysis results or type changes
    useEffect(() => {
      if (stryMutAct_9fa48("568")) {
        {}
      } else {
        stryCov_9fa48("568");
        if (stryMutAct_9fa48("571") ? analysisResults || Object.keys(analysisResults).length > 0 : stryMutAct_9fa48("570") ? false : stryMutAct_9fa48("569") ? true : (stryCov_9fa48("569", "570", "571"), analysisResults && (stryMutAct_9fa48("574") ? Object.keys(analysisResults).length <= 0 : stryMutAct_9fa48("573") ? Object.keys(analysisResults).length >= 0 : stryMutAct_9fa48("572") ? true : (stryCov_9fa48("572", "573", "574"), Object.keys(analysisResults).length > 0)))) {
          if (stryMutAct_9fa48("575")) {
            {}
          } else {
            stryCov_9fa48("575");
            // For conversation analysis, use the 'conversation' key
            if (stryMutAct_9fa48("578") ? currentAnalysisType === 'conversation' || analysisResults.conversation : stryMutAct_9fa48("577") ? false : stryMutAct_9fa48("576") ? true : (stryCov_9fa48("576", "577", "578"), (stryMutAct_9fa48("580") ? currentAnalysisType !== 'conversation' : stryMutAct_9fa48("579") ? true : (stryCov_9fa48("579", "580"), currentAnalysisType === (stryMutAct_9fa48("581") ? "" : (stryCov_9fa48("581"), 'conversation')))) && analysisResults.conversation)) {
              if (stryMutAct_9fa48("582")) {
                {}
              } else {
                stryCov_9fa48("582");
                setCurrentAnalysis(analysisResults.conversation);
              }
            } // For deliverable analysis, use the first result available (we no longer have a dropdown)
            else if (stryMutAct_9fa48("585") ? currentAnalysisType !== 'deliverable' : stryMutAct_9fa48("584") ? false : stryMutAct_9fa48("583") ? true : (stryCov_9fa48("583", "584", "585"), currentAnalysisType === (stryMutAct_9fa48("586") ? "" : (stryCov_9fa48("586"), 'deliverable')))) {
              if (stryMutAct_9fa48("587")) {
                {}
              } else {
                stryCov_9fa48("587");
                // Just take the first available result
                const firstKey = Object.keys(analysisResults)[0];
                if (stryMutAct_9fa48("589") ? false : stryMutAct_9fa48("588") ? true : (stryCov_9fa48("588", "589"), firstKey)) {
                  if (stryMutAct_9fa48("590")) {
                    {}
                  } else {
                    stryCov_9fa48("590");
                    setCurrentAnalysis(analysisResults[firstKey]);
                  }
                } else {
                  if (stryMutAct_9fa48("591")) {
                    {}
                  } else {
                    stryCov_9fa48("591");
                    setCurrentAnalysis(null);
                  }
                }
              }
            }
          }
        } else {
          if (stryMutAct_9fa48("592")) {
            {}
          } else {
            stryCov_9fa48("592");
            setCurrentAnalysis(null);
          }
        }
      }
    }, stryMutAct_9fa48("593") ? [] : (stryCov_9fa48("593"), [analysisResults, currentAnalysisType]));
    const handleAnalysisTypeChange = type => {
      if (stryMutAct_9fa48("594")) {
        {}
      } else {
        stryCov_9fa48("594");
        setCurrentAnalysisType(type);
        if (stryMutAct_9fa48("596") ? false : stryMutAct_9fa48("595") ? true : (stryCov_9fa48("595", "596"), onSwitchAnalysisType)) {
          if (stryMutAct_9fa48("597")) {
            {}
          } else {
            stryCov_9fa48("597");
            onSwitchAnalysisType(type);
          }
        }
      }
    };

    // Format the analysis type for display
    const formatAnalysisType = type => {
      if (stryMutAct_9fa48("598")) {
        {}
      } else {
        stryCov_9fa48("598");
        switch (type) {
          case stryMutAct_9fa48("600") ? "" : (stryCov_9fa48("600"), 'conversation'):
            if (stryMutAct_9fa48("599")) {} else {
              stryCov_9fa48("599");
              return stryMutAct_9fa48("601") ? "" : (stryCov_9fa48("601"), 'Chat Feedback');
            }
          case stryMutAct_9fa48("603") ? "" : (stryCov_9fa48("603"), 'deliverable'):
            if (stryMutAct_9fa48("602")) {} else {
              stryCov_9fa48("602");
              return stryMutAct_9fa48("604") ? "" : (stryCov_9fa48("604"), 'Deliverable Feedback');
            }
          default:
            if (stryMutAct_9fa48("605")) {} else {
              stryCov_9fa48("605");
              return type ? stryMutAct_9fa48("606") ? type.charAt(0).toUpperCase() - type.slice(1) : (stryCov_9fa48("606"), (stryMutAct_9fa48("608") ? type.toUpperCase() : stryMutAct_9fa48("607") ? type.charAt(0).toLowerCase() : (stryCov_9fa48("607", "608"), type.charAt(0).toUpperCase())) + (stryMutAct_9fa48("609") ? type : (stryCov_9fa48("609"), type.slice(1)))) : stryMutAct_9fa48("610") ? "" : (stryCov_9fa48("610"), 'Analysis');
            }
        }
      }
    };
    if (stryMutAct_9fa48("613") ? false : stryMutAct_9fa48("612") ? true : stryMutAct_9fa48("611") ? isOpen : (stryCov_9fa48("611", "612", "613"), !isOpen)) return null;
    const hasAnalysisTypes = stryMutAct_9fa48("616") ? availableAnalysisTypes || availableAnalysisTypes.length > 0 : stryMutAct_9fa48("615") ? false : stryMutAct_9fa48("614") ? true : (stryCov_9fa48("614", "615", "616"), availableAnalysisTypes && (stryMutAct_9fa48("619") ? availableAnalysisTypes.length <= 0 : stryMutAct_9fa48("618") ? availableAnalysisTypes.length >= 0 : stryMutAct_9fa48("617") ? true : (stryCov_9fa48("617", "618", "619"), availableAnalysisTypes.length > 0)));
    const hasAnalysis = stryMutAct_9fa48("622") ? currentAnalysis === null : stryMutAct_9fa48("621") ? false : stryMutAct_9fa48("620") ? true : (stryCov_9fa48("620", "621", "622"), currentAnalysis !== null);
    const isDeliverableAnalysis = stryMutAct_9fa48("625") ? currentAnalysisType !== 'deliverable' : stryMutAct_9fa48("624") ? false : stryMutAct_9fa48("623") ? true : (stryCov_9fa48("623", "624", "625"), currentAnalysisType === (stryMutAct_9fa48("626") ? "" : (stryCov_9fa48("626"), 'deliverable')));
    return <div className={stryMutAct_9fa48("627") ? `` : (stryCov_9fa48("627"), `analysis-modal ${isOpen ? stryMutAct_9fa48("628") ? "" : (stryCov_9fa48("628"), 'open') : stryMutAct_9fa48("629") ? "Stryker was here!" : (stryCov_9fa48("629"), '')}`)}>
      <div className="analysis-modal-content">
        <div className="analysis-modal-header">
          <h2>Analysis Results <span className="analysis-modal__beta-badge">BETA</span></h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        {/* Analysis Type Selector */}
        {stryMutAct_9fa48("632") ? hasAnalysisTypes || <div className="analysis-type-selector">
            {availableAnalysisTypes.map(type => <button key={type} className={`analysis-type-btn ${type === currentAnalysisType ? 'active' : ''}`} onClick={() => handleAnalysisTypeChange(type)}>
                {formatAnalysisType(type)}
              </button>)}
          </div> : stryMutAct_9fa48("631") ? false : stryMutAct_9fa48("630") ? true : (stryCov_9fa48("630", "631", "632"), hasAnalysisTypes && <div className="analysis-type-selector">
            {availableAnalysisTypes.map(stryMutAct_9fa48("633") ? () => undefined : (stryCov_9fa48("633"), type => <button key={type} className={stryMutAct_9fa48("634") ? `` : (stryCov_9fa48("634"), `analysis-type-btn ${(stryMutAct_9fa48("637") ? type !== currentAnalysisType : stryMutAct_9fa48("636") ? false : stryMutAct_9fa48("635") ? true : (stryCov_9fa48("635", "636", "637"), type === currentAnalysisType)) ? stryMutAct_9fa48("638") ? "" : (stryCov_9fa48("638"), 'active') : stryMutAct_9fa48("639") ? "Stryker was here!" : (stryCov_9fa48("639"), '')}`)} onClick={stryMutAct_9fa48("640") ? () => undefined : (stryCov_9fa48("640"), () => handleAnalysisTypeChange(type))}>
                {formatAnalysisType(type)}
              </button>))}
          </div>)}
        
        <div className="analysis-modal-body">
          {hasAnalysis ? <div className="analysis-content">
              <div className="analysis-text">
                {stryMutAct_9fa48("643") ? currentAnalysis.feedback || <div className="analysis-feedback">
                    <h4>Feedback</h4>
                    <div className="feedback-content">
                      {currentAnalysis.feedback.split('\n').map((line, index) => <p key={index}>{line}</p>)}
                    </div>
                  </div> : stryMutAct_9fa48("642") ? false : stryMutAct_9fa48("641") ? true : (stryCov_9fa48("641", "642", "643"), currentAnalysis.feedback && <div className="analysis-feedback">
                    <h4>Feedback</h4>
                    <div className="feedback-content">
                      {currentAnalysis.feedback.split(stryMutAct_9fa48("644") ? "" : (stryCov_9fa48("644"), '\n')).map(stryMutAct_9fa48("645") ? () => undefined : (stryCov_9fa48("645"), (line, index) => <p key={index}>{line}</p>))}
                    </div>
                  </div>)}
                
                <div className="analysis-columns">
                  {stryMutAct_9fa48("648") ? currentAnalysis.criteria_met && currentAnalysis.criteria_met.length > 0 || <div className="analysis-criteria">
                      <h4>Criteria Met</h4>
                      <ul className="criteria-list">
                        {currentAnalysis.criteria_met.map((criterion, index) => <li key={index} className="criteria-item">
                            <svg className="criteria-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="16" height="16">
                              <path d="M173.898 439.404l-166.4-166.4c-9.997-9.997-9.997-26.206 0-36.204l36.203-36.204c9.997-9.998 26.207-9.998 36.204 0L192 312.69 432.095 72.596c9.997-9.997 26.207-9.997 36.204 0l36.203 36.204c9.997 9.997 9.997 26.206 0 36.204l-294.4 294.401c-9.998 9.997-26.207 9.997-36.204-.001z" fill="currentColor"></path>
                            </svg>
                            {criterion}
                          </li>)}
                      </ul>
                    </div> : stryMutAct_9fa48("647") ? false : stryMutAct_9fa48("646") ? true : (stryCov_9fa48("646", "647", "648"), (stryMutAct_9fa48("650") ? currentAnalysis.criteria_met || currentAnalysis.criteria_met.length > 0 : stryMutAct_9fa48("649") ? true : (stryCov_9fa48("649", "650"), currentAnalysis.criteria_met && (stryMutAct_9fa48("653") ? currentAnalysis.criteria_met.length <= 0 : stryMutAct_9fa48("652") ? currentAnalysis.criteria_met.length >= 0 : stryMutAct_9fa48("651") ? true : (stryCov_9fa48("651", "652", "653"), currentAnalysis.criteria_met.length > 0)))) && <div className="analysis-criteria">
                      <h4>Criteria Met</h4>
                      <ul className="criteria-list">
                        {currentAnalysis.criteria_met.map(stryMutAct_9fa48("654") ? () => undefined : (stryCov_9fa48("654"), (criterion, index) => <li key={index} className="criteria-item">
                            <svg className="criteria-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="16" height="16">
                              <path d="M173.898 439.404l-166.4-166.4c-9.997-9.997-9.997-26.206 0-36.204l36.203-36.204c9.997-9.998 26.207-9.998 36.204 0L192 312.69 432.095 72.596c9.997-9.997 26.207-9.997 36.204 0l36.203 36.204c9.997 9.997 9.997 26.206 0 36.204l-294.4 294.401c-9.998 9.997-26.207 9.997-36.204-.001z" fill="currentColor"></path>
                            </svg>
                            {criterion}
                          </li>))}
                      </ul>
                    </div>)}
                  
                  {stryMutAct_9fa48("657") ? currentAnalysis.areas_for_improvement && currentAnalysis.areas_for_improvement.length > 0 || <div className="analysis-improvements">
                      <h4>Areas for Improvement</h4>
                      <ul className="improvement-list">
                        {currentAnalysis.areas_for_improvement.map((area, index) => <li key={index} className="improvement-item">
                            {area}
                          </li>)}
                      </ul>
                    </div> : stryMutAct_9fa48("656") ? false : stryMutAct_9fa48("655") ? true : (stryCov_9fa48("655", "656", "657"), (stryMutAct_9fa48("659") ? currentAnalysis.areas_for_improvement || currentAnalysis.areas_for_improvement.length > 0 : stryMutAct_9fa48("658") ? true : (stryCov_9fa48("658", "659"), currentAnalysis.areas_for_improvement && (stryMutAct_9fa48("662") ? currentAnalysis.areas_for_improvement.length <= 0 : stryMutAct_9fa48("661") ? currentAnalysis.areas_for_improvement.length >= 0 : stryMutAct_9fa48("660") ? true : (stryCov_9fa48("660", "661", "662"), currentAnalysis.areas_for_improvement.length > 0)))) && <div className="analysis-improvements">
                      <h4>Areas for Improvement</h4>
                      <ul className="improvement-list">
                        {currentAnalysis.areas_for_improvement.map(stryMutAct_9fa48("663") ? () => undefined : (stryCov_9fa48("663"), (area, index) => <li key={index} className="improvement-item">
                            {area}
                          </li>))}
                      </ul>
                    </div>)}
                </div>
              </div>
            </div> : <div className="no-analysis">
              <p>No analysis available for {isDeliverableAnalysis ? stryMutAct_9fa48("664") ? "" : (stryCov_9fa48("664"), 'your deliverable') : stryMutAct_9fa48("665") ? "" : (stryCov_9fa48("665"), 'the chat')}.</p>
              {isDeliverableAnalysis ? <p className="analysis-instructions">
                  You can analyze your deliverable by clicking the "Analyze This Submission" button 
                  next to your submission in the task view.
                </p> : <p className="analysis-instructions">
                  You can generate chat feedback by clicking the "Generate AI Feedback" button in the task view.
                </p>}
            </div>}
        </div>
      </div>
    </div>;
  }
};
export default AnalysisModal;