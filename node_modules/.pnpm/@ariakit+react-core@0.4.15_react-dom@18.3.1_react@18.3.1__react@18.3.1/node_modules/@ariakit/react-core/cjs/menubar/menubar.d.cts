import type { ElementType } from "react";
import type { CompositeOptions } from "../composite/composite.tsx";
import type { Props } from "../utils/types.ts";
import type { MenubarStore, MenubarStoreProps } from "./menubar-store.ts";
declare const TagName = "div";
type TagName = typeof TagName;
/**
 * Returns props to create a `Menubar` component.
 * @see https://ariakit.org/components/menubar
 * @example
 * ```jsx
 * const store = useMenubarStore();
 * const menubarProps = useMenubar({ store });
 * const fileProps = useMenuItem({ store });
 * const fileMenu = useMenuStore();
 * <Role {...menubarProps}>
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
export declare const useMenubar: import("../utils/types.ts").Hook<"div", MenubarOptions<"div">>;
/**
 * Renders a menubar that may contain a group of
 * [`MenuItem`](https://ariakit.org/reference/menu-item) elements that control
 * other submenus.
 * @see https://ariakit.org/components/menubar
 * @example
 * ```jsx
 * <Menubar>
 *   <MenuProvider>
 *     <MenuItem render={<MenuButton />}>File</MenuItem>
 *     <Menu>
 *       <MenuItem>New File</MenuItem>
 *       <MenuItem>New Window</MenuItem>
 *     </Menu>
 *   </MenuProvider>
 *   <MenuProvider>
 *     <MenuItem render={<MenuButton />}>Edit</MenuItem>
 *     <Menu>
 *       <MenuItem>Undo</MenuItem>
 *       <MenuItem>Redo</MenuItem>
 *     </Menu>
 *   </MenuProvider>
 * </Menubar>
 * ```
 */
export declare const Menubar: (props: MenubarProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export interface MenubarOptions<T extends ElementType = TagName> extends CompositeOptions<T>, Pick<MenubarStoreProps, "focusLoop" | "orientation" | "rtl" | "virtualFocus"> {
    /**
     * Object returned by the
     * [`useMenubarStore`](https://ariakit.org/reference/use-menubar-store) hook.
     * If not provided, the closest
     * [`MenubarProvider`](https://ariakit.org/reference/menubar-provider)
     * component context will be used. If the component is not wrapped in a
     * [`MenubarProvider`](https://ariakit.org/reference/menubar-provider)
     * component, an internal store will be used.
     */
    store?: MenubarStore;
}
export type MenubarProps<T extends ElementType = TagName> = Props<T, MenubarOptions<T>>;
export {};
