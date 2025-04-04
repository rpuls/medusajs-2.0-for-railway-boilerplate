import type { ElementType } from "react";
import type { Options, Props } from "../utils/types.ts";
import type { CompositeStore } from "./composite-store.ts";
declare const TagName = "div";
type TagName = typeof TagName;
/**
 * Returns props to create a `CompositeRow` component. Wrapping `CompositeItem`
 * elements within rows will create a two-dimensional composite widget, such as
 * a grid.
 * @see https://ariakit.org/components/composite
 * @example
 * ```jsx
 * const store = useCompositeStore();
 * const props = useCompositeRow({ store });
 * <Composite store={store}>
 *   <Role {...props}>
 *     <CompositeItem>Item 1</CompositeItem>
 *     <CompositeItem>Item 2</CompositeItem>
 *     <CompositeItem>Item 3</CompositeItem>
 *   </Role>
 * </Composite>
 * ```
 */
export declare const useCompositeRow: import("../utils/types.ts").Hook<"div", CompositeRowOptions<"div">>;
/**
 * Renders a row element for composite items that allows two-dimensional arrow
 * key navigation.
 * [`CompositeItem`](https://ariakit.org/reference/composite-item) elements
 * wrapped within this component will automatically receive a
 * [`rowId`](https://ariakit.org/reference/composite-item#rowid) prop.
 * @see https://ariakit.org/components/composite
 * @example
 * ```jsx {3-12}
 * <CompositeProvider>
 *   <Composite>
 *     <CompositeRow>
 *       <CompositeItem>Item 1.1</CompositeItem>
 *       <CompositeItem>Item 1.2</CompositeItem>
 *       <CompositeItem>Item 1.3</CompositeItem>
 *     </CompositeRow>
 *     <CompositeRow>
 *       <CompositeItem>Item 2.1</CompositeItem>
 *       <CompositeItem>Item 2.2</CompositeItem>
 *       <CompositeItem>Item 2.3</CompositeItem>
 *     </CompositeRow>
 *   </Composite>
 * </CompositeProvider>
 * ```
 */
export declare const CompositeRow: (props: CompositeRowProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export interface CompositeRowOptions<_T extends ElementType = TagName> extends Options {
    /**
     * Object returned by the
     * [`useCompositeStore`](https://ariakit.org/reference/use-composite-store)
     * hook. If not provided, the closest
     * [`Composite`](https://ariakit.org/reference/composite) or
     * [`CompositeProvider`](https://ariakit.org/reference/composite-provider)
     * components' context will be used.
     */
    store?: CompositeStore;
}
export type CompositeRowProps<T extends ElementType = TagName> = Props<T, CompositeRowOptions<T>>;
export {};
