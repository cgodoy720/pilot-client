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
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Slide component for animating elements in/out
 * Built with Framer Motion for Animate UI pattern
 */

const slideVariants = stryMutAct_9fa48("4279") ? {} : (stryCov_9fa48("4279"), {
  // Slide out to the left
  exitLeft: stryMutAct_9fa48("4280") ? {} : (stryCov_9fa48("4280"), {
    x: stryMutAct_9fa48("4281") ? "" : (stryCov_9fa48("4281"), '-100%'),
    opacity: 0,
    transition: stryMutAct_9fa48("4282") ? {} : (stryCov_9fa48("4282"), {
      duration: 0.6,
      ease: stryMutAct_9fa48("4283") ? [] : (stryCov_9fa48("4283"), [0.4, 0, 0.2, 1]) // Custom easing
    })
  }),
  // Slide out to the right
  exitRight: stryMutAct_9fa48("4284") ? {} : (stryCov_9fa48("4284"), {
    x: stryMutAct_9fa48("4285") ? "" : (stryCov_9fa48("4285"), '100%'),
    opacity: 0,
    transition: stryMutAct_9fa48("4286") ? {} : (stryCov_9fa48("4286"), {
      duration: 0.6,
      ease: stryMutAct_9fa48("4287") ? [] : (stryCov_9fa48("4287"), [0.4, 0, 0.2, 1])
    })
  }),
  // Slide in from the left
  enterFromLeft: stryMutAct_9fa48("4288") ? {} : (stryCov_9fa48("4288"), {
    x: stryMutAct_9fa48("4289") ? [] : (stryCov_9fa48("4289"), [stryMutAct_9fa48("4290") ? "" : (stryCov_9fa48("4290"), '-100%'), stryMutAct_9fa48("4291") ? "" : (stryCov_9fa48("4291"), '0%')]),
    opacity: stryMutAct_9fa48("4292") ? [] : (stryCov_9fa48("4292"), [0, 1]),
    transition: stryMutAct_9fa48("4293") ? {} : (stryCov_9fa48("4293"), {
      duration: 0.6,
      ease: stryMutAct_9fa48("4294") ? [] : (stryCov_9fa48("4294"), [0.4, 0, 0.2, 1])
    })
  }),
  // Slide in from the right
  enterFromRight: stryMutAct_9fa48("4295") ? {} : (stryCov_9fa48("4295"), {
    x: stryMutAct_9fa48("4296") ? [] : (stryCov_9fa48("4296"), [stryMutAct_9fa48("4297") ? "" : (stryCov_9fa48("4297"), '100%'), stryMutAct_9fa48("4298") ? "" : (stryCov_9fa48("4298"), '0%')]),
    opacity: stryMutAct_9fa48("4299") ? [] : (stryCov_9fa48("4299"), [0, 1]),
    transition: stryMutAct_9fa48("4300") ? {} : (stryCov_9fa48("4300"), {
      duration: 0.6,
      ease: stryMutAct_9fa48("4301") ? [] : (stryCov_9fa48("4301"), [0.4, 0, 0.2, 1])
    })
  }),
  // Static/visible state
  center: stryMutAct_9fa48("4302") ? {} : (stryCov_9fa48("4302"), {
    x: stryMutAct_9fa48("4303") ? "" : (stryCov_9fa48("4303"), '0%'),
    opacity: 1,
    transition: stryMutAct_9fa48("4304") ? {} : (stryCov_9fa48("4304"), {
      duration: 0.6,
      ease: stryMutAct_9fa48("4305") ? [] : (stryCov_9fa48("4305"), [0.4, 0, 0.2, 1])
    })
  })
});
export const Slide = ({
  children,
  direction = stryMutAct_9fa48("4306") ? "" : (stryCov_9fa48("4306"), 'left'),
  // 'left' | 'right' | null
  isVisible = stryMutAct_9fa48("4307") ? false : (stryCov_9fa48("4307"), true),
  delay = 0,
  className = stryMutAct_9fa48("4308") ? "Stryker was here!" : (stryCov_9fa48("4308"), ''),
  ...props
}) => {
  if (stryMutAct_9fa48("4309")) {
    {}
  } else {
    stryCov_9fa48("4309");
    // Determine which animation variant to use
    const getAnimateVariant = () => {
      if (stryMutAct_9fa48("4310")) {
        {}
      } else {
        stryCov_9fa48("4310");
        if (stryMutAct_9fa48("4313") ? false : stryMutAct_9fa48("4312") ? true : stryMutAct_9fa48("4311") ? isVisible : (stryCov_9fa48("4311", "4312", "4313"), !isVisible)) {
          if (stryMutAct_9fa48("4314")) {
            {}
          } else {
            stryCov_9fa48("4314");
            return (stryMutAct_9fa48("4317") ? direction !== 'left' : stryMutAct_9fa48("4316") ? false : stryMutAct_9fa48("4315") ? true : (stryCov_9fa48("4315", "4316", "4317"), direction === (stryMutAct_9fa48("4318") ? "" : (stryCov_9fa48("4318"), 'left')))) ? stryMutAct_9fa48("4319") ? "" : (stryCov_9fa48("4319"), 'exitLeft') : stryMutAct_9fa48("4320") ? "" : (stryCov_9fa48("4320"), 'exitRight');
          }
        }
        return stryMutAct_9fa48("4321") ? "" : (stryCov_9fa48("4321"), 'center');
      }
    };
    const getInitialVariant = () => {
      if (stryMutAct_9fa48("4322")) {
        {}
      } else {
        stryCov_9fa48("4322");
        if (stryMutAct_9fa48("4325") ? false : stryMutAct_9fa48("4324") ? true : stryMutAct_9fa48("4323") ? isVisible : (stryCov_9fa48("4323", "4324", "4325"), !isVisible)) {
          if (stryMutAct_9fa48("4326")) {
            {}
          } else {
            stryCov_9fa48("4326");
            return (stryMutAct_9fa48("4329") ? direction !== 'left' : stryMutAct_9fa48("4328") ? false : stryMutAct_9fa48("4327") ? true : (stryCov_9fa48("4327", "4328", "4329"), direction === (stryMutAct_9fa48("4330") ? "" : (stryCov_9fa48("4330"), 'left')))) ? stryMutAct_9fa48("4331") ? "" : (stryCov_9fa48("4331"), 'exitLeft') : stryMutAct_9fa48("4332") ? "" : (stryCov_9fa48("4332"), 'exitRight');
          }
        }
        // When entering, come from opposite direction
        return (stryMutAct_9fa48("4335") ? direction !== 'left' : stryMutAct_9fa48("4334") ? false : stryMutAct_9fa48("4333") ? true : (stryCov_9fa48("4333", "4334", "4335"), direction === (stryMutAct_9fa48("4336") ? "" : (stryCov_9fa48("4336"), 'left')))) ? stryMutAct_9fa48("4337") ? "" : (stryCov_9fa48("4337"), 'enterFromRight') : stryMutAct_9fa48("4338") ? "" : (stryCov_9fa48("4338"), 'enterFromLeft');
      }
    };
    return <motion.div className={className} initial={getInitialVariant()} animate={getAnimateVariant()} exit={(stryMutAct_9fa48("4341") ? direction !== 'left' : stryMutAct_9fa48("4340") ? false : stryMutAct_9fa48("4339") ? true : (stryCov_9fa48("4339", "4340", "4341"), direction === (stryMutAct_9fa48("4342") ? "" : (stryCov_9fa48("4342"), 'left')))) ? stryMutAct_9fa48("4343") ? "" : (stryCov_9fa48("4343"), 'exitLeft') : stryMutAct_9fa48("4344") ? "" : (stryCov_9fa48("4344"), 'exitRight')} variants={slideVariants} style={stryMutAct_9fa48("4345") ? {} : (stryCov_9fa48("4345"), {
      originX: 0.5
    })} transition={stryMutAct_9fa48("4346") ? {} : (stryCov_9fa48("4346"), {
      delay: delay
    })} {...props}>
      {children}
    </motion.div>;
  }
};

/**
 * SlideGroup - For staggered animations
 */
export const SlideGroup = ({
  children,
  direction = stryMutAct_9fa48("4347") ? "" : (stryCov_9fa48("4347"), 'left'),
  staggerDelay = 0.05,
  className = stryMutAct_9fa48("4348") ? "Stryker was here!" : (stryCov_9fa48("4348"), ''),
  ...props
}) => {
  if (stryMutAct_9fa48("4349")) {
    {}
  } else {
    stryCov_9fa48("4349");
    return <motion.div className={className} initial="hidden" animate="visible" exit="exit" variants={stryMutAct_9fa48("4350") ? {} : (stryCov_9fa48("4350"), {
      visible: stryMutAct_9fa48("4351") ? {} : (stryCov_9fa48("4351"), {
        transition: stryMutAct_9fa48("4352") ? {} : (stryCov_9fa48("4352"), {
          staggerChildren: staggerDelay
        })
      }),
      exit: stryMutAct_9fa48("4353") ? {} : (stryCov_9fa48("4353"), {
        transition: stryMutAct_9fa48("4354") ? {} : (stryCov_9fa48("4354"), {
          staggerChildren: staggerDelay
        })
      })
    })} {...props}>
      {React.Children.map(children, stryMutAct_9fa48("4355") ? () => undefined : (stryCov_9fa48("4355"), (child, index) => <Slide key={index} direction={direction} delay={stryMutAct_9fa48("4356") ? index / staggerDelay : (stryCov_9fa48("4356"), index * staggerDelay)}>
          {child}
        </Slide>))}
    </motion.div>;
  }
};

/**
 * AnimatedSlideList - Wrapper for AnimatePresence with sliding
 */
export const AnimatedSlideList = ({
  children,
  direction = stryMutAct_9fa48("4357") ? "" : (stryCov_9fa48("4357"), 'left'),
  mode = stryMutAct_9fa48("4358") ? "" : (stryCov_9fa48("4358"), 'wait'),
  // 'wait' | 'sync' | 'popLayout'
  ...props
}) => {
  if (stryMutAct_9fa48("4359")) {
    {}
  } else {
    stryCov_9fa48("4359");
    return <AnimatePresence mode={mode} {...props}>
      {children}
    </AnimatePresence>;
  }
};
export default Slide;