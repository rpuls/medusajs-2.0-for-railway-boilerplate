import type { MenubarStore } from "./menubar-store.ts";
/**
 * Returns the menubar store from the nearest menubar container.
 * @example
 * function Menubar() {
 *   const store = useMenubarContext();
 *
 *   if (!store) {
 *     throw new Error("Menubar must be wrapped in MenubarProvider");
 *   }
 *
 *   // Use the store...
 * }
 */
export declare const useMenubarContext: () => MenubarStore | undefined;
export declare const useMenubarScopedContext: (onlyScoped?: boolean) => MenubarStore | undefined;
export declare const useMenubarProviderContext: () => MenubarStore | undefined;
export declare const MenubarContextProvider: (props: import("react").ProviderProps<MenubarStore | undefined>) => import("react/jsx-runtime").JSX.Element;
export declare const MenubarScopedContextProvider: (props: import("react").ProviderProps<MenubarStore | undefined>) => import("react/jsx-runtime").JSX.Element;
export declare const MenuItemCheckedContext: import("react").Context<boolean | undefined>;
