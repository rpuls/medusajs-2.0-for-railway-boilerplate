import type { PopoverStore } from "./popover-store.ts";
/**
 * Returns the popover store from the nearest popover container.
 * @example
 * function Popover() {
 *   const store = usePopoverContext();
 *
 *   if (!store) {
 *     throw new Error("Popover must be wrapped in PopoverProvider");
 *   }
 *
 *   // Use the store...
 * }
 */
export declare const usePopoverContext: () => PopoverStore | undefined;
export declare const usePopoverScopedContext: (onlyScoped?: boolean) => PopoverStore | undefined;
export declare const usePopoverProviderContext: () => PopoverStore | undefined;
export declare const PopoverContextProvider: (props: import("react").ProviderProps<PopoverStore | undefined>) => import("react/jsx-runtime").JSX.Element;
export declare const PopoverScopedContextProvider: (props: import("react").ProviderProps<PopoverStore | undefined>) => import("react/jsx-runtime").JSX.Element;
