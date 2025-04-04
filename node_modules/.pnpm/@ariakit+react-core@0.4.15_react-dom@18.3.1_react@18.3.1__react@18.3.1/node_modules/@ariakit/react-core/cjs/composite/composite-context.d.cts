import type { CompositeStore } from "./composite-store.ts";
/**
 * Returns the composite store from the nearest composite container.
 * @example
 * function CompositeItem() {
 *   const store = useCompositeContext();
 *
 *   if (!store) {
 *     throw new Error("CompositeItem must be wrapped in CompositeProvider");
 *   }
 *
 *   // Use the store...
 * }
 */
export declare const useCompositeContext: () => CompositeStore<import("./composite-store.ts").CompositeStoreItem> | undefined;
export declare const useCompositeScopedContext: (onlyScoped?: boolean) => CompositeStore<import("./composite-store.ts").CompositeStoreItem> | undefined;
export declare const useCompositeProviderContext: () => CompositeStore<import("./composite-store.ts").CompositeStoreItem> | undefined;
export declare const CompositeContextProvider: (props: import("react").ProviderProps<CompositeStore<import("./composite-store.ts").CompositeStoreItem> | undefined>) => import("react/jsx-runtime").JSX.Element;
export declare const CompositeScopedContextProvider: (props: import("react").ProviderProps<CompositeStore<import("./composite-store.ts").CompositeStoreItem> | undefined>) => import("react/jsx-runtime").JSX.Element;
interface ItemContext {
    baseElement?: HTMLElement;
    id?: string;
}
export declare const CompositeItemContext: import("react").Context<ItemContext | undefined>;
interface RowContext extends ItemContext {
    ariaSetSize?: number;
    ariaPosInSet?: number;
}
export declare const CompositeRowContext: import("react").Context<RowContext | undefined>;
export {};
