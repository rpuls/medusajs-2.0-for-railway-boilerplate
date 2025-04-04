import * as Core from "@ariakit/core/menu/menu-store";
import type { BivariantCallback, PickRequired } from "@ariakit/core/utils/types";
import type { ComboboxStore } from "../combobox/combobox-store.ts";
import type { CompositeStoreFunctions, CompositeStoreOptions, CompositeStoreState } from "../composite/composite-store.ts";
import type { HovercardStoreFunctions, HovercardStoreOptions, HovercardStoreState } from "../hovercard/hovercard-store.ts";
import type { MenubarStore } from "../menubar/menubar-store.ts";
import type { Store } from "../utils/store.tsx";
export declare function useMenuStoreProps<T extends Core.MenuStore>(store: T, update: () => void, props: MenuStoreProps): T & {
    disclosure: import("../disclosure/disclosure-store.ts").DisclosureStore | null | undefined;
} & {
    combobox: ComboboxStore<import("@ariakit/core/combobox/combobox-store").ComboboxStoreSelectedValue> | null | undefined;
    parent: MenuStore<Core.MenuStoreValues> | null | undefined;
    menubar: MenubarStore | null | undefined;
};
/**
 * Creates a menu store to control the state of
 * [Menu](https://ariakit.org/components/menu) components.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx
 * const menu = useMenuStore({ placement: "top" });
 *
 * <MenuButton store={menu}>Edit</MenuButton>
 * <Menu store={menu}>
 *   <MenuItem>Undo</MenuItem>
 *   <MenuItem>Redo</MenuItem>
 * </Menu>
 * ```
 */
export declare function useMenuStore<T extends MenuStoreValues = MenuStoreValues>(props: PickRequired<MenuStoreProps<T>, "values" | "defaultValues">): MenuStore<T>;
export declare function useMenuStore(props?: MenuStoreProps): MenuStore;
export type MenuStoreValues = Core.MenuStoreValues;
export interface MenuStoreState<T extends MenuStoreValues = MenuStoreValues> extends Core.MenuStoreState<T>, CompositeStoreState, HovercardStoreState {
}
export interface MenuStoreFunctions<T extends MenuStoreValues = MenuStoreValues> extends Pick<MenuStoreOptions, "combobox" | "parent" | "menubar" | "disclosure">, Omit<Core.MenuStoreFunctions<T>, "combobox" | "parent" | "menubar" | "disclosure">, CompositeStoreFunctions, HovercardStoreFunctions {
}
export interface MenuStoreOptions<T extends MenuStoreValues = MenuStoreValues> extends Omit<Core.MenuStoreOptions<T>, "disclosure">, CompositeStoreOptions, HovercardStoreOptions {
    /**
     * A callback that gets called when the
     * [`values`](https://ariakit.org/reference/menu-provider#values) state
     * changes.
     *
     * Live examples:
     * - [MenuItemCheckbox](https://ariakit.org/examples/menu-item-checkbox)
     * - [Submenu with
     *   Combobox](https://ariakit.org/examples/menu-nested-combobox)
     */
    setValues?: BivariantCallback<(values: MenuStoreState<T>["values"]) => void>;
    /**
     * A reference to a [combobox
     * store](https://ariakit.org/reference/use-combobox-store). It's
     * automatically set when composing [Menu with
     * Combobox](https://ariakit.org/examples/menu-combobox).
     */
    combobox?: ComboboxStore | null;
    /**
     * A reference to a parent menu store. It's automatically set when nesting
     * menus in the React tree. You should manually set this if menus aren't
     * nested in the React tree.
     *
     * Live examples:
     * - [Menubar](https://ariakit.org/components/menubar)
     * - [Submenu](https://ariakit.org/examples/menu-nested)
     * - [Navigation Menubar](https://ariakit.org/examples/menubar-navigation)
     */
    parent?: MenuStore | null;
    /**
     * A reference to a [menubar
     * store](https://ariakit.org/reference/use-menubar-store). It's automatically
     * set when rendering menus inside a
     * [`Menubar`](https://ariakit.org/reference/menubar) in the React tree.
     *
     * Live examples:
     * - [Navigation Menubar](https://ariakit.org/examples/menubar-navigation)
     */
    menubar?: MenubarStore | null;
}
export interface MenuStoreProps<T extends MenuStoreValues = MenuStoreValues> extends MenuStoreOptions<T>, Omit<Core.MenuStoreProps<T>, "combobox" | "parent" | "menubar" | "disclosure"> {
}
export interface MenuStore<T extends MenuStoreValues = MenuStoreValues> extends MenuStoreFunctions<T>, Omit<Store<Core.MenuStore<T>>, "combobox" | "parent" | "menubar" | "disclosure"> {
}
