import type { CollectionStoreFunctions, CollectionStoreItem, CollectionStoreOptions, CollectionStoreState } from "../collection/collection-store.ts";
import type { Store, StoreOptions, StoreProps } from "../utils/store.ts";
import type { AnyObject, PickRequired, SetState, SetStateAction } from "../utils/types.ts";
import type { DeepMap, DeepPartial, Names, StringLike } from "./types.ts";
type ErrorMessage = string | undefined | null;
export declare function hasMessages(object: FormStoreValues): boolean;
export declare function get<T>(values: FormStoreValues, path: StringLike | string[], defaultValue?: T): T;
/**
 * Creates a form store.
 */
export declare function createFormStore<T extends FormStoreValues = FormStoreValues>(props: PickRequired<FormStoreProps<T>, "values" | "defaultValues" | "errors" | "defaultErrors" | "touched" | "defaultTouched">): FormStore<T>;
export declare function createFormStore(props: FormStoreProps): FormStore;
export type FormStoreCallback<T extends FormStoreState = FormStoreState> = (state: T) => void | Promise<void>;
export type FormStoreValues = AnyObject;
export interface FormStoreItem extends CollectionStoreItem {
    type: "field" | "label" | "description" | "error" | "button";
    name: string;
}
export interface FormStoreState<T extends FormStoreValues = FormStoreValues> extends CollectionStoreState<FormStoreItem> {
    /**
     * Form values.
     *
     * Live examples:
     * - [FormRadio](https://ariakit.org/examples/form-radio)
     * - [FormSelect](https://ariakit.org/examples/form-select)
     * @default {}
     */
    values: T;
    /**
     * Form errors.
     */
    errors: DeepPartial<DeepMap<T, ErrorMessage>>;
    /**
     * The touched state of the form.
     */
    touched: DeepPartial<DeepMap<T, boolean>>;
    /**
     * Whether the form is valid.
     */
    valid: boolean;
    /**
     * Whether the form is validating.
     */
    validating: boolean;
    /**
     * Whether the form is submitting.
     */
    submitting: boolean;
    /**
     * The number of times
     * [`submit`](https://ariakit.org/reference/use-form-store#submit) has been
     * called with a successful response.
     */
    submitSucceed: number;
    /**
     * The number of times
     * [`submit`](https://ariakit.org/reference/use-form-store#submit) has been
     * called with an error response.
     */
    submitFailed: number;
}
export interface FormStoreFunctions<T extends FormStoreValues = FormStoreValues> extends CollectionStoreFunctions<FormStoreItem> {
    /**
     * An object containing the names of the form fields for type safety.
     *
     * Live examples:
     * - [FormRadio](https://ariakit.org/examples/form-radio)
     * - [FormSelect](https://ariakit.org/examples/form-select)
     * @example
     * store.names.name; // "name"
     * store.names.name.first; // "name.first"
     * store.names.name.last; // "name.last"
     */
    names: Names<T>;
    /**
     * Sets the [`values`](https://ariakit.org/reference/form-provider#values)
     * state.
     * @example
     * store.setValues({ name: "John" });
     * store.setValues((values) => ({ ...values, name: "John" }));
     */
    setValues: SetState<FormStoreState<T>["values"]>;
    /**
     * Retrieves a field value.
     *
     * Live examples:
     * - [FormRadio](https://ariakit.org/examples/form-radio)
     * @example
     * const nameValue = store.getValue("name");
     * // Can also use store.names for type-safety.
     * const emailValue = store.getValue(store.names.email);
     */
    getValue: <T = any>(name: StringLike) => T;
    /**
     * Sets a field value.
     *
     * Live examples:
     * - [FormSelect](https://ariakit.org/examples/form-select)
     * @example
     * store.setValue("name", "John");
     * store.setValue("name", (value) => value + " Doe");
     * // Can also use store.names for type-safety.
     * store.setValue(store.names.name, "John");
     */
    setValue: <T>(name: StringLike, value: SetStateAction<T>) => void;
    /**
     * Pushes a value to an array field.
     * @example
     * store.pushValue("tags", "new tag");
     * store.pushValue("tags", { id: 1, name: "new tag" });
     * // Can also use store.names for type-safety.
     * store.pushValue(store.names.tags, "new tag");
     */
    pushValue: <T>(name: StringLike, value: T) => void;
    /**
     * Removes a value from an array field.
     * @example
     * store.removeValue("tags", 0);
     * store.removeValue("tags", 1);
     * // Can also use store.names for type-safety.
     * store.removeValue(store.names.tags, 0);
     */
    removeValue: (name: StringLike, index: number) => void;
    /**
     * Sets the [`errors`](https://ariakit.org/reference/form-provider#errors)
     * state.
     * @example
     * store.setErrors({ name: "Name is required" });
     * store.setErrors((errors) => ({ ...errors, name: "Name is required" }));
     */
    setErrors: SetState<FormStoreState<T>["errors"]>;
    /**
     * Retrieves a field error.
     * @example
     * const nameError = store.getError("name");
     * // Can also use store.names for type-safety.
     * const emailError = store.getError(store.names.email);
     */
    getError: (name: StringLike) => ErrorMessage;
    /**
     * Sets a field error.
     *
     * Live examples:
     * - [FormRadio](https://ariakit.org/examples/form-radio)
     * @example
     * store.setError("name", "Name is required");
     * store.setError("name", (error) => error + "!");
     * // Can also use store.names for type-safety.
     * store.setError(store.names.name, "Name is required");
     */
    setError: (name: StringLike, error: SetStateAction<ErrorMessage>) => void;
    /**
     * Sets the [`touched`](https://ariakit.org/reference/form-provider#touched)
     * state.
     * @example
     * store.setTouched({ name: true });
     * store.setTouched((touched) => ({ ...touched, name: true }));
     */
    setTouched: SetState<FormStoreState<T>["touched"]>;
    /**
     * Retrieves a field touched state.
     * @example
     * const nameTouched = store.getFieldTouched("name");
     * // Can also use store.names for type-safety.
     * const emailTouched = store.getFieldTouched(store.names.email);
     */
    getFieldTouched: (name: StringLike) => boolean;
    /**
     * Sets a field touched state.
     * @example
     * store.setFieldTouched("name", true);
     * store.setFieldTouched("name", (value) => !value);
     * // Can also use store.names for type-safety.
     * store.setFieldTouched(store.names.name, true);
     */
    setFieldTouched: (name: StringLike, value: SetStateAction<boolean>) => void;
    /**
     * Function that accepts a callback that will be used to validate the form
     * when [`validate`](https://ariakit.org/reference/use-form-store#validate) is
     * called. It returns a cleanup function that will remove the callback.
     * @example
     * const cleanup = store.onValidate(async (state) => {
     *   const errors = await api.validate(state.values);
     *   if (errors) {
     *     store.setErrors(errors);
     *   }
     * });
     */
    onValidate: (callback: FormStoreCallback<FormStoreState<T>>) => () => void;
    /**
     * Function that accepts a callback that will be used to submit the form when
     * [`submit`](https://ariakit.org/reference/use-form-store#submit) is called.
     * It returns a cleanup function that will remove the callback.
     * @param callback The callback function.
     * @example
     * const cleanup = store.onSubmit(async (state) => {
     *   try {
     *     await api.submit(state.values);
     *   } catch (errors) {
     *     store.setErrors(errors);
     *   }
     * });
     */
    onSubmit: (callback: FormStoreCallback<FormStoreState<T>>) => () => void;
    /**
     * Validates the form.
     * @example
     * if (await store.validate()) {
     *  // Form is valid.
     * }
     */
    validate: () => Promise<boolean>;
    /**
     * Submits the form. This also triggers validation.
     * @example
     * if (await form.submit()) {
     *   // Form is submitted.
     * }
     */
    submit: () => Promise<boolean>;
    /**
     * Resets the form to its default values.
     */
    reset: () => void;
}
export interface FormStoreOptions<T extends FormStoreValues = FormStoreValues> extends CollectionStoreOptions<FormStoreItem>, StoreOptions<FormStoreState<T>, "values" | "errors" | "touched"> {
    /**
     * The default values of the form.
     * @default {}
     */
    defaultValues?: FormStoreState<T>["values"];
    /**
     * The default errors of the form.
     */
    defaultErrors?: FormStoreState<T>["errors"];
    /**
     * The default touched state of the form.
     */
    defaultTouched?: FormStoreState<T>["touched"];
}
export interface FormStoreProps<T extends FormStoreValues = FormStoreValues> extends FormStoreOptions<T>, StoreProps<FormStoreState<T>> {
}
export interface FormStore<T extends FormStoreValues = FormStoreValues> extends FormStoreFunctions<T>, Store<FormStoreState<T>> {
}
export {};
