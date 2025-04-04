import type { ElementType } from "react";
import type { HovercardOptions } from "../hovercard/hovercard.tsx";
import type { Props } from "../utils/types.ts";
import type { MenuListOptions } from "./menu-list.tsx";
declare const TagName = "div";
type TagName = typeof TagName;
/**
 * Returns props to create a `Menu` component.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx
 * const store = useMenuStore();
 * const props = useMenu({ store });
 * <MenuButton store={store}>Edit</MenuButton>
 * <Role {...props}>
 *   <MenuItem>Undo</MenuItem>
 *   <MenuItem>Redo</MenuItem>
 * </Role>
 * ```
 */
export declare const useMenu: import("../utils/types.ts").Hook<"div", MenuOptions<"div">>;
/**
 * Renders a dropdown menu element that's controlled by a
 * [`MenuButton`](https://ariakit.org/reference/menu-button) component.
 *
 * This component uses the primitive
 * [`MenuList`](https://ariakit.org/reference/menu-list) component under the
 * hood. It renders a popover and automatically focuses on items when the menu
 * is shown.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx {3-6}
 * <MenuProvider>
 *   <MenuButton>Edit</MenuButton>
 *   <Menu>
 *     <MenuItem>Undo</MenuItem>
 *     <MenuItem>Redo</MenuItem>
 *   </Menu>
 * </MenuProvider>
 * ```
 */
export declare const Menu: (props: MenuProps<"div">) => import("react/jsx-runtime").JSX.Element | null;
export interface MenuOptions<T extends ElementType = TagName> extends MenuListOptions<T>, Omit<HovercardOptions<T>, "store"> {
}
export type MenuProps<T extends ElementType = TagName> = Props<T, MenuOptions<T>>;
export {};
