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
import { motion, AnimatePresence, LayoutGroup } from 'motion/react';
import { useFloating, autoUpdate, offset as floatingOffset, flip, shift, arrow as floatingArrow, FloatingPortal, FloatingArrow } from '@floating-ui/react';
import { getStrictContext } from '../../../../lib/get-strict-context';
import { Slot } from './slot';
const [GlobalTooltipProvider, useGlobalTooltip] = getStrictContext(stryMutAct_9fa48("3481") ? "" : (stryCov_9fa48("3481"), 'GlobalTooltipProvider'));
const [LocalTooltipProvider, useTooltip] = getStrictContext(stryMutAct_9fa48("3482") ? "" : (stryCov_9fa48("3482"), 'LocalTooltipProvider'));
function getResolvedSide(placement) {
  if (stryMutAct_9fa48("3483")) {
    {}
  } else {
    stryCov_9fa48("3483");
    if (stryMutAct_9fa48("3485") ? false : stryMutAct_9fa48("3484") ? true : (stryCov_9fa48("3484", "3485"), placement.includes(stryMutAct_9fa48("3486") ? "" : (stryCov_9fa48("3486"), '-')))) {
      if (stryMutAct_9fa48("3487")) {
        {}
      } else {
        stryCov_9fa48("3487");
        return placement.split(stryMutAct_9fa48("3488") ? "" : (stryCov_9fa48("3488"), '-'))[0];
      }
    }
    return placement;
  }
}
function initialFromSide(side) {
  if (stryMutAct_9fa48("3489")) {
    {}
  } else {
    stryCov_9fa48("3489");
    if (stryMutAct_9fa48("3492") ? side !== 'top' : stryMutAct_9fa48("3491") ? false : stryMutAct_9fa48("3490") ? true : (stryCov_9fa48("3490", "3491", "3492"), side === (stryMutAct_9fa48("3493") ? "" : (stryCov_9fa48("3493"), 'top')))) return stryMutAct_9fa48("3494") ? {} : (stryCov_9fa48("3494"), {
      y: 15
    });
    if (stryMutAct_9fa48("3497") ? side !== 'bottom' : stryMutAct_9fa48("3496") ? false : stryMutAct_9fa48("3495") ? true : (stryCov_9fa48("3495", "3496", "3497"), side === (stryMutAct_9fa48("3498") ? "" : (stryCov_9fa48("3498"), 'bottom')))) return stryMutAct_9fa48("3499") ? {} : (stryCov_9fa48("3499"), {
      y: stryMutAct_9fa48("3500") ? +15 : (stryCov_9fa48("3500"), -15)
    });
    if (stryMutAct_9fa48("3503") ? side !== 'left' : stryMutAct_9fa48("3502") ? false : stryMutAct_9fa48("3501") ? true : (stryCov_9fa48("3501", "3502", "3503"), side === (stryMutAct_9fa48("3504") ? "" : (stryCov_9fa48("3504"), 'left')))) return stryMutAct_9fa48("3505") ? {} : (stryCov_9fa48("3505"), {
      x: 15
    });
    return stryMutAct_9fa48("3506") ? {} : (stryCov_9fa48("3506"), {
      x: stryMutAct_9fa48("3507") ? +15 : (stryCov_9fa48("3507"), -15)
    });
  }
}
function TooltipProvider({
  children,
  id,
  openDelay = 700,
  closeDelay = 300,
  transition = stryMutAct_9fa48("3508") ? {} : (stryCov_9fa48("3508"), {
    type: stryMutAct_9fa48("3509") ? "" : (stryCov_9fa48("3509"), 'spring'),
    stiffness: 300,
    damping: 35
  })
}) {
  if (stryMutAct_9fa48("3510")) {
    {}
  } else {
    stryCov_9fa48("3510");
    const globalId = React.useId();
    const [currentTooltip, setCurrentTooltip] = React.useState(null);
    const timeoutRef = React.useRef(null);
    const lastCloseTimeRef = React.useRef(0);
    const referenceElRef = React.useRef(null);
    const showTooltip = React.useCallback(data => {
      if (stryMutAct_9fa48("3511")) {
        {}
      } else {
        stryCov_9fa48("3511");
        if (stryMutAct_9fa48("3513") ? false : stryMutAct_9fa48("3512") ? true : (stryCov_9fa48("3512", "3513"), timeoutRef.current)) clearTimeout(timeoutRef.current);
        if (stryMutAct_9fa48("3516") ? currentTooltip === null : stryMutAct_9fa48("3515") ? false : stryMutAct_9fa48("3514") ? true : (stryCov_9fa48("3514", "3515", "3516"), currentTooltip !== null)) {
          if (stryMutAct_9fa48("3517")) {
            {}
          } else {
            stryCov_9fa48("3517");
            setCurrentTooltip(data);
            return;
          }
        }
        const now = Date.now();
        const delay = (stryMutAct_9fa48("3521") ? now - lastCloseTimeRef.current >= closeDelay : stryMutAct_9fa48("3520") ? now - lastCloseTimeRef.current <= closeDelay : stryMutAct_9fa48("3519") ? false : stryMutAct_9fa48("3518") ? true : (stryCov_9fa48("3518", "3519", "3520", "3521"), (stryMutAct_9fa48("3522") ? now + lastCloseTimeRef.current : (stryCov_9fa48("3522"), now - lastCloseTimeRef.current)) < closeDelay)) ? 0 : openDelay;
        timeoutRef.current = window.setTimeout(stryMutAct_9fa48("3523") ? () => undefined : (stryCov_9fa48("3523"), () => setCurrentTooltip(data)), delay);
      }
    }, stryMutAct_9fa48("3524") ? [] : (stryCov_9fa48("3524"), [openDelay, closeDelay, currentTooltip]));
    const hideTooltip = React.useCallback(() => {
      if (stryMutAct_9fa48("3525")) {
        {}
      } else {
        stryCov_9fa48("3525");
        if (stryMutAct_9fa48("3527") ? false : stryMutAct_9fa48("3526") ? true : (stryCov_9fa48("3526", "3527"), timeoutRef.current)) clearTimeout(timeoutRef.current);
        timeoutRef.current = window.setTimeout(() => {
          if (stryMutAct_9fa48("3528")) {
            {}
          } else {
            stryCov_9fa48("3528");
            setCurrentTooltip(null);
            lastCloseTimeRef.current = Date.now();
          }
        }, closeDelay);
      }
    }, stryMutAct_9fa48("3529") ? [] : (stryCov_9fa48("3529"), [closeDelay]));
    const hideImmediate = React.useCallback(() => {
      if (stryMutAct_9fa48("3530")) {
        {}
      } else {
        stryCov_9fa48("3530");
        if (stryMutAct_9fa48("3532") ? false : stryMutAct_9fa48("3531") ? true : (stryCov_9fa48("3531", "3532"), timeoutRef.current)) clearTimeout(timeoutRef.current);
        setCurrentTooltip(null);
        lastCloseTimeRef.current = Date.now();
      }
    }, stryMutAct_9fa48("3533") ? ["Stryker was here"] : (stryCov_9fa48("3533"), []));
    const setReferenceEl = React.useCallback(el => {
      if (stryMutAct_9fa48("3534")) {
        {}
      } else {
        stryCov_9fa48("3534");
        referenceElRef.current = el;
      }
    }, stryMutAct_9fa48("3535") ? ["Stryker was here"] : (stryCov_9fa48("3535"), []));
    React.useEffect(() => {
      if (stryMutAct_9fa48("3536")) {
        {}
      } else {
        stryCov_9fa48("3536");
        const onKeyDown = e => {
          if (stryMutAct_9fa48("3537")) {
            {}
          } else {
            stryCov_9fa48("3537");
            if (stryMutAct_9fa48("3540") ? e.key !== 'Escape' : stryMutAct_9fa48("3539") ? false : stryMutAct_9fa48("3538") ? true : (stryCov_9fa48("3538", "3539", "3540"), e.key === (stryMutAct_9fa48("3541") ? "" : (stryCov_9fa48("3541"), 'Escape')))) hideImmediate();
          }
        };
        window.addEventListener(stryMutAct_9fa48("3542") ? "" : (stryCov_9fa48("3542"), 'keydown'), onKeyDown, stryMutAct_9fa48("3543") ? false : (stryCov_9fa48("3543"), true));
        window.addEventListener(stryMutAct_9fa48("3544") ? "" : (stryCov_9fa48("3544"), 'scroll'), hideImmediate, stryMutAct_9fa48("3545") ? false : (stryCov_9fa48("3545"), true));
        window.addEventListener(stryMutAct_9fa48("3546") ? "" : (stryCov_9fa48("3546"), 'resize'), hideImmediate, stryMutAct_9fa48("3547") ? false : (stryCov_9fa48("3547"), true));
        return () => {
          if (stryMutAct_9fa48("3548")) {
            {}
          } else {
            stryCov_9fa48("3548");
            window.removeEventListener(stryMutAct_9fa48("3549") ? "" : (stryCov_9fa48("3549"), 'keydown'), onKeyDown, stryMutAct_9fa48("3550") ? false : (stryCov_9fa48("3550"), true));
            window.removeEventListener(stryMutAct_9fa48("3551") ? "" : (stryCov_9fa48("3551"), 'scroll'), hideImmediate, stryMutAct_9fa48("3552") ? false : (stryCov_9fa48("3552"), true));
            window.removeEventListener(stryMutAct_9fa48("3553") ? "" : (stryCov_9fa48("3553"), 'resize'), hideImmediate, stryMutAct_9fa48("3554") ? false : (stryCov_9fa48("3554"), true));
          }
        };
      }
    }, stryMutAct_9fa48("3555") ? [] : (stryCov_9fa48("3555"), [hideImmediate]));
    return <GlobalTooltipProvider value={stryMutAct_9fa48("3556") ? {} : (stryCov_9fa48("3556"), {
      showTooltip,
      hideTooltip,
      hideImmediate,
      currentTooltip,
      transition,
      globalId: stryMutAct_9fa48("3557") ? id && globalId : (stryCov_9fa48("3557"), id ?? globalId),
      setReferenceEl,
      referenceElRef
    })}>
      <LayoutGroup>{children}</LayoutGroup>
      <TooltipOverlay />
    </GlobalTooltipProvider>;
  }
}
const [RenderedTooltipProvider, useRenderedTooltip] = getStrictContext(stryMutAct_9fa48("3558") ? "" : (stryCov_9fa48("3558"), 'RenderedTooltipContext'));
const [FloatingProvider, useFloatingContext] = getStrictContext(stryMutAct_9fa48("3559") ? "" : (stryCov_9fa48("3559"), 'FloatingContext'));
const MotionTooltipArrow = motion.create(FloatingArrow);
function TooltipArrow({
  ref,
  withTransition = stryMutAct_9fa48("3560") ? false : (stryCov_9fa48("3560"), true),
  ...props
}) {
  if (stryMutAct_9fa48("3561")) {
    {}
  } else {
    stryCov_9fa48("3561");
    const {
      side,
      align,
      open
    } = useRenderedTooltip();
    const {
      context,
      arrowRef
    } = useFloatingContext();
    const {
      transition,
      globalId
    } = useGlobalTooltip();
    React.useImperativeHandle(ref, stryMutAct_9fa48("3562") ? () => undefined : (stryCov_9fa48("3562"), () => arrowRef.current));
    const deg = (stryMutAct_9fa48("3563") ? {} : (stryCov_9fa48("3563"), {
      top: 0,
      right: 90,
      bottom: 180,
      left: stryMutAct_9fa48("3564") ? +90 : (stryCov_9fa48("3564"), -90)
    }))[side];
    return <MotionTooltipArrow ref={arrowRef} context={context} data-state={open ? stryMutAct_9fa48("3565") ? "" : (stryCov_9fa48("3565"), 'open') : stryMutAct_9fa48("3566") ? "" : (stryCov_9fa48("3566"), 'closed')} data-side={side} data-align={align} data-slot="tooltip-arrow" style={stryMutAct_9fa48("3567") ? {} : (stryCov_9fa48("3567"), {
      rotate: deg
    })} layoutId={withTransition ? stryMutAct_9fa48("3568") ? `` : (stryCov_9fa48("3568"), `tooltip-arrow-${globalId}`) : undefined} transition={withTransition ? transition : undefined} {...props} />;
  }
}
function TooltipPortal(props) {
  if (stryMutAct_9fa48("3569")) {
    {}
  } else {
    stryCov_9fa48("3569");
    return <FloatingPortal {...props} />;
  }
}
function TooltipOverlay() {
  if (stryMutAct_9fa48("3570")) {
    {}
  } else {
    stryCov_9fa48("3570");
    const {
      currentTooltip,
      transition,
      globalId,
      referenceElRef
    } = useGlobalTooltip();
    const [rendered, setRendered] = React.useState(stryMutAct_9fa48("3571") ? {} : (stryCov_9fa48("3571"), {
      data: null,
      open: stryMutAct_9fa48("3572") ? true : (stryCov_9fa48("3572"), false)
    }));
    const arrowRef = React.useRef(null);
    const side = stryMutAct_9fa48("3573") ? rendered.data?.side && 'top' : (stryCov_9fa48("3573"), (stryMutAct_9fa48("3574") ? rendered.data.side : (stryCov_9fa48("3574"), rendered.data?.side)) ?? (stryMutAct_9fa48("3575") ? "" : (stryCov_9fa48("3575"), 'top')));
    const align = stryMutAct_9fa48("3576") ? rendered.data?.align && 'center' : (stryCov_9fa48("3576"), (stryMutAct_9fa48("3577") ? rendered.data.align : (stryCov_9fa48("3577"), rendered.data?.align)) ?? (stryMutAct_9fa48("3578") ? "" : (stryCov_9fa48("3578"), 'center')));
    const {
      refs,
      x,
      y,
      strategy,
      context,
      update
    } = useFloating(stryMutAct_9fa48("3579") ? {} : (stryCov_9fa48("3579"), {
      placement: (stryMutAct_9fa48("3582") ? align !== 'center' : stryMutAct_9fa48("3581") ? false : stryMutAct_9fa48("3580") ? true : (stryCov_9fa48("3580", "3581", "3582"), align === (stryMutAct_9fa48("3583") ? "" : (stryCov_9fa48("3583"), 'center')))) ? side : stryMutAct_9fa48("3584") ? `` : (stryCov_9fa48("3584"), `${side}-${align}`),
      whileElementsMounted: autoUpdate,
      middleware: stryMutAct_9fa48("3585") ? [] : (stryCov_9fa48("3585"), [floatingOffset(stryMutAct_9fa48("3586") ? {} : (stryCov_9fa48("3586"), {
        mainAxis: stryMutAct_9fa48("3587") ? rendered.data?.sideOffset && 0 : (stryCov_9fa48("3587"), (stryMutAct_9fa48("3588") ? rendered.data.sideOffset : (stryCov_9fa48("3588"), rendered.data?.sideOffset)) ?? 0),
        crossAxis: stryMutAct_9fa48("3589") ? rendered.data?.alignOffset && 0 : (stryCov_9fa48("3589"), (stryMutAct_9fa48("3590") ? rendered.data.alignOffset : (stryCov_9fa48("3590"), rendered.data?.alignOffset)) ?? 0)
      })), flip(), shift(stryMutAct_9fa48("3591") ? {} : (stryCov_9fa48("3591"), {
        padding: 8
      })), floatingArrow(stryMutAct_9fa48("3592") ? {} : (stryCov_9fa48("3592"), {
        element: arrowRef
      }))])
    }));
    React.useEffect(() => {
      if (stryMutAct_9fa48("3593")) {
        {}
      } else {
        stryCov_9fa48("3593");
        if (stryMutAct_9fa48("3595") ? false : stryMutAct_9fa48("3594") ? true : (stryCov_9fa48("3594", "3595"), currentTooltip)) {
          if (stryMutAct_9fa48("3596")) {
            {}
          } else {
            stryCov_9fa48("3596");
            setRendered(stryMutAct_9fa48("3597") ? {} : (stryCov_9fa48("3597"), {
              data: currentTooltip,
              open: stryMutAct_9fa48("3598") ? false : (stryCov_9fa48("3598"), true)
            }));
          }
        } else {
          if (stryMutAct_9fa48("3599")) {
            {}
          } else {
            stryCov_9fa48("3599");
            setRendered(stryMutAct_9fa48("3600") ? () => undefined : (stryCov_9fa48("3600"), p => p.data ? stryMutAct_9fa48("3601") ? {} : (stryCov_9fa48("3601"), {
              ...p,
              open: stryMutAct_9fa48("3602") ? true : (stryCov_9fa48("3602"), false)
            }) : p));
          }
        }
      }
    }, stryMutAct_9fa48("3603") ? [] : (stryCov_9fa48("3603"), [currentTooltip]));
    React.useLayoutEffect(() => {
      if (stryMutAct_9fa48("3604")) {
        {}
      } else {
        stryCov_9fa48("3604");
        if (stryMutAct_9fa48("3606") ? false : stryMutAct_9fa48("3605") ? true : (stryCov_9fa48("3605", "3606"), referenceElRef.current)) {
          if (stryMutAct_9fa48("3607")) {
            {}
          } else {
            stryCov_9fa48("3607");
            refs.setReference(referenceElRef.current);
            update();
          }
        }
      }
    }, stryMutAct_9fa48("3608") ? [] : (stryCov_9fa48("3608"), [referenceElRef, refs, update, rendered.data]));
    const ready = stryMutAct_9fa48("3611") ? x != null || y != null : stryMutAct_9fa48("3610") ? false : stryMutAct_9fa48("3609") ? true : (stryCov_9fa48("3609", "3610", "3611"), (stryMutAct_9fa48("3613") ? x == null : stryMutAct_9fa48("3612") ? true : (stryCov_9fa48("3612", "3613"), x != null)) && (stryMutAct_9fa48("3615") ? y == null : stryMutAct_9fa48("3614") ? true : (stryCov_9fa48("3614", "3615"), y != null)));
    const Component = (stryMutAct_9fa48("3616") ? rendered.data.contentAsChild : (stryCov_9fa48("3616"), rendered.data?.contentAsChild)) ? Slot : motion.div;
    const resolvedSide = getResolvedSide(context.placement);
    return <AnimatePresence mode="wait">
      {stryMutAct_9fa48("3619") ? rendered.data && ready || <TooltipPortal>
          <div ref={refs.setFloating} data-slot="tooltip-overlay" data-side={resolvedSide} data-align={rendered.data.align} data-state={rendered.open ? 'open' : 'closed'} style={{
          position: strategy,
          top: 0,
          left: 0,
          zIndex: 50,
          transform: `translate3d(${x}px, ${y}px, 0)`
        }}>
            <FloatingProvider value={{
            context,
            arrowRef
          }}>
              <RenderedTooltipProvider value={{
              side: resolvedSide,
              align: rendered.data.align,
              open: rendered.open
            }}>
                <Component data-slot="tooltip-content" data-side={resolvedSide} data-align={rendered.data.align} data-state={rendered.open ? 'open' : 'closed'} layoutId={`tooltip-content-${globalId}`} initial={{
                opacity: 0,
                scale: 0,
                ...initialFromSide(rendered.data.side)
              }} animate={rendered.open ? {
                opacity: 1,
                scale: 1,
                x: 0,
                y: 0
              } : {
                opacity: 0,
                scale: 0,
                ...initialFromSide(rendered.data.side)
              }} exit={{
                opacity: 0,
                scale: 0,
                ...initialFromSide(rendered.data.side)
              }} onAnimationComplete={() => {
                if (!rendered.open) setRendered({
                  data: null,
                  open: false
                });
              }} transition={transition} {...rendered.data.contentProps} style={{
                position: 'relative',
                ...(rendered.data.contentProps?.style || {})
              }} />
              </RenderedTooltipProvider>
            </FloatingProvider>
          </div>
        </TooltipPortal> : stryMutAct_9fa48("3618") ? false : stryMutAct_9fa48("3617") ? true : (stryCov_9fa48("3617", "3618", "3619"), (stryMutAct_9fa48("3621") ? rendered.data || ready : stryMutAct_9fa48("3620") ? true : (stryCov_9fa48("3620", "3621"), rendered.data && ready)) && <TooltipPortal>
          <div ref={refs.setFloating} data-slot="tooltip-overlay" data-side={resolvedSide} data-align={rendered.data.align} data-state={rendered.open ? stryMutAct_9fa48("3622") ? "" : (stryCov_9fa48("3622"), 'open') : stryMutAct_9fa48("3623") ? "" : (stryCov_9fa48("3623"), 'closed')} style={stryMutAct_9fa48("3624") ? {} : (stryCov_9fa48("3624"), {
          position: strategy,
          top: 0,
          left: 0,
          zIndex: 50,
          transform: stryMutAct_9fa48("3625") ? `` : (stryCov_9fa48("3625"), `translate3d(${x}px, ${y}px, 0)`)
        })}>
            <FloatingProvider value={stryMutAct_9fa48("3626") ? {} : (stryCov_9fa48("3626"), {
            context,
            arrowRef
          })}>
              <RenderedTooltipProvider value={stryMutAct_9fa48("3627") ? {} : (stryCov_9fa48("3627"), {
              side: resolvedSide,
              align: rendered.data.align,
              open: rendered.open
            })}>
                <Component data-slot="tooltip-content" data-side={resolvedSide} data-align={rendered.data.align} data-state={rendered.open ? stryMutAct_9fa48("3628") ? "" : (stryCov_9fa48("3628"), 'open') : stryMutAct_9fa48("3629") ? "" : (stryCov_9fa48("3629"), 'closed')} layoutId={stryMutAct_9fa48("3630") ? `` : (stryCov_9fa48("3630"), `tooltip-content-${globalId}`)} initial={stryMutAct_9fa48("3631") ? {} : (stryCov_9fa48("3631"), {
                opacity: 0,
                scale: 0,
                ...initialFromSide(rendered.data.side)
              })} animate={rendered.open ? stryMutAct_9fa48("3632") ? {} : (stryCov_9fa48("3632"), {
                opacity: 1,
                scale: 1,
                x: 0,
                y: 0
              }) : stryMutAct_9fa48("3633") ? {} : (stryCov_9fa48("3633"), {
                opacity: 0,
                scale: 0,
                ...initialFromSide(rendered.data.side)
              })} exit={stryMutAct_9fa48("3634") ? {} : (stryCov_9fa48("3634"), {
                opacity: 0,
                scale: 0,
                ...initialFromSide(rendered.data.side)
              })} onAnimationComplete={() => {
                if (stryMutAct_9fa48("3635")) {
                  {}
                } else {
                  stryCov_9fa48("3635");
                  if (stryMutAct_9fa48("3638") ? false : stryMutAct_9fa48("3637") ? true : stryMutAct_9fa48("3636") ? rendered.open : (stryCov_9fa48("3636", "3637", "3638"), !rendered.open)) setRendered(stryMutAct_9fa48("3639") ? {} : (stryCov_9fa48("3639"), {
                    data: null,
                    open: stryMutAct_9fa48("3640") ? true : (stryCov_9fa48("3640"), false)
                  }));
                }
              }} transition={transition} {...rendered.data.contentProps} style={stryMutAct_9fa48("3641") ? {} : (stryCov_9fa48("3641"), {
                position: stryMutAct_9fa48("3642") ? "" : (stryCov_9fa48("3642"), 'relative'),
                ...(stryMutAct_9fa48("3645") ? rendered.data.contentProps?.style && {} : stryMutAct_9fa48("3644") ? false : stryMutAct_9fa48("3643") ? true : (stryCov_9fa48("3643", "3644", "3645"), (stryMutAct_9fa48("3646") ? rendered.data.contentProps.style : (stryCov_9fa48("3646"), rendered.data.contentProps?.style)) || {}))
              })} />
              </RenderedTooltipProvider>
            </FloatingProvider>
          </div>
        </TooltipPortal>)}
    </AnimatePresence>;
  }
}
function Tooltip({
  children,
  side = stryMutAct_9fa48("3647") ? "" : (stryCov_9fa48("3647"), 'top'),
  sideOffset = 0,
  align = stryMutAct_9fa48("3648") ? "" : (stryCov_9fa48("3648"), 'center'),
  alignOffset = 0
}) {
  if (stryMutAct_9fa48("3649")) {
    {}
  } else {
    stryCov_9fa48("3649");
    const id = React.useId();
    const [props, setProps] = React.useState({});
    const [asChild, setAsChild] = React.useState(stryMutAct_9fa48("3650") ? true : (stryCov_9fa48("3650"), false));
    return <LocalTooltipProvider value={stryMutAct_9fa48("3651") ? {} : (stryCov_9fa48("3651"), {
      props,
      setProps,
      asChild,
      setAsChild,
      side,
      sideOffset,
      align,
      alignOffset,
      id
    })}>
      {children}
    </LocalTooltipProvider>;
  }
}
function shallowEqualWithoutChildren(a, b) {
  if (stryMutAct_9fa48("3652")) {
    {}
  } else {
    stryCov_9fa48("3652");
    if (stryMutAct_9fa48("3655") ? a !== b : stryMutAct_9fa48("3654") ? false : stryMutAct_9fa48("3653") ? true : (stryCov_9fa48("3653", "3654", "3655"), a === b)) return stryMutAct_9fa48("3656") ? false : (stryCov_9fa48("3656"), true);
    if (stryMutAct_9fa48("3659") ? !a && !b : stryMutAct_9fa48("3658") ? false : stryMutAct_9fa48("3657") ? true : (stryCov_9fa48("3657", "3658", "3659"), (stryMutAct_9fa48("3660") ? a : (stryCov_9fa48("3660"), !a)) || (stryMutAct_9fa48("3661") ? b : (stryCov_9fa48("3661"), !b)))) return stryMutAct_9fa48("3662") ? true : (stryCov_9fa48("3662"), false);
    const keysA = stryMutAct_9fa48("3663") ? Object.keys(a) : (stryCov_9fa48("3663"), Object.keys(a).filter(stryMutAct_9fa48("3664") ? () => undefined : (stryCov_9fa48("3664"), k => stryMutAct_9fa48("3667") ? k === 'children' : stryMutAct_9fa48("3666") ? false : stryMutAct_9fa48("3665") ? true : (stryCov_9fa48("3665", "3666", "3667"), k !== (stryMutAct_9fa48("3668") ? "" : (stryCov_9fa48("3668"), 'children'))))));
    const keysB = stryMutAct_9fa48("3669") ? Object.keys(b) : (stryCov_9fa48("3669"), Object.keys(b).filter(stryMutAct_9fa48("3670") ? () => undefined : (stryCov_9fa48("3670"), k => stryMutAct_9fa48("3673") ? k === 'children' : stryMutAct_9fa48("3672") ? false : stryMutAct_9fa48("3671") ? true : (stryCov_9fa48("3671", "3672", "3673"), k !== (stryMutAct_9fa48("3674") ? "" : (stryCov_9fa48("3674"), 'children'))))));
    if (stryMutAct_9fa48("3677") ? keysA.length === keysB.length : stryMutAct_9fa48("3676") ? false : stryMutAct_9fa48("3675") ? true : (stryCov_9fa48("3675", "3676", "3677"), keysA.length !== keysB.length)) return stryMutAct_9fa48("3678") ? true : (stryCov_9fa48("3678"), false);
    for (const k of keysA) {
      if (stryMutAct_9fa48("3679")) {
        {}
      } else {
        stryCov_9fa48("3679");
        //  index
        if (stryMutAct_9fa48("3682") ? a[k] === b[k] : stryMutAct_9fa48("3681") ? false : stryMutAct_9fa48("3680") ? true : (stryCov_9fa48("3680", "3681", "3682"), a[k] !== b[k])) return stryMutAct_9fa48("3683") ? true : (stryCov_9fa48("3683"), false);
      }
    }
    return stryMutAct_9fa48("3684") ? false : (stryCov_9fa48("3684"), true);
  }
}
function TooltipContent({
  asChild = stryMutAct_9fa48("3685") ? true : (stryCov_9fa48("3685"), false),
  ...props
}) {
  if (stryMutAct_9fa48("3686")) {
    {}
  } else {
    stryCov_9fa48("3686");
    const {
      setProps,
      setAsChild
    } = useTooltip();
    const lastPropsRef = React.useRef(undefined);
    React.useEffect(() => {
      if (stryMutAct_9fa48("3687")) {
        {}
      } else {
        stryCov_9fa48("3687");
        if (stryMutAct_9fa48("3690") ? false : stryMutAct_9fa48("3689") ? true : stryMutAct_9fa48("3688") ? shallowEqualWithoutChildren(lastPropsRef.current, props) : (stryCov_9fa48("3688", "3689", "3690"), !shallowEqualWithoutChildren(lastPropsRef.current, props))) {
          if (stryMutAct_9fa48("3691")) {
            {}
          } else {
            stryCov_9fa48("3691");
            lastPropsRef.current = props;
            setProps(props);
          }
        }
      }
    }, stryMutAct_9fa48("3692") ? [] : (stryCov_9fa48("3692"), [props, setProps]));
    React.useEffect(() => {
      if (stryMutAct_9fa48("3693")) {
        {}
      } else {
        stryCov_9fa48("3693");
        setAsChild(asChild);
      }
    }, stryMutAct_9fa48("3694") ? [] : (stryCov_9fa48("3694"), [asChild, setAsChild]));
    return null;
  }
}
function TooltipTrigger({
  ref,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
  onPointerDown,
  asChild = stryMutAct_9fa48("3695") ? true : (stryCov_9fa48("3695"), false),
  ...props
}) {
  if (stryMutAct_9fa48("3696")) {
    {}
  } else {
    stryCov_9fa48("3696");
    const {
      props: contentProps,
      asChild: contentAsChild,
      side,
      sideOffset,
      align,
      alignOffset,
      id
    } = useTooltip();
    const {
      showTooltip,
      hideTooltip,
      hideImmediate,
      currentTooltip,
      setReferenceEl
    } = useGlobalTooltip();
    const triggerRef = React.useRef(null);
    React.useImperativeHandle(ref, stryMutAct_9fa48("3697") ? () => undefined : (stryCov_9fa48("3697"), () => triggerRef.current));
    const suppressNextFocusRef = React.useRef(stryMutAct_9fa48("3698") ? true : (stryCov_9fa48("3698"), false));
    const handleOpen = React.useCallback(() => {
      if (stryMutAct_9fa48("3699")) {
        {}
      } else {
        stryCov_9fa48("3699");
        if (stryMutAct_9fa48("3702") ? false : stryMutAct_9fa48("3701") ? true : stryMutAct_9fa48("3700") ? triggerRef.current : (stryCov_9fa48("3700", "3701", "3702"), !triggerRef.current)) return;
        setReferenceEl(triggerRef.current);
        const rect = triggerRef.current.getBoundingClientRect();
        showTooltip(stryMutAct_9fa48("3703") ? {} : (stryCov_9fa48("3703"), {
          contentProps,
          contentAsChild,
          rect,
          side,
          sideOffset,
          align,
          alignOffset,
          id
        }));
      }
    }, stryMutAct_9fa48("3704") ? [] : (stryCov_9fa48("3704"), [showTooltip, setReferenceEl, contentProps, contentAsChild, side, sideOffset, align, alignOffset, id]));
    const handlePointerDown = React.useCallback(e => {
      if (stryMutAct_9fa48("3705")) {
        {}
      } else {
        stryCov_9fa48("3705");
        stryMutAct_9fa48("3706") ? onPointerDown(e) : (stryCov_9fa48("3706"), onPointerDown?.(e));
        if (stryMutAct_9fa48("3709") ? currentTooltip?.id !== id : stryMutAct_9fa48("3708") ? false : stryMutAct_9fa48("3707") ? true : (stryCov_9fa48("3707", "3708", "3709"), (stryMutAct_9fa48("3710") ? currentTooltip.id : (stryCov_9fa48("3710"), currentTooltip?.id)) === id)) {
          if (stryMutAct_9fa48("3711")) {
            {}
          } else {
            stryCov_9fa48("3711");
            suppressNextFocusRef.current = stryMutAct_9fa48("3712") ? false : (stryCov_9fa48("3712"), true);
            hideImmediate();
            Promise.resolve().then(() => {
              if (stryMutAct_9fa48("3713")) {
                {}
              } else {
                stryCov_9fa48("3713");
                suppressNextFocusRef.current = stryMutAct_9fa48("3714") ? true : (stryCov_9fa48("3714"), false);
              }
            });
          }
        }
      }
    }, stryMutAct_9fa48("3715") ? [] : (stryCov_9fa48("3715"), [onPointerDown, stryMutAct_9fa48("3716") ? currentTooltip.id : (stryCov_9fa48("3716"), currentTooltip?.id), id, hideImmediate]));
    const handleMouseEnter = React.useCallback(e => {
      if (stryMutAct_9fa48("3717")) {
        {}
      } else {
        stryCov_9fa48("3717");
        stryMutAct_9fa48("3718") ? onMouseEnter(e) : (stryCov_9fa48("3718"), onMouseEnter?.(e));
        handleOpen();
      }
    }, stryMutAct_9fa48("3719") ? [] : (stryCov_9fa48("3719"), [handleOpen, onMouseEnter]));
    const handleMouseLeave = React.useCallback(e => {
      if (stryMutAct_9fa48("3720")) {
        {}
      } else {
        stryCov_9fa48("3720");
        stryMutAct_9fa48("3721") ? onMouseLeave(e) : (stryCov_9fa48("3721"), onMouseLeave?.(e));
        hideTooltip();
      }
    }, stryMutAct_9fa48("3722") ? [] : (stryCov_9fa48("3722"), [hideTooltip, onMouseLeave]));
    const handleFocus = React.useCallback(e => {
      if (stryMutAct_9fa48("3723")) {
        {}
      } else {
        stryCov_9fa48("3723");
        stryMutAct_9fa48("3724") ? onFocus(e) : (stryCov_9fa48("3724"), onFocus?.(e));
        if (stryMutAct_9fa48("3726") ? false : stryMutAct_9fa48("3725") ? true : (stryCov_9fa48("3725", "3726"), suppressNextFocusRef.current)) return;
        handleOpen();
      }
    }, stryMutAct_9fa48("3727") ? [] : (stryCov_9fa48("3727"), [handleOpen, onFocus]));
    const handleBlur = React.useCallback(e => {
      if (stryMutAct_9fa48("3728")) {
        {}
      } else {
        stryCov_9fa48("3728");
        stryMutAct_9fa48("3729") ? onBlur(e) : (stryCov_9fa48("3729"), onBlur?.(e));
        hideTooltip();
      }
    }, stryMutAct_9fa48("3730") ? [] : (stryCov_9fa48("3730"), [hideTooltip, onBlur]));
    const Component = asChild ? Slot : motion.div;
    return <Component ref={triggerRef} onPointerDown={handlePointerDown} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} onFocus={handleFocus} onBlur={handleBlur} data-slot="tooltip-trigger" data-side={side} data-align={align} data-state={(stryMutAct_9fa48("3733") ? currentTooltip?.id !== id : stryMutAct_9fa48("3732") ? false : stryMutAct_9fa48("3731") ? true : (stryCov_9fa48("3731", "3732", "3733"), (stryMutAct_9fa48("3734") ? currentTooltip.id : (stryCov_9fa48("3734"), currentTooltip?.id)) === id)) ? stryMutAct_9fa48("3735") ? "" : (stryCov_9fa48("3735"), 'open') : stryMutAct_9fa48("3736") ? "" : (stryCov_9fa48("3736"), 'closed')} {...props} />;
  }
}
export { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger, TooltipArrow, useGlobalTooltip, useTooltip };