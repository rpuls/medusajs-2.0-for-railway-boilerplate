import type { ElementType } from "react";
import type { GroupOptions } from "../group/group.tsx";
import type { Props } from "../utils/types.ts";
import type { FormStore } from "./form-store.ts";
declare const TagName = "div";
type TagName = typeof TagName;
/**
 * Returns props to create a `FormGroup` component.
 * @see https://ariakit.org/components/form
 * @example
 * ```jsx
 * const store = useFormStore();
 * const props = useFormGroup({ store });
 * <Form store={store}>
 *   <Role {...props}>
 *     <FormGroupLabel>Label</FormGroupLabel>
 *   </Role>
 * </Form>
 * ```
 */
export declare const useFormGroup: import("../utils/types.ts").Hook<"div", FormGroupOptions<"div">>;
/**
 * Renders a group element for form controls. The
 * [`FormGroupLabel`](https://ariakit.org/reference/form-group-label) component
 * can be used inside this component so the `aria-labelledby` prop is properly
 * set on the group element.
 * @see https://ariakit.org/components/form
 * @example
 * ```jsx {9-15}
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
export declare const FormGroup: (props: FormGroupProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export interface FormGroupOptions<T extends ElementType = TagName> extends GroupOptions<T> {
    /**
     * Object returned by the
     * [`useFormStore`](https://ariakit.org/reference/use-form-store) hook. If not
     * provided, the closest [`Form`](https://ariakit.org/reference/form) or
     * [`FormProvider`](https://ariakit.org/reference/form-provider) components'
     * context will be used.
     */
    store?: FormStore;
}
export type FormGroupProps<T extends ElementType = TagName> = Props<T, FormGroupOptions<T>>;
export {};
