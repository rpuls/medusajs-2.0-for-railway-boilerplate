import type { ElementType } from "react";
import type { Options, Props } from "../utils/types.ts";
import type { CompositeStore } from "./composite-store.ts";
declare const TagName = "div";
type TagName = typeof TagName;
/**
 * Returns props to create a `CompositeContainer` component. This component
 * renders interactive widgets inside composite items. This should be used in
 * conjunction with the `CompositeItem` component, the `useCompositeItem` hook,
 * or any other component/hook that uses `CompositeItem` underneath.
 * @see https://ariakit.org/components/composite
 * @example
 * ```jsx
 * const store = useCompositeStore();
 * const props = useCompositeContainer({ store });
 * <Composite store={store}>
 *   <CompositeItem {...props}>
 *     <input type="text" />
 *   </CompositeItem>
 * </Composite>
 * ```
 */
export declare const useCompositeContainer: import("../utils/types.ts").Hook<"div", CompositeContainerOptions<"div">>;
/**
 * Renders a container for interactive widgets inside composite items. This
 * should be used in conjunction with the
 * [`CompositeItem`](https://ariakit.org/reference/composite-item) component or
 * a component that uses
 * [`CompositeItem`](https://ariakit.org/reference/composite-item) underneath.
 * @see https://ariakit.org/components/composite
 * @example
 * ```jsx {3-5}
 * <CompositeProvider>
 *   <Composite>
 *     <CompositeItem render={<CompositeContainer />}>
 *       <input type="text" />
 *     </CompositeItem>
 *   </Composite>
 * </CompositeProvider>
 * ```
 */
export declare const CompositeContainer: (props: CompositeContainerProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export interface CompositeContainerOptions<_T extends ElementType = TagName> extends Options {
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
export type CompositeContainerProps<T extends ElementType = TagName> = Props<T, CompositeContainerOptions<T>>;
export {};
