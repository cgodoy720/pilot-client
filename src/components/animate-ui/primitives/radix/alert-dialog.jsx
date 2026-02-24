'use client';;
import * as React from 'react';
import { AlertDialog as AlertDialogPrimitive } from 'radix-ui';
import { AnimatePresence, motion } from 'motion/react';

import { useControlledState } from 'src/hooks/use-controlled-state';
import { getStrictContext } from 'src/lib/get-strict-context';

const [AlertDialogProvider, useAlertDialog] =
  getStrictContext('AlertDialogContext');

function AlertDialog(props) {
  const [isOpen, setIsOpen] = useControlledState({
    value: props?.open,
    defaultValue: props?.defaultOpen,
    onChange: props?.onOpenChange,
  });

  return (
    <AlertDialogProvider value={{ isOpen, setIsOpen }}>
      <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} onOpenChange={setIsOpen} />
    </AlertDialogProvider>
  );
}

function AlertDialogTrigger(props) {
  return (<AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />);
}

function AlertDialogPortal(props) {
  const { isOpen } = useAlertDialog();

  return (
    <AnimatePresence>
      {isOpen && (
        <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" forceMount {...props} />
      )}
    </AnimatePresence>
  );
}

function AlertDialogOverlay({
  transition = { duration: 0.2, ease: 'easeInOut' },
  ...props
}) {
  return (
    <AlertDialogPrimitive.Overlay data-slot="alert-dialog-overlay" asChild forceMount>
      <motion.div
        key="alert-dialog-overlay"
        initial={{ opacity: 0, filter: 'blur(4px)' }}
        animate={{ opacity: 1, filter: 'blur(0px)' }}
        exit={{ opacity: 0, filter: 'blur(4px)' }}
        transition={transition}
        {...props} />
    </AlertDialogPrimitive.Overlay>
  );
}

function AlertDialogContent({
  from = 'top',
  onOpenAutoFocus,
  onCloseAutoFocus,
  onEscapeKeyDown,
  transition = { type: 'spring', stiffness: 150, damping: 25 },
  ...props
}) {
  const initialRotation =
    from === 'bottom' || from === 'left' ? '20deg' : '-20deg';
  const isVertical = from === 'top' || from === 'bottom';
  const rotateAxis = isVertical ? 'rotateX' : 'rotateY';

  return (
    <AlertDialogPrimitive.Content
      asChild
      forceMount
      onOpenAutoFocus={onOpenAutoFocus}
      onCloseAutoFocus={onCloseAutoFocus}
      onEscapeKeyDown={onEscapeKeyDown}>
      <motion.div
        key="alert-dialog-content"
        data-slot="alert-dialog-content"
        initial={{
          opacity: 0,
          filter: 'blur(4px)',
          transform: `perspective(500px) ${rotateAxis}(${initialRotation}) scale(0.8)`,
        }}
        animate={{
          opacity: 1,
          filter: 'blur(0px)',
          transform: `perspective(500px) ${rotateAxis}(0deg) scale(1)`,
        }}
        exit={{
          opacity: 0,
          filter: 'blur(4px)',
          transform: `perspective(500px) ${rotateAxis}(${initialRotation}) scale(0.8)`,
        }}
        transition={transition}
        {...props} />
    </AlertDialogPrimitive.Content>
  );
}

function AlertDialogCancel(props) {
  return (<AlertDialogPrimitive.Cancel data-slot="alert-dialog-cancel" {...props} />);
}

function AlertDialogAction(props) {
  return (<AlertDialogPrimitive.Action data-slot="alert-dialog-action" {...props} />);
}

function AlertDialogHeader(props) {
  return <div data-slot="alert-dialog-header" {...props} />;
}

function AlertDialogFooter(props) {
  return <div data-slot="alert-dialog-footer" {...props} />;
}

function AlertDialogTitle(props) {
  return (<AlertDialogPrimitive.Title data-slot="alert-dialog-title" {...props} />);
}

function AlertDialogDescription(props) {
  return (<AlertDialogPrimitive.Description data-slot="alert-dialog-description" {...props} />);
}

export { AlertDialog, AlertDialogPortal, AlertDialogOverlay, AlertDialogCancel, AlertDialogAction, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, useAlertDialog };
