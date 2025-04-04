import type { ElementType } from "react";
import type { MenubarOptions } from "../menubar/menubar.tsx";
import type { Props } from "../utils/types.ts";
declare const TagName = "div";
type TagName = typeof TagName;
/**
 * Returns props to create a `MenuBar` component.
 * @deprecated Use `useMenubar` instead.
 * @example
 * ```jsx
 * const store = useMenuBarStore();
 * const menuBarProps = useMenuBar({ store });
 * const fileProps = useMenuItem({ store });
 * const fileMenu = useMenuStore();
 * <Role {...menuBarProps}>
 *   <MenuButton {...fileProps} store={fileMenu}>
 *     File
 *   </MenuButton>
 *   <Menu store={fileMenu}>
 *     <MenuItem>New File</MenuItem>
 *     <MenuItem>New Window</MenuItem>
 *   </Menu>
 * </Role>
 * ```
 */
export declare const useMenuBar: import("../utils/types.ts").Hook<"div", MenuBarOptions<"div">>;
/**
 * Renders a menu bar that may contain a group of menu items that control other
 * submenus.
 * @deprecated
 * Use [`Menubar`](https://ariakit.org/reference/menubar) instead.
 * @example
 * ```jsx
 * <MenuBarProvider>
 *   <MenuBar>
 *     <MenuProvider>
 *       <MenuItem render={<MenuButton />}>File</MenuItem>
 *       <Menu>
 *         <MenuItem>New File</MenuItem>
 *         <MenuItem>New Window</MenuItem>
 *       </Menu>
 *     </MenuProvider>
 *     <MenuProvider>
 *       <MenuItem render={<MenuButton />}>Edit</MenuItem>
 *       <Menu>
 *         <MenuItem>Undo</MenuItem>
 *         <MenuItem>Redo</MenuItem>
 *       </Menu>
 *     </MenuProvider>
 *   </MenuBar>
 * </MenuBarProvider>
 * ```
 */
export declare const MenuBar: (props: MenuBarProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export interface MenuBarOptions<T extends ElementType = TagName> extends MenubarOptions<T> {
}
export type MenuBarProps<T extends ElementType = TagName> = Props<T, MenuBarOptions<T>>;
export {};
