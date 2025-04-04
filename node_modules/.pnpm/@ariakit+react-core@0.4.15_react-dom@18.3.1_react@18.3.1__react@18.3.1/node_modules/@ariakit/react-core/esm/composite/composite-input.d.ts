import type { ElementType } from "react";
import type { Options, Props } from "../utils/types.ts";
import type { CompositeStore } from "./composite-store.ts";
declare const TagName = "input";
type TagName = typeof TagName;
/**
 * Returns props to create a `CompositeInput` component. This should be used in
 * conjunction with the `CompositeItem` component, the `useCompositeItem` hook,
 * or any other component/hook that uses `CompositeItem` underneath.
 * @see https://ariakit.org/components/composite
 * @deprecated Use `useCompositeItem` instead.
 * @example
 * ```jsx
 * const store = useCompositeStore();
 * const props = useCompositeInput({ store });
 * <Composite store={store}>
 *   <CompositeItem {...props} />
 * </Composite>
 * ```
 */
export declare const useCompositeInput: import("../utils/types.ts").Hook<"input", CompositeInputOptions<"input">>;
/**
 * Renders an input as a composite item. This should be used in conjunction with
 * the [`CompositeItem`](https://ariakit.org/reference/composite-item) component
 * or a component that uses
 * [`CompositeItem`](https://ariakit.org/reference/composite-item) underneath.
 * @see https://ariakit.org/components/composite
 * @deprecated Use `<CompositeItem render={<input />}>` instead.
 * @example
 * ```jsx {3}
 * <CompositeProvider>
 *   <Composite>
 *     <CompositeItem render={<CompositeInput />} />
 *   </Composite>
 * </CompositeProvider>
 * ```
 */
export declare const CompositeInput: (props: CompositeInputProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export interface CompositeInputOptions<_T extends ElementType = TagName> extends Options {
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
export type CompositeInputProps<T extends ElementType = TagName> = Props<T, CompositeInputOptions<T>>;
export {};
