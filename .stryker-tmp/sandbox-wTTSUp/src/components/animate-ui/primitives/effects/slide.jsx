// @ts-nocheck
'use client';;
import * as React from 'react';
import { motion } from 'motion/react';

import { useIsInView } from '../../../../hooks/use-is-in-view';
import { Slot } from '../animate/slot';

function Slide({
  ref,
  transition = { type: 'spring', stiffness: 200, damping: 20 },
  delay = 0,
  inView = false,
  inViewMargin = '0px',
  inViewOnce = true,
  direction = 'up',
  offset = 100,
  asChild = false,
  ...props
}) {
  const { ref: localRef, isInView } = useIsInView(ref, {
    inView,
    inViewOnce,
    inViewMargin,
  });

  const axis = direction === 'up' || direction === 'down' ? 'y' : 'x';
  const hidden = {
    [axis]: direction === 'right' || direction === 'down' ? -offset : offset,
  };
  const visible = { [axis]: 0 };

  const Component = asChild ? Slot : motion.div;

  return (
    <Component
      ref={localRef}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      exit="hidden"
      variants={{ hidden, visible }}
      transition={{
        ...transition,
        delay: (transition?.delay ?? 0) + delay / 1000,
      }}
      {...props} />
  );
}

function Slides({
  children,
  delay = 0,
  holdDelay = 0,
  ...props
}) {
  const array = React.Children.toArray(children);

  return (
    <>
      {array.map((child, index) => (
        <Slide key={child.key ?? index} delay={delay + index * holdDelay} {...props}>
          {child}
        </Slide>
      ))}
    </>
  );
}

export { Slide, Slides };
