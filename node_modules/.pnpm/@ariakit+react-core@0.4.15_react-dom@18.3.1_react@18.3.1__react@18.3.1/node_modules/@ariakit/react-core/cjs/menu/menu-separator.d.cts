import type { ElementType } from "react";
import type { CompositeSeparatorOptions } from "../composite/composite-separator.tsx";
import type { Props } from "../utils/types.ts";
import type { MenuStore } from "./menu-store.ts";
declare const TagName = "hr";
type TagName = typeof TagName;
/**
 * Returns props to create a `MenuSeparator` component.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx
 * const store = useMenuStore();
 * const props = useMenuSeparator({ store });
 * <MenuButton store={store}>Edit</MenuButton>
 * <Menu store={store}>
 *   <MenuItem>Undo</MenuItem>
 *   <MenuItem>Redo</MenuItem>
 *   <Role {...props} />
 *   <MenuItem>Cut</MenuItem>
 * </Menu>
 * ```
 */
export declare const useMenuSeparator: import("../utils/types.ts").Hook<"hr", MenuSeparatorOptions<"hr">>;
/**
 * Renders a divider between
 * [`MenuItem`](https://ariakit.org/reference/menu-item),
 * [`MenuItemCheckbox`](https://ariakit.org/reference/menu-item-checkbox), and
 * [`MenuItemRadio`](https://ariakit.org/reference/menu-item-radio) elements.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx {6}
 * <MenuProvider>
 *   <MenuButton>Edit</MenuButton>
 *   <Menu>
 *     <MenuItem>Undo</MenuItem>
 *     <MenuItem>Redo</MenuItem>
 *     <MenuSeparator />
 *     <MenuItem>Cut</MenuItem>
 *   </Menu>
 * </MenuProvider>
 * ```
 */
export declare const MenuSeparator: (props: MenuSeparatorProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export interface MenuSeparatorOptions<T extends ElementType = TagName> extends CompositeSeparatorOptions<T> {
    /**
     * Object returned by the
     * [`useMenuStore`](https://ariakit.org/reference/use-menu-store) hook. If not
     * provided, the closest [`Menu`](https://ariakit.org/reference/menu) or
     * [`MenuProvider`](https://ariakit.org/reference/menu-provider) components'
     * context will be used.
     */
    store?: MenuStore;
}
export type MenuSeparatorProps<T extends ElementType = TagName> = Props<T, MenuSeparatorOptions<T>>;
export {};
