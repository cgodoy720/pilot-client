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
import { getStrictContext } from '../../../../lib/get-strict-context';
import { Slot } from '../animate/slot';
const [RippleButtonProvider, useRippleButton] = getStrictContext(stryMutAct_9fa48("3741") ? "" : (stryCov_9fa48("3741"), 'RippleButtonContext'));
function RippleButton({
  ref,
  onClick,
  hoverScale = 1.05,
  tapScale = 0.95,
  asChild = stryMutAct_9fa48("3742") ? true : (stryCov_9fa48("3742"), false),
  style,
  ...props
}) {
  if (stryMutAct_9fa48("3743")) {
    {}
  } else {
    stryCov_9fa48("3743");
    const [ripples, setRipples] = React.useState(stryMutAct_9fa48("3744") ? ["Stryker was here"] : (stryCov_9fa48("3744"), []));
    const buttonRef = React.useRef(null);
    React.useImperativeHandle(ref, stryMutAct_9fa48("3745") ? () => undefined : (stryCov_9fa48("3745"), () => buttonRef.current));
    const createRipple = React.useCallback(event => {
      if (stryMutAct_9fa48("3746")) {
        {}
      } else {
        stryCov_9fa48("3746");
        const button = buttonRef.current;
        if (stryMutAct_9fa48("3749") ? false : stryMutAct_9fa48("3748") ? true : stryMutAct_9fa48("3747") ? button : (stryCov_9fa48("3747", "3748", "3749"), !button)) return;
        const rect = button.getBoundingClientRect();
        const x = stryMutAct_9fa48("3750") ? event.clientX + rect.left : (stryCov_9fa48("3750"), event.clientX - rect.left);
        const y = stryMutAct_9fa48("3751") ? event.clientY + rect.top : (stryCov_9fa48("3751"), event.clientY - rect.top);
        const newRipple = stryMutAct_9fa48("3752") ? {} : (stryCov_9fa48("3752"), {
          id: Date.now(),
          x,
          y
        });
        setRipples(stryMutAct_9fa48("3753") ? () => undefined : (stryCov_9fa48("3753"), prev => stryMutAct_9fa48("3754") ? [] : (stryCov_9fa48("3754"), [...prev, newRipple])));
        setTimeout(() => {
          if (stryMutAct_9fa48("3755")) {
            {}
          } else {
            stryCov_9fa48("3755");
            setRipples(stryMutAct_9fa48("3756") ? () => undefined : (stryCov_9fa48("3756"), prev => stryMutAct_9fa48("3757") ? prev : (stryCov_9fa48("3757"), prev.filter(stryMutAct_9fa48("3758") ? () => undefined : (stryCov_9fa48("3758"), r => stryMutAct_9fa48("3761") ? r.id === newRipple.id : stryMutAct_9fa48("3760") ? false : stryMutAct_9fa48("3759") ? true : (stryCov_9fa48("3759", "3760", "3761"), r.id !== newRipple.id))))));
          }
        }, 600);
      }
    }, stryMutAct_9fa48("3762") ? ["Stryker was here"] : (stryCov_9fa48("3762"), []));
    const handleClick = React.useCallback(event => {
      if (stryMutAct_9fa48("3763")) {
        {}
      } else {
        stryCov_9fa48("3763");
        createRipple(event);
        if (stryMutAct_9fa48("3765") ? false : stryMutAct_9fa48("3764") ? true : (stryCov_9fa48("3764", "3765"), onClick)) {
          if (stryMutAct_9fa48("3766")) {
            {}
          } else {
            stryCov_9fa48("3766");
            onClick(event);
          }
        }
      }
    }, stryMutAct_9fa48("3767") ? [] : (stryCov_9fa48("3767"), [createRipple, onClick]));
    const Component = asChild ? Slot : motion.button;
    return <RippleButtonProvider value={stryMutAct_9fa48("3768") ? {} : (stryCov_9fa48("3768"), {
      ripples,
      setRipples
    })}>
      <Component ref={buttonRef} data-slot="ripple-button" onClick={handleClick} whileTap={stryMutAct_9fa48("3769") ? {} : (stryCov_9fa48("3769"), {
        scale: tapScale
      })} whileHover={stryMutAct_9fa48("3770") ? {} : (stryCov_9fa48("3770"), {
        scale: hoverScale
      })} style={stryMutAct_9fa48("3771") ? {} : (stryCov_9fa48("3771"), {
        position: stryMutAct_9fa48("3772") ? "" : (stryCov_9fa48("3772"), 'relative'),
        overflow: stryMutAct_9fa48("3773") ? "" : (stryCov_9fa48("3773"), 'hidden'),
        ...style
      })} {...props} />
    </RippleButtonProvider>;
  }
}
function RippleButtonRipples({
  color = stryMutAct_9fa48("3774") ? "" : (stryCov_9fa48("3774"), 'var(--ripple-button-ripple-color)'),
  scale = 10,
  transition = stryMutAct_9fa48("3775") ? {} : (stryCov_9fa48("3775"), {
    duration: 0.6,
    ease: stryMutAct_9fa48("3776") ? "" : (stryCov_9fa48("3776"), 'easeOut')
  }),
  asChild = stryMutAct_9fa48("3777") ? true : (stryCov_9fa48("3777"), false),
  style,
  ...props
}) {
  if (stryMutAct_9fa48("3778")) {
    {}
  } else {
    stryCov_9fa48("3778");
    const {
      ripples
    } = useRippleButton();
    const Component = asChild ? Slot : motion.span;
    return ripples.map(stryMutAct_9fa48("3779") ? () => undefined : (stryCov_9fa48("3779"), ripple => <Component key={ripple.id} initial={stryMutAct_9fa48("3780") ? {} : (stryCov_9fa48("3780"), {
      scale: 0,
      opacity: 0.5
    })} animate={stryMutAct_9fa48("3781") ? {} : (stryCov_9fa48("3781"), {
      scale,
      opacity: 0
    })} transition={transition} style={stryMutAct_9fa48("3782") ? {} : (stryCov_9fa48("3782"), {
      position: stryMutAct_9fa48("3783") ? "" : (stryCov_9fa48("3783"), 'absolute'),
      borderRadius: stryMutAct_9fa48("3784") ? "" : (stryCov_9fa48("3784"), '50%'),
      pointerEvents: stryMutAct_9fa48("3785") ? "" : (stryCov_9fa48("3785"), 'none'),
      width: stryMutAct_9fa48("3786") ? "" : (stryCov_9fa48("3786"), '20px'),
      height: stryMutAct_9fa48("3787") ? "" : (stryCov_9fa48("3787"), '20px'),
      backgroundColor: color,
      top: stryMutAct_9fa48("3788") ? ripple.y + 10 : (stryCov_9fa48("3788"), ripple.y - 10),
      left: stryMutAct_9fa48("3789") ? ripple.x + 10 : (stryCov_9fa48("3789"), ripple.x - 10),
      ...style
    })} {...props} />));
  }
}
export { RippleButton, RippleButtonRipples };