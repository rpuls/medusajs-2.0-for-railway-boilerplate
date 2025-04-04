import type { ElementType } from "react";
import type { PopoverDisclosureOptions } from "../popover/popover-disclosure.tsx";
import type { Props } from "../utils/types.ts";
import type { CompositeItemOptions } from "./composite-item.tsx";
import type { CompositeOverflowStore } from "./composite-overflow-store.ts";
declare const TagName = "button";
type TagName = typeof TagName;
/**
 * Returns props to create a `CompositeOverflowDisclosure` component. This hook
 * should be used in a component that's wrapped with a composite component.
 * @see https://ariakit.org/components/composite
 * @example
 * ```jsx
 * // This component should be wrapped with Composite
 * const props = useCompositeOverflowDisclosure();
 * <Role {...props}>+2 items</Role>
 * ```
 */
export declare const useCompositeOverflowDisclosure: import("../utils/types.ts").Hook<"button", CompositeOverflowDisclosureOptions<"button">>;
/**
 * Renders a disclosure button for the `CompositeOverflow` component. This
 * component should be wrapped with a composite component.
 * @see https://ariakit.org/components/composite
 * @example
 * ```jsx
 * const composite = useCompositeStore();
 * const overflow = useCompositeOverflowStore();
 * <Composite store={composite}>
 *   <CompositeItem>Item 1</CompositeItem>
 *   <CompositeItem>Item 2</CompositeItem>
 *   <CompositeOverflowDisclosure store={overflow}>
 *     +2 items
 *   </CompositeOverflowDisclosure>
 *   <CompositeOverflow store={overflow}>
 *     <CompositeItem>Item 3</CompositeItem>
 *     <CompositeItem>Item 4</CompositeItem>
 *   </CompositeOverflow>
 * </Composite>
 * ```
 */
export declare const CompositeOverflowDisclosure: (props: CompositeOverflowDisclosureProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export interface CompositeOverflowDisclosureOptions<T extends ElementType = TagName> extends Omit<CompositeItemOptions<T>, "store">, PopoverDisclosureOptions<T> {
    /**
     * Object returned by the `useCompositeOverflowStore` hook.
     */
    store: CompositeOverflowStore;
}
export type CompositeOverflowDisclosureProps<T extends ElementType = TagName> = Props<T, CompositeOverflowDisclosureOptions<T>>;
export {};
