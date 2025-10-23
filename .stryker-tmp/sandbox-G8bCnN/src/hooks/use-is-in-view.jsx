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
import * as React from 'react';
import { useInView } from 'motion/react';
function useIsInView(ref, options = {}) {
  if (stryMutAct_9fa48("4488")) {
    {}
  } else {
    stryCov_9fa48("4488");
    const {
      inView,
      inViewOnce = stryMutAct_9fa48("4489") ? true : (stryCov_9fa48("4489"), false),
      inViewMargin = stryMutAct_9fa48("4490") ? "" : (stryCov_9fa48("4490"), '0px')
    } = options;
    const localRef = React.useRef(null);
    React.useImperativeHandle(ref, stryMutAct_9fa48("4491") ? () => undefined : (stryCov_9fa48("4491"), () => localRef.current));
    const inViewResult = useInView(localRef, stryMutAct_9fa48("4492") ? {} : (stryCov_9fa48("4492"), {
      once: inViewOnce,
      margin: inViewMargin
    }));
    const isInView = stryMutAct_9fa48("4495") ? !inView && inViewResult : stryMutAct_9fa48("4494") ? false : stryMutAct_9fa48("4493") ? true : (stryCov_9fa48("4493", "4494", "4495"), (stryMutAct_9fa48("4496") ? inView : (stryCov_9fa48("4496"), !inView)) || inViewResult);
    return stryMutAct_9fa48("4497") ? {} : (stryCov_9fa48("4497"), {
      ref: localRef,
      isInView
    });
  }
}
export { useIsInView };