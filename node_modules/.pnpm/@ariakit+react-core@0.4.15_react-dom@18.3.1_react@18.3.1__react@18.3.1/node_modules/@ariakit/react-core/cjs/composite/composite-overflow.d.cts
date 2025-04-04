import type { ElementType } from "react";
import type { PopoverOptions } from "../popover/popover.tsx";
import type { Props } from "../utils/types.ts";
import type { CompositeOverflowStore } from "./composite-overflow-store.ts";
declare const TagName = "div";
type TagName = typeof TagName;
/**
 * Returns props to create a `CompositeOverflow` component.
 * @see https://ariakit.org/components/composite
 * @example
 * ```jsx
 * const store = useCompositeOverflowStore();
 * const props = useCompositeOverflow({ store });
 * <Role {...props}>
 *   <CompositeItem>Item 3</CompositeItem>
 *   <CompositeItem>Item 4</CompositeItem>
 * </Role>
 * ```
 */
export declare const useCompositeOverflow: import("../utils/types.ts").Hook<"div", CompositeOverflowOptions<"div">>;
/**
 * Renders a popover that will contain the overflow items in a composite
 * collection.
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
export declare const CompositeOverflow: (props: CompositeOverflowProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export interface CompositeOverflowOptions<T extends ElementType = TagName> extends PopoverOptions<T> {
    /**
     * Object returned by the `useCompositeOverflowStore` hook.
     */
    store: CompositeOverflowStore;
}
export type CompositeOverflowProps<T extends ElementType = TagName> = Props<T, CompositeOverflowOptions<T>>;
export {};
