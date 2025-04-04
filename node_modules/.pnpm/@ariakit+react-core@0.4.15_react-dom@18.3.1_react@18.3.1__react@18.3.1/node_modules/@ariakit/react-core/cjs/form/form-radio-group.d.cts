import type { ElementType } from "react";
import type { Props } from "../utils/types.ts";
import type { FormGroupOptions } from "./form-group.tsx";
declare const TagName = "div";
type TagName = typeof TagName;
/**
 * Returns props to create a `FormRadioGroup` component.
 * @see https://ariakit.org/components/form
 * @example
 * ```jsx
 * const store = useFormStore({ defaultValues: { color: "red" } });
 * const props = useFormRadioGroup({ store });
 * <Form store={store}>
 *   <Role {...props}>
 *     <FormGroupLabel>Favorite color</FormGroupLabel>
 *     <FormRadio name={store.names.color} value="red" />
 *     <FormRadio name={store.names.color} value="blue" />
 *     <FormRadio name={store.names.color} value="green" />
 *   </Role>
 * </Form>
 * ```
 */
export declare const useFormRadioGroup: import("../utils/types.ts").Hook<"div", FormRadioGroupOptions<"div">>;
/**
 * Renders a group element for
 * [`FormRadio`](https://ariakit.org/reference/form-radio) elements. The
 * [`FormGroupLabel`](https://ariakit.org/reference/form-group-label) component
 * can be used inside this component so the `aria-labelledby` prop is properly
 * set on the group element.
 * @see https://ariakit.org/components/form
 * @example
 * ```jsx {8-13}
 * const form = useFormStore({
 *   defaultValues: {
 *     color: "red",
 *   },
 * });
 *
 * <Form store={form}>
 *   <FormRadioGroup>
 *     <FormGroupLabel>Favorite color</FormGroupLabel>
 *     <FormRadio name={form.names.color} value="red" />
 *     <FormRadio name={form.names.color} value="blue" />
 *     <FormRadio name={form.names.color} value="green" />
 *   </FormRadioGroup>
 * </Form>
 * ```
 */
export declare const FormRadioGroup: (props: FormRadioGroupProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export type FormRadioGroupOptions<T extends ElementType = TagName> = FormGroupOptions<T>;
export type FormRadioGroupProps<T extends ElementType = TagName> = Props<T, FormRadioGroupOptions<T>>;
export {};
