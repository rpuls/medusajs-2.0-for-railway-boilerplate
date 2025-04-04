"use client";
import { Tabs as RadixTabs } from "radix-ui";
import * as React from "react";
import { clx } from "../../utils/clx";
/**
 * This component is based on the [Radix UI Tabs](https://radix-ui.com/primitives/docs/components/tabs) primitves
 */
const TabsRoot = (props) => {
    return React.createElement(RadixTabs.Root, { ...props });
};
TabsRoot.displayName = "Tabs";
const TabsTrigger = React.forwardRef(({ className, children, ...props }, ref) => (React.createElement(RadixTabs.Trigger, { ref: ref, className: clx("txt-compact-small-plus transition-fg text-ui-fg-subtle inline-flex items-center justify-center rounded-full border border-transparent bg-transparent px-2.5 py-1 outline-none", "hover:text-ui-fg-base", "focus-visible:border-ui-border-interactive focus-visible:!shadow-borders-focus focus-visible:bg-ui-bg-base", "data-[state=active]:text-ui-fg-base data-[state=active]:bg-ui-bg-base data-[state=active]:shadow-elevation-card-rest", className), ...props }, children)));
TabsTrigger.displayName = "Tabs.Trigger";
const TabsList = React.forwardRef(({ className, ...props }, ref) => (React.createElement(RadixTabs.List, { ref: ref, className: clx("flex items-center gap-2", className), ...props })));
TabsList.displayName = "Tabs.List";
const TabsContent = React.forwardRef(({ className, ...props }, ref) => (React.createElement(RadixTabs.Content, { ref: ref, className: clx("outline-none", className), ...props })));
TabsContent.displayName = "Tabs.Content";
const Tabs = Object.assign(TabsRoot, {
    Trigger: TabsTrigger,
    List: TabsList,
    Content: TabsContent,
});
export { Tabs };
//# sourceMappingURL=tabs.js.map