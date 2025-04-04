import type { Dispatch, SetStateAction } from "react";
import type { SelectStore } from "./select-store.ts";
/**
 * Returns the select store from the nearest select container.
 * @example
 * function Select() {
 *   const store = useSelectContext();
 *
 *   if (!store) {
 *     throw new Error("Select must be wrapped in SelectProvider");
 *   }
 *
 *   // Use the store...
 * }
 */
export declare const useSelectContext: () => SelectStore<import("@ariakit/core/select/select-store").SelectStoreValue> | undefined;
export declare const useSelectScopedContext: (onlyScoped?: boolean) => SelectStore<import("@ariakit/core/select/select-store").SelectStoreValue> | undefined;
export declare const useSelectProviderContext: () => SelectStore<import("@ariakit/core/select/select-store").SelectStoreValue> | undefined;
export declare const SelectContextProvider: (props: import("react").ProviderProps<SelectStore<import("@ariakit/core/select/select-store").SelectStoreValue> | undefined>) => import("react/jsx-runtime").JSX.Element;
export declare const SelectScopedContextProvider: (props: import("react").ProviderProps<SelectStore<import("@ariakit/core/select/select-store").SelectStoreValue> | undefined>) => import("react/jsx-runtime").JSX.Element;
export declare const SelectItemCheckedContext: import("react").Context<boolean>;
export declare const SelectHeadingContext: import("react").Context<[string | undefined, Dispatch<SetStateAction<string | undefined>>] | null>;
