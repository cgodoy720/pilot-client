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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useControlledState(props) {
  if (stryMutAct_9fa48("4475")) {
    {}
  } else {
    stryCov_9fa48("4475");
    const {
      value,
      defaultValue,
      onChange
    } = props;
    const [state, setInternalState] = React.useState((stryMutAct_9fa48("4478") ? value === undefined : stryMutAct_9fa48("4477") ? false : stryMutAct_9fa48("4476") ? true : (stryCov_9fa48("4476", "4477", "4478"), value !== undefined)) ? value : defaultValue);
    React.useEffect(() => {
      if (stryMutAct_9fa48("4479")) {
        {}
      } else {
        stryCov_9fa48("4479");
        if (stryMutAct_9fa48("4482") ? value === undefined : stryMutAct_9fa48("4481") ? false : stryMutAct_9fa48("4480") ? true : (stryCov_9fa48("4480", "4481", "4482"), value !== undefined)) setInternalState(value);
      }
    }, stryMutAct_9fa48("4483") ? [] : (stryCov_9fa48("4483"), [value]));
    const setState = React.useCallback((next, ...args) => {
      if (stryMutAct_9fa48("4484")) {
        {}
      } else {
        stryCov_9fa48("4484");
        setInternalState(next);
        stryMutAct_9fa48("4485") ? onChange(next, ...args) : (stryCov_9fa48("4485"), onChange?.(next, ...args));
      }
    }, stryMutAct_9fa48("4486") ? [] : (stryCov_9fa48("4486"), [onChange]));
    return stryMutAct_9fa48("4487") ? [] : (stryCov_9fa48("4487"), [state, setState]);
  }
}