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
import { useLocation, useNavigate } from 'react-router-dom';
import JSONGenerator from './JSONGenerator/JSONGenerator';
import SessionTester from './SessionTester/SessionTester';
import FacilitatorNotesGenerator from './FacilitatorNotesGenerator/FacilitatorNotesGenerator';
import './Content.css';
const Content = () => {
  if (stryMutAct_9fa48("17465")) {
    {}
  } else {
    stryCov_9fa48("17465");
    const location = useLocation();
    const navigate = useNavigate();

    // Shared state for data continuity between tabs
    const [sharedData, setSharedData] = useState(stryMutAct_9fa48("17466") ? {} : (stryCov_9fa48("17466"), {
      originalContent: stryMutAct_9fa48("17467") ? "Stryker was here!" : (stryCov_9fa48("17467"), ''),
      generatedJSON: stryMutAct_9fa48("17468") ? "Stryker was here!" : (stryCov_9fa48("17468"), ''),
      editedJSON: stryMutAct_9fa48("17469") ? "Stryker was here!" : (stryCov_9fa48("17469"), ''),
      inputMethod: stryMutAct_9fa48("17470") ? "" : (stryCov_9fa48("17470"), 'text'),
      textInput: stryMutAct_9fa48("17471") ? "Stryker was here!" : (stryCov_9fa48("17471"), ''),
      urlInput: stryMutAct_9fa48("17472") ? "Stryker was here!" : (stryCov_9fa48("17472"), ''),
      fileInput: null
    }));

    // Determine active tab from URL path
    const getActiveTabFromPath = () => {
      if (stryMutAct_9fa48("17473")) {
        {}
      } else {
        stryCov_9fa48("17473");
        if (stryMutAct_9fa48("17475") ? false : stryMutAct_9fa48("17474") ? true : (stryCov_9fa48("17474", "17475"), location.pathname.includes(stryMutAct_9fa48("17476") ? "" : (stryCov_9fa48("17476"), '/content/session-tester')))) {
          if (stryMutAct_9fa48("17477")) {
            {}
          } else {
            stryCov_9fa48("17477");
            return stryMutAct_9fa48("17478") ? "" : (stryCov_9fa48("17478"), 'session-tester');
          }
        } else if (stryMutAct_9fa48("17480") ? false : stryMutAct_9fa48("17479") ? true : (stryCov_9fa48("17479", "17480"), location.pathname.includes(stryMutAct_9fa48("17481") ? "" : (stryCov_9fa48("17481"), '/content/facilitator-notes')))) {
          if (stryMutAct_9fa48("17482")) {
            {}
          } else {
            stryCov_9fa48("17482");
            return stryMutAct_9fa48("17483") ? "" : (stryCov_9fa48("17483"), 'facilitator-notes');
          }
        }
        return stryMutAct_9fa48("17484") ? "" : (stryCov_9fa48("17484"), 'json-generator'); // default
      }
    };
    const [activeTab, setActiveTab] = useState(getActiveTabFromPath());

    // Load data from sessionStorage on mount
    useEffect(() => {
      if (stryMutAct_9fa48("17485")) {
        {}
      } else {
        stryCov_9fa48("17485");
        const originalContent = stryMutAct_9fa48("17488") ? sessionStorage.getItem('originalContent') && '' : stryMutAct_9fa48("17487") ? false : stryMutAct_9fa48("17486") ? true : (stryCov_9fa48("17486", "17487", "17488"), sessionStorage.getItem(stryMutAct_9fa48("17489") ? "" : (stryCov_9fa48("17489"), 'originalContent')) || (stryMutAct_9fa48("17490") ? "Stryker was here!" : (stryCov_9fa48("17490"), '')));
        const generatedSessionData = stryMutAct_9fa48("17493") ? sessionStorage.getItem('generatedSessionData') && '' : stryMutAct_9fa48("17492") ? false : stryMutAct_9fa48("17491") ? true : (stryCov_9fa48("17491", "17492", "17493"), sessionStorage.getItem(stryMutAct_9fa48("17494") ? "" : (stryCov_9fa48("17494"), 'generatedSessionData')) || (stryMutAct_9fa48("17495") ? "Stryker was here!" : (stryCov_9fa48("17495"), '')));
        setSharedData(stryMutAct_9fa48("17496") ? () => undefined : (stryCov_9fa48("17496"), prev => stryMutAct_9fa48("17497") ? {} : (stryCov_9fa48("17497"), {
          ...prev,
          originalContent,
          generatedJSON: generatedSessionData,
          editedJSON: generatedSessionData
        })));
      }
    }, stryMutAct_9fa48("17498") ? ["Stryker was here"] : (stryCov_9fa48("17498"), []));
    const handleTabChange = tab => {
      if (stryMutAct_9fa48("17499")) {
        {}
      } else {
        stryCov_9fa48("17499");
        setActiveTab(tab);
        // Update URL without losing tab-specific routes
        if (stryMutAct_9fa48("17502") ? tab !== 'facilitator-notes' : stryMutAct_9fa48("17501") ? false : stryMutAct_9fa48("17500") ? true : (stryCov_9fa48("17500", "17501", "17502"), tab === (stryMutAct_9fa48("17503") ? "" : (stryCov_9fa48("17503"), 'facilitator-notes')))) {
          if (stryMutAct_9fa48("17504")) {
            {}
          } else {
            stryCov_9fa48("17504");
            navigate(stryMutAct_9fa48("17505") ? "" : (stryCov_9fa48("17505"), '/content/facilitator-notes'));
          }
        } else if (stryMutAct_9fa48("17508") ? tab !== 'session-tester' : stryMutAct_9fa48("17507") ? false : stryMutAct_9fa48("17506") ? true : (stryCov_9fa48("17506", "17507", "17508"), tab === (stryMutAct_9fa48("17509") ? "" : (stryCov_9fa48("17509"), 'session-tester')))) {
          if (stryMutAct_9fa48("17510")) {
            {}
          } else {
            stryCov_9fa48("17510");
            navigate(stryMutAct_9fa48("17511") ? "" : (stryCov_9fa48("17511"), '/content/session-tester'));
          }
        } else {
          if (stryMutAct_9fa48("17512")) {
            {}
          } else {
            stryCov_9fa48("17512");
            navigate(stryMutAct_9fa48("17513") ? "" : (stryCov_9fa48("17513"), '/content'));
          }
        }
      }
    };

    // Callback functions for child components to update shared data
    const updateSharedData = updates => {
      if (stryMutAct_9fa48("17514")) {
        {}
      } else {
        stryCov_9fa48("17514");
        setSharedData(stryMutAct_9fa48("17515") ? () => undefined : (stryCov_9fa48("17515"), prev => stryMutAct_9fa48("17516") ? {} : (stryCov_9fa48("17516"), {
          ...prev,
          ...updates
        })));
      }
    };
    return <div className="content-generation">
      <div className="content-generation__header">
        <h1 className="content-generation__title">Content Generation Suite</h1>
        <p className="content-generation__subtitle">
          Create and test curriculum content with AI-powered tools
        </p>
      </div>

      <div className="content-generation__nav">
        <div className="content-generation__tabs">
          <button className={stryMutAct_9fa48("17517") ? `` : (stryCov_9fa48("17517"), `content-generation__tab ${(stryMutAct_9fa48("17520") ? activeTab !== 'json-generator' : stryMutAct_9fa48("17519") ? false : stryMutAct_9fa48("17518") ? true : (stryCov_9fa48("17518", "17519", "17520"), activeTab === (stryMutAct_9fa48("17521") ? "" : (stryCov_9fa48("17521"), 'json-generator')))) ? stryMutAct_9fa48("17522") ? "" : (stryCov_9fa48("17522"), 'content-generation__tab--active') : stryMutAct_9fa48("17523") ? "Stryker was here!" : (stryCov_9fa48("17523"), '')}`)} onClick={stryMutAct_9fa48("17524") ? () => undefined : (stryCov_9fa48("17524"), () => handleTabChange(stryMutAct_9fa48("17525") ? "" : (stryCov_9fa48("17525"), 'json-generator')))}>
            <span className="content-generation__tab-number">1</span>
            JSON Generator
          </button>
          <button className={stryMutAct_9fa48("17526") ? `` : (stryCov_9fa48("17526"), `content-generation__tab ${(stryMutAct_9fa48("17529") ? activeTab !== 'session-tester' : stryMutAct_9fa48("17528") ? false : stryMutAct_9fa48("17527") ? true : (stryCov_9fa48("17527", "17528", "17529"), activeTab === (stryMutAct_9fa48("17530") ? "" : (stryCov_9fa48("17530"), 'session-tester')))) ? stryMutAct_9fa48("17531") ? "" : (stryCov_9fa48("17531"), 'content-generation__tab--active') : stryMutAct_9fa48("17532") ? "Stryker was here!" : (stryCov_9fa48("17532"), '')}`)} onClick={stryMutAct_9fa48("17533") ? () => undefined : (stryCov_9fa48("17533"), () => handleTabChange(stryMutAct_9fa48("17534") ? "" : (stryCov_9fa48("17534"), 'session-tester')))}>
            <span className="content-generation__tab-number">2</span>
            Session Tester
          </button>
          <button className={stryMutAct_9fa48("17535") ? `` : (stryCov_9fa48("17535"), `content-generation__tab ${(stryMutAct_9fa48("17538") ? activeTab !== 'facilitator-notes' : stryMutAct_9fa48("17537") ? false : stryMutAct_9fa48("17536") ? true : (stryCov_9fa48("17536", "17537", "17538"), activeTab === (stryMutAct_9fa48("17539") ? "" : (stryCov_9fa48("17539"), 'facilitator-notes')))) ? stryMutAct_9fa48("17540") ? "" : (stryCov_9fa48("17540"), 'content-generation__tab--active') : stryMutAct_9fa48("17541") ? "Stryker was here!" : (stryCov_9fa48("17541"), '')}`)} onClick={stryMutAct_9fa48("17542") ? () => undefined : (stryCov_9fa48("17542"), () => handleTabChange(stryMutAct_9fa48("17543") ? "" : (stryCov_9fa48("17543"), 'facilitator-notes')))}>
            <span className="content-generation__tab-number">3</span>
            Facilitator Notes
          </button>
        </div>
      </div>

      <div className="content-generation__content">
        {stryMutAct_9fa48("17546") ? activeTab === 'json-generator' || <JSONGenerator sharedData={sharedData} updateSharedData={updateSharedData} /> : stryMutAct_9fa48("17545") ? false : stryMutAct_9fa48("17544") ? true : (stryCov_9fa48("17544", "17545", "17546"), (stryMutAct_9fa48("17548") ? activeTab !== 'json-generator' : stryMutAct_9fa48("17547") ? true : (stryCov_9fa48("17547", "17548"), activeTab === (stryMutAct_9fa48("17549") ? "" : (stryCov_9fa48("17549"), 'json-generator')))) && <JSONGenerator sharedData={sharedData} updateSharedData={updateSharedData} />)}
        {stryMutAct_9fa48("17552") ? activeTab === 'session-tester' || <SessionTester sharedData={sharedData} updateSharedData={updateSharedData} /> : stryMutAct_9fa48("17551") ? false : stryMutAct_9fa48("17550") ? true : (stryCov_9fa48("17550", "17551", "17552"), (stryMutAct_9fa48("17554") ? activeTab !== 'session-tester' : stryMutAct_9fa48("17553") ? true : (stryCov_9fa48("17553", "17554"), activeTab === (stryMutAct_9fa48("17555") ? "" : (stryCov_9fa48("17555"), 'session-tester')))) && <SessionTester sharedData={sharedData} updateSharedData={updateSharedData} />)}
        {stryMutAct_9fa48("17558") ? activeTab === 'facilitator-notes' || <FacilitatorNotesGenerator sharedData={sharedData} updateSharedData={updateSharedData} /> : stryMutAct_9fa48("17557") ? false : stryMutAct_9fa48("17556") ? true : (stryCov_9fa48("17556", "17557", "17558"), (stryMutAct_9fa48("17560") ? activeTab !== 'facilitator-notes' : stryMutAct_9fa48("17559") ? true : (stryCov_9fa48("17559", "17560"), activeTab === (stryMutAct_9fa48("17561") ? "" : (stryCov_9fa48("17561"), 'facilitator-notes')))) && <FacilitatorNotesGenerator sharedData={sharedData} updateSharedData={updateSharedData} />)}
      </div>
    </div>;
  }
};
export default Content;