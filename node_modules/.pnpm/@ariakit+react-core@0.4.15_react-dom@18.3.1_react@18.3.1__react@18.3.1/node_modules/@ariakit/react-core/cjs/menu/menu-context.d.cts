import type { MenuStore } from "./menu-store.ts";
/**
 * Returns the menu store from the nearest menu container.
 * @example
 * function Menu() {
 *   const store = useMenuContext();
 *
 *   if (!store) {
 *     throw new Error("Menu must be wrapped in MenuProvider");
 *   }
 *
 *   // Use the store...
 * }
 */
export declare const useMenuContext: () => MenuStore<import("@ariakit/core/menu/menu-store").MenuStoreValues> | undefined;
export declare const useMenuScopedContext: (onlyScoped?: boolean) => MenuStore<import("@ariakit/core/menu/menu-store").MenuStoreValues> | undefined;
export declare const useMenuProviderContext: () => MenuStore<import("@ariakit/core/menu/menu-store").MenuStoreValues> | undefined;
export declare const MenuContextProvider: (props: import("react").ProviderProps<MenuStore<import("@ariakit/core/menu/menu-store").MenuStoreValues> | undefined>) => import("react/jsx-runtime").JSX.Element;
export declare const MenuScopedContextProvider: (props: import("react").ProviderProps<MenuStore<import("@ariakit/core/menu/menu-store").MenuStoreValues> | undefined>) => import("react/jsx-runtime").JSX.Element;
/**
 * Returns the menuBar store from the nearest menuBar container.
 * @deprecated
 * Use [`useMenubarContext`](https://ariakit.org/reference/use-menubar-context)
 * instead.
 * @example
 * function MenuBar() {
 *   const store = useMenuBarContext();
 *
 *   if (!store) {
 *     throw new Error("MenuBar must be wrapped in MenuBarProvider");
 *   }
 *
 *   // Use the store...
 * }
 */
export declare const useMenuBarContext: () => import("../menubar/menubar-store.ts").MenubarStore | undefined;
export declare const useMenuBarScopedContext: (onlyScoped?: boolean) => import("../menubar/menubar-store.ts").MenubarStore | undefined;
export declare const useMenuBarProviderContext: () => import("../menubar/menubar-store.ts").MenubarStore | undefined;
export declare const MenuBarContextProvider: (props: import("react").ProviderProps<import("../menubar/menubar-store.ts").MenubarStore | undefined>) => import("react/jsx-runtime").JSX.Element;
export declare const MenuBarScopedContextProvider: (props: import("react").ProviderProps<import("../menubar/menubar-store.ts").MenubarStore | undefined>) => import("react/jsx-runtime").JSX.Element;
export declare const MenuItemCheckedContext: import("react").Context<boolean | undefined>;
