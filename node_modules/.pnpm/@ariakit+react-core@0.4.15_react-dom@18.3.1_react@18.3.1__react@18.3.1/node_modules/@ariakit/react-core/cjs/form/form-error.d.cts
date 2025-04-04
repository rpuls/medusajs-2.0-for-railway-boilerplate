import type { StringLike } from "@ariakit/core/form/types";
import type { ElementType } from "react";
import type { CollectionItemOptions } from "../collection/collection-item.tsx";
import type { Props } from "../utils/types.ts";
import type { FormStore } from "./form-store.ts";
declare const TagName = "div";
type TagName = typeof TagName;
/**
 * Returns props to create a `FormDescription` component.
 * @see https://ariakit.org/components/form
 * @example
 * ```jsx
 * const store = useFormStore({ defaultValues: { email: "" } });
 * const props = useFormError({ store, name: store.names.email });
 *
 * store.useValidate(() => {
 *   if (!store.getValue(store.names.email)) {
 *     store.setError(store.names.email, "Email is required!");
 *   }
 * });
 *
 * <Form store={store}>
 *   <FormLabel name={store.names.email}>Email</FormLabel>
 *   <FormInput name={store.names.email} />
 *   <Role {...props} />
 * </Form>
 * ```
 */
export declare const useFormError: import("../utils/types.ts").Hook<"div", FormErrorOptions<"div">>;
/**
 * Renders an element that shows an error message. The `children` will
 * automatically display the error message defined in the store.
 * @see https://ariakit.org/components/form
 * @example
 * ```jsx {16}
 * const form = useFormStore({
 *   defaultValues: {
 *     email: "",
 *   },
 * });
 *
 * form.useValidate(() => {
 *   if (!form.values.email) {
 *     form.setError(form.names.email, "Email is required!");
 *   }
 * });
 *
 * <Form store={form}>
 *   <FormLabel name={form.names.email}>Email</FormLabel>
 *   <FormInput name={form.names.email} />
 *   <FormError name={form.names.email} />
 * </Form>
 * ```
 */
export declare const FormError: (props: FormErrorProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export interface FormErrorOptions<T extends ElementType = TagName> extends CollectionItemOptions<T> {
    /**
     * Object returned by the
     * [`useFormStore`](https://ariakit.org/reference/use-form-store) hook. If not
     * provided, the closest [`Form`](https://ariakit.org/reference/form) or
     * [`FormProvider`](https://ariakit.org/reference/form-provider) components'
     * context will be used.
     */
    store?: FormStore;
    /**
     * Name of the field associated with this error. This can either be a string
     * or a reference to a field name from the
     * [`names`](https://ariakit.org/reference/use-form-store#names) object in the
     * store, for type safety.
     * @example
     * ```jsx
     * <FormError name="password" />
     * ```
     */
    name: StringLike;
}
export type FormErrorProps<T extends ElementType = TagName> = Props<T, FormErrorOptions<T>>;
export {};
