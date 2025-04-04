import * as Core from "@ariakit/core/composite/composite-overflow-store";
import type { PopoverStoreFunctions, PopoverStoreOptions, PopoverStoreState } from "../popover/popover-store.ts";
import type { Store } from "../utils/store.tsx";
export declare function useCompositeOverflowStoreProps<T extends Core.CompositeOverflowStore>(store: T, update: () => void, props: CompositeOverflowStoreProps): T & {
    disclosure: import("../disclosure/disclosure-store.ts").DisclosureStore | null | undefined;
};
/**
 * Creates a composite overflow store.
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
export declare function useCompositeOverflowStore(props?: CompositeOverflowStoreProps): CompositeOverflowStore;
export interface CompositeOverflowStoreState extends Core.CompositeOverflowStoreState, PopoverStoreState {
}
export interface CompositeOverflowStoreFunctions extends Omit<Core.CompositeOverflowStoreFunctions, "disclosure">, PopoverStoreFunctions {
}
export interface CompositeOverflowStoreOptions extends Omit<Core.CompositeOverflowStoreOptions, "disclosure">, PopoverStoreOptions {
}
export type CompositeOverflowStoreProps = CompositeOverflowStoreOptions & Omit<Core.CompositeOverflowStoreProps, "disclosure">;
export type CompositeOverflowStore = CompositeOverflowStoreFunctions & Omit<Store<Core.CompositeOverflowStore>, "disclosure">;
