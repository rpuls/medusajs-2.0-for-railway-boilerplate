import type { ElementType } from "react";
import type { FocusableOptions } from "../focusable/focusable.tsx";
import type { Props } from "../utils/types.ts";
import type { FormControlOptions } from "./form-control.tsx";
declare const TagName = "input";
type TagName = typeof TagName;
/**
 * Returns props to create a `FormInput` component. Unlike `useFormControl`, this
 * hook returns the `value` and `onChange` props that can be passed to a native
 * input, select or textarea elements.
 * @see https://ariakit.org/components/form
 * @example
 * ```jsx
 * const store = useFormStore({ defaultValues: { email: "" } });
 * const props = useFormInput({ store, name: store.names.email });
 * <Form store={store}>
 *   <FormLabel name={store.names.email}>Email</FormLabel>
 *   <Role {...props} render={<input />} />
 * </Form>
 * ```
 */
export declare const useFormInput: import("../utils/types.ts").Hook<"input", FormInputOptions<"input">>;
/**
 * Renders a form input. Unlike
 * [`FormControl`](https://ariakit.org/reference/form-control), this component
 * passes the `value` and `onChange` props down to the underlying element that
 * can be native input, select or textarea elements.
 * @see https://ariakit.org/components/form
 * @example
 * ```jsx {9}
 * const form = useFormStore({
 *   defaultValues: {
 *     email: "",
 *   },
 * });
 *
 * <Form store={form}>
 *   <FormLabel name={form.names.email}>Email</FormLabel>
 *   <FormInput name={form.names.email} />
 * </Form>
 * ```
 */
export declare const FormInput: (props: FormInputProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export interface FormInputOptions<T extends ElementType = TagName> extends FormControlOptions<T>, FocusableOptions<T> {
}
export type FormInputProps<T extends ElementType = TagName> = Props<T, FormInputOptions<T>>;
export {};
