import * as React from 'react';

import {
  Tabs as TabsPrimitive,
  TabsList as TabsListPrimitive,
  TabsTrigger as TabsTriggerPrimitive,
  TabsContent as TabsContentPrimitive,
  TabsContents as TabsContentsPrimitive,
  TabsHighlight as TabsHighlightPrimitive,
  TabsHighlightItem as TabsHighlightItemPrimitive,
} from '../../primitives/radix/tabs';
import { cn } from '../../../../lib/utils';

function Tabs({
  className,
  ...props
}) {
  return (<TabsPrimitive className={cn('flex flex-col gap-2', className)} {...props} />);
}

function TabsList({
  className,
  ...props
}) {
  return (
    <TabsHighlightPrimitive
      className="absolute z-0 inset-0 border-transparent bg-transparent shadow-none">
      <TabsListPrimitive
        className={cn(
          'bg-transparent inline-flex h-9 w-fit items-center justify-center p-0',
          className
        )}
        {...props} />
    </TabsHighlightPrimitive>
  );
}

function TabsTrigger({
  className,
  ...props
}) {
  return (
    <TabsHighlightItemPrimitive value={props.value} className="flex-1">
      <TabsTriggerPrimitive
        className={cn(
          "inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 w-full px-2 py-1 text-sm font-medium whitespace-nowrap transition-colors duration-500 ease-in-out disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
          className
        )}
        {...props} />
    </TabsHighlightItemPrimitive>
  );
}

function TabsContents(props) {
  return <TabsContentsPrimitive {...props} />;
}

function TabsContent({
  className,
  ...props
}) {
  return (<TabsContentPrimitive className={cn('flex-1 outline-none', className)} {...props} />);
}

export { Tabs, TabsList, TabsTrigger, TabsContents, TabsContent };
