import type { StringLike } from "@ariakit/core/form/types";
import type { BooleanOrCallback } from "@ariakit/core/utils/types";
import type { ElementType, FocusEvent } from "react";
import type { CollectionItemOptions } from "../collection/collection-item.tsx";
import type { Props } from "../utils/types.ts";
import type { FormStore } from "./form-store.ts";
declare const TagName = "input";
type TagName = typeof TagName;
/**
 * Returns props to create a `FormControl` component. Unlike `useFormInput`,
 * this hook doesn't automatically returns the `value` and `onChange` props.
 * This is so we can use it not only for native form elements but also for
 * custom components whose value is not controlled by the native `value` and
 * `onChange` props.
 * @see https://ariakit.org/components/form
 * @example
 * ```jsx
 * const store = useFormStore({ defaultValues: { content: "" } });
 * const props = useFormControl({ store, name: store.names.content });
 * const value = store.useValue(store.names.content);
 *
 * <Form store={store}>
 *   <FormLabel name={store.names.content}>Content</FormLabel>
 *   <Role
 *     {...props}
 *     value={value}
 *     onChange={(value) => store.setValue(store.names.content, value)}
 *     render={<Editor />}
 *   />
 * </Form>
 * ```
 */
export declare const useFormControl: import("../utils/types.ts").Hook<"input", FormControlOptions<"input">>;
/**
 * Abstract component that renders a form control. Unlike
 * [`FormInput`](https://ariakit.org/reference/form-input), this component
 * doesn't automatically pass the `value` and `onChange` props down to the
 * underlying element. This is so we can use it not only for native form
 * elements but also for custom components whose value is not controlled by the
 * native `value` and `onChange` props.
 * @see https://ariakit.org/components/form
 * @example
 * ```jsx {11-19}
 * const form = useFormStore({
 *   defaultValues: {
 *     content: "",
 *   },
 * });
 *
 * const value = form.useValue(form.names.content);
 *
 * <Form store={form}>
 *   <FormLabel name={form.names.content}>Content</FormLabel>
 *   <FormControl
 *     name={form.names.content}
 *     render={
 *       <Editor
 *         value={value}
 *         onChange={(value) => form.setValue(form.names.content, value)}
 *       />
 *     }
 *   />
 * </Form>
 * ```
 */
export declare const FormControl: (props: FormControlProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export interface FormControlOptions<T extends ElementType = TagName> extends CollectionItemOptions<T> {
    /**
     * Object returned by the
     * [`useFormStore`](https://ariakit.org/reference/use-form-store) hook. If not
     * provided, the closest [`Form`](https://ariakit.org/reference/form) or
     * [`FormProvider`](https://ariakit.org/reference/form-provider) components'
     * context will be used.
     */
    store?: FormStore;
    /**
     * Field name. This can either be a string corresponding to an existing
     * property name in the
     * [`values`](https://ariakit.org/reference/use-form-store#values) state of
     * the store, or a reference to a field name from the
     * [`names`](https://ariakit.org/reference/use-form-store#names) object in the
     * store, ensuring type safety.
     *
     * Live examples:
     * - [FormRadio](https://ariakit.org/examples/form-radio)
     * - [Form with Select](https://ariakit.org/examples/form-select)
     */
    name: StringLike;
    /**
     * Whether the field should be marked touched on blur.
     * @default true
     */
    touchOnBlur?: BooleanOrCallback<FocusEvent>;
}
export type FormControlProps<T extends ElementType = TagName> = Props<T, FormControlOptions<T>>;
export {};
