import type { ElementType } from "react";
import type { CompositeGroupLabelOptions } from "../composite/composite-group-label.tsx";
import type { Props } from "../utils/types.ts";
import type { MenuStore } from "./menu-store.ts";
declare const TagName = "div";
type TagName = typeof TagName;
/**
 * Returns props to create a `MenuGroupLabel` component. This hook must be used
 * in a component that's wrapped with `MenuGroup` so the `aria-labelledby` prop
 * is properly set on the menu group element.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx
 * // This component must be wrapped with MenuGroup
 * const props = useMenuGroupLabel();
 * <Role {...props}>Label</Role>
 * ```
 */
export declare const useMenuGroupLabel: import("../utils/types.ts").Hook<"div", MenuGroupLabelOptions<"div">>;
/**
 * Renders a label in a menu group. This component should be wrapped with
 * [`MenuGroup`](https://ariakit.org/reference/menu-group) so the
 * `aria-labelledby` is correctly set on the group element.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx {5}
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
export declare const MenuGroupLabel: (props: MenuGroupLabelProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export interface MenuGroupLabelOptions<T extends ElementType = TagName> extends CompositeGroupLabelOptions<T> {
    /**
     * Object returned by the
     * [`useMenuStore`](https://ariakit.org/reference/use-menu-store) hook. If not
     * provided, the closest [`Menu`](https://ariakit.org/reference/menu) or
     * [`MenuProvider`](https://ariakit.org/reference/menu-provider) components'
     * context will be used.
     */
    store?: MenuStore;
}
export type MenuGroupLabelProps<T extends ElementType = TagName> = Props<T, MenuGroupLabelOptions<T>>;
export {};
