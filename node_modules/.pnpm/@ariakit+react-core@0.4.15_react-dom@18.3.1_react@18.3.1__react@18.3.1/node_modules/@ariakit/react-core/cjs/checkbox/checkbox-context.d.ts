import type { CheckboxStore } from "./checkbox-store.ts";
/**
 * Returns the checkbox store from the nearest checkbox container.
 * @example
 * function Checkbox() {
 *   const store = useCheckboxContext();
 *
 *   if (!store) {
 *     throw new Error("Checkbox must be wrapped in CheckboxProvider");
 *   }
 *
 *   // Use the store...
 * }
 */
export declare const useCheckboxContext: () => CheckboxStore<import("@ariakit/core/checkbox/checkbox-store").CheckboxStoreValue> | undefined;
export declare const useCheckboxScopedContext: (onlyScoped?: boolean) => CheckboxStore<import("@ariakit/core/checkbox/checkbox-store").CheckboxStoreValue> | undefined;
export declare const useCheckboxProviderContext: () => CheckboxStore<import("@ariakit/core/checkbox/checkbox-store").CheckboxStoreValue> | undefined;
export declare const CheckboxContextProvider: (props: import("react").ProviderProps<CheckboxStore<import("@ariakit/core/checkbox/checkbox-store").CheckboxStoreValue> | undefined>) => import("react/jsx-runtime").JSX.Element;
export declare const CheckboxScopedContextProvider: (props: import("react").ProviderProps<CheckboxStore<import("@ariakit/core/checkbox/checkbox-store").CheckboxStoreValue> | undefined>) => import("react/jsx-runtime").JSX.Element;
