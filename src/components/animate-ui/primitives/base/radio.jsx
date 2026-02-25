'use client';;
import * as React from 'react';
import { RadioGroup as RadioGroupPrimitive } from '@base-ui-components/react/radio-group';
import { Radio as RadioPrimitive } from '@base-ui-components/react/radio';
import { AnimatePresence, motion } from 'motion/react';

import { getStrictContext } from 'src/lib/get-strict-context';
import { useControlledState } from 'src/hooks/use-controlled-state';

const [RadioGroupProvider, useRadioGroup] =
  getStrictContext('RadioGroupContext');

const [RadioProvider, useRadio] =
  getStrictContext('RadioContext');

function RadioGroup(props) {
  const [value, setValue] = useControlledState({
    value: props.value ?? undefined,
    defaultValue: props.defaultValue,
    onChange: props.onValueChange,
  });

  return (
    <RadioGroupProvider value={{ value, setValue }}>
      <RadioGroupPrimitive data-slot="radio-group" {...props} onValueChange={setValue} />
    </RadioGroupProvider>
  );
}

function RadioIndicator({
  transition = { type: 'spring', stiffness: 200, damping: 16 },
  ...props
}) {
  const { isChecked } = useRadio();

  return (
    <AnimatePresence>
      {isChecked && (
        <RadioPrimitive.Indicator
          data-slot="radio-group-indicator"
          keepMounted
          render={
            <motion.div
              key="radio-group-indicator-circle"
              data-slot="radio-group-indicator-circle"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={transition}
              {...props} />
          } />
      )}
    </AnimatePresence>
  );
}

function Radio({
  value: valueProps,
  disabled,
  required,
  ...props
}) {
  const { value } = useRadioGroup();
  const [isChecked, setIsChecked] = React.useState(value === valueProps);

  React.useEffect(() => {
    setIsChecked(value === valueProps);
  }, [value, valueProps]);

  return (
    <RadioProvider value={{ isChecked, setIsChecked }}>
      <RadioPrimitive.Root
        value={valueProps}
        disabled={disabled}
        required={required}
        render={
          <motion.button
            data-slot="radio-group-item"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            {...props} />
        } />
    </RadioProvider>
  );
}

export { RadioGroup, Radio, RadioIndicator, useRadioGroup, useRadio };
