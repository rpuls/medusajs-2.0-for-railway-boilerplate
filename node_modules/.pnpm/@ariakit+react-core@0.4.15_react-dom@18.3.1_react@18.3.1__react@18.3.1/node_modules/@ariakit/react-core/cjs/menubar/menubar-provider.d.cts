import type { ReactNode } from "react";
import type { MenubarStoreProps } from "./menubar-store.ts";
/**
 * Provides a menubar store to [Menubar](https://ariakit.org/components/menubar)
 * components.
 * @see https://ariakit.org/components/menubar
 * @example
 * ```jsx
 * <MenubarProvider>
 *   <Menubar>
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
 *   </Menubar>
 * </MenubarProvider>
 * ```
 */
export declare function MenubarProvider(props?: MenubarProviderProps): import("react/jsx-runtime").JSX.Element;
export interface MenubarProviderProps extends MenubarStoreProps {
    children?: ReactNode;
}
