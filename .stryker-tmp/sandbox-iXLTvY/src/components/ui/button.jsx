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
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "src/lib/utils";
const buttonVariants = cva(stryMutAct_9fa48("4168") ? "" : (stryCov_9fa48("4168"), "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"), stryMutAct_9fa48("4169") ? {} : (stryCov_9fa48("4169"), {
  variants: stryMutAct_9fa48("4170") ? {} : (stryCov_9fa48("4170"), {
    variant: stryMutAct_9fa48("4171") ? {} : (stryCov_9fa48("4171"), {
      default: stryMutAct_9fa48("4172") ? "" : (stryCov_9fa48("4172"), "bg-primary text-primary-foreground hover:bg-primary/90"),
      destructive: stryMutAct_9fa48("4173") ? "" : (stryCov_9fa48("4173"), "bg-destructive text-destructive-foreground hover:bg-destructive/90"),
      outline: stryMutAct_9fa48("4174") ? "" : (stryCov_9fa48("4174"), "border border-input bg-background hover:bg-accent hover:text-accent-foreground"),
      secondary: stryMutAct_9fa48("4175") ? "" : (stryCov_9fa48("4175"), "bg-secondary text-secondary-foreground hover:bg-secondary/80"),
      ghost: stryMutAct_9fa48("4176") ? "" : (stryCov_9fa48("4176"), "hover:bg-accent hover:text-accent-foreground"),
      link: stryMutAct_9fa48("4177") ? "" : (stryCov_9fa48("4177"), "text-primary underline-offset-4 hover:underline")
    }),
    size: stryMutAct_9fa48("4178") ? {} : (stryCov_9fa48("4178"), {
      default: stryMutAct_9fa48("4179") ? "" : (stryCov_9fa48("4179"), "h-10 px-4 py-2"),
      sm: stryMutAct_9fa48("4180") ? "" : (stryCov_9fa48("4180"), "h-9 rounded-md px-3"),
      lg: stryMutAct_9fa48("4181") ? "" : (stryCov_9fa48("4181"), "h-11 rounded-md px-8"),
      icon: stryMutAct_9fa48("4182") ? "" : (stryCov_9fa48("4182"), "h-10 w-10")
    })
  }),
  defaultVariants: stryMutAct_9fa48("4183") ? {} : (stryCov_9fa48("4183"), {
    variant: stryMutAct_9fa48("4184") ? "" : (stryCov_9fa48("4184"), "default"),
    size: stryMutAct_9fa48("4185") ? "" : (stryCov_9fa48("4185"), "default")
  })
}));
const Button = React.forwardRef(({
  className,
  variant,
  size,
  asChild = stryMutAct_9fa48("4186") ? true : (stryCov_9fa48("4186"), false),
  ...props
}, ref) => {
  if (stryMutAct_9fa48("4187")) {
    {}
  } else {
    stryCov_9fa48("4187");
    const Comp = asChild ? Slot : stryMutAct_9fa48("4188") ? "" : (stryCov_9fa48("4188"), "button");
    return <Comp className={cn(buttonVariants(stryMutAct_9fa48("4189") ? {} : (stryCov_9fa48("4189"), {
      variant,
      size,
      className
    })))} ref={ref} {...props} />;
  }
});
Button.displayName = stryMutAct_9fa48("4190") ? "" : (stryCov_9fa48("4190"), "Button");
export { Button, buttonVariants };