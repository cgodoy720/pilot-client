'use client';;
import * as React from 'react';
import { motion } from 'motion/react';

import { getStrictContext } from '../../../../lib/get-strict-context';
import { Slot } from '../animate/slot';

const [RippleButtonProvider, useRippleButton] =
  getStrictContext('RippleButtonContext');

function RippleButton({
  ref,
  onClick,
  hoverScale = 1.05,
  tapScale = 0.95,
  asChild = false,
  style,
  ...props
}) {
  const [ripples, setRipples] = React.useState([]);
  const buttonRef = React.useRef(null);
  React.useImperativeHandle(ref, () => buttonRef.current);

  const createRipple = React.useCallback((event) => {
    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const newRipple = {
      id: Date.now(),
      x,
      y,
    };

    setRipples((prev) => [...prev, newRipple]);

    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 600);
  }, []);

  const handleClick = React.useCallback((event) => {
    createRipple(event);
    if (onClick) {
      onClick(event);
    }
  }, [createRipple, onClick]);

  const Component = asChild ? Slot : motion.button;

  return (
    <RippleButtonProvider value={{ ripples, setRipples }}>
      <Component
        ref={buttonRef}
        data-slot="ripple-button"
        onClick={handleClick}
        whileTap={{ scale: tapScale }}
        whileHover={{ scale: hoverScale }}
        style={{
          position: 'relative',
          overflow: 'hidden',
          ...style,
        }}
        {...props} />
    </RippleButtonProvider>
  );
}

function RippleButtonRipples({
  color = 'var(--ripple-button-ripple-color)',
  scale = 10,
  transition = { duration: 0.6, ease: 'easeOut' },
  asChild = false,
  style,
  ...props
}) {
  const { ripples } = useRippleButton();

  const Component = asChild ? Slot : motion.span;

  return ripples.map((ripple) => (
    <Component
      key={ripple.id}
      initial={{ scale: 0, opacity: 0.5 }}
      animate={{ scale, opacity: 0 }}
      transition={transition}
      style={{
        position: 'absolute',
        borderRadius: '50%',
        pointerEvents: 'none',
        width: '20px',
        height: '20px',
        backgroundColor: color,
        top: ripple.y - 10,
        left: ripple.x - 10,
        ...style,
      }}
      {...props} />
  ));
}

export { RippleButton, RippleButtonRipples };
