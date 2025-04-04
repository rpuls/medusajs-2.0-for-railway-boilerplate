import type { ElementType } from "react";
import type { Options, Props } from "../utils/types.ts";
import type { PopoverStore, PopoverStoreState } from "./popover-store.ts";
declare const TagName = "span";
type TagName = typeof TagName;
/**
 * Returns props to create a `PopoverDisclosureArrow` component.
 * @see https://ariakit.org/components/popover
 * @example
 * ```jsx
 * const store = usePopoverStore();
 * const props = usePopoverDisclosureArrow({ store });
 * <PopoverDisclosure store={store}>
 *   Disclosure
 *   <Role {...props} />
 * </PopoverDisclosure>
 * ```
 */
export declare const usePopoverDisclosureArrow: import("../utils/types.ts").Hook<"span", PopoverDisclosureArrowOptions<"span">>;
/**
 * Renders an arrow pointing to the popover position. It's usually rendered
 * inside the
 * [`PopoverDisclosure`](https://ariakit.org/reference/popover-disclosure)
 * component.
 * @see https://ariakit.org/components/popover
 * @example
 * ```jsx {4}
 * <PopoverProvider>
 *   <PopoverDisclosure>
 *     Disclosure
 *     <PopoverDisclosureArrow />
 *   </PopoverDisclosure>
 *   <Popover>Popover</Popover>
 * </PopoverProvider>
 * ```
 */
export declare const PopoverDisclosureArrow: (props: PopoverDisclosureArrowProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export interface PopoverDisclosureArrowOptions<_T extends ElementType = TagName> extends Options {
    /**
     * Object returned by the
     * [`usePopoverStore`](https://ariakit.org/reference/use-popover-store) hook.
     * If not provided, the closest
     * [`PopoverDisclosure`](https://ariakit.org/reference/popover-disclosure) or
     * [`PopoverProvider`](https://ariakit.org/reference/popover-provider)
     * components' context will be used.
     */
    store?: PopoverStore;
    /**
     * Arrow's placement direction. If not provided, it will be inferred from the
     * context.
     *
     * Live examples:
     * - [Sliding Menu](https://ariakit.org/examples/menu-slide)
     */
    placement?: PopoverStoreState["placement"];
}
export type PopoverDisclosureArrowProps<T extends ElementType = TagName> = Props<T, PopoverDisclosureArrowOptions<T>>;
export {};
