import type { CollectionStore } from "./collection-store.ts";
/**
 * Returns the collection store from the nearest collection container.
 * @example
 * function CollectionItem() {
 *   const store = useCollectionContext();
 *
 *   if (!store) {
 *     throw new Error("CollectionItem must be wrapped in CollectionProvider");
 *   }
 *
 *   // Use the store...
 * }
 */
export declare const useCollectionContext: () => CollectionStore<import("./collection-store.ts").CollectionStoreItem> | undefined;
export declare const useCollectionScopedContext: (onlyScoped?: boolean) => CollectionStore<import("./collection-store.ts").CollectionStoreItem> | undefined;
export declare const useCollectionProviderContext: () => CollectionStore<import("./collection-store.ts").CollectionStoreItem> | undefined;
export declare const CollectionContextProvider: (props: import("react").ProviderProps<CollectionStore<import("./collection-store.ts").CollectionStoreItem> | undefined>) => import("react/jsx-runtime").JSX.Element;
export declare const CollectionScopedContextProvider: (props: import("react").ProviderProps<CollectionStore<import("./collection-store.ts").CollectionStoreItem> | undefined>) => import("react/jsx-runtime").JSX.Element;
