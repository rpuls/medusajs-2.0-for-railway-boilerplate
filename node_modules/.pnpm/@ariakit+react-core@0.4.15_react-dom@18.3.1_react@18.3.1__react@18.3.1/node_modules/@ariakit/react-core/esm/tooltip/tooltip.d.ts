import type { ElementType } from "react";
import type { HovercardOptions } from "../hovercard/hovercard.tsx";
import type { Props } from "../utils/types.ts";
import type { TooltipStore } from "./tooltip-store.ts";
declare const TagName = "div";
type TagName = typeof TagName;
/**
 * Returns props to create a `Tooltip` component.
 * @see https://ariakit.org/components/tooltip
 * @example
 * ```jsx
 * const store = useToolTipStore();
 * const props = useTooltip({ store });
 * <TooltipAnchor store={store}>Anchor</TooltipAnchor>
 * <Role {...props}>Tooltip</Role>
 * ```
 */
export declare const useTooltip: import("../utils/types.ts").Hook<"div", TooltipOptions<"div">>;
/**
 * Renders a tooltip element that visually describes a
 * [`TooltipAnchor`](https://ariakit.org/reference/tooltip-anchor) when it
 * receives focus or is hovered.
 *
 * The tooltip is strictly for visual purposes. It's your responsibility to
 * ensure the anchor element has an accessible name. See [Tooltip anchors must
 * have accessible
 * names](https://ariakit.org/components/tooltip#tooltip-anchors-must-have-accessible-names)
 * @see https://ariakit.org/components/tooltip
 * @example
 * ```jsx {3}
 * <TooltipProvider>
 *   <TooltipAnchor>Anchor</TooltipAnchor>
 *   <Tooltip>Tooltip</Tooltip>
 * </TooltipProvider>
 * ```
 */
export declare const Tooltip: (props: TooltipProps<"div">) => import("react/jsx-runtime").JSX.Element | null;
export interface TooltipOptions<T extends ElementType = TagName> extends HovercardOptions<T> {
    /**
     * Object returned by the
     * [`useTooltipStore`](https://ariakit.org/reference/use-tooltip-store) hook.
     * If not provided, the closest
     * [`TooltipProvider`](https://ariakit.org/reference/tooltip-provider)
     * component's context will be used.
     */
    store?: TooltipStore;
    /**
     * @default true
     */
    portal?: HovercardOptions<T>["portal"];
    /**
     * @default 8
     */
    gutter?: HovercardOptions<T>["gutter"];
}
export type TooltipProps<T extends ElementType = TagName> = Props<T, TooltipOptions<T>>;
export {};
