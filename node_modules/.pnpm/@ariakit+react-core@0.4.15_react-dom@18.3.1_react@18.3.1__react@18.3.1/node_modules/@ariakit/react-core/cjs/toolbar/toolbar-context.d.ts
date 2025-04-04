import type { ToolbarStore } from "./toolbar-store.ts";
/**
 * Returns the toolbar store from the nearest toolbar container.
 * @example
 * function ToolbarItem() {
 *   const store = useToolbarContext();
 *
 *   if (!store) {
 *     throw new Error("ToolbarItem must be wrapped in ToolbarProvider");
 *   }
 *
 *   // Use the store...
 * }
 */
export declare const useToolbarContext: () => ToolbarStore | undefined;
export declare const useToolbarScopedContext: (onlyScoped?: boolean) => ToolbarStore | undefined;
export declare const useToolbarProviderContext: () => ToolbarStore | undefined;
export declare const ToolbarContextProvider: (props: import("react").ProviderProps<ToolbarStore | undefined>) => import("react/jsx-runtime").JSX.Element;
export declare const ToolbarScopedContextProvider: (props: import("react").ProviderProps<ToolbarStore | undefined>) => import("react/jsx-runtime").JSX.Element;
