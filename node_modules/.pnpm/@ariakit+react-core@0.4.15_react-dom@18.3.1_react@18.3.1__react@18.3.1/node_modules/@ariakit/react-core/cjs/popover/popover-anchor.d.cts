import type { ElementType } from "react";
import type { Options, Props } from "../utils/types.ts";
import type { PopoverStore } from "./popover-store.ts";
declare const TagName = "div";
type TagName = typeof TagName;
/**
 * Returns props to create a `PopoverAnchor` component.
 * @see https://ariakit.org/components/popover
 * @example
 * ```jsx
 * const store = usePopoverStore();
 * const props = usePopoverAnchor({ store });
 * <Role {...props}>Anchor</Role>
 * <Popover store={store}>Popover</Popover>
 * ```
 */
export declare const usePopoverAnchor: import("../utils/types.ts").Hook<"div", PopoverAnchorOptions<"div">>;
/**
 * Renders an element that acts as the anchor for the popover. The
 * [`Popover`](https://ariakit.org/reference/popover) component will be
 * positioned in relation to this element.
 * @see https://ariakit.org/components/popover
 * @example
 * ```jsx {2}
 * <PopoverProvider>
 *   <PopoverAnchor>Anchor</PopoverAnchor>
 *   <Popover>Popover</Popover>
 * </PopoverProvider>
 * ```
 */
export declare const PopoverAnchor: (props: PopoverAnchorProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export interface PopoverAnchorOptions<_T extends ElementType = TagName> extends Options {
    /**
     * Object returned by the
     * [`usePopoverStore`](https://ariakit.org/reference/use-popover-store) hook.
     * If not provided, the closest
     * [`PopoverProvider`](https://ariakit.org/reference/popover-provider)
     * component's context will be used.
     */
    store?: PopoverStore;
}
export type PopoverAnchorProps<T extends ElementType = TagName> = Props<T, PopoverAnchorOptions<T>>;
export {};
