import type { ElementType } from "react";
import type { PopoverArrowOptions } from "../popover/popover-arrow.tsx";
import type { Props } from "../utils/types.ts";
import type { TooltipStore } from "./tooltip-store.ts";
declare const TagName = "div";
type TagName = typeof TagName;
/**
 * Returns props to create a `TooltipArrow` component.
 * @see https://ariakit.org/components/tooltip
 * @example
 * ```jsx
 * const store = useToolTipStore();
 * const props = useTooltipArrow({ store });
 * <TooltipAnchor store={store}>Anchor</TooltipAnchor>
 * <Tooltip store={store}>
 *   <Role {...props} />
 *   Tooltip
 * </Tooltip>
 * ```
 */
export declare const useTooltipArrow: import("../utils/types.ts").Hook<"div", TooltipArrowOptions<"div">>;
/**
 * Renders an arrow inside a [`Tooltip`](https://ariakit.org/reference/tooltip)
 * pointing to the anchor element.
 * @see https://ariakit.org/components/tooltip
 * @example
 * ```jsx {4}
 * <TooltipProvider>
 *   <TooltipAnchor>Anchor</TooltipAnchor>
 *   <Tooltip>
 *     <TooltipArrow />
 *     Tooltip
 *   </Tooltip>
 * </TooltipProvider>
 * ```
 */
export declare const TooltipArrow: (props: TooltipArrowProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export interface TooltipArrowOptions<T extends ElementType = TagName> extends PopoverArrowOptions<T> {
    /**
     * Object returned by the
     * [`useTooltipStore`](https://ariakit.org/reference/use-tooltip-store) hook.
     * If not provided, the closest
     * [`Tooltip`](https://ariakit.org/reference/tooltip) or
     * [`TooltipProvider`](https://ariakit.org/reference/tooltip-provider)
     * components' context will be used.
     */
    store?: TooltipStore;
}
export type TooltipArrowProps<T extends ElementType = TagName> = Props<T, TooltipArrowOptions<T>>;
export {};
