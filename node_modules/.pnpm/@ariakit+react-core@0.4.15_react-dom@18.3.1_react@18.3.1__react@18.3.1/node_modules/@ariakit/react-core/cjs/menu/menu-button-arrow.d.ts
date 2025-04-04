import type { ElementType } from "react";
import type { PopoverDisclosureArrowOptions } from "../popover/popover-disclosure-arrow.tsx";
import type { Props } from "../utils/types.ts";
import type { MenuStore } from "./menu-store.ts";
declare const TagName = "span";
type TagName = typeof TagName;
/**
 * Returns props to create a `MenuButtonArrow` component.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx
 * const store = useMenuStore();
 * const props = useMenuButtonArrow({ store });
 * <MenuButton store={store}>
 *   Edit
 *   <Role {...props} />
 * </MenuButton>
 * <Menu store={store}>
 *   <MenuItem>Undo</MenuItem>
 *   <MenuItem>Redo</MenuItem>
 * </Menu>
 * ```
 */
export declare const useMenuButtonArrow: import("../utils/types.ts").Hook<"span", MenuButtonArrowOptions<"span">>;
/**
 * Displays an arrow within a
 * [`MenuButton`](https://ariakit.org/reference/menu-button), pointing to the
 * [`Menu`](https://ariakit.org/reference/menu) position. It's typically based
 * on the [`placement`](https://ariakit.org/reference/menu-provider#placement)
 * state from the menu store, but this can be overridden with the
 * [`placement`](https://ariakit.org/reference/menu-button-arrow#placement)
 * prop.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx {4}
 * <MenuProvider placement="bottom-start">
 *   <MenuButton>
 *     Edit
 *     <MenuButtonArrow />
 *   </MenuButton>
 *   <Menu>
 *     <MenuItem>Undo</MenuItem>
 *     <MenuItem>Redo</MenuItem>
 *   </Menu>
 * </MenuProvider>
 * ```
 */
export declare const MenuButtonArrow: (props: MenuButtonArrowProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export interface MenuButtonArrowOptions<T extends ElementType = TagName> extends PopoverDisclosureArrowOptions<T> {
    /**
     * Object returned by the
     * [`useMenuStore`](https://ariakit.org/reference/use-menu-store) hook. If not
     * provided, the closest
     * [`MenuButton`](https://ariakit.org/reference/menu-button) or
     * [`MenuProvider`](https://ariakit.org/reference/menu-provider) components'
     * context will be used.
     */
    store?: MenuStore;
}
export type MenuButtonArrowProps<T extends ElementType = TagName> = Props<T, MenuButtonArrowOptions<T>>;
export {};
