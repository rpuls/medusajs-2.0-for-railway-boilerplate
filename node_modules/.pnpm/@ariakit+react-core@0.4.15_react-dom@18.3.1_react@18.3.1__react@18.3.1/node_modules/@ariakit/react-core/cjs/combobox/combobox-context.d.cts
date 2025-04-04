import type { ComboboxStore } from "./combobox-store.ts";
export declare const ComboboxListRoleContext: import("react").Context<string | undefined>;
/**
 * Returns the combobox store from the nearest combobox container.
 * @example
 * function Combobox() {
 *   const store = useComboboxContext();
 *
 *   if (!store) {
 *     throw new Error("Combobox must be wrapped in ComboboxProvider");
 *   }
 *
 *   // Use the store...
 * }
 */
export declare const useComboboxContext: () => ComboboxStore<import("@ariakit/core/combobox/combobox-store").ComboboxStoreSelectedValue> | undefined;
export declare const useComboboxScopedContext: (onlyScoped?: boolean) => ComboboxStore<import("@ariakit/core/combobox/combobox-store").ComboboxStoreSelectedValue> | undefined;
export declare const useComboboxProviderContext: () => ComboboxStore<import("@ariakit/core/combobox/combobox-store").ComboboxStoreSelectedValue> | undefined;
export declare const ComboboxContextProvider: (props: import("react").ProviderProps<ComboboxStore<import("@ariakit/core/combobox/combobox-store").ComboboxStoreSelectedValue> | undefined>) => import("react/jsx-runtime").JSX.Element;
export declare const ComboboxScopedContextProvider: (props: import("react").ProviderProps<ComboboxStore<import("@ariakit/core/combobox/combobox-store").ComboboxStoreSelectedValue> | undefined>) => import("react/jsx-runtime").JSX.Element;
export declare const ComboboxItemValueContext: import("react").Context<string | undefined>;
export declare const ComboboxItemCheckedContext: import("react").Context<boolean>;
