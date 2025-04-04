import type { ElementType } from "react";
import type { PopoverArrowOptions } from "../popover/popover-arrow.tsx";
import type { Props } from "../utils/types.ts";
import type { MenuStore } from "./menu-store.ts";
declare const TagName = "div";
type TagName = typeof TagName;
/**
 * Returns props to create a `MenuArrow` component.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx
 * const store = useMenuStore();
 * const props = useMenuArrow({ store });
 * <MenuButton store={store}>Menu</MenuButton>
 * <Menu store={store}>
 *   <Role {...props} />
 * </Menu>
 * ```
 */
export declare const useMenuArrow: import("../utils/types.ts").Hook<"div", MenuArrowOptions<"div">>;
/**
 * Renders an arrow element inside a
 * [`Menu`](https://ariakit.org/reference/menu) component that points to its
 * [`MenuButton`](https://ariakit.org/reference/menu-button).
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx {4}
 * <MenuProvider>
 *   <MenuButton>Menu</MenuButton>
 *   <Menu>
 *     <MenuArrow />
 *   </Menu>
 * </MenuProvider>
 * ```
 */
export declare const MenuArrow: (props: MenuArrowProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export interface MenuArrowOptions<T extends ElementType = TagName> extends PopoverArrowOptions<T> {
    /**
     * Object returned by the
     * [`useMenuStore`](https://ariakit.org/reference/use-menu-store) hook. If not
     * provided, the closest [`Menu`](https://ariakit.org/reference/menu) or
     * [`MenuProvider`](https://ariakit.org/reference/menu-provider) components'
     * context will be used.
     */
    store?: MenuStore;
}
export type MenuArrowProps<T extends ElementType = TagName> = Props<T, MenuArrowOptions<T>>;
export {};
