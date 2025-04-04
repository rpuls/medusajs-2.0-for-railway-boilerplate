import type { CompositeStoreFunctions, CompositeStoreOptions, CompositeStoreState } from "../composite/composite-store.ts";
import type { Store, StoreOptions, StoreProps } from "../utils/store.ts";
/**
 * Creates a toolbar store.
 */
export declare function createToolbarStore(props?: ToolbarStoreProps): ToolbarStore;
export interface ToolbarStoreState extends CompositeStoreState {
    /** @default "horizontal" */
    orientation: CompositeStoreState["orientation"];
    /** @default true */
    focusLoop: CompositeStoreState["focusLoop"];
}
export interface ToolbarStoreFunctions extends CompositeStoreFunctions {
}
export interface ToolbarStoreOptions extends StoreOptions<ToolbarStoreState, "orientation" | "focusLoop">, CompositeStoreOptions {
}
export interface ToolbarStoreProps extends ToolbarStoreOptions, StoreProps<ToolbarStoreState> {
}
export interface ToolbarStore extends ToolbarStoreFunctions, Store<ToolbarStoreState> {
}
