import type { HovercardStore } from "./hovercard-store.ts";
/**
 * Returns the hovercard store from the nearest hovercard container.
 * @example
 * function Hovercard() {
 *   const store = useHovercardContext();
 *
 *   if (!store) {
 *     throw new Error("Hovercard must be wrapped in HovercardProvider");
 *   }
 *
 *   // Use the store...
 * }
 */
export declare const useHovercardContext: () => HovercardStore | undefined;
export declare const useHovercardScopedContext: (onlyScoped?: boolean) => HovercardStore | undefined;
export declare const useHovercardProviderContext: () => HovercardStore | undefined;
export declare const HovercardContextProvider: (props: import("react").ProviderProps<HovercardStore | undefined>) => import("react/jsx-runtime").JSX.Element;
export declare const HovercardScopedContextProvider: (props: import("react").ProviderProps<HovercardStore | undefined>) => import("react/jsx-runtime").JSX.Element;
