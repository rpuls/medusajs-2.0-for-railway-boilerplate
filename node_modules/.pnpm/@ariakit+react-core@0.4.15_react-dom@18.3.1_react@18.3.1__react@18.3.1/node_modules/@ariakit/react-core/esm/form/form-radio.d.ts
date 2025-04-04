import type { ElementType } from "react";
import type { RadioOptions } from "../radio/radio.tsx";
import type { Props } from "../utils/types.ts";
import type { FormControlOptions } from "./form-control.tsx";
declare const TagName = "input";
type TagName = typeof TagName;
/**
 * Returns props to create a `FormRadio` component.
 * @see https://ariakit.org/components/form
 * @example
 * ```jsx
 * const store = useFormStore({ defaultValues: { char: "a" } });
 * const a = useFormRadio({ store, name: store.names.char, value: "a" });
 * const b = useFormRadio({ store, name: store.names.char, value: "b" });
 * const c = useFormRadio({ store, name: store.names.char, value: "c" });
 * <Form store={store}>
 *   <FormRadioGroup>
 *     <FormGroupLabel>Favorite character</FormGroupLabel>
 *     <Role {...a} />
 *     <Role {...b} />
 *     <Role {...c} />
 *   </FormRadioGroup>
 * </Form>
 * ```
 */
export declare const useFormRadio: import("../utils/types.ts").Hook<"input", FormRadioOptions<"input">>;
/**
 * Renders a radio button as a form control. This component must be wrapped in a
 * [`FormRadioGroup`](https://ariakit.org/reference/form-radio-group) along with
 * other radio buttons sharing the same
 * [`name`](https://ariakit.org/reference/form-radio#name).
 * @see https://ariakit.org/components/form
 * @example
 * ```jsx {10-12}
 * const form = useFormStore({
 *   defaultValues: {
 *     char: "a",
 *   },
 * });
 *
 * <Form store={form}>
 *   <FormRadioGroup>
 *     <FormGroupLabel>Favorite character</FormGroupLabel>
 *     <FormRadio name={form.names.char} value="a" />
 *     <FormRadio name={form.names.char} value="b" />
 *     <FormRadio name={form.names.char} value="c" />
 *   </FormRadioGroup>
 * </Form>
 * ```
 */
export declare const FormRadio: (props: FormRadioProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export interface FormRadioOptions<T extends ElementType = TagName> extends FormControlOptions<T>, Omit<RadioOptions<T>, "store" | "name"> {
}
export type FormRadioProps<T extends ElementType = TagName> = Props<T, FormRadioOptions<T>>;
export {};
