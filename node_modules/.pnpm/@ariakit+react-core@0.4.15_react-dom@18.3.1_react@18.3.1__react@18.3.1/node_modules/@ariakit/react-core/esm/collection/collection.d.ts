import type { ElementType } from "react";
import type { Options, Props } from "../utils/types.ts";
import type { CollectionStore } from "./collection-store.ts";
declare const TagName = "div";
type TagName = typeof TagName;
/**
 * Returns props to create a `Collection` component. It receives the collection
 * store through the `store` prop and provides context for `CollectionItem`
 * components.
 * @see https://ariakit.org/components/collection
 * @example
 * ```jsx
 * const collection = useCollectionStore();
 * const props = useCollection({ store });
 * <Role {...props}>
 *   <CollectionItem>Item 1</CollectionItem>
 *   <CollectionItem>Item 2</CollectionItem>
 *   <CollectionItem>Item 3</CollectionItem>
 * </Role>
 * ```
 */
export declare const useCollection: import("../utils/types.ts").Hook<"div", CollectionOptions<"div">>;
/**
 * Renders a simple wrapper for collection items. It accepts a collection store
 * through the [`store`](https://ariakit.org/reference/collection#store) prop
 * and provides context for
 * [`CollectionItem`](https://ariakit.org/reference/collection-item) components.
 * @see https://ariakit.org/components/collection
 * @example
 * ```jsx
 * const collection = useCollectionStore();
 * <Collection store={collection}>
 *   <CollectionItem>Item 1</CollectionItem>
 *   <CollectionItem>Item 2</CollectionItem>
 *   <CollectionItem>Item 3</CollectionItem>
 * </Collection>
 * ```
 */
export declare const Collection: (props: CollectionProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export interface CollectionOptions<_T extends ElementType = TagName> extends Options {
    /**
     * Object returned by the
     * [`useCollectionStore`](https://ariakit.org/reference/use-collection-store)
     * hook. If not provided, the closest
     * [`CollectionProvider`](https://ariakit.org/reference/collection-provider)
     * component's context will be used.
     */
    store?: CollectionStore;
}
export type CollectionProps<T extends ElementType = TagName> = Props<T, CollectionOptions<T>>;
export {};
