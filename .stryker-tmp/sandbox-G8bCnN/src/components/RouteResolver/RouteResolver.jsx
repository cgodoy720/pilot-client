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
import { useParams } from 'react-router-dom';

/**
 * RouteResolver component to render different components based on route parameters
 * @param {Object} props
 * @param {React.ReactNode} props.selfComponent - Component to render for self assessments
 * @param {React.ReactNode} props.defaultComponent - Component to render for other assessments
 */
function RouteResolver({
  selfComponent,
  defaultComponent
}) {
  if (stryMutAct_9fa48("2613")) {
    {}
  } else {
    stryCov_9fa48("2613");
    const {
      assessmentType
    } = useParams();

    // Render selfComponent for self assessments, otherwise render defaultComponent
    return (stryMutAct_9fa48("2616") ? assessmentType !== 'self' : stryMutAct_9fa48("2615") ? false : stryMutAct_9fa48("2614") ? true : (stryCov_9fa48("2614", "2615", "2616"), assessmentType === (stryMutAct_9fa48("2617") ? "" : (stryCov_9fa48("2617"), 'self')))) ? selfComponent : defaultComponent;
  }
}
export default RouteResolver;