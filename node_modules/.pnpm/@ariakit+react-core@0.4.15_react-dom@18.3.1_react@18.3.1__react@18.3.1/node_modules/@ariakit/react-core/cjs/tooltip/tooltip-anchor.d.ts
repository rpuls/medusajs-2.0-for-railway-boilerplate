import type { ElementType } from "react";
import type { HovercardAnchorOptions } from "../hovercard/hovercard-anchor.tsx";
import type { Props } from "../utils/types.ts";
import type { TooltipStore } from "./tooltip-store.ts";
declare const TagName = "div";
type TagName = typeof TagName;
/**
 * Returns props to create a `TooltipAnchor` component.
 * @see https://ariakit.org/components/tooltip
 * @example
 * ```jsx
 * const store = useToolTipStore();
 * const props = useTooltipAnchor({ store });
 * <Role {...props}>Anchor</Role>
 * <Tooltip store={store}>Tooltip</Tooltip>
 * ```
 */
export declare const useTooltipAnchor: import("../utils/types.ts").Hook<"div", TooltipAnchorOptions<"div">>;
/**
 * Renders a reference element for a
 * [`Tooltip`](https://ariakit.org/reference/tooltip), which is triggered by
 * focusing or hovering over the anchor.
 *
 * The tooltip is strictly for visual purposes. It's your responsibility to
 * ensure the anchor element has an accessible name. See [Tooltip anchors must
 * have accessible
 * names](https://ariakit.org/components/tooltip#tooltip-anchors-must-have-accessible-names)
 * @see https://ariakit.org/components/tooltip
 * @example
 * ```jsx {2}
 * <TooltipProvider>
 *   <TooltipAnchor>Anchor</TooltipAnchor>
 *   <Tooltip>Tooltip</Tooltip>
 * </TooltipProvider>
 * ```
 */
export declare const TooltipAnchor: (props: TooltipAnchorProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export interface TooltipAnchorOptions<T extends ElementType = TagName> extends HovercardAnchorOptions<T> {
    /**
     * Object returned by the
     * [`useTooltipStore`](https://ariakit.org/reference/use-tooltip-store) hook.
     * If not provided, the closest
     * [`TooltipProvider`](https://ariakit.org/reference/tooltip-provider)
     * component's context will be used.
     */
    store?: TooltipStore;
}
export type TooltipAnchorProps<T extends ElementType = TagName> = Props<T, TooltipAnchorOptions<T>>;
export {};
