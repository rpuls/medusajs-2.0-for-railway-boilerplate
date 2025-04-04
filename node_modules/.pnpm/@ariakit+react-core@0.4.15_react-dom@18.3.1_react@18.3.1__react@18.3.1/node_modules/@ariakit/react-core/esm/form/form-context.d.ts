import type { FormStore } from "./form-store.ts";
/**
 * Returns the form store from the nearest form container.
 * @example
 * function FormInput() {
 *   const store = useFormContext();
 *
 *   if (!store) {
 *     throw new Error("FormInput must be wrapped in FormProvider");
 *   }
 *
 *   // Use the store...
 * }
 */
export declare const useFormContext: () => FormStore<import("./form-store.ts").FormStoreValues> | undefined;
export declare const useFormScopedContext: (onlyScoped?: boolean) => FormStore<import("./form-store.ts").FormStoreValues> | undefined;
export declare const useFormProviderContext: () => FormStore<import("./form-store.ts").FormStoreValues> | undefined;
export declare const FormContextProvider: (props: import("react").ProviderProps<FormStore<import("./form-store.ts").FormStoreValues> | undefined>) => import("react/jsx-runtime").JSX.Element;
export declare const FormScopedContextProvider: (props: import("react").ProviderProps<FormStore<import("./form-store.ts").FormStoreValues> | undefined>) => import("react/jsx-runtime").JSX.Element;
