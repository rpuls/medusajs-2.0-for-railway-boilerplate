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
 * const store = useFormStore({ defaultValues: { password: "" } });
 * const props = useFormDescription({ store, name: store.names.password });
 * <Form store={store}>
 *   <FormLabel name={store.names.password}>Password</FormLabel>
 *   <FormInput name={store.names.password} type="password" />
 *   <Role {...props}>Password with at least 8 characters.</Role>
 * </Form>
 * ```
 */
export declare const useFormDescription: import("../utils/types.ts").Hook<"div", FormDescriptionOptions<"div">>;
/**
 * Renders a description element for a form field, which will automatically
 * receive an `aria-describedby` attribute pointing to this element.
 * @see https://ariakit.org/components/form
 * @example
 * ```jsx {10-12}
 * const form = useFormStore({
 *   defaultValues: {
 *     password: "",
 *   },
 * });
 *
 * <Form store={form}>
 *   <FormLabel name={form.names.password}>Password</FormLabel>
 *   <FormInput name={form.names.password} type="password" />
 *   <FormDescription name={form.names.password}>
 *     Password with at least 8 characters.
 *   </FormDescription>
 * </Form>
 * ```
 */
export declare const FormDescription: (props: FormDescriptionProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export interface FormDescriptionOptions<T extends ElementType = TagName> extends CollectionItemOptions<T> {
    /**
     * Object returned by the
     * [`useFormStore`](https://ariakit.org/reference/use-form-store) hook. If not
     * provided, the closest [`Form`](https://ariakit.org/reference/form) or
     * [`FormProvider`](https://ariakit.org/reference/form-provider) components'
     * context will be used.
     */
    store?: FormStore;
    /**
     * Name of the field described by this element. This can either be a string or
     * a reference to a field name from the
     * [`names`](https://ariakit.org/reference/use-form-store#names) object in the
     * store, for type safety.
     * @example
     * ```jsx
     * <FormDescription name="password">
     *   Password with at least 8 characters.
     * </FormDescription>
     * ```
     */
    name: StringLike;
}
export type FormDescriptionProps<T extends ElementType = TagName> = Props<T, FormDescriptionOptions<T>>;
export {};
