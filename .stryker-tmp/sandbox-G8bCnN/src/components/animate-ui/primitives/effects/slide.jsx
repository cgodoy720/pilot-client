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
import { useIsInView } from '../../../../hooks/use-is-in-view';
import { Slot } from '../animate/slot';
function Slide({
  ref,
  transition = stryMutAct_9fa48("4090") ? {} : (stryCov_9fa48("4090"), {
    type: stryMutAct_9fa48("4091") ? "" : (stryCov_9fa48("4091"), 'spring'),
    stiffness: 200,
    damping: 20
  }),
  delay = 0,
  inView = stryMutAct_9fa48("4092") ? true : (stryCov_9fa48("4092"), false),
  inViewMargin = stryMutAct_9fa48("4093") ? "" : (stryCov_9fa48("4093"), '0px'),
  inViewOnce = stryMutAct_9fa48("4094") ? false : (stryCov_9fa48("4094"), true),
  direction = stryMutAct_9fa48("4095") ? "" : (stryCov_9fa48("4095"), 'up'),
  offset = 100,
  asChild = stryMutAct_9fa48("4096") ? true : (stryCov_9fa48("4096"), false),
  ...props
}) {
  if (stryMutAct_9fa48("4097")) {
    {}
  } else {
    stryCov_9fa48("4097");
    const {
      ref: localRef,
      isInView
    } = useIsInView(ref, stryMutAct_9fa48("4098") ? {} : (stryCov_9fa48("4098"), {
      inView,
      inViewOnce,
      inViewMargin
    }));
    const axis = (stryMutAct_9fa48("4101") ? direction === 'up' && direction === 'down' : stryMutAct_9fa48("4100") ? false : stryMutAct_9fa48("4099") ? true : (stryCov_9fa48("4099", "4100", "4101"), (stryMutAct_9fa48("4103") ? direction !== 'up' : stryMutAct_9fa48("4102") ? false : (stryCov_9fa48("4102", "4103"), direction === (stryMutAct_9fa48("4104") ? "" : (stryCov_9fa48("4104"), 'up')))) || (stryMutAct_9fa48("4106") ? direction !== 'down' : stryMutAct_9fa48("4105") ? false : (stryCov_9fa48("4105", "4106"), direction === (stryMutAct_9fa48("4107") ? "" : (stryCov_9fa48("4107"), 'down')))))) ? stryMutAct_9fa48("4108") ? "" : (stryCov_9fa48("4108"), 'y') : stryMutAct_9fa48("4109") ? "" : (stryCov_9fa48("4109"), 'x');
    const hidden = stryMutAct_9fa48("4110") ? {} : (stryCov_9fa48("4110"), {
      [axis]: (stryMutAct_9fa48("4113") ? direction === 'right' && direction === 'down' : stryMutAct_9fa48("4112") ? false : stryMutAct_9fa48("4111") ? true : (stryCov_9fa48("4111", "4112", "4113"), (stryMutAct_9fa48("4115") ? direction !== 'right' : stryMutAct_9fa48("4114") ? false : (stryCov_9fa48("4114", "4115"), direction === (stryMutAct_9fa48("4116") ? "" : (stryCov_9fa48("4116"), 'right')))) || (stryMutAct_9fa48("4118") ? direction !== 'down' : stryMutAct_9fa48("4117") ? false : (stryCov_9fa48("4117", "4118"), direction === (stryMutAct_9fa48("4119") ? "" : (stryCov_9fa48("4119"), 'down')))))) ? stryMutAct_9fa48("4120") ? +offset : (stryCov_9fa48("4120"), -offset) : offset
    });
    const visible = stryMutAct_9fa48("4121") ? {} : (stryCov_9fa48("4121"), {
      [axis]: 0
    });
    const Component = asChild ? Slot : motion.div;
    return <Component ref={localRef} initial="hidden" animate={isInView ? stryMutAct_9fa48("4122") ? "" : (stryCov_9fa48("4122"), 'visible') : stryMutAct_9fa48("4123") ? "" : (stryCov_9fa48("4123"), 'hidden')} exit="hidden" variants={stryMutAct_9fa48("4124") ? {} : (stryCov_9fa48("4124"), {
      hidden,
      visible
    })} transition={stryMutAct_9fa48("4125") ? {} : (stryCov_9fa48("4125"), {
      ...transition,
      delay: stryMutAct_9fa48("4126") ? (transition?.delay ?? 0) - delay / 1000 : (stryCov_9fa48("4126"), (stryMutAct_9fa48("4127") ? transition?.delay && 0 : (stryCov_9fa48("4127"), (stryMutAct_9fa48("4128") ? transition.delay : (stryCov_9fa48("4128"), transition?.delay)) ?? 0)) + (stryMutAct_9fa48("4129") ? delay * 1000 : (stryCov_9fa48("4129"), delay / 1000)))
    })} {...props} />;
  }
}
function Slides({
  children,
  delay = 0,
  holdDelay = 0,
  ...props
}) {
  if (stryMutAct_9fa48("4130")) {
    {}
  } else {
    stryCov_9fa48("4130");
    const array = React.Children.toArray(children);
    return <>
      {array.map(stryMutAct_9fa48("4131") ? () => undefined : (stryCov_9fa48("4131"), (child, index) => <Slide key={stryMutAct_9fa48("4132") ? child.key && index : (stryCov_9fa48("4132"), child.key ?? index)} delay={stryMutAct_9fa48("4133") ? delay - index * holdDelay : (stryCov_9fa48("4133"), delay + (stryMutAct_9fa48("4134") ? index / holdDelay : (stryCov_9fa48("4134"), index * holdDelay)))} {...props}>
          {child}
        </Slide>))}
    </>;
  }
}
export { Slide, Slides };