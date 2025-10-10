import * as React from 'react';
import * as motion from 'motion/react-client';

import {
  TooltipProvider as TooltipProviderPrimitive,
  Tooltip as TooltipPrimitive,
  TooltipTrigger as TooltipTriggerPrimitive,
  TooltipContent as TooltipContentPrimitive,
  TooltipArrow as TooltipArrowPrimitive,
} from '../../primitives/animate/tooltip';
import { cn } from '../../../../lib/utils';

function TooltipProvider({
  openDelay = 0,
  ...props
}) {
  return <TooltipProviderPrimitive openDelay={openDelay} {...props} />;
}

function Tooltip({
  sideOffset = 10,
  ...props
}) {
  return <TooltipPrimitive sideOffset={sideOffset} {...props} />;
}

function TooltipTrigger({
  ...props
}) {
  return <TooltipTriggerPrimitive {...props} />;
}

function TooltipContent({
  className,
  children,
  layout = 'preserve-aspect',
  ...props
}) {
  return (
    <TooltipContentPrimitive
      className={cn('z-50 w-fit bg-primary text-primary-foreground rounded-md', className)}
      {...props}>
      <motion.div className="overflow-hidden px-3 py-1.5 text-xs text-balance">
        <motion.div layout={layout}>{children}</motion.div>
      </motion.div>
      <TooltipArrowPrimitive
        className="fill-primary size-3 data-[side='bottom']:translate-y-[1px] data-[side='right']:translate-x-[1px] data-[side='left']:translate-x-[-1px] data-[side='top']:translate-y-[-1px]"
        tipRadius={2} />
    </TooltipContentPrimitive>
  );
}

export { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent };
