import type { StringLike } from "@ariakit/core/form/types";
import type { ElementType } from "react";
import type { ButtonOptions } from "../button/button.tsx";
import type { CollectionItemOptions } from "../collection/collection-item.tsx";
import type { Props } from "../utils/types.ts";
import type { FormStore } from "./form-store.ts";
declare const TagName = "button";
type TagName = typeof TagName;
/**
 * Returns props to create a `FormPush` component.
 * @see https://ariakit.org/components/form
 * @example
 * ```jsx
 * const store = useFormStore({
 *   defaultValues: {
 *     languages: ["JavaScript", "PHP"],
 *   },
 * });
 * const props = useFormPush({
 *   store,
 *   name: store.names.languages,
 *   value: "",
 * });
 * const values = useStoreState(store, "values");
 *
 * <Form store={store}>
 *   {values.languages.map((_, i) => (
 *     <FormInput key={i} name={store.names.languages[i]} />
 *   ))}
 *   <Role {...props}>Add new language</Role>
 * </Form>
 * ```
 */
export declare const useFormPush: import("../utils/types.ts").Hook<"button", FormPushOptions<"button">>;
/**
 * Renders a button that will push items to an array value in the form store
 * when clicked.
 *
 * The [`name`](https://ariakit.org/reference/form-push#name) prop needs to be
 * provided to identify the array field. The
 * [`value`](https://ariakit.org/reference/form-push#value) prop is required to
 * define the value that will be added to the array.
 *
 * By default, the newly added input will be automatically focused when the
 * button is clicked unless the
 * [`autoFocusOnClick`](https://ariakit.org/reference/form-push#autofocusonclick)
 * prop is set to `false`.
 * @see https://ariakit.org/components/form
 * @example
 * ```jsx {13-15}
 * const form = useFormStore({
 *   defaultValues: {
 *     languages: ["JavaScript", "PHP"],
 *   },
 * });
 *
 * const values = useStoreState(form, "values");
 *
 * <Form store={form}>
 *   {values.languages.map((_, i) => (
 *     <FormInput key={i} name={form.names.languages[i]} />
 *   ))}
 *   <FormPush name={form.names.languages} value="">
 *     Add new language
 *   </FormPush>
 * </Form>
 * ```
 */
export declare const FormPush: (props: FormPushProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export interface FormPushOptions<T extends ElementType = TagName> extends ButtonOptions<T>, CollectionItemOptions<T> {
    /**
     * Object returned by the
     * [`useFormStore`](https://ariakit.org/reference/use-form-store) hook. If not
     * provided, the closest [`Form`](https://ariakit.org/reference/form) or
     * [`FormProvider`](https://ariakit.org/reference/form-provider) components'
     * context will be used.
     */
    store?: FormStore;
    /**
     * Name of the array field. This can either be a string or a reference to a
     * field name from the
     * [`names`](https://ariakit.org/reference/use-form-store#names) object in the
     * store, for type safety.
     */
    name: StringLike;
    /**
     * Value that will initially be assigned to the array item when it's pushed.
     */
    value: unknown;
    /**
     * Whether the newly added input should be automatically focused when the
     * button is clicked.
     * @default true
     */
    autoFocusOnClick?: boolean;
}
export type FormPushProps<T extends ElementType = TagName> = Props<T, FormPushOptions<T>>;
export {};
