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
function getStrictContext(name) {
  if (stryMutAct_9fa48("4517")) {
    {}
  } else {
    stryCov_9fa48("4517");
    const Context = React.createContext(undefined);
    const Provider = stryMutAct_9fa48("4518") ? () => undefined : (stryCov_9fa48("4518"), (() => {
      const Provider = ({
        value,
        children
      }) => <Context.Provider value={value}>{children}</Context.Provider>;
      return Provider;
    })());
    const useSafeContext = () => {
      if (stryMutAct_9fa48("4519")) {
        {}
      } else {
        stryCov_9fa48("4519");
        const ctx = React.useContext(Context);
        if (stryMutAct_9fa48("4522") ? ctx !== undefined : stryMutAct_9fa48("4521") ? false : stryMutAct_9fa48("4520") ? true : (stryCov_9fa48("4520", "4521", "4522"), ctx === undefined)) {
          if (stryMutAct_9fa48("4523")) {
            {}
          } else {
            stryCov_9fa48("4523");
            throw new Error(stryMutAct_9fa48("4524") ? `` : (stryCov_9fa48("4524"), `useContext must be used within ${stryMutAct_9fa48("4525") ? name && 'a Provider' : (stryCov_9fa48("4525"), name ?? (stryMutAct_9fa48("4526") ? "" : (stryCov_9fa48("4526"), 'a Provider')))}`));
          }
        }
        return ctx;
      }
    };
    return stryMutAct_9fa48("4527") ? [] : (stryCov_9fa48("4527"), [Provider, useSafeContext]);
  }
}
export { getStrictContext };