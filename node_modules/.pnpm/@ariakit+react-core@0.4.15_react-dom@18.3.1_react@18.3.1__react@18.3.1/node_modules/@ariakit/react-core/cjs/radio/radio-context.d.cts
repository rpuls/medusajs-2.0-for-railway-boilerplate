import type { RadioStore } from "./radio-store.ts";
/**
 * Returns the radio store from the nearest radio container.
 * @example
 * function Radio() {
 *   const store = useRadioContext();
 *
 *   if (!store) {
 *     throw new Error("Radio must be wrapped in RadioProvider");
 *   }
 *
 *   // Use the store...
 * }
 */
export declare const useRadioContext: () => RadioStore | undefined;
export declare const useRadioScopedContext: (onlyScoped?: boolean) => RadioStore | undefined;
export declare const useRadioProviderContext: () => RadioStore | undefined;
export declare const RadioContextProvider: (props: import("react").ProviderProps<RadioStore | undefined>) => import("react/jsx-runtime").JSX.Element;
export declare const RadioScopedContextProvider: (props: import("react").ProviderProps<RadioStore | undefined>) => import("react/jsx-runtime").JSX.Element;
