import type { DisclosureStore } from "./disclosure-store.ts";
/**
 * Returns the disclosure store from the nearest disclosure container.
 * @example
 * function Disclosure() {
 *   const store = useDisclosureContext();
 *
 *   if (!store) {
 *     throw new Error("Disclosure must be wrapped in DisclosureProvider");
 *   }
 *
 *   // Use the store...
 * }
 */
export declare const useDisclosureContext: () => DisclosureStore | undefined;
export declare const useDisclosureScopedContext: (onlyScoped?: boolean) => DisclosureStore | undefined;
export declare const useDisclosureProviderContext: () => DisclosureStore | undefined;
export declare const DisclosureContextProvider: (props: import("react").ProviderProps<DisclosureStore | undefined>) => import("react/jsx-runtime").JSX.Element;
export declare const DisclosureScopedContextProvider: (props: import("react").ProviderProps<DisclosureStore | undefined>) => import("react/jsx-runtime").JSX.Element;
