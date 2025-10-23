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
import * as React from "react";
const MOBILE_BREAKPOINT = 768;
export function useIsMobile() {
  if (stryMutAct_9fa48("4498")) {
    {}
  } else {
    stryCov_9fa48("4498");
    const [isMobile, setIsMobile] = React.useState(undefined);
    React.useEffect(() => {
      if (stryMutAct_9fa48("4499")) {
        {}
      } else {
        stryCov_9fa48("4499");
        const mql = window.matchMedia(stryMutAct_9fa48("4500") ? `` : (stryCov_9fa48("4500"), `(max-width: ${stryMutAct_9fa48("4501") ? MOBILE_BREAKPOINT + 1 : (stryCov_9fa48("4501"), MOBILE_BREAKPOINT - 1)}px)`));
        const onChange = () => {
          if (stryMutAct_9fa48("4502")) {
            {}
          } else {
            stryCov_9fa48("4502");
            setIsMobile(stryMutAct_9fa48("4506") ? window.innerWidth >= MOBILE_BREAKPOINT : stryMutAct_9fa48("4505") ? window.innerWidth <= MOBILE_BREAKPOINT : stryMutAct_9fa48("4504") ? false : stryMutAct_9fa48("4503") ? true : (stryCov_9fa48("4503", "4504", "4505", "4506"), window.innerWidth < MOBILE_BREAKPOINT));
          }
        };
        mql.addEventListener(stryMutAct_9fa48("4507") ? "" : (stryCov_9fa48("4507"), "change"), onChange);
        setIsMobile(stryMutAct_9fa48("4511") ? window.innerWidth >= MOBILE_BREAKPOINT : stryMutAct_9fa48("4510") ? window.innerWidth <= MOBILE_BREAKPOINT : stryMutAct_9fa48("4509") ? false : stryMutAct_9fa48("4508") ? true : (stryCov_9fa48("4508", "4509", "4510", "4511"), window.innerWidth < MOBILE_BREAKPOINT));
        return stryMutAct_9fa48("4512") ? () => undefined : (stryCov_9fa48("4512"), () => mql.removeEventListener(stryMutAct_9fa48("4513") ? "" : (stryCov_9fa48("4513"), "change"), onChange));
      }
    }, stryMutAct_9fa48("4514") ? ["Stryker was here"] : (stryCov_9fa48("4514"), []));
    return stryMutAct_9fa48("4515") ? !isMobile : (stryCov_9fa48("4515"), !(stryMutAct_9fa48("4516") ? isMobile : (stryCov_9fa48("4516"), !isMobile)));
  }
}