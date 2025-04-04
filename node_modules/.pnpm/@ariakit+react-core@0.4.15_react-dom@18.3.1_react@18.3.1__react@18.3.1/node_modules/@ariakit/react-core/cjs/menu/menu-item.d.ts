import type { BooleanOrCallback } from "@ariakit/core/utils/types";
import type { ElementType, MouseEvent } from "react";
import type { CompositeHoverOptions } from "../composite/composite-hover.tsx";
import type { CompositeItemOptions } from "../composite/composite-item.tsx";
import type { MenubarStore } from "../menubar/menubar-store.ts";
import type { Props } from "../utils/types.ts";
import type { MenuStore } from "./menu-store.ts";
declare const TagName = "div";
type TagName = typeof TagName;
/**
 * Returns props to create a `MenuItem` component.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx
 * const store = useMenuStore();
 * const undo = useMenuItem({ store });
 * const redo = useMenuItem({ store });
 * <MenuButton store={store}>Edit</MenuButton>
 * <Menu store={store}>
 *   <Role {...undo}>Undo</Role>
 *   <Role {...redo}>Redo</Role>
 * </Menu>
 * ```
 */
export declare const useMenuItem: import("../utils/types.ts").Hook<"div", MenuItemOptions<"div">>;
/**
 * Renders a menu item inside
 * [`MenuList`](https://ariakit.org/reference/menu-list) or
 * [`Menu`](https://ariakit.org/reference/menu)
 * components.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx {4-5}
 * <MenuProvider>
 *   <MenuButton>Edit</MenuButton>
 *   <Menu>
 *     <MenuItem>Undo</MenuItem>
 *     <MenuItem>Redo</MenuItem>
 *   </Menu>
 * </MenuProvider>
 * ```
 */
export declare const MenuItem: (props: MenuItemProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export interface MenuItemOptions<T extends ElementType = TagName> extends CompositeItemOptions<T>, CompositeHoverOptions<T> {
    /**
     * Object returned by the
     * [`useMenuStore`](https://ariakit.org/reference/use-menu-store) or
     * [`useMenubarStore`](https://ariakit.org/reference/use-menubar-store)
     * hooks. If not provided, the closest
     * [`Menu`](https://ariakit.org/reference/menu),
     * [`MenuProvider`](https://ariakit.org/reference/menu-provider),
     * [`Menubar`](https://ariakit.org/reference/menubar), or
     * [`MenubarProvider`](https://ariakit.org/reference/menubar-provider)
     * components' context will be used.
     */
    store?: MenubarStore | MenuStore;
    /**
     * Determines if the menu should hide when this item is clicked.
     *
     * **Note**: This behavior isn't triggered if this menu item is rendered as a
     * link and modifier keys are used to either open the link in a new tab or
     * download it.
     *
     * Live examples:
     * - [Sliding Menu](https://ariakit.org/examples/menu-slide)
     * @default true
     */
    hideOnClick?: BooleanOrCallback<MouseEvent<HTMLElement>>;
}
export type MenuItemProps<T extends ElementType = TagName> = Props<T, MenuItemOptions<T>>;
export {};
