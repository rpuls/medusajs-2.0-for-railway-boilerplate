import type { MenubarProviderProps } from "../menubar/menubar-provider.tsx";
/**
 * Provides a menubar store to MenuBar components.
 * @deprecated
 * Use [`MenubarProvider`](https://ariakit.org/reference/menubar-provider)
 * instead.
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
export declare function MenuBarProvider(props?: MenuBarProviderProps): import("react/jsx-runtime").JSX.Element;
export interface MenuBarProviderProps extends MenubarProviderProps {
}
