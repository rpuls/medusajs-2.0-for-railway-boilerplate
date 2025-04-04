import type { StringLike } from "@ariakit/core/form/types";
import type { ElementType } from "react";
import type { ButtonOptions } from "../button/button.tsx";
import type { Props } from "../utils/types.ts";
import type { FormStore } from "./form-store.ts";
declare const TagName = "button";
type TagName = typeof TagName;
/**
 * Returns props to create a `FormRemove` component.
 * @see https://ariakit.org/components/form
 * @example
 * ```jsx
 * const store = useFormStore({
 *   defaultValues: {
 *     languages: ["JavaScript", "PHP"],
 *   },
 * });
 * const props = useFormRemove({
 *   store,
 *   name: store.names.languages,
 *   index: 0,
 * });
 * const values = useStoreState(store, "values");
 *
 * <Form store={store}>
 *   {values.languages.map((_, i) => (
 *     <FormInput key={i} name={store.names.languages[i]} />
 *   ))}
 *   <Role {...props}>Remove first language</Role>
 * </Form>
 * ```
 */
export declare const useFormRemove: import("../utils/types.ts").Hook<"button", FormRemoveOptions<"button">>;
/**
 * Renders a button that will remove an item from an array field in the form
 * when clicked.
 *
 * The [`name`](https://ariakit.org/reference/form-remove#name) prop must be
 * provided to identify the array field. Similarly, the
 * [`index`](https://ariakit.org/reference/form-remove#index) prop is required
 * to pinpoint the item to remove.
 *
 * By default, the button will automatically move focus to the next field in the
 * form when clicked, or to the previous field if there isn't a next field. This
 * behavior can be disabled by setting the
 * [`autoFocusOnClick`](https://ariakit.org/reference/form-remove#autofocusonclick)
 * prop to `false`.
 * @see https://ariakit.org/components/form
 * @example
 * ```jsx {13}
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
 *     <div key={i}>
 *       <FormInput name={form.names.languages[i]} />
 *       <FormRemove name={form.names.languages} index={i} />
 *     </div>
 *   ))}
 * </Form>
 * ```
 */
export declare const FormRemove: (props: FormRemoveProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export interface FormRemoveOptions<T extends ElementType = TagName> extends ButtonOptions<T> {
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
     * Index of the item to remove.
     */
    index: number;
    /**
     * Whether the focus should be moved to the next or previous field when the
     * button is clicked.
     * @default true
     */
    autoFocusOnClick?: boolean;
}
export type FormRemoveProps<T extends ElementType = TagName> = Props<T, FormRemoveOptions<T>>;
export {};
