import * as Core from "@ariakit/core/menubar/menubar-store";
import type { CompositeStoreFunctions, CompositeStoreOptions, CompositeStoreState } from "../composite/composite-store.ts";
import type { Store } from "../utils/store.tsx";
export declare function useMenubarStoreProps<T extends Core.MenubarStore>(store: T, update: () => void, props: MenubarStoreProps): T;
/**
 * Creates a menubar store to control the state of
 * [Menubar](https://ariakit.org/components/menubar) components.
 * @see https://ariakit.org/components/menubar
 * @example
 * ```jsx
 * const menu = useMenubarStore();
 *
 * <Menubar store={menu} />
 * ```
 */
export declare function useMenubarStore(props?: MenubarStoreProps): MenubarStore;
export interface MenubarStoreState extends Core.MenubarStoreState, CompositeStoreState {
}
export interface MenubarStoreFunctions extends Core.MenubarStoreFunctions, CompositeStoreFunctions {
}
export interface MenubarStoreOptions extends Core.MenubarStoreOptions, CompositeStoreOptions {
}
export interface MenubarStoreProps extends MenubarStoreOptions, Core.MenubarStoreProps {
}
export interface MenubarStore extends MenubarStoreFunctions, Store<Core.MenubarStore> {
}
