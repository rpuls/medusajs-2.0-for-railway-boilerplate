import type { ElementType } from "react";
import type { GroupLabelOptions } from "../group/group-label.tsx";
import type { Props } from "../utils/types.ts";
import type { FormStore } from "./form-store.ts";
declare const TagName = "div";
type TagName = typeof TagName;
/**
 * Returns props to create a `FormGroupLabel` component. This hook must be used
 * in a component that's wrapped with `FormGroup` so the `aria-labelledby` prop
 * is properly set on the form group element.
 * @see https://ariakit.org/components/form
 * @example
 * ```jsx
 * // This component must be wrapped with FormGroup
 * const props = useFormGroupLabel();
 * <Role {...props}>Label</Role>
 * ```
 */
export declare const useFormGroupLabel: import("../utils/types.ts").Hook<"div", FormGroupLabelOptions<"div">>;
/**
 * Renders a label in a form group. This component must be wrapped with the
 * [`FormGroup`](https://ariakit.org/reference/form-group) or
 * [`FormRadioGroup`](https://ariakit.org/reference/form-radio-group) components
 * so the `aria-labelledby` prop is properly set on the form group element.
 * @see https://ariakit.org/components/form
 * @example
 * ```jsx {10}
 * const form = useFormStore({
 *   defaultValues: {
 *     username: "",
 *     email: "",
 *   },
 * });
 *
 * <Form store={form}>
 *   <FormGroup>
 *     <FormGroupLabel>Account</FormGroupLabel>
 *     <FormLabel name={form.names.username}>Username</FormLabel>
 *     <FormInput name={form.names.username} />
 *     <FormLabel name={form.names.email}>Email</FormLabel>
 *     <FormInput name={form.names.email} />
 *   </FormGroup>
 * </Form>
 * ```
 */
export declare const FormGroupLabel: (props: FormGroupLabelProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export interface FormGroupLabelOptions<T extends ElementType = TagName> extends GroupLabelOptions<T> {
    /**
     * Object returned by the
     * [`useFormStore`](https://ariakit.org/reference/use-form-store) hook. If not
     * provided, the closest [`Form`](https://ariakit.org/reference/form) or
     * [`FormProvider`](https://ariakit.org/reference/form-provider) components'
     * context will be used.
     */
    store?: FormStore;
}
export type FormGroupLabelProps<T extends ElementType = TagName> = Props<T, FormGroupLabelOptions<T>>;
export {};
