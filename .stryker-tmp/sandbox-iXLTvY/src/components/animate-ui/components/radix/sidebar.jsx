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
import { Slot } from 'radix-ui';
import { cva } from 'class-variance-authority';
import { PanelLeftIcon } from 'lucide-react';
import { useIsMobile } from '../../../../hooks/use-mobile';
import { cn } from '../../../../lib/utils';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Separator } from '../../../../components/ui/separator';
import { Skeleton } from '../../../../components/ui/skeleton';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from './sheet';
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from '../animate/tooltip';
import { Highlight, HighlightItem } from '../../primitives/effects/highlight';
import { getStrictContext } from '../../../../lib/get-strict-context';
const SIDEBAR_COOKIE_NAME = stryMutAct_9fa48("3186") ? "" : (stryCov_9fa48("3186"), 'sidebar_state');
const SIDEBAR_COOKIE_MAX_AGE = stryMutAct_9fa48("3187") ? 60 * 60 * 24 / 7 : (stryCov_9fa48("3187"), (stryMutAct_9fa48("3188") ? 60 * 60 / 24 : (stryCov_9fa48("3188"), (stryMutAct_9fa48("3189") ? 60 / 60 : (stryCov_9fa48("3189"), 60 * 60)) * 24)) * 7);
const SIDEBAR_WIDTH = stryMutAct_9fa48("3190") ? "" : (stryCov_9fa48("3190"), '16rem');
const SIDEBAR_WIDTH_MOBILE = stryMutAct_9fa48("3191") ? "" : (stryCov_9fa48("3191"), '18rem');
const SIDEBAR_WIDTH_ICON = stryMutAct_9fa48("3192") ? "" : (stryCov_9fa48("3192"), '3rem');
const SIDEBAR_KEYBOARD_SHORTCUT = stryMutAct_9fa48("3193") ? "" : (stryCov_9fa48("3193"), 'b');
const [LocalSidebarProvider, useSidebar] = getStrictContext(stryMutAct_9fa48("3194") ? "" : (stryCov_9fa48("3194"), 'SidebarContext'));
function SidebarProvider({
  defaultOpen = stryMutAct_9fa48("3195") ? false : (stryCov_9fa48("3195"), true),
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  style,
  children,
  ...props
}) {
  if (stryMutAct_9fa48("3196")) {
    {}
  } else {
    stryCov_9fa48("3196");
    const isMobile = useIsMobile();
    const [openMobile, setOpenMobile] = React.useState(stryMutAct_9fa48("3197") ? true : (stryCov_9fa48("3197"), false));

    // This is the internal state of the sidebar.
    // We use openProp and setOpenProp for control from outside the component.
    const [_open, _setOpen] = React.useState(defaultOpen);
    const open = stryMutAct_9fa48("3198") ? openProp && _open : (stryCov_9fa48("3198"), openProp ?? _open);
    const setOpen = React.useCallback(value => {
      if (stryMutAct_9fa48("3199")) {
        {}
      } else {
        stryCov_9fa48("3199");
        const openState = (stryMutAct_9fa48("3202") ? typeof value !== 'function' : stryMutAct_9fa48("3201") ? false : stryMutAct_9fa48("3200") ? true : (stryCov_9fa48("3200", "3201", "3202"), typeof value === (stryMutAct_9fa48("3203") ? "" : (stryCov_9fa48("3203"), 'function')))) ? value(open) : value;
        if (stryMutAct_9fa48("3205") ? false : stryMutAct_9fa48("3204") ? true : (stryCov_9fa48("3204", "3205"), setOpenProp)) {
          if (stryMutAct_9fa48("3206")) {
            {}
          } else {
            stryCov_9fa48("3206");
            setOpenProp(openState);
          }
        } else {
          if (stryMutAct_9fa48("3207")) {
            {}
          } else {
            stryCov_9fa48("3207");
            _setOpen(openState);
          }
        }

        // This sets the cookie to keep the sidebar state.
        document.cookie = stryMutAct_9fa48("3208") ? `` : (stryCov_9fa48("3208"), `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`);
      }
    }, stryMutAct_9fa48("3209") ? [] : (stryCov_9fa48("3209"), [setOpenProp, open]));

    // Helper to toggle the sidebar.
    const toggleSidebar = React.useCallback(() => {
      if (stryMutAct_9fa48("3210")) {
        {}
      } else {
        stryCov_9fa48("3210");
        return isMobile ? setOpenMobile(stryMutAct_9fa48("3211") ? () => undefined : (stryCov_9fa48("3211"), open => stryMutAct_9fa48("3212") ? open : (stryCov_9fa48("3212"), !open))) : setOpen(stryMutAct_9fa48("3213") ? () => undefined : (stryCov_9fa48("3213"), open => stryMutAct_9fa48("3214") ? open : (stryCov_9fa48("3214"), !open)));
      }
    }, stryMutAct_9fa48("3215") ? [] : (stryCov_9fa48("3215"), [isMobile, setOpen, setOpenMobile]));

    // Adds a keyboard shortcut to toggle the sidebar.
    React.useEffect(() => {
      if (stryMutAct_9fa48("3216")) {
        {}
      } else {
        stryCov_9fa48("3216");
        const handleKeyDown = event => {
          if (stryMutAct_9fa48("3217")) {
            {}
          } else {
            stryCov_9fa48("3217");
            if (stryMutAct_9fa48("3220") ? event.key === SIDEBAR_KEYBOARD_SHORTCUT || event.metaKey || event.ctrlKey : stryMutAct_9fa48("3219") ? false : stryMutAct_9fa48("3218") ? true : (stryCov_9fa48("3218", "3219", "3220"), (stryMutAct_9fa48("3222") ? event.key !== SIDEBAR_KEYBOARD_SHORTCUT : stryMutAct_9fa48("3221") ? true : (stryCov_9fa48("3221", "3222"), event.key === SIDEBAR_KEYBOARD_SHORTCUT)) && (stryMutAct_9fa48("3224") ? event.metaKey && event.ctrlKey : stryMutAct_9fa48("3223") ? true : (stryCov_9fa48("3223", "3224"), event.metaKey || event.ctrlKey)))) {
              if (stryMutAct_9fa48("3225")) {
                {}
              } else {
                stryCov_9fa48("3225");
                event.preventDefault();
                toggleSidebar();
              }
            }
          }
        };
        window.addEventListener(stryMutAct_9fa48("3226") ? "" : (stryCov_9fa48("3226"), 'keydown'), handleKeyDown);
        return stryMutAct_9fa48("3227") ? () => undefined : (stryCov_9fa48("3227"), () => window.removeEventListener(stryMutAct_9fa48("3228") ? "" : (stryCov_9fa48("3228"), 'keydown'), handleKeyDown));
      }
    }, stryMutAct_9fa48("3229") ? [] : (stryCov_9fa48("3229"), [toggleSidebar]));

    // We add a state so that we can do data-state="expanded" or "collapsed".
    // This makes it easier to style the sidebar with Tailwind classes.
    const state = open ? stryMutAct_9fa48("3230") ? "" : (stryCov_9fa48("3230"), 'expanded') : stryMutAct_9fa48("3231") ? "" : (stryCov_9fa48("3231"), 'collapsed');
    const contextValue = React.useMemo(stryMutAct_9fa48("3232") ? () => undefined : (stryCov_9fa48("3232"), () => stryMutAct_9fa48("3233") ? {} : (stryCov_9fa48("3233"), {
      state,
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar
    })), stryMutAct_9fa48("3234") ? [] : (stryCov_9fa48("3234"), [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar]));
    return <LocalSidebarProvider value={contextValue}>
      <TooltipProvider openDelay={0}>
        <div data-slot="sidebar-wrapper" style={stryMutAct_9fa48("3235") ? {} : (stryCov_9fa48("3235"), {
          '--sidebar-width': SIDEBAR_WIDTH,
          '--sidebar-width-icon': SIDEBAR_WIDTH_ICON,
          ...style
        })} className={cn(stryMutAct_9fa48("3236") ? "" : (stryCov_9fa48("3236"), 'group/sidebar-wrapper has-data-[variant=inset]:bg-sidebar flex min-h-svh w-full'), className)} {...props}>
          {children}
        </div>
      </TooltipProvider>
    </LocalSidebarProvider>;
  }
}
function Sidebar({
  side = stryMutAct_9fa48("3237") ? "" : (stryCov_9fa48("3237"), 'left'),
  variant = stryMutAct_9fa48("3238") ? "" : (stryCov_9fa48("3238"), 'sidebar'),
  collapsible = stryMutAct_9fa48("3239") ? "" : (stryCov_9fa48("3239"), 'offcanvas'),
  className,
  children,
  animateOnHover = stryMutAct_9fa48("3240") ? false : (stryCov_9fa48("3240"), true),
  containerClassName,
  transition = stryMutAct_9fa48("3241") ? {} : (stryCov_9fa48("3241"), {
    type: stryMutAct_9fa48("3242") ? "" : (stryCov_9fa48("3242"), 'spring'),
    stiffness: 350,
    damping: 35
  }),
  ...props
}) {
  if (stryMutAct_9fa48("3243")) {
    {}
  } else {
    stryCov_9fa48("3243");
    const {
      isMobile,
      state,
      openMobile,
      setOpenMobile
    } = useSidebar();
    if (stryMutAct_9fa48("3246") ? collapsible !== 'none' : stryMutAct_9fa48("3245") ? false : stryMutAct_9fa48("3244") ? true : (stryCov_9fa48("3244", "3245", "3246"), collapsible === (stryMutAct_9fa48("3247") ? "" : (stryCov_9fa48("3247"), 'none')))) {
      if (stryMutAct_9fa48("3248")) {
        {}
      } else {
        stryCov_9fa48("3248");
        return <Highlight enabled={animateOnHover} hover controlledItems mode="parent" containerClassName={containerClassName} transition={transition}>
        <div data-slot="sidebar" className={cn(stryMutAct_9fa48("3249") ? "" : (stryCov_9fa48("3249"), 'bg-sidebar text-sidebar-foreground flex h-full w-(--sidebar-width) flex-col'), className)} {...props}>
          {children}
        </div>
      </Highlight>;
      }
    }
    if (stryMutAct_9fa48("3251") ? false : stryMutAct_9fa48("3250") ? true : (stryCov_9fa48("3250", "3251"), isMobile)) {
      if (stryMutAct_9fa48("3252")) {
        {}
      } else {
        stryCov_9fa48("3252");
        return <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
        <SheetContent data-sidebar="sidebar" data-slot="sidebar" data-mobile="true" className="bg-sidebar text-sidebar-foreground w-(--sidebar-width) p-0 [&>button]:hidden" style={stryMutAct_9fa48("3253") ? {} : (stryCov_9fa48("3253"), {
            '--sidebar-width': SIDEBAR_WIDTH_MOBILE
          })} side={side}>
          <SheetHeader className="sr-only">
            <SheetTitle>Sidebar</SheetTitle>
            <SheetDescription>Displays the mobile sidebar.</SheetDescription>
          </SheetHeader>
          <Highlight enabled={animateOnHover} hover controlledItems mode="parent" containerClassName={cn(stryMutAct_9fa48("3254") ? "" : (stryCov_9fa48("3254"), 'h-full'), containerClassName)} transition={transition}>
            <div className="flex h-full w-full flex-col">{children}</div>
          </Highlight>
        </SheetContent>
      </Sheet>;
      }
    }
    return <div className="group peer text-sidebar-foreground hidden md:block" data-state={state} data-collapsible={(stryMutAct_9fa48("3257") ? state !== 'collapsed' : stryMutAct_9fa48("3256") ? false : stryMutAct_9fa48("3255") ? true : (stryCov_9fa48("3255", "3256", "3257"), state === (stryMutAct_9fa48("3258") ? "" : (stryCov_9fa48("3258"), 'collapsed')))) ? collapsible : stryMutAct_9fa48("3259") ? "Stryker was here!" : (stryCov_9fa48("3259"), '')} data-variant={variant} data-side={side} data-slot="sidebar">
      {/* This is what handles the sidebar gap on desktop */}
      <div data-slot="sidebar-gap" className={cn(stryMutAct_9fa48("3260") ? "" : (stryCov_9fa48("3260"), 'relative w-(--sidebar-width) bg-transparent transition-[width] duration-400 ease-[cubic-bezier(0.7,-0.15,0.25,1.15)]'), stryMutAct_9fa48("3261") ? "" : (stryCov_9fa48("3261"), 'group-data-[collapsible=offcanvas]:w-0'), stryMutAct_9fa48("3262") ? "" : (stryCov_9fa48("3262"), 'group-data-[side=right]:rotate-180'), (stryMutAct_9fa48("3265") ? variant === 'floating' && variant === 'inset' : stryMutAct_9fa48("3264") ? false : stryMutAct_9fa48("3263") ? true : (stryCov_9fa48("3263", "3264", "3265"), (stryMutAct_9fa48("3267") ? variant !== 'floating' : stryMutAct_9fa48("3266") ? false : (stryCov_9fa48("3266", "3267"), variant === (stryMutAct_9fa48("3268") ? "" : (stryCov_9fa48("3268"), 'floating')))) || (stryMutAct_9fa48("3270") ? variant !== 'inset' : stryMutAct_9fa48("3269") ? false : (stryCov_9fa48("3269", "3270"), variant === (stryMutAct_9fa48("3271") ? "" : (stryCov_9fa48("3271"), 'inset')))))) ? stryMutAct_9fa48("3272") ? "" : (stryCov_9fa48("3272"), 'group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]') : stryMutAct_9fa48("3273") ? "" : (stryCov_9fa48("3273"), 'group-data-[collapsible=icon]:w-(--sidebar-width-icon)'))} />
      <div data-slot="sidebar-container" className={cn(stryMutAct_9fa48("3274") ? "" : (stryCov_9fa48("3274"), 'fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-400 ease-[cubic-bezier(0.75,0,0.25,1)] md:flex'), (stryMutAct_9fa48("3277") ? side !== 'left' : stryMutAct_9fa48("3276") ? false : stryMutAct_9fa48("3275") ? true : (stryCov_9fa48("3275", "3276", "3277"), side === (stryMutAct_9fa48("3278") ? "" : (stryCov_9fa48("3278"), 'left')))) ? stryMutAct_9fa48("3279") ? "" : (stryCov_9fa48("3279"), 'left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]') : stryMutAct_9fa48("3280") ? "" : (stryCov_9fa48("3280"), 'right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]'),
      // Adjust the padding for floating and inset variants.
      (stryMutAct_9fa48("3283") ? variant === 'floating' && variant === 'inset' : stryMutAct_9fa48("3282") ? false : stryMutAct_9fa48("3281") ? true : (stryCov_9fa48("3281", "3282", "3283"), (stryMutAct_9fa48("3285") ? variant !== 'floating' : stryMutAct_9fa48("3284") ? false : (stryCov_9fa48("3284", "3285"), variant === (stryMutAct_9fa48("3286") ? "" : (stryCov_9fa48("3286"), 'floating')))) || (stryMutAct_9fa48("3288") ? variant !== 'inset' : stryMutAct_9fa48("3287") ? false : (stryCov_9fa48("3287", "3288"), variant === (stryMutAct_9fa48("3289") ? "" : (stryCov_9fa48("3289"), 'inset')))))) ? stryMutAct_9fa48("3290") ? "" : (stryCov_9fa48("3290"), 'p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]') : stryMutAct_9fa48("3291") ? "" : (stryCov_9fa48("3291"), 'group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l'), className)} {...props}>
        <Highlight containerClassName={cn(stryMutAct_9fa48("3292") ? "" : (stryCov_9fa48("3292"), 'size-full'), containerClassName)} enabled={animateOnHover} hover controlledItems mode="parent" forceUpdateBounds transition={transition}>
          <div data-sidebar="sidebar" data-slot="sidebar-inner" className="bg-sidebar group-data-[variant=floating]:border-sidebar-border flex h-full w-full flex-col group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:shadow-sm">
            {children}
          </div>
        </Highlight>
      </div>
    </div>;
  }
}
function SidebarTrigger({
  className,
  onClick,
  ...props
}) {
  if (stryMutAct_9fa48("3293")) {
    {}
  } else {
    stryCov_9fa48("3293");
    const {
      toggleSidebar
    } = useSidebar();
    return <Button data-sidebar="trigger" data-slot="sidebar-trigger" variant="ghost" size="icon" className={cn(stryMutAct_9fa48("3294") ? "" : (stryCov_9fa48("3294"), 'size-7'), className)} onClick={event => {
      if (stryMutAct_9fa48("3295")) {
        {}
      } else {
        stryCov_9fa48("3295");
        stryMutAct_9fa48("3296") ? onClick(event) : (stryCov_9fa48("3296"), onClick?.(event));
        toggleSidebar();
      }
    }} {...props}>
      <PanelLeftIcon />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>;
  }
}
function SidebarRail({
  className,
  ...props
}) {
  if (stryMutAct_9fa48("3297")) {
    {}
  } else {
    stryCov_9fa48("3297");
    const {
      toggleSidebar
    } = useSidebar();
    return <button data-sidebar="rail" data-slot="sidebar-rail" aria-label="Toggle Sidebar" tabIndex={stryMutAct_9fa48("3298") ? +1 : (stryCov_9fa48("3298"), -1)} onClick={toggleSidebar} title="Toggle Sidebar" className={cn(stryMutAct_9fa48("3299") ? "" : (stryCov_9fa48("3299"), 'hover:after:bg-sidebar-border absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear group-data-[side=left]:-right-4 group-data-[side=right]:left-0 after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] sm:flex'), stryMutAct_9fa48("3300") ? "" : (stryCov_9fa48("3300"), 'in-data-[side=left]:cursor-w-resize in-data-[side=right]:cursor-e-resize'), stryMutAct_9fa48("3301") ? "" : (stryCov_9fa48("3301"), '[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize'), stryMutAct_9fa48("3302") ? "" : (stryCov_9fa48("3302"), 'hover:group-data-[collapsible=offcanvas]:bg-sidebar group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full'), stryMutAct_9fa48("3303") ? "" : (stryCov_9fa48("3303"), '[[data-side=left][data-collapsible=offcanvas]_&]:-right-2'), stryMutAct_9fa48("3304") ? "" : (stryCov_9fa48("3304"), '[[data-side=right][data-collapsible=offcanvas]_&]:-left-2'), className)} {...props} />;
  }
}
function SidebarInset({
  className,
  ...props
}) {
  if (stryMutAct_9fa48("3305")) {
    {}
  } else {
    stryCov_9fa48("3305");
    return <main data-slot="sidebar-inset" className={cn(stryMutAct_9fa48("3306") ? "" : (stryCov_9fa48("3306"), 'bg-background relative flex w-full flex-1 flex-col'), stryMutAct_9fa48("3307") ? "" : (stryCov_9fa48("3307"), 'md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2'), className)} {...props} />;
  }
}
function SidebarInput({
  className,
  ...props
}) {
  if (stryMutAct_9fa48("3308")) {
    {}
  } else {
    stryCov_9fa48("3308");
    return <Input data-slot="sidebar-input" data-sidebar="input" className={cn(stryMutAct_9fa48("3309") ? "" : (stryCov_9fa48("3309"), 'bg-background h-8 w-full shadow-none'), className)} {...props} />;
  }
}
function SidebarHeader({
  className,
  ...props
}) {
  if (stryMutAct_9fa48("3310")) {
    {}
  } else {
    stryCov_9fa48("3310");
    return <div data-slot="sidebar-header" data-sidebar="header" className={cn(stryMutAct_9fa48("3311") ? "" : (stryCov_9fa48("3311"), 'flex flex-col gap-2 p-2'), className)} {...props} />;
  }
}
function SidebarFooter({
  className,
  ...props
}) {
  if (stryMutAct_9fa48("3312")) {
    {}
  } else {
    stryCov_9fa48("3312");
    return <div data-slot="sidebar-footer" data-sidebar="footer" className={cn(stryMutAct_9fa48("3313") ? "" : (stryCov_9fa48("3313"), 'flex flex-col gap-2 p-2'), className)} {...props} />;
  }
}
function SidebarSeparator({
  className,
  ...props
}) {
  if (stryMutAct_9fa48("3314")) {
    {}
  } else {
    stryCov_9fa48("3314");
    return <Separator data-slot="sidebar-separator" data-sidebar="separator" className={cn(stryMutAct_9fa48("3315") ? "" : (stryCov_9fa48("3315"), 'bg-sidebar-border mx-2 w-auto'), className)} {...props} />;
  }
}
function SidebarContent({
  className,
  ...props
}) {
  if (stryMutAct_9fa48("3316")) {
    {}
  } else {
    stryCov_9fa48("3316");
    return <div data-slot="sidebar-content" data-sidebar="content" className={cn(stryMutAct_9fa48("3317") ? "" : (stryCov_9fa48("3317"), 'flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden'), className)} {...props} />;
  }
}
function SidebarGroup({
  className,
  ...props
}) {
  if (stryMutAct_9fa48("3318")) {
    {}
  } else {
    stryCov_9fa48("3318");
    return <div data-slot="sidebar-group" data-sidebar="group" className={cn(stryMutAct_9fa48("3319") ? "" : (stryCov_9fa48("3319"), 'relative flex w-full min-w-0 flex-col p-2'), className)} {...props} />;
  }
}
function SidebarGroupLabel({
  className,
  asChild = stryMutAct_9fa48("3320") ? true : (stryCov_9fa48("3320"), false),
  ...props
}) {
  if (stryMutAct_9fa48("3321")) {
    {}
  } else {
    stryCov_9fa48("3321");
    const Comp = asChild ? Slot.Root : stryMutAct_9fa48("3322") ? "" : (stryCov_9fa48("3322"), 'div');
    return <Comp data-slot="sidebar-group-label" data-sidebar="group-label" className={cn(stryMutAct_9fa48("3323") ? "" : (stryCov_9fa48("3323"), 'text-sidebar-foreground/70 ring-sidebar-ring flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium outline-hidden transition-[margin,opacity] duration-300 ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0'), stryMutAct_9fa48("3324") ? "" : (stryCov_9fa48("3324"), 'group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0'), className)} {...props} />;
  }
}
function SidebarGroupAction({
  className,
  asChild = stryMutAct_9fa48("3325") ? true : (stryCov_9fa48("3325"), false),
  ...props
}) {
  if (stryMutAct_9fa48("3326")) {
    {}
  } else {
    stryCov_9fa48("3326");
    const Comp = asChild ? Slot.Root : stryMutAct_9fa48("3327") ? "" : (stryCov_9fa48("3327"), 'button');
    return <Comp data-slot="sidebar-group-action" data-sidebar="group-action" className={cn(stryMutAct_9fa48("3328") ? "" : (stryCov_9fa48("3328"), 'text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground absolute top-3.5 right-3 flex aspect-square w-5 items-center justify-center rounded-md p-0 outline-hidden transition-transform focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0'), // Increases the hit area of the button on mobile.
    stryMutAct_9fa48("3329") ? "" : (stryCov_9fa48("3329"), 'after:absolute after:-inset-2 md:after:hidden'), stryMutAct_9fa48("3330") ? "" : (stryCov_9fa48("3330"), 'group-data-[collapsible=icon]:hidden'), className)} {...props} />;
  }
}
function SidebarGroupContent({
  className,
  ...props
}) {
  if (stryMutAct_9fa48("3331")) {
    {}
  } else {
    stryCov_9fa48("3331");
    return <div data-slot="sidebar-group-content" data-sidebar="group-content" className={cn(stryMutAct_9fa48("3332") ? "" : (stryCov_9fa48("3332"), 'w-full text-sm'), className)} {...props} />;
  }
}
function SidebarMenu({
  className,
  ...props
}) {
  if (stryMutAct_9fa48("3333")) {
    {}
  } else {
    stryCov_9fa48("3333");
    return <ul data-slot="sidebar-menu" data-sidebar="menu" className={cn(stryMutAct_9fa48("3334") ? "" : (stryCov_9fa48("3334"), 'flex w-full min-w-0 flex-col gap-1'), className)} {...props} />;
  }
}
function SidebarMenuItem({
  className,
  ...props
}) {
  if (stryMutAct_9fa48("3335")) {
    {}
  } else {
    stryCov_9fa48("3335");
    return <li data-slot="sidebar-menu-item" data-sidebar="menu-item" className={cn(stryMutAct_9fa48("3336") ? "" : (stryCov_9fa48("3336"), 'group/menu-item relative'), className)} {...props} />;
  }
}
const sidebarMenuButtonActiveVariants = cva(stryMutAct_9fa48("3337") ? "" : (stryCov_9fa48("3337"), 'bg-sidebar-accent text-sidebar-accent-foreground rounded-md'), stryMutAct_9fa48("3338") ? {} : (stryCov_9fa48("3338"), {
  variants: stryMutAct_9fa48("3339") ? {} : (stryCov_9fa48("3339"), {
    variant: stryMutAct_9fa48("3340") ? {} : (stryCov_9fa48("3340"), {
      default: stryMutAct_9fa48("3341") ? "" : (stryCov_9fa48("3341"), 'bg-sidebar-accent text-sidebar-accent-foreground'),
      outline: stryMutAct_9fa48("3342") ? "" : (stryCov_9fa48("3342"), 'bg-sidebar-accent text-sidebar-accent-foreground shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]')
    })
  }),
  defaultVariants: stryMutAct_9fa48("3343") ? {} : (stryCov_9fa48("3343"), {
    variant: stryMutAct_9fa48("3344") ? "" : (stryCov_9fa48("3344"), 'default')
  })
}));
const sidebarMenuButtonVariants = cva(stryMutAct_9fa48("3345") ? "" : (stryCov_9fa48("3345"), 'peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-hidden ring-sidebar-ring transition-[width,height,padding] [&:not([data-highlight])]:hover:bg-sidebar-accent [&:not([data-highlight])]:hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-data-[sidebar=menu-action]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground [&:not([data-highlight])]:data-[state=open]:hover:bg-sidebar-accent [&:not([data-highlight])]:data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0'), stryMutAct_9fa48("3346") ? {} : (stryCov_9fa48("3346"), {
  variants: stryMutAct_9fa48("3347") ? {} : (stryCov_9fa48("3347"), {
    variant: stryMutAct_9fa48("3348") ? {} : (stryCov_9fa48("3348"), {
      default: stryMutAct_9fa48("3349") ? "" : (stryCov_9fa48("3349"), '[&:not([data-highlight])]:hover:bg-sidebar-accent [&:not([data-highlight])]:hover:text-sidebar-accent-foreground'),
      outline: stryMutAct_9fa48("3350") ? "" : (stryCov_9fa48("3350"), 'bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] [&:not([data-highlight])]:hover:bg-sidebar-accent [&:not([data-highlight])]:hover:text-sidebar-accent-foreground [&:not([data-highlight])]:hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]')
    }),
    size: stryMutAct_9fa48("3351") ? {} : (stryCov_9fa48("3351"), {
      default: stryMutAct_9fa48("3352") ? "" : (stryCov_9fa48("3352"), 'h-8 text-sm'),
      sm: stryMutAct_9fa48("3353") ? "" : (stryCov_9fa48("3353"), 'h-7 text-xs'),
      lg: stryMutAct_9fa48("3354") ? "" : (stryCov_9fa48("3354"), 'h-12 text-sm group-data-[collapsible=icon]:p-0!')
    })
  }),
  defaultVariants: stryMutAct_9fa48("3355") ? {} : (stryCov_9fa48("3355"), {
    variant: stryMutAct_9fa48("3356") ? "" : (stryCov_9fa48("3356"), 'default'),
    size: stryMutAct_9fa48("3357") ? "" : (stryCov_9fa48("3357"), 'default')
  })
}));
function SidebarMenuButton({
  asChild = stryMutAct_9fa48("3358") ? true : (stryCov_9fa48("3358"), false),
  isActive = stryMutAct_9fa48("3359") ? true : (stryCov_9fa48("3359"), false),
  variant = stryMutAct_9fa48("3360") ? "" : (stryCov_9fa48("3360"), 'default'),
  size = stryMutAct_9fa48("3361") ? "" : (stryCov_9fa48("3361"), 'default'),
  tooltip,
  className,
  ...props
}) {
  if (stryMutAct_9fa48("3362")) {
    {}
  } else {
    stryCov_9fa48("3362");
    const Comp = asChild ? Slot.Root : stryMutAct_9fa48("3363") ? "" : (stryCov_9fa48("3363"), 'button');
    const {
      isMobile,
      state
    } = useSidebar();
    const button = <HighlightItem activeClassName={sidebarMenuButtonActiveVariants(stryMutAct_9fa48("3364") ? {} : (stryCov_9fa48("3364"), {
      variant
    }))}>
      <Comp data-slot="sidebar-menu-button" data-sidebar="menu-button" data-size={size} data-active={isActive} className={cn(sidebarMenuButtonVariants(stryMutAct_9fa48("3365") ? {} : (stryCov_9fa48("3365"), {
        variant,
        size
      })), className)} {...props} />
    </HighlightItem>;
    if (stryMutAct_9fa48("3368") ? false : stryMutAct_9fa48("3367") ? true : stryMutAct_9fa48("3366") ? tooltip : (stryCov_9fa48("3366", "3367", "3368"), !tooltip)) {
      if (stryMutAct_9fa48("3369")) {
        {}
      } else {
        stryCov_9fa48("3369");
        return button;
      }
    }
    if (stryMutAct_9fa48("3372") ? typeof tooltip !== 'string' : stryMutAct_9fa48("3371") ? false : stryMutAct_9fa48("3370") ? true : (stryCov_9fa48("3370", "3371", "3372"), typeof tooltip === (stryMutAct_9fa48("3373") ? "" : (stryCov_9fa48("3373"), 'string')))) {
      if (stryMutAct_9fa48("3374")) {
        {}
      } else {
        stryCov_9fa48("3374");
        tooltip = stryMutAct_9fa48("3375") ? {} : (stryCov_9fa48("3375"), {
          children: tooltip
        });
      }
    }
    return <Tooltip side="right" align="center">
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent hidden={stryMutAct_9fa48("3378") ? state !== 'collapsed' && isMobile : stryMutAct_9fa48("3377") ? false : stryMutAct_9fa48("3376") ? true : (stryCov_9fa48("3376", "3377", "3378"), (stryMutAct_9fa48("3380") ? state === 'collapsed' : stryMutAct_9fa48("3379") ? false : (stryCov_9fa48("3379", "3380"), state !== (stryMutAct_9fa48("3381") ? "" : (stryCov_9fa48("3381"), 'collapsed')))) || isMobile)} {...tooltip} />
    </Tooltip>;
  }
}
function SidebarMenuAction({
  className,
  asChild = stryMutAct_9fa48("3382") ? true : (stryCov_9fa48("3382"), false),
  showOnHover = stryMutAct_9fa48("3383") ? true : (stryCov_9fa48("3383"), false),
  ...props
}) {
  if (stryMutAct_9fa48("3384")) {
    {}
  } else {
    stryCov_9fa48("3384");
    const Comp = asChild ? Slot.Root : stryMutAct_9fa48("3385") ? "" : (stryCov_9fa48("3385"), 'button');
    return <Comp data-slot="sidebar-menu-action" data-sidebar="menu-action" className={cn(// Increases the hit area of the button on mobile.
    stryMutAct_9fa48("3386") ? "" : (stryCov_9fa48("3386"), 'z-[1] text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground peer-hover/menu-button:text-sidebar-accent-foreground absolute top-1.5 right-1 flex aspect-square w-5 items-center justify-center rounded-md p-0 outline-hidden transition-transform focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0'), stryMutAct_9fa48("3387") ? "" : (stryCov_9fa48("3387"), 'after:absolute after:-inset-2 md:after:hidden'), stryMutAct_9fa48("3388") ? "" : (stryCov_9fa48("3388"), 'peer-data-[size=sm]/menu-button:top-1'), stryMutAct_9fa48("3389") ? "" : (stryCov_9fa48("3389"), 'peer-data-[size=default]/menu-button:top-1.5'), stryMutAct_9fa48("3390") ? "" : (stryCov_9fa48("3390"), 'peer-data-[size=lg]/menu-button:top-2.5'), stryMutAct_9fa48("3391") ? "" : (stryCov_9fa48("3391"), 'group-data-[collapsible=icon]:hidden'), stryMutAct_9fa48("3394") ? showOnHover || 'peer-data-[active=true]/menu-button:text-sidebar-accent-foreground group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 md:opacity-0' : stryMutAct_9fa48("3393") ? false : stryMutAct_9fa48("3392") ? true : (stryCov_9fa48("3392", "3393", "3394"), showOnHover && (stryMutAct_9fa48("3395") ? "" : (stryCov_9fa48("3395"), 'peer-data-[active=true]/menu-button:text-sidebar-accent-foreground group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 md:opacity-0'))), className)} {...props} />;
  }
}
function SidebarMenuBadge({
  className,
  ...props
}) {
  if (stryMutAct_9fa48("3396")) {
    {}
  } else {
    stryCov_9fa48("3396");
    return <div data-slot="sidebar-menu-badge" data-sidebar="menu-badge" className={cn(stryMutAct_9fa48("3397") ? "" : (stryCov_9fa48("3397"), 'text-sidebar-foreground pointer-events-none absolute right-1 flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums select-none'), stryMutAct_9fa48("3398") ? "" : (stryCov_9fa48("3398"), 'peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground'), stryMutAct_9fa48("3399") ? "" : (stryCov_9fa48("3399"), 'peer-data-[size=sm]/menu-button:top-1'), stryMutAct_9fa48("3400") ? "" : (stryCov_9fa48("3400"), 'peer-data-[size=default]/menu-button:top-1.5'), stryMutAct_9fa48("3401") ? "" : (stryCov_9fa48("3401"), 'peer-data-[size=lg]/menu-button:top-2.5'), stryMutAct_9fa48("3402") ? "" : (stryCov_9fa48("3402"), 'group-data-[collapsible=icon]:hidden'), className)} {...props} />;
  }
}
function SidebarMenuSkeleton({
  className,
  showIcon = stryMutAct_9fa48("3403") ? true : (stryCov_9fa48("3403"), false),
  ...props
}) {
  if (stryMutAct_9fa48("3404")) {
    {}
  } else {
    stryCov_9fa48("3404");
    // Random width between 50 to 90%.
    const width = React.useMemo(() => {
      if (stryMutAct_9fa48("3405")) {
        {}
      } else {
        stryCov_9fa48("3405");
        return stryMutAct_9fa48("3406") ? `` : (stryCov_9fa48("3406"), `${stryMutAct_9fa48("3407") ? Math.floor(Math.random() * 40) - 50 : (stryCov_9fa48("3407"), Math.floor(stryMutAct_9fa48("3408") ? Math.random() / 40 : (stryCov_9fa48("3408"), Math.random() * 40)) + 50)}%`);
      }
    }, stryMutAct_9fa48("3409") ? ["Stryker was here"] : (stryCov_9fa48("3409"), []));
    return <div data-slot="sidebar-menu-skeleton" data-sidebar="menu-skeleton" className={cn(stryMutAct_9fa48("3410") ? "" : (stryCov_9fa48("3410"), 'flex h-8 items-center gap-2 rounded-md px-2'), className)} {...props}>
      {stryMutAct_9fa48("3413") ? showIcon || <Skeleton className="size-4 rounded-md" data-sidebar="menu-skeleton-icon" /> : stryMutAct_9fa48("3412") ? false : stryMutAct_9fa48("3411") ? true : (stryCov_9fa48("3411", "3412", "3413"), showIcon && <Skeleton className="size-4 rounded-md" data-sidebar="menu-skeleton-icon" />)}
      <Skeleton className="h-4 max-w-(--skeleton-width) flex-1" data-sidebar="menu-skeleton-text" style={stryMutAct_9fa48("3414") ? {} : (stryCov_9fa48("3414"), {
        '--skeleton-width': width
      })} />
    </div>;
  }
}
function SidebarMenuSub({
  className,
  ...props
}) {
  if (stryMutAct_9fa48("3415")) {
    {}
  } else {
    stryCov_9fa48("3415");
    return <ul data-slot="sidebar-menu-sub" data-sidebar="menu-sub" className={cn(stryMutAct_9fa48("3416") ? "" : (stryCov_9fa48("3416"), 'border-sidebar-border mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l px-2.5 py-0.5'), stryMutAct_9fa48("3417") ? "" : (stryCov_9fa48("3417"), 'group-data-[collapsible=icon]:hidden'), className)} {...props} />;
  }
}
function SidebarMenuSubItem({
  className,
  ...props
}) {
  if (stryMutAct_9fa48("3418")) {
    {}
  } else {
    stryCov_9fa48("3418");
    return <li data-slot="sidebar-menu-sub-item" data-sidebar="menu-sub-item" className={cn(stryMutAct_9fa48("3419") ? "" : (stryCov_9fa48("3419"), 'group/menu-sub-item relative'), className)} {...props} />;
  }
}
function SidebarMenuSubButton({
  asChild = stryMutAct_9fa48("3420") ? true : (stryCov_9fa48("3420"), false),
  size = stryMutAct_9fa48("3421") ? "" : (stryCov_9fa48("3421"), 'md'),
  isActive = stryMutAct_9fa48("3422") ? true : (stryCov_9fa48("3422"), false),
  className,
  ...props
}) {
  if (stryMutAct_9fa48("3423")) {
    {}
  } else {
    stryCov_9fa48("3423");
    const Comp = asChild ? Slot.Root : stryMutAct_9fa48("3424") ? "" : (stryCov_9fa48("3424"), 'a');
    return <HighlightItem activeClassName="bg-sidebar-accent text-sidebar-accent-foreground rounded-md">
      <Comp data-slot="sidebar-menu-sub-button" data-sidebar="menu-sub-button" data-size={size} data-active={isActive} className={cn(stryMutAct_9fa48("3425") ? "" : (stryCov_9fa48("3425"), 'text-sidebar-foreground ring-sidebar-ring [&:not([data-highlight])]:hover:bg-sidebar-accent [&:not([data-highlight])]:hover:text-sidebar-accent-foreground active:bg-sidebar-accent active:text-sidebar-accent-foreground [&>svg]:text-sidebar-accent-foreground flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 outline-hidden focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0'), stryMutAct_9fa48("3426") ? "" : (stryCov_9fa48("3426"), 'data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground'), stryMutAct_9fa48("3429") ? size === 'sm' || 'text-xs' : stryMutAct_9fa48("3428") ? false : stryMutAct_9fa48("3427") ? true : (stryCov_9fa48("3427", "3428", "3429"), (stryMutAct_9fa48("3431") ? size !== 'sm' : stryMutAct_9fa48("3430") ? true : (stryCov_9fa48("3430", "3431"), size === (stryMutAct_9fa48("3432") ? "" : (stryCov_9fa48("3432"), 'sm')))) && (stryMutAct_9fa48("3433") ? "" : (stryCov_9fa48("3433"), 'text-xs'))), stryMutAct_9fa48("3436") ? size === 'md' || 'text-sm' : stryMutAct_9fa48("3435") ? false : stryMutAct_9fa48("3434") ? true : (stryCov_9fa48("3434", "3435", "3436"), (stryMutAct_9fa48("3438") ? size !== 'md' : stryMutAct_9fa48("3437") ? true : (stryCov_9fa48("3437", "3438"), size === (stryMutAct_9fa48("3439") ? "" : (stryCov_9fa48("3439"), 'md')))) && (stryMutAct_9fa48("3440") ? "" : (stryCov_9fa48("3440"), 'text-sm'))), stryMutAct_9fa48("3441") ? "" : (stryCov_9fa48("3441"), 'group-data-[collapsible=icon]:hidden'), className)} {...props} />
    </HighlightItem>;
  }
}
export { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupAction, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarInput, SidebarInset, SidebarMenu, SidebarMenuAction, SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem, SidebarMenuSkeleton, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, SidebarProvider, SidebarRail, SidebarSeparator, SidebarTrigger, useSidebar };