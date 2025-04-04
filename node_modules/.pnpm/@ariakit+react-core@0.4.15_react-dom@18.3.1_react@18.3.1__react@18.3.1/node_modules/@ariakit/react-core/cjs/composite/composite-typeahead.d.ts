import type { ElementType } from "react";
import type { Options, Props } from "../utils/types.ts";
import type { CompositeStore } from "./composite-store.ts";
declare const TagName = "div";
type TagName = typeof TagName;
/**
 * Returns props to create a `CompositeTypeahead` component.
 * @see https://ariakit.org/components/composite
 * @example
 * ```jsx
 * const store = useCompositeStore();
 * const props = useCompositeTypeahead({ store });
 * <Composite store={store} {...props}>
 *   <CompositeItem>Item 1</CompositeItem>
 *   <CompositeItem>Item 2</CompositeItem>
 * </Composite>
 * ```
 */
export declare const useCompositeTypeahead: import("../utils/types.ts").Hook<"div", CompositeTypeaheadOptions<"div">>;
/**
 * Renders a component that adds typeahead functionality to composite
 * components.
 *
 * When the
 * [`typeahead`](https://ariakit.org/reference/composite-typeahead#typeahead)
 * prop is enabled, which it is by default, hitting printable character keys
 * will move focus to the next composite item that begins with the input
 * characters.
 * @see https://ariakit.org/components/composite
 * @example
 * ```jsx
 * <CompositeProvider>
 *   <Composite render={<CompositeTypeahead />}>
 *     <CompositeItem>Item 1</CompositeItem>
 *     <CompositeItem>Item 2</CompositeItem>
 *   </Composite>
 * </CompositeProvider>
 * ```
 */
export declare const CompositeTypeahead: (props: CompositeTypeaheadProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export interface CompositeTypeaheadOptions<_T extends ElementType = TagName> extends Options {
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
     * When enabled, pressing printable character keys will move focus to the next
     * composite item that starts with the entered characters.
     * @default true
     */
    typeahead?: boolean;
}
export type CompositeTypeaheadProps<T extends ElementType = TagName> = Props<T, CompositeTypeaheadOptions<T>>;
export {};
