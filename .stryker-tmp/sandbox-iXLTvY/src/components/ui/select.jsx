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
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "../../lib/utils";
const Select = SelectPrimitive.Root;
const SelectGroup = SelectPrimitive.Group;
const SelectValue = SelectPrimitive.Value;
const SelectTrigger = React.forwardRef(stryMutAct_9fa48("4212") ? () => undefined : (stryCov_9fa48("4212"), ({
  className,
  children,
  ...props
}, ref) => <SelectPrimitive.Trigger ref={ref} className={cn(stryMutAct_9fa48("4213") ? "" : (stryCov_9fa48("4213"), "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background data-[placeholder]:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1"), className)} {...props}>
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;
const SelectScrollUpButton = React.forwardRef(stryMutAct_9fa48("4214") ? () => undefined : (stryCov_9fa48("4214"), ({
  className,
  ...props
}, ref) => <SelectPrimitive.ScrollUpButton ref={ref} className={cn(stryMutAct_9fa48("4215") ? "" : (stryCov_9fa48("4215"), "flex cursor-default items-center justify-center py-1"), className)} {...props}>
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;
const SelectScrollDownButton = React.forwardRef(stryMutAct_9fa48("4216") ? () => undefined : (stryCov_9fa48("4216"), ({
  className,
  ...props
}, ref) => <SelectPrimitive.ScrollDownButton ref={ref} className={cn(stryMutAct_9fa48("4217") ? "" : (stryCov_9fa48("4217"), "flex cursor-default items-center justify-center py-1"), className)} {...props}>
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>));
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;
const SelectContent = React.forwardRef(stryMutAct_9fa48("4218") ? () => undefined : (stryCov_9fa48("4218"), ({
  className,
  children,
  position = stryMutAct_9fa48("4219") ? "" : (stryCov_9fa48("4219"), "popper"),
  ...props
}, ref) => <SelectPrimitive.Portal>
    <SelectPrimitive.Content ref={ref} className={cn(stryMutAct_9fa48("4220") ? "" : (stryCov_9fa48("4220"), "relative z-50 max-h-[--radix-select-content-available-height] min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-select-content-transform-origin]"), stryMutAct_9fa48("4223") ? position === "popper" || "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1" : stryMutAct_9fa48("4222") ? false : stryMutAct_9fa48("4221") ? true : (stryCov_9fa48("4221", "4222", "4223"), (stryMutAct_9fa48("4225") ? position !== "popper" : stryMutAct_9fa48("4224") ? true : (stryCov_9fa48("4224", "4225"), position === (stryMutAct_9fa48("4226") ? "" : (stryCov_9fa48("4226"), "popper")))) && (stryMutAct_9fa48("4227") ? "" : (stryCov_9fa48("4227"), "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1"))), className)} position={position} {...props}>
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport className={cn(stryMutAct_9fa48("4228") ? "" : (stryCov_9fa48("4228"), "p-1"), stryMutAct_9fa48("4231") ? position === "popper" || "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]" : stryMutAct_9fa48("4230") ? false : stryMutAct_9fa48("4229") ? true : (stryCov_9fa48("4229", "4230", "4231"), (stryMutAct_9fa48("4233") ? position !== "popper" : stryMutAct_9fa48("4232") ? true : (stryCov_9fa48("4232", "4233"), position === (stryMutAct_9fa48("4234") ? "" : (stryCov_9fa48("4234"), "popper")))) && (stryMutAct_9fa48("4235") ? "" : (stryCov_9fa48("4235"), "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"))))}>
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>));
SelectContent.displayName = SelectPrimitive.Content.displayName;
const SelectLabel = React.forwardRef(stryMutAct_9fa48("4236") ? () => undefined : (stryCov_9fa48("4236"), ({
  className,
  ...props
}, ref) => <SelectPrimitive.Label ref={ref} className={cn(stryMutAct_9fa48("4237") ? "" : (stryCov_9fa48("4237"), "py-1.5 pl-8 pr-2 text-sm font-semibold"), className)} {...props} />));
SelectLabel.displayName = SelectPrimitive.Label.displayName;
const SelectItem = React.forwardRef(stryMutAct_9fa48("4238") ? () => undefined : (stryCov_9fa48("4238"), ({
  className,
  children,
  ...props
}, ref) => <SelectPrimitive.Item ref={ref} className={cn(stryMutAct_9fa48("4239") ? "" : (stryCov_9fa48("4239"), "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"), className)} {...props}>
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>

    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>));
SelectItem.displayName = SelectPrimitive.Item.displayName;
const SelectSeparator = React.forwardRef(stryMutAct_9fa48("4240") ? () => undefined : (stryCov_9fa48("4240"), ({
  className,
  ...props
}, ref) => <SelectPrimitive.Separator ref={ref} className={cn(stryMutAct_9fa48("4241") ? "" : (stryCov_9fa48("4241"), "-mx-1 my-1 h-px bg-muted"), className)} {...props} />));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;
export { Select, SelectGroup, SelectValue, SelectTrigger, SelectContent, SelectLabel, SelectItem, SelectSeparator, SelectScrollUpButton, SelectScrollDownButton };