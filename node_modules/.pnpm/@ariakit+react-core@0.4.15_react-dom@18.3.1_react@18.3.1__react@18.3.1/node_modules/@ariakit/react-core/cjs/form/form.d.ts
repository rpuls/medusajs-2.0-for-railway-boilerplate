import type { ElementType } from "react";
import type { Options, Props } from "../utils/types.ts";
import type { FormStore } from "./form-store.ts";
declare const TagName = "form";
type TagName = typeof TagName;
/**
 * Returns props to create a `Form` component.
 * @see https://ariakit.org/components/form
 * @example
 * ```jsx
 * const store = useFormStore();
 * const props = useForm({ store, render: <form /> });
 * <Role {...props} />
 * ```
 */
export declare const useForm: import("../utils/types.ts").Hook<"form", FormOptions<"form">>;
/**
 * Renders a form element and provides a [form
 * store](https://ariakit.org/reference/use-form-store) to its controls.
 *
 * The form is automatically validated on change and on blur. This behavior can
 * be disabled with the
 * [`validateOnChange`](https://ariakit.org/reference/form#validateonchange) and
 * [`validateOnBlur`](https://ariakit.org/reference/form#validateonblur) props.
 *
 * When the form is submitted with errors, the first invalid field is
 * automatically focused thanks to the
 * [`autoFocusOnSubmit`](https://ariakit.org/reference/form#autofocusonsubmit)
 * prop. If it's successful, the
 * [`resetOnSubmit`](https://ariakit.org/reference/form#resetonsubmit) prop
 * ensures the form is reset to its initial values as defined by the
 * [`defaultValues`](https://ariakit.org/reference/use-form-store#defaultvalues)
 * option on the [store](https://ariakit.org/reference/use-form-store).
 * @see https://ariakit.org/components/form
 * @example
 * ```jsx {5-8}
 * const form = useFormStore({
 *   defaultValues: { username: "johndoe" },
 * });
 *
 * <Form store={form}>
 *   <FormLabel name={form.names.username}>Username</FormLabel>
 *   <FormInput name={form.names.username} />
 * </Form>
 * ```
 */
export declare const Form: (props: FormProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export interface FormOptions<_T extends ElementType = TagName> extends Options {
    /**
     * Object returned by the
     * [`useFormStore`](https://ariakit.org/reference/use-form-store) hook. If not
     * provided, the closest
     * [`FormProvider`](https://ariakit.org/reference/form-provider) component's
     * context will be used.
     */
    store?: FormStore;
    /**
     * Determines if the form should invoke the validation callbacks registered
     * with
     * [`useValidate`](https://ariakit.org/reference/use-form-store#usevalidate)
     * when the [`values`](https://ariakit.org/reference/use-form-store#values)
     * change.
     * @default true
     */
    validateOnChange?: boolean;
    /**
     * Determines if the form should invoke the validation callbacks registered
     * with
     * [`useValidate`](https://ariakit.org/reference/use-form-store#usevalidate)
     * when a field loses focus.
     * @default true
     */
    validateOnBlur?: boolean;
    /**
     * Determines if the form state should reset to its
     * [`defaultValues`](https://ariakit.org/reference/use-form-store#defaultvalues)
     * when the [`Form`](https://ariakit.org/reference/form) component is
     * unmounted.
     * @default false
     */
    resetOnUnmount?: boolean;
    /**
     * Determines if the form state should be reset to its
     * [`defaultValues`](https://ariakit.org/reference/use-form-store#defaultvalues)
     * upon successful form submission.
     * @default true
     */
    resetOnSubmit?: boolean;
    /**
     * Determines if the form should automatically focus on the first invalid
     * field when the form is submitted.
     * @default true
     */
    autoFocusOnSubmit?: boolean;
}
export type FormProps<T extends ElementType = TagName> = Props<T, FormOptions<T>>;
export {};
