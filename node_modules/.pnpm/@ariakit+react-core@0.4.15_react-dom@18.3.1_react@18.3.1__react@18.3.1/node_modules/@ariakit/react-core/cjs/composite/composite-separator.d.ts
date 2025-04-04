import type { ElementType } from "react";
import type { SeparatorOptions } from "../separator/separator.tsx";
import type { Props } from "../utils/types.ts";
import type { CompositeStore } from "./composite-store.ts";
declare const TagName = "hr";
type TagName = typeof TagName;
/**
 * Returns props to create a `CompositeSeparator` component.
 * @see https://ariakit.org/components/composite
 * @example
 * ```jsx
 * const store = useCompositeStore();
 * const props = useCompositeSeparator({ store });
 * <Composite store={store}>
 *   <CompositeItem>Item 1</CompositeItem>
 *   <Role {...props} />
 *   <CompositeItem>Item 2</CompositeItem>
 * </Composite>
 * ```
 */
export declare const useCompositeSeparator: import("../utils/types.ts").Hook<"hr", CompositeSeparatorOptions<"hr">>;
/**
 * Renders a divider between
 * [`CompositeItem`](https://ariakit.org/reference/composite-item) elements.
 * @see https://ariakit.org/components/composite
 * @example
 * ```jsx {4}
 * <CompositeProvider>
 *   <Composite>
 *     <CompositeItem>Item 1</CompositeItem>
 *     <CompositeSeparator />
 *     <CompositeItem>Item 2</CompositeItem>
 *   </Composite>
 * </CompositeProvider>
 * ```
 */
export declare const CompositeSeparator: (props: CompositeSeparatorProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export interface CompositeSeparatorOptions<T extends ElementType = TagName> extends SeparatorOptions<T> {
    /**
     * Object returned by the
     * [`useCompositeStore`](https://ariakit.org/reference/use-composite-store)
     * hook. If not provided, the closest
     * [`Composite`](https://ariakit.org/reference/composite) or
     * [`CompositeProvider`](https://ariakit.org/reference/composite-provider)
     * components' context will be used.
     */
    store?: CompositeStore;
    /**
     * The orientation of the separator. By default, this is the opposite of the
     * [`orientation`](https://ariakit.org/reference/composite-provider#orientation)
     * state of the composite widget. Which means it doesn't need to be explicitly
     * set in most cases.
     */
    orientation?: SeparatorOptions<T>["orientation"];
}
export type CompositeSeparatorProps<T extends ElementType = TagName> = Props<T, CompositeSeparatorOptions<T>>;
export {};
