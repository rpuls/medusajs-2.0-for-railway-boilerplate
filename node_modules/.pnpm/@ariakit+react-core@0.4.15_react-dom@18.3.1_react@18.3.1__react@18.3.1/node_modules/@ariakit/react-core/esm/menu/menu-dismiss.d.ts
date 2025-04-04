import type { ElementType } from "react";
import type { HovercardDismissOptions } from "../hovercard/hovercard-dismiss.tsx";
import type { Props } from "../utils/types.ts";
import type { MenuStore } from "./menu-store.ts";
declare const TagName = "button";
type TagName = typeof TagName;
/**
 * Returns props to create a `MenuDismiss` component.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx
 * const store = useMenuStore();
 * const props = useMenuDismiss({ store });
 * <Menu store={store}>
 *   <Role {...props} />
 * </Menu>
 * ```
 */
export declare const useMenuDismiss: import("../utils/types.ts").Hook<"button", MenuDismissOptions<"button">>;
/**
 * Renders a button that hides a [`Menu`](https://ariakit.org/reference/menu)
 * when clicked.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx {3}
 * <MenuProvider>
 *   <Menu>
 *     <MenuDismiss />
 *   </Menu>
 * </MenuProvider>
 * ```
 */
export declare const MenuDismiss: (props: MenuDismissProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export interface MenuDismissOptions<T extends ElementType = TagName> extends HovercardDismissOptions<T> {
    /**
     * Object returned by the
     * [`useMenuStore`](https://ariakit.org/reference/use-menu-store) hook. If not
     * provided, the closest [`Menu`](https://ariakit.org/reference/menu) or
     * [`MenuProvider`](https://ariakit.org/reference/menu-provider) components'
     * context will be used.
     */
    store?: MenuStore;
}
export type MenuDismissProps<T extends ElementType = TagName> = Props<T, MenuDismissOptions<T>>;
export {};
