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
import * as SeparatorPrimitive from "@radix-ui/react-separator";
import { cn } from "src/lib/utils";
const Separator = React.forwardRef(stryMutAct_9fa48("4242") ? () => undefined : (stryCov_9fa48("4242"), ({
  className,
  orientation = stryMutAct_9fa48("4243") ? "" : (stryCov_9fa48("4243"), "horizontal"),
  decorative = stryMutAct_9fa48("4244") ? false : (stryCov_9fa48("4244"), true),
  ...props
}, ref) => <SeparatorPrimitive.Root ref={ref} decorative={decorative} orientation={orientation} className={cn(stryMutAct_9fa48("4245") ? "" : (stryCov_9fa48("4245"), "shrink-0 bg-border"), (stryMutAct_9fa48("4248") ? orientation !== "horizontal" : stryMutAct_9fa48("4247") ? false : stryMutAct_9fa48("4246") ? true : (stryCov_9fa48("4246", "4247", "4248"), orientation === (stryMutAct_9fa48("4249") ? "" : (stryCov_9fa48("4249"), "horizontal")))) ? stryMutAct_9fa48("4250") ? "" : (stryCov_9fa48("4250"), "h-[1px] w-full") : stryMutAct_9fa48("4251") ? "" : (stryCov_9fa48("4251"), "h-full w-[1px]"), className)} {...props} />));
Separator.displayName = SeparatorPrimitive.Root.displayName;
export { Separator };