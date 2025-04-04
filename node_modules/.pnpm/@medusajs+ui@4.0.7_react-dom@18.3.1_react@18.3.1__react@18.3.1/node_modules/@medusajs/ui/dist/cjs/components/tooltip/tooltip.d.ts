import { Tooltip as RadixTooltip } from "radix-ui";
import * as React from "react";
interface TooltipProps extends Omit<RadixTooltip.TooltipContentProps, "content" | "onClick">, Pick<RadixTooltip.TooltipProps, "open" | "defaultOpen" | "onOpenChange" | "delayDuration"> {
    content: React.ReactNode;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    side?: "bottom" | "left" | "top" | "right";
    maxWidth?: number;
}
/**
 * This component is based on the [Radix UI Tooltip](https://www.radix-ui.com/primitives/docs/components/tooltip) primitive.
 *
 * @excludeExternal
 */
declare const Tooltip: ({ children, content, open, defaultOpen, onOpenChange, delayDuration, maxWidth, className, side, sideOffset, onClick, ...props }: TooltipProps) => React.JSX.Element;
interface TooltipProviderProps extends RadixTooltip.TooltipProviderProps {
}
declare const TooltipProvider: ({ children, delayDuration, skipDelayDuration, ...props }: TooltipProviderProps) => React.JSX.Element;
export { Tooltip, TooltipProvider };
//# sourceMappingURL=tooltip.d.ts.map