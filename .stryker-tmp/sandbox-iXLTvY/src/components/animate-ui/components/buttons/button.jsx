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
import { cva } from 'class-variance-authority';
import { Button as ButtonPrimitive } from '../../primitives/buttons/button';
import { cn } from '../../../../lib/utils';
const buttonVariants = cva(stryMutAct_9fa48("3152") ? "" : (stryCov_9fa48("3152"), "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[box-shadow,_color,_background-color,_border-color,_outline-color,_text-decoration-color,_fill,_stroke] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"), stryMutAct_9fa48("3153") ? {} : (stryCov_9fa48("3153"), {
  variants: stryMutAct_9fa48("3154") ? {} : (stryCov_9fa48("3154"), {
    variant: stryMutAct_9fa48("3155") ? {} : (stryCov_9fa48("3155"), {
      default: stryMutAct_9fa48("3156") ? "" : (stryCov_9fa48("3156"), 'bg-primary text-primary-foreground shadow-xs hover:bg-primary/90'),
      accent: stryMutAct_9fa48("3157") ? "" : (stryCov_9fa48("3157"), 'bg-accent text-accent-foreground shadow-xs hover:bg-accent/90'),
      destructive: stryMutAct_9fa48("3158") ? "" : (stryCov_9fa48("3158"), 'bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60'),
      outline: stryMutAct_9fa48("3159") ? "" : (stryCov_9fa48("3159"), 'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50'),
      secondary: stryMutAct_9fa48("3160") ? "" : (stryCov_9fa48("3160"), 'bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80'),
      ghost: stryMutAct_9fa48("3161") ? "" : (stryCov_9fa48("3161"), 'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50'),
      link: stryMutAct_9fa48("3162") ? "" : (stryCov_9fa48("3162"), 'text-primary underline-offset-4 hover:underline')
    }),
    size: stryMutAct_9fa48("3163") ? {} : (stryCov_9fa48("3163"), {
      default: stryMutAct_9fa48("3164") ? "" : (stryCov_9fa48("3164"), 'h-9 px-4 py-2 has-[>svg]:px-3'),
      sm: stryMutAct_9fa48("3165") ? "" : (stryCov_9fa48("3165"), 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5'),
      lg: stryMutAct_9fa48("3166") ? "" : (stryCov_9fa48("3166"), 'h-10 rounded-md px-6 has-[>svg]:px-4'),
      icon: stryMutAct_9fa48("3167") ? "" : (stryCov_9fa48("3167"), 'size-9'),
      'icon-sm': stryMutAct_9fa48("3168") ? "" : (stryCov_9fa48("3168"), 'size-8 rounded-md'),
      'icon-lg': stryMutAct_9fa48("3169") ? "" : (stryCov_9fa48("3169"), 'size-10 rounded-md')
    })
  }),
  defaultVariants: stryMutAct_9fa48("3170") ? {} : (stryCov_9fa48("3170"), {
    variant: stryMutAct_9fa48("3171") ? "" : (stryCov_9fa48("3171"), 'default'),
    size: stryMutAct_9fa48("3172") ? "" : (stryCov_9fa48("3172"), 'default')
  })
}));
function Button({
  className,
  variant,
  size,
  ...props
}) {
  if (stryMutAct_9fa48("3173")) {
    {}
  } else {
    stryCov_9fa48("3173");
    return <ButtonPrimitive className={cn(buttonVariants(stryMutAct_9fa48("3174") ? {} : (stryCov_9fa48("3174"), {
      variant,
      size,
      className
    })))} {...props} />;
  }
}
export { Button, buttonVariants };