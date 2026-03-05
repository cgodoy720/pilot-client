import * as React from 'react';

import {
  AlertDialog as AlertDialogPrimitive,
  AlertDialogContent as AlertDialogContentPrimitive,
  AlertDialogDescription as AlertDialogDescriptionPrimitive,
  AlertDialogFooter as AlertDialogFooterPrimitive,
  AlertDialogHeader as AlertDialogHeaderPrimitive,
  AlertDialogTitle as AlertDialogTitlePrimitive,
  AlertDialogTrigger as AlertDialogTriggerPrimitive,
  AlertDialogPortal as AlertDialogPortalPrimitive,
  AlertDialogOverlay as AlertDialogOverlayPrimitive,
  AlertDialogAction as AlertDialogActionPrimitive,
  AlertDialogCancel as AlertDialogCancelPrimitive,
} from 'src/components/animate-ui/primitives/radix/alert-dialog';
import { buttonVariants } from 'src/components/animate-ui/components/buttons/button';
import { cn } from 'src/lib/utils';

function AlertDialog(props) {
  return <AlertDialogPrimitive {...props} />;
}

function AlertDialogTrigger(props) {
  return <AlertDialogTriggerPrimitive {...props} />;
}

function AlertDialogOverlay({
  className,
  ...props
}) {
  return (<AlertDialogOverlayPrimitive className={cn('fixed inset-0 z-50 bg-black/50', className)} {...props} />);
}

function AlertDialogContent({
  className,
  ...props
}) {
  return (
    <AlertDialogPortalPrimitive>
      <AlertDialogOverlay />
      <AlertDialogContentPrimitive
        className={cn(
          'bg-background fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg sm:max-w-lg',
          className
        )}
        {...props} />
    </AlertDialogPortalPrimitive>
  );
}

function AlertDialogHeader({
  className,
  ...props
}) {
  return (
    <AlertDialogHeaderPrimitive
      className={cn('flex flex-col gap-2 text-center sm:text-left', className)}
      {...props} />
  );
}

function AlertDialogFooter({
  className,
  ...props
}) {
  return (
    <AlertDialogFooterPrimitive
      className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)}
      {...props} />
  );
}

function AlertDialogTitle({
  className,
  ...props
}) {
  return (<AlertDialogTitlePrimitive className={cn('text-lg font-semibold', className)} {...props} />);
}

function AlertDialogDescription({
  className,
  ...props
}) {
  return (<AlertDialogDescriptionPrimitive className={cn('text-muted-foreground text-sm', className)} {...props} />);
}

function AlertDialogAction({
  className,
  ...props
}) {
  return (<AlertDialogActionPrimitive className={cn(buttonVariants(), className)} {...props} />);
}

function AlertDialogCancel({
  className,
  ...props
}) {
  return (
    <AlertDialogCancelPrimitive
      className={cn(buttonVariants({ variant: 'outline' }), className)}
      {...props} />
  );
}

export { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel };
