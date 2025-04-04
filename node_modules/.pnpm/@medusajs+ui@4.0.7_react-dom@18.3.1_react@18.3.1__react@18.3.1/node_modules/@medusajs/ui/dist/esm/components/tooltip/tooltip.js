"use client";
import { Tooltip as RadixTooltip } from "radix-ui";
import * as React from "react";
import { clx } from "../../utils/clx";
/**
 * This component is based on the [Radix UI Tooltip](https://www.radix-ui.com/primitives/docs/components/tooltip) primitive.
 *
 * @excludeExternal
 */
const Tooltip = ({ children, content, open, defaultOpen, onOpenChange, delayDuration, 
/**
 * The maximum width of the tooltip.
 */
maxWidth = 220, className, side, sideOffset = 8, onClick, ...props }) => {
    return (React.createElement(RadixTooltip.Root, { open: open, defaultOpen: defaultOpen, onOpenChange: onOpenChange, delayDuration: delayDuration },
        React.createElement(RadixTooltip.Trigger, { onClick: onClick, asChild: true }, children),
        React.createElement(RadixTooltip.Portal, null,
            React.createElement(RadixTooltip.Content, { side: side, sideOffset: sideOffset, align: "center", className: clx("txt-compact-xsmall text-ui-fg-subtle bg-ui-bg-base shadow-elevation-tooltip rounded-lg px-2.5 py-1", "animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2", className), ...props, style: { ...props.style, maxWidth } }, content))));
};
const TooltipProvider = ({ children, delayDuration = 100, skipDelayDuration = 300, ...props }) => {
    return (React.createElement(RadixTooltip.TooltipProvider, { delayDuration: delayDuration, skipDelayDuration: skipDelayDuration, ...props }, children));
};
export { Tooltip, TooltipProvider };
//# sourceMappingURL=tooltip.js.map