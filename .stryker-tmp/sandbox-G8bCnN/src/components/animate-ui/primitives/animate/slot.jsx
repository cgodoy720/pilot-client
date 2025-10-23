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
import { motion, isMotionComponent } from 'motion/react';
import { cn } from '../../../../lib/utils';
function mergeRefs(...refs) {
  if (stryMutAct_9fa48("3442")) {
    {}
  } else {
    stryCov_9fa48("3442");
    return node => {
      if (stryMutAct_9fa48("3443")) {
        {}
      } else {
        stryCov_9fa48("3443");
        refs.forEach(ref => {
          if (stryMutAct_9fa48("3444")) {
            {}
          } else {
            stryCov_9fa48("3444");
            if (stryMutAct_9fa48("3447") ? false : stryMutAct_9fa48("3446") ? true : stryMutAct_9fa48("3445") ? ref : (stryCov_9fa48("3445", "3446", "3447"), !ref)) return;
            if (stryMutAct_9fa48("3450") ? typeof ref !== 'function' : stryMutAct_9fa48("3449") ? false : stryMutAct_9fa48("3448") ? true : (stryCov_9fa48("3448", "3449", "3450"), typeof ref === (stryMutAct_9fa48("3451") ? "" : (stryCov_9fa48("3451"), 'function')))) {
              if (stryMutAct_9fa48("3452")) {
                {}
              } else {
                stryCov_9fa48("3452");
                ref(node);
              }
            } else {
              if (stryMutAct_9fa48("3453")) {
                {}
              } else {
                stryCov_9fa48("3453");
                ref.current = node;
              }
            }
          }
        });
      }
    };
  }
}
function mergeProps(childProps, slotProps) {
  if (stryMutAct_9fa48("3454")) {
    {}
  } else {
    stryCov_9fa48("3454");
    const merged = stryMutAct_9fa48("3455") ? {} : (stryCov_9fa48("3455"), {
      ...childProps,
      ...slotProps
    });
    if (stryMutAct_9fa48("3458") ? childProps.className && slotProps.className : stryMutAct_9fa48("3457") ? false : stryMutAct_9fa48("3456") ? true : (stryCov_9fa48("3456", "3457", "3458"), childProps.className || slotProps.className)) {
      if (stryMutAct_9fa48("3459")) {
        {}
      } else {
        stryCov_9fa48("3459");
        merged.className = cn(childProps.className, slotProps.className);
      }
    }
    if (stryMutAct_9fa48("3462") ? childProps.style && slotProps.style : stryMutAct_9fa48("3461") ? false : stryMutAct_9fa48("3460") ? true : (stryCov_9fa48("3460", "3461", "3462"), childProps.style || slotProps.style)) {
      if (stryMutAct_9fa48("3463")) {
        {}
      } else {
        stryCov_9fa48("3463");
        merged.style = stryMutAct_9fa48("3464") ? {} : (stryCov_9fa48("3464"), {
          ...childProps.style,
          ...slotProps.style
        });
      }
    }
    return merged;
  }
}
function Slot({
  children,
  ref,
  ...props
}) {
  if (stryMutAct_9fa48("3465")) {
    {}
  } else {
    stryCov_9fa48("3465");
    const isAlreadyMotion = stryMutAct_9fa48("3468") ? typeof children.type === 'object' && children.type !== null || isMotionComponent(children.type) : stryMutAct_9fa48("3467") ? false : stryMutAct_9fa48("3466") ? true : (stryCov_9fa48("3466", "3467", "3468"), (stryMutAct_9fa48("3470") ? typeof children.type === 'object' || children.type !== null : stryMutAct_9fa48("3469") ? true : (stryCov_9fa48("3469", "3470"), (stryMutAct_9fa48("3472") ? typeof children.type !== 'object' : stryMutAct_9fa48("3471") ? true : (stryCov_9fa48("3471", "3472"), typeof children.type === (stryMutAct_9fa48("3473") ? "" : (stryCov_9fa48("3473"), 'object')))) && (stryMutAct_9fa48("3475") ? children.type === null : stryMutAct_9fa48("3474") ? true : (stryCov_9fa48("3474", "3475"), children.type !== null)))) && isMotionComponent(children.type));
    const Base = React.useMemo(stryMutAct_9fa48("3476") ? () => undefined : (stryCov_9fa48("3476"), () => isAlreadyMotion ? children.type : motion.create(children.type)), stryMutAct_9fa48("3477") ? [] : (stryCov_9fa48("3477"), [isAlreadyMotion, children.type]));
    if (stryMutAct_9fa48("3480") ? false : stryMutAct_9fa48("3479") ? true : stryMutAct_9fa48("3478") ? React.isValidElement(children) : (stryCov_9fa48("3478", "3479", "3480"), !React.isValidElement(children))) return null;
    const {
      ref: childRef,
      ...childProps
    } = children.props;
    const mergedProps = mergeProps(childProps, props);
    return <Base {...mergedProps} ref={mergeRefs(childRef, ref)} />;
  }
}
export { Slot };