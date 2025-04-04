import type { ElementType } from "react";
import type { CheckboxOptions } from "../checkbox/checkbox.tsx";
import type { Props } from "../utils/types.ts";
import type { MenuItemOptions } from "./menu-item.tsx";
import type { MenuStore } from "./menu-store.ts";
declare const TagName = "div";
type TagName = typeof TagName;
/**
 * Returns props to create a `MenuItemCheckbox` component.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx
 * const store = useMenuStore({ defaultValues: { apple: false } });
 * const props = useMenuItemCheckbox({ store, name: "apple" });
 * <MenuButton store={store}>Fruits</MenuButton>
 * <Menu store={store}>
 *   <Role {...props}>Apple</Role>
 * </Menu>
 * ```
 */
export declare const useMenuItemCheckbox: import("../utils/types.ts").Hook<"div", MenuItemCheckboxOptions<"div">>;
/**
 * Renders a [`menuitemcheckbox`](https://w3c.github.io/aria/#menuitemcheckbox)
 * element within a [`Menu`](https://ariakit.org/reference/menu) component. The
 * [`name`](https://ariakit.org/reference/menu-item-checkbox#name) prop must be
 * provided to identify the field in the
 * [`values`](https://ariakit.org/reference/menu-provider#values) state.
 *
 * A [`MenuItemCheck`](https://ariakit.org/reference/menu-item-check) can be
 * used to render a checkmark inside this component.
 * @see https://ariakit.org/components/menu
 * @example
 * The [`name`](https://ariakit.org/reference/menu-item-checkbox#name) prop can
 * refer to a single value in the state:
 * ```jsx {4-7}
 * <MenuProvider defaultValues={{ warnBeforeQuitting: true }}>
 *   <MenuButton>Chrome</MenuButton>
 *   <Menu>
 *     <MenuItemCheckbox name="warnBeforeQuitting">
 *       <MenuItemCheck />
 *       Warn Before Quitting
 *     </MenuItemCheckbox>
 *   </Menu>
 * </MenuProvider>
 * ```
 * @example
 * Or it can refer to an array of values, in which case the
 * [`value`](https://ariakit.org/reference/menu-item-checkbox#value) prop must
 * be provided:
 * ```jsx {4-9}
 * <MenuProvider defaultValues={{ watching: ["issues"] }}>
 *   <MenuButton>Watch</MenuButton>
 *   <Menu>
 *     <MenuItemCheckbox name="watching" value="issues">
 *       Issues
 *     </MenuItemCheckbox>
 *     <MenuItemCheckbox name="watching" value="pull-requests">
 *       Pull Requests
 *     </MenuItemCheckbox>
 *   </Menu>
 * </MenuProvider>
 * ```
 */
export declare const MenuItemCheckbox: (props: MenuItemCheckboxProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export interface MenuItemCheckboxOptions<T extends ElementType = TagName> extends MenuItemOptions<T>, Omit<CheckboxOptions<T>, "store"> {
    /**
     * Object returned by the
     * [`useMenuStore`](https://ariakit.org/reference/use-menu-store) hook. If not
     * provided, the closest [`Menu`](https://ariakit.org/reference/menu) or
     * [`MenuProvider`](https://ariakit.org/reference/menu-provider) components'
     * context will be used.
     */
    store?: MenuStore;
    /**
     * The name of the field in the
     * [`values`](https://ariakit.org/reference/menu-provider#values) state.
     *
     * Live examples:
     * - [MenuItemCheckbox](https://ariakit.org/examples/menu-item-checkbox)
     */
    name: string;
    /**
     * The controlled checked state of the element. It will set the menu
     * [`values`](https://ariakit.org/reference/menu-provider#values) state if
     * provided.
     */
    checked?: boolean;
    /**
     * The default checked state of the element. It will set the default value in
     * the menu [`values`](https://ariakit.org/reference/menu-provider#values)
     * state if provided.
     */
    defaultChecked?: boolean;
    /**
     * @default false
     */
    hideOnClick?: MenuItemOptions<T>["hideOnClick"];
}
export type MenuItemCheckboxProps<T extends ElementType = TagName> = Props<T, MenuItemCheckboxOptions<T>>;
export {};
