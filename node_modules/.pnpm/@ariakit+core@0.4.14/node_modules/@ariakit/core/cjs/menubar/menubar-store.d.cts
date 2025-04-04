import type { CompositeStoreFunctions, CompositeStoreOptions, CompositeStoreState } from "../composite/composite-store.ts";
import type { Store, StoreProps } from "../utils/store.ts";
/**
 * Creates a menubar store.
 */
export declare function createMenubarStore(props?: MenubarStoreProps): MenubarStore;
export interface MenubarStoreState extends CompositeStoreState {
}
export interface MenubarStoreFunctions extends CompositeStoreFunctions {
}
export interface MenubarStoreOptions extends CompositeStoreOptions {
}
export interface MenubarStoreProps extends MenubarStoreOptions, StoreProps<MenubarStoreState> {
}
export interface MenubarStore extends MenubarStoreFunctions, Store<MenubarStoreState> {
}
