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
import { Checkbox as CheckboxPrimitive } from 'radix-ui';
import { motion } from 'motion/react';
import { getStrictContext } from '../../../../lib/get-strict-context';
import { useControlledState } from '../../../../hooks/use-controlled-state';
const [CheckboxProvider, useCheckbox] = getStrictContext(stryMutAct_9fa48("4135") ? "" : (stryCov_9fa48("4135"), 'CheckboxContext'));
function Checkbox({
  defaultChecked,
  checked,
  onCheckedChange,
  disabled,
  required,
  name,
  value,
  ...props
}) {
  if (stryMutAct_9fa48("4136")) {
    {}
  } else {
    stryCov_9fa48("4136");
    const [isChecked, setIsChecked] = useControlledState(stryMutAct_9fa48("4137") ? {} : (stryCov_9fa48("4137"), {
      value: checked,
      defaultValue: defaultChecked,
      onChange: onCheckedChange
    }));
    return <CheckboxProvider value={stryMutAct_9fa48("4138") ? {} : (stryCov_9fa48("4138"), {
      isChecked,
      setIsChecked
    })}>
      <CheckboxPrimitive.Root defaultChecked={defaultChecked} checked={checked} onCheckedChange={setIsChecked} disabled={disabled} required={required} name={name} value={value} asChild>
        <motion.button data-slot="checkbox" whileTap={stryMutAct_9fa48("4139") ? {} : (stryCov_9fa48("4139"), {
          scale: 0.95
        })} whileHover={stryMutAct_9fa48("4140") ? {} : (stryCov_9fa48("4140"), {
          scale: 1.05
        })} {...props} />
      </CheckboxPrimitive.Root>
    </CheckboxProvider>;
  }
}
function CheckboxIndicator(props) {
  if (stryMutAct_9fa48("4141")) {
    {}
  } else {
    stryCov_9fa48("4141");
    const {
      isChecked
    } = useCheckbox();
    return <CheckboxPrimitive.Indicator forceMount asChild>
      <motion.svg data-slot="checkbox-indicator" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="3.5" stroke="currentColor" initial="unchecked" animate={isChecked ? stryMutAct_9fa48("4142") ? "" : (stryCov_9fa48("4142"), 'checked') : stryMutAct_9fa48("4143") ? "" : (stryCov_9fa48("4143"), 'unchecked')} {...props}>
        {(stryMutAct_9fa48("4146") ? isChecked !== 'indeterminate' : stryMutAct_9fa48("4145") ? false : stryMutAct_9fa48("4144") ? true : (stryCov_9fa48("4144", "4145", "4146"), isChecked === (stryMutAct_9fa48("4147") ? "" : (stryCov_9fa48("4147"), 'indeterminate')))) ? <motion.line x1="5" y1="12" x2="19" y2="12" strokeLinecap="round" initial={stryMutAct_9fa48("4148") ? {} : (stryCov_9fa48("4148"), {
          pathLength: 0,
          opacity: 0
        })} animate={stryMutAct_9fa48("4149") ? {} : (stryCov_9fa48("4149"), {
          pathLength: 1,
          opacity: 1,
          transition: stryMutAct_9fa48("4150") ? {} : (stryCov_9fa48("4150"), {
            duration: 0.2
          })
        })} /> : <motion.path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" variants={stryMutAct_9fa48("4151") ? {} : (stryCov_9fa48("4151"), {
          checked: stryMutAct_9fa48("4152") ? {} : (stryCov_9fa48("4152"), {
            pathLength: 1,
            opacity: 1,
            transition: stryMutAct_9fa48("4153") ? {} : (stryCov_9fa48("4153"), {
              duration: 0.2,
              delay: 0.2
            })
          }),
          unchecked: stryMutAct_9fa48("4154") ? {} : (stryCov_9fa48("4154"), {
            pathLength: 0,
            opacity: 0,
            transition: stryMutAct_9fa48("4155") ? {} : (stryCov_9fa48("4155"), {
              duration: 0.2
            })
          })
        })} />}
      </motion.svg>
    </CheckboxPrimitive.Indicator>;
  }
}
export { Checkbox, CheckboxIndicator, useCheckbox };