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
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '../../../../lib/utils';
const HighlightContext = React.createContext(
// eslint-disable-next-line @typescript-eslint/no-explicit-any
undefined);
function useHighlight() {
  if (stryMutAct_9fa48("3790")) {
    {}
  } else {
    stryCov_9fa48("3790");
    const context = React.useContext(HighlightContext);
    if (stryMutAct_9fa48("3793") ? false : stryMutAct_9fa48("3792") ? true : stryMutAct_9fa48("3791") ? context : (stryCov_9fa48("3791", "3792", "3793"), !context)) {
      if (stryMutAct_9fa48("3794")) {
        {}
      } else {
        stryCov_9fa48("3794");
        throw new Error(stryMutAct_9fa48("3795") ? "" : (stryCov_9fa48("3795"), 'useHighlight must be used within a HighlightProvider'));
      }
    }
    return context;
  }
}
function Highlight({
  ref,
  ...props
}) {
  if (stryMutAct_9fa48("3796")) {
    {}
  } else {
    stryCov_9fa48("3796");
    const {
      as: Component = stryMutAct_9fa48("3797") ? "" : (stryCov_9fa48("3797"), 'div'),
      children,
      value,
      defaultValue,
      onValueChange,
      className,
      style,
      transition = stryMutAct_9fa48("3798") ? {} : (stryCov_9fa48("3798"), {
        type: stryMutAct_9fa48("3799") ? "" : (stryCov_9fa48("3799"), 'spring'),
        stiffness: 350,
        damping: 35
      }),
      hover = stryMutAct_9fa48("3800") ? true : (stryCov_9fa48("3800"), false),
      click = stryMutAct_9fa48("3801") ? false : (stryCov_9fa48("3801"), true),
      enabled = stryMutAct_9fa48("3802") ? false : (stryCov_9fa48("3802"), true),
      controlledItems,
      disabled = stryMutAct_9fa48("3803") ? true : (stryCov_9fa48("3803"), false),
      exitDelay = 200,
      mode = stryMutAct_9fa48("3804") ? "" : (stryCov_9fa48("3804"), 'children')
    } = props;
    const localRef = React.useRef(null);
    React.useImperativeHandle(ref, stryMutAct_9fa48("3805") ? () => undefined : (stryCov_9fa48("3805"), () => localRef.current));
    const [activeValue, setActiveValue] = React.useState(stryMutAct_9fa48("3806") ? (value ?? defaultValue) && null : (stryCov_9fa48("3806"), (stryMutAct_9fa48("3807") ? value && defaultValue : (stryCov_9fa48("3807"), value ?? defaultValue)) ?? null));
    const [boundsState, setBoundsState] = React.useState(null);
    const [activeClassNameState, setActiveClassNameState] = React.useState(stryMutAct_9fa48("3808") ? "Stryker was here!" : (stryCov_9fa48("3808"), ''));
    const safeSetActiveValue = React.useCallback(id => {
      if (stryMutAct_9fa48("3809")) {
        {}
      } else {
        stryCov_9fa48("3809");
        setActiveValue(stryMutAct_9fa48("3810") ? () => undefined : (stryCov_9fa48("3810"), prev => (stryMutAct_9fa48("3813") ? prev !== id : stryMutAct_9fa48("3812") ? false : stryMutAct_9fa48("3811") ? true : (stryCov_9fa48("3811", "3812", "3813"), prev === id)) ? prev : id));
        if (stryMutAct_9fa48("3816") ? id === activeValue : stryMutAct_9fa48("3815") ? false : stryMutAct_9fa48("3814") ? true : (stryCov_9fa48("3814", "3815", "3816"), id !== activeValue)) stryMutAct_9fa48("3817") ? onValueChange(id) : (stryCov_9fa48("3817"), onValueChange?.(id));
      }
    }, stryMutAct_9fa48("3818") ? [] : (stryCov_9fa48("3818"), [activeValue, onValueChange]));
    const safeSetBounds = React.useCallback(bounds => {
      if (stryMutAct_9fa48("3819")) {
        {}
      } else {
        stryCov_9fa48("3819");
        if (stryMutAct_9fa48("3822") ? false : stryMutAct_9fa48("3821") ? true : stryMutAct_9fa48("3820") ? localRef.current : (stryCov_9fa48("3820", "3821", "3822"), !localRef.current)) return;
        const boundsOffset = stryMutAct_9fa48("3823") ? props?.boundsOffset && {
          top: 0,
          left: 0,
          width: 0,
          height: 0
        } : (stryCov_9fa48("3823"), (stryMutAct_9fa48("3824") ? props.boundsOffset : (stryCov_9fa48("3824"), props?.boundsOffset)) ?? (stryMutAct_9fa48("3825") ? {} : (stryCov_9fa48("3825"), {
          top: 0,
          left: 0,
          width: 0,
          height: 0
        })));
        const containerRect = localRef.current.getBoundingClientRect();
        const newBounds = stryMutAct_9fa48("3826") ? {} : (stryCov_9fa48("3826"), {
          top: stryMutAct_9fa48("3827") ? bounds.top - containerRect.top - (boundsOffset.top ?? 0) : (stryCov_9fa48("3827"), (stryMutAct_9fa48("3828") ? bounds.top + containerRect.top : (stryCov_9fa48("3828"), bounds.top - containerRect.top)) + (stryMutAct_9fa48("3829") ? boundsOffset.top && 0 : (stryCov_9fa48("3829"), boundsOffset.top ?? 0))),
          left: stryMutAct_9fa48("3830") ? bounds.left - containerRect.left - (boundsOffset.left ?? 0) : (stryCov_9fa48("3830"), (stryMutAct_9fa48("3831") ? bounds.left + containerRect.left : (stryCov_9fa48("3831"), bounds.left - containerRect.left)) + (stryMutAct_9fa48("3832") ? boundsOffset.left && 0 : (stryCov_9fa48("3832"), boundsOffset.left ?? 0))),
          width: stryMutAct_9fa48("3833") ? bounds.width - (boundsOffset.width ?? 0) : (stryCov_9fa48("3833"), bounds.width + (stryMutAct_9fa48("3834") ? boundsOffset.width && 0 : (stryCov_9fa48("3834"), boundsOffset.width ?? 0))),
          height: stryMutAct_9fa48("3835") ? bounds.height - (boundsOffset.height ?? 0) : (stryCov_9fa48("3835"), bounds.height + (stryMutAct_9fa48("3836") ? boundsOffset.height && 0 : (stryCov_9fa48("3836"), boundsOffset.height ?? 0)))
        });
        setBoundsState(prev => {
          if (stryMutAct_9fa48("3837")) {
            {}
          } else {
            stryCov_9fa48("3837");
            if (stryMutAct_9fa48("3840") ? prev && prev.top === newBounds.top && prev.left === newBounds.left && prev.width === newBounds.width || prev.height === newBounds.height : stryMutAct_9fa48("3839") ? false : stryMutAct_9fa48("3838") ? true : (stryCov_9fa48("3838", "3839", "3840"), (stryMutAct_9fa48("3842") ? prev && prev.top === newBounds.top && prev.left === newBounds.left || prev.width === newBounds.width : stryMutAct_9fa48("3841") ? true : (stryCov_9fa48("3841", "3842"), (stryMutAct_9fa48("3844") ? prev && prev.top === newBounds.top || prev.left === newBounds.left : stryMutAct_9fa48("3843") ? true : (stryCov_9fa48("3843", "3844"), (stryMutAct_9fa48("3846") ? prev || prev.top === newBounds.top : stryMutAct_9fa48("3845") ? true : (stryCov_9fa48("3845", "3846"), prev && (stryMutAct_9fa48("3848") ? prev.top !== newBounds.top : stryMutAct_9fa48("3847") ? true : (stryCov_9fa48("3847", "3848"), prev.top === newBounds.top)))) && (stryMutAct_9fa48("3850") ? prev.left !== newBounds.left : stryMutAct_9fa48("3849") ? true : (stryCov_9fa48("3849", "3850"), prev.left === newBounds.left)))) && (stryMutAct_9fa48("3852") ? prev.width !== newBounds.width : stryMutAct_9fa48("3851") ? true : (stryCov_9fa48("3851", "3852"), prev.width === newBounds.width)))) && (stryMutAct_9fa48("3854") ? prev.height !== newBounds.height : stryMutAct_9fa48("3853") ? true : (stryCov_9fa48("3853", "3854"), prev.height === newBounds.height)))) {
              if (stryMutAct_9fa48("3855")) {
                {}
              } else {
                stryCov_9fa48("3855");
                return prev;
              }
            }
            return newBounds;
          }
        });
      }
    }, stryMutAct_9fa48("3856") ? [] : (stryCov_9fa48("3856"), [props]));
    const clearBounds = React.useCallback(() => {
      if (stryMutAct_9fa48("3857")) {
        {}
      } else {
        stryCov_9fa48("3857");
        setBoundsState(stryMutAct_9fa48("3858") ? () => undefined : (stryCov_9fa48("3858"), prev => (stryMutAct_9fa48("3861") ? prev !== null : stryMutAct_9fa48("3860") ? false : stryMutAct_9fa48("3859") ? true : (stryCov_9fa48("3859", "3860", "3861"), prev === null)) ? prev : null));
      }
    }, stryMutAct_9fa48("3862") ? ["Stryker was here"] : (stryCov_9fa48("3862"), []));
    React.useEffect(() => {
      if (stryMutAct_9fa48("3863")) {
        {}
      } else {
        stryCov_9fa48("3863");
        if (stryMutAct_9fa48("3866") ? value === undefined : stryMutAct_9fa48("3865") ? false : stryMutAct_9fa48("3864") ? true : (stryCov_9fa48("3864", "3865", "3866"), value !== undefined)) setActiveValue(value);else if (stryMutAct_9fa48("3869") ? defaultValue === undefined : stryMutAct_9fa48("3868") ? false : stryMutAct_9fa48("3867") ? true : (stryCov_9fa48("3867", "3868", "3869"), defaultValue !== undefined)) setActiveValue(defaultValue);
      }
    }, stryMutAct_9fa48("3870") ? [] : (stryCov_9fa48("3870"), [value, defaultValue]));
    const id = React.useId();
    React.useEffect(() => {
      if (stryMutAct_9fa48("3871")) {
        {}
      } else {
        stryCov_9fa48("3871");
        if (stryMutAct_9fa48("3874") ? mode === 'parent' : stryMutAct_9fa48("3873") ? false : stryMutAct_9fa48("3872") ? true : (stryCov_9fa48("3872", "3873", "3874"), mode !== (stryMutAct_9fa48("3875") ? "" : (stryCov_9fa48("3875"), 'parent')))) return;
        const container = localRef.current;
        if (stryMutAct_9fa48("3878") ? false : stryMutAct_9fa48("3877") ? true : stryMutAct_9fa48("3876") ? container : (stryCov_9fa48("3876", "3877", "3878"), !container)) return;
        const onScroll = () => {
          if (stryMutAct_9fa48("3879")) {
            {}
          } else {
            stryCov_9fa48("3879");
            if (stryMutAct_9fa48("3882") ? false : stryMutAct_9fa48("3881") ? true : stryMutAct_9fa48("3880") ? activeValue : (stryCov_9fa48("3880", "3881", "3882"), !activeValue)) return;
            const activeEl = container.querySelector(stryMutAct_9fa48("3883") ? `` : (stryCov_9fa48("3883"), `[data-value="${activeValue}"][data-highlight="true"]`));
            if (stryMutAct_9fa48("3885") ? false : stryMutAct_9fa48("3884") ? true : (stryCov_9fa48("3884", "3885"), activeEl)) safeSetBounds(activeEl.getBoundingClientRect());
          }
        };
        container.addEventListener(stryMutAct_9fa48("3886") ? "" : (stryCov_9fa48("3886"), 'scroll'), onScroll, stryMutAct_9fa48("3887") ? {} : (stryCov_9fa48("3887"), {
          passive: stryMutAct_9fa48("3888") ? false : (stryCov_9fa48("3888"), true)
        }));
        return stryMutAct_9fa48("3889") ? () => undefined : (stryCov_9fa48("3889"), () => container.removeEventListener(stryMutAct_9fa48("3890") ? "" : (stryCov_9fa48("3890"), 'scroll'), onScroll));
      }
    }, stryMutAct_9fa48("3891") ? [] : (stryCov_9fa48("3891"), [mode, activeValue, safeSetBounds]));
    const render = React.useCallback(children => {
      if (stryMutAct_9fa48("3892")) {
        {}
      } else {
        stryCov_9fa48("3892");
        if (stryMutAct_9fa48("3895") ? mode !== 'parent' : stryMutAct_9fa48("3894") ? false : stryMutAct_9fa48("3893") ? true : (stryCov_9fa48("3893", "3894", "3895"), mode === (stryMutAct_9fa48("3896") ? "" : (stryCov_9fa48("3896"), 'parent')))) {
          if (stryMutAct_9fa48("3897")) {
            {}
          } else {
            stryCov_9fa48("3897");
            return <Component ref={localRef} data-slot="motion-highlight-container" style={stryMutAct_9fa48("3898") ? {} : (stryCov_9fa48("3898"), {
              position: stryMutAct_9fa48("3899") ? "" : (stryCov_9fa48("3899"), 'relative'),
              zIndex: 1
            })} className={stryMutAct_9fa48("3900") ? props.containerClassName : (stryCov_9fa48("3900"), props?.containerClassName)}>
          <AnimatePresence initial={stryMutAct_9fa48("3901") ? true : (stryCov_9fa48("3901"), false)} mode="wait">
            {stryMutAct_9fa48("3904") ? boundsState || <motion.div data-slot="motion-highlight" animate={{
                  top: boundsState.top,
                  left: boundsState.left,
                  width: boundsState.width,
                  height: boundsState.height,
                  opacity: 1
                }} initial={{
                  top: boundsState.top,
                  left: boundsState.left,
                  width: boundsState.width,
                  height: boundsState.height,
                  opacity: 0
                }} exit={{
                  opacity: 0,
                  transition: {
                    ...transition,
                    delay: (transition?.delay ?? 0) + (exitDelay ?? 0) / 1000
                  }
                }} transition={transition} style={{
                  position: 'absolute',
                  zIndex: 0,
                  ...style
                }} className={cn(className, activeClassNameState)} /> : stryMutAct_9fa48("3903") ? false : stryMutAct_9fa48("3902") ? true : (stryCov_9fa48("3902", "3903", "3904"), boundsState && <motion.div data-slot="motion-highlight" animate={stryMutAct_9fa48("3905") ? {} : (stryCov_9fa48("3905"), {
                  top: boundsState.top,
                  left: boundsState.left,
                  width: boundsState.width,
                  height: boundsState.height,
                  opacity: 1
                })} initial={stryMutAct_9fa48("3906") ? {} : (stryCov_9fa48("3906"), {
                  top: boundsState.top,
                  left: boundsState.left,
                  width: boundsState.width,
                  height: boundsState.height,
                  opacity: 0
                })} exit={stryMutAct_9fa48("3907") ? {} : (stryCov_9fa48("3907"), {
                  opacity: 0,
                  transition: stryMutAct_9fa48("3908") ? {} : (stryCov_9fa48("3908"), {
                    ...transition,
                    delay: stryMutAct_9fa48("3909") ? (transition?.delay ?? 0) - (exitDelay ?? 0) / 1000 : (stryCov_9fa48("3909"), (stryMutAct_9fa48("3910") ? transition?.delay && 0 : (stryCov_9fa48("3910"), (stryMutAct_9fa48("3911") ? transition.delay : (stryCov_9fa48("3911"), transition?.delay)) ?? 0)) + (stryMutAct_9fa48("3912") ? (exitDelay ?? 0) * 1000 : (stryCov_9fa48("3912"), (stryMutAct_9fa48("3913") ? exitDelay && 0 : (stryCov_9fa48("3913"), exitDelay ?? 0)) / 1000)))
                  })
                })} transition={transition} style={stryMutAct_9fa48("3914") ? {} : (stryCov_9fa48("3914"), {
                  position: stryMutAct_9fa48("3915") ? "" : (stryCov_9fa48("3915"), 'absolute'),
                  zIndex: 0,
                  ...style
                })} className={cn(className, activeClassNameState)} />)}
          </AnimatePresence>
          {children}
        </Component>;
          }
        }
        return children;
      }
    }, stryMutAct_9fa48("3916") ? [] : (stryCov_9fa48("3916"), [mode, Component, props, boundsState, transition, exitDelay, style, className, activeClassNameState]));
    return <HighlightContext.Provider value={stryMutAct_9fa48("3917") ? {} : (stryCov_9fa48("3917"), {
      mode,
      activeValue,
      setActiveValue: safeSetActiveValue,
      id,
      hover,
      click,
      className,
      style,
      transition,
      disabled,
      enabled,
      exitDelay,
      setBounds: safeSetBounds,
      clearBounds,
      activeClassName: activeClassNameState,
      setActiveClassName: setActiveClassNameState,
      forceUpdateBounds: stryMutAct_9fa48("3918") ? props.forceUpdateBounds : (stryCov_9fa48("3918"), props?.forceUpdateBounds)
    })}>
      {enabled ? controlledItems ? render(children) : render(React.Children.map(children, stryMutAct_9fa48("3919") ? () => undefined : (stryCov_9fa48("3919"), (child, index) => <HighlightItem key={index} className={stryMutAct_9fa48("3920") ? props.itemsClassName : (stryCov_9fa48("3920"), props?.itemsClassName)}>
          {child}
        </HighlightItem>))) : children}
    </HighlightContext.Provider>;
  }
}
function getNonOverridingDataAttributes(element, dataAttributes) {
  if (stryMutAct_9fa48("3921")) {
    {}
  } else {
    stryCov_9fa48("3921");
    return Object.keys(dataAttributes).reduce((acc, key) => {
      if (stryMutAct_9fa48("3922")) {
        {}
      } else {
        stryCov_9fa48("3922");
        if (stryMutAct_9fa48("3925") ? element.props[key] !== undefined : stryMutAct_9fa48("3924") ? false : stryMutAct_9fa48("3923") ? true : (stryCov_9fa48("3923", "3924", "3925"), element.props[key] === undefined)) {
          if (stryMutAct_9fa48("3926")) {
            {}
          } else {
            stryCov_9fa48("3926");
            acc[key] = dataAttributes[key];
          }
        }
        return acc;
      }
    }, {});
  }
}
function HighlightItem({
  ref,
  as,
  children,
  id,
  value,
  className,
  style,
  transition,
  disabled = stryMutAct_9fa48("3927") ? true : (stryCov_9fa48("3927"), false),
  activeClassName,
  exitDelay,
  asChild = stryMutAct_9fa48("3928") ? true : (stryCov_9fa48("3928"), false),
  forceUpdateBounds,
  ...props
}) {
  if (stryMutAct_9fa48("3929")) {
    {}
  } else {
    stryCov_9fa48("3929");
    const itemId = React.useId();
    const {
      activeValue,
      setActiveValue,
      mode,
      setBounds,
      clearBounds,
      hover,
      click,
      enabled,
      className: contextClassName,
      style: contextStyle,
      transition: contextTransition,
      id: contextId,
      disabled: contextDisabled,
      exitDelay: contextExitDelay,
      forceUpdateBounds: contextForceUpdateBounds,
      setActiveClassName
    } = useHighlight();
    const Component = stryMutAct_9fa48("3930") ? as && 'div' : (stryCov_9fa48("3930"), as ?? (stryMutAct_9fa48("3931") ? "" : (stryCov_9fa48("3931"), 'div')));
    const element = children;
    const childValue = stryMutAct_9fa48("3932") ? (id ?? value ?? element.props?.['data-value'] ?? element.props?.id) && itemId : (stryCov_9fa48("3932"), (stryMutAct_9fa48("3933") ? (id ?? value ?? element.props?.['data-value']) && element.props?.id : (stryCov_9fa48("3933"), (stryMutAct_9fa48("3934") ? (id ?? value) && element.props?.['data-value'] : (stryCov_9fa48("3934"), (stryMutAct_9fa48("3935") ? id && value : (stryCov_9fa48("3935"), id ?? value)) ?? (stryMutAct_9fa48("3936") ? element.props['data-value'] : (stryCov_9fa48("3936"), element.props?.[stryMutAct_9fa48("3937") ? "" : (stryCov_9fa48("3937"), 'data-value')])))) ?? (stryMutAct_9fa48("3938") ? element.props.id : (stryCov_9fa48("3938"), element.props?.id)))) ?? itemId);
    const isActive = stryMutAct_9fa48("3941") ? activeValue !== childValue : stryMutAct_9fa48("3940") ? false : stryMutAct_9fa48("3939") ? true : (stryCov_9fa48("3939", "3940", "3941"), activeValue === childValue);
    const isDisabled = (stryMutAct_9fa48("3944") ? disabled !== undefined : stryMutAct_9fa48("3943") ? false : stryMutAct_9fa48("3942") ? true : (stryCov_9fa48("3942", "3943", "3944"), disabled === undefined)) ? contextDisabled : disabled;
    const itemTransition = stryMutAct_9fa48("3945") ? transition && contextTransition : (stryCov_9fa48("3945"), transition ?? contextTransition);
    const localRef = React.useRef(null);
    React.useImperativeHandle(ref, stryMutAct_9fa48("3946") ? () => undefined : (stryCov_9fa48("3946"), () => localRef.current));
    React.useEffect(() => {
      if (stryMutAct_9fa48("3947")) {
        {}
      } else {
        stryCov_9fa48("3947");
        if (stryMutAct_9fa48("3950") ? mode === 'parent' : stryMutAct_9fa48("3949") ? false : stryMutAct_9fa48("3948") ? true : (stryCov_9fa48("3948", "3949", "3950"), mode !== (stryMutAct_9fa48("3951") ? "" : (stryCov_9fa48("3951"), 'parent')))) return;
        let rafId;
        let previousBounds = null;
        const shouldUpdateBounds = stryMutAct_9fa48("3954") ? forceUpdateBounds === true && contextForceUpdateBounds && forceUpdateBounds !== false : stryMutAct_9fa48("3953") ? false : stryMutAct_9fa48("3952") ? true : (stryCov_9fa48("3952", "3953", "3954"), (stryMutAct_9fa48("3956") ? forceUpdateBounds !== true : stryMutAct_9fa48("3955") ? false : (stryCov_9fa48("3955", "3956"), forceUpdateBounds === (stryMutAct_9fa48("3957") ? false : (stryCov_9fa48("3957"), true)))) || (stryMutAct_9fa48("3959") ? contextForceUpdateBounds || forceUpdateBounds !== false : stryMutAct_9fa48("3958") ? false : (stryCov_9fa48("3958", "3959"), contextForceUpdateBounds && (stryMutAct_9fa48("3961") ? forceUpdateBounds === false : stryMutAct_9fa48("3960") ? true : (stryCov_9fa48("3960", "3961"), forceUpdateBounds !== (stryMutAct_9fa48("3962") ? true : (stryCov_9fa48("3962"), false)))))));
        const updateBounds = () => {
          if (stryMutAct_9fa48("3963")) {
            {}
          } else {
            stryCov_9fa48("3963");
            if (stryMutAct_9fa48("3966") ? false : stryMutAct_9fa48("3965") ? true : stryMutAct_9fa48("3964") ? localRef.current : (stryCov_9fa48("3964", "3965", "3966"), !localRef.current)) return;
            const bounds = localRef.current.getBoundingClientRect();
            if (stryMutAct_9fa48("3968") ? false : stryMutAct_9fa48("3967") ? true : (stryCov_9fa48("3967", "3968"), shouldUpdateBounds)) {
              if (stryMutAct_9fa48("3969")) {
                {}
              } else {
                stryCov_9fa48("3969");
                if (stryMutAct_9fa48("3972") ? previousBounds && previousBounds.top === bounds.top && previousBounds.left === bounds.left && previousBounds.width === bounds.width || previousBounds.height === bounds.height : stryMutAct_9fa48("3971") ? false : stryMutAct_9fa48("3970") ? true : (stryCov_9fa48("3970", "3971", "3972"), (stryMutAct_9fa48("3974") ? previousBounds && previousBounds.top === bounds.top && previousBounds.left === bounds.left || previousBounds.width === bounds.width : stryMutAct_9fa48("3973") ? true : (stryCov_9fa48("3973", "3974"), (stryMutAct_9fa48("3976") ? previousBounds && previousBounds.top === bounds.top || previousBounds.left === bounds.left : stryMutAct_9fa48("3975") ? true : (stryCov_9fa48("3975", "3976"), (stryMutAct_9fa48("3978") ? previousBounds || previousBounds.top === bounds.top : stryMutAct_9fa48("3977") ? true : (stryCov_9fa48("3977", "3978"), previousBounds && (stryMutAct_9fa48("3980") ? previousBounds.top !== bounds.top : stryMutAct_9fa48("3979") ? true : (stryCov_9fa48("3979", "3980"), previousBounds.top === bounds.top)))) && (stryMutAct_9fa48("3982") ? previousBounds.left !== bounds.left : stryMutAct_9fa48("3981") ? true : (stryCov_9fa48("3981", "3982"), previousBounds.left === bounds.left)))) && (stryMutAct_9fa48("3984") ? previousBounds.width !== bounds.width : stryMutAct_9fa48("3983") ? true : (stryCov_9fa48("3983", "3984"), previousBounds.width === bounds.width)))) && (stryMutAct_9fa48("3986") ? previousBounds.height !== bounds.height : stryMutAct_9fa48("3985") ? true : (stryCov_9fa48("3985", "3986"), previousBounds.height === bounds.height)))) {
                  if (stryMutAct_9fa48("3987")) {
                    {}
                  } else {
                    stryCov_9fa48("3987");
                    rafId = requestAnimationFrame(updateBounds);
                    return;
                  }
                }
                previousBounds = bounds;
                rafId = requestAnimationFrame(updateBounds);
              }
            }
            setBounds(bounds);
          }
        };
        if (stryMutAct_9fa48("3989") ? false : stryMutAct_9fa48("3988") ? true : (stryCov_9fa48("3988", "3989"), isActive)) {
          if (stryMutAct_9fa48("3990")) {
            {}
          } else {
            stryCov_9fa48("3990");
            updateBounds();
            setActiveClassName(stryMutAct_9fa48("3991") ? activeClassName && '' : (stryCov_9fa48("3991"), activeClassName ?? (stryMutAct_9fa48("3992") ? "Stryker was here!" : (stryCov_9fa48("3992"), ''))));
          }
        } else if (stryMutAct_9fa48("3995") ? false : stryMutAct_9fa48("3994") ? true : stryMutAct_9fa48("3993") ? activeValue : (stryCov_9fa48("3993", "3994", "3995"), !activeValue)) clearBounds();
        if (stryMutAct_9fa48("3997") ? false : stryMutAct_9fa48("3996") ? true : (stryCov_9fa48("3996", "3997"), shouldUpdateBounds)) return stryMutAct_9fa48("3998") ? () => undefined : (stryCov_9fa48("3998"), () => cancelAnimationFrame(rafId));
      }
    }, stryMutAct_9fa48("3999") ? [] : (stryCov_9fa48("3999"), [mode, isActive, activeValue, setBounds, clearBounds, activeClassName, setActiveClassName, forceUpdateBounds, contextForceUpdateBounds]));
    if (stryMutAct_9fa48("4002") ? false : stryMutAct_9fa48("4001") ? true : stryMutAct_9fa48("4000") ? React.isValidElement(children) : (stryCov_9fa48("4000", "4001", "4002"), !React.isValidElement(children))) return children;
    const dataAttributes = stryMutAct_9fa48("4003") ? {} : (stryCov_9fa48("4003"), {
      'data-active': isActive ? stryMutAct_9fa48("4004") ? "" : (stryCov_9fa48("4004"), 'true') : stryMutAct_9fa48("4005") ? "" : (stryCov_9fa48("4005"), 'false'),
      'aria-selected': isActive,
      'data-disabled': isDisabled,
      'data-value': childValue,
      'data-highlight': stryMutAct_9fa48("4006") ? false : (stryCov_9fa48("4006"), true)
    });
    const commonHandlers = hover ? stryMutAct_9fa48("4007") ? {} : (stryCov_9fa48("4007"), {
      onMouseEnter: e => {
        if (stryMutAct_9fa48("4008")) {
          {}
        } else {
          stryCov_9fa48("4008");
          setActiveValue(childValue);
          stryMutAct_9fa48("4009") ? element.props.onMouseEnter(e) : (stryCov_9fa48("4009"), element.props.onMouseEnter?.(e));
        }
      },
      onMouseLeave: e => {
        if (stryMutAct_9fa48("4010")) {
          {}
        } else {
          stryCov_9fa48("4010");
          setActiveValue(null);
          stryMutAct_9fa48("4011") ? element.props.onMouseLeave(e) : (stryCov_9fa48("4011"), element.props.onMouseLeave?.(e));
        }
      }
    }) : click ? stryMutAct_9fa48("4012") ? {} : (stryCov_9fa48("4012"), {
      onClick: e => {
        if (stryMutAct_9fa48("4013")) {
          {}
        } else {
          stryCov_9fa48("4013");
          setActiveValue(childValue);
          stryMutAct_9fa48("4014") ? element.props.onClick(e) : (stryCov_9fa48("4014"), element.props.onClick?.(e));
        }
      }
    }) : {};
    if (stryMutAct_9fa48("4016") ? false : stryMutAct_9fa48("4015") ? true : (stryCov_9fa48("4015", "4016"), asChild)) {
      if (stryMutAct_9fa48("4017")) {
        {}
      } else {
        stryCov_9fa48("4017");
        if (stryMutAct_9fa48("4020") ? mode !== 'children' : stryMutAct_9fa48("4019") ? false : stryMutAct_9fa48("4018") ? true : (stryCov_9fa48("4018", "4019", "4020"), mode === (stryMutAct_9fa48("4021") ? "" : (stryCov_9fa48("4021"), 'children')))) {
          if (stryMutAct_9fa48("4022")) {
            {}
          } else {
            stryCov_9fa48("4022");
            return React.cloneElement(element, stryMutAct_9fa48("4023") ? {} : (stryCov_9fa48("4023"), {
              key: childValue,
              ref: localRef,
              className: cn(stryMutAct_9fa48("4024") ? "" : (stryCov_9fa48("4024"), 'relative'), element.props.className),
              ...getNonOverridingDataAttributes(element, stryMutAct_9fa48("4025") ? {} : (stryCov_9fa48("4025"), {
                ...dataAttributes,
                'data-slot': stryMutAct_9fa48("4026") ? "" : (stryCov_9fa48("4026"), 'motion-highlight-item-container')
              })),
              ...commonHandlers,
              ...props
            }), <>
        <AnimatePresence initial={stryMutAct_9fa48("4027") ? true : (stryCov_9fa48("4027"), false)} mode="wait">
          {stryMutAct_9fa48("4030") ? isActive && !isDisabled || <motion.div layoutId={`transition-background-${contextId}`} data-slot="motion-highlight" style={{
                  position: 'absolute',
                  zIndex: 0,
                  ...contextStyle,
                  ...style
                }} className={cn(contextClassName, activeClassName)} transition={itemTransition} initial={{
                  opacity: 0
                }} animate={{
                  opacity: 1
                }} exit={{
                  opacity: 0,
                  transition: {
                    ...itemTransition,
                    delay: (itemTransition?.delay ?? 0) + (exitDelay ?? contextExitDelay ?? 0) / 1000
                  }
                }} {...dataAttributes} /> : stryMutAct_9fa48("4029") ? false : stryMutAct_9fa48("4028") ? true : (stryCov_9fa48("4028", "4029", "4030"), (stryMutAct_9fa48("4032") ? isActive || !isDisabled : stryMutAct_9fa48("4031") ? true : (stryCov_9fa48("4031", "4032"), isActive && (stryMutAct_9fa48("4033") ? isDisabled : (stryCov_9fa48("4033"), !isDisabled)))) && <motion.div layoutId={stryMutAct_9fa48("4034") ? `` : (stryCov_9fa48("4034"), `transition-background-${contextId}`)} data-slot="motion-highlight" style={stryMutAct_9fa48("4035") ? {} : (stryCov_9fa48("4035"), {
                  position: stryMutAct_9fa48("4036") ? "" : (stryCov_9fa48("4036"), 'absolute'),
                  zIndex: 0,
                  ...contextStyle,
                  ...style
                })} className={cn(contextClassName, activeClassName)} transition={itemTransition} initial={stryMutAct_9fa48("4037") ? {} : (stryCov_9fa48("4037"), {
                  opacity: 0
                })} animate={stryMutAct_9fa48("4038") ? {} : (stryCov_9fa48("4038"), {
                  opacity: 1
                })} exit={stryMutAct_9fa48("4039") ? {} : (stryCov_9fa48("4039"), {
                  opacity: 0,
                  transition: stryMutAct_9fa48("4040") ? {} : (stryCov_9fa48("4040"), {
                    ...itemTransition,
                    delay: stryMutAct_9fa48("4041") ? (itemTransition?.delay ?? 0) - (exitDelay ?? contextExitDelay ?? 0) / 1000 : (stryCov_9fa48("4041"), (stryMutAct_9fa48("4042") ? itemTransition?.delay && 0 : (stryCov_9fa48("4042"), (stryMutAct_9fa48("4043") ? itemTransition.delay : (stryCov_9fa48("4043"), itemTransition?.delay)) ?? 0)) + (stryMutAct_9fa48("4044") ? (exitDelay ?? contextExitDelay ?? 0) * 1000 : (stryCov_9fa48("4044"), (stryMutAct_9fa48("4045") ? (exitDelay ?? contextExitDelay) && 0 : (stryCov_9fa48("4045"), (stryMutAct_9fa48("4046") ? exitDelay && contextExitDelay : (stryCov_9fa48("4046"), exitDelay ?? contextExitDelay)) ?? 0)) / 1000)))
                  })
                })} {...dataAttributes} />)}
        </AnimatePresence>

        <Component data-slot="motion-highlight-item" style={stryMutAct_9fa48("4047") ? {} : (stryCov_9fa48("4047"), {
                position: stryMutAct_9fa48("4048") ? "" : (stryCov_9fa48("4048"), 'relative'),
                zIndex: 1
              })} className={className} {...dataAttributes}>
          {children}
        </Component>
      </>);
          }
        }
        return React.cloneElement(element, stryMutAct_9fa48("4049") ? {} : (stryCov_9fa48("4049"), {
          ref: localRef,
          ...getNonOverridingDataAttributes(element, stryMutAct_9fa48("4050") ? {} : (stryCov_9fa48("4050"), {
            ...dataAttributes,
            'data-slot': stryMutAct_9fa48("4051") ? "" : (stryCov_9fa48("4051"), 'motion-highlight-item')
          })),
          ...commonHandlers
        }));
      }
    }
    return enabled ? <Component key={childValue} ref={localRef} data-slot="motion-highlight-item-container" className={cn(stryMutAct_9fa48("4054") ? mode === 'children' || 'relative' : stryMutAct_9fa48("4053") ? false : stryMutAct_9fa48("4052") ? true : (stryCov_9fa48("4052", "4053", "4054"), (stryMutAct_9fa48("4056") ? mode !== 'children' : stryMutAct_9fa48("4055") ? true : (stryCov_9fa48("4055", "4056"), mode === (stryMutAct_9fa48("4057") ? "" : (stryCov_9fa48("4057"), 'children')))) && (stryMutAct_9fa48("4058") ? "" : (stryCov_9fa48("4058"), 'relative'))), className)} {...dataAttributes} {...props} {...commonHandlers}>
      {stryMutAct_9fa48("4061") ? mode === 'children' || <AnimatePresence initial={false} mode="wait">
          {isActive && !isDisabled && <motion.div layoutId={`transition-background-${contextId}`} data-slot="motion-highlight" style={{
          position: 'absolute',
          zIndex: 0,
          ...contextStyle,
          ...style
        }} className={cn(contextClassName, activeClassName)} transition={itemTransition} initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} exit={{
          opacity: 0,
          transition: {
            ...itemTransition,
            delay: (itemTransition?.delay ?? 0) + (exitDelay ?? contextExitDelay ?? 0) / 1000
          }
        }} {...dataAttributes} />}
        </AnimatePresence> : stryMutAct_9fa48("4060") ? false : stryMutAct_9fa48("4059") ? true : (stryCov_9fa48("4059", "4060", "4061"), (stryMutAct_9fa48("4063") ? mode !== 'children' : stryMutAct_9fa48("4062") ? true : (stryCov_9fa48("4062", "4063"), mode === (stryMutAct_9fa48("4064") ? "" : (stryCov_9fa48("4064"), 'children')))) && <AnimatePresence initial={stryMutAct_9fa48("4065") ? true : (stryCov_9fa48("4065"), false)} mode="wait">
          {stryMutAct_9fa48("4068") ? isActive && !isDisabled || <motion.div layoutId={`transition-background-${contextId}`} data-slot="motion-highlight" style={{
          position: 'absolute',
          zIndex: 0,
          ...contextStyle,
          ...style
        }} className={cn(contextClassName, activeClassName)} transition={itemTransition} initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} exit={{
          opacity: 0,
          transition: {
            ...itemTransition,
            delay: (itemTransition?.delay ?? 0) + (exitDelay ?? contextExitDelay ?? 0) / 1000
          }
        }} {...dataAttributes} /> : stryMutAct_9fa48("4067") ? false : stryMutAct_9fa48("4066") ? true : (stryCov_9fa48("4066", "4067", "4068"), (stryMutAct_9fa48("4070") ? isActive || !isDisabled : stryMutAct_9fa48("4069") ? true : (stryCov_9fa48("4069", "4070"), isActive && (stryMutAct_9fa48("4071") ? isDisabled : (stryCov_9fa48("4071"), !isDisabled)))) && <motion.div layoutId={stryMutAct_9fa48("4072") ? `` : (stryCov_9fa48("4072"), `transition-background-${contextId}`)} data-slot="motion-highlight" style={stryMutAct_9fa48("4073") ? {} : (stryCov_9fa48("4073"), {
          position: stryMutAct_9fa48("4074") ? "" : (stryCov_9fa48("4074"), 'absolute'),
          zIndex: 0,
          ...contextStyle,
          ...style
        })} className={cn(contextClassName, activeClassName)} transition={itemTransition} initial={stryMutAct_9fa48("4075") ? {} : (stryCov_9fa48("4075"), {
          opacity: 0
        })} animate={stryMutAct_9fa48("4076") ? {} : (stryCov_9fa48("4076"), {
          opacity: 1
        })} exit={stryMutAct_9fa48("4077") ? {} : (stryCov_9fa48("4077"), {
          opacity: 0,
          transition: stryMutAct_9fa48("4078") ? {} : (stryCov_9fa48("4078"), {
            ...itemTransition,
            delay: stryMutAct_9fa48("4079") ? (itemTransition?.delay ?? 0) - (exitDelay ?? contextExitDelay ?? 0) / 1000 : (stryCov_9fa48("4079"), (stryMutAct_9fa48("4080") ? itemTransition?.delay && 0 : (stryCov_9fa48("4080"), (stryMutAct_9fa48("4081") ? itemTransition.delay : (stryCov_9fa48("4081"), itemTransition?.delay)) ?? 0)) + (stryMutAct_9fa48("4082") ? (exitDelay ?? contextExitDelay ?? 0) * 1000 : (stryCov_9fa48("4082"), (stryMutAct_9fa48("4083") ? (exitDelay ?? contextExitDelay) && 0 : (stryCov_9fa48("4083"), (stryMutAct_9fa48("4084") ? exitDelay && contextExitDelay : (stryCov_9fa48("4084"), exitDelay ?? contextExitDelay)) ?? 0)) / 1000)))
          })
        })} {...dataAttributes} />)}
        </AnimatePresence>)}

      {React.cloneElement(element, stryMutAct_9fa48("4085") ? {} : (stryCov_9fa48("4085"), {
        style: stryMutAct_9fa48("4086") ? {} : (stryCov_9fa48("4086"), {
          position: stryMutAct_9fa48("4087") ? "" : (stryCov_9fa48("4087"), 'relative'),
          zIndex: 1
        }),
        className: element.props.className,
        ...getNonOverridingDataAttributes(element, stryMutAct_9fa48("4088") ? {} : (stryCov_9fa48("4088"), {
          ...dataAttributes,
          'data-slot': stryMutAct_9fa48("4089") ? "" : (stryCov_9fa48("4089"), 'motion-highlight-item')
        }))
      }))}
    </Component> : children;
  }
}
export { Highlight, HighlightItem, useHighlight };