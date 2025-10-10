'use client';;
import * as React from 'react';

import { buttonVariants } from './button';
import {
  RippleButton as RippleButtonPrimitive,
  RippleButtonRipples as RippleButtonRipplesPrimitive,
} from '../../primitives/buttons/ripple';
import { cn } from '../../../../lib/utils';

const rippleButtonVariants = {
  default: '[--ripple-button-ripple-color:var(--primary-foreground)]',
  accent: '[--ripple-button-ripple-color:var(--accent-foreground)]',
  destructive: '[--ripple-button-ripple-color:var(--destructive-foreground)]',
  outline: '[--ripple-button-ripple-color:var(--foreground)]',
  secondary: '[--ripple-button-ripple-color:var(--secondary-foreground)]',
  ghost: '[--ripple-button-ripple-color:var(--foreground)]',
  link: '[--ripple-button-ripple-color:var(--primary-foreground)]',
};

function RippleButton({
  className,
  variant,
  size,
  ...props
}) {
  return (
    <RippleButtonPrimitive
      className={cn(
        buttonVariants({ variant, size, className }),
        rippleButtonVariants[variant]
      )}
      {...props} />
  );
}

function RippleButtonRipples(props) {
  return <RippleButtonRipplesPrimitive {...props} />;
}

export { RippleButton, RippleButtonRipples };
