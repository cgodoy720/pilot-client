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
import * as motion from 'motion/react-client';
import { TooltipProvider as TooltipProviderPrimitive, Tooltip as TooltipPrimitive, TooltipTrigger as TooltipTriggerPrimitive, TooltipContent as TooltipContentPrimitive, TooltipArrow as TooltipArrowPrimitive } from '../../primitives/animate/tooltip';
import { cn } from '../../../../lib/utils';
function TooltipProvider({
  openDelay = 0,
  ...props
}) {
  if (stryMutAct_9fa48("3146")) {
    {}
  } else {
    stryCov_9fa48("3146");
    return <TooltipProviderPrimitive openDelay={openDelay} {...props} />;
  }
}
function Tooltip({
  sideOffset = 10,
  ...props
}) {
  if (stryMutAct_9fa48("3147")) {
    {}
  } else {
    stryCov_9fa48("3147");
    return <TooltipPrimitive sideOffset={sideOffset} {...props} />;
  }
}
function TooltipTrigger({
  ...props
}) {
  if (stryMutAct_9fa48("3148")) {
    {}
  } else {
    stryCov_9fa48("3148");
    return <TooltipTriggerPrimitive {...props} />;
  }
}
function TooltipContent({
  className,
  children,
  layout = stryMutAct_9fa48("3149") ? "" : (stryCov_9fa48("3149"), 'preserve-aspect'),
  ...props
}) {
  if (stryMutAct_9fa48("3150")) {
    {}
  } else {
    stryCov_9fa48("3150");
    return <TooltipContentPrimitive className={cn(stryMutAct_9fa48("3151") ? "" : (stryCov_9fa48("3151"), 'z-50 w-fit bg-primary text-primary-foreground rounded-md'), className)} {...props}>
      <motion.div className="overflow-hidden px-3 py-1.5 text-xs text-balance">
        <motion.div layout={layout}>{children}</motion.div>
      </motion.div>
      <TooltipArrowPrimitive className="fill-primary size-3 data-[side='bottom']:translate-y-[1px] data-[side='right']:translate-x-[1px] data-[side='left']:translate-x-[-1px] data-[side='top']:translate-y-[-1px]" tipRadius={2} />
    </TooltipContentPrimitive>;
  }
}
export { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent };