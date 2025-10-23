// @ts-nocheck
'use client';

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
;
import * as React from 'react';
import { motion } from 'motion/react';
import { Slot } from '../animate/slot';
function Button({
  hoverScale = 1.05,
  tapScale = 0.95,
  asChild = stryMutAct_9fa48("3737") ? true : (stryCov_9fa48("3737"), false),
  ...props
}) {
  if (stryMutAct_9fa48("3738")) {
    {}
  } else {
    stryCov_9fa48("3738");
    const Component = asChild ? Slot : motion.button;
    return <Component whileTap={stryMutAct_9fa48("3739") ? {} : (stryCov_9fa48("3739"), {
      scale: tapScale
    })} whileHover={stryMutAct_9fa48("3740") ? {} : (stryCov_9fa48("3740"), {
      scale: hoverScale
    })} {...props} />;
  }
}
export { Button };