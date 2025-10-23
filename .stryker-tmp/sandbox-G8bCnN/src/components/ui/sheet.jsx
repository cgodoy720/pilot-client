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
import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { cva } from "class-variance-authority";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";
const Sheet = SheetPrimitive.Root;
const SheetTrigger = SheetPrimitive.Trigger;
const SheetClose = SheetPrimitive.Close;
const SheetPortal = SheetPrimitive.Portal;
const SheetOverlay = React.forwardRef(stryMutAct_9fa48("4252") ? () => undefined : (stryCov_9fa48("4252"), ({
  className,
  ...props
}, ref) => <SheetPrimitive.Overlay className={cn(stryMutAct_9fa48("4253") ? "" : (stryCov_9fa48("4253"), "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"), className)} {...props} ref={ref} />));
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName;
const sheetVariants = cva(stryMutAct_9fa48("4254") ? "" : (stryCov_9fa48("4254"), "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500"), stryMutAct_9fa48("4255") ? {} : (stryCov_9fa48("4255"), {
  variants: stryMutAct_9fa48("4256") ? {} : (stryCov_9fa48("4256"), {
    side: stryMutAct_9fa48("4257") ? {} : (stryCov_9fa48("4257"), {
      top: stryMutAct_9fa48("4258") ? "" : (stryCov_9fa48("4258"), "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top"),
      bottom: stryMutAct_9fa48("4259") ? "" : (stryCov_9fa48("4259"), "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom"),
      left: stryMutAct_9fa48("4260") ? "" : (stryCov_9fa48("4260"), "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm"),
      right: stryMutAct_9fa48("4261") ? "" : (stryCov_9fa48("4261"), "inset-y-0 right-0 h-full w-3/4  border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm")
    })
  }),
  defaultVariants: stryMutAct_9fa48("4262") ? {} : (stryCov_9fa48("4262"), {
    side: stryMutAct_9fa48("4263") ? "" : (stryCov_9fa48("4263"), "right")
  })
}));
const SheetContent = React.forwardRef(stryMutAct_9fa48("4264") ? () => undefined : (stryCov_9fa48("4264"), ({
  side = stryMutAct_9fa48("4265") ? "" : (stryCov_9fa48("4265"), "right"),
  className,
  children,
  ...props
}, ref) => <SheetPortal>
    <SheetOverlay />
    <SheetPrimitive.Content ref={ref} className={cn(sheetVariants(stryMutAct_9fa48("4266") ? {} : (stryCov_9fa48("4266"), {
    side
  })), className)} {...props}>
      {children}
      <SheetPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </SheetPrimitive.Close>
    </SheetPrimitive.Content>
  </SheetPortal>));
SheetContent.displayName = SheetPrimitive.Content.displayName;
const SheetHeader = stryMutAct_9fa48("4267") ? () => undefined : (stryCov_9fa48("4267"), (() => {
  const SheetHeader = ({
    className,
    ...props
  }) => <div className={cn(stryMutAct_9fa48("4268") ? "" : (stryCov_9fa48("4268"), "flex flex-col space-y-2 text-center sm:text-left"), className)} {...props} />;
  return SheetHeader;
})());
SheetHeader.displayName = stryMutAct_9fa48("4269") ? "" : (stryCov_9fa48("4269"), "SheetHeader");
const SheetFooter = stryMutAct_9fa48("4270") ? () => undefined : (stryCov_9fa48("4270"), (() => {
  const SheetFooter = ({
    className,
    ...props
  }) => <div className={cn(stryMutAct_9fa48("4271") ? "" : (stryCov_9fa48("4271"), "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2"), className)} {...props} />;
  return SheetFooter;
})());
SheetFooter.displayName = stryMutAct_9fa48("4272") ? "" : (stryCov_9fa48("4272"), "SheetFooter");
const SheetTitle = React.forwardRef(stryMutAct_9fa48("4273") ? () => undefined : (stryCov_9fa48("4273"), ({
  className,
  ...props
}, ref) => <SheetPrimitive.Title ref={ref} className={cn(stryMutAct_9fa48("4274") ? "" : (stryCov_9fa48("4274"), "text-lg font-semibold text-foreground"), className)} {...props} />));
SheetTitle.displayName = SheetPrimitive.Title.displayName;
const SheetDescription = React.forwardRef(stryMutAct_9fa48("4275") ? () => undefined : (stryCov_9fa48("4275"), ({
  className,
  ...props
}, ref) => <SheetPrimitive.Description ref={ref} className={cn(stryMutAct_9fa48("4276") ? "" : (stryCov_9fa48("4276"), "text-sm text-muted-foreground"), className)} {...props} />));
SheetDescription.displayName = SheetPrimitive.Description.displayName;
export { Sheet, SheetPortal, SheetOverlay, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription };