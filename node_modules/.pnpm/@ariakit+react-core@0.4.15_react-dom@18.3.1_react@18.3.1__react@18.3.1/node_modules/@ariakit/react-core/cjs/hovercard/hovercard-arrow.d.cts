import type { ElementType } from "react";
import type { PopoverArrowOptions } from "../popover/popover-arrow.tsx";
import type { Props } from "../utils/types.ts";
import type { HovercardStore } from "./hovercard-store.ts";
declare const TagName = "div";
type TagName = typeof TagName;
/**
 * Returns props to create a `HovercardArrow` component.
 * @see https://ariakit.org/components/hovercard
 * @example
 * ```jsx
 * const store = useHovercardStore();
 * const props = useHovercardArrow({ store });
 * <Hovercard store={store}>
 *   <Role {...props} />
 *   Details
 * </Hovercard>
 * ```
 */
export declare const useHovercardArrow: import("../utils/types.ts").Hook<"div", HovercardArrowOptions<"div">>;
/**
 * Renders an arrow element inside a
 * [`Hovercard`](https://ariakit.org/reference/hovercard) component that points
 * to the anchor element.
 * @see https://ariakit.org/components/hovercard
 * @example
 * ```jsx {4}
 * <HovercardProvider>
 *   <HovercardAnchor>@username</HovercardAnchor>
 *   <Hovercard>
 *     <HovercardArrow />
 *     Details
 *   </Hovercard>
 * </HovercardProvider>
 * ```
 */
export declare const HovercardArrow: (props: HovercardArrowProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export interface HovercardArrowOptions<T extends ElementType = TagName> extends PopoverArrowOptions<T> {
    /**
     * Object returned by the
     * [`useHovercardStore`](https://ariakit.org/reference/use-hovercard-store)
     * hook. If not provided, the closest
     * [`Hovercard`](https://ariakit.org/reference/hovercard) or
     * [`HovercardProvider`](https://ariakit.org/reference/hovercard-provider)
     * components' context will be used.
     */
    store?: HovercardStore;
}
export type HovercardArrowProps<T extends ElementType = TagName> = Props<T, HovercardArrowOptions<T>>;
export {};
