import type { ElementType } from "react";
import type { CompositeGroupOptions } from "../composite/composite-group.tsx";
import type { Props } from "../utils/types.ts";
import type { MenuStore } from "./menu-store.ts";
declare const TagName = "div";
type TagName = typeof TagName;
/**
 * Returns props to create a `MenuGroup` component.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx
 * const store = useMenuStore();
 * const props = useMenuGroup({ store });
 * <MenuButton store={store}>Recent Items</MenuButton>
 * <Menu store={store}>
 *   <Role {...props}>
 *     <MenuGroupLabel>Applications</MenuGroupLabel>
 *     <MenuItem>Google Chrome.app</MenuItem>
 *     <MenuItem>Safari.app</MenuItem>
 *   </Role>
 * </Menu>
 * ```
 */
export declare const useMenuGroup: import("../utils/types.ts").Hook<"div", MenuGroupOptions<"div">>;
/**
 * Renders a group for [`MenuItem`](https://ariakit.org/reference/menu-item)
 * elements. Optionally, a
 * [`MenuGroupLabel`](https://ariakit.org/reference/menu-group-label) can be
 * rendered as a child to provide a label for the group.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx {4-8}
 * <MenuProvider>
 *   <MenuButton>Recent Items</MenuButton>
 *   <Menu>
 *     <MenuGroup>
 *       <MenuGroupLabel>Applications</MenuGroupLabel>
 *       <MenuItem>Google Chrome.app</MenuItem>
 *       <MenuItem>Safari.app</MenuItem>
 *     </MenuGroup>
 *   </Menu>
 * </MenuProvider>
 * ```
 */
export declare const MenuGroup: (props: MenuGroupProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export interface MenuGroupOptions<T extends ElementType = TagName> extends CompositeGroupOptions<T> {
    /**
     * Object returned by the
     * [`useMenuStore`](https://ariakit.org/reference/use-menu-store) hook. If not
     * provided, the closest [`Menu`](https://ariakit.org/reference/menu) or
     * [`MenuProvider`](https://ariakit.org/reference/menu-provider) components'
     * context will be used.
     */
    store?: MenuStore;
}
export type MenuGroupProps<T extends ElementType = TagName> = Props<T, MenuGroupOptions<T>>;
export {};
