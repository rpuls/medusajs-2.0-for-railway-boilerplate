import type { ElementType } from "react";
import type { CheckboxOptions } from "../checkbox/checkbox.tsx";
import type { Props } from "../utils/types.ts";
import type { FormControlOptions } from "./form-control.tsx";
declare const TagName = "input";
type TagName = typeof TagName;
/**
 * Returns props to create a `FormCheckbox` component.
 * @see https://ariakit.org/components/form
 * @example
 * ```jsx
 * const store = useFormStore({ defaultValues: { acceptTerms: false } });
 * const props = useFormCheckbox({ store, name: store.names.acceptTerms });
 * <Form store={store}>
 *   <label>
 *     <Role {...props} />
 *     Accept terms
 *   </label>
 * </Form>
 * ```
 */
export declare const useFormCheckbox: import("../utils/types.ts").Hook<"input", FormCheckboxOptions<"input">>;
/**
 * Renders a checkbox input as a form control, representing a boolean, string,
 * number, or array value.
 * @see https://ariakit.org/components/form
 * @example
 * ```jsx {9}
 * const form = useFormStore({
 *   defaultValues: {
 *     acceptTerms: false,
 *   },
 * });
 *
 * <Form store={form}>
 *   <label>
 *     <FormCheckbox name={form.names.acceptTerms} />
 *     Accept terms
 *   </label>
 * </Form>
 * ```
 */
export declare const FormCheckbox: (props: FormCheckboxProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export interface FormCheckboxOptions<T extends ElementType = TagName> extends FormControlOptions<T>, Omit<CheckboxOptions<T>, "store" | "name"> {
}
export type FormCheckboxProps<T extends ElementType = TagName> = Props<T, FormCheckboxOptions<T>>;
export {};
