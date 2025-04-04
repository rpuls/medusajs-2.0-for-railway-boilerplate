import type { StringLike } from "@ariakit/core/form/types";
import type { ElementType } from "react";
import type { CollectionItemOptions } from "../collection/collection-item.tsx";
import type { Props } from "../utils/types.ts";
import type { FormStore } from "./form-store.ts";
declare const TagName = "label";
type TagName = typeof TagName;
/**
 * Returns props to create a `FormLabel` component. If the field is not a native
 * input, select or textarea element, the hook will return props to render a
 * `span` element. Instead of relying on the `htmlFor` prop, it'll rely on the
 * `aria-labelledby` attribute on the form field. Clicking on the label will
 * move focus to the field even if it's not a native input.
 * @see https://ariakit.org/components/form
 * @example
 * ```jsx
 * const store = useFormStore({ defaultValues: { email: "" } });
 * const props = useFormLabel({ store, name: store.names.email });
 * <Form store={store}>
 *   <Role {...props}>Email</Role>
 *   <FormInput name={store.names.email} />
 * </Form>
 * ```
 */
export declare const useFormLabel: import("../utils/types.ts").Hook<"label", FormLabelOptions<"label">>;
/**
 * Renders a label associated with a form field, even if the field is not a
 * native input.
 *
 * If the field is a native input, select or textarea element, this component
 * will render a native `label` element and rely on its `htmlFor` prop.
 * Otherwise, it'll render a `span` element and rely on the `aria-labelledby`
 * attribute on the form field instead. Clicking on the label will move focus to
 * the field even if it's not a native input.
 * @see https://ariakit.org/components/form
 * @example
 * ```jsx {8}
 * const form = useFormStore({
 *   defaultValues: {
 *     email: "",
 *   },
 * });
 *
 * <Form store={form}>
 *   <FormLabel name={form.names.email}>Email</Role>
 *   <FormInput name={form.names.email} />
 * </Form>
 * ```
 */
export declare const FormLabel: (props: FormLabelProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export interface FormLabelOptions<T extends ElementType = TagName> extends CollectionItemOptions<T> {
    /**
     * Object returned by the
     * [`useFormStore`](https://ariakit.org/reference/use-form-store) hook. If not
     * provided, the closest [`Form`](https://ariakit.org/reference/form) or
     * [`FormProvider`](https://ariakit.org/reference/form-provider) components'
     * context will be used.
     */
    store?: FormStore;
    /**
     * Name of the field labeled by this element. This can either be a string or a
     * reference to a field name from the
     * [`names`](https://ariakit.org/reference/use-form-store#names) object in the
     * store, for type safety.
     * @example
     * ```jsx
     * <FormLabel name="email">Email</FormLabel>
     * ```
     */
    name: StringLike;
}
export type FormLabelProps<T extends ElementType = TagName> = Props<T, FormLabelOptions<T>>;
export {};
